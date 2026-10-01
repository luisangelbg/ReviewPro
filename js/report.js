/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 10 engine: figures, report and package.

   Pure pieces the block assembles:
   1. status(summary, type): how far each block is, against what the review
      type requires (a narrative review does not need risk of bias; a
      meta-analysis needs everything).
   2. md(text): the small Markdown the other blocks already write (headings,
      tables, bold, lists) turned into HTML for the report.
   3. csv(text): a CSV file read back into rows, with quotes.
   4. pathSafe(name) and manifest(files): the names inside the package, unique
      and portable (no characters that break a path on any system).
   5. readme(files, info, L): the text file that says what is in the package
      and how to reopen the project. */

const Report = {};

(function () {
  const t2 = (L, es, en) => (L === 'en' ? en : es);

  /* ---------- 1 · project status ----------
     summary: {protocol: 0..1, search, screening, fulltext, extraction, appraisal, synthesis, writing}
     (the fraction each block has done; null = not started) */
  const BLOCKS = [
    [2, 'protocol', ['Protocolo', 'Protocol']], [3, 'search', ['Búsqueda', 'Search']], [4, 'screening', ['Cribado', 'Screening']],
    [5, 'fulltext', ['Texto completo', 'Full text']], [6, 'extraction', ['Extracción', 'Extraction']], [7, 'appraisal', ['Calidad y sesgo', 'Quality and bias']],
    [8, 'synthesis', ['Síntesis', 'Synthesis']], [9, 'writing', ['Escritura', 'Writing']],
  ];
  function status(summary, req, opt) {
    const rows = BLOCKS.map(([n, key, name]) => {
      const need = req.includes(n) ? 'req' : opt.includes(n) ? 'opt' : 'na';
      const f = summary[key] == null ? 0 : Math.max(0, Math.min(1, +summary[key]));
      const st = f >= 0.999 ? 'done' : f > 0 ? 'partial' : 'empty';
      return { n, key, name, need, f, st };
    });
    const reqRows = rows.filter(r => r.need === 'req');
    const overall = reqRows.length ? reqRows.reduce((a, r) => a + r.f, 0) / reqRows.length : 1;
    const blocking = reqRows.filter(r => r.st !== 'done').map(r => r.n);
    return { rows, overall, ready: blocking.length === 0, blocking };
  }

  /* ---------- 2 · Markdown → HTML ---------- */
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const inline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const cells = line => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
  function md(text, shift) {
    const lines = String(text || '').replace(/\r/g, '').split('\n'), out = [], sh = shift || 0;
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      const h = l.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const n = Math.min(6, h[1].length + sh); out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
      if (/^\s*\|/.test(l)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
        const body = rows.filter(r => !/^[\s|:-]+$/.test(r));
        const head = cells(body.shift() || '');
        out.push(`<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
        continue;
      }
      if (/^\s*[-*]\s+/.test(l)) {
        const it = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { it.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
        out.push(`<ul>${it.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`);
        continue;
      }
      if (/^```/.test(l)) {
        const it = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { it.push(lines[i]); i++; }
        i++; out.push(`<pre>${esc(it.join('\n'))}</pre>`); continue;
      }
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*\||\s*[-*]\s+|```)/.test(lines[i])) { para.push(lines[i].trim()); i++; }
      out.push(`<p>${inline(para.join(' '))}</p>`);
    }
    return out.join('\n');
  }

  /* ---------- 3 · CSV → rows ---------- */
  function csv(text) {
    const s = String(text || '').replace(/^\uFEFF/, ''), rows = [];
    let row = [], f = '', q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows.filter(r => r.length > 1 || r[0] !== '');
  }

  /* ---------- 4 · names inside the package ---------- */
  function pathSafe(name) {
    return String(name || 'archivo').split('/').map(p => p.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+\./g, '.').replace(/_+/g, '_').replace(/^[._]+|[._]+$/g, '').slice(0, 80) || 'x').join('/');
  }
  function manifest(files) {
    const seen = new Map();
    return files.map(f => {
      let n = pathSafe(f.name);
      if (seen.has(n.toLowerCase())) { const k = seen.get(n.toLowerCase()) + 1; seen.set(n.toLowerCase(), k); n = n.replace(/(\.[^./]+)?$/, m => `_${k}${m}`); }
      else seen.set(n.toLowerCase(), 1);
      return Object.assign({}, f, { name: n });
    });
  }

  /* ---------- 5 · the read-me of the package ---------- */
  function readme(files, info, L) {
    const t = (es, en) => t2(L, es, en);
    const lines = [
      `ReviewPro ${info.version} — ${info.title || t('Revisión sin título', 'Untitled review')}`,
      `${t('Tipo de revisión', 'Review type')}: ${info.type}`,
      `${t('Generado', 'Generated')}: ${info.date}`,
      '',
      t('CONTENIDO', 'CONTENTS'),
      ...files.map(f => `  ${f.name}${f.desc ? '  —  ' + f.desc : ''}`),
      '',
      t('CÓMO REABRIR EL PROYECTO', 'HOW TO REOPEN THE PROJECT'),
      t('  Abre ReviewPro (index.html), pulsa «Abrir proyecto» y elige el archivo .reviewpro.json de la carpeta proyecto/.', '  Open ReviewPro (index.html), press "Open project" and choose the .reviewpro.json file in the proyecto/ folder.'),
      t('  Ese archivo contiene todo: protocolo, búsqueda, decisiones, extracción, evaluación, síntesis y el texto del manuscrito.', '  That file holds everything: protocol, search, decisions, extraction, appraisal, synthesis and the manuscript text.'),
      t('  Los PDF de los estudios no van en el paquete: el proyecto solo guarda dónde está cada uno.', '  The PDFs of the studies are not in the package: the project only stores where each one is.'),
      '',
    ];
    return lines.join('\r\n');
  }

  Object.assign(Report, { BLOCKS, status, md, csv, pathSafe, manifest, readme, esc });
  window.Report = Report;
})();
