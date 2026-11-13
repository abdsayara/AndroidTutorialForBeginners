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
import * as R from './roads.js';
import * as SAT from './satellite.js';
import * as W from './watan.js';
import * as WU from './wunderground.js';
import { PALHUB_URL, parsePalhub } from './palhub.js';
import { telegramConfigured, readChats } from './telegram.js';
import { demoFetch } from './demo.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, '..', 'public');
const DATA = process.env.DATA_DIR ?? path.join(ROOT, '..', 'data');
const PORT = Number(process.env.PORT ?? 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
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
  // Villages, towns and cities ship with the site (scripts/build-places.py, from lists of Arab towns and villages):
  // the live Overpass servers proved too unreliable to depend on.
  const fetchPlaces = async () => JSON.parse(await readFile(new URL('./data/places.json', import.meta.url), 'utf8'));
  const placesList = async () => (await cache.get('places2', 7 * 86400, fetchPlaces)).data;
  return {
    '/api/cities': async () => ({ data: { cities: CITIES, regions: REGIONS, demo, liveAlerts: !!alerts.live } }),

    '/api/forecast': async (q) => {
      const c = requirePlace(q);
      return cache.get(`forecast3_${c.id}`, 900, async () => S.parseForecast(await cache.json(S.forecastUrl(c.lat, c.lon))));
    },

    '/api/air': async (q) => {
      const c = requirePlace(q);
      return cache.get(`air2_${c.id}`, 1800, async () => S.parseAir(await cache.json(S.airUrl(c.lat, c.lon))));
    },

    '/api/now': async () => cache.get('cities_now', 900, async () => S.parseCitiesNow(await cache.json(S.citiesNowUrl()))),

    '/api/grid': async () => cache.get('grid2', 1800, async () => S.parseGrid(await cache.json(S.gridUrl()))),

    '/api/quakes': async (q) => {
      const days = Number(q.get('days') ?? 7);
      if (![1, 7, 30].includes(days)) throw new HttpError(400, 'days must be 1, 7 or 30');
      return cache.get(`quakes_${days}`, 600, async () => S.parseQuakes(await cache.json(S.quakesUrl(days))));
    },

    '/api/prayer': async (q) => {
      const c = requirePlace(q);
      // One way of working the times out for everyone: Umm al-Qura.
      const method = S.PRAYER_METHOD;
      const day = S.palestineDate();
      const r = await cache.get(`prayer_${c.id}_${method}_${day}`, 6 * 3600, async () =>
        S.parsePrayer(await cache.json(S.prayerUrl(c.lat, c.lon, method, day))));
      return { ...r, data: { ...r.data, qibla: S.qiblaBearing(c.lat, c.lon) } };
    },

    '/api/rates': async () => cache.get('rates', 6 * 3600, async () => S.parseRates(await cache.json(S.RATES_URL))),

    '/api/news': async (q) => {
      const topic = q.get('topic') ?? 'weather';
      if (!S.NEWS_TOPICS[topic]) throw new HttpError(400, 'unknown topic');
      return cache.get(`news_${topic}`, 1800, async () => S.parseRss(await cache.text(S.newsUrl(topic))));
    },

    '/api/alerts': async () => ({ data: await alerts.list() }),

    // «طقس الوطن» (p-weather.ps): detailed bulletin, daily reports and its weather stations.
    '/api/bulletin': async () => {
      const r = await cache.get('watan_bulletin', 1800, async () => W.parseBulletin(await cache.text(W.BULLETIN_URL)));
      // A day's bulletin goes away once that day is over, even from a cached copy.
      return { ...r, data: { ...r.data, days: W.currentDays(r.data.days, S.palestineDate()) }, cdnSeconds: 600 };
    },

    '/api/reports': async () => {
      const r = await cache.get('watan_reports', 3600, async () => W.parseReports(await cache.text(W.REPORTS_URL)));
      return { ...r, cdnSeconds: 1800 };
    },

    // Live satellite pictures (EUMETSAT): the newest picture's time, and each layer's address.
    '/api/satellite': async () => {
      const r = await cache.get('satellite_time', 300, async () => (await cache.text(SAT.CAPABILITIES_URL).then(SAT.parseLatestTime).catch(() => null)) ?? SAT.fallbackTime());
      return { ...r, data: SAT.satellite(r.data), cdnSeconds: 300 };
    },

    '/api/report': async (q) => {
      const id = Number(q.get('id'));
      if (!Number.isInteger(id) || id <= 0 || id > 1e7) throw new HttpError(400, 'bad report id');
      const r = await cache.get(`watan_report_${id}`, 86400, async () => W.parseArticle(await cache.text(W.articleUrl(id)), id));
      return { ...r, cdnSeconds: 3600 };
    },

    '/api/stations': async () => {
      const r = await cache.get('watan_stations', 300, async () => {
        // The list of stations changes rarely; their readings every few minutes.
        const list = (await cache.get('watan_station_list', 86400, async () => W.parseStations(await cache.text(W.STATIONS_URL)))).data;
        return Promise.all(list.map(async (s) => {
          const station = { id: s.id, name: W.stationName(s.name), sticker: s.sticker ?? null };
          try {
            if (s.kind === 'weatherlink') return { ...station, now: W.parseWeatherlink(await cache.json(W.weatherlinkUrl(s.id))) };
            const [values, stats] = await Promise.all(W.weathercloudUrls(s.id).map((u, i) => cache.json(u, W.WEATHERCLOUD_HEADERS).catch((err) => (i ? {} : Promise.reject(err)))));
            return { ...station, now: W.parseWeathercloud(values, stats) };
          } catch (err) {
            return { ...station, now: null, error: err.message };
          }
        })).then(async (watan) => {
          // Weather Underground stations, when we have our own key for their API.
          const key = process.env.WU_API_KEY;
          const wu = await Promise.all(WU.WU_STATIONS.map(async (s) => {
            const station = { id: `wu-${s.id}`, name: s.name, sticker: null };
            if (!key) return { ...station, now: null, error: 'no WU_API_KEY' };
            try {
              const [cur, day] = await Promise.all([cache.json(WU.currentUrl(s.id, key)), cache.json(WU.todayUrl(s.id, key)).catch(() => ({}))]);
              return { ...station, now: WU.parseWu(cur, day) };
            } catch (err) {
              return { ...station, now: null, error: err.message };
            }
          }));
          return [...watan, ...wu];
        });
      });
      return { ...r, cdnSeconds: 120 };
    },

    // Checkpoints and roads from public Telegram channels; posts arrive every few minutes.
    '/api/roads': async () => {
      const channels = R.roadChannels();
      const r = await cache.get('roads', 120, async () => {
        // Groups need Telegram's API (a logged-in account); channels also work from the web preview.
        const viaApi = telegramConfigured() ? await readChats(channels.map((c) => c.id)).catch((err) => ({ error: err.message })) : {};
        const sources = await Promise.all(channels.map(async (ch) => {
          const api = viaApi[ch.id];
          if (api?.posts?.length) return { ...ch, ok: true, posts: api.posts, error: null, via: 'api' };
          try {
            const first = R.parseTelegram(await cache.text(R.telegramUrl(ch.id)), ch.id);
            // One more page of older posts, so quiet hours still show the last news.
            const older = first.length ? R.parseTelegram(await cache.text(R.telegramUrl(ch.id, first[0].id)).catch(() => ''), ch.id) : [];
            const posts = [...older, ...first];
            // The page answered, so this is not an outage; with no posts it is a group (or the
            // preview is off) and needs the API — report the API's own error when it had one.
            return { ...ch, ok: posts.length > 0, answered: true, posts, error: posts.length ? null : (api?.error ?? viaApi.error ?? 'no public posts') };
          } catch (err) {
            return { ...ch, ok: false, posts: [], error: err.message };
          }
        }));
        // PalHub: ~200 checkpoints with a status per direction; the main source when it answers.
        const palhub = await cache.text(PALHUB_URL).then(parsePalhub).catch((err) => ({ error: err.message }));
        // Only a network failure on every source is an outage (keeps the last good copy);
        // a page with no posts means the source needs another way in (e.g. a group).
        if (!palhub.checkpoints && !sources.some((s) => s.ok || s.answered)) throw new Error('no road source reachable');
        const roads = R.buildRoads(sources.flatMap((s) => s.posts));
        const fromPosts = roads.checkpoints.map((c) => ({ ...c, city: roads.regions[c.region], into: c.status, out: c.status }));
        return {
          checkpoints: palhub.checkpoints ?? fromPosts,
          cities: palhub.cities ?? Object.values(roads.regions).map((name) => ({ name })),
          feed: roads.feed,
          sources: [
            { id: 'palhub', name: 'PalHub', ok: !!palhub.checkpoints, count: palhub.checkpoints?.length ?? 0, error: palhub.error ?? null },
            ...sources.map(({ posts, answered, ...s }) => ({ ...s, count: posts.length })),
          ],
        };
      });
      return { ...r, cdnSeconds: 60 };
    },

    // Villages, towns and cities from OpenStreetMap; changes rarely, so cache for a week.
    '/api/places': async () => {
      const r = await cache.get('places2', 7 * 86400, fetchPlaces);
      return { ...r, cdnSeconds: 86400 };
    },

    '/api/reverse': async (q) => {
      const p = requirePlace(q);
      const r = await cache.get(`reverse2_${p.id}`, 30 * 86400, async () => {
        const out = S.parseReverse(await cache.json(S.reverseUrl(p.lat, p.lon)), p.lat, p.lon);
        if (!out.name) {
          // OSM has some villages only in English (e.g. Ras Al-Joura): take the nearest Arabic
          // village name from our places list, without waiting long for it.
          const places = await Promise.race([placesList(), new Promise((res) => setTimeout(res, 8000, null))]).catch(() => null);
          const near = S.nearestPlaceName(places, p.lat, p.lon);
          if (near) return { name: near, area: out.area !== near ? out.area : null };
        }
        return out;
      });
      return { ...r, cdnSeconds: 86400 };
    },

    '/api/search': async (q) => {
      const term = (q.get('q') ?? '').trim();
      if (term.length < 2 || term.length > 60) throw new HttpError(400, 'query must be 2–60 characters');
      // From the map's own list, so every village the map shows can be found (and nothing else).
      const data = S.searchPlaces(await placesList(), term);
      return { data, fetchedAt: Date.now(), stale: false, cdnSeconds: 3600 };
    },
  };
}

async function serveStatic(res, urlPath) {
  const rel = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) throw new HttpError(403, 'forbidden');
  let target = file;
  let s = await stat(target).catch(() => null);
  // A clean URL for a standalone page: /welcome serves welcome.html.
  if (!s && !path.extname(rel)) {
    const page = await stat(`${file}.html`).catch(() => null);
    if (page?.isFile()) { target = `${file}.html`; s = page; }
  }
  // Unknown non-file paths fall back to the single-page app.
  if (!s?.isFile()) {
    if (path.extname(rel)) throw new HttpError(404, 'not found');
    target = path.join(PUBLIC, 'index.html');
  }
  const body = await readFile(target);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(target)] ?? 'application/octet-stream',
    'Cache-Control': target.endsWith('.html') ? 'no-cache' : 'public, max-age=300',
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
    console.log(`طقس الوطن: http://localhost:${PORT}${demo ? '  (وضع العرض: بيانات تجريبية)' : ''}`));
}
