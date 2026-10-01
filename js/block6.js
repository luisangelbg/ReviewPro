/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 6: data extraction, on screen.

   The included studies come from Block 5 (one study may have several
   reports). Each reviewer fills the form and the effect rows of each study;
   with double extraction the differences are reconciled field by field. The
   final tables —study characteristics and effects— feed Block 8. */

(function () {

  const two = p => L2(p[0], p[1]);
  const EX = () => state.extraction;
  const P = () => state.protocol || Protocol.blank('systematic');
  const SC = () => state.screening || { reviewers: [], active: null };
  const rids = () => SC().reviewers.map(r => r.id);
  const nameOf = id => (SC().reviewers.find(r => r.id === id) || { name: '?' }).name;
  let currentStudy = null, editing = null;   // editing: index of the effect row open in the editor

  function ensure() {
    if (!state.extraction) state.extraction = { fields: [], values: {}, effects: {}, final: {}, finalEffects: {}, imputeCV: false };
    const x = state.extraction;
    ['values', 'effects', 'final', 'finalEffects'].forEach(k => { if (!x[k] || typeof x[k] !== 'object') x[k] = {}; });
    if (!Array.isArray(x.fields)) x.fields = [];
    if (!x.fields.length && state.protocol) x.fields = Extract.template(P().type, P(), I18N.lang);
    return x;
  }
  const active = () => SC().active || (rids()[0] || 'r0');
  const myVals = s => { const a = active(); EX().values[a] = EX().values[a] || {}; return (EX().values[a][s] = EX().values[a][s] || {}); };
  const myEff = s => { const a = active(); EX().effects[a] = EX().effects[a] || {}; return (EX().effects[a][s] = EX().effects[a][s] || []); };

  /* ---------------- the included studies ---------------- */
  function studies() {
    if (!window.Block5 || !state.fulltext) return [];
    const recs = Block5.flowRecords(), byKey = new Map(recs.map(r => [r.key, r.rec]));
    const f = FullText.flow(recs, Block5.identified(), state.fulltext.links);
    return f.groups.map(g => {
      const ks = g.slice().sort(), r = byKey.get(ks[0]);
      const a = (r.authors || [])[0] || '';
      const sur = a.includes(',') ? a.split(',')[0] : a.split(/\s+/).slice(-1)[0];
      return { id: ks[0], reports: ks.map(k => byKey.get(k)), rec: r, label: `${sur || 'Anon'} ${r.year || 's.f.'}` };
    }).sort((x, y) => x.label.localeCompare(y.label));
  }

  /* ---------------- 1 · the form ---------------- */
  function renderForm() {
    const box = el('b6Fields'); if (!box) return;
    const fs = EX().fields;
    box.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Sección', 'Section')}</th><th>${L2('Campo', 'Field')}</th><th>${L2('Tipo', 'Type')}</th><th>${L2('Opciones (separadas por ;)', 'Options (separated by ;)')}</th><th>${L2('Oblig.', 'Req.')}</th><th></th></tr></thead><tbody>` +
      fs.map((f, i) => `<tr><td><input type="text" data-ff="${i}" data-k="section" value="${esc(f.section || '')}" style="width:130px" aria-label="${esc(T(`Sección del campo ${i + 1}`, `Section of field ${i + 1}`))}"></td>
        <td class="grow"><input type="text" data-ff="${i}" data-k="label" value="${esc(f.label)}" aria-label="${esc(T(`Nombre del campo ${i + 1}`, `Name of field ${i + 1}`))}"></td>
        <td><select data-ff="${i}" data-k="type" style="min-width:170px" aria-label="${esc(T(`Tipo del campo ${i + 1}`, `Type of field ${i + 1}`))}">${Object.keys(Extract.TYPES).map(k => `<option value="${k}"${f.type === k ? ' selected' : ''}>${esc(T(Extract.TYPES[k][0], Extract.TYPES[k][1]))}</option>`).join('')}</select></td>
        <td><input type="text" data-ff="${i}" data-k="options" value="${esc(f.options || '')}" aria-label="${esc(T(`Opciones del campo ${i + 1}`, `Options of field ${i + 1}`))}" ${f.type === 'select' || f.type === 'multi' ? '' : 'disabled'}></td>
        <td class="c"><input type="checkbox" data-ff="${i}" data-k="required"${f.required ? ' checked' : ''} aria-label="${esc(T(`Campo ${i + 1} obligatorio`, `Field ${i + 1} required`))}"></td>
        <td class="b6-mv"><button class="icon-x" data-up="${i}" title="↑">↑</button><button class="icon-x" data-rmf="${i}">×</button></td></tr>`).join('') + '</tbody></table></div>';
  }

  /* ---------------- 2 · extraction of one study ---------------- */
  function progress(s, rid) {
    const v = ((EX().values[rid] || {})[s.id]) || {};
    const req = EX().fields.filter(f => f.required);
    const done = req.filter(f => !Extract.blankVal(v[f.id])).length;
    const eff = (((EX().effects[rid] || {})[s.id]) || []).length;
    return { done, req: req.length, eff };
  }
  function renderStudies() {
    const box = el('b6Studies'); if (!box) return;
    const st = studies();
    if (!st.length) { box.innerHTML = `<p class="hint">${L2('Todavía no hay estudios incluidos (Bloque 5).', 'There are no included studies yet (Block 5).')}</p>`; el('b6Study').innerHTML = ''; return; }
    if (!currentStudy || !st.some(s => s.id === currentStudy)) currentStudy = st[0].id;
    box.innerHTML = st.map(s => {
      const pr = rids().map(r => { const p = progress(s, r); return `<span class="b6-dot ${p.done >= p.req && (p.eff || P().type !== 'meta') ? 'ok' : p.done || p.eff ? 'half' : ''}" title="${esc(nameOf(r))}: ${p.done}/${p.req}, ${p.eff} ${T('efectos', 'effects')}"></span>`; }).join('');
      return `<button class="b6-st${s.id === currentStudy ? ' on' : ''}" data-study="${esc(s.id)}"><b>${esc(s.label)}</b><span>${esc(s.rec.title.slice(0, 64))}${s.rec.title.length > 64 ? '…' : ''}</span><i>${pr}${s.reports.length > 1 ? ` · ${s.reports.length} ${T('informes', 'reports')}` : ''}</i></button>`;
    }).join('');
    renderStudy();
  }
  function fieldInput(f, v) {
    const a = `data-fv="${f.id}"`;
    switch (f.type) {
      case 'long': return `<textarea class="prose" rows="2" ${a}>${esc(v || '')}</textarea>`;
      case 'number': return `<input type="number" step="any" ${a} value="${esc(v == null ? '' : v)}">`;
      case 'select': return `<select ${a}><option value="">—</option>${Extract.optionsOf(f).map(o => `<option${v === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}${v && !Extract.optionsOf(f).includes(v) ? `<option selected>${esc(v)}</option>` : ''}</select>`;
      case 'multi': { const cur = Array.isArray(v) ? v : []; return `<div class="b6-multi">${Extract.optionsOf(f).map(o => `<label class="checkbox-label"><input type="checkbox" data-fm="${f.id}" value="${esc(o)}"${cur.includes(o) ? ' checked' : ''}> ${esc(o)}</label>`).join('')}<input type="text" data-fmx="${f.id}" placeholder="${esc(T('otras, separadas por ;', 'others, separated by ;'))}" value="${esc(cur.filter(x => !Extract.optionsOf(f).includes(x)).join('; '))}"></div>`; }
      case 'yesno': return `<select ${a}><option value="">—</option><option value="yes"${v === 'yes' ? ' selected' : ''}>${esc(T('sí', 'yes'))}</option><option value="no"${v === 'no' ? ' selected' : ''}>no</option></select>`;
      case 'location': { const l = v || {}; return `<div class="b6-loc"><input type="number" step="any" data-fl="${f.id}" data-c="lat" value="${esc(l.lat == null ? '' : l.lat)}" placeholder="lat" aria-label="${esc(f.label + ' · ' + T('latitud', 'latitude'))}"><input type="number" step="any" data-fl="${f.id}" data-c="lon" value="${esc(l.lon == null ? '' : l.lon)}" placeholder="lon" aria-label="${esc(f.label + ' · ' + T('longitud', 'longitude'))}">${l.lat !== undefined && l.lat !== '' && !Extract.validLocation(l) ? '<span class="b3-flag">?</span>' : ''}</div>`; }
      default: return `<input type="text" ${a} value="${esc(v || '')}">`;
    }
  }
  function renderStudy() {
    const box = el('b6Study'); if (!box) return;
    const s = studies().find(x => x.id === currentStudy); if (!s) { box.innerHTML = ''; return; }
    const vals = myVals(s.id);
    const secs = [];
    EX().fields.forEach(f => { const k = f.section || ''; if (!secs.includes(k)) secs.push(k); });
    const r = s.rec;
    box.innerHTML = `<div class="b6-head"><h3 class="b4-title">${esc(r.title)}</h3><div class="b4-meta">${esc((r.authors || []).slice(0, 4).join('; '))} · <b>${r.year || '—'}</b> · <i>${esc(r.journal || '')}</i>${s.reports.length > 1 ? ` · ${L2(`${s.reports.length} informes del mismo estudio`, `${s.reports.length} reports of the same study`)}` : ''}</div>
      ${(() => { const rp = (state.fulltext.reports || {})[s.id] || {}; const u = FullText.fileUrl(rp.path, state.fulltext.base); return u ? `<a class="btn btn-secondary btn-sm" href="${esc(u)}" target="_blank" rel="noopener">${L2('Abrir el PDF', 'Open the PDF')}</a>` : ''; })()}</div>` +
      secs.map(sec => `<div class="b6-sec">${sec ? `<div class="b4-stop-h">${esc(sec)}</div>` : ''}<div class="form-grid">${EX().fields.filter(f => (f.section || '') === sec).map(f => `<div class="field${f.type === 'long' || f.type === 'multi' ? ' wide' : ''}"><label>${esc(f.label)}${f.required ? ' <span class="b2-req">*</span>' : ''}</label>${fieldInput(f, vals[f.id])}</div>`).join('')}</div></div>`).join('') +
      `<div class="b6-sec"><div class="b4-stop-h">${L2('Tamaños de efecto', 'Effect sizes')}</div><div id="b6Effects"></div>
        <div class="btn-row" style="margin-top:6px"><button class="btn btn-secondary btn-sm" id="b6AddEff">${L2('+ efecto', '+ effect')}</button></div><div id="b6Editor"></div></div>`;
    renderEffects();
  }

  /* ---------------- effects of the study ---------------- */
  const metricName = m => (Protocol.METRICS[m] ? T(Protocol.METRICS[m][0], Protocol.METRICS[m][1]) : m);
  function newRow() {
    const outs = P().outcomes.filter(o => o.name);
    return { outcome: (outs.find(o => o.role === 'primary') || outs[0] || { name: '' }).name, label: '', subgroup: '', input: 'arms', metric: P().synthesis.metric || 'ROM',
      T: { mean: '', n: '', disp: { type: 'sd' } }, C: { mean: '', n: '', disp: { type: 'sd' } }, anova: { type: 'lsd', alpha: 0.05, design: 'rcbd' }, stat: { sign: 1, level: 0.95 }, counts: {}, corr: {}, direct: {}, note: '' };
  }
  function fmtRes(res) {
    if (!res.ok) return `<span class="b6-err">${two(res.error)}</span>`;
    return `<b>${metricName(res.metric)}</b>: ${fmtFixed(res.yi, 4)} · SE ${fmtFixed(res.se, 4)} · IC 95 % [${fmtFixed(res.ci[0], 3)}, ${fmtFixed(res.ci[1], 3)}]${res.pct != null ? ` · <b>${res.pct >= 0 ? '+' : '−'}${fmtFixed(Math.abs(res.pct), 1)} %</b>` : ''}`;
  }
  function renderEffects(skipEditor) {
    const box = el('b6Effects'); if (!box) return;
    const rows = myEff(currentStudy);
    box.innerHTML = rows.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>#</th><th>${L2('Desenlace', 'Outcome')}</th><th>${L2('Comparación', 'Comparison')}</th><th>${L2('Resultado', 'Result')}</th><th></th></tr></thead><tbody>${rows.map((r, i) => {
      const res = Extract.result(Object.assign({}, r, { imputedCV: imputedCV() }));
      return `<tr class="${editing === i ? 'b6-editing' : ''}"><td>${i + 1}</td><td>${esc(r.outcome || '—')}</td><td>${esc(r.label || '—')}${r.subgroup ? `<div class="muted">${esc(r.subgroup)}</div>` : ''}</td><td>${fmtRes(res)}</td><td class="b6-mv"><button class="btn btn-ghost btn-sm" data-edit="${i}">${L2('editar', 'edit')}</button><button class="icon-x" data-dup="${i}" title="${esc(T('Duplicar', 'Duplicate'))}">⧉</button><button class="icon-x" data-rme="${i}">×</button></td></tr>`;
    }).join('')}</tbody></table></div>` : `<p class="hint">${L2('Sin efectos. Un estudio puede aportar varios: un desenlace por fila, y una fila por cada comparación, sitio o ciclo que reporte por separado.', 'No effects. A study may contribute several: one outcome per row, and one row for each comparison, site or season it reports separately.')}</p>`;
    if (!skipEditor) renderEditor();
  }
  const inp = (path, v, ph, type) => `<input type="${type || 'number'}" step="any" data-e="${path}" value="${esc(v == null ? '' : v)}" placeholder="${esc(ph || '')}">`;
  function renderEditor() {
    const box = el('b6Editor'); if (!box) return;
    if (editing == null) { box.innerHTML = ''; return; }
    const r = myEff(currentStudy)[editing]; if (!r) { editing = null; box.innerHTML = ''; return; }
    const outs = P().outcomes.filter(o => o.name).map(o => o.name);
    const arm = (k, lab) => {
      const A = r[k];
      if (r.input === 'medians') return `<div class="b6-arm"><b>${lab}</b><label>n ${inp(k + '.n', A.n)}</label><label>${L2('Mediana', 'Median')} ${inp(k + '.median', A.median)}</label>
        <label>${L2('Con', 'With')} <select data-e="${k}.center"><option value="iqr"${A.center !== 'range' ? ' selected' : ''}>${esc(T('cuartiles', 'quartiles'))}</option><option value="range"${A.center === 'range' ? ' selected' : ''}>${esc(T('mínimo y máximo', 'minimum and maximum'))}</option></select></label>
        ${A.center === 'range' ? `<label>${L2('Mínimo', 'Minimum')} ${inp(k + '.min', A.min)}</label><label>${L2('Máximo', 'Maximum')} ${inp(k + '.max', A.max)}</label>` : `<label>Q1 ${inp(k + '.q1', A.q1)}</label><label>Q3 ${inp(k + '.q3', A.q3)}</label>`}</div>`;
      const disp = r.input === 'arms' ? `<label>${L2('Dispersión', 'Dispersion')} <select data-e="${k}.disp.type">${Object.keys(Extract.DISP).map(d => `<option value="${d}"${A.disp.type === d ? ' selected' : ''}>${esc(T(Extract.DISP[d][0], Extract.DISP[d][1]))}</option>`).join('')}</select></label>
        ${A.disp.type === 'ci' ? `<label>${L2('Inferior', 'Lower')} ${inp(k + '.disp.lo', A.disp.lo)}</label><label>${L2('Superior', 'Upper')} ${inp(k + '.disp.hi', A.disp.hi)}</label>` : `<label>${L2('Valor', 'Value')} ${inp(k + '.disp.value', A.disp.value)}</label>`}` : '';
      return `<div class="b6-arm"><b>${lab}</b><label>${L2('Media', 'Mean')} ${inp(k + '.mean', A.mean)}</label><label>n ${inp(k + '.n', A.n)}</label>${disp}</div>`;
    };
    let body = '';
    if (['arms', 'anova', 'medians', 't', 'F', 'p', 'diffci'].includes(r.input)) {
      const needMeans = ['arms', 'anova', 'medians'].includes(r.input);
      body += needMeans ? `<div class="b6-arms">${arm('T', T('Tratamiento', 'Treatment'))}${arm('C', T('Testigo', 'Control'))}</div>` : `<div class="b6-arms"><div class="b6-arm"><b>${L2('Tratamiento', 'Treatment')}</b><label>n ${inp('T.n', r.T.n)}</label></div><div class="b6-arm"><b>${L2('Testigo', 'Control')}</b><label>n ${inp('C.n', r.C.n)}</label></div></div>`;
    }
    if (r.input === 'anova') {
      const a = r.anova;
      body += `<div class="b6-arms"><div class="b6-arm wide"><b>ANOVA</b><label>${L2('Estadístico', 'Statistic')} <select data-e="anova.type">${Object.keys(Extract.ANOVA).map(k => `<option value="${k}"${a.type === k ? ' selected' : ''}>${esc(T(Extract.ANOVA[k][0], Extract.ANOVA[k][1]))}</option>`).join('')}</select></label><label>${L2('Valor', 'Value')} ${inp('anova.value', a.value)}</label>
        <label>${L2('Repeticiones r', 'Replicates r')} ${inp('anova.r', a.r, T('= n si se deja vacío', '= n if left empty'))}</label>
        ${a.type === 'lsd' ? `<label>α ${inp('anova.alpha', a.alpha)}</label><label>${L2('gl del error', 'error df')} ${inp('anova.dfe', a.dfe, T('o diseño y tratamientos', 'or design and treatments'))}</label><label>${L2('Diseño', 'Design')} <select data-e="anova.design"><option value="rcbd"${a.design === 'rcbd' ? ' selected' : ''}>${esc(T('bloques al azar', 'randomized blocks'))}</option><option value="crd"${a.design === 'crd' ? ' selected' : ''}>${esc(T('completamente al azar', 'completely randomized'))}</option><option value="latin"${a.design === 'latin' ? ' selected' : ''}>${esc(T('cuadrado latino', 'Latin square'))}</option></select></label><label>${L2('Tratamientos k', 'Treatments k')} ${inp('anova.k', a.k)}</label>` : ''}
        ${a.type === 'cvexp' ? `<label>${L2('Media general', 'Grand mean')} ${inp('anova.grand', a.grand)}</label>` : ''}</div></div>`;
    }
    if (['t', 'F', 'p', 'diffci'].includes(r.input)) {
      const s = r.stat;
      body += `<div class="b6-arms"><div class="b6-arm wide"><b>${two(Extract.INPUTS[r.input])}</b>${r.input === 't' ? `<label>t ${inp('stat.t', s.t)}</label>` : ''}${r.input === 'F' ? `<label>F ${inp('stat.F', s.F)}</label>` : ''}${r.input === 'p' ? `<label>p ${inp('stat.p', s.p)}</label>` : ''}
        ${r.input === 'diffci' ? `<label>${L2('Diferencia', 'Difference')} ${inp('stat.diff', s.diff)}</label><label>${L2('Inferior', 'Lower')} ${inp('stat.lo', s.lo)}</label><label>${L2('Superior', 'Upper')} ${inp('stat.hi', s.hi)}</label><label>${L2('Nivel', 'Level')} ${inp('stat.level', s.level)}</label>` : ''}
        ${r.input === 'F' || r.input === 'p' ? `<label>${L2('Dirección', 'Direction')} <select data-e="stat.sign"><option value="1"${+s.sign !== -1 ? ' selected' : ''}>${esc(T('tratamiento mayor', 'treatment higher'))}</option><option value="-1"${+s.sign === -1 ? ' selected' : ''}>${esc(T('tratamiento menor', 'treatment lower'))}</option></select></label>` : ''}</div></div>`;
    }
    if (r.input === 'counts') body += `<div class="b6-arms"><div class="b6-arm wide"><b>${L2('Tabla 2×2', '2×2 table')}</b><label>${L2('Tratamiento con evento', 'Treatment with event')} ${inp('counts.a', r.counts.a)}</label><label>${L2('Tratamiento sin evento', 'Treatment without event')} ${inp('counts.b', r.counts.b)}</label><label>${L2('Testigo con evento', 'Control with event')} ${inp('counts.c', r.counts.c)}</label><label>${L2('Testigo sin evento', 'Control without event')} ${inp('counts.d', r.counts.d)}</label></div></div>`;
    if (r.input === 'corr') body += `<div class="b6-arms"><div class="b6-arm wide"><b>${L2('Correlación', 'Correlation')}</b><label>r ${inp('corr.r', r.corr.r)}</label><label>n ${inp('corr.n', r.corr.n)}</label></div></div>`;
    if (r.input === 'direct') body += `<div class="b6-arms"><div class="b6-arm wide"><b>${L2('Efecto', 'Effect')}</b><label>${L2('Efecto (en la escala de la medida)', 'Effect (on the measure scale)')} ${inp('direct.yi', r.direct.yi)}</label><label>SE ${inp('direct.se', r.direct.se)}</label><label>${L2('o IC 95 %: inferior', 'or 95 % CI: lower')} ${inp('direct.lo', r.direct.lo)}</label><label>${L2('superior', 'upper')} ${inp('direct.hi', r.direct.hi)}</label></div></div>`;
    const res = Extract.result(Object.assign({}, r, { imputedCV: imputedCV() }));
    box.innerHTML = `<div class="b6-editor"><div class="form-grid">
      <div class="field"><label>${L2('Desenlace', 'Outcome')}</label><input type="text" list="b6Outs" data-e="outcome" value="${esc(r.outcome || '')}"><datalist id="b6Outs">${outs.map(o => `<option value="${esc(o)}">`).join('')}</datalist></div>
      <div class="field"><label>${L2('Comparación, sitio o ciclo', 'Comparison, site or season')}</label><input type="text" data-e="label" value="${esc(r.label || '')}" placeholder="${esc(T('p. ej., sitio 2, ciclo 2021', 'e.g., site 2, 2021 season'))}"></div>
      <div class="field"><label>${L2('Subgrupo o nota de moderador', 'Subgroup or moderator note')}</label><input type="text" data-e="subgroup" value="${esc(r.subgroup || '')}"></div>
      <div class="field"><label>${L2('Qué reporta el artículo', 'What the paper reports')}</label><select data-e="input">${Object.keys(Extract.INPUTS).map(k => `<option value="${k}"${r.input === k ? ' selected' : ''}>${esc(T(Extract.INPUTS[k][0], Extract.INPUTS[k][1]))}</option>`).join('')}</select></div>
      <div class="field"><label>${L2('Medida del efecto', 'Effect measure')}</label><select data-e="metric">${Object.keys(Protocol.METRICS).map(k => `<option value="${k}"${r.metric === k ? ' selected' : ''}>${esc(metricName(k))}</option>`).join('')}</select></div></div>
      ${body}
      <div class="b6-res">${fmtRes(res)}${res.steps && res.steps.length ? `<div class="b6-steps">${res.steps.map(esc).join('<br>')}</div>` : ''}${(res.warn || []).map(w => `<div class="msg msg-warning">${two(w)}</div>`).join('')}</div>
      <div class="field wide"><label>${L2('Nota (de dónde salió cada número: tabla, figura, página)', 'Note (where each number came from: table, figure, page)')}</label><input type="text" data-e="note" value="${esc(r.note || '')}"></div>
      <div class="btn-row"><button class="btn btn-primary btn-sm" id="b6Done">${L2('Listo', 'Done')}</button></div></div>`;
  }
  function setPath(o, path, v) { const ks = path.split('.'); const last = ks.pop(); ks.reduce((a, k) => (a[k] = a[k] || {}), o)[last] = v; }

  /* ---------------- final values and reconciliation ---------------- */
  function finalValue(sid, f) {
    const fin = (EX().final[sid] || {})[f.id];
    if (fin !== undefined) return { v: fin, s: 'final' };
    const vs = rids().map(r => ((EX().values[r] || {})[sid] || {})[f.id]).filter(v => !Extract.blankVal(v));
    if (!vs.length) return { v: '', s: 'empty' };
    if (vs.every(v => Extract.same(v, vs[0], f))) return { v: vs[0], s: 'agreed' };
    return { v: null, s: 'conflict', vs };
  }
  /* reviewers are compared on the numbers they took from the paper, without imputation (which would also recurse) */
  const effSig = rows => rows.map(r => { const x = Extract.result(r); return `${(r.outcome || '').toLowerCase()}|${(r.label || '').toLowerCase()}|${x.ok ? x.yi.toFixed(4) : 'x'}`; }).sort().join('\n');
  function finalEffects(sid) {
    const pick = EX().finalEffects[sid];
    if (pick && (EX().effects[pick] || {})[sid]) return { rows: EX().effects[pick][sid], s: 'final', by: pick };
    const withRows = rids().filter(r => ((EX().effects[r] || {})[sid] || []).length);
    if (!withRows.length) return { rows: [], s: 'empty' };
    if (withRows.length === 1) return { rows: EX().effects[withRows[0]][sid], s: 'single', by: withRows[0] };
    const sigs = withRows.map(r => effSig(EX().effects[r][sid]));
    if (sigs.every(x => x === sigs[0])) return { rows: EX().effects[withRows[0]][sid], s: 'agreed', by: withRows[0] };
    return { rows: [], s: 'conflict', by: withRows };
  }
  function renderCompare() {
    const box = el('b6Compare'); if (!box) return;
    if (rids().length < 2) { box.innerHTML = `<p class="hint">${L2('Con un solo revisor no hay extracción doble que comparar.', 'With a single reviewer there is no double extraction to compare.')}</p>`; return; }
    const out = [];
    studies().forEach(s => {
      const confF = EX().fields.map(f => ({ f, x: finalValue(s.id, f) })).filter(o => o.x.s === 'conflict');
      const fe = finalEffects(s.id);
      if (!confF.length && fe.s !== 'conflict') return;
      out.push(`<div class="b3-pair"><b>${esc(s.label)}</b> <span class="muted">${esc(s.rec.title.slice(0, 80))}</span>
        ${confF.map(o => `<div class="b6-cf"><span>${esc(o.f.label)}</span>${rids().map(r => { const v = ((EX().values[r] || {})[s.id] || {})[o.f.id]; return Extract.blankVal(v) ? '' : `<button class="btn btn-secondary btn-sm" data-pickv="${esc(s.id)}|${o.f.id}|${r}">${esc(nameOf(r))}: ${esc(Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? `${v.lat}, ${v.lon}` : String(v))}</button>`; }).join('')}</div>`).join('')}
        ${fe.s === 'conflict' ? `<div class="b6-cf"><span>${L2('Tamaños de efecto', 'Effect sizes')}</span>${fe.by.map(r => `<button class="btn btn-secondary btn-sm" data-picke="${esc(s.id)}|${r}">${L2('usar los de', 'use those of')} ${esc(nameOf(r))} (${EX().effects[r][s.id].length})</button>`).join('')}</div>` : ''}</div>`);
    });
    box.innerHTML = out.length ? out.join('') : `<div class="msg msg-success">${L2('Las extracciones coinciden (o ya se conciliaron).', 'The extractions agree (or were already reconciled).')}</div>`;
  }

  /* ---------------- 4 · final tables ---------------- */
  /* the mean CV is read by every row of a redraw: it is kept for a moment
     instead of being recomputed row by row */
  let cvMemo = { t: 0, v: null };
  function imputedCV() {
    if (!EX().imputeCV) return null;
    if (Date.now() - cvMemo.t < 300) return cvMemo.v;
    const arms = [];
    studies().forEach(s => finalEffects(s.id).rows.forEach(r => {
      if (r.input !== 'arms') return;
      ['T', 'C'].forEach(k => { const A = r[k]; const sd = Extract.armSD(A.disp || {}, +A.n, +A.mean); arms.push({ mean: A.mean, sd: sd ? sd.sd : '' }); });
    }));
    const r = Extract.imputeCV(arms);
    cvMemo = { t: Date.now(), v: r ? r.cv : null };
    return cvMemo.v;
  }
  function effectRows() {
    const out = [], cv = imputedCV();
    studies().forEach(s => {
      finalEffects(s.id).rows.forEach((r, i) => {
        const res = Extract.result(Object.assign({}, r, { imputedCV: cv }));
        const mods = {};
        EX().fields.forEach(f => { const v = finalValue(s.id, f).v; mods[f.label] = Array.isArray(v) ? v.join('; ') : v && typeof v === 'object' ? `${v.lat}, ${v.lon}` : v == null ? '' : v; });
        out.push({ study: s.label, studyId: s.id, row: i + 1, outcome: r.outcome, comparison: r.label, subgroup: r.subgroup, input: r.input, metric: res.metric || r.metric, ok: !!res.ok, yi: res.yi, vi: res.vi, se: res.se, lo: res.ci && res.ci[0], hi: res.ci && res.ci[1], pct: res.pct,
          m1: res.m1, sd1: res.sd1, n1: r.T && r.T.n, m2: res.m2, sd2: res.sd2, n2: r.C && r.C.n, imputed: !!res.imputed, note: r.note, mods });
      });
    });
    return out;
  }
  function renderTables() {
    const st = studies(), er = effectRows();
    const confl = st.filter(s => EX().fields.some(f => finalValue(s.id, f).s === 'conflict') || finalEffects(s.id).s === 'conflict').length;
    statTiles('b6Tiles', [
      [T('Estudios incluidos', 'Included studies'), fmtNum(st.length), ''],
      [T('Con extracción completa', 'With complete extraction'), fmtNum(st.filter(s => EX().fields.filter(f => f.required).every(f => !Extract.blankVal(finalValue(s.id, f).v))).length), '', ''],
      [T('Tamaños de efecto', 'Effect sizes'), fmtNum(er.filter(r => r.ok).length), T(`${er.filter(r => !r.ok).length} incompletos`, `${er.filter(r => !r.ok).length} incomplete`), er.some(r => !r.ok) ? 'warn' : ''],
      [T('Por conciliar', 'To reconcile'), fmtNum(confl), T('estudios con diferencias', 'studies with differences'), confl ? 'warn' : 'ok'],
    ]);
    const cvBox = el('b6CV');
    if (cvBox) { const cv = (() => { const s = EX().imputeCV; EX().imputeCV = true; const v = imputedCV(); EX().imputeCV = s; return v; })(); const missing = er.filter(r => !r.ok && r.input === 'arms').length; cvBox.innerHTML = missing || EX().imputeCV ? `<label class="checkbox-label"><input type="checkbox" id="b6Impute"${EX().imputeCV ? ' checked' : ''}> ${L2(`Imputar las DE faltantes con el coeficiente de variación medio de los demás grupos (CV = ${cv != null ? fmtPct(cv, 1) : '—'}); se marcan como imputadas y conviene un análisis de sensibilidad sin ellas.`, `Impute missing SDs with the mean coefficient of variation of the other groups (CV = ${cv != null ? fmtPct(cv, 1) : '—'}); they are flagged as imputed and a sensitivity analysis without them is advisable.`)}</label>` : ''; }
    const t1 = el('b6Chars');
    if (t1) {
      const fs = EX().fields;
      t1.innerHTML = st.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Estudio', 'Study')}</th>${fs.map(f => `<th>${esc(f.label)}</th>`).join('')}</tr></thead><tbody>${st.map(s => `<tr><td><b>${esc(s.label)}</b></td>${fs.map(f => { const x = finalValue(s.id, f); const v = x.v; return `<td class="${x.s === 'conflict' ? 'b6-conf' : ''}">${x.s === 'conflict' ? '≠' : esc(Array.isArray(v) ? v.join(', ') : v && typeof v === 'object' ? `${v.lat}, ${v.lon}` : v == null ? '' : String(v))}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    }
    const t2 = el('b6EffTable');
    if (t2) t2.innerHTML = er.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Estudio', 'Study')}</th><th>${L2('Desenlace', 'Outcome')}</th><th>${L2('Comparación', 'Comparison')}</th><th>${L2('Medida', 'Measure')}</th><th class="num">yi</th><th class="num">vi</th><th class="num">${L2('IC 95 %', '95 % CI')}</th><th class="num">%</th><th>${L2('Origen', 'Source')}</th></tr></thead><tbody>${er.map(r => `<tr class="${r.ok ? '' : 'b6-conf'}"><td>${esc(r.study)}</td><td>${esc(r.outcome || '')}</td><td>${esc(r.comparison || '')}</td><td>${esc(r.metric)}</td><td class="num">${r.ok ? fmtFixed(r.yi, 4) : '—'}</td><td class="num">${r.ok ? fmtFixed(r.vi, 5) : '—'}</td><td class="num">${r.ok ? `[${fmtFixed(r.lo, 3)}, ${fmtFixed(r.hi, 3)}]` : '—'}</td><td class="num">${r.pct != null ? fmtFixed(r.pct, 1) : ''}</td><td>${esc(T(Extract.INPUTS[r.input][0], Extract.INPUTS[r.input][1]))}${r.imputed ? ` <span class="b2-pill">${L2('DE imputada', 'imputed SD')}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>` : `<p class="hint">${L2('Sin tamaños de efecto todavía.', 'No effect sizes yet.')}</p>`;
  }
  const cell = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function charsCSV() {
    const fs = EX().fields, st = studies();
    const rows = [['study', 'title', 'year', 'doi'].concat(fs.map(f => f.label))].concat(st.map(s => [s.label, s.rec.title, s.rec.year, s.rec.doi].concat(fs.map(f => { const v = finalValue(s.id, f).v; return Array.isArray(v) ? v.join('; ') : v && typeof v === 'object' ? `${v.lat}, ${v.lon}` : v == null ? 'CONFLICT' : v; }))));
    return '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';
  }
  function effectsCSV() {
    const er = effectRows(), mods = EX().fields.map(f => f.label);
    const head = ['study', 'row', 'outcome', 'comparison', 'subgroup', 'metric', 'yi', 'vi', 'se', 'ci_lo', 'ci_hi', 'pct_change', 'mean_t', 'sd_t', 'n_t', 'mean_c', 'sd_c', 'n_c', 'input', 'sd_imputed', 'note'].concat(mods);
    return '﻿' + [head.map(cell).join(',')].concat(er.filter(r => r.ok).map(r => [r.study, r.row, r.outcome, r.comparison, r.subgroup, r.metric, r.yi, r.vi, r.se, r.lo, r.hi, r.pct == null ? '' : r.pct, r.m1, r.sd1, r.n1, r.m2, r.sd2, r.n2, r.input, r.imputed ? 1 : 0, r.note].concat(mods.map(m => r.mods[m])).map(cell).join(','))).join('\r\n') + '\r\n';
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    const rv = el('b6Reviewer'); if (rv) rv.innerHTML = SC().reviewers.map(r => `<option value="${r.id}"${r.id === active() ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
    renderForm(); renderStudies(); renderCompare(); renderTables();
  }
  const refreshLight = () => { renderEffects(); renderTables(); renderCompare(); const st = el('b6Studies'); if (st) { const cur = currentStudy; renderStudiesOnly(); currentStudy = cur; } };
  function renderStudiesOnly() {
    const box = el('b6Studies'); if (!box) return;
    const keep = box.scrollTop;
    const html = studies().map(s => { const pr = rids().map(r => { const p = progress(s, r); return `<span class="b6-dot ${p.done >= p.req && (p.eff || P().type !== 'meta') ? 'ok' : p.done || p.eff ? 'half' : ''}"></span>`; }).join(''); return `<button class="b6-st${s.id === currentStudy ? ' on' : ''}" data-study="${esc(s.id)}"><b>${esc(s.label)}</b><span>${esc(s.rec.title.slice(0, 64))}${s.rec.title.length > 64 ? '…' : ''}</span><i>${pr}${s.reports.length > 1 ? ` · ${s.reports.length} ${T('informes', 'reports')}` : ''}</i></button>`; }).join('');
    box.innerHTML = html; box.scrollTop = keep;
  }

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-6'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.study) { currentStudy = b.dataset.study; editing = null; renderStudiesOnly(); renderStudy(); return; }
      if (b.dataset.up != null) { const i = +b.dataset.up; if (i > 0) { const f = EX().fields; [f[i - 1], f[i]] = [f[i], f[i - 1]]; Project.touch(); renderForm(); renderStudy(); } return; }
      if (b.dataset.rmf != null) { if (!confirm(T('¿Quitar este campo? Los valores ya capturados en él se conservan en el proyecto pero dejan de mostrarse.', 'Remove this field? Values already entered stay in the project but are no longer shown.'))) return; EX().fields.splice(+b.dataset.rmf, 1); Project.touch(); renderAll(); return; }
      if (b.dataset.edit != null) { editing = +b.dataset.edit; renderEffects(); return; }
      if (b.dataset.dup != null) { const rows = myEff(currentStudy); rows.splice(+b.dataset.dup + 1, 0, JSON.parse(JSON.stringify(rows[+b.dataset.dup]))); editing = +b.dataset.dup + 1; Project.touch(); refreshLight(); return; }
      if (b.dataset.rme != null) { myEff(currentStudy).splice(+b.dataset.rme, 1); editing = null; Project.touch(); refreshLight(); return; }
      if (b.dataset.pickv) { const [sid, fid, r] = b.dataset.pickv.split('|'); EX().final[sid] = EX().final[sid] || {}; EX().final[sid][fid] = EX().values[r][sid][fid]; Project.touch(); renderCompare(); renderTables(); return; }
      if (b.dataset.picke) { const [sid, r] = b.dataset.picke.split('|'); EX().finalEffects[sid] = r; Project.touch(); renderCompare(); renderTables(); return; }
      switch (b.id) {
        case 'b6AddField': EX().fields.push({ id: 'f' + Date.now().toString(36), label: T('Campo nuevo', 'New field'), type: 'text', options: '', required: false, section: '' }); Project.touch(); renderForm(); renderStudy(); break;
        case 'b6Template': if (!confirm(T('¿Reemplazar el formulario por la plantilla del tipo de revisión? Los valores ya capturados se conservan pero los campos nuevos tendrán otra clave.', 'Replace the form with the review type template? Values already entered are kept but new fields get other keys.'))) break; EX().fields = Extract.template(P().type, P(), I18N.lang); Project.touch(); renderAll(); break;
        case 'b6AddEff': myEff(currentStudy).push(newRow()); editing = myEff(currentStudy).length - 1; Project.touch(); refreshLight(); break;
        case 'b6Done': editing = null; renderEffects(); break;
        case 'b6DlChars': download(charsCSV(), slug(P().title || 'revision') + '_caracteristicas.csv', 'text/csv;charset=utf-8'); break;
        case 'b6DlEff': download(effectsCSV(), slug(P().title || 'revision') + '_efectos.csv', 'text/csv;charset=utf-8'); break;
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.dataset.ff != null) { const f = EX().fields[+n.dataset.ff]; f[n.dataset.k] = n.type === 'checkbox' ? n.checked : n.value; if (n.dataset.k === 'type') { renderForm(); } Project.touch(); if (n.dataset.k !== 'label' && n.dataset.k !== 'section' && n.dataset.k !== 'options') renderStudy(); return; }
      if (n.dataset.fv) { const f = EX().fields.find(x => x.id === n.dataset.fv); myVals(currentStudy)[n.dataset.fv] = f && f.type === 'number' ? (n.value === '' ? '' : +n.value) : n.value; Project.touch(); renderTables(); renderCompare(); return; }
      if (n.dataset.fm || n.dataset.fmx) {
        const fid = n.dataset.fm || n.dataset.fmx, box = n.closest('.b6-multi');
        const vals = [...box.querySelectorAll('[data-fm]:checked')].map(x => x.value).concat(String(box.querySelector('[data-fmx]').value || '').split(/\s*;\s*/).map(s => s.trim()).filter(Boolean));
        myVals(currentStudy)[fid] = vals; Project.touch(); renderTables(); return;
      }
      if (n.dataset.fl) { const v = myVals(currentStudy); v[n.dataset.fl] = Object.assign({}, v[n.dataset.fl] || {}, { [n.dataset.c]: n.value === '' ? '' : +n.value }); Project.touch(); renderTables(); return; }
      if (n.dataset.e && editing != null) {
        const r = myEff(currentStudy)[editing];
        const numeric = n.type === 'number';
        setPath(r, n.dataset.e, numeric ? (n.value === '' ? '' : +n.value) : n.value);
        Project.touch();
        if (n.tagName === 'SELECT') { renderEditor(); refreshLight(); }
        else { const res = Extract.result(Object.assign({}, r, { imputedCV: imputedCV() })); const rb = panel.querySelector('.b6-res'); if (rb) rb.innerHTML = fmtRes(res) + (res.steps && res.steps.length ? `<div class="b6-steps">${res.steps.map(esc).join('<br>')}</div>` : '') + (res.warn || []).map(w => `<div class="msg msg-warning">${two(w)}</div>`).join(''); }
        return;
      }
      if (n.id === 'b6Impute') { cvMemo.t = 0; EX().imputeCV = n.checked; Project.touch(); renderTables(); renderEffects(); }
    });
    panel.addEventListener('change', e => {
      const n = e.target;
      if (n.id === 'b6Reviewer') { SC().active = n.value; Project.touch(); editing = null; renderAll(); return; }
      if (n.dataset.e && n.type !== 'number' && n.tagName !== 'SELECT') { renderEffects(true); renderTables(); renderCompare(); }
      if (n.dataset.e && n.type === 'number') { renderEffects(true); renderTables(); }
    });
    Project.on(kind => { if (kind === 'load') { currentStudy = null; editing = null; renderAll(); } });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 6) renderAll(); });
  }

  function init() {
    ensure(); wire(); renderAll();
    if (location.hash === '#b6') setTimeout(() => goStep(6), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 30));
  window.Block6 = { renderAll, studies, effectRows, finalValue, finalEffects, charsCSV, effectsCSV, imputedCV };
})();
