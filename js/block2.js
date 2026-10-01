/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 2: the protocol, on screen.

   Plain fields carry data-b="path" (title, screening.reviewers, years.from…)
   and are written straight into state.protocol. Lists (criteria, outcomes,
   sources, team, milestones) are tables whose inputs carry data-l, data-i and
   data-f. Typing never redraws the field being typed in: only the derived
   views (the question, the checks, PRISMA-P, the registration fields and the
   schedule) are refreshed. */

(function () {

  const P = () => state.protocol;
  const two = p => L2(p[0], p[1]);
  const debounce = (fn, ms) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
  const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, path, v) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((a, k) => (a[k] = a[k] || {}), o)[last] = v; };
  let regWhich = 'prospero';

  const TYPES = ['narrative', 'scoping', 'systematic', 'meta'];

  /* ---------------- rendering of the editable parts ---------------- */
  function renderTypes() {
    const g = el('b2Types'); if (!g) return;
    g.innerHTML = TYPES.map(k => { const t = Home.TYPES[k]; return `<button class="b2-type${P().type === k ? ' on' : ''}" data-type="${k}"><span class="b2-type-art">${Art[t.art]()}</span><span><b>${two(t.name)}</b><small>${two(t.guide)}</small></span></button>`; }).join('');
  }
  function renderFrameworks() {
    const g = el('b2Fw'); if (!g) return;
    const rec = Protocol.RECOMMENDED[P().type];
    g.innerHTML = Protocol.FW_ORDER.map(k => { const f = Protocol.FRAMEWORKS[k]; return `<button class="chip${P().framework === k ? ' on' : ''}" data-fw="${k}" title="${esc(T(f.use[0], f.use[1]))}">${two(f.name)}${k === rec ? ` <span class="b2-rec">${L2('recomendado', 'recommended')}</span>` : ''}</button>`; }).join('');
    const u = el('b2FwUse'); if (u) u.innerHTML = two(Protocol.FRAMEWORKS[P().framework].use);
  }
  function renderElements() {
    const g = el('b2Elements'); if (!g) return;
    const F = Protocol.FRAMEWORKS[P().framework];
    g.innerHTML = F.el.map(x => `<div class="field${P().framework === 'FREE' ? ' wide' : ''}"><label><span class="b2-k">${x.k}</span> ${two(x.t)}${x.req ? '' : ` <span class="b2-opt">${L2('opcional', 'optional')}</span>`}</label>
      <textarea class="prose" rows="${P().framework === 'FREE' ? 3 : 2}" data-el="${x.k}" placeholder="${esc(T('p. ej., ' + x.ex[0], 'e.g., ' + x.ex[1]))}">${esc((P().elements || {})[x.k] || '')}</textarea><span class="field-help">${two(x.h)}</span></div>`).join('');
  }
  const facetOpts = () => {
    const F = Protocol.FRAMEWORKS[P().framework];
    const base = (F.el || []).map(x => [x.k, x.k + ' · ' + T(x.t[0], x.t[1])]);
    return base.concat([['design', T('diseño', 'design')], ['pub', T('publicación', 'publication')], ['data', T('datos', 'data')], ['dup', T('duplicados', 'duplicates')], ['other', T('otro', 'other')]]);
  };
  function renderCriteria() {
    const g = el('b2Criteria'); if (!g) return;
    const opts = facetOpts();
    const rows = P().criteria;
    if (!rows.length) { g.innerHTML = `<p class="hint">${L2('Aún no hay criterios. Propónlos a partir de la pregunta o añádelos a mano.', 'No criteria yet. Propose them from the question or add them by hand.')}</p>`; return; }
    g.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Clave', 'ID')}</th><th>${L2('Tipo', 'Kind')}</th><th>${L2('Faceta', 'Facet')}</th><th>${L2('Criterio', 'Criterion')}</th><th></th></tr></thead><tbody>` +
      rows.map((c, i) => `<tr class="${c.kind}"><td class="b2-id">${esc(c.id)}</td>
        <td><select data-l="criteria" data-i="${i}" data-f="kind"><option value="inc"${c.kind === 'inc' ? ' selected' : ''}>${T('inclusión', 'inclusion')}</option><option value="exc"${c.kind === 'exc' ? ' selected' : ''}>${T('exclusión', 'exclusion')}</option></select></td>
        <td><select data-l="criteria" data-i="${i}" data-f="facet">${opts.map(([v, l]) => `<option value="${v}"${c.facet === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}${opts.some(o => o[0] === c.facet) ? '' : `<option value="${esc(c.facet)}" selected>${esc(c.facet)}</option>`}</select></td>
        <td class="grow"><textarea class="prose" rows="1" data-l="criteria" data-i="${i}" data-f="text">${esc(c.text)}</textarea></td>
        <td><button class="icon-x" data-del="criteria" data-i="${i}" title="${esc(T('Quitar', 'Remove'))}">×</button></td></tr>`).join('') + '</tbody></table></div>';
  }
  function renderOutcomes() {
    const g = el('b2Outcomes'); if (!g) return;
    const rows = P().outcomes;
    g.innerHTML = rows.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Desenlace', 'Outcome')}</th><th>${L2('Papel', 'Role')}</th><th>${L2('Cómo se mide', 'How it is measured')}</th><th></th></tr></thead><tbody>` +
      rows.map((o, i) => `<tr><td class="grow"><input type="text" data-l="outcomes" data-i="${i}" data-f="name" value="${esc(o.name)}"></td>
        <td><select data-l="outcomes" data-i="${i}" data-f="role" style="min-width:130px"><option value="primary"${o.role === 'primary' ? ' selected' : ''}>${T('primario', 'primary')}</option><option value="secondary"${o.role === 'secondary' ? ' selected' : ''}>${T('secundario', 'secondary')}</option></select></td>
        <td class="grow"><input type="text" data-l="outcomes" data-i="${i}" data-f="measure" value="${esc(o.measure || '')}" placeholder="${esc(T('unidad, escala, momento', 'unit, scale, time point'))}"></td>
        <td><button class="icon-x" data-del="outcomes" data-i="${i}">×</button></td></tr>`).join('') + '</tbody></table></div>'
      : `<p class="hint">${L2('Sin desenlaces declarados.', 'No outcomes declared.')}</p>`;
  }
  function renderSources() {
    const g = el('b2Sources'); if (!g) return;
    const rows = P().sources;
    const kinds = [['db', T('base de datos', 'database')], ['grey', T('literatura gris', 'grey literature')], ['other', T('otra', 'other')]];
    g.innerHTML = rows.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Fuente', 'Source')}</th><th>${L2('Tipo', 'Kind')}</th><th>${L2('Cobertura o nota', 'Coverage or note')}</th><th></th></tr></thead><tbody>` +
      rows.map((s, i) => `<tr><td class="grow"><input type="text" data-l="sources" data-i="${i}" data-f="name" value="${esc(s.name)}"></td>
        <td><select data-l="sources" data-i="${i}" data-f="kind" style="min-width:170px">${kinds.map(([v, l]) => `<option value="${v}"${s.kind === v ? ' selected' : ''}>${l}</option>`).join('')}</select></td>
        <td class="grow"><input type="text" data-l="sources" data-i="${i}" data-f="note" value="${esc(s.note || '')}" placeholder="${esc(T('años cubiertos, interfaz, campos', 'years covered, interface, fields'))}"></td>
        <td><button class="icon-x" data-del="sources" data-i="${i}">×</button></td></tr>`).join('') + '</tbody></table></div>'
      : `<p class="hint">${L2('Sin fuentes declaradas.', 'No sources declared.')}</p>`;
  }
  function renderTeam() {
    const g = el('b2Team'); if (!g) return;
    const rows = P().team;
    g.innerHTML = rows.length ? rows.map((a, i) => {
      const bad = a.orcid && !Protocol.orcidValid(a.orcid);
      return `<div class="b2-author"><div class="form-grid">
        <div class="field"><label>${L2('Nombre', 'Name')}</label><input type="text" data-l="team" data-i="${i}" data-f="name" value="${esc(a.name)}"></div>
        <div class="field"><label>${L2('Afiliación', 'Affiliation')}</label><input type="text" data-l="team" data-i="${i}" data-f="aff" value="${esc(a.aff || '')}"></div>
        <div class="field"><label>${L2('Correo', 'E-mail')}</label><input type="text" data-l="team" data-i="${i}" data-f="email" value="${esc(a.email || '')}"></div>
        <div class="field"><label>ORCID <span class="b2-orcid" data-orcid="${i}">${a.orcid ? (bad ? '✗' : '✓') : ''}</span></label><input type="text" data-l="team" data-i="${i}" data-f="orcid" value="${esc(a.orcid || '')}" placeholder="0000-0000-0000-0000"></div>
        </div><div class="b2-roles">${Object.keys(Protocol.ROLES).map(r => `<button class="chip${(a.roles || []).includes(r) ? ' on' : ''}" data-role="${r}" data-i="${i}">${two(Protocol.ROLES[r])}</button>`).join('')}
        <label class="checkbox-label b2-contact"><input type="radio" name="b2Contact" data-contact="${i}"${P().contactIdx === i ? ' checked' : ''}> ${L2('autor de contacto', 'contact author')}</label>
        <button class="icon-x" data-del="team" data-i="${i}" title="${esc(T('Quitar', 'Remove'))}">×</button></div></div>`;
    }).join('') : `<p class="hint">${L2('Añade a los autores. El garante responde por la integridad de la revisión.', 'Add the authors. The guarantor answers for the integrity of the review.')}</p>`;
  }
  function renderMilestones() {
    const g = el('b2Milestones'); if (!g) return;
    const rows = P().milestones;
    g.innerHTML = rows.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Etapa', 'Phase')}</th><th>${L2('Inicio', 'Start')}</th><th>${L2('Término', 'End')}</th><th></th></tr></thead><tbody>` +
      rows.map((m, i) => `<tr><td class="grow"><input type="text" data-l="milestones" data-i="${i}" data-f="name" value="${esc(m.name)}"></td>
        <td><input type="date" data-l="milestones" data-i="${i}" data-f="start" value="${esc(m.start)}"></td><td><input type="date" data-l="milestones" data-i="${i}" data-f="end" value="${esc(m.end)}"></td>
        <td><button class="icon-x" data-del="milestones" data-i="${i}">×</button></td></tr>`).join('') + '</tbody></table></div>' : '';
  }
  function renderMethodsVisibility() {
    const p = P();
    const meta = p.synthesis.approach === 'meta';
    els('.b2-meta-only').forEach(n => { n.style.display = meta ? '' : 'none'; });
    els('.b2-stop-only').forEach(n => { n.style.display = p.screening.prioritized ? '' : 'none'; });
    const ap = el('b2Appraisal');
    if (ap) ap.innerHTML = Object.keys(Protocol.APPRAISAL).map(k => { const a = Protocol.APPRAISAL[k]; return `<option value="${k}"${p.appraisal.tool === k ? ' selected' : ''}>${esc(T(a.n[0], a.n[1]))}${a.for.includes(p.type) ? '' : T(' (poco usual para este tipo)', ' (unusual for this type)')}</option>`; }).join('');
    const sy = el('b2Synth');
    if (sy) sy.innerHTML = Object.keys(Protocol.SYNTH).map(k => { const s = Protocol.SYNTH[k]; return `<option value="${k}"${p.synthesis.approach === k ? ' selected' : ''}>${esc(T(s.n[0], s.n[1]))}</option>`; }).join('');
    const mt = el('b2Metric');
    if (mt) mt.innerHTML = Object.keys(Protocol.METRICS).map(k => `<option value="${k}"${p.synthesis.metric === k ? ' selected' : ''}>${esc(T(Protocol.METRICS[k][0], Protocol.METRICS[k][1]))}</option>`).join('');
    const es = el('b2Estimator');
    if (es) es.innerHTML = Object.keys(Protocol.ESTIMATORS).map(k => `<option value="${k}"${p.synthesis.estimator === k ? ' selected' : ''}>${Protocol.ESTIMATORS[k]}</option>`).join('');
  }
  /* plain fields: copy the protocol into every [data-b] */
  function fillFields() {
    els('#panel-2 [data-b]').forEach(n => {
      const v = getPath(P(), n.dataset.b);
      if (n.type === 'checkbox') n.checked = !!v;
      else if (n.dataset.b === 'pubTypes') return;
      else n.value = v == null ? '' : v;
    });
    els('#panel-2 [data-pub]').forEach(n => { n.checked = P().pubTypes.includes(n.dataset.pub); });
  }
  function renderAll() {
    if (!P()) return;
    renderTypes(); renderFrameworks(); renderElements(); renderCriteria(); renderOutcomes(); renderSources(); renderTeam(); renderMilestones();
    renderMethodsVisibility(); fillFields(); refresh();
  }

  /* ---------------- derived views ---------------- */
  const LV = { ok: ['completo', 'complete'], warn: ['revisar', 'review'], missing: ['falta', 'missing'], na: ['no aplica', 'not applicable'], later: ['en un bloque posterior', 'in a later block'], empty: ['vacío (opcional)', 'empty (optional)'] };
  function refresh() {
    const p = P(); if (!p) return;
    /* question */
    const q = el('b2Question');
    if (q) q.innerHTML = `<div class="b2-q-es">${esc(Protocol.questionOf(p, I18N.lang))}</div>`;
    const ck = el('b2Checks');
    if (ck) { const c = Protocol.checkQuestion(p); ck.innerHTML = c.length ? c.map(x => `<div class="msg msg-${x.level === 'bad' ? 'error' : x.level === 'warn' ? 'warning' : 'info'}">${two(x.msg)}</div>`).join('') : `<div class="msg msg-success">${L2('La pregunta tiene todos sus elementos.', 'The question has all its elements.')}</div>`; }
    /* completeness */
    const sc = Protocol.score(p);
    const meter = el('b2Meter');
    if (meter) meter.innerHTML = `<div class="b2-meter-bar"><span style="width:${(100 * sc.value).toFixed(0)}%"></span></div><div class="b2-meter-t"><b>${fmtPct(sc.value, 0)}</b> ${L2('del protocolo', 'of the protocol')} · ${sc.ok} ${L2('secciones completas', 'sections complete')}, ${sc.warn} ${L2('por revisar', 'to review')}, ${sc.missing} ${L2('faltan', 'missing')}</div>`;
    const secs = el('b2Sections');
    if (secs) secs.innerHTML = Protocol.sections(p).map(s => `<li class="st-${s.status}"><span class="b2-dot"></span><b>${two(s.t)}</b> <span class="b2-lv">${two(LV[s.status])}</span>${s.notes.length ? `<ul>${s.notes.map(n => `<li>${two(n)}</li>`).join('')}</ul>` : ''}</li>`).join('');
    /* PRISMA-P */
    const pp = el('b2PrismaP');
    if (pp) {
      const rows = Protocol.prismaP(p);
      const secN = { admin: ['Información administrativa', 'Administrative information'], intro: ['Introducción', 'Introduction'], methods: ['Métodos', 'Methods'] };
      let last = null, html = `<table class="b2-pp"><thead><tr><th>${L2('Ítem', 'Item')}</th><th>${L2('Qué pide', 'What it asks')}</th><th>${L2('Dónde', 'Where')}</th><th>${L2('Estado', 'Status')}</th></tr></thead><tbody>`;
      rows.forEach(r => {
        if (r.sec !== last) { last = r.sec; html += `<tr class="sec"><td colspan="4">${two(secN[r.sec])}</td></tr>`; }
        html += `<tr class="st-${r.status}"><td class="b2-id">${r.id}</td><td>${two(r.t)}</td><td class="muted">${two(r.w)}</td><td><span class="b2-pill">${two(LV[r.status])}</span></td></tr>`;
      });
      pp.innerHTML = `<div class="table-scroll">${html}</tbody></table></div>`;
      const n = rows.filter(r => r.status !== 'na'), ok = n.filter(r => r.status === 'ok').length;
      const ps = el('b2PrismaPSum'); if (ps) ps.innerHTML = L2(`${ok} de ${n.length} ítems aplicables cumplidos; ${n.filter(r => r.status === 'later').length} se cumplen en bloques posteriores.`, `${ok} of ${n.length} applicable items met; ${n.filter(r => r.status === 'later').length} are met in later blocks.`);
    }
    renderRegistration();
    drawGantt();
    const home = el('b2TypeNote');
    if (home) { const t = Home.TYPES[p.type]; home.innerHTML = L2(`Ruta de ${p.type === "meta" ? "un" : "una"} <b>${t.name[0].toLowerCase()}</b>: bloques necesarios ${t.req.join(', ')}${t.opt.length ? `; opcionales ${t.opt.join(', ')}` : ''}. Guía de reporte: ${t.guide[0]}.`, `Route of a <b>${t.name[1].toLowerCase()}</b>: required blocks ${t.req.join(', ')}${t.opt.length ? `; optional ${t.opt.join(', ')}` : ''}. Reporting guideline: ${t.guide[1]}.`); }
  }
  function renderRegistration() {
    const box = el('b2Reg'); if (!box) return;
    const p = P(), L = p.registration.lang || 'en';
    els('#b2RegTabs button').forEach(b => b.classList.toggle('on', b.dataset.reg === regWhich));
    els('#b2RegLang button').forEach(b => b.classList.toggle('on', b.dataset.rl === L));
    const rows = Protocol.registration(p, regWhich, L);
    const fit = Protocol.registryFit(p, regWhich);
    const cl = Protocol.contentLang(p);
    const langNote = cl && cl !== L ? `<div class="msg msg-warning">${L === 'en'
      ? L2('Tus textos parecen estar en español y el registro se genera en inglés: los campos saldrán mezclados. PROSPERO pide el registro en inglés; traduce el título, la pregunta y los criterios antes de copiarlos.', 'Your texts look Spanish and the registration is generated in English: the fields will come out mixed. PROSPERO asks for English; translate the title, question and criteria before copying them.')
      : L2('Tus textos parecen estar en inglés y el registro se genera en español: cambia a EN o traduce los textos.', 'Your texts look English and the registration is generated in Spanish: switch to EN or translate the texts.')}</div>` : '';
    const fitBox = el('b2RegFit'); if (fitBox) fitBox.innerHTML = `<div class="msg msg-${fit.ok ? 'info' : 'warning'}">${two(fit.msg)}</div>${langNote}`;
    let sec = null;
    box.innerHTML = rows.map((r, i) => {
      let head = '';
      if (r.sec && r.sec[0] !== sec) { sec = r.sec[0]; head = `<div class="b2-reg-sec">${two(r.sec)}</div>`; }
      return `${head}<div class="b2-reg-row st-${r.status}"><div class="b2-reg-h"><b>${two(r.t)}</b>${r.req ? '<span class="b2-req">*</span>' : ''}<span class="b2-pill">${two(LV[r.status])}</span>${r.text ? `<button class="btn btn-ghost btn-sm" data-copy="${i}">${L2('Copiar', 'Copy')}</button>` : ''}</div><div class="b2-reg-t">${r.text ? esc(r.text).replace(/\n/g, '<br>') : `<i>${L2('por completar en el protocolo', 'to be completed in the protocol')}</i>`}</div></div>`;
    }).join('');
    const miss = rows.filter(r => r.status === 'missing').length;
    const s = el('b2RegSum'); if (s) s.innerHTML = miss ? L2(`Faltan ${miss} campos obligatorios (*).`, `${miss} required fields (*) are missing.`) : L2('Todos los campos obligatorios tienen texto. Revísalos antes de copiarlos al registro.', 'Every required field has text. Review them before copying them into the registry.');
    box._rows = rows;
  }

  /* ---------------- the schedule ---------------- */
  function drawGantt() {
    const svg = el('b2Gantt'); if (!svg) return;
    const ms = P().milestones.filter(m => parseISO(m.start) && parseISO(m.end));
    Plot.clear(svg);
    const W = 640, rowH = 20, top = 30, left = 170;
    if (!ms.length) { Plot.empty(svg, W, 90, T('Sin etapas: usa «Proponer cronograma» o añádelas a mano.', 'No phases: use "Propose schedule" or add them by hand.')); return; }
    const dn = s => { const d = parseISO(s); return dayNumber(d.y, d.m, d.d); };
    const a = Math.min(...ms.map(m => dn(m.start))), b = Math.max(...ms.map(m => dn(m.end)));
    const H = top + ms.length * rowH + 16;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const sx = d => left + (d - a) / Math.max(1, b - a) * (W - left - 14);
    /* month ticks */
    let d0 = fromDayNumber(a); let cur = { y: d0.y, m: d0.m, d: 1 };
    while (dayNumber(cur.y, cur.m, 1) <= b) {
      const x = sx(Math.max(a, dayNumber(cur.y, cur.m, 1)));
      svg.appendChild(svgEl('line', { x1: x, x2: x, y1: top - 6, y2: H - 10, stroke: 'var(--border)', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: x + 3, y: top - 10, 'font-size': 8.5, class: 'art-mut' }, `${monthName(cur.m, true)}${cur.m === 1 || x === sx(a) ? ' ' + String(cur.y).slice(2) : ''}`));
      cur = cur.m === 12 ? { y: cur.y + 1, m: 1, d: 1 } : { y: cur.y, m: cur.m + 1, d: 1 };
    }
    ms.forEach((m, i) => {
      const y = top + i * rowH;
      svg.appendChild(svgEl('text', { x: 8, y: y + 13, 'font-size': 9.5, class: 'art-txt' }, m.name.length > 30 ? m.name.slice(0, 29) + '…' : m.name));
      svg.appendChild(svgEl('rect', { x: sx(dn(m.start)), y: y + 3, width: Math.max(2, sx(dn(m.end)) - sx(dn(m.start))), height: rowH - 7, rx: 4, fill: `var(--c${(i % 10) + 1})`, opacity: 0.85 }));
    });
    const today = new Date(), td = dayNumber(today.getFullYear(), today.getMonth() + 1, today.getDate());
    if (td >= a && td <= b) { svg.appendChild(svgEl('line', { x1: sx(td), x2: sx(td), y1: top - 4, y2: H - 10, stroke: 'var(--c4)', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' })); svg.appendChild(svgEl('text', { x: sx(td) + 3, y: H - 4, 'font-size': 8.5, fill: 'var(--c4)' }, T('hoy', 'today'))); }
  }

  /* ---------------- the protocol document ---------------- */
  function protocolHTML(L) {
    const p = P();
    const rows = Protocol.registration(p, 'osf', L);
    const pp = Protocol.prismaP(p);
    const e = s => esc(s).replace(/\n/g, '<br>');
    let body = `<h1>${e(p.title || (L === 'en' ? 'Untitled review' : 'Revisión sin título'))}</h1><p class="sub">${e(L === 'en' ? 'Review protocol' : 'Protocolo de revisión')} · ${e(Protocol.registration(p, 'osf', L).find(r => r.k === 'type').text)}${p.registration.id ? ' · ' + e(p.registration.id) : ''}</p>`;
    let sec = null;
    rows.forEach(r => {
      if (r.k === 'title') return;
      if (r.sec[0] !== sec) { sec = r.sec[0]; body += `<h2>${e(L === 'en' ? r.sec[1] : r.sec[0])}</h2>`; }
      if (r.text) body += `<h3>${e(L === 'en' ? r.t[1] : r.t[0])}</h3><p>${e(r.text)}</p>`;
    });
    body += `<h2>${L === 'en' ? 'PRISMA-P 2015 checklist' : 'Lista PRISMA-P 2015'}</h2><table><tr><th>${L === 'en' ? 'Item' : 'Ítem'}</th><th>${L === 'en' ? 'Topic' : 'Tema'}</th><th>${L === 'en' ? 'Status' : 'Estado'}</th></tr>` +
      pp.map(r => `<tr><td>${r.id}</td><td>${e(L === 'en' ? r.t[1] : r.t[0])}</td><td>${e(L === 'en' ? LV[r.status][1] : LV[r.status][0])}</td></tr>`).join('') + '</table>';
    if (p.milestones.length) body += `<h2>${L === 'en' ? 'Schedule' : 'Cronograma'}</h2><table><tr><th>${L === 'en' ? 'Phase' : 'Etapa'}</th><th>${L === 'en' ? 'Start' : 'Inicio'}</th><th>${L === 'en' ? 'End' : 'Término'}</th></tr>` + p.milestones.map(m => `<tr><td>${e(m.name)}</td><td>${e(m.start)}</td><td>${e(m.end)}</td></tr>`).join('') + '</table>';
    return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${e(p.title || 'Protocol')}</title><style>
      body{font-family:Georgia,'Times New Roman',serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.55;color:#1b1b1b}
      h1{font-size:1.55rem;line-height:1.25;margin:0 0 6px}.sub{color:#555;margin:0 0 24px}h2{font-size:1.15rem;margin:28px 0 8px;border-bottom:1px solid #ccc;padding-bottom:3px}
      h3{font-size:.95rem;margin:14px 0 2px}p{margin:0 0 8px}table{border-collapse:collapse;width:100%;font-size:.85rem}td,th{border:1px solid #bbb;padding:4px 7px;text-align:left;vertical-align:top}th{background:#f1f1f1}
      .foot{margin-top:30px;color:#777;font-size:.78rem}@media print{body{margin:0}}</style></head><body>${body}
      <p class="foot">${L === 'en' ? 'Generated with' : 'Generado con'} ReviewPro ${APP_VERSION} · ${new Date().toISOString().slice(0, 10)}</p></body></html>`;
  }

  /* ---------------- events ---------------- */
  const later = debounce(refresh, 250);
  function changed(full) { Project.touch(); if (full) renderAll(); else later(); }

  function wire() {
    const panel = el('panel-2'); if (!panel) return;
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.dataset.b) {
        if (n.dataset.b === 'pubTypes') return;
        let v = n.type === 'checkbox' ? n.checked : n.type === 'number' ? (n.value === '' ? '' : Number(n.value)) : n.value;
        setPath(P(), n.dataset.b, v);
        changed(['synthesis.approach', 'screening.prioritized'].includes(n.dataset.b) ? 'methods' : false);
        if (n.dataset.b === 'synthesis.approach' || n.dataset.b === 'screening.prioritized') renderMethodsVisibility();
        return;
      }
      if (n.dataset.el) { P().elements[n.dataset.el] = n.value; changed(); return; }
      if (n.dataset.l) {
        const item = P()[n.dataset.l][+n.dataset.i];
        item[n.dataset.f] = n.value;
        if (n.dataset.l === 'criteria' && n.dataset.f === 'kind') { P().criteria = Protocol.numberCriteria(P().criteria); renderCriteria(); }
        if (n.dataset.l === 'team' && n.dataset.f === 'orcid') { const m = panel.querySelector(`[data-orcid="${n.dataset.i}"]`); if (m) m.textContent = n.value ? (Protocol.orcidValid(n.value) ? '✓' : '✗') : ''; }
        changed();
        return;
      }
      if (n.dataset.pub) { const s = new Set(P().pubTypes); if (n.checked) s.add(n.dataset.pub); else s.delete(n.dataset.pub); P().pubTypes = [...s]; changed(); return; }
      if (n.dataset.contact != null) { P().contactIdx = +n.dataset.contact; changed(); }
    });
    panel.addEventListener('change', e => { if (e.target.tagName === 'SELECT' && e.target.dataset.l) e.target.dispatchEvent(new Event('input', { bubbles: true })); });
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.type) {
        const p = P(); const was = p.type; p.type = b.dataset.type; state.reviewType = p.type;
        if (Protocol.RECOMMENDED[was] === p.framework) p.framework = Protocol.RECOMMENDED[p.type];
        if (Protocol.DEFAULT_SYNTH[was] === p.synthesis.approach) p.synthesis.approach = Protocol.DEFAULT_SYNTH[p.type];
        if (p.type === 'meta') p.synthesis.approach = 'meta';
        Prefs.set('type', p.type);
        changed(true); return;
      }
      if (b.dataset.fw) { P().framework = b.dataset.fw; changed(true); return; }
      if (b.dataset.del) { P()[b.dataset.del].splice(+b.dataset.i, 1); if (b.dataset.del === 'criteria') P().criteria = Protocol.numberCriteria(P().criteria); if (b.dataset.del === 'team' && P().contactIdx >= P().team.length) P().contactIdx = 0; changed(true); return; }
      if (b.dataset.role) { const a = P().team[+b.dataset.i]; a.roles = a.roles || []; const k = a.roles.indexOf(b.dataset.role); if (k >= 0) a.roles.splice(k, 1); else a.roles.push(b.dataset.role); b.classList.toggle('on', k < 0); changed(); return; }
      if (b.dataset.reg) { regWhich = b.dataset.reg; P().registration.registry = regWhich; renderRegistration(); Project.touch(); return; }
      if (b.dataset.rl) { P().registration.lang = b.dataset.rl; renderRegistration(); Project.touch(); return; }
      if (b.dataset.copy != null) { const r = el('b2Reg')._rows[+b.dataset.copy]; if (r && navigator.clipboard) navigator.clipboard.writeText(r.text).then(() => { b.textContent = T('✓ Copiado', '✓ Copied'); setTimeout(() => { b.innerHTML = L2('Copiar', 'Copy'); }, 1500); }); return; }
      switch (b.id) {
        case 'b2SeedCrit': {
          const add = Protocol.seedCriteria(P(), I18N.lang);
          const have = new Set(P().criteria.map(c => c.text.trim()));
          P().criteria = Protocol.numberCriteria(P().criteria.concat(add.filter(c => !have.has(c.text.trim()))));
          changed(true); break;
        }
        case 'b2AddInc': P().criteria.push({ kind: 'inc', facet: 'other', text: '' }); P().criteria = Protocol.numberCriteria(P().criteria); changed(true); break;
        case 'b2AddExc': P().criteria.push({ kind: 'exc', facet: 'other', text: '' }); P().criteria = Protocol.numberCriteria(P().criteria); changed(true); break;
        case 'b2AddOut': P().outcomes.push({ name: '', role: P().outcomes.some(o => o.role === 'primary') ? 'secondary' : 'primary', measure: '' }); changed(true); break;
        case 'b2AddSrc': P().sources.push({ name: '', kind: 'db', note: '' }); changed(true); break;
        case 'b2AddAuthor': P().team.push({ name: '', aff: '', email: '', orcid: '', roles: [] }); changed(true); break;
        case 'b2AddMs': P().milestones.push({ name: '', start: P().dates.start || '', end: P().dates.end || '' }); changed(true); break;
        case 'b2Plan': {
          const p = P();
          if (!parseISO(p.dates.start)) { notice('b2Msg', 'warning', L2('Primero escribe la fecha de inicio.', 'First enter the start date.')); break; }
          const months = parseISO(p.dates.end) ? Math.max(1, (dayNumber(...Object.values(parseISO(p.dates.end))) - dayNumber(...Object.values(parseISO(p.dates.start)))) / 30.44) : Protocol.MONTHS_DEFAULT[p.type];
          p.milestones = Protocol.schedule(p.type, p.dates.start, months, I18N.lang);
          if (!parseISO(p.dates.end)) p.dates.end = p.milestones[p.milestones.length - 1].end;
          changed(true); break;
        }
        case 'b2New': {
          if (!confirm(T('¿Empezar un protocolo nuevo? El actual se perderá si no lo guardaste en un archivo.', 'Start a new protocol? The current one is lost unless you saved it to a file.'))) break;
          Project.fresh(P().type); break;
        }
        case 'b2Save': Project.download(); break;
        case 'b2Open': el('b2File').click(); break;
        case 'b2LoadEx': {
          const k = el('b2ExSel').value, ex = Examples[k];
          if (!ex) break;
          if (P().title && !confirm(T('¿Reemplazar el protocolo actual por el ejemplo?', 'Replace the current protocol with the example?'))) break;
          Project.fresh(ex.protocol.type);
          state.protocol = Protocol.normalize(JSON.parse(JSON.stringify(ex.protocol)));
          state.reviewType = state.protocol.type;
          state.protocol.milestones = Protocol.schedule(state.protocol.type, state.protocol.dates.start, null, I18N.lang);
          Project.touch(); renderAll();
          clearMessages('b2Msg'); notice('b2Msg', 'info', L2('Ejemplo cargado. Es ficticio: úsalo para ver un protocolo completo y cambia lo que quieras.', 'Example loaded. It is fictitious: use it to see a complete protocol and change whatever you like.'));
          break;
        }
        case 'b2DlReg': { const L = P().registration.lang || 'en'; download(Protocol.registrationText(P(), regWhich, L), slug(P().title || 'registro') + '_' + regWhich + '.md', 'text/markdown;charset=utf-8'); break; }
        case 'b2DlProto': { const L = P().registration.lang || 'en'; download(protocolHTML(L), slug(P().title || 'protocolo') + '_protocol.html', 'text/html;charset=utf-8'); break; }
      }
    });
    const f = el('b2File');
    if (f) f.addEventListener('change', () => {
      const file = f.files[0]; if (!file) return;
      /* opening redraws every block: it runs in the work window; an error message closes it without the check mark */
      rvAfterPaint(() => Project.open(file).then(() => { clearMessages('b2Msg'); notice('b2Msg', 'success', L2(`Proyecto abierto: ${esc(file.name)}.`, `Project opened: ${esc(file.name)}.`)); })
        .catch(err => { clearMessages('b2Msg'); notice('b2Msg', 'error', esc(err.message)); }), rvWork('Abriendo el proyecto', 'Opening the project'));
      f.value = '';
    });
    Project.on(kind => {
      if (kind === 'load') renderAll();
      if (kind === 'saved') { const s = el('b2Saved'); if (s) s.innerHTML = L2(`Guardado en este navegador a las ${new Date().toTimeString().slice(0, 5)}`, `Saved in this browser at ${new Date().toTimeString().slice(0, 5)}`); }
    });
    document.addEventListener('langchange', () => { if (P()) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 2 && P()) renderAll(); });
  }

  function init() {
    if (!Project.loadLocal()) state.protocol = Protocol.blank(Prefs.get('type', 'systematic'));
    state.reviewType = state.protocol.type;
    wire();
    renderAll();
    /* links: #b2 opens this block; ?ex=meta|scoping|narrative loads an example */
    const ex = (location.search.match(/[?&]ex=(\w+)/) || [])[1];
    if (ex && Examples[ex]) { const s = el('b2ExSel'); s.value = ex; const c = window.confirm; window.confirm = () => true; el('b2LoadEx').click(); window.confirm = c; }
    if (location.hash === '#b2' || ex) setTimeout(() => goStep(2), 0);
  }
  document.addEventListener('DOMContentLoaded', init);
  window.Block2 = { renderAll, refresh, protocolHTML };
})();
