/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — sample export files for Block 3, with a known truth.

   Thirty fictitious works (authors, journals, DOIs and abstracts are
   invented; the DOIs use the 10.5555 test prefix) are written into six files,
   one per supported format, as six different databases would export them.
   The same work reaches several files with the differences real exports
   show: capitals, a subtitle after a colon or a dash, "&" for "and", LaTeX
   accents, a missing DOI, a year one apart, a typing error in the title. Two
   DIFFERENT works share an identical title on purpose.

   Every record carries the id of its work (W01…W30) in the accession field,
   so the tests can check the parsers and the deduplication against the
   truth, and the user can load the files from the app or from the
   ejemplos/ folder. */

const Samples = {};

(function () {
  /* [id, title, authors, year, journal, vol, issue, pages, doi, type, keywords, topic] */
  const J = ['Journal of Field Agronomy', 'Soil Biology Letters', 'Crop Science Reports', 'Plant and Soil Research', 'Applied Soil Ecology Notes', 'Agronomy for Development'];
  const W = [
    ['W01', 'Arbuscular mycorrhizal inoculation increases maize grain yield in low-phosphorus soils of central Mexico', ['Ramírez Soto, Laura', 'Hernández, Julio C.', 'Vega, Marta'], 2019, J[0], '41', '3', '211-224', '10.5555/rp.2019.0101', 'article', ['arbuscular mycorrhizal fungi', 'maize', 'grain yield', 'phosphorus'], 'rel'],
    ['W02', 'Field performance of commercial mycorrhizal inoculants in rainfed maize', ['Okoth, Peter', 'Wanjiru, Grace'], 2021, J[5], '12', '1', '33-47', '10.5555/rp.2021.0202', 'article', ['inoculants', 'rainfed maize', 'yield'], 'rel'],
    ['W03', 'Maize yield response to Rhizophagus irregularis across twelve on-farm trials', ['Silva, Ana P.', 'Costa, Bruno', 'Lima, Daniela'], 2018, J[2], '58', '6', '2890-2902', '10.5555/rp.2018.0303', 'article', ['Rhizophagus irregularis', 'on-farm trials', 'maize yield'], 'rel'],
    ['W04', 'Does inoculation with arbuscular mycorrhizal fungi pay? Yield and profitability of maize in Kenya', ['Mutua, James', 'Otieno, Rose', 'Kariuki, Samuel'], 2020, J[5], '11', '4', '501-515', '10.5555/rp.2020.0404', 'article', ['profitability', 'maize', 'mycorrhizal inoculation'], 'rel'],
    ['W05', 'Mycorrhizal colonization and phosphorus uptake of maize under reduced fertilization', ['Zhang, Wei', 'Liu, Min'], 2017, J[3], '415', '1', '77-90', '10.5555/rp.2017.0505', 'article', ['phosphorus uptake', 'colonization', 'maize'], 'rel'],
    ['W06', 'Native versus commercial AMF inocula for maize production in the Bajío', ['Martínez, Alejandro', 'Ruiz Ortega, Sofía'], 2022, J[0], '44', '2', '145-158', '10.5555/rp.2022.0606', 'article', ['native inoculum', 'AMF', 'maize production'], 'rel'],
    ['W07', 'Arbuscular mycorrhizal fungi and maize tolerance to drought in field conditions', ['Becker, Hanna', 'Schulz, Tobias'], 2016, J[3], '402', '1', '19-33', '10.5555/rp.2016.0707', 'article', ['drought', 'arbuscular mycorrhizal fungi', 'maize'], 'rel'],
    ['W08', 'Maize grain yield after mycorrhizal inoculation: a three-season field study', ['Torres, Mariana', 'Díaz, Felipe'], 2015, J[0], '37', '5', '401-412', '', 'article', ['field study', 'maize', 'mycorrhizal inoculation'], 'rel'],
    ['W09', 'Effects of Funneliformis mosseae inoculation on yield components of field-grown maize', ['Kaur, Harpreet', 'Singh, Arjun'], 2014, J[2], '54', '2', '612-620', '10.5555/rp.2014.0909', 'article', ['Funneliformis mosseae', 'yield components'], 'rel'],
    ['W10', 'Inoculant formulation and maize yield in smallholder farms of Ethiopia', ['Tadesse, Abebe', 'Bekele, Hiwot'], 2019, J[5], '10', '2', '210-222', '10.5555/rp.2019.1010', 'article', ['smallholders', 'inoculant formulation'], 'rel'],
    ['W11', 'Mycorrhizae and phosphorus fertilization interact on maize productivity', ['Rossi, Giulia', 'Bianchi, Marco'], 2013, J[3], '370', '1', '355-367', '10.5555/rp.2013.1111', 'article', ['phosphorus fertilization', 'mycorrhizae'], 'rel'],
    ['W12', 'Tomato seedlings respond to arbuscular mycorrhizal fungi in greenhouse substrates', ['Nakamura, Ken', 'Sato, Yui'], 2018, J[4], '9', '2', '88-97', '10.5555/rp.2018.1212', 'article', ['tomato', 'greenhouse', 'substrates'], 'veg'],
    ['W13', 'Nitrogen fertilization rates for maize grain yield in the highlands', ['Quispe, Luis', 'Mamani, Elena'], 2020, J[0], '42', '4', '300-311', '10.5555/rp.2020.1313', 'article', ['nitrogen', 'maize', 'highlands'], 'fert'],
    ['W14', 'Fusarium ear rot incidence in maize fields and its relation to rainfall', ['Ionescu, Andrei', 'Popa, Irina'], 2019, J[2], '59', '1', '45-56', '10.5555/rp.2019.1414', 'article', ['Fusarium', 'ear rot', 'rainfall'], 'path'],
    ['W15', 'Soil microbial diversity under conservation tillage in maize-wheat rotations', ['Dubois, Claire', 'Martin, Hugo'], 2021, J[1], '15', '3', '120-133', '10.5555/rp.2021.1515', 'article', ['microbial diversity', 'conservation tillage'], 'micro'],
    ['W16', 'Biochar amendment and soil organic carbon in tropical Andosols', ['Fernández, Pablo', 'Lopes, Rita'], 2017, J[4], '8', '1', '15-27', '10.5555/rp.2017.1616', 'article', ['biochar', 'soil organic carbon'], 'biochar'],
    ['W17', 'Root colonization dynamics of arbuscular mycorrhizal fungi in maize hybrids', ['Novak, Petra', 'Horvat, Ivan'], 2015, J[3], '390', '1', '201-214', '10.5555/rp.2015.1717', 'article', ['root colonization', 'maize hybrids'], 'rel'],
    ['W18', 'Mycorrhizal inoculation of maize under contrasting tillage systems', ['García, Elena', 'Moreno, Iván'], 2023, J[0], '45', '1', '12-25', '10.5555/rp.2023.1818', 'article', ['tillage', 'mycorrhizal inoculation'], 'rel'],
    ['W19', 'A meta-analysis of biofertilizer effects on cereal yields', ['Andersson, Karl', 'Nilsson, Eva'], 2022, J[2], '62', '3', '1001-1019', '10.5555/rp.2022.1919', 'review', ['meta-analysis', 'biofertilizers', 'cereals'], 'rev'],
    ['W20', 'Phosphorus use efficiency of maize inoculated with Glomus intraradices in Brazil', ['Oliveira, Carla', 'Santos, Pedro'], 2018, J[3], '425', '1', '99-112', '10.5555/rp.2018.2020', 'article', ['phosphorus use efficiency', 'Glomus intraradices'], 'rel'],
    ['W21', 'Grain yield and nutrient uptake of maize with dual inoculation of rhizobacteria and mycorrhizal fungi', ['Hassan, Omar', 'Ali, Fatima'], 2020, J[4], '11', '3', '230-244', '10.5555/rp.2020.2121', 'article', ['dual inoculation', 'rhizobacteria'], 'rel'],
    ['W22', 'Mycorrhizal inoculants in sub-Saharan maize systems: evidence from farmer-managed trials', ['Banda, Chikondi', 'Phiri, Mercy'], 2024, J[5], '15', '1', '1-18', '10.5555/rp.2024.2222', 'article', ['sub-Saharan Africa', 'farmer-managed trials'], 'rel'],
    ['W23', 'Arbuscular mycorrhizal symbiosis modulates phosphate transporter expression in maize roots', ['Wang, Lei', 'Chen, Hui'], 2019, J[3], '440', '1', '55-70', '10.5555/rp.2019.2323', 'article', ['phosphate transporters', 'gene expression'], 'mol'],
    ['W24', 'Zinc nutrition of maize is improved by mycorrhizal colonization', ['Kowalski, Jan', 'Nowak, Anna'], 2016, J[1], '10', '2', '66-75', '10.5555/rp.2016.2424', 'article', ['zinc', 'micronutrients'], 'rel'],
    ['W25', 'Inoculación micorrízica y rendimiento de maíz de temporal en Chiapas', ['López Gómez, Andrés'], 2018, 'Universidad Autónoma Ficticia', '', '', '', '', 'thesis', ['inoculación', 'maíz de temporal', 'micorrizas'], 'rel'],
    ['W26', 'Validación de biofertilizantes en maíz, ciclo primavera-verano', ['Instituto Ficticio de Investigaciones Agrícolas'], 2020, 'Informe técnico 14', '', '', '', '', 'report', ['biofertilizantes', 'validación'], 'rel'],
    ['W27', 'Respuesta del maíz a la inoculación con micorrizas en suelos ácidos', ['Pérez Núñez, Ángel'], 2012, 'Colegio Ficticio de Posgraduados', '', '', '', '', 'thesis', ['suelos ácidos', 'micorrizas'], 'rel'],
    ['W28', 'Respuesta del maíz a la inoculación con micorrizas en suelos ácidos', ['Gómez, Rocío', 'Salas, Ernesto'], 2019, 'Revista Ficticia de Ciencias Agrícolas', '8', '2', '44-58', '', 'article', ['suelos ácidos', 'maíz'], 'rel'],
    ['W29', 'Arbuscular mycorrhizal fungi in maize agroecosystems of Oaxaca: diversity and function', ['Cruz, Beatriz', 'Mendoza, Raúl'], 2021, J[1], '16', '1', '80-95', '10.5555/rp.2021.2929', 'article', ['diversity', 'agroecosystems'], 'rel'],
    ['W30', 'Mycorrhizal inoculation effects on maize grain yield: preliminary results from Honduras', ['Reyes, Carlos', 'Flores, Ana'], 2012, J[0], '34', '2', '98-104', '10.5555/rp.2012.3030', 'article', ['preliminary results', 'Honduras'], 'rel'],
  ];
  const AB = {
    rel: w => `We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by ${8 + (+w[0].slice(1)) % 14}% on average, and the response was larger where available soil phosphorus was low.`,
    veg: () => 'Tomato seedlings were inoculated in pots with sterilized substrate under greenhouse conditions. Mycorrhizal colonization increased shoot phosphorus and biomass after six weeks.',
    fert: () => 'Field trials tested five nitrogen rates on maize in highland valleys over three seasons. Grain yield increased up to 150 kg N per hectare and declined thereafter.',
    path: () => 'Ear rot incidence and fumonisin contamination were recorded in 60 maize fields. Incidence was associated with rainfall at silking.',
    micro: () => 'Soil bacterial and fungal communities were profiled by amplicon sequencing under conservation and conventional tillage. Diversity was higher under conservation tillage.',
    biochar: () => 'Biochar was applied at four rates to tropical Andosols. Soil organic carbon and pH increased with the rate after two years.',
    rev: () => 'We pooled 214 field studies of biofertilizers on cereal yields with a random-effects model. The mean response was positive but highly heterogeneous among sites.',
    mol: () => 'Expression of phosphate transporter genes was quantified in mycorrhizal and non-mycorrhizal maize roots in growth chambers. The symbiosis down-regulated direct uptake pathways.',
  };
  const abs = w => (w[0] === 'W25' ? 'Se evaluó la inoculación con hongos micorrízicos arbusculares en maíz de temporal en ocho parcelas de productores de Chiapas. El rendimiento de grano aumentó 12 % en promedio respecto del testigo sin inocular.'
    : w[0] === 'W26' ? 'Se validaron tres biofertilizantes comerciales en maíz en 24 sitios durante el ciclo primavera-verano. El inoculante micorrízico aumentó el rendimiento en 9 % frente al testigo.'
    : w[0] === 'W27' ? 'Tesis de maestría. Se evaluó la respuesta del maíz a la inoculación micorrízica en suelos ácidos del trópico húmedo en macetas y en campo.'
    : w[0] === 'W28' ? 'Se estudió el efecto de dos inoculantes micorrízicos sobre el rendimiento de maíz en suelos ácidos de Veracruz durante dos ciclos.'
    : AB[w[11]](w));
  const work = id => W.find(w => w[0] === id);
  const rec = (id, ch) => { const w = work(id); const r = { id: w[0], title: w[1], authors: w[2].slice(), year: w[3], journal: w[4], volume: w[5], issue: w[6], pages: w[7], doi: w[8], type: w[9], keywords: w[10].slice(), abstract: abs(w) }; return Object.assign(r, ch || {}); };

  /* ---------- the six exports ---------- */
  const surnameInitials = a => { const [s, g] = a.split(','); return (s || '').trim() + (g ? ', ' + g.trim().split(/\s+/).map(x => x[0]).join('') : ''); };
  const ascii = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  function wrap(s, n, indent) {
    const words = s.split(' '), out = [];
    let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur);
    return out.join('\n' + indent);
  }
  const RIS_T = { article: 'JOUR', thesis: 'THES', report: 'RPRT', review: 'JOUR' };
  function ris(rs) {
    return rs.map(r => {
      const L = [`TY  - ${RIS_T[r.type] || 'GEN'}`];
      r.authors.forEach(a => L.push(`AU  - ${a}`));
      L.push(`TI  - ${r.title}`, `PY  - ${r.year}`, `T2  - ${r.journal}`);
      if (r.volume) L.push(`VL  - ${r.volume}`);
      if (r.issue) L.push(`IS  - ${r.issue}`);
      if (r.pages) { const [a, b] = r.pages.split('-'); L.push(`SP  - ${a}`, `EP  - ${b}`); }
      /* one abstract broken over two lines, as some exports do */
      if (r.id === 'W03') { const cut = r.abstract.indexOf('. ') + 1; L.push(`AB  - ${r.abstract.slice(0, cut)}`, r.abstract.slice(cut + 1)); }
      else L.push(`AB  - ${r.abstract}`);
      r.keywords.forEach(k => L.push(`KW  - ${k}`));
      if (r.doi) L.push(`DO  - ${r.doi}`);
      L.push(`AN  - ${r.id}`, 'ER  - ');
      return L.join('\r\n');
    }).join('\r\n\r\n') + '\r\n';
  }
  function tagged(rs) {
    const out = ['FN Exported records', 'VR 1.0'];
    rs.forEach(r => {
      out.push('PT J');
      out.push('AU ' + r.authors.map(a => ascii(surnameInitials(a))).join('\n   '));
      out.push('AF ' + r.authors.map(ascii).join('\n   '));
      out.push('TI ' + wrap(r.title, 60, '   '));
      out.push('SO ' + r.journal.toUpperCase());
      out.push('LA English', 'DT Article');
      out.push('DE ' + r.keywords.join('; '));
      out.push('AB ' + wrap(r.abstract, 70, '   '));
      out.push(`PY ${r.year}`, `VL ${r.volume}`, `IS ${r.issue}`);
      const [bp, ep] = (r.pages || '-').split('-');
      out.push(`BP ${bp}`, `EP ${ep}`);
      if (r.doi) out.push(`DI ${r.doi}`);
      out.push(`UT ${r.id}`, 'ER', '');
    });
    out.push('EF');
    return out.join('\n') + '\n';
  }
  function medline(rs) {
    return rs.map((r, i) => {
      const L = [`PMID- ${38000000 + i * 17}`, 'OWN - NLM', `DP  - ${r.year} Mar`, `TI  - ${wrap(r.title, 70, '      ')}`];
      if (r.pages) L.push(`PG  - ${r.pages}`);
      if (r.doi) L.push(`LID - ${r.doi} [doi]`);
      L.push(`AB  - ${wrap(r.abstract, 70, '      ')}`);
      r.authors.forEach(a => { L.push(`FAU - ${a}`, `AU  - ${ascii(surnameInitials(a)).replace(',', '').replace(/\.$/, '')}`); });
      L.push('LA  - eng', 'PT  - Journal Article', `TA  - ${r.journal.split(' ').map(w => w.slice(0, 4)).join(' ')}`, `JT  - ${r.journal}`);
      if (r.volume) L.push(`VI  - ${r.volume}`);
      if (r.issue) L.push(`IP  - ${r.issue}`);
      r.keywords.forEach(k => L.push(`OT  - ${k}`));
      L.push(`OID - ${r.id}`);
      return L.join('\n');
    }).join('\n\n') + '\n';
  }
  const texAcc = s => s.replace(/á/g, "{\\'a}").replace(/é/g, "{\\'e}").replace(/í/g, "{\\'i}").replace(/ó/g, "{\\'o}").replace(/ú/g, "{\\'u}").replace(/ñ/g, '{\\~n}').replace(/Á/g, "{\\'A}").replace(/Ñ/g, '{\\~N}');
  const BIB_T = { article: 'article', thesis: 'mastersthesis', report: 'techreport' };
  function bib(rs) {
    return rs.map((r, i) => {
      const t = BIB_T[r.type] || 'misc';
      const place = t === 'mastersthesis' ? 'school' : t === 'techreport' ? 'institution' : 'journal';
      const F = [`  author = {${r.authors.map(texAcc).join(' and ')}}`,
        i % 2 ? `  title = "${texAcc(r.title)}"` : `  title = {{${texAcc(r.title).replace(/^(\w)/, '{$1}')}}}`,
        `  year = ${r.year}`, `  ${place} = {${texAcc(r.journal)}}`];
      if (r.volume) F.push(`  volume = {${r.volume}}`);
      if (r.pages) F.push(`  pages = {${r.pages.replace('-', '--')}}`);
      F.push(`  abstract = {${texAcc(r.abstract)}}`, `  keywords = {${r.keywords.map(texAcc).join(', ')}}`);
      if (r.doi) F.push(`  doi = {${r.doi}}`);
      F.push(`  note = {${r.id}}`);
      return `@${t}{${r.id.toLowerCase()}_${r.year},\n${F.join(',\n')}\n}`;
    }).join('\n\n') + '\n';
  }
  function csv(rs) {
    const q = s => `"${String(s).replace(/"/g, '""')}"`;
    const out = ['ID;Título;Autores;Año;Revista;Resumen;DOI;Palabras clave'];
    rs.forEach(r => out.push([r.id, q(r.title), q(r.authors.join('; ')), r.year, q(r.journal), q(r.abstract), r.doi, q(r.keywords.join('; '))].join(';')));
    return '﻿' + out.join('\r\n') + '\r\n';
  }
  function enw(rs) {
    return rs.map(r => {
      const L = ['%0 Journal Article', `%T ${r.title}`];
      r.authors.forEach(a => L.push(`%A ${a}`));
      L.push(`%D ${r.year}`, `%J ${r.journal}`, `%V ${r.volume}`, `%N ${r.issue}`, `%P ${r.pages}`, `%X ${r.abstract}`);
      r.keywords.forEach(k => L.push(`%K ${k}`));
      if (r.doi) L.push(`%R ${r.doi}`);
      L.push(`%M ${r.id}`);
      return L.join('\n');
    }).join('\n\n') + '\n';
  }

  const ids = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => 'W' + String(a + i).padStart(2, '0'));
  function files() {
    return [
      { name: 'base1_multidisciplinaria.ris', format: 'ris', source: 'Base de citas multidisciplinaria 1', text: ris(ids(1, 16).map(id => rec(id))) },
      { name: 'base2_indice_de_citas.txt', format: 'tagged', source: 'Base de citas multidisciplinaria 2',
        text: tagged(ids(1, 6).map(id => rec(id, id === 'W03' || id === 'W05' ? { title: work(id)[1].toUpperCase() } : {})).concat(ids(17, 22).map(id => rec(id)))) },
      { name: 'base3_biomedica.nbib', format: 'medline', source: 'Base bibliográfica biomédica',
        text: medline([rec('W02', { doi: '' }), rec('W07'), rec('W17'), rec('W23'), rec('W24')]) },
      { name: 'repositorio_tesis.bib', format: 'bib', source: 'Repositorio de tesis',
        text: bib([rec('W08', { title: 'Maize grain yield after mycorrhizal inoculation - a three-season field study' }), rec('W25'), rec('W26'), rec('W27')]) },
      { name: 'repositorio_institucional.csv', format: 'csv', source: 'Repositorio institucional',
        text: csv([rec('W09', { title: 'Effects of Funneliformis mosseae inoculation on yield compnents of field-grown maize', doi: '' }), rec('W10', { year: 2020, doi: '' }), rec('W28'), rec('W29')]) },
      { name: 'busqueda_manual.enw', format: 'enw', source: 'Búsqueda manual en listas de referencias',
        text: enw([rec('W11', { title: 'Mycorrhizae & phosphorus fertilization interact on maize productivity', doi: '' }), rec('W30')]) },
    ];
  }
  /* what the tests expect */
  const TRUTH = {
    records: 43, works: 30,
    certain: 12,                 // duplicates the rules must merge by themselves
    probableDup: [['W09', 'W09']],  // a pair a person must confirm
    probableNot: [['W27', 'W28']],  // a pair a person must reject: same title, different works
    perFile: [16, 12, 5, 4, 4, 2],
  };
  /* a search strategy for the example meta-analysis, and its known relevant studies */
  const STRATEGY = {
    blocks: [
      { name: 'Población o sistema', facet: 'P', field: 'tiab', terms: ['maize', 'corn', '"zea mays"', 'maíz'].map(t => ({ t: t.replace(/"/g, ''), on: true })) },
      { name: 'Intervención', facet: 'I', field: 'tiab', terms: ['mycorrhiz*', 'arbuscular mycorrhizal', 'AMF', 'glomus', 'rhizophagus', 'funneliformis', 'micorri*', 'inoculant*'].map(t => ({ t, on: true })) },
      { name: 'Desenlace', facet: 'O', field: 'tiab', terms: ['yield*', 'grain yield', 'productivity', 'rendimiento'].map(t => ({ t, on: true })) },
    ],
    not: { field: 'tiab', terms: [] },
  };
  const GOLD = [{ title: work('W01')[1] }, { doi: '10.5555/rp.2018.0303' }, { title: work('W08')[1] }, { title: work('W25')[1] }];

  Object.assign(Samples, { WORKS: W, files, TRUTH, STRATEGY, GOLD, rec });
  window.Samples = Samples;
})();
