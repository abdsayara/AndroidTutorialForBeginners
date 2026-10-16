// App shell: routing, navigation, and browser notifications for new alerts.
import { api, settings } from './api.js';
import { icon } from './icons.js';
import { views } from './views.js';
import { mountMap } from './map.js';

const TABS = [
  { path: '/', label: 'الرئيسية', icon: 'home' },
  { path: '/map', label: 'الخريطة', icon: 'map' },
  { path: '/cities', label: 'المدن', icon: 'pin' },
  { path: '/farming', label: 'الزراعة', icon: 'leaf' },
  { path: '/more', label: 'المزيد', icon: 'more' },
];
const MORE = [
  { path: '/hourly', label: 'تفاصيل اليوم', icon: 'clock' },
  { path: '/prayer', label: 'أوقات الصلاة', icon: 'moon' },
  { path: '/alerts', label: 'التنبيهات السابقة', icon: 'bell' },
  { path: '/news', label: 'أخبار الطقس والمناخ', icon: 'news' },
  { path: '/currency', label: 'أسعار العملات', icon: 'coins' },
  { path: '/about', label: 'حول الموقع', icon: 'compass' },
];
const TITLES = Object.fromEntries([...TABS, ...MORE].map((t) => [t.path, t.label]));

const state = { cities: [], regions: {}, city: null, liveAlerts: false };
let cleanup = null;
let renderId = 0;

export const ctx = {
  get cities() { return state.cities; },
  get regions() { return state.regions; },
  get liveAlerts() { return state.liveAlerts; },
  /** The selected location: one of the listed cities, or any village / GPS point. */
  get city() { return state.city; },
  setCity(id) {
    const c = state.cities.find((x) => x.id === id);
    if (c) this.setPlace(c);
  },
  setPlace(p, { go = true } = {}) {
    state.city = p;
    if (p.region) { settings.cityId = p.id; settings.place = null; } else settings.place = p;
    if (go) navigate('/');
  },
  /** Query string identifying a place for the API: a city id, or exact coordinates. */
  placeQuery(p = state.city) {
    return p.region ? `city=${encodeURIComponent(p.id)}` : `lat=${p.lat}&lon=${p.lon}`;
  },
  /** Nearest listed city, for "near X" labels. */
  nearestCity(lat, lon) {
    const d = (c) => (c.lat - lat) ** 2 + ((c.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    return state.cities.reduce((a, b) => (d(b) < d(a) ? b : a));
  },
  /** Exact GPS position named after its village / neighbourhood. Rejects with an Arabic message. */
  locate() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('المتصفح لا يدعم تحديد الموقع')); return; }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lon = +pos.coords.longitude.toFixed(5);
        if (lat < 29.3 || lat > 33.5 || lon < 34.0 || lon > 36.0) { reject(new Error('موقعك الحالي خارج فلسطين')); return; }
        const near = ctx.nearestCity(lat, lon);
        let name = null;
        let area = null;
        try { ({ name, area } = (await api(`/api/reverse?lat=${lat}&lon=${lon}`)).data); } catch { /* offline: fall back below */ }
        resolve({
          id: 'gps', kind: 'gps', lat, lon, accuracy: Math.round(pos.coords.accuracy),
          name: name || `قرب ${near.name}`, area: area || near.name,
        });
      }, (err) => reject(new Error(err.code === 1
        ? 'لم يُسمح بالوصول إلى موقعك — اسمح للموقع بذلك من إعدادات المتصفح'
        : 'تعذّر تحديد موقعك — تأكد من تشغيل خدمة الموقع وحاول مجدداً')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    });
  },
  navigate: (p) => navigate(p),
};

function navigate(path) {
  if (location.pathname !== path) history.pushState(null, '', path);
  render();
}

function navHtml(items, withLabels) {
  const here = location.pathname;
  const tabFor = MORE.some((m) => m.path === here) ? '/more' : here;
  return items.map((t) => {
    const current = withLabels ? t.path === here : t.path === tabFor;
    return `<a href="${t.path}" data-link ${current ? 'aria-current="page"' : ''}>${icon(t.icon, 22)}<span>${t.label}</span></a>`;
  }).join('');
}

function renderNav() {
  document.getElementById('tab-nav').innerHTML = navHtml(TABS, false);
  document.getElementById('side-nav').innerHTML =
    navHtml(TABS.slice(0, 4), true) + '<div class="nav-label">المزيد</div>' + navHtml(MORE, true);
}

async function render() {
  const id = ++renderId;
  if (cleanup) { cleanup(); cleanup = null; }
  renderNav();
  const main = document.getElementById('main');
  const path = location.pathname in TITLES ? location.pathname : '/';
  document.title = path === '/' ? 'طقس فلسطين' : `${TITLES[path]} — طقس فلسطين`;
  main.innerHTML = '';
  const view = path === '/map' ? mountMap : views[path];
  const result = await view(main, ctx, () => id !== renderId);
  if (id === renderId && typeof result === 'function') cleanup = result;
  else if (typeof result === 'function') result();
}

// Intercept in-app links.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
  e.preventDefault();
  navigate(a.getAttribute('href'));
  document.getElementById('main').focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
window.addEventListener('popstate', render);

// ---------------------------------------------------------------- notifications

async function checkAlerts() {
  if (!settings.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const { data } = await api('/api/alerts');
    const seen = new Set(settings.seenAlerts);
    const fresh = data.filter((a) => !seen.has(a.key));
    for (const a of fresh.slice(0, 3)) {
      if (settings.alertOn(a.type)) new Notification(a.title, { body: a.body, icon: '/favicon.svg', tag: a.key });
    }
    settings.seenAlerts = [...fresh.map((a) => a.key), ...seen];
  } catch { /* offline */ }
}

// ---------------------------------------------------------------- boot

(async function boot() {
  try {
    const { data } = await api('/api/cities');
    state.cities = data.cities;
    state.regions = data.regions;
    state.liveAlerts = !!data.liveAlerts;
    document.getElementById('demo-banner').hidden = !data.demo;
  } catch {
    document.getElementById('main').innerHTML = '<div class="empty">تعذّر الاتصال بالخادم. تحقّق من اتصالك ثم أعد تحميل الصفحة.</div>';
    return;
  }
  state.city = settings.place ?? state.cities.find((c) => c.id === settings.cityId) ?? state.cities[0];
  await render();
  checkAlerts();
  setInterval(checkAlerts, 10 * 60 * 1000);
})();
