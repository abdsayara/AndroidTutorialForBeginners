/* الوحدة الأولى: المنطق الرياضي (ص 7–28) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const L = M.logic;
  const U = 1;
  const ROWS = [[true, true], [true, false], [false, true], [false, false]]; // ترتيب الكتاب: ص ص ، ص خ ، خ ص ، خ خ
  const CON = {
    and: { s: '\\wedge', ar: 'و', f: L.and, name: 'العطف (و)' },
    or: { s: '\\vee', ar: 'أو', f: L.or, name: 'الفصل (أو)' },
    imp: { s: '\\rightarrow', ar: 'إذا كان … فإن', f: L.imp, name: 'الشرط (إذا كان … فإن)' },
    iff: { s: '\\leftrightarrow', ar: 'إذا وفقط إذا', f: L.iff, name: 'الشرط الثنائي (إذا وفقط إذا)' }
  };
  function txt(ctx, s, x, y, o) { o = o || {}; ctx.save(); ctx.font = (o.w || '600') + ' ' + (o.size || 14) + 'px system-ui, Tajawal, sans-serif'; ctx.fillStyle = o.color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.direction = o.rtl ? 'rtl' : 'ltr'; ctx.fillText(o.rtl ? ML.bidi(s) : s, x, y); ctx.restore(); }
  // جدول صواب على Canvas
  function table(ctx, x, y, W, heads, rows, hiRow, c, mark) {
    const cw = Math.min(110, W / heads.length), rh = 30; const x0 = x + (W - cw * heads.length) / 2;
    heads.forEach((h, j) => { ctx.fillStyle = c.grid; ctx.fillRect(x0 + j * cw, y, cw - 2, rh - 2); txt(ctx, h, x0 + j * cw + cw / 2, y + rh / 2, { color: c.text, size: 13, w: '700' }); });
    rows.forEach((r, i) => {
      const yy = y + (i + 1) * rh;
      if (i === hiRow) { ctx.save(); ctx.fillStyle = c.c4; ctx.globalAlpha = 0.18; ctx.fillRect(x0, yy, cw * heads.length - 2, rh - 2); ctx.restore(); }
      if (mark && mark[i]) { ctx.save(); ctx.fillStyle = c.c2; ctx.globalAlpha = 0.16; ctx.fillRect(x0, yy, cw * heads.length - 2, rh - 2); ctx.restore(); }
      r.forEach((v, j) => txt(ctx, M.tv(v), x0 + j * cw + cw / 2, yy + rh / 2, { color: v ? c.c3 : c.c2, size: 15, w: '700' }));
    });
    return y + (rows.length + 1) * rh;
  }

  /* ======================= 1-1 / 1-2 / 1-3 العبارات وأدوات الربط ======================= */
  ML.register({
    id: 'truth-tables', unit: U, order: 1, lesson: '1-1 → 1-3', lessonTitle: 'العبارة الرياضية ونفيها، جداول الصواب وأدوات الربط، أدوات الربط الشرطية', page: 13,
    titleAr: 'جداول الصواب وأدوات الربط', titleEn: 'Truth Tables & Logical Connectives', tags: 'منطق عباره نفي و او اذا كان فان اذا وفقط اذا جدول الصواب داره كهربائيه',
    formula: 'p \\wedge q,\\quad p \\vee q,\\quad p \\rightarrow q,\\quad p \\leftrightarrow q,\\quad \\sim p',
    book: 'ف ∧ ن ، ف ∨ ن ، ف ← ن ، ف ↔ ن ، ~ف ؛ (ص) صائبة ، (خ) خاطئة',
    summary: 'العبارة الرياضية جملة إما صائبة (ص) أو خاطئة (خ). أدوات الربط تكوّن عبارات مركبة: $\\wedge$ صائبة فقط إذا كانت المركبتان صائبتين، $\\vee$ خاطئة فقط إذا كانتا خاطئتين، $\\rightarrow$ خاطئة فقط إذا كانت المقدمة صائبة والتالي خاطئاً، $\\leftrightarrow$ صائبة إذا تساوت قيمتاهما.',
    vars: [['p,\\ q', 'عبارتان رياضيتان (ف ، ن في الكتاب)', 'ص أو خ'], ['\\sim p', 'نفي العبارة', 'عكس قيمة صوابها'], ['\\circ', 'أداة الربط', '$\\wedge, \\vee, \\rightarrow, \\leftrightarrow$']],
    params: [
      { key: 'op', label: '\\circ', type: 'select', value: 'and', options: Object.keys(CON).map((k) => [k, CON[k].name]) },
      { key: 'p', label: 'p', type: 'toggle', value: true, on: 'ص (صائبة)', off: 'خ (خاطئة)' },
      { key: 'q', label: 'q', type: 'toggle', value: false, on: 'ص (صائبة)', off: 'خ (خاطئة)' },
      { key: 'np', label: '\\sim p', type: 'toggle', value: false, on: 'استخدم نفي p', off: 'p كما هي' },
      { key: 'nq', label: '\\sim q', type: 'toggle', value: false, on: 'استخدم نفي q', off: 'q كما هي' }
    ],
    custom: true, canvasHint: 'الدارة الكهربائية (تشبيه الكتاب ص 13–15): المفتاح المغلق = صائبة. الصف المظلل في الجدول هو الحالة الحالية.',
    compute(p) {
      const P = p.np ? !p.p : p.p, Q = p.nq ? !p.q : p.q;
      const f = CON[p.op].f;
      const rows = ROWS.map((r) => { const a = p.np ? !r[0] : r[0], b = p.nq ? !r[1] : r[1]; return [r[0], r[1], f(a, b)]; });
      const hi = ROWS.findIndex((r) => r[0] === p.p && r[1] === p.q);
      return { P: P, Q: Q, v: f(P, Q), rows: rows, hi: hi };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const exprL = (p.np ? '~p' : 'p'), exprR = (p.nq ? '~q' : 'q');
      const sym = { and: '∧', or: '∨', imp: '→', iff: '↔' }[p.op];
      // الدارة
      const cy = 80; const cx = W / 2;
      if (p.op === 'and' || p.op === 'or') {
        ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 3;
        const sw = (x, y, closed, lab) => { ctx.beginPath(); ctx.arc(x - 22, y, 4, 0, 7); ctx.arc(x + 22, y, 4, 0, 7); ctx.fillStyle = c.axis; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(closed ? x + 22 : x + 14, closed ? y : y - 18); ctx.strokeStyle = closed ? c.c3 : c.c2; ctx.stroke(); txt(ctx, lab + ' = ' + (closed ? 'ص' : 'خ'), x, y + 22, { color: closed ? c.c3 : c.c2, size: 12 }); ctx.strokeStyle = c.axis; };
        const lampX = cx + 150, battX = cx - 150;
        if (p.op === 'and') {
          ctx.beginPath(); ctx.moveTo(battX, cy); ctx.lineTo(cx - 92, cy); ctx.moveTo(cx - 48, cy); ctx.lineTo(cx + 48, cy); ctx.moveTo(cx + 92, cy); ctx.lineTo(lampX, cy); ctx.stroke();
          sw(cx - 70, cy, d.P, exprL); sw(cx + 70, cy, d.Q, exprR);
        } else {
          ctx.beginPath(); ctx.moveTo(battX, cy); ctx.lineTo(cx - 70, cy); ctx.lineTo(cx - 70, cy - 30); ctx.lineTo(cx - 22, cy - 30); ctx.moveTo(cx - 70, cy); ctx.lineTo(cx - 70, cy + 30); ctx.lineTo(cx - 22, cy + 30);
          ctx.moveTo(cx + 22, cy - 30); ctx.lineTo(cx + 70, cy - 30); ctx.lineTo(cx + 70, cy + 30); ctx.lineTo(cx + 22, cy + 30); ctx.moveTo(cx + 70, cy); ctx.lineTo(lampX, cy); ctx.stroke();
          sw(cx, cy - 30, d.P, exprL); sw(cx, cy + 30, d.Q, exprR);
        }
        ctx.fillStyle = c.axis; ctx.fillRect(battX - 6, cy - 16, 6, 32); ctx.fillRect(battX - 14, cy - 9, 4, 18);
        ctx.beginPath(); ctx.arc(lampX + 14, cy, 14, 0, 7); ctx.fillStyle = d.v ? '#facc15' : c.grid; ctx.fill(); ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.stroke();
        if (d.v) { ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(lampX + 14, cy, 30, 0, 7); ctx.fill(); ctx.restore(); }
        txt(ctx, d.v ? 'المصباح يضيء ⇐ العبارة صائبة' : 'المصباح مطفأ ⇐ العبارة خاطئة', cx, cy + 62, { color: d.v ? c.c3 : c.c2, rtl: true });
        ctx.restore();
      } else {
        txt(ctx, exprL + '  ' + sym + '  ' + exprR + '  =  ' + M.tv(d.v), cx, cy, { color: d.v ? c.c3 : c.c2, size: 26, w: '700' });
        txt(ctx, p.op === 'imp' ? 'الشرطية خاطئة فقط إذا كانت المقدمة صائبة والتالي خاطئاً' : 'الثنائية صائبة إذا تساوت قيمتا صواب الطرفين', cx, cy + 40, { color: c.text, rtl: true, size: 13 });
      }
      const heads = ['p', 'q'].concat(p.np ? ['~p'] : [], p.nq ? ['~q'] : [], [exprL + ' ' + sym + ' ' + exprR]);
      const rows = d.rows.map((r) => [r[0], r[1]].concat(p.np ? [!r[0]] : [], p.nq ? [!r[1]] : [], [r[2]]));
      table(ctx, 10, cy + 90, W - 20, heads, rows, d.hi, c);
    },
    live(p, d) { return (p.np ? '\\sim p' : 'p') + ' ' + CON[p.op].s + ' ' + (p.nq ? '\\sim q' : 'q') + ' \\equiv \\text{' + M.tv(d.v) + '}'; },
    results(p, d) {
      return [['قيمة p ، q', 'p: ' + M.tv(p.p) + ' ، q: ' + M.tv(p.q), false], ['قيمة العبارة المركبة', d.v ? 'صائبة (ص)' : 'خاطئة (خ)', false, d.v ? 'pos' : 'neg'], ['عدد الحالات', '2^2 = 4'], ['أداة الربط', CON[p.op].name, false]];
    },
    steps(p, d) {
      const s = [];
      if (p.np) s.push('$\\sim p$: نفي $p$ يعكس قيمتها ← ' + M.tv(d.P) + '.');
      if (p.nq) s.push('$\\sim q$: نفي $q$ يعكس قيمتها ← ' + M.tv(d.Q) + '.');
      const rule = { and: 'العطف صائب فقط إذا كانت المركبتان صائبتين', or: 'الفصل خاطئ فقط إذا كانت المركبتان خاطئتين', imp: 'الشرطية خاطئة فقط إذا كانت المقدمة صائبة والتالي خاطئاً', iff: 'الثنائية صائبة إذا كان للطرفين القيمة نفسها' }[p.op];
      s.push(rule + ': ' + M.tv(d.P) + ' ' + CON[p.op].ar + ' ' + M.tv(d.Q) + ' ← **' + M.tv(d.v) + '**.');
      return s;
    },
    explain(a, b, da, db) {
      if (da && da.v !== db.v) return ['تغيّرت قيمة العبارة المركبة إلى ' + (db.v ? '**صائبة**' : '**خاطئة**') + '. ' + ({ and: 'في العطف يكفي أن تكون مركبة واحدة خاطئة لتصبح العبارة خاطئة (مفتاح مفتوح في دارة التوالي).', or: 'في الفصل يكفي أن تكون مركبة واحدة صائبة لتصبح العبارة صائبة (أي مفتاح مغلق في دارة التوازي يكفي).', imp: 'الشرطية لا تكون خاطئة إلا عندما يتحقق الشرط ولا تتحقق النتيجة (مثال الكتاب: فاز عامر ولم يقدّم له المدير الجائزة).', iff: 'الثنائية تختبر تساوي القيمتين.' }[b.op])];
      return [];
    },
    learn: [
      '**العبارة الرياضية (ص 9):** جملة خبرية إما صائبة أو خاطئة وليس الاثنين معاً. ونفيها $\\sim p$ يعكس قيمة صوابها.',
      '**جداول الصواب (ص 13):** للعبارتين $p, q$ أربع حالات؛ وعدد الحالات لـ $k$ عبارات $2^k$. تشبيه الكتاب: العبارة كمفتاح في دارة كهربائية (مغلق = ص، مفتوح = خ).',
      '**أداة الربط (و) $\\wedge$ (ص 14):** تكون $p \\wedge q$ صائبة في الحالة الوحيدة التي تكون فيها كلتا المركبتين صائبة.',
      '**أداة الربط (أو) $\\vee$ (ص 15):** تكون $p \\vee q$ خاطئة في الحالة الوحيدة التي تكون فيها كلتا المركبتين خاطئة.',
      '**إذا كان … فإن $\\rightarrow$ (ص 18):** تكون $p \\rightarrow q$ خاطئة في الحالة الوحيدة عندما تكون مقدمتها صائبة وتاليها خاطئاً.',
      '**إذا وفقط إذا $\\leftrightarrow$ (ص 20):** $p \\leftrightarrow q$ تعني $(p \\rightarrow q) \\wedge (q \\rightarrow p)$، وتكون صائبة عندما تتساوى قيمتا الطرفين.'
    ],
    challenges: [
      { q: 'اجعل العبارة $p \\rightarrow q$ خاطئة (الحالة الوحيدة).', hint: 'المقدمة صائبة والتالي خاطئ.', init: { op: 'imp', p: false, q: false, np: false, nq: false }, check: (p, d) => p.op === 'imp' && !p.np && !p.nq && !d.v },
      { q: 'اجعل المصباح يضيء في دارة التوازي (أو) مع أن $p$ خاطئة.', hint: 'يكفي أن تكون $q$ صائبة.', init: { op: 'or', p: false, q: false, np: false, nq: false }, check: (p, d) => p.op === 'or' && !p.p && !p.np && d.v },
      { q: 'اجعل $\\sim p \\wedge q$ صائبة.', hint: 'نفي $p$ صائب يعني $p$ خاطئة.', init: { op: 'and', p: true, q: false, np: true, nq: false }, check: (p, d) => p.op === 'and' && p.np && !p.nq && d.v }
    ],
    tutor: [
      { q: 'لماذا تكون الشرطية صائبة عندما تكون المقدمة خاطئة؟', k: ['المقدمه خاطئه', 'الشرطيه', 'صائبه', 'لماذا'], a: () => 'مثال الكتاب (ص 19): «إذا فزت في المسابقة فسأقدم لك جائزة». إذا لم يفز عامر فالمدير لم يُخلف وعده سواء قدّم الجائزة أم لا؛ الوعد يُنقض فقط إذا فاز ولم يحصل على الجائزة.' },
      { q: 'ما الفرق بين (و) و (أو)؟', k: ['الفرق', 'و', 'او'], a: () => '(و) تحتاج المركبتين صائبتين (دارة توالٍ: يجب إغلاق المفتاحين)، و(أو) تكفيها مركبة صائبة واحدة (دارة توازٍ: يكفي مفتاح مغلق).' },
      { q: 'ما قيمة العبارة الآن ولماذا؟', k: ['قيمه', 'الان'], a: (p, d) => 'القيمة الآن ' + (d.v ? 'صائبة' : 'خاطئة') + ' لأن الطرف الأيسر ' + M.tv(d.P) + ' والطرف الأيمن ' + M.tv(d.Q) + ' مع أداة ' + CON[p.op].name + '.' }
    ]
  });

  /* ======================= 1-4 العبارات المتكافئة ======================= */
  const PAIRS = {
    dm1: { L: '\\sim(p \\wedge q)', R: '\\sim p \\vee \\sim q', l: (p, q) => !(p && q), r: (p, q) => !p || !q, name: 'قانون دي مورغان: ~(ف ∧ ن) ≡ ~ف ∨ ~ن', hl: '~(p∧q)', hr: '~p∨~q', page: 24 },
    dm2: { L: '\\sim(p \\vee q)', R: '\\sim p \\wedge \\sim q', l: (p, q) => !(p || q), r: (p, q) => !p && !q, name: 'قانون دي مورغان: ~(ف ∨ ن) ≡ ~ف ∧ ~ن', hl: '~(p∨q)', hr: '~p∧~q', page: 24 },
    contra: { L: 'p \\rightarrow q', R: '\\sim q \\rightarrow \\sim p', l: L.imp, r: (p, q) => L.imp(!q, !p), name: 'المعاكس الإيجابي: ف ← ن ≡ ~ن ← ~ف', hl: 'p→q', hr: '~q→~p', page: 23 },
    impor: { L: 'p \\rightarrow q', R: '\\sim p \\vee q', l: L.imp, r: (p, q) => !p || q, name: 'ف ← ن ≡ ~ف ∨ ن (مثال 4)', hl: 'p→q', hr: '~p∨q', page: 24 },
    negimp: { L: '\\sim(p \\rightarrow q)', R: 'p \\wedge \\sim q', l: (p, q) => !L.imp(p, q), r: (p, q) => p && !q, name: 'نفي الشرطية: ~(ف ← ن) ≡ ف ∧ ~ن', hl: '~(p→q)', hr: 'p∧~q', page: 25 },
    ex3: { L: '(p \\vee q) \\rightarrow q', R: 'p \\rightarrow q', l: (p, q) => L.imp(p || q, q), r: L.imp, name: '(ف ∨ ن) ← ن ≡ ف ← ن (مثال 3)', hl: '(p∨q)→q', hr: 'p→q', page: 26 },
    conv: { L: 'p \\rightarrow q', R: 'q \\rightarrow p', l: L.imp, r: (p, q) => L.imp(q, p), name: 'ف ← ن مقابل ن ← ف (غير متكافئتين)', hl: 'p→q', hr: 'q→p', page: 27 },
    andor: { L: 'p \\wedge q', R: 'p \\vee q', l: L.and, r: L.or, name: 'ف ∧ ن مقابل ف ∨ ن (غير متكافئتين)', hl: 'p∧q', hr: 'p∨q', page: 22 }
  };
  ML.register({
    id: 'equivalence', unit: U, order: 2, lesson: '1-4', lessonTitle: 'العبارات الرياضية المتكافئة', page: 22,
    titleAr: 'العبارات الرياضية المتكافئة', titleEn: 'Equivalent Mathematical Statements', tags: 'تكافؤ دي مورغان معاكس ايجابي نفي الشرطيه',
    formula: 'A \\equiv B \\iff A \\text{ و } B \\text{ لهما نفس قيم الصواب في كل صفوف الجدول}',
    book: 'تكون العبارتان الرياضيتان المركبتان متكافئتين إذا كان لهما نفس قيم الصواب المتناظرة في جدول صوابهما',
    summary: 'نقارن عمودي العبارتين في جدول الصواب: إذا تطابقا في **جميع** الصفوف فهما متكافئتان؛ ويكفي صف واحد مختلف (مثال مضاد) لنفي التكافؤ.',
    vars: [['p, q', 'عبارتان بسيطتان', 'ص أو خ'], ['A, B', 'العبارتان المركبتان المقارنتان', 'من أمثلة الكتاب']],
    params: [
      { key: 'pair', label: 'A \\equiv B ?', type: 'select', value: 'dm1', options: Object.keys(PAIRS).map((k) => [k, PAIRS[k].name]) },
      { key: 'p', label: 'p', type: 'toggle', value: true, on: 'ص', off: 'خ' },
      { key: 'q', label: 'q', type: 'toggle', value: true, on: 'ص', off: 'خ' }
    ],
    custom: true, canvasHint: 'الصفوف المظللة بالأحمر صفوف يختلف فيها الطرفان (أمثلة مضادة). الصف البرتقالي هو قيم p ، q الحالية.',
    compute(p) {
      const P = PAIRS[p.pair];
      const rows = ROWS.map((r) => [r[0], r[1], P.l(r[0], r[1]), P.r(r[0], r[1])]);
      const diff = rows.map((r) => r[2] !== r[3]);
      return { P: P, rows: rows, diff: diff, eq: !diff.some(Boolean), hi: ROWS.findIndex((r) => r[0] === p.p && r[1] === p.q), cur: [P.l(p.p, p.q), P.r(p.p, p.q)] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const y = table(ctx, 10, 20, W - 20, ['p', 'q', d.P.hl, d.P.hr], d.rows, d.hi, c, d.diff);
      txt(ctx, d.eq ? 'العمودان متطابقان في جميع الصفوف ⇐ العبارتان متكافئتان ≡' : 'يوجد صف مختلف على الأقل ⇐ العبارتان غير متكافئتين ≢', W / 2, y + 26, { color: d.eq ? c.c3 : c.c2, rtl: true, size: 15, w: '700' });
    },
    live(p, d) { return d.P.L + (d.eq ? ' \\equiv ' : ' \\not\\equiv ') + d.P.R; },
    results(p, d) {
      const r = [['الحكم', d.eq ? 'متكافئتان' : 'غير متكافئتين', false, d.eq ? 'pos' : 'neg'], ['عند p = ' + M.tv(p.p) + '، q = ' + M.tv(p.q), 'A: ' + M.tv(d.cur[0]) + ' ، B: ' + M.tv(d.cur[1]), false]];
      if (!d.eq) { const i = d.diff.indexOf(true); r.push(['مثال مضاد', 'p = ' + M.tv(ROWS[i][0]) + '، q = ' + M.tv(ROWS[i][1]) + ': A = ' + M.tv(d.rows[i][2]) + ' و B = ' + M.tv(d.rows[i][3]), false, 'neg']); }
      r.push(['المرجع', 'صفحة ' + d.P.page, false]);
      return r;
    },
    steps(p, d) {
      const s = ['نكتب جميع الحالات الأربع لـ $p, q$.', 'نحسب عمود $' + d.P.L + '$ وعمود $' + d.P.R + '$.'];
      s.push(d.eq ? 'القيم المتناظرة متساوية في الصفوف الأربعة ← $' + d.P.L + ' \\equiv ' + d.P.R + '$.' : 'يختلف العمودان في ' + d.diff.filter(Boolean).length + ' صف/صفوف ← غير متكافئتين.');
      if (p.pair === 'negimp') s.push('دون جداول (ص 25): $\\sim(p \\rightarrow q) \\equiv \\sim(\\sim p \\vee q) \\equiv \\sim\\sim p \\wedge \\sim q \\equiv p \\wedge \\sim q$.');
      if (p.pair === 'ex3') s.push('دون جداول (ص 26): $(p \\vee q) \\rightarrow q \\equiv \\sim(p \\vee q) \\vee q \\equiv (\\sim p \\wedge \\sim q) \\vee q \\equiv (\\sim p \\vee q) \\wedge (\\sim q \\vee q) \\equiv \\sim p \\vee q \\equiv p \\rightarrow q$.');
      return s;
    },
    learn: [
      '**تعريف (ص 22):** تكون العبارتان المركبتان متكافئتين إذا كان لهما نفس قيم الصواب المتناظرة في جدول صوابهما، ونكتب $\\equiv$.',
      '**مثال 1 ص 22:** $\\sim(p \\wedge q) \\equiv \\sim p \\vee \\sim q$: لنفي العطف ننفي المركبتين ونحوّل $\\wedge$ إلى $\\vee$. «ليس صحيحاً أن الفول من البقوليات والزعتر نبات طبي» تعني: الفول ليس من البقوليات **أو** الزعتر ليس نباتاً طبياً.',
      '**المعاكس الإيجابي (ص 23):** للعبارة $p \\rightarrow q$ هو $\\sim q \\rightarrow \\sim p$، وهما متكافئتان.',
      '**مثال 4 ص 24:** $p \\rightarrow q \\equiv \\sim p \\vee q$؛ ومنه نفي الشرطية: $\\sim(p \\rightarrow q) \\equiv p \\wedge \\sim q$ (تثبيت المقدمة ونفي التالي).',
      '**خواص (ص 24):** نفي النفي $\\sim(\\sim p) \\equiv p$، قانونا دي مورغان، التبديل، التجميع، والتوزيع — تُستخدم لإثبات التكافؤ دون جداول.'
    ],
    challenges: [
      { q: 'اختر زوجاً **غير** متكافئ، ثم اضبط $p, q$ على صف المثال المضاد.', hint: 'مثلاً $p \\rightarrow q$ و $q \\rightarrow p$ يختلفان عندما $p$ صائبة و $q$ خاطئة.', init: { pair: 'dm1', p: true, q: true }, check: (p, d) => !d.eq && d.cur[0] !== d.cur[1] },
      { q: 'أثبت بالجدول أن $p \\rightarrow q \\equiv \\sim q \\rightarrow \\sim p$.', hint: 'اختر «المعاكس الإيجابي».', init: { pair: 'dm1' }, check: (p, d) => p.pair === 'contra' && d.eq }
    ],
    tutor: [
      { q: 'كيف أنفي العبارة الشرطية؟', k: ['انفي', 'نفي', 'الشرطيه'], a: () => 'نفي «إذا كان $p$ فإن $q$» هو «$p$ وليس $q$»: $\\sim(p \\rightarrow q) \\equiv p \\wedge \\sim q$ — أي نثبت المقدمة وننفي التالي (ص 25).' },
      { q: 'هل العكس يكافئ العبارة الأصلية؟', k: ['العكس', 'المعكوس', 'q → p'], a: () => 'لا. $q \\rightarrow p$ لا تكافئ $p \\rightarrow q$؛ تختلفان عندما $p$ صائبة و $q$ خاطئة. أما المعاكس الإيجابي $\\sim q \\rightarrow \\sim p$ فيكافئها.' },
      { q: 'هل هاتان العبارتان متكافئتان؟', k: ['متكافئتان', 'هل'], a: (p, d) => d.eq ? 'نعم، عمودا الجدول متطابقان في الصفوف الأربعة.' : 'لا؛ يختلفان في ' + d.diff.filter(Boolean).length + ' صف/صفوف (مظللة بالأحمر).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
