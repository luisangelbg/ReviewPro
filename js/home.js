/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 1: the home page.
   Builds the stepper, the four review types with the route each one takes
   through the blocks, the assistant that recommends a type, the block cards,
   the principles and the reference list. The content lives here as bilingual
   data, so the map of the app is one editable list. */

(function () {

  const two = p => L2(p[0], p[1]);

  /* ---------------- the four review types ----------------
     req: blocks the type needs; opt: blocks it may use. */
  const TYPES = {
    narrative: {
      art: 'typeNarrative', name: ['Revisión narrativa', 'Narrative review'],
      q: ['¿Qué se sabe de este tema y cómo se interpreta?', 'What is known about this topic and how is it interpreted?'],
      when: ['Estado del arte, marco conceptual de un proyecto, tema emergente o muy amplio, debate entre escuelas.', 'State of the art, conceptual framework of a project, an emerging or very broad topic, a debate between schools.'],
      search: ['Documentada, no necesariamente exhaustiva.', 'Documented, not necessarily exhaustive.'],
      appraisal: ['Opcional; se discute la solidez de las fuentes.', 'Optional; the soundness of the sources is discussed.'],
      synthesis: ['Temática e interpretativa.', 'Thematic and interpretive.'],
      guide: ['SANRA (Baethge et al. 2019)', 'SANRA (Baethge et al. 2019)'],
      time: ['1 a 3 meses', '1 to 3 months'],
      req: [2, 3, 6, 8, 9, 10], opt: [4, 5, 7],
    },
    scoping: {
      art: 'typeScoping', name: ['Revisión exploratoria (scoping)', 'Scoping review'],
      q: ['¿Cuánta evidencia hay, de qué tipo y dónde están los vacíos?', 'How much evidence is there, of what kind, and where are the gaps?'],
      when: ['Mapear un campo antes de una revisión sistemática, identificar conceptos y métodos, detectar vacíos de investigación.', 'Mapping a field before a systematic review, identifying concepts and methods, detecting research gaps.'],
      search: ['Amplia, sistemática y reproducible.', 'Broad, systematic and reproducible.'],
      appraisal: ['Normalmente no se evalúa el sesgo.', 'Risk of bias is usually not assessed.'],
      synthesis: ['Tablas de caracterización y mapa de evidencia.', 'Charting tables and an evidence map.'],
      guide: ['PRISMA-ScR (Tricco et al. 2018)', 'PRISMA-ScR (Tricco et al. 2018)'],
      time: ['3 a 9 meses', '3 to 9 months'],
      req: [2, 3, 4, 5, 6, 8, 9, 10], opt: [7],
    },
    systematic: {
      art: 'typeSystematic', name: ['Revisión sistemática', 'Systematic review'],
      q: ['¿Funciona, cuánto y con qué certeza, según toda la evidencia disponible?', 'Does it work, how much and how certainly, according to all the available evidence?'],
      when: ['Una pregunta focalizada (PICO o PECO) que pide una respuesta defendible y auditable.', 'A focused question (PICO or PECO) that asks for a defensible, auditable answer.'],
      search: ['Exhaustiva, en varias fuentes, con protocolo registrado.', 'Exhaustive, in several sources, with a registered protocol.'],
      appraisal: ['Obligatoria: riesgo de sesgo y certeza de la evidencia.', 'Required: risk of bias and certainty of the evidence.'],
      synthesis: ['Narrativa estructurada (SWiM) o meta-análisis.', 'Structured narrative (SWiM) or meta-analysis.'],
      guide: ['PRISMA 2020 (Page et al. 2021)', 'PRISMA 2020 (Page et al. 2021)'],
      time: ['6 a 18 meses', '6 to 18 months'],
      req: [2, 3, 4, 5, 6, 7, 8, 9, 10], opt: [],
    },
    meta: {
      art: 'typeMeta', name: ['Meta-análisis', 'Meta-analysis'],
      q: ['¿Cuál es el tamaño del efecto combinado y qué explica que varíe?', 'What is the size of the pooled effect and what explains its variation?'],
      when: ['Una revisión sistemática cuyos estudios reportan efectos comparables (medias, DE y n; conteos; correlaciones).', 'A systematic review whose studies report comparable effects (means, SDs and n; counts; correlations).'],
      search: ['Exhaustiva; además, búsqueda de literatura gris contra el sesgo de publicación.', 'Exhaustive; plus a search of grey literature against publication bias.'],
      appraisal: ['Obligatoria, con análisis de sensibilidad.', 'Required, with sensitivity analyses.'],
      synthesis: ['Modelo de efectos aleatorios, heterogeneidad, moderadores, sesgo de publicación.', 'Random-effects model, heterogeneity, moderators, publication bias.'],
      guide: ['PRISMA 2020 + certeza GRADE', 'PRISMA 2020 + GRADE certainty'],
      time: ['6 a 18 meses', '6 to 18 months'],
      req: [2, 3, 4, 5, 6, 7, 8, 9, 10], opt: [],
    },
  };
  const TYPE_ORDER = ['narrative', 'scoping', 'systematic', 'meta'];

  /* ---------------- the nine working blocks ---------------- */
  const BLOCKS = [
    { n: 2, art: 'bProtocol', tag: ['pregunta', 'question'],
      t: ['Protocolo', 'Protocol'],
      d: ['La pregunta armada con el marco que le corresponde (PICO, PECO, PCC, SPIDER), los criterios de inclusión y exclusión, el plan de síntesis y la plantilla de registro. Aquí se elige el tipo de revisión y la app ajusta la ruta.',
        'The question built with the framework that suits it (PICO, PECO, PCC, SPIDER), the inclusion and exclusion criteria, the synthesis plan and the registration template. Here the review type is chosen and the app adjusts the route.'] },
    { n: 3, art: 'bSearch', tag: ['búsqueda', 'search'],
      t: ['Búsqueda y registros', 'Search and records'],
      d: ['Un constructor de cadenas booleanas por bloques de conceptos que las escribe en la sintaxis de cada tipo de base de datos; importación de RIS, BibTeX, texto delimitado y exportaciones de bases de citas; detección de duplicados con revisión humana.',
        'A Boolean string builder by concept blocks that writes them in the syntax of each kind of database; import of RIS, BibTeX, delimited text and citation-database exports; duplicate detection with human review.'] },
    { n: 4, art: 'bScreening', tag: ['cribado', 'screening'],
      t: ['Cribado de título y resumen', 'Title and abstract screening'],
      d: ['Una pantalla rápida con atajos de teclado y palabras resaltadas, priorización por aprendizaje activo local, reglas de paro documentadas y doble revisión ciega con kappa de Cohen y resolución de desacuerdos.',
        'A fast screen with keyboard shortcuts and highlighted words, prioritization by local active learning, documented stopping rules and blind double screening with Cohen\'s kappa and disagreement resolution.'] },
    { n: 5, art: 'bFulltext', tag: ['elegibilidad', 'eligibility'],
      t: ['Texto completo y PRISMA', 'Full text and PRISMA'],
      d: ['La decisión sobre cada informe con su motivo de exclusión, el control de los que no se consiguieron, y el diagrama de flujo PRISMA 2020 (o PRISMA-ScR) que se arma solo con los conteos reales.',
        'The decision on each report with its reason for exclusion, tracking of those not retrieved, and the PRISMA 2020 (or PRISMA-ScR) flow diagram built by itself from the real counts.'] },
    { n: 6, art: 'bExtraction', tag: ['datos', 'data'],
      t: ['Extracción de datos', 'Data extraction'],
      d: ['Formularios que diseñas tú (texto, número, lista, efecto con su varianza), extracción doble con comparación, calculadora de tamaños de efecto desde medias, errores estándar, intervalos o valores p, y la tabla de características de los estudios.',
        'Forms you design (text, number, list, an effect with its variance), double extraction with comparison, an effect-size calculator from means, standard errors, intervals or p values, and the table of study characteristics.'] },
    { n: 7, art: 'bAppraisal', tag: ['calidad', 'quality'],
      t: ['Calidad, sesgo y certeza', 'Quality, bias and certainty'],
      d: ['Herramientas de riesgo de sesgo por dominios para ensayos aleatorizados y no aleatorizados, listas de calidad para estudios observacionales y cualitativos, gráficos de semáforo y la certeza de la evidencia por desenlace.',
        'Domain-based risk-of-bias tools for randomized and non-randomized trials, quality checklists for observational and qualitative studies, traffic-light plots and the certainty of the evidence per outcome.'] },
    { n: 8, art: 'bSynthesis', tag: ['síntesis', 'synthesis'],
      t: ['Síntesis y meta-análisis', 'Synthesis and meta-analysis'],
      d: ['Matriz de conceptos por tema y estudio, mapa de vacíos de evidencia, síntesis narrativa estructurada y meta-análisis completo: cinco estimadores de τ², Knapp–Hartung, subgrupos, meta-regresión, sensibilidad, embudo, Egger y recorte y relleno.',
        'Concept matrix by theme and study, evidence gap map, structured narrative synthesis and complete meta-analysis: five τ² estimators, Knapp–Hartung, subgroups, meta-regression, sensitivity, funnel, Egger and trim-and-fill.'] },
    { n: 9, art: 'bWriting', tag: ['escritura', 'writing'],
      t: ['Escritura orientada', 'Guided writing'],
      d: ['El esqueleto del artículo según el tipo de revisión, cada sección ligada a la evidencia que la respalda, las afirmaciones sin cita señaladas, y la lista de verificación de la guía de reporte que marca dónde se cumple cada punto. La app orienta; no redacta por ti.',
        'The article\'s skeleton for the review type, every section tied to the evidence behind it, uncited claims flagged, and the reporting-guideline checklist that marks where each item is met. The app guides; it does not write for you.'] },
    { n: 10, art: 'bReport', tag: ['informe', 'report'],
      t: ['Figuras, informe y paquete', 'Figures, report and package'],
      d: ['Todas las figuras en PNG, JPG o SVG hasta 900 ppp con el estilo que elijas, las tablas listas para el manuscrito, las referencias en BibTeX y RIS, y un .zip con el proyecto que reproduce la revisión entera.',
        'Every figure as PNG, JPG or SVG up to 900 dpi in the style you choose, tables ready for the manuscript, references as BibTeX and RIS, and a .zip with the project that reproduces the whole review.'] },
  ];

  /* ---------------- principles ---------------- */
  const BRING = [
    { ic: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', t: ['Todo en tu computadora', 'Everything on your computer'], s: ['Ni los registros ni tus decisiones salen del navegador; se trabaja sin conexión.', 'Neither the records nor your decisions leave the browser; it works offline.'] },
    { ic: '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13 7l4 4"/>', t: ['Orienta, no redacta', 'It guides, it does not write'], s: ['La autoría y el juicio son tuyos; la app ordena la evidencia y señala lo que falta.', 'Authorship and judgement are yours; the app orders the evidence and flags what is missing.'] },
    { ic: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>', t: ['Cada decisión queda registrada', 'Every decision is recorded'], s: ['Quién incluyó o excluyó qué, cuándo y por qué: una revisión auditable.', 'Who included or excluded what, when and why: an auditable review.'] },
    { ic: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>', t: ['Reproducible', 'Reproducible'], s: ['El proyecto guardado rehace cada conteo, cada cifra y cada figura.', 'The saved project redoes every count, every number and every figure.'] },
    { ic: '<path d="M3 5h18M3 12h18M3 19h12"/>', t: ['Cuatro tipos, una ruta', 'Four types, one route'], s: ['Narrativa, exploratoria, sistemática y meta-análisis: la app activa lo que cada una exige.', 'Narrative, scoping, systematic and meta-analysis: the app turns on what each one requires.'] },
    { ic: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>', t: ['Motores verificados', 'Verified engines'], s: ['Cada cálculo se contrasta con ejemplos publicados y con una implementación independiente.', 'Every computation is checked against published examples and an independent implementation.'] },
  ];

  /* ---------------- references ---------------- */
  const RFAM = { all: ['Todas', 'All'], rev: ['Tipos y guías de reporte', 'Types and reporting guidelines'], scr: ['Cribado priorizado', 'Prioritized screening'], ma: ['Meta-análisis', 'Meta-analysis'], num: ['Cálculo numérico', 'Numerical computation'] };
  const REFS = [
    ['rev', 'Arksey, H. & O\'Malley, L. (2005).', 'Scoping studies: towards a methodological framework. International Journal of Social Research Methodology 8: 19–32.'],
    ['rev', 'Baethge, C., Goldbeck-Wood, S. & Mertens, S. (2019).', 'SANRA — a scale for the quality assessment of narrative review articles. Research Integrity and Peer Review 4: 5.'],
    ['rev', 'Campbell, M., McKenzie, J.E., Sowden, A. et al. (2020).', 'Synthesis without meta-analysis (SWiM) in systematic reviews: reporting guideline. BMJ 368: l6890.'],
    ['rev', 'Grant, M.J. & Booth, A. (2009).', 'A typology of reviews: an analysis of 14 review types and associated methodologies. Health Information and Libraries Journal 26: 91–108.'],
    ['rev', 'Guyatt, G.H., Oxman, A.D., Vist, G.E. et al. (2008).', 'GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ 336: 924–926.'],
    ['rev', 'Page, M.J., McKenzie, J.E., Bossuyt, P.M. et al. (2021).', 'The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ 372: n71.'],
    ['rev', 'Peters, M.D.J., Marnie, C., Tricco, A.C. et al. (2020).', 'Updated methodological guidance for the conduct of scoping reviews. JBI Evidence Synthesis 18: 2119–2126.'],
    ['rev', 'Tricco, A.C., Lillie, E., Zarin, W. et al. (2018).', 'PRISMA extension for scoping reviews (PRISMA-ScR): checklist and explanation. Annals of Internal Medicine 169: 467–473.'],
    ['scr', 'Cohen, A.M., Hersh, W.R., Peterson, K. & Yen, P.-Y. (2006).', 'Reducing workload in systematic review preparation using automated citation classification. Journal of the American Medical Informatics Association 13: 206–219.'],
    ['scr', 'Cormack, G.V. & Grossman, M.R. (2016).', 'Engineering quality and reliability in technology-assisted review. Proceedings of the 39th International ACM SIGIR Conference: 75–84.'],
    ['scr', 'Rennie, J.D.M., Shih, L., Teevan, J. & Karger, D.R. (2003).', 'Tackling the poor assumptions of naive Bayes text classifiers. Proceedings of the 20th International Conference on Machine Learning: 616–623.'],
    ['scr', 'Salton, G. & Buckley, C. (1988).', 'Term-weighting approaches in automatic text retrieval. Information Processing & Management 24: 513–523.'],
    ['scr', 'van de Schoot, R., de Bruin, J., Schram, R. et al. (2021).', 'An open source machine learning framework for efficient and transparent systematic reviews. Nature Machine Intelligence 3: 125–133.'],
    ['scr', 'Yu, Z., Kraft, N.A. & Menzies, T. (2018).', 'Finding better active learners for faster literature reviews. Empirical Software Engineering 23: 3161–3186.'],
    ['ma', 'Begg, C.B. & Mazumdar, M. (1994).', 'Operating characteristics of a rank correlation test for publication bias. Biometrics 50: 1088–1101.'],
    ['ma', 'Colditz, G.A., Brewer, T.F., Berkey, C.S. et al. (1994).', 'Efficacy of BCG vaccine in the prevention of tuberculosis: meta-analysis of the published literature. JAMA 271: 698–702.'],
    ['ma', 'DerSimonian, R. & Laird, N. (1986).', 'Meta-analysis in clinical trials. Controlled Clinical Trials 7: 177–188.'],
    ['ma', 'Egger, M., Davey Smith, G., Schneider, M. & Minder, C. (1997).', 'Bias in meta-analysis detected by a simple, graphical test. BMJ 315: 629–634.'],
    ['ma', 'Hedges, L.V. (1981).', 'Distribution theory for Glass\'s estimator of effect size and related estimators. Journal of Educational Statistics 6: 107–128.'],
    ['ma', 'Hedges, L.V. & Olkin, I. (1985).', 'Statistical methods for meta-analysis. Academic Press, Orlando.'],
    ['ma', 'Hedges, L.V., Gurevitch, J. & Curtis, P.S. (1999).', 'The meta-analysis of response ratios in experimental ecology. Ecology 80: 1150–1156.'],
    ['ma', 'Higgins, J.P.T. & Thompson, S.G. (2002).', 'Quantifying heterogeneity in a meta-analysis. Statistics in Medicine 21: 1539–1558.'],
    ['ma', 'Higgins, J.P.T., Thompson, S.G. & Spiegelhalter, D.J. (2009).', 'A re-evaluation of random-effects meta-analysis. Journal of the Royal Statistical Society A 172: 137–159.'],
    ['ma', 'Knapp, G. & Hartung, J. (2003).', 'Improved tests for a random effects meta-regression with a single covariate. Statistics in Medicine 22: 2693–2710.'],
    ['ma', 'Koricheva, J., Gurevitch, J. & Mengersen, K. (eds.) (2013).', 'Handbook of meta-analysis in ecology and evolution. Princeton University Press, Princeton.'],
    ['ma', 'Paule, R.C. & Mandel, J. (1982).', 'Consensus values and weighting factors. Journal of Research of the National Bureau of Standards 87: 377–385.'],
    ['ma', 'Viechtbauer, W. (2005).', 'Bias and efficiency of meta-analytic variance estimators in the random-effects model. Journal of Educational and Behavioral Statistics 30: 261–293.'],
    ['rev', 'Moher, D., Shamseer, L., Clarke, M. et al. (2015).', 'Preferred reporting items for systematic review and meta-analysis protocols (PRISMA-P) 2015 statement. Systematic Reviews 4: 1.'],
    ['rev', 'Shamseer, L., Moher, D., Clarke, M. et al. (2015).', 'Preferred reporting items for systematic review and meta-analysis protocols (PRISMA-P) 2015: elaboration and explanation. BMJ 349: g7647.'],
    ['rev', 'Sterne, J.A.C., Hernán, M.A., Reeves, B.C. et al. (2016).', 'ROBINS-I: a tool for assessing risk of bias in non-randomised studies of interventions. BMJ 355: i4919.'],
    ['rev', 'Sterne, J.A.C., Savović, J., Page, M.J. et al. (2019).', 'RoB 2: a revised tool for assessing risk of bias in randomised trials. BMJ 366: l4898.'],
    ['scr', 'Clopper, C.J. & Pearson, E.S. (1934).', 'The use of confidence or fiducial limits illustrated in the case of the binomial. Biometrika 26: 404–413.'],
    ['scr', 'Cohen, J. (1960).', 'A coefficient of agreement for nominal scales. Educational and Psychological Measurement 20: 37–46.'],
    ['scr', 'Fleiss, J.L. (1971).', 'Measuring nominal scale agreement among many raters. Psychological Bulletin 76: 378–382.'],
    ['scr', 'Fleiss, J.L., Cohen, J. & Everitt, B.S. (1969).', 'Large sample standard errors of kappa and weighted kappa. Psychological Bulletin 72: 323–327.'],
    ['scr', 'Landis, J.R. & Koch, G.G. (1977).', 'The measurement of observer agreement for categorical data. Biometrics 33: 159–174.'],
    ['ma', 'Borenstein, M., Hedges, L.V., Higgins, J.P.T. & Rothstein, H.R. (2009).', 'Introduction to meta-analysis. Wiley, Chichester.'],
    ['ma', 'Cheung, M.W.-L. (2014).', 'Modeling dependent effect sizes with three-level meta-analyses: a structural equation modeling approach. Psychological Methods 19: 211–229.'],
    ['ma', 'Duval, S. & Tweedie, R. (2000).', 'Trim and fill: a simple funnel-plot-based method of testing and adjusting for publication bias in meta-analysis. Biometrics 56: 455–463.'],
    ['ma', 'Konstantopoulos, S. (2011).', 'Fixed effects and variance components estimation in three-level meta-analysis. Research Synthesis Methods 2: 61–76.'],
    ['ma', 'Lajeunesse, M.J. (2013).', 'Recovering missing or partial data from studies: a survey of conversions and imputations for meta-analysis. In: Koricheva, J., Gurevitch, J. & Mengersen, K. (eds.), Handbook of meta-analysis in ecology and evolution: 195–206. Princeton University Press, Princeton.'],
    ['ma', 'Nakagawa, S., Lagisz, M., Jennions, M.D. et al. (2022).', 'Methods for testing publication bias in ecological and evolutionary meta-analyses. Methods in Ecology and Evolution 13: 4–21.'],
    ['ma', 'Wan, X., Wang, W., Liu, J. & Tong, T. (2014).', 'Estimating the sample mean and standard deviation from the sample size, median, range and/or interquartile range. BMC Medical Research Methodology 14: 135.'],
    ['num', 'Lanczos, C. (1964).', 'A precision approximation of the gamma function. SIAM Journal on Numerical Analysis B 1: 86–96.'],
    ['num', 'Press, W.H., Teukolsky, S.A., Vetterling, W.T. & Flannery, B.P. (2007).', 'Numerical recipes: the art of scientific computing, 3rd ed. Cambridge University Press, Cambridge.'],
    ['num', 'Wichura, M.J. (1988).', 'Algorithm AS 241: the percentage points of the normal distribution. Applied Statistics 37: 477–484.'],
  ];

  /* ---------------- the type assistant ----------------
     Five questions; each answer moves the recommendation with a reason that
     is shown, so the user sees why and can disagree. */
  const QUESTIONS = [
    { id: 'goal', q: ['¿Qué quieres lograr con la revisión?', 'What do you want the review to achieve?'],
      a: [['answer', ['Responder si algo funciona o cuánto', 'Answer whether something works, or how much']],
        ['map', ['Mapear qué evidencia existe y dónde faltan estudios', 'Map what evidence exists and where studies are missing']],
        ['discuss', ['Discutir e interpretar un tema, construir un marco', 'Discuss and interpret a topic, build a framework']]] },
    { id: 'focus', q: ['¿Qué tan acotada es tu pregunta?', 'How narrow is your question?'],
      a: [['focused', ['Acotada: población, intervención o exposición y desenlace definidos', 'Narrow: defined population, intervention or exposure, and outcome']],
        ['broad', ['Amplia: «¿qué se sabe sobre…?»', 'Broad: "what is known about…?"']]] },
    { id: 'quant', q: ['¿Los estudios reportan resultados numéricos comparables?', 'Do the studies report comparable numerical results?'],
      a: [['yes', ['Sí: medias con DE y n, conteos o correlaciones', 'Yes: means with SD and n, counts or correlations']],
        ['mixed', ['Algunos sí, otros no, o no lo sé aún', 'Some do, some do not, or I do not know yet']],
        ['no', ['No: son cualitativos, descriptivos o muy heterogéneos', 'No: they are qualitative, descriptive or very heterogeneous']]] },
    { id: 'rigor', q: ['¿La revista o el comité exigen una búsqueda exhaustiva y reproducible?', 'Does the journal or committee require an exhaustive, reproducible search?'],
      a: [['yes', ['Sí', 'Yes']], ['no', ['No, o no estoy seguro', 'No, or I am not sure']]] },
    { id: 'time', q: ['¿Cuánto tiempo tienes?', 'How much time do you have?'],
      a: [['short', ['Menos de 3 meses', 'Less than 3 months']], ['mid', ['De 3 a 9 meses', '3 to 9 months']], ['long', ['Más de 9 meses', 'More than 9 months']]] },
  ];
  function recommend(ans) {
    const why = [];
    let type;
    if (ans.goal === 'map') {
      type = 'scoping';
      why.push(['Quieres saber qué hay y dónde faltan estudios: eso es mapear, no estimar un efecto.', 'You want to know what there is and where studies are missing: that is mapping, not estimating an effect.']);
    } else if (ans.goal === 'discuss') {
      type = ans.rigor === 'yes' ? 'scoping' : 'narrative';
      why.push(ans.rigor === 'yes'
        ? ['Quieres interpretar un tema, pero con búsqueda reproducible: una exploratoria da el mapa y deja espacio a la discusión.', 'You want to interpret a topic but with a reproducible search: a scoping review gives the map and leaves room for discussion.']
        : ['Tu objetivo es interpretar y construir un marco, no contar estudios: la narrativa es el formato honesto para eso.', 'Your aim is to interpret and build a framework, not to count studies: the narrative review is the honest format for that.']);
    } else {
      if (ans.focus === 'broad') {
        type = 'scoping';
        why.push(['Una pregunta amplia no se responde con un número: primero conviene acotarla con una exploratoria.', 'A broad question is not answered with a number: it pays to narrow it first with a scoping review.']);
      } else if (ans.quant === 'yes') {
        type = 'meta';
        why.push(['Pregunta acotada y efectos comparables: puedes combinarlos en un meta-análisis.', 'A narrow question and comparable effects: you can pool them in a meta-analysis.']);
      } else {
        type = 'systematic';
        why.push([ans.quant === 'no' ? 'Pregunta acotada, pero sin números comparables: sistemática con síntesis narrativa estructurada.' : 'Pregunta acotada; si al extraer los datos resultan comparables, la sistemática puede crecer a meta-análisis.',
          ans.quant === 'no' ? 'A narrow question, but without comparable numbers: systematic review with structured narrative synthesis.' : 'A narrow question; if the extracted data turn out comparable, the systematic review can grow into a meta-analysis.']);
      }
    }
    if (ans.time === 'short' && (type === 'systematic' || type === 'meta')) why.push(['Aviso: con menos de 3 meses una sistemática completa es muy apretada; considera acotar más la pregunta o las fuentes y declararlo como revisión rápida.', 'Warning: with less than 3 months a full systematic review is very tight; consider narrowing the question or the sources and reporting it as a rapid review.']);
    if (ans.rigor === 'yes' && type === 'narrative') why.push(['La revista pide reproducibilidad: documenta la búsqueda aunque sea narrativa.', 'The journal asks for reproducibility: document the search even in a narrative review.']);
    return { type, why };
  }

  /* ---------------- rendering ---------------- */
  function renderStepper() {
    const nav = el('stepper'); if (!nav) return;
    nav.innerHTML = STEPS.map(s => `<button class="step-btn${s.n === 1 ? ' active' : ''}" data-step="${s.n}"${s.ready ? '' : ' disabled'}><span class="step-num">${s.n}</span>${two([s.es, s.en])}</button>`).join('');
  }
  let chosenType = Prefs.get('type', 'systematic');
  function renderTypes() {
    const g = el('typeGrid'); if (!g) return;
    g.innerHTML = TYPE_ORDER.map(k => {
      const t = TYPES[k];
      return `<button class="type-card${k === chosenType ? ' on' : ''}" data-type="${k}">
        <div class="tc-art">${Art[t.art]()}</div>
        <div class="tc-name">${two(t.name)}</div>
        <div class="tc-q">${two(t.q)}</div>
        <dl class="tc-dl">
          <dt>${L2('Cuándo', 'When')}</dt><dd>${two(t.when)}</dd>
          <dt>${L2('Búsqueda', 'Search')}</dt><dd>${two(t.search)}</dd>
          <dt>${L2('Calidad', 'Quality')}</dt><dd>${two(t.appraisal)}</dd>
          <dt>${L2('Síntesis', 'Synthesis')}</dt><dd>${two(t.synthesis)}</dd>
          <dt>${L2('Guía', 'Guideline')}</dt><dd>${two(t.guide)}</dd>
          <dt>${L2('Tiempo típico', 'Typical time')}</dt><dd>${two(t.time)}</dd>
        </dl></button>`;
    }).join('');
    renderRoute();
  }
  function renderRoute() {
    const r = el('routeStrip'); if (!r) return;
    const t = TYPES[chosenType];
    r.innerHTML = `<div class="route-head">${L2(chosenType === "meta" ? "Ruta de un" : "Ruta de una", "Route of a")} <b>${two(t.name)}</b></div><div class="route">` +
      STEPS.map(s => {
        const cls = s.n === 1 ? 'home' : t.req.includes(s.n) ? 'req' : t.opt.includes(s.n) ? 'opt' : 'skip';
        return `<div class="route-step ${cls}" title=""><span class="rs-n">${s.n}</span><span class="rs-t">${two([s.es, s.en])}</span><span class="rs-k">${cls === 'req' ? L2('necesario', 'required') : cls === 'opt' ? L2('opcional', 'optional') : cls === 'skip' ? L2('no aplica', 'not used') : L2('aquí estás', 'you are here')}</span></div>`;
      }).join('') + '</div>';
  }
  const answers = {};
  function renderWizard() {
    const w = el('wizard'); if (!w) return;
    w.innerHTML = QUESTIONS.map((q, i) => `<div class="wz-q"><div class="wz-t"><span class="wz-n">${i + 1}</span>${two(q.q)}</div><div class="wz-a">` +
      q.a.map(([v, lab]) => `<button class="chip${answers[q.id] === v ? ' on' : ''}" data-q="${q.id}" data-v="${v}">${two(lab)}</button>`).join('') + '</div></div>').join('') +
      '<div class="wz-out" id="wizardOut"></div>';
    renderWizardOut();
  }
  function renderWizardOut() {
    const o = el('wizardOut'); if (!o) return;
    const missing = QUESTIONS.filter(q => !answers[q.id]).length;
    if (missing) { o.innerHTML = `<p class="hint">${L2(`Faltan ${missing} respuesta(s) para recomendar un tipo.`, `${missing} answer(s) missing to recommend a type.`)}</p>`; return; }
    const r = recommend(answers);
    const t = TYPES[r.type];
    o.innerHTML = `<div class="wz-rec"><div class="wz-art">${Art[t.art]()}</div><div><div class="wz-k">${L2('Te conviene una', 'You should do a')}</div><div class="wz-name">${two(t.name)}</div>
      <ul>${r.why.map(p => `<li>${two(p)}</li>`).join('')}</ul>
      <button class="btn btn-secondary btn-sm" id="wzUse">${L2('Ver su ruta de bloques', 'See its route through the blocks')}</button></div></div>`;
    el('wzUse').addEventListener('click', () => { chosenType = r.type; Prefs.set('type', chosenType); renderTypes(); el('routeStrip').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  }
  function renderFeatures() {
    const g = el('featureGrid'); if (!g) return;
    g.innerHTML = BLOCKS.map(b => {
      const ready = STEPS.find(s => s.n === b.n).ready;
      return `<div class="feature" data-step="${b.n}"><div class="f-num">${b.n}</div><div class="f-art">${Art[b.art]()}</div>
        <span class="f-tag">${two(b.tag)}${ready ? '' : `<span class="f-soon">${L2('próximamente', 'coming soon')}</span>`}</span><h3>${two(b.t)}</h3><p>${two(b.d)}</p></div>`;
    }).join('');
  }
  function renderBring() {
    const g = el('bringGrid'); if (!g) return;
    g.innerHTML = BRING.map(b => `<div class="bring"><div class="b-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.ic}</svg></div><div><b>${two(b.t)}</b><span>${two(b.s)}</span></div></div>`).join('');
  }
  let refFilter = 'all';
  function renderRefs() {
    const f = el('refFilter'), g = el('refList'); if (!g) return;
    if (f && !f.dataset.ready) {
      f.dataset.ready = '1';
      f.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; refFilter = b.dataset.fam; renderRefs(); });
    }
    if (f) f.innerHTML = Object.keys(RFAM).map(k => `<button class="chip${k === refFilter ? ' on' : ''}" data-fam="${k}">${two(RFAM[k])}</button>`).join('');
    const ord = ['rev', 'scr', 'ma', 'num'];
    g.innerHTML = REFS.slice().sort((a, b) => ord.indexOf(a[0]) - ord.indexOf(b[0]) || a[1].localeCompare(b[1])).filter(r => refFilter === 'all' || r[0] === refFilter).map(r => `<li><b>${r[1]}</b> ${r[2]}</li>`).join('');
  }
  /* illustrations that contain translated labels are redrawn when the language changes */
  function renderArt() {
    const h = el('heroArt'); if (h) h.innerHTML = Art.hero();
    const figs = { theoryRecallFig: 'figRecall', theoryFeReFig: 'figFeRe' };
    for (const id in figs) {
      const n = el(id);
      if (n) { const cap = n.querySelector('.cap'); n.innerHTML = Art[figs[id]](); if (cap) n.appendChild(cap); }
    }
    const b = el('brandLogo'); if (b) b.innerHTML = Art.logo();
    els('.soon-art').forEach(n => { n.innerHTML = Art.soon(); });
  }

  function comingSoon(n) {
    const m = el('homeMessages'); if (!m) return;
    clearMessages(m);
    showMessage(m, 'info', L2(`El Bloque ${n} llega en la siguiente etapa de construcción. Mientras tanto, los dos laboratorios de esta página ya calculan con los motores completos de cribado y de meta-análisis.`,
      `Block ${n} arrives in the next stage of construction. Meanwhile, the two laboratories on this page already compute with the complete screening and meta-analysis engines.`));
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function wire() {
    const nav = el('stepper');
    if (nav) nav.addEventListener('click', e => { const b = e.target.closest('.step-btn'); if (b && !b.disabled) goStep(b.dataset.step); });
    const brand = el('brand'); if (brand) brand.addEventListener('click', () => goStep(1));
    const scrollTo = id => { const n = el(id); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const on = (id, fn) => { const n = el(id); if (n) n.addEventListener('click', fn); };
    on('startBtn', () => { const b = document.querySelector('.step-btn[data-step="2"]'); if (b && !b.disabled) goStep(2); else comingSoon(2); });
    on('typeBtn', () => scrollTo('types'));
    on('simBtn', () => scrollTo('labs'));
    /* the complete example of the manual: a meta-analysis carried through the ten blocks */
    on('demoBtn', () => {
      if (!window.DEMO_PROJECT) return;
      const busy = state.protocol && (state.protocol.title || (state.search && state.search.files && state.search.files.length));
      if (busy && !window.confirm(T('El ejemplo reemplaza el proyecto abierto. Si quieres conservarlo, guárdalo antes (Bloque 2 · Guardar proyecto). ¿Abrir el ejemplo?', 'The example replaces the open project. If you want to keep it, save it first (Block 2 · Save project). Open the example?'))) return;
      Project.apply(JSON.parse(JSON.stringify(window.DEMO_PROJECT))); Project.saveLocal(); goStep(2);
    });
    on('citeBtn', () => scrollTo('cite'));
    on('copyCite', () => {
      const t = el('citeText'); if (!t || !navigator.clipboard) return;
      const txt = [...t.querySelectorAll('[data-l="' + I18N.lang + '"]')].map(n => n.textContent).join('') || t.textContent;
      navigator.clipboard.writeText(txt.trim()).then(() => { const b = el('copyCite'); if (b) { b.textContent = T('✓ Copiada', '✓ Copied'); setTimeout(() => I18N.apply(b.parentNode), 1800); } });
    });
    const tg = el('typeGrid');
    if (tg) tg.addEventListener('click', e => { const c = e.target.closest('.type-card'); if (!c) return; chosenType = c.dataset.type; Prefs.set('type', chosenType); els('.type-card', tg).forEach(x => x.classList.toggle('on', x === c)); renderRoute(); });
    const wz = el('wizard');
    if (wz) wz.addEventListener('click', e => { const b = e.target.closest('.chip[data-q]'); if (!b) return; answers[b.dataset.q] = b.dataset.v; els(`.chip[data-q="${b.dataset.q}"]`, wz).forEach(x => x.classList.toggle('on', x === b)); renderWizardOut(); });
    const fg = el('featureGrid');
    if (fg) fg.addEventListener('click', e => {
      const f = e.target.closest('.feature'); if (!f) return;
      const btn = document.querySelector(`.step-btn[data-step="${f.dataset.step}"]`);
      if (btn && !btn.disabled) goStep(f.dataset.step); else comingSoon(f.dataset.step);
    });
    const redraw = () => { renderArt(); renderTypes(); renderWizard(); renderFeatures(); renderBring(); renderRefs(); Fig.decorate(); };
    document.addEventListener('langchange', redraw);
    document.addEventListener('themechange', renderArt);
  }

  function init() {
    renderStepper(); renderArt(); renderTypes(); renderWizard(); renderFeatures(); renderBring(); renderRefs(); wire();
    I18N.apply();
    Fig.decorate();
  }
  document.addEventListener('DOMContentLoaded', init);
  window.Home = { TYPES, BLOCKS, REFS, QUESTIONS, recommend };
})();
