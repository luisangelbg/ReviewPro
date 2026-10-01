/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — example protocols, one per kind of review that needs a
   different route. They are fictitious: the team, the institution and the
   dates are invented, and the only ORCID used is the public test identifier
   of the ORCID documentation. They exist so a user can see a complete
   protocol before writing their own, and so the tests can check that a
   complete protocol passes every check. */

const Examples = {};

(function () {
  const team = (names) => names.map((n, i) => ({ name: n[0], aff: n[1], email: n[2] || '', orcid: n[3] || '', roles: n[4] || [] }));

  Examples.meta = {
    label: ['Meta-análisis: micorrizas y rendimiento de maíz', 'Meta-analysis: mycorrhizae and maize yield'],
    protocol: {
      title: 'Efecto de la inoculación con hongos micorrízicos arbusculares sobre el rendimiento de grano de maíz en campo: revisión sistemática y meta-análisis',
      type: 'meta', framework: 'PICOS',
      elements: { P: 'maíz (Zea mays L.) cultivado en campo', I: 'la inoculación con hongos micorrízicos arbusculares', C: 'el mismo manejo sin inocular', O: 'el rendimiento de grano', S: 'experimentos de campo con testigo y repeticiones' },
      questionText: '',
      background: 'Los inoculantes micorrízicos se comercializan como una forma de reducir el fósforo aplicado sin perder rendimiento, pero los ensayos de campo publicados dan resultados contradictorios y las revisiones previas mezclan invernadero y campo o no estiman la heterogeneidad entre sitios.',
      objectives: 'Estimar el cambio medio en el rendimiento de grano del maíz inoculado frente al no inoculado en campo; cuantificar cuánto varía entre sitios; y explorar si el fósforo disponible del suelo, la dosis de fósforo aplicada y el tipo de inoculante explican esa variación.',
      hypotheses: 'El efecto medio es positivo y mayor en suelos con poco fósforo disponible.',
      keywords: 'micorrizas arbusculares; inoculantes; maíz; rendimiento; fósforo; meta-análisis',
      criteria: [
        { id: 'I1', kind: 'inc', facet: 'P', text: 'Maíz de grano cultivado en campo, cualquier región y ciclo' },
        { id: 'I2', kind: 'inc', facet: 'I', text: 'Inoculación con hongos micorrízicos arbusculares (una especie o consorcio), en semilla o suelo' },
        { id: 'I3', kind: 'inc', facet: 'C', text: 'Testigo sin inocular con el mismo manejo agronómico' },
        { id: 'I4', kind: 'inc', facet: 'O', text: 'Rendimiento de grano con media, medida de dispersión y número de repeticiones (o datos para calcularlos)' },
        { id: 'I5', kind: 'inc', facet: 'S', text: 'Experimentos de campo con al menos tres repeticiones' },
        { id: 'E1', kind: 'exc', facet: 'S', text: 'Experimentos en maceta, invernadero o cámara de crecimiento' },
        { id: 'E2', kind: 'exc', facet: 'I', text: 'Inoculantes que combinan micorrizas con otros microorganismos sin tratamiento de micorrizas solas' },
        { id: 'E3', kind: 'exc', facet: 'pub', text: 'Revisiones, editoriales y resúmenes de congreso sin resultados completos' },
        { id: 'E4', kind: 'exc', facet: 'data', text: 'Estudios sin datos cuantitativos extraíbles tras contactar a los autores' },
        { id: 'E5', kind: 'exc', facet: 'dup', text: 'Publicaciones duplicadas del mismo experimento (se conserva la más completa)' },
      ],
      years: { from: '1990', to: '' }, languages: 'inglés, español, portugués', pubTypes: ['journal', 'thesis', 'report'],
      outcomes: [
        { name: 'Rendimiento de grano', role: 'primary', measure: 't/ha al 14 % de humedad' },
        { name: 'Colonización micorrízica de la raíz', role: 'secondary', measure: '% de longitud de raíz colonizada' },
        { name: 'Absorción de fósforo', role: 'secondary', measure: 'kg P/ha en la parte aérea' },
      ],
      moderators: 'fósforo disponible del suelo; dosis de fósforo aplicada; tipo de inoculante (especie única o consorcio); clima (Köppen); años del experimento',
      sources: [
        { name: 'Base de citas multidisciplinaria 1', kind: 'db', note: 'desde 1990' },
        { name: 'Base de citas multidisciplinaria 2', kind: 'db', note: 'desde 1990' },
        { name: 'Base bibliográfica agrícola', kind: 'db', note: 'desde 1990' },
        { name: 'Repositorios de tesis de universidades agrícolas', kind: 'grey', note: '' },
      ],
      greyLit: 'tesis de posgrado, informes técnicos de institutos nacionales de investigación agrícola y actas de congresos de la ciencia del suelo',
      otherSearch: 'Revisión de las listas de referencias de los estudios incluidos y de revisiones previas (búsqueda hacia atrás y hacia adelante)',
      screening: { reviewers: 2, pilot: 50, prioritized: true, stop: 'consecutive', stopN: 100, check: true, fulltextDual: true, kappa: 0.6, disagreements: 'third' },
      extraction: { dual: true, contactAuthors: true, items: 'país y coordenadas; clima; tipo y fósforo disponible del suelo; híbrido o variedad; inoculante (especie, dosis, forma de aplicación); dosis de N y P; diseño experimental y repeticiones; años; medias, dispersión y n del rendimiento por tratamiento' },
      appraisal: { tool: 'agro', certainty: 'grade' },
      synthesis: { approach: 'meta', metric: 'ROM', estimator: 'REML', knha: true, subgroups: 'fósforo disponible del suelo (bajo, medio, alto); tipo de inoculante; meta-regresión sobre la dosis de fósforo aplicada', sensitivity: 'excluir estudios de alto riesgo de sesgo; excluir estudios con dispersión imputada; análisis «dejando uno fuera»', pubBias: true, notes: 'Los efectos múltiples de un mismo experimento se tratarán con un modelo multinivel o se promediarán dentro del estudio' },
      team: team([
        ['Josiah Carberry', 'Universidad ficticia, Departamento de Suelos', 'contacto@ejemplo.org', '0000-0002-1825-0097', ['conc', 'meth', 'anal', 'write', 'guar']],
        ['Investigadora 2', 'Instituto ficticio de Agricultura', '', '', ['search', 'screen', 'extract']],
        ['Investigador 3', 'Universidad ficticia, Departamento de Suelos', '', '', ['screen', 'extract', 'write']],
      ]),
      contactIdx: 0, funding: 'Ninguno', coi: 'Los autores declaran no tener conflictos de interés; ninguno ha recibido apoyo de fabricantes de inoculantes.',
      dates: { start: '2026-10-01', end: '2027-09-30' }, milestones: [],
      registration: { registry: 'prospero', id: '', lang: 'en' },
      amendments: 'Toda enmienda se fechará, se justificará y se reportará en el registro y en el artículo.',
      dissemination: 'Artículo en revista arbitrada de acceso abierto y datos en un repositorio abierto.',
    },
  };

  Examples.scoping = {
    label: ['Exploratoria: prácticas agroecológicas en café', 'Scoping: agroecological practices in coffee'],
    protocol: {
      title: 'Prácticas agroecológicas en cafetales de pequeños productores de América Latina: revisión exploratoria',
      type: 'scoping', framework: 'PCC',
      elements: { P: 'pequeños productores de café', Co: 'prácticas agroecológicas (sombra diversificada, abonos orgánicos, manejo biológico de plagas, conservación de suelo)', Cx: 'América Latina, estudios publicados entre 2000 y 2025' },
      questionText: '',
      background: 'La literatura sobre agroecología en café está dispersa entre agronomía, ecología y ciencias sociales, y no existe un mapa de qué prácticas se han estudiado, con qué métodos y en qué países.',
      objectives: 'Mapear las prácticas agroecológicas estudiadas, los países, los diseños de estudio y los desenlaces medidos (productivos, ambientales y sociales), e identificar vacíos de evidencia.',
      hypotheses: '', keywords: 'café; agroecología; pequeños productores; América Latina; revisión exploratoria',
      criteria: [
        { id: 'I1', kind: 'inc', facet: 'P', text: 'Estudios con pequeños productores de café o sus fincas' },
        { id: 'I2', kind: 'inc', facet: 'Co', text: 'Al menos una práctica agroecológica descrita' },
        { id: 'I3', kind: 'inc', facet: 'Cx', text: 'Realizados en un país de América Latina' },
        { id: 'I4', kind: 'inc', facet: 'pub', text: 'Cualquier diseño: experimentos, encuestas, estudios de caso, cualitativos y revisiones' },
        { id: 'E1', kind: 'exc', facet: 'pub', text: 'Editoriales y opiniones sin datos ni métodos' },
        { id: 'E2', kind: 'exc', facet: 'P', text: 'Plantaciones comerciales de gran escala' },
      ],
      years: { from: '2000', to: '2025' }, languages: 'español, inglés, portugués', pubTypes: ['journal', 'thesis', 'report'],
      outcomes: [{ name: 'Desenlaces reportados (productivos, ambientales, sociales)', role: 'primary', measure: 'categorías caracterizadas' }],
      moderators: '',
      sources: [
        { name: 'Base de citas multidisciplinaria 1', kind: 'db', note: '2000–2025' },
        { name: 'Base regional de revistas latinoamericanas', kind: 'db', note: '2000–2025' },
        { name: 'Repositorios institucionales de universidades y centros de investigación', kind: 'grey', note: '' },
      ],
      greyLit: 'tesis, informes de organizaciones de productores y de cooperación',
      otherSearch: '',
      screening: { reviewers: 2, pilot: 30, prioritized: true, stop: 'consecutive', stopN: 150, check: true, fulltextDual: false, kappa: 0.6, disagreements: 'discussion' },
      extraction: { dual: false, contactAuthors: false, items: 'país; año; diseño; práctica(s); escala; desenlaces medidos; participación de productores' },
      appraisal: { tool: 'none', certainty: 'none' },
      synthesis: { approach: 'charting', metric: 'ROM', estimator: 'REML', knha: true, subgroups: '', sensitivity: '', pubBias: false, notes: 'Mapa de evidencia práctica × desenlace y tablas por país y diseño' },
      team: team([['Investigadora 1', 'Universidad ficticia', 'contacto@ejemplo.org', '', ['conc', 'meth', 'write', 'guar']], ['Investigador 2', 'Centro ficticio', '', '', ['search', 'screen', 'extract']]]),
      contactIdx: 0, funding: 'Ninguno', coi: 'Ninguno',
      dates: { start: '2026-11-01', end: '2027-04-30' }, milestones: [],
      registration: { registry: 'osf', id: '', lang: 'en' },
      amendments: 'Las enmiendas se fecharán y se reportarán en el registro.', dissemination: 'Artículo de acceso abierto e infografía para organizaciones de productores.',
    },
  };

  Examples.narrative = {
    label: ['Narrativa: el papel de las micorrizas en la nutrición del maíz', 'Narrative: the role of mycorrhizae in maize nutrition'],
    protocol: {
      title: 'Micorrizas y nutrición fosforada del maíz: cómo ha cambiado su comprensión',
      type: 'narrative', framework: 'FREE',
      elements: { Q: '¿Cómo ha cambiado, desde los primeros estudios fisiológicos hasta los genómicos, la comprensión del papel de las micorrizas arbusculares en la nutrición fosforada del maíz?' },
      questionText: '',
      background: 'Los libros de texto aún presentan la simbiosis como un simple intercambio de carbono por fósforo; los estudios recientes muestran vías de absorción que compiten y dependen del genotipo.',
      objectives: 'Reconstruir la evolución de las ideas y señalar las preguntas abiertas que importan al manejo agronómico.',
      hypotheses: '', keywords: 'micorrizas; fósforo; maíz; revisión narrativa',
      criteria: [{ id: 'I1', kind: 'inc', facet: 'pub', text: 'Artículos, capítulos y libros que discutan la absorción de fósforo mediada por micorrizas en maíz' }],
      years: { from: '', to: '' }, languages: 'inglés, español', pubTypes: ['journal', 'book'],
      outcomes: [], moderators: '',
      sources: [{ name: 'Base de citas multidisciplinaria 1', kind: 'db', note: '' }, { name: 'Listas de referencias de revisiones clave', kind: 'other', note: '' }],
      greyLit: '', otherSearch: '',
      screening: { reviewers: 1, pilot: 0, prioritized: false, stop: 'consecutive', stopN: 100, check: false, fulltextDual: false, kappa: 0.6, disagreements: 'discussion' },
      extraction: { dual: false, contactAuthors: false, items: '' },
      appraisal: { tool: 'none', certainty: 'none' },
      synthesis: { approach: 'thematic', metric: 'ROM', estimator: 'REML', knha: true, subgroups: '', sensitivity: '', pubBias: false, notes: 'Organización cronológica y por temas' },
      team: team([['Autor único', 'Universidad ficticia', 'contacto@ejemplo.org', '', ['conc', 'write', 'guar']]]),
      contactIdx: 0, funding: 'Ninguno', coi: 'Ninguno',
      dates: { start: '2026-10-15', end: '2027-01-31' }, milestones: [],
      registration: { registry: 'osf', id: '', lang: 'en' },
      amendments: 'No aplica.', dissemination: 'Artículo de revisión por invitación.',
    },
  };

  window.Examples = Examples;
})();
