/* المهارات الرقمية (العاشر) — أدوات مشتركة: لوحة الكود، المتغيرات، شاشة المخرجات، ومصنع محاكيات التتبع */
(function (root) {
  'use strict';
  const ML = root.ML; const PY = ML.py;
  const D = ML.ds10 = {};
  D.S = 'g10-digital';
  D.MODEL = 'نموذج حل مقترح لأغراض التعليم';
  D.reg = (o) => ML.register(Object.assign({ subject: D.S, custom: true }, o));
  D.narrow = (W) => W < 560;
  D.MONO = 'ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace';
  const AR = /[؀-ۿ]/;
  // نص عادي (عربي أو لاتيني) على Canvas
  D.txt = function (ctx, s, x, y, o) {
    o = o || {}; ctx.save(); s = String(s);
    ctx.font = (o.w || '600') + ' ' + (o.size || 13) + 'px ' + (o.mono ? D.MONO : 'system-ui, Tajawal, sans-serif');
    ctx.fillStyle = o.color; ctx.textBaseline = 'middle';
    const ar = !o.ltr && AR.test(s); ctx.direction = ar ? 'rtl' : 'ltr'; ctx.textAlign = o.align || 'center';
    const t = ar && ML.bidi ? ML.bidi(s) : s;
    if (o.halo) { ctx.lineWidth = 3.5; ctx.strokeStyle = o.halo; ctx.strokeText(t, x, y); }
    ctx.fillText(t, x, y); ctx.restore();
  };
  D.rr = function (ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  // نص مقصوص ليتسع في عرض محدد
  D.fit = function (ctx, s, maxW) { if (ctx.measureText(s).width <= maxW) return s; while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1); return s + '…'; };
  const COLORS = { kw: '#c026d3', str: '#16a34a', num: '#ea580c', com: '#94a3b8', fn: '#2563eb' };
  const KWS = new Set(['if', 'elif', 'else', 'for', 'while', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'pass']);
  const FNS = new Set(['print', 'input', 'int', 'float', 'str', 'range', 'len', 'bool']);
  // تلوين سطر كود (تبسيط لتلوين VS Code)
  function tokensOf(line) {
    const out = []; let i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === '#') { out.push([line.slice(i), 'com']); break; }
      if (ch === '"' || ch === "'") { let j = i + 1; while (j < line.length && line[j] !== ch) j++; out.push([line.slice(i, j + 1), 'str']); i = j + 1; continue; }
      if (/[0-9]/.test(ch)) { let j = i; while (j < line.length && /[0-9.]/.test(line[j])) j++; out.push([line.slice(i, j), 'num']); i = j; continue; }
      if (/[A-Za-z_؀-ۿ]/.test(ch)) { let j = i; while (j < line.length && /[A-Za-z0-9_؀-ۿ]/.test(line[j])) j++; const w = line.slice(i, j); out.push([w, KWS.has(w) ? 'kw' : FNS.has(w) ? 'fn' : null]); i = j; continue; }
      let j = i; while (j < line.length && !/[A-Za-z0-9_؀-ۿ"'#]/.test(line[j])) j++; out.push([line.slice(i, j), null]); i = j;
    }
    return out;
  }
  // لوحة الكود: أرقام الأسطر، تلوين، تظليل السطر الحالي
  D.codePanel = function (ctx, x, y, w, h, code, cur, c, o) {
    o = o || {}; const lines = code.split('\n'); const nar = w < 330;
    const lh = Math.min(22, Math.max(15, (h - 12) / Math.max(lines.length, 8))); const fs = Math.min(14, lh * 0.66) * (nar ? 0.92 : 1);
    const vis = Math.floor((h - 12) / lh); let start = 0;
    if (lines.length > vis && cur) start = Math.max(0, Math.min(lines.length - vis, cur - 1 - Math.floor(vis / 2)));
    ctx.save(); D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = o.dark ? '#0f172a' : 'rgba(148,163,184,.10)'; ctx.fill(); ctx.strokeStyle = c.grid; ctx.stroke(); ctx.clip();
    const gut = 30;
    for (let k = 0; k < vis && start + k < lines.length; k++) {
      const n = start + k + 1, yy = y + 6 + k * lh;
      if (n === cur) { ctx.fillStyle = o.err ? 'rgba(220,38,38,.22)' : 'rgba(250,204,21,.32)'; ctx.fillRect(x, yy, w, lh); ctx.fillStyle = o.err ? c.c2 : '#d97706'; ctx.fillRect(x, yy, 4, lh); }
      D.txt(ctx, n, x + gut - 8, yy + lh / 2, { color: c.muted, size: fs - 1, align: 'right', mono: true, ltr: true });
      // الكود من اليسار لليمين كما في المحرر
      ctx.font = '500 ' + fs + 'px ' + D.MONO; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.textAlign = 'left';
      let xx = x + gut + 4; const line = lines[n - 1].replace(/\t/g, '    ');
      tokensOf(line).forEach((tk) => { ctx.fillStyle = tk[1] ? COLORS[tk[1]] : c.text; if (xx < x + w) ctx.fillText(tk[0], xx, yy + lh / 2); xx += ctx.measureText(tk[0]).width; });
    }
    if (start > 0) D.txt(ctx, '▲', x + w - 12, y + 10, { color: c.muted, size: 10 });
    if (start + vis < lines.length) D.txt(ctx, '▼', x + w - 12, y + h - 10, { color: c.muted, size: 10 });
    ctx.restore();
  };
  // جدول المتغيرات (الذاكرة)
  D.varsPanel = function (ctx, x, y, w, h, vars, changed, c) {
    ctx.save(); D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = 'rgba(37,99,235,.06)'; ctx.fill(); ctx.strokeStyle = c.grid; ctx.stroke(); ctx.restore();
    D.txt(ctx, 'الذاكرة (المتغيرات)', x + w - 10, y + 13, { color: c.c1, size: 12, w: '800', align: 'right' });
    if (!vars.length) { D.txt(ctx, 'لا متغيرات بعد', x + w / 2, y + h / 2, { color: c.muted, size: 12 }); return; }
    const rh = Math.min(24, (h - 30) / vars.length); const fs = Math.min(13, rh * 0.62);
    vars.forEach((v, i) => {
      const yy = y + 26 + i * rh; if (yy + rh > y + h) return; const ch = changed && changed.indexOf(v[0]) >= 0;
      if (ch) { ctx.fillStyle = 'rgba(250,204,21,.35)'; ctx.fillRect(x + 4, yy, w - 8, rh - 2); }
      ctx.save(); ctx.font = '700 ' + fs + 'px ' + D.MONO; ctx.direction = 'ltr'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = c.c5; const nm = D.fit(ctx, v[0], w * 0.38); ctx.fillText(nm, x + 10, yy + rh / 2);
      ctx.fillStyle = c.text; ctx.font = '500 ' + fs + 'px ' + D.MONO; ctx.fillText(D.fit(ctx, '= ' + v[2], w * 0.62 - 54), x + 10 + w * 0.38, yy + rh / 2);
      ctx.fillStyle = c.muted; ctx.font = '500 ' + (fs - 2) + 'px ' + D.MONO; ctx.textAlign = 'right'; ctx.fillText(v[1], x + w - 8, yy + rh / 2); ctx.restore();
    });
  };
  // شاشة المخرجات (Terminal)
  D.outPanel = function (ctx, x, y, w, h, out, c, err) {
    ctx.save(); D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = '#0b1220'; ctx.fill(); ctx.restore();
    D.txt(ctx, 'المخرجات (Terminal)', x + w - 10, y + 13, { color: '#93c5fd', size: 12, w: '800', align: 'right' });
    let lines = out.replace(/\n$/, '').split('\n'); if (out === '') lines = [];
    const lh = 18; const vis = Math.floor((h - 30) / lh); if (lines.length > vis) lines = lines.slice(lines.length - vis);
    lines.forEach((ln, i) => {
      const yy = y + 34 + i * lh; const t = ln.replace(/\t/g, '    '); const ar = AR.test(t); const isErr = err && /Error|Traceback|File "main/.test(t);
      ctx.save(); ctx.font = '500 13px ' + D.MONO; ctx.textBaseline = 'middle'; ctx.fillStyle = isErr ? '#f87171' : '#e2e8f0';
      ctx.direction = ar ? 'rtl' : 'ltr'; ctx.textAlign = ar ? 'right' : 'left';
      ctx.fillText(ar && ML.bidi ? ML.bidi(t) : t, ar ? x + w - 10 : x + 10, yy); ctx.restore();
    });
  };

  /* ---------- مصنع محاكاة التتبع ---------- */
  // cfg: { id, lesson, lessonTitle, page, unit, order, titleAr, titleEn, tags, programs: {key: {name, page, code, inputs, v1, v2, kind, expect, q}}, learn, challenges, tutor, summary, formula, book }
  D.tracer = function (cfg) {
    const P = cfg.programs; const keys = Object.keys(P);
    const prog = (p) => P[p && P[p.prog] ? p.prog : keys[0]];
    const codeOf = (p) => { const g = prog(p); let s = g.code; if (g.v1) s = s.split('{1}').join(String(p && p.v1 !== undefined ? p.v1 : g.v1.def)); if (g.v2) s = s.split('{2}').join(String(p && p.v2 !== undefined ? p.v2 : g.v2.def)); return s; };
    const inputsOf = (p) => { const g = prog(p); if (!g.inputs && g.inputs !== '') return []; const s = p && typeof p.inp === 'string' ? p.inp : g.inputs; return s === '' ? [] : s.split('|').map((x) => x.trim()); };
    const cache = {};
    const runOf = (p) => { const code = codeOf(p), inp = inputsOf(p); const k = code + '\u0001' + inp.join('\u0002'); if (!cache[k]) cache[k] = PY.run(code, inp); return cache[k]; };
    D.runOf = D.runOf || {}; D.runOf[cfg.id] = runOf; D.codeOf = D.codeOf || {}; D.codeOf[cfg.id] = codeOf;
    const stepName = (s) => 'السطر ' + s.line + ': ' + s.note;
    const nt = (s) => String(s).replace(/\*\*/g, '∗∗');
    const anyV = (k) => keys.some((x) => P[x][k]);
    const params = [
      { key: 'prog', label: '\\text{البرنامج}', type: 'select', value: keys[0], options: keys.map((k) => [k, P[k].name]) },
      { key: 'step', label: '\\text{خطوة التتبع}', type: 'stage', value: 0, stages: (p) => runOf(p).steps.map(stepName) }
    ];
    if (anyV('v1')) params.push({ key: 'v1', label: '\\text{قيمة للتجربة}', min: -100, max: 1000, step: 1, value: 0, int: true, desc: 'تُعوَّض في الكود', hidden: (p) => !prog(p).v1 });
    if (anyV('v2')) params.push({ key: 'v2', label: '\\text{قيمة ثانية}', min: -100, max: 1000, step: 1, value: 0, int: true, desc: 'تُعوَّض في الكود', hidden: (p) => !prog(p).v2 });
    if (keys.some((k) => P[k].inputs !== undefined)) params.push({ key: 'inp', label: '\\text{قيم الإدخال}', type: 'text', value: '', maxLength: 80, desc: 'ما يكتبه المستخدم عند كل input()، مفصولة بـ |', hidden: (p) => prog(p).inputs === undefined, normalize: (v) => String(v), validate: () => null });
    // القيم الابتدائية من البرنامج الأول
    const g0 = P[keys[0]]; params.forEach((q) => { if (q.key === 'v1' && g0.v1) q.value = g0.v1.def; if (q.key === 'v2' && g0.v2) q.value = g0.v2.def; if (q.key === 'inp' && g0.inputs !== undefined) q.value = g0.inputs; });
    function onSet(p, key) {
      if (key === 'prog' || key === null) {
        const g = prog(p);
        if (key === 'prog') { p.step = 0; if (g.v1) p.v1 = g.v1.def; if (g.v2) p.v2 = g.v2.def; if (g.inputs !== undefined) p.inp = g.inputs; }
      }
      if (key === 'v1' || key === 'v2' || key === 'inp') p.step = 0;
      const g = prog(p);
      if (g.v1 && key === 'v1') p.v1 = Math.max(g.v1.min, Math.min(g.v1.max, p.v1));
      const n = runOf(p).steps.length; if (p.step > n - 1) p.step = Math.max(0, n - 1);
    }
    const res = {
      id: cfg.id, unit: cfg.unit, order: cfg.order, lesson: cfg.lesson, lessonTitle: cfg.lessonTitle, page: cfg.page,
      titleAr: cfg.titleAr, titleEn: cfg.titleEn, tags: cfg.tags, formula: cfg.formula, book: cfg.book, summary: cfg.summary,
      vars: [['\\text{السطر الحالي}', 'السطر المظلل بالأصفر في الكود', 'يُنفَّذ الآن'], ['\\text{الذاكرة}', 'المتغيرات وقيمها وأنواعها بعد تنفيذ الخطوة', 'المتغير الذي تغيّر يُظلَّل'], ['\\text{المخرجات}', 'ما يظهر على الشاشة (Terminal)', 'من print() و input()']],
      assumptions: ['الكود يُنفَّذ بمفسّر بايثون مصغّر داخل المتصفح يغطي ما في الوحدة، ونتائجه مطابقة لبايثون'],
      params: params, onSet: onSet,
      canvasHint: 'استخدم ← و → (أو المنزلق) للتنقل بين خطوات التتبع. السطر الأصفر يُنفَّذ الآن، والمتغير المظلل في الذاكرة هو الذي تغيّر.',
      compute(p) {
        const R = runOf(p); const n = R.steps.length; const k = Math.max(0, Math.min(n - 1, Math.round(p.step || 0))); const st = R.steps[k] || { line: 0, note: '', vars: [], out: '' };
        return { R: R, k: k, n: n, cs: st, g: prog(p), code: codeOf(p), last: k === n - 1, err: !!R.error, errNow: st.kind === 'error' };
      },
      drawCustom(ctx, W, H, p, d, c) {
        const nar = D.narrow(W); const g = d.g;
        const head = (d.k + 1) + ' / ' + d.n + '  —  ' + stepName(d.cs);
        ctx.save(); ctx.font = '700 13px system-ui, Tajawal, sans-serif'; const ht = D.fit(ctx, head, W - 24); ctx.restore();
        D.txt(ctx, ht, W - 12, 14, { color: d.errNow ? c.c2 : c.text, size: 13, w: '700', align: 'right' });
        if (nar) {
          const ch = H * 0.5; D.codePanel(ctx, 8, 30, W - 16, ch - 30, d.code, d.cs.line, c, { err: d.errNow });
          const bw = (W - 24) / 2; D.varsPanel(ctx, W - 8 - bw, ch + 6, bw, H - ch - 14, d.cs.vars, d.cs.changed, c); D.outPanel(ctx, 8, ch + 6, bw, H - ch - 14, d.cs.out, c, d.errNow);
        } else {
          const cw = W * 0.56; D.codePanel(ctx, 8, 30, cw, H - 40, d.code, d.cs.line, c, { err: d.errNow });
          const rx = cw + 16, rw = W - rx - 8; const vh = (H - 40) * 0.46;
          D.varsPanel(ctx, rx, 30, rw, vh, d.cs.vars, d.cs.changed, c); D.outPanel(ctx, rx, 38 + vh, rw, H - 48 - vh, d.cs.out, c, d.errNow);
        }
        if (g.kind === 'model') D.txt(ctx, D.MODEL, 14, H - 10, { color: c.c4, size: 11, w: '700', align: 'left' });
      },
      live(p, d) { return '\\text{الخطوة ' + (d.k + 1) + ' من ' + d.n + (d.last ? ' (الأخيرة)' : '') + '}'; },
      results(p, d) {
        const g = d.g; const lines = d.code.split('\n'); const r = [];
        r.push(['البرنامج', g.name + (g.page ? ' (ص ' + g.page + ')' : ''), false]);
        r.push(['السطر المنفَّذ', '{{' + (lines[d.cs.line - 1] || '').trim() + '}}', false]);
        r.push(['ما حدث', nt(d.cs.note), false, d.errNow ? 'neg' : '']);
        r.push(['المتغيرات', d.cs.vars.length ? d.cs.vars.map((v) => '{{' + v[0] + ' = ' + v[2] + '}}').join(' ، ') : '—', false]);
        if (d.last) {
          r.push(['المخرج النهائي', d.R.out ? '{{' + d.R.out.replace(/\n$/, '').split('\n').join(' ⏎ ') + '}}' : '(لا شيء يُطبع)', false, d.R.error ? 'neg' : 'pos']);
          if (g.expect !== undefined) { const ok = d.R.out.replace(/\n$/, '') === g.expect; r.push(['مقارنة بالكتاب', ok ? 'مطابق لما في الكتاب ✔' : 'الكتاب: {{' + g.expect + '}}', false, ok ? 'pos' : 'neg']); }
        }
        if (g.kind === 'model') r.push(['ملاحظة', D.MODEL + '؛ النشاط في الكتاب يطلب كتابة البرنامج.', false]);
        if (g.kind === 'buggy') r.push(['ملاحظة', 'هذا الكود كما في الكتاب (فيه أخطاء مقصودة). اختر النسخة المصحّحة لمقارنة النتيجة.', false]);
        return r;
      },
      steps(p, d) {
        const s = d.R.steps; const lines = d.code.split('\n');
        const rows = s.slice(0, 80).map((x, i) => (i === d.k ? '**' : '') + 'الخطوة ' + (i + 1) + ' — السطر ' + x.line + ': {{' + (lines[x.line - 1] || '').trim() + '}} ← ' + nt(x.note) + (i === d.k ? '**' : ''));
        if (s.length > 80) rows.push('… و ' + (s.length - 80) + ' خطوة أخرى.');
        return rows;
      },
      explain(a, b, da, db) {
        if (a.prog !== b.prog) return ['برنامج جديد: ' + db.g.name + '. ابدأ التتبع من السطر الأول.' + (db.g.q ? ' ' + db.g.q : '')];
        if (da && da.k !== db.k) return [nt(db.cs.note) + (db.cs.changed ? ' — تغيّرت قيمة ' + db.cs.changed.map((x) => '{{' + x + '}}').join('، ') + ' في الذاكرة.' : '')];
        return [];
      },
      learn: cfg.learn, challenges: cfg.challenges,
      tutor: (cfg.tutor || []).concat([
        { q: 'ما قيم المتغيرات الآن؟', k: ['قيم', 'المتغيرات', 'الان'], a: (p, d) => (d.cs.vars.length ? d.cs.vars.map((v) => '{{' + v[0] + ' = ' + v[2] + '}} (' + v[1] + ')').join('، ') : 'لا متغيرات بعد.') },
        { q: 'لماذا حدث الخطأ؟', k: ['خطا', 'الخطأ', 'error'], a: (p, d) => (d.R.error ? 'في السطر ' + d.R.error.line + ': {{' + d.R.error.kind + '}} — ' + d.R.error.ar : 'لا يوجد خطأ في هذا البرنامج.') }
      ])
    };
    return res;
  };
  // عدد مرات تحقق شرط/دخول في التتبع
  D.countSteps = (R, kind, cond) => R.steps.filter((s) => s.kind === kind && (cond === undefined || s.cond === cond)).length;
})(typeof window !== 'undefined' ? window : globalThis);
