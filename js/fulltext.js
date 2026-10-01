/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 5 engine: full texts, eligibility and the PRISMA flow.

   1. Retrieval: each report sent to full text is pending, retrieved or not
      retrieved; the PDF stays on the user's computer and the app keeps only
      its path. A file name is suggested (First-author_Year_Short-title.pdf)
      so the folder stays in order.
   2. Eligibility: include, or exclude WITH a reason (PRISMA 2020 asks for
      the reasons at this stage). With two reviewers the same statuses as in
      screening apply: agreed, conflict, waiting, resolved.
   3. Reports and studies: PRISMA 2020 counts studies and their reports
      apart; a report can be linked to the study of another report.
   4. The flow: every record carries its pathway (databases and registers, or
      other methods: websites, organizations, citation searching) and its
      fate at each stage; the counts of the diagram are sums over records,
      so they always add up. Page et al. (2021) for PRISMA 2020; Tricco et al.
      (2018) for the PRISMA-ScR vocabulary ("sources of evidence"). */

const FullText = {};

(function () {
  const has = s => typeof s === 'string' && s.trim().length > 0;

  /* ---------- file names and paths ---------- */
  function fileName(r) {
    const a = (r.authors || [])[0] || 'Anon';
    const sur = (a.includes(',') ? a.split(',')[0] : a.split(/\s+/).slice(-1)[0]).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '');
    const words = String(r.title || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 3).slice(0, 4);
    return `${sur || 'Anon'}_${r.year || 'sf'}_${words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('') || 'Informe'}.pdf`;
  }
  /* a path typed by the user as a file: URL (Windows, macOS and Linux paths) */
  function fileUrl(path, base) {
    let p = String(path || '').trim().replace(/^"+|"+$/g, '');
    if (!p) return '';
    if (/^(file|https?):\/\//i.test(p)) return p;
    const isAbs = /^[A-Za-z]:[\\/]/.test(p) || p.startsWith('/') || p.startsWith('\\\\');
    if (!isAbs && has(base)) p = String(base).replace(/[\\/]+$/, '') + '/' + p;
    p = p.replace(/\\/g, '/');
    if (p.startsWith('//')) return 'file:' + encodeURI(p);
    if (/^[A-Za-z]:\//.test(p)) return 'file:///' + encodeURI(p);
    if (p.startsWith('/')) return 'file://' + encodeURI(p);
    return '';
  }

  /* ---------- eligibility status (like screening, two categories) ---------- */
  function status(key, decisions, reviewers, final, required) {
    if (final && final[key]) return { s: 'final', d: final[key].d, reason: final[key].reason };
    const ds = reviewers.map(r => (decisions[r] || {})[key]).filter(Boolean);
    if (!ds.length) return { s: 'pending' };
    const kinds = [...new Set(ds.map(d => d.d))];
    if (kinds.length > 1) return { s: 'conflict', ds };
    const need = Math.max(1, Math.min(required || 1, reviewers.length));
    if (ds.length < need) return { s: 'partial', d: kinds[0] };
    const reasons = [...new Set(ds.map(d => d.reason).filter(Boolean))];
    return { s: 'agreed', d: kinds[0], reason: reasons[0] || '', reasons };
  }

  /* ---------- studies: union of linked reports ---------- */
  function studies(keys, links) {
    const parent = new Map(keys.map(k => [k, k]));
    const find = k => { let x = k; while (parent.get(x) !== x) x = parent.get(x); return x; };
    Object.entries(links || {}).forEach(([k, to]) => { if (parent.has(k) && parent.has(to)) { const a = find(k), b = find(to); if (a !== b) parent.set(a, b); } });
    const groups = new Map();
    keys.forEach(k => { const g = find(k); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(k); });
    return [...groups.values()];
  }

  /* ---------- the PRISMA flow ----------
     recs: [{key, pathway: 'db'|'other', screen: status of Block 4 (s, d, reason),
             retrieval: 'pending'|'retrieved'|'not', ft: status of Block 5}]
     ident: {db: {source: n, …}, other: {source: n, …}}  — records identified
     links: {reportKey: otherReportKey} */
  function flow(recs, ident, links) {
    const side = p => {
      const R = recs.filter(r => r.pathway === p);
      const idn = ident[p] || {};
      const identified = Object.values(idn).reduce((a, b) => a + b, 0);
      const c = { sources: idn, identified, unique: R.length, duplicates: Math.max(0, identified - R.length),
        screened: 0, excludedTA: 0, taReasons: {}, unread: 0, pendingTA: 0, sought: 0, notRetrieved: 0, awaiting: 0,
        assessed: 0, excludedFT: 0, ftReasons: {}, pendingFT: 0, includedReports: 0, directToFT: 0 };
      R.forEach(r => {
        const sc = r.screen || { s: 'pending' };
        const decided = sc.s === 'agreed' || sc.s === 'final';
        if (sc.s === 'unread') { c.unread++; return; }
        if (!decided) { c.pendingTA++; return; }
        if (r.direct) c.directToFT++; else c.screened++;
        if (sc.d === 'exc') { c.excludedTA++; const k = sc.reason || '—'; c.taReasons[k] = (c.taReasons[k] || 0) + 1; return; }
        c.sought++;
        if (r.retrieval === 'not') { c.notRetrieved++; return; }
        if (r.retrieval !== 'retrieved') { c.awaiting++; return; }
        c.assessed++;
        const ft = r.ft || { s: 'pending' };
        if (ft.s !== 'agreed' && ft.s !== 'final') { c.pendingFT++; return; }
        if (ft.d === 'exc') { c.excludedFT++; const k = ft.reason || '—'; c.ftReasons[k] = (c.ftReasons[k] || 0) + 1; return; }
        c.includedReports++;
      });
      return c;
    };
    const db = side('db'), other = side('other');
    const incKeys = recs.filter(r => (r.screen && (r.screen.s === 'agreed' || r.screen.s === 'final') && r.screen.d !== 'exc') && r.retrieval === 'retrieved' && r.ft && (r.ft.s === 'agreed' || r.ft.s === 'final') && r.ft.d === 'inc').map(r => r.key);
    const groups = studies(incKeys, links);
    const pending = db.pendingTA + other.pendingTA + db.awaiting + other.awaiting + db.pendingFT + other.pendingFT;
    return { db, other, includedReports: incKeys.length, includedStudies: groups.length, groups, pending, complete: pending === 0 };
  }

  /* ---------- a diagram as data: boxes and arrows, drawn by the block ---------- */
  function checks(f) {
    const out = [];
    [['db', ['bases de datos', 'databases']], ['other', ['otros métodos', 'other methods']]].forEach(([k, n]) => {
      const c = f[k];
      if (!c.identified && !c.unique) return;
      const left = c.screened + c.directToFT + c.unread + c.pendingTA;
      if (left !== c.unique) out.push({ level: 'bad', msg: [`La vía de ${n[0]} no cuadra (${left} ≠ ${c.unique}).`, `The ${n[1]} pathway does not add up (${left} ≠ ${c.unique}).`] });
      if (c.pendingTA) out.push({ level: 'warn', msg: [`${c.pendingTA} registros de ${n[0]} siguen sin decisión final en el cribado (Bloque 4).`, `${c.pendingTA} records from ${n[1]} still lack a final screening decision (Block 4).`] });
      if (c.awaiting) out.push({ level: 'warn', msg: [`${c.awaiting} informes de ${n[0]} aún no se consiguen ni se dan por perdidos.`, `${c.awaiting} reports from ${n[1]} are neither retrieved nor given up yet.`] });
      if (c.pendingFT) out.push({ level: 'warn', msg: [`${c.pendingFT} informes de ${n[0]} esperan la evaluación de texto completo o tienen un conflicto.`, `${c.pendingFT} reports from ${n[1]} await full-text assessment or have a conflict.`] });
      if (c.ftReasons['—']) out.push({ level: 'bad', msg: [`${c.ftReasons['—']} exclusiones de texto completo sin motivo: PRISMA 2020 pide los motivos.`, `${c.ftReasons['—']} full-text exclusions without a reason: PRISMA 2020 asks for the reasons.`] });
    });
    return out;
  }

  Object.assign(FullText, { fileName, fileUrl, status, studies, flow, checks });
  window.FullText = FullText;
})();
