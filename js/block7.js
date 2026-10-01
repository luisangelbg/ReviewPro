/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 7: quality, risk of bias and certainty, on screen.

   One tool for the whole review (chosen in the protocol, changeable here).
   Each reviewer assesses each included study; with two reviewers the
   domains that differ are reconciled. The final judgements feed the
   traffic-light and summary plots and the GRADE rating of every outcome,
   whose pooled effect comes from the effects table of Block 6. */

(function () {

  const two = p => L2(p[0], p[1]);
  const AP = () => state.appraisal;
  const P = () => state.protocol || Protocol.blank('systematic');
  const SC = () => state.screening || { reviewers: [], active: null };
  const rids = () => SC().reviewers.map(r => r.id);
  const nameOf = id => (SC().reviewers.find(r => r.id === id) || { name: '?' }).name;
  const active = () => SC().active || rids()[0] || 'r0';
  let current = null;

  function ensure() {
    if (!state.appraisal) state.appraisal = { tool: null, by: {}, final: {}, grade: {}, weighted: false };
    const a = state.appraisal;
    ['by', 'final', 'grade'].forEach(k => { if (!a[k] || typeof a[k] !== 'object') a[k] = {}; });
    if (!a.tool || !Appraisal.TOOLS[a.tool]) a.tool = P().appraisal.tool && Appraisal.TOOLS[P().appraisal.tool] ? P().appraisal.tool : 'agro';
    return a;
  }
  const tool = () => Appraisal.TOOLS[AP().tool];
  const mine = sid => { const a = active(); AP().by[a] = AP().by[a] || {}; return (AP().by[a][sid] = AP().by[a][sid] || { answers: {}, override: {}, support: {}, stars: {} }); };
  const studies = () => (window.Block6 ? Block6.studies() : []);
  const jPill = j => (j ? `<span class="b7-j" style="--jc:${Appraisal.J[j].c}">${Appraisal.J[j].s} ${two(Appraisal.J[j].t)}</span>` : `<span class="b7-j none">${L2('pendiente', 'pending')}</span>`);

  /* ---------------- final judgement of a study ---------------- */
  function finalOf(sid) {
    const t = tool(), ids = rids().filter(r => (AP().by[r] || {})[sid]);
    const fin = AP().final[sid] || {};
    const res = ids.map(r => Appraisal.assess(AP().tool, AP().by[r][sid]));
    const out = { domains: {}, overall: null, conflicts: [], by: ids };
    t.domains.forEach((d, i) => {
      if (fin[d.id]) { out.domains[d.id] = fin[d.id]; return; }
      const js = res.map(x => x.domains[i].j).filter(Boolean);
      if (!js.length) return;
      if (js.every(j => j === js[0])) out.domains[d.id] = js[0]; else out.conflicts.push(d.id);
    });
    if (fin.overall) out.overall = fin.overall;
    else {
      const os = res.map(x => x.overall).filter(Boolean);
      if (os.length && os.every(o => o === os[0]) && !out.conflicts.length) out.overall = os[0];
      else if (os.length && !out.conflicts.length && t.mode !== 'stars') out.overall = Appraisal.overall(t.domains.map(d => out.domains[d.id]), t.scale);
      else if (os.length && t.mode === 'stars' && os.every(o => o === os[0])) out.overall = os[0];
      else if (os.length) out.conflicts.push('overall');
    }
    return out;
  }
  /* inverse-variance weight of each study for one outcome (all its effect rows) */
  function weights(outcome) {
    const w = {};
    if (!window.Block6) return w;
    Block6.effectRows().filter(r => r.ok && (!outcome || r.outcome === outcome)).forEach(r => { w[r.studyId] = (w[r.studyId] || 0) + 1 / r.vi; });
    return w;
  }

  /* ---------------- the assessment form ---------------- */
  function renderList(noForm) {
    const box = el('b7Studies'); if (!box) return;
    const st = studies();
    if (!st.length) { box.innerHTML = `<p class="hint">${L2('Todavía no hay estudios incluidos (Bloque 5).', 'There are no included studies yet (Block 5).')}</p>`; el('b7Form').innerHTML = ''; return; }
    if (!current || !st.some(s => s.id === current)) current = st[0].id;
    box.innerHTML = st.map(s => { const f = finalOf(s.id); const me = (AP().by[active()] || {})[s.id]; const mj = me ? Appraisal.assess(AP().tool, me).overall : null; return `<button class="b6-st${s.id === current ? ' on' : ''}" data-study="${esc(s.id)}"><b>${esc(s.label)}</b><span>${esc(s.rec.title.slice(0, 60))}…</span><i>${L2('tu juicio', 'yours')}: ${mj ? two(Appraisal.J[mj].t) : '—'}${f.conflicts.length ? ` · <span class="b3-flag">≠</span>` : ''}</i></button>`; }).join('');
    if (!noForm) renderForm();
  }
  function renderForm() {
    const box = el('b7Form'); if (!box) return;
    const s = studies().find(x => x.id === current); if (!s) { box.innerHTML = ''; return; }
    const t = tool(), a = mine(s.id), res = Appraisal.assess(AP().tool, a);
    const scaleOpts = (sel, attrs) => `<select ${attrs}><option value="">${esc(T('— automático —', '— automatic —'))}</option>${t.scale.concat(['ni']).map(j => `<option value="${j}"${sel === j ? ' selected' : ''}>${esc(T(Appraisal.J[j].t[0], Appraisal.J[j].t[1]))}</option>`).join('')}</select>`;
    let body = '';
    if (t.mode === 'stars') {
      body = `<div class="form-grid">${t.domains.map(d => `<div class="field"><label>${two(d.t)} (0–${d.max} ★)</label><input type="number" min="0" max="${d.max}" data-star="${d.id}" value="${esc((a.stars || {})[d.id] ?? '')}"></div>`).join('')}</div><p class="hint">${L2(`Total: ${res.total} de 9 estrellas → ${res.overall ? T(Appraisal.J[res.overall].t[0], '') : '—'} (7–9 bajo riesgo, 5–6 algunas dudas, 0–4 alto).`, `Total: ${res.total} of 9 stars → ${res.overall ? Appraisal.J[res.overall].t[1] : '—'} (7–9 low risk, 5–6 some concerns, 0–4 high).`)}</p>`;
    } else {
      body = t.domains.map((d, i) => {
        const dr = res.domains[i];
        const qs = t.mode === 'questions' ? d.qs.map(qq => `<div class="b7-q"><div class="b7-qt">${esc(qq.id)} · ${two(qq.t)}${qq.key ? ` <span class="b7-key" title="${esc(T('Pregunta clave: una respuesta negativa lleva el dominio a riesgo alto', 'Key question: a negative answer takes the domain to high risk'))}">●</span>` : ''}</div><div class="b7-ans">${Object.keys(Appraisal.ANS).map(k => `<button class="chip${(a.answers || {})[qq.id] === k ? ' on' : ''}" data-ans="${qq.id}" data-v="${k}">${two(Appraisal.ANS[k])}</button>`).join('')}</div></div>`).join('') : '';
        return `<div class="b7-dom"><div class="b7-dh"><b>${esc(d.id)} · ${two(d.t)}</b>${jPill(dr.j)}${dr.overridden ? `<span class="b2-pill">${L2('ajustado', 'adjusted')}</span>` : ''}</div>${qs}
          <div class="b7-ov"><label class="inline-label">${t.mode === 'questions' ? L2('Ajustar el juicio', 'Adjust the judgement') : L2('Juicio', 'Judgement')} ${scaleOpts((a.override[d.id] || {}).j || '', `data-ov="${d.id}"`)}</label>
          <input type="text" data-why="${d.id}" aria-label="${esc(T(`Justificación del ajuste, dominio ${d.id}`, `Justification of the adjustment, domain ${d.id}`))}" value="${esc((a.override[d.id] || {}).why || '')}" placeholder="${esc(T('justificación (obligatoria si ajustas)', 'justification (required if you adjust)'))}"></div>
          <textarea class="prose" rows="1" data-sup="${d.id}" aria-label="${esc(T(`Evidencia del juicio, dominio ${d.id}`, `Evidence for the judgement, domain ${d.id}`))}" placeholder="${esc(T('Cita o evidencia del artículo que respalda el juicio', 'Quote or evidence from the paper supporting the judgement'))}">${esc((a.support || {})[d.id] || '')}</textarea></div>`;
      }).join('');
    }
    const missingWhy = t.mode !== 'stars' && t.domains.some(d => (a.override[d.id] || {}).j && t.mode === 'questions' && !String((a.override[d.id] || {}).why || '').trim());
    box.innerHTML = `<h3 class="b4-title">${esc(s.rec.title)}</h3><div class="b4-meta">${esc(s.label)} · ${esc(s.rec.journal || '')}</div>${body}
      <div class="b7-overall">${L2('Juicio global', 'Overall judgement')}: ${jPill(res.overall)}${t.mode !== 'stars' ? ` <label class="inline-label">${L2('ajustar', 'adjust')} ${scaleOpts((a.override.overall || {}).j || '', 'data-ov="overall"')}</label>` : ''}</div>
      ${missingWhy ? `<div class="msg msg-warning">${L2('Escribe la justificación de cada juicio ajustado.', 'Write the justification of every adjusted judgement.')}</div>` : ''}`;
  }

  /* ---------------- reconciliation ---------------- */
  function renderRecon() {
    const box = el('b7Recon'); if (!box) return;
    if (rids().length < 2) { box.innerHTML = `<p class="hint">${L2('Con un solo revisor no hay juicios que conciliar.', 'With a single reviewer there are no judgements to reconcile.')}</p>`; return; }
    const t = tool(), scale = (t.scale || ['low', 'some', 'high']).concat(['ni']);
    const rows = studies().map(s => ({ s, f: finalOf(s.id) })).filter(x => x.f.conflicts.length);
    const agr = (() => {
      const [a, b] = rids(); const xs = [], ys = [];
      studies().forEach(s => { const A = (AP().by[a] || {})[s.id], B = (AP().by[b] || {})[s.id]; if (!A || !B) return; const ra = Appraisal.assess(AP().tool, A), rb = Appraisal.assess(AP().tool, B); ra.domains.forEach((d, i) => { if (d.j && rb.domains[i].j) { xs.push(d.j); ys.push(rb.domains[i].j); } }); });
      return xs.length ? Screening.cohen(xs, ys) : null;
    })();
    box.innerHTML = (agr ? `<p class="hint">${L2(`Acuerdo por dominio entre ${esc(nameOf(rids()[0]))} y ${esc(nameOf(rids()[1]))}: ${fmtPct(agr.po, 0)}, κ = ${fmtFixed(agr.kappa, 2)} (${Screening.landis(agr.kappa)[0]}) sobre ${agr.n} juicios.`, `Agreement per domain between ${esc(nameOf(rids()[0]))} and ${esc(nameOf(rids()[1]))}: ${fmtPct(agr.po, 0)}, κ = ${fmtFixed(agr.kappa, 2)} (${Screening.landis(agr.kappa)[1]}) over ${agr.n} judgements.`)}</p>` : '') +
      (rows.length ? rows.map(({ s, f }) => `<div class="b3-pair"><b>${esc(s.label)}</b>${f.conflicts.map(d => `<div class="b6-cf"><span>${d === 'overall' ? L2('Global', 'Overall') : esc(d)}</span>${f.by.map(r => { const x = Appraisal.assess(AP().tool, AP().by[r][s.id]); const j = d === 'overall' ? x.overall : (x.domains.find(y => y.id === d) || {}).j; return `<span class="b4-d">${esc(nameOf(r))}: ${j ? two(Appraisal.J[j].t) : '—'}</span>`; }).join('')}
        <select data-fin="${esc(s.id)}|${d}" aria-label="${esc(T('Decisión final', 'Final decision') + ': ' + s.label + ' · ' + (d === 'overall' ? T('global', 'overall') : d))}"><option value="">${esc(T('decisión final…', 'final decision…'))}</option>${scale.map(j => `<option value="${j}">${esc(T(Appraisal.J[j].t[0], Appraisal.J[j].t[1]))}</option>`).join('')}</select></div>`).join('')}</div>`).join('') : `<div class="msg msg-success">${L2('No hay juicios en desacuerdo.', 'No judgements in disagreement.')}</div>`);
  }

  /* ---------------- figures ---------------- */
  function drawTraffic() {
    const svg = el('b7Traffic'); if (!svg) return;
    const t = tool(), st = studies();
    const doms = t.mode === 'stars' ? [] : t.domains.map(d => d.id);
    const cols = doms.concat(['overall']);
    if (!st.length) { Plot.empty(svg, 600, 120, T('Sin estudios evaluados.', 'No studies assessed.')); return; }
    const rowH = 22, left = 170, colW = 44, top = 40;
    const W = left + cols.length * colW + 20, H = top + st.length * rowH + 60;
    Plot.clear(svg); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    cols.forEach((c, i) => svg.appendChild(svgEl('text', { x: left + i * colW + colW / 2, y: top - 12, 'font-size': 10, 'font-weight': 700, 'text-anchor': 'middle', class: 'art-txt' }, c === 'overall' ? T('Global', 'Overall') : c)));
    st.forEach((s, r) => {
      const f = finalOf(s.id), y = top + r * rowH + rowH / 2;
      svg.appendChild(svgEl('text', { x: left - 10, y: y + 3.5, 'font-size': 9.5, 'text-anchor': 'end', class: 'art-txt' }, s.label));
      cols.forEach((c, i) => {
        const j = c === 'overall' ? f.overall : f.domains[c];
        const x = left + i * colW + colW / 2;
        if (!j) { svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 7.5, fill: 'none', stroke: 'var(--border-strong)', 'stroke-dasharray': '2 2' })); return; }
        svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 8.5, fill: Appraisal.J[j].c }));
        svg.appendChild(svgEl('text', { x, y: y + 3.8, 'font-size': 11, 'font-weight': 800, 'text-anchor': 'middle', fill: '#fff' }, Appraisal.J[j].s));
      });
    });
    const legY = top + st.length * rowH + 18;
    const used = (t.scale || ['low', 'some', 'high']).concat(['ni']);
    let lx = 10;
    used.forEach(j => { svg.appendChild(svgEl('circle', { cx: lx + 7, cy: legY, r: 6, fill: Appraisal.J[j].c })); const txt = T(Appraisal.J[j].t[0], Appraisal.J[j].t[1]); svg.appendChild(svgEl('text', { x: lx + 17, y: legY + 3.5, 'font-size': 9.5, class: 'art-txt' }, txt)); lx += 30 + txt.length * 5.6; });
    if (doms.length) svg.appendChild(svgEl('text', { x: 10, y: legY + 20, 'font-size': 8.5, class: 'art-mut' }, t.domains.map(d => `${d.id}: ${T(d.t[0], d.t[1])}`).join(' · ').slice(0, 220)));
  }
  function drawSummary() {
    const svg = el('b7Summary'); if (!svg) return;
    const t = tool(), st = studies();
    if (!st.length || t.mode === 'stars') { Plot.empty(svg, 600, 120, t.mode === 'stars' ? T('La escala de estrellas se resume con su total por estudio.', 'The star scale is summarized by its total per study.') : T('Sin estudios evaluados.', 'No studies assessed.')); return; }
    const w = weights(P().outcomes.find(o => o.role === 'primary') ? P().outcomes.find(o => o.role === 'primary').name : null);
    const rows = st.map(s => { const f = finalOf(s.id); return { w: w[s.id] || 0, domains: f.domains, overall: f.overall }; });
    const doms = t.domains.map(d => d.id);
    const sm = Appraisal.summary(rows, doms, AP().weighted);
    const cols = doms.concat(['overall']), order = (t.scale || []).concat(['ni']);
    const left = 210, top = 16, barH = 20, W = 640, H = top + cols.length * (barH + 8) + 40;
    Plot.clear(svg); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const bw = W - left - 20;
    cols.forEach((c, i) => {
      const y = top + i * (barH + 8);
      const lab = c === 'overall' ? T('Global', 'Overall') : `${c} · ${T(t.domains[i].t[0], t.domains[i].t[1])}`;
      svg.appendChild(svgEl('text', { x: left - 8, y: y + barH / 2 + 3.5, 'font-size': 9.5, 'text-anchor': 'end', class: 'art-txt', 'font-weight': c === 'overall' ? 700 : 400 }, lab.length > 38 ? lab.slice(0, 37) + '…' : lab));
      let x = left;
      order.forEach(j => { const p = (sm[c] || {})[j] || 0; if (!p) return; svg.appendChild(svgEl('rect', { x, y, width: p * bw, height: barH, fill: Appraisal.J[j].c })); if (p > 0.07) svg.appendChild(svgEl('text', { x: x + p * bw / 2, y: y + barH / 2 + 3.5, 'font-size': 9, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700 }, Math.round(100 * p) + '%')); x += p * bw; });
      if (x === left) svg.appendChild(svgEl('rect', { x, y, width: bw, height: barH, fill: 'none', stroke: 'var(--border-strong)', 'stroke-dasharray': '3 3' }));
    });
    svg.appendChild(svgEl('text', { x: left, y: H - 12, 'font-size': 9, class: 'art-mut' }, AP().weighted ? T('Porcentajes ponderados por el peso de cada estudio en el desenlace primario.', 'Percentages weighted by each study\'s weight in the primary outcome.') : T('Porcentaje de estudios.', 'Percentage of studies.')));
  }

  /* ---------------- GRADE ---------------- */
  const NULLV = 0;
  function outcomeData() {
    const rows = window.Block6 ? Block6.effectRows().filter(r => r.ok) : [];
    const names = [...new Set(P().outcomes.filter(o => o.name).map(o => o.name).concat(rows.map(r => r.outcome || '')))].filter(Boolean);
    return names.map(name => {
      const rs = rows.filter(r => r.outcome === name);
      const metric = rs.length ? rs[0].metric : P().synthesis.metric;
      /* the same model the synthesis runs (Block 8: multilevel or average per study), so that the
         summary of findings, the manuscript and the report quote one effect; the plain
         random-effects pool only when the synthesis cannot run */
      let pooled = null;
      if (rs.length && window.Block8) { try { const r = Block8.run(Block8.data(name)); if (r) pooled = { est: r.est, se: r.se, ci: r.ci, pi: r.pi, I2: r.I2.total, k: r.m, model: r.model }; } catch (e) { pooled = null; } }
      if (!pooled && rs.length) pooled = Meta.pool(rs.map(r => r.yi), rs.map(r => r.vi), { method: P().synthesis.estimator || 'REML', knha: !!P().synthesis.knha });
      const egger = rs.length >= 3 ? Meta.egger(rs.map(r => r.yi), rs.map(r => r.vi)) : null;
      const k = new Set(rs.map(r => r.studyId)).size;
      const n = rs.every(r => +r.n1 > 0 && +r.n2 > 0) && rs.length ? rs.reduce((a, r) => a + +r.n1 + +r.n2, 0) : null;
      const w = {}; rs.forEach(r => { w[r.studyId] = (w[r.studyId] || 0) + 1 / r.vi; });
      /* shares over the studies already judged, as in the summary plot; the weight still unjudged is reported apart */
      let high = 0, some = 0, judged = 0;
      Object.entries(w).forEach(([sid, x]) => { const o = finalOf(sid).overall; if (!o || o === 'ni') return; judged += x; if (o === 'high' || o === 'serious' || o === 'critical') high += x; if (o === 'some' || o === 'moderate') some += x; });
      const W = Object.values(w).reduce((a, b) => a + b, 0);
      const d = { name, rows: rs, k, n, metric, pooled, egger, highShare: judged ? high / judged : null, someShare: judged ? some / judged : null, unjudged: W ? 1 - judged / W : null, nullValue: NULLV };
      d.sug = Appraisal.suggest(d);
      if (d.sug.robWhy && d.unjudged > 0.005) d.sug.robWhy = [d.sug.robWhy[0] + ` Falta evaluar el ${Math.round(100 * d.unjudged)} % del peso.`, d.sug.robWhy[1] + ` ${Math.round(100 * d.unjudged)} % of the weight is not yet judged.`];
      return d;
    });
  }
  const KEYS = ['rob', 'inc', 'ind', 'imp', 'pub'], UPS = ['large', 'dose', 'conf'];
  const KN = { rob: ['Riesgo de sesgo', 'Risk of bias'], inc: ['Inconsistencia', 'Inconsistency'], ind: ['Evidencia indirecta', 'Indirectness'], imp: ['Imprecisión', 'Imprecision'], pub: ['Sesgo de publicación', 'Publication bias'], large: ['Efecto grande', 'Large effect'], dose: ['Dosis–respuesta', 'Dose–response'], conf: ['Confusión que reduce el efecto', 'Confounding that reduces the effect'] };
  function gradeOf(d) {
    const g = AP().grade[d.name] || {};
    const eff = { start: g.start || (P().type === 'scoping' ? 'obs' : 'rct') };
    KEYS.forEach(k => { eff[k] = g[k] != null && g[k] !== '' ? +g[k] : (d.sug[k] != null ? d.sug[k] : 0); });
    UPS.forEach(k => { eff[k] = +g[k] || 0; });
    return { g, eff, c: Appraisal.certainty(eff) };
  }
  const effTxt = (d, L) => {
    const p = d.pooled; if (!p) return '—';
    const f = v => (d.metric === 'ROM' ? `${Meta.BACK.ROM(v) >= 0 ? '+' : '−'}${Math.abs(Meta.BACK.ROM(v)).toFixed(1)} %` : ['RR', 'OR'].includes(d.metric) ? Math.exp(v).toFixed(2) : v.toFixed(2));
    return `${f(p.est)} (${L === 'en' ? '95 % CI' : 'IC 95 %'} ${f(p.ci[0])} ${L === 'en' ? 'to' : 'a'} ${f(p.ci[1])})`;
  };
  function renderGrade() {
    const box = el('b7Grade'); if (!box) return;
    const ds = outcomeData();
    if (!ds.length) { box.innerHTML = `<p class="hint">${L2('Declara desenlaces en el protocolo o extrae efectos en el Bloque 6.', 'Declare outcomes in the protocol or extract effects in Block 6.')}</p>`; el('b7SoF').innerHTML = ''; return; }
    const sel = (name, k, v, sug, opts) => `<select data-gr="${esc(name)}|${k}">${opts.map(([val, lab]) => `<option value="${val}"${String(v) === String(val) ? ' selected' : ''}>${lab}${sug != null && +val === sug ? ' ✱' : ''}</option>`).join('')}</select>`;
    const downOpts = [[0, T('no bajar', 'no'), ], [-1, '−1'], [-2, '−2']], upOpts = [[0, '0'], [1, '+1'], [2, '+2']];
    box.innerHTML = ds.map(d => {
      /* an outcome with no study has no certainty to rate */
      if (!d.k) return `<div class="b7-gr"><div class="b7-gh"><b>${esc(d.name)}</b> <span class="muted">${L2('ningún estudio aportó datos de este desenlace', 'no study contributed data for this outcome')}</span><span class="b7-cert">${L2('sin estudios', 'no studies')}</span></div></div>`;
      const { g, eff, c } = gradeOf(d);
      return `<div class="b7-gr"><div class="b7-gh"><b>${esc(d.name)}</b> <span class="muted">${d.k} ${L2('estudios', 'studies')}${d.n ? ` · ${d.n} ${L2('unidades', 'units')}` : ''} · ${esc(effTxt(d, I18N.lang))}</span><span class="b7-cert lv${c.level}">${c.symbol} ${two(c.name)}</span></div>
        <div class="b7-gg"><label>${L2('Punto de partida', 'Starting point')} <select data-gr="${esc(d.name)}|start"><option value="rct"${eff.start === 'rct' ? ' selected' : ''}>${esc(T('experimentos aleatorizados (alta)', 'randomized experiments (high)'))}</option><option value="obs"${eff.start === 'obs' ? ' selected' : ''}>${esc(T('estudios observacionales (baja)', 'observational studies (low)'))}</option></select></label>
        ${KEYS.map(k => `<label>${two(KN[k])} ${sel(d.name, k, eff[k], d.sug[k], downOpts)}${d.sug[k + 'Why'] ? `<small>${two(d.sug[k + 'Why'])}</small>` : ''}</label>`).join('')}
        ${eff.start === 'obs' ? UPS.map(k => `<label>${two(KN[k])} ${sel(d.name, k, eff[k], null, upOpts)}</label>`).join('') : ''}
        <label class="wide">${L2('Notas y explicación de los juicios', 'Notes and explanation of the judgements')} <input type="text" data-grn="${esc(d.name)}" value="${esc(g.notes || '')}"></label></div></div>`;
    }).join('') + `<p class="hint">✱ ${L2('sugerencia calculada con los datos; puedes cambiarla, y conviene explicar por qué en las notas.', 'suggestion computed from the data; you can change it, and it is advisable to explain why in the notes.')}</p>`;
    renderSoF(ds);
  }
  function sofRows(ds, L) {
    return ds.map(d => {
      if (!d.k) return { outcome: d.name, k: 0, n: null, effect: '—', I2: '—', certainty: L === 'en' ? 'no studies' : 'sin estudios', reasons: '', notes: '' };
      const { g, eff, c } = gradeOf(d);
      const reasons = KEYS.filter(k => eff[k] < 0).map(k => `${T(KN[k][0], KN[k][1])} (${eff[k]})`).concat(UPS.filter(k => eff[k] > 0).map(k => `${T(KN[k][0], KN[k][1])} (+${eff[k]})`));
      return { outcome: d.name, k: d.k, n: d.n, effect: effTxt(d, L), I2: d.pooled && d.pooled.k > 1 ? Math.round(100 * d.pooled.I2) + ' %' : '—', certainty: `${c.symbol} ${L === 'en' ? c.name[1] : c.name[0]}`, reasons: reasons.join('; '), notes: g.notes || '' };
    });
  }
  function renderSoF(ds) {
    const box = el('b7SoF'); if (!box) return;
    const rows = sofRows(ds, I18N.lang);
    box.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Desenlace', 'Outcome')}</th><th class="num">${L2('Estudios', 'Studies')}</th><th class="num">n</th><th>${L2('Efecto (efectos aleatorios)', 'Effect (random effects)')}</th><th>I²</th><th>${L2('Certeza', 'Certainty')}</th><th>${L2('Razones', 'Reasons')}</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.outcome)}</b></td><td class="num">${r.k}</td><td class="num">${r.n || '—'}</td><td>${esc(r.effect)}</td><td>${r.I2}</td><td class="b7-cert-td">${esc(r.certainty)}</td><td>${esc(r.reasons)}${r.notes ? `<div class="muted">${esc(r.notes)}</div>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function sofHTML(L) {
    const rows = sofRows(outcomeData(), L), e = esc;
    const t = (es, en) => (L === 'en' ? en : es);
    return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${t('Resumen de hallazgos', 'Summary of findings')}</title><style>body{font-family:Georgia,serif;max-width:980px;margin:30px auto;padding:0 16px;color:#1b1b1b}table{border-collapse:collapse;width:100%;font-size:.86rem}td,th{border:1px solid #bbb;padding:5px 8px;text-align:left;vertical-align:top}th{background:#f1f1f1}.c{white-space:nowrap}p{font-size:.8rem;color:#555}</style></head><body>
      <h1 style="font-size:1.3rem">${t('Resumen de hallazgos', 'Summary of findings')}</h1><p>${e(P().title || '')}</p>
      <table><tr><th>${t('Desenlace', 'Outcome')}</th><th>${t('Estudios', 'Studies')}</th><th>n</th><th>${t('Efecto (efectos aleatorios)', 'Effect (random effects)')}</th><th>I²</th><th>${t('Certeza (GRADE)', 'Certainty (GRADE)')}</th><th>${t('Razones', 'Reasons')}</th></tr>
      ${rows.map(r => `<tr><td>${e(r.outcome)}</td><td>${r.k}</td><td>${r.n || '—'}</td><td>${e(r.effect)}</td><td>${r.I2}</td><td class="c">${e(r.certainty)}</td><td>${e(r.reasons)}${r.notes ? '<br>' + e(r.notes) : ''}</td></tr>`).join('')}</table>
      <p>${t('Certeza: ⊕⊕⊕⊕ alta, ⊕⊕⊕◯ moderada, ⊕⊕◯◯ baja, ⊕◯◯◯ muy baja (Guyatt et al. 2008). Herramienta de riesgo de sesgo', 'Certainty: ⊕⊕⊕⊕ high, ⊕⊕⊕◯ moderate, ⊕⊕◯◯ low, ⊕◯◯◯ very low (Guyatt et al. 2008). Risk-of-bias tool')}: ${e(t(tool().name[0], tool().name[1]))}. ReviewPro ${APP_VERSION}.</p></body></html>`;
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    const ts = el('b7Tool'); if (ts) ts.innerHTML = Object.keys(Appraisal.TOOLS).map(k => `<option value="${k}"${AP().tool === k ? ' selected' : ''}>${esc(T(Appraisal.TOOLS[k].name[0], Appraisal.TOOLS[k].name[1]))}${k === 'agro' ? esc(T(' (recomendada)', ' (recommended)')) : ''}</option>`).join('');
    const rv = el('b7Reviewer'); if (rv) rv.innerHTML = SC().reviewers.map(r => `<option value="${r.id}"${r.id === active() ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
    const wt = el('b7Weighted'); if (wt) wt.checked = !!AP().weighted;
    renderList(); renderRecon(); drawTraffic(); drawSummary(); renderGrade();
  }
  const light = () => { renderRecon(); drawTraffic(); drawSummary(); renderGrade(); const box = el('b7Studies'); const keep = box ? box.scrollTop : 0; renderList(true); if (box) box.scrollTop = keep; };

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-7'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.study) { current = b.dataset.study; renderList(); return; }
      if (b.dataset.ans) { const a = mine(current); a.answers[b.dataset.ans] = a.answers[b.dataset.ans] === b.dataset.v ? undefined : b.dataset.v; Project.touch(); renderForm(); light(); return; }
      switch (b.id) {
        case 'b7DlSoF': download(sofHTML(I18N.lang), slug(P().title || 'revision') + '_resumen_de_hallazgos.html', 'text/html;charset=utf-8'); break;
        case 'b7DlCsv': {
          const t = tool(), cell = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
          const doms = t.mode === 'stars' ? [] : t.domains.map(d => d.id);
          const rows = [['study'].concat(doms, ['overall'])].concat(studies().map(s => { const f = finalOf(s.id); return [s.label].concat(doms.map(d => f.domains[d] || ''), [f.overall || '']); }));
          download('﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n', slug(P().title || 'revision') + '_riesgo_de_sesgo.csv', 'text/csv;charset=utf-8');
          break;
        }
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.dataset.why) { const a = mine(current); a.override[n.dataset.why] = Object.assign({}, a.override[n.dataset.why], { why: n.value }); Project.touch(); return; }
      if (n.dataset.sup) { mine(current).support[n.dataset.sup] = n.value; Project.touch(); return; }
      if (n.dataset.star) { mine(current).stars[n.dataset.star] = n.value === '' ? '' : Math.max(0, Math.min(+n.max, +n.value)); Project.touch(); light(); return; }
      if (n.dataset.grn) { const g = (AP().grade[n.dataset.grn] = AP().grade[n.dataset.grn] || {}); g.notes = n.value; Project.touch(); renderSoF(outcomeData()); return; }
    });
    panel.addEventListener('change', e => {
      const n = e.target;
      if (n.id === 'b7Tool') { if (Object.keys(AP().by).length && !confirm(T('Cambiar de herramienta deja ocultas las evaluaciones hechas con la anterior. ¿Seguir?', 'Changing the tool hides the assessments made with the previous one. Continue?'))) { n.value = AP().tool; return; } AP().tool = n.value; Project.touch(); renderAll(); return; }
      if (n.id === 'b7Reviewer') { SC().active = n.value; Project.touch(); renderAll(); return; }
      if (n.id === 'b7Weighted') { AP().weighted = n.checked; Project.touch(); drawSummary(); return; }
      if (n.dataset.ov) { const a = mine(current); a.override[n.dataset.ov] = Object.assign({}, a.override[n.dataset.ov], { j: n.value }); Project.touch(); renderForm(); light(); return; }
      if (n.dataset.fin) { const [sid, d] = n.dataset.fin.split('|'); if (!n.value) return; AP().final[sid] = AP().final[sid] || {}; AP().final[sid][d] = n.value; Project.touch(); light(); return; }
      if (n.dataset.gr) { const [name, k] = n.dataset.gr.split('|'); const g = (AP().grade[name] = AP().grade[name] || {}); g[k] = k === 'start' ? n.value : +n.value; Project.touch(); renderGrade(); return; }
    });
    Project.on(kind => { if (kind === 'load') { current = null; renderAll(); } });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 7) renderAll(); });
  }
  function init() {
    ensure(); wire(); renderAll();
    if (location.hash === '#b7') setTimeout(() => goStep(7), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 40));
  window.Block7 = { renderAll, finalOf, outcomeData, gradeOf, sofHTML, sofRows, weights };
})();
