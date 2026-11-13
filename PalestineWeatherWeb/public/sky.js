// The living sky behind every page, by the weather of the chosen place (data-sky on <html>):
// - day: a faint sun off the top corner whose rays turn slowly, puffy clouds drifting across;
// - cloudy and fog: layers of clouds moving at different speeds;
// - rain and storm: dark clouds, falling rain, and lightning in a storm;
// - snow: clouds and falling flakes; night: twinkling stars, the moon's glow, a shooting star.
// The same sky the Android app draws (ui/components/SkyBackground.kt), on one fixed canvas.
// Still under reduced motion, and paused while the page is hidden.

/** A small seeded generator, so the stars and clouds are the same on every visit. */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r7 = random(7);
const SPECKS = Array.from({ length: 110 }, () => ({ x: r7(), y: r7(), size: 0.6 + r7() * 1.4, phase: r7(), speed: 1 + Math.floor(r7() * 2) }));

/** Puffy clouds: a few soft round lobes each, crossing the screen `laps` times per loop. */
function clouds(seed, n, yMin, yMax, wMin, wMax) {
  const r = random(seed);
  return Array.from({ length: n }, () => {
    const lobes = Array.from({ length: 5 + Math.floor(r() * 3) }, (_, i) => {
      const t = i / 6;
      return [t, -0.10 - 0.16 * Math.sin(Math.PI * t) * (0.7 + r() * 0.6), 0.18 + 0.10 * Math.sin(Math.PI * t) + r() * 0.05];
    });
    return { x0: r(), y: yMin + r() * (yMax - yMin), width: wMin + r() * (wMax - wMin), laps: 1 + Math.floor(r() * 2), lobes };
  });
}
const NEAR = clouds(3, 3, 0.10, 0.55, 0.45, 0.70);
const FAR = clouds(11, 4, 0.04, 0.75, 0.30, 0.50);

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;
const WHITE = [255, 255, 255];

function glow(g, x, y, radius, color, alpha) {
  const grad = g.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, rgba(color, alpha));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, radius, 0, Math.PI * 2);
  g.fill();
}

function drawClouds(g, w, h, list, t, color, alpha, scale) {
  for (const cl of list) {
    const cw = cl.width * w * scale;
    const span = w + 2 * cw;
    const x = ((cl.x0 + t * cl.laps) % 1) * span - cw;
    const y = cl.y * h;
    for (const [lx, ly, lr] of cl.lobes) {
      const cx = x + lx * cw;
      const cy = y + ly * cw;
      const r = lr * cw;
      const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, rgba(color, alpha));
      grad.addColorStop(0.5, rgba(color, alpha * 0.6));
      grad.addColorStop(1, rgba(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** The sun, kept in the background: a faint warm glow off the top corner and barely-there rays. */
function sun(g, w, h, breathe, turn) {
  const cx = w * 0.92;
  const cy = -h * 0.04;
  glow(g, cx, cy, w * 0.75, [250, 174, 60], 0.08 + 0.03 * breathe);
  const reach = h * 0.45;
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, reach);
  grad.addColorStop(0, 'rgba(255,255,255,0.03)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 2 * Math.PI + turn * 2 * Math.PI;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + reach * Math.cos(a - 0.07), cy + reach * Math.sin(a - 0.07));
    g.lineTo(cx + reach * Math.cos(a + 0.07), cy + reach * Math.sin(a + 0.07));
    g.closePath();
    g.fill();
  }
  glow(g, cx, cy, w * 0.12, [255, 244, 214], 0.14);
}

/** Once a loop, a short streak crosses the upper sky. */
function shootingStar(g, w, h, t) {
  if (t > 0.10) return;
  const p = t / 0.10;
  const sx = w * 0.15, sy = h * 0.08, ex = w * 0.65, ey = h * 0.30;
  const hx = sx + (ex - sx) * p, hy = sy + (ey - sy) * p;
  const tx = hx - (ex - sx) * 0.18, ty = hy - (ey - sy) * 0.18;
  const grad = g.createLinearGradient(tx, ty, hx, hy);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, `rgba(255,255,255,${0.9 * (1 - p)})`);
  g.strokeStyle = grad;
  g.lineWidth = 1.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(tx, ty);
  g.lineTo(hx, hy);
  g.stroke();
}

/** One frame of the sky `kind` at time `ms`; with `still`, the resting picture. */
export function drawSky(g, w, h, kind, ms, still = false) {
  g.clearRect(0, 0, w, h);
  const loop = (period) => (still ? 0 : (ms % period) / period);
  const c = loop(90000);
  if (kind === 'day' || kind === 'dusk') {
    const b = still ? 0.5 : 1 - Math.abs(((ms % 9000) / 4500) - 1);
    sun(g, w, h, b, loop(60000));
    drawClouds(g, w, h, FAR, c, WHITE, 0.10, 0.6);
    drawClouds(g, w, h, NEAR, c, WHITE, 0.16, 1);
  } else if (kind === 'cloudy' || kind === 'fog') {
    drawClouds(g, w, h, FAR, c, WHITE, 0.16, 0.7);
    drawClouds(g, w, h, NEAR, c, WHITE, 0.22, 1.2);
    if (kind === 'fog') {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.12)');
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }
  } else if (kind === 'night') {
    glow(g, w * 0.82, h * 0.10, w * 0.35, [221, 231, 255], 0.16);
    const tw = loop(6000);
    for (const s of SPECKS) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (tw + s.phase)));
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.beginPath();
      g.arc(s.x * w, s.y * h * 0.85, s.size * 0.55, 0, Math.PI * 2);
      g.fill();
    }
    if (!still) shootingStar(g, w, h, loop(11000));
    drawClouds(g, w, h, FAR, c, WHITE, 0.05, 0.6);
  } else if (kind === 'rain' || kind === 'storm') {
    drawClouds(g, w, h, FAR, c, [27, 42, 56], 0.30, 0.9);
    drawClouds(g, w, h, NEAR, c, [42, 59, 75], 0.35, 1.2);
    const rv = loop(900);
    g.lineCap = 'round';
    g.lineWidth = 0.8;
    for (const s of SPECKS) {
      // A whole number of screen heights per loop, so the fall never jumps.
      const y = (s.y * h + rv * h * s.speed) % h;
      const x = s.x * w;
      const len = 6 + 4.5 * s.size;
      g.strokeStyle = `rgba(255,255,255,${0.12 + 0.06 * s.size})`;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - len * 0.28, y + len);
      g.stroke();
    }
    const flash = loop(9000);
    if (kind === 'storm' && !still && flash >= 0.955 && flash <= 0.975) {
      g.fillStyle = 'rgba(255,255,255,0.16)';
      g.fillRect(0, 0, w, h);
    }
  } else if (kind === 'snow') {
    drawClouds(g, w, h, FAR, c, WHITE, 0.14, 0.7);
    const sv = loop(12000);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    for (const s of SPECKS) {
      const y = (s.y * h + sv * h) % h;
      const x = s.x * w + 5 * Math.sin(2 * Math.PI * (sv * 3 + s.phase));
      g.beginPath();
      g.arc(x, y, 0.8 + s.size * 0.5, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** Put the sky behind the page and keep it moving. */
export function mountSky() {
  const canvas = document.createElement('canvas');
  canvas.id = 'sky-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const g = canvas.getContext('2d');
  if (!g) return;
  document.documentElement.classList.add('sky-canvas');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, raf = 0, last = 0;
  const kind = () => document.documentElement.dataset.sky || 'day';
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSky(g, w, h, kind(), performance.now(), reduce.matches);
  };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    // About thirty pictures a second is smooth enough here, and easier on a phone.
    if (now - last < 32) return;
    last = now;
    drawSky(g, w, h, kind(), now, false);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (reduce.matches || document.hidden) drawSky(g, w, h, kind(), performance.now(), true);
    else raf = requestAnimationFrame(frame);
  };
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', run);
  reduce.addEventListener?.('change', run);
  // A new place or new weather changes the sky: under reduced motion, redraw the still picture.
  new MutationObserver(() => { if (reduce.matches) drawSky(g, w, h, kind(), 0, true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-sky'] });
  resize();
  run();
}
