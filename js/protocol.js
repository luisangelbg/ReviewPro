/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 2 engine: the protocol.

   A protocol is written before searching so that the review cannot bend to
   what it finds. This module holds everything that can be decided about a
   protocol without a screen:
   1. The question frameworks (PICO, PICOS, PECO, PCC, SPIDER and a free
      question), which one suits each review type, and the sentence each one
      produces.
   2. Checks on the question: missing elements, vague words, a meta-analysis
      without a comparator.
   3. Eligibility criteria seeded from the question, numbered I1…, E1… so the
      screening blocks can cite them as reasons.
   4. Completeness by section, weighted by what each review type requires.
   5. The PRISMA-P 2015 checklist (Moher et al. 2015; Shamseer et al. 2015):
      17 items, 26 with their sub-items, each with where it is met.
   6. Two registration templates filled from the protocol: the fields of the
      prospective register of systematic reviews (PROSPERO) and the
      generalized systematic review registration of the Open Science
      Framework (van den Akker et al. 2023).
   7. A default schedule by review type, and ORCID identifiers checked with
      their ISO 7064 MOD 11-2 check character.

   Protocol text is whatever the user writes, in the language they write it;
   the connecting words the app adds follow the language chosen for the
   output. */

const Protocol = {};

(function () {

  const tr = (p, lang) => (lang === 'en' ? p[1] : p[0]);
  const has = s => typeof s === 'string' && s.trim().length > 0;
  const clean = s => String(s || '').trim().replace(/\s+/g, ' ').replace(/[.;,:]+$/, '');

  /* ================= 1 · frameworks ================= */
  const FRAMEWORKS = {
    PICO: {
      name: ['PICO', 'PICO'], use: ['Intervenciones y tratamientos: ¿funciona?, ¿cuánto?', 'Interventions and treatments: does it work, how much?'],
      el: [
        { k: 'P', t: ['Población o sistema', 'Population or system'], h: ['Cultivo, especie, suelo, sistema de producción, región…', 'Crop, species, soil, production system, region…'], ex: ['maíz de grano en campo', 'field-grown grain maize'], req: true },
        { k: 'I', t: ['Intervención', 'Intervention'], h: ['El manejo, insumo o tratamiento que se evalúa', 'The management, input or treatment evaluated'], ex: ['inoculación con hongos micorrízicos arbusculares', 'inoculation with arbuscular mycorrhizal fungi'], req: true },
        { k: 'C', t: ['Comparador', 'Comparator'], h: ['Contra qué se compara: testigo, práctica convencional…', 'What it is compared with: control, conventional practice…'], ex: ['sin inocular', 'no inoculation'], req: true },
        { k: 'O', t: ['Desenlace (outcome)', 'Outcome'], h: ['Qué se mide: rendimiento, incidencia, calidad…', 'What is measured: yield, incidence, quality…'], ex: ['rendimiento de grano', 'grain yield'], req: true },
      ],
    },
    PICOS: {
      name: ['PICOS', 'PICOS'], use: ['PICO con el diseño de estudio fijado de antemano', 'PICO with the study design fixed in advance'],
      el: null, // PICO + S, built below
    },
    PECO: {
      name: ['PECO', 'PECO'], use: ['Exposiciones que no se asignan: clima, contaminación, manejo observado', 'Exposures that are not assigned: climate, pollution, observed management'],
      el: [
        { k: 'P', t: ['Población o sistema', 'Population or system'], h: ['Quién o qué está expuesto', 'Who or what is exposed'], ex: ['cafetales de sombra', 'shaded coffee plantations'], req: true },
        { k: 'E', t: ['Exposición', 'Exposure'], h: ['El factor al que se expone la población', 'The factor the population is exposed to'], ex: ['olas de calor durante la floración', 'heat waves during flowering'], req: true },
        { k: 'C', t: ['Comparador', 'Comparator'], h: ['Nivel de referencia de la exposición', 'Reference level of the exposure'], ex: ['temperaturas dentro del rango normal', 'temperatures within the normal range'], req: true },
        { k: 'O', t: ['Desenlace (outcome)', 'Outcome'], h: ['Qué se mide', 'What is measured'], ex: ['amarre de fruto', 'fruit set'], req: true },
      ],
    },
    PCC: {
      name: ['PCC', 'PCC'], use: ['Revisiones exploratorias: mapear conceptos en un contexto', 'Scoping reviews: mapping concepts in a context'],
      el: [
        { k: 'P', t: ['Población', 'Population'], h: ['Quiénes o qué sistemas', 'Who or which systems'], ex: ['pequeños productores de café', 'smallholder coffee farmers'], req: true },
        { k: 'Co', t: ['Concepto', 'Concept'], h: ['El fenómeno, práctica o idea que se mapea', 'The phenomenon, practice or idea mapped'], ex: ['prácticas agroecológicas', 'agroecological practices'], req: true },
        { k: 'Cx', t: ['Contexto', 'Context'], h: ['Dónde, cuándo o en qué marco', 'Where, when or within what setting'], ex: ['América Latina, 2000–2025', 'Latin America, 2000–2025'], req: true },
      ],
    },
    SPIDER: {
      name: ['SPIDER', 'SPIDER'], use: ['Evidencia cualitativa o de métodos mixtos', 'Qualitative or mixed-methods evidence'],
      el: [
        { k: 'S', t: ['Muestra', 'Sample'], h: ['Quiénes participan', 'Who takes part'], ex: ['técnicos de extensión agrícola', 'agricultural extension workers'], req: true },
        { k: 'PI', t: ['Fenómeno de interés', 'Phenomenon of interest'], h: ['Qué experiencia, práctica o proceso', 'Which experience, practice or process'], ex: ['la adopción de tecnologías digitales', 'the adoption of digital technologies'], req: true },
        { k: 'D', t: ['Diseño', 'Design'], h: ['Entrevistas, grupos focales, etnografía…', 'Interviews, focus groups, ethnography…'], ex: ['entrevistas y grupos focales', 'interviews and focus groups'], req: true },
        { k: 'E', t: ['Evaluación', 'Evaluation'], h: ['Qué se explora: percepciones, barreras…', 'What is explored: perceptions, barriers…'], ex: ['barreras y facilitadores', 'barriers and enablers'], req: true },
        { k: 'R', t: ['Tipo de investigación', 'Research type'], h: ['Cualitativa, mixta', 'Qualitative, mixed'], ex: ['cualitativa o mixta', 'qualitative or mixed'], req: false },
      ],
    },
    FREE: {
      name: ['Pregunta libre', 'Free question'], use: ['Revisiones narrativas: una pregunta amplia escrita a mano', 'Narrative reviews: a broad question written by hand'],
      el: [{ k: 'Q', t: ['Pregunta', 'Question'], h: ['Escríbela completa', 'Write it in full'], ex: ['¿Cómo ha cambiado la comprensión del papel de las micorrizas en la nutrición del maíz?', 'How has the understanding of the role of mycorrhizae in maize nutrition changed?'], req: true }],
    },
  };
  FRAMEWORKS.PICOS.el = FRAMEWORKS.PICO.el.concat([{ k: 'S', t: ['Diseño de estudio', 'Study design'], h: ['Qué diseños cuentan', 'Which designs count'], ex: ['experimentos de campo con testigo', 'field experiments with a control'], req: true }]);
  const FW_ORDER = ['PICO', 'PICOS', 'PECO', 'PCC', 'SPIDER', 'FREE'];
  const RECOMMENDED = { narrative: 'FREE', scoping: 'PCC', systematic: 'PICO', meta: 'PICOS' };

  /* the question as a sentence; missing elements appear as [P], [I]… */
  /* Spanish contracts «a el» and «de el»; the user's text may start with «el» */
  const contract = (s, L) => (L === 'es' ? s.replace(/(^|[\s¿(])([Aa]) el /g, '$1$2l ').replace(/(^|[\s¿(])([Dd])e el /g, '$1$2el ') : s);
  function buildQuestion(fw, el, lang) { return contract(buildQuestion0(fw, el, lang), lang === 'en' ? 'en' : 'es'); }
  function buildQuestion0(fw, el, lang) {
    const e = el || {};
    const v = k => (has(e[k]) ? clean(e[k]) : `[${k}]`);
    const L = lang === 'en' ? 'en' : 'es';
    switch (fw) {
      case 'PICO': return L === 'es' ? `En ${v('P')}, ¿qué efecto tiene ${v('I')} frente a ${v('C')} sobre ${v('O')}?` : `In ${v('P')}, what is the effect of ${v('I')} compared with ${v('C')} on ${v('O')}?`;
      case 'PICOS': return L === 'es' ? `En ${v('P')}, ¿qué efecto tiene ${v('I')} frente a ${v('C')} sobre ${v('O')}, según ${v('S')}?` : `In ${v('P')}, what is the effect of ${v('I')} compared with ${v('C')} on ${v('O')}, according to ${v('S')}?`;
      case 'PECO': return L === 'es' ? `En ${v('P')}, ¿se asocia la exposición a ${v('E')}, frente a ${v('C')}, con cambios en ${v('O')}?` : `In ${v('P')}, is exposure to ${v('E')}, compared with ${v('C')}, associated with changes in ${v('O')}?`;
      case 'PCC': return L === 'es' ? `¿Qué evidencia existe sobre ${v('Co')} en ${v('P')}, en ${v('Cx')}?` : `What evidence exists on ${v('Co')} among ${v('P')}, in ${v('Cx')}?`;
      case 'SPIDER': return L === 'es' ? `¿Qué muestran los estudios ${has(e.R) ? clean(e.R) + ' ' : ''}basados en ${v('D')} sobre ${v('PI')} en ${v('S')}, en términos de ${v('E')}?` : `What do ${has(e.R) ? clean(e.R) + ' ' : ''}studies based on ${v('D')} show about ${v('PI')} among ${v('S')}, in terms of ${v('E')}?`;
      default: return has(e.Q) ? String(e.Q).trim() : '[Q]';
    }
  }
  /* the question actually used: the user's own wording if they wrote one */
  const questionOf = (p, lang) => (has(p.questionText) ? p.questionText.trim() : buildQuestion(p.framework, p.elements, lang));

  /* ================= 2 · checks on the question ================= */
  const VAGUE = /\b(todos?|todas?|cualquiera?|diversos?|varios|varias|en general|etc|all|any|various|several|in general|everything)\b/i;
  function checkQuestion(p) {
    const out = [];
    const F = FRAMEWORKS[p.framework];
    if (!F) return [{ level: 'bad', msg: ['Elige un marco para la pregunta.', 'Choose a framework for the question.'] }];
    const e = p.elements || {};
    F.el.forEach(x => {
      if (x.req && !has(e[x.k])) out.push({ level: 'bad', msg: [`Falta «${x.t[0]}» (${x.k}).`, `"${x.t[1]}" (${x.k}) is missing.`] });
    });
    F.el.forEach(x => {
      if (has(e[x.k]) && VAGUE.test(e[x.k])) out.push({ level: 'warn', msg: [`«${x.t[0]}» usa palabras vagas («${e[x.k].match(VAGUE)[0]}»): una revisión necesita límites que dos personas lean igual.`, `"${x.t[1]}" uses vague words ("${e[x.k].match(VAGUE)[0]}"): a review needs limits that two people read the same way.`] });
      if (has(e[x.k]) && (e[x.k].match(/,|\by\b|\bo\b|\band\b|\bor\b/g) || []).length >= 4) out.push({ level: 'warn', msg: [`«${x.t[0]}» junta muchos elementos: considera separar la pregunta o jerarquizarlos.`, `"${x.t[1]}" lumps many elements together: consider splitting the question or ranking them.`] });
    });
    const t = p.type;
    if ((t === 'meta' || t === 'systematic') && (p.framework === 'PCC' || p.framework === 'FREE')) out.push({ level: 'warn', msg: ['Una revisión sistemática o un meta-análisis piden una pregunta focalizada: PICO, PICOS, PECO o SPIDER.', 'A systematic review or a meta-analysis asks for a focused question: PICO, PICOS, PECO or SPIDER.'] });
    if (t === 'meta' && (p.framework === 'PICO' || p.framework === 'PICOS' || p.framework === 'PECO') && !has(e.C)) out.push({ level: 'bad', msg: ['Sin comparador no hay efecto que combinar: el meta-análisis necesita saber contra qué se mide.', 'Without a comparator there is no effect to pool: the meta-analysis needs to know against what it is measured.'] });
    if (t === 'meta' && p.framework === 'SPIDER') out.push({ level: 'warn', msg: ['SPIDER es para evidencia cualitativa; un meta-análisis combina efectos numéricos.', 'SPIDER is for qualitative evidence; a meta-analysis pools numerical effects.'] });
    if (t === 'scoping' && (p.framework === 'PICO' || p.framework === 'PICOS')) out.push({ level: 'info', msg: ['Una exploratoria suele usar PCC; PICO funciona si ya sabes qué intervención mapear.', 'A scoping review usually uses PCC; PICO works if you already know which intervention to map.'] });
    return out;
  }

  /* ================= 3 · eligibility criteria ================= */
  const DEFAULT_CRITERIA = {
    narrative: [['inc', 'pub', ['Artículos, capítulos y libros que discutan el tema', 'Articles, chapters and books discussing the topic']]],
    scoping: [['inc', 'pub', ['Cualquier diseño de estudio primario, revisiones y literatura gris', 'Any primary study design, reviews and grey literature']],
      ['exc', 'pub', ['Editoriales y opiniones sin datos ni métodos', 'Editorials and opinion pieces without data or methods']]],
    systematic: [['inc', 'design', ['Estudios primarios con grupo de comparación', 'Primary studies with a comparison group']],
      ['exc', 'pub', ['Revisiones, editoriales y resúmenes de congreso sin resultados completos', 'Reviews, editorials and conference abstracts without full results']],
      ['exc', 'dup', ['Publicaciones duplicadas del mismo estudio (se conserva la más completa)', 'Duplicate publications of the same study (the most complete is kept)']]],
    meta: [['inc', 'design', ['Estudios con testigo que reporten, para cada grupo, media, medida de dispersión y número de repeticiones (o datos para calcularlos)', 'Studies with a control reporting, for each group, mean, a measure of dispersion and number of replicates (or data to derive them)']],
      ['exc', 'pub', ['Revisiones, editoriales y resúmenes de congreso sin resultados completos', 'Reviews, editorials and conference abstracts without full results']],
      ['exc', 'data', ['Estudios sin datos cuantitativos extraíbles tras contactar a los autores', 'Studies without extractable quantitative data after contacting the authors']],
      ['exc', 'dup', ['Publicaciones duplicadas del mismo estudio (se conserva la más completa)', 'Duplicate publications of the same study (the most complete is kept)']]],
  };
  /* criteria from the question's elements plus the defaults of the type */
  function seedCriteria(p, lang) {
    const F = FRAMEWORKS[p.framework];
    const out = [];
    if (F && p.framework !== 'FREE') F.el.forEach(x => {
      if (has((p.elements || {})[x.k])) out.push({ kind: 'inc', facet: x.k, text: `${tr(x.t, lang)}: ${clean(p.elements[x.k])}` });
    });
    (DEFAULT_CRITERIA[p.type] || []).forEach(([kind, facet, txt]) => out.push({ kind, facet, text: tr(txt, lang) }));
    return numberCriteria(out);
  }
  /* I1, I2… and E1, E2… in order of appearance */
  function numberCriteria(list) {
    let i = 0, e = 0;
    return list.map(c => Object.assign({}, c, { id: c.kind === 'exc' ? 'E' + (++e) : 'I' + (++i) }));
  }

  /* ================= catalogues used by the forms ================= */
  const APPRAISAL = {
    rob2: { n: ['RoB 2 — ensayos aleatorizados', 'RoB 2 — randomized trials'], ref: 'Sterne et al. 2019', for: ['systematic', 'meta'] },
    robinsi: { n: ['ROBINS-I — estudios no aleatorizados de intervenciones', 'ROBINS-I — non-randomized studies of interventions'], ref: 'Sterne et al. 2016', for: ['systematic', 'meta'] },
    agro: { n: ['Lista de calidad para experimentos agronómicos (diseño, repeticiones, aleatorización, sitios y ciclos)', 'Quality checklist for agronomic experiments (design, replicates, randomization, sites and seasons)'], ref: 'ReviewPro', for: ['systematic', 'meta', 'scoping'] },
    nos: { n: ['Newcastle–Ottawa — estudios observacionales', 'Newcastle–Ottawa — observational studies'], ref: 'Wells et al.', for: ['systematic', 'meta'] },
    casp: { n: ['Lista para estudios cualitativos', 'Checklist for qualitative studies'], ref: 'CASP', for: ['systematic', 'scoping'] },
    none: { n: ['No se evaluará el riesgo de sesgo', 'Risk of bias will not be assessed'], ref: '', for: ['narrative', 'scoping'] },
  };
  const METRICS = {
    ROM: ['Razón de respuesta, ln(RR) — cambio proporcional', 'Response ratio, ln(RR) — proportional change'],
    SMD: ['Diferencia de medias estandarizada (g de Hedges)', 'Standardized mean difference (Hedges\' g)'],
    MD: ['Diferencia de medias (misma escala)', 'Mean difference (same scale)'],
    RR: ['Razón de riesgos (conteos)', 'Risk ratio (counts)'],
    OR: ['Razón de momios (conteos)', 'Odds ratio (counts)'],
    RD: ['Diferencia de riesgos (conteos)', 'Risk difference (counts)'],
    ZCOR: ['Correlación (z de Fisher)', 'Correlation (Fisher\'s z)'],
  };
  const ESTIMATORS = { REML: 'REML', DL: 'DerSimonian–Laird', PM: 'Paule–Mandel', HE: 'Hedges', ML: 'ML' };
  const SYNTH = {
    thematic: { n: ['Síntesis temática e interpretativa', 'Thematic and interpretive synthesis'], for: ['narrative'] },
    charting: { n: ['Tablas de caracterización y mapa de evidencia', 'Charting tables and evidence map'], for: ['scoping'] },
    swim: { n: ['Síntesis sin meta-análisis (SWiM): agrupación, dirección del efecto y tablas', 'Synthesis without meta-analysis (SWiM): grouping, direction of effect and tables'], for: ['systematic'] },
    meta: { n: ['Meta-análisis de efectos aleatorios', 'Random-effects meta-analysis'], for: ['systematic', 'meta'] },
  };
  const DEFAULT_SYNTH = { narrative: 'thematic', scoping: 'charting', systematic: 'swim', meta: 'meta' };
  const ROLES = { conc: ['Conceptualización', 'Conceptualization'], meth: ['Metodología', 'Methodology'], search: ['Búsqueda', 'Search'], screen: ['Cribado', 'Screening'], extract: ['Extracción', 'Extraction'], anal: ['Análisis', 'Analysis'], write: ['Redacción', 'Writing'], sup: ['Supervisión', 'Supervision'], guar: ['Garante', 'Guarantor'] };

  /* ================= a blank protocol ================= */
  function blank(type) {
    const t = type || 'systematic';
    return {
      title: '', type: t, framework: RECOMMENDED[t], elements: {}, questionText: '',
      background: '', objectives: '', hypotheses: '', keywords: '',
      criteria: [], years: { from: '', to: '' }, languages: 'inglés, español', pubTypes: ['journal'],
      outcomes: [], moderators: '',
      sources: [], greyLit: '', otherSearch: '',
      screening: { reviewers: 2, pilot: 50, prioritized: true, stop: 'consecutive', stopN: 100, check: true, fulltextDual: true, kappa: 0.6, disagreements: 'discussion' },
      extraction: { dual: t !== 'narrative', contactAuthors: t === 'meta' || t === 'systematic', items: '' },
      appraisal: { tool: t === 'narrative' || t === 'scoping' ? 'none' : 'agro', certainty: t === 'meta' || t === 'systematic' ? 'grade' : 'none' },
      synthesis: { approach: DEFAULT_SYNTH[t], metric: 'ROM', estimator: 'REML', knha: true, subgroups: '', sensitivity: '', pubBias: t === 'meta', notes: '' },
      team: [], contactIdx: 0, funding: '', coi: '',
      dates: { start: '', end: '' }, milestones: [],
      registration: { registry: t === 'scoping' || t === 'narrative' ? 'osf' : 'prospero', id: '', lang: 'en' },
      amendments: '', dissemination: '',
    };
  }

  /* ================= 4 · completeness ================= */
  function sections(p) {
    const T = p.type, S = [];
    const add = (id, t, status, notes) => S.push({ id, t, status, notes: notes || [] });
    const q = checkQuestion(p);
    add('title', ['Título', 'Title'], has(p.title) ? 'ok' : 'missing', has(p.title) ? [] : [['Falta el título.', 'The title is missing.']]);
    add('question', ['Pregunta', 'Question'], q.some(x => x.level === 'bad') ? 'missing' : q.some(x => x.level === 'warn') ? 'warn' : 'ok', q.map(x => x.msg));
    add('background', ['Justificación y objetivos', 'Rationale and objectives'], has(p.background) && has(p.objectives) ? 'ok' : T === 'narrative' && has(p.objectives) ? 'ok' : 'missing',
      [!has(p.background) && ['Explica por qué hace falta esta revisión (qué no resuelven las existentes).', 'Explain why this review is needed (what existing ones do not settle).'], !has(p.objectives) && ['Escribe los objetivos.', 'Write the objectives.']].filter(Boolean));
    const nInc = p.criteria.filter(c => c.kind === 'inc' && has(c.text)).length, nExc = p.criteria.filter(c => c.kind === 'exc' && has(c.text)).length;
    add('criteria', ['Criterios de elegibilidad', 'Eligibility criteria'], nInc && (nExc || T === 'narrative') ? 'ok' : nInc ? 'warn' : T === 'narrative' ? 'warn' : 'missing',
      [!nInc && ['Sin criterios de inclusión.', 'No inclusion criteria.'], nInc && !nExc && ['Sin criterios de exclusión: el cribado no tendrá motivos que citar.', 'No exclusion criteria: screening will have no reasons to cite.']].filter(Boolean));
    const nOut = p.outcomes.filter(o => has(o.name)).length, nPrim = p.outcomes.filter(o => has(o.name) && o.role === 'primary').length;
    const needOut = T === 'systematic' || T === 'meta';
    add('outcomes', ['Desenlaces', 'Outcomes'], !needOut ? (nOut ? 'ok' : 'na') : nPrim ? 'ok' : nOut ? 'warn' : 'missing',
      [needOut && !nPrim && ['Declara al menos un desenlace primario: es el que decide la conclusión.', 'Declare at least one primary outcome: it is the one that decides the conclusion.']].filter(Boolean));
    const nDb = p.sources.filter(s => has(s.name) && s.kind === 'db').length;
    const needDb = T === 'narrative' ? 1 : 2;
    add('sources', ['Fuentes de información', 'Information sources'], nDb >= needDb ? (T === 'meta' && !has(p.greyLit) ? 'warn' : 'ok') : nDb ? 'warn' : 'missing',
      [nDb < needDb && [`Declara al menos ${needDb} base(s) de datos.`, `Declare at least ${needDb} database(s).`], T === 'meta' && !has(p.greyLit) && ['Un meta-análisis debe buscar literatura gris contra el sesgo de publicación.', 'A meta-analysis should search grey literature against publication bias.']].filter(Boolean));
    const sc = p.screening;
    add('screening', ['Selección de estudios', 'Study selection'], T === 'narrative' ? 'na' : sc.reviewers >= 2 ? 'ok' : 'warn',
      [T !== 'narrative' && sc.reviewers < 2 && ['Con un solo revisor, al menos verifica una muestra con un segundo revisor.', 'With a single reviewer, at least verify a sample with a second reviewer.'], sc.prioritized && !sc.check && ['El cribado priorizado con regla de paro debería verificarse con una muestra al azar de lo no leído.', 'Prioritized screening with a stopping rule should be checked with a random sample of the unread.']].filter(Boolean));
    add('extraction', ['Extracción de datos', 'Data extraction'], T === 'narrative' ? 'na' : has(p.extraction.items) ? 'ok' : 'missing', [T !== 'narrative' && !has(p.extraction.items) && ['Lista las variables que extraerás de cada estudio.', 'List the variables you will extract from each study.']].filter(Boolean));
    const needApp = T === 'systematic' || T === 'meta';
    add('appraisal', ['Riesgo de sesgo y certeza', 'Risk of bias and certainty'], !needApp ? 'na' : p.appraisal.tool !== 'none' ? (p.appraisal.certainty === 'grade' ? 'ok' : 'warn') : 'missing',
      [needApp && p.appraisal.tool === 'none' && ['Una revisión sistemática evalúa el riesgo de sesgo de cada estudio.', 'A systematic review assesses the risk of bias of each study.'], needApp && p.appraisal.certainty !== 'grade' && ['Declara cómo calificarás la certeza de la evidencia.', 'Declare how you will rate the certainty of the evidence.']].filter(Boolean));
    const sy = p.synthesis;
    const synthOk = sy.approach === 'meta' ? (has(sy.metric) && has(sy.estimator)) : has(sy.approach);
    add('synthesis', ['Plan de síntesis', 'Synthesis plan'], synthOk ? (T === 'meta' && sy.approach !== 'meta' ? 'missing' : 'ok') : 'missing',
      [T === 'meta' && sy.approach !== 'meta' && ['El tipo es meta-análisis pero el plan de síntesis no lo es.', 'The type is meta-analysis but the synthesis plan is not.'], sy.approach === 'meta' && !has(sy.sensitivity) && ['Declara al menos un análisis de sensibilidad (p. ej., sin estudios de alto riesgo de sesgo).', 'Declare at least one sensitivity analysis (e.g., without high risk-of-bias studies).']].filter(Boolean));
    const nTeam = p.team.filter(a => has(a.name)).length, contact = p.team[p.contactIdx];
    const badOrcid = p.team.filter(a => has(a.orcid) && !orcidValid(a.orcid)).map(a => a.name || '?');
    add('team', ['Equipo', 'Team'], nTeam && contact && has(contact.email) && !badOrcid.length ? 'ok' : nTeam ? 'warn' : 'missing',
      [!nTeam && ['Añade a los autores.', 'Add the authors.'], nTeam && !(contact && has(contact.email)) && ['El autor de contacto necesita correo.', 'The contact author needs an e-mail.'], badOrcid.length && [`ORCID con dígito verificador inválido: ${badOrcid.join(', ')}.`, `ORCID with an invalid check character: ${badOrcid.join(', ')}.`]].filter(Boolean));
    const dOk = has(p.dates.start) && has(p.dates.end) && p.dates.end > p.dates.start;
    add('dates', ['Fechas y cronograma', 'Dates and schedule'], dOk ? 'ok' : 'missing', [!dOk && ['Fecha de inicio y de término (el término después del inicio).', 'Start and end date (the end after the start).']].filter(Boolean));
    add('coi', ['Financiamiento y conflictos de interés', 'Funding and conflicts of interest'], has(p.funding) && has(p.coi) ? 'ok' : 'missing', [(!has(p.funding) || !has(p.coi)) && ['Declara ambos, aunque sea «ninguno».', 'Declare both, even if "none".']].filter(Boolean));
    return S;
  }
  function score(p) {
    const s = sections(p).filter(x => x.status !== 'na');
    const pts = s.reduce((a, x) => a + (x.status === 'ok' ? 1 : x.status === 'warn' ? 0.5 : 0), 0);
    return { value: s.length ? pts / s.length : 0, ok: s.filter(x => x.status === 'ok').length, warn: s.filter(x => x.status === 'warn').length, missing: s.filter(x => x.status === 'missing').length, n: s.length };
  }

  /* the search strategy lives in Block 3 (state.search); a protocol under test may carry its own in p._search */
  function searchStrings(p) {
    const s = (p && p._search) || (window.state && state.search);
    if (!s || !window.Search) return '';
    const txt = Search.write(s, s.dialect || 'func');
    return txt || '';
  }

  /* ================= 5 · PRISMA-P 2015 =================
     status: ok | missing | later (met in a later block) | na (not applicable
     to this review type). `where` says where the item lives. */
  const PRISMAP = [
    { id: '1a', sec: 'admin', t: ['Identificación: el documento se identifica como protocolo de una revisión sistemática', 'Identification: the report is identified as a protocol of a systematic review'], chk: p => has(p.title), w: ['Título', 'Title'] },
    { id: '1b', sec: 'admin', t: ['Actualización: si actualiza una revisión previa, se indica', 'Update: if it updates a previous review, it says so'], chk: () => true, w: ['No aplica salvo actualización', 'Not applicable unless an update'], opt: true },
    { id: '2', sec: 'admin', t: ['Registro: nombre del registro y número', 'Registration: name of the registry and number'], chk: p => has(p.registration.id), w: ['Registro', 'Registration'], later: p => !has(p.registration.id) },
    { id: '3a', sec: 'admin', t: ['Autores: nombre, afiliación, correo y dirección; autor de contacto', 'Authors: name, affiliation, e-mail and address; contact author'], chk: p => p.team.some(a => has(a.name) && has(a.aff)) && !!(p.team[p.contactIdx] && has(p.team[p.contactIdx].email)), w: ['Equipo', 'Team'] },
    { id: '3b', sec: 'admin', t: ['Contribuciones de cada autor y garante', 'Contributions of each author and guarantor'], chk: p => p.team.length > 0 && p.team.every(a => !has(a.name) || (a.roles || []).length) && p.team.some(a => (a.roles || []).includes('guar')), w: ['Equipo · roles', 'Team · roles'] },
    { id: '4', sec: 'admin', t: ['Enmiendas: cómo se documentarán', 'Amendments: how they will be documented'], chk: p => has(p.amendments), w: ['Registro · enmiendas', 'Registration · amendments'] },
    { id: '5a', sec: 'admin', t: ['Apoyo: fuentes de financiamiento', 'Support: sources of funding'], chk: p => has(p.funding), w: ['Equipo · financiamiento', 'Team · funding'] },
    { id: '5b', sec: 'admin', t: ['Patrocinador', 'Sponsor'], chk: p => has(p.funding), w: ['Equipo · financiamiento', 'Team · funding'] },
    { id: '5c', sec: 'admin', t: ['Papel del financiador en el protocolo', 'Role of the funder in the protocol'], chk: p => has(p.funding) && has(p.coi), w: ['Equipo · conflictos', 'Team · conflicts'] },
    { id: '6', sec: 'intro', t: ['Justificación en el contexto de lo ya conocido', 'Rationale in the context of what is already known'], chk: p => has(p.background), w: ['Pregunta · justificación', 'Question · rationale'] },
    { id: '7', sec: 'intro', t: ['Objetivos con referencia a participantes, intervenciones, comparadores y desenlaces', 'Objectives with reference to participants, interventions, comparators and outcomes'], chk: p => has(p.objectives) && !checkQuestion(p).some(x => x.level === 'bad'), w: ['Pregunta', 'Question'] },
    { id: '8', sec: 'methods', t: ['Criterios de elegibilidad, incluidos años, idiomas y estado de publicación', 'Eligibility criteria, including years, languages and publication status'], chk: p => p.criteria.some(c => c.kind === 'inc' && has(c.text)) && has(p.languages) && (has(p.years.from) || has(p.years.to) || p.type === 'narrative'), w: ['Criterios', 'Criteria'] },
    { id: '9', sec: 'methods', t: ['Fuentes de información con fechas de cobertura previstas', 'Information sources with planned dates of coverage'], chk: p => p.sources.some(s => has(s.name)), w: ['Fuentes', 'Sources'] },
    { id: '10', sec: 'methods', t: ['Borrador de la estrategia de búsqueda de al menos una base de datos', 'Draft search strategy for at least one database'], chk: p => !!searchStrings(p), w: ['Bloque 3', 'Block 3'], later: () => true },
    { id: '11a', sec: 'methods', t: ['Manejo de datos: cómo se gestionan los registros', 'Data management: how records will be managed'], chk: () => true, w: ['ReviewPro guarda y exporta el proyecto', 'ReviewPro saves and exports the project'] },
    { id: '11b', sec: 'methods', t: ['Proceso de selección: revisores, etapas, desacuerdos', 'Selection process: reviewers, stages, disagreements'], chk: p => p.screening.reviewers >= 1 && has(p.screening.disagreements), w: ['Métodos · selección', 'Methods · selection'], naFor: ['narrative'] },
    { id: '11c', sec: 'methods', t: ['Proceso de extracción: por duplicado, contacto con autores', 'Data collection process: in duplicate, contacting authors'], chk: p => typeof p.extraction.dual === 'boolean', w: ['Métodos · extracción', 'Methods · extraction'], naFor: ['narrative'] },
    { id: '12', sec: 'methods', t: ['Variables a extraer y supuestos', 'Data items to be extracted and assumptions'], chk: p => has(p.extraction.items), w: ['Métodos · extracción', 'Methods · extraction'], naFor: ['narrative'] },
    { id: '13', sec: 'methods', t: ['Desenlaces primarios y secundarios, y su prioridad', 'Primary and secondary outcomes, and their prioritization'], chk: p => p.outcomes.some(o => has(o.name) && o.role === 'primary'), w: ['Desenlaces', 'Outcomes'], naFor: ['narrative'] },
    { id: '14', sec: 'methods', t: ['Riesgo de sesgo de cada estudio y cómo se usará', 'Risk of bias of individual studies and how it will be used'], chk: p => p.appraisal.tool !== 'none', w: ['Métodos · calidad', 'Methods · quality'], naFor: ['narrative', 'scoping'] },
    { id: '15a', sec: 'methods', t: ['Criterios para combinar cuantitativamente', 'Criteria for quantitative synthesis'], chk: p => p.synthesis.approach === 'meta' ? has(p.synthesis.metric) : has(p.synthesis.approach), w: ['Métodos · síntesis', 'Methods · synthesis'], naFor: ['narrative'] },
    { id: '15b', sec: 'methods', t: ['Métodos de combinación, heterogeneidad (I², τ²) y modelo', 'Methods of pooling, heterogeneity (I², τ²) and model'], chk: p => p.synthesis.approach !== 'meta' || (has(p.synthesis.estimator) && has(p.synthesis.metric)), w: ['Métodos · síntesis', 'Methods · synthesis'], naFor: ['narrative', 'scoping'] },
    { id: '15c', sec: 'methods', t: ['Análisis adicionales: subgrupos, meta-regresión, sensibilidad', 'Additional analyses: subgroups, meta-regression, sensitivity'], chk: p => has(p.synthesis.subgroups) || has(p.synthesis.sensitivity), w: ['Métodos · síntesis', 'Methods · synthesis'], naFor: ['narrative', 'scoping'] },
    { id: '15d', sec: 'methods', t: ['Si no se combina: tipo de síntesis narrativa', 'If pooling is not appropriate: type of narrative synthesis'], chk: p => has(p.synthesis.approach), w: ['Métodos · síntesis', 'Methods · synthesis'] },
    { id: '16', sec: 'methods', t: ['Metasesgos: sesgo de publicación y reporte selectivo', 'Meta-bias(es): publication bias and selective reporting'], chk: p => p.synthesis.pubBias || has(p.greyLit), w: ['Métodos · síntesis', 'Methods · synthesis'], naFor: ['narrative'] },
    { id: '17', sec: 'methods', t: ['Confianza en la evidencia acumulada (p. ej., GRADE)', 'Confidence in cumulative evidence (e.g., GRADE)'], chk: p => p.appraisal.certainty === 'grade', w: ['Métodos · calidad', 'Methods · quality'], naFor: ['narrative', 'scoping'] },
  ];
  function prismaP(p) {
    return PRISMAP.map(it => {
      let status;
      if (it.naFor && it.naFor.includes(p.type)) status = 'na';
      else if (it.chk(p)) status = 'ok';
      else if (it.later && it.later(p)) status = 'later';
      else status = 'missing';
      return { id: it.id, sec: it.sec, t: it.t, w: it.w, status };
    });
  }

  /* ================= 6 · registration templates =================
     Each field: {k, t: [es, en], req, get(p, L) → text}. The text is built from
     the protocol; empty means the field still has to be written. */
  const join = (arr, L) => { const a = arr.filter(has); if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (L === 'en' ? ' and ' : ' y ') + a[a.length - 1]; };
  const T2 = (L, es, en) => (L === 'en' ? en : es);
  const txt = {
    team: (p, L) => p.team.filter(a => has(a.name)).map(a => `${a.name}${has(a.aff) ? ` (${a.aff})` : ''}${has(a.orcid) ? ` ORCID ${a.orcid}` : ''}${(a.roles || []).length ? ` — ${a.roles.map(r => tr(ROLES[r], L)).join(', ')}` : ''}`).join('\n'),
    contact: p => { const a = p.team[p.contactIdx]; return a && has(a.name) ? a.name : ''; },
    email: p => { const a = p.team[p.contactIdx]; return a && has(a.email) ? a.email : ''; },
    aff: p => { const a = p.team[p.contactIdx]; return a && has(a.aff) ? a.aff : ''; },
    criteria: (p, L, kind) => p.criteria.filter(c => c.kind === kind && has(c.text)).map(c => `${c.id}. ${c.text}`).join('\n'),
    limits: (p, L) => [has(p.years.from) || has(p.years.to) ? T2(L, `Años: ${p.years.from || '…'}–${p.years.to || T2(L, 'actual', 'present')}.`, `Years: ${p.years.from || '…'}–${p.years.to || 'present'}.`) : '', has(p.languages) ? T2(L, `Idiomas: ${p.languages}.`, `Languages: ${p.languages}.`) : ''].filter(Boolean).join(' '),
    sources: (p, L) => {
      const db = p.sources.filter(s => has(s.name) && s.kind === 'db').map(s => s.name + (has(s.note) ? ` (${s.note})` : ''));
      const other = p.sources.filter(s => has(s.name) && s.kind !== 'db').map(s => s.name + (has(s.note) ? ` (${s.note})` : ''));
      const parts = [];
      if (db.length) parts.push(T2(L, `Bases de datos: ${join(db, L)}.`, `Databases: ${join(db, L)}.`));
      if (other.length) parts.push(T2(L, `Otras fuentes: ${join(other, L)}.`, `Other sources: ${join(other, L)}.`));
      if (has(p.greyLit)) parts.push(T2(L, `Literatura gris: ${clean(p.greyLit)}.`, `Grey literature: ${clean(p.greyLit)}.`));
      if (has(p.otherSearch)) parts.push(clean(p.otherSearch) + '.');
      const lim = txt.limits(p, L); if (lim) parts.push(lim);
      return parts.join(' ');
    },
    screening: (p, L) => {
      if (p.type === 'narrative') return '';
      const s = p.screening, parts = [];
      parts.push(T2(L, `Los títulos y resúmenes serán cribados por ${s.reviewers} revisor(es) de forma ${s.reviewers >= 2 ? 'independiente y ciega' : 'individual'}${s.pilot ? `, tras una prueba piloto con ${s.pilot} registros para calibrar los criterios` : ''}.`,
        `Titles and abstracts will be screened by ${s.reviewers} reviewer(s) ${s.reviewers >= 2 ? 'independently and blind to each other' : 'individually'}${s.pilot ? `, after a pilot of ${s.pilot} records to calibrate the criteria` : ''}.`));
      if (s.prioritized) parts.push(T2(L, `El orden de lectura se priorizará con aprendizaje activo (TF-IDF y Bayes ingenuo) y el cribado se detendrá ${s.stop === 'knee' ? 'con el método de la rodilla (Cormack y Grossman 2016)' : `tras ${s.stopN} registros irrelevantes consecutivos`}${s.check ? ', verificando la regla con una muestra aleatoria de los registros no leídos' : ''}.`,
        `The reading order will be prioritized with active learning (TF-IDF and naive Bayes) and screening will stop ${s.stop === 'knee' ? 'by the knee method (Cormack and Grossman 2016)' : `after ${s.stopN} consecutive irrelevant records`}${s.check ? ', verifying the rule with a random sample of the unread records' : ''}.`));
      if (s.reviewers >= 2) parts.push(T2(L, `El acuerdo se medirá con kappa de Cohen (objetivo ≥ ${s.kappa}); los desacuerdos se resolverán ${s.disagreements === 'third' ? 'con un tercer revisor' : 'por discusión'}.`,
        `Agreement will be measured with Cohen's kappa (target ≥ ${s.kappa}); disagreements will be resolved ${s.disagreements === 'third' ? 'by a third reviewer' : 'by discussion'}.`));
      parts.push(T2(L, `Los textos completos se evaluarán ${s.fulltextDual ? 'por duplicado' : 'por un revisor'} y cada exclusión se registrará con el criterio que la motiva.`, `Full texts will be assessed ${s.fulltextDual ? 'in duplicate' : 'by one reviewer'} and every exclusion will be recorded with the criterion that motivates it.`));
      return parts.join(' ');
    },
    extraction: (p, L) => {
      if (p.type === 'narrative' && !has(p.extraction.items)) return '';
      const e = p.extraction;
      return [T2(L, `Los datos se extraerán ${e.dual ? 'por duplicado, de forma independiente,' : 'por un revisor y serán verificados por otro'} con un formulario piloteado.`, `Data will be extracted ${e.dual ? 'in duplicate, independently,' : 'by one reviewer and verified by another'} with a piloted form.`),
        has(e.items) ? T2(L, `Variables: ${clean(e.items)}.`, `Items: ${clean(e.items)}.`) : '',
        e.contactAuthors ? T2(L, 'Se contactará a los autores cuando falten datos.', 'Authors will be contacted when data are missing.') : ''].filter(Boolean).join(' ');
    },
    outcomes: (p, L, role) => p.outcomes.filter(o => has(o.name) && o.role === role).map(o => `${clean(o.name)}${has(o.measure) ? ` (${clean(o.measure)})` : ''}`).join('; '),
    rob: (p, L) => {
      const a = APPRAISAL[p.appraisal.tool];
      if (!a || p.appraisal.tool === 'none') return T2(L, 'No se evaluará el riesgo de sesgo, como corresponde a este tipo de revisión.', 'Risk of bias will not be assessed, as corresponds to this type of review.');
      return T2(L, `El riesgo de sesgo se evaluará con ${tr(a.n, 'es')}${a.ref && a.ref !== 'ReviewPro' ? ` (${a.ref})` : ''}, por dos revisores.`, `Risk of bias will be assessed with ${tr(a.n, 'en')}${a.ref && a.ref !== 'ReviewPro' ? ` (${a.ref})` : ''}, by two reviewers.`) +
        (p.appraisal.certainty === 'grade' ? T2(L, ' La certeza de la evidencia de cada desenlace se calificará con GRADE.', ' The certainty of the evidence for each outcome will be rated with GRADE.') : '');
    },
    synthesis: (p, L) => {
      const s = p.synthesis, parts = [];
      if (s.approach === 'meta') {
        parts.push(T2(L, `Los efectos se expresarán como ${tr(METRICS[s.metric] || ['', ''], 'es').toLowerCase()} y se combinarán con un modelo de efectos aleatorios con τ² estimado por ${ESTIMATORS[s.estimator]}${s.knha ? ' y el ajuste de Knapp–Hartung para el intervalo de confianza' : ''}.`,
          `Effects will be expressed as ${tr(METRICS[s.metric] || ['', ''], 'en').toLowerCase()} and pooled with a random-effects model with τ² estimated by ${ESTIMATORS[s.estimator]}${s.knha ? ' and the Knapp–Hartung adjustment for the confidence interval' : ''}.`));
        parts.push(T2(L, 'La heterogeneidad se describirá con τ², I² y el intervalo de predicción.', 'Heterogeneity will be described with τ², I² and the prediction interval.'));
      } else if (SYNTH[s.approach]) parts.push(T2(L, `Síntesis prevista: ${tr(SYNTH[s.approach].n, 'es').toLowerCase()}.`, `Planned synthesis: ${tr(SYNTH[s.approach].n, 'en').toLowerCase()}.`));
      if (has(s.notes)) parts.push(clean(s.notes) + '.');
      return parts.join(' ');
    },
    subgroups: (p, L) => [has(p.synthesis.subgroups) ? T2(L, `Subgrupos o moderadores: ${clean(p.synthesis.subgroups)}.`, `Subgroups or moderators: ${clean(p.synthesis.subgroups)}.`) : '', has(p.moderators) ? T2(L, `Variables moderadoras: ${clean(p.moderators)}.`, `Moderator variables: ${clean(p.moderators)}.`) : ''].filter(Boolean).join(' '),
    sensitivity: (p, L) => has(p.synthesis.sensitivity) ? T2(L, `Análisis de sensibilidad: ${clean(p.synthesis.sensitivity)}.`, `Sensitivity analyses: ${clean(p.synthesis.sensitivity)}.`) : '',
    pubBias: (p, L) => p.synthesis.pubBias ? T2(L, 'El sesgo de publicación se explorará con el gráfico de embudo, la prueba de Egger y el método de recorte y relleno cuando haya al menos 10 estudios.', 'Publication bias will be explored with the funnel plot, Egger\'s test and trim-and-fill when there are at least 10 studies.') : '',
    typeName: (p, L) => ({ narrative: ['Revisión narrativa', 'Narrative review'], scoping: ['Revisión exploratoria (scoping)', 'Scoping review'], systematic: ['Revisión sistemática', 'Systematic review'], meta: ['Revisión sistemática con meta-análisis', 'Systematic review with meta-analysis'] }[p.type] || ['', ''])[L === 'en' ? 1 : 0],
    design: (p, L) => txt.criteria(p, L, 'inc').split('\n').filter(l => /dise|design|estudio|stud|experim/i.test(l)).join('\n') || ((p.elements || {}).S ? clean(p.elements.S) : ''),
  };
  const el = k => p => (has((p.elements || {})[k]) ? clean(p.elements[k]) : '');
  const PROSPERO = [
    { k: 'title', t: ['Título de la revisión', 'Review title'], req: true, get: p => p.title || '' },
    { k: 'start', t: ['Fecha de inicio prevista', 'Anticipated start date'], req: true, get: p => p.dates.start || '' },
    { k: 'end', t: ['Fecha de término prevista', 'Anticipated completion date'], req: true, get: p => p.dates.end || '' },
    { k: 'stage', t: ['Etapa de la revisión al registrar', 'Stage of the review at registration'], req: true, get: (p, L) => T2(L, 'Búsqueda preliminar no iniciada; cribado no iniciado.', 'Preliminary searches not started; screening not started.') },
    { k: 'contact', t: ['Contacto', 'Named contact'], req: true, get: txt.contact },
    { k: 'email', t: ['Correo del contacto', 'Contact e-mail'], req: true, get: txt.email },
    { k: 'aff', t: ['Afiliación', 'Organisational affiliation'], req: true, get: txt.aff },
    { k: 'team', t: ['Equipo de la revisión', 'Review team members'], req: true, get: txt.team },
    { k: 'funding', t: ['Financiamiento', 'Funding sources/sponsors'], req: true, get: p => p.funding || '' },
    { k: 'coi', t: ['Conflictos de interés', 'Conflicts of interest'], req: true, get: p => p.coi || '' },
    { k: 'question', t: ['Pregunta de la revisión', 'Review question'], req: true, get: (p, L) => questionOf(p, L) },
    { k: 'searches', t: ['Búsquedas', 'Searches'], req: true, get: txt.sources },
    { k: 'domain', t: ['Condición o dominio estudiado', 'Condition or domain being studied'], req: true, get: p => p.keywords ? clean(p.keywords) : el('O')(p) },
    { k: 'pop', t: ['Participantes o población', 'Participants/population'], req: true, get: p => el('P')(p) || el('S')(p) },
    { k: 'int', t: ['Intervención o exposición', 'Intervention(s), exposure(s)'], req: true, get: p => el('I')(p) || el('E')(p) || el('Co')(p) },
    { k: 'comp', t: ['Comparador o testigo', 'Comparator(s)/control'], req: p => (Protocol.FRAMEWORKS[p.framework].el || []).some(x => x.k === 'C'), get: p => el('C')(p) },
    { k: 'design', t: ['Tipos de estudio incluidos', 'Types of study to be included'], req: true, get: txt.design },
    { k: 'context', t: ['Contexto', 'Context'], req: false, get: (p, L) => el('Cx')(p) || txt.limits(p, L) },
    { k: 'main', t: ['Desenlaces principales', 'Main outcome(s)'], req: true, get: (p, L) => txt.outcomes(p, L, 'primary') },
    { k: 'measures', t: ['Medidas de efecto', 'Measures of effect'], req: false, get: (p, L) => p.synthesis.approach === 'meta' ? tr(METRICS[p.synthesis.metric] || ['', ''], L) : '' },
    { k: 'add', t: ['Desenlaces adicionales', 'Additional outcome(s)'], req: false, get: (p, L) => txt.outcomes(p, L, 'secondary') },
    { k: 'extraction', t: ['Extracción de datos (selección y codificación)', 'Data extraction (selection and coding)'], req: true, get: (p, L) => [txt.screening(p, L), txt.extraction(p, L)].filter(Boolean).join(' ') },
    { k: 'rob', t: ['Evaluación del riesgo de sesgo (calidad)', 'Risk of bias (quality) assessment'], req: true, get: txt.rob },
    { k: 'synthesis', t: ['Estrategia de síntesis de datos', 'Strategy for data synthesis'], req: true, get: (p, L) => [txt.synthesis(p, L), txt.sensitivity(p, L), txt.pubBias(p, L)].filter(Boolean).join(' ') },
    { k: 'subgroups', t: ['Análisis de subgrupos', 'Analysis of subgroups or subsets'], req: true, get: (p, L) => txt.subgroups(p, L) || T2(L, 'No se planean análisis de subgrupos.', 'No subgroup analyses are planned.') },
    { k: 'type', t: ['Tipo y método de revisión', 'Type and method of review'], req: true, get: txt.typeName },
    { k: 'lang', t: ['Idioma', 'Language'], req: true, get: p => p.languages || '' },
    { k: 'dissemination', t: ['Planes de difusión', 'Dissemination plans'], req: false, get: p => p.dissemination || '' },
    { k: 'keywords', t: ['Palabras clave', 'Keywords'], req: false, get: p => p.keywords || '' },
  ];
  const OSF = [
    { sec: ['Metadatos', 'Metadata'], k: 'title', t: ['Título', 'Title'], req: true, get: p => p.title || '' },
    { sec: ['Metadatos', 'Metadata'], k: 'type', t: ['Tipo de revisión', 'Type of review'], req: true, get: txt.typeName },
    { sec: ['Metadatos', 'Metadata'], k: 'stage', t: ['Etapa de la revisión', 'Review stage'], req: true, get: (p, L) => T2(L, 'Protocolo; la búsqueda no ha comenzado.', 'Protocol; the search has not started.') },
    { sec: ['Metadatos', 'Metadata'], k: 'dates', t: ['Fechas de inicio y término', 'Start and end dates'], req: true, get: p => has(p.dates.start) ? `${p.dates.start} – ${p.dates.end || '…'}` : '' },
    { sec: ['Metadatos', 'Metadata'], k: 'team', t: ['Autores y contribuciones', 'Authors and contributions'], req: true, get: txt.team },
    { sec: ['Metadatos', 'Metadata'], k: 'funding', t: ['Financiamiento', 'Funding'], req: true, get: p => p.funding || '' },
    { sec: ['Metadatos', 'Metadata'], k: 'coi', t: ['Conflictos de interés', 'Conflicts of interest'], req: true, get: p => p.coi || '' },
    { sec: ['Introducción', 'Introduction'], k: 'background', t: ['Antecedentes', 'Background'], req: true, get: p => p.background || '' },
    { sec: ['Introducción', 'Introduction'], k: 'q1', t: ['Pregunta de investigación principal', 'Primary research question(s)'], req: true, get: (p, L) => questionOf(p, L) },
    { sec: ['Introducción', 'Introduction'], k: 'obj', t: ['Objetivos', 'Objectives'], req: true, get: p => p.objectives || '' },
    { sec: ['Introducción', 'Introduction'], k: 'hyp', t: ['Expectativas o hipótesis', 'Expectations/hypotheses'], req: false, get: p => p.hypotheses || '' },
    { sec: ['Variables', 'Variables'], k: 'dv', t: ['Desenlaces o variables dependientes', 'Dependent variables/outcomes'], req: p => p.type !== 'narrative', get: (p, L) => [txt.outcomes(p, L, 'primary'), txt.outcomes(p, L, 'secondary')].filter(Boolean).join(' | ') },
    { sec: ['Variables', 'Variables'], k: 'iv', t: ['Intervenciones, exposiciones o conceptos', 'Independent variables/interventions/concepts'], req: p => p.type !== 'narrative', get: p => [el('I')(p), el('E')(p), el('Co')(p), el('PI')(p)].filter(Boolean).join('; ') },
    { sec: ['Variables', 'Variables'], k: 'cov', t: ['Covariables y moderadores', 'Additional variables/covariates'], req: false, get: p => p.moderators || '' },
    { sec: ['Búsqueda', 'Search'], k: 'db', t: ['Bases de datos, literatura gris y otras estrategias', 'Databases, grey literature and other strategies'], req: true, get: txt.sources },
    { sec: ['Búsqueda', 'Search'], k: 'strings', t: ['Cadenas de búsqueda', 'Query strings'], req: true, get: p => searchStrings(p), later: true },
    { sec: ['Búsqueda', 'Search'], k: 'contact', t: ['Contacto con autores', 'Procedures to contact authors'], req: false, get: (p, L) => p.extraction.contactAuthors ? T2(L, 'Se escribirá al autor de correspondencia; si no responde en tres semanas, se enviará un recordatorio y después el estudio se clasificará como «sin datos».', 'The corresponding author will be written to; if there is no reply in three weeks, a reminder will be sent and then the study will be classed as "no data".') : '' },
    { sec: ['Cribado', 'Screening'], k: 'inc', t: ['Criterios de inclusión', 'Inclusion criteria'], req: true, get: (p, L) => txt.criteria(p, L, 'inc') },
    { sec: ['Cribado', 'Screening'], k: 'exc', t: ['Criterios de exclusión', 'Exclusion criteria'], req: p => p.type !== 'narrative', get: (p, L) => txt.criteria(p, L, 'exc') },
    { sec: ['Cribado', 'Screening'], k: 'proc', t: ['Etapas, fiabilidad y conciliación del cribado', 'Screening stages, reliability and reconciliation'], req: p => p.type !== 'narrative', get: txt.screening },
    { sec: ['Extracción', 'Extraction'], k: 'ent', t: ['Entidades a extraer', 'Entities to extract'], req: p => p.type !== 'narrative', get: p => p.extraction.items || '' },
    { sec: ['Extracción', 'Extraction'], k: 'eproc', t: ['Procedimiento de extracción', 'Extraction procedure'], req: p => p.type !== 'narrative', get: txt.extraction },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'quality', t: ['Evaluación de calidad', 'Quality assessment'], req: true, get: txt.rob },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'synth', t: ['Plan de síntesis', 'Synthesis plan'], req: true, get: txt.synthesis },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'moder', t: ['Moderadores y subgrupos', 'Moderators and subgroups'], req: false, get: txt.subgroups },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'sens', t: ['Análisis de sensibilidad', 'Sensitivity analyses'], req: false, get: txt.sensitivity },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'pb', t: ['Sesgo de publicación', 'Publication bias'], req: false, get: txt.pubBias },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'infer', t: ['Criterios para las conclusiones', 'Criteria for conclusions/inference'], req: false, get: (p, L) => p.type === 'meta' ? T2(L, 'La conclusión se basará en el efecto combinado, su intervalo de confianza, el intervalo de predicción y la certeza GRADE; no solo en el valor p.', 'Conclusions will rest on the pooled effect, its confidence interval, the prediction interval and the GRADE certainty; not on the p value alone.') : '' },
    { sec: ['Síntesis y calidad', 'Synthesis and quality'], k: 'data', t: ['Manejo y publicación de datos', 'Data management and sharing'], req: false, get: (p, L) => T2(L, 'El proyecto completo (registros, decisiones, datos extraídos y análisis) se depositará en un repositorio abierto al publicar.', 'The complete project (records, decisions, extracted data and analyses) will be deposited in an open repository on publication.') },
  ];
  function fill(template, p, L) {
    return template.map(f => {
      const v = String(f.get(p, L) || '').trim();
      const req = typeof f.req === 'function' ? !!f.req(p) : f.req;
      return { k: f.k, sec: f.sec, t: f.t, req, text: v, status: v ? 'ok' : f.later ? 'later' : req ? 'missing' : 'empty' };
    });
  }
  const TEMPLATES = { prospero: PROSPERO, osf: OSF };
  /* Which language is the user's own text in? Counting a few very common
     function words is enough to tell Spanish from English in a paragraph. */
  const ES_W = new Set('de la el los las del con por para que en y se un una sin sobre frente entre como más'.split(' '));
  const EN_W = new Set('the of and in with for on by to from without between as more is are an a'.split(' '));
  function langGuess(text) {
    const w = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]+/).filter(Boolean);
    let es = 0, en = 0;
    w.forEach(x => { if (ES_W.has(x)) es++; if (EN_W.has(x)) en++; });
    if (es + en < 3) return null;
    return es > en * 1.5 ? 'es' : en > es * 1.5 ? 'en' : null;
  }
  /* the language of the texts the registration will carry verbatim */
  function contentLang(p) { return langGuess([p.title, p.background, p.objectives, ...Object.values(p.elements || {}), ...p.criteria.map(c => c.text)].join(' ')); }
  /* PROSPERO registers systematic reviews (with or without meta-analysis) that
     have an outcome of direct relevance to health; it does not register scoping
     or narrative reviews. OSF registers any review. */
  function registryFit(p, which) {
    if (which === 'prospero' && (p.type === 'scoping' || p.type === 'narrative')) return { ok: false, msg: ['PROSPERO no registra revisiones exploratorias ni narrativas: usa OSF.', 'PROSPERO does not register scoping or narrative reviews: use OSF.'] };
    if (which === 'prospero') return { ok: true, msg: ['PROSPERO registra revisiones sistemáticas con un desenlace relevante para la salud (humana o animal, incluida la alimentación); verifica que tu pregunta califique.', 'PROSPERO registers systematic reviews with an outcome relevant to health (human or animal, including food); check that your question qualifies.'] };
    return { ok: true, msg: ['OSF registra cualquier tipo de revisión y de tema.', 'OSF registers any type of review on any topic.'] };
  }
  function registration(p, which, L) { return fill(TEMPLATES[which], p, L || p.registration.lang || 'en'); }
  function registrationText(p, which, L) {
    const rows = registration(p, which, L);
    const head = which === 'prospero' ? T2(L, 'Registro prospectivo de revisiones sistemáticas — campos', 'Prospective register of systematic reviews — fields') : T2(L, 'Registro generalizado de revisiones sistemáticas (OSF)', 'Generalized systematic review registration (OSF)');
    let s = `${head}\n${'='.repeat(head.length)}\n\n`;
    let sec = null;
    rows.forEach(r => {
      if (r.sec && tr(r.sec, L) !== sec) { sec = tr(r.sec, L); s += `\n## ${sec}\n\n`; }
      s += `### ${tr(r.t, L)}${r.req ? ' *' : ''}\n${r.text || T2(L, '[por completar]', '[to be completed]')}\n\n`;
    });
    return s;
  }

  /* ================= 7 · schedule and identifiers ================= */
  /* phases by type: [name, share of the total time, blocks] */
  const PHASES = {
    narrative: [[['Planeación', 'Planning'], 0.1], [['Búsqueda y lectura', 'Search and reading'], 0.45], [['Síntesis', 'Synthesis'], 0.2], [['Redacción', 'Writing'], 0.25]],
    scoping: [[['Protocolo y registro', 'Protocol and registration'], 0.1], [['Búsqueda', 'Search'], 0.1], [['Cribado', 'Screening'], 0.25], [['Caracterización de datos', 'Data charting'], 0.25], [['Mapa y síntesis', 'Map and synthesis'], 0.1], [['Redacción', 'Writing'], 0.2]],
    systematic: [[['Protocolo y registro', 'Protocol and registration'], 0.1], [['Búsqueda', 'Search'], 0.08], [['Cribado de título y resumen', 'Title and abstract screening'], 0.17], [['Texto completo', 'Full text'], 0.12], [['Extracción', 'Extraction'], 0.15], [['Riesgo de sesgo', 'Risk of bias'], 0.1], [['Síntesis', 'Synthesis'], 0.1], [['Redacción', 'Writing'], 0.18]],
  };
  PHASES.meta = PHASES.systematic.map(x => x.slice());
  PHASES.meta[6] = [['Meta-análisis', 'Meta-analysis'], 0.1];
  const MONTHS_DEFAULT = { narrative: 3, scoping: 6, systematic: 12, meta: 12 };
  /* milestones laid end to end from `start` (ISO) over `months`; they overlap slightly */
  function schedule(type, startISO, months, L) {
    const s = parseISO(startISO);
    if (!s) return [];
    const total = Math.round((months || MONTHS_DEFAULT[type]) * 30.44);
    const d0 = dayNumber(s.y, s.m, s.d);
    let acc = 0;
    return PHASES[type].map(([name, share], i, arr) => {
      const len = Math.max(7, Math.round(total * share));
      const a = d0 + acc, b = i === arr.length - 1 ? d0 + total : d0 + acc + len;
      acc += len;
      return { name: tr(name, L), start: toISO(fromDayNumber(a)), end: toISO(fromDayNumber(b)) };
    });
  }
  /* ORCID: 16 characters, the last a check character by ISO 7064 MOD 11-2 */
  function orcidCheck(base15) {
    let total = 0;
    for (const ch of base15) total = (total + Number(ch)) * 2;
    const r = (12 - (total % 11)) % 11;
    return r === 10 ? 'X' : String(r);
  }
  function orcidValid(s) {
    const t = String(s || '').trim().replace(/^https?:\/\/orcid\.org\//i, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(t)) return false;
    const digits = t.replace(/-/g, '');
    return orcidCheck(digits.slice(0, 15)) === digits[15];
  }

  /* a protocol read from a file may come from an older version or be partial:
     every field the forms expect is filled from a blank one */
  function normalize(p) {
    const b = blank(p && p.type);
    const out = Object.assign({}, b, p || {});
    ['screening', 'extraction', 'appraisal', 'synthesis', 'registration', 'years', 'dates'].forEach(k => { out[k] = Object.assign({}, b[k], (p || {})[k] || {}); });
    ['criteria', 'outcomes', 'sources', 'team', 'milestones', 'pubTypes'].forEach(k => { if (!Array.isArray(out[k])) out[k] = b[k]; });
    out.elements = Object.assign({}, (p || {}).elements || {});
    if (!FRAMEWORKS[out.framework]) out.framework = RECOMMENDED[out.type];
    return out;
  }

  Object.assign(Protocol, {
    FRAMEWORKS, FW_ORDER, RECOMMENDED, APPRAISAL, METRICS, ESTIMATORS, SYNTH, DEFAULT_SYNTH, ROLES, PRISMAP, PROSPERO, OSF, PHASES, MONTHS_DEFAULT,
    buildQuestion, questionOf, checkQuestion, seedCriteria, numberCriteria, blank, normalize, sections, score, prismaP,
    langGuess, contentLang, registryFit, registration, registrationText, schedule, orcidCheck, orcidValid,
  });
  window.Protocol = Protocol;
})();
