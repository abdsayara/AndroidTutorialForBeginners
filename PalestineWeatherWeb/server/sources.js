// Upstream data sources: URL builders and pure parsers (unit-tested in test/).
import { CITIES, describePlace, areaCity } from './cities.js';
import { OUTER } from '../public/shape.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// ---------------------------------------------------------------- Open-Meteo

export function forecastUrl(lat, lon) {
  return `${FORECAST}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m' +
    '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset' +
    // Rain every 15 minutes for the next 3 hours (the nowcast), and yesterday for comparison.
    '&minutely_15=precipitation&forecast_minutely_15=12&past_minutely_15=0&past_days=1' +
    '&timezone=auto&forecast_days=14';
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function parseForecast(o) {
  const c = o.current ?? {};
  const h = o.hourly ?? {};
  const d = o.daily ?? {};
  const m = o.minutely_15 ?? {};
  // past_days=1 adds yesterday: keep its high and low for comparison, not in the lists.
  const today = (c.time ?? '').slice(0, 10);
  const isPast = (t) => today && String(t).slice(0, 10) < today;
  const out = parseForecastLists(o, c, h, d);
  const past = out.days.filter((x) => isPast(x.date));
  return {
    ...out,
    days: out.days.filter((x) => !isPast(x.date)),
    hours: out.hours.filter((x) => !isPast(x.time)),
    yesterday: past.length ? { max: past.at(-1).max, min: past.at(-1).min } : null,
    minutely: (m.time ?? []).map((t, i) => ({ time: t, precip: num(m.precipitation?.[i]) ?? 0 })),
  };
}

function parseForecastLists(o, c, h, d) {
  return {
    // Metres above sea level (negative below it), from Open-Meteo's 90 m terrain model.
    elevation: num(o.elevation),
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
  return `${AIR}?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,dust&hourly=dust&forecast_days=2&timezone=auto`;
}

/** Air quality now, plus the dust (µg/m³) now and at its worst in the next 24 hours. */
export function parseAir(o) {
  const c = o?.current ?? {};
  const now = String(c.time ?? '').slice(0, 13);
  const times = o?.hourly?.time ?? [];
  const dust = o?.hourly?.dust ?? [];
  const next = times.map((t, i) => [t, num(dust[i])]).filter(([t, v]) => v != null && t.slice(0, 13) >= now).slice(0, 24);
  const peak = next.reduce((best, cur) => (cur[1] > (best?.[1] ?? -1) ? cur : best), null);
  return {
    time: c.time ?? null,
    aqi: num(c.european_aqi),
    pm10: num(c.pm10),
    dust: num(c.dust),
    dustMax: peak ? peak[1] : null,
    dustMaxAt: peak ? peak[0] : null,
  };
}

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
      elevation: num(x.elevation),
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
    // Six hours back and twelve ahead for the animated timeline; wind for the moving streaks.
    '&hourly=precipitation,cloud_cover,cape,wind_speed_10m,wind_direction_10m&past_hours=6&forecast_hours=13&timezone=auto';
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
  return {
    points, times, nowIndex,
    precip: pick('precipitation'), cloud: pick('cloud_cover'), cape: pick('cape'),
    wind: pick('wind_speed_10m'), windDir: pick('wind_direction_10m'),
  };
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

// ---------------------------------------------------------------- dates, and the qibla

/** Today's date (YYYY-MM-DD) on Palestine's clock, whatever the server's timezone. */
export const palestineDate = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Hebron' });

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

// ---------------------------------------------------------------- Places: villages, towns, search, reverse geocoding


const K = Math.cos((31.5 * Math.PI) / 180);
const OUTLINE = [...OUTER.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);

/** True when the point lies inside historic Palestine (same outline as the map). */
export function insidePalestine(lat, lon) {
  const x = (lon - 34.1) * 92 * K;
  const y = (33.4 - lat) * 92;
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Coordinates the API accepts for free points (a little wider than the outline). */
export const inBounds = (lat, lon) => lat >= 29.3 && lat <= 33.5 && lon >= 34.0 && lon <= 36.0;

const PLACE_KIND = { city: 'c', town: 't', village: 'v' };

/** Arabic script and no Hebrew letters: only such names are shown. */
export const isArabicName = (s) => typeof s === 'string' && /[\u0600-\u06FF]/.test(s) && !/[\u0590-\u05FF]/.test(s);
/** First Arabic name among the candidates, or null. */
const arabic = (...names) => names.find(isArabicName) ?? null;

/** All cities, towns and villages in Palestine with names, from OpenStreetMap via Overpass. */
export function placesUrl() {
  const q = '[out:json][timeout:90];node["place"~"^(city|town|village)$"]["name"](29.45,34.2,33.35,35.9);out body;';
  return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
}

/** Compact list: [nameAr, lat, lon, kind] — kind c=city, t=town, v=village. */
export function parsePlaces(o) {
  const out = [];
  for (const e of o.elements ?? []) {
    const t = e.tags ?? {};
    // Arabic names only: places with no Arabic name are left out rather than shown in Hebrew.
    const name = arabic(t['name:ar'], t.name, t['official_name:ar'], t['alt_name:ar']);
    if (!name || typeof e.lat !== 'number' || !insidePalestine(e.lat, e.lon)) continue;
    out.push([name, +e.lat.toFixed(4), +e.lon.toFixed(4), PLACE_KIND[t.place] ?? 'v']);
  }
  // Bigger places first so the map can label them before small villages.
  const rank = { c: 0, t: 1, v: 2 };
  return out.sort((a, b) => rank[a[3]] - rank[b[3]]);
}

/** Name of the village / neighbourhood at a point, in Arabic, from OpenStreetMap Nominatim. */
export function reverseUrl(lat, lon) {
  return `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&accept-language=ar`;
}

// Occupation-era administrative names (regional councils, districts, "Judea and Samaria")
// that OpenStreetMap and GeoNames attach to Palestinian places. Never shown as an area.
const ISRAELI_ADMIN = /مجلس|إقليمي|اقليمي|لواء|يهودا|السامرة|المستوطن|منطقة [أا]|יהודה|מועצה/;
const palestinianName = (s) => (isArabicName(s) && !ISRAELI_ADMIN.test(s) ? s : null);

/** The Palestinian city a place belongs to ("راس الجورة" → "الخليل", "ترمسعيا" → "رام الله"). */
export const palestinianArea = (lat, lon) =>
  (Number.isFinite(lat) && Number.isFinite(lon) ? areaCity(lat, lon).name : null);

export function parseReverse(o, lat = Number(o.lat), lon = Number(o.lon)) {
  const a = o.address ?? {};
  // Most precise first: a neighbourhood inside a city beats the city's own name.
  // Arabic only: a component that came back in Hebrew (no Arabic name in OSM) is skipped;
  // the caller falls back to "near <city>" when nothing Arabic is left.
  const name = [a.hamlet, a.village, a.neighbourhood, a.suburb, a.quarter, a.town, a.city, a.municipality, o.name].map(palestinianName).find(Boolean) ?? null;
  const town = [a.town, a.city, a.municipality].map(palestinianName).find(Boolean) ?? null;
  // A Palestinian governorate ("محافظة رام الله والبيرة") when OSM has one, else our nearest city.
  const governorate = [a.county, a.state_district, a.state].map(palestinianName)
    .find((s) => s && /^محافظة\s/.test(s))?.replace(/^محافظة\s+/, '');
  // The area is the Palestinian town, governorate or city, never a council or district.
  const area = (town && town !== name ? town : null) ?? governorate ?? palestinianArea(lat, lon);
  return { name, area: area !== name ? area : null };
}

/** Arabic name of the nearest village/town in our places list within `maxKm`, or null. */
export function nearestPlaceName(places, lat, lon, maxKm = 1) {
  let best = null;
  let bestD = maxKm;
  const k = Math.cos((lat * Math.PI) / 180);
  for (const [name, la, lo] of places ?? []) {
    const d = Math.hypot((la - lat) * 111.2, (lo - lon) * 111.2 * k);
    if (d <= bestD) { best = name; bestD = d; }
  }
  return best;
}

/** A name as people type it: no harakat, one alef, ة as ه, ى as ي, and no «ال» or spaces. */
export const searchKey = (name) => String(name ?? '')
  .replace(/[\u064b-\u0652\u0670\u0640]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/(^|\s)ال/g, '$1').replace(/[\s\-'’`.]+/g, '');

/**
 * Search the towns and villages on the map by name, so whatever the map shows can be found.
 * Names that start with the words typed come first, then names that contain them; within
 * each, cities before towns before villages. Names spelled a little differently come last.
 */
export function searchPlaces(places, term) {
  const q = searchKey(term);
  if (!q) return [];
  const rank = { c: 0, t: 1, v: 2 };
  const hits = [];
  // A looser second look, without the long vowels: «بيت امر» finds «بيت أومر».
  const loose = (k) => k.replace(/[اوي]/g, '');
  const q2 = loose(q);
  for (const [name, lat, lon, kind] of places ?? []) {
    const key = searchKey(name);
    const at = key.indexOf(q);
    if (at >= 0) hits.push({ name, lat, lon, kind, order: (at === 0 ? 0 : 10) + (rank[kind] ?? 2) });
    else if (q2.length >= 3 && loose(key).startsWith(q2)) hits.push({ name, lat, lon, kind, order: 20 + (rank[kind] ?? 2) });
  }
  return hits.sort((a, b) => a.order - b.order || a.name.length - b.name.length).slice(0, 30)
    .map(({ name, lat, lon }) => ({ name, lat, lon, area: palestinianArea(lat, lon), elevation: null, population: 0 }));
}
