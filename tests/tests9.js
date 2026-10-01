/* ReviewPro — tests of Block 9 (guided writing).

   References: the published checklists (PRISMA 2020, Page et al. 2021: 27
   items, 42 counting sub-items; PRISMA-ScR, Tricco et al. 2018: 22 items;
   SANRA, Baethge et al. 2019: 6 items), hand-made citation cases, and the
   Office Open XML package read back with the zip reader and the browser's
   own XML parser. */
(function () {
  const { section, check } = TT;
  const Wr = Writing;

  section('Esqueletos y listas de verificación');
  const ids = t => Wr.outline(t).map(s => s.id);
  check('meta-análisis: riesgo de sesgo, sesgo de publicación y certeza', ['m_rob', 'm_cert', 'r_bias', 'r_cert'].every(i => ids('meta').includes(i)));
  check('sistemática: sin sección de sesgo de publicación propia', ids('systematic').includes('r_cert') && !ids('systematic').includes('r_bias'));
  check('exploratoria: sin riesgo de sesgo ni GRADE; «caracterización de los datos»', !ids('scoping').includes('m_rob') && !ids('scoping').includes('m_cert') && Wr.outline('scoping').find(s => s.id === 'm_extract').t[1] === 'Data charting');
  check('narrativa: temas libres, sin Métodos/Resultados formales', ['body1', 'body2', 'body3'].every(i => ids('narrative').includes(i)) && !ids('narrative').includes('results'));
  check('PRISMA 2020: 42 renglones y 27 puntos', Wr.PRISMA2020.length === 42 && new Set(Wr.PRISMA2020.map(i => i.id.replace(/[a-f]$/, ''))).size === 27);
  check('PRISMA 2020: subpuntos 10a–b, 13a–f, 16a–b, 20a–d, 23a–d y 24a–c', ['10a', '10b', '13a', '13f', '16a', '16b', '20a', '20d', '23a', '23d', '24a', '24c'].every(i => Wr.PRISMA2020.some(x => x.id === i)));
  check('PRISMA-ScR: 22 puntos; SANRA: 6', Wr.PRISMASCR.length === 22 && Wr.SANRA.length === 6);
  check('la lista se elige por tipo', Wr.checklist('meta').id === 'prisma2020' && Wr.checklist('systematic').id === 'prisma2020' && Wr.checklist('scoping').id === 'prismascr' && Wr.checklist('narrative').id === 'sanra');
  check('cada punto señala una sección que existe en su esqueleto (o en el del meta-análisis)', Wr.PRISMA2020.every(i => ids('meta').includes(i.sec)) && Wr.PRISMASCR.every(i => ids('scoping').includes(i.sec)) && Wr.SANRA.every(i => ids('narrative').includes(i.sec)));

  section('Citas autor–año');
  const A = { authors: ['García, Juan'], year: 2019, title: 'Uno.', journal: 'Agrociencia', volume: 53, issue: 2, pages: '1-9', doi: '10.1/x' };
  const B = { authors: ['Pérez, Ana', 'López, Luis'], year: 2020, title: 'Dos' };
  const C = { authors: ['Smith, J.', 'Doe, A.', 'Roe, B.'], year: 2021, title: 'Tres' };
  const D = { authors: ['Maria Silva'], year: '', title: 'Cuatro' };
  check('uno, dos y tres o más autores', Wr.authorYear(A) === 'García 2019' && Wr.authorYear(B) === 'Pérez & López 2020' && Wr.authorYear(C) === 'Smith et al. 2021');
  check('nombre sin coma → apellido al final; sin año → s.f.', Wr.authorYear(D) === 'Silva s.f.' && Wr.authorYear({ authors: [], year: 2000 }) === 'Anónimo 2000');
  check('ficha de referencia completa', Wr.refEntry(A) === 'García, J. (2019). Uno. Agrociencia, 53(2), 1-9. https://doi.org/10.1/x', Wr.refEntry(A));
  const ctx = {
    study: k => ({ garcia2019: A, perez2020: B, smith2021: C })[k.toLowerCase()] || null,
    datum: (n, a) => (n === 'n.included' ? '20' : n === 'effect' && a === 'Rendimiento' ? '+12.0 %' : null),
    table: n => (n === 'sof' ? { head: ['a', 'b'], rows: [['1', '2']] } : null),
  };
  const r = Wr.render('Visto en [@Garcia2019; @Perez2020] y [@Smith2021]. Incluimos {{n.included}} estudios; efecto {{effect:Rendimiento}}. [@Nadie1999] {{k:Nada}}\n{{table:sof}}', ctx, 'es');
  check('varias claves en un corchete → un solo paréntesis separado por «;»', r.plain.startsWith('Visto en (García 2019; Pérez & López 2020) y (Smith et al. 2021).'), r.plain.slice(0, 70));
  check('las claves no distinguen mayúsculas y se registran las citadas', r.cites.size === 3);
  check('datos vivos resueltos', /Incluimos 20 estudios; efecto \+12\.0 %\./.test(r.plain));
  check('clave inexistente y dato sin valor quedan señalados', r.unknown.join() === 'Nadie1999' && r.badTok.join() === '{{k:Nada}}' && r.plain.includes('(?Nadie1999)'));
  check('las tablas se apartan como objetos', r.tables.length === 1 && /\u0000T0\u0000/.test(r.plain));
  check('cita y dato cuentan como una palabra', Wr.wordCount('Hay {{n.included}} estudios [@Garcia2019; @Perez2020].') === 4);
  check('referencias de métodos: se agregan solo si el texto las cita', Wr.methodRefs('Se siguió PRISMA (Page et al. 2021) y el ajuste de Knapp y Hartung (2003).').length === 2 && Wr.methodRefs('Sin citas de métodos.').length === 0);

  section('Verificador de afirmaciones');
  const flag = (sec, s) => Wr.checkClaims(sec, s).map(x => x.kind).join();
  check('cifra sin respaldo en Resultados → señalada', flag('r_synth', 'El rendimiento aumentó 25 % con el inoculante.') === 'unsupported');
  check('la misma cifra con cita → aceptada', flag('r_synth', 'El rendimiento aumentó 25 % con el inoculante [@Garcia2019].') === '');
  check('con un dato vivo → aceptada', flag('r_synth', 'El rendimiento aumentó {{effect:Rendimiento}}.') === '');
  check('conclusión sin cifra ni cita en la Discusión → señalada', flag('discussion', 'Los inoculantes mejoran el rendimiento del maíz.') === 'unsupported');
  check('recomendación sin respaldo → señalada', flag('discussion', 'La inoculación es una práctica recomendable para pequeños productores.') === 'unsupported');
  check('juicio de rentabilidad sin respaldo → señalado', flag('discussion', 'Los inoculantes comerciales son una inversión rentable para cualquier productor.') === 'unsupported');
  check('enunciar el objetivo o un límite no es una afirmación de resultados', flag('intro', 'El objetivo de esta revisión fue estimar el efecto medio de la inoculación.') === '' && flag('discussion', 'La evidencia tiene dos límites.') === '');
  check('remitir a una figura o tabla propia cuenta como respaldo', flag('r_rob', 'La mayoría de los estudios tuvo riesgo bajo (Figuras 4 y 5).') === '' && flag('r_synth', 'La respuesta fue mayor en suelos pobres (Tabla 2).') === '');
  check('los años no son cifras de resultados', flag('intro', 'Desde 2019 el tema recibe atención.') === '');
  check('en Métodos no se exige citar estudios', flag('m_synth', 'Se combinaron 45 efectos con un modelo multinivel.') === '');
  check('p sin efecto ni intervalo → señalado aparte', flag('r_synth', 'La diferencia fue significativa (p < 0.05) [@Garcia2019].') === 'ponly');
  check('p acompañado del efecto → aceptado', flag('r_synth', 'El efecto fue {{effect:Rendimiento}} (p < 0.001).') === '');
  check('«et al. 2019» no parte la oración', Wr.sentences('Lo mostró García et al. 2019 en campo. Otra oración.').length === 2);

  section('Estado de cada punto de la lista');
  const items = [{ id: 'a', sec: 's1', auto: 'yes' }, { id: 'b', sec: 's2', auto: 'yes' }, { id: 'c', sec: 's1', auto: 'no' }, { id: 'd', sec: 's2' }, { id: 'e', sec: 's2' }];
  const ev = Wr.evaluate(items, s => (s === 's1' ? 40 : 0), k => k === 'yes', { e: true });
  check('texto + datos = ok; datos sin texto; texto con datos faltantes; nada; marcado a mano', ev.map(e => e.status).join() === 'ok,data,text,missing,manual', ev.map(e => e.status).join());

  section('Documento de Word (.docx)');
  const files = Wr.docx([{ title: true, text: 'Título & <prueba>' }, { h: 1, text: 'Métodos' }, { p: 'Texto con "comillas" y ñ.' }, { table: { head: ['x', 'y'], rows: [['1', '2']], caption: 'Tabla 1.' } }, { p: 'García, J. (2019). Uno.', style: 'Reference' }], { title: 'T', author: 'L. Á. Barrera-Guzmán', lang: 'es' });
  const parser = new DOMParser();
  check('seis partes del paquete OOXML', files.map(f => f.name).sort().join() === '[Content_Types].xml,_rels/.rels,docProps/core.xml,word/_rels/document.xml.rels,word/document.xml,word/styles.xml');
  check('cada parte es XML bien formado', files.every(f => !parser.parseFromString(f.data, 'application/xml').querySelector('parsererror')));
  const doc = files.find(f => f.name === 'word/document.xml').data;
  check('caracteres especiales escapados y texto intacto', doc.includes('Título &amp; &lt;prueba&gt;') && doc.includes('&quot;comillas&quot; y ñ'));
  check('estilos de título, encabezado, tabla, leyenda y referencia', /w:val="Title"/.test(doc) && /w:val="Heading1"/.test(doc) && /<w:tbl>/.test(doc) && /w:val="Reference"/.test(doc) && /w:val="Caption"/.test(doc));
  const sty = files.find(f => f.name === 'word/styles.xml').data;
  check('todos los estilos usados están definidos', ['Title', 'Heading1', 'Heading2', 'Caption', 'TableText', 'Reference'].every(s => sty.includes(`w:styleId="${s}"`)));
  (window.TT_WAIT = window.TT_WAIT || []).push(Zip.build(files).then(b => b.arrayBuffer()).then(async buf => {
    TT.section('Documento de Word empaquetado (lectura de vuelta)');
    const ls = Zip.list(buf);
    check('el zip se lee de vuelta con sus seis partes', !!ls && ls.length === 6);
    const ent = ls.find(e => e.name === 'word/document.xml');
    const back = new TextDecoder().decode(await Zip.extract(buf, ent));
    check('document.xml sale idéntico al descomprimirlo', back === doc);
    check('empieza con la firma PK', new Uint8Array(buf)[0] === 0x50 && new Uint8Array(buf)[1] === 0x4b);
  }).catch(e => check('empaquetado del .docx', false, e.message)));
})();
