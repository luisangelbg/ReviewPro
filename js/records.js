/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 3 engine, part 2: reading and writing bibliographic records.

   Every bibliographic database exports in one of a handful of formats. They
   are read here into one record shape:
     {title, authors: ['Surname, Given', …], year, journal, volume, issue,
      pages, doi, abstract, keywords: […], url, language, type, accession}
   Formats, described by their form:
     ris      — "TY  - JOUR" … "ER  -" two-letter tags (the reference-manager
                interchange format)
     bib      — BibTeX entries @article{key, title = {…}, …}, LaTeX accents
                translated
     tagged   — two-letter tags at the start of the line, continuation lines
                indented three spaces, "ER" closing each record (the plain-text
                export of citation indexes)
     medline  — four-character tags "PMID- ", "TI  - ", continuation lines
                indented six spaces
     enw      — "%T", "%A" percent tags (the refer format)
     csv/tsv  — a table with a header row; the columns are recognized by name
                in English and Spanish
   Nothing is sent anywhere: files are read with the browser's File API. */

const Records = {};

(function () {
  const has = s => typeof s === 'string' && s.trim().length > 0;
  const trim = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

  /* ---------- small normalizers ---------- */
  function normDoi(s) {
    let d = trim(s).toLowerCase();
    if (!d) return '';
    d = d.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '').replace(/^doi:\s*/, '').replace(/\s*\[doi\]$/, '').replace(/[.,;]+$/, '');
    const m = /10\.\d{4,9}\/\S+/.exec(d);
    return m ? m[0] : '';
  }
  const year = s => { const m = /(1[5-9]\d\d|20\d\d)/.exec(String(s || '')); return m ? +m[1] : ''; };
  const cleanTitle = s => trim(s).replace(/\.$/, '').replace(/^\[(.*)\]$/, '$1');
  function splitKeywords(list) {
    const out = [];
    (Array.isArray(list) ? list : [list]).forEach(k => String(k || '').split(/\s*[;|]\s*/).forEach(x => { x = trim(x); if (x && !out.some(y => y.toLowerCase() === x.toLowerCase())) out.push(x); }));
    return out;
  }
  function blank() { return { title: '', authors: [], year: '', journal: '', volume: '', issue: '', pages: '', doi: '', abstract: '', keywords: [], url: '', language: '', type: '', accession: '' }; }
  function finish(r) {
    r.title = cleanTitle(r.title);
    r.authors = (r.authors || []).map(trim).filter(Boolean);
    r.year = year(r.year);
    r.doi = normDoi(r.doi);
    r.abstract = trim(r.abstract);
    r.journal = trim(r.journal);
    r.keywords = splitKeywords(r.keywords);
    ['volume', 'issue', 'pages', 'url', 'language', 'type', 'accession'].forEach(k => { r[k] = trim(r[k]); });
    return r;
  }
  const lines = text => String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');

  /* ---------- RIS ---------- */
  const RIS_TYPES = { JOUR: 'article', JFULL: 'article', THES: 'thesis', RPRT: 'report', CONF: 'conference', CPAPER: 'conference', BOOK: 'book', CHAP: 'chapter', GEN: 'other', ELEC: 'web' };
  function parseRIS(text) {
    const out = [];
    let r = null, last = null, sp = '', ep = '';
    lines(text).forEach(line => {
      const m = /^([A-Z][A-Z0-9])  -\s?(.*)$/.exec(line);
      if (!m) { if (r && last && line.trim()) r._cont(last, line.trim()); return; }
      const tag = m[1], val = m[2].trim();
      if (tag === 'TY') { r = blank(); r.type = RIS_TYPES[val] || 'other'; sp = ep = ''; r._cont = (t, v) => { if (t === 'AB' || t === 'N2') r.abstract += ' ' + v; else if (t === 'TI' || t === 'T1') r.title += ' ' + v; }; last = tag; return; }
      if (!r) return;
      last = tag;
      switch (tag) {
        case 'TI': case 'T1': r.title = r.title ? r.title + ' ' + val : val; break;
        case 'AU': case 'A1': r.authors.push(val); break;
        case 'PY': case 'Y1': if (!r.year) r.year = val; break;
        case 'DA': if (!r.year) r.year = val; break;
        case 'T2': case 'JO': case 'JF': case 'JA': case 'BT': if (!r.journal) r.journal = val; break;
        case 'AB': case 'N2': r.abstract = r.abstract ? r.abstract + ' ' + val : val; break;
        case 'KW': r.keywords.push(val); break;
        case 'DO': r.doi = val; break;
        case 'VL': r.volume = val; break;
        case 'IS': r.issue = val; break;
        case 'SP': sp = val; r.pages = sp + (ep ? '–' + ep : ''); break;
        case 'EP': ep = val; r.pages = (sp || '') + '–' + ep; break;
        case 'UR': if (!r.url) r.url = val; if (!r.doi && /doi\.org/.test(val)) r.doi = val; break;
        case 'LA': r.language = val; break;
        case 'AN': case 'ID': if (!r.accession) r.accession = val; break;
        case 'ER': delete r._cont; out.push(finish(r)); r = null; break;
      }
    });
    if (r) { delete r._cont; out.push(finish(r)); }
    return out;
  }

  /* ---------- BibTeX ---------- */
  const ACC = { "'": '́', '`': '̀', '^': '̂', '"': '̈', '~': '̃', '=': '̄', '.': '̇', u: '̆', v: '̌', H: '̋', c: '̧', k: '̨' };
  function latex(s) {
    let t = String(s || '');
    t = t.replace(/\\([`'^"~=.])\s*\{?\\?([A-Za-z])\}?/g, (m, a, ch) => (ch + ACC[a]).normalize('NFC'));
    t = t.replace(/\\([uvHck])\s*\{\\?([A-Za-z])\}/g, (m, a, ch) => (ch + ACC[a]).normalize('NFC'));
    t = t.replace(/\\ss\b\s?/g, 'ß').replace(/\\o\b\s?/g, 'ø').replace(/\\O\b\s?/g, 'Ø').replace(/\\ae\b\s?/g, 'æ').replace(/\\aa\b\s?/g, 'å').replace(/\\i\b\s?/g, 'ı').replace(/\\l\b\s?/g, 'ł');
    t = t.replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\_/g, '_').replace(/\\\$/g, '$').replace(/~/g, ' ');
    t = t.replace(/---/g, '—').replace(/--/g, '–');
    t = t.replace(/\\[a-zA-Z]+\s*/g, '').replace(/[{}]/g, '');
    return trim(t);
  }
  const BIB_TYPES = { article: 'article', phdthesis: 'thesis', mastersthesis: 'thesis', thesis: 'thesis', techreport: 'report', report: 'report', inproceedings: 'conference', conference: 'conference', book: 'book', incollection: 'chapter', inbook: 'chapter', misc: 'other', online: 'web' };
  function parseBib(text) {
    const s = String(text || '').replace(/^﻿/, '');
    const out = [];
    let i = 0;
    while (true) {
      const at = s.indexOf('@', i);
      if (at < 0) break;
      const m = /^@\s*([A-Za-z]+)\s*([{(])/.exec(s.slice(at));
      if (!m) { i = at + 1; continue; }
      const type = m[1].toLowerCase(), open = m[2], close = open === '{' ? '}' : ')';
      let j = at + m[0].length, depth = 1, inQ = false;
      const start = j;
      for (; j < s.length && depth > 0; j++) {
        const c = s[j];
        if (c === '\\') { j++; continue; }
        if (c === '"' && depth === 1) inQ = !inQ;
        else if (!inQ && (c === '{' || c === '(' && open === '(')) depth++;
        else if (!inQ && (c === close || (c === '}' && open === '{'))) depth--;
      }
      const body = s.slice(start, j - 1);
      i = j;
      if (['comment', 'preamble', 'string'].includes(type)) continue;
      const comma = body.indexOf(',');
      const key = trim(body.slice(0, comma));
      const fields = {};
      let k = comma + 1;
      while (k < body.length) {
        const fm = /^\s*([A-Za-z][\w-]*)\s*=\s*/.exec(body.slice(k));
        if (!fm) break;
        k += fm[0].length;
        let v = '';
        if (body[k] === '{') {
          let d = 0, q = k;
          for (; q < body.length; q++) { if (body[q] === '\\') { q++; continue; } if (body[q] === '{') d++; else if (body[q] === '}') { d--; if (d === 0) break; } }
          v = body.slice(k + 1, q); k = q + 1;
        } else if (body[k] === '"') {
          let q = k + 1, d = 0;
          for (; q < body.length; q++) { if (body[q] === '\\') { q++; continue; } if (body[q] === '{') d++; else if (body[q] === '}') d--; else if (body[q] === '"' && d === 0) break; }
          v = body.slice(k + 1, q); k = q + 1;
        } else { const nm = /^[^,]*/.exec(body.slice(k)); v = nm[0]; k += nm[0].length; }
        fields[fm[1].toLowerCase()] = v;
        const cm = /^\s*,?/.exec(body.slice(k)); k += cm[0].length;
      }
      const r = blank();
      r.type = BIB_TYPES[type] || 'other';
      r.title = latex(fields.title);
      r.authors = has(fields.author) ? fields.author.split(/\s+and\s+/i).map(latex) : [];
      r.year = fields.year || fields.date || '';
      r.journal = latex(fields.journal || fields.journaltitle || fields.booktitle || fields.school || fields.institution || fields.publisher || '');
      r.volume = fields.volume || ''; r.issue = fields.number || fields.issue || ''; r.pages = latex(fields.pages || '');
      r.doi = fields.doi || ''; r.abstract = latex(fields.abstract || ''); r.url = fields.url || '';
      r.keywords = has(fields.keywords) ? fields.keywords.split(/\s*[,;]\s*/).map(latex) : [];
      r.language = fields.language || ''; r.accession = fields.note && /^W\d+/.test(fields.note) ? fields.note : key;
      out.push(finish(r));
    }
    return out;
  }

  /* ---------- two-letter tagged text ---------- */
  const TAG_TYPES = { J: 'article', B: 'book', S: 'article', P: 'report', C: 'conference' };
  function parseTagged(text) {
    const out = [];
    let r = null, last = null, sp = '', ep = '';
    const put = (tag, val, cont) => {
      switch (tag) {
        case 'PT': r.type = TAG_TYPES[val] || 'other'; break;
        case 'AU': r._au.push(val); break;
        case 'AF': r._af.push(val); break;
        case 'TI': r.title += (cont ? ' ' : '') + val; break;
        case 'SO': r.journal += (cont ? ' ' : '') + val; break;
        case 'AB': r.abstract += (cont ? ' ' : '') + val; break;
        case 'DE': case 'ID': r._kw += (r._kw && !cont ? '; ' : cont ? ' ' : '') + val; break;
        case 'PY': r.year = val; break;
        case 'VL': r.volume = val; break;
        case 'IS': r.issue = val; break;
        case 'BP': sp = val; break;
        case 'EP': ep = val; break;
        case 'DI': r.doi = val; break;
        case 'LA': r.language = val; break;
        case 'UT': r.accession = val; break;
      }
    };
    lines(text).forEach(line => {
      if (/^ER\s*$/.test(line)) {
        if (r) { r.authors = r._af.length ? r._af : r._au; r.keywords = r._kw; r.pages = sp + (ep ? '–' + ep : ''); ['_au', '_af', '_kw'].forEach(k => delete r[k]); out.push(finish(r)); }
        r = null; return;
      }
      const m = /^([A-Z][A-Z0-9]) (.*)$/.exec(line);
      if (m && m[1] !== 'FN' && m[1] !== 'VR' && m[1] !== 'EF') {
        if (m[1] === 'PT' || !r) { r = blank(); Object.assign(r, { _au: [], _af: [], _kw: '' }); sp = ep = ''; }
        last = m[1]; put(last, m[2].trim(), false); return;
      }
      if (r && last && /^ {3}\S/.test(line)) put(last, line.trim(), true);
    });
    return out;
  }

  /* ---------- MEDLINE ---------- */
  function parseMedline(text) {
    const out = [];
    let r = null, last = null;
    const flush = () => { if (r) { r.authors = r._fau.length ? r._fau : r._au; delete r._fau; delete r._au; out.push(finish(r)); } r = null; };
    lines(text).forEach(line => {
      const m = /^([A-Z]{2,4})\s*- (.*)$/.exec(line);
      if (m) {
        const tag = m[1], val = m[2].trim();
        if (tag === 'PMID') { flush(); r = blank(); r._fau = []; r._au = []; r.accession = val; r.type = 'article'; }
        if (!r) return;
        last = tag;
        switch (tag) {
          case 'TI': r.title = val; break;
          case 'AB': r.abstract = val; break;
          case 'FAU': r._fau.push(val); break;
          case 'AU': r._au.push(val); break;
          case 'DP': r.year = val; break;
          case 'JT': r.journal = val; break;
          case 'TA': if (!r.journal) r.journal = val; break;
          case 'VI': r.volume = val; break;
          case 'IP': r.issue = val; break;
          case 'PG': r.pages = val; break;
          case 'LID': case 'AID': if (/\[doi\]/.test(val) && !r.doi) r.doi = val; break;
          case 'OT': case 'MH': r.keywords.push(val.replace(/\*/g, '')); break;
          case 'LA': r.language = val; break;
          case 'PT': if (/review/i.test(val)) r.type = 'review'; break;
          case 'OID': if (/^W\d+/.test(val)) r.accession = val; break;
        }
        return;
      }
      if (r && last && /^ {6}\S/.test(line)) {
        const v = line.trim();
        if (last === 'TI') r.title += ' ' + v;
        else if (last === 'AB') r.abstract += ' ' + v;
      }
      if (!line.trim()) last = null;
    });
    flush();
    return out;
  }

  /* ---------- refer (%) tags ---------- */
  const ENW_TYPES = { 'Journal Article': 'article', Thesis: 'thesis', Report: 'report', 'Conference Proceedings': 'conference', 'Conference Paper': 'conference', Book: 'book', 'Book Section': 'chapter' };
  function parseEnw(text) {
    const out = [];
    let r = null, last = null;
    const flush = () => { if (r) out.push(finish(r)); r = null; };
    lines(text).forEach(line => {
      const m = /^%([0-9A-Z@!#$&(){}*+~^>\]\[])\s(.*)$/.exec(line);
      if (!m) { if (!line.trim()) { flush(); last = null; } else if (r && last === 'X') r.abstract += ' ' + line.trim(); return; }
      if (!r) r = blank();
      const tag = m[1], val = m[2].trim();
      last = tag;
      switch (tag) {
        case '0': r.type = ENW_TYPES[val] || 'other'; break;
        case 'T': r.title = val; break;
        case 'A': r.authors.push(val); break;
        case 'D': r.year = val; break;
        case 'J': r.journal = val; break;
        case 'B': if (!r.journal) r.journal = val; break;
        case 'V': r.volume = val; break;
        case 'N': r.issue = val; break;
        case 'P': r.pages = val; break;
        case 'X': r.abstract = val; break;
        case 'K': r.keywords.push(val); break;
        case 'R': r.doi = val; break;
        case 'U': r.url = val; break;
        case 'G': r.language = val; break;
        case 'M': r.accession = val; break;
      }
    });
    flush();
    return out;
  }

  /* ---------- delimited text ---------- */
  /* RFC 4180: quoted fields may hold the delimiter, doubled quotes and line breaks */
  function parseDelimited(text, delim) {
    const s = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    const d = delim || detectDelimiter(s);
    const rows = [];
    let row = [], f = '', q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) {
        if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += c;
      } else if (c === '"' && f === '') q = true;
      else if (c === d) { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return { rows: rows.filter(r => r.some(x => x.trim() !== '')), delim: d };
  }
  function detectDelimiter(s) {
    const head = s.split('\n', 1)[0];
    const n = c => head.split(c).length - 1;
    return ['\t', ';', ','].sort((a, b) => n(b) - n(a))[0];
  }
  /* header names that mean each field (compared without accents or case) */
  const COLS = {
    title: ['title', 'titulo', 'article title', 'document title', 'titulo del articulo', 'ti'],
    authors: ['authors', 'author', 'autores', 'autor', 'author full names', 'author names', 'au', 'af'],
    year: ['year', 'ano', 'publication year', 'py', 'fecha', 'date', 'anio', 'year published'],
    journal: ['source title', 'journal', 'revista', 'source', 'publication title', 'fuente', 'so', 'journal title'],
    abstract: ['abstract', 'resumen', 'ab'],
    doi: ['doi', 'di'],
    keywords: ['keywords', 'author keywords', 'palabras clave', 'de', 'index keywords', 'subjects'],
    volume: ['volume', 'volumen', 'vl'], issue: ['issue', 'numero', 'number', 'is'], pages: ['pages', 'paginas', 'page range'],
    url: ['url', 'link', 'enlace'], language: ['language', 'idioma', 'language of original document', 'la'],
    type: ['document type', 'tipo', 'type', 'dt'], accession: ['id', 'accession number', 'eid', 'ut', 'identificador'],
  };
  const keyOf = h => String(h || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').trim();
  function mapColumns(header) {
    const map = {};
    header.forEach((h, i) => { const k = keyOf(h); for (const f in COLS) if (map[f] == null && COLS[f].includes(k)) { map[f] = i; break; } });
    return map;
  }
  function parseCSV(text, opts) {
    const { rows, delim } = parseDelimited(text, opts && opts.delim);
    if (rows.length < 2) return { records: [], map: {}, delim, header: rows[0] || [] };
    const header = rows[0], map = (opts && opts.map) || mapColumns(header);
    const records = rows.slice(1).map(row => {
      const r = blank();
      const g = f => (map[f] != null ? row[map[f]] || '' : '');
      r.title = g('title'); r.year = g('year'); r.journal = g('journal'); r.abstract = g('abstract'); r.doi = g('doi');
      r.authors = has(g('authors')) ? g('authors').split(/\s*;\s*|\s+and\s+/).filter(Boolean) : [];
      r.keywords = g('keywords'); r.volume = g('volume'); r.issue = g('issue'); r.pages = g('pages'); r.url = g('url'); r.language = g('language'); r.type = g('type') ? 'other' : 'article'; r.accession = g('accession');
      return finish(r);
    }).filter(r => r.title || r.doi);
    return { records, map, delim, header };
  }

  /* ---------- format detection and one entry point ---------- */
  const FORMATS = {
    ris: ['RIS (TY  - … ER  -)', 'RIS (TY  - … ER  -)'],
    bib: ['BibTeX (@article{…})', 'BibTeX (@article{…})'],
    tagged: ['Texto etiquetado de dos letras (PT … ER)', 'Two-letter tagged text (PT … ER)'],
    medline: ['MEDLINE (PMID- …)', 'MEDLINE (PMID- …)'],
    enw: ['Etiquetas % (%T, %A…)', 'Percent tags (%T, %A…)'],
    csv: ['Tabla delimitada (CSV o TSV)', 'Delimited table (CSV or TSV)'],
  };
  function detect(text, name) {
    const t = String(text || '').replace(/^﻿/, '').slice(0, 20000);
    const ext = (String(name || '').match(/\.([a-z0-9]+)$/i) || [])[1];
    if (/^TY  - /m.test(t)) return 'ris';
    if (/^PMID- /m.test(t)) return 'medline';
    if (/^\s*@[A-Za-z]+\s*[{(]/m.test(t)) return 'bib';
    if (/^(FN |VR |PT )/m.test(t) && /^ER\s*$/m.test(t)) return 'tagged';
    if (/^%[0TA] /m.test(t)) return 'enw';
    if (ext && /^(csv|tsv|txt)$/i.test(ext)) return 'csv';
    return 'csv';
  }
  function parse(text, name, format) {
    const f = format || detect(text, name);
    let records, info = {};
    if (f === 'ris') records = parseRIS(text);
    else if (f === 'bib') records = parseBib(text);
    else if (f === 'tagged') records = parseTagged(text);
    else if (f === 'medline') records = parseMedline(text);
    else if (f === 'enw') records = parseEnw(text);
    else { const c = parseCSV(text); records = c.records; info = { map: c.map, delim: c.delim, header: c.header }; }
    return { format: f, records, info };
  }

  /* ---------- writing ---------- */
  const RIS_BACK = { article: 'JOUR', thesis: 'THES', report: 'RPRT', conference: 'CONF', book: 'BOOK', chapter: 'CHAP', web: 'ELEC', review: 'JOUR', other: 'GEN' };
  function toRIS(recs) {
    return recs.map(r => {
      const L = [`TY  - ${RIS_BACK[r.type] || 'GEN'}`, `TI  - ${r.title}`];
      (r.authors || []).forEach(a => L.push(`AU  - ${a}`));
      if (r.year) L.push(`PY  - ${r.year}`);
      if (r.journal) L.push(`T2  - ${r.journal}`);
      if (r.volume) L.push(`VL  - ${r.volume}`);
      if (r.issue) L.push(`IS  - ${r.issue}`);
      if (r.pages) { const [a, b] = r.pages.split(/[–-]/); L.push(`SP  - ${a}`); if (b) L.push(`EP  - ${b}`); }
      if (r.abstract) L.push(`AB  - ${r.abstract}`);
      (r.keywords || []).forEach(k => L.push(`KW  - ${k}`));
      if (r.doi) L.push(`DO  - ${r.doi}`);
      if (r.url) L.push(`UR  - ${r.url}`);
      if (r.language) L.push(`LA  - ${r.language}`);
      if (r.accession) L.push(`AN  - ${r.accession}`);
      L.push('ER  - ');
      return L.join('\r\n');
    }).join('\r\n\r\n') + '\r\n';
  }
  /* BibTeX in UTF-8 (biber and bibtex8 read it as is); keys come from the caller so that they are
     the same [@key] of the manuscript, or are built surname + year with a/b for repeats */
  const BIB_BACK = { article: 'article', thesis: 'phdthesis', report: 'techreport', conference: 'inproceedings', book: 'book', chapter: 'incollection', web: 'online', review: 'article', other: 'misc' };
  const bibEsc = s => String(s == null ? '' : s).replace(/\\/g, '\\textbackslash{}').replace(/([&%$#_])/g, '\\$1').replace(/[{}]/g, '');
  function toBib(recs, keys) {
    const used = {};
    return recs.map((r, i) => {
      let k = keys && keys[i];
      if (!k) {
        const a = (r.authors || [])[0] || 'anon', s = (a.includes(',') ? a.split(',')[0] : a.split(/\s+/).slice(-1)[0]).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]/g, '') || 'anon';
        k = s + (r.year || 'nd');
        used[k] = (used[k] || 0) + 1;
        if (used[k] > 1) k += String.fromCharCode(95 + used[k]);
      }
      const f = [];
      const add = (n, v) => { if (v != null && String(v).trim() !== '') f.push(`  ${n} = {${bibEsc(v)}}`); };
      add('author', (r.authors || []).join(' and '));
      add('title', r.title);
      add(r.type === 'book' ? 'publisher' : r.type === 'thesis' ? 'school' : r.type === 'report' ? 'institution' : r.type === 'conference' || r.type === 'chapter' ? 'booktitle' : 'journal', r.journal);
      add('year', r.year); add('volume', r.volume); add('number', r.issue);
      add('pages', r.pages ? String(r.pages).replace(/[–-]+/, '--') : '');
      add('doi', r.doi); add('url', r.url); add('language', r.language);
      add('keywords', (r.keywords || []).join(', '));
      return `@${BIB_BACK[r.type] || 'misc'}{${k},\n${f.join(',\n')}\n}`;
    }).join('\n\n') + '\n';
  }
  const csvCell = v => { const s = String(v == null ? '' : v); return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function toCSV(recs, extra) {
    const cols = ['id', 'title', 'authors', 'year', 'journal', 'volume', 'issue', 'pages', 'doi', 'abstract', 'keywords', 'url', 'language', 'type', 'accession'].concat(extra || []);
    const out = [cols.join(',')];
    recs.forEach(r => out.push(cols.map(c => csvCell(c === 'authors' || c === 'keywords' ? (r[c] || []).join('; ') : r[c])).join(',')));
    return '﻿' + out.join('\r\n') + '\r\n';
  }

  Object.assign(Records, { FORMATS, COLS, normDoi, year, latex, blank, finish, splitKeywords, parseRIS, parseBib, parseTagged, parseMedline, parseEnw, parseDelimited, detectDelimiter, mapColumns, parseCSV, detect, parse, toRIS, toBib, toCSV });
  window.Records = Records;
})();
