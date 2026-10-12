/* العلوم الحياتية — الوحدة الأولى، الفصل الثاني: الخلايا: التركيب ووظائف الأجزاء (ص 10–18) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 2;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;

  // العضيات ووظائفها بحسب الكتاب (ص 12–17)
  const ORG = {
    membrane: ['الغشاء البلازمي', 'يحيط بالخلية، يتكون من طبقتين وسمكه 5 – 10 نانومتر، ويمتاز بالنفاذية الاختيارية.'],
    cyto: ['السيتوبلازم', 'يتكون من السيتوسول وتنتشر فيه العضيات الغشائية وغير الغشائية.'],
    nucleus: ['النواة', 'يحيط بها غلاف نووي فيه ثقوب نووية، وتحتوي النوية والكروماتين (المادة الوراثية).'],
    nucleolus: ['النوية', 'توجد داخل النواة وتصنع وحدات الرايبوسومات.'],
    pore: ['ثقب نووي', 'فتحة في الغلاف النووي تصل بين النواة والسيتوبلازم.'],
    rer: ['الشبكة الإندوبلازمية الخشنة', 'تلتصق بها الرايبوسومات؛ تنقل البروتينات في حويصلات إلى خارج الخلية عن طريق جهاز غولجي، وتسهم في صنع الأغشية الخلوية.'],
    ser: ['الشبكة الإندوبلازمية الملساء', 'لا توجد عليها رايبوسومات، وتصنع الليبيدات.'],
    golgi: ['جهاز غولجي', 'أكياس غشائية مسطحة (0.5 – 2 ميكرومتر) يكثر في الخلايا الإفرازية؛ يعدّل البروتينات بإضافة الكربوهيدرات، وينتج عديدات التسكر لبناء الجدار الخلوي، ويسهم في تكوين الأجسام الحالة.'],
    lyso: ['الجسم الحال', 'يقوم بالهضم داخل الخلية، وبالتحلل الذاتي للخلايا (مثل ذيل أبي ذنيبة).'],
    mito: ['المايتوكندريا', 'مصنع الطاقة في الخلية (إنتاج ATP)؛ لها غشاء خارجي وغشاء داخلي ينثني مكوّناً أعرافاً، وحشوة فيها إنزيمات و DNA و RNA ورايبوسومات.'],
    vacuole: ['فجوة', 'من أنواع الفجوات: المنقبضة، والعصارية، والغذائية.'],
    cvac: ['الفجوة العصارية المركزية', 'فجوة كبيرة في الخلية النباتية.'],
    vesicle: ['حويصلة', 'كيس غشائي صغير تُنقل فيه المواد، مثل البروتينات من الشبكة الإندوبلازمية إلى جهاز غولجي.'],
    ribo: ['الرايبوسومات', 'عضيات غير غشائية تتكون من وحدتين كبيرة وصغيرة من rRNA وبروتين؛ توجد حرة في السيتوبلازم أو على الشبكة الإندوبلازمية الخشنة.'],
    centriole: ['المريكز (الجسم المركزي)', 'يوجد في الخلايا الحيوانية: مريكزان، كل منهما تسع مجموعات ثلاثية من الأنيبيبات الدقيقة (9+0)، وتتكون منه خيوط المغزل.'],
    tubule: ['أنيبيب دقيق', 'من مكونات الهيكل الخلوي (الخيوط الدقيقة، الأنيبيبات الدقيقة، الخيوط المتوسطة).'],
    perox: ['البيروكسيسوم', 'يحتوي إنزيم الكاتاليز الذي يحلل فوق أكسيد الهيدروجين: 2H₂O₂ ← 2H₂O + O₂.'],
    wall: ['الجدار الخلوي', 'يوجد في الخلايا النباتية وبعض الطلائعيات، ويتكون من السليلوز.'],
    chloro: ['البلاستيدات الخضراء', '20 – 100 في خلية الورقة، قرصية الشكل؛ لها غشاءان، وفيها الثايلاكويدات (الغرانم) والستروما التي تحتوي DNA و RNA ورايبوسومات ونشا.'],
    nucleoid: ['المنطقة النووية', 'توجد فيها المادة الوراثية (DNA حلقي) في السيتوبلازم دون غلاف نووي.'],
    flag: ['سوط', 'زائدة تظهر في الخلية بدائية النوى في الشكل (1).'],
    meso: ['ميسوسومات', 'تظهر في الشكل (1) كانثناءات من الغشاء الخلوي في الخلية بدائية النوى.'],
    cmem: ['الغشاء الخلوي', 'يحيط بسيتوبلازم الخلية بدائية النوى.']
  };
  const TYPES = [['pro', 'خلية بدائية النوى (بكتيريا)'], ['animal', 'خلية حيوانية (حقيقية النوى)'], ['plant', 'خلية نباتية (حقيقية النوى)']];
  // رسم الخلية وتسجيل مناطق النقر (إحداثيات نسبية ثم تحجيم)
  function drawCell(ctx, type, cx, cy, R, c, sel, hits) {
    const H = (id, x, y, r) => hits.push({ id: id, cx: x, cy: y, r: Math.max(r, 12) });
    const hl = (id) => (sel === id ? '#fbbf24' : null);
    ctx.save(); ctx.lineWidth = 2;
    if (type === 'pro') {
      const rx = R, ry = R * 0.48;
      // سوط
      ctx.strokeStyle = hl('flag') || '#7c3aed'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - rx, cy); for (let i = 0; i <= 30; i++) ctx.lineTo(cx - rx - i * R * 0.02, cy + Math.sin(i * 0.6) * R * 0.08); ctx.stroke(); H('flag', cx - rx - R * 0.3, cy, R * 0.1);
      D.rr(ctx, cx - rx, cy - ry, 2 * rx, 2 * ry, ry); ctx.fillStyle = hl('cyto') || 'rgba(147,197,253,.35)'; ctx.fill(); ctx.strokeStyle = hl('cmem') || '#1d4ed8'; ctx.lineWidth = 4; ctx.stroke();
      H('cyto', cx + rx * 0.55, cy + ry * 0.45, R * 0.12);
      hits.push({ id: 'cmem', x: cx - rx * 0.6, y: cy - ry - 6, w: rx * 1.2, h: 12 });
      // المنطقة النووية (DNA حلقي)
      ctx.strokeStyle = hl('nucleoid') || '#dc2626'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let a = 0; a <= 6.3; a += 0.1) { const r = R * 0.22 + Math.sin(a * 7) * R * 0.03; ctx.lineTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 0.7); } ctx.stroke(); H('nucleoid', cx, cy, R * 0.22);
      for (let i = 0; i < 18; i++) B.blob(ctx, cx - rx * 0.75 + (i % 9) * rx * 0.19, cy + (i < 9 ? -1 : 1) * ry * 0.62, 3, 3, hl('ribo') || '#334155'); H('ribo', cx - rx * 0.5, cy - ry * 0.62, R * 0.08);
      ctx.strokeStyle = hl('meso') || '#1d4ed8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + rx * 0.7, cy - ry * 0.95); ctx.quadraticCurveTo(cx + rx * 0.55, cy - ry * 0.3, cx + rx * 0.8, cy - ry * 0.2); ctx.stroke(); H('meso', cx + rx * 0.65, cy - ry * 0.5, R * 0.1);
      ctx.restore(); return;
    }
    const plant = type === 'plant';
    if (plant) { D.rr(ctx, cx - R * 1.05, cy - R * 0.85, R * 2.1, R * 1.7, 14); ctx.fillStyle = hl('wall') || '#86efac'; ctx.fill(); ctx.strokeStyle = '#15803d'; ctx.lineWidth = 3; ctx.stroke(); hits.push({ id: 'wall', x: cx - R * 1.05, y: cy - R * 0.85, w: R * 2.1, h: 10 }); }
    ctx.beginPath(); if (plant) D.rr(ctx, cx - R * 0.97, cy - R * 0.77, R * 1.94, R * 1.54, 10); else ctx.ellipse(cx, cy, R, R * 0.8, 0, 0, 7);
    ctx.fillStyle = hl('cyto') || (plant ? 'rgba(220,252,231,.95)' : 'rgba(254,226,226,.9)'); ctx.fill(); ctx.strokeStyle = hl('membrane') || '#b91c1c'; ctx.lineWidth = 3; ctx.stroke();
    hits.push({ id: 'membrane', x: cx - R * 0.5, y: cy + (plant ? R * 0.77 : R * 0.8) - 7, w: R, h: 14 }); H('cyto', cx - R * 0.7, cy + R * 0.35, R * 0.1);
    if (plant) { D.rr(ctx, cx - R * 0.05, cy - R * 0.55, R * 0.9, R * 1.1, 30); ctx.fillStyle = hl('cvac') || 'rgba(186,230,253,.85)'; ctx.fill(); ctx.strokeStyle = '#0284c7'; ctx.stroke(); H('cvac', cx + R * 0.4, cy, R * 0.35); }
    // النواة
    const nx = plant ? cx - R * 0.5 : cx, ny = plant ? cy - R * 0.25 : cy, nr = R * 0.28;
    B.blob(ctx, nx, ny, nr, nr, hl('nucleus') || 'rgba(196,181,253,.9)', '#6d28d9', 3); H('nucleus', nx + nr * 0.55, ny + nr * 0.5, nr * 0.35);
    B.blob(ctx, nx - nr * 0.2, ny - nr * 0.1, nr * 0.32, nr * 0.32, hl('nucleolus') || '#5b21b6'); H('nucleolus', nx - nr * 0.2, ny - nr * 0.1, nr * 0.3);
    ctx.fillStyle = hl('pore') || '#f8fafc'; ctx.beginPath(); ctx.arc(nx, ny - nr, 4, 0, 7); ctx.fill(); H('pore', nx, ny - nr, 6);
    // الشبكة الإندوبلازمية الخشنة والملساء
    const ex = plant ? cx - R * 0.55 : cx - R * 0.55, ey = plant ? cy + R * 0.35 : cy + R * 0.1;
    ctx.strokeStyle = hl('rer') || '#0e7490'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let i = 0; i <= 20; i++) ctx.lineTo(ex - R * 0.25 + i * R * 0.022, ey + k * 8 + Math.sin(i * 0.8) * 3); ctx.stroke(); for (let i = 0; i < 7; i++) B.blob(ctx, ex - R * 0.22 + i * R * 0.065, ey + k * 8 - 4, 1.8, 1.8, hl('ribo') || '#0f172a'); }
    H('rer', ex - R * 0.03, ey + 8, R * 0.13);
    const sx = plant ? cx - R * 0.15 : cx + R * 0.35, sy = plant ? cy + R * 0.58 : cy + R * 0.45;
    ctx.strokeStyle = hl('ser') || '#0891b2'; for (let k = 0; k < 2; k++) { ctx.beginPath(); for (let i = 0; i <= 16; i++) ctx.lineTo(sx - R * 0.15 + i * R * 0.02, sy + k * 9 + Math.sin(i * 0.5) * 5); ctx.stroke(); } H('ser', sx, sy + 4, R * 0.12);
    // جهاز غولجي
    const gx = plant ? cx - R * 0.65 : cx + R * 0.5, gy = plant ? cy + R * 0.05 : cy - R * 0.3;
    ctx.strokeStyle = hl('golgi') || '#ca8a04'; ctx.lineWidth = 3.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(gx, gy + 30 + k * 6, 26 - k * 2, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); } H('golgi', gx, gy + 6, R * 0.12);
    B.blob(ctx, gx + 24, gy + 4, 4, 4, hl('vesicle') || '#facc15', '#a16207', 1); H('vesicle', gx + 24, gy + 4, 6);
    // المايتوكندريا
    const mitos = plant ? [[cx - R * 0.75, cy - R * 0.55], [cx - R * 0.2, cy + R * 0.25]] : [[cx - R * 0.55, cy - R * 0.4], [cx + R * 0.2, cy + R * 0.55], [cx - R * 0.15, cy - R * 0.6]];
    mitos.forEach((m) => { ctx.save(); ctx.translate(m[0], m[1]); ctx.rotate(0.4); B.blob(ctx, 0, 0, R * 0.13, R * 0.07, hl('mito') || '#fb923c', '#c2410c', 2); ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = -4; i <= 4; i++) ctx.lineTo(i * R * 0.025, (i % 2 ? 1 : -1) * R * 0.045); ctx.stroke(); ctx.restore(); H('mito', m[0], m[1], R * 0.12); });
    if (plant) { [[cx - R * 0.75, cy + R * 0.5], [cx - R * 0.35, cy - R * 0.62], [cx + R * 0.0, cy + R * 0.62], [cx - R * 0.85, cy - R * 0.15]].forEach((m) => { B.blob(ctx, m[0], m[1], R * 0.11, R * 0.065, hl('chloro') || '#22c55e', '#166534', 2); for (let i = -1; i <= 1; i++) { ctx.fillStyle = '#14532d'; ctx.fillRect(m[0] + i * R * 0.05 - 3, m[1] - 5, 6, 10); } H('chloro', m[0], m[1], R * 0.11); }); }
    else {
      B.blob(ctx, cx + R * 0.65, cy + R * 0.15, R * 0.07, R * 0.07, hl('lyso') || '#a855f7', '#6b21a8', 1.5); H('lyso', cx + R * 0.65, cy + R * 0.15, R * 0.08);
      B.blob(ctx, cx - R * 0.8, cy + R * 0.05, R * 0.09, R * 0.09, hl('vacuole') || 'rgba(186,230,253,.9)', '#0284c7', 1.5); H('vacuole', cx - R * 0.8, cy + R * 0.05, R * 0.09);
      B.blob(ctx, cx + R * 0.5, cy + R * 0.38, R * 0.05, R * 0.05, hl('perox') || '#4ade80', '#15803d', 1.5); H('perox', cx + R * 0.5, cy + R * 0.38, R * 0.06);
      // المريكزان
      const qx = cx + R * 0.28, qy = cy - R * 0.08; ctx.fillStyle = hl('centriole') || '#1e293b'; ctx.fillRect(qx - 9, qy - 3, 18, 6); ctx.fillRect(qx + 12, qy - 9, 6, 18); H('centriole', qx + 5, qy, 12);
      ctx.strokeStyle = hl('tubule') || '#64748b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(qx + 20, qy + 5); ctx.lineTo(cx + R * 0.9, cy - R * 0.25); ctx.stroke(); H('tubule', cx + R * 0.75, cy - R * 0.2, 8);
    }
    for (let i = 0; i < 10; i++) B.blob(ctx, cx - R * 0.3 + Math.cos(i * 2.1) * R * 0.5, cy + Math.sin(i * 2.1) * R * 0.5 * (plant ? 0.4 : 0.8) + (plant ? R * 0.4 : 0), 2, 2, hl('ribo') || '#0f172a');
    ctx.restore();
  }
  // تكبير العضية المختارة
  function zoomOrg(ctx, id, x, y, r, c) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = c.bg; ctx.fill(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4; ctx.stroke(); ctx.clip();
    const lab = (t, tx, ty) => D.txt(ctx, t, tx, ty, { color: c.text, size: 10.5, w: '700', halo: c.bg });
    if (id === 'mito') { B.blob(ctx, x, y, r * 0.8, r * 0.45, '#fdba74', '#c2410c', 3); B.blob(ctx, x, y, r * 0.68, r * 0.34, '#fed7aa', '#9a3412', 2); ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + i * r * 0.18, y + (i % 2 ? -1 : 1) * r * 0.34); ctx.lineTo(x + i * r * 0.18, y + (i % 2 ? -1 : 1) * r * 0.02); ctx.stroke(); } lab('غشاء خارجي', x, y - r * 0.55); lab('أعراف', x + r * 0.35, y + r * 0.05); lab('حشوة', x - r * 0.4, y + r * 0.12); lab('غشاء داخلي', x, y + r * 0.55); }
    else if (id === 'chloro') { B.blob(ctx, x, y, r * 0.82, r * 0.48, '#86efac', '#166534', 3); for (let k = -2; k <= 2; k++) for (let j = 0; j < 4; j++) { ctx.fillStyle = '#15803d'; ctx.fillRect(x + k * r * 0.28 - 9, y - r * 0.18 + j * 8, 18, 6); } lab('غشاءان', x, y - r * 0.6); lab('ثايلاكويدات (غرانم)', x, y + r * 0.32); lab('الستروما', x - r * 0.55, y - r * 0.22); }
    else if (id === 'nucleus' || id === 'nucleolus' || id === 'pore') { B.blob(ctx, x, y, r * 0.75, r * 0.75, '#ddd6fe', '#6d28d9', 4); B.blob(ctx, x - r * 0.15, y, r * 0.25, r * 0.25, '#5b21b6'); ctx.strokeStyle = '#7c3aed'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + r * 0.15, y - r * 0.4 + i * r * 0.14); ctx.bezierCurveTo(x + r * 0.35, y - r * 0.5 + i * r * 0.14, x + r * 0.4, y - r * 0.2 + i * r * 0.14, x + r * 0.55, y - r * 0.35 + i * r * 0.14); ctx.stroke(); } for (let a = 0; a < 6.3; a += 0.9) { ctx.fillStyle = c.bg; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, 4, 0, 7); ctx.fill(); } lab('النوية', x - r * 0.15, y + r * 0.35); lab('كروماتين', x + r * 0.35, y - r * 0.55); lab('ثقب نووي', x, y + r * 0.85); }
    else if (id === 'golgi') { ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 7; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x, y + r * 0.9 + k * 13, r * 0.9 - k * 6, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); } for (let i = 0; i < 4; i++) B.blob(ctx, x + r * 0.55 + (i % 2) * 10, y - r * 0.3 + i * 14, 6, 6, '#facc15', '#a16207', 1.5); lab('أكياس مسطحة', x, y + r * 0.55); lab('حويصلات', x + r * 0.5, y - r * 0.5); }
    else if (id === 'centriole') { for (let k = 0; k < 9; k++) { const a = k * Math.PI * 2 / 9; for (let j = 0; j < 3; j++) B.blob(ctx, x + Math.cos(a) * (r * 0.5 + j * 8 - 8), y + Math.sin(a) * (r * 0.5 + j * 8 - 8) - j * 2, 5, 5, '#334155'); } lab('9 مجموعات ثلاثية (9+0)', x, y); }
    else { const o = ORG[id]; D.txt(ctx, o ? o[0] : '', x, y, { color: c.text, size: 14, w: '800' }); }
    ctx.restore();
  }
  reg({
    id: 'cell-explorer', order: 1, lesson: '2-2 / 3-2', lessonTitle: 'الخلايا بدائية النوى وحقيقية النوى', page: 11,
    titleAr: 'مستكشف الخلية: بدائية النوى، حيوانية، نباتية', titleEn: 'Cell Explorer: Prokaryotic, Animal & Plant Cells', tags: 'خليه نواه مايتوكندريا بلاستيدات جولجي غولجي شبكه اندوبلازمية رايبوسوم جسم حال مريكز جدار خلوي بكتيريا نظريه الخليه',
    formula: '\\text{نظرية الخلية: الخلية هي وحدة البناء والتركيب والوظيفة في أجسام الكائنات الحية}',
    book: 'نظرية الخلية (ص 10)؛ جدول (1) مقارنة بين الخلايا بدائية النوى وحقيقية النوى (ص 11)؛ الشكل (1) ص 11 والعضيات ص 12–17.',
    summary: 'تقسم الخلايا إلى بدائية النوى (لا نواة لها ولا عضيات غشائية) وحقيقية النوى (حيوانية ونباتية). اضغط على أي جزء لتكبيره ومعرفة وظيفته، وفعّل المقارنة لعرض جدول (1).',
    vars: [['\\text{نوع الخلية}', 'بدائية النوى / حيوانية / نباتية', '—', 'ثلاثة أنواع'], ['\\text{قطر الخلية}', 'بدائية النوى ~1–5، حقيقية النوى ~10–100 (جدول 1)', '\\text{ميكرومتر}', 'من الكتاب'], ['\\text{سمك الغشاء البلازمي}', '5 – 10 (ص 12)', '\\text{نانومتر}', 'من الكتاب']],
    assumptions: ['الرسم تخطيطي (نموذج مبسّط لأغراض التعليم) وليس بمقياس رسم حقيقي؛ الخلية بدائية النوى أصغر بكثير من حقيقية النوى (جدول 1).'],
    params: [
      { key: 'type', label: '\\text{نوع الخلية}', type: 'select', options: TYPES, value: 'animal' },
      { key: 'cmp', label: '\\text{جدول المقارنة (1)}', type: 'toggle', value: false, on: 'إظهار المقارنة', off: 'إخفاء المقارنة' }
    ],
    initState: () => ({ sel: null }), resetOn: ['type'],
    randomize(p) { const o = TYPES.map((x) => x[0]).filter((x) => x !== p.type); return { type: o[Math.floor(Math.random() * o.length)] }; },
    canvasHint: 'اضغط على أي عضية لتكبيرها وقراءة وظيفتها من الكتاب.',
    compute(p) { return { sel: null }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const st = d.st || {}; const sel = st.sel;
      const h = p.cmp ? H * 0.52 : H; const R = Math.min(nar ? W * 0.36 : W * 0.26, h * 0.4) * (p.type === 'pro' ? 0.9 : 1);
      const cx = nar ? W / 2 : W * 0.4, cy = h * 0.5 + (p.type === 'pro' ? 0 : 6);
      D.txt(ctx, TYPES.find((t) => t[0] === p.type)[1], cx, 16, { color: c.text, size: 14, w: '800' });
      drawCell(ctx, p.type, cx, cy, R, c, sel, d.hits);
      if (sel && ORG[sel]) {
        const zr = nar ? Math.min(W * 0.2, h * 0.2) : Math.min(W * 0.14, h * 0.28); const zx = nar ? W - zr - 8 : W * 0.82, zy = nar ? zr + 30 : h * 0.38;
        zoomOrg(ctx, sel, zx, zy, zr, c);
        D.txt(ctx, ORG[sel][0], zx, zy + zr + 16, { color: '#d97706', size: 14, w: '800' });
      }
      if (p.cmp) {
        const ty = h + 6, rh = (H - ty - 6) / 6, x0 = 8, w = W - 16; const cw = [0.24, 0.38, 0.38].map((f) => f * w);
        const rows = [['وجه المقارنة', 'بدائية النوى', 'حقيقية النوى']].concat(B.PRO_EU);
        rows.forEach((r, i) => { const y = ty + i * rh; ctx.fillStyle = i === 0 ? 'rgba(37,99,235,.18)' : i % 2 ? 'rgba(148,163,184,.12)' : 'rgba(148,163,184,.04)'; ctx.fillRect(x0, y, w, rh - 1); let xx = x0 + w; r.forEach((cell, j) => { const hiCol = (j === 1 && p.type === 'pro') || (j === 2 && p.type !== 'pro'); D.txt(ctx, cell, xx - 4, y + rh / 2, { color: hiCol && i ? c.c1 : c.text, size: nar ? 9 : 11.5, w: i === 0 || j === 0 ? '800' : '500', align: 'right' }); xx -= cw[j]; }); });
      }
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h || !ORG[h.id]) return false;
      st.sel = h.id; api.say(['**' + ORG[h.id][0] + ':** ' + ORG[h.id][1]]); return true;
    },
    live(p, d) { const s = d.st && d.st.sel; return '\\text{' + (s ? ORG[s][0] : 'اضغط على عضية') + '}'; },
    results(p, d) {
      const s = d.st && d.st.sel; const eu = p.type !== 'pro';
      return [['العضية المختارة', s ? ORG[s][0] : '—', false], ['وظيفتها', s ? ORG[s][1] : 'اضغط على جزء من الخلية', false], ['النواة', eu ? 'توجد، يحيط بها غلاف نووي' : 'لا توجد؛ منطقة نووية دون غلاف', false],
        ['قطر الخلية (جدول 1)', eu ? '10 – 100 ميكرومتر تقريباً' : '1 – 5 ميكرومتر تقريباً', false], ['الانقسام', eu ? 'انقسام متساوٍ وانقسام منصف' : 'انشطار ثنائي', false]].concat(p.type === 'plant' ? [['خاص بالنبات', 'جدار خلوي من السليلوز، بلاستيدات خضراء، فجوة عصارية مركزية', false]] : p.type === 'animal' ? [['خاص بالحيوان', 'المريكزان (الجسم المركزي)', false]] : []);
    },
    steps() { return B.CELL_THEORY.map((x, i) => 'بند ' + (i + 1) + ' من نظرية الخلية: ' + x); },
    explain(a, b) {
      if (a.type !== b.type) return [b.type === 'pro' ? 'الخلية بدائية النوى لا نواة لها: المادة الوراثية DNA حلقي في المنطقة النووية دون غلاف، ولا توجد فيها عضيات غشائية؛ وفيها رايبوسومات.' : b.type === 'plant' ? 'الخلية النباتية حقيقية النوى، وتتميز بالجدار الخلوي (سليلوز) والبلاستيدات الخضراء والفجوة العصارية المركزية، ولا يظهر فيها المريكزان.' : 'الخلية الحيوانية حقيقية النوى، فيها نواة وعضيات غشائية ومريكزان، ولا يوجد فيها جدار خلوي ولا بلاستيدات خضراء.'];
      if (a.cmp !== b.cmp) return [b.cmp ? 'جدول (1): يقارن بين الخلايا بدائية النوى وحقيقية النوى في القطر والنواة والمادة الوراثية والعضيات الغشائية والانقسام.' : 'أُخفي جدول المقارنة.'];
      return [];
    },
    learn: ['**نظرية الخلية (ص 10):** ' + B.CELL_THEORY.join(' '), '**بدائية النوى (ص 11):** لا نواة ولا عضيات غشائية، DNA حلقي واحد غير مرتبط بالهستون، وتنقسم بالانشطار الثنائي.', '**حقيقية النوى (ص 12):** نواة بغلاف نووي، وعضيات غشائية (الشبكة الإندوبلازمية، جهاز غولجي، الأجسام الحالة، المايتوكندريا، الفجوات، البلاستيدات، البيروكسيسومات) وعضيات غير غشائية (الرايبوسومات، الجسم المركزي).', '**الجدار الخلوي (ص 16):** في الخلايا النباتية وبعض الطلائعيات، من السليلوز.'],
    challenges: [
      { q: 'اضغط على العضية التي تُعد **مصنع الطاقة** في الخلية (إنتاج ATP).', hint: 'عضية بغشاءين وأعراف داخلية.', init: { type: 'animal', cmp: false }, check: (p, d) => d.st && d.st.sel === 'mito' },
      { q: 'اختر نوع الخلية التي **لا تحتوي نواة** ثم اضغط على مكان مادتها الوراثية.', hint: 'الخلية بدائية النوى ← المنطقة النووية.', init: { type: 'animal', cmp: false }, check: (p, d) => p.type === 'pro' && d.st && d.st.sel === 'nucleoid' },
      { q: 'في الخلية النباتية اضغط على العضية التي **لا توجد في الخلية الحيوانية** وتحتوي ثايلاكويدات.', hint: 'البلاستيدات الخضراء.', init: { type: 'animal', cmp: false }, check: (p, d) => p.type === 'plant' && d.st && d.st.sel === 'chloro' },
      { q: 'اضغط على العضية التي تعدّل البروتينات بإضافة الكربوهيدرات.', hint: 'أكياس غشائية مسطحة يكثر في الخلايا الإفرازية.', init: { type: 'plant', cmp: false }, check: (p, d) => d.st && d.st.sel === 'golgi' }
    ],
    tutor: [
      { q: 'ما الفرق بين بدائية النوى وحقيقية النوى؟', k: ['الفرق', 'بدائيه', 'حقيقيه'], a: () => 'جدول (1) ص 11: ' + B.PRO_EU.map((r) => r[0] + ': ' + r[1] + ' ↔ ' + r[2]).join('؛ ') + '.' },
      { q: 'ما وظيفة العضية المختارة؟', k: ['وظيفه', 'المختاره', 'ماذا تعمل'], a: (p, d) => { const s = d.st && d.st.sel; return s ? ORG[s][0] + ': ' + ORG[s][1] : 'اضغط أولاً على عضية في الرسم.'; } },
      { q: 'لماذا تكثر المايتوكندريا في الخلايا العضلية؟', k: ['تكثر', 'مايتوكندريا', 'عضليه', 'طاقه'], a: () => 'المايتوكندريا مصنع الطاقة في الخلية (إنتاج ATP) (ص 14)، والخلايا التي تبذل جهداً كبيراً تحتاج طاقة أكثر فتكثر فيها؛ ومثال الكتاب: القطعة الوسطى في الحيوان المنوي تحتوي عدداً كبيراً من المايتوكندريا لأنها تمده بالطاقة للحركة (ص 49).' },
      { q: 'ما الذي يميز الخلية النباتية؟', k: ['نباتيه', 'تميز', 'النبات'], a: () => 'الجدار الخلوي من السليلوز، والبلاستيدات الخضراء، والفجوة العصارية المركزية؛ ولا يظهر فيها المريكزان (جدول 2 ص 39).' }
    ]
  });

  /* ======================= مسار البروتين الإفرازي ======================= */
  const PATH = [
    ['الرايبوسومات على الشبكة الإندوبلازمية الخشنة', 'تُصنع البروتينات على الرايبوسومات الملتصقة بالشبكة الإندوبلازمية الخشنة.'],
    ['الشبكة الإندوبلازمية الخشنة', 'تنقل الشبكة الخشنة البروتينات داخل قنواتها.'],
    ['حويصلة نقل', 'تخرج البروتينات في حويصلات متجهة إلى جهاز غولجي.'],
    ['جهاز غولجي', 'يعدّل جهاز غولجي البروتينات بإضافة الكربوهيدرات إليها.'],
    ['حويصلة إفرازية', 'تنفصل حويصلة من جهاز غولجي تحمل البروتين المعدّل.'],
    ['الغشاء البلازمي', 'تندمج الحويصلة بالغشاء البلازمي.'],
    ['خارج الخلية', 'يخرج البروتين إلى خارج الخلية.']
  ];
  reg({
    id: 'protein-path', order: 2, lesson: '3-2', lessonTitle: 'الخلايا حقيقية النوى', page: 13,
    titleAr: 'مسار البروتين من الرايبوسوم إلى خارج الخلية', titleEn: 'Protein Secretion Pathway (Rough ER → Golgi → Outside)', tags: 'بروتين افراز شبكه اندوبلازمية خشنه جولجي غولجي حويصلات رايبوسوم',
    formula: '\\text{رايبوسومات} \\to \\text{شبكة إندوبلازمية خشنة} \\to \\text{حويصلة} \\to \\text{جهاز غولجي} \\to \\text{حويصلة} \\to \\text{خارج الخلية}',
    book: 'الشبكة الإندوبلازمية: تنقل البروتينات في حويصلات إلى خارج الخلية عن طريق جهاز غولجي (ص 13)؛ جهاز غولجي: يعدّل البروتينات بإضافة الكربوهيدرات، ويكثر في الخلايا الإفرازية (ص 13–14).',
    summary: 'تتعاون العضيات في تصنيع البروتين وإفرازه: تصنعه الرايبوسومات على الشبكة الخشنة، وتنقله الشبكة في حويصلات إلى جهاز غولجي الذي يعدّله ثم يغلّفه في حويصلة تخرج من الخلية.',
    vars: [['\\text{المرحلة}', 'موقع البروتين على المسار', '—', '7 مراحل'], ['\\text{السرعة}', 'سرعة التشغيل التلقائي', '—', 'للعرض فقط']],
    assumptions: ['ترتيب المراحل مبني على وظائف العضيات في الكتاب؛ الرسم والحركة نموذج مبسّط لأغراض التعليم.'],
    params: [{ key: 's', label: '\\text{موقع البروتين}', type: 'stage', stages: PATH.map((x) => x[0]), value: 0 }],
    play: { mode: 'stage', key: 's', interval: 1.8 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    canvasHint: 'اضغط «تشغيل» لتتبع البروتين (النقطة الحمراء) من الرايبوسوم إلى خارج الخلية.',
    compute(p) { return { stop: PATH[p.s] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const cx = W / 2, cy = H * 0.52, R = Math.min(W * 0.44, H * 0.42); const t = (d.st && d.st.t) || 0;
      B.blob(ctx, cx, cy, R, R * 0.78, 'rgba(254,226,226,.85)', '#b91c1c', 4);
      B.blob(ctx, cx - R * 0.6, cy, R * 0.22, R * 0.22, 'rgba(196,181,253,.9)', '#6d28d9', 3); D.txt(ctx, 'النواة', cx - R * 0.6, cy, { color: '#4c1d95', size: 12, w: '700' });
      const pts = [[cx - R * 0.32, cy - R * 0.05], [cx - R * 0.15, cy - R * 0.02], [cx + R * 0.02, cy - R * 0.18], [cx + R * 0.22, cy - R * 0.1], [cx + R * 0.45, cy - R * 0.22], [cx + R * 0.88, cy - R * 0.35], [cx + R * 1.12, cy - R * 0.45]];
      // الشبكة الخشنة
      ctx.strokeStyle = '#0e7490'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let i = 0; i <= 16; i++) ctx.lineTo(cx - R * 0.38 + i * R * 0.018, cy - R * 0.12 + k * 10 + Math.sin(i * 0.9) * 3); ctx.stroke(); for (let i = 0; i < 6; i++) B.blob(ctx, cx - R * 0.36 + i * R * 0.05, cy - R * 0.12 + k * 10 - 5, 2.2, 2.2, '#0f172a'); }
      // غولجي
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(pts[3][0], pts[3][1] + 34 + k * 7, 30 - k * 2, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
      const lbl = [['رايبوسومات', 0, -18], ['الشبكة الخشنة', 1, 34], ['جهاز غولجي', 3, 44], ['الغشاء البلازمي', 5, 22]];
      lbl.forEach((l) => D.txt(ctx, l[0], pts[l[1]][0], pts[l[1]][1] + l[2], { color: c.text, size: nar ? 10 : 12, w: '700', halo: c.bg }));
      ctx.setLineDash([5, 5]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.setLineDash([]);
      // البروتين يتحرك قليلاً حول موقعه الحالي
      const i = p.s; const a = pts[Math.max(0, i - 1)], b = pts[i]; const f = Math.min(1, (t % 1.8) / 1.2); const x = a[0] + (b[0] - a[0]) * (i ? f : 1), y = a[1] + (b[1] - a[1]) * (i ? f : 1);
      if (i === 2 || i === 4 || i === 5) B.blob(ctx, x, y, 10, 10, 'rgba(250,204,21,.6)', '#a16207', 2);
      B.blob(ctx, x, y, 5, 5, i >= 3 ? '#be123c' : '#dc2626'); if (i >= 3) { ctx.fillStyle = '#16a34a'; ctx.fillRect(x + 4, y - 7, 4, 4); }
      D.txt(ctx, (i + 1) + '. ' + PATH[i][0], W / 2, 18, { color: c.c2, size: 15, w: '800' });
      B.para(ctx, D, PATH[i][1], W / 2, H - 14, W - 30, { color: c.text, size: nar ? 11 : 13, bottom: true });
    },
    live(p, d) { return '\\text{' + (p.s + 1) + '. ' + d.stop[0] + '}'; },
    results(p, d) { return [['موقع البروتين', d.stop[0], false], ['ماذا يحدث', d.stop[1], false], ['هل أُضيفت الكربوهيدرات؟', p.s >= 3 ? 'نعم (في جهاز غولجي)' : 'ليس بعد', false]]; },
    steps(p) { return PATH.slice(0, p.s + 1).map((x) => x[0] + ': ' + x[1]); },
    explain(a, b) { if (a.s === b.s) return []; return ['**' + PATH[b.s][0] + ':** ' + PATH[b.s][1]]; },
    learn: ['**الشبكة الإندوبلازمية الخشنة (ص 13):** تلتصق بها الرايبوسومات، وتنقل البروتينات في حويصلات إلى خارج الخلية عن طريق جهاز غولجي.', '**جهاز غولجي (ص 13–14):** يكثر في الخلايا الإفرازية، ويعدّل البروتينات بإضافة الكربوهيدرات إليها.', 'لذلك تكثر الشبكة الخشنة وجهاز غولجي في الخلايا التي تفرز بروتينات.'],
    challenges: [
      { q: 'أوقف البروتين في العضية التي **تضيف إليه الكربوهيدرات**.', hint: 'أكياس غشائية مسطحة.', init: { s: 0 }, check: (p) => p.s === 3 },
      { q: 'أين يُنقل البروتين من الشبكة الخشنة إلى جهاز غولجي؟ انتقل إلى تلك المرحلة.', hint: 'كيس غشائي صغير.', init: { s: 6 }, check: (p) => p.s === 2 }
    ],
    tutor: [
      { q: 'لماذا يكثر جهاز غولجي في الخلايا الإفرازية؟', k: ['يكثر', 'افرازيه', 'جولجي', 'غولجي'], a: () => 'لأنه يعدّل البروتينات بإضافة الكربوهيدرات ويغلّفها في حويصلات تخرج من الخلية (ص 13–14).' },
      { q: 'أين البروتين الآن؟', k: ['اين', 'الان'], a: (p, d) => 'البروتين الآن في: ' + d.stop[0] + '. ' + d.stop[1] }
    ]
  });
  /* ======================= 1-2 نظرية الخلية ======================= */
  reg({
    id: 'cell-theory', order: 0, lesson: '1-2', lessonTitle: 'نظرية الخلية', page: 10,
    titleAr: 'نظرية الخلية: ثلاثة بنود', titleEn: 'The Cell Theory', tags: 'نظريه الخليه شلايدن شفان علم الخليه وحده البناء',
    formula: '\\text{الخلية: وحدة البناء والتركيب والوظيفة}',
    book: 'نظرية الخلية (ص 10): وضع بنودها العالمان شلايدن وشفان في القرن التاسع عشر، بعد أن ساعد تطور المجاهر في دراسة الخلية (علم الخلية Cytology).',
    summary: 'انتقل بين بنود نظرية الخلية الثلاثة، وشاهد مثالاً لكل بند: كائنات من خلية واحدة أو أكثر، والخلية وحدة البناء والوظيفة، والخلايا الجديدة تنتج من خلايا سابقة.',
    vars: [['\\text{البند}', 'بنود نظرية الخلية', '—', '3 بنود (ص 10)']],
    assumptions: ['الرسوم أمثلة تخطيطية لكل بند (نموذج مبسّط لأغراض التعليم)؛ نص البنود حرفياً من الكتاب.'],
    params: [{ key: 'k', label: '\\text{البند}', type: 'stage', stages: B.CELL_THEORY, value: 0 }],
    play: { mode: 'stage', key: 'k', interval: 3 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    canvasHint: 'اضغط «تشغيل» لعرض البنود بالتتابع.',
    compute(p) { return { item: B.CELL_THEORY[p.k] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const t = (d.st && d.st.t) || 0; const cy = H * 0.48;
      B.para(ctx, D, (p.k + 1) + '. ' + d.item, W / 2, 22, W - 30, { color: c.c5, size: nar ? 13 : 16, w: '800' });
      const cell = (x, y, r, fill) => { B.blob(ctx, x, y, r, r * 0.8, fill || 'rgba(254,226,226,.9)', '#b91c1c', 2); B.blob(ctx, x, y, r * 0.3, r * 0.3, '#c4b5fd', '#6d28d9', 1.5); };
      if (p.k === 0) {
        const x1 = W * 0.27, x2 = W * 0.72, R = Math.min(W * 0.18, H * 0.28);
        D.rr(ctx, x1 - R * 0.7, cy - R * 0.3, R * 1.4, R * 0.6, R * 0.3); ctx.fillStyle = 'rgba(147,197,253,.6)'; ctx.fill(); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.stroke();
        D.txt(ctx, 'خلية واحدة (البكتيريا)', x1, cy + R * 0.7, { color: c.text, size: 13, w: '800' });
        for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) cell(x2 + i * R * 0.34, cy + j * R * 0.3, R * 0.16);
        D.txt(ctx, 'خلايا عدة (الإنسان)', x2, cy + R * 0.95, { color: c.text, size: 13, w: '800' });
      } else if (p.k === 1) {
        const R = Math.min(W, H) * 0.09; const n = nar ? 4 : 7;
        for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const x = W / 2 + (i - (n - 1) / 2) * R * 2.1, y = cy + (j - 1) * R * 1.8; ctx.fillStyle = 'rgba(254,215,170,.9)'; D.rr(ctx, x - R, y - R * 0.8, R * 2, R * 1.6, 6); ctx.fill(); ctx.strokeStyle = '#c2410c'; ctx.stroke(); B.blob(ctx, x, y, R * 0.3, R * 0.3, '#7c2d12'); }
        D.txt(ctx, 'الخلايا تبني النسيج وتقوم بوظائفه', W / 2, cy + R * 3.2, { color: c.text, size: 13, w: '800' });
      } else {
        const f = Math.min(1, (t % 3) / 2.4); const R = Math.min(W, H) * 0.14; const dx = R * 1.2 * f;
        if (f < 0.5) cell(W / 2, cy, R * (1 + f * 0.3)); else { cell(W / 2 - dx, cy, R * 0.85); cell(W / 2 + dx, cy, R * 0.85); }
        D.txt(ctx, f < 0.5 ? 'خلية سابقة' : 'خليتان جديدتان من الخلية السابقة', W / 2, cy + R * 1.4, { color: c.text, size: 13, w: '800' });
      }
      B.para(ctx, D, 'وضع بنود النظرية العالمان شلايدن وشفان في القرن التاسع عشر (ص 10).', W / 2, H - 14, W - 30, { color: c.muted, size: 12, bottom: true });
    },
    live(p, d) { return '\\text{البند ' + (p.k + 1) + ' من 3}'; },
    results(p, d) { return [['البند', d.item, false], ['العالمان', 'شلايدن وشفان (القرن التاسع عشر)', false], ['أنواع الخلايا', 'بدائية النوى (البكتيريا والبكتيريا القديمة) وحقيقية النوى (جميع الكائنات الحية الأخرى)', false]]; },
    steps() { return B.CELL_THEORY.map((x, i) => (i + 1) + ') ' + x); },
    explain(a, b) { return a.k === b.k ? [] : ['البند ' + (b.k + 1) + ': ' + B.CELL_THEORY[b.k]]; },
    learn: ['**علم الخلية (ص 10):** ساعد تطور المجاهر في التعمق في دراسة الخلية حتى أصبحت علماً قائماً بذاته (Cytology).', '**نظرية الخلية:** ' + B.CELL_THEORY.join(' '), '**تلاؤم الشكل والوظيفة:** تختلف الخلايا في شكلها ووظائفها، ويتلاءم شكل الخلية وتركيبها مع وظيفتها.'],
    challenges: [
      { q: 'انتقل إلى البند الذي ينص على أن **الخلايا الجديدة تنتج من خلايا سابقة لها**.', hint: 'البند الثالث.', init: { k: 0 }, check: (p) => p.k === 2 },
      { q: 'انتقل إلى البند الذي يجعل الخلية **وحدة البناء والتركيب والوظيفة**.', hint: 'البند الثاني.', init: { k: 0 }, check: (p) => p.k === 1 }
    ],
    tutor: [{ q: 'من وضع نظرية الخلية؟', k: ['من وضع', 'شلايدن', 'شفان'], a: () => 'العالمان شلايدن وشفان في القرن التاسع عشر، بعد أن ساعد تطور المجاهر في دراسة الخلية (ص 10).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
