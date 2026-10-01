/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 7 engine: quality, risk of bias and certainty of the evidence.

   1. Tools. The main one is a checklist for agronomic experiments written
      for ReviewPro from the principles of field experimentation (Fisher 1935;
      Gomez & Gomez 1984) and of the domain-based bias tools: randomization and
      local control, true replication (Hurlbert 1984, on pseudoreplication),
      an adequate control, complete data, comparable measurement, selective
      reporting and conflicts of interest. Each domain has signalling
      questions; an algorithm proposes the domain judgement and the reviewer
      may override it with a written reason. Alternatives: RoB 2 (Sterne et
      al. 2019) and ROBINS-I (Sterne et al. 2016) judged by domain, the
      Newcastle–Ottawa scale (Wells et al.) by stars, and a ten-question
      checklist for qualitative studies.
   2. The overall judgement follows the rule of the domain tools: the worst
      domain, and "high" also when several domains raise some concerns.
   3. Summaries for the traffic-light and the bar plots (McGuinness &
      Higgins 2021), unweighted or weighted by each study's inverse-variance
      weight.
   4. GRADE (Guyatt et al. 2008; 2011) per outcome: the starting level by
      design, five reasons to rate down and three to rate up, with
      suggestions computed from the data (share of weight at high risk, I²
      and the prediction interval, the confidence interval against the null
      and the optimal information size, Egger's test) that the reviewer
      accepts or changes. */

const Appraisal = {};

(function () {
  const has = v => v !== '' && v != null;

  /* ---------- answers and judgements ---------- */
  const ANS = { Y: ['Sí', 'Yes'], PY: ['Probablemente sí', 'Probably yes'], PN: ['Probablemente no', 'Probably no'], N: ['No', 'No'], NI: ['Sin información', 'No information'], NA: ['No aplica', 'Not applicable'] };
  const J = {
    low: { t: ['Bajo', 'Low'], c: 'var(--success)', s: '+', rank: 0 },
    some: { t: ['Algunas dudas', 'Some concerns'], c: 'var(--warning)', s: '−', rank: 1 },
    high: { t: ['Alto', 'High'], c: 'var(--danger)', s: '×', rank: 2 },
    moderate: { t: ['Moderado', 'Moderate'], c: 'var(--warning)', s: '−', rank: 1 },
    serious: { t: ['Serio', 'Serious'], c: 'var(--danger)', s: '×', rank: 2 },
    critical: { t: ['Crítico', 'Critical'], c: '#7a1b14', s: '!', rank: 3 },
    ni: { t: ['Sin información', 'No information'], c: 'var(--border-strong)', s: '?', rank: -1 },
  };

  /* ---------- the tools ---------- */
  const q = (id, t, o) => Object.assign({ id, t }, o || {});
  const TOOLS = {
    agro: {
      name: ['Lista de calidad para experimentos agronómicos', 'Quality checklist for agronomic experiments'], scale: ['low', 'some', 'high'], mode: 'questions',
      domains: [
        { id: 'D1', t: ['Aleatorización y control local', 'Randomization and local control'], qs: [
          q('1.1', ['¿Se asignaron los tratamientos a las parcelas al azar?', 'Were the treatments assigned to the plots at random?'], { key: true }),
          q('1.2', ['¿El diseño controla la heterogeneidad del terreno (bloques, covariables)?', 'Does the design control field heterogeneity (blocks, covariates)?'])] },
        { id: 'D2', t: ['Replicación verdadera', 'True replication'], qs: [
          q('2.1', ['¿Hay al menos tres repeticiones independientes por tratamiento?', 'Are there at least three independent replicates per treatment?'], { key: true }),
          q('2.2', ['¿La unidad del análisis es la unidad experimental (la parcela, no la planta o la submuestra)?', 'Is the unit of analysis the experimental unit (the plot, not the plant or the subsample)?'], { key: true })] },
        { id: 'D3', t: ['Testigo adecuado', 'Adequate control'], qs: [
          q('3.1', ['¿El testigo recibe el mismo manejo y difiere solo en el factor evaluado?', 'Does the control receive the same management and differ only in the factor evaluated?'], { key: true }),
          q('3.2', ['¿Tratamiento y testigo se evaluaron en el mismo sitio y ciclo?', 'Were treatment and control evaluated at the same site and season?'], { key: true })] },
        { id: 'D4', t: ['Datos completos', 'Complete data'], qs: [
          q('4.1', ['¿Se reportan datos de todas las parcelas (o se explican las pérdidas)?', 'Are data reported for every plot (or are losses explained)?'], { key: true }),
          q('4.2', ['¿Las pérdidas, si las hubo, son parecidas entre tratamientos?', 'Were losses, if any, similar between treatments?'])] },
        { id: 'D5', t: ['Medición del desenlace', 'Outcome measurement'], qs: [
          q('5.1', ['¿El desenlace se midió con un método estándar e igual en todos los tratamientos (p. ej., humedad del grano ajustada)?', 'Was the outcome measured with a standard method, the same in every treatment (e.g., grain moisture adjusted)?'], { key: true }),
          q('5.2', ['Si el desenlace es subjetivo (escalas visuales), ¿quien evaluó desconocía el tratamiento?', 'If the outcome is subjective (visual scales), was the assessor unaware of the treatment?'])] },
        { id: 'D6', t: ['Reporte selectivo', 'Selective reporting'], qs: [
          q('6.1', ['¿Se reportan todos los desenlaces, sitios y ciclos que se midieron?', 'Are all the outcomes, sites and seasons that were measured reported?'], { key: true }),
          q('6.2', ['¿El análisis estadístico parece fijado de antemano (no elegido por los resultados)?', 'Does the statistical analysis appear fixed in advance (not chosen by the results)?'])] },
        { id: 'D7', t: ['Conflicto de interés', 'Conflict of interest'], qs: [
          q('7.1', ['¿El estudio fue financiado o realizado por quien vende el insumo evaluado?', 'Was the study funded or run by whoever sells the input evaluated?'], { reverse: true, key: true })] },
      ],
    },
    rob2: {
      name: ['RoB 2 — ensayos aleatorizados (juicio por dominio)', 'RoB 2 — randomized trials (judgement by domain)'], scale: ['low', 'some', 'high'], mode: 'judge', ref: 'Sterne et al. 2019',
      domains: [
        { id: 'D1', t: ['Proceso de aleatorización', 'Randomization process'] },
        { id: 'D2', t: ['Desviaciones de las intervenciones previstas', 'Deviations from intended interventions'] },
        { id: 'D3', t: ['Datos faltantes del desenlace', 'Missing outcome data'] },
        { id: 'D4', t: ['Medición del desenlace', 'Measurement of the outcome'] },
        { id: 'D5', t: ['Selección del resultado reportado', 'Selection of the reported result'] },
      ],
    },
    robinsi: {
      name: ['ROBINS-I — estudios no aleatorizados (juicio por dominio)', 'ROBINS-I — non-randomized studies (judgement by domain)'], scale: ['low', 'moderate', 'serious', 'critical'], mode: 'judge', ref: 'Sterne et al. 2016',
      domains: [
        { id: 'D1', t: ['Confusión', 'Confounding'] },
        { id: 'D2', t: ['Selección de los participantes', 'Selection of participants'] },
        { id: 'D3', t: ['Clasificación de las intervenciones', 'Classification of interventions'] },
        { id: 'D4', t: ['Desviaciones de las intervenciones', 'Deviations from interventions'] },
        { id: 'D5', t: ['Datos faltantes', 'Missing data'] },
        { id: 'D6', t: ['Medición de los desenlaces', 'Measurement of outcomes'] },
        { id: 'D7', t: ['Selección del resultado reportado', 'Selection of the reported result'] },
      ],
    },
    nos: {
      name: ['Escala Newcastle–Ottawa — estudios observacionales', 'Newcastle–Ottawa scale — observational studies'], mode: 'stars', ref: 'Wells et al.',
      domains: [
        { id: 'S', t: ['Selección', 'Selection'], max: 4 },
        { id: 'C', t: ['Comparabilidad', 'Comparability'], max: 2 },
        { id: 'O', t: ['Desenlace o exposición', 'Outcome or exposure'], max: 3 },
      ],
    },
    casp: {
      name: ['Lista para estudios cualitativos (10 preguntas)', 'Checklist for qualitative studies (10 questions)'], mode: 'questions', scale: ['low', 'some', 'high'],
      domains: [
        { id: 'Q', t: ['Rigor del estudio cualitativo', 'Rigour of the qualitative study'], qs: [
          ['¿Objetivos claros?', 'Clear aims?'], ['¿Metodología cualitativa apropiada?', 'Appropriate qualitative methodology?'], ['¿Diseño adecuado a los objetivos?', 'Design appropriate to the aims?'],
          ['¿Selección de participantes adecuada?', 'Appropriate recruitment?'], ['¿Recolección de datos adecuada?', 'Appropriate data collection?'], ['¿Se consideró la relación investigador–participante?', 'Researcher–participant relationship considered?'],
          ['¿Se atendieron los aspectos éticos?', 'Ethical issues addressed?'], ['¿Análisis riguroso?', 'Rigorous analysis?'], ['¿Hallazgos claros?', 'Clear findings?'], ['¿Valor de la investigación?', 'Value of the research?']].map((t, i) => q('Q' + (i + 1), t, { key: i >= 7 })) },
      ],
    },
  };

  /* ---------- judgement of one domain from its answers ---------- */
  function badness(qq, a) {
    if (!a || a === 'NA') return 0;
    if (a === 'NI') return 1;
    const neg = qq.reverse ? (a === 'Y' ? 2 : a === 'PY' ? 1 : 0) : (a === 'N' ? 2 : a === 'PN' ? 1 : 0);
    return neg;
  }
  /* returns 'low' | 'some' | 'high' | null (not all answered) */
  function domainFromAnswers(dom, answers) {
    const as = dom.qs.map(qq => answers[qq.id]);
    if (as.some(a => !a)) return null;
    let high = false, some = false;
    dom.qs.forEach((qq, i) => {
      const b = badness(qq, as[i]);
      if (b === 2 && qq.key) high = true;
      else if (b >= 1) some = true;
    });
    return high ? 'high' : some ? 'some' : 'low';
  }
  /* overall: the worst domain; several domains with concerns count as high (as in RoB 2) */
  function overall(judgements, scale) {
    const js = judgements.filter(Boolean);
    if (!js.length) return null;
    if (scale && scale.includes('critical')) {
      const worst = js.reduce((a, b) => (J[b].rank > J[a].rank ? b : a), 'low');
      return js.every(j => j === 'ni') ? 'ni' : worst;
    }
    const nSome = js.filter(j => j === 'some').length;
    if (js.includes('high') || nSome >= 3) return 'high';
    if (nSome || js.includes('ni')) return 'some';
    return 'low';
  }
  /* Newcastle–Ottawa: stars per domain → total and the usual reading */
  function stars(s) {
    const tot = ['S', 'C', 'O'].reduce((a, k) => a + (+s[k] || 0), 0);
    return { total: tot, j: tot >= 7 ? 'low' : tot >= 5 ? 'some' : 'high' };
  }
  /* the assessment of one study by one reviewer: {answers, override: {D: {j, why}}, stars} */
  function assess(toolId, a) {
    const tool = TOOLS[toolId];
    const x = a || {};
    const ov = x.override || {};
    let doms;
    if (tool.mode === 'stars') {
      const s = stars(x.stars || {});
      return { domains: tool.domains.map(d => ({ id: d.id, j: null, stars: +(x.stars || {})[d.id] || 0 })), overall: Object.keys(x.stars || {}).length ? s.j : null, total: s.total };
    }
    if (tool.mode === 'questions') doms = tool.domains.map(d => { const auto = domainFromAnswers(d, x.answers || {}); const o = ov[d.id]; return { id: d.id, auto, j: o && o.j ? o.j : auto, overridden: !!(o && o.j), why: o && o.why }; });
    else doms = tool.domains.map(d => { const o = ov[d.id]; return { id: d.id, auto: null, j: o && o.j ? o.j : null, why: o && o.why }; });
    const complete = doms.every(d => d.j);
    const ovAll = ov.overall && ov.overall.j;
    return { domains: doms, overall: ovAll || (complete ? overall(doms.map(d => d.j), tool.scale) : null), overallAuto: complete ? overall(doms.map(d => d.j), tool.scale) : null, overridden: !!ovAll, complete };
  }

  /* ---------- summaries for the plots ----------
     rows: [{w, domains: {D1: j, …}, overall: j}] → per domain the share of each judgement */
  function summary(rows, domIds, weighted) {
    const out = {};
    domIds.concat(['overall']).forEach(d => {
      const tot = {}; let W = 0;
      rows.forEach(r => {
        const j = d === 'overall' ? r.overall : r.domains[d];
        if (!j) return;
        const w = weighted ? (r.w || 0) : 1;
        tot[j] = (tot[j] || 0) + w; W += w;
      });
      out[d] = Object.fromEntries(Object.entries(tot).map(([k, v]) => [k, W ? v / W : 0]));
    });
    return out;
  }

  /* ---------- GRADE ---------- */
  const LEVELS = [['Muy baja', 'Very low'], ['Baja', 'Low'], ['Moderada', 'Moderate'], ['Alta', 'High']];
  const SYMB = ['⊕◯◯◯', '⊕⊕◯◯', '⊕⊕⊕◯', '⊕⊕⊕⊕'];
  /* g = {start: 'rct'|'obs', rob, inc, ind, imp, pub (0, −1, −2), large, dose, conf (0, +1, +2)} */
  function certainty(g) {
    const start = g.start === 'obs' ? 1 : 3;
    const down = ['rob', 'inc', 'ind', 'imp', 'pub'].reduce((a, k) => a + Math.min(0, +g[k] || 0), 0);
    const up = g.start === 'obs' ? ['large', 'dose', 'conf'].reduce((a, k) => a + Math.max(0, +g[k] || 0), 0) : 0;
    const lvl = Math.max(0, Math.min(3, start + down + up));
    return { level: lvl, name: LEVELS[lvl], symbol: SYMB[lvl], start, down, up };
  }
  /* suggestions from the data of one outcome.
     d = {k, n (total plots), pooled (Meta.pool), egger, highShare (share of weight at high risk), someShare, metric, nullValue} */
  function suggest(d) {
    const s = {};
    /* risk of bias: most of the weight at high risk → −1; nearly all → −2 */
    if (d.highShare != null) {
      s.rob = d.highShare > 0.75 ? -2 : d.highShare >= 0.5 || (d.highShare + (d.someShare || 0)) > 0.8 ? -1 : 0;
      s.robWhy = [`${Math.round(100 * d.highShare)} % del peso con riesgo alto${d.someShare ? `, ${Math.round(100 * d.someShare)} % con algunas dudas` : ''}.`, `${Math.round(100 * d.highShare)} % of the weight at high risk${d.someShare ? `, ${Math.round(100 * d.someShare)} % with some concerns` : ''}.`];
    }
    const p = d.pooled;
    if (p && p.k >= 2) {
      /* inconsistency: I² above 75 %, or a prediction interval that crosses the null while the mean does not */
      const crossPI = p.pi && p.pi[0] < d.nullValue && p.pi[1] > d.nullValue && !(p.ci[0] < d.nullValue && p.ci[1] > d.nullValue);
      s.inc = p.I2 > 0.75 || (p.I2 > 0.5 && crossPI) ? -1 : 0;
      s.incWhy = [`I² = ${Math.round(100 * p.I2)} %${p.pi ? `; el intervalo de predicción ${crossPI ? 'cruza' : 'no cruza'} el valor nulo` : ''}.`, `I² = ${Math.round(100 * p.I2)} %${p.pi ? `; the prediction interval ${crossPI ? 'crosses' : 'does not cross'} the null` : ''}.`];
    }
    if (p) {
      /* imprecision: the CI crosses the null, or fewer plots than the optimal information size */
      const cross = p.ci[0] < d.nullValue && p.ci[1] > d.nullValue;
      const small = d.n != null && d.n < (d.ois || 400);
      s.imp = cross && small ? -2 : cross || small ? -1 : 0;
      s.impWhy = [`El IC 95 % ${cross ? 'incluye' : 'no incluye'} el valor nulo; ${d.n != null ? `${d.n} unidades experimentales en total` : 'n total desconocido'} (tamaño óptimo de información de referencia: ${d.ois || 400}).`, `The 95 % CI ${cross ? 'includes' : 'excludes'} the null; ${d.n != null ? `${d.n} experimental units in total` : 'total n unknown'} (reference optimal information size: ${d.ois || 400}).`];
    }
    /* publication bias: Egger's test only with at least ten studies */
    if (d.k >= 10 && d.egger) { s.pub = d.egger.p < 0.1 ? -1 : 0; s.pubWhy = [`Egger p = ${d.egger.p.toFixed(3)} con ${d.k} estudios.`, `Egger p = ${d.egger.p.toFixed(3)} with ${d.k} studies.`]; }
    else { s.pub = 0; s.pubWhy = ['Con menos de 10 estudios la asimetría del embudo no se puede evaluar; se deja sin bajar y se anota.', 'With fewer than 10 studies funnel asymmetry cannot be assessed; it is left unrated down and noted.']; }
    return s;
  }

  Object.assign(Appraisal, { ANS, J, TOOLS, badness, domainFromAnswers, overall, stars, assess, summary, LEVELS, SYMB, certainty, suggest });
  window.Appraisal = Appraisal;
})();
