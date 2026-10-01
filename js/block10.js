/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 10: figures, report and package.

   Four cards: where the project stands against what its review type needs;
   the figures of every block in one place, numbered, with captions and
   exports; a report that can be read on its own (what was asked, how it was
   searched, what was found and how sure we are), with its preview and a
   printable version; and one .zip with the project file that reproduces it
   all, the manuscript, the tables and the figures. */

(function () {

  const two = p => L2(p[0], p[1]);
  const RP = () => state.report;
  const P = () => state.protocol || Protocol.blank('systematic');
  const TYPE = () => state.reviewType || P().type || 'systematic';
  const has = s => String(s || '').trim().length > 0;
  const safe = f => { try { return f(); } catch (e) { return null; } };
  /* the date and time where the user is, not in UTC */
  const localStamp = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`; };

  function ensure() {
    if (!state.report || typeof state.report !== 'object') state.report = {};
    const r = state.report;
    const def = { include: {}, captions: {}, png: false, dpi: 300, manuscript: true, annexes: true };
    Object.keys(def).forEach(k => { if (r[k] === undefined) r[k] = def[k]; });
    return r;
  }

  /* ---------------- the figures of the project ---------------- */
  const FIGS = [
    { id: 'b5Flow', block: 5, sec: 'selection', t: ['Diagrama de flujo PRISMA 2020 de la selección de estudios', 'PRISMA 2020 flow diagram of study selection'] },
    { id: 'b3Years', block: 3, sec: 'search', t: ['Registros identificados por año de publicación', 'Records identified by year of publication'] },
    { id: 'b4Gain', block: 4, sec: 'selection', t: ['Curva de hallazgo del cribado priorizado', 'Discovery curve of the prioritized screening'] },
    { id: 'b7Traffic', block: 7, sec: 'rob', t: ['Riesgo de sesgo por estudio y dominio', 'Risk of bias by study and domain'] },
    { id: 'b7Summary', block: 7, sec: 'rob', t: ['Resumen del riesgo de sesgo por dominio', 'Summary of risk of bias by domain'] },
    { id: 'b8Forest', block: 8, sec: 'synthesis', t: ['Diagrama de bosque', 'Forest plot'], outcome: true },
    { id: 'b8Funnel', block: 8, sec: 'synthesis', t: ['Gráfico de embudo con recorte y relleno', 'Funnel plot with trim-and-fill'], outcome: true },
    { id: 'b8Loo', block: 8, sec: 'synthesis', t: ['Sensibilidad dejando un estudio fuera', 'Leave-one-study-out sensitivity'], outcome: true },
    { id: 'b8Bubble', block: 8, sec: 'synthesis', t: ['Meta-regresión (gráfico de burbujas)', 'Meta-regression (bubble plot)'], outcome: true },
    { id: 'b8Gap', block: 8, sec: 'synthesis', t: ['Mapa de vacíos de evidencia', 'Evidence gap map'] },
    { id: 'b2Gantt', block: 2, sec: 'annex', t: ['Cronograma de la revisión', 'Review timeline'] },
  ];
  const isEmpty = svg => !svg || !svg.children.length || (svg.children.length === 1 && svg.children[0].tagName.toLowerCase() === 'text');
  function refreshBlocks() {
    [2, 3, 4, 5, 6, 7, 8].forEach(n => safe(() => window['Block' + n].renderAll()));
  }
  function figures() {
    const o = state.synthesis && state.synthesis.outcome;
    return FIGS.map(f => { const svg = el(f.id); return Object.assign({}, f, { svg, empty: isEmpty(svg), title: T(f.t[0], f.t[1]) + (f.outcome && o ? ` — ${o}` : '') }); }).filter(f => !f.empty);
  }
  const included = f => RP().include[f.id] !== false && (RP().include[f.id] === true || f.sec !== 'annex');
  function numbered() { let n = 0; return figures().map(f => Object.assign(f, { num: included(f) ? ++n : null })); }
  const caption = f => (has(RP().captions[f.id]) ? RP().captions[f.id] : f.title);
  function figSVG(f, L) {
    const c = Fig.compose(f.svg, { theme: 'light', background: 'white' });
    let s = Fig.serialize(c).replace(/^<\?xml[^>]*>\s*/, '');
    /* the copy keeps the ids of the figure it comes from (the clip of each
       plot), and both live on the same page: give the copy its own ids */
    const k = '-c' + (figSVG.n = (figSVG.n || 0) + 1);
    [...new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))].forEach(id => {
      s = s.split(`id="${id}"`).join(`id="${id}${k}"`).split(`#${id})`).join(`#${id}${k})`).split(`href="#${id}"`).join(`href="#${id}${k}"`);
    });
    return s;
  }

  /* ---------------- 1 · project status ---------------- */
  function summary() {
    const s = {}, st = safe(() => Block6.studies()) || [];
    s.protocol = safe(() => Protocol.score(P()).value);
    const se = state.search || {};
    s.search = ((se.blocks || []).length > 0 ? 0.5 : 0) + ((se.files || []).length > 0 ? 0.5 : 0);
    const fr = safe(() => Block5.flowRecords()) || [];
    s.screening = fr.length ? fr.filter(r => r.screen && ['agreed', 'final', 'unread'].includes(r.screen.s)).length / fr.length : 0;
    const fl = safe(() => FullText.flow(fr, Block5.identified(), state.fulltext.links));
    const sought = fl ? fl.db.sought + fl.other.sought : 0;
    s.fulltext = fl && sought ? (fl.pending === 0 && fl.includedStudies > 0 ? 1 : Math.min(0.99, 1 - fl.pending / sought)) : 0;
    const rows = safe(() => Block6.effectRows().filter(r => r.ok)) || [];
    const fields = (state.extraction || {}).fields || [];
    if (TYPE() === 'meta') s.extraction = st.length ? new Set(rows.map(r => r.studyId)).size / st.length : 0;
    else s.extraction = st.length ? st.filter(x => fields.some(f => { const v = safe(() => Block6.finalValue(x.id, f).v); return v != null && v !== '' && !(Array.isArray(v) && !v.length); })).length / st.length : 0;
    s.appraisal = st.length && window.Block7 ? st.filter(x => safe(() => Block7.finalOf(x.id).overall)).length / st.length : 0;
    if (TYPE() === 'meta') { const os = safe(() => Block8.outcomes()) || []; s.synthesis = os.length ? os.filter(o => safe(() => Block8.run(Block8.data(o)))).length / os.length : 0; }
    else s.synthesis = st.length && fields.length ? 1 : 0;
    const secs = safe(() => Block9.sections().filter(x => !x.heading)) || [];
    const txt = (state.writing || {}).text || {};
    s.writing = secs.length ? secs.filter(x => Writing.wordCount(txt[x.id]) >= Math.max(5, x.w[0] || 0)).length / secs.length : 0;
    return s;
  }
  function projectStatus() { const ty = Home.TYPES[TYPE()]; return Report.status(summary(), ty.req, ty.opt); }
  function renderStatus() {
    const box = el('b10Status'); if (!box) return;
    const S = projectStatus(), ty = Home.TYPES[TYPE()];
    const nm = { req: ['necesario', 'required'], opt: ['opcional', 'optional'], na: ['no aplica', 'not applicable'] };
    const sm = { done: ['completo', 'complete', 'ok'], partial: ['en curso', 'in progress', 'warn'], empty: ['sin empezar', 'not started', 'bad'] };
    statTiles('b10Tiles', [
      [T('Tipo de revisión', 'Review type'), two(ty.name), two(ty.guide)],
      [T('Avance de lo necesario', 'Progress of what is required'), fmtPct(S.overall, 0), '', S.ready ? 'ok' : 'warn'],
      [T('Bloques pendientes', 'Blocks pending'), S.blocking.length ? S.blocking.join(', ') : '—', '', S.blocking.length ? 'warn' : 'ok'],
    ]);
    box.innerHTML = `<div class="b10-status">${S.rows.map(r => `<button class="b10-sb ${r.need} ${r.st}" data-go="${r.n}"><span class="b10-sn">${r.n}</span><span class="b10-st"><b>${two(r.name)}</b><small>${two(nm[r.need])} · ${r.need === 'na' && r.st === 'empty' ? '—' : two(sm[r.st])}</small></span><span class="b10-bar"><i style="width:${(100 * r.f).toFixed(0)}%"></i></span><span class="b10-pc">${fmtPct(r.f, 0)}</span></button>`).join('')}</div>` +
      (S.ready ? `<div class="msg msg-success">${L2('Todo lo que este tipo de revisión necesita está completo. El informe y el paquete reflejan el proyecto final.', 'Everything this review type needs is complete. The report and the package reflect the final project.')}</div>` : `<div class="msg msg-warning">${L2('Puedes generar el informe y el paquete ya: saldrán marcados como borrador mientras falten bloques necesarios.', 'You can build the report and the package now: they will be marked as a draft while required blocks are missing.')}</div>`);
  }

  /* ---------------- 2 · figures ---------------- */
  function renderFigures() {
    const box = el('b10Figs'); if (!box) return;
    const fs = numbered();
    if (!fs.length) { box.innerHTML = `<p class="hint">${L2('Todavía no hay figuras: aparecen al avanzar en los Bloques 3 a 8.', 'There are no figures yet: they appear as you progress through Blocks 3 to 8.')}</p>`; return; }
    box.innerHTML = fs.map(f => `<div class="b10-fig${f.num ? '' : ' off'}"><div class="b10-fh"><label><input type="checkbox" data-inc="${f.id}"${f.num ? ' checked' : ''}> <b>${f.num ? `${T('Figura', 'Figure')} ${f.num}` : L2('No incluida', 'Not included')}</b></label><span class="muted">${L2('Bloque', 'Block')} ${f.block}</span><button class="btn btn-secondary btn-sm" data-exp="${f.id}">⤓ ${L2('Exportar', 'Export')}</button></div>
      <div class="b10-thumb">${figSVG(f)}</div>
      <input type="text" data-cap="${f.id}" value="${esc(RP().captions[f.id] || '')}" placeholder="${esc(f.title)}" aria-label="${esc(T('Pie de figura', 'Figure caption') + ': ' + f.title)}"></div>`).join('');
    const o = state.synthesis && state.synthesis.outcome;
    el('b10FigNote').innerHTML = o ? L2(`Las figuras del Bloque 8 son del desenlace elegido allí (<b>${esc(o)}</b>); cambia el desenlace en el Bloque 8 para exportar las de otro.`, `Block 8 figures belong to the outcome chosen there (<b>${esc(o)}</b>); change the outcome in Block 8 to export those of another.`) : '';
  }

  /* ---------------- 3 · report ---------------- */
  const bodyOf = html => { const m = String(html || '').match(/<body[^>]*>([\s\S]*)<\/body>/i); return m ? m[1] : ''; };
  const shiftH = (html, k) => html.replace(/<(\/?)h([1-6])/gi, (m, s, n) => `<${s}h${Math.min(6, +n + k)}`);
  const tbl = tb => tb ? `<table><thead><tr>${tb.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>${tb.caption ? `<p class="cap">${esc(tb.caption)}</p>` : ''}` : '';
  function buildReport(L) {
    const t = (es, en) => (L === 'en' ? en : es), p = P(), ty = Home.TYPES[TYPE()];
    const S = projectStatus(), figs = numbered().filter(f => f.num);
    const figsOf = sec => figs.filter(f => f.sec === sec).map(f => `<figure>${figSVG(f)}<figcaption><b>${t('Figura', 'Figure')} ${f.num}.</b> ${esc(caption(f))}</figcaption></figure>`).join('');
    const authors = has((state.writing || {}).authors) ? state.writing.authors : (p.team || []).map(a => a.name).filter(Boolean).join(', ');
    const q = safe(() => Protocol.questionOf(p, L)) || '';
    const reg = has(p.registration.id) ? `${p.registration.registry === 'prospero' ? 'PROSPERO' : 'OSF'} ${p.registration.id}` : t('sin registro', 'not registered');
    const fl = safe(() => FullText.flow(Block5.flowRecords(), Block5.identified(), state.fulltext.links));
    const S2 = { done: t('completo', 'complete'), partial: t('en curso', 'in progress'), empty: t('sin empezar', 'not started') };
    let h = `<header><p class="kind">${esc(t(ty.name[0], ty.name[1]))}${S.ready ? '' : ` · <span class="draft">${t('BORRADOR', 'DRAFT')}</span>`}</p><h1>${esc(p.title || t('Revisión sin título', 'Untitled review'))}</h1>${authors ? `<p class="au">${esc(authors)}</p>` : ''}
      <p class="meta">${t('Informe generado el', 'Report generated on')} ${localStamp().slice(0, 10)} · ReviewPro ${APP_VERSION} · ${t('Registro', 'Registration')}: ${esc(reg)}</p></header>`;
    h += `<section><h2>${t('1. Pregunta y alcance', '1. Question and scope')}</h2>${q ? `<p class="q">${esc(q)}</p>` : ''}${has(p.objectives) ? `<p>${esc(p.objectives)}</p>` : ''}
      <table><thead><tr><th>${t('Bloque', 'Block')}</th><th>${t('Necesidad', 'Need')}</th><th>${t('Estado', 'Status')}</th><th>${t('Avance', 'Progress')}</th></tr></thead><tbody>${S.rows.map(r => `<tr><td>${r.n}. ${esc(t(r.name[0], r.name[1]))}</td><td>${r.need === 'req' ? t('necesario', 'required') : r.need === 'opt' ? t('opcional', 'optional') : t('no aplica', 'n/a')}</td><td>${S2[r.st]}</td><td>${Math.round(100 * r.f)} %</td></tr>`).join('')}</tbody></table>
      <p class="cap">${t('Guía de reporte', 'Reporting guideline')}: ${esc(t(ty.guide[0], ty.guide[1]))}.</p></section>`;
    const srch = safe(() => Block3.reportMd(L));
    h += `<section><h2>${t('2. Búsqueda', '2. Search')}</h2>${srch ? Report.md(srch.replace(/^# .*\n/, ''), 1) : `<p>${t('Sin estrategia de búsqueda.', 'No search strategy.')}</p>`}${figsOf('search')}</section>`;
    h += `<section><h2>${t('3. Selección de estudios', '3. Study selection')}</h2>`;
    if (fl) h += `<p>${t(`Se identificaron ${fl.db.identified + fl.other.identified} registros; tras eliminar ${fl.db.duplicates + fl.other.duplicates} duplicados se cribaron ${fl.db.screened + fl.other.screened}, se evaluaron ${fl.db.assessed + fl.other.assessed} informes a texto completo y se incluyeron ${fl.includedStudies} estudios (${fl.includedReports} informes).`, `${fl.db.identified + fl.other.identified} records were identified; after removing ${fl.db.duplicates + fl.other.duplicates} duplicates, ${fl.db.screened + fl.other.screened} were screened, ${fl.db.assessed + fl.other.assessed} reports were assessed in full text and ${fl.includedStudies} studies (${fl.includedReports} reports) were included.`)}${fl.pending ? ` <span class="draft">${t(`${fl.pending} registros siguen pendientes.`, `${fl.pending} records are still pending.`)}</span>` : ''}</p>`;
    const ag = el('b4Agree');
    if (ag && ag.querySelector('table')) { const c = ag.cloneNode(true); c.querySelectorAll('button,input,select').forEach(n => n.remove()); h += `<h3>${t('Acuerdo entre revisores', 'Agreement between reviewers')}</h3>${c.innerHTML}`; }
    h += figsOf('selection') + '</section>';
    const ch = safe(() => Block9.table('characteristics', L));
    h += `<section><h2>${t('4. Estudios incluidos', '4. Included studies')}</h2>${ch ? tbl(ch) : `<p>${t('Aún no hay estudios incluidos.', 'No studies included yet.')}</p>`}</section>`;
    if (Home.TYPES[TYPE()].req.includes(7) || figsOf('rob')) {
      const tool = state.appraisal && Appraisal.TOOLS[state.appraisal.tool];
      h += `<section><h2>${t('5. Riesgo de sesgo', '5. Risk of bias')}</h2>${tool ? `<p>${t('Herramienta', 'Tool')}: ${esc(t(tool.name[0], tool.name[1]))}.</p>` : ''}${figsOf('rob')}</section>`;
    }
    h += `<section><h2>${t('6. Síntesis', '6. Synthesis')}</h2>`;
    const res = safe(() => Report.csv(Block8.resultsCSV()));
    if (res && res.length > 1) {
      const H = res[0], ix = k => H.indexOf(k), f = v => (v === '' || v == null ? '—' : isFinite(+v) ? fmtFixed(+v, 3) : v);
      h += `<table><thead><tr><th>${t('Desenlace', 'Outcome')}</th><th>${t('Estudios', 'Studies')}</th><th>${t('Efectos', 'Effects')}</th><th>${t('Métrica', 'Metric')}</th><th>${t('Estimación', 'Estimate')}</th><th>${t('IC 95 %', '95 % CI')}</th><th>p</th><th>${t('Int. de predicción', 'Prediction int.')}</th><th>I²</th></tr></thead><tbody>` +
        res.slice(1).map(r => `<tr><td>${esc(r[ix('outcome')])}</td><td>${r[ix('studies')]}</td><td>${r[ix('effects')]}</td><td>${esc(r[ix('metric')])}</td><td>${f(r[ix('estimate')])}</td><td>${f(r[ix('ci_lo')])} ${t('a', 'to')} ${f(r[ix('ci_hi')])}</td><td>${+r[ix('p')] < 0.001 ? '&lt; 0.001' : f(r[ix('p')])}</td><td>${r[ix('pi_lo')] === '' ? '—' : `${f(r[ix('pi_lo')])} ${t('a', 'to')} ${f(r[ix('pi_hi')])}`}</td><td>${Math.round(100 * +r[ix('I2_total')])} %</td></tr>`).join('') +
        `</tbody></table><p class="cap">${t('Estimaciones en la escala de análisis (para lnRR, el cambio porcentual es 100·(e^x − 1)).', 'Estimates on the analysis scale (for lnRR, the percent change is 100·(e^x − 1)).')}</p>`;
      const mt = safe(() => Block8.methodsText(L));
      if (mt) h += `<h3>${t('Métodos de la síntesis', 'Synthesis methods')}</h3><p>${esc(mt)}</p>`;
    } else h += `<p>${t('Sin meta-análisis: la síntesis es narrativa o temática (ver el manuscrito).', 'No meta-analysis: the synthesis is narrative or thematic (see the manuscript).')}</p>`;
    h += figsOf('synthesis') + '</section>';
    const sof = safe(() => Block9.table('sof', L));
    if (sof) h += `<section><h2>${t('7. Certeza de la evidencia', '7. Certainty of the evidence')}</h2>${tbl(sof)}</section>`;
    if (RP().manuscript) {
      const m = safe(() => Block9.manuscript(L));
      if (m && m.blocks.some(b => b.p && b.style !== 'Reference' && b.style !== 'Normal')) {
        h += `<section class="ms"><h2>${t('8. Manuscrito', '8. Manuscript')}</h2>` + m.blocks.filter(b => !b.title).map(b => b.h ? `<h${b.h + 2}>${esc(b.text)}</h${b.h + 2}>` : b.table ? tbl(b.table) : `<p${b.style === 'Reference' ? ' class="ref"' : ''}>${esc(b.p)}</p>`).join('') + '</section>';
      }
    }
    if (RP().annexes) {
      const pr = safe(() => Block2.protocolHTML(L));
      h += `<section class="annex"><h2>${t('Anexo A. Protocolo', 'Annex A. Protocol')}</h2>${pr ? shiftH(bodyOf(pr), 2) : ''}${figsOf('annex')}</section>`;
    }
    h += `<footer>${t(`Informe de ReviewPro ${APP_VERSION}. El proyecto completo (.reviewpro.json) reproduce cada número de este informe.`, `ReviewPro ${APP_VERSION} report. The full project (.reviewpro.json) reproduces every number in this report.`)}</footer>`;
    return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${esc(p.title || 'ReviewPro')}</title><style>
body{font-family:Georgia,'Times New Roman',serif;max-width:900px;margin:36px auto;padding:0 18px;line-height:1.55;color:#1b1b1b;background:#fff}
header{border-bottom:2px solid #33539e;margin-bottom:18px}h1{font-size:1.6rem;margin:.2em 0}.kind{color:#33539e;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:.8rem;margin:0}
.au{margin:.2em 0}.meta{color:#666;font-size:.82rem}.q{font-size:1.05rem;font-style:italic;border-left:3px solid #d97a2b;padding-left:12px}
h2{font-size:1.25rem;color:#33539e;margin-top:1.8em;border-bottom:1px solid #ddd}h3{font-size:1.05rem}h4,h5{font-size:.95rem}
table{border-collapse:collapse;width:100%;font-size:.8rem;margin:10px 0;font-family:system-ui,sans-serif}td,th{border-bottom:1px solid #ddd;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f3f4f8}
.cap,figcaption{font-size:.84rem;color:#444;font-style:italic}figure{margin:16px 0;page-break-inside:avoid}figure svg{max-width:100%;height:auto}
.draft{color:#c2415e;font-weight:700}.ref{padding-left:2em;text-indent:-2em;font-size:.9rem}.annex{page-break-before:always}pre{white-space:pre-wrap;font-size:.8rem;background:#f6f6f6;padding:8px}
footer{margin-top:40px;border-top:1px solid #ddd;padding-top:8px;color:#777;font-size:.78rem}@media print{body{margin:0;max-width:none}section{page-break-inside:auto}}
</style></head><body>${h}</body></html>`;
  }
  let prevT = null;
  function renderPreview() {
    const fr = el('b10Frame'); if (!fr) return;
    clearTimeout(prevT);
    prevT = setTimeout(() => { fr.srcdoc = buildReport(I18N.lang); }, 60);
  }

  /* ---------------- 4 · package ---------------- */
  async function packageFiles(L, withPng) {
    const t = (es, en) => (L === 'en' ? en : es), p = P(), base = slug(p.title || 'revision');
    const F = [];
    const add = (name, data, desc) => { if (data != null && data !== '') F.push({ name, data, desc }); };
    add(`proyecto/${base}.reviewpro.json`, JSON.stringify(Project.snapshot(), null, 1), t('el proyecto completo; se reabre en ReviewPro', 'the full project; reopens in ReviewPro'));
    add('informe.html', buildReport(L), t('informe que se lee solo (imprimible a PDF)', 'self-contained report (printable to PDF)'));
    add('protocolo/protocolo.html', safe(() => Block2.protocolHTML(L)), t('protocolo con la lista PRISMA-P', 'protocol with the PRISMA-P checklist'));
    ['prospero', 'osf'].forEach(w => add(`protocolo/registro_${w}.md`, safe(() => Protocol.registrationText(p, w, p.registration.lang || L)), t(`campos para el registro ${w === 'prospero' ? 'PROSPERO' : 'OSF'}`, `fields for the ${w === 'prospero' ? 'PROSPERO' : 'OSF'} registration`)));
    add('busqueda/estrategia.md', safe(() => Block3.reportMd(L)), t('cadenas por base, registro de búsquedas y duplicados', 'strings per database, search log and duplicates'));
    add('cribado/decisiones.csv', safe(() => Block4.decisionsCSV()), t('decisiones de cada revisor y la final', 'each reviewer\'s decisions and the final one'));
    add('seleccion/flujo_prisma.md', safe(() => Block5.flowMd(L)), t('conteos del diagrama de flujo', 'flow diagram counts'));
    add('extraccion/caracteristicas.csv', safe(() => (Block6.studies().length ? Block6.charsCSV() : null)), t('tabla de características', 'characteristics table'));
    add('extraccion/efectos.csv', safe(() => (Block6.effectRows().some(r => r.ok) ? Block6.effectsCSV() : null)), t('tabla de efectos (entrada del meta-análisis)', 'effects table (meta-analysis input)'));
    add('calidad/resumen_de_hallazgos.html', safe(() => (Block7.outcomeData().length ? Block7.sofHTML(L) : null)), t('resumen de hallazgos con GRADE', 'summary of findings with GRADE'));
    const rc = safe(() => Block8.resultsCSV());
    if (rc && Report.csv(rc).length > 1) { add('sintesis/resultados.csv', rc, t('resultados por desenlace', 'results per outcome')); add('sintesis/metodos.txt', safe(() => Block8.methodsText(L)), t('párrafo de métodos', 'methods paragraph')); }
    const ks = safe(() => Block9.studyKeys()) || [];
    if (ks.length) {
      add('referencias/estudios_incluidos.ris', Records.toRIS(ks.map(k => k.rec)), t('los estudios incluidos para el gestor de referencias', 'the included studies for the reference manager'));
      add('referencias/estudios_incluidos.bib', Records.toBib(ks.map(k => k.rec), ks.map(k => k.key)), t('los mismos en BibTeX, con las claves [@clave] del manuscrito', 'the same in BibTeX, with the manuscript\'s [@key] keys'));
    }
    const hasText = Object.values((state.writing || {}).text || {}).some(has);
    if (hasText) {
      add('manuscrito/manuscrito.md', safe(() => Block9.toMarkdown(L)), t('manuscrito en Markdown', 'manuscript in Markdown'));
      add('manuscrito/manuscrito.html', safe(() => Block9.toHTML(L)), t('manuscrito en HTML', 'manuscript in HTML'));
      const dx = await safe(() => Block9.toDocx(L));
      if (dx) add('manuscrito/manuscrito.docx', new Uint8Array(await dx.arrayBuffer()), t('manuscrito para el procesador de textos', 'manuscript for the word processor'));
    }
    for (const f of numbered().filter(x => x.num)) {
      const nm = `figuras/figura_${String(f.num).padStart(2, '0')}_${slug(f.t[L === 'en' ? 1 : 0]).slice(0, 40)}`;
      const c = Fig.compose(f.svg, { theme: 'light', background: 'white', title: `${t('Figura', 'Figure')} ${f.num}. ${caption(f)}` });
      add(nm + '.svg', Fig.serialize(c), caption(f));
      if (withPng) { const r = await safe(() => Fig.fileOf(c, { format: 'png', dpi: RP().dpi || 300 })); if (r) add(nm + '.png', new Uint8Array(await r.blob.arrayBuffer()), `${caption(f)} (${r.dpi} dpi)`); }
    }
    const files = Report.manifest(F);
    const ty = Home.TYPES[TYPE()];
    const rd = Report.readme(files, { version: APP_VERSION, title: p.title, type: t(ty.name[0], ty.name[1]), date: localStamp() }, L);
    return [{ name: L === 'en' ? 'README.txt' : 'LEEME.txt', data: '﻿' + rd }].concat(files);
  }
  async function buildPackage() {
    /* the busy indicator holds the button; a failure is rethrown so that it
       does not end in a check mark */
    const msg = el('b10ZipMsg');
    let failed = null;
    msg.innerHTML = `<span class="muted">${L2('Armando el paquete…', 'Building the package…')}</span>`;
    try {
      const L = I18N.lang, files = await packageFiles(L, !!RP().png);
      const blob = await Zip.build(files.map(f => ({ name: f.name, data: f.data })));
      download(blob, slug(P().title || 'revision') + '_reviewpro.zip', 'application/zip');
      msg.innerHTML = `<div class="msg msg-success">${L2(`Paquete listo: ${files.length} archivos, ${fmtNum(Math.round(blob.size / 1024))} kB.`, `Package ready: ${files.length} files, ${fmtNum(Math.round(blob.size / 1024))} kB.`)}</div><ul class="b10-list">${files.map(f => `<li><code>${esc(f.name)}</code>${f.desc ? ` <span class="muted">${esc(f.desc)}</span>` : ''}</li>`).join('')}</ul>`;
    } catch (e) { failed = e; msg.innerHTML = `<div class="msg msg-error">${esc(e.message)}</div>`; }
    if (failed) throw failed;
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    const set = (id, v) => { const n = el(id); if (n) n.checked = !!v; };
    set('b10Png', RP().png); set('b10Ms', RP().manuscript); set('b10Annex', RP().annexes);
    renderStatus(); renderFigures(); renderPreview();
  }
  function enter() { refreshBlocks(); renderAll(); }

  /* ---------------- events ---------------- */
  function wire() {
    const panel = el('panel-10'); if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go) { goStep(+b.dataset.go); return; }
      if (b.dataset.exp) { const f = numbered().find(x => x.id === b.dataset.exp); if (f) Fig.showMenu(b, f.svg, f.num ? `${T('Figura', 'Figure')} ${f.num}. ${caption(f)}` : caption(f)); return; }
      switch (b.id) {
        case 'b10Refresh': enterUI(); break;
        case 'b10Html': rvBusy(b, () => download(buildReport(I18N.lang), slug(P().title || 'revision') + '_informe.html', 'text/html;charset=utf-8')); break;
        case 'b10Print': { const w = window.open('', '_blank'); if (w) { w.document.write(buildReport(I18N.lang)); w.document.close(); setTimeout(() => w.print(), 400); } break; }
        case 'b10Zip': rvBusy(b, buildPackage); break;
        case 'b10Ris': case 'b10Bib': {
          const ks = safe(() => Block9.studyKeys()) || [];
          if (!ks.length) { el('b10ZipMsg').innerHTML = `<div class="msg msg-warning">${L2('Aún no hay estudios incluidos.', 'There are no included studies yet.')}</div>`; break; }
          const bib = b.id === 'b10Bib', base = slug(P().title || 'revision') + '_estudios_incluidos';
          download(bib ? Records.toBib(ks.map(k => k.rec), ks.map(k => k.key)) : Records.toRIS(ks.map(k => k.rec)), base + (bib ? '.bib' : '.ris'), 'text/plain;charset=utf-8');
          break;
        }
      }
    });
    panel.addEventListener('change', e => {
      const n = e.target;
      if (n.dataset.inc) { RP().include[n.dataset.inc] = n.checked; Project.touch(); renderFigures(); renderPreview(); return; }
      if (n.dataset.cap) { RP().captions[n.dataset.cap] = n.value; Project.touch(); renderPreview(); return; }
      if (n.id === 'b10Png') { RP().png = n.checked; Project.touch(); return; }
      if (n.id === 'b10Ms') { RP().manuscript = n.checked; Project.touch(); renderPreview(); return; }
      if (n.id === 'b10Annex') { RP().annexes = n.checked; Project.touch(); renderPreview(); }
    });
    Project.on(kind => { if (kind === 'load') renderAll(); });
    document.addEventListener('langchange', () => { if (state.protocol && el('panel-10').classList.contains('active')) enter(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 10) enterUI(); });
  }
  /* entering redraws every block to gather the report: from the interface it
     runs in the work window; enter() stays synchronous */
  function enterUI() {
    return rvAfterPaint(enter, rvWork('Reuniendo el informe', 'Gathering the report'));
  }
  function init() {
    ensure(); wire();
    if (location.hash === '#b10') setTimeout(() => goStep(10), 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));
  window.Block10 = { renderAll, enter, summary, projectStatus, figures: numbered, buildReport, packageFiles };
})();
