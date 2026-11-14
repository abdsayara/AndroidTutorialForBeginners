import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { Cache } from '../server/cache.js';
import { AlertStore } from '../server/alerts.js';
import { createApp } from '../server/index.js';
import { demoFetch } from '../server/demo.js';
import { Budget, RateLimit, SECURITY_HEADERS, clientAddress } from '../server/guard.js';
import { sanitize } from '../server/watan.js';

/** A server on demo data with the given limits; returns { base, close }. */
async function start(opts = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'pw-sec-'));
  const alerts = new AlertStore(dir);
  const cache = new Cache(path.join(dir, 'cache'), demoFetch(), opts.maxEntries);
  const server = createApp({ cache, alerts, ...opts }).listen(0);
  await new Promise((r) => server.once('listening', r));
  return { base: `http://127.0.0.1:${server.address().port}`, port: server.address().port, cache, dir, close: async () => { server.close(); await rm(dir, { recursive: true, force: true }); } };
}

test('a report body cannot carry script, handlers or an unfinished tag', () => {
  const dirty = '<p onclick="x()">نص</p><script>alert(1)</script><svg onload=alert(2)><a href="javascript:alert(3)">رابط</a>'
    + '<img src="https://x.test/a.png" onerror="alert(4)"><iframe src="//evil"></iframe>ذيل <img src=x onerror=alert(5) ';
  const clean = sanitize(dirty);
  assert.doesNotMatch(clean, /<script|onerror=alert\(4\)|onclick|javascript:|<svg|<iframe|<a\b/i);
  assert.match(clean, /<img src="https:\/\/x\.test\/a\.png" alt="" loading="lazy">/);
  // The unfinished tag at the end is text now, so the page's own markup cannot complete it.
  assert.match(clean, /&lt;img src=x onerror=alert\(5\)/);
  assert.equal((clean.match(/<(?!\/?(?:p|em|i|u|ul|ol|li|h2|h3|h4|blockquote|table|thead|tbody|tr|td|th|br|img)\b)/g) ?? []).length, 0);
  assert.doesNotMatch(sanitize('<img src="https://x.test/a.png?x=\'><script>alert(1)</script>">'), /<script/i);
});

test('a visitor who asks too often is told to wait, and others are not affected', async () => {
  const s = await start({ rateLimit: new RateLimit({ limit: 5, windowMs: 60_000 }) });
  try {
    const codes = [];
    for (let i = 0; i < 8; i++) codes.push((await fetch(`${s.base}/api/cities`)).status);
    assert.deepEqual(codes, [200, 200, 200, 200, 200, 429, 429, 429]);
    const blocked = await fetch(`${s.base}/api/cities`);
    assert.ok(Number(blocked.headers.get('retry-after')) >= 1);
    // The pages themselves stay reachable.
    assert.equal((await fetch(`${s.base}/`)).status, 200);
  } finally { await s.close(); }
  const rl = new RateLimit({ limit: 1, windowMs: 1000 });
  assert.equal(rl.allow('a', 0), true);
  assert.equal(rl.allow('a', 10), false);
  assert.equal(rl.allow('b', 10), true, 'another visitor has their own allowance');
  assert.equal(rl.allow('a', 1001), true, 'and the window ends');
});

test('made-up places cannot spend the upstream allowance; known cities still answer', async () => {
  const s = await start({ budget: new Budget(3, 0) });
  try {
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await fetch(`${s.base}/api/forecast?lat=${(31.5 + i * 0.05).toFixed(2)}&lon=35.1`)).status);
    assert.deepEqual(codes, [200, 200, 200, 429, 429, 429]);
    // A place already answered comes from the cache, and costs nothing.
    assert.equal((await fetch(`${s.base}/api/forecast?lat=31.5&lon=35.1`)).status, 200);
    // Points a few hundred metres apart are one place for the weather.
    assert.equal((await fetch(`${s.base}/api/forecast?lat=31.5004&lon=35.1003`)).status, 200);
  } finally { await s.close(); }
});

test('the cache does not grow without end', async () => {
  const s = await start({ maxEntries: 5 });
  try {
    for (let i = 0; i < 12; i++) await fetch(`${s.base}/api/forecast?lat=${(31.2 + i * 0.05).toFixed(2)}&lon=35.0`);
    assert.ok(s.cache.memory.size <= 5, `memory holds ${s.cache.memory.size}`);
    await new Promise((r) => setTimeout(r, 100));
    assert.ok((await readdir(path.join(s.dir, 'cache'))).length <= 6, 'and so does the disk');
  } finally { await s.close(); }
});

test('bad requests are refused, not crashes', async () => {
  const s = await start();
  try {
    assert.equal((await fetch(`${s.base}/api/forecast?lat=abc&lon=35`)).status, 400);
    assert.equal((await fetch(`${s.base}/api/forecast?lat=48.85&lon=2.35`)).status, 400, 'outside Palestine');
    assert.equal((await fetch(`${s.base}/api/report?id=1%20OR%201=1`)).status, 400);
    assert.equal((await fetch(`${s.base}/api/search?q=${'ا'.repeat(200)}`)).status, 400);
    assert.equal((await fetch(`${s.base}/api/cities`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${s.base}/%E0%A4%A.html`)).status, 400, 'a broken escape');
    assert.equal((await fetch(`${s.base}/api/cities?x=${'a'.repeat(3000)}`)).status, 414);
    for (const p of ['/..%2f..%2fpackage.json', '/%2e%2e/%2e%2e/server/index.js', '/..%5c..%5cpackage.json']) {
      const r = await fetch(s.base + p);
      const body = await r.text();
      assert.ok(!body.includes('"scripts"') && !body.includes('createServer'), `${p} must not leave the public folder`);
    }
    // A request line that is not a URL at all: answered, and the server keeps running.
    await new Promise((resolve) => {
      const c = net.connect(s.port, '127.0.0.1', () => c.write('GET //[ HTTP/1.1\r\nHost: x\r\n\r\n'));
      c.on('data', () => c.end());
      c.on('close', resolve);
      c.on('error', resolve);
    });
    assert.equal((await fetch(`${s.base}/api/cities`)).status, 200);
  } finally { await s.close(); }
});

test('every answer carries the protective headers, and Vercel is told the same', async () => {
  const s = await start();
  try {
    for (const p of ['/', '/api/cities', '/api/nope', '/styles.css']) {
      const r = await fetch(s.base + p);
      assert.match(r.headers.get('content-security-policy') ?? '', /script-src 'self';/, p);
      assert.equal(r.headers.get('x-content-type-options'), 'nosniff', p);
      assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN', p);
    }
  } finally { await s.close(); }
  const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const sent = Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key, h.value]));
  assert.deepEqual(sent, SECURITY_HEADERS);
});

test('the pages hold no inline script or handler, which the policy would block', async () => {
  for (const f of ['index.html', 'welcome.html']) {
    const html = await readFile(new URL(`../public/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/i, `${f}: inline script`);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, `${f}: inline handler`);
  }
  for (const f of ['views.js', 'app.js', 'map.js', 'share.js', 'welcome.js']) {
    const js = await readFile(new URL(`../public/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(js, /\son(error|click|load)\s*=\s*["']/i, `${f}: inline handler in markup`);
  }
});

test('the visitor\'s address comes from the platform header, else the socket', () => {
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' } }), '1.2.3.4');
  assert.equal(clientAddress({ headers: {}, socket: { remoteAddress: '5.6.7.8' } }), '5.6.7.8');
});
