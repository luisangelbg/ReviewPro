/* ReviewPro — tests of Block 10 (figures, report and package).

   References: the required and optional blocks of each review type (Block 1),
   hand-made Markdown and CSV cases (including quoted commas, doubled quotes
   and line breaks inside a field, RFC 4180), and a package built and read
   back with the zip reader. */
(function () {
  const { section, check } = TT;
  const R = Report;

  section('Estado del proyecto según el tipo de revisión');
  const full = { protocol: 1, search: 1, screening: 1, fulltext: 1, extraction: 1, appraisal: 1, synthesis: 1, writing: 1 };
  const meta = Home.TYPES.meta, nar = Home.TYPES.narrative;
  const s1 = R.status(full, meta.req, meta.opt);
  check('todo completo → listo, 100 %, sin pendientes', s1.ready && s1.overall === 1 && !s1.blocking.length);
  const s2 = R.status(Object.assign({}, full, { appraisal: 0, writing: 0.5 }), meta.req, meta.opt);
  check('meta-análisis sin evaluación de sesgo → no listo; pendientes 7 y 9', !s2.ready && s2.blocking.join() === '7,9', s2.blocking.join());
  const nReq = meta.req.filter(n => n >= 2 && n <= 9).length;
  check('avance = promedio de lo necesario (bloques de trabajo 2 a 9)', Math.abs(s2.overall - (nReq - 1.5) / nReq) < 1e-12);
  const s3 = R.status(Object.assign({}, full, { appraisal: 0, screening: 0 }), nar.req, nar.opt);
  check('narrativa: el cribado y la evaluación de sesgo son opcionales, no bloquean', s3.ready && s3.rows.find(r => r.n === 7).need === 'opt');
  check('valores fuera de rango se acotan; nulo = sin empezar', (() => { const s = R.status({ protocol: 1.4, search: null, screening: -2 }, [2, 3, 4], []); return s.rows[0].f === 1 && s.rows[1].st === 'empty' && s.rows[2].f === 0; })());
  check('ocho bloques de trabajo (2 a 9)', s1.rows.map(r => r.n).join() === '2,3,4,5,6,7,8,9');

  section('Markdown de los bloques → HTML del informe');
  const h = R.md('# Título\n\nUn **dato** y *nota* con `x<y`.\n\n| Paso | n |\n|---|---|\n| Cribados | 31 |\n| A \\| B | 2 |\n\n- uno\n- dos\n\n```\nTS=(maíz)\n```');
  check('encabezado, negrita, cursiva y código escapado', /<h1>Título<\/h1>/.test(h) && /<b>dato<\/b>/.test(h) && /<i>nota<\/i>/.test(h) && /<code>x&lt;y<\/code>/.test(h));
  check('tabla: encabezado, sin la fila separadora, barra escapada dentro de una celda', /<th>Paso<\/th><th>n<\/th>/.test(h) && /<td>Cribados<\/td><td>31<\/td>/.test(h) && /<td>A \| B<\/td>/.test(h) && !/---/.test(h));
  check('listas y bloque de código', /<ul><li>uno<\/li><li>dos<\/li><\/ul>/.test(h) && /<pre>TS=\(maíz\)<\/pre>/.test(h));
  check('desplazar niveles de encabezado', /<h3>/.test(R.md('## Sub', 1)));
  check('el HTML del texto se escapa (nada se inyecta)', !/<script>/.test(R.md('<script>alert(1)</script>')));

  section('CSV leído de vuelta (RFC 4180)');
  const c = R.csv('﻿a,b,c\r\n1,"x, y","dijo ""hola"""\r\n2,"dos\nlíneas",\r\n');
  check('marca BOM fuera, tres filas, tres columnas', c.length === 3 && c.every(r => r.length === 3) && c[0][0] === 'a');
  check('coma, comillas dobladas y salto de línea dentro de un campo', c[1][1] === 'x, y' && c[1][2] === 'dijo "hola"' && c[2][1] === 'dos\nlíneas' && c[2][2] === '');

  section('Nombres dentro del paquete');
  check('sin acentos ni caracteres prohibidos, espacios → _', R.pathSafe('figuras/Figura 1: ¿Qué?.svg') === 'figuras/Figura_1_Que.svg', R.pathSafe('figuras/Figura 1: ¿Qué?.svg'));
  const m = R.manifest([{ name: 'a/x.csv' }, { name: 'a/X.csv' }, { name: 'a/x.csv' }, { name: 'b/y' }]);
  check('nombres repetidos (sin distinguir mayúsculas) se numeran', m.map(f => f.name).join() === 'a/x.csv,a/X_2.csv,a/x_3.csv,b/y', m.map(f => f.name).join());
  const rd = R.readme(m, { version: '0.1.0', title: 'T', type: 'Meta-análisis', date: '2026-09-27' }, 'es');
  check('LÉEME: lista cada archivo y explica cómo reabrir', m.every(f => rd.includes(f.name)) && /reviewpro\.json/.test(rd) && /PDF/.test(rd));

  (window.TT_WAIT = window.TT_WAIT || []).push((async () => {
    const files = [{ name: 'LEEME.txt', data: '﻿' + rd }, { name: 'proyecto/p.reviewpro.json', data: JSON.stringify({ format: 'reviewpro-project', a: 'ñ' }) }, { name: 'figuras/f.png', data: new Uint8Array([137, 80, 78, 71, 1, 2, 3]) }];
    const buf = await (await Zip.build(files)).arrayBuffer();
    TT.section('Paquete .zip armado y leído de vuelta');
    const ls = Zip.list(buf);
    check('tres entradas con sus rutas', ls.length === 3 && ls.map(e => e.name).join() === 'LEEME.txt,proyecto/p.reviewpro.json,figuras/f.png');
    const js = JSON.parse(new TextDecoder().decode(await Zip.extract(buf, ls[1])));
    check('el proyecto sale intacto (UTF-8 incluido)', js.format === 'reviewpro-project' && js.a === 'ñ');
    const png = await Zip.extract(buf, ls[2]);
    check('los binarios salen byte por byte', png.length === 7 && png[0] === 137 && png[6] === 3);
  })().catch(e => check('paquete .zip', false, e.message)));
})();
(function () {
  const { section, check } = TT;
  section('Proyecto de ejemplo completo (el del manual)');
  const D = window.DEMO_PROJECT;
  check('formato de proyecto y tipo meta-análisis', D && D.format === Project.FORMAT && D.reviewType === 'meta' && D.protocol.type === 'meta');
  check('seis archivos de prueba importados y dos revisores', D.search.files.length === 6 && D.screening.reviewers.length === 2);
  const rows = Object.values(Object.values(D.extraction.effects)[0]).flat();
  check('41 comparaciones con medias, DE y repeticiones de los dos grupos', rows.length === 41 && rows.every(r => r.T.mean > 0 && r.C.mean > 0 && r.T.n >= 3 && r.T.disp.value > 0 && r.C.disp.value > 0));
  const y = rows.map(r => Math.log(r.T.mean / r.C.mean)), se = rows.map(r => Math.sqrt(r.T.disp.value ** 2 / (r.T.n * r.T.mean ** 2) + r.C.disp.value ** 2 / (r.C.n * r.C.mean ** 2)));
  const m = a => a.reduce((s, x) => s + x, 0) / a.length, my = m(y), ms = m(se);
  const r = y.reduce((s, v, i) => s + (v - my) * (se[i] - ms), 0) / Math.sqrt(y.reduce((s, v) => s + (v - my) ** 2, 0) * se.reduce((s, v) => s + (v - ms) ** 2, 0));
  check('el error estándar no está atado al efecto (|r| < 0.5): el embudo no tiene asimetría artificial', Math.abs(r) < 0.5, `r = ${r.toFixed(2)}`);
  check('manuscrito de ejemplo con citas y datos vivos', /\[@/.test(D.writing.text.intro) && /\{\{effect:/.test(D.writing.text.r_synth));
  check('sin rutas locales ni correos reales', !/[A-Z]:\\/.test(JSON.stringify(D)) && (JSON.stringify(D).match(/[\w.-]+@[\w.-]+/g) || []).every(e => /ejemplo\.org$/.test(e)));
})();
(function () {
  const { section, check } = TT;
  section('Estudios incluidos en BibTeX y RIS (ida y vuelta con los importadores del Bloque 3)');
  const recs = [
    Object.assign(Records.blank(), { type: 'article', title: 'Respuesta del maíz a 50 % de P & micorrizas', authors: ['Gómez, Rosa', 'Salas, Emilio'], year: '2019', journal: 'Revista de Ciencias_Agrícolas', volume: '12', issue: '3', pages: '101–115', doi: '10.5555/x.1', keywords: ['maíz', 'AMF'] }),
    Object.assign(Records.blank(), { type: 'thesis', title: 'Inoculantes nativos', authors: ['Pérez Núñez, Ana'], year: '2012', journal: 'Universidad Autónoma Chapingo' }),
  ];
  const bib = Records.toBib(recs, ['Gomez2019', 'PerezNunez2012']);
  const back = Records.parseBib(bib);
  check('dos entradas con las claves del manuscrito y el tipo correcto', /@article\{Gomez2019,/.test(bib) && /@phdthesis\{PerezNunez2012,/.test(bib) && back.length === 2);
  check('título con %, & y acentos intacto al releer', back[0].title === recs[0].title, back[0].title);
  check('autores, año, revista con guion bajo, volumen, número, páginas y DOI', back[0].authors.join('|') === 'Gómez, Rosa|Salas, Emilio' && String(back[0].year) === '2019' && back[0].journal === 'Revista de Ciencias_Agrícolas' && back[0].volume === '12' && back[0].issue === '3' && /101/.test(back[0].pages) && back[0].doi === '10.5555/x.1');
  check('la tesis guarda la institución y el tipo', back[1].type === 'thesis' && /Chapingo/.test(Records.toBib([back[1]])));
  const ris = Records.parseRIS(Records.toRIS(recs));
  check('RIS de ida y vuelta: título, autores, DOI y tipo', ris.length === 2 && ris[0].title === recs[0].title && ris[0].authors.length === 2 && ris[0].doi === '10.5555/x.1' && ris[1].type === 'thesis');
})();
(function () {
  const { section, check } = TT;
  section('Registros incompletos (agregados a mano) al exportar');
  const r = { title: 'Solo título', year: 2023 };
  let ok = true; try { Records.toRIS([r]); Records.toBib([r]); Records.toCSV([r]); } catch (e) { ok = false; }
  check('un registro sin autores ni palabras clave no rompe RIS, BibTeX ni CSV', ok);
})();
