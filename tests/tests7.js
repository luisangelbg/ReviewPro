/* ReviewPro — tests of Block 7 (risk of bias and GRADE).

   The algorithms are rules, so they are tested case by case against their
   definitions: which answer takes a domain to high risk, how the overall
   judgement is formed, how a star scale is read, how the plot shares are
   weighted, and how GRADE adds its steps (Guyatt et al. 2008; 2011): start at
   high for randomized experiments and at low for observational studies, rate
   down at most to very low, rate up only observational evidence. */
(function () {
  const { section, check, near } = TT;
  const A = Appraisal;
  const agro = A.TOOLS.agro;
  const D = id => agro.domains.find(d => d.id === id);

  section('La lista agronómica: juicio de un dominio');
  check('siete dominios, cada uno con al menos una pregunta', agro.domains.length === 7 && agro.domains.every(d => d.qs.length >= 1));
  check('todas las respuestas «sí» → bajo', A.domainFromAnswers(D('D2'), { '2.1': 'Y', '2.2': 'PY' }) === 'low');
  check('«no» en una pregunta clave → alto (p. ej., pseudorreplicación)', A.domainFromAnswers(D('D2'), { '2.1': 'Y', '2.2': 'N' }) === 'high');
  check('«probablemente no» en una clave → algunas dudas, no alto', A.domainFromAnswers(D('D2'), { '2.1': 'PN', '2.2': 'Y' }) === 'some');
  check('«no» en una pregunta no clave → algunas dudas', A.domainFromAnswers(D('D1'), { '1.1': 'Y', '1.2': 'N' }) === 'some');
  check('«sin información» → algunas dudas', A.domainFromAnswers(D('D4'), { '4.1': 'NI', '4.2': 'Y' }) === 'some');
  check('«no aplica» no cuenta en contra (evaluación ciega de un desenlace objetivo)', A.domainFromAnswers(D('D5'), { '5.1': 'Y', '5.2': 'NA' }) === 'low');
  check('pregunta invertida: financiado por quien vende el insumo = «sí» → alto', A.domainFromAnswers(D('D7'), { '7.1': 'Y' }) === 'high' && A.domainFromAnswers(D('D7'), { '7.1': 'N' }) === 'low' && A.domainFromAnswers(D('D7'), { '7.1': 'PY' }) === 'some');
  check('con preguntas sin contestar, el dominio queda pendiente', A.domainFromAnswers(D('D2'), { '2.1': 'Y' }) === null);

  section('Juicio global');
  check('el peor dominio manda', A.overall(['low', 'low', 'high', 'low'], agro.scale) === 'high');
  check('una o dos «algunas dudas» → algunas dudas', A.overall(['low', 'some', 'some', 'low'], agro.scale) === 'some');
  check('tres o más «algunas dudas» → alto (regla de RoB 2)', A.overall(['some', 'some', 'some', 'low'], agro.scale) === 'high');
  check('todo bajo → bajo', A.overall(['low', 'low'], agro.scale) === 'low');
  check('ROBINS-I: el peor de bajo < moderado < serio < crítico', A.overall(['low', 'moderate', 'serious'], A.TOOLS.robinsi.scale) === 'serious' && A.overall(['moderate', 'critical'], A.TOOLS.robinsi.scale) === 'critical');
  const full = { answers: { '1.1': 'Y', '1.2': 'Y', '2.1': 'Y', '2.2': 'Y', '3.1': 'Y', '3.2': 'Y', '4.1': 'Y', '4.2': 'Y', '5.1': 'Y', '5.2': 'NA', '6.1': 'PY', '6.2': 'Y', '7.1': 'N' }, override: {} };
  let r = A.assess('agro', full);
  check('una evaluación completa sin problemas → bajo', r.complete && r.overall === 'low' && r.domains.every(d => d.j === 'low'));
  r = A.assess('agro', Object.assign({}, full, { override: { D4: { j: 'high', why: 'pérdidas de parcelas no explicadas' } } }));
  check('un ajuste manual del revisor cambia el dominio y el global, y queda marcado', r.domains.find(d => d.id === 'D4').j === 'high' && r.domains.find(d => d.id === 'D4').overridden && r.overall === 'high');
  r = A.assess('agro', Object.assign({}, full, { override: { overall: { j: 'some' } } }));
  check('también se puede ajustar el global', r.overall === 'some' && r.overridden && r.overallAuto === 'low');
  check('RoB 2 por dominio: sin juicios, pendiente', A.assess('rob2', { override: {} }).overall === null && A.assess('rob2', { override: { D1: { j: 'low' }, D2: { j: 'low' }, D3: { j: 'some' }, D4: { j: 'low' }, D5: { j: 'low' } } }).overall === 'some');

  section('Newcastle–Ottawa');
  check('9 estrellas → bajo riesgo; 5 → algunas dudas; 3 → alto', A.stars({ S: 4, C: 2, O: 3 }).j === 'low' && A.stars({ S: 3, C: 1, O: 1 }).j === 'some' && A.stars({ S: 1, C: 0, O: 2 }).j === 'high');
  check('el total suma las tres secciones', A.stars({ S: 3, C: 2, O: 2 }).total === 7);

  section('Resumen para el gráfico de barras');
  const rows = [
    { w: 10, domains: { D1: 'low', D2: 'high' }, overall: 'high' },
    { w: 30, domains: { D1: 'low', D2: 'low' }, overall: 'low' },
    { w: 60, domains: { D1: 'some', D2: 'low' }, overall: 'some' },
  ];
  const u = A.summary(rows, ['D1', 'D2'], false), w = A.summary(rows, ['D1', 'D2'], true);
  check('sin ponderar: D1 = 2/3 bajo, 1/3 algunas dudas', near(u.D1.low, 2 / 3, 1e-12) && near(u.D1.some, 1 / 3, 1e-12));
  check('ponderado: D1 = 40 % bajo, 60 % algunas dudas; global 10 % alto', near(w.D1.low, 0.4, 1e-12) && near(w.D1.some, 0.6, 1e-12) && near(w.overall.high, 0.1, 1e-12));
  check('las proporciones de cada dominio suman 1', ['D1', 'D2', 'overall'].every(d => near(Object.values(w[d]).reduce((a, b) => a + b, 0), 1, 1e-12)));
  check('un estudio sin juicio en un dominio no cuenta en ese dominio', near(A.summary([{ w: 1, domains: { D1: 'low' } }, { w: 1, domains: {} }], ['D1'], false).D1.low, 1, 1e-12));

  section('GRADE: aritmética de la certeza');
  check('experimentos aleatorizados sin problemas → alta', A.certainty({ start: 'rct' }).level === 3);
  check('dos bajadas de un nivel → baja', A.certainty({ start: 'rct', rob: -1, imp: -1 }).level === 1 && A.certainty({ start: 'rct', rob: -1, imp: -1 }).name[0] === 'Baja');
  check('no baja de «muy baja»', A.certainty({ start: 'rct', rob: -2, inc: -2, imp: -2 }).level === 0);
  check('observacionales parten de baja', A.certainty({ start: 'obs' }).level === 1);
  check('observacionales suben con efecto grande (+1) y dosis–respuesta (+1)', A.certainty({ start: 'obs', large: 1, dose: 1 }).level === 3);
  check('los experimentos aleatorizados no suben', A.certainty({ start: 'rct', rob: -1, large: 2 }).level === 2);
  check('símbolos ⊕', A.certainty({ start: 'rct', imp: -1 }).symbol === '⊕⊕⊕◯');

  section('GRADE: sugerencias desde los datos');
  const base = { k: 12, n: 600, nullValue: 0, egger: { p: 0.4 } };
  const pooled = (est, lo, hi, I2, pi) => ({ k: 12, est, ci: [lo, hi], I2, pi });
  let s = A.suggest(Object.assign({}, base, { highShare: 0.6, someShare: 0.1, pooled: pooled(0.1, 0.05, 0.15, 0.2, [0.02, 0.18]) }));
  check('más de la mitad del peso con riesgo alto → bajar 1 por riesgo de sesgo', s.rob === -1);
  check('I² = 20 % y el intervalo de predicción no cruza el nulo → no bajar por inconsistencia', s.inc === 0);
  check('IC lejos del nulo y 600 unidades → no bajar por imprecisión', s.imp === 0);
  check('Egger p = 0.4 con 12 estudios → no bajar por sesgo de publicación', s.pub === 0);
  s = A.suggest(Object.assign({}, base, { highShare: 0.8, pooled: pooled(0.1, -0.02, 0.22, 0.8, [-0.2, 0.4]) }));
  check('casi todo el peso con riesgo alto → bajar 2', s.rob === -2);
  check('I² = 80 % → bajar 1 por inconsistencia', s.inc === -1);
  check('IC que cruza el nulo → bajar 1 por imprecisión', s.imp === -1);
  s = A.suggest(Object.assign({}, base, { n: 120, highShare: 0, pooled: pooled(0.1, -0.02, 0.22, 0.6, [-0.1, 0.3]) }));
  check('IC que cruza el nulo y solo 120 unidades → bajar 2 por imprecisión', s.imp === -2);
  s = A.suggest(Object.assign({}, base, { highShare: 0, pooled: pooled(0.1, 0.03, 0.17, 0.6, [-0.1, 0.3]) }));
  check('I² = 60 % con el IP cruzando el nulo y la media no → bajar 1', s.inc === -1);
  s = A.suggest(Object.assign({}, base, { egger: { p: 0.03 } , highShare: 0, pooled: pooled(0.1, 0.05, 0.15, 0.2, null) }));
  check('Egger p = 0.03 con 12 estudios → bajar 1 por sesgo de publicación', s.pub === -1);
  s = A.suggest(Object.assign({}, base, { k: 6, egger: { p: 0.01 }, highShare: 0, pooled: pooled(0.1, 0.05, 0.15, 0.2, null) }));
  check('con 6 estudios no se evalúa la asimetría (se deja y se explica)', s.pub === 0 && /menos de 10/.test(s.pubWhy[0]));
})();
