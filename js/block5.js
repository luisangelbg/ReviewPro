/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 5: full texts, eligibility and the PRISMA flow diagram, on screen.

   The PDFs stay where the user keeps them: the app stores only the path (an
   absolute path, or one relative to a base folder) and suggests a file name.
   The reviewers are those of Block 4. The flow diagram is drawn from the
   counts of Blocks 3, 4 and 5 and is redrawn whenever a decision changes. */

(function () {

  const two = p => L2(p[0], p[1]);
  const FT = () => state.fulltext;
  const P = () => state.protocol || Protocol.blank('systematic');
  let ftFilter = 'all', current = null;

  function ensure() {
    if (!state.fulltext) state.fulltext = { base: '', reports: {}, decisions: {}, final: {}, links: {}, extra: [] };
    const f = state.fulltext;
    ['reports', 'decisions', 'final', 'links'].forEach(k => { if (!f[k] || typeof f[k] !== 'object') f[k] = {}; });
    if (!Array.isArray(f.extra)) f.extra = [];
    return f;
  }
  const SC = () => state.screening || { reviewers: [], decisions: {}, final: {}, stop: {} };
  const rids = () => SC().reviewers.map(r => r.id);
  const active = () => SC().active;
  const nameOf = id => (SC().reviewers.find(r => r.id === id) || { name: '?' }).name;
  const requiredFT = () => (P().screening.fulltextDual ? 2 : 1);
  const exclCriteria = () => P().criteria.filter(c => c.kind === 'exc' && c.text && c.text.trim());
  const incCriteria = () => P().criteria.filter(c => c.kind === 'inc' && c.text && c.text.trim());
  const report = k => (FT().reports[k] = FT().reports[k] || { retrieval: 'pending', path: '', note: '' });

  /* ---------------- the records that reach full text ---------------- */
  const OTHER_HOW = { back: ['Búsqueda de citas hacia atrás', 'Backward citation searching'], fwd: ['Búsqueda de citas hacia adelante', 'Forward citation searching'], expert: ['Contacto con expertos', 'Contact with experts'], web: ['Sitio web u organización', 'Website or organization'], other: ['Otra vía', 'Other route'] };
  function kindOf(sourceName) {
    const s = P().sources.find(x => x.name && x.name.trim() === sourceName);
    return !s || s.kind === 'db' ? 'db' : 'other';
  }
  /* every record with its pathway, screening status, retrieval and full-text status */
  function flowRecords() {
    const out = [];
    if (window.Block4) {
      const c = Block4.records(), s = SC();
      const stopped = Object.values(s.stop || {}).some(x => x.phase === 'stopped');
      c.keys.forEach(k => {
        const r = c.byKey.get(k);
        const pathway = (r.srcs || [r.src]).some(n => kindOf(n) === 'db') ? 'db' : 'other';
        out.push({ key: k, rec: r, pathway, screen: Screening.status(k, s.decisions, rids(), s.final, Math.max(1, +P().screening.reviewers || 1), stopped) });
      });
    }
    FT().extra.forEach(x => out.push({ key: x.key, rec: x, pathway: 'other', direct: true, screen: { s: 'agreed', d: 'inc' } }));
    out.forEach(o => {
      o.retrieval = (FT().reports[o.key] || {}).retrieval || 'pending';
      o.ft = FullText.status(o.key, FT().decisions, rids(), FT().final, requiredFT());
    });
    return out;
  }
  const toFullText = () => flowRecords().filter(o => (o.screen.s === 'agreed' || o.screen.s === 'final') && o.screen.d !== 'exc');
  function identified() {
    const id = { db: {}, other: {} };
    if (state.search) state.search.files.forEach(f => { const k = kindOf(f.source); id[k][f.source] = (id[k][f.source] || 0) + f.records.length; });
    FT().extra.forEach(x => { const n = T(OTHER_HOW[x.how || 'other'][0], OTHER_HOW[x.how || 'other'][1]); id.other[n] = (id.other[n] || 0) + 1; });
    return id;
  }

  /* ---------------- 1 · retrieval ---------------- */
  function renderRetrieval() {
    const box = el('b5Table'); if (!box) return;
    const list = toFullText();
    const n = { all: list.length, pending: 0, retrieved: 0, not: 0 };
    list.forEach(o => { n[o.retrieval]++; });
    statTiles('b5RetTiles', [
      [T('A texto completo', 'To full text'), fmtNum(n.all), T('del cribado y de otros métodos', 'from screening and other methods')],
      [T('Obtenidos', 'Retrieved'), fmtNum(n.retrieved), n.all ? fmtPct(n.retrieved / n.all, 0) : '—', n.retrieved === n.all && n.all ? 'ok' : ''],
      [T('Por conseguir', 'To obtain'), fmtNum(n.pending), '', n.pending ? 'warn' : ''],
      [T('No se consiguieron', 'Not retrieved'), fmtNum(n.not), T('se reportan en PRISMA', 'reported in PRISMA')],
    ]);
    els('#b5Filter .chip').forEach(b => b.classList.toggle('on', b.dataset.f === ftFilter));
    const rows = list.filter(o => ftFilter === 'all' || o.retrieval === ftFilter);
    if (!list.length) { box.innerHTML = `<p class="hint">${L2('Todavía ningún registro pasó el cribado (Bloque 4).', 'No record has passed screening yet (Block 4).')}</p>`; return; }
    const base = FT().base;
    box.innerHTML = `<div class="table-scroll"><table class="b2-tbl b5-tbl"><thead><tr><th>${L2('Informe', 'Report')}</th><th>${L2('Ruta del PDF en tu computadora', 'Path of the PDF on your computer')}</th><th>${L2('Estado', 'Status')}</th><th>${L2('Nota o solicitud', 'Note or request')}</th></tr></thead><tbody>` +
      rows.map(o => {
        const r = o.rec, rp = report(o.key), url = FullText.fileUrl(rp.path, base), fn = FullText.fileName(r);
        return `<tr class="rt-${o.retrieval}"><td class="b5-ref"><b>${esc(r.title)}</b><div class="muted">${esc(((r.authors || [])[0] || '').split(',')[0])}${(r.authors || []).length > 1 ? ' et al.' : ''} · ${r.year || '—'}${r.doi ? ` · <a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener">doi:${esc(r.doi)}</a>` : ''}${o.pathway === 'other' ? ` · <span class="b2-pill">${L2('otros métodos', 'other methods')}</span>` : ''}</div>
          <div class="b5-fn"><code>${esc(fn)}</code> <button class="btn btn-ghost btn-sm" data-copyfn="${esc(fn)}">${L2('copiar nombre', 'copy name')}</button></div></td>
          <td><input type="text" data-path="${esc(o.key)}" value="${esc(rp.path || '')}" placeholder="${esc(base ? fn : 'C:\\Revision\\PDF\\' + fn)}">${url ? `<a class="b5-open" href="${esc(url)}" target="_blank" rel="noopener">${L2('abrir', 'open')}</a>` : ''}</td>
          <td><select data-ret="${esc(o.key)}"><option value="pending"${o.retrieval === 'pending' ? ' selected' : ''}>${esc(T('por conseguir', 'to obtain'))}</option><option value="retrieved"${o.retrieval === 'retrieved' ? ' selected' : ''}>${esc(T('obtenido', 'retrieved'))}</option><option value="not"${o.retrieval === 'not' ? ' selected' : ''}>${esc(T('no se consiguió', 'not retrieved'))}</option></select></td>
          <td><input type="text" data-rnote="${esc(o.key)}" value="${esc(rp.note || '')}" placeholder="${esc(T('p. ej., pedido al autor el 3 oct', 'e.g., requested from the author on 3 Oct'))}"></td></tr>`;
      }).join('') + '</tbody></table></div>';
  }

  /* ---------------- 2 · other methods ---------------- */
  function renderExtra() {
    const box = el('b5Extra'); if (!box) return;
    const xs = FT().extra;
    box.innerHTML = xs.length ? `<ul class="b3-auto">${xs.map((x, i) => `<li><b>${esc(x.title)}</b> · ${x.year || '—'} <span class="muted">— ${two(OTHER_HOW[x.how || 'other'])}</span> <button class="icon-x" data-rmx="${i}">×</button></li>`).join('')}</ul>` : '';
  }

  /* ---------------- 3 · eligibility ---------------- */
  function myQueue() {
    const mine = (FT().decisions[active()] || {});
    return toFullText().filter(o => o.retrieval === 'retrieved' && !mine[o.key]);
  }
  function renderAssess() {
    const box = el('b5Card'); if (!box) return;
    const rv = el('b5Reviewer'); if (rv) rv.innerHTML = SC().reviewers.map(r => `<option value="${r.id}"${r.id === active() ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
    if (!FT().decisions[active()]) FT().decisions[active()] = {};
    const q = myQueue();
    current = q[0] ? q[0].key : null;
    const avail = toFullText().filter(o => o.retrieval === 'retrieved').length;
    if (!current) { box.innerHTML = `<div class="b4-empty">${avail ? L2('Evaluaste todos los informes obtenidos.', 'You assessed every retrieved report.') : L2('Aún no hay informes marcados como obtenidos.', 'No report is marked as retrieved yet.')}</div>`; return; }
    const o = q[0], r = o.rec, rp = report(o.key), url = FullText.fileUrl(rp.path, FT().base);
    const crit = exclCriteria(), inc = incCriteria();
    const others = toFullText().filter(x => x.key !== o.key && x.ft.d === 'inc').map(x => x);
    box.innerHTML = `<div class="b4-tag"><span class="b2-pill">${L2('texto completo', 'full text')}</span> <span class="hint" style="margin:0">${L2(`quedan ${q.length}`, `${q.length} left`)}</span></div>
      <h3 class="b4-title">${esc(r.title)}</h3>
      <div class="b4-meta">${esc((r.authors || []).slice(0, 4).join('; '))} · <b>${r.year || '—'}</b> · <i>${esc(r.journal || '')}</i></div>
      <div class="b5-pdf">${url ? `<a class="btn btn-secondary btn-sm" href="${esc(url)}" target="_blank" rel="noopener">${L2('Abrir el PDF', 'Open the PDF')}</a> <code>${esc(rp.path)}</code>` : `<span class="hint" style="margin:0">${L2('Sin ruta del PDF: anótala arriba para abrirlo desde aquí.', 'No PDF path: note it above to open it from here.')}</span>`}</div>
      ${inc.length ? `<div class="b5-inc"><div class="b4-stop-h">${L2('¿Cumple los criterios de inclusión?', 'Does it meet the inclusion criteria?')}</div>${inc.map(c => `<label class="checkbox-label"><input type="checkbox" class="b5-chk"> <b>${esc(c.id)}</b> ${esc(c.text)}</label>`).join('')}</div>` : ''}
      <div class="b4-actions"><button class="btn b4-inc" data-ftd="inc"><kbd>I</kbd> ${L2('Incluir', 'Include')}</button>
        <select id="b5Reason" class="b5-reason"><option value="">${esc(T('Excluir por… (obligatorio)', 'Exclude for… (required)'))}</option>${crit.map((c, i) => `<option value="${esc(c.id)}">${i + 1} · ${esc(c.id)} · ${esc(c.text.slice(0, 70))}</option>`).join('')}<option value="other">${esc(T('Otro motivo (escríbelo en la nota)', 'Other reason (write it in the note)'))}</option></select>
        <button class="btn b4-exc" data-ftd="exc">${L2('Excluir', 'Exclude')}</button></div>
      <div class="form-grid"><div class="field wide"><label>${L2('Nota', 'Note')}</label><input type="text" id="b5Note"></div>
        <div class="field wide"><label>${L2('Es otro informe del estudio de…', 'It is another report of the study of…')}</label><select id="b5Link"><option value="">${esc(T('— es un estudio propio —', '— a study of its own —'))}</option>${others.map(x => `<option value="${esc(x.key)}"${FT().links[o.key] === x.key ? ' selected' : ''}>${esc(x.rec.title.slice(0, 80))} (${x.rec.year || '—'})</option>`).join('')}</select></div></div>`;
  }
  function decideFT(d) {
    if (!current) return;
    const reason = d === 'exc' ? (el('b5Reason') || {}).value : '';
    const note = (el('b5Note') || {}).value || '';
    if (d === 'exc' && !reason) { clearMessages('b5Msg'); notice('b5Msg', 'warning', L2('Elige el motivo de exclusión: PRISMA 2020 pide reportar por qué se excluyó cada informe de texto completo.', 'Choose the reason for exclusion: PRISMA 2020 asks to report why each full-text report was excluded.')); return; }
    if (d === 'exc' && reason === 'other' && !note.trim()) { clearMessages('b5Msg'); notice('b5Msg', 'warning', L2('Escribe el otro motivo en la nota.', 'Write the other reason in the note.')); return; }
    const link = (el('b5Link') || {}).value;
    if (link) FT().links[current] = link; else delete FT().links[current];
    FT().decisions[active()][current] = { d, reason: reason === 'other' ? 'other:' + note.trim() : reason, note, t: Date.now() };
    clearMessages('b5Msg');
    Project.touch();
    renderAssess(); renderConflicts(); renderFlow();
  }
  function renderConflicts() {
    const box = el('b5Conflicts'); if (!box) return;
    const list = toFullText().filter(o => o.ft.s === 'conflict');
    const lab = { inc: ['incluir', 'include'], exc: ['excluir', 'exclude'] };
    const crit = exclCriteria();
    const ag = rids().length >= 2 ? Screening.agreement(Object.fromEntries(rids().map(id => [id, Object.fromEntries(Object.entries(FT().decisions[id] || {}).map(([k, d]) => [k, { d: d.d === 'inc' ? 'inc' : 'exc' }]))])), rids()) : [];
    box.innerHTML = (ag.filter(a => a.n).map(a => `<p class="hint">${esc(nameOf(a.a))} · ${esc(nameOf(a.b))}: ${a.n} ${L2('informes en común', 'reports in common')}, ${L2('acuerdo', 'agreement')} ${fmtPct(a.two.po, 0)}, κ = ${fmtFixed(a.two.kappa, 2)} (${two(Screening.landis(a.two.kappa))})</p>`).join('')) +
      `<h3>${L2(`Conflictos (${list.length})`, `Conflicts (${list.length})`)}</h3>` + (list.length ? list.map(o => `<div class="b3-pair"><b>${esc(o.rec.title)}</b>
        <div class="b4-who">${rids().filter(id => (FT().decisions[id] || {})[o.key]).map(id => { const d = FT().decisions[id][o.key]; return `<span class="b4-d ${d.d}">${esc(nameOf(id))}: ${two(lab[d.d])}${d.reason ? ' · ' + esc(d.reason) : ''}</span>`; }).join('')}</div>
        <div class="b4-res"><button class="btn btn-sm btn-secondary" data-ftfinal="inc" data-key="${esc(o.key)}">${L2('Incluir', 'Include')}</button>
        <select data-ftfinalreason="${esc(o.key)}"><option value="">${esc(T('excluir por…', 'exclude for…'))}</option>${crit.map(c => `<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.text.slice(0, 50))}</option>`).join('')}</select></div></div>`).join('') : `<p class="hint">${L2('No hay conflictos.', 'No conflicts.')}</p>`);
  }

  /* ---------------- 4 · the flow diagram ---------------- */
  function wrap(s, max) { const out = []; let cur = ''; String(s).split(' ').forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) out.push(cur); return out; }
  function drawFlow(svg, f, scr) {
    Plot.clear(svg);
    const hasOther = f.other.identified > 0 || f.other.unique > 0;
    const colW = 250, exW = 250, gap = 24;
    const X = { m: 40, e: 40 + colW + gap, m2: 40 + colW + gap + exW + 40, e2: 40 + 2 * colW + 2 * gap + exW + 40 };
    const W = (hasOther ? X.e2 : X.e) + exW + 12;
    const crit = P().criteria;
    const reasonTxt = id => { if (id === '—') return T('sin motivo', 'no reason'); if (/^other:/.test(id)) return id.slice(6); const c = crit.find(x => x.id === id); return c ? `${id} ${c.text}` : id; };
    const S = (es, en) => T(es, en);
    const unit = scr ? S('fuentes de evidencia', 'sources of evidence') : S('estudios', 'studies');
    const put = (x, y, w, lines, o) => {
      const opt = o || {}, lh = 12.5;
      const L = [];
      /* "(n = 12)" never breaks across lines */
      lines.forEach((ln, i) => wrap(ln.replace(/\(n = ([\d,]+)\)/g, '(n = $1)'), Math.floor(w / 5.6)).forEach((p, j) => L.push({ t: (j && ln.startsWith('  ') ? '  ' : '') + p, b: i === 0 && opt.bold !== false })));
      const h = opt.h || L.length * lh + 12;
      svg.appendChild(svgEl('rect', { x, y, width: w, height: h, rx: 6, fill: 'var(--card-bg)', stroke: opt.stroke || 'var(--primary)', 'stroke-width': 1.2 }));
      L.forEach((l, i) => svg.appendChild(svgEl('text', { x: x + 8, y: y + 16 + i * lh, 'font-size': 9.5, class: 'art-txt', 'font-weight': l.b ? 700 : 400 }, l.t)));
      return h;
    };
    const arrow = (x1, y1, x2, y2) => { svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: 'var(--text-muted)', 'stroke-width': 1.2 })); const a = Math.atan2(y2 - y1, x2 - x1), s = 6; svg.appendChild(svgEl('path', { d: `M${x2} ${y2} L${x2 - s * Math.cos(a - 0.4)} ${y2 - s * Math.sin(a - 0.4)} L${x2 - s * Math.cos(a + 0.4)} ${y2 - s * Math.sin(a + 0.4)} Z`, fill: 'var(--text-muted)' })); };
    const phase = (y, h, t) => { svg.appendChild(svgEl('rect', { x: 4, y, width: 24, height: h, rx: 5, fill: 'var(--primary)', opacity: 0.85 })); svg.appendChild(svgEl('text', { x: 16, y: y + h / 2 + 3, 'font-size': 8.5, fill: '#fff', 'font-weight': 700, 'text-anchor': 'middle', transform: `rotate(-90 16 ${y + h / 2})` }, t)); };
    let y = 8;
    /* headers */
    const head = (x, w, t) => { svg.appendChild(svgEl('rect', { x, y, width: w, height: 24, rx: 6, fill: 'var(--bg-soft)', stroke: 'var(--accent)', 'stroke-width': 1.2 })); svg.appendChild(svgEl('text', { x: x + w / 2, y: y + 16, 'font-size': 10, 'font-weight': 700, 'text-anchor': 'middle', class: 'art-txt' }, t)); };
    head(X.m, colW + gap + exW, S('Identificación vía bases de datos y registros', 'Identification via databases and registers'));
    if (hasOther) head(X.m2, colW + gap + exW, S('Identificación vía otros métodos', 'Identification via other methods'));
    y += 36;
    const src = obj => Object.entries(obj).map(([k, n]) => `  ${k} (n = ${fmtNum(n)})`);
    /* identification */
    const y1 = y;
    const h1 = put(X.m, y, colW, [S('Registros identificados de:', 'Records identified from:')].concat(src(f.db.sources), [S(`  total (n = ${fmtNum(f.db.identified)})`, `  total (n = ${fmtNum(f.db.identified)})`)]));
    const h1e = put(X.e, y + 6, exW, [S('Registros eliminados antes del cribado:', 'Records removed before screening:'), S(`  duplicados (n = ${fmtNum(f.db.duplicates)})`, `  duplicates (n = ${fmtNum(f.db.duplicates)})`)], { stroke: 'var(--rose)' });
    arrow(X.m + colW, y + 6 + h1e / 2, X.e, y + 6 + h1e / 2);
    let h1b = 0;
    if (hasOther) h1b = put(X.m2, y, colW, [S('Registros identificados de:', 'Records identified from:')].concat(src(f.other.sources), f.other.duplicates ? [S(`  ya encontrados en bases de datos (n = ${fmtNum(f.other.duplicates)})`, `  already found in databases (n = ${fmtNum(f.other.duplicates)})`)] : []));
    y += Math.max(h1, h1e + 6, h1b) + 26;
    phase(y1, y - y1 - 14, S('Identificación', 'Identification'));
    /* every column remembers where its last box ends, so each arrow leaves from its own box */
    const bottom = { db: y1 + h1, other: y1 + h1b };
    const down = (x, from, to) => arrow(x + colW / 2, from, x + colW / 2, to);
    const side = (x, xe, top) => arrow(x + colW, top + 12, xe, top + 12);   // at the height of the first line
    /* screening */
    const y2 = y;
    down(X.m, bottom.db, y);
    const h2 = put(X.m, y, colW, [S(`Registros cribados (n = ${fmtNum(f.db.screened)})`, `Records screened (n = ${fmtNum(f.db.screened)})`)].concat(f.db.unread ? [S(`  no leídos tras la regla de paro: ${fmtNum(f.db.unread)}`, `  unread after the stopping rule: ${fmtNum(f.db.unread)}`)] : []));
    const h2e = put(X.e, y, exW, [S(`Registros excluidos (n = ${fmtNum(f.db.excludedTA + f.db.unread)})`, `Records excluded (n = ${fmtNum(f.db.excludedTA + f.db.unread)})`)].concat(f.db.unread ? [S(`  por los revisores: ${fmtNum(f.db.excludedTA)}`, `  by the reviewers: ${fmtNum(f.db.excludedTA)}`), S(`  no leídos tras la regla de paro: ${fmtNum(f.db.unread)}`, `  unread after the stopping rule: ${fmtNum(f.db.unread)}`)] : []), { stroke: 'var(--rose)' });
    side(X.m, X.e, y);
    bottom.db = y + h2;
    y += Math.max(h2, h2e) + 26;
    /* retrieval */
    const row = (cSide, k, x, xe, top) => {
      down(x, bottom[k], top);
      /* on the other-methods side the template has no screening box: say how many were screened there */
      const extra = k === 'other' && cSide.screened ? [S(`  cribados antes por título y resumen: ${fmtNum(cSide.screened + cSide.unread)} (excluidos: ${fmtNum(cSide.excludedTA)}${cSide.unread ? `; no leídos: ${fmtNum(cSide.unread)}` : ''})`, `  screened before on title and abstract: ${fmtNum(cSide.screened + cSide.unread)} (excluded: ${fmtNum(cSide.excludedTA)}${cSide.unread ? `; unread: ${fmtNum(cSide.unread)}` : ''})`)] : [];
      const a = put(x, top, colW, [S(`Informes buscados (n = ${fmtNum(cSide.sought)})`, `Reports sought for retrieval (n = ${fmtNum(cSide.sought)})`)].concat(extra, cSide.directToFT && cSide.screened ? [S(`  sin cribado previo: ${fmtNum(cSide.directToFT)}`, `  without prior screening: ${fmtNum(cSide.directToFT)}`)] : []));
      const b = put(xe, top, exW, [S(`Informes no recuperados (n = ${fmtNum(cSide.notRetrieved)})`, `Reports not retrieved (n = ${fmtNum(cSide.notRetrieved)})`)], { stroke: 'var(--rose)' });
      side(x, xe, top);
      bottom[k] = top + a;
      return Math.max(a, b);
    };
    const h3 = row(f.db, 'db', X.m, X.e, y);
    const h3b = hasOther ? row(f.other, 'other', X.m2, X.e2, y) : 0;
    y += Math.max(h3, h3b) + 26;
    const assess = (cSide, k, x, xe, top) => {
      down(x, bottom[k], top);
      const a = put(x, top, colW, [S(`Informes evaluados para elegibilidad (n = ${fmtNum(cSide.assessed)})`, `Reports assessed for eligibility (n = ${fmtNum(cSide.assessed)})`)]);
      const reasons = Object.entries(cSide.ftReasons).sort((p, q) => q[1] - p[1]).map(([id, n]) => `  ${reasonTxt(id)} (n = ${n})`);
      const b = put(xe, top, exW, [S(`Informes excluidos (n = ${fmtNum(cSide.excludedFT)})${reasons.length ? ':' : ''}`, `Reports excluded (n = ${fmtNum(cSide.excludedFT)})${reasons.length ? ':' : ''}`)].concat(reasons), { stroke: 'var(--rose)' });
      side(x, xe, top);
      bottom[k] = top + a;
      return Math.max(a, b);
    };
    const h4 = assess(f.db, 'db', X.m, X.e, y);
    const h4b = hasOther ? assess(f.other, 'other', X.m2, X.e2, y) : 0;
    y += Math.max(h4, h4b) + 26;
    phase(y2, y - y2 - 14, S('Cribado', 'Screening'));
    /* included: the database column comes straight down; the other-methods column
       goes down, then left, and enters the box from its right side */
    down(X.m, bottom.db, y);
    const h5 = put(X.m, y, colW, [S(`${scr ? 'Fuentes de evidencia incluidas' : 'Estudios incluidos en la revisión'} (n = ${fmtNum(f.includedStudies)})`, `${scr ? 'Sources of evidence included' : 'Studies included in review'} (n = ${fmtNum(f.includedStudies)})`), S(`Informes de ${unit} incluidos (n = ${fmtNum(f.includedReports)})`, `Reports of included ${unit} (n = ${fmtNum(f.includedReports)})`)], { stroke: 'var(--leaf)', h: 56 });
    if (hasOther) {
      const ym = y + h5 / 2;
      svg.appendChild(svgEl('path', { d: `M${X.m2 + colW / 2} ${bottom.other} L${X.m2 + colW / 2} ${ym} L${X.m + colW + 8} ${ym}`, fill: 'none', stroke: 'var(--text-muted)', 'stroke-width': 1.2 }));
      arrow(X.m + colW + 8, ym, X.m + colW, ym);
    }
    phase(y, h5, S('Incluidos', 'Included'));
    y += h5 + 12;
    if (!f.complete) {
      svg.appendChild(svgEl('text', { x: X.m, y: y + 10, 'font-size': 9, fill: 'var(--warning)', 'font-weight': 700 }, S(`Diagrama provisional: ${f.pending} registros o informes siguen pendientes.`, `Provisional diagram: ${f.pending} records or reports are still pending.`)));
      y += 18;
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${y + 6}`);
  }
  function renderFlow() {
    const svg = el('b5Flow'); if (!svg) return;
    const f = FullText.flow(flowRecords(), identified(), FT().links);
    const scr = P().type === 'scoping';
    drawFlow(svg, f, scr);
    const t = el('b5FlowTitle'); if (t) t.innerHTML = scr ? L2('Diagrama de flujo PRISMA-ScR', 'PRISMA-ScR flow diagram') : L2('Diagrama de flujo PRISMA 2020', 'PRISMA 2020 flow diagram');
    const ck = el('b5Checks');
    if (ck) { const c = FullText.checks(f); ck.innerHTML = c.length ? c.map(x => `<div class="msg msg-${x.level === 'bad' ? 'error' : 'warning'}">${two(x.msg)}</div>`).join('') : `<div class="msg msg-success">${L2('Todos los conteos están completos y cuadran.', 'Every count is complete and adds up.')}</div>`; }
    statTiles('b5Tiles', [
      [scr ? T('Fuentes incluidas', 'Sources included') : T('Estudios incluidos', 'Studies included'), fmtNum(f.includedStudies), T(`${f.includedReports} informes`, `${f.includedReports} reports`), 'ok'],
      [T('Excluidos a texto completo', 'Excluded at full text'), fmtNum(f.db.excludedFT + f.other.excludedFT), ''],
      [T('No recuperados', 'Not retrieved'), fmtNum(f.db.notRetrieved + f.other.notRetrieved), ''],
      [T('Pendientes', 'Pending'), fmtNum(f.pending), '', f.pending ? 'warn' : 'ok'],
    ]);
    state.fulltext._flow = f;
  }
  function flowMd(L) {
    const f = FullText.flow(flowRecords(), identified(), FT().links);
    const t = (es, en) => (L === 'en' ? en : es);
    const side = (c, name) => `### ${name}\n\n| ${t('Paso', 'Step')} | n |\n|---|---|\n` + Object.entries(c.sources).map(([k, n]) => `| ${t('Identificados en', 'Identified in')} ${k} | ${n} |`).join('\n') +
      `\n| ${t('Duplicados eliminados', 'Duplicates removed')} | ${c.duplicates} |\n| ${t('Cribados', 'Screened')} | ${c.screened} |\n| ${t('Excluidos en título y resumen', 'Excluded at title and abstract')} | ${c.excludedTA} |\n| ${t('No leídos tras la regla de paro', 'Unread after the stopping rule')} | ${c.unread} |\n| ${t('Informes buscados', 'Reports sought')} | ${c.sought} |\n| ${t('No recuperados', 'Not retrieved')} | ${c.notRetrieved} |\n| ${t('Evaluados', 'Assessed')} | ${c.assessed} |\n| ${t('Excluidos a texto completo', 'Excluded at full text')} | ${c.excludedFT} |\n` +
      Object.entries(c.ftReasons).map(([id, n]) => `| — ${id} | ${n} |`).join('\n') + '\n';
    return `# ${t('Flujo PRISMA', 'PRISMA flow')}\n\n` + side(f.db, t('Bases de datos y registros', 'Databases and registers')) + '\n' + (f.other.identified || f.other.unique ? side(f.other, t('Otros métodos', 'Other methods')) + '\n' : '') +
      `**${t('Estudios incluidos', 'Studies included')}: ${f.includedStudies}** · ${t('informes', 'reports')}: ${f.includedReports}${f.complete ? '' : ` · ${t('pendientes', 'pending')}: ${f.pending}`}\n`;
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    const b = el('b5Base'); if (b && document.activeElement !== b) b.value = FT().base || '';
    renderRetrieval(); renderExtra(); renderAssess(); renderConflicts(); renderFlow();
  }

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-5'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.copyfn) { navigator.clipboard && navigator.clipboard.writeText(b.dataset.copyfn).then(() => { b.textContent = T('✓ copiado', '✓ copied'); setTimeout(() => { b.innerHTML = L2('copiar nombre', 'copy name'); }, 1400); }); return; }
      if (b.dataset.ftd) { decideFT(b.dataset.ftd); return; }
      if (b.dataset.rmx != null) { const x = FT().extra.splice(+b.dataset.rmx, 1)[0]; if (x) { delete FT().reports[x.key]; } Project.touch(); renderAll(); return; }
      if (b.dataset.ftfinal) { FT().final[b.dataset.key] = { d: b.dataset.ftfinal, reason: '', t: Date.now() }; Project.touch(); renderConflicts(); renderFlow(); return; }
      if (b.classList.contains('chip') && b.dataset.f) { ftFilter = b.dataset.f; renderRetrieval(); return; }
      switch (b.id) {
        case 'b5MarkPath': toFullText().forEach(o => { const rp = report(o.key); if (rp.path && rp.retrieval === 'pending') rp.retrieval = 'retrieved'; }); Project.touch(); renderAll(); break;
        case 'b5Missing': {
          const rows = toFullText().filter(o => o.retrieval !== 'retrieved').map(o => [o.rec.title, (o.rec.authors || []).join('; '), o.rec.year, o.rec.journal, o.rec.doi, FullText.fileName(o.rec), report(o.key).note]);
          const cell = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
          download('\uFEFF' + [['title', 'authors', 'year', 'journal', 'doi', 'file name', 'note']].concat(rows).map(r => r.map(cell).join(',')).join('\r\n'), slug(P().title || 'revision') + '_pdf_por_conseguir.csv', 'text/csv;charset=utf-8');
          break;
        }
        case 'b5AddX': {
          const t = el('b5XTitle').value.trim();
          if (!t) { notice('b5Msg', 'warning', L2('Escribe al menos el título.', 'Write at least the title.')); break; }
          const x = { key: 'x:' + Date.now().toString(36), title: t, authors: el('b5XAuthors').value.split(';').map(s => s.trim()).filter(Boolean), year: +el('b5XYear').value || '', doi: Records.normDoi(el('b5XDoi').value), journal: '', how: el('b5XHow').value };
          FT().extra.push(x);
          ['b5XTitle', 'b5XAuthors', 'b5XYear', 'b5XDoi'].forEach(id => { el(id).value = ''; });
          Project.touch(); renderAll(); break;
        }
        case 'b5DlFlow': download(flowMd(I18N.lang), slug(P().title || 'revision') + '_flujo_prisma.md', 'text/markdown;charset=utf-8'); break;
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.dataset.path) { report(n.dataset.path).path = n.value; Project.touch(); return; }
      if (n.dataset.rnote) { report(n.dataset.rnote).note = n.value; Project.touch(); return; }
      if (n.id === 'b5Base') { FT().base = n.value; Project.touch(); return; }
    });
    panel.addEventListener('change', e => {
      const n = e.target;
      if (n.dataset.path) { renderRetrieval(); return; }
      if (n.dataset.ret) { report(n.dataset.ret).retrieval = n.value; Project.touch(); renderRetrieval(); renderAssess(); renderFlow(); return; }
      if (n.id === 'b5Base') { renderRetrieval(); return; }
      if (n.id === 'b5Reviewer') { SC().active = n.value; Project.touch(); renderAssess(); return; }
      if (n.dataset.ftfinalreason && n.value) { FT().final[n.dataset.ftfinalreason] = { d: 'exc', reason: n.value, t: Date.now() }; Project.touch(); renderConflicts(); renderFlow(); }
    });
    document.addEventListener('keydown', e => {
      if (!el('panel-5') || !el('panel-5').classList.contains('active')) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'i' && current) { decideFT('inc'); e.preventDefault(); }
      else if (/^[1-9]$/.test(k) && current) { const c = exclCriteria()[+k - 1]; if (c) { el('b5Reason').value = c.id; decideFT('exc'); e.preventDefault(); } }
    });
    Project.on(kind => { if (kind === 'load') renderAll(); });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 5) renderAll(); });
  }

  function init() {
    ensure(); wire(); renderAll();
    if (location.hash === '#b5') setTimeout(() => goStep(5), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 20));
  window.Block5 = { renderAll, flowRecords, toFullText, identified, flowMd, drawFlow };
})();
