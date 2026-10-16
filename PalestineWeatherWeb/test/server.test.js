import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Cache } from '../server/cache.js';
import { AlertStore } from '../server/alerts.js';
import { createApp } from '../server/index.js';
import { demoFetch } from '../server/demo.js';

let server, base, dir;
let failing = false;
const fakeFetch = demoFetch();
const flakyFetch = (url, opts) => (failing ? Promise.reject(new Error('offline')) : fakeFetch(url, opts));

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'pw-'));
  const alerts = new AlertStore(dir);
  await alerts.merge([{ key: 'k1', type: 'rain', level: 'info', title: 't', body: 'b', time: Date.now() }]);
  server = createApp({ cache: new Cache(path.join(dir, 'cache'), flakyFetch), alerts }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { server.close(); await rm(dir, { recursive: true, force: true }); });

const get = async (p) => { const r = await fetch(base + p); return { status: r.status, body: await r.json().catch(() => null), type: r.headers.get('content-type') }; };

test('every API route answers with data', async () => {
  for (const p of ['/api/cities', '/api/forecast?city=jerusalem', '/api/air?city=gaza', '/api/now', '/api/grid',
    '/api/quakes?days=7', '/api/prayer?city=nablus&method=5', '/api/rates', '/api/news?topic=climate', '/api/alerts']) {
    const r = await get(p);
    assert.equal(r.status, 200, p);
    assert.ok(r.body.data, p);
    assert.equal(r.body.stale, false, p);
  }
});

test('exact coordinates, villages, search and reverse geocoding', async () => {
  const f = await get('/api/forecast?lat=31.96&lon=35.198');
  assert.equal(f.status, 200);
  assert.equal(f.body.data.days.length, 7);
  assert.equal((await get('/api/prayer?lat=31.96&lon=35.198&method=5')).status, 200);
  assert.equal((await get('/api/forecast?lat=40&lon=35')).status, 400);
  assert.equal((await get('/api/forecast?lat=abc&lon=35')).status, 400);
  const places = await get('/api/places');
  assert.ok(places.body.data.length > 5);
  assert.ok(!places.body.data.some((p) => p[0] === 'عمّان' || p[0] === 'مكان في البحر'));
  const rev = await get('/api/reverse?lat=31.96&lon=35.198');
  assert.match(rev.body.data.name, /قرية تجريبية/);
  const search = await get('/api/search?q=' + encodeURIComponent('سلواد'));
  assert.ok(search.body.data.length >= 1);
  assert.equal((await get('/api/search?q=x')).status, 400);
});

test('forecast shape', async () => {
  const { body } = await get('/api/forecast?city=jericho');
  assert.equal(body.data.days.length, 7);
  assert.equal(body.data.hours.length, 168);
  assert.equal(typeof body.data.current.temp, 'number');
});

test('invalid input is rejected', async () => {
  assert.equal((await get('/api/forecast?city=nowhere')).status, 400);
  assert.equal((await get('/api/quakes?days=3')).status, 400);
  assert.equal((await get('/api/prayer?city=gaza&method=99')).status, 400);
  assert.equal((await get('/api/news?topic=x')).status, 400);
  assert.equal((await get('/api/nope')).status, 404);
});

test('falls back to the saved copy when the upstream fails', async () => {
  const fresh = new Cache(path.join(dir, 'cache'), () => Promise.reject(new Error('offline')));
  const r = await fresh.get('rates', 0, async () => { throw new Error('offline'); });
  assert.equal(r.stale, true);
  assert.ok(r.data.rates.USD);
});

test('upstream failure without a saved copy is a 502', async () => {
  failing = true;
  try {
    const r = await get('/api/forecast?city=umrashrash');
    assert.equal(r.status, 502);
  } finally { failing = false; }
});

test('static files and SPA fallback, no path traversal', async () => {
  const idx = await fetch(base + '/map');
  assert.equal(idx.status, 200);
  assert.match(await idx.text(), /طقس فلسطين/);
  const js = await fetch(base + '/app.js');
  assert.match(js.headers.get('content-type'), /javascript/);
  assert.equal((await fetch(base + '/missing.js')).status, 404);
  assert.notEqual((await fetch(base + '/..%2fpackage.json')).status, 200);
});
