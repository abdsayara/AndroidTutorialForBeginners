/* الوحدة الخامسة: المصفوفات (ص 141–175) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const F = ML.fx;
  const U = 5;
  const mtex = (A, frac) => '\\begin{bmatrix}' + A.map((r) => r.map((v) => (frac ? M.texFrac(v) : M.tex(v))).join(' & ')).join(' \\\\ ') + '\\end{bmatrix}';
  ML.mtex = mtex;
  const A_ = (p, s) => [[p[s + '11'], p[s + '12']], [p[s + '21'], p[s + '22']]];
  const entryParams = (s, vals, extra) => [[1, 1], [1, 2], [2, 1], [2, 2]].map((ij, n) => Object.assign({ key: s + ij[0] + ij[1], label: s.toLowerCase() + '_{' + ij[0] + ij[1] + '}', min: -9, max: 9, step: 1, value: vals[n], int: true }, extra || {}));

  // رسم مصفوفة على Canvas
  function drawMat(ctx, x, y, cs, A, cols, opt) {
    opt = opt || {};
    const m = A.length, n = A[0].length, w = n * cs, h = m * cs;
    ctx.save(); ctx.lineWidth = 2.5; ctx.strokeStyle = cols.axis;
    ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + 8, y + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - 8, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - 8, y + h); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      const hi = opt.hi && opt.hi(i, j);
      if (hi) { ctx.fillStyle = hi; ctx.globalAlpha = 0.22; ctx.fillRect(x + j * cs + 3, y + i * cs + 3, cs - 6, cs - 6); ctx.globalAlpha = 1; }
      ctx.fillStyle = hi || cols.text; ctx.font = (hi ? '700 ' : '600 ') + Math.round(cs * 0.34) + 'px system-ui';
      const v = A[i][j]; const f = M.toFraction(v, 100);
      ctx.fillText(f && f.d !== 1 ? f.n + '/' + f.d : M.fmt(v, 3), x + j * cs + cs / 2, y + i * cs + cs / 2);
    }
    if (opt.label) { ctx.fillStyle = cols.text; ctx.font = '700 15px system-ui'; ctx.fillText(opt.label, x + w / 2, y - 14); }
    ctx.restore();
    return w;
  }
  function sym(ctx, x, y, s, cols) { ctx.save(); ctx.fillStyle = cols.axis; ctx.font = '700 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore(); }

  /* ======================= 5-1/5-2 المصفوفة والعمليات عليها ======================= */
  const OPS = { add: ['A + B', 'جمع'], sub: ['A - B', 'طرح'], scale: ['kA', 'ضرب بعدد ثابت'], comm: ['B + A', 'التحقق من الإبدال'] };
  ML.register({
    id: 'matrix-ops', unit: U, order: 1, lesson: '5-1، 5-2', lessonTitle: 'المصفوفة والعمليات على المصفوفات', page: 143,
    titleAr: 'المصفوفة والعمليات عليها', titleEn: 'Matrices: Addition, Subtraction & Scalar Multiplication', tags: 'مصفوفه مدخله رتبه جمع طرح ضرب بعدد',
    formula: 'c_{ij} = a_{ij} \\pm b_{ij},\\qquad (kA)_{ij} = k\\,a_{ij}',
    book: 'المدخلة أي هـ : الصف ي والعمود هـ ؛ أ ± ب تُجمع/تُطرح المدخلات المتناظرة (نفس الرتبة) ؛ جـ.أ = (جـ أي هـ)',
    summary: 'المصفوفة تنظيم مستطيل لأعداد حقيقية في $m$ صفاً و $n$ عموداً (رتبتها $m \\times n$). نجمع أو نطرح مصفوفتين من الرتبة نفسها بجمع أو طرح مدخلاتهما المتناظرة، ونضرب المصفوفة بعدد بضرب كل مدخلة فيه.',
    vars: [['a_{ij}', 'مدخلة المصفوفة A في الصف $i$ والعمود $j$', '$\\mathbb{R}$'], ['k', 'عدد ثابت', '$\\mathbb{R}$'], ['(i, j)', 'المدخلة المميزة لتتبع الحساب', '$i, j \\in \\{1, 2\\}$']],
    params: [
      { key: 'op', label: '\\text{op}', type: 'select', value: 'add', options: Object.keys(OPS).map((k) => [k, OPS[k][1] + ': ' + OPS[k][0]]) }
    ].concat(entryParams('A', [2, -1, 4, 0]), entryParams('B', [3, 5, -2, 1]), [
      { key: 'k', label: 'k', min: -5, max: 5, step: 1, value: 3, int: true },
      { key: 'i', label: 'i', min: 1, max: 2, step: 1, value: 1, int: true, desc: 'الصف' },
      { key: 'j', label: 'j', min: 1, max: 2, step: 1, value: 2, int: true, desc: 'العمود' }
    ]),
    custom: true, canvasHint: 'المدخلة المظللة تُظهر كيف تُحسب المدخلة المقابلة في الناتج.',
    compute(p) {
      const A = A_(p, 'A'), B = A_(p, 'B');
      let R;
      if (p.op === 'add') R = M.matAdd(A, B); else if (p.op === 'sub') R = M.matSub(A, B); else if (p.op === 'scale') R = M.matScale(p.k, A); else R = M.matAdd(B, A);
      return { A: A, B: B, R: R, AB: M.matAdd(A, B) };
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const i = p.i - 1, j = p.j - 1; const hi = (r, c) => (r === i && c === j ? cols.c2 : null);
      const cs = Math.min(64, Math.max(36, W / 13)); const y = H / 2 - cs;
      const parts = p.op === 'scale' ? [['k', p.k], ['A', d.A], ['=', null], ['R', d.R]] : [[p.op === 'comm' ? 'B' : 'A', p.op === 'comm' ? d.B : d.A], [p.op === 'sub' ? '−' : '+', null], [p.op === 'comm' ? 'A' : 'B', p.op === 'comm' ? d.A : d.B], ['=', null], ['R', d.R]];
      let total = 0; parts.forEach((q) => { total += q[1] && q[1].length ? 2 * cs + 20 : 44; });
      let x = Math.max(10, (W - total) / 2);
      parts.forEach((q) => {
        if (q[0] === 'k') { sym(ctx, x + 18, y + cs, String(p.k), cols); x += 44; return; }
        if (!q[1]) { sym(ctx, x + 22, y + cs, q[0], cols); x += 44; return; }
        drawMat(ctx, x, y, cs, q[1], cols, { hi: hi, label: q[0] === 'R' ? (p.op === 'scale' ? 'kA' : OPS[p.op][0]) : q[0] }); x += 2 * cs + 20;
      });
      ctx.save(); ctx.fillStyle = cols.c2; ctx.font = '600 15px system-ui'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
      const a = d.A[i][j], b = d.B[i][j];
      const txt = p.op === 'scale' ? `المدخلة (${p.i},${p.j}): ${p.k} × ${M.fmt(a)} = ${M.fmt(d.R[i][j])}` : p.op === 'comm' ? `المدخلة (${p.i},${p.j}): ${M.fmt(b)} + ${M.fmt(a)} = ${M.fmt(d.R[i][j])} — نفس A + B` : `المدخلة (${p.i},${p.j}): ${M.fmt(a)} ${p.op === 'sub' ? '−' : '+'} ${M.fmt(b)} = ${M.fmt(d.R[i][j])}`;
      ctx.fillText(txt, W / 2, y + 2 * cs + 40); ctx.restore();
    },
    live(p, d) {
      if (p.op === 'scale') return M.fmt(p.k) + mtex(d.A) + ' = ' + mtex(d.R);
      const L = p.op === 'comm' ? d.B : d.A, R2 = p.op === 'comm' ? d.A : d.B;
      return mtex(L) + (p.op === 'sub' ? ' - ' : ' + ') + mtex(R2) + ' = ' + mtex(d.R);
    },
    results(p, d) {
      const r = [['رتبة A و B', '2 \\times 2'], ['الناتج ' + OPS[p.op][0], mtex(d.R)], ['المدخلة', 'a_{' + p.i + p.j + '} = ' + d.A[p.i - 1][p.j - 1] + ',\\ b_{' + p.i + p.j + '} = ' + d.B[p.i - 1][p.j - 1]]];
      if (p.op === 'comm') r.push(['A + B = B + A ؟', 'نعم — جمع المصفوفات عملية تبديلية', false, 'pos']);
      return r;
    },
    steps(p, d) {
      const i = p.i - 1, j = p.j - 1;
      if (p.op === 'scale') return ['كل مدخلة في $A$ تُضرب في $k = ' + p.k + '$.', '$(kA)_{' + p.i + p.j + '} = ' + p.k + ' \\times ' + d.A[i][j] + ' = ' + d.R[i][j] + '$'];
      return ['المصفوفتان من الرتبة نفسها $2 \\times 2$، فالعملية معرّفة.', 'نجري العملية على المدخلات المتناظرة: $c_{' + p.i + p.j + '} = ' + d.A[i][j] + (p.op === 'sub' ? ' - (' + d.B[i][j] + ')' : ' + (' + d.B[i][j] + ')') + ' = ' + d.R[i][j] + '$'];
    },
    learn: [
      '**تعريف (ص 143):** المصفوفة تنظيم مستطيل الشكل لأعداد حقيقية على هيئة $m$ صفاً و $n$ عموداً، رتبتها $m \\times n$. كل عدد فيها مدخلة $a_{ij}$ ($i$ الصف، $j$ العمود).',
      '**أنواع (ص 146):** مصفوفة الصف ($1 \\times n$)، مصفوفة العمود ($m \\times 1$)، المربعة ($n \\times n$)، والصفرية $O$ (كل مدخلاتها أصفار).',
      '**تساوي مصفوفتين:** لهما الرتبة نفسها ومدخلاتهما المتناظرة متساوية.',
      '**الجمع والطرح (ص 149–153):** معرّفان للمصفوفات من الرتبة نفسها؛ الجمع تبديلي وتجميعي، والمصفوفة الصفرية هي المحايدة للجمع.',
      '**الضرب بعدد (ص 152):** $k \\cdot A$ مصفوفة من الرتبة نفسها، كل مدخلة فيها $k \\cdot a_{ij}$.'
    ],
    challenges: [
      { q: 'اجعل $A + B$ المصفوفة الصفرية $O$.', hint: 'اجعل $B = -A$ (المعكوس الجمعي).', init: { op: 'add' }, check: (p, d) => p.op === 'add' && d.R.every((r) => r.every((v) => v === 0)) },
      { q: 'اجعل $3A = \\begin{bmatrix} 6 & -3 \\\\ 12 & 0 \\end{bmatrix}$.', hint: 'ضرب بعدد ثابت مع $k = 3$ و $A$ الأصلية.', init: { op: 'add', k: 1, A11: 0, A12: 0, A21: 0, A22: 0 }, check: (p, d) => p.op === 'scale' && JSON.stringify(d.R) === JSON.stringify([[6, -3], [12, 0]]) }
    ],
    tutor: [
      { q: 'لماذا يجب أن تكون المصفوفتان من الرتبة نفسها؟', k: ['الرتبه نفسها', 'لماذا', 'رتبه'], a: () => 'لأن الجمع والطرح يتمان بين المدخلات المتناظرة؛ إذا اختلفت الرتبة توجد مدخلات بلا نظير فتكون العملية غير معرّفة.' },
      { q: 'كيف حُسبت المدخلة المظللة؟', k: ['المظلله', 'المدخله', 'كيف'], a: (p, d) => { const i = p.i - 1, j = p.j - 1; return p.op === 'scale' ? '$' + p.k + ' \\times ' + d.A[i][j] + ' = ' + d.R[i][j] + '$' : '$' + d.A[i][j] + (p.op === 'sub' ? ' - (' : ' + (') + d.B[i][j] + ') = ' + d.R[i][j] + '$'; } }
    ]
  });

  /* ======================= 5-3 ضرب المصفوفات ======================= */
  const PRESETS = { custom: null, I: [[1, 0], [0, 1]], rx: [[1, 0], [0, -1]], ry: [[-1, 0], [0, 1]], s2: [[2, 0], [0, 2]] };
  const VERT = [[1, -1, 2], [2, -3, -5]]; // رؤوس المثلث من نشاط 1 ص 31 (أعمدة)
  ML.register({
    id: 'matrix-mult', unit: U, order: 2, lesson: '5-3', lessonTitle: 'ضرب المصفوفات', page: 158,
    titleAr: 'ضرب المصفوفات', titleEn: 'Matrix Multiplication', tags: 'ضرب مصفوفات صف عمود ليست تبديليه محايده تحويل',
    formula: 'c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\dots + a_{in}b_{nj}',
    book: 'إذا كانت أ من الرتبة م×ن و ب من الرتبة ن×هـ فإن أ.ب = جـ من الرتبة م×هـ ، جـ ي هـ = أي1 ب1هـ + أي2 ب2هـ + … + أي ن ب ن هـ',
    summary: 'نضرب صف $i$ من $A$ في عمود $j$ من $B$ (مجموع حواصل ضرب المدخلات المتناظرة) لنحصل على $c_{ij}$. الضرب معرّف فقط إذا كان عدد أعمدة $A$ = عدد صفوف $B$، وهو **ليس تبديلياً**.',
    vars: [['A', 'مصفوفة $2 \\times 2$', 'مدخلات حقيقية'], ['B', 'مصفوفة $2 \\times 2$ (عرض عددي) أو مصفوفة رؤوس مثلث $2 \\times 3$ (عرض هندسي)', '—'], ['(i, j)', 'المدخلة المتتبعة', '$\\{1, 2\\}$']],
    params: [
      { key: 'view', label: '\\text{view}', type: 'select', value: 'num', options: [['num', 'عددي: A·B مقابل B·A'], ['geo', 'هندسي: A × مصفوفة رؤوس مثلث']] },
      { key: 'preset', label: 'A', type: 'select', value: 'custom', options: [['custom', 'مخصصة'], ['I', 'المحايدة م٢'], ['rx', 'انعكاس في محور السينات'], ['ry', 'انعكاس في محور الصادات'], ['s2', '2·م٢ (تكبير)']] }
    ].concat(entryParams('A', [1, 2, 3, 4], { min: -5, max: 5 }), entryParams('B', [2, 0, 1, -1], { min: -5, max: 5, hidden: (p) => p.view !== 'num' }), [
      { key: 'i', label: 'i', min: 1, max: 2, step: 1, value: 1, int: true, hidden: (p) => p.view !== 'num' },
      { key: 'j', label: 'j', min: 1, max: 2, step: 1, value: 1, int: true, hidden: (p) => p.view !== 'num' }
    ]),
    onSet(p, key) {
      if (key === 'preset' && PRESETS[p.preset]) { const A = PRESETS[p.preset]; p.A11 = A[0][0]; p.A12 = A[0][1]; p.A21 = A[1][0]; p.A22 = A[1][1]; }
      else if (key && /^A\d\d$/.test(key)) p.preset = 'custom';
    },
    plot: { view: { xmin: -12, xmax: 12, ymin: -12, ymax: 12 } },
    compute(p) {
      const A = A_(p, 'A'), B = A_(p, 'B');
      return { A: A, B: B, AB: M.matMul(A, B), BA: M.matMul(B, A), img: M.matMul(A, VERT) };
    },
    draw(P, p, d) {
      const c = P.colors();
      if (p.view === 'num') {
        P.clear(); const ctx = P.ctx; const W = P.W, H = P.H; const i = p.i - 1, j = p.j - 1;
        const cs = Math.min(54, Math.max(30, W / 15));
        const row = (y, L, R, Res, lab, hiOn) => {
          let x = Math.max(8, (W - (6 * cs + 100)) / 2);
          x += drawMat(ctx, x, y, cs, L, c, { label: lab[0], hi: hiOn ? (r) => (r === i ? c.c1 : null) : null }) + 14; sym(ctx, x + 8, y + cs, '×', c); x += 30;
          x += drawMat(ctx, x, y, cs, R, c, { label: lab[1], hi: hiOn ? (r, cc) => (cc === j ? c.c3 : null) : null }) + 14; sym(ctx, x + 8, y + cs, '=', c); x += 30;
          drawMat(ctx, x, y, cs, Res, c, { label: lab[2], hi: hiOn ? (r, cc) => (r === i && cc === j ? c.c2 : null) : null });
        };
        row(30, d.A, d.B, d.AB, ['A', 'B', 'A·B'], true);
        row(30 + 2 * cs + 60, d.B, d.A, d.BA, ['B', 'A', 'B·A'], false);
        ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.font = '600 14px system-ui';
        const same = JSON.stringify(d.AB) === JSON.stringify(d.BA);
        ctx.fillStyle = same ? c.c3 : c.c2; ctx.fillText(same ? 'هنا A·B = B·A (حالة خاصة)' : 'A·B ≠ B·A — الضرب ليس تبديلياً', W / 2, Math.min(H - 14, 30 + 4 * cs + 92)); ctx.restore();
        return;
      }
      const pre = VERT[0].map((x, k) => [x, VERT[1][k]]), im = d.img[0].map((x, k) => [x, d.img[1][k]]);
      P.polygon(pre, { color: c.muted, width: 2, dash: [5, 4], fill: c.muted });
      P.polygon(im, { color: c.c5, width: 3, fill: c.c5 });
      ['A', 'B', 'C'].forEach((n, k) => { P.point(pre[k][0], pre[k][1], { color: c.muted, r: 4, label: n }); P.point(im[k][0], im[k][1], { color: c.c5, r: 4.5, label: n + "'(" + M.fmt(im[k][0]) + ', ' + M.fmt(im[k][1]) + ')' }); });
    },
    live(p, d) { return p.view === 'num' ? mtex(d.A) + mtex(d.B) + ' = ' + mtex(d.AB) : mtex(d.A) + mtex(VERT) + ' = ' + mtex(d.img); },
    results(p, d) {
      const i = p.i - 1, j = p.j - 1;
      if (p.view === 'num') return [
        ['A · B', mtex(d.AB)], ['B · A', mtex(d.BA)],
        ['c_{' + p.i + p.j + '} (صف × عمود)', '(' + d.A[i][0] + ')(' + d.B[0][j] + ') + (' + d.A[i][1] + ')(' + d.B[1][j] + ') = ' + d.AB[i][j]],
        ['التبديل', JSON.stringify(d.AB) === JSON.stringify(d.BA) ? 'A·B = B·A في هذه الحالة' : 'A·B ≠ B·A', false, JSON.stringify(d.AB) === JSON.stringify(d.BA) ? 'pos' : 'neg']
      ];
      return [['رتبة A × رتبة المثلث', '(2 \\times 2)(2 \\times 3) = 2 \\times 3'], ['صورة الرؤوس', mtex(d.img)], ['نوع A', { custom: 'مخصصة', I: 'المحايدة م٢: الصورة = الأصل', rx: 'انعكاس في محور السينات', ry: 'انعكاس في محور الصادات', s2: 'تكبير بمعامل 2' }[p.preset], false]];
    },
    steps(p, d) {
      const i = p.i - 1, j = p.j - 1;
      if (p.view === 'num') return ['رتبة $A$ هي $2 \\times 2$ ورتبة $B$ هي $2 \\times 2$: عدد أعمدة $A$ = عدد صفوف $B$، فالضرب معرّف والناتج $2 \\times 2$.', 'الصف ' + p.i + ' من $A$: $(' + d.A[i].join(',\\ ') + ')$ ، العمود ' + p.j + ' من $B$: $(' + d.B[0][j] + ',\\ ' + d.B[1][j] + ')$', '$c_{' + p.i + p.j + '} = ' + d.A[i][0] + ' \\times ' + d.B[0][j] + ' + ' + d.A[i][1] + ' \\times ' + d.B[1][j] + ' = ' + d.AB[i][j] + '$'];
      return ['كل عمود في مصفوفة الرؤوس هو نقطة $\\begin{bmatrix} x \\\\ y \\end{bmatrix}$.', 'الصورة: $\\begin{bmatrix} ' + d.A[0][0] + 'x + ' + d.A[0][1] + 'y \\\\ ' + d.A[1][0] + 'x + ' + d.A[1][1] + 'y \\end{bmatrix}$'];
    },
    learn: [
      '**تعريف (ص 158):** إذا كانت $A$ من الرتبة $m \\times n$ و $B$ من الرتبة $n \\times h$، فإن $A \\cdot B = C$ من الرتبة $m \\times h$ حيث $c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\dots + a_{in}b_{nj}$.',
      '**أتعلّم (ص 159):** عملية ضرب المصفوفات ليست تبديلية.',
      '**أتعلّم (ص 161):** المصفوفة $\\begin{bmatrix}1 & 0 \\\\ 0 & 1\\end{bmatrix}$ هي المحايدة لضرب المصفوفات من الرتبة الثانية، ويرمز لها $I_2$ (مصفوفة الوحدة). وتتوزع عملية الضرب على الجمع.',
      '**تطبيق (العرض الهندسي):** إذا كتبنا رؤوس مثلث أعمدةً في مصفوفة، فإن ضربها من اليسار بمصفوفة $2 \\times 2$ يعطي رؤوس صورته. مثلث الرؤوس من نشاط الانسحاب ص 31.'
    ],
    challenges: [
      { q: 'اختر $A$ بحيث تكون صورة المثلث انعكاسه في محور السينات.', hint: '$A = \\begin{bmatrix}1 & 0\\\\0 & -1\\end{bmatrix}$.', init: { view: 'geo', preset: 'custom', A11: 1, A12: 2, A21: 3, A22: 4 }, check: (p, d) => p.view === 'geo' && JSON.stringify(d.A) === JSON.stringify([[1, 0], [0, -1]]) },
      { q: 'جد مصفوفتين $A, B$ (غير المحايدة) تحققان $A \\cdot B = B \\cdot A$.', hint: 'جرّب $A = 2I$ أو $B = A$.', init: { view: 'num', preset: 'custom', A11: 1, A12: 2, A21: 3, A22: 4 }, check: (p, d) => p.view === 'num' && JSON.stringify(d.AB) === JSON.stringify(d.BA) && JSON.stringify(d.A) !== JSON.stringify([[1, 0], [0, 1]]) && JSON.stringify(d.B) !== JSON.stringify([[1, 0], [0, 1]]) }
    ],
    tutor: [
      { q: 'لماذا A·B لا تساوي B·A؟', k: ['لا تساوي', 'تبديليه', 'تبديل'], a: (p, d) => 'لأن $c_{ij}$ في $A \\cdot B$ يضرب **صفوف** $A$ في **أعمدة** $B$، بينما $B \\cdot A$ يضرب صفوف $B$ في أعمدة $A$ — حسابان مختلفان. الآن: $A \\cdot B = ' + mtex(d.AB) + '$ و $B \\cdot A = ' + mtex(d.BA) + '$.' },
      { q: 'كيف أحسب مدخلة في ناتج الضرب؟', k: ['كيف', 'احسب', 'مدخله'], a: (p, d) => { const i = p.i - 1, j = p.j - 1; return 'أضرب الصف ' + p.i + ' من $A$ في العمود ' + p.j + ' من $B$: $' + d.A[i][0] + ' \\times ' + d.B[0][j] + ' + ' + d.A[i][1] + ' \\times ' + d.B[1][j] + ' = ' + d.AB[i][j] + '$.'; } },
      { q: 'متى يكون الضرب غير معرّف؟', k: ['غير معرف', 'متى'], a: () => 'عندما لا يساوي عدد أعمدة المصفوفة الأولى عدد صفوف الثانية، مثل $(2 \\times 3)(2 \\times 3)$.' }
    ]
  });

  /* ======================= 5-4 المحدد والنظير الضربي ======================= */
  ML.register({
    id: 'determinant', unit: U, order: 3, lesson: '5-4', lessonTitle: 'النظير الضربي للمصفوفة المربعة من الرتبة الثانية', page: 163,
    titleAr: 'المحدد والنظير الضربي للمصفوفة', titleEn: 'Determinant & Inverse of a 2×2 Matrix', tags: 'محدد نظير ضربي منفرده معكوس',
    formula: '|A| = a_{11}a_{22} - a_{12}a_{21},\\qquad A^{-1} = \\frac{1}{|A|}\\begin{bmatrix} a_{22} & -a_{12} \\\\ -a_{21} & a_{11} \\end{bmatrix}',
    book: '|أ| = أ11 أ22 − أ12 أ21 ؛ المصفوفة التي محددها صفر منفردة وليس لها نظير ضربي ؛ |ك أ| = ك² |أ|',
    summary: 'المحدد عدد حقيقي يُحسب من المصفوفة المربعة. إذا كان $|A| \\neq 0$ فللمصفوفة نظير ضربي $A^{-1}$ يحقق $A \\cdot A^{-1} = A^{-1} \\cdot A = I_2$؛ وإذا كان $|A| = 0$ فهي **منفردة** وليس لها نظير.',
    vars: [['a_{ij}', 'مدخلات المصفوفة', '$\\mathbb{R}$'], ['k', 'عدد ثابت للتحقق من $|kA| = k^2|A|$', '$\\mathbb{R}$']],
    params: entryParams('A', [3, 1, 5, 2], { min: -6, max: 6, step: 0.5, int: false }).concat([{ key: 'k', label: 'k', min: -4, max: 4, step: 0.5, value: 3 }]),
    plot: { view: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 } },
    compute(p) {
      const A = A_(p, 'A'); const det = M.det2(A); const inv = M.inv2(A);
      return { A: A, det: det, inv: inv, check: inv ? M.matMul(A, inv) : null, detk: M.det2(M.matScale(p.k, A)) };
    },
    draw(P, p, d) {
      const c = P.colors(); const A = d.A;
      const u = [A[0][0], A[1][0]], v = [A[0][1], A[1][1]];
      P.polygon([[0, 0], [1, 0], [1, 1], [0, 1]], { color: c.muted, dash: [4, 4], width: 1.5, fill: c.muted });
      P.polygon([[0, 0], u, [u[0] + v[0], u[1] + v[1]], v], { color: d.det === 0 ? c.c2 : c.c5, width: 2, fill: d.det === 0 ? c.c2 : c.c5, fillAlpha: 0.15 });
      P.arrow(0, 0, u[0], u[1], { color: c.c1, width: 3 }); P.arrow(0, 0, v[0], v[1], { color: c.c3, width: 3 });
      P.text(u[0], u[1], 'العمود 1 (' + M.fmt(u[0]) + ', ' + M.fmt(u[1]) + ')', { color: c.c1, dx: 8, dy: -10 });
      P.text(v[0], v[1], 'العمود 2 (' + M.fmt(v[0]) + ', ' + M.fmt(v[1]) + ')', { color: c.c3, dx: 8, dy: -10 });
      P.text(P.view.xmin, P.view.ymin, 'إثراء بصري: مساحة متوازي الأضلاع = |المحدد| = ' + M.fmt(Math.abs(d.det)), { color: c.text, dx: 8, dy: -12, rtl: true });
    },
    handles(p, d, set) {
      return [{ x: p.A11, y: p.A21, onDrag: (x, y) => { set('A11', M.clamp(Math.round(x * 2) / 2, -6, 6)); set('A21', M.clamp(Math.round(y * 2) / 2, -6, 6)); } }, { x: p.A12, y: p.A22, onDrag: (x, y) => { set('A12', M.clamp(Math.round(x * 2) / 2, -6, 6)); set('A22', M.clamp(Math.round(y * 2) / 2, -6, 6)); } }];
    },
    live(p, d) { return '|A| = \\begin{vmatrix}' + d.A.map((r) => r.map((x) => M.fmt(x)).join(' & ')).join(' \\\\ ') + '\\end{vmatrix} = (' + M.fmt(p.A11) + ')(' + M.fmt(p.A22) + ') - (' + M.fmt(p.A12) + ')(' + M.fmt(p.A21) + ') = ' + M.tex(d.det); },
    results(p, d) {
      const r = [['المحدد', '|A| = ' + M.tex(d.det), true, d.det === 0 ? 'neg' : '']];
      if (!d.inv) r.push(['الحكم', 'المصفوفة منفردة (|A| = 0) — ليس لها نظير ضربي', false, 'neg']);
      else r.push(['النظير الضربي', 'A^{-1} = \\frac{1}{' + M.texFrac(d.det) + '}' + mtex([[d.A[1][1], -d.A[0][1]], [-d.A[1][0], d.A[0][0]]]) + ' = ' + mtex(d.inv, true)], ['التحقق', 'A \\cdot A^{-1} = ' + mtex(d.check.map((r2) => r2.map((x) => M.round(x, 10)))), true, 'pos']);
      r.push(['|kA| = k^2|A|', '|' + M.fmt(p.k) + 'A| = ' + M.tex(d.detk) + ' = (' + M.fmt(p.k) + ')^2 \\times ' + M.tex(d.det)]);
      return r;
    },
    steps(p, d) {
      const s = ['$|A| = a_{11}a_{22} - a_{12}a_{21} = (' + M.fmt(p.A11) + ')(' + M.fmt(p.A22) + ') - (' + M.fmt(p.A12) + ')(' + M.fmt(p.A21) + ') = ' + M.tex(d.det) + '$'];
      if (d.inv) s.push('$|A| \\neq 0$ ← نبدّل مدخلتي القطر الرئيس، ونغيّر إشارتي مدخلتي القطر الآخر، ونقسم على $|A|$.', '$A^{-1} = ' + mtex(d.inv, true) + '$');
      else s.push('$|A| = 0$ ← القسمة على صفر غير معرّفة، فلا يوجد نظير ضربي.');
      return s;
    },
    explain(a, b, da, db) {
      if (da && (da.det === 0) !== (db.det === 0)) return [db.det === 0 ? 'صار المحدد صفراً: العمودان على استقامة واحدة (متوازي الأضلاع انطبق على خط)، فالمصفوفة **منفردة** ولا نظير لها لأن $\\frac{1}{|A|}$ قسمة على صفر.' : 'صار المحدد $' + M.tex(db.det) + ' \\neq 0$ فأصبح للمصفوفة نظير ضربي.'];
      if (da && Math.sign(da.det) !== Math.sign(db.det)) return ['تغيّرت إشارة المحدد: انقلب ترتيب العمودين (اتجاه متوازي الأضلاع).'];
      return [];
    },
    learn: [
      '**تعريف المحدد (ص 163):** إذا كانت $A$ مربعة من الرتبة الثانية فإن محددها عدد حقيقي $|A| = a_{11}a_{22} - a_{12}a_{21}$. مثال: $\\begin{vmatrix} 1 & 3 \\\\ -3 & 9 \\end{vmatrix} = 9 - (-9) = 18$.',
      '**المصفوفة المنفردة (ص 164):** محددها يساوي صفراً. مثال (2): $\\begin{vmatrix} x - 1 & 2 \\\\ 3 & 2 \\end{vmatrix} = 0 \\Rightarrow x = 4$.',
      '**أتعلّم (ص 165):** $|kA| = k^2|A|$ للمصفوفة من الرتبة الثانية.',
      '**النظير الضربي (ص 165–167):** $A \\cdot A^{-1} = A^{-1} \\cdot A = I_2$. المصفوفة المنفردة ليس لها نظير ضربي. و $(A^{-1})^{-1} = A$.'
    ],
    challenges: [
      { q: 'اجعل المصفوفة منفردة مع $a_{12} = 2, a_{21} = 3, a_{22} = 2$ (مثال 2 ص 164): ما قيمة $a_{11}$؟', hint: '$2a_{11} - 6 = 0$.', init: { A11: 1, A12: 2, A21: 3, A22: 2 }, check: (p, d) => p.A12 === 2 && p.A21 === 3 && p.A22 === 2 && d.det === 0, why: () => '$a_{11} = 3$ (أي $x - 1 = 3$ ← $x = 4$ في الكتاب).' },
      { q: 'اجعل المحدد يساوي 1 (فيكون النظير بمدخلات صحيحة)، مثل نشاط 3 ص 167.', hint: 'مثلاً $\\begin{bmatrix} 2 & 5 \\\\ 1 & 3 \\end{bmatrix}$.', init: { A11: 1, A12: 1, A21: 1, A22: 1 }, check: (p, d) => d.det === 1 }
    ],
    tutor: [
      { q: 'لماذا ليس للمصفوفة المنفردة نظير ضربي؟', k: ['منفرده', 'ليس لها', 'نظير'], a: (p, d) => 'لأن $A^{-1} = \\frac{1}{|A|}(\\dots)$ وعندما $|A| = 0$ تكون القسمة على صفر غير معرّفة. الآن $|A| = ' + M.tex(d.det) + '$' + (d.inv ? ' فالنظير موجود.' : ' فلا نظير.') },
      { q: 'كيف أجد النظير الضربي؟', k: ['كيف', 'اجد', 'النظير'], a: () => 'أبدّل مدخلتي القطر الرئيس، وأغيّر إشارة مدخلتي القطر الآخر، ثم أضرب في $\\frac{1}{|A|}$.' }
    ]
  });

  /* ======================= 5-5 قاعدة كريمر ======================= */
  ML.register({
    id: 'cramer', unit: U, order: 4, lesson: '5-5', lessonTitle: 'حل نظام من معادلتين خطيتين باستخدام قاعدة كريمر', page: 169,
    titleAr: 'حل نظام معادلتين خطيتين بقاعدة كريمر', titleEn: "Solving 2×2 Linear Systems with Cramer's Rule", tags: 'كريمر نظام معادلات خطيه محددات تقاطع مستقيمات',
    formula: 'x = \\frac{|A_x|}{|A|},\\quad y = \\frac{|A_y|}{|A|},\\quad |A| \\neq 0',
    book: 'أ.ع = جـ ؛ س = |أس| ÷ |أ| ، ص = |أص| ÷ |أ| حيث |أ| ≠ صفر',
    summary: 'نكتب النظام بالصورة $A \\cdot X = C$. نستبدل عمود معاملات $x$ بعمود الثوابت لنحصل على $A_x$، وعمود معاملات $y$ لنحصل على $A_y$. هندسياً: الحل هو نقطة تقاطع المستقيمين.',
    vars: [['a_1, b_1, c_1', 'المعادلة الأولى $a_1x + b_1y = c_1$', '$\\mathbb{R}$'], ['a_2, b_2, c_2', 'المعادلة الثانية $a_2x + b_2y = c_2$', '$\\mathbb{R}$'], ['|A|', 'محدد مصفوفة المعاملات', 'القاعدة تتطلب $|A| \\neq 0$']],
    params: [
      { key: 'a1', label: 'a_1', min: -10, max: 10, step: 1, value: 8, int: true }, { key: 'b1', label: 'b_1', min: -10, max: 10, step: 1, value: 2, int: true }, { key: 'c1', label: 'c_1', min: -50, max: 50, step: 1, value: 40, int: true },
      { key: 'a2', label: 'a_2', min: -10, max: 10, step: 1, value: 5, int: true }, { key: 'b2', label: 'b_2', min: -10, max: 10, step: 1, value: 3, int: true }, { key: 'c2', label: 'c_2', min: -50, max: 50, step: 1, value: 32, int: true }
    ],
    plot: { view: { xmin: -4, xmax: 12, ymin: -4, ymax: 12 } },
    compute(p) { return M.cramer(p.a1, p.b1, p.c1, p.a2, p.b2, p.c2); },
    draw(P, p, d) {
      const c = P.colors();
      const line = (a, b, cc, col, lab) => {
        if (a === 0 && b === 0) return;
        if (b === 0) { P.vline(cc / a, { color: col, width: 3 }); P.text(cc / a, P.view.ymax, lab, { color: col, dx: 6, dy: 14 }); }
        else { P.fn((x) => (cc - a * x) / b, { color: col, width: 3 }); P.text(P.view.xmax, (cc - a * P.view.xmax) / b, lab, { color: col, dx: -8, dy: -12, align: 'right' }); }
      };
      line(p.a1, p.b1, p.c1, c.c1, '(1)'); line(p.a2, p.b2, p.c2, c.c3, '(2)');
      if (d.unique) P.point(d.x, d.y, { color: c.c2, r: 6, label: '(' + M.fmt(d.x, 4) + ', ' + M.fmt(d.y, 4) + ')' });
      else P.text((P.view.xmin + P.view.xmax) / 2, P.view.ymax, d.kind === 'none' ? 'مستقيمان متوازيان: لا يوجد حل' : 'مستقيمان منطبقان: عدد لا نهائي من الحلول', { color: c.c2, align: 'center', dy: 34, rtl: true, bold: true });
    },
    live(p) { return '\\begin{cases} ' + M.polyTeX([p.a1, 0]).replace(/^0$/, '') + lin2(p.b1, p.a1) + ' = ' + p.c1 + ' \\\\ ' + M.polyTeX([p.a2, 0]).replace(/^0$/, '') + lin2(p.b2, p.a2) + ' = ' + p.c2 + ' \\end{cases}'; function lin2(b, a) { if (b === 0) return a === 0 ? '0' : ''; const s = Math.abs(b) === 1 ? 'y' : Math.abs(b) + 'y'; return a === 0 ? (b < 0 ? '-' : '') + s : (b < 0 ? ' - ' : ' + ') + s; } },
    results(p, d) {
      const A = [[p.a1, p.b1], [p.a2, p.b2]], Ax = [[p.c1, p.b1], [p.c2, p.b2]], Ay = [[p.a1, p.c1], [p.a2, p.c2]];
      const vm = (X) => '\\begin{vmatrix}' + X.map((r) => r.join(' & ')).join(' \\\\ ') + '\\end{vmatrix}';
      const r = [['|A|', vm(A) + ' = ' + M.tex(d.D), true, d.D === 0 ? 'neg' : ''], ['|A_x|', vm(Ax) + ' = ' + M.tex(d.Dx)], ['|A_y|', vm(Ay) + ' = ' + M.tex(d.Dy)]];
      if (d.unique) r.push(['الحل', 'x = \\frac{' + M.fmt(d.Dx) + '}{' + M.fmt(d.D) + '} = ' + M.texFrac(d.x) + ',\\quad y = \\frac{' + M.fmt(d.Dy) + '}{' + M.fmt(d.D) + '} = ' + M.texFrac(d.y)], ['التحقق', p.a1 + '(' + M.fmt(d.x, 4) + ') + ' + p.b1 + '(' + M.fmt(d.y, 4) + ') = ' + M.tex(p.a1 * d.x + p.b1 * d.y), true, 'pos']);
      else r.push(['الحكم', '|A| = 0 ⇒ لا تُطبَّق قاعدة كريمر: ' + (d.kind === 'none' ? 'لا يوجد حل (مستقيمان متوازيان)' : 'عدد لا نهائي من الحلول (مستقيمان منطبقان)'), false, 'neg']);
      return r;
    },
    steps(p, d) {
      const s = ['مصفوفة المعاملات $A = ' + mtex([[p.a1, p.b1], [p.a2, p.b2]]) + '$، الثوابت $C = ' + mtex([[p.c1], [p.c2]]) + '$.', '$|A| = (' + p.a1 + ')(' + p.b2 + ') - (' + p.b1 + ')(' + p.a2 + ') = ' + M.tex(d.D) + '$'];
      if (d.unique) s.push('$|A_x| = (' + p.c1 + ')(' + p.b2 + ') - (' + p.b1 + ')(' + p.c2 + ') = ' + M.tex(d.Dx) + '$ ، $|A_y| = (' + p.a1 + ')(' + p.c2 + ') - (' + p.c1 + ')(' + p.a2 + ') = ' + M.tex(d.Dy) + '$', '$x = ' + M.texFrac(d.x) + '$ ، $y = ' + M.texFrac(d.y) + '$');
      else s.push('$|A| = 0$: القسمة على صفر غير معرّفة، والمستقيمان متوازيان أو منطبقان.');
      return s;
    },
    explain(a, b, da, db) {
      if (da && da.unique !== db.unique) return [db.unique ? 'صار $|A| \\neq 0$: المستقيمان غير متوازيين فيتقاطعان في نقطة واحدة.' : 'صار $|A| = 0$: ميلا المستقيمين متساويان (متوازيان أو منطبقان)، فلا يوجد حل وحيد ولا تصلح قاعدة كريمر.'];
      if (db.unique) return ['انتقلت نقطة التقاطع إلى $(' + M.texFrac(db.x) + ', ' + M.texFrac(db.y) + ')$ — وهي الحل نفسه الذي تعطيه قاعدة كريمر.'];
      return [];
    },
    learn: [
      '**نشاط 1 ص 169:** مهند أعطى بقالة 8 صناديق معلبات وصندوقي عصير بـ 40 ديناراً، وأخرى 5 معلبات و 3 عصير بـ 32 ديناراً: $8x + 2y = 40$ و $5x + 3y = 32$.',
      '**قاعدة كريمر:** نكتب النظام $A \\cdot X = C$، حيث $|A| \\neq 0$: $x = \\frac{|A_x|}{|A|}$، $y = \\frac{|A_y|}{|A|}$، و $A_x$ هي $A$ بعد استبدال عمود معاملات $x$ بالثوابت، و $A_y$ بعد استبدال عمود معاملات $y$.',
      'في مثال مهند: $|A| = 24 - 10 = 14$، $|A_x| = 120 - 64 = 56$، $|A_y| = 256 - 200 = 56$، إذن $x = 4$ و $y = 4$ دنانير.'
    ],
    challenges: [
      { q: 'حل مسألة مهند (نشاط 1 ص 169) وتحقق أن ثمن كل صندوق 4 دنانير.', hint: 'القيم الابتدائية هي المسألة نفسها — اضغط إعادة ضبط.', init: { a1: 1, b1: 1, c1: 0, a2: 1, b2: -1, c2: 0 }, check: (p, d) => p.a1 === 8 && p.b1 === 2 && p.c1 === 40 && p.a2 === 5 && p.b2 === 3 && p.c2 === 32 && d.unique },
      { q: 'كوّن نظاماً لا حل له (مستقيمان متوازيان).', hint: 'اجعل المعادلة الثانية مضاعف الأولى في المعاملات فقط مع ثابت مختلف.', init: { a1: 1, b1: 1, c1: 2, a2: 1, b2: -1, c2: 0 }, check: (p, d) => d.kind === 'none' },
      { q: 'كوّن نظاماً حله $(2, -1)$.', hint: 'اختر المعاملات ثم احسب الثوابت: $c = 2a - b$.', init: { a1: 1, b1: 1, c1: 0, a2: 1, b2: -1, c2: 0 }, check: (p, d) => d.unique && M.near(d.x, 2) && M.near(d.y, -1) }
    ],
    tutor: [
      { q: 'لماذا لا تعمل قاعدة كريمر عندما يكون المحدد صفراً؟', k: ['صفر', 'لا تعمل', 'محدد'], a: (p, d) => 'لأن $x = \\frac{|A_x|}{|A|}$ والقسمة على صفر غير معرّفة. هندسياً: $|A| = 0$ يعني أن للمستقيمين الميل نفسه، فإما متوازيان (لا حل) أو منطبقان (حلول لا نهائية). الآن $|A| = ' + M.tex(d.D) + '$.' },
      { q: 'ما علاقة الحل بالرسم؟', k: ['الرسم', 'تقاطع', 'هندسي'], a: (p, d) => d.unique ? 'الحل $(' + M.texFrac(d.x) + ', ' + M.texFrac(d.y) + ')$ هو نقطة تقاطع المستقيمين لأنها تحقق المعادلتين معاً.' : 'لا توجد نقطة تقاطع وحيدة.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
