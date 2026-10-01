/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — the meta-analysis engine.

   Three layers, each usable on its own:
   1. Distributions: the normal, t and chi-square laws with their quantiles,
      written from the incomplete gamma and beta functions, so a p value or a
      confidence limit never depends on a table.
   2. Effect sizes: how a study's summary numbers become one effect y_i and
      its sampling variance v_i. The response ratio (ln RR of means) is the
      usual one in agronomy and ecology; the standardized mean difference
      (Hedges' g) when the scales differ; the risk ratio, odds ratio and risk
      difference for counts; Fisher's z for correlations.
   3. Pooling: the inverse-variance average under a common (fixed) effect and
      under random effects with five estimators of the between-study variance
      τ² (DerSimonian–Laird, REML, Paule–Mandel, Hedges and maximum
      likelihood), with Cochran's Q, I², H², the confidence interval of the
      mean (normal or Knapp–Hartung) and the prediction interval for a new
      study. Egger's regression and Begg's rank correlation read the funnel.

   Every formula is named where it is used; the tests check them against
   published worked examples and an independent implementation. */

const Meta = {};

(function () {

  /* ================= 1 · distributions ================= */

  /* log Γ(x) by the Lanczos approximation (g = 7, n = 9): relative error < 1e-15 */
  const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    let a = LG[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  /* regularized lower incomplete gamma P(a, x): series below a + 1, Lentz's
     continued fraction for Q above (Numerical Recipes, §6.2) */
  function gammaP(a, x) {
    if (x <= 0) return 0;
    if (!isFinite(x)) return 1;
    const lf = a * Math.log(x) - x - lgamma(a);
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 1000; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
      return Math.min(1, sum * Math.exp(lf));
    }
    return 1 - gammaQcf(a, x, lf);
  }
  function gammaQcf(a, x, lf) {
    const FPMIN = 1e-300;
    let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return Math.exp(lf) * h;
  }
  function gammaQ(a, x) {
    if (x <= 0) return 1;
    if (!isFinite(x)) return 0;
    if (x < a + 1) return 1 - gammaP(a, x);
    return gammaQcf(a, x, a * Math.log(x) - x - lgamma(a));
  }

  /* regularized incomplete beta I_x(a, b) by its continued fraction (NR §6.4) */
  function betacf(a, b, x) {
    const FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 3000; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const lbt = lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x);
    if (x < (a + 1) / (a + b + 2)) return Math.exp(lbt) * betacf(a, b, x) / a;
    return 1 - Math.exp(lbt) * betacf(b, a, 1 - x) / b;
  }

  /* standard normal: Φ from the incomplete gamma (erf(x) = P(½, x²)), which keeps
     full relative precision in the tails; Φ⁻¹ by Wichura's AS 241 (≈1e-16) */
  function pnorm(z) {
    if (!isFinite(z)) return z > 0 ? 1 : 0;
    const h = 0.5 * gammaQ(0.5, z * z / 2);
    return z >= 0 ? 1 - h : h;
  }
  function qnorm(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const q = p - 0.5;
    let r, val;
    if (Math.abs(q) <= 0.425) {
      r = 0.180625 - q * q;
      val = q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r +
        45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r + 133.14166789178437745) * r +
        3.387132872796366608) / (((((((r * 5226.495278852545925 + 28729.085735721942674) * r + 39307.89580009271061) * r +
        21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r + 42.313330701600911252) * r + 1);
      return val;
    }
    r = q < 0 ? p : 1 - p;
    r = Math.sqrt(-Math.log(r));
    if (r <= 5) {
      r -= 1.6;
      val = (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + 0.24178072517745061177) * r +
        1.27045825245236838258) * r + 3.64784832476320460504) * r + 5.7694972214606914055) * r + 4.6303378461565452959) * r +
        1.42343711074968357734) / (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r +
        0.0151986665636164571966) * r + 0.14810397642748007459) * r + 0.68976733498510000455) * r + 1.6763848301838038494) * r +
        2.05319162663775882187) * r + 1);
    } else {
      r -= 5;
      val = (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r +
        0.026532189526576123093) * r + 0.29656057182850489123) * r + 1.7848265399172913358) * r + 5.4637849111641143699) * r +
        6.6579046435011037772) / (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r +
        1.8463183175100546818e-5) * r + 7.868691311456132591e-4) * r + 0.0148753612908506148525) * r +
        0.13692988092273580531) * r + 0.59983220655588793769) * r + 1);
    }
    return q < 0 ? -val : val;
  }
  /* Student t with df degrees of freedom */
  function pt(t, df) {
    if (!isFinite(t)) return t > 0 ? 1 : 0;
    if (!isFinite(df)) return pnorm(t);
    const x = df / (df + t * t);
    const tail = 0.5 * ibeta(x, df / 2, 0.5);
    return t > 0 ? 1 - tail : tail;
  }
  function qt(p, df) {
    if (!isFinite(df)) return qnorm(p);
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;
    /* bracket, then bisection polished by Newton on the density */
    let lo = -1, hi = 1;
    while (pt(lo, df) > p) lo *= 2;
    while (pt(hi, df) < p) hi *= 2;
    let x = 0;
    for (let i = 0; i < 200; i++) {
      x = (lo + hi) / 2;
      const f = pt(x, df) - p;
      if (Math.abs(f) < 1e-15 || hi - lo < 1e-14 * Math.max(1, Math.abs(x))) break;
      if (f > 0) hi = x; else lo = x;
    }
    return x;
  }
  /* chi-square with df degrees of freedom: upper tail, the one tests use */
  const pchisqUpper = (x, df) => (x <= 0 ? 1 : gammaQ(df / 2, x / 2));
  const pchisq = (x, df) => (x <= 0 ? 0 : gammaP(df / 2, x / 2));
  /* two-sided p of a z or a t */
  const p2z = z => 2 * (1 - pnorm(Math.abs(z)));
  const p2t = (t, df) => 2 * (1 - pt(Math.abs(t), df));

  /* ================= 2 · effect sizes =================
     Each returns {yi, vi} or null when the inputs cannot give an effect. */

  /* Hedges' exact small-sample correction J(m) = Γ(m/2) / (√(m/2) Γ((m−1)/2)) */
  function hedgesJ(m) { return Math.exp(lgamma(m / 2) - 0.5 * Math.log(m / 2) - lgamma((m - 1) / 2)); }

  const ES = {
    /* standardized mean difference, Hedges' g (Hedges 1981); variance with the
       large-sample formula of Hedges & Olkin (1985): 1/n1 + 1/n2 + g²/(2(n1+n2)) */
    SMD(m1, sd1, n1, m2, sd2, n2) {
      if (!(n1 > 1 && n2 > 1 && sd1 >= 0 && sd2 >= 0)) return null;
      const df = n1 + n2 - 2;
      const sp = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / df);
      if (!(sp > 0)) return null;
      const d = (m1 - m2) / sp, g = hedgesJ(df) * d;
      return { yi: g, vi: 1 / n1 + 1 / n2 + g * g / (2 * (n1 + n2)), d, J: hedgesJ(df) };
    },
    /* log response ratio ln(m1/m2) (Hedges, Gurevitch & Curtis 1999): the
       effect of a treatment as a proportional change, v = s1²/(n1 m1²) + s2²/(n2 m2²) */
    ROM(m1, sd1, n1, m2, sd2, n2) {
      if (!(m1 > 0 && m2 > 0 && n1 > 0 && n2 > 0)) return null;
      return { yi: Math.log(m1 / m2), vi: sd1 * sd1 / (n1 * m1 * m1) + sd2 * sd2 / (n2 * m2 * m2) };
    },
    /* raw mean difference */
    MD(m1, sd1, n1, m2, sd2, n2) {
      if (!(n1 > 0 && n2 > 0)) return null;
      return { yi: m1 - m2, vi: sd1 * sd1 / n1 + sd2 * sd2 / n2 };
    },
    /* 2×2 tables: a/b events/non-events with treatment, c/d without. A zero
       cell adds ½ to every cell of that table (Haldane–Anscombe). */
    RR(a, b, c, d) {
      [a, b, c, d] = cc(a, b, c, d);
      if (a == null) return null;
      return { yi: Math.log((a / (a + b)) / (c / (c + d))), vi: 1 / a - 1 / (a + b) + 1 / c - 1 / (c + d) };
    },
    OR(a, b, c, d) {
      [a, b, c, d] = cc(a, b, c, d);
      if (a == null) return null;
      return { yi: Math.log((a * d) / (b * c)), vi: 1 / a + 1 / b + 1 / c + 1 / d };
    },
    RD(a, b, c, d) {
      const n1 = a + b, n2 = c + d;
      if (!(n1 > 0 && n2 > 0)) return null;
      const p1 = a / n1, p2 = c / n2;
      return { yi: p1 - p2, vi: p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2 };
    },
    /* Fisher's z of a correlation, v = 1/(n − 3) */
    ZCOR(r, n) {
      if (!(Math.abs(r) < 1 && n > 3)) return null;
      return { yi: 0.5 * Math.log((1 + r) / (1 - r)), vi: 1 / (n - 3) };
    },
  };
  function cc(a, b, c, d) {
    if ([a, b, c, d].some(v => !(v >= 0))) return [null];
    if (a === 0 || b === 0 || c === 0 || d === 0) return [a + 0.5, b + 0.5, c + 0.5, d + 0.5];
    return [a, b, c, d];
  }
  /* back-transformations for reading a pooled effect */
  const BACK = {
    ROM: y => (Math.exp(y) - 1) * 100,   // % change
    RR: y => Math.exp(y), OR: y => Math.exp(y),
    ZCOR: y => Math.tanh(y),
  };

  /* ================= 3 · pooling ================= */

  function wsum(w, f) { let s = 0; for (let i = 0; i < w.length; i++) s += f(i); return s; }

  /* Cochran's Q about the inverse-variance mean with weights 1/(v + τ²) */
  function qAt(y, v, tau2) {
    const w = v.map(x => 1 / (x + tau2)), sw = w.reduce((a, b) => a + b, 0);
    const mu = wsum(w, i => w[i] * y[i]) / sw;
    return { Q: wsum(w, i => w[i] * (y[i] - mu) ** 2), mu, sw, w };
  }

  const TAU2 = {
    /* DerSimonian & Laird (1986): method of moments */
    DL(y, v) {
      const k = y.length, fe = qAt(y, v, 0);
      const sw2 = fe.w.reduce((a, b) => a + b * b, 0);
      const c = fe.sw - sw2 / fe.sw;
      return { tau2: Math.max(0, (fe.Q - (k - 1)) / c), iter: 0 };
    },
    /* Hedges (1983) / Hedges & Olkin: unweighted method of moments */
    HE(y, v) {
      const k = y.length, m = y.reduce((a, b) => a + b, 0) / k;
      const s2 = y.reduce((a, b) => a + (b - m) ** 2, 0) / (k - 1);
      return { tau2: Math.max(0, s2 - v.reduce((a, b) => a + b, 0) / k), iter: 0 };
    },
    /* Paule & Mandel (1982): the τ² that makes the generalized Q equal to k − 1 */
    PM(y, v) {
      const k = y.length;
      if (qAt(y, v, 0).Q <= k - 1) return { tau2: 0, iter: 0 };
      let lo = 0, hi = 1;
      while (qAt(y, v, hi).Q > k - 1) hi *= 2;
      let it = 0;
      for (; it < 300; it++) {
        const mid = (lo + hi) / 2;
        if (qAt(y, v, mid).Q > k - 1) lo = mid; else hi = mid;
        if (hi - lo < 1e-12 * Math.max(1, hi)) break;
      }
      return { tau2: (lo + hi) / 2, iter: it };
    },
    /* restricted maximum likelihood by the fixed-point form of its score
       equation (Viechtbauer 2005, eq. 12), started at DL and kept ≥ 0 */
    REML(y, v) { return fixedPoint(y, v, true); },
    /* maximum likelihood, same scheme without the REML correction */
    ML(y, v) { return fixedPoint(y, v, false); },
  };
  function fixedPoint(y, v, reml) {
    let tau2 = TAU2.DL(y, v).tau2, it = 0, conv = false;
    for (; it < 1000; it++) {
      const w = v.map(x => 1 / (x + tau2)), sw = w.reduce((a, b) => a + b, 0);
      const mu = wsum(w, i => w[i] * y[i]) / sw;
      const sw2 = w.reduce((a, b) => a + b * b, 0);
      let nt = wsum(w, i => w[i] * w[i] * ((y[i] - mu) ** 2 - v[i])) / sw2 + (reml ? 1 / sw : 0);
      nt = Math.max(0, nt);
      if (Math.abs(nt - tau2) < 1e-10 * Math.max(1, tau2)) { tau2 = nt; conv = true; break; }
      tau2 = nt;
    }
    return { tau2, iter: it, converged: conv };
  }

  /* The model. opts = {method: 'FE'|'DL'|'REML'|'PM'|'HE'|'ML', level: 0.95,
     knha: false (Knapp–Hartung t test of the mean)} */
  function pool(yi, vi, opts) {
    const o = Object.assign({ method: 'REML', level: 0.95, knha: false }, opts || {});
    const keep = yi.map((y, i) => isFinite(y) && isFinite(vi[i]) && vi[i] > 0);
    const y = yi.filter((_, i) => keep[i]), v = vi.filter((_, i) => keep[i]);
    const k = y.length;
    if (k < 1) return null;
    const alpha = 1 - o.level;
    const fe = qAt(y, v, 0);
    const Q = fe.Q, df = k - 1;
    const pQ = df > 0 ? pchisqUpper(Q, df) : NaN;
    /* the "typical" within-study variance of Higgins & Thompson (2002) */
    const sw = fe.sw, sw2 = fe.w.reduce((a, b) => a + b * b, 0);
    const s2 = df > 0 ? df * sw / (sw * sw - sw2) : NaN;
    let tau2 = 0, iter = 0, converged = true;
    const random = o.method !== 'FE' && k > 1;
    if (random) { const r = TAU2[o.method](y, v); tau2 = r.tau2; iter = r.iter; if (r.converged === false) converged = false; }
    const w = v.map(x => 1 / (x + tau2)), W = w.reduce((a, b) => a + b, 0);
    const est = wsum(w, i => w[i] * y[i]) / W;
    let se = Math.sqrt(1 / W), crit, stat, p, dfTest = null;
    if (o.knha && k > 1) {
      /* Knapp & Hartung (2003): rescale the variance by the weighted residual
         mean square and test with t on k − 1 degrees of freedom */
      const qk = wsum(w, i => w[i] * (y[i] - est) ** 2) / (k - 1);
      se = Math.sqrt(qk / W);
      dfTest = k - 1;
      crit = qt(1 - alpha / 2, dfTest);
      stat = est / se; p = p2t(stat, dfTest);
    } else {
      crit = qnorm(1 - alpha / 2);
      stat = est / se; p = p2z(stat);
    }
    const I2 = df > 0 ? (random ? tau2 / (tau2 + s2) : Math.max(0, (Q - df) / Q)) : NaN;
    const H2 = df > 0 ? (random ? (tau2 + s2) / s2 : Q / df) : NaN;
    /* prediction interval for the true effect of a new study: Higgins,
       Thompson & Spiegelhalter (2009), t on k − 2 degrees of freedom */
    let pi = null;
    if (random && k >= 3) {
      const tc = qt(1 - alpha / 2, k - 2), sp = Math.sqrt(tau2 + se * se);
      pi = [est - tc * sp, est + tc * sp];
    }
    const wPct = w.map(x => 100 * x / W);
    return {
      method: random ? o.method : 'FE', k, est, se, ci: [est - crit * se, est + crit * se], stat, p, dfTest,
      tau2, tau: Math.sqrt(tau2), Q, df, pQ, I2, H2, s2, pi, weights: wPct, iter, converged, level: o.level, knha: !!(o.knha && k > 1),
    };
  }

  /* Egger's regression test (Egger et al. 1997): the standard normal deviate
     y/se regressed on the precision 1/se by ordinary least squares; an
     intercept away from zero means the funnel is asymmetric. */
  function egger(yi, vi) {
    const k = yi.length;
    if (k < 3) return null;
    const x = vi.map(v => 1 / Math.sqrt(v)), z = yi.map((y, i) => y / Math.sqrt(vi[i]));
    const mx = x.reduce((a, b) => a + b, 0) / k, mz = z.reduce((a, b) => a + b, 0) / k;
    let sxx = 0, sxz = 0;
    for (let i = 0; i < k; i++) { sxx += (x[i] - mx) ** 2; sxz += (x[i] - mx) * (z[i] - mz); }
    const slope = sxz / sxx, intercept = mz - slope * mx;
    let rss = 0;
    for (let i = 0; i < k; i++) rss += (z[i] - intercept - slope * x[i]) ** 2;
    const s2 = rss / (k - 2);
    const seInt = Math.sqrt(s2 * (1 / k + mx * mx / sxx));
    const t = intercept / seInt;
    return { intercept, seInt, slope, t, df: k - 2, p: p2t(t, k - 2) };
  }

  /* Begg & Mazumdar (1994): Kendall's tau between the standardized effects and
     their variances, with the normal approximation of its variance */
  function begg(yi, vi) {
    const k = yi.length;
    if (k < 3) return null;
    const w = vi.map(v => 1 / v), W = w.reduce((a, b) => a + b, 0);
    const mu = wsum(w, i => w[i] * yi[i]) / W;
    const ts = yi.map((y, i) => (y - mu) / Math.sqrt(vi[i] - 1 / W));
    let S = 0;
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) S += Math.sign(ts[i] - ts[j]) * Math.sign(vi[i] - vi[j]);
    const varS = k * (k - 1) * (2 * k + 5) / 18;
    const z = S / Math.sqrt(varS);
    return { S, tau: S / (k * (k - 1) / 2), z, p: p2z(z) };
  }

  /* ================= 4 · a synthetic literature for the laboratory =================
     k field trials of an input on a crop's yield. Each trial has its own true
     effect θ_i ~ N(μ, τ²) on the log scale, a control mean, a coefficient of
     variation and n plots per arm; the reported means and SDs are drawn from
     that. With publication bias on, small trials that did not reach p < 0.05
     reach the literature only with probability pPub. */
  function simulate(opts, seed) {
    const o = Object.assign({ k: 16, mu: Math.log(1.12), tau: 0.08, nMin: 3, nMax: 12, cv: 0.18, bias: false, pPub: 0.25, control: 6.0 }, opts || {});
    const r = rng(seed == null ? 1 : seed);
    const out = [];
    let guard = 0;
    while (out.length < o.k && guard++ < o.k * 60) {
      const n = o.nMin + Math.floor(r() * (o.nMax - o.nMin + 1));
      const theta = o.mu + o.tau * randn(r);
      const m2t = o.control * (0.6 + 0.8 * r());
      const m1t = m2t * Math.exp(theta);
      const cv = o.cv * (0.7 + 0.6 * r());
      /* sample means and SDs of n plots */
      const draw = (m) => {
        let s = 0, ss = 0;
        for (let j = 0; j < n; j++) { const x = m * (1 + cv * randn(r)); s += x; ss += x * x; }
        const mean = s / n;
        return { mean, sd: Math.sqrt(Math.max(1e-12, (ss - n * mean * mean) / (n - 1))) };
      };
      const t = draw(m1t), c = draw(m2t);
      if (!(t.mean > 0 && c.mean > 0)) continue;
      const es = ES.ROM(t.mean, t.sd, n, c.mean, c.sd, n);
      if (o.bias) {
        const sig = Math.abs(es.yi / Math.sqrt(es.vi)) > 1.96 && es.yi > 0;
        if (!sig && r() > o.pPub) continue;
      }
      out.push({ id: out.length + 1, n1: n, n2: n, m1: t.mean, sd1: t.sd, m2: c.mean, sd2: c.sd, yi: es.yi, vi: es.vi, theta });
    }
    return out;
  }

  Object.assign(Meta, {
    lgamma, gammaP, gammaQ, ibeta, pnorm, qnorm, pt, qt, pchisq, pchisqUpper, p2z, p2t, hedgesJ,
    ES, BACK, TAU2, pool, egger, begg, simulate, qAt,
  });
  window.Meta = Meta;
})();
