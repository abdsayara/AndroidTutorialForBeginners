// Interactive map of Palestine: canvas rendering, pan / pinch / wheel zoom, six data layers.
import { api } from './api.js';
import * as F from './format.js';
import { esc } from './format.js';
import { icon } from './icons.js';
import { LAKES, OUTER, REGION_LINES } from './shape.js';

const K = Math.cos((31.5 * Math.PI) / 180);
const KM_PER_UNIT = 1.2086;
const FIT_HEIGHT = 372; // map units that fit the whole country vertically at zoom 1
const proj = (lat, lon) => [(lon - 34.1) * 92 * K, (33.4 - lat) * 92];

function parse(d) {
  const rings = [];
  let cur = null;
  for (const m of d.matchAll(/([MLZ])([^MLZ]*)/g)) {
    const n = m[2].trim().split(/[ ,]+/).filter(Boolean).map(Number);
    if (m[1] === 'M') { if (cur) rings.push(cur); cur = [[n[0], n[1]]]; } else if (m[1] === 'L') cur.push([n[0], n[1]]);
  }
  if (cur) rings.push(cur);
  return rings;
}
const SHAPE = { outer: parse(OUTER), regions: REGION_LINES.map(parse), lakes: LAKES.map(parse) };

const LAYERS = [
  ['temp', 'الحرارة'], ['wind', 'الرياح'], ['rain', 'الأمطار'],
  ['clouds', 'السحب'], ['storms', 'العواصف'], ['quakes', 'الزلازل'],
];
const SUBTITLE = {
  temp: 'الحرارة الآن · اسحب وكبّر', wind: 'سرعة الرياح (كم/س)', rain: 'رادار الأمطار',
  clouds: 'حركة السحب', storms: 'احتمال العواصف الرعدية', quakes: 'الهزات الأرضية',
};
const LEGEND = {
  rain: [['#3FA34D', 'خفيف'], ['#F2C230', 'متوسط'], ['#D9452B', 'غزير']],
  clouds: [['#B0BEC5', 'كثافة الغيوم']],
  storms: [['#F2C230', 'ضعيف'], ['#F08C2E', 'متوسط'], ['#D9452B', 'مرتفع']],
  quakes: [['#D9452B', '3 فأكثر'], ['#C77700', 'أقل من 3']],
};
const THEME = {
  light: { sea: '#CFE2EC', land: '#F4F1E6', coast: '#6E8577', lake: '#9CC3DA' },
  storms: { sea: '#13202A', land: '#24343F', coast: '#8FA67F', lake: '#2C5878' },
  clouds: { sea: '#1B3A55', land: '#5E7A4E', coast: '#8FA67F', lake: '#2C5878' },
};

const rainColor = (v) => (v == null || v < 0.1 ? null : v < 1 ? ['63,163,77', 0.55] : v < 4 ? ['242,194,48', 0.65] : ['217,69,43', 0.75]);
const capeColor = (v) => (v == null || v < 300 ? null : v < 1000 ? ['242,194,48', 0.4] : v < 2000 ? ['240,140,46', 0.55] : ['217,69,43', 0.7]);

function pinColors(layer, n) {
  if (!n) return ['#fff', '#12241B'];
  if (layer === 'wind') return n.wind >= 30 ? ['#12241B', '#fff'] : ['#fff', '#12241B'];
  if (n.temp >= 30) return ['#B4441C', '#fff'];
  if (n.temp >= 25) return ['#F2B84B', '#3B2600'];
  if (n.temp <= 8) return ['#1F5FA8', '#fff'];
  return ['#fff', '#12241B'];
}

export function mountMap(el, ctx, cancelled) {
  const st = {
    layer: 'temp', cx: 65, cy: 185, zoom: 1, regions: true,
    sel: ctx.city.id, quake: null, frame: -1, playing: false, days: 7,
    now: null, grid: null, quakes: null, loading: {},
  };

  el.innerHTML = `<div class="page wide">
    <header class="header"><div class="titles"><h1>خريطة فلسطين</h1><div class="subtitle" id="sub"></div></div></header>
    <div class="map-layout">
      <div class="layers" role="tablist" aria-label="طبقة الخريطة" id="layers"></div>
      <div class="map-wrap" id="wrap">
        <canvas id="cv" role="img"></canvas>
        <div class="map-controls">
          <button class="icon-btn" data-action="zin" aria-label="تكبير">${icon('plus')}</button>
          <button class="icon-btn" data-action="zout" aria-label="تصغير">${icon('minus')}</button>
          <button class="icon-btn" data-action="reset" aria-label="عرض فلسطين كاملة">${icon('expand')}</button>
          <button class="icon-btn" data-action="regions" id="reg-btn" aria-label="حدود المناطق">${icon('regions')}</button>
        </div>
        <div class="map-legend" id="legend" hidden></div>
        <div class="scale" id="scale"><div class="bar"></div><span></span></div>
        <div class="map-loading" id="ml"></div>
      </div>
      <div id="panel"></div>
    </div>
  </div>`;

  const $ = (s) => el.querySelector(s);
  const wrap = $('#wrap');
  const cv = $('#cv');
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  const scale = () => (H / FIT_HEIGHT) * st.zoom;
  const toScreen = ([x, y]) => [(x - st.cx) * scale() + W / 2, (y - st.cy) * scale() + H / 2];
  const visibleCities = () => ctx.cities.filter((c) => c.major || st.zoom >= 1.8 || c.id === st.sel);
  const frameIdx = () => (!st.grid ? 0 : st.frame < 0 || st.frame >= st.grid.times.length ? st.grid.nowIndex : st.frame);

  // ---------------------------------------------------------------- drawing

  function path(rings, close) {
    g.beginPath();
    for (const ring of rings) {
      ring.forEach((p, i) => { const [x, y] = toScreen(p); i ? g.lineTo(x, y) : g.moveTo(x, y); });
      if (close) g.closePath();
    }
  }

  function label(text, x, y, { bg = 'rgba(255,255,255,0.85)', fg = '#12241B', font = '600 11px "IBM Plex Sans Arabic", sans-serif', padX = 4, h = 16, radius = 4, align = 'center' } = {}) {
    g.font = font;
    const w = g.measureText(text).width + padX * 2;
    const left = align === 'center' ? x - w / 2 : x;
    g.fillStyle = bg;
    g.beginPath(); g.roundRect(left, y - h / 2, w, h, radius); g.fill();
    g.fillStyle = fg;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, left + w / 2, y + 1);
    return w;
  }

  function draw() {
    if (!W) return;
    const theme = THEME[st.layer] ?? THEME.light;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = theme.sea; g.fillRect(0, 0, W, H);
    g.direction = 'rtl';

    path(SHAPE.outer, true); g.fillStyle = theme.land; g.fill();
    g.lineJoin = 'round'; g.lineWidth = 1.5; g.strokeStyle = theme.coast; g.stroke();
    if (st.regions) {
      g.setLineDash([6, 4]); g.lineWidth = 1;
      SHAPE.regions.forEach((r) => { path(r, false); g.stroke(); });
      g.setLineDash([]);
    }
    g.fillStyle = theme.lake;
    SHAPE.lakes.forEach((r) => { path(r, true); g.fill(); });

    // Gridded layers: soft blobs per grid point.
    if (st.grid && ['rain', 'clouds', 'storms'].includes(st.layer)) {
      const f = frameIdx();
      const r = 14 * scale();
      st.grid.points.forEach(([lat, lon], i) => {
        let c;
        if (st.layer === 'rain') c = rainColor(st.grid.precip[i]?.[f]);
        else if (st.layer === 'storms') c = capeColor(st.grid.cape[i]?.[f]);
        else { const v = st.grid.cloud[i]?.[f]; c = v == null || v < 3 ? null : ['255,255,255', (v / 100) * 0.8]; }
        if (!c) return;
        const [x, y] = toScreen(proj(lat, lon));
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]})`);
        grad.addColorStop(0.5, `rgba(${c[0]},${c[1] * 0.6})`);
        grad.addColorStop(1, `rgba(${c[0]},0)`);
        g.fillStyle = grad;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      });
    }

    if (st.layer === 'quakes' && st.quakes) {
      for (const q of st.quakes) {
        const [x, y] = toScreen(proj(q.lat, q.lon));
        const r = (5 + q.mag * 4) / 2 + 2;
        const strong = q.mag >= 3;
        g.fillStyle = strong ? 'rgba(217,69,43,0.35)' : 'rgba(199,119,0,0.3)';
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        g.lineWidth = 2; g.strokeStyle = q.id === st.quake ? '#12241B' : strong ? '#D9452B' : '#C77700';
        g.stroke();
      }
    }

    // City markers
    const values = st.layer === 'temp' || st.layer === 'wind';
    for (const c of visibleCities()) {
      if (!values && !c.major) continue;
      const [x, y] = toScreen(proj(c.lat, c.lon));
      if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
      if (values) {
        const n = st.now?.[c.id];
        const text = !n ? '…' : st.layer === 'wind' ? String(Math.round(n.wind ?? 0)) : F.deg(n.temp);
        const [bg, fg] = pinColors(st.layer, n);
        g.font = '700 12px "IBM Plex Sans Arabic", sans-serif';
        const w = Math.max(g.measureText(text).width + 14, 34);
        g.fillStyle = bg; g.beginPath(); g.roundRect(x - w / 2, y - 12, w, 24, 12); g.fill();
        g.lineWidth = 2; g.strokeStyle = c.id === st.sel ? '#146B45' : 'rgba(18,36,27,0.15)'; g.stroke();
        g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 1);
        label(c.name, x, y + 22);
      } else {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#12241B'; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
        g.font = '600 11px "IBM Plex Sans Arabic", sans-serif';
        const w = g.measureText(c.name).width + 8;
        label(c.name, x - 7 - w, y, { align: 'start' });
      }
    }

    // Scale bar
    const pxPerKm = scale() / KM_PER_UNIT;
    const km = [100, 50, 20, 10, 5, 2, 1].find((k) => k * pxPerKm <= 110) ?? 1;
    $('#scale .bar').style.width = `${km * pxPerKm}px`;
    $('#scale span').textContent = `${km} كم`;
  }

  // ---------------------------------------------------------------- chrome

  function chrome() {
    $('#sub').textContent = SUBTITLE[st.layer];
    cv.setAttribute('aria-label', `خريطة فلسطين التفاعلية — ${SUBTITLE[st.layer]}`);
    $('#layers').innerHTML = LAYERS.map(([k, v]) =>
      `<button class="pill" role="tab" data-action="layer" data-k="${k}" aria-selected="${k === st.layer}">${v}</button>`).join('');
    const reg = $('#reg-btn');
    reg.classList.toggle('on', st.regions);
    reg.setAttribute('aria-pressed', st.regions);
    const lg = LEGEND[st.layer];
    const legend = $('#legend');
    legend.hidden = !lg;
    legend.innerHTML = lg ? lg.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join('') : '';
    const busy = st.layer === 'quakes' ? st.loading.quakes : ['temp', 'wind'].includes(st.layer) ? st.loading.now : st.loading.grid;
    $('#ml').innerHTML = busy ? '<div class="spinner"></div>' : '';
    panel();
  }

  function panel() {
    const p = $('#panel');
    if (st.layer === 'temp' || st.layer === 'wind') {
      const c = ctx.cities.find((x) => x.id === st.sel) ?? ctx.city;
      const n = st.now?.[c.id];
      p.innerHTML = `<section class="card"><div class="row">
        <div class="grow"><div class="display" style="font-size:18px">${esc(c.name)}</div>
          <div class="muted small">${n ? `${F.weatherText(n.code)} · مطر ${n.precipProb}% · رياح ${F.round(n.wind)} كم/س` : esc(ctx.regions[c.region] ?? '')}</div></div>
        <div class="display" style="font-size:30px">${n ? F.deg(n.temp) : '—'}</div>
        <button class="icon-btn primary" data-action="open" aria-label="تفاصيل ${esc(c.name)}">${icon('forward')}</button>
      </div>${st.loading.nowError ? '<div class="banner">تعذّر تحميل قيم المدن</div>' : ''}</section>`;
    } else if (st.layer === 'quakes') {
      const list = st.quakes ?? [];
      const q = list.find((x) => x.id === st.quake) ?? list[0];
      p.innerHTML = `<section class="card">
        <div class="pills even">${[[1, '24 ساعة'], [7, 'أسبوع'], [30, 'شهر']].map(([d, l]) =>
          `<button class="pill" data-action="days" data-d="${d}" aria-pressed="${d === st.days}">${l}</button>`).join('')}</div>
        ${q ? `<div class="row">
          <div class="mag" style="background:${q.mag >= 3 ? '#D9452B' : '#FFE3B0'};color:${q.mag >= 3 ? '#fff' : 'var(--amber-ink)'}"><span class="num">${q.mag.toFixed(1)}</span></div>
          <div class="grow"><div class="bold">${esc(q.place)}</div>
            <div class="muted tiny">${new Date(q.time).toLocaleString('ar', { timeZone: 'Asia/Hebron', dateStyle: 'medium', timeStyle: 'short' })} · عمق ${Math.round(q.depthKm)} كم${q.felt ? ' · شُعر بها' : ''}</div></div>
        </div>
        <div class="muted tiny">${list.length} هزة في الفترة · اضغط على دائرة لعرض تفاصيلها</div>`
        : `<div class="muted small">${st.loading.quakesError ? 'تعذّر تحميل بيانات الزلازل' : st.loading.quakes ? 'جارٍ التحميل…' : 'لا توجد هزات مسجّلة في هذه الفترة'}</div>`}
        <div class="source">المصدر: هيئة المسح الجيولوجي الأمريكية USGS</div>
      </section>`;
    } else {
      const gd = st.grid;
      if (!gd) { p.innerHTML = `<section class="card"><div class="muted small">${st.loading.gridError ? 'تعذّر تحميل بيانات الشبكة' : 'جارٍ التحميل…'}</div></section>`; return; }
      const f = frameIdx();
      const hours = (t) => Math.round((Date.parse(t) - Date.parse(gd.times[gd.nowIndex])) / 3600000);
      const note = {
        rain: 'الأمطار (ملم/ساعة) · ما قبل «الآن» تقدير نموذجي وما بعده توقع',
        clouds: 'نسبة الغيوم من نموذج الطقس',
        storms: 'مؤشر CAPE: ملاءمة الجو للعواصف الرعدية — ليس رصداً مباشراً للبرق',
      }[st.layer];
      p.innerHTML = `<section class="card">
        <div class="row">
          <button class="icon-btn primary" data-action="play" aria-label="${st.playing ? 'إيقاف' : 'تشغيل'}">${icon(st.playing ? 'pause' : 'play')}</button>
          <div class="frames">${gd.times.map((t, i) => {
            const d = hours(t);
            return `<button data-action="frame" data-i="${i}" class="${d > 0 ? 'future' : ''}" aria-pressed="${i === f}">${d === 0 ? 'الآن' : d > 0 ? `بعد ${d}س` : `قبل ${-d}س`}</button>`;
          }).join('')}</div>
        </div>
        <div class="muted tiny">${note} — ${esc(F.clock(gd.times[f]))}</div>
      </section>`;
    }
  }

  const refresh = () => { chrome(); draw(); };

  // ---------------------------------------------------------------- data

  async function fetchInto(key, path) {
    st.loading[key] = true; st.loading[`${key}Error`] = false; refresh();
    try { const r = await api(path); if (!cancelled()) st[key] = r.data; } catch { st.loading[`${key}Error`] = true; }
    st.loading[key] = false;
    if (!cancelled()) refresh();
  }
  fetchInto('now', '/api/now');
  fetchInto('grid', '/api/grid');
  const loadQuakes = () => fetchInto('quakes', `/api/quakes?days=${st.days}`);
  loadQuakes();

  // ---------------------------------------------------------------- size

  const ro = new ResizeObserver(() => {
    dpr = window.devicePixelRatio || 1;
    W = wrap.clientWidth; H = wrap.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    draw();
  });
  ro.observe(wrap);

  // ---------------------------------------------------------------- gestures

  const pointers = new Map();
  let moved = 0;
  let pinch = null;

  const zoomAt = (factor, px, py) => {
    const s0 = scale();
    const ux = st.cx + (px - W / 2) / s0;
    const uy = st.cy + (py - H / 2) / s0;
    st.zoom = Math.min(14, Math.max(0.8, st.zoom * factor));
    const s1 = scale();
    st.cx = ux - (px - W / 2) / s1;
    st.cy = uy - (py - H / 2) / s1;
    clampView();
  };
  const clampView = () => { st.cx = Math.min(150, Math.max(-20, st.cx)); st.cy = Math.min(380, Math.max(0, st.cy)); };
  const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, local(e));
    moved = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) };
    }
    wrap.classList.add('dragging');
  });
  cv.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    const cur = local(e);
    pointers.set(e.pointerId, cur);
    if (pointers.size === 1) {
      const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
      moved += Math.abs(dx) + Math.abs(dy);
      st.cx -= dx / scale(); st.cy -= dy / scale();
      clampView();
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      moved += 10;
      zoomAt(d / pinch.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      pinch.d = d;
    }
    draw();
  });
  const end = (e) => {
    if (!pointers.has(e.pointerId)) return;
    const pt = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!pointers.size) wrap.classList.remove('dragging');
    if (e.type === 'pointerup' && moved < 6 && !pointers.size) tap(pt);
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [x, y] = local(e);
    zoomAt(e.deltaY > 0 ? 1 / 1.15 : 1.15, x, y);
    draw();
  }, { passive: false });

  function tap([px, py]) {
    const dist = ([x, y]) => Math.hypot(x - px, y - py);
    if (st.layer === 'quakes') {
      const best = (st.quakes ?? []).map((q) => [q, dist(toScreen(proj(q.lat, q.lon)))]).sort((a, b) => a[1] - b[1])[0];
      if (best && best[1] < 40) { st.quake = best[0].id; refresh(); }
    } else {
      const best = visibleCities().map((c) => [c, dist(toScreen(proj(c.lat, c.lon)))]).sort((a, b) => a[1] - b[1])[0];
      if (best && best[1] < 36) { st.sel = best[0].id; refresh(); }
    }
  }

  // ---------------------------------------------------------------- controls

  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; st.playing = false; };
  const ac = new AbortController();
  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    switch (t.dataset.action) {
      case 'layer': stop(); st.layer = t.dataset.k; st.frame = -1; break;
      case 'zin': zoomAt(1.4, W / 2, H / 2); break;
      case 'zout': zoomAt(1 / 1.4, W / 2, H / 2); break;
      case 'reset': st.cx = 65; st.cy = 185; st.zoom = 1; break;
      case 'regions': st.regions = !st.regions; break;
      case 'open': ctx.setCity(st.sel); return;
      case 'days': st.days = Number(t.dataset.d); st.quake = null; loadQuakes(); return;
      case 'frame': stop(); st.frame = Number(t.dataset.i); break;
      case 'play':
        if (st.playing) stop();
        else if (st.grid) {
          st.playing = true;
          timer = setInterval(() => { st.frame = (frameIdx() + 1) % st.grid.times.length; refresh(); }, 900);
        }
        break;
      default: return;
    }
    refresh();
  }, { signal: ac.signal });

  // Keyboard: arrows pan, +/- zoom (when the map has focus).
  cv.tabIndex = 0;
  cv.addEventListener('keydown', (e) => {
    const step = 30 / scale();
    const keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (keys[e.key]) { st.cx += keys[e.key][0]; st.cy += keys[e.key][1]; clampView(); }
    else if (e.key === '+' || e.key === '=') zoomAt(1.3, W / 2, H / 2);
    else if (e.key === '-') zoomAt(1 / 1.3, W / 2, H / 2);
    else return;
    e.preventDefault();
    draw();
  });

  refresh();
  return () => { stop(); ro.disconnect(); ac.abort(); };
}
