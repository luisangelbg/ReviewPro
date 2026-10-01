/* ReviewPro — tests of Block 5 (full texts and the PRISMA flow).

   The flow is checked on a hand-built set of records whose fate at every
   stage is known, so each box of the diagram has an expected number; and on
   the rule that every record falls in exactly one box of each stage. */
(function () {
  const { section, check } = TT;
  const F = FullText;

  section('Nombres de archivo y rutas de los PDF');
  check('nombre sugerido: Apellido_Año_CuatroPalabras.pdf', F.fileName({ authors: ['Ramírez Soto, Laura'], year: 2019, title: 'Arbuscular mycorrhizal inoculation increases maize grain yield' }) === 'RamirezSoto_2019_ArbuscularMycorrhizalInoculationIncreases.pdf');
  check('sin autor ni año', F.fileName({ title: 'A b c' }) === 'Anon_sf_Informe.pdf');
  check('ruta de Windows → file:///C:/…', F.fileUrl('C:\\Revision\\PDF\\a b.pdf') === 'file:///C:/Revision/PDF/a%20b.pdf');
  check('ruta relativa con carpeta base', F.fileUrl('x.pdf', 'D:\\PDF\\') === 'file:///D:/PDF/x.pdf');
  check('ruta de macOS o Linux', F.fileUrl('/home/ana/pdf/x.pdf') === 'file:///home/ana/pdf/x.pdf');
  check('carpeta de red \\\\servidor\\…', F.fileUrl('\\\\srv\\pdf\\x.pdf') === 'file://srv/pdf/x.pdf');
  check('ruta entre comillas (copiada del explorador)', F.fileUrl('"C:\\A\\x.pdf"') === 'file:///C:/A/x.pdf');
  check('relativa sin carpeta base → sin enlace', F.fileUrl('x.pdf') === '');

  section('Estado de elegibilidad');
  const D = { A: { k1: { d: 'inc' }, k2: { d: 'exc', reason: 'E1' }, k3: { d: 'inc' } }, B: { k1: { d: 'inc' }, k2: { d: 'exc', reason: 'E2' }, k3: { d: 'exc', reason: 'E1' } } };
  check('ambos incluyen → acordado', F.status('k1', D, ['A', 'B'], {}, 2).s === 'agreed');
  check('ambos excluyen con motivos distintos → acordado, conserva ambos', F.status('k2', D, ['A', 'B'], {}, 2).reasons.length === 2);
  check('incluir contra excluir → conflicto; la decisión final lo resuelve', F.status('k3', D, ['A', 'B'], {}, 2).s === 'conflict' && F.status('k3', D, ['A', 'B'], { k3: { d: 'exc', reason: 'E4' } }, 2).s === 'final');
  check('un revisor cuando se piden dos → parcial; con uno requerido → acordado', F.status('k1', { A: D.A }, ['A', 'B'], {}, 2).s === 'partial' && F.status('k1', { A: D.A }, ['A'], {}, 1).s === 'agreed');

  section('Informes y estudios');
  const g = F.studies(['a', 'b', 'c', 'd'], { b: 'a', d: 'b' });
  check('b es informe de a y d de b → un estudio con tres informes, más c', g.length === 2 && g.some(x => x.length === 3 && x.includes('d')) && g.some(x => x.join() === 'c'));
  check('un vínculo a un informe que no está incluido no cuenta', F.studies(['a', 'b'], { a: 'z' }).length === 2);

  section('El flujo PRISMA sobre un conjunto con destino conocido');
  const ok = { s: 'agreed', d: 'inc' }, ex = r => ({ s: 'agreed', d: 'exc', reason: r });
  const recs = [];
  const add = (n, o) => { for (let i = 0; i < n; i++) recs.push(Object.assign({ key: 'k' + recs.length, pathway: 'db', retrieval: 'retrieved', ft: ok }, o)); };
  add(40, { screen: ex('E3') });                                   // excluded at title/abstract
  add(5, { screen: { s: 'unread' } });                             // unread after stopping
  add(2, { screen: { s: 'conflict' } });                           // still in conflict
  add(3, { screen: ok, retrieval: 'not' });                        // not retrieved
  add(1, { screen: ok, retrieval: 'pending' });                    // not obtained yet
  add(4, { screen: ok, ft: ex('E1') });                            // excluded at full text
  add(2, { screen: { s: 'agreed', d: 'maybe' }, ft: ex('E2') });
  add(1, { screen: ok, ft: { s: 'conflict' } });                   // full-text conflict
  add(10, { screen: ok });                                          // included
  add(2, { screen: ok, pathway: 'other', direct: true });           // from citation searching, included
  add(1, { screen: ok, pathway: 'other', direct: true, ft: ex('E1') });
  const ident = { db: { 'Base 1': 60, 'Base 2': 20 }, other: { 'Citas': 3 } };
  const links = { k60: 'k59' };   // two of the included db reports belong to one study
  const f = F.flow(recs, ident, links);
  const d = f.db, o = f.other;
  check('identificados 80, únicos 68, duplicados 12', d.identified === 80 && d.unique === 68 && d.duplicates === 12);
  check('cribados = 68 − 5 no leídos − 2 en conflicto = 61', d.screened === 61 && d.unread === 5 && d.pendingTA === 2);
  check('excluidos en título y resumen 40, con su motivo', d.excludedTA === 40 && d.taReasons.E3 === 40);
  check('informes buscados 21 («tal vez» cuenta), no recuperados 3, por conseguir 1', d.sought === 21 && d.notRetrieved === 3 && d.awaiting === 1);
  check('evaluados 17, excluidos 6 (E1 4, E2 2), en conflicto 1, incluidos 10', d.assessed === 17 && d.excludedFT === 6 && d.ftReasons.E1 === 4 && d.ftReasons.E2 === 2 && d.pendingFT === 1 && d.includedReports === 10);
  check('otros métodos: 3 identificados, 3 buscados, 1 excluido, 2 incluidos', o.identified === 3 && o.sought === 3 && o.directToFT === 3 && o.excludedFT === 1 && o.includedReports === 2);
  check('12 informes incluidos de 11 estudios (un par vinculado)', f.includedReports === 12 && f.includedStudies === 11);
  check('pendientes = 2 + 1 + 1 = 4 y el diagrama se marca provisional', f.pending === 4 && !f.complete);
  check('cada registro cae en una sola casilla de cada etapa', d.screened + d.unread + d.pendingTA === d.unique && d.excludedTA + d.sought === d.screened && d.notRetrieved + d.awaiting + d.assessed === d.sought && d.excludedFT + d.pendingFT + d.includedReports === d.assessed);
  const c = F.checks(f);
  check('las revisiones avisan de lo pendiente en cada etapa', c.filter(x => x.level === 'warn').length === 3);
  const noReason = F.flow([{ key: 'z', pathway: 'db', screen: ok, retrieval: 'retrieved', ft: { s: 'agreed', d: 'exc', reason: '' } }], { db: { a: 1 }, other: {} }, {});
  check('una exclusión a texto completo sin motivo es un error', F.checks(noReason).some(x => x.level === 'bad' && /sin motivo/.test(x.msg[0])));
  check('un flujo completo no tiene avisos', F.checks(F.flow(recs.filter(r => (r.screen.s === 'agreed' || r.screen.s === 'unread') && r.retrieval !== 'pending' && r.ft.s !== 'conflict'), { db: { a: 64 }, other: { c: 3 } }, {})).length === 0);
})();
