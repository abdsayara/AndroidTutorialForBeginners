// Prayer times from Dar al-Ifta's perpetual timetable («توقيت الصلاة الدهري», Jerusalem 2012):
// a time for every day of the year at al-Aqsa Mosque, on winter time. Every place takes
// Jerusalem's times as they are (the owner's choice: no differences between towns).
// Nothing is worked out by formula, and nothing is fetched.
import { readFileSync } from 'node:fs';

/** "month-day" → [fajr, sunrise, dhuhr, asr, maghrib, isha], minutes after midnight, winter time, at al-Aqsa. */
const TABLE = JSON.parse(readFileSync(new URL('./data/prayer-times.json', import.meta.url), 'utf8'));
const NAMES = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

/** Minutes Palestine's clock is ahead of winter time on that date (60 in summer time, else 0). */
export function summerMinutes(isoDate) {
  const noon = new Date(`${isoDate}T10:00:00Z`);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hebron', hour: '2-digit', hourCycle: 'h23' }).format(noon));
  return (hour - 12) * 60;
}

/** The Hijri date in Arabic, e.g. «24 جمادى الأولى 1448 هـ». */
export function hijriDate(isoDate) {
  const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(`${isoDate}T12:00:00Z`));
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('year')} هـ`;
}

/** The day's prayer times, Jerusalem's for every place, on Palestine's clock: [{ name, time: "HH:MM" }], and the Hijri date. */
export function prayerDay(isoDate) {
  const [, m, d] = isoDate.split('-').map(Number);
  const row = TABLE[`${m}-${d}`];
  const shift = summerMinutes(isoDate);
  const hm = (t) => `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  return { times: row.map((t, i) => ({ name: NAMES[i], time: hm(t + shift) })), hijri: hijriDate(isoDate) };
}
