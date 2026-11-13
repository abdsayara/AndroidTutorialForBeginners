// Personal weather stations on Weather Underground. Their readings come from The Weather
// Company's PWS API, which needs an API key of our own: Weather Underground gives one free
// to station owners (wunderground.com/member/api-keys). It is read from WU_API_KEY; without
// it the station is listed with no readings.
export const WU_STATIONS = [{ id: 'IDEIRB6', name: 'محطة دير بلوط - سلفيت' }];

const API = 'https://api.weather.com/v2/pws';
const q = (id, key) => `stationId=${encodeURIComponent(id)}&format=json&units=m&numericPrecision=decimal&apiKey=${encodeURIComponent(key)}`;
export const currentUrl = (id, key) => `${API}/observations/current?${q(id, key)}`;
export const todayUrl = (id, key) => `${API}/dailysummary/1day?${q(id, key)}`;

const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const DIRS = { up: 'يرتفع', down: 'ينخفض', steady: 'ثابت' };

/** One observation (+ today's summary for the high and low) in the shape of the other stations. */
export function parseWu(current, today = {}) {
  const o = current?.observations?.[0];
  if (!o) throw new Error('no observation');
  const m = o.metric ?? {};
  const d = today?.summaries?.at(-1)?.metric ?? {};
  const temp = num(m.temp);
  const feels = temp != null && temp >= 27 ? num(m.heatIndex) : num(m.windChill);
  return {
    temp,
    feelsLike: feels ?? temp,
    high: num(d.tempHigh), highAt: null,
    low: num(d.tempLow), lowAt: null,
    humidity: num(o.humidity),
    wind: num(m.windSpeed), gust: num(m.windGust), windDir: num(o.winddir),
    rain: num(m.precipTotal), seasonalRain: null,
    pressure: num(m.pressure),
    pressureTrend: DIRS[String(o.pressureTrend ?? '').toLowerCase()] ?? null,
    units: { temp: '°C', wind: 'كم/س', rain: 'ملم', pressure: 'ملّيبار' },
    updated: o.obsTimeUtc ?? null,
  };
}
