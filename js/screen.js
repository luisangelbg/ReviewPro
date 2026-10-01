/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — the screening engine: text → features → ranking → stopping.

   Screening titles and abstracts is where a systematic review spends most of
   its hours. Prioritized screening does not decide for the reviewer: it only
   changes the ORDER in which records are shown, so that the relevant ones
   come first and the reviewer can stop, with a documented rule, long before
   the end of the pile. Everything here runs in the browser; no record leaves
   the computer.

   1. Text: tokens without accents, stop words or numbers, a light plural
      stemmer, and TF-IDF weights normalized to unit length (Salton & Buckley 1988).
   2. Model: multinomial naive Bayes on those weights, updated record by
      record (the counts are sums, so learning one decision costs one sparse
      addition). The score of a record is its log-likelihood ratio.
   3. Active learning: after each batch the model is refit and the unscreened
      records are re-ranked by certainty of relevance (Yu, Kraft & Menzies 2018;
      van de Schoot et al. 2021).
   4. Evaluation of a finished simulation: recall curve, work saved over
      sampling at a recall level (WSS@r; Cohen et al. 2006), relevant records
      found after screening x % (RRF@x) and average time to discovery.
   5. Stopping: consecutive irrelevant records and the knee of the gain curve
      (Cormack & Grossman 2016). */

const Screen = {};

(function () {

  /* ================= 1 · text ================= */

  const STOP = new Set((
    'a about above after again against all also although am among an and any are as at be because been before being ' +
    'below between both but by can could did do does doing down during each either et al etc few for from further had has ' +
    'have having he her here hers him his how however i if in into is it its itself just may might more most much must my ' +
    'no nor not now of off on once only or other our ours out over own per same she should since so some such than that ' +
    'the their theirs them then there these they this those through thus to too under until up upon us very via was we ' +
    'were what when where which while who whom why will with within without would yet you your ' +
    /* Spanish */
    'al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante el ella ellas ellos en ' +
    'entre era eran es esa esas ese eso esos esta estaba estado estas este esto estos fue fueron ha han hasta hay la las ' +
    'le les lo los mas me mi mientras muy nada ni no nos o os otra otras otro otros para pero poco por porque que quien se ' +
    'sea ser si sido sin sobre son su sus tambien tanto te tiene tienen todo todos tras un una uno unos y ya ' +
    /* the words of every abstract, which say nothing about its topic */
    'abstract background objective objectives method methods result results conclusion conclusions study studies ' +
    'paper article research using used use based show shows shown showed found present presents presented aim aimed ' +
    'resumen objetivo metodos resultados conclusion estudio'
  ).split(/\s+/));

  function tokenize(s) {
    const t = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    if (!t) return [];
    const out = [];
    for (let w of t.split(' ')) {
      if (w.length < 3 || /^\d+$/.test(w) || STOP.has(w)) continue;
      w = stem(w);
      if (w.length >= 3 && !STOP.has(w)) out.push(w);
    }
    return out;
  }
  /* A deliberately light stemmer: only the plural (English and Latin), so "trials" meets "trial"
     and "fungi" stays what it is. Heavy stemmers merge words a reviewer
     would keep apart ("organic" / "organism"). */
  const INVARIANT = new Set(['species', 'series', 'diabetes', 'means', 'analysis', 'basis', 'news', 'lens', 'gas']);
  function stem(w) {
    if (INVARIANT.has(w)) return w;
    if (w.length >= 6 && w.endsWith('ae')) return w.slice(0, -1);   // Latin plurals: mycorrhizae, larvae
    if (w.length > 4) {
      if (w.endsWith('ies') && w.length > 5) return w.slice(0, -3) + 'y';
      if (w.endsWith('sses')) return w.slice(0, -2);
      if (w.endsWith('es') && /(ch|sh|x|z)es$/.test(w)) return w.slice(0, -2);
      if (w.endsWith('s') && !/(ss|us|is|ys)$/.test(w)) return w.slice(0, -1);
    }
    return w;
  }

  /* TF-IDF with the smoothed idf ln((1 + N)/(1 + df)) + 1 and unit-length rows.
     docs: array of token arrays. Returns {vocab: Map term→index, terms, idf,
     rows: [{idx: Int32Array, val: Float64Array}]} */
  function tfidf(docs, opts) {
    const o = Object.assign({ minDf: 1, maxDfFrac: 1 }, opts || {});
    const N = docs.length, df = new Map();
    docs.forEach(toks => { new Set(toks).forEach(t => df.set(t, (df.get(t) || 0) + 1)); });
    const terms = [...df.keys()].filter(t => df.get(t) >= o.minDf && df.get(t) <= o.maxDfFrac * N).sort();
    const vocab = new Map(terms.map((t, i) => [t, i]));
    const idf = new Float64Array(terms.length);
    terms.forEach((t, i) => { idf[i] = Math.log((1 + N) / (1 + df.get(t))) + 1; });
    const rows = docs.map(toks => {
      const tf = new Map();
      toks.forEach(t => { const j = vocab.get(t); if (j != null) tf.set(j, (tf.get(j) || 0) + 1); });
      const idx = Int32Array.from([...tf.keys()].sort((a, b) => a - b));
      const val = new Float64Array(idx.length);
      let nrm = 0;
      idx.forEach((j, q) => { val[q] = tf.get(j) * idf[j]; nrm += val[q] * val[q]; });
      nrm = Math.sqrt(nrm) || 1;
      for (let q = 0; q < val.length; q++) val[q] /= nrm;
      return { idx, val };
    });
    return { vocab, terms, idf, rows };
  }

  /* ================= 2 · naive Bayes, learned one record at a time =================
     Multinomial NB on the TF-IDF weights (Rennie et al. 2003), with additive
     smoothing α. Class priors are left out of the score on purpose: early in
     screening there are one or two relevant records against many irrelevant
     ones, and a prior would bury every new candidate. */
  function NB(V, alpha) {
    const a = alpha == null ? 1 : alpha;
    const cnt = [new Float64Array(V), new Float64Array(V)], tot = [0, 0], n = [0, 0];
    let w = null;
    return {
      add(row, label) {
        const c = cnt[label];
        for (let q = 0; q < row.idx.length; q++) { c[row.idx[q]] += row.val[q]; tot[label] += row.val[q]; }
        n[label]++; w = null;
      },
      /* log θ_rel,t − log θ_irr,t for every term */
      weights() {
        if (w) return w;
        w = new Float64Array(V);
        const d1 = Math.log(tot[1] + a * V), d0 = Math.log(tot[0] + a * V);
        for (let t = 0; t < V; t++) w[t] = (Math.log(cnt[1][t] + a) - d1) - (Math.log(cnt[0][t] + a) - d0);
        return w;
      },
      score(row) {
        const ww = this.weights();
        let s = 0;
        for (let q = 0; q < row.idx.length; q++) s += row.val[q] * ww[row.idx[q]];
        return s;
      },
      counts: () => n.slice(),
    };
  }

  /* ================= 3 · active learning =================
     rows: TF-IDF rows; labels: 1 relevant / 0 irrelevant (the truth, revealed
     only when a record is "screened"). opts = {batch, seed, prior: [nRel, nIrr],
     strategy: 'max' | 'random', alpha, priorRelPool: the relevant records the
     reviewer could plausibly know beforehand}. Returns the screening order and the
     number of relevant records found after each record. */
  function simulate(rows, labels, V, opts) {
    const o = Object.assign({ batch: 1, seed: 1, prior: [1, 1], strategy: 'max', alpha: 1 }, opts || {});
    const N = rows.length, r = rng(o.seed);
    const seen = new Uint8Array(N), order = [];
    const model = NB(V, o.alpha);
    const reveal = i => { seen[i] = 1; order.push(i); model.add(rows[i], labels[i]); };
    /* prior knowledge: a few records the reviewer already knows, drawn at random */
    const rel = [], irr = [];
    for (let i = 0; i < N; i++) (labels[i] ? rel : irr).push(i);
    shuffle(rel, r); shuffle(irr, r);
    const priorIdx = [];
    if (o.strategy === 'max') {
      (o.priorRelPool ? shuffle(o.priorRelPool.slice(), r) : rel).slice(0, o.prior[0]).forEach(i => priorIdx.push(i));
      irr.slice(0, o.prior[1]).forEach(i => priorIdx.push(i));
      priorIdx.forEach(reveal);
    }
    const nPrior = order.length;
    if (o.strategy === 'random') {
      const rest = [];
      for (let i = 0; i < N; i++) if (!seen[i]) rest.push(i);
      shuffle(rest, r);
      rest.forEach(i => { seen[i] = 1; order.push(i); });
    } else {
      while (order.length < N) {
        const cand = [];
        for (let i = 0; i < N; i++) if (!seen[i]) cand.push([i, model.score(rows[i]) + 1e-12 * r()]);
        cand.sort((x, y) => y[1] - x[1]);
        const b = Math.min(o.batch, cand.length);
        for (let q = 0; q < b; q++) reveal(cand[q][0]);
      }
    }
    const found = new Int32Array(N + 1);
    for (let k = 0; k < N; k++) found[k + 1] = found[k] + labels[order[k]];
    return { order, found, nPrior, nRel: found[N], N };
  }
  function shuffle(a, r) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ================= 4 · evaluation ================= */
  /* records screened until the recall first reaches `level` */
  function screenedAt(found, nRel, level) {
    const need = Math.ceil(level * nRel - 1e-9);
    for (let k = 0; k < found.length; k++) if (found[k] >= need) return k;
    return found.length - 1;
  }
  /* WSS@r = (N − n_r)/N − (1 − r): the share of the pile the reviewer does not
     read, minus what random reading would have saved for the same recall */
  function wss(found, nRel, level) {
    const N = found.length - 1, n = screenedAt(found, nRel, level);
    return (N - n) / N - (1 - level);
  }
  /* RRF@x: share of the relevant records found after reading x of the pile */
  function rrf(found, nRel, frac) {
    const N = found.length - 1, n = Math.round(frac * N);
    return nRel ? found[n] / nRel : NaN;
  }
  /* average time to discovery: mean position of the relevant records, as a
     share of the pile (lower is better) */
  function atd(found, nRel) {
    const N = found.length - 1;
    let s = 0;
    for (let k = 1; k <= N; k++) if (found[k] > found[k - 1]) s += k;
    return nRel ? s / nRel / N : NaN;
  }

  /* ================= 5 · stopping rules =================
     Both look only at what the reviewer has seen, never at the truth. */
  /* stop after `d` consecutive irrelevant records (a common, easily reported heuristic) */
  function stopConsecutive(found, d, minScreened) {
    const N = found.length - 1, m = minScreened || 0;
    let run = 0;
    for (let k = 1; k <= N; k++) {
      run = found[k] > found[k - 1] ? 0 : run + 1;
      if (run >= d && k >= m) return k;
    }
    return N;
  }
  /* Knee method (Cormack & Grossman 2016): at each rank s find the knee i of the
     gain curve (farthest point from the chord), compute the slope ratio
     ρ = (rel_i / i) / ((rel_s − rel_i + 1)/(s − i)) and stop once s ≥ 150 and
     ρ ≥ 156 − min(rel_s, 150). */
  function kneeAt(found, s) {
    const R = found[s];
    let best = 0, bi = 1;
    for (let i = 1; i < s; i++) {
      /* distance from (i, found[i]) to the line from (0, 0) to (s, R) */
      const dd = Math.abs(R * i - s * found[i]) / Math.sqrt(R * R + s * s);
      if (dd > best) { best = dd; bi = i; }
    }
    return bi;
  }
  /* opts.fixed = a number uses that constant threshold instead of the
     adjusted one: the adjustment protects collections with very few relevant
     records, and with a few dozen relevant it asks for ρ ≈ 130, so on piles of
     one or two thousand records it seldom fires. ρ ≥ 6 is the value the
     adjusted rule reaches once 150 relevant records have been found. */
  function stopKnee(found, opts) {
    const o = Object.assign({ minRank: 150, step: 1, fixed: null }, opts || {});
    const N = found.length - 1;
    for (let s = o.minRank; s <= N; s += o.step) {
      const i = kneeAt(found, s), ri = found[i], rs = found[s];
      if (ri === 0 || s === i) continue;
      const rho = (ri / i) / ((rs - ri + 1) / (s - i));
      const need = o.fixed != null ? o.fixed : 156 - Math.min(rs, 150);
      if (rho >= need) return { at: s, knee: i, rho, need };
    }
    return { at: N, knee: null, rho: null, need: null };
  }

  /* ================= 6 · a synthetic literature =================
     The laboratory needs a pile of records whose truth is known. The review
     question is about the effect of arbuscular mycorrhizal inoculation on
     maize grain yield in the field. Each record is written from sentence
     templates of its topic: the relevant topic, "hard" neighbours that share
     words with it (mycorrhizae in greenhouse vegetables, maize yield under
     fertilization, fungal diseases of maize) and "easy" distant topics.
     Difficulty moves sentences between topics, so a hard pile has relevant
     records that read like neighbours and neighbours that read like relevant
     ones. The records are fictitious. */
  const PLACES = ['central Mexico', 'the Bajío', 'Kenya', 'Ethiopia', 'northern India', 'southern Brazil', 'Argentina', 'Nigeria', 'China', 'Iowa', 'Spain', 'Zimbabwe', 'Pakistan', 'Tanzania', 'Colombia', 'Ghana'];
  const TOPICS = {
    rel: {
      titles: ['Arbuscular mycorrhizal inoculation increases maize grain yield under field conditions in {P}',
        'Field response of maize to inoculation with {F} in {P}',
        'Mycorrhizal inoculants and maize productivity: a {Y}-season field trial',
        'Does commercial AMF inoculum raise maize yield? Evidence from on-farm trials in {P}',
        'Maize grain yield and phosphorus uptake after inoculation with arbuscular mycorrhizal fungi',
        'Effect of {F} inoculation on yield components of field-grown maize'],
      sent: ['We evaluated the inoculation of maize with arbuscular mycorrhizal fungi in {N} field trials in {P}.',
        'Seeds were inoculated with {F} at sowing and grain yield was measured at harvest.',
        'Inoculated plots yielded {X} % more grain than non-inoculated controls.',
        'Root colonization by the mycorrhizal inoculum reached {X} % at flowering.',
        'The yield response to inoculation was larger in soils with low available phosphorus.',
        'Phosphorus uptake and grain yield of maize increased with mycorrhizal colonization.',
        'On-farm trials compared inoculated and control maize under farmer management.',
        'The field experiment followed a randomized complete block design over {Y} seasons.',
        'Mycorrhizal inoculation improved maize yield stability across sites.'],
    },
    amfVeg: { hard: true,
      titles: ['Arbuscular mycorrhizal fungi improve tomato growth in the greenhouse',
        'Inoculation with {F} enhances nutrient uptake of pepper seedlings',
        'Mycorrhizal colonization and fruit quality of greenhouse cucumber'],
      sent: ['Tomato seedlings were inoculated with {F} in pots under greenhouse conditions.',
        'Mycorrhizal colonization increased shoot phosphorus of the seedlings.',
        'Arbuscular mycorrhizal fungi improved fruit quality and plant biomass in the greenhouse.',
        'Root colonization was assessed after {N} weeks in sterilized substrate.',
        'The inoculum increased tolerance of the seedlings to salinity.'] },
    maizeFert: { hard: true,
      titles: ['Maize grain yield response to nitrogen and phosphorus fertilization in {P}',
        'Optimizing fertilizer rates for maize yield in smallholder fields',
        'Site-specific nutrient management increases maize productivity in {P}'],
      sent: ['Maize grain yield increased with nitrogen rate up to {N} kg per hectare.',
        'Field trials in {P} tested phosphorus and nitrogen fertilizer rates on maize.',
        'Grain yield of maize responded strongly to phosphorus fertilization in low-phosphorus soils.',
        'The field experiment followed a randomized complete block design over {Y} seasons.',
        'Fertilizer use efficiency of maize differed among sites and seasons.'] },
    maizePath: { hard: true,
      titles: ['Fusarium ear rot of maize: incidence and mycotoxin contamination in {P}',
        'Fungal pathogens associated with maize stalk rot in {P}',
        'Biological control of maize ear rot with antagonistic fungi'],
      sent: ['Fungal pathogens reduced maize grain yield in infected fields.',
        'Ear rot incidence and fumonisin levels were recorded in maize fields of {P}.',
        'Fungal isolates were identified from infected maize stalks and grain.',
        'Seed treatment with antagonistic fungi reduced disease severity in maize.',
        'Grain yield losses caused by the disease reached {X} %.'] },
    rhizo: {
      titles: ['Rhizobium inoculation and nodulation of common bean in {P}',
        'Plant growth-promoting rhizobacteria increase soybean yield',
        'Biofertilizers based on nitrogen-fixing bacteria in legume crops'],
      sent: ['Bean seeds were inoculated with rhizobia and nodulation was recorded.',
        'Nitrogen fixation of soybean increased with bacterial inoculation.',
        'Biofertilizer inoculation increased legume grain yield by {X} %.',
        'Plant growth-promoting bacteria improved root growth of the seedlings.'] },
    biochar: {
      titles: ['Biochar amendment and soil organic carbon in tropical soils',
        'Long-term effects of biochar on soil properties in {P}'],
      sent: ['Biochar application increased soil organic carbon and pH.',
        'Soil bulk density decreased after biochar amendment.',
        'Cation exchange capacity of the soil increased with biochar rate.',
        'Carbon sequestration was estimated over {Y} years.'] },
    wheatDrought: {
      titles: ['Drought tolerance of wheat genotypes in {P}',
        'Physiological traits associated with drought tolerance in durum wheat'],
      sent: ['Wheat genotypes were evaluated under drought stress and irrigation.',
        'Canopy temperature and chlorophyll content were associated with drought tolerance.',
        'Grain yield of wheat under drought decreased by {X} %.',
        'Genotypic variation for drought tolerance was large among lines.'] },
    microbiome: {
      titles: ['Soil microbial diversity under contrasting tillage systems',
        'Metagenomic profiling of the rhizosphere microbiome in {P}'],
      sent: ['Soil bacterial and fungal communities were profiled by amplicon sequencing.',
        'Microbial diversity was higher under conservation tillage.',
        'The rhizosphere microbiome differed between crop rotations.',
        'Fungal community composition was related to soil pH and organic carbon.'] },
  };
  const FUNGI = ['Rhizophagus irregularis', 'Funneliformis mosseae', 'Glomus intraradices', 'a commercial AMF consortium', 'native mycorrhizal fungi'];
  const GENERIC = ['The results are discussed in relation to sustainable intensification.',
    'Treatment effects were analysed by analysis of variance.',
    'Significant differences were found among treatments.',
    'These findings have implications for smallholder farmers.',
    'Further research is needed to confirm these results under other conditions.',
    'Data were collected over {Y} consecutive seasons.'];
  const JOURNALS = ['Journal of Field Agronomy', 'Soil Biology Letters', 'Crop Science Reports', 'Plant and Soil Research', 'Applied Soil Ecology Notes', 'Agronomy for Development'];

  function fill(s, r) {
    return s.replace(/\{P\}/g, () => PLACES[Math.floor(r() * PLACES.length)])
      .replace(/\{F\}/g, () => FUNGI[Math.floor(r() * FUNGI.length)])
      .replace(/\{N\}/g, () => String(2 + Math.floor(r() * 18)))
      .replace(/\{Y\}/g, () => String(2 + Math.floor(r() * 3)))
      .replace(/\{X\}/g, () => String(5 + Math.floor(r() * 30)));
  }
  const pick = (a, r) => a[Math.floor(r() * a.length)];

  /* opts = {n, prevalence, difficulty: 0 (easy) … 1 (hard)} */
  function corpus(opts, seed) {
    const o = Object.assign({ n: 1000, prevalence: 0.04, difficulty: 0.5 }, opts || {});
    const r = rng(seed == null ? 7 : seed);
    const neg = Object.keys(TOPICS).filter(k => k !== 'rel');
    const recs = [];
    const nRel = Math.max(2, Math.round(o.n * o.prevalence));
    for (let i = 0; i < o.n; i++) {
      const isRel = i < nRel;
      let topic;
      if (isRel) topic = 'rel';
      else {
        /* the harder the pile, the more of its irrelevant records are close neighbours */
        const hardShare = 0.25 + 0.5 * o.difficulty;
        const pool = neg.filter(k => (TOPICS[k].hard ? r() < hardShare : r() >= hardShare));
        topic = pool.length ? pick(pool, r) : pick(neg, r);
      }
      const T = TOPICS[topic];
      const nS = 4 + Math.floor(r() * 3);
      const sents = [];
      const HARD = ['amfVeg', 'maizeFert', 'maizePath'];
      /* A "subtle" relevant record reports the inoculation only in passing, inside
         a study framed as something else (a fertilizer trial with an inoculated
         treatment); a "near miss" is a neighbour that uses the relevant words
         but fails a criterion (pots, not field; a review of trials). These are
         the records that make real screening hard. */
      const subtle = isRel && r() < 0.3 * o.difficulty;
      const nearMiss = !isRel && T.hard && r() < 0.2 * o.difficulty;
      let title = fill(pick(T.titles, r), r);
      if (subtle) {
        const host = TOPICS[pick(HARD, r)];
        if (r() < 0.6) title = fill(pick(host.titles, r), r);
        sents.push(fill(pick(TOPICS.rel.sent, r), r), fill(pick(TOPICS.rel.sent, r), r));
        for (let s = 2; s < nS; s++) sents.push(fill(pick(r() > 0.8 ? GENERIC : host.sent, r), r));
        shuffle(sents, r);
      } else {
        for (let s = 0; s < nS; s++) {
          const u = r();
          /* a relevant record borrows neighbour sentences, a neighbour borrows relevant ones */
          if (isRel && u < 0.3 * o.difficulty) sents.push(fill(pick(TOPICS[pick(HARD, r)].sent, r), r));
          else if (!isRel && T.hard && u < (nearMiss ? 0.35 : 0.08) * o.difficulty) sents.push(fill(pick(TOPICS.rel.sent, r), r));
          else if (u > 0.82) sents.push(fill(pick(GENERIC, r), r));
          else sents.push(fill(pick(T.sent, r), r));
        }
      }
      recs.push({ title, abstract: sents.join(' '), topic, label: isRel ? 1 : 0, subtle, nearMiss,
        year: 2000 + Math.floor(r() * 26), journal: pick(JOURNALS, r) });
    }
    shuffle(recs, r);
    recs.forEach((x, i) => { x.id = i + 1; });
    return recs;
  }

  /* The PRISMA 2020 counts of a simulated review: records from three sources
     with overlap, duplicates removed, title/abstract screening stopped by a
     rule, and a full-text stage that excludes part of what passed. */
  function prismaCounts(sim, recs, stopAt, opts, seed) {
    const o = Object.assign({ dupRate: 0.22, ftExclude: 0.45, notRetrieved: 0.04 }, opts || {});
    const r = rng(seed == null ? 11 : seed);
    const N = sim.N;
    const dup = Math.round(N * o.dupRate / (1 - o.dupRate));
    const total = N + dup;
    const s1 = Math.round(total * 0.46), s2 = Math.round(total * 0.34), s3 = total - s1 - s2;
    const screened = stopAt;
    let flagged = 0;
    for (let k = 0; k < stopAt; k++) flagged += recs[sim.order[k]].label;
    const notScreened = N - stopAt;
    const excludedTA = screened - flagged;
    const notRet = Math.round(flagged * o.notRetrieved);
    const assessed = flagged - notRet;
    const reasons = { outcome: 0, design: 0, data: 0 };
    let included = 0;
    for (let q = 0; q < assessed; q++) {
      if (r() < o.ftExclude) { const u = r(); reasons[u < 0.4 ? 'outcome' : u < 0.75 ? 'design' : 'data']++; }
      else included++;
    }
    return { sources: [s1, s2, s3], total, dup, N, screened, notScreened, excludedTA, sought: flagged, notRet, assessed, reasons, included,
      missed: sim.nRel - flagged };
  }

  Object.assign(Screen, { STOP, tokenize, stem, tfidf, NB, simulate, shuffle, screenedAt, wss, rrf, atd, stopConsecutive, stopKnee, kneeAt, corpus, prismaCounts, TOPICS });
  window.Screen = Screen;
})();
