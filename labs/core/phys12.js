/* فيزياء الصف الثاني عشر — قوانين نقية (الرموز اللاتينية كما في الكتاب). كل دالة تحمل رقم القانون/الصفحة حيث وُجد. */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const Q = ML.phys12 = {};
  Q.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  Q.mu0 = 4 * Math.PI * 1e-7;   // T.m/A
  Q.e = 1.6e-19;                // C
  Q.me = 9.11e-31; Q.mp = 1.67e-27; // kg
  const fin = (x) => { if (!Number.isFinite(x)) throw new RangeError('non-finite'); return x; };

  /* ---------- الفصل 1: الزخم والدفع ---------- */
  Q.momentum = (m, v) => m * v;                          // (1-1) P = m v
  Q.pFromK = (m, K) => Math.sqrt(2 * m * K);             // K = p²/2m
  Q.kFromP = (m, p) => p * p / (2 * m);
  Q.impulse = (F, dt) => F * dt;                         // I = F Δt = Δp
  // انفجار/ارتداد من السكون: m1 v1 + m2 v2 = 0
  Q.recoil = (m1, m2, v1) => -m1 * v1 / m2;

  /* ---------- الفصل 2: التصادمات ---------- */
  Q.elastic1D = function (m1, m2, u1, u2) {
    const s = m1 + m2; if (!(s > 0)) throw new RangeError('mass');
    return { v1: ((m1 - m2) * u1 + 2 * m2 * u2) / s, v2: ((m2 - m1) * u2 + 2 * m1 * u1) / s };
  };
  Q.inelastic1D = function (m1, m2, u1, u2) { const v = (m1 * u1 + m2 * u2) / (m1 + m2); return { v1: v, v2: v }; };
  Q.ke = (m, v) => 0.5 * m * v * v;
  // البندول القذفي: v = ((m + M)/m) √(2 g h)
  Q.ballistic = (m, M, h, g) => (m + M) / m * Math.sqrt(2 * (g || 9.8) * h);
  Q.ballisticH = (m, M, v, g) => { const V = m * v / (m + M); return V * V / (2 * (g || 9.8)); };

  /* ---------- الفصل 3: الحركة الدورانية ---------- */
  Q.torque = (r, F, thetaDeg) => r * F * Math.sin(thetaDeg * Math.PI / 180); // τ = r F sinθ
  Q.inertia = {
    ring: (M, R) => M * R * R, disk: (M, R) => 0.5 * M * R * R, solidSphere: (M, R) => 0.4 * M * R * R, hollowSphere: (M, R) => (2 / 3) * M * R * R,
    rodCenter: (M, L) => M * L * L / 12, rodEnd: (M, L) => M * L * L / 3, point: (M, R) => M * R * R
  };
  // التدحرج دون انزلاق من ارتفاع h: v = √(2 g h / (1 + I/(m r²)))
  Q.rollingV = (k, h, g) => Math.sqrt(2 * (g || 9.8) * h / (1 + k));
  Q.rotKE = (I, w) => 0.5 * I * w * w;
  Q.angMomentum = (I, w) => I * w;

  /* ---------- الفصل 4: التيار والمقاومة ---------- */
  Q.current = (dq, dt) => fin(dq / dt);                  // I = ΔQ/Δt
  Q.ohm = (V, R) => fin(V / R);
  Q.resistance = (rho, L, A) => fin(rho * L / A);        // R = ρ L / A
  Q.resistT = (R0, alpha, dT) => R0 * (1 + alpha * dT);  // R = R0 (1 + α ΔT)
  Q.power = (V, I) => V * I;

  /* ---------- الفصل 5: دارات التيار المستمر ---------- */
  Q.series = (rs) => rs.reduce((a, b) => a + b, 0);
  Q.parallel = (rs) => 1 / rs.reduce((a, b) => a + 1 / b, 0);
  Q.loopCurrent = (sumEmf, sumR) => fin(sumEmf / sumR); // (5-3) I = Σε / ΣR
  Q.terminal = (emf, I, r) => emf - I * r;               // V = ε − I r
  // حل نظام خطي صغير (كيرشوف) بطريقة غاوس
  Q.solve = function (A, b) {
    const n = b.length; const M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) throw new RangeError('singular'); [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
  };

  /* ---------- الفصل 6: المجال المغناطيسي ---------- */
  Q.Bwire = (I, r) => fin(Q.mu0 * I / (2 * Math.PI * r));
  Q.Bloop = (N, I, R) => fin(Q.mu0 * N * I / (2 * R));
  Q.Bsolenoid = (N, L, I) => fin(Q.mu0 * N / L * I);

  /* ---------- الفصل 7: القوة المغناطيسية ---------- */
  Q.Fcharge = (q, v, B, thetaDeg) => Math.abs(q) * v * B * Math.sin(thetaDeg * Math.PI / 180);
  Q.radius = (m, v, q, B) => fin(m * v / (Math.abs(q) * B));
  Q.period = (m, q, B) => fin(2 * Math.PI * m / (Math.abs(q) * B));
  Q.Fwire = (B, I, L, thetaDeg) => B * I * L * Math.sin(thetaDeg * Math.PI / 180);
  Q.Fparallel = (I1, I2, L, d) => fin(Q.mu0 * I1 * I2 * L / (2 * Math.PI * d));
  Q.coilTorque = (N, B, I, A, thetaDeg) => N * B * I * A * Math.sin(thetaDeg * Math.PI / 180);

  /* ---------- الفصل 8: الحث الكهرومغناطيسي ---------- */
  Q.faraday = (N, dPhi, dt) => fin(-N * dPhi / dt);
  Q.motional = (B, L, v) => B * L * v;
  Q.generator = (N, B, A, w, t) => N * B * A * w * Math.sin(w * t);
  Q.transformer = (Vp, Np, Ns) => fin(Vp * Ns / Np);
  Q.selfEmf = (L, dI, dt) => fin(-L * dI / dt);
})(typeof window !== 'undefined' ? window : globalThis);
