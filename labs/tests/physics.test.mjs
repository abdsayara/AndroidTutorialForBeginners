// اختبارات الدقة الفيزيائية — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, Math });
const FILES = ['core/math.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'core/phys.js',
  'subjects/g10-physics/u1-measure-vectors.js', 'subjects/g10-physics/u1-kinematics.js', 'subjects/g10-physics/u1-newton.js',
  'subjects/g10-physics/u2-fluids.js', 'subjects/g10-physics/u3-heat.js', 'subjects/g10-physics/u3-thermo.js', 'subjects/g10-physics/u4-astro.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const ML = ctx.ML, M = ML.math, P = ML.phys;
const SIMS = ML.sims.filter((s) => s.subject === 'g10-physics');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) s.onSet(p, null); const d = s.compute(p); if (s.initState) d.st = s.initState(p); return { s, p, d }; };
const near = (a, b, tol = 1e-9, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg || ''} expected ${b}, got ${a}`);
const ref = JSON.parse(execFileSync('python3', ['-I', path.join(dir, 'physics_reference.py')], { encoding: 'utf8', maxBuffer: 1 << 26 }));

/* ---------- بدائل Canvas و Plot لتشغيل دوال الرسم دون متصفح ---------- */
function stubCtx() {
  const target = { createLinearGradient: () => ({ addColorStop() {} }), measureText: () => ({ width: 10 }) };
  return new Proxy(target, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
}
const COLORS = { bg: '#fff', grid: '#eee', grid2: '#f5f5f5', axis: '#333', text: '#444', c1: '#2563eb', c2: '#dc2626', c3: '#059669', c4: '#d97706', c5: '#7c3aed', c6: '#db2777', muted: '#94a3b8' };
function stubG(view) {
  const bad = [];
  const sample = (f, dom) => { const a = dom ? dom[0] : view.xmin, b = dom ? dom[1] : view.xmax; for (let i = 0; i <= 40; i++) { const y = f(a + (b - a) * i / 40); if (y !== undefined && typeof y !== 'number') bad.push('non-number'); } };
  const finite = (...xs) => xs.forEach((x) => { if (typeof x !== 'number' || Number.isNaN(x)) bad.push('NaN coord'); });
  return { bad, G: { ctx: stubCtx(), view, colors: () => COLORS, X: (x) => x, Y: (y) => y,
    fn: (f, st) => sample(f, st && st.domain), point: (x, y) => finite(x, y), hline: (y) => finite(y), vline: (x) => finite(x),
    segment: (...a) => finite(...a.slice(0, 4)), arrow: (...a) => finite(...a.slice(0, 4)), text: (x, y, s) => { finite(x, y); if (/NaN|undefined/.test(s)) bad.push('text ' + s); },
    polygon: (pts) => pts.forEach((p) => finite(p[0], p[1])), shade: (f, a, b, st, g) => { sample(f, [a, b]); if (g) sample(g, [a, b]); }, circle() {}, parametric() {}, lineThrough() {}, angleArc() {}, xBand() {} } };
}
function exercise(s, p, label) {
  if (s.onSet) s.onSet(p, null);
  const d = s.compute(p); d.st = s.initState ? s.initState(p) : undefined;
  const txt = [];
  const res = s.results(p, d); txt.push(JSON.stringify(res));
  if (s.live) txt.push(s.live(p, d));
  if (s.steps) txt.push(JSON.stringify(s.steps(p, d)));
  const all = txt.join(' ');
  assert.ok(!/NaN|undefined|Infinity/.test(all) && (!/غير معرّف/.test(all) || /^vector-/.test(s.id)), label + ' → ' + all.match(/.{0,60}(NaN|undefined|Infinity|غير معرّف).{0,20}/)?.[0]);
  if (s.drawCustom) s.drawCustom(stubCtx(), 900, 520, p, d, COLORS);
  if (s.graph) {
    const n = (s.graphModes || [0]).length;
    for (let gi = 0; gi < n; gi++) {
      const spec = s.graph(p, d, gi); const v = spec.view;
      assert.ok(v.xmax > v.xmin && v.ymax > v.ymin && [v.xmin, v.xmax, v.ymin, v.ymax].every(Number.isFinite), label + ' graph view ' + gi + ' ' + JSON.stringify(v));
      const { G, bad } = stubG(v); spec.draw(G); assert.equal(bad.length, 0, label + ' graph ' + gi + ': ' + bad[0]);
      assert.ok(!/NaN|undefined/.test(spec.caption || ''), label + ' caption');
    }
  }
  return d;
}
const optsOf = (q, p) => (typeof q.options === 'function' ? q.options(p) : q.options).map((o) => (isNaN(+o[0]) ? o[0] : +o[0]));

test('31 تجربة فيزيائية مسجّلة ولكل منها مصدر وافتراضات ومتغيرات بوحداتها وتحديات ومساعد', () => {
  assert.equal(SIMS.length, 31);
  const ids = new Set();
  for (const s of SIMS) {
    assert.ok(!ids.has(s.id), 'duplicate ' + s.id); ids.add(s.id);
    assert.ok(s.page >= 4 && s.page <= 151, s.id + ' page');
    assert.ok(s.unit >= 1 && s.unit <= 8 && s.lesson && s.titleAr && s.titleEn && s.formula && s.book, s.id + ' meta');
    assert.ok(s.vars.length >= 2 && s.vars.every((v) => v.length === 4), s.id + ' vars need 4 columns (symbol, meaning, SI unit, limits)');
    assert.ok(s.assumptions && s.assumptions.length >= 1, s.id + ' assumptions');
    assert.ok(s.challenges.length >= 2 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    assert.ok(s.graph, s.id + ' live graph');
  }
});

test('كل منزلق عند الحد الأدنى والأعلى والمنتصف والصفر، وكل خيار: لا NaN ولا أخطاء في النتائج والرسم', () => {
  let n = 0;
  for (const s of SIMS) {
    const base = defaults(s);
    exercise(s, Object.assign({}, base), s.id + ' defaults'); n++;
    for (const q of s.params) {
      let vals;
      if (q.type === 'select') vals = optsOf(q, base);
      else if (q.type === 'toggle') vals = [true, false];
      else { vals = [q.min, q.max, M.round((q.min + q.max) / 2, 6)]; if (q.min <= 0 && q.max >= 0) vals.push(0); vals = vals.filter((v) => !(q.exclude || []).some((x) => Math.abs(x - v) < 1e-9)); }
      for (const v of vals) { exercise(s, Object.assign({}, base, { [q.key]: v }), s.id + ' ' + q.key + '=' + v); n++; }
      // تركيب: الخيارات مع حدود المنزلقات الأخرى
      if (q.type === 'select') for (const v of vals) for (const r of s.params.filter((x) => !x.type)) for (const e of [r.min, r.max]) { exercise(s, Object.assign({}, base, { [q.key]: v, [r.key]: e }), s.id + ' ' + q.key + '=' + v + ',' + r.key + '=' + e); n++; }
    }
    for (let i = 0; i < 25; i++) { const p = Object.assign({}, base); s.params.forEach((q) => { if (q.type === 'select') { const o = optsOf(q, p); p[q.key] = o[Math.floor(Math.random() * o.length)]; } else if (q.type === 'toggle') p[q.key] = Math.random() < 0.5; else p[q.key] = M.round(q.min + Math.round(Math.random() * (q.max - q.min) / q.step) * q.step, 6); }); exercise(s, p, s.id + ' random ' + JSON.stringify(p)); n++; }
  }
  assert.ok(n > 500);
});

test('التجارب الزمنية: التشغيل حتى النهاية يبقي الحالة منتهية ومعقولة', () => {
  for (const s of SIMS.filter((x) => x.play && x.play.mode === 'time')) {
    const p = defaults(s); if (s.onSet) s.onSet(p, null); const d = s.compute(p); const st = s.initState(p); d.st = st;
    let steps = 0;
    for (; steps < 6000; steps++) { s.tick(st, p, d, 0.01); if (s.isDone && s.isDone(st, p, d)) break; }
    const nums = JSON.stringify(st, (k, v) => (typeof v === 'number' && !Number.isFinite(v) ? 'BAD' : v));
    assert.ok(!/BAD/.test(nums), s.id + ' state not finite');
    for (const k of Object.keys(p)) { const q = s.params.find((x) => x.key === k); if (q && !q.type) assert.ok(p[k] >= q.min - 1e-9 && p[k] <= q.max + 1e-9, s.id + ' param ' + k + ' left range during play'); }
    exercise(s, p, s.id + ' after play');
    if (s.onDone && s.isDone && s.isDone(st, p, d)) { const ex = s.onDone(st, p, d); assert.ok(!/NaN|undefined/.test(JSON.stringify(ex)), s.id + ' onDone'); }
  }
});

test('التحديات: لا يكون أي تحدٍ محلولاً من قيمه الابتدائية', () => {
  for (const s of SIMS) for (const ch of s.challenges) {
    const p = Object.assign(defaults(s), ch.init || {}); if (s.onSet) s.onSet(p, null); const d = s.compute(p);
    assert.ok(!ch.check(p, d), s.id + ': ' + ch.q);
  }
});

// حلول تحديات أمثلة الكتاب: كل تحدٍ قابل للحل بقيم المنزلقات المسموحة
const SOLVE = {
  newton2: [{ F: 20, m: 4, f: 0 }, { F: 50, m: 20, f: 0 }, { F: 20, f: 20 }, { F: 40, m: 8, f: 0 }],
  hooke: [{ k: 20000, m: 90, g: 10 }, { k: 100, m: 3, g: 10 }],
  circular: [{ r: 0.6, n: 30, m: 0.15, cut: false }, { r: 1.2, n: 30, m: 0.15, cut: false }, { r: 5, n: 6 }],
  pressure: [{ F: 600, A: 200 }, { F: 1000, A: 100 }, { F: 101, A: 10 }],
  'liquid-pressure': [{ H: 50, L: 200, rho: 1000, g: 10, P0: 100000 }, { H: 3, h: 3, rho: 1000 }, { H: 50, h: 10, rho: 1000, g: 10 }],
  pascal: [{ F1: 196, A1: 20, A2: 2000, m: 2000, g: 9.8 }, { F1: 500, A1: 10, A2: 100 }, { F1: 100, A1: 10, A2: 3000, m: 3000, g: 9.8 }],
  archimedes: [{ V: 1, rb: 2000, rl: 800, g: 10 }, { V: 30, rb: 800, rl: 1200 }, { rb: 7870, rl: 13600 }],
  'specific-heat': [{ mat: 'aluminium', m: 3, T1: 20, T2: 50 }, { mat: 'bismuth', m: 1, T1: 20, T2: 30 }, { mat: 'water', m: 1, T1: 30, T2: 20 }],
  equilibrium: [{ mat: 'iron', m1: 0.1, T1: 100, m2: 1, T2: 20 }, { mat: 'aluminium', m1: 1, T1: 100, m2: 1, T2: 20 }],
  'latent-heat': [{ m: 0.1, Ti: -10, Tf: 80, boil: false, ci: 2090 }, { m: 1, Ti: 0, Tf: 100, boil: true }],
  expansion: [{ kind: 'lin', mat: 'copper', L1: 3, T1: 20, T2: 50 }, { kind: 'vol', mat: 'turpentine', V1: 2, T1: 10, T2: 60 }, { kind: 'lin', mat: 'iron', L1: 5, T1: 10, T2: 80 }],
  'temp-scales': [{ C: 35 }, { C: -40 }, { C: 100 }],
  'gas-laws': [{ law: 'charles', V1: 0.5, T1: 293, T2: 353 }, { law: 'boyle', V1: 0.1, V2: 0.05, P1: 1 }, { law: 'gay', P1: 5, T1: 200, T2: 300 }, { law: 'comb', V1: 20, T1: 273, P1: 1, T2: 120, P2: 1.25 }],
  'ideal-gas': [{ gas: 'H2', m: 10 }, { gas: 'O2', m: 32, T: 273, V: 22.4 }],
  'first-law': [{ proc: 'free', Q: 5000, W: 500 }, { proc: 'isochoric', Q: -2000 }, { proc: 'isobaric', Q: 1000, Pc: 2, dV: 5 }],
  'celestial-sphere': [{ phi: 90 }, { phi: 0 }, { phi: 31.5 }],
  'equatorial-coords': [{ ra: 0, dec: 0 }, { ra: 5, dec: 31, phi: 31.5, lst: 5 }, { ra: 6 }],
  seasons: [{ day: 172, phi: 31.5 }, { day: 79 }, { day: 171, phi: 23.5 }],
  'moon-phases': [{ age: 14.8 }, { age: 14.8, node: 0 }, { age: 0, node: 0, far: true }, { age: 14.8, node: 90 }],
  circumpolar: [{ phi: 50, dec: 40 }, { phi: 90 }, { phi: 31.5, dec: 59 }]
};
test('تحديات أمثلة الكتاب قابلة للحل بقيم المنزلقات', () => {
  for (const id of Object.keys(SOLVE)) {
    const s = sim(id); assert.ok(s, id);
    SOLVE[id].forEach((sol, i) => {
      const ch = s.challenges[i]; assert.ok(ch, id + ' challenge ' + i);
      const p = Object.assign(defaults(s), ch.init || {}, sol); if (s.onSet) s.onSet(p, null);
      // القيم ضمن حدود المنزلقات وعلى خطوتها
      for (const q of s.params.filter((x) => !x.type && x.key in sol)) { assert.ok(p[q.key] >= q.min && p[q.key] <= q.max, id + ' ' + q.key + ' out of range'); assert.ok(M.near((p[q.key] - q.min) / q.step, Math.round((p[q.key] - q.min) / q.step), 1e-6), id + ' ' + q.key + ' off-step'); }
      const d = s.compute(p); assert.ok(ch.check(p, d), id + ' #' + i + ' not solved by ' + JSON.stringify(sol));
      if (ch.why) assert.ok(!/NaN|undefined/.test(ch.why(p, d)), id + ' why');
    });
  }
});

test('أمثلة الكتاب المحلولة: القيم العددية', () => {
  near(run('newton2', { F: 50, m: 20, f: 0 }).d.a, 2.5);                                  // مثال 3 ص 52
  near(P.newton2(450 - 300, 30), 5);                                                      // دلو 450 N، 30 كغم
  near(run('hooke', { k: 20000, m: 60, g: 10 }).d.x, 0.03); near(run('hooke', { k: 20000, m: 90, g: 10 }).d.x, 0.045); // مثال 1 ص 47
  near(600 / 0.03, 2e4);
  const cir = run('circular', { r: 0.6, n: 30, m: 0.15 }).d; near(cir.v, 1.885, 1e-3); near(cir.a, 5.92, 1e-2); // مثال 2 ص 49 (1.88، 5.89 بتقريب v)
  near(1.88 ** 2 / 0.6, 5.89, 1e-3);
  const ff = P.vertical(0, 2000, 10); near(ff.tGround, 20); near(Math.abs(ff.vGround), 200); // سقوط من 2 كم
  const up = P.vertical(20, 0, 10); near(up.tTop, 2); near(up.hMax, 20);                  // قذف لأعلى حتى 20 م
  const dam = run('liquid-pressure', { H: 50, L: 200, g: 10, P0: 100000, rho: 1000 }).d; near(dam.base, 6e5); near(dam.avg, 3.5e5); near(dam.F, 3.5e9); // مثال 1 ص 71
  near(run('pascal', { m: 2000, A1: 20, A2: 2000, g: 9.8 }).d.need, 196);                // مثال 2 ص 73
  const ar = run('archimedes', { V: 1, rb: 2000, rl: 800, g: 10 }).d; near(ar.Wair, 20); near(ar.Fb, 8); near(ar.app, 12); // مثال 3 ص 76
  near(run('archimedes', { V: 30, rb: 800, rl: 1200, g: 10 }).d.Vsub, 0.02);             // مثال 4 ص 77
  const al = run('specific-heat', { mat: 'aluminium', m: 3, T1: 20, T2: 50 }).d; near(al.C, 2700); near(al.Q, 81000); // مثال 1 ص 90
  assert.equal(M.round(run('equilibrium', { mat: 'iron', m1: 0.1, T1: 100, m2: 1, T2: 20 }).d.Te, 2), 20.85); // مثال 2 ص 93
  near(run('latent-heat', { m: 0.1, Ti: -10, Tf: 80, boil: false, ci: 2090 }).d.total, 68878); // مثال 3 ص 97
  near((3.0015 - 3) / (3 * 30), 16.67e-6, 1e-3);                                         // مثال 4 ص 100
  near(run('expansion', { kind: 'vol', mat: 'turpentine', V1: 2, T1: 10, T2: 60 }).d.dX, 0.09); // مثال 5 ص 103
  const ts = run('temp-scales', { C: 35 }).d; near(ts.F, 95); near(ts.K, 308);             // مثال 6 ص 105
  near(P.cToF(-40), -40);
  near(run('gas-laws', { law: 'charles', V1: 0.5, T1: 293, T2: 353 }).d.V2 * 1000, 602.39, 1e-4); // مثال 3 ص 114
  near(run('gas-laws', { law: 'boyle', P1: 1, V1: 0.1, V2: 0.05 }).d.P2, 2);             // مثال 2 ص 113
  near(run('gas-laws', { law: 'gay', P1: 5, T1: 200, T2: 300 }).d.P2, 7.5);              // مثال 4 ص 115
  near(run('gas-laws', { law: 'comb', P1: 1, V1: 20, T1: 273, P2: 1.25, T2: 120 }).d.V2, 7.033, 1e-3); // مثال 5 ص 116
  const h2 = run('ideal-gas', { gas: 'H2', m: 10 }).d; near(h2.n, 5); near(h2.N, 3.01e24); // مثال 1 ص 111
  near(run('ideal-gas', { gas: 'O2', m: 32, T: 273, V: 22.4 }).d.P, 8.314 * 273 / 0.0224, 1e-9); // مول في 22.4 لتر ≈ 1 atm
  near(run('first-law', { proc: 'free', Q: 5000, W: 500 }).d.dU, 4500);                   // مثال 6 ب ص 121
  near(run('first-law', { proc: 'isochoric', Q: -2000 }).d.dU, -2000);                    // مثال 6 أ
  near(run('first-law', { proc: 'isobaric', Q: 1000, Pc: 2, dV: 5 }).d.W, 1000);         // W = PΔV = 2e5 × 5e-3
  near(run('circumpolar', { phi: 50 }).d.lim, 40);                                        // مثال ص 147
  assert.ok(P.circumpolar(41, 50) && !P.circumpolar(39, 50) && P.neverRises(-41, 50));
  near(run('celestial-sphere', { phi: 31.5 }).d.ang, 58.5);
});

test('الصيغ مقابل المرجع المستقل في Python (حالات عشوائية)', () => {
  for (const c of ref.eq) near(P.equilibrium(c.m1, P.specificHeat[c.k], c.t1, c.m2, 4186, c.t2), c.Te, 1e-12, 'equilibrium');
  for (const c of ref.heat) near(P.heatingCurve(c.m, c.ti, c.tf, c.boil).total, c.Q, 1e-12, 'heating');
  for (const c of ref.vec) { const r = P.vecAdd(c.a, c.tha, c.b, c.thb); near(r.R, c.R, 1e-9, 'vecR'); near(r.x, c.x, 1e-9); near(r.y, c.y, 1e-9); }
  for (const c of ref.vert) { const r = P.vertical(c.v0, c.h0, c.g); near(r.tTop, c.tTop, 1e-12); near(r.hMax, c.hMax, 1e-12); near(r.tGround, c.tGround, 1e-12); near(Math.abs(r.vGround), c.vGround, 1e-9); }
  for (const c of ref.gas) { near(P.combined(c.P1, c.V1, c.T1, c.P2, c.T2), c.V2, 1e-12); near(P.charles(c.V1, c.T1, c.T2), c.charles, 1e-12); near(P.gayLussac(c.P1, c.T1, c.T2), c.gay, 1e-12); }
  for (const c of ref.press) near(P.absPressure(c.P0, c.rho, c.h, c.g), c.P, 1e-12);
  for (const c of ref.buoy) { const d = run('archimedes', { V: c.V, rb: c.rb, rl: c.rl, g: 10 }).d; near(d.Fb, c.Fb, 1e-9); near(d.app, c.app, 1e-9); }
});

test('حراسة القسمة على صفر والحدود الفيزيائية', () => {
  assert.ok(Number.isNaN(P.pressure(10, 0)) && Number.isNaN(P.newton2(10, 0)) && Number.isNaN(P.charles(1, 0, 300)) && Number.isNaN(P.boyle(1, 1, 0)) && Number.isNaN(P.centripetal(1, 0)));
  for (const s of SIMS) for (const q of s.params.filter((x) => !x.type)) {
    // الكتلة والمساحة والحجم والطول ودرجة الحرارة المطلقة (بالكلفن) موجبة دائماً
    if ((/^(m|m1|m2|A|A1|A2|V|V1|V2|L1|r|k|rb|rl)$/.test(q.key) || (/^(gas-laws|ideal-gas)$/.test(s.id) && /^T/.test(q.key))) && !/^vector-/.test(s.id) && !(s.id === 'hooke' && q.key === 'm') && !(s.id === 'pascal' && q.key === 'm')) assert.ok(q.min > 0, s.id + ' ' + q.key + ' must be > 0');
  }
  // الطاقة محفوظة في الاتزان الحراري
  for (const c of ref.eq.slice(0, 50)) { const d = run('equilibrium', { mat: c.k, m1: c.m1, T1: c.t1, m2: c.m2, T2: c.t2 }).d; near(d.Q1 + d.Q2, 0, 1e-9); }
});

test('المساعد الذكي يجيب بقيم التجربة الحالية دون NaN', () => {
  for (const s of SIMS) {
    const { p, d } = run(s.id);
    for (const q of s.tutor) { const a = ML.tutorAnswer(s, q.q, { p, d, lastExplain: [] }); assert.ok(a && !/NaN|undefined/.test(a), s.id + ': ' + q.q); }
    for (const g of ['ما المصدر؟', 'ما مجال المتغيرات؟', 'خطوات الحل', 'مرحبا']) { const a = ML.tutorAnswer(s, g, { p, d, lastExplain: [] }); assert.ok(a && !/NaN|undefined/.test(a), s.id + ': ' + g); }
    assert.ok(/صفحة/.test(ML.tutorAnswer(s, 'ما المصدر؟', { p, d, lastExplain: [] })));
  }
});
