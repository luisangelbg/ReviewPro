/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 1: the two laboratories of the home page.

   Nothing here is an animation. The screening lab writes a pile of fictitious
   records whose truth is known, screens it with the same ranking model Block 4
   will use on real records, and reports what a reviewer would have saved and
   what a stopping rule would have cost. The meta-analysis lab draws a
   literature of field trials from a known true effect and pools it with the
   engine of Block 8, so the gap between the truth and the estimate —and what
   heterogeneity and publication bias do to it— can be seen directly. */

(function () {

  const C = n => `var(--${n})`;
  const two = p => L2(p[0], p[1]);
  const debounce = (fn, ms) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
  /* Plot.line takes pixel points; the labs think in data units */
  const dline = (f, pts, colour, o) => Plot.line(f, pts.map(([x, y]) => [f.sx(x), f.sy(y)]), colour, o);

  /* ======================================================================
     A · the screening laboratory
     ====================================================================== */
  const SL = { recs: null, fe: null, sim: null, rnd: null, key: '' };

  function slOpts() {
    return {
      n: +el('slN').value, prevalence: +el('slPrev').value / 100, difficulty: +el('slDiff').value,
      batch: +el('slBatch').value, stop: el('slStop').value, seed: Math.max(1, Math.round(+el('slSeed').value) || 1),
    };
  }
  function slRun() {
    const o = slOpts();
    const status = el('slStatus');
    const t0 = performance.now();
    const key = [o.n, o.prevalence, o.difficulty, o.seed].join('|');
    if (key !== SL.key) {
      SL.recs = Screen.corpus({ n: o.n, prevalence: o.prevalence, difficulty: o.difficulty }, o.seed);
      SL.fe = Screen.tfidf(SL.recs.map(r => Screen.tokenize(r.title + ' ' + r.abstract)));
      SL.key = key;
    }
    const labels = SL.recs.map(r => r.label);
    /* the reviewer starts from a typical relevant paper, not from one that mentions the topic in passing */
    const known = SL.recs.map((x, i) => (x.label && !x.subtle ? i : -1)).filter(i => i >= 0);
    SL.sim = Screen.simulate(SL.fe.rows, labels, SL.fe.terms.length, { batch: o.batch, seed: o.seed, prior: [1, 1], priorRelPool: known.length ? known : null });
    SL.rnd = Screen.simulate(SL.fe.rows, labels, SL.fe.terms.length, { strategy: 'random', seed: o.seed + 101 });
    const f = SL.sim.found, nRel = SL.sim.nRel, N = SL.sim.N;
    let stopAt, stopNote;
    if (o.stop === 'knee' || o.stop === 'knee6') {
      const k = Screen.stopKnee(f, { fixed: o.stop === 'knee6' ? 6 : null });
      stopAt = k.at;
      stopNote = k.knee ? T(`rodilla en el registro ${k.knee}, ρ = ${fmtFixed(k.rho, 1)}`, `knee at record ${k.knee}, ρ = ${fmtFixed(k.rho, 1)}`) : T('la regla no se activó: se leyó todo', 'the rule never fired: everything was read');
    } else {
      const d = +o.stop;
      stopAt = Screen.stopConsecutive(f, d, 0);
      stopNote = T(`${d} irrelevantes seguidos`, `${d} irrelevant in a row`);
    }
    SL.stopAt = stopAt;
    const res = {
      N, nRel, stopAt, stopNote,
      wss95: Screen.wss(f, nRel, 0.95), wss100: Screen.wss(f, nRel, 1),
      rrf10: Screen.rrf(f, nRel, 0.10), n95: Screen.screenedAt(f, nRel, 0.95),
      atd: Screen.atd(f, nRel), atdRnd: Screen.atd(SL.rnd.found, nRel),
      recallStop: f[stopAt] / nRel,
    };
    SL.res = res;
    slReadout(res);
    slCurve(res);
    slPrisma();
    slRecords();
    status.innerHTML = L2(`${fmtNum(N)} registros cribados dos veces (priorizado y al azar) en ${fmtFixed(performance.now() - t0, 0)} ms, dentro de tu navegador.`,
      `${fmtNum(N)} records screened twice (prioritized and at random) in ${fmtFixed(performance.now() - t0, 0)} ms, inside your browser.`);
  }

  function slReadout(r) {
    const lvl = v => v >= 0.95 ? 'ok' : v >= 0.9 ? 'warn' : 'bad';
    statTiles('slReadout', [
      [T('Relevantes en la pila', 'Relevant in the pile'), `${r.nRel} / ${fmtNum(r.N)}`, fmtPct(r.nRel / r.N)],
      [T('Leídos para el 95 %', 'Read for 95 %'), fmtNum(r.n95), T(`${fmtPct(r.n95 / r.N)} de la pila`, `${fmtPct(r.n95 / r.N)} of the pile`)],
      ['WSS@95', fmtPct(r.wss95), T('trabajo ahorrado frente al azar', 'work saved over random')],
      ['RRF@10', fmtPct(r.rrf10), T('relevantes tras leer el 10 %', 'relevant after reading 10 %')],
      [T('Regla de paro', 'Stopping rule'), T(`paró en ${fmtNum(r.stopAt)}`, `stopped at ${fmtNum(r.stopAt)}`), r.stopNote],
      [T('Recall al parar', 'Recall at stop'), fmtPct(r.recallStop), T(`se perdieron ${r.nRel - Math.round(r.recallStop * r.nRel)}`, `${r.nRel - Math.round(r.recallStop * r.nRel)} missed`), lvl(r.recallStop)],
    ]);
  }

  function slCurve(r) {
    const svg = el('slCurve');
    const N = r.N, f = SL.sim.found, g = SL.rnd.found;
    const fig = Plot.frame(svg, { W: 560, H: 300, m: { l: 50, r: 16, t: 26, b: 40 }, x: [0, N], y: [0, 1],
      xlab: T('registros leídos', 'records read'), ylab: T('relevantes encontrados', 'relevant found'), ylabFmt: Plot.pctTick });
    const step = Math.max(1, Math.floor(N / 400));
    const pts = (arr) => { const out = []; for (let k = 0; k <= N; k += step) out.push([k, arr[k] / r.nRel]); out.push([N, 1]); return out; };
    dline(fig, [[0, 0], [r.nRel, 1], [N, 1]], C('c3'), { width: 1.2, dash: '2 3' });
    dline(fig, [[0, 0], [N, 1]], C('text-muted'), { width: 1, dash: '5 4', opacity: 0.8 });
    dline(fig, pts(g), C('c8'), { width: 1.5, opacity: 0.85 });
    dline(fig, pts(f), C('c1'), { width: 2.4 });
    Plot.hline(fig, 0.95, C('c2'), { dash: '3 3', label: '95 %', right: true, below: true });
    Plot.vline(fig, r.stopAt, C('c4'), { label: T('paro', 'stop'), dash: '4 3' });
    Plot.vspan(fig, r.n95, N * 0.95, C('c2'), 0.1, 'WSS@95');
    Plot.legend(fig, [[T('priorizado', 'prioritized'), C('c1'), 'ln'], [T('al azar', 'random'), C('c8'), 'ln'], [T('ideal', 'ideal'), C('c3'), 'dash']], 12);
  }

  /* ---- the PRISMA 2020 flow diagram of the simulated review ---- */
  function wrapLines(text, max) {
    const words = String(text).split(' '), out = [];
    let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur);
    return out;
  }
  function box(svg, x, y, w, lines, o) {
    const opt = o || {};
    const lh = 12, h = opt.h || (lines.length * lh + 12);
    svg.appendChild(svgEl('rect', { x, y, width: w, height: h, rx: 6, fill: opt.fill || C('card-bg'), stroke: opt.stroke || C('primary'), 'stroke-width': 1.2 }));
    lines.forEach((ln, i) => svg.appendChild(svgEl('text', { x: x + 8, y: y + 16 + i * lh, 'font-size': 9.5, class: i === 0 && opt.bold ? 'art-txt' : 'art-txt', 'font-weight': i === 0 && opt.bold ? 700 : 400 }, ln)));
    return h;
  }
  function arrow(svg, x1, y1, x2, y2) {
    svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: C('text-muted'), 'stroke-width': 1.2 }));
    const a = Math.atan2(y2 - y1, x2 - x1), s = 6;
    svg.appendChild(svgEl('path', { d: `M${x2} ${y2} L${x2 - s * Math.cos(a - 0.4)} ${y2 - s * Math.sin(a - 0.4)} L${x2 - s * Math.cos(a + 0.4)} ${y2 - s * Math.sin(a + 0.4)} Z`, fill: C('text-muted') }));
  }
  function prismaDiagram(svg, p) {
    Plot.clear(svg);
    const W = 600, H = 470;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const lx = 40, lw = 270, rx = 340, rw = 250;
    /* the three phase labels on the left edge */
    const phase = (y, h, t) => {
      svg.appendChild(svgEl('rect', { x: 4, y, width: 24, height: h, rx: 5, fill: C('primary'), opacity: 0.85 }));
      svg.appendChild(svgEl('text', { x: 16, y: y + h / 2 + 3, 'font-size': 8.5, fill: '#fff', 'font-weight': 700, 'text-anchor': 'middle', transform: `rotate(-90 16 ${y + h / 2})` }, t));
    };
    const Ls = s => wrapLines(s, 44);
    let y = 10;
    const h1 = box(svg, lx, y, lw, [T('Registros identificados en:', 'Records identified from:'),
      T(`  base de datos 1 (n = ${fmtNum(p.sources[0])})`, `  database 1 (n = ${fmtNum(p.sources[0])})`),
      T(`  base de datos 2 (n = ${fmtNum(p.sources[1])})`, `  database 2 (n = ${fmtNum(p.sources[1])})`),
      T(`  base de datos 3 (n = ${fmtNum(p.sources[2])})`, `  database 3 (n = ${fmtNum(p.sources[2])})`),
      T(`  total (n = ${fmtNum(p.total)})`, `  total (n = ${fmtNum(p.total)})`)], { bold: true });
    const r1 = box(svg, rx, y + 10, rw, [T('Eliminados antes del cribado:', 'Records removed before screening:'),
      T(`  duplicados (n = ${fmtNum(p.dup)})`, `  duplicates (n = ${fmtNum(p.dup)})`)], { bold: true, stroke: C('rose') });
    arrow(svg, lx + lw, y + 10 + r1 / 2, rx, y + 10 + r1 / 2);
    phase(y, h1, T('Identificación', 'Identification'));
    const y2 = y + h1 + 24;
    arrow(svg, lx + lw / 2, y + h1, lx + lw / 2, y2);
    const h2 = box(svg, lx, y2, lw, [T(`Registros cribados (n = ${fmtNum(p.N)})`, `Records screened (n = ${fmtNum(p.N)})`),
      ...Ls(T(`leídos antes de la regla de paro: ${fmtNum(p.screened)}`, `read before the stopping rule: ${fmtNum(p.screened)}`))], { bold: true });
    const r2 = box(svg, rx, y2, rw, [T('Registros excluidos:', 'Records excluded:'),
      T(`  por los revisores (n = ${fmtNum(p.excludedTA)})`, `  by the reviewers (n = ${fmtNum(p.excludedTA)})`),
      T(`  no leídos tras el paro (n = ${fmtNum(p.notScreened)})`, `  unread after stopping (n = ${fmtNum(p.notScreened)})`)], { bold: true, stroke: C('rose') });
    arrow(svg, lx + lw, y2 + h2 / 2, rx, y2 + h2 / 2);
    const y3 = y2 + Math.max(h2, r2) + 22;
    arrow(svg, lx + lw / 2, y2 + h2, lx + lw / 2, y3);
    const h3 = box(svg, lx, y3, lw, [T(`Informes buscados (n = ${fmtNum(p.sought)})`, `Reports sought for retrieval (n = ${fmtNum(p.sought)})`)], { bold: true });
    box(svg, rx, y3, rw, [T(`Informes no recuperados (n = ${fmtNum(p.notRet)})`, `Reports not retrieved (n = ${fmtNum(p.notRet)})`)], { bold: true, stroke: C('rose') });
    arrow(svg, lx + lw, y3 + h3 / 2, rx, y3 + h3 / 2);
    const y4 = y3 + h3 + 22;
    arrow(svg, lx + lw / 2, y3 + h3, lx + lw / 2, y4);
    const h4 = box(svg, lx, y4, lw, [T(`Informes evaluados (n = ${fmtNum(p.assessed)})`, `Reports assessed for eligibility (n = ${fmtNum(p.assessed)})`)], { bold: true });
    const r4 = box(svg, rx, y4, rw, [T('Informes excluidos:', 'Reports excluded:'),
      T(`  desenlace distinto (n = ${p.reasons.outcome})`, `  wrong outcome (n = ${p.reasons.outcome})`),
      T(`  diseño no elegible (n = ${p.reasons.design})`, `  ineligible design (n = ${p.reasons.design})`),
      T(`  sin datos utilizables (n = ${p.reasons.data})`, `  no usable data (n = ${p.reasons.data})`)], { bold: true, stroke: C('rose') });
    arrow(svg, lx + lw, y4 + h4 / 2, rx, y4 + h4 / 2);
    phase(y2, y4 + Math.max(h4, r4) - y2, T('Cribado', 'Screening'));
    const y5 = y4 + Math.max(h4, r4) + 22;
    arrow(svg, lx + lw / 2, y4 + h4, lx + lw / 2, y5);
    const h5 = box(svg, lx, y5, lw, [T(`Estudios incluidos (n = ${fmtNum(p.included)})`, `Studies included (n = ${fmtNum(p.included)})`)], { bold: true, stroke: C('leaf'), fill: C('card-bg'), h: 56 });
    phase(y5, h5, T('Incluidos', 'Included'));
    if (p.missed > 0) {
      svg.appendChild(svgEl('text', { x: rx, y: y5 + 14, 'font-size': 9, class: 'art-mut' }, T(`La verdad del laboratorio: ${p.missed} relevante(s)`, `The lab's truth: ${p.missed} relevant record(s)`)));
      svg.appendChild(svgEl('text', { x: rx, y: y5 + 26, 'font-size': 9, class: 'art-mut' }, T('quedaron entre los no leídos.', 'stayed among the unread.')));
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${Math.max(H, y5 + h5 + 10)}`);
  }
  function slPrisma() {
    const p = Screen.prismaCounts(SL.sim, SL.recs, SL.stopAt, {}, slOpts().seed);
    SL.prisma = p;
    prismaDiagram(el('slPrisma'), p);
  }

  /* ---- what the model learned, and the first records it put forward ---- */
  function slRecords() {
    const box = el('slRecords'); if (!box) return;
    const sim = SL.sim, V = SL.fe.terms.length;
    const nb = Screen.NB(V, 1);
    for (let k = 0; k < SL.stopAt; k++) nb.add(SL.fe.rows[sim.order[k]], SL.recs[sim.order[k]].label);
    const w = nb.weights();
    const idx = [...w.keys()];
    const posT = idx.slice().sort((a, b) => w[b] - w[a]).slice(0, 12);
    const negT = idx.slice().sort((a, b) => w[a] - w[b]).slice(0, 10);
    const hi = new Set(posT.map(i => SL.fe.terms[i]));
    const mark = s => esc(s).replace(/[A-Za-z]+/g, word => (hi.has(Screen.stem(word.toLowerCase())) ? `<mark>${word}</mark>` : word));
    const first = sim.order.slice(sim.nPrior, sim.nPrior + 6);
    box.innerHTML = `<div class="sl-terms"><div><b>${L2('Palabras que empujan hacia «relevante»', 'Words that push towards "relevant"')}</b><div class="chips">${posT.map(i => `<span class="chip p">${esc(SL.fe.terms[i])}</span>`).join('')}</div></div>
      <div><b>${L2('Palabras que empujan hacia «irrelevante»', 'Words that push towards "irrelevant"')}</b><div class="chips">${negT.map(i => `<span class="chip bad">${esc(SL.fe.terms[i])}</span>`).join('')}</div></div></div>
      <p class="hint">${L2('Los primeros registros que el modelo puso frente al revisor, después de los dos que ya conocía. El resaltado marca las palabras que más pesaron; la etiqueta es la verdad del laboratorio.', 'The first records the model put in front of the reviewer, after the two already known. The highlight marks the words that weighed most; the tag is the laboratory\'s truth.')}</p>
      <ol class="sl-list">${first.map(i => { const r = SL.recs[i]; return `<li><span class="tag ${r.label ? 'in' : 'out'}">${r.label ? L2('relevante', 'relevant') : L2('irrelevante', 'irrelevant')}</span><div class="t">${mark(r.title)}</div><div class="a">${mark(r.abstract)}</div><div class="m">${esc(r.journal)} · ${r.year} · ${L2('registro ficticio', 'fictitious record')}</div></li>`; }).join('')}</ol>`;
  }

  /* ======================================================================
     B · the meta-analysis laboratory
     ====================================================================== */
  const ML = {};
  const pctOf = y => (Math.exp(y) - 1) * 100;
  const fmtPctChange = y => { const v = pctOf(y); return (v >= 0 ? '+' : '−') + fmtFixed(Math.abs(v), 1) + ' %'; };

  function mlOpts() {
    return {
      k: +el('mlK').value, effect: +el('mlEff').value, tau: +el('mlTau').value, nMax: +el('mlN').value,
      bias: el('mlBias').checked, method: el('mlMethod').value, knha: el('mlKnha').checked,
      seed: Math.max(1, Math.round(+el('mlSeed').value) || 1),
    };
  }
  function mlRun() {
    const o = mlOpts();
    const mu = Math.log(1 + o.effect / 100);
    const studies = Meta.simulate({ k: o.k, mu, tau: o.tau, nMin: 3, nMax: Math.max(3, o.nMax), bias: o.bias, pPub: 0.2 }, o.seed);
    const yi = studies.map(s => s.yi), vi = studies.map(s => s.vi);
    const re = Meta.pool(yi, vi, { method: o.method, knha: o.knha });
    const fe = Meta.pool(yi, vi, { method: 'FE' });
    const eg = Meta.egger(yi, vi);
    Object.assign(ML, { o, mu, studies, re, fe, eg });
    mlReadout();
    mlForest();
    mlFunnel();
    mlReading();
  }
  function mlReadout() {
    const { re, fe, eg, mu } = ML;
    statTiles('mlReadout', [
      [T('Efecto combinado', 'Pooled effect'), fmtPctChange(re.est), `IC 95 %: ${fmtPctChange(re.ci[0])} a ${fmtPctChange(re.ci[1])}`.replace('IC', T('IC', 'CI')).replace(' a ', T(' a ', ' to '))],
      [T('La verdad del laboratorio', 'The laboratory\'s truth'), fmtPctChange(mu), T('efecto medio con que se generaron', 'mean effect they were drawn from')],
      [T('Efecto común (fijo)', 'Common (fixed) effect'), fmtPctChange(fe.est), T('ignora la heterogeneidad', 'ignores heterogeneity')],
      ['τ² · I²', `${fmtFixed(re.tau2, 4)} · ${fmtPct(re.I2, 0)}`, `Q = ${fmtFixed(re.Q, 1)} (${re.df} gl), p ${re.pQ < 0.001 ? '< 0.001' : '= ' + fmtFixed(re.pQ, 3)}`.replace('gl', T('gl', 'df')), re.I2 > 0.75 ? 'warn' : ''],
      [T('Intervalo de predicción', 'Prediction interval'), re.pi ? `${fmtPctChange(re.pi[0])} … ${fmtPctChange(re.pi[1])}` : '—', T('dónde caería un estudio nuevo', 'where a new study would fall')],
      [T('Asimetría (Egger)', 'Asymmetry (Egger)'), eg ? `p = ${fmtFixed(eg.p, 3)}` : '—', eg ? T(`intercepto ${fmtFixed(eg.intercept, 2)}`, `intercept ${fmtFixed(eg.intercept, 2)}`) : T('se necesitan ≥ 3 estudios', 'needs ≥ 3 studies'), eg && eg.p < 0.1 ? 'warn' : ''],
    ]);
  }
  /* ticks for a log-ratio axis labelled as % change */
  function pctTicks(lo, hi) {
    const cand = [-75, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 75, 100, 150, 200, 300];
    let t = cand.map(p => Math.log(1 + p / 100)).filter(v => v >= lo && v <= hi);
    while (t.length > 8) t = t.filter((_, i) => i % 2 === 0 || Math.abs(t[i]) < 1e-12);
    return t;
  }
  function mlForest() {
    const svg = el('mlForest');
    const { studies, re, fe, mu } = ML;
    const k = studies.length;
    Plot.clear(svg);
    const W = 640, rowH = 15, top = 44, H = top + k * rowH + 86;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const x0 = 150, x1 = 450;
    const lo = Math.min(...studies.map(s => s.yi - 1.96 * Math.sqrt(s.vi)), re.pi ? re.pi[0] : re.ci[0], 0) - 0.03;
    const hi = Math.max(...studies.map(s => s.yi + 1.96 * Math.sqrt(s.vi)), re.pi ? re.pi[1] : re.ci[1], 0) + 0.03;
    const sx = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
    const T_ = (x, y, s, o) => svg.appendChild(svgEl('text', Object.assign({ x, y, 'font-size': 9.5, class: 'art-txt' }, o || {}), s));
    T_(8, 16, T('Ensayo', 'Trial'), { 'font-weight': 700 });
    T_(x0 + (x1 - x0) / 2, 16, T('cambio en el rendimiento', 'change in yield'), { 'font-weight': 700, 'text-anchor': 'middle' });
    T_(W - 92, 16, T('% [IC 95 %]', '% [95 % CI]'), { 'font-weight': 700, 'text-anchor': 'end' });
    T_(W - 8, 16, T('peso', 'weight'), { 'font-weight': 700, 'text-anchor': 'end' });
    const yEnd = top + k * rowH + 58;
    svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(0), y1: top - 6, y2: yEnd, stroke: C('text-muted'), 'stroke-width': 1 }));
    svg.appendChild(svgEl('line', { x1: sx(mu), x2: sx(mu), y1: top - 6, y2: yEnd, stroke: C('c3'), 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }));
    const wmax = Math.max(...re.weights);
    studies.forEach((s, i) => {
      const y = top + i * rowH + rowH / 2, se = Math.sqrt(s.vi);
      const a = s.yi - 1.96 * se, b = s.yi + 1.96 * se;
      T_(8, y + 3, T(`Ensayo ${s.id} (n = ${s.n1}+${s.n2})`, `Trial ${s.id} (n = ${s.n1}+${s.n2})`), { class: 'art-mut', 'font-size': 9 });
      svg.appendChild(svgEl('line', { x1: sx(Math.max(a, lo)), x2: sx(Math.min(b, hi)), y1: y, y2: y, stroke: C('text-muted'), 'stroke-width': 1.1 }));
      const z = 3 + 7 * Math.sqrt(re.weights[i] / wmax);
      svg.appendChild(svgEl('rect', { x: sx(s.yi) - z / 2, y: y - z / 2, width: z, height: z, fill: C('c1') }));
      T_(W - 92, y + 3, `${fmtPctChange(s.yi)} [${fmtFixed(pctOf(a), 0)}, ${fmtFixed(pctOf(b), 0)}]`, { 'text-anchor': 'end', 'font-size': 9, class: 'art-mut' });
      T_(W - 8, y + 3, fmtFixed(re.weights[i], 1) + ' %', { 'text-anchor': 'end', 'font-size': 9, class: 'art-mut' });
    });
    const yd = top + k * rowH + 12;
    const dia = (y, m, l, u, fill, label) => {
      svg.appendChild(svgEl('path', { d: `M${sx(l)} ${y} L${sx(m)} ${y - 5.5} L${sx(u)} ${y} L${sx(m)} ${y + 5.5} Z`, fill }));
      T_(8, y + 3, label, { 'font-weight': 700, 'font-size': 9 });
      T_(W - 92, y + 3, `${fmtPctChange(m)} [${fmtFixed(pctOf(l), 0)}, ${fmtFixed(pctOf(u), 0)}]`, { 'text-anchor': 'end', 'font-size': 9, 'font-weight': 700 });
    };
    dia(yd, fe.est, fe.ci[0], fe.ci[1], C('c8'), T('Efecto común', 'Common effect'));
    dia(yd + 16, re.est, re.ci[0], re.ci[1], C('c2'), T(`Efectos aleatorios (${re.method}${re.knha ? ', KH' : ''})`, `Random effects (${re.method}${re.knha ? ', KH' : ''})`));
    if (re.pi) {
      const y = yd + 32;
      svg.appendChild(svgEl('line', { x1: sx(re.pi[0]), x2: sx(re.pi[1]), y1: y, y2: y, stroke: C('c2'), 'stroke-width': 2.2, 'stroke-dasharray': '5 3' }));
      T_(8, y + 3, T('Intervalo de predicción', 'Prediction interval'), { 'font-size': 9, class: 'art-mut' });
    }
    const ya = yEnd + 4;
    svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: ya, y2: ya, stroke: C('border-strong'), 'stroke-width': 1 }));
    pctTicks(lo, hi).forEach(t => {
      svg.appendChild(svgEl('line', { x1: sx(t), x2: sx(t), y1: ya, y2: ya + 4, stroke: C('border-strong') }));
      T_(sx(t), ya + 14, (pctOf(t) > 0 ? '+' : '') + fmtFixed(pctOf(t), 0) + '%', { 'text-anchor': 'middle', 'font-size': 8.5, class: 'art-mut' });
    });
    T_(sx(mu), top - 9, T("verdad", "truth"), { "font-size": 8.5, fill: C("c3"), "text-anchor": "middle" });
  }
  function mlFunnel() {
    const svg = el('mlFunnel');
    const { studies, fe, eg } = ML;
    const ses = studies.map(s => Math.sqrt(s.vi));
    const smax = Math.max(...ses) * 1.08;
    const span = Math.max(1.96 * smax, ...studies.map(s => Math.abs(s.yi - fe.est))) * 1.05;
    const fig = Plot.frame(svg, { W: 420, H: 300, m: { l: 50, r: 12, t: 20, b: 40 }, x: [fe.est - span, fe.est + span], y: [-smax, 0],
      xlab: T('ln(razón de respuesta)', 'ln(response ratio)'), ylab: T('error estándar', 'standard error'),
      yt: Plot.niceTicks(0, smax, 5).map(t => -t), ylabFmt: t => Plot.tickLabel(Math.abs(t)) });
    /* the standard error grows downwards, as funnels are drawn: y = −SE */
    dline(fig, [[fe.est - 1.96 * smax, -smax], [fe.est, 0], [fe.est + 1.96 * smax, -smax]], C('text-muted'), { width: 1, dash: '4 3' });
    dline(fig, [[fe.est, 0], [fe.est, -smax]], C('c8'), { width: 1.2 });
    dline(fig, [[0, 0], [0, -smax]], C('text-muted'), { width: 0.8, dash: '1 3' });
    Plot.dots(fig, studies.map((s, i) => [s.yi, -ses[i]]), C('c1'), 3.4, { stroke: C('card-bg') });
    if (eg) {
      /* Egger's line back on the funnel's axes: y/se = a + b/se  ⇒  y = a·se + b */
      const pts = [0.001, smax].map(s => [eg.intercept * s + eg.slope, -s]);
      dline(fig, pts, C('c4'), { width: 1.4, dash: '6 3' });
    }
    Plot.legend(fig, [[T('ensayos', 'trials'), C('c1'), 'sq'], [T('embudo al 95 %', '95 % funnel'), C('text-muted'), 'dash'], ['Egger', C('c4'), 'dash']], 10);
  }
  function mlReading() {
    const { re, fe, eg, mu, o, studies } = ML;
    const box = el('mlReading'); if (!box) return;
    const parts = [];
    const I = re.I2;
    const hetEs = I < 0.25 ? 'baja' : I < 0.5 ? 'moderada' : I < 0.75 ? 'sustancial' : 'considerable';
    const hetEn = I < 0.25 ? 'low' : I < 0.5 ? 'moderate' : I < 0.75 ? 'substantial' : 'considerable';
    parts.push(L2(`Con <b>${studies.length} ensayos</b>, el modelo de efectos aleatorios estima un cambio medio de <b>${fmtPctChange(re.est)}</b> (IC 95 %: ${fmtPctChange(re.ci[0])} a ${fmtPctChange(re.ci[1])}); la verdad del laboratorio es ${fmtPctChange(mu)}.`,
      `With <b>${studies.length} trials</b>, the random-effects model estimates a mean change of <b>${fmtPctChange(re.est)}</b> (95 % CI: ${fmtPctChange(re.ci[0])} to ${fmtPctChange(re.ci[1])}); the laboratory's truth is ${fmtPctChange(mu)}.`));
    parts.push(L2(`La heterogeneidad es <b>${hetEs}</b> (I² = ${fmtPct(I, 0)}): ${I < 0.25 ? 'los ensayos cuentan casi la misma historia.' : 'los ensayos no estiman el mismo efecto, y el promedio solo resume una distribución de efectos.'}`,
      `Heterogeneity is <b>${hetEn}</b> (I² = ${fmtPct(I, 0)}): ${I < 0.25 ? 'the trials tell almost the same story.' : 'the trials do not estimate the same effect, and the mean only summarizes a distribution of effects.'}`));
    if (re.pi) parts.push(L2(`El <b>intervalo de predicción</b> (${fmtPctChange(re.pi[0])} a ${fmtPctChange(re.pi[1])}) dice dónde caería el efecto verdadero en un campo nuevo; ${re.pi[0] < 0 && re.est > 0 ? 'incluye pérdidas: en algunos sitios el insumo no pagaría.' : 'no cruza el cero.'}`,
      `The <b>prediction interval</b> (${fmtPctChange(re.pi[0])} to ${fmtPctChange(re.pi[1])}) says where the true effect in a new field would fall; ${re.pi[0] < 0 && re.est > 0 ? 'it includes losses: at some sites the input would not pay.' : 'it does not cross zero.'}`));
    if (o.bias) parts.push(L2(`<b>Sesgo de publicación activado:</b> los ensayos pequeños sin resultado significativo solo llegaron a la literatura una de cada cinco veces. Mira el embudo: falta la esquina inferior izquierda, y el promedio ${re.est > mu ? 'sobreestima' : 'no sobreestima'} la verdad. ${eg && eg.p < 0.1 ? `Egger lo detecta (p = ${fmtFixed(eg.p, 3)}).` : 'Egger no lo detecta: la prueba tiene poca potencia, sobre todo cuando los ensayos tienen tamaños parecidos.'}`,
      `<b>Publication bias on:</b> small trials without a significant result reached the literature only one time in five. Look at the funnel: the lower-left corner is missing, and the mean ${re.est > mu ? 'overestimates' : 'does not overestimate'} the truth. ${eg && eg.p < 0.1 ? `Egger detects it (p = ${fmtFixed(eg.p, 3)}).` : 'Egger does not detect it: the test has little power, above all when the trials are of similar size.'}`));
    else if (Math.abs(re.est - fe.est) > 0.02) parts.push(L2(`El <b>efecto común</b> (${fmtPctChange(fe.est)}) se aleja del aleatorio porque da casi todo el peso a los ensayos grandes; con heterogeneidad, esa precisión es ficticia.`,
      `The <b>common effect</b> (${fmtPctChange(fe.est)}) departs from the random one because it gives almost all the weight to the large trials; with heterogeneity, that precision is fictitious.`));
    box.innerHTML = parts.map(p => `<p>${p}</p>`).join('');
  }

  /* ======================================================================
     wiring
     ====================================================================== */
  function wire() {
    if (!el('slN')) return;
    const slGo = debounce(slRun, 180);
    Plot.bindSlider('slPrev', v => v + ' %', slGo);
    Plot.bindSlider('slDiff', v => [T('fácil', 'easy'), T('media', 'medium'), T('difícil', 'hard')][Math.round(v * 2)] || fmtFixed(v, 2), slGo);
    ['slN', 'slBatch', 'slStop', 'slSeed'].forEach(id => el(id).addEventListener('change', slGo));
    el('slNew').addEventListener('click', () => { el('slSeed').value = 1 + Math.floor(Math.random() * 99999); slRun(); });
    const mlGo = debounce(mlRun, 60);
    Plot.bindSlider('mlK', v => String(v), mlGo);
    Plot.bindSlider('mlEff', v => (v >= 0 ? '+' : '−') + Math.abs(v) + ' %', mlGo);
    Plot.bindSlider('mlTau', v => fmtFixed(v, 2) + T(' (≈ ±', ' (≈ ±') + fmtFixed(pctOf(1.96 * v), 0) + ' %)', mlGo);
    Plot.bindSlider('mlN', v => T(`3 a ${v}`, `3 to ${v}`), mlGo);
    ['mlBias', 'mlMethod', 'mlKnha', 'mlSeed'].forEach(id => el(id).addEventListener('change', mlGo));
    el('mlNew').addEventListener('click', () => { el('mlSeed').value = 1 + Math.floor(Math.random() * 99999); mlRun(); });
    els('.lab-tab').forEach(b => b.addEventListener('click', () => {
      els('.lab-tab').forEach(x => x.classList.toggle('on', x === b));
      els('.lab').forEach(l => l.classList.toggle('on', l.id === b.dataset.lab));
    }));
    /* a link to #labMeta or #labScreen opens that laboratory */
    const tab = document.querySelector(`.lab-tab[data-lab="${(location.hash || '').slice(1)}"]`);
    if (tab) { tab.click(); setTimeout(() => el('labs').scrollIntoView(), 50); }
    if (/[?&]bias=1/.test(location.search)) { el('mlBias').checked = true; el('mlK').value = 30; el('mlK').dispatchEvent(new Event('input')); }
    document.addEventListener('langchange', () => { ['slDiff', 'mlTau', 'mlN', 'mlEff'].forEach(id => el(id).dispatchEvent(new Event('input'))); });
    slRun();
    mlRun();
  }
  document.addEventListener('DOMContentLoaded', wire);
  window.Labs = { SL, ML, slRun, mlRun, prismaDiagram };
})();
