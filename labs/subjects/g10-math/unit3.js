/* الوحدة الثالثة: الهندسة — الدائرة (ص 79–98) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const F = ML.fx;
  const U = 3; const PI = Math.PI;
  const deg = (x) => M.fmt(x, 2) + '^{\\circ}';
  // الزاوية عند V بين VA و VB (0..180)
  function angAt(V, A, B) {
    const ux = A[0] - V[0], uy = A[1] - V[1], vx = B[0] - V[0], vy = B[1] - V[1];
    const n = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    if (n < 1e-12) return NaN;
    return M.rad2deg(Math.acos(M.clamp((ux * vx + uy * vy) / n, -1, 1)));
  }
  ML.angAt = angAt;
  const onC = (r, a) => [r * Math.cos(M.deg2rad(a)), r * Math.sin(M.deg2rad(a))];
  const snapAng = (x, y) => Math.round(M.normDeg(M.rad2deg(Math.atan2(y, x))));

  /* ======================= 3-1 معادلة الدائرة ======================= */
  ML.register({
    id: 'circle-eq', ar: { h: 'هـ' }, unit: U, order: 1, lesson: '3-1', lessonTitle: 'الدائرة', page: 81,
    titleAr: 'معادلة الدائرة', titleEn: 'Equation of a Circle', tags: 'دائره مركز نصف قطر معادله قياسيه عامه',
    formula: '(x - d)^2 + (y - h)^2 = r^2 \\iff x^2 + y^2 + 2Lx + 2Ky + C = 0',
    book: '(س − د)² + (ص − هـ)² = نق² ؛ الصورة القياسية: س² + ص² + 2ل س + 2ك ص + جـ = 0 ، المركز (−ل ، −ك) ، نق = √(ل² + ك² − جـ)',
    summary: 'الدائرة مجموعة النقاط التي تبعد مسافة ثابتة $r$ عن نقطة ثابتة (المركز). من قانون المسافة بين نقطتين نحصل على معادلتها. المعادلة $x^2 + y^2 + 2Lx + 2Ky + C = 0$ تمثل دائرة فقط إذا كان $L^2 + K^2 - C > 0$.',
    vars: [['(d, h)', 'مركز الدائرة', '$\\mathbb{R}^2$'], ['r', 'نصف القطر', '$r > 0$'], ['L, K, C', 'معاملات الصورة العامة', 'دائرة حقيقية إذا $L^2 + K^2 - C > 0$'], ['P(x_0, y_0)', 'نقطة للاختبار (داخل/على/خارج)', '$\\mathbb{R}^2$']],
    params: [
      { key: 'mode', label: '\\text{form}', type: 'select', value: 'std', options: [['std', 'أعطني المركز ونصف القطر'], ['gen', 'أعطني L و K و C (الصورة العامة)']] },
      { key: 'd', label: 'd', min: -8, max: 8, step: 0.5, value: 2, hidden: (p) => p.mode !== 'std' },
      { key: 'h', label: 'h', min: -8, max: 8, step: 0.5, value: 1, hidden: (p) => p.mode !== 'std' },
      { key: 'r', label: 'r', min: 0.5, max: 8, step: 0.5, value: 3, hidden: (p) => p.mode !== 'std' },
      { key: 'L', label: 'L', min: -8, max: 8, step: 0.5, value: -3, hidden: (p) => p.mode !== 'gen' },
      { key: 'K', label: 'K', min: -8, max: 8, step: 0.5, value: 0, hidden: (p) => p.mode !== 'gen' },
      { key: 'C', label: 'C', min: -40, max: 40, step: 1, value: -16, hidden: (p) => p.mode !== 'gen' },
      { key: 'px', label: 'x_0', min: -10, max: 10, step: 0.5, value: 5 },
      { key: 'py', label: 'y_0', min: -10, max: 10, step: 0.5, value: 5 }
    ],
    plot: { view: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 } },
    compute(p) {
      let cx, cy, r2, L, K, C;
      if (p.mode === 'std') { cx = p.d; cy = p.h; r2 = p.r * p.r; const g = M.circleToGeneral(p.d, p.h, p.r); L = g.L; K = g.K; C = g.C; }
      else { L = p.L; K = p.K; C = p.C; const g = M.circleFromGeneral(L, K, C); cx = g.center.x; cy = g.center.y; r2 = g.r2; }
      const valid = r2 > 1e-12, r = valid ? Math.sqrt(r2) : NaN;
      const dist = Math.hypot(p.px - cx, p.py - cy);
      const pos = !valid ? null : (Math.abs(dist - r) < 1e-9 ? 'on' : dist < r ? 'in' : 'out');
      return { cx: cx, cy: cy, r2: r2, r: r, valid: valid, point: Math.abs(r2) <= 1e-12, L: L, K: K, C: C, dist: dist, pos: pos };
    },
    draw(P, p, d) {
      const c = P.colors();
      if (d.valid) {
        P.circle(d.cx, d.cy, d.r, { color: c.c1, width: 3, fill: c.c1, fillAlpha: 0.06 });
        P.segment(d.cx, d.cy, d.cx + d.r * Math.cos(PI / 4), d.cy + d.r * Math.sin(PI / 4), { color: c.c4, width: 2.5 });
        P.text(d.cx + d.r * Math.cos(PI / 4) / 2, d.cy + d.r * Math.sin(PI / 4) / 2, 'r = ' + M.fmt(d.r, 3), { color: c.c4, dx: -6, dy: -10, align: 'right' });
        P.point(d.cx + d.r * Math.cos(PI / 4), d.cy + d.r * Math.sin(PI / 4), { color: c.c4, r: 5 });
      }
      P.point(d.cx, d.cy, { color: c.c2, label: 'م(' + M.fmt(d.cx) + ', ' + M.fmt(d.cy) + ')' });
      if (!d.valid) P.text(d.cx, d.cy, d.point ? 'نقطة وليست دائرة (نق = 0)' : 'لا تمثل دائرة: نق² < 0', { color: c.c2, dy: 22, align: 'center', bold: true, rtl: true });
      P.segment(d.cx, d.cy, p.px, p.py, { color: c.c5, dash: [4, 4], width: 1.5 });
      P.point(p.px, p.py, { color: c.c5, label: 'P (' + (d.pos === 'in' ? 'داخل' : d.pos === 'on' ? 'على الدائرة' : d.pos === 'out' ? 'خارج' : '—') + ')' });
    },
    handles(p, d, set) {
      const hs = [{ x: p.px, y: p.py, onDrag: (x, y) => { set('px', M.clamp(Math.round(x * 2) / 2, -10, 10)); set('py', M.clamp(Math.round(y * 2) / 2, -10, 10)); } }];
      if (p.mode === 'std') {
        hs.push({ x: p.d, y: p.h, onDrag: (x, y) => { set('d', M.clamp(Math.round(x * 2) / 2, -8, 8)); set('h', M.clamp(Math.round(y * 2) / 2, -8, 8)); } });
        hs.push({ x: p.d + p.r * Math.cos(PI / 4), y: p.h + p.r * Math.sin(PI / 4), onDrag: (x, y) => set('r', M.clamp(Math.round(Math.hypot(x - p.d, y - p.h) * 2) / 2, 0.5, 8)) });
      }
      return hs;
    },
    live(p, d) {
      if (!d.valid) {
        const t = (v, s) => { const x = M.round(v, 4); return x === 0 ? '' : (x > 0 ? ' + ' : ' - ') + (Math.abs(x) === 1 ? '' : M.fmt(Math.abs(x))) + s; };
        return 'x^2 + y^2' + t(2 * d.L, 'x') + t(2 * d.K, 'y') + F.plus(d.C) + ' = 0\\ \\Rightarrow\\ r^2 = ' + M.fmt(d.r2) + (d.point ? ' = 0' : ' < 0');
      }
      return '(' + F.shift('x', -d.cx) + ')^2 + (' + F.shift('y', -d.cy) + ')^2 = ' + M.fmt(d.r2);
    },
    results(p, d) {
      const gen = 'x^2 + y^2' + termTeX(2 * d.L, 'x') + termTeX(2 * d.K, 'y') + F.plus(d.C) + ' = 0';
      const r = [
        ['الصورة العامة', gen],
        ['المركز', '(-L,\\ -K) = ' + F.pt(d.cx, d.cy)],
        ['r^2 = L^2 + K^2 - C', M.fmt(d.L * d.L) + ' + ' + M.fmt(d.K * d.K) + ' - (' + M.fmt(d.C) + ') = ' + M.tex(d.r2), true, d.valid ? '' : 'neg']
      ];
      if (d.valid) r.push(['نصف القطر', 'r = ' + F.sqrtTeX(M.round(d.r2, 6)) + (M.isInt(d.r) ? '' : ' \\approx ' + M.tex(d.r))]);
      else r.push(['الحكم', d.point ? 'المعادلة تمثل نقطة واحدة (المركز) لا دائرة' : 'لا تمثل دائرة: لا يوجد عدد حقيقي مربعه سالب', false, 'neg']);
      r.push(['بعد P عن المركز', '\\sqrt{(' + M.fmt(p.px) + ' - ' + M.fmt(d.cx) + ')^2 + (' + M.fmt(p.py) + ' - ' + M.fmt(d.cy) + ')^2} = ' + M.tex(d.dist)]);
      if (d.valid) r.push(['موقع P', d.pos === 'on' ? 'على الدائرة (البعد = r)' : d.pos === 'in' ? 'داخل الدائرة (البعد < r)' : 'خارج الدائرة (البعد > r)', false]);
      return r;
      function termTeX(v, s) { const x = M.round(v, 4); if (x === 0) return ''; return (x > 0 ? ' + ' : ' - ') + (Math.abs(x) === 1 ? '' : M.fmt(Math.abs(x))) + s; }
    },
    steps(p, d) {
      const s = [];
      if (p.mode === 'std') {
        s.push('من قانون المسافة: $\\sqrt{(x - ' + M.fmt(p.d) + ')^2 + (y - ' + M.fmt(p.h) + ')^2} = ' + M.fmt(p.r) + '$');
        s.push('بتربيع الطرفين: $(' + F.shift('x', -p.d) + ')^2 + (' + F.shift('y', -p.h) + ')^2 = ' + M.fmt(p.r * p.r) + '$');
        s.push('بفك الأقواس: $x^2 - ' + M.fmt(2 * p.d) + 'x + ' + M.fmt(p.d * p.d) + ' + y^2 - ' + M.fmt(2 * p.h) + 'y + ' + M.fmt(p.h * p.h) + ' = ' + M.fmt(p.r * p.r) + '$ ← $L = ' + M.fmt(d.L) + ',\\ K = ' + M.fmt(d.K) + ',\\ C = ' + M.fmt(d.C) + '$');
      } else {
        s.push('المركز $(-L, -K) = ' + F.pt(d.cx, d.cy) + '$');
        s.push('$r^2 = L^2 + K^2 - C = ' + M.tex(d.r2) + '$ ' + (d.valid ? '> 0 ← دائرة حقيقية.' : '\\le 0 ← ليست دائرة.'));
      }
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (da && da.valid !== db.valid) o.push(db.valid ? 'صار $L^2 + K^2 - C > 0$ فظهرت دائرة حقيقية نصف قطرها $\\sqrt{' + M.fmt(db.r2) + '}$.' : 'صار $L^2 + K^2 - C = ' + M.fmt(db.r2) + ' \\le 0$: لا يوجد نصف قطر حقيقي، فالمعادلة لا تمثل دائرة.');
      if (da && da.pos !== db.pos && db.pos) o.push('النقطة P صارت ' + (db.pos === 'on' ? 'على الدائرة لأن بعدها عن المركز يساوي $r$ بالضبط.' : db.pos === 'in' ? 'داخل الدائرة لأن بعدها أقل من $r$.' : 'خارج الدائرة لأن بعدها أكبر من $r$.'));
      if (a.r !== b.r) o.push('تغيّر نصف القطر فتغيّر الطرف الأيمن $r^2 = ' + M.fmt(b.r * b.r) + '$ وتغيّر $C = d^2 + h^2 - r^2$.');
      if (a.d !== b.d || a.h !== b.h) o.push('تحرك المركز إلى $' + F.pt(b.d, b.h) + '$: لاحظ أن الإشارات داخل الأقواس عكس إحداثيات المركز.');
      return o;
    },
    learn: [
      '**نشاط 2 ص 82:** الدائرة التي مركزها $(0,0)$ ونصف قطرها $r$: من قانون المسافة $\\sqrt{x^2 + y^2} = r$، فمعادلتها $x^2 + y^2 = r^2$. مثال (1): $r = 4$ ← $x^2 + y^2 = 16$.',
      '**ص 83:** الدائرة التي مركزها $(d, h)$ ونصف قطرها $r$: $(x - d)^2 + (y - h)^2 = r^2$. مثال (2): المركز $(2, 1)$ و $r = 3$ ← $(x - 2)^2 + (y - 1)^2 = 9$، وبفك الأقواس: $x^2 - 4x + y^2 - 2y = 4$.',
      '**الصورة القياسية (ص 84):** $x^2 + y^2 + 2Lx + 2Ky + C = 0$، المركز $(-L, -K)$ ونصف القطر $r = \\sqrt{L^2 + K^2 - C}$ حيث $L^2 + K^2 - C > 0$. لاحظ: معاملا $x^2$ و $y^2$ متساويان، ولا يوجد حد $xy$.',
      '**نشاط 5 ص 84 (البيدر):** $2x^2 + 2y^2 - 12x = 32$ ← نقسم على 2: $x^2 + y^2 - 6x - 16 = 0$ ← $L = -3, K = 0, C = -16$ ← المركز $(3, 0)$، $r = \\sqrt{9 + 16} = 5$.'
    ],
    challenges: [
      { q: 'مثّل دائرة البيدر $x^2 + y^2 - 6x - 16 = 0$ (نشاط 5 ص 84) بالصورة العامة.', hint: '$2L = -6$.', init: { mode: 'gen', L: 0, K: 0, C: 0 }, check: (p) => p.mode === 'gen' && p.L === -3 && p.K === 0 && p.C === -16, why: () => 'المركز $(3, 0)$ ونصف القطر $5$.' },
      { q: 'الدائرة التي مركزها $(-3, 2)$ وقطرها 6 سم (تمرين 1 ب ص 85).', hint: 'نصف القطر = نصف القطر الكامل.', init: { mode: 'std', d: 0, h: 0, r: 1 }, check: (p) => p.mode === 'std' && p.d === -3 && p.h === 2 && p.r === 3 },
      { q: 'دائرة الملعب: مركزها $(4, -2)$ ونصف قطرها 6 م (تمرين 5 ص 85). ثم ضع P على الدائرة.', hint: 'جرّب P = (10, -2).', init: { mode: 'std', d: 0, h: 0, r: 1, px: 0, py: 0 }, check: (p, d) => p.mode === 'std' && p.d === 4 && p.h === -2 && p.r === 6 && d.pos === 'on' },
      { q: 'اختر $L, K, C$ بحيث لا تمثل المعادلة دائرة (مثل $x^2 + y^2 + 5 = 0$).', hint: 'اجعل $C > L^2 + K^2$.', init: { mode: 'gen', L: 1, K: 1, C: 0 }, check: (p, d) => p.mode === 'gen' && !d.valid }
    ],
    tutor: [
      { q: 'لماذا لا تمثل المعادلة دائرة؟', k: ['لا تمثل', 'ليست دائره', 'سالب'], a: (p, d) => d.valid ? 'المعادلة الحالية تمثل دائرة لأن $r^2 = ' + M.tex(d.r2) + ' > 0$.' : 'لأن $r^2 = L^2 + K^2 - C = ' + M.tex(d.r2) + '$ ' + (d.point ? '= 0 فالنقطة الوحيدة المحققة هي المركز.' : '< 0، ولا يوجد عدد حقيقي مربعه سالب، فلا توجد نقاط تحقق المعادلة.') },
      { q: 'كيف أجد المركز من الصورة العامة؟', k: ['المركز', 'الصوره العامه', 'كيف'], a: (p, d) => 'المركز $(-L, -K)$، أي نصف معامل $x$ ونصف معامل $y$ بإشارة معاكسة: الآن $' + F.pt(d.cx, d.cy) + '$.' },
      { q: 'هل النقطة P على الدائرة؟', k: ['النقطه', 'p', 'على الدائره', 'داخل', 'خارج'], a: (p, d) => 'بعد P عن المركز $= ' + M.tex(d.dist) + '$ و $r = ' + M.tex(d.r) + '$، إذن P ' + (d.pos === 'on' ? 'على الدائرة.' : d.pos === 'in' ? 'داخل الدائرة.' : d.pos === 'out' ? 'خارج الدائرة.' : '— لا توجد دائرة.') }
    ]
  });

  /* ======================= 3-2 الزوايا المركزية والمحيطية ======================= */
  const R0 = 4;
  ML.register({
    id: 'inscribed-angles', unit: U, order: 2, lesson: '3-2', lessonTitle: 'الزوايا المركزية والزوايا المحيطية', page: 86,
    titleAr: 'الزوايا المركزية والمحيطية والمماسية', titleEn: 'Central, Inscribed & Tangent–Chord Angles', tags: 'زاويه مركزيه محيطيه مماسيه مماس وتر قوس',
    formula: '\\angle AOB = 2\\,\\angle ACB,\\qquad \\angle(\\text{tangent}, AB) = \\angle ACB',
    book: 'قياس الزاوية المركزية = ضعفي قياس الزاوية المحيطية المشتركة معها في القوس نفسه',
    summary: 'الزاوية المركزية رأسها مركز الدائرة وضلعاها نصفا قطرين، والمحيطية رأسها على الدائرة وضلعاها وتران. إذا اشتركتا في القوس نفسه فالمركزية ضعف المحيطية، والمحيطيتان على القوس نفسه متساويتان، والزاوية المماسية تساوي المحيطية المشتركة معها في القوس.',
    vars: [['A, B', 'طرفا القوس (مواقعهما بالدرجات على الدائرة)', '$[0^\\circ, 360^\\circ)$'], ['C', 'رأس الزاوية المحيطية (على القوس الآخر)', 'لا ينطبق على A أو B'], ['O', 'المركز', 'ثابت']],
    params: [
      { key: 'a', label: 'A', min: 0, max: 359, step: 1, value: 200, desc: 'موقع A (درجة)' },
      { key: 'b', label: 'B', min: 0, max: 359, step: 1, value: 340, desc: 'موقع B (درجة)' },
      { key: 'c', label: 'C', min: 0, max: 359, step: 1, value: 90, desc: 'موقع C (درجة)' },
      { key: 'c2', label: 'D', type: 'toggle', value: false, on: 'إظهار زاوية محيطية ثانية', off: 'إخفاء', desc: 'محيطية ثانية على القوس نفسه' },
      { key: 'tan', label: '\\text{tangent}', type: 'toggle', value: false, on: 'إظهار المماس عند A', off: 'إخفاء', desc: 'الزاوية المماسية' }
    ],
    play: { key: 'c', speed: 30 },
    plot: { view: { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, ticks: false, grid: true },
    compute(p) {
      const A = onC(R0, p.a), B = onC(R0, p.b), C = onC(R0, p.c), O = [0, 0];
      const ccwAB = M.normDeg(p.b - p.a); // القوس من A إلى B عكس عقارب الساعة
      const cOn = M.normDeg(p.c - p.a);
      const cInside = cOn > 0 && cOn < ccwAB; // C على القوس AB (عكس عقارب الساعة)
      const arc = cInside ? 360 - ccwAB : ccwAB; // القوس المقابل للزاوية المحيطية (لا يحتوي C)
      const degenerate = M.normDeg(p.c - p.a) === 0 || M.normDeg(p.c - p.b) === 0 || ccwAB === 0;
      const ins = degenerate ? NaN : angAt(C, A, B);
      // نقطة D: محيطية ثانية على القوس نفسه (منتصف القوس الذي يحتوي C)
      const otherStart = cInside ? p.a : p.b, otherLen = 360 - arc;
      const dAng = otherStart + otherLen * (cInside ? 0.25 : 0.75);
      const D = onC(R0, dAng);
      const insD = degenerate ? NaN : angAt(D, A, B);
      return { A: A, B: B, C: C, O: O, D: D, arc: arc, central: arc, ins: ins, insD: insD, deg: degenerate, cInside: cInside, ccwAB: ccwAB, reflex: arc > 180, diameter: Math.abs(arc - 180) < 1e-9 };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.circle(0, 0, R0, { color: c.muted, width: 2 });
      // القوس المقابل
      const start = d.cInside ? p.b : p.a;
      P.parametric((u) => R0 * Math.cos(M.deg2rad(start + d.arc * u)), (u) => R0 * Math.sin(M.deg2rad(start + d.arc * u)), 0, 1, { color: c.c4, width: 6, alpha: 0.6 }, 200);
      // الزاوية المركزية
      P.segment(0, 0, d.A[0], d.A[1], { color: c.c1, width: 2.5 }); P.segment(0, 0, d.B[0], d.B[1], { color: c.c1, width: 2.5 });
      P.angleArc(0, 0, 30, M.deg2rad(start), M.deg2rad(start + d.arc), { color: c.c1, width: 2, fill: c.c1 });
      // المحيطية
      P.segment(d.C[0], d.C[1], d.A[0], d.A[1], { color: c.c2, width: 2.5 }); P.segment(d.C[0], d.C[1], d.B[0], d.B[1], { color: c.c2, width: 2.5 });
      const ca = Math.atan2(d.A[1] - d.C[1], d.A[0] - d.C[0]), cb = Math.atan2(d.B[1] - d.C[1], d.B[0] - d.C[0]);
      let s0 = ca, s1 = cb; let diff = s1 - s0; while (diff > PI) diff -= 2 * PI; while (diff < -PI) diff += 2 * PI;
      P.angleArc(d.C[0], d.C[1], 26, s0, s0 + diff, { color: c.c2, width: 2, fill: c.c2 });
      if (p.c2) {
        P.segment(d.D[0], d.D[1], d.A[0], d.A[1], { color: c.c3, width: 2, dash: [6, 4] }); P.segment(d.D[0], d.D[1], d.B[0], d.B[1], { color: c.c3, width: 2, dash: [6, 4] });
        P.point(d.D[0], d.D[1], { color: c.c3, label: 'D: ' + M.fmt(d.insD, 2) + '°' });
      }
      if (p.tan) {
        // المماس عند A عمودي على OA
        const t = [-d.A[1] / R0, d.A[0] / R0];
        P.segment(d.A[0] - 6 * t[0], d.A[1] - 6 * t[1], d.A[0] + 6 * t[0], d.A[1] + 6 * t[1], { color: c.c5, width: 2.5 });
        // الزاوية المماسية: بين المماس (في الجهة المقابلة لـ C) والوتر AB
        const dir = (t[0] * (d.C[0] - d.A[0]) + t[1] * (d.C[1] - d.A[1])) > 0 ? [-t[0], -t[1]] : t;
        const a0 = Math.atan2(dir[1], dir[0]), a1 = Math.atan2(d.B[1] - d.A[1], d.B[0] - d.A[0]);
        let df = a1 - a0; while (df > PI) df -= 2 * PI; while (df < -PI) df += 2 * PI;
        P.angleArc(d.A[0], d.A[1], 34, a0, a0 + df, { color: c.c5, width: 2, fill: c.c5 });
        P.text(d.A[0] + 1.2 * dir[0], d.A[1] + 1.2 * dir[1], 'مماسية: ' + M.fmt(Math.abs(M.rad2deg(df)), 2) + '°', { color: c.c5, rtl: true, align: 'center', dy: -12 });
      }
      P.point(0, 0, { color: c.c1, r: 4, label: 'O', dx: -14 });
      [['A', d.A], ['B', d.B], ['C', d.C]].forEach((q) => P.point(q[1][0], q[1][1], { color: q[0] === 'C' ? c.c2 : c.c1, label: q[0], dx: q[1][0] >= 0 ? 10 : -16, dy: q[1][1] >= 0 ? -10 : 14 }));
      P.text(0, -5.8, 'مركزية: ' + M.fmt(d.central, 2) + '°   محيطية: ' + M.fmt(d.ins, 2) + '°', { align: 'center', rtl: true, bold: true });
    },
    handles(p, d, set) {
      return [['a', d.A], ['b', d.B], ['c', d.C]].map((q) => ({ x: q[1][0], y: q[1][1], onDrag: (x, y) => set(q[0], snapAng(x, y) % 360) }));
    },
    live(p, d) { return d.deg ? '\\angle ACB\\ \\text{غير معرّفة (C ينطبق على A أو B)}' : '\\angle AOB = ' + deg(d.central) + ' = 2 \\times ' + deg(d.ins) + ' = 2\\,\\angle ACB'; },
    results(p, d) {
      const r = [
        ['قياس القوس AB المقابل', deg(d.arc) + (d.reflex ? '\\ \\text{(زاوية مركزية منعكسة)}' : '')],
        ['الزاوية المركزية \\angle AOB', deg(d.central)],
        ['الزاوية المحيطية \\angle ACB', d.deg ? '\\text{غير معرّفة}' : deg(d.ins)],
        ['التحقق', d.deg ? '\\text{—}' : '\\frac{' + M.fmt(d.central, 2) + '}{' + M.fmt(d.ins, 2) + '} = ' + M.tex(d.central / d.ins, 6), true, 'pos']
      ];
      if (d.diameter) r.push(['ملاحظة', 'AB قطر ⇒ الزاوية المحيطية قائمة (90°)', false, 'pos']);
      if (p.c2) r.push(['المحيطية الثانية \\angle ADB', deg(d.insD) + (M.near(d.insD, d.ins, 1e-6) ? ' = \\angle ACB' : '')]);
      return r;
    },
    steps(p, d) {
      return ['القوس الذي لا يحتوي $C$ قياسه $' + deg(d.arc) + '$ (الفرق بين موقعي $A$ و $B$).', 'الزاوية المركزية المرسومة على هذا القوس $= ' + deg(d.central) + '$.', 'الزاوية المحيطية $= \\frac{1}{2} \\times ' + deg(d.central) + ' = ' + deg(d.central / 2) + '$ — وهي ما يقيسه البرنامج مباشرة من الإحداثيات: $' + deg(d.ins) + '$.'];
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.c !== b.c && da && da.cInside === db.cInside) o.push('حرّكت $C$ على القوس نفسه: الزاوية المحيطية بقيت $' + deg(db.ins) + '$. **لماذا؟** كل الزوايا المحيطية المرسومة على القوس نفسه تساوي نصف الزاوية المركزية نفسها، فهي متساوية.');
      if (da && da.cInside !== db.cInside) o.push('انتقل $C$ إلى القوس الآخر، فصار القوس المقابل $' + deg(db.arc) + '$ والزاوية المحيطية $' + deg(db.ins) + '$ — مجموعها مع السابقة $180^\\circ$.');
      if (a.a !== b.a || a.b !== b.b) o.push('تغيّر القوس $AB$ إلى $' + deg(db.arc) + '$: تغيّرت المركزية والمحيطية معاً وبقيت النسبة $2 : 1$.');
      return o;
    },
    learn: [
      '**تعريف (ص 86):** الزاوية المركزية رأسها في مركز الدائرة وضلعاها أنصاف أقطار؛ والمحيطية رأسها على الدائرة وضلعاها أوتار.',
      '**نشاط 3 ص 87 (البرهان):** نرسم القطر من رأس المحيطية. الزاوية الخارجة عن المثلث المتطابق الضلعين ($OA = OB$ أنصاف أقطار) تساوي مجموع الزاويتين الداخليتين المتساويتين، أي ضعف إحداهما. بجمع الجزأين: **قياس الزاوية المركزية = ضعفي قياس الزاوية المحيطية المشتركة معها في القوس نفسه**.',
      '**نشاط 5 ص 88:** أي زاويتين محيطيتين مرسومتين على قوس واحد في الدائرة متساويتان في القياس.',
      '**تمرين 2 ص 90:** الزاوية المحيطية المرسومة على قطر الدائرة قياسها $90^\\circ$ (لأن المركزية $180^\\circ$).',
      '**ص 89:** مماس الدائرة مستقيم يشترك معها في نقطة واحدة. الزاوية المماسية بين المماس ووتر من نقطة التماس، وقياسها يساوي قياس الزاوية المحيطية المشتركة معها في القوس نفسه (نشاط 9–10).'
    ],
    challenges: [
      { q: 'اجعل الزاوية المركزية $100^\\circ$. كم تصبح المحيطية؟ (سؤال 1-2 ص 96)', hint: 'اجعل الفرق بين B و A يساوي 100 مع إبقاء C على القوس الآخر.', init: { a: 0, b: 60, c: 200 }, check: (p, d) => !d.deg && M.near(d.central, 100, 1e-9), why: () => 'المحيطية $50^\\circ$.' },
      { q: 'اجعل $AB$ قطراً وتحقق أن المحيطية قائمة.', hint: 'الفرق بين موقعي A و B يساوي $180^\\circ$.', init: { a: 0, b: 90, c: 270 }, check: (p, d) => d.diameter && !d.deg },
      { q: 'اجعل الزاوية المركزية منعكسة (أكبر من $180^\\circ$) كما في نشاط 4 ص 87.', hint: 'ضع C على القوس الأصغر بين A و B.', init: { a: 0, b: 150, c: 270 }, check: (p, d) => d.reflex && !d.deg, why: (p, d) => 'المنعكسة $' + deg(d.central) + '$ والمحيطية $' + deg(d.ins) + '$.' }
    ],
    tutor: [
      { q: 'لماذا المركزية ضعف المحيطية؟', k: ['ضعف', 'لماذا', 'برهان', 'اثبات'], a: (p, d) => 'ارسم القطر من $C$. المثلثان الناتجان متطابقا الضلعين لأن أضلاعهما أنصاف أقطار، فزاويتا القاعدة متساويتان، والزاوية الخارجة عند $O$ تساوي مجموعهما = ضعف إحداهما. بجمع الجزأين: $' + deg(d.central) + ' = 2 \\times ' + deg(d.ins) + '$.' },
      { q: 'هل تتغير المحيطية إذا حركت C؟', k: ['حركت c', 'تتغير', 'c'], a: (p, d) => 'لا، ما دام $C$ على القوس نفسه تبقى $' + deg(d.ins) + '$. وإذا انتقل للقوس الآخر تصبح $' + deg(180 - d.ins) + '$.' },
      { q: 'ما الزاوية المماسية؟', k: ['مماسيه', 'مماس'], a: (p, d) => 'هي الزاوية بين المماس عند $A$ والوتر $AB$. قياسها يساوي المحيطية المرسومة على القوس نفسه: $' + deg(d.ins) + '$. فعّل «إظهار المماس» لتراها.' }
    ]
  });

  /* ======================= 3-3 الشكل الرباعي الدائري ======================= */
  ML.register({
    id: 'cyclic-quad', unit: U, order: 3, lesson: '3-3', lessonTitle: 'الشكل الرباعي الدائري', page: 92,
    titleAr: 'الشكل الرباعي الدائري', titleEn: 'Cyclic Quadrilateral', tags: 'رباعي دائري زوايا متقابله متكامله زاويه خارجه',
    formula: '\\angle A + \\angle C = 180^{\\circ},\\quad \\angle B + \\angle D = 180^{\\circ}',
    book: 'كل زاويتين متقابلتين في الشكل الرباعي الدائري متكاملتان ، والزاوية الخارجة = الزاوية الداخلية المقابلة للمجاورة لها',
    summary: 'الشكل الرباعي الدائري تقع رؤوسه الأربعة على دائرة. كل زاويتين متقابلتين فيه متكاملتان، والعكس صحيح: إذا كان مجموع زاويتين متقابلتين $180^\\circ$ فالشكل رباعي دائري.',
    vars: [['A, B, C, D', 'مواقع الرؤوس على الدائرة (بالدرجات)', 'مرتبة عكس عقارب الساعة'], ['k_D', 'بُعد الرأس D عن المركز نسبةً لنصف القطر', '$k_D = 1$: D على الدائرة']],
    params: [
      { key: 'a', label: 'A', min: 0, max: 359, step: 1, value: 20 },
      { key: 'b', label: 'B', min: 0, max: 359, step: 1, value: 110 },
      { key: 'c', label: 'C', min: 0, max: 359, step: 1, value: 200 },
      { key: 'd', label: 'D', min: 0, max: 359, step: 1, value: 300 },
      { key: 'kD', label: 'k_D', min: 0.6, max: 1.4, step: 0.05, value: 1, desc: '1 = على الدائرة' },
      { key: 'ext', label: '\\text{exterior}', type: 'toggle', value: true, on: 'إظهار الزاوية الخارجة عند D', off: 'إخفاء' }
    ],
    plot: { view: { xmin: -7, xmax: 7, ymin: -7, ymax: 7 }, ticks: false },
    compute(p) {
      const order = [['A', p.a, 1], ['B', p.b, 1], ['C', p.c, 1], ['D', p.d, p.kD]].sort((x, y) => x[1] - y[1]);
      const pts = order.map((o) => { const q = onC(R0 * o[2], o[1]); return { n: o[0], p: q, on: o[2] === 1 }; });
      const ang = pts.map((v, i) => angAt(v.p, pts[(i + 3) % 4].p, pts[(i + 1) % 4].p));
      const distinct = new Set([p.a, p.b, p.c, p.d]).size === 4;
      // الزاوية الخارجة عند الرأس الرابع في الترتيب: امتداد الضلع من الرأس السابق
      const i = 3, V = pts[i].p, Prev = pts[2].p, Next = pts[0].p;
      const ext = [2 * V[0] - Prev[0], 2 * V[1] - Prev[1]];
      const extAng = angAt(V, ext, Next);
      return { pts: pts, ang: ang, s02: ang[0] + ang[2], s13: ang[1] + ang[3], distinct: distinct, ext: ext, extAng: extAng, cyclic: Math.abs(ang[0] + ang[2] - 180) < 1e-6 };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.circle(0, 0, R0, { color: c.muted, width: 2 });
      if (!d.distinct) { P.text(0, 0, 'يجب أن تكون الرؤوس الأربعة مختلفة', { align: 'center', rtl: true, color: c.c2, bold: true }); return; }
      P.polygon(d.pts.map((v) => v.p), { color: c.c1, width: 3, fill: c.c1, fillAlpha: 0.08 });
      const cols = [c.c2, c.c3, c.c2, c.c3];
      d.pts.forEach((v, i) => {
        const pr = d.pts[(i + 3) % 4].p, nx = d.pts[(i + 1) % 4].p;
        const a0 = Math.atan2(pr[1] - v.p[1], pr[0] - v.p[0]), a1 = Math.atan2(nx[1] - v.p[1], nx[0] - v.p[0]);
        let df = a1 - a0; while (df > PI) df -= 2 * PI; while (df < -PI) df += 2 * PI;
        P.angleArc(v.p[0], v.p[1], 24, a0, a0 + df, { color: cols[i], width: 2, fill: cols[i] });
        const out = Math.hypot(v.p[0], v.p[1]) || 1;
        P.point(v.p[0], v.p[1], { color: v.on ? c.c1 : c.c4, r: 6 });
        P.text(v.p[0] * (1 + 0.55 / out * 1.6), v.p[1] * (1 + 0.55 / out * 1.6), v.n + ' = ' + M.fmt(d.ang[i], 1) + '°', { align: 'center', bold: true, color: cols[i] });
      });
      if (p.ext) {
        const V = d.pts[3].p;
        P.segment(V[0], V[1], d.ext[0], d.ext[1], { color: c.c5, width: 2, dash: [6, 4] });
        P.text(d.ext[0], d.ext[1], 'خارجة = ' + M.fmt(d.extAng, 1) + '°', { color: c.c5, rtl: true, align: 'center', dy: -12 });
      }
    },
    handles(p, d, set) {
      return d.pts.map((v) => ({ x: v.p[0], y: v.p[1], onDrag: (x, y) => set(v.n.toLowerCase(), snapAng(x, y) % 360) }));
    },
    live(p, d) {
      if (!d.distinct) return '\\text{—}';
      const n = d.pts.map((v) => v.n);
      return '\\angle ' + n[0] + ' + \\angle ' + n[2] + ' = ' + M.fmt(d.s02, 2) + '^{\\circ},\\quad \\angle ' + n[1] + ' + \\angle ' + n[3] + ' = ' + M.fmt(d.s13, 2) + '^{\\circ}';
    },
    results(p, d) {
      if (!d.distinct) return [['تنبيه', 'اجعل الرؤوس مختلفة', false, 'neg']];
      const n = d.pts.map((v) => v.n);
      const r = d.pts.map((v, i) => ['\\angle ' + v.n, deg(d.ang[i])]);
      r.push(['مجموع المتقابلتين ' + n[0] + ' و ' + n[2], deg(d.s02), true, d.cyclic ? 'pos' : 'neg']);
      r.push(['مجموع المتقابلتين ' + n[1] + ' و ' + n[3], deg(d.s13), true, d.cyclic ? 'pos' : 'neg']);
      r.push(['الحكم', d.cyclic ? 'رباعي دائري: الزوايا المتقابلة متكاملة' : 'ليس رباعياً دائرياً: المجموع ≠ 180°', false, d.cyclic ? 'pos' : 'neg']);
      if (p.ext) r.push(['الزاوية الخارجة عند ' + n[3], deg(d.extAng) + (d.cyclic ? ' = \\angle ' + n[1] + '\\ \\text{(المقابلة للمجاورة)}' : '')]);
      return r;
    },
    steps(p, d) {
      if (!d.distinct) return [];
      const n = d.pts.map((v) => v.n);
      return ['$\\angle ' + n[0] + '$ محيطية على القوس $' + n[1] + n[2] + n[3] + '$ و $\\angle ' + n[2] + '$ محيطية على القوس الآخر.', 'القوسان معاً يكملان الدائرة ($360^\\circ$)، وكل محيطية = نصف قوسها، فمجموعهما $\\frac{360^\\circ}{2} = 180^\\circ$.', 'الزاوية الخارجة والداخلية المجاورة لها مجموعهما $180^\\circ$، فالخارجة تساوي الداخلية المقابلة للمجاورة.'];
    },
    explain(a, b, da, db) {
      if (a.kD !== b.kD) return [b.kD === 1 ? 'عاد الرأس D إلى الدائرة: صار الشكل رباعياً دائرياً ومجموع المتقابلتين $180^\\circ$ بالضبط.' : 'الرأس D لم يعد على الدائرة ($k_D = ' + M.fmt(b.kD) + '$)، لذلك مجموع الزاويتين المتقابلتين $' + deg(db.s02) + ' \\neq 180^\\circ$ — هذا هو عكس النظرية.'];
      if (db.cyclic) return ['حرّكت رأساً على الدائرة فتغيّرت الزوايا، لكن بقي مجموع كل متقابلتين $180^\\circ$.'];
      return [];
    },
    learn: [
      '**تعريف (ص 92):** الشكل الرباعي الدائري شكل رباعي تقع رؤوسه الأربعة على الدائرة.',
      '**نشاط 2 ص 92 (البرهان):** باستخدام الزوايا المحيطية المشتركة في الأقواس ومجموع زوايا المثلث، نجد $\\angle B + \\angle D = 180^\\circ$.',
      '**نظرية (ص 93):** كل زاويتين متقابلتين في الشكل الرباعي الدائري متكاملتان. **وعكسها:** إذا كان مجموع زاويتين متقابلتين في شكل رباعي $180^\\circ$ فهو رباعي دائري.',
      '**تعريف (ص 94):** إذا مُدّ أحد أضلاع الشكل الرباعي على استقامته، فالزاوية بين الامتداد والضلع المجاور هي **الزاوية الخارجة**، وقياسها في الرباعي الدائري = قياس الزاوية الداخلية المقابلة للمجاورة لها.',
      '**ملاحظة (ص 94):** إذا كانت إحدى زوايا الرباعي الدائري قائمة، فقطر الشكل المقابل لها هو قطر في الدائرة.'
    ],
    challenges: [
      { q: 'اجعل إحدى الزوايا $70^\\circ$ ولاحظ أن مقابلتها $110^\\circ$ (نشاط 3 ص 93).', hint: 'غيّر موقع الرؤوس المجاورة.', init: { a: 20, b: 110, c: 200, d: 300, kD: 1 }, check: (p, d) => d.distinct && d.cyclic && d.ang.some((x) => M.near(x, 70, 0.5)) },
      { q: 'حرّك D عن الدائرة حتى يصبح مجموع المتقابلتين $190^\\circ$ تقريباً أو أكثر.', hint: 'قلل $k_D$ (D داخل الدائرة يزيد زاويته).', init: { kD: 1 }, check: (p, d) => d.distinct && (Math.abs(d.s13 - 180) >= 10 || Math.abs(d.s02 - 180) >= 10) },
      { q: 'اجعل إحدى زوايا الشكل قائمة (الضلع المقابل قطر).', hint: 'اجعل رأسين متقابلين بينهما $180^\\circ$.', init: { a: 20, b: 110, c: 170, d: 300, kD: 1 }, check: (p, d) => d.distinct && d.ang.some((x) => M.near(x, 90, 1e-6)) }
    ],
    tutor: [
      { q: 'لماذا مجموع الزاويتين المتقابلتين 180°؟', k: ['لماذا', '180', 'متكاملتان', 'متقابلتين'], a: () => 'كل زاوية محيطية تساوي نصف القوس المقابل لها، والزاويتان المتقابلتان تقابلان قوسين يكوّنان الدائرة كاملة $360^\\circ$، فمجموعهما $\\frac{360^\\circ}{2} = 180^\\circ$.' },
      { q: 'كيف أعرف أن الشكل رباعي دائري؟', k: ['اعرف', 'رباعي دائري', 'هل'], a: (p, d) => 'أتحقق من أن مجموع زاويتين متقابلتين $180^\\circ$. الآن المجموع $' + deg(d.s02) + '$ ' + (d.cyclic ? 'فالشكل رباعي دائري.' : 'فالشكل ليس رباعياً دائرياً.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
