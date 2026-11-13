import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLatestTime, fallbackTime, frameTimes, satellite, LAYERS } from '../server/satellite.js';

test('the newest picture time is read from the capabilities', () => {
  const xml = '<Layer><Name>rgb_dust</Name><Dimension name="time" default="2026-11-13T15:00:00Z" units="ISO8601">x</Dimension></Layer>'
    + '<Layer><Name>rgb_geocolour</Name><Dimension name="time" default="2026-11-13T16:10:00Z" units="ISO8601">x</Dimension></Layer>';
  assert.equal(parseLatestTime(xml), '2026-11-13T16:10:00.000Z');
  assert.equal(parseLatestTime('<nothing/>'), null);
});

test('the fallback time is a ten-minute slot about half an hour back', () => {
  assert.equal(fallbackTime(Date.parse('2026-11-13T16:47:12Z')), '2026-11-13T16:10:00.000Z');
});

test('the moving pictures cover two hours and end at the newest', () => {
  const t = frameTimes('2026-11-13T16:10:00.000Z');
  assert.equal(t.length, 7);
  assert.equal(t[0], '2026-11-13T14:10:00.000Z');
  assert.equal(t.at(-1), '2026-11-13T16:10:00.000Z');
});

test('every layer has a thumbnail and one picture per time', () => {
  const s = satellite('2026-11-13T16:10:00.000Z');
  assert.equal(s.layers.length, LAYERS.length);
  for (const l of s.layers) {
    assert.equal(l.frames.length, s.times.length);
    assert.equal(l.frames.at(-1), l.image);
    assert.match(l.thumb, /^https:\/\/view\.eumetsat\.int\//);
    assert.ok(new URL(l.image).searchParams.get('time') === s.time);
  }
});
