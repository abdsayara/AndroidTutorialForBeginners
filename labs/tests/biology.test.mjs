// اختبارات مختبر العلوم الحياتية — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console: { ...console, warn() {} }, performance, Math });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of [...html.matchAll(/<script src="((?:core|subjects)[^"]+)"/g)].map((m) => m[1])) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const ML = ctx.ML, B = ML.bio;
const SIMS = ML.sims.filter((s) => s.subject === 'g10-bio');
const sim = (id) => SIMS.find((s) => s.id === id);
const J = (x) => JSON.parse(JSON.stringify(x)); // مصفوفات من سياق vm آخر
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
function stubCtx() {
  const target = { createLinearGradient: () => ({ addColorStop() {} }), measureText: () => ({ width: 10 }) };
  return new Proxy(target, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
}
const COLORS = { bg: '#fff', grid: '#eee', grid2: '#f5f5f5', axis: '#333', text: '#444', c1: '#2563eb', c2: '#dc2626', c3: '#059669', c4: '#d97706', c5: '#7c3aed', c6: '#db2777', muted: '#94a3b8' };
function exercise(s, p, label, st) {
  if (s.onSet) s.onSet(p, null);
  const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : undefined); d.hits = [];
  const txt = [JSON.stringify(s.results(p, d))];
  if (s.live) txt.push(s.live(p, d));
  if (s.steps) txt.push(JSON.stringify(s.steps(p, d)));
  const all = txt.join(' ');
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(all), label + ' → ' + (all.match(/.{0,60}(NaN|undefined|Infinity|\[object).{0,20}/) || [''])[0]);
  for (const [W, H] of [[900, 540], [360, 460]]) { d.hits = []; s.drawCustom(stubCtx(), W, H, p, d, COLORS); d.hits.forEach((h) => assert.ok([h.x, h.y, h.w, h.h, h.cx, h.cy, h.r].every((v) => v === undefined || Number.isFinite(v)), label + ' hit ' + h.id)); }
  if (s.graph) { const spec = s.graph(p, d, 0); assert.ok(spec.view.xmax > spec.view.xmin && spec.view.ymax > spec.view.ymin, label + ' graph view'); }
  return d;
}
const valuesOf = (s, q, p) => {
  if (q.type === 'select') return (typeof q.options === 'function' ? q.options(p) : q.options).map((o) => o[0]);
  if (q.type === 'toggle') return [true, false];
  if (q.type === 'stage') return Array.from({ length: q.max + 1 }, (_, i) => i);
  if (q.type === 'text') return [q.value];
  return [q.min, q.max, (q.min + q.max) / 2].map((v) => (q.int ? Math.round(v) : v));
};

test('المحاكيات مسجلة في المادة الثالثة وتغطي فصول الكتاب الأحد عشر', () => {
  assert.ok(ML.grades.find((g) => g.id === 'g10').subjects.includes('g10-bio'));
  const subj = ML.subjects['g10-bio'];
  assert.equal(subj.units.length, 11);
  assert.equal(subj.tutor, 'مساعد العلوم الحياتية الذكي');
  for (let u = 1; u <= 11; u++) assert.ok(SIMS.some((s) => s.unit === u), 'chapter ' + u + ' has a sim');
  assert.ok(SIMS.length >= 25, 'sims: ' + SIMS.length);
});

test('كل محاكاة: مصدر (صفحة داخل الفصل)، تعلّم، تحديات، مساعد، افتراضات، ومعرّف فريد', () => {
  const ids = new Set();
  for (const s of SIMS) {
    assert.ok(!ids.has(s.id), 'duplicate ' + s.id); ids.add(s.id);
    const u = ML.subjects['g10-bio'].units[s.unit - 1]; const [a, b] = u.pages.split('–').map(Number);
    assert.ok(Number.isInteger(s.page) && s.page >= a && s.page <= b, s.id + ' page ' + s.page + ' not in ' + u.pages);
    assert.ok(s.titleAr && s.titleEn && s.lesson && s.lessonTitle && s.book && s.summary, s.id + ' meta');
    assert.ok((s.learn || []).length >= 2, s.id + ' learn'); assert.ok((s.challenges || []).length >= 2, s.id + ' challenges'); assert.ok((s.tutor || []).length >= 1, s.id + ' tutor');
    assert.ok((s.assumptions || []).length >= 1, s.id + ' assumptions'); assert.ok(s.vars.every((v) => v.length === 4), s.id + ' vars');
    assert.ok(s.custom && typeof s.drawCustom === 'function', s.id + ' canvas');
  }
});

test('المجهر: التكبير = العينية × الشيئية لكل العدسات، ورفض القيم غير الموجبة', () => {
  for (const e of B.EYEPIECES) for (const o of B.OBJECTIVES) assert.equal(B.magnification(e, o), e * o);
  assert.deepEqual(J(B.OBJECTIVES.map((o) => B.magnification(10, o))), [40, 100, 400, 1000]);
  assert.equal(400 / 10, 40); // س4 ص 9: X400 بعينية X10 ← شيئية X40
  assert.throws(() => B.magnification(0, 10)); assert.throws(() => B.magnification(10, -4));
  const r = sim('compound-microscope');
  const p = Object.assign(defaults(r), { obj: 40 }); const d = r.compute(p); assert.equal(d.mag, 400);
});

test('السلسلة المكملة: A–T و G–C، الروابط الهيدروجينية، ورفض الحروف غير المسموحة', () => {
  const rnd = (n, bs) => Array.from({ length: n }, () => bs[Math.floor(Math.random() * 4)]).join('');
  for (let k = 0; k < 300; k++) {
    const s = rnd(1 + Math.floor(Math.random() * 14), 'ATGC'); const r = B.complement(s, 'DNA');
    assert.equal(B.complement(r.comp, 'DNA').comp, s);
    const at = (s.match(/[AT]/g) || []).length, gc = (s.match(/[GC]/g) || []).length;
    assert.equal(r.hBonds, 2 * at + 3 * gc); assert.equal(r.at, at); assert.equal(r.gc, gc);
  }
  assert.equal(B.complement('ATGC').comp, 'TACG'); assert.equal(B.complement('GGCC').hBonds, 12);
  assert.equal(B.complement('aug', 'RNA').comp, 'UAC');
  assert.match(B.validateSeq('AUG', 'DNA'), /U/); assert.match(B.validateSeq('AUG', 'DNA'), /RNA/);
  assert.match(B.validateSeq('ATG', 'RNA'), /T/); assert.ok(B.validateSeq('', 'DNA')); assert.ok(B.validateSeq('ATX', 'DNA')); assert.ok(B.validateSeq('A1', 'DNA'));
  assert.equal(B.validateSeq(' at-gc ', 'DNA'), null);
  assert.throws(() => B.complement('ATU', 'DNA'));
});

test('الطفرات الجينية: الحذف ينقص قاعدة، الإضافة تزيد، الاستبدال يحافظ على الطول', () => {
  const s = 'ATGCCGTAA';
  const del = B.mutate(s, 'delete', 3); assert.equal(del.out, 'ATGCGTAA'); assert.equal(del.dLen, -1);
  const ins = B.mutate(s, 'insert', 0, 'G'); assert.equal(ins.out, 'GATGCCGTAA'); assert.equal(ins.dLen, 1);
  const sub = B.mutate(s, 'substitute', 2, 'A'); assert.equal(sub.out, 'ATACCGTAA'); assert.equal(sub.changed, 1); assert.equal(sub.out.length, s.length);
  assert.equal(B.mutate(s, 'substitute', 0, 'A').changed, 0);
  assert.throws(() => B.mutate('A', 'delete', 0)); assert.throws(() => B.mutate('', 'insert', 0, 'A'));
});

test('الانقسام المتساوي والمنصف: الأعداد لكل 2n ورفض 0 والسالب والفردي والكسر', () => {
  for (const n2 of [2, 4, 8, 12, 18, 36, 46]) {
    const mi = B.mitosisCounts(n2); assert.equal(mi.length, B.MITOSIS.length); const end = mi[mi.length - 1]; assert.equal(end.cells, 2); assert.equal(end.chrom, n2);
    const me = B.meiosisCounts(n2); assert.equal(me.length, B.MEIOSIS.length); const e2 = me[me.length - 1]; assert.equal(e2.cells, 4); assert.equal(e2.chrom, n2 / 2);
    assert.equal(me[4].cells, 2); assert.equal(me[4].chrom, n2 / 2); assert.equal(me[1].tetrads, n2 / 2);
  }
  assert.equal(B.meiosisCounts(36)[8].chrom, 18); // س ص 51
  for (const bad of [0, -2, 7, 3.5, NaN]) { assert.ok(B.validate2n(bad), 'reject ' + bad); assert.throws(() => B.mitosisCounts(bad)); assert.throws(() => B.meiosisCounts(bad)); }
  assert.match(B.validate2n(7), /زوجي/); assert.match(B.validate2n(0), /موجب/); assert.match(B.validate2n(3.5), /صحيح/);
  const s = sim('mitosis'); for (const v of ['0', '-4', '7', '3.5', 'abc', '62']) { const d = s.compute(Object.assign(defaults(s), { n2: v })); assert.ok(d.err, 'mitosis rejects ' + v); }
  const q = s.params.find((x) => x.key === 'n2'); for (const v of ['0', '-4', '7', '3.5']) assert.ok(q.validate(v), 'field error for ' + v); assert.equal(q.validate('46'), null); assert.equal(q.validate('٤٦'), null);
});

test('دورة الخلية: ساعات جدول (1) ص 35 والنسب', () => {
  const T = B.CYCLE_TABLE;
  assert.deepEqual([T.bean.G1, T.bean.S, T.bean.G2, T.bean.M], [5, 7, 5, 2]);
  assert.deepEqual([T.mouse.G1, T.mouse.S, T.mouse.G2, T.mouse.M], [9, 10, 2, null]);
  assert.deepEqual([T.gut.G1, T.gut.S, T.gut.G2, T.gut.M], [6, 12, 5, null]);
  for (const k of Object.keys(T)) { const s = B.cycleShares(k); const sum = s.parts.reduce((a, p) => a + s[p], 0); assert.ok(Math.abs(sum - 100) < 1e-9, k); assert.ok(s.S >= s.G1 && s.S >= s.G2, k + ' S longest'); }
  const b = B.cycleShares('bean'); assert.equal(b.total, 19); assert.ok(Math.abs(b.interphase / b.total * 100 - 89.47) < 0.01); // قريب من 90% (ص 35)
  assert.throws(() => B.cycleShares('x'));
});

test('قوائم المراحل بترتيب الكتاب', () => {
  assert.deepEqual(J(B.MITOSIS.slice(1, 5)), ['الطور التمهيدي', 'الطور الاستوائي', 'الطور الانفصالي', 'الطور النهائي']);
  assert.equal(B.MEIOSIS.length, 9); assert.ok(B.MEIOSIS[1].includes('التمهيدي الأول') && B.MEIOSIS[5].includes('التمهيدي الثاني'));
  assert.deepEqual(J(B.REPLICATION.map((r) => r.enzyme)), ['إنزيم هيليكيز', 'إنزيمات بلمرة DNA', 'إنزيم ربط DNA (لايغيز)']);
  assert.deepEqual(J(B.LEVELS), ['ذرات', 'جزيئات صغيرة', 'جزيئات كبيرة', 'عضيات', 'خلايا', 'نسيج', 'عضو', 'جهاز', 'كائن حي']);
  assert.deepEqual(J(B.URINE_STEPS), ['الترشيح', 'إعادة الامتصاص', 'الإفراز الأنبوبي']);
  assert.deepEqual(J(B.NEPHRON), ['محفظة بومان', 'الأنبوب الملتوي القريب', 'التواء هنلي', 'الأنبوب الملتوي البعيد', 'الأنبوب الجامع']);
  assert.deepEqual(J(B.CAT.map((x) => x.en)), ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']);
  assert.deepEqual(J(B.CAT.slice(5).map((x) => x.la)), ['Felis', 'catus']);
  assert.deepEqual(J(B.SPERM.map((x) => x.ploidy)), ['', '2n', '2n', '2n', 'n', 'n', 'n']);
  assert.deepEqual(J(B.EGG.map((x) => x.cell)), ['خلايا جذعية', 'خلية بيضية أم', 'خلية بيضية أولية', 'خلية بيضية ثانوية + جسم قطبي أول', 'بويضة ملقحة', 'بويضة ناضجة + جسم قطبي ثانٍ', 'بويضة مخصبة']);
  assert.equal(B.EPITHELIA.length, 6); assert.equal(B.PRO_EU.length, 5); assert.equal(B.DOMAINS.reduce((a, d) => a + d.kingdoms.length, 0), 6);
  assert.equal(B.FUNGI.length, 5); assert.equal(B.REABSORB, 99); assert.equal(B.NEPHRONS_PER_KIDNEY, 1.3e6); assert.equal(B.OVULATION_DAY, 14);
});

test('الدورة الشهرية: منحنيات نوعية ضمن [0،1] وذروة LH قرب التبويض، دون أرقام على المحور', () => {
  let maxLH = 0, at = 0;
  for (let d = 1; d <= 28; d += 0.25) { for (const k of ['FSH', 'LH', 'estrogen', 'progesterone']) { const v = B.hormone[k](d); assert.ok(v >= 0 && v <= 1.2, k + ' ' + d); } if (B.hormone.LH(d) > maxLH) { maxLH = B.hormone.LH(d); at = d; } }
  assert.ok(Math.abs(at - 14) <= 0.5, 'LH peak at ' + at);
  assert.equal(B.menstrualPhase(3), 'الطمث'); assert.equal(B.menstrualPhase(10), 'مرحلة النمو'); assert.equal(B.menstrualPhase(20), 'مرحلة الإفراز');
  assert.ok(!sim('menstrual-cycle').graph, 'no numeric y-axis graph');
});

test('كل منزلق ومرحلة وخيار في كل محاكاة: لا NaN ولا undefined، والرسم يعمل على مقاسين', () => {
  let n = 0;
  for (const s of SIMS) {
    ML.curSim = s;
    for (const q of s.params) {
      for (const v of valuesOf(s, q, defaults(s))) { const p = Object.assign(defaults(s), { [q.key]: v }); exercise(s, p, s.id + ' ' + q.key + '=' + v); n++; }
    }
    // تشغيل زمني قصير
    if (s.tick) { const p = defaults(s); const st = s.initState ? s.initState(p) : {}; const d = s.compute(p); for (let i = 0; i < 400; i++) s.tick(st, p, d, 0.05); exercise(s, p, s.id + ' after tick', st); }
  }
  assert.ok(n > 150, 'checked ' + n);
});

test('التحديات: الحالة الابتدائية غير محلولة، وحلها ممكن', () => {
  const solve = {
    'size-scale': [{ i: 9 }, { i: 6 }, { i: 5 }], 'compound-microscope': [{ obj: 40, coarse: 68, fine: 7 }, { obj: 4, coarse: 40, fine: 7 }, { obj: 100, oil: true, coarse: 74, fine: 7 }],
    'microscope-compare': [{ k: 'tem' }, { k: 'sem' }, { k: 'light' }], 'nucleotide-builder': [{ seq: 'GCGC' }, { seq: 'ATTGCA', ans: 'TAACGT' }, { seq: 'ATGC' }, { type: 'RNA', seq: 'UUUA' }],
    'cell-theory': [{ k: 2 }, { k: 1 }], 'division-order': [null, null], 'twins': [{ type: 'id', k: 3 }, { type: 'non' }], 'urinary-health': [{ view: 'urea', k: 2 }, { view: 'dialysis', k: 3 }, { view: 'stones', k: 2 }],
    'protist-nutrition': [{ k: 3 }, { k: 1 }], 'fungi-structure': [{ view: 'hyphae', k: 0 }, { view: 'repro', k: 0 }, { view: 'lichens', k: 2 }],
    'chromosome-zoom': [{ lv: 2 }, { lv: 4 }], 'dna-replication': [{ st: 1 }, { st: 2 }, { st: 4, seq: 'ATGCA' }], 'mutations': [{ kind: 'delete', pos: 4 }, { kind: 'substitute', pos: 3, base: 'A' }, { kind: 'plus' }],
    'cell-cycle': [{ cell: 'bean' }, { cell: 'gut' }, { cyclin: false }, { g0: 'perm' }], 'mitosis': [{ n2: '12', kind: 'plant', s: 5 }, { s: 3 }, { s: 2 }], 'tumors': [{ ctrl: false, type: 'malignant' }, { ctrl: false, type: 'benign' }],
    'meiosis': [{ n2: '36', s: 8 }, { s: 1, nx: 2 }, { s: 8, nx: 0 }], 'mitosis-vs-meiosis': [{ n2: '46', k: 3 }, { k: 2 }], 'gametogenesis': [{ sex: 'm', i: 4 }, { sex: 'f', i: 3 }, null],
    'levels-zoom': [{ lv: 4 }, { lv: 6 }], 'tissue-microscope': [{ t: 'ep0' }, { t: 'ep4' }, { t: 'ctd' }, null], 'reproductive-systems': [{ sys: 'm', k: 2 }, { sys: 'f', k: 2 }, null],
    'menstrual-cycle': [{ day: 14 }, { day: 20 }, { fert: true, day: 27 }], 'embryo-stages': [{ k: 6 }, { k: 10 }, { k: 7 }], 'urinary-nephron': [null, null, { view: 2, step: 2 }, null],
    'taxonomy-ladder': [{ view: 'ladder', lv: 6 }, { view: 'ladder', lv: 4 }, null], 'protist-sort': [null, null, null], 'fungi-sort': [null, null], 'sci-name': [null, null, null], 'cell-explorer': [null, null, null, null], 'protein-path': [{ s: 3 }, { s: 2 }]
  };
  for (const s of SIMS) {
    s.challenges.forEach((ch, i) => {
      const p0 = Object.assign(defaults(s), ch.init || {}); if (s.onSet) s.onSet(p0, null); const d0 = s.compute(p0); d0.st = s.initState ? s.initState(p0) : undefined;
      assert.ok(!ch.check(p0, d0), s.id + ' challenge ' + (i + 1) + ' solved at init');
      const sol = (solve[s.id] || [])[i];
      if (sol) { const p1 = Object.assign({}, p0, sol); const d1 = s.compute(p1); d1.st = s.initState ? s.initState(p1) : undefined; assert.ok(ch.check(p1, d1), s.id + ' challenge ' + (i + 1) + ' not solvable by ' + JSON.stringify(sol)); }
      assert.ok(ch.q && ch.hint, s.id + ' challenge text');
    });
  }
});

test('السحب والإفلات: الفرز الصحيح يكمل التحدي، والخاطئ لا يكمله', () => {
  { // ترتيب الأدوار: الترتيب الصحيح فقط يكمل التحدي
    const o = sim('division-order'); const p = defaults(o); const st = o.initState(p); const d = o.compute(p); d.st = st;
    d.items.forEach((it) => { st.pos[it.id] = it.group; }); assert.ok(o.challenges[0].check(p, d));
    const [a1, b1] = d.items; st.pos[a1.id] = b1.group; st.pos[b1.id] = a1.group; assert.ok(!o.challenges[0].check(p, d), 'swapped order rejected');
    assert.deepEqual(J(d.items.map((x) => x.label)).sort(), ['الدور الاستوائي', 'الدور الانفصالي', 'الدور التمهيدي', 'الدور النهائي', 'انقسام السيتوبلازم'].sort());
  }
  { // إكمال السلسلة المتممة
    const nb = sim('nucleotide-builder'); const q = nb.params.find((x) => x.key === 'ans');
    assert.equal(q.validate(''), null); assert.ok(q.validate('TAU')); assert.ok(q.validate('XYZ'));
    const d = nb.compute(Object.assign(defaults(nb), { seq: 'ATTGCA', ans: 'TAACGA' })); assert.ok(!d.ansOk); assert.equal(d.ansRight, 5);
  }
  for (const id of ['protist-sort', 'fungi-sort']) {
    const s = sim(id); const p = defaults(s); const d = s.compute(p); const st = s.initState(p); d.st = st; d.hits = [];
    s.drawCustom(stubCtx(), 900, 540, p, d, COLORS);
    const items = id === 'fungi-sort' ? null : d.M.items;
    // نقل البطاقات عبر واجهة المؤشر (سحب من البطاقة إلى المجموعة الصحيحة)
    const api = { hits: () => d.hits, say() {}, hit: (x, y) => ML.hitTest(d.hits, x, y), set() {} };
    const cards = d.hits.filter((h) => h.id.indexOf('card:') === 0);
    assert.ok(cards.length >= 4, id + ' cards');
    for (const h of cards) {
      const cid = h.id.slice(5); const grp = (items || []).length ? items.find((x) => x.id === cid).group : null;
      const target = grp ? d.hits.find((q) => q.id === 'bin:' + grp) : null;
      s.onPointer('down', h.x + 5, h.y + 5, p, st, api);
      if (target) { s.onPointer('move', target.x + target.w / 2, target.y + target.h - 10, p, st, api); s.onPointer('up', target.x + target.w / 2, target.y + target.h - 10, p, st, api); }
      else s.onPointer('up', h.x + 5, h.y + 5, p, st, api);
    }
    if (id === 'protist-sort') { assert.ok(s.challenges[0].check(p, d), 'all sorted correctly'); }
    else { // نقر البطاقة ثم نقر المجموعة
      assert.ok(st.pick, 'tap selects a card'); const bin = d.hits.find((q) => q.id === 'bin:chytrid'); s.onPointer('down', bin.x + 4, bin.y + 4, p, st, api); assert.ok(Object.values(st.pos).includes('chytrid'));
    }
  }
  const n = sim('sci-name'); const p = defaults(n); const st = n.initState(p); const d = n.compute(p); d.st = st;
  st.pos = { g: 'genus', s: 'species' }; assert.ok(n.challenges[0].check(p, d));
  st.pos = { ar: 'genus', s: 'species' }; assert.ok(!n.challenges[0].check(p, d));
  assert.deepEqual(J(B.checkSciName('Felis', 'catus')), []); assert.equal(B.checkSciName('felis', 'catus').length, 1); assert.equal(B.checkSciName('القط', 'catus').length, 1);
});

test('المساعد الذكي: يجيب من القيم الحالية لكل سؤال مقترح', () => {
  for (const s of SIMS) {
    const p = defaults(s); const d = s.compute(p); d.st = s.initState ? s.initState(p) : undefined;
    for (const r of s.tutor) { const a = ML.tutorAnswer(s, r.q, { p: p, d: d, lastExplain: [] }); assert.ok(a && !/undefined|NaN|\[object/.test(a), s.id + ': ' + r.q + ' → ' + a); }
    const src = ML.tutorAnswer(s, 'ما المصدر والصفحة؟', { p: p, d: d, lastExplain: [] }); assert.match(src, /العلوم الحياتية/, s.id + ' source');
  }
});
