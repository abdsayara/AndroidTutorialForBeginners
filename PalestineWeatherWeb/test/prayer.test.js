import test from 'node:test';
import assert from 'node:assert/strict';
import { prayerDay, summerMinutes, hijriDate } from '../server/prayer.js';

const times = (date) => prayerDay(date).times.map((t) => t.time);

test('the timetable is taken as printed, in winter time', () => {
  // 16 كانون الثاني in the booklet: 05:13 06:36 11:48 02:39 05:04 06:23
  assert.deepEqual(times('2027-01-16'), ['05:13', '06:36', '11:48', '14:39', '17:04', '18:23']);
  // 1 كانون الثاني, and 29 شباط in a leap year
  assert.deepEqual(times('2027-01-01'), ['05:12', '06:36', '11:42', '14:27', '16:52', '18:13']);
  assert.equal(prayerDay('2028-02-29').times.length, 6);
});

test('summer time moves every prayer an hour', () => {
  assert.equal(summerMinutes('2027-01-16'), 0);
  assert.equal(summerMinutes('2026-06-16'), 60);
  // 16 حزيران in the booklet: 02:53 04:30 11:39 03:19 06:52 08:25
  assert.deepEqual(times('2026-06-16'), ['03:53', '05:30', '12:39', '16:19', '19:52', '21:25']);
});

test('the Hijri date reads in Arabic', () => {
  assert.match(hijriDate('2026-11-14'), /^\\d{1,2} \\S.* 1448 هـ$/);
});
