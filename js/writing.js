/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 9 engine: guided writing.

   The app guides and does not write: it gives the skeleton of the article
   for the review type, keeps each section tied to the evidence behind it and
   points at what is missing. The text is the author's.

   1. Outlines per review type, with what each section must contain and an
      orientative length.
   2. Two kinds of live references inside the text:
        [@key] or [@key1; @key2]   a citation of an included study, rendered
                                   author–year and listed in the references;
        {{name}} or {{name:arg}}   a number or a table taken from the blocks
                                   (PRISMA counts, the pooled effect of an
                                   outcome, its certainty…), so the text never
                                   drifts from the analysis.
   3. A claim checker: sentences that carry numbers or conclusions without a
      citation or a live datum are flagged, and so are p values reported
      without an effect size.
   4. The reporting checklists: PRISMA 2020 (Page et al. 2021; 27 items, 42
      with sub-items), PRISMA-ScR (Tricco et al. 2018; 22 items) and SANRA
      (Baethge et al. 2019; 6 items). Each item says where it is expected and
      whether the project's data and the text meet it.
   5. A Word document (.docx: Office Open XML, ECMA-376) written by hand and
      zipped by Zip, with headings, paragraphs, tables and references. */

const Writing = {};

(function () {
  const S = (id, t, g, w, o) => Object.assign({ id, t, g, w }, o || {});
  const IMRAD = (type) => {
    const sys = type === 'systematic' || type === 'meta', scr = type === 'scoping';
    const secs = [
      S('title', ['Título', 'Title'], ['Identifica el tipo de revisión («revisión sistemática y meta-análisis», «revisión exploratoria»).', 'Identify the type of review ("systematic review and meta-analysis", "scoping review").'], [8, 25]),
      S('abstract', ['Resumen', 'Abstract'], ['Antecedentes, objetivo, métodos (fuentes y fechas, criterios, riesgo de sesgo, síntesis), resultados (número de estudios, efecto con IC, certeza) y conclusión; registro.', 'Background, objective, methods (sources and dates, criteria, risk of bias, synthesis), results (number of studies, effect with CI, certainty) and conclusion; registration.'], [200, 300]),
      S('intro', ['Introducción', 'Introduction'], ['Por qué importa la pregunta, qué dicen las revisiones previas y qué dejan sin resolver; termina con el objetivo.', 'Why the question matters, what previous reviews say and what they leave unresolved; end with the objective.'], [400, 800]),
      S('methods', ['Métodos', 'Methods'], ['', ''], [0, 0], { heading: true }),
      S('m_protocol', ['Protocolo y registro', 'Protocol and registration'], ['Dónde se registró y con qué número; enmiendas.', 'Where it was registered and with which number; amendments.'], [30, 120], { parent: 'methods' }),
      S('m_elig', ['Criterios de elegibilidad', 'Eligibility criteria'], ['Los criterios del protocolo, con años, idiomas y tipos de publicación.', 'The protocol criteria, with years, languages and publication types.'], [80, 250], { parent: 'methods' }),
      S('m_search', ['Fuentes y búsqueda', 'Information sources and search'], ['Bases, fechas de búsqueda, literatura gris y otras vías; la cadena completa va en un material suplementario.', 'Databases, search dates, grey literature and other routes; the full string goes in a supplement.'], [80, 250], { parent: 'methods' }),
      S('m_select', [scr ? 'Selección de las fuentes de evidencia' : 'Selección de estudios', scr ? 'Selection of sources of evidence' : 'Study selection'], ['Revisores, piloto, acuerdo, priorización y regla de paro, desacuerdos.', 'Reviewers, pilot, agreement, prioritization and stopping rule, disagreements.'], [60, 200], { parent: 'methods' }),
      S('m_extract', [scr ? 'Caracterización de los datos' : 'Extracción de datos', scr ? 'Data charting' : 'Data extraction'], ['Formulario, extracción doble, variables, conversiones y datos imputados.', 'Form, double extraction, items, conversions and imputed data.'], [60, 250], { parent: 'methods' }),
    ];
    if (sys) secs.push(S('m_rob', ['Riesgo de sesgo', 'Risk of bias'], ['Herramienta, dominios, quién evaluó y cómo se usaron los juicios.', 'Tool, domains, who assessed and how the judgements were used.'], [50, 200], { parent: 'methods' }));
    secs.push(S('m_synth', ['Síntesis', 'Synthesis'], [type === 'meta' ? 'Medida del efecto, modelo, efectos múltiples, heterogeneidad, moderadores, sensibilidad y sesgo de publicación.' : 'Cómo se agruparon y resumieron los estudios.', type === 'meta' ? 'Effect measure, model, multiple effects, heterogeneity, moderators, sensitivity and publication bias.' : 'How studies were grouped and summarized.'], [80, 350], { parent: 'methods' }));
    if (sys) secs.push(S('m_cert', ['Certeza de la evidencia', 'Certainty of the evidence'], ['GRADE: punto de partida y razones para bajar o subir.', 'GRADE: starting point and reasons to rate down or up.'], [30, 120], { parent: 'methods' }));
    secs.push(
      S('results', ['Resultados', 'Results'], ['', ''], [0, 0], { heading: true }),
      S('r_select', [scr ? 'Selección de las fuentes' : 'Selección de estudios', scr ? 'Selection of sources' : 'Study selection'], ['Los números del diagrama de flujo, con referencia a la figura.', 'The numbers of the flow diagram, referring to the figure.'], [50, 200], { parent: 'results' }),
      S('r_chars', [scr ? 'Características de las fuentes' : 'Características de los estudios', scr ? 'Characteristics of sources' : 'Study characteristics'], ['Países, años, diseños, cultivos, tratamientos; remite a la tabla de características.', 'Countries, years, designs, crops, treatments; refer to the characteristics table.'], [100, 400], { parent: 'results' }),
    );
    if (sys) secs.push(S('r_rob', ['Riesgo de sesgo', 'Risk of bias'], ['Resumen por dominio y figura de semáforo.', 'Summary by domain and traffic-light figure.'], [50, 250], { parent: 'results' }));
    secs.push(S('r_synth', [type === 'meta' ? 'Resultados de las síntesis' : 'Síntesis de resultados', type === 'meta' ? 'Results of syntheses' : 'Synthesis of results'], [type === 'meta' ? 'Por desenlace: efecto con IC, intervalo de predicción, heterogeneidad, moderadores y sensibilidad.' : 'Lo que muestran los estudios agrupados; cita cada afirmación.', type === 'meta' ? 'Per outcome: effect with CI, prediction interval, heterogeneity, moderators and sensitivity.' : 'What the grouped studies show; cite every claim.'], [150, 800], { parent: 'results' }));
    if (type === 'meta') secs.push(S('r_bias', ['Sesgo de publicación', 'Reporting biases'], ['Embudo, pruebas y recorte y relleno, con sus límites.', 'Funnel, tests and trim-and-fill, with their limits.'], [40, 200], { parent: 'results' }));
    if (sys) secs.push(S('r_cert', ['Certeza de la evidencia', 'Certainty of the evidence'], ['La calificación por desenlace; remite a la tabla de resumen de hallazgos.', 'The rating per outcome; refer to the summary of findings table.'], [40, 200], { parent: 'results' }));
    secs.push(
      S('discussion', ['Discusión', 'Discussion'], ['Qué significa el resultado frente a la evidencia previa; límites de la evidencia y del proceso de revisión; implicaciones para la práctica y la investigación.', 'What the result means against previous evidence; limitations of the evidence and of the review process; implications for practice and research.'], [500, 1200]),
      S('conclusion', ['Conclusión', 'Conclusion'], ['Una respuesta a la pregunta, a la altura de la certeza de la evidencia.', 'One answer to the question, as strong as the certainty of the evidence allows.'], [50, 200]),
      S('other', ['Otra información', 'Other information'], ['Registro, financiamiento, conflictos de interés, disponibilidad de datos y del proyecto.', 'Registration, funding, conflicts of interest, availability of data and of the project.'], [40, 200]),
    );
    return secs;
  };
  const NARRATIVE = () => [
    S('title', ['Título', 'Title'], ['Claro sobre el tema y el alcance.', 'Clear about the topic and the scope.'], [8, 25]),
    S('abstract', ['Resumen', 'Abstract'], ['El problema, el argumento principal y la conclusión.', 'The problem, the main argument and the conclusion.'], [150, 250]),
    S('intro', ['Introducción', 'Introduction'], ['Por qué este tema importa ahora a los lectores (SANRA 1) y qué se propone el artículo (SANRA 2).', 'Why this topic matters to the readers now (SANRA 1) and what the article sets out to do (SANRA 2).'], [300, 700]),
    S('m_search', ['Cómo se buscó la literatura', 'How the literature was searched'], ['Fuentes, términos, periodo y criterios (SANRA 3).', 'Sources, terms, period and criteria (SANRA 3).'], [80, 250]),
    S('body1', ['Tema 1', 'Theme 1'], ['Desarrolla un tema con la evidencia que lo sostiene; cita cada afirmación (SANRA 4 y 5).', 'Develop one theme with the evidence supporting it; cite every claim (SANRA 4 and 5).'], [300, 1200], { custom: true }),
    S('body2', ['Tema 2', 'Theme 2'], ['', ''], [300, 1200], { custom: true }),
    S('body3', ['Tema 3', 'Theme 3'], ['', ''], [300, 1200], { custom: true }),
    S('discussion', ['Discusión y preguntas abiertas', 'Discussion and open questions'], ['Lo que la evidencia permite afirmar y lo que no; vacíos.', 'What the evidence allows one to state and what not; gaps.'], [300, 900]),
    S('conclusion', ['Conclusión', 'Conclusion'], ['', ''], [50, 200]),
    S('other', ['Otra información', 'Other information'], ['Financiamiento y conflictos de interés.', 'Funding and conflicts of interest.'], [20, 120]),
  ];
  function outline(type) { return type === 'narrative' ? NARRATIVE() : IMRAD(type || 'systematic'); }

  /* ---------- live references ---------- */
  const CITE = /\[@([^\]]+)\]/g, TOKEN = /\{\{\s*([a-z0-9_.]+)(?::([^}]*))?\s*\}\}/gi;
  function surname(a) { const s = String(a || '').trim(); return s.includes(',') ? s.split(',')[0].trim() : s.split(/\s+/).slice(-1)[0]; }
  function authorYear(r) {
    const as = (r.authors || []).map(surname).filter(Boolean), y = r.year || 's.f.';
    if (!as.length) return `Anónimo ${y}`;
    if (as.length === 1) return `${as[0]} ${y}`;
    if (as.length === 2) return `${as[0]} & ${as[1]} ${y}`;
    return `${as[0]} et al. ${y}`;
  }
  function refEntry(r) {
    const au = (r.authors || []).map(a => { const s = surname(a); const g = String(a).includes(',') ? String(a).split(',')[1].trim().split(/[\s.-]+/).filter(Boolean).map(x => x[0] + '.').join(' ') : ''; return g ? `${s}, ${g}` : s; });
    const auTxt = au.length > 1 ? au.slice(0, -1).join(', ') + ', & ' + au[au.length - 1] : au[0] || 'Anónimo';
    const src = [r.journal, r.volume ? r.volume + (r.issue ? `(${r.issue})` : '') : '', r.pages].filter(Boolean).join(', ');
    return `${auTxt} (${r.year || 's.f.'}). ${String(r.title || '').replace(/\.$/, '')}. ${src}${src ? '.' : ''}${r.doi ? ` https://doi.org/${r.doi}` : ''}`.replace(/\s+/g, ' ').trim();
  }
  /* ctx = {study(key) → record | null, datum(name, arg, L) → string | null, table(name, arg, L) → {head, rows} | null} */
  function render(text, ctx, L) {
    const cites = new Set(), unknown = [], badTok = [];
    let plain = String(text || '').replace(CITE, (m, inner) => {
      const ks = inner.split(/\s*;\s*/).map(k => k.replace(/^@/, '').trim()).filter(Boolean);
      const out = ks.map(k => { const r = ctx.study(k); if (!r) { unknown.push(k); return `?${k}`; } cites.add(k); return authorYear(r); });
      return `(${out.join('; ')})`;
    });
    const tables = [];
    plain = plain.replace(TOKEN, (m, name, arg) => {
      if (/^table\./i.test(name) || /^table$/i.test(name)) { const tb = ctx.table(arg || name.split('.')[1], L); if (!tb) { badTok.push(m); return m; } tables.push(tb); return `\u0000T${tables.length - 1}\u0000`; }
      const v = ctx.datum(name, (arg || '').trim(), L);
      if (v == null) { badTok.push(m); return m; }
      return v;
    });
    return { plain, cites, unknown, badTok, tables };
  }

  /* ---------- claim checker ---------- */
  const CLAIM = {
    es: /\b(aument|disminu|reduj|redujo|reduce|mejor|increment|mayor|menor|significativ|asoci|demostr|indican?|muestran?|sugier|consistente|superior|inferior|favorec|recomend|eficaz|efectiv|benefici|conviene|rentabl|debe[nr]? |siempre|nunca)/i,
    en: /\b(increas|decreas|reduc|improv|higher|lower|significant|associat|demonstrat|indicat|show|suggest|consistent|superior|inferior|favou?r|recommend|effective|benefi|profitab|should |always|never)/i,
  };
  function sentences(text) {
    return String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡(\[])/).map(s => s.trim()).filter(Boolean);
  }
  /* sections whose claims need support; methods cite methods, not studies */
  const NEEDS = /^(intro|r_|discussion|body|conclusion|abstract)/;
  function checkClaims(secId, text) {
    if (!NEEDS.test(secId)) return [];
    const out = [];
    sentences(text).forEach(s => {
      /* a citation, a live datum or a pointer to the review's own figures and tables */
      const hasSupport = CITE.test(s) || TOKEN.test(s) || /\((Fig(ura|ure)?s?|Tablas?|Tables?)\.?\s/i.test(s); CITE.lastIndex = 0; TOKEN.lastIndex = 0;
      /* years are not results */
      const bare = s.replace(TOKEN, '').replace(CITE, '').replace(/\b(1[89]|20)\d{2}\b/g, '');
      const hasNum = /\d+(?:[.,]\d+)?\s*(%|t\/ha|kg|veces|times)|\b\d{2,}\b/.test(bare);
      const claims = CLAIM.es.test(s) || CLAIM.en.test(s);
      if (!hasSupport && (hasNum || claims) && !/^(ver|see|figura|figure|tabla|table)\b/i.test(s) && secId !== 'abstract') out.push({ kind: 'unsupported', s });
      if (/\bp\s*[<=>≤]\s*0?[.,]\d+/i.test(s) && !/\b(IC|CI)\b|intervalo|interval|\{\{effect/i.test(s)) out.push({ kind: 'ponly', s });
    });
    return out;
  }

  /* ---------- reporting checklists ----------
     each item: id, t, sec (where), auto: key of a data check (optional) */
  const I = (id, t, sec, auto) => ({ id, t, sec, auto });
  const PRISMA2020 = [
    I('1', ['Título: se identifica como revisión sistemática', 'Title: identified as a systematic review'], 'title', 'titleType'),
    I('2', ['Resumen estructurado (lista PRISMA para resúmenes)', 'Structured abstract (PRISMA for Abstracts)'], 'abstract'),
    I('3', ['Justificación en el contexto de lo ya conocido', 'Rationale in the context of existing knowledge'], 'intro'),
    I('4', ['Objetivos o preguntas explícitos', 'Explicit objectives or questions'], 'intro', 'question'),
    I('5', ['Criterios de elegibilidad y agrupación para la síntesis', 'Eligibility criteria and grouping for the synthesis'], 'm_elig', 'criteria'),
    I('6', ['Fuentes de información con la fecha de la última búsqueda', 'Information sources with the date last searched'], 'm_search', 'searchDates'),
    I('7', ['Estrategia de búsqueda completa de todas las bases', 'Full search strategy for all databases'], 'm_search', 'strings'),
    I('8', ['Proceso de selección', 'Selection process'], 'm_select', 'screening'),
    I('9', ['Proceso de extracción', 'Data collection process'], 'm_extract', 'extraction'),
    I('10a', ['Desenlaces buscados', 'Outcomes sought'], 'm_extract', 'outcomes'),
    I('10b', ['Otras variables extraídas', 'Other variables extracted'], 'm_extract', 'fields'),
    I('11', ['Métodos de evaluación del riesgo de sesgo', 'Risk of bias assessment methods'], 'm_rob', 'robTool'),
    I('12', ['Medidas del efecto', 'Effect measures'], 'm_synth', 'metric'),
    I('13a', ['Qué estudios entraron en cada síntesis', 'Which studies were eligible for each synthesis'], 'm_synth'),
    I('13b', ['Preparación de los datos (conversiones, imputaciones)', 'Data preparation (conversions, imputations)'], 'm_extract'),
    I('13c', ['Presentación de resultados individuales', 'Tabulation or display of individual results'], 'm_synth'),
    I('13d', ['Métodos de síntesis y justificación del modelo', 'Synthesis methods and model rationale'], 'm_synth', 'synth'),
    I('13e', ['Exploración de la heterogeneidad', 'Exploring heterogeneity'], 'm_synth'),
    I('13f', ['Análisis de sensibilidad', 'Sensitivity analyses'], 'm_synth'),
    I('14', ['Evaluación del sesgo de reporte', 'Reporting bias assessment'], 'm_synth'),
    I('15', ['Evaluación de la certeza', 'Certainty assessment'], 'm_cert', 'grade'),
    I('16a', ['Resultados de la búsqueda y selección (diagrama de flujo)', 'Results of search and selection (flow diagram)'], 'r_select', 'flow'),
    I('16b', ['Estudios que parecían cumplir y se excluyeron, con motivo', 'Studies that seemed eligible but were excluded, with reasons'], 'r_select', 'ftReasons'),
    I('17', ['Características de cada estudio', 'Characteristics of each study'], 'r_chars', 'charsTable'),
    I('18', ['Riesgo de sesgo de cada estudio', 'Risk of bias in each study'], 'r_rob', 'robDone'),
    I('19', ['Resultados de cada estudio (con IC)', 'Results of individual studies (with CIs)'], 'r_synth', 'effects'),
    I('20a', ['Características y riesgo de sesgo de cada síntesis', 'Characteristics and risk of bias of each synthesis'], 'r_synth'),
    I('20b', ['Resultado de cada síntesis con IC y heterogeneidad', 'Result of each synthesis with CI and heterogeneity'], 'r_synth', 'synthRun'),
    I('20c', ['Resultados de la exploración de heterogeneidad', 'Results of heterogeneity investigations'], 'r_synth'),
    I('20d', ['Resultados de sensibilidad', 'Results of sensitivity analyses'], 'r_synth'),
    I('21', ['Evaluación del sesgo de reporte', 'Reporting biases'], 'r_bias'),
    I('22', ['Certeza de la evidencia por desenlace', 'Certainty of evidence per outcome'], 'r_cert', 'grade'),
    I('23a', ['Interpretación general en el contexto de otra evidencia', 'General interpretation in the context of other evidence'], 'discussion'),
    I('23b', ['Limitaciones de la evidencia incluida', 'Limitations of the evidence included'], 'discussion'),
    I('23c', ['Limitaciones del proceso de revisión', 'Limitations of the review process'], 'discussion'),
    I('23d', ['Implicaciones para la práctica, las políticas y la investigación', 'Implications for practice, policy and research'], 'discussion'),
    I('24a', ['Registro (nombre y número) o que no se registró', 'Registration (name and number) or that it was not registered'], 'other', 'registration'),
    I('24b', ['Dónde se accede al protocolo', 'Where the protocol can be accessed'], 'other'),
    I('24c', ['Enmiendas al protocolo', 'Amendments to the protocol'], 'other', 'amendments'),
    I('25', ['Financiamiento y papel del financiador', 'Funding and role of the funder'], 'other', 'funding'),
    I('26', ['Conflictos de interés', 'Competing interests'], 'other', 'coi'),
    I('27', ['Disponibilidad de datos, código y materiales', 'Availability of data, code and materials'], 'other', 'dataAvail'),
  ];
  const PRISMASCR = [
    I('1', ['Título: se identifica como revisión exploratoria', 'Title: identified as a scoping review'], 'title', 'titleType'),
    I('2', ['Resumen estructurado', 'Structured summary'], 'abstract'),
    I('3', ['Justificación', 'Rationale'], 'intro'),
    I('4', ['Objetivos (PCC)', 'Objectives (PCC)'], 'intro', 'question'),
    I('5', ['Protocolo y registro', 'Protocol and registration'], 'm_protocol', 'registration'),
    I('6', ['Criterios de elegibilidad', 'Eligibility criteria'], 'm_elig', 'criteria'),
    I('7', ['Fuentes de información', 'Information sources'], 'm_search', 'searchDates'),
    I('8', ['Búsqueda completa de al menos una base', 'Full search of at least one database'], 'm_search', 'strings'),
    I('9', ['Selección de las fuentes de evidencia', 'Selection of sources of evidence'], 'm_select', 'screening'),
    I('10', ['Proceso de caracterización de los datos', 'Data charting process'], 'm_extract', 'extraction'),
    I('11', ['Variables caracterizadas', 'Data items'], 'm_extract', 'fields'),
    I('12', ['Evaluación crítica (si se hizo)', 'Critical appraisal (if done)'], 'm_extract'),
    I('13', ['Síntesis de resultados', 'Synthesis of results'], 'm_synth'),
    I('14', ['Selección de las fuentes (diagrama de flujo)', 'Selection of sources (flow diagram)'], 'r_select', 'flow'),
    I('15', ['Características de las fuentes', 'Characteristics of sources'], 'r_chars', 'charsTable'),
    I('16', ['Evaluación crítica de las fuentes (si se hizo)', 'Critical appraisal within sources (if done)'], 'r_chars'),
    I('17', ['Resultados de cada fuente', 'Results of individual sources'], 'r_synth'),
    I('18', ['Síntesis de resultados', 'Synthesis of results'], 'r_synth'),
    I('19', ['Resumen de la evidencia', 'Summary of evidence'], 'discussion'),
    I('20', ['Limitaciones', 'Limitations'], 'discussion'),
    I('21', ['Conclusiones', 'Conclusions'], 'conclusion'),
    I('22', ['Financiamiento', 'Funding'], 'other', 'funding'),
  ];
  const SANRA = [
    I('1', ['Justificación de la importancia del artículo para sus lectores', 'Justification of the article\'s importance for the readership'], 'intro'),
    I('2', ['Objetivos concretos o preguntas formuladas', 'Statement of concrete aims or formulation of questions'], 'intro', 'question'),
    I('3', ['Descripción de la búsqueda de literatura', 'Description of the literature search'], 'm_search', 'strings'),
    I('4', ['Referencias: las afirmaciones clave se sostienen con citas', 'Referencing: key statements supported by references'], 'body1', 'citesAll'),
    I('5', ['Razonamiento científico con evidencia apropiada', 'Scientific reasoning with appropriate evidence'], 'discussion'),
    I('6', ['Presentación apropiada de los datos', 'Appropriate presentation of data'], 'body1'),
  ];
  function checklist(type) { return type === 'narrative' ? { id: 'sanra', name: 'SANRA', items: SANRA } : type === 'scoping' ? { id: 'prismascr', name: 'PRISMA-ScR', items: PRISMASCR } : { id: 'prisma2020', name: 'PRISMA 2020', items: PRISMA2020 }; }
  /* status: 'ok' (text + data), 'text' (text, no data check), 'data' (data but no text), 'missing'.
     words(sec) → words in that section; auto(key) → true | false | null (not applicable) */
  function evaluate(items, words, auto, manual) {
    return items.map(it => {
      if (manual && manual[it.id]) return { id: it.id, status: 'manual', where: it.sec };
      const hasText = words(it.sec) >= 15;
      const a = it.auto ? auto(it.auto) : null;
      const status = a === false ? (hasText ? 'text' : 'missing') : a === true ? (hasText ? 'ok' : 'data') : hasText ? 'text' : 'missing';
      return { id: it.id, status, where: it.sec, data: a };
    });
  }
  const wordCount = s => (String(s || '').replace(CITE, 'x').replace(TOKEN, 'x').match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || []).length;

  /* ---------- Word (.docx) ---------- */
  const xe = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function para(text, style) { return `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}<w:r><w:t xml:space="preserve">${xe(text)}</w:t></w:r></w:p>`; }
  function table(tb) {
    const cell = (t, head) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="TableText"/></w:pPr><w:r>${head ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${xe(t)}</w:t></w:r></w:p></w:tc>`;
    const b = '<w:top w:val="single" w:sz="4" w:color="888888"/><w:bottom w:val="single" w:sz="4" w:color="888888"/><w:insideH w:val="single" w:sz="2" w:color="BBBBBB"/>';
    return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${b}</w:tblBorders></w:tblPr>` +
      `<w:tr>${tb.head.map(h => cell(h, true)).join('')}</w:tr>` + tb.rows.map(r => `<w:tr>${r.map(c => cell(c, false)).join('')}</w:tr>`).join('') + '</w:tbl>' + (tb.caption ? para(tb.caption, 'Caption') : para(''));
  }
  /* blocks: [{h: 1|2, text}] | [{p: text}] | [{table}] */
  function docx(blocks, meta) {
    const body = blocks.map(b => (b.h ? para(b.text, 'Heading' + b.h) : b.table ? table(b.table) : b.title ? para(b.text, 'Title') : para(b.p, b.style))).join('');
    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const st = (id, name, rpr, ppr, based) => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/>${based ? `<w:basedOn w:val="${based}"/>` : ''}<w:qFormat/>${ppr ? `<w:pPr>${ppr}</w:pPr>` : ''}${rpr ? `<w:rPr>${rpr}</w:rPr>` : ''}</w:style>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:lang w:val="${meta && meta.lang === 'en' ? 'en-US' : 'es-MX'}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
      st('Normal', 'Normal') + st('Title', 'Title', '<w:b/><w:sz w:val="32"/>', '<w:jc w:val="center"/><w:spacing w:after="240"/>', 'Normal') +
      st('Heading1', 'heading 1', '<w:b/><w:sz w:val="28"/>', '<w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/>', 'Normal') +
      st('Heading2', 'heading 2', '<w:b/><w:i/><w:sz w:val="24"/>', '<w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/>', 'Normal') +
      st('Caption', 'caption', '<w:i/><w:sz w:val="20"/>', '<w:spacing w:before="60" w:after="240"/>', 'Normal') +
      st('TableText', 'Table Text', '<w:sz w:val="18"/>', '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>', 'Normal') +
      st('Reference', 'Reference', '', '<w:ind w:left="720" w:hanging="720"/>', 'Normal') + '</w:styles>';
    const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
    const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
    const drels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xe(meta && meta.title)}</dc:title><dc:creator>${xe(meta && meta.author)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created></cp:coreProperties>`;
    return [
      { name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: rels }, { name: 'word/_rels/document.xml.rels', data: drels },
      { name: 'word/document.xml', data: document }, { name: 'word/styles.xml', data: styles }, { name: 'docProps/core.xml', data: core },
    ];
  }

  /* ---------- references of methods ----------
     added to the reference list when the text cites them author–year */
  const MR = (re, ref) => ({ re, ref });
  const METHOD_REFS = [
    MR(/Page[^\n;]{0,25}?2021/, 'Page, M. J., McKenzie, J. E., Bossuyt, P. M., et al. (2021). The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71. https://doi.org/10.1136/bmj.n71'),
    MR(/Tricco[^\n;]{0,25}?2018/, 'Tricco, A. C., Lillie, E., Zarin, W., et al. (2018). PRISMA Extension for Scoping Reviews (PRISMA-ScR): checklist and explanation. Annals of Internal Medicine, 169(7), 467–473. https://doi.org/10.7326/M18-0850'),
    MR(/Baethge[^\n;]{0,25}?2019/, 'Baethge, C., Goldbeck-Wood, S., & Mertens, S. (2019). SANRA—a scale for the quality assessment of narrative review articles. Research Integrity and Peer Review, 4, 5. https://doi.org/10.1186/s41073-019-0064-8'),
    MR(/Hedges[^\n;]{0,25}?1999/, 'Hedges, L. V., Gurevitch, J., & Curtis, P. S. (1999). The meta-analysis of response ratios in experimental ecology. Ecology, 80(4), 1150–1156. https://doi.org/10.1890/0012-9658(1999)080[1150:TMAORR]2.0.CO;2'),
    MR(/Borenstein[^\n;]{0,25}?2009/, 'Borenstein, M., Hedges, L. V., Higgins, J. P. T., & Rothstein, H. R. (2009). Introduction to meta-analysis. Wiley. https://doi.org/10.1002/9780470743386'),
    MR(/Knapp[^\n;]{0,25}?2003/, 'Knapp, G., & Hartung, J. (2003). Improved tests for a random effects meta-regression with a single covariate. Statistics in Medicine, 22(17), 2693–2710. https://doi.org/10.1002/sim.1482'),
    MR(/Konstantopoulos[^\n;]{0,25}?2011/, 'Konstantopoulos, S. (2011). Fixed effects and variance components estimation in three-level meta-analysis. Research Synthesis Methods, 2(1), 61–76. https://doi.org/10.1002/jrsm.35'),
    MR(/Cheung[^\n;]{0,25}?2014/, 'Cheung, M. W.-L. (2014). Modeling dependent effect sizes with three-level meta-analyses: a structural equation modeling approach. Psychological Methods, 19(2), 211–229. https://doi.org/10.1037/a0032968'),
    MR(/Egger[^\n;]{0,25}?1997/, 'Egger, M., Davey Smith, G., Schneider, M., & Minder, C. (1997). Bias in meta-analysis detected by a simple, graphical test. BMJ, 315(7109), 629–634. https://doi.org/10.1136/bmj.315.7109.629'),
    MR(/Nakagawa[^\n;]{0,25}?2022/, 'Nakagawa, S., Lagisz, M., Jennions, M. D., et al. (2022). Methods for testing publication bias in ecological and evolutionary meta-analyses. Methods in Ecology and Evolution, 13(1), 4–21. https://doi.org/10.1111/2041-210X.13724'),
    MR(/Duval[^\n;]{0,25}?2000/, 'Duval, S., & Tweedie, R. (2000). Trim and fill: a simple funnel-plot-based method of testing and adjusting for publication bias in meta-analysis. Biometrics, 56(2), 455–463. https://doi.org/10.1111/j.0006-341X.2000.00455.x'),
    MR(/Guyatt[^\n;]{0,25}?2008/, 'Guyatt, G. H., Oxman, A. D., Vist, G. E., et al. (2008). GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ, 336(7650), 924–926. https://doi.org/10.1136/bmj.39489.470347.AD'),
    MR(/Higgins[^\n;]{0,25}?2002/, 'Higgins, J. P. T., & Thompson, S. G. (2002). Quantifying heterogeneity in a meta-analysis. Statistics in Medicine, 21(11), 1539–1558. https://doi.org/10.1002/sim.1186'),
    MR(/DerSimonian[^\n;]{0,25}?1986/, 'DerSimonian, R., & Laird, N. (1986). Meta-analysis in clinical trials. Controlled Clinical Trials, 7(3), 177–188. https://doi.org/10.1016/0197-2456(86)90046-2'),
    MR(/Cohen[^\n;]{0,25}?1960/, 'Cohen, J. (1960). A coefficient of agreement for nominal scales. Educational and Psychological Measurement, 20(1), 37–46. https://doi.org/10.1177/001316446002000104'),
    MR(/Barrera-Guzm[aá]n[^\n;]{0,25}?2026/, 'Barrera-Guzmán, L. Á. (2026). ReviewPro: a program for review articles, from protocol to manuscript [software].'),
  ];
  function methodRefs(text) { return METHOD_REFS.filter(m => m.re.test(text)).map(m => m.ref); }

  Object.assign(Writing, { outline, CITE, TOKEN, surname, authorYear, refEntry, render, sentences, checkClaims, PRISMA2020, PRISMASCR, SANRA, checklist, evaluate, wordCount, docx, xe, METHOD_REFS, methodRefs });
  window.Writing = Writing;
})();
