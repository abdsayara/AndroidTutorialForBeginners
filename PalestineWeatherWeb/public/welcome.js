import { weatherIcon } from '/icons.js';
import { esc } from '/format.js';

// Fit the live app into the phone frame.
const frame = document.querySelector('.device iframe');
const fit = () => { frame.style.transform = `scale(${frame.parentElement.clientWidth / 390})`; };
new ResizeObserver(fit).observe(frame.parentElement);

const get = (p) => fetch(p).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

// The temperature now in the main cities.
const MAIN = ['jerusalem', 'gaza', 'ramallah', 'nablus', 'hebron', 'jenin', 'bethlehem', 'jericho', 'khanyunis', 'tulkarm', 'haifa', 'jaffa'];
Promise.all([get('/api/cities'), get('/api/now')]).then(([c, n]) => {
  const names = Object.fromEntries(c.data.cities.map((x) => [x.id, x.name]));
  document.getElementById('city-grid').innerHTML = MAIN.filter((id) => n.data[id]).map((id) => {
    const w = n.data[id];
    return `<a class="card city" href="/?city=${id}" data-city="${id}">${weatherIcon(w.code, { size: 26, cloudColor: '#4F5E55', sunColor: '#FAAE3C' })}<span class="n">${esc(names[id])}</span><span class="t">${Math.round(w.temp)}°</span></a>`;
  }).join('');
}).catch(() => { document.getElementById('city-grid').closest('section').querySelector('.lead').textContent = 'اختر أي مدينة لترى يومها وأسبوعها.'; document.getElementById('city-grid').innerHTML = '<a class="btn second" href="/cities">كل المدن</a>'; });

// A city card opens the app on that city.
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-city]');
  if (!a) return;
  try { localStorage.setItem('pw.city', JSON.stringify(a.dataset.city)); localStorage.setItem('pw.place', 'null'); } catch { /* private mode */ }
  e.preventDefault();
  location.href = '/';
});

// Checkpoints right now.
get('/api/roads').then((r) => {
  if (!r.data.sources.some((s) => s.ok)) return;
  const all = r.data.checkpoints;
  const n = { open: 0, busy: 0, closed: 0 };
  for (const c of all) {
    if (c.status === 'open') n.open++;
    else if (c.status === 'busy' || c.status === 'crisis') n.busy++;
    else if (c.status === 'closed') n.closed++;
  }
  document.querySelectorAll('#roads-sum [data-k]').forEach((el) => { el.textContent = n[el.dataset.k]; });
  const closed = all.filter((c) => c.status === 'closed').slice(0, 5).map((c) => esc(c.name));
  if (closed.length) document.getElementById('closed-list').innerHTML = `مغلق الآن: ${closed.join('، ')}`;
}).catch(() => {});
