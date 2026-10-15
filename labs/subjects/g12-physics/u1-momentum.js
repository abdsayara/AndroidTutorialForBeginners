/* فيزياء الثاني عشر — الوحدة الأولى: الفصل 1 الزخم الخطي والدفع (ص4–14)، الفصل 2 التصادمات (ص15–32) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q;

  /* ======================= 1-1 الزخم الخطي ص5–6 ======================= */
  K.reg({
    id: 'momentum', unit: 1, order: 1, lesson: '1-1', lessonTitle: 'الزخم الخطي', page: 5,
    titleAr: 'الزخم الخطي: كتلة الجسم × سرعته', titleEn: 'Linear Momentum', tags: 'زخم كمية تحرك p=mv طاقة حركية نشاط 1-1 سطح مائل ممحاة',
    formula: 'P = m\\,v ,\\qquad K = \\frac{P^2}{2m}',
    book: 'القانون (1-1) ص5: الزخم = كتلة الجسم × سرعته، وهو كمية متجهة باتجاه السرعة، ووحدته kg.m/s. مثال (1) ص6: سيارة 1000 kg بسرعة 20 m/s شرقاً، وكرة 2 kg طاقتها الحركية 16 J.',
    summary: 'كلما كانت كتلة الجسم المتحرك أو سرعته أكبر كانت إعاقة حركته أصعب؛ ويعبَّر عن ذلك بالزخم P = mv. وترتبط الطاقة الحركية بالزخم بالعلاقة K = P²/2m.',
    vars: [['m', 'كتلة الجسم', '\\mathrm{kg}', '0.1 – 2000'], ['v', 'سرعة الجسم', '\\mathrm{m/s}', '0 – 40'], ['P', 'الزخم الخطي', '\\mathrm{kg\\,m/s}', '—'], ['K', 'الطاقة الحركية', '\\mathrm{J}', '—']],
    assumptions: ['مسافة إزاحة الممحاة في النشاط (1-1) تتناسب مع زخم الكرة: ' + Q.SIMPLE + '.'],
    params: [
      { key: 'by', label: '\\text{المعطى}', type: 'select', value: 'v', options: [['v', 'الكتلة والسرعة'], ['K', 'الكتلة والطاقة الحركية']] },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.1, max: 2000, step: 0.1, value: 1000 },
      { key: 'v', label: 'v\\ (\\mathrm{m/s})', min: 0, max: 40, step: 0.5, value: 20, hidden: (p) => p.by !== 'v' },
      { key: 'K', label: 'K\\ (\\mathrm{J})', min: 0, max: 1000, step: 1, value: 16, hidden: (p) => p.by !== 'K' }
    ],
    compute(p) { const P = p.by === 'v' ? Q.momentum(p.m, p.v) : Q.pFromK(p.m, p.K); const v = P / p.m; return { P: P, v: v, Ke: Q.kFromP(p.m, P) }; },
    live(p, d) { return p.by === 'v' ? 'P = m v = ' + p.m + ' \\times ' + p.v + ' = ' + q(d.P, 'kg\\,m/s') : 'P = \\sqrt{2mK} = \\sqrt{2 \\times ' + p.m + ' \\times ' + p.K + '} = ' + q(d.P, 'kg\\,m/s'); },
    results(p, d) { return [['الزخم P', q(d.P, 'kg\\,m/s'), true, 'pos'], ['السرعة v', q(d.v, 'm/s')], ['الطاقة الحركية K', q(d.Ke, 'J')], ['الاتجاه', 'باتجاه السرعة (كمية متجهة)', false]]; },
    steps(p, d) { return p.by === 'v' ? ['P = m v = ' + p.m + ' × ' + p.v + ' = ' + n(d.P) + ' kg.m/s.', 'K = ½ m v² = ' + n(d.Ke) + ' J.'] : ['K = P²/2m ⇒ P = √(2mK) = √(2 × ' + p.m + ' × ' + p.K + ') = ' + n(d.P) + ' kg.m/s.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W); const x0 = W * 0.08, y0 = H * 0.25, x1 = W * 0.55, y1 = H * 0.72;
      ctx.strokeStyle = cols.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(W * 0.95, y1); ctx.stroke();
      const rb = Math.min(30, 8 + Math.cbrt(p.m) * 2.2); ctx.fillStyle = cols.c1; ctx.beginPath(); ctx.arc(x1 - 6, y1 - rb, rb, 0, Math.PI * 2); ctx.fill();
      const shift = Math.min(W * 0.32, Math.sqrt(d.P) * 2); ctx.fillStyle = cols.c4; ctx.fillRect(x1 + 10 + shift, y1 - 22, 34, 22);
      ctx.strokeStyle = cols.muted; ctx.setLineDash([4, 4]); ctx.strokeRect(x1 + 10, y1 - 22, 34, 22); ctx.setLineDash([]);
      K.vec(ctx, x1 - 6, y1 - rb * 2 - 14, Math.min(W * 0.3, 10 + d.P / 400), 0, cols.c2, 'P', cols);
      D.txt(ctx, 'الممحاة تُزاح أكثر كلما زاد الزخم', W * 0.62, y1 + 28, { color: cols.muted, size: nr ? 11 : 12.5, w: '600' });
      D.txt(ctx, 'P = ' + n(d.P) + ' kg.m/s', W / 2, H * 0.12, { color: cols.text, size: nr ? 15 : 18, w: '700' });
    },
    graph(p, d) { const vm = Math.max(40, d.v * 1.2); return { view: { xmin: 0, xmax: vm, ymin: 0, ymax: Math.max(1, p.m * vm) * 1.05 }, xLabel: 'v (m/s)', yLabel: 'P (kg.m/s)', caption: 'P تتناسب طردياً مع v لكتلة ثابتة؛ ميل الخط يساوي الكتلة m.', draw(G) { const c = G.colors(); G.fn((x) => p.m * x, { color: c.c1, width: 3, domain: [0, vm] }); G.point(d.v, d.P, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.m !== b.m) o.push('زيادة الكتلة تزيد الزخم بالنسبة نفسها عند السرعة نفسها.'); if (a.v !== b.v) o.push('مضاعفة السرعة تضاعف الزخم وتضاعف الطاقة الحركية أربع مرات.'); return o; },
    learn: ['**الزخم (ص5):** كمية فيزيائية متجهة تساوي حاصل ضرب كتلة الجسم في سرعته، وتكون باتجاه السرعة: P = mv.', '**الوحدة:** kg.m/s، وتكافئ N.s.', '**العلاقة مع الطاقة الحركية:** K = ½mv² = P²/2m.'],
    challenges: [
      { q: 'مثال (1): ما زخم سيارة كتلتها 1000 kg تسير بسرعة 20 m/s؟ اضبط القيم.', hint: 'المعطى: الكتلة والسرعة.', init: { by: 'v', m: 500, v: 10 }, check: (p) => p.by === 'v' && p.m === 1000 && p.v === 20, why: () => 'P = 2×10⁴ kg.m/s شرقاً.' },
      { q: 'مثال (1): كرة كتلتها 2 kg طاقتها الحركية 16 J؛ أوجد زخمها.', hint: 'اختر «الكتلة والطاقة الحركية».', init: { by: 'v', m: 1000, v: 20 }, check: (p) => p.by === 'K' && p.m === 2 && p.K === 16, why: () => 'P = √(2×2×16) = 8 kg.m/s.' }
    ],
    tutor: [
      { q: 'ما وحدة الزخم؟', k: ['وحده', 'وحدة'], a: () => K.tutor('اضرب وحدة الكتلة في وحدة السرعة.', 'kg.m/s، وتكافئ N.s.') },
      { q: 'ما العلاقة بين الزخم والطاقة الحركية؟', k: ['طاقه', 'حركيه'], a: (p, d) => K.tutor('اكتب K = ½mv² وعوّض v = P/m.', 'K = P²/2m = ' + n(d.Ke) + ' J.') },
      { q: 'مركبتان متساويتان في الكتلة وسرعة إحداهما ضعف الأخرى، أيهما أسهل إيقافاً؟', k: ['مركبتان', 'ايقاف', 'اسهل'], a: () => K.tutor('أيهما زخمها أقل؟', 'الأبطأ، لأن زخمها نصف زخم الأخرى فتحتاج دفعاً أقل.') }
    ]
  });

  /* ======================= 2-1 و3-1 الدفع ونظرية الدفع–الزخم ص6–9 ======================= */
  K.reg({
    id: 'impulse', unit: 1, order: 2, lesson: '3-1', lessonTitle: 'الدفع ونظرية الدفع–الزخم', page: 8,
    titleAr: 'الدفع: المساحة تحت منحنى القوة–الزمن', titleEn: 'Impulse and the Impulse–Momentum Theorem', tags: 'دفع قوة زمن مساحة نظرية الدفع الزخم نشاط 2-1 سيارة فرامل',
    formula: 'I = F\\,\\Delta t = \\Delta P = m v_f - m v_i',
    book: 'القوانين (1-2) و(1-5) ص6–8. نشاط (2-1) ص8: قوة 10 N تؤثر 6 s، وقوة 30 N تؤثر 2 s. مثال (2) ص9: سيارة 1200 kg تقل سرعتها من 20 إلى 8 m/s خلال 6 s.',
    summary: 'الدفع حاصل ضرب متوسط القوة في زمن تأثيرها، ويساوي المساحة تحت منحنى القوة–الزمن، ويساوي التغير في الزخم. لذلك تقل القوة اللازمة لتغيير زخم معيّن إذا زاد زمن التأثير (فكرة الوسادة الهوائية وحزام الأمان).',
    vars: [['F', 'متوسط القوة', '\\mathrm{N}', '−5000 – 5000'], ['\\Delta t', 'زمن التأثير', '\\mathrm{s}', '0.1 – 10'], ['I', 'الدفع', '\\mathrm{N\\,s}', '—'], ['m', 'كتلة السيارة', '\\mathrm{kg}', '500 – 2000']],
    assumptions: ['القوة ثابتة خلال زمن التأثير (منحنى مستطيل).'],
    params: [
      { key: 'mode', label: '\\text{الحالة}', type: 'select', value: 'compare', options: [['compare', 'نشاط (2-1): قوتان'], ['car', 'مثال (2): سيارة تتباطأ']] },
      { key: 'F1', label: 'F_1\\ (\\mathrm{N})', min: 1, max: 50, step: 1, value: 10, hidden: (p) => p.mode !== 'compare' },
      { key: 't1', label: '\\Delta t_1\\ (\\mathrm{s})', min: 0.5, max: 10, step: 0.5, value: 6, hidden: (p) => p.mode !== 'compare' },
      { key: 'F2', label: 'F_2\\ (\\mathrm{N})', min: 1, max: 50, step: 1, value: 30, hidden: (p) => p.mode !== 'compare' },
      { key: 't2', label: '\\Delta t_2\\ (\\mathrm{s})', min: 0.5, max: 10, step: 0.5, value: 2, hidden: (p) => p.mode !== 'compare' },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 500, max: 2000, step: 50, value: 1200, hidden: (p) => p.mode !== 'car' },
      { key: 'vi', label: 'v_i\\ (\\mathrm{m/s})', min: 0, max: 40, step: 1, value: 20, hidden: (p) => p.mode !== 'car' },
      { key: 'vf', label: 'v_f\\ (\\mathrm{m/s})', min: 0, max: 40, step: 1, value: 8, hidden: (p) => p.mode !== 'car' },
      { key: 'dt', label: '\\Delta t\\ (\\mathrm{s})', min: 0.5, max: 12, step: 0.5, value: 6, hidden: (p) => p.mode !== 'car' }
    ],
    compute(p) { if (p.mode === 'compare') return { I1: Q.impulse(p.F1, p.t1), I2: Q.impulse(p.F2, p.t2) }; const dP = p.m * (p.vf - p.vi); return { dP: dP, F: dP / p.dt }; },
    live(p, d) { return p.mode === 'compare' ? 'I_1 = ' + p.F1 + ' \\times ' + p.t1 + ' = ' + d.I1 + ' ,\\quad I_2 = ' + p.F2 + ' \\times ' + p.t2 + ' = ' + d.I2 + '\\ \\mathrm{N\\,s}' : 'F \\times ' + p.dt + ' = ' + p.m + '(' + p.vf + ' - ' + p.vi + ') \\Rightarrow F = ' + q(d.F, 'N'); },
    results(p, d) { return p.mode === 'compare' ? [['دفع القوة الأولى', q(d.I1, 'N\\,s')], ['دفع القوة الثانية', q(d.I2, 'N\\,s')], ['المقارنة', d.I1 === d.I2 ? 'متساويان رغم اختلاف القوة والزمن' : 'غير متساويين', false, d.I1 === d.I2 ? 'pos' : '']] : [['التغير في الزخم ΔP', q(d.dP, 'kg\\,m/s')], ['متوسط القوة F', q(d.F, 'N'), true, 'pos'], ['اتجاه القوة', d.F < 0 ? 'عكس اتجاه الحركة (−x)' : d.F > 0 ? 'مع اتجاه الحركة' : 'لا قوة', false]]; },
    steps(p, d) { return p.mode === 'compare' ? ['I₁ = F₁ Δt₁ = ' + p.F1 + ' × ' + p.t1 + ' = ' + d.I1 + ' N.s.', 'I₂ = F₂ Δt₂ = ' + p.F2 + ' × ' + p.t2 + ' = ' + d.I2 + ' N.s.', 'الدفع = المساحة تحت منحنى القوة–الزمن.'] : ['ΔP = m(v_f − v_i) = ' + p.m + '(' + p.vf + ' − ' + p.vi + ') = ' + n(d.dP) + ' kg.m/s.', 'F = ΔP/Δt = ' + n(d.dP) + ' ÷ ' + p.dt + ' = ' + n(d.F) + ' N.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W);
      if (p.mode === 'car') {
        const y = H * 0.6; ctx.strokeStyle = cols.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, y + 4); ctx.lineTo(W - 20, y + 4); ctx.stroke();
        K.cart(ctx, W * 0.45, y, 110, 40, cols.c1, p.m + ' kg', cols);
        K.vec(ctx, W * 0.45 + 60, y - 50, Math.min(W * 0.3, p.vi * 6), 0, cols.c3, 'v_i = ' + p.vi, cols); K.vec(ctx, W * 0.45 + 60, y - 20, Math.min(W * 0.3, p.vf * 6), 0, cols.c5, 'v_f = ' + p.vf, cols);
        K.vec(ctx, W * 0.45 - 60, y - 20, -Math.min(W * 0.3, Math.abs(d.F) / 40), 0, cols.c2, 'F = ' + n(d.F, 0) + ' N', cols);
      } else {
        D.txt(ctx, 'دفع متساوٍ؟ قارن المساحتين في الرسم البياني', W / 2, H * 0.2, { color: cols.text, size: nr ? 13 : 15, w: '700' });
        [[p.F1, p.t1, cols.c1, 'F₁'], [p.F2, p.t2, cols.c2, 'F₂']].forEach(([F, t, c, l], i) => { const x = W * (0.2 + i * 0.4), w = Math.min(W * 0.32, t * 22), h = Math.min(H * 0.45, F * 6); ctx.fillStyle = c; ctx.globalAlpha = 0.5; ctx.fillRect(x, H * 0.8 - h, w, h); ctx.globalAlpha = 1; D.txt(ctx, l + ': ' + F + ' N × ' + t + ' s = ' + F * t + ' N.s', x + w / 2, H * 0.8 + 16, { color: c, size: 12, w: '700' }); });
      }
    },
    graph(p, d) {
      if (p.mode === 'compare') { const tm = Math.max(p.t1, p.t2) + 2; return { view: { xmin: 0, xmax: tm + 1, ymin: 0, ymax: Math.max(p.F1, p.F2) * 1.25 }, xLabel: 't (s)', yLabel: 'F (N)', caption: 'الدفع = المساحة تحت المنحنى: ' + d.I1 + ' N.s و ' + d.I2 + ' N.s.', draw(G) { const c = G.colors(); G.polygon([[1, 0], [1, p.F1], [1 + p.t1, p.F1], [1 + p.t1, 0]], { color: c.c1, fill: c.c1, fillAlpha: 0.3 }); const s = 1 + (p.t1 - p.t2) / 2; G.polygon([[s, 0], [s, p.F2], [s + p.t2, p.F2], [s + p.t2, 0]], { color: c.c2, fill: c.c2, fillAlpha: 0.3 }); } }; }
      return { view: { xmin: 0, xmax: p.dt * 1.2, ymin: 0, ymax: Math.max(p.vi, p.vf, 1) * 1.2 }, xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'السرعة مع الزمن تحت قوة ثابتة.', draw(G) { const c = G.colors(); G.segment(0, p.vi, p.dt, p.vf, { color: c.c1, width: 3 }); } };
    },
    explain(a, b, da, db) { const o = []; if (b.mode === 'compare' && (a.F1 !== b.F1 || a.t1 !== b.t1 || a.F2 !== b.F2 || a.t2 !== b.t2)) o.push('الدفع ' + db.I1 + ' و ' + db.I2 + ' N.s: ما يحدد الدفع هو حاصل الضرب F Δt وليس القوة وحدها.'); if (b.mode === 'car' && a.dt !== b.dt) o.push('زيادة زمن التوقف تقلل القوة المؤثرة للتغير نفسه في الزخم (فكرة الوسادة الهوائية).'); return o; },
    learn: ['**الدفع (ص6):** I = F Δt، ووحدته N.s، ويساوي المساحة تحت منحنى القوة–الزمن.', '**نظرية الدفع–الزخم (ص8):** ΔP = F Δt، فالقوة المحصلة هي المعدل الزمني للتغير في الزخم (1-4).', '**تطبيق:** الوسادة الهوائية وحزام الأمان يزيدان زمن التوقف فتقل القوة على الراكب.'],
    challenges: [
      { q: 'نشاط (2-1): اجعل دفع القوتين متساوياً بقيم الكتاب (10 N لمدة 6 s و30 N لمدة 2 s).', hint: 'F × t متساوٍ.', init: { mode: 'compare', F1: 10, t1: 6, F2: 20, t2: 2 }, check: (p, d) => p.mode === 'compare' && d.I1 === d.I2, why: (p, d) => 'الدفعان ' + d.I1 + ' N.s.' },
      { q: 'مثال (2): احسب متوسط القوة على السيارة 1200 kg التي تتباطأ من 20 إلى 8 m/s خلال 6 s.', hint: 'اختر حالة السيارة واضبط القيم.', init: { mode: 'compare' }, check: (p, d) => p.mode === 'car' && p.m === 1200 && p.vi === 20 && p.vf === 8 && p.dt === 6, why: () => 'F = −2400 N (عكس الحركة).' }
    ],
    tutor: [
      { q: 'لماذا تقلل الوسادة الهوائية الإصابة؟', k: ['وساده', 'حزام', 'اصابه'], a: () => K.tutor('ماذا يحدث للقوة إذا زاد زمن التوقف والتغير في الزخم ثابت؟', 'تزيد زمن التوقف فيقل متوسط القوة F = ΔP/Δt.') },
      { q: 'كيف أحسب الدفع من منحنى القوة–الزمن؟', k: ['منحنى', 'مساحه'], a: () => K.tutor('ما شكل المنطقة تحت المنحنى؟', 'الدفع = المساحة تحت منحنى القوة–الزمن.') },
      { q: 'ما العلاقة بين الدفع والزخم؟', k: ['علاقه', 'زخم'], a: () => K.tutor('ماذا يحدث لزخم جسم تؤثر فيه قوة زمناً ما؟', 'الدفع يساوي التغير في الزخم: F Δt = ΔP.') }
    ]
  });

  /* ======================= 4-1 حفظ الزخم ص10–11 ======================= */
  K.reg({
    id: 'momentum-conservation', unit: 1, order: 3, lesson: '4-1', lessonTitle: 'حفظ الزخم', page: 11,
    titleAr: 'حفظ الزخم: قذف صندوق من قارب ساكن', titleEn: 'Conservation of Momentum (Recoil)', tags: 'حفظ الزخم نظام معزول ارتداد قارب صندوق مهد نيوتن نشاط 3-1 مثال 3',
    formula: '\\sum P_i = \\sum P_f \\;\\Rightarrow\\; 0 = m_1 v_{1f} + m_2 v_{2f}',
    book: 'القانون (1-6) ص10، ونشاط (3-1) مهد نيوتن. مثال (3) ص11: طالب 35 kg في قارب 65 kg ساكن يقذف صندوقاً 6 kg أفقياً بسرعة 10 m/s، فيرتد القارب بسرعة −0.60 m/s.',
    summary: 'في النظام المعزول يبقى الزخم الكلي ثابتاً. إذا كان النظام ساكناً (زخمه صفر) ثم قُذف جزء منه في اتجاه، تحرك الجزء الآخر في الاتجاه المعاكس بحيث يبقى مجموع الزخم صفراً.',
    vars: [['m_1', 'كتلة الصندوق', '\\mathrm{kg}', '1 – 20'], ['v_{1f}', 'سرعة الصندوق', '\\mathrm{m/s}', '1 – 20'], ['m_2', 'كتلة الطالب والقارب', '\\mathrm{kg}', '50 – 300'], ['v_{2f}', 'سرعة ارتداد القارب', '\\mathrm{m/s}', '—']],
    assumptions: ['إهمال مقاومة الماء والهواء (نظام معزول).'],
    params: [
      { key: 'm1', label: 'm_1\\ (\\mathrm{kg})', min: 1, max: 20, step: 1, value: 6 },
      { key: 'v1', label: 'v_{1f}\\ (\\mathrm{m/s})', min: 1, max: 20, step: 0.5, value: 10 },
      { key: 'm2', label: 'm_2\\ (\\mathrm{kg})', min: 50, max: 300, step: 5, value: 100 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    isDone: (st) => st.t >= 3,
    compute(p) { const v2 = Q.recoil(p.m1, p.m2, p.v1); return { v2: v2, p1: p.m1 * p.v1, p2: p.m2 * v2 }; },
    live(p, d) { return '0 = ' + p.m1 + ' \\times ' + p.v1 + ' + ' + p.m2 + '\\,v_{2f} \\Rightarrow v_{2f} = ' + q(d.v2, 'm/s', 3); },
    results(p, d) { return [['سرعة ارتداد القارب', q(d.v2, 'm/s', 3), true, 'pos'], ['زخم الصندوق', q(d.p1, 'kg\\,m/s')], ['زخم القارب والطالب', q(d.p2, 'kg\\,m/s')], ['الزخم الكلي', q(d.p1 + d.p2, 'kg\\,m/s')]]; },
    steps(p, d) { return ['النظام ساكن قبل القذف: ΣPi = 0.', '0 = m₁v₁f + m₂v₂f = ' + p.m1 + ' × ' + p.v1 + ' + ' + p.m2 + ' v₂f.', 'v₂f = ' + n(d.v2, 3) + ' m/s (الإشارة السالبة: عكس اتجاه الصندوق).']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const t = Math.min(st.t, 3); const y = H * 0.62, sc = Math.min(30, W / 30);
      ctx.fillStyle = 'rgba(56,189,248,.25)'; ctx.fillRect(0, y, W, H - y);
      const bx = W * 0.45 + d.v2 * t * sc, cx = W * 0.45 + 40 + p.v1 * t * sc * 0.6;
      ctx.fillStyle = '#92400e'; ctx.beginPath(); ctx.moveTo(bx - 70, y - 20); ctx.lineTo(bx + 70, y - 20); ctx.lineTo(bx + 50, y + 10); ctx.lineTo(bx - 50, y + 10); ctx.fill();
      ctx.fillStyle = cols.c5; ctx.beginPath(); ctx.arc(bx - 10, y - 55, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(bx - 18, y - 45, 16, 25);
      ctx.fillStyle = cols.c4; ctx.fillRect(Math.min(W - 30, cx), y - 50 - (t > 0 ? 6 * t : 0), 22, 22);
      K.vec(ctx, bx, y - 80, d.v2 * 12, 0, cols.c1, 'v₂f', cols); K.vec(ctx, Math.min(W - 30, cx) + 11, y - 90, p.v1 * 4, 0, cols.c2, 'v₁f', cols);
      D.txt(ctx, 'ΣP = ' + n(d.p1 + d.p2, 3) + ' kg.m/s', W / 2, H * 0.12, { color: cols.text, size: 16, w: '700' });
    },
    graph(p, d) { return { view: K.barView([d.p1, d.p2, 0]), xLabel: '', yLabel: 'P (kg.m/s)', caption: 'زخم الصندوق يساوي زخم القارب مقداراً ويعاكسه اتجاهاً، فالمجموع صفر.', draw(G) { const c = G.colors(); K.bars(G, [['الصندوق', d.p1, c.c2], ['القارب', d.p2, c.c1], ['المجموع', d.p1 + d.p2, c.c3]]); } }; },
    explain(a, b, da, db) { const o = []; if (a.m1 !== b.m1 || a.v1 !== b.v1) o.push('زيادة زخم الصندوق تزيد سرعة ارتداد القارب: ' + n(db.v2, 3) + ' m/s.'); if (a.m2 !== b.m2) o.push('قارب أثقل يرتد بسرعة أقل للزخم نفسه.'); return o; },
    learn: ['**قانون حفظ الزخم (1-6):** في النظام المعزول، الزخم الكلي قبل التفاعل يساوي الزخم الكلي بعده.', '**مهد نيوتن (نشاط 3-1):** إذا سقطت كرة من طرف تندفع كرة واحدة من الطرف الآخر بالسرعة نفسها تقريباً.', '**مثال (3) ص11:** 0 = 6×10 + 100 v ⇒ v = −0.60 m/s.'],
    challenges: [
      { q: 'مثال (3): أوجد سرعة ارتداد القارب (الطالب 35 kg والقارب 65 kg والصندوق 6 kg بسرعة 10 m/s).', hint: 'كتلة القارب مع الطالب 100 kg.', init: { m1: 4, v1: 5, m2: 150 }, check: (p) => p.m1 === 6 && p.v1 === 10 && p.m2 === 100, why: () => 'v₂f = −0.60 m/s.' },
      { q: 'اجعل القارب يرتد بسرعة 1 m/s أو أكثر.', hint: 'زد زخم الصندوق أو قلّل كتلة القارب.', init: { m1: 6, v1: 10, m2: 100 }, check: (p, d) => Math.abs(d.v2) >= 1, why: (p, d) => 'السرعة ' + n(Math.abs(d.v2), 3) + ' m/s.' }
    ],
    tutor: [
      { q: 'لماذا يتحرك القارب للخلف؟', k: ['للخلف', 'يرتد', 'لماذا'], a: () => K.tutor('ما الزخم الكلي قبل القذف؟', 'الزخم الكلي صفر، فيجب أن يكون زخم القارب مساوياً لزخم الصندوق ومعاكساً له.') },
      { q: 'متى يكون الزخم محفوظاً؟', k: ['محفوظ', 'معزول', 'شرط'], a: () => K.tutor('هل تؤثر قوة خارجية محصلة في النظام؟', 'عندما يكون النظام معزولاً (محصلة القوى الخارجية صفر).') },
      { q: 'كيف يعمل مهد نيوتن؟', k: ['مهد', 'نيوتن', 'كرات'], a: () => K.tutor('ماذا ينتقل عبر الكرات المتلاصقة؟', 'ينتقل الزخم (والطاقة) عبر الكرات فتندفع كرة من الطرف الآخر بالسرعة نفسها تقريباً.') }
    ]
  });

  /* ======================= نشاط (1-2) أنواع التصادمات: ارتداد الكرات ص17 ======================= */
  const BALLS = { iron: ['حديد', 0.35], glass: ['زجاج', 0.6], rubber: ['مطاط', 0.75], clay: ['معجون (صلصال)', 0] };
  K.reg({
    id: 'collision-types', unit: 2, order: 1, lesson: '2-2', lessonTitle: 'أنواع التصادمات', page: 17,
    titleAr: 'أنواع التصادمات: ارتفاع ارتداد الكرات', titleEn: 'Types of Collisions: Bouncing Balls', tags: 'تصادم مرن غير مرن عديم المرونة ارتداد كرة حديد زجاج مطاط معجون نشاط 1-2',
    formula: '\\Delta K = m g (h_2 - h_1)',
    book: 'نشاط (1-2) ص17: أسقط كرات من الحديد والزجاج والمطاط والمعجون من ارتفاع 1 m على سطح صلب أملس وسجّل ارتفاع الارتداد. النقص في طاقة الوضع يساوي الطاقة الحركية المفقودة.',
    summary: 'كلما كان ارتفاع الارتداد أقرب إلى ارتفاع السقوط كان التصادم أقرب إلى المرن (لا تُفقد طاقة حركية). كرة المعجون لا ترتد فتصادمها عديم المرونة، وبقية الكرات تصادمها غير مرن بدرجات مختلفة.',
    vars: [['h_1', 'ارتفاع السقوط', '\\mathrm{m}', '0.2 – 2 (الكتاب: 1)'], ['h_2', 'ارتفاع الارتداد', '\\mathrm{m}', '—'], ['m', 'كتلة الكرة', '\\mathrm{kg}', '0.1 – 1']],
    assumptions: ['نسبة ارتفاع الارتداد لكل نوع كرة لا يذكرها الكتاب: ' + Q.SIMPLE + '.', 'إهمال مقاومة الهواء.'],
    params: [
      { key: 'ball', label: '\\text{الكرة}', type: 'select', value: 'rubber', options: Object.keys(BALLS).map((k) => [k, BALLS[k][0]]) },
      { key: 'h', label: 'h_1\\ (\\mathrm{m})', min: 0.2, max: 2, step: 0.1, value: 1 },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.1, max: 1, step: 0.05, value: 0.2 }
    ],
    resetOn: ['ball', 'h'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    isDone: (st) => st.t >= 2.5,
    compute(p) { const h2 = p.h * BALLS[p.ball][1]; const dK = p.m * K.g * (h2 - p.h); return { h2: h2, dK: dK, type: h2 === 0 ? 'عديم المرونة' : 'غير مرن' }; },
    live(p, d) { return '\\Delta K = m g (h_2 - h_1) = ' + p.m + ' \\times 10 \\times (' + n(d.h2) + ' - ' + p.h + ') = ' + q(d.dK, 'J', 3); },
    results(p, d) { return [['ارتفاع الارتداد', q(d.h2, 'm', 3)], ['الطاقة الحركية المفقودة', q(-d.dK, 'J', 3)], ['نوع التصادم', d.type, false, 'pos']]; },
    steps(p, d) { return ['طاقة الوضع عند السقوط mgh₁ = ' + n(p.m * K.g * p.h) + ' J.', 'طاقة الوضع عند أقصى ارتداد mgh₂ = ' + n(p.m * K.g * d.h2) + ' J.', 'المفقود = ' + n(-d.dK) + ' J ← ' + d.type + '.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const g = K.g; const t = st.t; const floor = H * 0.85, top = H * 0.12; const Y = (h) => floor - (h / 2) * (floor - top);
      const tf = Math.sqrt(2 * p.h / g); let hNow; if (t < tf) hNow = p.h - 0.5 * g * t * t; else if (d.h2 <= 0) hNow = 0; else { const v = Math.sqrt(2 * g * d.h2), tu = 2 * v / g, tt = (t - tf) % tu; hNow = v * tt - 0.5 * g * tt * tt; }
      if (t < tf) hNow = p.h - 0.5 * g * t * t; else { const v = Math.sqrt(2 * g * d.h2); const tt = t - tf; const tu = 2 * v / g; hNow = d.h2 > 0 ? Math.max(0, v * (tt % (tu || 1)) - 0.5 * g * Math.pow(tt % (tu || 1), 2)) : 0; if (d.h2 > 0 && tt > tu) hNow = Math.max(0, hNow * 0.0 + (v * (tt - tu) - 0.5 * g * Math.pow(tt - tu, 2)) * 0); }
      ctx.strokeStyle = cols.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, floor + 10); ctx.lineTo(W - 20, floor + 10); ctx.stroke();
      [[p.h, cols.c1, 'h₁ = ' + p.h + ' m'], [d.h2, cols.c3, 'h₂ = ' + n(d.h2) + ' m']].forEach(([h, c, l]) => { ctx.strokeStyle = c; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(W * 0.3, Y(h)); ctx.lineTo(W * 0.7, Y(h)); ctx.stroke(); ctx.setLineDash([]); D.txt(ctx, l, W * 0.72, Y(h), { color: c, size: 12, w: '700', align: 'left' }); });
      const col = { iron: '#64748b', glass: 'rgba(125,211,252,.9)', rubber: '#dc2626', clay: '#a16207' }[p.ball]; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(W / 2, Y(Math.max(0, hNow)) - 12 + (p.ball === 'clay' && t > tf ? 6 : 0), 12, p.ball === 'clay' && t > tf ? 6 : 12, 0, 0, Math.PI * 2); ctx.fill();
      D.txt(ctx, BALLS[p.ball][0] + ': ' + d.type, W / 2, H * 0.06, { color: cols.text, size: 15, w: '700' });
    },
    graph(p, d) { const items = Object.keys(BALLS).map((k) => [BALLS[k][0], p.h * BALLS[k][1]]); return { view: { xmin: 0, xmax: 4, ymin: 0, ymax: p.h * 1.3 }, xLabel: '', yLabel: 'h₂ (m)', caption: 'ارتفاع الارتداد لكل كرة عند السقوط من ' + p.h + ' m (' + Q.SIMPLE + ').', draw(G) { const c = G.colors(); K.bars(G, items.map((x, i) => [x[0], x[1], [c.c5, c.c1, c.c2, c.c4][i]])); G.hline(p.h, { color: c.muted, dash: [6, 4] }); } }; },
    explain(a, b, da, db) { return a.ball !== b.ball ? [BALLS[b.ball][0] + ': ترتد إلى ' + n(db.h2) + ' m، فالتصادم ' + db.type + '.'] : []; },
    learn: ['**التصادم المرن:** الزخم والطاقة الحركية محفوظان.', '**غير المرن:** الزخم محفوظ، وتتحول جزء من الطاقة الحركية إلى صوت وحرارة وتشوه.', '**عديم المرونة:** يلتحم الجسمان ويتحركان معاً، وهو أكبر فقد للطاقة الحركية.'],
    challenges: [
      { q: 'اختر الكرة التي يكون تصادمها مع الأرض عديم المرونة.', hint: 'الكرة التي لا ترتد.', init: { ball: 'rubber' }, check: (p) => p.ball === 'clay', why: () => 'المعجون يلتصق بالأرض ولا يرتد.' },
      { q: 'اختر الكرة الأقرب إلى التصادم المرن.', hint: 'أعلى ارتفاع ارتداد.', init: { ball: 'clay' }, check: (p) => p.ball === 'rubber', why: () => 'المطاط يرتد أعلى من غيره فيفقد طاقة أقل.' }
    ],
    tutor: [
      { q: 'ما الفرق بين التصادم المرن وغير المرن؟', k: ['فرق', 'مرن'], a: () => K.tutor('أي كمية تُحفظ دائماً؟ وأيها لا تُحفظ في غير المرن؟', 'الزخم محفوظ في كل التصادمات، والطاقة الحركية محفوظة فقط في المرن.') },
      { q: 'أين تذهب الطاقة المفقودة؟', k: ['تذهب', 'مفقوده'], a: () => K.tutor('ماذا تسمع وترى عند اصطدام الكرة؟', 'تتحول إلى صوت وحرارة وتشوه في الأجسام.') },
      { q: 'كيف أحسب الطاقة المفقودة؟', k: ['احسب', 'طاقه'], a: (p, d) => K.tutor('قارن طاقة الوضع عند الارتفاعين.', 'ΔK = mg(h₂ − h₁) = ' + n(d.dK) + ' J.') }
    ]
  });

  /* ======================= التصادم في بعد واحد (السكة الهوائية) ص18–24 ======================= */
  K.reg({
    id: 'collision-1d', unit: 2, order: 2, lesson: '2-2', lessonTitle: 'التصادم المرن وغير المرن وعديم المرونة', page: 21,
    titleAr: 'التصادم في بعد واحد على السكة الهوائية', titleEn: 'One-Dimensional Collisions on an Air Track', tags: 'تصادم مرن غير مرن عديم المرونة سكة هوائية عربات حفظ الزخم الطاقة الحركية نشاط 2-2 مثال 1 مثال 2',
    formula: 'm_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f}',
    book: 'نشاط (2-2) ص18 (السكة الهوائية)، والقوانين (2-1) و(2-2) و(2-3) و(2-4). مثال (1) ص21: 4 kg بسرعة 2 m/s و2 kg بسرعة −2 m/s مرن ⇒ −2/3 و 10/3 m/s. مثال (2) ص22: 2 kg بسرعة −6 m/s و3 kg بسرعة 4 m/s، وسرعة الأولى بعده 4.5 m/s.',
    summary: 'الزخم محفوظ في كل التصادمات. في المرن تُحفظ الطاقة الحركية أيضاً والسرعة النسبية بعد التصادم تساوي السرعة النسبية قبله وتعاكسها (2-3). في عديم المرونة يلتحم الجسمان. وفي غير المرن تُفقد جزء من الطاقة.',
    vars: [['m_1, m_2', 'كتلتا العربتين', '\\mathrm{kg}', '0.5 – 10'], ['v_{1i}, v_{2i}', 'سرعتاهما قبل التصادم (+ يمين)', '\\mathrm{m/s}', '−10 – 10'], ['e', 'نسبة السرعة النسبية بعد التصادم إلى قبله', '—', '0 – 1']],
    assumptions: ['السكة الهوائية بلا احتكاك.', 'النسبة e في التصادم غير المرن ليست من الكتاب: ' + Q.SIMPLE + '؛ قيمتها 0.75 تعيد مثال (2).'],
    params: [
      { key: 'type', label: '\\text{نوع التصادم}', type: 'select', value: 'elastic', options: [['elastic', 'مرن'], ['inelastic', 'غير مرن'], ['perfect', 'عديم المرونة (التحام)']] },
      { key: 'm1', label: 'm_1\\ (\\mathrm{kg})', min: 0.5, max: 10, step: 0.5, value: 4 },
      { key: 'm2', label: 'm_2\\ (\\mathrm{kg})', min: 0.5, max: 10, step: 0.5, value: 2 },
      { key: 'u1', label: 'v_{1i}\\ (\\mathrm{m/s})', min: -10, max: 10, step: 0.5, value: 2 },
      { key: 'u2', label: 'v_{2i}\\ (\\mathrm{m/s})', min: -10, max: 10, step: 0.5, value: -2 },
      { key: 'e', label: 'e', min: 0, max: 1, step: 0.05, value: 0.75, hidden: (p) => p.type !== 'inelastic' }
    ],
    resetOn: ['type', 'm1', 'm2', 'u1', 'u2', 'e'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    isDone: (st) => st.t >= 4,
    compute(p) {
      let r; if (p.type === 'elastic') r = Q.elastic1D(p.m1, p.m2, p.u1, p.u2); else if (p.type === 'perfect') r = Q.inelastic1D(p.m1, p.m2, p.u1, p.u2);
      else { const vc = (p.m1 * p.u1 + p.m2 * p.u2) / (p.m1 + p.m2); r = { v1: vc - p.e * p.m2 * (p.u1 - p.u2) / (p.m1 + p.m2), v2: vc + p.e * p.m1 * (p.u1 - p.u2) / (p.m1 + p.m2) }; }
      const Pi = p.m1 * p.u1 + p.m2 * p.u2, Pf = p.m1 * r.v1 + p.m2 * r.v2; const Ki = Q.ke(p.m1, p.u1) + Q.ke(p.m2, p.u2), Kf = Q.ke(p.m1, r.v1) + Q.ke(p.m2, r.v2);
      return { v1: r.v1, v2: r.v2, Pi: Pi, Pf: Pf, Ki: Ki, Kf: Kf, dK: Kf - Ki, meet: p.u1 > p.u2 };
    },
    live(p, d) { return p.m1 + '(' + p.u1 + ') + ' + p.m2 + '(' + p.u2 + ') = ' + p.m1 + '(' + K.n(d.v1, 3) + ') + ' + p.m2 + '(' + K.n(d.v2, 3) + ')'; },
    results(p, d) {
      if (!d.meet) return [['الحالة', 'العربتان لا تلتقيان: اجعل v₁ᵢ > v₂ᵢ', false, 'neg']];
      return [['v₁f', q(d.v1, 'm/s', 4)], ['v₂f', q(d.v2, 'm/s', 4)], ['ΣPi = ΣPf', q(d.Pi, 'kg\\,m/s') + ' = ' + q(d.Pf, 'kg\\,m/s'), true, 'pos'], ['ΣKi', q(d.Ki, 'J')], ['ΣKf', q(d.Kf, 'J')], ['ΔK', q(d.dK, 'J'), true, Math.abs(d.dK) < 1e-9 ? 'pos' : 'neg']];
    },
    steps(p, d) {
      const o = ['حفظ الزخم: ' + p.m1 + '(' + p.u1 + ') + ' + p.m2 + '(' + p.u2 + ') = ' + K.n(d.Pi) + ' kg.m/s.'];
      if (p.type === 'elastic') o.push('مرن: v₁ᵢ − v₂ᵢ = −(v₁f − v₂f) ⇒ ' + (p.u1 - p.u2) + ' = −(' + K.n(d.v1, 3) + ' − ' + K.n(d.v2, 3) + ').');
      if (p.type === 'perfect') o.push('التحام: v_f = ΣP ÷ (m₁ + m₂) = ' + K.n(d.v1, 3) + ' m/s.');
      o.push('ΔK = ' + K.n(d.dK, 3) + ' J.'); return o;
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const y = H * 0.6, sc = Math.min(W / 22, 40); const gap0 = 6 * sc;
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(10, y + 4, W - 20, 10); for (let x = 20; x < W - 20; x += 16) { ctx.fillStyle = cols.bg; ctx.fillRect(x, y + 7, 3, 3); }
      const w1 = 30 + p.m1 * 6, w2 = 30 + p.m2 * 6; const x10 = W / 2 - gap0 / 2 - w1 / 2, x20 = W / 2 + gap0 / 2 + w2 / 2;
      const tc = d.meet ? (x20 - w2 / 2 - (x10 + w1 / 2)) / ((p.u1 - p.u2) * sc) : Infinity; const t = st.t;
      let x1, x2; if (t < tc) { x1 = x10 + p.u1 * sc * t; x2 = x20 + p.u2 * sc * t; } else { const c1 = x10 + p.u1 * sc * tc, c2 = x20 + p.u2 * sc * tc; x1 = c1 + d.v1 * sc * (t - tc); x2 = c2 + d.v2 * sc * (t - tc); }
      K.cart(ctx, x1, y, w1, 34, cols.c1, p.m1 + ' kg', cols); K.cart(ctx, x2, y, w2, 34, cols.c2, p.m2 + ' kg', cols);
      const after = t >= tc; K.vec(ctx, x1, y - 50, (after ? d.v1 : p.u1) * 8, 0, cols.c1, (after ? 'v₁f' : 'v₁ᵢ'), cols); K.vec(ctx, x2, y - 70, (after ? d.v2 : p.u2) * 8, 0, cols.c2, (after ? 'v₂f' : 'v₂ᵢ'), cols);
      D.txt(ctx, { elastic: 'تصادم مرن', inelastic: 'تصادم غير مرن', perfect: 'تصادم عديم المرونة' }[p.type] + (after ? ' — بعد التصادم' : ' — قبل التصادم'), W / 2, H * 0.12, { color: cols.text, size: 15, w: '700' });
    },
    graphModes: ['الزخم', 'الطاقة الحركية'],
    graph(p, d, gi) {
      if (gi === 1) return { view: K.barView([d.Ki, d.Kf]), xLabel: '', yLabel: 'K (J)', caption: 'الطاقة الحركية قبل وبعد: ' + (Math.abs(d.dK) < 1e-9 ? 'محفوظة (مرن).' : 'نقصت بمقدار ' + K.n(-d.dK, 3) + ' J.'), draw(G) { const c = G.colors(); K.bars(G, [['قبل', d.Ki, c.c1], ['بعد', d.Kf, c.c2]]); } };
      return { view: K.barView([d.Pi, d.Pf]), xLabel: '', yLabel: 'P (kg.m/s)', caption: 'الزخم الكلي قبل التصادم يساوي الزخم الكلي بعده.', draw(G) { const c = G.colors(); K.bars(G, [['قبل', d.Pi, c.c1], ['بعد', d.Pf, c.c2]]); } };
    },
    explain(a, b, da, db) { const o = []; if (a.type !== b.type) o.push(b.type === 'elastic' ? 'المرن: تُحفظ الطاقة الحركية.' : b.type === 'perfect' ? 'عديم المرونة: تلتحم العربتان وتتحركان بسرعة واحدة، وأكبر فقد للطاقة.' : 'غير المرن: تُفقد جزء من الطاقة الحركية.'); return o; },
    learn: ['**حفظ الزخم (2-1):** m₁v₁ᵢ + m₂v₂ᵢ = m₁v₁f + m₂v₂f.', '**المرن (2-2) و(2-3):** تُحفظ الطاقة الحركية، و v₁ᵢ − v₂ᵢ = −(v₁f − v₂f).', '**عديم المرونة (2-4):** m₁v₁ᵢ + m₂v₂ᵢ = (m₁ + m₂)v_f.', '**مثال (2):** ΣKi = 60 J، ΣKf = 33.75 J، فالتصادم غير مرن، والقوة على الكرة الثانية −1050 N خلال 0.02 s.'],
    challenges: [
      { q: 'مثال (1): أوجد السرعتين بعد تصادم مرن بين 4 kg (2 m/s) و2 kg (−2 m/s).', hint: 'اختر «مرن» واضبط القيم.', init: { type: 'perfect', m1: 2, m2: 2, u1: 3, u2: 0 }, check: (p) => p.type === 'elastic' && p.m1 === 4 && p.m2 === 2 && p.u1 === 2 && p.u2 === -2, why: () => 'v₁f = −2/3 m/s و v₂f = 10/3 m/s.' },
      { q: 'مثال (2): كرة 2 kg بسرعة 6 m/s غرباً (−6) وكرة 3 kg بسرعة 4 m/s شرقاً؛ اجعل سرعة الأولى بعد التصادم 4.5 m/s.', hint: 'تصادم غير مرن، وجرّب e.', init: { type: 'elastic', m1: 4, m2: 2, u1: 2, u2: -2 }, check: (p, d) => p.type === 'inelastic' && p.m1 === 2 && p.m2 === 3 && p.u1 === -6 && p.u2 === 4 && Math.abs(d.v1 - 4.5) < 0.01, why: () => 'v₂f = −3 m/s، و ΔK = −26.25 J.' },
      { q: 'اجعل العربتين تلتحمان وتتوقفان تماماً بعد التصادم.', hint: 'الزخم الكلي يجب أن يساوي صفراً.', init: { type: 'elastic', m1: 4, m2: 2, u1: 2, u2: -2 }, check: (p, d) => p.type === 'perfect' && d.meet && Math.abs(d.Pi) < 1e-9, why: () => 'زخماهما متساويان ومتعاكسان.' }
    ],
    tutor: [
      { q: 'هل الطاقة الحركية محفوظة هنا؟', k: ['محفوظه', 'طاقه'], a: (p, d) => K.tutor('قارن ΣKi بـ ΣKf.', Math.abs(d.dK) < 1e-9 ? 'نعم، التصادم مرن.' : 'لا؛ نقصت ' + K.n(-d.dK, 3) + ' J.') },
      { q: 'كيف أجد السرعتين بعد التصادم المرن؟', k: ['مرن', 'سرعتين', 'احسب'], a: (p, d) => K.tutor('استخدم معادلتين: حفظ الزخم والسرعة النسبية (2-3).', 'v₁f = ' + K.n(d.v1, 3) + ' و v₂f = ' + K.n(d.v2, 3) + ' m/s.') },
      { q: 'لماذا تلتحم العربتان؟', k: ['تلتحم', 'التحام'], a: () => K.tutor('ما نوع التصادم الذي يتحرك فيه الجسمان معاً؟', 'في التصادم عديم المرونة يلتصق الجسمان ويتحركان بسرعة واحدة.') }
    ]
  });

  /* ======================= مثال (3) البندول القذفي ص25 ======================= */
  K.reg({
    id: 'ballistic-pendulum', unit: 2, order: 3, lesson: '2-2', lessonTitle: 'التصادم عديم المرونة', page: 25,
    titleAr: 'البندول القذفي: قياس سرعة رصاصة', titleEn: 'The Ballistic Pendulum', tags: 'بندول قذفي رصاصة كتلة خشبية عديم المرونة ارتفاع سرعة مثال 3 مشروع',
    formula: 'v_f = \\sqrt{2 g h} ,\\qquad m v_{1i} = (m + M) v_f',
    book: 'مثال (3) ص25: رصاصة 30 g تستقر في كتلة خشبية 4.97 kg فترتفع المجموعة 8 cm؛ v_f = 1.26 m/s و v_{1i} = 210 m/s، والطاقة المفقودة 657.5 J. مشروع (1): تصميم نموذج للبندول القذفي.',
    summary: 'تستقر الرصاصة في الكتلة الخشبية (تصادم عديم المرونة يُحفظ فيه الزخم)، ثم تتأرجح المجموعة إلى ارتفاع h (تُحفظ الطاقة الميكانيكية). من h نحسب سرعة المجموعة، ومنها سرعة الرصاصة.',
    vars: [['m', 'كتلة الرصاصة', '\\mathrm{kg}', '0.005 – 0.1'], ['M', 'كتلة القطعة الخشبية', '\\mathrm{kg}', '1 – 10'], ['h', 'ارتفاع المجموعة', '\\mathrm{m}', '0.01 – 0.3'], ['v_{1i}', 'سرعة الرصاصة', '\\mathrm{m/s}', '—']],
    assumptions: ['g = 10 m/s² كما في حلول الكتاب، وإهمال كتلة الحبلين ومقاومة الهواء.'],
    params: [
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.005, max: 0.1, step: 0.005, value: 0.03 },
      { key: 'M', label: 'M\\ (\\mathrm{kg})', min: 1, max: 10, step: 0.01, value: 4.97 },
      { key: 'h', label: 'h\\ (\\mathrm{m})', min: 0.01, max: 0.3, step: 0.01, value: 0.08 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    isDone: (st) => st.t >= 3,
    compute(p) { const vf = Math.sqrt(2 * K.g * p.h); const v = (p.m + p.M) * vf / p.m; const Ki = Q.ke(p.m, v), Kf = Q.ke(p.m + p.M, vf); return { vf: vf, v: v, Ki: Ki, Kf: Kf, dK: Kf - Ki }; },
    live(p, d) { return 'v_{1i} = \\frac{m + M}{m}\\sqrt{2gh} = \\frac{' + K.n(p.m + p.M) + '}{' + p.m + '} \\times ' + K.n(d.vf, 3) + ' = ' + q(d.v, 'm/s', 4); },
    results(p, d) { return [['سرعة المجموعة بعد التصادم v_f', q(d.vf, 'm/s', 3)], ['سرعة الرصاصة v₁ᵢ', q(d.v, 'm/s', 4), true, 'pos'], ['الطاقة الحركية قبل', q(d.Ki, 'J')], ['الطاقة الحركية بعد', q(d.Kf, 'J')], ['الطاقة المفقودة', q(-d.dK, 'J')]]; },
    steps(p, d) { return ['بعد التصادم: ½(m+M)v_f² = (m+M)gh ⇒ v_f = √(2gh) = ' + K.n(d.vf, 3) + ' m/s.', 'حفظ الزخم: m v₁ᵢ = (m + M) v_f ⇒ v₁ᵢ = ' + K.n(d.v, 4) + ' m/s.', 'ΔK = ' + K.n(d.Kf, 3) + ' − ' + K.n(d.Ki, 3) + ' = ' + K.n(d.dK, 3) + ' J.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const t = st.t; const px = W * 0.55, py = H * 0.12, L = H * 0.55; const hit = 0.6;
      const thMax = Math.acos(1 - Math.min(1.5, p.h / 0.5)); const th = t < hit ? 0 : thMax * Math.sin((t - hit) * 2.2);
      const bx = px + Math.sin(th) * L, by = py + Math.cos(th) * L;
      ctx.strokeStyle = cols.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 30, py); ctx.lineTo(bx - 30, by); ctx.moveTo(px + 30, py); ctx.lineTo(bx + 30, by); ctx.stroke(); ctx.fillStyle = '#475569'; ctx.fillRect(px - 60, py - 8, 120, 8);
      ctx.fillStyle = '#b45309'; ctx.fillRect(bx - 40, by, 80, 46);
      if (t < hit) { const x = W * 0.05 + (bx - 40 - W * 0.05) * t / hit; ctx.fillStyle = cols.text; ctx.fillRect(x, by + 20, 14, 5); }
      ctx.strokeStyle = cols.c3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(W * 0.3, py + L + 46); ctx.lineTo(W * 0.95, py + L + 46); ctx.moveTo(W * 0.3, py + L + 46 - Math.min(H * 0.3, p.h * H * 1.2)); ctx.lineTo(W * 0.95, py + L + 46 - Math.min(H * 0.3, p.h * H * 1.2)); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, 'h = ' + K.n(p.h * 100, 1) + ' cm', W * 0.2, py + L + 46 - Math.min(H * 0.15, p.h * H * 0.6), { color: cols.c3, size: 13, w: '700' });
      D.txt(ctx, 'v₁ᵢ = ' + K.n(d.v, 1) + ' m/s', W * 0.2, H * 0.12, { color: cols.c2, size: 15, w: '700' });
    },
    graph(p, d) { const hm = 0.3; return { view: { xmin: 0, xmax: hm * 100, ymin: 0, ymax: (p.m + p.M) / p.m * Math.sqrt(2 * K.g * hm) * 1.1 }, xLabel: 'h (cm)', yLabel: 'v₁ᵢ (m/s)', caption: 'سرعة الرصاصة تتناسب مع الجذر التربيعي للارتفاع.', draw(G) { const c = G.colors(); G.fn((x) => (p.m + p.M) / p.m * Math.sqrt(2 * K.g * x / 100), { color: c.c1, width: 3, domain: [0, hm * 100] }); G.point(p.h * 100, d.v, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.h !== b.h) o.push('ارتفاع أكبر يعني سرعة مجموعة أكبر، فالرصاصة كانت أسرع: ' + K.n(db.v, 1) + ' m/s.'); if (a.m !== b.m || a.M !== b.M) o.push('النسبة (m + M)/m تحدد كم مرة تكون سرعة الرصاصة أكبر من سرعة المجموعة.'); return o; },
    learn: ['**البندول القذفي (ص25):** كتلة خشبية كبيرة معلقة بحبلين متوازيين، تستقر فيها الرصاصة.', '**مرحلتان:** تصادم عديم المرونة (الزخم محفوظ) ثم تأرجح (الطاقة الميكانيكية محفوظة).', '**مثال (3):** v_f = √(2×10×0.08) = 1.26 m/s، و0.03 v₁ᵢ = 5 × 1.26 ⇒ v₁ᵢ = 210 m/s.'],
    challenges: [
      { q: 'أعد مثال الكتاب: رصاصة 30 g، كتلة 4.97 kg، ارتفاع 8 cm.', hint: 'h = 0.08 m.', init: { m: 0.01, M: 2, h: 0.05 }, check: (p) => p.m === 0.03 && Math.abs(p.M - 4.97) < 1e-9 && Math.abs(p.h - 0.08) < 1e-9, why: () => 'v₁ᵢ ≈ 210 m/s.' },
      { q: 'اجعل سرعة الرصاصة أكبر من 400 m/s.', hint: 'زد الارتفاع أو الكتلة الخشبية، أو قلّل كتلة الرصاصة.', init: { m: 0.03, M: 4.97, h: 0.08 }, check: (p, d) => d.v > 400, why: (p, d) => K.n(d.v, 1) + ' m/s.' }
    ],
    tutor: [
      { q: 'لماذا نستخدم مرحلتين في الحل؟', k: ['مرحلتين', 'لماذا'], a: () => K.tutor('هل الطاقة الحركية محفوظة أثناء استقرار الرصاصة؟', 'أثناء التصادم يُحفظ الزخم فقط (عديم المرونة)، وبعده أثناء التأرجح تُحفظ الطاقة الميكانيكية.') },
      { q: 'أين ذهبت معظم طاقة الرصاصة؟', k: ['طاقه', 'ذهبت'], a: (p, d) => K.tutor('قارن الطاقة قبل وبعد.', 'فُقد ' + K.n(-d.dK, 1) + ' J حرارة وتشوهاً في الخشب.') },
      { q: 'كيف أحسب سرعة الرصاصة؟', k: ['احسب', 'سرعه'], a: (p, d) => K.tutor('ابدأ من الارتفاع h.', 'v_f = √(2gh) = ' + K.n(d.vf, 3) + '، ثم v₁ᵢ = (m+M)v_f/m = ' + K.n(d.v, 1) + ' m/s.') }
    ]
  });

  /* ======================= 3-2 التصادم في بعدين ص26–27 ======================= */
  K.reg({
    id: 'collision-2d', unit: 2, order: 4, lesson: '3-2', lessonTitle: 'التصادم في بعدين', page: 27,
    titleAr: 'التصادم في بعدين: التحام سيارتين عند تقاطع', titleEn: 'Two-Dimensional Collision at an Intersection', tags: 'تصادم بعدين التحام سيارتين زاوية مركبات الزخم شرق شمال مثال 4 حوادث',
    formula: 'm_1 v_{1i} = (m_1 + m_2) v_f \\cos\\theta ,\\quad m_2 v_{2i} = (m_1 + m_2) v_f \\sin\\theta',
    book: 'القانونان (2-5) و(2-6) ص26. مثال (4) ص27: سيارة شرقاً بسرعة 13 m/s وأخرى مماثلة الكتلة شمالاً، التحمتا وتحرك الحطام بزاوية 55° شمال الشرق: v_f = 11.33 m/s و v_{2i} = 18.56 m/s (66.8 km/h).',
    summary: 'في التصادم في بعدين يُحفظ الزخم على كل محور على حدة. عند الالتحام يتحرك الحطام بسرعة واحدة، ومن زاوية حركته يمكن معرفة سرعة كل سيارة قبل التصادم.',
    vars: [['m_1, m_2', 'كتلتا السيارتين', '\\mathrm{kg}', '500 – 3000'], ['v_{1i}', 'سرعة السيارة المتجهة شرقاً', '\\mathrm{m/s}', '0 – 30'], ['v_{2i}', 'سرعة السيارة المتجهة شمالاً', '\\mathrm{m/s}', '0 – 30'], ['\\theta', 'زاوية حركة الحطام شمال الشرق', '^\\circ', '—']],
    assumptions: ['إهمال الاحتكاك أثناء التصادم القصير.'],
    params: [
      { key: 'm1', label: 'm_1\\ (\\mathrm{kg})', min: 500, max: 3000, step: 50, value: 1000 },
      { key: 'm2', label: 'm_2\\ (\\mathrm{kg})', min: 500, max: 3000, step: 50, value: 1000 },
      { key: 'v1', label: 'v_{1i}\\ (\\mathrm{m/s})', min: 0, max: 30, step: 0.1, value: 13 },
      { key: 'v2', label: 'v_{2i}\\ (\\mathrm{m/s})', min: 0, max: 30, step: 0.1, value: 10 }
    ],
    compute(p) { const M = p.m1 + p.m2; const px = p.m1 * p.v1, py = p.m2 * p.v2; const vf = Math.hypot(px, py) / M; const th = Math.atan2(py, px) * 180 / Math.PI; return { vf: vf, th: th, px: px, py: py, kmh: p.v2 * 3.6 }; },
    live(p, d) { return 'v_f = \\frac{\\sqrt{(' + p.m1 + '\\times' + p.v1 + ')^2 + (' + p.m2 + '\\times' + p.v2 + ')^2}}{' + (p.m1 + p.m2) + '} = ' + q(d.vf, 'm/s', 4) + ' ,\\ \\theta = ' + K.n(d.th, 2) + '^\\circ'; },
    results(p, d) { return [['سرعة الحطام v_f', q(d.vf, 'm/s', 4)], ['الزاوية θ شمال الشرق', K.n(d.th, 2) + '^\\circ', true, 'pos'], ['سرعة السيارة الثانية', K.n(p.v2, 2) + '\\ \\mathrm{m/s} = ' + K.n(d.kmh, 1) + '\\ \\mathrm{km/h}']]; },
    steps(p, d) { return ['محور x: m₁v₁ᵢ = (m₁ + m₂) v_f cosθ = ' + K.n(d.px) + ' kg.m/s.', 'محور y: m₂v₂ᵢ = (m₁ + m₂) v_f sinθ = ' + K.n(d.py) + ' kg.m/s.', 'tanθ = ' + K.n(d.py) + ' ÷ ' + K.n(d.px) + ' ⇒ θ = ' + K.n(d.th, 2) + '°.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W * 0.45, cy = H * 0.62; ctx.fillStyle = 'rgba(148,163,184,.25)'; ctx.fillRect(0, cy - 30, W, 60); ctx.fillRect(cx - 30, 0, 60, H);
      K.cart(ctx, cx - 140, cy + 10, 60, 26, cols.c1, '1', cols); K.vec(ctx, cx - 110, cy - 20, p.v1 * 5, 0, cols.c1, 'v₁ᵢ', cols);
      ctx.save(); ctx.translate(cx + 8, cy + 120); ctx.rotate(-Math.PI / 2); K.cart(ctx, 0, 0, 60, 26, cols.c2, '2', cols); ctx.restore(); K.vec(ctx, cx + 40, cy + 110, 0, -p.v2 * 5, cols.c2, 'v₂ᵢ', cols);
      const L = Math.min(W * 0.35, d.vf * 12); const a = d.th * Math.PI / 180; K.vec(ctx, cx, cy, Math.cos(a) * L, -Math.sin(a) * L, cols.c3, 'v_f', cols, 4);
      ctx.strokeStyle = cols.muted; ctx.beginPath(); ctx.arc(cx, cy, 40, -a, 0); ctx.stroke(); D.txt(ctx, 'θ = ' + K.n(d.th, 1) + '°', cx + 60, cy - 14, { color: cols.text, size: 13, w: '700', align: 'left' });
      D.txt(ctx, 'N ↑   E →', W - 60, 24, { color: cols.muted, size: 12, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 30, ymin: 0, ymax: 90 }, xLabel: 'v₂ᵢ (m/s)', yLabel: 'θ (°)', caption: 'زاوية الحطام مع سرعة السيارة الثانية (v₁ᵢ والكتلتان ثابتة).', draw(G) { const c = G.colors(); G.fn((x) => Math.atan2(p.m2 * x, p.m1 * p.v1) * 180 / Math.PI, { color: c.c1, width: 3, domain: [0, 30] }); G.point(p.v2, d.th, { color: c.c2 }); } }; },
    explain(a, b, da, db) { return a.v2 !== b.v2 || a.v1 !== b.v1 ? ['زاوية الحطام ' + K.n(db.th, 1) + '°: كلما زاد زخم السيارة الشمالية مال الحطام نحو الشمال.'] : []; },
    learn: ['**في بعدين:** يُحفظ الزخم على محوري x و y كلّ على حدة (2-5) و(2-6).', '**عند الالتحام:** m₁v₁ᵢₓ + m₂v₂ᵢₓ = (m₁ + m₂)v_f cosθ ، و m₁v₁ᵢᵧ + m₂v₂ᵢᵧ = (m₁ + m₂)v_f sinθ.', '**مثال (4):** v₂ᵢ = 2 × 11.33 × sin55° = 18.56 m/s = 66.8 km/h، فادعاء السائق (60 km/h) غير صحيح.'],
    challenges: [
      { q: 'مثال (4): سيارتان متماثلتان، الأولى 13 m/s شرقاً؛ اجعل الحطام يتحرك بزاوية 55° شمال الشرق.', hint: 'غيّر سرعة السيارة الثانية حتى θ ≈ 55°.', init: { m1: 1000, m2: 1000, v1: 13, v2: 10 }, check: (p, d) => p.m1 === p.m2 && p.v1 === 13 && Math.abs(d.th - 55) < 0.2, why: (p, d) => 'v₂ᵢ ≈ ' + K.n(p.v2, 1) + ' m/s ≈ ' + K.n(d.kmh, 1) + ' km/h أكبر من 60 km/h.' },
      { q: 'اجعل الحطام يتحرك بزاوية 45° تماماً.', hint: 'يجب أن يتساوى زخما السيارتين.', init: { m1: 1000, m2: 1500, v1: 13, v2: 13 }, check: (p, d) => Math.abs(d.th - 45) < 0.05, why: () => 'زخما السيارتين متساويان.' }
    ],
    tutor: [
      { q: 'كيف أطبّق حفظ الزخم في بعدين؟', k: ['بعدين', 'محور', 'كيف'], a: () => K.tutor('هل يؤثر الزخم على x في الزخم على y؟', 'طبّق حفظ الزخم على كل محور على حدة، ثم اجمع المركبتين بفيثاغورس.') },
      { q: 'هل كان السائق صادقاً في مثال (4)؟', k: ['السائق', 'صادق', 'ادعاء'], a: () => K.tutor('حوّل 18.56 m/s إلى km/h.', 'لا؛ 18.56 m/s = 66.8 km/h أكبر من 60 km/h.') },
      { q: 'كيف أحسب الزاوية؟', k: ['زاويه', 'احسب'], a: (p, d) => K.tutor('ما النسبة بين المركبتين؟', 'tanθ = m₂v₂ᵢ ÷ m₁v₁ᵢ ⇒ θ = ' + K.n(d.th, 2) + '°.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
