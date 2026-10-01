/* ReviewPro — tests of Block 2 (the protocol engine).

   References: the ORCID identifiers published in ORCID's own documentation
   (valid and deliberately invalid); the PRISMA-P 2015 statement (17 items,
   26 counting sub-items); and the definitions of each rule: a question with a
   missing element is flagged, criteria are numbered in order, a complete
   example passes every check, a project survives being written to a file and
   read back. */
(function () {
  const { section, check, near } = TT;
  const PR = Protocol;
  const clone = o => JSON.parse(JSON.stringify(o));

  section('Marcos de pregunta y redacción');
  check('seis marcos, cada uno con elementos', PR.FW_ORDER.length === 6 && PR.FW_ORDER.every(k => PR.FRAMEWORKS[k].el.length > 0));
  check('PICOS = PICO + diseño', PR.FRAMEWORKS.PICOS.el.map(x => x.k).join('') === 'PICOS');
  check('marco recomendado por tipo', PR.RECOMMENDED.narrative === 'FREE' && PR.RECOMMENDED.scoping === 'PCC' && PR.RECOMMENDED.systematic === 'PICO' && PR.RECOMMENDED.meta === 'PICOS');
  const el = { P: 'maíz en campo', I: 'la inoculación', C: 'el testigo sin inocular', O: 'el rendimiento' };
  check('PICO en español', PR.buildQuestion('PICO', el, 'es') === 'En maíz en campo, ¿qué efecto tiene la inoculación frente al testigo sin inocular sobre el rendimiento?', PR.buildQuestion('PICO', el, 'es'));
  check('PICO en inglés', PR.buildQuestion('PICO', { P: 'field maize', I: 'inoculation', C: 'no inoculation', O: 'yield' }, 'en') === 'In field maize, what is the effect of inoculation compared with no inoculation on yield?');
  check('contracciones «a el» → «al», «de el» → «del», sin tocar «para el»', PR.buildQuestion('PCC', { P: 'el productor', Co: 'el uso de el agua para el riego', Cx: 'México' }, 'es') === '¿Qué evidencia existe sobre el uso del agua para el riego en el productor, en México?', PR.buildQuestion('PCC', { P: 'el productor', Co: 'el uso de el agua para el riego', Cx: 'México' }, 'es'));
  check('un elemento vacío aparece como [C]', PR.buildQuestion('PICO', { P: 'a', I: 'b', O: 'd' }, 'es').includes('[C]'));
  check('puntuación final del usuario no se duplica', !PR.buildQuestion('PICO', { P: 'maíz.', I: 'x;', C: 'y,', O: 'z.' }, 'es').includes('.,'));
  check('pregunta libre usa el texto tal cual', PR.buildQuestion('FREE', { Q: '¿Por qué?' }, 'es') === '¿Por qué?');
  check('la redacción propia manda sobre la automática', PR.questionOf({ questionText: 'Mi pregunta', framework: 'PICO', elements: el }, 'es') === 'Mi pregunta');

  section('Revisión de la pregunta');
  const base = t => Object.assign(PR.blank(t), { elements: clone(el) });
  check('pregunta completa sin avisos graves', !PR.checkQuestion(base('systematic')).some(x => x.level === 'bad'));
  let p = base('meta'); p.framework = 'PICO'; delete p.elements.C;
  check('meta-análisis sin comparador: dos errores (falta C y no hay efecto)', PR.checkQuestion(p).filter(x => x.level === 'bad').length === 2);
  p = base('systematic'); p.elements.P = 'todos los cultivos';
  check('palabra vaga detectada («todos»)', PR.checkQuestion(p).some(x => x.level === 'warn' && /todos/.test(x.msg[0])));
  p = base('systematic'); p.elements.I = 'riego, fertilización, labranza, cobertura y rotación';
  check('demasiados elementos juntos', PR.checkQuestion(p).some(x => /separar/.test(x.msg[0])));
  p = base('meta'); p.framework = 'PCC';
  check('meta-análisis con PCC → aviso', PR.checkQuestion(p).some(x => /focalizada/.test(x.msg[0])));
  p = base('meta'); p.framework = 'SPIDER';
  check('meta-análisis con SPIDER → aviso', PR.checkQuestion(p).some(x => /cualitativa/.test(x.msg[0])));

  section('Criterios');
  const seeded = PR.seedCriteria(Object.assign(base('meta'), { framework: 'PICO' }), 'es');
  check('se siembra un criterio de inclusión por elemento', seeded.filter(c => c.kind === 'inc' && ['P', 'I', 'C', 'O'].includes(c.facet)).length === 4);
  check('y los criterios por defecto del meta-análisis', seeded.filter(c => c.kind === 'exc').length === 3 && seeded.some(c => c.facet === 'design'));
  check('numeración I1…In y E1…En en orden', (() => { let i = 0, e = 0; return seeded.every(c => c.id === (c.kind === 'inc' ? 'I' + (++i) : 'E' + (++e))); })());
  const ren = PR.numberCriteria([{ kind: 'exc' }, { kind: 'inc' }, { kind: 'exc' }, { kind: 'inc' }]);
  check('renumerar tras mezclar tipos', ren.map(c => c.id).join(',') === 'E1,I1,E2,I2');
  check('la narrativa no pide exclusiones', PR.seedCriteria(Object.assign(PR.blank('narrative'), { elements: { Q: 'x' } }), 'es').every(c => c.kind === 'inc'));

  section('ORCID (ISO 7064 MOD 11-2)');
  check('identificador de prueba de la documentación de ORCID: 0000-0002-1825-0097', PR.orcidValid('0000-0002-1825-0097'));
  check('con X final: 0000-0002-1694-233X (verificado aparte en PowerShell)', PR.orcidValid('0000-0002-1694-233X'));
  check('se acepta con el prefijo https://orcid.org/', PR.orcidValid('https://orcid.org/0000-0002-1825-0097'));
  check('un dígito cambiado se rechaza', !PR.orcidValid('0000-0002-1825-0098') && !PR.orcidValid('0000-0002-1825-0079'));
  check('formato incorrecto se rechaza', !PR.orcidValid('0000-0002-1825-009') && !PR.orcidValid('0000000218250097'));
  check('el dígito verificador calculado', PR.orcidCheck('000000021825009') === '7' && PR.orcidCheck('000000021694233') === 'X');

  section('PRISMA-P 2015');
  check('26 ítems contando subítems', PR.PRISMAP.length === 26);
  check('17 ítems principales', new Set(PR.PRISMAP.map(x => x.id.replace(/[a-d]$/, ''))).size === 17);
  check('ítems 1a…17 en el orden de la declaración', PR.PRISMAP.map(x => x.id).join(' ') === '1a 1b 2 3a 3b 4 5a 5b 5c 6 7 8 9 10 11a 11b 11c 12 13 14 15a 15b 15c 15d 16 17');
  const pb = PR.prismaP(PR.blank('scoping'));
  check('en una exploratoria, riesgo de sesgo (14), 15b, 15c y certeza (17) no aplican', ['14', '15b', '15c', '17'].every(id => pb.find(r => r.id === id).status === 'na'));
  check('la estrategia de búsqueda (10) se cumple en el Bloque 3', PR.prismaP(PR.blank('meta')).find(r => r.id === '10').status === 'later');

  section('Ejemplos completos');
  Object.keys(Examples).forEach(k => {
    const ex = PR.normalize(clone(Examples[k].protocol));
    ex.milestones = PR.schedule(ex.type, ex.dates.start, null, 'es');
    const s = PR.sections(ex);
    check(`ejemplo «${k}»: todas las secciones completas o no aplicables`, s.every(x => x.status === 'ok' || x.status === 'na'), s.filter(x => x.status !== 'ok' && x.status !== 'na').map(x => x.id).join(', ') || '100 %');
    const pp = PR.prismaP(ex).filter(r => r.status === 'missing').map(r => r.id);
    check(`ejemplo «${k}»: ningún ítem PRISMA-P faltante (salvo registro y búsqueda)`, pp.length === 0, pp.join(', '));
    (ex.type === 'scoping' || ex.type === 'narrative' ? ['osf'] : ['prospero', 'osf']).forEach(w => {
      const miss = PR.registration(ex, w, 'en').filter(r => r.status === 'missing').map(r => r.k);
      check(`ejemplo «${k}»: campos obligatorios de ${w.toUpperCase()} con texto`, miss.length === 0, miss.join(', '));
    });
  });

  section('Registro y documento');
  const ex = PR.normalize(clone(Examples.meta.protocol));
  const pro = PR.registration(ex, 'prospero', 'en');
  check('los campos de PROSPERO siguen el orden del formulario (título, fechas, …, idioma)', pro[0].k === 'title' && pro[1].k === 'start' && pro.findIndex(r => r.k === 'question') < pro.findIndex(r => r.k === 'searches'));
  check('la pregunta del registro es la del protocolo', pro.find(r => r.k === 'question').text === PR.questionOf(ex, 'en'));
  check('el campo de síntesis nombra el estimador y Knapp–Hartung', /REML/.test(pro.find(r => r.k === 'synthesis').text) && /Knapp/.test(pro.find(r => r.k === 'synthesis').text));
  check('el texto de conexión sigue el idioma elegido', /will be screened/.test(pro.find(r => r.k === 'extraction').text) && /serán cribados/.test(PR.registration(ex, 'prospero', 'es').find(r => r.k === 'extraction').text));
  const osf = PR.registration(ex, 'osf', 'es');
  check('OSF: las cadenas de búsqueda quedan pendientes para el Bloque 3', osf.find(r => r.k === 'strings').status === 'later');
  check('OSF: criterios con sus claves', /^I1\. /.test(osf.find(r => r.k === 'inc').text) && /E5\. /.test(osf.find(r => r.k === 'exc').text));
  const md = PR.registrationText(ex, 'osf', 'en');
  check('el archivo de registro tiene un encabezado por sección (7 en OSF)', (md.match(/^## /gm) || []).length === 7);
  check('PROSPERO no registra exploratorias ni narrativas', !PR.registryFit(PR.blank('scoping'), 'prospero').ok && !PR.registryFit(PR.blank('narrative'), 'prospero').ok && PR.registryFit(PR.blank('meta'), 'prospero').ok && PR.registryFit(PR.blank('scoping'), 'osf').ok);
  check('sin comparador en el marco, el comparador no es obligatorio', PR.registration(PR.normalize(clone(Examples.scoping.protocol)), 'prospero', 'en').find(r => r.k === 'comp').req === false);
  check('sin subgrupos planeados, se dice explícitamente', /No subgroup analyses are planned/.test(PR.registration(PR.normalize(clone(Examples.scoping.protocol)), 'prospero', 'en').find(r => r.k === 'subgroups').text));
  const blankReg = PR.registration(PR.blank('meta'), 'prospero', 'en');
  check('en un protocolo vacío los campos obligatorios salen «por completar»', blankReg.filter(r => r.req && r.status === 'missing').length >= 15);

  section('Cronograma');
  const sch = PR.schedule('systematic', '2026-10-01', 12, 'es');
  check('ocho etapas para una sistemática', sch.length === 8);
  check('empieza en la fecha de inicio y termina a los 12 meses', sch[0].start === '2026-10-01' && sch[7].end === '2027-10-01', sch[7].end);
  check('cada etapa termina después de empezar', sch.every(m => m.end > m.start));
  check('las etapas van en orden', sch.every((m, i) => i === 0 || m.start >= sch[i - 1].start));
  check('duración por defecto de una narrativa: 3 meses', (() => { const s = PR.schedule('narrative', '2026-01-01', null, 'es'); return s[s.length - 1].end === '2026-04-02'; })(), PR.schedule('narrative', '2026-01-01', null, 'es').slice(-1)[0].end);
  check('fecha inválida → sin cronograma', PR.schedule('meta', '2026-13-01', 12, 'es').length === 0);

  section('Completitud por tipo');
  const b = PR.blank('meta');
  check('un protocolo vacío de meta-análisis puntúa bajo', PR.score(b).value < 0.25, fmtPct(PR.score(b).value));
  const nar = PR.blank('narrative');
  check('una narrativa no exige extracción ni riesgo de sesgo', ['screening', 'extraction', 'appraisal'].every(id => PR.sections(nar).find(s => s.id === id).status === 'na'));
  const bad = PR.normalize(clone(Examples.meta.protocol)); bad.synthesis.approach = 'swim';
  check('meta-análisis con plan de síntesis narrativo → falta', PR.sections(bad).find(s => s.id === 'synthesis').status === 'missing');
  const bo = PR.normalize(clone(Examples.meta.protocol)); bo.team[0].orcid = '0000-0002-1825-0098';
  check('un ORCID inválido marca al equipo', PR.sections(bo).find(s => s.id === 'team').status === 'warn');
  const bd = PR.normalize(clone(Examples.meta.protocol)); bd.dates.end = '2026-01-01';
  check('término antes del inicio → falta', PR.sections(bd).find(s => s.id === 'dates').status === 'missing');

  section('Proyecto: guardar y abrir');
  const saved = state.protocol;
  state.protocol = PR.normalize(clone(Examples.scoping.protocol));
  const snap = JSON.parse(JSON.stringify(Project.snapshot()));
  check('el archivo declara su formato y versión', snap.format === 'reviewpro-project' && snap.version === 1 && snap.app === APP_VERSION);
  state.protocol = PR.blank('meta');
  Project.apply(snap);
  check('abrir el archivo restaura el protocolo idéntico', JSON.stringify(state.protocol) === JSON.stringify(PR.normalize(clone(Examples.scoping.protocol))) && state.reviewType === 'scoping');
  check('un archivo ajeno se rechaza', (() => { try { Project.apply({ foo: 1 }); return false; } catch (e) { return true; } })());
  const partial = PR.normalize({ type: 'meta', title: 'x', screening: { reviewers: 3 } });
  check('un protocolo parcial se completa con los valores por defecto', partial.screening.reviewers === 3 && partial.screening.stopN === 100 && Array.isArray(partial.criteria) && partial.framework === 'PICOS');
  section('Idioma de los textos del usuario');
  check('reconoce un párrafo en español', PR.langGuess('Efecto de la inoculación con hongos sobre el rendimiento del maíz en campo') === 'es');
  check('reconoce un párrafo en inglés', PR.langGuess('Effect of the inoculation with fungi on the yield of maize in the field') === 'en');
  check('texto demasiado corto: no decide', PR.langGuess('maíz') === null);
  check('el ejemplo del meta-análisis está en español', PR.contentLang(PR.normalize(clone(Examples.meta.protocol))) === 'es');
  state.protocol = saved;
})();
