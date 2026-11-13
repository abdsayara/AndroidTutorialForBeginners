// Page views. Each view renders into `el` and may return a cleanup function.
import { api, settings } from './api.js';
import * as F from './format.js';
import { esc } from './format.js';
import { icon, starFilled, weatherIcon } from './icons.js';
import { OUTER, REGION_LINES, LAKES } from './shape.js';
import { minutesText, rainNowcast, summarize, skyKind, dustAlert, clothingAdvice, prayerWeather, seasonCard, sunDay, moonPhase, wearKind, wearItems } from './insights.js';
import { wearAvatar } from './avatar.js';

// ---------------------------------------------------------------- helpers

const spinner = '<div class="loading" role="status" aria-label="جارٍ التحميل"><div class="spinner"></div></div>';

const staleBanner = (r) => (r.stale
  ? `<div class="banner" role="status">تعذّر التحديث — تُعرض آخر بيانات محفوظة (${esc(new Date(r.fetchedAt).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' }))})</div>`
  : '');

const errorBox = (retryAction = 'retry') =>
  `<div class="empty">لا يمكن جلب البيانات الآن ولا توجد نسخة محفوظة.<br><button class="pill" data-action="${retryAction}">إعادة المحاولة</button></div>`;

function header(title, subtitle, { back = false, actions = '', logo = false } = {}) {
  return `<header class="header">
    ${logo ? '<img class="header-logo" src="/logo.svg" width="54" height="41" alt="">' : ''}
    ${back ? `<a class="icon-btn" href="${typeof back === 'string' ? back : '/more'}" data-link aria-label="رجوع">${icon('back')}</a>` : ''}
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

function dustCard(air) {
  const d = dustAlert(air);
  return d ? `<section class="card alert-card ${d.heavy ? 'heavy' : ''}" role="status">
      <div class="row">${icon('wind', 20)}<strong class="grow">${esc(d.title)}</strong></div>
      <p>${esc(d.text)}</p>
    </section>` : '';
}

/** A detail tile like the big weather apps' (same as the app's MetricTile): icon and label, the value
 * large, a note, a scale with a dot (UV, air) or a fill (humidity), and a soft-focus emblem. */
function metric(ic, label, value, note, fraction, scale) {
  const f = fraction == null ? null : Math.max(0, Math.min(1, fraction));
  const bar = f == null ? '' : scale
    ? `<div class="m-scale" aria-hidden="true"><i style="inset-inline-start:calc(${(f * 100).toFixed(1)}% - ${(f * 10).toFixed(1)}px)"></i></div>`
    : `<div class="m-fill" aria-hidden="true"><i style="width:${(f * 100).toFixed(1)}%"></i></div>`;
  return `<div class="tile metric"><span class="m-emblem" aria-hidden="true">${icon(ic, 92)}</span>
    <div class="label">${icon(ic, 16)} ${esc(label)}</div>
    <div class="m-value">${esc(value)}</div>${note ? `<div class="m-note">${esc(note)}</div>` : ''}${bar}</div>`;
}
const humidityText = (h) => (h == null ? '' : h < 30 ? 'جافة' : h < 60 ? 'مريحة' : h < 80 ? 'رطبة' : 'رطبة جداً');

/** «شو نلبس بكرا؟»: the text, the clothes as chips, the figure (tap it) and a day / night switch. */
function wearCard(day, text, night) {
  const w = wearKind(day, night);
  return `<div class="mini wear" data-night="${night}">
    <div class="wear-row">
      <div class="grow">
        <div class="mini-h">${icon('thermo', 18)} شو نلبس بكرا؟</div>
        <p id="wear-text">${esc(text)}</p>
        <div class="wear-items">${wearItems(w).map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      </div>
      ${wearAvatar(w, 96)}
      <div class="wear-dn" role="group" aria-label="ملابس النهار أو الليل">
        <button data-action="wear-day" aria-pressed="${!night}" aria-label="ملابس النهار">${icon('sun', 18)}</button>
        <button data-action="wear-night" aria-pressed="${night}" aria-label="ملابس الليل">${icon('moon', 18)}</button>
      </div>
    </div>
  </div>`;
}

/** "شو نلبس؟", the next prayer's weather and the farming season, as small cards. */
function todayCards(fc, prayer, nowIso) {
  const late = Number(String(nowIso).slice(11, 13)) >= 15;
  const wearDay = late ? fc.days[1] : fc.days[0];
  const wear = clothingAdvice(wearDay);
  const pw = prayerWeather(prayer?.times, fc.hours, nowIso);
  const season = seasonCard(fc.days, nowIso, F.dayName);
  const cards = [];
  // «شو نلبس بكرا؟»: the advice of the day's bulletin when it loads (see loadBulletin), ours until then,
  // with a figure dressed for tomorrow.
  const tomorrow = fc.days[1] ?? fc.days[0];
  const tomorrowWear = clothingAdvice(tomorrow) ?? wear;
  if (tomorrowWear) cards.push(wearCard(tomorrow, tomorrowWear, false));
  if (pw) {
    const when = pw.tomorrow ? 'غداً' : pw.minutes < 15 ? `بعد ${pw.minutes} دقائق` : pw.minutes < 180 ? `بعد ${minutesText(Math.round(pw.minutes / 15) * 15)}` : `الساعة ${F.clock(pw.time)}`;
    const wx = pw.hour ? `، والطقس وقتها ${F.weatherText(pw.hour.code)} ${F.deg(pw.hour.temp)}` : '';
    cards.push(`<a class="mini" href="/prayer" data-link><div class="mini-h">${icon('moon', 18)} ${esc(pw.name)} ${esc(when)}</div><p>${esc(`أذان ${pw.name} الساعة ${F.clock(pw.time)}${wx}`)}</p></a>`);
  }
  if (season) cards.push(`<a class="mini" href="/farming" data-link><div class="mini-h">${icon('leaf', 18)} ${esc(season.title)}</div><p>${esc(season.text)}</p></a>`);
  return cards.length ? `<section class="minis" aria-label="لليوم">${cards.join('')}</section>` : '';
}

/** The sun's path across today's sky, and tonight's moon. */
function skyCard(today, nowIso) {
  const sun = sunDay(today.sunrise, today.sunset, nowIso);
  const moon = moonPhase(new Date());
  let sunSvg = '';
  if (sun) {
    // Sunrise on the right (where an Arabic line starts), sunset on the left.
    const p = Math.min(1, Math.max(0, sun.progress));
    const a = Math.PI * p;
    const x = (100 + 90 * Math.cos(a)).toFixed(1);
    const y = (100 - 90 * Math.sin(a)).toFixed(1);
    sunSvg = `<svg class="sun-arc" viewBox="0 0 200 112" aria-hidden="true">
        <path d="M190 100 A90 90 0 0 0 10 100" class="arc"/>
        ${p > 0 ? `<path d="M190 100 A90 90 0 0 0 ${x} ${y}" class="arc done"/>` : ''}
        <line x1="2" y1="100" x2="198" y2="100" class="horizon"/>
        ${sun.up ? `<circle cx="${x}" cy="${y}" r="9" class="sun-dot"/>` : ''}
      </svg>`;
  }
  // Lit side on the right while waxing, on the left while waning.
  const r = 22;
  const right = moon.fraction < 0.5;
  const gibbous = moon.lit > 0.5;
  const rx = (r * Math.abs(Math.cos(2 * Math.PI * moon.fraction))).toFixed(2);
  const lit = moon.lit < 0.02 ? '' : moon.lit > 0.98 ? `<circle cx="30" cy="30" r="${r}" class="moon-lit"/>`
    : `<path class="moon-lit" d="M30 ${30 - r} A${r} ${r} 0 0 ${right ? 1 : 0} 30 ${30 + r} A${rx} ${r} 0 0 ${right ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1)} 30 ${30 - r}Z"/>`;
  return `<section class="card sky-card" aria-label="الشمس والقمر">
      <div class="sun-part">
        ${sunSvg}
        <div class="row small"><span>${icon('sun', 16)} الشروق ${today.sunrise ? F.clock(today.sunrise) : '—'}</span><span class="grow"></span><span>الغروب ${today.sunset ? F.clock(today.sunset) : '—'}</span></div>
        ${sun ? `<div class="tiny muted center">طول النهار ${esc(sun.length)}</div>` : ''}
      </div>
      <div class="moon-part">
        <svg viewBox="0 0 60 60" width="64" height="64" aria-hidden="true"><circle cx="30" cy="30" r="${r}" class="moon-dark"/>${lit}</svg>
        <div><div class="bold">${esc(moon.name)}</div><div class="tiny muted">مضاء ${F.ltr(`${Math.round(moon.lit * 100)}%`)} · عمر القمر ${Math.round(moon.age)} يوماً</div></div>
      </div>
    </section>`;
}

/** The home sections the person can move or hide, in their default order. */
const HOME_SECTIONS = [
  ['hours', 'الساعات القادمة'],
  ['today', 'شو نلبس والصلاة والموسم'],
  ['bulletin', 'النشرة الجوية'],
  ['roads', 'أحوال الطرق'],
  ['sky', 'الشمس والقمر'],
  ['details', 'الرطوبة والأشعة والهواء'],
  ['week', 'توقعات 14 يوماً'],
];
const HOME_NAMES = Object.fromEntries(HOME_SECTIONS);

/** The saved order, with any section added since appended at its default place. */
function homeOrder() {
  const saved = (settings.homeOrder ?? []).filter((id) => HOME_NAMES[id]);
  const out = [...saved];
  HOME_SECTIONS.forEach(([id], i) => {
    if (!out.includes(id)) out.splice(Math.min(i, out.length), 0, id);
  });
  return out;
}

function homeBody(fc, air, prayer) {
  const aqi = air?.aqi;
  const c = fc.current;
  const nowKey = (c.time ?? '').slice(0, 13);
  let nowIdx = fc.hours.findIndex((h) => h.time.slice(0, 13) >= nowKey);
  if (nowIdx < 0) nowIdx = 0;
  const today = fc.days[0] ?? {};
  const lo = Math.min(...fc.days.map((d) => d.min));
  const hi = Math.max(...fc.days.map((d) => d.max));
  const span = Math.max(1, hi - lo);

  // The next 24 hours, with the new day's name just before its 12 at night.
  const hours = fc.hours.slice(nowIdx, nowIdx + 24).map((h, i) => `${i > 0 && h.time.slice(11, 13) === '00' ? `<div class="hour-day" aria-label="${F.dayName(h.time.slice(0, 10))}"><span>${F.dayName(h.time.slice(0, 10))}</span></div>` : ''}
    <div class="hour ${i === 0 ? 'now' : ''}">
      <span>${i === 0 ? 'الآن' : F.hourLabel(h.time)}</span>
      ${weatherIcon(h.code, { isDay: h.isDay, size: 22, cloudColor: i === 0 ? '#fff' : 'var(--muted)' })}
      <span class="t">${F.deg(h.temp)}</span>
      ${h.precipProb >= 20 ? `<span class="p">${h.precipProb}%</span>` : ''}
    </div>`).join('');

  // Today's bar carries a dot at the temperature right now.
  const nowDot = (d) => {
    const t = Math.min(d.max, Math.max(d.min, c.temp));
    return `<i class="now-dot" style="inset-inline-start:${((t - lo) / span) * 100}%"></i>`;
  };
  const days = fc.days.map((d, i) => `
    <div class="day">
      <span class="name">${F.relativeDay(d.date)}<small class="dm">${F.ltr(`${Number(d.date.slice(8, 10))}/${Number(d.date.slice(5, 7))}`)}</small></span>
      ${weatherIcon(d.code, { size: 22 })}
      <span class="prob">${d.precipProbMax >= 10 ? `${d.precipProbMax}%` : ''}</span>
      <span class="muted">${F.deg(d.min)}</span>
      <div class="range" aria-hidden="true"><span style="inset-inline-start:${((d.min - lo) / span) * 100}%;inset-inline-end:${((hi - d.max) / span) * 100}%"></span>${i === 0 && c.temp != null ? nowDot(d) : ''}</div>
      <span class="bold">${F.deg(d.max)}</span>
    </div>`).join('');

  const nowIso = c.time;
  const nc = rainNowcast(fc.minutely, nowIso);
  const peak = nc ? Math.max(1, ...nc.steps.map((s) => s.precip)) : 1;
  const nowcast = nc ? `
    <section class="card nowcast ${nc.kind}" aria-label="المطر خلال الساعتين القادمتين">
      <div class="row">${icon('drop', 20)}<strong class="grow">${esc(nc.text)}</strong></div>
      <div class="nc-bars" aria-hidden="true">${nc.steps.map((s) => `<span style="height:${Math.max(6, Math.round((s.precip / peak) * 100))}%" class="${s.precip >= 0.1 ? 'wet' : ''}"></span>`).join('')}</div>
      <div class="row tiny muted"><span class="grow">الآن</span><span>بعد ساعتين</span></div>
    </section>` : '';

  const sections = {
    hours: `<section aria-labelledby="h-hours">
      <div class="row"><h2 id="h-hours" class="grow">الساعات القادمة</h2><a class="link-btn" href="/hourly" data-link>التفاصيل</a></div>
      <div class="hours" tabindex="0" aria-label="توقعات الساعات القادمة">${hours}</div>
    </section>`,
    today: todayCards(fc, prayer, nowIso),
    bulletin: '<section class="card bulletin" id="bulletin" aria-labelledby="h-bulletin" hidden></section>',
    roads: '<section class="card roads-home" id="roads-home" aria-label="أحوال الطرق" hidden></section>',
    sky: skyCard(today, nowIso),
    details: `<section class="grid2 grid3 metrics" aria-label="تفاصيل">
      ${metric('drop', 'الرطوبة', c.humidity != null ? `${c.humidity}%` : '—', humidityText(c.humidity), c.humidity != null ? c.humidity / 100 : null, false)}
      ${metric('sun', 'الأشعة فوق البنفسجية', F.round(today.uvMax), F.uvText(today.uvMax), today.uvMax != null ? today.uvMax / 11 : null, true)}
      ${metric('wind', 'جودة الهواء', aqi != null ? String(aqi) : '—', aqi != null ? F.aqiText(aqi) : '', aqi != null ? aqi / 100 : null, true)}
    </section>`,
    week: `<section aria-labelledby="h-week"><h2 id="h-week">توقعات 14 يوماً</h2><div class="card flush list" style="margin-top:8px">${days}</div></section>`,
  };
  const hidden = new Set(settings.homeHidden);

  return `
    <section class="hero" data-sky="${skyKind(fc, nowIso)}" aria-label="الطقس الآن">
      <div class="sky" aria-hidden="true"></div>
      <div class="row">
        <div class="grow">
          <div class="temp">${F.deg(c.temp)}</div>
          <div class="cond">${F.weatherText(c.code)}</div>
          <div class="meta"><span>العظمى ${F.deg(today.max)}</span> · <span>الصغرى ${F.deg(today.min)}</span> · <span>الإحساس ${F.deg(c.apparent)}</span></div>
        </div>
        ${weatherIcon(c.code, { isDay: c.isDay, size: 104, cloudColor: '#fff', sunColor: 'var(--sun)' })}
      </div>
      <div class="chips">
        <div class="chip">${icon('drop', 16)} مطر ${fc.hours[nowIdx]?.precipProb ?? 0}%</div>
        <div class="chip">${icon('wind', 16)} ${F.round(c.wind)} كم/س ${F.windDir(c.windDir)}</div>
      </div>
      <p class="hero-summary">${esc(summarize(fc, nowIso))}</p>
    </section>
${dustCard(air)}
${nowcast}
${homeOrder().filter((id) => !hidden.has(id)).map((id) => sections[id]).join('\n')}
    <div class="center"><button class="link-btn" data-action="customize">${icon('edit', 16)} تخصيص الرئيسية</button></div>
    <section class="card customize" id="customize" hidden aria-label="تخصيص الرئيسية"></section>
`;
}

/** The ordering editor: ↑ / ↓ to move a section, a switch to show or hide it. */
function customizeBody() {
  const order = homeOrder();
  const hidden = new Set(settings.homeHidden);
  return `<div class="row"><h2 class="grow">تخصيص الرئيسية</h2><button class="link-btn" data-action="customize-reset">الترتيب الأصلي</button><button class="link-btn" data-action="customize">تم</button></div>
    <p class="tiny muted" style="margin:0 0 6px">رتّب أقسام الصفحة الرئيسية كما تحب، وأخفِ ما لا تحتاجه.</p>
    ${order.map((id, i) => `<div class="cz-row">
      <span class="grow ${hidden.has(id) ? 'muted' : 'bold'}">${esc(HOME_NAMES[id])}</span>
      <button class="icon-btn sm" data-action="move" data-id="${id}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="نقل ${esc(HOME_NAMES[id])} للأعلى">↑</button>
      <button class="icon-btn sm" data-action="move" data-id="${id}" data-d="1" ${i === order.length - 1 ? 'disabled' : ''} aria-label="نقل ${esc(HOME_NAMES[id])} للأسفل">↓</button>
      <button class="switch" role="switch" aria-checked="${!hidden.has(id)}" data-action="toggle-section" data-id="${id}" aria-label="إظهار ${esc(HOME_NAMES[id])}"></button>
    </div>`).join('')}`;
}

/** A short roads summary for the home page: counts and the closed checkpoints. */
async function loadRoadsHome(box, cancelled) {
  if (!box) return;
  try {
    const r = await api('/api/roads');
    if (cancelled() || !r.data?.sources?.some((s) => s.ok)) return;
    const all = r.data.checkpoints ?? [];
    const count = (...s) => all.filter((c) => s.includes(c.status)).length;
    const closed = all.filter((c) => c.status === 'closed').slice(0, 4).map((c) => c.name);
    box.innerHTML = `<div class="row"><h2 class="grow">${icon('road', 20)} أحوال الطرق</h2><a class="link-btn" href="/roads" data-link>كل الحواجز</a></div>
      <div class="rh-counts">
        <span class="rh open"><b class="num">${count('open')}</b> سالك</span>
        <span class="rh busy"><b class="num">${count('busy', 'crisis')}</b> أزمة</span>
        <span class="rh closed"><b class="num">${count('closed')}</b> مغلق</span>
      </div>
      ${closed.length ? `<p class="small muted" style="margin:6px 0 0">مغلق الآن: ${closed.map(esc).join('، ')}</p>` : ''}`;
    box.hidden = false;
  } catch { /* the section just stays hidden */ }
}

function swapWear(btn, night) {
  const card = btn.closest('.mini.wear');
  if (!card || !lastForecast) return;
  const text = card.querySelector('#wear-text')?.textContent ?? '';
  const day = lastForecast.days[1] ?? lastForecast.days[0];
  card.outerHTML = wearCard(day, text, night);
}
let lastForecast = null;

async function home(el, ctx, cancelled) {
  const city = ctx.city;
  const subtitle = (elev) => [city.kind === 'gps' ? 'موقعك الحالي' : null, city.region ? null : city.area, elev, F.arabicDate()].filter(Boolean).join(' · ');
  el.innerHTML = `<div class="page">
    ${header(city.name, null, {
      logo: true,
      actions: `<a class="icon-btn" href="/alerts" data-link aria-label="التنبيهات">${icon('bell')}</a>
                <button class="icon-btn" data-action="share" aria-label="مشاركة الطقس كصورة">${icon('share')}</button>
                <button class="icon-btn" data-action="retry" aria-label="تحديث">${icon('refresh')}</button>
                <a class="icon-btn" href="/cities" data-link aria-label="تغيير المدينة">${icon('search')}</a>`,
    })}
    <div class="subtitle home-sub">${esc(subtitle(null))}</div>
    <div id="slot"></div>
  </div>`;
  const slot = el.querySelector('#slot');
  let last = null;
  let editing = false;
  const draw = () => {
    const [fc, air, prayer] = last;
    lastForecast = fc.data;
    const y = window.scrollY;
    const sky = skyKind(fc.data, fc.data.current.time);
    document.documentElement.dataset.sky = sky;
    settings.sky = sky;
    const SKY_HEX = { day: '#1F74B0', night: '#16304F', dusk: '#A44F27', cloudy: '#4A6476', fog: '#5E707B', rain: '#2E4A60', storm: '#213042', snow: '#4B6E8C' };
    document.getElementById('theme-color')?.setAttribute('content', SKY_HEX[sky] ?? '#1F74B0');
    slot.innerHTML = staleBanner(fc) + `<div class="page" style="max-width:none">${homeBody(fc.data, air?.data, prayer?.data)}</div>`;
    loadBulletin(slot.querySelector('#bulletin'), cancelled);
    loadRoadsHome(slot.querySelector('#roads-home'), cancelled);
    if (editing) {
      const box = slot.querySelector('#customize');
      box.innerHTML = customizeBody();
      box.hidden = false;
      window.scrollTo(0, y);
    }
  };
  const run = async () => {
    slot.innerHTML = spinner;
    try {
      const [fc, air, prayer] = await Promise.all([
        api(`/api/forecast?${ctx.placeQuery()}`),
        api(`/api/air?${ctx.placeQuery()}`).catch(() => null),
        api(`/api/prayer?${ctx.placeQuery()}&method=${settings.prayerMethod}`).catch(() => null),
      ]);
      if (cancelled()) return;
      const sub = el.querySelector('.subtitle');
      if (sub) sub.textContent = subtitle(F.elevation(fc.data.elevation));
      // Remember it so the selected village / GPS row on the cities page can show it too.
      if (!city.region && fc.data.elevation != null && city.elevation !== fc.data.elevation) ctx.setPlace({ ...city, elevation: fc.data.elevation }, { go: false });
      last = [fc, air, prayer];
      draw();
    } catch {
      if (!cancelled()) slot.innerHTML = errorBox();
    }
  };
  run();
  return actions(el, {
    retry: run,
    // The figure waves back when tapped; the switch dresses it for the day or the night.
    wave: (t) => {
      t.classList.remove('hello');
      void t.getBoundingClientRect();
      t.classList.add('hello');
    },
    'wear-day': (t) => swapWear(t, false),
    'wear-night': (t) => swapWear(t, true),
    share: async () => {
      if (!last) return;
      const { openShare } = await import('./share.js');
      openShare(city.name, last[0].data);
    },
    customize: () => {
      editing = !editing;
      if (!last) return;
      draw();
      if (editing) slot.querySelector('#customize').scrollIntoView({ block: 'nearest' });
    },
    move: (t) => {
      const order = homeOrder();
      const i = order.indexOf(t.dataset.id);
      const j = i + Number(t.dataset.d);
      if (i < 0 || j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      settings.homeOrder = order;
      draw();
      slot.querySelector(`[data-action="move"][data-id="${t.dataset.id}"][data-d="${t.dataset.d}"]:not([disabled])`)?.focus();
    },
    'toggle-section': (t) => {
      const hidden = new Set(settings.homeHidden);
      if (hidden.has(t.dataset.id)) hidden.delete(t.dataset.id); else hidden.add(t.dataset.id);
      settings.homeHidden = [...hidden];
      draw();
      slot.querySelector(`[data-action="toggle-section"][data-id="${t.dataset.id}"]`)?.focus();
    },
    'customize-reset': () => {
      settings.homeOrder = null;
      settings.homeHidden = [];
      draw();
    },
  });
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
        <span class="bold" style="font-size:16px">${p.kind === 'gps' ? icon('locate', 16, 'style="display:inline;vertical-align:-2px;color:var(--brand)"') + ' ' : ''}${esc(p.name)}</span>
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

// The same colours as the app's FarmingScreen (Suitability).
const SUIT = {
  great: ['ممتاز', '#3FCF8A', '#0B3B24'],
  ok: ['جيد', 'rgba(63, 207, 138, 0.22)', '#fff'],
  rainy: ['ماطر', 'rgba(174, 215, 255, 0.24)', '#fff'],
  harsh: ['غير مناسب', 'rgba(255, 159, 144, 0.26)', '#fff'],
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
  el.innerHTML = `<div class="page">${header('الزراعة والتنبيهات', city.name, { back: true })}<div id="slot"></div><div id="settings">${alertSettings()}</div></div>`;
  const slot = el.querySelector('#slot');
  const run = () => load(slot, `/api/forecast?${ctx.placeQuery()}`, (fc) => {
    const days = fc.days;
    const rain = days.slice(1).find((d) => d.precipProbMax >= 60);
    const frost = days.find((d) => d.min <= 3);
    const rain3 = days.slice(0, 3).reduce((s, d) => s + d.precipSum, 0);
    const spray = days.slice(0, 4).find((d) => d.precipProbMax < 20 && d.windMax < 15);
    return `<div class="page" style="max-width:none">
      ${rain || frost ? `<div class="notice">${icon('bell', 24)}<div>
        ${rain ? `<div class="bold">أمطار متوقعة ${F.relativeDay(rain.date)}</div><div class="small">احتمال ${rain.precipProbMax}% — أنجز أعمالك الحقلية وغطِّ المحاصيل قبلها.</div>` : ''}
        ${frost ? `<div class="bold">خطر صقيع ${F.relativeDay(frost.date)}</div><div class="small">الصغرى ${F.deg(frost.min)} — احمِ الشتلات والمزروعات الحساسة.</div>` : ''}
      </div></div>` : ''}
      <section class="card">
        <h2>ملاءمة الأيام للعمل في الأرض</h2>
        <div class="muted tiny">الأعمال الحقلية: مطر قليل ورياح هادئة وحرارة معتدلة</div>
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
    ['/farming', 'leaf', 'الزراعة والتنبيهات'],
    ['/hourly', 'clock', 'تفاصيل اليوم ساعة بساعة'],
    ['/prayer', 'moon', 'أوقات الصلاة والقبلة'],
    ['/alerts', 'bell', 'التنبيهات السابقة'],
    ['/reports', 'news', 'التقارير اليومية'],
    ['/stations', 'thermo', 'محطات الطقس'],
    ['/currency', 'coins', 'أسعار العملات'],
    ['/welcome', 'star', 'تعرّف على طقس فلسطين', true],
  ];
  el.innerHTML = `<div class="page">${header('المزيد')}<nav class="menu">${items.map(([href, ic, label, page]) =>
    `<a href="${href}" ${page ? '' : 'data-link'}><span class="badge">${icon(ic)}</span><span class="grow">${label}</span>${icon('forward', 20)}</a>`).join('')}</nav>
    <div class="source">بيانات الطقس © Open-Meteo (CC BY 4.0) · القرى © GeoNames (CC BY 4.0) · الخرائط © OpenStreetMap · العملات ExchangeRate-API</div></div>`;
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
        <span style="color:var(--brand);transform:rotate(${d.qibla}deg);display:inline-flex" aria-hidden="true">${icon('arrowUp', 36)}</span>
        <div><div class="muted tiny">اتجاه القبلة</div><div class="bold">${Math.round(d.qibla)}° من الشمال</div></div>
      </div></section>
      <section class="card"><h2>طريقة الحساب</h2>
        <div class="pills">${Object.entries(d.methods).map(([id, label]) => pill(label, `data-action="method" data-m="${id}"`, Number(id) === method)).join('')}</div>
        <div class="source">قارن مع تقويم الأوقاف المعتمد في منطقتك.</div>
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

// ---------------------------------------------------------------- طقس الوطن (p-weather.ps)


/** The detailed bulletin card on the home page; stays hidden if the source can't be read. */
async function loadBulletin(box, cancelled) {
  if (!box) return;
  try {
    const { data } = await api('/api/bulletin');
    if (cancelled()) return;
    if (data.wear) {
      const w = document.getElementById('wear-text');
      if (w) w.textContent = data.wear;
    }
    // Days that are over go away, even from a copy cached before midnight.
    const today = F.todayIso();
    const iso = (s) => {
      const ymd = String(s ?? '').match(/(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})/);
      if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
      const m = String(s ?? '').match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})/);
      return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
    };
    const days = data.days.filter((d) => !iso(d.day) || iso(d.day) >= today);
    if (!days.length) return;
    const [first, ...rest] = days;
    const day = (d) => `<div class="b-day">${d.day ? `<div class="b-label">${esc(d.day)}</div>` : ''}<p>${esc(d.text).replace(/\n/g, '<br>')}</p></div>`;
    box.innerHTML = `
      <h2 id="h-bulletin">النشرة التفصيلية</h2>
      ${day(first)}
      ${rest.length ? `<details><summary>الأيام القادمة (${rest.length})</summary>${rest.map(day).join('')}</details>` : ''}`;
    box.hidden = false;
  } catch { /* the home page works without it */ }
}

async function reports(el, ctx, cancelled) {
  el.innerHTML = `<div class="page">${header('التقارير اليومية', 'تقارير الطقس والمناخ', { back: true })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  const run = () => load(slot, '/api/reports', (items) => `<div class="page" style="max-width:none;gap:10px">
      <div class="reports">${items.map((r) => `
        <a class="report" href="/report?id=${r.id}" data-link>
          ${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div class="report-body">
            <div class="title">${esc(r.title)}</div>
            ${r.excerpt ? `<div class="muted small">${esc(r.excerpt)}</div>` : ''}
            <div class="muted tiny">${esc([r.tag, r.date ? F.arabicDate(r.date) : null].filter(Boolean).join(' · '))}</div>
          </div>
        </a>`).join('')}</div>
    </div>`, cancelled);
  run();
  return actions(el, { retry: run });
}

/** One report, read in full inside the site. */
async function report(el, ctx, cancelled) {
  const id = Number(new URLSearchParams(location.search).get('id'));
  el.innerHTML = `<div class="page">${header('تقرير', '', { back: '/reports' })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  if (!Number.isInteger(id) || id <= 0) { slot.innerHTML = '<div class="empty">التقرير غير موجود</div>'; return; }
  const run = () => load(slot, `/api/report?id=${id}`, (a) => `<article class="card article">
      <h1 class="article-title">${esc(a.title)}</h1>
      <div class="muted tiny">${esc([a.tag, a.date ? F.arabicDate(a.date) : null].filter(Boolean).join(' · '))}</div>
      ${a.image ? `<img class="article-hero" src="${esc(a.image)}" alt="" referrerpolicy="no-referrer">` : ''}
      <div class="article-body">${a.html}</div>
    </article>`, cancelled).then((a) => { if (a) document.title = `${a.title} — طقس فلسطين`; });
  run();
  return actions(el, { retry: run });
}

const fmt1 = (v) => (v == null ? '—' : F.ltr((Math.round(v * 10) / 10).toString()));
const clockOf = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Asia/Hebron', hour: '2-digit', minute: '2-digit' }) : '');

async function stations(el, ctx, cancelled) {
  el.innerHTML = `<div class="page">${header('محطات الطقس', 'قراءات مباشرة من محطات الرصد', {
    back: true, actions: `<button class="icon-btn" data-action="retry" aria-label="تحديث">${icon('refresh')}</button>`,
  })}<div id="slot"></div></div>`;
  const slot = el.querySelector('#slot');
  const card = (s) => {
    const n = s.now;
    if (!n) {
      return `<article class="card station"><h2>${esc(s.name)}</h2>
        ${s.sticker ? `<img class="wc-sticker" src="${esc(s.sticker)}" alt="قراءات ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer">` : '<div class="muted small">تعذّر جلب قراءات المحطة الآن.</div>'}
      </article>`;
    }
    const u = n.units;
    const old = n.updated && Date.now() - Date.parse(n.updated) > 3 * 3600000;
    return `<article class="card station${old ? ' old' : ''}">
      <div class="row"><h2 class="grow">${esc(s.name)}</h2><span class="muted tiny">${n.updated ? esc(F.ago(Date.parse(n.updated))) : ''}</span></div>
      <div class="row st-now">
        <div class="st-temp">${n.temp == null ? '—' : F.ltr(esc(`${Math.round(n.temp * 10) / 10}${u.temp}`))}</div>
        <div class="st-extremes small">
          <div><span class="muted">الإحساس</span> ${F.deg(n.feelsLike)}</div>
          <div><span class="muted">العظمى</span> ${F.deg(n.high)} ${n.highAt ? `<span class="muted tiny">${F.ltr(clockOf(n.highAt))}</span>` : ''}</div>
          <div><span class="muted">الصغرى</span> ${F.deg(n.low)} ${n.lowAt ? `<span class="muted tiny">${F.ltr(clockOf(n.lowAt))}</span>` : ''}</div>
        </div>
      </div>
      <div class="grid2 st-grid">
        <div class="tile"><div class="label">الرطوبة</div><div class="value num">${fmt1(n.humidity)}%</div></div>
        <div class="tile"><div class="label">الرياح</div><div class="value">${fmt1(n.wind)} <span class="small">${esc(u.wind)}</span> ${n.windDir != null ? esc(F.windDir(n.windDir)) : ''}</div><div class="tiny muted">هبّات حتى ${fmt1(n.gust)}</div></div>
        <div class="tile"><div class="label">${n.seasonalRain != null ? 'المطر اليوم / الموسم' : 'المطر اليوم'}</div><div class="value num">${fmt1(n.rain)}${n.seasonalRain != null ? ` / ${fmt1(n.seasonalRain)}` : ''} <span class="small">${esc(u.rain)}</span></div></div>
        <div class="tile"><div class="label">الضغط الجوي</div><div class="value num">${fmt1(n.pressure)} <span class="small">${esc(u.pressure)}</span></div>${n.pressureTrend ? `<div class="tiny muted">${esc(n.pressureTrend)}</div>` : ''}</div>
      </div>
      ${old ? '<div class="banner">آخر قراءة قديمة — قد تكون المحطة متوقفة.</div>' : ''}
    </article>`;
  };
  const run = () => load(slot, '/api/stations', (list) => `<div class="page" style="max-width:none;gap:12px">
      <div class="muted small">تتحدّث القراءات كل بضع دقائق</div>
      <div class="stations">${list.length ? list.map(card).join('') : '<div class="empty">لا توجد محطات الآن</div>'}</div>
    </div>`, cancelled);
  run();
  const timer = setInterval(() => { if (!cancelled()) run(); }, 5 * 60000);
  const off = actions(el, { retry: run });
  return () => { clearInterval(timer); off(); };
}

// ---------------------------------------------------------------- roads

const ROAD_STATUS = {
  open: 'سالك',
  busy: 'أزمة',
  crisis: 'أزمة خانقة',
  closed: 'مغلق',
  unknown: 'لا أخبار',
};
const ROAD_ORDER = { unknown: 0, open: 1, busy: 2, crisis: 3, closed: 4 };
/** Reports older than this are shown faded: the road may have changed since. */
const ROAD_FRESH_MIN = 180;
const ROAD_REFRESH_MS = 2 * 60000;

const minutesAgo = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 60000 : Infinity);
const multiline = (s) => esc(s).replace(/\n/g, '<br>');

/** West Bank part of the outline with the checkpoints we can place as coloured dots. */
function roadsMap(cps, cities, focus) {
  const K = Math.cos((31.5 * Math.PI) / 180);
  const X = (lon) => ((lon - 34.1) * 92 * K).toFixed(1);
  const Y = (lat) => ((33.4 - lat) * 92).toFixed(1);
  const towns = cities.filter((c) => ['nablus', 'jenin', 'tulkarm', 'ramallah', 'jerusalem', 'bethlehem', 'hebron', 'jericho', 'qalqilya', 'salfit', 'tubas'].includes(c.id));
  const placed = cps.filter((c) => c.lat != null && c.lon != null).sort((a, b) => ROAD_ORDER[a.status] - ROAD_ORDER[b.status]);
  return `<svg class="roads-map" viewBox="54 76 66 108" role="img" aria-label="خريطة الحواجز في الضفة الغربية">
    <path d="${OUTER}" class="land"/>
    ${LAKES.map((d) => `<path d="${d}" class="lake"/>`).join('')}
    ${REGION_LINES.map((d) => `<path d="${d}" class="border"/>`).join('')}
    ${towns.map((c) => `<g class="town"><circle cx="${X(c.lon)}" cy="${Y(c.lat)}" r="0.7"/><text x="${X(c.lon)}" y="${(+Y(c.lat) - 1.6).toFixed(1)}">${esc(c.name)}</text></g>`).join('')}
    ${placed.map((c) => `
      <g class="cp-dot ${c.status}${minutesAgo(c.at) > ROAD_FRESH_MIN ? ' old' : ''}${c.id === focus ? ' focus' : ''}" data-action="focus" data-id="${esc(c.id)}" tabindex="0" role="button"
        aria-label="${esc(c.name)}: ${ROAD_STATUS[c.status]}">
        <circle cx="${X(c.lon)}" cy="${Y(c.lat)}" r="${c.status === 'unknown' ? 1 : 1.6}"/>
      </g>`).join('')}
  </svg>`;
}

async function roads(el, ctx, cancelled) {
  let city = '';
  let status = '';
  let query = '';
  let focus = null;
  let data = null;
  el.innerHTML = `<div class="page">
    ${header('أحوال الطرق', 'حالة الحواجز في الاتجاهين، تتحدّث كل دقيقتين', {
      actions: `<button class="icon-btn" data-action="retry" aria-label="تحديث">${icon('refresh')}</button>`,
    })}
    <div class="banner" role="note">الحالة قد تتغيّر في أي لحظة. انظر دائماً إلى وقت آخر تحديث وتحقّق قبل السفر.</div>
    <div id="slot"></div>
  </div>`;
  const slot = el.querySelector('#slot');

  const chip = (label, st) => `<span class="dir ${st}"><span class="dir-l">${label}</span> ${ROAD_STATUS[st]}</span>`;
  const row = (c) => {
    const old = minutesAgo(c.at) > ROAD_FRESH_MIN;
    const same = c.into === c.out;
    return `<div class="cp-row ${c.status}${old ? ' old' : ''}${c.id === focus ? ' focus' : ''}" id="cp-${esc(c.id)}">
      <span class="cp-dotmark" aria-hidden="true"></span>
      <div class="grow">
        <div class="bold">${esc(c.name)}</div>
        <div class="muted tiny">${c.at ? esc(F.ago(Date.parse(c.at))) : 'لا تحديث'}${old ? ' · قد يكون الوضع تغيّر' : ''}</div>
      </div>
      <div class="dirs">${same ? chip('الاتجاهان', c.into) : chip('دخول', c.into) + chip('خروج', c.out)}</div>
    </div>`;
  };

  const draw = () => {
    if (!data) return;
    const anyOk = data.sources.some((s) => s.ok);
    if (!anyOk) {
      slot.querySelector('#overview').innerHTML = `<h2>مصدر أحوال الطرق غير متاح الآن</h2>
        <p class="muted small" style="margin:0">سنعرض حالة الحواجز هنا تلقائياً فور عودة المصدر.</p>`;
      for (const id of ['filters', 'status', 'list', 'feed']) slot.querySelector(`#${id}`).innerHTML = '';
      slot.querySelectorAll('.search, #h-feed').forEach((e) => { e.hidden = true; });
      return;
    }
    slot.querySelectorAll('.search').forEach((e) => { e.hidden = false; });
    const all = data.checkpoints;
    const count = (s) => all.filter((c) => c.status === s).length;
    const newest = all.map((c) => c.at).filter(Boolean).sort().at(-1);
    const shown = all
      .filter((c) => !city || c.city === city)
      .filter((c) => !status || c.status === status || (status === 'busy' && c.status === 'crisis'))
      .filter((c) => !query || c.name.includes(query) || (c.city ?? '').includes(query));

    slot.querySelector('#overview').innerHTML = `
      <div class="roads-sum">
        <button class="tile open" data-action="status" data-s="open"><div class="value num">${count('open')}</div><div class="label">سالك</div></button>
        <button class="tile busy" data-action="status" data-s="busy"><div class="value num">${count('busy') + count('crisis')}</div><div class="label">أزمة</div></button>
        <button class="tile closed" data-action="status" data-s="closed"><div class="value num">${count('closed')}</div><div class="label">مغلق</div></button>
      </div>
      ${roadsMap(all.filter((c) => !city || c.city === city), ctx.cities, focus)}
      <div class="roads-legend tiny muted">
        <span><i class="open"></i>سالك</span><span><i class="busy"></i>أزمة</span><span><i class="crisis"></i>أزمة خانقة</span><span><i class="closed"></i>مغلق</span>
      </div>
      <div class="source">${all.length} حاجزاً · آخر تحديث ${newest ? esc(F.ago(Date.parse(newest))) : '—'} · على الخريطة الحواجز المعروف موقعها فقط</div>`;

    slot.querySelector('#filters').innerHTML =
      pill('كل المدن', 'data-action="city" data-c=""', !city) +
      data.cities.map((c) => pill(c.name, `data-action="city" data-c="${esc(c.name)}"`, city === c.name)).join('');
    slot.querySelector('#status').innerHTML =
      [['', 'كل الحالات'], ['closed', 'المغلق'], ['busy', 'الأزمات'], ['open', 'السالك']]
        .map(([k, v]) => pill(v, `data-action="status" data-s="${k}"`, status === k)).join('');

    // Grouped by city, the newest report first inside each city (no news last).
    const groups = new Map();
    for (const c of shown) {
      const k = c.city ?? 'أخرى';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(c);
    }
    slot.querySelector('#list').innerHTML = shown.length ? [...groups].map(([name, list]) => `
      <section class="cp-group">
        <h2>${esc(name)} <span class="muted tiny">(${list.length})</span></h2>
        <div class="card flush list">${list.sort((a, b) => (b.at ? Date.parse(b.at) : 0) - (a.at ? Date.parse(a.at) : 0) || a.name.localeCompare(b.name, 'ar')).map(row).join('')}</div>
      </section>`).join('') : '<div class="empty">لا توجد حواجز مطابقة</div>';

    const posts = data.feed ?? [];
    slot.querySelector('#h-feed').hidden = !posts.length;
    slot.querySelector('#feed').innerHTML = posts.map((p) => `
      <article class="post">
        <div class="post-text">${multiline(p.text)}</div>
        <div class="row tiny muted"><span class="grow">${esc(F.ago(Date.parse(p.time)))}</span></div>
      </article>`).join('');

  };

  const run = async () => {
    const r = await load(slot, '/api/roads', () => `<div class="page" style="max-width:none">
      <section class="card roads-top" id="overview"></section>
      <label class="search">${icon('search', 20)}<span class="sr-only">ابحث عن حاجز</span>
        <input id="q" type="search" placeholder="ابحث عن حاجز أو مدينة" autocomplete="off" value="${esc(query)}"></label>
      <div class="pills" id="filters"></div>
      <div class="pills" id="status"></div>
      <div id="list" aria-label="حالة الحواجز"></div>
      <section aria-labelledby="h-feed"><h2 id="h-feed" style="margin-bottom:8px" hidden>رسائل السائقين</h2><div class="feed" id="feed"></div></section>
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
    const cp = data?.checkpoints.find((c) => c.id === id);
    if (cp && city && cp.city !== city) city = '';
    if (cp && status) status = '';
    draw();
    el.querySelector(`#cp-${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  el.addEventListener('keydown', (e) => {
    const t = e.target.closest?.('[data-action="focus"]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); focusOn(t.dataset.id); }
  });
  const off = actions(el, {
    city: (t) => { city = t.dataset.c; draw(); },
    status: (t) => { status = status === t.dataset.s ? '' : t.dataset.s; draw(); },
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
      <div class="source">أسعار مرجعية يومية${d.updated ? ` (${esc(d.updated.slice(0, 16))})` : ''}. أسعار الصرافين للبيع والشراء تختلف عنها.</div>
    </div>`, cancelled);
    if (!data) return;
    result();
    el.querySelector('#amt').addEventListener('input', (e) => { amount = e.target.value.replace(/[^\d.,]/g, ''); result(); });
  };
  run();
  return actions(el, { code: (t) => { from = t.dataset.c; result(); }, retry: run });
}

export const views = {
  '/': home,
  '/hourly': hourly,
  '/cities': cities,
  '/farming': farming,
  '/more': more,
  '/prayer': prayer,
  '/alerts': alerts,
  '/reports': reports,
  '/report': report,
  '/stations': stations,
  '/roads': roads,
  '/currency': currency,
};
