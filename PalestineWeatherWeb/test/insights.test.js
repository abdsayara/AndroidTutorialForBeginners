import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minutesText, rainNowcast, summarize, skyKind, dustAlert, clothingAdvice, prayerWeather, seasonCard } from '../public/insights.js';

const steps = (start, values) => values.map((precip, i) => {
  const t = new Date(Date.parse(`${start}:00Z`) + i * 15 * 60000).toISOString().slice(0, 16);
  return { time: t, precip };
});

test('minutesText says durations the way people do', () => {
  assert.equal(minutesText(15), 'ربع ساعة');
  assert.equal(minutesText(30), 'نصف ساعة');
  assert.equal(minutesText(45), '45 دقيقة');
  assert.equal(minutesText(60), 'ساعة');
  assert.equal(minutesText(75), 'ساعة وربع');
  assert.equal(minutesText(90), 'ساعة ونصف');
  assert.equal(minutesText(105), 'ساعة و45 دقيقة');
  assert.equal(minutesText(120), 'ساعتين');
});

test('rainNowcast: dry, starting, raining and stopping', () => {
  assert.equal(rainNowcast(steps('2026-11-10T13:00', [0, 0, 0, 0, 0, 0, 0, 0]), '2026-11-10T13:05'), null);
  const s = rainNowcast(steps('2026-11-10T13:00', [0, 0, 0.3, 0.8, 0.2, 0, 0, 0]), '2026-11-10T13:05');
  assert.equal(s.kind, 'starts');
  assert.equal(s.text, 'يبدأ مطر متوسط بعد نصف ساعة ويستمر 45 دقيقة');
  const r = rainNowcast(steps('2026-11-10T13:00', [0.2, 0.2, 0, 0, 0, 0, 0, 0]), '2026-11-10T13:10');
  assert.equal(r.text, 'مطر خفيف الآن، ويتوقف بعد نصف ساعة');
  const all = rainNowcast(steps('2026-11-10T13:00', [3, 3, 3, 3, 3, 3, 3, 3]), '2026-11-10T13:00');
  assert.equal(all.text, 'مطر غزير مستمر خلال ساعتين القادمة');
  // "now" in the second step: the first step is skipped
  assert.equal(rainNowcast(steps('2026-11-10T13:00', [1, 0, 0, 0, 0, 0, 0, 0, 0]), '2026-11-10T13:20'), null);
});

const fc = (over = {}) => ({
  current: { time: '2026-11-10T13:00', code: 0, isDay: true },
  days: [{ date: '2026-11-10', max: 18, min: 9, windMax: 20, sunrise: '2026-11-10T06:13', sunset: '2026-11-10T16:50' }],
  hours: [],
  yesterday: { max: 22, min: 12 },
  ...over,
});

test('summarize names the rain to come and the change from yesterday', () => {
  assert.equal(summarize(fc()), 'لا أمطار متوقعة في الساعات القادمة، أبرد من أمس بـ4 درجات.');
  const hours = [
    { time: '2026-11-10T13:00', precipProb: 10, precip: 0 },
    { time: '2026-11-10T21:00', precipProb: 70, precip: 1.2 },
  ];
  assert.equal(summarize(fc({ hours, yesterday: { max: 17 } })), 'أمطار متوقعة اليوم ليلاً.');
  const tomorrow = [{ time: '2026-11-11T08:00', precipProb: 80, precip: 2 }];
  assert.equal(summarize(fc({ hours: tomorrow, yesterday: null, days: [{ max: 36, min: 20 }] })), 'أمطار متوقعة غداً صباحاً، حرارة مرتفعة نهاراً.');
  assert.equal(summarize(fc({ yesterday: { max: 16 } })), 'لا أمطار متوقعة في الساعات القادمة، أدفأ من أمس بـدرجتين.');
});

test('skyKind picks the background from the weather and the hour', () => {
  assert.equal(skyKind(fc()), 'day');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T22:00', code: 1, isDay: false } })), 'night');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T16:40', code: 0, isDay: true } })), 'dusk');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T13:00', code: 63, isDay: true } })), 'rain');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T13:00', code: 95 } })), 'storm');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T13:00', code: 3 } })), 'cloudy');
  assert.equal(skyKind(fc({ current: { time: '2026-11-10T13:00', code: 45 } })), 'fog');
});

test('summarize follows the nowcast when it sees rain the hourly forecast missed', () => {
  const f = fc({ minutely: steps('2026-11-10T13:00', [0, 0, 0.4, 0.4, 0, 0, 0, 0]) });
  assert.equal(summarize(f), 'مطر قريب خلال الساعتين القادمتين، أبرد من أمس بـ4 درجات.');
});

test('dustAlert warns from 100 µg/m³, heavy from 300', () => {
  assert.equal(dustAlert({ dust: 20, dustMax: 80 }), null);
  const later = dustAlert({ time: '2026-11-10T09:00', dust: 40, dustMax: 180, dustMaxAt: '2026-11-10T15:00' });
  assert.equal(later.heavy, false);
  assert.match(later.text, /^غبار متوسط نحو الساعة 3:00 م\./);
  const tmw = dustAlert({ time: '2026-11-10T20:00', dust: 40, dustMax: 180, dustMaxAt: '2026-11-11T07:00' });
  assert.match(tmw.text, /^غبار متوسط غداً نحو الساعة 7:00 ص\./);
  const now = dustAlert({ dust: 350, dustMax: 420 });
  assert.equal(now.title, 'موجة غبار كثيف');
  assert.match(now.text, /^غبار كثيف الآن\. أغلق النوافذ/);
});

test('clothingAdvice follows the temperature, rain and wind', () => {
  assert.equal(clothingAdvice({ max: 33, min: 22 }), 'ملابس صيفية خفيفة وفاتحة، وقبعة للشمس');
  assert.equal(clothingAdvice({ max: 26, min: 14 }), 'ملابس خفيفة نهاراً، وطبقة رقيقة للمساء');
  assert.equal(clothingAdvice({ max: 14, min: 7, precipProbMax: 70, windMax: 40 }), 'كنزة وجاكيت، ومظلة أو جاكيت للمطر وشيء يقي من الرياح');
  assert.equal(clothingAdvice({ max: 8, min: 2 }), 'معطف شتوي وطبقات دافئة');
});

test('prayerWeather finds the next prayer and its hour', () => {
  const times = [{ name: 'الفجر', time: '04:55' }, { name: 'الشروق', time: '06:13' }, { name: 'الظهر', time: '11:52' }, { name: 'المغرب', time: '17:31' }];
  const hours = [{ time: '2026-11-10T17:00', temp: 16, code: 0 }];
  const p = prayerWeather(times, hours, '2026-11-10T16:20');
  assert.deepEqual([p.name, p.minutes, p.hour.temp], ['المغرب', 71, 16]);
  assert.equal(prayerWeather(times, hours, '2026-11-10T05:30').name, 'الظهر', 'sunrise is not a prayer');
  const fajr = prayerWeather(times, [{ time: '2026-11-11T04:00', temp: 9, code: 0 }], '2026-11-10T20:00');
  assert.deepEqual([fajr.name, fajr.tomorrow, fajr.minutes, fajr.hour.temp], ['الفجر', true, 535, 9]);
});

test('seasonCard: olive harvest days, frost nights, nothing in between', () => {
  const name = (d) => d;
  const days = [
    { date: 'الأحد', precipProbMax: 10, windMax: 15, max: 22, min: 12 },
    { date: 'الاثنين', precipProbMax: 70, windMax: 15, max: 18, min: 10 },
    { date: 'الثلاثاء', precipProbMax: 5, windMax: 12, max: 24, min: 13 },
  ];
  assert.equal(seasonCard(days, '2026-11-10', name).text, 'أنسب أيام القطاف هذا الأسبوع: الأحد، الثلاثاء.');
  assert.equal(seasonCard([{ ...days[1] }], '2026-10-20', name).text, 'لا أيام مناسبة للقطاف هذا الأسبوع بسبب المطر أو الرياح.');
  assert.equal(seasonCard(days, '2027-01-10', name), null);
  assert.match(seasonCard([{ date: 'الأربعاء', min: 1 }], '2027-01-10', name).text, /^ليالٍ باردة قد يتكوّن فيها الصقيع: الأربعاء\./);
  assert.equal(seasonCard(days, '2026-06-01', name), null);
});
