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
 * day | night | cloudy | rain | storm | fog | snow.
 */
export function skyKind(fc, nowIso) {
  const c = fc.current ?? {};
  const code = c.code ?? 0;
  if (code >= 95) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloudy';
  return c.isDay === false ? 'night' : 'day';
}

// ---------------------------------------------------------------- Palestinian touches

/** "7:00 ص", "3:30 م". */
const clock12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'ص' : 'م'}`;
};

/** Khamaseen and dust: a warning when dust (µg/m³) passes 100 in the next 24 hours. */
export function dustAlert(air) {
  const peak = air?.dustMax;
  if (peak == null || peak < 100) return null;
  const heavy = peak >= 300;
  const nowBad = (air.dust ?? 0) >= 100;
  const at = String(air.dustMaxAt ?? '');
  const tomorrow = air.time && at.slice(0, 10) > String(air.time).slice(0, 10);
  const when = nowBad ? 'الآن' : at
    ? `${tomorrow ? 'غداً ' : ''}نحو الساعة ${clock12(at.slice(11, 16))}`
    : 'خلال الساعات القادمة';
  return {
    heavy,
    title: heavy ? 'موجة غبار كثيف' : 'غبار في الأجواء',
    text: `${heavy ? 'غبار كثيف' : 'غبار متوسط'} ${when}. ${heavy
      ? 'أغلق النوافذ وقلّل الخروج، خاصة لمرضى الربو والحساسية وكبار السن.'
      : 'يُفضّل لمرضى الربو والحساسية تجنّب المجهود في الخارج.'}`,
  };
}

/** "شو نلبس؟" for a day: what to wear from its high, low, rain and wind. */
export function clothingAdvice(day) {
  if (!day || day.max == null) return null;
  const { max, min } = day;
  let text;
  if (max >= 30) text = 'ملابس صيفية خفيفة وفاتحة، وقبعة للشمس';
  else if (max >= 24) text = min != null && min < 17 ? 'ملابس خفيفة نهاراً، وطبقة رقيقة للمساء' : 'ملابس خفيفة';
  else if (max >= 17) text = 'قميص بأكمام طويلة أو كنزة خفيفة';
  else if (max >= 10) text = 'كنزة وجاكيت';
  else text = 'معطف شتوي وطبقات دافئة';
  const extra = [];
  if ((day.precipProbMax ?? 0) >= 50) extra.push('مظلة أو جاكيت للمطر');
  if ((day.windMax ?? 0) >= 35) extra.push('شيء يقي من الرياح');
  return extra.length ? `${text}، و${extra.join(' و')}` : text;
}

const hm = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + m; };

/**
 * The next prayer and the weather at its hour: {name, time, minutes, tomorrow, hour},
 * hour being the forecast hour (or null). After the last prayer: tomorrow's Fajr.
 */
export function prayerWeather(times, hours, nowIso) {
  const prayers = (times ?? []).filter((t) => t.name !== 'الشروق');
  if (!prayers.length) return null;
  const now = String(nowIso);
  const nowMin = hm(now.slice(11, 16));
  const today = prayers.find((t) => hm(t.time) > nowMin);
  const next = today ?? prayers[0];
  let date = now.slice(0, 10);
  if (!today) {
    const [y, m, d] = date.split('-').map(Number);
    date = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  }
  const hourKey = `${date}T${String(Math.floor(hm(next.time) / 60)).padStart(2, '0')}`;
  return {
    name: next.name,
    time: next.time,
    minutes: hm(next.time) - nowMin + (today ? 0 : 1440),
    tomorrow: !today,
    hour: (hours ?? []).find((h) => h.time.slice(0, 13) === hourKey) ?? null,
  };
}

/** A frost warning for the cold months (December to February), or null. */
export function seasonCard(days, dateIso, dayName) {
  const [, m] = String(dateIso).slice(0, 10).split('-').map(Number);
  const week = (days ?? []).slice(0, 7);
  if (m === 12 || m === 1 || m === 2) {
    const frost = week.slice(0, 3).filter((x) => x.min != null && x.min <= 3).map((x) => dayName(x.date));
    if (!frost.length) return null;
    return { title: 'تحذير صقيع', text: `ليالٍ باردة قد يتكوّن فيها الصقيع: ${frost.join('، ')}. غطِّ المزروعات الحساسة ليلاً.` };
  }
  return null;
}

// ---------------------------------------------------------------- sun and moon

const minutesOf = (iso) => { const t = String(iso).slice(11, 16); return hm(t); };

/**
 * The sun's day: {length: "10 س 52 د", progress: 0..1 between sunrise and sunset, up}.
 * progress < 0 before sunrise, > 1 after sunset.
 */
export function sunDay(sunrise, sunset, nowIso) {
  if (!sunrise || !sunset) return null;
  const rise = minutesOf(sunrise);
  const set = minutesOf(sunset);
  const now = minutesOf(nowIso);
  const len = set - rise;
  return {
    length: `${Math.floor(len / 60)} س ${len % 60} د`,
    progress: (now - rise) / len,
    up: now >= rise && now <= set,
  };
}

/** Days since a known new moon (6 Jan 2000, 18:14 UTC), over the synodic month. */
const SYNODIC = 29.530588853;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const PHASES = [
  [0.0339, 'محاق'], [0.2161, 'هلال متزايد'], [0.2839, 'تربيع أول'], [0.4661, 'أحدب متزايد'],
  [0.5339, 'بدر'], [0.7161, 'أحدب متناقص'], [0.7839, 'تربيع أخير'], [0.9661, 'هلال متناقص'], [1, 'محاق'],
];

/** The moon tonight: {name, age (days), fraction 0..1 of the cycle, lit 0..1}. */
export function moonPhase(when = new Date()) {
  const days = (when.getTime() - NEW_MOON) / 86400000;
  const fraction = (((days / SYNODIC) % 1) + 1) % 1;
  return {
    name: PHASES.find(([f]) => fraction < f)[1],
    age: Math.round(fraction * SYNODIC),
    fraction,
    lit: (1 - Math.cos(2 * Math.PI * fraction)) / 2,
  };
}

// ---------------------------------------------------------------- what to wear: the avatar

/** The avatar's outfit for a day: cold / cool / mild / warm, and whether it carries an umbrella. */
export function wearKind(day) {
  if (!day) return { kind: 'mild', rain: false };
  const max = day.max ?? 20;
  const kind = max < 12 ? 'cold' : max < 18 ? 'cool' : max < 26 ? 'mild' : 'warm';
  return { kind, rain: (day.precipProbMax ?? 0) >= 50 };
}
