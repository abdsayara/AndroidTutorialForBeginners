import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePalhub, worst } from '../server/palhub.js';

// Shape of the real page: the data sits in a Next.js flight chunk, JSON-escaped.
const page = (data) => {
  const payload = `0:{"P":null}\n14:["$","$L29",null,{"initial":${JSON.stringify(data)}}]`;
  const half = Math.floor(payload.length / 2);
  return `<script>self.__next_f.push([1,${JSON.stringify(payload.slice(0, half))}])</script>`
    + `<script>self.__next_f.push([1,${JSON.stringify(payload.slice(half))}])</script>`;
};

test('parsePalhub reads cities and checkpoints split across flight chunks', () => {
  const r = parsePalhub(page({
    cities: [
      { id: 'c1', name_ar: 'نابلس', display_order: 3, latitude: 32.2, longitude: 35.2 },
      { id: 'c0', name_ar: 'ضواحي القدس', display_order: 1, latitude: 31.7, longitude: 35.2 },
      { id: 'c9', name_ar: 'غزة', display_order: 9, latitude: 31.5, longitude: 34.4 },
    ],
    checkpoints: [
      { id: 'a', name: 'بوابة حوارة', city_id: 'c1', status_into: 'crowded', status_out: 'open', last_status_update_at: '2026-11-10T12:26:45.512+02:00' },
      { id: 'b', name: 'جبع', city_id: 'c0', status_into: 'crisis', status_out: 'closed', last_status_update_at: '2026-11-10T13:30:05.148+02:00' },
      { id: 'c', name: 'بيت جالا (DCO)', city_id: 'c0', status_into: 'open', status_out: 'open' },
      { id: 'd', name: 'نفق حبلة "الجديد"', city_id: 'c1', status_into: 'weird', status_out: 'open' },
    ],
  }));
  assert.deepEqual(r.cities.map((c) => c.name), ['ضواحي القدس', 'نابلس'], 'sorted, and only cities with checkpoints');
  const [huwwara, jaba, beitJala, habla] = r.checkpoints;
  assert.equal(huwwara.into, 'busy');
  assert.equal(huwwara.status, 'busy');
  assert.equal(huwwara.lat, 32.158, 'placed where our list knows it');
  assert.equal(huwwara.at, '2026-11-10T10:26:45.512Z');
  assert.equal(jaba.status, 'closed');
  assert.equal(jaba.city, 'ضواحي القدس');
  assert.equal(beitJala.lat, null, '"DCO" alone must not match بيت إيل');
  assert.equal(habla.lat, null, '"نفق" alone must not match the tunnels checkpoint');
  assert.equal(habla.into, 'unknown');
  assert.equal(habla.name, 'نفق حبلة "الجديد"');
});

test('parsePalhub fails clearly when the page has no data', () => {
  assert.throws(() => parsePalhub('<html></html>'), /no checkpoints/);
});

test('worst picks the more serious state', () => {
  assert.equal(worst('open', 'crisis'), 'crisis');
  assert.equal(worst('closed', 'busy'), 'closed');
  assert.equal(worst('unknown', 'open'), 'open');
});
