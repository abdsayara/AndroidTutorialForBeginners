import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Cache } from '../server/cache.js';
import { LiveAlerts } from '../server/alerts.js';
import { createHandler } from '../server/index.js';
import { demoFetch } from '../server/demo.js';

test('serverless handler: live alerts and CDN cache headers', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'pwv-'));
  const cache = new Cache(dir, demoFetch());
  const server = createServer(createHandler({ cache, alerts: new LiveAlerts(cache), apiCacheControl: 'public, s-maxage=600' })).listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const cities = await fetch(`${base}/api/cities`);
    assert.equal((await cities.json()).data.liveAlerts, true);
    assert.equal(cities.headers.get('cache-control'), 'public, s-maxage=600');
    const alerts = await (await fetch(`${base}/api/alerts`)).json();
    assert.ok(Array.isArray(alerts.data) && alerts.data.length > 0);
    assert.ok(alerts.data.every((a) => a.key && a.title && a.type));
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('every /api file is a Vercel function exporting the handler', async () => {
  for (const r of ['cities', 'forecast', 'air', 'now', 'grid', 'quakes', 'prayer', 'rates', 'news', 'alerts']) {
    const mod = await import(`../api/${r}.js`);
    assert.equal(typeof mod.default, 'function', r);
  }
});
