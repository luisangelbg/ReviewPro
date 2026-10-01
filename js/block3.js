/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 3: search and records, on screen.

   Four cards: the strategy (concept blocks → strings per syntax and per
   source, with the search log), the import of export files, the duplicates
   (automatic merges and the pairs a person decides) and the check of the
   strategy against the records and the known relevant studies. The
   deduplicated records are what Block 4 screens. */

(function () {

  const two = p => L2(p[0], p[1]);
  const S = () => state.search;
  let dedupCache = null, pairLimit = 40;

  function blankSearch() { return { blocks: [], not: { field: 'tiab', terms: [] }, dialect: 'func', log: [], files: [], decisions: {}, gold: [] }; }
  function ensure() { if (!state.search) state.search = blankSearch(); const s = state.search; ['blocks', 'log', 'files', 'gold'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; }); if (!s.not) s.not = { field: 'tiab', terms: [] }; if (!s.decisions) s.decisions = {}; if (!s.dialect) s.dialect = 'func'; return s; }
  const changed = () => { dedupCache = null; Project.touch(); };

  /* ---------------- records and duplicates ---------------- */
  function allRecords() {
    const out = [];
    let order = 0;
    S().files.forEach(f => f.records.forEach((r, i) => { r.uid = r.uid || `${f.id}:${i}`; r.src = f.source; r.order = order++; out.push(r); }));
    return out;
  }
  function dedup() {
    if (!dedupCache) dedupCache = Dedup.run(allRecords(), S().decisions);
    return dedupCache;
  }
  /* from the interface, the duplicate search runs in the work window */
  const dedupWork = () => rvWork('Buscando duplicados', 'Searching for duplicates');

  /* ---------------- strategy ---------------- */
  function renderBlocks() {
    const g = el('b3Blocks'); if (!g) return;
    const s = S();
    const fieldSel = (v, attrs) => `<select ${attrs}>${Object.keys(Search.FIELDS).map(k => `<option value="${k}"${v === k ? ' selected' : ''}>${esc(T(Search.FIELDS[k][0], Search.FIELDS[k][1]))}</option>`).join('')}</select>`;
    const chips = (terms, bi) => terms.map((t, ti) => `<span class="b3-term${t.on === false ? ' off' : ''}"><button class="b3-t" data-tog="${bi}:${ti}" title="${esc(T('Activar o desactivar', 'Turn on or off'))}">${esc(t.t)}</button><button class="b3-x" data-rmt="${bi}:${ti}">×</button></span>`).join('');
    const block = (b, bi, isNot) => `<div class="b3-block${isNot ? ' not' : ''}">
      <div class="b3-bh">${isNot ? `<b>NOT</b> <span class="hint" style="margin:0">${L2('términos que excluyen (úsalo con cuidado)', 'terms that exclude (use with care)')}</span>` : `<input type="text" class="b3-name" data-bname="${bi}" value="${esc(b.name || '')}" aria-label="${esc(T(`Nombre del bloque ${bi + 1}`, `Name of block ${bi + 1}`))}">`}
        ${fieldSel(b.field || 'tiab', `data-bfield="${bi}" aria-label="${esc(isNot ? T('Campos de los términos NOT', 'Fields of the NOT terms') : T(`Campos del bloque ${bi + 1}`, `Fields of block ${bi + 1}`))}"`)}${isNot ? '' : `<button class="icon-x" data-rmb="${bi}" title="${esc(T('Quitar bloque', 'Remove block'))}">×</button>`}</div>
      <div class="b3-terms">${chips(b.terms, bi)}<input type="text" class="b3-add" data-addt="${bi}" aria-label="${esc(isNot ? T('Añadir un término NOT', 'Add a NOT term') : T(`Añadir un término al bloque ${bi + 1}`, `Add a term to block ${bi + 1}`))}" placeholder="${esc(T('+ término y Enter (usa * para truncar)', '+ term and Enter (use * to truncate)'))}"></div></div>`;
    g.innerHTML = s.blocks.map((b, i) => (i ? '<div class="b3-and">AND</div>' : '') + block(b, i, false)).join('') +
      (s.blocks.length ? '<div class="b3-and not">NOT</div>' + block(s.not, 'not', true) : `<p class="hint">${L2('Sin bloques todavía. Propónlos desde la pregunta del protocolo o crea uno.', 'No blocks yet. Propose them from the protocol question or create one.')}</p>`);
  }
  const blockOf = bi => (bi === 'not' ? S().not : S().blocks[+bi]);

  function renderStrings() {
    const s = S();
    els('#b3Dialects button').forEach(b => b.classList.toggle('on', b.dataset.dia === s.dialect));
    const str = Search.write(s, s.dialect);
    const pre = el('b3String'); if (pre) pre.textContent = str || T('(la cadena aparecerá al añadir términos)', '(the string appears as terms are added)');
    const ex = el('b3DiaEx'); if (ex) ex.innerHTML = `${two(Search.DIALECTS[s.dialect].n)} · <code>${esc(Search.DIALECTS[s.dialect].ex)}</code>`;
    const ck = el('b3Checks');
    if (ck) { const c = Search.check(s, s.dialect); ck.innerHTML = c.map(x => `<div class="msg msg-${x.level === 'bad' ? 'error' : x.level === 'warn' ? 'warning' : 'info'}">${two(x.msg)}</div>`).join(''); }
    renderLog();
  }
  /* one row per database of the protocol: syntax, date, hits reported, imported */
  /* the kind of a source lives in the protocol (Block 2): database, grey literature or other methods */
  function kindSel(name) {
    const src = (state.protocol ? state.protocol.sources : []).find(x => x.name && x.name.trim() === name);
    const k = src ? src.kind : 'db';
    return `<select data-kind="${esc(name)}" style="min-width:150px">${[['db', T('base de datos', 'database')], ['grey', T('literatura gris', 'grey literature')], ['other', T('otros métodos', 'other methods')]].map(([v, l]) => `<option value="${v}"${k === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  }
  function renderLog() {
    const g = el('b3Log'); if (!g) return;
    const s = S(), p = state.protocol;
    const names = [...new Set((p ? p.sources.filter(x => x.name && x.name.trim()).map(x => x.name.trim()) : []).concat(s.files.map(f => f.source)))];
    names.forEach(n => { if (!s.log.some(l => l.source === n)) s.log.push({ source: n, dialect: s.dialect, date: '', reported: '' }); });
    const imported = n => s.files.filter(f => f.source === n).reduce((a, f) => a + f.records.length, 0);
    if (!names.length) { g.innerHTML = `<p class="hint">${L2('Declara las fuentes en el Bloque 2 o importa archivos: aparecerán aquí.', 'Declare the sources in Block 2 or import files: they will appear here.')}</p>`; return; }
    g.innerHTML = `<div class="table-scroll"><table class="b2-tbl b3-log"><thead><tr><th>${L2('Fuente', 'Source')}</th><th>${L2('Tipo', 'Kind')}</th><th>${L2('Sintaxis', 'Syntax')}</th><th>${L2('Fecha de búsqueda', 'Search date')}</th><th class="num">${L2('Resultados en la fuente', 'Hits at the source')}</th><th class="num">${L2('Importados', 'Imported')}</th><th></th></tr></thead><tbody>` +
      s.log.filter(l => names.includes(l.source)).map(l => {
        const i = s.log.indexOf(l), imp = imported(l.source), rep = parseInt(l.reported, 10);
        const flag = rep && imp && rep !== imp ? `<span class="b3-flag" title="${esc(T('No coincide: revisa si la exportación quedó incompleta (muchas bases exportan por lotes).', 'Mismatch: check whether the export was incomplete (many databases export in batches).'))}">≠</span>` : rep && imp === rep ? '<span class="b3-okf">✓</span>' : '';
        return `<tr><td>${esc(l.source)}</td><td>${kindSel(l.source)}</td><td><select data-log="${i}" data-f="dialect">${Object.keys(Search.DIALECTS).map(k => `<option value="${k}"${l.dialect === k ? ' selected' : ''}>${esc(T(Search.DIALECTS[k].n[0], Search.DIALECTS[k].n[1]))}</option>`).join('')}</select></td>
          <td><input type="date" data-log="${i}" data-f="date" value="${esc(l.date || '')}"></td><td class="num"><input type="number" min="0" data-log="${i}" data-f="reported" value="${esc(l.reported || '')}" style="width:100px"></td><td class="num">${imp} ${flag}</td>
          <td><button class="btn btn-ghost btn-sm" data-copystr="${i}">${L2('Copiar cadena', 'Copy string')}</button></td></tr>`;
      }).join('') + '</tbody></table></div>';
  }

  /* ---------------- import ---------------- */
  function sourceOptions() {
    const p = state.protocol;
    const names = [...new Set((p ? p.sources.filter(x => x.name && x.name.trim()).map(x => x.name.trim()) : []).concat(S().files.map(f => f.source)))];
    const sel = el('b3Src'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = names.map(n => `<option>${esc(n)}</option>`).join('') + `<option value="__new">${esc(T('Otra fuente…', 'Another source…'))}</option>`;
    if (names.includes(cur)) sel.value = cur;
    const nw = el('b3SrcNew'); if (nw) nw.style.display = sel.value === '__new' ? '' : 'none';
  }
  function addFile(name, text, source) {
    const res = Records.parse(text, name);
    const id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const f = { id, name, format: res.format, source, date: toISO({ y: new Date().getFullYear(), m: new Date().getMonth() + 1, d: new Date().getDate() }), records: res.records, info: res.info };
    f.records.forEach((r, i) => { r.uid = `${id}:${i}`; r.src = source; });
    S().files.push(f);
    return f;
  }
  function renderFiles() {
    const g = el('b3Files'); if (!g) return;
    const fs = S().files;
    if (!fs.length) { g.innerHTML = `<p class="hint">${L2('Aún no hay archivos importados.', 'No files imported yet.')}</p>`; return; }
    g.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Archivo', 'File')}</th><th>${L2('Formato', 'Format')}</th><th>${L2('Fuente', 'Source')}</th><th class="num">${L2('Registros', 'Records')}</th><th>${L2('Sin resumen', 'No abstract')}</th><th></th></tr></thead><tbody>` +
      fs.map((f, i) => {
        const noAb = f.records.filter(r => !r.abstract).length;
        const map = f.format === 'csv' && f.info && f.info.map ? `<div class="hint" style="margin:2px 0 0">${L2('Columnas reconocidas', 'Recognized columns')}: ${Object.keys(f.info.map).map(k => `${k}→«${esc((f.info.header || [])[f.info.map[k]] || '')}»`).join(', ')}</div>` : '';
        return `<tr><td>${esc(f.name)}${map}</td><td>${esc(T(Records.FORMATS[f.format][0], Records.FORMATS[f.format][1]))}</td><td>${esc(f.source)}</td><td class="num">${f.records.length}</td><td>${noAb ? `<span class="b3-flag">${noAb}</span>` : '0'}</td><td><button class="icon-x" data-rmf="${i}">×</button></td></tr>`;
      }).join('') + '</tbody></table></div>';
  }

  /* ---------------- duplicates ---------------- */
  const REASON = { doi: ['mismo DOI', 'same DOI'], title: ['mismo título, año y primer autor compatibles', 'same title, compatible year and first author'], 'title-year': ['mismo título pero años distintos', 'same title but different years'], 'title-author': ['mismo título pero primer autor distinto', 'same title but different first author'], 'title-doi': ['mismo título pero DOI distintos', 'same title but different DOIs'], similar: ['títulos casi iguales', 'nearly identical titles'] };
  function renderDedup() {
    const recs = allRecords();
    const d = dedup();
    statTiles('b3DupTiles', [
      [T('Registros importados', 'Records imported'), fmtNum(recs.length), T(`${S().files.length} archivos`, `${S().files.length} files`)],
      [T('Registros fusionados', 'Records merged'), fmtNum(d.removed), T(`${d.pairs.filter(p => p.kind === 'certain').length} coincidencias seguras, ${d.pairs.filter(p => S().decisions[p.key] === 'dup').length} confirmadas por ti`, `${d.pairs.filter(p => p.kind === 'certain').length} certain matches, ${d.pairs.filter(p => S().decisions[p.key] === 'dup').length} confirmed by you`)],
      [T('Pares por decidir', 'Pairs to decide'), fmtNum(d.pending), T('duplicados probables', 'probable duplicates'), d.pending ? 'warn' : 'ok'],
      [T('Registros únicos', 'Unique records'), fmtNum(d.unique.length), T(`se quitaron ${d.removed}`, `${d.removed} removed`), 'ok'],
    ]);
    const box = el('b3Pairs'); if (!box) return;
    /* undecided pairs first, most similar first; only a page is drawn at a time */
    const all = d.pairs.filter(p => p.kind === 'probable').sort((x, y) => (!!S().decisions[x.key] - !!S().decisions[y.key]) || y.sim - x.sim);
    const probable = all.slice(0, pairLimit);
    const side = (r, o) => {
      const diff = k => (String(r[k] || '') !== String(o[k] || '') ? ' class="b3-diff"' : '');
      return `<div class="b3-side"><div class="b3-src">${esc(r.src)}</div><div${diff('title')}><b>${esc(r.title)}</b></div><div${diff('year')}>${esc((r.authors || []).slice(0, 3).join('; '))}${(r.authors || []).length > 3 ? ' et al.' : ''} · ${r.year || '—'}</div><div${diff('journal')}>${esc(r.journal || '—')}</div><div${diff('doi')} class="b3-doi">${r.doi ? 'doi:' + esc(r.doi) : L2('sin DOI', 'no DOI')}</div></div>`;
    };
    box.innerHTML = probable.length ? probable.map(p => {
      const a = recs[p.i], b = recs[p.j], dec = S().decisions[p.key];
      return `<div class="b3-pair${dec ? ' decided ' + dec : ''}"><div class="b3-ph"><span class="b2-pill">${two(REASON[p.reason])}${p.reason === 'similar' ? ' · ' + fmtPct(p.sim, 0) : ''}</span>
        <span class="b3-btns"><button class="btn btn-sm ${dec === 'dup' ? 'btn-primary' : 'btn-secondary'}" data-dec="dup" data-key="${p.key}">${L2('Es el mismo estudio', 'Same study')}</button><button class="btn btn-sm ${dec === 'not' ? 'btn-primary' : 'btn-secondary'}" data-dec="not" data-key="${p.key}">${L2('Son distintos', 'Different')}</button></span></div>
        <div class="b3-sides">${side(a, b)}${side(b, a)}</div></div>`;
    }).join('') + (all.length > probable.length ? `<div class="btn-row"><button class="btn btn-secondary btn-sm" id="b3MorePairs">${L2(`Mostrar 40 más (quedan ${all.length - probable.length})`, `Show 40 more (${all.length - probable.length} left)`)}</button></div>` : '') : `<p class="hint">${L2('No hay pares dudosos.', 'No doubtful pairs.')}</p>`;
    const auto = el('b3Auto');
    if (auto) {
      const cert = d.pairs.filter(p => p.kind === 'certain');
      auto.innerHTML = cert.length ? `<details><summary>${L2(`Ver las ${cert.length} fusiones automáticas`, `See the ${cert.length} automatic merges`)}</summary><ul class="b3-auto">${cert.map(p => `<li><span class="b2-pill">${two(REASON[p.reason])}</span> ${esc(recs[p.i].title.slice(0, 90))} <span class="muted">— ${esc(recs[p.i].src)} ↔ ${esc(recs[p.j].src)}</span></li>`).join('')}</ul></details>` : '';
    }
  }

  /* ---------------- strategy check ---------------- */
  function renderTest() {
    const box = el('b3Test'); if (!box) return;
    const d = dedup(), s = S();
    if (!d.unique.length || !s.blocks.length) { box.innerHTML = `<p class="hint">${L2('Hace falta una estrategia y registros importados.', 'A strategy and imported records are needed.')}</p>`; el('b3Gold').innerHTML = ''; return; }
    const r = Search.run(s, d.unique);
    box.innerHTML = `<div class="b3-funnel">${s.blocks.map((b, i) => `<div><span>${esc(b.name || '#' + (i + 1))}</span><b>${r.perBlock[i] || 0}</b></div>`).join('<i>AND</i>')}<i>=</i><div class="tot"><span>${L2('Cadena completa', 'Whole string')}</span><b>${r.total}</b></div></div>
      <p class="hint">${L2(`De ${d.unique.length} registros únicos, la cadena recupera ${r.total} al buscar en título, resumen y palabras clave. Los que no recupera entraron por la búsqueda propia de cada base (campos que aquí no se ven, o vocabulario controlado): revísalos antes de concluir que sobran.`, `Of ${d.unique.length} unique records, the string retrieves ${r.total} when searching titles, abstracts and keywords. Those it misses came in through each database's own search (fields not visible here, or controlled vocabulary): look at them before concluding they are surplus.`)}</p>`;
    const gold = Search.goldCheck(s, d.unique, s.gold);
    const gb = el('b3Gold');
    gb.innerHTML = gold.length ? `<table class="b2-tbl"><tbody>${gold.map(x => `<tr class="${!x.found ? 'st-missing' : x.retrieved ? 'st-ok' : 'st-warn'}"><td>${esc(x.g.title || x.g.doi)}</td><td><span class="b2-pill">${!x.found ? L2('no está entre los registros', 'not among the records') : x.retrieved ? L2('lo recupera', 'retrieved') : L2('no lo recupera: falla ' + x.failing.map(i => s.blocks[i].name).join(', '), 'missed: fails ' + x.failing.map(i => s.blocks[i].name).join(', '))}</span></td></tr>`).join('')}</tbody></table>
      <p class="hint">${L2(`Sensibilidad frente a los estudios conocidos: ${gold.filter(x => x.retrieved).length} de ${gold.length}. Un estudio que la búsqueda no encuentra obliga a revisar los términos del bloque que falla.`, `Sensitivity against the known studies: ${gold.filter(x => x.retrieved).length} of ${gold.length}. A study the search does not find calls for revising the terms of the failing block.`)}</p>` : '';
  }

  /* ---------------- summary, figure, exports ---------------- */
  function renderSummary() {
    const g = el('b3Summary'); if (!g) return;
    const d = dedup(), s = S();
    const bySrc = {};
    s.files.forEach(f => { bySrc[f.source] = (bySrc[f.source] || 0) + f.records.length; });
    const n = Object.values(bySrc).reduce((a, b) => a + b, 0);
    g.innerHTML = n ? `<table class="b2-tbl"><tbody>${Object.keys(bySrc).map(k => `<tr><td>${esc(k)}</td><td class="num">${bySrc[k]}</td></tr>`).join('')}
      <tr class="b3-tot"><td>${L2('Registros identificados', 'Records identified')}</td><td class="num">${n}</td></tr><tr><td>${L2('Duplicados eliminados', 'Duplicates removed')}</td><td class="num">${d.removed}</td></tr>
      <tr class="b3-tot"><td>${L2('Registros para el cribado (Bloque 4)', 'Records for screening (Block 4)')}</td><td class="num">${d.unique.length}</td></tr></tbody></table>
      ${d.pending ? `<div class="msg msg-warning">${L2(`Quedan ${d.pending} pares dudosos sin decidir; cuentan como registros distintos hasta que los decidas.`, `${d.pending} doubtful pairs remain undecided; they count as separate records until you decide them.`)}</div>` : ''}` : '';
    drawYears(d.unique);
  }
  function drawYears(recs) {
    const svg = el('b3Years'); if (!svg) return;
    const ys = recs.map(r => r.year).filter(Boolean);
    if (!ys.length) { Plot.empty(svg, 560, 220, T('Sin registros con año.', 'No records with a year.')); return; }
    const lo = Math.min(...ys), hi = Math.max(...ys);
    const xs = [], cnt = [];
    for (let y = lo; y <= hi; y++) { xs.push(y); cnt.push(ys.filter(v => v === y).length); }
    const f = Plot.frame(svg, { W: 560, H: 230, m: { l: 40, r: 12, t: 16, b: 36 }, x: [lo - 0.6, hi + 0.6], y: [0, Math.max(...cnt) * 1.15 + 0.5], xlab: T('año de publicación', 'publication year'), ylab: T('registros únicos', 'unique records'), xlabFmt: v => String(Math.round(v)), nx: Math.min(10, hi - lo + 1) });
    Plot.bars(f, xs, cnt, 'var(--c1)', { width: Math.max(3, (f.sx(lo + 1) - f.sx(lo)) * 0.7) });
  }
  function reportMd(L) {
    const s = S(), d = dedup(), p = state.protocol || {};
    const t = (es, en) => (L === 'en' ? en : es);
    let md = `# ${t('Estrategia de búsqueda', 'Search strategy')}${p.title ? ' — ' + p.title : ''}\n\n`;
    md += `## ${t('Bloques de conceptos', 'Concept blocks')}\n\n`;
    s.blocks.forEach((b, i) => { md += `${i + 1}. **${b.name}** (${t(Search.FIELDS[b.field || 'tiab'][0], Search.FIELDS[b.field || 'tiab'][1])}): ${Search.activeTerms(b).join(' OR ')}\n`; });
    if (Search.activeTerms(s.not).length) md += `\nNOT: ${Search.activeTerms(s.not).join(' OR ')}\n`;
    md += `\n## ${t('Cadena por fuente', 'String per source')}\n\n`;
    s.log.forEach(l => {
      const imp = s.files.filter(f => f.source === l.source).reduce((a, f) => a + f.records.length, 0);
      md += `### ${l.source}\n${t('Fecha', 'Date')}: ${l.date || '—'} · ${t('resultados en la fuente', 'hits at the source')}: ${l.reported || '—'} · ${t('importados', 'imported')}: ${imp}\n\n\`\`\`\n${Search.write(s, l.dialect)}\n\`\`\`\n\n`;
    });
    md += `## ${t('Registros', 'Records')}\n\n| ${t('Paso', 'Step')} | n |\n|---|---|\n| ${t('Identificados', 'Identified')} | ${allRecords().length} |\n| ${t('Duplicados eliminados', 'Duplicates removed')} | ${d.removed} |\n| ${t('Para cribado', 'For screening')} | ${d.unique.length} |\n\n`;
    md += `${t('Duplicados: mismo DOI, o mismo título normalizado con año (±1) y primer autor compatibles; los pares de títulos ≥ 90 % similares se decidieron manualmente', 'Duplicates: same DOI, or same normalized title with compatible year (±1) and first author; pairs of titles ≥ 90 % similar were decided manually')} (${Object.keys(s.decisions).length}).\n`;
    return md;
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    renderBlocks(); renderStrings(); sourceOptions(); renderFiles(); renderDedup(); renderTest(); renderSummary();
    const gold = el('b3GoldIn'); if (gold && document.activeElement !== gold) gold.value = S().gold.map(g => g.doi || g.title).join('\n');
  }
  const refreshDerived = () => { renderStrings(); renderTest(); };

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-3'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const s = S();
      if (b.dataset.tog) { const [bi, ti] = b.dataset.tog.split(':'); const t = blockOf(bi).terms[+ti]; t.on = t.on === false; b.parentNode.classList.toggle('off', t.on === false); changed(); refreshDerived(); return; }
      if (b.dataset.rmt) { const [bi, ti] = b.dataset.rmt.split(':'); blockOf(bi).terms.splice(+ti, 1); changed(); renderBlocks(); refreshDerived(); return; }
      if (b.dataset.rmb != null) { s.blocks.splice(+b.dataset.rmb, 1); changed(); renderBlocks(); refreshDerived(); return; }
      if (b.dataset.dia) { s.dialect = b.dataset.dia; changed(); renderStrings(); return; }
      if (b.dataset.copystr != null) { const l = s.log[+b.dataset.copystr]; navigator.clipboard && navigator.clipboard.writeText(Search.write(s, l.dialect)).then(() => { b.textContent = T('✓ Copiada', '✓ Copied'); setTimeout(() => { b.innerHTML = L2('Copiar cadena', 'Copy string'); }, 1500); }); return; }
      if (b.dataset.rmf != null) { s.files.splice(+b.dataset.rmf, 1); changed(); rvAfterPaint(renderAll, dedupWork()); return; }
      if (b.dataset.dec) { const k = b.dataset.key; if (s.decisions[k] === b.dataset.dec) delete s.decisions[k]; else s.decisions[k] = b.dataset.dec; changed(); rvAfterPaint(() => { renderDedup(); renderTest(); renderSummary(); }, dedupWork()); return; }
      switch (b.id) {
        case 'b3Seed': { const add = Search.seedBlocks(state.protocol); if (!add.length) { notice('b3Msg', 'warning', L2('La pregunta del protocolo no tiene elementos que buscar (Bloque 2).', 'The protocol question has no elements to search (Block 2).')); break; } s.blocks = s.blocks.concat(add); changed(); renderBlocks(); refreshDerived(); break; }
        case 'b3AddBlock': s.blocks.push({ name: T('Concepto', 'Concept') + ' ' + (s.blocks.length + 1), field: 'tiab', terms: [] }); changed(); renderBlocks(); refreshDerived(); break;
        case 'b3CopyStr': navigator.clipboard && navigator.clipboard.writeText(Search.write(s, s.dialect)).then(() => { b.textContent = T('✓ Copiada', '✓ Copied'); setTimeout(() => { b.innerHTML = L2('Copiar', 'Copy'); }, 1500); }); break;
        case 'b3Pick': el('b3FileIn').click(); break;
        case 'b3Samples': {
          if (s.files.length && !confirm(T('¿Añadir los seis archivos de ejemplo a los que ya importaste?', 'Add the six sample files to the ones already imported?'))) break;
          rvAfterPaint(() => {
            Samples.files().forEach(f => addFile(f.name, f.text, f.source));
            if (!s.blocks.length) { s.blocks = JSON.parse(JSON.stringify(Samples.STRATEGY.blocks)); s.not = JSON.parse(JSON.stringify(Samples.STRATEGY.not)); }
            if (!s.gold.length) s.gold = Samples.GOLD.slice();
            changed(); renderAll();
            clearMessages('b3Msg'); notice('b3Msg', 'info', L2('Se cargaron seis exportaciones ficticias (43 registros de 30 obras) con duplicados entre bases, una errata y dos obras distintas con el mismo título. Decide los pares dudosos abajo.', 'Six fictitious exports were loaded (43 records of 30 works) with duplicates between databases, a typo and two different works with the same title. Decide the doubtful pairs below.'));
          }, dedupWork());
          break;
        }
        case 'b3MorePairs': pairLimit += 40; renderDedup(); break;
        case 'b3DlSamples': Samples.files().forEach((f, i) => setTimeout(() => download(f.text, f.name, 'text/plain;charset=utf-8'), i * 250)); break;
        case 'b3DlRis': rvBusy(b, () => download(Records.toRIS(dedup().unique), slug((state.protocol && state.protocol.title) || 'registros') + '_unicos.ris', 'application/x-research-info-systems')); break;
        case 'b3DlCsv': rvBusy(b, () => download(Records.toCSV(dedup().unique.map(r => Object.assign({}, r, { id: r.uid }))), slug((state.protocol && state.protocol.title) || 'registros') + '_unicos.csv', 'text/csv;charset=utf-8')); break;
        case 'b3DlReport': rvBusy(b, () => download(reportMd(I18N.lang), slug((state.protocol && state.protocol.title) || 'busqueda') + '_estrategia.md', 'text/markdown;charset=utf-8')); break;
      }
    });
    panel.addEventListener('keydown', e => {
      const n = e.target;
      if (n.dataset && n.dataset.addt != null && e.key === 'Enter') {
        e.preventDefault();
        const parts = n.value.split(/\s*(?:;|\bOR\b)\s*/).map(x => Search.clean(x)).filter(Boolean);
        if (!parts.length) return;
        parts.forEach(t => blockOf(n.dataset.addt).terms.push({ t, on: true }));
        changed(); renderBlocks(); refreshDerived();
        const again = panel.querySelector(`[data-addt="${n.dataset.addt}"]`); if (again) again.focus();
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target, s = S();
      if (n.dataset.bname != null) { s.blocks[+n.dataset.bname].name = n.value; changed(); refreshDerived(); return; }
      if (n.dataset.bfield != null) { blockOf(n.dataset.bfield).field = n.value; changed(); refreshDerived(); return; }
      if (n.dataset.kind != null) {
        const p = state.protocol; let src = p.sources.find(x => x.name && x.name.trim() === n.dataset.kind);
        if (!src) { src = { name: n.dataset.kind, kind: 'db', note: '' }; p.sources.push(src); }
        src.kind = n.value; changed(); return;
      }
      if (n.dataset.log != null) { s.log[+n.dataset.log][n.dataset.f] = n.value; changed(); if (n.dataset.f !== 'date') renderLog(); return; }
      if (n.id === 'b3GoldIn') {
        s.gold = n.value.split('\n').map(x => x.trim()).filter(Boolean).map(x => (/^(https?:\/\/(dx\.)?doi\.org\/)?10\.\d{4,9}\//i.test(x) ? { doi: x } : { title: x }));
        changed(); renderTest();
      }
    });
    panel.addEventListener('change', e => { if (e.target.id === 'b3Src') { el('b3SrcNew').style.display = e.target.value === '__new' ? '' : 'none'; if (e.target.value === '__new') el('b3SrcNew').focus(); } });
    panel.addEventListener('change', e => { if (e.target.tagName === 'SELECT' && (e.target.dataset.log != null || e.target.dataset.bfield != null)) e.target.dispatchEvent(new Event('input', { bubbles: true })); });
    const fin = el('b3FileIn');
    const readFiles = list => {
      let src = el('b3Src').value;
      /* a new source is named in the field beside the selector; unnamed, it gets a numbered name */
      if (src === '__new') src = (el('b3SrcNew').value || '').trim() || T('Fuente ', 'Source ') + (new Set(S().files.map(f => f.source)).size + 1);
      const files = [...list];
      /* reading, parsing and the duplicate search run in the work window */
      rvAfterPaint(() => Promise.all(files.map(f => f.text().then(t => ({ f, t })))).then(arr => {
        const msgs = [];
        let got = 0;
        arr.forEach(({ f, t }) => { const x = addFile(f.name, t, src); got += x.records.length; msgs.push(`${esc(f.name)}: ${x.records.length} ${T('registros', 'records')} (${esc(T(Records.FORMATS[x.format][0], Records.FORMATS[x.format][1]))})`); if (!x.records.length) msgs.push(T(`⚠ ${esc(f.name)}: no se reconoció ningún registro.`, `⚠ ${esc(f.name)}: no record was recognized.`)); });
        changed(); renderAll();
        if (!got && rvWork.current) rvWork.current._failed = true;
        clearMessages('b3Msg'); notice('b3Msg', 'success', msgs.join('<br>'));
      }), rvWork('Leyendo los registros y buscando duplicados', 'Reading the records and searching for duplicates'));
    };
    if (fin) fin.addEventListener('change', () => { if (fin.files.length) readFiles(fin.files); fin.value = ''; });
    const drop = el('b3Drop');
    if (drop) {
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', e => { if (e.dataTransfer.files.length) readFiles(e.dataTransfer.files); });
    }
    Project.on(kind => {
      if (kind === 'load') { dedupCache = null; renderAll(); }
      if (kind === 'savefail') { const m = el('b3Msg'); if (m && !m.querySelector('.b3-quota')) notice(m, 'warning', `<span class="b3-quota">${L2('El navegador ya no tiene espacio para guardar el proyecto con todos sus registros. Nada se ha perdido en esta sesión, pero guarda el archivo del proyecto (Bloque 2 · Guardar archivo) antes de cerrar.', 'The browser has no room left to save the project with all its records. Nothing is lost in this session, but save the project file (Block 2 · Save file) before closing.')}</span>`); }
    });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 3) rvAfterPaint(renderAll, dedupWork()); });
  }

  function init() {
    ensure();
    wire();
    renderAll();
    if (location.hash === '#b3') setTimeout(() => goStep(3), 0);
    if (/[?&]samples=1/.test(location.search) && !S().files.length) { const c = window.confirm; window.confirm = () => true; el('b3Samples').click(); window.confirm = c; setTimeout(() => goStep(3), 0); }
  }
  /* after Block 2 has loaded (or created) the project */
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  window.Block3 = { renderAll, dedup, allRecords, reportMd, unique: () => dedup().unique };
})();
