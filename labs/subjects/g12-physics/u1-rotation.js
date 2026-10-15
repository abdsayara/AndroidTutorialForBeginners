/* فيزياء الثاني عشر — الوحدة الأولى، الفصل 3: الحركة الدورانية (ص33–54) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q;

  /* ======================= نشاط (1-3) القوة المركزية ص34 ======================= */
  K.reg({
    id: 'centripetal', unit: 3, order: 1, lesson: '—', lessonTitle: 'القوة المركزية', page: 34,
    titleAr: 'القوة المركزية: سيارة مربوطة بخيط', titleEn: 'Centripetal Force', tags: 'قوة مركزية تسارع مركزي حركة دائرية خيط سيارة مماس نشاط 1-3',
    formula: 'a_c = \\frac{v^2}{r} ,\\qquad F_c = m\\frac{v^2}{r} = m r \\omega^2',
    book: 'نشاط (1-3) ص34: سيارة أطفال مربوطة بخيط طوله 40 cm إلى مسمار، يرسم قلم مثبت فيها مسارها: خط مستقيم دون خيط، ودائرة مع الخيط، وخط مماسي عند قطع الخيط.',
    summary: 'الجسم المتحرك في مسار دائري يحتاج قوة نحو المركز (القوة المركزية) تغيّر اتجاه سرعته باستمرار. إذا زالت القوة يتحرك الجسم في خط مستقيم مماسي للدائرة.',
    vars: [['m', 'كتلة السيارة', '\\mathrm{kg}', '0.1 – 2'], ['v', 'سرعتها', '\\mathrm{m/s}', '0.1 – 3'], ['r', 'طول الخيط (نصف القطر)', '\\mathrm{m}', '0.1 – 1 (الكتاب: 0.4)'], ['F_c', 'القوة المركزية (الشد)', '\\mathrm{N}', '—']],
    assumptions: ['السرعة ثابتة المقدار، والسطح أملس.'],
    params: [
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.1, max: 2, step: 0.1, value: 0.5 },
      { key: 'v', label: 'v\\ (\\mathrm{m/s})', min: 0.1, max: 3, step: 0.1, value: 1 },
      { key: 'r', label: 'r\\ (\\mathrm{m})', min: 0.1, max: 1, step: 0.05, value: 0.4 },
      { key: 'cut', label: '\\text{الخيط}', type: 'toggle', value: false, on: 'مقطوع', off: 'مربوط' }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, tc: null }),
    tick(st, p, d, dt) { st.t += dt; if (p.cut && st.tc === null) st.tc = st.t; if (!p.cut) st.tc = null; },
    compute(p) { const ac = p.v * p.v / p.r; return { ac: ac, F: p.m * ac, w: p.v / p.r, T: 2 * Math.PI * p.r / p.v }; },
    live(p, d) { return 'F_c = m\\frac{v^2}{r} = ' + p.m + '\\times\\frac{' + p.v + '^2}{' + p.r + '} = ' + q(d.F, 'N', 3); },
    results(p, d) { return [['التسارع المركزي', q(d.ac, 'm/s^2', 3)], ['القوة المركزية (الشد في الخيط)', p.cut ? '0\\ (\\text{قُطع الخيط})' : q(d.F, 'N', 3), true, 'pos'], ['السرعة الزاوية ω', q(d.w, 'rad/s', 3)], ['زمن الدورة', q(d.T, 's', 3)]]; },
    steps(p, d) { return ['a_c = v²/r = ' + p.v + '² ÷ ' + p.r + ' = ' + n(d.ac) + ' m/s².', 'F_c = m a_c = ' + n(d.F) + ' N نحو المركز.', p.cut ? 'بعد قطع الخيط تتحرك السيارة في خط مستقيم مماسي.' : 'الخيط يؤثر بالقوة المركزية.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0, tc: null }; const cx = W / 2, cy = H * 0.52, R = Math.min(W, H) * 0.32 * (p.r / 1) + 30;
      ctx.strokeStyle = cols.grid; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = cols.text; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      let a = (st.tc !== null ? st.tc : st.t) * d.w; let x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      if (st.tc !== null) { const dt = st.t - st.tc; const sc = R / p.r; x += -Math.sin(a) * p.v * dt * sc; y += Math.cos(a) * p.v * dt * sc; }
      else { ctx.strokeStyle = cols.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); K.vec(ctx, x, y, (cx - x) * 0.35, (cy - y) * 0.35, cols.c2, 'Fc', cols); }
      ctx.fillStyle = cols.c1; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
      K.vec(ctx, x, y, -Math.sin(a) * 40, Math.cos(a) * 40, cols.c3, 'v', cols);
      D.txt(ctx, p.cut ? 'قُطع الخيط: حركة في خط مستقيم مماسي' : 'حركة دائرية بقوة مركزية', W / 2, H * 0.08, { color: cols.text, size: 15, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 3, ymin: 0, ymax: Math.max(1, p.m * 9 / p.r * 1.1) }, xLabel: 'v (m/s)', yLabel: 'Fc (N)', caption: 'القوة المركزية تتناسب مع مربع السرعة.', draw(G) { const c = G.colors(); G.fn((v) => p.m * v * v / p.r, { color: c.c1, width: 3, domain: [0, 3] }); G.point(p.v, d.F, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.cut !== b.cut) o.push(b.cut ? 'زالت القوة المركزية فتحرّكت السيارة في خط مستقيم مماسي (القصور الذاتي).' : 'أعدت ربط الخيط.'); if (a.v !== b.v) o.push('مضاعفة السرعة تضاعف القوة المركزية أربع مرات.'); return o; },
    learn: ['**القوة المركزية (ص34):** قوة باتجاه المركز تلزم لتحريك جسم في مسار دائري، a_c = v²/r ، F_c = m v²/r = m r ω².', 'في النشاط: دون خيط تتحرك السيارة في خط مستقيم، ومع الخيط في دائرة، وعند تحرير الخيط تعود إلى خط مستقيم مماسي.'],
    challenges: [
      { q: 'اقطع الخيط وشغّل الحركة: ما شكل المسار؟', hint: 'شغّل «مقطوع» ثم ▶.', init: { cut: false }, check: (p) => p.cut, why: () => 'خط مستقيم مماسي للدائرة.' },
      { q: 'اجعل الشد في الخيط 5 N تماماً بخيط طوله 0.4 m وكتلة 0.5 kg.', hint: 'F = m v²/r ⇒ v² = F r / m.', init: { m: 0.5, r: 0.4, v: 1, cut: false }, check: (p, d) => !p.cut && Math.abs(p.m - 0.5) < 1e-9 && Math.abs(p.r - 0.4) < 1e-9 && Math.abs(d.F - 5) < 1e-6, why: () => 'v² = 5 × 0.4 ÷ 0.5 = 4 ⇒ v = 2 m/s.' }
    ],
    tutor: [
      { q: 'لماذا تتحرك السيارة في خط مستقيم بعد قطع الخيط؟', k: ['قطع', 'مستقيم'], a: () => K.tutor('هل بقيت قوة نحو المركز؟', 'لا قوة مركزية، فتتحرك السيارة بسرعتها المماسية في خط مستقيم.') },
      { q: 'ما الذي يؤثر بالقوة المركزية هنا؟', k: ['يؤثر', 'مصدر'], a: () => K.tutor('ما الذي يشد السيارة نحو المسمار؟', 'قوة الشد في الخيط.') },
      { q: 'كيف أحسب القوة المركزية؟', k: ['احسب'], a: (p, d) => K.tutor('ما العلاقة بين القوة والسرعة ونصف القطر؟', 'F_c = m v²/r = ' + n(d.F) + ' N.') }
    ]
  });

  /* ======================= 1-3 العزم ص35–37 ======================= */
  K.reg({
    id: 'torque', unit: 3, order: 2, lesson: '1-3', lessonTitle: 'العزم', page: 36,
    titleAr: 'عزم القوة: فتح الباب', titleEn: 'Torque', tags: 'عزم قوة ذراع زاوية باب محور الدوران قاعدة اليد اليمنى نشاط 2-3 نشاط 3-3',
    formula: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} ,\\qquad \\tau = r F \\sin\\theta',
    book: 'القانون (3-1) ص36. نشاط (2-3) فتح الباب بقوى متساوية من أماكن مختلفة، ونشاط (3-3) عزم القوة. مثال (1) ص37: τ₁ = rF₁ (قوة مماسية) و τ₂ = 0 (قوة نحو المحور).',
    summary: 'أثر القوة الدوراني يعتمد على مقدارها، وعلى بعد نقطة تأثيرها عن محور الدوران، وعلى الزاوية بين r و F. أكبر عزم عندما تكون القوة عمودية على r، والعزم صفر إذا كانت القوة باتجاه المحور.',
    vars: [['r', 'بعد نقطة التأثير عن المحور', '\\mathrm{m}', '0.05 – 1'], ['F', 'مقدار القوة', '\\mathrm{N}', '0 – 50'], ['\\theta', 'الزاوية بين r و F', '^\\circ', '0 – 180'], ['\\tau', 'العزم', '\\mathrm{N\\,m}', '—']],
    assumptions: ['القوة في مستوى الباب، والمحور هو المفصلة.'],
    params: [
      { key: 'r', label: 'r\\ (\\mathrm{m})', min: 0.05, max: 1, step: 0.05, value: 0.8 },
      { key: 'F', label: 'F\\ (\\mathrm{N})', min: 0, max: 50, step: 1, value: 20 },
      { key: 'th', label: '\\theta\\ (^\\circ)', min: 0, max: 180, step: 5, value: 90 }
    ],
    compute(p) { return { tau: Q.torque(p.r, p.F, p.th), arm: p.r * Math.sin(p.th * Math.PI / 180) }; },
    live(p, d) { return '\\tau = r F \\sin\\theta = ' + p.r + ' \\times ' + p.F + ' \\times \\sin ' + p.th + '^\\circ = ' + q(d.tau, 'N\\,m', 3); },
    results(p, d) { return [['العزم τ', q(Math.abs(d.tau), 'N\\,m', 3), true, 'pos'], ['ذراع القوة r sinθ', q(d.arm, 'm', 3)], ['الاتجاه (قاعدة اليد اليمنى)', d.tau > 1e-9 ? 'خارج الورقة (عكس عقارب الساعة)' : d.tau < -1e-9 ? 'داخل الورقة' : 'لا دوران', false]]; },
    steps(p, d) { return ['τ = r F sinθ = ' + p.r + ' × ' + p.F + ' × sin' + p.th + '° = ' + n(d.tau) + ' N.m.', 'وحدة العزم N.m، وهو كمية متجهة عمودية على مستوى r و F.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const hx = W * 0.15, hy = H * 0.5, Ld = W * 0.7; ctx.fillStyle = 'rgba(180,83,9,.35)'; ctx.fillRect(hx, hy - 14, Ld, 28); ctx.fillStyle = cols.text; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill();
      D.txt(ctx, 'المفصلة (المحور)', hx, hy + 34, { color: cols.muted, size: 12, w: '700' });
      const px = hx + Ld * p.r, a = p.th * Math.PI / 180; const fl = Math.min(H * 0.35, 20 + p.F * 3);
      K.vec(ctx, hx, hy - 30, px - hx, 0, cols.c1, 'r', cols, 2);
      K.vec(ctx, px, hy, Math.cos(a) * fl, -Math.sin(a) * fl, cols.c2, 'F', cols, 4);
      ctx.strokeStyle = cols.muted; ctx.beginPath(); ctx.arc(px, hy, 26, -a, 0); ctx.stroke(); D.txt(ctx, 'θ', px + 34, hy - 16, { color: cols.text, size: 13, w: '700' });
      D.txt(ctx, 'τ = ' + n(Math.abs(d.tau), 2) + ' N.m', W / 2, H * 0.12, { color: cols.text, size: 17, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 180, ymin: 0, ymax: Math.max(1, p.r * p.F) * 1.15 }, xLabel: 'θ (°)', yLabel: 'τ (N.m)', caption: 'أكبر عزم عند θ = 90°، والعزم صفر عند 0° و 180°.', draw(G) { const c = G.colors(); G.fn((x) => p.r * p.F * Math.sin(x * Math.PI / 180), { color: c.c1, width: 3, domain: [0, 180] }); G.point(p.th, d.tau, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.r !== b.r) o.push('كلما ابتعدت نقطة التأثير عن المفصلة زاد العزم، لذلك تُوضع المقابض بعيداً عن المفصلة.'); if (a.th !== b.th) o.push(Math.abs(Math.sin(b.th * Math.PI / 180)) < 1e-9 ? 'القوة باتجاه المحور: لا عزم ولا دوران.' : 'العزم يتناسب مع sinθ.'); return o; },
    learn: ['**العزم (3-1):** τ = r × F ، τ = rF sinθ، ووحدته N.m.', '**قاعدة اليد اليمنى:** الأصابع باتجاه r ثم تُدار نحو F فيشير الإبهام إلى اتجاه العزم.', '**الفرق عن الشغل:** للعزم والشغل الوحدة نفسها (N.m)، لكن العزم متجه والشغل قياسي.'],
    challenges: [
      { q: 'مثال (1): اجعل القوة نحو المحور فلا يدور الباب.', hint: 'الزاوية بين r و F تساوي 180°.', init: { th: 90 }, check: (p) => p.th === 180 || p.th === 0, why: () => 'τ = rF sin180° = 0.' },
      { q: 'افتح الباب بأقل قوة ممكنة لعزم 8 N.m.', hint: 'اجعل r أكبر ما يمكن و θ = 90°.', init: { r: 0.2, F: 40, th: 90 }, check: (p, d) => Math.abs(d.tau - 8) < 1e-6 && p.F === 8, why: () => 'r = 1 m و F = 8 N.' }
    ],
    tutor: [
      { q: 'لماذا يوضع مقبض الباب بعيداً عن المفصلة؟', k: ['مقبض', 'مفصله', 'لماذا'], a: () => K.tutor('كيف يتغير العزم مع r؟', 'العزم يتناسب طردياً مع r، فتلزم قوة أقل للعزم نفسه.') },
      { q: 'متى يكون العزم صفراً؟', k: ['صفر', 'متى'], a: () => K.tutor('ما قيمة sin0° و sin180°؟', 'عندما تمر القوة بالمحور (θ = 0° أو 180°) أو عندما r = 0.') },
      { q: 'هل العزم متجه؟', k: ['متجه', 'اتجاه'], a: () => K.tutor('كيف تحدد اتجاه العزم؟', 'نعم، واتجاهه عمودي على مستوى r و F بقاعدة اليد اليمنى.') }
    ]
  });

  /* ======================= 2-3 القصور الدوراني ص37–38 (جدول 1) ======================= */
  const SHAPES = {
    rodC: ['سلك رفيع حول محور عمودي عند المركز', 1 / 12, 'L'], rodE: ['سلك رفيع حول محور عمودي عند الطرف', 1 / 3, 'L'],
    ringIn: ['طوق حول محور في مستواه', 1 / 2, 'R'], ringPerp: ['طوق حول محور عمودي على مستواه', 1, 'R'],
    diskIn: ['قرص رقيق حول محور في مستواه', 1 / 4, 'R'], diskPerp: ['قرص رقيق حول محور عمودي على مستواه', 1 / 2, 'R'],
    sphere: ['كرة مصمتة حول قطر', 2 / 5, 'R'], shell: ['قشرة كروية رقيقة حول قطر', 2 / 3, 'R'], cyl: ['أسطوانة مصمتة حول محورها', 1 / 2, 'R'],
    two: ['كتلتان 5 kg و 7 kg على ساق مهملة (مثال 2)', null, 'x']
  };
  K.reg({
    id: 'moment-of-inertia', unit: 3, order: 3, lesson: '2-3', lessonTitle: 'القصور الدوراني', page: 38,
    titleAr: 'القصور الدوراني لأجسام مختلفة', titleEn: 'Moment of Inertia', tags: 'قصور دوراني عزم القصور جدول 1 سلك طوق قرص كرة اسطوانة كتلتان محور مثال 2',
    formula: 'I = \\sum m_i r_i^2',
    book: 'القانونان (3-2) و(3-3) ص37، وجدول (1) ص38. مثال (2) ص38: كتلتان 5 kg و 7 kg تفصلهما 4 m؛ حول المنتصف I = 48 kg.m²، وحول محور على بعد 0.5 m يسار الكتلة 5 kg I = 143 kg.m².',
    summary: 'القصور الدوراني مقياس لممانعة الجسم لتغيير حالته الدورانية، ويعتمد على الكتلة وطريقة توزيعها حول محور الدوران؛ فكلما ابتعدت الكتلة عن المحور زاد القصور.',
    vars: [['M', 'كتلة الجسم', '\\mathrm{kg}', '0.5 – 10'], ['R\\ \\text{أو}\\ L', 'نصف القطر أو الطول', '\\mathrm{m}', '0.1 – 2'], ['x', 'موقع المحور عن الكتلة 5 kg (مثال 2)', '\\mathrm{m}', '−2 – 4'], ['I', 'القصور الدوراني', '\\mathrm{kg\\,m^2}', '—']],
    assumptions: ['الأجسام منتظمة الكثافة.'],
    params: [
      { key: 'shape', label: '\\text{الجسم والمحور}', type: 'select', value: 'two', options: Object.keys(SHAPES).map((k) => [k, SHAPES[k][0]]) },
      { key: 'M', label: 'M\\ (\\mathrm{kg})', min: 0.5, max: 10, step: 0.5, value: 2, hidden: (p) => p.shape === 'two' },
      { key: 'R', label: 'R\\ \\text{أو}\\ L\\ (\\mathrm{m})', min: 0.1, max: 2, step: 0.1, value: 1, hidden: (p) => p.shape === 'two' },
      { key: 'x', label: 'x\\ (\\mathrm{m})', min: -2, max: 4, step: 0.5, value: 2, desc: 'المحور على بعد x يمين الكتلة 5 kg', hidden: (p) => p.shape !== 'two' }
    ],
    compute(p) { if (p.shape === 'two') { const I = 5 * p.x * p.x + 7 * Math.pow(4 - p.x, 2); return { I: I }; } const s = SHAPES[p.shape]; return { I: s[1] * p.M * p.R * p.R, k: s[1] }; },
    live(p, d) { return p.shape === 'two' ? 'I = 5(' + p.x + ')^2 + 7(' + (4 - p.x) + ')^2 = ' + q(d.I, 'kg\\,m^2', 4) : 'I = ' + K.n(d.k, 4) + ' \\times ' + p.M + ' \\times ' + p.R + '^2 = ' + q(d.I, 'kg\\,m^2', 4); },
    results(p, d) { return [['القصور الدوراني I', q(d.I, 'kg\\,m^2', 4), true, 'pos'], ['الجسم', SHAPES[p.shape][0], false]]; },
    steps(p, d) { return p.shape === 'two' ? ['I = Σ m r² = 5 × ' + p.x + '² + 7 × ' + (4 - p.x) + '² = ' + n(d.I, 3) + ' kg.m².'] : ['من جدول (1): I = ' + n(d.k, 4) + ' × M × ' + SHAPES[p.shape][2] + '² = ' + n(d.I, 4) + ' kg.m².']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.5; const S = Math.min(W, H) * 0.3;
      if (p.shape === 'two') { const sc = W * 0.7 / 6; const x0 = W * 0.15 + 2 * sc; ctx.strokeStyle = cols.muted; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + 4 * sc, cy); ctx.stroke();
        ctx.fillStyle = cols.c1; ctx.beginPath(); ctx.arc(x0, cy, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(x0 + 4 * sc, cy, 21, 0, Math.PI * 2); ctx.fill();
        D.txt(ctx, '5 kg', x0, cy, { color: '#fff', size: 12, w: '700' }); D.txt(ctx, '7 kg', x0 + 4 * sc, cy, { color: '#fff', size: 12, w: '700' });
        const ax = x0 + p.x * sc; ctx.strokeStyle = cols.c4; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(ax, cy - 80); ctx.lineTo(ax, cy + 80); ctx.stroke(); ctx.setLineDash([]); D.txt(ctx, 'المحور', ax, cy - 92, { color: cols.c4, size: 12, w: '700' }); }
      else {
        ctx.strokeStyle = cols.c1; ctx.fillStyle = 'rgba(37,99,235,.18)'; ctx.lineWidth = 3; const r = S * Math.min(1, p.R / 2 + 0.3);
        if (p.shape.startsWith('rod')) { ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke(); }
        else if (p.shape.startsWith('ring')) { ctx.beginPath(); ctx.ellipse(cx, cy, r, p.shape === 'ringIn' ? r : r * 0.35, 0, 0, Math.PI * 2); ctx.stroke(); }
        else if (p.shape.startsWith('disk') || p.shape === 'cyl') { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); if (p.shape === 'cyl') { ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.8, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke(); } }
        else { const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 5, cx, cy, r); g.addColorStop(0, '#dbeafe'); g.addColorStop(1, p.shape === 'shell' ? 'rgba(37,99,235,.3)' : '#2563eb'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
        const ax = p.shape === 'rodE' ? cx - r : cx; ctx.strokeStyle = cols.c4; ctx.setLineDash([6, 4]); ctx.beginPath(); if (p.shape === 'ringIn' || p.shape === 'diskIn') { ctx.moveTo(cx - r - 30, cy); ctx.lineTo(cx + r + 30, cy); } else { ctx.moveTo(ax, cy - r - 40); ctx.lineTo(ax, cy + r + 40); } ctx.stroke(); ctx.setLineDash([]);
      }
      D.txt(ctx, 'I = ' + n(d.I, 3) + ' kg.m²', W / 2, H * 0.08, { color: cols.text, size: 17, w: '700' });
    },
    graph(p, d) { if (p.shape === 'two') return { view: { xmin: -2, xmax: 4, ymin: 0, ymax: 160 }, xLabel: 'x (m)', yLabel: 'I (kg.m²)', caption: 'أقل قصور عندما يمر المحور بمركز الكتلة.', draw(G) { const c = G.colors(); G.fn((x) => 5 * x * x + 7 * (4 - x) * (4 - x), { color: c.c1, width: 3, domain: [-2, 4] }); G.point(p.x, d.I, { color: c.c2 }); } };
      const items = ['rodC', 'diskPerp', 'sphere', 'shell', 'ringPerp'].map((k) => [k, SHAPES[k][1] * p.M * p.R * p.R]); return { view: { xmin: 0, xmax: 5, ymin: 0, ymax: p.M * p.R * p.R * 1.3 }, xLabel: '', yLabel: 'I (kg.m²)', caption: 'لأجسام بالكتلة ونصف القطر نفسيهما: كلما توزعت الكتلة بعيداً عن المحور زاد القصور.', draw(G) { const c = G.colors(); K.bars(G, items.map((x, i) => [['سلك', 'قرص', 'كرة', 'قشرة', 'طوق'][i], x[1], [c.c1, c.c3, c.c5, c.c4, c.c2][i]])); } }; },
    explain(a, b, da, db) { const o = []; if (a.x !== b.x) o.push('تغيّر موقع المحور غيّر القصور إلى ' + n(db.I, 3) + ' kg.m²: القصور يعتمد على المحور.'); if (a.shape !== b.shape) o.push(SHAPES[b.shape][0] + ': I = ' + n(db.I, 3) + ' kg.m².'); return o; },
    learn: ['**القصور الدوراني (3-2) و(3-3):** I = Σ m r²، ووحدته kg.m²، وهو مقدار موجب دائماً.', '**جدول (1) ص38:** يعطي القصور لأجسام منتظمة حول محاور مختلفة.', '**نشاط (4-3):** الكتلة ثابتة للجسم، أما القصور الدوراني فيعتمد على محور الدوران.'],
    challenges: [
      { q: 'مثال (2): احسب القصور حول محور في منتصف الساق.', hint: 'x = 2 m.', init: { shape: 'two', x: 0 }, check: (p) => p.shape === 'two' && p.x === 2, why: () => 'I = 20 + 28 = 48 kg.m².' },
      { q: 'مثال (2): احسب القصور حول محور على بعد 0.5 m يسار الكتلة 5 kg.', hint: 'x = −0.5 m.', init: { shape: 'two', x: 2 }, check: (p) => p.shape === 'two' && p.x === -0.5, why: () => 'I = 1.3 + 142 = 143 kg.m².' },
      { q: 'أي الأجسام قصوره أكبر بالكتلة ونصف القطر نفسيهما: الطوق أم القرص (محور عمودي)؟ اعرض الطوق.', hint: 'قارن MR² بـ ½MR².', init: { shape: 'diskPerp' }, check: (p) => p.shape === 'ringPerp', why: () => 'الطوق: كل كتلته على البعد R.' }
    ],
    tutor: [
      { q: 'لماذا يعتمد القصور على المحور؟', k: ['محور', 'يعتمد'], a: () => K.tutor('ماذا يحدث لـ r لكل جزء إذا تغير المحور؟', 'لأن I = Σmr² وبعد كل جزء عن المحور يتغير بتغيير المحور.') },
      { q: 'ما المعنى الفيزيائي للقصور الدوراني؟', k: ['معنى', 'فيزيائي'], a: () => K.tutor('ما الذي يقابله في الحركة الانتقالية؟', 'ممانعة الجسم لتغيير حالته الدورانية، ويقابل الكتلة في الحركة الانتقالية.') },
      { q: 'كيف أحسب القصور لكتلتين؟', k: ['احسب', 'كتلتين'], a: (p, d) => K.tutor('اجمع m r² لكل كتلة.', 'I = ' + n(d.I, 3) + ' kg.m².') }
    ]
  });

  /* ======================= القانون الثاني لنيوتن في الحركة الدورانية والطاقة الحركية الدورانية ص39–43 ======================= */
  K.reg({
    id: 'rotational-dynamics', unit: 3, order: 4, lesson: '3-3', lessonTitle: 'القانون الثاني لنيوتن والطاقة الحركية الدورانية', page: 42,
    titleAr: 'القانون الثاني لنيوتن للدوران: تسارع أسطوانة تحت تأثير قوتين', titleEn: 'Newton\'s Second Law for Rotation', tags: 'تسارع زاوي عزم محصل قصور دوراني طاقة حركية دورانية اسطوانة حجر رحى مثال 5 مثال 6',
    formula: '\\tau_{net} = I\\,\\alpha ,\\quad \\omega = \\omega_1 + \\alpha t ,\\quad K = \\tfrac{1}{2} I \\omega^2',
    book: 'القانونان (3-4) و(3-5). مثال (5) ص42: أسطوانة F₁ = 5 N و F₂ = 7 N، I = 0.2 kg.m²، r = 0.3 m، من السكون لمدة 2 s: τ_net = 3.6 N.m، α = 18 rad/s²، ω = 36 rad/s، K = 0.13 kJ.',
    summary: 'يتناسب التسارع الزاوي طردياً مع محصلة العزوم وعكسياً مع القصور الدوراني حول المحور نفسه. وتزداد السرعة الزاوية بمعدل ثابت تحت عزم ثابت، والطاقة الحركية الدورانية ½Iω².',
    vars: [['F_1, F_2', 'قوتان مماسيتان في الاتجاه نفسه', '\\mathrm{N}', '0 – 20'], ['r', 'نصف قطر الأسطوانة', '\\mathrm{m}', '0.1 – 1'], ['I', 'القصور الدوراني', '\\mathrm{kg\\,m^2}', '0.05 – 2'], ['t', 'زمن التأثير', '\\mathrm{s}', '0 – 10']],
    assumptions: ['تبدأ الأسطوانة من السكون، والقوتان مماسيتان ثابتتان في اتجاه الدوران نفسه، دون احتكاك في المحور.'],
    params: [
      { key: 'F1', label: 'F_1\\ (\\mathrm{N})', min: 0, max: 20, step: 1, value: 5 },
      { key: 'F2', label: 'F_2\\ (\\mathrm{N})', min: 0, max: 20, step: 1, value: 7 },
      { key: 'r', label: 'r\\ (\\mathrm{m})', min: 0.1, max: 1, step: 0.05, value: 0.3 },
      { key: 'I', label: 'I\\ (\\mathrm{kg\\,m^2})', min: 0.05, max: 2, step: 0.05, value: 0.2 },
      { key: 'T', label: 't\\ (\\mathrm{s})', min: 0, max: 10, step: 0.5, value: 2 }
    ],
    play: { mode: 'linear', key: 'T', speed: 2 },
    compute(p) { const tau = (p.F1 + p.F2) * p.r; const al = tau / p.I; const w = al * p.T; return { tau: tau, al: al, w: w, th: 0.5 * al * p.T * p.T, Ke: Q.rotKE(p.I, w) }; },
    live(p, d) { return '\\alpha = \\frac{\\tau_{net}}{I} = \\frac{' + K.n(d.tau, 3) + '}{' + p.I + '} = ' + q(d.al, 'rad/s^2', 4); },
    results(p, d) { return [['محصلة العزوم', q(d.tau, 'N\\,m', 3)], ['التسارع الزاوي α', q(d.al, 'rad/s^2', 4), true, 'pos'], ['السرعة الزاوية بعد ' + p.T + ' s', q(d.w, 'rad/s', 4)], ['الإزاحة الزاوية θ', q(d.th, 'rad', 4)], ['الطاقة الحركية الدورانية', q(d.Ke, 'J', 4)]]; },
    steps(p, d) { return ['τ_net = (F₁ + F₂) r = (' + p.F1 + ' + ' + p.F2 + ') × ' + p.r + ' = ' + n(d.tau) + ' N.m.', 'α = τ_net / I = ' + n(d.al) + ' rad/s².', 'ω = α t = ' + n(d.w) + ' rad/s.', 'K = ½ I ω² = ' + n(d.Ke) + ' J.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.52, R = Math.min(W, H) * 0.28; const ang = d.th;
      ctx.fillStyle = 'rgba(37,99,235,.18)'; ctx.strokeStyle = cols.c1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = cols.c1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy - Math.sin(ang) * R); ctx.stroke();
      K.vec(ctx, cx, cy - R, -Math.min(120, p.F1 * 8), 0, cols.c2, 'F₁', cols); K.vec(ctx, cx, cy + R, Math.min(120, p.F2 * 8), 0, cols.c4, 'F₂', cols);
      D.txt(ctx, 'ω = ' + n(d.w, 2) + ' rad/s', W / 2, H * 0.08, { color: cols.text, size: 16, w: '700' });
    },
    graph(p, d) { const tm = 10; return { view: { xmin: 0, xmax: tm, ymin: 0, ymax: Math.max(1, d.al * tm) * 1.05 }, xLabel: 't (s)', yLabel: 'ω (rad/s)', caption: 'السرعة الزاوية تزداد خطياً تحت عزم ثابت؛ الميل = α.', draw(G) { const c = G.colors(); G.fn((t) => d.al * t, { color: c.c1, width: 3, domain: [0, tm] }); G.point(p.T, d.w, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.I !== b.I) o.push('زيادة القصور تقلل التسارع الزاوي للعزم نفسه (α = τ/I).'); if (a.F1 !== b.F1 || a.F2 !== b.F2 || a.r !== b.r) o.push('محصلة العزوم الآن ' + n(db.tau) + ' N.m.'); return o; },
    learn: ['**(3-4):** τ_net = I α، نظير F = m a في الحركة الانتقالية.', '**(3-5):** K = ½ I ω².', '**مثال (6) ص43:** حجر رحى I = 1.6×10⁻³ kg.m² يصل إلى 1200 دورة/دقيقة خلال 15 s: ω₂ = 40π rad/s، α = 8.38 rad/s²، τ = 0.0134 N.m.'],
    challenges: [
      { q: 'مثال (5): أعد قيم الكتاب وأوجد السرعة الزاوية بعد 2 s.', hint: 'F₁ = 5، F₂ = 7، r = 0.3، I = 0.2، t = 2.', init: { F1: 2, F2: 2, r: 0.5, I: 1, T: 5 }, check: (p) => p.F1 === 5 && p.F2 === 7 && Math.abs(p.r - 0.3) < 1e-9 && Math.abs(p.I - 0.2) < 1e-9 && p.T === 2, why: () => 'ω = 36 rad/s، K ≈ 130 J.' },
      { q: 'ضاعف القصور الدوراني مع بقاء العزم: ماذا يحدث للتسارع الزاوي؟ اجعل α = 9 rad/s².', hint: 'من قيم المثال اجعل I = 0.4.', init: { F1: 5, F2: 7, r: 0.3, I: 0.2, T: 2 }, check: (p, d) => Math.abs(d.al - 9) < 1e-6, why: () => 'α يقل إلى النصف.' }
    ],
    tutor: [
      { q: 'ما العلاقة بين العزم والتسارع الزاوي؟', k: ['علاقه', 'تسارع'], a: (p, d) => K.tutor('ما نظير قانون نيوتن الثاني في الدوران؟', 'τ = I α ⇒ α = ' + n(d.al) + ' rad/s².') },
      { q: 'كيف أحسب الطاقة الحركية الدورانية؟', k: ['طاقه', 'دورانيه'], a: (p, d) => K.tutor('ما نظير ½mv² في الدوران؟', 'K = ½ I ω² = ' + n(d.Ke) + ' J.') },
      { q: 'لماذا تدور الأسطوانة الأثقل ببطء أكبر؟', k: ['اثقل', 'ببطء'], a: () => K.tutor('ماذا يحدث لـ α إذا زاد I؟', 'قصورها الدوراني أكبر فيقل التسارع الزاوي.') }
    ]
  });

  /* ======================= 4-3 حفظ الزخم الزاوي ص43–46 ======================= */
  K.reg({
    id: 'angular-momentum', unit: 3, order: 5, lesson: '4-3', lessonTitle: 'الزخم الزاوي وحفظه', page: 46,
    titleAr: 'حفظ الزخم الزاوي: المتزلجة تضم ذراعيها', titleEn: 'Conservation of Angular Momentum', tags: 'زخم زاوي حفظ متزلجة ذراعين قصور دوراني سرعة زاوية جسم بخيط ثقب الارض مثال 7 مثال 8 مثال 9',
    formula: 'L = I \\omega ,\\qquad I_1 \\omega_1 = I_2 \\omega_2',
    book: 'القوانين (3-10) و(3-11) و(3-12). مثال (9) ص46: متزلجة 1.9 دورة/ث، I₁ = 1.33 kg.m²، تضم ذراعيها فيصبح I₂ = 0.48 kg.m²: ω₁ = 12 rad/s و ω₂ ≅ 33 rad/s. مثال (8) ص45: v₂ = 4 m/s.',
    summary: 'إذا كانت محصلة العزوم الخارجية صفراً وكان محور الدوران ثابتاً، يبقى الزخم الزاوي L = Iω ثابتاً. فإذا قلّ القصور الدوراني (ضمّ الذراعين) زادت السرعة الزاوية.',
    vars: [['I_1', 'القصور الدوراني الابتدائي', '\\mathrm{kg\\,m^2}', '0.2 – 3'], ['f_1', 'عدد الدورات في الثانية ابتداءً', '\\mathrm{rev/s}', '0.5 – 3'], ['I_2', 'القصور الدوراني النهائي', '\\mathrm{kg\\,m^2}', '0.2 – 3'], ['\\omega_2', 'السرعة الزاوية النهائية', '\\mathrm{rad/s}', '—']],
    assumptions: ['إهمال احتكاك الزلاجات بالجليد ومقاومة الهواء (لا عزم خارجي).'],
    params: [
      { key: 'I1', label: 'I_1\\ (\\mathrm{kg\\,m^2})', min: 0.2, max: 3, step: 0.01, value: 1.33 },
      { key: 'f1', label: 'f_1\\ (\\mathrm{rev/s})', min: 0.5, max: 3, step: 0.1, value: 1.9 },
      { key: 'I2', label: 'I_2\\ (\\mathrm{kg\\,m^2})', min: 0.2, max: 3, step: 0.01, value: 0.48 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { const w1 = 2 * Math.PI * p.f1; const w2 = p.I1 * w1 / p.I2; return { w1: w1, w2: w2, L: p.I1 * w1, K1: Q.rotKE(p.I1, w1), K2: Q.rotKE(p.I2, w2) }; },
    live(p, d) { return '\\omega_2 = \\frac{I_1 \\omega_1}{I_2} = \\frac{' + p.I1 + ' \\times ' + K.n(d.w1, 3) + '}{' + p.I2 + '} = ' + q(d.w2, 'rad/s', 3); },
    results(p, d) { return [['ω₁ = 2πf₁', q(d.w1, 'rad/s', 3)], ['ω₂', q(d.w2, 'rad/s', 3), true, 'pos'], ['الزخم الزاوي L', q(d.L, 'kg\\,m^2/s', 3)], ['الطاقة الحركية الدورانية قبل/بعد', K.n(d.K1, 1) + ' \\to ' + K.n(d.K2, 1) + '\\ \\mathrm{J}']]; },
    steps(p, d) { return ['ω₁ = 2π × ' + p.f1 + ' = ' + n(d.w1) + ' rad/s.', 'حفظ الزخم الزاوي: I₁ω₁ = I₂ω₂.', 'ω₂ = ' + p.I1 + ' × ' + n(d.w1) + ' ÷ ' + p.I2 + ' = ' + n(d.w2) + ' rad/s.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const cx = W / 2, cy = H * 0.55; const arm = 30 + 90 * Math.min(1, (p.I2 - 0.2) / 2.8); const a = st.t * d.w2 * 0.15;
      ctx.fillStyle = cols.c5; ctx.beginPath(); ctx.arc(cx, cy - 70, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - 12, cy - 54, 24, 70);
      ctx.strokeStyle = cols.c5; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * arm, cy - 40 + Math.sin(a) * 8); ctx.lineTo(cx + Math.cos(a) * arm, cy - 40 - Math.sin(a) * 8); ctx.stroke();
      ctx.strokeStyle = cols.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy + 30, 60, 14, 0, 0, Math.PI * 2); ctx.stroke();
      D.txt(ctx, 'ω₂ = ' + n(d.w2, 1) + ' rad/s (' + n(d.w2 / (2 * Math.PI), 2) + ' دورة/ث)', W / 2, H * 0.08, { color: cols.text, size: 15, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0.2, xmax: 3, ymin: 0, ymax: d.L / 0.2 * 1.05 }, xLabel: 'I₂ (kg.m²)', yLabel: 'ω₂ (rad/s)', caption: 'ω₂ تتناسب عكسياً مع I₂ لأن L ثابت.', draw(G) { const c = G.colors(); G.fn((x) => d.L / x, { color: c.c1, width: 3, domain: [0.2, 3] }); G.point(p.I2, d.w2, { color: c.c2 }); } }; },
    explain(a, b, da, db) { return a.I2 !== b.I2 ? [b.I2 < a.I2 ? 'ضمّت المتزلجة ذراعيها فقلّ القصور وزادت السرعة الزاوية إلى ' + n(db.w2, 1) + ' rad/s.' : 'مدّت ذراعيها فزاد القصور وقلّت السرعة الزاوية.'] : []; },
    learn: ['**الزخم الزاوي (3-10):** L = Iω، كمية متجهة.', '**(3-11):** τ_net = ΔL/Δt.', '**الحفظ (3-12):** I₁ω₁ = I₂ω₂ بشرطين: محصلة العزوم الخارجية صفر، وثبات محور الدوران.', '**مثال (7):** لو انكمشت الأرض إلى نصف قطرها لأصبح طول اليوم 6 ساعات.'],
    challenges: [
      { q: 'مثال (9): أعد قيم المتزلجة وأوجد ω₂.', hint: 'f₁ = 1.9، I₁ = 1.33، I₂ = 0.48.', init: { I1: 2, f1: 1, I2: 1 }, check: (p) => Math.abs(p.I1 - 1.33) < 1e-9 && Math.abs(p.f1 - 1.9) < 1e-9 && Math.abs(p.I2 - 0.48) < 1e-9, why: () => 'ω₁ = 12 rad/s و ω₂ ≅ 33 rad/s.' },
      { q: 'اجعل السرعة الزاوية تتضاعف بعد ضمّ الذراعين.', hint: 'I₂ = I₁/2.', init: { I1: 1.2, f1: 1, I2: 1 }, check: (p, d) => Math.abs(d.w2 / d.w1 - 2) < 0.01, why: () => 'نصف القصور ⇒ ضعف السرعة الزاوية.' }
    ],
    tutor: [
      { q: 'لماذا تدور المتزلجة أسرع عند ضمّ ذراعيها؟', k: ['اسرع', 'ذراعيها', 'متزلجه'], a: () => K.tutor('ما الذي يبقى ثابتاً؟ وماذا يحدث لـ I؟', 'الزخم الزاوي محفوظ، وضمّ الذراعين يقلل I فتزداد ω.') },
      { q: 'هل الطاقة الحركية الدورانية محفوظة؟', k: ['طاقه', 'محفوظه'], a: (p, d) => K.tutor('قارن ½I₁ω₁² بـ ½I₂ω₂².', 'لا؛ تزداد من ' + n(d.K1, 1) + ' إلى ' + n(d.K2, 1) + ' J بسبب الشغل الذي تبذله المتزلجة بعضلاتها.') },
      { q: 'ما شروط حفظ الزخم الزاوي؟', k: ['شروط', 'حفظ'], a: () => K.tutor('ما الذي يغيّر الزخم الزاوي؟', 'محصلة العزوم الخارجية صفر، وثبات محور الدوران.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
