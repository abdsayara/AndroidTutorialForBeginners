// Background alert job: every few hours, scans the 3-day forecast for every city and
// recent earthquakes, and appends new alerts to a JSON history file (last 30 days).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CITIES } from './cities.js';
import { parseQuakes, quakesUrl } from './sources.js';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function dailyUrl(cities = CITIES) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${cities.map((c) => c.lat).join(',')}` +
    `&longitude=${cities.map((c) => c.lon).join(',')}` +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max' +
    '&timezone=auto&forecast_days=3';
}

const dayLabel = (iso, today) => (iso === today ? 'اليوم' : DAY_NAMES[new Date(iso + 'T12:00:00Z').getUTCDay()]);
const listNames = (names) => {
  const rest = names.length - 4;
  if (rest <= 0) return names.join('، ');
  return `${names.slice(0, 4).join('، ')} و${rest === 1 ? 'مدينة أخرى' : rest === 2 ? 'مدينتين أخريين' : rest <= 10 ? `${rest} مدن أخرى` : `${rest} مدينة أخرى`}`;
};

/**
 * Pure rule engine: turns multi-city daily forecasts + quakes into alert records.
 * Alerts are grouped per type and day so one rainy day yields one alert, listing cities.
 */
export function buildAlerts(daily, quakes, now = Date.now(), cities = CITIES) {
  const arr = Array.isArray(daily) ? daily : [daily];
  const today = arr[0]?.daily?.time?.[0];
  const groups = new Map();
  const add = (type, date, level, city, detail) => {
    const key = `${type}_${date}`;
    const g = groups.get(key) ?? { key, type, date, level: 'info', cities: [], details: [] };
    if (level === 'high' || (level === 'warn' && g.level === 'info')) g.level = level;
    g.cities.push(city.name);
    g.details.push(detail);
    groups.set(key, g);
  };

  cities.forEach((city, i) => {
    const d = arr[i]?.daily;
    if (!d) return;
    d.time.forEach((date, j) => {
      const prob = d.precipitation_probability_max?.[j] ?? 0;
      const sum = d.precipitation_sum?.[j] ?? 0;
      const max = d.temperature_2m_max?.[j];
      const min = d.temperature_2m_min?.[j];
      const wind = d.wind_speed_10m_max?.[j] ?? 0;
      if (prob >= 60) add('rain', date, sum >= 20 ? 'warn' : 'info', city, sum);
      if (min != null && min <= 3) add('frost', date, min <= 0 ? 'high' : 'warn', city, min);
      if (max != null && max >= 35) add('heat', date, max >= 40 ? 'high' : 'warn', city, max);
      if (wind >= 50) add('wind', date, 'warn', city, wind);
    });
  });

  const out = [];
  for (const g of groups.values()) {
    const when = dayLabel(g.date, today);
    const names = listNames(g.cities);
    const peak = (fn) => Math.round(fn(...g.details));
    const text = {
      rain: [`أمطار متوقعة ${when}`, `${names} — حتى ${peak(Math.max)} ملم`],
      frost: [`خطر صقيع ${when}`, `${names} — الصغرى حتى ${peak(Math.min)}°`],
      heat: [`موجة حر ${when}`, `${names} — العظمى حتى ${peak(Math.max)}°`],
      wind: [`رياح قوية ${when}`, `${names} — هبات حتى ${peak(Math.max)} كم/س`],
    }[g.type];
    out.push({ key: g.key, type: g.type, level: g.level, title: text[0], body: text[1], time: now });
  }

  for (const q of quakes) {
    if (q.mag < 3 || now - q.time > 12 * 3600 * 1000) continue;
    out.push({
      key: `quake_${q.id}`, type: 'quake', level: q.mag >= 4.5 ? 'high' : 'warn',
      title: `هزة أرضية بقوة ${q.mag.toFixed(1)}`, body: `${q.place} · عمق ${Math.round(q.depthKm)} كم`, time: q.time,
    });
  }
  return out;
}

export class AlertStore {
  constructor(dir) {
    this.file = path.join(dir, 'alerts.json');
    this.alerts = [];
  }

  async load() {
    this.alerts = await readFile(this.file, 'utf8').then(JSON.parse).catch(() => []);
  }

  /** Adds alerts whose key is new; returns how many were added. */
  async merge(fresh, now = Date.now()) {
    const known = new Set(this.alerts.map((a) => a.key));
    const added = fresh.filter((a) => !known.has(a.key));
    const cutoff = now - 30 * 86400000;
    this.alerts = [...added, ...this.alerts].filter((a) => a.time >= cutoff).sort((a, b) => b.time - a.time).slice(0, 500);
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(this.alerts));
    return added.length;
  }
}

export function startAlertJob(cache, store, everyMs = 3 * 3600 * 1000, log = console) {
  const run = async () => {
    try {
      const daily = await cache.json(dailyUrl());
      const quakes = parseQuakes(await cache.json(quakesUrl(1)));
      const n = await store.merge(buildAlerts(daily, quakes));
      log.info(`[alerts] checked, ${n} new`);
    } catch (e) {
      log.warn(`[alerts] check failed: ${e.message}`);
    }
  };
  run();
  return setInterval(run, everyMs);
}
