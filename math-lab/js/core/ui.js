/* واجهة التطبيق: التوجيه، الصفحة الرئيسية، صفحة المحاكاة، الأوضاع، المساعد */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const M = ML.math;
  ML.sims = ML.sims || [];
  ML.register = (s) => { ML.sims.push(s); };

  ML.units = [
    { n: 1, ar: 'المنطق الرياضي', en: 'Mathematical Logic', icon: '∧', pages: '7–28', color: 'u1' },
    { n: 2, ar: 'الاقترانات ورسومها البيانية', en: 'Functions and Their Graphs', icon: 'ƒ', pages: '29–78', color: 'u2' },
    { n: 3, ar: 'الهندسة: الدائرة', en: 'Geometry: The Circle', icon: '◯', pages: '79–98', color: 'u3' },
    { n: 4, ar: 'الاقترانات المثلثية', en: 'Trigonometric Functions', icon: '∿', pages: '99–140', color: 'u4' },
    { n: 5, ar: 'المصفوفات', en: 'Matrices', icon: '▦', pages: '141–175', color: 'u5' },
    { n: 6, ar: 'طرق العد ونظرية ذات الحدين', en: 'Counting & Binomial Theorem', icon: 'n!', pages: '176–193', color: 'u6' }
  ];
  const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];
  ML.unitName = (n) => 'الوحدة ' + ORD[n] + ' (' + ML.units[n - 1].ar + ')';

  /* ---------- عرض الرياضيات ---------- */
  ML.texHTML = function (tex, display) {
    try {
      if (root.katex) return root.katex.renderToString(tex, { throwOnError: false, displayMode: !!display, output: 'html', strict: 'ignore' });
    } catch (e) { /* fallthrough */ }
    return '<code dir="ltr">' + esc(tex) + '</code>';
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  // نص غني: $..$ رياضيات ، $$..$$ سطر مستقل ، **غامق** ، أسطر جديدة
  ML.rich = function (s) {
    if (s === null || s === undefined) return '';
    const parts = String(s).split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((p) => {
      if (p.startsWith('$$')) return '<div class="math-block" dir="ltr">' + ML.texHTML(p.slice(2, -2), true) + '</div>';
      if (p.startsWith('$') && p.length > 1) return '<span class="m" dir="ltr">' + ML.texHTML(p.slice(1, -1)) + '</span>';
      return esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }).join('');
  };

  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  ML.el = el;

  /* ---------- السمة ---------- */
  function initTheme() {
    let t = null; try { t = localStorage.getItem('ml-theme'); } catch (e) { /* ignore */ }
    if (t) document.documentElement.setAttribute('data-theme', t);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nx);
    try { localStorage.setItem('ml-theme', nx); } catch (e) { /* ignore */ }
    if (ML.current) ML.current.redraw();
  }

  /* ---------- التوجيه ---------- */
  function route() {
    if (ML.current) { ML.current.destroy(); ML.current = null; }
    const h = location.hash || '';
    const m = h.match(/^#\/sim\/([\w-]+)/);
    const app = document.getElementById('app');
    app.innerHTML = '';
    window.scrollTo(0, 0);
    if (m) {
      const sim = ML.sims.find((s) => s.id === m[1]);
      if (sim) { ML.current = new SimPage(app, sim); return; }
    }
    renderHome(app);
  }

  function topbar(back) {
    const bar = el('header', { class: 'topbar' });
    bar.innerHTML = (back ? '<a class="btn ghost back" href="#/" aria-label="الرئيسية">→ الفصول</a>' : '') +
      '<a class="brand" href="#/"><span class="logo" aria-hidden="true">∫</span><span><b>مختبر الرياضيات التفاعلي</b><small>Interactive Mathematics Simulation Lab</small></span></a>' +
      '<button class="btn ghost icon theme" aria-label="تبديل الوضع الليلي" title="الوضع الليلي/النهاري">🌓</button>';
    bar.querySelector('.theme').addEventListener('click', toggleTheme);
    return bar;
  }

  /* ---------- الصفحة الرئيسية ---------- */
  function renderHome(app) {
    document.title = 'مختبر الرياضيات التفاعلي';
    app.appendChild(topbar(false));
    const hero = el('section', { class: 'hero' });
    hero.innerHTML = '<h1>مختبر الرياضيات التفاعلي</h1>' +
      '<p class="lead">حوّل قوانين كتاب الرياضيات إلى تجارب حيّة: غيّر المعاملات وشاهد أثرها فوراً — بصرياً وجبرياً.</p>' +
      '<p class="src-line">المصدر الوحيد للمحتوى: <b>كتاب الرياضيات — الصف العاشر</b> (دولة فلسطين، الطبعة الرابعة 2026م / 1448هـ)</p>' +
      '<div class="search"><input type="search" placeholder="ابحث عن درس أو مفهوم… (مثال: دائرة الوحدة، كريمر، المتباينات)" aria-label="بحث"></div>' +
      '<div class="stats"><span><b>' + ML.units.length + '</b> وحدات</span><span><b>' + ML.sims.length + '</b> محاكاة</span><span><b>3</b> أوضاع تعلّم</span></div>';
    app.appendChild(hero);
    const grid = el('main', { class: 'units' });
    app.appendChild(grid);
    const input = hero.querySelector('input');
    const draw = () => {
      const q = ML.normAr(input.value);
      grid.innerHTML = '';
      ML.units.forEach((u) => {
        const sims = ML.sims.filter((s) => s.unit === u.n && (!q || ML.normAr(s.titleAr + ' ' + s.titleEn + ' ' + (s.tags || '') + ' ' + u.ar).includes(q)));
        if (!sims.length) return;
        const card = el('section', { class: 'unit ' + u.color });
        card.innerHTML = '<div class="unit-head"><span class="unit-icon" aria-hidden="true">' + u.icon + '</span><div><small>الوحدة ' + ORD[u.n] + ' · ص ' + u.pages + '</small><h2>' + u.ar + '</h2><span class="en">' + u.en + '</span></div></div>';
        const ul = el('ul', { class: 'lessons' });
        sims.forEach((s) => {
          const li = el('li');
          li.innerHTML = '<a href="#/sim/' + s.id + '"><span class="ln">' + s.lesson + '</span><span class="lt"><b>' + s.titleAr + '</b><small>' + s.titleEn + '</small></span><span class="pg">ص ' + s.page + '</span></a>';
          ul.appendChild(li);
        });
        card.appendChild(ul); grid.appendChild(card);
      });
      if (!grid.children.length) grid.innerHTML = '<p class="empty">لا توجد نتائج مطابقة.</p>';
    };
    input.addEventListener('input', draw); draw();
    app.appendChild(el('footer', { class: 'foot' }, 'جميع القوانين والأمثلة مأخوذة من كتاب الرياضيات للصف العاشر. أي إثراء بصري خارج الكتاب مُعلَّم بوضوح.'));
  }

  /* ---------- صفحة المحاكاة ---------- */
  class SimPage {
    constructor(app, sim) {
      this.sim = sim; this.app = app; this.mode = 'explore';
      this.p = {}; sim.params.forEach((q) => { this.p[q.key] = q.value; });
      this.prev = null; this.lastExplain = []; this.playing = false; this.chIdx = 0; this.solved = false;
      this.raf = null; this.tw = null;
      document.title = sim.titleAr + ' — مختبر الرياضيات التفاعلي';
      this.build();
      this.update(true);
    }
    destroy() {
      cancelAnimationFrame(this.raf); this.playing = false;
      if (this.ro) this.ro.disconnect();
      if (this.tutorEl) this.tutorEl.remove();
    }
    build() {
      const s = this.sim, app = this.app;
      app.appendChild(topbar(true));
      const head = el('section', { class: 'sim-head' });
      const u = ML.units[s.unit - 1];
      head.innerHTML = '<div class="titles"><span class="badge ' + u.color + '">' + ML.unitName(s.unit) + '</span><h1>' + s.titleAr + '</h1><p class="en" dir="ltr">' + s.titleEn + '</p></div>' +
        '<div class="source"><b>المصدر:</b> كتاب الرياضيات — الصف العاشر<br><b>الفصل:</b> ' + ML.unitName(s.unit) + '<br><b>الدرس:</b> ' + s.lesson + ' ' + s.lessonTitle + '<br><b>الصفحة:</b> ' + s.page + '</div>' +
        '<div class="modes" role="tablist">' +
        '<button role="tab" data-m="learn">📘 تعلّم <small>Learn</small></button>' +
        '<button role="tab" data-m="explore" class="on">🧪 استكشف <small>Experiment</small></button>' +
        '<button role="tab" data-m="challenge">🎯 تحدٍّ <small>Challenge</small></button></div>';
      app.appendChild(head);
      head.querySelectorAll('.modes button').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.m)));
      this.modesEl = head.querySelector('.modes');

      const main = el('main', { class: 'sim-grid' });
      // لوحة الوضع (تعلّم/تحدٍّ)
      this.modePanel = el('section', { class: 'card mode-panel', hidden: '' });
      main.appendChild(this.modePanel);
      // منطقة الرسم
      const stage = el('section', { class: 'card stage' });
      stage.innerHTML = '<div class="live" dir="ltr"></div><div class="canvas-wrap"><canvas aria-label="منطقة المحاكاة البصرية"></canvas>' +
        (s.custom ? '' : '<div class="zoom"><button class="btn icon" data-z="in" aria-label="تكبير">+</button><button class="btn icon" data-z="out" aria-label="تصغير">−</button><button class="btn icon" data-z="home" aria-label="إعادة العرض">⌂</button></div>') +
        '</div><p class="hint">' + (s.custom ? (s.canvasHint || '') : 'اسحب لتحريك المستوى • العجلة/القرص للتكبير' + (s.handles ? ' • اسحب النقاط الملوّنة' : '')) + '</p>';
      main.appendChild(stage);
      this.liveEl = stage.querySelector('.live');
      this.canvas = stage.querySelector('canvas');
      // أدوات التحكم
      const ctr = el('section', { class: 'card controls' });
      ctr.innerHTML = '<h3>أدوات التحكم <small>Controls</small></h3><div class="params"></div><div class="actions">' +
        '<button class="btn" data-a="reset">↺ إعادة ضبط</button>' +
        (s.play ? '<button class="btn primary" data-a="play">▶ تشغيل</button>' : '') +
        '<button class="btn" data-a="rand">🎲 قيم عشوائية</button></div><p class="warn" hidden></p>';
      main.appendChild(ctr);
      this.paramsEl = ctr.querySelector('.params'); this.warnEl = ctr.querySelector('.warn');
      ctr.querySelector('[data-a=reset]').addEventListener('click', () => this.reset());
      ctr.querySelector('[data-a=rand]').addEventListener('click', () => this.randomize());
      this.playBtn = ctr.querySelector('[data-a=play]');
      if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
      // النتائج
      this.resEl = el('section', { class: 'card results' }); main.appendChild(this.resEl);
      // ماذا حدث؟
      this.whyEl = el('section', { class: 'card why' }); main.appendChild(this.whyEl);
      // الخطوات
      this.stepsEl = el('section', { class: 'card steps' }); main.appendChild(this.stepsEl);
      // القانون والمتغيرات
      const law = el('section', { class: 'card law' });
      law.innerHTML = '<h3>القانون / الصيغة <small>Formula</small></h3><div class="formula" dir="ltr">' + ML.texHTML(s.formula, true) + '</div>' +
        (s.book ? '<p class="book-not"><b>بترميز الكتاب:</b> <span>' + ML.rich(s.book) + '</span></p>' : '') +
        '<p class="summary">' + ML.rich(s.summary) + '</p>' +
        '<table class="vars"><thead><tr><th>المتغير</th><th>المعنى</th><th>المجال المسموح</th></tr></thead><tbody>' +
        s.vars.map((v) => '<tr><td dir="ltr">' + ML.texHTML(v[0]) + '</td><td>' + ML.rich(v[1]) + '</td><td>' + ML.rich(v[2]) + '</td></tr>').join('') + '</tbody></table>';
      main.appendChild(law);
      app.appendChild(main);

      this.buildParams();
      // الرسم
      if (s.custom) { this.ctx = this.canvas.getContext('2d'); this.plot = null; }
      else {
        this.plot = new ML.Plot(this.canvas, Object.assign({}, s.plot || {}));
        this.plot.onChange = () => this.redraw();
        stage.querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => {
          const z = b.dataset.z; if (z === 'in') this.plot.zoom(0.7); else if (z === 'out') this.plot.zoom(1.4); else this.plot.animateView(this.homeView());
        }));
      }
      this.ro = new ResizeObserver(() => this.layout());
      this.ro.observe(this.canvas.parentElement);
      this.layout(true);
      this.buildTutor();
    }
    homeView() { const v = this.sim.plot && this.sim.plot.view; return typeof v === 'function' ? v(this.p, this.d) : Object.assign({}, v || { xmin: -10, xmax: 10, ymin: -10, ymax: 10 }); }
    layout(first) {
      if (this.plot) {
        const v = first ? this.homeView() : this.plot.view;
        this.plot.resize(); this.plot.setView(v);
      } else {
        const r = this.canvas.getBoundingClientRect(); const dpr = Math.min(3, root.devicePixelRatio || 1);
        this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.cW = r.width; this.cH = r.height;
      }
      this.redraw();
    }
    buildParams() {
      const s = this.sim; this.inputs = {};
      this.paramsEl.innerHTML = '';
      s.params.forEach((q) => {
        const row = el('div', { class: 'param', 'data-k': q.key });
        const lab = '<label><span class="pl" dir="ltr">' + ML.texHTML(q.label) + '</span>' + (q.desc ? '<small>' + q.desc + '</small>' : '') + '</label>';
        if (q.type === 'select') {
          row.innerHTML = lab + '<select>' + q.options.map((o) => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select>';
          const sel = row.querySelector('select'); sel.value = this.p[q.key];
          sel.addEventListener('change', () => { this.set(q.key, isNaN(+sel.value) || sel.value === '' ? sel.value : +sel.value); });
          this.inputs[q.key] = { sel: sel };
        } else if (q.type === 'toggle') {
          row.innerHTML = lab + '<button class="toggle" role="switch"></button>';
          const b = row.querySelector('button');
          b.addEventListener('click', () => this.set(q.key, !this.p[q.key]));
          this.inputs[q.key] = { tog: b };
        } else {
          row.innerHTML = lab + '<div class="rng"><input type="range" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '"><input type="number" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '" inputmode="decimal"></div>';
          const r = row.querySelector('input[type=range]'), n = row.querySelector('input[type=number]');
          r.addEventListener('input', () => this.set(q.key, this.fixParam(q, +r.value)));
          n.addEventListener('change', () => { let v = +n.value; if (!Number.isFinite(v)) v = this.p[q.key]; this.set(q.key, this.fixParam(q, M.clamp(v, q.min, q.max), true)); });
          this.inputs[q.key] = { r: r, n: n };
        }
        this.paramsEl.appendChild(row);
      });
      this.syncInputs();
    }
    // فرض قيود المجال (مثل أ ≠ 0)
    fixParam(q, v, typed) {
      this.warnEl.hidden = true;
      if (q.exclude) {
        for (const x of q.exclude) {
          if (Math.abs(v - x) < (typed ? 1e-12 : q.step / 2)) {
            const old = this.p[q.key];
            v = x + (old >= x ? q.step : -q.step);
            if (v > q.max) v = x - q.step; if (v < q.min) v = x + q.step;
            this.warnEl.hidden = false; this.warnEl.innerHTML = ML.rich(q.excludeMsg || ('القيمة $' + q.label + ' = ' + x + '$ غير مسموحة في هذا القانون.'));
          }
        }
      }
      if (q.int) v = Math.round(v);
      return M.round(v, 6);
    }
    syncInputs() {
      const s = this.sim;
      s.params.forEach((q) => {
        const inp = this.inputs[q.key]; const v = this.p[q.key];
        const row = this.paramsEl.querySelector('[data-k="' + q.key + '"]');
        if (q.hidden) row.hidden = !!q.hidden(this.p);
        if (inp.sel) inp.sel.value = v;
        else if (inp.tog) { inp.tog.classList.toggle('on', !!v); inp.tog.setAttribute('aria-checked', !!v); inp.tog.textContent = v ? (q.on || 'مفعّل') : (q.off || 'متوقف'); }
        else { inp.r.value = v; if (document.activeElement !== inp.n) inp.n.value = M.round(v, 4); }
      });
    }
    set(key, v, silent) {
      if (this.p[key] === v) return;
      if (!this.prevSnap) this.prevSnap = { p: Object.assign({}, this.p), d: this.d };
      this.p[key] = v;
      if (this.sim.onSet) this.sim.onSet(this.p, key);
      this.update();
      if (!silent) this.scheduleExplain();
    }
    scheduleExplain() {
      clearTimeout(this.exT);
      this.exT = setTimeout(() => {
        if (!this.prevSnap) return;
        const a = this.prevSnap; this.prevSnap = null;
        let ex = this.sim.explain ? this.sim.explain(a.p, this.p, a.d, this.d) : [];
        if (!ex || !ex.length) ex = this.genericExplain(a.p, this.p);
        if (ex.length) { this.lastExplain = ex; this.renderWhy(); }
      }, 160);
    }
    genericExplain(a, b) {
      const out = [];
      this.sim.params.forEach((q) => { if (a[q.key] !== b[q.key] && q.type !== 'select' && q.type !== 'toggle') out.push('تغيّر $' + q.label + '$ من $' + M.tex(a[q.key]) + '$ إلى $' + M.tex(b[q.key]) + '$.'); });
      return out;
    }
    update(first) {
      const s = this.sim;
      try { this.d = s.compute(this.p); } catch (e) { console.error(e); this.d = {}; }
      this.syncInputs();
      this.liveEl.innerHTML = s.live ? ML.texHTML(s.live(this.p, this.d), true) : '';
      // النتائج
      const res = s.results ? s.results(this.p, this.d) : [];
      this.resEl.innerHTML = '<h3>النتائج الرقمية <small>Results</small></h3><dl>' + res.map((r) => '<div class="r' + (r[3] ? ' ' + r[3] : '') + '"><dt>' + ML.rich(r[0]) + '</dt><dd>' + (r[2] === false ? ML.rich(r[1]) : '<span dir="ltr">' + ML.texHTML(r[1]) + '</span>') + '</dd></div>').join('') + '</dl>';
      const st = s.steps ? s.steps(this.p, this.d) : [];
      this.stepsEl.innerHTML = '<h3>الخطوات الأساسية <small>Steps</small></h3>' + (st.length ? '<ol>' + st.map((x) => '<li>' + ML.rich(x) + '</li>').join('') + '</ol>' : '<p class="muted">—</p>');
      if (first) this.renderWhy();
      if (this.mode === 'challenge') this.checkChallenge();
      if (this.plot && s.handles) this.plot.handles = s.handles(this.p, this.d, (k, v) => this.set(k, v));
      this.redraw();
    }
    renderWhy() {
      const ex = this.lastExplain.length ? this.lastExplain : [this.sim.idle || 'حرّك أي منزلق، وسأشرح لك هنا ماذا تغيّر في الشكل ولماذا — هندسياً وجبرياً.'];
      this.whyEl.innerHTML = '<h3>ماذا حدث؟ ولماذا؟ <small>What happened & why</small></h3><ul>' + ex.map((x) => '<li>' + ML.rich(x) + '</li>').join('') + '</ul>';
      this.whyEl.classList.remove('pulse'); void this.whyEl.offsetWidth; this.whyEl.classList.add('pulse');
    }
    redraw() {
      const s = this.sim; if (!this.d) return;
      if (this.plot) {
        const P = this.plot; P.clear(); if (P.opts.grid !== false) P.grid();
        try { s.draw(P, this.p, this.d); } catch (e) { console.error(e); }
      } else if (this.ctx) {
        const c = this.ctx; const cols = ML.Plot.prototype.colors.call({});
        c.clearRect(0, 0, this.cW, this.cH); c.fillStyle = cols.bg; c.fillRect(0, 0, this.cW, this.cH);
        try { s.drawCustom(c, this.cW, this.cH, this.p, this.d, cols); } catch (e) { console.error(e); }
      }
    }
    reset() {
      const tgt = {}; this.sim.params.forEach((q) => { tgt[q.key] = q.value; });
      this.stopPlay(); this.tweenTo(tgt);
      if (this.plot) this.plot.animateView(this.homeView());
      this.lastExplain = ['أُعيدت جميع القيم إلى وضعها الابتدائي.']; this.renderWhy();
    }
    randomize() {
      const s = this.sim; let tgt;
      if (s.randomize) tgt = s.randomize(Object.assign({}, this.p));
      else {
        tgt = {};
        s.params.forEach((q) => {
          if (q.type === 'select' || q.type === 'toggle' || q.noRandom) return;
          const lo = q.rmin !== undefined ? q.rmin : q.min, hi = q.rmax !== undefined ? q.rmax : q.max;
          const stp = q.rstep || q.step;
          let v; let guard = 0;
          do { v = lo + Math.round(Math.random() * (hi - lo) / stp) * stp; v = M.round(v, 6); guard++; } while (q.exclude && q.exclude.some((x) => Math.abs(x - v) < 1e-9) && guard < 50);
          tgt[q.key] = v;
        });
      }
      this.prevSnap = { p: Object.assign({}, this.p), d: this.d };
      this.tweenTo(tgt, () => this.scheduleExplain());
    }
    tweenTo(tgt, done) {
      const from = Object.assign({}, this.p); const t0 = performance.now(); const ms = 450;
      const disc = {}; // القيم غير العددية تتغير فوراً
      Object.keys(tgt).forEach((k) => { if (typeof tgt[k] !== 'number' || typeof from[k] !== 'number') { disc[k] = tgt[k]; } });
      Object.assign(this.p, disc);
      cancelAnimationFrame(this.tw);
      const q = this.sim.params.reduce((o, x) => { o[x.key] = x; return o; }, {});
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - t, 3);
        Object.keys(tgt).forEach((k) => {
          if (k in disc) return;
          let v = from[k] + (tgt[k] - from[k]) * e;
          // لا نمر بالقيم الممنوعة أثناء الحركة على نحو يكسر الحساب
          if (q[k] && q[k].exclude && q[k].exclude.some((x) => Math.abs(v - x) < 1e-9)) v += 1e-6;
          if (q[k] && q[k].int) v = Math.round(v);
          this.p[k] = t === 1 ? tgt[k] : v;
        });
        if (this.sim.onSet) this.sim.onSet(this.p, null);
        this.update();
        if (t < 1) this.tw = requestAnimationFrame(step); else if (done) done();
      };
      this.tw = requestAnimationFrame(step);
    }
    togglePlay() { if (this.playing) this.stopPlay(); else this.startPlay(); }
    startPlay() {
      const s = this.sim; if (!s.play) return; this.playing = true;
      this.playBtn.textContent = '⏸ إيقاف'; this.playBtn.classList.add('on');
      let last = performance.now();
      const loop = (now) => {
        if (!this.playing) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const pl = s.play; const q = s.params.find((x) => x.key === pl.key);
        let v = this.p[pl.key] + pl.speed * dt;
        if (v > q.max) v = pl.bounce ? q.max : q.min + (v - q.max);
        if (pl.bounce && (v >= q.max || v <= q.min)) pl.speed = -pl.speed;
        this.p[pl.key] = M.round(M.clamp(v, q.min, q.max), 6);
        this.update();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    stopPlay() { this.playing = false; cancelAnimationFrame(this.raf); if (this.playBtn) { this.playBtn.textContent = '▶ تشغيل'; this.playBtn.classList.remove('on'); } }

    /* ---------- الأوضاع ---------- */
    setMode(m) {
      this.mode = m;
      this.modesEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
      const mp = this.modePanel; const s = this.sim;
      if (m === 'explore') { mp.hidden = true; return; }
      mp.hidden = false;
      if (m === 'learn') {
        mp.className = 'card mode-panel learn';
        mp.innerHTML = '<h3>📘 تعلّم: ' + s.titleAr + '</h3><div class="learn-body">' + (s.learn || []).map((x) => '<p>' + ML.rich(x) + '</p>').join('') + '</div>';
      } else {
        this.chIdx = this.chIdx % s.challenges.length; this.renderChallenge(true);
      }
      mp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    renderChallenge(init) {
      const s = this.sim; const ch = s.challenges[this.chIdx]; const mp = this.modePanel;
      this.solved = false;
      mp.className = 'card mode-panel challenge';
      mp.innerHTML = '<h3>🎯 تحدٍّ ' + (this.chIdx + 1) + ' من ' + s.challenges.length + '</h3><p class="q">' + ML.rich(ch.q) + '</p>' +
        '<div class="ch-status">عدّل القيم باستخدام أدوات التحكم حتى تصل إلى الحل الدقيق…</div>' +
        '<div class="actions"><button class="btn" data-c="hint">💡 تلميح</button><button class="btn" data-c="next">التحدي التالي ←</button></div><p class="hint-text" hidden></p>';
      mp.querySelector('[data-c=hint]').addEventListener('click', () => { const h = mp.querySelector('.hint-text'); h.hidden = false; h.innerHTML = ML.rich(ch.hint); });
      mp.querySelector('[data-c=next]').addEventListener('click', () => { this.chIdx = (this.chIdx + 1) % s.challenges.length; this.renderChallenge(true); });
      if (init && ch.init) this.tweenTo(ch.init);
      this.checkChallenge();
    }
    checkChallenge() {
      const ch = this.sim.challenges[this.chIdx]; if (!ch || this.modePanel.hidden) return;
      const ok = !!ch.check(this.p, this.d);
      const st = this.modePanel.querySelector('.ch-status'); if (!st) return;
      if (ok) { st.className = 'ch-status ok'; st.innerHTML = '✅ أحسنت! وصلت إلى الحل الصحيح. ' + (ch.why ? ML.rich(ch.why(this.p, this.d)) : ''); }
      else { st.className = 'ch-status'; st.textContent = 'لم تصل بعد — استمر في تعديل القيم…'; }
    }

    /* ---------- المساعد ---------- */
    buildTutor() {
      const s = this.sim;
      const wrap = el('div', { class: 'tutor' });
      wrap.innerHTML = '<button class="fab" aria-expanded="false"><span aria-hidden="true">🤖</span> مساعد الرياضيات الذكي</button>' +
        '<aside class="drawer" hidden><header><b>مساعد الرياضيات الذكي</b><small>AI Math Tutor — يجيب بحسب القيم الحالية</small><button class="btn icon x" aria-label="إغلاق">×</button></header>' +
        '<div class="msgs" aria-live="polite"></div><div class="chips"></div>' +
        '<form><input type="text" placeholder="اسأل عن المحاكاة الحالية…" aria-label="سؤالك"><button class="btn primary">إرسال</button></form></aside>';
      document.body.appendChild(wrap); this.tutorEl = wrap;
      const fab = wrap.querySelector('.fab'), dr = wrap.querySelector('.drawer'), msgs = wrap.querySelector('.msgs');
      const open = (o) => { dr.hidden = !o; fab.setAttribute('aria-expanded', o); if (o) wrap.querySelector('input').focus(); };
      fab.addEventListener('click', () => open(dr.hidden));
      wrap.querySelector('.x').addEventListener('click', () => open(false));
      const say = (who, html) => { const m = el('div', { class: 'msg ' + who }, html); msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; };
      const ask = (q) => {
        if (!q.trim()) return;
        say('me', esc(q));
        const a = ML.tutorAnswer(s, q, { p: this.p, d: this.d, lastExplain: this.lastExplain });
        setTimeout(() => say('bot', ML.rich(a)), 120);
      };
      say('bot', ML.rich('مرحباً! أنا مساعدك في محاكاة **' + s.titleAr + '**. أجيبك اعتماداً على القيم التي تراها الآن على الشاشة.'));
      const chips = wrap.querySelector('.chips');
      (s.tutor || []).forEach((r) => { const c = el('button', { class: 'chip', type: 'button' }, esc(r.q)); c.addEventListener('click', () => ask(r.q)); chips.appendChild(c); });
      wrap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const i = wrap.querySelector('input'); ask(i.value); i.value = ''; });
    }
  }
  ML.SimPage = SimPage;

  ML.start = function () {
    document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ar');
    initTheme();
    ML.sims.sort((a, b) => a.unit - b.unit || a.order - b.order);
    root.addEventListener('hashchange', route);
    route();
  };
})(typeof window !== 'undefined' ? window : globalThis);
