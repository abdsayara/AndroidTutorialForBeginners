/* مختبر الرياضيات التفاعلي — النواة الرياضية
 * كل الدوال هنا نقية (pure) وقابلة للاختبار في Node.
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const M = ML.math = {};

  const EPS = 1e-9;
  M.EPS = EPS;

  /* ---------- التنسيق ---------- */
  // تقريب لعدد محدد من المنازل مع إزالة الأصفار الزائدة و -0
  M.round = function (x, d) {
    if (d === undefined) d = 4;
    if (!isFinite(x)) return x;
    const f = Math.pow(10, d);
    let r = Math.round((x + Math.sign(x) * 1e-12) * f) / f;
    if (Object.is(r, -0) || Math.abs(r) < 0.5 / f) r = 0;
    return r;
  };
  M.fmt = function (x, d) {
    if (x === null || x === undefined || Number.isNaN(x)) return 'غير معرّف';
    if (x === Infinity) return '∞';
    if (x === -Infinity) return '-∞';
    const r = M.round(x, d === undefined ? 4 : d);
    return String(r);
  };
  // تنسيق داخل TeX (الإشارة السالبة الصحيحة)
  M.tex = function (x, d) {
    if (x === null || x === undefined || Number.isNaN(x)) return '\\text{غير معرّف}';
    if (x === Infinity) return '\\infty';
    if (x === -Infinity) return '-\\infty';
    return M.fmt(x, d);
  };
  M.isInt = (x) => Math.abs(x - Math.round(x)) < 1e-9;
  M.gcd = function (a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  };
  // تحويل عشري إلى كسر إن أمكن (مقام ≤ maxDen)
  M.toFraction = function (x, maxDen) {
    maxDen = maxDen || 1000;
    if (!isFinite(x)) return null;
    const s = Math.sign(x) || 1; const ax = Math.abs(x);
    for (let den = 1; den <= maxDen; den++) {
      const num = Math.round(ax * den);
      if (Math.abs(num / den - ax) < 1e-9) {
        const g = M.gcd(num, den) || 1;
        return { n: s * num / g, d: den / g };
      }
    }
    return null;
  };
  // كسر بصيغة TeX إن كان بسيطاً، وإلا عشري
  M.texFrac = function (x, maxDen) {
    if (!isFinite(x)) return M.tex(x);
    const f = M.toFraction(x, maxDen || 100);
    if (!f) return M.tex(x);
    if (f.d === 1) return String(f.n);
    return (f.n < 0 ? '-' : '') + '\\frac{' + Math.abs(f.n) + '}{' + f.d + '}';
  };
  // إشارة مع الحد التالي داخل تعبير: + 3 أو - 3
  M.signed = function (x, d) {
    const r = M.round(x, d === undefined ? 4 : d);
    return (r < 0 ? ' - ' : ' + ') + M.fmt(Math.abs(r), d);
  };

  /* ---------- كثيرات الحدود والتربيعي ---------- */
  // يحل أ س² + ب س + جـ = 0 ، أ ≠ 0
  M.solveQuadratic = function (a, b, c) {
    if (Math.abs(a) < EPS) throw new Error('a must be non-zero');
    const D = b * b - 4 * a * c;
    const h = -b / (2 * a) + 0;
    const k = c - b * b / (4 * a);
    const scale = Math.max(1, b * b, Math.abs(4 * a * c));
    const res = { D: D, vertex: { x: h, y: k }, axis: h };
    if (Math.abs(D) <= 1e-12 * scale) {
      res.D = 0; res.type = 'one'; res.roots = [h];
    } else if (D > 0) {
      // صيغة مستقرة عددياً
      const sq = Math.sqrt(D);
      const q = -0.5 * (b + (b >= 0 ? sq : -sq));
      let r1 = q / a, r2 = q !== 0 ? c / q : -r1;
      if (r1 > r2) { const t = r1; r1 = r2; r2 = t; }
      res.type = 'two'; res.roots = [r1, r2];
    } else {
      res.type = 'complex'; res.roots = [];
      res.re = h; res.im = Math.sqrt(-D) / (2 * Math.abs(a));
    }
    return res;
  };
  M.polyEval = (coeffs, x) => coeffs.reduce((acc, c) => acc * x + c, 0); // [a,b,c] => ax²+bx+c

  // صيغة TeX لـ a x² + b x + c مع حذف الحدود الصفرية
  M.polyTeX = function (coeffs, v) {
    v = v || 'x';
    const n = coeffs.length - 1; let s = '';
    coeffs.forEach((c, i) => {
      const p = n - i; const r = M.round(c, 4);
      if (r === 0) return;
      const abs = Math.abs(r);
      let term;
      if (p === 0) term = M.fmt(abs);
      else term = (abs === 1 ? '' : M.fmt(abs)) + v + (p > 1 ? '^{' + p + '}' : '');
      if (s === '') s = (r < 0 ? '-' : '') + term;
      else s += (r < 0 ? ' - ' : ' + ') + term;
    });
    return s || '0';
  };

  /* ---------- مخطط الإشارة ---------- */
  // يرجع فترات الإشارة لاقتران f بين أصفار/نقاط عدم تعريف مرتبة
  M.signChart = function (f, criticals) {
    const pts = Array.from(new Set(criticals.map((x) => M.round(x, 9)))).sort((a, b) => a - b);
    const bounds = [-Infinity].concat(pts, [Infinity]);
    const out = [];
    for (let i = 0; i < bounds.length - 1; i++) {
      const L = bounds[i], R = bounds[i + 1];
      let t;
      if (L === -Infinity && R === Infinity) t = 0;
      else if (L === -Infinity) t = R - 1;
      else if (R === Infinity) t = L + 1;
      else t = (L + R) / 2;
      const v = f(t);
      out.push({ from: L, to: R, sign: v > 0 ? '+' : (v < 0 ? '-' : '0') });
    }
    return out;
  };

  /* ---------- أكبر عدد صحيح ---------- */
  M.floor = (x) => Math.floor(x + 1e-12); // حماية من أخطاء الفاصلة العائمة مثل 0.29999999

  /* ---------- اللوغاريتم والأسي ---------- */
  M.logBase = function (a, x) {
    if (!(a > 0) || Math.abs(a - 1) < EPS) return NaN;
    if (!(x > 0)) return NaN;
    return Math.log(x) / Math.log(a);
  };

  /* ---------- حساب المثلثات ---------- */
  M.deg2rad = (d) => d * Math.PI / 180;
  M.rad2deg = (r) => r * 180 / Math.PI;
  M.normDeg = (d) => ((d % 360) + 360) % 360;
  // الربع: 1..4 أو 0 للزاوية الربعية
  M.quadrant = function (deg) {
    const n = M.round(M.normDeg(deg), 9);
    if (n % 90 === 0) return 0;
    return Math.floor(n / 90) + 1;
  };
  M.referenceAngle = function (deg) {
    const n = M.normDeg(deg);
    if (n <= 90) return n;
    if (n <= 180) return 180 - n;
    if (n <= 270) return n - 180;
    return 360 - n;
  };
  // قيم دقيقة للزوايا الخاصة (مضاعفات 30 و 45)
  const EX = { 0: ['0', '1'], 30: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}'], 45: ['\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}'], 60: ['\\frac{\\sqrt{3}}{2}', '\\frac{1}{2}'], 90: ['1', '0'] };
  const TANEX = { 0: '0', 30: '\\frac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}', 90: null };
  M.exactTrig = function (deg) {
    if (!M.isInt(deg)) return null;
    const n = M.normDeg(Math.round(deg));
    const ref = M.referenceAngle(n);
    if (!(ref in EX)) return null;
    const q = n % 90 === 0 ? null : M.quadrant(n);
    // إشارات حسب الربع / الزاوية الربعية
    const c = Math.cos(M.deg2rad(n)), s = Math.sin(M.deg2rad(n));
    const sg = (v, str) => (Math.abs(v) < 1e-12 ? '0' : (v < 0 ? '-' + str : str));
    const sinS = sg(s, EX[ref][0]);
    const cosS = sg(c, EX[ref][1]);
    let tanS;
    if (Math.abs(c) < 1e-12) tanS = null; else tanS = sg(s / c, TANEX[ref]);
    return { sin: sinS, cos: cosS, tan: tanS, quadrant: q };
  };
  // قيم جا/جتا/ظا مع معالجة القيم غير المعرّفة
  M.trig = function (deg) {
    const n = M.normDeg(deg);
    const r = M.deg2rad(deg);
    let s = Math.sin(r), c = Math.cos(r);
    // تصحيح الزوايا الربعية لتكون أصفاراً تامة
    if (M.isInt(n) && Math.round(n) % 90 === 0) {
      const k = Math.round(n) / 90;
      s = [0, 1, 0, -1][k % 4]; c = [1, 0, -1, 0][k % 4];
    }
    if (Math.abs(s) < 1e-15) s = 0;
    if (Math.abs(c) < 1e-15) c = 0;
    const t = c === 0 ? NaN : s / c;
    return { sin: s, cos: c, tan: t, tanDefined: c !== 0 };
  };
  // صياغة راديان كمضاعف لـ π إن أمكن
  M.radTeX = function (deg) {
    const f = M.toFraction(deg / 180, 360);
    if (!f) return M.fmt(M.deg2rad(deg)) ;
    if (f.n === 0) return '0';
    const sgn = f.n < 0 ? '-' : '';
    const num = Math.abs(f.n) === 1 ? '\\pi' : Math.abs(f.n) + '\\pi';
    return f.d === 1 ? sgn + num : sgn + '\\frac{' + num + '}{' + f.d + '}';
  };
  // درجات ودقائق وثوانٍ
  M.toDMS = function (deg) {
    const s = deg < 0 ? -1 : 1; let a = Math.abs(deg);
    let D = Math.floor(a + 1e-12); let mF = (a - D) * 60; let Mi = Math.floor(mF + 1e-9);
    let S = M.round((mF - Mi) * 60, 2);
    if (S >= 60) { S -= 60; Mi += 1; }
    if (Mi >= 60) { Mi -= 60; D += 1; }
    return { sign: s, d: D, m: Mi, s: S };
  };

  /* ---------- الدائرة ---------- */
  // من الصورة س² + ص² + 2ل س + 2ك ص + جـ = 0
  M.circleFromGeneral = function (L, K, C) {
    const r2 = L * L + K * K - C;
    return { center: { x: -L + 0, y: -K + 0 }, r2: r2, valid: r2 > EPS, point: Math.abs(r2) <= EPS, r: r2 > 0 ? Math.sqrt(r2) : NaN };
  };
  M.circleToGeneral = function (d, h, r) {
    return { L: -d + 0, K: -h + 0, C: d * d + h * h - r * r };
  };

  /* ---------- المصفوفات ---------- */
  M.matAdd = (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j]));
  M.matSub = (A, B) => A.map((row, i) => row.map((v, j) => v - B[i][j]));
  M.matScale = (k, A) => A.map((row) => row.map((v) => k * v));
  M.matMul = function (A, B) {
    if (A[0].length !== B.length) return null; // غير معرّف
    return A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  };
  M.det2 = (A) => (A[0][0] * A[1][1] - A[0][1] * A[1][0]) + 0; // + 0 يحوّل -0 إلى 0
  M.inv2 = function (A) {
    const d = M.det2(A);
    if (Math.abs(d) < EPS) return null; // مصفوفة منفردة
    return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
  };
  // قاعدة كريمر لنظام: a1 x + b1 y = c1 ، a2 x + b2 y = c2
  M.cramer = function (a1, b1, c1, a2, b2, c2) {
    const D = a1 * b2 - b1 * a2;
    const Dx = c1 * b2 - b1 * c2;
    const Dy = a1 * c2 - c1 * a2;
    if (Math.abs(D) < EPS) {
      // التمييز بين عدد لا نهائي من الحلول وعدم وجود حل
      const consistent = Math.abs(Dx) < EPS && Math.abs(Dy) < EPS;
      return { D: 0, Dx: Dx, Dy: Dy, unique: false, kind: consistent ? 'infinite' : 'none' };
    }
    return { D: D, Dx: Dx, Dy: Dy, unique: true, kind: 'unique', x: Dx / D, y: Dy / D };
  };

  /* ---------- العد ---------- */
  M.factBig = function (n) {
    if (n < 0 || !M.isInt(n)) return null;
    let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r;
  };
  M.nPrBig = function (n, r) {
    if (!M.isInt(n) || !M.isInt(r) || r < 0 || n < 0 || r > n) return null;
    let p = 1n; for (let i = 0; i < r; i++) p *= BigInt(n - i); return p;
  };
  M.nCrBig = function (n, r) {
    if (!M.isInt(n) || !M.isInt(r) || r < 0 || n < 0 || r > n) return null;
    r = Math.min(r, n - r);
    let num = 1n, den = 1n;
    for (let i = 1; i <= r; i++) { num *= BigInt(n - r + i); den *= BigInt(i); }
    return num / den;
  };
  M.big = (b) => (b === null ? 'غير معرّف' : b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));

  /* ---------- المنطق ---------- */
  M.logic = {
    not: (p) => !p,
    and: (p, q) => p && q,
    or: (p, q) => p || q,
    imp: (p, q) => !p || q,
    iff: (p, q) => p === q
  };
  M.tv = (b) => (b ? 'ص' : 'خ'); // ص = صائبة ، خ = خاطئة (رموز الكتاب)

  /* ---------- أدوات ---------- */
  M.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  M.lerp = (a, b, t) => a + (b - a) * t;
  M.near = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 1e-6 : tol);
})(typeof window !== 'undefined' ? window : globalThis);
