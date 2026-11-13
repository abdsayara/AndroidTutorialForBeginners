// API client and per-browser settings.

export async function api(path) {
  const res = await fetch(path, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body; // { data, fetchedAt, stale }
}

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(`pw.${key}`);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try { localStorage.setItem(`pw.${key}`, JSON.stringify(value)); } catch { /* private mode */ }
};

export const settings = {
  get cityId() { return read('city', 'jerusalem'); },
  set cityId(v) { write('city', v); },
  /** A chosen village or GPS point ({id, name, lat, lon, area, kind}); null when a listed city is chosen. */
  get place() { return read('place', null); },
  set place(v) { write('place', v); },
  get favorites() { return read('favorites', ['jerusalem', 'gaza']); },
  set favorites(v) { write('favorites', v); },
  alertOn(type) { return read(`alert.${type}`, type !== 'heat'); },
  setAlertOn(type, on) { write(`alert.${type}`, on); },
  get notify() { return read('notify', false); },
  set notify(v) { write('notify', v); },
  /** Home sections in the order the person chose, and the ones they hid. */
  get homeOrder() { return read('homeOrder', null); },
  set homeOrder(v) { write('homeOrder', v); },
  get homeHidden() { return read('homeHidden', []); },
  set homeHidden(v) { write('homeHidden', v); },
  /** The sky of the chosen place, last seen on the home page; it colours every page. */
  get sky() { return read('sky', 'day'); },
  set sky(v) { write('sky', v); },
  /** The coming days as columns with a curve (true) or as a list. */
  get weekColumns() { return read('weekColumns', false); },
  set weekColumns(v) { write('weekColumns', v); },
  get seenAlerts() { return read('seenAlerts', []); },
  set seenAlerts(v) { write('seenAlerts', v.slice(0, 300)); },
};
