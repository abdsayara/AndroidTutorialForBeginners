/* الكيمياء — الوحدة الرابعة: مدخل إلى الكيمياء العضوية (ص69–99) */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const R = ML.chemDraw;
  const S = 'g10-chem', U = 4;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const r2 = (v, k) => C.round(v, k === undefined ? 2 : k);
  const V = C.V;
  const frame = (m) => ({ atoms: m.atoms, bonds: m.bonds.map((b) => ({ i: b[0], j: b[1], o: b[2], a: 1, kind: 'old' })) });
  const center = (m) => { const c = m.atoms.reduce((s, a) => V.add(s, a.p), [0, 0, 0]).map((v) => v / m.atoms.length); m.atoms.forEach((a) => { a.p = V.sub(a.p, c); }); m.size = Math.max(1, ...m.atoms.map((a) => V.len(a.p) + 0.5)); return m; };
  const rotPointer = (type, x, y, p, st) => { if (!st) return false; if (type === 'down') { st._drag = [x, y]; return false; } if (type === 'move' && st._drag) { st.yaw = (st.yaw || 0) + (x - st._drag[0]) * 0.012; st.pitch = Math.max(-1.2, Math.min(1.2, (st.pitch || 0) + (y - st._drag[1]) * 0.01)); st._drag = [x, y]; return 'redraw'; } if (type === 'up') st._drag = null; return false; };

  /* ======================= نشاط (1) متآصلات الكربون ص72 ======================= */
  function graphite() { const atoms = [], bonds = []; const a = 1.4; const idx = {};
    for (let L = 0; L < 2; L++) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { for (const s of [0, 1]) { const x = (i + j * 0.5) * a * Math.sqrt(3) + (s ? a * Math.sqrt(3) / 2 : 0) + L * a * 0.85, z = j * a * 1.5 + (s ? a * 0.5 : 0); if (Math.hypot(x, z) > 5.2) continue; idx[[L, i, j, s]] = atoms.length; atoms.push({ el: 'C', p: [x, L * 3.35 - 1.7, z] }); } }
    for (let i = 0; i < atoms.length; i++) for (let k = i + 1; k < atoms.length; k++) { const d = V.len(V.sub(atoms[i].p, atoms[k].p)); if (Math.abs(atoms[i].p[1] - atoms[k].p[1]) < 0.1 && d < a * 1.05) bonds.push([i, k, 1]); }
    return center({ atoms: atoms, bonds: bonds }); }
  function diamond() { const atoms = [], bonds = []; const s = 1.8; const base = [[0, 0, 0], [0, 2, 2], [2, 0, 2], [2, 2, 0]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) base.forEach((b) => { [[0, 0, 0], [1, 1, 1]].forEach((o) => { const p = [(b[0] + o[0] + i * 4) * s / 2, (b[1] + o[1] + j * 4) * s / 2, (b[2] + o[2] + k * 4) * s / 2]; if (!atoms.some((q) => V.len(V.sub(q.p, p)) < 0.1)) atoms.push({ el: 'C', p: p }); }); });
    const cut = atoms.filter((a) => a.p.every((v) => v <= 5 * s / 2 + 0.01)); cut.forEach((a, i) => cut.forEach((b, j) => { if (j > i && V.len(V.sub(a.p, b.p)) < s * 0.9) bonds.push([i, j, 1]); }));
    return center({ atoms: cut, bonds: bonds }); }
  const ALLO = { graphite: graphite(), diamond: diamond() };
  reg({
    id: 'carbon-allotropes', order: 1, lesson: '4-1-1', lessonTitle: 'الكربون وخصائصه', page: 72,
    titleAr: 'متآصلات الكربون: الجرافيت والماس', titleEn: 'Allotropes of Carbon: Graphite and Diamond',
    tags: 'كربون متآصلات جرافيت ماس طبقات رباعي الاوجه قساوة توصيل قلم رصاص نشاط 1',
    formula: '\\text{الجرافيت: طبقات سداسية} \\;|\\; \\text{الماس: كل ذرة C مرتبطة بأربع ذرات}',
    book: 'نشاط (1) ص72: تأمل ترتيب الذرات في الجرافيت والماس: أيّهما طبقات؟ وأيّهما أقسى؟ سؤال ص73: لماذا يُستخدم الجرافيت في صناعة أقلام الرصاص؟',
    summary: 'الجرافيت والماس متآصلان للكربون. في الجرافيت ترتبط كل ذرة بثلاث ذرات في طبقات سداسية تنزلق فوق بعضها، فهو طري ويُستخدم في أقلام الرصاص. وفي الماس ترتبط كل ذرة بأربع ذرات في شبكة ثلاثية الأبعاد، فهو أقسى المواد.',
    vars: [['\\text{المتآصل}', 'الجرافيت أو الماس', '—', '—'], ['\\text{الروابط لكل ذرة}', 'عدد ذرات C المرتبطة بكل ذرة', '—', '3 أو 4']],
    assumptions: ['نماذج ثلاثية الأبعاد لجزء صغير من البلورة، اسحب لتدويرها.'],
    canvasHint: 'اسحب لتدوير النموذج',
    params: [{ key: 'form', label: '\\text{المتآصل}', type: 'select', value: 'graphite', options: [['graphite', 'الجرافيت'], ['diamond', 'الماس']] }],
    initState: () => ({ yaw: 0.6, pitch: 0.35 }),
    compute(p) { return { m: ALLO[p.form] }; },
    results(p) { return p.form === 'graphite' ? [['ترتيب الذرات', 'طبقات من حلقات سداسية', false], ['الروابط لكل ذرة', '3', false], ['القساوة', 'طري: الطبقات تنزلق فوق بعضها', false], ['الاستخدام', 'أقلام الرصاص', false, 'pos']] : [['ترتيب الذرات', 'شبكة ثلاثية الأبعاد، كل ذرة في مركز رباعي أوجه', false], ['الروابط لكل ذرة', '4', false], ['القساوة', 'أقسى المواد الطبيعية', false, 'pos'], ['الاستخدام', 'القطع والحفر والحلي', false]]; },
    steps(p) { return ['تأمّل ترتيب الذرات في النموذج.', 'عدّ الذرات المرتبطة بذرة واحدة.', p.form === 'graphite' ? 'لاحظ الطبقات: هل ترتبط الطبقات بروابط قوية؟' : 'لاحظ الشبكة المتصلة في كل الاتجاهات.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { yaw: 0.6, pitch: 0.35 }; d.hits = [];
      C.drawBallStick(ctx, frame(d.m), { yaw: st.yaw, pitch: st.pitch, cx: W / 2, cy: H * 0.47, s: Math.min(W, H) / (2.6 * d.m.size), fov: 30, colors: { bond: '#64748b' } });
      D.txt(ctx, p.form === 'graphite' ? 'الجرافيت: طبقات سداسية (3 روابط لكل ذرة)' : 'الماس: 4 روابط لكل ذرة', W / 2, H * 0.93, { color: cols.text, size: R.narrow(W) ? 13 : 15, w: '700' });
    },
    onPointer: rotPointer,
    explain(a, b) { return a.form !== b.form ? [b.form === 'graphite' ? 'الجرافيت: الطبقات مرتبطة بقوى ضعيفة فتنزلق، لذلك هو طري.' : 'الماس: كل ذرة مرتبطة بأربع ذرات في كل الاتجاهات، لذلك هو شديد القساوة.'] : []; },
    learn: ['**التآصل:** وجود العنصر بأشكال مختلفة؛ للكربون متآصلات منها الجرافيت والماس (ص72).', '**الجرافيت:** طبقات سداسية تنزلق، فيُستخدم في أقلام الرصاص (ص73).', '**الماس:** شبكة ثلاثية الأبعاد صلبة جداً.'],
    challenges: [
      { q: 'اعرض المتآصل الذي يُستخدم في أقلام الرصاص.', hint: 'المتآصل ذو الطبقات.', init: { form: 'diamond' }, check: (p) => p.form === 'graphite', why: () => 'طبقات الجرافيت تنزلق وتترك أثراً على الورق.' },
      { q: 'اعرض المتآصل الذي ترتبط فيه كل ذرة بأربع ذرات.', hint: 'المتآصل الأقسى.', init: { form: 'graphite' }, check: (p) => p.form === 'diamond', why: () => 'الماس.' }
    ],
    tutor: [
      { q: 'لماذا يُستخدم الجرافيت في أقلام الرصاص؟', k: ['اقلام', 'رصاص', 'جرافيت'], a: () => C.tutor('ماذا يحدث للطبقات عند حك القلم بالورق؟', 'طبقات الجرافيت ترتبط ببعضها بقوى ضعيفة فتنزلق وتترك أثراً على الورق.') },
      { q: 'لماذا الماس قاسٍ جداً؟', k: ['ماس', 'قاس', 'قساوه'], a: () => C.tutor('كم رابطة قوية لكل ذرة؟ وفي كم اتجاه؟', 'كل ذرة مرتبطة بأربع ذرات بروابط تساهمية قوية في شبكة ثلاثية الأبعاد.') },
      { q: 'ما التآصل؟', k: ['تاصل'], a: () => C.tutor('هل الجرافيت والماس عنصران مختلفان؟', 'أشكال مختلفة للعنصر نفسه (الكربون) تختلف في ترتيب الذرات وخصائصها الفيزيائية.') }
    ]
  });

  /* ======================= الألكانات والألكينات: الصيغة العامة والتسمية والخصائص ص77–89 ======================= */
  const NAMES = ['', 'ميثان', 'إيثان', 'بروبان', 'بيوتان', 'بنتان', 'هكسان', 'هبتان', 'أوكتان', 'نونان', 'ديكان'];
  const ENE = ['', '', 'إيثين (إيثيلين)', 'بروبين (بروبلين)', 'بيوتين', 'بنتين', 'هكسين', 'هبتين', 'أوكتين', 'نونين', 'ديكين'];
  // الجدول (4-3) ص81 (الهكسان–الديكان بتوزيع قيم الكتاب الخمس)، والجدول (4-4) ص82
  const BP = [null, -162, -88.6, -42.1, -0.5, 36.1, 68.7, 98.4, 125.7, 150.8, 174];
  const BP_ISO = -11.7;
  function isobutane() {
    const t = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(V.norm); const atoms = [{ el: 'C', p: [0, 0, 0] }], bonds = [];
    for (let i = 0; i < 3; i++) { const P = V.mul(t[i], 1.5); atoms.push({ el: 'C', p: P }); const ci = atoms.length - 1; bonds.push([0, ci, 1]); for (let j = 0; j < 4; j++) if (j !== i) { atoms.push({ el: 'H', p: V.add(P, V.mul(t[j], -1.0)) }); bonds.push([ci, atoms.length - 1, 1]); } }
    atoms.push({ el: 'H', p: V.mul(t[3], 1.0) }); bonds.push([0, atoms.length - 1, 1]);
    return center({ atoms: atoms, bonds: bonds });
  }
  function hydrocarbon(fam, n, iso) {
    if (fam === 'alkane' && n === 4 && iso) return isobutane();
    if (fam === 'alkane') return center(C.chainMol(Array(n).fill('C'), n === 1 ? [4] : Array.from({ length: n }, (_, i) => (i === 0 || i === n - 1 ? 3 : 2))));
    const hs = Array.from({ length: n }, (_, i) => (i === 0 ? 2 : i === 1 ? (n === 2 ? 2 : 1) : i === n - 1 ? 3 : 2));
    const m = C.chainMol(Array(n).fill('C'), hs); m.bonds[0][2] = 2; return center(m);
  }
  reg({
    id: 'hydrocarbons', order: 2, lesson: '4-2-1', lessonTitle: 'الألكانات والألكينات', page: 78,
    titleAr: 'الألكانات والألكينات: الصيغة العامة والتسمية ودرجة الغليان', titleEn: 'Alkanes and Alkenes: Formula, Naming, Boiling Point',
    tags: 'الكانات الكينات الصيغة العامة CnH2n+2 CnH2n تسمية درجة الغليان تشكل بيوتان ايزوبيوتان نماذج نشاط 5 نشاط 6 نشاط 7 نشاط 8 نشاط 9 نشاط 11 جدول 4-3',
    formula: '\\text{الألكانات: } \\text{C}_n\\text{H}_{2n+2} \\qquad \\text{الألكينات: } \\text{C}_n\\text{H}_{2n}',
    book: 'نشاط (5) ص78: الصيغة العامة للألكانات CnH₂n₊₂. نشاط (6) ص79: تسمية الألكانات العشرة الأولى. نشاط (7) ص80: بناء نماذج. الجدول (4-3) ص81: درجات الغليان. الجدول (4-4) ص82: ع-بيوتان −0.5 °س، أيزو-بيوتان −11.7 °س. نشاط (11) ص87: الصيغة العامة للألكينات CnH₂n.',
    summary: 'الألكانات هيدروكربونات مشبعة (روابط أحادية) صيغتها العامة CnH₂n₊₂، والألكينات غير مشبعة فيها رابطة ثنائية وصيغتها CnH₂n. تزداد درجة غليان الألكانات بزيادة عدد ذرات الكربون، وتقل بزيادة التفرّع.',
    vars: [['n', 'عدد ذرات الكربون', '—', '1–10'], ['T_b', 'درجة الغليان عند 1 ضغط جوي (الجدول 4-3)', '^{\\circ}\\text{س}', '−162 إلى 174']],
    assumptions: ['درجات غليان الألكينات لا يذكرها الكتاب فلا تُعرض.', 'النموذج الجزيئي بزوايا تقريبية؛ اسحب لتدويره.'],
    canvasHint: 'اسحب لتدوير الجزيء',
    params: [
      { key: 'fam', label: '\\text{العائلة}', type: 'select', value: 'alkane', options: [['alkane', 'ألكان (مشبع)'], ['alkene', 'ألكين (غير مشبع)']] },
      { key: 'n', label: 'n\\ \\text{(ذرات الكربون)}', min: 1, max: 10, step: 1, value: 4, int: true },
      { key: 'iso', label: '\\text{التفرّع (للبيوتان)}', type: 'toggle', value: false, on: 'أيزو-بيوتان', off: 'سلسلة غير متفرعة', hidden: (p) => !(p.fam === 'alkane' && p.n === 4) }
    ],
    onSet(p) { if (p.fam === 'alkene' && p.n < 2) p.n = 2; },
    initState: () => ({ yaw: 0.4, pitch: 0.3 }),
    compute(p) {
      const n = p.fam === 'alkene' ? Math.max(2, p.n) : p.n; const h = p.fam === 'alkane' ? 2 * n + 2 : 2 * n; const f = 'C' + (n > 1 ? n : '') + 'H' + h;
      const iso = p.fam === 'alkane' && n === 4 && p.iso; const bp = p.fam === 'alkane' ? (iso ? BP_ISO : BP[n]) : null;
      return { n: n, h: h, f: f, M: C.molarMass(f), name: p.fam === 'alkane' ? (iso ? 'أيزو-بيوتان' : NAMES[n]) : ENE[n], bp: bp, state: bp === null ? null : bp < 25 ? 'غاز' : 'سائل', m: hydrocarbon(p.fam, n, iso) };
    },
    live(p, d) { return p.fam === 'alkane' ? '\\text{C}_{' + d.n + '}\\text{H}_{2(' + d.n + ')+2} = \\text{' + C.sub(d.f) + '}' : '\\text{C}_{' + d.n + '}\\text{H}_{2(' + d.n + ')} = \\text{' + C.sub(d.f) + '}'; },
    results(p, d) {
      const out = [['الاسم', d.name, false, 'pos'], ['الصيغة الجزيئية', '{{' + C.sub(d.f) + '}}', false], ['الكتلة المولية', d.M + ' غم/مول', false], ['نوع الروابط', p.fam === 'alkane' ? 'أحادية فقط: مشبع' : 'رابطة ثنائية C=C واحدة: غير مشبع', false]];
      if (d.bp !== null) { out.push(['درجة الغليان (الجدول 4-' + (p.iso && d.n === 4 ? '4' : '3') + ')', d.bp + ' °س', false]); out.push(['الحالة عند 25 °س', d.state, false]); }
      return out;
    },
    steps(p, d) { return ['عدد ذرات الكربون n = ' + d.n + '.', p.fam === 'alkane' ? 'عدد ذرات H = 2n + 2 = ' + d.h + '.' : 'عدد ذرات H = 2n = ' + d.h + '.', 'الصيغة ' + C.sub(d.f) + '، والاسم: مقطع يدل على عدد ذرات الكربون + «' + (p.fam === 'alkane' ? 'ان' : 'ين') + '» → ' + d.name + '.'].concat(d.bp !== null ? ['درجة الغليان ' + d.bp + ' °س' + (d.bp < 25 ? ' أقل من 25 °س فهو غاز.' : ' أعلى من 25 °س فهو سائل.')] : []); },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { yaw: 0.4, pitch: 0.3 }; const n = R.narrow(W); d.hits = [];
      const gh = d.bp !== null ? H * 0.58 : H * 0.8;
      C.drawBallStick(ctx, frame(d.m), { yaw: st.yaw, pitch: st.pitch, cx: W / 2, cy: gh * 0.5 + 10, s: Math.min(W / (2.4 * d.m.size), gh / (2.4 * d.m.size), 60), fov: 30, labels: true, colors: { bond: '#94a3b8' } });
      D.txt(ctx, d.name + ' — ' + C.sub(d.f), W / 2, 18, { color: cols.text, size: n ? 14 : 17, w: '700' });
      if (d.bp !== null) {
        const x0 = 40, x1 = W - 20, y0 = H * 0.68, y1 = H - 26; const X = (k) => x0 + (k - 1) / 9 * (x1 - x0); const Y = (t) => y1 - (t + 170) / 350 * (y1 - y0);
        ctx.strokeStyle = cols.grid; ctx.beginPath(); ctx.moveTo(x0, Y(25)); ctx.lineTo(x1, Y(25)); ctx.stroke(); D.txt(ctx, '25 °س', x0 - 4, Y(25), { color: cols.muted, size: 10.5, align: 'right' });
        ctx.strokeStyle = cols.c1; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 1; k <= 10; k++) { k === 1 ? ctx.moveTo(X(k), Y(BP[k])) : ctx.lineTo(X(k), Y(BP[k])); } ctx.stroke();
        for (let k = 1; k <= 10; k++) { ctx.fillStyle = k === d.n && !(p.iso && d.n === 4) ? cols.c2 : cols.c1; ctx.beginPath(); ctx.arc(X(k), Y(BP[k]), k === d.n ? 5 : 3, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, String(k), X(k), y1 + 12, { color: cols.muted, size: 10 }); }
        if (p.iso && d.n === 4) { ctx.fillStyle = cols.c4; ctx.beginPath(); ctx.arc(X(4), Y(BP_ISO), 5, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, 'أيزو', X(4) + 24, Y(BP_ISO), { color: cols.c4, size: 11, w: '700' }); }
        D.txt(ctx, 'درجة الغليان مع عدد ذرات الكربون (الجدول 4-3)', W / 2, y0 - 12, { color: cols.muted, size: 11.5, w: '700' });
      }
    },
    onPointer: rotPointer,
    explain(a, b, da, db) { const o = []; if (a.n !== b.n || a.fam !== b.fam) o.push(db.name + ': ' + C.sub(db.f) + (db.bp !== null ? '، يغلي عند ' + db.bp + ' °س (' + db.state + ' عند 25 °س).' : '.')); if (a.iso !== b.iso && b.n === 4 && b.fam === 'alkane') o.push(b.iso ? 'أيزو-بيوتان له الصيغة الجزيئية نفسها C₄H₁₀ وصيغة بنائية مختلفة (تشكّل)، ودرجة غليانه أقل (−11.7 °س) لأن التفرّع يقلل درجة الغليان.' : 'ع-بيوتان سلسلة غير متفرعة، يغلي عند −0.5 °س.'); return o; },
    learn: ['**الألكانات (ص77–78):** هيدروكربونات مشبعة صيغتها العامة CnH₂n₊₂، وتُسمّى بمقطع يدل على عدد ذرات الكربون يليه «ان» (ص79).', '**درجة الغليان (الجدول 4-3):** تزداد بزيادة عدد ذرات الكربون؛ الألكانات من C1 إلى C4 غازات عند 25 °س.', '**التشكّل (ص80–82):** مركبات لها الصيغة الجزيئية نفسها وصيغ بنائية مختلفة؛ زيادة التفرّع تخفض درجة الغليان (ع-بيوتان −0.5، أيزو-بيوتان −11.7 °س).', '**الألكينات (ص86–87):** غير مشبعة فيها رابطة ثنائية، صيغتها CnH₂n، وتُسمّى بالمقطع «ين» (إيثين = إيثيلين).'],
    challenges: [
      { q: 'ما الألكان الذي يحتوي 14 ذرة هيدروجين؟ اعرضه.', hint: '2n + 2 = 14.', init: { fam: 'alkane', n: 4 }, check: (p, d) => p.fam === 'alkane' && d.h === 14, why: () => 'n = 6: الهكسان C₆H₁₄.' },
      { q: 'اعرض أول ألكان يكون سائلاً عند 25 °س.', hint: 'قارن درجات الغليان بـ 25 °س.', init: { fam: 'alkane', n: 1 }, check: (p, d) => p.fam === 'alkane' && d.n === 5, why: () => 'البنتان يغلي عند 36.1 °س.' },
      { q: 'اعرض متشكّل البيوتان ذا درجة الغليان الأقل.', hint: 'شغّل التفرّع للبيوتان.', init: { fam: 'alkane', n: 4, iso: false }, check: (p, d) => p.fam === 'alkane' && d.n === 4 && p.iso, why: () => 'أيزو-بيوتان: −11.7 °س.' }
    ],
    tutor: [
      { q: 'ما الصيغة العامة للألكانات؟', k: ['الصيغه العامه', 'CnH2n'], a: (p, d) => C.tutor('كم ذرة H لكل ذرة C في السلسلة، وكم زيادة في الطرفين؟', 'الألكانات CnH₂n₊₂ والألكينات CnH₂n؛ هنا ' + C.sub(d.f) + '.') },
      { q: 'لماذا تزداد درجة الغليان مع عدد ذرات الكربون؟', k: ['الغليان', 'تزداد'], a: () => C.tutor('ماذا يحدث لقوى التجاذب بين الجزيئات عندما تكبر؟', 'الجزيئات الأكبر تتجاذب بقوى أكبر، فتحتاج حرارة أكثر لتنفصل.') },
      { q: 'ما التشكّل؟', k: ['تشكل', 'متشكلات', 'ايزو'], a: () => C.tutor('هل للبيوتان وأيزو-بيوتان الصيغة الجزيئية نفسها؟', 'التشكّل: مركبات لها الصيغة الجزيئية نفسها وتختلف في الصيغة البنائية والخصائص (ص80).') }
    ]
  });

  /* ======================= نشاط (3) فصل مكونات النفط: التقطير التجزيئي ص75–76 ======================= */
  // الجدول (4-1) ص76
  const FR = [
    { name: 'غازات', lo: -200, hi: 20, c: 'C1–C4', use: 'غاز الطبخ والتدفئة' },
    { name: 'إيثر بترولي', lo: 30, hi: 70, c: 'C5–C6', use: 'مذيب عضوي' },
    { name: 'الغازولين', lo: 70, hi: 200, c: 'C6–C12', use: 'مذيب ووقود سيارات' },
    { name: 'الكيروسين', lo: 200, hi: 300, c: 'C12–C16', use: 'وقود طائرات وتدفئة' },
    { name: 'زيت الوقود', lo: 300, hi: 370, c: 'C15–C18', use: 'وقود مصانع ومحطات كهرباء' },
    { name: 'زيوت التشحيم', lo: 400, hi: 9999, c: 'C16–C24', use: 'تزييت' }
  ];
  reg({
    id: 'fractional-distillation', order: 3, lesson: '4-1-2', lessonTitle: 'مصادر الهيدروكربونات', page: 75,
    titleAr: 'فصل مكونات النفط بالتقطير التجزيئي', titleEn: 'Fractional Distillation of Crude Oil',
    tags: 'نفط تقطير تجزيئي برج التقطير مدى الغليان غازولين كيروسين زيت الوقود جدول 4-1 نشاط 3',
    formula: '\\text{تُفصل مكونات النفط حسب درجات غليانها}',
    book: 'نشاط (3) ص75: يوضع النفط في خزان ثم يُدفع إلى وعاء حديد، ويُسخّن إلى نحو 400 °س، وتدخل نواتج التسخين برج التقطير (ارتفاعه 60 متراً)، وتُجمع المكونات كلٌّ في خزان. الجدول (4-1) ص76: أهم نواتج تكرير النفط.',
    summary: 'يُسخّن النفط فتتبخر معظم مكوناته وتصعد في البرج الذي تقل حرارته كلما ارتفعنا؛ فيتكاثف كل مكوّن عند الطبقة التي تساوي حرارتها مدى غليانه. المكونات ذات السلاسل القصيرة تغلي عند درجات منخفضة فتُجمع في أعلى البرج.',
    vars: [['T', 'درجة الحرارة عند طبقة في البرج', '^{\\circ}\\text{س}', '0–450'], ['C_n', 'عدد ذرات الكربون في المكوّن', '—', 'C1 إلى أكثر من C40']],
    assumptions: ['توزيع الحرارة على ارتفاع البرج للتوضيح؛ مدى الغليان وعدد ذرات الكربون من الجدول (4-1).'],
    params: [{ key: 'T', label: 'T\\ (^{\\circ}\\text{س})', min: 0, max: 450, step: 5, value: 150 }],
    compute(p) { const f = FR.find((x) => p.T >= x.lo && p.T <= x.hi) || null; return { f: f }; },
    results(p, d) { return d.f ? [['المكوّن المتكاثف', d.f.name, false, 'pos'], ['مدى الغليان', d.f.hi > 9000 ? 'أكبر من ' + d.f.lo + ' °س' : d.f.lo + ' – ' + d.f.hi + ' °س', false], ['عدد ذرات الكربون', d.f.c, false], ['الاستخدام', d.f.use, false]] : [['المكوّن', 'لا يتكاثف مكوّن رئيس عند هذه الحرارة في الجدول (4-1)', false]]; },
    steps() { return ['يُسخّن النفط إلى نحو 400 °س.', 'تدخل الأبخرة برج التقطير (60 متراً) وتصعد.', 'تقل الحرارة كلما ارتفعنا، فيتكاثف كل مكوّن عند الطبقة المناسبة لمدى غليانه.', 'يُجمع كل مكوّن في خزان.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const tx = W * 0.32, tw = Math.min(110, W * 0.22), top = 30, bot = H - 30;
      ctx.fillStyle = 'rgba(148,163,184,.15)'; ctx.fillRect(tx - tw / 2, top, tw, bot - top); ctx.strokeStyle = cols.axis; ctx.lineWidth = 2; ctx.strokeRect(tx - tw / 2, top, tw, bot - top);
      const Y = (T) => bot - (T / 450) * (bot - top);
      FR.forEach((f, i) => { const y = Y(Math.min(430, (f.lo + Math.min(f.hi, 450)) / 2)); const on = d.f === f; ctx.strokeStyle = on ? cols.c2 : cols.muted; ctx.lineWidth = on ? 4 : 2; ctx.beginPath(); ctx.moveTo(tx - tw / 2, y); ctx.lineTo(tx + tw / 2 + 30, y); ctx.stroke(); D.txt(ctx, f.name + ' (' + f.c + ')', tx + tw / 2 + 36, y, { color: on ? cols.c2 : cols.text, size: n ? 11 : 13, w: on ? '700' : '600', align: 'left' }); });
      const yT = Y(p.T); ctx.fillStyle = cols.c4; ctx.beginPath(); ctx.moveTo(tx - tw / 2 - 18, yT); ctx.lineTo(tx - tw / 2 - 4, yT - 7); ctx.lineTo(tx - tw / 2 - 4, yT + 7); ctx.fill(); D.txt(ctx, p.T + ' °س', tx - tw / 2 - 22, yT, { color: cols.c4, size: 12, w: '700', align: 'right' });
      R.flame(ctx, tx, bot + 24, 26, true); D.txt(ctx, 'نفط ساخن ≈ 400 °س', tx, bot + 14, { color: cols.c2, size: 11.5, w: '700' });
    },
    explain(a, b, da, db) { return a.T !== b.T && db.f ? ['عند ' + b.T + ' °س يتكاثف ' + db.f.name + ' (' + db.f.c + '): ' + db.f.use + '.'] : []; },
    learn: ['**النفط** خليط من الهيدروكربونات، ويُفصل بالتقطير التجزيئي حسب درجات الغليان (ص75).', '**الجدول (4-1):** الغازات (C1–C4) أقل من 20 °س، الإيثر البترولي 30–70، الغازولين 70–200، الكيروسين 200–300، زيت الوقود 300–370، زيوت التشحيم أكبر من 400 °س.', 'السلاسل القصيرة تُجمع في أعلى البرج، والطويلة في أسفله.'],
    challenges: [
      { q: 'اختر الطبقة التي يُجمع منها وقود الطائرات.', hint: 'الكيروسين بين 200 و300 °س.', init: { T: 50 }, check: (p, d) => !!d.f && d.f.name === 'الكيروسين', why: () => 'الكيروسين C12–C16.' },
      { q: 'اختر الطبقة التي يُجمع منها غاز الطبخ.', hint: 'أعلى البرج، أقل من 20 °س.', init: { T: 250 }, check: (p, d) => !!d.f && d.f.name === 'غازات', why: () => 'الغازات C1–C4.' }
    ],
    tutor: [
      { q: 'على أي أساس تُفصل مكونات النفط؟', k: ['اساس', 'تفصل', 'تقطير'], a: () => C.tutor('هل تغلي كل مكونات النفط عند درجة الحرارة نفسها؟', 'تُفصل حسب اختلاف درجات غليانها (التقطير التجزيئي).') },
      { q: 'لماذا تُجمع الغازات في أعلى البرج؟', k: ['اعلى', 'الغازات'], a: () => C.tutor('أين تكون الحرارة أقل في البرج؟', 'درجات غليانها منخفضة جداً فتبقى غازات حتى أعلى البرج حيث الحرارة الأقل.') },
      { q: 'ما علاقة عدد ذرات الكربون بدرجة الغليان؟', k: ['ذرات الكربون', 'علاقه'], a: () => C.tutor('قارن C1–C4 بـ C16–C24 في الجدول.', 'كلما زاد عدد ذرات الكربون ارتفعت درجة الغليان.') }
    ]
  });

  /* ======================= نشاط (14) التمييز بين الألكان والألكين ص91–92 ======================= */
  reg({
    id: 'alkane-alkene-test', order: 4, lesson: '4-3-2', lessonTitle: 'خصائص الألكينات', page: 91,
    titleAr: 'التمييز بين الألكان والألكين بماء البروم', titleEn: 'Distinguishing Alkanes from Alkenes (Bromine Test)',
    tags: 'هكسان هكسين ماء البروم برمنغنات البوتاسيوم اضافة غير مشبع زوال اللون نشاط 14',
    formula: '\\text{C}_6\\text{H}_{12} + \\text{Br}_2 \\rightarrow \\text{C}_6\\text{H}_{12}\\text{Br}_2',
    book: 'نشاط (14) ص91: 5 سم³ هكسان في أنبوب و5 سم³ هكسين في آخر، وبضع قطرات من محلول البروم المخفف، ثم الرجّ. ص92: يمكن استخدام KMnO₄ في وسط قاعدي لتفادي أبخرة البروم الضارة.',
    summary: 'يتفاعل الألكين (غير المشبع) مع البروم بالإضافة على الرابطة الثنائية فيزول اللون الأحمر، أما الألكان (المشبع) فلا يتفاعل في الظلام فيبقى اللون. وبالطريقة نفسها يزول لون برمنغنات البوتاسيوم البنفسجي مع الألكين.',
    vars: [['\\text{المركب}', 'هكسان أو هكسين (5 سم³)', '—', '—'], ['\\text{القطرات}', 'قطرات الكاشف', '\\text{قطرة}', '0–10']],
    assumptions: ['عدد القطرات التي يزول لونها مع الهكسين للتوضيح: ' + C.SIMPLE + '.'],
    params: [
      { key: 'cmp', label: '\\text{المركب}', type: 'select', value: 'hexene', options: [['hexane', 'هكسان C₆H₁₄ (ألكان)'], ['hexene', 'هكسين C₆H₁₂ (ألكين)']] },
      { key: 'reag', label: '\\text{الكاشف}', type: 'select', value: 'Br2', options: [['Br2', 'محلول البروم المخفف'], ['KMnO4', 'KMnO₄ في وسط قاعدي']] },
      { key: 'drops', label: '\\text{القطرات}', min: 0, max: 10, step: 1, value: 0, int: true }
    ],
    compute(p) { const cap = 6; const used = p.cmp === 'hexene' ? Math.min(p.drops, cap) : 0; const left = p.drops - used; return { decol: p.cmp === 'hexene' && p.drops > 0 && left === 0, left: left, used: used }; },
    results(p, d) { return [['المركب', p.cmp === 'hexane' ? 'هكسان (مشبع)' : 'هكسين (غير مشبع)', false], ['المشاهدة', p.drops === 0 ? 'أضف قطرات الكاشف ورجّ' : d.decol ? 'يزول اللون ' + (p.reag === 'Br2' ? 'الأحمر' : 'البنفسجي') : 'يبقى اللون ' + (p.reag === 'Br2' ? 'الأحمر' : 'البنفسجي'), false, p.drops ? (d.decol ? 'pos' : 'neg') : ''], ['التفسير', p.cmp === 'hexene' ? 'إضافة البروم على الرابطة الثنائية' : 'لا رابطة ثنائية: الألكان لا يتفاعل في الظلام', false], ['المعادلة', p.cmp === 'hexene' && p.reag === 'Br2' ? '{{C₆H₁₂ + Br₂ → C₆H₁₂Br₂}}' : '—', false]]; },
    steps() { return ['ضع 5 سم³ هكسان في أنبوب و5 سم³ هكسين في آخر.', 'أضف بضع قطرات من محلول البروم إلى كل منهما ورجّ.', 'فسّر مشاهداتك واكتب المعادلات.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const by = H * 0.74, th = Math.min(220, H * 0.52);
      const col = p.reag === 'Br2' ? [194, 65, 12] : [126, 34, 206];
      [['hexane', 'هكسان'], ['hexene', 'هكسين']].forEach(([k, lab], i) => {
        const on = k === p.cmp; const cx = W * (0.32 + i * 0.36); const remain = on ? (k === 'hexane' ? p.drops : d.left) : 0; const a = Math.min(0.85, remain * 0.14);
        R.tube(ctx, cx, by, 46, th, { level: 0.42, color: 'rgba(' + col.join(',') + ',' + (a || 0.06) + ')', label: lab });
        if (on) { ctx.strokeStyle = cols.c4; ctx.lineWidth = 3; ctx.strokeRect(cx - 30, by - th - 8, 60, th + 14); }
      });
      D.txt(ctx, (p.reag === 'Br2' ? 'محلول البروم' : 'KMnO₄') + ': ' + p.drops + ' قطرة', W / 2, H * 0.1, { color: 'rgb(' + col.join(',') + ')', size: n ? 13 : 15, w: '700' });
      ML.chemEqLine(ctx, W, H * 0.93, 'CH₂=CH–C₄H₉ + Br₂ → CH₂Br–CHBr–C₄H₉', cols, n ? 12 : 15);
    },
    explain(a, b, da, db) { const o = []; if (a.drops !== b.drops || a.cmp !== b.cmp) o.push(db.decol ? 'زال اللون: الهكسين غير مشبع فتُضاف ذرتا البروم على الرابطة الثنائية.' : b.cmp === 'hexane' && b.drops ? 'بقي اللون: الهكسان مشبع لا يتفاعل مع البروم في الظلام.' : b.cmp === 'hexene' && db.left > 0 ? 'استُهلكت الرابطة الثنائية كلها فبدأ اللون يبقى.' : ''); if (a.reag !== b.reag) o.push(b.reag === 'KMnO4' ? 'KMnO₄ في وسط قاعدي بديل يتفادى أبخرة البروم الضارة (ص92).' : 'محلول البروم الأحمر.'); return o.filter(Boolean); },
    learn: ['**الإضافة (ص90):** تُضاف جزيئات مثل Br₂ على الرابطة الثنائية في الألكين فيصبح مشبعاً.', '**الكشف:** يزول اللون الأحمر لمحلول البروم مع الألكين ويبقى مع الألكان.', '**السلامة (ص92):** يمكن استخدام KMnO₄ في وسط قاعدي لتفادي أبخرة البروم الضارة.'],
    challenges: [
      { q: 'أثبت أن الهكسين غير مشبع.', hint: 'أضف قطرات البروم إلى الهكسين.', init: { cmp: 'hexane', drops: 0 }, check: (p, d) => p.cmp === 'hexene' && d.decol, why: () => 'زال لون البروم.' },
      { q: 'بيّن أن الهكسان لا يزيل لون البروم.', hint: 'أضف قطرات إلى الهكسان.', init: { cmp: 'hexene', drops: 0 }, check: (p) => p.cmp === 'hexane' && p.drops >= 3, why: () => 'بقي اللون الأحمر: الهكسان مشبع.' }
    ],
    tutor: [
      { q: 'لماذا يزول لون البروم مع الهكسين؟', k: ['يزول', 'لون', 'هكسين'], a: () => C.tutor('ما الرابطة الموجودة في الهكسين وغير الموجودة في الهكسان؟', 'الرابطة الثنائية C=C تتفاعل بالإضافة مع Br₂ فيُستهلك البروم ويزول لونه.') },
      { q: 'لماذا نستخدم KMnO₄ بدل البروم؟', k: ['برمنغنات', 'KMnO4', 'بديل'], a: () => C.tutor('ما مشكلة البروم؟', 'لتفادي أبخرة البروم الضارة (ص92).') },
      { q: 'ما معادلة التفاعل؟', k: ['معادله'], a: () => C.tutor('كم ذرة بروم تُضاف على الرابطة الثنائية؟', 'C₆H₁₂ + Br₂ → C₆H₁₂Br₂.') }
    ]
  });

  /* ======================= نشاط (15) البلمرة ص93–94 ======================= */
  const MONO = {
    ethene: { name: 'الإيثين (الإيثيلين)', f: 'C2H4', unit: 'CH₂–CH₂', mono: 'CH₂=CH₂', poly: 'البولي إيثيلين' },
    propene: { name: 'البروبين (البروبلين)', f: 'C3H6', unit: 'CH₂–CH(CH₃)', mono: 'CH₂=CH–CH₃', poly: 'البولي بروبلين' },
    vinyl: { name: 'كلوريد الفينيل', f: 'C2H3Cl', unit: 'CH₂–CHCl', mono: 'CH₂=CHCl', poly: 'PVC (بولي كلوريد الفينيل)' },
    tfe: { name: 'رباعي فلورو إيثيلين', f: 'C2F4', unit: 'CF₂–CF₂', mono: 'CF₂=CF₂', poly: 'التفلون' }
  };
  reg({
    id: 'polymerization', order: 5, lesson: '4-3-3', lessonTitle: 'البلمرة', page: 93,
    titleAr: 'البلمرة بالإضافة: من المونومر إلى البوليمر', titleEn: 'Addition Polymerization',
    tags: 'بلمرة مونومر بوليمر بولي ايثيلين بولي بروبلين PVC تفلون كتلة مولية نشاط 15',
    formula: 'n\\,\\text{CH}_2\\text{=CH}_2 \\rightarrow -(\\text{CH}_2\\text{–CH}_2)_n-',
    book: 'نشاط (15) ص93: nCH₂=CH₂ → –(CH₂–CH₂)ₙ–، والبولي بروبلين؛ سؤال ص94: مقطع من PVC ومونومره CH₂=CHCl؛ أسئلة الوحدة: التفلون من رباعي فلورو إيثيلين.',
    summary: 'في البلمرة بالإضافة تنفتح الرابطة الثنائية في كل مونومر فترتبط آلاف الجزيئات الصغيرة في سلسلة طويلة (بوليمر). الكتلة المولية للبوليمر = n × الكتلة المولية للمونومر، ولا ينتج عن التفاعل أي ناتج آخر.',
    vars: [['n', 'عدد وحدات المونومر في السلسلة', '—', '2–5000'], ['M', 'الكتلة المولية للبوليمر = n × M(المونومر)', '\\text{غم/مول}', '—']],
    assumptions: ['يُرسم أول جزء من السلسلة فقط.'],
    params: [
      { key: 'mono', label: '\\text{المونومر}', type: 'select', value: 'ethene', options: Object.keys(MONO).map((k) => [k, MONO[k].name]) },
      { key: 'n', label: 'n', min: 2, max: 5000, step: 1, value: 1000, int: true }
    ],
    compute(p) { const m = MONO[p.mono]; const Mm = C.molarMass(m.f); return { m: m, Mm: Mm, M: Mm * p.n }; },
    live(p, d) { return 'M = n \\times M_{\\text{مونومر}} = ' + p.n + ' \\times ' + d.Mm + ' = ' + r2(d.M, 1); },
    results(p, d) { return [['المونومر', d.m.name + ' {{' + d.m.mono + '}}', false], ['البوليمر', d.m.poly + ' {{–(' + d.m.unit + ')ₙ–}}', false, 'pos'], ['الكتلة المولية للمونومر', d.Mm + ' غم/مول', false], ['الكتلة المولية للبوليمر', r2(d.M, 1) + ' غم/مول', false], ['الحالة', 'المونومر غاز (جزيء صغير)، والبوليمر صلب (جزيء ضخم)', false]]; },
    steps(p, d) { return ['تنفتح الرابطة الثنائية في كل جزيء ' + d.m.mono + '.', 'ترتبط ' + p.n + ' وحدة في سلسلة طويلة.', 'M = ' + p.n + ' × ' + d.Mm + ' = ' + r2(d.M, 1) + ' غم/مول.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const k = Math.min(p.n, n ? 4 : 6); const y = H * 0.42; const w = (W - 60) / (k + 0.6);
      D.txt(ctx, 'مونومرات: ' + d.m.mono, W / 2, H * 0.12, { color: cols.c1, size: n ? 13 : 15, w: '700' });
      for (let i = 0; i < k; i++) { const x = 30 + w * (i + 0.5); ctx.fillStyle = 'rgba(37,99,235,.12)'; D.rr(ctx, x - w * 0.42, y - 30, w * 0.84, 60, 10); ctx.fill(); D.txt(ctx, d.m.unit, x, y, { color: cols.text, size: n ? 11 : 14, w: '700' }); if (i < k - 1) { ctx.strokeStyle = cols.c3; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w * 0.42, y); ctx.lineTo(x + w * 0.58, y); ctx.stroke(); } }
      if (p.n > k) D.txt(ctx, '… (' + p.n + ' وحدة)', 30 + w * (k + 0.2), y, { color: cols.muted, size: 13, w: '700' });
      D.txt(ctx, d.m.poly + ': M = ' + r2(d.M, 1) + ' غم/مول', W / 2, H * 0.7, { color: cols.c3, size: n ? 14 : 17, w: '700' });
      ML.chemEqLine(ctx, W, H * 0.88, 'n ' + d.m.mono + ' → –(' + d.m.unit + ')n–', cols, n ? 14 : 17);
    },
    explain(a, b, da, db) { const o = []; if (a.mono !== b.mono) o.push(db.m.name + ' يعطي ' + db.m.poly + '.'); if (a.n !== b.n) o.push('سلسلة من ' + b.n + ' وحدة كتلتها المولية ' + r2(db.M, 0) + ' غم/مول.'); return o; },
    learn: ['**البلمرة (ص92):** ربط عدد كبير من الجزيئات الصغيرة (المونومرات) لتكوين جزيء ضخم (بوليمر)، مثل بناء جدار من الطوب.', '**البولي إيثيلين:** {{nCH₂=CH₂ → –(CH₂–CH₂)ₙ–}}، والبولي بروبلين بالحرارة والضغط الكبير وعامل مساعد (ص93).', '**بوليمرات طبيعية:** النشا والسليلوز من الجلوكوز، والبروتينات من الأحماض الأمينية (ص94).', '**اقتصاد الذرة (ص96):** في البلمرة بالإضافة كل الذرات تدخل في الناتج.'],
    challenges: [
      { q: 'كوّن بوليمر PVC.', hint: 'مونومره كلوريد الفينيل.', init: { mono: 'ethene' }, check: (p) => p.mono === 'vinyl', why: () => 'PVC: –(CH₂–CHCl)ₙ–.' },
      { q: 'اجعل الكتلة المولية للبولي إيثيلين 28000 غم/مول.', hint: 'M(C₂H₄) = 28، فكم وحدة؟', init: { mono: 'ethene', n: 100 }, check: (p, d) => p.mono === 'ethene' && Math.abs(d.M - 28000) < 1e-6, why: () => 'n = 1000 وحدة.' }
    ],
    tutor: [
      { q: 'ما الفرق بين المونومر والبوليمر؟', k: ['مونومر', 'بوليمر', 'فرق'], a: () => C.tutor('أيهما جزيء صغير وأيهما ضخم؟', 'المونومر جزيء صغير غالباً غاز فيه رابطة ثنائية، والبوليمر جزيء ضخم صلب كتلته المولية كبيرة.') },
      { q: 'لماذا يجب وجود رابطة ثنائية في المونومر؟', k: ['ثنائيه', 'رابطه'], a: () => C.tutor('ماذا يحدث للرابطة الثنائية عند الإضافة؟', 'تنفتح الرابطة الثنائية فتتكوّن رابطتان أحاديتان مع الجزيئات المجاورة.') },
      { q: 'كيف أحسب الكتلة المولية للبوليمر؟', k: ['الكتله الموليه', 'احسب'], a: (p, d) => C.tutor('كم وحدة في السلسلة؟', 'M = n × M(المونومر) = ' + p.n + ' × ' + d.Mm + ' = ' + r2(d.M, 1) + ' غم/مول.') }
    ]
  });

  /* ======================= الكمّادات الساخنة والباردة ص116 (الوحدة الخامسة) ======================= */
  const PACK = { CaCl2: { name: 'كلوريد الكالسيوم (كمّادة ساخنة)', m: 40, dT: 70 }, NH4NO3: { name: 'نترات الأمونيوم (كمّادة باردة)', m: 30, dT: -20 } };
  ML.register({
    subject: S, unit: 5, custom: true,
    id: 'cold-hot-packs', order: 5, lesson: '5-6', lessonTitle: 'الكيمياء والتكنولوجيا والمجتمع: كمّادات طبية', page: 116,
    titleAr: 'الكمّادات الساخنة والباردة', titleEn: 'Instant Hot and Cold Packs',
    tags: 'كمادات ساخنة باردة حرارة الانحلال كلوريد الكالسيوم نترات الامونيوم طارد ماص',
    formula: '\\text{حرارة الانحلال: طاردة (CaCl}_2) \\;|\\; \\text{ماصة (NH}_4\\text{NO}_3)',
    book: 'ص116: إذابة 40 غم CaCl₂ (0.36 مول) في 100 مل ماء ترفع درجة الحرارة من 20 إلى 90 °س، وإذابة 30 غم NH₄NO₃ (0.36 مول) في 100 مل ماء تخفضها من 20 °س إلى الصفر؛ ويستمر مفعول الكمّادة نحو 20 دقيقة.',
    summary: 'الكمّادة الفورية كيس فيه مادة صلبة وجراب ماء؛ عند الضغط ينفجر الجراب فتذوب المادة. انحلال كلوريد الكالسيوم طارد فيرفع الحرارة (كمّادة ساخنة)، وانحلال نترات الأمونيوم ماص فيخفضها (كمّادة باردة).',
    vars: [['m', 'كتلة الملح', '\\text{غم}', '5–60'], ['V', 'حجم الماء', '\\text{مل}', 'الكتاب: 100'], ['\\Delta T', 'التغير في درجة الحرارة', '^{\\circ}\\text{س}', 'الكتاب: +70 و −20']],
    assumptions: ['التغير يتناسب طردياً مع كتلة الملح وعكسياً مع حجم الماء انطلاقاً من قيمتي الكتاب: ' + C.SIMPLE + '.'],
    params: [
      { key: 'salt', label: '\\text{الملح}', type: 'select', value: 'CaCl2', options: Object.keys(PACK).map((k) => [k, PACK[k].name]) },
      { key: 'm', label: 'm\\ \\text{(غم)}', min: 5, max: 60, step: 5, value: 40 },
      { key: 'V', label: 'V\\ \\text{(مل)}', min: 50, max: 200, step: 10, value: 100 },
      { key: 'press', label: '\\text{الضغط على الكيس}', type: 'toggle', value: false, on: 'انفجر جراب الماء', off: 'لم يُضغط' }
    ],
    onSet(p, k) { if (k === 'salt') p.m = PACK[p.salt].m; },
    compute(p) { const P = PACK[p.salt]; const raw = P.dT * (p.m / P.m) * (100 / p.V); const T = Math.max(-10, Math.min(100, 20 + raw)); return { P: P, n: p.m / C.molarMass(p.salt), dT: p.press ? T - 20 : 0, T: p.press ? T : 20 }; },
    live(p, d) { return '\\Delta T = ' + r2(d.dT, 1) + '\\ ^{\\circ}\\text{س}'; },
    results(p, d) { return [['الملح', d.P.name, false], ['عدد المولات', r2(d.n, 3) + ' مول', false], ['درجة الحرارة النهائية', p.press ? r2(d.T, 1) + ' °س' : '20 °س (اضغط الكيس)', false, p.press ? (d.dT > 0 ? 'pos' : 'neg') : ''], ['نوع الانحلال', p.salt === 'CaCl2' ? 'طارد للحرارة' : 'ماص للحرارة', false], ['مدة المفعول', 'نحو 20 دقيقة', false], ['المعادلة', p.salt === 'CaCl2' ? '{{CaCl₂(s) + H₂O(l) → CaCl₂·6H₂O(aq)}} + حرارة' : '{{NH₄NO₃(s) + H₂O(l)}} + حرارة {{→ NH₄NO₃(aq)}}', false]]; },
    steps(p, d) { return ['الكتاب: 40 غم CaCl₂ في 100 مل: 20 → 90 °س، و30 غم NH₄NO₃ في 100 مل: 20 → 0 °س.', 'هنا: ' + p.m + ' غم في ' + p.V + ' مل ← ΔT ≈ ' + r2(d.P.dT * (p.m / d.P.m) * (100 / p.V), 1) + ' °س.', 'اختر نوع المادة وكميتها حسب الكمّادة المطلوبة.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.4, cy = H * 0.48, w = Math.min(220, W * 0.42), h = Math.min(170, H * 0.42);
      ctx.fillStyle = d.T > 20.5 ? 'rgba(249,115,22,' + Math.min(0.6, 0.1 + (d.T - 20) / 120) + ')' : d.T < 19.5 ? 'rgba(56,189,248,' + Math.min(0.6, 0.15 + (20 - d.T) / 40) + ')' : 'rgba(226,232,240,.7)';
      D.rr(ctx, cx - w / 2, cy - h / 2, w, h, 24); ctx.fill(); ctx.strokeStyle = cols.muted; ctx.lineWidth = 2; ctx.stroke();
      if (!p.press) { ctx.fillStyle = 'rgba(96,165,250,.45)'; D.rr(ctx, cx - w * 0.3, cy - h * 0.25, w * 0.6, h * 0.35, 14); ctx.fill(); D.txt(ctx, 'جراب ماء', cx, cy - h * 0.08, { color: cols.text, size: 12, w: '700' }); }
      for (let i = 0; i < 18; i++) { ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - w * 0.38 + (i % 9) * w * 0.09, cy + h * 0.22 + Math.floor(i / 9) * 8, p.press ? 3 : 6, p.press ? 3 : 6); }
      R.thermo(ctx, cx + w / 2 + 50, cy - h / 2, h, d.T, -10, 100, cols);
      D.txt(ctx, p.press ? (d.dT > 0 ? 'ساخنة' : 'باردة') + ': ' + r2(d.T, 1) + ' °س' : 'اضغط الكيس', cx, cy + h / 2 + 22, { color: cols.text, size: n ? 13 : 16, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.press !== b.press && b.press) o.push(b.salt === 'CaCl2' ? 'انحلال CaCl₂ طارد: ارتفعت الحرارة إلى ' + r2(db.T, 1) + ' °س.' : 'انحلال NH₄NO₃ ماص: انخفضت الحرارة إلى ' + r2(db.T, 1) + ' °س.'); if ((a.m !== b.m || a.V !== b.V) && b.press) o.push('ملح أكثر أو ماء أقل يعني تغيراً أكبر في درجة الحرارة.'); return o; },
    learn: ['**حرارة الانحلال (ص116):** انحلال بعض المواد في الماء طارد للحرارة وبعضها ماص.', '**الكمّادة الساخنة:** كلوريد الكالسيوم أو كبريتات المغنيسيوم. **الباردة:** نترات الأمونيوم.', 'يُصمم المصنع الكمّادة باختيار نوع المادة الصلبة وكميتها.'],
    challenges: [
      { q: 'أعد نتيجة الكتاب للكمّادة الساخنة: من 20 إلى 90 °س.', hint: '40 غم CaCl₂ في 100 مل ماء.', init: { salt: 'CaCl2', m: 20, V: 150, press: false }, check: (p, d) => p.press && Math.abs(d.T - 90) < 0.5, why: () => '40 غم = 0.36 مول ترفع الحرارة 70 °س.' },
      { q: 'حضّر كمّادة باردة تصل إلى 0 °س كما في الكتاب.', hint: '30 غم NH₄NO₃ في 100 مل ماء.', init: { salt: 'CaCl2', m: 40, V: 100, press: false }, check: (p, d) => p.salt === 'NH4NO3' && p.press && Math.abs(d.T) < 0.5, why: () => 'انحلال نترات الأمونيوم ماص للحرارة.' }
    ],
    tutor: [
      { q: 'لماذا تسخن كمّادة كلوريد الكالسيوم؟', k: ['تسخن', 'ساخنه', 'كلوريد'], a: () => C.tutor('هل انحلال CaCl₂ يطلق حرارة أم يمتصها؟', 'انحلاله في الماء طارد للحرارة.') },
      { q: 'لماذا تبرد كمّادة نترات الأمونيوم؟', k: ['تبرد', 'بارده', 'نترات'], a: () => C.tutor('من أين يأخذ الانحلال الماص الطاقة؟', 'انحلالها ماص للحرارة فيمتص الطاقة من الماء فتنخفض حرارته.') },
      { q: 'كم يستمر مفعول الكمّادة؟', k: ['يستمر', 'مده', 'مفعول'], a: () => C.tutor('ابحث في نص الكتاب ص116.', 'نحو 20 دقيقة.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
