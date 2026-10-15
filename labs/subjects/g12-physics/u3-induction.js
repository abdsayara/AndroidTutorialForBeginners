/* فيزياء الثاني عشر — الوحدة الثالثة، الفصل 8: الحث الكهرومغناطيسي (ص123–143) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q, sct = ML.phys.sct;
  const lbl = (ctx, t, x, y, color, cols, size) => D.txt(ctx, t, x, y, { color: color || cols.text, size: size || 12, w: '700', halo: cols.bg });
  // جلفانوميتر: مؤشر ينحرف بنسبة k ∈ [−1, 1]
  function galv(ctx, x, y, r, k, cols) {
    ctx.fillStyle = cols.bg; ctx.strokeStyle = cols.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    const a = -Math.PI / 2 + Math.max(-1, Math.min(1, k)) * 1.2; ctx.strokeStyle = Math.abs(k) > 0.02 ? cols.c2 : cols.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + Math.cos(a) * r * 0.85, y - 2 + Math.sin(a) * r * 0.85); ctx.stroke();
    D.txt(ctx, 'G', x, y + 12, { color: cols.text, size: 12, w: '700' });
  }
  function coil(ctx, x0, cy, len, h, turns, cols) { for (let k = 0; k < turns; k++) { const x = x0 + len * (k + 0.5) / turns; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, cy, 5, h, 0, 0, Math.PI * 2); ctx.stroke(); } }

  /* ======================= 1-8 إلى 3-8 التدفق وقانون فارادي ص124–127 ======================= */
  K.reg({
    id: 'faraday-law', unit: 8, order: 1, lesson: '3-8', lessonTitle: 'التدفق المغناطيسي وقانون فارادي', page: 125,
    titleAr: 'قانون فارادي: القوة الدافعة الحثية', titleEn: 'Magnetic Flux and Faraday’s Law', tags: 'حث كهرومغناطيسي تيار حثي تدفق مغناطيسي ويبر فارادي جلفانوميتر ملف نشاط 1-8',
    formula: '\\Phi_B = BA\\cos\\theta ,\\qquad \\varepsilon_{ave} = -N\\frac{\\Delta\\Phi}{\\Delta t} ,\\qquad I = \\frac{\\varepsilon}{R}',
    book: 'نشاط (1-8) التيار الحثي ص124: ينحرف مؤشر الجلفانوميتر لحظة غلق الدارة وفتحها فقط. القانون (8-1) ص125 والقانونان (8-4) و(8-5) ص127.',
    summary: 'يتولد تيار حثي في ملف فقط عندما يتغير التدفق المغناطيسي خلاله، بتغيّر المجال أو المساحة أو زاوية الملف. القوة الدافعة الحثية المتوسطة تتناسب طردياً مع عدد اللفات ومعدل تغير التدفق، والإشارة السالبة تعني أنها تقاوم التغير.',
    vars: [['N', 'عدد اللفات', '—', '1 – 500'], ['A', 'مساحة الملف', '\\mathrm{cm^2}', '10 – 500'], ['B_1 \\to B_2', 'المجال قبل التغير وبعده', '\\mathrm{T}', '0 – 1'], ['\\Delta t', 'زمن التغير', '\\mathrm{s}', '0.1 – 2']],
    assumptions: ['المجال يتغير بانتظام خلال Δt ثم يثبت.', 'θ الزاوية بين المجال والعمودي على مستوى الملف.'],
    params: [
      { key: 'N', label: 'N', min: 1, max: 500, step: 1, value: 100 },
      { key: 'A', label: 'A\\ (\\mathrm{cm^2})', min: 10, max: 500, step: 10, value: 100 },
      { key: 'B1', label: 'B_1\\ (\\mathrm{T})', min: 0, max: 1, step: 0.05, value: 0 },
      { key: 'B2', label: 'B_2\\ (\\mathrm{T})', min: 0, max: 1, step: 0.05, value: 0.5 },
      { key: 'th', label: '\\theta\\ (^\\circ)', min: 0, max: 90, step: 5, value: 0 },
      { key: 'dt', label: '\\Delta t\\ (\\mathrm{s})', min: 0.1, max: 2, step: 0.1, value: 0.5 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t = Math.min(st.t + dt, p.dt + 1.5); },
    isDone: (st, p) => st.t >= p.dt + 1.5,
    compute(p) {
      const A = p.A * 1e-4, c = Math.cos(p.th * Math.PI / 180); const P1 = p.B1 * A * c, P2 = p.B2 * A * c; const dP = P2 - P1;
      const e = Math.abs(dP) < 1e-15 ? 0 : -p.N * dP / p.dt; return { P1: P1, P2: P2, dP: dP, e: e };
    },
    live(p, d) { return '\\varepsilon_{ave} = -N\\frac{\\Delta\\Phi}{\\Delta t} = -' + p.N + ' \\times \\frac{' + ML.phys.sci(d.dP, 3) + '}{' + p.dt + '} = ' + q(d.e, 'V', 3); },
    results(p, d) { return [['التدفق قبل التغير Φ₁', q(d.P1, 'Wb', 3)], ['التدفق بعد التغير Φ₂', q(d.P2, 'Wb', 3)], ['القوة الدافعة الحثية المتوسطة', q(d.e, 'V', 3), true, 'pos'], ['متى يتولد التيار؟', d.e === 0 ? 'لا يتولد: التدفق لم يتغير' : 'خلال زمن التغير فقط', false]]; },
    steps(p, d) { return ['Φ = BA cosθ: Φ₁ = ' + sct(d.P1, 3) + ' Wb ، Φ₂ = ' + sct(d.P2, 3) + ' Wb.', 'ΔΦ = ' + sct(d.dP, 3) + ' Wb.', 'ε = −N ΔΦ/Δt = ' + sct(d.e, 3) + ' V' + (d.e === 0 ? ' (لا تغير ⇒ لا تيار حثي).' : '.')]; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const t = st.t; const ramp = t < 0.5 ? 0 : Math.min(1, (t - 0.5) / p.dt); const B = p.B1 + (p.B2 - p.B1) * ramp;
      const changing = t >= 0.5 && t < 0.5 + p.dt; const eNow = changing ? d.e : 0; const cx = W * 0.42, cy = H * 0.45, R = Math.min(W, H) * (0.12 + 0.2 * p.A / 500);
      const nl = Math.round(B * 8); for (let k = 0; k < nl; k++) { const y = cy - R * 1.1 + (k + 0.5) * 2.2 * R / Math.max(1, nl); D.arrow(ctx, cx - R * 1.6, y, cx + R * 1.6, y, cols.c1, 1.5); }
      ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.max(0.08, Math.cos(p.th * Math.PI / 180)) * 0.35, 1); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      K.wire(ctx, [[cx, cy + R], [cx, H * 0.88], [W * 0.78, H * 0.88], [W * 0.78, H * 0.82]], cols); galv(ctx, W * 0.78, H * 0.8, 28, eNow / Math.max(Math.abs(d.e), 1e-9) * (d.e ? 1 : 0), cols);
      lbl(ctx, 'B = ' + n(B, 3) + ' T', cx, cy - R * 1.25 - 10, cols.c1, cols, 13);
      D.txt(ctx, changing ? 'التدفق يتغير: ε = ' + sct(d.e, 3) + ' V' : 'التدفق ثابت: لا تيار حثي', W / 2, H * 0.07, { color: changing && d.e ? cols.c2 : cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d, gi) {
      const T = p.dt + 1.5; const Phi = (t) => d.P1 + (d.P2 - d.P1) * (t < 0.5 ? 0 : Math.min(1, (t - 0.5) / p.dt)); const st = d.st || { t: 0 };
      if (gi === 1) { const m = Math.max(Math.abs(d.e), 1e-6); return { view: { xmin: 0, xmax: T, ymin: -m * 1.3, ymax: m * 1.3 }, xLabel: 't (s)', yLabel: 'ε (V)', caption: 'القوة الدافعة الحثية تظهر فقط أثناء تغير التدفق.', draw(G) { const c = G.colors(); G.segment(0, 0, 0.5, 0, { color: c.c2, width: 3 }); G.segment(0.5, d.e, 0.5 + p.dt, d.e, { color: c.c2, width: 3 }); G.segment(0.5 + p.dt, 0, T, 0, { color: c.c2, width: 3 }); G.vline(st.t, { color: c.muted, dash: [4, 4] }); } }; }
      const lo = Math.min(0, d.P1, d.P2), hi = Math.max(1e-6, d.P1, d.P2); return { view: { xmin: 0, xmax: T, ymin: lo * 1.2, ymax: hi * 1.25 }, xLabel: 't (s)', yLabel: 'Φ (Wb)', caption: 'التدفق المغناطيسي عبر الملف مع الزمن.', draw(G) { const c = G.colors(); G.fn(Phi, { color: c.c1, width: 3, domain: [0, T] }); G.point(st.t, Phi(st.t), { color: c.c2 }); } };
    },
    graphModes: ['Φ – t', 'ε – t'],
    explain(a, b, da, db) { const o = []; if (a.dt !== b.dt) o.push('تغيير التدفق بسرعة أكبر (Δt أصغر) يزيد القوة الدافعة الحثية.'); if (a.th !== b.th && b.th === 90) o.push('مستوى الملف موازٍ للمجال: التدفق صفر دائماً.'); return o; },
    learn: ['**نشاط (1-8) ص124:** لا يتولد تيار في الملف الثاني والتيار ثابت، بل لحظة غلق الدارة وفتحها (بانحرافين متعاكسين).', '**التدفق (8-1) ص125:** Φ = BA cosθ ويقاس بالويبر Wb = T.m².', '**قانون فارادي (8-4) ص127:** ε = −N ΔΦ/Δt ، والتيار الحثي I = ε/R (8-5).'],
    challenges: [
      { q: 'نشاط (1-8): اجعل المجال قوياً لكنه ثابت. هل يتولد تيار؟', hint: 'اجعل B₁ = B₂ ≠ 0.', init: { B1: 0, B2: 0.5 }, check: (p) => p.B1 === p.B2 && p.B1 > 0, why: () => 'لا تيار حثي: لا تغير في التدفق.' },
      { q: 'اجعل القوة الدافعة الحثية المتوسطة 10 V (قيمة مطلقة).', hint: 'زد N أو A أو ΔB أو قلل Δt.', init: { N: 100, A: 100, B1: 0, B2: 0.5, th: 0, dt: 0.5 }, check: (p, d) => Math.abs(Math.abs(d.e) - 10) < 1e-6, why: () => 'مثلاً N = 500 و A = 200 cm² و ΔB = 0.5 T و Δt = 0.5 s.' }
    ],
    tutor: [
      { q: 'لماذا لا يتولد تيار والتيار في الملف الأول ثابت؟', k: ['ثابت', 'لا يتولد'], a: () => K.tutor('هل يتغير التدفق في الملف الثاني؟', 'التيار الحثي يتطلب تغيراً في التدفق، والمجال الثابت لا يغيره.') },
      { q: 'ما معنى الإشارة السالبة في قانون فارادي؟', k: ['سالبه', 'اشاره'], a: () => K.tutor('هل يساعد التيار الحثي التغير أم يقاومه؟', 'القوة الدافعة الحثية تقاوم التغير في التدفق (قانون لنز).') },
      { q: 'ما طرق تغيير التدفق؟', k: ['طرق', 'تغيير'], a: () => K.tutor('انظر إلى Φ = BA cosθ.', 'تغيير المجال B أو المساحة A أو الزاوية θ (الدوران).') }
    ]
  });

  /* ======================= القوة الدافعة الحركية ص126–127 ======================= */
  K.reg({
    id: 'motional-emf', unit: 8, order: 2, lesson: '3-8', lessonTitle: 'القوة الدافعة الكهربائية الحثية الحركية', page: 127,
    titleAr: 'موصل ينزلق على سكتين في مجال مغناطيسي', titleEn: 'Motional EMF', tags: 'قوة دافعة حثية حركية موصل منزلق سكة مجرى U قوة خارجية مثال 1',
    formula: '\\varepsilon = vBL ,\\qquad I = \\frac{\\varepsilon}{R} ,\\qquad F_{ext} = ILB',
    book: 'القانونان (8-2) و(8-3) ص126 والشكل (4-8). مثال (1) ص127: L = 40 cm ، R = 5 Ω ، B = 0.3 T ، v = 3 m/s ⇒ ε = 0.36 V ، I = 0.072 A عكس عقارب الساعة ، F_ext = 0.00864 N.',
    summary: 'عند سحب موصل في مجال مغناطيسي تنفصل شحناته فتتولد بين طرفيه قوة دافعة ε = vBL. إذا أُغلقت الدارة يمر تيار حثي، ويؤثر المجال في الموصل بقوة تعاكس حركته، فيلزم قوة خارجية تساويها لإبقاء السرعة ثابتة؛ وشغلها يتحول طاقةً كهربائية.',
    vars: [['L', 'طول الموصل', '\\mathrm{m}', '0.1 – 1'], ['B', 'المجال (للداخل ⊗)', '\\mathrm{T}', '0.1 – 1'], ['v', 'السرعة', '\\mathrm{m/s}', '0.5 – 10'], ['R', 'المقاومة', '\\Omega', '1 – 20']],
    assumptions: ['السكتان والموصل بلا مقاومة وبلا احتكاك.'],
    params: [
      { key: 'L', label: 'L\\ (\\mathrm{m})', min: 0.1, max: 1, step: 0.05, value: 0.5 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0.1, max: 1, step: 0.05, value: 0.5 },
      { key: 'v', label: 'v\\ (\\mathrm{m/s})', min: 0.5, max: 10, step: 0.5, value: 2 },
      { key: 'R', label: 'R\\ (\\Omega)', min: 1, max: 20, step: 0.5, value: 4 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; if (st.t > 4) st.t = 0; },
    compute(p) { const e = Q.motional(p.B, p.L, p.v); const I = e / p.R; return { e: e, I: I, F: I * p.L * p.B, P: e * I }; },
    live(p, d) { return '\\varepsilon = vBL = ' + p.v + ' \\times ' + p.B + ' \\times ' + p.L + ' = ' + q(d.e, 'V', 4) + ' ,\\quad I = \\frac{' + n(d.e, 4) + '}{' + p.R + '} = ' + q(d.I, 'A', 4); },
    results(p, d) { return [['القوة الدافعة الحثية ε', q(d.e, 'V', 4), true, 'pos'], ['التيار الحثي I', q(d.I, 'A', 4), true], ['اتجاه التيار', 'عكس عقارب الساعة', false], ['القوة الخارجية اللازمة', q(d.F, 'N', 4)], ['القدرة الكهربائية = F v', q(d.P, 'W', 4)]]; },
    steps(p, d) { return ['ε = vBL = ' + p.v + ' × ' + p.B + ' × ' + p.L + ' = ' + n(d.e, 4) + ' V.', 'I = ε/R = ' + n(d.I, 4) + ' A.', 'F_ext = ILB = ' + n(d.F, 5) + ' N باتجاه الحركة (+x).']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const x0 = W * 0.12, x1 = W * 0.92, yT = H * 0.25, h = H * 0.22 + H * 0.35 * p.L, yB = yT + h; const st = d.st || { t: 0 };
      K.fieldGrid(ctx, x0, yT - 10, x1 - x0, h + 20, false, cols.grid, 38);
      K.wire(ctx, [[x1, yT], [x0, yT], [x0, yT + h * 0.3]], cols, cols.text, 3); K.resistor(ctx, x0, yT + h * 0.3, x0, yT + h * 0.7, 'R = ' + p.R + ' Ω', cols); K.wire(ctx, [[x0, yT + h * 0.7], [x0, yB], [x1, yB]], cols, cols.text, 3);
      const xr = x0 + 70 + ((st.t * (20 + p.v * 12)) % (x1 - x0 - 100)); ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(xr, yT - 8); ctx.lineTo(xr, yB + 8); ctx.stroke();
      lbl(ctx, 'a', xr + 12, yT - 12, cols.c5, cols); lbl(ctx, 'b', xr + 12, yB + 14, cols.c5, cols);
      K.vec(ctx, xr, (yT + yB) / 2 - 20, 50, 0, cols.c3, 'v', cols); K.vec(ctx, xr, (yT + yB) / 2 + 20, -45, 0, cols.c2, 'F', cols);
      D.arrow(ctx, xr + 18, yB - 30, xr + 18, yT + 30, cols.c4, 2.5); lbl(ctx, 'I', xr + 30, (yT + yB) / 2, cols.c4, cols, 13);
      D.txt(ctx, 'ε = ' + n(d.e, 4) + ' V   I = ' + n(d.I, 4) + ' A', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 10, ymin: 0, ymax: 10 * p.B * p.L * 1.1 }, xLabel: 'v (m/s)', yLabel: 'ε (V)', caption: 'القوة الدافعة الحثية تتناسب طردياً مع سرعة الموصل.', draw(G) { const c = G.colors(); G.fn((v) => v * p.B * p.L, { color: c.c1, width: 3, domain: [0, 10] }); G.point(p.v, d.e, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.v !== b.v) o.push('السرعة الأكبر تقطع خطوط مجال أكثر في الثانية فتزيد القوة الدافعة.'); if (a.R !== b.R) o.push('المقاومة الأكبر تقلل التيار والقوة الخارجية اللازمة.'); return o; },
    learn: ['**(8-2) و(8-3) ص126:** تتزن القوتان qE و qvB داخل الموصل فيكون E = vB ، و ε = vBL.', '**الشكل (4-8):** القوة المغناطيسية على الموصل الذي يحمل التيار الحثي تعاكس حركته، فيلزم F_ext = ILB لإبقاء السرعة ثابتة.', 'شغل القوة الخارجية يتحول إلى طاقة كهربائية (حفظ الطاقة).'],
    challenges: [
      { q: 'مثال (1): L = 40 cm ، R = 5 Ω ، B = 0.3 T ، v = 3 m/s. أوجد ε و I و F_ext.', hint: 'L = 0.4 ، B = 0.3 ، v = 3 ، R = 5.', init: { L: 0.5, B: 0.5, v: 2, R: 4 }, check: (p) => Math.abs(p.L - 0.4) < 1e-9 && Math.abs(p.B - 0.3) < 1e-9 && p.v === 3 && p.R === 5, why: () => 'ε = 0.36 V ، I = 0.072 A ، F = 0.00864 N.' },
      { q: 'بقيم مثال (1)، ضاعف التيار الحثي إلى 0.144 A بتغيير السرعة فقط.', hint: 'v = 6.', init: { L: 0.4, B: 0.3, v: 3, R: 5 }, check: (p, d) => Math.abs(p.L - 0.4) < 1e-9 && Math.abs(p.B - 0.3) < 1e-9 && p.R === 5 && Math.abs(d.I - 0.144) < 1e-9, why: () => 'v = 6 m/s ، وتتضاعف القوة الخارجية أيضاً.' }
    ],
    tutor: [
      { q: 'لماذا نحتاج قوة خارجية لتحريك الموصل بسرعة ثابتة؟', k: ['خارجيه', 'ثابته'], a: () => K.tutor('ما اتجاه القوة المغناطيسية على التيار الحثي في الموصل؟', 'المجال يؤثر في التيار الحثي بقوة تعاكس الحركة، فيلزم قوة خارجية تساويها.') },
      { q: 'من أين تأتي الطاقة الكهربائية؟', k: ['طاقه'], a: () => K.tutor('من يبذل الشغل؟', 'من شغل القوة الخارجية: F v = εI.') },
      { q: 'كيف أحدد اتجاه التيار الحثي؟', k: ['اتجاه'], a: () => K.tutor('ما اتجاه القوة qv × B على الشحنات الموجبة في الموصل؟', 'في الشكل: من b إلى a داخل الموصل، أي عكس عقارب الساعة في الدارة.') }
    ]
  });

  /* ======================= 4-8 قانون لنز ص128–129 ======================= */
  const lenzPhi = (x) => 1 / Math.pow(1 + x * x, 1.5);
  K.reg({
    id: 'lenz-law', unit: 8, order: 3, lesson: '4-8', lessonTitle: 'قانون لنز', page: 128,
    titleAr: 'قانون لنز: مغناطيس يقترب من ملف', titleEn: 'Lenz’s Law', tags: 'قانون لنز تيار حثي يقاوم التغير مغناطيس ملف قطب شمالي جنوبي تنافر تجاذب حفظ الطاقة مثال 2',
    formula: '\\varepsilon_{ave} = -N\\frac{\\Delta\\Phi}{\\Delta t}',
    book: 'قانون لنز وخطوات تحديد اتجاه التيار الحثي ص128، والشكل (5-8)، ومثال (2) ص129: تقريب مغناطيس من ملف يولد تياراً حثياً يقاوم الزيادة في التدفق.',
    summary: 'يكون اتجاه التيار الحثي بحيث يقاوم التغير في التدفق الذي سببه. عند تقريب قطب من الملف يصبح وجه الملف القريب قطباً مماثلاً فيتنافران، وعند إبعاده يصبح قطباً مخالفاً فيتجاذبان؛ وهذا تطبيق لحفظ الطاقة.',
    vars: [['\\text{القطب}', 'قطب المغناطيس المواجه للملف', '—', 'N / S'], ['\\text{الحركة}', 'تقريب / إبعاد / سكون', '—', '—'], ['v', 'سرعة المغناطيس', '\\text{نسبية}', '1 – 5'], ['\\varepsilon', 'القوة الدافعة الحثية', '\\text{نسبية}', '—']],
    assumptions: ['قيم التدفق والقوة الدافعة في الرسم نسبية لتوضيح الإشارة والشكل: ' + Q.SIMPLE + '.'],
    params: [
      { key: 'pole', label: '\\text{القطب المواجه}', type: 'select', value: 'N', options: [['N', 'شمالي N'], ['S', 'جنوبي S']] },
      { key: 'mot', label: '\\text{الحركة}', type: 'select', value: 'in', options: [['in', 'تقريب'], ['out', 'إبعاد'], ['still', 'سكون']] },
      { key: 'v', label: 'v', min: 1, max: 5, step: 1, value: 2 }
    ],
    resetOn: ['mot', 'v', 'pole'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t = Math.min(st.t + dt, 3.5 / p.v); },
    isDone: (st, p) => st.t >= 3.5 / p.v,
    compute(p) {
      const sgn = p.pole === 'N' ? 1 : -1; const T = 3.5 / p.v;
      const x = (t) => (p.mot === 'in' ? 4 - p.v * t : p.mot === 'out' ? 0.5 + p.v * t : 1.5);
      const phi = (t) => sgn * lenzPhi(x(t)); const emf = (t) => -(phi(t + 1e-4) - phi(t - 1e-4)) / 2e-4;
      const face = p.mot === 'still' ? null : p.mot === 'in' ? p.pole : (p.pole === 'N' ? 'S' : 'N');
      return { T: T, x: x, phi: phi, emf: emf, face: face, force: p.mot === 'still' ? 'none' : p.mot === 'in' ? 'repel' : 'attract' };
    },
    live(p, d) { return p.mot === 'still' ? '\\Delta\\Phi = 0 \\Rightarrow \\varepsilon = 0' : '\\Delta\\Phi ' + (p.mot === 'in' ? '\\uparrow' : '\\downarrow') + ' \\Rightarrow \\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t} \\neq 0'; },
    results(p, d) { return [['التغير في التدفق', p.mot === 'still' ? 'لا تغير' : p.mot === 'in' ? 'يزداد' : 'يتناقص', false], ['قطبية وجه الملف القريب', d.face ? (d.face === 'N' ? 'قطب شمالي N' : 'قطب جنوبي S') : 'لا قطبية (لا تيار)', false, 'pos'], ['القوة بين الملف والمغناطيس', d.force === 'repel' ? 'تنافر يقاوم الاقتراب' : d.force === 'attract' ? 'تجاذب يقاوم الابتعاد' : 'لا قوة', false], ['اتجاه المجال الحثي', d.face ? (p.mot === 'in' ? 'عكس المجال المؤثر' : 'مع المجال المؤثر') : '—', false]]; },
    steps(p, d) { return ['1) المجال المؤثر من القطب ' + p.pole + ' يخترق الملف.', '2) التدفق ' + (p.mot === 'still' ? 'ثابت.' : p.mot === 'in' ? 'يزداد.' : 'يتناقص.'), '3) المجال الحثي ' + (p.mot === 'still' ? 'لا يتولد.' : p.mot === 'in' ? 'بعكس المجال المؤثر ليقاوم الزيادة.' : 'مع المجال المؤثر ليقاوم النقصان.'), '4) ' + (d.face ? 'وجه الملف القريب ' + d.face + ' ⇒ ' + (d.force === 'repel' ? 'تنافر.' : 'تجاذب.') : 'لا تيار حثي.')]; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const cy = H * 0.42, cx0 = W * 0.58, len = W * 0.3, h = H * 0.16; const sc = (W * 0.42) / 4.5;
      coil(ctx, cx0, cy, len, h, 8, cols); const mx = cx0 - 10 - d.x(st.t) * sc; const mw = Math.min(W * 0.22, 130);
      ctx.fillStyle = p.pole === 'N' ? '#64748b' : '#dc2626'; ctx.fillRect(mx - mw, cy - 18, mw / 2, 36); ctx.fillStyle = p.pole === 'N' ? '#dc2626' : '#64748b'; ctx.fillRect(mx - mw / 2, cy - 18, mw / 2, 36);
      D.txt(ctx, p.pole === 'N' ? 'S' : 'N', mx - mw * 0.75, cy, { color: '#fff', size: 15, w: '700' }); D.txt(ctx, p.pole, mx - mw * 0.25, cy, { color: '#fff', size: 15, w: '700' });
      if (p.mot !== 'still') K.vec(ctx, mx - mw / 2, cy - 34, p.mot === 'in' ? 40 : -40, 0, cols.c3, 'v', cols);
      const e = p.mot === 'still' ? 0 : d.emf(st.t); const em = Math.max(...[0, 0.25, 0.5, 0.75, 1].map((f) => Math.abs(d.emf(f * d.T)))) || 1;
      if (d.face) lbl(ctx, d.face, cx0 - 4, cy - h - 16, d.face === 'N' ? '#dc2626' : '#64748b', cols, 18);
      if (d.force !== 'none') { const s = d.force === 'repel' ? -1 : 1; K.vec(ctx, mx - mw / 2, cy + 34, s * 36, 0, cols.c2, d.force === 'repel' ? 'تنافر' : 'تجاذب', cols); }
      K.wire(ctx, [[cx0 + 4, cy + h], [cx0 + 4, H * 0.86], [cx0 + len - 4, H * 0.86], [cx0 + len - 4, cy + h]], cols); galv(ctx, cx0 + len / 2, H * 0.84, 26, e / em, cols);
      D.txt(ctx, 'قانون لنز: التيار الحثي يقاوم التغير', W / 2, H * 0.07, { color: cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d, gi) {
      const st = d.st || { t: 0 }; const T = d.T;
      if (gi === 1) { const f = (t) => (p.mot === 'still' ? 0 : d.emf(t)); let m = 1e-6; for (let i = 0; i <= 40; i++) m = Math.max(m, Math.abs(f(i / 40 * T))); return { view: { xmin: 0, xmax: T, ymin: -m * 1.2, ymax: m * 1.2 }, xLabel: 't', yLabel: 'ε', caption: 'إشارة القوة الدافعة تنعكس بين التقريب والإبعاد (قيم نسبية).', draw(G) { const c = G.colors(); G.fn(f, { color: c.c2, width: 3, domain: [0, T] }); G.hline(0, { color: c.muted }); G.vline(st.t, { color: c.muted, dash: [4, 4] }); } }; }
      return { view: { xmin: 0, xmax: T, ymin: -1.1, ymax: 1.1 }, xLabel: 't', yLabel: 'Φ', caption: 'التدفق عبر الملف يزداد عند التقريب ويقل عند الإبعاد (قيم نسبية).', draw(G) { const c = G.colors(); G.fn(d.phi, { color: c.c1, width: 3, domain: [0, T] }); G.hline(0, { color: c.muted }); G.point(st.t, d.phi(st.t), { color: c.c2 }); } };
    },
    graphModes: ['Φ – t', 'ε – t'],
    explain(a, b, da, db) { const o = []; if (a.mot !== b.mot) o.push(b.mot === 'in' ? 'التقريب يزيد التدفق: الملف يتنافر مع المغناطيس.' : b.mot === 'out' ? 'الإبعاد يقلل التدفق: الملف يجذب المغناطيس.' : 'دون حركة لا يتغير التدفق فلا تيار.'); if (a.pole !== b.pole) o.push('تغيير القطب يعكس اتجاه التيار الحثي.'); return o; },
    learn: ['**قانون لنز ص128:** اتجاه التيار الحثي يقاوم المسبب له، وهو التغير في التدفق.', '**الخطوات:** حدد المجال المؤثر ← هل التدفق يزداد أم يقل؟ ← المجال الحثي عكس المؤثر عند الزيادة ومعه عند النقصان ← اتجاه التيار باليد اليمنى.', 'الإشارة السالبة في قانون فارادي تعبّر عن قانون لنز، وهو تطبيق لحفظ الطاقة.'],
    challenges: [
      { q: 'الشكل (5-8): قرّب القطب الشمالي من الملف. ما قطبية وجه الملف القريب؟', hint: 'اختر N و«تقريب».', init: { pole: 'S', mot: 'out' }, check: (p) => p.pole === 'N' && p.mot === 'in', why: () => 'يصبح الوجه القريب قطباً شمالياً فيتنافر مع المغناطيس.' },
      { q: 'اجعل الملف يجذب المغناطيس.', hint: 'متى يقاوم الملف الابتعاد؟', init: { pole: 'N', mot: 'in' }, check: (p) => p.mot === 'out', why: () => 'عند الإبعاد يتناقص التدفق فيتولد قطب مخالف يجذب المغناطيس.' }
    ],
    tutor: [
      { q: 'لماذا يقاوم التيار الحثي التغير؟', k: ['يقاوم', 'لماذا'], a: () => K.tutor('ماذا يحدث لو ساعد التيار الحثي الحركة؟', 'لو ساعدها لتولدت طاقة من لا شيء؛ قانون لنز تطبيق لحفظ الطاقة.') },
      { q: 'ماذا يحدث عند إبعاد القطب الشمالي؟', k: ['ابعاد', 'شمالي'], a: () => K.tutor('هل يزداد التدفق أم يقل؟', 'يقل التدفق فيصبح الوجه القريب جنوبياً ويجذب المغناطيس.') },
      { q: 'هل يتولد تيار والمغناطيس ساكن داخل الملف؟', k: ['ساكن'], a: () => K.tutor('هل يتغير التدفق؟', 'لا، لا تغير في التدفق فلا تيار حثي.') }
    ]
  });

  /* ======================= 5-8 الحث الذاتي ص129–131 ======================= */
  K.reg({
    id: 'self-induction', unit: 8, order: 4, lesson: '5-8', lessonTitle: 'الحث الذاتي', page: 130,
    titleAr: 'الحث الذاتي: محاثة ملف حلزوني', titleEn: 'Self-Induction and Inductance', tags: 'حث ذاتي محاثة معامل الحث هنري ملف حلزوني قوة دافعة عكسية مثال 3',
    formula: 'L_{in} = \\frac{N\\Phi}{I} = \\frac{\\mu_0 N^2 A}{L} ,\\qquad \\varepsilon = -L_{in}\\frac{\\Delta I}{\\Delta t}',
    book: 'القوانين (8-6) و(8-7) و(8-8) ص129–130. مثال (3) ص131: ملف 300 لفة طوله 0.25 m ومقطعه 4 cm² ⇒ L_in = 1.81 × 10⁻⁴ H ، وعندما يتناقص التيار بمعدل 50 A/s ⇒ ε = 9.05 × 10⁻³ V.',
    summary: 'عند تغير التيار في ملف يتغير تدفقه الذاتي، فتتولد فيه قوة دافعة حثية تقاوم التغير: تعاكس التيار عند زيادته، وتكون باتجاهه عند نقصانه. المحاثة تعتمد على شكل الملف (عدد اللفات والمقطع والطول) لا على التيار.',
    vars: [['N', 'عدد اللفات', '—', '50 – 1000'], ['L', 'طول الملف', '\\mathrm{m}', '0.05 – 1'], ['A', 'مساحة المقطع', '\\mathrm{cm^2}', '1 – 20'], ['\\Delta I/\\Delta t', 'معدل تغير التيار', '\\mathrm{A/s}', '−100 – 100']],
    assumptions: ['الملف حلزوني طويل في الهواء.'],
    params: [
      { key: 'N', label: 'N', min: 50, max: 1000, step: 10, value: 200 },
      { key: 'len', label: 'L\\ (\\mathrm{m})', min: 0.05, max: 1, step: 0.05, value: 0.5 },
      { key: 'A', label: 'A\\ (\\mathrm{cm^2})', min: 1, max: 20, step: 1, value: 6 },
      { key: 'r', label: '\\Delta I/\\Delta t\\ (\\mathrm{A/s})', min: -100, max: 100, step: 5, value: 20 }
    ],
    compute(p) { const Lin = Q.mu0 * p.N * p.N * p.A * 1e-4 / p.len; const e = -Lin * p.r; return { Lin: Lin, e: Math.abs(e) < 1e-15 ? 0 : e }; },
    live(p, d) { return 'L_{in} = \\frac{4\\pi \\times 10^{-7} \\times ' + p.N + '^2 \\times ' + p.A + ' \\times 10^{-4}}{' + p.len + '} = ' + q(d.Lin, 'H', 3) + ' ,\\quad \\varepsilon = ' + q(d.e, 'V', 3); },
    results(p, d) { return [['المحاثة L_in', q(d.Lin, 'H', 3), true, 'pos'], ['القوة الدافعة الحثية الذاتية', q(d.e, 'V', 3), true], ['اتجاهها', p.r > 0 ? 'عكس التيار الأصلي (تقاوم الزيادة)' : p.r < 0 ? 'مع التيار الأصلي (تقاوم النقصان)' : 'لا قوة دافعة: التيار ثابت', false]]; },
    steps(p, d) { return ['n = N/L = ' + n(p.N / p.len) + ' لفة/m.', 'L_in = μ₀ N² A / L = ' + sct(d.Lin, 3) + ' H.', 'ε = −L_in ΔI/Δt = −' + sct(d.Lin, 3) + ' × (' + p.r + ') = ' + sct(d.e, 3) + ' V.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cy = H * 0.48, len = (W - 140) * (0.35 + 0.65 * p.len), x0 = (W - len) / 2, h = 14 + p.A * 3.2; const turns = Math.max(4, Math.min(36, Math.round(p.N / 25)));
      coil(ctx, x0, cy, len, h, turns, cols);
      K.wire(ctx, [[x0, cy + h], [x0 - 30, cy + h + 30], [x0 - 30, H * 0.86], [x0 + len + 30, H * 0.86], [x0 + len + 30, cy + h + 30], [x0 + len, cy + h]], cols);
      D.arrow(ctx, W / 2 - 40, H * 0.86 - 14, W / 2 + 40, H * 0.86 - 14, cols.c1, 3); lbl(ctx, 'I ' + (p.r > 0 ? '↑ يزداد' : p.r < 0 ? '↓ يتناقص' : 'ثابت'), W / 2, H * 0.86 + 16, cols.c1, cols);
      if (p.r !== 0) { const s = p.r > 0 ? -1 : 1; D.arrow(ctx, W / 2 - s * 50, cy - h - 24, W / 2 + s * 50, cy - h - 24, cols.c2, 3); lbl(ctx, 'ε الحثية', W / 2, cy - h - 42, cols.c2, cols, 13); }
      D.txt(ctx, 'Lin = ' + sct(d.Lin, 3) + ' H', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const m = d.Lin * 100; return { view: { xmin: -100, xmax: 100, ymin: -m * 1.1, ymax: m * 1.1 }, xLabel: 'ΔI/Δt (A/s)', yLabel: 'ε (V)', caption: 'ε = −Lin ΔI/Δt: ميل الخط يساوي −Lin.', draw(G) { const c = G.colors(); G.fn((r) => -d.Lin * r, { color: c.c1, width: 3, domain: [-100, 100] }); G.hline(0, { color: c.muted }); G.vline(0, { color: c.muted }); G.point(p.r, d.e, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.N !== b.N) o.push('المحاثة تتناسب مع مربع عدد اللفات.'); if (a.len !== b.len) o.push('إطالة الملف بعدد اللفات نفسه تقلل المحاثة.'); return o; },
    learn: ['**المحاثة (8-6) ص129:** L_in = NΦ/I ، ووحدتها الهنري H = Wb/A.', '**للملف الحلزوني (8-7):** L_in = μ₀N²A/L ؛ لا تعتمد على التيار، وهي موجبة دائماً.', '**(8-8) ص130:** ε = −L_in ΔI/Δt ؛ الهنري: محاثة محث تتولد فيه 1 V عندما يتغير التيار بمعدل 1 A/s.'],
    challenges: [
      { q: 'مثال (3): ملف 300 لفة طوله 0.25 m ومقطعه 4 cm²، والتيار يتناقص بمعدل 50 A/s.', hint: 'N = 300 ، L = 0.25 ، A = 4 ، ΔI/Δt = −50.', init: { N: 200, len: 0.5, A: 6, r: 20 }, check: (p) => p.N === 300 && Math.abs(p.len - 0.25) < 1e-9 && p.A === 4 && p.r === -50, why: () => 'L_in = 1.81×10⁻⁴ H و ε = 9.05×10⁻³ V.' },
      { q: 'أناقش: ضاعف عدد لفات ملف مثال (3) مع بقاء طوله. ماذا يحدث للمحاثة؟', hint: 'N = 600.', init: { N: 300, len: 0.25, A: 4, r: -50 }, check: (p) => p.N === 600 && Math.abs(p.len - 0.25) < 1e-9 && p.A === 4, why: () => 'تتضاعف أربع مرات: 7.24×10⁻⁴ H.' }
    ],
    tutor: [
      { q: 'هل تعتمد المحاثة على شدة التيار؟', k: ['تعتمد', 'تيار'], a: () => K.tutor('انظر إلى L_in = μ₀N²A/L.', 'لا، تعتمد على أبعاد الملف وعدد لفاته ونوع الوسط.') },
      { q: 'ماذا يحدث للمحاثة إذا ضوعف طول الملف؟', k: ['طول', 'ضوعف'], a: () => K.tutor('الطول في المقام.', 'تقل إلى النصف (بعدد اللفات نفسه).') },
      { q: 'لماذا المحاثة موجبة دائماً؟', k: ['موجبه'], a: () => K.tutor('ما إشارات μ₀ و N² و A و L؟', 'كلها موجبة.') }
    ]
  });

  /* ======================= 6-8 دارة RL ص131–133 ======================= */
  K.reg({
    id: 'rl-circuit', unit: 8, order: 5, lesson: '6-8', lessonTitle: 'دارة كهربائية تحتوي على مقاومة ومحث', page: 132,
    titleAr: 'دارة RL: نمو التيار والطاقة المختزنة', titleEn: 'RL Circuit and Stored Energy', tags: 'دارة مقاومة محث نمو التيار تلاشي طاقة مختزنة معدل نمو مثال 4',
    formula: '\\frac{\\Delta I}{\\Delta t} = \\frac{\\varepsilon}{L_{in}} - \\frac{I\\sum R}{L_{in}} ,\\qquad E = \\tfrac12 L_{in} I^2',
    book: 'القانون (8-9) والشكل (10-8) ص132، والقانون (8-10) ص133. مثال (4) ص133: محاثة 53 mH ومقاومة 0.35 Ω وبطارية 12 V ⇒ I_final = 34.3 A و E = 31.16 J.',
    summary: 'عند غلق الدارة لا يصل التيار إلى قيمته النهائية فوراً؛ القوة الدافعة الحثية العكسية في المحث تجعله ينمو بسرعة أولاً ثم ببطء حتى ε/ΣR. وعند فتح الدارة يتلاشى تدريجياً. يختزن المحث طاقة ½L_inI² في مجاله المغناطيسي.',
    vars: [['\\varepsilon', 'القوة الدافعة للبطارية', '\\mathrm{V}', '1 – 24'], ['\\sum R', 'مجموع المقاومات', '\\Omega', '0.1 – 10'], ['L_{in}', 'المحاثة', '\\mathrm{mH}', '1 – 200'], ['I', 'التيار', '\\mathrm{A}', '—']],
    assumptions: ['منحنى I مع الزمن ناتج عن حل المعادلة (8-9) عددياً.', 'الزمن في الحركة مبطّأ ليظهر النمو.', 'عند فتح الدارة يُفترض بقاء مسار يتلاشى فيه التيار تدريجياً كما في الشكل (11-8).'],
    params: [
      { key: 'e', label: '\\varepsilon\\ (\\mathrm{V})', min: 1, max: 24, step: 1, value: 12 },
      { key: 'R', label: '\\sum R\\ (\\Omega)', min: 0.1, max: 10, step: 0.05, value: 2 },
      { key: 'Lm', label: 'L_{in}\\ (\\mathrm{mH})', min: 1, max: 200, step: 1, value: 100 },
      { key: 'sw', label: '\\text{المفتاح}', type: 'toggle', value: true, on: 'مغلق', off: 'مفتوح' }
    ],
    resetOn: ['e', 'R', 'Lm'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, I: 0 }),
    tick(st, p, d, dt) { const L = p.Lm * 1e-3, tau = L / p.R; let h = dt * tau * 1.6; const nS = Math.max(1, Math.ceil(h / (tau / 40))); h /= nS; for (let i = 0; i < nS; i++) st.I += ((p.sw ? p.e : 0) - st.I * p.R) / L * h; st.t += dt * tau * 1.6; },
    compute(p) { const L = p.Lm * 1e-3; const If = p.e / p.R; return { L: L, If: If, r0: p.e / L, tau: L / p.R, E: 0.5 * L * If * If }; },
    live(p, d) { const I = d.st ? d.st.I : 0; return '\\frac{\\Delta I}{\\Delta t} = \\frac{' + p.e + '}{' + d.L + '} - \\frac{' + n(I, 3) + ' \\times ' + p.R + '}{' + d.L + '} = ' + q(((p.sw ? p.e : 0) - I * p.R) / d.L, 'A/s', 3); },
    results(p, d) { const I = d.st ? d.st.I : 0; return [['معدل النمو لحظة الغلق ε/L_in', q(d.r0, 'A/s', 4)], ['التيار النهائي ε/ΣR', q(d.If, 'A', 4), true, 'pos'], ['التيار الآن', q(I, 'A', 4)], ['الطاقة العظمى المختزنة ½L_inI²', q(d.E, 'J', 4), true, 'pos'], ['الطاقة المختزنة الآن', q(0.5 * d.L * I * I, 'J', 4)]]; },
    steps(p, d) { return ['لحظة الغلق I = 0 ⇒ ΔI/Δt = ε/L_in = ' + n(d.r0) + ' A/s، والقوة الدافعة الحثية = ε.', 'نهائياً ΔI/Δt = 0 ⇒ I = ε/ΣR = ' + p.e + ' ÷ ' + p.R + ' = ' + n(d.If) + ' A.', 'E = ½ L_in I² = ½ × ' + d.L + ' × ' + n(d.If) + '² = ' + n(d.E) + ' J.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const I = d.st ? d.st.I : 0; const xL = W * 0.15, xR = W * 0.85, yT = H * 0.3, yB = H * 0.8;
      K.wire(ctx, [[xL, yB], [xL, yT], [W * 0.32, yT]], cols); K.resistor(ctx, W * 0.32, yT, W * 0.52, yT, 'ΣR = ' + p.R + ' Ω', cols);
      K.wire(ctx, [[W * 0.52, yT], [W * 0.58, yT]], cols); for (let k = 0; k < 5; k++) { ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(W * 0.6 + k * (W * 0.035), yT, W * 0.0175, Math.PI, 0); ctx.stroke(); } lbl(ctx, 'L = ' + p.Lm + ' mH', W * 0.68, yT - 30, '#b45309', cols);
      K.wire(ctx, [[W * 0.6 + 4.5 * W * 0.035, yT], [xR, yT], [xR, yB], [W / 2 + 30, yB]], cols); K.battery(ctx, W / 2, yB, true, 'ε = ' + p.e + ' V', cols);
      const sx = W / 2 - 10; ctx.strokeStyle = cols.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(xL, yB); ctx.lineTo(sx - 50, yB); ctx.lineTo(sx - 12, p.sw ? yB : yB - 24); ctx.stroke(); K.wire(ctx, [[sx - 12, yB], [sx, yB]], cols);
      const fr = Math.min(1, Math.abs(I) / Math.max(d.If, 1e-9)); ctx.fillStyle = cols.grid; ctx.fillRect(W * 0.2, H * 0.12, W * 0.6, 12); ctx.fillStyle = cols.c2; ctx.fillRect(W * 0.2, H * 0.12, W * 0.6 * fr, 12);
      D.txt(ctx, 'I = ' + n(I, 3) + ' A  (' + Math.round(fr * 100) + '% من النهائي)', W / 2, H * 0.06, { color: cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d) { const st = d.st || { t: 0, I: 0 }; const T = 6 * d.tau; return { view: { xmin: 0, xmax: T, ymin: 0, ymax: d.If * 1.15 }, xLabel: 't (s)', yLabel: 'I (A)', caption: 'الشكل (10-8): ينمو التيار بسرعة أولاً ثم ببطء حتى ε/ΣR.', draw(G) { const c = G.colors(); G.fn((t) => d.If * (1 - Math.exp(-t / d.tau)), { color: c.c1, width: 3, domain: [0, T] }); G.hline(d.If, { color: c.muted, dash: [6, 4] }); G.point(Math.min(st.t, T), st.I, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.sw !== b.sw) o.push(b.sw ? 'أُغلقت الدارة: ينمو التيار تدريجياً.' : 'فُتحت الدارة: يتلاشى التيار تدريجياً لأن المحث يقاوم النقصان.'); if (a.Lm !== b.Lm) o.push('المحاثة الأكبر تبطئ نمو التيار ولا تغيّر قيمته النهائية.'); return o; },
    learn: ['**(8-9) ص132:** ΔI/Δt = ε/L_in − IΣR/L_in.', '**أناقش:** لحظة الغلق ΔI/Δt = ε/L_in والقوة الدافعة الحثية تساوي ε؛ ونهائياً I = ε/ΣR.', '**الطاقة (8-10) ص133:** E = ½L_inI²، وللملف الحلزوني E = B²AL/(2μ₀).'],
    challenges: [
      { q: 'مثال (4): محث 53 mH ومقاومته 0.35 Ω مع بطارية 12 V. ما الطاقة المختزنة عند التيار الأعظم؟', hint: 'ΣR = 0.35 ، L = 53.', init: { e: 12, R: 2, Lm: 100 }, check: (p) => p.e === 12 && Math.abs(p.R - 0.35) < 1e-9 && p.Lm === 53, why: () => 'I = 34.3 A و E ≈ 31.16 J.' },
      { q: 'ببطارية 12 V اجعل معدل نمو التيار لحظة الغلق 400 A/s.', hint: 'ε/L_in = 400.', init: { e: 12, R: 2, Lm: 100 }, check: (p, d) => p.e === 12 && Math.abs(d.r0 - 400) < 1e-6, why: () => 'L_in = 12/400 = 30 mH.' }
    ],
    tutor: [
      { q: 'لماذا لا يصل التيار إلى قيمته النهائية فوراً؟', k: ['فورا', 'نهائيه'], a: () => K.tutor('ماذا يولّد المحث عندما يزداد التيار فيه؟', 'قوة دافعة حثية عكسية تقاوم نمو التيار.') },
      { q: 'ما التيار النهائي؟', k: ['النهائي'], a: (p, d) => K.tutor('ماذا يصبح ΔI/Δt بعد زمن طويل؟', 'I = ε/ΣR = ' + n(d.If) + ' A.') },
      { q: 'أين تختزن الطاقة في المحث؟', k: ['تختزن', 'طاقه'], a: () => K.tutor('ما المجال الذي ينشأ داخل الملف؟', 'في المجال المغناطيسي داخل الملف: E = ½L_inI².') }
    ]
  });

  /* ======================= 7-8 المولد الكهربائي ص134–136 ======================= */
  const REF = { N: 100, w: 10 };
  K.reg({
    id: 'ac-generator', unit: 8, order: 6, lesson: '7-8', lessonTitle: 'المولد الكهربائي', page: 134,
    titleAr: 'المولد الكهربائي: القوة الدافعة المترددة', titleEn: 'The AC Generator', tags: 'مولد كهربائي تيار متردد متناوب ملف يدور سرعة زاوية حلقتان فرشاتان عاكس مثال 5',
    formula: '\\varepsilon = N B A \\omega \\sin\\omega t ,\\qquad \\varepsilon_{max} = N B A \\omega',
    book: 'المولد وآلية عمله والقانون (8-15) ص134، والقانون (8-16) ص135. مثال (5) ص135–136: أثر مضاعفة عدد اللفات، ومضاعفة السرعة الزاوية، ومضاعفتها مع تنصيف عدد اللفات. سؤال ص136: ملف 50 × 40 cm و100 لفة و B = 0.2 T و ε_max = 200 V.',
    summary: 'يحوّل المولد الطاقة الميكانيكية إلى كهربائية: دوران الملف في المجال يغيّر التدفق BA cosθ باستمرار فتتولد قوة دافعة جيبية تتغير في المقدار والاتجاه كل نصف دورة (تيار متردد). سعتها NBAω، وزمنها الدوري 2π/ω.',
    vars: [['N', 'عدد اللفات', '—', '10 – 500'], ['B', 'المجال', '\\mathrm{T}', '0.05 – 1'], ['A', 'مساحة الملف', '\\mathrm{cm^2}', '100 – 4000'], ['\\omega', 'السرعة الزاوية', '\\mathrm{rad/s}', '1 – 100']],
    assumptions: ['الملف يبدأ من وضع يكون فيه مستواه عمودياً على المجال (θ = 0).', 'دوران الملف في الرسم مبطّأ للتوضيح، والخط المتقطع في الرسم البياني لحالة مرجعية N = 100 و ω = 10 rad/s.'],
    params: [
      { key: 'N', label: 'N', min: 10, max: 500, step: 10, value: 100 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0.05, max: 1, step: 0.05, value: 0.2 },
      { key: 'A', label: 'A\\ (\\mathrm{cm^2})', min: 100, max: 4000, step: 100, value: 2000 },
      { key: 'w', label: '\\omega\\ (\\mathrm{rad/s})', min: 1, max: 100, step: 1, value: 10 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { const A = p.A * 1e-4; const em = p.N * p.B * A * p.w; return { em: em, T: 2 * Math.PI / p.w, f: p.w / (2 * Math.PI), ref: REF.N * p.B * A * REF.w }; },
    live(p, d) { return '\\varepsilon_{max} = NBA\\omega = ' + p.N + ' \\times ' + p.B + ' \\times ' + p.A * 1e-4 + ' \\times ' + p.w + ' = ' + q(d.em, 'V', 4); },
    results(p, d) { return [['القوة الدافعة العظمى', q(d.em, 'V', 4), true, 'pos'], ['الزمن الدوري T', q(d.T, 's', 4)], ['التردد f', q(d.f, 'Hz', 4)], ['مقارنة بالحالة المرجعية', 'السعة × ' + n(d.em / d.ref, 3) + ' ، الزمن الدوري × ' + n(REF.w / p.w, 3), false]]; },
    steps(p, d) { return ['Φ = BA cosωt ⇒ ε = NBAω sinωt.', 'ε_max = ' + p.N + ' × ' + p.B + ' × ' + p.A * 1e-4 + ' × ' + p.w + ' = ' + n(d.em) + ' V.', 'T = 2π/ω = ' + n(d.T, 4) + ' s.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const th = st.t * Math.min(6, 0.6 * p.w); const cx = W / 2, cy = H * 0.45, pw = Math.min(W * 0.16, 90), ch = Math.min(H * 0.26, 110);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - W * 0.4, cy - ch, W * 0.1, 2 * ch); ctx.fillStyle = '#64748b'; ctx.fillRect(cx + W * 0.3, cy - ch, W * 0.1, 2 * ch);
      D.txt(ctx, 'N', cx - W * 0.35, cy, { color: '#fff', size: 18, w: '700' }); D.txt(ctx, 'S', cx + W * 0.35, cy, { color: '#fff', size: 18, w: '700' });
      for (let k = -2; k <= 2; k++) D.arrow(ctx, cx - W * 0.29, cy + k * ch * 0.4, cx + W * 0.29, cy + k * ch * 0.4, cols.grid, 1.2);
      const wv = pw * Math.cos(th); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 4; ctx.strokeRect(cx - Math.abs(wv), cy - ch * 0.8, 2 * Math.abs(wv) + 0.5, ch * 1.6);
      const k = Math.sin(th);
      ctx.fillStyle = 'rgba(250,204,21,' + (0.1 + 0.85 * Math.abs(k)) + ')'; ctx.beginPath(); ctx.arc(cx, H * 0.88, 18, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = cols.text; ctx.lineWidth = 1.5; ctx.stroke();
      K.wire(ctx, [[cx - 6, cy + ch * 0.8], [cx - 6, H * 0.88 - 18]], cols); K.wire(ctx, [[cx + 6, cy + ch * 0.8], [cx + 6, H * 0.88 - 18]], cols);
      D.txt(ctx, 'ε = ' + n(d.em * k, 3) + ' V', W / 2, H * 0.07, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const Tw = 4 * Math.PI / REF.w; const m = Math.max(d.em, d.ref); return { view: { xmin: 0, xmax: Tw, ymin: -m * 1.2, ymax: m * 1.2 }, xLabel: 't (s)', yLabel: 'ε (V)', caption: 'المنحنى المتصل للقيم الحالية، والمتقطع للحالة المرجعية (N = 100 ، ω = 10 rad/s).', draw(G) { const c = G.colors(); G.fn((t) => d.ref * Math.sin(REF.w * t), { color: c.muted, width: 1.5, domain: [0, Tw] }); G.fn((t) => d.em * Math.sin(p.w * t), { color: c.c2, width: 3, domain: [0, Tw] }); G.hline(0, { color: c.muted }); } }; },
    explain(a, b, da, db) { const o = []; if (a.N !== b.N) o.push('تغيير عدد اللفات يغيّر السعة فقط ولا يغيّر الزمن الدوري.'); if (a.w !== b.w) o.push('زيادة السرعة الزاوية تزيد السعة وتقصّر الزمن الدوري معاً.'); return o; },
    learn: ['**أجزاء المولد ص134:** ملف يدور بين قطبي مغناطيس، وحلقتان فلزيتان تدوران معه، وفرشاتان ثابتتان.', '**(8-15):** ε = NBAω sinθ ، وتكون عظمى عندما يكون مستوى الملف موازياً للمجال، وصفراً عندما يكون عمودياً عليه.', '**(8-16):** I = ε/ΣR. ولتقويم التيار تستبدل الحلقتان بنصفي حلقة (العاكس).'],
    challenges: [
      { q: 'مثال (5-3): ضاعف السرعة الزاوية ونصّف عدد اللفات مقارنةً بالحالة المرجعية. ماذا يحدث للسعة والزمن الدوري؟', hint: 'N = 50 و ω = 20 مع B = 0.2 و A = 2000.', init: { N: 100, B: 0.2, A: 2000, w: 10 }, check: (p) => p.N === 50 && p.w === 20 && Math.abs(p.B - 0.2) < 1e-9 && p.A === 2000, why: () => 'السعة لا تتغير، والزمن الدوري يقل إلى النصف.' },
      { q: 'سؤال ص136: ملف 50 × 40 cm و100 لفة في مجال 0.2 T، والقوة الدافعة العظمى 200 V. ما السرعة الزاوية؟', hint: 'A = 2000 cm² ، ω = ε_max/(NBA).', init: { N: 100, B: 0.2, A: 2000, w: 10 }, check: (p, d) => p.N === 100 && Math.abs(p.B - 0.2) < 1e-9 && p.A === 2000 && Math.abs(d.em - 200) < 1e-6, why: () => 'ω = 200 ÷ (100 × 0.2 × 0.2) = 50 rad/s.' }
    ],
    tutor: [
      { q: 'متى تكون القوة الدافعة عظمى؟', k: ['عظمى', 'متى'], a: () => K.tutor('متى يتغير التدفق بأسرع معدل؟', 'عندما يكون مستوى الملف موازياً للمجال (sinθ = 1).') },
      { q: 'لماذا يسمى التيار مترددا؟', k: ['متردد', 'متناوب'], a: () => K.tutor('ماذا يحدث لإشارة sinθ كل نصف دورة؟', 'لأنه يتغير في المقدار والاتجاه كل نصف دورة.') },
      { q: 'ما أثر مضاعفة عدد اللفات؟', k: ['لفات', 'مضاعفه'], a: () => K.tutor('أين تظهر N في القانون؟', 'تتضاعف السعة ولا يتغير الزمن الدوري.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
