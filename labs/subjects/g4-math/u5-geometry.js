/* رياضيات الرابع — الوحدة الخامسة: الهندسة والقياس (1) (ص 90–108) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 5;
  const RAD = Math.PI / 180;
  const typeOf = (a) => (a === 90 ? 'قائمة' : a === 180 ? 'مستقيمة' : a < 90 ? 'حادة' : 'منفرجة');
  // قوس زاوية عند الرأس بين اتجاهين (بالدرجات، عكس عقارب الساعة على الشاشة)
  const arc = (ctx, x, y, r, a0, a1, col, w) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.beginPath(); ctx.arc(x, y, r, -a0 * RAD, -a1 * RAD, a1 > a0); ctx.stroke(); ctx.restore(); };
  const rightMark = (ctx, x, y, a0, s, col) => { const u = [Math.cos(a0 * RAD), -Math.sin(a0 * RAD)], v = [Math.cos((a0 + 90) * RAD), -Math.sin((a0 + 90) * RAD)]; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x + u[0] * s, y + u[1] * s); ctx.lineTo(x + (u[0] + v[0]) * s, y + (u[1] + v[1]) * s); ctx.lineTo(x + v[0] * s, y + v[1] * s); ctx.stroke(); ctx.restore(); };
  const dotGrid = (ctx, W, H, step, c) => { ctx.fillStyle = c.muted; for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) { ctx.globalAlpha = 0.45; ctx.fillRect(x - 1, y - 1, 2, 2); } ctx.globalAlpha = 1; };
  // مستقيم بسهمين يمر بنقطة باتجاه زاوية
  const fullLine = (ctx, cx, cy, ang, L, col, w) => { const dx = Math.cos(ang * RAD) * L, dy = -Math.sin(ang * RAD) * L; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 3; ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke(); ctx.restore(); G.arrow(ctx, cx + dx * 0.9, cy + dy * 0.9, cx + dx, cy + dy, col, w || 3); G.arrow(ctx, cx - dx * 0.9, cy - dy * 0.9, cx - dx, cy - dy, col, w || 3); };

  /* ======================= الدرس الأول: المستقيمات المتوازية والمتعامدة (ص 92–96) ======================= */
  const SHAPES = {
    rect: { name: 'مستطيل (نشاط 12 أ)', pts: [[-3, -1.6], [3, -1.6], [3, 1.6], [-3, 1.6]] },
    square: { name: 'مربع (نشاط 12 ب)', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]] },
    trap: { name: 'شبه منحرف (نشاط 12 جـ)', pts: [[-3.2, -1.5], [3.2, -1.5], [2, 1.5], [-2, 1.5]] },
    rhom: { name: 'معيّن قائم على رأسه (نشاط 12 د)', pts: [[0, -2.4], [2.4, 0], [0, 2.4], [-2.4, 0]] },
    tri: { name: 'مثلث (نشاط 12 هـ)', pts: [[-3, -1.6], [3, -1.6], [0, 1.8]] },
    house: { name: 'الخماسي أ ب جـ د هـ (نشاط 13)', pts: [[-3, 1.6], [1.6, 1.6], [3, 0], [1.6, -1.6], [-3, -1.6]], labels: ['أ', 'ب', 'جـ', 'د', 'هـ'] }
  };
  function sides(pts) { return pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return [p, q, Math.atan2(q[1] - p[1], q[0] - p[0]) / RAD]; }); }
  function analyzeShape(pts) {
    const s = sides(pts); const par = [], per = [];
    const norm = (a) => ((a % 180) + 180) % 180;
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      const d = Math.abs(norm(s[i][2]) - norm(s[j][2])); const dd = Math.min(d, 180 - d);
      if (dd < 0.5) par.push([i, j]); else if (Math.abs(dd - 90) < 0.5 && (j === i + 1 || (i === 0 && j === s.length - 1))) per.push([i, j]);
    }
    return { s: s, par: par, per: per };
  }
  G.reg({
    id: 'parallel-perpendicular', unit: U, order: 1, lesson: '5-1', lessonTitle: 'المستقيمات المتوازية والمتعامدة', page: 92,
    titleAr: 'المستقيمات المتوازية والمتعامدة والمتقاطعة', titleEn: 'Parallel, Perpendicular & Intersecting Lines', tags: 'مستقيم متوازي متعامد متقاطع زاويه قائمه البعد ثابت ممر دراجات شبكه نقاط مستطيل مربع شبه منحرف',
    formula: '\\text{أب} \\parallel \\text{جـ د},\\qquad \\text{أب} \\perp \\text{جـ د}',
    book: 'المستقيمان اللذان لا يتقاطعان متوازيان (أب // جـ د) والبعد بينهما ثابت ؛ والمستقيمان اللذان يتقاطعان ويكوّنان زاوية قائمة متعامدان (أب ⊥ جـ د)',
    summary: 'يسمى المستقيمان اللذان لا يتقاطعان **متوازيين**، والبعد بينهما ثابت. ويسمى المستقيمان اللذان يتقاطعان ويكوّنان زاوية قائمة **متعامدين**. والمستقيمان المتقاطعان قد يكونان غير متعامدين.',
    vars: [['\\text{أب}', 'المستقيم الأول', ''], ['\\text{جـ د}', 'المستقيم الثاني', '']],
    ar: { A: 'أ', B: 'ب', C: 'جـ', D: 'د' },
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'lines', options: [['lines', 'مستقيمان على شبكة النقاط'], ['shapes', 'أضلاع الأشكال (نشاطا 12 و 13)']] },
      { key: 'a1', label: '\\text{ميل أب}', min: 0, max: 175, step: 5, value: 0, int: true, unit: '°', hidden: (p) => p.mode !== 'lines' },
      { key: 'a2', label: '\\text{ميل جـ د}', min: 0, max: 175, step: 5, value: 0, int: true, unit: '°', hidden: (p) => p.mode !== 'lines' },
      { key: 'off', label: '\\text{إزاحة جـ د}', min: -4, max: 4, step: 1, value: 3, int: true, hidden: (p) => p.mode !== 'lines' },
      { key: 'shape', label: '\\text{الشكل}', type: 'select', value: 'rect', options: Object.keys(SHAPES).map((k) => [k, SHAPES[k].name]), hidden: (p) => p.mode !== 'shapes' }
    ],
    custom: true, canvasHint: 'غيّر ميل المستقيمين: إذا تساوى الميلان لا يلتقيان أبداً (متوازيان)، وإذا كان الفرق ٩٠° تظهر الزاوية القائمة (متعامدان).',
    compute(p) {
      if (p.mode === 'shapes') { const a = analyzeShape(SHAPES[p.shape].pts); return { shapes: true, a: a, sh: SHAPES[p.shape] }; }
      const diff = Math.abs(p.a1 - p.a2); const dd = Math.min(diff, 180 - diff);
      const kind = dd === 0 ? (p.off === 0 ? 'same' : 'par') : dd === 90 ? 'perp' : 'cross';
      return { kind: kind, dd: dd };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const step = Math.max(22, Math.min(W, H) / 12); dotGrid(ctx, W, H, step, c);
      const cx = W / 2, cy = H / 2;
      if (d.shapes) {
        const sc = Math.min(W / 8, H / 6.4); const P = (q) => [cx + q[0] * sc, cy - q[1] * sc];
        const cols = [c.c1, c.c4, c.c5]; const colOf = {};
        d.a.par.forEach((pr, k) => { colOf[pr[0]] = cols[k % 3]; colOf[pr[1]] = cols[k % 3]; });
        d.a.s.forEach((s, i) => { const A = P(s[0]), B = P(s[1]); ctx.strokeStyle = colOf[i] || c.text; ctx.lineWidth = colOf[i] ? 5 : 2.4; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); });
        const n = d.sh.pts.length;
        d.a.per.forEach((pr) => { const i = pr[0] === 0 && pr[1] === n - 1 ? 0 : pr[1]; const V = P(d.sh.pts[i]); const prev = d.sh.pts[(i - 1 + n) % n], next = d.sh.pts[(i + 1) % n]; const a0 = Math.atan2(next[1] - d.sh.pts[i][1], next[0] - d.sh.pts[i][0]) / RAD; const a1 = Math.atan2(prev[1] - d.sh.pts[i][1], prev[0] - d.sh.pts[i][0]) / RAD; const lo = ((a1 - a0 + 360) % 360) === 90 ? a0 : a1; rightMark(ctx, V[0], V[1], lo, 12, c.c2); });
        if (d.sh.labels) d.sh.pts.forEach((q, i) => { const V = P(q); G.txt(ctx, d.sh.labels[i], V[0] + (q[0] >= 0 ? 16 : -16), V[1] + (q[1] >= 0 ? -14 : 14), { color: c.text, size: 16, w: '800', halo: c.bg }); });
        G.txt(ctx, d.a.par.length ? 'الأضلاع الملوّنة بلون واحد متوازية' : 'لا يوجد ضلعان متوازيان', W / 2, H - 16, { color: c.text, size: 13, w: '800', halo: c.bg });
        return;
      }
      const L = Math.hypot(W, H); const sh = p.off * step;
      const n2 = [-Math.sin(p.a2 * RAD), -Math.cos(p.a2 * RAD)]; // اتجاه عمودي على جـ د على الشاشة
      const c2x = cx + n2[0] * sh, c2y = cy + n2[1] * sh;
      fullLine(ctx, cx, cy, p.a1, L, c.c1, 3); fullLine(ctx, c2x, c2y, p.a2, L, c.c4, 3);
      const lab = (x0, y0, ang, t1, t2, col) => { const dx = Math.cos(ang * RAD), dy = -Math.sin(ang * RAD); const r = Math.min(W, H) * 0.34; [[t1, r], [t2, -r]].forEach((t) => { const x = x0 + dx * t[1], y = y0 + dy * t[1]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); G.txt(ctx, t[0], x - dy * 18, y + dx * 18, { color: col, size: 16, w: '800', halo: c.bg }); }); };
      lab(cx, cy, p.a1, 'أ', 'ب', c.c1); lab(c2x, c2y, p.a2, 'جـ', 'د', c.c4);
      if (d.kind === 'par') {
        // البعد الثابت: قطع عمودية بين المستقيمين
        [-0.3, 0, 0.3].forEach((t) => { const dx = Math.cos(p.a1 * RAD) * W * t, dy = -Math.sin(p.a1 * RAD) * W * t; ctx.save(); ctx.strokeStyle = c.c2; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(cx + dx, cy + dy); ctx.lineTo(c2x + dx, c2y + dy); ctx.stroke(); ctx.restore(); });
        G.txt(ctx, 'البعد بين المستقيمين ثابت = ' + G.L(Math.abs(p.off)) + ' وحدات', W / 2, H - 16, { color: c.c2, size: 13, w: '800', halo: c.bg });
      } else if (d.kind !== 'same') {
        // نقطة التقاطع
        const d1 = [Math.cos(p.a1 * RAD), -Math.sin(p.a1 * RAD)], d2 = [Math.cos(p.a2 * RAD), -Math.sin(p.a2 * RAD)];
        const det = d1[0] * (-d2[1]) - d1[1] * (-d2[0]); const rx = c2x - cx, ry = c2y - cy; const t = (rx * (-d2[1]) - ry * (-d2[0])) / det;
        const ix = cx + d1[0] * t, iy = cy + d1[1] * t;
        ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(ix, iy, 5, 0, 7); ctx.fill();
        const lo = Math.min(p.a1, p.a2), hi = Math.max(p.a1, p.a2);
        if (d.kind === 'perp') rightMark(ctx, ix, iy, lo, 16, c.c2); else { arc(ctx, ix, iy, 26, lo, hi, c.c3, 2.4); G.txt(ctx, G.L(hi - lo) + '°', ix + Math.cos((lo + hi) / 2 * RAD) * 44, iy - Math.sin((lo + hi) / 2 * RAD) * 44, { color: c.c3, size: 13, w: '800', halo: c.bg }); }
        G.txt(ctx, d.kind === 'perp' ? 'يتقاطعان بزاوية قائمة: ٤ زوايا قائمة' : 'يتقاطعان بزاوية غير قائمة', W / 2, H - 16, { color: c.text, size: 13, w: '800', halo: c.bg });
      } else G.txt(ctx, 'المستقيمان منطبقان (مستقيم واحد)', W / 2, H - 16, { color: c.muted, size: 13, w: '800', halo: c.bg });
    },
    live(p, d) {
      if (d.shapes) return '\\text{أزواج متوازية: ' + d.a.par.length + '،\\ زوايا قائمة: ' + d.a.per.length + '}';
      return d.kind === 'par' ? '\\text{أب} \\parallel \\text{جـ د}' : d.kind === 'perp' ? '\\text{أب} \\perp \\text{جـ د}' : d.kind === 'cross' ? '\\text{متقاطعان بزاوية } ' + d.dd + '^\\circ' : '\\text{منطبقان}';
    },
    results(p, d) {
      if (d.shapes) {
        const lb = d.sh.labels; const nm = (i) => (lb ? lb[i] + ' ' + lb[(i + 1) % lb.length] : 'ضلع ' + G.L(i + 1));
        return [['أزواج الأضلاع المتوازية', d.a.par.length ? d.a.par.map((pr) => nm(pr[0]) + ' // ' + nm(pr[1])).join(' ، ') : 'لا يوجد', false, d.a.par.length ? 'pos' : 'neg'],
          ['الأضلاع المتعامدة', d.a.per.length ? d.a.per.map((pr) => nm(pr[0]) + ' ⊥ ' + nm(pr[1])).join(' ، ') : 'لا يوجد', false]];
      }
      const name = { par: 'متوازيان ✔ (لا يتقاطعان)', perp: 'متعامدان ✔ (زاوية قائمة)', cross: 'متقاطعان غير متعامدين', same: 'منطبقان' }[d.kind];
      return [['العلاقة بين أب و جـ د', name, false, d.kind === 'cross' || d.kind === 'same' ? '' : 'pos'], ['الزاوية بينهما', G.L(d.dd) + '°', false], ['عدد نقاط التقاطع', d.kind === 'par' ? '٠' : d.kind === 'same' ? 'لا نهائي' : '١', false]];
    },
    steps(p, d) {
      if (d.shapes) return ['نبحث عن ضلعين لهما الاتجاه نفسه ولا يلتقيان مهما امتدا: ' + (d.a.par.length ? 'وجدنا ' + G.L(d.a.par.length) + ' زوج.' : 'لا يوجد في هذا الشكل.'), 'ونبحث عن ضلعين متجاورين بينهما زاوية قائمة: ' + G.L(d.a.per.length) + '.'];
      if (d.kind === 'par') return ['الميلان متساويان (' + G.L(p.a1) + '°)، فالمستقيمان لا يتقاطعان مهما امتدا.', 'البعد بينهما ثابت (القطع الحمراء متساوية)، فهما متوازيان: أب // جـ د.'];
      if (d.kind === 'perp') return ['الفرق بين الميلين ٩٠°، فالمستقيمان يتقاطعان ويكوّنان زاوية قائمة.', 'إذن أب ⊥ جـ د ، والزوايا الأربع الناتجة قائمة.'];
      if (d.kind === 'cross') return ['المستقيمان يتقاطعان بزاوية ' + G.L(d.dd) + '° ، وهي ليست قائمة.', 'المستقيمان المتقاطعان قد يكونان غير متعامدين.'];
      return ['المستقيمان على الخط نفسه.'];
    },
    explain(a, b, da, db) { return da && da.kind !== db.kind ? ['أصبح المستقيمان ' + { par: 'متوازيين.', perp: 'متعامدين.', cross: 'متقاطعين.', same: 'منطبقين.' }[db.kind]] : []; },
    learn: [
      '**نشاط 2 ص 92:** حافة ممر الدراجات وحافة ممر المشاة لا تلتقيان؛ «يسمى المستقيمان اللذان لا يتقاطعان بالمستقيمين المتوازيين».',
      '**نشاط 4 ص 93:** أب يوازي جـ د ويكتب أب // جـ د ، والبعد بين المستقيمين المتوازيين ثابت.',
      '**نشاط 5 ص 93:** أمثلة: الباركود، الدرج، سكة الحديد، الشارع.',
      '**نشاط 6 ص 94:** طريق عبد الله وطريق ليلى يتقاطعان بزاوية قائمة: «المستقيمان اللذان يتقاطعان ويكوّنان زاوية قائمة يسميان بالمستقيمين المتعامدين» (أب ⊥ جـ د).',
      '**نشاط 11 ص 95:** المستقيمان المتقاطعان قد يكونان غير متعامدين.',
      '**نشاط 13 ص 96:** في الخماسي: الضلع أ ب والضلع د هـ متوازيان، و أ ب و أ هـ متعامدان، و د هـ و أ هـ متعامدان.'
    ],
    challenges: [
      { q: 'اجعل المستقيمين أب و جـ د متوازيين.', hint: 'اجعل الميلين متساويين مع إزاحة.', init: { mode: 'lines', a1: 0, a2: 30, off: 2 }, check: (p, d) => d.kind === 'par' },
      { q: 'اجعل المستقيمين متعامدين (أب ⊥ جـ د).', hint: 'الفرق بين الميلين ٩٠°.', init: { mode: 'lines', a1: 20, a2: 50, off: 1 }, check: (p, d) => d.kind === 'perp' },
      { q: 'اختر شكلاً من نشاط 12 ليس فيه ضلعان متوازيان.', hint: 'جرّب الأشكال.', init: { mode: 'shapes', shape: 'rect' }, check: (p, d) => p.mode === 'shapes' && d.a && d.a.par.length === 0, why: () => 'المثلث: كل ضلعين فيه يلتقيان.' }
    ],
    tutor: [
      { q: 'ما الفرق بين المتعامدين والمتقاطعين؟', k: ['الفرق', 'متعامد', 'متقاطع'], a: () => 'كل متعامدين متقاطعان، لكن المتعامدين يكوّنان زاوية قائمة (٩٠°) بالذات.' },
      { q: 'لماذا لا يلتقي المستقيمان المتوازيان؟', k: ['يلتقي', 'متوازي'], a: () => 'لأن البعد بينهما ثابت في كل مكان، فلا يقتربان أبداً.' },
      { q: 'أين أشاهد مستقيمات متوازية؟', k: ['اشاهد', 'امثله'], a: () => 'كما في نشاط 5 ص 93: الباركود والدرج وسكة الحديد وخطوط الشارع، وفي غرفة الصف حواف السبورة.' }
    ]
  });

  /* ======================= الدرس الثاني: الزوايا والمنقلة (ص 97–103) ======================= */
  const PROT = [
    ['a4a', 'نشاط 4 ص 98: الزاوية أ ب جـ', 'measure', 90, 'r'], ['a4b', 'نشاط 4: الزاوية م ن ف', 'measure', 130, 'l'],
    ['a7', 'نشاط 7 ص 100: زاوية المثلث المتساوي الأضلاع', 'measure', 60, 'r'], ['a9', 'نشاط 9 ص 101: رسم الزاوية أ ب جـ = ٧٠°', 'draw', 70, 'r'],
    ['a11a', 'نشاط 11 ص 102: ١٠٠°', 'measure', 100, 'r'], ['a11b', 'نشاط 11: ١٦٣°', 'measure', 163, 'r'], ['a11c', 'نشاط 11: ٨٨°', 'measure', 88, 'r'],
    ['a12a', 'نشاط 12 ص 103: ارسم ٦٥°', 'draw', 65, 'r'], ['a12b', 'نشاط 12: ارسم ٩٠°', 'draw', 90, 'r'], ['a12c', 'نشاط 12: ارسم ١١٠°', 'draw', 110, 'r'],
    ['rv1', 'مراجعة 3 ص 108: ارسم ٧٠°', 'draw', 70, 'r'], ['rv2', 'مراجعة 3: ارسم ١٣٠°', 'draw', 130, 'r'],
    ['err', 'نشاط 10 ص 102: اكتشف الخطأ (' + G.SIMPLE + ')', 'error', 60, 'r'], ['clock', 'نشاط 6 ص 99: عقربا الساعة عند الخامسة', 'clock', 150, 'r'], ['st', 'زاوية مستقيمة ١٨٠°', 'measure', 180, 'r']
  ];
  const DRAW_ST = ['نرسم الشعاع ب أ (أحد ضلعي الزاوية) بالمسطرة', 'نضع مركز المنقلة على النقطة ب وقاعدتها على الشعاع ب أ', 'نبدأ القراءة من الصفر (من اليمين) ونضع علامة عند القياس ونسميها جـ', 'نرسم الشعاع ب جـ بالمسطرة'];
  G.reg({
    id: 'protractor', unit: U, order: 2, lesson: '5-2', lessonTitle: 'الزوايا', page: 97,
    titleAr: 'المنقلة: قياس الزوايا ورسمها وأنواعها', titleEn: 'The Protractor: Measuring & Drawing Angles', tags: 'منقله زاويه قياس درجه حاده قائمه منفرجه مستقيمه تدريج داخلي خارجي رسم ساعه تقدير خطأ',
    formula: '\\text{حادة} < 90^\\circ = \\text{قائمة} < \\text{منفرجة} < 180^\\circ = \\text{مستقيمة}',
    book: 'المنقلة أداة قياس الزوايا، شكلها نصف دائري مقسّم إلى ١٨٠ جزءاً متساوياً، ويسمّى كل جزء درجة (°)، لها تدريجان: داخلي وخارجي، ووحدة قياس الزوايا هي الدرجة',
    summary: 'المنقلة نصف دائرة مقسومة إلى ١٨٠ درجة ولها **تدريجان**: داخلي وخارجي. نضع مركزها على رأس الزاوية وقاعدتها على أحد الضلعين، ونقرأ من **التدريج الذي يبدأ بالصفر** عند ذلك الضلع. الزاوية **حادة** إذا كانت أقل من ٩٠°، و**قائمة** إذا ساوت ٩٠°، و**منفرجة** بين ٩٠° و ١٨٠°، و**مستقيمة** إذا ساوت ١٨٠°.',
    vars: [['\\angle ABC', 'الزاوية أ ب جـ ورأسها ب', ''], ['^\\circ', 'الدرجة: وحدة قياس الزوايا', 'من ٠ إلى ١٨٠ بالمنقلة']],
    ar: { A: 'أ', B: 'ب', C: 'جـ' },
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'a9', options: G.opts(PROT.map((e) => [e[0], e[1]]).concat([['custom', 'زاوية من اختياري']])) },
      { key: 'mode', label: '\\text{الوضع}', type: 'select', value: 'draw', options: [['measure', 'أقرأ القياس بالمنقلة'], ['draw', 'أرسم زاوية خطوة خطوة'], ['error', 'أكتشف خطأ القراءة'], ['clock', 'أقدّر زاوية عقربي الساعة']] },
      { key: 'ang', label: '\\text{القياس}', min: 0, max: 180, step: 1, value: 70, int: true, unit: '°', hidden: (p) => p.mode === 'clock' },
      { key: 'side', label: '\\text{الضلع الثابت}', type: 'select', value: 'r', options: [['r', 'نحو اليمين (الصفر يميناً)'], ['l', 'نحو اليسار (الصفر يساراً)']], hidden: (p) => p.mode === 'clock' || p.mode === 'draw' },
      { key: 'hr', label: '\\text{الساعة}', min: 1, max: 11, step: 1, value: 5, int: true, hidden: (p) => p.mode !== 'clock' },
      { key: 'guess', label: '\\text{تقديري}', min: 0, max: 180, step: 5, value: 120, int: true, unit: '°', hidden: (p) => p.mode !== 'clock' },
      { key: 'st', label: '\\text{خطوة الرسم}', type: 'stage', stages: DRAW_ST, value: 3, hidden: (p) => p.mode !== 'draw' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = PROT.find((x) => x[0] === p.ex); p.mode = e[2]; p.ang = e[3]; p.side = e[4]; if (e[2] === 'clock') p.hr = 5; if (e[2] === 'draw') p.st = 0; }
      else if (k === 'ang' || k === 'side' || k === 'mode' || k === 'hr') p.ex = 'custom';
      if (k === 'mode' && p.mode === 'draw') p.side = 'r';
    },
    custom: true, canvasHint: 'اسحب على المنقلة لتغيير الضلع الثاني. نقرأ دائماً من التدريج الذي يبدأ بالصفر عند الضلع الثابت (الأزرق).',
    compute(p) {
      if (p.mode === 'clock') { const raw = p.hr * 30; const a = raw > 180 ? 360 - raw : raw; return { clock: true, a: a, diff: Math.abs(p.guess - a), type: typeOf(a) }; }
      const a = p.ang; return { a: a, wrong: 180 - a, type: a === 0 ? 'صفرية' : typeOf(a) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (d.clock) {
        const R = Math.min(W, H) * 0.36, cx = W / 2, cy = H * 0.47;
        ctx.save(); ctx.strokeStyle = c.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
        for (let h = 1; h <= 12; h++) { const t = (90 - h * 30) * RAD; G.txt(ctx, h, cx + Math.cos(t) * R * 0.82, cy - Math.sin(t) * R * 0.82, { color: c.text, size: nar ? 13 : 16, w: '800' }); ctx.fillStyle = c.text; ctx.fillRect(cx + Math.cos(t) * R * 0.95 - 1.5, cy - Math.sin(t) * R * 0.95 - 1.5, 3, 3); }
        const hand = (deg, len, col, w) => { const t = (90 - deg) * RAD; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t) * len, cy - Math.sin(t) * len); ctx.stroke(); ctx.restore(); };
        hand(0, R * 0.78, c.c1, 4); hand(p.hr * 30, R * 0.55, c.c4, 6);
        const a0 = 90, a1 = 90 - p.hr * 30; const lo = p.hr * 30 > 180 ? a1 + 360 : a1; arc(ctx, cx, cy, R * 0.25, Math.min(a0, lo), Math.max(a0, lo), c.c2, 2.6);
        G.txt(ctx, 'تقديرك ' + G.L(p.guess) + '° — القياس ' + G.L(d.a) + '°', cx, H - 16, { color: d.diff <= 10 ? c.c3 : c.c2, size: nar ? 13 : 15, w: '800', halo: c.bg });
        return;
      }
      const R = Math.min(W * 0.44, H * 0.72), cx = W / 2, cy = H * 0.82;
      const base = p.mode === 'draw' || p.side === 'r' ? 0 : 180; const other = base === 0 ? p.ang : 180 - p.ang;
      const show = (k) => p.mode !== 'draw' || p.st >= k;
      // المنقلة
      if (show(1)) {
        ctx.save(); ctx.fillStyle = 'rgba(37,99,235,.06)'; ctx.strokeStyle = c.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, Math.PI, 0); ctx.stroke(); ctx.restore();
        for (let a = 0; a <= 180; a++) {
          const t = a * RAD; const big = a % 10 === 0, mid = a % 5 === 0; const l = big ? 0.1 : mid ? 0.065 : 0.035;
          ctx.strokeStyle = c.text; ctx.lineWidth = big ? 1.4 : 0.6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(t) * R, cy - Math.sin(t) * R); ctx.lineTo(cx + Math.cos(t) * R * (1 - l), cy - Math.sin(t) * R * (1 - l)); ctx.stroke();
          if (big && (!nar || a % 20 === 0)) {
            // التدريج الداخلي يبدأ بالصفر يميناً، والخارجي يبدأ بالصفر يساراً
            G.txt(ctx, a, cx + Math.cos(t) * R * 0.8, cy - Math.sin(t) * R * 0.8, { color: c.c1, size: nar ? 9 : 11, w: '700' });
            G.txt(ctx, 180 - a, cx + Math.cos(t) * R * 0.9, cy - Math.sin(t) * R * 0.9, { color: c.c4, size: nar ? 9 : 11, w: '700' });
          }
        }
        ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - R - 14, cy); ctx.lineTo(cx + R + 14, cy); ctx.stroke();
      // الضلع الثابت
      const rayEnd = (deg, len) => [cx + Math.cos(deg * RAD) * len, cy - Math.sin(deg * RAD) * len];
      const e0 = rayEnd(base, R * 1.08); G.arrow(ctx, cx, cy, e0[0], e0[1], c.c1, 3.2);
      const lbl = p.mode === 'draw' || p.ex === 'a4a' || p.ex === 'custom' ? ['أ', 'ب', 'جـ'] : p.ex === 'a4b' ? ['ف', 'ن', 'م'] : ['أ', 'ب', 'جـ'];
      G.txt(ctx, lbl[0], e0[0] + (base === 0 ? -8 : 8), e0[1] + 18, { color: c.c1, size: 16, w: '800', halo: c.bg }); G.txt(ctx, lbl[1], cx, cy + 18, { color: c.text, size: 16, w: '800', halo: c.bg });
      if (show(2)) {
        const m = rayEnd(other, R * 1.02); ctx.fillStyle = c.c3; ctx.beginPath(); ctx.arc(m[0], m[1], 5, 0, 7); ctx.fill(); G.txt(ctx, lbl[2], m[0] + Math.cos(other * RAD) * 16, m[1] - Math.sin(other * RAD) * 16 - 6, { color: c.c3, size: 16, w: '800', halo: c.bg });
        // مسار القراءة على التدريج الصحيح
        arc(ctx, cx, cy, R * (base === 0 ? 0.74 : 0.95), Math.min(base, other), Math.max(base, other), base === 0 ? c.c1 : c.c4, 3);
      }
      if (show(3)) { const e1 = rayEnd(other, R * 1.08); G.arrow(ctx, cx, cy, e1[0], e1[1], c.c3, 3.2); arc(ctx, cx, cy, R * 0.2, Math.min(base, other), Math.max(base, other), c.c2, 2.4); if (p.ang === 90) rightMark(ctx, cx, cy, 0, 16, c.c2); }
      if (p.mode === 'error') G.txt(ctx, 'قراءة خاطئة من التدريج الآخر: ' + G.L(d.wrong) + '° ✘ — الصحيح ' + G.L(p.ang) + '°', W / 2, 18, { color: c.c2, size: nar ? 12 : 14, w: '800', halo: c.bg });
      else if (show(3)) G.txt(ctx, 'القياس ' + G.L(p.ang) + '° — زاوية ' + d.type, W / 2, 18, { color: c.c3, size: nar ? 13 : 15, w: '800', halo: c.bg });
    },
    onPointer(type, x, y, p, st, api) {
      if (p.mode === 'clock') return false;
      if (type === 'up') { st.drag = false; return false; }
      if (type === 'down') st.drag = true; else if (!st.drag) return false;
      const W = api.W(), H = api.H(); const cx = W / 2, cy = H * 0.82;
      if (y > cy + 6) return false;
      const a = Math.max(0, Math.min(180, Math.round(Math.atan2(cy - y, x - cx) / RAD)));
      const ang = p.mode === 'draw' || p.side === 'r' ? a : 180 - a;
      if (ang === p.ang) return false;
      api.set('ang', ang); return true;
    },
    initState() { return {}; },
    live(p, d) {
      if (d.clock) return '\\text{بين العقربين عند الساعة } ' + p.hr + ':\\!00 = ' + d.a + '^\\circ';
      return '\\angle ABC = ' + p.ang + '^\\circ\\ \\text{(' + d.type + ')}';
    },
    results(p, d) {
      if (d.clock) return [['قياس الزاوية', G.L(d.a) + '° (كل ساعة ٣٠°)', false, 'pos'], ['تقديرك', G.L(p.guess) + '°', false], ['الفرق', G.L(d.diff) + '°', false, d.diff <= 10 ? 'pos' : 'neg'], ['نوعها', d.type, false]];
      const r = [['القياس', G.L(p.ang) + '°', false, 'pos'], ['نوع الزاوية', d.type, false, 'pos'], ['التدريج المستخدم', (p.mode === 'draw' || p.side === 'r') ? 'الداخلي (صفره يميناً)' : 'الخارجي (صفره يساراً)', false]];
      if (p.mode === 'error') r.push(['القراءة الخاطئة', G.L(d.wrong) + '° (من التدريج الآخر)', false, 'neg']);
      return r;
    },
    steps(p, d) {
      if (d.clock) return ['المسافة بين كل رقمين على الساعة ٣٠° (لأن ١٢ × ٣٠ = ٣٦٠).', 'عند الساعة ' + G.L(p.hr) + ' تماماً بين العقربين ' + G.L(Math.min(p.hr, 12 - p.hr)) + ' مسافات: ' + G.L(d.a) + '°.', 'الزاوية ' + d.type + '.'];
      if (p.mode === 'draw') return DRAW_ST.map((s, i) => (i <= p.st ? '✔ ' : '') + s + (i === 2 ? ' (' + G.L(p.ang) + '°)' : '') + '.');
      const s = ['نضع مركز المنقلة على رأس الزاوية، وقاعدتها على الضلع الثابت.', 'الضلع الثابت ' + (p.side === 'r' ? 'يمين المركز، فنقرأ من التدريج الداخلي الذي يبدأ بالصفر يميناً.' : 'يسار المركز، فنقرأ من التدريج الخارجي الذي يبدأ بالصفر يساراً.'), 'نقرأ العدد عند الضلع الثاني: ' + G.L(p.ang) + '° ، فالزاوية ' + d.type + '.'];
      if (p.mode === 'error') s.push('الخطأ: قراءة التدريج الآخر تعطي ' + G.L(d.wrong) + '° ، والمجموع دائماً ' + G.L(p.ang) + ' + ' + G.L(d.wrong) + ' = ١٨٠.');
      return s;
    },
    explain(a, b, da, db) { return da && da.type !== db.type ? ['أصبحت الزاوية ' + db.type + '.'] : []; },
    learn: [
      '**نشاط 1 ص 97:** أنواع الزوايا: قائمة، حادة، منفرجة، مستقيمة (في الساعة، ومؤشر الوقود، وزاوية النجار).',
      '**نشاط 3 ص 98:** المنقلة نصف دائري مقسّم إلى ١٨٠ جزءاً متساوياً، كل جزء درجة (°)، ولها تدريجان: داخلي وخارجي.',
      '**نشاط 4 ص 98:** قياس الزاوية أ ب جـ = ٩٠° ؛ والزاوية م ن ف ضلعها الثابت ن ف نحو اليسار، فنقرأ من التدريج الذي يبدأ بالصفر عند ف.',
      '**نشاط 8 ص 100:** إذا كانت ف ب أ = ٣٠° و ل ب ف = ٩٠° على خط مستقيم فإن ل ب جـ = ١٨٠ − ٩٠ − ٣٠ = ٦٠° ؛ وإذا كانت و ص س = ٢٠° من زاوية قائمة فإن و ص ع = ٧٠°.',
      '**نشاط 9 ص 101:** رسم الزاوية أ ب جـ = ٧٠° في ثلاث خطوات: الشعاع ب أ ، ثم المنقلة والعلامة جـ ، ثم الشعاع ب جـ.',
      '**نشاط 11 ص 102:** ١٠٠° منفرجة، ١٦٣° منفرجة، ٨٨° حادة.',
      '**أفكر ص 99:** قياس الزاوية لا يختلف باختلاف حجم المنقلة، لأن الدرجة تقيس الانفراج لا طول الضلعين.'
    ],
    challenges: [
      { q: 'ارسم زاوية قياسها ٦٥° ثم سمِّ نوعها (نشاط 12).', hint: 'اسحب الضلع الثاني إلى ٦٥ على التدريج الداخلي.', init: { ex: 'custom', mode: 'draw', ang: 30, st: 3 }, check: (p) => p.ang === 65, why: () => '٦٥° زاوية حادة.' },
      { q: 'كوّن زاوية منفرجة قياسها ١١٠°.', hint: 'أكبر من ٩٠ وأصغر من ١٨٠.', init: { ex: 'custom', mode: 'measure', ang: 45, side: 'r' }, check: (p) => p.ang === 110 && p.mode !== 'clock' },
      { q: 'ما قياس الزاوية بين عقربي الساعة عند الخامسة؟ ضع تقديرك (نشاط 6).', hint: 'كل مسافة بين رقمين ٣٠°.', init: { ex: 'custom', mode: 'clock', hr: 5, guess: 90 }, check: (p) => p.mode === 'clock' && p.hr === 5 && p.guess === 150 },
      { q: 'اجعل الضلع الثابت نحو اليسار وكوّن زاوية قائمة.', hint: 'اختر «نحو اليسار».', init: { ex: 'custom', mode: 'measure', ang: 40, side: 'r' }, check: (p) => p.mode === 'measure' && p.side === 'l' && p.ang === 90 }
    ],
    tutor: [
      { q: 'من أي تدريج أقرأ؟', k: ['تدريج', 'اقرا'], a: () => 'من التدريج الذي يبدأ بالصفر عند الضلع الذي وضعنا عليه قاعدة المنقلة.' },
      { q: 'ما نوع الزاوية الحالية؟', k: ['نوع', 'الحاليه'], a: (p, d) => 'قياسها ' + G.L(d.a) + '° فهي ' + d.type + '.' },
      { q: 'هل يختلف القياس إذا كبرت المنقلة؟', k: ['حجم', 'كبرت', 'يختلف'], a: () => 'لا، فالقياس بالدرجات يعتمد على انفراج الضلعين وليس على طولهما أو حجم المنقلة.' }
    ]
  });

  /* ======================= الدرس الثالث: زوايا المثلث (ص 104–107) ======================= */
  const TRI = [
    ['s1', 'نشاط 3 ص 105: ٧٥° و ٢٥° و ٨٠°', 'sum', [75, 25, 80]], ['s2', 'نشاط 3: ٩٠° و ٢٠° و ٧٠°', 'sum', [90, 20, 70]], ['s3', 'نشاط 3: ٤٠° و ١٠٠° و ٤٠°', 'sum', [40, 100, 40]],
    ['f1', 'نشاط 6 ص 106: ع ، والزاويتان ٧٠° و ٥٠°', 'find', [70, 50, 0]], ['f2', 'نشاط 6: ف ، والزاويتان ٩٠° و ٤٨°', 'find', [90, 48, 0]], ['lu', 'مراجعة 2 ص 108: لؤي ٦٠° و ٨٠°', 'find', [60, 80, 0]],
    ['c1', 'نشاط 5 ص 105: ٥٠° ، ٨٠° ، ٧٠°', 'check', [50, 80, 70]], ['c2', 'نشاط 5: ٩١° ، ٥٠° ، ٣٩°', 'check', [91, 50, 39]], ['c3', 'نشاط 5: ٦٠° ، ٤٠° ، ٧٠°', 'check', [60, 40, 70]], ['c4', 'نشاط 5: ٤٥° ، ٤٥° ، ٩٠°', 'check', [45, 45, 90]],
    ['mu', 'نشاط 7 ص 106: قياسات مصطفى ٨٠° ، ٣٩° ، ٦٠°', 'check', [80, 39, 60]], ['eq', 'نشاط 7 ص 100: المثلث المتساوي الأضلاع', 'sum', [60, 60, 60]]
  ];
  const triType = (a, b, c) => (Math.max(a, b, c) === 90 ? 'قائم الزاوية' : Math.max(a, b, c) > 90 ? 'منفرج الزاوية' : 'حاد الزوايا');
  G.reg({
    id: 'triangle-angles', unit: U, order: 3, lesson: '5-3', lessonTitle: 'زوايا المثلث', page: 104,
    titleAr: 'مجموع زوايا المثلث وأنواع المثلثات', titleEn: 'Angle Sum of a Triangle', tags: 'مثلث زوايا مجموع ١٨٠ قص زوايا حاد قائم منفرج زاويه ثالثه مصطفى لؤي يمكن لا يمكن',
    formula: '\\angle A + \\angle B + \\angle C = 180^\\circ',
    book: 'مجموع زوايا المثلث = ١٨٠° ؛ وإذا عُلم قياس زاويتين نجد الثالثة بطرح مجموعهما من ١٨٠°',
    summary: 'إذا قصصنا زوايا المثلث الثلاث وجمعناها متجاورة على خط مستقيم كوّنت معاً **زاوية مستقيمة** قياسها ١٨٠°. إذن **مجموع زوايا المثلث = ١٨٠°**، ونجد الزاوية الثالثة بطرح مجموع الزاويتين المعلومتين من ١٨٠°. ويكون المثلث حاد الزوايا أو قائم الزاوية أو منفرج الزاوية حسب أكبر زواياه.',
    vars: [['\\angle A, \\angle B', 'زاويتا القاعدة', 'بالدرجات'], ['\\angle C', 'الزاوية الثالثة', '$180^\\circ - (\\angle A + \\angle B)$']],
    ar: { A: 'أ', B: 'ب', C: 'جـ' },
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 's1', options: G.opts(TRI.map((e) => [e[0], e[1]]).concat([['custom', 'مثلث من اختياري']])) },
      { key: 'mode', label: '\\text{المطلوب}', type: 'select', value: 'sum', options: [['sum', 'أجد مجموع الزوايا (قص الزوايا)'], ['find', 'أجد الزاوية الثالثة'], ['check', 'هل يمكن رسم مثلث بهذه القياسات؟']] },
      { key: 'A', label: '\\angle A', min: 5, max: 170, step: 1, value: 75, int: true, unit: '°' },
      { key: 'B', label: '\\angle B', min: 5, max: 170, step: 1, value: 25, int: true, unit: '°' },
      { key: 'C', label: '\\angle C', min: 5, max: 170, step: 1, value: 80, int: true, unit: '°', hidden: (p) => p.mode !== 'check' },
      { key: 'tear', label: '\\text{القص}', type: 'toggle', value: true, on: 'أجمّع الزوايا المقصوصة على خط مستقيم', off: 'المثلث فقط' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = TRI.find((x) => x[0] === p.ex); p.mode = e[2]; p.A = e[3][0]; p.B = e[3][1]; if (e[3][2]) p.C = e[3][2]; }
      else if (k !== 'ex' && k !== 'tear') p.ex = 'custom';
    },
    custom: true, canvasHint: 'الألوان الثلاثة هي زوايا المثلث. عند تجميعها متجاورة على الخط المستقيم تكوّن زاوية مستقيمة ١٨٠°.',
    compute(p) {
      const sum2 = p.A + p.B; const can = sum2 < 180;
      const C = p.mode === 'check' ? p.C : 180 - sum2; const total = p.A + p.B + C; const ok = p.mode === 'check' ? total === 180 : can;
      return { A: p.A, B: p.B, C: C, total: total, ok: ok, can: can, type: ok ? triType(p.A, p.B, C) : '—' };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const cols = [c.c1, c.c4, c.c3];
      const triH = p.tear ? H * 0.6 : H * 0.9;
      // نرسم المثلث بزاويتي القاعدة أ (يمين) و ب (يسار) كما في رسوم الكتاب
      const baseL = Math.min(W * 0.62, 420); let bx0 = W / 2 - baseL / 2, bx1 = W / 2 + baseL / 2; const by = triH - 24;
      if (d.can) {
        const tA = Math.tan(p.A * RAD), tB = Math.tan(p.B * RAD);
        // الرأس: تقاطع الشعاع من اليمين بزاوية أ والشعاع من اليسار بزاوية ب
        let x = (bx1 * tA + bx0 * tB) / (tA + tB); if (p.A === 90) x = bx1; if (p.B === 90) x = bx0;
        let hgt = p.A === 90 ? (bx1 - bx0) * tB : (bx1 - x) * tA; if (p.A > 90 && p.A !== 90) hgt = (x - bx0) * tB;
        let sc = Math.min(1, (by - 26) / Math.max(hgt, 1)); const minX = Math.min(x, bx0), maxX = Math.max(x, bx1); sc = Math.min(sc, (W - 30) / (maxX - minX));
        const cxm = (minX + maxX) / 2; const T = (px, py) => [W / 2 + (px - cxm) * sc, by - (by - py) * sc];
        const R = T(bx1, by), Lp = T(bx0, by), V = T(x, by - hgt);
        ctx.save(); ctx.fillStyle = 'rgba(37,99,235,.05)'; ctx.strokeStyle = c.text; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(R[0], R[1]); ctx.lineTo(Lp[0], Lp[1]); ctx.lineTo(V[0], V[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
        const ang = (P, Q) => Math.atan2(-(Q[1] - P[1]), Q[0] - P[0]) / RAD;
        const wedge = (P, Q1, Q2, col, label, deg) => { let a0 = ang(P, Q1), a1 = ang(P, Q2); if (((a1 - a0) % 360 + 360) % 360 > 180) { const t = a0; a0 = a1; a1 = t; } if (a1 < a0) a1 += 360; const r = Math.min(34, baseL * sc * 0.12); ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.arc(P[0], P[1], r, -a0 * RAD, -a1 * RAD, true); ctx.closePath(); ctx.fill(); ctx.restore(); const m = (a0 + a1) / 2 * RAD; G.txt(ctx, (deg === null ? '؟' : G.L(deg) + '°'), P[0] + Math.cos(m) * (r + 16), P[1] - Math.sin(m) * (r + 16), { color: col, size: nar ? 12 : 14, w: '800', halo: c.bg }); G.txt(ctx, label, P[0] + Math.cos(m + Math.PI) * 14, P[1] - Math.sin(m + Math.PI) * 14, { color: c.text, size: 14, w: '800', halo: c.bg }); };
        wedge(R, Lp, V, cols[0], 'أ', d.A); wedge(Lp, V, R, cols[1], 'ب', d.B); wedge(V, R, Lp, cols[2], 'جـ', p.mode === 'find' ? null : p.mode === 'check' ? p.C : d.C);
        if (p.mode === 'find') G.txt(ctx, 'جـ = ١٨٠ − (' + G.L(d.A) + ' + ' + G.L(d.B) + ') = ' + G.L(d.C) + '°', W / 2, 16, { color: c.c3, size: nar ? 13 : 15, w: '800', halo: c.bg });
      } else G.txt(ctx, 'مجموع الزاويتين ' + G.L(d.A + d.B) + '° ليس أقل من ١٨٠° ؛ الضلعان لا يلتقيان', W / 2, triH / 2, { color: c.c2, size: nar ? 13 : 15, w: '800' });
      if (!p.tear) return;
      // تجميع الزوايا المقصوصة على خط مستقيم
      const ly = H - 20, lx = W / 2, r = Math.min(H * 0.3, W * 0.3); const angs = [d.A, d.B, p.mode === 'check' ? p.C : Math.max(0, d.C)];
      ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx - r - 30, ly); ctx.lineTo(lx + r + 30, ly); ctx.stroke();
      let a0 = 0; angs.forEach((a, i) => { ctx.save(); ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.arc(lx, ly, r, -a0 * RAD, -(a0 + a) * RAD, true); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = c.text; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); const m = (a0 + a / 2) * RAD; if (a >= 12) G.txt(ctx, G.L(a) + '°', lx + Math.cos(m) * r * 0.62, ly - Math.sin(m) * r * 0.62, { color: '#fff', size: nar ? 11 : 13, w: '800' }); a0 += a; });
      const msg = d.total === 180 ? 'الزوايا معاً زاوية مستقيمة ١٨٠° ✔' : 'المجموع ' + G.L(d.total) + '° ≠ ١٨٠° ✘';
      G.txt(ctx, msg, W / 2, ly - r - 14, { color: d.total === 180 ? c.c3 : c.c2, size: nar ? 12 : 14, w: '800', halo: c.bg });
    },
    live(p, d) {
      if (p.mode === 'check') return d.A + '^\\circ + ' + d.B + '^\\circ + ' + d.C + '^\\circ = ' + d.total + '^\\circ ' + (d.ok ? '= 180^\\circ' : '\\ne 180^\\circ');
      if (!d.can) return '\\angle A + \\angle B \\ge 180^\\circ';
      return '\\angle C = 180^\\circ - (' + d.A + '^\\circ + ' + d.B + '^\\circ) = ' + d.C + '^\\circ';
    },
    results(p, d) {
      if (p.mode === 'check') return [['المجموع', G.L(d.total) + '°', false, d.ok ? 'pos' : 'neg'], ['هل يمكن رسم المثلث؟', d.ok ? 'يمكن ✔' : 'لا يمكن ✘ (المجموع لا يساوي ١٨٠°)', false, d.ok ? 'pos' : 'neg'], ['نوع المثلث', d.type, false]];
      if (!d.can) return [['الزاوية الثالثة', 'لا يوجد مثلث', false, 'neg'], ['مجموع الزاويتين', G.L(d.A + d.B) + '°', false]];
      return [['الزاوية الثالثة جـ', G.L(d.C) + '°', false, 'pos'], ['مجموع الزوايا', G.L(d.total) + '°', false], ['نوع المثلث', d.type, false, 'pos']];
    },
    steps(p, d) {
      if (p.mode === 'check') return ['نجمع القياسات: ' + G.L(d.A) + ' + ' + G.L(d.B) + ' + ' + G.L(d.C) + ' = ' + G.L(d.total) + '.', d.ok ? 'المجموع ١٨٠° ، فيمكن رسم مثلث بهذه القياسات، وهو ' + d.type + '.' : 'المجموع ليس ١٨٠° ، فلا يمكن رسم مثلث بهذه القياسات' + (p.ex === 'mu' ? '؛ إذن قياسات مصطفى غير صحيحة.' : '.')];
      if (!d.can) return ['مجموع الزاويتين ' + G.L(d.A + d.B) + '° ، ومجموع زوايا المثلث ١٨٠° ، فلا يبقى شيء للزاوية الثالثة.'];
      return ['مجموع زوايا المثلث = ١٨٠°.', 'مجموع الزاويتين المعلومتين: ' + G.L(d.A) + ' + ' + G.L(d.B) + ' = ' + G.L(d.A + d.B) + '°.', 'الزاوية الثالثة = ١٨٠ − ' + G.L(d.A + d.B) + ' = ' + G.L(d.C) + '°.', 'أكبر زاوية ' + G.L(Math.max(d.A, d.B, d.C)) + '° ، فالمثلث ' + d.type + '.'];
    },
    explain(a, b, da, db) { return da && da.type !== db.type && db.type !== '—' ? ['أصبح المثلث ' + db.type + '.'] : []; },
    learn: [
      '**نشاط 1 ص 104:** نوع المثلث حسب زواياه: حاد الزوايا، قائم الزاوية، منفرج الزاوية.',
      '**نشاط 2 ص 104:** المستطيل ٤ أضلاع و ٤ زوايا، والمثلث ٣ أضلاع و ٣ زوايا، والمربع ٤ أضلاع و ٤ زوايا.',
      '**نشاط 3 ص 105:** مجموع ٧٥ + ٢٥ + ٨٠ = ١٨٠ ، و ٩٠ + ٢٠ + ٧٠ = ١٨٠ ، و ٤٠ + ١٠٠ + ٤٠ = ١٨٠.',
      '**نشاط 4 ص 105 (نشاط عملي):** نقص زوايا المثلث ونجمعها متجاورة على خط مستقيم فتكوّن زاوية مستقيمة = ١٨٠° ؛ أستنتج: مجموع زوايا المثلث = ١٨٠°.',
      '**نشاط 5 ص 105:** يمكن: (٩١ ، ٥٠ ، ٣٩) و (٤٥ ، ٤٥ ، ٩٠) لأن مجموع كل منهما ١٨٠ ؛ لا يمكن: (٥٠ ، ٨٠ ، ٧٠) مجموعها ٢٠٠ ، و (٦٠ ، ٤٠ ، ٧٠) مجموعها ١٧٠.',
      '**نشاط 6 ص 106:** ع = ٦٠° ، ف = ٤٢° ؛ والزاوية س المجاورة لزاوية خارجية ١٢٠° على خط مستقيم قياسها ٦٠°.',
      '**نشاط 7 ص 106:** قياسات مصطفى ٨٠ + ٣٩ + ٦٠ = ١٧٩ ، فهي غير صحيحة.',
      '**مراجعة 2 ص 108:** زاويتان ٦٠° و ٨٠° ، فالثالثة ٤٠° والمثلث حاد الزوايا.'
    ],
    challenges: [
      { q: 'جد الزاوية الثالثة في مثلث فيه زاويتان ٩٠° و ٤٨° (نشاط 6).', hint: 'اختر «أجد الزاوية الثالثة».', init: { ex: 'custom', mode: 'sum', A: 60, B: 60 }, check: (p, d) => p.mode === 'find' && ((p.A === 90 && p.B === 48) || (p.A === 48 && p.B === 90)), why: () => '١٨٠ − ١٣٨ = ٤٢°.' },
      { q: 'كوّن مثلثاً منفرج الزاوية.', hint: 'اجعل إحدى الزاويتين أكبر من ٩٠°.', init: { ex: 'custom', mode: 'sum', A: 60, B: 60 }, check: (p, d) => d.ok && d.type === 'منفرج الزاوية' },
      { q: 'هل قياسات مصطفى ٨٠° و ٣٩° و ٦٠° صحيحة؟ اختبرها (نشاط 7).', hint: 'اختر «هل يمكن رسم مثلث؟».', init: { ex: 'custom', mode: 'sum', A: 50, B: 50, C: 50 }, check: (p) => p.mode === 'check' && [p.A, p.B, p.C].sort().join() === [80, 39, 60].sort().join(), why: () => 'المجموع ١٧٩° ، فهي غير صحيحة.' },
      { q: 'كوّن مثلثاً قائم الزاوية متساوي زاويتي القاعدة.', hint: 'نشاط 5: ٤٥° و ٤٥° و ٩٠°.', init: { ex: 'custom', mode: 'sum', A: 30, B: 60 }, check: (p, d) => p.mode !== 'check' && p.A === 45 && p.B === 45 }
    ],
    tutor: [
      { q: 'لماذا مجموع زوايا المثلث ١٨٠°؟', k: ['لماذا', '١٨٠', '180'], a: () => 'لأننا إذا قصصنا الزوايا الثلاث وجمعناها متجاورة كوّنت خطاً مستقيماً، والزاوية المستقيمة ١٨٠°.' },
      { q: 'هل يمكن أن يكون في المثلث زاويتان قائمتان؟', k: ['قائمتان', 'زاويتان'], a: () => 'لا، لأن مجموعهما ١٨٠° ولا يبقى شيء للزاوية الثالثة.' },
      { q: 'ما نوع المثلث الحالي؟', k: ['نوع', 'الحالي'], a: (p, d) => (d.type === '—' ? 'لا يوجد مثلث بهذه القياسات.' : 'المثلث ' + d.type + '.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
