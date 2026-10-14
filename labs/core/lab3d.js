/* المختبر الافتراضي ثلاثي الأبعاد (Three.js): غرفة مختبر يتجوّل فيها الطالب، وأدوات تفاعلية تُنقر وتتحرك وتُقرأ.
 * الحالة العلمية كلها في المحاكاة (core/chem.js). هذا الملف يعرضها فقط:
 * - المواضع والمستويات واللهب والقراءات
 * - يحوّل النقر على الأدوات إلى إجراءات
 * الواجهة: ML.lab3d.mount(container, page, cfg) ← { update(), destroy() }
 * cfg يحتوي على:
 *   objects: [{ id, kind, opts }]
 *   state(st, p): { id: { pos, rot, visible, … } }
 *   actions(st, p): [{ id, label, icon, obj, next }]
 *   act(id)
 *   hud(st, p): [[label, value]]
 *   step(st, p): { n, total, text } أو null
 *   ppe(st): { goggles, coat, gloves, hood? }
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const L3 = ML.lab3d = {};
  L3.NAMES = {
    beaker: ['كأس زجاجي', 'Beaker'], flask: ['دورق مخروطي', 'Erlenmeyer Flask'], tubes: ['أنابيب اختبار', 'Test Tubes'], cylinder: ['مخبار مدرّج', 'Graduated Cylinder'],
    burette: ['سحّاحة', 'Burette'], pipette: ['ماصّة', 'Pipette'], dropper: ['قطّارة', 'Dropper'], thermo: ['ميزان حرارة', 'Thermometer'], balance: ['ميزان إلكتروني', 'Electronic Balance'],
    burner: ['موقد كحولي', 'Alcohol Burner'], bunsen: ['موقد بنسن', 'Bunsen Burner'], rod: ['قضيب زجاجي للتحريك', 'Stirring Rod'], bottle: ['زجاجة مادة كيميائية', 'Chemical Bottle'],
    jar: ['وعاء مادة صلبة', 'Chemical Jar'], tripod: ['حامل ثلاثي وشبكة تسخين', 'Tripod & Gauze'], goggles: ['نظارات واقية', 'Safety Goggles'], coat: ['معطف المختبر', 'Lab Coat'],
    gloves: ['قفازات', 'Gloves'], hood: ['خزانة الغازات', 'Fume Hood'], shield: ['واقٍ من تيارات الهواء', 'Draught Shield'], spatula: ['ملعقة', 'Spatula']
  };
  L3.INFO = {
    flask: 'وعاء مخروطي يُستخدم لخلط المحاليل ورجّها دون أن تنسكب.', tubes: 'تُستخدم لإجراء تفاعلات بكميات صغيرة.', burette: 'تُستخدم لإضافة حجوم دقيقة من محلول (في المعايرة).',
    pipette: 'تنقل حجماً محدداً من سائل بدقة.', dropper: 'تضيف السائل قطرة قطرة.', bunsen: 'موقد غاز يعطي لهباً ساخناً قابلاً للضبط.', spatula: 'لتناول المواد الصلبة دون لمسها باليد.'
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- مكتبة الأدوات ---------- */
  function lib(THREE) {
    const V2 = THREE.Vector2;
    const M = {
      glass: new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.26, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
      metal: new THREE.MeshStandardMaterial({ color: 0xa8b0bb, metalness: 0.85, roughness: 0.3 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.45 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.55 }),
      white: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 }),
      red: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }),
      blue: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
      wick: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 })
    };
    const liquid = (c, o) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o || 0.6, roughness: 0.15, depthWrite: false });
    const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
    const lathe = (pts, mat, seg) => mesh(new THREE.LatheGeometry(pts.map((q) => new V2(q[0], q[1])), seg || 32), mat);
    const cyl = (rt, rb, h, mat, seg, open) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open), mat);
    const box = (w, h, d, mat) => mesh(new THREE.BoxGeometry(w, h, d), mat);
    const sph = (r, mat) => mesh(new THREE.SphereGeometry(r, 20, 14), mat);
    // نسيج نصي (ملصقات وشاشات)
    function textTex(w, h, draw) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
      const api = { cv: cv, tex: tex, last: null, draw(arg) { const k = JSON.stringify(arg); if (k === api.last) return; api.last = k; const c = cv.getContext('2d'); c.clearRect(0, 0, w, h); draw(c, arg, w, h); tex.needsUpdate = true; } };
      return api;
    }
    function label(text, sub, color) {
      const t = textTex(256, 128, (c, a) => {
        c.fillStyle = '#fffbeb'; c.fillRect(0, 0, 256, 128); c.fillStyle = a.color || '#b91c1c'; c.fillRect(0, 0, 256, 18);
        c.fillStyle = '#111827'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 44px system-ui, sans-serif'; c.fillText(a.text, 128, 62);
        c.font = '600 26px Tajawal, system-ui, sans-serif'; c.fillText(a.sub || '', 128, 104);
      });
      t.draw({ text: text, sub: sub, color: color });
      return t;
    }
    const K = {};
    K.beaker = function (o) {
      const r = o.r || 0.035, h = o.h || 0.09; const g = new THREE.Group();
      g.add(lathe([[0, 0.001], [r, 0.001], [r, h], [r * 1.08, h + 0.004]], M.glass));
      for (let i = 1; i <= 4; i++) { const m = box(r * 0.5, 0.0012, 0.0005, M.white); m.position.set(0, h * i / 5, r + 0.0005); g.add(m); }
      const wm = liquid(0x60a5fa, 0.55); const water = cyl(r * 0.95, r * 0.95, 1, wm, 32); water.visible = false; g.add(water);
      const sootM = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0, depthWrite: false });
      const soot = mesh(new THREE.CircleGeometry(r * 0.98, 24), sootM); soot.rotation.x = Math.PI / 2; soot.position.y = -0.0004; g.add(soot);
      const solid = cyl(r * 0.6, r * 0.75, 0.012, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }), 16); solid.visible = false; solid.position.y = 0.007; g.add(solid);
      const bub = []; for (let i = 0; i < 14; i++) { const b = sph(0.0018 + Math.random() * 0.0015, M.glass); b.visible = false; b.userData.ph = Math.random(); b.userData.x = (Math.random() - 0.5) * r * 1.4; b.userData.z = (Math.random() - 0.5) * r * 1.4; g.add(b); bub.push(b); }
      return { g: g, height: h, set(s, dt) {
        const lv = clamp(s.level || 0, 0, 1) * h * 0.92; water.visible = lv > 0.001; water.scale.y = Math.max(lv, 0.0001); water.position.y = lv / 2 + 0.002;
        if (s.color !== undefined) wm.color.setHex(s.color);
        sootM.opacity = clamp(s.soot || 0, 0, 0.8);
        solid.visible = !!s.solid; if (s.solid) solid.material.color.setHex(s.solidColor || 0xf8fafc);
        bub.forEach((b) => { b.visible = !!s.bubbles && lv > 0.01; if (!b.visible) return; b.userData.ph = (b.userData.ph + dt * 0.9) % 1; b.position.set(b.userData.x, 0.004 + b.userData.ph * lv, b.userData.z); });
      } };
    };
    K.cylinder = function () {
      const r = 0.013, h = 0.25; const g = new THREE.Group();
      const base = cyl(0.032, 0.034, 0.008, M.glass, 6); base.position.y = 0.004; g.add(base);
      const tube = lathe([[0, 0.008], [r, 0.008], [r, h], [r * 1.25, h + 0.004]], M.glass, 24); g.add(tube);
      for (let i = 1; i <= 10; i++) { const m = box(i % 5 === 0 ? 0.012 : 0.007, 0.0008, 0.0006, M.white); m.position.set(0, 0.012 + (h - 0.03) * i / 10, r + 0.0004); g.add(m); }
      const wm = liquid(0x60a5fa, 0.6); const water = cyl(r * 0.92, r * 0.92, 1, wm, 20); water.visible = false; g.add(water);
      return { g: g, set(s) { const lv = clamp(s.level || 0, 0, 1) * (h - 0.03); water.visible = lv > 0.001; water.scale.y = Math.max(lv, 0.0001); water.position.y = 0.01 + lv / 2; if (s.color !== undefined) wm.color.setHex(s.color); } };
    };
    K.thermo = function () {
      const g = new THREE.Group(); const H = 0.3;
      const tube = cyl(0.0038, 0.0038, H, M.glass, 12); tube.position.y = H / 2; g.add(tube);
      const bulb = sph(0.0055, M.red); bulb.position.y = 0.006; g.add(bulb);
      const col = cyl(0.0016, 0.0016, 1, M.red, 8); g.add(col);
      for (let i = 0; i <= 11; i++) { const m = box(0.004, 0.0006, 0.0005, M.dark); m.position.set(0, 0.02 + i * 0.024, 0.0036); g.add(m); }
      return { g: g, set(s) { const f = clamp(((s.T === undefined ? 20 : s.T) + 10) / 120, 0.01, 1); const L = 0.02 + f * (H - 0.04); col.scale.y = L; col.position.y = L / 2 + 0.006; } };
    };
    K.balance = function () {
      const g = new THREE.Group();
      const body = box(0.2, 0.05, 0.22, M.dark); body.position.y = 0.025; g.add(body);
      const plate = cyl(0.07, 0.07, 0.006, M.metal, 32); plate.position.set(0, 0.053, -0.015); g.add(plate);
      const lcd = textTex(256, 80, (c, a) => { c.fillStyle = '#0f2e1a'; c.fillRect(0, 0, 256, 80); c.fillStyle = '#86efac'; c.font = '700 46px "Courier New", monospace'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(a.t, 236, 42); });
      const scr = mesh(new THREE.PlaneGeometry(0.11, 0.034), new THREE.MeshBasicMaterial({ map: lcd.tex })); scr.position.set(0, 0.032, 0.1102); scr.rotation.x = -0.25; g.add(scr);
      return { g: g, top: 0.056, set(s) { lcd.draw({ t: s.text || '0.00 g' }); } };
    };
    K.tripod = function () {
      const g = new THREE.Group();
      const ring = mesh(new THREE.TorusGeometry(0.058, 0.0035, 8, 32), M.steel); ring.rotation.x = Math.PI / 2; g.add(ring);
      const gauzeTex = textTex(128, 128, (c) => { c.fillStyle = '#6b7280'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#374151'; c.lineWidth = 2; for (let i = 0; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); } c.fillStyle = '#e5e7eb'; c.beginPath(); c.arc(64, 64, 34, 0, Math.PI * 2); c.fill(); });
      gauzeTex.draw({});
      const gauze = mesh(new THREE.PlaneGeometry(0.13, 0.13), new THREE.MeshStandardMaterial({ map: gauzeTex.tex, roughness: 0.9, side: THREE.DoubleSide })); gauze.rotation.x = -Math.PI / 2; gauze.position.y = 0.004; g.add(gauze);
      const legs = []; for (let i = 0; i < 3; i++) { const l = cyl(0.003, 0.003, 1, M.steel, 8); g.add(l); legs.push(l); }
      return { g: g, set(s) {
        const H = s.height || 0.16; ring.position.y = H; gauze.position.y = H + 0.004;
        legs.forEach((l, i) => { const a = i * 2 * Math.PI / 3 + 0.5; const top = new THREE.Vector3(Math.cos(a) * 0.058, H, Math.sin(a) * 0.058); const bot = new THREE.Vector3(Math.cos(a) * 0.075, 0, Math.sin(a) * 0.075);
          const mid = top.clone().add(bot).multiplyScalar(0.5); l.position.copy(mid); l.scale.y = top.distanceTo(bot); l.lookAt(top); l.rotateX(Math.PI / 2); });
      } };
    };
    K.burner = function () {
      const g = new THREE.Group();
      g.add(lathe([[0, 0.001], [0.03, 0.001], [0.04, 0.02], [0.038, 0.05], [0.014, 0.062], [0.012, 0.075]], M.glass, 28));
      const fm = liquid(0x93c5fd, 0.5); const fuel = cyl(0.034, 0.036, 1, fm, 24); g.add(fuel);
      const collar = cyl(0.013, 0.013, 0.01, M.metal, 16); collar.position.y = 0.078; g.add(collar);
      const wick = cyl(0.0035, 0.0035, 0.012, M.wick, 8); wick.position.y = 0.088; g.add(wick);
      const cap = cyl(0.014, 0.016, 0.022, new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.3, roughness: 0.4 }), 16); cap.position.y = 0.09; g.add(cap);
      const flame = new THREE.Group(); flame.position.y = 0.094; g.add(flame);
      const outerM = new THREE.MeshBasicMaterial({ color: 0xffa62b, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
      const innerM = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
      const outer = mesh(new THREE.ConeGeometry(0.009, 0.045, 16, 1, true), outerM); outer.position.y = 0.0225; flame.add(outer);
      const core = sph(0.009, outerM); core.scale.set(1, 0.7, 1); flame.add(core);
      const inner = mesh(new THREE.ConeGeometry(0.004, 0.016, 12, 1, true), innerM); inner.position.y = 0.008; flame.add(inner);
      const light = new THREE.PointLight(0xffa040, 0, 1.2, 2); light.position.y = 0.12; g.add(light);
      return { g: g, set(s, dt, t) {
        const lv = clamp(s.fuel || 0, 0, 1) * 0.045; fuel.visible = lv > 0.0005; fuel.scale.y = Math.max(lv, 0.0001); fuel.position.y = 0.002 + lv / 2;
        if (s.fuelColor !== undefined) fm.color.setHex(s.fuelColor);
        flame.visible = !!s.lit; cap.visible = !s.lit && s.cap !== false;
        light.intensity = s.lit ? 1.2 + Math.sin(t * 23) * 0.15 + Math.sin(t * 37) * 0.1 : 0;
        if (s.lit) { const k = 1 + Math.sin(t * 19) * 0.06 + Math.sin(t * 31) * 0.05; flame.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k)); outerM.color.setHex(s.sooty ? 0xff7a1a : 0xffa62b); }
      } };
    };
    K.bottle = function (o) {
      const g = new THREE.Group();
      const body = cyl(0.03, 0.03, 0.1, new THREE.MeshStandardMaterial({ color: o.glass || 0x92400e, transparent: true, opacity: 0.82, roughness: 0.15 }), 24); body.position.y = 0.05; g.add(body);
      const sh = cyl(0.012, 0.03, 0.025, body.material, 24); sh.position.y = 0.1125; g.add(sh);
      const cp = cyl(0.013, 0.013, 0.02, new THREE.MeshStandardMaterial({ color: o.cap || 0x111827, roughness: 0.5 }), 16); cp.position.y = 0.135; g.add(cp);
      const lb = label(o.text || '', o.sub || '', o.band);
      const pl = mesh(new THREE.PlaneGeometry(0.046, 0.023 * 1.0), new THREE.MeshStandardMaterial({ map: lb.tex, roughness: 0.8 })); pl.position.set(0, 0.052, 0.0305); g.add(pl);
      return { g: g, set(s) { if (s.text !== undefined) lb.draw({ text: s.text, sub: s.sub, color: o.band }); } };
    };
    K.jar = function (o) {
      const g = new THREE.Group();
      const body = cyl(0.032, 0.032, 0.075, new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9, roughness: 0.5 }), 24); body.position.y = 0.0375; g.add(body);
      const cp = cyl(0.034, 0.034, 0.016, new THREE.MeshStandardMaterial({ color: o.cap || 0x1d4ed8, roughness: 0.5 }), 24); cp.position.y = 0.083; g.add(cp);
      const lb = label(o.text || '', o.sub || '', o.band || '#1d4ed8');
      const pl = mesh(new THREE.PlaneGeometry(0.05, 0.025), new THREE.MeshStandardMaterial({ map: lb.tex, roughness: 0.8 })); pl.position.set(0, 0.04, 0.0325); g.add(pl);
      return { g: g, set() {} };
    };
    K.rod = function () { const g = new THREE.Group(); const m = cyl(0.0025, 0.0025, 0.2, M.glass, 8); m.position.y = 0.1; g.add(m); return { g: g, set() {} }; };
    K.shield = function () {
      const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide });
      [[0, -0.1, 0], [-0.1, 0, Math.PI / 2], [0.1, 0, Math.PI / 2]].forEach(([x, z, ry]) => { const p = box(0.16, 0.2, 0.002, mat); p.position.set(x, 0.1, z); p.rotation.y = ry; g.add(p); });
      return { g: g, set() {} };
    };
    K.flask = function () {
      const g = new THREE.Group(); g.add(lathe([[0, 0.001], [0.045, 0.001], [0.046, 0.008], [0.014, 0.09], [0.014, 0.12], [0.017, 0.123]], M.glass));
      const l = lathe([[0, 0.002], [0.042, 0.002], [0.043, 0.008], [0.03, 0.035], [0, 0.035]], liquid(0xf472b6, 0.55)); g.add(l); return { g: g, set() {} };
    };
    K.tubes = function () {
      const g = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
      const top = box(0.2, 0.012, 0.05, wood); top.position.y = 0.07; g.add(top); const bot = box(0.2, 0.01, 0.05, wood); bot.position.y = 0.005; g.add(bot);
      [-0.095, 0.095].forEach((x) => { const s = box(0.01, 0.075, 0.05, wood); s.position.set(x, 0.038, 0); g.add(s); });
      [0x22c55e, 0x3b82f6, 0xf59e0b, 0xa855f7].forEach((c, i) => { const x = -0.06 + i * 0.04; const t = cyl(0.008, 0.008, 0.12, M.glass, 12, true); t.position.set(x, 0.07, 0); g.add(t); const lq = cyl(0.007, 0.007, 0.04, liquid(c, 0.7), 12); lq.position.set(x, 0.035, 0); g.add(lq); });
      return { g: g, set() {} };
    };
    K.burette = function () {
      const g = new THREE.Group();
      const base = box(0.14, 0.012, 0.09, M.dark); base.position.y = 0.006; g.add(base);
      const rod = cyl(0.005, 0.005, 0.6, M.metal, 10); rod.position.set(-0.04, 0.3, -0.02); g.add(rod);
      const cl = box(0.06, 0.012, 0.012, M.steel); cl.position.set(-0.012, 0.45, -0.02); g.add(cl);
      const tube = cyl(0.0065, 0.0065, 0.45, M.glass, 12); tube.position.set(0.02, 0.38, -0.02); g.add(tube);
      const lq = cyl(0.0058, 0.0058, 0.3, liquid(0x38bdf8, 0.6), 12); lq.position.set(0.02, 0.33, -0.02); g.add(lq);
      const sc = box(0.02, 0.006, 0.006, M.dark); sc.position.set(0.02, 0.15, -0.02); g.add(sc);
      const tip = mesh(new THREE.ConeGeometry(0.004, 0.03, 8), M.glass); tip.rotation.x = Math.PI; tip.position.set(0.02, 0.13, -0.02); g.add(tip);
      return { g: g, set() {} };
    };
    K.pipette = function () { const g = new THREE.Group(); const t = cyl(0.003, 0.003, 0.3, M.glass, 8); t.rotation.z = Math.PI / 2; t.position.y = 0.012; g.add(t); const b = sph(0.009, M.glass); b.position.set(0.02, 0.012, 0); g.add(b); return { g: g, set() {} }; };
    K.dropper = function () { const g = new THREE.Group(); const b = sph(0.009, M.red); b.scale.set(1, 1.4, 1); b.position.set(-0.04, 0.01, 0); b.rotation.z = Math.PI / 2; g.add(b); const t = cyl(0.002, 0.004, 0.07, M.glass, 8); t.rotation.z = Math.PI / 2; t.position.set(0.0, 0.01, 0); g.add(t); return { g: g, set() {} }; };
    K.bunsen = function () { const g = new THREE.Group(); const b = cyl(0.035, 0.04, 0.012, M.dark, 24); b.position.y = 0.006; g.add(b); const t = cyl(0.007, 0.007, 0.13, M.metal, 12); t.position.y = 0.075; g.add(t); const c = cyl(0.009, 0.009, 0.015, M.steel, 12); c.position.y = 0.03; g.add(c); return { g: g, set() {} }; };
    K.spatula = function () { const g = new THREE.Group(); const h = box(0.16, 0.003, 0.008, M.metal); h.position.y = 0.004; g.add(h); const s = box(0.03, 0.002, 0.016, M.metal); s.position.set(0.09, 0.004, 0); g.add(s); return { g: g, set() {} }; };
    K.goggles = function () {
      const g = new THREE.Group(); const fm = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 });
      [-0.035, 0.035].forEach((x) => { const t = mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 24), fm); t.position.x = x; g.add(t); const l = mesh(new THREE.CircleGeometry(0.025, 20), M.glass); l.position.x = x; g.add(l); });
      const st = mesh(new THREE.TorusGeometry(0.075, 0.003, 6, 30, Math.PI), new THREE.MeshStandardMaterial({ color: 0x111827 })); st.rotation.z = Math.PI; st.position.y = -0.0; g.add(st);
      return { g: g, set() {} };
    };
    K.coat = function () {
      const g = new THREE.Group(); const w = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
      const body = box(0.32, 0.55, 0.05, w); body.position.y = -0.3; g.add(body);
      [-1, 1].forEach((sx) => { const sl = box(0.07, 0.42, 0.05, w); sl.position.set(sx * 0.2, -0.26, 0); sl.rotation.z = sx * 0.12; g.add(sl); });
      const col = box(0.14, 0.05, 0.055, w); col.position.y = -0.02; g.add(col);
      const hook = cyl(0.004, 0.004, 0.04, M.metal, 8); hook.rotation.x = Math.PI / 2; hook.position.set(0, 0, -0.03); g.add(hook);
      const pk = box(0.06, 0.04, 0.052, new THREE.MeshStandardMaterial({ color: 0x93c5fd })); pk.position.set(-0.08, -0.2, 0.001); g.add(pk);
      return { g: g, set() {} };
    };
    K.gloves = function () {
      const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 });
      [-0.045, 0.045].forEach((x) => { const p = box(0.06, 0.08, 0.02, m); p.position.set(x, 0, 0); g.add(p); for (let i = 0; i < 4; i++) { const f = cyl(0.006, 0.006, 0.035, m, 8); f.position.set(x - 0.021 + i * 0.014, 0.055, 0); g.add(f); } });
      return { g: g, set() {} };
    };
    return { K: K, M: M, textTex: textTex, liquid: liquid, box: box, cyl: cyl };
  }

  /* ---------- الغرفة ---------- */
  function buildRoom(THREE, scene, Lb) {
    const { box, M } = Lb;
    const std = (c, r) => new THREE.MeshStandardMaterial({ color: c, roughness: r === undefined ? 0.8 : r });
    const tile = Lb.textTex(256, 256, (c) => { c.fillStyle = '#d6dbe3'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#b8c0cc'; c.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
    tile.draw({}); tile.tex.wrapS = tile.tex.wrapT = THREE.RepeatWrapping; tile.tex.repeat.set(6, 6);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ map: tile.tex, roughness: 0.7 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 1.4); scene.add(floor);
    const wallM = std(0xe8edf3, 0.95);
    const back = box(8, 3, 0.05, wallM); back.position.set(0, 1.5, -0.55); scene.add(back);
    const left = box(0.05, 3, 6, wallM); left.position.set(-3, 1.5, 2.4); scene.add(left);
    const right = box(0.05, 3, 6, wallM); right.position.set(3, 1.5, 2.4); scene.add(right);
    // نافذة
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75), new THREE.MeshBasicMaterial({ color: 0xbfe3ff })); win.position.set(0.25, 2.05, -0.52); scene.add(win);
    const frameM = std(0xf8fafc, 0.5); [[0.25, 2.43, 1.36, 0.04], [0.25, 1.67, 1.36, 0.04], [-0.42, 2.05, 0.04, 0.8], [0.92, 2.05, 0.04, 0.8], [0.25, 2.05, 0.03, 0.75]].forEach(([x, y, w, h]) => { const f = box(w, h, 0.03, frameM); f.position.set(x, y, -0.51); scene.add(f); });
    // طاولة المختبر
    const top = box(4.6, 0.04, 1.0, std(0x334155, 0.35)); top.position.set(0, 0.88, 0); scene.add(top);
    const cab = box(4.5, 0.84, 0.92, std(0x94a3b8, 0.7)); cab.position.set(0, 0.42, -0.02); scene.add(cab);
    for (let i = 0; i < 6; i++) { const d = box(0.7, 0.7, 0.01, std(0xcbd5e1, 0.6)); d.position.set(-1.9 + i * 0.76, 0.43, 0.445); scene.add(d); const hdl = box(0.12, 0.012, 0.02, M.metal); hdl.position.set(-1.9 + i * 0.76, 0.7, 0.455); scene.add(hdl); }
    // رف المواد
    const shelf = box(1.7, 0.025, 0.22, std(0xf1f5f9, 0.5)); shelf.position.set(0.55, 1.42, -0.41); scene.add(shelf);
    [-0.28, 1.38].forEach((x) => { const b = box(0.02, 0.1, 0.2, std(0xcbd5e1)); b.position.set(x, 1.37, -0.41); scene.add(b); });
    // لوحة أدوات الوقاية
    const board = box(0.62, 0.6, 0.02, std(0xfef3c7, 0.8)); board.position.set(-1.72, 1.5, -0.515); scene.add(board);
    const sign = Lb.textTex(256, 64, (c) => { c.fillStyle = '#16a34a'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#fff'; c.font = '700 30px Tajawal, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('أدوات الوقاية', 128, 34); });
    sign.draw({}); const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshBasicMaterial({ map: sign.tex })); sg.position.set(-1.72, 1.86, -0.5); scene.add(sg);
    // خزانة الغازات
    const hood = new THREE.Group(); hood.position.set(1.85, 0.9, -0.05);
    const hm = std(0xe2e8f0, 0.6);
    const hb = box(0.9, 0.95, 0.04, hm); hb.position.set(0, 0.47, -0.43); hood.add(hb);
    const sideM = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.35, roughness: 0.3, depthWrite: false });
    [-0.45, 0.45].forEach((x) => { const s = box(0.03, 0.95, 0.9, sideM); s.position.set(x, 0.47, 0); hood.add(s); const e = box(0.04, 0.95, 0.04, hm); e.position.set(x, 0.47, 0.43); hood.add(e); });
    const ht = box(0.94, 0.25, 0.9, hm); ht.position.set(0, 1.07, 0); hood.add(ht);
    const sash = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.45), new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); sash.position.set(0, 0.72, 0.44); hood.add(sash);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.rotation.x = Math.PI / 2; hl.position.set(0, 0.94, 0); hood.add(hl);
    const hs = Lb.textTex(256, 64, (c) => { c.fillStyle = '#0f172a'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#fbbf24'; c.font = '700 28px Tajawal, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('خزانة الغازات', 128, 34); });
    hs.draw({}); const hsg = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshBasicMaterial({ map: hs.tex })); hsg.position.set(0, 1.07, 0.452); hood.add(hsg);
    hood.traverse((m) => { m.userData.tool = 'hood'; });
    scene.add(hood);
    // إضاءة السقف
    for (let i = -1; i <= 1; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff })); p.rotation.x = Math.PI / 2; p.position.set(i * 1.6, 2.98, 0.8); scene.add(p); }
    return { hood: hood };
  }

  /* ---------- التركيب ---------- */
  L3.mount = function (container, page, cfg) {
    container.innerHTML = '<h3>المختبر الافتراضي ثلاثي الأبعاد <small>3D Virtual Lab</small></h3>' +
      '<div class="lab-top"><div class="lab-step" aria-live="polite"></div><div class="lab-ppe" aria-label="أدوات الوقاية"></div></div>' +
      '<div class="lab-wrap" tabindex="0" role="application" aria-label="مشهد المختبر ثلاثي الأبعاد: اسحب للتدوير، وانقر أداة لاستخدامها">' +
      '<canvas class="lab-cv"></canvas><div class="lab-hud" aria-live="polite"></div><div class="lab-tip" hidden></div><div class="lab-alert" role="alert" hidden></div>' +
      '<div class="lab-nav"><button type="button" class="btn icon" data-n="left" aria-label="تدوير لليسار">⟲</button><button type="button" class="btn icon" data-n="right" aria-label="تدوير لليمين">⟳</button><button type="button" class="btn icon" data-n="in" aria-label="تقريب">+</button><button type="button" class="btn icon" data-n="out" aria-label="تبعيد">−</button><button type="button" class="btn icon" data-n="home" aria-label="العرض الابتدائي">⌂</button><button type="button" class="btn icon" data-n="walk" aria-label="وضع التجوّل" title="وضع التجوّل">🚶</button></div>' +
      '<div class="lab-walk" hidden><button type="button" class="btn icon" data-w="f" aria-label="إلى الأمام">▲</button><button type="button" class="btn icon" data-w="l" aria-label="يسار">◀</button><button type="button" class="btn icon" data-w="b" aria-label="إلى الخلف">▼</button><button type="button" class="btn icon" data-w="r" aria-label="يمين">▶</button></div>' +
      '<div class="lab-fallback" hidden>تعذّر تشغيل العرض ثلاثي الأبعاد (WebGL) في هذا المتصفح. يمكنك تنفيذ التجربة كاملة من أزرار الإجراءات أدناه، ومتابعة القياسات في لوحة النتائج.</div></div>' +
      '<div class="lab-actions" role="toolbar" aria-label="إجراءات المختبر"></div>' +
      '<p class="hint">اسحب لتدوير الكاميرا • العجلة أو +/− للتقريب • 🚶 للتجوّل في المختبر (W A S D أو الأسهم) • انقر أي أداة لاستخدامها أو للتعرّف عليها</p>';
    const wrap = container.querySelector('.lab-wrap'), cv = container.querySelector('.lab-cv');
    const hudEl = container.querySelector('.lab-hud'), tipEl = container.querySelector('.lab-tip'), alertEl = container.querySelector('.lab-alert');
    const stepEl = container.querySelector('.lab-step'), ppeEl = container.querySelector('.lab-ppe'), actEl = container.querySelector('.lab-actions');
    let alive = true, raf = 0, three = null, tipT = 0, alertT = 0;

    function toast(msg, kind) {
      const el = kind === 'safety' ? alertEl : tipEl; const html = (kind === 'safety' ? '⚠️ ' : '') + ML.rich(msg);
      el.innerHTML = html; el.hidden = false; el.className = kind === 'safety' ? 'lab-alert' : 'lab-tip' + (kind === 'bad' ? ' bad' : '');
      clearTimeout(kind === 'safety' ? alertT : tipT);
      const t = setTimeout(() => { el.hidden = true; }, kind === 'safety' ? 9000 : 4500);
      if (kind === 'safety') alertT = t; else tipT = t;
    }
    function doAct(id, viaScene) {
      const r = cfg.act(id) || {};
      toast(r.msg || '', r.safety ? 'safety' : r.ok ? 'ok' : 'bad');
      const a = (cfg.actions(page.st, page.p) || []).find((x) => x.id === id);
      if (three && a && !viaScene) three.focus(typeof a.obj === 'function' ? a.obj(page.st) : a.obj);
      return r;
    }
    function renderUI() {
      const st = page.st, p = page.p;
      const acts = cfg.actions(st, p) || [];
      const html = acts.map((a) => '<button type="button" class="btn' + (a.next ? ' next' : '') + '" data-act="' + a.id + '">' + (a.icon ? '<span aria-hidden="true">' + a.icon + '</span> ' : '') + ML.rich(a.label) + '</button>').join('');
      if (actEl._h !== html) { actEl.innerHTML = html; actEl._h = html; }
      const hud = cfg.hud(st, p) || [];
      const hh = hud.map((x) => '<div><small>' + esc(x[0]) + '</small><b>' + ML.rich(x[1]) + '</b></div>').join('');
      if (hudEl._h !== hh) { hudEl.innerHTML = hh; hudEl._h = hh; }
      const sp = cfg.step(st, p);
      const sh = sp ? '<span class="lab-mode">' + esc(sp.mode || '') + '</span>' + (sp.total ? '<b>الخطوة ' + Math.min(sp.n + 1, sp.total) + ' / ' + sp.total + '</b> ' : '') + ML.rich(sp.text) : '';
      if (stepEl._h !== sh) { stepEl.innerHTML = sh; stepEl._h = sh; }
      const ppe = cfg.ppe(st) || {};
      const ph = [['goggles', '🥽', 'نظارات'], ['coat', '🥼', 'معطف'], ['gloves', '🧤', 'قفازات'], ['hood', '🌬', 'خزانة الغازات']].filter((x) => ppe[x[0]] !== undefined).map((x) => '<span class="chip-ppe' + (ppe[x[0]] ? ' on' : '') + '" title="' + x[2] + '">' + x[1] + ' ' + x[2] + ' ' + (ppe[x[0]] ? '✓' : '✗') + '</span>').join('');
      if (ppeEl._h !== ph) { ppeEl.innerHTML = ph; ppeEl._h = ph; }
    }
    actEl.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) doAct(b.dataset.act); });

    /* ---------- Three.js ---------- */
    function initThree() {
      const THREE = root.THREE; if (!THREE) return null;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
      if (!renderer.getContext()) return null;
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 1.75));
      renderer.outputEncoding = THREE.sRGBEncoding;
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdfe7f1); scene.fog = new THREE.Fog(0xdfe7f1, 5, 11);
      const camera = new THREE.PerspectiveCamera(48, 1, 0.01, 40);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9bb0, 0.85));
      const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(1.5, 3, 2.5); scene.add(sun);
      const Lb = lib(THREE); buildRoom(THREE, scene, Lb);
      const objs = {};
      (cfg.objects || []).forEach((o) => {
        const f = Lb.K[o.kind]; if (!f) return;
        const it = f(o.opts || {}); it.id = o.id; it.kind = o.kind; it.opts = o.opts || {};
        it.g.traverse((m) => { m.userData.tool = o.id; }); scene.add(it.g); objs[o.id] = it; it.first = true;
      });
      // مؤشر الخطوة التالية (سهم متحرك)
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e })); arrow.rotation.x = Math.PI; arrow.visible = false; scene.add(arrow);
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.003, 6, 40), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.8 })); ringA.rotation.x = Math.PI / 2; ringA.visible = false; scene.add(ringA);
      const aspect0 = wrap.clientWidth / Math.max(1, wrap.clientHeight);
      const cam = { target: new THREE.Vector3(-0.22, 0.98, 0.0), yaw: 0.06, pitch: 0.5, dist: aspect0 < 1.2 ? 1.3 : 1.05, walk: false };
      const HOME = { t: cam.target.clone(), yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
      const goal = { t: cam.target.clone(), yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
      const keys = {};
      function place() { const cp = Math.cos(cam.pitch); camera.position.set(cam.target.x + Math.sin(cam.yaw) * cp * cam.dist, cam.target.y + Math.sin(cam.pitch) * cam.dist, cam.target.z + Math.cos(cam.yaw) * cp * cam.dist); camera.lookAt(cam.target); }
      function resize() { const r = wrap.getBoundingClientRect(); const w = Math.max(10, r.width), h = Math.max(10, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
      const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
      // التفاعل بالمؤشر
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      let drag = null;
      const pick = (e) => { const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(scene.children, true).find((h) => h.object.userData.tool && h.object.visible); return hit ? hit.object.userData.tool : null; };
      cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId }; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
      cv.addEventListener('pointermove', (e) => {
        if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY; goal.yaw -= dx * 0.006; goal.pitch = clamp(goal.pitch + dy * 0.005, -0.2, 1.35); return; }
        const id = pick(e); cv.style.cursor = id ? 'pointer' : 'grab';
        if (id && id !== hoverId) { hoverId = id; const it = objs[id]; const nm = L3.NAMES[(it && it.opts.name) || (it && it.kind) || id] || [id, '']; tipEl.hidden = false; tipEl.className = 'lab-tip hover'; tipEl.innerHTML = '<b>' + esc((it && it.opts.title) || nm[0]) + '</b> <span lang="en">' + esc(nm[1]) + '</span>'; }
        if (!id) hoverId = null;
      });
      let hoverId = null;
      const up = (e) => {
        if (!drag) return; const moved = drag.moved; drag = null;
        if (moved > 6) return;
        const id = pick(e); if (!id) return;
        const acts = cfg.actions(page.st, page.p) || [];
        const objOf = (a) => (typeof a.obj === 'function' ? a.obj(page.st) : a.obj);
        const a = acts.filter((x) => objOf(x) === id).sort((x, y) => (y.next ? 1 : 0) - (x.next ? 1 : 0))[0];
        const it = objs[id]; const nm = L3.NAMES[(it && it.opts.name) || (it && it.kind) || id] || [id, ''];
        if (a) { doAct(a.id, true); three.focus(id); }
        else toast('**' + ((it && it.opts.title) || nm[0]) + '** (' + nm[1] + '): ' + (L3.INFO[(it && it.kind) || id] || 'لا يوجد إجراء متاح لهذه الأداة في الخطوة الحالية.'), 'ok');
      };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { drag = null; });
      cv.addEventListener('wheel', (e) => { e.preventDefault(); goal.dist = clamp(goal.dist * (e.deltaY > 0 ? 1.12 : 0.89), 0.25, 4); }, { passive: false });
      wrap.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'e'].indexOf(k) >= 0) { keys[k] = true; e.preventDefault(); } });
      wrap.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
      wrap.addEventListener('blur', () => { Object.keys(keys).forEach((k) => { keys[k] = false; }); });
      const nav = (n) => {
        if (n === 'left') goal.yaw += 0.35; else if (n === 'right') goal.yaw -= 0.35; else if (n === 'in') goal.dist = clamp(goal.dist * 0.8, 0.25, 4); else if (n === 'out') goal.dist = clamp(goal.dist * 1.25, 0.25, 4);
        else if (n === 'home') { goal.t.copy(HOME.t); goal.yaw = HOME.yaw; goal.pitch = HOME.pitch; goal.dist = HOME.dist; cam.walk = false; container.querySelector('.lab-walk').hidden = true; }
        else if (n === 'walk') { cam.walk = !cam.walk; container.querySelector('.lab-walk').hidden = !cam.walk; if (cam.walk) { goal.dist = 0.9; goal.pitch = 0.18; goal.t.y = 1.25; goal.t.z = Math.max(goal.t.z, 0.9); } else { goal.t.copy(HOME.t); goal.dist = HOME.dist; goal.pitch = HOME.pitch; } wrap.focus(); }
      };
      container.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.n)));
      const hold = {};
      container.querySelectorAll('[data-w]').forEach((b) => {
        const k = { f: 'w', b: 's', l: 'a', r: 'd' }[b.dataset.w];
        b.addEventListener('pointerdown', () => { hold[k] = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { hold[k] = false; }));
      });
      let visible = true;
      const io = root.IntersectionObserver ? new IntersectionObserver((en) => { visible = en[0].isIntersecting; }) : null; if (io) io.observe(wrap);
      let last = performance.now(), time = 0, lastNext;
      const tmpV = new THREE.Vector3();
      function frame(now) {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; time += dt;
        if (!visible || document.hidden) return;
        // حركة التجوّل
        const kd = (k) => keys[k] || hold[k];
        const fw = (kd('w') || kd('arrowup') ? 1 : 0) - (kd('s') || kd('arrowdown') ? 1 : 0);
        const sd = (kd('d') ? 1 : 0) - (kd('a') ? 1 : 0);
        const turn = (kd('arrowleft') || kd('q') ? 1 : 0) - (kd('arrowright') || kd('e') ? 1 : 0);
        if (fw || sd || turn) {
          const sp = 1.1 * dt; goal.yaw += turn * 1.4 * dt;
          const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
          goal.t.x = clamp(goal.t.x + (fx * fw - fz * sd) * sp, -2.6, 2.6); goal.t.z = clamp(goal.t.z + (fz * fw + fx * sd) * sp, -0.2, 3.2);
        }
        const k = 1 - Math.exp(-dt * 7);
        cam.target.lerp(goal.t, k); cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k; place();
        // مزامنة الأدوات مع الحالة
        const S = cfg.state(page.st, page.p) || {};
        Object.keys(objs).forEach((id) => {
          const it = objs[id], s = S[id] || {};
          it.g.visible = s.visible !== false;
          if (s.pos) { tmpV.set(s.pos[0], s.pos[1], s.pos[2]); if (it.first) it.g.position.copy(tmpV); else it.g.position.lerp(tmpV, 1 - Math.exp(-dt * 6)); }
          const ry = s.rotY || 0, rz = s.rotZ || 0, rx = s.rotX || 0; it.g.rotation.set(it.g.rotation.x + (rx - it.g.rotation.x) * k, it.g.rotation.y + (ry - it.g.rotation.y) * k, it.g.rotation.z + (rz - it.g.rotation.z) * k);
          if (s.spin) it.g.rotation.y = time * 3;
          it.first = false; try { it.set(s, dt, time); } catch (e) { /* */ }
        });
        // مؤشر الخطوة التالية
        const nx = (cfg.actions(page.st, page.p) || []).find((a) => a.next);
        const nid = nx ? (typeof nx.obj === 'function' ? nx.obj(page.st) : nx.obj) : null; const tgt = nid && objs[nid] && objs[nid].g.visible ? objs[nid] : null;
        // الوضع الموجّه: الكاميرا تتجه بلطف إلى أداة الخطوة التالية عند تغيّرها
        if (nid !== lastNext) { if (lastNext !== undefined && tgt && !drag) api.focus(nid); lastNext = nid; }
        arrow.visible = ringA.visible = !!tgt;
        if (tgt) { const b = new THREE.Box3().setFromObject(tgt.g); arrow.position.set((b.min.x + b.max.x) / 2, b.max.y + 0.05 + Math.sin(time * 4) * 0.012, (b.min.z + b.max.z) / 2); ringA.position.set(arrow.position.x, b.min.y + 0.004, arrow.position.z); const sc = clamp(Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 0.1, 0.6, 4) * (1 + Math.sin(time * 4) * 0.06); ringA.scale.set(sc, sc, sc); }
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(frame);
      const api = {
        focus(id) { const it = objs[id]; if (!it || cam.walk) return; const b = new THREE.Box3().setFromObject(it.g); const c = b.getCenter(new THREE.Vector3()); goal.t.set(clamp(c.x, -2.2, 2.2), Math.max(0.95, Math.min(1.2, c.y)), c.z * 0.4 + 0.03); goal.yaw = clamp(goal.yaw, -0.6, 0.6); goal.dist = Math.min(Math.max(goal.dist, 0.9), 1.3); goal.pitch = clamp(goal.pitch, 0.25, 0.6); },
        dispose() { ro.disconnect(); if (io) io.disconnect(); scene.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) { (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { if (mt.map) mt.map.dispose(); mt.dispose(); }); } }); renderer.dispose(); },
        objs: objs
      };
      return api;
    }
    three = initThree();
    if (!three) { container.querySelector('.lab-fallback').hidden = false; cv.hidden = true; container.querySelector('.lab-nav').hidden = true; }
    container.classList.toggle('no-webgl', !three);
    renderUI();
    return {
      update: renderUI,
      act: doAct,
      three: three,
      destroy() { alive = false; cancelAnimationFrame(raf); clearTimeout(tipT); clearTimeout(alertT); if (three) three.dispose(); }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
