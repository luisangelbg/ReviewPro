/* ReviewPro — tests of Block 4 (screening).

   References: an independent implementation in R (tools/validar_bloque4.R →
   r_reference_b4.js) for Cohen's kappa and its standard error, Fleiss' kappa
   and the Clopper–Pearson bound; the published values of the textbook kappa
   example (κ = 0.40) and of Fleiss' 1971 example (κ = 0.210); and the
   definitions of the queue, the stopping rule and the record status. */
(function () {
  const { section, check, near, rel } = TT;
  const R = window.RREF_B4;
  const SG = Screening;

  section('Acuerdo contra R y contra valores publicados');
  let k = SG.cohen(R.book.a, R.book.b, ['inc', 'exc']);
  check('ejemplo de libro (50 sujetos): κ = 0.40, po = 0.70, pe = 0.50', near(k.kappa, 0.4, 1e-12) && near(k.po, 0.7, 1e-12) && near(k.pe, 0.5, 1e-12));
  check('error estándar de Fleiss, Cohen y Everitt igual al de R', rel(k.se, R.book.se, 1e-10), k.se.toFixed(6));
  k = SG.cohen(R.three.a, R.three.b, ['inc', 'maybe', 'exc']);
  check('tres categorías: κ, po, pe y EE iguales a R', rel(k.kappa, R.three.kappa, 1e-10) && rel(k.po, R.three.po, 1e-12) && rel(k.pe, R.three.pe, 1e-12) && rel(k.se, R.three.se, 1e-10), `κ = ${k.kappa.toFixed(4)}`);
  const fl = SG.fleiss(R.fleiss.counts);
  check('Fleiss (1971), ejemplo publicado: κ = 0.210', near(fl.kappa, 0.2099, 5e-5) && rel(fl.kappa, R.fleiss.kappa, 1e-12) && rel(fl.Pbar, R.fleiss.Pbar, 1e-12) && rel(fl.Pe, R.fleiss.Pe, 1e-12), fl.kappa.toFixed(4));
  check('Fleiss con dos evaluadores ≈ Cohen (misma tabla marginal combinada)', (() => { const a = R.book.a, b = R.book.b; const counts = a.map((x, i) => ['inc', 'exc'].map(c => (x === c) + (b[i] === c))); const f = SG.fleiss(counts); return Math.abs(f.kappa - 0.4) < 0.02; })());
  check('acuerdo perfecto: κ = 1 e intervalo [1, 1]', (() => { const x = SG.cohen(['inc', 'exc', 'inc'], ['inc', 'exc', 'inc']); return x.kappa === 1 && x.ci[1] === 1; })());
  check('el intervalo no pasa de 1 ni baja de −1', (() => { const x = SG.cohen(['inc', 'inc', 'exc', 'exc', 'inc'], ['inc', 'inc', 'exc', 'exc', 'exc']); return x.ci[1] <= 1 && x.ci[0] >= -1; })());
  check('escala de Landis y Koch', SG.landis(0.1)[0] === 'leve' && SG.landis(0.5)[0] === 'moderado' && SG.landis(0.85)[0] === 'casi perfecto' && SG.landis(-0.2)[0] === 'pobre');

  section('Cota de la muestra de verificación (Clopper–Pearson)');
  R.cp.forEach(r => check(`${r.x} relevantes de ${r.n}: cota superior al 95 % = ${r.upper.toFixed(4)} (R)`, rel(SG.cpUpper(r.x, r.n), r.upper, 1e-9), SG.cpUpper(r.x, r.n).toFixed(6)));
  check('con 0 de n la cota es 1 − 0.05^(1/n) (forma cerrada)', [10, 37, 200].every(n => near(SG.cpUpper(0, n), 1 - Math.pow(0.05, 1 / n), 1e-10)));
  check('tamaño de muestra para acotar al 5, 2 y 1 %: igual a R', R.samplesize.share.every((s, i) => SG.sampleSizeFor(s) === R.samplesize.n[i]), R.samplesize.n.join(', '));
  const vb = SG.verifyBound(50, 0, 800);
  check('con 0 de 50 y 800 sin leer: quedan como máximo 47 relevantes', vb.maxRemaining === Math.ceil(R.cp[1].upper * 800) && vb.maxRemaining === 47);

  section('Claves de registro y piloto');
  const r1 = { doi: '10.1/ABC', title: 'X', year: 2020 }, r2 = { doi: '', title: 'The Maize: a Test!', year: 2019 };
  check('clave por DOI en minúsculas', SG.rkey(r1) === 'doi:10.1/abc');
  check('clave por título normalizado y año', SG.rkey(r2) === 't:maize a test|2019' && SG.rkey({ title: 'maize - A TEST', year: 2019 }) === SG.rkey(r2));
  const keys = Array.from({ length: 200 }, (_, i) => 'k' + i);
  const p1 = SG.pilotKeys(keys, 30, 'Mi revisión'), p2 = SG.pilotKeys(keys.slice().reverse(), 30, 'Mi revisión');
  check('el piloto es el mismo en dos computadoras (no depende del orden de importación)', p1.length === 30 && p1.join() === p2.join());
  check('otra revisión, otro piloto', SG.pilotKeys(keys, 30, 'Otra').join() !== p1.join());
  check('piloto mayor que la pila → toda la pila', SG.pilotKeys(keys.slice(0, 5), 30, 'x').length === 5);

  section('La cola de un revisor');
  const recs = Screen.corpus({ n: 300, prevalence: 0.06, difficulty: 0.3 }, 21);
  const rk = recs.map((r, i) => 'r' + i);
  const pil = rk.slice(0, 10);
  let q = SG.queue(recs, rk, {}, new Set(), pil, { order: 'prioritized' });
  check('primero el piloto, completo', q.keys.slice(0, 10).join() === pil.join() && q.nPilot === 10);
  check('sin decisiones y sin búsqueda: orden original después del piloto', q.model === 'none' && q.keys[10] === 'r10');
  const others = new Set(['r50', 'r60']);
  q = SG.queue(recs, rk, {}, others, pil, { order: 'prioritized' });
  check('después, lo que otros ya leyeron (segunda lectura a ciegas)', q.keys.slice(10, 12).sort().join() === 'r50,r60' && q.nSecond === 2);
  const mine = {};
  let t = 1;
  rk.forEach((key, i) => { if (i < 10) mine[key] = { d: recs[i].label ? 'inc' : 'exc', t: t++, n: t }; });
  if (!Object.values(mine).some(d => d.d === 'inc')) { const j = recs.findIndex(r => r.label); mine[rk[j]] = { d: 'inc', t: t++, n: t }; }
  q = SG.queue(recs, rk, mine, new Set(), pil, { order: 'prioritized' });
  check('con al menos una inclusión y una exclusión el modelo prioriza', q.model === 'nb');
  /* a whole screening run through the real queue, deciding with the truth,
     from one known relevant and one known irrelevant record */
  const simulate = order => {
    const m = {}; let tt = 0; const labs = [];
    m[rk[recs.findIndex(r => r.label && !r.subtle)]] = { d: 'inc', t: tt++ };
    m[rk[recs.findIndex(r => !r.label)]] = { d: 'exc', t: tt++ };
    const fx = SG.features(recs);
    for (;;) { const qq = SG.queue(recs, rk, m, new Set(), [], { order, fe: fx, seed: 3 }); if (!qq.keys.length) break; const key = qq.keys[0], lab = recs[+key.slice(1)].label; m[key] = { d: lab ? 'inc' : 'exc', t: tt++ }; labs.push(lab); }
    const found = new Int32Array(labs.length + 1); labs.forEach((l, i) => { found[i + 1] = found[i] + l; });
    return Screen.wss(found, found[labs.length], 0.95);
  };
  const wNb = simulate('prioritized'), wRnd = simulate('random');
  check('cribado completo por la cola real: priorizar ahorra trabajo (WSS@95 > 0.6) y el azar no (≈ 0)', wNb > 0.6 && Math.abs(wRnd) < 0.2, `priorizado ${fmtFixed(wNb, 2)}, aleatorio ${fmtFixed(wRnd, 2)}`);
  check('la cola no repite ni incluye lo ya decidido', new Set(q.keys).size === q.keys.length && q.keys.every(k => !mine[k]));
  const qr1 = SG.queue(recs, rk, {}, new Set(), [], { order: 'random', seed: 3 }), qr2 = SG.queue(recs, rk, {}, new Set(), [], { order: 'random', seed: 3 });
  check('orden aleatorio reproducible con la semilla del revisor', qr1.keys.join() === qr2.keys.join() && qr1.keys.join() !== rk.join());
  const strat = { blocks: [{ terms: [{ t: 'mycorrhiz*' }] }, { terms: [{ t: 'maize' }] }], not: { terms: [] } };
  q = SG.queue(recs, rk, {}, new Set(), [], { order: 'prioritized', strategy: strat });
  check('sin modelo todavía, ordena por la búsqueda', q.model === 'search' && recs[+q.keys[0].slice(1)].abstract.toLowerCase().includes('mycorrhiz'));

  section('Regla de paro');
  const seq = {};
  ['inc', 'exc', 'inc', 'maybe', 'exc', 'exc', 'exc'].forEach((d, i) => { seq['s' + i] = { d, t: i + 1, n: i + 1 }; });
  let st = SG.stopStatus(seq, 'consecutive', 3);
  check('tres irrelevantes seguidos al final: la regla de 3 se cumple', st.run === 3 && st.met && st.relevant === 3);
  st = SG.stopStatus(seq, 'consecutive', 4);
  check('con 4 aún no', !st.met);
  seq.s7 = { d: 'maybe', t: 8, n: 8 };
  check('un «tal vez» reinicia la cuenta (cuenta como relevante)', SG.stopStatus(seq, 'consecutive', 3).run === 0);

  section('Estado de cada registro');
  const D = { A: { k1: { d: 'inc' }, k2: { d: 'exc', reason: 'E1' }, k3: { d: 'inc' }, k4: { d: 'inc' }, k6: { d: 'exc', reason: 'E2' } }, B: { k1: { d: 'inc' }, k2: { d: 'exc', reason: 'E1' }, k3: { d: 'exc', reason: 'E2' }, k4: { d: 'maybe' }, k6: { d: 'exc', reason: 'E3' } } };
  const st2 = k => SG.status(k, D, ['A', 'B'], {}, 2, false);
  check('ambos incluyen → acordado incluir', st2('k1').s === 'agreed' && st2('k1').d === 'inc');
  check('ambos excluyen por E1 → acordado excluir por E1', st2('k2').s === 'agreed' && st2('k2').d === 'exc' && st2('k2').reason === 'E1');
  check('incluir contra excluir → conflicto', st2('k3').s === 'conflict');
  check('incluir contra tal vez → pasa a texto completo sin conflicto', st2('k4').s === 'agreed' && st2('k4').d === 'maybe');
  check('ambos excluyen con motivos distintos → acordado excluir, se conservan los dos motivos', st2('k6').s === 'agreed' && st2('k6').reasons.length === 2);
  check('un solo revisor cuando el protocolo pide dos → espera segunda lectura', SG.status('k1', { A: D.A, B: {} }, ['A', 'B'], {}, 2, false).s === 'partial');
  check('sin decisiones: pendiente, o «no leído» tras la regla de paro', st2('k5').s === 'pending' && SG.status('k5', D, ['A', 'B'], {}, 2, true).s === 'unread');
  check('la decisión final resuelve el conflicto', SG.status('k3', D, ['A', 'B'], { k3: { d: 'exc', reason: 'E2', by: 'consensus' } }, 2, false).s === 'final');
  const sm = SG.summary(['k1', 'k2', 'k3', 'k4', 'k5', 'k6'], D, ['A', 'B'], {}, 2, true);
  check('resumen: 1 incluido, 1 tal vez, 2 excluidos, 1 conflicto, 1 no leído', sm.inc === 1 && sm.maybe === 1 && sm.exc === 2 && sm.conflict === 1 && sm.unread === 1 && sm.toFullText === 2);
  check('motivos de exclusión contados', sm.reasons.E1 === 1 && sm.reasons.E2 === 1);

  section('Intercambio entre computadoras');
  const file = JSON.parse(JSON.stringify(SG.exportFile('rB', 'Beatriz', { k1: { d: 'inc', t: 10 }, k2: { d: 'exc', t: 5 } })));
  const got = SG.readExchange(file);
  check('el archivo de decisiones se lee con su revisor', got.length === 1 && got[0].reviewer === 'rB' && got[0].name === 'Beatriz' && Object.keys(got[0].decisions).length === 2);
  const proj = { format: 'reviewpro-project', screening: { reviewers: [{ id: 'r1', name: 'Ana' }, { id: 'r2', name: 'Luis' }], decisions: { r1: { k1: { d: 'inc', t: 1 } }, r2: {} } } };
  check('también el archivo de proyecto completo (solo revisores con decisiones)', SG.readExchange(proj).length === 1 && SG.readExchange(proj)[0].name === 'Ana');
  check('un archivo ajeno se rechaza', (() => { try { SG.readExchange({ x: 1 }); return false; } catch (e) { return true; } })());
  const into = { k1: { d: 'exc', t: 20 }, k3: { d: 'inc', t: 1 } };
  const res = SG.mergeDecisions(into, file.decisions);
  check('al combinar gana la decisión más reciente; las nuevas se agregan', res.added === 1 && res.updated === 0 && into.k1.d === 'exc' && into.k2.d === 'exc');
  const res2 = SG.mergeDecisions(into, { k1: { d: 'inc', t: 30 } });
  check('una decisión posterior actualiza', res2.updated === 1 && into.k1.d === 'inc');
})();
