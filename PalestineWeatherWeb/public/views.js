// Page views. Each view renders into `el` and may return a cleanup function.
import { api, settings } from './api.js';
import * as F from './format.js';
import { esc } from './format.js';
import { icon, starFilled, weatherIcon } from './icons.js';
import { OUTER, REGION_LINES, LAKES } from './shape.js';

// ---------------------------------------------------------------- helpers

const spinner = '<div class="loading" role="status" aria-label="جارٍ التحميل"><div class="spinner"></div></div>';

const staleBanner = (r) => (r.stale
  ? `<div class="banner" role="status">تعذّر التحديث — تُعرض آخر بيانات محفوظة (${esc(new Date(r.fetchedAt).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' }))})</div>`
  : '');

const errorBox = (retryAction = 'retry') =>
  `<div class="empty">لا يمكن جلب البيانات الآن ولا توجد نسخة محفوظة.<br><button class="pill" data-action="${retryAction}">إعادة المحاولة</button></div>`;

function header(title, subtitle, { back = false, actions = '' } = {}) {
  return `<header class="header">
    ${back ? `<a class="icon-btn" href="/more" data-link aria-label="رجوع">${icon('back')}</a>` : ''}
    <div class="titles"><h1>${esc(title)}</h1>${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ''}</div>
    ${actions}
  </header>`;
}

/** Wire delegated `data-action` clicks; returns the cleanup. */
function actions(el, handlers) {
  const ac = new AbortController();
  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t || !el.contains(t)) return;
    const fn = handlers[t.dataset.action];
    if (fn) fn(t, e);
  }, { signal: ac.signal });
  return () => ac.abort();
}

/** Loads `path` into `slot`, re-rendering on retry. */
async function load(slot, path, renderFn, cancelled) {
  slot.innerHTML = spinner;
  try {
    const r = await api(path);
    if (cancelled()) return null;
    slot.innerHTML = staleBanner(r) + renderFn(r.data);
    return r.data;
  } catch {
    if (!cancelled()) slot.innerHTML = errorBox();
    return null;
  }
}

const pill = (label, attrs, on) => `<button class="pill" ${attrs} aria-pressed="${on}">${esc(label)}</button>`;

// ---------------------------------------------------------------- home

function homeBody(fc, aqi) {
  const c = fc.current;
  const nowKey = (c.time ?? '').slice(0, 13);
  let nowIdx = fc.hours.findIndex((h) => h.time.slice(0, 13) >= nowKey);
  if (nowIdx < 0) nowIdx = 0;
  const today = fc.days[0] ?? {};
  const lo = Math.min(...fc.days.map((d) => d.min));
  const hi = Math.max(...fc.days.map((d) => d.max));
  const span = Math.max(1, hi - lo);

  const hours = fc.hours.slice(nowIdx, nowIdx + 24).map((h, i) => `
    <div class="hour ${i === 0 ? 'now' : ''}">
      <span>${i === 0 ? 'الآن' : F.hourLabel(h.time)}</span>
      ${weatherIcon(h.code, { isDay: h.isDay, size: 22, cloudColor: i === 0 ? '#fff' : 'var(--muted)' })}
      <span class="t">${F.deg(h.temp)}</span>
      ${h.precipProb >= 20 ? `<span class="p">${h.precipProb}%</span>` : ''}
    </div>`).join('');

  const days = fc.days.map((d) => `
    <div class="day">
      <span class="name">${F.relativeDay(d.date)}</span>
      ${weatherIcon(d.code, { size: 22 })}
      <span class="prob">${d.precipProbMax >= 10 ? `${d.precipProbMax}%` : ''}</span>
      <span class="muted">${F.deg(d.min)}</span>
      <div class="range" aria-hidden="true"><span style="inset-inline-start:${((d.min - lo) / span) * 100}%;inset-inline-end:${((hi - d.max) / span) * 100}%"></span></div>
      <span class="bold">${F.deg(d.max)}</span>
    </div>`).join('');

  return `
    <section class="hero" aria-label="الطقس الآن">
      <div class="row">
        <div class="grow">
          <div class="temp">${F.deg(c.temp)}</div>
          <div class="cond">${F.weatherText(c.code)}</div>
          <div class="meta">العظمى ${F.deg(today.max)} · الصغرى ${F.deg(today.min)} · الإحساس ${F.deg(c.apparent)}</div>
        </div>
        ${weatherIcon(c.code, { isDay: c.isDay, size: 104, cloudColor: '#fff', sunColor: 'var(--sun)' })}
      </div>
      <div class="chips">
        <div class="chip">${icon('drop', 16)} مطر ${fc.hours[nowIdx]?.precipProb ?? 0}%</div>
        <div class="chip">${icon('wind', 16)} ${F.round(c.wind)} كم/س ${F.windDir(c.windDir)}</div>
      </div>
    </section>

    <section aria-labelledby="h-hours">
      <div class="row"><h2 id="h-hours" class="grow">الساعات القادمة</h2><a class="link-btn" href="/hourly" data-link>التفاصيل</a></div>
      <div class="hours" tabindex="0" aria-label="توقعات الساعات القادمة">${hours}</div>
    </section>

    <section class="grid2 grid4" aria-label="تفاصيل">
      <div class="tile"><div class="label">الرطوبة</div><div class="value">${c.humidity ?? '—'}%</div></div>
      <div class="tile"><div class="label">الأشعة فوق البنفسجية</div><div class="value">${F.round(today.uvMax)} · ${F.uvText(today.uvMax)}</div></div>
      <div class="tile"><div class="label">الشروق / الغروب</div><div class="value">${today.sunrise ? F.clock(today.sunrise) : '—'} · ${today.sunset ? F.clock(today.sunset) : '—'}</div></div>
      <div class="tile"><div class="label">جودة الهواء</div><div class="value">${aqi != null ? `${aqi} · ${F.aqiText(aqi)}` : '—'}</div></div>
    </section>

    <section class="card flush list" aria-label="توقعات 7 أيام">${days}</section>
    <div class="source">المصدر: Open-Meteo</div>`;
}

async function home(el, ctx, cancelled) {
  const city = ctx.city;
  const subtitle = (elev) => [city.kind === 'gps' ? 'موقعك الحالي' : null, city.region ? null : city.area, elev, F.arabicDate()].filter(Boolean).join(' · ');
  el.innerHTML = `<div class="page">
    ${header(city.name, subtitle(null), {
      actions: `<button class="icon-btn" data-action="retry" aria-label="تحديث">${icon('refresh')}</button>
                <a class="icon-btn" href="/cities" data-link aria-label="تغيير المدينة">${icon('search')}</a>`,
    })}
    <div id="slot"></div>
  </div>`;
  const slot = el.querySelector('#slot');
  const run = async () => {
    slot.innerHTML = spinner;
    try {
      const [fc, air] = await Promise.all([
        api(`/api/forecast?${ctx.placeQuery()}`),
        api(`/api/air?${ctx.placeQuery()}`).catch(() => null),
      ]);
      if (cancelled()) return;
      const sub = el.querySelector('.subtitle');
      if (sub) sub.textContent = subtitle(F.elevation(fc.data.elevation));
      // Remember it so the selected village / GPS row on the cities page can show it too.
      if (!city.region && fc.data.elevation != null && city.elevation !== fc.data.elevation) ctx.setPlace({ ...city, elevation: fc.data.elevation }, { go: false });
      slot.innerHTML = staleBanner(fc) + `<div class="page" style="max-width:none">${homeBody(fc.data, air?.data?.aqi)}</div>`;
    } catch {
      if (!cancelled()) slot.innerHTML = errorBox();
    }
  };
  run();
  return actions(el, { retry: run });
}

// ---------------------------------------------------------------- hourly

async function hourly(el, ctx, cancelled) {
  const city = ctx.city;
  el.innerHTML = `<div class="page">${header('تفاصيل الطقس', city.name, { back: true })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  let fc = null;
  let day = 0;
  const draw = () => {
    const days = fc.days.slice(0, 4);
    const date = days[day]?.date;
    const hours = fc.hours.filter((h) => h.time.startsWith(date));
    slot.innerHTML = `<div class="page" style="max-width:none">
      <div class="pills even" role="tablist">${days.map((d, i) =>
        `<button class="pill" role="tab" data-action="day" data-i="${i}" aria-selected="${i === day}">${F.relativeDay(d.date)}</button>`).join('')}</div>
      <section class="card">
        <h2>احتمال الأمطار</h2>
        <div class="bars" role="img" aria-label="احتمال الأمطار لكل ساعة">${hours.map((h) => `<span style="height:${Math.max(2, h.precipProb)}%" title="${F.hourLabel(h.time)}: ${h.precipProb}%"></span>`).join('')}</div>
        <div class="bar-axis"><span>12 ص</span><span>6 ص</span><span>12 م</span><span>6 م</span><span>11 م</span></div>
      </section>
      <section class="card flush list">${hours.map((h) => `
        <div class="hrow">
          <span class="muted" style="width:52px">${F.hourLabel(h.time)}</span>
          ${weatherIcon(h.code, { isDay: h.isDay, size: 20 })}
          <span class="grow muted small">${F.weatherText(h.code)}</span>
          <span class="muted tiny">${F.round(h.wind)} كم/س</span>
          <span class="tiny" style="color:var(--blue);width:36px">${h.precipProb}%</span>
          <span class="bold" style="width:36px">${F.deg(h.temp)}</span>
        </div>`).join('')}</section>
    </div>`;
  };
  const run = async () => {
    fc = await load(slot, `/api/forecast?${ctx.placeQuery()}`, () => '', cancelled);
    if (fc) draw();
  };
  run();
  return actions(el, { day: (t) => { day = Number(t.dataset.i); draw(); }, retry: run });
}

// ---------------------------------------------------------------- cities

async function cities(el, ctx, cancelled) {
  let query = '';
  let region = null;
  let favorites = new Set(settings.favorites);
  let now = {};
  let msg = '';
  let found = [];        // villages / towns from the search service
  let searching = false;
  let searchTimer = null;

  el.innerHTML = `<div class="page">
    ${header('المدن والقرى')}
    <label class="search">${icon('search', 20)}<span class="sr-only">ابحث عن مدينة أو قرية</span>
      <input id="q" type="search" placeholder="ابحث عن مدينة أو بلدة أو قرية" autocomplete="off"></label>
    <button class="locate" data-action="locate">${icon('locate', 20)} استخدم موقعي الدقيق</button>
    <div id="msg" role="status" class="small"></div>
    <div id="current"></div>
    <div id="found"></div>
    <div class="pills" id="regions"></div>
    <div id="list" class="city-list"></div>
  </div>`;

  const placeRow = (p, i, current) => `<div class="city ${current ? 'current' : ''}">
      <button class="pick" data-action="pickPlace" data-i="${i}">
        <span class="bold" style="font-size:16px">${p.kind === 'gps' ? icon('locate', 16, 'style="display:inline;vertical-align:-2px;color:var(--green)"') + ' ' : ''}${esc(p.name)}</span>
        <span class="muted tiny">${esc([p.kind === 'gps' ? `موقعك الدقيق${p.accuracy ? ` (±${p.accuracy} م)` : ''}` : null, p.area, F.elevation(p.elevation)].filter(Boolean).join(' · '))}</span>
      </button>
    </div>`;

  const draw = () => {
    const m = el.querySelector('#msg');
    m.textContent = msg;
    m.style.color = msg.startsWith('جارٍ') ? 'var(--muted)' : 'var(--red)';
    const cur = ctx.city.region ? null : ctx.city;
    el.querySelector('#current').innerHTML = cur
      ? `<div class="subtitle" style="margin-bottom:6px">الموقع المختار</div>${placeRow(cur, -1, true)}` : '';
    el.querySelector('#found').innerHTML = query.length >= 2
      ? `<div class="subtitle" style="margin-bottom:6px">قرى وبلدات</div>${searching ? spinner
        : found.length ? `<div class="city-list">${found.map((p, i) => placeRow(p, i, false)).join('')}</div>`
          : '<div class="muted small">لا توجد قرى بهذا الاسم</div>'}` : '';
    el.querySelector('#regions').innerHTML =
      pill('الكل', 'data-action="region" data-r=""', region == null) +
      Object.entries(ctx.regions).map(([k, v]) => pill(v, `data-action="region" data-r="${k}"`, region === k)).join('');
    const list = ctx.cities
      .filter((c) => !region || c.region === region)
      .filter((c) => !query || c.name.includes(query))
      .sort((a, b) => favorites.has(b.id) - favorites.has(a.id));
    el.querySelector('#list').innerHTML = list.length ? list.map((c) => {
      const n = now[c.id];
      const fav = favorites.has(c.id);
      return `<div class="city ${c.id === ctx.city.id ? 'current' : ''}">
        <button class="pick" data-action="pick" data-id="${c.id}">
          <span class="bold" style="font-size:16px">${esc(c.name)}</span>
          <span class="muted tiny">${esc([ctx.regions[c.region], n ? F.weatherText(n.code) : null, F.elevation(n?.elevation)].filter(Boolean).join(' · '))}</span>
        </button>
        <button class="icon-btn star" style="background:none" data-action="fav" data-id="${c.id}" aria-pressed="${fav}" aria-label="${fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}: ${esc(c.name)}">${fav ? starFilled() : icon('star', 20)}</button>
        <span class="t">${n ? F.deg(n.temp) : '—'}</span>
      </div>`;
    }).join('') : '<div class="empty">لا توجد نتائج — جرّب اسماً آخر</div>';
  };
  draw();
  el.querySelector('#q').addEventListener('input', (e) => {
    query = e.target.value.trim();
    clearTimeout(searchTimer);
    found = [];
    searching = query.length >= 2;
    draw();
    if (!searching) return;
    const q = query;
    searchTimer = setTimeout(async () => {
      try {
        const r = await api(`/api/search?q=${encodeURIComponent(q)}`);
        if (cancelled() || q !== query) return;
        found = r.data.map((p) => ({ ...p, id: `p${p.lat}_${p.lon}`, kind: 'village', area: p.area || `قرب ${ctx.nearestCity(p.lat, p.lon).name}` }));
      } catch { found = []; }
      searching = false;
      if (!cancelled() && q === query) draw();
    }, 350);
  });
  api('/api/now').then((r) => { if (!cancelled()) { now = r.data; draw(); } }).catch(() => {});

  return actions(el, {
    region: (t) => { region = t.dataset.r || null; draw(); },
    pick: (t) => ctx.setCity(t.dataset.id),
    pickPlace: (t) => {
      const i = Number(t.dataset.i);
      if (i < 0) ctx.navigate('/');
      else if (found[i]) ctx.setPlace(found[i]);
    },
    fav: (t) => {
      const id = t.dataset.id;
      favorites.has(id) ? favorites.delete(id) : favorites.add(id);
      settings.favorites = [...favorites];
      draw();
    },
    locate: async () => {
      msg = 'جارٍ تحديد موقعك…'; draw();
      try {
        const p = await ctx.locate();
        if (!cancelled()) ctx.setPlace(p);
      } catch (e) {
        if (!cancelled()) { msg = e.message; draw(); }
      }
    },
  });
}


// ---------------------------------------------------------------- farming

const SUIT = {
  great: ['ممتاز', 'var(--green)', '#fff'],
  ok: ['جيد', 'var(--green-tint)', 'var(--green-dark)'],
  rainy: ['ماطر', 'var(--blue-tint)', 'var(--blue-ink)'],
  harsh: ['غير مناسب', 'var(--red-tint)', '#8C1D0E'],
};
function suitability(d) {
  if (d.precipProbMax >= 50) return 'rainy';
  if (d.max >= 36 || d.windMax >= 40) return 'harsh';
  if (d.precipProbMax < 25 && d.windMax < 25 && d.max >= 12 && d.max <= 32) return 'great';
  return 'ok';
}
const ALERT_TYPES = {
  rain: ['مطر', 'قبل وصول المنخفضات'],
  frost: ['صقيع', 'لحماية المزروعات ليلاً'],
  heat: ['حر', 'حرارة فوق 35°'],
  wind: ['رياح وغبار', 'رياح قوية'],
  quake: ['زلازل', 'هزات بقوة 3 فأكثر'],
};

function alertSettings() {
  const supported = 'Notification' in window;
  return `<section class="card flush list">
    <div class="toggle-row"><div class="grow"><h2>إشعارات المتصفح</h2><div class="muted tiny">${supported ? 'تصلك التنبيهات الجديدة ما دامت الصفحة مفتوحة' : 'المتصفح لا يدعم الإشعارات'}</div></div>
      <button class="switch" role="switch" data-action="notify" aria-checked="${settings.notify && supported && Notification.permission === 'granted'}" aria-label="إشعارات المتصفح" ${supported ? '' : 'disabled'}></button></div>
    ${Object.entries(ALERT_TYPES).map(([k, [label, hint]]) => `
      <div class="toggle-row"><div class="grow"><div class="bold small">${label}</div><div class="muted tiny">${hint}</div></div>
        <button class="switch" role="switch" data-action="type" data-k="${k}" aria-checked="${settings.alertOn(k)}" aria-label="${label}"></button></div>`).join('')}
  </section>`;
}

async function farming(el, ctx, cancelled) {
  const city = ctx.city;
  el.innerHTML = `<div class="page">${header('الزراعة والتنبيهات', city.name)}<div id="slot"></div><div id="settings">${alertSettings()}</div></div>`;
  const slot = el.querySelector('#slot');
  const run = () => load(slot, `/api/forecast?${ctx.placeQuery()}`, (fc) => {
    const days = fc.days;
    const rain = days.slice(1).find((d) => d.precipProbMax >= 60);
    const frost = days.find((d) => d.min <= 3);
    const rain3 = days.slice(0, 3).reduce((s, d) => s + d.precipSum, 0);
    const spray = days.slice(0, 4).find((d) => d.precipProbMax < 20 && d.windMax < 15);
    return `<div class="page" style="max-width:none">
      ${rain || frost ? `<div class="notice">${icon('bell', 24)}<div>
        ${rain ? `<div class="bold">أمطار متوقعة ${F.relativeDay(rain.date)}</div><div class="small">احتمال ${rain.precipProbMax}% — أنهِ القطف وغطِّ المحصول المقطوف قبلها.</div>` : ''}
        ${frost ? `<div class="bold">خطر صقيع ${F.relativeDay(frost.date)}</div><div class="small">الصغرى ${F.deg(frost.min)} — احمِ الشتلات والمزروعات الحساسة.</div>` : ''}
      </div></div>` : ''}
      <section class="card">
        <h2>ملاءمة الأيام للعمل في الأرض</h2>
        <div class="muted tiny">قطف الزيتون والأعمال الحقلية: مطر قليل ورياح هادئة وحرارة معتدلة</div>
        <div class="suit">${days.slice(0, 5).map((d) => {
          const [label, bg, fg] = SUIT[suitability(d)];
          return `<div style="background:${bg};color:${fg}">${F.relativeDay(d.date)}<b>${label}</b></div>`;
        }).join('')}</div>
      </section>
      <div class="grid2">
        <div class="tile"><div class="label">الري</div><div class="value" style="font-size:15px">${rain3 >= 5 ? `أجّل الري — ${Math.round(rain3)} ملم متوقعة` : 'الري مناسب — لا أمطار مؤثرة'}</div></div>
        <div class="tile"><div class="label">الرش والمبيدات</div><div class="value" style="font-size:15px">${spray ? `مناسب ${F.relativeDay(spray.date)}` : 'رياح أو أمطار — انتظر'}</div></div>
      </div>
    </div>`;
  }, cancelled);
  run();
  const redrawSettings = () => { el.querySelector('#settings').innerHTML = alertSettings(); };
  return actions(el, {
    retry: run,
    type: (t) => { settings.setAlertOn(t.dataset.k, !settings.alertOn(t.dataset.k)); redrawSettings(); },
    notify: async () => {
      if (settings.notify && Notification.permission === 'granted') settings.notify = false;
      else settings.notify = (await Notification.requestPermission()) === 'granted';
      redrawSettings();
    },
  });
}

// ---------------------------------------------------------------- more

function more(el) {
  const items = [
    ['/roads', 'road', 'أحوال الطرق والحواجز'],
    ['/hourly', 'clock', 'تفاصيل اليوم ساعة بساعة'],
    ['/prayer', 'moon', 'أوقات الصلاة والقبلة'],
    ['/alerts', 'bell', 'التنبيهات السابقة'],
    ['/news', 'news', 'أخبار الطقس والمناخ'],
    ['/currency', 'coins', 'أسعار العملات'],
    ['/about', 'compass', 'مصادر البيانات وحول الموقع'],
  ];
  el.innerHTML = `<div class="page">${header('المزيد')}<nav class="menu">${items.map(([href, ic, label]) =>
    `<a href="${href}" data-link><span class="badge">${icon(ic)}</span><span class="grow">${label}</span>${icon('forward', 20)}</a>`).join('')}</nav></div>`;
}

// ---------------------------------------------------------------- prayer

async function prayer(el, ctx, cancelled) {
  const city = ctx.city;
  let method = settings.prayerMethod;
  el.innerHTML = `<div class="page">${header('أوقات الصلاة', `${city.name} · ${F.arabicDate()}`, { back: true })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  const nowHm = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Hebron', hour: '2-digit', minute: '2-digit', hour12: false });
  const mins = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };

  let data = null;
  const view = (d) => {
    const now = mins(nowHm());
    const prayers = d.times.filter((t) => t.name !== 'الشروق');
    const next = prayers.find((t) => mins(t.time) > now) ?? prayers[0];
    let until = mins(next.time) - now;
    if (until < 0) until += 1440;
    return `<div class="page" style="max-width:none">
      <section class="next-prayer" aria-live="polite">
        <div class="small" style="opacity:.85">${esc(d.hijri)}</div>
        <div>الصلاة القادمة</div>
        <div class="big">${esc(next.name)} · ${F.clock(next.time)}</div>
        <div class="until">بعد ${Math.floor(until / 60)} ساعة و ${until % 60} دقيقة</div>
      </section>
      <section class="card flush list">${d.times.map((t) => {
        const isNext = t.name === next.name;
        const past = mins(t.time) <= now && !isNext;
        return `<div class="prow ${isNext ? 'next' : ''} ${past ? 'past' : ''}"><span class="dot"></span><span class="grow">${esc(t.name)}</span><span>${F.clock(t.time)}</span></div>`;
      }).join('')}</section>
      <section class="card"><div class="row">
        <span style="color:var(--green);transform:rotate(${d.qibla}deg);display:inline-flex" aria-hidden="true">${icon('arrowUp', 36)}</span>
        <div><div class="muted tiny">اتجاه القبلة</div><div class="bold">${Math.round(d.qibla)}° من الشمال</div></div>
      </div></section>
      <section class="card"><h2>طريقة الحساب</h2>
        <div class="pills">${Object.entries(d.methods).map(([id, label]) => pill(label, `data-action="method" data-m="${id}"`, Number(id) === method)).join('')}</div>
        <div class="source">المصدر: aladhan.com — قارن مع تقويم الأوقاف المعتمد في منطقتك.</div>
      </section>
    </div>`;
  };
  const run = async () => { data = await load(slot, `/api/prayer?${ctx.placeQuery()}&method=${method}`, view, cancelled); };
  run();
  // Refresh the countdown every 30 s without refetching.
  const timer = setInterval(() => { if (data && !cancelled()) slot.innerHTML = view(data); }, 30_000);
  const off = actions(el, { retry: run, method: (t) => { method = Number(t.dataset.m); settings.prayerMethod = method; run(); } });
  return () => { clearInterval(timer); off(); };
}

// ---------------------------------------------------------------- alerts

const ALERT_STYLE = {
  rain: ['drop', 'var(--blue-tint)', 'var(--blue-ink)'],
  frost: ['moon', '#E4F1F5', '#1C5566'],
  heat: ['thermo', '#FBE7DF', '#8C2F12'],
  wind: ['wind', '#F3ECDD', '#6A4B12'],
  quake: ['wave', '#F1E6F3', '#5E2A6B'],
};
const LEVELS = { info: ['للعلم', '#EEF1EE', '#3A4A40'], warn: ['تحذير', 'var(--amber-tint)', 'var(--amber-ink)'], high: ['خطر', 'var(--red-tint)', '#8C1D0E'] };

async function alerts(el, ctx, cancelled) {
  let filter = null;
  let all = [];
  el.innerHTML = `<div class="page">${header(ctx.liveAlerts ? 'التنبيهات' : 'التنبيهات السابقة', ctx.liveAlerts ? 'التنبيهات الحالية والقادمة لكل فلسطين' : 'آخر 30 يوماً لكل فلسطين', { back: true })}<div class="pills" id="f"></div><div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  const draw = () => {
    el.querySelector('#f').innerHTML = pill('الكل', 'data-action="f" data-k=""', filter == null) +
      Object.entries(ALERT_TYPES).map(([k, [label]]) => pill(label, `data-action="f" data-k="${k}"`, filter === k)).join('');
    const list = all.filter((a) => !filter || a.type === filter);
    if (!list.length) { slot.innerHTML = `<div class="empty">${ctx.liveAlerts ? 'لا توجد تنبيهات حالياً لأي مدينة.' : 'لا توجد تنبيهات. يفحص الخادم التوقعات والزلازل كل 3 ساعات ويسجّل التنبيهات هنا.'}</div>`; return; }
    let last = '';
    slot.innerHTML = `<div class="page" style="max-width:none;gap:10px">${list.map((a) => {
      const d = new Date(a.time);
      const label = F.arabicDate(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Hebron' }));
      const head = label !== last ? `<div class="date-head">${esc(label)}</div>` : '';
      last = label;
      const [ic, bg, fg] = ALERT_STYLE[a.type] ?? ALERT_STYLE.rain;
      const [lv, lbg, lfg] = LEVELS[a.level] ?? LEVELS.info;
      return `${head}<article class="alert">
        <div class="ic" style="background:${bg};color:${fg}">${icon(ic)}</div>
        <div class="grow" style="display:flex;flex-direction:column;gap:2px">
          <div class="row"><span class="bold grow">${esc(a.title)}</span><span class="muted tiny">${d.toLocaleTimeString('ar', { timeZone: 'Asia/Hebron', hour: 'numeric', minute: '2-digit' })}</span></div>
          <div class="muted small">${esc(a.body)}</div>
          <span class="level" style="background:${lbg};color:${lfg}">${lv}</span>
        </div>
      </article>`;
    }).join('')}</div>`;
  };
  const run = async () => {
    slot.innerHTML = spinner;
    try { all = (await api('/api/alerts')).data; if (!cancelled()) draw(); } catch { if (!cancelled()) slot.innerHTML = errorBox(); }
  };
  run();
  return actions(el, { f: (t) => { filter = t.dataset.k || null; draw(); }, retry: run });
}

// ---------------------------------------------------------------- news

const TOPICS = { weather: 'الطقس', climate: 'المناخ', farming: 'الزراعة' };

async function news(el, ctx, cancelled) {
  let topic = 'weather';
  el.innerHTML = `<div class="page">${header('أخبار الطقس والمناخ', 'عناوين من Google News', { back: true })}<div class="pills even" id="t"></div><div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  const run = () => {
    el.querySelector('#t').innerHTML = Object.entries(TOPICS).map(([k, v]) => pill(v, `data-action="topic" data-k="${k}"`, k === topic)).join('');
    return load(slot, `/api/news?topic=${topic}`, (items) => (items.length
      ? `<div class="page" style="max-width:none;gap:10px">${items.map((n) => `
          <a class="news" href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">
            <div class="title">${esc(n.title)}</div>
            <div class="muted tiny">${esc([n.source, F.ago(n.published)].filter(Boolean).join(' · '))}</div>
          </a>`).join('')}</div>`
      : '<div class="empty">لا توجد أخبار الآن</div>'), cancelled);
  };
  run();
  return actions(el, { topic: (t) => { topic = t.dataset.k; run(); }, retry: run });
}

// ---------------------------------------------------------------- roads

const ROAD_STATUS = {
  open: 'سالك',
  busy: 'أزمة',
  closed: 'مغلق',
  unknown: 'لا أخبار',
};
/** Reports older than this are shown faded: the road may have changed since. */
const ROAD_FRESH_MIN = 120;
const ROAD_REFRESH_MS = 2 * 60000;

const minutesAgo = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 60000 : Infinity);
const multiline = (s) => esc(s).replace(/\n/g, '<br>');

/** West Bank part of the outline with the checkpoints as coloured dots (same projection as the map). */
function roadsMap(cps, cities, focus) {
  const K = Math.cos((31.5 * Math.PI) / 180);
  const X = (lon) => ((lon - 34.1) * 92 * K).toFixed(1);
  const Y = (lat) => ((33.4 - lat) * 92).toFixed(1);
  const towns = cities.filter((c) => ['nablus', 'jenin', 'tulkarm', 'ramallah', 'jerusalem', 'bethlehem', 'hebron', 'jericho', 'qalqilya', 'salfit', 'tubas'].includes(c.id));
  const order = { unknown: 0, open: 1, busy: 2, closed: 3 }; // worst on top
  return `<svg class="roads-map" viewBox="54 76 66 108" role="img" aria-label="خريطة الحواجز في الضفة الغربية">
    <path d="${OUTER}" class="land"/>
    ${LAKES.map((d) => `<path d="${d}" class="lake"/>`).join('')}
    ${REGION_LINES.map((d) => `<path d="${d}" class="border"/>`).join('')}
    ${towns.map((c) => `<g class="town"><circle cx="${X(c.lon)}" cy="${Y(c.lat)}" r="0.7"/><text x="${X(c.lon)}" y="${(+Y(c.lat) - 1.6).toFixed(1)}">${esc(c.name)}</text></g>`).join('')}
    ${[...cps].sort((a, b) => order[a.status] - order[b.status]).map((c) => `
      <g class="cp-dot ${c.status}${minutesAgo(c.at) > ROAD_FRESH_MIN ? ' old' : ''}${c.id === focus ? ' focus' : ''}" data-action="focus" data-id="${c.id}" tabindex="0" role="button"
        aria-label="${esc(c.name)}: ${ROAD_STATUS[c.status]}">
        <circle cx="${X(c.lon)}" cy="${Y(c.lat)}" r="${c.status === 'unknown' ? 1 : 1.7}"/>
      </g>`).join('')}
  </svg>`;
}

async function roads(el, ctx, cancelled) {
  let region = '';
  let query = '';
  let focus = null;
  let data = null;
  el.innerHTML = `<div class="page">
    ${header('أحوال الطرق', 'الحواجز والطرق من أخبار السائقين على تلغرام', {
      back: true,
      actions: `<button class="icon-btn" data-action="retry" aria-label="تحديث">${icon('refresh')}</button>`,
    })}
    <div class="banner" role="note">أخبار يرسلها السائقون وقد لا تكون دقيقة أو محدّثة. انظر دائماً إلى وقت الخبر وتحقّق قبل السفر.</div>
    <div id="slot"></div>
  </div>`;
  const slot = el.querySelector('#slot');

  const card = (c) => {
    const old = minutesAgo(c.at) > ROAD_FRESH_MIN;
    return `<article class="cp ${c.status}${old ? ' old' : ''}${c.id === focus ? ' focus' : ''}" id="cp-${c.id}">
      <div class="row">
        <span class="cp-badge">${ROAD_STATUS[c.status]}</span>
        <h3 class="grow">${esc(c.name)}</h3>
        <span class="muted tiny">${esc(F.ago(Date.parse(c.at)))}</span>
      </div>
      <p class="cp-snip">«${esc(c.snippet)}»</p>
      <div class="row tiny muted"><span class="grow">${esc(data.regions[c.region])}${old ? ' · خبر قديم، قد يكون الوضع تغيّر' : ''}</span>
        <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">الرسالة ${icon('external', 14, 'style="display:inline;vertical-align:-2px"')}</a></div>
    </article>`;
  };

  const draw = () => {
    if (!data) return;
    if (!data.sources.some((s) => s.ok)) {
      // Nothing readable yet (e.g. the source is a group, which has no public web page).
      slot.querySelector('#overview').innerHTML = `
        <h2>مصدر أحوال الطرق قيد الربط</h2>
        <p class="muted small" style="margin:0">نعمل على ربط الموقع بالمصدر لعرض حالة الحواجز هنا تلقائياً. إلى ذلك الحين تابع الأخبار مباشرة على تلغرام:</p>
        <div class="pills">${data.sources.map((s) => `<a class="pill" style="text-decoration:none" href="https://t.me/${esc(s.id)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ${icon('external', 14, 'style="display:inline;vertical-align:-2px"')}</a>`).join('')}</div>`;
      for (const id of ['filters', 'cards', 'quiet', 'feed', 'sources']) slot.querySelector(`#${id}`).innerHTML = '';
      slot.querySelectorAll('.search, #h-feed, #sources').forEach((e) => { e.hidden = true; });
      return;
    }
    slot.querySelectorAll('.search, #h-feed, #sources').forEach((e) => { e.hidden = false; });
    const match = (c) => (!region || c.region === region) && (!query || c.name.includes(query));
    const cps = data.checkpoints.filter(match);
    const known = cps.filter((c) => c.status !== 'unknown').sort((a, b) => b.at.localeCompare(a.at));
    const quiet = cps.filter((c) => c.status === 'unknown');
    const count = (s) => data.checkpoints.filter((c) => c.status === s).length;
    const newest = data.feed[0]?.time;
    const byId = Object.fromEntries(data.checkpoints.map((c) => [c.id, c]));

    slot.querySelector('#overview').innerHTML = `
      <div class="roads-sum">
        <div class="tile open"><div class="value num">${count('open')}</div><div class="label">سالك</div></div>
        <div class="tile busy"><div class="value num">${count('busy')}</div><div class="label">أزمة / تفتيش</div></div>
        <div class="tile closed"><div class="value num">${count('closed')}</div><div class="label">مغلق</div></div>
      </div>
      ${roadsMap(data.checkpoints.filter((c) => !region || c.region === region), ctx.cities, focus)}
      <div class="roads-legend tiny muted">
        <span><i class="open"></i>سالك</span><span><i class="busy"></i>أزمة</span><span><i class="closed"></i>مغلق</span><span><i class="unknown"></i>لا أخبار</span>
      </div>
      <div class="source">آخر رسالة ${newest ? esc(F.ago(Date.parse(newest))) : '—'} · يتحدّث تلقائياً كل دقيقتين · المواقع على الخريطة تقريبية</div>`;

    slot.querySelector('#filters').innerHTML =
      pill('الكل', 'data-action="region" data-r=""', !region) +
      Object.entries(data.regions).map(([k, v]) => pill(v, `data-action="region" data-r="${k}"`, region === k)).join('');

    slot.querySelector('#cards').innerHTML = known.length
      ? known.map(card).join('')
      : '<div class="empty">لا أخبار عن حواجز في هذه المنطقة خلال آخر 12 ساعة</div>';
    slot.querySelector('#quiet').innerHTML = quiet.length
      ? `<h2>بلا أخبار في آخر 12 ساعة</h2><div class="quiet-list">${quiet.map((c) => `<span>${esc(c.name)}</span>`).join('')}</div>` : '';

    slot.querySelector('#feed').innerHTML = data.feed.length ? data.feed.map((p) => `
      <article class="post">
        <div class="post-text">${multiline(p.text)}</div>
        ${p.mentions.length ? `<div class="post-tags">${p.mentions.map((m) => `<span class="tag ${m.status ?? 'unknown'}">${esc(byId[m.id]?.name ?? m.id)}${m.status ? ` · ${ROAD_STATUS[m.status]}` : ''}</span>`).join('')}</div>` : ''}
        <div class="row tiny muted"><span class="grow">${esc(F.ago(Date.parse(p.time)))} · ${esc(data.sources.find((s) => s.id === p.channel)?.name ?? p.channel)}</span>
          <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">فتح في تلغرام</a></div>
      </article>`).join('') : '<div class="empty">لا رسائل الآن</div>';

    slot.querySelector('#sources').innerHTML = `<h2>المصادر</h2>${data.sources.map((s) => `
      <div class="row small"><span class="grow"><a href="https://t.me/${esc(s.id)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a> <span class="muted tiny">t.me/${esc(s.id)}</span></span>
        <span class="tiny ${s.ok ? 'muted' : ''}" style="${s.ok ? '' : 'color:var(--red)'}">${s.ok ? `${s.count} رسالة` : 'تعذّرت القراءة'}</span></div>`).join('')}
      <p class="muted tiny" style="margin:0">نقرأ الرسائل العامة للقناة ونستخرج منها أسماء الحواجز وكلمات مثل «سالك» و«أزمة» و«مسكّر». القراءة آلية وقد تخطئ، فاقرأ نص الرسالة دائماً.</p>`;
  };

  const run = async () => {
    const r = await load(slot, '/api/roads', () => `<div class="page" style="max-width:none">
      <section class="card roads-top" id="overview"></section>
      <div class="pills" id="filters"></div>
      <label class="search">${icon('search', 20)}<span class="sr-only">ابحث عن حاجز</span>
        <input id="q" type="search" placeholder="ابحث عن حاجز" autocomplete="off" value="${esc(query)}"></label>
      <section class="cp-grid" id="cards" aria-label="حالة الحواجز"></section>
      <section id="quiet"></section>
      <section aria-labelledby="h-feed"><h2 id="h-feed" style="margin-bottom:8px">آخر الرسائل</h2><div class="feed" id="feed"></div></section>
      <section class="card" id="sources"></section>
    </div>`, cancelled);
    if (!r) return;
    data = r;
    draw();
    slot.querySelector('#q').addEventListener('input', (e) => { query = e.target.value.trim(); draw(); });
  };
  // Silent refresh: keep the page as it is and only swap in new data.
  const refresh = async () => {
    try {
      const r = await api('/api/roads');
      if (!cancelled() && data) { data = r.data; draw(); }
    } catch { /* keep showing what we have */ }
  };
  run();
  const timer = setInterval(refresh, ROAD_REFRESH_MS);
  const focusOn = (id) => {
    focus = id;
    draw();
    el.querySelector(`#cp-${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  el.addEventListener('keydown', (e) => {
    const t = e.target.closest?.('[data-action="focus"]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); focusOn(t.dataset.id); }
  });
  const off = actions(el, {
    region: (t) => { region = t.dataset.r; draw(); },
    focus: (t) => focusOn(t.dataset.id),
    retry: () => (data ? refresh() : run()),
  });
  return () => { clearInterval(timer); off(); };
}

// ---------------------------------------------------------------- currency

async function currency(el, ctx, cancelled) {
  el.innerHTML = `<div class="page">${header('أسعار العملات', 'مقابل الشيكل', { back: true })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  let from = 'USD';
  let amount = '100';
  let data = null;

  const fmt = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const result = () => {
    const r = data.rates[from];
    const n = parseFloat(amount.replace(',', '.')) || 0;
    el.querySelector('#res').innerHTML = `<span class="grow small" style="opacity:.85">${esc(amount)} ${esc(r?.name ?? from)} =</span><span class="v num">${r ? fmt(n * r.ils) : '—'} ₪</span>`;
    el.querySelectorAll('.codes button').forEach((b) => b.setAttribute('aria-checked', b.dataset.c === from));
  };
  const run = async () => {
    data = await load(slot, '/api/rates', (d) => `<div class="page" style="max-width:none">
      <section class="converter">
        <label>المبلغ<input id="amt" inputmode="decimal" value="${esc(amount)}" aria-label="المبلغ"></label>
        <div class="codes" role="radiogroup" aria-label="العملة">${Object.keys(d.rates).map((c) =>
          `<button role="radio" data-action="code" data-c="${c}" aria-checked="${c === from}">${c}</button>`).join('')}</div>
        <div class="result" id="res" aria-live="polite"></div>
      </section>
      <section class="card flush list">${Object.entries(d.rates).map(([code, r]) => `
        <div class="rate"><div class="grow"><div class="bold">${esc(r.name)}</div><div class="muted tiny">${code}</div></div>
          <span class="bold num">${fmt(r.ils, r.ils < 1 ? 3 : 2)} ₪</span></div>`).join('')}</section>
      <div class="source">أسعار مرجعية يومية من open.er-api.com${d.updated ? ` (${esc(d.updated.slice(0, 16))})` : ''}. أسعار الصرافين للبيع والشراء تختلف عنها.</div>
    </div>`, cancelled);
    if (!data) return;
    result();
    el.querySelector('#amt').addEventListener('input', (e) => { amount = e.target.value.replace(/[^\d.,]/g, ''); result(); });
  };
  run();
  return actions(el, { code: (t) => { from = t.dataset.c; result(); }, retry: run });
}

// ---------------------------------------------------------------- about

function about(el) {
  const sources = [
    ['الطقس والتوقعات والأمطار والسحب والعواصف', 'Open-Meteo — open-meteo.com'],
    ['جودة الهواء', 'Open-Meteo Air Quality'],
    ['الزلازل', 'USGS — earthquake.usgs.gov'],
    ['أوقات الصلاة', 'Aladhan — aladhan.com'],
    ['أسعار العملات', 'ExchangeRate-API — open.er-api.com'],
    ['الأخبار', 'Google News RSS'],
    ['أحوال الطرق والحواجز', 'قناة «أحوال الطرق» على تلغرام — t.me/ahwalaltreq (أخبار يرسلها الناس)'],
    ['حدود الخريطة', 'Natural Earth (ملكية عامة)'],
  ];
  el.innerHTML = `<div class="page">${header('حول الموقع', 'طقس فلسطين', { back: true })}
    <section class="card"><h2>مصادر البيانات</h2>${sources.map(([w, s]) => `<div><div class="bold small">${w}</div><div class="muted tiny">${s}</div></div>`).join('')}</section>
    <section class="card"><p class="muted small" style="margin:0">طبقة «العواصف» على الخريطة تعرض مؤشر CAPE (طاقة الحمل الكامنة) من نموذج الطقس، وهو يدل على ملاءمة الجو للعواصف الرعدية وليس رصداً مباشراً لمواقع البرق.</p></section>
  </div>`;
}

export const views = {
  '/': home,
  '/hourly': hourly,
  '/cities': cities,
  '/farming': farming,
  '/more': more,
  '/prayer': prayer,
  '/alerts': alerts,
  '/news': news,
  '/roads': roads,
  '/currency': currency,
  '/about': about,
};
