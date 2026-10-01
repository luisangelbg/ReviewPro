/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 4: title and abstract screening, on screen.

   Two ways of working with two or more reviewers:
   - same computer, by turns: the active reviewer is chosen at the top and the
     screen never shows another reviewer's decisions;
   - one computer each: every reviewer exports their decisions (or the whole
     project) and the other imports them; records are matched by key.
   Keyboard: I include · E exclude · 1–9 exclude with criterion E1–E9 ·
   M maybe · Z undo · N note. */

(function () {

  const two = p => L2(p[0], p[1]);
  const SC = () => state.screening;
  let cache = { sig: '', recs: [], keys: [], byKey: new Map(), fe: null };
  let current = null;   // key on screen
  let decPage = 0, decFilter = 'all';

  function blank() {
    return { reviewers: [], active: null, mode: 'same', order: 'prioritized', decisions: {}, final: {}, stop: {}, words: { inc: '', exc: '' } };
  }
  function ensure() {
    if (!state.screening) state.screening = blank();
    const s = state.screening;
    ['decisions', 'final', 'stop', 'words'].forEach(k => { if (!s[k] || typeof s[k] !== 'object') s[k] = k === 'words' ? { inc: '', exc: '' } : {}; });
    if (!Array.isArray(s.reviewers)) s.reviewers = [];
    if (!s.reviewers.length) {
      const team = state.protocol ? state.protocol.team.filter(a => a.name && (a.roles || []).includes('screen')) : [];
      (team.length ? team : [{ name: T('Revisor 1', 'Reviewer 1') }]).forEach((a, i) => s.reviewers.push({ id: 'r' + (i + 1) + Date.now().toString(36).slice(-3), name: a.name }));
    }
    if (!s.active || !s.reviewers.some(r => r.id === s.active)) s.active = s.reviewers[0].id;
    s.reviewers.forEach(r => { if (!s.decisions[r.id]) s.decisions[r.id] = {}; });
    return s;
  }
  const P = () => state.protocol || Protocol.blank('systematic');
  const rids = () => SC().reviewers.map(r => r.id);
  const nameOf = id => (SC().reviewers.find(r => r.id === id) || { name: '?' }).name;
  const mine = () => SC().decisions[SC().active];
  const exclCriteria = () => P().criteria.filter(c => c.kind === 'exc' && c.text && c.text.trim());
  const required = () => Math.max(1, +P().screening.reviewers || 1);
  const stopped = () => Object.values(SC().stop).some(x => x.phase === 'stopped');

  /* ---------------- records ---------------- */
  function records() {
    const u = window.Block3 ? Block3.unique() : [];
    const sig = u.length + '|' + (u[0] ? u[0].uid : '') + '|' + (u[u.length - 1] ? u[u.length - 1].uid : '');
    if (sig !== cache.sig) {
      const seen = new Map();
      const keys = u.map(r => { let k = Screening.rkey(r); const n = (seen.get(k) || 0) + 1; seen.set(k, n); return n > 1 ? k + '#' + n : k; });
      cache = { sig, recs: u, keys, byKey: new Map(keys.map((k, i) => [k, u[i]])), fe: null };
    }
    return cache;
  }
  function fe() { const c = records(); if (!c.fe && c.recs.length) c.fe = Screening.features(c.recs); return c.fe; }
  const pilot = () => Screening.pilotKeys(records().keys, +P().screening.pilot || 0, P().title || 'reviewpro');

  function buildQueue() {
    const c = records(), s = SC();
    const others = new Set();
    rids().filter(r => r !== s.active).forEach(r => Object.keys(s.decisions[r] || {}).forEach(k => others.add(k)));
    const st = s.stop[s.active];
    if (st && st.phase === 'verify') {
      const left = st.sample.filter(k => !mine()[k]);
      return { keys: left, why: 'verify', model: 'verify' };
    }
    if (st && st.phase === 'stopped') return { keys: [], why: 'stopped' };
    const q = Screening.queue(c.recs, c.keys, mine(), others, pilot(), { order: s.order, seed: Screening.hash(s.active), strategy: state.search, fe: s.order === 'prioritized' ? fe() : null });
    return q;
  }

  /* ---------------- highlighting ---------------- */
  function highlighter() {
    const inc = [], exc = [];
    if (state.search && state.search.blocks) state.search.blocks.forEach(b => Search.activeTerms(b).forEach(t => inc.push(Search.termRegex(t))));
    const w = SC().words;
    String(w.inc || '').split(/[;,\n]/).map(x => x.trim()).filter(Boolean).forEach(t => inc.push(Search.termRegex(t)));
    String(w.exc || '').split(/[;,\n]/).map(x => x.trim()).filter(Boolean).forEach(t => exc.push(Search.termRegex(t)));
    return s => {
      /* mark on a normalized copy, map back by position (normalization keeps length except for accents: work word by word) */
      return esc(s).replace(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9*-]*/g, word => {
        const n = ' ' + Search.norm(word) + ' ';
        if (exc.some(re => re.test(n))) return `<mark class="ex">${word}</mark>`;
        if (inc.some(re => re.test(n))) return `<mark>${word}</mark>`;
        return word;
      });
    };
  }

  /* ---------------- the screening card ---------------- */
  const WHY = { pilot: ['piloto', 'pilot'], second: ['segunda lectura', 'second reading'], nb: ['priorizado por tus decisiones', 'prioritized by your decisions'], search: ['ordenado por la búsqueda', 'ordered by the search'], random: ['orden aleatorio', 'random order'], none: ['orden original', 'original order'], verify: ['muestra de verificación', 'verification sample'] };
  function renderCard() {
    const box = el('b4Card'); if (!box) return;
    const c = records();
    if (!c.recs.length) { box.innerHTML = `<div class="b4-empty">${L2('No hay registros. Impórtalos y deduplícalos en el Bloque 3.', 'There are no records. Import and deduplicate them in Block 3.')}</div>`; current = null; renderSide(); return; }
    const q = buildQueue();
    current = q.keys[0] || null;
    if (!current) {
      const st = SC().stop[SC().active];
      box.innerHTML = `<div class="b4-empty">${st && st.phase === 'stopped' ? L2('Aplicaste la regla de paro: terminaste tu cribado. Los registros no leídos quedarán registrados como tales en el diagrama PRISMA.', 'You applied the stopping rule: your screening is finished. The unread records will be reported as such in the PRISMA diagram.') : L2('¡Terminaste! Leíste todos los registros.', 'Done! You read every record.')}</div>`;
      renderSide(); return;
    }
    const idx = q.keys.indexOf(current);
    const why = q.why === 'verify' ? 'verify' : idx < q.nPilot ? 'pilot' : idx < q.nPilot + q.nSecond ? 'second' : q.model;
    const r = c.byKey.get(current), hl = highlighter();
    const crit = exclCriteria();
    box.innerHTML = `<div class="b4-rec">
      <div class="b4-tag"><span class="b2-pill">${two(WHY[why] || WHY.none)}</span> <span class="hint" style="margin:0">${L2(`quedan ${q.keys.length}`, `${q.keys.length} left`)}</span></div>
      <h3 class="b4-title">${hl(r.title || '—')}</h3>
      <div class="b4-meta">${esc((r.authors || []).slice(0, 4).join('; '))}${(r.authors || []).length > 4 ? ' et al.' : ''} · <b>${r.year || '—'}</b> · <i>${esc(r.journal || '')}</i>${r.doi ? ` · <span class="b3-doi">doi:${esc(r.doi)}</span>` : ''}</div>
      <div class="b4-abs">${r.abstract ? hl(r.abstract) : `<i>${L2('Sin resumen: decide por el título o márcalo «tal vez».', 'No abstract: decide by the title or mark it "maybe".')}</i>`}</div>
      ${(r.keywords || []).length ? `<div class="b4-kw">${r.keywords.map(k => `<span class="chip">${hl(k)}</span>`).join('')}</div>` : ''}
      <div class="b4-actions">
        <button class="btn b4-inc" data-act="inc"><kbd>I</kbd> ${L2('Incluir', 'Include')}</button>
        <button class="btn b4-may" data-act="maybe"><kbd>M</kbd> ${L2('Tal vez', 'Maybe')}</button>
        <button class="btn b4-exc" data-act="exc"><kbd>E</kbd> ${L2('Excluir', 'Exclude')}</button>
        <button class="btn btn-ghost btn-sm" data-act="undo"><kbd>Z</kbd> ${L2('Deshacer', 'Undo')}</button>
      </div>
      ${crit.length ? `<div class="b4-reasons"><span class="hint" style="margin:0">${L2('Excluir por:', 'Exclude for:')}</span>${crit.slice(0, 9).map((cr, i) => `<button class="b4-reason" data-act="exc" data-reason="${esc(cr.id)}" title="${esc(cr.text)}"><kbd>${i + 1}</kbd> ${esc(cr.id)} · ${esc(cr.text.length > 46 ? cr.text.slice(0, 45) + '…' : cr.text)}</button>`).join('')}</div>` : `<p class="hint">${L2('Sin criterios de exclusión en el protocolo (Bloque 2): las exclusiones no llevarán motivo.', 'No exclusion criteria in the protocol (Block 2): exclusions will carry no reason.')}</p>`}
      <input type="text" id="b4Note" class="b4-note" placeholder="${esc(T('Nota (N) — opcional', 'Note (N) — optional'))}">
    </div>`;
    renderSide();
  }
  function decide(d, reason) {
    if (!current) return;
    const m = mine();
    const n = Object.keys(m).length + 1;
    const note = (el('b4Note') || {}).value || '';
    m[current] = { d, reason: d === 'exc' ? (reason || '') : '', note, t: Date.now(), n };
    Project.touch();
    checkVerify();
    renderCard(); renderAgreement(); renderSummary();
  }
  function undo() {
    const seq = Screening.sequence(mine());
    if (!seq.length) return;
    delete mine()[seq[seq.length - 1][0]];
    Project.touch();
    renderCard(); renderAgreement(); renderSummary();
  }

  /* ---------------- progress and stopping ---------------- */
  function renderSide() {
    const box = el('b4Side'); if (!box) return;
    const c = records(), s = SC(), pr = P().screening;
    const st = Screening.stopStatus(mine(), pr.stop, +pr.stopN || 100);
    const total = c.recs.length;
    const phase = s.stop[s.active];
    let stopHtml = '';
    if (pr.prioritized && s.order === 'prioritized') {
      const bar = pr.stop === 'knee' ? `${L2('pendiente de la rodilla', 'knee slope ratio')} ρ = ${st.rho ? fmtFixed(st.rho, 1) : '—'}` : `${st.run} / ${pr.stopN} ${L2('irrelevantes seguidos', 'irrelevant in a row')}`;
      const pct = pr.stop === 'knee' ? 0 : Math.min(1, st.run / (+pr.stopN || 100));
      stopHtml = `<div class="b4-stop"><div class="b4-stop-h">${L2('Regla de paro', 'Stopping rule')}</div><div class="b2-meter-bar"><span style="width:${(100 * pct).toFixed(0)}%"></span></div><div class="hint" style="margin:4px 0 0">${bar}</div>`;
      if (phase && phase.phase === 'verify') {
        const done = phase.sample.filter(k => mine()[k]).length;
        stopHtml += `<div class="msg msg-info">${L2(`Verificando: ${done} de ${phase.sample.length} registros de la muestra aleatoria.`, `Verifying: ${done} of ${phase.sample.length} records of the random sample.`)}</div>`;
      } else if (phase && phase.phase === 'stopped') {
        stopHtml += `<div class="msg msg-success">${L2(`Detenido el ${phase.date}. Muestra: ${phase.sampleRel} relevantes de ${phase.sampleN}; a 95 % de confianza quedan como máximo ${phase.maxRemaining} relevantes entre ${phase.unread} no leídos.`, `Stopped on ${phase.date}. Sample: ${phase.sampleRel} relevant of ${phase.sampleN}; with 95 % confidence at most ${phase.maxRemaining} relevant remain among ${phase.unread} unread.`)}</div><button class="btn btn-ghost btn-sm" id="b4Resume">${L2('Reanudar el cribado', 'Resume screening')}</button>`;
      } else if (st.met) {
        const unread = total - Object.keys(mine()).length;
        /* 50 or 10 % of the unread, whichever is larger (at most 300): 0 of 50 bounds the remaining share below 6 % */
        const nDef = Math.min(unread, Math.max(50, Math.min(300, Math.round(unread * 0.1))));
        stopHtml += `<div class="msg msg-warning">${L2('La regla se cumplió. Antes de parar, verifica con una muestra al azar de los no leídos: si aparece un relevante, se sigue cribando.', 'The rule is met. Before stopping, verify with a random sample of the unread: if a relevant one appears, screening goes on.')}</div>
          <label class="inline-label">${L2('Tamaño de la muestra', 'Sample size')} <input type="number" id="b4SampleN" min="5" max="${unread}" value="${nDef}" style="width:80px"></label>
          <div class="hint" id="b4SampleHint"></div>
          <button class="btn btn-accent btn-sm" id="b4Verify">${L2('Empezar la verificación', 'Start the verification')}</button>`;
      }
      stopHtml += '</div>';
    }
    const my = Object.keys(mine()).length;
    box.innerHTML = `<div class="b4-prog"><div class="b2-meter-bar"><span style="width:${total ? (100 * my / total).toFixed(1) : 0}%"></span></div>
      <div class="b4-nums"><div><b>${my}</b><span>${L2('leídos', 'read')}</span></div><div><b>${st.relevant}</b><span>${L2('relevantes', 'relevant')}</span></div><div><b>${total - my}</b><span>${L2('por leer', 'to read')}</span></div></div></div>${stopHtml}
      <div class="b4-keys"><b>${L2('Teclado', 'Keyboard')}</b> <kbd>I</kbd> ${L2('incluir', 'include')} · <kbd>E</kbd> ${L2('excluir', 'exclude')} · <kbd>1</kbd>–<kbd>9</kbd> ${L2('excluir por criterio', 'exclude by criterion')} · <kbd>M</kbd> ${L2('tal vez', 'maybe')} · <kbd>Z</kbd> ${L2('deshacer', 'undo')} · <kbd>N</kbd> ${L2('nota', 'note')}</div>`;
    sampleHint();
  }
  function sampleHint() {
    const inp = el('b4SampleN'), h = el('b4SampleHint'); if (!inp || !h) return;
    const unread = records().recs.length - Object.keys(mine()).length;
    const b = Screening.verifyBound(+inp.value || 1, 0, unread);
    h.innerHTML = L2(`Si no aparece ningún relevante en ${+inp.value} registros, a 95 % de confianza quedarán como máximo ${b.maxRemaining} relevantes entre los ${unread} no leídos (${fmtPct(b.p, 1)}).`, `If no relevant record appears among ${+inp.value}, with 95 % confidence at most ${b.maxRemaining} relevant remain among the ${unread} unread (${fmtPct(b.p, 1)}).`);
  }
  function startVerify() {
    const c = records(), s = SC();
    const unreadKeys = c.keys.filter(k => !mine()[k]);
    const n = Math.max(1, Math.min(unreadKeys.length, +(el('b4SampleN') || {}).value || 50));
    const pick = Screen.shuffle(unreadKeys.slice(), rng(Date.now() % 2147483647)).slice(0, n);
    s.stop[s.active] = { phase: 'verify', sample: pick, unread: unreadKeys.length, started: Date.now() };
    Project.touch(); renderCard();
  }
  function checkVerify() {
    const s = SC(), st = s.stop[s.active];
    if (!st || st.phase !== 'verify') return;
    const m = mine();
    const done = st.sample.filter(k => m[k]);
    const rel = done.filter(k => Screening.isRel(m[k].d)).length;
    if (rel) {
      delete s.stop[s.active];
      notice('b4Msg', 'warning', L2(`La muestra de verificación encontró ${rel} registro(s) relevante(s): la regla de paro se retira y el cribado sigue.`, `The verification sample found ${rel} relevant record(s): the stopping rule is withdrawn and screening goes on.`));
      return;
    }
    if (done.length === st.sample.length) {
      const b = Screening.verifyBound(st.sample.length, 0, st.unread - st.sample.length);
      s.stop[s.active] = { phase: 'stopped', date: toISO({ y: new Date().getFullYear(), m: new Date().getMonth() + 1, d: new Date().getDate() }), rule: P().screening.stop, n: P().screening.stopN, sampleN: st.sample.length, sampleRel: 0, unread: st.unread - st.sample.length, maxRemaining: b.maxRemaining, p: b.p };
      notice('b4Msg', 'success', L2('La muestra no encontró relevantes: el cribado queda detenido y documentado.', 'The sample found no relevant record: screening is stopped and documented.'));
    }
  }

  /* ---------------- agreement and conflicts ---------------- */
  function renderAgreement() {
    const box = el('b4Agree'); if (!box) return;
    const s = SC(), ids = rids();
    if (ids.length < 2) { box.innerHTML = `<p class="hint">${L2('Con un solo revisor no hay acuerdo que medir. Añade un segundo revisor arriba, o importa sus decisiones.', 'With a single reviewer there is no agreement to measure. Add a second reviewer above, or import their decisions.')}</p>`; el('b4Conflicts').innerHTML = ''; return; }
    const pk = new Set(pilot());
    const rows = Screening.agreement(s.decisions, ids).map(x => Object.assign(x, { pilot: Screening.agreement(s.decisions, [x.a, x.b], pk)[0] }));
    const kcell = k => (k ? `<b>${fmtFixed(k.kappa, 2)}</b> <span class="muted">[${fmtFixed(k.ci[0], 2)}, ${fmtFixed(k.ci[1], 2)}]</span> · ${two(Screening.landis(k.kappa))}` : '—');
    let html = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Revisores', 'Reviewers')}</th><th class="num">${L2('En común', 'In common')}</th><th class="num">${L2('Acuerdo', 'Agreement')}</th><th>${L2('Kappa incluir/excluir', 'Kappa include/exclude')}</th><th>${L2('Kappa con «tal vez»', 'Kappa with "maybe"')}</th><th>${L2('Kappa en el piloto', 'Kappa in the pilot')}</th></tr></thead><tbody>` +
      rows.map(x => `<tr><td>${esc(nameOf(x.a))} · ${esc(nameOf(x.b))}</td><td class="num">${x.n}</td><td class="num">${x.two ? fmtPct(x.two.po, 0) : '—'}</td><td>${kcell(x.two)}</td><td>${kcell(x.three)}</td><td>${x.pilot && x.pilot.two ? kcell(x.pilot.two) + ` <span class="muted">(n = ${x.pilot.n})</span>` : '—'}</td></tr>`).join('') + '</tbody></table></div>';
    const target = +P().screening.kappa || 0.6;
    const low = rows.find(x => x.pilot && x.pilot.two && x.pilot.n >= 10 && x.pilot.two.kappa < target);
    if (low) html += `<div class="msg msg-warning">${L2(`El kappa del piloto (${fmtFixed(low.pilot.two.kappa, 2)}) está bajo el objetivo del protocolo (${target}). Discutan los desacuerdos del piloto y afinen los criterios antes de seguir.`, `The pilot kappa (${fmtFixed(low.pilot.two.kappa, 2)}) is below the protocol target (${target}). Discuss the pilot disagreements and sharpen the criteria before going on.`)}</div>`;
    if (ids.length >= 3) {
      const all = records().keys.filter(k => ids.every(r => s.decisions[r][k]));
      const fl = Screening.fleiss(all.map(k => ['inc', 'exc'].map(c => ids.filter(r => (Screening.isRel(s.decisions[r][k].d) ? 'inc' : 'exc') === c).length)));
      html += `<p class="hint">${fl ? L2(`Kappa de Fleiss (${ids.length} revisores, ${all.length} registros leídos por todos): <b>${fmtFixed(fl.kappa, 2)}</b> · ${Screening.landis(fl.kappa)[0]}.`, `Fleiss' kappa (${ids.length} reviewers, ${all.length} records read by all): <b>${fmtFixed(fl.kappa, 2)}</b> · ${Screening.landis(fl.kappa)[1]}.`) : ''}</p>`;
    }
    box.innerHTML = html;
    renderConflicts();
  }
  function renderConflicts() {
    const box = el('b4Conflicts'); if (!box) return;
    const c = records(), s = SC(), ids = rids();
    const conf = c.keys.filter(k => Screening.status(k, s.decisions, ids, s.final, required(), stopped()).s === 'conflict');
    const resolved = Object.keys(s.final).filter(k => c.byKey.has(k));
    const lab = { inc: ['incluir', 'include'], maybe: ['tal vez', 'maybe'], exc: ['excluir', 'exclude'] };
    const crit = exclCriteria();
    box.innerHTML = `<h3>${L2(`Conflictos por resolver (${conf.length})`, `Conflicts to resolve (${conf.length})`)}</h3>` + (conf.length ? conf.slice(0, 30).map(k => {
      const r = c.byKey.get(k);
      return `<div class="b3-pair"><div><b>${esc(r.title)}</b> <span class="muted">· ${r.year || ''}</span></div>
        <div class="b4-who">${ids.filter(id => s.decisions[id][k]).map(id => { const d = s.decisions[id][k]; return `<span class="b4-d ${d.d}">${esc(nameOf(id))}: ${two(lab[d.d])}${d.reason ? ' · ' + esc(d.reason) : ''}${d.note ? ` — <i>${esc(d.note)}</i>` : ''}</span>`; }).join('')}</div>
        <div class="b4-res"><span class="hint" style="margin:0">${L2('Decisión final:', 'Final decision:')}</span>
          <button class="btn btn-sm btn-secondary" data-final="inc" data-key="${esc(k)}">${L2('Incluir', 'Include')}</button>
          <button class="btn btn-sm btn-secondary" data-final="maybe" data-key="${esc(k)}">${L2('Tal vez', 'Maybe')}</button>
          <select data-finalreason="${esc(k)}"><option value="">${esc(T('excluir por…', 'exclude for…'))}</option>${crit.map(cr => `<option value="${esc(cr.id)}">${esc(cr.id)} · ${esc(cr.text.slice(0, 50))}</option>`).join('')}<option value="-">${esc(T('excluir sin motivo', 'exclude without reason'))}</option></select>
          <select data-finalby="${esc(k)}"><option value="consensus">${esc(T('por consenso', 'by consensus'))}</option>${ids.map(id => `<option value="${id}">${esc(T('por ', 'by ') + nameOf(id))}</option>`).join('')}</select></div></div>`;
    }).join('') + (conf.length > 30 ? `<p class="hint">${L2(`… y ${conf.length - 30} más.`, `… and ${conf.length - 30} more.`)}</p>` : '') : `<p class="hint">${L2('No hay conflictos.', 'No conflicts.')}</p>`) +
      (resolved.length ? `<details><summary>${L2(`Resueltos (${resolved.length})`, `Resolved (${resolved.length})`)}</summary><ul class="b3-auto">${resolved.map(k => `<li>${esc(c.byKey.get(k).title.slice(0, 90))} — <b>${two(lab[s.final[k].d])}</b>${s.final[k].reason ? ' · ' + esc(s.final[k].reason) : ''} <span class="muted">(${s.final[k].by === 'consensus' ? T('consenso', 'consensus') : esc(nameOf(s.final[k].by))})</span> <button class="btn btn-ghost btn-sm" data-unfinal="${esc(k)}">${L2('reabrir', 'reopen')}</button></li>`).join('')}</ul></details>` : '');
  }

  /* ---------------- summary, figure and exports ---------------- */
  function renderSummary() {
    const c = records(), s = SC();
    const sm = Screening.summary(c.keys, s.decisions, rids(), s.final, required(), stopped());
    statTiles('b4Tiles', [
      [T('Registros', 'Records'), fmtNum(sm.total), T('únicos del Bloque 3', 'unique from Block 3')],
      [T('A texto completo', 'To full text'), fmtNum(sm.toFullText), T(`${sm.inc} incluidos, ${sm.maybe} tal vez`, `${sm.inc} included, ${sm.maybe} maybe`), 'ok'],
      [T('Excluidos', 'Excluded'), fmtNum(sm.exc), T('con decisión final', 'with a final decision')],
      [T('Pendientes', 'Pending'), fmtNum(sm.conflict + sm.partial), T(`${sm.conflict} conflictos, ${sm.partial} esperan otra lectura`, `${sm.conflict} conflicts, ${sm.partial} await another reading`), sm.conflict + sm.partial ? 'warn' : ''],
      [T('Sin leer', 'Unread'), fmtNum(sm.pending + sm.unread), stopped() ? T(`${sm.unread} tras la regla de paro`, `${sm.unread} after the stopping rule`) : T('aún en la cola', 'still in the queue')],
    ]);
    const rs = el('b4Reasons');
    if (rs) {
      const crit = P().criteria;
      const rows = Object.entries(sm.reasons).sort((a, b) => b[1] - a[1]);
      rs.innerHTML = rows.length ? `<table class="b2-tbl"><thead><tr><th>${L2('Motivo de exclusión', 'Reason for exclusion')}</th><th class="num">n</th></tr></thead><tbody>${rows.map(([id, n]) => { const cr = crit.find(x => x.id === id); return `<tr><td>${esc(id === '—' ? T('sin motivo registrado', 'no reason recorded') : id + ' · ' + (cr ? cr.text : ''))}</td><td class="num">${n}</td></tr>`; }).join('')}</tbody></table>` : '';
    }
    drawGain();
    renderMine();
  }
  function drawGain() {
    const svg = el('b4Gain'); if (!svg) return;
    const s = SC(), c = records();
    const seqs = rids().map(id => ({ id, seq: Screening.sequence(s.decisions[id] || {}) })).filter(x => x.seq.length);
    if (!seqs.length) { Plot.empty(svg, 560, 240, T('Aún no hay decisiones.', 'No decisions yet.')); return; }
    const maxX = Math.max(...seqs.map(x => x.seq.length)), maxY = Math.max(1, ...seqs.map(x => x.seq.filter(([, d]) => Screening.isRel(d.d)).length));
    const f = Plot.frame(svg, { W: 560, H: 250, m: { l: 44, r: 14, t: 24, b: 38 }, x: [0, Math.max(maxX, 10)], y: [0, maxY * 1.1], xlab: T('registros leídos', 'records read'), ylab: T('relevantes (incluir o tal vez)', 'relevant (include or maybe)') });
    seqs.forEach((x, i) => {
      let k = 0; const pts = [[f.sx(0), f.sy(0)]];
      x.seq.forEach(([, d], j) => { if (Screening.isRel(d.d)) k++; pts.push([f.sx(j + 1), f.sy(k)]); });
      Plot.line(f, pts, `var(--c${i + 1})`, { width: 2 });
      const st = s.stop[x.id];
      if (st && st.phase === 'stopped') Plot.vline(f, x.seq.length, `var(--c${i + 1})`, { label: T('paro', 'stop'), dash: '4 3' });
    });
    Plot.legend(f, seqs.map((x, i) => [nameOf(x.id), `var(--c${i + 1})`, 'ln']), 12);
    if (c.recs.length) Plot.label(f, Math.max(maxX, 10), 0, T(`de ${c.recs.length}`, `of ${c.recs.length}`), { anchor: 'end', dy: -4, muted: true });
  }
  function renderMine() {
    const box = el('b4Mine'); if (!box) return;
    const c = records(), m = mine();
    const lab = { inc: ['incluir', 'include'], maybe: ['tal vez', 'maybe'], exc: ['excluir', 'exclude'] };
    const seq = Screening.sequence(m).reverse().filter(([, d]) => decFilter === 'all' || d.d === decFilter);
    const page = seq.slice(decPage * 25, decPage * 25 + 25);
    els('#b4MineFilter .chip').forEach(b => b.classList.toggle('on', b.dataset.f === decFilter));
    box.innerHTML = seq.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>#</th><th>${L2('Registro', 'Record')}</th><th>${L2('Decisión', 'Decision')}</th></tr></thead><tbody>${page.map(([k, d]) => { const r = c.byKey.get(k); return `<tr><td class="num">${d.n}</td><td>${esc(r ? r.title.slice(0, 110) : k)}${d.note ? `<div class="muted"><i>${esc(d.note)}</i></div>` : ''}</td><td><select data-redecide="${esc(k)}">${['inc', 'maybe', 'exc'].map(x => `<option value="${x}"${d.d === x ? ' selected' : ''}>${esc(T(lab[x][0], lab[x][1]))}</option>`).join('')}${exclCriteria().map(cr => `<option value="exc:${esc(cr.id)}"${d.d === 'exc' && d.reason === cr.id ? ' selected' : ''}>${esc(T('excluir · ', 'exclude · ') + cr.id)}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div>
      <div class="btn-row">${decPage > 0 ? `<button class="btn btn-ghost btn-sm" id="b4Prev">← ${L2('anteriores', 'previous')}</button>` : ''}<span class="hint" style="margin:0">${decPage * 25 + 1}–${Math.min(seq.length, decPage * 25 + 25)} ${L2('de', 'of')} ${seq.length}</span>${seq.length > decPage * 25 + 25 ? `<button class="btn btn-ghost btn-sm" id="b4Next">${L2('siguientes', 'next')} →</button>` : ''}</div>` : `<p class="hint">${L2('Sin decisiones en este filtro.', 'No decisions in this filter.')}</p>`;
  }
  function decisionsCSV() {
    const c = records(), s = SC(), ids = rids();
    const head = ['key', 'title', 'year', 'doi'].concat(...ids.map(id => [`${nameOf(id)} decision`, `${nameOf(id)} reason`, `${nameOf(id)} note`]), ['final status', 'final decision', 'final reason']);
    const cell = v => { const x = String(v == null ? '' : v); return /[",\n;]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    const rows = c.keys.map(k => {
      const r = c.byKey.get(k), st = Screening.status(k, s.decisions, ids, s.final, required(), stopped());
      return [k, r.title, r.year, r.doi].concat(...ids.map(id => { const d = s.decisions[id][k]; return d ? [d.d, d.reason, d.note] : ['', '', '']; }), [st.s, st.d || '', st.reason || '']).map(cell).join(',');
    });
    return '﻿' + [head.map(cell).join(',')].concat(rows).join('\r\n') + '\r\n';
  }
  function toFullText() {
    const c = records(), s = SC();
    return c.keys.filter(k => { const st = Screening.status(k, s.decisions, rids(), s.final, required(), stopped()); return (st.s === 'agreed' || st.s === 'final') && Screening.isRel(st.d); }).map(k => c.byKey.get(k));
  }

  /* ---------------- reviewers ---------------- */
  function renderReviewers() {
    const box = el('b4Reviewers'); if (!box) return;
    const s = SC();
    box.innerHTML = s.reviewers.map(r => `<div class="b4-rv${r.id === s.active ? ' on' : ''}"><label class="checkbox-label"><input type="radio" name="b4Active" data-active="${r.id}"${r.id === s.active ? ' checked' : ''} aria-label="${esc(T('Revisor activo: ', 'Active reviewer: ') + r.name)}"></label><input type="text" data-rvname="${r.id}" value="${esc(r.name)}" aria-label="${esc(T('Nombre del revisor', 'Name of the reviewer'))}"><span class="hint" style="margin:0">${Object.keys(s.decisions[r.id] || {}).length} ${L2('decisiones', 'decisions')}</span>${s.reviewers.length > 1 ? `<button class="icon-x" data-rmrv="${r.id}" title="${esc(T('Quitar revisor y sus decisiones', 'Remove reviewer and their decisions'))}">×</button>` : ''}</div>`).join('');
    els('#b4Mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === s.mode));
    els('#b4Order button').forEach(b => b.classList.toggle('on', b.dataset.order === s.order));
    const ex = el('b4Exchange'); if (ex) ex.style.display = s.mode === 'split' ? '' : 'none';
    const tn = el('b4ModeNote');
    if (tn) tn.innerHTML = s.mode === 'same' ? L2('Por turnos: elige quién criba antes de empezar. La pantalla nunca muestra las decisiones de los demás; los desacuerdos aparecen solo en la conciliación.', 'By turns: choose who screens before starting. The screen never shows the others\' decisions; disagreements appear only in the reconciliation.')
      : L2('Cada quien en su computadora: todos importan los mismos archivos en el Bloque 3 (o abren el mismo proyecto), cada revisor criba en la suya y exporta sus decisiones; una persona las importa todas para conciliar.', 'One computer each: everybody imports the same files in Block 3 (or opens the same project), each reviewer screens on their own and exports their decisions; one person imports them all to reconcile.');
    const pinfo = el('b4Plan');
    if (pinfo) { const pr = P().screening; pinfo.innerHTML = L2(`Según el protocolo: ${pr.reviewers} revisor(es) por registro, piloto de ${pr.pilot || 0} registros, kappa objetivo ${pr.kappa}, ${pr.prioritized ? `priorizado con paro ${pr.stop === 'knee' ? 'por el método de la rodilla' : `tras ${pr.stopN} irrelevantes seguidos`}` : 'sin priorización'}.`, `By the protocol: ${pr.reviewers} reviewer(s) per record, pilot of ${pr.pilot || 0} records, target kappa ${pr.kappa}, ${pr.prioritized ? `prioritized, stopping ${pr.stop === 'knee' ? 'by the knee method' : `after ${pr.stopN} irrelevant in a row`}` : 'not prioritized'}.`); }
    const w = SC().words; const wi = el('b4WordsInc'), we = el('b4WordsExc');
    if (wi && document.activeElement !== wi) wi.value = w.inc || ''; if (we && document.activeElement !== we) we.value = w.exc || '';
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure(); renderReviewers(); renderCard(); renderAgreement(); renderSummary();
  }

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-4'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const s = SC();
      if (b.dataset.act) { if (b.dataset.act === 'undo') undo(); else decide(b.dataset.act, b.dataset.reason); return; }
      if (b.dataset.mode) { s.mode = b.dataset.mode; Project.touch(); renderReviewers(); return; }
      if (b.dataset.order) { s.order = b.dataset.order; Project.touch(); renderAll(); return; }
      if (b.dataset.rmrv) { if (!confirm(T('¿Quitar a este revisor y todas sus decisiones?', 'Remove this reviewer and all their decisions?'))) return; s.reviewers = s.reviewers.filter(r => r.id !== b.dataset.rmrv); delete s.decisions[b.dataset.rmrv]; delete s.stop[b.dataset.rmrv]; Project.touch(); renderAll(); return; }
      if (b.dataset.final) { const k = b.dataset.key; s.final[k] = { d: b.dataset.final, reason: '', by: panel.querySelector(`[data-finalby="${CSS.escape(k)}"]`).value, t: Date.now() }; Project.touch(); renderAgreement(); renderSummary(); return; }
      if (b.dataset.unfinal) { delete s.final[b.dataset.unfinal]; Project.touch(); renderAgreement(); renderSummary(); return; }
      if (b.classList.contains('chip') && b.dataset.f) { decFilter = b.dataset.f; decPage = 0; renderMine(); return; }
      switch (b.id) {
        case 'b4AddRv': s.reviewers.push({ id: 'r' + Date.now().toString(36), name: T('Revisor ', 'Reviewer ') + (s.reviewers.length + 1) }); ensure(); Project.touch(); renderAll(); break;
        case 'b4Verify': startVerify(); break;
        case 'b4Resume': delete s.stop[s.active]; Project.touch(); renderAll(); break;
        case 'b4Prev': decPage = Math.max(0, decPage - 1); renderMine(); break;
        case 'b4Next': decPage++; renderMine(); break;
        case 'b4Export': download(JSON.stringify(Screening.exportFile(s.active, nameOf(s.active), mine())), slug(`cribado_${nameOf(s.active)}`) + '.json', 'application/json'); break;
        case 'b4Import': el('b4ImportIn').click(); break;
        case 'b4DlCsv': download(decisionsCSV(), slug((P().title || 'cribado')) + '_cribado.csv', 'text/csv;charset=utf-8'); break;
        case 'b4DlRis': download(Records.toRIS(toFullText()), slug((P().title || 'cribado')) + '_a_texto_completo.ris', 'application/x-research-info-systems'); break;
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target, s = SC();
      if (n.dataset.active) { s.active = n.dataset.active; Project.touch(); renderAll(); return; }
      if (n.dataset.rvname) { s.reviewers.find(r => r.id === n.dataset.rvname).name = n.value; Project.touch(); return; }
      if (n.id === 'b4SampleN') { sampleHint(); return; }
      if (n.id === 'b4WordsInc' || n.id === 'b4WordsExc') { s.words[n.id === 'b4WordsInc' ? 'inc' : 'exc'] = n.value; Project.touch(); renderCard(); return; }
    });
    panel.addEventListener('change', e => {
      const n = e.target, s = SC();
      if (n.dataset.finalreason) { if (!n.value) return; const k = n.dataset.finalreason; s.final[k] = { d: 'exc', reason: n.value === '-' ? '' : n.value, by: panel.querySelector(`[data-finalby="${CSS.escape(k)}"]`).value, t: Date.now() }; Project.touch(); renderAgreement(); renderSummary(); return; }
      if (n.dataset.redecide) { const k = n.dataset.redecide, d = mine()[k], [dd, rr] = n.value.split(':'); d.d = dd; d.reason = dd === 'exc' ? (rr || '') : ''; d.t2 = Date.now(); Project.touch(); renderAgreement(); renderSummary(); renderCard(); }
    });
    document.addEventListener('keydown', e => {
      if (!el('panel-4') || !el('panel-4').classList.contains('active')) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) { if (e.key === 'Escape') t.blur(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'i') { decide('inc'); e.preventDefault(); }
      else if (k === 'e') { decide('exc'); e.preventDefault(); }
      else if (k === 'm' || k === '?') { decide('maybe'); e.preventDefault(); }
      else if (k === 'z' || k === 'backspace') { undo(); e.preventDefault(); }
      else if (k === 'n') { const n = el('b4Note'); if (n) { n.focus(); e.preventDefault(); } }
      else if (/^[1-9]$/.test(k)) { const cr = exclCriteria()[+k - 1]; if (cr) { decide('exc', cr.id); e.preventDefault(); } }
    });
    const imp = el('b4ImportIn');
    if (imp) imp.addEventListener('change', () => {
      const files = [...imp.files]; imp.value = '';
      Promise.all(files.map(f => f.text().then(t => ({ f, t })))).then(arr => {
        const s = SC(), msgs = [];
        arr.forEach(({ f, t }) => {
          try {
            Screening.readExchange(JSON.parse(t)).forEach(x => {
              let rv = s.reviewers.find(r => r.id === x.reviewer);
              if (!rv) { rv = { id: x.reviewer, name: x.name || x.reviewer }; s.reviewers.push(rv); s.decisions[rv.id] = {}; }
              const res = Screening.mergeDecisions(s.decisions[rv.id], x.decisions);
              const known = Object.keys(x.decisions).filter(k => records().byKey.has(k)).length;
              msgs.push(L2(`${esc(f.name)} · ${esc(rv.name)}: ${res.added} nuevas, ${res.updated} actualizadas${known < Object.keys(x.decisions).length ? `; ${Object.keys(x.decisions).length - known} no coinciden con tus registros (¿importaron los mismos archivos?)` : ''}.`, `${esc(f.name)} · ${esc(rv.name)}: ${res.added} new, ${res.updated} updated${known < Object.keys(x.decisions).length ? `; ${Object.keys(x.decisions).length - known} do not match your records (were the same files imported?)` : ''}.`));
            });
          } catch (err) { msgs.push(`${esc(f.name)}: ${esc(err.message)}`); }
        });
        Project.touch(); renderAll();
        clearMessages('b4Msg'); notice('b4Msg', 'info', msgs.join('<br>'));
      });
    });
    Project.on(kind => { if (kind === 'load') { cache.sig = ''; renderAll(); } });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 4) renderAll(); });
  }

  function init() {
    ensure(); wire(); renderAll();
    if (location.hash === '#b4') setTimeout(() => goStep(4), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 10));
  window.Block4 = { renderAll, records, buildQueue, decide, undo, toFullText, decisionsCSV, pilot };
})();
