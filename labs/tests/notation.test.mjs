// اختبارات صيغة الكتاب العربية — رموز وأرقام ووحدات عربية — التشغيل: node --test tests/
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
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/katex/katex.min.js'), 'utf8'), ctx);
const ML = ctx.ML, KX = ctx.katex;
const PH = { subject: 'g10-physics' }, MA = { subject: 'g10-math' };
const leftover = (tex) => tex.replace(/\\(begin|end)\{[^}]*\}/g, '').replace(/\\[A-Za-z]+/g, '').match(/[A-Za-z]+|[0-9]/g);
// العلوم الحياتية: الرموز اللاتينية مسموحة (DNA ، G1 ، FSH)، والأرقام عربية إلا داخل كلمة لاتينية
const LAT = /[0-9]*[A-Za-z][A-Za-z0-9′'’]*/g;
const bioLeft = (tex) => tex.replace(/\\(begin|end)\{[^}]*\}/g, '').replace(/\\[A-Za-z]+/g, '').replace(LAT, '').match(/[0-9]/g);
// في صيغ TeX للأحياء: كل كلمة لاتينية من أكثر من حرف داخل \text{} وإلا عكسها اتجاه المعادلة (n2 بدل 2n)
const bareLatin = (tex) => tex.replace(/\\text\{[^{}]*\}/g, '').replace(/\\[A-Za-z]+/g, ' ').match(/[0-9]*[A-Za-z][A-Za-z0-9]+|[0-9]+[A-Za-z]/g);

test('الوضع الافتراضي صيغة الكتاب العربية', () => { assert.equal(ML.notationMode(), 'ar'); });

test('تحويل الرموز والأرقام والوحدات كما في الكتاب', () => {
  const has = (tex, sim, ...parts) => { const a = ML.arTeX(tex, sim); parts.forEach((x) => assert.ok(a.includes(x), tex + ' → ' + a + ' ∌ ' + x)); assert.equal(leftover(a), null, tex + ' → ' + a); };
  has('F = ma', PH, 'ق', 'ك', 'ت');
  has('f(x) = ax^{2} + bx + c', MA, 'ق', 'س', 'أ', 'ب', 'جـ', '٢');
  has('9.8\\ \\mathrm{m/s^2}', PH, '٩,٨', 'م', 'ث');
  has('P = P_0 + \\rho g h', PH, 'ض', 'ث', 'جـ', 'ل');
  has('\\sin\\theta + \\cos\\theta + \\tan\\theta', MA, 'جا', 'جتا', 'ظا', 'هـ');
  has('(2, 3)', MA, '٢', '٣', '،');
  has('x \\in \\mathbb{R}', MA, 'ح');
  has('(x - h)^2 + (y - k)^2 = r^2', { subject: 'g10-math', ar: { h: 'د', k: 'هـ' } }, 'د', 'هـ', 'نق');
  has('\\tfrac12 at^2', PH, '١', '٢', 'ت', 'ز');
  has('Q = mc\\Delta T', PH, 'كح', 'حن', 'د');
  has('\\Delta U = Q - W', { subject: 'g10-physics', ar: { W: 'ش' } }, 'طد', 'ش');
  has('T_K = T_C + 273', { subject: 'g10-physics', ar: { T_C: 'س', T_K: 'ط' } }, 'ط', 'س', '٢٧٣');
});

test('النص العادي والرسوم: أرقام عربية ووحدات بالعربية ورموز عربية، ودون تكرار التحويل', () => {
  assert.equal(ML.loc('F = 20 N', PH), 'ق = ٢٠ نيوتن');
  assert.equal(ML.loc('a (m/s²)', PH), 'ت (م/ث²)');
  assert.equal(ML.loc('x = 2.5', MA), 'س = ٢,٥');
  assert.equal(ML.loc('{A,B,C}', MA), '{أ،ب،جـ}');
  const once = ML.loc('3.01×10²⁴, (1,2)', MA); assert.equal(ML.loc(once, MA), once);
  assert.equal(ML.parseNum('٣,٥'), 3.5); assert.equal(ML.parseNum('-١٢'), -12); assert.equal(ML.parseNum('2.25'), 2.25);
});

test('كل محاكاة: الصيغ والنتائج والخطوات بلا رموز لاتينية أو أرقام إنجليزية، وتُعرض بـ KaTeX دون أخطاء', () => {
  let n = 0;
  for (const s of ML.sims) {
    ML.curSim = s;
    const p = Object.fromEntries(s.params.map((q) => [q.key, q.value])); if (s.onSet) s.onSet(p, null);
    const d = s.compute(p); if (s.initState) d.st = s.initState(p);
    const tex = [s.formula, ...s.params.map((q) => q.label), ...s.vars.map((v) => v[0]), ...s.vars.filter((v) => v.length === 4).map((v) => v[2])];
    if (s.live) tex.push(s.live(p, d));
    s.results(p, d).forEach((r) => { if (r[2] !== false) tex.push(r[1]); });
    const rich = [...(s.steps ? s.steps(p, d) : []), ...(s.learn || []), s.summary, ...s.results(p, d).map((r) => ML.autoMath(r[0]))];
    rich.forEach((x) => String(x).split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).forEach((part) => { if (part.startsWith('$')) tex.push(part.replace(/^\$+|\$+$/g, '')); else { const a = ML.loc(part); const chk = s.subject === 'g10-bio' ? a.replace(LAT, '') : s.subject === 'g10-chem' ? '' : a; /* الكيمياء: أرقام الكتاب الغربية */ assert.ok(!/[0-9]/.test(chk), s.id + ' plain digits: ' + a.slice(0, 80)); } }));
    for (const t of tex) {
      const a = ML.arTeX(String(t));
      if (s.subject === 'g10-chem') assert.equal(a, String(t), s.id + ' chem TeX unchanged');
      else if (s.subject === 'g10-bio') { assert.equal(bioLeft(a), null, s.id + ': ' + t + ' → ' + a); assert.equal(bareLatin(String(t)), null, s.id + ' (Latin outside \\text): ' + t); }
      else assert.equal(leftover(a), null, s.id + ': ' + t + ' → ' + a);
      assert.doesNotThrow(() => KX.renderToString(a, { throwOnError: true, strict: 'ignore' }), s.id + ': ' + a);
      n++;
    }
  }
  assert.ok(n > 1000);
});

test('إحداثيات النقاط والسالب على يسار العدد كما في الكتاب، واللاتيني فقط يُعزل', () => {
  const t = ML.bidi(ML.loc("B(-4, 3)", MA));
  // السالب ملاصق للعدد على يساره (−٤)، ولا عزل لبقية الأرقام والأقواس
  assert.equal(t, 'ب(\u2066-٤\u2069، ٣)');
  assert.equal(ML.moveUnaryMinus('x = -3'), 'x = 3{-}'); assert.equal(ML.moveUnaryMinus('x - 2'), 'x - 2');
  assert.equal(ML.moveUnaryMinus('-(3x + 1)'), '(3x + 1){-}'); assert.equal(ML.moveUnaryMinus('(-4, 3)'), '(4{-}, 3)');
  assert.ok(/\u2066H₂\u2069/.test(ML.bidi('الهيدروجين H₂')));
});

test('العلوم الحياتية: الرموز اللاتينية تبقى والأرقام عربية خارجها', () => {
  const BI = { subject: 'g10-bio' };
  assert.equal(ML.loc('G1 مدتها 5 ساعات', BI), 'G1 مدتها ٥ ساعات');
  assert.equal(ML.loc('2n = 46 و n = 23', BI), '2n = ٤٦ و n = ٢٣');
  assert.equal(ML.loc('A–T و G–C', BI), 'A–T و G–C');
  assert.equal(ML.arTeX('\\text{2n} = 46', BI), '\\text{\u20662n\u2069} = {\\text{٤٦}}');
  assert.ok(/⁦Aleuria aurantia⁩/.test(ML.bidi(ML.loc('فطر قشر البرتقال Aleuria aurantia', BI))));
});

test('الوضع الدولي يعيد الصيغ كما هي', () => {
  ML.setNotation('intl');
  try { assert.equal(ML.arTeX('F = ma', PH), 'F = ma'); assert.equal(ML.loc('F = 20 N', PH), 'F = 20 N'); }
  finally { ML.setNotation('ar'); }
});
