// Demo mode (DEMO=1): a fake `fetch` that answers every upstream URL with generated,
// plausible-looking sample data, so the site can be tried and tested offline.
// The UI shows a banner whenever demo data is in use.

const pad = (n) => String(n).padStart(2, '0');
const isoHour = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:00`;
const isoDay = (d) => isoHour(d).slice(0, 10);
const OFFSET = 3 * 3600 * 1000; // Palestine summer time; good enough for samples

/** Deterministic pseudo-random in [0,1) from numbers. */
function rnd(...xs) {
  let h = 2166136261;
  for (const x of xs) {
    h ^= Math.round(x * 1000);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// Base temperature by place: warmer in the Jordan valley and south, cooler in the hills.
const baseTemp = (lat, lon) => 30 - (lat - 29.5) * 2.2 - (lon > 35.0 && lon < 35.4 && lat > 31.4 ? 4 : 0) + (lon > 35.4 ? 6 : 0);

function forecastFor(lat, lon, now) {
  const local = new Date(now.getTime() + OFFSET);
  const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  const t0 = baseTemp(lat, lon);
  const hourly = { time: [], temperature_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], is_day: [] };
  for (let i = 0; i < 168; i++) {
    const t = new Date(start.getTime() + i * 3600000);
    const h = t.getUTCHours();
    const day = Math.floor(i / 24);
    const rainy = day === 3 || day === 4;
    const prob = rainy ? Math.round(30 + 50 * rnd(lat, lon, i)) : Math.round(10 * rnd(lat, i));
    hourly.time.push(isoHour(t));
    hourly.temperature_2m.push(+(t0 - (rainy ? 5 : 0) + 6 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + rnd(lon, i) * 2).toFixed(1));
    hourly.precipitation_probability.push(prob);
    hourly.precipitation.push(prob > 60 ? +(rnd(i, lat) * 3).toFixed(1) : 0);
    hourly.weather_code.push(prob > 60 ? 63 : prob > 35 ? 80 : rnd(lat, h) > 0.6 ? 2 : 0);
    hourly.wind_speed_10m.push(Math.round(8 + 14 * rnd(lon, i)));
    hourly.is_day.push(h >= 6 && h < 18 ? 1 : 0);
  }
  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], precipitation_sum: [], wind_speed_10m_max: [], uv_index_max: [], sunrise: [], sunset: [] };
  for (let d = 0; d < 7; d++) {
    const sl = hourly.temperature_2m.slice(d * 24, d * 24 + 24);
    const pr = hourly.precipitation_probability.slice(d * 24, d * 24 + 24);
    const date = isoDay(new Date(start.getTime() + d * 86400000));
    daily.time.push(date);
    daily.temperature_2m_max.push(Math.max(...sl));
    daily.temperature_2m_min.push(Math.min(...sl));
    daily.precipitation_probability_max.push(Math.max(...pr));
    daily.precipitation_sum.push(+hourly.precipitation.slice(d * 24, d * 24 + 24).reduce((a, b) => a + b, 0).toFixed(1));
    daily.wind_speed_10m_max.push(Math.max(...hourly.wind_speed_10m.slice(d * 24, d * 24 + 24)));
    daily.weather_code.push(Math.max(...pr) > 60 ? 63 : Math.max(...pr) > 35 ? 80 : 2);
    daily.uv_index_max.push(Math.max(...pr) > 60 ? 3 : 6);
    daily.sunrise.push(`${date}T06:13`);
    daily.sunset.push(`${date}T17:31`);
  }
  const ci = local.getUTCHours();
  return {
    utc_offset_seconds: OFFSET / 1000,
    current: {
      time: isoHour(local), temperature_2m: hourly.temperature_2m[ci], relative_humidity_2m: 45,
      apparent_temperature: hourly.temperature_2m[ci] + 1, is_day: hourly.is_day[ci], weather_code: hourly.weather_code[ci],
      wind_speed_10m: hourly.wind_speed_10m[ci], wind_direction_10m: 270,
    },
    hourly, daily,
  };
}

function gridFor(lat, lon, now) {
  const local = new Date(now.getTime() + OFFSET);
  const time = []; const precipitation = []; const cloud_cover = []; const cape = [];
  for (let i = -3; i < 7; i++) {
    const t = new Date(Math.floor(local.getTime() / 3600000) * 3600000 + i * 3600000);
    time.push(isoHour(t));
    // A rain band drifting east from the sea over the north and centre.
    const band = Math.exp(-(((lon - 34.4 - i * 0.08) / 0.35) ** 2)) * Math.exp(-(((lat - 32.3) / 0.7) ** 2));
    precipitation.push(+(band * 5 * (0.6 + 0.4 * rnd(lat, lon, i))).toFixed(2));
    cloud_cover.push(Math.min(100, Math.round(band * 100 + 30 * rnd(lon, lat, i))));
    cape.push(Math.round(band * 1800 * rnd(lat, i, lon)));
  }
  return { utc_offset_seconds: OFFSET / 1000, hourly: { time, precipitation, cloud_cover, cape } };
}

const json = (body) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

export function demoFetch(now = () => new Date()) {
  return async (input) => {
    const url = new URL(input);
    const q = url.searchParams;
    const lats = (q.get('latitude') ?? '').split(',').map(Number);
    const lons = (q.get('longitude') ?? '').split(',').map(Number);
    const n = now();

    if (url.host === 'api.open-meteo.com') {
      const many = lats.length > 1;
      let out;
      if (q.get('hourly')?.includes('cape')) out = lats.map((la, i) => gridFor(la, lons[i], n));
      else if (q.get('forecast_days') === '3') {
        out = lats.map((la, i) => {
          const d = forecastFor(la, lons[i], n).daily;
          return { daily: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.slice(0, 3)])) };
        });
      }
      else if (q.get('forecast_hours') === '1') {
        out = lats.map((la, i) => {
          const f = forecastFor(la, lons[i], n);
          return { current: f.current, hourly: { precipitation_probability: [f.hourly.precipitation_probability[0]] } };
        });
      } else out = lats.map((la, i) => forecastFor(la, lons[i], n));
      return json(many ? out : out[0]);
    }
    if (url.host === 'overpass-api.de') {
      const v = (name, lat, lon, place = 'village') => ({ type: 'node', lat, lon, tags: { name, 'name:ar': name, place } });
      return json({ elements: [
        v('بيت جالا', 31.7151, 35.1872, 'town'), v('بيت ساحور', 31.7044, 35.2259, 'town'), v('بيرزيت', 31.9677, 35.1977, 'town'),
        v('سلواد', 31.9789, 35.2564), v('عرابة', 32.4093, 35.1985, 'town'), v('دورا', 31.5072, 35.0283, 'town'),
        v('بني نعيم', 31.5152, 35.1647, 'town'), v('عصيرة الشمالية', 32.2489, 35.2533), v('حوارة', 32.1531, 35.2564),
        v('العيزرية', 31.7708, 35.2639, 'town'), v('بيت لاهيا', 31.5464, 34.4951, 'town'), v('عبسان الكبيرة', 31.3215, 34.3546),
        v('كفر كنا', 32.7466, 35.3428), v('أم الفحم', 32.5194, 35.1536, 'city'), v('الطيبة', 32.2667, 35.0103, 'city'),
        v('مكان في البحر', 32.1, 34.6), v('عمّان', 31.95, 35.93, 'city'),
      ] });
    }
    if (url.host === 'nominatim.openstreetmap.org') {
      const la = Number(q.get('lat')), lo = Number(q.get('lon'));
      return json({ address: { village: `قرية تجريبية (${la.toFixed(2)}, ${lo.toFixed(2)})`, county: 'محافظة تجريبية', state: 'فلسطين' } });
    }
    if (url.host === 'geocoding-api.open-meteo.com') {
      if (q.get('countryCode') !== 'PS') return json({});
      const name = q.get('name');
      return json({ results: [
        { id: 1, name: `${name} (تجريبي)`, latitude: 31.9, longitude: 35.2, admin2: 'رام الله والبيرة', population: 3000 },
        { id: 2, name: `${name} الشرقية (تجريبي)`, latitude: 32.25, longitude: 35.28, admin1: 'نابلس', population: 1200 },
      ] });
    }
    if (url.host === 'air-quality-api.open-meteo.com') return json({ current: { european_aqi: 34 } });
    if (url.host === 'earthquake.usgs.gov') {
      const t = n.getTime();
      const f = (id, mag, lat, lon, depth, hoursAgo, felt) => ({
        id, properties: { mag, time: t - hoursAgo * 3600000, felt }, geometry: { coordinates: [lon, lat, depth] },
      });
      return json({ features: [
        f('demo1', 3.4, 31.62, 35.46, 10, 6, 12), f('demo2', 2.6, 32.82, 35.59, 8, 10, null),
        f('demo3', 2.1, 32.3, 35.55, 12, 70, null), f('demo4', 3.9, 32.95, 34.3, 18, 110, 40),
        f('demo5', 1.9, 31.1, 35.42, 7, 150, null), f('demo6', 3.1, 29.3, 34.85, 15, 320, null),
      ] });
    }
    if (url.host === 'api.aladhan.com') {
      return json({ data: {
        timings: { Fajr: '04:55', Sunrise: '06:13', Dhuhr: '11:52', Asr: '15:13', Maghrib: '17:31', Isha: '18:47' },
        date: { hijri: { day: '05', month: { ar: 'جُمادى الأولى' }, year: '1448' } },
      } });
    }
    if (url.host === 'open.er-api.com') {
      return json({ time_last_update_utc: n.toUTCString(), rates: { USD: 0.27, JOD: 0.192, EUR: 0.248, EGP: 13.1, GBP: 0.211, SAR: 1.01, AED: 0.99, TRY: 9.2 } });
    }
    if (url.host === 'news.google.com') {
      const items = ['عنوان خبر تجريبي عن المنخفض الجوي', 'عنوان خبر تجريبي عن موسم الزيتون', 'عنوان خبر تجريبي عن درجات الحرارة']
        .map((t, i) => `<item><title>${t} - مصدر تجريبي</title><link>https://example.com/news/${i}</link><pubDate>${new Date(n.getTime() - (i + 1) * 3600000).toUTCString()}</pubDate><source url="https://example.com">مصدر تجريبي</source></item>`);
      return new Response(`<?xml version="1.0"?><rss><channel>${items.join('')}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml' } });
    }
    return new Response('not found', { status: 404 });
  };
}
