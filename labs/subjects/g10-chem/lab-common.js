/* الكيمياء — أدوات مشتركة لتجارب المختبر ثلاثي الأبعاد:
 * - أوضاع العمل
 * - أدوات الوقاية والأدوات العامة في المشهد
 * - لوحة المستوى الجزيئي (ماكروسكوبي ↔ جزيئي ↔ رمزي)
 */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw;
  const K = ML.chemLab = {};
  K.BENCH = 0.9;
  K.MODES = [['guided', 'موجّه (Guided)'], ['semi', 'شبه موجّه (Semi-Guided)'], ['free', 'مختبر حر (Free Lab)']];
  K.MODE_AR = { guided: 'الوضع الموجّه', semi: 'الوضع شبه الموجّه', free: 'المختبر الحر' };
  K.modeParam = () => ({ key: 'mode', label: '\\text{وضع العمل}', type: 'select', value: 'guided', desc: 'موجّه: خطوة بخطوة • شبه موجّه: الهدف وتلميحات • حر: كل الأدوات', options: K.MODES });
  K.g2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  K.f1 = (v) => String(Math.round(v * 10) / 10);
  K.neg = (v) => (v < 0 ? '−' + Math.abs(v) : String(v));
  // صيغة علمية بأس مرفوع: 3.1×10²¹
  K.sci = (v, k) => { if (!(v > 0)) return '0'; const e = Math.floor(Math.log10(v)); const m = v / Math.pow(10, e); const sup = String(e).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])).join(''); return (Math.round(m * Math.pow(10, k || 2)) / Math.pow(10, k || 2)) + '×10' + sup; };

  /* ---------- أدوات الوقاية والأدوات العامة ---------- */
  K.commonObjects = () => [
    { id: 'goggles', kind: 'goggles' }, { id: 'coat', kind: 'coat' }, { id: 'gloves', kind: 'gloves' },
    { id: 'flask', kind: 'flask' }, { id: 'tubes', kind: 'tubes' }, { id: 'burette', kind: 'burette' },
    { id: 'pipette', kind: 'pipette' }, { id: 'dropper', kind: 'dropper' }, { id: 'bunsen', kind: 'bunsen' }, { id: 'spatula', kind: 'spatula' }
  ];
  K.commonState = (st) => {
    const b = K.BENCH;
    return {
      goggles: { pos: [-1.86, 1.62, -0.49], visible: !st.ppe.goggles }, gloves: { pos: [-1.57, 1.52, -0.49], visible: !st.ppe.gloves }, coat: { pos: [-2.4, 1.85, -0.47], visible: !st.ppe.coat },
      flask: { pos: [-1.45, b, -0.2] }, tubes: { pos: [-1.12, b, -0.32] }, burette: { pos: [1.0, b, -0.3] },
      pipette: { pos: [-1.38, b, 0.32] }, dropper: { pos: [-1.06, b, 0.34] }, bunsen: { pos: [1.75, b, -0.15] }, spatula: { pos: [-0.62, b, 0.38], rotY: 0.4 }
    };
  };
  // تنفيذ إجراء من المختبر وتحديث الصفحة
  K.act = function (page, fn, id) {
    const r = fn(page.st, page.p, id) || {};
    page.lastExplain = [r.msg || '']; page.renderWhy();
    page.update();
    if (page.mode === 'challenge') page.checkChallenge();
    return r;
  };
  K.ppeChips = (st) => Object.assign({ goggles: st.ppe.goggles, coat: st.ppe.coat, gloves: st.ppe.gloves }, st.hood !== undefined ? { hood: st.hood } : {});

  /* ---------- لوحة المستوى الجزيئي ---------- */
  const sceneCache = {};
  K.scene = (key, lhs, rhs) => (sceneCache[key] = sceneCache[key] || C.reactionScene(lhs, rhs));
  // spec: { key, lhs, rhs, states, ph, title, sub, eq, lines: [[text, color]] }
  K.drawMol = function (ctx, W, H, d, cols, st, spec) {
    const narrow = W < 560; d.hits = d.hits || [];
    const S = K.scene(spec.key, spec.lhs, spec.rhs);
    const ph = ((spec.ph % 1) + 1) % 1; const frame = C.sceneAt(S, ph);
    // العنوان
    D.txt(ctx, spec.title || 'المستوى الجزيئي', W / 2, 18, { color: cols.text, size: narrow ? 13 : 15, w: '700' });
    D.txt(ctx, C.phaseName(ph), W / 2, 40, { color: ph >= 0.22 && ph < 0.45 ? cols.c2 : ph >= 0.72 && ph < 0.9 ? cols.c3 : cols.muted, size: narrow ? 12 : 13.5, w: '700' });
    // المتفاعلات | النواتج
    const top = 58, molH = spec.molH || H * (narrow ? 0.46 : 0.52);
    D.txt(ctx, 'المتفاعلات', W * 0.25, top, { color: cols.c1, size: 12.5, w: '700' }); D.txt(ctx, 'النواتج', W * 0.75, top, { color: cols.c3, size: 12.5, w: '700' });
    ctx.save(); ctx.strokeStyle = cols.grid; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(W / 2, top + 10); ctx.lineTo(W / 2, top + molH); ctx.stroke(); ctx.restore();
    D.arrow(ctx, W / 2 - 14, top + molH / 2, W / 2 + 14, top + molH / 2, cols.text, 2.5);
    const s = Math.min((W / 2 - 16) / (S.ext[0] * 1.15), (molH / 2 - 8) / (S.ext[1] * 1.25), 60);
    C.drawBallStick(ctx, frame, { yaw: st.yaw || 0, pitch: st.pitch || 0, cx: W / 2, cy: top + molH / 2 + 6, s: s, fov: 30, labels: s > 16, colors: { bond: '#94a3b8', bad: cols.c2, ok: cols.c3 } });
    // المعادلة الرمزية (من اليسار لليمين كما في الكتاب)
    let y = top + molH + 22;
    ctx.save(); ctx.font = '700 ' + (narrow ? 14 : 17) + 'px system-ui, sans-serif'; ctx.fillStyle = cols.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
    const eq = spec.eq; let fs = narrow ? 14 : 17; while (fs > 9 && ctx.measureText(eq).width > W - 20) { fs -= 0.5; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; }
    ctx.fillText(eq, W / 2, y); ctx.restore();
    y += 24;
    (spec.lines || []).forEach(([t, c]) => { if (!t) return; D.txt(ctx, t, W / 2, y, { color: c || cols.text, size: narrow ? 11.5 : 13, w: '600' }); y += narrow ? 19 : 21; });
    // زر الخطوة
    const bw = narrow ? 104 : 124, bh = 30, bx = 10, by = H - bh - 10;
    D.rr(ctx, bx, by, bw, bh, 8); ctx.fillStyle = cols.c5; ctx.fill();
    D.txt(ctx, '▶ خطوة جزيئية', bx + bw / 2, by + bh / 2 + 1, { color: '#fff', size: 12.5, w: '700' });
    d.hits.push({ id: 'mol:step', x: bx, y: by, w: bw, h: bh });
    D.txt(ctx, 'اسحب لتدوير الجزيئات', W - 12, H - 22, { color: cols.muted, size: 11.5, align: 'right' });
  };
  K.molPointer = function (type, x, y, p, st, api) {
    if (!st) return false;
    if (type === 'down') {
      const h = api.hit(x, y);
      if (h && h.id === 'mol:step') { st.mol = Math.round(((st.mol || 0) + 0.125) * 1000) / 1000 % 1; return true; }
      st._drag = [x, y]; return false;
    }
    if (type === 'move' && st._drag) { st.yaw = (st.yaw || 0) + (x - st._drag[0]) * 0.012; st.pitch = Math.max(-1.2, Math.min(1.2, (st.pitch || 0) + (y - st._drag[1]) * 0.01)); st._drag = [x, y]; return 'redraw'; }
    if (type === 'up') { st._drag = null; }
    return false;
  };
})(typeof window !== 'undefined' ? window : globalThis);
