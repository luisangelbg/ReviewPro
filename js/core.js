/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — global state and shared utilities.
   No ES modules: everything hangs from window so the app also works when
   index.html is opened with a double click (file://). */

/* the version of the app, written once: the report cites it and the page shows
   it, so it cannot drift from one place to another */
const APP_VERSION = '1.0.0';
window.APP_VERSION = APP_VERSION;

/* One review project. The review type (narrative, scoping, systematic,
   meta-analysis) is chosen in Block 2 and decides which blocks are required,
   which are optional and which reporting guideline the checklist follows. */
const state = {
  reviewType: null,  // 'narrative' | 'scoping' | 'systematic' | 'meta'
  protocol: null,    // Block 2: question, framework, eligibility criteria, registration
  search: null,      // Block 3: search strings, sources, imported records, duplicates
  screening: null,   // Block 4: title/abstract decisions, reviewers, ranking model
  fulltext: null,    // Block 5: full-text decisions, reasons, PRISMA counts
  extraction: null,  // Block 6: extraction form and evidence table
  appraisal: null,   // Block 7: risk of bias / quality, certainty of evidence
  synthesis: null,   // Block 8: concept matrix, gap map, meta-analysis
  writing: null,     // Block 9: outline, claims linked to evidence, checklist
  report: null,      // Block 10: what the figure studio and the report last built
};
window.state = state;

/* the ten blocks of the app, in navigation order */
const STEPS = [
  { n: 1, es: 'Inicio', en: 'Home', ready: true },
  { n: 2, es: 'Protocolo', en: 'Protocol', ready: true },
  { n: 3, es: 'Búsqueda', en: 'Search', ready: true },
  { n: 4, es: 'Cribado', en: 'Screening', ready: true },
  { n: 5, es: 'Texto completo', en: 'Full text', ready: true },
  { n: 6, es: 'Extracción', en: 'Extraction', ready: true },
  { n: 7, es: 'Calidad y sesgo', en: 'Quality and bias', ready: true },
  { n: 8, es: 'Síntesis', en: 'Synthesis', ready: true },
  { n: 9, es: 'Escritura', en: 'Writing', ready: true },
  { n: 10, es: 'Informe', en: 'Report', ready: true },
];

/* ---------------- DOM ---------------- */
function el(id) { return document.getElementById(id); }
function els(sel, root) { return [...(root || document).querySelectorAll(sel)]; }
function mk(tag, attrs, html) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'style') n.setAttribute('style', attrs[k]);
    else if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  }
  if (html != null) n.innerHTML = html;
  return n;
}
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/* bilingual inline HTML: both spans are written, CSS shows the active one */
function L2(es, en) { return `<span data-l="es">${es}</span><span data-l="en">${en}</span>`; }
/* Labels shown in capitals would turn °C·d into °C·D and ETo into ETO: units
   and symbols with a subscript keep their own case inside an uppercase label. */
function keepGreek(s) {
  return String(s).replace(/(°C[·a-z0-9-]*|ET[oc](?:\s*adj)?|Kc(?:\s*[a-z]+)?|Ks|Ra|Rs|Rn|Rnl|Rns|u₂|[Ͱ-Ͽ][²³₀-₉]*[A-Za-z]{0,3}|[A-Za-z][²³₀-₉]+|\[[a-z]\]|mm\/d[a-zí]*|MJ\/m²)/g, '<span class="nc">$1</span>');
}
function svgEl(tag, attrs, text) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  return n;
}
function showMessage(container, type, text) {
  if (typeof container === 'string') container = el(container);
  if (!container) return null;
  const div = mk('div', { class: 'msg msg-' + type }, text);
  /* errors and warnings are announced to screen readers */
  if (window.LABG) LABG.messageRole(div, type);
  /* an error while the work window is open closes it without the check mark */
  if (type === 'error' && rvWork.current) rvWork.current._failed = true;
  container.appendChild(div);
  return div;
}
function clearMessages(container) {
  if (typeof container === 'string') container = el(container);
  if (container) container.innerHTML = '';
}
/* A message that belongs above the ones a block has just written (the note of
   an example, the result of an import): it is added and moved to the top. */
function notice(container, type, text) {
  if (typeof container === 'string') container = el(container);
  if (!container) return null;
  const div = showMessage(container, type, text);
  if (div && container.firstChild !== div) container.insertBefore(div, container.firstChild);
  return div;
}

/* ---------------- waits ----------------
   The suite's work window for calculations that run on a click. It only
   opens if the wait passes 300 ms; the tests load this file without
   labg-core.js, hence every check for window.LABG. */
function rvWork(es, en) {
  if (!window.LABG || !LABG.work) return null;
  const w = LABG.work({ title: LABG.t(es, en || es), delay: 300 });
  rvWork.current = w;
  return w;
}
rvWork.current = null;
/* lets the window paint, runs f and closes it with the check mark (or without, if it failed) */
function rvAfterPaint(f, w) {
  const done = () => { if (rvWork.current === w) rvWork.current = null; if (w && !w.ended) { if (w._failed) w.close(); else w.done(); } };
  return (window.LABG ? LABG.nextPaint() : new Promise(r => setTimeout(r, 30))).then(f).then(done, e => { console.error(e); if (w) w._failed = true; done(); });
}
/* exports: the button works with dots and ends in «✓ Done» */
function rvBusy(btn, task) {
  if (window.LABG && LABG.busyButton && btn) return LABG.busyButton(btn, task).catch(e => console.error(e));
  return Promise.resolve().then(task).catch(e => console.error(e));
}
if (window.LABG && LABG.work) {
  LABG.work.scene = 'fit';
  LABG.work.tips = [
    ['El modelo multinivel separa la varianza entre estudios de la que hay dentro de cada estudio.',
     'The multilevel model separates the variance between studies from the variance within each study.'],
    ['Los duplicados probables nunca se fusionan solos: una persona decide cada par.',
     'Probable duplicates are never merged on their own: a person decides every pair.'],
    ['El proyecto se guarda solo en este navegador; guarda también el archivo del proyecto como respaldo.',
     'The project autosaves in this browser; also save the project file as a backup.'],
  ];
}

/* ---------------- numbers ----------------
   Numbers use the decimal point and a comma for thousands in both languages. */
function fmtNum(v, d) {
  if (v === null || v === undefined || v === '' || (typeof v === 'number' && !isFinite(v))) return '—';
  const n = Number(v);
  if (!isFinite(n)) return String(v);
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1e-4 || abs >= 1e12) { const e = n.toExponential(d != null ? d : 2); return e.startsWith('-') ? '−' + e.slice(1) : e; }
  const s = n.toLocaleString('en-US', { maximumFractionDigits: d != null ? d : 3 });
  if (/^-0(\.0*)?$/.test(s)) return s.slice(1);
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}
function fmtFixed(v, d) {
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  if (v == null || !isFinite(v)) return '—';
  const s = Number(v).toFixed(d == null ? 2 : d);
  if (/^-0(\.0*)?$/.test(s)) return s.slice(1);
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}
/* 0.1234 → "12.3%" */
function fmtPct(x, d) {
  if (x == null || !isFinite(x)) return '—';
  const s = (x * 100).toLocaleString('en-US', { minimumFractionDigits: d == null ? 1 : d, maximumFractionDigits: d == null ? 1 : d }) + '%';
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}
/* a temperature with its sign and unit: "−2.5 °C" */
function fmtTemp(v, d) { return v == null || !isFinite(v) ? '—' : fmtFixed(v, d == null ? 1 : d) + ' °C'; }
/* a depth of water: "12.4 mm" */
function fmtMm(v, d) { return v == null || !isFinite(v) ? '—' : fmtFixed(v, d == null ? 1 : d) + ' mm'; }
/* "1 día", "2 días" */
function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

/* Reads what the user typed in a numeric field: "1,250.5", "12 %", "−3" and
   "(4)" all work; an empty field is null, never 0. */
function parseNum(s) {
  if (s == null) return null;
  if (typeof s === 'number') return isFinite(s) ? s : null;
  let t = String(s).trim().replace(/[\s ]/g, '').replace(/,/g, '');
  if (!t) return null;
  let pct = false;
  if (t.endsWith('%')) { pct = true; t = t.slice(0, -1); }
  if (/^\(.*\)$/.test(t)) t = '-' + t.slice(1, -1);
  t = t.replace(/[−–—]/g, '-');
  const v = Number(t);
  if (!isFinite(v)) return null;
  return pct ? v / 100 : v;
}

/* ---------------- dates ----------------
   Every date in the app is a plain {y, m, d} or an ISO string "YYYY-MM-DD",
   never a JavaScript Date with a time zone attached: a sowing date has no
   hour, and a Date built at midnight moves a day back in half the world. */
const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const MONTHS_SHORT = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
function monthName(m, short) { return (short ? MONTHS_SHORT : MONTHS)[I18N.lang][m - 1]; }
function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function daysInMonth(y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
function daysInYear(y) { return isLeap(y) ? 366 : 365; }
/* day of the year, 1 = 1 January */
function doy(y, m, d) {
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[m - 1] + d + (m > 2 && isLeap(y) ? 1 : 0);
}
/* the inverse: {y, m, d} of a day of the year, allowing it to spill into the next year */
function fromDoy(y, j) {
  while (j > daysInYear(y)) { j -= daysInYear(y); y++; }
  while (j < 1) { y--; j += daysInYear(y); }
  let m = 1;
  while (j > daysInMonth(y, m)) { j -= daysInMonth(y, m); m++; }
  return { y, m, d: j };
}
/* days since 1 January 1970 without any time zone: an integer arithmetic on dates */
function dayNumber(y, m, d) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045 - 2440588;
}
function fromDayNumber(n) {
  const J = n + 2440588;
  const f = J + 1401 + Math.floor((Math.floor((4 * J + 274277) / 146097) * 3) / 4) - 38;
  const e = 4 * f + 3, g = Math.floor((e % 1461) / 4), h = 5 * g + 2;
  const d = Math.floor((h % 153) / 5) + 1, m = ((Math.floor(h / 153) + 2) % 12) + 1;
  const y = Math.floor(e / 1461) - 4716 + Math.floor((14 - m) / 12);
  return { y, m, d };
}
function addDays(date, n) { return fromDayNumber(dayNumber(date.y, date.m, date.d) + n); }
function parseISO(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || '').trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}
function toISO(date) { return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`; }
/* "12 de marzo de 2026" / "12 March 2026"; short: "12 mar" */
function fmtDate(date, short) {
  if (!date) return '—';
  if (typeof date === 'string') date = parseISO(date);
  if (!date) return '—';
  if (short) return `${date.d} ${monthName(date.m, true)}`;
  return I18N.lang === 'en' ? `${date.d} ${monthName(date.m)} ${date.y}` : `${date.d} de ${monthName(date.m)} de ${date.y}`;
}
/* a day of the year as a short date of a non-leap year: "12 mar" */
function fmtDoy(j) { const dt = fromDoy(2025, Math.round(j)); return `${dt.d} ${monthName(dt.m, true)}`; }

/* ---------------- CSV / downloads ---------------- */
function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function download(content, filename, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = mk('a', { href: url, download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function slug(s) {
  return String(s || 'reviewpro').replace(/\.[a-z0-9]{1,5}$/i, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'reviewpro';
}

/* ---------------- step navigation ---------------- */
function goStep(n) {
  n = String(n);
  els('.step-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + n));
  els('.step-btn').forEach(b => b.classList.toggle('active', b.dataset.step === n));
  document.body.classList.toggle('on-home', n === '1');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const btn = stepBtn(n);
  if (window.LABG) {
    LABG.setCurrentStep(n);
    if (btn) LABG.announce(T('Bloque ', 'Block ') + stepName(n));
  } else if (btn && btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  document.dispatchEvent(new CustomEvent('stepchange', { detail: { step: Number(n) } }));
  refreshStepMarks();
  refreshStepFooters();
}
function enableStep(n, on) {
  const b = stepBtn(n);
  if (b) b.disabled = (on === false);
  refreshStepMarks();
  refreshStepFooters();
}

/* ---------------- common bar of the LABG Suite ----------------
   Every call to labg-core.js is guarded: the test page loads this file
   without it. */
const stepBtn = n => document.querySelector('.step-btn[data-step="' + String(n) + '"]');
const stepOn = n => { const b = stepBtn(n); return !!b && !b.disabled; };
function stepName(n) {
  const s = STEPS.find(x => String(x.n) === String(n));
  return s ? s.n + ' · ' + T(s.es, s.en) : String(n);
}

/* Every block can be opened from the start, so a block counts as done when
   the project status of Block 10 says it is complete (the same measure the
   report uses: protocol score, screening decided, full texts assessed, data
   extracted…). Blocks 1 and 10 hand nothing on and are never marked. The
   marks are recomputed on every change of block and after every autosave or
   project load, so opening another project clears the ones that no longer
   hold. */
function refreshStepMarks() {
  if (!window.LABG) return;
  let rows = [];
  try { if (window.Block10 && state.protocol) rows = Block10.projectStatus().rows; } catch (e) { rows = []; }
  STEPS.forEach(s => {
    if (s.n === 1 || s.n === 10) return;
    const r = rows.find(x => x.n === s.n);
    LABG.markStep(s.n, r && r.st === 'done' && stepOn(s.n) ? 'done' : null);
  });
}

/* Footer of every block: Previous / Next, with the name of the block. Both
   languages are written side by side (L2), so a change of language needs no
   redraw. The buttons carry data-nav (Block 10 already listens to data-go
   inside its own panel). */
function refreshStepFooters() {
  if (!window.LABG) return;
  els('.step-panel').forEach(p => {
    const n = Number(p.id.replace('panel-', ''));
    const i = STEPS.findIndex(s => s.n === n);
    if (i < 0) return;
    let f = p.querySelector(':scope > .step-footer');
    if (!f) {
      f = mk('nav', { class: 'step-footer no-print' });
      f.innerHTML = '<button type="button" class="btn btn-secondary prev"></button><button type="button" class="btn btn-primary next"></button>';
      f.addEventListener('click', e => { const b = e.target.closest('button[data-nav]'); if (b && !b.disabled) goStep(b.dataset.nav); });
      p.appendChild(f);
    }
    f.setAttribute('aria-label', T('Bloques', 'Blocks'));
    const prev = STEPS.slice(0, i).reverse().find(s => stepOn(s.n));
    const next = STEPS.slice(i + 1).find(s => stepBtn(s.n));
    const label = s => L2(s.n + ' · ' + s.es, s.n + ' · ' + s.en);
    const bp = f.querySelector('.prev'), bn = f.querySelector('.next');
    bp.hidden = !prev;
    if (prev) { bp.dataset.nav = prev.n; bp.innerHTML = `← <span><small>${L2('Anterior', 'Previous')}</small>${label(prev)}</span>`; }
    bn.hidden = !next;
    if (next) {
      bn.dataset.nav = next.n; bn.disabled = !stepOn(next.n);
      bn.innerHTML = `<span><small>${L2('Siguiente', 'Next')}</small>${label(next)}</span> →`;
    }
  });
}

/* Theme button and block bar: labels that depend on the state and the language */
function paintCommonBar() {
  if (!window.LABG) return;
  LABG.theme.key = 'reviewpro:theme';
  LABG.theme.paint();
  const nav = el('stepper');
  if (nav) nav.setAttribute('aria-label', T('Bloques', 'Blocks'));
}

/* Wired after every DOMContentLoaded handler has run: home.js builds the
   block bar in its own, and the blocks start with delays of up to 60 ms. */
document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  if (!window.LABG) return;
  const hb = el('helpBtn');
  if (hb) hb.addEventListener('click', () => LABG.showShortcuts());
  /* In Block 4 the key «?» marks a record as «maybe»: when a block has already
     handled the key, the list of shortcuts does not open over it. */
  document.addEventListener('keydown', e => {
    if (e.key === '?' && e.defaultPrevented) e.stopImmediatePropagation();
  });
  LABG.shortcuts([]);
  LABG.bindStepKeys(goStep);
  /* the project autosaves in the browser, but a review in progress is months
     of work: closing the page still asks first */
  LABG.guardUnload(() => !!(state.protocol && (state.protocol.title ||
    (state.search && state.search.files && state.search.files.length))));
  LABG.setCurrentStep((document.querySelector('.step-btn.active') || {}).dataset?.step || '1');
  document.addEventListener('themechange', paintCommonBar);
  document.addEventListener('langchange', () => { paintCommonBar(); refreshStepMarks(); });
  if (window.Project) {
    let t = null;
    Project.on(kind => {
      if (kind !== 'load' && kind !== 'saved') return;
      clearTimeout(t); t = setTimeout(refreshStepMarks, 400);
    });
  }
  paintCommonBar();
  refreshStepMarks();
  refreshStepFooters();
}, 80));

/* Persisted preferences (figure style, last settings) */
const Prefs = {
  get(k, d) { try { const v = localStorage.getItem('reviewpro:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('reviewpro:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
};

/* ---------------- random numbers ----------------
   Everything stochastic (the synthetic weather of the laboratories, the
   bootstrap of the risk block) draws from a seeded generator, so a run is
   reproducible and its seed can be reported. sfc32 passes the usual
   statistical batteries, unlike a 32-bit linear congruential generator. */
function rng(seed) {
  let a = 0x9e3779b9, b = 0x243f6a88, c = 0xb7e15162, d = (seed >>> 0) ^ 0xdeadbeef;
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 15; i++) next();
  return next;
}
function randn(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback || '#33539e';
}

/* ---------------- small statistics ---------------- */
const Stat = {
  sum: a => a.reduce((x, y) => x + y, 0),
  mean: a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN,
  sd(a) { const m = Stat.mean(a); return a.length > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)) : NaN; },
  min: a => a.length ? Math.min(...a) : NaN,
  max: a => a.length ? Math.max(...a) : NaN,
  /* quantile by linear interpolation (type 7 of Hyndman & Fan, the default of R) */
  quantile(a, q) {
    const s = a.filter(x => isFinite(x)).slice().sort((x, y) => x - y);
    if (!s.length) return NaN;
    const h = (s.length - 1) * q, lo = Math.floor(h), hi = Math.ceil(h);
    return s[lo] + (s[hi] - s[lo]) * (h - lo);
  },
  median: a => Stat.quantile(a, 0.5),
};

/* ---------------- shared result components ---------------- */
/* tiles: [[label, value, sub, level]] or [{label, value, sub, level}] */
function statTiles(container, tiles) {
  if (typeof container === 'string') container = el(container);
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('results-summary');
  tiles.forEach(t => {
    const [label, value, sub, level] = Array.isArray(t) ? t : [t.label, t.value, t.sub, t.level];
    const d = mk('div', { class: 'stat-tile' + (level ? ' ' + level : '') });
    d.innerHTML = `<div class="stat-label">${keepGreek(label)}</div><div class="stat-value">${value}</div>` +
      (sub ? `<div class="stat-sub">${sub}</div>` : '');
    container.appendChild(d);
  });
}
/* columns: [{key, label, get?, fmt?, num?, html?}] */
function buildTable(container, columns, rows, opts) {
  opts = opts || {};
  if (typeof container === 'string') container = el(container);
  if (!container) return null;
  container.innerHTML = '';
  const table = mk('table');
  if (opts.className) table.className = opts.className;
  if (opts.caption) table.appendChild(mk('caption', null, opts.caption));
  const thead = mk('thead'), trh = mk('tr');
  columns.forEach(c => {
    const th = mk('th', { class: c.num ? 'num' : null });
    th.innerHTML = c.label != null ? c.label : c.key;
    trh.appendChild(th);
  });
  thead.appendChild(trh); table.appendChild(thead);
  const tbody = mk('tbody');
  const shown = opts.limit ? rows.slice(0, opts.limit) : rows;
  shown.forEach(r => {
    const tr = mk('tr');
    if (r && r._class) tr.className = r._class;
    columns.forEach(c => {
      const td = mk('td', { class: c.num ? 'num' : null });
      let v = c.get ? c.get(r) : r[c.key];
      if (c.html) { td.innerHTML = v == null ? '—' : v; tr.appendChild(td); return; }
      if (c.fmt && v != null && v !== '') v = c.fmt(v);
      td.textContent = (v === null || v === undefined || v === '' || (typeof v === 'number' && !isFinite(v))) ? '—' : v;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  const wrap = mk('div', { class: 'table-scroll' + (opts.scroll ? ' book-scroll' : '') });
  wrap.appendChild(table);
  container.appendChild(wrap);
  if (opts.limit && rows.length > opts.limit) {
    wrap.appendChild(mk('p', { class: 'hint' }, T(`Se muestran ${opts.limit} de ${rows.length} filas.`, `Showing ${opts.limit} of ${rows.length} rows.`)));
  }
  return table;
}

Object.assign(window, {
  STEPS, el, els, mk, esc, L2, keepGreek, svgEl, showMessage, clearMessages, notice,
  fmtNum, fmtFixed, fmtPct, fmtTemp, fmtMm, plural, parseNum,
  MONTHS, MONTHS_SHORT, monthName, isLeap, daysInMonth, daysInYear, doy, fromDoy, dayNumber, fromDayNumber, addDays, parseISO, toISO, fmtDate, fmtDoy,
  csvEscape, download, slug, goStep, enableStep, Prefs, rng, randn, cssVar, Stat, statTiles, buildTable,
});

/* every place on the page that shows the version reads it from the constant */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.app-v').forEach(n => { n.textContent = APP_VERSION; });
});

/* ---------------- names for the controls inside editable tables ----------------
   The protocol, search log, screening, retrieval and reconciliation tables put
   a field in every cell and name it only with the column heading. A screen
   reader needs that name on the field itself: each unnamed field in a table
   cell gets «column heading (row n)» in the active language. Re-run whenever a
   table is redrawn and when the language changes. */
function nameTableFields(root) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  const textOf = n => { const s = n.querySelector(`[data-l="${lang}"]`); return (s || n).textContent.replace(/\s+/g, ' ').trim(); };
  (root || document).querySelectorAll('td input:not([type="hidden"]), td select, td textarea').forEach(c => {
    if (!c.dataset.autoName && (c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby') || c.title || c.closest('label') || (c.labels && c.labels.length))) return;
    const td = c.closest('td'), tr = td && td.parentElement, table = td && td.closest('table');
    const head = table && table.tHead && table.tHead.rows[0];
    if (!head || !tr) return;
    let col = 0;
    for (const cell of tr.cells) { if (cell === td) break; col += cell.colSpan || 1; }
    let th = null, at = 0;
    for (const cell of head.cells) { if (col < at + (cell.colSpan || 1)) { th = cell; break; } at += cell.colSpan || 1; }
    const name = th ? textOf(th) : '';
    if (!name) return;
    const row = tr.parentElement ? [...tr.parentElement.rows].indexOf(tr) + 1 : 0;
    c.setAttribute('aria-label', row ? `${name} (${lang === 'en' ? 'row' : 'fila'} ${row})` : name);
    c.dataset.autoName = '1';
  });
}
(function watchTableFields() {
  const start = () => {
    nameTableFields();
    if (!window.MutationObserver) return;
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      setTimeout(() => { pending = false; nameTableFields(); }, 150);
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  document.addEventListener('langchange', () => setTimeout(() => nameTableFields(), 0));
})();
