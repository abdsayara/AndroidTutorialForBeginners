// اختبار شامل في المتصفح: كل محاكاة/تجربة (الرياضيات + الفيزياء) × ثلاثة مقاسات شاشة × كل منزلق (أدنى/أعلى/منتصف/صفر) + الأزرار والرسوم والأوضاع
// التشغيل: node tests/e2e.mjs [baseURL] [--shots] [--only=id] [--subject=g10-physics]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(process.env.PW_PATH || '/opt/node-tools/node_modules/playwright'); }
const base = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://127.0.0.1:8765/index.html';
const shots = process.argv.includes('--shots');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const subj = (process.argv.find((a) => a.startsWith('--subject=')) || '').slice(10);
const intl = process.argv.includes('--intl'); // الوضع الدولي؛ الافتراضي صيغة الكتاب العربية
const Q = intl ? '?n=intl' : '?n=ar';

const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
const sizes = [{ name: 'phone', width: 375, height: 760 }, { name: 'tablet', width: 820, height: 1100 }, { name: 'desktop', width: 1440, height: 900 }];
let failures = 0;
const fail = (m) => { failures++; console.log('  ✗ ' + m); };

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__ft = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { if (window.__ft.length < 4000) window.__ft.push(String(t)); return o.call(this, t, ...a); }; });
  await page.goto(base + Q, { waitUntil: 'load' });
  await page.waitForSelector('.units');
  const sims = await page.evaluate(() => ML.sims.map((s) => ({ id: s.id, subject: s.subject, href: ML.simHref(s) })));
  console.log(`[${size.name}] ${sims.length} sims, katex=${await page.evaluate(() => !!window.katex)}`);
  // صفحتا المادتين والتنقل بين التبويبات
  for (const sl of ['math', 'physics', 'biology', 'chemistry']) {
    await page.goto(base + Q + '#/g10/' + sl); await page.waitForSelector('.units .card, .units a'); await page.waitForTimeout(150);
    const st = await page.evaluate(() => ({ n: document.querySelectorAll('.units a[href*="/sim/"]').length, on: (document.querySelector('.stab.on') || {}).textContent || '', g: (document.querySelector('.gtab.on') || {}).textContent || '' }));
    if (!st.n || !st.g) fail(`home ${sl}: links=${st.n} gradeTab=${st.g}`);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) fail(`home ${sl}: horizontal overflow ${ov}px`);
    if (shots) await page.screenshot({ path: `tests/shots/home-${sl}-${size.name}.png`, fullPage: false });
  }
  for (const sm of sims) {
    const id = sm.id;
    if (only && id !== only) continue;
    if (subj && sm.subject !== subj) continue;
    errors.length = 0;
    await page.goto(base + Q + sm.href); await page.waitForSelector('.sim-grid canvas');
    await page.waitForTimeout(150);
    // كل منزلق: أدنى، أعلى، قيمة عشوائية
    const params = await page.evaluate(() => ML.current.sim.params.map((q) => ({ key: q.key, type: q.type || 'range', min: q.min, max: q.max })));
    for (const q of params) {
      const opts = q.type === 'select' ? await page.evaluate((k) => { const cur = ML.current; const qq = cur.sim.params.find((x) => x.key === k); return (typeof qq.options === 'function' ? qq.options(cur.p) : qq.options).map((o) => (isNaN(+o[0]) ? o[0] : +o[0])); }, q.key) : null;
      if (q.type === 'text') { // إدخال نصي: قيم خاطئة تُرفض برسالة، ثم قيمة صحيحة
        const bads = await page.evaluate((k) => { const qq = ML.current.sim.params.find((x) => x.key === k); return ['', '0', '-4', '7', 'XYZ', 'AUX'].filter((v) => qq.validate && qq.validate(qq.normalize ? qq.normalize(v) : v, ML.current.p)); }, q.key);
        const inp = await page.$(`.param[data-k="${q.key}"] input`); if (!(await inp.isVisible())) continue;
        for (const v of bads.slice(0, 3)) { await inp.fill(v); await page.waitForTimeout(40); const shown = await page.evaluate((k) => !document.querySelector(`.param[data-k="${k}"] .field-err`).hidden, q.key); if (!shown) fail(`${id} ${q.key}: invalid "${v}" not rejected`); }
        const good = await page.evaluate((k) => ML.current.sim.params.find((x) => x.key === k).value, q.key); await inp.fill(String(good)); await page.waitForTimeout(40);
        continue;
      }
      if (q.type === 'stage' && await page.isVisible(`.param[data-k="${q.key}"] [data-s=next]`)) { // أزرار المرحلة السابقة/التالية
        await page.evaluate((k) => ML.current.set(k, 0), q.key); await page.click(`.param[data-k="${q.key}"] [data-s=next]`); const v1 = await page.evaluate((k) => ML.current.p[k], q.key); if (v1 !== 1) fail(`${id} ${q.key}: next button → ${v1}`);
        await page.click(`.param[data-k="${q.key}"] [data-s=prev]`); const v0 = await page.evaluate((k) => ML.current.p[k], q.key); if (v0 !== 0) fail(`${id} ${q.key}: prev button → ${v0}`);
      }
      const vals = q.type === 'select' ? opts : q.type === 'toggle' ? [true, false] : [q.min, q.max, (q.min + q.max) / 2, q.min + (q.max - q.min) * 0.37].concat(q.min < 0 && q.max > 0 ? [0] : []);
      for (const v of vals) {
        await page.evaluate(([k, v]) => { const cur = ML.current; const qq = cur.sim.params.find((x) => x.key === k); const vv = (qq.type && qq.type !== 'stage' ? v : cur.fixParam(qq, v)); cur.set(k, vv); }, [q.key, v]);
        const bad = await page.evaluate(() => {
          const t = document.querySelector('.results').innerText + ' ' + document.querySelector('.live').innerText + ' ' + document.querySelector('.steps').innerText;
          return /NaN|undefined|Infinity(?!\))|\[object/.test(t) ? t.slice(0, 300) : null;
        });
        if (bad) fail(`${id} ${q.key}=${v}: bad text → ${bad.replace(/\s+/g, ' ')}`);
      }
    }
    // الأزرار
    await page.click('[data-a=rand]'); await page.waitForTimeout(520);
    if (await page.$('[data-a=play]')) {
      await page.click('[data-a=play]'); await page.waitForTimeout(sm.subject !== 'g10-math' ? 1500 : 400);
      if (await page.evaluate(() => ML.current.playing)) await page.click('[data-a=play]');
      const bad = await page.evaluate(() => { const t = document.querySelector('.results').innerText + ' ' + document.querySelector('.live').innerText; return /NaN|undefined|Infinity(?!\))|\[object/.test(t) ? t.slice(0, 300) : null; });
      if (bad) fail(`${id} after play: ${bad.replace(/\s+/g, ' ')}`);
    }
    // النقر والسحب على الرسم (مؤشر حقيقي: فأرة/لمس)
    if (await page.evaluate(() => !!ML.current.sim.onPointer)) {
      const cvEl = await page.$('.canvas-wrap canvas'); await cvEl.scrollIntoViewIfNeeded(); await page.waitForTimeout(80); const box = await cvEl.boundingBox(); const vh = page.viewportSize().height;
      const onCanvas = async (x, y) => page.evaluate(([X, Y]) => { const e = document.elementFromPoint(X, Y); return !!e && e.tagName === 'CANVAS' && !!e.closest('.canvas-wrap'); }, [box.x + x, box.y + y]);
      const inside = (x, y) => x > 2 && y > 2 && x < box.width - 2 && y < box.height - 2 && box.y + y > 2 && box.y + y < vh - 2;
      const hits = await page.evaluate(() => (ML.current.d.hits || []).slice(0, 40).map((h) => (h.r !== undefined ? [h.cx, h.cy] : [h.x + h.w / 2, h.y + h.h / 2])));
      for (const h of hits.filter((q, i) => i % 3 === 0 && inside(q[0], q[1])).slice(0, 8)) { if (!(await onCanvas(h[0], h[1]))) continue; await page.mouse.click(box.x + h[0], box.y + h[1]); await page.waitForTimeout(30); if (!(await page.evaluate(() => !!ML.current))) { fail(`${id}: canvas click navigated away → ${page.url()} at ${JSON.stringify(h)} box=${JSON.stringify(box)}`); break; } }
      const card = await page.evaluate(() => { const h = (ML.current.d.hits || []).find((q) => String(q.id).indexOf('card:') === 0); const b = (ML.current.d.hits || []).find((q) => String(q.id).indexOf('bin:') === 0); return h && b ? [h.x + h.w / 2, h.y + h.h / 2, b.x + b.w / 2, b.y + b.h - 12] : null; });
      if (card && inside(card[0], card[1]) && inside(card[2], card[3]) && (await onCanvas(card[0], card[1])) && (await onCanvas(card[2], card[3]))) { await page.mouse.move(box.x + card[0], box.y + card[1]); await page.mouse.down(); await page.mouse.move(box.x + card[2], box.y + card[3], { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(60); const placed = await page.evaluate(() => Object.values(ML.current.st.pos || {}).filter(Boolean).length); if (!placed) fail(`${id}: drag and drop did not place a card`); }
      const bad = await page.evaluate(() => { const t = document.querySelector('.results').innerText + ' ' + document.querySelector('.why').innerText; return /NaN|undefined|\[object/.test(t) ? t.slice(0, 200) : null; });
      if (bad) fail(`${id} after pointer: ${bad}`);
    }
    // المختبر ثلاثي الأبعاد: WebGL يعمل، ثم تنفيذ الوضع الموجّه بالنقر على الإجراء المضيء
    if (await page.$('.lab3d')) {
      const gl = await page.evaluate(() => !document.querySelector('.lab3d').classList.contains('no-webgl')); if (!gl) fail(`${id}: WebGL lab did not start`);
      await page.evaluate(() => { ML.current.set('mode', 'guided'); ML.current.resetState(); ML.current.update(); });
      for (let k = 0; k < 40; k++) {
        const nx = await page.$('.lab-actions .btn.next'); if (!nx) break;
        const act = await nx.getAttribute('data-act');
        if (act === 'extinguish' || act === 'recT2') { for (let w = 0; w < 60; w++) { const ok = await page.evaluate((a) => { const st = ML.current.st; return st.kind === 'comb' ? (ML.chem.combReading(st, ML.current.p) - st.T1 >= 10) : (st.t - st.tAdd >= 30); }, act); if (ok) break; await page.waitForTimeout(250); } }
        await nx.scrollIntoViewIfNeeded(); await nx.click(); await page.waitForTimeout(120);
      }
      const fin = await page.evaluate(() => { const st = ML.current.st; return st.kind === 'comb' ? ML.chem.combResults(st).dH : st.T2; });
      if (fin === null || fin === undefined) fail(`${id}: guided lab procedure did not complete`);
      if (await page.evaluate(() => ML.current.playing)) await page.click('[data-a=play]');
      // النقر على أداة في المشهد ثلاثي الأبعاد
      const lb = await (await page.$('.lab-cv')).boundingBox(); await page.mouse.click(lb.x + lb.width * 0.4, lb.y + lb.height * 0.5); await page.waitForTimeout(80);
      if (!(await page.evaluate(() => !!ML.current))) fail(`${id}: lab click navigated away`);
      const bad = await page.evaluate(() => { const t = document.querySelector('.lab3d').innerText + document.querySelector('.results').innerText; return /NaN|undefined|\[object/.test(t) ? t.slice(0, 200) : null; });
      if (bad) fail(`${id} lab text: ${bad}`);
    }
    // أنماط الرسم البياني الحي
    const gm = await page.$$('.gmodes button');
    for (const b of gm) { await b.click(); await page.waitForTimeout(60); const cap = await page.evaluate(() => (document.querySelector('.graph') || {}).innerText || ''); if (/NaN|undefined|\[object/.test(cap)) fail(`${id}: graph caption ${cap.slice(0, 200)}`); }
    if (sm.subject === 'g10-physics') { const ok = await page.evaluate(() => !!document.querySelector('.assume') && !!document.querySelector('.graph canvas')); if (!ok) fail(`${id}: missing assumptions box or live graph`); }
    await page.click('[data-a=reset]'); await page.waitForTimeout(520);
    // الأوضاع
    for (const m of ['learn', 'challenge', 'explore']) { await page.click(`.modes [data-m=${m}]`); await page.waitForTimeout(80); }
    // جميع التحديات: نطبّق init ثم نتحقق أن الحالة الابتدائية ليست محلولة مسبقاً
    const nCh = await page.evaluate(() => ML.current.sim.challenges.length);
    for (let i = 0; i < nCh; i++) {
      await page.evaluate((i) => { ML.current.chIdx = i; ML.current.setMode('challenge'); }, i);
      await page.waitForTimeout(520);
      const solved = await page.evaluate(() => document.querySelector('.ch-status').classList.contains('ok'));
      if (solved) fail(`${id}: challenge ${i + 1} is already solved by its init state`);
    }
    // صيغة الكتاب: لا أرقام إنجليزية في النصوص الظاهرة ولا على الرسوم (Canvas)
    if (!intl && sm.subject !== 'g10-chem') { // كتاب الكيمياء يكتب الأرقام بالصيغة الغربية
      const asc = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('.results, .live, .steps, .law, .why, .controls .param label, .graph .gcap, .assume, .sim-head .src').forEach((e) => { const t = e.innerText; if (/[0-9]/.test(t)) out.push(t.match(/.{0,30}[0-9].{0,20}/)[0]); });
        const bio = ML.current.sim.subject === 'g10-bio'; const LAT = /[0-9]*[A-Za-z][A-Za-z0-9′'’]*/g; // الأحياء: اللاتيني مسموح والأرقام داخله
        const cv = window.__ft.map((t) => t.replace(/[\u2066-\u2069]/g, '').replace(/\b[HNOC]₂/g, '')).map((t) => (bio ? t.replace(LAT, '') : t)).filter((t) => /[0-9]/.test(t) || (!bio && /(^|[^A-Za-z])[A-Za-z]($|[^A-Za-z])/.test(t)));
        window.__ft.length = 0; return (bio ? out.filter((t) => /[0-9]/.test(t.replace(LAT, ''))) : out).concat(cv.map((t) => 'canvas: ' + t)).slice(0, 5);
      });
      if (asc.length) fail(`${id}: western digits/latin symbols → ${asc.join(' | ')}`);
    }
    else await page.evaluate(() => { window.__ft.length = 0; }); // لا تنتقل نصوص رسوم الكيمياء إلى المحاكاة التالية
    // المساعد
    await page.click('.tutor .fab');
    const chips = await page.$$('.tutor .chip');
    for (const c of chips) await c.click({ timeout: 20000 }).catch((er) => fail(`${id}: tutor chip click → ${er.message.split('\n')[0]}`));
    await page.fill('.tutor form input', 'اشرح الدرس'); await page.press('.tutor form input', 'Enter');
    await page.waitForTimeout(200);
    const tutorBad = await page.evaluate(() => { const t = document.querySelector('.msgs').innerText; return /NaN|undefined|\[object/.test(t) ? t.slice(-300) : null; });
    if (tutorBad) fail(`${id}: tutor text → ${tutorBad}`);
    await page.click('.tutor .x');
    // لا تمرير أفقي للصفحة
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) fail(`${id}: horizontal overflow ${overflow}px`);
    if (errors.length) fail(`${id}: ${errors.join(' | ')}`);
    if (shots) await page.screenshot({ path: `tests/shots/${id}-${size.name}.png`, fullPage: size.name === 'phone' });
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL E2E CHECKS PASSED');
process.exit(failures ? 1 : 0);
