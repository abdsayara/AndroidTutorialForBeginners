/* رياضيات الرابع — نهاية الوحدة الثالثة: القسمة الطويلة والمراجعة (ص 62–65) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 3;

  // مسائل الكتاب: [المفتاح، الاسم، العملية، العدد الأول، العدد الثاني]
  const EX = [
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
    id: 'long-division', unit: U, order: 1, lesson: '3-4', lessonTitle: 'القسمة الطويلة', page: 62,
    titleAr: 'القسمة الطويلة والتحقق منها', titleEn: 'Long Division and Checking', tags: 'قسمه طويله مقسوم مقسوم عليه ناتج باقي تحقق ضرب عمودي حمل قوارب عكا كتب',
    formula: '\\text{المقسوم} = \\text{الناتج} \\times \\text{المقسوم عليه} + \\text{الباقي}',
    book: 'التحقق: (الناتج × المقسوم عليه) + الباقي = المقسوم ، والباقي أصغر من المقسوم عليه',
    summary: 'في القسمة الطويلة نبدأ من المنزلة الكبرى (اليسار): نقسم، ثم نضرب، ثم نطرح، ثم ننزل المنزلة التالية، ونكرر حتى تنتهي المنازل. الباقي دائماً أصغر من المقسوم عليه، ونتحقق من الحل بأن (الناتج × المقسوم عليه) + الباقي = المقسوم.',
    vars: [['\\text{المقسوم}', 'العدد الذي نقسمه', 'من ١٠ إلى ٩٩٩'], ['\\text{المقسوم عليه}', 'العدد الذي نقسم عليه', 'من ٢ إلى ٩'], ['\\text{الباقي}', 'ما يتبقى بعد القسمة', 'أصغر من المقسوم عليه']],
    params: [
      { key: 'ex', label: '\\text{المسألة}', type: 'select', value: 'a', options: G.opts(EX.map((e) => [e[0], e[1]]).concat([['custom', 'مسألة من اختياري']])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'div', options: [['div', 'القسمة الطويلة ÷'], ['mul', 'الضرب العمودي ×']] },
      { key: 'a', label: '\\text{العدد}', min: 10, max: 999, step: 1, value: 96, int: true },
      { key: 'b', label: '\\text{في / على}', min: 2, max: 9, step: 1, value: 5, int: true },
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
})(typeof window !== 'undefined' ? window : globalThis);
