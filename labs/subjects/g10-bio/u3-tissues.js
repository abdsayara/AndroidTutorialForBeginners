/* العلوم الحياتية — الوحدة الثالثة، الفصل الأول: أنسجة جسم الإنسان (ص 58–67) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 6;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;

  /* ======================= 1-1 مستويات التنظيم البيولوجي ======================= */
  const LV_TXT = [
    'الذرة أصغر جزء في تركيب المادة.', 'تتحد الذرات لتكوين جزيئات صغيرة.', 'تتحد الجزيئات لتكوين جزيئات كبيرة مثل DNA و RNA.', 'تتحد الجزيئات لتكوين عضيات متنوعة التراكيب والوظائف.',
    'تتآزر العضيات لتكوين أصغر وحدة حية: الخلية.', 'مجموعة الخلايا المتشابهة في الشكل والوظيفة تتآزر لتعطي النسيج.', 'مجموعة الأنسجة تتعاون لتكوّن العضو.', 'مجموعة الأعضاء تتعاون لتكوّن الجهاز.', 'مجموعة الأجهزة تتآزر لتشكل جسم الكائن الحي، وعلى قمتها الإنسان.'
  ];
  function lvIcon(ctx, k, x, y, r, c) {
    ctx.save();
    if (k === 0) { B.blob(ctx, x, y, r * 0.25, r * 0.25, '#ef4444'); for (let i = 0; i < 2; i++) { ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, r * 0.8, r * 0.3, i * 1.2, 0, 7); ctx.stroke(); } B.blob(ctx, x + r * 0.8, y, 4, 4, '#2563eb'); }
    else if (k === 1) { B.blob(ctx, x, y, r * 0.35, r * 0.35, '#ef4444'); B.blob(ctx, x - r * 0.4, y + r * 0.3, r * 0.22, r * 0.22, '#e5e7eb', '#64748b', 1.5); B.blob(ctx, x + r * 0.4, y + r * 0.3, r * 0.22, r * 0.22, '#e5e7eb', '#64748b', 1.5); }
    else if (k === 2) { ctx.lineWidth = 4; [['#1d4ed8', 1], ['#0f766e', -1]].forEach((q) => { ctx.strokeStyle = q[0]; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(x - r + 2 * r * u, y + q[1] * Math.sin(u * 9) * r * 0.35); } ctx.stroke(); }); }
    else if (k === 3) { B.blob(ctx, x, y, r * 0.8, r * 0.42, '#fb923c', '#c2410c', 3); ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -4; i <= 4; i++) ctx.lineTo(x + i * r * 0.15, y + (i % 2 ? 1 : -1) * r * 0.25); ctx.stroke(); }
    else if (k === 4) { B.blob(ctx, x, y, r * 0.85, r * 0.7, 'rgba(254,226,226,.9)', '#b91c1c', 3); B.blob(ctx, x, y, r * 0.28, r * 0.28, '#c4b5fd', '#6d28d9', 2); }
    else if (k === 5) { for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) { D.rr(ctx, x + i * r * 0.36 - r * 0.17, y + j * r * 0.42 - r * 0.2, r * 0.34, r * 0.4, 4); ctx.fillStyle = 'rgba(254,215,170,.95)'; ctx.fill(); ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 1; ctx.stroke(); B.blob(ctx, x + i * r * 0.36, y + j * r * 0.42, 3, 3, '#7c2d12'); } }
    else if (k === 6) { ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.moveTo(x, y + r * 0.8); ctx.bezierCurveTo(x - r * 1.1, y, x - r * 0.6, y - r * 0.8, x, y - r * 0.35); ctx.bezierCurveTo(x + r * 0.6, y - r * 0.8, x + r * 1.1, y, x, y + r * 0.8); ctx.fill(); }
    else if (k === 7) { ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - r * 0.8); ctx.lineTo(x, y + r * 0.8); for (let i = 0; i < 4; i++) { ctx.moveTo(x, y - r * 0.5 + i * r * 0.35); ctx.lineTo(x + (i % 2 ? 1 : -1) * r * 0.8, y - r * 0.3 + i * r * 0.35); } ctx.stroke(); ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(x, y - r * 0.15, r * 0.2, 0, 7); ctx.fill(); }
    else { ctx.strokeStyle = c.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - r * 0.6, r * 0.2, 0, 7); ctx.moveTo(x, y - r * 0.4); ctx.lineTo(x, y + r * 0.3); ctx.moveTo(x - r * 0.4, y - r * 0.1); ctx.lineTo(x + r * 0.4, y - r * 0.1); ctx.moveTo(x, y + r * 0.3); ctx.lineTo(x - r * 0.3, y + r * 0.85); ctx.moveTo(x, y + r * 0.3); ctx.lineTo(x + r * 0.3, y + r * 0.85); ctx.stroke(); }
    ctx.restore();
  }
  reg({
    id: 'levels-zoom', order: 1, lesson: '1-1', lessonTitle: 'مستويات التنظيم البيولوجي', page: 58,
    titleAr: 'مستويات التنظيم البيولوجي: من الذرة إلى الكائن الحي', titleEn: 'Levels of Biological Organization', tags: 'مستويات التنظيم ذره جزيء عضيه خليه نسيج عضو جهاز كائن حي',
    formula: '\\text{ذرات} \\to \\text{جزيئات} \\to \\text{عضيات} \\to \\text{خلية} \\to \\text{نسيج} \\to \\text{عضو} \\to \\text{جهاز} \\to \\text{كائن حي}',
    book: 'الشكل (1) ص 58: مستويات التنظيم البيولوجي: ذرات، جزيئات صغيرة، جزيئات كبيرة، عضيات، خلايا، نسيج، عضو، جهاز، كائن حي.',
    summary: 'يبدأ التنظيم البيولوجي بالذرات وينتهي بالكائن الحي المعقد. انتقل بين المستويات لترى كيف يتكون كل مستوى من المستوى الذي قبله.',
    vars: [['\\text{المستوى}', 'مستوى التنظيم البيولوجي', '—', '9 مستويات (الشكل 1)']],
    assumptions: ['الأيقونات تخطيطية (نموذج مبسّط لأغراض التعليم).'],
    params: [{ key: 'lv', label: '\\text{المستوى}', type: 'stage', stages: B.LEVELS, value: 4 }],
    play: { mode: 'stage', key: 'lv', interval: 1.6 },
    canvasHint: 'اضغط على أي مستوى في السلم لاختياره.',
    compute() { return {}; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const n = B.LEVELS.length;
      // سلم صاعد
      const sw = (W - 20) / n, base = H * (nar ? 0.62 : 0.72);
      for (let k = 0; k < n; k++) {
        const x = W - 10 - (k + 1) * sw, h = 30 + k * (base - 70) / n, y = base - h;
        D.rr(ctx, x + 2, y, sw - 4, h, 6); ctx.fillStyle = k === p.lv ? '#7c3aed' : k < p.lv ? 'rgba(124,58,237,.35)' : 'rgba(148,163,184,.25)'; ctx.fill();
        lvIcon(ctx, k, x + sw / 2, y - Math.min(sw, 60) * 0.5, Math.min(sw * 0.4, 26), c);
        D.txt(ctx, B.LEVELS[k], x + sw / 2, base + 14, { color: k === p.lv ? '#7c3aed' : c.text, size: nar ? 9 : 12, w: k === p.lv ? '800' : '600' });
        d.hits.push({ id: k, x: x, y: y - 60, w: sw, h: h + 80 });
      }
      B.para(ctx, D, (p.lv + 1) + '. ' + B.LEVELS[p.lv] + ': ' + LV_TXT[p.lv], W / 2, base + 46, W - 30, { color: c.text, size: nar ? 12 : 15, w: '700' });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (h) api.set('lv', h.id); return false; },
    live(p) { return '\\text{' + B.LEVELS[p.lv] + '}'; },
    results(p) { return [['المستوى', B.LEVELS[p.lv], false], ['يتكون من', p.lv ? B.LEVELS[p.lv - 1] : '—', false], ['يكوّن', p.lv < 8 ? B.LEVELS[p.lv + 1] : '—', false], ['الوصف', LV_TXT[p.lv], false]]; },
    steps() { return B.LEVELS.map((l, i) => l + (i < 8 ? ' ←' : '')); },
    explain(a, b) { if (a.lv === b.lv) return []; return [LV_TXT[b.lv]]; },
    learn: ['**الشكل (1) ص 58:** ' + B.LEVELS.join(' ← ') + '.', '**النسيج (ص 59):** يتكون من خلايا متشابهة في الشكل والوظيفة؛ وفي جسم الإنسان أربعة أنواع رئيسة: الطلائية، والضامة، والعضلية، والعصبية.'],
    challenges: [
      { q: 'س2 (ص 67): ما أصغر وحدة حية؟ انتقل إليها.', hint: 'تتآزر العضيات لتكوينها.', init: { lv: 0 }, check: (p) => p.lv === 4 },
      { q: 'انتقل إلى المستوى الذي يتكون من **مجموعة أنسجة تتعاون معاً**.', hint: 'العضو.', init: { lv: 8 }, check: (p) => p.lv === 6 }
    ],
    tutor: [{ q: 'ما الفرق بين النسيج والعضو؟', k: ['الفرق', 'نسيج', 'عضو'], a: () => 'النسيج مجموعة خلايا متشابهة في الشكل والوظيفة، أما العضو فمجموعة أنسجة تتعاون معاً (ص 59).' }]
  });

  /* ======================= مجهر الأنسجة ======================= */
  const TISSUES = [
    ['ep0', 'طلائي حرشفي بسيط', 'epi'], ['ep1', 'طلائي حرشفي طبقي', 'epi'], ['ep2', 'طلائي مكعب طبقي', 'epi'], ['ep3', 'طلائي عمادي بسيط', 'epi'], ['ep4', 'طلائي عمادي طبقي كاذب', 'epi'], ['ep5', 'طلائي عمادي طبقي', 'epi'],
    ['ct', 'ضام أصيل (رخو)', 'con'], ['ctd', 'ضام كثيف', 'con'],
    ['sk', 'عضلات هيكلية (مخططة)', 'mus'], ['sm', 'عضلات ملساء', 'mus'], ['ca', 'عضلات قلبية', 'mus'],
    ['ne', 'نسيج عصبي: العصبون', 'ner']
  ];
  const INFO = {
    ep0: ['يبطن الأغشية التي تبطن التجاويف المحيطة بالرئتين والقلب', 'طبقة واحدة من خلايا حرشفية'], ep1: ['يوجد في بشرة جلد الإنسان', 'عدة طبقات'], ep2: ['يوجد في قنوات الغدد العرقية', 'طبقات من خلايا مكعبة'],
    ep3: ['يوجد مبطناً للمعدة', 'خلايا عمودية على الطبقة القاعدية'], ep4: ['يوجد في تجويف الغشاء المخاطي المبطن للقصبة الهوائية', 'يبدو كأنه طبقات وهو طبقة واحدة (لذلك سُمي كاذباً)'], ep5: ['يوجد في الغدد اللعابية', 'عدة طبقات من خلايا عمادية'],
    ct: ['يتواجد في جميع أنحاء الجسم', 'أقل كثافة وقوة من الكثيف؛ فيه ألياف الكولاجين والمرنة والشبكية، وخلايا بلازمية وخلايا صارية (هيبارين وهستامين)'],
    ctd: ['يشكّل الأربطة التي تربط العظام ببعضها، والأوتار التي تربط العضلات بالعظام', 'يحتوي ألياف أكثر بكثير من الضام الرخو'],
    sk: ['ترتبط مع العظام بواسطة الأوتار، وتكوّن معظم عضلات الجسم', 'المحرك الأساسي لجسم الإنسان'], sm: ['تحيط بالأعضاء الجوفاء: جدران القناة الهضمية، والأوعية الدموية، والمثانة', 'خلايا عضلية ملساء مغزلية'], ca: ['توجد فقط في جدر القلب', 'تمتاز بأنها غير قابلة للإنهاك والتعب؛ فيها أقراص بينية'],
    ne: ['يوجد في الأعصاب والحبل الشوكي والدماغ', 'ينقل السيالات العصبية؛ يتكون من العصبونات والخلايا الدبقية']
  };
  const NEURON = { dend: 'الزوائد الشجرية', body: 'جسم الخلية', nuc: 'نواة', cyto: 'السيتوبلازم', axon: 'المحور الأسطواني', term: 'النهايات الطرفية', glia: 'خلايا دبقية' };
  function drawTissue(ctx, id, W, H, c, st, hits) {
    const x0 = 20, x1 = W - 20, y0 = 40, y1 = H - 60; const w = x1 - x0, h = y1 - y0;
    ctx.save(); D.rr(ctx, x0, y0, w, h, 14); ctx.clip(); ctx.fillStyle = 'rgba(252,231,243,.55)'; ctx.fillRect(x0, y0, w, h);
    const memb = (y) => { ctx.fillStyle = 'rgba(190,24,93,.35)'; ctx.fillRect(x0, y, w, 6); D.txt(ctx, 'غشاء قاعدي', x0 + 60, y + 16, { color: '#9d174d', size: 11, w: '700' }); };
    const cellRow = (y, ch, cw, shape, offset) => { for (let x = x0 - (offset || 0); x < x1; x += cw) { ctx.beginPath(); if (shape === 'sq') { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + cw / 2, y - ch, x + cw, y); ctx.closePath(); } else ctx.rect(x, y - ch, cw, ch); ctx.fillStyle = 'rgba(251,207,232,.95)'; ctx.fill(); ctx.strokeStyle = '#be185d'; ctx.lineWidth = 1.5; ctx.stroke(); B.blob(ctx, x + cw / 2, y - ch * (shape === 'sq' ? 0.3 : 0.45), Math.min(cw, ch) * (shape === 'sq' ? 0.18 : 0.22), Math.min(cw, ch) * (shape === 'sq' ? 0.12 : 0.22), '#7e22ce'); } };
    const base = y0 + h * 0.75;
    if (id === 'ep0') { cellRow(base, 26, 90, 'sq'); memb(base); }
    else if (id === 'ep1') { for (let r = 0; r < 5; r++) cellRow(base - r * 30, 30, r > 2 ? 90 : 52, r > 2 ? 'sq' : 'cu', r * 17); memb(base); }
    else if (id === 'ep2') { cellRow(base, 40, 44, 'cu'); cellRow(base - 40, 40, 44, 'cu', 22); memb(base); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x0, base - 120, w, 40); D.txt(ctx, 'تجويف القناة', W / 2, base - 100, { color: c.muted, size: 12 }); }
    else if (id === 'ep3') { cellRow(base, 110, 40, 'cu'); memb(base); }
    else if (id === 'ep4') { for (let x = x0; x < x1; x += 34) { const tall = (Math.round((x - x0) / 34) % 2) === 0; const ch = tall ? 120 : 60; ctx.beginPath(); ctx.rect(x, base - ch, 34, ch); ctx.fillStyle = 'rgba(251,207,232,.95)'; ctx.fill(); ctx.strokeStyle = '#be185d'; ctx.stroke(); B.blob(ctx, x + 17, base - ch * (tall ? 0.7 : 0.4), 8, 8, '#7e22ce'); if (tall) for (let k = 0; k < 4; k++) { ctx.strokeStyle = '#9d174d'; ctx.beginPath(); ctx.moveTo(x + 5 + k * 8, base - ch); ctx.lineTo(x + 3 + k * 8, base - ch - 12); ctx.stroke(); } } memb(base); D.txt(ctx, 'أهداب', x0 + 40, base - 140, { color: '#9d174d', size: 11, w: '700' }); }
    else if (id === 'ep5') { cellRow(base, 46, 44, 'cu'); cellRow(base - 46, 70, 30, 'cu', 12); memb(base); }
    else if (id === 'ct' || id === 'ctd') {
      const dense = id === 'ctd'; ctx.fillStyle = 'rgba(254,249,195,.7)'; ctx.fillRect(x0, y0, w, h);
      const nF = dense ? 26 : 8;
      for (let i = 0; i < nF; i++) { const y = y0 + h * (i + 0.5) / nF; ctx.strokeStyle = '#db2777'; ctx.lineWidth = dense ? 5 : 6; ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * (dense ? 3 : 14)); ctx.stroke(); }
      if (!dense) { for (let i = 0; i < 10; i++) { ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.2; ctx.beginPath(); const x = x0 + w * ((i * 0.37) % 1), y = y0 + h * ((i * 0.61) % 1); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 40, y - 30, x + 80, y + 40, x + 140, y); ctx.stroke(); } for (let i = 0; i < 6; i++) { ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1; ctx.beginPath(); const x = x0 + w * ((i * 0.23 + 0.1) % 1), y = y0 + h * ((i * 0.47 + 0.2) % 1); for (let k = 0; k < 6; k++) ctx.lineTo(x + k * 18, y + (k % 2 ? 12 : -12)); ctx.stroke(); }
        [[0.3, 0.3, 'خلية صارية'], [0.6, 0.6, 'خلية بلازمية'], [0.8, 0.25, 'خلية']].forEach((q) => { B.blob(ctx, x0 + w * q[0], y0 + h * q[1], 16, 12, q[2] === 'خلية صارية' ? '#c084fc' : '#93c5fd', '#1e3a8a', 1.5); D.txt(ctx, q[2], x0 + w * q[0], y0 + h * q[1] + 24, { color: c.text, size: 11, w: '700', halo: c.bg }); });
        D.txt(ctx, 'ألياف الكولاجين (وردي) • ألياف مرنة (أسود) • ألياف شبكية (بنفسجي)', W / 2, y0 + 16, { color: c.text, size: 12, w: '700', halo: c.bg }); }
      else D.txt(ctx, 'ألياف كثيفة متوازية (أوتار وأربطة)', W / 2, y0 + 16, { color: c.text, size: 12, w: '700', halo: c.bg });
    } else if (id === 'sk') { for (let r = 0; r < 4; r++) { const y = y0 + 20 + r * (h - 40) / 4; D.rr(ctx, x0 + 10, y, w - 20, (h - 40) / 4 - 10, 18); ctx.fillStyle = 'rgba(248,113,113,.6)'; ctx.fill(); for (let x = x0 + 20; x < x1 - 20; x += 9) { ctx.strokeStyle = 'rgba(127,29,29,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + (h - 40) / 4 - 14); ctx.stroke(); } for (let k = 0; k < 4; k++) B.blob(ctx, x0 + 80 + k * (w - 160) / 3, y + 6, 9, 4, '#4c1d95'); } D.txt(ctx, 'ألياف مخططة متعددة الأنوية', W / 2, y0 + 12, { color: c.text, size: 12, w: '700', halo: c.bg }); }
    else if (id === 'sm') { for (let r = 0; r < 6; r++) for (let k = 0; k < 6; k++) { const x = x0 + 40 + k * (w - 80) / 5 + (r % 2) * 40, y = y0 + 30 + r * (h - 60) / 5; ctx.beginPath(); ctx.ellipse(x, y, 60, 11, 0, 0, 7); ctx.fillStyle = 'rgba(252,165,165,.75)'; ctx.fill(); ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 1; ctx.stroke(); B.blob(ctx, x, y, 10, 4, '#4c1d95'); } D.txt(ctx, 'خلايا عضلية ملساء مغزلية، نواة واحدة', W / 2, y0 + 12, { color: c.text, size: 12, w: '700', halo: c.bg }); }
    else if (id === 'ca') { for (let r = 0; r < 4; r++) { const y = y0 + 30 + r * (h - 60) / 4; ctx.strokeStyle = 'rgba(220,38,38,.7)'; ctx.lineWidth = 26; ctx.beginPath(); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.02 + r) * 8); ctx.stroke(); for (let k = 1; k < 5; k++) { const x = x0 + k * w / 5; ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 3, y + 12); ctx.stroke(); B.blob(ctx, x - w / 10, y, 7, 5, '#4c1d95'); } if (r < 3) { ctx.strokeStyle = 'rgba(220,38,38,.7)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0 + w * (0.3 + r * 0.15), y); ctx.lineTo(x0 + w * (0.35 + r * 0.15), y + (h - 60) / 4); ctx.stroke(); } } D.txt(ctx, 'ألياف قلبية متفرعة وأقراص بينية (خطوط سوداء)', W / 2, y0 + 12, { color: c.text, size: 12, w: '700', halo: c.bg }); }
    else if (id === 'ne') {
      const cx = x0 + w * 0.28, cy = y0 + h * 0.5; const sel = st && st.part; const hl = (k, def) => (sel === k ? '#f59e0b' : def);
      ctx.strokeStyle = hl('dend', '#7c3aed'); ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const a = Math.PI * 0.6 + i * 0.25; ctx.beginPath(); ctx.moveTo(cx, cy); const ex = cx + Math.cos(a) * 90, ey = cy + Math.sin(a) * 90 * 0.9; ctx.quadraticCurveTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 60, ex, ey); ctx.lineTo(ex + Math.cos(a + 0.4) * 22, ey + Math.sin(a + 0.4) * 22); ctx.stroke(); }
      hits.push({ id: 'dend', cx: cx - 80, cy: cy, r: 30 });
      B.blob(ctx, cx, cy, 42, 36, hl('cyto', '#c4b5fd'), hl('body', '#6d28d9'), 3); hits.push({ id: 'body', cx: cx + 25, cy: cy - 25, r: 14 }); hits.push({ id: 'cyto', cx: cx - 22, cy: cy + 14, r: 12 });
      B.blob(ctx, cx, cy, 13, 13, hl('nuc', '#4c1d95')); hits.push({ id: 'nuc', cx: cx, cy: cy, r: 13 });
      const ax1 = x1 - 90; ctx.strokeStyle = hl('axon', '#6d28d9'); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + 40, cy); ctx.lineTo(ax1, cy); ctx.stroke(); hits.push({ id: 'axon', x: cx + 60, y: cy - 12, w: ax1 - cx - 80, h: 24 });
      ctx.strokeStyle = hl('term', '#6d28d9'); ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(ax1, cy); ctx.lineTo(ax1 + 50, cy + i * 18); ctx.stroke(); B.blob(ctx, ax1 + 52, cy + i * 18, 5, 5, hl('term', '#6d28d9')); } hits.push({ id: 'term', cx: ax1 + 40, cy: cy, r: 40 });
      [[0.55, 0.2], [0.7, 0.82], [0.15, 0.85]].forEach((q) => { const gx = x0 + w * q[0], gy = y0 + h * q[1]; B.blob(ctx, gx, gy, 14, 10, hl('glia', '#a7f3d0'), '#047857', 1.5); for (let k = 0; k < 5; k++) { ctx.strokeStyle = '#047857'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(k * 1.3) * 26, gy + Math.sin(k * 1.3) * 20); ctx.stroke(); } hits.push({ id: 'glia', cx: gx, cy: gy, r: 20 }); });
      const L = [['dend', cx - 95, cy - 70], ['body', cx + 10, cy - 52], ['nuc', cx, cy + 52], ['axon', (cx + ax1) / 2, cy - 20], ['term', ax1 + 30, cy - 58], ['glia', x0 + w * 0.55, y0 + h * 0.2 - 22]];
      L.forEach((q) => D.txt(ctx, NEURON[q[0]], q[1], q[2], { color: sel === q[0] ? '#d97706' : c.text, size: 12, w: '800', halo: c.bg }));
    }
    ctx.restore();
    ctx.strokeStyle = c.muted; ctx.lineWidth = 2; D.rr(ctx, x0, y0, w, h, 14); ctx.stroke();
  }
  reg({
    id: 'tissue-microscope', order: 2, lesson: '2-1 … 5-1', lessonTitle: 'الأنسجة الطلائية والضامة والعضلية والعصبية', page: 59,
    titleAr: 'مجهر الأنسجة: الطلائية والضامة والعضلية والعصبية', titleEn: 'Tissue Microscope: Epithelial, Connective, Muscle & Nervous', tags: 'نسيج طلائي حرشفي مكعب عمادي كاذب ضام رخو كثيف كولاجين عضلات هيكليه ملساء قلبيه عصبون خلايا دبقيه',
    formula: '\\text{النسيج} = \\text{خلايا متشابهة في الشكل والوظيفة}',
    book: 'جدول (1) ص 61: أنواع الأنسجة الطلائية ومكان وجودها؛ الأنسجة الضامة ص 62–63؛ الأنسجة العضلية ص 63–65؛ النسيج العصبي ص 65–66 (الشكل 9: العصبون).',
    summary: 'اختر النسيج وافحص شريحته: الطلائي خلايا متراصة على غشاء قاعدي، والضام خلايا قليلة في مادة بين خلوية وفيرة فيها ألياف، والعضلي ثلاثة أنواع، والعصبي عصبونات وخلايا دبقية. في النسيج العصبي اضغط على أجزاء العصبون.',
    vars: [['\\text{النسيج}', 'نوع النسيج المعروض', '—', '12 شريحة'], ['\\text{40\\%}', 'نسبة الأنسجة العضلية من كتلة الجسم عند الذكور (ص 63)', '\\%', 'من الكتاب']],
    assumptions: ['الشرائح رسوم تخطيطية (نموذج مبسّط لأغراض التعليم) بحسب أشكال الكتاب وليست صوراً مجهرية حقيقية.'],
    params: [{ key: 't', label: '\\text{النسيج}', type: 'select', options: TISSUES.map((x) => [x[0], x[1]]), value: 'ep0' }],
    initState: () => ({ part: null }), resetOn: ['t'],
    randomize(p) { const o = TISSUES.map((x) => x[0]).filter((x) => x !== p.t); return { t: o[Math.floor(Math.random() * o.length)] }; },
    canvasHint: 'في شريحة النسيج العصبي اضغط على أي جزء من العصبون لمعرفة اسمه.',
    compute(p) { const T = TISSUES.find((x) => x[0] === p.t); return { T: T, info: INFO[p.t] }; },
    drawCustom(ctx, W, H, p, d, c) {
      D.txt(ctx, d.T[1], W / 2, 18, { color: c.c5, size: 16, w: '800' });
      drawTissue(ctx, p.t, W, H, c, d.st, d.hits);
      B.para(ctx, D, 'المكان: ' + d.info[0], W / 2, H - 34, W - 30, { color: c.text, size: narrow(W) ? 11 : 13, w: '700' });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down' || p.t !== 'ne') return false; const h = api.hit(x, y); if (!h) return false; st.part = h.id; api.say(['**' + NEURON[h.id] + '** — جزء من ' + (h.id === 'glia' ? 'النسيج العصبي (خلايا مختلفة الأشكال تُدعى الخلايا الدبقية).' : 'العصبون: الوحدة الأساسية والوظيفية في النسيج العصبي (الشكل 9).')]); return true; },
    live(p, d) { return '\\text{' + d.T[1] + '}'; },
    results(p, d) {
      const fam = { epi: 'الأنسجة الطلائية', con: 'الأنسجة الضامة', mus: 'الأنسجة العضلية', ner: 'الأنسجة العصبية' }[d.T[2]];
      const feat = { epi: 'خلايا متراصة ترتكز على غشاء قاعدي، لا أوعية دموية، مادة بين خلوية قليلة، قدرة عالية على التجدد والانقسام (ص 60)', con: 'خلايا غير متراصة تنتشر في مادة بين خلوية وفيرة (سائلة أو صلبة أو جيلاتينية) فيها شبكة من الخيوط البروتينية (ص 62)', mus: 'تشكل نحو 40% من كتلة الجسم عند الذكور، وهي أعلى نسبة أنسجة في الجسم (ص 63)', ner: 'عصبونات (الوحدات الأساسية والوظيفية) وخلايا دبقية (ص 66)' }[d.T[2]];
      return [['النسيج', d.T[1], false], ['المجموعة', fam, false], ['المكان', d.info[0], false], ['الوصف', d.info[1], false], ['خصائص المجموعة', feat, false]].concat(p.t === 'ne' && d.st && d.st.part ? [['الجزء المختار', NEURON[d.st.part], false]] : []);
    },
    steps(p, d) { return d.T[2] === 'epi' ? ['أهمية الأنسجة الطلائية (ص 60): الحماية (الجلد)، الامتصاص (الأمعاء)، الإفراز (المعدة).', 'تصنف حسب شكل الخلايا وعدد طبقاتها.'] : d.T[2] === 'con' ? ['الضام الأصيل: ألياف الكولاجين (قوة شد ودعم)، والمرنة (إلاستين، مرونة)، والشبكية (تربط الطلائي بالمجاور).', 'نوعاه: الرخو والكثيف.'] : d.T[2] === 'mus' ? ['ثلاثة أنواع: الهيكلية المخططة، الملساء، القلبية.'] : ['العصبون: الزوائد الشجرية، جسم الخلية، النواة، السيتوبلازم، المحور الأسطواني، النهايات الطرفية.']; },
    explain(a, b) { if (a.t === b.t) return []; const T = TISSUES.find((x) => x[0] === b.t); return ['**' + T[1] + ':** ' + INFO[b.t][0] + '. ' + INFO[b.t][1] + '.']; },
    learn: ['**أربعة أنواع رئيسة (ص 59):** الطلائية، الضامة، العضلية، العصبية.', '**جدول (1) الأنسجة الطلائية:** ' + B.EPITHELIA.map((e) => e.name + ' — ' + e.where).join('؛ ') + '.', '**الضامة (ص 62–63):** من أكثر الأنسجة انتشاراً (العظمية، الغضروفية، اللمفية، الدم). الضام الأصيل: رخو وكثيف.', '**العضلية (ص 64–65):** الهيكلية المخططة (ترتبط بالعظام بالأوتار)، الملساء (جدران الأعضاء الجوفاء)، القلبية (جدر القلب فقط، غير قابلة للإنهاك).', '**العصبية (ص 65–66):** العصبونات والخلايا الدبقية، وتنقل السيالات العصبية.'],
    challenges: [
      { q: 'س3 (ص 67): اختر النسيج الطلائي الذي يوجد في الأغشية التي **تبطن التجاويف المحيطة بالقلب والرئتين**.', hint: 'طبقة واحدة من خلايا حرشفية.', init: { t: 'ep5' }, check: (p) => p.t === 'ep0' },
      { q: 'س5 (ص 67): اختر النسيج الموجود في الأغشية المخاطية **المبطنة للقصبة الهوائية**.', hint: 'عمادي طبقي كاذب.', init: { t: 'ep0' }, check: (p) => p.t === 'ep4' },
      { q: 'اختر النسيج الذي **يشكّل الأوتار والأربطة**.', hint: 'نسيج ضام.', init: { t: 'sk' }, check: (p) => p.t === 'ctd' },
      { q: 'في النسيج العصبي اضغط على **المحور الأسطواني**.', hint: 'اختر «نسيج عصبي» ثم اضغط على الخط الطويل.', init: { t: 'ep0' }, check: (p, d) => p.t === 'ne' && d.st && d.st.part === 'axon' }
    ],
    tutor: [
      { q: 'لماذا سُمي الطبقي الكاذب بهذا الاسم؟', k: ['كاذب', 'سمي'], a: () => 'لأن خلاياه تبدو كأنها عدة طبقات بسبب اختلاف أطوالها ومواقع أنويتها، لكنها كلها ترتكز على الغشاء القاعدي.' },
      { q: 'أين يوجد هذا النسيج؟', k: ['اين', 'يوجد', 'مكان'], a: (p, d) => d.T[1] + ': ' + d.info[0] + '.' },
      { q: 'ما الفرق بين العضلات الثلاثة؟', k: ['عضلات', 'الفرق', 'قلبيه', 'ملساء'], a: () => 'الهيكلية: مخططة وترتبط بالعظام. الملساء: تحيط بالأعضاء الجوفاء. القلبية: في جدر القلب فقط، غير قابلة للإنهاك والتعب (ص 64–65).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
