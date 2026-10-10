/* أدوات صياغة مشتركة للمحاكيات (TeX، فترات، إلخ) */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const M = ML.math;
  const F = ML.fx = {};

  // (x + h) بإشارات صحيحة
  F.shift = function (v, h) {
    const r = M.round(h, 4);
    if (r === 0) return v;
    return v + (r > 0 ? ' + ' : ' - ') + M.fmt(Math.abs(r));
  };
  // + k / - k في آخر التعبير
  F.plus = function (k) {
    const r = M.round(k, 4);
    if (r === 0) return '';
    return (r > 0 ? ' + ' : ' - ') + M.fmt(Math.abs(r));
  };
  // معامل أمام تعبير: 1 → '' ، -1 → '-'
  F.coef = function (a) {
    const r = M.round(a, 4);
    if (r === 1) return '';
    if (r === -1) return '-';
    return M.fmt(r);
  };
  // a x + b
  F.lin = function (a, b, v) { return M.polyTeX([a, b], v || 'x'); };
  // فترة بصيغة TeX
  F.interval = function (a, b, closedA, closedB) {
    const L = a === -Infinity ? '(-\\infty' : (closedA ? '[' : '(') + M.texFrac(a);
    const R = b === Infinity ? '\\infty)' : M.texFrac(b) + (closedB ? ']' : ')');
    return L + ', ' + R;
  };
  // اتحاد فترات
  F.union = function (list) {
    if (!list.length) return '\\varnothing';
    return list.map((I) => (I.point !== undefined ? '\\{' + M.texFrac(I.point) + '\\}' : F.interval(I.a, I.b, I.ca, I.cb))).join(' \\cup ');
  };
  // نقطة
  F.pt = function (x, y) { return '(' + M.texFrac(x) + ',\\ ' + M.texFrac(y) + ')'; };
  // جذر تربيعي بشكل مبسط إن كان مربعاً كاملاً
  F.sqrtTeX = function (n) {
    if (n < 0) return null;
    const r = Math.sqrt(n);
    if (M.isInt(r)) return String(Math.round(r));
    if (M.isInt(n)) {
      // استخراج أكبر مربع كامل
      let k = 1; for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) k = i;
      return (k === 1 ? '' : k) + '\\sqrt{' + (n / (k * k)) + '}';
    }
    return '\\sqrt{' + M.fmt(n) + '}';
  };
  // رسم خط إشارة على أسفل لوحة الرسم
  F.drawSignLine = function (P, chart, crit, opts) {
    opts = opts || {};
    const ctx = P.ctx, c = P.colors(); const y = P.H - 26;
    ctx.save();
    ctx.fillStyle = c.bg; ctx.globalAlpha = 0.92; ctx.fillRect(0, y - 16, P.W, 34); ctx.globalAlpha = 1;
    ctx.strokeStyle = c.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(P.W - 8, y); ctx.stroke();
    ctx.font = '600 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    chart.forEach((I) => {
      const a = Math.max(P.view.xmin, I.from), b = Math.min(P.view.xmax, I.to);
      if (!(b > a)) return;
      const xa = P.X(a), xb = P.X(b);
      ctx.fillStyle = I.sign === '+' ? c.c3 : c.c2;
      ctx.globalAlpha = 0.25; ctx.fillRect(xa, y - 5, xb - xa, 10); ctx.globalAlpha = 1;
      const n = Math.max(1, Math.floor((xb - xa) / 28));
      for (let i = 0; i < n; i++) ctx.fillText(I.sign === '+' ? '+' : '−', xa + (xb - xa) * (i + 0.5) / n, y - 10);
    });
    (crit || []).forEach((z) => {
      if (z.x < P.view.xmin || z.x > P.view.xmax) return;
      const X = P.X(z.x);
      ctx.fillStyle = z.undef ? c.c2 : c.axis; ctx.beginPath(); ctx.arc(X, y, 4, 0, 7); ctx.fill();
      ctx.fillStyle = c.text; ctx.font = '11px system-ui'; ctx.fillText(z.undef ? '✕' : (opts.zeroLabel || '0'), X, y + 11);
    });
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
