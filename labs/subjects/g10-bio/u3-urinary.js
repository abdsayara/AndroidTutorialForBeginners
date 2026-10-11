/* العلوم الحياتية — الوحدة الثالثة، الفصل الثالث: الجهاز البولي (ص 84–93) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 8;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;

  const PARTS = {
    kidney: ['الكليتان', 'في الجهة الظهرية من تجويف البطن على جانبي العمود الفقري، مدفونتان في أنسجة شحمية؛ وغالباً ما تكون الكلية اليسرى أعلى قليلاً من اليمنى.'],
    ureter: ['الحالبان', 'أنبوب رفيع يوصل البول من حوض الكلية إلى المثانة.'],
    bladder: ['المثانة', 'كيس عضلي قابل للتمدد يستقبل البول من الكليتين بواسطة الحالبين ويحتفظ به مؤقتاً إلى حين تفريغه.'],
    urethra: ['قناة مجرى البول', 'يخرج عبرها البول إلى خارج الجسم.'],
    artery: ['الشريان الكلوي', 'يرد عن طريقه الدم المحمل بالفضلات إلى الكلية.'],
    vein: ['الوريد الكلوي', 'يغادر عن طريقه الدم الكلية بعد تنقيته من الفضلات.'],
    adrenal: ['الغدة الكظرية (فوق الكلوية)', 'توجد أعلى كل كلية، وتفرز هرمونات بعضها له علاقة بتكوين البول.'],
    aorta: ['الأورطي', 'يتفرع منه الشريان الكلوي (الشكل 1).'],
    vena: ['الوريد الأجوف السفلي', 'يصب فيه الوريد الكلوي (الشكل 1).'],
    cortex: ['القشرة', 'المنطقة الخارجية، داكنة اللون لاحتوائها أوعية دموية كثيرة.'],
    medulla: ['النخاع', 'منطقة داخلية سميكة تتكون من تراكيب مخروطية الشكل تسمى أهرامات الكلية.'],
    pyramid: ['أهرامات الكلية', 'تحتوي على أنابيب صغيرة تسمى وحدات أنبوبية كلوية تصب في حوض الكلية.'],
    pelvis: ['حوض الكلية', 'يتصل بالحالب.'],
    capsule: ['محفظة بومان', 'توجد في منطقة القشرة، كيس مزدوج الجدران يحصر مجموعة كبيرة من الشعيرات الدموية (الكبة) بين الشريين الوارد والصادر.'],
    glom: ['الكبة', 'مجموعة كبيرة من الشعيرات الدموية داخل محفظة بومان.'],
    aff: ['الشريين الوارد', 'يجلب الدم إلى المحفظة.'],
    eff: ['الشريين الصادر', 'يحمل الدم بعيداً عن المحفظة.'],
    pct: ['الأنبوب الملتوي القريب', 'أنبوب كثير الالتواء متصل مع محفظة بومان.'],
    loop: ['التواء هنلي', 'انحناء رفيع جداً على شكل حرف U.'],
    dct: ['الأنبوب الملتوي البعيد', 'تفصل خلايا جداره أيونات الهيدروجين والبوتاسيوم عن الدم وتضيفها إلى البول (الإفراز الأنبوبي).'],
    duct: ['الأنبوب الجامع', 'أنبوب واسع تصب فيه أكثر من وحدة أنبوبية كلوية، ويفتح بالقرب من أهرامات الكلية في حوض الكلية.']
  };
  const STEPS = [
    ['الترشيح', 'عند وصول الدم إلى الكبة داخل محفظة بومان يرشح سائل يحتوي مواد ضارة ونافعة ويخلو نسبياً من البروتينات؛ يساعد في ذلك ضغط الدم العالي في شعيرات الكبة ونفاذيتها العالية.'],
    ['إعادة الامتصاص', 'تتم إعادة امتصاص 99% من السائل الراشح الغني بالمواد النافعة مثل الغلوكوز من خلال خلايا جدر الأنابيب، والباقي (1%) يخرج على هيئة بول.'],
    ['الإفراز الأنبوبي', 'بعض المواد لا ترشح من الكبة مثل أيونات الهيدروجين والبوتاسيوم؛ تسير في الشريين الصادر حتى الأنبوب الملتوي البعيد فتفصلها خلايا جداره عن الدم وتضيفها إلى البول.']
  ];
  // مسار النفرون بإحداثيات نسبية (0–1)
  const NP = { cap: [0.78, 0.2], pct: [[0.7, 0.2], [0.62, 0.12], [0.55, 0.24], [0.6, 0.32]], loopDown: [0.55, 0.85], loopUp: [0.45, 0.85], dct: [[0.45, 0.32], [0.38, 0.22], [0.3, 0.3], [0.33, 0.4]], duct: [[0.22, 0.12], [0.22, 0.92]] };
  // مسار جسيم يتحرك داخل الأنبوب (t من 0 إلى 1)
  const tubePts = () => [NP.cap, ...NP.pct, [0.55, 0.5], NP.loopDown, NP.loopUp, [0.45, 0.5], ...NP.dct, [0.22, 0.4], NP.duct[1]];
  function along(pts, f) { f = Math.min(0.999999, Math.max(0, f || 0)); const n = pts.length - 1; const i = Math.min(n - 1, Math.floor(f * n)); const u = f * n - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; }
  const SUBST = [
    { k: 'water', name: 'ماء', col: '#38bdf8', filt: true, reab: 0.99 },
    { k: 'glu', name: 'غلوكوز', col: '#22c55e', filt: true, reab: 1 },
    { k: 'urea', name: 'بولينا', col: '#eab308', filt: true, reab: 0 },
    { k: 'prot', name: 'بروتينات كبيرة', col: '#a855f7', filt: false },
    { k: 'h', name: 'أيونات H و K', col: '#ef4444', filt: false, secr: true }
  ];

  reg({
    id: 'urinary-nephron', order: 1, lesson: '1-3 / 2-3 / 3-3', lessonTitle: 'تركيب الجهاز البولي والنفرون وخطوات تكوين البول', page: 85,
    titleAr: 'الجهاز البولي والنفرون وخطوات تكوين البول', titleEn: 'The Urinary System, the Nephron and Urine Formation', tags: 'جهاز بولي كليه نفرون وحده انبوبيه محفظه بومان كبه التواء هنلي ترشيح اعاده امتصاص افراز انبوبي حالب مثانه',
    formula: '\\text{الترشيح} \\to \\text{إعادة الامتصاص } (99\\%) \\to \\text{الإفراز الأنبوبي}',
    book: 'الشكل (1) ص 85: تركيب الجهاز البولي؛ الشكل (2): مقطع طولي في الكلية؛ الشكل (3) ص 87: الوحدة الأنبوبية الكلوية (حوالي 1.3 مليون في كل كلية)؛ خطوات تكوين البول الثلاث ص 88.',
    summary: 'انتقل من الجهاز البولي كاملاً إلى مقطع الكلية ثم إلى الوحدة الأنبوبية الكلوية (النفرون)، واضغط على أي جزء لمعرفة وظيفته. في النفرون اختر خطوة تكوين البول وشغّل لترى حركة المواد: ما يُرشح، وما يُعاد امتصاصه، وما يُفرز.',
    vars: [['\\text{إعادة الامتصاص}', 'من السائل الراشح (ص 88)', '\\%', '99'], ['\\text{البول}', 'ما يتبقى من السائل الراشح (ص 88)', '\\%', '1'], ['\\text{عدد النفرونات}', 'في كل كلية تقريباً (ص 87)', '\\text{نفرون}', '1.3 مليون']],
    assumptions: ['حركة الجسيمات ونسب ألوانها نموذج مبسّط لأغراض التعليم؛ النسبتان 99% و 1% من الكتاب.'],
    params: [
      { key: 'view', label: '\\text{المستوى}', type: 'stage', stages: ['الجهاز البولي (الشكل 1)', 'مقطع طولي في الكلية (الشكل 2)', 'الوحدة الأنبوبية الكلوية (الشكل 3)'], value: 0 },
      { key: 'step', label: '\\text{خطوة تكوين البول}', type: 'select', options: STEPS.map((s, i) => [i, s[0]]), value: 0, hidden: (p) => p.view !== 2 }
    ],
    play: { mode: 'time', speed: 1 }, initState: () => ({ t: 0, sel: null }), tick(st, p, d, dt) { st.t += dt; },
    resetOn: ['view'],
    randomize(p) { return { view: 2, step: Math.floor(Math.random() * 3) }; },
    canvasHint: 'اضغط على أي جزء لمعرفة اسمه ووظيفته. في مستوى النفرون اضغط «تشغيل» لترى حركة المواد.',
    compute(p) { return { step: STEPS[p.step] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const st = d.st || {}; const sel = st.sel; const t = st.t || 0; const hits = d.hits;
      const col = (id, b) => (sel === id ? '#fbbf24' : b);
      const lab = (id, x, y, al) => D.txt(ctx, PARTS[id][0], x, y, { color: sel === id ? '#d97706' : c.text, size: nar ? 10 : 12, w: '800', align: al || 'center', halo: c.bg });
      if (p.view === 0) {
        const cx = W / 2, s = Math.min(W / 420, H / 380), X = (v) => cx + v * s, Y = (v) => 20 + v * s;
        ctx.strokeStyle = col('aorta', '#dc2626'); ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.moveTo(X(-14), Y(0)); ctx.lineTo(X(-14), Y(330)); ctx.stroke(); hits.push({ id: 'aorta', x: X(-20), y: Y(200), w: 12 * s, h: 100 * s });
        ctx.strokeStyle = col('vena', '#2563eb'); ctx.lineWidth = 14 * s; ctx.beginPath(); ctx.moveTo(X(14), Y(0)); ctx.lineTo(X(14), Y(330)); ctx.stroke(); hits.push({ id: 'vena', x: X(8), y: Y(200), w: 14 * s, h: 100 * s });
        [[-1, 95], [1, 110]].forEach((q) => {
          const sg = q[0], ky = q[1]; ctx.save(); ctx.translate(X(sg * 110), Y(ky)); ctx.beginPath(); ctx.ellipse(0, 0, 42 * s, 62 * s, 0, 0, 7); ctx.fillStyle = col('kidney', '#b45309'); ctx.fill(); ctx.restore();
          hits.push({ id: 'kidney', cx: X(sg * 120), cy: Y(ky), r: 36 * s });
          B.blob(ctx, X(sg * 112), Y(ky - 62), 26 * s, 12 * s, col('adrenal', '#fde047'), '#a16207', 1.5); hits.push({ id: 'adrenal', cx: X(sg * 112), cy: Y(ky - 62), r: 14 * s });
          ctx.strokeStyle = col('artery', '#dc2626'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(X(-14), Y(ky - 6)); ctx.lineTo(X(sg * 72), Y(ky - 6)); ctx.stroke(); hits.push({ id: 'artery', x: Math.min(X(-14), X(sg * 72)), y: Y(ky - 12), w: Math.abs(X(sg * 72) - X(-14)), h: 10 * s });
          ctx.strokeStyle = col('vein', '#2563eb'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(X(14), Y(ky + 10)); ctx.lineTo(X(sg * 72), Y(ky + 10)); ctx.stroke(); hits.push({ id: 'vein', x: Math.min(X(14), X(sg * 72)), y: Y(ky + 5), w: Math.abs(X(sg * 72) - X(14)), h: 10 * s });
          ctx.strokeStyle = col('ureter', '#ca8a04'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(X(sg * 85), Y(ky + 35)); ctx.quadraticCurveTo(X(sg * 80), Y(240), X(sg * 30), Y(285)); ctx.stroke(); hits.push({ id: 'ureter', cx: X(sg * 75), cy: Y(210), r: 14 * s });
        });
        B.blob(ctx, X(0), Y(300), 52 * s, 36 * s, col('bladder', 'rgba(253,224,71,.85)'), '#a16207', 2); hits.push({ id: 'bladder', cx: X(0), cy: Y(300), r: 38 * s });
        ctx.strokeStyle = col('urethra', '#ca8a04'); ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(X(0), Y(336)); ctx.lineTo(X(0), Y(370)); ctx.stroke(); hits.push({ id: 'urethra', x: X(-8), y: Y(336), w: 16 * s, h: 34 * s });
        lab('kidney', X(-190), Y(95), 'right'); lab('adrenal', X(-170), Y(30), 'right'); lab('artery', X(-60), Y(70)); lab('vein', X(60), Y(140)); lab('ureter', X(-150), Y(220), 'right'); lab('bladder', X(80), Y(300), 'left'); lab('urethra', X(20), Y(365), 'left'); lab('aorta', X(-30), Y(190), 'right'); lab('vena', X(30), Y(190), 'left');
        D.txt(ctx, 'الكلية اليمنى', X(-110), Y(185), { color: c.muted, size: 10 }); D.txt(ctx, 'الكلية اليسرى', X(110), Y(195), { color: c.muted, size: 10 });
      } else if (p.view === 1) {
        const cx = W / 2, cy = H / 2, R = Math.min(W * 0.3, H * 0.4);
        ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); ctx.ellipse(0, 0, R * 0.75, R, 0, 0, 7); ctx.fillStyle = col('cortex', '#92400e'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#451a03'; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 0, R * 0.6, R * 0.85, 0, 0, 7); ctx.fillStyle = col('medulla', '#d97706'); ctx.fill();
        const ep = (a, f) => [Math.cos(a) * f * R * 0.6, Math.sin(a) * f * R * 0.85];
        for (let i = 0; i < 6; i++) { const a = 2.0 + i * 0.46; const q1 = ep(a - 0.17, 0.93), q2 = ep(a + 0.17, 0.93), q3 = ep(a, 0.42); ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.quadraticCurveTo(ep(a, 1.0)[0], ep(a, 1.0)[1], q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]); ctx.closePath(); ctx.fillStyle = col('pyramid', '#b45309'); ctx.fill(); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.beginPath(); ctx.ellipse(R * 0.15, 0, R * 0.22, R * 0.35, 0, 0, 7); ctx.fillStyle = col('pelvis', '#fde68a'); ctx.fill();
        ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(R * 0.3, R * 0.2); ctx.quadraticCurveTo(R * 0.7, R * 0.6, R * 0.7, R * 1.1); ctx.stroke();
        ctx.restore();
        hits.push({ id: 'cortex', cx: cx, cy: cy - R * 0.92, r: R * 0.1 }, { id: 'medulla', cx: cx, cy: cy - R * 0.7, r: R * 0.1 }, { id: 'pyramid', cx: cx - R * 0.38, cy: cy, r: R * 0.12 }, { id: 'pelvis', cx: cx + R * 0.15, cy: cy, r: R * 0.18 }, { id: 'ureter', cx: cx + R * 0.68, cy: cy + R * 0.9, r: R * 0.12 });
        lab('cortex', cx - R * 0.85, cy - R * 0.85, 'right'); lab('medulla', cx - R * 0.85, cy - R * 0.5, 'right'); lab('pyramid', cx - R * 0.85, cy, 'right'); lab('pelvis', cx + R * 0.85, cy - R * 0.1, 'left'); lab('ureter', cx + R * 0.85, cy + R * 0.9, 'left');
      } else {
        const x0 = 16, w = W - 32, y0 = 30, h = H - 90; const P = (q) => [x0 + q[0] * w, y0 + q[1] * h];
        // الأوعية: الشريين الوارد والصادر
        const cap = P(NP.cap); ctx.strokeStyle = col('aff', '#dc2626'); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cap[0] + w * 0.2, cap[1] - 10); ctx.lineTo(cap[0] + 14, cap[1] - 6); ctx.stroke(); hits.push({ id: 'aff', x: cap[0] + 20, y: cap[1] - 18, w: w * 0.18, h: 16 }); lab('aff', cap[0] + w * 0.12, cap[1] - 26);
        ctx.strokeStyle = col('eff', '#9333ea'); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cap[0] + 14, cap[1] + 8); ctx.quadraticCurveTo(cap[0] + w * 0.12, cap[1] + h * 0.25, P([0.38, 0.5])[0], P([0.38, 0.5])[1]); ctx.lineTo(P([0.35, 0.36])[0], P([0.35, 0.36])[1]); ctx.stroke(); hits.push({ id: 'eff', cx: cap[0] + w * 0.08, cy: cap[1] + h * 0.18, r: 14 }); lab('eff', cap[0] + w * 0.12, cap[1] + h * 0.24);
        // الأنبوب
        const tube = (pts, id, colr, wd) => { ctx.strokeStyle = col(id, colr); ctx.lineWidth = wd || 12; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); pts.map(P).forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); };
        tube([NP.cap, ...NP.pct], 'pct', '#fdba74'); tube([NP.pct[3], [0.55, 0.5], NP.loopDown, NP.loopUp, [0.45, 0.5], NP.dct[0]], 'loop', '#fcd34d', 8); tube(NP.dct, 'dct', '#86efac'); tube([NP.dct[3], [0.22, 0.4]], 'dct', '#86efac'); tube(NP.duct, 'duct', '#93c5fd', 16);
        hits.push({ id: 'pct', cx: P([0.6, 0.18])[0], cy: P([0.6, 0.18])[1], r: 22 }, { id: 'loop', cx: P([0.5, 0.8])[0], cy: P([0.5, 0.8])[1], r: 24 }, { id: 'dct', cx: P([0.36, 0.3])[0], cy: P([0.36, 0.3])[1], r: 22 }, { id: 'duct', x: P([0.2, 0])[0], y: P([0, 0.5])[1], w: 22, h: h * 0.4 });
        B.blob(ctx, cap[0], cap[1], 30, 30, col('capsule', 'rgba(254,215,170,.9)'), '#c2410c', 3); hits.push({ id: 'capsule', cx: cap[0] - 18, cy: cap[1] + 18, r: 12 });
        ctx.strokeStyle = col('glom', '#dc2626'); ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(cap[0] + (i % 2 ? 5 : -5), cap[1] + (i < 2 ? -5 : 5), 9, 0, 7); ctx.stroke(); } hits.push({ id: 'glom', cx: cap[0], cy: cap[1], r: 12 });
        lab('capsule', cap[0], cap[1] + 44); lab('glom', cap[0] + 46, cap[1] + 4, 'left'); lab('pct', P([0.62, 0.06])[0], P([0.62, 0.06])[1]); lab('loop', P([0.5, 0.95])[0], P([0.5, 0.95])[1]); lab('dct', P([0.36, 0.48])[0], P([0.36, 0.48])[1]); lab('duct', P([0.22, 0.98])[0] + 30, P([0.22, 0.98])[1], 'left');
        // الجسيمات
        const pts = tubePts();
        SUBST.forEach((sb, si) => {
          for (let j = 0; j < 4; j++) {
            const f = ((t * 0.12 + j / 4 + si * 0.07) % 1);
            if (sb.k === 'prot') { const q = P([0.78 + 0.05 * Math.cos(t + j), 0.2 + 0.05 * Math.sin(t * 1.3 + j)]); const q2 = [cap[0] + w * 0.2 - f * w * 0.18, cap[1] - 10]; const pq = p.step === 0 ? q2 : q; B.blob(ctx, pq[0], pq[1] + (p.step === 0 ? 0 : -40), 4, 4, sb.col); continue; }
            if (sb.secr) { if (p.step === 2) { const a = P([0.35, 0.36]), b = P(NP.dct[1]); const u = f; B.blob(ctx, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 4, 4, sb.col); } else if (f > 0.62) { const q = P(along(pts, f)); B.blob(ctx, q[0], q[1], 4, 4, sb.col); } continue; }
            const back = sb.reab > 0 && j < Math.round(sb.reab * 4) && f > 0.15 && f < 0.6; const q = P(along(pts, f));
            if (back && p.step >= 1) { B.blob(ctx, q[0], q[1] - 18 * ((f - 0.15) / 0.45), 4, 4, sb.col); } else if (!back || p.step === 0) B.blob(ctx, q[0], q[1], 4, 4, sb.col);
          }
        });
        // مفتاح
        const ky = H - 50; SUBST.forEach((sb, i) => { const x = W - 16 - i * (nar ? (W - 32) / 5 : 120); B.blob(ctx, x - 6, ky, 5, 5, sb.col); D.txt(ctx, sb.name, x - 14, ky, { color: c.text, size: nar ? 9 : 11, w: '700', align: 'right' }); });
        B.para(ctx, D, (p.step + 1) + '. ' + STEPS[p.step][0] + ': ' + STEPS[p.step][1], W / 2, H - 10, W - 30, { color: c.text, size: nar ? 10.5 : 12.5, w: '700', bottom: true });
      }
      if (sel && PARTS[sel] && p.view !== 2) B.para(ctx, D, PARTS[sel][0] + ': ' + PARTS[sel][1], W / 2, H - 10, W - 30, { color: c.text, size: nar ? 11 : 13, w: '700', bottom: true });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h || !PARTS[h.id]) return false; st.sel = h.id; api.say(['**' + PARTS[h.id][0] + ':** ' + PARTS[h.id][1]]); return true; },
    live(p, d) { return p.view === 2 ? '\\text{' + d.step[0] + '}' : '\\text{' + ['الجهاز البولي', 'مقطع طولي في الكلية'][p.view] + '}'; },
    results(p, d) {
      const sel = d.st && d.st.sel;
      return [['المستوى', ['الجهاز البولي', 'مقطع طولي في الكلية', 'الوحدة الأنبوبية الكلوية'][p.view], false]].concat(sel ? [['الجزء المختار', PARTS[sel][0] + ': ' + PARTS[sel][1], false]] : [])
        .concat(p.view === 2 ? [['الخطوة', d.step[0], false], ['ماذا يحدث', d.step[1], false], ['يُعاد امتصاصه', '99\\%\\ \\text{من السائل الراشح}'], ['يخرج بولاً', '1\\%\\ \\text{من السائل الراشح}'], ['لا يرشح من الكبة', 'البروتينات كبيرة الحجم، وأيونات الهيدروجين والبوتاسيوم', false]] : [['عدد النفرونات في الكلية', 'حوالي 1.3 مليون (ص 87)', false]]);
    },
    steps() { return STEPS.map((s, i) => (i + 1) + ') ' + s[0] + ': ' + s[1]).concat(['الفضلات النيتروجينية (ص 89): يحطم الكبد الحموض الأمينية الزائدة بخطوتين: نزع مجموعة الأمين لتكوين الأمونيا، ثم تحويل الأمونيا إلى بولينا (أقل سمية) تنقلها الدم إلى الكلية.']); },
    explain(a, b) {
      if (a.view !== b.view) return [['الجهاز البولي: كليتان، حالبان، مثانة، قناة مجرى البول.', 'مقطع الكلية: قشرة خارجية داكنة، ونخاع داخلي فيه أهرامات الكلية، وحوض الكلية المتصل بالحالب.', 'النفرون وحدة التركيب والوظيفة في الكلية: محفظة بومان، الأنبوب الملتوي القريب، التواء هنلي، الأنبوب الملتوي البعيد، ثم الأنبوب الجامع.'][b.view]];
      if (a.step !== b.step) return ['**' + STEPS[b.step][0] + ':** ' + STEPS[b.step][1]];
      return [];
    },
    learn: ['**تركيب الجهاز البولي (ص 85–86):** الكليتان، الحالبان، المثانة، قناة مجرى البول؛ يرد الدم بالشريان الكلوي ويغادر بالوريد الكلوي.', '**النفرون (ص 87):** وحدة التركيب والوظيفة في الكلية، حوالي 1.3 مليون في كل كلية.', '**خطوات تكوين البول (ص 88):** ' + STEPS.map((s) => s[0]).join(' ← ') + '.', '**الفضلات النيتروجينية (ص 89):** الأمونيا ← البولينا في الكبد؛ وحمض البوليك من أيض مواد نيتروجينية تدخل في تركيب DNA.', '**مشكلات صحية (ص 90):** الفشل الكلوي (ويعالج بغسيل الكلى)، وحصى الكلية (أملاح الكالسيوم سبب رئيس).'],
    challenges: [
      { q: 'س4 (ص 93): اضغط على **الكيس المزدوج الجدران** الذي يوجد داخله شبكة كثيفة من الشعيرات الدموية.', hint: 'انتقل إلى مستوى النفرون، ثم اضغط على الكيس عند بداية الأنبوب.', init: { view: 0 }, check: (p, d) => p.view === 2 && d.st && d.st.sel === 'capsule' },
      { q: 'س3 (ص 93): اضغط على **الانحناء الرفيع على شكل حرف U**.', hint: 'في مستوى النفرون، أسفل الرسم.', init: { view: 0 }, check: (p, d) => p.view === 2 && d.st && d.st.sel === 'loop' },
      { q: 'اختر الخطوة التي تُضاف فيها **أيونات الهيدروجين** إلى البول رغم أنها لا ترشح من الكبة.', hint: 'الإفراز الأنبوبي.', init: { view: 2, step: 0 }, check: (p) => p.view === 2 && p.step === 2 },
      { q: 'في مقطع الكلية اضغط على الجزء الذي **يتصل بالحالب**.', hint: 'حوض الكلية.', init: { view: 0 }, check: (p, d) => p.view === 1 && d.st && d.st.sel === 'pelvis' }
    ],
    tutor: [
      { q: 'لماذا كمية البول أقل بكثير من السائل الراشح؟', k: ['كميه', 'البول', 'اقل'], a: () => 'لأن 99% من السائل الراشح يُعاد امتصاصه في الأنابيب، والباقي (1%) فقط يخرج بولاً (ص 88).' },
      { q: 'لماذا يخلو الراشح من البروتينات؟', k: ['بروتين', 'يخلو'], a: () => 'لأن البروتينات كبيرة الحجم لا ترشح من شعيرات الكبة إلى تجويف محفظة بومان (س2 ص 93)؛ لذلك يكون تركيزها في الشريين الصادر أعلى منه في الوارد.' },
      { q: 'كيف تصل أيونات الهيدروجين إلى البول؟', k: ['هيدروجين', 'بوتاسيوم', 'ايونات'], a: () => STEPS[2][1] }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
