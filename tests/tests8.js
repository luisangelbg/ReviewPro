/* ReviewPro — tests of Block 8 (synthesis and meta-analysis).

   References: an independent implementation in R with dense matrices and a
   bounded quasi-Newton optimizer (tools/validar_bloque8.R → r_reference_b8.js);
   the published BCG results (the two-level model with one effect per study
   must reproduce REML τ² = 0.3132 and μ̂ = −0.7145); the exact binomial test
   of R; and a simulation of coverage for the multilevel model. */
(function () {
  const { section, check, near, rel } = TT;
  const R = window.RREF_B8, S = Synth;
  const D = R.data;
  const dat = { y: D.y, v: D.v, study: D.study };

  section('La verosimilitud restringida en puntos fijos, contra R (matrices densas)');
  const G = S.groups(D.study);
  check('sin moderadores: ℓ y μ̂ en 5 pares (σ²entre, σ²dentro), incluidos bordes en 0', R.llgrid.every(g => { const r = S.reml({ y: D.y, v: D.v, study: D.study, X: D.y.map(() => [1]) }, g.s2b, g.s2w, G); return near(r.ll, g.ll, 1e-9) && rel(r.beta[0], g.beta, 1e-10); }));
  check('con un moderador: ℓ y los dos coeficientes', R.llgridX.every(g => { const r = S.reml({ y: D.y, v: D.v, study: D.study, X: D.xnum.map(x => [1, x]) }, g.s2b, g.s2w, G); return near(r.ll, g.ll, 1e-9) && rel(r.beta[0], g.beta[0], 1e-10) && rel(r.beta[1], g.beta[1], 1e-9); }));

  section('Modelo multinivel contra R (matrices densas, otro optimizador)');
  const f3 = S.fit(dat, { levels: 3 });
  check('tres niveles: σ² entre estudios', rel(f3.s2b, R.ml3.s2b, 1e-4), `${f3.s2b.toFixed(6)} vs R ${R.ml3.s2b.toFixed(6)}`);
  check('tres niveles: σ² dentro de estudios', rel(f3.s2w, R.ml3.s2w, 1e-4), `${f3.s2w.toFixed(6)} vs R ${R.ml3.s2w.toFixed(6)}`);
  check('tres niveles: μ̂ y su EE', rel(f3.beta[0], R.ml3.beta, 1e-5) && rel(f3.coef[0].se, R.ml3.se, 1e-4), `${f3.beta[0].toFixed(6)} (${f3.coef[0].se.toFixed(6)})`);
  check('tres niveles: log-verosimilitud restringida', near(f3.ll, R.ml3.ll, 1e-6), `${f3.ll.toFixed(6)} vs ${R.ml3.ll.toFixed(6)}`);
  const f2 = S.fit(dat, { levels: 2 });
  check('dos niveles sobre los mismos efectos: σ², μ̂, EE y ℓ', rel(f2.s2b, R.ml2.s2b, 1e-4) && rel(f2.beta[0], R.ml2.beta, 1e-5) && rel(f2.coef[0].se, R.ml2.se, 1e-4) && near(f2.ll, R.ml2.ll, 1e-6));
  const lrt = S.lrtWithin(dat, {});
  check('prueba de razón de verosimilitud del nivel dentro de estudios (½χ²₁)', rel(lrt.LR, R.lrt.LR, 1e-4) && rel(lrt.p, R.lrt.p, 1e-3), `LR = ${lrt.LR.toFixed(3)}, p = ${lrt.p.toExponential(2)}`);
  check('el modelo convergió', f3.converged && f2.converged);
  const wts = S.weights(dat, f3);
  check('pesos multinivel: su promedio ponderado de los efectos es exactamente μ̂', near(wts.reduce((a, w, i) => a + w * D.y[i], 0) / wts.reduce((a, b) => a + b, 0), f3.beta[0], 1e-9));
  check('los efectos de un mismo estudio se reparten el peso del estudio (menos que si fueran independientes)', (() => { const g = S.groups(D.study).find(x => x.length >= 3); const indep = g.reduce((a, i) => a + 1 / (D.v[i] + f3.s2b + f3.s2w), 0); return g.reduce((a, i) => a + wts[i], 0) < indep; })());
  check('I² total repartido entre niveles', near(f3.I2.total, f3.I2.between + f3.I2.within, 1e-12) && f3.I2.total > 0 && f3.I2.total < 1);

  section('Meta-regresión contra R');
  const des = S.design(D.y.length, [{ name: 'P', values: D.xnum, type: 'numeric' }]);
  const fn = S.fit({ y: D.y, v: D.v, study: D.study, X: des.X }, { levels: 3 });
  check('moderador numérico: pendiente y su EE', rel(fn.beta[1], R.mregNum.beta[1], 1e-4) && rel(fn.coef[1].se, R.mregNum.se[1], 1e-3), `b = ${fn.beta[1].toFixed(6)} vs R ${R.mregNum.beta[1].toFixed(6)}`);
  check('moderador numérico: componentes de varianza', rel(fn.s2b, R.mregNum.s2b, 1e-3) && rel(fn.s2w, R.mregNum.s2w, 1e-3));
  const sg = S.subgroups(dat, D.xcat, { levels: 3 });
  check('moderador categórico: coeficientes contra R (mismo nivel de referencia)', sg.joint.beta.every((b, i) => rel(b, R.mregCat.beta[i], 1e-4)), sg.joint.beta.map(b => b.toFixed(4)).join(', '));
  check('prueba ómnibus QM de las diferencias entre subgrupos', rel(sg.test.QM, R.mregCat.QM, 1e-3), `QM = ${sg.test.QM.toFixed(4)} vs R ${R.mregCat.QM.toFixed(4)}`);
  check('un ajuste por subgrupo, con su número de estudios', sg.per.length === 3 && sg.per.every(p => p.m >= 1));
  const mr = S.metareg(dat, [{ name: 'P', values: D.xnum, type: 'numeric' }], { levels: 3 });
  check('pseudo-R² entre 0 y 1', mr.R2 >= 0 && mr.R2 <= 1, fmtPct(mr.R2, 1));

  section('Dos niveles con un efecto por estudio = el modelo validado del Bloque 1 (BCG)');
  const b = window.RREF_B1.bcg;
  const bf = S.fit({ y: b.yi, v: b.vi, study: b.yi.map((_, i) => i) }, { levels: 3 });
  check('con un efecto por estudio no hay tercer nivel', bf.levels === 2 && bf.s2w === 0);
  check('τ² REML = 0.3132 y μ̂ = −0.7145, EE 0.1798 (publicados)', near(bf.tau2, 0.3132, 5e-5) && near(bf.beta[0], -0.7145, 5e-5) && near(bf.coef[0].se, 0.1798, 5e-5), `${bf.tau2.toFixed(5)}, ${bf.beta[0].toFixed(5)}`);
  check('y coincide con Meta.pool (punto fijo de REML)', rel(bf.tau2, Meta.pool(b.yi, b.vi, { method: 'REML' }).tau2, 1e-5));
  const kh = S.fit({ y: b.yi, v: b.vi, study: b.yi.map((_, i) => i) }, { levels: 2, test: 't' });
  check('con prueba t usa gl = estudios − coeficientes (12)', kh.df === 12 && near(kh.coef[0].ci[1] - kh.coef[0].ci[0], 2 * Meta.qt(0.975, 12) * kh.coef[0].se, 1e-10));

  section('Promedio dentro de estudios');
  const ag = S.aggregate(D.y, D.v, D.study, 0.5);
  check('medias y varianzas compuestas (ρ = 0.5) iguales a R', ag.every((a, i) => rel(a.y, R.agg.y[i], 1e-12) && rel(a.v, R.agg.v[i], 1e-12)));
  check('con ρ = 0 la varianza es Σv/m²; con ρ = 1, (Σ√v)²/m²', (() => { const a0 = S.aggregate([1, 2], [0.04, 0.09], [1, 1], 0)[0], a1 = S.aggregate([1, 2], [0.04, 0.09], [1, 1], 1)[0]; return near(a0.v, 0.13 / 4, 1e-12) && near(a1.v, 0.25 / 4, 1e-12); })());
  check('un estudio con un solo efecto queda igual', (() => { const a = S.aggregate([0.3], [0.02], ['x'])[0]; return a.y === 0.3 && a.v === 0.02; })());

  section('Sesgo de publicación');
  const tf = S.trimfill(R.tf.y, R.tf.v, { side: 'left' });
  check('recorte y relleno L0: mismos estudios faltantes que R', tf.k0 === R.tf.k0, `k0 = ${tf.k0}`);
  check('y la misma estimación ajustada', rel(tf.adjusted.est, R.tf.est, 1e-5), `${tf.adjusted.est.toFixed(5)} vs R ${R.tf.est.toFixed(5)}`);
  check('el lado se detecta solo (estudios pequeños con efectos mayores → faltan a la izquierda)', S.trimfill(R.tf.y, R.tf.v).side === 'left');
  const sym = [-0.2, -0.1, 0, 0.1, 0.2, -0.15, 0.15, -0.05, 0.05], sv = [0.01, 0.02, 0.03, 0.02, 0.01, 0.015, 0.015, 0.025, 0.025];
  check('datos simétricos → nada que rellenar', S.trimfill(sym, sv, { side: 'left' }).k0 === 0);
  check('rangos con empates (promedio de posiciones)', S.rankAbs([1, -1, 2, 0.5]).join() === '2.5,2.5,4,1');
  const eg = S.eggerML(dat, { levels: 3 });
  check('Egger multinivel: el EE como moderador da pendiente y p', eg && isFinite(eg.slope.b) && eg.slope.p >= 0 && eg.slope.p <= 1);

  section('Sin meta-análisis');
  check('prueba de signos exacta: 11 de 15 positivos → p igual a binom.test', rel(S.binomTwoSided(R.vote.pos, R.vote.n), R.vote.p, 1e-10), S.binomTwoSided(11, 15).toFixed(6));
  check('3 de 20 → p igual a binom.test', rel(S.binomTwoSided(R.vote2.pos, R.vote2.n), R.vote2.p, 1e-10));
  const vt = S.vote([0.1, 0.2, -0.1, 0, 0.3]);
  check('conteo de votos: los ceros no votan', vt.pos === 3 && vt.neg === 1 && vt.zero === 1 && vt.n === 4);
  const ct = S.crosstab([{ id: 1, a: ['x', 'y'], b: 'p' }, { id: 2, a: 'x', b: 'q' }, { id: 3, a: 'y', b: 'p' }], 'a', 'b');
  check('tabla cruzada con listas: x·p = 1, y·p = 2, x·q = 1', ct.count('x', 'p') === 1 && ct.count('y', 'p') === 2 && ct.count('x', 'q') === 1 && ct.as.join() === 'x,y');

  section('Sensibilidad y simulación');
  const loo = S.leaveOneOut(dat, { levels: 3 });
  check('dejando uno fuera: un ajuste por estudio', loo.length === new Set(D.study).size && loo.every(l => l.fit));
  (function () {
    /* coverage of the multilevel 95 % CI with the t test, 30 studies of 1–4 effects */
    const reps = 120, mu = 0.1; let cov = 0;
    for (let s = 1; s <= reps; s++) {
      const r = rng(700 + s), y = [], v = [], st = [];
      for (let i = 0; i < 30; i++) { const u = 0.12 * randn(r), k = 1 + Math.floor(r() * 4); for (let j = 0; j < k; j++) { const vv = 0.005 + 0.02 * r(); y.push(mu + u + 0.07 * randn(r) + Math.sqrt(vv) * randn(r)); v.push(vv); st.push(i); } }
      const f = S.fit({ y, v, study: st }, { levels: 3, test: 't' });
      if (f.coef[0].ci[0] <= mu && mu <= f.coef[0].ci[1]) cov++;
    }
    check('cobertura del IC 95 % multinivel ≈ 95 % (simulación)', cov / reps > 0.9 && cov / reps <= 1, `${(100 * cov / reps).toFixed(1)} %`);
  })();
})();
