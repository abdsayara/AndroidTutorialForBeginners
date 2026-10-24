/* رياضيات الرابع — الوحدة الثالثة: الضرب والقسمة (1) (ص 42–65) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 3;

  // مسائل الكتاب: [المفتاح، الاسم، العملية، العدد الأول، العدد الثاني]
  const EX = [
    ['o54', 'نشاط 1 ص 55: ٥٤ حبة برتقال، ٩ في كل صحن', 'div', 54, 9], ['bk46', 'نشاط 4 ص 56: ٤٦ كتاباً على رفّين', 'div', 46, 2], ['l39', 'نشاط 5 ص 58: ٣٩ ÷ ٣', 'div', 39, 3],
    ['l62', 'نشاط 5: ٦٢ ÷ ٢', 'div', 62, 2], ['l90', 'نشاط 5: ٩٠ ÷ ٦', 'div', 90, 6], ['l68', 'نشاط 5: ٦٨ ÷ ٤', 'div', 68, 4], ['pen', 'نشاط 6 ص 58: ٩٦ قلماً على ٦ طلاب', 'div', 96, 6],
    ['ball', 'نشاط 8 ص 59: ٨٤ ديناراً، الكرة بـ ٦', 'div', 84, 6], ['tree', 'نشاط 9 ص 59: ٩٨ شجرة في ٧ صفوف', 'div', 98, 7],
    ['t5', 'نشاط 1 ص 60: ٣١ طالباً في ٥ فرق', 'div', 31, 5], ['t6', 'نشاط 1: ٣١ طالباً في ٦ فرق', 'div', 31, 6], ['r75', 'نشاط 3 ص 61: ٧٥ ÷ ٤', 'div', 75, 4],
    ['cow', 'نشاط 7 ص 59: ١٠٨ بقرات × ٩ لترات', 'mul', 108, 9], ['shoe', 'نشاط 5 ص 53: ٤٨٠ حذاءً × ٧ أيام', 'mul', 480, 7], ['sheep', 'نشاط 6 ص 53: ٣١٧ ديناراً × ٤ خراف', 'mul', 317, 4],
    ['a', 'نشاط 4 (أ) ص 62: ٩٦ ÷ ٥', 'div', 96, 5], ['b', 'نشاط 4 (ب): ٧٣ ÷ ٦', 'div', 73, 6], ['c', 'نشاط 4 (جـ): ٨٦ ÷ ٧', 'div', 86, 7], ['d', 'نشاط 4 (د): ٥٧ ÷ ٩', 'div', 57, 9],
    ['boat', 'نشاط 5 ص 63: ٧٤ طالباً، كل قارب ٨ طلاب', 'div', 74, 8], ['e84', 'نشاط 6 ص 63 ومراجعة 1 (جـ): ٨٤ ÷ ٤', 'div', 84, 4],
    ['r64', 'مراجعة 1 (د) ص 64: ٦٤ ÷ ٧', 'div', 64, 7], ['r27', 'مراجعة 2 ص 64: ٢٧ ÷ ٤', 'div', 27, 4], ['r38', 'مراجعة 2 ص 64: ٣٨ ÷ ٩', 'div', 38, 9],
    ['books', 'مراجعة 4 ص 64: ٨ كتب بـ ٥٦ ديناراً', 'div', 56, 8], ['q93', 'مراجعة 7 ص 65: ٩٣ ÷ ٤', 'div', 93, 4],
    ['m87', 'مراجعة 1 (أ) ص 64: ٨٧ × ٩', 'mul', 87, 9], ['m907', 'مراجعة 1 (ب): ٩٠٧ × ٨', 'mul', 907, 8], ['m74', 'مراجعة 7 ص 65: ٧٤ × ٥', 'mul', 74, 5],
    ['m124', 'مراجعة 6 ص 65: ١٢٤ × ٨', 'mul', 124, 8]
  ];
  const exOf = (k) => EX.find((e) => e[0] === k);

  // خطوات القسمة الطويلة: نبدأ بأصغر جزء من اليسار لا يقل عن المقسوم عليه، ثم ننزل منزلة في كل مرة
  function divide(a, b) {
    const dg = String(a).split('').map(Number); const L = dg.length;
    let s0 = 0, cur = dg[0];
    while (cur < b && s0 < L - 1) { s0++; cur = cur * 10 + dg[s0]; }
    const steps = [];
    for (let i = s0; i < L; i++) {
      const q = Math.floor(cur / b), prod = q * b, rem = cur - prod;
      steps.push({ i: i, cur: cur, q: q, prod: prod, rem: rem, next: i < L - 1 ? rem * 10 + dg[i + 1] : null });
      if (i < L - 1) cur = rem * 10 + dg[i + 1];
    }
    return { dg: dg, s0: s0, steps: steps, q: Math.floor(a / b), r: a % b };
  }
  // خطوات الضرب العمودي: من منزلة الآحاد مع الحمل
  function multiply(a, b) {
    const dg = String(a).split('').map(Number); const steps = []; let carry = 0;
    for (let i = dg.length - 1; i >= 0; i--) {
      const p = dg[i] * b + carry; steps.push({ i: i, d: dg[i], cin: carry, p: p, w: i === 0 ? p : p % 10, cout: i === 0 ? 0 : Math.floor(p / 10) }); carry = i === 0 ? 0 : Math.floor(p / 10);
    }
    return { dg: dg, steps: steps, prod: a * b };
  }
  const stageNames = (p) => {
    const op = p.op || 'div', a = p.a || 96, b = p.b || 5; const L = (x) => (ML.locDigits ? ML.locDigits(String(x)) : String(x));
    if (op === 'mul') {
      const m = multiply(a, b);
      return ['نكتب المسألة عمودياً: ' + L(a) + ' × ' + L(b)].concat(m.steps.map((s) => 'نضرب ' + L(b) + ' × ' + L(s.d) + (s.cin ? ' ونضيف المحمول ' + L(s.cin) : '') + ' = ' + L(s.p) + (s.i === 0 ? '، نكتبه كاملاً' : '، نكتب ' + L(s.p % 10) + (s.cout ? ' ونحمل ' + L(s.cout) : ''))), ['الناتج: ' + L(a) + ' × ' + L(b) + ' = ' + L(m.prod)]);
    }
    const r = divide(a, b);
    return ['نكتب المسألة: المقسوم ' + L(a) + ' داخل الإطار، والمقسوم عليه ' + L(b) + ' خارجه'].concat(r.steps.map((s) => 'نقسم ' + L(s.cur) + ' على ' + L(b) + ': ' + L(s.q) + ' × ' + L(b) + ' = ' + L(s.prod) + '، والباقي ' + L(s.rem) + (s.next !== null ? '، ثم ننزل المنزلة التالية فيصبح ' + L(s.next) : '')), ['التحقق: ' + L(r.q) + ' × ' + L(b) + ' + ' + L(r.r) + ' = ' + L(a)]);
  };

  G.reg({
    id: 'long-division', unit: U, order: 3, lesson: '3-3 – 3-5', lessonTitle: 'القسمة الطويلة (دون باقٍ ومع باقٍ) والمراجعة', page: 57,
    titleAr: 'القسمة الطويلة والتحقق منها', titleEn: 'Long Division and Checking', tags: 'قسمه طويله مقسوم مقسوم عليه ناتج باقي تحقق ضرب عمودي حمل قوارب عكا كتب',
    formula: '\\text{المقسوم} = \\text{الناتج} \\times \\text{المقسوم عليه} + \\text{الباقي}',
    book: 'التحقق: (الناتج × المقسوم عليه) + الباقي = المقسوم ، والباقي أصغر من المقسوم عليه',
    summary: 'في القسمة الطويلة نبدأ من المنزلة الكبرى (اليسار): نقسم، ثم نضرب، ثم نطرح، ثم ننزل المنزلة التالية، ونكرر حتى تنتهي المنازل. الباقي دائماً أصغر من المقسوم عليه، ونتحقق من الحل بأن (الناتج × المقسوم عليه) + الباقي = المقسوم.',
    vars: [['\\text{المقسوم}', 'العدد الذي نقسمه', 'من ١٠ إلى ٩٩٩'], ['\\text{المقسوم عليه}', 'العدد الذي نقسم عليه', 'من ٢ إلى ٩'], ['\\text{الباقي}', 'ما يتبقى بعد القسمة', 'أصغر من المقسوم عليه']],
    params: [
      { key: 'ex', label: '\\text{المسألة}', type: 'select', value: 'bk46', options: G.opts(EX.map((e) => [e[0], e[1]]).concat([['custom', 'مسألة من اختياري']])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'div', options: [['div', 'القسمة الطويلة ÷'], ['mul', 'الضرب العمودي ×']] },
      { key: 'a', label: '\\text{العدد}', min: 10, max: 999, step: 1, value: 46, int: true },
      { key: 'b', label: '\\text{في / على}', min: 2, max: 9, step: 1, value: 2, int: true },
      { key: 's', label: '\\text{الخطوة}', type: 'stage', stages: stageNames, value: 3 }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = exOf(p.ex); p.op = e[2]; p.a = e[3]; p.b = e[4]; }
      if (k === 'a' || k === 'b' || k === 'op') p.ex = 'custom';
      if (k !== 's') p.s = stageNames(p).length - 1;
    },
    custom: true, canvasHint: 'حرّك «الخطوة» لترى القسمة الطويلة تُبنى منزلة منزلة. المجموعات تبيّن معنى القسمة: كل مجموعة فيها عدد يساوي المقسوم عليه، والأحمر هو الباقي.',
    compute(p) {
      if (p.op === 'mul') { const m = multiply(p.a, p.b); return { mul: true, m: m, n: stageNames(p).length }; }
      const r = divide(p.a, p.b); return { mul: false, r: r, q: r.q, rem: r.r, n: stageNames(p).length };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const s = Math.min(p.s, d.n - 1);
      const showGroups = !d.mul && p.a <= 120;
      const area = showGroups ? (nar ? { x: 0, y: 0, w: W, h: H * 0.56 } : { x: 0, y: 0, w: W * 0.5, h: H }) : { x: 0, y: 0, w: W, h: H };
      const L = d.mul ? d.m.dg.length + 1 : d.r.dg.length;
      const rows = d.mul ? 5 : 2 + 2 * d.r.steps.length;
      const cw = Math.min(46, (area.w - 90) / (L + 2), (area.h - 30) / (rows + 1) * 1.05); const rh = cw * 0.95; const fs = cw * 0.62;
      const x0 = area.x + area.w / 2 - (L - 1) * cw / 2 + (d.mul ? 0 : cw * 0.6); const y0 = area.y + Math.max(18, (area.h - rows * rh) / 2);
      const X = (col) => x0 + col * cw; const num = (v, col, y, color) => String(v).split('').reverse().forEach((ch, k) => G.txt(ctx, ch, X(col - k), y, { color: color || c.text, size: fs, w: '800' }));
      if (d.mul) {
        const m = d.m; const off = 1; // عمود إضافي يساراً لمنزلة الناتج الأكبر
        const done = m.steps.slice(0, Math.max(0, s));
        // المحمول فوق المنزلة التالية
        done.forEach((st) => { if (st.cout && st.i > 0) G.txt(ctx, st.cout, X(st.i - 1 + off), y0, { color: c.c4, size: fs * 0.6, w: '800' }); });
        num(p.a, m.dg.length - 1 + off, y0 + rh, c.text);
        num(p.b, m.dg.length - 1 + off, y0 + 2 * rh, c.c1); G.txt(ctx, '×', X(0) - cw * 0.2, y0 + 2 * rh, { color: c.c1, size: fs, w: '800' });
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0) - cw * 0.5, y0 + 2.6 * rh); ctx.lineTo(X(L - 1) + cw * 0.5, y0 + 2.6 * rh); ctx.stroke();
        done.forEach((st, k) => { const last = k === done.length - 1; const v = st.i === 0 ? st.p : st.p % 10; num(v, st.i + off, y0 + 3.3 * rh, last ? c.c3 : c.text); });
        if (s > 0 && s <= m.steps.length) { const st = m.steps[s - 1]; ctx.save(); ctx.strokeStyle = c.c4; ctx.lineWidth = 2; ctx.strokeRect(X(st.i + off) - cw / 2, y0 + rh * 0.5, cw, rh * 1.05); ctx.restore(); }
        if (s === d.n - 1) G.txt(ctx, G.L(p.a) + ' × ' + G.L(p.b) + ' = ' + G.L(m.prod), area.x + area.w / 2, y0 + 4.4 * rh, { color: c.c3, size: fs * 0.8, w: '800' });
        return;
      }
      const r = d.r; const done = r.steps.slice(0, Math.max(0, Math.min(s, r.steps.length)));
      // الإطار: المقسوم عليه يساراً، والمقسوم تحت الخط، والناتج فوقه
      const yq = y0, yd = y0 + rh;
      ctx.strokeStyle = c.text; ctx.lineWidth = 2.2; ctx.beginPath();
      ctx.moveTo(X(L - 1) + cw * 0.6, yd - rh * 0.55); ctx.lineTo(X(0) - cw * 0.6, yd - rh * 0.55); ctx.lineTo(X(0) - cw * 0.6, yd + rh * 0.5); ctx.lineTo(X(0) - cw * 1.5, yd + rh * 0.5); ctx.stroke();
      G.txt(ctx, p.b, X(0) - cw * 1.05, yd, { color: c.c1, size: fs, w: '800' });
      num(p.a, L - 1, yd, c.text);
      done.forEach((st, k) => {
        const last = k === done.length - 1 && s <= r.steps.length;
        G.txt(ctx, st.q, X(st.i), yq, { color: last ? c.c3 : c.c5, size: fs, w: '800' });
        const yp = yd + (2 * k + 1) * rh, yr = yp + rh;
        num(st.prod, st.i, yp, last ? c.c2 : c.muted); G.txt(ctx, '−', X(st.i - String(st.prod).length + 1) - cw * 0.65, yp, { color: c.muted, size: fs * 0.9, w: '800' });
        ctx.strokeStyle = c.muted; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(st.i - String(st.cur).length + 1) - cw * 0.5, yp + rh * 0.5); ctx.lineTo(X(st.i) + cw * 0.5, yp + rh * 0.5); ctx.stroke();
        if (st.next !== null) { num(st.rem, st.i, yr, last ? c.c4 : c.text); G.txt(ctx, r.dg[st.i + 1], X(st.i + 1), yr, { color: last ? c.c4 : c.text, size: fs, w: '800' }); if (last) G.arrow(ctx, X(st.i + 1), yd + rh * 0.45, X(st.i + 1), yr - rh * 0.45, c.c4, 1.6); } else num(st.rem, st.i, yr, c.c2);
      });
      if (s > 0 && s <= r.steps.length) { const st = r.steps[s - 1]; const len = String(st.cur).length; const yc = s === 1 ? yd : yd + (2 * (s - 1)) * rh; ctx.save(); ctx.strokeStyle = c.c4; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.strokeRect(X(st.i - len + 1) - cw * 0.5, yc - rh * 0.5, len * cw, rh); ctx.restore(); }
      if (s === d.n - 1) G.txt(ctx, G.L(r.q) + ' × ' + G.L(p.b) + ' + ' + G.L(r.r) + ' = ' + G.L(p.a) + ' ✔', area.x + area.w / 2, Math.min(area.y + area.h - 12, yd + (2 * r.steps.length + 1) * rh + 4), { color: c.c3, size: fs * 0.72, w: '800' });
      if (!showGroups) return;
      // المجموعات: الناتج = عدد المجموعات الكاملة، والباقي نقاط حمراء
      const gx = nar ? 10 : W * 0.5 + 6, gy = nar ? H * 0.58 : 14, gw = nar ? W - 20 : W * 0.5 - 16, gh = nar ? H * 0.42 - 14 : H - 28;
      G.box(ctx, gx, gy, gw, gh, c.grid);
      const q = r.q, b = p.b, rem = r.r; const per = Math.ceil(Math.sqrt(q + (rem ? 1 : 0)) * 1.4);
      const cols = Math.max(1, Math.min(q + (rem ? 1 : 0), per)); const rowsN = Math.ceil((q + (rem ? 1 : 0)) / cols);
      const bw = (gw - 16) / cols, bh = Math.min((gh - 34) / rowsN, bw * 0.8);
      const dotsC = Math.ceil(Math.sqrt(b * 1.6)); const dotR = Math.max(2, Math.min(bw / (dotsC * 2.8), bh / (Math.ceil(b / dotsC) * 2.8) , 6));
      for (let g = 0; g < q + (rem ? 1 : 0); g++) {
        const cx = gx + gw - 8 - (g % cols + 1) * bw, cy = gy + 26 + Math.floor(g / cols) * bh; const isRem = g === q;
        G.box(ctx, cx + 3, cy + 3, bw - 6, bh - 6, isRem ? c.c2 : c.c1, isRem ? 'rgba(220,38,38,.06)' : 'rgba(37,99,235,.06)');
        const n = isRem ? rem : b; const dr = Math.ceil(b / dotsC);
        for (let k = 0; k < n; k++) { const dx = cx + bw / 2 + ((k % dotsC) - (dotsC - 1) / 2) * dotR * 2.6, dy = cy + bh / 2 + (Math.floor(k / dotsC) - (dr - 1) / 2) * dotR * 2.6; ctx.fillStyle = isRem ? c.c2 : c.c1; ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, 7); ctx.fill(); }
      }
      G.txt(ctx, G.L(q) + ' مجموعات في كل منها ' + G.L(b) + (rem ? ' والباقي ' + G.L(rem) : ' بلا باقٍ'), gx + gw / 2, gy + 13, { color: c.text, size: nar ? 12 : 13, w: '700' });
    },
    live(p, d) {
      if (d.mul) return p.a + ' \\times ' + p.b + ' = ' + d.m.prod;
      return p.a + ' \\div ' + p.b + ' = ' + d.q + (d.rem ? '\\ \\text{والباقي}\\ ' + d.rem : '') + ',\\quad ' + d.q + ' \\times ' + p.b + ' + ' + d.rem + ' = ' + p.a;
    },
    results(p, d) {
      if (d.mul) return [['الناتج', G.L(d.m.prod), false, 'pos'], ['عدد مرات الحمل', G.L(d.m.steps.filter((s) => s.cout).length), false]];
      const out = [['الناتج', G.L(d.q), false, 'pos'], ['الباقي', G.L(d.rem), false, d.rem ? 'neg' : ''], ['التحقق', G.L(d.q) + ' × ' + G.L(p.b) + ' + ' + G.L(d.rem) + ' = ' + G.L(p.a), false]];
      if (p.ex === 'boat') out.push(['عدد القوارب اللازمة', G.L(d.q + (d.rem ? 1 : 0)) + ' (يبقى ' + G.L(d.rem) + ' طلاب في قارب إضافي)', false, 'pos']);
      if (p.ex === 'books') out.push(['ثمن ٣ كتب', G.L(d.q * 3) + ' ديناراً', false, 'pos']);
      return out;
    },
    steps(p, d) {
      const names = stageNames(p).slice(1);
      if (!d.mul && p.ex === 'boat') names.push('القوارب: ٩ قوارب ممتلئة، والطالبان الباقيان يحتاجان قارباً عاشراً، فيركب الطلاب ١٠ قوارب.');
      if (!d.mul && p.ex === 'books') names.push('ثمن الكتاب الواحد ٧ دنانير، فثمن ٣ كتب = ٣ × ٧ = ٢١ ديناراً.');
      return names;
    },
    explain(a, b, da, db) {
      if (!da || a.s !== b.s) return [];
      if (db.mul) return ['الضرب العمودي يبدأ من منزلة الآحاد، ونحمل العشرات إلى المنزلة التالية.'];
      return ['الناتج ' + G.L(db.q) + ' والباقي ' + G.L(db.rem) + '؛ والباقي أصغر من المقسوم عليه ' + G.L(b.b) + ' دائماً.'];
    },
    learn: [
      '**نشاط 4 ص 56–57:** ٤٦ كتاباً على رفّين: نقسم العشرات أولاً (٤ ÷ ٢ = ٢) ثم الآحاد (٦ ÷ ٢ = ٣)، فالناتج ٢٣ ؛ «نبدأ عملية القسمة من المنزلة الكبرى دائماً».',
      '**نشاط 5 ص 58:** ٣٩ ÷ ٣ = ١٣ والتحقق (١٣ × ٣) + ٠ = ٣٩ ؛ و ٦٢ ÷ ٢ = ٣١ ، ٩٠ ÷ ٦ = ١٥ ، ٦٨ ÷ ٤ = ١٧.',
      '**نشاطات 6–9 ص 58–59:** ٩٦ قلماً على ٦ طلاب = ١٦ ، ١٠٨ بقرات × ٩ لترات = ٩٧٢ لتراً يومياً (و ٩٧٢٠ في ١٠ أيام)، ٨٤ ÷ ٦ = ١٤ كرة، ٩٨ ÷ ٧ = ١٤ شجرة.',
      '**نشاط 1 ص 60:** ٣١ طالباً في ٥ فرق: ٣١ ÷ ٥ = ٦ والباقي ١ ، وفي ٦ فرق: ٥ والباقي ١ ؛ والتحقق: ناتج القسمة × المقسوم عليه + الباقي = المقسوم.',
      '**نشاط 4 ص 62:** ٩٦ ÷ ٥ = ١٩ والباقي ١ ، ٧٣ ÷ ٦ = ١٢ والباقي ١ ، ٨٦ ÷ ٧ = ١٢ والباقي ٢ ، ٥٧ ÷ ٩ = ٦ والباقي ٣ ؛ ونتحقق في كل منها بالضرب والجمع.',
      '**نشاط 5 ص 63:** ٧٤ طالباً في قوارب يتسع كل منها لـ ٨ طلاب: ٧٤ ÷ ٨ = ٩ والباقي ٢ ، فيركبون ١٠ قوارب.',
      '**نشاط 7 ص 63 (أفكر):** عددان من منزلتين باقي قسمتهما على ٤ يساوي ١ ، مثل ١٣ و ٢١ (' + G.SOL + ').',
      '**مراجعة ص 64:** ٨٧ × ٩ = ٧٨٣ ، ٩٠٧ × ٨ = ٧٢٥٦ ، ٨٤ ÷ ٤ = ٢١ ، ٦٤ ÷ ٧ = ٩ والباقي ١ ؛ و ٢٧ ÷ ٤ = ٦ والباقي ٣ لأن (٦ × ٤) + ٣ = ٢٧.',
      '**مراجعة 4 ص 64:** ٨ كتب بـ ٥٦ ديناراً: الكتاب بـ ٧ دنانير، و ٣ كتب بـ ٢١ ديناراً.',
      '**مراجعة 5 ص 65:** ٢٣ طالباً دفع كل منهم ٦ + ٤ + ٧ + ٣ = ٢٠ ديناراً، فالمجموع ٢٣ × ٢٠ = ٤٦٠ ديناراً.',
      '**مراجعة 6 ص 65 (مقارنة ذهنية):** ١٢٤ × ٨ > ١٢٤ × ٧ ، و ٧٨٢ ÷ ٨ < ٧٨٢ × ٨ ، و ٩٣ ÷ ٤ > ٩٣ ÷ ٦ (كلما كبر المقسوم عليه صغر الناتج).'
    ],
    challenges: [
      { q: 'جد ناتج ٩٦ ÷ ٥ والباقي (نشاط 4 أ).', hint: 'اختر المسألة أو ضع العددين ٩٦ و ٥.', init: { ex: 'custom', op: 'div', a: 90, b: 5 }, check: (p) => p.op === 'div' && p.a === 96 && p.b === 5, why: () => '٩٦ ÷ ٥ = ١٩ والباقي ١ ، لأن (١٩ × ٥) + ١ = ٩٦.' },
      { q: 'كم قارباً يلزم لـ ٧٤ طالباً إذا اتسع القارب لـ ٨ طلاب؟', hint: 'اقسم ٧٤ على ٨ ثم فكّر في الباقي.', init: { ex: 'custom', op: 'div', a: 70, b: 7 }, check: (p) => p.op === 'div' && p.a === 74 && p.b === 8, why: () => '٩ والباقي ٢ ، فنحتاج ١٠ قوارب.' },
      { q: 'جد عدداً من منزلتين باقي قسمته على ٤ يساوي ١ (نشاط 7 ص 63).', hint: 'القسمة على ٤ ، والباقي في النتائج.', init: { ex: 'custom', op: 'div', a: 20, b: 4 }, check: (p, d) => p.op === 'div' && p.b === 4 && p.a < 100 && d.rem === 1 },
      { q: 'جد ناتج ٩٠٧ × ٨ بالضرب العمودي.', hint: 'اختر الضرب العمودي.', init: { ex: 'custom', op: 'div', a: 900, b: 8 }, check: (p) => p.op === 'mul' && p.a === 907 && p.b === 8, why: () => '٩٠٧ × ٨ = ٧٢٥٦.' }
    ],
    tutor: [
      { q: 'لماذا يكون الباقي أصغر من المقسوم عليه؟', k: ['الباقي', 'اصغر'], a: () => 'لو كان الباقي مساوياً للمقسوم عليه أو أكبر لأمكن تكوين مجموعة أخرى، فيزيد الناتج واحداً.' },
      { q: 'كيف أتحقق من صحة القسمة؟', k: ['اتحقق', 'تحقق'], a: (p, d) => (d.mul ? 'في الضرب نتحقق بالقسمة: ' + G.L(d.m.prod) + ' ÷ ' + G.L(p.b) + ' = ' + G.L(p.a) + '.' : 'نضرب الناتج في المقسوم عليه ونضيف الباقي: (' + G.L(d.q) + ' × ' + G.L(p.b) + ') + ' + G.L(d.rem) + ' = ' + G.L(p.a) + '.') },
      { q: 'ما خطوات القسمة الطويلة؟', k: ['خطوات', 'طويله'], a: () => 'نقسم، ثم نضرب، ثم نطرح، ثم ننزل المنزلة التالية، ونكرر حتى تنتهي المنازل.' },
      { q: 'كم قارباً يركب الطلاب في نشاط 5؟', k: ['قارب', 'قوارب', 'عكا'], a: () => '٧٤ ÷ ٨ = ٩ والباقي ٢ ، فالطالبان الباقيان يحتاجان قارباً عاشراً: ١٠ قوارب.' }
    ]
  });

  /* ======================= الدرسان 1–2: ضرب عدد من منزلة بعدد من منزلتين أو ثلاث (ص 44–54) ======================= */
  const MU = [
    ['d620', 'نشاط 2 ص 45: ٦ × ٢٠', 20, 6], ['d440', 'نشاط 2: ٤ × ٤٠', 40, 4], ['d550', 'نشاط 2: ٥ × ٥٠', 50, 5], ['d770', 'نشاط 2: ٧ × ٧٠', 70, 7],
    ['caps', 'نشاط 3 ص 45: ٣ لوحات × ٢١ غطاءً', 21, 3], ['d811', 'نشاط 4 ص 46: ٨ × ١١', 11, 8], ['d169', 'نشاط 4: ١٦ × ٩', 16, 9],
    ['m323', 'نشاط 5 ص 47: ٣٢ × ٣', 32, 3], ['m214', 'نشاط 5: ٢١ × ٤', 21, 4], ['m432', 'نشاط 5: ٤٣ × ٢', 43, 2], ['flow', 'نشاط 6 ص 47: الأزهار ١٢ × ٥', 12, 5], ['m124b', 'نشاط 7: ١٢ × ٤', 12, 4],
    ['worm', 'نشاط 8 ص 48: ٣ ديدان × ١٤ غطاءً', 14, 3], ['m254', 'نشاط 10 ص 49: ٢٥ × ٤', 25, 4], ['m377', 'نشاط 10: ٣٧ × ٧', 37, 7], ['m858', 'نشاط 10: ٨٥ × ٨', 85, 8], ['m999', 'نشاط 10: ٩٩ × ٩', 99, 9],
    ['m419', 'نشاط 11 ص 50: ٩ × ٤١', 41, 9], ['m382', 'نشاط 11: ٣٨ × ٢', 38, 2], ['silk', 'نشاط 13 ص 50: ١٦ لفة حمراء × ٤ أثواب', 16, 4],
    ['stick', 'نشاط 1 ص 51: ٤ × ١٢١ عوداً', 121, 4], ['m2124', 'نشاط 2 ص 52: ٢١٢ × ٤', 212, 4], ['m6015', 'نشاط 2: ٦٠١ × ٥', 601, 5], ['m3213', 'نشاط 2: ٣ × ٣٢١', 321, 3], ['m1109', 'نشاط 2: ٩ × ١١٠', 110, 9],
    ['don', 'نشاط 3 ص 52: تبرع محمد ١٢٥ × ٣', 125, 3], ['m1267', 'نشاط 4 ص 53: ١٢٦ × ٧', 126, 7], ['m1098', 'نشاط 4: ١٠٩ × ٨', 109, 8], ['m4445', 'نشاط 4: ٥ × ٤٤٤', 444, 5], ['m6908', 'نشاط 4: ٨ × ٦٩٠', 690, 8],
    ['shoe2', 'نشاط 5 ص 53: ٤٨٠ حذاءً × ٧ أيام', 480, 7], ['sheep2', 'نشاط 6 ص 53: ٣١٧ ديناراً × ٤', 317, 4],
    ['e1', 'نشاط 12 ص 50 (أ): تقدير ٨ × ٣١', 31, 8, 'est'], ['e2', 'نشاط 12 (ب): تقدير ٦ × ٤٨', 48, 6, 'est'], ['e3', 'نشاط 12 (جـ): تقدير ٩ × ٩٧', 97, 9, 'est'],
    ['e4', 'نشاط 8 ص 54: تقدير ٩ × ٩٩٩', 999, 9, 'est'], ['e5', 'نشاط 8: تقدير ٨ × ٥٠٣', 503, 8, 'est'], ['e6', 'نشاط 8: تقدير ٣ × ٨٩٤', 894, 3, 'est']
  ];
  const partsOf = (a) => { const h = Math.floor(a / 100), t = Math.floor(a / 10) % 10, o = a % 10; return [[h * 100, 'مئات', h], [t * 10, 'عشرات', t], [o, 'آحاد', o]].filter((x) => x[0] > 0); };
  const roundTop = (a) => { const P = Math.pow(10, String(a).length - 1); return Math.round(a / P) * P; };
  // مجسمات دينز: لوح مئة، عمود عشرة، مكعب واحد
  function blocks(ctx, x, y, a, u, c, col) {
    const h = Math.floor(a / 100), t = Math.floor(a / 10) % 10, o = a % 10; let xx = x;
    for (let i = 0; i < h; i++) { ctx.fillStyle = col; ctx.globalAlpha = 0.8; ctx.fillRect(xx - 10 * u, y - 10 * u, 10 * u, 10 * u); ctx.globalAlpha = 1; ctx.strokeStyle = c.text; ctx.lineWidth = 0.8; ctx.strokeRect(xx - 10 * u, y - 10 * u, 10 * u, 10 * u); xx -= 10 * u + 3; }
    for (let i = 0; i < t; i++) { ctx.fillStyle = col; ctx.globalAlpha = 0.8; ctx.fillRect(xx - u, y - 10 * u, u, 10 * u); ctx.globalAlpha = 1; ctx.strokeStyle = c.text; ctx.lineWidth = 0.8; ctx.strokeRect(xx - u, y - 10 * u, u, 10 * u); xx -= u + 2; }
    for (let i = 0; i < o; i++) { const yy = y - (i % 5 + 1) * (u + 1); const xo = xx - (Math.floor(i / 5) + 1) * (u + 2); ctx.fillStyle = col; ctx.fillRect(xo, yy, u, u); ctx.strokeStyle = c.text; ctx.lineWidth = 0.8; ctx.strokeRect(xo, yy, u, u); }
    return x - (xx - (o ? Math.ceil(o / 5) * (u + 2) : 0));
  }
  G.reg({
    id: 'multiply-blocks', unit: U, order: 1, lesson: '3-1 – 3-2', lessonTitle: 'ضرب عدد من منزلة بعدد من منزلتين أو ثلاث منازل', page: 44,
    titleAr: 'الضرب بالمجسمات وخاصية التوزيع والتقدير', titleEn: 'Multiplying with Base-Ten Blocks & the Distributive Property', tags: 'ضرب منزله منزلتين ثلاث منازل مجسمات توزيع تبديل حمل عمودي افقي تقدير اغطيه عيدان تبرع',
    formula: 'a \\times (b + c) = (a \\times b) + (a \\times c)',
    book: 'خاصية توزيع الضرب على الجمع: ٣ × ٢١ = ٣ × (١ + ٢٠) = (٣ × ١) + (٣ × ٢٠) ؛ ونضرب الآحاد ثم العشرات ثم المئات ونضيف المحمول ؛ وخاصية التبديل: ١٢ × ٥ = ٥ × ١٢',
    summary: 'نجزّئ العدد إلى **مئات وعشرات وآحاد**، ونضرب كل جزء في العدد الآخر ثم نجمع النواتج — وهذه **خاصية توزيع الضرب على الجمع**. في الضرب العمودي نبدأ بالآحاد، وإذا زاد الناتج على ٩ نبدّل كل ١٠ آحاد بعشرة **ونحملها**. ونقدّر الناتج بتقريب العدد **لأعلى منزلة** فيه.',
    vars: [['a', 'العدد من منزلة واحدة', 'من ٢ إلى ٩'], ['b', 'العدد من منزلتين أو ثلاث', 'من ١٠ إلى ٩٩٩']],
    ar: { a: 'أ', b: 'ب', c: 'جـ' },
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'worm', options: G.opts(MU.map((e) => [e[0], e[1]]).concat([['custom', 'عددان من اختياري']])) },
      { key: 'mode', label: '\\text{المطلوب}', type: 'select', value: 'dist', options: [['dist', 'أجد الناتج بالتوزيع والمجسمات'], ['est', 'أقدّر الناتج']] },
      { key: 'n', label: '\\text{العدد}', min: 10, max: 999, step: 1, value: 14, int: true },
      { key: 'k', label: '\\text{في}', min: 2, max: 9, step: 1, value: 3, int: true }
    ],
    onSet(p, key) { if (key === 'ex' && p.ex !== 'custom') { const e = MU.find((x) => x[0] === p.ex); p.n = e[2]; p.k = e[3]; p.mode = e[4] || 'dist'; } else if (key !== 'ex') p.ex = 'custom'; },
    custom: true, canvasHint: 'المجموعات في الأعلى، ثم نموذج المساحة: كل جزء (مئات، عشرات، آحاد) يُضرب وحده ثم نجمع النواتج.',
    compute(p) {
      const parts = partsOf(p.n).map((x) => ({ v: x[0], name: x[1], d: x[2], prod: x[0] * p.k }));
      const o = p.n % 10, t = Math.floor(p.n / 10) % 10; const c1 = Math.floor(o * p.k / 10), c2 = Math.floor((t * p.k + c1) / 10);
      return { parts: parts, prod: p.n * p.k, est: p.mode === 'est', R: roundTop(p.n), estv: roundTop(p.n) * p.k, c1: c1, c2: c2 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const pieces = (Math.floor(p.n / 100) * 3 + Math.floor(p.n / 10) % 10 + Math.ceil((p.n % 10) / 5)) * p.k;
      // المجموعات
      const yb = H * 0.3; const showAll = pieces <= (nar ? 24 : 48) && p.n < 300; const u = Math.max(3, Math.min(nar ? 4 : 6, H / 70));
      if (showAll) {
        let x = W - 14; let row = 0; const gy = (r) => yb - r * (12 * u + 10);
        for (let g = 0; g < p.k; g++) { const w = blocks(ctx, x, gy(row), p.n, u, c, c.c1); x -= w + 18; if (x < 40 && g < p.k - 1) { x = W - 14; row++; } }
        G.txt(ctx, G.L(p.k) + ' مجموعات في كل منها ' + G.L(p.n), W / 2, H * 0.36, { color: c.muted, size: 12, w: '700' });
      } else { const w = blocks(ctx, W / 2 + 60, yb, p.n, u, c, c.c1); G.txt(ctx, '× ' + G.L(p.k), W / 2 + 60 - w - 30, yb - 5 * u, { color: c.c1, size: 22, w: '800' }); }
      // نموذج المساحة
      const x0 = nar ? 12 : 60, x1 = W - (nar ? 12 : 60), yA = H * 0.44, hA = Math.min(70, H * 0.2);
      const n = d.parts.length; const minW = (x1 - x0) * 0.16; const tot = d.parts.reduce((t, q) => t + Math.sqrt(q.v), 0);
      let x = x1; const cols = [c.c5, c.c4, c.c3];
      d.parts.forEach((q, i) => {
        const w = Math.max(minW, (x1 - x0 - n * 4) * Math.sqrt(q.v) / tot); const col = cols[['مئات', 'عشرات', 'آحاد'].indexOf(q.name)];
        ctx.fillStyle = col; ctx.globalAlpha = 0.18; ctx.fillRect(x - w, yA, w, hA); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x - w, yA, w, hA);
        G.txt(ctx, G.L(q.v), x - w / 2, yA - 12, { color: col, size: nar ? 12 : 14, w: '800' });
        G.txt(ctx, G.L(p.k) + ' × ' + G.L(q.v) + ' = ' + G.L(q.prod), x - w / 2, yA + hA / 2, { color: c.text, size: nar ? 11 : 14, w: '800' });
        x -= w + 4;
      });
      G.txt(ctx, G.L(p.k), x0 - (nar ? 0 : 20), yA + hA / 2, { color: c.c1, size: 16, w: '800' });
      const y3 = yA + hA + 36;
      G.txt(ctx, d.parts.map((q) => G.L(q.prod)).join(' + ') + ' = ' + G.L(d.prod), W / 2, y3, { color: c.c3, size: nar ? 15 : 20, w: '800' });
      if (d.est) G.txt(ctx, 'التقدير: ' + G.L(p.k) + ' × ' + G.L(p.n) + ' ≈ ' + G.L(p.k) + ' × ' + G.L(d.R) + ' = ' + G.L(d.estv), W / 2, Math.min(H - 14, y3 + 34), { color: c.c4, size: nar ? 13 : 16, w: '800' });
    },
    live(p, d) {
      const P = d.parts.map((q) => q.v);
      return p.k + ' \\times ' + p.n + (P.length > 1 ? ' = ' + p.k + ' \\times (' + P.join(' + ') + ') = ' + d.parts.map((q) => q.prod).join(' + ') : '') + ' = ' + d.prod;
    },
    results(p, d) {
      const r = [['الناتج', G.L(d.prod), false, 'pos'], ['بالتوزيع', d.parts.map((q) => '(' + G.L(p.k) + ' × ' + G.L(q.v) + ')').join(' + '), false], ['التبديل', G.L(p.n) + ' × ' + G.L(p.k) + ' = ' + G.L(p.k) + ' × ' + G.L(p.n), false]];
      if (d.est) r.splice(1, 0, ['التقدير', G.L(p.k) + ' × ' + G.L(d.R) + ' = ' + G.L(d.estv), false, 'pos']);
      if (p.ex === 'silk') r.push(['لفات الحرير الحمراء', G.L(d.prod) + ' لفة', false, 'pos']);
      return r;
    },
    steps(p, d) {
      const o = p.n % 10, t = Math.floor(p.n / 10) % 10, h = Math.floor(p.n / 100);
      const s = ['نجزّئ العدد: ' + d.parts.map((q) => G.L(q.v)).join(' + ') + '.',
        'نضرب الآحاد: ' + G.L(p.k) + ' × ' + G.L(o) + ' = ' + G.L(o * p.k) + (d.c1 ? '، نبدّل ' + G.L(d.c1 * 10) + ' آحاد بـ ' + G.L(d.c1) + ' عشرات ونحملها.' : '.'),
        'نضرب العشرات: ' + G.L(p.k) + ' × ' + G.L(t) + ' عشرات = ' + G.L(t * p.k) + ' عشرات' + (d.c1 ? ' ونضيف المحمول ' + G.L(d.c1) : '') + '.'];
      if (h) s.push('نضرب المئات: ' + G.L(p.k) + ' × ' + G.L(h) + ' مئات = ' + G.L(h * p.k) + ' مئات' + (d.c2 ? ' ونضيف المحمول ' + G.L(d.c2) : '') + '.');
      s.push('الناتج ' + G.L(d.prod) + '.');
      if (d.est) s.push('للتقدير نقرّب ' + G.L(p.n) + ' لأعلى منزلة: ' + G.L(d.R) + '، فالناتج تقريباً ' + G.L(d.estv) + '.');
      return s;
    },
    explain(a, b, da, db) { return da && da.parts.length !== db.parts.length ? ['أصبح العدد من ' + G.L(String(b.n).length) + ' منازل؛ عدد أجزاء التوزيع ' + G.L(db.parts.length) + '.'] : []; },
    learn: [
      '**نشاط 1 ص 44:** بطاقات المدن: ٧ × ٤ = ٢٨ بئر السبع، ٤ × ٥ = ٢٠ غزة، ٨ × ٦ = ٤٨ القدس، ٣ × ٨ = ٢٤ الناصرة، ٩ × ٧ = ٦٣ أريحا، ٣٦ ÷ ٦ = ٦ نابلس، ٧٢ ÷ ٩ = ٨ الخليل.',
      '**نشاط 2 ص 45:** ٦ × ٢٠ = ٦ × ٢ عشرات = ١٢ عشرة = ١٢٠.',
      '**نشاط 3 ص 45–46:** ثلاث لوحات في كل منها ٢١ غطاءً: ٣ × ٢١ = ٣ × (١ + ٢٠) = ٣ + ٦٠ = ٦٣ (خاصية التوزيع)، وبالضرب العمودي والطريقة المختصرة.',
      '**نشاط 6 ص 47:** ٦٠ زهرة: ٥ × ١٢ = ١٢ × ٥ (الخاصية التبديلية على الضرب).',
      '**نشاط 8 ص 48:** ٣ ديدان من ١٤ غطاءً: ٣ × ٤ = ١٢ (نبدّل ١٠ آحاد بعشرة)، ثم ٣ عشرات + ١ = ٤ عشرات، فالناتج ٤٢.',
      '**نشاط 14 ص 50:** العدد الزوجي بين ٤ × ٦٢ = ٢٤٨ و ٩ × ٢٨ = ٢٥٢ هو ٢٥٠.',
      '**نشاط 1 ص 51:** ٤ × ١٢١ = ٤ + ٨٠ + ٤٠٠ = ٤٨٤ عوداً ؛ ونشاط 3 ص 52: ٣ × ١٢٥ = ٣٧٥ ديناراً.',
      '**نشاط 6 ص 53:** ٤ خراف × ٣١٧ = ١٢٦٨ ديناراً، وأرجل ١٢ خروفاً و ٨ طيور = ٤٨ + ١٦ = ٦٤.',
      '**نشاط 7 ص 54 (النمط):** ٦ ، ١٢ ، ١٨ ، ٢٤ ، ٣٠ ؛ و ١١١ ، ٢٢٢ ، ٤٤٤ ، ٨٨٨ ، ١٧٧٦ (كل عدد مثلا السابق).'
    ],
    challenges: [
      { q: 'جد عدد الأغطية في ٣ لوحات في كل منها ٢١ غطاءً (نشاط 3).', hint: 'العدد ٢١ في ٣.', init: { ex: 'custom', mode: 'dist', n: 20, k: 3 }, check: (p) => p.n === 21 && p.k === 3, why: () => '٣ × ٢١ = ٦٣.' },
      { q: 'جد ٤ × ١٢١ (نشاط 1 ص 51) وانظر إلى أجزاء التوزيع الثلاثة.', hint: 'العدد ١٢١ في ٤.', init: { ex: 'custom', mode: 'dist', n: 120, k: 4 }, check: (p, d) => p.n === 121 && p.k === 4 && d.parts.length === 3, why: () => '٤٠٠ + ٨٠ + ٤ = ٤٨٤.' },
      { q: 'قدّر ٦ × ٤٨ (نشاط 12 ب).', hint: 'اختر التقدير.', init: { ex: 'custom', mode: 'dist', n: 48, k: 5 }, check: (p) => p.mode === 'est' && p.n === 48 && p.k === 6, why: () => '٦ × ٥٠ = ٣٠٠.' },
      { q: 'اختر مسألة فيها حمل من الآحاد إلى العشرات.', hint: 'ناتج ضرب الآحاد أكبر من ٩.', init: { ex: 'custom', mode: 'dist', n: 21, k: 3 }, check: (p, d) => d.c1 > 0 }
    ],
    tutor: [
      { q: 'ما خاصية التوزيع؟', k: ['توزيع'], a: () => 'نوزّع الضرب على أجزاء العدد: ٣ × ٢١ = (٣ × ١) + (٣ × ٢٠) = ٣ + ٦٠ = ٦٣.' },
      { q: 'متى أحمل في الضرب؟', k: ['احمل', 'حمل'], a: () => 'عندما يكون ناتج ضرب المنزلة ١٠ أو أكثر؛ أكتب الآحاد وأضيف العشرات إلى ناتج المنزلة التالية.' },
      { q: 'ما الناتج الآن؟', k: ['الناتج', 'الان'], a: (p, d) => G.L(p.k) + ' × ' + G.L(p.n) + ' = ' + G.L(d.prod) + '.' }
    ]
  });

  /* ======================= الدرسان 3–4: القسمة بالتوزيع المتساوي (ص 55–61) ======================= */
  const DS = [
    ['o54', 'نشاط 1 ص 55: ٥٤ حبة برتقال، ٩ في كل صحن', 54, 9], ['bk46', 'نشاط 4 ص 56: ٤٦ كتاباً على رفّين', 46, 2], ['f24', 'نشاط 2 ص 55: ٢٤ ÷ ٣', 24, 3], ['f42', 'نشاط 2: ٤٢ ÷ ٦', 42, 6], ['f63', 'نشاط 2: ٦٣ ÷ ٧', 63, 7], ['f48', 'نشاط 2: ٤٨ ÷ ٦', 48, 6],
    ['fam32', 'نشاط 3 ص 56: الأعداد ٤ ، ٨ ، ٣٢', 32, 8], ['l39', 'نشاط 5 ص 58: ٣٩ ÷ ٣', 39, 3], ['l62', 'نشاط 5: ٦٢ ÷ ٢', 62, 2], ['l90', 'نشاط 5: ٩٠ ÷ ٦', 90, 6], ['l68', 'نشاط 5: ٦٨ ÷ ٤', 68, 4],
    ['pen', 'نشاط 6 ص 58: ٩٦ قلماً على ٦ طلاب', 96, 6], ['ball', 'نشاط 8 ص 59: ٨٤ ديناراً، الكرة بـ ٦', 84, 6], ['tree', 'نشاط 9 ص 59: ٩٨ شجرة في ٧ صفوف', 98, 7],
    ['t5', 'نشاط 1 ص 60: ٣١ طالباً في ٥ فرق', 31, 5], ['t6', 'نشاط 1: ٣١ طالباً في ٦ فرق', 31, 6], ['r75', 'نشاط 3 ص 61: ٧٥ ÷ ٤', 75, 4]
  ];
  const SH_ST = ['نمثّل المقسوم بالمجسمات: أعمدة عشرات ومكعبات آحاد', 'نوزّع أعمدة العشرات بالتساوي على المجموعات', 'نفكّ ما تبقى من العشرات إلى آحاد (العشرة = ١٠ آحاد)', 'نوزّع الآحاد بالتساوي على المجموعات', 'ما لا يمكن توزيعه هو الباقي، ثم نتحقق'];
  G.reg({
    id: 'division-sharing', unit: U, order: 2, lesson: '3-3 – 3-4', lessonTitle: 'قسمة عدد من منزلتين على عدد من منزلة', page: 55,
    titleAr: 'القسمة بالتوزيع المتساوي والحقائق المترابطة', titleEn: 'Division as Equal Sharing & Fact Families', tags: 'قسمه توزيع متساوي مجسمات عشرات احاد باقي حقائق الضرب جمله ضرب جمله قسمه برتقال كتب رفين فرق طلاب',
    formula: '(\\text{الناتج} \\times \\text{المقسوم عليه}) + \\text{الباقي} = \\text{المقسوم}',
    book: 'نوزّع أعمدة العشرات على المقسوم عليه بالتساوي، ثم نوزّع الواحدات ؛ ٤٦ ÷ ٢ = ٢٣ ، ويسمّى ٤٦ المقسوم و ٢ المقسوم عليه و ٢٣ ناتج القسمة ؛ ومن حقائق الضرب: ٦ × ٩ = ٥٤ ومنها ٥٤ ÷ ٩ = ٦',
    summary: 'القسمة **توزيع بالتساوي**: نمثّل المقسوم بأعمدة العشرات ومكعبات الآحاد، ونوزّع العشرات أولاً ثم الآحاد على مجموعات بعدد **المقسوم عليه**؛ وإذا بقي عمود لا يكفي نفكّه إلى ١٠ آحاد. ما يبقى ولا يمكن توزيعه هو **الباقي**، وهو أصغر من المقسوم عليه. ولكل قسمة **جملة ضرب** مرتبطة بها.',
    vars: [['\\text{المقسوم}', 'العدد الذي نوزّعه', 'من ١٠ إلى ٩٩'], ['\\text{المقسوم عليه}', 'عدد المجموعات', 'من ٢ إلى ٩']],
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'bk46', options: G.opts(DS.map((e) => [e[0], e[1]]).concat([['custom', 'عددان من اختياري']])) },
      { key: 'a', label: '\\text{المقسوم}', min: 10, max: 99, step: 1, value: 46, int: true },
      { key: 'b', label: '\\text{المقسوم عليه}', min: 2, max: 9, step: 1, value: 2, int: true },
      { key: 's', label: '\\text{الخطوة}', type: 'stage', stages: SH_ST, value: 4 }
    ],
    onSet(p, k) { if (k === 'ex' && p.ex !== 'custom') { const e = DS.find((x) => x[0] === p.ex); p.a = e[2]; p.b = e[3]; p.s = 4; } else if (k === 'a' || k === 'b') { p.ex = 'custom'; p.s = 4; } },
    custom: true, canvasHint: 'الأعلى: ما لم يوزَّع بعد. الدوائر: المجموعات. حرّك «الخطوة» لترى التوزيع: العشرات أولاً، ثم فكّ الباقي منها، ثم الآحاد.',
    compute(p) {
      const t = Math.floor(p.a / 10), o = p.a % 10; const qt = Math.floor(t / p.b), rt = t % p.b; const ones = rt * 10 + o; const qo = Math.floor(ones / p.b), r = ones % p.b;
      return { t: t, o: o, qt: qt, rt: rt, ones: ones, qo: qo, r: r, q: qt * 10 + qo };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const s = p.s; const u = Math.max(4, Math.min(nar ? 5 : 7, H / 60));
      const rod = (x, y) => { ctx.fillStyle = c.c1; ctx.globalAlpha = 0.85; ctx.fillRect(x, y - 10 * u, u, 10 * u); ctx.globalAlpha = 1; ctx.strokeStyle = c.text; ctx.lineWidth = 0.8; for (let i = 0; i < 10; i++) ctx.strokeRect(x, y - (i + 1) * u, u, u); };
      const cube = (x, y, col) => { ctx.fillStyle = col || c.c4; ctx.fillRect(x, y, u, u); ctx.strokeStyle = c.text; ctx.lineWidth = 0.8; ctx.strokeRect(x, y, u, u); };
      // المخزون غير الموزّع
      const poolRods = s === 0 ? d.t : s === 1 ? d.rt : 0; const poolOnes = s <= 1 ? d.o : s === 2 ? d.ones : d.r;
      const py = 14 + 10 * u; let x = W - 20;
      G.box(ctx, 10, 6, W - 20, 10 * u + 20, c.grid);
      for (let i = 0; i < poolRods; i++) { rod(x - u, py); x -= u + 4; }
      for (let i = 0; i < poolOnes; i++) cube(x - 8 - (Math.floor(i / 10) + 1) * (u + 2), py - (i % 10 + 1) * (u + 1), s >= 3 ? c.c2 : c.c4);
      G.txt(ctx, s >= 3 ? (d.r ? 'الباقي ' + G.L(d.r) : 'لا باقي') : 'المقسوم ' + G.L(p.a), 70, 22, { color: s >= 3 && d.r ? c.c2 : c.muted, size: 12, w: '800' });
      // المجموعات
      const n = p.b; const per = nar ? 3 : Math.min(5, n); const rows = Math.ceil(n / per); const gw = (W - 20) / per; const gh = Math.min((H - (10 * u + 40)) / rows - 8, 10 * u + 50);
      for (let g = 0; g < n; g++) {
        const cx = W - 10 - (g % per + 0.5) * gw, cy = 10 * u + 40 + Math.floor(g / per) * (gh + 8) + gh / 2;
        ctx.strokeStyle = c.c5; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, gw / 2 - 6, gh / 2, 0, 0, 7); ctx.stroke();
        let xx = cx + gw * 0.25; const by = cy + 5 * u;
        if (s >= 1) for (let i = 0; i < d.qt; i++) { rod(xx - u, by); xx -= u + 3; }
        if (s >= 3) for (let i = 0; i < d.qo; i++) cube(xx - 6 - (Math.floor(i / 10) + 1) * (u + 2), by - (i % 10 + 1) * (u + 1));
        if (s >= 3) G.txt(ctx, G.L(d.q), cx, cy + gh / 2 - 10, { color: c.c3, size: 13, w: '800' });
      }
      if (s >= 4) G.txt(ctx, '(' + G.L(d.q) + ' × ' + G.L(p.b) + ') + ' + G.L(d.r) + ' = ' + G.L(p.a) + ' ✔', W / 2, H - 12, { color: c.c3, size: nar ? 13 : 16, w: '800', halo: c.bg });
    },
    live(p, d) { return p.a + ' \\div ' + p.b + ' = ' + d.q + (d.r ? '\\ \\text{والباقي}\\ ' + d.r : '') + ',\\quad ' + d.q + ' \\times ' + p.b + ' = ' + (p.a - d.r); },
    results(p, d) {
      const r = [['ناتج القسمة', G.L(d.q), false, 'pos'], ['الباقي', G.L(d.r), false, d.r ? 'neg' : ''], ['جملة الضرب', G.L(d.q) + ' × ' + G.L(p.b) + ' = ' + G.L(p.a - d.r), false],
        ['التحقق', '(' + G.L(d.q) + ' × ' + G.L(p.b) + ') + ' + G.L(d.r) + ' = ' + G.L(p.a), false]];
      if (!d.r) r.push(['الحقائق المترابطة', G.L(p.b) + ' × ' + G.L(d.q) + ' = ' + G.L(p.a) + ' ، ' + G.L(p.a) + ' ÷ ' + G.L(d.q) + ' = ' + G.L(p.b), false]);
      return r;
    },
    steps(p, d) {
      return ['المقسوم ' + G.L(p.a) + ' = ' + G.L(d.t) + ' عشرات و ' + G.L(d.o) + ' آحاد، والمقسوم عليه ' + G.L(p.b) + '.',
        'نوزّع العشرات: ' + G.L(d.t) + ' ÷ ' + G.L(p.b) + ' = ' + G.L(d.qt) + ' في كل مجموعة' + (d.rt ? ' ويبقى ' + G.L(d.rt) + '.' : '.'),
        d.rt ? 'نفكّ ' + G.L(d.rt) + ' عشرات إلى ' + G.L(d.rt * 10) + ' آحاد، فيصبح عندنا ' + G.L(d.ones) + ' آحاد.' : 'لم يبق من العشرات شيء؛ عندنا ' + G.L(d.ones) + ' آحاد.',
        'نوزّع الآحاد: ' + G.L(d.ones) + ' ÷ ' + G.L(p.b) + ' = ' + G.L(d.qo) + ' في كل مجموعة' + (d.r ? ' ويبقى ' + G.L(d.r) + '.' : '.'),
        'ناتج القسمة ' + G.L(d.q) + ' والباقي ' + G.L(d.r) + ' (أصغر من ' + G.L(p.b) + ')؛ التحقق: (' + G.L(d.q) + ' × ' + G.L(p.b) + ') + ' + G.L(d.r) + ' = ' + G.L(p.a) + '.'];
    },
    explain(a, b, da, db) { return da && !!da.r !== !!db.r ? [db.r ? 'ظهر باقٍ: لا يمكن توزيع كل الآحاد بالتساوي.' : 'لا باقي: التوزيع متساوٍ تماماً.'] : []; },
    learn: [
      '**نشاط 1 ص 55:** أم سعيد وضعت ٥٤ حبة برتقال، ٩ في كل صحن: ٦ × ٩ = ٥٤ ومنها ٥٤ ÷ ٩ = ٦ صحون.',
      '**نشاط 3 ص 56:** من الأعداد ٤ ، ٨ ، ٣٢: ٤ × ٨ = ٣٢ و ٣٢ ÷ ٨ = ٤ ؛ ومن ٦٣ ، ٧ ، ٩: ٧ × ٩ = ٦٣ و ٦٣ ÷ ٧ = ٩.',
      '**نشاط 4 ص 56:** ٤٦ كتاباً على رفّين: نوزّع أعمدة العشرات ثم الواحدات، فيكون في كل رف ٢٣ كتاباً (٢٣ + ٢٣ = ٤٦).',
      '**نشاط 1 ص 60:** ٣١ طالباً في ٥ فرق: ٦ في كل فرقة ويبقى طالب واحد؛ وفي ٦ فرق: ٥ ويبقى ١.',
      '**أفكر ص 61:** الباقي يكون دائماً أصغر من المقسوم عليه؛ ونناقش حلّي ماسة وهنادي لنكتشف الخطأ.'
    ],
    challenges: [
      { q: 'وزّع ٤٦ كتاباً على رفّين (نشاط 4).', hint: 'المقسوم ٤٦ والمقسوم عليه ٢.', init: { ex: 'custom', a: 40, b: 2, s: 4 }, check: (p) => p.a === 46 && p.b === 2, why: () => '٢٣ كتاباً في كل رف.' },
      { q: 'اختر قسمة تحتاج إلى فكّ عشرة إلى آحاد.', hint: 'عدد العشرات لا يقبل القسمة على المقسوم عليه.', init: { ex: 'custom', a: 46, b: 2, s: 4 }, check: (p, d) => d.rt > 0 },
      { q: 'وزّع ٣١ طالباً على ٥ فرق وجد الباقي (نشاط 1 ص 60).', hint: 'المقسوم ٣١.', init: { ex: 'custom', a: 30, b: 5, s: 4 }, check: (p) => p.a === 31 && p.b === 5, why: () => '٦ في كل فرقة والباقي ١.' }
    ],
    tutor: [
      { q: 'لماذا نبدأ بالعشرات؟', k: ['نبدا', 'العشرات'], a: () => 'لأننا نبدأ عملية القسمة من المنزلة الكبرى دائماً، وما يتبقى منها نفكّه إلى آحاد.' },
      { q: 'ما الباقي؟', k: ['الباقي'], a: (p, d) => 'ما لا يمكن توزيعه بالتساوي: ' + G.L(d.r) + '، وهو أصغر من ' + G.L(p.b) + '.' },
      { q: 'ما جملة الضرب المرتبطة؟', k: ['جمله', 'ضرب'], a: (p, d) => G.L(d.q) + ' × ' + G.L(p.b) + ' = ' + G.L(p.a - d.r) + (d.r ? ' ، ثم نضيف الباقي ' + G.L(d.r) + '.' : '.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
