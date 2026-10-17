// Road and checkpoint conditions, read from public Telegram channels where drivers post
// live updates ("حوارة سالك", "قلنديا أزمة خانقة", ...). Telegram shows the latest posts
// of any public channel at https://t.me/s/<channel> without an account or API key; we read
// that page, then match known checkpoints and status words in each post.

/**
 * Channels to read: ROAD_CHANNELS="ahwalaltreq,other:اسم القناة" (id, optional Arabic name).
 * The default is three public groups (≈510k members together); groups are read through
 * Telegram's API (see telegram.js), channels also from their web preview.
 */
const DEFAULT_CHANNELS = 'ahwalaltreq:احوال الطرق وحواجز الإحتلال,a7walstreet:أحوال الطرق,road_jehad:أحوال الطرق والحواجز - فلسطين';

export function roadChannels(env = process.env.ROAD_CHANNELS) {
  const list = (env ?? DEFAULT_CHANNELS).split(',').map((s) => s.trim()).filter(Boolean);
  return list.map((s) => {
    const [raw, ...name] = s.split(':');
    const id = raw.trim().replace(/^@/, '');
    return { id, name: name.join(':').trim() || id };
  }).filter((c) => /^[A-Za-z0-9_]{4,64}$/.test(c.id));
}

export const telegramUrl = (channel, before) => `https://t.me/s/${channel}${before ? `?before=${before}` : ''}`;

// Main checkpoints, gates and junctions. Positions are approximate (to within a few
// hundred metres) and only place them on the overview map.
export const REGIONS = { north: 'الشمال', center: 'الوسط', south: 'الجنوب', valley: 'الأغوار' };
export const CHECKPOINTS = [
  // North: Nablus, Jenin, Tulkarm, Qalqilya, Salfit
  { id: 'huwwara', name: 'حوارة', aliases: [], lat: 32.158, lon: 35.256, region: 'north' },
  { id: 'zaatara', name: 'زعترة', aliases: ['تبوح', 'مفرق زعترة'], lat: 32.115, lon: 35.245, region: 'north' },
  { id: 'beitfurik', name: 'بيت فوريك', aliases: [], lat: 32.196, lon: 35.305, region: 'north' },
  { id: 'awarta', name: 'عورتا', aliases: [], lat: 32.175, lon: 35.283, region: 'north' },
  { id: 'deirsharaf', name: 'دير شرف', aliases: [], lat: 32.252, lon: 35.182, region: 'north' },
  { id: 'badhan', name: 'الباذان', aliases: ['باذان'], lat: 32.275, lon: 35.33, region: 'north' },
  { id: 'jalameh', name: 'الجلمة', aliases: ['جلمة'], lat: 32.508, lon: 35.316, region: 'north' },
  { id: 'enav', name: 'عناب', aliases: ['عيناف'], lat: 32.278, lon: 35.117, region: 'north' },
  { id: 'jbara', name: 'جبارة', aliases: [], lat: 32.283, lon: 35.03, region: 'north' },
  { id: 'azzun', name: 'عزون', aliases: [], lat: 32.175, lon: 35.06, region: 'north' },
  // Centre: Ramallah, Jerusalem
  { id: 'qalandia', name: 'قلنديا', aliases: ['قلندية'], lat: 31.864, lon: 35.217, region: 'center' },
  { id: 'atara', name: 'عطارة', aliases: ['بيرزيت عطارة'], lat: 31.993, lon: 35.196, region: 'center' },
  { id: 'einsinia', name: 'عين سينيا', aliases: [], lat: 31.983, lon: 35.228, region: 'center' },
  { id: 'beitel', name: 'بيت إيل', aliases: ['بيت ايل', 'DCO', 'دي سي او'], lat: 31.928, lon: 35.222, region: 'center' },
  { id: 'surda', name: 'سردا', aliases: [], lat: 31.946, lon: 35.209, region: 'center' },
  { id: 'jaba', name: 'جبع', aliases: [], lat: 31.859, lon: 35.263, region: 'center' },
  { id: 'hizma', name: 'حزما', aliases: [], lat: 31.835, lon: 35.26, region: 'center' },
  { id: 'shuafat', name: 'شعفاط', aliases: ['مخيم شعفاط'], lat: 31.812, lon: 35.245, region: 'center' },
  { id: 'zaim', name: 'الزعيم', aliases: ['زعيم'], lat: 31.795, lon: 35.258, region: 'center' },
  { id: 'container', name: 'الكونتينر', aliases: ['كونتينر', 'الكونتينير', 'وادي النار'], lat: 31.745, lon: 35.265, region: 'center' },
  // South: Bethlehem, Hebron
  { id: 'tunnels', name: 'الأنفاق', aliases: ['الانفاق', 'حاجز النفق', 'نفق'], lat: 31.74, lon: 35.175, region: 'south' },
  { id: 'cp300', name: 'حاجز 300', aliases: ['قبة راحيل', 'حاجز ٣٠٠', 'ال300'], lat: 31.722, lon: 35.205, region: 'south' },
  { id: 'khader', name: 'الخضر', aliases: ['مدخل الخضر'], lat: 31.69, lon: 35.165, region: 'south' },
  { id: 'etzion', name: 'عتصيون', aliases: ['مفرق عتصيون', 'غوش عتصيون'], lat: 31.651, lon: 35.126, region: 'south' },
  { id: 'arroub', name: 'العروب', aliases: ['عروب'], lat: 31.623, lon: 35.142, region: 'south' },
  { id: 'rasjoura', name: 'رأس الجورة', aliases: ['راس الجورة'], lat: 31.552, lon: 35.106, region: 'south' },
  { id: 'tarqumia', name: 'ترقوميا', aliases: [], lat: 31.575, lon: 35.028, region: 'south' },
  { id: 'fawwar', name: 'الفوار', aliases: ['فوار'], lat: 31.495, lon: 35.065, region: 'south' },
  // Jordan valley
  { id: 'muarrajat', name: 'المعرجات', aliases: ['معرجات'], lat: 31.93, lon: 35.4, region: 'valley' },
  { id: 'hamra', name: 'الحمرا', aliases: ['الحمراء'], lat: 32.205, lon: 35.455, region: 'valley' },
  { id: 'tayasir', name: 'تياسير', aliases: [], lat: 32.335, lon: 35.43, region: 'valley' },
  { id: 'karameh', name: 'معبر الكرامة', aliases: ['جسر الكرامة', 'جسر الملك حسين', 'جسر اللنبي'], lat: 31.873, lon: 35.541, region: 'valley' },
];

// ---------------------------------------------------------------- Telegram page

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m);

/** Posts on a t.me/s/<channel> page, oldest first: {id, channel, text, time, url}. */
export function parseTelegram(html, channel) {
  const out = [];
  const chunks = String(html).split(/data-post="/).slice(1);
  for (const chunk of chunks) {
    const post = chunk.slice(0, chunk.indexOf('"'));
    const [ch, idStr] = post.split('/');
    const id = Number(idStr);
    if (!id || ch.toLowerCase() !== channel.toLowerCase()) continue;
    const body = chunk.match(/<div class="[^"]*\bjs-message_text\b[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    const time = chunk.match(/<time[^>]*datetime="([^"]+)"/)?.[1];
    if (!body || !time) continue;
    const text = decode(body.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
      .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!text) continue;
    out.push({ id, channel: ch, text, time: new Date(time).toISOString(), url: `https://t.me/${ch}/${id}` });
  }
  return out;
}

// ---------------------------------------------------------------- understanding posts

/** Folds spelling variants so "مغلقة", "مغلقه" and "مُغلَقة" all match. */
export const normalize = (s) => s
  .replace(/[ً-ْٰـ]/g, '') // harakat, tatweel
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
  .toLowerCase();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A whole word, allowing the attached prefixes و ب ل ف and لل (and "ال" for words without it).
const wordRe = (words) => new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:[وبلف]|ال|[وبلف]ال|لل)?(?:${words.map((w) => escapeRe(normalize(w))).join('|')})(?=$|[^\\p{L}\\p{N}])`, 'u');

const CLOSED = wordRe(['مغلق', 'مغلقه', 'مسكر', 'مسكره', 'مسكور', 'سكر', 'مقفل', 'مقفله', 'اغلاق', 'اغلق', 'مغلقين', 'غير سالك', 'مش سالك', 'مو سالك', 'ممنوع المرور']);
const BUSY = wordRe(['ازمه', 'ازمات', 'زحمه', 'ازدحام', 'تفتيش', 'تفتيشات', 'بطء', 'بطيء', 'بطيئه', 'خانقه', 'طابور', 'طوابير', 'كثافه', 'مكتظ', 'متوقف', 'واقف', 'وقوف', 'توقيف']);
const OPEN = wordRe(['سالك', 'سالكه', 'سالكين', 'مفتوح', 'مفتوحه', 'فاتح', 'فاتحه', 'فتح', 'نظيف', 'ماشي', 'ماشيه', 'طبيعي', 'طبيعيه']);

/** 'closed' | 'busy' | 'open' | null for one piece of text. Words first, then emoji. */
export function classify(text) {
  const t = normalize(text);
  if (CLOSED.test(t)) return 'closed';
  if (BUSY.test(t)) return 'busy';
  if (OPEN.test(t)) return 'open';
  if (/[⛔🚫❌]/u.test(text)) return 'closed';
  if (/[🔴🟠🟡]/u.test(text)) return 'busy';
  if (/[🟢✅]/u.test(text)) return 'open';
  return null;
}

const MATCHERS = CHECKPOINTS.map((c) => ({ c, re: new RegExp(wordRe([c.name, ...c.aliases]).source, 'gu') }));

/**
 * Checkpoint mentions in one post. A post often lists several checkpoints, one per
 * line, separated by commas or joined by "و". Each checkpoint takes the status words
 * that follow its name up to the next checkpoint; failing that, those of its comma
 * piece, then of its line ("مسكر عطارة وعين سينيا").
 */
export function mentionsIn(text) {
  const found = new Map();
  for (const line of text.split('\n')) {
    const lineStatus = classify(line);
    for (const piece of line.split(/[،,؛;|]| - | – /)) {
      const np = normalize(piece);
      const hits = [];
      for (const { c, re } of MATCHERS) {
        re.lastIndex = 0;
        const m = re.exec(np);
        if (m && !found.has(c.id)) hits.push({ c, at: m.index });
      }
      hits.sort((a, b) => a.at - b.at);
      const pieceStatus = classify(piece);
      hits.forEach(({ c, at }, i) => {
        const own = classify(np.slice(at, hits[i + 1]?.at ?? np.length));
        found.set(c.id, { id: c.id, status: own ?? pieceStatus ?? lineStatus, snippet: piece.trim() || line.trim() });
      });
    }
  }
  return [...found.values()];
}

/**
 * Latest known state of each checkpoint and the recent feed, from posts of all
 * channels. A status older than `maxAgeH` hours is dropped (reported as unknown).
 */
export function buildRoads(posts, { now = Date.now(), maxAgeH = 12, feedSize = 40 } = {}) {
  const sorted = [...posts].sort((a, b) => b.time.localeCompare(a.time));
  const latest = new Map();
  const feed = [];
  for (const p of sorted) {
    const ms = Date.parse(p.time);
    const m = mentionsIn(p.text);
    if (feed.length < feedSize && (m.length || classify(p.text))) feed.push({ ...p, mentions: m });
    if (now - ms > maxAgeH * 3600000) continue;
    for (const x of m) {
      if (!x.status || latest.has(x.id)) continue;
      latest.set(x.id, { status: x.status, at: p.time, snippet: x.snippet, url: p.url, channel: p.channel });
    }
  }
  const checkpoints = CHECKPOINTS.map(({ aliases, ...c }) => ({ ...c, ...(latest.get(c.id) ?? { status: 'unknown', at: null }) }));
  return { checkpoints, feed, regions: REGIONS };
}
