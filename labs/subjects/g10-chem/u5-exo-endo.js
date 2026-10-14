/* الكيمياء — الوحدة الخامسة (5-1) تغيرات الطاقة في التفاعلات الكيميائية: نشاط (2) ص102–103
 * أ) حمض الهيدروكلوريك مع الخارصين (طارد)  ب) هيدروكسيد الباريوم المائي مع كلوريد الأمونيوم (ماص)
 */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const K = ML.chemLab;
  const S = 'g10-chem', U = 5;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const B0 = K.BENCH;
  const OBJECTS = [
    { id: 'beakerA', kind: 'beaker', opts: { r: 0.026, h: 0.07, title: 'كأس زجاجي سعة 100 مل', name: 'beaker' } },
    { id: 'bath', kind: 'beaker', opts: { r: 0.048, h: 0.12, title: 'كأس سعة 500 مل (حمام مائي)', name: 'beaker' } },
    { id: 'inner', kind: 'beaker', opts: { r: 0.026, h: 0.07, title: 'كأس هيدروكسيد الباريوم', name: 'beaker' } },
    { id: 'thermo', kind: 'thermo' }, { id: 'balance', kind: 'balance' }, { id: 'cylinder', kind: 'cylinder' }, { id: 'rod', kind: 'rod' },
    { id: 'bottleHCl', kind: 'bottle', opts: { text: 'HCl', sub: 'حمض مخفّف', band: '#b45309', glass: 0x94a3b8, title: 'محلول حمض الهيدروكلوريك المخفّف', name: 'bottle' } },
    { id: 'jarZn', kind: 'jar', opts: { text: 'Zn', sub: 'مسحوق خارصين', band: '#475569', cap: 0x475569, title: 'مسحوق الخارصين', name: 'jar' } },
    { id: 'jarBa', kind: 'jar', opts: { text: 'Ba(OH)₂·8H₂O', sub: 'هيدروكسيد الباريوم', band: '#7c2d12', cap: 0x7c2d12, title: 'هيدروكسيد الباريوم الصلب المائي', name: 'jar' } },
    { id: 'jarN', kind: 'jar', opts: { text: 'NH₄Cl', sub: 'كلوريد الأمونيوم', band: '#0f766e', cap: 0x0f766e, title: 'كلوريد الأمونيوم الصلب', name: 'jar' } }
  ].concat(K.commonObjects());

  const tint = (T, base) => { const f = Math.max(-1, Math.min(1, (T - 22) / 12)); const a = [(base >> 16) & 255, (base >> 8) & 255, base & 255]; const b = f > 0 ? [0xfb, 0x92, 0x3c] : [0xe0, 0xf2, 0xfe]; return a.map((v, i) => Math.round(v + (b[i] - v) * Math.abs(f) * 0.6)).reduce((h, v) => h * 256 + v, 0); };
  function labState(st, p) {
    const W = st.hood ? [1.82, B0, -0.02] : [-0.05, B0, 0.05];
    const A = st.part === 'A'; const reacting = st.added && st.xi < C.exoXiMax(st, p) * 0.97;
    const out = Object.assign(K.commonState(st), {
      beakerA: { pos: W, visible: A, level: st.liquid / 123, color: tint(st.T, 0xdbeafe), solid: A && st.added && st.xi < C.exoXiMax(st, p) * 0.99, solidColor: 0x9ca3af, bubbles: A && reacting },
      bath: { pos: W, visible: !A, level: st.bath / 720, color: tint(st.T, 0x7dd3fc) },
      inner: { pos: [W[0], W[1] + 0.004, W[2]], visible: !A, level: 0, solid: st.solid1 > 0, solidColor: st.added ? 0xe2e8f0 : 0xf8fafc },
      thermo: st.thermo === 'in' ? (A ? { pos: [W[0] + 0.012, W[1] + 0.003, W[2] - 0.006], rotZ: -0.2, T: C.exoReading(st) } : { pos: [W[0] + 0.036, W[1] + 0.004, W[2] + 0.01], rotZ: -0.12, T: C.exoReading(st) }) : { pos: [-0.2, B0 + 0.006, -0.28], rotZ: Math.PI / 2, rotY: 0.3, T: st.Troom },
      balance: { pos: [-0.85, B0, 0.12], text: (st.lastW ? K.g2(st.lastW) : '0.00') + ' g' },
      cylinder: { pos: [-0.52, B0, 0.26], level: 0 },
      rod: st.added && p.stir ? { pos: [W[0] - 0.006, W[1] + 0.006, W[2]], rotZ: 0.25, spin: true } : { pos: [-0.06, B0 + 0.003, 0.34], rotZ: Math.PI / 2 },
      bottleHCl: { pos: [-0.66, B0, -0.22], visible: A }, jarZn: { pos: [-0.5, B0, -0.26], visible: A },
      jarBa: { pos: [-0.5, B0, -0.26], visible: !A }, jarN: { pos: [-0.36, B0, -0.26], visible: !A }
    });
    return out;
  }
  function labActions(st, p) {
    const L = C.EXO_STEPS[st.part]; const step = L[C.exoStep(st)];
    return C.exoAvailable(st, p).map((a) => ({ id: a.id, icon: a.icon, label: a.label(st, p), obj: typeof a.obj === 'function' ? a.obj(st) : a.obj, next: p.mode === 'guided' && !!step && step.acts.indexOf(a.id) >= 0 && !(a.id === 'gloves' && st.ppe.gloves) && !((a.id === 'goggles' || a.id === 'coat') && st.ppe[a.id]) && !(a.id === 'hood' && st.hood) }));
  }
  function labStep(st, p) {
    const L = C.EXO_STEPS[st.part]; const i = C.exoStep(st);
    if (p.mode === 'guided') return { mode: K.MODE_AR.guided, n: i, total: L.length, text: i < L.length ? L[i].text : 'اكتمل الجزء (' + (st.part === 'A' ? 'أ' : 'ب') + ')! هل التفاعل طارد أم ماص؟ كيف تستدل على ذلك؟' };
    if (p.mode === 'semi') return { mode: K.MODE_AR.semi, text: '🎯 الهدف: حدّد هل التفاعل طارد أم ماص للطاقة من قراءة ميزان الحرارة.' + (i < L.length ? ' 💡 تلميح: ' + L[i].text : '') };
    return { mode: K.MODE_AR.free, text: 'غيّر الكميات وجرّب الترتيب بنفسك. السلامة مطبّقة دائماً.' };
  }
  function labHud(st) {
    const w = st.added && st.tAdd !== null ? Math.round(st.t - st.tAdd) : 0;
    return [['🌡 ميزان الحرارة', st.thermo === 'in' ? K.f1(C.exoReading(st)) + ' °س' : 'خارج السائل'], ['⏱ منذ الإضافة', w + ' ث'], ['🌬 خزانة الغازات', st.hood ? 'داخلها' : 'خارجها']];
  }

  reg({
    id: 'exo-endo', order: 2, lesson: '5-1', lessonTitle: 'تغيرات الطاقة في التفاعلات الكيميائية', page: 102,
    titleAr: 'تفاعلات طاردة وتفاعلات ماصة للطاقة (مختبر ثلاثي الأبعاد)', titleEn: 'Exothermic and Endothermic Reactions — 3D Lab',
    tags: 'طارد ماص للطاقة خارصين حمض الهيدروكلوريك هيدروكسيد الباريوم كلوريد الأمونيوم حمام مائي نشاط 2 المحتوى الحراري',
    formula: '\\Delta H = H_{\\text{النواتج}} - H_{\\text{المتفاعلات}}',
    book: 'نشاط (2) ص102–103: أ) 20 مل HCl مخفّف + 0.5 غم Zn ثم الانتظار 30 ثانية. ب) حوالي 5 غم {{Ba(OH)₂·8H₂O}} في كأس داخل حمام مائي + حوالي 2.5 غم {{NH₄Cl}} مع التحريك 30 ثانية. ص104: ΔH = H(النواتج) − H(المتفاعلات).',
    summary: 'التفاعل **الطارد** يعطي طاقة فترتفع درجة حرارة الوسط المحيط، والتفاعل **الماص** يستهلك طاقة فتنخفض درجة حرارة الوسط (ص103). في الطارد يكون المحتوى الحراري للنواتج أقل من المتفاعلات (ΔH سالبة)، وفي الماص أكبر (ΔH موجبة) (ص104).',
    vars: [['\\Delta H', 'التغير في المحتوى الحراري = H(النواتج) − H(المتفاعلات)', '\\text{كيلوجول}', 'سالب: طارد • موجب: ماص'], ['T', 'قراءة ميزان الحرارة', '^{\\circ}\\text{س}', 'ترتفع أو تنخفض'], ['m', 'كتلة المادة الصلبة المضافة', '\\text{غم}', 'الكتاب: 0.5 و 5 و 2.5'], ['V', 'حجم المحلول أو ماء الحمام', '\\text{مل}', 'الكتاب: 20 مل للجزء (أ)']],
    assumptions: ['تركيز الحمض «المخفّف» (1 مول/لتر)، وقيمتا ΔH للتفاعلين، وسرعة التفاعل: ' + C.SIMPLE + '؛ الكتاب يطلب الاستدلال من ارتفاع درجة الحرارة أو انخفاضها فقط.', 'معادلة الجزء (ب) لم يكتبها الكتاب، وتُعرض للتوضيح.'],
    canvasHint: 'المستوى الجزيئي: سرعة حركة جزيئات الماء تتبع درجة الحرارة • مخطط المحتوى الحراري (نشاط 3 ص105)',
    params: [
      K.modeParam(),
      { key: 'part', label: '\\text{الجزء}', type: 'select', value: 'A', options: [['A', 'أ) HCl مع Zn'], ['B', 'ب) Ba(OH)₂·8H₂O مع NH₄Cl']] },
      { key: 'VA', label: '\\text{حجم الحمض (مل)}', min: 10, max: 40, step: 5, value: 20, desc: 'الكتاب: 20 مل', hidden: (p) => p.part !== 'A' },
      { key: 'mZn', label: '\\text{كتلة الخارصين (غم)}', min: 0.1, max: 1, step: 0.1, value: 0.5, desc: 'الكتاب: 0.5 غم', hidden: (p) => p.part !== 'A' },
      { key: 'Vb', label: '\\text{ماء الحمام المائي (مل)}', min: 200, max: 450, step: 50, value: 300, desc: 'كأس سعة 500 مل', hidden: (p) => p.part !== 'B' },
      { key: 'mB', label: '\\text{كتلة هيدروكسيد الباريوم (غم)}', min: 1, max: 8, step: 0.5, value: 5, desc: 'الكتاب: حوالي 5 غم', hidden: (p) => p.part !== 'B' },
      { key: 'mN', label: '\\text{كتلة كلوريد الأمونيوم (غم)}', min: 0.5, max: 5, step: 0.5, value: 2.5, desc: 'الكتاب: حوالي 2.5 غم', hidden: (p) => p.part !== 'B' },
      { key: 'stir', label: '\\text{التحريك بالقضيب الزجاجي}', type: 'toggle', value: true, on: 'أحرّك', off: 'بلا تحريك' },
      { key: 'Troom', label: '\\text{درجة حرارة المختبر}', min: 15, max: 30, step: 1, value: 22, desc: 'بالسيلسيوس (°س)' }
    ],
    resetOn: ['mode', 'part', 'Troom'],
    play: { mode: 'time', speed: 2 },
    initState: (p) => C.exoInit(p),
    tick(st, p, d, dt) { C.exoTick(st, p, dt); },
    mount(el, page) {
      return ML.lab3d.mount(el, page, {
        objects: OBJECTS, state: labState, actions: labActions, step: labStep, hud: labHud, ppe: K.ppeChips,
        act(id) {
          const r = K.act(page, (st, p, a) => { const res = C.exoAct(st, p, a); if (a === 'weighB' && st.solid1) st.lastW = st.solid1; if (a === 'add' && st.added) st.lastW = st.part === 'A' ? p.mZn : p.mN; return res; }, id);
          if (page.st.added && !page.playing && page.st.T2 === null) page.startPlay();
          if (page.st.T2 !== null && page.playing) page.stopPlay();
          return r;
        }
      });
    },
    compute(p) { const R = C.EXO[p.part] || C.EXO.A; return { R: R }; },
    results(p, d) {
      const st = d.st || C.exoInit(p); const R = C.EXO[st.part];
      const out = [['التفاعل', R.name, false], ['المعادلة', '{{' + R.eq + '}}', false]];
      out.push(['درجة الحرارة الابتدائية', st.T1 === null ? '—' : K.f1(st.T1) + ' °س', false]);
      out.push(['درجة الحرارة النهائية', st.T2 === null ? '—' : K.f1(st.T2) + ' °س' + (st.wait !== undefined ? ' (بعد ' + st.wait + ' ث)' : ''), false]);
      if (st.T1 !== null && st.T2 !== null) {
        const dT = Math.round((st.T2 - st.T1) * 10) / 10; const m = st.part === 'A' ? st.liquid : st.bath;
        out.push(['التغير في درجة الحرارة', (dT > 0 ? '+' : dT < 0 ? '−' : '') + Math.abs(dT) + ' °س', false, dT > 0 ? 'pos' : 'neg']);
        out.push(['الاستنتاج', dT > 0.2 ? 'ارتفعت درجة الحرارة ← التفاعل **طارد** للطاقة (أنتج طاقة)' : dT < -0.2 ? 'انخفضت درجة الحرارة ← التفاعل **ماص** للطاقة (استهلك طاقة)' : 'التغير صغير جداً — زد كمية المادة أو انتظر', false, dT > 0.2 ? 'pos' : dT < -0.2 ? 'neg' : '']);
        out.push(['الحرارة التي ' + (dT >= 0 ? 'اكتسبها' : 'فقدها') + ' الماء (q = c m ΔT)', '4.18 × ' + m + ' × ' + Math.abs(dT) + ' ≈ ' + Math.round(4.18 * m * Math.abs(dT)) + ' جول', false]);
      } else out.push(['الاستنتاج', 'سجّل درجتي الحرارة قبل الإضافة وبعدها', false]);
      if (st.part === 'A') { const nZn = p.mZn / C.MASS.Zn, nH = st.liquid / 1000; out.push(['المادة المحدِّدة (' + C.SIMPLE + ')', st.liquid ? (nZn < nH / 2 ? 'الخارصين (' + nZn.toFixed(4) + ' مول)' : 'الحمض (' + nH.toFixed(4) + ' مول HCl)') : '—', false]); }
      else { const nB = (st.solid1 || p.mB) / C.EXO.B.M, nN = p.mN / C.M_NH4Cl; out.push(['المادة المحدِّدة (' + C.SIMPLE + ')', nB < nN / 2 ? 'هيدروكسيد الباريوم (' + nB.toFixed(4) + ' مول)' : 'كلوريد الأمونيوم (' + nN.toFixed(4) + ' مول)', false]); }
      if (st.alerts.length) out.push(['تنبيهات السلامة', String(st.alerts.length), false, 'neg']);
      return out;
    },
    steps(p, d) {
      const st = d.st || C.exoInit(p); const L = C.EXO_STEPS[st.part]; const i = C.exoStep(st);
      return L.map((s, k) => (k < i || s.done(st) ? '✅ ' : k === i ? '👉 ' : '⬜ ') + s.text).concat(['اكتب دلالات حدوث التفاعل، وهل التفاعل استهلك طاقة أم أنتجها؟ كيف تستدل على ذلك؟ (ص103)']);
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || C.exoInit(p); const R = C.EXO[st.part]; const narrow = W < 560; d.hits = [];
      // (1) المستوى الجزيئي: جزيئات الماء تتحرك أسرع كلما ارتفعت درجة الحرارة
      const h1 = H * 0.5;
      D.txt(ctx, 'المستوى الجزيئي: حركة جزيئات الماء في ' + (st.part === 'A' ? 'المحلول' : 'الحمام المائي'), W / 2, 18, { color: cols.text, size: narrow ? 12.5 : 14.5, w: '700' });
      const Tn = st.thermo === 'in' ? st.T : st.Troom; const speed = Math.sqrt((Tn + 273) / 295);
      D.rr(ctx, 14, 34, W - 28, h1 - 44, 12); ctx.fillStyle = Tn > st.Troom + 0.3 ? 'rgba(251,146,60,.12)' : Tn < st.Troom - 0.3 ? 'rgba(56,189,248,.16)' : 'rgba(148,163,184,.10)'; ctx.fill();
      const n = narrow ? 9 : 14; const mol = C.molecule('H2O');
      for (let i = 0; i < n; i++) {
        const ph = st.t * speed * 0.9 + i * 1.7;
        const x = 30 + ((i * 97.3 + Math.sin(ph) * 40 * speed) % (W - 70) + (W - 70)) % (W - 70) + 10;
        const y = 50 + ((i * 53.1 + Math.cos(ph * 1.3) * 22 * speed) % (h1 - 80) + (h1 - 80)) % (h1 - 80) + 6;
        C.drawBallStick(ctx, { atoms: mol.atoms, bonds: mol.bonds.map((b) => ({ i: b[0], j: b[1], o: b[2], a: 1, kind: 'old' })) }, { yaw: ph, pitch: 0.3 * Math.sin(ph), cx: x, cy: y, s: narrow ? 10 : 13, fov: 30, colors: { bond: '#94a3b8' } });
      }
      D.txt(ctx, 'درجة الحرارة ' + K.f1(Tn) + ' °س — ' + (Tn > st.Troom + 0.3 ? 'الجزيئات أسرع (اكتسبت طاقة)' : Tn < st.Troom - 0.3 ? 'الجزيئات أبطأ (فقدت طاقة)' : 'سرعة عادية'), W / 2, h1 - 2, { color: cols.muted, size: 12, w: '600' });
      // (2) المعادلة الرمزية
      ctx.save(); ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = cols.text; let fs = narrow ? 13 : 16; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; while (fs > 8 && ctx.measureText(R.eq).width > W - 16) { fs -= 0.5; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; } ctx.fillText(R.eq, W / 2, h1 + 22); ctx.restore();
      // (3) مخطط المحتوى الحراري (نشاط 3 ص105)
      const top = h1 + 46, bot = H - 22, x0 = W * 0.18, x1 = W * 0.82; const exo = R.dH < 0; const known = st.T2 !== null;
      const yR = exo ? top + 18 : bot - 18, yP = exo ? bot - 18 : top + 18;
      ctx.save(); ctx.strokeStyle = cols.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 - 18, bot); ctx.lineTo(x0 - 18, top - 6); ctx.stroke(); ctx.restore();
      D.txt(ctx, 'H', x0 - 18, top - 14, { color: cols.text, size: 13, w: '700' });
      ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = cols.c1; ctx.beginPath(); ctx.moveTo(x0, yR); ctx.lineTo(x0 + (x1 - x0) * 0.35, yR); ctx.stroke(); ctx.strokeStyle = cols.c3; ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * 0.65, yP); ctx.lineTo(x1, yP); ctx.stroke(); ctx.restore();
      D.txt(ctx, 'المتفاعلات', x0 + (x1 - x0) * 0.175, yR + (exo ? -11 : 13), { color: cols.c1, size: 12, w: '700' });
      D.txt(ctx, 'النواتج', x0 + (x1 - x0) * 0.825, yP + (exo ? 13 : -11), { color: cols.c3, size: 12, w: '700' });
      D.arrow(ctx, W / 2, yR, W / 2, yP, known ? (exo ? cols.c2 : cols.c1) : cols.muted, 2.5);
      D.txt(ctx, known ? (exo ? 'التغير في المحتوى الحراري سالب: طارد' : 'التغير في المحتوى الحراري موجب: ماص') : 'سجّل القراءات لتعرف الاتجاه', W / 2 + (narrow ? 0 : 70), (yR + yP) / 2, { color: known ? cols.text : cols.muted, size: 12.5, w: '700', align: narrow ? 'center' : 'left', halo: cols.bg });
    },
    graph(p, d) {
      const st = d.st || C.exoInit(p); const h = st.hist.length ? st.hist : [[0, C.exoReading(st)]];
      const tmax = Math.max(40, Math.ceil((h[h.length - 1][0] + 5) / 10) * 10); const ys = h.map((q) => q[1]);
      return { view: { xmin: 0, xmax: tmax, ymin: Math.floor(Math.min(st.Troom - 4, ...ys) - 1), ymax: Math.ceil(Math.max(st.Troom + 4, ...ys) + 1) }, xLabel: 't (s)', yLabel: 'T (°C)', caption: 'قراءة ميزان الحرارة مع الزمن: ' + (st.part === 'A' ? 'في الجزء (أ) ترتفع بعد إضافة الخارصين.' : 'في الجزء (ب) تنخفض حرارة ماء الحمام بعد الإضافة والتحريك.'),
        draw(G) { const c = G.colors(); G.hline(st.Troom, { color: c.muted, dash: [6, 4] }); if (st.tAdd !== null) G.vline(st.tAdd, { color: c.c4, dash: [4, 4] }); D.series(G, h, st.part === 'A' ? c.c2 : c.c1, 3); } };
    },
    explain(a, b) {
      const o = [];
      if (a.part !== b.part) o.push(b.part === 'A' ? 'الجزء (أ): تفاعل الخارصين مع حمض الهيدروكلوريك.' : 'الجزء (ب): تفاعل هيدروكسيد الباريوم المائي مع كلوريد الأمونيوم في كأس داخل حمام مائي.');
      if (a.mZn !== b.mZn || a.VA !== b.VA) o.push('كمية المواد المتفاعلة تحدد كمية الطاقة المنطلقة: مادة أكثر ← تغيّر أكبر في درجة الحرارة (حتى تنفد المادة المحدِّدة).');
      if (a.Vb !== b.Vb) o.push('ماء أكثر في الحمام يعني أن الطاقة نفسها توزَّع على كتلة أكبر، فيقل التغير في درجة الحرارة (q = c m ΔT).');
      if (a.stir !== b.stir && b.part === 'B') o.push(b.stir ? 'التحريك يخلط المادتين الصلبتين فيتسارع التفاعل.' : 'بلا تحريك يكون التلامس بين المادتين الصلبتين قليلاً فيبطؤ التفاعل.');
      return o;
    },
    learn: [
      '**التفاعلات الطاردة للطاقة:** تعطي طاقة عند حدوثها، مثل تعادل حمض الهيدروكلوريك مع هيدروكسيد الصوديوم (ص103). **التفاعلات الماصة للطاقة:** تمتص طاقة، مثل تحلل كربونات الكالسيوم (ص104).',
      '**المحتوى الحراري:** ΔH = H(النواتج) − H(المتفاعلات) (ص104). مثال من الكتاب: {{2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)}} المحتوى الحراري للنواتج أقل بـ 368.6 كيلوجول، فـ ΔH = −368.6 كيلوجول.',
      '**قانون حفظ الطاقة:** الطاقة الكلية قبل التفاعل تساوي الطاقة الكلية بعده؛ ما تفقده المواد المتفاعلة يكتسبه الوسط المحيط (الماء) والعكس (ص102).',
      '**السلامة:** النظارات الواقية من أدوات النشاط (ص102). في الجزء (ب) يتصاعد غاز الأمونيا ذو الرائحة النفاذة، فيُنفَّذ في خزانة الغازات. — ' + C.GENERAL
    ],
    challenges: [
      { q: 'نفّذ الجزء (أ) كما في الكتاب واستنتج نوع التفاعل.', hint: 'الوقاية ← 20 مل حمض ← ميزان الحرارة ← سجّل ← أضف 0.5 غم Zn ← انتظر 30 ثانية ← سجّل.', init: { mode: 'guided', part: 'A' }, check: (p, d) => !!d.st && d.st.part === 'A' && d.st.T2 !== null && d.st.T2 > d.st.T1, why: () => 'ارتفعت درجة الحرارة: التفاعل طارد للطاقة، والمحتوى الحراري للنواتج أقل من المتفاعلات.' },
      { q: 'نفّذ الجزء (ب) داخل خزانة الغازات واستنتج نوع التفاعل.', hint: 'لا تنسَ خزانة الغازات والتحريك بالقضيب الزجاجي 30 ثانية قبل القياس.', init: { mode: 'guided', part: 'B' }, check: (p, d) => !!d.st && d.st.part === 'B' && d.st.T2 !== null && d.st.T2 < d.st.T1 && d.st.hood, why: () => 'انخفضت درجة حرارة الحمام: التفاعل ماص للطاقة، أخذ الطاقة من الماء المحيط.' },
      { q: 'في المختبر الحر: اجعل درجة حرارة الحمض ترتفع أكثر من 15 °س.', hint: 'زد كتلة الخارصين وقلّل حجم الحمض، لكن تذكّر المادة المحدِّدة.', init: { mode: 'free', part: 'A', mZn: 0.2, VA: 40 }, check: (p, d) => !!d.st && d.st.part === 'A' && d.st.T2 !== null && d.st.T2 - d.st.T1 > 15, why: () => 'كمية أقل من الماء تكتسب الطاقة نفسها فترتفع حرارتها أكثر، ما دام الحمض يكفي للتفاعل.' }
    ],
    tutor: [
      { q: 'ماذا أفعل الآن؟', k: ['ماذا افعل', 'الخطوه', 'التاليه', 'الان', 'ابدا'], a: (p, d) => { const st = d.st; const L = C.EXO_STEPS[st.part]; const i = C.exoStep(st); return i < L.length ? '👉 ' + L[i].text : 'أكملت الجزء. قارن درجتي الحرارة واستنتج نوع التفاعل.'; } },
      { q: 'هل التفاعل طارد أم ماص؟ كيف أعرف؟', k: ['طارد', 'ماص', 'كيف اعرف', 'استدل', 'نوع التفاعل'], a: (p, d) => { const st = d.st; return C.tutor('ماذا حدث لقراءة ميزان الحرارة بعد إضافة المادة؟ ومن أين جاءت الطاقة أو إلى أين ذهبت؟', st.T2 === null ? 'أكمل القياس أولاً. إذا ارتفعت الحرارة فالتفاعل طارد (أنتج طاقة)، وإذا انخفضت فهو ماص (استهلك طاقة من الماء).' : (st.T2 > st.T1 ? 'ارتفعت الحرارة من ' + st.T1 + ' إلى ' + st.T2 + ' °س: التفاعل طارد، ΔH سالبة.' : 'انخفضت الحرارة من ' + st.T1 + ' إلى ' + st.T2 + ' °س: التفاعل ماص، ΔH موجبة.')); } },
      { q: 'ما دلالات حدوث التفاعل؟', k: ['دلالات', 'علامات', 'فقاعات', 'غاز'], a: (p, d) => C.tutor('ماذا ترى وتشعر وتشم في الكأس؟', d.st.part === 'A' ? 'تصاعد فقاعات غاز الهيدروجين، واختفاء مسحوق الخارصين تدريجياً، وارتفاع درجة الحرارة.' : 'انخفاض درجة الحرارة (قد يتجمد الماء حول الكأس)، وتصاعد رائحة الأمونيا النفاذة.') },
      { q: 'لماذا أعمل داخل خزانة الغازات؟', k: ['خزانه', 'غازات', 'امونيا', 'رائحه', 'سلامه', 'نظارات'], a: () => C.tutor('ما الغاز الذي ينتج في الجزء (ب)؟', 'ينتج غاز الأمونيا NH₃ ذو الرائحة النفاذة المهيّجة للعين والجهاز التنفسي، فتسحبه خزانة الغازات بعيداً عنك. والنظارات الواقية من أدوات النشاط (ص102). — ' + C.GENERAL) }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
