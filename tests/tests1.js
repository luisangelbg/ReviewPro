/* ReviewPro — tests of Block 1 (the meta-analysis and screening engines).

   Three kinds of reference:
   1. An independent implementation in R (tools/validar_bloque1.R → r_reference_b1.js):
      REML and ML by direct maximization of the likelihood, Paule–Mandel by
      root finding, the distributions from R itself, TF-IDF and naive Bayes
      with dense matrices.
   2. Published values: the BCG vaccine data of Colditz et al. (1994), whose
      random-effects results appear in the methodological literature.
   3. Definitions and simulation under the null: a permutation stays a
      permutation, a PRISMA diagram adds up, a 95 % interval covers the truth
      95 % of the time. */
(function () {
  const { section, check, near, rel } = TT;
  const R = window.RREF_B1;
  const M = Meta;

  /* ---------------- distributions ---------------- */
  section('Distribuciones contra R');
  const tq = [-3.2, -1.5, 0.3, 2.1, 4.7], dfs = [1, 3, 12, 40];
  let worst = 0;
  dfs.forEach((d, j) => tq.forEach((t, i) => { worst = Math.max(worst, Math.abs(M.pt(t, d) - R.pt[j][i])); }));
  check('pt en 20 puntos (gl 1 a 40)', worst < 1e-12, 'máx. |Δ| = ' + worst.toExponential(1));
  worst = 0;
  const pq = [0.025, 0.1, 0.9, 0.975, 0.999];
  dfs.forEach((d, j) => pq.forEach((p, i) => { worst = Math.max(worst, Math.abs(M.qt(p, d) - R.qt[j][i]) / Math.abs(R.qt[j][i])); }));
  check('qt en 20 puntos, error relativo', worst < 1e-10, worst.toExponential(1));
  worst = 0;
  [-8, -3.5, -1.96, 0, 0.7, 2.5, 6].forEach((z, i) => { worst = Math.max(worst, Math.abs(M.pnorm(z) - R.pnorm[i]) / Math.max(R.pnorm[i], 1e-300)); });
  check('pnorm con precisión relativa en las colas (z = −8)', worst < 1e-12, worst.toExponential(1));
  worst = 0;
  [1e-10, 0.001, 0.025, 0.3, 0.5, 0.8, 0.975, 0.9999].forEach((p, i) => { worst = Math.max(worst, Math.abs(M.qnorm(p) - R.qnorm[i])); });
  check('qnorm (AS 241) en 8 puntos', worst < 1e-12, worst.toExponential(1));
  worst = 0;
  [1, 4, 12, 30].forEach((d, j) => [0.2, 3, 9.5, 25, 60].forEach((x, i) => { worst = Math.max(worst, Math.abs(M.pchisqUpper(x, d) - R.pchisq_upper[j][i]) / Math.max(R.pchisq_upper[j][i], 1e-300)); }));
  check('cola superior de ji cuadrada, error relativo', worst < 1e-10, worst.toExponential(1));
  worst = 0;
  [0.5, 1, 2.5, 10, 33.3, 150].forEach((x, i) => { worst = Math.max(worst, Math.abs(M.lgamma(x) - R.lgamma[i])); });
  check('log Γ (Lanczos)', worst < 1e-11, worst.toExponential(1));
  check('qt(0.975, ∞) = qnorm(0.975)', near(M.qt(0.975, Infinity), 1.959963984540054, 1e-12));

  /* ---------------- effect sizes ---------------- */
  section('Tamaños de efecto contra R');
  let e = M.ES.SMD(24.1, 5.2, 12, 20.3, 4.8, 15);
  check('g de Hedges (n = 12 y 15)', rel(e.yi, R.smd.yi, 1e-12) && rel(e.vi, R.smd.vi, 1e-12), `g = ${e.yi.toFixed(6)}, v = ${e.vi.toFixed(6)}`);
  check('corrección J exacta', rel(e.J, R.smd.J, 1e-12), e.J.toFixed(8));
  e = M.ES.SMD(3.4, 1.1, 4, 2.9, 0.9, 5);
  check('g con muestras muy pequeñas (n = 4 y 5)', rel(e.yi, R.smd_small.yi, 1e-12) && rel(e.vi, R.smd_small.vi, 1e-12));
  check('J(m) → 1 − 3/(4m − 1) para m grande', near(M.hedgesJ(200), 1 - 3 / (4 * 200 - 1), 1e-6));
  e = M.ES.ROM(7.8, 1.2, 6, 6.5, 1.1, 6);
  check('razón de respuesta ln(RR)', rel(e.yi, R.rom.yi, 1e-13) && rel(e.vi, R.rom.vi, 1e-13), `${e.yi.toFixed(6)} (${M.BACK.ROM(e.yi).toFixed(2)} %)`);
  e = M.ES.ZCOR(0.42, 58);
  check('z de Fisher', rel(e.yi, R.zcor.yi, 1e-13) && rel(e.vi, R.zcor.vi, 1e-13));
  e = M.ES.OR(0, 20, 4, 16);
  check('razón de momios con celda cero (+½ en las cuatro)', rel(e.yi, R.or_zero.yi, 1e-13) && rel(e.vi, R.or_zero.vi, 1e-13));
  check('ROM rechaza medias no positivas', M.ES.ROM(0, 1, 5, 3, 1, 5) === null && M.ES.ROM(-1, 1, 5, 3, 1, 5) === null);
  check('SMD rechaza n ≤ 1', M.ES.SMD(1, 1, 1, 2, 1, 5) === null);

  /* ---------------- meta-analysis: BCG ---------------- */
  section('Meta-análisis: datos BCG (Colditz et al. 1994), contra R y contra valores publicados');
  const b = R.bcg;
  const es = b.tpos.map((_, i) => M.ES.RR(b.tpos[i], b.tneg[i], b.cpos[i], b.cneg[i]));
  const yi = es.map(x => x.yi), vi = es.map(x => x.vi);
  check('log RR y varianzas de los 13 ensayos', yi.every((y, i) => rel(y, b.yi[i], 1e-13)) && vi.every((v, i) => rel(v, b.vi[i], 1e-13)));
  const F = R.bcg_fit;
  const fe = M.pool(yi, vi, { method: 'FE' });
  check('efecto común: estimación, EE e IC', rel(fe.est, F.FE.est, 1e-12) && rel(fe.se, F.FE.se, 1e-12) && rel(fe.ci[0], F.FE.ci[0], 1e-12), `${fe.est.toFixed(4)} (EE ${fe.se.toFixed(4)})`);
  check('Q de Cochran y su valor p', rel(fe.Q, F.Q, 1e-12) && rel(fe.pQ, F.pQ, 1e-8), `Q = ${fe.Q.toFixed(3)}, p = ${fe.pQ.toExponential(3)}`);
  check('I² y H² del efecto común', rel(fe.I2, F.FE.I2, 1e-12) && rel(fe.H2, F.FE.H2, 1e-12));
  ['DL', 'HE', 'PM', 'ML', 'REML'].forEach(meth => {
    const r = M.pool(yi, vi, { method: meth }), ref = F[meth];
    const tolT = (meth === 'ML' || meth === 'REML' || meth === 'PM') ? 1e-7 : 1e-12;
    check(`${meth}: τ²`, rel(r.tau2, ref.tau2, tolT), `${r.tau2.toFixed(6)} vs R ${ref.tau2.toFixed(6)}`);
    check(`${meth}: μ̂, EE, IC 95 % y p`, rel(r.est, ref.est, 1e-7) && rel(r.se, ref.se, 1e-7) && rel(r.ci[0], ref.ci[0], 1e-7) && rel(r.ci[1], ref.ci[1], 1e-7) && rel(r.p, ref.p, 1e-5),
      `${r.est.toFixed(4)} [${r.ci[0].toFixed(4)}, ${r.ci[1].toFixed(4)}]`);
    check(`${meth}: I², H² e intervalo de predicción`, rel(r.I2, ref.I2, 1e-7) && rel(r.H2, ref.H2, 1e-7) && rel(r.pi[0], ref.pi[0], 1e-7) && rel(r.pi[1], ref.pi[1], 1e-7));
  });
  const kh = M.pool(yi, vi, { method: 'REML', knha: true });
  check('REML con Knapp–Hartung: EE, IC con t(12) y p', rel(kh.se, F.REML_KH.se, 1e-7) && rel(kh.ci[0], F.REML_KH.ci[0], 1e-7) && rel(kh.p, F.REML_KH.p, 1e-6) && kh.dfTest === 12);
  /* the values printed in the methodological literature for this data set */
  const dl = M.pool(yi, vi, { method: 'DL' }), reml = M.pool(yi, vi, { method: 'REML' });
  check('publicado: DL τ² = 0.3088, μ̂ = −0.7141, EE = 0.1787', near(dl.tau2, 0.3088, 5e-5) && near(dl.est, -0.7141, 5e-5) && near(dl.se, 0.1787, 5e-5));
  check('publicado: REML τ² = 0.3132, μ̂ = −0.7145, EE = 0.1798', near(reml.tau2, 0.3132, 5e-5) && near(reml.est, -0.7145, 5e-5) && near(reml.se, 0.1798, 5e-5));
  check('publicado: I² = 92.12 % (DL), Q = 152.23 con 12 gl', near(dl.I2 * 100, 92.12, 0.005) && near(dl.Q, 152.23, 0.005) && dl.df === 12);
  check('publicado: efecto común −0.4303', near(fe.est, -0.4303, 5e-5));
  check('REML converge', reml.converged && reml.iter < 200, `${reml.iter} iteraciones`);
  check('pesos en % suman 100', near(reml.weights.reduce((a, c) => a + c, 0), 100, 1e-9));
  const eg = M.egger(yi, vi);
  check('Egger: intercepto, EE, t y p contra lm() de R', rel(eg.intercept, R.bcg_egger.intercept, 1e-10) && rel(eg.seInt, R.bcg_egger.seInt, 1e-10) && rel(eg.p, R.bcg_egger.p, 1e-8) && rel(eg.slope, R.bcg_egger.slope, 1e-10), `b₀ = ${eg.intercept.toFixed(4)}, p = ${eg.p.toFixed(4)}`);
  const bg = M.begg(yi, vi);
  check('Begg: S, τ de Kendall, z y p', bg.S === R.bcg_begg.S && rel(bg.z, R.bcg_begg.z, 1e-12) && rel(bg.p, R.bcg_begg.p, 1e-10), `S = ${bg.S}, p = ${bg.p.toFixed(4)}`);

  section('Casos frontera');
  const H = R.homog;
  const hdl = M.pool(H.yi, H.vi, { method: 'DL' });
  check('conjunto homogéneo: τ² de DL truncado en 0', hdl.tau2 === 0 && H.tau2_DL === 0);
  check('con τ² = 0 el aleatorio coincide con el común', rel(hdl.est, H.est, 1e-13));
  check('con τ² = 0, I² = 0', hdl.I2 === 0);
  check('PM con Q(0) < k − 1 da τ² = 0', M.pool(H.yi, H.vi, { method: 'PM' }).tau2 === 0);
  check('REML no se vuelve negativo', M.pool(H.yi, H.vi, { method: 'REML' }).tau2 >= 0);
  check('un solo estudio: sin τ², sin I², sin intervalo de predicción', (() => { const r = M.pool([0.2], [0.04], { method: 'REML' }); return r.k === 1 && r.tau2 === 0 && isNaN(r.I2) && r.pi === null && near(r.est, 0.2); })());
  check('dos estudios: sin intervalo de predicción (k − 2 = 0)', M.pool([0.1, 0.3], [0.01, 0.02], { method: 'DL' }).pi === null);
  check('valores no finitos se descartan', M.pool([0.1, NaN, 0.3], [0.01, 0.02, 0.02], { method: 'DL' }).k === 2);

  /* ---------------- simulation under the null ---------------- */
  section('Simulación: cobertura y tasa de error bajo el nulo');
  (function () {
    const reps = 600, mu = Math.log(1.1);
    let covRE = 0, covFE = 0, egRej = 0, covPI = 0;
    for (let s = 1; s <= reps; s++) {
      const st = M.simulate({ k: 15, mu, tau: 0.1, nMin: 4, nMax: 12 }, 1000 + s);
      const y = st.map(x => x.yi), v = st.map(x => x.vi);
      const r = M.pool(y, v, { method: 'REML', knha: true });
      if (r.ci[0] <= mu && mu <= r.ci[1]) covRE++;
      const f = M.pool(y, v, { method: 'FE' });
      if (f.ci[0] <= mu && mu <= f.ci[1]) covFE++;
      /* the prediction interval should cover a NEW study's true effect */
      const thetaNew = mu + 0.1 * randn(rng(5000 + s));
      if (r.pi && r.pi[0] <= thetaNew && thetaNew <= r.pi[1]) covPI++;
      if (M.egger(y, v).p < 0.05) egRej++;
    }
    check('IC 95 % REML + Knapp–Hartung cubre la verdad ≈ 95 % (τ = 0.1)', covRE / reps > 0.92 && covRE / reps < 0.98, `${(100 * covRE / reps).toFixed(1)} %`);
    check('el IC del efecto común se queda corto con heterogeneidad', covFE / reps < 0.85, `${(100 * covFE / reps).toFixed(1)} %`);
    check('el intervalo de predicción cubre el efecto de un estudio nuevo ≈ 95 %', covPI / reps > 0.9, `${(100 * covPI / reps).toFixed(1)} %`);
    check('Egger sin sesgo de publicación rechaza cerca del 5 %', egRej / reps < 0.1, `${(100 * egRej / reps).toFixed(1)} %`);
    let rejBias = 0, over = 0;
    for (let s = 1; s <= 200; s++) {
      const st = M.simulate({ k: 25, mu: Math.log(1.05), tau: 0.03, nMin: 3, nMax: 10, bias: true, pPub: 0.15 }, 9000 + s);
      const y = st.map(x => x.yi), v = st.map(x => x.vi);
      if (M.egger(y, v).p < 0.1) rejBias++;
      if (M.pool(y, v, { method: 'REML' }).est > Math.log(1.05)) over++;
    }
    check('con sesgo de publicación el promedio sobreestima casi siempre', over / 200 > 0.85, `${(100 * over / 200).toFixed(0)} % de las literaturas`);
    /* With selection by significance on trials of similar size, the published
       literature is made of the larger trials and Egger has little power: the
       test only sees asymmetry when precisions differ a lot. Both facts are
       checked, because the laboratory teaches both. */
    check('con ensayos de tamaño parecido, Egger rechaza poco más que sin sesgo', rejBias / 200 > egRej / reps, `${(100 * rejBias / 200).toFixed(0)} % contra ${(100 * egRej / reps).toFixed(1)} % sin sesgo`);
    let rejSmall = 0;
    for (let s = 1; s <= 200; s++) {
      /* the textbook small-study effect: precisions spread over an order of
         magnitude, and every study less precise than SE = 0.05 published only
         when significant. (With a leak of 10 % of non-significant small
         studies the power falls to about 30 %: the test is weak, not wrong.) */
      const r = rng(20000 + s), y = [], v = [];
      while (y.length < 30) {
        const se = Math.exp(Math.log(0.03) + r() * Math.log(0.4 / 0.03));
        const yy = 0.05 + se * randn(r);
        if (se < 0.05 || yy / se > 1.96) { y.push(yy); v.push(se * se); }
      }
      if (M.egger(y, v).p < 0.1) rejSmall++;
    }
    check('con precisiones muy distintas y estudios pequeños filtrados, Egger lo detecta', rejSmall / 200 > 0.85, `${(100 * rejSmall / 200).toFixed(0)} % a α = 0.10 (k = 30)`);
    const a = M.simulate({ k: 10 }, 42), c = M.simulate({ k: 10 }, 42);
    check('la literatura sintética es reproducible con la misma semilla', JSON.stringify(a) === JSON.stringify(c));
  })();

  /* ---------------- text ---------------- */
  section('Texto: tokens, plural y TF-IDF');
  check('minúsculas, sin puntuación, sin números ni palabras vacías', JSON.stringify(Screen.tokenize('The Mycorrhizal Fungi, in 2019 field trials!')) === JSON.stringify(['mycorrhizal', 'fungi', 'field', 'trial']));
  check('sin acentos y con palabras vacías en español', JSON.stringify(Screen.tokenize('Inoculación del maíz con hongos')) === JSON.stringify(['inoculacion', 'maiz', 'hongo']));
  check('plural: trials→trial, soils→soil, varieties→variety, mycorrhizae→mycorrhiza', Screen.stem('trials') === 'trial' && Screen.stem('soils') === 'soil' && Screen.stem('varieties') === 'variety' && Screen.stem('mycorrhizae') === 'mycorrhiza');
  check('no toca: species, analysis, glomus, grass', Screen.stem('species') === 'species' && Screen.stem('analysis') === 'analysis' && Screen.stem('glomus') === 'glomus' && Screen.stem('grass') === 'grass');
  const NBR = R.nb;
  const fx = Screen.tfidf(NBR.docs);
  check('vocabulario igual al de R (orden alfabético)', JSON.stringify(fx.terms) === JSON.stringify(NBR.terms));
  check('idf suavizado igual al de R', fx.terms.every((_, j) => rel(fx.idf[j], NBR.idf[j], 1e-13)));
  check('filas TF-IDF de longitud 1 e iguales a las de R', fx.rows.every((row, i) => {
    const dense = new Array(fx.terms.length).fill(0);
    row.idx.forEach((j, q) => { dense[j] = row.val[q]; });
    return dense.every((v, j) => near(v, NBR.X[i][j], 1e-13));
  }));
  const nb = Screen.NB(fx.terms.length, 1);
  fx.rows.forEach((row, i) => nb.add(row, NBR.labels[i]));
  const w = nb.weights();
  check('pesos del Bayes ingenuo (log θ₁ − log θ₀) iguales a los de R', NBR.weights.every((x, j) => near(w[j], x, 1e-12)));
  check('puntaje de los cinco documentos', fx.rows.every((row, i) => near(nb.score(row), NBR.scores[i], 1e-12)));
  const nd = (() => {  // the new document, vectorized with the corpus idf
    const tf = new Map(); NBR.newdoc.forEach(t => { const j = fx.vocab.get(t); tf.set(j, (tf.get(j) || 0) + 1); });
    const idx = Int32Array.from([...tf.keys()].sort((a, c) => a - c)); const val = new Float64Array(idx.length); let n2 = 0;
    idx.forEach((j, q) => { val[q] = tf.get(j) * fx.idf[j]; n2 += val[q] ** 2; }); for (let q = 0; q < val.length; q++) val[q] /= Math.sqrt(n2);
    return { idx, val };
  })();
  check('puntaje de un documento nuevo', near(nb.score(nd), NBR.score_new, 1e-12), nb.score(nd).toFixed(6));
  check('aprender uno por uno = aprender todo de golpe', (() => { const a = Screen.NB(fx.terms.length, 1); [4, 0, 2, 3, 1].forEach(i => a.add(fx.rows[i], NBR.labels[i])); const wa = a.weights(); return wa.every((x, j) => near(x, w[j], 1e-13)); })());

  /* ---------------- screening metrics ---------------- */
  section('Métricas de cribado contra R');
  const ML_ = R.metrics, lab = ML_.order_labels;
  const found = new Int32Array(lab.length + 1);
  lab.forEach((l, k) => { found[k + 1] = found[k] + l; });
  const nR = found[lab.length];
  check('registros leídos para el 95 % y el 80 %', Screen.screenedAt(found, nR, 0.95) === ML_.n95 && Screen.screenedAt(found, nR, 0.8) === ML_.n80);
  check('WSS@95 y WSS@80', near(Screen.wss(found, nR, 0.95), ML_.wss95, 1e-12) && near(Screen.wss(found, nR, 0.8), ML_.wss80, 1e-12), `${Screen.wss(found, nR, 0.95).toFixed(3)} / ${Screen.wss(found, nR, 0.8).toFixed(3)}`);
  check('RRF@10 y RRF@25', near(Screen.rrf(found, nR, 0.1), ML_.rrf10, 1e-12) && near(Screen.rrf(found, nR, 0.25), ML_.rrf25, 1e-12));
  check('tiempo medio de descubrimiento', near(Screen.atd(found, nR), ML_.atd, 1e-12));
  check('paro tras 3 irrelevantes seguidos: en el registro 10', Screen.stopConsecutive(found, 3) === 10);
  check('paro tras 5 irrelevantes seguidos: en el registro 17', Screen.stopConsecutive(found, 5) === 17);
  check('rodilla: el punto más alejado de la cuerda', Screen.kneeAt(Int32Array.from([0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4]), 10) === 4);

  section('Cribado priorizado: invariantes');
  const recs = Screen.corpus({ n: 400, prevalence: 0.05, difficulty: 0.5 }, 3);
  const f2 = Screen.tfidf(recs.map(r => Screen.tokenize(r.title + ' ' + r.abstract)));
  const labs = recs.map(r => r.label);
  const sim = Screen.simulate(f2.rows, labs, f2.terms.length, { batch: 3, seed: 3 });
  check('el orden es una permutación de la pila', sim.order.length === 400 && new Set(sim.order).size === 400);
  check('al final se encontraron todos los relevantes', sim.found[400] === labs.reduce((a, c) => a + c, 0) && sim.nRel === 20);
  check('el conocimiento previo es 1 relevante + 1 irrelevante', sim.nPrior === 2 && labs[sim.order[0]] === 1 && labs[sim.order[1]] === 0);
  const sim2 = Screen.simulate(f2.rows, labs, f2.terms.length, { batch: 3, seed: 3 });
  check('misma semilla, mismo orden', JSON.stringify(sim.order) === JSON.stringify(sim2.order));
  const rnd = Screen.simulate(f2.rows, labs, f2.terms.length, { strategy: 'random', seed: 3 });
  check('el orden al azar también es una permutación', new Set(rnd.order).size === 400);
  check('priorizar ahorra trabajo frente al azar (WSS@95 > 0.5)', Screen.wss(sim.found, 20, 0.95) > 0.5, Screen.wss(sim.found, 20, 0.95).toFixed(3));
  (function () {
    let s = 0; const reps = 30;
    for (let q = 0; q < reps; q++) { const r = Screen.simulate(f2.rows, labs, f2.terms.length, { strategy: 'random', seed: 100 + q }); s += Screen.wss(r.found, 20, 0.95); }
    check('al azar, WSS@95 promedio ≈ 0 (definición de la métrica)', Math.abs(s / reps) < 0.06, (s / reps).toFixed(3));
  })();

  section('Pila sintética y diagrama PRISMA');
  const c1 = Screen.corpus({ n: 300, prevalence: 0.04 }, 9), c2 = Screen.corpus({ n: 300, prevalence: 0.04 }, 9);
  check('la pila es reproducible con la misma semilla', JSON.stringify(c1) === JSON.stringify(c2));
  check('prevalencia exacta: 12 relevantes de 300', c1.filter(r => r.label).length === 12);
  check('los relevantes están mezclados, no al principio', c1.slice(0, 12).filter(r => r.label).length < 12);
  check('todo registro tiene título y resumen', c1.every(r => r.title.length > 10 && r.abstract.length > 40));
  const stopAt = Screen.stopConsecutive(sim.found, 60);
  const p = Screen.prismaCounts(sim, recs, stopAt, {}, 3);
  check('identificados = cribados + duplicados; fuentes suman el total', p.total === p.N + p.dup && p.sources.reduce((a, c) => a + c, 0) === p.total);
  check('cribados = leídos + no leídos tras el paro', p.screened + p.notScreened === p.N);
  check('leídos = excluidos + buscados', p.excludedTA + p.sought === p.screened);
  check('buscados = no recuperados + evaluados; evaluados = incluidos + excluidos con motivo', p.notRet + p.assessed === p.sought && p.included + p.reasons.outcome + p.reasons.design + p.reasons.data === p.assessed);
  check('perdidos = relevantes − marcados', p.missed === sim.nRel - p.sought);

  /* ---------------- the type assistant ---------------- */
  section('Asistente de tipo de revisión');
  const rec = a => Home.recommend(a).type;
  check('mapear → exploratoria', rec({ goal: 'map', focus: 'focused', quant: 'yes', rigor: 'yes', time: 'long' }) === 'scoping');
  check('interpretar sin exigencia de reproducibilidad → narrativa', rec({ goal: 'discuss', focus: 'broad', quant: 'no', rigor: 'no', time: 'short' }) === 'narrative');
  check('responder, acotada, con números comparables → meta-análisis', rec({ goal: 'answer', focus: 'focused', quant: 'yes', rigor: 'yes', time: 'long' }) === 'meta');
  check('responder, acotada, sin números → sistemática', rec({ goal: 'answer', focus: 'focused', quant: 'no', rigor: 'yes', time: 'mid' }) === 'systematic');
  check('responder con pregunta amplia → exploratoria primero', rec({ goal: 'answer', focus: 'broad', quant: 'yes', rigor: 'yes', time: 'long' }) === 'scoping');
  check('poco tiempo para una sistemática → aviso', Home.recommend({ goal: 'answer', focus: 'focused', quant: 'no', rigor: 'yes', time: 'short' }).why.length === 2);
  check('cada tipo declara bloques necesarios dentro de 2..10', Object.values(Home.TYPES).every(t => t.req.every(n => n >= 2 && n <= 10) && t.opt.every(n => !t.req.includes(n))));
})();
