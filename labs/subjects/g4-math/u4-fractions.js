/* رياضيات الرابع — الوحدة الرابعة: الكسور العادية والأعداد الكسرية (ص 66–89) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 4;
  const fr = G.fr, nice = G.nice;
  const SGN = { '>': '>', '<': '<', '=': '=' };

  /* ======================= لوحة الكسور (ص 66) ======================= */
  G.reg({
    id: 'fraction-wall', unit: U, order: 1, lesson: '4-0', lessonTitle: 'مدخل الوحدة: لوحة الكسور', page: 66,
    titleAr: 'لوحة الكسور: من الواحد الصحيح إلى الأعشار', titleEn: 'The Fraction Wall', tags: 'لوحه الكسور جدار واحد صحيح نصف ثلث ربع خمس سدس سبع ثمن تسع عشر مكافئ مقارنه',
    formula: '1 = \\frac{2}{2} = \\frac{3}{3} = \\cdots = \\frac{10}{10}',
    book: 'الواحد الصحيح = ٢/٢ = ٣/٣ = … = ١٠/١٠ ، وكلما زاد المقام صغر الجزء',
    summary: 'لوحة الكسور في مدخل الوحدة تقسم الواحد الصحيح إلى أنصاف وأثلاث وأرباع… حتى الأعشار. الأجزاء التي تنتهي عند الخط نفسه تمثل **كسوراً متكافئة**، وكلما زاد عدد الأجزاء (المقام) صغر حجم الجزء الواحد.',
    vars: [['\\text{البسط}', 'عدد الأجزاء المظللة', ''], ['\\text{المقام}', 'عدد الأجزاء المتساوية في الواحد الصحيح', 'من ٢ إلى ١٠']],
    params: [
      { key: 'n', label: '\\text{البسط}', min: 1, max: 10, step: 1, value: 1, int: true },
      { key: 'd', label: '\\text{المقام}', min: 2, max: 10, step: 1, value: 2, int: true },
      { key: 'cmp', label: '\\text{مقارنة}', type: 'toggle', value: false, on: 'قارن بكسر ثانٍ', off: 'كسر واحد' },
      { key: 'n2', label: '\\text{البسط ٢}', min: 1, max: 10, step: 1, value: 2, int: true, hidden: (p) => !p.cmp },
      { key: 'd2', label: '\\text{المقام ٢}', min: 2, max: 10, step: 1, value: 3, int: true, hidden: (p) => !p.cmp }
    ],
    onSet(p, k) { if (k === 'd' || k === 'n') p.n = Math.min(p.n, p.d); if (k === 'd2' || k === 'n2') p.n2 = Math.min(p.n2, p.d2); },
    custom: true, canvasHint: 'اضغط على أي جزء لاختيار الكسر حتى نهايته. الأخضر: كسور مكافئة تنتهي عند الخط نفسه.',
    compute(p) {
      const n = Math.min(p.n, p.d); const eq = [];
      for (let m = 1; m <= 10; m++) if ((n * m) % p.d === 0) eq.push([n * m / p.d, m]);
      const o = { n: n, d: p.d, v: n / p.d, eq: eq, s: G.simp(n, p.d) };
      if (p.cmp) { o.n2 = Math.min(p.n2, p.d2); o.k = G.cmp([n, p.d], [o.n2, p.d2]); }
      return o;
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const x0 = nar ? 8 : 18, x1 = W - (nar ? 8 : 18), wd = x1 - x0; const top = 12, rh = (H - top - 10) / 10;
      d.hits = [];
      for (let m = 1; m <= 10; m++) {
        const y = top + (m - 1) * rh; const pw = wd / m; const eqRow = d.eq.find((e) => e[1] === m);
        for (let i = 0; i < m; i++) {
          const x = x1 - (i + 1) * pw; const sel = m === d.d && i < d.n; const eqp = eqRow && i < eqRow[0] && m !== d.d; const sel2 = p.cmp && m === p.d2 && i < d.n2;
          ctx.fillStyle = sel ? c.c1 : sel2 ? c.c4 : eqp ? c.c3 : m === 1 ? 'rgba(148,163,184,.25)' : 'rgba(148,163,184,.08)';
          ctx.globalAlpha = sel || eqp || sel2 ? 0.75 : 1; ctx.fillRect(x + 1, y + 1, pw - 2, rh - 2); ctx.globalAlpha = 1;
          ctx.strokeStyle = c.text; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, pw - 2, rh - 2);
          const lab = m === 1 ? 'واحد صحيح ١' : '١/' + m; const fs = Math.min(13, rh * 0.42, pw * 0.34);
          if (pw > 22 || m === 1) G.txt(ctx, lab, x + pw / 2, y + rh / 2, { color: sel || eqp || sel2 ? '#fff' : c.text, size: fs, w: '700' });
          d.hits.push({ x: x, y: y, w: pw, h: rh, m: m, i: i });
        }
      }
      const lx = x1 - d.v * wd; ctx.save(); ctx.strokeStyle = c.c2; ctx.lineWidth = 2.4; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(lx, top - 4); ctx.lineTo(lx, top + 10 * rh + 4); ctx.stroke(); ctx.restore();
      if (p.cmp) { const lx2 = x1 - d.n2 / p.d2 * wd; ctx.save(); ctx.strokeStyle = c.c4; ctx.lineWidth = 2.4; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(lx2, top - 4); ctx.lineTo(lx2, top + 10 * rh + 4); ctx.stroke(); ctx.restore(); }
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h || h.m === 1) return false;
      api.set('d', h.m); api.set('n', h.i + 1); return true;
    },
    live(p, d) { return d.eq.map((e) => fr(e[0], e[1])).join(' = ') + (p.cmp ? ',\\quad ' + fr(d.n, d.d) + ' ' + G.sign(d.k) + ' ' + fr(d.n2, p.d2) : ''); },
    results(p, d) {
      const r = [['الكسر', fr(d.n, d.d), true, 'pos'], ['كسور مكافئة في اللوحة', d.eq.filter((e) => e[1] !== d.d).map((e) => fr(e[0], e[1])).join(' = ') || '\\text{لا يوجد}', true], ['أبسط صورة', nice(d.n, d.d), true]];
      if (p.cmp) r.push(['المقارنة', fr(d.n, d.d) + ' ' + G.sign(d.k) + ' ' + fr(d.n2, p.d2), true, 'pos']);
      return r;
    },
    steps(p, d) {
      const s = ['قسمنا الواحد الصحيح إلى ' + G.L(d.d) + ' أجزاء متساوية، وظللنا ' + G.L(d.n) + ' منها: $' + fr(d.n, d.d) + '$.'];
      s.push(d.eq.length > 1 ? 'الكسور التي تنتهي عند الخط الأحمر نفسه متكافئة: $' + d.eq.map((e) => fr(e[0], e[1])).join(' = ') + '$.' : 'لا يوجد في اللوحة كسر آخر ينتهي عند الخط نفسه.');
      if (p.cmp) s.push('الخط الأبعد عن بداية اللوحة (اليمين) يمثل الكسر الأكبر: $' + fr(d.n, d.d) + ' ' + G.sign(d.k) + ' ' + fr(d.n2, p.d2) + '$.');
      return s;
    },
    explain(a, b, da, db) { return da && a.d !== b.d ? ['المقام ' + G.L(b.d) + ': ' + (b.d > a.d ? 'أجزاء أكثر وأصغر.' : 'أجزاء أقل وأكبر.')] : []; },
    learn: [
      '**مدخل الوحدة ص 66:** لوحة الكسور: واحد صحيح، ثم أنصاف وأثلاث وأرباع وأخماس وأسداس وأسباع وأثمان وأتساع وأعشار.',
      '**ص 68:** ١/٢ = ٢/٤ = ٤/٨ ؛ وهذه كسور متكافئة تنتهي عند الخط نفسه في اللوحة.',
      '**ص 73:** إذا تساوى البسطان فالكسر الذي مقامه أصغر هو الأكبر، مثل ١/٥ > ١/٧ ، لأن الجزء الخامس أكبر من الجزء السابع.'
    ],
    challenges: [
      { q: 'اختر كسراً من الأثمان يكافئ ١/٢.', hint: 'اضغط في صف الأثمان حتى الخط الأحمر.', init: { n: 1, d: 3, cmp: false }, check: (p) => p.d === 8 && p.n === 4 },
      { q: 'جد في اللوحة كسراً من الأتساع يكافئ ٢/٣.', hint: 'اختر ٢/٣ ثم انظر إلى صف الأتساع.', init: { n: 1, d: 2, cmp: false }, check: (p) => p.d === 9 && p.n === 6 },
      { q: 'قارن ١/٥ و ١/٧ باللوحة (ص 73).', hint: 'فعّل المقارنة وضع الكسرين.', init: { n: 1, d: 2, cmp: false, n2: 1, d2: 2 }, check: (p) => p.cmp && ((p.n === 1 && p.d === 5 && p.n2 === 1 && p.d2 === 7) || (p.n === 1 && p.d === 7 && p.n2 === 1 && p.d2 === 5)), why: () => '١/٥ > ١/٧ لأن الجزء الخامس أكبر.' }
    ],
    tutor: [
      { q: 'لماذا ١/٧ أصغر من ١/٥؟', k: ['اصغر', 'سبع', 'خمس'], a: () => 'لأن الواحد الصحيح قُسم إلى أجزاء أكثر (٧)، فكل جزء أصغر.' },
      { q: 'ما الكسور المكافئة للكسر الحالي؟', k: ['مكافئه', 'الحالي'], a: (p, d) => '$' + d.eq.map((e) => fr(e[0], e[1])).join(' = ') + '$.' },
      { q: 'ما الكسر الذي يساوي الواحد الصحيح؟', k: ['واحد', 'صحيح'], a: () => 'كل كسر بسطه يساوي مقامه، مثل ٢/٢ و ٥/٥ و ١٠/١٠.' }
    ]
  });

  /* ======================= الدرس الأول: الكسور المتكافئة (ص 68–72) ======================= */
  const EQ = [
    ['bread', 'رغيف أم خالد ص 68: ١/٢ × ٢', 1, 2, 'mul', 2], ['bread4', 'ص 68: ١/٢ × ٤ = ٤/٨', 1, 2, 'mul', 4], ['apple', 'التفاح ص 68: ٣/٦', 3, 6, 'simp', 3],
    ['a7a', 'نشاط 7 ص 70: ٥/٩', 5, 9, 'mul', 2], ['a7b', 'نشاط 7: ٥/٦', 5, 6, 'mul', 3], ['a7c', 'نشاط 7: ٣/١٠', 3, 10, 'mul', 2],
    ['s612', 'ص 70: ٦/١٢ ÷ ٣', 6, 12, 'div', 3], ['s24', 'ص 70: ٢/٤ ÷ ٢', 2, 4, 'div', 2],
    ['p712', 'ص 71: ٧/١٢ (بأبسط صورة؟)', 7, 12, 'simp', 2], ['p1931', 'ص 71: ١٩/٣١', 19, 31, 'simp', 2], ['p325', 'ص 71: ٣/٢٥', 3, 25, 'simp', 2],
    ['a10a', 'نشاط 10 ص 71: ٥/١٠', 5, 10, 'simp', 5], ['a10b', 'نشاط 10: ١٢/٢٠', 12, 20, 'simp', 2], ['a10c', 'نشاط 10: ٢٠/٣٠', 20, 30, 'simp', 2],
    ['a11a', 'نشاط 11 ص 72: ١٦/٢٦', 16, 26, 'simp', 2], ['a11b', 'نشاط 11: ٢٨/٤٩', 28, 49, 'simp', 7], ['a13', 'نشاط 13 ص 72: ٦/١٨ ÷ ٣', 6, 18, 'div', 3],
    ['r4', 'مراجعة ص 87: ٤/١٢', 4, 12, 'simp', 2], ['r37', 'مراجعة ص 87: ٣/٧ = ؟/٢١', 3, 7, 'mul', 3], ['r63', 'مراجعة ص 87: ٦/٣ = ؟/١٢', 6, 3, 'mul', 4], ['r810', 'مراجعة ص 87: ٨/١٠ = ؟/١٠٠', 8, 10, 'mul', 10]
  ];
  // سلسلة التبسيط خطوة خطوة: نقسم على أصغر عامل مشترك في كل مرة
  const chain = (n, d) => { const out = [[n, d]]; let f = 2; while (G.gcd(n, d) > 1) { if (n % f === 0 && d % f === 0) { n /= f; d /= f; out.push([n, d, f]); } else f++; } return out; };
  G.reg({
    id: 'equivalent-fractions', unit: U, order: 2, lesson: '4-1', lessonTitle: 'الكسور المتكافئة', page: 68,
    titleAr: 'الكسور المتكافئة وأبسط صورة', titleEn: 'Equivalent Fractions & Simplest Form', tags: 'كسور متكافئه مكافئ ضرب قسمه البسط المقام ابسط صوره عامل مشترك رغيف تفاح',
    formula: '\\frac{a}{b} = \\frac{a \\times k}{b \\times k} = \\frac{a \\div k}{b \\div k}',
    book: 'نضرب (أو نقسم) البسط والمقام في العدد نفسه فنحصل على كسر مكافئ ؛ والكسر بأبسط صورة إذا لم يوجد عامل مشترك بين بسطه ومقامه غير ١',
    summary: 'نحصل على كسر مكافئ بضرب البسط والمقام في العدد نفسه، أو بقسمتهما على عامل مشترك. ويكون الكسر **بأبسط صورة** إذا لم يكن بين بسطه ومقامه عامل مشترك غير الواحد.',
    vars: [['a', 'البسط', ''], ['b', 'المقام', ''], ['k', 'العدد الذي نضرب فيه أو نقسم عليه', 'من ٢ إلى ١٠']],
    ar: { a: 'البسط', b: 'المقام', k: 'ك' },
    params: [
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'bread', options: G.opts(EQ.map((e) => [e[0], e[1]]).concat([['custom', 'كسر من اختياري']])) },
      { key: 'mode', label: '\\text{العملية}', type: 'select', value: 'mul', options: [['mul', 'نضرب البسط والمقام في العدد نفسه'], ['div', 'نقسم البسط والمقام على العدد نفسه'], ['simp', 'نكتب الكسر بأبسط صورة']] },
      { key: 'n', label: '\\text{البسط}', min: 1, max: 30, step: 1, value: 1, int: true },
      { key: 'd', label: '\\text{المقام}', min: 2, max: 50, step: 1, value: 2, int: true },
      { key: 'k', label: '\\text{العدد}', min: 2, max: 10, step: 1, value: 2, int: true, hidden: (p) => p.mode === 'simp' }
    ],
    onSet(p, key) {
      if (key === 'ex' && p.ex !== 'custom') { const e = EQ.find((x) => x[0] === p.ex); p.n = e[2]; p.d = e[3]; p.mode = e[4]; p.k = e[5]; }
      else if (key !== 'ex') p.ex = 'custom';
    },
    custom: true, canvasHint: 'الشريط العلوي هو الكسر الأصلي، والسفلي هو الكسر المكافئ: الجزء المظلل نفسه، لكن عدد الأجزاء تغيّر.',
    compute(p) {
      const n = p.n, d = p.d; let r, ok = true, ch = null;
      if (p.mode === 'mul') r = [n * p.k, d * p.k];
      else if (p.mode === 'div') { ok = n % p.k === 0 && d % p.k === 0; r = ok ? [n / p.k, d / p.k] : [n, d]; }
      else { ch = chain(n, d); r = ch[ch.length - 1]; }
      return { n: n, d: d, r: [r[0], r[1]], ok: ok, ch: ch, g: G.gcd(n, d), simplest: G.gcd(n, d) === 1 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const x0 = nar ? 60 : 110, x1 = W - (nar ? 16 : 40), w = x1 - x0; const bh = Math.min(54, H * 0.16);
      const y1 = H * 0.18, y2 = H * 0.62; const big = d.n > d.d || d.r[0] > d.r[1];
      const draw = (n, dd, y, col) => {
        const wholes = Math.max(1, Math.ceil(n / dd)); const ww = (w - (wholes - 1) * 8) / wholes;
        for (let i = 0; i < wholes; i++) { const nn = Math.max(0, Math.min(dd, n - i * dd)); if (dd <= 60) G.bar(ctx, x1 - (i + 1) * ww - i * 8, y, ww, bh, nn, dd, col, c); }
      };
      draw(d.n, d.d, y1, c.c1); G.frac(ctx, d.n, d.d, nar ? 30 : 55, y1 + bh / 2, { color: c.c1, size: nar ? 16 : 20 });
      draw(d.r[0], d.r[1], y2, d.ok ? c.c3 : c.c2); G.frac(ctx, d.r[0], d.r[1], nar ? 30 : 55, y2 + bh / 2, { color: d.ok ? c.c3 : c.c2, size: nar ? 16 : 20 });
      const mid = (y1 + bh + y2) / 2; const lab = p.mode === 'mul' ? '× ' + p.k + ' للبسط والمقام' : p.mode === 'div' ? (d.ok ? '÷ ' + p.k + ' للبسط والمقام' : G.L(p.k) + ' ليس عاملاً مشتركاً بين ' + G.L(d.n) + ' و ' + G.L(d.d)) : (d.simplest ? 'الكسر بأبسط صورة' : '÷ ' + G.L(d.g) + ' (القاسم المشترك الأكبر)');
      G.arrow(ctx, x0 + w / 2, y1 + bh + 8, x0 + w / 2, y2 - 8, d.ok ? c.c4 : c.c2, 2.4);
      G.txt(ctx, lab, x0 + w / 2 + (nar ? 0 : 16), mid, { color: d.ok ? c.c4 : c.c2, size: nar ? 12 : 14, w: '800', halo: c.bg, align: nar ? 'center' : 'right' });
      if (big) G.txt(ctx, 'كسر غير حقيقي: أكثر من واحد صحيح', x0 + w / 2, H - 14, { color: c.muted, size: 12 });
    },
    live(p, d) {
      if (p.mode === 'mul') return fr(d.n, d.d) + ' = ' + fr(d.n + ' \\times ' + p.k, d.d + ' \\times ' + p.k) + ' = ' + fr(d.r[0], d.r[1]);
      if (p.mode === 'div') return d.ok ? fr(d.n, d.d) + ' = ' + fr(d.n + ' \\div ' + p.k, d.d + ' \\div ' + p.k) + ' = ' + fr(d.r[0], d.r[1]) : '\\text{' + p.k + ' لا يقسم البسط والمقام معاً}';
      return d.ch.map((x) => fr(x[0], x[1])).join(' = ');
    },
    results(p, d) {
      return [['الكسر الأصلي', fr(d.n, d.d), true], ['الكسر المكافئ', fr(d.r[0], d.r[1]), true, d.ok ? 'pos' : 'neg'], ['أبسط صورة', nice(d.n, d.d), true],
        ['هل الأصلي بأبسط صورة؟', d.simplest ? 'نعم ✔ (لا عامل مشترك غير ١)' : 'لا ✘ (عامل مشترك ' + G.L(d.g) + ')', false, d.simplest ? 'pos' : 'neg']];
    },
    steps(p, d) {
      if (p.mode === 'mul') return ['نضرب البسط في ' + G.L(p.k) + ': $' + d.n + ' \\times ' + p.k + ' = ' + d.r[0] + '$.', 'ونضرب المقام في العدد نفسه: $' + d.d + ' \\times ' + p.k + ' = ' + d.r[1] + '$.', 'إذن $' + fr(d.n, d.d) + ' = ' + fr(d.r[0], d.r[1]) + '$ (كسران متكافئان).'];
      if (p.mode === 'div') return d.ok ? ['$' + p.k + '$ عامل مشترك للبسط والمقام.', 'نقسمهما عليه: $' + fr(d.n, d.d) + ' = ' + fr(d.r[0], d.r[1]) + '$.'] : ['$' + p.k + '$ لا يقسم البسط والمقام معاً، فلا نحصل على كسر مكافئ بالقسمة عليه. جرّب عاملاً مشتركاً آخر.'];
      if (d.simplest) return ['لا يوجد عامل مشترك بين ' + G.L(d.n) + ' و ' + G.L(d.d) + ' غير الواحد، فالكسر $' + fr(d.n, d.d) + '$ بأبسط صورة.'];
      return d.ch.slice(1).map((x, i) => 'نقسم البسط والمقام على ' + G.L(x[2]) + ': $' + fr(d.ch[i][0], d.ch[i][1]) + ' = ' + fr(x[0], x[1]) + '$.').concat(['لم يبق عامل مشترك غير ١ ، فالكسر $' + fr(d.r[0], d.r[1]) + '$ بأبسط صورة.']);
    },
    explain(a, b, da, db) { return da && (a.k !== b.k || a.mode !== b.mode) ? ['المساحة المظللة لم تتغير، فالكسران متكافئان؛ تغيّر فقط عدد الأجزاء وحجمها.'] : []; },
    learn: [
      '**نشاط 1 ص 68:** رغيفان متساويان: الأول نصفان والثاني أربعة أرباع، فنلاحظ أن ١/٢ = ٢/٤ ، ويسمى الكسران متكافئين.',
      '**ص 68:** تفاحات أكلنا ٣ من ٦ ، فالكسر ٣/٦ = ١/٢.',
      '**نشاط 7 ص 70:** نكتب كسوراً مكافئة لـ ٥/٩ و ٥/٦ و ٣/١٠ بالضرب.',
      '**ص 70:** ٦/١٢ = ٢/٤ (بالقسمة على ٣)، و ٢/٤ = ١/٢.',
      '**ص 71:** ٧/١٢ و ١٩/٣١ و ٤/٧ و ٣/٢٥ بأبسط صورة؛ ونكتب ٥/١٠ و ١٢/٢٠ و ٢٠/٣٠ بأبسط صورة: ١/٢ ، ٣/٥ ، ٢/٣.',
      '**نشاط 11 ص 72:** ١٦/٢٦ = ٨/١٣ ، و ٢٨/٤٩ = ٤/٧.',
      '**نشاط 13 ص 72:** ٦/١٨ = ٢/٦ = ١/٣.'
    ],
    challenges: [
      { q: 'جد كسراً مكافئاً لـ ١/٢ مقامه ٨ (ص 68).', hint: 'اضرب في ٤.', init: { ex: 'custom', mode: 'mul', n: 1, d: 2, k: 2 }, check: (p, d) => d.r[0] === 4 && d.r[1] === 8 },
      { q: 'اكتب ٢٨/٤٩ بأبسط صورة (نشاط 11).', hint: 'اختر «أبسط صورة» وضع الكسر.', init: { ex: 'custom', mode: 'mul', n: 2, d: 4, k: 2 }, check: (p, d) => p.mode === 'simp' && p.n === 28 && p.d === 49, why: () => '٢٨/٤٩ = ٤/٧ بالقسمة على ٧.' },
      { q: 'أكمل: ٣/٧ = ؟/٢١ (مراجعة ص 87).', hint: 'كم مرة يحوي ٢١ العدد ٧؟', init: { ex: 'custom', mode: 'mul', n: 3, d: 7, k: 2 }, check: (p, d) => p.n === 3 && p.d === 7 && d.r[1] === 21, why: () => '٣/٧ = ٩/٢١.' },
      { q: 'بسّط ٦/١٨ بالقسمة على ٣ (نشاط 13).', hint: 'اختر القسمة والعدد ٣.', init: { ex: 'custom', mode: 'mul', n: 6, d: 18, k: 2 }, check: (p, d) => p.mode === 'div' && p.n === 6 && p.d === 18 && p.k === 3 }
    ],
    tutor: [
      { q: 'كيف أعرف أن الكسر بأبسط صورة؟', k: ['ابسط', 'صوره'], a: () => 'إذا لم يوجد عدد غير الواحد يقسم البسط والمقام معاً، مثل ٧/١٢.' },
      { q: 'لماذا نضرب البسط والمقام معاً؟', k: ['نضرب', 'معا'], a: () => 'لأننا نقسم كل جزء إلى أجزاء أصغر متساوية؛ فيزيد عدد الأجزاء المظللة وعدد الأجزاء الكلية بالنسبة نفسها، ولا تتغير المساحة المظللة.' },
      { q: 'ما أبسط صورة للكسر الحالي؟', k: ['الحالي', 'ابسط'], a: (p, d) => '$' + fr(d.n, d.d) + ' = ' + nice(d.n, d.d) + '$.' }
    ]
  });

  /* ======================= الدرس الثاني: مقارنة الكسور (ص 73–75) ======================= */
  const CMP = [
    ['n17', 'ص 73: ١/٥ و ١/٧', [1, 5], [1, 7]], ['like', 'ص 73: كسران متجانسان ٣/٥ و ٢/٥', [3, 5], [2, 5]],
    ['q1', 'ص 74: ١/٤ و ٤/٨', [1, 4], [4, 8]], ['q2', 'ص 74: ١/٢ و ٥/٦', [1, 2], [5, 6]], ['q3', 'ص 74: ٨/١٠ و ٤/٥', [8, 10], [4, 5]], ['q4', 'ص 74: ٢/٤ و ١/٣', [2, 4], [1, 3]],
    ['a4b', 'نشاط 4 ص 75: ٦/١٨ و ٣/٩', [6, 18], [3, 9]], ['a4c', 'نشاط 4: ١/٣ و ٤/٩', [1, 3], [4, 9]], ['a4d', 'نشاط 4: ٢/٣ و ٢/٥', [2, 3], [2, 5]],
    ['a5a', 'نشاط 5 ص 75: ٣/٥ و ٢/٧', [3, 5], [2, 7]], ['a5b', 'نشاط 5: ٢/٩ و ٥/٦', [2, 9], [5, 6]],
    ['hour', 'ص 75: ١/٣ ساعة و ١/٤ ساعة', [1, 3], [1, 4]], ['litre', 'ص 75: ٣/٤ لتر و ١/٢ لتر', [3, 4], [1, 2]],
    ['r1', 'مراجعة ص 87: ٤/٧ و ٤/٨', [4, 7], [4, 8]]
  ];
  const methodOf = (a, b) => (a[1] === b[1] ? 'den' : a[0] === b[0] ? 'num' : 'common');
  G.reg({
    id: 'compare-fractions', unit: U, order: 3, lesson: '4-2', lessonTitle: 'مقارنة الكسور', page: 73,
    titleAr: 'مقارنة كسرين عاديين', titleEn: 'Comparing Fractions', tags: 'مقارنه كسور متجانسه توحيد المقامات البسط المقام اكبر اصغر ساعه لتر',
    formula: '\\frac{a}{n} > \\frac{b}{n} \\iff a > b',
    book: 'الكسران المتجانسان (المقام نفسه): الأكبر بسطاً هو الأكبر ؛ إذا تساوى البسطان فالأصغر مقاماً هو الأكبر ؛ وإلا نوحّد المقامات ثم نقارن',
    summary: 'نقارن كسرين **متجانسين** (لهما المقام نفسه) بمقارنة البسطين. وإذا تساوى البسطان فالكسر ذو المقام الأصغر هو الأكبر. وإذا اختلف البسطان والمقامان **نوحّد المقامات** بكتابة كسرين مكافئين لهما المقام نفسه، ثم نقارن البسطين.',
    vars: [['\\frac{a}{b}', 'الكسر الأول', ''], ['\\frac{c}{d}', 'الكسر الثاني', '']],
    params: [
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'q2', options: G.opts(CMP.map((e) => [e[0], e[1]]).concat([['custom', 'كسران من اختياري']])) },
      { key: 'n1', label: '\\text{بسط الأول}', min: 1, max: 20, step: 1, value: 1, int: true }, { key: 'd1', label: '\\text{مقام الأول}', min: 2, max: 20, step: 1, value: 2, int: true },
      { key: 'n2', label: '\\text{بسط الثاني}', min: 1, max: 20, step: 1, value: 5, int: true }, { key: 'd2', label: '\\text{مقام الثاني}', min: 2, max: 20, step: 1, value: 6, int: true }
    ],
    onSet(p, k) { if (k === 'ex' && p.ex !== 'custom') { const e = CMP.find((x) => x[0] === p.ex); p.n1 = e[2][0]; p.d1 = e[2][1]; p.n2 = e[3][0]; p.d2 = e[3][1]; } else if (k !== 'ex') p.ex = 'custom'; },
    custom: true, canvasHint: 'الشريطان بالطول نفسه (الواحد الصحيح). في الصف الثالث نوحّد المقامات فيصبح للكسرين أجزاء متساوية يمكن عدّها.',
    compute(p) { const a = [p.n1, p.d1], b = [p.n2, p.d2]; return { a: a, b: b, k: G.cmp(a, b), m: methodOf(a, b), u: G.common(a, b) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const x0 = nar ? 56 : 100, x1 = W - (nar ? 12 : 30), w = x1 - x0; const bh = Math.min(42, H * 0.12);
      const rows = [[d.a, c.c1, H * 0.1], [d.b, c.c4, H * 0.3]];
      rows.forEach((r) => { if (r[0][1] <= 60) G.bar(ctx, x0, r[2], w, bh, Math.min(r[0][0], r[0][1]), r[0][1], r[1], c); G.frac(ctx, r[0][0], r[0][1], nar ? 28 : 50, r[2] + bh / 2, { color: r[1], size: nar ? 15 : 19 }); });
      const ya = H * 0.56, yb = ya + bh + 10;
      if (d.m === 'common' && d.u.D <= 60) {
        G.txt(ctx, 'نوحّد المقامات إلى ' + G.L(d.u.D), x0 + w / 2, ya - 16, { color: c.c5, size: nar ? 12 : 14, w: '800' });
        G.bar(ctx, x0, ya, w, bh * 0.8, Math.min(d.u.a[0], d.u.D), d.u.D, c.c1, c); G.bar(ctx, x0, yb, w, bh * 0.8, Math.min(d.u.b[0], d.u.D), d.u.D, c.c4, c);
        G.frac(ctx, d.u.a[0], d.u.D, nar ? 28 : 50, ya + bh * 0.4, { color: c.c1, size: nar ? 13 : 16 }); G.frac(ctx, d.u.b[0], d.u.D, nar ? 28 : 50, yb + bh * 0.4, { color: c.c4, size: nar ? 13 : 16 });
      }
      // خطا نهاية الكسرين
      [[d.a, c.c1], [d.b, c.c4]].forEach((r) => { const lx = x1 - Math.min(1, r[0][0] / r[0][1]) * w; ctx.save(); ctx.strokeStyle = r[1]; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx, H * 0.08); ctx.lineTo(lx, H * 0.3 + bh + 6); ctx.stroke(); ctx.restore(); });
      const yy = H - (nar ? 26 : 32); ctx.save(); ctx.font = '800 ' + (nar ? 18 : 22) + 'px system-ui'; ctx.restore();
      G.frac(ctx, d.a[0], d.a[1], W / 2 + 46, yy, { color: c.c1, size: nar ? 15 : 18 }); G.txt(ctx, d.k > 0 ? '<' : d.k < 0 ? '>' : '=', W / 2, yy, { color: c.c3, size: nar ? 22 : 26, w: '800' }); G.frac(ctx, d.b[0], d.b[1], W / 2 - 46, yy, { color: c.c4, size: nar ? 15 : 18 });
    },
    live(p, d) { return fr(d.a[0], d.a[1]) + ' ' + G.sign(d.k) + ' ' + fr(d.b[0], d.b[1]); },
    results(p, d) {
      return [['المقارنة', fr(d.a[0], d.a[1]) + ' ' + G.sign(d.k) + ' ' + fr(d.b[0], d.b[1]), true, 'pos'],
        ['الطريقة', d.m === 'den' ? 'كسران متجانسان: نقارن البسطين' : d.m === 'num' ? 'البسطان متساويان: الأصغر مقاماً أكبر' : 'نوحّد المقامات ثم نقارن البسطين', false],
        ['بعد توحيد المقامات', fr(d.u.a[0], d.u.D) + ' \\text{ و } ' + fr(d.u.b[0], d.u.D), true]];
    },
    steps(p, d) {
      const A = fr(d.a[0], d.a[1]), B = fr(d.b[0], d.b[1]);
      if (d.m === 'den') return ['المقامان متساويان (' + G.L(d.a[1]) + ')، فالكسران متجانسان.', 'نقارن البسطين: $' + d.a[0] + ' ' + G.sign(Math.sign(d.a[0] - d.b[0])) + ' ' + d.b[0] + '$ ، إذن $' + A + ' ' + G.sign(d.k) + ' ' + B + '$.'];
      if (d.m === 'num') return ['البسطان متساويان (' + G.L(d.a[0]) + ').', 'الكسر ذو المقام الأصغر أجزاؤه أكبر، إذن $' + A + ' ' + G.sign(d.k) + ' ' + B + '$.'];
      return ['المقامان مختلفان، فنوحّدهما إلى ' + G.L(d.u.D) + (d.u.ka === 1 || d.u.kb === 1 ? ' (أحد المقامين مضاعف للآخر).' : ' (نضرب كل كسر في مقام الآخر).'),
        '$' + A + ' = ' + fr(d.u.a[0], d.u.D) + '$ و $' + B + ' = ' + fr(d.u.b[0], d.u.D) + '$.',
        'نقارن البسطين: $' + fr(d.u.a[0], d.u.D) + ' ' + G.sign(d.k) + ' ' + fr(d.u.b[0], d.u.D) + '$ ، إذن $' + A + ' ' + G.sign(d.k) + ' ' + B + '$.'];
    },
    explain(a, b, da, db) { return da && da.m !== db.m ? [db.m === 'den' ? 'أصبح الكسران متجانسين.' : db.m === 'num' ? 'أصبح البسطان متساويين.' : 'اختلف البسطان والمقامان، فنحتاج توحيد المقامات.'] : []; },
    learn: [
      '**ص 73:** إذا تساوى البسطان فالكسر الذي مقامه أصغر هو الأكبر: ١/٥ > ١/٧.',
      '**ص 73:** الكسور المتجانسة لها المقام نفسه، ونقارنها بمقارنة البسطين.',
      '**ص 74:** نقارن بتوحيد المقامات: ١/٤ < ٤/٨ ، ١/٢ < ٥/٦ ، ٨/١٠ = ٤/٥ ، ٢/٤ > ١/٣.',
      '**نشاط 5 ص 75:** ٣/٥ و ٢/٧ نوحّدهما إلى ٣٥: ٢١/٣٥ > ١٠/٣٥.',
      '**ص 75:** ١/٣ ساعة > ١/٤ ساعة ، و ٣/٤ لتر > ١/٢ لتر.'
    ],
    challenges: [
      { q: 'قارن ٣/٥ و ٢/٧ (نشاط 5).', hint: 'اختر المثال أو ضع الكسرين.', init: { ex: 'custom', n1: 1, d1: 2, n2: 1, d2: 3 }, check: (p) => p.n1 === 3 && p.d1 === 5 && p.n2 === 2 && p.d2 === 7, why: () => '٢١/٣٥ > ١٠/٣٥ ، إذن ٣/٥ > ٢/٧.' },
      { q: 'اجعل الكسرين متكافئين: ضع كسراً ثانياً يساوي ٤/٥ مقامه ١٠.', hint: '٤/٥ = ؟/١٠', init: { ex: 'custom', n1: 4, d1: 5, n2: 1, d2: 10 }, check: (p, d) => p.n1 === 4 && p.d1 === 5 && p.d2 === 10 && d.k === 0 },
      { q: 'جد كسراً من الأسداس أكبر من ٢/٣ (مراجعة ص 87).', hint: '٢/٣ = ٤/٦.', init: { ex: 'custom', n1: 2, d1: 3, n2: 1, d2: 6 }, check: (p, d) => p.n1 === 2 && p.d1 === 3 && p.d2 === 6 && d.k < 0 }
    ],
    tutor: [
      { q: 'كيف أوحّد المقامات؟', k: ['اوحد', 'توحيد', 'المقامات'], a: () => 'إذا كان أحد المقامين مضاعفاً للآخر نضرب الكسر ذا المقام الأصغر فقط، وإلا نضرب بسط ومقام كل كسر في مقام الآخر.' },
      { q: 'أيهما أكبر الآن؟', k: ['اكبر', 'الان'], a: (p, d) => '$' + fr(d.a[0], d.a[1]) + ' ' + G.sign(d.k) + ' ' + fr(d.b[0], d.b[1]) + '$.' },
      { q: 'هل الكسر الأكبر مقاماً هو الأكبر دائماً؟', k: ['مقاما', 'دائما'], a: () => 'لا. إذا تساوى البسطان فالأكبر مقاماً هو الأصغر، مثل ١/٧ < ١/٥.' }
    ]
  });

  /* ======================= الدرس الثالث: جمع الكسور وطرحها (ص 76–79) ======================= */
  const ADD = [
    ['grid', 'نشاط 1 ص 76: الأخضر ٦/١٢ + الأصفر ٤/١٢', 'add', [6, 12], [4, 12]], ['a2', 'نشاط 2: ٢/٤ + ١/٤', 'add', [2, 4], [1, 4]],
    ['a3a', 'نشاط 3: ٢/٩ + ١/٩', 'add', [2, 9], [1, 9]], ['a3b', 'نشاط 3: ٢/١٥ + ٨/١٥', 'add', [2, 15], [8, 15]],
    ['a5a', 'نشاط 5 (أ) ص 77: ٣/٤ + ٢/١٢', 'add', [3, 4], [2, 12]], ['a5b', 'نشاط 5 (ب): ٢/٣ + ٣/٩', 'add', [2, 3], [3, 9]], ['a5c', 'نشاط 5 (جـ): ٣/٧ + ٢/٥', 'add', [3, 7], [2, 5]], ['a5d', 'نشاط 5 (د): ٢/٧ + ٥/٨', 'add', [2, 7], [5, 8]],
    ['a6', 'نشاط 6 ص 78: ٨/٩ − ٢/٩', 'sub', [8, 9], [2, 9]], ['a7a', 'نشاط 7: ٤/٥ − ١/٥', 'sub', [4, 5], [1, 5]], ['a7b', 'نشاط 7: ٧/١١ − ٣/١١', 'sub', [7, 11], [3, 11]],
    ['a8', 'نشاط 8: ٤/٥ − ٤/١٥', 'sub', [4, 5], [4, 15]], ['a8a', 'نشاط 8 (أ): ٢/٣ − ٢/٦', 'sub', [2, 3], [2, 6]], ['a8b', 'نشاط 8 (ب): ١ − ٣/٧', 'sub', [7, 7], [3, 7]], ['a8c', 'نشاط 8 (جـ): ٦/٧ − ٤/٥', 'sub', [6, 7], [4, 5]],
    ['a9a', 'نشاط 9 ص 79: ٢/٥٠ − ١/١٠٠', 'sub', [2, 50], [1, 100]], ['a9b', 'نشاط 9: ١/٢ − ٣/٩', 'sub', [1, 2], [3, 9]], ['a11', 'نشاط 11: ١/٢ − ١/٣', 'sub', [1, 2], [1, 3]],
    ['cake', 'كعكة نشاط 8 ص 86: ٢/٨ − ٣/١٦', 'sub', [2, 8], [3, 16]],
    ['r6a', 'مراجعة 6 ص 88: ١/٤ + ٥/٨', 'add', [1, 4], [5, 8]], ['r6b', 'مراجعة 6: ١/٢ + ١/١١', 'add', [1, 2], [1, 11]], ['r6c', 'مراجعة 6: ١٨/٢٧ + ٤/٩', 'add', [18, 27], [4, 9]], ['r6d', 'مراجعة 6: ٨/١٠ − ٢/٥', 'sub', [8, 10], [2, 5]], ['r6e', 'مراجعة 6: ٥/٧ − ٢/٤', 'sub', [5, 7], [2, 4]],
    ['nuts', 'مراجعة 7 ص 88: مكسرات ٣/٤ − ٢/٣', 'sub', [3, 4], [2, 3]],
    ['as1', 'نشاط 10 ص 79 (التجميع): ٢/٧ + ١/٧ + ٣/٧', 'assoc', [2, 7], [1, 7], 3], ['as2', 'نشاط 10 (أ): ٢/٨ + ٣/٨ + ١/٨', 'assoc', [2, 8], [3, 8], 1], ['as3', 'نشاط 10 (ب): ١/٩ + ٣/٩ + ٤/٩', 'assoc', [1, 9], [3, 9], 4]
  ];
  G.reg({
    id: 'add-sub-fractions', unit: U, order: 4, lesson: '4-3', lessonTitle: 'جمع وطرح الكسور', page: 76,
    titleAr: 'جمع الكسور وطرحها وتوحيد المقامات', titleEn: 'Adding & Subtracting Fractions', tags: 'جمع طرح كسور متجانسه غير متجانسه توحيد المقامات تجميع خاصيه زخرفه دائره تحقق',
    formula: '\\frac{a}{n} + \\frac{b}{n} = \\frac{a + b}{n},\\qquad \\frac{a}{n} - \\frac{b}{n} = \\frac{a - b}{n}',
    book: 'لجمع (أو طرح) كسرين متجانسين نجمع (نطرح) البسطين ويبقى المقام كما هو ؛ ولكسرين غير متجانسين نوحّد المقامات أولاً',
    summary: 'لجمع كسرين **متجانسين** نجمع البسطين ويبقى المقام كما هو، ولطرحهما نطرح البسطين. وإذا كان الكسران **غير متجانسين** نوحّد المقامات أولاً ثم نجمع أو نطرح. ونتحقق من الطرح بالجمع، والجمع يحقق **خاصية التجميع**.',
    vars: [['\\frac{a}{b}', 'الكسر الأول', ''], ['\\frac{c}{d}', 'الكسر الثاني', '']],
    params: [
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'a5a', options: G.opts(ADD.map((e) => [e[0], e[1]]).concat([['custom', 'كسران من اختياري']])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'add', options: [['add', 'جمع +'], ['sub', 'طرح −'], ['assoc', 'جمع ثلاثة كسور متجانسة (التجميع)']] },
      { key: 'n1', label: '\\text{بسط الأول}', min: 0, max: 20, step: 1, value: 3, int: true }, { key: 'd1', label: '\\text{مقام الأول}', min: 2, max: 100, step: 1, value: 4, int: true },
      { key: 'n2', label: '\\text{بسط الثاني}', min: 0, max: 20, step: 1, value: 2, int: true }, { key: 'd2', label: '\\text{مقام الثاني}', min: 2, max: 100, step: 1, value: 12, int: true, hidden: (p) => p.op === 'assoc' },
      { key: 'n3', label: '\\text{بسط الثالث}', min: 0, max: 20, step: 1, value: 3, int: true, hidden: (p) => p.op !== 'assoc' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = ADD.find((x) => x[0] === p.ex); p.op = e[2]; p.n1 = e[3][0]; p.d1 = e[3][1]; p.n2 = e[4][0]; p.d2 = e[4][1]; if (e[5] !== undefined) p.n3 = e[5]; }
      else if (k !== 'ex') p.ex = 'custom';
    },
    custom: true, canvasHint: 'الأزرق الكسر الأول، والبرتقالي الكسر الثاني بعد توحيد المقامات. في الطرح تظهر الأجزاء المحذوفة مشطوبة.',
    compute(p) {
      if (p.op === 'assoc') { const D = p.d1; const t = p.n1 + p.n2 + p.n3; return { assoc: true, D: D, ns: [p.n1, p.n2, p.n3], r: [t, D], g1: p.n1 + p.n2, g2: p.n2 + p.n3 }; }
      const a = [p.n1, p.d1], b = [p.n2, p.d2]; const u = G.common(a, b); const like = p.d1 === p.d2;
      const rn = p.op === 'add' ? u.a[0] + u.b[0] : u.a[0] - u.b[0];
      return { a: a, b: b, u: u, like: like, r: [rn, u.D], neg: rn < 0 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const x0 = nar ? 12 : 40, x1 = W - (nar ? 12 : 40), w = x1 - x0;
      if (d.assoc) {
        const bh = Math.min(46, H * 0.14); const cols = [c.c1, c.c4, c.c3]; let k = 0; const pw = w / d.D;
        const y = H * 0.2; for (let i = 0; i < d.D; i++) { ctx.fillStyle = 'transparent'; }
        for (let j = 0; j < 3; j++) for (let i = 0; i < d.ns[j]; i++, k++) { if (k >= d.D) break; ctx.fillStyle = cols[j]; ctx.globalAlpha = 0.8; ctx.fillRect(x1 - (k + 1) * pw, y, pw, bh); ctx.globalAlpha = 1; }
        for (let i = 0; i < d.D; i++) { ctx.strokeStyle = c.text; ctx.lineWidth = 1.4; ctx.strokeRect(x1 - (i + 1) * pw, y, pw, bh); }
        const yy = H * 0.58; const gap = nar ? 0.32 : 0.28;
        G.txt(ctx, '(' + G.L(d.ns[0]) + ' + ' + G.L(d.ns[1]) + ') + ' + G.L(d.ns[2]) + ' = ' + G.L(d.g1) + ' + ' + G.L(d.ns[2]) + ' = ' + G.L(d.r[0]), W / 2, yy, { color: c.c1, size: nar ? 13 : 16, w: '800' });
        G.txt(ctx, G.L(d.ns[0]) + ' + (' + G.L(d.ns[1]) + ' + ' + G.L(d.ns[2]) + ') = ' + G.L(d.ns[0]) + ' + ' + G.L(d.g2) + ' = ' + G.L(d.r[0]), W / 2, yy + H * gap * 0.4, { color: c.c4, size: nar ? 13 : 16, w: '800' });
        G.txt(ctx, 'البسوط فقط تُجمع، والمقام ' + G.L(d.D) + ' يبقى كما هو', W / 2, H - 16, { color: c.muted, size: 12 });
        return;
      }
      const D = d.u.D; const bh = Math.min(44, H * 0.13);
      const rowA = H * 0.08, rowB = rowA + bh + 22, rowR = H * 0.6;
      if (d.a[1] <= 100) G.bar(ctx, x0, rowA, w, bh * 0.75, Math.min(d.a[0], d.a[1]), d.a[1], c.c1, c);
      if (d.b[1] <= 100) G.bar(ctx, x0, rowB, w, bh * 0.75, Math.min(d.b[0], d.b[1]), d.b[1], c.c4, c);
      G.txt(ctx, 'بعد توحيد المقامات إلى ' + G.L(D), W / 2, rowR - 16, { color: c.c5, size: nar ? 12 : 14, w: '800' });
      const pw = w / Math.max(D, 1); const A = d.u.a[0], B = d.u.b[0];
      if (D <= 100) {
        for (let i = 0; i < D; i++) {
          const x = x1 - (i + 1) * pw; let col = null, cross = false;
          if (p.op === 'add') { if (i < A) col = c.c1; else if (i < A + B) col = c.c4; } else { if (i < A) col = c.c1; if (i >= A - B && i < A) cross = true; }
          if (col && i < D) { ctx.fillStyle = col; ctx.globalAlpha = cross ? 0.25 : 0.8; ctx.fillRect(x, rowR, pw, bh); ctx.globalAlpha = 1; }
          ctx.strokeStyle = c.text; ctx.lineWidth = D > 40 ? 0.6 : 1.4; ctx.strokeRect(x, rowR, pw, bh);
          if (cross) { ctx.strokeStyle = c.c2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 2, rowR + 2); ctx.lineTo(x + pw - 2, rowR + bh - 2); ctx.stroke(); }
        }
        if (p.op === 'add' && A + B > D) G.txt(ctx, 'المجموع أكبر من واحد صحيح', W / 2, rowR + bh + 16, { color: c.c2, size: 12, w: '700' });
      }
      const yy = H - (nar ? 28 : 34); const fs = nar ? 14 : 17; const sp = nar ? 44 : 60;
      G.frac(ctx, d.a[0], d.a[1], W / 2 + 2 * sp, yy, { color: c.c1, size: fs }); G.txt(ctx, p.op === 'add' ? '+' : '−', W / 2 + sp, yy, { color: c.text, size: fs * 1.2, w: '800' });
      G.frac(ctx, d.b[0], d.b[1], W / 2, yy, { color: c.c4, size: fs }); G.txt(ctx, '=', W / 2 - sp, yy, { color: c.text, size: fs * 1.2, w: '800' });
      if (d.neg) G.txt(ctx, '؟', W / 2 - 2 * sp, yy, { color: c.c2, size: fs * 1.3, w: '800' }); else G.frac(ctx, d.r[0], d.r[1], W / 2 - 2 * sp, yy, { color: c.c3, size: fs });
    },
    live(p, d) {
      if (d.assoc) return '\\left(' + fr(d.ns[0], d.D) + ' + ' + fr(d.ns[1], d.D) + '\\right) + ' + fr(d.ns[2], d.D) + ' = ' + fr(d.ns[0], d.D) + ' + \\left(' + fr(d.ns[1], d.D) + ' + ' + fr(d.ns[2], d.D) + '\\right) = ' + fr(d.r[0], d.D);
      const o = p.op === 'add' ? ' + ' : ' - ';
      if (d.neg) return '\\text{الكسر الثاني أكبر من الأول}';
      return fr(d.a[0], d.a[1]) + o + fr(d.b[0], d.b[1]) + (d.like ? '' : ' = ' + fr(d.u.a[0], d.u.D) + o + fr(d.u.b[0], d.u.D)) + ' = ' + fr(d.r[0], d.r[1]);
    },
    results(p, d) {
      if (d.assoc) return [['المجموع', fr(d.r[0], d.D) + (G.gcd(d.r[0], d.D) > 1 || d.r[0] >= d.D ? ' = ' + nice(d.r[0], d.D) : ''), true, 'pos'], ['الخاصية', 'خاصية التجميع: نتيجة الطريقتين واحدة', false]];
      if (d.neg) return [['الناتج', 'الكسر الثاني أكبر من الأول؛ لا نطرحه في هذا الصف', false, 'neg'], ['بعد توحيد المقامات', fr(d.u.a[0], d.u.D) + ' < ' + fr(d.u.b[0], d.u.D), true]];
      const out = [['الناتج', fr(d.r[0], d.r[1]), true, 'pos'], ['بأبسط صورة', nice(d.r[0], d.r[1]), true], ['المقام الموحّد', G.L(d.u.D), false]];
      if (p.op === 'sub') out.push(['التحقق بالجمع', fr(d.r[0], d.u.D) + ' + ' + fr(d.u.b[0], d.u.D) + ' = ' + fr(d.u.a[0], d.u.D), true]);
      return out;
    },
    steps(p, d) {
      if (d.assoc) return ['الكسور متجانسة (المقام ' + G.L(d.D) + ')، فنجمع البسوط.', 'نجمع أولاً الأول والثاني: $' + fr(d.g1, d.D) + '$ ثم نضيف الثالث: $' + fr(d.r[0], d.D) + '$.', 'أو نجمع الثاني والثالث أولاً: $' + fr(d.g2, d.D) + '$ ثم نضيف الأول: $' + fr(d.r[0], d.D) + '$.', 'الناتج واحد في الحالتين، وهذه **خاصية التجميع** (نشاط 10 ص 79).'];
      const s = [];
      if (d.like) s.push('الكسران متجانسان (المقام ' + G.L(d.u.D) + ').');
      else s.push('الكسران غير متجانسين، فنوحّد المقامات إلى ' + G.L(d.u.D) + ': $' + fr(d.a[0], d.a[1]) + ' = ' + fr(d.u.a[0], d.u.D) + '$ و $' + fr(d.b[0], d.b[1]) + ' = ' + fr(d.u.b[0], d.u.D) + '$.');
      if (d.a[0] === d.a[1]) s.push('الواحد الصحيح كسر بسطه يساوي مقامه: $1 = ' + fr(d.a[0], d.a[1]) + '$.');
      if (d.neg) { s.push('البسط الثاني أكبر من الأول، فالكسر الثاني أكبر ولا نطرحه منه.'); return s; }
      s.push((p.op === 'add' ? 'نجمع البسطين: $' + d.u.a[0] + ' + ' + d.u.b[0] : 'نطرح البسطين: $' + d.u.a[0] + ' - ' + d.u.b[0]) + ' = ' + d.r[0] + '$ ويبقى المقام $' + d.u.D + '$.');
      if (G.gcd(d.r[0], d.r[1]) > 1 || d.r[0] >= d.r[1]) s.push('نكتب الناتج بأبسط صورة: $' + fr(d.r[0], d.r[1]) + ' = ' + nice(d.r[0], d.r[1]) + '$.');
      if (p.op === 'sub') s.push('نتحقق بالجمع: $' + fr(d.r[0], d.u.D) + ' + ' + fr(d.u.b[0], d.u.D) + ' = ' + fr(d.u.a[0], d.u.D) + '$ ✔');
      return s;
    },
    explain(a, b, da, db) { return da && !da.assoc && !db.assoc && da.like !== db.like ? [db.like ? 'أصبح الكسران متجانسين؛ لا حاجة لتوحيد المقامات.' : 'اختلف المقامان؛ نوحّدهما أولاً.'] : []; },
    learn: [
      '**نشاط 1 ص 76:** زخرفة من ١٢ جزءاً: الأصفر ٤/١٢ ، الأخضر ٦/١٢ ، الزهري ٢/١٢ ، والأخضر مع الأصفر ١٠/١٢.',
      '**نشاط 2 ص 76 (أستنتج):** ٢/٤ + ١/٤ = ٣/٤ ؛ لجمع كسرين متجانسين نجمع البسط مع البسط ويبقى المقام كما هو.',
      '**نشاط 5 ص 77 (أتعلم):** لجمع كسرين غير متجانسين نجانس الكسور أولاً ثم نجمع: ٣/٤ + ٢/١٢ = ٩/١٢ + ٢/١٢ = ١١/١٢ ، و ٣/٧ + ٢/٥ = ١٥/٣٥ + ١٤/٣٥ = ٢٩/٣٥.',
      '**نشاط 6 ص 78:** دائرة من ٩ أجزاء، الأحمر ٨/٩ وقُص منه ٢/٩: ٨/٩ − ٢/٩ = ٦/٩.',
      '**نشاط 8 ص 78:** ٤/٥ − ٤/١٥ = ١٢/١٥ − ٤/١٥ = ٨/١٥ ؛ والعدد ١ كسر بسطه يساوي مقامه.',
      '**نشاط 10 ص 79:** (٢/٧ + ١/٧) + ٣/٧ = ٢/٧ + (١/٧ + ٣/٧) = ٦/٧ (خاصية التجميع).',
      '**نشاط 8 ص 86:** قالب حلوى: عمر ٢/٨ وكمال ١/٤ وإحسان ٣/١٦ ، فالمجموع ٤/١٦ + ٤/١٦ + ٣/١٦ = ١١/١٦ ، والفرق بين عمر وإحسان ١/١٦ ، والباقي ٥/١٦.'
    ],
    challenges: [
      { q: 'جد ٣/٧ + ٢/٥ (نشاط 5 جـ).', hint: 'نوحّد المقامات إلى ٣٥.', init: { ex: 'custom', op: 'add', n1: 1, d1: 7, n2: 1, d2: 5 }, check: (p) => p.op === 'add' && p.n1 === 3 && p.d1 === 7 && p.n2 === 2 && p.d2 === 5, why: () => '١٥/٣٥ + ١٤/٣٥ = ٢٩/٣٥.' },
      { q: 'جد ١ − ٣/٧ (نشاط 8 ب).', hint: 'اكتب الواحد على صورة ٧/٧.', init: { ex: 'custom', op: 'add', n1: 3, d1: 7, n2: 3, d2: 7 }, check: (p) => p.op === 'sub' && p.n1 === p.d1 && p.d1 === 7 && p.n2 === 3 && p.d2 === 7, why: () => '٧/٧ − ٣/٧ = ٤/٧.' },
      { q: 'اكتب مسألة طرح للكسرين ١/٢ و ١/٣ وجد ناتجها (نشاط 11).', hint: 'نوحّد المقامات إلى ٦.', init: { ex: 'custom', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3 }, check: (p) => p.op === 'sub' && p.n1 === 1 && p.d1 === 2 && p.n2 === 1 && p.d2 === 3, why: () => 'مثلاً: أكل علي ١/٢ الرغيف وأكل أخوه ١/٣ ، فالفرق ٣/٦ − ٢/٦ = ١/٦ (' + G.SOL + ').' },
      { q: 'بيّن خاصية التجميع للكسور ١/٩ و ٣/٩ و ٤/٩.', hint: 'اختر «جمع ثلاثة كسور».', init: { ex: 'custom', op: 'add', n1: 1, d1: 9, n2: 3, d2: 9 }, check: (p) => p.op === 'assoc' && p.d1 === 9 && p.n1 + p.n2 + p.n3 === 8 }
    ],
    tutor: [
      { q: 'لماذا لا نجمع المقامين؟', k: ['المقامين', 'نجمع المقام'], a: () => 'المقام يبيّن حجم الجزء، وحجم الجزء لا يتغير عند الجمع؛ نحن نعدّ الأجزاء فقط، أي نجمع البسوط.' },
      { q: 'كيف أتحقق من الطرح؟', k: ['اتحقق', 'تحقق'], a: () => 'نجمع الناتج مع المطروح، فيجب أن نحصل على المطروح منه (نشاط 9 ص 79).' },
      { q: 'ما الناتج الآن؟', k: ['الناتج', 'الان'], a: (p, d) => (d.neg ? 'الكسر الثاني أكبر من الأول.' : '$' + fr(d.r[0], d.r[1]) + ' = ' + nice(d.r[0], d.r[1]) + '$.') }
    ]
  });

  /* ======================= الدرس الرابع: العدد الكسري (ص 80–83) ======================= */
  const MX = [
    ['hex', 'نشاط 1 ص 80: الشكل السداسي ١ ٢/٦', 'toImp', 1, 2, 6], ['r1', 'نشاط 2: ١ ١/٢', 'toImp', 1, 1, 2], ['r2', 'نشاط 2: ٢ ٣/٤', 'toImp', 2, 3, 4], ['r3', 'نشاط 2: ١١ ٤/٥', 'toImp', 11, 4, 5], ['r4', 'نشاط 2: ٨٥ ٢/٣', 'toImp', 85, 2, 3],
    ['l1', 'نشاط 3 (أ): ٢/١٠ على خط الأعداد', 'line', 0, 2, 10], ['l2', 'نشاط 3 (أ): ١ ٣/١٠', 'line', 1, 3, 10], ['l3', 'نشاط 3 (ب): ٧/٩', 'line', 0, 7, 9], ['l4', 'نشاط 3 (ب): ١ ٢/٩', 'line', 1, 2, 9],
    ['q9', 'نشاط 4 ص 81: تسعة أرباع ٢ ١/٤', 'toImp', 2, 1, 4], ['t1', 'نشاط 5: ٢ ٢/٣', 'toImp', 2, 2, 3], ['t2', 'نشاط 5: ١ ٤/٦', 'toImp', 1, 4, 6], ['t3', 'نشاط 5: ٤ ٥/٧', 'toImp', 4, 5, 7],
    ['m17', 'نشاط 6 ص 82: ١٧/٥', 'toMix', 17, 0, 5], ['m9', 'نشاط 6: ٩/٢', 'toMix', 9, 0, 2], ['m13', 'نشاط 6: ١٣/٣', 'toMix', 13, 0, 3], ['m66', 'نشاط 6: ٦٦/٨', 'toMix', 66, 0, 8]
  ];
  G.reg({
    id: 'mixed-numbers', unit: U, order: 5, lesson: '4-4', lessonTitle: 'العدد الكسري', page: 80,
    titleAr: 'العدد الكسري والكسر غير الحقيقي وخط الأعداد', titleEn: 'Mixed Numbers & Improper Fractions', tags: 'عدد كسري كسر غير حقيقي تحويل خط الاعداد سداسي مثلثات ارباع قسمه طويله',
    formula: 'w\\frac{a}{b} = \\frac{(b \\times w) + a}{b}',
    book: 'العدد الكسري = (المقام × العدد الصحيح) + البسط ÷ المقام ؛ ونحوّل الكسر غير الحقيقي إلى عدد كسري بالقسمة الطويلة: الناتج هو العدد الصحيح، والباقي هو البسط، والمقسوم عليه هو المقام',
    summary: 'العدد الكسري يتكوّن من عدد صحيح وكسر، مثل $1\\frac{2}{6}$. والكسر الذي بسطه أكبر من مقامه أو يساويه يسمى **كسراً غير حقيقي**. نحوّل العدد الكسري إلى كسر غير حقيقي: (المقام × العدد الصحيح) + البسط، على المقام نفسه. ونحوّل الكسر غير الحقيقي إلى عدد كسري بالقسمة الطويلة.',
    vars: [['w', 'العدد الصحيح', ''], ['\\frac{a}{b}', 'الكسر', 'البسط أصغر من المقام']],
    ar: { w: 'الصحيح', a: 'البسط', b: 'المقام' },
    params: [
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'hex', options: G.opts(MX.map((e) => [e[0], e[1]]).concat([['custom', 'عدد من اختياري']])) },
      { key: 'mode', label: '\\text{المطلوب}', type: 'select', value: 'toImp', options: [['toImp', 'عدد كسري ← كسر غير حقيقي'], ['toMix', 'كسر غير حقيقي ← عدد كسري'], ['line', 'تعيين العدد على خط الأعداد']] },
      { key: 'w', label: '\\text{العدد الصحيح}', min: 0, max: 99, step: 1, value: 1, int: true, hidden: (p) => p.mode === 'toMix' },
      { key: 'n', label: '\\text{البسط}', min: 0, max: 11, step: 1, value: 2, int: true, hidden: (p) => p.mode === 'toMix' },
      { key: 'N', label: '\\text{بسط الكسر غير الحقيقي}', min: 2, max: 99, step: 1, value: 17, int: true, hidden: (p) => p.mode !== 'toMix' },
      { key: 'd', label: '\\text{المقام}', min: 2, max: 12, step: 1, value: 6, int: true }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = MX.find((x) => x[0] === p.ex); p.mode = e[2]; if (e[2] === 'toMix') { p.N = e[3]; } else { p.w = e[3]; p.n = e[4]; } p.d = e[5]; }
      else if (k !== 'ex') p.ex = 'custom';
      if (p.mode !== 'toMix' && p.n >= p.d) p.n = p.d - 1;
    },
    custom: true, canvasHint: 'كل دائرة واحد صحيح مقسوم إلى أجزاء بعدد المقام. عدّ الأجزاء المظللة كلها لتحصل على بسط الكسر غير الحقيقي.',
    compute(p) {
      let w, n, N; const d = p.d;
      if (p.mode === 'toMix') { N = p.N; w = Math.floor(N / d); n = N % d; } else { w = p.w; n = Math.min(p.n, d - 1); N = w * d + n; }
      return { w: w, n: n, d: d, N: N, v: N / d };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (p.mode === 'line') {
        const hi = Math.max(2, Math.ceil(d.v + 0.0001)); const lo = 0; const x0 = 28, x1 = W - 28; const y = H * 0.55;
        const X = (v) => x0 + (v - lo) / (hi - lo) * (x1 - x0); // خط الأعداد في الكتاب يزداد نحو اليمين
        ctx.strokeStyle = c.axis || c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 10, y); ctx.lineTo(x1 + 10, y); ctx.stroke();
        G.arrow(ctx, x1, y, x1 + 14, y, c.text, 2); G.arrow(ctx, x0, y, x0 - 14, y, c.text, 2);
        const tot = (hi - lo) * d.d; const step = (x1 - x0) / tot;
        for (let i = 0; i <= tot; i++) { const whole = i % d.d === 0; ctx.fillStyle = whole ? c.c2 : c.text; ctx.fillRect(x0 + i * step - (whole ? 1.5 : 0.75), y - (whole ? 14 : 8), whole ? 3 : 1.5, whole ? 28 : 16); if (whole) G.txt(ctx, lo + i / d.d, x0 + i * step, y + 26, { color: c.text, size: 14, w: '800' }); }
        const px = X(d.v); ctx.fillStyle = c.c1; ctx.beginPath(); ctx.arc(px, y, 8, 0, 7); ctx.fill();
        G.mixed(ctx, d.w, d.n, d.d, px, y - 46, { color: c.c1, size: nar ? 15 : 18, halo: c.bg });
        G.txt(ctx, 'نعدّ ' + G.L(d.N) + ' قفزة طول كل منها ' + G.L(1) + '/' + G.L(d.d) + ' من الصفر', W / 2, H - 18, { color: c.muted, size: 12 });
        return;
      }
      const tot = Math.max(1, d.w + (d.n ? 1 : 0)); const show = Math.min(tot, nar ? 6 : 10); const skip = tot > show;
      const r = Math.min((W - 30) / (Math.min(show, nar ? 3 : 5) * 2.4), H * 0.17, 80); const per = nar ? 3 : 5; const rowsN = Math.ceil(show / per);
      const top = H * 0.12 + r;
      for (let i = 0; i < show; i++) {
        const isLast = i === show - 1; const idx = skip && isLast ? tot - 1 : i; const isPart = d.n && idx === tot - 1;
        const cx = W / 2 + ((Math.min(per, show) - 1) / 2 - (i % per)) * r * 2.4, cy = top + Math.floor(i / per) * r * 2.5;
        G.pie(ctx, cx, cy, r, isPart ? d.n : d.d, d.d, isPart ? c.c4 : c.c1, c);
        if (skip && i === show - 2) G.txt(ctx, '…', cx - r * 1.2, cy, { color: c.text, size: 22, w: '800' });
      }
      const yy = Math.min(H - 34, top + rowsN * r * 2.5 - r * 0.4); const fs = nar ? 16 : 20;
      G.mixed(ctx, d.w, d.n, d.d, W / 2 + (nar ? 70 : 90), yy, { color: c.c1, size: fs });
      G.txt(ctx, '=', W / 2, yy, { color: c.text, size: fs * 1.2, w: '800' });
      G.frac(ctx, d.N, d.d, W / 2 - (nar ? 60 : 80), yy, { color: c.c4, size: fs });
      if (skip) G.txt(ctx, 'رُسم جزء من الدوائر فقط (' + G.L(tot) + ' دائرة)', W / 2, H - 12, { color: c.muted, size: 11 });
    },
    live(p, d) {
      if (p.mode === 'toMix') return fr(d.N, d.d) + ' = ' + d.N + ' \\div ' + d.d + ' = ' + d.w + '\\ \\text{والباقي}\\ ' + d.n + ' \\Rightarrow ' + G.mix(d.w, d.n, d.d);
      return G.mix(d.w, d.n, d.d) + ' = ' + fr('(' + d.d + ' \\times ' + d.w + ') + ' + d.n, d.d) + ' = ' + fr(d.N, d.d);
    },
    results(p, d) {
      return [['العدد الكسري', G.mix(d.w, d.n, d.d), true, 'pos'], ['الكسر غير الحقيقي', fr(d.N, d.d), true, 'pos'], ['عدد الأجزاء ١/' + G.L(d.d), G.L(d.N), false],
        ['نوعه', d.N >= d.d ? 'كسر غير حقيقي (البسط ≥ المقام)' : 'كسر حقيقي (أقل من واحد)', false]];
    },
    steps(p, d) {
      if (p.mode === 'toMix') return ['نقسم البسط على المقام بالقسمة الطويلة: $' + d.N + ' \\div ' + d.d + ' = ' + d.w + '$ والباقي $' + d.n + '$.', 'الناتج ' + G.L(d.w) + ' هو العدد الصحيح، والباقي ' + G.L(d.n) + ' هو البسط، والمقسوم عليه ' + G.L(d.d) + ' هو المقام.', 'إذن $' + fr(d.N, d.d) + ' = ' + G.mix(d.w, d.n, d.d) + '$.'];
      const s = ['كل واحد صحيح فيه ' + G.L(d.d) + ' أجزاء، ففي ' + G.L(d.w) + ' صحيح: $' + d.d + ' \\times ' + d.w + ' = ' + d.d * d.w + '$ جزءاً.', 'نضيف البسط: $' + d.d * d.w + ' + ' + d.n + ' = ' + d.N + '$.', 'إذن $' + G.mix(d.w, d.n, d.d) + ' = ' + fr(d.N, d.d) + '$.'];
      if (p.mode === 'line') s.push('على خط الأعداد: نقسم كل وحدة إلى ' + G.L(d.d) + ' أقسام متساوية، ونعدّ ' + G.L(d.N) + ' قسماً من الصفر.');
      return s;
    },
    explain(a, b, da, db) { return da && da.N !== db.N ? ['عدد الأجزاء الكلي ' + G.L(db.N) + ' جزءاً من ' + G.L(db.d) + ' في كل واحد صحيح.'] : []; },
    learn: [
      '**نشاط 1 ص 80:** فواز رسم شكلاً سداسياً من ستة مثلثات ومثلثين إضافيين: ١ صحيح و ٢/٦ ويكتب ١ ٢/٦.',
      '**نشاط 2 ص 80:** نقرأ ١ ١/٢ ، ٢ ٣/٤ ، ١١ ٤/٥ ، ٨٥ ٢/٣.',
      '**نشاط 4 ص 81:** دائرتان مقسومتان أرباعاً وربع: ٩ أرباع = ٩/٤ = ٢ ١/٤ ؛ «يسمى الكسر الذي بسطه أكبر من أو يساوي مقامه كسراً غير حقيقي».',
      '**نشاط 6 ص 82 (أستنتج):** ١٧/٥ = ١٧ ÷ ٥ = ٣ والباقي ٢ ، فتكتب ٣ ٢/٥.'
    ],
    challenges: [
      { q: 'حوّل ٤ ٥/٧ إلى كسر غير حقيقي (نشاط 5).', hint: '(٧ × ٤) + ٥.', init: { ex: 'custom', mode: 'toImp', w: 1, n: 1, d: 7 }, check: (p, d) => p.mode !== 'toMix' && d.w === 4 && d.n === 5 && d.d === 7, why: () => '٣٣/٧.' },
      { q: 'حوّل ٦٦/٨ إلى عدد كسري (نشاط 6).', hint: 'اختر التحويل إلى عدد كسري.', init: { ex: 'custom', mode: 'toImp', w: 1, n: 1, d: 8 }, check: (p) => p.mode === 'toMix' && p.N === 66 && p.d === 8, why: () => '٦٦ ÷ ٨ = ٨ والباقي ٢ ، فهو ٨ ٢/٨.' },
      { q: 'عيّن ١ ٢/٩ على خط الأعداد (نشاط 3 ب).', hint: 'اختر خط الأعداد.', init: { ex: 'custom', mode: 'toImp', w: 0, n: 1, d: 9 }, check: (p, d) => p.mode === 'line' && d.w === 1 && d.n === 2 && d.d === 9 }
    ],
    tutor: [
      { q: 'ما الكسر غير الحقيقي؟', k: ['غير حقيقي'], a: () => 'الكسر الذي بسطه أكبر من مقامه أو يساويه، مثل ٩/٤ أو ٤/٤.' },
      { q: 'كيف أحوّل العدد الكسري إلى كسر غير حقيقي؟', k: ['احول', 'تحويل'], a: (p, d) => '(المقام × العدد الصحيح) + البسط، على المقام: $' + G.mix(d.w, d.n, d.d) + ' = ' + fr(d.N, d.d) + '$.' },
      { q: 'كم ربعاً في العدد ٢؟', k: ['ربعا', 'ربع'], a: () => 'في كل واحد صحيح ٤ أرباع، ففي ٢ ثمانية أرباع: ٢ = ٨/٤.' }
    ]
  });

  /* ======================= الدرس الخامس: جمع الأعداد الكسرية وطرحها ومقارنتها (ص 82–89) ======================= */
  const MA = [
    ['kh', 'نشاط 7 ص 82: خديجة ٢ ٣/٥ و ٢ ٤/٥ دينار', 'cmp', [2, 3, 5], [2, 4, 5]], ['zh', 'نشاط 8 ص 83: فطيرتا زاهرة ١ ١/٢ و ١ ٣/٤ كغم', 'cmp', [1, 1, 2], [1, 3, 4]],
    ['c1', 'نشاط 9 (أ): ٥ ٣/٨ و ٧ ١/٨', 'cmp', [5, 3, 8], [7, 1, 8]], ['c2', 'نشاط 9 (ب): ٩ ١/٥ و ٩ ٢/١٠', 'cmp', [9, 1, 5], [9, 2, 10]], ['c3', 'نشاط 9 (جـ): ٦ ٢/٣ و ٦ ٤/٧', 'cmp', [6, 2, 3], [6, 4, 7]],
    ['sam', 'نشاط 1 ص 84: أرغفة سامية ٥ ١/٤ + ٣ ٢/٤', 'add', [5, 1, 4], [3, 2, 4]], ['app', 'نشاط 2 ص 85: التفاح ٣ ١/٢ + ٢ ٣/٤', 'add', [3, 1, 2], [2, 3, 4]],
    ['a3a', 'نشاط 3 (أ): ٨ ٥/٩ + ٢ ٣/٩', 'add', [8, 5, 9], [2, 3, 9]], ['a3b', 'نشاط 3 (ب): ٢ ١/٥ + ٣ ٦/١٠', 'add', [2, 1, 5], [3, 6, 10]], ['a3c', 'نشاط 3 (جـ): ٥ ٣/٧ + ١ ١/٢', 'add', [5, 3, 7], [1, 1, 2]],
    ['a4', 'نشاط 4: ٣ ٣/٤ − ٢ ٢/٤', 'sub', [3, 3, 4], [2, 2, 4]], ['a5a', 'نشاط 5 ص 86: ٦ ٥/١٠ − ٤ ١/١٠', 'sub', [6, 5, 10], [4, 1, 10]], ['a5b', 'نشاط 5: ٩ − ٥ ١/٧', 'sub', [9, 0, 7], [5, 1, 7]], ['a5c', 'نشاط 5: ٥ ٧/٨ − ٤ ٢/٤', 'sub', [5, 7, 8], [4, 2, 4]],
    ['wm', 'نشاط 6: البطيختان ٦ ٣/١٠ − ٤ ٣/٥ كغم', 'sub', [6, 3, 10], [4, 3, 5]], ['lib', 'نشاط 7: تبرع ٧ ١/٢ + ١٥ ديناراً', 'add', [7, 1, 2], [15, 0, 2]],
    ['r6f', 'مراجعة 6 ص 88: ٥ ١/٣ − ٣ ٢/٣', 'sub', [5, 1, 3], [3, 2, 3]], ['r6g', 'مراجعة 6: ٩ ٢/٥ − ٨ ٣/١٥', 'sub', [9, 2, 5], [8, 3, 15]],
    ['fl', 'مراجعة 7 (أ): طحين ٢ ١/٣ + ١ ١/٢ كوب', 'add', [2, 1, 3], [1, 1, 2]], ['fl4', 'مراجعة 7 (جـ): ٤ − ٣ ٥/٦ كوب', 'sub', [4, 0, 6], [3, 5, 6]],
    ['ord', 'مراجعة 5: ٢ ١/٤ و ٢ ٢/٥ (ترتيب)', 'cmp', [2, 1, 4], [2, 2, 5]]
  ];
  // مجموع أو فرق عددين كسريين بطريقة الكتاب: نوحّد مقامي الكسرين، ثم الكسور أولاً ثم الأعداد الصحيحة
  function mixOp(op, A, B) {
    const u = G.common([A[1], A[2]], [B[1], B[2]]); const D = u.D; let fa = u.a[0], fb = u.b[0];
    const val = (X) => X[0] + X[1] / X[2];
    if (op === 'cmp') { const k = Math.sign((A[0] * A[2] + A[1]) * B[2] - (B[0] * B[2] + B[1]) * A[2]); return { u: u, D: D, k: k, byWhole: A[0] !== B[0] }; }
    if (op === 'add') { let f = fa + fb, w = A[0] + B[0]; const carry = f >= D; if (carry) { f -= D; w += 1; } return { u: u, D: D, w: w, f: f, carry: carry, raw: fa + fb }; }
    if (val(A) < val(B) - 1e-12) return { u: u, D: D, neg: true };
    let wa = A[0]; const borrow = fa < fb; if (borrow) { fa += D; wa -= 1; }
    return { u: u, D: D, w: wa - B[0], f: fa - fb, borrow: borrow, fa: fa, wa: wa };
  }
  G.reg({
    id: 'mixed-add-sub', unit: U, order: 6, lesson: '4-5', lessonTitle: 'الجمع والطرح على الأعداد الكسرية', page: 84,
    titleAr: 'مقارنة الأعداد الكسرية وجمعها وطرحها', titleEn: 'Comparing, Adding & Subtracting Mixed Numbers', tags: 'اعداد كسريه جمع طرح مقارنه استلاف ارغفه تفاح بطيخ طحين مكسرات خديجه فطيره',
    formula: 'w_1\\frac{a}{n} + w_2\\frac{b}{n} = (w_1 + w_2)\\frac{a + b}{n}',
    book: 'عند جمع (طرح) عددين كسريين: إذا كان الكسران متجانسين نجمع (نطرح) الكسرين أولاً ثم العددين الصحيحين ؛ وإلا نوحّد المقامين أولاً. ونقارن العددين الكسريين بالعدد الصحيح أولاً ثم بالكسر',
    summary: 'نقارن عددين كسريين بالعددين الصحيحين أولاً؛ فإذا تساويا نقارن الكسرين. ولجمع عددين كسريين أو طرحهما نوحّد مقامي الكسرين إن لزم، ثم نجمع (نطرح) الكسرين أولاً ثم العددين الصحيحين. وإذا كان كسر المطروح أكبر نستلف واحداً صحيحاً.',
    vars: [['w_1\\frac{a}{b}', 'العدد الكسري الأول', ''], ['w_2\\frac{c}{d}', 'العدد الكسري الثاني', '']],
    ar: { w_1: 'ص١', w_2: 'ص٢' },
    params: [
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'sam', options: G.opts(MA.map((e) => [e[0], e[1]]).concat([['custom', 'عددان من اختياري']])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'add', options: [['add', 'جمع +'], ['sub', 'طرح −'], ['cmp', 'مقارنة < أو > أو =']] },
      { key: 'w1', label: '\\text{الصحيح ١}', min: 0, max: 20, step: 1, value: 5, int: true }, { key: 'n1', label: '\\text{البسط ١}', min: 0, max: 15, step: 1, value: 1, int: true }, { key: 'd1', label: '\\text{المقام ١}', min: 2, max: 16, step: 1, value: 4, int: true },
      { key: 'w2', label: '\\text{الصحيح ٢}', min: 0, max: 20, step: 1, value: 3, int: true }, { key: 'n2', label: '\\text{البسط ٢}', min: 0, max: 15, step: 1, value: 2, int: true }, { key: 'd2', label: '\\text{المقام ٢}', min: 2, max: 16, step: 1, value: 4, int: true }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = MA.find((x) => x[0] === p.ex); p.op = e[2]; [p.w1, p.n1, p.d1] = e[3]; [p.w2, p.n2, p.d2] = e[4]; }
      else if (k !== 'ex') p.ex = 'custom';
      if (p.n1 >= p.d1) p.n1 = p.d1 - 1; if (p.n2 >= p.d2) p.n2 = p.d2 - 1;
    },
    custom: true, canvasHint: 'الدوائر الكاملة هي الأعداد الصحيحة، والدائرة الأخيرة الكسر. في الطرح مع الاستلاف تتحول دائرة كاملة إلى أجزاء.',
    compute(p) { const A = [p.w1, Math.min(p.n1, p.d1 - 1), p.d1], B = [p.w2, Math.min(p.n2, p.d2 - 1), p.d2]; return { A: A, B: B, r: mixOp(p.op, A, B) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const r = d.r; const D = r.D; const fs = nar ? 14 : 17;
      const cap = nar ? 6 : 12; const avail = W - 2 * (nar ? 70 : 110);
      const row = (X, y, col, n, dd, rr) => {
        const tot = X + (n ? 1 : 0); const show = Math.min(tot, cap); const R = rr;
        for (let i = 0; i < show; i++) { const part = n && i === show - 1; const cx = W - (nar ? 70 : 110) - i * R * 2.3 - R; G.pie(ctx, cx, y, R, part ? n : dd, dd, part ? c.c4 : col, c); }
        if (tot > show) G.txt(ctx, 'رُسمت ' + G.L(show) + ' دوائر من ' + G.L(tot), W - (nar ? 70 : 110) - R, y + R + 9, { color: c.muted, size: 11, w: '700', align: 'right' });
      };
      const most = Math.min(cap, Math.max(d.A[0] + 1, d.B[0] + 1, r.neg || p.op === 'cmp' ? 1 : r.w + 1)); const R = Math.min(H * 0.085, nar ? 22 : 30, avail / (most * 2.3 + 1)); const gap = Math.max(R * 2.6, H * 0.2); const y1 = H * 0.14, y2 = y1 + gap, y3 = y2 + gap * 1.2;
      row(d.A[0], y1, c.c1, d.A[1], d.A[2], R); G.mixed(ctx, d.A[0], d.A[1], d.A[2], nar ? 34 : 54, y1, { color: c.c1, size: fs });
      row(d.B[0], y2, c.c5, d.B[1], d.B[2], R); G.mixed(ctx, d.B[0], d.B[1], d.B[2], nar ? 34 : 54, y2, { color: c.c5, size: fs });
      ctx.strokeStyle = c.grid; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, (y2 + y3) / 2); ctx.lineTo(W - 14, (y2 + y3) / 2); ctx.stroke();
      if (p.op === 'cmp') {
        G.mixed(ctx, d.A[0], d.A[1], d.A[2], W / 2 + 70, y3, { color: c.c1, size: fs + 3 }); G.txt(ctx, r.k > 0 ? '<' : r.k < 0 ? '>' : '=', W / 2, y3, { color: c.c3, size: 28, w: '800' }); G.mixed(ctx, d.B[0], d.B[1], d.B[2], W / 2 - 70, y3, { color: c.c5, size: fs + 3 });
        G.txt(ctx, r.byWhole ? 'العددان الصحيحان مختلفان: يكفي مقارنتهما' : 'العددان الصحيحان متساويان: نقارن الكسرين', W / 2, H - 16, { color: c.muted, size: 12, w: '700' });
        return;
      }
      if (r.neg) { G.txt(ctx, 'العدد الثاني أكبر من الأول؛ لا نطرحه منه', W / 2, y3, { color: c.c2, size: 14, w: '800' }); return; }
      row(r.w, y3, c.c3, r.f, D, R); G.mixed(ctx, r.w, r.f, D, nar ? 34 : 54, y3, { color: c.c3, size: fs });
      const note = p.op === 'add' ? (r.carry ? 'مجموع الكسرين أكبر من واحد، فنضيف ١ إلى العدد الصحيح' : '') : (r.borrow ? 'استلفنا واحداً صحيحاً = ' + G.L(D) + '/' + G.L(D) : '');
      if (note) G.txt(ctx, note, W / 2, H - 14, { color: c.c4, size: 12, w: '800' });
    },
    live(p, d) {
      const A = G.mix(d.A[0], d.A[1], d.A[2]), B = G.mix(d.B[0], d.B[1], d.B[2]); const r = d.r;
      if (p.op === 'cmp') return A + ' ' + G.sign(r.k) + ' ' + B;
      if (r.neg) return '\\text{العدد الثاني أكبر}';
      return A + (p.op === 'add' ? ' + ' : ' - ') + B + ' = ' + G.mix(r.w, r.f, r.D);
    },
    results(p, d) {
      const r = d.r; const A = G.mix(d.A[0], d.A[1], d.A[2]), B = G.mix(d.B[0], d.B[1], d.B[2]);
      if (p.op === 'cmp') return [['المقارنة', A + ' ' + G.sign(r.k) + ' ' + B, true, 'pos'], ['الأكبر', r.k > 0 ? A : r.k < 0 ? B : '\\text{متساويان}', true]];
      if (r.neg) return [['الناتج', 'العدد الثاني أكبر من الأول', false, 'neg'], ['المقام الموحّد', G.L(r.D), false]];
      const out = [['الناتج', G.mix(r.w, r.f, r.D), true, 'pos'], ['بأبسط صورة', r.f ? (r.w ? r.w : '') + G.nice(r.f, r.D) : String(r.w), true], ['كسر غير حقيقي', fr(r.w * r.D + r.f, r.D), true]];
      if (p.ex === 'wm') out.push(['تزيد بطيخة مهند', G.mix(r.w, r.f, r.D) + '\\ \\text{كغم}', true]);
      if (p.ex === 'fl') out.push(['أكواب الطحين', G.mix(r.w, r.f, r.D), true]);
      return out;
    },
    steps(p, d) {
      const r = d.r; const s = [];
      if (d.A[2] !== d.B[2]) s.push('نوحّد مقامي الكسرين إلى ' + G.L(r.D) + ': $' + fr(d.A[1], d.A[2]) + ' = ' + fr(r.u.a[0], r.D) + '$ و $' + fr(d.B[1], d.B[2]) + ' = ' + fr(r.u.b[0], r.D) + '$.');
      if (p.op === 'cmp') {
        if (r.byWhole) s.push('العددان الصحيحان مختلفان (' + G.L(d.A[0]) + ' و ' + G.L(d.B[0]) + ')؛ فالعدد الكسري الذي فيه العدد الصحيح الأكبر هو الأكبر.');
        else s.push('العددان الصحيحان متساويان، فنقارن الكسرين: $' + fr(r.u.a[0], r.D) + ' ' + G.sign(r.k) + ' ' + fr(r.u.b[0], r.D) + '$.');
        return s;
      }
      if (r.neg) { s.push('العدد الثاني أكبر من الأول، فلا نطرحه منه.'); return s; }
      if (p.op === 'add') {
        s.push('نجمع الكسرين أولاً: $' + fr(r.u.a[0], r.D) + ' + ' + fr(r.u.b[0], r.D) + ' = ' + fr(r.raw, r.D) + '$.');
        if (r.carry) s.push('$' + fr(r.raw, r.D) + ' = 1' + (r.f ? '\\frac{' + r.f + '}{' + r.D + '}' : '') + '$ ، فنضيف ١ إلى مجموع العددين الصحيحين.');
        s.push('نجمع العددين الصحيحين: $' + d.A[0] + ' + ' + d.B[0] + (r.carry ? ' + 1' : '') + ' = ' + r.w + '$.');
      } else {
        if (r.borrow) s.push('كسر المطروح أكبر، فنستلف واحداً صحيحاً: $' + G.mix(d.A[0], r.u.a[0], r.D) + ' = ' + G.mix(r.wa, r.fa, r.D) + '$ (لاحظ أن $1 = ' + fr(r.D, r.D) + '$).');
        s.push('نطرح الكسرين أولاً: $' + fr(r.borrow ? r.fa : r.u.a[0], r.D) + ' - ' + fr(r.u.b[0], r.D) + ' = ' + fr(r.f, r.D) + '$.');
        s.push('نطرح العددين الصحيحين: $' + r.wa + ' - ' + d.B[0] + ' = ' + r.w + '$.');
      }
      s.push('الناتج $' + G.mix(r.w, r.f, r.D) + '$' + (r.f && G.gcd(r.f, r.D) > 1 ? ' = $' + (r.w ? r.w : '') + G.nice(r.f, r.D) + '$' : '') + '.');
      return s;
    },
    explain(a, b, da, db) { return da && db.r && (db.r.borrow || db.r.carry) && !(da.r.borrow || da.r.carry) ? [db.r.borrow ? 'احتجنا إلى الاستلاف لأن كسر المطروح أكبر من كسر المطروح منه.' : 'مجموع الكسرين تجاوز الواحد، فأضفنا ١ إلى العدد الصحيح.'] : []; },
    learn: [
      '**نشاط 7 ص 82:** خديجة: ٢ ٣/٥ من والدتها و ٢ ٤/٥ من والدها؛ العددان الصحيحان متساويان و ٣/٥ < ٤/٥ ، فالوالد أعطاها أكثر.',
      '**نشاط 8 ص 83:** فطيرتان ١ ١/٢ كغم و ١ ٣/٤ كغم: ٣/٤ > ١/٢ ، فالثانية احتاجت طحيناً أكثر.',
      '**نقارن بين عددين كسريين (ص 83):** إذا اختلف العددان الصحيحان فالأكبر صحيحاً هو الأكبر، وإذا تساويا نقارن الكسرين.',
      '**نشاط 1 ص 84:** سامية: ٥ ١/٤ + ٣ ٢/٤ = ٨ ٣/٤ أرغفة.',
      '**أتعلم ص 84–85:** نجمع (نطرح) الكسرين أولاً ثم العددين الصحيحين، ونوحّد المقامين إن كان الكسران غير متجانسين.',
      '**نشاط 6 ص 86:** بطيخة حسام ٤ ٣/٥ كغم وبطيخة مهند ٦ ٣/١٠ كغم: الفرق ١ ٧/١٠ كغم.',
      '**مراجعة 7 ص 88:** ندى استخدمت ٢ ١/٣ و ١ ١/٢ كوب طحين = ٣ ٥/٦ ، والفرق بين المكسرات ٣/٤ − ٢/٣ = ١/١٢ ، وبقي من ٤ أكواب ١/٦ كوب.'
    ],
    challenges: [
      { q: 'جد مجموع ما اشتراه الأب والأم من التفاح: ٣ ١/٢ + ٢ ٣/٤ (نشاط 2).', hint: 'نوحّد المقامين إلى ٤.', init: { ex: 'custom', op: 'add', w1: 3, n1: 1, d1: 2, w2: 1, n2: 1, d2: 4 }, check: (p) => p.op === 'add' && p.w1 === 3 && p.n1 === 1 && p.d1 === 2 && p.w2 === 2 && p.n2 === 3 && p.d2 === 4, why: () => '٣ ٢/٤ + ٢ ٣/٤ = ٥ ٥/٤ = ٦ ١/٤ كغم.' },
      { q: 'جد ٩ − ٥ ١/٧ (نشاط 5 ب).', hint: 'اجعل بسط الأول صفراً، ثم نستلف واحداً.', init: { ex: 'custom', op: 'add', w1: 9, n1: 1, d1: 7, w2: 5, n2: 1, d2: 7 }, check: (p) => p.op === 'sub' && p.w1 === 9 && p.n1 === 0 && p.w2 === 5 && p.n2 === 1 && p.d2 === 7 && p.d1 === 7, why: () => '٨ ٧/٧ − ٥ ١/٧ = ٣ ٦/٧.' },
      { q: 'قارن ٩ ١/٥ و ٩ ٢/١٠ (نشاط 9 ب).', hint: 'اختر المقارنة.', init: { ex: 'custom', op: 'add', w1: 9, n1: 1, d1: 5, w2: 9, n2: 1, d2: 10 }, check: (p) => p.op === 'cmp' && p.w1 === 9 && p.n1 === 1 && p.d1 === 5 && p.w2 === 9 && p.n2 === 2 && p.d2 === 10, why: () => '١/٥ = ٢/١٠ ، فالعددان متساويان.' }
    ],
    tutor: [
      { q: 'متى أستلف واحداً صحيحاً؟', k: ['استلف', 'استلاف'], a: () => 'عندما يكون كسر المطروح أكبر من كسر المطروح منه؛ نحوّل واحداً صحيحاً إلى كسر بسطه يساوي مقامه ونضيفه إلى الكسر.' },
      { q: 'كيف أقارن عددين كسريين؟', k: ['اقارن', 'مقارنه'], a: () => 'إذا اختلف العددان الصحيحان فالأكبر صحيحاً هو الأكبر، وإذا تساويا نقارن الكسرين.' },
      { q: 'ما الناتج الآن؟', k: ['الناتج', 'الان'], a: (p, d) => (p.op === 'cmp' ? (d.r.k === 0 ? 'العددان متساويان.' : 'الأكبر هو ' + (d.r.k > 0 ? 'الأول.' : 'الثاني.')) : d.r.neg ? 'العدد الثاني أكبر.' : '$' + G.mix(d.r.w, d.r.f, d.r.D) + '$.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
