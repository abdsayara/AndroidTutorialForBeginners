// «طقس الوطن» (WatanWeather, p-weather.ps): the detailed daily bulletin, the daily reports
// and the site's own weather stations. The pages are plain server-rendered HTML; the
// stations are public WeatherLink embeds (read through the same JSON their embed page
// loads) and a Weathercloud sticker. Everything shown links back to the source.

export const WATAN = 'https://www.p-weather.ps/ar/';
export const BULLETIN_URL = `${WATAN}index.php`;
export const REPORTS_URL = `${WATAN}article.php`;
export const STATIONS_URL = `${WATAN}page.php?page_id=9`;
export const weatherlinkUrl = (id) => `https://www.weatherlink.com/embeddablePage/getData/${id}`;
// Weathercloud answers these only to its page's own AJAX calls.
export const WEATHERCLOUD_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
export const weathercloudUrls = (id) => [`https://app.weathercloud.net/device/values?code=${id}`, `https://app.weathercloud.net/device/stats?code=${id}`];

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

/** A Weathercloud station's current values (+ the day's extremes from its stats). Wind comes in m/s. */
export function parseWeathercloud(values, stats = {}) {
  const kmh = (v) => (num(v) == null ? null : Math.round(num(v) * 36) / 10);
  const at = (pair) => (Array.isArray(pair) ? iso(pair[0] * 1000) : null);
  const val = (pair) => (Array.isArray(pair) ? num(pair[1]) : null);
  return {
    temp: num(values.temp),
    feelsLike: num(values.thw ?? values.chill),
    high: val(stats.temp_day_max), highAt: at(stats.temp_day_max),
    low: val(stats.temp_day_min), lowAt: at(stats.temp_day_min),
    humidity: num(values.hum),
    wind: kmh(values.wspdavg ?? values.wspd), gust: kmh(Math.max(num(values.wspdhi) ?? 0, num(values.wspd) ?? 0, num(values.wspdavg) ?? 0)), windDir: num(values.wdiravg ?? values.wdir),
    rain: num(values.rain), seasonalRain: null,
    pressure: num(values.bar), pressureTrend: null,
    units: { temp: '°C', wind: 'كم/س', rain: 'ملم', pressure: 'ملّيبار' },
    updated: iso(num(values.epoch) * 1000),
  };
}

/** "محطة طقس الوطن - شمال الخليل" → "محطة شمال الخليل": the place is what matters to readers. */
export const stationName = (name) => {
  const place = String(name ?? '').split(/\s+-\s+/).slice(1).join(' - ').trim();
  return place ? `محطة ${place}` : name;
};

export const articleUrl = (id) => `${WATAN}article.php?article_id=${id}`;

// Article bodies come from a rich-text editor (inline styles, spans, fonts). Keep only
// plain structure, and images by absolute http(s) URL; drop everything else.
// The editor bolds whole articles, so bold is dropped too.
const KEEP = new Set(['p', 'br', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th']);
const RENAME = { div: 'p', h1: 'h2', h5: 'h4', h6: 'h4' };
export function sanitize(html) {
  return String(html)
    .replace(/<(script|style|iframe|object|embed|noscript|form)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (m, tag, attrs) => {
      const t = RENAME[tag.toLowerCase()] ?? tag.toLowerCase();
      const closing = m[1] === '/';
      if (t === 'img') {
        if (closing) return '';
        const src = attrs.match(/\ssrc\s*=\s*"([^"]+)"/i)?.[1] ?? attrs.match(/\ssrc\s*=\s*'([^']+)'/i)?.[1];
        const abs = src ? absolute(decode(src)) : null;
        // Only real image files: posts also hold links to image-host pages and broken BBCode.
        const ok = abs && /^https?:\/\/[^\s\[\]"]+\.(png|jpe?g|gif|webp)(\?[^\s\[\]"]*)?$/i.test(abs);
        return ok ? `<img src="${abs.replace(/"/g, '%22')}" alt="" loading="lazy">` : '';
      }
      if (!KEEP.has(t)) return '';
      return closing ? `</${t}>` : t === 'br' ? '<br>' : `<${t}>`;
    })
    .replace(/�/g, '')
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<p>\s*(<br>\s*)*<\/p>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** One report page: title, date, picture and the cleaned body HTML. */
export function parseArticle(html, id) {
  const main = String(html).split(/<div class="photo main-article">/)[1];
  if (!main) throw new Error('article not found');
  const title = text(main.match(/<h3 class="photo-title">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');
  const raw = main.match(/<div class="body-article">([\s\S]*?)<\/div>\s*<p>\s*(?:<a[^>]*tags-article-page|<\/p>)/)?.[1]
    ?? main.match(/<div class="body-article">([\s\S]*?)<!--/)?.[1];
  if (!title || raw == null) throw new Error('article not found');
  return {
    id,
    title,
    date: main.match(/<span class="date">\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null,
    image: absolute(main.match(/data-bg-image="([^"]+)"/)?.[1] || null),
    tag: text(main.match(/class="tags-article-page">([\s\S]*?)<\/a>/)?.[1] ?? '').replace(/^#/, '').replace(/_/g, ' ') || null,
    html: sanitize(raw),
  };
}
