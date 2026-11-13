// Prayer times from Dar al-Ifta's perpetual timetable («توقيت الصلاة الدهري», Jerusalem 2012):
// a time for every day of the year at al-Aqsa Mosque, on winter time, and a few minutes'
// difference for other towns. Nothing is worked out by formula, and nothing is fetched.
import { readFileSync } from 'node:fs';

/** "month-day" → [fajr, sunrise, dhuhr, asr, maghrib, isha], minutes after midnight, winter time, at al-Aqsa. */
const TABLE = JSON.parse(readFileSync(new URL('./data/prayer-times.json', import.meta.url), 'utf8'));
const NAMES = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

/** The timetable's own differences: minutes after Jerusalem (before it when negative). */
const TOWNS = [
  // No difference: Jerusalem, Ramallah, Bethlehem, Jenin, Nablus, Nazareth, Umm al-Fahm.
  [31.778, 35.235, 0], [31.903, 35.204, 0], [31.705, 35.203, 0], [32.461, 35.300, 0], [32.222, 35.262, 0], [32.699, 35.303, 0], [32.519, 35.153, 0],
  // A minute before: Jericho, Tiberias, Safed, Beisan.
  [31.857, 35.460, -1], [32.794, 35.531, -1], [32.966, 35.496, -1], [32.497, 35.497, -1],
  // A minute after: Hebron, Idna, Dura, Beit Awwa, Haifa, Acre, Tulkarm, Kafr Qasim, Taybeh.
  [31.530, 35.094, 1], [31.558, 34.976, 1], [31.507, 35.028, 1], [31.508, 34.952, 1], [32.794, 34.989, 1], [32.928, 35.076, 1], [32.310, 35.029, 1], [32.114, 34.977, 1], [32.266, 35.010, 1],
  // A minute and a half after: Lod, Ramla, Qalqilya.
  [31.951, 34.888, 1.5], [31.929, 34.867, 1.5], [32.190, 34.970, 1.5],
  // Two minutes after: Beersheba, Jaffa. Three: Gaza. Four: Rafah, Khan Younis, Deir al-Balah.
  [31.252, 34.791, 2], [32.050, 34.752, 2], [31.501, 34.467, 3], [31.287, 34.259, 4], [31.346, 34.306, 4], [31.418, 34.351, 4],
];
const AQSA_LON = 35.2356;

/**
 * Minutes a place is after Jerusalem. A town the timetable names (or a place within 6 km of
 * one) takes its difference; anywhere else takes the same rule the timetable's own numbers
 * follow: four minutes for each degree of longitude west of al-Aqsa. Half minutes round up.
 */
export function minutesAfterJerusalem(lat, lon) {
  let best = null;
  let bestKm = 6;
  for (const [la, lo, diff] of TOWNS) {
    const km = Math.hypot((lat - la) * 111, (lon - lo) * 111 * Math.cos((lat * Math.PI) / 180));
    if (km < bestKm) { best = diff; bestKm = km; }
  }
  const diff = best ?? (AQSA_LON - lon) * 4;
  return Math.floor(diff + 0.5);
}

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

/** The day's prayer times at a place, on Palestine's clock: [{ name, time: "HH:MM" }], and the Hijri date. */
export function prayerDay(lat, lon, isoDate) {
  const [, m, d] = isoDate.split('-').map(Number);
  const row = TABLE[`${m}-${d}`];
  const shift = minutesAfterJerusalem(lat, lon) + summerMinutes(isoDate);
  const hm = (t) => `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  return { times: row.map((t, i) => ({ name: NAMES[i], time: hm(t + shift) })), hijri: hijriDate(isoDate) };
}
