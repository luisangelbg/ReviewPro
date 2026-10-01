/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — Block 6 engine: data extraction and effect sizes.

   1. Recovering a standard deviation from whatever a paper reports. Field
      trials seldom print SDs: they print a standard error, a confidence
      interval, a coefficient of variation, or only the ANOVA summary — the
      least significant difference (LSD), the standard error of a difference
      (SED), the standard error of a treatment mean (SEM) or the experiment's
      CV. In a balanced design with r replicates all these come from the error
      mean square, and √MSE is the pooled SD of the plots:
          LSD = t(1 − α/2, df_e) · √(2 MSE / r)      SED = √(2 MSE / r)
          SEM = √(MSE / r)                            CV% = 100 √MSE / grand mean
      (Steel, Torrie & Dickey 1997; Gomez & Gomez 1984).
   2. Medians: mean and SD from the median with the quartiles or with the
      range (Wan, Wang, Liu & Tong 2014).
   3. Test statistics: a two-sample t, an F with one numerator degree of
      freedom, a two-sided p value, or the confidence interval of a mean
      difference, turned into the standardized difference d (Borenstein et
      al. 2009, ch. 7) and corrected into Hedges' g.
   4. Counts (2×2) and correlations go through Meta.ES. A precomputed effect
      with its SE or its CI is accepted as it is.
   5. Missing SDs can be imputed from the mean coefficient of variation of the
      studies that do report them (Lajeunesse 2013), flagged as imputed.
   Every conversion returns the value, the formula used and a warning when an
   assumption matters, so the extraction sheet documents itself. */

const Extract = {};

(function () {
  const has = v => v !== '' && v != null && isFinite(+v);
  const num = v => (has(v) ? +v : NaN);
  const z975 = 1.959963984540054;

  /* ---------- 1 · dispersion of one arm ----------
     d = {type, value, lo, hi, n, mean, level} → {sd, how, warn} */
  const DISP = {
    sd: ['Desviación estándar', 'Standard deviation'],
    se: ['Error estándar de la media', 'Standard error of the mean'],
    ci: ['Intervalo de confianza de la media', 'Confidence interval of the mean'],
    cv: ['Coeficiente de variación del tratamiento (%)', 'Coefficient of variation of the treatment (%)'],
    var: ['Varianza', 'Variance'],
  };
  function armSD(d, n, mean) {
    const t = d.type;
    if (t === 'sd') return has(d.value) ? { sd: +d.value, how: 'SD' } : null;
    if (t === 'var') return has(d.value) ? { sd: Math.sqrt(+d.value), how: 'SD = √var' } : null;
    if (t === 'se') return has(d.value) && n > 0 ? { sd: +d.value * Math.sqrt(n), how: 'SD = SE·√n' } : null;
    if (t === 'cv') return has(d.value) && has(mean) ? { sd: +d.value / 100 * Math.abs(mean), how: 'SD = CV·mean/100' } : null;
    if (t === 'ci') {
      if (!(has(d.lo) && has(d.hi) && n > 1)) return null;
      const level = has(d.level) ? +d.level : 0.95;
      /* the t quantile for small samples (Cochrane Handbook, 6.5.2.2) */
      const q = n < 60 ? Meta.qt(1 - (1 - level) / 2, n - 1) : Meta.qnorm(1 - (1 - level) / 2);
      return { sd: Math.sqrt(n) * (+d.hi - +d.lo) / (2 * q), how: `SD = √n·(U − L)/(2·${n < 60 ? 't' : 'z'})` };
    }
    return null;
  }

  /* ---------- the pooled SD from an ANOVA summary ----------
     a = {type: 'lsd'|'sed'|'sem'|'cvexp'|'mse', value, r, dfe, alpha, grand} */
  const ANOVA = {
    lsd: ['DMS (diferencia mínima significativa)', 'LSD (least significant difference)'],
    sed: ['Error estándar de la diferencia (EED)', 'Standard error of the difference (SED)'],
    sem: ['Error estándar de una media del ANOVA (EEM)', 'Standard error of a mean from the ANOVA (SEM)'],
    cvexp: ['CV del experimento (%)', 'CV of the experiment (%)'],
    mse: ['Cuadrado medio del error', 'Error mean square'],
  };
  function pooledSD(a) {
    const r = num(a.r), v = num(a.value);
    if (!has(a.value)) return null;
    switch (a.type) {
      case 'mse': return { sd: Math.sqrt(v), how: 'SD = √MSE' };
      case 'sem': return r > 0 ? { sd: v * Math.sqrt(r), how: 'SD = SEM·√r' } : null;
      case 'sed': return r > 0 ? { sd: v * Math.sqrt(r / 2), how: 'SD = SED·√(r/2)' } : null;
      case 'cvexp': return has(a.grand) ? { sd: v / 100 * num(a.grand), how: 'SD = CV·grand mean/100' } : null;
      case 'lsd': {
        const dfe = num(a.dfe), alpha = has(a.alpha) ? num(a.alpha) : 0.05;
        if (!(r > 0 && dfe > 0)) return null;
        const t = Meta.qt(1 - alpha / 2, dfe);
        return { sd: v / (t * Math.sqrt(2 / r)), how: `SD = LSD/(t(${1 - alpha / 2}, ${dfe})·√(2/r))`, t };
      }
    }
    return null;
  }
  /* degrees of freedom of the error when the paper does not print them */
  const DFE = {
    crd: (t, r) => t * (r - 1),                 // completely randomized
    rcbd: (t, r) => (t - 1) * (r - 1),          // randomized complete blocks
    latin: t => (t - 1) * (t - 2),              // Latin square (r = t)
  };

  /* ---------- 2 · medians (Wan et al. 2014) ---------- */
  function fromQuartiles(q1, m, q3, n) {
    if (![q1, m, q3].every(has) || !(n > 0)) return null;
    const xi = Meta.qnorm((0.75 * n - 0.125) / (n + 0.25));
    return { mean: (+q1 + +m + +q3) / 3, sd: (+q3 - +q1) / (2 * xi), how: 'Wan et al. 2014 (C3)' };
  }
  function fromRange(a, m, b, n) {
    if (![a, m, b].every(has) || !(n > 0)) return null;
    const xi = Meta.qnorm((n - 0.375) / (n + 0.25));
    return { mean: (+a + 2 * +m + +b) / 4, sd: (+b - +a) / (2 * xi), how: 'Wan et al. 2014 (C1)' };
  }

  /* ---------- 3 · test statistics → d ---------- */
  function dFromT(t, n1, n2) { return t * Math.sqrt(1 / n1 + 1 / n2); }
  function dFromP(p, n1, n2, sign) {
    const t = Meta.qt(1 - p / 2, n1 + n2 - 2);
    return (sign < 0 ? -1 : 1) * dFromT(t, n1, n2);
  }
  /* from a CI of the mean difference: SE = (U − L)/(2·t), SD_pooled = SE/√(1/n1 + 1/n2) */
  function sdFromDiffCI(lo, hi, n1, n2, level) {
    const L = level || 0.95;
    const q = Meta.qt(1 - (1 - L) / 2, n1 + n2 - 2);
    const se = (hi - lo) / (2 * q);
    return { sd: se / Math.sqrt(1 / n1 + 1 / n2), se };
  }
  /* d → Hedges' g and its variance (the same large-sample variance as Meta.ES.SMD) */
  function gFromD(d, n1, n2) {
    const J = Meta.hedgesJ(n1 + n2 - 2), g = J * d;
    return { yi: g, vi: 1 / n1 + 1 / n2 + g * g / (2 * (n1 + n2)), d, J };
  }

  /* ---------- the effect of one extraction row ----------
     row = {input, metric, T: {mean, n, disp, center, q1, q3, min, max},
            C: {...}, anova: {...}, stat: {t, F, p, sign, lo, hi, level},
            counts: {a, b, c, d}, corr: {r, n}, direct: {yi, se, lo, hi, vi}} */
  const INPUTS = {
    arms: ['Medias con dispersión por grupo', 'Means with dispersion per group'],
    anova: ['Medias con la DMS, EED, EEM o CV del ANOVA', 'Means with the ANOVA LSD, SED, SEM or CV'],
    medians: ['Medianas con cuartiles o rango', 'Medians with quartiles or range'],
    t: ['Estadístico t de dos grupos', 'Two-group t statistic'],
    F: ['Estadístico F con 1 gl en el numerador', 'F statistic with 1 numerator df'],
    p: ['Valor p bilateral', 'Two-sided p value'],
    diffci: ['IC de la diferencia de medias', 'CI of the mean difference'],
    counts: ['Conteos (tabla 2×2)', 'Counts (2×2 table)'],
    corr: ['Correlación', 'Correlation'],
    direct: ['Efecto ya calculado', 'Effect already computed'],
  };
  function compute(row) {
    const out = { steps: [], warn: [] };
    const m = row.metric || 'ROM';
    const T = row.T || {}, C = row.C || {};
    const n1 = num(T.n), n2 = num(C.n);
    const fail = msg => Object.assign(out, { ok: false, error: msg });
    const fromArms = (m1, s1, m2, s2) => {
      const e = Meta.ES[m] ? Meta.ES[m](m1, s1, n1, m2, s2, n2) : null;
      if (!e) return fail(m === 'ROM' ? ['La razón de respuesta necesita medias positivas y n de ambos grupos.', 'The response ratio needs positive means and both n.'] : ['Faltan datos para calcular el efecto.', 'Data are missing to compute the effect.']);
      return Object.assign(out, { ok: true, yi: e.yi, vi: e.vi, m1, m2, sd1: s1, sd2: s2 });
    };
    switch (row.input) {
      case 'arms': {
        let s1 = armSD(T.disp || {}, n1, num(T.mean)), s2 = armSD(C.disp || {}, n2, num(C.mean));
        /* a missing SD, imputed from the mean CV of the other groups when the user allows it */
        if (row.imputedCV > 0) {
          if (!s1 && has(T.mean)) { s1 = { sd: row.imputedCV * Math.abs(num(T.mean)), how: `SD = CV medio (${(100 * row.imputedCV).toFixed(1)} %)·mean` }; out.imputed = true; }
          if (!s2 && has(C.mean)) { s2 = { sd: row.imputedCV * Math.abs(num(C.mean)), how: `SD = CV medio (${(100 * row.imputedCV).toFixed(1)} %)·mean` }; out.imputed = true; }
          if (out.imputed) out.warn.push(['DE imputada con el CV medio de los demás grupos: inclúyela en un análisis de sensibilidad.', 'SD imputed from the mean CV of the other groups: include it in a sensitivity analysis.']);
        }
        if (!s1 || !s2) return fail(['Falta la dispersión de algún grupo.', 'The dispersion of a group is missing.']);
        out.steps.push(`T: ${s1.how} = ${s1.sd.toFixed(4)}`, `C: ${s2.how} = ${s2.sd.toFixed(4)}`);
        return fromArms(num(T.mean), s1.sd, num(C.mean), s2.sd);
      }
      case 'anova': {
        const a = Object.assign({}, row.anova || {});
        if (!has(a.r) && has(n1)) a.r = n1;
        if (!has(a.dfe) && a.design && DFE[a.design] && has(a.k)) a.dfe = DFE[a.design](num(a.k), num(a.r));
        if (!has(a.grand) && a.type === 'cvexp') out.warn.push(['Sin la media general se usó el promedio de los dos grupos: con más tratamientos en el ensayo, la DE queda aproximada.', 'Without the grand mean the average of both groups was used: with more treatments in the trial the SD is approximate.']);
        if (!has(a.grand)) a.grand = (num(T.mean) + num(C.mean)) / 2;
        const p = pooledSD(a);
        if (!p) return fail(['Faltan datos del ANOVA (valor, repeticiones y, para la DMS, gl del error).', 'ANOVA data are missing (value, replicates and, for the LSD, error df).']);
        out.steps.push(`${p.how} = ${p.sd.toFixed(4)}`);
        out.warn.push(['La DE común del ANOVA se usa en ambos grupos (supuesto de varianzas iguales del propio análisis).', 'The ANOVA pooled SD is used in both groups (the equal-variance assumption of the analysis itself).']);
        return fromArms(num(T.mean), p.sd, num(C.mean), p.sd);
      }
      case 'medians': {
        const f = X => (X.center === 'range' ? fromRange(X.min, X.median, X.max, num(X.n)) : fromQuartiles(X.q1, X.median, X.q3, num(X.n)));
        const a = f(T), b = f(C);
        if (!a || !b) return fail(['Faltan la mediana y sus cuartiles o su rango.', 'The median and its quartiles or range are missing.']);
        out.steps.push(`T: ${a.how}: mean ${a.mean.toFixed(4)}, SD ${a.sd.toFixed(4)}`, `C: ${b.how}: mean ${b.mean.toFixed(4)}, SD ${b.sd.toFixed(4)}`);
        out.warn.push(['La estimación desde medianas supone una distribución cercana a la normal; con datos muy asimétricos, analiza la sensibilidad sin estos estudios.', 'Estimating from medians assumes a near-normal distribution; with very skewed data, run a sensitivity analysis without these studies.']);
        return fromArms(a.mean, a.sd, b.mean, b.sd);
      }
      case 't': case 'F': case 'p': case 'diffci': {
        if (!(n1 > 1 && n2 > 1)) return fail(['Faltan los n de ambos grupos.', 'Both n are missing.']);
        const s = row.stat || {};
        let d;
        if (row.input === 't') { if (!has(s.t)) return fail(['Falta t.', 't is missing.']); d = dFromT(num(s.t), n1, n2); out.steps.push(`d = t·√(1/n1 + 1/n2) = ${d.toFixed(4)}`); }
        if (row.input === 'F') { if (!has(s.F)) return fail(['Falta F.', 'F is missing.']); d = (num(s.sign) < 0 ? -1 : 1) * dFromT(Math.sqrt(num(s.F)), n1, n2); out.steps.push(`t = √F; d = ${d.toFixed(4)}`); out.warn.push(['F no tiene signo: la dirección del efecto se toma del campo «dirección».', 'F has no sign: the direction of the effect comes from the "direction" field.']); }
        if (row.input === 'p') { if (!(num(s.p) > 0 && num(s.p) < 1)) return fail(['Falta p entre 0 y 1.', 'p between 0 and 1 is missing.']); d = dFromP(num(s.p), n1, n2, num(s.sign)); out.steps.push(`t = qt(1 − p/2, n1 + n2 − 2); d = ${d.toFixed(4)}`); out.warn.push(['Un valor p reportado como «p < 0.05» subestima el efecto; usa el p exacto cuando exista.', 'A p value reported as "p < 0.05" underestimates the effect; use the exact p when available.']); }
        if (row.input === 'diffci') {
          if (!has(s.lo) || !has(s.hi)) return fail(['Faltan los límites del IC.', 'The CI limits are missing.']);
          const q = sdFromDiffCI(num(s.lo), num(s.hi), n1, n2, has(s.level) ? num(s.level) : 0.95);
          const diff = has(s.diff) ? num(s.diff) : (num(s.lo) + num(s.hi)) / 2;
          if (m === 'MD') return Object.assign(out, { ok: true, yi: diff, vi: q.se * q.se });
          d = diff / q.sd;
          out.steps.push(`SE = (U − L)/(2t) = ${q.se.toFixed(4)}; SD = ${q.sd.toFixed(4)}; d = ${d.toFixed(4)}`);
        }
        if (m !== 'SMD') out.warn.push(['Desde un estadístico solo se obtiene la diferencia estandarizada (g); la medida se cambió a SMD.', 'From a test statistic only the standardized difference (g) can be obtained; the measure was switched to SMD.']);
        const g = gFromD(d, n1, n2);
        out.steps.push(`g = J·d, J = ${g.J.toFixed(4)}`);
        return Object.assign(out, { ok: true, yi: g.yi, vi: g.vi, metric: 'SMD' });
      }
      case 'counts': {
        const c = row.counts || {};
        const mm = ['RR', 'OR', 'RD'].includes(m) ? m : 'RR';
        const e = Meta.ES[mm](num(c.a), num(c.b), num(c.c), num(c.d));
        if (!e) return fail(['Faltan los cuatro conteos.', 'The four counts are missing.']);
        if ([c.a, c.b, c.c, c.d].some(v => +v === 0)) out.warn.push(['Una celda en cero: se sumó ½ a las cuatro.', 'A zero cell: ½ was added to all four.']);
        return Object.assign(out, { ok: true, yi: e.yi, vi: e.vi, metric: mm });
      }
      case 'corr': {
        const c = row.corr || {};
        const e = Meta.ES.ZCOR(num(c.r), num(c.n));
        if (!e) return fail(['Faltan r (entre −1 y 1) y n > 3.', 'r (between −1 and 1) and n > 3 are missing.']);
        return Object.assign(out, { ok: true, yi: e.yi, vi: e.vi, metric: 'ZCOR' });
      }
      case 'direct': {
        const d = row.direct || {};
        if (!has(d.yi)) return fail(['Falta el efecto.', 'The effect is missing.']);
        let vi = NaN;
        if (has(d.vi)) vi = num(d.vi);
        else if (has(d.se)) vi = num(d.se) ** 2;
        else if (has(d.lo) && has(d.hi)) { vi = ((num(d.hi) - num(d.lo)) / (2 * z975)) ** 2; out.steps.push('SE = (U − L)/(2·1.96)'); }
        if (!(vi > 0)) return fail(['Falta la varianza, el EE o el IC del efecto.', 'The variance, SE or CI of the effect is missing.']);
        out.warn.push(['Comprueba que el efecto y su IC estén en la misma escala que la medida elegida (p. ej., logaritmo de la razón).', 'Check that the effect and its CI are on the same scale as the chosen measure (e.g., log of the ratio).']);
        return Object.assign(out, { ok: true, yi: num(d.yi), vi });
      }
    }
    return fail(['Tipo de dato desconocido.', 'Unknown data type.']);
  }
  function result(row) {
    const r = compute(row);
    if (r.ok) {
      r.metric = r.metric || row.metric || 'ROM';
      r.se = Math.sqrt(r.vi);
      r.ci = [r.yi - z975 * r.se, r.yi + z975 * r.se];
      if (r.metric === 'ROM') r.pct = Meta.BACK.ROM(r.yi);
    }
    return r;
  }

  /* ---------- 5 · imputing missing SDs from the mean CV (Lajeunesse 2013) ----------
     rows: [{mean, sd}] per arm; returns the mean CV and the imputed SDs */
  function imputeCV(arms) {
    const known = arms.filter(a => has(a.mean) && has(a.sd) && +a.mean !== 0);
    if (!known.length) return null;
    const cv = known.reduce((s, a) => s + +a.sd / Math.abs(+a.mean), 0) / known.length;
    return { cv, n: known.length, sd: arms.map(a => (has(a.sd) ? +a.sd : has(a.mean) ? cv * Math.abs(+a.mean) : NaN)), imputed: arms.map(a => !has(a.sd) && has(a.mean)) };
  }

  /* ---------- forms ---------- */
  const TYPES = { text: ['Texto corto', 'Short text'], long: ['Texto largo', 'Long text'], number: ['Número', 'Number'], select: ['Lista (una opción)', 'List (one option)'], multi: ['Lista (varias opciones)', 'List (several options)'], yesno: ['Sí / no', 'Yes / no'], location: ['Coordenadas (lat, lon)', 'Coordinates (lat, lon)'] };
  let seq = 0;
  const F = (label, type, extra) => Object.assign({ id: 'f' + (++seq).toString(36) + Math.random().toString(36).slice(2, 5), label, type: type || 'text', options: '', required: false, section: '' }, extra || {});
  function template(type, protocol, L) {
    const t = (es, en) => (L === 'en' ? en : es);
    const sec = { g: t('Datos generales', 'General data'), d: t('Diseño', 'Design'), c: t('Contexto', 'Context'), m: t('Moderadores', 'Moderators'), q: t('Calidad de los datos', 'Data quality') };
    const common = [
      F(t('País', 'Country'), 'text', { section: sec.g, required: true }),
      F(t('Coordenadas del sitio', 'Site coordinates'), 'location', { section: sec.g }),
      F(t('Tipo de publicación', 'Publication type'), 'select', { section: sec.g, options: t('artículo; tesis; informe; actas', 'article; thesis; report; proceedings') }),
    ];
    const design = [
      F(t('Diseño experimental', 'Experimental design'), 'select', { section: sec.d, required: true, options: t('completamente al azar; bloques completos al azar; parcelas divididas; cuadrado latino; observacional; otro', 'completely randomized; randomized complete blocks; split plot; Latin square; observational; other') }),
      F(t('Repeticiones', 'Replicates'), 'number', { section: sec.d, required: true }),
      F(t('Número de ciclos o años', 'Number of seasons or years'), 'number', { section: sec.d }),
      F(t('Tratamientos en el ensayo', 'Treatments in the trial'), 'number', { section: sec.d }),
    ];
    let fields;
    if (type === 'narrative') fields = [F(t('Tema principal', 'Main theme'), 'text', { section: sec.g }), F(t('Argumento o hallazgo clave', 'Key argument or finding'), 'long', { section: sec.g }), F(t('Tipo de evidencia', 'Type of evidence'), 'select', { section: sec.g, options: t('experimental; observacional; revisión; teórica', 'experimental; observational; review; theoretical') }), F(t('Notas', 'Notes'), 'long', { section: sec.g })];
    else if (type === 'scoping') fields = common.concat([F(t('Diseño del estudio', 'Study design'), 'select', { section: sec.d, options: t('experimento; encuesta; estudio de caso; cualitativo; revisión; otro', 'experiment; survey; case study; qualitative; review; other') }), F(t('Prácticas o conceptos', 'Practices or concepts'), 'multi', { section: sec.c, options: '' }), F(t('Desenlaces medidos', 'Outcomes measured'), 'multi', { section: sec.c, options: t('productivos; ambientales; sociales; económicos', 'productive; environmental; social; economic') }), F(t('Escala', 'Scale'), 'select', { section: sec.c, options: t('parcela; finca; paisaje; región', 'plot; farm; landscape; region') })]);
    else fields = common.concat(design, [
      F(t('Cultivo, especie o variedad', 'Crop, species or variety'), 'text', { section: sec.c }),
      F(t('Descripción del tratamiento', 'Treatment description'), 'long', { section: sec.c }),
      F(t('Descripción del testigo', 'Control description'), 'long', { section: sec.c }),
      F(t('Origen de los datos numéricos', 'Source of the numerical data'), 'select', { section: sec.q, options: t('tabla; figura digitalizada; texto; enviados por los autores', 'table; digitized figure; text; sent by the authors') }),
    ]);
    /* the moderators declared in the protocol become fields */
    const mods = String((protocol && protocol.moderators) || '').split(/\s*;\s*/).map(s => s.trim()).filter(Boolean);
    mods.forEach(mo => { if (!fields.some(f => f.label.toLowerCase() === mo.toLowerCase())) fields.push(F(mo.charAt(0).toUpperCase() + mo.slice(1), /dosis|rate|cantidad|disponible|available|%|mg|kg|años|years|temperatura|precip/i.test(mo) ? 'number' : 'text', { section: sec.m })); });
    return fields;
  }
  const optionsOf = f => String(f.options || '').split(/\s*;\s*/).map(s => s.trim()).filter(Boolean);
  /* is a value empty? */
  const blankVal = v => v == null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !String(v.lat || '').trim() && !String(v.lon || '').trim());
  /* compare two reviewers' values for one field */
  function same(a, b, f) {
    if (blankVal(a) && blankVal(b)) return true;
    if (f.type === 'number') return has(a) && has(b) && Math.abs(+a - +b) <= 1e-9 * Math.max(1, Math.abs(+a));
    if (f.type === 'multi') return JSON.stringify([...(a || [])].sort()) === JSON.stringify([...(b || [])].sort());
    if (f.type === 'location') return a && b && +a.lat === +b.lat && +a.lon === +b.lon;
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  }
  function validLocation(v) { return v && has(v.lat) && has(v.lon) && Math.abs(+v.lat) <= 90 && Math.abs(+v.lon) <= 180; }

  Object.assign(Extract, { DISP, ANOVA, DFE, INPUTS, TYPES, armSD, pooledSD, fromQuartiles, fromRange, dFromT, dFromP, sdFromDiffCI, gFromD, compute, result, imputeCV, template, optionsOf, blankVal, same, validLocation, has });
  window.Extract = Extract;
})();
