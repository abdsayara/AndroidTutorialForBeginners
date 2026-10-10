/* الفيزياء — الوحدة الثالثة، الفصل الثاني: الديناميكا الحرارية (ص 107–125) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 7; const q = P.q;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);
  const LAW = { boyle: 'قانون بويل (د ثابتة)', charles: 'قانون شارل (ض ثابت)', gay: 'قانون غايلوساك (ح ثابت)', comb: 'القانون العام للغازات' };

  // جسيمات الغاز (توضيحية): مواقع منسوبة لأبعاد الأسطوانة وسرعة ∝ √T
  function makeParticles(n) { const a = []; for (let i = 0; i < n; i++) { const th = Math.random() * 2 * Math.PI; a.push({ u: Math.random(), v: Math.random(), du: Math.cos(th), dv: Math.sin(th) }); } return a; }
  function moveParticles(ps, T, wRel, dt) {
    const sp = 0.35 * Math.sqrt(Math.max(T, 1) / 300);
    ps.forEach((p) => { p.u += p.du * sp * dt / Math.max(0.08, wRel); p.v += p.dv * sp * dt; if (p.u < 0) { p.u = -p.u; p.du = -p.du; } if (p.u > 1) { p.u = 2 - p.u; p.du = -p.du; } if (p.v < 0) { p.v = -p.v; p.dv = -p.dv; } if (p.v > 1) { p.v = 2 - p.v; p.dv = -p.dv; } });
  }
  function cylinder(ctx, x0, y0, wPx, h, ps, T, c, piston) {
    ctx.fillStyle = 'rgba(' + Math.round(M.clamp(T / 4, 40, 255)) + ',120,' + Math.round(M.clamp(300 - T / 4, 60, 255)) + ',0.18)'; ctx.fillRect(x0, y0, wPx, h);
    ctx.strokeStyle = c.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + wPx + 40, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + wPx + 40, y0 + h); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.fillRect(x0 + wPx, y0 + 2, 12, h - 4); if (piston) ctx.fillRect(x0 + wPx + 12, y0 + h / 2 - 4, 60, 8);
    ctx.fillStyle = c.c1; (ps || []).forEach((p) => { ctx.beginPath(); ctx.arc(x0 + 5 + p.u * (wPx - 10), y0 + 5 + p.v * (h - 10), 3.2, 0, 7); ctx.fill(); });
  }

  /* ======================= 2-2 / 2-3 قوانين الغازات ======================= */
  ML.register({
    subject: S, id: 'gas-laws', unit: U, order: 1, lesson: '2-2', lessonTitle: 'قوانين الغازات', page: 112,
    titleAr: 'قوانين الغازات: بويل وشارل وغايلوساك والقانون العام', titleEn: "Gas Laws: Boyle, Charles, Gay-Lussac & Combined", tags: 'غاز بويل شارل غايلوساك ضغط حجم درجه حراره كلفن قانون عام',
    formula: 'P_1V_1 = P_2V_2,\\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2},\\quad \\frac{P_1}{T_1} = \\frac{P_2}{T_2},\\quad \\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}',
    book: 'ض1 ح1 = ض2 ح2 (ص 113) ؛ ح1/د1 = ح2/د2 (ص 114) ؛ ض1/د1 = ض2/د2 (ص 115) ؛ ض1 ح1/د1 = ض2 ح2/د2 (ص 116) — د بالكلفن',
    summary: 'لكمية ثابتة من غاز مثالي: عند ثبوت درجة الحرارة يتناسب الضغط عكسياً مع الحجم (بويل)، وعند ثبوت الضغط يتناسب الحجم طردياً مع درجة الحرارة المطلقة (شارل)، وعند ثبوت الحجم يتناسب الضغط طردياً مع درجة الحرارة المطلقة (غايلوساك).',
    vars: [['P', 'ضغط الغاز', '\\times 10^5\\ \\mathrm{Pa}', '0.1 – 20 (> 0)'], ['V', 'حجم الغاز', '\\mathrm{L}', '0.05 – 50 (> 0)'], ['T', 'درجة الحرارة المطلقة', '\\mathrm{K}', '50 – 1000 (> 0 K)'], ['1,\\ 2', 'الحالة الابتدائية والنهائية', '—', '—']],
    assumptions: ['غاز مثالي وكمية الغاز (عدد المولات) ثابتة.', 'درجة الحرارة بالكلفن دائماً: $T(K) = T(°C) + 273$.', 'حركة الجسيمات توضيحية: سرعتها تزداد مع $\\sqrt{T}$.'],
    params: [
      { key: 'law', label: '\\text{law}', type: 'select', options: Object.keys(LAW).map((k) => [k, LAW[k]]), value: 'charles' },
      { key: 'P1', label: 'P_1\\ (10^5\\,\\mathrm{Pa})', min: 0.1, max: 20, step: 0.05, value: 1 },
      { key: 'V1', label: 'V_1\\ (\\mathrm{L})', min: 0.05, max: 50, step: 0.01, value: 0.5 },
      { key: 'T1', label: 'T_1\\ (\\mathrm{K})', min: 50, max: 1000, step: 1, value: 293 },
      { key: 'V2', label: 'V_2\\ (\\mathrm{L})', min: 0.05, max: 50, step: 0.01, value: 0.25, hidden: (p) => p.law !== 'boyle' },
      { key: 'P2', label: 'P_2\\ (10^5\\,\\mathrm{Pa})', min: 0.1, max: 20, step: 0.05, value: 1.25, hidden: (p) => p.law !== 'comb' },
      { key: 'T2', label: 'T_2\\ (\\mathrm{K})', min: 50, max: 1000, step: 1, value: 353, hidden: (p) => p.law === 'boyle' }
    ],
    resetOn: ['law', 'P1', 'V1', 'T1', 'V2', 'P2', 'T2'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, s: 0, ps: makeParticles(46) }),
    tick(st, p, d, dt) { st.t += dt; st.s = Math.min(1, st.s + dt / 3); const c = d.at(st.s); moveParticles(st.ps, c.T, c.V / d.Vmax, dt); },
    isDone: (st) => st.s >= 1,
    custom: true, canvasHint: 'اضغط «تشغيل» لينتقل الغاز من الحالة 1 إلى الحالة 2 وفق القانون المختار.',
    compute(p) {
      let P2 = p.P1, V2 = p.V1, T2 = p.T1;
      if (p.law === 'boyle') { V2 = p.V2; P2 = P.boyle(p.P1, p.V1, p.V2); }
      else if (p.law === 'charles') { T2 = p.T2; V2 = P.charles(p.V1, p.T1, p.T2); }
      else if (p.law === 'gay') { T2 = p.T2; P2 = P.gayLussac(p.P1, p.T1, p.T2); }
      else { T2 = p.T2; P2 = p.P2; V2 = P.combined(p.P1, p.V1, p.T1, p.P2, p.T2); }
      const k = p.P1 * p.V1 / p.T1; // ثابت ض ح / د
      const at = (s) => {
        if (p.law === 'boyle') { const V = p.V1 + (V2 - p.V1) * s; return { V: V, P: p.P1 * p.V1 / V, T: p.T1 }; }
        const T = p.T1 + (T2 - p.T1) * s;
        if (p.law === 'charles') return { T: T, P: p.P1, V: p.V1 * T / p.T1 };
        if (p.law === 'gay') return { T: T, V: p.V1, P: p.P1 * T / p.T1 };
        const Pp = p.P1 + (P2 - p.P1) * s; return { T: T, P: Pp, V: k * T / Pp };
      };
      return { P2: P2, V2: V2, T2: T2, k: k, at: at, Vmax: Math.max(p.V1, V2) * 1.15, n: (p.P1 * 1e5) * (p.V1 * 1e-3) / (P.C.R * p.T1) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { s: 0, ps: [] }; const cur = d.at(st.s || 0);
      const x0 = 40, y0 = 70, h = H - 140; const wMax = W - 200; const wPx = Math.max(20, wMax * cur.V / d.Vmax);
      cylinder(ctx, x0, y0, wPx, h, st.ps, cur.T, c, true);
      if (p.law !== 'boyle' && Math.abs(d.T2 - p.T1) > 0) { for (let i = -2; i <= 2; i++) { ctx.fillStyle = d.T2 > p.T1 ? (i % 2 ? c.c4 : c.c2) : c.c1; ctx.beginPath(); const fx = x0 + wPx / 2 + i * 18, fy = y0 + h + 34; ctx.moveTo(fx - 7, fy); ctx.quadraticCurveTo(fx, fy - 24, fx + 7, fy); ctx.fill(); } }
      const vals = [['P', f2(cur.P, 3) + '×10⁵ Pa'], ['V', f2(cur.V, 3) + ' L'], ['T', f2(cur.T, 1) + ' K']];
      vals.forEach((v, i) => { const bx = W / 2 + (i - 1) * 150; ctx.fillStyle = c.grid; ctx.globalAlpha = 0.6; D.rr(ctx, bx - 70, 10, 140, 46, 8); ctx.fill(); ctx.globalAlpha = 1; D.txt(ctx, v[0], bx, 24, { color: c.muted, size: 12 }); D.txt(ctx, v[1], bx, 42, { color: c.text, size: 14, w: '700' }); });
      D.txt(ctx, LAW[p.law] + ' — PV/T = ' + f2(cur.P * cur.V / cur.T, 5), W / 2, H - 14, { color: c.c5, size: 13, w: '700' });
    },
    graph(p, d) {
      const st = d.st || { s: 0 }; const cur = d.at(st.s || 0);
      if (p.law === 'boyle') { const Vm = Math.max(p.V1, d.V2) * 1.3; return { view: { xmin: 0, xmax: Vm, ymin: 0, ymax: D.niceMax(Math.max(p.P1, d.P2) * 1.5, 0.5) }, xLabel: 'V (L)', yLabel: 'P (10⁵ Pa)', caption: 'منحنى بويل (قطع زائد): $PV = ' + f2(p.P1 * p.V1, 4) + '$ ثابت — ضاعف الحجم ينخفض الضغط للنصف.', draw(G) { const c = G.colors(); G.fn((V) => (V > 0 ? p.P1 * p.V1 / V : NaN), { color: c.c1, width: 3, domain: [Vm / 60, Vm] }); G.point(p.V1, p.P1, { color: c.muted, label: '1' }); G.point(d.V2, d.P2, { color: c.c3, label: '2' }); G.point(cur.V, cur.P, { color: c.c2 }); } }; }
      if (p.law === 'gay') return { view: { xmin: 0, xmax: 1000, ymin: 0, ymax: D.niceMax(p.P1 * 1000 / p.T1, 0.5) }, xLabel: 'T (K)', yLabel: 'P (10⁵ Pa)', caption: 'خط مستقيم يمر بالأصل (0 K): الضغط يتناسب طردياً مع درجة الحرارة المطلقة عند ثبوت الحجم.', draw(G) { const c = G.colors(); G.fn((T) => p.P1 * T / p.T1, { color: c.c5, width: 3, domain: [0, 1000] }); G.point(p.T1, p.P1, { color: c.muted, label: '1' }); G.point(d.T2, d.P2, { color: c.c3, label: '2' }); G.point(cur.T, cur.P, { color: c.c2 }); } };
      if (p.law === 'charles') return { view: { xmin: 0, xmax: 1000, ymin: 0, ymax: D.niceMax(p.V1 * 1000 / p.T1, 0.1) }, xLabel: 'T (K)', yLabel: 'V (L)', caption: 'خط مستقيم يمر بالأصل: عند ثبوت الضغط يتناسب الحجم طردياً مع $T$ بالكلفن؛ بامتداده يصل الحجم نظرياً إلى صفر عند 0 K (−273 °س).', draw(G) { const c = G.colors(); G.fn((T) => p.V1 * T / p.T1, { color: c.c3, width: 3, domain: [0, 1000] }); G.point(p.T1, p.V1, { color: c.muted, label: '1' }); G.point(d.T2, d.V2, { color: c.c1, label: '2' }); G.point(cur.T, cur.V, { color: c.c2 }); } };
      const Vm = Math.max(p.V1, d.V2) * 1.4; return { view: { xmin: 0, xmax: Vm, ymin: 0, ymax: D.niceMax(Math.max(p.P1, d.P2) * 1.5, 0.5) }, xLabel: 'V (L)', yLabel: 'P (10⁵ Pa)', caption: 'مسار الغاز على مخطط (ض – ح) من الحالة 1 إلى 2، مع منحنيي ثبوت درجة الحرارة عند $T_1$ و $T_2$ (متقطعان).', draw(G) { const c = G.colors(); G.fn((V) => d.k * p.T1 / V, { color: c.muted, dash: [5, 5], domain: [Vm / 60, Vm] }); G.fn((V) => d.k * d.T2 / V, { color: c.muted, dash: [5, 5], domain: [Vm / 60, Vm] }); const pts = []; for (let i = 0; i <= 40; i++) { const a = d.at(i / 40); pts.push([a.V, a.P]); } D.series(G, pts, c.c5, 3); G.point(p.V1, p.P1, { color: c.muted, label: '1' }); G.point(d.V2, d.P2, { color: c.c3, label: '2' }); G.point(cur.V, cur.P, { color: c.c2 }); } };
    },
    live(p, d) {
      if (p.law === 'boyle') return 'P_2 = \\frac{P_1 V_1}{V_2} = \\frac{' + p.P1 + ' \\times ' + p.V1 + '}{' + p.V2 + '} = ' + P.sci(d.P2) + ' \\times 10^5\\ \\mathrm{Pa}';
      if (p.law === 'charles') return 'V_2 = V_1 \\frac{T_2}{T_1} = ' + p.V1 + ' \\times \\frac{' + p.T2 + '}{' + p.T1 + '} = ' + q(d.V2, 'L');
      if (p.law === 'gay') return 'P_2 = P_1 \\frac{T_2}{T_1} = ' + p.P1 + ' \\times \\frac{' + p.T2 + '}{' + p.T1 + '} = ' + P.sci(d.P2) + ' \\times 10^5\\ \\mathrm{Pa}';
      return 'V_2 = \\frac{P_1 V_1 T_2}{T_1 P_2} = \\frac{' + p.P1 + ' \\times ' + p.V1 + ' \\times ' + p.T2 + '}{' + p.T1 + ' \\times ' + p.P2 + '} = ' + q(d.V2, 'L');
    },
    results(p, d) { return [['الضغط النهائي P₂', q(d.P2 * 1e5, 'Pa')], ['الحجم النهائي V₂', q(d.V2, 'L') + ' = ' + q(d.V2 * 1000, 'cm^3')], ['درجة الحرارة النهائية T₂', q(d.T2, 'K') + ' = ' + q(d.T2 - 273, '^\\circ C')], ['الثابت PV/T', q(d.k * 100, 'J/K')], ['عدد المولات (من الحالة 1)', q(d.n, 'mol')], ['تحليل الأبعاد', '\\mathrm{Pa \\cdot m^3} = \\mathrm{\\tfrac{N}{m^2} \\cdot m^3} = \\mathrm{N\\,m} = \\mathrm{J}']]; },
    steps(p, d) {
      const s = ['حوّل درجات الحرارة إلى كلفن: $T = °C + 273$ (هنا $T_1 = ' + p.T1 + '$ K).'];
      if (p.law === 'boyle') s.push('درجة الحرارة ثابتة: $P_1V_1 = P_2V_2$ ← $P_2 = ' + p.P1 + ' \\times ' + p.V1 + ' / ' + p.V2 + ' = ' + f2(d.P2, 4) + ' \\times 10^5$ Pa.');
      else if (p.law === 'charles') s.push('الضغط ثابت: $V_1/T_1 = V_2/T_2$ ← $V_2 = ' + p.V1 + ' \\times ' + p.T2 + ' / ' + p.T1 + ' = ' + f2(d.V2, 4) + '$ L.');
      else if (p.law === 'gay') s.push('الحجم ثابت: $P_1/T_1 = P_2/T_2$ ← $P_2 = ' + p.P1 + ' \\times ' + p.T2 + ' / ' + p.T1 + ' = ' + f2(d.P2, 4) + ' \\times 10^5$ Pa.');
      else s.push('$\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$ ← $V_2 = \\frac{' + p.P1 + ' \\times ' + p.V1 + ' \\times ' + p.T2 + '}{' + p.T1 + ' \\times ' + p.P2 + '} = ' + f2(d.V2, 4) + '$ L.');
      return s;
    },
    explain(a, b, da, db) {
      if (a.law !== b.law) return ['اخترت ' + LAW[b.law] + '.'];
      const o = [];
      if (b.law === 'boyle' && a.V2 !== b.V2) o.push((b.V2 < a.V2 ? 'ضغطت الغاز إلى حجم أصغر' : 'سمحت للغاز بالتمدد') + ' فصار الضغط $' + f2(db.P2, 4) + ' \\times 10^5$ Pa. **لماذا؟** الجزيئات نفسها بالسرعة نفسها (د ثابتة) لكن في حيّز ' + (b.V2 < a.V2 ? 'أصغر فتصطدم بالجدران أكثر' : 'أكبر فتصطدم بالجدران أقل') + '.');
      if (a.T2 !== b.T2 && b.law !== 'boyle') o.push((b.T2 > a.T2 ? 'رفعت' : 'خفضت') + ' درجة الحرارة إلى ' + b.T2 + ' K: ' + (b.law === 'charles' ? 'تزداد سرعة الجزيئات فيدفع الغاز المكبس ويتمدد ليبقى الضغط ثابتاً؛ الحجم ' + f2(db.V2, 4) + ' L.' : b.law === 'gay' ? 'الحجم مثبّت، فتصطدم الجزيئات الأسرع بالجدران بقوة أكبر ويزداد الضغط إلى ' + f2(db.P2, 4) + ' × 10⁵ Pa.' : 'الحجم الجديد ' + f2(db.V2, 4) + ' L.'));
      if (a.T1 !== b.T1 || a.V1 !== b.V1 || a.P1 !== b.P1) o.push('تغيّرت الحالة الابتدائية فتغيّر الثابت $PV/T$ وبالتالي النتيجة.');
      if (a.P2 !== b.P2) o.push('زيادة الضغط النهائي تُصغّر الحجم النهائي: $V_2 = ' + f2(db.V2, 4) + '$ L.');
      return o;
    },
    learn: ['**قانون بويل (ص 113):** عند ثبوت درجة الحرارة يتناسب حجم كمية محددة من الغاز عكسياً مع ضغطها: $P_1V_1 = P_2V_2$. **مثال (2):** غاز 100 سم³ عند 1 ضغط جوي يصبح 50 سم³ ← ضغطه 2 ضغط جوي.', '**قانون شارل (ص 114):** عند ثبوت الضغط يتناسب الحجم طردياً مع درجة الحرارة المطلقة. **مثال (3):** 500 سم³ من 20 °س إلى 80 °س ← 602.4 سم³.', '**قانون غايلوساك (ص 115):** عند ثبوت الحجم يتناسب الضغط طردياً مع درجة الحرارة المطلقة. **مثال (4):** $5 \\times 10^5$ Pa عند 200 K يصبح $7.5 \\times 10^5$ Pa عند 300 K.', '**القانون العام (ص 116):** $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$. **مثال (5):** أرغون 20 لتراً عند 273 K و 1 ضغط جوي يُبرّد إلى 120 K وضغط 1.25 ضغط جوي ← 7.03 لتر.'],
    challenges: [
      { q: 'مثال (3) ص 114: غاز حجمه 500 سم³ عند 20 °س سُخّن إلى 80 °س بثبوت الضغط. ما حجمه؟', hint: 'شارل، $V_1 = 0.5$ L، $T_1 = 293$، $T_2 = 353$.', init: { law: 'boyle', V1: 1, T1: 300, T2: 300, P1: 1 }, check: (p) => p.law === 'charles' && p.V1 === 0.5 && p.T1 === 293 && p.T2 === 353, why: (p, d) => '$V_2 = ' + f2(d.V2 * 1000, 4) + '$ سم³.' },
      { q: 'مثال (2) ص 113: غاز 100 سم³ عند 1 ضغط جوي (خذه 1 × 10⁵) يُضغط إلى 50 سم³ بثبوت درجة الحرارة.', hint: 'بويل، $V_1 = 0.1$، $V_2 = 0.05$، $P_1 = 1$.', init: { law: 'charles', V1: 1, P1: 2, V2: 1 }, check: (p) => p.law === 'boyle' && p.V1 === 0.1 && p.V2 === 0.05 && p.P1 === 1, why: (p, d) => '$P_2 = ' + f2(d.P2) + ' \\times 10^5$ Pa (ضعف الضغط).' },
      { q: 'مثال (4) ص 115: غاز ضغطه 5 × 10⁵ Pa عند 200 K سُخّن إلى 300 K بثبوت الحجم.', hint: 'غايلوساك، $P_1 = 5$، $T_1 = 200$، $T_2 = 300$.', init: { law: 'boyle', P1: 1, T1: 300, T2: 300 }, check: (p) => p.law === 'gay' && p.P1 === 5 && p.T1 === 200 && p.T2 === 300, why: (p, d) => '$P_2 = ' + f2(d.P2) + ' \\times 10^5$ Pa.' },
      { q: 'مثال (5) ص 116: أرغون 20 لتراً عند 273 K و 1 × 10⁵ Pa، يصبح 120 K و 1.25 × 10⁵ Pa. ما حجمه؟', hint: 'القانون العام، $V_1 = 20$، $T_1 = 273$، $P_1 = 1$، $T_2 = 120$، $P_2 = 1.25$.', init: { law: 'charles', V1: 1, T1: 300, P1: 2, T2: 300, P2: 1 }, check: (p) => p.law === 'comb' && p.V1 === 20 && p.T1 === 273 && p.P1 === 1 && p.T2 === 120 && p.P2 === 1.25, why: (p, d) => '$V_2 = ' + f2(d.V2) + '$ لتر.' }
    ],
    tutor: [
      { q: 'لماذا يجب استخدام الكلفن؟', k: ['الكلفن', 'كلفن', 'سيلسيوس'], a: (p) => 'لأن القوانين تناسبات تبدأ من الصفر المطلق: الحجم أو الضغط يتناسب مع $T$ المطلقة. لو استخدمنا °س لكانت النسبة $T_2/T_1$ خاطئة (وقد تكون قسمة على صفر عند 0 °س). مثلاً $T_1 = ' + p.T1 + '$ K = ' + (p.T1 - 273) + ' °س.' },
      { q: 'لماذا زاد الضغط؟', k: ['زاد', 'الضغط', 'لماذا'], a: (p, d) => 'الضغط ناتج عن تصادم الجزيئات بالجدران. يزداد إذا صغُر الحجم (تصادمات أكثر) أو ارتفعت درجة الحرارة (جزيئات أسرع). الضغط النهائي الآن $' + f2(d.P2, 4) + ' \\times 10^5$ Pa.' },
      { q: 'ما الثابت في هذا القانون؟', k: ['الثابت', 'ثابت'], a: (p, d) => ({ boyle: 'درجة الحرارة وكمية الغاز ثابتتان، والحاصل $PV = ' + f2(p.P1 * p.V1, 4) + '$.', charles: 'الضغط وكمية الغاز ثابتان، والنسبة $V/T = ' + f2(p.V1 / p.T1, 6) + '$ L/K.', gay: 'الحجم وكمية الغاز ثابتان، والنسبة $P/T$ ثابتة.', comb: 'كمية الغاز فقط ثابتة، والمقدار $PV/T$ ثابت.' })[p.law] }
    ]
  });

  /* ======================= 2-2 قانون أفوجادرو ومعادلة الغاز المثالي ======================= */
  const GAS = { H2: ['الهيدروجين H₂', 2], He: ['الهيليوم He', 4], N2: ['النيتروجين N₂', 28], O2: ['الأكسجين O₂', 32], Ar: ['الأرغون Ar', 40], CO2: ['ثاني أكسيد الكربون CO₂', 44] };
  ML.register({
    subject: S, id: 'ideal-gas', unit: U, order: 2, lesson: '2-2', lessonTitle: 'قانون أفوجادرو ومعادلة الغاز المثالي', page: 110,
    titleAr: 'المول وعدد أفوجادرو ومعادلة الغاز المثالي', titleEn: "Moles, Avogadro's Number & the Ideal Gas Equation", tags: 'مول افوجادرو غاز مثالي ثابت عام عدد الجزيئات كتله موليه',
    formula: 'n = \\frac{m}{M},\\qquad N = n\\,N_A,\\qquad PV = nRT',
    book: 'ن = ك / م (ص 111) ؛ عدد الجزيئات = ن × 6.02 × 10²³ ؛ ض ح = ن أ د ، أ = 8.314 جول/كلفن.مول (ص 116)',
    summary: 'المول كمية من المادة تحتوي على عدد أفوجادرو من الجزيئات ($6.02 \\times 10^{23}$). حجم الغاز يتناسب طردياً مع عدد مولاته عند ثبوت الضغط ودرجة الحرارة، ومعادلة الغاز المثالي تربط الضغط والحجم ودرجة الحرارة وعدد المولات.',
    vars: [['m', 'كتلة الغاز', '\\mathrm{g}', '1 – 200'], ['M', 'الكتلة المولية', '\\mathrm{g/mol}', 'حسب الغاز'], ['n', 'عدد المولات', '\\mathrm{mol}', 'يُحسب'], ['T', 'درجة الحرارة المطلقة', '\\mathrm{K}', '100 – 800'], ['V', 'الحجم', '\\mathrm{L}', '1 – 200'], ['R', 'الثابت العام للغازات', '\\mathrm{J/(mol\\cdot K)}', '8.314']],
    assumptions: ['الغاز مثالي.', 'تحويل الوحدات قبل التعويض: $V(\\mathrm{m^3}) = V(\\mathrm{L}) \\times 10^{-3}$.'],
    params: [
      { key: 'gas', label: '\\text{gas}', type: 'select', options: Object.keys(GAS).map((k) => [k, GAS[k][0] + ' (' + GAS[k][1] + ' g/mol)']), value: 'H2' },
      { key: 'm', label: 'm\\ (\\mathrm{g})', min: 1, max: 200, step: 1, value: 10 },
      { key: 'T', label: 'T\\ (\\mathrm{K})', min: 100, max: 800, step: 1, value: 273 },
      { key: 'V', label: 'V\\ (\\mathrm{L})', min: 1, max: 200, step: 0.1, value: 112 }
    ],
    custom: true, canvasHint: 'كل نقطة تمثل عدداً كبيراً جداً من الجزيئات؛ عددها يتناسب مع عدد المولات.',
    graphModes: ['الضغط – الحجم', 'الحجم – عدد المولات'],
    compute(p) { const Mm = GAS[p.gas][1]; const n = P.moles(p.m, Mm); const Pa = P.idealP(n, p.T, p.V * 1e-3); return { Mm: Mm, n: n, N: n * P.C.NA, P: Pa, Vstp: n * 22.4, atm: Pa / P.C.P0 }; },
    drawCustom(ctx, W, H, p, d, c) {
      const cnt = Math.round(M.clamp(d.n * 8, 3, 400)); const box = Math.min(W * 0.5, H - 90) * Math.sqrt(p.V / 200) + 40; const x0 = W * 0.38 - box / 2, y0 = (H - box) / 2 + 10;
      ctx.fillStyle = c.grid; ctx.globalAlpha = 0.4; ctx.fillRect(x0, y0, box, box); ctx.globalAlpha = 1; ctx.strokeStyle = c.axis; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, box, box);
      let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      ctx.fillStyle = c.c1; for (let i = 0; i < cnt; i++) { ctx.beginPath(); ctx.arc(x0 + 4 + rnd() * (box - 8), y0 + 4 + rnd() * (box - 8), 2.6, 0, 7); ctx.fill(); }
      const lines = [GAS[p.gas][0], 'n = ' + f2(d.n, 4) + ' mol', 'N = ' + P.sct(d.N) + ' جزيء', 'P = ' + P.sct(d.P) + ' Pa'];
      lines.forEach((s, i) => D.txt(ctx, s, W * 0.82, H * 0.3 + i * 30, { color: i === 3 ? c.c5 : c.text, size: 14, w: '700' }));
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: D.niceMax(d.n * 1.5, 1), ymin: 0, ymax: D.niceMax(d.n * 1.5 * 22.4, 10) }, xLabel: 'n (mol)', yLabel: 'V (L) عند الظروف المعيارية', caption: 'قانون أفوجادرو: عند ثبوت الضغط ودرجة الحرارة يتناسب الحجم طردياً مع عدد المولات؛ المول الواحد يشغل 22.4 لتر في الظروف المعيارية (1 ضغط جوي، 273 K).', draw(G) { const c = G.colors(); G.fn((n) => 22.4 * n, { color: c.c3, width: 3 }); G.point(d.n, d.Vstp, { color: c.c2, label: f2(d.Vstp, 3) + ' L' }); } };
      return { view: { xmin: 0, xmax: 200, ymin: 0, ymax: D.niceMax(d.n * P.C.R * p.T / 5e-3, 1) }, xLabel: 'V (L)', yLabel: 'P (Pa)', caption: 'لعدد مولات ودرجة حرارة ثابتين: $P = nRT/V$ يتناسب عكسياً مع الحجم (قانون بويل حالة خاصة).', draw(G) { const c = G.colors(); G.fn((V) => (V > 0 ? d.n * P.C.R * p.T / (V * 1e-3) : NaN), { color: c.c1, width: 3, domain: [1, 200] }); G.point(p.V, d.P, { color: c.c2 }); } };
    },
    live(p, d) { return 'n = \\frac{' + p.m + '}{' + d.Mm + '} = ' + f2(d.n, 4) + ',\\quad P = \\frac{nRT}{V} = \\frac{' + f2(d.n, 4) + ' \\times 8.314 \\times ' + p.T + '}{' + P.sci(p.V * 1e-3) + '} = ' + q(d.P, 'Pa'); },
    results(p, d) { return [['عدد المولات n', q(d.n, 'mol'), true, 'pos'], ['عدد الجزيئات N', P.sci(d.N) + '\\ \\text{جزيء}'], ['الضغط P', q(d.P, 'Pa'), true, 'pos'], ['بوحدة الضغط الجوي', q(d.atm, 'atm')], ['حجمه عند الظروف المعيارية', q(d.Vstp, 'L')], ['تحليل الأبعاد', '\\frac{\\mathrm{mol \\cdot \\tfrac{J}{mol\\,K} \\cdot K}}{\\mathrm{m^3}} = \\mathrm{\\tfrac{J}{m^3}} = \\mathrm{\\tfrac{N}{m^2}} = \\mathrm{Pa}']]; },
    steps(p, d) { return ['$n = m / M = ' + p.m + ' / ' + d.Mm + ' = ' + f2(d.n, 4) + '$ مول.', '$N = n N_A = ' + f2(d.n, 4) + ' \\times 6.02 \\times 10^{23} = ' + P.sci(d.N) + '$ جزيء.', '$V = ' + p.V + '$ L $= ' + P.sci(p.V * 1e-3) + '$ م³ ← $P = nRT/V = ' + P.sci(d.P) + '$ Pa.']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.gas !== b.gas || a.m !== b.m) o.push('صار عدد المولات $' + f2(db.n, 4) + '$ مول. الكتلة نفسها من غاز كتلته المولية أصغر تحتوي على مولات (وجزيئات) أكثر.');
      if (a.T !== b.T) o.push('ارتفاع درجة الحرارة يزيد الضغط بالنسبة نفسها (الحجم ثابت): $P = ' + P.sci(db.P) + '$ Pa.');
      if (a.V !== b.V) o.push('زيادة الحجم تُنقص الضغط (عكسياً): $P = ' + P.sci(db.P) + '$ Pa.');
      return o;
    },
    learn: ['**المول (ص 111):** كمية المادة التي تحتوي على عدد أفوجادرو من الجزيئات $6.02 \\times 10^{23}$، و $n = m / M$.', '**قانون أفوجادرو (ص 110):** الحجم يتناسب طردياً مع عدد المولات عند ثبوت الضغط ودرجة الحرارة، والمول من أي غاز يشغل 22.4 لتر في الظروف المعيارية.', '**مثال (1) ص 111:** 10 غم هيدروجين ($M = 2$): 5 مول، و $3.01 \\times 10^{24}$ جزيء.', '**معادلة الغاز المثالي (ص 116):** $PV = nRT$، $R = 8.314$ J/(mol·K) = 0.0821 L·atm/(mol·K).'],
    challenges: [
      { q: 'مثال (1) ص 111: عينة هيدروجين 10 غم. جد عدد المولات وعدد الجزيئات.', hint: 'H₂، $m = 10$.', init: { gas: 'O2', m: 32, T: 273, V: 22.4 }, check: (p) => p.gas === 'H2' && p.m === 10, why: (p, d) => '$n = 5$ مول و $N = ' + P.sci(d.N) + '$ جزيء.' },
      { q: 'اجعل مولاً واحداً من الأكسجين عند 273 K يشغل حجمه في الظروف المعيارية، وتحقق أن ضغطه ≈ 1 ضغط جوي.', hint: 'O₂، $m = 32$، $T = 273$، $V = 22.4$.', init: { gas: 'H2', m: 10, T: 300, V: 50 }, check: (p, d) => p.gas === 'O2' && p.m === 32 && p.T === 273 && p.V === 22.4, why: (p, d) => '$P = ' + P.sci(d.P) + '$ Pa ≈ $1.013 \\times 10^5$.' }
    ],
    tutor: [
      { q: 'كم جزيئاً في العينة؟', k: ['جزيء', 'جزيئات', 'كم'], a: (p, d) => '$N = n N_A = ' + f2(d.n, 4) + ' \\times 6.02 \\times 10^{23} = ' + P.sci(d.N) + '$ جزيء.' },
      { q: 'لماذا يختلف عدد المولات بين الغازات بالكتلة نفسها؟', k: ['يختلف', 'المولات', 'الكتله'], a: (p, d) => 'لأن $n = m/M$ والكتلة المولية تختلف: ' + p.m + ' غم من ' + GAS[p.gas][0] + ' (M = ' + d.Mm + ') = ' + f2(d.n, 4) + ' مول.' }
    ]
  });

  /* ======================= 2-5 القانون الأول في الديناميكا الحرارية ======================= */
  ML.register({
    subject: S, id: 'first-law', unit: U, order: 3, lesson: '2-5', lessonTitle: 'قوانين الديناميكا الحرارية', page: 120,
    titleAr: 'القانون الأول في الديناميكا الحرارية', titleEn: 'First Law of Thermodynamics', tags: 'القانون الاول ديناميكا حراريه طاقه داخليه شغل حراره نظام',
    formula: '\\Delta U = Q - W, \\qquad W = P\\,\\Delta V\\ (\\text{at constant } P)',
    book: 'Δطد = كح − ش ، ش = ض × Δح ؛ كح موجبة إذا اكتسب النظام حرارة، ش موجب إذا بذل النظام شغلاً (ص 120–121)',
    summary: 'التغير في الطاقة الداخلية لنظام يساوي كمية الحرارة التي اكتسبها مطروحاً منها الشغل الذي بذله النظام. إنه تطبيق لمبدأ حفظ الطاقة على الأنظمة الحرارية.',
    vars: [['Q', 'كمية الحرارة (+ مكتسبة، − مفقودة)', '\\mathrm{J}', '−6000 – 6000'], ['W', 'الشغل (+ يبذله النظام، − يُبذل عليه)', '\\mathrm{J}', 'يُحسب أو يُدخل'], ['P,\\ \\Delta V', 'الضغط الثابت والتغير في الحجم', '\\mathrm{Pa},\\ \\mathrm{L}', 'P: 0.5–5 × 10⁵ ، ΔV: −10 – 10 L'], ['\\Delta U', 'التغير في الطاقة الداخلية', '\\mathrm{J}', 'يُحسب']],
    assumptions: ['النظام غاز محصور في أسطوانة بمكبس عديم الاحتكاك.', 'في العملية ثابتة الضغط: $W = P \\Delta V$ (مع تحويل اللتر إلى م³). في العملية ثابتة الحجم: $W = 0$.'],
    params: [
      { key: 'proc', label: '\\text{process}', type: 'select', options: [['free', 'عامة: أدخل الشغل'], ['isochoric', 'ثابتة الحجم (W = 0)'], ['isobaric', 'ثابتة الضغط (W = PΔV)']], value: 'free' },
      { key: 'Q', label: 'Q\\ (\\mathrm{J})', min: -6000, max: 6000, step: 50, value: 5000 },
      { key: 'W', label: 'W\\ (\\mathrm{J})', min: -6000, max: 6000, step: 50, value: 500, hidden: (p) => p.proc !== 'free' },
      { key: 'Pc', label: 'P\\ (10^5\\,\\mathrm{Pa})', min: 0.5, max: 5, step: 0.1, value: 1, hidden: (p) => p.proc !== 'isobaric' },
      { key: 'dV', label: '\\Delta V\\ (\\mathrm{L})', min: -10, max: 10, step: 0.5, value: 5, hidden: (p) => p.proc !== 'isobaric' }
    ],
    resetOn: ['proc', 'Q', 'W', 'Pc', 'dV'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, s: 0, ps: makeParticles(40) }),
    tick(st, p, d, dt) { st.t += dt; st.s = Math.min(1, st.s + dt / 3); moveParticles(st.ps, 300 + 0.04 * d.dU * st.s, 0.5 + (d.dVL / 40) * st.s, dt); },
    isDone: (st) => st.s >= 1,
    custom: true, canvasHint: 'اضغط «تشغيل»: الحرارة تدخل/تخرج، والمكبس يتحرك بحسب الشغل، وسرعة الجزيئات تعكس الطاقة الداخلية.',
    graphModes: ['ميزان الطاقة', 'مخطط الضغط – الحجم'],
    compute(p) {
      let W = p.W, dVL = 0, Pc = p.Pc;
      if (p.proc === 'isochoric') W = 0;
      if (p.proc === 'isobaric') { dVL = p.dV; W = Pc * 1e5 * p.dV * 1e-3; }
      if (p.proc === 'free') dVL = M.clamp(W / 500, -10, 10);
      return { W: W, dVL: dVL, dU: P.firstLaw(p.Q, W) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { s: 0, ps: [] }; const s = st.s || 0; const x0 = 40, y0 = 80, h = H - 160; const w = (W - 260) * (0.5 + (d.dVL / 40) * s);
      cylinder(ctx, x0, y0, w, h, st.ps, 300 + 0.04 * d.dU * s, c, true);
      // سهم الحرارة
      if (p.Q !== 0) { const up = p.Q > 0; D.arrow(ctx, x0 + w / 2, up ? y0 + h + 60 : y0 + h + 8, x0 + w / 2, up ? y0 + h + 8 : y0 + h + 60, up ? c.c2 : c.c1, 5); D.txt(ctx, 'Q = ' + p.Q + ' J', x0 + w / 2 + 14, y0 + h + 40, { color: up ? c.c2 : c.c1, size: 13, w: '700', align: 'left' }); }
      if (d.W !== 0) { const out = d.W > 0; const px = x0 + w + 80; D.arrow(ctx, out ? px : px + 60, y0 + h / 2 - 22, out ? px + 60 : px, y0 + h / 2 - 22, c.c3, 5); D.txt(ctx, 'W = ' + f2(d.W) + ' J', px + 30, y0 + h / 2 - 42, { color: c.c3, size: 13, w: '700' }); }
      D.txt(ctx, 'ΔU = Q − W = ' + p.Q + ' − (' + f2(d.W) + ') = ' + f2(d.dU) + ' J', W / 2, 26, { color: d.dU >= 0 ? c.c2 : c.c1, size: 16, w: '700' });
      D.txt(ctx, d.dU > 0 ? 'الطاقة الداخلية تزداد ← ترتفع درجة الحرارة' : d.dU < 0 ? 'الطاقة الداخلية تنقص ← تنخفض درجة الحرارة' : 'الطاقة الداخلية ثابتة', W / 2, 52, { color: c.muted, size: 13 });
    },
    graph(p, d, gi) {
      if (gi === 1) {
        const P0 = p.proc === 'isobaric' ? p.Pc : 1; const V1 = 10; const V2 = V1 + d.dVL;
        return { view: { xmin: 0, xmax: 22, ymin: 0, ymax: 6 }, xLabel: 'V (L)', yLabel: 'P (10⁵ Pa)', caption: p.proc === 'isochoric' ? 'ثابتة الحجم: المسار خط رأسي، والمساحة تحته صفر ← $W = 0$ و $\\Delta U = Q$.' : p.proc === 'isobaric' ? 'ثابتة الضغط: المسار خط أفقي، والمساحة المظللة تحته = الشغل $W = P\\Delta V = ' + f2(d.W) + '$ J.' : 'في العملية العامة نُدخل الشغل مباشرة؛ اختر «ثابتة الضغط» لرؤية الشغل كمساحة تحت المسار.', draw(G) { const c = G.colors(); if (p.proc === 'isochoric') { G.arrow(V1, 1, V1, 1 + p.Q / 2000 * (p.Q >= 0 ? 1 : 0.4), { color: c.c2, width: 3 }); } else { G.polygon([[V1, 0], [V2, 0], [V2, P0], [V1, P0]], { fill: c.c3, fillAlpha: 0.25, color: c.c3 }); G.arrow(V1, P0, V2, P0, { color: c.c5, width: 3 }); } G.point(V1, P0, { color: c.muted, label: '1' }); } };
      }
      const m = Math.max(1000, Math.abs(p.Q), Math.abs(d.W), Math.abs(d.dU)) * 1.15;
      return { view: { xmin: 0, xmax: 4, ymin: -m, ymax: m }, xLabel: '', yLabel: 'J', caption: 'الأعمدة: كمية الحرارة $Q$ (الأحمر)، الشغل $W$ (الأخضر)، التغير في الطاقة الداخلية $\\Delta U = Q - W$ (البنفسجي).', draw(G) { const c = G.colors(); [[p.Q, c.c2, 'Q'], [d.W, c.c3, 'W'], [d.dU, c.c5, 'ΔU']].forEach((b, i) => { const x = 0.6 + i * 1.2; G.polygon([[x, 0], [x + 0.7, 0], [x + 0.7, b[0]], [x, b[0]]], { fill: b[1], fillAlpha: 0.6, color: b[1] }); G.text(x + 0.35, b[0], b[2] + ' = ' + f2(b[0]), { color: b[1], align: 'center', dy: b[0] >= 0 ? -10 : 12, bold: true }); }); G.hline(0, { color: c.axis }); } };
    },
    live(p, d) { return '\\Delta U = Q - W = ' + p.Q + ' - (' + f2(d.W) + ') = ' + q(d.dU, 'J'); },
    results(p, d) { return [['كمية الحرارة Q', q(p.Q, 'J') + (p.Q >= 0 ? '\\ (\\text{مكتسبة})' : '\\ (\\text{مفقودة})')], ['الشغل W', q(d.W, 'J') + (d.W > 0 ? '\\ (\\text{يبذله النظام})' : d.W < 0 ? '\\ (\\text{يُبذل عليه})' : '')], ['التغير في الطاقة الداخلية ΔU', q(d.dU, 'J'), true, d.dU >= 0 ? 'pos' : 'neg'], ['تحليل الأبعاد (W = PΔV)', '\\mathrm{Pa \\cdot m^3} = \\mathrm{N\\,m} = \\mathrm{J}']]; },
    steps(p, d) { const s = []; if (p.proc === 'isochoric') s.push('الحجم ثابت ← $\\Delta V = 0$ ← $W = P\\Delta V = 0$.'); if (p.proc === 'isobaric') s.push('$W = P \\Delta V = ' + p.Pc + ' \\times 10^5 \\times ' + p.dV + ' \\times 10^{-3} = ' + f2(d.W) + '$ J.'); s.push('$\\Delta U = Q - W = ' + p.Q + ' - (' + f2(d.W) + ') = ' + f2(d.dU) + '$ J.'); return s; },
    explain(a, b, da, db) {
      const o = [];
      if (a.Q !== b.Q) o.push((b.Q > a.Q ? 'زادت' : 'قلّت') + ' الحرارة المزوّدة فصار $\\Delta U = ' + f2(db.dU) + '$ J. الحرارة الداخلة تزيد الطاقة الداخلية ما لم تُصرف شغلاً.');
      if (a.W !== b.W || a.dV !== b.dV || a.Pc !== b.Pc) o.push('تغيّر الشغل إلى $' + f2(db.W) + '$ J: ' + (db.W > 0 ? 'النظام يبذل شغلاً (يتمدد) فيصرف جزءاً من طاقته، فتقل $\\Delta U$.' : db.W < 0 ? 'يُبذل شغل على النظام (ينضغط) فيكتسب طاقة إضافية.' : 'لا شغل.'));
      if (a.proc !== b.proc) o.push(b.proc === 'isochoric' ? 'عملية ثابتة الحجم: لا يتحرك المكبس، فكل الحرارة تذهب للطاقة الداخلية.' : b.proc === 'isobaric' ? 'عملية ثابتة الضغط: الشغل = الضغط × التغير في الحجم.' : 'عملية عامة.');
      return o;
    },
    learn: ['**القانون الأول (ص 120):** التغير في الطاقة الداخلية = كمية الحرارة − الشغل: $\\Delta U = Q - W$.', '**الإشارات (ص 120):** $Q$ موجبة إذا اكتسب النظام حرارة وسالبة إذا فقدها؛ $W$ موجب إذا بذل النظام شغلاً وسالب إذا بُذل عليه.', '**مثال (6) ص 121:** (أ) فقد 2000 J بحجم ثابت ← $\\Delta U = -2000$ J. (ب) اكتسب 5000 J وبذل 500 J ← $\\Delta U = 4500$ J.', '**القانون الصفري (ص 119):** إذا كان النظام (أ) في اتزان حراري مع (ب) ومع (ج)، فإن (ب) في اتزان حراري مع (ج).'],
    challenges: [
      { q: 'مثال (6-ب) ص 121: نظام زُوّد بـ 5000 J وبذل شغلاً 500 J. ما التغير في طاقته الداخلية؟', hint: 'عامة، $Q = 5000$، $W = 500$.', init: { proc: 'isochoric', Q: 0, W: 0 }, check: (p, d) => p.proc === 'free' && p.Q === 5000 && p.W === 500, why: (p, d) => '$\\Delta U = ' + d.dU + '$ J.' },
      { q: 'مثال (6-أ) ص 121: نظام فقد 2000 J تحت حجم ثابت.', hint: 'ثابتة الحجم، $Q = -2000$.', init: { proc: 'free', Q: 1000, W: 500 }, check: (p) => p.proc === 'isochoric' && p.Q === -2000, why: () => '$\\Delta U = -2000$ J (الإشارة السالبة: فقد طاقة).' },
      { q: 'اجعل الطاقة الداخلية ثابتة (ΔU = 0) في عملية ثابتة الضغط مع Q = 1000 J.', hint: '$W = Q = 1000$ ← مثلاً $P = 2 \\times 10^5$ و $\\Delta V = 5$ L.', init: { proc: 'isobaric', Q: 1000, Pc: 1, dV: 2 }, check: (p, d) => p.proc === 'isobaric' && p.Q === 1000 && M.near(d.dU, 0, 1e-6) }
    ],
    tutor: [
      { q: 'لماذا نطرح الشغل من الحرارة؟', k: ['نطرح', 'الشغل', 'لماذا'], a: (p, d) => 'لأن الشغل الذي يبذله النظام طاقة تخرج منه. من أصل ' + p.Q + ' J حرارة بذل النظام ' + f2(d.W) + ' J شغلاً، فبقي $' + f2(d.dU) + '$ J زيادة في طاقته الداخلية — حفظ الطاقة.' },
      { q: 'متى يكون الشغل صفراً؟', k: ['صفر', 'متى'], a: () => 'عندما لا يتغير الحجم (عملية ثابتة الحجم)، لأن $W = P\\Delta V$ و $\\Delta V = 0$؛ عندها $\\Delta U = Q$.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
