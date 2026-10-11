/* الفيزياء — الوحدة الثالثة، الفصل الأول: الحرارة وأثرها على المواد (ص 85–106) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 6; const q = P.q;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);
  const NAME = P.materialName;
  const SH = Object.keys(P.specificHeat).filter((k) => k !== 'ice');
  const SHOPT = SH.map((k) => [k, NAME[k] + ' (' + P.specificHeat[k] + ')']);
  const METALS = ['aluminium', 'iron', 'copper', 'silver', 'gold', 'lead', 'bismuth'];
  // لون حراري بسيط (أزرق بارد ← أحمر ساخن)
  function heatColor(T) { const t = M.clamp((T + 20) / 140, 0, 1); const r = Math.round(40 + 215 * t), b = Math.round(230 - 200 * t), g = Math.round(110 - 40 * Math.abs(t - 0.5)); return 'rgb(' + r + ',' + g + ',' + b + ')'; }
  function thermo(ctx, x, top, bot, T, Tmin, Tmax, c, label) {
    ctx.strokeStyle = c.axis; ctx.lineWidth = 2; D.rr(ctx, x - 7, top, 14, bot - top, 7); ctx.stroke();
    ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(x, bot + 6, 11, 0, 7); ctx.fill();
    const h = (bot - top - 6) * M.clamp((T - Tmin) / (Tmax - Tmin), 0, 1); ctx.fillRect(x - 3.5, bot - h, 7, h + 4);
    D.txt(ctx, f2(T, 1) + ' °C', x, top - 12, { color: c.text, size: 12, w: '700' }); if (label) D.txt(ctx, label, x, bot + 28, { color: c.muted, size: 11 });
  }

  /* ======================= 1-2 الحرارة النوعية والسعة الحرارية ======================= */
  ML.register({
    subject: S, id: 'specific-heat', unit: U, order: 1, lesson: '1-2', lessonTitle: 'السعة الحرارية والحرارة النوعية', page: 88,
    titleAr: 'كمية الحرارة والحرارة النوعية', titleEn: 'Heat, Heat Capacity & Specific Heat', tags: 'كميه الحراره حراره نوعيه سعه حراريه تسخين جول',
    formula: 'Q = m\\,c\\,\\Delta T,\\qquad C = m\\,c',
    book: 'كح = ك × حن × Δد ، سح = ك × حن (ص 89–90)',
    summary: 'كمية الحرارة اللازمة لتغيير درجة حرارة جسم تتناسب طردياً مع كتلته ومع التغير في درجة حرارته، وتعتمد على نوع مادته من خلال الحرارة النوعية. المواد ذات الحرارة النوعية الكبيرة (كالماء) تحتاج حرارة أكبر لتسخن.',
    vars: [['m', 'الكتلة', '\\mathrm{kg}', '0.1 – 10'], ['c', 'الحرارة النوعية للمادة', '\\mathrm{J/(kg\\cdot ^\\circ C)}', 'من جدول (1) ص 90'], ['T_1,\\ T_2', 'درجتا الحرارة الابتدائية والنهائية', '^\\circ\\mathrm{C}', '0 – 100 (بلا تغير حالة)'], ['Q', 'كمية الحرارة', '\\mathrm{J}', 'موجبة: مكتسبة، سالبة: مفقودة'], ['C', 'السعة الحرارية', '\\mathrm{J/^\\circ C}', 'C = mc']],
    assumptions: ['لا يحدث تغير في حالة المادة ضمن مدى درجات الحرارة المختار.', 'الحرارة النوعية ثابتة في هذا المدى، وبإهمال الحرارة المفقودة للوسط.'],
    params: [
      { key: 'mat', label: '\\text{material}', type: 'select', options: SHOPT, value: 'aluminium', desc: 'المادة' },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.1, max: 10, step: 0.1, value: 3 },
      { key: 'T1', label: 'T_1\\ (^\\circ\\mathrm{C})', min: 0, max: 100, step: 1, value: 20 },
      { key: 'T2', label: 'T_2\\ (^\\circ\\mathrm{C})', min: 0, max: 100, step: 1, value: 50 }
    ],
    resetOn: ['mat', 'm', 'T1', 'T2'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, Qs: 0 }),
    tick(st, p, d, dt) { st.t += dt; const rate = Math.abs(d.Q) / 4 || 1; st.Qs = Math.min(Math.abs(d.Q), st.Qs + rate * dt); },
    isDone: (st, p, d) => st.Qs >= Math.abs(d.Q) - 1e-9,
    custom: true, canvasHint: 'اضغط «تشغيل» لتزويد الجسم بالحرارة تدريجياً (أو سحبها منه) وراقب درجة الحرارة.',
    graphModes: ['درجة الحرارة – الحرارة', 'Q – Δd لعدة مواد'],
    compute(p) { const c = P.specificHeat[p.mat]; const dT = p.T2 - p.T1; const Q = P.heat(p.m, c, dT); const C = P.heatCapacity(p.m, c); const Qw = P.heat(p.m, P.specificHeat.water, dT); return { c: c, dT: dT, Q: Q, C: C, Qw: Qw }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { Qs: 0 }; const sgn = Math.sign(d.dT) || 1; const T = d.Q === 0 ? p.T1 : p.T1 + sgn * st.Qs / d.C;
      const s = 60 + Math.cbrt(p.m) * 30; const cx = W * 0.4, cy = H * 0.52;
      ctx.fillStyle = heatColor(T); D.rr(ctx, cx - s / 2, cy - s / 2, s, s, 10); ctx.fill();
      D.txt(ctx, NAME[p.mat], cx, cy - 8, { color: '#fff', size: 14, w: '700' }); D.txt(ctx, p.m + ' kg', cx, cy + 12, { color: '#fff', size: 13 });
      // اللهب أو الثلج
      if (d.dT > 0) { for (let i = -2; i <= 2; i++) { ctx.fillStyle = i % 2 ? c.c4 : c.c2; ctx.beginPath(); const fx = cx + i * 16, fy = cy + s / 2 + 34; ctx.moveTo(fx - 7, fy); ctx.quadraticCurveTo(fx, fy - 30 - 6 * Math.sin(st.t * 8 + i), fx + 7, fy); ctx.fill(); } }
      else if (d.dT < 0) D.txt(ctx, '❄ تبريد', cx, cy + s / 2 + 24, { color: c.c1, size: 15, w: '700' });
      thermo(ctx, W * 0.75, 60, H - 70, T, 0, 100, c, 'ميزان الحرارة');
      D.txt(ctx, 'Q المزوّدة = ' + P.sct(sgn * st.Qs) + ' J  من  ' + P.sct(d.Q) + ' J', W / 2, 22, { color: c.text, size: 14, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) {
        const dTm = Math.max(1, Math.abs(d.dT));
        return { view: { xmin: 0, xmax: 100, ymin: 0, ymax: D.niceMax(p.m * 4186 * 100, 1) }, xLabel: 'ΔT (°C)', yLabel: 'Q (J)', caption: 'لكتلة ' + p.m + ' كغم: كل خط ميله السعة الحرارية $mc$. الماء (الأعلى) يحتاج أكبر كمية حرارة لنفس الارتفاع في درجة الحرارة.', draw(G) { const c = G.colors(); const cols = [c.c1, c.c2, c.c3, c.c4, c.c5, c.c6]; ['water', 'aluminium', 'iron', 'copper', 'lead'].forEach((k, i) => G.fn((x) => p.m * P.specificHeat[k] * x, { color: k === p.mat ? c.text : cols[i], width: k === p.mat ? 4 : 2, domain: [0, 100] })); G.fn((x) => p.m * d.c * x, { color: c.text, width: 4, domain: [0, 100] }); G.point(dTm, p.m * d.c * dTm, { color: c.c2, label: NAME[p.mat] }); } };
      }
      const Qm = Math.max(Math.abs(d.Qw), Math.abs(d.Q), 1);
      return { view: { xmin: 0, xmax: Qm * 1.05, ymin: 0, ymax: 100 }, xLabel: '|Q| (J)', yLabel: 'T (°C)', caption: 'درجة الحرارة مع الحرارة المزوّدة: ميل الخط $1/(mc)$. الأحمر: ' + NAME[p.mat] + '، الأزرق المتقطع: الماء بالكتلة نفسها (يسخن أبطأ).', draw(G) { const c = G.colors(); const sg = Math.sign(d.dT) || 1; G.fn((Q) => p.T1 + sg * Q / d.C, { color: c.c2, width: 3, domain: [0, Math.abs(d.Q)] }); G.fn((Q) => p.T1 + sg * Q / (p.m * 4186), { color: c.c1, width: 2, dash: [6, 4], domain: [0, Math.abs(d.Qw)] }); const st = d.st || { Qs: 0 }; G.point(st.Qs, p.T1 + sg * st.Qs / d.C, { color: c.c5 }); } };
    },
    live(p, d) { return 'Q = m c \\Delta T = ' + p.m + ' \\times ' + d.c + ' \\times (' + p.T2 + ' - ' + p.T1 + ') = ' + q(d.Q, 'J'); },
    results(p, d) { return [['الحرارة النوعية c', q(d.c, 'J/(kg\\cdot ^\\circ C)')], ['السعة الحرارية C = mc', q(d.C, 'J/^\\circ C')], ['التغير في درجة الحرارة', q(d.dT, '^\\circ C')], ['كمية الحرارة Q', q(d.Q, 'J'), true, d.Q >= 0 ? 'pos' : 'neg'], ['الحالة', d.Q > 0 ? 'حرارة مكتسبة' : d.Q < 0 ? 'حرارة مفقودة' : 'لا تبادل', false], ['للمقارنة: الماء بالكتلة نفسها', q(d.Qw, 'J')], ['تحليل الأبعاد', '\\mathrm{kg} \\cdot \\mathrm{\\tfrac{J}{kg\\,^\\circ C}} \\cdot \\mathrm{^\\circ C} = \\mathrm{J}']]; },
    steps(p, d) { return ['السعة الحرارية: $C = m c = ' + p.m + ' \\times ' + d.c + ' = ' + f2(d.C) + '$ J/°C.', '$\\Delta T = ' + p.T2 + ' - ' + p.T1 + ' = ' + d.dT + '$ °C.', '$Q = C \\Delta T = ' + f2(d.C) + ' \\times ' + d.dT + ' = ' + f2(d.Q) + '$ J' + (d.Q < 0 ? ' (الإشارة السالبة: حرارة مفقودة).' : '.')]; },
    explain(a, b, da, db) {
      const o = [];
      if (a.mat !== b.mat) o.push('غيّرت المادة إلى ' + NAME[b.mat] + ' (c = ' + db.c + '): صارت الحرارة اللازمة $' + P.sci(db.Q) + '$ J. **لماذا؟** الحرارة النوعية هي الحرارة اللازمة لرفع 1 كغم درجة واحدة؛ كلما كبرت احتاجت المادة حرارة أكثر.');
      if (a.m !== b.m) o.push('تغيّرت الكتلة إلى ' + b.m + ' كغم فتغيّرت كمية الحرارة بالنسبة نفسها (تناسب طردي) إلى $' + P.sci(db.Q) + '$ J.');
      if (a.T1 !== b.T1 || a.T2 !== b.T2) o.push('صار التغير في درجة الحرارة $' + db.dT + '$ °C فصارت $Q = ' + P.sci(db.Q) + '$ J' + (db.Q < 0 ? ' — سالبة لأن الجسم يفقد حرارة عند التبريد.' : '.'));
      return o;
    },
    learn: ['**كمية الحرارة (ص 89):** $Q = m c \\Delta T$، وتقاس بالجول.', '**الحرارة النوعية (ص 89):** كمية الحرارة اللازمة لرفع درجة حرارة 1 كغم من المادة درجة سيليزية واحدة، وتقاس بـ J/(kg·°C).', '**السعة الحرارية (ص 90):** كمية الحرارة اللازمة لرفع درجة حرارة الجسم كله درجة واحدة: $C = mc$ بوحدة J/°C.', '**مثال (1) ص 90:** ألمنيوم 3 كغم من 20 إلى 50 °س: $C = 2700$ J/°C و $Q = 81000$ J.'],
    challenges: [
      { q: 'مثال (1) ص 90: قطعة ألمنيوم 3 كغم سُخّنت من 20 إلى 50 °س. اضبط القيم.', hint: 'ألمنيوم، $m = 3$، $T_1 = 20$، $T_2 = 50$.', init: { mat: 'iron', m: 1, T1: 0, T2: 10 }, check: (p) => p.mat === 'aluminium' && p.m === 3 && p.T1 === 20 && p.T2 === 50, why: (p, d) => '$C = ' + d.C + '$ J/°C و $Q = ' + d.Q + '$ J.' },
      { q: 'أي مادة من الجدول تحتاج أقل حرارة لتسخين 1 كغم من 20 إلى 30 °س؟ اخترها.', hint: 'أصغر حرارة نوعية في الجدول: البزموث (123).', init: { mat: 'water', m: 1, T1: 20, T2: 30 }, check: (p) => p.mat === 'bismuth' && p.m === 1 && p.T1 === 20 && p.T2 === 30 },
      { q: 'اجعل كمية الحرارة المفقودة 41860 J تماماً عند تبريد الماء.', hint: 'الماء، $Q = -41860$ ← مثلاً $m = 1$ و $\\Delta T = -10$.', init: { mat: 'water', m: 1, T1: 20, T2: 30 }, check: (p, d) => p.mat === 'water' && M.near(d.Q, -41860, 1e-6) }
    ],
    tutor: [
      { q: 'لماذا يسخن الماء أبطأ من المعادن؟', k: ['الماء', 'ابطا', 'المعادن', 'لماذا'], a: (p, d) => 'لأن حرارته النوعية (4186) كبيرة جداً مقارنة بالمعادن (مثلاً ' + NAME[p.mat] + ' = ' + d.c + '). لتسخين ' + p.m + ' كغم من الماء بمقدار ' + Math.abs(d.dT) + ' °C نحتاج $' + P.sci(Math.abs(d.Qw)) + '$ J.' },
      { q: 'ما الفرق بين السعة الحرارية والحرارة النوعية؟', k: ['السعه', 'الفرق', 'النوعيه'], a: (p, d) => 'الحرارة النوعية خاصية للمادة (لكل 1 كغم): ' + d.c + ' J/(kg·°C). السعة الحرارية للجسم كله: $C = mc = ' + f2(d.C) + '$ J/°C — تزداد بزيادة الكتلة.' }
    ]
  });

  /* ======================= 1-3 الاتزان الحراري ======================= */
  ML.register({
    subject: S, id: 'equilibrium', unit: U, order: 2, lesson: '1-3', lessonTitle: 'الاتزان الحراري', page: 91,
    titleAr: 'الاتزان الحراري (خلط جسمين)', titleEn: 'Thermal Equilibrium (Mixing)', tags: 'اتزان حراري خليط حراره مكتسبه مفقوده مسعر',
    formula: 'Q_{gained} = Q_{lost} \\Rightarrow T_e = \\frac{m_1 c_1 T_1 + m_2 c_2 T_2}{m_1 c_1 + m_2 c_2}',
    book: 'كح مكتسبة = كح مفقودة : ك2 حن2 (د − د2) = ك1 حن1 (د1 − د) (ص 93)',
    summary: 'عندما يتلامس جسمان مختلفان في درجة الحرارة تنتقل الحرارة من الساخن إلى البارد حتى تتساوى درجتا حرارتهما (الاتزان الحراري). في نظام معزول: الحرارة التي يفقدها الساخن = الحرارة التي يكتسبها البارد.',
    vars: [['m_1,\\ c_1,\\ T_1', 'كتلة الجسم الساخن وحرارته النوعية ودرجة حرارته', '\\mathrm{kg},\\ \\mathrm{J/(kg\\,^\\circ C)},\\ ^\\circ\\mathrm{C}', 'm₁: 0.05–5، T₁: 0–100'], ['m_2,\\ T_2', 'كتلة الماء ودرجة حرارته', '\\mathrm{kg},\\ ^\\circ\\mathrm{C}', 'm₂: 0.1–5، T₂: 0–100'], ['T_e', 'درجة حرارة الاتزان', '^\\circ\\mathrm{C}', 'بين T₁ و T₂']],
    assumptions: ['النظام معزول: بإهمال السعة الحرارية للوعاء والحرارة المفقودة للوسط (كما في مثال 2 ص 93).', 'لا يحدث تغير في الحالة (لا غليان ولا تجمد).', 'منحنى الاقتراب من الاتزان مع الزمن توضيحي؛ القيمة النهائية هي الدقيقة.'],
    params: [
      { key: 'mat', label: '\\text{body}', type: 'select', options: METALS.map((k) => [k, NAME[k] + ' (' + P.specificHeat[k] + ')']), value: 'iron', desc: 'الجسم المضاف' },
      { key: 'm1', label: 'm_1\\ (\\mathrm{kg})', min: 0.05, max: 5, step: 0.05, value: 0.1 },
      { key: 'T1', label: 'T_1\\ (^\\circ\\mathrm{C})', min: 0, max: 100, step: 1, value: 100 },
      { key: 'm2', label: 'm_2\\ (\\mathrm{kg})', min: 0.1, max: 5, step: 0.1, value: 1, desc: 'كتلة الماء' },
      { key: 'T2', label: 'T_2\\ (^\\circ\\mathrm{C})', min: 0, max: 100, step: 1, value: 20, desc: 'حرارة الماء' }
    ],
    resetOn: ['mat', 'm1', 'T1', 'm2', 'T2'],
    play: { mode: 'time', speed: 1 },
    initState: (p) => ({ t: 0, Ta: p.T1, Tb: p.T2, series: [[0, p.T1, p.T2]] }),
    tick(st, p, d, dt) {
      // انتقال حرارة يتناسب مع فرق درجتي الحرارة (توضيحي) مع حفظ الطاقة تماماً
      const k = 1.2 * Math.min(d.C1, d.C2); const dQ = k * (st.Ta - st.Tb) * dt;
      st.Ta -= dQ / d.C1; st.Tb += dQ / d.C2; st.t += dt; D.pushSeries(st, st.t, [st.Ta, st.Tb], 1500);
    },
    isDone: (st) => Math.abs(st.Ta - st.Tb) < 0.02 || st.t > 30,
    custom: true, canvasHint: 'اضغط «تشغيل» لتبدأ الحرارة بالانتقال من الأسخن إلى الأبرد.',
    compute(p) { const c1 = P.specificHeat[p.mat], c2 = P.specificHeat.water; const Te = P.equilibrium(p.m1, c1, p.T1, p.m2, c2, p.T2); return { c1: c1, c2: c2, C1: p.m1 * c1, C2: p.m2 * c2, Te: Te, Q1: P.heat(p.m1, c1, Te - p.T1), Q2: P.heat(p.m2, c2, Te - p.T2) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { Ta: p.T1, Tb: p.T2 }; const bx = W * 0.38, by = H * 0.3, bw = W * 0.4, bh = H * 0.58;
      ctx.fillStyle = heatColor(st.Tb); ctx.globalAlpha = 0.55; ctx.fillRect(bx, by + 30, bw, bh - 30); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
      const s = 30 + Math.cbrt(p.m1) * 22; ctx.fillStyle = heatColor(st.Ta); D.rr(ctx, bx + bw / 2 - s / 2, by + bh - s - 10, s, s, 6); ctx.fill(); ctx.strokeStyle = c.axis; ctx.lineWidth = 1.5; ctx.stroke();
      D.txt(ctx, NAME[p.mat], bx + bw / 2, by + bh - s / 2 - 10, { color: '#fff', size: 12, w: '700' });
      if (Math.abs(st.Ta - st.Tb) > 0.5) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; D.arrow(ctx, bx + bw / 2 + Math.cos(a) * (s * 0.6), by + bh - s / 2 - 10 + Math.sin(a) * (s * 0.6), bx + bw / 2 + Math.cos(a) * (s * 0.6 + 22) * (st.Ta > st.Tb ? 1 : 0.7), by + bh - s / 2 - 10 + Math.sin(a) * (s * 0.6 + 22), c.c2, 2); }
      thermo(ctx, W * 0.12, 60, H - 70, st.Ta, 0, 100, c, NAME[p.mat]);
      thermo(ctx, W * 0.9, 60, H - 70, st.Tb, 0, 100, c, 'الماء');
      D.txt(ctx, 'درجة حرارة الاتزان المتوقعة: ' + f2(d.Te, 2) + ' °C', W / 2, 22, { color: c.text, size: 15, w: '700' });
    },
    graph(p, d) {
      const st = d.st || { series: [] }; const T = Math.max(3, st.t || 0);
      return { view: { xmin: 0, xmax: T, ymin: 0, ymax: 100 }, xLabel: 't (s) — توضيحي', yLabel: 'T (°C)', caption: 'الأحمر: الجسم، الأزرق: الماء. يقترب المنحنيان من الخط المتقطع $T_e = ' + f2(d.Te) + '$ °C. الماء ذو السعة الحرارية الكبيرة يتغير قليلاً.', draw(G) { const c = G.colors(); G.hline(d.Te, { color: c.muted, dash: [6, 4] }); D.series(G, (st.series || []).map((r) => [r[0], r[1]]), c.c2, 3); D.series(G, (st.series || []).map((r) => [r[0], r[2]]), c.c1, 3); } };
    },
    live(p, d) { return 'T_e = \\frac{' + p.m1 + ' (' + d.c1 + ')(' + p.T1 + ') + ' + p.m2 + ' (' + d.c2 + ')(' + p.T2 + ')}{' + p.m1 + ' (' + d.c1 + ') + ' + p.m2 + ' (' + d.c2 + ')} = ' + f2(d.Te) + '\\ ^\\circ\\mathrm{C}'; },
    results(p, d) { return [['درجة حرارة الاتزان', q(d.Te, '^\\circ C'), true, 'pos'], ['الحرارة المتبادلة للجسم', q(d.Q1, 'J')], ['الحرارة المتبادلة للماء', q(d.Q2, 'J')], ['تحقق حفظ الطاقة Q₁ + Q₂', q(d.Q1 + d.Q2, 'J')], ['السعتان الحراريتان', q(d.C1, 'J/^\\circ C') + ',\\ ' + q(d.C2, 'J/^\\circ C')]]; },
    steps(p, d) { return ['الحرارة المكتسبة = الحرارة المفقودة: $m_2 c_2 (T_e - T_2) = m_1 c_1 (T_1 - T_e)$.', '$' + f2(d.C2) + ' (T_e - ' + p.T2 + ') = ' + f2(d.C1) + ' (' + p.T1 + ' - T_e)$.', '$T_e = ' + f2(d.Te, 3) + '$ °C.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.m2 !== b.m2) o.push('تغيّرت كتلة الماء إلى ' + b.m2 + ' كغم: درجة الاتزان صارت ' + f2(db.Te) + ' °C. الماء الأكثر يمتص الحرارة دون أن ترتفع حرارته كثيراً (سعة حرارية أكبر).');
      if (a.mat !== b.mat || a.m1 !== b.m1) o.push('تغيّرت السعة الحرارية للجسم إلى $' + f2(db.C1) + '$ J/°C فصارت درجة الاتزان ' + f2(db.Te) + ' °C — تقترب درجة الاتزان من درجة الجسم ذي السعة الحرارية الأكبر.');
      if (a.T1 !== b.T1 || a.T2 !== b.T2) o.push('تغيّرت درجة حرارة البداية: درجة الاتزان تبقى دائماً بين الدرجتين، وصارت ' + f2(db.Te) + ' °C.');
      return o;
    },
    onDone(st, p, d) { return ['وصل النظام إلى الاتزان الحراري عند ≈ $' + f2((st.Ta + st.Tb) / 2) + '$ °C، تطابق القيمة المحسوبة $' + f2(d.Te) + '$ °C. توقف انتقال الحرارة لأن الفرق في درجتي الحرارة صار صفراً.']; },
    learn: ['**الاتزان الحراري (ص 92):** الحالة التي تتساوى فيها درجات حرارة الأجسام المتلامسة فيتوقف انتقال الحرارة بينها.', '**مبدأ حفظ الطاقة الحرارية (ص 93):** كمية الحرارة المكتسبة = كمية الحرارة المفقودة (في نظام معزول).', '**مثال (2) ص 93:** حديد 0.1 كغم عند 100 °س في 1 كغم ماء عند 20 °س: درجة الاتزان 20.85 °س.'],
    challenges: [
      { q: 'مثال (2) ص 93: قطعة حديد 0.1 كغم عند 100 °س في 1 كغم ماء عند 20 °س. ما درجة الاتزان؟', hint: 'حديد، $m_1 = 0.1$، $T_1 = 100$، $m_2 = 1$، $T_2 = 20$.', init: { mat: 'copper', m1: 1, T1: 80, m2: 2, T2: 10 }, check: (p) => p.mat === 'iron' && p.m1 === 0.1 && p.T1 === 100 && p.m2 === 1 && p.T2 === 20, why: (p, d) => '$T_e = ' + f2(d.Te) + '$ °س.' },
      { q: 'اجعل درجة حرارة الاتزان 30 °س أو أكثر باستخدام 1 كغم ماء عند 20 °س وجسم عند 100 °س.', hint: 'زد كتلة الجسم أو اختر مادة حرارتها النوعية أكبر (الألمنيوم).', init: { mat: 'iron', m1: 0.1, T1: 100, m2: 1, T2: 20 }, check: (p, d) => p.m2 === 1 && p.T2 === 20 && p.T1 === 100 && d.Te >= 30 }
    ],
    tutor: [
      { q: 'لماذا لم ترتفع حرارة الماء كثيراً؟', k: ['الماء', 'كثيرا', 'لماذا'], a: (p, d) => 'لأن السعة الحرارية للماء ($' + f2(d.C2) + '$ J/°C) أكبر كثيراً من سعة ' + NAME[p.mat] + ' ($' + f2(d.C1) + '$ J/°C). الحرارة نفسها $' + f2(Math.abs(d.Q2)) + '$ J ترفع حرارة الماء $' + f2(d.Te - p.T2) + '$ °C فقط.' },
      { q: 'هل تنتقل البرودة من الماء إلى الجسم؟', k: ['البروده', 'تنتقل'], a: () => 'لا؛ الذي ينتقل هو الحرارة دائماً، من الجسم الأعلى درجة حرارة إلى الأدنى، حتى تتساوى الدرجتان.' }
    ]
  });

  function stateAt(d, Q) { let acc = 0; for (const s of d.stages) { if (Q <= acc + s.Q + 1e-9) { const f = s.Q > 0 ? (Q - acc) / s.Q : 1; return { T: s.T0 + (s.T1 - s.T0) * f, stage: s.name, f: f }; } acc += s.Q; } const last = d.stages[d.stages.length - 1]; return { T: last ? last.T1 : 0, stage: last ? last.name : '', f: 1 }; }
  /* ======================= 1-4 الحرارة الكامنة: منحنى التسخين ======================= */
  ML.register({
    subject: S, id: 'latent-heat', ar: { L: 'ح_ك', L_f: 'ح_انصهار', L_v: 'ح_تبخر' }, unit: U, order: 3, lesson: '1-4', lessonTitle: 'الحرارة الكامنة', page: 94,
    titleAr: 'الحرارة الكامنة ومنحنى التسخين', titleEn: 'Latent Heat & Heating Curve of Water', tags: 'حراره كامنه انصهار تبخر غليان جليد منحنى التسخين تغير الحاله',
    formula: 'Q = m\\,L, \\qquad Q_{total} = m c_{ice} \\Delta T_1 + m L_f + m c_w \\Delta T_2 \\;(+\\, m L_v)',
    book: 'كح = ك × ح كامنة ؛ ح انصهار الجليد = 3.33 × 10⁵ جول/كغم ، ح تبخر الماء = 2.26 × 10⁶ جول/كغم (ص 95–96)',
    summary: 'أثناء تغير الحالة (الانصهار أو الغليان) تُمتص الحرارة دون أن تتغير درجة الحرارة؛ تُستخدم في كسر الروابط بين الجزيئات. لذلك يظهر في منحنى التسخين خطان أفقيان عند 0 °س و 100 °س.',
    vars: [['m', 'كتلة الجليد', '\\mathrm{kg}', '0.05 – 2'], ['T_i', 'درجة حرارة الجليد الابتدائية', '^\\circ\\mathrm{C}', '−30 – 0'], ['T_f', 'درجة حرارة الماء النهائية', '^\\circ\\mathrm{C}', '0 – 100'], ['L_f,\\ L_v', 'الحرارة الكامنة للانصهار وللتبخر', '\\mathrm{J/kg}', '3.33 × 10⁵ ، 2.26 × 10⁶']],
    assumptions: ['الضغط جوي معياري: الانصهار عند 0 °س والغليان عند 100 °س.', 'لا نسخّن البخار فوق 100 °س لأن الكتاب لا يعطي الحرارة النوعية للبخار.', 'بإهمال الحرارة المفقودة للوسط وللوعاء.'],
    params: [
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.05, max: 2, step: 0.05, value: 0.1 },
      { key: 'Ti', label: 'T_i\\ (^\\circ\\mathrm{C})', min: -30, max: 0, step: 1, value: -10 },
      { key: 'Tf', label: 'T_f\\ (^\\circ\\mathrm{C})', min: 0, max: 100, step: 1, value: 80 },
      { key: 'boil', label: '\\text{boil}', type: 'toggle', value: false, on: 'تبخير الماء كله عند 100 °س', off: 'بدون تبخير' },
      { key: 'ci', label: 'c_{ice}', type: 'select', options: [['2090', '2090 (مثال 3)'], ['2093', '2093 (جدول 1)']], value: 2090 }
    ],
    resetOn: ['m', 'Ti', 'Tf', 'boil', 'ci'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, Qs: 0 }),
    tick(st, p, d, dt) { st.t += dt; st.Qs = Math.min(d.total, st.Qs + d.total / 8 * dt); },
    isDone: (st, p, d) => st.Qs >= d.total - 1e-9,
    custom: true, canvasHint: 'اضغط «تشغيل» لتزويد الحرارة بمعدل ثابت ولاحظ أن الحرارة تثبت أثناء الانصهار والغليان.',
    compute(p) {
      const boil = p.boil && p.Tf === 100; const hc = P.heatingCurve(p.m, p.Ti, p.Tf, boil, p.ci);
      let acc = 0; const pts = [[0, p.Ti]]; hc.stages.forEach((s) => { acc += s.Q; pts.push([acc, s.T1]); });
      return { stages: hc.stages, total: hc.total, pts: pts, boilOk: boil };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { Qs: 0 }; const s = stateAt(d, st.Qs); const T = s.T;
      const bx = W * 0.3, by = H * 0.32, bw = W * 0.4, bh = H * 0.5;
      let ice = 1, vap = 0;
      if (s.stage === 'انصهار الجليد') ice = 1 - s.f; else if (s.stage === 'تسخين الماء') ice = 0; else if (s.stage === 'تبخر الماء') { ice = 0; vap = s.f; }
      if (st.Qs === 0) ice = 1;
      const waterH = (bh - 20) * 0.6 * (1 - ice) * (1 - vap);
      ctx.fillStyle = heatColor(T); ctx.globalAlpha = 0.6; ctx.fillRect(bx, by + bh - waterH, bw, waterH); ctx.globalAlpha = 1;
      const n = Math.round(9 * ice); for (let i = 0; i < n; i++) { ctx.fillStyle = '#bfdbfe'; ctx.strokeStyle = '#60a5fa'; const ix = bx + 14 + (i % 3) * (bw - 40) / 3, iy = by + bh - 34 - Math.floor(i / 3) * 30; D.rr(ctx, ix, iy, 34, 26, 4); ctx.fill(); ctx.stroke(); }
      if (s.stage === 'تبخر الماء' || (T >= 100 && !d.boilOk)) for (let i = 0; i < 10; i++) { ctx.fillStyle = c.muted; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(bx + 20 + (i * 37) % (bw - 40), by - 10 - ((st.t * 40 + i * 23) % 60), 6, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
      ctx.strokeStyle = c.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
      for (let i = -2; i <= 2; i++) { ctx.fillStyle = i % 2 ? c.c4 : c.c2; ctx.beginPath(); const fx = bx + bw / 2 + i * 18, fy = by + bh + 34; ctx.moveTo(fx - 7, fy); ctx.quadraticCurveTo(fx, fy - 26, fx + 7, fy); ctx.fill(); }
      thermo(ctx, W * 0.86, 60, H - 70, T, -30, 100, c, '');
      D.txt(ctx, (s.stage || 'جليد') + ' — Q = ' + P.sct(st.Qs) + ' J', W / 2, 22, { color: c.text, size: 15, w: '700' });
      if (s.stage === 'انصهار الجليد' || s.stage === 'تبخر الماء') D.txt(ctx, 'درجة الحرارة ثابتة أثناء تغير الحالة!', W / 2, 46, { color: c.c2, size: 13, w: '700' });
    },
    graph(p, d) {
      const st = d.st || { Qs: 0 }; const s = stateAt(d, st.Qs);
      return { view: { xmin: 0, xmax: Math.max(1, d.total) * 1.05, ymin: Math.min(-35, p.Ti - 5), ymax: 110 }, xLabel: 'Q (J)', yLabel: 'T (°C)', caption: 'منحنى التسخين: الخطوط المائلة تسخين (ميلها $1/(mc)$)، والخطوط الأفقية تغير حالة عند 0 و 100 °س. الحرارة الكلية $' + P.sci(d.total) + '$ J.', draw(G) { const c = G.colors(); D.series(G, d.pts, c.c1, 3); G.point(st.Qs, s.T, { color: c.c2 }); } };
    },
    live(p, d) { return 'Q_{total} = ' + d.stages.map((s) => P.sci(s.Q, 7)).join(' + ') + ' = ' + q(d.total, 'J', 7); },
    results(p, d) { const r = d.stages.map((s) => [s.name, q(s.Q, 'J', 7)]); r.push(['كمية الحرارة الكلية', q(d.total, 'J', 7), true, 'pos']); if (p.boil && p.Tf < 100) r.push(['ملاحظة', 'لا يغلي الماء إلا عند 100 °س: اجعل T_f = 100', false, 'neg']); return r; },
    steps(p, d) { return d.stages.map((s) => { if (s.name === 'تسخين الجليد') return 'تسخين الجليد: $Q_1 = m c_{ice} \\Delta T = ' + p.m + ' \\times ' + p.ci + ' \\times (' + s.T1 + ' - (' + s.T0 + ')) = ' + f2(s.Q) + '$ J.'; if (s.name === 'انصهار الجليد') return 'الانصهار عند 0 °س: $Q_2 = m L_f = ' + p.m + ' \\times 3.33 \\times 10^5 = ' + f2(s.Q) + '$ J.'; if (s.name === 'تسخين الماء') return 'تسخين الماء: $Q_3 = m c_w \\Delta T = ' + p.m + ' \\times 4186 \\times ' + s.T1 + ' = ' + f2(s.Q) + '$ J.'; return 'التبخر عند 100 °س: $Q_4 = m L_v = ' + p.m + ' \\times 2.26 \\times 10^6 = ' + f2(s.Q) + '$ J.'; }).concat(['المجموع: $' + f2(d.total) + '$ J.']); },
    explain(a, b, da, db) {
      const o = [];
      if (a.boil !== b.boil) o.push(b.boil ? (b.Tf === 100 ? 'أضفت مرحلة التبخر: تحتاج وحدها $' + P.sci(b.m * P.latent.waterVapor) + '$ J — أكبر من كل المراحل الأخرى معاً تقريباً، لأن الحرارة الكامنة للتبخر كبيرة جداً.' : 'لن يحدث تبخر حتى تصل درجة الحرارة النهائية إلى 100 °س.') : 'أزلت مرحلة التبخر.');
      if (a.m !== b.m) o.push('تغيّرت الكتلة فتغيّرت كل المراحل بالنسبة نفسها؛ الحرارة الكلية $' + P.sci(db.total) + '$ J.');
      if (a.Ti !== b.Ti || a.Tf !== b.Tf) o.push('تغيّر مدى درجات الحرارة: تتغير مراحل التسخين فقط، أما حرارة الانصهار ($mL_f$) فلا تعتمد على درجات الحرارة.');
      return o;
    },
    learn: ['**الحرارة الكامنة (ص 95):** كمية الحرارة اللازمة لتغيير حالة 1 كغم من المادة دون تغير درجة حرارتها: $Q = mL$.', '**الانصهار والتبخر (ص 95–96):** $L_f = 3.33 \\times 10^5$ J/kg للجليد، $L_v = 2.26 \\times 10^6$ J/kg للماء.', '**مثال (3) ص 97:** 100 غم جليد من −10 إلى ماء عند 80 °س: $2090 + 33300 + 33488 = 68878$ J.'],
    challenges: [
      { q: 'مثال (3) ص 97: احسب الحرارة اللازمة لتحويل 100 غم جليد عند −10 °س إلى ماء عند 80 °س.', hint: '$m = 0.1$، $T_i = -10$، $T_f = 80$، بدون تبخير، $c_{ice} = 2090$.', init: { m: 0.5, Ti: -20, Tf: 50, boil: false, ci: 2090 }, check: (p, d) => p.m === 0.1 && p.Ti === -10 && p.Tf === 80 && !p.boil && p.ci === 2090, why: (p, d) => 'الحرارة الكلية $' + d.total + '$ J.' },
      { q: 'حوّل 1 كغم من الجليد عند 0 °س إلى بخار عند 100 °س كلياً. كم جولاً يلزم؟', hint: '$m = 1$، $T_i = 0$، $T_f = 100$، فعّل التبخير.', init: { m: 0.1, Ti: -10, Tf: 80, boil: false }, check: (p) => p.m === 1 && p.Ti === 0 && p.Tf === 100 && p.boil, why: (p, d) => '$' + P.sci(d.total) + '$ J، منها $2.26 \\times 10^6$ للتبخر.' }
    ],
    tutor: [
      { q: 'لماذا لا ترتفع درجة الحرارة أثناء الانصهار؟', k: ['لا ترتفع', 'الانصهار', 'ثابته', 'لماذا'], a: () => 'لأن الحرارة المزوّدة تُستخدم في التغلب على قوى الترابط بين الجزيئات (تغيير الحالة) وليس في زيادة طاقتها الحركية، فتبقى درجة الحرارة 0 °س حتى ينصهر الجليد كله.' },
      { q: 'أي مرحلة تحتاج أكبر كمية حرارة؟', k: ['اكبر', 'مرحله'], a: (p, d) => { const mx = d.stages.reduce((a, b) => (b.Q > a.Q ? b : a), d.stages[0] || { name: '—', Q: 0 }); return 'أكبر مرحلة الآن: **' + mx.name + '** بمقدار $' + P.sci(mx.Q) + '$ J من أصل $' + P.sci(d.total) + '$ J.'; } }
    ]
  });

  /* ======================= 1-5 التمدد الحراري ======================= */
  const SOL = Object.keys(P.alphaLinear).map((k) => [k, NAME[k] + ' (' + P.alphaLinear[k] + '×10⁻⁶)']);
  const LQ = Object.keys(P.betaLiquid).map((k) => [k, NAME[k] + ' (' + P.betaLiquid[k] + '×10⁻⁴)']);
  ML.register({
    subject: S, id: 'expansion', unit: U, order: 4, lesson: '1-5', lessonTitle: 'التمدد الحراري', page: 98,
    titleAr: 'التمدد الحراري الطولي والحجمي', titleEn: 'Linear & Volume Thermal Expansion', tags: 'تمدد طولي حجمي معامل التمدد قضيب سوائل سكه حديد',
    formula: '\\Delta L = \\alpha\\,L_1\\,\\Delta T, \\qquad \\Delta V = \\beta\\,V_1\\,\\Delta T',
    book: 'ل2 − ل1 = مد × ل1 × (د2 − د1) ؛ Δح = مح × ح1 × Δد (ص 99، 103)',
    summary: 'تتمدد معظم المواد بالتسخين لأن جزيئاتها تهتز بسعة أكبر فتزداد المسافات بينها. مقدار التمدد يتناسب طردياً مع الطول (أو الحجم) الأصلي ومع التغير في درجة الحرارة، ويعتمد على نوع المادة عبر معامل التمدد.',
    vars: [['L_1,\\ V_1', 'الطول الأصلي (أو الحجم الأصلي)', '\\mathrm{m}\\ ,\\ \\mathrm{L}', '0.1 – 100 م ، 0.1 – 10 لتر'], ['\\alpha', 'معامل التمدد الطولي', '{}^\\circ\\mathrm{C}^{-1}', 'جدول (3) ص 101'], ['\\beta', 'معامل التمدد الحجمي للسوائل', '{}^\\circ\\mathrm{C}^{-1}', 'جدول (4) ص 103'], ['\\Delta T', 'التغير في درجة الحرارة', '^\\circ\\mathrm{C}', '−100 – 200']],
    assumptions: ['معامل التمدد ثابت في مدى درجات الحرارة.', 'في السوائل: بإهمال تمدد الإناء (كما في مثال 5 ص 103).', 'التمدد مضخّم في الرسم لكي يُرى؛ الأرقام حقيقية.'],
    params: [
      { key: 'kind', label: '\\text{type}', type: 'select', options: [['lin', 'تمدد طولي (صلب)'], ['vol', 'تمدد حجمي (سائل)']], value: 'lin' },
      { key: 'mat', label: '\\text{material}', type: 'select', options: (p) => (p.kind === 'vol' ? LQ : SOL), value: 'copper' },
      { key: 'L1', label: 'L_1\\ (\\mathrm{m})', min: 0.1, max: 100, step: 0.1, value: 3, hidden: (p) => p.kind === 'vol' },
      { key: 'V1', label: 'V_1\\ (\\mathrm{L})', min: 0.1, max: 10, step: 0.1, value: 2, hidden: (p) => p.kind !== 'vol' },
      { key: 'T1', label: 'T_1\\ (^\\circ\\mathrm{C})', min: -50, max: 100, step: 1, value: 20 },
      { key: 'T2', label: 'T_2\\ (^\\circ\\mathrm{C})', min: -50, max: 200, step: 1, value: 50 }
    ],
    onSet(p) { if (p.kind === 'vol' && !(p.mat in P.betaLiquid)) p.mat = 'turpentine'; if (p.kind === 'lin' && !(p.mat in P.alphaLinear)) p.mat = 'copper'; },
    custom: true, canvasHint: 'الشكل الباهت: قبل التسخين. التمدد مكبَّر بصرياً.',
    graphModes: ['التمدد – Δd لعدة مواد'],
    compute(p) {
      const dT = p.T2 - p.T1;
      if (p.kind === 'vol') { const b = (P.betaLiquid[p.mat] || 9) * 1e-4; const dV = P.volumeExpansion(b, p.V1, dT); return { vol: true, coef: b, dT: dT, dX: dV, X2: p.V1 + dV }; }
      const a = (P.alphaLinear[p.mat] || 17) * 1e-6; const dL = P.linearExpansion(a, p.L1, dT); return { vol: false, coef: a, dT: dT, dX: dL, X2: p.L1 + dL };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const mag = d.vol ? 0.4 / Math.max(1e-6, Math.abs(d.coef * 200)) : 0.35 / Math.max(1e-6, Math.abs(d.coef * 200));
      const rel = M.clamp((d.dX / (d.vol ? p.V1 : p.L1)) * mag, -0.3, 0.45);
      if (!d.vol) {
        const L0 = W * 0.55, x0 = W * 0.12, y = H * 0.5;
        ctx.fillStyle = c.muted; ctx.globalAlpha = 0.35; ctx.fillRect(x0, y - 16, L0, 32); ctx.globalAlpha = 1;
        ctx.fillStyle = heatColor(p.T2); ctx.globalAlpha = 0.85; ctx.fillRect(x0, y - 14, L0 * (1 + rel), 28); ctx.globalAlpha = 1;
        ctx.fillStyle = c.axis; ctx.fillRect(x0 - 10, y - 40, 10, 80);
        D.arrow(ctx, x0 + L0, y + 40, x0 + L0 * (1 + rel), y + 40, c.c2, 3);
        D.txt(ctx, 'ΔL = ' + P.sct(d.dX) + ' m (' + P.sct(d.dX * 1000) + ' mm)', W / 2, y + 70, { color: c.c2, size: 15, w: '700' });
        D.txt(ctx, NAME[p.mat] + ' — L₁ = ' + p.L1 + ' m', W / 2, 26, { color: c.text, size: 15, w: '700' });
      } else {
        const bx = W * 0.35, bw = W * 0.3, by = H * 0.2, bh = H * 0.62; const lv = bh * 0.8; const nl = lv * (1 + rel);
        ctx.fillStyle = heatColor(p.T2); ctx.globalAlpha = 0.6; ctx.fillRect(bx, by + bh - Math.min(nl, bh), bw, Math.min(nl, bh)); ctx.globalAlpha = 1;
        if (nl > bh) { ctx.fillStyle = heatColor(p.T2); ctx.globalAlpha = 0.6; ctx.fillRect(bx + bw, by, 8, (nl - bh) * 2); ctx.globalAlpha = 1; D.txt(ctx, 'ينسكب!', bx + bw + 30, by + 20, { color: c.c2, size: 14, w: '700', align: 'left' }); }
        ctx.strokeStyle = c.muted; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(bx - 10, by + bh - lv); ctx.lineTo(bx + bw + 10, by + bh - lv); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = c.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
        D.txt(ctx, 'ΔV = ' + P.sct(d.dX) + ' L', W / 2, H - 16, { color: c.c2, size: 15, w: '700' });
        D.txt(ctx, NAME[p.mat] + ' — V₁ = ' + p.V1 + ' L', W / 2, 22, { color: c.text, size: 15, w: '700' });
      }
    },
    graph(p, d) {
      const keys = d.vol ? Object.keys(P.betaLiquid) : Object.keys(P.alphaLinear); const X1 = d.vol ? p.V1 : p.L1; const tbl = d.vol ? P.betaLiquid : P.alphaLinear; const sc = d.vol ? 1e-4 : 1e-6;
      const ymax = D.niceMax(Math.max(...keys.map((k) => tbl[k])) * sc * X1 * 250, 1e-9);
      return { view: { xmin: -100, xmax: 250, ymin: -ymax * 0.4, ymax: ymax }, xLabel: 'ΔT (°C)', yLabel: d.vol ? 'ΔV (L)' : 'ΔL (m)', caption: 'لكل مادة خط مستقيم يمر بالأصل ميله $' + (d.vol ? '\\beta V_1' : '\\alpha L_1') + '$. المادة المختارة بالخط العريض؛ التمدد سالب (انكماش) عند التبريد.', draw(G) { const c = G.colors(); keys.forEach((k) => G.fn((x) => tbl[k] * sc * X1 * x, { color: k === p.mat ? c.c2 : c.muted, width: k === p.mat ? 4 : 1.5, domain: [-100, 250] })); G.point(d.dT, d.dX, { color: c.c1 }); } };
    },
    live(p, d) { return d.vol ? '\\Delta V = \\beta V_1 \\Delta T = ' + P.sci(d.coef) + ' \\times ' + p.V1 + ' \\times ' + d.dT + ' = ' + q(d.dX, 'L') : '\\Delta L = \\alpha L_1 \\Delta T = ' + P.sci(d.coef) + ' \\times ' + p.L1 + ' \\times ' + d.dT + ' = ' + q(d.dX, 'm'); },
    results(p, d) { return d.vol ? [['معامل التمدد الحجمي', q(d.coef, '^\\circ C^{-1}')], ['التغير في الحجم', q(d.dX, 'L'), true, d.dX >= 0 ? 'pos' : 'neg'], ['الحجم الجديد', q(d.X2, 'L')], ['تحليل الأبعاد', '{}^\\circ\\mathrm{C}^{-1} \\cdot \\mathrm{L} \\cdot {}^\\circ\\mathrm{C} = \\mathrm{L}']] : [['معامل التمدد الطولي', q(d.coef, '^\\circ C^{-1}')], ['الاستطالة', q(d.dX, 'm') + ' = ' + q(d.dX * 1000, 'mm'), true, d.dX >= 0 ? 'pos' : 'neg'], ['الطول الجديد', q(d.X2, 'm', 8)], ['تحليل الأبعاد', '{}^\\circ\\mathrm{C}^{-1} \\cdot \\mathrm{m} \\cdot {}^\\circ\\mathrm{C} = \\mathrm{m}']]; },
    steps(p, d) { return ['$\\Delta T = ' + p.T2 + ' - ' + p.T1 + ' = ' + d.dT + '$ °C.', d.vol ? '$\\Delta V = ' + P.sci(d.coef) + ' \\times ' + p.V1 + ' \\times ' + d.dT + ' = ' + P.sci(d.dX) + '$ لتر.' : '$\\Delta L = ' + P.sci(d.coef) + ' \\times ' + p.L1 + ' \\times ' + d.dT + ' = ' + P.sci(d.dX) + '$ م.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.mat !== b.mat || a.kind !== b.kind) o.push('غيّرت المادة إلى ' + NAME[b.mat] + ': معامل تمددها $' + P.sci(db.coef) + '$ فصار التمدد $' + P.sci(db.dX) + '$. كل مادة تتمدد بمقدار مختلف بحسب قوى الترابط بين جزيئاتها.');
      if (a.T1 !== b.T1 || a.T2 !== b.T2) o.push(db.dT < 0 ? 'التغير في درجة الحرارة سالب: الجسم **ينكمش** بمقدار $' + P.sci(Math.abs(db.dX)) + '$.' : 'زاد التغير في درجة الحرارة إلى ' + db.dT + ' °C فزاد التمدد بالنسبة نفسها (تناسب طردي).');
      if (a.L1 !== b.L1 || a.V1 !== b.V1) o.push('الأطول (أو الأكبر حجماً) يتمدد أكثر: التمدد يتناسب طردياً مع الطول/الحجم الأصلي.');
      return o;
    },
    learn: ['**التمدد الطولي (ص 99):** $\\Delta L = \\alpha L_1 \\Delta T$، و $\\alpha$ معامل التمدد الطولي بوحدة °C⁻¹.', '**مثال (4) ص 100:** سلك نحاس 3 م سُخّن من 20 إلى 50 °س فصار 3.0015 م: $\\alpha = 16.67 \\times 10^{-6}$ °C⁻¹ (والجدول يعطي 17 × 10⁻⁶).', '**التمدد الحجمي للسوائل (ص 103):** $\\Delta V = \\beta V_1 \\Delta T$. **مثال (5):** 2 لتر زيت تربنتين من 10 إلى 60 °س: ينسكب 0.09 لتر.', '**تطبيقات:** تُترك فراغات بين قضبان السكك الحديدية والجسور.'],
    challenges: [
      { q: 'مثال (4) ص 100: سلك نحاس طوله 3 م سُخّن من 20 إلى 50 °س. ما الاستطالة؟', hint: 'طولي، نحاس، $L_1 = 3$، $T_1 = 20$، $T_2 = 50$.', init: { kind: 'lin', mat: 'iron', L1: 1, T1: 0, T2: 10 }, check: (p) => p.kind === 'lin' && p.mat === 'copper' && p.L1 === 3 && p.T1 === 20 && p.T2 === 50, why: (p, d) => '$\\Delta L = ' + P.sci(d.dX) + '$ م ≈ 1.5 ملم.' },
      { q: 'مثال (5) ص 103: أسطوانة فيها 2 لتر زيت تربنتين سُخّنت من 10 إلى 60 °س. كم ينسكب؟', hint: 'حجمي، تربنتين، $V_1 = 2$، $T_1 = 10$، $T_2 = 60$.', init: { kind: 'lin', mat: 'copper', V1: 1, T1: 0, T2: 10 }, check: (p) => p.kind === 'vol' && p.mat === 'turpentine' && p.V1 === 2 && p.T1 === 10 && p.T2 === 60, why: (p, d) => '$\\Delta V = ' + P.sci(d.dX) + '$ لتر.' },
      { q: 'سؤال ص 100: قضيب حديد طوله 5 م يُسخّن من 10 إلى 80 °س. ما مقدار تمدده؟', hint: 'طولي، حديد، $L_1 = 5$، $T_1 = 10$، $T_2 = 80$.', init: { kind: 'lin', mat: 'copper', L1: 1, T1: 0, T2: 10 }, check: (p) => p.kind === 'lin' && p.mat === 'iron' && p.L1 === 5 && p.T1 === 10 && p.T2 === 80, why: (p, d) => '$\\Delta L = ' + P.sci(d.dX) + '$ م لكل قضيب.' }
    ],
    tutor: [
      { q: 'لماذا تتمدد المواد بالتسخين؟', k: ['تتمدد', 'لماذا', 'التسخين'], a: () => 'بالتسخين تزداد الطاقة الحركية للجزيئات فتهتز بسعة أكبر، فيزداد متوسط المسافة بينها ويكبر حجم الجسم.' },
      { q: 'لماذا تترك فراغات بين قضبان السكك؟', k: ['فراغات', 'السكك', 'قضبان'], a: (p, d) => 'لأن القضبان تتمدد صيفاً؛ لو لم تُترك فراغات لانحنت. مثلاً قضيب حديد 5 م يتمدد ' + f2(11e-6 * 5 * 40 * 1000, 3) + ' ملم إذا ارتفعت حرارته 40 °س.' }
    ]
  });

  /* ======================= 1-6 موازين الحرارة والتدريجات ======================= */
  ML.register({
    subject: S, id: 'temp-scales', ar: { T_C: 'س', T_F: 'ف', T_K: 'ط' }, unit: U, order: 5, lesson: '1-6', lessonTitle: 'موازين الحرارة', page: 104,
    titleAr: 'تدريجات درجة الحرارة: سيلسيوس وفهرنهايت وكلفن', titleEn: 'Temperature Scales: Celsius, Fahrenheit, Kelvin', tags: 'سيلسيوس فهرنهايت كلفن مطلق صفر مطلق تحويل ميزان حراره',
    formula: 'T_F = \\tfrac{9}{5} T_C + 32, \\qquad T_K = T_C + 273',
    book: '°ف = 9/5 °س + 32 ، ط = °س + 273 (ص 105)',
    summary: 'للتعبير عن درجة الحرارة عدة تدريجات. في سيلسيوس يتجمد الماء عند 0 ويغلي عند 100، وفي فهرنهايت عند 32 و 212، وفي كلفن (المطلق) عند 273 و 373. لا توجد درجة حرارة أقل من الصفر المطلق.',
    vars: [['T_C', 'درجة الحرارة بالسيلسيوس', '^\\circ\\mathrm{C}', '−273 – 500 (لا أقل من الصفر المطلق)'], ['T_F', 'بالفهرنهايت', '^\\circ\\mathrm{F}', 'يُحسب'], ['T_K', 'بالكلفن (المطلق)', '\\mathrm{K}', '≥ 0']],
    assumptions: ['يستخدم الكتاب 273 (وليس 273.15) للتحويل إلى كلفن.'],
    params: [{ key: 'C', label: 'T_C\\ (^\\circ\\mathrm{C})', min: -273, max: 500, step: 1, value: 35 }],
    custom: true, canvasHint: 'ثلاثة موازين للدرجة نفسها؛ الخطوط المتقطعة: تجمد الماء وغليانه.',
    graphModes: ['°F – °C', 'K – °C'],
    compute(p) { return { F: P.cToF(p.C), K: P.cToK(p.C) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const top = 60, bot = H - 50; const Y = (C) => bot - (C + 273) / 773 * (bot - top);
      const cols = [[W * 0.22, '°C', p.C, (x) => x], [W * 0.5, '°F', d.F, P.cToF], [W * 0.78, 'K', d.K, P.cToK]];
      [[0, 'تجمد الماء'], [100, 'غليان الماء'], [-273, 'الصفر المطلق']].forEach((m) => { ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(W * 0.1, Y(m[0])); ctx.lineTo(W * 0.9, Y(m[0])); ctx.stroke(); ctx.setLineDash([]); D.txt(ctx, m[1], W * 0.09, Y(m[0]), { color: c.muted, size: 10, align: 'right' }); });
      cols.forEach((t) => {
        const x = t[0]; ctx.strokeStyle = c.axis; ctx.lineWidth = 2; D.rr(ctx, x - 9, top, 18, bot - top, 9); ctx.stroke();
        ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(x, bot + 10, 14, 0, 7); ctx.fill(); ctx.fillRect(x - 5, Y(p.C), 10, bot - Y(p.C) + 4);
        [0, 100].forEach((m) => D.txt(ctx, f2(t[3](m)), x + 16, Y(m), { color: c.text, size: 11, align: 'left' }));
        D.txt(ctx, f2(t[2], 2) + ' ' + t[1], x, top - 22, { color: c.text, size: 16, w: '700' });
      });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: -300, xmax: 500, ymin: 0, ymax: 800 }, xLabel: 'T_C (°C)', yLabel: 'T_K (K)', caption: 'خط ميله 1: الفرق بين درجتين متساوٍ في سيلسيوس وكلفن. يقطع المحور الأفقي عند −273 (الصفر المطلق).', draw(G) { const c = G.colors(); G.fn((x) => x + 273, { color: c.c3, width: 3, domain: [-273, 500] }); G.point(p.C, d.K, { color: c.c2 }); } };
      return { view: { xmin: -300, xmax: 500, ymin: -500, ymax: 950 }, xLabel: 'T_C (°C)', yLabel: 'T_F (°F)', caption: 'خط ميله $9/5$ ومقطعه 32. يتقاطع مع الخط $T_F = T_C$ (المتقطع) عند −40.', draw(G) { const c = G.colors(); G.fn((x) => 1.8 * x + 32, { color: c.c1, width: 3, domain: [-273, 500] }); G.fn((x) => x, { color: c.muted, width: 1.5, dash: [5, 5] }); G.point(p.C, d.F, { color: c.c2 }); } };
    },
    live(p, d) { return 'T_F = \\tfrac95(' + p.C + ') + 32 = ' + f2(d.F) + ',\\quad T_K = ' + p.C + ' + 273 = ' + d.K; },
    results(p, d) { return [['سيلسيوس', q(p.C, '^\\circ C')], ['فهرنهايت', q(d.F, '^\\circ F'), true, 'pos'], ['كلفن (مطلق)', q(d.K, 'K'), true, 'pos'], ['التحقق العكسي', 'T_C = \\tfrac59(T_F - 32) = ' + f2(P.fToC(d.F))]]; },
    steps(p, d) { return ['$T_F = \\frac{9}{5} \\times ' + p.C + ' + 32 = ' + f2(d.F) + '$ °F.', '$T_K = ' + p.C + ' + 273 = ' + d.K + '$ K.']; },
    explain(a, b, da, db) { return ['صارت درجة الحرارة ' + b.C + ' °C = ' + f2(db.F) + ' °F = ' + db.K + ' K. كل درجة سيلسيوس = 1.8 درجة فهرنهايت = 1 كلفن.' + (b.C === -273 ? ' **هذا هو الصفر المطلق**: أدنى درجة حرارة ممكنة.' : '')]; },
    learn: ['**التحويلات (ص 105):** $T_F = \\frac{9}{5} T_C + 32$ و $T_C = \\frac{5}{9}(T_F - 32)$ و $T_K = T_C + 273$.', '**مثال (6) ص 105:** $95$ °F $= 35$ °C $= 308$ K.', '**الصفر المطلق:** 0 K = −273 °س، لا توجد درجة حرارة أقل منه؛ لذلك لا توجد قيم سالبة في تدريج كلفن.'],
    challenges: [
      { q: 'مثال (6) ص 105: حوّل 95 °F إلى سيلسيوس وكلفن.', hint: '$T_C = \\frac59(95 - 32) = 35$.', init: { C: 0 }, check: (p, d) => M.near(d.F, 95), why: () => '35 °C = 308 K.' },
      { q: 'جد الدرجة التي تتساوى عندها قراءتا سيلسيوس وفهرنهايت.', hint: 'حل $T = \\frac95 T + 32$.', init: { C: 0 }, check: (p) => p.C === -40 },
      { q: 'اجعل قراءة كلفن 373 K. ماذا يحدث للماء؟', hint: '$T_C = 100$.', init: { C: 0 }, check: (p, d) => d.K === 373, why: () => 'يغلي الماء (212 °F).' }
    ],
    tutor: [
      { q: 'لماذا لا توجد قيم سالبة في كلفن؟', k: ['سالبه', 'كلفن', 'المطلق'], a: () => 'لأن صفر كلفن هو الصفر المطلق (−273 °س)، أدنى درجة حرارة ممكنة نظرياً؛ عندها تكون الطاقة الحركية للجزيئات أقل ما يمكن.' },
      { q: 'كيف أحوّل من فهرنهايت؟', k: ['فهرنهايت', 'احول', 'تحويل'], a: (p, d) => '$T_C = \\frac59(T_F - 32)$. مثلاً الآن: $\\frac59(' + f2(d.F) + ' - 32) = ' + p.C + '$ °C.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
