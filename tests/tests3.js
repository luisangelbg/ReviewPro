/* ReviewPro — tests of Block 3 (search strategy, import, deduplication).

   References: the six sample exports carry the id of their true work in the
   accession field, so the parsers and the deduplication are checked against
   a truth built independently of them. The blocked comparison is checked
   against the brute-force comparison of every pair. The search strings are
   checked character by character against hand-written expected strings. */
(function () {
  const { section, check } = TT;

  /* ---------------- strategy ---------------- */
  section('Cadenas de búsqueda en cada sintaxis');
  const S1 = { blocks: [
    { name: 'P', field: 'tiab', terms: [{ t: 'maize' }, { t: 'zea mays' }] },
    { name: 'I', field: 'tiab', terms: [{ t: 'mycorrhiz*' }, { t: 'AMF' }, { t: 'glomus', on: false }] },
  ], not: { field: 'tiab', terms: [{ t: 'greenhouse' }] } };
  check('función de campo', Search.write(S1, 'func') === '(TITLE-ABS-KEY(maize OR "zea mays") AND TITLE-ABS-KEY(mycorrhiz* OR AMF)) AND NOT TITLE-ABS-KEY(greenhouse)', Search.write(S1, 'func'));
  check('etiqueta con igual', Search.write(S1, 'tag') === '(TS=(maize OR "zea mays") AND TS=(mycorrhiz* OR AMF)) NOT TS=(greenhouse)', Search.write(S1, 'tag'));
  check('etiqueta entre corchetes', Search.write(S1, 'bracket') === '((maize[tiab] OR "zea mays"[tiab]) AND (mycorrhiz*[tiab] OR AMF[tiab])) NOT (greenhouse[tiab])', Search.write(S1, 'bracket'));
  check('líneas numeradas', Search.write(S1, 'suffix') === '1 (maize or zea mays).ti,ab,kw.\n2 (mycorrhiz* or AMF).ti,ab,kw.\n3 1 and 2\n4 (greenhouse).ti,ab,kw.\n5 3 not 4', JSON.stringify(Search.write(S1, 'suffix')));
  check('sin campos: sin truncamiento y NOT con guion', Search.write(S1, 'plain') === '(maize OR "zea mays") AND (mycorriz OR AMF) -greenhouse'.replace('mycorriz', 'mycorrhiz'), Search.write(S1, 'plain'));
  check('un término desactivado no se escribe', !Search.write(S1, 'func').includes('glomus'));
  const S2 = { blocks: [{ name: 'P', field: 'ti', terms: [{ t: 'maize' }] }], not: { terms: [] } };
  check('campo de solo título', Search.write(S2, 'func') === 'TITLE(maize)' && Search.write(S2, 'tag') === 'TI=(maize)' && Search.write(S2, 'bracket') === '(maize[ti])' && Search.write(S2, 'suffix') === '1 (maize).ti.');
  check('un solo bloque en líneas numeradas no pide combinación', Search.write(S2, 'suffix').split('\n').length === 1);
  check('sin bloques, cadena vacía', Search.write({ blocks: [], not: { terms: [] } }, 'func') === '');

  section('Revisión de la estrategia');
  const lv = (s, d) => Search.check(s, d || 'func');
  check('truncamiento corto (ma*) avisa', lv({ blocks: [{ name: 'x', terms: [{ t: 'ma*' }, { t: 'y' }] }] }).some(x => /menos de 4/.test(x.msg[0])));
  check('operador dentro de un término es error', lv({ blocks: [{ name: 'x', terms: [{ t: 'maize OR corn' }, { t: 'y' }] }] }).some(x => x.level === 'bad'));
  check('término cubierto por un truncado', lv({ blocks: [{ name: 'x', terms: [{ t: 'yields' }, { t: 'yield*' }] }] }).some(x => /cubierto/.test(x.msg[0])));
  check('bloque de un solo término avisa', lv({ blocks: [{ name: 'x', terms: [{ t: 'maize' }] }] }).some(x => /un solo término/.test(x.msg[0])));
  check('sin campos: avisa que se quitó el asterisco', lv({ blocks: [{ name: 'x', terms: [{ t: 'yield*' }, { t: 'grain' }] }] }, 'plain').some(x => /asterisco/.test(x.msg[0])));
  const long = { blocks: [{ name: 'x', terms: Array.from({ length: 30 }, (_, i) => ({ t: 'terminolargo' + i })) }] };
  check('sin campos: cadena de más de 256 caracteres avisa', lv(long, 'plain').some(x => /256/.test(x.msg[0])));

  section('Ejecutar la estrategia sobre registros');
  const R = (title, abstract, kw) => ({ title, abstract: abstract || '', keywords: kw || [] });
  const Q = { blocks: [{ field: 'tiab', terms: [{ t: 'maize' }, { t: 'zea mays' }] }, { field: 'tiab', terms: [{ t: 'mycorrhiz*' }] }], not: { terms: [] } };
  check('truncamiento: mycorrhiz* encuentra «mycorrhizal»', Search.matches(Q, R('Maize and mycorrhizal fungi')));
  check('frase con guion o espacio: «Zea-mays»', Search.matches(Q, R('Zea-mays roots', 'mycorrhizae')));
  check('palabra completa: «maizefield» no es «maize»', !Search.matches(Q, R('maizefield mycorrhizal')));
  check('sin acentos: «maíz» con término «maiz»', Search.matches({ blocks: [{ terms: [{ t: 'maiz' }] }] }, R('Rendimiento de maíz')));
  check('las palabras clave cuentan en tiab', Search.matches(Q, R('A field study', '', ['maize', 'mycorrhiza'])));
  check('solo título ignora el resumen', !Search.matches({ blocks: [{ field: 'ti', terms: [{ t: 'maize' }] }] }, R('Field study', 'maize')));
  check('NOT excluye', !Search.matches({ blocks: Q.blocks, not: { terms: [{ t: 'greenhouse' }] } }, R('Maize mycorrhizal greenhouse')));
  check('comodín ? = una letra: «fertili?ation»', Search.matches({ blocks: [{ terms: [{ t: 'fertili?ation' }] }] }, R('fertilization')) && Search.matches({ blocks: [{ terms: [{ t: 'fertili?ation' }] }] }, R('fertilisation')));

  /* ---------------- parsers against the truth ---------------- */
  section('Importadores: los seis archivos de prueba');
  const files = Samples.files();
  const parsed = files.map(f => Object.assign(Records.parse(f.text, f.name), { f }));
  check('formato reconocido en los seis', parsed.map(p => p.format).join(',') === 'ris,tagged,medline,bib,csv,enw', parsed.map(p => p.format).join(','));
  check('registros por archivo: 16, 12, 5, 4, 4, 2', parsed.map(p => p.records.length).join(',') === Samples.TRUTH.perFile.join(','), parsed.map(p => p.records.length).join(','));
  const W = id => Samples.WORKS.find(w => w[0] === id);
  const find = (p, id) => p.records.find(r => r.accession === id);
  let allOk = true, detail = [];
  parsed.forEach(p => p.records.forEach(r => {
    const w = W(r.accession);
    if (!w) { allOk = false; detail.push(p.f.name + ': sin id ' + r.accession); return; }
    if (r.year !== w[3] && !(r.accession === 'W10' && p.format === 'csv')) { allOk = false; detail.push(`${r.accession} año ${r.year}`); }
    if (r.authors.length !== w[2].length) { allOk = false; detail.push(`${r.accession} autores ${r.authors.length}`); }
    if (!r.abstract || r.abstract.length < 40) { allOk = false; detail.push(`${r.accession} resumen`); }
  }));
  check('cada registro trae su obra, año, número de autores y resumen', allOk, detail.slice(0, 5).join('; '));
  const ris = parsed[0];
  check('RIS: resumen partido en dos líneas se reúne', find(ris, 'W03').abstract === Samples.rec('W03').abstract);
  check('RIS: páginas SP–EP, volumen, número, DOI y palabras clave', (r => r.pages === '211–224' && r.volume === '41' && r.issue === '3' && r.doi === '10.5555/rp.2019.0101' && r.keywords.length === 4)(find(ris, 'W01')));
  check('RIS: autores con acentos intactos', find(ris, 'W01').authors[0] === 'Ramírez Soto, Laura');
  const tg = parsed[1];
  check('etiquetado: título partido en líneas y en MAYÚSCULAS se conserva completo', find(tg, 'W03').title === Samples.rec('W03').title.toUpperCase());
  check('etiquetado: nombres completos (AF) preferidos a iniciales', find(tg, 'W01').authors[0] === 'Ramirez Soto, Laura');
  check('etiquetado: resumen de varias líneas completo', find(tg, 'W04').abstract === Samples.rec('W04').abstract);
  check('etiquetado: páginas BP–EP', find(tg, 'W04').pages === '501–515');
  const md = parsed[2];
  check('MEDLINE: DOI desde «LID - … [doi]»', find(md, 'W07').doi === '10.5555/rp.2016.0707' && find(md, 'W02').doi === '');
  check('MEDLINE: año desde «DP - 2016 Mar», nombres completos (FAU)', find(md, 'W07').year === 2016 && find(md, 'W07').authors[0] === 'Becker, Hanna');
  check('MEDLINE: título y resumen con continuación de 6 espacios', find(md, 'W23').title === Samples.rec('W23').title && find(md, 'W23').abstract === Samples.rec('W23').abstract);
  const bb = parsed[3];
  check('BibTeX: acentos LaTeX → Unicode («Inoculación micorrízica…»)', find(bb, 'W25').title === Samples.rec('W25').title, find(bb, 'W25').title);
  check('BibTeX: autor con {\\\'A} y {\\~n} → «Pérez Núñez, Ángel»', find(bb, 'W27').authors[0] === 'Pérez Núñez, Ángel', find(bb, 'W27').authors[0]);
  check('BibTeX: llaves anidadas {{M}aize…} y título entre comillas', find(bb, 'W08').title === 'Maize grain yield after mycorrhizal inoculation - a three-season field study' && find(bb, 'W26').title === Samples.rec('W26').title);
  check('BibTeX: tipos tesis e informe', find(bb, 'W25').type === 'thesis' && find(bb, 'W26').type === 'report');
  check('BibTeX: institución como fuente, páginas «--» → «–»', find(bb, 'W26').journal === 'Informe técnico 14' && find(bb, 'W08').pages === '401–412');
  const cs = parsed[4];
  check('CSV: encabezados en español reconocidos (Título, Año, Resumen, Palabras clave)', ['title', 'year', 'abstract', 'keywords', 'authors', 'journal', 'doi', 'accession'].every(k => cs.info.map[k] != null));
  check('CSV: separador «;» detectado y BOM ignorado', cs.info.delim === ';' && cs.records[0].accession === 'W09');
  check('CSV: autores separados por «;» dentro de comillas', find(cs, 'W28').authors.length === 2);
  const en = parsed[5];
  check('etiquetas %: «&» en el título se conserva', find(en, 'W11').title.includes('&'));
  check('etiquetas %: DOI, volumen y palabras clave', find(en, 'W30').doi === '10.5555/rp.2012.3030' && find(en, 'W30').volume === '34' && find(en, 'W30').keywords.length === 2);

  section('Casos límite de los importadores');
  const csvEdge = 'Title,Authors,Year,Abstract\r\n"A title, with a comma","Doe, J; Roe, K",2020,"Line one\nline two with ""quotes"""\r\nSecond,X,1999,\r\n';
  const ce = Records.parseCSV(csvEdge);
  check('CSV RFC 4180: coma, salto de línea y comillas dobles dentro de un campo', ce.records.length === 2 && ce.records[0].title === 'A title, with a comma' && ce.records[0].abstract === 'Line one line two with "quotes"' && ce.records[0].authors.length === 2);
  check('TSV detectado', Records.parseCSV('title\tyear\nX\t2001\n').delim === '\t');
  check('DOI normalizado desde URL y prefijo «doi:»', Records.normDoi('https://doi.org/10.1000/ABC.1') === '10.1000/abc.1' && Records.normDoi('doi: 10.1000/x.') === '10.1000/x' && Records.normDoi('nada') === '');
  check('LaTeX: \\"u, \\c{c}, \\ss, --- y \\&', Records.latex('M{\\"u}ller Gon{\\c{c}}alves Stra\\ss e A---B R\\&D') === 'Müller Gonçalves Straße A—B R&D', Records.latex('M{\\"u}ller Gon{\\c{c}}alves Stra\\ss e A---B R\\&D'));
  check('RIS con finales de línea CR sueltos y sin ER final', Records.parseRIS('TY  - JOUR\rTI  - X\rPY  - 2001').length === 1);
  check('archivo vacío o irreconocible no rompe', Records.parse('', 'x.csv').records.length === 0 && Records.parse('hola mundo', 'x.txt').records.length === 0);
  const back = Records.parseRIS(Records.toRIS(ris.records));
  check('ida y vuelta RIS: lo exportado se relee idéntico', back.length === 16 && back.every((r, i) => ['title', 'year', 'doi', 'abstract', 'journal', 'pages', 'volume', 'issue'].every(k => r[k] === ris.records[i][k]) && r.authors.join('|') === ris.records[i].authors.join('|') && r.keywords.join('|') === ris.records[i].keywords.join('|')));
  const backCsv = Records.parseCSV(Records.toCSV(ris.records)).records;
  check('ida y vuelta CSV', backCsv.length === 16 && backCsv.every((r, i) => r.title === ris.records[i].title && r.abstract === ris.records[i].abstract && r.authors.join('|') === ris.records[i].authors.join('|')));

  /* ---------------- deduplication against the truth ---------------- */
  section('Duplicados contra la verdad');
  const recs = [];
  parsed.forEach((p, fi) => p.records.forEach((r, i) => recs.push(Object.assign({}, r, { uid: `f${fi}:${i}`, src: p.f.source, order: recs.length }))));
  const d = Dedup.run(recs, {});
  const T = Samples.TRUTH;
  check('43 registros, 12 duplicados seguros fusionados, 31 únicos', recs.length === T.records && d.removed === T.certain && d.unique.length === T.records - T.certain, `${recs.length} / ${d.removed} / ${d.unique.length}`);
  const works = cl => [...new Set(cl.map(i => recs[i].accession))];
  check('ningún grupo mezcla obras distintas (precisión 100 %)', d.clusters.every(cl => works(cl).length === 1));
  const prob = d.pairs.filter(p => p.kind === 'probable').map(p => [recs[p.i].accession, recs[p.j].accession].sort().join('~'));
  check('exactamente dos pares probables: la errata (W09) y el título repetido (W27/W28)', prob.length === 2 && prob.includes('W09~W09') && prob.includes('W27~W28'), prob.join(', '));
  const pW09 = d.pairs.find(p => recs[p.i].accession === 'W09' && p.kind === 'probable');
  const pW27 = d.pairs.find(p => recs[p.i].accession === 'W27' || recs[p.j].accession === 'W27');
  const d2 = Dedup.run(recs, { [pW09.key]: 'dup', [pW27.key]: 'not' });
  check('tras decidir los dos pares: 30 obras, una por grupo (recall 100 %)', d2.unique.length === T.works && d2.clusters.every(cl => works(cl).length === 1) && new Set(d2.clusters.map(cl => works(cl)[0])).size === 30);
  check('sin decidir, un par probable no se fusiona', d.clusters.some(cl => works(cl)[0] === 'W09' && cl.length === 1));
  const w02 = d.unique.find(r => r.accession === 'W02');
  check('W02 llega de tres bases y queda uno, con el DOI que le faltaba a MEDLINE', w02 && w02.uids.length === 3 && w02.doi === '10.5555/rp.2021.0202' && w02.srcs.length === 3);
  check('se conserva el registro más completo', d.unique.every(u => u.abstract));
  /* the blocked search must find every pair the brute force finds */
  const brute = [];
  for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) { const v = Dedup.compare(recs[i], recs[j]); if (v.kind !== 'none') brute.push(i + ':' + j + ':' + v.kind); }
  const blocked = d.pairs.map(p => p.i + ':' + p.j + ':' + p.kind);
  check('los bloques de claves no pierden ningún par (contra comparación de todos contra todos)', brute.length === blocked.length && brute.every(x => blocked.includes(x)), `${brute.length} pares por fuerza bruta, ${blocked.length} con bloques`);

  section('Reglas de duplicado');
  const A = (o) => Object.assign({ title: 'Maize yield after inoculation', authors: ['Smith, J'], year: 2019, doi: '' }, o);
  check('mismo DOI → seguro aunque el título difiera', Dedup.compare(A({ doi: '10.1/x' }), A({ doi: '10.1/x', title: 'Otro' })).kind === 'certain');
  check('DOI distintos con títulos distintos → no', Dedup.compare(A({ doi: '10.1/x' }), A({ doi: '10.1/y', title: 'Maize yield after inoculations' })).kind === 'none');
  check('DOI distintos con título idéntico → probable (p. ej., fe de erratas)', Dedup.compare(A({ doi: '10.1/x' }), A({ doi: '10.1/y' })).kind === 'probable');
  check('año ±1 → seguro; ±2 → probable', Dedup.compare(A(), A({ year: 2020 })).kind === 'certain' && Dedup.compare(A(), A({ year: 2021 })).kind === 'probable');
  check('primer autor distinto → probable', Dedup.compare(A(), A({ authors: ['Jones, K'] })).kind === 'probable');
  check('«&» = «and», mayúsculas, puntuación y artículo inicial', Dedup.normTitle('The Maize & Beans: A Test.') === Dedup.normTitle('maize and beans - a test'));
  check('Dice de bigramas: idénticos 1, sin letras en común 0', Dedup.dice('abcd', 'abcd') === 1 && Dedup.dice('abcd', 'wxyz') === 0);
  check('Dice de «night» y «nacht» = 0.25 (valor de libro)', Math.abs(Dedup.dice('night', 'nacht') - 0.25) < 1e-12);

  section('Rendimiento');
  (function () {
    /* realistic: 4,000 distinct titles from a 3,000-word vocabulary, 360 of them re-exported in capitals and without DOI */
    const r = rng(5), vocab = Array.from({ length: 3000 }, (_, i) => (i * 7919 + 1000).toString(36) + 'q');
    const real = [];
    for (let i = 0; i < 3640; i++) real.push({ uid: 'a' + i, title: Array.from({ length: 9 }, () => vocab[Math.floor(r() * 3000)]).join(' '), authors: ['Autor' + (i % 900) + ', A'], year: 1990 + (i % 35), doi: r() < 0.6 ? '10.9/' + i : '', abstract: 'x' });
    for (let i = 0; i < 360; i++) { const o = real[i * 10]; real.push(Object.assign({}, o, { uid: 'd' + i, title: o.title.toUpperCase(), doi: '' })); }
    let t0 = performance.now();
    const res = Dedup.run(real, {});
    let ms = performance.now() - t0;
    check('4,000 registros realistas se deduplican en menos de 1.5 s', ms < 1500, `${fmtFixed(ms, 0)} ms`);
    check('y se encuentran los 360 duplicados sembrados', res.removed === 360, String(res.removed));
    /* worst case: every record a near-copy of about 130 others */
    const big = [];
    for (let i = 0; i < 4000; i++) { const w = Samples.WORKS[Math.floor(r() * 30)]; big.push({ uid: 'b' + i, title: w[1] + ' ' + Math.floor(r() * 1e6).toString(36), authors: w[2], year: w[3], doi: '', abstract: 'x' }); }
    t0 = performance.now();
    const res2 = Dedup.run(big, {});
    ms = performance.now() - t0;
    check('peor caso (4,000 casi-copias de 30 títulos) termina en menos de 8 s', ms < 8000, `${fmtFixed(ms, 0)} ms, ${res2.pairs.length} pares para revisar`);
  })();

  section('Estrategia de ejemplo y estudios conocidos');
  const uniq = d2.unique;
  const run = Search.run(Samples.STRATEGY, uniq);
  check('la estrategia del ejemplo recupera las obras relevantes y deja fuera la de tomate, la de biochar y la de microbioma', ['W12', 'W16', 'W15'].every(id => !run.idx.some(i => uniq[i].accession === id)) && ['W01', 'W03', 'W25'].every(id => run.idx.some(i => uniq[i].accession === id)), `${run.total} recuperados`);
  const g = Search.goldCheck(Samples.STRATEGY, uniq, Samples.GOLD);
  check('los cuatro estudios conocidos se encuentran y se recuperan', g.length === 4 && g.every(x => x.found && x.retrieved));
  const weak = JSON.parse(JSON.stringify(Samples.STRATEGY)); weak.blocks[0].terms = [{ t: 'maize', on: true }];
  const gw = Search.goldCheck(weak, uniq, Samples.GOLD);
  check('sin «maíz» en el bloque, la tesis en español se pierde y se señala el bloque que falla', gw.find(x => /Chiapas/.test(x.g.title || '')).retrieved === false && gw.find(x => /Chiapas/.test(x.g.title || '')).failing[0] === 0);
  const seeded = Search.seedBlocks(Protocol.normalize(JSON.parse(JSON.stringify(Examples.meta.protocol))));
  check('bloques propuestos desde la pregunta: P, I y O (sin comparador)', seeded.map(b => b.facet).join('') === 'PIO' && seeded.every(b => b.terms.length > 0));
})();
