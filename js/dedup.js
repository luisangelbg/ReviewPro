/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 3 engine, part 3: finding the same study twice.

   The same article arrives from several databases with small differences:
   capitals, a subtitle after a colon or a dash, "&" for "and", accents lost,
   a missing DOI, a year one apart (online first vs. print). Rules:
     certain  — same DOI; or the same normalized title with compatible year
                (±1) and compatible first author (same surname, or one missing).
     probable — titles at least 90 % alike by character bigrams (Dice) with
                compatible year; or identical titles whose year or first author
                disagree. A person decides every probable pair.
     none     — anything else, including two different DOIs.
   Merging is conservative: a probable pair stays as two records until a
   reviewer confirms it; a missed duplicate is caught later at screening, a
   wrong merge loses a study for ever.

   Only pairs that share a blocking key are compared (the DOI, the first
   sixteen characters of the title, first author + year, and the three
   longest words of the title), so thousands of records dedupe in a moment. */

const Dedup = {};

(function () {
  const STOPLEAD = /^(the|a|an|el|la|los|las|un|una)\s+/;
  function normTitle(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(STOPLEAD, '');
  }
  function firstAuthor(r) {
    const a = (r.authors || [])[0];
    if (!a) return '';
    const s = a.includes(',') ? a.split(',')[0] : a.trim().split(/\s+/).slice(-1)[0];
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  }
  function bigrams(s) {
    const m = new Map(), t = s.replace(/ /g, '');
    for (let i = 0; i < t.length - 1; i++) { const g = t.substr(i, 2); m.set(g, (m.get(g) || 0) + 1); }
    return m;
  }
  /* Sørensen–Dice coefficient on character bigrams (with multiplicity) */
  function dice(a, b, A0, B0) {
    if (a === b) return 1;
    const A = A0 || bigrams(a), B = B0 || bigrams(b);
    let na = 0, nb = 0, inter = 0;
    A.forEach(v => { na += v; }); B.forEach(v => { nb += v; });
    A.forEach((v, g) => { if (B.has(g)) inter += Math.min(v, B.get(g)); });
    return na + nb ? 2 * inter / (na + nb) : 0;
  }
  const yearOk = (a, b) => !a || !b || Math.abs(a - b) <= 1;
  const authOk = (a, b) => !a || !b || a === b;

  /* the verdict on one pair, with the reason shown to the reviewer */
  function compare(r, s, opts) {
    const o = Object.assign({ threshold: 0.9 }, opts || {});
    if (r.doi && s.doi) {
      if (r.doi === s.doi) return { kind: 'certain', reason: 'doi', sim: 1 };
    }
    const ta = r._nt != null ? r._nt : normTitle(r.title), tb = s._nt != null ? s._nt : normTitle(s.title);
    if (!ta || !tb) return { kind: 'none', sim: 0 };
    const fa = r._fa != null ? r._fa : firstAuthor(r), fb = s._fa != null ? s._fa : firstAuthor(s);
    const differentDois = r.doi && s.doi && r.doi !== s.doi;
    if (ta === tb) {
      if (!differentDois && yearOk(r.year, s.year) && authOk(fa, fb)) return { kind: 'certain', reason: 'title', sim: 1 };
      return { kind: 'probable', reason: differentDois ? 'title-doi' : !yearOk(r.year, s.year) ? 'title-year' : 'title-author', sim: 1 };
    }
    if (differentDois) return { kind: 'none', sim: 0 };
    /* a cheap length screen before the bigrams: Dice ≥ t needs lengths within a factor */
    const la = ta.length, lb = tb.length;
    if (Math.min(la, lb) / Math.max(la, lb) < o.threshold * 0.8) return { kind: 'none', sim: 0 };
    const sim = dice(ta, tb, r._bg, s._bg);
    if (sim >= o.threshold && yearOk(r.year, s.year)) return { kind: 'probable', reason: 'similar', sim };
    return { kind: 'none', sim };
  }

  function keys(r) {
    const k = [];
    if (r.doi) k.push('d:' + r.doi);
    const t = r._nt;
    if (t) {
      k.push('t:' + t.slice(0, 16));
      const long = t.split(' ').filter(w => w.length > 3).sort((a, b) => b.length - a.length || (a < b ? -1 : 1)).slice(0, 3).sort().join(' ');
      if (long) k.push('w:' + long);
    }
    if (r._fa && r.year) k.push('a:' + r._fa + r.year);
    return k;
  }
  const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

  /* recs: records with a unique `uid`. decisions: {pairKey: 'dup' | 'not'}.
     Returns the pairs found, the clusters and the list of unique records. */
  function run(recs, decisions, opts) {
    const dec = decisions || {};
    recs.forEach(r => { r._nt = normTitle(r.title); r._fa = firstAuthor(r); r._bg = bigrams(r._nt); });
    const buckets = new Map();
    recs.forEach((r, i) => keys(r).forEach(k => { if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(i); }));
    const seen = new Set(), pairs = [];
    buckets.forEach(list => {
      if (list.length < 2 || list.length > 400) return;
      for (let x = 0; x < list.length; x++) for (let y = x + 1; y < list.length; y++) {
        const i = list[x], j = list[y], pk = i < j ? i + ':' + j : j + ':' + i;
        if (seen.has(pk)) continue;
        seen.add(pk);
        const v = compare(recs[i], recs[j], opts);
        if (v.kind !== 'none') pairs.push({ i: Math.min(i, j), j: Math.max(i, j), kind: v.kind, reason: v.reason, sim: v.sim, key: pairKey(recs[i].uid, recs[j].uid) });
      }
    });
    /* union–find over the certain pairs and the probable ones a person confirmed */
    const parent = recs.map((_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    pairs.forEach(p => {
      const d = dec[p.key];
      p.decision = d || (p.kind === 'certain' ? 'auto' : null);
      if (d === 'not') return;
      if (p.kind === 'certain' || d === 'dup') { const a = find(p.i), b = find(p.j); if (a !== b) parent[Math.max(a, b)] = Math.min(a, b); }
    });
    const groups = new Map();
    recs.forEach((r, i) => { const g = find(i); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(i); });
    const clusters = [...groups.values()];
    const unique = clusters.map(idx => merge(idx.map(i => recs[i])));
    recs.forEach(r => { delete r._nt; delete r._fa; delete r._bg; });
    const pending = pairs.filter(p => p.kind === 'probable' && !dec[p.key]);
    return { pairs, clusters, unique, removed: recs.length - unique.length, pending: pending.length,
      certain: pairs.filter(p => p.kind === 'certain').length, probable: pairs.filter(p => p.kind === 'probable').length };
  }

  /* the most complete record leads; the others fill its gaps */
  const completeness = r => (r.abstract ? 3 : 0) + (r.doi ? 2 : 0) + (r.keywords && r.keywords.length ? 1 : 0) + (r.authors && r.authors.length ? 1 : 0) + (r.journal ? 1 : 0) + (r.year ? 1 : 0);
  function merge(group) {
    const sorted = group.slice().sort((a, b) => completeness(b) - completeness(a) || (a.order || 0) - (b.order || 0));
    const out = Object.assign({}, sorted[0]);
    ['title', 'year', 'journal', 'volume', 'issue', 'pages', 'doi', 'abstract', 'url', 'language'].forEach(k => { if (!out[k]) { const d = sorted.find(r => r[k]); if (d) out[k] = d[k]; } });
    if (!out.authors || !out.authors.length) { const d = sorted.find(r => r.authors && r.authors.length); if (d) out.authors = d.authors.slice(); }
    const kw = [];
    sorted.forEach(r => (r.keywords || []).forEach(k => { if (!kw.some(x => x.toLowerCase() === k.toLowerCase())) kw.push(k); }));
    out.keywords = kw;
    out.uids = group.map(r => r.uid);
    out.srcs = [...new Set(group.map(r => r.src))];
    delete out._nt; delete out._fa; delete out._bg;
    return out;
  }

  Object.assign(Dedup, { normTitle, firstAuthor, dice, compare, keys, pairKey, run, merge, completeness });
  window.Dedup = Dedup;
})();
