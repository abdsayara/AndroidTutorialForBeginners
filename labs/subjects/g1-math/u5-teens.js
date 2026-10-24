/* رياضيات الأول — الوحدة الخامسة: الأعداد من ١٠ – ٢٠ (ص 87–102) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1; const G4 = ML.m4;
  const U = 5;
  const L = (x) => G.L(x);
  const D09 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const D010 = D09.concat([10]);

  /* ======================= الدرس 1: العدد ١٠ ومكوّناته (ص 89–92) ======================= */
  const CARDS10 = [[0, 10], [2, 8], [6, 4], [1, 7], [9, 1], [3, 7], [3, 4], [5, 5]]; // نشاط 10 ص 92
  const DRAW10 = [['c3', 'نشاط 9 ص 92: ٣ دوائر', 'circle:#dc2626', 3], ['h8', 'نشاط 9: ٨ قلوب', 'heart:#f97316', 8], ['s6', 'نشاط 9: ٦ مربعات', 'square:#1e40af', 6]];
  G.reg({
    id: 'make-ten', unit: U, order: 1, lesson: '5-1', lessonTitle: 'العدد ١٠ ومكوّناته', page: 89,
    titleAr: 'العدد ١٠ ومكوّناته', titleEn: 'Making Ten', tags: 'العدد عشره مكونات العدد ١٠ عيدان بطاقات اكمل الرسم بقدر العدد ١٠ عصافير خالد',
    formula: '10 = 9 + 1',
    book: 'أقسّم العشرة عيدان إلى مجموعتين بكل الطرق الممكنة: ١٠ = ٩ و ١ … ؛ أصل البطاقة التي فيها مكوّنا العدد ١٠',
    summary: 'العدد **عشرة (١٠)** يتكوّن من مكوّنين بطرق كثيرة: ٩ و ١ ، ٨ و ٢ ، ٧ و ٣ ، ٦ و ٤ ، ٥ و ٥ … و ١٠ و ٠. نقسم العيدان العشرة بلونين، ونختار البطاقات التي مجموع عدديها ١٠ ، ونكمل الرسم حتى يصبح ١٠.',
    vars: [['10', 'عشرة', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'sticks', options: [['sticks', 'نشاط 8 ص 92: أقسّم العيدان العشرة'], ['cards', 'نشاط 10 ص 92: بطاقات مكوّني ١٠'], ['draw', 'نشاط 9 ص 92: أكمل الرسم بقدر ١٠']] },
      { key: 'dr', label: '\\text{الرسم}', type: 'select', value: 'c3', options: G.opts(DRAW10.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'draw' }
    ],
    initState() { return { k: 0, found: [], sel: [], add: 0 }; },
    resetOn: ['mode', 'dr'],
    custom: true, canvasHint: 'العيدان: انقر عوداً لتغيّر مكان القسمة. البطاقات: انقر كل بطاقة مجموع عدديها ١٠. الرسم: انقر الخانات الفارغة لتضيف شكلاً.',
    compute(p) { if (p.mode === 'draw') { const e = DRAW10.find((x) => x[0] === p.dr); return { mode: 'draw', e: e, start: e[3] }; } return { mode: p.mode, good: CARDS10.map((cd, i) => (cd[0] + cd[1] === 10 ? i : -1)).filter((i) => i >= 0) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { k: 0, found: [], sel: [], add: 0 };
      if (d.mode === 'sticks') {
        const sw = Math.min(54, (W - 40) / 10.5); const y = 90; const xr = W / 2 + 5 * sw + 8;
        for (let i = 0; i < 10; i++) { const x = xr - (i + 0.5) * sw - (i >= st.k ? 16 : 0); G.icon(ctx, 'stick', x, y, sw * 1.6, i < st.k ? '#db2777' : '#ea580c'); d.hits.push({ x: x - sw / 2, y: y - sw * 0.8, w: sw, h: sw * 1.6, i: i }); }
        G.txt(ctx, '١٠ = ' + L(st.k) + ' و ' + L(10 - st.k), W / 2, y + sw + 40, { color: c.text, size: nar ? 24 : 30, w: '800' });
        const cols = nar ? 3 : 4; const cw = (W - 20) / cols; const y0 = y + sw + 86;
        for (let a = 10, j = 0; a >= 0; a--, j++) { const got = st.found.indexOf(a) >= 0; G.txt(ctx, got ? '١٠ = ' + L(a) + ' و ' + L(10 - a) : '١٠ = ؟ و ؟', W - 10 - (j % cols + 0.5) * cw, y0 + Math.floor(j / cols) * 30, { color: got ? c.c3 : c.muted, size: nar ? 14 : 17, w: '800' }); }
        return;
      }
      if (d.mode === 'cards') {
        const cols = nar ? 2 : 4; const bw = Math.min(150, (W - 40) / cols - 12), bh = 64;
        CARDS10.forEach((cd, i) => {
          const col = i % cols, row = Math.floor(i / cols); const x = W / 2 + (cols / 2 - col - 1) * (bw + 12) + 6, y = 30 + row * (bh + 16); const on = st.sel.indexOf(i) >= 0; const good = cd[0] + cd[1] === 10;
          G.box(ctx, x, y, bw, bh, on ? (good ? c.c3 : c.c2) : c.c1, on ? (good ? 'rgba(5,150,105,.15)' : 'rgba(220,38,38,.1)') : null);
          G.txt(ctx, L(cd[0]) + '  |  ' + L(cd[1]), x + bw / 2, y + bh / 2, { color: c.text, size: 26, w: '800' }); d.hits.push({ x: x, y: y, w: bw, h: bh, card: i });
        });
        const ok = d.good.every((i) => st.sel.indexOf(i) >= 0) && st.sel.every((i) => d.good.indexOf(i) >= 0);
        ctx.beginPath(); ctx.arc(W / 2, H - 60, 40, 0, 7); ctx.fillStyle = 'rgba(250,204,21,.4)'; ctx.fill(); G.txt(ctx, '١٠', W / 2, H - 60, { color: c.text, size: 34, w: '800' });
        G.txt(ctx, ok ? 'أحسنت! كل البطاقات الصحيحة ✔' : 'اخترتَ ' + L(st.sel.length), W / 2, H - 120, { color: ok ? c.c3 : c.muted, size: nar ? 15 : 18, w: '800' });
        return;
      }
      // أكمل الرسم: ١٠ خانات، الموجود في الكتاب ثابت والباقي يُضاف بالنقر
      const kk = d.e[2].split(':'); const cols = 5; const s = Math.min(70, (W - 40) / cols, (H - 160) / 2); const x0 = W / 2 + cols * s / 2;
      for (let i = 0; i < 10; i++) {
        const x = x0 - (i % cols + 0.5) * s, y = 40 + Math.floor(i / cols) * s + s / 2; const filled = i < d.start + st.add; const given = i < d.start;
        ctx.strokeStyle = c.grid; ctx.lineWidth = 1.5; ctx.setLineDash(filled ? [] : [5, 4]); ctx.strokeRect(x - s / 2 + 3, y - s / 2 + 3, s - 6, s - 6); ctx.setLineDash([]);
        if (filled) G.icon(ctx, kk[0], x, y, s * 0.8, given ? kk[1] : '#16a34a');
        d.hits.push({ x: x - s / 2, y: y - s / 2, w: s, h: s, slot: i });
      }
      const tot = d.start + st.add;
      G.txt(ctx, L(d.start) + ' و ' + L(st.add) + ' = ' + L(tot) + (tot === 10 ? '  ✔' : ''), W / 2, 40 + 2 * s + 40, { color: tot === 10 ? c.c3 : c.text, size: nar ? 22 : 28, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.i != null) { st.k = h.i + 1 === st.k ? h.i : h.i + 1; if (st.found.indexOf(st.k) < 0) st.found.push(st.k); return true; }
      if (h.card != null) { const k = st.sel.indexOf(h.card); if (k >= 0) st.sel.splice(k, 1); else st.sel.push(h.card); return true; }
      if (h.slot != null) { const start = DRAW10.find((e) => e[0] === p.dr)[3]; if (h.slot < start) return false; st.add = h.slot - start + 1 === st.add ? h.slot - start : h.slot - start + 1; return true; }
      return false;
    },
    live(p, d) { const st = d.st || { k: 0, add: 0 }; if (d.mode === 'draw') return d.start + ' + ' + st.add + ' = ' + (d.start + st.add); return '10 = ' + (st.k || 0) + ' + ' + (10 - (st.k || 0)); },
    results(p, d) {
      const st = d.st || { k: 0, found: [], sel: [], add: 0 };
      if (d.mode === 'cards') return [['البطاقات الصحيحة', d.good.map((i) => L(CARDS10[i][0]) + ' و ' + L(CARDS10[i][1])).join(' ، '), false], ['ليست ١٠', '١ و ٧ = ٨ ، ٣ و ٤ = ٧', false], ['اخترتَ', L(st.sel.length), false]];
      if (d.mode === 'draw') { const t = d.start + st.add; return [['في الكتاب', L(d.start), false], ['أضفتَ', L(st.add), false], ['المجموع', L(t) + (t === 10 ? ' ✔' : ''), false, t === 10 ? 'pos' : ''], ['المطلوب إضافته', L(10 - d.start), false]]; }
      return [['المكوّنان الآن', L(st.k) + ' و ' + L(10 - st.k), false, 'pos'], ['وجدتَ', L(st.found.length) + ' من ١١ طريقة', false, st.found.length === 11 ? 'pos' : ''], ['مكوّنان متساويان', '٥ و ٥', false]];
    },
    steps(p, d) {
      if (d.mode === 'cards') return ['أجمع العددين في كل بطاقة.', 'إذا كان المجموع ١٠ أصل البطاقة بالعدد ١٠.'];
      if (d.mode === 'draw') return ['في الكتاب ' + L(d.start) + ' أشكال.', 'أضيف ' + L(10 - d.start) + ' حتى يصبح العدد ١٠.', L(d.start) + ' و ' + L(10 - d.start) + ' = ١٠.'];
      return ['أقسّم العيدان العشرة إلى مجموعتين.', 'أعدّ كل مجموعة وأكتب المكوّنين.', 'أغيّر القسمة حتى أجد كل الطرق.'];
    },
    explain() { return []; },
    learn: ['**ص 89:** أُعجب خالد بمنظر العصافير على الشجرة: ٩ + ١ = ١٠ وتُقرأ عشرة.', '**أتعلّم:** كل ١٠ آحاد = ١ عشرات؛ والعدد ١٠ يتكوّن من منزلتين: صفر في منزلة الآحاد وواحد في منزلة العشرات.', '**نشاط 8 ص 92:** أقسّم العشرة عيدان إلى مجموعتين بكل الطرق الممكنة: ١٠ = ٩ و ١ …', '**نشاط 9:** أكمل الرسم بقدر العدد ١٠: ٣ و ؟ = ١٠ ، ٨ و ؟ = ١٠ ، ٦ و ؟ = ١٠.', '**نشاط 10:** أصل البطاقة التي فيها مكوّنا العدد ١٠.'],
    challenges: [
      { q: 'أكمل الرسم: ٣ دوائر و ؟ = ١٠ (نشاط 9 ص 92).', hint: 'أضف ٧ دوائر.', init: { mode: 'draw', dr: 's6' }, check: (p, d) => d.mode === 'draw' && p.dr === 'c3' && d.st && d.st.add === 7 },
      { q: 'اختر كل البطاقات التي فيها مكوّنا العدد ١٠ (نشاط 10).', hint: 'اجمع العددين في كل بطاقة.', init: { mode: 'sticks' }, check: (p, d) => d.mode === 'cards' && d.st && d.good.every((i) => d.st.sel.indexOf(i) >= 0) && d.st.sel.length === d.good.length },
      { q: 'قسّم العيدان إلى مكوّنين متساويين.', hint: 'خمسة وخمسة.', init: { mode: 'cards' }, check: (p, d) => d.mode === 'sticks' && d.st && d.st.k === 5 }
    ],
    tutor: [{ q: 'كم آحاداً في العشرة؟', k: ['احاد', 'العشره'], a: () => 'كل ١٠ آحاد = عشرة واحدة.' }, { q: 'ما مكوّنات العشرة؟', k: ['مكونات'], a: () => '٩ و ١ ، ٨ و ٢ ، ٧ و ٣ ، ٦ و ٤ ، ٥ و ٥ …' }]
  });

  /* ======================= الدرسان 2–3: الأعداد ١١ – ١٩ والعدد ٢٠ (ص 93–98) والمراجعة (ص 99–100) ======================= */
  // [المفتاح، الاسم، العدد، طريقة التمثيل في الكتاب]
  const PV = [
    ['p90', 'نشاط 2 ص 90: ٨ آحاد على المعداد', 8, 'abacus'], ['birds', 'ص 89–90: ٩ عصافير وعصفور = ١٠', 10, 'abacus'],
    ['n10', 'نشاط 2 ص 94: العيدان — عشرة', 10, 'sticks'], ['n11', 'نشاط 2: أحد عشر', 11, 'sticks'], ['n12', 'نشاط 2: اثنا عشر', 12, 'sticks'], ['n13', 'نشاط 2: ثلاثة عشر', 13, 'sticks'],
    ['n14', 'نشاط 2: المكعبات — أربعة عشر', 14, 'blocks'], ['n15', 'نشاط 2: خمسة عشر', 15, 'blocks'], ['n16', 'نشاط 2: ستة عشر', 16, 'blocks'],
    ['n17', 'نشاط 2: المعداد — سبعة عشر', 17, 'abacus'], ['n18', 'نشاط 2: ثمانية عشر', 18, 'abacus'], ['n19', 'نشاط 2: تسعة عشر', 19, 'abacus'],
    ['a8', 'نشاط 3 ص 95: أمثّل ٨ على المعداد', 8, 'abacus'], ['a15', 'نشاط 3: أمثّل ١٥', 15, 'abacus'], ['a10', 'نشاط 3: أمثّل ١٠', 10, 'abacus'],
    ['n20', 'ص 97: سعاد تعدّ المراكب: ١٩ + ١ = ٢٠', 20, 'abacus'], ['b20', 'ص 98: ٢ عشرات = ٢٠', 20, 'blocks'],
    ['r15', 'مراجعة 6 ص 100: ١٥', 15, 'abacus'], ['r9', 'مراجعة 6: ٩', 9, 'abacus'], ['r18', 'مراجعة 6: ١٨', 18, 'abacus'], ['r20', 'مراجعة 6: ٢٠', 20, 'abacus'],
    ['t11', 'أفكّر ص 100 (أ): رقم الآحاد مساوٍ لرقم العشرات', 11, 'abacus'], ['t17', 'أفكّر (ب): مجموع رقميه ٨', 17, 'abacus'], ['t10', 'أفكّر (جـ): أصغر عدد من منزلتين', 10, 'abacus']
  ];
  const NAME = (n) => (n === 0 ? 'صفر' : G4.words(n));
  G.reg({
    id: 'tens-ones', unit: U, order: 2, lesson: '5-2 – 5-4', lessonTitle: 'الأعداد من ١١ – ١٩ ، والعدد ٢٠ ومكوّناته، والمراجعة', page: 93,
    titleAr: 'الآحاد والعشرات حتى ٢٠', titleEn: 'Tens and Ones to 20', tags: 'احاد عشرات لوحه المنازل المعداد عيدان مكعبات احد عشر اثنا عشر عشرون منزلتين اصغر عدد',
    formula: '19 + 1 = 20',
    book: 'كلُّ ١٠ آحاد = ١ عشرات ؛ ٩ آحاد و ١ عشرات، أُضيف له ١ فأصبح يساوي ٢ عشرات: ١٩ + ١ = ٢ عشرات = ٢٠ ويُقرأ (عشرون)',
    summary: 'الأعداد من ٠ إلى ٩ تُمثَّل في **منزلة الآحاد**. وعندما تصبح الآحاد **عشرة** نبدّلها بـ **عشرة واحدة** في **منزلة العشرات**. فالعدد ١٥ = ١ عشرات و ٥ آحاد، والعدد ٢٠ = ٢ عشرات و ٠ آحاد.',
    vars: [['\\text{آحاد}', 'المنزلة اليمنى', ''], ['\\text{عشرات}', 'المنزلة اليسرى', '']],
    params: [
      { key: 'ex', label: '\\text{العدد}', type: 'select', value: 'n13', options: G.opts(PV.map((e) => [e[0], e[1]])) },
      { key: 'rep', label: '\\text{التمثيل}', type: 'select', value: 'sticks', options: [['abacus', 'المعداد'], ['sticks', 'حزم العيدان'], ['blocks', 'الأجسام الحسابية']] }
    ],
    onSet(p, key) { if (key === 'ex' || key === null) { const e = PV.find((x) => x[0] === p.ex); if (e) p.rep = e[3]; } },
    initState() { return { t: 0, o: 0 }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر «+» و«−» تحت كل منزلة. عندما تصبح الآحاد ١٠ انقر «أبدّل ١٠ آحاد بعشرة».',
    compute(p) { const e = PV.find((x) => x[0] === p.ex); return { e: e, target: e[2], tt: Math.floor(e[2] / 10), to: e[2] % 10 }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { t: 0, o: 0 }; const val = st.t * 10 + st.o; const ok = val === d.target && st.o < 10;
      const base = H - 170; const top = 30; const xo = W * 0.68, xt = W * 0.32; // الآحاد يميناً والعشرات يساراً كما في لوحة المنازل
      if (p.rep === 'abacus') {
        [[xo, st.o, '#3b82f6'], [xt, st.t, '#3b82f6']].forEach((r) => {
          ctx.fillStyle = '#facc15'; ctx.fillRect(r[0] - 4, top, 8, base - top);
          const bs = Math.min(18, (base - top - 10) / 11); for (let i = 0; i < r[1]; i++) { ctx.beginPath(); ctx.arc(r[0], base - bs * 0.6 - i * bs * 1.05, bs * 0.55, 0, 7); ctx.fillStyle = r[2]; ctx.fill(); }
        });
      } else if (p.rep === 'sticks') {
        for (let b = 0; b < st.t; b++) { const bx = xt - (st.t - 1) * 22 + b * 44; for (let i = 0; i < 10; i++) { ctx.fillStyle = '#b45309'; ctx.fillRect(bx - 16 + i * 3.2, top + 20, 3, base - top - 30); } ctx.fillStyle = '#dc2626'; ctx.fillRect(bx - 18, (top + base) / 2 - 8, 36, 16); }
        for (let i = 0; i < st.o; i++) { const sx = xo - (Math.min(st.o, 10) - 1) * 9 + i * 18; ctx.fillStyle = '#b45309'; ctx.fillRect(sx - 3, top + 20, 6, base - top - 30); }
      } else {
        const u = Math.min(16, (base - top - 10) / 10);
        for (let b = 0; b < st.t; b++) { const bx = xt - (st.t - 1) * (u + 6) / 2 + b * (u + 6); for (let i = 0; i < 10; i++) { ctx.fillStyle = '#1e3a8a'; ctx.fillRect(bx - u / 2, base - (i + 1) * u, u - 1, u - 1); } }
        for (let i = 0; i < st.o; i++) { const col = i % 3, row = Math.floor(i / 3); ctx.fillStyle = '#1e3a8a'; ctx.fillRect(xo - 1.5 * (u + 2) + col * (u + 2), base - (row + 1) * (u + 2), u, u); }
      }
      // لوحة المنازل
      const bw = Math.min(90, W * 0.22); const by = base + 8;
      [[xo, 'آحاد', st.o, '#ea580c'], [xt, 'عشرات', st.t, '#9d174d']].forEach((r) => {
        ctx.fillStyle = r[3]; ctx.fillRect(r[0] - bw / 2, by, bw, 26); G.txt(ctx, r[1], r[0], by + 13, { color: '#fff', size: 15, w: '800' });
        G.box(ctx, r[0] - bw / 2, by + 26, bw, 40, r[3]); G.txt(ctx, r[2], r[0], by + 46, { color: c.text, size: 24, w: '800' });
        G.btn(ctx, r[0] - bw / 2, by + 72, bw / 2 - 3, 34, '−', c, { hits: d.hits, hit: { act: r[1] === 'آحاد' ? 'o-' : 't-' } });
        G.btn(ctx, r[0] + 3, by + 72, bw / 2 - 3, 34, '+', c, { hits: d.hits, hit: { act: r[1] === 'آحاد' ? 'o+' : 't+' } });
      });
      if (st.o >= 10) { G.btn(ctx, W / 2 - 110, top + 4, 220, 40, 'أبدّل ١٠ آحاد بعشرة ←', c, { hits: d.hits, hit: { act: 'swap' }, on: true, good: true, size: 16 }); G.arrow(ctx, xo - 30, top + 60, xt + 30, top + 60, c.c1, 3); }
      G.txt(ctx, (val > 20 ? '' : NAME(val) + ' = ') + L(val), W / 2, by + 126, { color: ok ? c.c3 : c.text, size: nar ? 18 : 22, w: '800' });
      G.txt(ctx, 'المطلوب: ' + L(d.target) + (ok ? '  ✔' : ''), W / 2, top - 12, { color: ok ? c.c3 : c.muted, size: 15, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h || !h.act) return false;
      if (h.act === 'o+') { if (st.o >= 10) return false; st.o++; } else if (h.act === 'o-') { if (st.o > 0) st.o--; } else if (h.act === 't+') { if (st.t < 2) st.t++; else return false; } else if (h.act === 't-') { if (st.t > 0) st.t--; } else if (h.act === 'swap') { if (st.o >= 10 && st.t < 2) { st.o -= 10; st.t++; } }
      return true;
    },
    live(p, d) { return d.target + ' = ' + d.tt + ' \\times 10 + ' + d.to; },
    results(p, d) {
      const st = d.st || { t: 0, o: 0 }; const val = st.t * 10 + st.o; const ok = val === d.target && st.o < 10;
      return [['العدد', L(d.target) + ' (' + NAME(d.target) + ')', false], ['العشرات', L(d.tt), false, 'pos'], ['الآحاد', L(d.to), false, 'pos'], ['مثّلتَ', L(st.t) + ' عشرات و ' + L(st.o) + ' آحاد' + (ok ? ' ✔' : ''), false, ok ? 'pos' : '']];
    },
    steps(p, d) { return ['العدد ' + L(d.target) + ' يُقرأ: ' + NAME(d.target) + '.', 'في منزلة العشرات ' + L(d.tt) + ' ، وفي منزلة الآحاد ' + L(d.to) + '.', 'كل ١٠ آحاد نبدّلها بعشرة واحدة.']; },
    explain() { return []; },
    learn: ['**أتعلّم ص 89:** كل ١٠ آحاد = ١ عشرات، والأعداد من (٠ – ٩) تُمثَّل في منزلة واحدة تُسمّى منزلة الآحاد.', '**نشاط 2 ص 94:** أعدّ الآحاد والعشرات وأكتب العدد الناتج وأقرأ: عشرة، أحد عشر، اثنا عشر … تسعة عشر.', '**نشاط 6 ص 96:** في مكتبة مهنّد اثنتا عشرة قصة (١٢)، ووفّرت هند خمسة عشر قرشاً (١٥)، واشترك ثلاثة عشر طالباً (١٣).', '**أفكّر ص 96:** العدد التالي للعدد ١١ هو ١٢ ، والسابق للعدد ١٦ هو ١٥ ، والسابق للعدد ١٩ هو ١٨.', '**ص 97:** ٩ آحاد و ١ عشرات، أُضيف له ١ فأصبح ٢ عشرات: ١٩ + ١ = ٢٠ (عشرون).', '**أفكّر ص 100:** عدد بين ١٠ و ٢٠ رقما آحاده وعشراته متساويان (١١)، ومجموع رقميه ٨ (١٧)، وأصغر عدد من منزلتين (١٠).'],
    challenges: [
      { q: 'مثّل العدد ١٣ بالعيدان (نشاط 2 ص 94).', hint: 'حزمة عشرة و ٣ عيدان.', init: { ex: 'n10' }, check: (p, d) => p.ex === 'n13' && d.st && d.st.t === 1 && d.st.o === 3 },
      { q: 'ص 97: مثّل ١٩ ثم أضف واحداً وبدّل العشرة: ٢٠.', hint: 'عندما تصبح الآحاد ١٠ انقر «أبدّل».', init: { ex: 'n10' }, check: (p, d) => p.ex === 'n20' && d.st && d.st.t === 2 && d.st.o === 0 },
      { q: 'أفكّر ص 100: مثّل أصغر عدد من منزلتين.', hint: 'عشرة واحدة وصفر آحاد.', init: { ex: 'n13' }, check: (p, d) => p.ex === 't10' && d.st && d.st.t === 1 && d.st.o === 0 }
    ],
    tutor: [{ q: 'متى أبدّل الآحاد بعشرة؟', k: ['ابدل', 'متى'], a: () => 'عندما تصبح الآحاد عشرة.' }, { q: 'كيف أقرأ العدد؟', k: ['اقرا', 'كيف'], a: (p, d) => NAME(d.target) + '.' }, { q: 'كم عشرة في العدد ٢٠؟', k: ['عشرون', '٢٠', '20'], a: () => '٢ عشرات.' }]
  });

  /* ======================= خط الأعداد من ٠ إلى ٢٠ (ص 91 ، 92 ، 95 ، 98 ، 100) ======================= */
  // [المفتاح، الاسم، من، إلى، الأعداد الناقصة]
  const NLX = [
    ['d10', 'نشاط 6 ص 92: أكتب الأعداد تنازلياً من ١٠', 0, 10, [8, 7, 6, 5, 4, 3, 2, 1, 0]], ['p95a', 'نشاط 4 ص 95: الأعداد الناقصة', 0, 19, [11, 12, 13, 14, 15, 16, 17, 18]],
    ['p95b', 'نشاط 5 ص 95: أكمل كتابة الأعداد', 10, 19, [12, 13, 14, 17, 18, 19]], ['p98', 'نشاط 3 ص 98: أكتب العدد المناسب', 0, 20, [4, 5, 13, 14, 19, 20]], ['p100', 'مراجعة 4 ص 100: العدد الناقص', 0, 20, [5, 10, 13, 19]]
  ];
  const WHO = [['car', 'السيارة', 'car', 4], ['turtle', 'السلحفاة', 'turtle', 7], ['rabbit', 'الأرنب', 'rabbit', 9], ['boy', 'الولد', 'boy', 10]];
  G.reg({
    id: 'number-line-20', unit: U, order: 3, lesson: '5-1 – 5-4', lessonTitle: 'خط الأعداد من ٠ إلى ٢٠', page: 91,
    titleAr: 'خط الأعداد حتى ٢٠', titleEn: 'Number Line to 20', tags: 'خط الاعداد الاعداد الناقصه تنازليا السياره السلحفاه الارنب الولد العدد التالي السابق',
    formula: '0,\\ 1,\\ 2,\\ \\ldots,\\ 20',
    book: 'أحصر العدد ١٠ على خط الأعداد ؛ تقف السيارة على العدد … ؛ أكتب الأعداد الناقصة على خط الأعداد',
    summary: 'على **خط الأعداد** أجزاء متساوية، والأعداد تكبر كلما تقدّمنا: بعد ٩ يأتي ١٠ ثم ١١ … حتى ٢٠. نجد العدد الناقص بالعدّ من العدد الذي قبله، ونقرأ مكان كل شيء على الخط.',
    vars: [['\\text{خط الأعداد}', 'من ٠ إلى ٢٠', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'fill', options: [['fill', 'أكتب الأعداد الناقصة'], ['loc', 'نشاط 4 ص 91: أين يقف؟']] },
      { key: 'ex', label: '\\text{الخط}', type: 'select', value: 'p98', options: G.opts(NLX.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'fill' },
      { key: 'who', label: '\\text{السؤال}', type: 'select', value: 'car', options: G.opts(WHO.map((w) => [w[0], 'على أي عدد يقف ' + w[1] + '؟'])), hidden: (p) => p.mode !== 'loc' }
    ],
    initState() { return { sel: 0, vals: {}, pick: null }; },
    resetOn: ['mode', 'ex', 'who'],
    custom: true, canvasHint: 'انقر الدائرة الفارغة ثم البطاقة المناسبة. في «أين يقف؟» انقر العدد تحت الشيء.',
    compute(p) {
      if (p.mode === 'loc') { const w = WHO.find((x) => x[0] === p.who); return { loc: true, w: w, from: 0, to: 10, ans: w[3] }; }
      const e = NLX.find((x) => x[0] === p.ex); return { e: e, from: e[2], to: e[3], miss: e[4] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { sel: 0, vals: {}, pick: null };
      const n = d.to - d.from; const x0 = 22, x1 = W - 22; const X = (v) => x0 + (v - d.from) * (x1 - x0) / n; const y = H * 0.42; // الصفر يساراً كما في رسوم الكتاب
      ctx.strokeStyle = '#db2777'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 14, y); ctx.lineTo(x1 + 14, y); ctx.stroke();
      ctx.fillStyle = '#db2777'; [[x0 - 18, 1], [x1 + 18, -1]].forEach((a) => { ctx.beginPath(); ctx.moveTo(a[0], y); ctx.lineTo(a[0] + a[1] * 10, y - 7); ctx.lineTo(a[0] + a[1] * 10, y + 7); ctx.fill(); });
      const R = Math.min(19, (x1 - x0) / n * 0.46); const fs = Math.max(11, Math.min(22, R * 1.1));
      for (let v = d.from; v <= d.to; v++) {
        const x = X(v); ctx.fillStyle = '#db2777'; ctx.fillRect(x - 1.2, y - 8, 2.4, 16);
        if (d.loc) { const on = st.pick === v; G.txt(ctx, v, x, y + 26, { color: on ? (v === d.ans ? c.c3 : c.c2) : c.text, size: fs, w: '800' }); if (on) { ctx.strokeStyle = v === d.ans ? c.c3 : c.c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y + 26, R, 0, 7); ctx.stroke(); } d.hits.push({ x: x - R, y: y + 4, w: 2 * R, h: 44, num: v }); continue; }
        const mi = d.miss.indexOf(v); if (mi < 0) { G.txt(ctx, v, x, y + 26, { color: c.text, size: fs, w: '800' }); continue; }
        const got = st.vals[mi]; const ok = got === v; const on = st.sel === mi;
        ctx.strokeStyle = on ? c.c4 : got == null ? c.c1 : ok ? c.c3 : c.c2; ctx.lineWidth = on ? 3 : 2; ctx.beginPath(); ctx.arc(x, y + 26, R, 0, 7); ctx.stroke();
        if (got != null) G.txt(ctx, got, x, y + 26, { color: ok ? c.c3 : c.c2, size: fs, w: '800' });
        d.hits.push({ x: x - R, y: y + 4, w: 2 * R, h: 44, slot: mi });
      }
      if (d.loc) {
        WHO.forEach((w) => G.icon(ctx, w[2], X(w[3]), y - 30, Math.min(54, (x1 - x0) / n * 1.1)));
        G.txt(ctx, 'على أي عدد يقف ' + d.w[1] + '؟', W / 2, H - 50, { color: c.text, size: nar ? 17 : 21, w: '800' });
        return;
      }
      const choices = d.miss.slice().sort((a, b) => a - b);
      const done = d.miss.every((v, i) => st.vals[i] === v);
      G.txt(ctx, done ? 'أحسنت! ✔' : 'اختر دائرة ثم العدد المناسب', W / 2, y - 50, { color: done ? c.c3 : c.muted, size: nar ? 15 : 18, w: '800' });
      G.cards(ctx, choices, 8, H - 62, W - 16, 52, c, { sel: st.vals[st.sel], good: d.miss[st.sel], hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.num != null) { st.pick = h.num; return true; }
      if (h.slot != null) { st.sel = h.slot; return true; }
      if (h.v != null) { st.vals[st.sel] = h.v; const e = NLX.find((q) => q[0] === p.ex); if (e) { for (let k = 1; k <= e[4].length; k++) { const j = (st.sel + k) % e[4].length; if (st.vals[j] == null) { st.sel = j; break; } } } return true; }
      return false;
    },
    live(p, d) { return d.loc ? (d.st && d.st.pick === d.ans ? d.ans + '' : '?') : d.from + ',\\ ' + (d.from + 1) + ',\\ \\ldots,\\ ' + d.to; },
    results(p, d) {
      const st = d.st || { sel: 0, vals: {}, pick: null };
      if (d.loc) return [['السؤال', 'على أي عدد يقف ' + d.w[1] + '؟', false], ['الجواب', L(d.ans), false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
      const good = d.miss.filter((v, i) => st.vals[i] === v).length;
      return [['الخط', 'من ' + L(d.from) + ' إلى ' + L(d.to), false], ['الأعداد الناقصة', d.miss.map(L).join(' ، '), false], ['الصحيح', L(good) + ' من ' + L(d.miss.length), false, good === d.miss.length ? 'pos' : '']];
    },
    steps(p, d) { return d.loc ? ['أنظر إلى الشيء على الخط.', 'أقرأ العدد الذي تحته: ' + L(d.ans) + '.'] : ['أنظر إلى العدد الذي قبل الدائرة.', 'العدد الناقص أكبر منه بواحد.', 'أكمل حتى أملأ كل الدوائر.']; },
    explain() { return []; },
    learn: ['**نشاط 4 ص 91:** تقف السيارة على العدد ٤ ، والسلحفاة على ٧ ، والولد على ١٠ ، والأرنب على العدد ٩ الذي يقع بين العددين ٨ و ١٠.', '**نشاط 6 ص 92:** أكتب الأعداد تنازلياً: ١٠ ، ٩ ، ٨ … ٠.', '**ص 95:** أكتب الأعداد الناقصة على خط الأعداد من ١١ إلى ١٨.', '**نشاط 4 ص 98:** العدد التالي للعدد ١٩ هو ٢٠.'],
    challenges: [
      { q: 'على أي عدد يقف الأرنب (نشاط 4 ص 91)؟', hint: 'بين ٨ و ١٠.', init: { mode: 'fill' }, check: (p, d) => d.loc && p.who === 'rabbit' && d.st && d.st.pick === 9 },
      { q: 'أكمل الأعداد الناقصة (نشاط 3 ص 98).', hint: '٤ و ٥ ، ١٣ و ١٤ ، ١٩ و ٢٠.', init: { mode: 'fill', ex: 'p95b' }, check: (p, d) => !d.loc && p.ex === 'p98' && d.st && d.miss.every((v, i) => d.st.vals[i] === v) },
      { q: 'أكمل العدد الناقص (مراجعة 4 ص 100).', hint: 'أربعة أعداد.', init: { mode: 'fill', ex: 'p95b' }, check: (p, d) => !d.loc && p.ex === 'p100' && d.st && d.miss.every((v, i) => d.st.vals[i] === v) }
    ],
    tutor: [{ q: 'ما العدد بعد ٩؟', k: ['بعد ٩', 'بعد'], a: () => '١٠ ، ثم ١١ ، ١٢ …' }, { q: 'ما العدد التالي للعدد ١٩؟', k: ['التالي'], a: () => '٢٠.' }, { q: 'ما العدد السابق للعدد ١٦؟', k: ['السابق'], a: () => '١٥.' }]
  });

  /* ======================= مراجعة الوحدة: أعدّ وأقارن (ص 99 ، 101 ، 102) ======================= */
  const FRUIT = [['orange', 'البرتقال', 15, '#f97316'], ['banana', 'الموز', 16, '#dc2626'], ['apple', 'التفاح', 18, '#0ea5e9'], ['pear', 'الأجاص', 13, '#84cc16'], ['lemon', 'الليمون', 20, '#fdba74'], ['strawberry', 'الفراولة', 16, '#ec4899']];
  const BQ = [['q1', 'عدد حبات البرتقال ○ عدد حبات التفاح', 0, 2], ['q2', 'عدد حبات الموز ○ عدد حبات الأجاص', 1, 3], ['q3', 'عدد حبات الفراولة ○ عدد حبات الليمون', 5, 4], ['q4', 'عدد حبات الموز ○ عدد حبات الفراولة', 1, 5]];
  // مراجعة 3 ص 99: الأشكال كما في الرسم (صفوف من اليسار)، g أخضر y أصفر r أحمر
  const SHP = ['y', 'r', 'g', 'r', 'g', 'y', 'g', 'g', 'g', 'r', 'y', 'r', 'g', 'g', 'y', 'r', 'y', 'r', 'g', 'y'];
  const SCOL = { g: ['أخضر', '#16a34a', 'square'], y: ['أصفر', '#facc15', 'circle'], r: ['أحمر', '#dc2626', 'triangle'] };
  const TOYS = [['car', 'سيّارة', 5, 'car'], ['bear', 'دُبّ', 9, 'bear'], ['plane', 'طيّارة', 10, 'plane'], ['doll', 'دُمية', 11, 'doll'], ['ball', 'طابة', 5, 'ball']];
  G.reg({
    id: 'count-compare-20', unit: U, order: 4, lesson: '5-4', lessonTitle: 'مراجعة الوحدة: أعدّ وأقارن', page: 99,
    titleAr: 'أعدّ وأقارن حتى ٢٠', titleEn: 'Count and Compare to 20', tags: 'مراجعه اعمده فواكه برتقال تفاح موز اجاص ليمون فراوله اشكال الوان زهره ٢٠ قرشا العاب',
    formula: '15 < 18',
    book: 'أعدّ وأكتب العدد ثم أضع إشارة > أو < أو = ؛ أكمل الجدول بحسب الرسم ؛ مع زهرة ٢٠ قرشاً تريد أن تشتري ألعاباً بالمبلغ جميعه',
    summary: 'نقرأ **الأعمدة** فنعرف عدد حبات كل فاكهة، ثم **نقارن** بإشارة > أو < أو =. ونعدّ **الأشكال** حسب لونها، ونختار **ألعاباً** مجموع أثمانها ٢٠ قرشاً تماماً.',
    vars: [['>', 'أكبر من', ''], ['<', 'أصغر من', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'bars', options: [['bars', 'مراجعة 7 ص 101: الأعمدة'], ['shapes', 'مراجعة 3 ص 99: الأشكال والألوان'], ['shop', 'مراجعة 8 ص 102: ألعاب زهرة']] },
      { key: 'q', label: '\\text{المقارنة}', type: 'select', value: 'q1', options: G.opts(BQ.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'bars' }
    ],
    initState() { return { sign: null, bar: null, tapped: [], cart: [] }; },
    resetOn: ['mode', 'q'],
    custom: true, canvasHint: 'الأعمدة: انقر عموداً لتعدّه، واختر الإشارة. الأشكال: انقر كل شكل لتعدّه. الألعاب: انقر اللعبة لتضعها في السلة أو تخرجها.',
    compute(p) {
      if (p.mode === 'bars') { const q = BQ.find((x) => x[0] === p.q); const a = FRUIT[q[2]], b = FRUIT[q[3]]; return { mode: 'bars', q: q, a: a, b: b, k: G.kOf(a[2], b[2]) }; }
      if (p.mode === 'shapes') { const cnt = { g: 0, y: 0, r: 0 }; SHP.forEach((s) => cnt[s]++); return { mode: 'shapes', cnt: cnt }; }
      return { mode: 'shop' };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { sign: null, bar: null, tapped: [], cart: [] };
      if (d.mode === 'bars') {
        const ax = 34, base = H - 150, top = 16; const u = (base - top) / 20; const bw = (W - ax - 20) / FRUIT.length;
        for (let v = 1; v <= 20; v++) { if (nar && v % 2) continue; G.txt(ctx, v, ax - 14, base - v * u, { color: c.muted, size: 11, w: '700' }); }
        ctx.strokeStyle = c.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, base); ctx.lineTo(W - 10, base); ctx.stroke();
        FRUIT.forEach((f, i) => {
          const x = ax + (i + 0.5) * bw; const w = Math.min(36, bw * 0.55); const on = st.bar === i || f === d.a || f === d.b;
          for (let k = 0; k < f[2]; k++) { ctx.fillStyle = f[3]; ctx.fillRect(x - w / 2, base - (k + 1) * u, w, u - 1); }
          if (on) { ctx.strokeStyle = c.text; ctx.lineWidth = 2.5; ctx.strokeRect(x - w / 2 - 2, base - f[2] * u - 2, w + 4, f[2] * u + 4); }
          if (st.bar === i) G.txt(ctx, f[2], x, base - f[2] * u - 14, { color: c.text, size: 18, w: '800', halo: c.bg });
          G.icon(ctx, f[0], x, base + 20, Math.min(36, bw * 0.7));
          d.hits.push({ x: x - bw / 2, y: top, w: bw, h: base - top + 36, bar: i });
        });
        G.txt(ctx, d.a[1] + ' ' + (st.sign ? G.sign(G.KEY[st.sign]) : '؟') + ' ' + d.b[1], W / 2, base + 52, { color: st.sign ? (st.sign === d.k ? c.c3 : c.c2) : c.text, size: nar ? 16 : 20, w: '800' });
        G.signBtns(ctx, W, H - 70, st.sign, d.k, c, d.hits);
        return;
      }
      if (d.mode === 'shapes') {
        const cols = 4, rows = 5; const gw = Math.min(W * 0.55, 300), s = Math.min(gw / cols, (H - 30) / rows); const gx = nar ? 10 : 20; // الرسم يسار الجدول كما في الكتاب
        SHP.forEach((k, i) => {
          const x = gx + (i % cols + 0.5) * s, y = 14 + (Math.floor(i / cols) + 0.5) * s; const on = st.tapped.indexOf(i) >= 0;
          if (on) { ctx.fillStyle = 'rgba(250,204,21,.25)'; ctx.fillRect(x - s / 2 + 2, y - s / 2 + 2, s - 4, s - 4); }
          G.icon(ctx, SCOL[k][2], x, y, s * 0.8, SCOL[k][1]); d.hits.push({ x: x - s / 2, y: y - s / 2, w: s, h: s, shp: i });
        });
        const tx = gx + cols * s + 16, tw = W - tx - 10; const rh = Math.min(48, (H - 30) / 4.4); const cnt = { g: 0, y: 0, r: 0 }; st.tapped.forEach((i) => cnt[SHP[i]]++);
        ['g', 'y', 'r'].forEach((k, j) => { const yy = 14 + j * (rh + 8); ctx.fillStyle = SCOL[k][1]; ctx.fillRect(tx + tw * 0.5, yy, tw * 0.5, rh); G.txt(ctx, SCOL[k][0], tx + tw * 0.75, yy + rh / 2, { color: k === 'y' ? '#111' : '#fff', size: nar ? 13 : 16, w: '800' }); G.box(ctx, tx, yy, tw * 0.48, rh, c.c1); G.txt(ctx, cnt[k], tx + tw * 0.24, yy + rh / 2, { color: cnt[k] === d.cnt[k] ? c.c3 : c.text, size: 20, w: '800' }); });
        const yy = 14 + 3 * (rh + 8); G.txt(ctx, 'جميعها', tx + tw * 0.75, yy + rh / 2, { color: c.text, size: nar ? 13 : 16, w: '800' }); G.box(ctx, tx, yy, tw * 0.48, rh, c.c1); G.txt(ctx, st.tapped.length, tx + tw * 0.24, yy + rh / 2, { color: st.tapped.length === 20 ? c.c3 : c.text, size: 20, w: '800' });
        return;
      }
      // ألعاب زهرة
      const n = TOYS.length; const tw = Math.min(130, (W - 20) / n - 6);
      TOYS.forEach((t, i) => {
        const x = W / 2 + (n / 2 - i - 0.5) * (tw + 6); const on = st.cart.indexOf(i) >= 0;
        G.box(ctx, x - tw / 2, 16, tw, 130, on ? c.c3 : c.c1, on ? 'rgba(5,150,105,.12)' : null);
        ctx.beginPath(); ctx.arc(x, 40, 18, 0, 7); ctx.strokeStyle = c.c1; ctx.lineWidth = 2; ctx.stroke(); G.txt(ctx, t[2], x, 40, { color: c.text, size: 17, w: '800' });
        G.icon(ctx, t[3], x, 88, Math.min(56, tw * 0.6)); G.txt(ctx, t[1], x, 130, { color: c.text, size: nar ? 12 : 15, w: '800' });
        d.hits.push({ x: x - tw / 2, y: 16, w: tw, h: 130, toy: i });
      });
      const tot = st.cart.reduce((s, i) => s + TOYS[i][2], 0);
      G.txt(ctx, st.cart.length ? st.cart.map((i) => L(TOYS[i][2])).join(' + ') + ' = ' + L(tot) : 'انقر الألعاب لتضعها في السلة', W / 2, 190, { color: tot === 20 ? c.c3 : tot > 20 ? c.c2 : c.text, size: nar ? 18 : 24, w: '800' });
      G.txt(ctx, tot === 20 ? 'أنفقت زهرة المبلغ جميعه ✔' : tot > 20 ? 'المبلغ لا يكفي!' : 'بقي ' + L(20 - tot) + ' قرشاً', W / 2, 230, { color: tot === 20 ? c.c3 : tot > 20 ? c.c2 : c.muted, size: nar ? 15 : 18, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.k) { st.sign = h.k; return true; }
      if (h.bar != null) { st.bar = h.bar; return true; }
      if (h.shp != null) { if (st.tapped.indexOf(h.shp) < 0) st.tapped.push(h.shp); return true; }
      if (h.toy != null) { const k = st.cart.indexOf(h.toy); if (k >= 0) st.cart.splice(k, 1); else st.cart.push(h.toy); return true; }
      return false;
    },
    live(p, d) { if (d.mode === 'bars') return d.st && d.st.sign === d.k ? d.a[2] + ' ' + G.sign(G.KEY[d.k]) + ' ' + d.b[2] : '\\text{' + d.a[1] + '}\\ ?\\ \\text{' + d.b[1] + '}'; if (d.mode === 'shapes') return d.cnt.g + ' + ' + d.cnt.y + ' + ' + d.cnt.r + ' = 20'; return '20'; },
    results(p, d) {
      const st = d.st || { sign: null, bar: null, tapped: [], cart: [] };
      if (d.mode === 'bars') return [[d.a[1], L(d.a[2]), false], [d.b[1], L(d.b[2]), false], ['المقارنة', L(d.a[2]) + ' ' + G.SNAME[d.k] + ' ' + L(d.b[2]), false, 'pos'], ['اخترتَ', st.sign ? G.SNAME[st.sign] + (st.sign === d.k ? ' ✔' : ' ✘') : 'لم تختر بعد', false, st.sign ? (st.sign === d.k ? 'pos' : 'neg') : '']];
      if (d.mode === 'shapes') return [['أخضر', L(d.cnt.g), false], ['أصفر', L(d.cnt.y), false], ['أحمر', L(d.cnt.r), false], ['جميعها', L(20), false, 'pos'], ['عددتَ', L(st.tapped.length), false, st.tapped.length === 20 ? 'pos' : '']];
      const tot = st.cart.reduce((s, i) => s + TOYS[i][2], 0);
      return [['مع زهرة', '٢٠ قرشاً', false], ['في السلة', st.cart.length ? st.cart.map((i) => TOYS[i][1]).join(' و ') : 'لا شيء', false], ['المجموع', L(tot) + ' قرشاً', false, tot === 20 ? 'pos' : tot > 20 ? 'neg' : ''], ['حلول ممكنة', 'دُبّ ودُمية (٩ + ١١) ، أو طيّارة وسيّارة وطابة (١٠ + ٥ + ٥)', false]];
    },
    steps(p, d) {
      if (d.mode === 'bars') return ['أعدّ مربعات كل عمود: ' + d.a[1] + ' ' + L(d.a[2]) + ' ، و' + d.b[1] + ' ' + L(d.b[2]) + '.', 'أقارن: ' + L(d.a[2]) + ' ' + G.SNAME[d.k] + ' ' + L(d.b[2]) + '.'];
      if (d.mode === 'shapes') return ['أعدّ الأشكال الخضراء: ' + L(d.cnt.g) + ' ، والصفراء: ' + L(d.cnt.y) + ' ، والحمراء: ' + L(d.cnt.r) + '.', 'عدد الأشكال جميعها: ' + L(20) + '.'];
      return ['أجمع أثمان الألعاب التي أختارها.', 'أتوقف عندما يصبح المجموع ٢٠ قرشاً تماماً.'];
    },
    explain() { return []; },
    learn: ['**مراجعة 7 ص 101:** البرتقال ١٥ ، الموز ١٦ ، التفاح ١٨ ، الأجاص ١٣ ، الليمون ٢٠ ، الفراولة ١٦.', '**مراجعة 3 ص 99:** أكمل الجدول بحسب الرسم: الأخضر ٨ ، الأصفر ٦ ، الأحمر ٦ ، وجميعها ٢٠.', '**مراجعة 8 ص 102:** مع زهرة ٢٠ قرشاً تريد أن تشتري ألعاباً بالمبلغ جميعه: سيّارة ٥ ، دُبّ ٩ ، طيّارة ١٠ ، دُمية ١١ ، طابة ٥.'],
    challenges: [
      { q: 'قارن عدد حبات البرتقال بعدد حبات التفاح (ص 101).', hint: 'عُدّ العمودين: ١٥ و ١٨.', init: { mode: 'bars', q: 'q2' }, check: (p, d) => d.mode === 'bars' && p.q === 'q1' && d.st && d.st.sign === 'lt' },
      { q: 'عُدّ الأشكال جميعها (مراجعة 3 ص 99).', hint: 'انقر كل شكل مرة واحدة.', init: { mode: 'bars' }, check: (p, d) => d.mode === 'shapes' && d.st && d.st.tapped.length === 20 },
      { q: 'اختر ألعاباً لزهرة بالمبلغ جميعه ٢٠ قرشاً (ص 102).', hint: 'جرّب الدُبّ والدُمية.', init: { mode: 'bars' }, check: (p, d) => d.mode === 'shop' && d.st && d.st.cart.reduce((s, i) => s + TOYS[i][2], 0) === 20 }
    ],
    tutor: [{ q: 'كيف أقرأ العمود؟', k: ['اقرا', 'العمود'], a: () => 'أعدّ المربعات من الأسفل إلى أعلى العمود.' }, { q: 'أي الفواكه أكثر؟', k: ['اكثر'], a: () => 'الليمون: ٢٠ حبة.' }, { q: 'ماذا تشتري زهرة؟', k: ['زهره', 'تشتري'], a: () => 'دُبّاً ودُمية (٩ + ١١ = ٢٠)، أو طيّارة وسيّارة وطابة (١٠ + ٥ + ٥ = ٢٠).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
