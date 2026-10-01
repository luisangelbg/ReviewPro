/* ReviewPro — tests of Block 6 (extraction and effect sizes).

   References: an independent implementation in R of every conversion
   (tools/validar_bloque6.R → r_reference_b6.js); the published example of
   Borenstein et al. (2009): means 103 and 100, SD 5.5 and 4.5, n = 50 each,
   d = 0.5970, J = 0.9923, g = 0.5924; and round trips (an SD turned into an
   LSD, an SED or a CV and back must come out unchanged). */
(function () {
  const { section, check, near, rel } = TT;
  const R = window.RREF_B6;
  const X = Extract;

  section('DE de un grupo contra R');
  check('desde el EE: DE = EE·√n', rel(X.armSD({ type: 'se', value: R.se.se }, R.se.n).sd, R.se.sd, 1e-12));
  check('desde el IC de la media con n = 8 (usa t con 7 gl)', rel(X.armSD({ type: 'ci', lo: R.ci.lo, hi: R.ci.hi }, R.ci.n).sd, R.ci.sd, 1e-10), X.armSD({ type: 'ci', lo: R.ci.lo, hi: R.ci.hi }, R.ci.n).sd.toFixed(5));
  check('desde el IC con n = 80 (usa z)', rel(X.armSD({ type: 'ci', lo: R.ci_big.lo, hi: R.ci_big.hi }, R.ci_big.n).sd, R.ci_big.sd, 1e-10));
  check('desde el CV del tratamiento', rel(X.armSD({ type: 'cv', value: R.cv.cv }, 5, R.cv.mean).sd, R.cv.sd, 1e-12));
  check('desde la varianza', near(X.armSD({ type: 'var', value: 4 }, 5).sd, 2, 1e-12));
  check('sin datos → nada', X.armSD({ type: 'se' }, 5) === null && X.armSD({ type: 'ci', lo: 1 }, 5) === null);

  section('DE común desde el ANOVA contra R');
  check('desde la DMS (α = 0.05, r = 4, 12 gl)', rel(X.pooledSD({ type: 'lsd', value: R.lsd.lsd, r: R.lsd.r, dfe: R.lsd.dfe, alpha: 0.05 }).sd, R.lsd.sd, 1e-10), X.pooledSD({ type: 'lsd', value: R.lsd.lsd, r: 4, dfe: 12 }).sd.toFixed(6));
  check('desde la DMS al 10 %', rel(X.pooledSD({ type: 'lsd', value: R.lsd10.lsd, r: R.lsd10.r, dfe: R.lsd10.dfe, alpha: 0.10 }).sd, R.lsd10.sd, 1e-10));
  check('desde el EED', rel(X.pooledSD({ type: 'sed', value: R.sed.sed, r: R.sed.r }).sd, R.sed.sd, 1e-12));
  check('desde el EEM', rel(X.pooledSD({ type: 'sem', value: R.sem.sem, r: R.sem.r }).sd, R.sem.sd, 1e-12));
  check('desde el CV del experimento', rel(X.pooledSD({ type: 'cvexp', value: R.cvexp.cv, grand: R.cvexp.grand }).sd, R.cvexp.sd, 1e-12));
  check('gl del error: DCA 5×4 = 15, DBCA 5×4 = 12, cuadrado latino 5 = 12', X.DFE.crd(5, 4) === R.dfe.crd && X.DFE.rcbd(5, 4) === R.dfe.rcbd && X.DFE.latin(5) === R.dfe.latin);
  (function () {
    /* round trip: from a known √MSE = 1.7 with r = 4 and 12 df, build the statistics and come back */
    const s = 1.7, r = 4, dfe = 12, t = Meta.qt(0.975, dfe);
    const lsd = t * Math.sqrt(2 * s * s / r), sed = Math.sqrt(2 * s * s / r), sem = Math.sqrt(s * s / r);
    const back = [X.pooledSD({ type: 'lsd', value: lsd, r, dfe }).sd, X.pooledSD({ type: 'sed', value: sed, r }).sd, X.pooledSD({ type: 'sem', value: sem, r }).sd, X.pooledSD({ type: 'mse', value: s * s }).sd];
    check('ida y vuelta: DMS, EED, EEM y CME devuelven la misma DE', back.every(v => near(v, s, 1e-10)), back.map(v => v.toFixed(6)).join(', '));
  })();

  section('Medianas (Wan et al. 2014) contra R');
  const q = X.fromQuartiles(R.wan_iqr.q1, R.wan_iqr.m, R.wan_iqr.q3, R.wan_iqr.n);
  check('mediana con cuartiles → media y DE', rel(q.mean, R.wan_iqr.mean, 1e-12) && rel(q.sd, R.wan_iqr.sd, 1e-10), `${q.mean.toFixed(4)} · ${q.sd.toFixed(4)}`);
  const g = X.fromRange(R.wan_range.a, R.wan_range.m, R.wan_range.b, R.wan_range.n);
  check('mediana con rango → media y DE', rel(g.mean, R.wan_range.mean, 1e-12) && rel(g.sd, R.wan_range.sd, 1e-10));
  check('con datos normales la DE desde el RIC ≈ DE verdadera (n grande)', (() => { const n = 400, sd = 2; const z = Meta.qnorm(0.75); const r0 = X.fromQuartiles(10 - z * sd, 10, 10 + z * sd, n); return Math.abs(r0.sd - sd) / sd < 0.01; })());

  section('Estadísticos → g, contra R y contra el ejemplo publicado');
  const b = Meta.ES.SMD(103, 5.5, 50, 100, 4.5, 50);
  check('Borenstein et al. (2009): d = 0.5970, J = 0.9923, g = 0.5924', near(b.d, 0.5970, 5e-5) && near(b.J, 0.9923, 5e-5) && near(b.yi, 0.5924, 5e-5) && rel(b.yi, R.borenstein.g, 1e-10));
  const bt = X.result({ input: 't', metric: 'SMD', T: { n: 50 }, C: { n: 50 }, stat: { t: R.borenstein.t } });
  check('el mismo ejemplo desde su t (2.985) da el mismo g y la misma varianza', rel(bt.yi, R.borenstein.g, 1e-10) && rel(bt.vi, R.borenstein.vi, 1e-10), `t = ${R.borenstein.t.toFixed(4)}`);
  const ft = X.result({ input: 't', metric: 'SMD', T: { n: R.from_t.n1 }, C: { n: R.from_t.n2 }, stat: { t: R.from_t.t } });
  check('desde t = 2.4 (n 10 y 12)', rel(ft.yi, R.from_t.g, 1e-10));
  const fF = X.result({ input: 'F', metric: 'SMD', T: { n: 10 }, C: { n: 12 }, stat: { F: 2.4 * 2.4, sign: 1 } });
  check('F = t²: el mismo efecto que con t', rel(fF.yi, R.from_t.g, 1e-10));
  const fFn = X.result({ input: 'F', metric: 'SMD', T: { n: 10 }, C: { n: 12 }, stat: { F: 5.76, sign: -1 } });
  check('con F la dirección la da el usuario', rel(fFn.yi, -R.from_t.g, 1e-10));
  const fp = X.result({ input: 'p', metric: 'SMD', T: { n: 10 }, C: { n: 10 }, stat: { p: R.from_p.p, sign: 1 } });
  check('desde p = 0.031 (n 10 y 10)', rel(fp.yi, Meta.hedgesJ(18) * R.from_p.d, 1e-9));
  const fc = X.result({ input: 'diffci', metric: 'SMD', T: { n: 16 }, C: { n: 16 }, stat: { lo: R.from_ci.lo, hi: R.from_ci.hi, diff: R.from_ci.diff } });
  check('desde el IC de la diferencia', rel(fc.yi, Meta.hedgesJ(30) * R.from_ci.d, 1e-9));
  const fcm = X.result({ input: 'diffci', metric: 'MD', T: { n: 16 }, C: { n: 16 }, stat: { lo: R.from_ci.lo, hi: R.from_ci.hi, diff: R.from_ci.diff } });
  check('con la medida MD, el IC da directamente la diferencia y su varianza', near(fcm.yi, 2.7, 1e-12) && rel(fcm.vi, R.from_ci.se ** 2, 1e-10));
  check('un estadístico con medida ROM avisa y cambia a SMD', ft.metric === 'SMD' && X.result({ input: 't', metric: 'ROM', T: { n: 10 }, C: { n: 12 }, stat: { t: 2.4 } }).warn.length > 0);

  section('Filas completas de extracción');
  const lsdRow = X.result({ input: 'anova', metric: 'ROM', T: { mean: 7.1, n: 4 }, C: { mean: 6.2, n: 4 }, anova: { type: 'lsd', value: R.lsd.lsd, dfe: 12, alpha: 0.05 } });
  check('razón de respuesta con la DE desde la DMS: igual a R', rel(lsdRow.yi, R.rom_lsd.yi, 1e-12) && rel(lsdRow.vi, R.rom_lsd.vi, 1e-10), `${lsdRow.pct.toFixed(2)} %`);
  const lsdDesign = X.result({ input: 'anova', metric: 'ROM', T: { mean: 7.1, n: 4 }, C: { mean: 6.2, n: 4 }, anova: { type: 'lsd', value: R.lsd.lsd, design: 'rcbd', k: 5, alpha: 0.05 } });
  check('sin gl del error: se deducen del diseño (DBCA, 5 tratamientos, 4 repeticiones → 12)', rel(lsdDesign.vi, R.rom_lsd.vi, 1e-10));
  const arm = X.result({ input: 'arms', metric: 'SMD', T: { mean: 103, n: 50, disp: { type: 'sd', value: 5.5 } }, C: { mean: 100, n: 50, disp: { type: 'se', value: 4.5 / Math.sqrt(50) } } });
  check('medias con DE en un grupo y EE en el otro', rel(arm.yi, R.borenstein.g, 1e-10));
  const med = X.result({ input: 'medians', metric: 'MD', T: { n: 12, median: 5, q1: 4.1, q3: 6.3 }, C: { n: 12, center: 'range', median: 5, min: 2.2, max: 8.9 } });
  check('medianas: un grupo con cuartiles y otro con rango', rel(med.yi, R.wan_iqr.mean - R.wan_range.mean, 1e-12) && med.warn.length === 1);
  check('conteos con una celda en cero: +½ y aviso', (() => { const r = X.result({ input: 'counts', metric: 'OR', counts: { a: 0, b: 10, c: 3, d: 7 } }); return r.ok && r.warn.length === 1 && near(r.yi, Math.log(0.5 * 7.5 / (10.5 * 3.5)), 1e-12); })());
  check('correlación → z de Fisher', near(X.result({ input: 'corr', corr: { r: 0.5, n: 30 } }).yi, Math.atanh(0.5), 1e-12));
  check('efecto directo con su IC: EE = (U − L)/(2·1.96)', near(X.result({ input: 'direct', direct: { yi: 0.1, lo: -0.1, hi: 0.3 } }).se, 0.4 / (2 * 1.959963984540054), 1e-12));
  check('razón de respuesta con media cero → error explicado', !X.result({ input: 'arms', metric: 'ROM', T: { mean: 0, n: 4, disp: { type: 'sd', value: 1 } }, C: { mean: 5, n: 4, disp: { type: 'sd', value: 1 } } }).ok);
  check('% de cambio de la razón de respuesta', near(lsdRow.pct, (7.1 / 6.2 - 1) * 100, 1e-9));

  section('Imputación de DE faltantes con el CV medio');
  const imp = X.imputeCV([{ mean: 6, sd: 0.9 }, { mean: 7, sd: 1.4 }, { mean: 5, sd: '' }, { mean: 8, sd: 1.2 }]);
  check('CV medio igual a R e imputación marcada', rel(imp.cv, R.impute.cv, 1e-12) && imp.imputed[2] === true && near(imp.sd[2], R.impute.cv * 5, 1e-12));
  const noSd = { input: 'arms', metric: 'ROM', T: { mean: 7, n: 4, disp: { type: 'sd' } }, C: { mean: 6, n: 4, disp: { type: 'sd', value: 0.9 } } };
  check('sin permiso de imputar, la fila queda incompleta', !X.result(noSd).ok);
  const withImp = X.result(Object.assign({}, noSd, { imputedCV: 0.15 }));
  check('con permiso, se imputa solo la DE faltante y se avisa', withImp.ok && withImp.imputed && near(withImp.sd1, 1.05, 1e-12) && near(withImp.sd2, 0.9, 1e-12) && withImp.warn.length === 1);

  section('Formularios');
  const tp = X.template('meta', Protocol.normalize(JSON.parse(JSON.stringify(Examples.meta.protocol))), 'es');
  check('la plantilla de meta-análisis trae diseño y repeticiones obligatorios', tp.some(f => /Diseño experimental/.test(f.label) && f.required) && tp.some(f => f.label === 'Repeticiones' && f.type === 'number'));
  check('los moderadores del protocolo se vuelven campos (numéricos si son dosis o disponibles)', tp.some(f => /fósforo disponible/i.test(f.label) && f.type === 'number') && tp.some(f => /tipo de inoculante/i.test(f.label)));
  check('claves únicas', new Set(tp.map(f => f.id)).size === tp.length);
  check('la narrativa no pide diseño experimental', !X.template('narrative', null, 'es').some(f => /Diseño experimental/.test(f.label)));
  const nf = { type: 'number' }, mf = { type: 'multi' }, lf = { type: 'location' }, tf = { type: 'text' };
  check('comparar valores: números, listas sin orden, coordenadas, texto sin mayúsculas', X.same(5, 5.0, nf) && !X.same(5, 6, nf) && X.same(['a', 'b'], ['b', 'a'], mf) && X.same({ lat: 19.5, lon: -98.9 }, { lat: 19.5, lon: -98.9 }, lf) && X.same(' México', 'méxico ', { type: 'text' }) && !X.same('Mexico', 'Perú', tf) && X.same('Maíz', 'maíz', tf));
  check('coordenadas válidas', X.validLocation({ lat: 19.5, lon: -98.9 }) && !X.validLocation({ lat: 95, lon: 0 }) && !X.validLocation({ lat: 10 }));
})();
