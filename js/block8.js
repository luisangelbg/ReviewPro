/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 8: synthesis and meta-analysis, on screen.

   The data are the final effects table of Block 6, one outcome at a time.
   Two ways of handling studies with several effects: the three-level model
   (default) and the average within each study with a chosen correlation ρ.
   Everything else —moderators, sensitivity, publication bias— follows the
   chosen model, and the other one is always reported as a sensitivity
   analysis. Reviews that do not pool get vote counting, a concept matrix and
   an evidence gap map. */

(function () {

  const two = p => L2(p[0], p[1]);
  const SY = () => state.synthesis;
  const P = () => state.protocol || Protocol.blank('systematic');
  const C = n => `var(--${n})`;

  function ensure() {
    if (!state.synthesis || typeof state.synthesis !== 'object') state.synthesis = {};
    const s = state.synthesis;
    const def = { outcome: '', model: 'multi', rho: 0.5, test: 't', estimator: P().synthesis.estimator || 'REML', subMod: '', regMods: [], matrixField: '', gapA: '', gapB: '' };
    Object.keys(def).forEach(k => { if (s[k] === undefined) s[k] = def[k]; });
    return s;
  }

  /* ---------------- data ---------------- */
  function outcomes() { return window.Block6 ? [...new Set(Block6.effectRows().filter(r => r.ok).map(r => r.outcome || '—'))] : []; }
  function data(outcome, filter) {
    const rows = (window.Block6 ? Block6.effectRows() : []).filter(r => r.ok && (r.outcome || '—') === outcome && (!filter || filter(r)));
    return {
      rows, y: rows.map(r => r.yi), v: rows.map(r => r.vi), study: rows.map(r => r.studyId),
      label: rows.map(r => r.study + (r.comparison ? ` · ${r.comparison}` : '')), metric: rows.length ? rows[0].metric : 'ROM',
      mods: rows.map(r => r.mods || {}), rob: rows.map(r => (window.Block7 ? Block7.finalOf(r.studyId).overall : null)), imputed: rows.map(r => r.imputed),
    };
  }
  const subset = (d, keep) => { const idx = d.y.map((_, i) => i).filter(keep); return { rows: idx.map(i => d.rows[i]), y: idx.map(i => d.y[i]), v: idx.map(i => d.v[i]), study: idx.map(i => d.study[i]), label: idx.map(i => d.label[i]), metric: d.metric, mods: idx.map(i => d.mods[i]), rob: idx.map(i => d.rob[i]), imputed: idx.map(i => d.imputed[i]) }; };

  /* the model, in the two flavours, with one result shape */
  function run(d, cfg) {
    const c = Object.assign({}, SY(), cfg || {});
    if (!d.y.length) return null;
    if (c.model === 'avg') {
      const ag = Synth.aggregate(d.y, d.v, d.study, +c.rho);
      if (ag.length < 2) return null;
      const r = Meta.pool(ag.map(a => a.y), ag.map(a => a.v), { method: c.estimator, knha: c.test === 't' });
      return { model: 'avg', est: r.est, se: r.se, ci: r.ci, p: r.p, pi: r.pi, tau2: r.tau2, s2b: r.tau2, s2w: null, I2: { total: r.I2 }, k: d.y.length, m: ag.length, Q: r.Q, pQ: r.pQ, weights: r.weights, agg: ag, raw: r };
    }
    const f = Synth.fit({ y: d.y, v: d.v, study: d.study }, { levels: 3, test: c.test });
    if (!f) return null;
    const c0 = f.coef[0];
    return { model: f.levels === 3 ? 'multi' : 'multi2', est: c0.b, se: c0.se, ci: c0.ci, p: c0.p, pi: f.pi, tau2: f.tau2, s2b: f.s2b, s2w: f.levels === 3 ? f.s2w : null, I2: f.I2, k: f.n, m: f.m, df: f.df, fit: f };
  }
  const back = (m, y) => (m === 'ROM' ? (Math.exp(y) - 1) * 100 : ['RR', 'OR'].includes(m) ? Math.exp(y) : y);
  const fmtE = (m, y) => (m === 'ROM' ? `${back(m, y) >= 0 ? '+' : '−'}${fmtFixed(Math.abs(back(m, y)), 1)} %` : fmtFixed(back(m, y), m === 'RR' || m === 'OR' ? 2 : 3));
  const pTxt = p => (p < 0.001 ? '< 0.001' : '= ' + fmtFixed(p, 3));

  /* ---------------- figures ---------------- */
  function pctTicks(lo, hi, metric) {
    if (metric !== 'ROM') return Plot.niceTicks(lo, hi, 6);
    /* regular percent steps, from fine to coarse: the first set with 3 to 7 marks in range whose
       marks are not crowded on the log scale wins, so the axis keeps its zero and even spacing */
    const sets = [[-15, -10, -5, 0, 5, 10, 15, 20, 25, 30], [-40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60], [-50, -25, 0, 25, 50, 100, 200], [-75, -50, 0, 100, 200, 400]];
    const gap = (hi - lo) * 0.07;
    const inRange = s => s.map(p => Math.log(1 + p / 100)).filter(v => v >= lo && v <= hi);
    const spaced = t => t.every((v, i) => i === 0 || v - t[i - 1] >= gap);
    for (const s of sets) { const t = inRange(s); if (t.length >= 3 && t.length <= 7 && spaced(t)) return t; }
    const kept = []; inRange(sets[sets.length - 1]).forEach(v => { if (!kept.length || v - kept[kept.length - 1] >= gap) kept.push(v); });
    return kept.length >= 2 ? kept : Plot.niceTicks(lo, hi, 5);
  }
  /* forest: rows [{label, y, v, w}], summary rows [{label, est, ci, color}], pi */
  function drawForest(svg, rows, sums, pi, metric) {
    Plot.clear(svg);
    const W = 720, rowH = 15, top = 30, n = rows.length, H = top + n * rowH + sums.length * 17 + (pi ? 18 : 0) + 44;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const x0 = 230, x1 = 500;
    const all = rows.map(r => [r.y - 1.96 * Math.sqrt(r.v), r.y + 1.96 * Math.sqrt(r.v)]).flat().concat(sums.map(s => s.ci).flat(), pi || [], [0]);
    let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    const sx = v => x0 + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (x1 - x0);
    const T_ = (x, y, s, o) => svg.appendChild(svgEl('text', Object.assign({ x, y, 'font-size': 9, class: 'art-txt' }, o || {}), s));
    T_(8, 16, T('Estudio · comparación', 'Study · comparison'), { 'font-weight': 700 });
    T_(W - 70, 16, metric === 'ROM' ? T('% [IC 95 %]', '% [95 % CI]') : T('Efecto [IC 95 %]', 'Effect [95 % CI]'), { 'font-weight': 700, 'text-anchor': 'end' });
    T_(W - 8, 16, T('peso', 'weight'), { 'font-weight': 700, 'text-anchor': 'end' });
    const yEnd = top + n * rowH + sums.length * 17 + (pi ? 18 : 0) + 4;
    svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(0), y1: top - 6, y2: yEnd, stroke: C('text-muted'), 'stroke-width': 1 }));
    const wmax = Math.max(...rows.map(r => r.w || 1));
    rows.forEach((r, i) => {
      const y = top + i * rowH + rowH / 2, se = Math.sqrt(r.v), a = r.y - 1.96 * se, b = r.y + 1.96 * se;
      T_(8, y + 3, r.label.length > 44 ? r.label.slice(0, 43) + '…' : r.label, { class: 'art-mut' });
      svg.appendChild(svgEl('line', { x1: sx(a), x2: sx(b), y1: y, y2: y, stroke: C('text-muted'), 'stroke-width': 1.1 }));
      const z = 3 + 7 * Math.sqrt((r.w || 1) / wmax);
      svg.appendChild(svgEl('rect', { x: sx(r.y) - z / 2, y: y - z / 2, width: z, height: z, fill: r.color || C('c1') }));
      T_(W - 70, y + 3, `${fmtE(metric, r.y)} [${fmtE(metric, a)}, ${fmtE(metric, b)}]`, { 'text-anchor': 'end', class: 'art-mut', 'font-size': 8.5 });
      if (r.w != null) T_(W - 8, y + 3, fmtFixed(r.w, 1) + ' %', { 'text-anchor': 'end', class: 'art-mut', 'font-size': 8.5 });
    });
    let y = top + n * rowH + 12;
    sums.forEach(s => {
      svg.appendChild(svgEl('path', { d: `M${sx(s.ci[0])} ${y} L${sx(s.est)} ${y - 5.5} L${sx(s.ci[1])} ${y} L${sx(s.est)} ${y + 5.5} Z`, fill: s.color || C('c2') }));
      T_(8, y + 3, s.label, { 'font-weight': 700 });
      T_(W - 70, y + 3, `${fmtE(metric, s.est)} [${fmtE(metric, s.ci[0])}, ${fmtE(metric, s.ci[1])}]`, { 'text-anchor': 'end', 'font-weight': 700, 'font-size': 8.5 });
      y += 17;
    });
    if (pi) { svg.appendChild(svgEl('line', { x1: sx(pi[0]), x2: sx(pi[1]), y1: y - 4, y2: y - 4, stroke: C('c2'), 'stroke-width': 2.2, 'stroke-dasharray': '5 3' })); T_(8, y, T('Intervalo de predicción', 'Prediction interval'), { class: 'art-mut' }); y += 18; }
    svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: yEnd + 4, y2: yEnd + 4, stroke: C('border-strong') }));
    pctTicks(lo, hi, metric).forEach(t => {
      svg.appendChild(svgEl('line', { x1: sx(t), x2: sx(t), y1: yEnd + 4, y2: yEnd + 8, stroke: C('border-strong') }));
      T_(sx(t), yEnd + 18, metric === 'ROM' ? `${back(metric, t) > 0 ? '+' : ''}${fmtFixed(back(metric, t), 0)}%` : Plot.tickLabel(t), { 'text-anchor': 'middle', class: 'art-mut', 'font-size': 8.5 });
    });
  }
  function drawScatter(svg, pts, o) {
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const f = Plot.frame(svg, { W: 460, H: 300, m: { l: 52, r: 14, t: 18, b: 40 }, x: o.x || [Math.min(...xs), Math.max(...xs)], y: o.y || [Math.min(...ys), Math.max(...ys)], xlab: o.xlab, ylab: o.ylab, yt: o.yt, ylabFmt: o.ylabFmt });
    return f;
  }
  const dline = (f, pts, colour, o) => Plot.line(f, pts.map(([x, y]) => [f.sx(x), f.sy(y)]), colour, o);

  /* ---------------- 1–2 · model and result ---------------- */
  let cache = {};
  function renderMain() {
    const s = SY(), outs = outcomes();
    const sel = el('b8Outcome');
    if (sel) sel.innerHTML = outs.map(o => `<option${o === s.outcome ? ' selected' : ''}>${esc(o)}</option>`).join('');
    if (!outs.includes(s.outcome)) s.outcome = outs[0] || '';
    els('#b8Model button').forEach(b => b.classList.toggle('on', b.dataset.model === s.model));
    el('b8RhoRow').style.display = s.model === 'avg' ? '' : 'none';
    el('b8Rho').value = s.rho; el('b8RhoVal').textContent = fmtFixed(+s.rho, 2);
    el('b8Test').value = s.test; el('b8Est').value = s.estimator; el('b8EstRow').style.display = s.model === 'avg' ? '' : 'none';
    const d = data(s.outcome);
    const res = run(d);
    cache = { d, res };
    const box = el('b8Result');
    if (!res) {
      statTiles('b8Tiles', [[T('Efectos', 'Effects'), fmtNum(d.y.length), T('se necesitan al menos dos estudios', 'at least two studies are needed')]]);
      box.innerHTML = `<p class="hint">${L2('No hay datos suficientes para este desenlace. Extrae los efectos en el Bloque 6.', 'There are not enough data for this outcome. Extract the effects in Block 6.')}</p>`;
      Plot.empty(el('b8Forest'), 720, 120, T('Sin datos.', 'No data.'));
      return;
    }
    const m = d.metric;
    statTiles('b8Tiles', [
      [T('Efecto combinado', 'Pooled effect'), fmtE(m, res.est), `IC 95 %: ${fmtE(m, res.ci[0])} ${T('a', 'to')} ${fmtE(m, res.ci[1])}`.replace('IC', T('IC', 'CI')), 'ok'],
      [T('Datos', 'Data'), `${res.k} / ${res.m}`, T('efectos / estudios', 'effects / studies')],
      [T('Intervalo de predicción', 'Prediction interval'), res.pi ? `${fmtE(m, res.pi[0])} … ${fmtE(m, res.pi[1])}` : '—', T('un sitio o estudio nuevo', 'a new site or study')],
      res.model === 'multi' ? ['σ² ' + T('entre · dentro', 'between · within'), `${fmtFixed(res.s2b, 4)} · ${fmtFixed(res.s2w, 4)}`, `I² ${fmtPct(res.I2.total, 0)} (${fmtPct(res.I2.between, 0)} + ${fmtPct(res.I2.within, 0)})`, res.I2.total > 0.75 ? 'warn' : '']
        : ['τ² · I²', `${fmtFixed(res.tau2, 4)} · ${fmtPct(res.I2.total, 0)}`, res.Q != null ? `Q = ${fmtFixed(res.Q, 1)}, p ${pTxt(res.pQ)}` : '', res.I2.total > 0.75 ? 'warn' : ''],
      [T('Prueba del efecto', 'Test of the effect'), `p ${pTxt(res.p)}`, res.df && res.df !== Infinity ? `t, ${res.df} ${T('gl', 'df')}` : res.model === 'avg' && SY().test === 't' ? 'Knapp–Hartung' : 'z'],
    ]);
    /* reading */
    const parts = [];
    /* a plain [es, en] pair: an L2() inside another L2() would print both languages */
    const modelTxt = res.model === 'multi' ? ['modelo multinivel de tres niveles (efectos dentro de estudios)', 'three-level multilevel model (effects within studies)'] : res.model === 'multi2' ? ['modelo de efectos aleatorios (un efecto por estudio: no hace falta un tercer nivel)', 'random-effects model (one effect per study: no third level is needed)'] : [`promedio de los efectos dentro de cada estudio (ρ = ${fmtFixed(+SY().rho, 2)}) y modelo de efectos aleatorios`, `average of the effects within each study (ρ = ${fmtFixed(+SY().rho, 2)}) and random-effects model`];
    parts.push(L2(`Con ${res.k} efectos de ${res.m} estudios y un ${modelTxt[0]}, el efecto combinado sobre «${esc(s.outcome)}» es <b>${fmtE(m, res.est)}</b> (IC 95 % ${fmtE(m, res.ci[0])} a ${fmtE(m, res.ci[1])}; p ${pTxt(res.p)}).`, `With ${res.k} effects from ${res.m} studies and a ${modelTxt[1]}, the pooled effect on "${esc(s.outcome)}" is <b>${fmtE(m, res.est)}</b> (95 % CI ${fmtE(m, res.ci[0])} to ${fmtE(m, res.ci[1])}; p ${pTxt(res.p)}).`));
    if (res.pi) parts.push(L2(`El intervalo de predicción (${fmtE(m, res.pi[0])} a ${fmtE(m, res.pi[1])}) dice dónde caería el efecto en un sitio nuevo${res.pi[0] < 0 && res.est > 0 ? ': incluye pérdidas, así que el efecto no está garantizado en todas partes' : ''}.`, `The prediction interval (${fmtE(m, res.pi[0])} to ${fmtE(m, res.pi[1])}) says where the effect at a new site would fall${res.pi[0] < 0 && res.est > 0 ? ': it includes losses, so the effect is not guaranteed everywhere' : ''}.`));
    if (res.model === 'multi') {
      const l = Synth.lrtWithin({ y: d.y, v: d.v, study: d.study }, { test: s.test });
      if (l) parts.push(L2(`De la heterogeneidad, ${fmtPct(res.I2.between, 0)} está entre estudios y ${fmtPct(res.I2.within, 0)} entre efectos del mismo estudio; el nivel dentro de estudios ${l.p < 0.05 ? 'es necesario' : 'no mejora significativamente el ajuste'} (LR = ${fmtFixed(l.LR, 2)}, p ${pTxt(l.p)}).`, `Of the heterogeneity, ${fmtPct(res.I2.between, 0)} lies between studies and ${fmtPct(res.I2.within, 0)} between effects of the same study; the within-study level ${l.p < 0.05 ? 'is needed' : 'does not improve the fit significantly'} (LR = ${fmtFixed(l.LR, 2)}, p ${pTxt(l.p)}).`));
    }
    box.innerHTML = parts.map(p => `<p>${p}</p>`).join('');
    /* forest: effect rows (multilevel) or study averages */
    let rows;
    if (res.model === 'avg') {
      const lab = new Map(d.study.map((sid, i) => [sid, d.rows[i].study]));
      rows = res.agg.map((a, i) => ({ label: `${lab.get(a.study)}${a.m > 1 ? ` (${a.m})` : ''}`, y: a.y, v: a.v, w: res.weights[i] }));
    } else {
      const V = Synth.weights({ y: d.y, v: d.v, study: d.study }, res.fit), W = V.reduce((a, b) => a + b, 0);
      rows = d.y.map((y, i) => ({ label: d.label[i], y, v: d.v[i], w: 100 * V[i] / W }));
      rows.sort((a, b) => a.label.localeCompare(b.label));
    }
    drawForest(el('b8Forest'), rows, [{ label: T('Efecto combinado', 'Pooled effect'), est: res.est, ci: res.ci }], res.pi, m);
  }

  /* ---------------- 3 · moderators ---------------- */
  function modFields() {
    const fs = state.extraction ? state.extraction.fields : [];
    return fs.filter(f => ['number', 'select', 'yesno', 'text', 'multi'].includes(f.type)).map(f => ({ label: f.label, type: f.type === 'number' ? 'numeric' : 'categorical' }));
  }
  function renderMods() {
    const s = SY(), d = cache.d, fs = modFields();
    const ss = el('b8SubMod'); if (ss) ss.innerHTML = `<option value="">—</option>` + fs.filter(f => f.type === 'categorical').map(f => `<option${f.label === s.subMod ? ' selected' : ''}>${esc(f.label)}</option>`).join('');
    const rm = el('b8RegMods'); if (rm) rm.innerHTML = fs.map(f => `<label class="checkbox-label"><input type="checkbox" data-reg="${esc(f.label)}"${s.regMods.includes(f.label) ? ' checked' : ''}> ${esc(f.label)} <span class="muted">(${f.type === 'numeric' ? T('numérico', 'numeric') : T('categórico', 'categorical')})</span></label>`).join('');
    const sb = el('b8Sub'), rg = el('b8Reg');
    if (!d || !cache.res) { sb.innerHTML = rg.innerHTML = ''; Plot.empty(el('b8Bubble'), 460, 200, ''); return; }
    const opts = { levels: s.model === 'avg' ? 2 : 3, test: s.test };
    const base = s.model === 'avg' ? (() => { const ag = Synth.aggregate(d.y, d.v, d.study, +s.rho); return { y: ag.map(a => a.y), v: ag.map(a => a.v), study: ag.map(a => a.study), mods: ag.map(a => d.mods[a.idx[0]]) }; })() : { y: d.y, v: d.v, study: d.study, mods: d.mods };
    const val = (mods, lab) => { const v = mods[lab]; return v == null ? '' : String(v); };
    /* subgroups */
    if (s.subMod) {
      const keep = base.y.map((_, i) => val(base.mods[i], s.subMod) !== '').map((k, i) => (k ? i : -1)).filter(i => i >= 0);
      const bd = { y: keep.map(i => base.y[i]), v: keep.map(i => base.v[i]), study: keep.map(i => base.study[i]) };
      const values = keep.map(i => val(base.mods[i], s.subMod));
      const sg = keep.length >= 3 ? Synth.subgroups(bd, values, opts) : null;
      if (sg && sg.per.length > 1) {
        const m = d.metric;
        sb.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${esc(s.subMod)}</th><th class="num">${L2('Efectos / estudios', 'Effects / studies')}</th><th>${L2('Efecto [IC 95 %]', 'Effect [95 % CI]')}</th><th>I²</th></tr></thead><tbody>${sg.per.map(p => `<tr><td>${esc(p.level)}</td><td class="num">${p.n} / ${p.m}</td><td>${p.fit ? `${fmtE(m, p.fit.coef[0].b)} [${fmtE(m, p.fit.coef[0].ci[0])}, ${fmtE(m, p.fit.coef[0].ci[1])}]` : L2('un solo efecto', 'a single effect')}</td><td>${p.fit ? fmtPct(p.fit.I2.total, 0) : '—'}</td></tr>`).join('')}</tbody></table></div>
          <p class="hint">${sg.test ? L2(`Prueba de diferencias entre subgrupos: ${sg.test.QM != null ? `Q<sub>M</sub> = ${fmtFixed(sg.test.QM, 2)}, ${sg.test.df} gl` : `F = ${fmtFixed(sg.test.F, 2)} (${sg.test.df1}, ${sg.test.df2})`}, p ${pTxt(sg.test.p)}.${sg.per.some(p => p.m < 3) ? ' Hay subgrupos con menos de tres estudios: interprétalos con cautela.' : ''}`, `Test of subgroup differences: ${sg.test.QM != null ? `Q<sub>M</sub> = ${fmtFixed(sg.test.QM, 2)}, ${sg.test.df} df` : `F = ${fmtFixed(sg.test.F, 2)} (${sg.test.df1}, ${sg.test.df2})`}, p ${pTxt(sg.test.p)}.${sg.per.some(p => p.m < 3) ? ' Some subgroups have fewer than three studies: interpret them with caution.' : ''}`) : ''}</p>`;
      } else sb.innerHTML = `<p class="hint">${L2('Hacen falta al menos dos subgrupos con datos.', 'At least two subgroups with data are needed.')}</p>`;
    } else sb.innerHTML = '';
    /* meta-regression */
    if (s.regMods.length) {
      const fsel = fs.filter(f => s.regMods.includes(f.label));
      const keep = base.y.map((_, i) => fsel.every(f => { const v = val(base.mods[i], f.label); return v !== '' && (f.type !== 'numeric' || isFinite(+v)); })).map((k, i) => (k ? i : -1)).filter(i => i >= 0);
      const mods = fsel.map(f => ({ name: f.label, type: f.type, values: keep.map(i => (f.type === 'numeric' ? +val(base.mods[i], f.label) : val(base.mods[i], f.label))) }));
      const mr = keep.length >= mods.length + 3 ? Synth.metareg({ y: keep.map(i => base.y[i]), v: keep.map(i => base.v[i]), study: keep.map(i => base.study[i]) }, mods, opts) : null;
      if (mr) {
        rg.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Coeficiente', 'Coefficient')}</th><th class="num">b</th><th class="num">EE</th><th>${L2('IC 95 %', '95 % CI')}</th><th class="num">p</th></tr></thead><tbody>${mr.names.map((nm, i) => { const c = mr.fit.coef[i]; return `<tr><td>${nm === 'intrcpt' ? L2('intercepto', 'intercept') : esc(nm)}</td><td class="num">${fmtFixed(c.b, 4)}</td><td class="num">${fmtFixed(c.se, 4)}</td><td>[${fmtFixed(c.ci[0], 4)}, ${fmtFixed(c.ci[1], 4)}]</td><td class="num">${pTxt(c.p).replace('= ', '')}</td></tr>`; }).join('')}</tbody></table></div>
          <p class="hint">${L2(`${keep.length} efectos con datos de los moderadores. Prueba conjunta: ${mr.test.QM != null ? `Q<sub>M</sub> = ${fmtFixed(mr.test.QM, 2)}, ${mr.test.df} gl` : `F = ${fmtFixed(mr.test.F, 2)} (${mr.test.df1}, ${mr.test.df2})`}, p ${pTxt(mr.test.p)}; heterogeneidad explicada (pseudo-R²): ${fmtPct(mr.R2, 0)}.`, `${keep.length} effects with moderator data. Omnibus test: ${mr.test.QM != null ? `Q<sub>M</sub> = ${fmtFixed(mr.test.QM, 2)}, ${mr.test.df} df` : `F = ${fmtFixed(mr.test.F, 2)} (${mr.test.df1}, ${mr.test.df2})`}, p ${pTxt(mr.test.p)}; heterogeneity explained (pseudo-R²): ${fmtPct(mr.R2, 0)}.`)}</p>`;
        const num = fsel.findIndex(f => f.type === 'numeric');
        if (num >= 0 && fsel.length === 1) {
          const xs = mods[0].values, ys = keep.map(i => base.y[i]), vs = keep.map(i => base.v[i]);
          const pad = (Math.max(...xs) - Math.min(...xs)) * 0.05 || 1;
          const fr = drawScatter(el('b8Bubble'), xs.map((x, i) => ({ x, y: ys[i] })), { x: [Math.min(...xs) - pad, Math.max(...xs) + pad], y: [Math.min(...ys, 0) - 0.05, Math.max(...ys, 0) + 0.05], xlab: fsel[0].label, ylab: T('efecto', 'effect') });
          const wmax = Math.max(...vs.map(v => 1 / v));
          xs.forEach((x, i) => fr.plot.appendChild(svgEl('circle', { cx: fr.sx(x), cy: fr.sy(ys[i]), r: 2.5 + 8 * Math.sqrt((1 / vs[i]) / wmax), fill: C('c1'), opacity: 0.45, stroke: C('c1') })));
          const b0 = mr.fit.beta[0], b1 = mr.fit.beta[1], xa = Math.min(...xs), xb = Math.max(...xs);
          dline(fr, [[xa, b0 + b1 * xa], [xb, b0 + b1 * xb]], C('c2'), { width: 2 });
          Plot.hline(fr, 0, C('text-muted'), { dash: '2 3' });
        } else Plot.empty(el('b8Bubble'), 460, 200, T('El gráfico de burbujas aparece con un solo moderador numérico.', 'The bubble plot appears with a single numeric moderator.'));
      } else { rg.innerHTML = `<p class="hint">${L2('No hay suficientes efectos con datos de esos moderadores.', 'There are not enough effects with data for those moderators.')}</p>`; Plot.empty(el('b8Bubble'), 460, 200, ''); }
    } else { rg.innerHTML = ''; Plot.empty(el('b8Bubble'), 460, 200, T('Elige un moderador numérico para ver la meta-regresión.', 'Choose a numeric moderator to see the meta-regression.')); }
  }

  /* ---------------- 4 · sensitivity ---------------- */
  function renderSens() {
    const box = el('b8Sens'); if (!box) return;
    const d = cache.d, main = cache.res; if (!main) { box.innerHTML = ''; Plot.empty(el('b8Loo'), 460, 200, ''); return; }
    const m = d.metric, s = SY();
    const vars = [[T('Análisis principal', 'Main analysis'), main]];
    vars.push([s.model === 'avg' ? T('Modelo multinivel (tres niveles)', 'Multilevel model (three levels)') : T('Promedio por estudio, ρ = 0.5', 'Average per study, ρ = 0.5'), run(d, { model: s.model === 'avg' ? 'multi' : 'avg', rho: 0.5 })]);
    [0.2, 0.8].forEach(r => vars.push([T(`Promedio por estudio, ρ = ${r}`, `Average per study, ρ = ${r}`), run(d, { model: 'avg', rho: r })]));
    const hi = subset(d, i => !['high', 'serious', 'critical'].includes(d.rob[i]));
    if (hi.y.length < d.y.length) vars.push([T(`Sin estudios con riesgo de sesgo alto (quedan ${new Set(hi.study).size})`, `Without high risk-of-bias studies (${new Set(hi.study).size} left)`), run(hi)]);
    const imp = subset(d, i => !d.imputed[i]);
    if (imp.y.length < d.y.length) vars.push([T('Sin DE imputadas', 'Without imputed SDs'), run(imp)]);
    if (s.model === 'avg' && s.estimator !== 'DL') vars.push(['DerSimonian–Laird', run(d, { estimator: 'DL' })]);
    box.innerHTML = `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Análisis', 'Analysis')}</th><th class="num">${L2('Estudios', 'Studies')}</th><th>${L2('Efecto [IC 95 %]', 'Effect [95 % CI]')}</th><th class="num">p</th><th>${L2('Cambio frente al principal', 'Change from the main one')}</th></tr></thead><tbody>${vars.map(([lab, r], i) => r ? `<tr${i ? '' : ' class="b3-tot"'}><td>${esc(lab)}</td><td class="num">${r.m}</td><td>${fmtE(m, r.est)} [${fmtE(m, r.ci[0])}, ${fmtE(m, r.ci[1])}]</td><td class="num">${pTxt(r.p).replace('= ', '')}</td><td>${i ? `${Math.sign(r.est) !== Math.sign(main.est) ? L2('<b>cambia de signo</b>', '<b>changes sign</b>') : (r.ci[0] > 0 || r.ci[1] < 0) !== (main.ci[0] > 0 || main.ci[1] < 0) ? L2('<b>cambia la significancia</b>', '<b>significance changes</b>') : L2('se sostiene', 'holds')}` : ''}</td></tr>` : `<tr><td>${esc(lab)}</td><td colspan="4" class="muted">${L2('datos insuficientes', 'insufficient data')}</td></tr>`).join('')}</tbody></table></div>`;
    /* leave one study out */
    const ids = [...new Set(d.study)];
    const loo = ids.map(sid => { const r = run(subset(d, i => d.study[i] !== sid)); return { sid, label: d.rows[d.study.indexOf(sid)].study, r }; }).filter(x => x.r);
    const svg = el('b8Loo');
    if (loo.length < 2) { Plot.empty(svg, 460, 200, T('Hacen falta al menos tres estudios.', 'At least three studies are needed.')); el('b8LooNote').innerHTML = ''; return; }
    const lo = Math.min(...loo.map(x => x.r.ci[0]), main.ci[0]), hi2 = Math.max(...loo.map(x => x.r.ci[1]), main.ci[1]);
    const rowH = 14, H = 30 + loo.length * rowH + 30;
    Plot.clear(svg); svg.setAttribute('viewBox', `0 0 560 ${H}`);
    const sx = v => 200 + (v - lo) / ((hi2 - lo) || 1) * 330;
    svg.appendChild(svgEl('rect', { x: sx(main.ci[0]), y: 20, width: Math.max(1, sx(main.ci[1]) - sx(main.ci[0])), height: loo.length * rowH + 4, fill: C('c2'), opacity: 0.12 }));
    svg.appendChild(svgEl('line', { x1: sx(main.est), x2: sx(main.est), y1: 18, y2: 26 + loo.length * rowH, stroke: C('c2'), 'stroke-width': 1.4 }));
    svg.appendChild(svgEl('text', { x: 8, y: 14, 'font-size': 9, 'font-weight': 700, class: 'art-txt' }, T('Sin el estudio…', 'Without study…')));
    loo.forEach((x, i) => { const y = 28 + i * rowH; svg.appendChild(svgEl('text', { x: 8, y: y + 3, 'font-size': 8.5, class: 'art-mut' }, x.label)); svg.appendChild(svgEl('line', { x1: sx(x.r.ci[0]), x2: sx(x.r.ci[1]), y1: y, y2: y, stroke: C('text-muted') })); svg.appendChild(svgEl('circle', { cx: sx(x.r.est), cy: y, r: 3, fill: C('c1') })); });
    /* the value axis, in the units the reader thinks in (percent change for lnRR) */
    const yAx = 30 + loo.length * rowH;
    svg.appendChild(svgEl('line', { x1: 200, x2: 530, y1: yAx, y2: yAx, stroke: C('text-muted'), 'stroke-width': 0.8 }));
    pctTicks(lo, hi2, m).forEach(v => { svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: yAx, y2: yAx + 3, stroke: C('text-muted'), 'stroke-width': 0.8 })); svg.appendChild(svgEl('text', { x: sx(v), y: yAx + 13, 'font-size': 8, 'text-anchor': 'middle', class: 'art-mut' }, m === 'ROM' ? fmtE(m, v).replace(/\.0 %$/, ' %') : fmtE(m, v))); });
    const ext = loo.reduce((a, x) => (Math.abs(x.r.est - main.est) > Math.abs(a.r.est - main.est) ? x : a), loo[0]);
    el('b8LooNote').innerHTML = L2(`Al quitar un estudio a la vez, el efecto va de ${fmtE(m, Math.min(...loo.map(x => x.r.est)))} a ${fmtE(m, Math.max(...loo.map(x => x.r.est)))}; el más influyente es ${esc(ext.label)}.`, `Removing one study at a time, the effect ranges from ${fmtE(m, Math.min(...loo.map(x => x.r.est)))} to ${fmtE(m, Math.max(...loo.map(x => x.r.est)))}; the most influential is ${esc(ext.label)}.`);
  }

  /* ---------------- 5 · publication bias ---------------- */
  function renderBias() {
    const box = el('b8Bias'); if (!box) return;
    const d = cache.d, main = cache.res; if (!main) { box.innerHTML = ''; Plot.empty(el('b8Funnel'), 460, 200, ''); return; }
    const ag = Synth.aggregate(d.y, d.v, d.study, +SY().rho);
    const ya = ag.map(a => a.y), va = ag.map(a => a.v), k = ag.length, m = d.metric;
    const eg = k >= 3 ? Meta.egger(ya, va) : null;
    const egML = SY().model !== 'avg' && d.y.length >= 4 ? Synth.eggerML({ y: d.y, v: d.v, study: d.study }, { test: SY().test }) : null;
    const tf = k >= 3 ? Synth.trimfill(ya, va, { method: SY().estimator || 'REML' }) : null;
    const lines = [];
    /* the asymmetry tests regress the effect on its precision: they say nothing when the precisions hardly differ */
    const seMin = Math.min(...d.v.map(Math.sqrt)), seMax = Math.max(...d.v.map(Math.sqrt));
    if (seMax / seMin < 1.5) lines.push(L2(`<b>Las precisiones casi no varían</b> (el EE va de ${fmtFixed(seMin, 3)} a ${fmtFixed(seMax, 3)}): las pruebas de asimetría no son informativas, y con la razón de respuesta la varianza depende del propio efecto, lo que puede crear una pendiente espuria.`, `<b>The precisions hardly differ</b> (SE from ${fmtFixed(seMin, 3)} to ${fmtFixed(seMax, 3)}): the asymmetry tests are not informative, and with the response ratio the variance depends on the effect itself, which can create a spurious slope.`));
    if (k < 10) lines.push(L2(`<b>Solo ${k} estudios:</b> con menos de 10, las pruebas de asimetría tienen muy poca potencia; se muestran como referencia, no como conclusión.`, `<b>Only ${k} studies:</b> with fewer than 10, asymmetry tests have very little power; they are shown for reference, not as a conclusion.`));
    if (eg) lines.push(L2(`Egger (promedios por estudio): intercepto ${fmtFixed(eg.intercept, 3)}, p ${pTxt(eg.p)}.`, `Egger (study averages): intercept ${fmtFixed(eg.intercept, 3)}, p ${pTxt(eg.p)}.`));
    if (egML) lines.push(L2(`Egger multinivel (el EE como moderador): pendiente ${fmtFixed(egML.slope.b, 3)}, p ${pTxt(egML.slope.p)}.`, `Multilevel Egger (SE as a moderator): slope ${fmtFixed(egML.slope.b, 3)}, p ${pTxt(egML.slope.p)}.`));
    if (tf) lines.push(tf.k0 ? L2(`Recorte y relleno: se estiman <b>${tf.k0}</b> estudio(s) faltante(s) a la ${tf.side === 'left' ? 'izquierda' : 'derecha'}; el efecto ajustado sería ${fmtE(m, tf.adjusted.est)} [${fmtE(m, tf.adjusted.ci[0])}, ${fmtE(m, tf.adjusted.ci[1])}]. Es un análisis de sensibilidad, no una corrección.`, `Trim-and-fill: <b>${tf.k0}</b> missing study(ies) estimated on the ${tf.side}; the adjusted effect would be ${fmtE(m, tf.adjusted.est)} [${fmtE(m, tf.adjusted.ci[0])}, ${fmtE(m, tf.adjusted.ci[1])}]. It is a sensitivity analysis, not a correction.`) : L2('Recorte y relleno: no estima estudios faltantes.', 'Trim-and-fill: no missing studies estimated.'));
    box.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
    /* funnel on study averages, with the filled studies hollow */
    const ses = va.map(Math.sqrt), smax = Math.max(...ses, ...(tf ? tf.filled.map(f => Math.sqrt(f.v)) : [])) * 1.08;
    const center = main.est;
    const span = Math.max(1.96 * smax, ...ya.map(y => Math.abs(y - center)), ...(tf ? tf.filled.map(f => Math.abs(f.y - center)) : [])) * 1.05;
    const fr = Plot.frame(el('b8Funnel'), { W: 460, H: 300, m: { l: 52, r: 12, t: 20, b: 40 }, x: [center - span, center + span], y: [-smax, 0], xlab: T('efecto (promedio por estudio)', 'effect (study average)'), ylab: T('error estándar', 'standard error'), yt: Plot.niceTicks(0, smax, 5).map(t => -t), ylabFmt: t => Plot.tickLabel(Math.abs(t)) });
    dline(fr, [[center - 1.96 * smax, -smax], [center, 0], [center + 1.96 * smax, -smax]], C('text-muted'), { width: 1, dash: '4 3' });
    dline(fr, [[center, 0], [center, -smax]], C('c2'), { width: 1.2 });
    Plot.dots(fr, ya.map((y, i) => [y, -ses[i]]), C('c1'), 3.4, { stroke: C('card-bg') });
    if (tf && tf.filled.length) tf.filled.forEach(f => fr.plot.appendChild(svgEl('circle', { cx: fr.sx(f.y), cy: fr.sy(-Math.sqrt(f.v)), r: 3.4, fill: 'none', stroke: C('c4'), 'stroke-width': 1.4 })));
    Plot.legend(fr, [[T('estudios', 'studies'), C('c1'), 'sq']].concat(tf && tf.k0 ? [[T('rellenados', 'filled'), C('c4'), 'sq']] : []), 10);
  }

  /* ---------------- 6 · synthesis without pooling ---------------- */
  function renderNonQuant() {
    const s = SY();
    const vb = el('b8Vote');
    if (vb) {
      const outs = outcomes();
      vb.innerHTML = outs.length ? `<div class="table-scroll"><table class="b2-tbl"><thead><tr><th>${L2('Desenlace', 'Outcome')}</th><th class="num">${L2('A favor', 'Favourable')}</th><th class="num">${L2('En contra', 'Unfavourable')}</th><th class="num">${L2('Nulos', 'Null')}</th><th>${L2('Proporción a favor [IC 95 %]', 'Proportion favourable [95 % CI]')}</th><th class="num">p</th></tr></thead><tbody>${outs.map(o => {
        const d = data(o); const ag = Synth.aggregate(d.y, d.v, d.study, 0.5); const vt = Synth.vote(ag.map(a => a.y));
        return `<tr><td>${esc(o)}</td><td class="num">${vt.pos}</td><td class="num">${vt.neg}</td><td class="num">${vt.zero}</td><td>${vt.n ? `${fmtPct(vt.prop, 0)} [${fmtPct(vt.ci[0], 0)}, ${fmtPct(vt.ci[1], 0)}]` : '—'}</td><td class="num">${vt.n ? pTxt(vt.p).replace('= ', '') : '—'}</td></tr>`;
      }).join('')}</tbody></table></div><p class="hint">${L2('Un voto por estudio según la dirección de su efecto (promedio de sus efectos), con prueba de signos exacta. Es la síntesis permitida cuando los efectos no se pueden combinar; nunca cuentes votos de «significativo / no significativo».', 'One vote per study by the direction of its effect (average of its effects), with an exact sign test. It is the synthesis allowed when effects cannot be pooled; never count "significant / non-significant" votes.')}</p>` : `<p class="hint">${L2('Sin efectos extraídos.', 'No extracted effects.')}</p>`;
    }
    const fs = state.extraction ? state.extraction.fields.filter(f => ['select', 'multi', 'yesno', 'text'].includes(f.type)) : [];
    const opts = cur => `<option value="">—</option>` + fs.map(f => `<option${f.label === cur ? ' selected' : ''}>${esc(f.label)}</option>`).join('');
    ['b8MatField', 'b8GapA', 'b8GapB'].forEach((id, i) => { const n = el(id); if (n) n.innerHTML = opts([s.matrixField, s.gapA, s.gapB][i]); });
    const studies = window.Block6 ? Block6.studies() : [];
    const recs = studies.map(st => { const o = { id: st.id, label: st.label }; fs.forEach(f => { o[f.label] = Block6.finalValue(st.id, f).v; }); return o; });
    const mb = el('b8Matrix');
    if (mb) {
      if (!s.matrixField) mb.innerHTML = `<p class="hint">${L2('Elige un campo de lista (p. ej., prácticas o desenlaces medidos).', 'Choose a list field (e.g., practices or outcomes measured).')}</p>`;
      else {
        const ct = Synth.crosstab(recs, s.matrixField, null);
        mb.innerHTML = ct.as.length ? `<div class="table-scroll"><table class="b2-tbl b8-mat"><thead><tr><th>${L2('Estudio', 'Study')}</th>${ct.as.map(a => `<th class="c">${esc(a)}</th>`).join('')}</tr></thead><tbody>${recs.map(r => { const vals = (Array.isArray(r[s.matrixField]) ? r[s.matrixField] : [r[s.matrixField]]).map(String); return `<tr><td>${esc(r.label)}</td>${ct.as.map(a => `<td class="c">${vals.includes(a) ? '●' : ''}</td>`).join('')}</tr>`; }).join('')}<tr class="b3-tot"><td>${L2('Total', 'Total')}</td>${ct.as.map(a => `<td class="c">${ct.count(a, '·')}</td>`).join('')}</tr></tbody></table></div>` : `<p class="hint">${L2('Ese campo no tiene valores todavía.', 'That field has no values yet.')}</p>`;
      }
    }
    const svg = el('b8Gap');
    if (svg) {
      if (!s.gapA || !s.gapB) { Plot.empty(svg, 600, 160, T('Elige dos campos para el mapa de vacíos.', 'Choose two fields for the gap map.')); }
      else {
        const ct = Synth.crosstab(recs, s.gapA, s.gapB);
        const cw = 90, ch = 34, left = 170, top = 60;
        const W = left + ct.bs.length * cw + 20, H = top + ct.as.length * ch + 20;
        Plot.clear(svg); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        let mx = 1; ct.as.forEach(a => ct.bs.forEach(b => { mx = Math.max(mx, ct.count(a, b)); }));
        ct.bs.forEach((b, j) => svg.appendChild(svgEl('text', { x: left + j * cw + cw / 2, y: top - 10, 'font-size': 9, 'text-anchor': 'middle', class: 'art-txt', 'font-weight': 700 }, b.length > 16 ? b.slice(0, 15) + '…' : b)));
        ct.as.forEach((a, i) => {
          const y = top + i * ch + ch / 2;
          svg.appendChild(svgEl('text', { x: left - 10, y: y + 3, 'font-size': 9, 'text-anchor': 'end', class: 'art-txt' }, a.length > 28 ? a.slice(0, 27) + '…' : a));
          ct.bs.forEach((b, j) => {
            const x = left + j * cw + cw / 2, n = ct.count(a, b);
            svg.appendChild(svgEl('rect', { x: left + j * cw + 2, y: top + i * ch + 2, width: cw - 4, height: ch - 4, rx: 5, fill: n ? C('primary-soft') : 'none', stroke: C('border') }));
            if (n) { svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 4 + 11 * Math.sqrt(n / mx), fill: C('c1'), opacity: 0.7 })); svg.appendChild(svgEl('text', { x, y: y + 3.5, 'font-size': 9, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700 }, String(n))); }
            else svg.appendChild(svgEl('text', { x, y: y + 3, 'font-size': 9, 'text-anchor': 'middle', fill: C('rose') }, T('vacío', 'gap')));
          });
        });
        svg.appendChild(svgEl('text', { x: 8, y: 16, 'font-size': 9, class: 'art-mut' }, `${s.gapA} × ${s.gapB} · ${T('número de estudios', 'number of studies')}`));
      }
    }
  }

  /* ---------------- 7 · methods paragraph and exports ---------------- */
  function methodsText(L) {
    ensure();
    /* written from another block before this one was shown: fit it here */
    if (!cache.res) { const o = outcomes().includes(SY().outcome) ? SY().outcome : outcomes()[0]; if (o) { const d0 = data(o); cache = { d: d0, res: run(d0) }; } }
    const s = SY(), r = cache.res, d = cache.d, t = (es, en) => (L === 'en' ? en : es);
    const mName = { ROM: t('el logaritmo de la razón de respuesta (lnRR; Hedges et al. 1999)', 'the log response ratio (lnRR; Hedges et al. 1999)'), SMD: t('la diferencia de medias estandarizada con la corrección de Hedges (g)', 'the standardized mean difference with Hedges\' correction (g)'), MD: t('la diferencia de medias', 'the mean difference'), RR: t('el logaritmo de la razón de riesgos', 'the log risk ratio'), OR: t('el logaritmo de la razón de momios', 'the log odds ratio'), RD: t('la diferencia de riesgos', 'the risk difference'), ZCOR: t('la correlación transformada con z de Fisher', 'the Fisher z-transformed correlation') }[d ? d.metric : 'ROM'];
    let txt = t(`Los efectos se expresaron como ${mName}. `, `Effects were expressed as ${mName}. `);
    txt += s.model === 'avg'
      ? t(`Cuando un estudio aportó varios efectos, se promediaron suponiendo una correlación de ${s.rho} entre ellos (Borenstein et al. 2009) y los promedios se combinaron con un modelo de efectos aleatorios con τ² estimado por ${Protocol.ESTIMATORS[s.estimator]}${s.test === 't' ? ' y el ajuste de Knapp y Hartung (2003)' : ''}. `, `When a study contributed several effects, they were averaged assuming a correlation of ${s.rho} among them (Borenstein et al. 2009) and the averages were pooled with a random-effects model with τ² estimated by ${Protocol.ESTIMATORS[s.estimator]}${s.test === 't' ? ' and the Knapp and Hartung (2003) adjustment' : ''}. `)
      : t(`Como varios estudios aportaron más de un efecto (distintos sitios, ciclos o dosis), se ajustó un modelo multinivel de efectos aleatorios de tres niveles (efectos anidados en estudios; Konstantopoulos 2011; Cheung 2014) por máxima verosimilitud restringida, con ${s.test === 't' ? `pruebas t con grados de libertad iguales al número de estudios menos el de coeficientes` : 'pruebas z'}. `, `Because several studies contributed more than one effect (different sites, seasons or rates), a three-level random-effects model was fitted (effects nested in studies; Konstantopoulos 2011; Cheung 2014) by restricted maximum likelihood, with ${s.test === 't' ? 't tests with degrees of freedom equal to the number of studies minus the number of coefficients' : 'z tests'}. `);
    txt += t('La heterogeneidad se describió con las varianzas de cada nivel, el I² total y por nivel, y el intervalo de predicción al 95 %. ', 'Heterogeneity was described with the variance of each level, the total and level-specific I², and the 95 % prediction interval. ');
    if (s.subMod || s.regMods.length) txt += t(`Se exploraron moderadores (${[s.subMod].concat(s.regMods).filter(Boolean).join(', ')}) con análisis de subgrupos y meta-regresión de efectos mixtos. `, `Moderators (${[s.subMod].concat(s.regMods).filter(Boolean).join(', ')}) were explored with subgroup analyses and mixed-effects meta-regression. `);
    txt += t(`Los análisis de sensibilidad incluyeron el otro tratamiento de los efectos múltiples (${s.model === 'avg' ? 'modelo multinivel' : 'promedio por estudio con ρ = 0.2, 0.5 y 0.8'}), la exclusión de estudios con riesgo de sesgo alto y de desviaciones estándar imputadas, y la eliminación de un estudio a la vez. `, `Sensitivity analyses included the other handling of multiple effects (${s.model === 'avg' ? 'multilevel model' : 'average per study with ρ = 0.2, 0.5 and 0.8'}), the exclusion of studies at high risk of bias and of imputed standard deviations, and the removal of one study at a time. `);
    txt += t('El sesgo de publicación se exploró con el gráfico de embudo, la prueba de Egger (Egger et al. 1997) sobre los promedios por estudio y su versión multinivel (Nakagawa et al. 2022), y el método de recorte y relleno (Duval y Tweedie 2000) como análisis de sensibilidad. ', 'Publication bias was explored with the funnel plot, Egger\'s test (Egger et al. 1997) on study averages and its multilevel version (Nakagawa et al. 2022), and trim-and-fill (Duval and Tweedie 2000) as a sensitivity analysis. ');
    txt += t(`Los análisis se hicieron con ReviewPro ${APP_VERSION} (Barrera-Guzmán 2026).`, `Analyses were run in ReviewPro ${APP_VERSION} (Barrera-Guzmán 2026).`);
    return r ? txt : '';
  }
  function resultsCSV() {
    const cell = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const rows = [['outcome', 'model', 'effects', 'studies', 'metric', 'estimate', 'se', 'ci_lo', 'ci_hi', 'p', 'pi_lo', 'pi_hi', 'sigma2_between', 'sigma2_within', 'I2_total', 'back_transformed']];
    outcomes().forEach(o => { const d = data(o), r = run(d); if (r) rows.push([o, r.model, r.k, r.m, d.metric, r.est, r.se, r.ci[0], r.ci[1], r.p, r.pi ? r.pi[0] : '', r.pi ? r.pi[1] : '', r.s2b, r.s2w == null ? '' : r.s2w, r.I2.total, back(d.metric, r.est)]); });
    return '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';
  }

  function renderAll() {
    if (!state.protocol) return;
    ensure();
    renderMain(); renderMods(); renderSens(); renderBias(); renderNonQuant();
    const mt = el('b8Methods'); if (mt) mt.textContent = methodsText(I18N.lang) || T('(aparecerá cuando haya un análisis)', '(it appears once there is an analysis)');
  }
  const debounce = (fn, ms) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

  function wire() {
    const panel = el('panel-8'); if (!panel) return;
    const later = debounce(renderAll, 150);
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.model) { SY().model = b.dataset.model; Project.touch(); fitUI(); return; }
      if (b.id === 'b8DlCsv') rvBusy(b, () => download(resultsCSV(), slug(P().title || 'revision') + '_metaanalisis.csv', 'text/csv;charset=utf-8'));
      if (b.id === 'b8CopyMethods') navigator.clipboard && navigator.clipboard.writeText(el('b8Methods').textContent).then(() => { b.textContent = T('✓ Copiado', '✓ Copied'); setTimeout(() => { b.innerHTML = L2('Copiar', 'Copy'); }, 1400); });
    });
    panel.addEventListener('input', e => {
      const n = e.target;
      if (n.id === 'b8Rho') { SY().rho = +n.value; el('b8RhoVal').textContent = fmtFixed(+n.value, 2); Project.touch(); later(); }
    });
    panel.addEventListener('change', e => {
      const n = e.target, s = SY();
      const map = { b8Outcome: 'outcome', b8Test: 'test', b8Est: 'estimator', b8SubMod: 'subMod', b8MatField: 'matrixField', b8GapA: 'gapA', b8GapB: 'gapB' };
      if (map[n.id]) { s[map[n.id]] = n.value; Project.touch(); fitUI(); return; }
      if (n.dataset.reg) { s.regMods = n.checked ? s.regMods.concat([n.dataset.reg]) : s.regMods.filter(x => x !== n.dataset.reg); Project.touch(); fitUI(); }
    });
    Project.on(kind => { if (kind === 'load') renderAll(); });
    document.addEventListener('langchange', () => { if (state.protocol) renderAll(); });
    document.addEventListener('stepchange', e => { if (e.detail.step === 8) fitUI(); });
  }
  /* from the interface, the model fits (multilevel, subgroups, meta-regression,
     sensitivity) run in the work window; renderAll stays synchronous */
  function fitUI() {
    return rvAfterPaint(renderAll, rvWork('Ajustando el meta-análisis', 'Fitting the meta-analysis'));
  }
  function init() {
    ensure(); wire();
    if (location.hash === '#b8') setTimeout(() => { goStep(8); }, 0);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
  window.Block8 = { renderAll, data, run, methodsText, resultsCSV, outcomes };
})();
