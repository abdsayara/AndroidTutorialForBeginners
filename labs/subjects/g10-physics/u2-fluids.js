/* الفيزياء — الوحدة الثانية: الموائع (ص 61–82) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 5; const q = P.q;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);
  // كثافات السوائل من جدول نشاط (4) ص 68 + الزئبق (ص 70)
  const LIQ = [['1000', 'ماء (1000)'], ['1260', 'غليسرين (1260)'], ['750', 'كحول (750)'], ['13595', 'زئبق (13595)']];
  const LIQNAME = { 1000: 'الماء', 1260: 'الغليسرين', 750: 'الكحول', 13595: 'الزئبق' };

  /* ======================= 1-1 الضغط ======================= */
  ML.register({
    subject: S, id: 'pressure', unit: U, order: 1, lesson: '1-1', lessonTitle: 'الضغط', page: 66,
    titleAr: 'الضغط: القوة على وحدة المساحة', titleEn: 'Pressure: Force per Unit Area', tags: 'ضغط قوه مساحه باسكال بار تور',
    formula: 'P = \\frac{F}{A}',
    book: 'ض = ق / أ ، الضغط بالباسكال (نيوتن/م²)، والقوة عمودية على السطح (ص 66)',
    summary: 'الضغط مقدار القوة التي تؤثر عمودياً على وحدة المساحة. القوة نفسها تُحدث ضغطاً أكبر كلما صغرت المساحة؛ لذلك تغوص الكعوب الرفيعة في الرمل أكثر من الأحذية العريضة.',
    vars: [['F', 'القوة العمودية على السطح', '\\mathrm{N}', '1 – 2000'], ['A', 'المساحة المتأثرة بالقوة', '\\mathrm{cm^2}\\ (\\times 10^{-4}\\ \\mathrm{m^2})', '1 – 2000 (> 0)'], ['P', 'الضغط', '\\mathrm{Pa = N/m^2}', 'يُحسب']],
    assumptions: ['القوة عمودية على السطح وموزعة بانتظام على المساحة.', 'تُحوّل المساحة من سم² إلى م² قبل الحساب: 1 سم² = 10⁻⁴ م².'],
    params: [
      { key: 'F', label: 'F\\ (\\mathrm{N})', min: 1, max: 2000, step: 1, value: 600, desc: 'القوة (مثلاً وزن شخص)' },
      { key: 'A', label: 'A\\ (\\mathrm{cm^2})', min: 1, max: 2000, step: 1, value: 400, desc: 'مساحة التلامس' }
    ],
    custom: true, canvasHint: 'عمق الانغراس في الرمل يمثّل الضغط (بمقياس لوغاريتمي): صغّر المساحة وراقب.',
    graphModes: ['الضغط – المساحة', 'الضغط – القوة'],
    compute(p) { const Am = p.A * 1e-4; const Pa = P.pressure(p.F, Am); return { Am: Am, P: Pa, bar: Pa / 1e5, torr: Pa / P.C.P0 * 760, atm: Pa / P.C.P0 }; },
    drawCustom(ctx, W, H, p, d, c) {
      const ground = H * 0.66; const depth = M.clamp(8 + 14 * Math.log10(d.P / 100), 2, 90);
      ctx.fillStyle = c.c4; ctx.globalAlpha = 0.35; ctx.fillRect(0, ground, W, H - ground); ctx.globalAlpha = 1;
      for (let i = 0; i < 120; i++) { ctx.fillStyle = c.c4; ctx.globalAlpha = 0.5; ctx.fillRect((i * 97) % W, ground + 6 + (i * 53) % (H - ground - 8), 2, 2); } ctx.globalAlpha = 1;
      const w = M.clamp(Math.sqrt(p.A) * 6, 14, W * 0.6); const h = 110; const x = W / 2 - w / 2; const yb = ground + depth;
      ctx.fillStyle = c.bg; ctx.fillRect(x - 2, ground, w + 4, depth);
      ctx.fillStyle = c.c1; D.rr(ctx, x, yb - h, w, h, 6); ctx.fill();
      D.txt(ctx, 'A = ' + p.A + ' cm²', W / 2, yb - h / 2, { color: '#fff', size: 13, w: '700' });
      D.arrow(ctx, W / 2, yb - h - 80, W / 2, yb - h - 6, c.c2, 4); D.txt(ctx, 'F = ' + p.F + ' N', W / 2 + 14, yb - h - 60, { color: c.c2, size: 14, w: '700', align: 'left' });
      const n = Math.min(9, Math.max(2, Math.round(w / 22)));
      for (let i = 0; i < n; i++) { const xx = x + (i + 0.5) * w / n; D.arrow(ctx, xx, yb + 2, xx, yb + 10 + Math.min(30, depth / 3), c.c5, 2); }
      D.txt(ctx, 'P = ' + P.sct(d.P) + ' Pa', W / 2, 26, { color: c.text, size: 17, w: '700' });
      D.txt(ctx, 'عمق الانغراس ∝ log P', W - 12, H - 14, { color: c.muted, size: 11, align: 'right' });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: 2000, ymin: 0, ymax: D.niceMax(2000 / d.Am, 10) }, xLabel: 'F (N)', yLabel: 'P (Pa)', caption: 'لمساحة ثابتة ' + p.A + ' سم²: الضغط يتناسب طردياً مع القوة (خط مستقيم ميله $1/A$).', draw(G) { const c = G.colors(); G.fn((F) => F / d.Am, { color: c.c1, width: 3, domain: [0, 2000] }); G.point(p.F, d.P, { color: c.c2 }); } };
      const ymax = D.niceMax(Math.min(p.F / 1e-4, d.P * 3), 10);
      return { view: { xmin: 0, xmax: 2000, ymin: 0, ymax: ymax }, xLabel: 'A (cm²)', yLabel: 'P (Pa)', caption: 'لقوة ثابتة ' + p.F + ' N: الضغط يتناسب عكسياً مع المساحة (قطع زائد) — ضاعف المساحة ينقص الضغط للنصف.', draw(G) { const c = G.colors(); G.fn((A) => (A > 0 ? p.F / (A * 1e-4) : NaN), { color: c.c5, width: 3, domain: [1, 2000] }); G.point(p.A, d.P, { color: c.c2 }); } };
    },
    live(p, d) { return 'P = \\frac{F}{A} = \\frac{' + p.F + '}{' + P.sci(d.Am) + '} = ' + q(d.P, 'Pa'); },
    results(p, d) { return [['المساحة بالمتر المربع', q(d.Am, 'm^2')], ['الضغط', q(d.P, 'Pa'), true, 'pos'], ['بالبار (1 بار = 10⁵ Pa)', q(d.bar, 'bar')], ['بالتور (ملم زئبق)', q(d.torr, 'Torr')], ['نسبةً إلى الضغط الجوي', q(d.atm, 'atm')], ['تحليل الأبعاد', '\\frac{\\mathrm{N}}{\\mathrm{m^2}} = \\frac{\\mathrm{kg\\,m/s^2}}{\\mathrm{m^2}} = \\mathrm{kg\\,m^{-1}s^{-2}} = \\mathrm{Pa}']]; },
    steps(p, d) { return ['حوّل المساحة: $A = ' + p.A + ' \\times 10^{-4} = ' + P.sci(d.Am) + '$ م².', '$P = F / A = ' + p.F + ' / ' + P.sci(d.Am) + ' = ' + P.sci(d.P) + '$ باسكال.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.A !== b.A) o.push((b.A < a.A ? 'صغّرت المساحة' : 'كبّرت المساحة') + ' إلى ' + b.A + ' سم² فصار الضغط $' + P.sci(db.P) + '$ Pa. **لماذا؟** القوة نفسها توزعت على مساحة ' + (b.A < a.A ? 'أصغر فأصاب كل متر مربع نصيب أكبر منها' : 'أكبر فأصاب كل متر مربع نصيب أقل منها') + ' — تناسب عكسي.');
      if (a.F !== b.F) o.push('تغيّرت القوة إلى ' + b.F + ' N فتغيّر الضغط بالنسبة نفسها (تناسب طردي) إلى $' + P.sci(db.P) + '$ Pa.');
      return o;
    },
    learn: ['**الضغط (ص 66):** مقدار القوة التي تؤثر عمودياً على وحدة المساحة: $P = F/A$، ووحدته الباسكال = نيوتن/م².', '**وحدات أخرى (ص 66):** البار = $10^5$ باسكال، الميلي بار = 100 باسكال، التور = 1 ملم زئبق، الضغط الجوي $P_0 = 1.013 \\times 10^5$ باسكال = 760 ملم زئبق.', '**لماذا تُصنع السكاكين حادة؟** لتصغير المساحة فيكبر الضغط بالقوة نفسها.'],
    challenges: [
      { q: 'شخص وزنه 600 N يقف على قدمين مساحتهما معاً 400 سم². اجعل الضغط ضعف ذلك دون تغيير الوزن (يقف على قدم واحدة).', hint: 'نصف المساحة: $A = 200$ سم².', init: { F: 600, A: 400 }, check: (p, d) => p.F === 600 && p.A === 200, why: (p, d) => '$P = ' + P.sci(d.P) + '$ Pa = ضعف $1.5 \\times 10^4$.' },
      { q: 'اجعل الضغط يساوي 1 بار تماماً.', hint: '$F/A = 10^5$ ← مثلاً $F = 1000$ N و $A = 100$ سم².', init: { F: 600, A: 400 }, check: (p, d) => M.near(d.P, 1e5, 1e-6) },
      { q: 'اجعل الضغط يساوي الضغط الجوي تقريباً (≈ 1.013 × 10⁵ Pa) بمساحة 10 سم².', hint: '$F = P A = 1.013 \\times 10^5 \\times 10^{-3} \\approx 101$ N.', init: { F: 600, A: 400 }, check: (p, d) => p.A === 10 && Math.abs(d.P - P.C.P0) / P.C.P0 < 0.01 }
    ],
    tutor: [
      { q: 'لماذا يزداد الضغط عند تصغير المساحة؟', k: ['يزداد', 'تصغير', 'المساحه'], a: (p, d) => 'لأن $P = F/A$: القوة ' + p.F + ' N موزعة الآن على ' + p.A + ' سم² فقط، فكل متر مربع «يتحمل» $' + P.sci(d.P) + '$ N. إذا قسمت المساحة على 2 يتضاعف الضغط.' },
      { q: 'كم يساوي الضغط بالبار والتور؟', k: ['بار', 'تور', 'وحدات'], a: (p, d) => '$' + P.sci(d.P) + '$ Pa = $' + P.sci(d.bar) + '$ بار = $' + P.sci(d.torr) + '$ تور (لأن $P_0 = 1.013 \\times 10^5$ Pa = 760 تور).' }
    ]
  });

  /* ======================= 1-2 ضغط السائل والضغط المطلق (السد) ======================= */
  ML.register({
    subject: S, id: 'liquid-pressure', ar: { L: 'ط' }, unit: U, order: 2, lesson: '1-2', lessonTitle: 'ضغط السائل', page: 69,
    titleAr: 'ضغط السائل والضغط المطلق (السد)', titleEn: 'Liquid Pressure & Absolute Pressure (Dam)', tags: 'ضغط سائل عمق كثافه ضغط مطلق سد ضغط جوي بارومتر زئبق',
    formula: 'P_{abs} = P_0 + \\rho\\,g\\,h',
    book: 'ض م = ض0 + ث ل جـ ، حيث ث كثافة السائل، ل العمق، جـ تسارع الجاذبية (ص 69–70)',
    summary: 'ضغط السائل عند نقطة يعتمد على عمقها وكثافة السائل وتسارع الجاذبية فقط — لا على شكل الإناء ولا على اتجاه السطح. ويُضاف الضغط الجوي فوق السطح لنحصل على الضغط المطلق.',
    vars: [['h', 'عمق النقطة تحت السطح', '\\mathrm{m}', '0 – H'], ['H', 'ارتفاع الماء خلف السد', '\\mathrm{m}', '1 – 100'], ['L', 'طول قاعدة السد', '\\mathrm{m}', '1 – 300'], ['\\rho', 'كثافة السائل', '\\mathrm{kg/m^3}', 'من جدول الكتاب'], ['P_0', 'الضغط الجوي', '\\mathrm{Pa}', '1.013 × 10⁵ أو 10⁵ (كمثال الكتاب)']],
    assumptions: ['السائل ساكن وغير قابل للانضغاط (كثافته ثابتة مع العمق).', 'القوة على جدار السد = معدل الضغط × مساحة الجدار، ومعدل الضغط = (الضغط عند السطح + الضغط عند القاعدة)/2 — كما في مثال (1) ص 71.'],
    params: [
      { key: 'rho', label: '\\rho', type: 'select', options: LIQ, value: 1000, desc: 'نوع السائل' },
      { key: 'H', label: 'H\\ (\\mathrm{m})', min: 1, max: 100, step: 1, value: 50, desc: 'ارتفاع السائل' },
      { key: 'h', label: 'h\\ (\\mathrm{m})', min: 0, max: 100, step: 0.5, value: 25, desc: 'عمق المجس' },
      { key: 'L', label: 'L\\ (\\mathrm{m})', min: 1, max: 300, step: 1, value: 200, desc: 'طول السد' },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 9.8, max: 10, step: 0.2, value: 10 },
      { key: 'P0', label: 'P_0', type: 'select', options: [['100000', '10⁵ Pa (مثال الكتاب)'], ['101300', '1.013 × 10⁵ Pa']], value: 100000 }
    ],
    onSet(p) { if (p.h > p.H) p.h = p.H; },
    custom: true, canvasHint: 'الأسهم عند المجس متساوية في جميع الاتجاهات: ضغط السائل لا يعتمد على الاتجاه. الأسهم على الجدار تزداد مع العمق.',
    graphModes: ['الضغط – العمق', 'الضغط – الكثافة'],
    compute(p) {
      const h = Math.min(p.h, p.H);
      const gauge = P.liquidPressure(p.rho, h, p.g); const abs = P.absPressure(p.P0, p.rho, h, p.g);
      const base = P.absPressure(p.P0, p.rho, p.H, p.g); const avg = (p.P0 + base) / 2; const area = p.H * p.L;
      return { h: h, gauge: gauge, abs: abs, base: base, avg: avg, area: area, F: avg * area, baroH: P.C.P0 / (P.C.rhoHg * 9.8) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const top = 50, bot = H - 30, L = 40, R = W * 0.7; const ht = (bot - top);
      const ySurf = bot - ht * (p.H / 100) * 0.95; const Y = (depth) => ySurf + (bot - ySurf) * (depth / p.H);
      // السائل
      const col = p.rho >= 13000 ? '#9ca3af' : p.rho >= 1200 ? '#f59e0b' : p.rho < 900 ? '#a78bfa' : '#3b82f6';
      const grd = ctx.createLinearGradient(0, ySurf, 0, bot); grd.addColorStop(0, col + '55'); grd.addColorStop(1, col + 'cc');
      ctx.fillStyle = grd; ctx.fillRect(L, ySurf, R - L, bot - ySurf);
      // جدار السد (شبه منحرف)
      ctx.fillStyle = c.muted; ctx.beginPath(); ctx.moveTo(R, top - 10); ctx.lineTo(R + 26, top - 10); ctx.lineTo(R + 80, bot); ctx.lineTo(R, bot); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.axis; ctx.fillRect(L - 10, bot, R + 100 - L, 8);
      // أسهم الضغط على الجدار
      for (let i = 1; i <= 6; i++) { const dep = p.H * i / 6; const len = 10 + 60 * (p.rho * p.g * dep) / (p.rho * p.g * p.H); D.arrow(ctx, R - len - 2, Y(dep) - 2, R - 2, Y(dep) - 2, c.c2, 2); }
      // المجس
      const py = Y(d.h), px = L + (R - L) * 0.4; const len = 8 + 40 * (d.h / Math.max(p.H, 1));
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((v) => D.arrow(ctx, px - v[0] * (len + 8), py - v[1] * (len + 8), px - v[0] * 8, py - v[1] * 8, c.c5, 2.5));
      ctx.fillStyle = c.c5; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
      D.txt(ctx, 'h = ' + f2(d.h) + ' m', px + len + 16, py, { color: c.text, size: 12, align: 'left', halo: c.bg });
      D.txt(ctx, 'P = ' + P.sct(d.abs) + ' Pa', px + len + 16, py + 18, { color: c.c5, size: 13, w: '700', align: 'left', halo: c.bg });
      ctx.strokeStyle = c.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(L, ySurf); ctx.lineTo(R, ySurf); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, 'P₀ = ' + P.sct(p.P0) + ' Pa ↓', L + 8, ySurf - 12, { color: c.text, size: 12, align: 'left' });
      D.txt(ctx, LIQNAME[p.rho] + ' — H = ' + p.H + ' m', W / 2, 20, { color: c.text, size: 15, w: '700' });
      D.txt(ctx, 'القاعدة: ' + P.sct(d.base) + ' Pa', R - 6, bot - 12, { color: c.c2, size: 12, w: '700', align: 'right', halo: c.bg });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: 14000, ymin: 0, ymax: D.niceMax(14000 * p.g * Math.max(d.h, 0.5), 1) }, xLabel: 'ρ (kg/m³)', yLabel: 'ρgh (Pa)', caption: 'عند العمق نفسه ($h = ' + f2(d.h) + '$ م) يتناسب ضغط السائل طردياً مع كثافته (نشاط 4 ص 68).', draw(G) { const c = G.colors(); G.fn((r) => r * p.g * d.h, { color: c.c4, width: 3, domain: [0, 14000] }); [1000, 1260, 750, 13595].forEach((r) => G.point(r, r * p.g * d.h, { color: r === p.rho ? c.c2 : c.muted, r: r === p.rho ? 6 : 4 })); } };
      return { view: { xmin: 0, xmax: p.H, ymin: 0, ymax: D.niceMax(d.base, 1) }, xLabel: 'h (m)', yLabel: 'P (Pa)', caption: 'الأزرق: الضغط المطلق $P_0 + \\rho g h$ (يبدأ من $P_0$). الأخضر: ضغط السائل وحده $\\rho g h$ (يمر بالأصل). خطان متوازيان ميلهما $\\rho g$.', draw(G) { const c = G.colors(); G.fn((h) => p.P0 + p.rho * p.g * h, { color: c.c1, width: 3, domain: [0, p.H] }); G.fn((h) => p.rho * p.g * h, { color: c.c3, width: 2.5, domain: [0, p.H] }); G.point(d.h, d.abs, { color: c.c2 }); } };
    },
    live(p, d) { return 'P = P_0 + \\rho g h = ' + P.sci(p.P0) + ' + ' + p.rho + ' \\times ' + p.g + ' \\times ' + f2(d.h) + ' = ' + q(d.abs, 'Pa'); },
    results(p, d) {
      return [['ضغط السائل عند المجس ρgh', q(d.gauge, 'Pa')], ['الضغط المطلق عند المجس', q(d.abs, 'Pa'), true, 'pos'], ['الضغط المطلق عند القاعدة', q(d.base, 'Pa')], ['معدل الضغط على الجدار', q(d.avg, 'Pa')], ['مساحة الجدار H × L', q(d.area, 'm^2')], ['القوة على جدار السد', q(d.F, 'N')], ['ارتفاع البارومتر الزئبقي المكافئ لـ P₀', q(d.baroH, 'm') + '\\approx 760\\ \\mathrm{mm\\,Hg}'], ['تحليل الأبعاد', '\\mathrm{\\tfrac{kg}{m^3}\\cdot\\tfrac{m}{s^2}\\cdot m} = \\mathrm{\\tfrac{N}{m^2}} = \\mathrm{Pa}']];
    },
    steps(p, d) { return ['عند السطح: $P = P_0 = ' + P.sci(p.P0) + '$ Pa.', 'عند القاعدة: $P = ' + P.sci(p.P0) + ' + ' + p.rho + ' \\times ' + p.g + ' \\times ' + p.H + ' = ' + P.sci(d.base) + '$ Pa.', 'معدل الضغط $= (' + P.sci(p.P0) + ' + ' + P.sci(d.base) + ')/2 = ' + P.sci(d.avg) + '$ Pa.', 'القوة $= ' + P.sci(d.avg) + ' \\times (' + p.H + ' \\times ' + p.L + ') = ' + P.sci(d.F) + '$ N.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.h !== b.h) o.push('حرّكت المجس إلى عمق ' + f2(db.h) + ' م فصار الضغط المطلق $' + P.sci(db.abs) + '$ Pa. **لماذا؟** كلما نزلنا زاد وزن عمود السائل فوق النقطة، فيزداد الضغط خطياً مع العمق.');
      if (a.rho !== b.rho) o.push('غيّرت السائل إلى ' + LIQNAME[b.rho] + ': عند العمق نفسه صار ضغط السائل $' + P.sci(db.gauge) + '$ Pa. السائل الأكثف أثقل لكل متر مكعب فيُحدث ضغطاً أكبر.');
      if (a.H !== b.H) o.push('تغيّر ارتفاع الماء إلى ' + b.H + ' م: الضغط عند القاعدة $' + P.sci(db.base) + '$ Pa والقوة على الجدار $' + P.sci(db.F) + '$ N. لذلك تُبنى السدود أعرض عند القاعدة.');
      if (a.L !== b.L) o.push('تغيّر طول السد ← تغيّرت المساحة فتغيّرت القوة الكلية، لكن **الضغط عند أي عمق لم يتغير** (لا يعتمد على شكل الإناء أو حجمه).');
      return o;
    },
    learn: ['**ضغط السائل (ص 69):** $P = \\rho g h$ — يعتمد على العمق وكثافة السائل وتسارع الجاذبية، ولا يعتمد على شكل الإناء ولا مساحة قاعدته.', '**الضغط المطلق (ص 70):** $P_{abs} = P_0 + \\rho g h$، حيث $P_0$ الضغط الجوي فوق سطح السائل.', '**مثال (1) ص 71:** سد ارتفاع الماء فيه 50 م وطول قاعدته 200 م: الضغط عند القاعدة $6 \\times 10^5$ Pa، ومعدل الضغط $3.5 \\times 10^5$ Pa، والقوة على الجدار $3.5 \\times 10^9$ N.', '**البارومتر الزئبقي:** الضغط الجوي يعادل عمود زئبق ارتفاعه 760 ملم.'],
    challenges: [
      { q: 'مثال (1) ص 71: سد ارتفاع الماء فيه 50 م وطول قاعدته 200 م (ض0 = 10⁵). اضبط القيم واقرأ القوة على الجدار.', hint: '$H = 50$، $L = 200$، ماء، $g = 10$، $P_0 = 10^5$.', init: { H: 20, L: 50, rho: 1000, g: 10, P0: 100000, h: 10 }, check: (p) => p.H === 50 && p.L === 200 && p.rho === 1000 && p.g === 10 && p.P0 === 100000, why: (p, d) => 'القوة $= ' + P.sci(d.F) + '$ N.' },
      { q: 'سؤال ص 72: بركة سباحة ارتفاع الماء فيها 3 م. ضع المجس عند القاعدة.', hint: '$H = 3$ و $h = 3$.', init: { H: 10, h: 1, rho: 1000, g: 10 }, check: (p) => p.H === 3 && p.h === 3 && p.rho === 1000, why: (p, d) => 'الضغط عند القاعدة $= ' + P.sci(d.base) + '$ Pa.' },
      { q: 'اجعل ضغط السائل عند المجس (بدون الضغط الجوي) يساوي 10⁵ Pa تماماً في الماء.', hint: '$h = 10^5 / (1000 \\times 10) = 10$ م.', init: { H: 50, h: 1, rho: 1000, g: 10 }, check: (p, d) => p.rho === 1000 && M.near(d.gauge, 1e5) }
    ],
    tutor: [
      { q: 'لماذا يزداد الضغط مع العمق؟', k: ['يزداد', 'العمق'], a: (p, d) => 'لأن كل طبقة سائل تحمل وزن السائل فوقها. عند ' + f2(d.h) + ' م يضيف السائل $\\rho g h = ' + P.sci(d.gauge) + '$ Pa فوق الضغط الجوي.' },
      { q: 'لماذا تكون قاعدة السد أعرض؟', k: ['السد', 'قاعده', 'اعرض'], a: (p, d) => 'لأن الضغط عند القاعدة ($' + P.sci(d.base) + '$ Pa) أكبر بكثير من الضغط قرب السطح ($' + P.sci(p.P0) + '$ Pa)، فيجب أن يكون الجدار أقوى في الأسفل.' },
      { q: 'هل يعتمد الضغط على شكل الإناء؟', k: ['شكل', 'الاناء'], a: () => 'لا. الضغط عند عمق معين يعتمد فقط على $\\rho$ و $g$ و $h$. غيّر طول السد $L$ ولاحظ أن الضغط لا يتغير بينما تتغير القوة الكلية.' }
    ]
  });

  /* ======================= 1-3 مبدأ باسكال: المكبس الهيدروليكي ======================= */
  ML.register({
    subject: S, id: 'pascal', unit: U, order: 3, lesson: '1-3', lessonTitle: 'مبدأ باسكال', page: 72,
    titleAr: 'مبدأ باسكال: المكبس الهيدروليكي', titleEn: "Pascal's Principle: Hydraulic Press", tags: 'باسكال مكبس هيدروليكي رافعه سياره ضغط',
    formula: '\\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\quad\\Rightarrow\\quad F_2 = F_1\\,\\frac{A_2}{A_1}',
    book: 'ق1 / أ1 = ق2 / أ2 : الضغط المؤثر على سائل محصور ينتقل بالتساوي إلى جميع أجزائه (ص 73)',
    summary: 'عندما نضغط سائلاً محصوراً ينتقل الضغط بالمقدار نفسه إلى جميع أجزاء السائل وجدران الإناء. لذلك قوة صغيرة على مكبس صغير تُنتج قوة كبيرة على مكبس كبير — بنسبة المساحتين.',
    vars: [['F_1', 'القوة على المكبس الصغير', '\\mathrm{N}', '0 – 1000'], ['A_1', 'مساحة المكبس الصغير', '\\mathrm{cm^2}', '1 – 100'], ['A_2', 'مساحة المكبس الكبير', '\\mathrm{cm^2}', '100 – 5000'], ['m', 'كتلة الحمل (السيارة)', '\\mathrm{kg}', '0 – 3000']],
    assumptions: ['السائل غير قابل للانضغاط ومحصور تماماً.', 'بإهمال كتلة المكبسين والاحتكاك وفرق الارتفاع بين المكبسين.', 'حجم السائل المنتقل ثابت: $A_1 d_1 = A_2 d_2$.'],
    params: [
      { key: 'F1', label: 'F_1\\ (\\mathrm{N})', min: 0, max: 1000, step: 1, value: 150 },
      { key: 'A1', label: 'A_1\\ (\\mathrm{cm^2})', min: 1, max: 100, step: 1, value: 20 },
      { key: 'A2', label: 'A_2\\ (\\mathrm{cm^2})', min: 100, max: 5000, step: 10, value: 2000 },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0, max: 3000, step: 50, value: 1000, desc: 'كتلة السيارة' },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 9.8, max: 10, step: 0.2, value: 9.8 }
    ],
    resetOn: ['A1', 'A2', 'm'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, d1: 0, series: [] }),
    tick(st, p, d, dt) { st.t += dt; if (d.lifts) st.d1 = Math.min(0.5, st.d1 + 0.15 * dt); D.pushSeries(st, st.t, [st.d1, st.d1 * p.A1 / p.A2], 800); },
    isDone: (st, p, d) => !d.lifts || st.d1 >= 0.5,
    custom: true, canvasHint: 'اضغط «تشغيل»: إذا كانت القوة كافية ينزل المكبس الصغير مسافة كبيرة ويرتفع الكبير مسافة صغيرة.',
    graphModes: ['F₂ – F₁', 'المسافتان'],
    compute(p) { const Pr = P.pressure(p.F1, p.A1 * 1e-4); const F2 = P.pascal(p.F1, p.A1, p.A2); const Wt = P.weight(p.m, p.g); return { Pr: Pr, F2: F2, Wt: Wt, ratio: p.A2 / p.A1, need: Wt * p.A1 / p.A2, lifts: F2 >= Wt && p.F1 > 0 && F2 > Wt - 1e-9 }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { d1: 0 }; const base = H - 40; const w1 = 16 + Math.sqrt(p.A1) * 4, w2 = 40 + Math.sqrt(p.A2) * 3.2;
      const x1 = W * 0.22, x2 = W * 0.66; const lvl = base - 120; const d1px = st.d1 * 200, d2px = d1px * p.A1 / p.A2;
      ctx.fillStyle = '#3b82f6aa';
      ctx.fillRect(x1 - w1 / 2, lvl + d1px, w1, base - lvl - d1px); ctx.fillRect(x2 - w2 / 2, lvl - d2px, w2, base - lvl + d2px); ctx.fillRect(x1 - w1 / 2, base - 26, x2 - x1 + w1 / 2, 26);
      ctx.strokeStyle = c.axis; ctx.lineWidth = 2;
      ctx.strokeRect(x1 - w1 / 2 - 2, lvl - 120, w1 + 4, base - lvl + 120); ctx.strokeRect(x2 - w2 / 2 - 2, lvl - 160, w2 + 4, base - lvl + 160);
      ctx.fillStyle = c.axis; ctx.fillRect(x1 - w1 / 2, lvl + d1px - 10, w1, 10); ctx.fillRect(x2 - w2 / 2, lvl - d2px - 10, w2, 10);
      // السيارة
      if (p.m > 0) { const cy = lvl - d2px - 10; const cw = Math.min(w2, 150); ctx.fillStyle = c.c1; D.rr(ctx, x2 - cw / 2, cy - 36, cw, 26, 8); ctx.fill(); D.rr(ctx, x2 - cw / 4, cy - 52, cw / 2, 18, 6); ctx.fill(); ctx.fillStyle = c.axis; [-cw / 3, cw / 3].forEach((dx) => { ctx.beginPath(); ctx.arc(x2 + dx, cy - 10, 8, 0, 7); ctx.fill(); }); D.txt(ctx, p.m + ' kg', x2, cy - 23, { color: '#fff', size: 12, w: '700' }); }
      if (p.F1 > 0) { D.arrow(ctx, x1, lvl + d1px - 80, x1, lvl + d1px - 12, c.c2, 4); D.txt(ctx, 'F₁ = ' + p.F1 + ' N', x1, lvl + d1px - 92, { color: c.c2, size: 13, w: '700' }); }
      D.arrow(ctx, x2 + w2 / 2 + 18, lvl, x2 + w2 / 2 + 18, lvl - Math.min(110, 20 + d.F2 / 400), c.c3, 4);
      D.txt(ctx, 'F₂ = ' + P.sct(d.F2) + ' N', x2 + w2 / 2 + 26, lvl - 40, { color: c.c3, size: 13, w: '700', align: 'left' });
      D.txt(ctx, 'P = ' + P.sct(d.Pr) + ' Pa (نفسه في كل السائل)', W / 2, 22, { color: c.c5, size: 14, w: '700' });
      D.txt(ctx, d.lifts ? 'القوة كافية لرفع السيارة' : 'القوة غير كافية: تحتاج F₁ ≥ ' + f2(d.need) + ' N', W / 2, H - 12, { color: d.lifts ? c.c3 : c.c2, size: 13, w: '700' });
    },
    graph(p, d, gi) {
      const st = d.st || { series: [] };
      if (gi === 1) return { view: { xmin: 0, xmax: 0.5, ymin: 0, ymax: 0.5 }, graphNote: '', xLabel: 'd₁ (m)', yLabel: 'd₂ (m)', caption: 'حفظ الحجم: $d_2 = d_1 A_1/A_2$ — المكبس الكبير يتحرك مسافة أقل بـ ' + f2(d.ratio) + ' مرة. الربح في القوة يقابله خسارة في المسافة.', draw(G) { const c = G.colors(); G.fn((x) => x * p.A1 / p.A2, { color: c.c5, width: 3, domain: [0, 0.5] }); G.fn((x) => x, { color: c.muted, width: 1.5, dash: [5, 5], domain: [0, 0.5] }); G.point(st.d1 || 0, (st.d1 || 0) * p.A1 / p.A2, { color: c.c2 }); } };
      return { view: { xmin: 0, xmax: 1000, ymin: 0, ymax: D.niceMax(1000 * d.ratio, 10) }, xLabel: 'F₁ (N)', yLabel: 'F₂ (N)', caption: 'خط مستقيم ميله $A_2/A_1 = ' + f2(d.ratio) + '$ (الفائدة الآلية). الخط الأفقي الأحمر: وزن السيارة — تُرفع حين يتجاوزه $F_2$.', draw(G) { const c = G.colors(); G.fn((F) => F * d.ratio, { color: c.c1, width: 3, domain: [0, 1000] }); if (p.m > 0) G.hline(d.Wt, { color: c.c2, width: 2, dash: [6, 4] }); G.point(p.F1, d.F2, { color: c.c3 }); } };
    },
    live(p, d) { return 'F_2 = F_1 \\frac{A_2}{A_1} = ' + p.F1 + ' \\times \\frac{' + p.A2 + '}{' + p.A1 + '} = ' + q(d.F2, 'N'); },
    results(p, d) { return [['الضغط المنتقل في السائل', q(d.Pr, 'Pa')], ['القوة على المكبس الكبير', q(d.F2, 'N'), true, 'pos'], ['الفائدة الآلية A₂/A₁', P.sci(d.ratio)], ['وزن السيارة W = mg', q(d.Wt, 'N')], ['أقل قوة لازمة لرفعها', q(d.need, 'N')], ['الحالة', d.lifts ? 'ترتفع السيارة' : 'لا ترتفع', false, d.lifts ? 'pos' : 'neg']]; },
    steps(p, d) { return ['الضغط تحت المكبس الصغير: $P = F_1 / A_1 = ' + p.F1 + ' / (' + p.A1 + ' \\times 10^{-4}) = ' + P.sci(d.Pr) + '$ Pa.', 'ينتقل الضغط نفسه إلى المكبس الكبير: $F_2 = P A_2 = ' + P.sci(d.F2) + '$ N.', 'لرفع السيارة: $F_1 \\ge W A_1/A_2 = ' + P.sci(d.Wt) + ' \\times ' + p.A1 + '/' + p.A2 + ' = ' + f2(d.need) + '$ N.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.F1 !== b.F1) o.push('غيّرت $F_1$ إلى ' + b.F1 + ' N فصارت $F_2 = ' + P.sci(db.F2) + '$ N. **لماذا؟** الضغط ينتقل كاملاً، فتتضاعف القوة بنسبة المساحتين ' + f2(db.ratio) + '.');
      if (a.A2 !== b.A2 || a.A1 !== b.A1) o.push('تغيّرت نسبة المساحتين إلى ' + f2(db.ratio) + ': كلما كبر المكبس الكبير بالنسبة للصغير كبرت القوة الناتجة (لكن تقل المسافة التي يرتفعها).');
      if (a.m !== b.m) o.push('تغيّرت كتلة السيارة فصار وزنها $' + P.sci(db.Wt) + '$ N، وأقل قوة لازمة $' + f2(db.need) + '$ N.');
      return o;
    },
    onDone(st, p, d) { return d.lifts ? ['نزل المكبس الصغير ' + f2(st.d1) + ' م فارتفعت السيارة ' + f2(st.d1 * p.A1 / p.A2 * 100, 3) + ' سم فقط — حجم السائل المنتقل ثابت.'] : ['القوة غير كافية لرفع السيارة: $F_2 = ' + P.sci(d.F2) + '$ N أقل من الوزن $' + P.sci(d.Wt) + '$ N.']; },
    learn: ['**مبدأ باسكال (ص 73):** إذا أثر ضغط على سائل محصور فإنه ينتقل بالتساوي إلى جميع أجزاء السائل وإلى جدران الإناء.', '**المكبس الهيدروليكي:** $F_1/A_1 = F_2/A_2$؛ يُستخدم في رافعات السيارات والكوابح الهيدروليكية.', '**مثال (2) ص 73:** سيارة 2000 كغم، $A_1 = 20$ سم²، $A_2 = 2000$ سم²، $g = 9.8$: القوة اللازمة $F_1 = 196$ N.'],
    challenges: [
      { q: 'مثال (2) ص 73: ما أقل قوة لرفع سيارة 2000 كغم إذا كانت المساحتان 20 سم² و 2000 سم²؟ اضبطها لترتفع السيارة بالكاد.', hint: '$F_1 = 19600 \\times 20/2000 = 196$ N.', init: { F1: 100, A1: 20, A2: 2000, m: 2000, g: 9.8 }, check: (p, d) => p.m === 2000 && p.A1 === 20 && p.A2 === 2000 && p.g === 9.8 && p.F1 === 196, why: () => 'عند 196 N تتساوى $F_2$ مع الوزن 19600 N.' },
      { q: 'سؤال ص 73: مساحة الصغير 10 سم² والقوة عليه 500 N، ومساحة الكبير ≈ 79 سم² (قطره 0.1 م). اقترب منها: اجعل A₂ = 100 سم² واقرأ F₂.', hint: '$A_1 = 10$، $F_1 = 500$، $A_2 = 100$.', init: { F1: 100, A1: 20, A2: 2000 }, check: (p) => p.A1 === 10 && p.F1 === 500 && p.A2 === 100, why: (p, d) => '$F_2 = ' + P.sci(d.F2) + '$ N. بالقطر الحقيقي $A_2 = \\pi(0.05)^2 \\approx 78.5$ سم² تكون $F_2 \\approx 3927$ N.' },
      { q: 'ارفع سيارة 3000 كغم بقوة لا تتجاوز 100 N.', hint: 'تحتاج نسبة مساحات $\\ge 3000 \\times 9.8 / 100 = 294$؛ مثلاً $A_1 = 10$ و $A_2 = 3000$.', init: { F1: 100, A1: 50, A2: 1000, m: 3000, g: 9.8 }, check: (p, d) => p.m === 3000 && p.F1 <= 100 && d.lifts }
    ],
    tutor: [
      { q: 'كيف تُرفع سيارة ثقيلة بقوة صغيرة؟', k: ['ترفع', 'صغيره', 'ثقيله', 'كيف'], a: (p, d) => 'الضغط $' + P.sci(d.Pr) + '$ Pa ينتقل إلى المكبس الكبير الذي مساحته أكبر ' + f2(d.ratio) + ' مرة، فتكون القوة عليه أكبر بالنسبة نفسها: $F_2 = ' + P.sci(d.F2) + '$ N.' },
      { q: 'هل نحصل على طاقة مجانية؟', k: ['مجانيه', 'طاقه', 'شغل', 'المسافه'], a: (p, d) => 'لا. حفظ الحجم يعني $A_1 d_1 = A_2 d_2$: ما نربحه في القوة نخسره في المسافة؛ المكبس الكبير يتحرك أقل بـ ' + f2(d.ratio) + ' مرة.' }
    ]
  });

  /* ======================= 1-4 / 1-5 قاعدة أرخميدس: الطفو ======================= */
  ML.register({
    subject: S, id: 'archimedes', ar: { F_b: 'ق_د', V_b: 'ح_ج', rho_b: 'ث_ج', _b: 'ج', V_sub: 'ح_س' }, unit: U, order: 4, lesson: '1-4', lessonTitle: 'قاعدة أرخميدس والجسم الطافي', page: 75,
    titleAr: 'قاعدة أرخميدس: قوة الطفو', titleEn: "Archimedes' Principle: Buoyant Force", tags: 'ارخميدس طفو قوه دفع غوص كثافه حجم مغمور سفينه',
    formula: 'F_b = \\rho_{l}\\,V_{sub}\\,g, \\qquad \\text{floating: } \\rho_{b} V_{b} = \\rho_{l} V_{sub}',
    book: 'ق د = ح ث جـ (وزن السائل المزاح) ؛ قد = وح − وظ ؛ للجسم الطافي: حج × ثج = حس × ثس (ص 76–78)',
    summary: 'الجسم المغمور في سائل يتأثر بقوة دفع إلى أعلى تساوي وزن السائل الذي يزيحه. إذا كانت كثافة الجسم أقل من كثافة السائل يطفو بحيث يزيح سائلاً وزنه يساوي وزن الجسم؛ وإذا كانت أكبر يغوص ويظهر وزنه أقل.',
    vars: [['V_b', 'حجم الجسم', '\\mathrm{L}\\ (= 10^{-3}\\ \\mathrm{m^3})', '0.1 – 50'], ['\\rho_b', 'كثافة مادة الجسم', '\\mathrm{kg/m^3}', '100 – 8000'], ['\\rho_l', 'كثافة السائل', '\\mathrm{kg/m^3}', '700 – 13600'], ['V_{sub}', 'الحجم المغمور', '\\mathrm{m^3}', 'يُحسب'], ['F_b', 'قوة الطفو', '\\mathrm{N}', 'يُحسب']],
    assumptions: ['الجسم متجانس الكثافة، والسائل ساكن.', 'الجسم الغاطس معلّق بميزان نابضي؛ قراءته = الوزن الظاهري (وزنه في السائل).', 'وضع الاتزان فقط (لا نحاكي الاهتزاز قبل الاستقرار).'],
    params: [
      { key: 'V', label: 'V_b\\ (\\mathrm{L})', min: 0.1, max: 50, step: 0.1, value: 1 },
      { key: 'rb', label: '\\rho_b\\ (\\mathrm{kg/m^3})', min: 100, max: 8000, step: 10, value: 2000 },
      { key: 'rl', label: '\\rho_l\\ (\\mathrm{kg/m^3})', min: 700, max: 13600, step: 10, value: 800 },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 9.8, max: 10, step: 0.2, value: 10 }
    ],
    custom: true, canvasHint: 'الميزان يقرأ الوزن الظاهري للجسم الغاطس. إذا طفا الجسم تصبح قراءة الميزان صفراً.',
    graphModes: ['قوة الطفو – كثافة السائل', 'الحجم المغمور – كثافة الجسم'],
    compute(p) {
      const Vm = p.V * 1e-3; const Wair = p.rb * Vm * p.g; const fs = P.floatState(p.rb, p.rl);
      const Vsub = fs.state === 'float' ? Vm * fs.frac : Vm; const Fb = P.buoyancy(p.rl, Vsub, p.g);
      return { Vm: Vm, m: p.rb * Vm, Wair: Wair, state: fs.state, frac: fs.frac, Vsub: Vsub, Fb: Fb, app: Math.max(0, Wair - Fb), Ffull: P.buoyancy(p.rl, Vm, p.g) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const tank = { x: W * 0.2, y: H * 0.35, w: W * 0.6, h: H * 0.58 }; const surf = tank.y + 20;
      const col = p.rl >= 13000 ? '#9ca3af' : p.rl >= 1200 ? '#f59e0b' : p.rl < 900 ? '#a78bfa' : '#3b82f6';
      ctx.fillStyle = col + '77'; ctx.fillRect(tank.x, surf, tank.w, tank.y + tank.h - surf);
      ctx.strokeStyle = c.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tank.x, tank.y - 10); ctx.lineTo(tank.x, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y - 10); ctx.stroke();
      const s = M.clamp(Math.cbrt(p.V) * 34, 22, 110); const cx = W / 2; let top;
      if (d.state === 'float') top = surf - s * (1 - d.frac);
      else top = surf + 40;
      // الميزان النابضي
      if (d.state !== 'float') { ctx.strokeStyle = c.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 18); ctx.lineTo(cx, 40); ctx.stroke(); D.rr(ctx, cx - 22, 40, 44, 50, 6); ctx.stroke(); D.spring(ctx, cx, 90, cx, top, 6, 7, c.muted); D.txt(ctx, f2(d.app) + ' N', cx + 30, 64, { color: c.c5, size: 14, w: '700', align: 'left' }); }
      const dens = M.clamp(p.rb / 8000, 0.15, 1); ctx.fillStyle = c.c4; ctx.globalAlpha = 0.4 + 0.6 * dens; ctx.fillRect(cx - s / 2, top, s, s); ctx.globalAlpha = 1; ctx.strokeStyle = c.axis; ctx.lineWidth = 1.5; ctx.strokeRect(cx - s / 2, top, s, s);
      D.arrow(ctx, cx - s / 2 - 22, top + s, cx - s / 2 - 22, top + s - Math.min(120, 20 + d.Fb * 4 / Math.max(1, d.Wair / 20)), c.c3, 4); D.txt(ctx, 'F_b = ' + f2(d.Fb) + ' N', cx - s / 2 - 30, top + s + 14, { color: c.c3, size: 13, w: '700', align: 'right' });
      D.arrow(ctx, cx + s / 2 + 22, top + s / 2, cx + s / 2 + 22, top + s / 2 + Math.min(120, 20 + 80), c.c2, 4); D.txt(ctx, 'W = ' + f2(d.Wair) + ' N', cx + s / 2 + 30, top + s / 2 + 110, { color: c.c2, size: 13, w: '700', align: 'left' });
      const lab = d.state === 'float' ? 'يطفو — المغمور ' + f2(d.frac * 100, 1) + '% من حجمه' : d.state === 'suspend' ? 'معلّق: كثافته = كثافة السائل' : 'يغوص: كثافته أكبر من كثافة السائل';
      D.txt(ctx, lab, W / 2, H - 10, { color: d.state === 'sink' ? c.c2 : c.c3, size: 14, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: 8000, ymin: 0, ymax: 1.1 }, xLabel: 'ρ_b (kg/m³)', yLabel: 'V_sub / V_b', caption: 'نسبة الجزء المغمور $= \\rho_b/\\rho_l$ ما دام الجسم أخف من السائل؛ وتصبح 1 (غمر كامل) عند $\\rho_b \\ge \\rho_l = ' + p.rl + '$.', draw(G) { const c = G.colors(); G.fn((r) => Math.min(1, r / p.rl), { color: c.c5, width: 3, domain: [0, 8000] }); G.vline(p.rl, { color: c.muted, dash: [5, 5] }); G.point(p.rb, d.Vsub / d.Vm, { color: c.c2 }); } };
      return { view: { xmin: 0, xmax: 14000, ymin: 0, ymax: D.niceMax(Math.max(d.Wair, 14000 * d.Vm * p.g) * 1.05, 1) }, xLabel: 'ρ_l (kg/m³)', yLabel: 'F (N)', caption: 'الأخضر: قوة الطفو لو غُمر الجسم كلياً $\\rho_l V_b g$. الأحمر: وزن الجسم. يطفو الجسم حين يكون الأخضر فوق الأحمر، وعندها يغمر جزءاً فقط بحيث تساوي قوة الطفو وزنه.', draw(G) { const c = G.colors(); G.fn((r) => r * d.Vm * p.g, { color: c.c3, width: 3, domain: [0, 14000] }); G.hline(d.Wair, { color: c.c2, width: 2.5 }); G.point(p.rl, d.Fb, { color: c.c1 }); } };
    },
    live(p, d) { return d.state === 'float' ? 'V_{sub} = \\frac{\\rho_b V_b}{\\rho_l} = \\frac{' + p.rb + ' \\times ' + P.sci(d.Vm) + '}{' + p.rl + '} = ' + q(d.Vsub, 'm^3') : 'F_b = \\rho_l V_b g = ' + p.rl + ' \\times ' + P.sci(d.Vm) + ' \\times ' + p.g + ' = ' + q(d.Fb, 'N'); },
    results(p, d) { return [['كتلة الجسم', q(d.m, 'kg')], ['الوزن في الهواء', q(d.Wair, 'N')], ['الحجم المغمور (= حجم السائل المزاح)', q(d.Vsub, 'm^3')], ['قوة الطفو', q(d.Fb, 'N'), true, 'pos'], ['الوزن الظاهري (قراءة الميزان)', q(d.app, 'N')], ['الحالة', d.state === 'float' ? 'يطفو' : d.state === 'suspend' ? 'معلّق' : 'يغوص', false, d.state === 'sink' ? 'neg' : 'pos'], ['تحليل الأبعاد', '\\mathrm{\\tfrac{kg}{m^3}\\cdot m^3 \\cdot \\tfrac{m}{s^2}} = \\mathrm{N}']]; },
    steps(p, d) {
      const s = ['الحجم بالمتر المكعب: $V_b = ' + p.V + ' \\times 10^{-3} = ' + P.sci(d.Vm) + '$ م³؛ الوزن $W = \\rho_b V_b g = ' + f2(d.Wair) + '$ N.'];
      if (d.state === 'float') s.push('$\\rho_b < \\rho_l$ ← يطفو: $\\rho_b V_b = \\rho_l V_{sub}$ ← $V_{sub} = ' + P.sci(d.Vsub) + '$ م³.', 'قوة الطفو = الوزن $= ' + f2(d.Fb) + '$ N.');
      else s.push('$\\rho_b \\ge \\rho_l$ ← يُغمر كلياً: $F_b = \\rho_l V_b g = ' + f2(d.Fb) + '$ N.', 'الوزن الظاهري $= W - F_b = ' + f2(d.app) + '$ N.');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (da.state !== db.state) o.push(db.state === 'float' ? '**طفا الجسم!** كثافته (' + b.rb + ') صارت أقل من كثافة السائل (' + b.rl + ')، فقوة الطفو عند الغمر الكامل تتجاوز وزنه؛ فيرتفع حتى يزيح سائلاً وزنه يساوي وزنه.' : '**غاص الجسم:** كثافته لم تعد أقل من كثافة السائل، فحتى عند الغمر الكامل لا تكفي قوة الطفو لحمله.');
      else if (a.rl !== b.rl) o.push('غيّرت كثافة السائل إلى ' + b.rl + ': ' + (db.state === 'float' ? 'السائل الأكثف يحمل الجسم بجزء مغمور أصغر (' + f2(db.frac * 100, 1) + '%).' : 'قوة الطفو صارت $' + f2(db.Fb) + '$ N لأنها تساوي وزن السائل المزاح.'));
      if (a.V !== b.V) o.push('تغيّر الحجم: يتغير الوزن وقوة الطفو بالنسبة نفسها، لذلك **لا يتغير** كون الجسم يطفو أو يغوص — الذي يحدد ذلك هو الكثافة.');
      if (a.rb !== b.rb && da.state === db.state) o.push('تغيّرت كثافة الجسم فتغيّر وزنه إلى $' + f2(db.Wair) + '$ N' + (db.state === 'float' ? ' والجزء المغمور إلى ' + f2(db.frac * 100, 1) + '%.' : '.'));
      return o;
    },
    learn: ['**قاعدة أرخميدس (ص 76):** الجسم المغمور كلياً أو جزئياً في سائل يتأثر بقوة دفع إلى أعلى تساوي وزن السائل المزاح: $F_b = \\rho_l V g$.', '**الوزن الظاهري (ص 75):** $F_b = W_{air} - W_{liquid}$.', '**الجسم الطافي (ص 77):** يطفو الجسم إذا كانت كثافته أقل من كثافة السائل، ويكون $\\rho_b V_b = \\rho_l V_{sub}$.', '**مثال (3) ص 76:** مكعب حجمه 0.001 م³، وزنه 20 N، وفي السائل 12 N: قوة الطفو 8 N وكثافة السائل 800 كغم/م³.', '**مثال (4) ص 77:** كرة مطاط 0.03 م³ كثافتها 800 في سائل كثافته 1200: الحجم المغمور 0.02 م³.'],
    challenges: [
      { q: 'مثال (3) ص 76: مكعب حجمه 1 لتر وزنه 20 N، وقراءة الميزان في السائل 12 N. اضبط كثافة السائل.', hint: '$\\rho_b = 2000$، $g = 10$ ← $F_b = 8$ N ← $\\rho_l = 8/(0.001 \\times 10) = 800$.', init: { V: 1, rb: 2000, rl: 1000, g: 10 }, check: (p, d) => p.V === 1 && p.rb === 2000 && p.g === 10 && M.near(d.app, 12), why: () => 'كثافة السائل 800 كغم/م³.' },
      { q: 'مثال (4) ص 77: كرة 30 لتراً كثافتها 800 في سائل كثافته 1200. اقرأ الحجم المغمور.', hint: '$V_b = 30$، $\\rho_b = 800$، $\\rho_l = 1200$.', init: { V: 10, rb: 2000, rl: 1000, g: 10 }, check: (p) => p.V === 30 && p.rb === 800 && p.rl === 1200, why: (p, d) => '$V_{sub} = ' + P.sci(d.Vsub) + '$ م³.' },
      { q: 'اجعل قطعة حديد (كثافتها 7870 تقريباً → استخدم 7870) تطفو.', hint: 'تحتاج سائلاً أكثف منها: الزئبق 13600.', init: { V: 1, rb: 7870, rl: 1000, g: 10 }, check: (p, d) => p.rb === 7870 && d.state === 'float' }
    ],
    tutor: [
      { q: 'لماذا يطفو الجسم أو يغوص؟', k: ['يطفو', 'يغوص', 'لماذا'], a: (p, d) => 'نقارن الكثافتين: الجسم ' + p.rb + ' والسائل ' + p.rl + ' كغم/م³. ' + (d.state === 'float' ? 'الجسم أخف، فيطفو مغموراً بنسبة ' + f2(d.frac * 100, 1) + '%.' : d.state === 'suspend' ? 'متساويتان، فيبقى معلّقاً.' : 'الجسم أكثف، فوزنه ' + f2(d.Wair) + ' N أكبر من أقصى قوة طفو ' + f2(d.Ffull) + ' N، فيغوص.') },
      { q: 'لماذا تطفو السفينة الحديدية؟', k: ['سفينه', 'باخره', 'حديد'], a: () => 'لأن متوسط كثافة السفينة (حديد + هواء في داخلها) أقل من كثافة الماء، فتزيح ماءً وزنه يساوي وزنها قبل أن تُغمر كلياً.' },
      { q: 'ما قراءة الميزان؟', k: ['الميزان', 'قراءه', 'الظاهري'], a: (p, d) => 'قراءة الميزان = الوزن − قوة الطفو = $' + f2(d.Wair) + ' - ' + f2(d.Fb) + ' = ' + f2(d.app) + '$ N.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
