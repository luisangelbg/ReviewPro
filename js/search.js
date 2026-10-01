/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 3 engine, part 1: the search strategy.

   A search is built as CONCEPT BLOCKS: each block gathers the synonyms of one
   element of the question (the population, the intervention, the outcome),
   joined with OR; the blocks are joined with AND; an optional block of
   exclusions is subtracted with NOT. The comparator is usually NOT a block:
   studies seldom name their control in the title or abstract.

   The same blocks are written in the syntax of each kind of bibliographic
   database. The syntaxes are described by their form, not by a product:
     func    — a field function around the terms:     TITLE-ABS-KEY(a OR "b c")
     tag     — a field tag with an equals sign:        TS=(a OR "b c")
     bracket — a field tag in brackets after a term:   a[tiab] OR "b c"[tiab]
     suffix  — numbered lines with a field suffix:     1 (a or b c).ti,ab,kw.
     plain   — no fields and no truncation, for general academic search engines
   Terms support truncation (*) and a single-character wildcard (?).

   The strategy can also be RUN against the imported records: this tells how
   many records each block and the whole string retrieve, and whether the
   string finds the known relevant studies the team listed beforehand (a
   check of sensitivity recommended for every search). */

const Search = {};

(function () {
  const has = s => typeof s === 'string' && s.trim().length > 0;

  const DIALECTS = {
    func: { n: ['Función de campo', 'Field function'], ex: 'TITLE-ABS-KEY(maize OR "zea mays")' },
    tag: { n: ['Etiqueta con igual', 'Tag with equals sign'], ex: 'TS=(maize OR "zea mays")' },
    bracket: { n: ['Etiqueta entre corchetes', 'Bracketed tag'], ex: 'maize[tiab] OR "zea mays"[tiab]' },
    suffix: { n: ['Líneas numeradas con sufijo', 'Numbered lines with suffix'], ex: '1 (maize or zea mays).ti,ab,kw.' },
    plain: { n: ['Sin campos (buscador académico general)', 'No fields (general academic search engine)'], ex: 'maize OR "zea mays"' },
  };
  const FIELDS = {
    tiab: ['Título, resumen y palabras clave', 'Title, abstract and keywords'],
    ti: ['Solo título', 'Title only'],
    all: ['Todos los campos', 'All fields'],
  };
  const FIELD_CODE = {
    func: { tiab: 'TITLE-ABS-KEY', ti: 'TITLE', all: 'ALL' },
    tag: { tiab: 'TS', ti: 'TI', all: 'ALL' },
    bracket: { tiab: 'tiab', ti: 'ti', all: 'all' },
    suffix: { tiab: 'ti,ab,kw', ti: 'ti', all: 'mp' },
  };

  /* ---------- terms ---------- */
  const clean = t => String(t || '').trim().replace(/\s+/g, ' ').replace(/^"+|"+$/g, '');
  const isPhrase = t => /\s|-/.test(clean(t));
  function termOut(t, dialect) {
    let s = clean(t);
    if (dialect === 'plain') s = s.replace(/[*?]/g, '');
    if (dialect === 'suffix') return s;                  // phrases need no quotes on numbered-line interfaces
    return isPhrase(s) ? `"${s}"` : s;
  }
  const activeTerms = b => (b.terms || []).filter(x => x.on !== false && has(x.t)).map(x => clean(x.t));

  /* ---------- writing a strategy ----------
     s = {blocks: [{name, field, terms: [{t, on}]}], not: {terms, field}} */
  function write(s, dialect) {
    const blocks = (s.blocks || []).filter(b => activeTerms(b).length);
    const notTerms = s.not ? activeTerms(s.not) : [];
    if (!blocks.length) return '';
    if (dialect === 'suffix') {
      const lines = [];
      blocks.forEach(b => lines.push(`(${activeTerms(b).map(t => termOut(t, dialect)).join(' or ')}).${FIELD_CODE.suffix[b.field || 'tiab']}.`));
      const n = lines.length;
      if (n > 1) lines.push(Array.from({ length: n }, (_, i) => i + 1).join(' and '));
      if (notTerms.length) {
        lines.push(`(${notTerms.map(t => termOut(t, dialect)).join(' or ')}).${FIELD_CODE.suffix[s.not.field || 'tiab']}.`);
        lines.push(`${n > 1 ? n + 1 : 1} not ${lines.length}`);
      }
      return lines.map((l, i) => `${i + 1} ${l}`).join('\n');
    }
    const group = (terms, field) => {
      const ts = terms.map(t => termOut(t, dialect));
      if (dialect === 'func') return `${FIELD_CODE.func[field || 'tiab']}(${ts.join(' OR ')})`;
      if (dialect === 'tag') return `${FIELD_CODE.tag[field || 'tiab']}=(${ts.join(' OR ')})`;
      if (dialect === 'bracket') { const c = FIELD_CODE.bracket[field || 'tiab']; return `(${ts.map(t => `${t}[${c}]`).join(' OR ')})`; }
      return ts.length > 1 ? `(${ts.join(' OR ')})` : ts[0];
    };
    let q = blocks.map(b => group(activeTerms(b), b.field)).join(' AND ');
    if (notTerms.length) {
      if (dialect === 'plain') q += ' ' + notTerms.map(t => '-' + termOut(t, dialect)).join(' ');
      else q = `${blocks.length > 1 ? '(' + q + ')' : q} ${dialect === 'func' ? 'AND NOT' : 'NOT'} ${group(notTerms, s.not.field)}`;
    }
    return q;
  }

  /* ---------- checks ---------- */
  function check(s, dialect) {
    const out = [];
    const blocks = s.blocks || [];
    if (!blocks.length) out.push({ level: 'bad', msg: ['No hay bloques de conceptos.', 'There are no concept blocks.'] });
    blocks.forEach((b, i) => {
      const ts = activeTerms(b), name = b.name || `#${i + 1}`;
      if (!ts.length) out.push({ level: 'bad', msg: [`El bloque «${name}» no tiene términos activos.`, `Block "${name}" has no active terms.`] });
      if (ts.length === 1) out.push({ level: 'warn', msg: [`El bloque «${name}» tiene un solo término: agrega sinónimos, variantes ortográficas y nombres científicos.`, `Block "${name}" has a single term: add synonyms, spelling variants and scientific names.`] });
      ts.forEach(t => {
        const m = /^([^*?]*)\*/.exec(t);
        if (m && m[1].replace(/\s/g, '').length < 4) out.push({ level: 'warn', msg: [`«${t}» trunca con menos de 4 letras: traerá miles de palabras que no quieres.`, `"${t}" truncates with fewer than 4 letters: it will bring thousands of words you do not want.`] });
        if (/\b(AND|OR|NOT)\b/.test(t)) out.push({ level: 'bad', msg: [`«${t}» contiene un operador; cada término va en su propia casilla.`, `"${t}" contains an operator; each term goes in its own box.`] });
        if (/[()"]/.test(t)) out.push({ level: 'warn', msg: [`«${t}» lleva paréntesis o comillas: la app los pone sola.`, `"${t}" carries brackets or quotes: the app adds them itself.`] });
      });
      /* redundancy: a term already covered by a truncated sibling */
      ts.forEach(t => ts.forEach(u => {
        if (t !== u && /\*$/.test(u) && !/\*/.test(t) && t.toLowerCase().startsWith(u.slice(0, -1).toLowerCase())) out.push({ level: 'info', msg: [`«${t}» ya queda cubierto por «${u}».`, `"${t}" is already covered by "${u}".`] });
      }));
      const seen = new Set();
      ts.forEach(t => { const k = t.toLowerCase(); if (seen.has(k)) out.push({ level: 'info', msg: [`«${t}» está repetido en «${name}».`, `"${t}" is repeated in "${name}".`] }); seen.add(k); });
    });
    if (dialect === 'plain') {
      if (blocks.some(b => activeTerms(b).some(t => /[*?]/.test(t)))) out.push({ level: 'warn', msg: ['Los buscadores académicos generales no truncan: se quitó el asterisco. Escribe a mano las variantes que importen (singular y plural).', 'General academic search engines do not truncate: the asterisk was removed. Write out the variants that matter (singular and plural).'] });
      const len = write(s, 'plain').length;
      if (len > 256) out.push({ level: 'warn', msg: [`La cadena tiene ${len} caracteres; los buscadores generales suelen cortar alrededor de 256. Divídela en varias búsquedas.`, `The string has ${len} characters; general engines usually cut at about 256. Split it into several searches.`] });
    }
    return out;
  }

  /* ---------- running the strategy on records ---------- */
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‐-―]/g, '-');
  function termRegex(t) {
    const words = norm(clean(t)).split(/[\s-]+/).filter(Boolean).map(w => w.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9]*').replace(/\?/g, '[a-z0-9]'));
    return new RegExp(`(^|[^a-z0-9])${words.join('[\\s-]+')}(?![a-z0-9])`);
  }
  const recText = (r, field) => norm(field === 'ti' ? r.title : [r.title, r.abstract, (r.keywords || []).join('; ')].join(' \n '));
  function compile(s) {
    const blocks = (s.blocks || []).filter(b => activeTerms(b).length).map(b => ({ field: b.field || 'tiab', res: activeTerms(b).map(termRegex) }));
    const not = s.not && activeTerms(s.not).length ? { field: s.not.field || 'tiab', res: activeTerms(s.not).map(termRegex) } : null;
    return { blocks, not };
  }
  const hit = (b, r) => b.res.some(re => re.test(recText(r, b.field)));
  function matches(s, r, compiled) {
    const c = compiled || compile(s);
    if (!c.blocks.length) return false;
    return c.blocks.every(b => hit(b, r)) && !(c.not && hit(c.not, r));
  }
  /* counts: how many records each block, each term and the whole string retrieve */
  function run(s, records) {
    const c = compile(s);
    const perBlock = c.blocks.map(() => 0), all = [];
    records.forEach((r, i) => {
      const hits = c.blocks.map(b => hit(b, r));
      hits.forEach((h, k) => { if (h) perBlock[k]++; });
      if (hits.length && hits.every(Boolean) && !(c.not && hit(c.not, r))) all.push(i);
    });
    return { perBlock, total: all.length, idx: all };
  }
  /* the known relevant studies ("gold set"): each given by DOI or title */
  function goldCheck(s, records, gold) {
    const c = compile(s);
    const normT = t => norm(t).replace(/[^a-z0-9]+/g, ' ').trim();
    return gold.filter(g => has(g.doi) || has(g.title)).map(g => {
      const doi = has(g.doi) ? g.doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim() : '';
      const r = records.find(x => (doi && x.doi === doi) || (has(g.title) && normT(x.title) === normT(g.title)));
      if (!r) return { g, found: false, retrieved: null };
      const blocks = c.blocks.map(b => hit(b, r));
      return { g, found: true, retrieved: blocks.every(Boolean) && !(c.not && hit(c.not, r)), failing: blocks.map((h, i) => (h ? null : i)).filter(x => x !== null), rec: r };
    });
  }

  /* blocks proposed from the protocol's question: one per searched element */
  const SEARCHED = { PICO: ['P', 'I', 'O'], PICOS: ['P', 'I', 'O'], PECO: ['P', 'E', 'O'], PCC: ['P', 'Co', 'Cx'], SPIDER: ['S', 'PI'], FREE: [] };
  const STOP = new Set('de del la las el los en con sin por para y o a al un una sobre frente entre the of and in on with without for by to from an a its their'.split(' '));
  function seedBlocks(p) {
    if (!p || !Protocol.FRAMEWORKS[p.framework]) return [];
    const F = Protocol.FRAMEWORKS[p.framework];
    return (SEARCHED[p.framework] || []).filter(k => has((p.elements || {})[k])).map(k => {
      const e = F.el.find(x => x.k === k);
      const txt = clean(p.elements[k]).replace(/\([^)]*\)/g, ' ');
      const words = txt.toLowerCase().split(/[\s,;/]+/).filter(w => w.length > 3 && !STOP.has(w));
      return { name: e.t[0], facet: k, field: 'tiab', terms: words.slice(0, 6).map(w => ({ t: w, on: true })) };
    });
  }

  Object.assign(Search, { DIALECTS, FIELDS, FIELD_CODE, SEARCHED, clean, isPhrase, termOut, activeTerms, write, check, norm, termRegex, compile, matches, run, goldCheck, seedBlocks });
  window.Search = Search;
})();
