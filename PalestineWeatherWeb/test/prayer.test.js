import test from 'node:test';
import assert from 'node:assert/strict';
import { prayerDay, minutesAfterJerusalem, summerMinutes, hijriDate } from '../server/prayer.js';

const times = (lat, lon, date) => prayerDay(lat, lon, date).times.map((t) => t.time);

test('Jerusalem takes the timetable as printed, in winter time', () => {
  // 16 كانون الثاني in the booklet: 05:13 06:36 11:48 02:39 05:04 06:23
  assert.deepEqual(times(31.778, 35.235, '2027-01-16'), ['05:13', '06:36', '11:48', '14:39', '17:04', '18:23']);
  // 1 كانون الثاني, and 29 شباط in a leap year
  assert.deepEqual(times(31.778, 35.235, '2027-01-01'), ['05:12', '06:36', '11:42', '14:27', '16:52', '18:13']);
  assert.equal(prayerDay(31.778, 35.235, '2028-02-29').times.length, 6);
});

test('summer time moves every prayer an hour', () => {
  assert.equal(summerMinutes('2027-01-16'), 0);
  assert.equal(summerMinutes('2026-06-16'), 60);
  // 16 حزيران in the booklet: 02:53 04:30 11:39 03:19 06:52 08:25
  assert.deepEqual(times(31.778, 35.235, '2026-06-16'), ['03:53', '05:30', '12:39', '16:19', '19:52', '21:25']);
});

test('other towns take the timetable\'s differences', () => {
  assert.equal(minutesAfterJerusalem(31.903, 35.204), 0, 'Ramallah');
  assert.equal(minutesAfterJerusalem(31.857, 35.460), -1, 'Jericho');
  assert.equal(minutesAfterJerusalem(31.530, 35.094), 1, 'Hebron');
  assert.equal(minutesAfterJerusalem(32.190, 34.970), 2, 'Qalqilya: a minute and a half, rounded up');
  assert.equal(minutesAfterJerusalem(32.050, 34.752), 2, 'Jaffa');
  assert.equal(minutesAfterJerusalem(31.501, 34.467), 3, 'Gaza');
  assert.equal(minutesAfterJerusalem(31.287, 34.259), 4, 'Rafah');
  assert.deepEqual(times(31.501, 34.467, '2027-01-16'), ['05:16', '06:39', '11:51', '14:42', '17:07', '18:26']);
});

test('a village the timetable does not name goes by its longitude', () => {
  assert.equal(minutesAfterJerusalem(32.06, 35.03), 1, 'Deir Ballut, west of Jerusalem');
  assert.equal(minutesAfterJerusalem(32.4, 35.48), -1, 'the Jordan valley, east of it');
});

test('the Hijri date reads in Arabic', () => {
  assert.match(hijriDate('2026-11-14'), /^\d{1,2} \S.* 1448 هـ$/);
});
