// Palestine Weather — web server. Serves the front end from ../public and a small JSON
// API that fetches, normalises and caches the upstream data sources.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Cache } from './cache.js';
import { AlertStore, startAlertJob } from './alerts.js';
import { CITIES, REGIONS, cityById } from './cities.js';
import * as S from './sources.js';
import { demoFetch } from './demo.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, '..', 'public');
const DATA = process.env.DATA_DIR ?? path.join(ROOT, '..', 'data');
const PORT = Number(process.env.PORT ?? 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/**
 * A known city (?city=id) or any point in Palestine (?lat=&lon=). Free points are
 * rounded to ~100 m so nearby visitors share cache entries.
 */
function requirePlace(q) {
  if (q.has('city')) {
    const city = cityById(q.get('city'));
    if (!city) throw new HttpError(400, 'unknown city');
    return city;
  }
  const lat = Number(q.get('lat'));
  const lon = Number(q.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !S.inBounds(lat, lon)) throw new HttpError(400, 'lat/lon outside Palestine');
  const rl = +lat.toFixed(3);
  const ro = +lon.toFixed(3);
  return { id: `p${rl}_${ro}`, lat: rl, lon: ro };
}

/** Route table: path → (query, cache) → {data, fetchedAt, stale} | plain object. */
export function makeRoutes(cache, alerts, { demo = false } = {}) {
  return {
    '/api/cities': async () => ({ data: { cities: CITIES, regions: REGIONS, demo, liveAlerts: !!alerts.live } }),

    '/api/forecast': async (q) => {
      const c = requirePlace(q);
      return cache.get(`forecast_${c.id}`, 900, async () => S.parseForecast(await cache.json(S.forecastUrl(c.lat, c.lon))));
    },

    '/api/air': async (q) => {
      const c = requirePlace(q);
      return cache.get(`air_${c.id}`, 1800, async () => S.parseAir(await cache.json(S.airUrl(c.lat, c.lon))));
    },

    '/api/now': async () => cache.get('cities_now', 900, async () => S.parseCitiesNow(await cache.json(S.citiesNowUrl()))),

    '/api/grid': async () => cache.get('grid', 1800, async () => S.parseGrid(await cache.json(S.gridUrl()))),

    '/api/quakes': async (q) => {
      const days = Number(q.get('days') ?? 7);
      if (![1, 7, 30].includes(days)) throw new HttpError(400, 'days must be 1, 7 or 30');
      return cache.get(`quakes_${days}`, 600, async () => S.parseQuakes(await cache.json(S.quakesUrl(days))));
    },

    '/api/prayer': async (q) => {
      const c = requirePlace(q);
      const method = Number(q.get('method') ?? 5);
      if (!S.PRAYER_METHODS[method]) throw new HttpError(400, 'unknown method');
      const day = S.palestineDate();
      const r = await cache.get(`prayer_${c.id}_${method}_${day}`, 6 * 3600, async () =>
        S.parsePrayer(await cache.json(S.prayerUrl(c.lat, c.lon, method, day))));
      return { ...r, data: { ...r.data, qibla: S.qiblaBearing(c.lat, c.lon), methods: S.PRAYER_METHODS } };
    },

    '/api/rates': async () => cache.get('rates', 6 * 3600, async () => S.parseRates(await cache.json(S.RATES_URL))),

    '/api/news': async (q) => {
      const topic = q.get('topic') ?? 'weather';
      if (!S.NEWS_TOPICS[topic]) throw new HttpError(400, 'unknown topic');
      return cache.get(`news_${topic}`, 1800, async () => S.parseRss(await cache.text(S.newsUrl(topic))));
    },

    '/api/alerts': async () => ({ data: await alerts.list() }),

    // Villages, towns and cities from OpenStreetMap; changes rarely, so cache for a week.
    '/api/places': async () => {
      const r = await cache.get('places', 7 * 86400, async () => S.parsePlaces(await cache.json(S.placesUrl())));
      return { ...r, cdnSeconds: 86400 };
    },

    '/api/reverse': async (q) => {
      const p = requirePlace(q);
      const r = await cache.get(`reverse_${p.id}`, 30 * 86400, async () => S.parseReverse(await cache.json(S.reverseUrl(p.lat, p.lon))));
      return { ...r, cdnSeconds: 86400 };
    },

    '/api/search': async (q) => {
      const term = (q.get('q') ?? '').trim();
      if (term.length < 2 || term.length > 60) throw new HttpError(400, 'query must be 2–60 characters');
      const r = await cache.get(`search_${term}`, 86400, async () => {
        const answers = await Promise.all(S.searchUrls(term).map((u) => cache.json(u).catch(() => null)));
        if (answers.every((a) => a == null)) throw new Error('search unavailable');
        return S.parseSearch(answers);
      });
      return { ...r, cdnSeconds: 86400 };
    },
  };
}

async function serveStatic(res, urlPath) {
  const rel = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) throw new HttpError(403, 'forbidden');
  let target = file;
  const s = await stat(target).catch(() => null);
  // Unknown non-file paths fall back to the single-page app.
  if (!s?.isFile()) {
    if (path.extname(rel)) throw new HttpError(404, 'not found');
    target = path.join(PUBLIC, 'index.html');
  }
  const body = await readFile(target);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(target)] ?? 'application/octet-stream',
    'Cache-Control': target.endsWith('index.html') ? 'no-cache' : 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

/** Longer CDN caching for slow-changing routes, when the deployment caches at all. */
const cdnHeader = (base, seconds) =>
  base === 'no-store' || !seconds ? base : `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 7}`;

/**
 * The request handler shared by the standalone server and the Vercel functions.
 * `apiCacheControl` lets a CDN cache API answers (Vercel); the standalone server
 * caches upstream data itself, so it defaults to no-store.
 */
export function createHandler({ cache, alerts, demo = false, apiCacheControl = 'no-store' }) {
  const routes = makeRoutes(cache, alerts, { demo });
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    // On Vercel every /api/<name> is rewritten to the one function as /api?__path=<name>.
    let pathname = url.pathname;
    if (/^\/api(\/index(\.js)?)?$/.test(pathname) && url.searchParams.has('__path')) {
      pathname = `/api/${url.searchParams.get('__path')}`;
      url.searchParams.delete('__path');
    }
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'method not allowed');
      const route = routes[pathname];
      if (route) {
        const r = await route(url.searchParams);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': r.stale ? 'no-store' : cdnHeader(apiCacheControl, r.cdnSeconds) });
        res.end(JSON.stringify({ data: r.data, fetchedAt: r.fetchedAt ?? Date.now(), stale: !!r.stale }));
      } else if (pathname === '/api' || pathname.startsWith('/api/')) {
        throw new HttpError(404, 'not found');
      } else {
        await serveStatic(res, url.pathname);
      }
    } catch (e) {
      const status = e.status ?? 502;
      if (!e.status) console.warn(`[api] ${pathname}: ${e.message}`);
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.status ? e.message : 'upstream unavailable' }));
    }
  };
}

export const createApp = (opts) => createServer(createHandler(opts));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const demo = process.env.DEMO === '1';
  // Demo data lives in its own folder so it never mixes with real cached data.
  const dir = demo ? path.join(DATA, 'demo') : DATA;
  const cache = new Cache(path.join(dir, 'cache'), demo ? demoFetch() : fetch);
  const alerts = new AlertStore(dir);
  await alerts.load();
  if (process.env.ALERTS !== 'off') startAlertJob(cache, alerts);
  createApp({ cache, alerts, demo }).listen(PORT, () =>
    console.log(`طقس فلسطين: http://localhost:${PORT}${demo ? '  (وضع العرض: بيانات تجريبية)' : ''}`));
}
