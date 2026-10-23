/* رياضيات التاسع — الوحدة الرابعة: الإحصاء (ص 84–104) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const G = ML.m9;
  const U = 4;
  const sum = (a) => a.reduce((s, x) => s + x, 0);

  /* ---------- بيانات الكتاب ---------- */
  // بيانات خام
  const RAW = {
    martyrs: { name: 'نشاط 1 ص 86: عدد الشهداء في محافظة القدس 1994–2015', page: 86, discrete: true, unit: 'عدد الشهداء', who: 'عدد السنوات',
      data: [15, 6, 8, 3, 4, 3, 15, 19, 16, 5, 2, 2, 2, 9, 2, 1, 0, 3, 1, 1, 15, 24] },
    math26: { name: 'نشاط 2 ص 86: علامات 26 طالباً في الرياضيات', page: 86, k: 3, unit: 'العلامة', who: 'عدد الطلبة',
      data: [30, 24, 23, 11, 12, 22, 25, 12, 14, 13, 14, 25, 30, 27, 28, 29, 31, 20, 20, 19, 14, 25, 12, 16, 17, 18] },
    arabic30: { name: 'نشاط 3 ص 87: علامات 30 طالباً في اللغة العربية', page: 87, k: 5, unit: 'العلامة', who: 'عدد الطلبة',
      data: [14, 16, 20, 23, 10, 13, 17, 21, 29, 18, 12, 19, 20, 23, 27, 25, 22, 21, 25, 29, 18, 20, 28, 24, 17, 21, 25, 24, 22, 18] },
    honey: { name: 'نشاط 4 ص 88: الأجر الأسبوعي لـ 50 عاملاً في مزرعة عسل', page: 88, k: 6, unit: 'الأجر', who: 'عدد العمال',
      data: [50, 60, 76, 84, 102, 68, 84, 108, 68, 84, 78, 80, 100, 52, 104, 76, 94, 70, 106, 56, 68, 82, 70, 62, 82, 72, 106, 82, 72, 64, 74, 88, 90, 74, 90, 92, 58, 92, 76, 96, 80, 66, 88, 90, 88, 80, 62, 94, 86, 54] },
    english30: { name: 'تمارين عامة ص 103: علامات 30 طالباً في اللغة الإنجليزية', page: 103, k: 6, unit: 'العلامة', who: 'عدد الطلبة',
      data: [80, 70, 74, 54, 59, 72, 72, 60, 58, 42, 75, 80, 65, 75, 62, 63, 89, 77, 40, 83, 82, 70, 79, 84, 53, 90, 73, 52, 69, 75] }
  };
  // جداول تكرارية ذات فئات: [الحد الأدنى، الحد الأعلى، التكرار]
  const T = (name, page, rows, unit, who) => ({ name: name, page: page, rows: rows, unit: unit || 'الفئات', who: who || 'التكرار' });
  const TAB = {
    necklace: T('نشاط 2 ص 90: أطوال 60 قلادة (سم)', 90, [[40, 44, 5], [45, 49, 8], [50, 54, 11], [55, 59, 12], [60, 64, 11], [65, 69, 8], [70, 74, 5]], 'الطول (سم)', 'عدد القلائد'),
    marks40: T('نشاط 3 ص 91: علامات 40 طالبة في الرياضيات', 91, [[3, 7, 3], [8, 12, 5], [13, 17, 12], [18, 22, 18], [23, 27, 2]], 'العلامة', 'عدد الطالبات'),
    weights: T('نشاط 4 ص 92: كتل 100 موظف (كغم)', 92, [[50, 59, 8], [60, 69, 22], [70, 79, 40], [80, 89, 25], [90, 99, 5]], 'الكتلة (كغم)', 'عدد الموظفين'),
    english50: T('نشاط 5 ص 92: علامات 50 طالباً في اللغة الإنجليزية', 92, [[50, 59, 3], [60, 69, 5], [70, 79, 18], [80, 89, 16], [90, 99, 8]], 'العلامة', 'عدد الطلبة'),
    wages: T('نشاط 6 ص 93: أجور 100 عامل نظافة (دينار)', 93, [[70, 79, 8], [80, 89, 22], [90, 99, 40], [100, 109, 25], [110, 119, 5]], 'الأجر (دينار)', 'عدد العمال'),
    kg42: T('تمرين 1 ص 94: كتل 42 طالباً (كغم)', 94, [[40, 44, 5], [45, 49, 10], [50, 54, 12], [55, 59, 8], [60, 64, 7]], 'الكتلة (كغم)', 'عدد الطلبة'),
    ex2: T('تمرين 2 ص 94', 94, [[3, 5, 4], [6, 8, 5], [9, 11, 6], [12, 14, 7], [15, 17, 5], [18, 20, 3]]),
    wind: T('نشاط 2 ص 96: سرعة الرياح في 20 يوماً (كم/س)', 96, [[5, 9, 5], [10, 14, 2], [15, 19, 6], [20, 24, 3], [25, 29, 4]], 'السرعة (كم/س)', 'عدد الأيام'),
    poem: T('نشاط 3 ص 97: زمن إلقاء القصيدة لـ 28 طالباً (دقيقة)', 97, [[2, 4, 2], [5, 7, 5], [8, 10, 7], [11, 13, 10], [14, 16, 4]], 'الزمن (دقيقة)', 'عدد الطلبة'),
    reading: T('مثال ص 97: ساعات المطالعة لـ 10 أشخاص', 97, [[1, 5, 2], [6, 10, 4], [11, 15, 3], [16, 20, 1]], 'عدد الساعات', 'عدد الأشخاص'),
    marks32: T('نشاط 5 ص 99: علامات 32 طالباً', 99, [[40, 44, 2], [45, 49, 6], [50, 54, 8], [55, 59, 7], [60, 64, 5], [65, 69, 4]], 'العلامة', 'عدد الطلبة'),
    luggage: T('تمرين 1 ص 100: كتل أمتعة المسافرين (كغم)', 100, [[10, 15, 12], [16, 21, 15], [22, 27, 20], [28, 33, 13], [34, 39, 12], [40, 45, 8]], 'الكتلة (كغم)', 'عدد المسافرين'),
    math9: T('نشاط 2 ص 102: علامات طلبة التاسع في الرياضيات', 102, [[27, 35, 3], [36, 44, 5], [45, 53, 6], [54, 62, 8], [63, 71, 7], [72, 80, 7], [81, 89, 6]], 'العلامة', 'عدد الطلبة'),
    arabicT: T('تمرين 1 ص 102: علامات 30 طالباً في اللغة العربية', 102, [[12, 14, 3], [15, 17, 8], [18, 20, 10], [21, 23, 7], [24, 26, 2]], 'العلامة', 'عدد الطلبة'),
    stat20: T('تمرين 2 ص 102: علامات 20 طالباً في الإحصاء', 102, [[5, 9, 5], [10, 14, 1], [15, 19, 3], [20, 24, 7], [25, 29, 4]], 'العلامة', 'عدد الطلبة'),
    gen20: T('تمارين عامة ص 104: علامات 20 طالباً', 104, [[4, 8, 2], [9, 13, 4], [14, 18, 8], [19, 23, 5], [24, 28, 1]], 'العلامة', 'عدد الطلبة')
  };
  G.RAW = RAW; G.TAB = TAB;

  /* ---------- الحسابات ---------- */
  // بناء الفئات من بيانات خام بطريقة الكتاب: طول الفئة = المدى ÷ عدد الفئات مقرّباً إلى العدد الصحيح الذي يليه
  function buildClasses(data, k) {
    const mn = Math.min.apply(null, data), mx = Math.max.apply(null, data), rng = mx - mn;
    const q = rng / k; let len = Math.ceil(q); if (len === q) len += 0; // عدد صحيح: يبقى كما هو
    let n = k; while (mn + n * len - 1 < mx) n++; // إن لم تغطِّ الفئات أكبر قيمة نضيف فئة
    const rows = []; for (let i = 0; i < n; i++) { const lo = mn + i * len, hi = lo + len - 1; rows.push([lo, hi, data.filter((v) => v >= lo && v <= hi).length]); }
    return { min: mn, max: mx, range: rng, q: q, len: len, rows: rows, extra: n - k };
  }
  function stats(rows) {
    const f = rows.map((r) => r[2]), x = rows.map((r) => (r[0] + r[1]) / 2);
    const N = sum(f), sxf = sum(x.map((v, i) => v * f[i])), mean = sxf / N;
    const cum = []; f.reduce((s, v, i) => (cum[i] = s + v), 0);
    const lowA = rows.map((r) => r[0] - 0.5), upA = rows.map((r) => r[1] + 0.5);
    const rank = N / 2; const mi = cum.findIndex((c) => c >= rank); const prev = mi ? cum[mi - 1] : 0;
    const median = lowA[mi] + (rank - prev) / (cum[mi] - prev) * (upA[mi] - lowA[mi]);
    const fmax = Math.max.apply(null, f); const modes = f.map((v, i) => (v === fmax ? i : -1)).filter((i) => i >= 0);
    const dev2 = x.map((v) => (v - mean) * (v - mean)); const sdev = sum(dev2.map((v, i) => v * f[i]));
    return { f: f, x: x, N: N, sxf: sxf, mean: mean, cum: cum, lowA: lowA, upA: upA, rank: rank, mi: mi, prev: prev, median: median, modes: modes, mode: x[modes[0]], dev2: dev2, sdev: sdev, sd: Math.sqrt(sdev / N) };
  }
  G.buildClasses = buildClasses; G.stats = stats;
  const cls = (r) => r[0] + ' – ' + r[1];
  const n = (v, d) => M.fmt(v, d === undefined ? 2 : d);

  /* ---------- أدوات الرسم ---------- */
  // جدول على Canvas: الأعمدة من اليمين إلى اليسار
  function table(ctx, x, y, w, rows, c, o) {
    o = o || {}; const nc = rows[0].length; const cw = w / nc; const rh = o.rh || 26; const fs = o.fs || 12;
    rows.forEach((r, i) => r.forEach((t, j) => {
      const xx = x + w - (j + 1) * cw, yy = y + i * rh; const head = i === 0 || (o.firstCol && j === 0);
      ctx.fillStyle = head ? 'rgba(219,39,119,.16)' : o.hiRow === i ? 'rgba(124,58,237,.16)' : i % 2 ? 'rgba(148,163,184,.10)' : 'rgba(148,163,184,.03)';
      ctx.fillRect(xx + 1, yy + 1, cw - 2, rh - 2);
      G.txt(ctx, t, xx + cw / 2, yy + rh / 2, { color: head ? c.c6 : c.text, size: head ? fs - 0.5 : fs, w: head ? '800' : '600' });
    }));
    return y + rows.length * rh;
  }
  // محوران وتحويل إحداثيات لرسم بياني
  function axes(ctx, box, xmin, xmax, ymax, c, o) {
    o = o || {}; const X = (v) => box.x + (v - xmin) / (xmax - xmin) * box.w, Y = (v) => box.y + box.h - v / ymax * box.h;
    ctx.save(); ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    const ys = o.ystep || Math.max(1, Math.ceil(ymax / 6));
    for (let v = 0; v <= ymax + 1e-9; v += ys) { ctx.beginPath(); ctx.moveTo(box.x, Y(v)); ctx.lineTo(box.x + box.w, Y(v)); ctx.stroke(); G.txt(ctx, M.fmt(v), box.x - 8, Y(v), { color: c.muted, size: 10, align: 'right' }); }
    ctx.strokeStyle = c.axis; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke(); ctx.restore();
    (o.xticks || []).forEach((v) => G.txt(ctx, M.fmt(v, 2), X(v), box.y + box.h + 12, { color: c.muted, size: 10 }));
    if (o.xlabel) G.txt(ctx, o.xlabel, box.x + box.w / 2, box.y + box.h + 30, { color: c.text, size: 12, w: '700' });
    if (o.ylabel) G.txt(ctx, o.ylabel, box.x + 4, box.y - 12, { color: c.text, size: 12, w: '700', align: 'left' });
    return { X: X, Y: Y };
  }
  function polyline(ctx, pts, color, w, smooth) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2.5; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    if (smooth && pts.length > 2) { for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); }
    else pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.stroke(); ctx.restore();
  }
  const NAMES = (list) => G.opts(list.map((k) => [k, TAB[k].name]));

  /* ======================= 4-1 الجداول التكرارية ======================= */
  G.reg({
    id: 'frequency-table', unit: U, order: 1, lesson: '4-1', lessonTitle: 'الجداول التكرارية', page: 86,
    titleAr: 'بناء الجدول التكراري ذي الفئات', titleEn: 'Building a Frequency Table', tags: 'جدول تكراري فئه طول الفئه مدى اشاره تكرار بيانات خام',
    formula: '\\text{المدى} = \\text{أكبر قيمة} - \\text{أصغر قيمة},\\qquad \\text{طول الفئة} = \\frac{\\text{المدى}}{\\text{عدد الفئات}}',
    book: 'المدى = أكبر قيمة – أصغر قيمة ؛ طول الفئة = المدى ÷ عدد الفئات ، وإذا كان الناتج عشرياً يُقرّب إلى العدد الصحيح الذي يليه',
    summary: 'لتنظيم بيانات كثيرة نوزعها على فئات متساوية الطول: نجد المدى، ثم طول الفئة (ونقرّبه إلى العدد الصحيح التالي إن كان عشرياً)، ونبدأ الفئة الأولى بأصغر قيمة، ثم نفرّغ البيانات بالإشارات ونعدّها.',
    vars: [['k', 'عدد الفئات', 'من 3 إلى 8'], ['\\text{المدى}', 'أكبر قيمة − أصغر قيمة', ''], ['\\text{طول الفئة}', 'المدى ÷ عدد الفئات مقرّباً', 'عدد صحيح']],
    params: [
      { key: 'ds', label: '\\text{البيانات}', type: 'select', value: 'arabic30', options: G.opts(Object.keys(RAW).map((k) => [k, RAW[k].name])) },
      { key: 'k', label: 'k', min: 3, max: 8, step: 1, value: 5, int: true, desc: 'عدد الفئات' }
    ],
    onSet(p, key) { if (key === 'ds' && RAW[p.ds].k) p.k = RAW[p.ds].k; },
    custom: true, canvasHint: 'كل حزمة من خمس إشارات تمثّل خمس قيم. يظهر المدرج الصغير أسفل الجدول لمقارنة التكرارات.',
    compute(p) {
      const D = RAW[p.ds];
      if (D.discrete) { const vals = G.uniq(D.data.slice().sort((a, b) => a - b)); return { D: D, disc: true, rows: vals.map((v) => [v, v, D.data.filter((x) => x === v).length]), min: Math.min.apply(null, D.data), max: Math.max.apply(null, D.data), N: D.data.length, total: sum(D.data) }; }
      const b = buildClasses(D.data, p.k); return Object.assign({ D: D, disc: false, N: D.data.length }, b);
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (d.disc) {
        const head = ['عدد الشهداء'].concat(d.rows.map((r) => String(r[0]))), row = ['عدد السنوات'].concat(d.rows.map((r) => String(r[2])));
        const half = Math.ceil(head.length / 2); const parts = nar ? [[head.slice(0, half), row.slice(0, half)], [[head[0]].concat(head.slice(half)), [row[0]].concat(row.slice(half))]] : [[head, row]];
        let y = 14; parts.forEach((pr) => { y = table(ctx, 8, y, W - 16, pr, c, { rh: 30, fs: nar ? 11 : 12.5, firstCol: true }) + 12; });
        const box = { x: 40, y: y + 20, w: W - 60, h: Math.max(60, H - y - 70) }; const fmax = Math.max.apply(null, d.rows.map((r) => r[2]));
        const A = axes(ctx, box, d.min - 1, d.max + 1, fmax + 1, c, { ystep: 1, xticks: d.rows.map((r) => r[0]).filter((v, i) => !nar || i % 2 === 0), xlabel: 'عدد الشهداء في السنة', ylabel: 'عدد السنوات' });
        d.rows.forEach((r) => { ctx.fillStyle = c.c6; ctx.globalAlpha = 0.75; ctx.fillRect(A.X(r[0]) - 4, A.Y(r[2]), 8, A.Y(0) - A.Y(r[2])); ctx.globalAlpha = 1; });
        return;
      }
      const tally = (k) => { let s = ''; for (let i = 0; i < Math.floor(k / 5); i++) s += '𝍸 '; return s + '|'.repeat(k % 5); };
      const rows = [['الفئات', 'الإشارة', 'التكرار']].concat(d.rows.map((r) => [cls(r), tally(r[2]) || '—', String(r[2])])).concat([['المجموع', '', String(d.N)]]);
      const tw = nar ? W - 16 : W * 0.55; const ye = table(ctx, W - 8 - tw, 14, tw, rows, c, { rh: Math.min(32, (H - 30) / rows.length), fs: nar ? 11.5 : 13, firstCol: true });
      const box = nar ? { x: 40, y: ye + 24, w: W - 60, h: Math.max(50, H - ye - 64) } : { x: 40, y: 30, w: W - tw - 70, h: H - 90 };
      if (box.h < 40) return;
      const fmax = Math.max.apply(null, d.rows.map((r) => r[2]));
      const A = axes(ctx, box, 0, d.rows.length, fmax + 1, c, { xlabel: RAW[p.ds].unit, ylabel: RAW[p.ds].who });
      d.rows.forEach((r, i) => { ctx.fillStyle = c.c6; ctx.globalAlpha = 0.7; ctx.fillRect(A.X(i) + 1, A.Y(r[2]), A.X(1) - A.X(0) - 2, A.Y(0) - A.Y(r[2])); ctx.globalAlpha = 1; if (!nar || d.rows.length < 7) G.txt(ctx, cls(r), A.X(i + 0.5), A.Y(0) + 12, { color: c.muted, size: 10 }); });
    },
    live(p, d) { return d.disc ? '\\text{مجموع الشهداء} = ' + d.total : '\\frac{' + d.range + '}{' + p.k + '} = ' + M.fmt(d.q, 2) + ' \\approx ' + d.len; },
    results(p, d) {
      if (d.disc) return [['عدد القيم (السنوات)', String(d.N), false], ['مجموع البيانات', String(d.total) + ' شهيداً', false], ['عدد السنوات التي لم يكن فيها شهداء', String((d.rows.find((r) => r[0] === 0) || [0, 0, 0])[2]), false], ['عدد السنوات التي كان فيها شهيدان', String((d.rows.find((r) => r[0] === 2) || [0, 0, 0])[2]), false]];
      const r = [['أصغر قيمة ، أكبر قيمة', d.min + ' ، ' + d.max, false], ['المدى', String(d.range), false], ['طول الفئة', M.fmt(d.q, 2) + ' ← ' + d.len, false, 'pos'], ['الفئات', d.rows.map(cls).join(' ، '), false], ['مجموع التكرارات', String(d.N), false]];
      if (d.extra) r.push(['ملاحظة', 'أضيفت فئة لأن الفئات لم تشمل أكبر قيمة', false, 'neg']);
      return r;
    },
    steps(p, d) {
      if (d.disc) return ['نكتب كل قيمة مختلفة ونعدّ مرات تكرارها.', 'مجموع التكرارات = عدد السنوات = ' + d.N + '.'];
      return ['المدى = ' + d.max + ' − ' + d.min + ' = ' + d.range + '.', 'طول الفئة = ' + d.range + ' ÷ ' + p.k + ' = ' + M.fmt(d.q, 2) + (M.isInt(d.q) ? '.' : '، ويُقرّب إلى ' + d.len + '.'), 'الحد الأدنى للفئة الأولى = أصغر قيمة = ' + d.min + '، والحد الأعلى = ' + d.min + ' + ' + d.len + ' − 1 = ' + (d.min + d.len - 1) + '.', 'نفرّغ البيانات بالإشارات ونعدّها: ' + d.rows.map((r) => cls(r) + ': ' + r[2]).join('، ') + '.'];
    },
    explain(a, b, da, db) { return da && a.k !== b.k && !db.disc ? ['تغيّر عدد الفئات فتغيّر طولها إلى ' + db.len + '؛ فئات أقل تعني تفاصيل أقل.'] : []; },
    learn: [
      '**نشاط 1 ص 86:** بلغ عدد الشهداء في محافظة القدس خلال الفترة 1994–2015م 156 شهيداً (الجهاز المركزي للإحصاء الفلسطيني)؛ نلخّص البيانات في جدول تكراري.',
      '**نشاط 2 ص 86:** علامات 26 طالباً: المدى = 31 − 11 = 20، والفئات 11–17 و 18–24 و 25–31.',
      '**أتعلم ص 87:** طول الفئة = المدى ÷ عدد الفئات؛ وإذا كان الناتج عشرياً يُقرّب إلى العدد الصحيح الذي يليه. **الفئة:** مجموعة تحوي عدداً من القيم المتقاربة.',
      '**نشاط 3 ص 87:** 30 علامة في خمس فئات: المدى 19 وطول الفئة 3.8 ≈ 4: 10–13 ، 14–17 ، 18–21 ، 22–25 ، 26–29.',
      '**نشاط 4 ص 88:** أجور 50 عاملاً في 6 فئات أولاها 50–59.'
    ],
    challenges: [
      { q: 'كوّن جدول نشاط 3 (خمس فئات) وجد عدد الطلبة في الفئة 10–13.', hint: 'اختر بيانات نشاط 3 و $k = 5$.', init: { ds: 'math26', k: 3 }, check: (p, d) => p.ds === 'arabic30' && p.k === 5, why: (p, d) => 'تكرار 10–13 هو ' + d.rows[0][2] + '.' },
      { q: 'وزّع أجور العسل على 6 فئات (نشاط 4).', hint: 'طول الفئة 58 ÷ 6 ≈ 10.', init: { ds: 'math26', k: 3 }, check: (p, d) => p.ds === 'honey' && p.k === 6 },
      { q: 'كم سنة لم يكن فيها شهداء؟ (نشاط 1)', hint: 'اختر بيانات الشهداء.', init: { ds: 'math26', k: 3 }, check: (p) => p.ds === 'martyrs', why: () => 'سنة واحدة.' }
    ],
    tutor: [
      { q: 'لماذا نقرّب طول الفئة إلى العدد التالي؟', k: ['نقرب', 'التالي', 'طول'], a: () => 'حتى تغطي الفئات كل البيانات حتى أكبر قيمة؛ لو قرّبنا إلى الأصغر لبقيت قيم كبيرة خارج الفئات.' },
      { q: 'ما فائدة الجدول التكراري؟', k: ['فائده', 'الجدول'], a: () => 'يلخّص البيانات الكثيرة فنعرف بسهولة عدد القيم في كل فئة (ص 86).' }
    ]
  });

  /* ======================= 4-2 التمثيل البياني ======================= */
  const CHARTS = [['hist', 'المدرّج التكراري'], ['poly', 'المضلّع التكراري'], ['curve', 'المنحنى التكراري'], ['ogive', 'المنحنى التكراري المتجمّع الصاعد']];
  G.reg({
    id: 'frequency-graphs', unit: U, order: 2, lesson: '4-2', lessonTitle: 'التمثيل البياني للجداول التكرارية ذات الفئات', page: 89,
    titleAr: 'المدرّج والمضلّع والمنحنى التكراري والمتجمّع الصاعد', titleEn: 'Histogram, Frequency Polygon & Ogive', tags: 'مدرج تكراري مضلع منحنى متجمع صاعد حدود فعليه مركز الفئه تكرار تراكمي',
    formula: '\\text{مركز الفئة} = \\frac{\\text{الحد الأدنى} + \\text{الحد الأعلى}}{2},\\quad \\text{الحد الفعلي الأدنى} = \\text{الحد الأدنى} - 0.5',
    book: 'الحد الفعلي الأدنى = الحد الأدنى – ٠,٥ ، الحد الفعلي الأعلى = الحد الأعلى + ٠,٥ ؛ مركز الفئة = (الحد الأدنى + الحد الأعلى) ÷ ٢',
    summary: 'المدرّج التكراري مستطيلات متلاصقة على الحدود الفعلية. المضلّع التكراري يصل نقاط (مركز الفئة، التكرار) ويُغلق بمركزين سابق ولاحق تكرارهما صفر، والمنحنى التكراري يصلها بمنحنى ممهّد. المنحنى المتجمّع الصاعد يصل (الحد الفعلي الأعلى، التكرار المتجمّع الصاعد).',
    vars: [['\\text{الفئات}', 'من جداول الكتاب', ''], ['f', 'التكرار', 'عدد صحيح'], ['\\text{التكرار المتجمّع}', 'مجموع التكرار مع ما قبله', 'ينتهي بمجموع التكرارات']],
    ar: { f: 'ت' },
    params: [
      { key: 'tb', label: '\\text{الجدول}', type: 'select', value: 'necklace', options: NAMES(['necklace', 'marks40', 'weights', 'english50', 'wages', 'kg42', 'ex2', 'gen20']) },
      { key: 'ch', label: '\\text{التمثيل}', type: 'select', value: 'hist', options: CHARTS }
    ],
    custom: true, canvasHint: 'المحور الأفقي: الحدود الفعلية (للمدرّج والمتجمّع) أو مراكز الفئات (للمضلّع والمنحنى)، والعمودي: التكرار.',
    compute(p) { const t = TAB[p.tb]; return Object.assign({ t: t }, stats(t.rows)); },
    drawCustom(ctx, W, H, p, d, c) {
      const t = d.t, nar = G.narrow(W); const len = t.rows[0][1] - t.rows[0][0] + 1;
      const ymax = p.ch === 'ogive' ? d.N : Math.max.apply(null, d.f) + 1;
      const xmin = d.lowA[0] - len, xmax = d.upA[d.upA.length - 1] + len;
      const box = { x: 46, y: 34, w: W - 66, h: H - 90 };
      const ticks = p.ch === 'hist' || p.ch === 'ogive' ? [d.lowA[0]].concat(d.upA) : [d.x[0] - len].concat(d.x, [d.x[d.x.length - 1] + len]);
      const A = axes(ctx, box, xmin, xmax, ymax, c, { xticks: ticks.filter((v, i) => !nar || i % 2 === 0), xlabel: p.ch === 'hist' || p.ch === 'ogive' ? 'الحدود الفعلية' : 'مركز الفئة', ylabel: p.ch === 'ogive' ? 'التكرار المتجمّع الصاعد' : t.who });
      G.txt(ctx, CHARTS.find((x) => x[0] === p.ch)[1], W / 2, 14, { color: c.c6, size: 15, w: '800' });
      if (p.ch === 'hist') d.f.forEach((f, i) => { ctx.fillStyle = c.c6; ctx.globalAlpha = 0.7; ctx.fillRect(A.X(d.lowA[i]), A.Y(f), A.X(d.upA[i]) - A.X(d.lowA[i]), A.Y(0) - A.Y(f)); ctx.globalAlpha = 1; ctx.strokeStyle = c.bg; ctx.lineWidth = 1.5; ctx.strokeRect(A.X(d.lowA[i]), A.Y(f), A.X(d.upA[i]) - A.X(d.lowA[i]), A.Y(0) - A.Y(f)); });
      else if (p.ch === 'ogive') { const pts = [[A.X(d.lowA[0]), A.Y(0)]].concat(d.cum.map((v, i) => [A.X(d.upA[i]), A.Y(v)])); polyline(ctx, pts, c.c6, 3, true); pts.forEach((q) => { ctx.fillStyle = c.c6; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); }); }
      else { const pts = [[A.X(d.x[0] - len), A.Y(0)]].concat(d.x.map((v, i) => [A.X(v), A.Y(d.f[i])]), [[A.X(d.x[d.x.length - 1] + len), A.Y(0)]]); polyline(ctx, pts, c.c6, 3, p.ch === 'curve'); if (p.ch === 'poly') pts.forEach((q) => { ctx.fillStyle = c.c6; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); }); }
    },
    live(p, d) { return '\\text{مجموع التكرارات} = ' + d.N; },
    results(p, d) {
      const t = d.t; const imax = d.f.indexOf(Math.max.apply(null, d.f));
      return [['الحدود الفعلية', d.lowA.map((v, i) => n(v) + ' – ' + n(d.upA[i])).join(' ، '), false], ['مراكز الفئات', d.x.map((v) => n(v)).join(' ، '), false], ['التكرار المتجمّع الصاعد', d.cum.join(' ، '), false], ['الفئة الأكثر تكراراً', cls(t.rows[imax]) + ' (' + d.f[imax] + ')', false, 'pos']];
    },
    steps(p, d) {
      return { hist: ['نطرح 0.5 من كل حد أدنى ونضيفها إلى كل حد أعلى لنحصل على الحدود الفعلية.', 'نرسم على كل فئة مستطيلاً ارتفاعه تكرارها، والمستطيلات متلاصقة.'],
        poly: ['نحسب مركز كل فئة: (الحد الأدنى + الحد الأعلى) ÷ 2.', 'نعيّن النقاط (مركز الفئة، التكرار) ونصل بينها بقطع مستقيمة.', 'نضيف مركز فئة سابقة ومركز فئة لاحقة تكرارهما صفر ليصبح المضلّع مغلقاً.'],
        curve: ['النقاط نفسها في المضلّع (مراكز الفئات وتكراراتها) مع المركزين الإضافيين.', 'نصل بينها بمنحنى ممهّد بدل القطع المستقيمة.'],
        ogive: ['التكرار المتجمّع الصاعد لكل فئة = تكرارها + تكرارات ما قبلها: ' + d.cum.join('، ') + '.', 'نعيّن النقاط (الحد الفعلي الأعلى، التكرار المتجمّع) ونبدأ من الحد الفعلي الأدنى للفئة الأولى بتكرار صفر.', 'آخر نقطة تساوي مجموع التكرارات ' + d.N + '.'] }[p.ch];
    },
    explain(a, b) { return a.ch !== b.ch ? [{ hist: 'المدرّج: مستطيلات متلاصقة على الحدود الفعلية.', poly: 'المضلّع: نقاط (مركز الفئة، التكرار) موصولة بقطع مستقيمة ومغلقة بصفرين.', curve: 'المنحنى التكراري: النقاط نفسها بمنحنى ممهّد يبيّن أي القيم أكثر تكراراً.', ogive: 'المتجمّع الصاعد: يتزايد دائماً حتى يبلغ مجموع التكرارات.' }[b.ch]] : []; },
    learn: [
      '**نشاط 1 ص 89:** التوزيع السكاني للفلسطينيين نهاية 2015م ممثّلاً بالقطاعات الدائرية.',
      '**أتعلم ص 89:** الحد الفعلي الأدنى = الحد الأدنى − 0.5 ، والحد الفعلي الأعلى = الحد الأعلى + 0.5.',
      '**نشاط 2 ص 90:** المدرّج التكراري لأطوال 60 قلادة؛ أكثر الأطوال مبيعاً في الفئة 55–59.',
      '**أتعلم ص 91:** مركز الفئة = (الحد الأدنى + الحد الأعلى) ÷ 2. نشاط 3: المضلّع التكراري لعلامات 40 طالبة.',
      '**أتعلم ص 93:** التكرار المتجمّع الصاعد (التراكمي) مجموع كل تكرار مع جميع التكرارات التي تسبقه. نشاط 6: عدد العمال الذين أجورهم أكثر من 99.5 ديناراً = 30.'
    ],
    challenges: [
      { q: 'ارسم المدرّج التكراري لأطوال القلائد وحدد أكثر الأطوال مبيعاً (نشاط 2).', hint: 'جدول القلائد والمدرّج.', init: { tb: 'weights', ch: 'poly' }, check: (p) => p.tb === 'necklace' && p.ch === 'hist', why: () => 'الفئة 55–59 بتكرار 12.' },
      { q: 'مثّل أجور عمال النظافة بالمنحنى المتجمّع الصاعد (نشاط 6).', hint: 'جدول الأجور ثم المتجمّع الصاعد.', init: { tb: 'necklace', ch: 'hist' }, check: (p) => p.tb === 'wages' && p.ch === 'ogive', why: (p, d) => 'التكرار المتجمّع عند 99.5 هو ' + d.cum[2] + '، فالذين أجورهم أكثر من 99.5 عددهم ' + (d.N - d.cum[2]) + '.' },
      { q: 'مثّل علامات 40 طالبة بالمضلّع التكراري (نشاط 3).', hint: 'جدول نشاط 3 والمضلّع.', init: { tb: 'necklace', ch: 'hist' }, check: (p) => p.tb === 'marks40' && p.ch === 'poly' }
    ],
    tutor: [
      { q: 'لماذا نستخدم الحدود الفعلية؟', k: ['الحدود الفعليه', 'لماذا'], a: () => 'لأن البيانات أعداد صحيحة والفئات منفصلة (44 ثم 45)؛ الحدود الفعلية (44.5) تجعل المستطيلات متلاصقة دون فراغ.' },
      { q: 'ما الفرق بين المنحنى التكراري والمتجمّع الصاعد؟', k: ['الفرق', 'المتجمع'], a: () => 'المنحنى التكراري يرتفع ثم ينخفض حسب تكرار كل فئة، أما المتجمّع الصاعد فيتزايد دائماً حتى مجموع التكرارات.' }
    ]
  });

  /* ======================= 4-3 مقاييس النزعة المركزية ======================= */
  G.reg({
    id: 'central-tendency', unit: U, order: 3, lesson: '4-3', lessonTitle: 'مقاييس النزعة المركزية للجداول التكرارية', page: 95,
    titleAr: 'الوسط الحسابي والوسيط والمنوال للجداول التكرارية', titleEn: 'Mean, Median & Mode of Grouped Data', tags: 'وسط حسابي وسيط منوال رتبه الوسيط فئه وسيطيه نزعه مركزيه',
    formula: '\\bar{x} = \\frac{\\sum (x \\times f)}{\\sum f},\\qquad \\text{رتبة الوسيط} = \\frac{\\sum f}{2}',
    book: 'س̄ = مجـ(س × ت) ÷ مجـ ت ؛ رتبة الوسيط = مجـ ت ÷ ٢ ؛ المنوال = مركز الفئة الأكثر تكراراً',
    ar: { f: 'ت' },
    summary: 'الوسط الحسابي للجدول التكراري: نضرب مركز كل فئة في تكرارها ونقسم المجموع على مجموع التكرارات. الوسيط: نجد رتبته $\\frac{\\sum f}{2}$، ونحدد الفئة الوسيطية من التكرار المتجمّع، ثم نستخدم التناسب بين الحدود الفعلية العليا والتكرار المتجمّع. المنوال: مركز الفئة الأكثر تكراراً.',
    vars: [['x', 'مركز الفئة', ''], ['f', 'التكرار (ت)', ''], ['\\bar{x}', 'الوسط الحسابي', '']],
    params: [{ key: 'tb', label: '\\text{الجدول}', type: 'select', value: 'reading', options: NAMES(['reading', 'wind', 'poem', 'marks32', 'luggage', 'necklace', 'weights', 'gen20']) }],
    custom: true, canvasHint: 'الخط الأزرق: الوسط الحسابي، الأخضر: الوسيط، البنفسجي: المنوال (مركز أعلى مستطيل).',
    compute(p) { const t = TAB[p.tb]; return Object.assign({ t: t }, stats(t.rows)); },
    drawCustom(ctx, W, H, p, d, c) {
      const t = d.t, nar = G.narrow(W); const len = t.rows[0][1] - t.rows[0][0] + 1;
      const box = { x: 46, y: nar ? 78 : 62, w: W - 66, h: H - (nar ? 138 : 122) }; const ymax = Math.max.apply(null, d.f) + 1;
      const A = axes(ctx, box, d.lowA[0] - len / 2, d.upA[d.upA.length - 1] + len / 2, ymax, c, { xticks: [d.lowA[0]].concat(d.upA).filter((v, i) => !nar || i % 2 === 0), xlabel: t.unit + ' (الحدود الفعلية)', ylabel: t.who });
      d.f.forEach((f, i) => { ctx.fillStyle = i === d.mi ? c.c3 : c.c6; ctx.globalAlpha = i === d.mi ? 0.45 : 0.55; ctx.fillRect(A.X(d.lowA[i]), A.Y(f), A.X(d.upA[i]) - A.X(d.lowA[i]), A.Y(0) - A.Y(f)); ctx.globalAlpha = 1; });
      const items = [[d.mean, c.c1, 'الوسط س̄ = ' + n(d.mean)], [d.median, c.c3, 'الوسيط = ' + n(d.median)], [d.mode, c.c5, 'المنوال = ' + n(d.mode)]];
      items.forEach((it, k) => {
        ctx.save(); ctx.strokeStyle = it[1]; ctx.lineWidth = 3; ctx.setLineDash(k ? [7, 5] : []); ctx.beginPath(); ctx.moveTo(A.X(it[0]), A.Y(ymax)); ctx.lineTo(A.X(it[0]), A.Y(0)); ctx.stroke();
        const lx = nar ? W - 16 : W - 16 - k * (W - 32) / 3, ly = nar ? 14 + k * 18 : 16; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 22, ly); ctx.stroke(); ctx.restore();
        G.txt(ctx, it[2], lx - 28, ly, { color: it[1], size: nar ? 10.5 : 13, w: '800', align: 'right' });
      });
    },
    live(p, d) { return '\\bar{x} = \\frac{' + n(d.sxf) + '}{' + d.N + '} = ' + n(d.mean, 3); },
    results(p, d) {
      const t = d.t;
      return [['مجـ(س × ت)', n(d.sxf), false], ['مجـ ت', String(d.N), false], ['الوسط الحسابي س̄', n(d.mean, 3), false, 'pos'], ['رتبة الوسيط', n(d.rank), false], ['الفئة الوسيطية', n(d.lowA[d.mi]) + ' – ' + n(d.upA[d.mi]), false], ['الوسيط', n(d.median, 3), false, 'pos'],
        ['المنوال', n(d.mode) + (d.modes.length > 1 ? ' (توجد ' + d.modes.length + ' فئات بأكبر تكرار؛ أولها ' + cls(t.rows[d.modes[0]]) + ')' : ' (مركز الفئة ' + cls(t.rows[d.modes[0]]) + ')'), false, 'pos']];
    },
    steps(p, d) {
      return ['مراكز الفئات: ' + d.x.map((v) => n(v)).join('، ') + '.', 'مجـ(س × ت) = ' + d.x.map((v, i) => n(v) + ' × ' + d.f[i]).join(' + ') + ' = ' + n(d.sxf) + '، والوسط = ' + n(d.sxf) + ' ÷ ' + d.N + ' = ' + n(d.mean, 3) + '.',
        'رتبة الوسيط = ' + d.N + ' ÷ 2 = ' + n(d.rank) + '، وتقع بين التكرارين المتجمّعين ' + d.prev + ' و ' + d.cum[d.mi] + '، فالفئة الوسيطية ' + n(d.lowA[d.mi]) + ' – ' + n(d.upA[d.mi]) + '.',
        'بالتناسب: (الوسيط − ' + n(d.lowA[d.mi]) + ') ÷ (' + n(d.upA[d.mi]) + ' − ' + n(d.lowA[d.mi]) + ') = (' + n(d.rank) + ' − ' + d.prev + ') ÷ (' + d.cum[d.mi] + ' − ' + d.prev + ')، ومنه الوسيط = ' + n(d.median, 3) + '.',
        'المنوال = مركز الفئة الأكثر تكراراً = ' + n(d.mode) + '.'];
    },
    explain(a, b, da, db) { return a.tb !== b.tb ? ['جدول جديد: الوسط ' + n(db.mean, 2) + ' والوسيط ' + n(db.median, 2) + ' والمنوال ' + n(db.mode) + '.'] : []; },
    learn: [
      '**نشاط 1 ص 95:** عدد المراكز الثقافية في 16 محافظة فلسطينية عام 2015م؛ الوسيط 29.5.',
      '**أتعلم ص 95:** $\\bar{x} = \\frac{\\sum (x \\times f)}{\\sum f}$ حيث $x$ مركز الفئة و $f$ التكرار.',
      '**أتعلم ص 97:** رتبة الوسيط = مجموع التكرارات ÷ 2. نشاط 3: رتبة الوسيط لزمن إلقاء القصيدة 14 والوسيط 10.5 دقائق.',
      '**مثال ص 97–98:** ساعات المطالعة: رتبة الوسيط 5 بين التكرارين المتجمّعين 2 و 6، والفئة الوسيطية 5.5–10.5، و $\\frac{x - 5.5}{5} = \\frac{3}{4}$ ومنه الوسيط 9.25.',
      '**أتعلم ص 99:** المنوال للجداول التكرارية هو مركز الفئة الأكثر تكراراً.'
    ],
    challenges: [
      { q: 'جد وسيط ساعات المطالعة (مثال ص 97).', hint: 'اختر جدول المثال.', init: { tb: 'wind' }, check: (p) => p.tb === 'reading', why: (p, d) => 'الوسيط = ' + n(d.median) + '.' },
      { q: 'جد الوسط الحسابي لسرعة الرياح (نشاط 2 ص 96).', hint: 'اختر جدول سرعة الرياح.', init: { tb: 'reading' }, check: (p) => p.tb === 'wind', why: (p, d) => 'س̄ = ' + n(d.sxf) + ' ÷ 20 = ' + n(d.mean, 2) + ' كم/س.' },
      { q: 'اختر جدولاً يقع وسيطه عند حد فعلي أعلى تماماً (نشاط 3 ص 97).', hint: 'زمن إلقاء القصيدة: رتبة الوسيط 14 = تكرار متجمّع.', init: { tb: 'reading' }, check: (p, d) => d.cum[d.mi] === d.rank }
    ],
    tutor: [
      { q: 'لماذا نستخدم مركز الفئة؟', k: ['مركز', 'لماذا'], a: () => 'لأننا لا نعرف القيم الفعلية داخل الفئة، فنفترض أن كل قيمها تساوي مركزها تقريباً.' },
      { q: 'كيف أحدد الفئة الوسيطية؟', k: ['الفئه الوسيطيه', 'احدد'], a: (p, d) => 'رتبة الوسيط ' + n(d.rank) + '؛ أول تكرار متجمّع يبلغها هو ' + d.cum[d.mi] + '، فالفئة الوسيطية ' + cls(d.t.rows[d.mi]) + '.' },
      { q: 'ما الفرق بين الوسط والوسيط هنا؟', k: ['الفرق', 'الوسط', 'الوسيط'], a: (p, d) => 'الوسط ' + n(d.mean, 2) + ' يتأثر بكل القيم، والوسيط ' + n(d.median, 2) + ' يقسم البيانات نصفين.' }
    ]
  });

  /* ======================= 4-4 الانحراف المعياري ======================= */
  const ACC = [647, 593, 618, 674, 746, 660, 649, 685, 1179, 558, 574, 594];
  G.reg({
    id: 'standard-deviation', unit: U, order: 4, lesson: '4-4', lessonTitle: 'الانحراف المعياري للجداول التكرارية', page: 101,
    titleAr: 'الانحراف المعياري للجداول التكرارية', titleEn: 'Standard Deviation of Grouped Data', tags: 'انحراف معياري تشتت مربع انحراف وسط حسابي سيجما حوادث الطرق',
    formula: '\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2 \\times f}{\\sum f}}',
    book: 'σ = √(مجـ (س – س̄)² × ت ÷ مجـ ت) ، حيث ت تكرار الفئة ، س مركز الفئة ، س̄ الوسط الحسابي',
    ar: { f: 'ت' },
    summary: 'الانحراف المعياري يقيس تشتت البيانات حول وسطها الحسابي: نربّع انحراف كل مركز فئة عن الوسط، ونضربه في التكرار، ونجمع، ثم نقسم على مجموع التكرارات ونأخذ الجذر التربيعي.',
    vars: [['x', 'مركز الفئة', ''], ['f', 'التكرار (ت)', ''], ['\\bar{x}', 'الوسط الحسابي', ''], ['\\sigma', 'الانحراف المعياري', '$\\sigma \\ge 0$']],
    params: [{ key: 'tb', label: '\\text{الجدول}', type: 'select', value: 'math9', options: G.opts([['math9', TAB.math9.name], ['arabicT', TAB.arabicT.name], ['stat20', TAB.stat20.name], ['gen20', TAB.gen20.name], ['acc', 'نشاط 1 ص 101: حوادث الطرق الشهرية في فلسطين 2014م']]) }],
    custom: true, canvasHint: 'جدول الحساب كما في الكتاب، وتحته مراكز الفئات وتكراراتها مع الوسط والشريط س̄ ± σ.',
    compute(p) {
      const rows = p.tb === 'acc' ? ACC.map((v) => [v, v, 1]) : TAB[p.tb].rows;
      return Object.assign({ rows: rows, acc: p.tb === 'acc' }, stats(rows));
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      const head = d.acc ? ['الشهر', 'عدد الحوادث (س)', '(س − س̄)²'] : nar ? ['الفئات', 'ت', 'س', 'س×ت', '(س−س̄)²', '× ت'] : ['الفئات', 'ت', 'س', 'س × ت', '(س − س̄)²', '(س − س̄)² × ت'];
      const body = d.rows.map((r, i) => (d.acc ? [String(i + 1), String(d.x[i]), n(d.dev2[i], 1)] : [cls(r), String(d.f[i]), n(d.x[i], 1), n(d.x[i] * d.f[i], 1), n(d.dev2[i], 2), n(d.dev2[i] * d.f[i], 2)]));
      const tot = d.acc ? ['المجموع', String(d.sxf), n(d.sdev, 1)] : ['المجموع', String(d.N), '', n(d.sxf, 1), '', n(d.sdev, 2)];
      const rows = [head].concat(body, [tot]); const rh = Math.min(28, (H * 0.62) / rows.length);
      const ye = table(ctx, 6, 8, W - 12, rows, c, { rh: rh, fs: nar ? 9.5 : 12, firstCol: true });
      // شريط الوسط ± σ
      const box = { x: 40, y: ye + 26, w: W - 60, h: H - ye - 70 }; if (box.h < 40) return;
      const lo = Math.min(d.x[0], d.mean - d.sd) - (d.acc ? 50 : 5), hi = Math.max(d.x[d.x.length - 1], d.mean + d.sd) + (d.acc ? 50 : 5);
      const A = axes(ctx, box, lo, hi, Math.max.apply(null, d.f) + 1, c, { ystep: 1, xticks: [M.round(d.mean - d.sd, 1), M.round(d.mean, 1), M.round(d.mean + d.sd, 1)], ylabel: 'ت' });
      ctx.fillStyle = c.c1; ctx.globalAlpha = 0.12; ctx.fillRect(A.X(d.mean - d.sd), A.Y(Math.max.apply(null, d.f) + 1), A.X(d.mean + d.sd) - A.X(d.mean - d.sd), A.Y(0) - A.Y(Math.max.apply(null, d.f) + 1)); ctx.globalAlpha = 1;
      d.x.forEach((v, i) => { ctx.strokeStyle = c.c6; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(A.X(v), A.Y(0)); ctx.lineTo(A.X(v), A.Y(d.f[i])); ctx.stroke(); ctx.fillStyle = c.c6; ctx.beginPath(); ctx.arc(A.X(v), A.Y(d.f[i]), 4, 0, 7); ctx.fill(); });
      ctx.strokeStyle = c.c1; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(A.X(d.mean), box.y); ctx.lineTo(A.X(d.mean), A.Y(0)); ctx.stroke();
      G.txt(ctx, 'س̄ ± σ', A.X(d.mean), box.y - 8, { color: c.c1, size: 12, w: '800', halo: c.bg });
    },
    live(p, d) { return '\\sigma = \\sqrt{\\frac{' + n(d.sdev, 2) + '}{' + d.N + '}} \\approx ' + n(d.sd, 3); },
    results(p, d) {
      const r = [['الوسط الحسابي س̄', n(d.mean, 3), false], ['مجـ (س − س̄)² × ت', n(d.sdev, 2), false], ['مجـ ت', String(d.N), false], ['الانحراف المعياري σ', n(d.sd, 3), false, 'pos']];
      if (d.acc) { const far = d.x.reduce((b, v) => (Math.abs(v - d.mean) > Math.abs(b - d.mean) ? v : b), d.x[0]); const close = d.x.reduce((b, v) => (Math.abs(v - d.mean) < Math.abs(b - d.mean) ? v : b), d.x[0]); r.push(['أبعد قيمة عن المعدل', String(far), false], ['أقرب قيمة إلى المعدل', String(close), false]); }
      return r;
    },
    steps(p, d) { return ['الوسط: س̄ = ' + n(d.sxf, 1) + ' ÷ ' + d.N + ' = ' + n(d.mean, 3) + '.', 'نحسب لكل فئة (س − س̄)² ثم نضربه في التكرار ونجمع: ' + n(d.sdev, 2) + '.', 'نقسم على ' + d.N + ' ونأخذ الجذر: σ = √(' + n(d.sdev / d.N, 3) + ') ≈ ' + n(d.sd, 3) + '.']; },
    explain(a, b, da, db) { return a.tb !== b.tb ? ['الانحراف المعياري الآن ' + n(db.sd, 2) + '؛ كلما كبر كانت البيانات أكثر تشتتاً حول الوسط.'] : []; },
    learn: [
      '**نشاط 1 ص 101:** حوادث الطرق الشهرية في فلسطين 2014م (الجهاز المركزي للإحصاء): أكثر القيم بعداً عن المعدل 1179.',
      '**أتعلم ص 101:** الانحراف المعياري هو الجذر التربيعي لمجموع حاصل ضرب التكرارات في مربع انحراف مراكز الفئات عن الوسط الحسابي، مقسوماً على مجموع التكرارات.',
      '**نشاط 2 ص 102:** جدول علامات طلبة التاسع: مراكز الفئات 31 ، 40 ، … ، 85.',
      '**تمارين عامة ص 103:** إذا كان مجـ ت × (س − س̄)² = 320 و ن = 40 فإن σ = √8 = 2√2.'
    ],
    challenges: [
      { q: 'احسب الانحراف المعياري لعلامات اللغة العربية (تمرين 1 ص 102).', hint: 'اختر الجدول.', init: { tb: 'math9' }, check: (p) => p.tb === 'arabicT', why: (p, d) => 'σ ≈ ' + n(d.sd, 3) + '.' },
      { q: 'أيّ جداول الكتاب أكثر تشتتاً: تمرين 2 أم تمارين عامة ص 104؟ اختر الأكثر تشتتاً.', hint: 'قارن قيمتي σ.', init: { tb: 'math9' }, check: (p, d) => p.tb === 'stat20' }
    ],
    tutor: [
      { q: 'لماذا نربّع الانحرافات؟', k: ['نربع', 'مربع', 'لماذا'], a: () => 'لأن الانحرافات الموجبة والسالبة يلغي بعضها بعضاً عند الجمع؛ التربيع يجعلها كلها موجبة.' },
      { q: 'ماذا يعني انحراف معياري كبير؟', k: ['كبير', 'يعني'], a: () => 'أن القيم متباعدة عن الوسط الحسابي؛ والصغير يعني أنها متقاربة حوله.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
