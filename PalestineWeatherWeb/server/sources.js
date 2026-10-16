// Upstream data sources: URL builders and pure parsers (unit-tested in test/).
import { CITIES, describePlace } from './cities.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// ---------------------------------------------------------------- Open-Meteo

export function forecastUrl(lat, lon) {
  return `${FORECAST}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m' +
    '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset' +
    '&timezone=auto&forecast_days=7';
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function parseForecast(o) {
  const c = o.current ?? {};
  const h = o.hourly ?? {};
  const d = o.daily ?? {};
  return {
    current: {
      temp: num(c.temperature_2m),
      apparent: num(c.apparent_temperature),
      humidity: num(c.relative_humidity_2m),
      wind: num(c.wind_speed_10m),
      windDir: num(c.wind_direction_10m),
      code: num(c.weather_code) ?? 0,
      isDay: c.is_day !== 0,
      time: c.time ?? null,
    },
    hours: (h.time ?? []).map((t, i) => ({
      time: t,
      temp: num(h.temperature_2m?.[i]),
      precipProb: num(h.precipitation_probability?.[i]) ?? 0,
      precip: num(h.precipitation?.[i]) ?? 0,
      code: num(h.weather_code?.[i]) ?? 0,
      wind: num(h.wind_speed_10m?.[i]),
      isDay: h.is_day?.[i] !== 0,
    })),
    days: (d.time ?? []).map((t, i) => ({
      date: t,
      code: num(d.weather_code?.[i]) ?? 0,
      max: num(d.temperature_2m_max?.[i]),
      min: num(d.temperature_2m_min?.[i]),
      precipProbMax: num(d.precipitation_probability_max?.[i]) ?? 0,
      precipSum: num(d.precipitation_sum?.[i]) ?? 0,
      windMax: num(d.wind_speed_10m_max?.[i]),
      uvMax: num(d.uv_index_max?.[i]),
      sunrise: d.sunrise?.[i] ?? null,
      sunset: d.sunset?.[i] ?? null,
    })),
  };
}

export function airUrl(lat, lon) {
  return `${AIR}?latitude=${lat}&longitude=${lon}&current=european_aqi`;
}

export const parseAir = (o) => ({ aqi: num(o?.current?.european_aqi) });

/** Open-Meteo returns an object for one location and an array for several. */
const asArray = (o) => (Array.isArray(o) ? o : [o]);

export function citiesNowUrl(cities = CITIES) {
  return `${FORECAST}?latitude=${cities.map((c) => c.lat).join(',')}` +
    `&longitude=${cities.map((c) => c.lon).join(',')}` +
    '&current=temperature_2m,wind_speed_10m,weather_code' +
    '&hourly=precipitation_probability&forecast_hours=1&timezone=auto';
}

export function parseCitiesNow(o, cities = CITIES) {
  const arr = asArray(o);
  const out = {};
  cities.forEach((c, i) => {
    const x = arr[i];
    if (!x) return;
    out[c.id] = {
      temp: num(x.current?.temperature_2m),
      wind: num(x.current?.wind_speed_10m),
      code: num(x.current?.weather_code) ?? 0,
      precipProb: num(x.hourly?.precipitation_probability?.[0]) ?? 0,
    };
  });
  return out;
}

/** Regular 0.25° grid covering Palestine, for the rain / cloud / storm map layers. */
export function gridPoints() {
  const pts = [];
  for (let lat = 29.5; lat <= 33.25 + 1e-9; lat += 0.25) {
    for (let lon = 34.25; lon <= 35.75 + 1e-9; lon += 0.25) pts.push([+lat.toFixed(2), +lon.toFixed(2)]);
  }
  return pts;
}

export function gridUrl(points = gridPoints()) {
  return `${FORECAST}?latitude=${points.map((p) => p[0]).join(',')}` +
    `&longitude=${points.map((p) => p[1]).join(',')}` +
    '&hourly=precipitation,cloud_cover,cape&past_hours=3&forecast_hours=7&timezone=auto';
}

export function parseGrid(o, points = gridPoints(), now = new Date()) {
  const arr = asArray(o);
  const times = arr[0]?.hourly?.time ?? [];
  const pick = (key) => arr.map((x) => (x.hourly?.[key] ?? []).map(num));
  // Local "now" in the upstream timezone: Open-Meteo gives utc_offset_seconds.
  const offset = (arr[0]?.utc_offset_seconds ?? 0) * 1000;
  const localNow = new Date(now.getTime() + offset).toISOString().slice(0, 13);
  let nowIndex = times.findIndex((t) => t.slice(0, 13) >= localNow);
  if (nowIndex < 0) nowIndex = Math.max(0, times.length - 1);
  return { points, times, nowIndex, precip: pick('precipitation'), cloud: pick('cloud_cover'), cape: pick('cape') };
}

// ---------------------------------------------------------------- USGS earthquakes

export function quakesUrl(days, now = new Date()) {
  const start = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
  return 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' +
    '&minlatitude=29&maxlatitude=34&minlongitude=33&maxlongitude=37' +
    `&starttime=${start}&minmagnitude=1&orderby=time`;
}

export function parseQuakes(o) {
  return (o.features ?? []).map((f) => {
    const [lon, lat, depth] = f.geometry?.coordinates ?? [0, 0, 0];
    const p = f.properties ?? {};
    return {
      id: f.id,
      mag: num(p.mag) ?? 0,
      lat, lon,
      depthKm: num(depth) ?? 0,
      time: p.time,
      place: describePlace(lat, lon),
      felt: (p.felt ?? 0) > 0,
    };
  });
}

// ---------------------------------------------------------------- Aladhan prayer times

export const PRAYER_METHODS = {
  5: 'الهيئة المصرية العامة للمساحة',
  3: 'رابطة العالم الإسلامي',
  4: 'أم القرى — مكة',
  23: 'وزارة الأوقاف الأردنية',
};

/** Today's date (YYYY-MM-DD) on Palestine's clock, whatever the server's timezone. */
export const palestineDate = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Hebron' });

export function prayerUrl(lat, lon, method, isoDate = palestineDate()) {
  const [y, m, d] = isoDate.split('-');
  return `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lon}&method=${method}`;
}

const PRAYERS = [['Fajr', 'الفجر'], ['Sunrise', 'الشروق'], ['Dhuhr', 'الظهر'], ['Asr', 'العصر'], ['Maghrib', 'المغرب'], ['Isha', 'العشاء']];

export function parsePrayer(o) {
  const d = o.data;
  const h = d.date.hijri;
  return {
    times: PRAYERS.map(([k, ar]) => ({ name: ar, time: String(d.timings[k]).slice(0, 5) })),
    hijri: `${String(h.day).replace(/^0/, '')} ${h.month.ar} ${h.year} هـ`,
  };
}

/** Bearing to the Kaaba in degrees from true north. */
export function qiblaBearing(lat, lon) {
  const rad = (x) => (x * Math.PI) / 180;
  const kLat = rad(21.4225);
  const p = rad(lat);
  const dL = rad(39.8262) - rad(lon);
  const b = Math.atan2(Math.sin(dL), Math.cos(p) * Math.tan(kLat) - Math.sin(p) * Math.cos(dL));
  return ((b * 180) / Math.PI + 360) % 360;
}

// ---------------------------------------------------------------- Currency

export const CURRENCIES = [
  ['USD', 'دولار أمريكي'], ['JOD', 'دينار أردني'], ['EUR', 'يورو'], ['EGP', 'جنيه مصري'],
  ['GBP', 'جنيه إسترليني'], ['SAR', 'ريال سعودي'], ['AED', 'درهم إماراتي'], ['TRY', 'ليرة تركية'],
];

export const RATES_URL = 'https://open.er-api.com/v6/latest/ILS';

/** The API gives units of each currency per 1 ILS; invert to ILS per unit. */
export function parseRates(o) {
  const rates = {};
  for (const [code, name] of CURRENCIES) {
    const r = num(o.rates?.[code]);
    if (r && r > 0) rates[code] = { name, ils: 1 / r };
  }
  return { rates, updated: o.time_last_update_utc ?? null };
}

// ---------------------------------------------------------------- Google News RSS

export const NEWS_TOPICS = {
  weather: { label: 'الطقس', query: 'طقس فلسطين' },
  climate: { label: 'المناخ', query: 'تغير المناخ فلسطين' },
  farming: { label: 'الزراعة', query: 'الزراعة فلسطين الطقس' },
};

export function newsUrl(topic) {
  const q = encodeURIComponent(NEWS_TOPICS[topic].query);
  return `https://news.google.com/rss/search?q=${q}&hl=ar&gl=PS&ceid=PS:ar`;
}

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&amp;/g, '&')
  .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
};

export function parseRss(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const it = m[1];
    const source = tag(it, 'source');
    let title = tag(it, 'title');
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const link = tag(it, 'link');
    if (!/^https?:\/\//.test(link)) continue;
    const pub = Date.parse(tag(it, 'pubDate'));
    items.push({ title, link, source, published: Number.isNaN(pub) ? null : pub });
  }
  return items.slice(0, 30);
}
