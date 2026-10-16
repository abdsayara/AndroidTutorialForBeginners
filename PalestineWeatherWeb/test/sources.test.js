import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../server/sources.js';
import { buildAlerts } from '../server/alerts.js';
import { describePlace } from '../server/cities.js';

test('parseForecast keeps nulls and maps arrays', () => {
  const f = S.parseForecast({
    elevation: -258,
    current: { time: '2026-10-16T09:00', temperature_2m: 24.3, weather_code: 2, is_day: 1 },
    hourly: { time: ['2026-10-16T09:00'], temperature_2m: [24.3], precipitation_probability: [null], weather_code: [2], is_day: [1] },
    daily: { time: ['2026-10-16'], temperature_2m_max: [27], temperature_2m_min: [16], precipitation_probability_max: [10], sunrise: ['2026-10-16T06:13'] },
  });
  assert.equal(f.current.temp, 24.3);
  assert.equal(f.elevation, -258);
  assert.equal(f.hours[0].precipProb, 0);
  assert.equal(f.days[0].max, 27);
  assert.equal(f.days[0].sunrise, '2026-10-16T06:13');
});

test('parseCitiesNow accepts single object and arrays', () => {
  const one = S.parseCitiesNow({ current: { temperature_2m: 20, wind_speed_10m: 5, weather_code: 0 }, hourly: { precipitation_probability: [30] } },
    [{ id: 'a' }]);
  assert.deepEqual(one.a, { temp: 20, wind: 5, code: 0, precipProb: 30, elevation: null });
});

test('gridPoints covers Palestine on a 0.25° grid', () => {
  const pts = S.gridPoints();
  assert.equal(pts.length, 16 * 7);
  assert.deepEqual(pts[0], [29.5, 34.25]);
  assert.deepEqual(pts.at(-1), [33.25, 35.75]);
});

test('parseGrid finds the current hour using the upstream UTC offset', () => {
  const times = ['2026-10-16T08:00', '2026-10-16T09:00', '2026-10-16T10:00'];
  const g = S.parseGrid([{ utc_offset_seconds: 10800, hourly: { time: times, precipitation: [0, 1, 2], cloud_cover: [0, 0, 0], cape: [0, 0, 0] } }],
    [[31, 35]], new Date('2026-10-16T06:30:00Z'));
  assert.equal(g.nowIndex, 1);
});

test('parseRates inverts to shekels per unit', () => {
  const r = S.parseRates({ rates: { USD: 0.25, JOD: 0 }, time_last_update_utc: 'x' });
  assert.equal(r.rates.USD.ils, 4);
  assert.equal(r.rates.JOD, undefined);
});

test('parseRss strips the source suffix and decodes entities', () => {
  const xml = '<rss><channel><item><title>مطر &amp; برد - الجزيرة</title><link>https://a.example/x</link>' +
    '<pubDate>Fri, 16 Oct 2026 08:00:00 GMT</pubDate><source url="https://a">الجزيرة</source></item>' +
    '<item><title>bad</title><link>javascript:alert(1)</link></item></channel></rss>';
  const items = S.parseRss(xml);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'مطر & برد');
  assert.equal(items[0].source, 'الجزيرة');
});

test('parsePrayer and qibla', () => {
  const p = S.parsePrayer({ data: {
    timings: { Fajr: '04:55 (EEST)', Sunrise: '06:13', Dhuhr: '11:52', Asr: '15:13', Maghrib: '17:31', Isha: '18:47' },
    date: { hijri: { day: '05', month: { ar: 'جمادى الأولى' }, year: '1448' } },
  } });
  assert.equal(p.times[0].time, '04:55');
  assert.equal(p.hijri, '5 جمادى الأولى 1448 هـ');
  const q = S.qiblaBearing(31.7683, 35.2137);
  assert.ok(q > 150 && q < 165, `qibla ${q}`);
});

test('prayerUrl uses the given Palestine date', () => {
  assert.match(S.prayerUrl(31.7, 35.2, 5, '2026-10-16'), /timings\/16-10-2026\?/);
});

test('describePlace is relative to the nearest city', () => {
  assert.equal(describePlace(31.7683, 35.2137), 'قرب القدس');
  assert.match(describePlace(31.6, 35.46), /كم من/);
});

test('buildAlerts groups cities per type and day', () => {
  const day = (prob, sum, max, min, wind) => ({ daily: {
    time: ['2026-10-16'], precipitation_probability_max: [prob], precipitation_sum: [sum],
    temperature_2m_max: [max], temperature_2m_min: [min], wind_speed_10m_max: [wind],
  } });
  const cities = [{ name: 'أ' }, { name: 'ب' }, { name: 'ج' }];
  const now = Date.parse('2026-10-16T12:00:00Z');
  const alerts = buildAlerts([day(80, 25, 20, 10, 10), day(70, 5, 20, 2, 10), day(10, 0, 38, 20, 60)],
    [{ id: 'q1', mag: 3.4, time: now - 3600000, place: 'قرب أريحا', depthKm: 10 }, { id: 'q2', mag: 2, time: now, place: 'x', depthKm: 1 }],
    now, cities);
  const byType = Object.fromEntries(alerts.map((a) => [a.type, a]));
  assert.equal(byType.rain.body.startsWith('أ، ب'), true);
  assert.equal(byType.rain.level, 'warn');
  assert.equal(byType.frost.level, 'warn');
  assert.equal(byType.heat.title, 'موجة حر اليوم');
  assert.ok(byType.wind);
  assert.equal(alerts.filter((a) => a.type === 'quake').length, 1);
});

test('parsePlaces keeps named places inside Palestine, Arabic names first, cities first', () => {
  const r = S.parsePlaces({ elements: [
    { lat: 31.7151, lon: 35.1872, tags: { name: 'Beit Jala', 'name:ar': 'بيت جالا', place: 'village' } },
    { lat: 32.5194, lon: 35.1536, tags: { name: 'Umm al-Fahm', 'name:ar': 'أم الفحم', place: 'city' } },
    { lat: 31.95, lon: 35.93, tags: { name: 'Amman', 'name:ar': 'عمّان', place: 'city' } },
    { lat: 32.1, lon: 34.6, tags: { name: 'Sea', place: 'village' } },
    { lat: 31.9, lon: 35.2, tags: { place: 'village' } },
  ] });
  assert.deepEqual(r.map((p) => p[0]), ['أم الفحم', 'بيت جالا']);
  assert.equal(r[0][3], 'c');
});

test('parseReverse picks the village or neighbourhood name', () => {
  assert.deepEqual(S.parseReverse({ address: { village: 'بيرزيت', county: 'محافظة رام الله والبيرة' } }), { name: 'بيرزيت', area: 'محافظة رام الله والبيرة' });
  assert.deepEqual(S.parseReverse({ address: { suburb: 'الشيخ جراح', city: 'القدس', state: 'القدس' } }), { name: 'الشيخ جراح', area: 'القدس' });
});

test('parseSearch merges, filters to Palestine and ranks by population', () => {
  const r = S.parseSearch([
    { results: [{ id: 1, name: 'سلواد', latitude: 31.9789, longitude: 35.2564, admin2: 'رام الله', population: 7000 }] },
    { results: [{ id: 2, name: 'الطيبة', latitude: 32.2667, longitude: 35.0103, population: 43000 }, { id: 3, name: 'x', latitude: 31.95, longitude: 35.93 }] },
    null,
  ]);
  assert.deepEqual(r.map((p) => p.name), ['الطيبة', 'سلواد']);
});

test('only Arabic names are shown, never Hebrew', () => {
  const places = S.parsePlaces({ elements: [
    { lat: 32.0, lon: 34.85, tags: { name: 'פתח תקווה', 'name:en': 'Petah Tikva', place: 'city' } },
    { lat: 32.5194, lon: 35.1536, tags: { name: 'أم الفحم', place: 'city' } },
    { lat: 32.7, lon: 35.3, tags: { name: 'נצרת עילית', 'name:ar': 'نتسيرت عيليت', place: 'town' } },
  ] });
  assert.deepEqual(places.map((p) => p[0]), ['أم الفحم', 'نتسيرت عيليت']);
  assert.deepEqual(S.parseReverse({ address: { village: 'כפר', county: 'נפת חיפה', state: 'מחוז חיפה' } }), { name: null, area: null });
  assert.deepEqual(S.parseReverse({ address: { neighbourhood: 'רמות', city: 'القدس' } }), { name: 'القدس', area: null });
  const found = S.parseSearch([{ results: [
    { id: 1, name: 'עפולה', latitude: 32.6, longitude: 35.29, admin1: 'מחוז הצפון' },
    { id: 2, name: 'عرابة', latitude: 32.85, longitude: 35.33, admin1: 'מחוז הצפון', population: 25000 },
  ] }]);
  assert.deepEqual(found.map((p) => [p.name, p.area]), [['عرابة', null]]);
  assert.equal(S.isArabicName('Ramallah'), false);
});
