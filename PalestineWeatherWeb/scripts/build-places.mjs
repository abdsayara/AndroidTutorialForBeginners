// Builds server/data/places.json — the villages, towns and cities on the map — from the
// GeoNames dumps (CC BY 4.0), so the map no longer depends on a live Overpass server.
//
//   curl -O https://download.geonames.org/export/dump/PS.zip   (and IL.zip)
//   curl -O https://download.geonames.org/export/dump/alternatenames/PS.zip  (and IL.zip)
//   node scripts/build-places.mjs main/PS.txt main/IL.txt -- alt/PS.txt alt/IL.txt
//
// Keeps populated places inside Palestine's outline with an Arabic name (the preferred
// Arabic alternate name, else any Arabic-script one), never a Hebrew one.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { insidePalestine, isArabicName } from '../server/sources.js';

const args = process.argv.slice(2);
const split = args.indexOf('--');
const mainFiles = args.slice(0, split);
const altFiles = args.slice(split + 1);
if (split < 1 || !altFiles.length) {
  console.error('usage: node scripts/build-places.mjs <main.txt…> -- <alternatenames.txt…>');
  process.exit(1);
}

// Strip harakat, tatweel and direction marks; Persian yeh/kaf to Arabic; no trailing punctuation.
const clean = (s) => s.replace(/[ً-ْٰـ‎‏‪-‮]/g, '')
  .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/[,،.;:\s]+$/u, '').replace(/^[\s:]+/u, '')
  .replace(/\s+/g, ' ').trim();
// Persian / Urdu / Kurdish letters: such a name is not an Arabic one.
const NOT_ARABIC = /[پچژگہۀەھ]|منطقه/u;

// Palestinian names for places GeoNames lists under their Israeli names.
const RENAME = new Map([
  ['إيلات', 'أم الرشراش'], ['أشدود', 'إسدود'], ['كريات شمونة', 'الخالصة'], ['بتاح تكفا', 'ملبس'],
  ['نتانيا', 'أم خالد'], ['كفار سابا', 'كفر سابا'], ['كريات غات', 'الفالوجة'], ['معالوت ترشيحا', 'ترشيحا'],
  ['أزور', 'يازور'],
]);
// Israeli towns, moshavim and kibbutzim with no Palestinian name of their own: not shown.
const DROP = new Set([
  'بات يام', 'بني براك', 'بيت شيمش', 'حولون', 'رمات غان', 'غفعتايم', 'نتيفوت', 'نهاريا', 'نيس زيونا',
  'هود هشارون', 'رامات هاشارون', 'الناصرة العليا', 'إيفن يهودا', 'أور يهودا', 'تل موند', 'حتسور هجليليت',
  'حاتسور', 'ديمونا', 'شوهام', 'غديرا', 'كريات عكرون', 'مجدال هعيمق', 'مزكيرت باتيا', 'مفسيرت تصيون',
  'ميتار', 'نيشير', 'يروحام', 'يهود', 'راموت هشافيم', 'رشافيم', 'رمات تسفي', 'رمات يشاي', 'غفعات برينر',
  'كرميا', 'كريات عنافيم', 'كريات نتافيم', 'كفار بلوم', 'كفار غليم', 'كفار فيتكين', 'كفار ملال', 'كفار هس',
  'نفيه يامين', 'يبنه',
]);
const lines = (file) => readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));

// geonameid → best Arabic name: the preferred one wins, then the shortest (usually the plain form).
const arabic = new Map();
for (const file of altFiles) {
  for (const [, id, lang, name, preferred, , colloquial, historic] of lines(file)) {
    if (lang !== 'ar' || colloquial === '1' || historic === '1' || !isArabicName(name) || NOT_ARABIC.test(name)) continue;
    const cur = arabic.get(id);
    const cand = { name: clean(name), preferred: preferred === '1' };
    if (!cur || (cand.preferred && !cur.preferred) || (cand.preferred === cur.preferred && cand.name.length < cur.name.length)) {
      arabic.set(id, cand);
    }
  }
}

// Populated places that exist today (not abandoned, destroyed, historical or city sections).
const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG', 'PPLL', 'PPLS', 'PPLF', 'PPLR']);
const out = [];
const seen = new Set();
for (const file of mainFiles) {
  for (const f of lines(file)) {
    const [id, , , alternates, lat, lon, fclass, fcode, , , , , , , population] = f;
    if (fclass !== 'P' || !KEEP.has(fcode)) continue;
    const la = Number(lat);
    const lo = Number(lon);
    if (!insidePalestine(la, lo)) continue;
    const fallback = (alternates ?? '').split(',').filter((n) => !NOT_ARABIC.test(n)).map(clean).find(isArabicName);
    const found = arabic.get(id)?.name ?? fallback;
    // Not a place name: two names joined by a comma, or one naming the state.
    if (!found || NOT_ARABIC.test(found) || DROP.has(found) || /[,،]|[اإ]سرائيل/u.test(found)) continue;
    const name = RENAME.get(found) ?? found;
    const key = `${name}|${la.toFixed(2)}|${lo.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pop = Number(population) || 0;
    const kind = fcode === 'PPLC' || fcode === 'PPLA' || pop >= 50000 ? 'c' : pop >= 8000 || fcode === 'PPLA2' ? 't' : 'v';
    out.push([name, +la.toFixed(4), +lo.toFixed(4), kind]);
  }
}
const rank = { c: 0, t: 1, v: 2 };
out.sort((a, b) => rank[a[3]] - rank[b[3]] || a[0].localeCompare(b[0], 'ar'));

mkdirSync(new URL('../server/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../server/data/places.json', import.meta.url), `${JSON.stringify(out)}\n`);
const count = (k) => out.filter((p) => p[3] === k).length;
console.log(`places.json: ${out.length} places (${count('c')} cities, ${count('t')} towns, ${count('v')} villages)`);
