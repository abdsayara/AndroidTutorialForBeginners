/* المهارات الرقمية (العاشر) — الوحدة الثانية، الدرس الأول: الخوارزميات والمخطط الانسيابي (ص 38–43) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.ds10;
  const U = 1;
  const fmt = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1000) / 1000));
  const IN = (t, ks) => ({ s: 'io', t: t, in: ks });
  const P = (t, f) => ({ s: 'proc', t: t, f: f });
  const O = (t, o) => ({ s: 'out', t: t, o: o });
  const Q = (t, test, yes, no) => ({ s: 'dec', t: t, test: test, yes: yes, no: no });
  const START = { s: 'start', t: 'البداية' }, END = { s: 'end', t: 'النهاية' };
  const ALG = {
    avg: { name: 'مثال 1: حاسبة متوسط علامات الطالب', page: 38, ins: [['A', 'العلامة الأولى A', 80], ['B', 'العلامة الثانية B', 75], ['C', 'العلامة الثالثة C', 90]],
      ipo: ['العلامات A و B و C', 'Sum = A + B + C ثم Average = Sum / 3', 'المتوسط Average'],
      flow: () => [START, IN('أدخل A و B و C', ['A', 'B', 'C']), P('Sum = A + B + C', (e) => { e.Sum = e.A + e.B + e.C; }), P('Average = Sum / 3', (e) => { e.Average = e.Sum / 3; }), O('اطبع Average', (e) => 'Average = ' + fmt(e.Average)), END] },
    bill: { name: 'مثال 2: حاسبة الفاتورة بعد الخصم', page: 39, ins: [['price', 'السعر الأصلي', 200], ['pct', 'نسبة الخصم %', 10]],
      ipo: ['السعر الأصلي، نسبة الخصم', 'قيمة الخصم = السعر × (النسبة / 100)، السعر النهائي = السعر − الخصم', 'قيمة الخصم والسعر النهائي'],
      flow: () => [START, IN('أدخل السعر الأصلي ونسبة الخصم', ['price', 'pct']), P('الخصم = السعر × (النسبة / 100)', (e) => { e.disc = e.price * e.pct / 100; }), P('السعر النهائي = السعر − الخصم', (e) => { e.final = e.price - e.disc; }), O('اطبع الخصم والسعر النهائي', (e) => 'الخصم = ' + fmt(e.disc) + '  ،  السعر النهائي = ' + fmt(e.final)), END] },
    c2f: { name: 'نشاط 2: محوّل درجات الحرارة', page: 39, model: true, ins: [['C', 'الحرارة المئوية C', 25]],
      ipo: ['درجة الحرارة المئوية C', 'F = (C × 9/5) + 32', 'درجة الحرارة الفهرنهايت F'],
      flow: () => [START, IN('أدخل C', ['C']), P('F = (C * 9/5) + 32', (e) => { e.F = e.C * 9 / 5 + 32; }), O('اطبع F', (e) => 'F = ' + fmt(e.F)), END] },
    phone: { name: 'نشاط 3: التحقق من رقم هاتف فلسطيني', page: 39, model: true, text: '0599123456', ins: [],
      ipo: ['رقم الهاتف', 'فحص البداية (059 أو 056) وفحص الطول (10 أرقام)', 'صالح / غير صالح'],
      flow: () => [START, IN('أدخل رقم الهاتف', ['phone']), Q('يبدأ بـ 059 أو 056 ؟', (e) => /^05[96]/.test(e.phone), [Q('طوله 10 أرقام ؟', (e) => /^\d{10}$/.test(e.phone), [O('اطبع: رقم صالح', () => 'رقم صالح')], [O('اطبع: غير صالح (الطول)', () => 'غير صالح: الطول ليس 10 أرقام')])], [O('اطبع: غير صالح (البداية)', () => 'غير صالح: لا يبدأ بـ 059 أو 056')]), END] },
    age: { name: 'مثال 3: حساب عمر الطالب', page: 39, ins: [['born', 'سنة الميلاد', 2010], ['now', 'السنة الحالية', 2026]],
      ipo: ['سنة الميلاد، السنة الحالية', 'طرح سنة الميلاد من السنة الحالية', 'العمر بالسنوات'],
      flow: () => [START, IN('أدخل سنة الميلاد والسنة الحالية', ['born', 'now']), P('العمر = السنة الحالية − سنة الميلاد', (e) => { e.age = e.now - e.born; }), O('اطبع العمر', (e) => 'العمر = ' + e.age + ' سنة'), END] },
    rect: { name: 'مثال 4: مساحة المستطيل (ونشاط 4)', page: 40, ins: [['L', 'الطول', 8], ['W', 'العرض', 5]],
      ipo: ['الطول والعرض', 'المساحة = الطول × العرض', 'المساحة'],
      flow: () => [START, IN('أدخل الطول', ['L']), IN('أدخل العرض', ['W']), P('المساحة = الطول × العرض', (e) => { e.area = e.L * e.W; }), O('اطبع المساحة', (e) => 'المساحة = ' + fmt(e.area)), END] },
    hours: { name: 'نشاط 4: تحويل ساعات إلى دقائق', page: 40, model: true, ins: [['h', 'عدد الساعات', 3]],
      ipo: ['عدد الساعات', 'الدقائق = الساعات × 60', 'عدد الدقائق'],
      flow: () => [START, IN('أدخل عدد الساعات', ['h']), P('الدقائق = الساعات × 60', (e) => { e.m = e.h * 60; }), O('اطبع الدقائق', (e) => 'الدقائق = ' + fmt(e.m)), END] },
    elec: { name: 'نشاط 4: قيمة فاتورة الكهرباء', page: 40, model: true, ins: [['kwh', 'الاستهلاك (كيلوواط·ساعة)', 250], ['pr', 'سعر الكيلوواط (قرش)', 60]],
      ipo: ['الاستهلاك، سعر الكيلوواط', 'الفاتورة = الاستهلاك × السعر', 'قيمة الفاتورة'],
      flow: () => [START, IN('أدخل الاستهلاك والسعر', ['kwh', 'pr']), P('الفاتورة = الاستهلاك × السعر ÷ 100', (e) => { e.bill = e.kwh * e.pr / 100; }), O('اطبع الفاتورة', (e) => 'الفاتورة = ' + fmt(e.bill) + ' دينار'), END] },
    pass: { name: 'مثال 5: ناجح أم راسب', page: 40, ins: [['Mark', 'العلامة Mark', 65]],
      ipo: ['العلامة', 'مقارنة العلامة بـ 50', 'ناجح أو راسب'],
      flow: () => [START, IN('أدخل العلامة', ['Mark']), Q('Mark >= 50 ؟ (العلامة >= 50)', (e) => e.Mark >= 50, [O('اطبع ناجح', () => 'ناجح')], [O('اطبع راسب', () => 'راسب')]), END] },
    temp: { name: 'نشاط 5: تصنيف درجة الحرارة', page: 41, model: true, ins: [['T', 'درجة الحرارة', 37]],
      ipo: ['درجة الحرارة', 'مقارنتها بـ 38 ثم بـ 36', 'مرتفعة / طبيعية / منخفضة'],
      flow: () => [START, IN('أدخل درجة الحرارة', ['T']), Q('الحرارة > 38 ؟', (e) => e.T > 38, [O('اطبع: مرتفعة', () => 'مرتفعة')], [Q('الحرارة >= 36 ؟', (e) => e.T >= 36, [O('اطبع: طبيعية', () => 'طبيعية')], [O('اطبع: منخفضة', () => 'منخفضة')])]), END] },
    license: { name: 'أسئلة الدرس 3: رخصة السياقة', page: 43, model: true, ins: [['age', 'العمر', 17], ['theory', 'نجح في النظري؟ (1 نعم / 0 لا)', 1]],
      ipo: ['العمر، نتيجة الاختبار النظري', 'فحص العمر ≥ 18 ثم فحص النجاح', 'يحق له / لا يحق له'],
      flow: () => [START, IN('أدخل العمر ونتيجة النظري', ['age', 'theory']), Q('العمر >= 18 ؟', (e) => e.age >= 18, [Q('نجح في النظري ؟', (e) => e.theory >= 1, [O('اطبع: يحق له الحصول على الرخصة', () => 'يحق له الحصول على الرخصة')], [O('اطبع: لا يحق (النظري)', () => 'لا يحق له: لم ينجح في النظري')])], [O('اطبع: لا يحق (العمر)', () => 'لا يحق له: العمر أقل من 18')]), END] }
  };
  D.ALG = ALG;
  // تنفيذ المخطط وتسجيل المسار
  function execAlg(a, p) {
    const e = {}; a.ins.forEach((x, i) => { e[x[0]] = +p['a' + (i + 1)]; }); if (a.text) e.phone = String(p.txt || '');
    const path = []; const outs = [];
    (function walk(list) { list.forEach((n) => { if (n.s === 'dec') { const r = !!n.test(e); path.push({ n: n, r: r }); walk(r ? n.yes : n.no); } else { if (n.f) n.f(e); let o = null; if (n.o) { o = n.o(e); outs.push(o); } path.push({ n: n, o: o, env: Object.assign({}, e) }); } }); })(a.flow ? (a._f = a._f || a.flow()) : []);
    return { e: e, path: path, outs: outs };
  }
  D.execAlg = execAlg;
  const nodeH = (n) => (n.s === 'dec' ? 58 : 38), GAP = 24;
  function hOf(list) { return list.reduce((s, n) => s + (n.s === 'dec' ? nodeH(n) + GAP + Math.max(hOf(n.yes), hOf(n.no)) + GAP : nodeH(n) + GAP), 0); }
  function drawFlow(ctx, list, cx, y, w, st, c) {
    let prev = null;
    list.forEach((n) => {
      if (prev !== null) arrowV(ctx, cx, prev, y, c);
      const h = nodeH(n); const nw = Math.min(n.s === 'dec' ? 230 : 210, w * 0.92);
      const vis = st.seen.has(n), cur = st.cur === n;
      ctx.save(); ctx.lineWidth = cur ? 3.5 : 1.8; ctx.strokeStyle = cur ? '#f59e0b' : vis ? '#0d9488' : c.muted;
      ctx.fillStyle = cur ? 'rgba(245,158,11,.22)' : vis ? 'rgba(13,148,136,.16)' : 'rgba(148,163,184,.08)';
      ctx.beginPath();
      if (n.s === 'start' || n.s === 'end') { D.rr(ctx, cx - nw / 2 * 0.7, y, nw * 0.7, h, h / 2); }
      else if (n.s === 'io' || n.s === 'out') { const k = 14; ctx.moveTo(cx - nw / 2 + k, y); ctx.lineTo(cx + nw / 2, y); ctx.lineTo(cx + nw / 2 - k, y + h); ctx.lineTo(cx - nw / 2, y + h); ctx.closePath(); }
      else if (n.s === 'proc') ctx.rect(cx - nw / 2, y, nw, h);
      else { ctx.moveTo(cx, y); ctx.lineTo(cx + nw / 2, y + h / 2); ctx.lineTo(cx, y + h); ctx.lineTo(cx - nw / 2, y + h / 2); ctx.closePath(); }
      ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.font = '700 12px system-ui, Tajawal, sans-serif'; const t = D.fit(ctx, n.t, (n.s === 'dec' ? nw * 0.62 : nw - 22)); ctx.restore();
      D.txt(ctx, t, cx, y + h / 2, { color: c.text, size: 12, w: '700' });
      if (n.s === 'dec') {
        const yb = y + h + GAP; const xr = cx + w / 4, xl = cx - w / 4; const r = st.dec.get(n);
        ctx.save(); ctx.lineWidth = 1.8;
        ctx.strokeStyle = r === true ? '#0d9488' : c.muted; ctx.beginPath(); ctx.moveTo(cx + nw / 2, y + h / 2); ctx.lineTo(xr, y + h / 2); ctx.lineTo(xr, yb); ctx.stroke();
        ctx.strokeStyle = r === false ? '#0d9488' : c.muted; ctx.beginPath(); ctx.moveTo(cx - nw / 2, y + h / 2); ctx.lineTo(xl, y + h / 2); ctx.lineTo(xl, yb); ctx.stroke(); ctx.restore();
        D.txt(ctx, 'نعم', (cx + nw / 2 + xr) / 2, y + h / 2 - 10, { color: c.c3, size: 12, w: '800' });
        D.txt(ctx, 'لا', (cx - nw / 2 + xl) / 2, y + h / 2 - 10, { color: c.c2, size: 12, w: '800' });
        const ey = Math.max(drawFlow(ctx, n.yes, xr, yb, w / 2, st, c), drawFlow(ctx, n.no, xl, yb, w / 2, st, c));
        const my = ey + 4;
        ctx.save(); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(xr, ey - GAP); ctx.lineTo(xr, my); ctx.lineTo(xl, my); ctx.lineTo(xl, ey - GAP); ctx.stroke(); ctx.restore();
        y = my + GAP - 4; prev = my;
      } else { prev = y + h; y = y + h + GAP; }
    });
    return y;
  }
  function arrowV(ctx, x, y1, y2, c) { ctx.save(); ctx.strokeStyle = c.muted; ctx.fillStyle = c.muted; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2 - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 5, y2 - 8); ctx.lineTo(x + 5, y2 - 8); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const algOf = (p) => ALG[p && ALG[p.alg] ? p.alg : 'avg'];
  const stepNames = (p) => { const a = algOf(p); const pp = Object.assign({ a1: (a.ins[0] || [0, 0, 0])[2], a2: (a.ins[1] || [0, 0, 0])[2], a3: (a.ins[2] || [0, 0, 0])[2], txt: a.text || '' }, p || {}); if (!p || p.alg === undefined) { pp.a1 = (a.ins[0] || [0, 0, 0])[2]; } return execAlg(a, pp).path.map((s) => s.n.t + (s.n.s === 'dec' ? ' ← ' + (s.r ? 'نعم' : 'لا') : s.o ? ' ← ' + s.o : '')); };
  D.reg({
    id: 'algorithm-flowchart', unit: U, order: 1, lesson: 'الدرس الأول', lessonTitle: 'الخوارزميات والمخطط الانسيابي', page: 38,
    titleAr: 'من الخوارزمية إلى المخطط الانسيابي', titleEn: 'Algorithms & Flowcharts', tags: 'خوارزميه مخطط انسيابي مدخلات عمليات مخرجات قرار معين متوازي مستطيل بيضاوي تفكير حاسوبي',
    formula: '\\text{المدخلات} \\rightarrow \\text{العمليات} \\rightarrow \\text{المخرجات}',
    book: 'الخوارزمية مجموعة تعليمات وخطوات واضحة ومرتبة لحل مشكلة أو إنجاز مهمة؛ المخطط الانسيابي تمثيل مرئي لها بأشكال هندسية ورموز محددة',
    summary: 'الخوارزمية خطوات واضحة ومرتبة وقابلة للتنفيذ لها بداية ونهاية، وتتكون من مدخلات وعمليات ومخرجات. المخطط الانسيابي يرسمها بأشكال: البيضاوي للبداية والنهاية، المتوازي للإدخال والإخراج، المستطيل للعملية، والمعيّن للقرار (نعم/لا). غيّر المدخلات وتابع المسار الذي تسلكه الخوارزمية.',
    vars: [['\\text{بيضاوي}', 'بداية / نهاية', ''], ['\\text{متوازي}', 'إدخال / إخراج', ''], ['\\text{مستطيل}', 'عملية حسابية', ''], ['\\text{معيّن}', 'قرار (نعم/لا)', '']],
    assumptions: ['قيم المدخلات للتجربة يختارها المتعلم؛ الخوارزميات وخطواتها من الكتاب', 'الأنشطة التي يطلب فيها الكتاب كتابة الخوارزمية معروضة بـ «' + D.MODEL + '»'],
    params: [
      { key: 'alg', label: '\\text{الخوارزمية}', type: 'select', value: 'avg', options: Object.keys(ALG).map((k) => [k, ALG[k].name]) },
      { key: 'step', label: '\\text{الخطوة}', type: 'stage', value: 0, stages: stepNames },
      { key: 'a1', label: '\\text{المُدخل 1}', min: -100, max: 3000, step: 1, value: 80, int: true, desc: 'انظر اسمه على الرسم', hidden: (p) => algOf(p).ins.length < 1 },
      { key: 'a2', label: '\\text{المُدخل 2}', min: -100, max: 3000, step: 1, value: 75, int: true, desc: 'انظر اسمه على الرسم', hidden: (p) => algOf(p).ins.length < 2 },
      { key: 'a3', label: '\\text{المُدخل 3}', min: -100, max: 3000, step: 1, value: 90, int: true, desc: 'انظر اسمه على الرسم', hidden: (p) => algOf(p).ins.length < 3 },
      { key: 'txt', label: '\\text{رقم الهاتف}', type: 'text', value: '0599123456', maxLength: 14, desc: 'أرقام فقط', hidden: (p) => !algOf(p).text, normalize: (v) => String(v).trim(), validate: () => null }
    ],
    onSet(p, key) {
      const a = algOf(p);
      if (key === 'alg') { a.ins.forEach((x, i) => { p['a' + (i + 1)] = x[2]; }); if (a.text) p.txt = a.text; p.step = 0; }
      if (key && key !== 'step' && key !== 'alg') p.step = 0;
      const n = stepNames(p).length; if (p.step > n - 1) p.step = n - 1;
    },
    canvasHint: 'المسار المضاء بالأخضر هو ما نُفّذ حتى الآن، والشكل البرتقالي هو الخطوة الحالية. غيّر المدخلات لترى مساراً آخر عند المعيّن.',
    compute(p) {
      const a = algOf(p); const r = execAlg(a, p); const k = Math.max(0, Math.min(r.path.length - 1, Math.round(p.step || 0)));
      const seen = new Set(), dec = new Map(); r.path.slice(0, k + 1).forEach((s) => { seen.add(s.n); if (s.n.s === 'dec') dec.set(s.n, s.r); });
      const outs = r.path.slice(0, k + 1).filter((s) => s.o).map((s) => s.o);
      return { a: a, r: r, k: k, cur: r.path[k], seen: seen, dec: dec, outs: outs, last: k === r.path.length - 1 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = D.narrow(W); const list = d.a._f || d.a.flow(); const fw = nar ? W : W * 0.62;
      const total = hOf(list) + 10; const s = Math.min(1, (nar ? H * 0.7 : H - 16) / total); const vw = fw / s;
      ctx.save(); ctx.translate(nar ? 0 : W - fw, 8); ctx.scale(s, s);
      drawFlow(ctx, list, vw / 2, 4, vw * 0.96, { seen: d.seen, cur: d.cur.n, dec: d.dec }, c);
      ctx.restore();
      // المدخلات والمخرجات
      const bx = nar ? 8 : 10, by = nar ? H * 0.72 : 12, bw = nar ? W - 16 : W - fw - 24, bh = nar ? H * 0.28 - 8 : H - 24;
      ctx.save(); D.rr(ctx, bx, by, bw, bh, 10); ctx.fillStyle = 'rgba(37,99,235,.06)'; ctx.fill(); ctx.strokeStyle = c.grid; ctx.stroke(); ctx.restore();
      let yy = by + 18;
      D.txt(ctx, 'المدخلات', bx + bw - 10, yy, { color: c.c1, size: 13, w: '800', align: 'right' }); yy += 20;
      const ins = d.a.text ? [['رقم الهاتف', p.txt]] : d.a.ins.map((x, i) => [x[1], p['a' + (i + 1)]]);
      ins.forEach((x) => { D.txt(ctx, x[0] + ' = ' + x[1], bx + bw - 14, yy, { color: c.text, size: 12, align: 'right' }); yy += 18; });
      yy += 6; D.txt(ctx, 'المخرجات', bx + bw - 10, yy, { color: c.c3, size: 13, w: '800', align: 'right' }); yy += 20;
      if (!d.outs.length) D.txt(ctx, '(لم يُطبع شيء بعد)', bx + bw - 14, yy, { color: c.muted, size: 12, align: 'right' });
      d.outs.forEach((o) => { ctx.save(); ctx.font = '700 12px system-ui'; const t = D.fit(ctx, o, bw - 20); ctx.restore(); D.txt(ctx, t, bx + bw - 14, yy, { color: c.c3, size: 12, w: '700', align: 'right' }); yy += 18; });
      if (d.a.model && !nar) D.txt(ctx, D.MODEL, bx + bw / 2, by + bh - 12, { color: c.c4, size: 10.5, w: '700' });
    },
    live(p, d) { return '\\text{الخطوة ' + (d.k + 1) + ' من ' + d.r.path.length + '}'; },
    results(p, d) {
      const a = d.a; const r = [['الخوارزمية', a.name + ' (ص ' + a.page + ')', false], ['الخطوة الحالية', d.cur.n.t + (d.cur.n.s === 'dec' ? ' ← ' + (d.cur.r ? 'نعم' : 'لا') : ''), false],
        ['المدخلات', a.ipo[0], false], ['العمليات', a.ipo[1], false], ['المخرجات', a.ipo[2], false]];
      if (d.last) r.push(['الناتج', d.r.outs.join(' ، ') || '—', false, 'pos']);
      if (a.model) r.push(['ملاحظة', D.MODEL + '؛ النشاط في الكتاب يطلب كتابة الخوارزمية.', false]);
      return r;
    },
    steps(p, d) { return d.r.path.map((s, i) => (i === d.k ? '**' : '') + (i + 1) + '. ' + s.n.t + (s.n.s === 'dec' ? ' ← ' + (s.r ? 'نعم' : 'لا') : s.o ? ' ← ' + s.o : '') + (i === d.k ? '**' : '')); },
    explain(a, b, da, db) {
      if (a.alg !== b.alg) return ['خوارزمية جديدة: ' + db.a.name + '. المدخلات: ' + db.a.ipo[0] + '.'];
      if (da && da.k !== db.k) { const n = db.cur.n; return [n.s === 'dec' ? 'قرار (معيّن): ' + n.t + ' ← ' + (db.cur.r ? 'نعم' : 'لا') + '، فنسلك فرع «' + (db.cur.r ? 'نعم' : 'لا') + '».' : n.s === 'proc' ? 'عملية (مستطيل): ' + n.t : n.s === 'io' ? 'إدخال (متوازي): ' + n.t : n.s === 'out' ? 'إخراج (متوازي): ' + db.cur.o : n.t]; }
      return [];
    },
    learn: [
      '**قصة الدرس (ص 38):** عام 1999 تحطمت مركبة ناسا «مارس كلايمت أوربيتر» لأن فريقاً أرسل البيانات بوحدة «الرطل-ثانية» واستقبلها الحاسوب على أنها «نيوتن-ثانية».',
      '**الخوارزمية (ص 38):** مجموعة تعليمات وخطوات واضحة ومرتبة لحل مشكلة أو إنجاز مهمة. من خصائصها: خطوات واضحة، مرتبة، قابلة للتنفيذ، لها بداية ونهاية.',
      '**مكونات الخوارزمية (ص 39):** المدخلات (ما الذي نعطيه للحاسب؟)، العمليات (ماذا سيفعل بها؟)، المخرجات (ما النتيجة؟).',
      '**المخطط الانسيابي (ص 40):** تمثيل مرئي لخطوات حل المشكلة؛ يجعل الفكرة مرئية، ويساعد على اكتشاف الأخطاء قبل كتابة الكود.',
      '**التفكير الحاسوبي (ص 41):** التفكيك، التجريد، ملاحظة الأنماط، والتفكير الخوارزمي. ومراحل حل المسألة: الفهم، الخوارزمية، المخطط، البرمجة، الاختبار، التحسين.'
    ],
    challenges: [
      { q: 'مثال 5: أدخل علامة تجعل الخوارزمية تسلك فرع «لا» وتتبّع حتى النهاية.', hint: 'علامة أقل من 50.', init: { alg: 'pass', a1: 65, step: 0 }, check: (p, d) => p.alg === 'pass' && d.last && d.r.outs[0] === 'راسب' },
      { q: 'نشاط 5: أدخل درجة حرارة طبيعية وتتبّع حتى الطباعة.', hint: 'بين 36 و 38.', init: { alg: 'temp', a1: 40, step: 0 }, check: (p, d) => p.alg === 'temp' && d.last && d.r.outs[0] === 'طبيعية' },
      { q: 'نشاط 3: اكتب رقماً يبدأ بـ 056 لكنه غير صالح بسبب الطول.', hint: 'مثلاً 05612345.', init: { alg: 'phone', txt: '0599123456', step: 0 }, check: (p, d) => p.alg === 'phone' && /^056/.test(p.txt) && /الطول/.test(d.r.outs.join('')) },
      { q: 'مثال 2: جد الخصم على سعر 200 بنسبة 20%.', hint: 'المُدخل 2 = 20.', init: { alg: 'bill', a1: 200, a2: 10, step: 0 }, check: (p, d) => p.alg === 'bill' && p.a1 === 200 && p.a2 === 20 && d.last, why: () => 'الخصم 40 والسعر النهائي 160.' }
    ],
    tutor: [
      { q: 'ما الفرق بين الخوارزمية والمخطط الانسيابي؟', k: ['الفرق', 'مخطط'], a: () => 'الخوارزمية خطوات مكتوبة بالكلمات، والمخطط الانسيابي رسم للخطوات نفسها بأشكال ورموز تجعلها مرئية.' },
      { q: 'ما معنى شكل المعيّن؟', k: ['معين', 'قرار'], a: () => 'المعيّن قرار: سؤال جوابه نعم أو لا، ومنه يخرج مساران.' },
      { q: 'ما المدخلات والعمليات والمخرجات هنا؟', k: ['مدخلات', 'عمليات', 'مخرجات'], a: (p, d) => 'المدخلات: ' + d.a.ipo[0] + '. العمليات: ' + d.a.ipo[1] + '. المخرجات: ' + d.a.ipo[2] + '.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
