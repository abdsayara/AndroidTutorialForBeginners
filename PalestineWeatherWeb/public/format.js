// Arabic formatting helpers.

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

/** Escape text for safe insertion into HTML. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Parse an Open-Meteo local date/time string ("2026-10-16" or "2026-10-16T09:00") as wall-clock parts. */
const parts = (iso) => {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  return { y, m, day, h, min, dow: new Date(Date.UTC(y, m - 1, day)).getUTCDay() };
};

export const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Hebron' });

export function dayName(iso) {
  return DAYS[parts(iso).dow];
}

export function relativeDay(iso) {
  const today = todayIso();
  if (iso.slice(0, 10) === today) return 'اليوم';
  const t = parts(today);
  const tomorrow = new Date(Date.UTC(t.y, t.m - 1, t.day + 1)).toISOString().slice(0, 10);
  if (iso.slice(0, 10) === tomorrow) return 'غداً';
  return dayName(iso);
}

export function arabicDate(iso = todayIso()) {
  const p = parts(iso);
  return `${DAYS[p.dow]}، ${p.day} ${MONTHS[p.m - 1]}`;
}

/** "6:13" from "2026-10-16T06:13" or "06:13". */
export function clock(s) {
  const t = s.includes('T') ? s.split('T')[1] : s;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
}

export function hourLabel(iso) {
  const { h } = parts(iso);
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'ص' : 'م'}`;
}

export const deg = (v) => (v == null ? '—' : `${Math.round(v)}°`);
export const round = (v) => (v == null ? '—' : String(Math.round(v)));

export function ago(ms) {
  if (!ms) return '';
  const min = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (min < 60) return `قبل ${min} دقيقة`;
  const h = Math.round(min / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return d === 1 ? 'أمس' : `قبل ${d} أيام`;
}

export function windDir(degrees) {
  const names = ['شمالية', 'شمالية شرقية', 'شرقية', 'جنوبية شرقية', 'جنوبية', 'جنوبية غربية', 'غربية', 'شمالية غربية'];
  return names[Math.floor((((degrees ?? 0) % 360) + 22.5) / 45) % 8];
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function weatherText(code) {
  if (code === 0) return 'صافٍ';
  if (code === 1) return 'صافٍ غالباً';
  if (code === 2) return 'غائم جزئياً';
  if (code === 3) return 'غائم';
  if (code === 45 || code === 48) return 'ضباب';
  if (code >= 51 && code <= 55) return 'رذاذ';
  if (code === 56 || code === 57) return 'رذاذ متجمد';
  if (code === 61) return 'مطر خفيف';
  if (code === 63) return 'مطر';
  if (code === 65) return 'مطر غزير';
  if (code === 66 || code === 67) return 'مطر متجمد';
  if (code >= 71 && code <= 77) return 'ثلج';
  if (code === 80 || code === 81) return 'زخات مطر';
  if (code === 82) return 'زخات غزيرة';
  if (code === 85 || code === 86) return 'زخات ثلج';
  if (code === 95) return 'عاصفة رعدية';
  if (code === 96 || code === 99) return 'عاصفة رعدية مع برد';
  return '—';
}

export function uvText(uv) {
  if (uv == null) return '';
  if (uv < 3) return 'منخفض';
  if (uv < 6) return 'معتدل';
  if (uv < 8) return 'مرتفع';
  if (uv < 11) return 'مرتفع جداً';
  return 'شديد';
}

export function aqiText(aqi) {
  if (aqi <= 20) return 'جيدة جداً';
  if (aqi <= 40) return 'جيدة';
  if (aqi <= 60) return 'مقبولة';
  if (aqi <= 80) return 'رديئة';
  return 'رديئة جداً';
}
