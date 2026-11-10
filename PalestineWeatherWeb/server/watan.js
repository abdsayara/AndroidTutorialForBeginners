// «طقس الوطن» (WatanWeather, p-weather.ps): the detailed daily bulletin, the daily reports
// and the site's own weather stations. The pages are plain server-rendered HTML; the
// stations are public WeatherLink embeds (read through the same JSON their embed page
// loads) and a Weathercloud sticker. Everything shown links back to the source.

export const WATAN = 'https://www.p-weather.ps/ar/';
export const BULLETIN_URL = `${WATAN}index.php`;
export const REPORTS_URL = `${WATAN}article.php`;
export const STATIONS_URL = `${WATAN}page.php?page_id=9`;
export const weatherlinkUrl = (id) => `https://www.weatherlink.com/embeddablePage/getData/${id}`;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', deg: '°' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m);
/** HTML fragment → plain text, keeping line breaks. */
const text = (html) => decode(html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, ''))
  .replace(/�/g, '').replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();
const absolute = (src) => (src ? new URL(src, WATAN).href : null);

// A new day starts at a line like "الثلاثاء 10\11\2026:" or "الجمعة 2026/11/13:".
const DAY_RE = /^((?:ال)?(?:سبت|أحد|احد|إثنين|اثنين|أثنين|ثلاثاء|أربعاء|اربعاء|خميس|جمعة)\s+[\d\\/.\-]+)\s*:\s*/;

/** The «النشرة التفصيلية» block on the home page: [{day, text}] — one entry per day. */
export function parseBulletin(html) {
  const block = String(html).match(/<!--\s*النشرة التفصيلية\s*-->([\s\S]*?)<!--\s*نهاية النشرة التفصيلية\s*-->/)?.[1];
  if (!block) throw new Error('bulletin block not found');
  const body = block.replace(/<h2[\s\S]*?<\/h2>/i, '');
  const days = [];
  for (const line of text(body).split('\n')) {
    const m = line.match(DAY_RE);
    if (m) days.push({ day: m[1].replace(/\\/g, '/'), text: line.slice(m[0].length).trim() });
    else if (days.length) days.at(-1).text += `\n${line}`;
    else if (line) days.push({ day: null, text: line });
  }
  if (!days.length) throw new Error('bulletin is empty');
  return { days, source: BULLETIN_URL };
}

/** The reports list (article.php): title, author line, short excerpt, tag, date, image, link. */
export function parseReports(html) {
  const out = [];
  // Two reports per row; each starts with its picture.
  for (const chunk of String(html).split(/<div class="photo-preview/).slice(1)) {
    const link = chunk.match(/<h3 class="photo-title">\s*<a href="([^"]+)">([\s\S]*?)<\/a>/);
    if (!link) continue;
    const id = Number(link[1].match(/article_id=(\d+)/)?.[1]);
    const body = text((chunk.match(/<div class="body-article">([\s\S]*?)<a href="[^"]*"[^>]*>\s*قراءة المزيد/) ?? [])[1] ?? '');
    const lines = body.split('\n').filter(Boolean);
    // The first line is usually the byline ("قصي الحلايقة - موقع طقس الوطن:").
    const byline = lines[0]?.endsWith(':') ? lines.shift().replace(/:$/, '') : null;
    const excerpt = lines.join(' ').trim();
    out.push({
      id,
      title: text(link[2]),
      byline,
      // The site cuts excerpts at a fixed length; a stub like "قسم ال" says nothing.
      excerpt: excerpt.length >= 25 ? `${excerpt}…` : null,
      tag: text(chunk.match(/class="tags-article-page">([\s\S]*?)<\/a>/)?.[1] ?? '').replace(/^#/, '').replace(/_/g, ' ') || null,
      date: chunk.match(/<span class="date">\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null,
      image: absolute(chunk.match(/<amp-img[^>]*\ssrc="([^"]+)"/)?.[1]),
      url: absolute(link[1]),
    });
  }
  if (!out.length) throw new Error('no reports found');
  return out;
}

/** Station names and their embeds, in page order. */
export function parseStations(html) {
  const out = [];
  let name = null;
  const re = /<strong>([\s\S]*?)<\/strong>|weatherlink\.com\/embeddablePage\/show\/([0-9a-f]{32})|app\.weathercloud\.net\/d(\d+)/gi;
  for (const m of String(html).matchAll(re)) {
    if (m[1] != null) name = text(m[1]).replace(/[`'"]+$/, '');
    else if (m[2]) out.push({ name, kind: 'weatherlink', id: m[2], page: `https://www.weatherlink.com/embeddablePage/show/${m[2]}/fullscreen` });
    else if (m[3] && !out.some((s) => s.id === m[3])) {
      out.push({ name, kind: 'weathercloud', id: m[3], page: `https://app.weathercloud.net/d${m[3]}`, sticker: `https://app.weathercloud.net/device/sticker/${m[3]}` });
    }
  }
  return out.filter((s) => s.name);
}

const TRENDS = {
  'rising rapidly': 'يرتفع بسرعة', 'rising slowly': 'يرتفع ببطء', rising: 'يرتفع',
  steady: 'ثابت', 'falling slowly': 'ينخفض ببطء', 'falling rapidly': 'ينخفض بسرعة', falling: 'ينخفض',
};
const UNITS = { 'km/h': 'كم/س', 'm/s': 'م/ث', mph: 'ميل/س', knots: 'عقدة', mm: 'ملم', in: 'إنش', mb: 'ملّيبار', hPa: 'هكتوباسكال', inHg: 'إنش زئبق' };
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const iso = (ms) => (Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : null);

/** One WeatherLink embed's current conditions. */
export function parseWeatherlink(o) {
  return {
    temp: num(o.temperature),
    feelsLike: num(o.temperatureFeelLike),
    high: num(o.hiTemp), highAt: iso(o.hiTempDate),
    low: num(o.loTemp), lowAt: iso(o.loTempDate),
    humidity: num(o.humidity),
    wind: num(o.wind), gust: num(o.gust), windDir: num(o.windDirection),
    rain: num(o.rain), seasonalRain: num(o.seasonalRain),
    pressure: num(o.barometer),
    pressureTrend: TRENDS[String(o.barometerTrend ?? '').toLowerCase()] ?? null,
    units: {
      temp: decode(o.tempUnits ?? '°C').replace(/^°?/, '°'),
      wind: UNITS[o.windUnits] ?? o.windUnits ?? 'كم/س',
      rain: UNITS[o.rainUnits] ?? o.rainUnits ?? 'ملم',
      pressure: UNITS[o.barometerUnits] ?? o.barometerUnits ?? 'ملّيبار',
    },
    updated: iso(o.lastReceived),
  };
}
