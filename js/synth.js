/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 8 engine: synthesis and meta-analysis.

   1. One mixed-effects model for everything quantitative. Effect j of study i:
          y_ij = x_ij'β + u_i + w_ij + e_ij,   u ~ N(0, σ²_between), w ~ N(0, σ²_within),
          e ~ N(0, v_ij) known.
      - three levels (default): several effects per study, nested (Konstantopoulos
        2011; Cheung 2014; Assink & Wibbelink 2016);
      - two levels: one effect per study (the usual random-effects model), or
        the study averages;
      - moderators in x give meta-regression; a categorical moderator gives
        subgroups.
      The variance components are estimated by restricted maximum likelihood
      (REML), maximizing the likelihood with Nelder–Mead on σ = θ² (so the
      boundary σ² = 0 is reachable). The marginal covariance of a study,
      D + σ²_between·11' with D diagonal, is inverted by Sherman–Morrison, so
      the cost is linear in the number of effects.
   2. Averaging within a study (Borenstein et al. 2009, ch. 24): the mean of its
      effects with the variance of a mean of correlated estimates,
          var = (Σ v_j + Σ_{j≠k} ρ √(v_j v_k)) / m².
   3. Heterogeneity: σ² per level, the total I² split by level (Cheung 2014),
      the prediction interval, and the likelihood-ratio test of the within-study
      level (half a χ²₁, because the null value is on the boundary).
   4. Publication bias: Egger's test on study averages, its multilevel version
      (the standard error as a moderator: Nakagawa et al. 2022) and
      trim-and-fill with the L0 estimator (Duval & Tweedie 2000).
   5. Without pooling: vote counting by direction of effect with an exact sign
      test (McKenzie & Brennan, Cochrane Handbook ch. 12), and cross-tabulations
      for the concept matrix and the evidence gap map. */

const Synth = {};

(function () {

  /* ---------- small linear algebra (p is small: the number of coefficients) ---------- */
  function chol(A) {
    const n = A.length, L = A.map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (!(s > 0)) return null; L[i][i] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function inv(A) {
    const L = chol(A); if (!L) return null;
    const n = A.length, Li = L.map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) { Li[i][i] = 1 / L[i][i]; for (let j = 0; j < i; j++) { let s = 0; for (let k = j; k < i; k++) s -= L[i][k] * Li[k][j]; Li[i][j] = s / L[i][i]; } }
    const out = A.map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let k = Math.max(i, j); k < n; k++) s += Li[k][i] * Li[k][j]; out[i][j] = s; }
    return { inv: out, logdet: 2 * L.reduce((a, r, i) => a + Math.log(r[i]), 0) };
  }
  const matVec = (A, x) => A.map(r => r.reduce((a, v, j) => a + v * x[j], 0));

  /* ---------- Nelder–Mead ---------- */
  function nelderMead(f, x0, o) {
    const opt = Object.assign({ tol: 1e-12, maxIter: 4000, step: 0.25 }, o || {});
    const n = x0.length;
    let S = [x0.slice()];
    for (let i = 0; i < n; i++) { const x = x0.slice(); x[i] = x[i] !== 0 ? x[i] * (1 + opt.step) : opt.step; S.push(x); }
    let F = S.map(f), it = 0;
    for (; it < opt.maxIter; it++) {
      const idx = F.map((v, i) => i).sort((a, b) => F[a] - F[b]);
      S = idx.map(i => S[i]); F = idx.map(i => F[i]);
      if (Math.abs(F[n] - F[0]) <= opt.tol * (Math.abs(F[0]) + 1e-12) && S.every(x => x.every((v, j) => Math.abs(v - S[0][j]) < 1e-9))) break;
      const c = new Array(n).fill(0);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i][j] / n;
      const pt = t => c.map((v, j) => v + t * (S[n][j] - v));
      const xr = pt(-1), fr = f(xr);
      if (fr < F[0]) { const xe = pt(-2), fe = f(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
      else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
      else {
        const xc = fr < F[n] ? pt(-0.5) : pt(0.5), fc = f(xc);
        if (fc < Math.min(fr, F[n])) { S[n] = xc; F[n] = fc; }
        else { for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, j) => S[0][j] + 0.5 * (v - S[0][j])); F[i] = f(S[i]); } }
      }
    }
    return { x: S[0], f: F[0], iter: it, converged: it < opt.maxIter };
  }

  /* ---------- the mixed-effects model ----------
     d = {y: [...], v: [...], study: [...ids], X: [[...]] (n × p) or null}
     o = {levels: 3 | 2, test: 'z' | 't', level: 0.95, fixed: {between, within}} */
  function groups(study) {
    const m = new Map();
    study.forEach((s, i) => { if (!m.has(s)) m.set(s, []); m.get(s).push(i); });
    return [...m.values()];
  }
  function reml(d, s2b, s2w, G) {
    const n = d.y.length, p = d.X[0].length;
    const XtVX = Array.from({ length: p }, () => new Array(p).fill(0)), XtVy = new Array(p).fill(0);
    let ytVy = 0, logdetV = 0;
    G.forEach(g => {
      let a = 0; const dj = g.map(i => d.v[i] + s2w);
      dj.forEach(x => { a += 1 / x; logdetV += Math.log(x); });
      const c = 1 + s2b * a; logdetV += Math.log(c);
      /* weighted sums Σ u_j / d_j for each column of X and for y */
      const sx = new Array(p).fill(0); let sy = 0;
      g.forEach((i, k) => { for (let q = 0; q < p; q++) sx[q] += d.X[i][q] / dj[k]; sy += d.y[i] / dj[k]; });
      g.forEach((i, k) => {
        for (let q = 0; q < p; q++) { for (let r = 0; r < p; r++) XtVX[q][r] += d.X[i][q] * d.X[i][r] / dj[k]; XtVy[q] += d.X[i][q] * d.y[i] / dj[k]; }
        ytVy += d.y[i] * d.y[i] / dj[k];
      });
      const f = s2b / c;
      for (let q = 0; q < p; q++) { for (let r = 0; r < p; r++) XtVX[q][r] -= f * sx[q] * sx[r]; XtVy[q] -= f * sx[q] * sy; }
      ytVy -= f * sy * sy;
    });
    const I = inv(XtVX); if (!I) return null;
    const beta = matVec(I.inv, XtVy);
    const rVr = ytVy - beta.reduce((a, b, q) => a + b * XtVy[q], 0);
    const ll = -0.5 * (logdetV + I.logdet + rVr + (n - p) * Math.log(2 * Math.PI));
    return { ll, beta, vcov: I.inv };
  }
  function fit(d0, opts) {
    const o = Object.assign({ levels: 3, test: 'z', level: 0.95 }, opts || {});
    const n = d0.y.length;
    const d = { y: d0.y, v: d0.v, study: d0.study, X: d0.X || d0.y.map(() => [1]) };
    const p = d.X[0].length, G = groups(d.study), m = G.length;
    if (n < p + 1) return null;
    const three = o.levels === 3 && m < n;           // a third level only exists when some study has several effects
    /* starting values from the DerSimonian–Laird τ² of the effects */
    const t0 = Math.max(1e-4, Meta.TAU2.DL(d.y, d.v).tau2);
    const obj = th => { const r = reml(d, th[0] * th[0], three ? th[1] * th[1] : 0, G); return r ? -r.ll : 1e300; };
    let best = null;
    const starts = three ? [[Math.sqrt(t0 / 2), Math.sqrt(t0 / 2)], [Math.sqrt(t0), 0.01], [0.01, Math.sqrt(t0)]] : [[Math.sqrt(t0)], [0.01]];
    starts.forEach(s => { const r = nelderMead(obj, s); if (!best || r.f < best.f) best = r; });
    const s2b = best.x[0] ** 2, s2w = three ? best.x[1] ** 2 : 0;
    const R = reml(d, s2b, s2w, G);
    const df = o.test === 't' ? Math.max(1, m - p) : Infinity;
    const crit = df === Infinity ? Meta.qnorm(1 - (1 - o.level) / 2) : Meta.qt(1 - (1 - o.level) / 2, df);
    const se = R.vcov.map((r, i) => Math.sqrt(r[i]));
    const coef = R.beta.map((b, i) => {
      const stat = b / se[i];
      return { b, se: se[i], stat, p: df === Infinity ? Meta.p2z(stat) : Meta.p2t(stat, df), ci: [b - crit * se[i], b + crit * se[i]] };
    });
    /* heterogeneity: the typical sampling variance (Higgins & Thompson 2002) and the I² of each level (Cheung 2014) */
    const w = d.v.map(x => 1 / x), sw = w.reduce((a, b) => a + b, 0), sw2 = w.reduce((a, b) => a + b * b, 0);
    const vt = n > 1 ? (n - 1) * sw / (sw * sw - sw2) : d.v[0];
    const tot = s2b + s2w + vt;
    /* prediction interval for a new effect, at the intercept (or at the covariate means) */
    const xbar = d.X[0].map((_, q) => d.X.reduce((a, r) => a + r[q], 0) / n);
    const pred = xbar.reduce((a, x, q) => a + x * R.beta[q], 0);
    const sePred = Math.sqrt(xbar.reduce((a, x, q) => a + x * xbar.reduce((b, y, r) => b + y * R.vcov[q][r], 0), 0));
    const piCrit = df === Infinity ? crit : Meta.qt(1 - (1 - o.level) / 2, df);
    const piHalf = piCrit * Math.sqrt(sePred * sePred + s2b + s2w);
    return {
      levels: three ? 3 : 2, n, m, p, coef, beta: R.beta, vcov: R.vcov, ll: R.ll, s2b, s2w, tau2: s2b + s2w, vt,
      I2: { total: (s2b + s2w) / tot, between: s2b / tot, within: s2w / tot }, pred, pi: [pred - piHalf, pred + piHalf],
      df, test: o.test, level: o.level, iter: best.iter, converged: best.converged,
    };
  }
  /* the weight of each effect in the intercept-only estimate: the column sum
     of the study's inverse covariance, 1/(d_j·c_i) with d_j = v_j + σ²_within
     and c_i = 1 + σ²_between·Σ 1/d (Sherman–Morrison). Effects of one study
     share that study's weight instead of each counting as a study. */
  function weights(d, f) {
    const w = new Array(d.y.length).fill(0);
    groups(d.study).forEach(g => {
      const dj = g.map(i => d.v[i] + f.s2w), c = 1 + f.s2b * dj.reduce((a, x) => a + 1 / x, 0);
      g.forEach((i, k) => { w[i] = 1 / (dj[k] * c); });
    });
    return w;
  }
  /* likelihood-ratio test of the within-study level (σ²_within = 0 is on the boundary: ½χ²₁) */
  function lrtWithin(d, opts) {
    const f3 = fit(d, Object.assign({}, opts, { levels: 3 })), f2 = fit(d, Object.assign({}, opts, { levels: 2 }));
    if (!f3 || !f2 || f3.levels !== 3) return null;
    const LR = Math.max(0, 2 * (f3.ll - f2.ll));
    return { LR, p: 0.5 * Meta.pchisqUpper(LR, 1), f3, f2 };
  }
  /* Wald test of a set of coefficients (moderators), χ² or F */
  function wald(f, idx) {
    const b = idx.map(i => f.beta[i]);
    const V = idx.map(i => idx.map(j => f.vcov[i][j]));
    const I = inv(V); if (!I) return null;
    const Q = b.reduce((a, x, i) => a + x * I.inv[i].reduce((s, y, j) => s + y * b[j], 0), 0);
    const q = idx.length;
    if (f.df === Infinity) return { QM: Q, df: q, p: Meta.pchisqUpper(Q, q) };
    const F = Q / q;
    return { F, df1: q, df2: f.df, p: 1 - Meta.ibeta(q * F / (q * F + f.df), q / 2, f.df / 2) };
  }

  /* ---------- 2 · averaging within studies ---------- */
  function aggregate(y, v, study, rho) {
    const r = rho == null ? 0.5 : rho;
    return groups(study).map(g => {
      const m = g.length;
      const ym = g.reduce((a, i) => a + y[i], 0) / m;
      let s = 0;
      g.forEach(i => g.forEach(j => { s += i === j ? v[i] : r * Math.sqrt(v[i] * v[j]); }));
      return { study: study[g[0]], y: ym, v: s / (m * m), m, idx: g };
    });
  }

  /* ---------- design matrices for moderators ---------- */
  /* mods: [{name, values: [...], type: 'numeric'|'categorical', ref?}] → {X, names, info} */
  function design(n, mods) {
    const X = Array.from({ length: n }, () => [1]), names = ['intrcpt'], info = [];
    (mods || []).forEach(md => {
      if (md.type === 'numeric') {
        md.values.forEach((v, i) => X[i].push(+v));
        names.push(md.name); info.push({ name: md.name, type: 'numeric', cols: [names.length - 1] });
      } else {
        const lv = [...new Set(md.values.map(String))].sort();
        const ref = md.ref && lv.includes(md.ref) ? md.ref : lv[0];
        const cols = [];
        lv.filter(l => l !== ref).forEach(l => { md.values.forEach((v, i) => X[i].push(String(v) === l ? 1 : 0)); names.push(`${md.name}: ${l}`); cols.push(names.length - 1); });
        info.push({ name: md.name, type: 'categorical', levels: lv, ref, cols });
      }
    });
    return { X, names, info };
  }
  /* subgroups: a separate fit per level, plus the test of differences from the joint model */
  function subgroups(d, values, opts) {
    const lv = [...new Set(values.map(String))].sort();
    const per = lv.map(l => {
      const idx = values.map((v, i) => (String(v) === l ? i : -1)).filter(i => i >= 0);
      const sub = { y: idx.map(i => d.y[i]), v: idx.map(i => d.v[i]), study: idx.map(i => d.study[i]) };
      const f = idx.length >= 2 ? fit(sub, opts) : null;
      return { level: l, n: idx.length, m: new Set(sub.study).size, fit: f };
    });
    const des = design(d.y.length, [{ name: 'g', values, type: 'categorical' }]);
    const joint = fit({ y: d.y, v: d.v, study: d.study, X: des.X }, opts);
    const test = joint && des.info[0].cols.length ? wald(joint, des.info[0].cols) : null;
    return { per, joint, test };
  }
  /* meta-regression: the fit with moderators, the omnibus test and the pseudo-R² */
  function metareg(d, mods, opts) {
    const des = design(d.y.length, mods);
    const f = fit({ y: d.y, v: d.v, study: d.study, X: des.X }, opts);
    const f0 = fit({ y: d.y, v: d.v, study: d.study }, opts);
    if (!f || !f0) return null;
    const idx = des.names.map((_, i) => i).slice(1);
    return { fit: f, null: f0, names: des.names, info: des.info, test: idx.length ? wald(f, idx) : null,
      R2: f0.tau2 > 0 ? Math.max(0, (f0.tau2 - f.tau2) / f0.tau2) : 0 };
  }
  /* leave one study out */
  function leaveOneOut(d, opts) {
    const ids = [...new Set(d.study)];
    return ids.map(s => {
      const keep = d.study.map((x, i) => (x !== s ? i : -1)).filter(i => i >= 0);
      const f = keep.length >= 2 ? fit({ y: keep.map(i => d.y[i]), v: keep.map(i => d.v[i]), study: keep.map(i => d.study[i]) }, opts) : null;
      return { study: s, fit: f };
    });
  }

  /* ---------- 4 · publication bias ---------- */
  /* trim-and-fill with the L0 estimator; est(y, v) returns the pooled mean */
  function trimfill(y, v, o) {
    const opt = Object.assign({ method: 'REML', side: null, maxIter: 100 }, o || {});
    const k = y.length;
    const est = (yy, vv) => Meta.pool(yy, vv, { method: opt.method }).est;
    /* the side where studies are missing: opposite to the small-study excess (Egger slope on the SE) */
    let side = opt.side;
    if (!side) {
      const se = v.map(Math.sqrt), w = v.map(x => 1 / x), W = w.reduce((a, b) => a + b, 0);
      const mx = se.reduce((a, s, i) => a + w[i] * s, 0) / W, my = y.reduce((a, s, i) => a + w[i] * s, 0) / W;
      let sxy = 0, sxx = 0; se.forEach((s, i) => { sxy += w[i] * (s - mx) * (y[i] - my); sxx += w[i] * (s - mx) ** 2; });
      side = sxy / sxx > 0 ? 'left' : 'right';
    }
    const sg = side === 'left' ? 1 : -1;               // work as if the missing studies were on the left
    const yy = y.map(x => sg * x);
    const order = yy.map((x, i) => i).sort((a, b) => yy[a] - yy[b]);
    let k0 = 0, prev = -1, it = 0, theta = est(yy, v);
    for (; it < opt.maxIter && k0 !== prev; it++) {
      prev = k0;
      const keep = order.slice(0, k - k0);             // trim the k0 largest
      theta = est(keep.map(i => yy[i]), keep.map(i => v[i]));
      const dev = yy.map(x => x - theta);
      const ranks = rankAbs(dev);
      const Tn = dev.reduce((a, x, i) => a + (x > 0 ? ranks[i] : 0), 0);
      const L0 = (4 * Tn - k * (k + 1)) / (2 * k - 1);
      k0 = Math.max(0, Math.round(L0));
      if (k0 >= k - 1) { k0 = k - 2; break; }
    }
    const filled = order.slice(k - k0).map(i => ({ y: sg * (2 * theta - yy[i]), v: v[i] }));
    const allY = y.concat(filled.map(f => f.y)), allV = v.concat(filled.map(f => f.v));
    const adj = Meta.pool(allY, allV, { method: opt.method });
    return { k0, side, filled, adjusted: adj, theta: sg * theta, iter: it };
  }
  function rankAbs(x) {
    const a = x.map((v, i) => [Math.abs(v), i]).sort((p, q) => p[0] - q[0]);
    const r = new Array(x.length);
    for (let i = 0; i < a.length;) { let j = i; while (j + 1 < a.length && a[j + 1][0] === a[i][0]) j++; for (let t = i; t <= j; t++) r[a[t][1]] = (i + j) / 2 + 1; i = j + 1; }
    return r;
  }
  /* multilevel Egger: the standard error as a moderator of the multilevel model */
  function eggerML(d, opts) {
    const X = d.v.map(x => [1, Math.sqrt(x)]);
    const f = fit({ y: d.y, v: d.v, study: d.study, X }, opts);
    return f ? { slope: f.coef[1], intercept: f.coef[0] } : null;
  }

  /* ---------- 5 · without pooling ---------- */
  function lchoose(n, k) { return Meta.lgamma(n + 1) - Meta.lgamma(k + 1) - Meta.lgamma(n - k + 1); }
  function binomTwoSided(x, n) {
    if (!n) return 1;
    const pmf = k => Math.exp(lchoose(n, k) - n * Math.log(2));
    const px = pmf(x);
    let s = 0;
    for (let k = 0; k <= n; k++) { const pk = pmf(k); if (pk <= px * (1 + 1e-9)) s += pk; }
    return Math.min(1, s);
  }
  function vote(yi) {
    const pos = yi.filter(x => x > 0).length, neg = yi.filter(x => x < 0).length, zero = yi.length - pos - neg;
    const n = pos + neg;
    const lo = n ? Meta.qnorm(0.975) : 0;
    const prop = n ? pos / n : NaN;
    /* Wilson interval for the proportion of positive effects */
    const z = lo, den = 1 + z * z / n, cen = (prop + z * z / (2 * n)) / den, half = n ? z * Math.sqrt(prop * (1 - prop) / n + z * z / (4 * n * n)) / den : 0;
    return { pos, neg, zero, n, prop, ci: n ? [cen - half, cen + half] : [NaN, NaN], p: binomTwoSided(pos, n) };
  }
  /* cross-tabulation of two fields; each value may be a list (multi-select) */
  function crosstab(rows, fa, fb) {
    const list = v => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map(String);
    const A = new Map(), cells = new Map();
    rows.forEach(r => {
      const as = list(r[fa]), bs = fb ? list(r[fb]) : ['·'];
      as.forEach(a => { A.set(a, (A.get(a) || 0) + 1); bs.forEach(b => { const k = a + '\u0000' + b; if (!cells.has(k)) cells.set(k, new Set()); cells.get(k).add(r.id); }); });
    });
    const as = [...A.keys()].sort(), bs = fb ? [...new Set([...cells.keys()].map(k => k.split('\u0000')[1]))].sort() : ['·'];
    return { as, bs, count: (a, b) => (cells.get(a + '\u0000' + b) || new Set()).size, ids: (a, b) => [...(cells.get(a + '\u0000' + b) || [])] };
  }

  Object.assign(Synth, { chol, inv, nelderMead, groups, reml, fit, weights, lrtWithin, wald, aggregate, design, subgroups, metareg, leaveOneOut, trimfill, rankAbs, eggerML, binomTwoSided, vote, crosstab });
  window.Synth = Synth;
})();
