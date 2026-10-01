/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 4 engine: title and abstract screening.

   1. Record keys. A record is known by its DOI, or by its normalized title
      and year. Two reviewers who imported the same exports on two computers
      get the same keys, so their decisions can be joined.
   2. The queue of one reviewer: first the pilot (the same records for
      everyone, drawn with a seed from the project), then the records other
      reviewers already screened (so everything read gets a second, blind
      reading), then the rest — ordered by the reviewer's own model once it
      has seen at least one inclusion and one exclusion (TF-IDF + naive
      Bayes, as in the home-page laboratory), and by the search terms before.
      "Maybe" counts as relevant for the model: an uncertain record should
      pull similar ones forward, not push them back.
   3. Stopping: consecutive irrelevant records, or the knee of the gain curve,
      on the reviewer's own sequence; and a verification sample of the unread
      records with an exact one-sided Clopper–Pearson bound on how many
      relevant ones could remain (Clopper & Pearson 1934).
   4. Agreement: Cohen's kappa for each pair of reviewers (Cohen 1960) with
      its large-sample standard error (Fleiss, Cohen & Everitt 1969), Fleiss'
      kappa for three or more (Fleiss 1971), read on the scale of Landis &
      Koch (1977).
   5. The status of every record: agreed, in conflict, waiting for a second
      reviewer, resolved by consensus or by a third reviewer, or left unread
      after the stopping rule. */

const Screening = {};

(function () {
  const has = s => typeof s === 'string' && s.trim().length > 0;

  /* ---------- 1 · keys ---------- */
  function rkey(r) {
    if (r.doi) return 'doi:' + r.doi.toLowerCase();
    return 't:' + Dedup.normTitle(r.title) + '|' + (r.year || '');
  }
  /* a deterministic shuffle from a text seed (the same on every computer) */
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pilotKeys(keys, n, seedText) {
    if (!n) return [];
    const k = keys.slice().sort();
    Screen.shuffle(k, rng(hash(seedText || 'reviewpro')));
    return k.slice(0, Math.min(n, k.length));
  }

  /* ---------- 2 · the model and the queue ---------- */
  const isRel = d => d === 'inc' || d === 'maybe';
  function features(recs) {
    return Screen.tfidf(recs.map(r => Screen.tokenize([r.title, r.abstract, (r.keywords || []).join(' ')].join(' '))));
  }
  /* score by the search strategy: how many blocks and terms a record hits */
  function searchScore(strategy, r) {
    if (!strategy || !strategy.blocks || !window.Search) return 0;
    const c = Search.compile(strategy);
    const txt = Search.norm([r.title, r.abstract, (r.keywords || []).join(' ')].join(' '));
    let s = 0;
    c.blocks.forEach(b => { const n = b.res.filter(re => re.test(txt)).length; if (n) s += 10 + n; });
    return s;
  }
  /* recs: records; keys: their keys; mine: {key: decision} of this reviewer;
     others: Set of keys screened by other reviewers; pilot: keys of the pilot.
     Returns the ordered list of keys still to read, and why each is there. */
  function queue(recs, keys, mine, others, pilot, opts) {
    const o = Object.assign({ order: 'prioritized', seed: 1, strategy: null, fe: null }, opts || {});
    const idx = new Map(keys.map((k, i) => [k, i]));
    const left = keys.filter(k => !mine[k]);
    const leftSet = new Set(left);
    const pilotLeft = pilot.filter(k => leftSet.has(k));
    const pilotSet = new Set(pilotLeft);
    const second = left.filter(k => !pilotSet.has(k) && others.has(k));
    const secondSet = new Set(second);
    let rest = left.filter(k => !pilotSet.has(k) && !secondSet.has(k));
    let model = 'none';
    if (o.order === 'random') { Screen.shuffle(rest, rng(o.seed)); model = 'random'; }
    else if (o.order === 'prioritized') {
      const dec = Object.entries(mine);
      const nRel = dec.filter(([, d]) => isRel(d.d)).length, nIrr = dec.filter(([, d]) => d.d === 'exc').length;
      if (nRel && nIrr) {
        const fe = o.fe || features(recs);
        const nb = Screen.NB(fe.terms.length, 1);
        dec.forEach(([k, d]) => { const i = idx.get(k); if (i != null) nb.add(fe.rows[i], isRel(d.d) ? 1 : 0); });
        const sc = new Map(rest.map(k => [k, nb.score(fe.rows[idx.get(k)])]));
        rest.sort((a, b) => sc.get(b) - sc.get(a) || (a < b ? -1 : 1));
        model = 'nb';
      } else if (o.strategy && o.strategy.blocks && o.strategy.blocks.length) {
        const sc = new Map(rest.map(k => [k, searchScore(o.strategy, recs[idx.get(k)])]));
        rest.sort((a, b) => sc.get(b) - sc.get(a) || idx.get(a) - idx.get(b));
        model = 'search';
      }
    }
    return { keys: pilotLeft.concat(second, rest), nPilot: pilotLeft.length, nSecond: second.length, model };
  }

  /* ---------- 3 · stopping ---------- */
  /* the reviewer's decisions in the order they were made, pilot included */
  const sequence = mine => Object.entries(mine).sort((a, b) => a[1].t - b[1].t || a[1].n - b[1].n);
  function stopStatus(mine, rule, n) {
    const seq = sequence(mine);
    const found = new Int32Array(seq.length + 1);
    seq.forEach(([, d], i) => { found[i + 1] = found[i] + (isRel(d.d) ? 1 : 0); });
    let run = 0;
    for (let i = seq.length - 1; i >= 0 && seq[i][1].d === 'exc'; i--) run++;
    const out = { screened: seq.length, relevant: found[seq.length], run, found };
    if (rule === 'knee') {
      const k = seq.length >= 150 ? Screen.stopKnee(found, { minRank: seq.length, fixed: null }) : { at: seq.length, knee: null, rho: null };
      out.met = k.knee != null && k.at <= seq.length;
      out.rho = k.rho; out.need = k.need;
    } else {
      out.met = run >= n;
      out.need = n;
    }
    return out;
  }
  /* inverse of the regularized incomplete beta, by bisection */
  function qbeta(p, a, b) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Meta.ibeta(m, a, b) < p) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  /* exact one-sided upper confidence bound for a proportion, x of n (Clopper–Pearson) */
  function cpUpper(x, n, level) {
    const L = level == null ? 0.95 : level;
    if (x >= n) return 1;
    return qbeta(L, x + 1, n - x);
  }
  /* a verification sample of the unread: how many relevant could remain? */
  function verifyBound(sampleN, sampleRel, unread, level) {
    const p = cpUpper(sampleRel, sampleN, level);
    return { p, maxRemaining: Math.ceil(p * unread), sampleN, sampleRel, unread };
  }
  /* the smallest sample that, with no relevant found, bounds the remaining share below `share` */
  const sampleSizeFor = (share, level) => Math.ceil(Math.log(1 - (level == null ? 0.95 : level)) / Math.log(1 - share));

  /* ---------- 4 · agreement ---------- */
  const CATS3 = ['inc', 'maybe', 'exc'];
  const bin = d => (isRel(d) ? 'inc' : 'exc');
  /* Cohen's kappa from two parallel arrays of labels */
  function cohen(a, b, cats) {
    const C = cats || [...new Set(a.concat(b))].sort();
    const n = a.length;
    if (!n) return null;
    const ix = new Map(C.map((c, i) => [c, i]));
    const m = C.map(() => C.map(() => 0));
    a.forEach((x, i) => { m[ix.get(x)][ix.get(b[i])]++; });
    const row = m.map(r => r.reduce((s, v) => s + v, 0) / n), col = C.map((_, j) => m.reduce((s, r) => s + r[j], 0) / n);
    const po = C.reduce((s, _, i) => s + m[i][i], 0) / n;
    const pe = C.reduce((s, _, i) => s + row[i] * col[i], 0);
    const kappa = pe === 1 ? (po === 1 ? 1 : 0) : (po - pe) / (1 - pe);
    /* standard error under kappa ≠ 0 (Fleiss, Cohen & Everitt 1969) */
    let se = NaN;
    if (pe < 1) {
      let A = 0, B = 0;
      C.forEach((_, i) => { A += (m[i][i] / n) * Math.pow(1 - (row[i] + col[i]) * (1 - kappa), 2); });
      C.forEach((_, i) => C.forEach((__, j) => { if (i !== j) B += (m[i][j] / n) * Math.pow(row[j] + col[i], 2); }));
      B *= Math.pow(1 - kappa, 2);
      const Cc = Math.pow(kappa - pe * (1 - kappa), 2);
      se = Math.sqrt(Math.max(0, A + B - Cc)) / ((1 - pe) * Math.sqrt(n));
    }
    /* the interval is cut at the limits kappa can take */
    return { kappa, po, pe, n, se, ci: [Math.max(-1, kappa - 1.959963984540054 * se), Math.min(1, kappa + 1.959963984540054 * se)], table: m, cats: C };
  }
  /* Fleiss' kappa: counts[i][j] = raters putting subject i in category j (same number of raters per subject) */
  function fleiss(counts) {
    const N = counts.length;
    if (!N) return null;
    const n = counts[0].reduce((a, b) => a + b, 0), k = counts[0].length;
    if (n < 2) return null;
    const pj = Array.from({ length: k }, (_, j) => counts.reduce((s, r) => s + r[j], 0) / (N * n));
    const Pi = counts.map(r => (r.reduce((s, v) => s + v * v, 0) - n) / (n * (n - 1)));
    const Pbar = Pi.reduce((a, b) => a + b, 0) / N, Pe = pj.reduce((s, p) => s + p * p, 0);
    return { kappa: Pe === 1 ? 1 : (Pbar - Pe) / (1 - Pe), Pbar, Pe, N, n };
  }
  const LANDIS = [[0, ['pobre', 'poor']], [0.2, ['leve', 'slight']], [0.4, ['aceptable', 'fair']], [0.6, ['moderado', 'moderate']], [0.8, ['sustancial', 'substantial']], [1.0001, ['casi perfecto', 'almost perfect']]];
  function landis(k) {
    if (!(k > 0)) return LANDIS[0][1];
    for (let i = 1; i < LANDIS.length; i++) if (k <= LANDIS[i][0]) return LANDIS[i][1];
    return LANDIS[LANDIS.length - 1][1];
  }
  /* agreement for every pair of reviewers on the records both screened */
  function agreement(decisions, reviewers, keysFilter) {
    const out = [];
    for (let a = 0; a < reviewers.length; a++) for (let b = a + 1; b < reviewers.length; b++) {
      const A = decisions[reviewers[a]] || {}, B = decisions[reviewers[b]] || {};
      const common = Object.keys(A).filter(k => B[k] && (!keysFilter || keysFilter.has(k)));
      const x = common.map(k => A[k].d), y = common.map(k => B[k].d);
      out.push({ a: reviewers[a], b: reviewers[b], n: common.length,
        three: common.length ? cohen(x, y, CATS3) : null, two: common.length ? cohen(x.map(bin), y.map(bin), ['inc', 'exc']) : null });
    }
    return out;
  }

  /* ---------- 5 · status of every record ----------
     required: how many reviewers must read each record (from the protocol). */
  function status(key, decisions, reviewers, final, required, stopped) {
    if (final && final[key]) return { s: 'final', d: final[key].d, reason: final[key].reason, by: final[key].by };
    const ds = reviewers.map(r => (decisions[r] || {})[key]).filter(Boolean);
    if (!ds.length) return { s: stopped ? 'unread' : 'pending' };
    const need = Math.max(1, Math.min(required || 1, reviewers.length));
    const kinds = [...new Set(ds.map(d => d.d))];
    if (kinds.length > 1) {
      /* inclusion and "maybe" both send the record to full text: not a conflict that changes its fate */
      if (kinds.every(isRel)) return ds.length >= need ? { s: 'agreed', d: 'maybe', soft: true } : { s: 'partial', n: ds.length };
      return { s: 'conflict', ds };
    }
    if (ds.length < need) return { s: 'partial', n: ds.length, d: kinds[0] };
    const d = kinds[0];
    const reasons = [...new Set(ds.map(x => x.reason).filter(Boolean))];
    return { s: 'agreed', d, reason: reasons[0] || '', reasons };
  }
  /* the counts that feed PRISMA and the summary */
  function summary(keys, decisions, reviewers, final, required, stopped) {
    const c = { total: keys.length, inc: 0, maybe: 0, exc: 0, conflict: 0, partial: 0, pending: 0, unread: 0, reasons: {} };
    keys.forEach(k => {
      const st = status(k, decisions, reviewers, final, required, stopped);
      if (st.s === 'agreed' || st.s === 'final') {
        c[st.d]++;
        if (st.d === 'exc') { const r = st.reason || '—'; c.reasons[r] = (c.reasons[r] || 0) + 1; }
      } else c[st.s]++;
    });
    c.screened = c.inc + c.maybe + c.exc;
    c.toFullText = c.inc + c.maybe;
    return c;
  }

  /* ---------- exchange between computers ---------- */
  const FORMAT = 'reviewpro-screening';
  function exportFile(reviewer, name, decisions) {
    return { format: FORMAT, version: 1, app: APP_VERSION, saved: new Date().toISOString(), reviewer, name, decisions };
  }
  /* accepts a screening file or a whole project file; returns [{reviewer, name, decisions}] */
  function readExchange(obj) {
    if (obj && obj.format === FORMAT) return [{ reviewer: obj.reviewer, name: obj.name, decisions: obj.decisions || {} }];
    if (obj && obj.format === 'reviewpro-project' && obj.screening) {
      const s = obj.screening;
      return (s.reviewers || []).map(r => ({ reviewer: r.id, name: r.name, decisions: (s.decisions || {})[r.id] || {} })).filter(x => Object.keys(x.decisions).length);
    }
    throw new Error(T('El archivo no trae decisiones de cribado de ReviewPro.', 'The file carries no ReviewPro screening decisions.'));
  }
  /* join incoming decisions: a later timestamp wins for the same record */
  function mergeDecisions(into, incoming) {
    let added = 0, updated = 0;
    Object.entries(incoming).forEach(([k, d]) => {
      const cur = into[k];
      if (!cur) { into[k] = d; added++; }
      else if ((d.t || 0) > (cur.t || 0)) { into[k] = d; updated++; }
    });
    return { added, updated };
  }

  Object.assign(Screening, { rkey, hash, pilotKeys, isRel, features, searchScore, queue, sequence, stopStatus, qbeta, cpUpper, verifyBound, sampleSizeFor,
    cohen, fleiss, landis, agreement, status, summary, exportFile, readExchange, mergeDecisions, CATS3 });
  window.Screening = Screening;
})();
