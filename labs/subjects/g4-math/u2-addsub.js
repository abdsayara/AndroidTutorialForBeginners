/* رياضيات الرابع — الوحدة الثانية: جمع الأعداد ضمن الملايين وطرحها (ص 25–41) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 2;
  const MAXD = 10;
  const numParam = (key, label, val, extra) => Object.assign({ key: key, label: label, type: 'text', value: String(val), maxLength: 14, desc: 'عدد حتى ١٠ منازل', normalize: G.digitsOnly, validate: G.validNum(MAXD) }, extra || {});
  const toN = (s) => { const v = parseInt(G.digitsOnly(s), 10); return Number.isFinite(v) ? v : 0; };
  const digitsOf = (n) => String(n).split('').reverse().map(Number);

  /* ---------- خوارزميتا الجمع والطرح العموديين ---------- */
  function addCols(nums) {
    const ds = nums.map(digitsOf); const L = Math.max.apply(null, ds.map((x) => x.length)); const cols = []; let carry = 0;
    for (let i = 0; i < L || carry; i++) {
      const s = ds.reduce((t, x) => t + (x[i] || 0), 0) + carry;
      cols.push({ i: i, sum: s, cin: carry, w: s % 10, cout: Math.floor(s / 10) }); carry = Math.floor(s / 10);
    }
    return { cols: cols, res: nums.reduce((t, x) => t + x, 0), carries: cols.filter((c) => c.cout).length };
  }
  function subCols(a, b) {
    const t = digitsOf(a), B = digitsOf(b); const L = t.length; const cols = []; const top = t.slice(); let borrows = 0;
    for (let i = 0; i < L; i++) {
      const bi = B[i] || 0; let changed = null;
      if (top[i] < bi) {
        let j = i + 1; while (top[j] === 0) j++;
        changed = { from: j, list: [] };
        top[j]--; changed.list.push([j, top[j]]);
        for (let k = j - 1; k > i; k--) { top[k] = 9; changed.list.push([k, 9]); }
        top[i] += 10; changed.list.push([i, top[i]]); borrows++;
      }
      cols.push({ i: i, a: top[i], b: bi, w: top[i] - bi, borrow: changed, snap: top.slice() });
    }
    return { cols: cols, res: a - b, borrows: borrows };
  }

  /* ======================= الدروس 1–4: الجمع والطرح ضمن الملايين (ص 27–36) ======================= */
  // [المفتاح، الاسم، العملية، أ، ب، جـ]
  const AS = [
    ['mart', 'نشاط 1 ص 27: شهداء الانتفاضتين ١٣٩٢ + ٤٦٧٣', 'add', 1392, 4673], ['land', 'نشاط 2 ص 27: دفعتا قطعة الأرض', 'add', 1512076, 1352803],
    ['a3a', 'نشاط 3 ص 28 (أ): ٦٠٦٥٤١٩ + ٣٩١٣٢٦٠', 'add', 6065419, 3913260], ['a3b', 'نشاط 3 (ب): ٧٤٢٠٢٩٨ + ٥٣٣٠١', 'add', 7420298, 53301], ['a3c', 'نشاط 3 (جـ): ٧٨١٢٣٤٥ + ١٠٨٦٤٣٢', 'add', 7812345, 1086432],
    ['a4a', 'نشاط 4 ص 28: ٢٥٩٠١٣١ + ٤١٠٠٨٥٤', 'add', 2590131, 4100854], ['a4b', 'نشاط 4: ٥٦٢١٤٧٣ + ٢١٧٨٢١٠', 'add', 5621473, 2178210],
    ['comm', 'نشاط 5 ص 29 (التبديل): ١٢٣٤٥٦٠ + ٤٥٦٤٢٢٩', 'add', 1234560, 4564229], ['three', 'نشاط 7 ص 29: جمع ثلاثة أعداد', 'add', 5820631, 2113207, 2045141],
    ['pop', 'نشاط 1 ص 30: سكان فلسطين ولبنان ٢٠١٤م', 'add', 4682467, 4232012], ['c2a', 'نشاط 2 ص 30 (أ): ٧١٢٤٣٥٦ + ٢١٤٥٣٨١', 'add', 7124356, 2145381], ['c2b', 'نشاط 2 (ب): ٥٨٩٠٣٢ + ٧٦٠١٢٩٥', 'add', 589032, 7601295],
    ['c3', 'نشاط 3 ص 30: جمع ثلاثة أعداد مع حمل', 'add', 6198432, 1620357, 1745240], ['wp', 'نشاط 6 ص 31: ١٤٥٠٩٠ + ٨٠٠٩٢٧', 'add', 145090, 800927],
    ['china', 'نشاط 1 ص 32: سكان بيكين وتيانجين', 'sub', 7296962, 5066121], ['s2a', 'نشاط 2 ص 33 (أ): ٨٤٧٦٩٥٢ − ٥٤٠٢٦٣١', 'sub', 8476952, 5402631], ['s2b', 'نشاط 2 (ب): ١٢٣٩٥٤٥ − ١٠١٧٤٣١', 'sub', 1239545, 1017431], ['s2c', 'نشاط 2 (جـ): ٥٤٣٦٥٢٩ − ٤١٠١٢٠١', 'sub', 5436529, 4101201],
    ['stone', 'نشاط 1 ص 34: دخل مصنع حجر عوريف', 'sub', 9346347, 8015236], ['social', 'نشاط 2 ص 34: مستخدمو موقع التواصل', 'sub', 2456192, 1012985],
    ['b3a', 'نشاط 3 ص 35 (أ): ٥٣٢٦٤٨٣ − ١١٠٤٧٢٣', 'sub', 5326483, 1104723], ['b3b', 'نشاط 3 (ب): ٦٨٧٩٥٢٣ − ٢٥٤٤٢٦٠', 'sub', 6879523, 2544260],
    ['vis1', 'نشاط 4 ص 35: زيارات جنين − نابلس', 'sub', 725419, 572128], ['vis2', 'نشاط 4: زيارات جنين + أريحا', 'add', 725419, 1164600], ['chk', 'نشاط 5 ص 36: ١٤٠٠٦٨٧ − ١٣٢٩٣٢٥', 'sub', 1400687, 1329325],
    ['fridge', 'مراجعة 4 ص 41: الثلاجات ١٠٠٠٠٠٠ − ٣٤٠٠٠٠', 'sub', 1000000, 340000], ['miss', 'مراجعة 6 ص 41: ٤٧٦١٩٥٠ − ٣٧٤٦٥٢١', 'sub', 4761950, 3746521], ['cards', 'مراجعة 2 ص 40: ٩٨٧٦٥٤ − ١٢٣٤٥٧', 'sub', 987654, 123457]
  ];
  const stageNames = (p) => {
    const L = (x) => (ML.locDigits ? ML.locDigits(String(x)) : String(x));
    const a = toN(p.a == null ? '1392' : p.a), b = toN(p.b == null ? '4673' : p.b), c = p.op === 'add' && p.c ? toN(p.c) : 0;
    const head = ['نكتب ' + (c ? 'الأعداد' : 'العددين') + ' عمودياً في لوحة المنازل، الآحاد تحت الآحاد'];
    if (p.op === 'sub') {
      if (a < b) return head.concat(['المطروح أكبر من المطروح منه']);
      return head.concat(subCols(a, b).cols.map((s) => 'منزلة ' + G.placeName(s.i) + ': ' + (s.borrow ? 'نستلف من منزلة ' + G.placeName(s.borrow.from) + ' فيصبح الرقم ' + L(s.a) + '، ثم ' : '') + L(s.a) + ' − ' + L(s.b) + ' = ' + L(s.w)), ['نتحقق بالجمع: الناتج + المطروح = المطروح منه']);
    }
    return head.concat(addCols(c ? [a, b, c] : [a, b]).cols.map((s) => 'منزلة ' + G.placeName(s.i) + ': المجموع ' + L(s.sum) + (s.cin ? ' (مع المحمول ' + L(s.cin) + ')' : '') + '، نكتب ' + L(s.w) + (s.cout ? ' ونحمل ' + L(s.cout) : '')), ['نتحقق بالتبديل أو بالطرح']);
  };
  G.reg({
    id: 'add-sub-millions', unit: U, order: 1, lesson: '2-1 – 2-4', lessonTitle: 'الجمع والطرح ضمن الملايين', page: 27,
    titleAr: 'الجمع والطرح العموديان ضمن الملايين (مع حمل واستلاف)', titleEn: 'Column Addition & Subtraction within Millions', tags: 'جمع طرح عمودي حمل استلاف لوحه المنازل ملايين تحقق تبديل عمليه عكسيه شهداء سكان مصنع حجر زيارات',
    formula: '\\text{المطروح منه} - \\text{المطروح} = \\text{الناتج} \\iff \\text{الناتج} + \\text{المطروح} = \\text{المطروح منه}',
    book: 'نجمع (نطرح) الآحاد مع الآحاد والعشرات مع العشرات… بدءاً من الآحاد ؛ إذا زاد المجموع على ٩ نحمل ١ إلى المنزلة التالية ، وإذا كان الرقم أصغر نستلف من المنزلة التالية ؛ الطرح عملية عكسية للجمع',
    summary: 'نكتب الأعداد عمودياً في **لوحة المنازل** بحيث تكون الآحاد تحت الآحاد، ونبدأ من الآحاد. في الجمع إذا زاد مجموع منزلة على ٩ نكتب الآحاد و**نحمل** العشرة إلى المنزلة التالية. وفي الطرح إذا كان رقم المطروح منه أصغر **نستلف** ١ من المنزلة التالية (فيصبح ١٠ في المنزلة الحالية). نتحقق من الجمع بخاصية **التبديل**، ومن الطرح **بالجمع** لأن الطرح عملية عكسية للجمع.',
    vars: [['\\text{أ} ، \\text{ب}', 'العددان', 'حتى ١٠ منازل'], ['\\text{جـ}', 'عدد ثالث (اختياري) في الجمع', '']],
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'pop', options: G.opts(AS.map((e) => [e[0], e[1]]).concat([['custom', 'أعداد من اختياري']])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'add', options: [['add', 'جمع +'], ['sub', 'طرح −']] },
      numParam('a', '\\text{العدد الأول}', 4682467), numParam('b', '\\text{العدد الثاني}', 4232012),
      numParam('c', '\\text{عدد ثالث (اختياري)}', '', { validate: (v) => (v === '' ? null : G.validNum(MAXD)(v)), hidden: (p) => p.op !== 'add' }),
      { key: 's', label: '\\text{الخطوة}', type: 'stage', stages: stageNames, value: 8 }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = AS.find((x) => x[0] === p.ex); p.op = e[2]; p.a = String(e[3]); p.b = String(e[4]); p.c = e[5] ? String(e[5]) : ''; }
      else if (k === 'a' || k === 'b' || k === 'c' || k === 'op') p.ex = 'custom';
      if (k !== 's') p.s = stageNames(p).length - 1;
    },
    custom: true, canvasHint: 'حرّك «الخطوة» لترى الحل منزلة منزلة من الآحاد. الدوائر الصغيرة هي المحمول، والأرقام المشطوبة تبيّن الاستلاف.',
    compute(p) {
      const a = toN(p.a), b = toN(p.b), c = p.op === 'add' && p.c ? toN(p.c) : 0; const n = stageNames(p).length;
      if (p.op === 'sub') { if (a < b) return { sub: true, bad: true, a: a, b: b, n: n }; const r = subCols(a, b); return { sub: true, a: a, b: b, r: r, res: r.res, n: n }; }
      const nums = c ? [a, b, c] : [a, b]; const r = addCols(nums); return { sub: false, nums: nums, a: a, b: b, c: c, r: r, res: r.res, n: n };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const s = Math.min(p.s, d.n - 1);
      const rows = d.sub ? [d.a, d.b] : d.nums; const L = Math.max(String(d.res || 0).length, ...rows.map((x) => String(x).length));
      const gaps = Math.floor((L - 1) / 3); const cw = Math.min(50, (W - 60) / (L + 1.2 + gaps * 0.3)); const gap = cw * 0.3;
      const xr = W / 2 + (L * cw + gaps * gap) / 2 + cw * 0.4; const X = (i) => xr - (i + 0.5) * cw - Math.floor(i / 3) * gap;
      const rh = Math.min(48, (H - 70) / (rows.length + 3)); const y0 = 34; const fs = Math.min(26, cw * 0.6);
      // رؤوس المنازل
      for (let i = 0; i < L; i++) { ctx.fillStyle = ['rgba(37,99,235,.1)', 'rgba(5,150,105,.1)', 'rgba(217,119,6,.1)', 'rgba(124,58,237,.1)'][Math.floor(i / 3) % 4]; ctx.fillRect(X(i) - cw / 2 + 1, y0 - 26, cw - 2, rh * (rows.length + 2) + 30); G.txt(ctx, G.UNITS3[i % 3], X(i), y0 - 14, { color: c.muted, size: Math.min(11, cw * 0.27), w: '700' }); }
      const done = Math.max(0, Math.min(s, d.bad ? 0 : (d.sub ? d.r.cols.length : d.r.cols.length)));
      const yRow = (k) => y0 + 14 + (k + 0.6) * rh;
      if (d.sub && !d.bad) {
        const snap = done > 0 ? d.r.cols[done - 1].snap : digitsOf(d.a);
        const A = digitsOf(d.a);
        A.forEach((dg, i) => {
          const nv = snap[i]; const ch = nv !== dg && i < L;
          G.txt(ctx, dg, X(i), yRow(0), { color: ch ? c.muted : c.c1, size: fs, w: '800' });
          if (ch) { ctx.strokeStyle = c.c2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(i) - fs * 0.35, yRow(0) + fs * 0.35); ctx.lineTo(X(i) + fs * 0.35, yRow(0) - fs * 0.35); ctx.stroke(); G.txt(ctx, nv, X(i), yRow(0) - rh * 0.62, { color: c.c2, size: fs * 0.6, w: '800' }); }
        });
      } else rows.slice(0, 1).forEach((v) => digitsOf(v).forEach((dg, i) => G.txt(ctx, dg, X(i), yRow(0), { color: c.c1, size: fs, w: '800' })));
      rows.slice(1).forEach((v, k) => digitsOf(v).forEach((dg, i) => G.txt(ctx, dg, X(i), yRow(k + 1), { color: [c.c5, c.c6][k % 2], size: fs, w: '800' })));
      const sign = X(L - 1) - cw * 0.9; G.txt(ctx, d.sub ? '−' : '+', sign, yRow(rows.length - 1), { color: c.text, size: fs, w: '800' });
      const yl = yRow(rows.length - 1) + rh * 0.55; ctx.strokeStyle = c.text; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(L - 1) - cw * 0.6, yl); ctx.lineTo(X(0) + cw * 0.5, yl); ctx.stroke();
      if (d.bad) { G.txt(ctx, 'المطروح أكبر من المطروح منه', W / 2, yl + rh, { color: c.c2, size: 14, w: '800' }); return; }
      const cols = d.r.cols;
      for (let k = 0; k < done; k++) {
        const col = cols[k]; const last = k === done - 1 && s <= cols.length;
        G.txt(ctx, col.w, X(col.i), yl + rh * 0.65, { color: last ? c.c3 : c.text, size: fs, w: '800' });
        if (!d.sub && col.cout && col.i + 1 < L) { const cx = X(col.i + 1), cy = y0 + 2; ctx.strokeStyle = c.c4; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, fs * 0.38, 0, 7); ctx.stroke(); G.txt(ctx, col.cout, cx, cy, { color: c.c4, size: fs * 0.55, w: '800' }); }
      }
      if (s >= 1 && s <= cols.length) { const col = cols[s - 1]; ctx.save(); ctx.strokeStyle = c.c4; ctx.lineWidth = 2.5; ctx.setLineDash([5, 3]); ctx.strokeRect(X(col.i) - cw / 2 + 2, y0 - 6, cw - 4, yl + rh * 1.1 - y0); ctx.restore(); }
      if (s === d.n - 1) {
        const msg = d.sub ? 'التحقق: ' + G.sp(d.res) + ' + ' + G.sp(d.b) + ' = ' + G.sp(d.a) + ' ✔' : 'التحقق بالتبديل: ' + d.nums.slice().reverse().map(G.sp).join(' + ') + ' = ' + G.sp(d.res) + ' ✔';
        G.txt(ctx, msg, W / 2, Math.min(H - 14, yl + rh * 1.7), { color: c.c3, size: nar ? 12 : 15, w: '800' });
      }
    },
    live(p, d) { if (d.bad) return '\\text{المطروح أكبر من المطروح منه}'; return d.sub ? d.a + ' - ' + d.b + ' = ' + d.res : d.nums.join(' + ') + ' = ' + d.res; },
    results(p, d) {
      if (d.bad) return [['الناتج', 'لا نطرح عدداً أكبر من عدد أصغر في هذا الصف', false, 'neg'], ['المقارنة', G.sp(d.a) + ' < ' + G.sp(d.b), false]];
      const r = [['الناتج', G.sp(d.res), false, 'pos'], ['بالكلمات', G.words(d.res), false],
        [d.sub ? 'مرات الاستلاف' : 'مرات الحمل', G.L(d.sub ? d.r.borrows : d.r.carries), false],
        ['التحقق', d.sub ? G.sp(d.res) + ' + ' + G.sp(d.b) + ' = ' + G.sp(d.a) : G.sp(d.res) + ' − ' + G.sp(d.nums[d.nums.length - 1]) + ' = ' + G.sp(d.res - d.nums[d.nums.length - 1]), false]];
      if (p.ex === 'mart') r.push(['عدد الشهداء في الانتفاضتين', G.sp(d.res) + ' شهيداً', false, 'pos']);
      if (p.ex === 'fridge') r.push(['ثلاجات باقي أشهر السنة', G.sp(d.res), false, 'pos']);
      return r;
    },
    steps(p, d) { return stageNames(p).slice(1); },
    explain(a, b, da, db) { return da && !db.bad && db.r && (db.sub ? db.r.borrows : db.r.carries) && a.ex !== b.ex ? [db.sub ? 'في هذه المسألة استلاف (' + G.L(db.r.borrows) + ' مرات).' : 'في هذه المسألة حمل (' + G.L(db.r.carries) + ' مرات).'] : []; },
    learn: [
      '**نشاط 1 ص 27:** شهداء الانتفاضة الأولى ١٣٩٢ وانتفاضة الأقصى ٤٦٧٣ ، فالمجموع ٦٠٦٥ شهيداً.',
      '**نشاط 2 ص 27:** ١٥١٢٠٧٦ + ١٣٥٢٨٠٣ = ٢٨٦٤٨٧٩ ديناراً ثمن قطعة الأرض.',
      '**نشاط 5 ص 29:** نتحقق من الجمع بخاصية التبديل: ١٢٣٤٥٦٠ + ٤٥٦٤٢٢٩ = ٤٥٦٤٢٢٩ + ١٢٣٤٥٦٠ = ٥٧٩٨٧٨٩.',
      '**نشاط 1 ص 30:** سكان فلسطين ٤٦٨٢٤٦٧ ولبنان ٤٢٣٢٠١٢ ، فالمجموع ٨٩١٤٤٧٩.',
      '**نشاط 1 ص 32:** بيكين ٧٢٩٦٩٦٢ وتيانجين ٥٠٦٦١٢١ ، فالزيادة ٢٢٣٠٨٤١ نسمة؛ والطرح عملية عكسية للجمع.',
      '**نشاط 3 ص 33:** ٧ ملايين − ٤ ملايين = ٣ ملايين ، و ٩٠٠٠٠٠ − ٤٠٠٠٠٠ = ٥٠٠٠٠٠.',
      '**نشاط 1 ص 34:** دخل مصنع الحجر في عوريف ٨٠١٥٢٣٦ ثم ٩٣٤٦٣٤٧ ديناراً، والفرق ١٣٣١١١١.',
      '**نشاط 4 ص 35:** جنين تزيد على نابلس ١٥٣٢٩١ زيارة، ومجموع جنين وأريحا ١٨٩٠٠١٩.',
      '**نشاط 6 ص 36 (النمط):** ١١ مليوناً، ٩ ملايين، ٧ ملايين، ٥ ملايين، ٣ ملايين ؛ و ٩٢٠٠١٢٥ ، ٧٢٠٠١٢٥ ، ٥٢٠٠١٢٥ ، ٣٢٠٠١٢٥.',
      '**مراجعة 2 ص 40:** من البطاقات ١–٩: أكبر عدد زوجي من ٦ منازل ٩٨٧٦٥٤ وأصغر عدد فردي ١٢٣٤٥٧ ، والفرق ٨٦٤١٩٧.'
    ],
    challenges: [
      { q: 'جد عدد سكان فلسطين ولبنان معاً (نشاط 1 ص 30).', hint: 'اجمع ٤٦٨٢٤٦٧ و ٤٢٣٢٠١٢.', init: { ex: 'custom', op: 'add', a: '1', b: '1', c: '' }, check: (p, d) => !d.sub && d.nums.length === 2 && d.nums.includes(4682467) && d.nums.includes(4232012), why: () => '٨٩١٤٤٧٩ نسمة.' },
      { q: 'كم يزيد دخل مصنع الحجر في السنة الثانية على الأولى؟', hint: '٩٣٤٦٣٤٧ − ٨٠١٥٢٣٦', init: { ex: 'custom', op: 'add', a: '9346347', b: '8015236', c: '' }, check: (p, d) => d.sub && d.a === 9346347 && d.b === 8015236, why: () => '١٣٣١١١١ ديناراً.' },
      { q: 'اكتب مسألة طرح فيها استلاف من منزلة صفرية (مثل ١٠٠٠٠٠٠ − ٣٤٠٠٠٠).', hint: 'اجعل أصفاراً في المطروح منه.', init: { ex: 'custom', op: 'sub', a: '999', b: '111', c: '' }, check: (p, d) => d.sub && !d.bad && d.r.cols.some((x) => x.borrow && x.borrow.from > x.i + 1) },
      { q: 'جد مجموع الأعداد الثلاثة في نشاط 3 ص 30.', hint: 'استعمل الخانة الثالثة.', init: { ex: 'custom', op: 'add', a: '6198432', b: '1620357', c: '' }, check: (p, d) => !d.sub && d.nums.length === 3 && d.res === 9564029, why: () => '٩٥٦٤٠٢٩.' }
    ],
    tutor: [
      { q: 'متى أحمل؟', k: ['احمل', 'حمل'], a: () => 'عندما يزيد مجموع المنزلة على ٩؛ أكتب الآحاد وأحمل العشرات إلى المنزلة التالية.' },
      { q: 'كيف أستلف من صفر؟', k: ['استلف', 'صفر'], a: () => 'أستلف من أول منزلة غير صفرية على اليسار، فيصبح كل صفر في الطريق ٩، والمنزلة الحالية تزيد ١٠.' },
      { q: 'كيف أتحقق من الطرح؟', k: ['اتحقق', 'تحقق'], a: () => 'أجمع الناتج مع المطروح فيجب أن أحصل على المطروح منه، لأن الطرح عملية عكسية للجمع.' }
    ]
  });

  /* ======================= الدرس 5: التقريب (ص 37–39) ======================= */
  const PLACES = [[10, 'لأقرب عشرة'], [100, 'لأقرب مئة'], [1000, 'لأقرب ألف'], [10000, 'لأقرب عشرة آلاف'], [100000, 'لأقرب مئة ألف'], [1000000, 'لأقرب مليون']];
  const RD = [
    ['fans', 'نشاط 1 ص 37: مشجعو كرة القدم ٢٠١٢م', 'round', 8962136, 1000000], ['prof', 'نشاط 2 ص 38: أرباح شركة فلسطينية', 'round', 8423614, 1000000],
    ['t1a', 'نشاط 3 ص 38: ٢١٥٤٧٨٩ لأقرب ألف', 'round', 2154789, 1000], ['t1b', 'نشاط 3: ٢١٥٤٧٨٩ لأقرب عشرة آلاف', 'round', 2154789, 10000], ['t1c', 'نشاط 3: ٢١٥٤٧٨٩ لأقرب مئة ألف', 'round', 2154789, 100000], ['t1d', 'نشاط 3: ٢١٥٤٧٨٩ لأقرب مليون', 'round', 2154789, 1000000],
    ['t2a', 'نشاط 3: ٧٨٠٥٢٢٠ لأقرب ألف', 'round', 7805220, 1000], ['t2b', 'نشاط 3: ٧٨٠٥٢٢٠ لأقرب عشرة آلاف', 'round', 7805220, 10000], ['t2c', 'نشاط 3: ٧٨٠٥٢٢٠ لأقرب مئة ألف', 'round', 7805220, 100000], ['t2d', 'نشاط 3: ٧٨٠٥٢٢٠ لأقرب مليون', 'round', 7805220, 1000000],
    ['omar', 'نشاط 4 ص 38: رقم عمر المغطى (٥١٢٢٧٠٢)', 'round', 5122702, 1000], ['gaza', 'نشاط 5 ص 39: المسافة المتبقية إلى غزة ٤١ كم', 'round', 41, 10],
    ['e1', 'نشاط 6 ص 39 (أ): تقدير ٥٢٥٤٣٦٠ + ١٢٢٤٧٨٣', 'est', 5254360, 0, 1224783, 'add'], ['e2', 'نشاط 6 (ب): تقدير ٥٩٠٣٦٠٠ − ٣٢٠٤١٦٣', 'est', 5903600, 0, 3204163, 'sub'],
    ['r1', 'مراجعة 5 ص 41: ٤٦١٤٥٢٣ لأقرب مليون', 'round', 4614523, 1000000], ['r2', 'مراجعة 5: ٧٢٥٦٠٨٢ لأقرب مليون', 'round', 7256082, 1000000]
  ];
  const roundTo = (n, P) => { const lo = Math.floor(n / P) * P; return { lo: lo, hi: lo + P, r: n - lo >= P / 2 ? lo + P : lo, up: n - lo >= P / 2 }; };
  const top = (n) => Math.pow(10, Math.max(0, String(n).length - 1));
  G.reg({
    id: 'rounding', unit: U, order: 2, lesson: '2-5', lessonTitle: 'التقريب', page: 37,
    titleAr: 'التقريب وتقدير ناتج الجمع والطرح', titleEn: 'Rounding & Estimating', tags: 'تقريب اقرب عشره مئه الف مليون تقدير جمع طرح خط الاعداد مشجعين ارباح',
    formula: '\\text{الرقم على اليمين} \\ge 5 \\Rightarrow +1,\\qquad < 5 \\Rightarrow \\text{يبقى}',
    book: 'نركّز على المنزلة المطلوبة ونضع خطاً تحت رقمها، ثم ننظر إلى الرقم الذي على يمينه مباشرة: إذا كان أكبر من ٥ أو يساويه نضيف ١ لرقم المنزلة، وإذا كان أقل من ٥ يبقى كما هو، ونستبدل الأرقام التي على يمينه بأصفار',
    summary: 'لتقريب عدد إلى منزلة معيّنة ننظر إلى **الرقم الذي على يمينها مباشرة**: إذا كان **٥ أو أكثر** نضيف ١ إلى رقم المنزلة، وإذا كان **أقل من ٥** يبقى كما هو، ثم نستبدل الأرقام التي على يمينها **بأصفار**. على خط الأعداد نختار المضاعف **الأقرب**. ونقدّر ناتج الجمع أو الطرح بتقريب كل عدد **لأعلى منزلة** فيه.',
    vars: [['\\text{المنزلة}', 'التي نقرّب إليها', 'عشرة … مليون'], ['\\approx', 'يساوي تقريباً', '']],
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'fans', options: G.opts(RD.map((e) => [e[0], e[1]]).concat([['custom', 'عدد من اختياري']])) },
      { key: 'mode', label: '\\text{المطلوب}', type: 'select', value: 'round', options: [['round', 'أقرّب عدداً'], ['est', 'أقدّر ناتج الجمع أو الطرح']] },
      numParam('num', '\\text{العدد}', 8962136),
      { key: 'place', label: '\\text{التقريب}', type: 'select', value: '1000000', options: PLACES.map((x) => [String(x[0]), x[1]]), hidden: (p) => p.mode !== 'round' },
      numParam('b', '\\text{العدد الثاني}', 1224783, { hidden: (p) => p.mode !== 'est' }),
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'add', options: [['add', 'جمع +'], ['sub', 'طرح −']], hidden: (p) => p.mode !== 'est' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = RD.find((x) => x[0] === p.ex); p.mode = e[2]; p.num = String(e[3]); if (e[4]) p.place = String(e[4]); if (e[5]) { p.b = String(e[5]); p.op = e[6]; } }
      else if (k !== 'ex') p.ex = 'custom';
    },
    custom: true, canvasHint: 'الخط تحت رقم المنزلة، والسهم عند الرقم الذي على يمينها. على خط الأعداد ترى أي المضاعفين أقرب إلى العدد.',
    compute(p) {
      const n = toN(p.num);
      if (p.mode === 'est') { const b = toN(p.b); const A = roundTo(n, top(n)), B = roundTo(b, top(b)); const exact = p.op === 'add' ? n + b : n - b; const est = p.op === 'add' ? A.r + B.r : A.r - B.r; return { est: true, n: n, b: b, A: A, B: B, exact: exact, estv: est }; }
      const P = +p.place; const R = roundTo(n, P); const k = Math.round(Math.log10(P)); const dg = digitsOf(n);
      return { n: n, P: P, R: R, k: k, look: dg[k - 1] || 0, own: dg[k] || 0 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      const line = (n, P, R, y, col) => {
        const x0 = nar ? 26 : 50, x1 = W - (nar ? 26 : 50); const X = (v) => x0 + (v - R.lo) / P * (x1 - x0);
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 12, y); ctx.lineTo(x1 + 12, y); ctx.stroke();
        for (let i = 0; i <= 10; i++) { const x = x0 + i * (x1 - x0) / 10; ctx.fillStyle = i === 5 ? c.c2 : c.text; ctx.fillRect(x - 1, y - (i % 5 === 0 ? 10 : 6), 2, i % 5 === 0 ? 20 : 12); }
        G.txt(ctx, G.sp(R.lo), x0, y + 24, { color: c.text, size: nar ? 11 : 13, w: '800' }); G.txt(ctx, G.sp(R.hi), x1, y + 24, { color: c.text, size: nar ? 11 : 13, w: '800' });
        G.txt(ctx, 'المنتصف', (x0 + x1) / 2, y + 24, { color: c.c2, size: 11, w: '700' });
        const px = X(n); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, y, 7, 0, 7); ctx.fill(); G.txt(ctx, G.sp(n), px, y - 22, { color: col, size: nar ? 12 : 14, w: '800', halo: c.bg });
        const tx = X(R.r); G.arrow(ctx, px, y + 40, tx, y + 40, c.c3, 2.4);
      };
      if (d.est) {
        line(d.n, top(d.n), d.A, H * 0.22, c.c1); line(d.b, top(d.b), d.B, H * 0.55, c.c5);
        G.txt(ctx, G.sp(d.n) + (p.op === 'add' ? ' + ' : ' − ') + G.sp(d.b) + ' ≈ ' + G.sp(d.A.r) + (p.op === 'add' ? ' + ' : ' − ') + G.sp(d.B.r) + ' = ' + G.sp(d.estv), W / 2, H - 22, { color: c.c3, size: nar ? 12 : 16, w: '800' });
        return;
      }
      // أرقام العدد مع الخط والسهم كما في الكتاب
      const dg = digitsOf(d.n); const L = dg.length; const cw = Math.min(40, (W - 40) / (L + 1)); const xr = W / 2 + L * cw / 2; const X = (i) => xr - (i + 0.5) * cw; const y = H * 0.16;
      dg.forEach((v, i) => G.txt(ctx, v, X(i), y, { color: i === d.k ? c.c2 : i === d.k - 1 ? c.c4 : c.text, size: Math.min(26, cw * 0.65), w: '800' }));
      if (d.k < L) { ctx.strokeStyle = c.c2; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X(d.k) - cw * 0.35, y + 16); ctx.lineTo(X(d.k) + cw * 0.35, y + 16); ctx.stroke(); }
      if (d.k - 1 < L) G.arrow(ctx, X(d.k - 1), y + 44, X(d.k - 1), y + 18, c.c4, 2);
      G.txt(ctx, G.L(d.look) + (d.look >= 5 ? ' ≥ ٥ ، نضيف ١' : ' < ٥ ، يبقى كما هو'), W / 2, y + 62, { color: c.c4, size: nar ? 12 : 14, w: '800' });
      line(d.n, d.P, d.R, H * 0.64, c.c1);
      G.txt(ctx, G.sp(d.n) + ' ≈ ' + G.sp(d.R.r), W / 2, H - 14, { color: c.c3, size: nar ? 15 : 19, w: '800' });
    },
    live(p, d) { if (d.est) return d.n + (p.op === 'add' ? ' + ' : ' - ') + d.b + ' \\approx ' + d.A.r + (p.op === 'add' ? ' + ' : ' - ') + d.B.r + ' = ' + d.estv; return d.n + ' \\approx ' + d.R.r; },
    results(p, d) {
      if (d.est) return [['التقدير', G.sp(d.estv), false, 'pos'], ['الناتج الدقيق', G.sp(d.exact), false], ['تقريب العددين', G.sp(d.A.r) + ' و ' + G.sp(d.B.r), false]];
      const r = [['التقريب', G.sp(d.R.r), false, 'pos'], ['بين المضاعفين', G.sp(d.R.lo) + ' و ' + G.sp(d.R.hi), false], ['الرقم على يمين المنزلة', G.L(d.look), false]];
      if (p.ex === 'gaza') r.push(['المسافة المتبقية', '٧٨ − ٣٧ = ٤١ كم ≈ ٤٠ كم', false, 'pos']);
      return r;
    },
    steps(p, d) {
      if (d.est) return ['نقرّب كل عدد لأعلى منزلة فيه: ' + G.sp(d.n) + ' ≈ ' + G.sp(d.A.r) + ' و ' + G.sp(d.b) + ' ≈ ' + G.sp(d.B.r) + '.', 'نجري العملية على العددين المقرّبين: ' + G.sp(d.estv) + '.', 'الناتج الدقيق ' + G.sp(d.exact) + '، والتقدير قريب منه.'];
      return ['نضع خطاً تحت رقم منزلة ' + G.placeName(d.k) + ' (' + G.L(d.own) + ').', 'ننظر إلى الرقم الذي على يمينه مباشرة: ' + G.L(d.look) + (d.look >= 5 ? ' ≥ ٥ ، فنضيف ١ إلى رقم المنزلة.' : ' < ٥ ، فيبقى رقم المنزلة كما هو.'), 'نستبدل الأرقام التي على اليمين بأصفار: ' + G.sp(d.n) + ' ≈ ' + G.sp(d.R.r) + '.'];
    },
    explain(a, b, da, db) { return da && !db.est && !da.est && da.R.up !== db.R.up ? [db.R.up ? 'التقريب الآن إلى الأعلى.' : 'التقريب الآن إلى الأسفل.'] : []; },
    learn: [
      '**نشاط 1 ص 37:** مشجعو كرة القدم ٢٠١٢م ٨٩٦٢١٣٦ ؛ منزلة آحاد الملايين ٨ والرقم على يمينها ٩ > ٥ ، فالعدد ≈ ٩٠٠٠٠٠٠.',
      '**نشاط 2 ص 38:** ٨٤٢٣٦١٤ ≈ ٨٠٠٠٠٠٠ لأن ٤ < ٥.',
      '**نشاط 3 ص 38:** ٢١٥٤٧٨٩ لأقرب مئة ألف = ٢٢٠٠٠٠٠ (كما في الجدول).',
      '**نشاط 4 ص 38:** إذا قُرّب العدد ٥١٢؟٧٠٢ لأقرب ألف فكان ٥١٢٣٠٠٠ فالرقم المغطى ٢ (لأن ٧ ≥ ٥ تضيف ١).',
      '**نشاط 7 ص 39:** عدد سكان قلقيلية ٦٠٠٠٠ نسمة عدد تقريبي، لأن الأعداد الدقيقة نادراً ما تنتهي بأربعة أصفار.'
    ],
    challenges: [
      { q: 'قرّب ٨٩٦٢١٣٦ لأقرب مليون (نشاط 1).', hint: 'اختر «لأقرب مليون».', init: { ex: 'custom', mode: 'round', num: '8962136', place: '1000' }, check: (p, d) => !d.est && d.n === 8962136 && d.P === 1000000, why: () => '٩٠٠٠٠٠٠.' },
      { q: 'اكتب عدداً من ٧ منازل يُقرَّب لأقرب ألف إلى ٥١٢٣٠٠٠ (نشاط 4).', hint: 'مثل ٥١٢٢٧٠٢.', init: { ex: 'custom', mode: 'round', num: '5000000', place: '1000' }, check: (p, d) => !d.est && d.P === 1000 && d.R.r === 5123000 && String(d.n).length === 7 },
      { q: 'قدّر ناتج ٥٩٠٣٦٠٠ − ٣٢٠٤١٦٣ (نشاط 6 ب).', hint: 'اختر التقدير والطرح.', init: { ex: 'custom', mode: 'round', num: '5903600', place: '10', b: '3204163', op: 'add' }, check: (p, d) => d.est && p.op === 'sub' && d.n === 5903600 && d.b === 3204163, why: () => '٦٠٠٠٠٠٠ − ٣٠٠٠٠٠٠ = ٣٠٠٠٠٠٠.' }
    ],
    tutor: [
      { q: 'ماذا أفعل إذا كان الرقم على اليمين ٥؟', k: ['٥', 'خمسه', 'يساوي'], a: () => 'إذا كان ٥ أو أكثر نضيف ١ إلى رقم المنزلة (نقرّب إلى الأعلى).' },
      { q: 'لماذا نقرّب الأعداد؟', k: ['لماذا', 'فائده'], a: () => 'لنقدّر النواتج بسرعة ونتأكد أن الحل الدقيق معقول، ولأن كثيراً من الأعداد في الحياة تقريبية مثل عدد السكان.' },
      { q: 'ما التقريب الحالي؟', k: ['الحالي', 'التقريب'], a: (p, d) => (d.est ? 'التقدير ' + G.sp(d.estv) + '.' : G.sp(d.n) + ' ≈ ' + G.sp(d.R.r) + '.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
