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
  get favorites() { return read('favorites', ['jerusalem', 'gaza']); },
  set favorites(v) { write('favorites', v); },
  get prayerMethod() { return read('prayerMethod', 5); },
  set prayerMethod(v) { write('prayerMethod', v); },
  alertOn(type) { return read(`alert.${type}`, type !== 'heat'); },
  setAlertOn(type, on) { write(`alert.${type}`, on); },
  get notify() { return read('notify', false); },
  set notify(v) { write('notify', v); },
  get seenAlerts() { return read('seenAlerts', []); },
  set seenAlerts(v) { write('seenAlerts', v.slice(0, 300)); },
};
