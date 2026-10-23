/* رياضيات التاسع — الوحدة الأولى: الأعداد الحقيقية (ص 4–28) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const G = ML.m9;
  const U = 1;

  /* ======================= 1-1 الأعداد الحقيقية ======================= */
  // أعداد نشاط 2 ص 5 ونشاط 3 ص 6 ونشاط 1 ص 4: [المفتاح، نص القائمة، TeX، القيمة، طبيعي، صحيح، نسبي]
  const NUMS = [
    ['m6', '-6', '-6', -6, 0, 1, 1], ['mix', '1 5/9', '1\\tfrac{5}{9}', 14 / 9, 0, 0, 1], ['zero', '0', '0', 0, 0, 1, 1],
    ['rep', '0.232323… (دوري)', '0.\\overline{23}', 23 / 99, 0, 0, 1], ['dec', '0.68', '0.68', 0.68, 0, 0, 1],
    ['r2', '√2', '\\sqrt{2}', Math.SQRT2, 0, 0, 0], ['pi', 'π', '\\pi', Math.PI, 0, 0, 0], ['mr9', '-√9', '-\\sqrt{9}', -3, 0, 1, 1],
    ['f25', '2/5', '\\tfrac{2}{5}', 0.4, 0, 0, 1], ['cr64', '∛64', '\\sqrt[3]{64}', 4, 1, 1, 1], ['nr', '0.1511511115…', '0.1511511115\\ldots', 0.1511511115, 0, 0, 0],
    ['half', '-1/2', '-\\tfrac{1}{2}', -0.5, 0, 0, 1], ['five', '5', '5', 5, 1, 1, 1], ['r23', '2.333… (دوري)', '2.\\overline{3}', 7 / 3, 0, 0, 1], ['mpi', '-π', '-\\pi', -Math.PI, 0, 0, 0],
    ['sea', '1 1/2 (البحر الميت: سنة ونصف)', '1\\tfrac{1}{2}', 1.5, 0, 0, 1]
  ];
  const NUM = (k) => NUMS.find((n) => n[0] === k);
  const SETS = [['ط', 'الأعداد الطبيعية'], ['ص', 'الأعداد الصحيحة'], ['ن', 'الأعداد النسبية'], ['نَ', 'الأعداد غير النسبية'], ['ح', 'الأعداد الحقيقية']];
  G.reg({
    id: 'real-sets', unit: U, order: 1, lesson: '1-1', lessonTitle: 'الأعداد الحقيقية', page: 4,
    titleAr: 'مجموعات الأعداد الحقيقية وخط الأعداد', titleEn: 'Sets of Real Numbers & the Number Line', tags: 'طبيعيه صحيحه نسبيه غير نسبيه حقيقيه شكل فن خط الاعداد عشري دوري جذر باي',
    formula: '\\text{ح} = \\text{ن} \\cup \\text{نَ},\\qquad \\text{ط} \\subset \\text{ص} \\subset \\text{ن} \\subset \\text{ح}',
    book: 'مجموعة الأعداد الحقيقية ح = ن ∪ نَ ؛ ط ⊂ ص ⊂ ن',
    summary: 'اتحاد مجموعة الأعداد النسبية (ن) ومجموعة الأعداد غير النسبية (نَ) يُسمّى مجموعة الأعداد الحقيقية (ح). العدد النسبي يُكتب على صورة كسر بسطه ومقامه عددان صحيحان، وكسره العشري منتهٍ أو دوري؛ وغير النسبي كسره العشري غير منتهٍ وغير دوري مثل $\\sqrt{2}$ و $\\pi$. لكل عدد حقيقي نقطة واحدة على خط الأعداد.',
    vars: [['\\text{ط}', 'مجموعة الأعداد الطبيعية', '$\\{1, 2, 3, \\ldots\\}$'], ['\\text{ص}', 'مجموعة الأعداد الصحيحة', '$\\{\\ldots, -1, 0, 1, \\ldots\\}$'], ['\\text{ن} ، \\text{نَ}', 'النسبية وغير النسبية', 'لا عنصر مشترك بينهما'], ['\\text{ح}', 'مجموعة الأعداد الحقيقية', '$\\text{ن} \\cup \\text{نَ}$']],
    params: [{ key: 'k', label: '\\text{العدد}', type: 'select', value: 'mix', options: G.opts(NUMS.map((n) => [n[0], n[1]])) }],
    custom: true, canvasHint: 'تظهر النقطة داخل أصغر مجموعة ينتمي إليها العدد في شكل ڤن، وفي موقعها على خط الأعداد.',
    compute(p) {
      const n = NUM(p.k); const nat = !!n[4], int = !!n[5], rat = !!n[6];
      return { n: n, v: n[3], mem: [nat, int, rat, !rat, true], inner: nat ? 0 : int ? 1 : rat ? 2 : 3 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const vh = H * 0.62;
      // شكل ڤن: ح يحوي ن (يحوي ص يحوي ط) و نَ
      const bx = 10, by = 10, bw = W - 20, bh = vh - 20;
      const box = (x, y, w, h, lab, on, col) => {
        ctx.save(); ctx.fillStyle = on ? col : 'transparent'; ctx.globalAlpha = 0.13; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = on ? 2.6 : 1.4; ctx.strokeRect(x, y, w, h); ctx.restore();
        G.txt(ctx, lab, x + w - 14, y + 14, { color: col, size: 15, w: '800' });
      };
      box(bx, by, bw, bh, 'ح', true, c.c1);
      const qw = bw * 0.6, qx = bx + bw - qw - 12, qy = by + 30, qh = bh - 42;
      box(qx, qy, qw, qh, 'ن', d.mem[2], c.c3);
      box(qx + qw * 0.12, qy + 30, qw * 0.84, qh - 42, 'ص', d.mem[1], c.c4);
      box(qx + qw * 0.3, qy + 60, qw * 0.62, qh - 84, 'ط', d.mem[0], c.c5);
      const ix = bx + 12, iw = bw - qw - 36;
      box(ix, qy, iw, qh, 'نَ', d.mem[3], c.c2);
      // موقع النقطة داخل أصغر مجموعة
      const spot = [[qx + qw * 0.6, qy + 60 + (qh - 84) / 2 + 8], [qx + qw * 0.2, qy + 30 + (qh - 42) / 2 + 8], [qx + qw * 0.06, qy + qh / 2 + 8], [ix + iw / 2, qy + qh / 2 + 8]][d.inner];
      ctx.fillStyle = c.c6; ctx.beginPath(); ctx.arc(spot[0], spot[1], 7, 0, 7); ctx.fill();
      G.txt(ctx, d.n[1].split(' (')[0], spot[0], spot[1] - 18, { color: c.c6, size: nar ? 12 : 14, w: '800', halo: c.bg });
      // خط الأعداد
      const ly = vh + (H - vh) * 0.45, lx0 = 24, lx1 = W - 24; const lo = -7, hi = 7;
      const XR = (v) => lx0 + (v - lo) / (hi - lo) * (lx1 - lx0); // الموجب يميناً كما في رسم الكتاب
      ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.stroke(); ctx.restore();
      G.arrow(ctx, lx1 - 10, ly, lx1 + 4, ly, c.axis, 2); G.arrow(ctx, lx0 + 10, ly, lx0 - 4, ly, c.axis, 2);
      for (let v = lo + 1; v < hi; v++) { ctx.fillStyle = c.axis; ctx.fillRect(XR(v) - 1, ly - 6, 2, 12); if (!nar || v % 2 === 0) G.txt(ctx, v, XR(v), ly + 18, { color: c.muted, size: 11 }); }
      const px = XR(M.clamp(d.v, lo, hi));
      ctx.fillStyle = c.c6; ctx.beginPath(); ctx.arc(px, ly, 7, 0, 7); ctx.fill();
      G.txt(ctx, d.n[1].split(' (')[0], px, ly - 20, { color: c.c6, size: 13, w: '800', halo: c.bg });
    },
    live(p, d) { return d.n[2] + (d.mem[2] ? ' \\in \\text{ن}' : ' \\in \\text{نَ}') + ' \\subset \\text{ح}'; },
    results(p, d) {
      return SETS.map((s, i) => [s[1] + ' (' + s[0] + ')', d.mem[i] ? 'ينتمي ✔' : 'لا ينتمي ✘', false, d.mem[i] ? 'pos' : 'neg'])
        .concat([['القيمة التقريبية', M.fmt(d.v, 4), false]]);
    },
    steps(p, d) {
      const n = d.n; const s = [];
      if (n[0] === 'mr9') s.push('$-\\sqrt{9} = -3$ عدد صحيح سالب.');
      if (n[0] === 'cr64') s.push('$\\sqrt[3]{64} = 4$ لأن $4 \\times 4 \\times 4 = 64$؛ فهو عدد طبيعي.');
      if (n[0] === 'rep' || n[0] === 'r23') s.push('الكسر العشري الدوري عدد نسبي: ' + (n[0] === 'rep' ? '$0.\\overline{23} = \\tfrac{23}{99}$' : '$2.\\overline{3} = \\tfrac{7}{3}$') + '.');
      s.push(d.mem[2] ? 'يمكن كتابته على صورة $\\tfrac{a}{b}$ حيث $a, b$ عددان صحيحان و $b \\ne 0$ ← نسبي.' : 'كسره العشري غير منتهٍ وغير دوري ← غير نسبي (نَ).');
      s.push('كل عدد نسبي أو غير نسبي هو عدد حقيقي: $\\text{ح} = \\text{ن} \\cup \\text{نَ}$.');
      return s;
    },
    explain(a, b, da, db) {
      if (!da || da.inner === db.inner) return [];
      return ['انتقل العدد إلى مجموعة ' + SETS[db.inner][1] + ' (' + SETS[db.inner][0] + ')' + (db.inner < 3 ? '؛ وهو ينتمي أيضاً إلى كل مجموعة أكبر تحويها.' : '؛ وهي لا تشترك بأي عنصر مع ن.')];
    },
    learn: [
      '**نشاط 1 ص 4:** يتناقص سطح البحر الميت قرابة متر سنوياً؛ في سنة ونصف يتناقص $1\\tfrac{1}{2}$ متر، وهو عدد نسبي.',
      '**تعريف (ص 4):** ح = ن ∪ نَ، حيث ص مجموعة الأعداد الصحيحة و ط مجموعة الأعداد الطبيعية، وتُمثَّل بأشكال ڤن.',
      '**نشاط 2 ص 5:** تصنيف $-6 ، 1\\tfrac{5}{9} ، 0 ، 0.\\overline{23} ، 0.68 ، \\sqrt{2} ، \\pi ، -\\sqrt{9} ، \\tfrac{2}{5} ، \\sqrt[3]{64} ، 0.1511511115\\ldots$ حسب مجموعاتها.',
      '**نشاط 3 ص 6:** تمثيل $-\\tfrac{1}{2} ، 5 ، 2.\\overline{3} ، -\\pi$ على خط الأعداد.',
      '**نشاط 4 ص 6:** نجد طول الوتر بنظرية فيثاغورس فيظهر طول غير نسبي مثل $\\sqrt{29}$ إذا كان الضلعان 2 سم و 5 سم.'
    ],
    challenges: [
      { q: 'اختر عدداً **صحيحاً** ليس **طبيعياً** من القائمة.', hint: 'الأعداد الصحيحة السالبة أو الصفر.', init: { k: 'five' }, check: (p, d) => d.mem[1] && !d.mem[0] },
      { q: 'اختر عدداً **غير نسبي سالباً**.', hint: 'من نشاط 3 ص 6.', init: { k: 'pi' }, check: (p, d) => d.mem[3] && d.v < 0 },
      { q: 'اختر كسراً عشرياً **دورياً** وبيّن مجموعته.', hint: 'الكسر الدوري نسبي.', init: { k: 'r2' }, check: (p) => p.k === 'rep' || p.k === 'r23', why: () => 'الكسر العشري الدوري يمكن كتابته على صورة كسر، فهو عدد نسبي.' }
    ],
    tutor: [
      { q: 'هل √2 عدد نسبي؟', k: ['جذر 2', 'نسبي', '√2'], a: () => 'لا. $\\sqrt{2} = 1.41421356\\ldots$ كسره العشري غير منتهٍ وغير دوري، فهو غير نسبي (نَ)، لكنه عدد حقيقي وله نقطة على خط الأعداد.' },
      { q: 'ما الفرق بين ص و ط؟', k: ['الفرق', 'صحيحه', 'طبيعيه'], a: () => 'ط = {1، 2، 3، …}، و ص تضيف إليها الصفر والأعداد السالبة؛ لذلك ط ⊂ ص.' },
      { q: 'إلى أي مجموعة ينتمي العدد الحالي؟', k: ['ينتمي', 'الحالي', 'مجموعه'], a: (p, d) => 'العدد $' + d.n[2] + '$ ينتمي إلى: ' + SETS.filter((s, i) => d.mem[i]).map((s) => s[0]).join(' ، ') + '.' }
    ]
  });

  /* ======================= 1-2 جمع الأعداد الحقيقية وطرحها ======================= */
  const term = (c, r) => { const s = G.simplifyRoot(r); return { c: c, r: r, out: c * s[0], in: s[1] }; };
  G.reg({
    id: 'like-radicals', unit: U, order: 2, lesson: '1-2', lessonTitle: 'جمع الأعداد الحقيقية وطرحها', page: 7,
    titleAr: 'جمع الجذور المتشابهة وطرحها', titleEn: 'Adding & Subtracting Like Radicals', tags: 'جذور متشابهه تبسيط جمع طرح حدود متشابهه جذر تربيعي',
    formula: 'a\\sqrt{n} + b\\sqrt{n} = (a + b)\\sqrt{n},\\qquad a - b = a + (-b)',
    book: 'أ – ب = أ + (–ب) ؛ نجمع الحدود المتشابهة بعد تبسيطها',
    summary: 'نبسّط كل جذر بإخراج أكبر مربع كامل: $\\sqrt{45} = \\sqrt{9 \\times 5} = 3\\sqrt{5}$، ثم نجمع معاملات الجذور المتشابهة (نفس ما تحت الجذر) كما نجمع الحدود الجبرية المتشابهة.',
    vars: [['a, b, c, d', 'معاملات الحدود', 'أعداد صحيحة من $-9$ إلى $9$'], ['n', 'العدد تحت الجذر', 'من 1 إلى 100']],
    params: [
      { key: 'a', label: 'a', min: -9, max: 9, step: 1, value: 1, int: true }, { key: 'n1', label: 'n_1', min: 1, max: 100, step: 1, value: 45, int: true },
      { key: 'b', label: 'b', min: -9, max: 9, step: 1, value: 6, int: true }, { key: 'n2', label: 'n_2', min: 1, max: 100, step: 1, value: 5, int: true },
      { key: 'c', label: 'c', min: -9, max: 9, step: 1, value: -1, int: true }, { key: 'n3', label: 'n_3', min: 1, max: 100, step: 1, value: 20, int: true },
      { key: 'dd', label: 'd', min: -9, max: 9, step: 1, value: -1, int: true }, { key: 'n4', label: 'n_4', min: 1, max: 100, step: 1, value: 25, int: true }
    ],
    custom: true, canvasHint: 'كل لون يمثّل نوعاً من الجذور المتشابهة؛ طول الشريط = المعامل بعد التبسيط.',
    compute(p) {
      const T = [term(p.a, p.n1), term(p.b, p.n2), term(p.c, p.n3), term(p.dd, p.n4)];
      const groups = {};
      T.forEach((t) => { groups[t.in] = (groups[t.in] || 0) + t.out; });
      const keys = Object.keys(groups).map(Number).sort((x, y) => x - y);
      const val = T.reduce((s, t) => s + t.c * Math.sqrt(t.r), 0);
      const res = keys.filter((k) => groups[k] !== 0).sort((x, y) => (x === 1) - (y === 1) || y - x).map((k) => [groups[k], k]);
      return { T: T, groups: groups, keys: keys, res: res, val: val, rational: res.every((r) => r[1] === 1) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const cols = [c.c1, c.c3, c.c4, c.c5, c.c6, c.c2];
      const colOf = (k) => cols[d.keys.indexOf(k) % cols.length];
      const rowH = Math.min(46, (H * 0.55) / 4);
      d.T.forEach((t, i) => {
        const y = 24 + i * rowH; const col = colOf(t.in);
        const orig = (t.c < 0 ? '-' : '+') + ' ' + (Math.abs(t.c) === 1 ? '' : Math.abs(t.c)) + '√' + t.r;
        const simp = t.in === 1 ? String(t.out) : (t.out === 1 ? '' : t.out === -1 ? '-' : t.out) + '√' + t.in;
        G.txt(ctx, orig, W - 16, y, { align: 'right', color: c.text, size: nar ? 13 : 16, w: '700' });
        G.txt(ctx, '=', W * 0.58, y, { color: c.muted, size: 15 });
        G.txt(ctx, simp, W * 0.42, y, { color: col, size: nar ? 14 : 17, w: '800' });
      });
      // أشرطة المجموعات
      const by = 24 + 4 * rowH + 10; const unit = Math.min(18, (W - 60) / 40);
      d.keys.forEach((k, j) => {
        const y = by + j * 30; const col = colOf(k); let x = W / 2;
        d.T.filter((t) => t.in === k).forEach((t) => {
          const w = t.out * unit; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = t.out < 0 ? 0.35 : 0.8;
          ctx.fillRect(w < 0 ? x + w : x, y - 9, Math.abs(w), 18); ctx.restore(); x += w;
        });
        ctx.fillStyle = c.axis; ctx.fillRect(W / 2 - 1, y - 12, 2, 24);
        const g = d.groups[k];
        G.txt(ctx, (k === 1 ? 'أعداد نسبية: ' + g : 'حدود √' + k + ': ' + (g === 1 ? '' : g) + '√' + k), 14, y, { align: 'left', color: col, size: 12, w: '700' });
      });
      const ry = Math.min(H - 20, by + d.keys.length * 30 + 22);
      const resStr = d.res.length ? d.res.map((r, i) => (i ? (r[0] < 0 ? ' - ' : ' + ') : r[0] < 0 ? '-' : '') + (r[1] === 1 ? Math.abs(r[0]) : (Math.abs(r[0]) === 1 ? '' : Math.abs(r[0])) + '√' + r[1])).join('') : '0';
      G.txt(ctx, 'الناتج = ' + resStr, W / 2, ry, { color: c.c2, size: nar ? 15 : 18, w: '800' });
    },
    live(p, d) {
      const lhs = d.T.map((t, i) => (i ? (t.c < 0 ? ' - ' : ' + ') : t.c < 0 ? '-' : '') + G.rootTeX(Math.abs(t.c), t.r).replace(/^1\\sqrt/, '\\sqrt')).join('');
      return lhs + ' = ' + resTeX(d.res);
    },
    results(p, d) {
      return [['بعد التبسيط', d.T.map((t, i) => (i && t.out >= 0 ? '+' : '') + G.rootTeX(t.out, t.in)).join(' ')], ['الناتج بأبسط صورة', resTeX(d.res)], ['القيمة التقريبية', M.fmt(d.val, 4)], ['نوع الناتج', d.rational ? 'عدد نسبي' : 'عدد غير نسبي', false, d.rational ? 'pos' : '']];
    },
    steps(p, d) {
      const s = d.T.filter((t) => t.in !== t.r && t.r > 1).map((t) => '$\\sqrt{' + t.r + '} = \\sqrt{' + (t.r / t.in) + ' \\times ' + t.in + '} = ' + G.rootTeX(t.r === t.in ? 1 : Math.sqrt(t.r / t.in), t.in) + '$');
      s.push('نجمع معاملات الحدود المتشابهة: ' + d.keys.map((k) => (k === 1 ? 'الأعداد النسبية: $' + d.groups[k] + '$' : 'حدود $\\sqrt{' + k + '}$: $' + G.rootTeX(d.groups[k], k) + '$')).join('، ') + '.');
      s.push('الناتج: $' + resTeX(d.res) + '$.');
      return s;
    },
    explain(a, b, da, db) { return da && da.rational !== db.rational ? [db.rational ? 'اختفت الجذور: معاملات كل جذر متشابه مجموعها صفر، فالناتج عدد نسبي.' : 'ظهر جذر غير مبسّط إلى عدد صحيح، فالناتج غير نسبي.'] : []; },
    learn: [
      '**تعريف ص 7:** لأي عددين حقيقيين $a, b$: $a - b = a + (-b)$.',
      '**نشاط 2 ص 7:** $\\sqrt{45} + 6\\sqrt{5} - \\sqrt{20} - \\sqrt{25} = 3\\sqrt{5} + 6\\sqrt{5} - 2\\sqrt{5} - 5 = 7\\sqrt{5} - 5$؛ «أجمع الحدود المتشابهة بعد تبسيطها».',
      '**نشاط 4 ص 8:** خواص الجمع في ح: الإغلاق، التبديل، التجميع، العنصر المحايد (الصفر)، والنظير الجمعي.',
      '**تمارين ص 9:** إذا كان $x + \\sqrt{2} = \\sqrt{50}$ فإن $x = 5\\sqrt{2} - \\sqrt{2} = 4\\sqrt{2}$.'
    ],
    challenges: [
      { q: 'مثّل $\\sqrt{50} - \\sqrt{2}$ (تمرين ص 9) واقرأ قيمة $x$.', hint: 'الحد الأول $\\sqrt{50}$، والثاني $-\\sqrt{2}$، والباقيان صفر.', init: { a: 1, n1: 45, b: 6, n2: 5, c: -1, n3: 20, dd: -1, n4: 25 }, check: (p, d) => d.res.length === 1 && d.res[0][0] === 4 && d.res[0][1] === 2 },
      { q: 'اجعل الناتج **عدداً نسبياً** مع بقاء ثلاثة جذور غير مربعة على الأقل في الطرف الأيسر.', hint: 'مثلاً $\\sqrt{8} + \\sqrt{18} - 5\\sqrt{2}$.', init: { a: 1, n1: 45, b: 6, n2: 5, c: -1, n3: 20, dd: -1, n4: 25 }, check: (p, d) => d.rational && d.T.filter((t) => t.c !== 0 && t.in > 1).length >= 3 }
    ],
    tutor: [
      { q: 'كيف أبسّط √45؟', k: ['ابسط', 'تبسيط', '45'], a: () => 'نبحث عن أكبر مربع كامل يقسم 45 وهو 9: $\\sqrt{45} = \\sqrt{9 \\times 5} = \\sqrt{9}\\sqrt{5} = 3\\sqrt{5}$.' },
      { q: 'هل أجمع √2 + √3 = √5؟', k: ['√5', 'اجمع', 'مختلفه'], a: () => 'لا. $\\sqrt{2} + \\sqrt{3} \\approx 3.15$ بينما $\\sqrt{5} \\approx 2.24$. نجمع الجذور **المتشابهة** فقط.' },
      { q: 'ما الناتج الحالي؟', k: ['الناتج', 'الحالي'], a: (p, d) => 'الناتج بأبسط صورة $' + resTeX(d.res) + '$ وقيمته التقريبية $' + M.fmt(d.val, 3) + '$.' }
    ]
  });
  function resTeX(res) {
    if (!res.length) return '0';
    return res.map((r, i) => (i ? (r[0] < 0 ? ' - ' : ' + ') : r[0] < 0 ? '-' : '') + G.rootTeX(Math.abs(r[0]), r[1])).join('');
  }
  G.resTeX = resTeX;

  /* ======================= 1-2 تمرين: سرعة الصوت ======================= */
  G.reg({
    id: 'sound-speed', unit: U, order: 3, lesson: '1-2', lessonTitle: 'جمع الأعداد الحقيقية وطرحها (تمارين)', page: 9,
    titleAr: 'سرعة الصوت في الهواء ودرجة الحرارة', titleEn: 'Speed of Sound vs Temperature', tags: 'سرعه الصوت درجه الحراره جذر تربيعي اقتران',
    formula: 'v = 20\\sqrt{273 + x}',
    book: 'ع = ٢٠ √(٢٧٣ + س) ، حيث س درجة الحرارة السلسيوسية',
    ar: { v: 'ع' },
    summary: 'تعطي القاعدة سرعة الصوت في الهواء (م/ث) بدلالة درجة الحرارة س؛ نعوّض ثم نبسّط الجذر أو نقرّبه.',
    vars: [['x', 'درجة الحرارة (°س)', 'من $-100$ إلى $100$'], ['v', 'سرعة الصوت (م/ث)', '$v > 0$']],
    params: [{ key: 'x', label: 'x', min: -100, max: 100, step: 1, value: 37, int: true, desc: 'درجة الحرارة °س' }],
    play: { key: 'x', speed: 20 },
    plot: { view: { xmin: -110, xmax: 110, ymin: -20, ymax: 420 }, equal: false },
    compute(p) { const u = 273 + p.x; const s = G.simplifyRoot(u); return { u: u, v: 20 * Math.sqrt(u), s: s }; },
    draw(P, p, d) {
      const c = P.colors();
      P.fn((x) => 20 * Math.sqrt(273 + x), { color: c.c1, width: 3, domain: [-110, 110] });
      P.segment(p.x, 0, p.x, d.v, { color: c.muted, dash: [5, 5] });
      P.point(p.x, d.v, { color: c.c2, r: 6, label: '(' + p.x + ' ، ' + M.fmt(d.v, 1) + ')' });
      [37, -50].forEach((t) => P.point(t, 20 * Math.sqrt(273 + t), { color: c.c4, r: 4 }));
    },
    live(p, d) { return 'v = 20\\sqrt{273 ' + (p.x < 0 ? '- ' + (-p.x) : '+ ' + p.x) + '} = 20\\sqrt{' + d.u + '} ' + (d.s[0] > 1 ? '= ' + G.rootTeX(20 * d.s[0], d.s[1]) + ' ' : '') + '\\approx ' + M.fmt(d.v, 1); },
    results(p, d) { return [['ما تحت الجذر', String(d.u)], ['بأبسط صورة', G.rootTeX(20 * d.s[0], d.s[1])], ['السرعة التقريبية', M.fmt(d.v, 1) + ' م/ث', false]]; },
    steps(p, d) { return ['نعوّض $x = ' + p.x + '$: $273 ' + (p.x < 0 ? '- ' + (-p.x) : '+ ' + p.x) + ' = ' + d.u + '$.', d.s[0] > 1 ? '$\\sqrt{' + d.u + '} = ' + G.rootTeX(d.s[0], d.s[1]) + '$، فالسرعة $' + G.rootTeX(20 * d.s[0], d.s[1]) + '$.' : 'العدد ' + d.u + ' لا يحوي مربعاً كاملاً غير 1.', '$v \\approx ' + M.fmt(d.v, 1) + '$ م/ث.']; },
    explain(a, b, da, db) { return da && Math.sign(db.v - da.v) ? [(db.v > da.v ? 'ارتفعت' : 'انخفضت') + ' درجة الحرارة فزاد ما تحت الجذر ' + (db.v > da.v ? '' : 'نقصاً ') + 'وتغيّرت السرعة إلى ' + M.fmt(db.v, 1) + ' م/ث.'] : []; },
    learn: ['**تمرين ص 9:** سرعة الصوت $v = 20\\sqrt{273 + x}$؛ احسبها عند $x = 37$ (حرارة جسم الإنسان) و $x = -50$.', 'كلما ارتفعت درجة الحرارة زادت سرعة الصوت، لكن الزيادة تتباطأ لأن الاقتران جذري.'],
    challenges: [
      { q: 'احسب سرعة الصوت عند $x = -50$ (تمرين ص 9).', hint: 'حرّك المنزلق إلى $-50$.', init: { x: 0 }, check: (p) => p.x === -50, why: (p, d) => '$v = 20\\sqrt{223} \\approx ' + M.fmt(d.v, 1) + '$ م/ث.' },
      { q: 'اجعل ما تحت الجذر مربعاً كاملاً فتصبح السرعة عدداً صحيحاً.', hint: '$273 + x = 289 = 17^2$.', init: { x: 0 }, check: (p, d) => M.isInt(Math.sqrt(d.u)) }
    ],
    tutor: [
      { q: 'لماذا تزيد السرعة مع الحرارة؟', k: ['لماذا', 'تزيد'], a: () => 'لأن ما تحت الجذر $273 + x$ يزيد بزيادة $x$، والجذر التربيعي اقتران متزايد.' },
      { q: 'ما السرعة الآن؟', k: ['السرعه', 'الان'], a: (p, d) => 'عند $x = ' + p.x + '$: $v = 20\\sqrt{' + d.u + '} \\approx ' + M.fmt(d.v, 1) + '$ م/ث.' }
    ]
  });

  /* ======================= 1-3 ضرب الأعداد الحقيقية وقسمتها ======================= */
  const MODES = [['mul', 'الضرب: √أ × √ب'], ['div', 'القسمة: √أ ÷ √ب'], ['rat', 'إنطاق المقام: أ ÷ √ب'], ['conj', 'المرافق: أ ÷ (جـ − √ب)']];
  G.reg({
    id: 'radical-ops', unit: U, order: 4, lesson: '1-3', lessonTitle: 'ضرب الأعداد الحقيقية وقسمتها', page: 10,
    titleAr: 'ضرب الجذور وقسمتها وإنطاق المقام', titleEn: 'Multiplying, Dividing Radicals & Rationalizing', tags: 'ضرب قسمه جذور انطاق المقام مرافق مساحه مستطيل',
    formula: '\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab},\\quad \\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}},\\quad \\frac{a}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}',
    book: '√أ × √ب = √(أب) ، √أ ÷ √ب = √(أ ÷ ب) ؛ إنطاق المقام: تحويل الجذر الأصم في المقام إلى عدد نسبي',
    summary: 'حاصل ضرب جذرين تربيعيين يساوي جذر حاصل ضربهما (مستطيل بُعداه $\\sqrt{a}$ و $\\sqrt{b}$ مساحته $\\sqrt{ab}$). ولإنطاق المقام نضرب البسط والمقام في الجذر نفسه، أو في **المرافق** $c + \\sqrt{b}$ إذا كان المقام $c - \\sqrt{b}$ لأن $(c - \\sqrt{b})(c + \\sqrt{b}) = c^2 - b$.',
    vars: [['a', 'العدد الأول (أو البسط)', 'عدد صحيح موجب'], ['b', 'العدد تحت الجذر', 'عدد صحيح موجب'], ['c', 'الحد النسبي في المقام (المرافق)', 'عدد صحيح، $c^2 \\ne b$']],
    params: [
      { key: 'mode', label: '\\text{العملية}', type: 'select', value: 'mul', options: MODES },
      { key: 'a', label: 'a', min: 1, max: 300, step: 1, value: 250, int: true },
      { key: 'b', label: 'b', min: 1, max: 300, step: 1, value: 90, int: true },
      { key: 'c', label: 'c', min: -9, max: 9, step: 1, value: 2, int: true }
    ],
    custom: true, canvasHint: 'في الضرب والقسمة: المستطيل بُعداه √أ و √ب. في الإنطاق: الصيغتان متساويتان على خط الأعداد.',
    compute(p) {
      const a = p.a, b = p.b, c = p.c; const r = { mode: p.mode };
      if (p.mode === 'mul') { r.val = Math.sqrt(a * b); r.s = G.simplifyRoot(a * b); r.tex = G.rootTeX(r.s[0], r.s[1]); }
      else if (p.mode === 'div') { r.val = Math.sqrt(a / b); const g = M.gcd(a, b); const n = a / g, dd = b / g; const sn = G.simplifyRoot(n * dd); r.n = n; r.dd = dd; r.tex = dd === 1 ? G.rootTeX(G.simplifyRoot(n)[0], G.simplifyRoot(n)[1]) : fracTeX(sn[0], sn[1], dd); }
      else if (p.mode === 'rat') { r.val = a / Math.sqrt(b); const s = G.simplifyRoot(b); r.s = s; r.tex = fracTeX(a, s[1], s[0] * s[1]); }
      else { const den = c * c - b; r.den = den; r.val = den === 0 ? NaN : a / (c - Math.sqrt(b)); r.tex = den === 0 ? '\\text{غير معرّف}' : conjTeX(a, c, b, den); }
      r.ok = Number.isFinite(r.val);
      return r;
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (p.mode === 'mul' || p.mode === 'div') {
        const sa = Math.sqrt(p.a), sb = Math.sqrt(p.b); const k = Math.min((W - 80) / Math.max(sa, sb, 1) * 0.9, (H - 120) / Math.max(sa, sb, 1) * 0.9) * 0.9;
        const w = sb * k, h = sa * k; const x = (W - w) / 2, y = 40;
        ctx.save(); ctx.fillStyle = c.c1; ctx.globalAlpha = 0.15; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; ctx.strokeStyle = c.c1; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h); ctx.restore();
        G.txt(ctx, '√' + p.b, x + w / 2, y - 14, { color: c.c3, size: 14, w: '800' });
        G.txt(ctx, '√' + p.a, x + w + 26, y + h / 2, { color: c.c4, size: 14, w: '800' });
        G.txt(ctx, p.mode === 'mul' ? 'المساحة = √' + (p.a * p.b) + ' ≈ ' + M.fmt(d.val, 3) : 'الطول ÷ العرض = √' + p.a + ' ÷ √' + p.b + ' ≈ ' + M.fmt(d.val, 3), W / 2, Math.min(H - 20, y + h + 30), { color: c.c2, size: nar ? 13 : 16, w: '800' });
        return;
      }
      // خط أعداد: الصيغة الأصلية والصيغة بعد الإنطاق تقعان على النقطة نفسها
      const ly = H * 0.55, lx0 = 30, lx1 = W - 30; const v = d.ok ? d.val : 0; const span = Math.max(2, Math.ceil(Math.abs(v) * 1.3));
      const X = (t) => lx0 + (t + span) / (2 * span) * (lx1 - lx0);
      ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.stroke(); ctx.restore();
      const st = Math.max(1, Math.round(span / 5));
      for (let t = -span; t <= span; t += st) { ctx.fillStyle = c.axis; ctx.fillRect(X(t) - 1, ly - 5, 2, 10); G.txt(ctx, t, X(t), ly + 16, { color: c.muted, size: 11 }); }
      if (d.ok) {
        ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(X(v), ly, 7, 0, 7); ctx.fill();
        const orig = p.mode === 'rat' ? p.a + ' ÷ √' + p.b : p.a + ' ÷ (' + p.c + ' - √' + p.b + ')';
        G.txt(ctx, orig, X(v), ly - 56, { color: c.c4, size: nar ? 13 : 15, w: '800', halo: c.bg });
        G.txt(ctx, '≈ ' + M.fmt(v, 4), X(v), ly - 32, { color: c.c2, size: 14, w: '800', halo: c.bg });
      } else G.txt(ctx, 'المقام صفر: c² = b', W / 2, ly - 40, { color: c.c2, size: 15, w: '800' });
      G.txt(ctx, p.mode === 'rat' ? 'نضرب البسط والمقام في √' + p.b : 'نضرب البسط والمقام في المرافق (' + p.c + ' + √' + p.b + ')', W / 2, 28, { color: c.text, size: nar ? 12 : 14, w: '700' });
    },
    live(p, d) {
      const L = { mul: '\\sqrt{' + p.a + '} \\times \\sqrt{' + p.b + '} = \\sqrt{' + p.a * p.b + '}', div: '\\frac{\\sqrt{' + p.a + '}}{\\sqrt{' + p.b + '}}', rat: '\\frac{' + p.a + '}{\\sqrt{' + p.b + '}}', conj: '\\frac{' + p.a + '}{' + p.c + ' - \\sqrt{' + p.b + '}}' }[p.mode];
      return L + ' = ' + d.tex;
    },
    results(p, d) {
      const r = [['الناتج بأبسط صورة', d.tex], ['القيمة التقريبية', d.ok ? M.fmt(d.val, 4) : '—', false]];
      if (p.mode === 'conj') r.push(['حاصل ضرب المقام في مرافقه', '(' + p.c + ' - \\sqrt{' + p.b + '})(' + p.c + ' + \\sqrt{' + p.b + '}) = ' + p.c + '^2 - ' + p.b + ' = ' + d.den]);
      if (p.mode === 'mul') r.push(['هل الناتج نسبي؟', d.s[1] === 1 ? 'نعم، $' + p.a * p.b + '$ مربع كامل' : 'لا', false, d.s[1] === 1 ? 'pos' : '']);
      return r;
    },
    steps(p, d) {
      if (p.mode === 'mul') return ['$\\sqrt{' + p.a + '} \\times \\sqrt{' + p.b + '} = \\sqrt{' + p.a + ' \\times ' + p.b + '} = \\sqrt{' + p.a * p.b + '}$', 'نُخرج أكبر مربع كامل: $\\sqrt{' + p.a * p.b + '} = ' + d.tex + '$.'];
      if (p.mode === 'div') return ['$\\frac{\\sqrt{' + p.a + '}}{\\sqrt{' + p.b + '}} = \\sqrt{\\frac{' + p.a + '}{' + p.b + '}}$', 'نبسّط الكسر ثم ننطق المقام إن لزم: $' + d.tex + '$.'];
      if (p.mode === 'rat') return ['نضرب في $\\frac{\\sqrt{' + p.b + '}}{\\sqrt{' + p.b + '}}$ (وهو يساوي 1): $\\frac{' + p.a + '\\sqrt{' + p.b + '}}{' + p.b + '}$', 'نبسّط: $' + d.tex + '$.'];
      return d.ok ? ['نضرب البسط والمقام في المرافق $' + p.c + ' + \\sqrt{' + p.b + '}$.', 'المقام: $' + p.c + '^2 - ' + p.b + ' = ' + d.den + '$ عدد نسبي.', 'الناتج: $' + d.tex + '$.'] : ['$c^2 = b$ فالمقام $c - \\sqrt{b} = 0$ ولا تعرّف القسمة.'];
    },
    explain(a, b) { return a.mode !== b.mode ? [{ mul: 'الضرب: $\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$ لكل عددين غير سالبين.', div: 'القسمة: $\\sqrt{a} \\div \\sqrt{b} = \\sqrt{a \\div b}$ حيث $b \\ne 0$.', rat: 'إنطاق المقام: نتخلّص من الجذر الأصم في المقام بالضرب في الجذر نفسه.', conj: 'المرافق: $(c - \\sqrt{b})(c + \\sqrt{b}) = c^2 - b$ عدد نسبي.' }[b.mode]] : []; },
    learn: [
      '**نشاط 2 ص 10:** $\\sqrt{250} \\times \\sqrt{90} = \\sqrt{22500} = 150$.',
      '**خواص الضرب (ص 11):** الإغلاق، التبديل، التجميع، العنصر المحايد (1)، النظير الضربي، وتوزيع الضرب على الجمع.',
      '**نشاط ص 12:** شبه منحرف طولا قاعدتيه $\\sqrt{12}$ و $2$ وارتفاعه $\\sqrt{3}$: مساحته $\\tfrac{1}{2}(\\sqrt{12} + 2)\\sqrt{3} = 3 + \\sqrt{3}$.',
      '**إنطاق المقام (ص 13):** $\\frac{15}{\\sqrt{6}} = \\frac{15\\sqrt{6}}{6} = \\frac{5\\sqrt{6}}{2}$، و $\\frac{1}{2 - \\sqrt{7}} = \\frac{2 + \\sqrt{7}}{4 - 7} = -\\frac{2 + \\sqrt{7}}{3}$.',
      '**تمرين ص 14:** حلّ $5 + \\sqrt{3}x = 2x$: $x(2 - \\sqrt{3}) = 5$ ومنه $x = \\frac{5}{2 - \\sqrt{3}} = 10 + 5\\sqrt{3}$.'
    ],
    challenges: [
      { q: 'أنطق مقام $\\frac{15}{\\sqrt{6}}$ (نشاط 8 ص 13).', hint: 'اختر «إنطاق المقام» و $a = 15$ ، $b = 6$.', init: { mode: 'mul', a: 250, b: 90, c: 2 }, check: (p) => p.mode === 'rat' && p.a === 15 && p.b === 6, why: () => '$\\frac{15\\sqrt{6}}{6} = \\frac{5\\sqrt{6}}{2}$.' },
      { q: 'حلّ $5 + \\sqrt{3}x = 2x$ بإيجاد $\\frac{5}{2 - \\sqrt{3}}$.', hint: 'المرافق: $a = 5$ ، $c = 2$ ، $b = 3$.', init: { mode: 'rat', a: 1, b: 2, c: 1 }, check: (p) => p.mode === 'conj' && p.a === 5 && p.c === 2 && p.b === 3, why: () => '$x = 5(2 + \\sqrt{3}) = 10 + 5\\sqrt{3}$ لأن المقام $4 - 3 = 1$.' },
      { q: 'اختر عددين غير مربعين حاصل ضرب جذريهما **عدد صحيح**.', hint: 'مثل $\\sqrt{250} \\times \\sqrt{90}$ أو $\\sqrt{2} \\times \\sqrt{8}$.', init: { mode: 'mul', a: 2, b: 3, c: 2 }, check: (p, d) => p.mode === 'mul' && d.s[1] === 1 && !M.isInt(Math.sqrt(p.a)) && !M.isInt(Math.sqrt(p.b)) }
    ],
    tutor: [
      { q: 'ما المرافق ولماذا نستخدمه؟', k: ['المرافق', 'لماذا'], a: () => 'مرافق $c - \\sqrt{b}$ هو $c + \\sqrt{b}$، وحاصل ضربهما $c^2 - b$ خالٍ من الجذور، فيصبح المقام عدداً نسبياً.' },
      { q: 'هل √أ + √ب = √(أ + ب)؟', k: ['جمع', 'هل'], a: () => 'لا؛ الخاصية للضرب والقسمة فقط: $\\sqrt{9} + \\sqrt{16} = 7$ بينما $\\sqrt{25} = 5$.' },
      { q: 'ما ناتج العملية الحالية؟', k: ['ناتج', 'الحاليه'], a: (p, d) => 'الناتج $' + d.tex + '$' + (d.ok ? ' ≈ $' + M.fmt(d.val, 3) + '$' : '') + '.' }
    ]
  });
  function fracTeX(coef, rad, den) {
    // coef√rad / den بأبسط صورة
    const g = M.gcd(coef, den); const n = coef / g, dd = den / g; const top = G.rootTeX(n, rad);
    return dd === 1 ? top : '\\frac{' + top + '}{' + dd + '}';
  }
  function conjTeX(a, c, b, den) {
    // a(c + √b) / den
    const s = G.simplifyRoot(b); const k = s[0], r = s[1];
    if (r === 1) return M.texFrac(a / (c - k));
    let A = a * c, B = a * k, D = den; if (D < 0) { A = -A; B = -B; D = -D; }
    const g = M.gcd(M.gcd(Math.abs(A), Math.abs(B)), D) || 1; A /= g; B /= g; D /= g;
    const num = (A ? A + (B < 0 ? ' - ' : ' + ') : B < 0 ? '-' : '') + G.rootTeX(Math.abs(B), r);
    return D === 1 ? num : '\\frac{' + num + '}{' + D + '}';
  }
  G.conjTeX = conjTeX;

  /* ======================= 1-4 القيمة المطلقة ======================= */
  G.reg({
    id: 'absolute-value', unit: U, order: 5, lesson: '1-4', lessonTitle: 'القيمة المطلقة', page: 15,
    titleAr: 'القيمة المطلقة وحلّ المعادلة س² = ك', titleEn: 'Absolute Value & Solving x² = k', tags: 'قيمه مطلقه بعد عن الصفر جذر مربع معادله جبل الشيخ البحر الميت',
    formula: '|a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases},\\qquad \\sqrt{x^2} = |x|',
    book: '|أ| = أ إذا كان أ ≥ ٠ ، |أ| = –أ إذا كان أ < ٠ ؛ √(س²) = |س|',
    summary: 'القيمة المطلقة للعدد الحقيقي هي عدد الوحدات التي يبعدها عن الصفر على خط الأعداد، فهي غير سالبة دائماً. ولأن $\\sqrt{x^2} = |x|$ فإن المعادلة $(x + h)^2 = k$ حيث $k > 0$ لها حلّان: $x = -h \\pm \\sqrt{k}$.',
    vars: [['x', 'العدد الحقيقي', 'من $-10$ إلى $10$'], ['h', 'الإزاحة داخل المربع', 'عدد صحيح'], ['k', 'الطرف الأيمن للمعادلة', '$k \\ge 0$']],
    params: [
      { key: 'x', label: 'x', min: -10, max: 10, step: 0.5, value: -3 },
      { key: 'h', label: 'h', min: -9, max: 9, step: 1, value: 7, int: true },
      { key: 'k', label: 'k', min: 0, max: 50, step: 1, value: 20, int: true }
    ],
    plot: { view: { xmin: -16, xmax: 10, ymin: -3, ymax: 24 }, equal: false },
    compute(p) {
      const s = G.simplifyRoot(p.k); const r = Math.sqrt(p.k);
      return { abs: Math.abs(p.x), sols: p.k === 0 ? [-p.h] : [-p.h - r, -p.h + r], s: s };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn((x) => Math.abs(x), { color: c.c1, width: 3 });
      P.fn((x) => (x + p.h) * (x + p.h), { color: c.c5, width: 2.5 });
      P.hline(p.k, { color: c.c4, width: 2, dash: [6, 5] });
      P.segment(0, 0, p.x, 0, { color: c.c2, width: 5 });
      P.point(p.x, d.abs, { color: c.c2, r: 6, label: '|' + M.fmt(p.x) + '| = ' + M.fmt(d.abs) });
      d.sols.forEach((s) => P.point(s, p.k, { color: c.c3, r: 6 }));
    },
    handles(p, d, set) { return [{ x: p.x, y: d.abs, onDrag: (x) => set('x', M.clamp(Math.round(x * 2) / 2, -10, 10)) }]; },
    live(p, d) { return '|' + M.fmt(p.x) + '| = ' + M.fmt(d.abs) + ',\\quad (x ' + (p.h < 0 ? '- ' + (-p.h) : '+ ' + p.h) + ')^2 = ' + p.k + ' \\Rightarrow x = ' + solTeX(p, d); },
    results(p, d) {
      return [['القيمة المطلقة', '|' + M.fmt(p.x) + '| = ' + M.fmt(d.abs)], ['البعد عن الصفر', M.fmt(d.abs) + ' وحدة', false], ['حلّا المعادلة', solTeX(p, d)], ['عدد الحلول', String(d.sols.length)]];
    },
    steps(p, d) {
      return [p.x >= 0 ? '$x = ' + M.fmt(p.x) + ' \\ge 0$ إذن $|x| = x = ' + M.fmt(d.abs) + '$.' : '$x = ' + M.fmt(p.x) + ' < 0$ إذن $|x| = -x = ' + M.fmt(d.abs) + '$.',
        'نأخذ الجذر للطرفين: $\\sqrt{(x ' + (p.h < 0 ? '- ' + (-p.h) : '+ ' + p.h) + ')^2} = \\sqrt{' + p.k + '}$ أي $|x ' + (p.h < 0 ? '- ' + (-p.h) : '+ ' + p.h) + '| = ' + G.rootTeX(d.s[0], d.s[1]) + '$.',
        'ومنه $x = ' + solTeX(p, d) + '$.'];
    },
    explain(a, b, da, db) { return Math.sign(a.x) !== Math.sign(b.x) ? ['تغيّرت إشارة $x$ لكن قيمته المطلقة بقيت بعده عن الصفر: $|' + M.fmt(b.x) + '| = ' + M.fmt(db.abs) + '$.'] : []; },
    learn: [
      '**نشاط 1 ص 15:** ترتفع قمة جبل الشيخ $2814$ م عن سطح البحر، وينخفض البحر الميت $420$ م: $|2814| = 2814$ و $|-420| = 420$.',
      '**تعريف ص 16:** $|a| = a$ إذا كان $a \\ge 0$، و $|a| = -a$ إذا كان $a < 0$.',
      '**مثال 1 ص 16:** $|1 - \\sqrt{2}| = -(1 - \\sqrt{2}) = \\sqrt{2} - 1$ لأن $1 - \\sqrt{2} < 0$.',
      '**ص 16:** $\\sqrt{x^2} = |x|$؛ لذلك $x^2 = 6$ تعني $|x| = \\sqrt{6}$ أي $x = \\pm\\sqrt{6}$.',
      '**تمارين ص 17:** $x^2 = 3$ ، $(x + 7)^2 = 20$ ، $\\sqrt{(x + 1)^2} = 6$.'
    ],
    challenges: [
      { q: 'حلّ $(x + 7)^2 = 20$ (تمرين ص 17).', hint: '$h = 7$ و $k = 20$.', init: { h: 0, k: 1 }, check: (p) => p.h === 7 && p.k === 20, why: () => '$x = -7 \\pm 2\\sqrt{5}$.' },
      { q: 'حلّ $\\sqrt{(x + 1)^2} = 6$، وهي تكافئ $(x + 1)^2 = 36$.', hint: '$h = 1$ ، $k = 36$.', init: { h: 0, k: 1 }, check: (p) => p.h === 1 && p.k === 36, why: () => '$|x + 1| = 6$ ومنه $x = 5$ أو $x = -7$.' },
      { q: 'ضع $x$ على عدد سالب قيمته المطلقة $4.5$.', hint: 'اسحب النقطة الحمراء.', init: { x: 2 }, check: (p) => p.x === -4.5 }
    ],
    tutor: [
      { q: 'لماذا لا تكون القيمة المطلقة سالبة؟', k: ['سالبه', 'لماذا'], a: () => 'لأنها **بُعد** عن الصفر، والبعد لا يكون سالباً.' },
      { q: 'لماذا √(س²) = |س| وليس س؟', k: ['√', 'جذر', 'مربع'], a: () => 'لأن الجذر التربيعي غير سالب: $\\sqrt{(-3)^2} = \\sqrt{9} = 3 = |-3|$ وليس $-3$.' },
      { q: 'ما حلول المعادلة الحالية؟', k: ['حلول', 'الحاليه'], a: (p, d) => '$x = ' + solTeX(p, d) + '$.' }
    ]
  });
  function solTeX(p, d) {
    if (p.k === 0) return M.fmt(-p.h);
    const r = G.rootTeX(d.s[0], d.s[1]);
    if (d.s[1] === 1) return M.fmt(d.sols[0]) + ' \\text{ أو } ' + M.fmt(d.sols[1]);
    return (p.h ? M.fmt(-p.h) + ' ' : '') + '\\pm ' + r;
  }

  /* ======================= 1-5 الأسس وقوانينها (1) ======================= */
  const LAWS = [['prod', 'ضرب القوى (نجمع الأسس)'], ['quot', 'قسمة القوى (نطرح الأسس)'], ['pp', 'قوة حاصل الضرب'], ['pq', 'قوة ناتج القسمة'], ['zero', 'الأس صفر']];
  G.reg({
    id: 'exponent-laws', unit: U, order: 6, lesson: '1-5', lessonTitle: 'الأسس وقوانينها (1)', page: 18,
    titleAr: 'قوانين الأسس', titleEn: 'Laws of Exponents', tags: 'اسس قوى اساس ضرب قسمه اس صفر تحليل عوامل اوليه جوجل',
    formula: 'a^m \\times a^n = a^{m+n},\\quad \\frac{a^m}{a^n} = a^{m-n},\\quad (ab)^n = a^n b^n,\\quad \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n},\\quad a^0 = 1',
    book: 'أ^م × أ^ن = أ^(م+ن) ، أ^م ÷ أ^ن = أ^(م–ن) ، (أ ب)^ن = أ^ن ب^ن ، أ⁰ = ١ (أ ≠ ٠)',
    summary: '$a^n$ تعني ضرب الأساس $a$ في نفسه $n$ مرة. عند ضرب قوتين لهما الأساس نفسه نجمع الأسس، وعند القسمة نطرحها؛ وقوة حاصل الضرب تتوزع على العوامل.',
    vars: [['a, b', 'الأساسان', 'أعداد حقيقية، $a \\ne 0$ عند القسمة'], ['m, n', 'الأسس', 'أعداد صحيحة غير سالبة هنا']],
    params: [
      { key: 'law', label: '\\text{القانون}', type: 'select', value: 'prod', options: LAWS },
      { key: 'a', label: 'a', min: 2, max: 10, step: 1, value: 3, int: true },
      { key: 'b', label: 'b', min: 2, max: 10, step: 1, value: 5, int: true },
      { key: 'm', label: 'm', min: 0, max: 6, step: 1, value: 2, int: true },
      { key: 'n', label: 'n', min: 0, max: 6, step: 1, value: 4, int: true }
    ],
    custom: true, canvasHint: 'كل مربع صغير عامل واحد يساوي الأساس؛ لاحظ كيف تُعدّ العوامل.',
    compute(p) {
      const a = p.a, b = p.b, m = p.m, n = p.n; let L, R, val, e;
      if (p.law === 'prod') { e = m + n; val = Math.pow(a, e); L = a + '^{' + m + '} \\times ' + a + '^{' + n + '}'; R = a + '^{' + e + '}'; }
      else if (p.law === 'quot') { e = m - n; val = Math.pow(a, e); L = '\\frac{' + a + '^{' + m + '}}{' + a + '^{' + n + '}}'; R = a + '^{' + e + '}'; }
      else if (p.law === 'pp') { val = Math.pow(a * b, n); L = '(' + a + ' \\times ' + b + ')^{' + n + '}'; R = a + '^{' + n + '} \\times ' + b + '^{' + n + '}'; }
      else if (p.law === 'pq') { val = Math.pow(a / b, n); L = '\\left(\\frac{' + a + '}{' + b + '}\\right)^{' + n + '}'; R = '\\frac{' + a + '^{' + n + '}}{' + b + '^{' + n + '}}'; }
      else { val = 1; L = a + '^{0}'; R = '1'; }
      return { L: L, R: R, val: val, e: e };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const sz = nar ? 22 : 30; const gap = 4;
      const row = (y, k, base, col, lab) => {
        const tot = k * (sz + gap); let x = W / 2 + tot / 2 - sz;
        G.txt(ctx, lab, W - 12, y - sz / 2 - 10, { align: 'right', color: col, size: 13, w: '800' });
        for (let i = 0; i < k; i++) { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.18; ctx.fillRect(x, y - sz / 2, sz, sz); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, y - sz / 2, sz, sz); ctx.restore(); G.txt(ctx, base, x + sz / 2, y, { color: col, size: nar ? 12 : 14, w: '800' }); x -= sz + gap; }
        if (!k) G.txt(ctx, '(لا عوامل: الناتج ١)', W / 2, y, { color: col, size: 13 });
      };
      const a = p.a, b = p.b, m = p.m, n = p.n; const y0 = 50, dy = sz + 46;
      if (p.law === 'prod') { row(y0, m, a, c.c1, a + ' مرفوع للقوة ' + m); row(y0 + dy, n, a, c.c3, a + ' مرفوع للقوة ' + n); row(y0 + 2 * dy, m + n, a, c.c5, 'المجموع: ' + (m + n) + ' عاملاً'); }
      else if (p.law === 'quot') {
        row(y0, m, a, c.c1, 'البسط: ' + m + ' عاملاً'); row(y0 + dy, n, a, c.c3, 'المقام: ' + n + ' عاملاً');
        if (m >= n) row(y0 + 2 * dy, m - n, a, c.c5, 'يبقى بعد الاختصار: ' + (m - n)); else G.txt(ctx, 'يبقى في المقام ' + (n - m) + ' عاملاً: أس سالب (الدرس 1-6)', W / 2, y0 + 2 * dy, { color: c.c2, size: 14, w: '700' });
      } else if (p.law === 'pp' || p.law === 'pq') { row(y0, n, a, c.c1, a + ' مكرر ' + n + ' مرات'); row(y0 + dy, n, b, c.c3, b + ' مكرر ' + n + ' مرات'); G.txt(ctx, p.law === 'pp' ? 'نجمع كل زوج (' + a + ' × ' + b + ') فنحصل على ' + (a * b) + ' مكرر ' + n + ' مرات' : 'كل كسر (' + a + ' ÷ ' + b + ') مكرر ' + n + ' مرات', W / 2, y0 + 2 * dy, { color: c.c5, size: nar ? 12 : 14, w: '700' }); }
      else { G.expr(ctx, [[a, 3], ['÷'], [a, 3], ['='], [a, 0], ['='], [1]], W / 2, y0 + 30, { color: c.c5, size: 24 }); G.txt(ctx, 'أي عدد (≠ ٠) مقسوم على نفسه يساوي ١', W / 2, y0 + 70, { color: c.text, size: 14 }); }
      G.txt(ctx, '= ' + M.fmt(d.val, 6), W / 2, Math.min(H - 18, y0 + 3 * dy), { color: c.c2, size: nar ? 16 : 20, w: '800' });
    },
    live(p, d) { return d.L + ' = ' + d.R + ' = ' + M.texFrac(d.val, 1000000); },
    results(p, d) { return [['الصيغة', d.L + ' = ' + d.R], ['القيمة', M.texFrac(d.val, 1000000)]].concat(d.e !== undefined ? [['الأس الناتج', String(d.e)]] : []); },
    steps(p, d) {
      return [{ prod: 'عدد العوامل $' + p.m + ' + ' + p.n + ' = ' + (p.m + p.n) + '$.', quot: 'نختصر العوامل المشتركة: $' + p.m + ' - ' + p.n + ' = ' + (p.m - p.n) + '$.', pp: 'نعيد ترتيب العوامل (التبديل والتجميع): $(ab)^n = a^n b^n$.', pq: '$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$ حيث $b \\ne 0$.', zero: '$\\frac{a^m}{a^m} = a^{m-m} = a^0$ وكذلك $= 1$.' }[p.law], 'الناتج $' + M.texFrac(d.val, 1000000) + '$.'];
    },
    explain(a, b) { return a.law !== b.law ? ['القانون الآن: ' + LAWS.find((l) => l[0] === b.law)[1] + '.'] : []; },
    learn: [
      '**نشاط 1 ص 18:** يصل الأرض من الشمس في الثانية $22000000000$ كيلو واط ساعة، ويُكتب $22 \\times 10^{9}$ حيث 10 الأساس و 9 الأس.',
      '**نشاط 2 ص 18:** $64 = 2 \\times 2 \\times 2 \\times 2 \\times 2 \\times 2 = 2^6$ و $500 = 2^2 \\times 5^3$.',
      '**نشاط 4 ص 19:** $9 \\times 81 = 3^2 \\times 3^4 = 3^6$ و $16 \\times 64 = 4^2 \\times 4^3 = 4^5$.',
      '**ص 20:** مربعات أطوال أضلاعها 3 و 5 و 15: $15^2 = (3 \\times 5)^2 = 3^2 \\times 5^2 = 225$.',
      '**تمرين ص 22:** العدد جوجل (Googol) هو 1 وعلى يمينه 100 صفر $= 10^{100}$.'
    ],
    challenges: [
      { q: 'مثّل $3^2 \\times 3^4$ (نشاط 4 ص 19) وتحقق أنها $3^6$.', hint: 'ضرب القوى، $a = 3$ ، $m = 2$ ، $n = 4$.', init: { law: 'quot', a: 2, m: 1, n: 1 }, check: (p) => p.law === 'prod' && p.a === 3 && p.m === 2 && p.n === 4 },
      { q: 'بيّن أن $15^2 = 3^2 \\times 5^2$.', hint: 'قوة حاصل الضرب: $a = 3$ ، $b = 5$ ، $n = 2$.', init: { law: 'prod', a: 2, b: 2, n: 3 }, check: (p) => p.law === 'pp' && p.n === 2 && p.a * p.b === 15 },
      { q: 'اجعل ناتج القسمة $a^m \\div a^n$ يساوي 1 دون اختيار قانون الأس صفر.', hint: 'اجعل $m = n$.', init: { law: 'quot', m: 5, n: 2 }, check: (p) => p.law === 'quot' && p.m === p.n }
    ],
    tutor: [
      { q: 'لماذا أ⁰ = ١؟', k: ['صفر', '⁰', 'لماذا'], a: () => 'لأن $\\frac{a^m}{a^m} = a^{m-m} = a^0$، وأي عدد غير صفري مقسوم على نفسه يساوي 1.' },
      { q: 'هل ٢³ × ٣² = ٦⁵؟', k: ['مختلفه', 'اساس'], a: () => 'لا. نجمع الأسس فقط عند **تساوي الأساسات**: $2^3 \\times 3^2 = 8 \\times 9 = 72$.' },
      { q: 'ما ناتج القانون الحالي؟', k: ['ناتج', 'الحالي'], a: (p, d) => '$' + d.L + ' = ' + d.R + ' = ' + M.texFrac(d.val, 1000000) + '$.' }
    ]
  });

  /* ======================= 1-6 الأسس وقوانينها (2): التكاثر البكتيري ======================= */
  G.reg({
    id: 'bacteria-growth', unit: U, order: 7, lesson: '1-6', lessonTitle: 'الأسس وقوانينها (2)', page: 23,
    titleAr: 'تضاعف البكتيريا والأسس السالبة', titleEn: 'Bacterial Doubling & Negative Exponents', tags: 'بكتيريا تضاعف انقسام اس سالب معادله اسيه حمى مالطيه',
    formula: 'N = 2^{n},\\quad n = 3t,\\qquad a^{-n} = \\frac{1}{a^{n}},\\qquad (a^m)^n = a^{mn}',
    book: 'عدد الخلايا بعد ن انقسام = ٢^ن ؛ أ^(–ن) = ١ ÷ أ^ن ، (أ^م)^ن = أ^(م ن)',
    ar: { N: 'ع', t: 'ز' },
    summary: 'في نشاط الكتاب تنقسم خلية البكتيريا (الحمى المالطية) كل ثلث ساعة إلى خليتين؛ فبعد $n$ انقسامات يصبح عددها $2^n$. وإذا رجعنا في الزمن نقسم على 2 كل مرة فتظهر الأسس السالبة: $2^{-n} = \\frac{1}{2^n}$.',
    vars: [['t', 'الزمن بالساعات', 'من $-1$ إلى $4$'], ['n', 'عدد الانقسامات $= 3t$', 'عدد صحيح'], ['N', 'عدد الخلايا', '$2^n$']],
    params: [{ key: 't', label: 't', min: -1, max: 4, step: 1 / 3, value: 1, desc: 'ساعة (كل ثلث ساعة انقسام)' }],
    play: { key: 't', speed: 0.6 },
    plot: { view: { xmin: -1.3, xmax: 4.3, ymin: -60, ymax: 600 }, equal: false },
    compute(p) { const n = Math.round(p.t * 3); return { n: n, N: Math.pow(2, n), t: n / 3 }; },
    draw(P, p, d) {
      const c = P.colors();
      P.fn((t) => Math.pow(2, 3 * t), { color: c.c1, width: 3, domain: [-1.3, 4.3] });
      for (let n = -3; n <= 12; n++) P.point(n / 3, Math.pow(2, n), { color: n === d.n ? c.c2 : c.c3, r: n === d.n ? 7 : 3.5 });
      P.text(d.t, d.N, d.n + ' انقسام: ' + (d.N >= 1 ? d.N : '١/' + Math.round(1 / d.N)) + ' خلية', { color: c.c2, dy: -16, align: 'center', rtl: true, bold: true });
    },
    live(p, d) { return 'N = 2^{' + d.n + '} = ' + M.texFrac(d.N, 64); },
    results(p, d) {
      return [['الزمن', fmtT(d.t) + ' ساعة', false], ['عدد الانقسامات', String(d.n)], ['عدد الخلايا', 'N = 2^{' + d.n + '} = ' + M.texFrac(d.N, 64)]].concat(d.n < 0 ? [['الأس السالب', '2^{' + d.n + '} = \\frac{1}{2^{' + (-d.n) + '}}']] : []);
    },
    steps(p, d) { return ['كل ساعة فيها 3 انقسامات، إذن $n = 3 \\times ' + fmtT(d.t) + ' = ' + d.n + '$.', 'كل انقسام يضاعف العدد: $N = 2^{' + d.n + '}$.', d.n < 0 ? 'الأس السالب يعني القسمة: $2^{' + d.n + '} = \\frac{1}{' + Math.pow(2, -d.n) + '}$.' : '$N = ' + d.N + '$ خلية.']; },
    explain(a, b, da, db) { return da && db.n !== da.n ? ['تغيّر عدد الانقسامات من ' + da.n + ' إلى ' + db.n + '، ف' + (db.n > da.n ? 'تضاعف' : 'انقسم على 2') + ' عدد الخلايا ' + Math.abs(db.n - da.n) + ' مرة.'] : []; },
    learn: [
      '**نشاط 1 ص 23:** جدول الزمن (ساعة) $0 ، \\tfrac13 ، \\tfrac23 ، 1 ، \\ldots$ وعدد الخلايا $1 ، 2 ، 4 ، 8 ، 16 \\ldots$؛ بعد ساعتين $2^6 = 64$ خلية.',
      '**قوة القوة (ص 24):** $(a^m)^n = a^{mn}$؛ مثلاً $(2^3)^2 = 2^6$.',
      '**الأس السالب (ص 25):** $a^{-n} = \\frac{1}{a^n}$ حيث $a \\ne 0$.',
      '**المعادلات الأسية (تمارين ص 27):** $2^x = 512 = 2^9$ إذن $x = 9$؛ $3^x = 81$ إذن $x = 4$؛ $\\frac{5^{2x}}{5^x} = 125$ إذن $5^x = 5^3$ و $x = 3$.',
      '**الأسس الكسرية (ص 26):** $5^{\\frac12} \\times 5^{\\frac12} = 5$ أي $5^{\\frac12} = \\sqrt{5}$.'
    ],
    challenges: [
      { q: 'متى يصبح عدد الخلايا $512$؟ (حلّ $2^n = 512$)', hint: '$512 = 2^9$ ← 9 انقسامات.', init: { t: 0 }, check: (p, d) => d.n === 9, why: () => '$n = 9$ انقسامات أي بعد 3 ساعات.' },
      { q: 'كم كانت الخلايا قبل ثلثي ساعة من البدء؟', hint: 'حرّك الزمن إلى $-\\tfrac23$.', init: { t: 1 }, check: (p, d) => d.n === -2, why: () => '$2^{-2} = \\frac{1}{4}$ من الخلية الأولى.' },
      { q: 'اجعل عدد الخلايا $64$ (نشاط 1).', hint: 'بعد ساعتين.', init: { t: 0 }, check: (p, d) => d.N === 64 }
    ],
    tutor: [
      { q: 'لماذا ٢^(–٢) = ١/٤؟', k: ['سالب', 'لماذا'], a: () => 'لأن $2^{-2} = \\frac{2^0}{2^2} = \\frac{1}{4}$: الرجوع انقسامين في الزمن يعني القسمة على 2 مرتين.' },
      { q: 'كيف أحل ٢^س = ٥١٢؟', k: ['احل', '512', 'معادله'], a: () => 'نكتب الطرفين بالأساس نفسه: $512 = 2^9$، فإذا تساوى الأساسان تساوى الأسان: $x = 9$.' },
      { q: 'كم عدد الخلايا الآن؟', k: ['عدد', 'الان'], a: (p, d) => 'بعد ' + d.n + ' انقسامات: $2^{' + d.n + '} = ' + M.texFrac(d.N, 64) + '$.' }
    ]
  });
  function fmtT(t) { const f = M.toFraction(t, 3); return f && f.d !== 1 ? (f.n < 0 ? '-' : '') + Math.abs(f.n) + '/' + f.d : M.fmt(t); }

  /* ======================= 1-6 الصورة العلمية ======================= */
  const SCI = [
    ['nail', 'نمو الأظافر يومياً (سم)', 1.23, -2], ['moon', 'بعد القمر عن الأرض (كم)', 3.8, 5], ['diam', 'قطر القمر (م)', 3.476, 6],
    ['sun', 'طاقة الشمس الواصلة في الثانية (كيلو واط ساعة)', 2.2, 10], ['earth', 'حجم الأرض (ميل مكعب)', 2.59, 11], ['free', 'عدد من اختياري', 5, 0]
  ];
  G.reg({
    id: 'scientific-notation', unit: U, order: 8, lesson: '1-6', lessonTitle: 'الأسس وقوانينها (2): الصورة العلمية', page: 27,
    titleAr: 'الصورة العلمية للأعداد', titleEn: 'Scientific Notation', tags: 'صوره علميه اس عشره قمر اظافر اعداد كبيره صغيره',
    formula: 'x = a \\times 10^{n},\\qquad 1 \\le a < 10,\\ n \\in \\text{ص}',
    book: 'يكون العدد على الصورة العلمية إذا كُتب أ × ١٠^ب حيث ١ ≤ أ < ١٠ ، ب عدد صحيح',
    ar: { n: 'ب' },
    summary: 'نكتب العدد الكبير جداً أو الصغير جداً على الصورة $a \\times 10^n$: ننقل الفاصلة العشرية حتى يصبح $1 \\le a < 10$، ويكون $n$ عدد المنازل التي انتقلتها (موجباً للأعداد الكبيرة وسالباً للصغيرة).',
    vars: [['a', 'المعامل', '$1 \\le a < 10$'], ['n', 'أس العشرة', 'عدد صحيح من $-12$ إلى $12$']],
    params: [
      { key: 'ex', label: '\\text{من الكتاب}', type: 'select', value: 'nail', options: SCI.map((s) => [s[0], s[1]]) },
      { key: 'a', label: 'a', min: 1, max: 9.99, step: 0.01, value: 1.23 },
      { key: 'n', label: 'n', min: -12, max: 12, step: 1, value: -2, int: true }
    ],
    onSet(p, key) { if (key === 'ex') { const s = SCI.find((x) => x[0] === p.ex); if (s[0] !== 'free') { p.a = s[2]; p.n = s[3]; } } },
    custom: true, canvasHint: 'المسطرة لوغاريتمية: كل قفزة تمثّل الضرب في ١٠. تظهر أعداد الكتاب علامات صغيرة.',
    compute(p) { const v = p.a * Math.pow(10, p.n); return { v: v, plain: plain(p.a, p.n), digits: Math.abs(p.n) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      G.txt(ctx, d.plain, W / 2, 46, { color: c.c1, size: nar ? (d.plain.length > 18 ? 13 : 17) : 22, w: '800' });
      G.expr(ctx, [[M.fmt(p.a, 3)], ['×'], ['10', p.n]], W / 2, 90, { color: c.c2, size: nar ? 18 : 24 });
      G.txt(ctx, p.n === 0 ? 'لا تنتقل الفاصلة' : 'تنتقل الفاصلة ' + Math.abs(p.n) + ' منزلة إلى ' + (p.n > 0 ? 'اليمين (عدد كبير)' : 'اليسار (عدد صغير)'), W / 2, 124, { color: c.text, size: 13 });
      // مسطرة لوغاريتمية من 10^-3 إلى 10^12
      const lo = -3, hi = 12, y = H * 0.68, x0 = 24, x1 = W - 24; const X = (e) => x0 + (e - lo) / (hi - lo) * (x1 - x0);
      ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
      for (let e = lo; e <= hi; e++) { ctx.fillStyle = c.axis; ctx.fillRect(X(e) - 1, y - 6, 2, 12); if (!nar || e % 3 === 0) G.expr(ctx, [['10', e]], X(e), y + 20, { color: c.muted, size: 11, w: '600' }); }
      SCI.slice(0, 5).forEach((s) => { const e = Math.log10(s[2]) + s[3]; ctx.fillStyle = c.c4; ctx.beginPath(); ctx.arc(X(e), y, 4, 0, 7); ctx.fill(); });
      const e = Math.log10(Math.abs(d.v)); if (Number.isFinite(e)) { const xx = X(M.clamp(e, lo, hi)); ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(xx, y, 8, 0, 7); ctx.fill(); G.arrow(ctx, xx, y - 40, xx, y - 12, c.c2, 2.5); }
    },
    live(p, d) { return M.fmt(p.a, 3) + ' \\times 10^{' + p.n + '}'; },
    results(p, d) {
      const s = SCI.find((x) => x[0] === p.ex);
      return [['العدد بالصورة العادية', d.plain, false], ['الصورة العلمية', M.fmt(p.a, 3) + ' \\times 10^{' + p.n + '}'], ['عدد المنازل التي تنتقلها الفاصلة', String(d.digits)]].concat(s[0] !== 'free' ? [['من الكتاب', s[1], false]] : []);
    },
    steps(p, d) { return ['المعامل $a = ' + M.fmt(p.a, 3) + '$ يحقق $1 \\le a < 10$.', p.n >= 0 ? 'الضرب في $10^{' + p.n + '}$ ينقل الفاصلة ' + p.n + ' منازل إلى اليمين.' : 'الضرب في $10^{' + p.n + '} = \\frac{1}{10^{' + (-p.n) + '}}$ ينقل الفاصلة ' + (-p.n) + ' منازل إلى اليسار.', 'العدد: ' + d.plain + '.']; },
    explain(a, b) { return a.n !== b.n ? ['زاد الأس أو نقص بمقدار ' + Math.abs(b.n - a.n) + '، فتضاعف العدد أو صغر ' + Math.pow(10, Math.abs(b.n - a.n)) + ' مرة.'] : []; },
    learn: [
      '**تعريف ص 27:** يكون العدد على الصورة العلمية إذا كُتب $a \\times 10^{n}$ حيث $1 \\le a < 10$ و $n$ عدد صحيح.',
      '**نشاط 10 ص 27:** تنمو أظافر الإنسان $0.0123$ سم يومياً $= 1.23 \\times 10^{-2}$، ويبعد القمر عن الأرض $380000$ كم $= 3.8 \\times 10^{5}$.',
      '**تمرين ص 27:** قطر القمر $3476000$ م $= 3.476 \\times 10^{6}$.',
      '**ص 18:** طاقة الشمس الواصلة إلى الأرض في الثانية $22000000000$ كيلو واط ساعة $= 2.2 \\times 10^{10}$.'
    ],
    challenges: [
      { q: 'اكتب $380000$ (بعد القمر بالكيلومتر) على الصورة العلمية.', hint: '$a = 3.8$ و $n = 5$.', init: { ex: 'free', a: 5, n: 0 }, check: (p) => M.near(p.a, 3.8, 1e-9) && p.n === 5 },
      { q: 'اكتب $0.0123$ على الصورة العلمية.', hint: 'الفاصلة تنتقل منزلتين إلى اليمين ← $n = -2$.', init: { ex: 'free', a: 5, n: 0 }, check: (p) => M.near(p.a, 1.23, 1e-9) && p.n === -2 }
    ],
    tutor: [
      { q: 'لماذا يجب أن يكون المعامل بين ١ و ١٠؟', k: ['المعامل', 'بين', 'لماذا'], a: () => 'حتى تكون الصورة واحدة لكل عدد: $38 \\times 10^4$ ليست علمية، وصورتها العلمية $3.8 \\times 10^5$.' },
      { q: 'متى يكون الأس سالباً؟', k: ['سالب', 'متى'], a: () => 'عندما يكون العدد أصغر من 1 (موجباً)، مثل $0.0123 = 1.23 \\times 10^{-2}$.' }
    ]
  });
  function plain(a, n) {
    const s = M.round(a, 4).toString(); const [ip, fp0] = s.split('.'); const fp = fp0 || '';
    const digits = ip + fp; let point = ip.length + n;
    if (point <= 0) return '0.' + '0'.repeat(-point) + digits.replace(/0+$/, '');
    if (point >= digits.length) return group(digits + '0'.repeat(point - digits.length));
    return group(digits.slice(0, point)) + '.' + digits.slice(point);
  }
  function group(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  G.plain = plain;
})(typeof window !== 'undefined' ? window : globalThis);
