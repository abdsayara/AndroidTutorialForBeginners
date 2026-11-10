// Checkpoint status from PalHub (palhub.app/road-status): about 200 checkpoints, each
// with its status in both directions and when it was last updated. The page is a
// Next.js app that ships its data inside the HTML (React Server Components payload),
// so one page fetch gives the whole list.

import { CHECKPOINTS, normalize } from './roads.js';

export const PALHUB_URL = 'https://palhub.app/road-status';

/** PalHub's four states → ours. "crisis" is a severe jam, shown as busy with its own label. */
const STATUS = { open: 'open', crowded: 'busy', crisis: 'crisis', closed: 'closed' };
const RANK = { unknown: 0, open: 1, busy: 2, crisis: 3, closed: 4 };
export const worst = (a, b) => (RANK[a] >= RANK[b] ? a : b);

/** Joins the `self.__next_f.push([1, "…"])` chunks back into the payload text. */
function flightData(html) {
  let out = '';
  for (const [, chunk] of String(html).matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)) {
    out += JSON.parse(`"${chunk}"`);
  }
  return out;
}

function arrayAfter(text, key) {
  const i = text.indexOf(`"${key}":[`);
  if (i < 0) return null;
  // Parse just the array: walk to its matching bracket, respecting strings.
  const start = i + key.length + 3;
  let depth = 0;
  let inStr = false;
  for (let k = start; k < text.length; k++) {
    const c = text[k];
    if (inStr) {
      if (c === '\\') k++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, k + 1));
    }
  }
  return null;
}

// Our hand-placed checkpoints, to put PalHub's on the map where the names match.
// Short or Latin aliases ("DCO", "نفق") are too generic here: many PalHub names contain them.
const KNOWN = CHECKPOINTS.map((c) => ({
  c, names: [c.name, ...c.aliases.filter((a) => a.length >= 4 && /[\u0600-\u06FF]/.test(a))].map(normalize),
}));
function locate(name) {
  const n = normalize(name).replace(/[ـ]/g, '');
  return KNOWN.find(({ names }) => names.some((x) => n.includes(x)))?.c ?? null;
}

/** {cities: [{id, name, lat, lon}], checkpoints: [{id, name, city, lat, lon, into, out, status, at, approx}]} */
export function parsePalhub(html) {
  const data = flightData(html);
  const cities = arrayAfter(data, 'cities');
  const cps = arrayAfter(data, 'checkpoints');
  if (!Array.isArray(cps) || !cps.length) throw new Error('palhub: no checkpoints in page');
  const cityById = new Map((cities ?? []).map((c) => [c.id, c]));
  const checkpoints = cps.filter((c) => c && c.name).map((c) => {
    const city = cityById.get(c.city_id);
    const into = STATUS[c.status_into] ?? 'unknown';
    const out = STATUS[c.status_out] ?? 'unknown';
    const known = locate(c.name);
    return {
      id: `ph-${c.id}`,
      name: c.name.trim(),
      city: city?.name_ar?.trim() ?? null,
      // Exact spot when we know the checkpoint, otherwise none (the list still shows it).
      lat: known?.lat ?? null,
      lon: known?.lon ?? null,
      into, out,
      status: worst(into, out),
      waitInto: Number.isFinite(c.wait_into_minutes) ? c.wait_into_minutes : null,
      waitOut: Number.isFinite(c.wait_out_minutes) ? c.wait_out_minutes : null,
      at: c.last_status_update_at ? new Date(c.last_status_update_at).toISOString() : null,
    };
  });
  return {
    cities: (cities ?? [])
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((c) => ({ id: c.id, name: c.name_ar?.trim(), lat: c.latitude, lon: c.longitude }))
      .filter((c) => checkpoints.some((cp) => cp.city === c.name)),
    checkpoints,
  };
}
