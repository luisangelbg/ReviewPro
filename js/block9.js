/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 9: guided writing, on screen.

   The manuscript is written here, section by section, on the skeleton of the
   review type. The app does not write the text: it says what each section
   needs, offers the citations of the included studies and the numbers of the
   analysis as live references that follow the project, checks every claim for
   support, keeps the reporting checklist and exports the manuscript to Word,
   HTML or Markdown with the citations and the reference list resolved. */

(function () {

  const two = p => L2(p[0], p[1]);
  const W = () => state.writing;
  const P = () => state.protocol || Protocol.blank('systematic');
  const TYPE = () => state.reviewType || P().type || 'systematic';
  const has = s => String(s || '').trim().length > 0;
  let current = null, saveT = null;

  function ensure() {
    if (!state.writing || typeof state.writing !== 'object') state.writing = {};
    const w = state.writing;
    const def = { text: {}, titles: {}, extraThemes: 0, current: '', manual: {}, authors: '', list: '' };
    Object.keys(def).forEach(k => { if (w[k] === undefined) w[k] = def[k]; });
    return w;
  }

  /* ---------------- the skeleton ---------------- */
  function sections() {
    const secs = Writing.outline(TYPE());
    if (TYPE() === 'narrative') {
      const at = secs.findIndex(s => s.id === 'discussion');
      for (let i = 0; i < (W().extraThemes || 0); i++) secs.splice(at + i, 0, { id: 'body' + (4 + i), t: [`Tema ${4 + i}`, `Theme ${4 + i}`], g: ['', ''], w: [300, 1200], custom: true });
    }
    return secs.map(s => (s.custom && has(W().titles[s.id]) ? Object.assign({}, s, { t: [W().titles[s.id], W().titles[s.id]] }) : s));
  }
  const textOf = id => W().text[id] || '';
  function wordsOf(id) {
    const secs = sections(), ids = secs.map(s => s.id);
    if (/^body/.test(id)) return secs.filter(s => /^body/.test(s.id)).reduce((a, s) => a + Writing.wordCount(textOf(s.id)), 0);
    if (ids.includes(id)) return Writing.wordCount(textOf(id));
    /* an item whose section this type does not have is answered in the nearest one */
    return Writing.wordCount(textOf(/^r_/.test(id) ? 'r_synth' : /^m_/.test(id) ? 'm_synth' : id));
  }

  /* ---------------- the included studies and their keys ---------------- */
  const ascii = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');
  function studyKeys() {
    const st = window.Block6 ? Block6.studies() : [];
    const base = st.map(s => { const sur = ascii(Writing.surname((s.rec.authors || [])[0] || 'Anon')) || 'Anon'; return sur.charAt(0).toUpperCase() + sur.slice(1) + (s.rec.year || 'sf'); });
    const count = {}; base.forEach(b => { count[b] = (count[b] || 0) + 1; });
    const seen = {};
    return st.map((s, i) => { let k = base[i]; if (count[k] > 1) { seen[k] = (seen[k] || 0) + 1; k += String.fromCharCode(96 + seen[k]); } return { key: k, study: s, rec: s.rec }; });
  }

  /* ---------------- live data ---------------- */
  function flow() {
    if (!window.Block5 || !state.fulltext) return null;
    try { return FullText.flow(Block5.flowRecords(), Block5.identified(), state.fulltext.links); } catch (e) { return null; }
  }
  const back = (m, y) => (m === 'ROM' ? (Math.exp(y) - 1) * 100 : ['RR', 'OR'].includes(m) ? Math.exp(y) : y);
  const fE = (m, y) => (m === 'ROM' ? `${back(m, y) >= 0 ? '+' : '−'}${fmtFixed(Math.abs(back(m, y)), 1)} %` : fmtFixed(back(m, y), m === 'RR' || m === 'OR' ? 2 : 2));
  const outs = () => (window.Block8 ? Block8.outcomes() : []);
  function findOutcome(arg) {
    const os = outs(); if (!os.length) return null;
    if (!arg) return os.length === 1 ? os[0] : null;
    const a = arg.toLowerCase();
    return os.find(o => o.toLowerCase() === a) || os.find(o => o.toLowerCase().startsWith(a)) || null;
  }
  const memo = new Map(); let memoT = 0;
  function fitOf(o) {
    if (Date.now() - memoT > 1500) { memo.clear(); memoT = Date.now(); }
    if (!memo.has(o)) { let r = null; try { const d = Block8.data(o); r = { d, r: Block8.run(d) }; } catch (e) { r = null; } memo.set(o, r); }
    return memo.get(o);
  }
  function lastSearch() { const ds = ((state.search || {}).log || []).map(l => l.date).filter(Boolean).sort(); return ds.length ? ds[ds.length - 1] : null; }
  function datum(name, arg, L) {
    const t = (es, en) => (L === 'en' ? en : es), n = name.toLowerCase();
    if (n.startsWith('n.')) {
      const f = flow(); if (!f) return null;
      const s = k => f.db[k] + f.other[k];
      const v = { 'n.identified': s('identified'), 'n.duplicates': s('duplicates'), 'n.screened': s('screened'), 'n.excludedta': s('excludedTA'), 'n.unread': s('unread'), 'n.sought': s('sought'), 'n.notretrieved': s('notRetrieved'), 'n.fulltext': s('assessed'), 'n.excludedft': s('excludedFT'), 'n.included': f.includedStudies, 'n.reports': f.includedReports }[n];
      return v == null ? null : fmtNum(v);
    }
    if (n === 'search.date') { const d = lastSearch(); return d || null; }
    if (n === 'search.sources') { const ns = ((state.search || {}).log || []).map(l => l.source).filter(Boolean); return ns.length ? ns.join(', ') : null; }
    if (n === 'reg') { const r = P().registration; return has(r.id) ? `${r.registry === 'prospero' ? 'PROSPERO' : 'OSF'} (${r.id})` : null; }
    if (n === 'funding') return has(P().funding) ? P().funding : null;
    if (n === 'coi') return has(P().coi) ? P().coi : null;
    if (n === 'outcomes') { const os = outs(); return os.length ? os.join(', ') : null; }
    if (['effect', 'k', 'm', 'i2', 'pi', 'p', 'tau2', 'grade'].includes(n)) {
      const o = findOutcome(arg); if (!o) return null;
      if (n === 'grade') {
        if (!window.Block7) return null;
        const d = Block7.outcomeData().find(x => x.name === o); if (!d || !d.k) return null;
        const c = Block7.gradeOf(d).c; return `${L === 'en' ? c.name[1].toLowerCase() : c.name[0].toLowerCase()} (${c.symbol})`;
      }
      const F = fitOf(o); if (!F || !F.r) return null;
      const r = F.r, m = F.d.metric;
      switch (n) {
        case 'effect': return `${fE(m, r.est)} (${t('IC 95 %', '95 % CI')} ${fE(m, r.ci[0])} ${t('a', 'to')} ${fE(m, r.ci[1])})`;
        case 'k': return fmtNum(r.m);
        case 'm': return fmtNum(r.k);
        case 'i2': return fmtFixed(100 * r.I2.total, 0) + ' %';
        case 'pi': return r.pi ? `${fE(m, r.pi[0])} ${t('a', 'to')} ${fE(m, r.pi[1])}` : null;
        case 'p': return r.p < 0.001 ? 'p < 0.001' : 'p = ' + fmtFixed(r.p, 3);
        case 'tau2': return fmtFixed(r.tau2, 4);
      }
    }
    return null;
  }
  /* the list offered in the editor, with today's values */
  function datumList(L) {
    const t = (es, en) => (L === 'en' ? en : es);
    const out = [
      ['n.identified', t('Registros identificados', 'Records identified')], ['n.duplicates', t('Duplicados eliminados', 'Duplicates removed')],
      ['n.screened', t('Registros cribados', 'Records screened')], ['n.excludedTA', t('Excluidos en título y resumen', 'Excluded at title and abstract')],
      ['n.fulltext', t('Informes evaluados a texto completo', 'Reports assessed in full text')], ['n.excludedFT', t('Excluidos a texto completo', 'Excluded at full text')],
      ['n.notRetrieved', t('Informes no recuperados', 'Reports not retrieved')], ['n.included', t('Estudios incluidos', 'Studies included')], ['n.reports', t('Informes incluidos', 'Reports included')],
      ['search.sources', t('Fuentes buscadas', 'Sources searched')], ['search.date', t('Fecha de la última búsqueda', 'Date of the last search')],
      ['reg', t('Registro del protocolo', 'Protocol registration')], ['funding', t('Financiamiento', 'Funding')], ['coi', t('Conflictos de interés', 'Competing interests')],
    ].map(([k, lab]) => ({ tok: `{{${k}}}`, label: lab, value: datum(k, '', L) }));
    outs().forEach(o => {
      [['effect', t('efecto combinado', 'pooled effect')], ['k', t('estudios', 'studies')], ['m', t('efectos', 'effects')], ['i2', 'I²'], ['pi', t('intervalo de predicción', 'prediction interval')], ['p', 'p'], ['grade', t('certeza GRADE', 'GRADE certainty')]]
        .forEach(([k, lab]) => out.push({ tok: `{{${k}:${o}}}`, label: `${o} · ${lab}`, value: datum(k, o, L), group: o }));
    });
    [['characteristics', t('Tabla de características', 'Characteristics table')], ['prisma', t('Tabla del flujo PRISMA', 'PRISMA flow table')], ['sof', t('Tabla de resumen de hallazgos', 'Summary of findings table')]]
      .forEach(([k, lab]) => { const tb = table(k, L); out.push({ tok: `{{table:${k}}}`, label: lab, value: tb ? `${tb.rows.length} ${t('filas', 'rows')}` : null, group: 'table' }); });
    return out;
  }
  function table(name, L) {
    const t = (es, en) => (L === 'en' ? en : es), n = String(name || '').toLowerCase().trim();
    if (n === 'characteristics') {
      const ks = studyKeys(); if (!ks.length) return null;
      const fs = ((state.extraction || {}).fields || []).filter(f => f.type !== 'long').slice(0, 5);
      const val = (sid, f) => { const v = Block6.finalValue(sid, f).v; return Array.isArray(v) ? v.join('; ') : v && typeof v === 'object' ? `${v.lat}, ${v.lon}` : v == null ? '?' : String(v); };
      return { head: [t('Estudio', 'Study')].concat(fs.map(f => f.label)), rows: ks.map(k => [Writing.authorYear(k.rec)].concat(fs.map(f => val(k.study.id, f)))), caption: t(`Tabla. Características de los ${ks.length} estudios incluidos.`, `Table. Characteristics of the ${ks.length} included studies.`) };
    }
    if (n === 'prisma') {
      const f = flow(); if (!f) return null;
      const s = k => f.db[k] + f.other[k];
      return { head: [t('Etapa', 'Stage'), 'n'], rows: [[t('Registros identificados', 'Records identified'), s('identified')], [t('Duplicados eliminados', 'Duplicates removed'), s('duplicates')], [t('Registros cribados', 'Records screened'), s('screened')], [t('Excluidos en título y resumen', 'Excluded at title and abstract'), s('excludedTA')], [t('Informes buscados', 'Reports sought'), s('sought')], [t('No recuperados', 'Not retrieved'), s('notRetrieved')], [t('Evaluados a texto completo', 'Assessed in full text'), s('assessed')], [t('Excluidos a texto completo', 'Excluded at full text'), s('excludedFT')], [t('Estudios incluidos (informes)', 'Studies included (reports)'), `${f.includedStudies} (${f.includedReports})`]].map(r => r.map(String)), caption: t('Tabla. Flujo de la selección (PRISMA 2020).', 'Table. Flow of the selection (PRISMA 2020).') };
    }
    if (n === 'sof') {
      if (!window.Block7) return null;
      const rows = Block7.sofRows(Block7.outcomeData(), L); if (!rows.length) return null;
      return { head: [t('Desenlace', 'Outcome'), t('Estudios', 'Studies'), t('Efecto', 'Effect'), 'I²', t('Certeza', 'Certainty'), t('Razones', 'Reasons')], rows: rows.map(r => [r.outcome, String(r.k), r.effect, r.I2, r.certainty, r.reasons || '—']), caption: t('Tabla. Resumen de hallazgos y certeza de la evidencia (GRADE).', 'Table. Summary of findings and certainty of the evidence (GRADE).') };
    }
    return null;
  }
  function ctx() {
    const ks = studyKeys(), byKey = new Map(ks.map(k => [k.key.toLowerCase(), k.rec]));
    return { keys: ks, study: k => byKey.get(String(k).toLowerCase()) || null, datum, table };
  }

  /* factual sentences to start from, all built from live references */
  function snippets(id, L) {
    const t = (es, en) => (L === 'en' ? en : es), o = outs();
    const S = {
      m_protocol: [t('El protocolo se registró en {{reg}} antes de iniciar el cribado.', 'The protocol was registered in {{reg}} before screening started.')],
      m_search: [t('Se buscó en {{search.sources}}; la última búsqueda se hizo el {{search.date}}.', 'We searched {{search.sources}}; the last search was run on {{search.date}}.')],
      m_synth: window.Block8 && Block8.methodsText(L) ? [Block8.methodsText(L)] : [],
      r_select: [t('La búsqueda identificó {{n.identified}} registros; tras eliminar {{n.duplicates}} duplicados se cribaron {{n.screened}} por título y resumen y se evaluaron {{n.fulltext}} informes a texto completo. Se incluyeron {{n.included}} estudios ({{n.reports}} informes).', 'The search identified {{n.identified}} records; after removing {{n.duplicates}} duplicates, {{n.screened}} were screened by title and abstract and {{n.fulltext}} reports were assessed in full text. We included {{n.included}} studies ({{n.reports}} reports).'), '{{table:prisma}}'],
      r_chars: ['{{table:characteristics}}'],
      r_synth: o.map(x => t(`Para ${x}, el efecto combinado fue {{effect:${x}}}, con {{k:${x}}} estudios y {{m:${x}}} efectos; I² = {{i2:${x}}} y el intervalo de predicción fue de {{pi:${x}}}.`, `For ${x}, the pooled effect was {{effect:${x}}}, from {{k:${x}}} studies and {{m:${x}}} effects; I² = {{i2:${x}}} and the prediction interval ranged from {{pi:${x}}}.`)),
      r_cert: o.map(x => t(`La certeza de la evidencia para ${x} fue {{grade:${x}}}.`, `The certainty of the evidence for ${x} was {{grade:${x}}}.`)).concat(['{{table:sof}}']),
      other: [t('Financiamiento: {{funding}}. Conflictos de interés: {{coi}}.', 'Funding: {{funding}}. Competing interests: {{coi}}.')],
    };
    return S[id] || [];
  }

  /* ---------------- rendering one section to HTML ---------------- */
  function sectionHTML(text, c, L) {
    const r = Writing.render(text, c, L);
    const paras = r.plain.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const tbl = tb => `<div class="table-scroll"><table class="b2-tbl b9-tbl"><thead><tr>${tb.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(row => `<tr>${row.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${tb.caption ? `<p class="b9-cap">${esc(tb.caption)}</p>` : ''}`;
    const html = paras.map(p => p.split(/\u0000T(\d+)\u0000/).map((part, i) => (i % 2 ? tbl(r.tables[+part]) : part.trim() ? `<p>${esc(part).replace(/\{\{[^}]*\}\}/g, m => `<mark class="b9-bad">${m}</mark>`).replace(/\?[A-Za-z][\w-]*/g, m => `<mark class="b9-bad">${m}</mark>`)}</p>` : '')).join('')).join('');
    return { html, r };
  }

  /* ---------------- 1 · editor ---------------- */
  function bar(w, tg) {
    if (!tg || !tg[1]) return '';
    const f = Math.min(1, w / tg[1]), cls = w < tg[0] ? 'lo' : w > tg[1] * 1.25 ? 'hi' : 'ok';
    return `<span class="b9-bar"><i class="${cls}" style="width:${(100 * f).toFixed(0)}%"></i></span>`;
  }
  function renderNav() {
    const box = el('b9Nav'); if (!box) return;
    const secs = sections();
    if (!current || !secs.some(s => s.id === current && !s.heading)) current = (secs.find(s => s.id === W().current && !s.heading) || secs.find(s => !s.heading)).id;
    box.innerHTML = secs.map(s => {
      if (s.heading) return `<div class="b9-navh">${two(s.t)}</div>`;
      const w = Writing.wordCount(textOf(s.id));
      return `<button class="b9-navi${s.id === current ? ' on' : ''}${s.parent ? ' sub' : ''}" data-sec="${s.id}"><span class="b9-nt">${two(s.t)}</span><span class="b9-nw">${w}${s.w[1] ? ` / ${s.w[0]}–${s.w[1]}` : ''}</span>${bar(w, s.w)}</button>`;
    }).join('') + (TYPE() === 'narrative' ? `<button class="btn btn-secondary btn-sm" id="b9AddTheme" style="margin-top:8px">＋ ${L2('Otro tema', 'Another theme')}</button>` : '');
  }
  function renderEditor() {
    const box = el('b9Editor'); if (!box) return;
    const s = sections().find(x => x.id === current); if (!s) return;
    const L = I18N.lang, c = ctx();
    const dl = datumList(L), sn = snippets(s.id, L);
    box.innerHTML = `<div class="b9-eh"><h3>${s.custom ? `<input type="text" id="b9Title" value="${esc(W().titles[s.id] || '')}" placeholder="${esc(T(s.t[0], s.t[1]))}">` : two(s.t)}</h3><span class="muted" id="b9Words"></span></div>
      ${has(T(s.g[0], s.g[1])) ? `<p class="hint b9-guide">${two(s.g)}</p>` : ''}
      <div class="b9-tools">
        <label class="inline-label">${L2('Citar', 'Cite')} <select id="b9Cite"><option value="">${esc(T(`— ${c.keys.length} estudios incluidos —`, `— ${c.keys.length} included studies —`))}</option>${c.keys.map(k => `<option value="${esc(k.key)}">${esc(Writing.authorYear(k.rec))} · ${esc(String(k.rec.title || '').slice(0, 70))}</option>`).join('')}</select></label>
        <label class="inline-label">${L2('Dato vivo', 'Live datum')} <select id="b9Datum"><option value="">—</option>${dl.map(d => `<option value="${esc(d.tok)}"${d.value == null ? ' disabled' : ''}>${esc(d.label)}${d.value != null ? ' = ' + esc(String(d.value).slice(0, 60)) : T(' (sin datos)', ' (no data)')}</option>`).join('')}</select></label>
      </div>
      ${sn.length ? `<div class="b9-snips"><span class="muted">${L2('Frases con datos para empezar (hechos, no interpretación):', 'Sentences with data to start from (facts, not interpretation):')}</span>${sn.map((x, i) => `<button class="b9-snip" data-snip="${i}" title="${esc(x)}">＋ ${esc(x.length > 90 ? x.slice(0, 88) + '…' : x)}</button>`).join('')}</div>` : ''}
      <textarea id="b9Text" rows="14" spellcheck="true" aria-label="${esc(T('Texto de la sección', 'Text of the section'))}" placeholder="${esc(T('Escribe aquí. Cita con [@clave] y usa datos vivos como {{n.included}}.', 'Write here. Cite with [@key] and use live data such as {{n.included}}.'))}">${esc(textOf(s.id))}</textarea>
      <div class="b9-prevh"><b>${L2('Vista previa', 'Preview')}</b></div>
      <div class="b9-prev" id="b9Prev"></div>
      <div id="b9SecChecks"></div>`;
    box._snips = sn;
    lightEditor();
  }
  function lightEditor() {
    const s = sections().find(x => x.id === current); if (!s) return;
    const text = textOf(s.id), c = ctx(), L = I18N.lang;
    const w = Writing.wordCount(text);
    const wd = el('b9Words'); if (wd) wd.textContent = s.w[1] ? T(`${w} palabras · meta ${s.w[0]}–${s.w[1]}`, `${w} words · target ${s.w[0]}–${s.w[1]}`) : T(`${w} palabras`, `${w} words`);
    const { html, r } = sectionHTML(text, c, L);
    const pv = el('b9Prev'); if (pv) pv.innerHTML = html || `<p class="muted">${L2('(vacío)', '(empty)')}</p>`;
    const cl = Writing.checkClaims(s.id, text);
    const msgs = [];
    r.unknown.forEach(k => msgs.push(['error', T(`[@${k}]: no hay un estudio incluido con esa clave.`, `[@${k}]: no included study has that key.`)]));
    r.badTok.forEach(k => msgs.push(['error', T(`${k}: dato desconocido o todavía sin valor.`, `${k}: unknown datum or still without a value.`)]));
    cl.forEach(x => msgs.push(['warning', (x.kind === 'ponly' ? T('Valor p sin el tamaño del efecto ni su intervalo: ', 'p value without the effect size and its interval: ') : T('Afirmación sin cita ni dato vivo: ', 'Claim without citation or live datum: ')) + `«${x.s.length > 160 ? x.s.slice(0, 158) + '…' : x.s}»`]));
    const ck = el('b9SecChecks'); if (ck) ck.innerHTML = msgs.map(([lv, m]) => `<div class="msg msg-${lv}">${esc(m)}</div>`).join('');
  }

  /* ---------------- 2 · checker of the whole manuscript ---------------- */
  function audit(L) {
    const c = ctx(), secs = sections().filter(s => !s.heading);
    const per = secs.map(s => { const t = textOf(s.id); const r = Writing.render(t, c, L); return { s, r, claims: Writing.checkClaims(s.id, t) }; });
    const cited = new Set(); per.forEach(p => p.r.cites.forEach(k => cited.add(k.toLowerCase())));
    const uncited = c.keys.filter(k => !cited.has(k.key.toLowerCase()));
    return { per, uncited, cited, keys: c.keys };
  }
  function renderChecker() {
    const box = el('b9Check'); if (!box) return;
    const L = I18N.lang, a = audit(L);
    const total = a.per.reduce((x, p) => x + Writing.wordCount(textOf(p.s.id)), 0);
    const nUnk = a.per.reduce((x, p) => x + p.r.unknown.length + p.r.badTok.length, 0), nCl = a.per.reduce((x, p) => x + p.claims.length, 0);
    statTiles('b9Tiles', [
      [T('Palabras', 'Words'), fmtNum(total), T(`${a.per.filter(p => has(textOf(p.s.id))).length} de ${a.per.length} secciones`, `${a.per.filter(p => has(textOf(p.s.id))).length} of ${a.per.length} sections`)],
      [T('Estudios citados', 'Studies cited'), `${a.keys.length - a.uncited.length} / ${a.keys.length}`, '', a.uncited.length ? 'warn' : 'ok'],
      [T('Afirmaciones por revisar', 'Claims to review'), fmtNum(nCl), '', nCl ? 'warn' : 'ok'],
      [T('Referencias rotas', 'Broken references'), fmtNum(nUnk), '', nUnk ? 'bad' : 'ok'],
    ]);
    const rows = [];
    a.per.forEach(p => {
      p.r.unknown.forEach(k => rows.push(['error', p.s, T(`[@${k}] no corresponde a ningún estudio incluido.`, `[@${k}] matches no included study.`)]));
      p.r.badTok.forEach(k => rows.push(['error', p.s, T(`${k} no tiene valor.`, `${k} has no value.`)]));
      p.claims.forEach(x => rows.push(['warning', p.s, (x.kind === 'ponly' ? T('p sin efecto ni intervalo: ', 'p without effect or interval: ') : T('sin cita ni dato: ', 'no citation or datum: ')) + `«${x.s.length > 140 ? x.s.slice(0, 138) + '…' : x.s}»`]));
    });
    box.innerHTML = (rows.length ? `<div class="b9-issues">${rows.map(([lv, s, m]) => `<div class="msg msg-${lv}"><button class="b9-go" data-sec="${s.id}">${two(s.t)}</button> ${esc(m)}</div>`).join('')}</div>` : `<div class="msg msg-success">${L2('Cada afirmación con números o conclusiones tiene una cita o un dato vivo, y todas las referencias existen.', 'Every claim with numbers or conclusions has a citation or a live datum, and every reference exists.')}</div>`) +
      (a.uncited.length ? `<p class="hint" style="margin-top:10px">${L2('Estudios incluidos que el texto aún no cita', 'Included studies the text does not cite yet')} (${a.uncited.length}): ${a.uncited.map(k => `<code>${esc(k.key)}</code>`).join(' ')}</p>` : '');
  }

  /* ---------------- 3 · reporting checklist ---------------- */
  function autoCheck(key) {
    const p = P(), f = flow(), ex = state.extraction || {}, ap = state.appraisal || {};
    const st = window.Block6 ? Block6.studies() : [];
    switch (key) {
      case 'titleType': return /sistem|systematic|meta-?an|scoping|explorat|narrativ/i.test(textOf('title') || p.title || '');
      case 'question': return has(p.questionText) || has(p.objectives);
      case 'criteria': return (p.criteria || []).length > 0;
      case 'searchDates': return !!lastSearch();
      case 'strings': return ((state.search || {}).blocks || []).length > 0;
      case 'screening': return !!state.screening && Object.keys(state.screening.decisions || {}).length > 0;
      case 'extraction': return st.length > 0 && (ex.fields || []).length > 0;
      case 'outcomes': return (p.outcomes || []).some(o => has(o.name)) || outs().length > 0;
      case 'fields': return (ex.fields || []).length > 0;
      case 'robTool': return !!ap.tool && Object.keys(ap.by || {}).length > 0;
      case 'metric': return outs().length > 0;
      case 'synth': return outs().length > 0;
      case 'grade': return !!window.Block7 && Block7.outcomeData().some(d => d.k > 0);
      case 'flow': return !!f && f.includedStudies > 0 && f.complete;
      case 'ftReasons': return !!f && !(f.db.ftReasons['—'] || f.other.ftReasons['—']);
      case 'charsTable': return st.length > 0;
      case 'robDone': return st.length > 0 && !!window.Block7 && st.every(s => Block7.finalOf(s.id).overall);
      case 'effects': return outs().length > 0;
      case 'synthRun': return outs().some(o => { const F = fitOf(o); return F && F.r; });
      case 'registration': return has(p.registration.id);
      case 'amendments': return has(p.amendments);
      case 'funding': return has(p.funding);
      case 'coi': return has(p.coi);
      case 'citesAll': { const a = audit(I18N.lang); return a.keys.length ? a.uncited.length === 0 : null; }
      default: return null;
    }
  }
  const listId = () => W().list || Writing.checklist(TYPE()).id;
  const lists = () => ({ prisma2020: { name: 'PRISMA 2020', items: Writing.PRISMA2020 }, prismascr: { name: 'PRISMA-ScR', items: Writing.PRISMASCR }, sanra: { name: 'SANRA', items: Writing.SANRA } });
  const ST = { ok: ['✓ texto y datos', '✓ text and data', 'ok'], text: ['texto; revisar', 'text; review', 'warn'], data: ['datos listos; falta el texto', 'data ready; text missing', 'warn'], missing: ['falta', 'missing', 'bad'], manual: ['✓ marcado', '✓ marked', 'ok'] };
  function renderChecklist() {
    const box = el('b9List'); if (!box) return;
    const id = listId(), cl = lists()[id], man = (W().manual[id] = W().manual[id] || {});
    const sel = el('b9ListSel'); if (sel) sel.value = id;
    const sanra = id === 'sanra';
    const ev = Writing.evaluate(cl.items, wordsOf, autoCheck, sanra ? null : man);
    const secName = sid => { const s = sections().find(x => x.id === sid); return s ? two(s.t) : sid.replace(/^m_.*/, T('Métodos', 'Methods')).replace(/^r_.*/, T('Resultados', 'Results')); };
    const done = ev.filter(e => e.status === 'ok' || e.status === 'manual').length;
    const score = sanra ? cl.items.reduce((a, it) => a + (man[it.id] != null && man[it.id] !== '' ? +man[it.id] : 0), 0) : null;
    box.innerHTML = `<p class="hint">${sanra ? L2(`Calificación SANRA: <b>${score} / 12</b> (cada punto de 0 a 2, lo asigna el autor o un colega).`, `SANRA score: <b>${score} / 12</b> (each item from 0 to 2, assigned by the author or a colleague).`) : L2(`${done} de ${cl.items.length} puntos cubiertos.`, `${done} of ${cl.items.length} items covered.`)}</p>
      <div class="table-scroll"><table class="b2-tbl b9-cl"><thead><tr><th>#</th><th>${L2('Punto', 'Item')}</th><th>${L2('Dónde', 'Where')}</th><th>${L2('Estado', 'Status')}</th><th>${sanra ? L2('Puntaje', 'Score') : L2('Reportado', 'Reported')}</th></tr></thead><tbody>` +
      cl.items.map((it, i) => { const e = ev[i], stt = ST[e.status]; return `<tr><td class="c">${it.id}</td><td>${two(it.t)}</td><td><button class="b9-go" data-sec="${it.sec}">${secName(it.sec)}</button></td><td><span class="b9-st ${stt[2]}">${L2(stt[0], stt[1])}</span></td><td class="c">${sanra ? `<select data-sanra="${it.id}" aria-label="${esc(T(`Puntaje del punto ${it.id}`, `Score of item ${it.id}`))}"><option value="">—</option>${[0, 1, 2].map(v => `<option value="${v}"${String(man[it.id]) === String(v) ? ' selected' : ''}>${v}</option>`).join('')}</select>` : `<input type="checkbox" data-man="${it.id}"${man[it.id] ? ' checked' : ''} aria-label="${esc(T(`Punto ${it.id} reportado`, `Item ${it.id} reported`))}">`}</td></tr>`; }).join('') + '</tbody></table></div>';
  }

  /* ---------------- 4 · the manuscript as blocks ---------------- */
  function manuscript(L) {
    const c = ctx(), secs = sections(), t = (es, en) => (L === 'en' ? en : es);
    const blocks = [], cited = new Set(), rawAll = [];
    const title = Writing.render(textOf('title') || P().title || t('Sin título', 'Untitled'), c, L).plain.replace(/\n+/g, ' ');
    blocks.push({ title: true, text: title });
    const authors = has(W().authors) ? W().authors : (P().team || []).map(a => a.name).filter(Boolean).join(', ');
    if (authors) blocks.push({ p: authors, style: 'Normal' });
    secs.forEach(s => {
      if (s.id === 'title') return;
      if (s.heading) { if (secs.some(x => x.parent === s.id && has(textOf(x.id)))) blocks.push({ h: 1, text: T2(L, s.t) }); return; }
      const text = textOf(s.id);
      if (!has(text)) return;
      blocks.push({ h: s.parent ? 2 : 1, text: T2(L, s.t) });
      const r = Writing.render(text, c, L);
      r.cites.forEach(k => cited.add(k.toLowerCase())); rawAll.push(r.plain);
      r.plain.split(/\n+/).map(x => x.trim()).filter(Boolean).forEach(p => p.split(/\u0000T(\d+)\u0000/).forEach((part, i) => { if (i % 2) blocks.push({ table: r.tables[+part] }); else if (part.trim()) blocks.push({ p: part.trim() }); }));
    });
    const refs = c.keys.filter(k => cited.has(k.key.toLowerCase())).map(k => Writing.refEntry(k.rec)).concat(Writing.methodRefs(rawAll.join('\n'))).sort((a, b) => a.localeCompare(b, L));
    if (refs.length) { blocks.push({ h: 1, text: t('Referencias', 'References') }); refs.forEach(r => blocks.push({ p: r, style: 'Reference' })); }
    return { blocks, refs, title };
  }
  const T2 = (L, p) => (L === 'en' ? p[1] : p[0]);
  function toHTML(L) {
    const m = manuscript(L);
    const body = m.blocks.map(b => b.title ? `<h1 class="t">${esc(b.text)}</h1>` : b.h ? `<h${b.h + 1}>${esc(b.text)}</h${b.h + 1}>` : b.table ? `<table><tr>${b.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${b.table.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>${b.table.caption ? `<p class="cap">${esc(b.table.caption)}</p>` : ''}` : `<p${b.style === 'Reference' ? ' class="ref"' : ''}>${esc(b.p)}</p>`).join('\n');
    return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${esc(m.title)}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 18px;line-height:1.6;color:#1b1b1b}h1.t{font-size:1.5rem;text-align:center}h2{font-size:1.2rem;margin-top:1.6em}h3{font-size:1rem;font-style:italic}table{border-collapse:collapse;width:100%;font-size:.82rem;margin:10px 0}td,th{border-top:1px solid #999;border-bottom:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}.cap{font-style:italic;font-size:.85rem}.ref{padding-left:2em;text-indent:-2em}</style></head><body>\n${body}\n</body></html>`;
  }
  function toMarkdown(L) {
    const m = manuscript(L), cell = x => String(x).replace(/\|/g, '\\|');
    return m.blocks.map(b => b.title ? `# ${b.text}` : b.h ? `${'#'.repeat(b.h + 1)} ${b.text}` : b.table ? `| ${b.table.head.map(cell).join(' | ')} |\n|${b.table.head.map(() => '---').join('|')}|\n` + b.table.rows.map(r => `| ${r.map(cell).join(' | ')} |`).join('\n') + (b.table.caption ? `\n\n*${b.table.caption}*` : '') : b.p).join('\n\n') + '\n';
  }
  function toDocx(L) {
    const m = manuscript(L);
    return Zip.build(Writing.docx(m.blocks, { title: m.title, author: has(W().authors) ? W().authors : (P().team || []).map(a => a.name).filter(Boolean).join(', '), lang: L }));
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    const au = el('b9Authors'); if (au && document.activeElement !== au) { au.value = W().authors || ''; au.placeholder = (P().team || []).map(a => a.name).filter(Boolean).join(', ') || T('Autores', 'Authors'); }
    renderNav(); renderEditor(); renderChecker(); renderChecklist();
  }
  const touchSoon = () => { clearTimeout(saveT); saveT = setTimeout(() => Project.touch(), 400); };
  function insert(str) {
    const ta = el('b9Text'); if (!ta) return;
    const a = ta.selectionStart, b = ta.selectionEnd, before = ta.value.slice(0, a);
    const pad = /\{\{table:/.test(str) || str.length > 120 ? (before && !/\n\s*$/.test(before) ? '\n\n' : '') : (before && !/\s$/.test(before) ? ' ' : '');
    ta.setRangeText(pad + str, a, b, 'end'); ta.focus();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-9'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sec) {
        const secs = sections(); let id = b.dataset.sec;
        if (!secs.some(s => s.id === id && !s.heading)) id = /^r_/.test(id) ? 'r_synth' : /^m_/.test(id) ? 'm_synth' : /^body/.test(id) ? 'body1' : id;
        if (!secs.some(s => s.id === id)) return;
        current = id; W().current = id; renderNav(); renderEditor();
        if (!b.classList.contains('b9-navi')) el('b9Editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (b.dataset.snip != null) { const sn = el('b9Editor')._snips || []; insert(sn[+b.dataset.snip]); return; }
      switch (b.id) {
        case 'b9AddTheme': W().extraThemes = (W().extraThemes || 0) + 1; Project.touch(); renderNav(); break;
        case 'b9Docx': rvBusy(b, () => toDocx(I18N.lang).then(blob => download(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), slug(P().title || 'manuscrito') + '.docx'))); break;
        case 'b9Html': rvBusy(b, () => download(toHTML(I18N.lang), slug(P().title || 'manuscrito') + '.html', 'text/html;charset=utf-8')); break;
        case 'b9Md': rvBusy(b, () => download(toMarkdown(I18N.lang), slug(P().title || 'manuscrito') + '.md', 'text/markdown;charset=utf-8')); break;
        case 'b9Keys': { const ks = studyKeys(); download('﻿key,citation,title,doi\r\n' + ks.map(k => [k.key, Writing.authorYear(k.rec), k.rec.title, k.rec.doi].map(v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n') + '\r\n', slug(P().title || 'revision') + '_claves_de_cita.csv', 'text/csv;charset=utf-8'); break; }
      }
    });
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.id === 'b9Text') { W().text[current] = n.value; touchSoon(); lightEditor(); const nb = panel.querySelector(`.b9-navi[data-sec="${current}"]`); if (nb) { const s = sections().find(x => x.id === current), w = Writing.wordCount(n.value); nb.querySelector('.b9-nw').textContent = `${w}${s.w[1] ? ` / ${s.w[0]}–${s.w[1]}` : ''}`; const bb = nb.querySelector('.b9-bar'); if (bb) bb.outerHTML = bar(w, s.w); } return; }
      if (n.id === 'b9Title') { W().titles[current] = n.value; touchSoon(); const nb = panel.querySelector(`.b9-navi[data-sec="${current}"] .b9-nt`); if (nb) nb.textContent = n.value || T('Tema', 'Theme'); return; }
      if (n.id === 'b9Authors') { W().authors = n.value; touchSoon(); }
    });
    panel.addEventListener('change', e => {
      const n = e.target;
      if (n.id === 'b9Text') { renderChecker(); renderChecklist(); return; }
      if (n.id === 'b9Cite' && n.value) { insert(`[@${n.value}]`); n.value = ''; return; }
      if (n.id === 'b9Datum' && n.value) { insert(n.value); n.value = ''; return; }
      if (n.id === 'b9ListSel') { W().list = n.value; Project.touch(); renderChecklist(); return; }
      if (n.dataset.man) { const m = W().manual[listId()] = W().manual[listId()] || {}; if (n.checked) m[n.dataset.man] = true; else delete m[n.dataset.man]; Project.touch(); renderChecklist(); return; }
      if (n.dataset.sanra) { const m = W().manual.sanra = W().manual.sanra || {}; if (n.value === '') delete m[n.dataset.sanra]; else m[n.dataset.sanra] = +n.value; Project.touch(); renderChecklist(); }
    });
    Project.on(kind => { if (kind === 'load') { current = null; renderAll(); } });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 9) { memo.clear(); rvAfterPaint(renderAll, rvWork('Actualizando los datos vivos del manuscrito', 'Updating the live data of the manuscript')); } });
  }
  function init() {
    ensure(); wire(); renderAll();
    if (location.hash === '#b9') setTimeout(() => goStep(9), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 40));
  window.Block9 = { renderAll, sections, studyKeys, datum, datumList, table, ctx, snippets, manuscript, toHTML, toMarkdown, toDocx, autoCheck, audit };
})();
