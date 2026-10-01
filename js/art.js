/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — hand-drawn SVG illustrations.
   Every picture is generated here with CSS-variable colours, so the whole app
   follows the light/dark theme and nothing depends on external images.
   Each function returns an SVG string. */

const Art = {};

(function () {

  const f1 = v => (+v).toFixed(1);
  const V = n => `var(--${n})`;
  function wrap(vb, inner, extra) { return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${extra || ''}>${inner}</svg>`; }
  function txt(x, y, s, fill, size, anchor, extra) {
    return `<text x="${f1(x)}" y="${f1(y)}" fill="${fill || V('text-muted')}" font-size="${size || 8}" text-anchor="${anchor || 'start'}" class="art-font" ${extra || ''}>${s}</text>`;
  }
  const line = (x1, y1, x2, y2, stroke, w, extra) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${stroke}" stroke-width="${w || 1}" ${extra || ''}/>`;
  const circ = (cx, cy, r, fill, extra) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" ${extra || ''}/>`;
  const rect = (x, y, w, h, fill, extra) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, w))}" height="${f1(Math.max(0, h))}" fill="${fill}" ${extra || ''}/>`;
  const path = (d, stroke, w, extra) => `<path d="${d}" stroke="${stroke}" stroke-width="${w || 1.4}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}/>`;
  const fillPath = (d, fill, extra) => `<path d="${d}" fill="${fill}" ${extra || ''}/>`;
  const L = (es, en) => (window.I18N && I18N.lang === 'en' ? en : es);

  /* a small page: a sheet with a folded corner and a few text lines */
  function page(x, y, w, h, tone, lines, mark) {
    const fold = Math.min(w, h) * 0.22;
    let s = fillPath(`M${f1(x)} ${f1(y)} h${f1(w - fold)} l${f1(fold)} ${f1(fold)} v${f1(h - fold)} h${f1(-w)} z`, V('card-bg'), `stroke="${V(tone || 'border-strong')}" stroke-width="1"`);
    s += fillPath(`M${f1(x + w - fold)} ${f1(y)} v${f1(fold)} h${f1(fold)} z`, V('bg-soft'), `stroke="${V(tone || 'border-strong')}" stroke-width="0.8"`);
    const n = lines == null ? 4 : lines;
    for (let i = 0; i < n; i++) {
      const ly = y + h * 0.3 + i * h * 0.15;
      if (ly > y + h - 3) break;
      s += line(x + w * 0.14, ly, x + w * (i === 0 ? 0.7 : i % 2 ? 0.84 : 0.62), ly, V('border-strong'), Math.max(0.8, h * 0.035), 'stroke-linecap="round"');
    }
    if (mark === 'in') s += circ(x + w * 0.8, y + h * 0.8, w * 0.14, V('leaf')) + path(`M${f1(x + w * 0.73)} ${f1(y + h * 0.8)} l${f1(w * 0.05)} ${f1(w * 0.05)} l${f1(w * 0.09)} ${f1(-w * 0.1)}`, '#fff', Math.max(1, w * 0.035));
    if (mark === 'out') s += circ(x + w * 0.8, y + h * 0.8, w * 0.14, V('rose')) + path(`M${f1(x + w * 0.74)} ${f1(y + h * 0.74)} l${f1(w * 0.12)} ${f1(w * 0.12)} M${f1(x + w * 0.86)} ${f1(y + h * 0.74)} l${f1(-w * 0.12)} ${f1(w * 0.12)}`, '#fff', Math.max(1, w * 0.035));
    if (mark === 'hl') s += rect(x + w * 0.12, y + h * 0.3 + h * 0.15 - h * 0.05, w * 0.6, h * 0.1, V('gold'), 'opacity="0.55" rx="1"');
    return s;
  }
  /* a forest-plot row: a square and its interval */
  function forestRow(x0, x1, y, lo, hi, est, size, tone) {
    const sx = v => x0 + v * (x1 - x0);
    return line(sx(lo), y, sx(hi), y, V(tone || 'text-muted'), 1.2) + rect(sx(est) - size / 2, y - size / 2, size, size, V(tone || 'primary'));
  }
  function diamond(cx, cy, hw, hh, fill) {
    return fillPath(`M${f1(cx - hw)} ${f1(cy)} L${f1(cx)} ${f1(cy - hh)} L${f1(cx + hw)} ${f1(cy)} L${f1(cx)} ${f1(cy + hh)} Z`, fill);
  }

  /* ---------------- brand ---------------- */
  Art.logo = () => wrap('0 0 32 32',
    fillPath('M6 4 h14 l6 6 v18 h-20 z', V('primary')) + fillPath('M20 4 v6 h6 z', V('primary-dark')) +
    line(10, 12, 18, 12, '#fff', 1.6, 'stroke-linecap="round" opacity="0.9"') +
    line(10, 16, 21, 16, '#fff', 1.6, 'stroke-linecap="round" opacity="0.7"') +
    circ(19.5, 21.5, 5.2, V('accent')) + circ(19.5, 21.5, 3, V('primary')) +
    line(23.2, 25.2, 27, 29, V('accent'), 2.6, 'stroke-linecap="round"'));

  /* ---------------- hero: the pile, the funnel and the synthesis ---------------- */
  Art.hero = () => {
    let s = '';
    /* the pile of records, left */
    const pile = [[18, 40], [34, 30], [50, 44], [26, 62], [44, 58], [60, 26], [14, 84], [32, 90], [52, 78], [68, 60], [70, 92], [22, 118], [42, 116], [62, 112]];
    pile.forEach(([x, y], i) => { s += page(x, y, 26, 32, 'border-strong', 3, i % 5 === 1 ? 'hl' : null); });
    s += txt(52, 170, L('miles de registros', 'thousands of records'), V('text-muted'), 9, 'middle');
    /* the funnel */
    s += fillPath('M112 34 L212 34 L180 104 L180 138 L144 150 L144 104 Z', V('primary-soft'), `stroke="${V('primary')}" stroke-width="1.4" stroke-linejoin="round"`);
    const bands = [[L('duplicados', 'duplicates'), 48], [L('título y resumen', 'title & abstract'), 72], [L('texto completo', 'full text'), 96]];
    bands.forEach(([t, y], i) => {
      const half = 50 - (y - 34) * 0.46;
      s += line(162 - half + 2, y, 162 + half - 2, y, V('primary'), 0.8, 'stroke-dasharray="3 2" opacity="0.7"');
      s += txt(218 - (y - 34) * 0.46 + 6, y + 3, t, V('text-muted'), 7.5);
      s += circ(162 - half + 8, y - 7, 2.2, V('rose'), 'opacity="0.8"') + circ(162 + half - 10, y - 9, 2.2, V('rose'), 'opacity="0.8"');
    });
    /* records flowing in and out */
    s += path('M84 60 C 96 56, 104 50, 118 44', V('primary'), 1.4, 'stroke-dasharray="4 3" opacity="0.8"');
    s += page(150, 112, 22, 27, 'leaf', 3, 'in');
    s += txt(162, 170, L('los que responden la pregunta', 'those that answer the question'), V('text-muted'), 9, 'middle');
    /* the synthesis: a forest plot on a page */
    const X = 268, Y = 28, W = 132, H = 128;
    s += rect(X, Y, W, H, V('card-bg'), `rx="8" stroke="${V('border-strong')}"`);
    s += line(X + 70, Y + 12, X + 70, Y + H - 12, V('border-strong'), 1, 'stroke-dasharray="3 2"');
    const rows = [[0.42, 0.78, 0.6, 5], [0.5, 0.95, 0.72, 7], [0.28, 0.66, 0.46, 4], [0.46, 0.7, 0.58, 8], [0.36, 1.0, 0.68, 4], [0.52, 0.86, 0.7, 6], [0.4, 0.62, 0.51, 9]];
    rows.forEach(([lo, hi, e, z], i) => { s += forestRow(X + 16, X + W - 14, Y + 18 + i * 12.5, lo, hi, e, z * 0.8, i === 6 ? 'accent' : 'primary'); });
    s += diamond(X + 16 + 0.61 * (W - 30), Y + H - 18, 13, 5.5, V('accent'));
    s += txt(X + W / 2, Y + H + 14, L('una síntesis que se sostiene', 'a synthesis that holds up'), V('text-muted'), 9, 'middle');
    s += path(`M214 118 C 232 112, 246 98, ${X - 4} 92`, V('accent'), 1.6, 'stroke-dasharray="4 3"');
    s += fillPath(`M${X - 4} 92 l-7 -4 l1 8 z`, V('accent'));
    return wrap('0 0 410 182', s, 'class="hero-svg"');
  };

  /* ---------------- the four review types ---------------- */
  Art.typeNarrative = () => wrap('0 0 80 60',
    page(10, 8, 28, 36, 'border-strong', 4) + page(26, 14, 28, 36, 'primary', 4, 'hl') +
    path('M52 44 q 8 -4 14 -16 l 4 3 q -6 12 -16 16 z', V('accent'), 1.2) + fillPath('M52 44 q 8 -4 14 -16 l 4 3 q -6 12 -16 16 z', V('accent-soft')));
  Art.typeScoping = () => {
    let s = '';
    const cells = [[0, 0, 3], [1, 0, 1], [2, 0, 0], [3, 0, 2], [0, 1, 2], [1, 1, 3], [2, 1, 1], [3, 1, 0], [0, 2, 0], [1, 2, 1], [2, 2, 3], [3, 2, 1]];
    cells.forEach(([c, r, v]) => { s += rect(14 + c * 14, 8 + r * 14, 12, 12, v ? V('primary') : V('bg-soft'), `rx="2" opacity="${v ? 0.25 + v * 0.25 : 1}" stroke="${V('border')}"`); });
    s += circ(64, 44, 8, 'none', `stroke="${V('accent')}" stroke-width="2"`) + line(70, 50, 76, 56, V('accent'), 2.4, 'stroke-linecap="round"');
    return wrap('0 0 80 60', s);
  };
  Art.typeSystematic = () => {
    let s = '';
    const box = (x, y, w) => rect(x, y, w, 9, V('card-bg'), `rx="2" stroke="${V('primary')}"`);
    s += box(14, 4, 52) + box(18, 18, 44) + box(24, 32, 32) + rect(30, 46, 20, 9, V('leaf'), 'rx="2"');
    s += line(40, 13, 40, 18, V('primary'), 1) + line(40, 27, 40, 32, V('primary'), 1) + line(40, 41, 40, 46, V('primary'), 1);
    s += rect(66, 20, 10, 6, V('rose'), 'rx="1.5" opacity="0.8"') + line(62, 23, 66, 23, V('rose'), 1) + rect(60, 34, 12, 6, V('rose'), 'rx="1.5" opacity="0.8"') + line(56, 37, 60, 37, V('rose'), 1);
    return wrap('0 0 80 60', s);
  };
  Art.typeMeta = () => {
    let s = line(40, 4, 40, 56, V('border-strong'), 1, 'stroke-dasharray="2 2"');
    [[0.3, 0.7, 0.52, 4], [0.45, 0.9, 0.66, 5], [0.2, 0.62, 0.4, 3.5], [0.42, 0.72, 0.58, 6]].forEach(([lo, hi, e, z], i) => { s += forestRow(8, 72, 9 + i * 10, lo, hi, e, z, 'primary'); });
    s += diamond(8 + 0.56 * 64, 51, 9, 4.5, V('accent'));
    return wrap('0 0 80 60', s);
  };

  /* ---------------- the nine working blocks ---------------- */
  Art.bProtocol = () => wrap('0 0 80 56', page(14, 6, 34, 44, 'primary', 5) +
    txt(62, 20, 'P', V('primary'), 9, 'middle', 'font-weight="800"') + txt(62, 31, 'I', V('accent'), 9, 'middle', 'font-weight="800"') +
    txt(62, 42, 'C', V('leaf'), 9, 'middle', 'font-weight="800"') + txt(62, 53, 'O', V('rose'), 9, 'middle', 'font-weight="800"'));
  Art.bSearch = () => wrap('0 0 80 56',
    rect(6, 10, 50, 14, V('card-bg'), `rx="7" stroke="${V('primary')}"`) + txt(12, 20, '(A OR B) AND C', V('text'), 6.5) +
    rect(8, 32, 14, 16, V('primary'), 'rx="2" opacity="0.35"') + rect(26, 30, 14, 18, V('primary'), 'rx="2" opacity="0.55"') + rect(44, 34, 14, 14, V('primary'), 'rx="2" opacity="0.8"') +
    circ(66, 30, 8, 'none', `stroke="${V('accent')}" stroke-width="2.2"`) + line(72, 36, 77, 42, V('accent'), 2.6, 'stroke-linecap="round"'));
  Art.bScreening = () => wrap('0 0 80 56',
    page(6, 6, 22, 28, 'border-strong', 3, 'in') + page(30, 10, 22, 28, 'border-strong', 3, 'out') + page(54, 6, 22, 28, 'border-strong', 3, 'hl') +
    path('M6 48 C 20 40, 30 38, 40 44 S 62 50, 76 44', V('primary'), 1.6) + txt(8, 54, 'recall', V('text-muted'), 5.5));
  Art.bFulltext = () => {
    let s = '';
    [[18, 4], [18, 16], [18, 28], [18, 40]].forEach(([x, y], i) => { s += rect(x, y, 30, 9, i === 3 ? V('leaf') : V('card-bg'), `rx="2" stroke="${V(i === 3 ? 'leaf' : 'primary')}"`); if (i < 3) s += line(33, y + 9, 33, y + 12, V('primary'), 1); });
    s += rect(56, 14, 20, 7, V('rose'), 'rx="1.5" opacity="0.75"') + rect(56, 26, 20, 7, V('rose'), 'rx="1.5" opacity="0.75"') + line(48, 20, 56, 18, V('rose'), 1) + line(48, 32, 56, 30, V('rose'), 1);
    return wrap('0 0 80 56', s);
  };
  Art.bExtraction = () => {
    let s = page(4, 8, 26, 34, 'primary', 4);
    s += path('M32 25 l8 0', V('accent'), 1.6) + fillPath('M40 21 l5 4 l-5 4 z', V('accent'));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) s += rect(48 + c * 10, 10 + r * 9, 9, 8, r === 0 ? V('primary') : V('card-bg'), `stroke="${V('border-strong')}" stroke-width="0.6" opacity="${r === 0 ? 0.55 : 1}"`);
    return wrap('0 0 80 56', s);
  };
  Art.bAppraisal = () => {
    let s = '';
    const cols = ['leaf', 'gold', 'rose'];
    const grid = [[0, 0, 1, 0, 2], [0, 1, 0, 0, 0], [1, 0, 0, 2, 1], [0, 0, 0, 1, 0]];
    grid.forEach((row, r) => row.forEach((v, c) => { s += circ(14 + c * 13, 12 + r * 11, 4.4, V(cols[v])); }));
    return wrap('0 0 80 56', s);
  };
  Art.bSynthesis = () => {
    let s = line(40, 4, 40, 44, V('border-strong'), 1, 'stroke-dasharray="2 2"');
    [[0.25, 0.7, 0.5, 4], [0.4, 0.85, 0.6, 5], [0.3, 0.6, 0.44, 4]].forEach(([lo, hi, e, z], i) => { s += forestRow(8, 72, 10 + i * 10, lo, hi, e, z, 'primary'); });
    s += diamond(8 + 0.52 * 64, 44, 8, 4, V('accent'));
    s += path('M8 54 q 16 -6 32 -2 t 32 -2', V('leaf'), 1.4);
    return wrap('0 0 80 56', s);
  };
  Art.bWriting = () => wrap('0 0 80 56',
    page(8, 4, 36, 48, 'primary', 6) + rect(12, 20, 20, 3.5, V('gold'), 'opacity="0.6" rx="1"') +
    path('M52 44 L70 14 l5 3 L57 47 l-6 2 z', V('text-muted'), 1.2) + fillPath('M52 44 L70 14 l5 3 L57 47 l-6 2 z', V('accent-soft')) +
    circ(62, 50, 2, V('leaf')) + circ(69, 50, 2, V('leaf')) + circ(76, 50, 2, V('rose')));
  Art.bReport = () => wrap('0 0 80 56',
    page(6, 4, 28, 36, 'border-strong', 4) + page(20, 10, 28, 36, 'primary', 4) +
    rect(52, 26, 24, 22, V('accent'), 'rx="3" opacity="0.85"') + rect(58, 22, 12, 6, V('accent'), 'rx="2"') +
    txt(64, 41, '.zip', '#fff', 7, 'middle', 'font-weight="700"'));

  /* ---------------- theory figures ---------------- */
  /* the recall curve: random reading vs prioritized reading, with WSS@95 */
  Art.figRecall = () => {
    const X0 = 36, X1 = 300, Y0 = 16, Y1 = 150;
    const sx = v => X0 + v * (X1 - X0), sy = v => Y1 - v * (Y1 - Y0);
    let s = line(X0, Y1, X1, Y1, V('border-strong')) + line(X0, Y0, X0, Y1, V('border-strong'));
    s += path(`M${sx(0)} ${sy(0)} L${sx(1)} ${sy(1)}`, V('text-muted'), 1.4, 'stroke-dasharray="4 3"');
    let d = '';
    for (let i = 0; i <= 50; i++) { const x = i / 50, y = 1 - Math.pow(1 - x, 9); d += (i ? 'L' : 'M') + f1(sx(x)) + ' ' + f1(sy(y)); }
    s += path(d, V('primary'), 2.2);
    const x95 = 1 - Math.pow(0.05, 1 / 9);
    s += line(sx(0), sy(0.95), sx(1), sy(0.95), V('accent'), 1, 'stroke-dasharray="2 2"');
    s += line(sx(x95), sy(0.95), sx(x95), Y1, V('accent'), 1);
    s += line(sx(0.95), sy(0.95), sx(0.95), Y1, V('text-muted'), 1, 'stroke-dasharray="2 2"');
    s += fillPath(`M${sx(x95)} ${Y1 - 4} h${f1(sx(0.95) - sx(x95))} v8 h${f1(sx(x95) - sx(0.95))} z`, V('accent'), 'opacity="0.35"');
    s += txt((sx(x95) + sx(0.95)) / 2, Y1 - 8, 'WSS@95', V('accent'), 9, 'middle', 'font-weight="700"');
    s += txt(sx(0.5) + 12, sy(0.5) + 18, L('lectura al azar', 'random reading'), V('text-muted'), 8.5);
    s += txt(sx(0.12), sy(0.8), L('lectura priorizada', 'prioritized reading'), V('primary'), 8.5);
    s += txt((X0 + X1) / 2, Y1 + 18, L('fracción de registros leídos', 'share of records read'), V('text-muted'), 8.5, 'middle');
    s += txt(12, (Y0 + Y1) / 2, L('relevantes encontrados', 'relevant found'), V('text-muted'), 8.5, 'middle', `transform="rotate(-90 12 ${(Y0 + Y1) / 2})"`);
    return wrap('0 0 310 176', s);
  };
  /* common effect vs random effects: one true effect, or a distribution of them */
  Art.figFeRe = () => {
    let s = '';
    const base = 120, sx = v => 20 + v * 130;
    s += txt(85, 16, L('efecto común', 'common effect'), V('text'), 9.5, 'middle', 'font-weight="700"');
    s += line(sx(0.5), 26, sx(0.5), base, V('accent'), 2);
    [0.35, 0.62, 0.44, 0.57, 0.5].forEach((m, i) => { s += forestRow(20, 150, 36 + i * 15, m - 0.12, m + 0.12, m, 5, 'primary'); });
    s += txt(85, base + 16, L('un solo θ; lo demás es azar', 'one θ; the rest is chance'), V('text-muted'), 8, 'middle');
    const ox = 170, sx2 = v => ox + 20 + v * 130;
    s += txt(ox + 85, 16, L('efectos aleatorios', 'random effects'), V('text'), 9.5, 'middle', 'font-weight="700"');
    let d = '';
    for (let i = 0; i <= 40; i++) { const x = i / 40, y = Math.exp(-((x - 0.5) ** 2) / (2 * 0.16 ** 2)); d += (i ? 'L' : 'M') + f1(sx2(x)) + ' ' + f1(base - 70 * y); }
    s += fillPath(d + `L${sx2(1)} ${base} L${sx2(0)} ${base} Z`, V('accent-soft'));
    s += path(d, V('accent'), 1.6);
    [0.28, 0.7, 0.42, 0.6, 0.52].forEach((m, i) => { s += forestRow(ox + 20, ox + 150, 36 + i * 15, m - 0.12, m + 0.12, m, 5, 'primary'); });
    s += txt(ox + 85, base + 16, L('cada estudio tiene su θᵢ ~ N(μ, τ²)', 'each study has its θᵢ ~ N(μ, τ²)'), V('text-muted'), 8, 'middle');
    return wrap('0 0 340 146', s);
  };

  /* placeholder for blocks still under construction */
  Art.soon = () => wrap('0 0 120 70', page(34, 6, 40, 52, 'border-strong', 5) + circ(84, 48, 12, V('accent-soft')) +
    path('M84 41 v8 l5 3', V('accent'), 2));

  window.Art = Art;
})();
