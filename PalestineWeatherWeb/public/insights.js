// Plain-language readings of a forecast: the rain nowcast, a one-line summary and the
// kind of sky (for the hero's background). Pure functions, shared by the page and tests.

/** Rain this heavy in a 15-minute step counts as rain (mm). */
const WET = 0.1;

/** "ربع ساعة", "ساعة ونصف", "ساعتين" — a duration in minutes, in words. */
export function minutesText(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const hours = h === 0 ? '' : h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : `${h} ساعات`;
  const part = m === 0 ? '' : m === 15 ? 'ربع' : m === 30 ? 'نصف' : m === 45 && !h ? '45 دقيقة' : `${m} دقيقة`;
  if (!hours) return m === 15 ? 'ربع ساعة' : m === 30 ? 'نصف ساعة' : part;
  return part ? `${hours} و${part}` : hours;
}

const intensity = (mm) => (mm >= 2 ? 'غزير' : mm >= 0.5 ? 'متوسط' : 'خفيف');

/**
 * What the rain does over the next hours, from 15-minute steps:
 * {kind: 'starts'|'raining', text, steps: [{time, precip}]} or null when it stays dry.
 */
export function rainNowcast(minutely, nowIso) {
  if (!minutely?.length) return null;
  const nowKey = String(nowIso ?? '').slice(0, 16);
  // The step that contains "now" and the ones after it.
  const first = minutely.findIndex((s, i) => (minutely[i + 1]?.time ?? '9999') > nowKey);
  if (first < 0) return null;
  const steps = minutely.slice(first, first + 8);
  const wet = steps.map((s) => s.precip >= WET);
  if (!wet.some(Boolean)) return null;
  const peak = Math.max(...steps.map((s) => s.precip));
  const kind = intensity(peak);
  const window = steps.length * 15;
  if (wet[0]) {
    const stop = wet.indexOf(false);
    const text = stop < 0
      ? `مطر ${kind} مستمر خلال ${minutesText(window)} القادمة`
      : `مطر ${kind} الآن، ويتوقف بعد ${minutesText(stop * 15)}`;
    return { kind: 'raining', text, steps };
  }
  const start = wet.indexOf(true);
  const after = wet.slice(start).indexOf(false);
  const lasts = after < 0 ? null : after * 15;
  const text = `يبدأ مطر ${kind} بعد ${minutesText(start * 15)}`
    + (lasts ? ` ويستمر ${minutesText(lasts)}` : '');
  return { kind: 'starts', text, steps };
}

const DAY_PART = (h) => (h < 5 ? 'فجراً' : h < 11 ? 'صباحاً' : h < 14 ? 'ظهراً' : h < 17 ? 'بعد الظهر' : h < 20 ? 'مساءً' : 'ليلاً');

/** One or two short sentences a person would say about the day. */
export function summarize(fc, nowIso) {
  const today = fc.days?.[0];
  const parts = [];
  const nowKey = String(nowIso ?? fc.current?.time ?? '').slice(0, 13);
  const todayDate = String(nowIso ?? fc.current?.time ?? '').slice(0, 10);
  const next = (fc.hours ?? []).filter((h) => h.time.slice(0, 13) >= nowKey).slice(0, 24);
  const rain = next.find((h) => h.precipProb >= 50 && h.precip >= 0.2);
  // The 15-minute nowcast is the sharper reading for the next two hours: it wins.
  const nc = rainNowcast(fc.minutely, nowIso ?? fc.current?.time);
  if (nc) {
    parts.push(nc.kind === 'raining' ? 'مطر في هذه الأثناء' : 'مطر قريب خلال الساعتين القادمتين');
  } else if (rain) {
    const h = Number(rain.time.slice(11, 13));
    const when = rain.time.slice(0, 10) === todayDate ? `اليوم ${DAY_PART(h)}` : `غداً ${DAY_PART(h)}`;
    parts.push(rain.time.slice(0, 13) === nowKey ? 'أمطار في هذه الساعات' : `أمطار متوقعة ${when}`);
  } else {
    parts.push('لا أمطار متوقعة في الساعات القادمة');
  }
  if (today && fc.yesterday && today.max != null && fc.yesterday.max != null) {
    const diff = Math.round(today.max - fc.yesterday.max);
    if (Math.abs(diff) >= 2) {
      const n = Math.abs(diff);
      const deg = n === 2 ? 'درجتين' : n <= 10 ? `${n} درجات` : `${n} درجة`;
      parts.push(`${diff < 0 ? 'أبرد' : 'أدفأ'} من أمس بـ${deg}`);
    }
  }
  if (today?.max >= 35) parts.push('حرارة مرتفعة نهاراً');
  else if (today?.min != null && today.min <= 3) parts.push('برد شديد ليلاً واحتمال صقيع');
  else if (today?.windMax >= 40) parts.push(`رياح نشطة تصل إلى ${Math.round(today.windMax)} كم/س`);
  return `${parts.slice(0, 3).join('، ')}.`;
}

/**
 * The kind of sky for the hero background:
 * day | night | dusk | cloudy | rain | storm | fog | snow.
 */
export function skyKind(fc, nowIso) {
  const c = fc.current ?? {};
  const code = c.code ?? 0;
  if (code >= 95) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloudy';
  // Within 40 minutes of sunrise or sunset the sky is warm.
  const now = Date.parse(`${String(nowIso ?? c.time).slice(0, 16)}:00Z`);
  const today = fc.days?.[0];
  for (const t of [today?.sunrise, today?.sunset]) {
    if (t && Math.abs(Date.parse(`${t.slice(0, 16)}:00Z`) - now) <= 40 * 60000) return 'dusk';
  }
  return c.isDay === false ? 'night' : 'day';
}
