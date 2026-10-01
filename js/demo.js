/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — the complete example project: a meta-analysis of arbuscular
   mycorrhizal inoculation and maize grain yield, carried through the ten
   blocks (protocol, the six test files, two reviewers, 20 included studies,
   extraction, risk of bias, the multilevel meta-analysis and a draft
   manuscript). Everything in it is fictitious: records, studies, data and
   reviewers were generated for teaching and for the user's manual; the only
   named person is the public test identity of the ORCID documentation. */
window.DEMO_PROJECT =
{
 "format": "reviewpro-project",
 "version": 1,
 "app": "1.0.0",
 "saved": "2026-09-28T01:55:31.624Z",
 "reviewType": "meta",
 "protocol": {
  "title": "Efecto de la inoculación con hongos micorrízicos arbusculares sobre el rendimiento de grano de maíz en campo: revisión sistemática y meta-análisis",
  "type": "meta",
  "framework": "PICOS",
  "elements": {
   "P": "maíz (Zea mays L.) cultivado en campo",
   "I": "la inoculación con hongos micorrízicos arbusculares",
   "C": "el mismo manejo sin inocular",
   "O": "el rendimiento de grano",
   "S": "experimentos de campo con testigo y repeticiones"
  },
  "questionText": "",
  "background": "Los inoculantes micorrízicos se comercializan como una forma de reducir el fósforo aplicado sin perder rendimiento, pero los ensayos de campo publicados dan resultados contradictorios y las revisiones previas mezclan invernadero y campo o no estiman la heterogeneidad entre sitios.",
  "objectives": "Estimar el cambio medio en el rendimiento de grano del maíz inoculado frente al no inoculado en campo; cuantificar cuánto varía entre sitios; y explorar si el fósforo disponible del suelo, la dosis de fósforo aplicada y el tipo de inoculante explican esa variación.",
  "hypotheses": "El efecto medio es positivo y mayor en suelos con poco fósforo disponible.",
  "keywords": "micorrizas arbusculares; inoculantes; maíz; rendimiento; fósforo; meta-análisis",
  "criteria": [
   {
    "id": "I1",
    "kind": "inc",
    "facet": "P",
    "text": "Maíz de grano cultivado en campo, cualquier región y ciclo"
   },
   {
    "id": "I2",
    "kind": "inc",
    "facet": "I",
    "text": "Inoculación con hongos micorrízicos arbusculares (una especie o consorcio), en semilla o suelo"
   },
   {
    "id": "I3",
    "kind": "inc",
    "facet": "C",
    "text": "Testigo sin inocular con el mismo manejo agronómico"
   },
   {
    "id": "I4",
    "kind": "inc",
    "facet": "O",
    "text": "Rendimiento de grano con media, medida de dispersión y número de repeticiones (o datos para calcularlos)"
   },
   {
    "id": "I5",
    "kind": "inc",
    "facet": "S",
    "text": "Experimentos de campo con al menos tres repeticiones"
   },
   {
    "id": "E1",
    "kind": "exc",
    "facet": "S",
    "text": "Experimentos en maceta, invernadero o cámara de crecimiento"
   },
   {
    "id": "E2",
    "kind": "exc",
    "facet": "I",
    "text": "Inoculantes que combinan micorrizas con otros microorganismos sin tratamiento de micorrizas solas"
   },
   {
    "id": "E3",
    "kind": "exc",
    "facet": "pub",
    "text": "Revisiones, editoriales y resúmenes de congreso sin resultados completos"
   },
   {
    "id": "E4",
    "kind": "exc",
    "facet": "data",
    "text": "Estudios sin datos cuantitativos extraíbles tras contactar a los autores"
   },
   {
    "id": "E5",
    "kind": "exc",
    "facet": "dup",
    "text": "Publicaciones duplicadas del mismo experimento (se conserva la más completa)"
   },
   {
    "id": "E6",
    "kind": "exc",
    "facet": "I",
    "text": "No evalúa la inoculación con micorrizas arbusculares en maíz (otro tema)"
   }
  ],
  "years": {
   "from": "1990",
   "to": ""
  },
  "languages": "inglés, español, portugués",
  "pubTypes": [
   "journal",
   "thesis",
   "report"
  ],
  "outcomes": [
   {
    "name": "Rendimiento de grano",
    "role": "primary",
    "measure": "t/ha al 14 % de humedad"
   },
   {
    "name": "Colonización micorrízica de la raíz",
    "role": "secondary",
    "measure": "% de longitud de raíz colonizada"
   },
   {
    "name": "Absorción de fósforo",
    "role": "secondary",
    "measure": "kg P/ha en la parte aérea"
   }
  ],
  "moderators": "fósforo disponible del suelo; dosis de fósforo aplicada; tipo de inoculante (especie única o consorcio); clima (Köppen); años del experimento",
  "sources": [
   {
    "name": "Base de citas multidisciplinaria 1",
    "kind": "db",
    "note": "1990 a la fecha; título, resumen y palabras clave"
   },
   {
    "name": "Base de citas multidisciplinaria 2",
    "kind": "db",
    "note": "1990 a la fecha; tema (título, resumen, palabras clave)"
   },
   {
    "name": "Base bibliográfica biomédica",
    "kind": "db",
    "note": "1990 a la fecha; título y resumen"
   },
   {
    "name": "Repositorio de tesis",
    "kind": "grey",
    "note": "tesis de posgrado de universidades agrícolas"
   },
   {
    "name": "Repositorio institucional",
    "kind": "grey",
    "note": "informes técnicos de institutos de investigación agrícola"
   },
   {
    "name": "Búsqueda manual en listas de referencias",
    "kind": "other",
    "note": "hacia atrás y hacia adelante desde los incluidos"
   }
  ],
  "greyLit": "tesis de posgrado, informes técnicos de institutos nacionales de investigación agrícola y actas de congresos de la ciencia del suelo",
  "otherSearch": "Revisión de las listas de referencias de los estudios incluidos y de revisiones previas (búsqueda hacia atrás y hacia adelante)",
  "screening": {
   "reviewers": 2,
   "pilot": 50,
   "prioritized": true,
   "stop": "consecutive",
   "stopN": 100,
   "check": true,
   "fulltextDual": true,
   "kappa": 0.6,
   "disagreements": "third"
  },
  "extraction": {
   "dual": true,
   "contactAuthors": true,
   "items": "país y coordenadas; clima; tipo y fósforo disponible del suelo; híbrido o variedad; inoculante (especie, dosis, forma de aplicación); dosis de N y P; diseño experimental y repeticiones; años; medias, dispersión y n del rendimiento por tratamiento"
  },
  "appraisal": {
   "tool": "agro",
   "certainty": "grade"
  },
  "synthesis": {
   "approach": "meta",
   "metric": "ROM",
   "estimator": "REML",
   "knha": true,
   "subgroups": "fósforo disponible del suelo (bajo, medio, alto); tipo de inoculante; meta-regresión sobre la dosis de fósforo aplicada",
   "sensitivity": "excluir estudios de alto riesgo de sesgo; excluir estudios con dispersión imputada; análisis «dejando uno fuera»",
   "pubBias": true,
   "notes": "Los efectos múltiples de un mismo experimento se tratarán con un modelo multinivel o se promediarán dentro del estudio"
  },
  "team": [
   {
    "name": "Josiah Carberry",
    "aff": "Universidad ficticia, Departamento de Suelos",
    "email": "contacto@ejemplo.org",
    "orcid": "0000-0002-1825-0097",
    "roles": [
     "conc",
     "meth",
     "anal",
     "write",
     "guar"
    ]
   },
   {
    "name": "Investigadora 2",
    "aff": "Instituto ficticio de Agricultura",
    "email": "",
    "orcid": "",
    "roles": [
     "search",
     "screen",
     "extract"
    ]
   },
   {
    "name": "Investigador 3",
    "aff": "Universidad ficticia, Departamento de Suelos",
    "email": "",
    "orcid": "",
    "roles": [
     "screen",
     "extract",
     "write"
    ]
   }
  ],
  "contactIdx": 0,
  "funding": "Ninguno",
  "coi": "Los autores declaran no tener conflictos de interés; ninguno ha recibido apoyo de fabricantes de inoculantes.",
  "dates": {
   "start": "2026-10-01",
   "end": "2027-09-30"
  },
  "milestones": [
   {
    "name": "Protocolo y registro",
    "start": "2026-10-01",
    "end": "2026-11-07"
   },
   {
    "name": "Búsqueda",
    "start": "2026-11-07",
    "end": "2026-12-06"
   },
   {
    "name": "Cribado de título y resumen",
    "start": "2026-12-06",
    "end": "2027-02-06"
   },
   {
    "name": "Texto completo",
    "start": "2027-02-06",
    "end": "2027-03-22"
   },
   {
    "name": "Extracción",
    "start": "2027-03-22",
    "end": "2027-05-16"
   },
   {
    "name": "Riesgo de sesgo",
    "start": "2027-05-16",
    "end": "2027-06-22"
   },
   {
    "name": "Meta-análisis",
    "start": "2027-06-22",
    "end": "2027-07-29"
   },
   {
    "name": "Redacción",
    "start": "2027-07-29",
    "end": "2027-10-01"
   }
  ],
  "registration": {
   "registry": "prospero",
   "id": "",
   "lang": "en"
  },
  "amendments": "Toda enmienda se fechará, se justificará y se reportará en el registro y en el artículo.",
  "dissemination": "Artículo en revista arbitrada de acceso abierto y datos en un repositorio abierto."
 },
 "search": {
  "blocks": [
   {
    "name": "Población o sistema",
    "facet": "P",
    "field": "tiab",
    "terms": [
     {
      "t": "maize",
      "on": true
     },
     {
      "t": "corn",
      "on": true
     },
     {
      "t": "zea mays",
      "on": true
     },
     {
      "t": "maíz",
      "on": true
     }
    ]
   },
   {
    "name": "Intervención",
    "facet": "I",
    "field": "tiab",
    "terms": [
     {
      "t": "mycorrhiz*",
      "on": true
     },
     {
      "t": "arbuscular mycorrhizal",
      "on": true
     },
     {
      "t": "AMF",
      "on": true
     },
     {
      "t": "glomus",
      "on": true
     },
     {
      "t": "rhizophagus",
      "on": true
     },
     {
      "t": "funneliformis",
      "on": true
     },
     {
      "t": "micorri*",
      "on": true
     },
     {
      "t": "inoculant*",
      "on": true
     }
    ]
   },
   {
    "name": "Desenlace",
    "facet": "O",
    "field": "tiab",
    "terms": [
     {
      "t": "yield*",
      "on": true
     },
     {
      "t": "grain yield",
      "on": true
     },
     {
      "t": "productivity",
      "on": true
     },
     {
      "t": "rendimiento",
      "on": true
     }
    ]
   }
  ],
  "not": {
   "field": "tiab",
   "terms": []
  },
  "dialect": "func",
  "log": [
   {
    "source": "Base de citas multidisciplinaria 1",
    "dialect": "func",
    "date": "2026-11-10",
    "reported": "16"
   },
   {
    "source": "Base de citas multidisciplinaria 2",
    "dialect": "tag",
    "date": "2026-11-10",
    "reported": "12"
   },
   {
    "source": "Base bibliográfica biomédica",
    "dialect": "bracket",
    "date": "2026-11-11",
    "reported": "5"
   },
   {
    "source": "Repositorio de tesis",
    "dialect": "plain",
    "date": "2026-11-12",
    "reported": "4"
   },
   {
    "source": "Repositorio institucional",
    "dialect": "plain",
    "date": "2026-11-12",
    "reported": "4"
   },
   {
    "source": "Búsqueda manual en listas de referencias",
    "dialect": "plain",
    "date": "2027-02-20",
    "reported": "2"
   }
  ],
  "files": [
   {
    "id": "fmukfkoq6ujf",
    "name": "base1_multidisciplinaria.ris",
    "format": "ris",
    "source": "Base de citas multidisciplinaria 1",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Arbuscular mycorrhizal inoculation increases maize grain yield in low-phosphorus soils of central Mexico",
      "authors": [
       "Ramírez Soto, Laura",
       "Hernández, Julio C.",
       "Vega, Marta"
      ],
      "year": 2019,
      "journal": "Journal of Field Agronomy",
      "volume": "41",
      "issue": "3",
      "pages": "211–224",
      "doi": "10.5555/rp.2019.0101",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 9% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "arbuscular mycorrhizal fungi",
       "maize",
       "grain yield",
       "phosphorus"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W01",
      "uid": "fmukfkoq6ujf:0",
      "src": "Base de citas multidisciplinaria 1",
      "order": 0
     },
     {
      "title": "Field performance of commercial mycorrhizal inoculants in rainfed maize",
      "authors": [
       "Okoth, Peter",
       "Wanjiru, Grace"
      ],
      "year": 2021,
      "journal": "Agronomy for Development",
      "volume": "12",
      "issue": "1",
      "pages": "33–47",
      "doi": "10.5555/rp.2021.0202",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 10% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "inoculants",
       "rainfed maize",
       "yield"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W02",
      "uid": "fmukfkoq6ujf:1",
      "src": "Base de citas multidisciplinaria 1",
      "order": 1
     },
     {
      "title": "Maize yield response to Rhizophagus irregularis across twelve on-farm trials",
      "authors": [
       "Silva, Ana P.",
       "Costa, Bruno",
       "Lima, Daniela"
      ],
      "year": 2018,
      "journal": "Crop Science Reports",
      "volume": "58",
      "issue": "6",
      "pages": "2890–2902",
      "doi": "10.5555/rp.2018.0303",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 11% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "Rhizophagus irregularis",
       "on-farm trials",
       "maize yield"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W03",
      "uid": "fmukfkoq6ujf:2",
      "src": "Base de citas multidisciplinaria 1",
      "order": 2
     },
     {
      "title": "Does inoculation with arbuscular mycorrhizal fungi pay? Yield and profitability of maize in Kenya",
      "authors": [
       "Mutua, James",
       "Otieno, Rose",
       "Kariuki, Samuel"
      ],
      "year": 2020,
      "journal": "Agronomy for Development",
      "volume": "11",
      "issue": "4",
      "pages": "501–515",
      "doi": "10.5555/rp.2020.0404",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 12% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "profitability",
       "maize",
       "mycorrhizal inoculation"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W04",
      "uid": "fmukfkoq6ujf:3",
      "src": "Base de citas multidisciplinaria 1",
      "order": 3
     },
     {
      "title": "Mycorrhizal colonization and phosphorus uptake of maize under reduced fertilization",
      "authors": [
       "Zhang, Wei",
       "Liu, Min"
      ],
      "year": 2017,
      "journal": "Plant and Soil Research",
      "volume": "415",
      "issue": "1",
      "pages": "77–90",
      "doi": "10.5555/rp.2017.0505",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 13% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "phosphorus uptake",
       "colonization",
       "maize"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W05",
      "uid": "fmukfkoq6ujf:4",
      "src": "Base de citas multidisciplinaria 1",
      "order": 4
     },
     {
      "title": "Native versus commercial AMF inocula for maize production in the Bajío",
      "authors": [
       "Martínez, Alejandro",
       "Ruiz Ortega, Sofía"
      ],
      "year": 2022,
      "journal": "Journal of Field Agronomy",
      "volume": "44",
      "issue": "2",
      "pages": "145–158",
      "doi": "10.5555/rp.2022.0606",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 14% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "native inoculum",
       "AMF",
       "maize production"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W06",
      "uid": "fmukfkoq6ujf:5",
      "src": "Base de citas multidisciplinaria 1",
      "order": 5
     },
     {
      "title": "Arbuscular mycorrhizal fungi and maize tolerance to drought in field conditions",
      "authors": [
       "Becker, Hanna",
       "Schulz, Tobias"
      ],
      "year": 2016,
      "journal": "Plant and Soil Research",
      "volume": "402",
      "issue": "1",
      "pages": "19–33",
      "doi": "10.5555/rp.2016.0707",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 15% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "drought",
       "arbuscular mycorrhizal fungi",
       "maize"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W07",
      "uid": "fmukfkoq6ujf:6",
      "src": "Base de citas multidisciplinaria 1",
      "order": 6
     },
     {
      "title": "Maize grain yield after mycorrhizal inoculation: a three-season field study",
      "authors": [
       "Torres, Mariana",
       "Díaz, Felipe"
      ],
      "year": 2015,
      "journal": "Journal of Field Agronomy",
      "volume": "37",
      "issue": "5",
      "pages": "401–412",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 16% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "field study",
       "maize",
       "mycorrhizal inoculation"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W08",
      "uid": "fmukfkoq6ujf:7",
      "src": "Base de citas multidisciplinaria 1",
      "order": 7
     },
     {
      "title": "Effects of Funneliformis mosseae inoculation on yield components of field-grown maize",
      "authors": [
       "Kaur, Harpreet",
       "Singh, Arjun"
      ],
      "year": 2014,
      "journal": "Crop Science Reports",
      "volume": "54",
      "issue": "2",
      "pages": "612–620",
      "doi": "10.5555/rp.2014.0909",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 17% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "Funneliformis mosseae",
       "yield components"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W09",
      "uid": "fmukfkoq6ujf:8",
      "src": "Base de citas multidisciplinaria 1",
      "order": 8
     },
     {
      "title": "Inoculant formulation and maize yield in smallholder farms of Ethiopia",
      "authors": [
       "Tadesse, Abebe",
       "Bekele, Hiwot"
      ],
      "year": 2019,
      "journal": "Agronomy for Development",
      "volume": "10",
      "issue": "2",
      "pages": "210–222",
      "doi": "10.5555/rp.2019.1010",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 18% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "smallholders",
       "inoculant formulation"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W10",
      "uid": "fmukfkoq6ujf:9",
      "src": "Base de citas multidisciplinaria 1",
      "order": 9
     },
     {
      "title": "Mycorrhizae and phosphorus fertilization interact on maize productivity",
      "authors": [
       "Rossi, Giulia",
       "Bianchi, Marco"
      ],
      "year": 2013,
      "journal": "Plant and Soil Research",
      "volume": "370",
      "issue": "1",
      "pages": "355–367",
      "doi": "10.5555/rp.2013.1111",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 19% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "phosphorus fertilization",
       "mycorrhizae"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W11",
      "uid": "fmukfkoq6ujf:10",
      "src": "Base de citas multidisciplinaria 1",
      "order": 10
     },
     {
      "title": "Tomato seedlings respond to arbuscular mycorrhizal fungi in greenhouse substrates",
      "authors": [
       "Nakamura, Ken",
       "Sato, Yui"
      ],
      "year": 2018,
      "journal": "Applied Soil Ecology Notes",
      "volume": "9",
      "issue": "2",
      "pages": "88–97",
      "doi": "10.5555/rp.2018.1212",
      "abstract": "Tomato seedlings were inoculated in pots with sterilized substrate under greenhouse conditions. Mycorrhizal colonization increased shoot phosphorus and biomass after six weeks.",
      "keywords": [
       "tomato",
       "greenhouse",
       "substrates"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W12",
      "uid": "fmukfkoq6ujf:11",
      "src": "Base de citas multidisciplinaria 1",
      "order": 11
     },
     {
      "title": "Nitrogen fertilization rates for maize grain yield in the highlands",
      "authors": [
       "Quispe, Luis",
       "Mamani, Elena"
      ],
      "year": 2020,
      "journal": "Journal of Field Agronomy",
      "volume": "42",
      "issue": "4",
      "pages": "300–311",
      "doi": "10.5555/rp.2020.1313",
      "abstract": "Field trials tested five nitrogen rates on maize in highland valleys over three seasons. Grain yield increased up to 150 kg N per hectare and declined thereafter.",
      "keywords": [
       "nitrogen",
       "maize",
       "highlands"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W13",
      "uid": "fmukfkoq6ujf:12",
      "src": "Base de citas multidisciplinaria 1",
      "order": 12
     },
     {
      "title": "Fusarium ear rot incidence in maize fields and its relation to rainfall",
      "authors": [
       "Ionescu, Andrei",
       "Popa, Irina"
      ],
      "year": 2019,
      "journal": "Crop Science Reports",
      "volume": "59",
      "issue": "1",
      "pages": "45–56",
      "doi": "10.5555/rp.2019.1414",
      "abstract": "Ear rot incidence and fumonisin contamination were recorded in 60 maize fields. Incidence was associated with rainfall at silking.",
      "keywords": [
       "Fusarium",
       "ear rot",
       "rainfall"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W14",
      "uid": "fmukfkoq6ujf:13",
      "src": "Base de citas multidisciplinaria 1",
      "order": 13
     },
     {
      "title": "Soil microbial diversity under conservation tillage in maize-wheat rotations",
      "authors": [
       "Dubois, Claire",
       "Martin, Hugo"
      ],
      "year": 2021,
      "journal": "Soil Biology Letters",
      "volume": "15",
      "issue": "3",
      "pages": "120–133",
      "doi": "10.5555/rp.2021.1515",
      "abstract": "Soil bacterial and fungal communities were profiled by amplicon sequencing under conservation and conventional tillage. Diversity was higher under conservation tillage.",
      "keywords": [
       "microbial diversity",
       "conservation tillage"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W15",
      "uid": "fmukfkoq6ujf:14",
      "src": "Base de citas multidisciplinaria 1",
      "order": 14
     },
     {
      "title": "Biochar amendment and soil organic carbon in tropical Andosols",
      "authors": [
       "Fernández, Pablo",
       "Lopes, Rita"
      ],
      "year": 2017,
      "journal": "Applied Soil Ecology Notes",
      "volume": "8",
      "issue": "1",
      "pages": "15–27",
      "doi": "10.5555/rp.2017.1616",
      "abstract": "Biochar was applied at four rates to tropical Andosols. Soil organic carbon and pH increased with the rate after two years.",
      "keywords": [
       "biochar",
       "soil organic carbon"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W16",
      "uid": "fmukfkoq6ujf:15",
      "src": "Base de citas multidisciplinaria 1",
      "order": 15
     }
    ],
    "info": {}
   },
   {
    "id": "fmukfkoq7sf7",
    "name": "base2_indice_de_citas.txt",
    "format": "tagged",
    "source": "Base de citas multidisciplinaria 2",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Arbuscular mycorrhizal inoculation increases maize grain yield in low-phosphorus soils of central Mexico",
      "authors": [
       "Ramirez Soto, Laura",
       "Hernandez, Julio C.",
       "Vega, Marta"
      ],
      "year": 2019,
      "journal": "JOURNAL OF FIELD AGRONOMY",
      "volume": "41",
      "issue": "3",
      "pages": "211–224",
      "doi": "10.5555/rp.2019.0101",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 9% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "arbuscular mycorrhizal fungi",
       "maize",
       "grain yield",
       "phosphorus"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W01",
      "uid": "fmukfkoq7sf7:0",
      "src": "Base de citas multidisciplinaria 2",
      "order": 16
     },
     {
      "title": "Field performance of commercial mycorrhizal inoculants in rainfed maize",
      "authors": [
       "Okoth, Peter",
       "Wanjiru, Grace"
      ],
      "year": 2021,
      "journal": "AGRONOMY FOR DEVELOPMENT",
      "volume": "12",
      "issue": "1",
      "pages": "33–47",
      "doi": "10.5555/rp.2021.0202",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 10% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "inoculants",
       "rainfed maize",
       "yield"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W02",
      "uid": "fmukfkoq7sf7:1",
      "src": "Base de citas multidisciplinaria 2",
      "order": 17
     },
     {
      "title": "MAIZE YIELD RESPONSE TO RHIZOPHAGUS IRREGULARIS ACROSS TWELVE ON-FARM TRIALS",
      "authors": [
       "Silva, Ana P.",
       "Costa, Bruno",
       "Lima, Daniela"
      ],
      "year": 2018,
      "journal": "CROP SCIENCE REPORTS",
      "volume": "58",
      "issue": "6",
      "pages": "2890–2902",
      "doi": "10.5555/rp.2018.0303",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 11% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "Rhizophagus irregularis",
       "on-farm trials",
       "maize yield"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W03",
      "uid": "fmukfkoq7sf7:2",
      "src": "Base de citas multidisciplinaria 2",
      "order": 18
     },
     {
      "title": "Does inoculation with arbuscular mycorrhizal fungi pay? Yield and profitability of maize in Kenya",
      "authors": [
       "Mutua, James",
       "Otieno, Rose",
       "Kariuki, Samuel"
      ],
      "year": 2020,
      "journal": "AGRONOMY FOR DEVELOPMENT",
      "volume": "11",
      "issue": "4",
      "pages": "501–515",
      "doi": "10.5555/rp.2020.0404",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 12% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "profitability",
       "maize",
       "mycorrhizal inoculation"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W04",
      "uid": "fmukfkoq7sf7:3",
      "src": "Base de citas multidisciplinaria 2",
      "order": 19
     },
     {
      "title": "MYCORRHIZAL COLONIZATION AND PHOSPHORUS UPTAKE OF MAIZE UNDER REDUCED FERTILIZATION",
      "authors": [
       "Zhang, Wei",
       "Liu, Min"
      ],
      "year": 2017,
      "journal": "PLANT AND SOIL RESEARCH",
      "volume": "415",
      "issue": "1",
      "pages": "77–90",
      "doi": "10.5555/rp.2017.0505",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 13% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "phosphorus uptake",
       "colonization",
       "maize"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W05",
      "uid": "fmukfkoq7sf7:4",
      "src": "Base de citas multidisciplinaria 2",
      "order": 20
     },
     {
      "title": "Native versus commercial AMF inocula for maize production in the Bajío",
      "authors": [
       "Martinez, Alejandro",
       "Ruiz Ortega, Sofia"
      ],
      "year": 2022,
      "journal": "JOURNAL OF FIELD AGRONOMY",
      "volume": "44",
      "issue": "2",
      "pages": "145–158",
      "doi": "10.5555/rp.2022.0606",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 14% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "native inoculum",
       "AMF",
       "maize production"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W06",
      "uid": "fmukfkoq7sf7:5",
      "src": "Base de citas multidisciplinaria 2",
      "order": 21
     },
     {
      "title": "Root colonization dynamics of arbuscular mycorrhizal fungi in maize hybrids",
      "authors": [
       "Novak, Petra",
       "Horvat, Ivan"
      ],
      "year": 2015,
      "journal": "PLANT AND SOIL RESEARCH",
      "volume": "390",
      "issue": "1",
      "pages": "201–214",
      "doi": "10.5555/rp.2015.1717",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 11% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "root colonization",
       "maize hybrids"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W17",
      "uid": "fmukfkoq7sf7:6",
      "src": "Base de citas multidisciplinaria 2",
      "order": 22
     },
     {
      "title": "Mycorrhizal inoculation of maize under contrasting tillage systems",
      "authors": [
       "Garcia, Elena",
       "Moreno, Ivan"
      ],
      "year": 2023,
      "journal": "JOURNAL OF FIELD AGRONOMY",
      "volume": "45",
      "issue": "1",
      "pages": "12–25",
      "doi": "10.5555/rp.2023.1818",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 12% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "tillage",
       "mycorrhizal inoculation"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W18",
      "uid": "fmukfkoq7sf7:7",
      "src": "Base de citas multidisciplinaria 2",
      "order": 23
     },
     {
      "title": "A meta-analysis of biofertilizer effects on cereal yields",
      "authors": [
       "Andersson, Karl",
       "Nilsson, Eva"
      ],
      "year": 2022,
      "journal": "CROP SCIENCE REPORTS",
      "volume": "62",
      "issue": "3",
      "pages": "1001–1019",
      "doi": "10.5555/rp.2022.1919",
      "abstract": "We pooled 214 field studies of biofertilizers on cereal yields with a random-effects model. The mean response was positive but highly heterogeneous among sites.",
      "keywords": [
       "meta-analysis",
       "biofertilizers",
       "cereals"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W19",
      "uid": "fmukfkoq7sf7:8",
      "src": "Base de citas multidisciplinaria 2",
      "order": 24
     },
     {
      "title": "Phosphorus use efficiency of maize inoculated with Glomus intraradices in Brazil",
      "authors": [
       "Oliveira, Carla",
       "Santos, Pedro"
      ],
      "year": 2018,
      "journal": "PLANT AND SOIL RESEARCH",
      "volume": "425",
      "issue": "1",
      "pages": "99–112",
      "doi": "10.5555/rp.2018.2020",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 14% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "phosphorus use efficiency",
       "Glomus intraradices"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W20",
      "uid": "fmukfkoq7sf7:9",
      "src": "Base de citas multidisciplinaria 2",
      "order": 25
     },
     {
      "title": "Grain yield and nutrient uptake of maize with dual inoculation of rhizobacteria and mycorrhizal fungi",
      "authors": [
       "Hassan, Omar",
       "Ali, Fatima"
      ],
      "year": 2020,
      "journal": "APPLIED SOIL ECOLOGY NOTES",
      "volume": "11",
      "issue": "3",
      "pages": "230–244",
      "doi": "10.5555/rp.2020.2121",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 15% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "dual inoculation",
       "rhizobacteria"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W21",
      "uid": "fmukfkoq7sf7:10",
      "src": "Base de citas multidisciplinaria 2",
      "order": 26
     },
     {
      "title": "Mycorrhizal inoculants in sub-Saharan maize systems: evidence from farmer-managed trials",
      "authors": [
       "Banda, Chikondi",
       "Phiri, Mercy"
      ],
      "year": 2024,
      "journal": "AGRONOMY FOR DEVELOPMENT",
      "volume": "15",
      "issue": "1",
      "pages": "1–18",
      "doi": "10.5555/rp.2024.2222",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 16% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "sub-Saharan Africa",
       "farmer-managed trials"
      ],
      "url": "",
      "language": "English",
      "type": "article",
      "accession": "W22",
      "uid": "fmukfkoq7sf7:11",
      "src": "Base de citas multidisciplinaria 2",
      "order": 27
     }
    ],
    "info": {}
   },
   {
    "id": "fmukfkoq7bct",
    "name": "base3_biomedica.nbib",
    "format": "medline",
    "source": "Base bibliográfica biomédica",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Field performance of commercial mycorrhizal inoculants in rainfed maize",
      "authors": [
       "Okoth, Peter",
       "Wanjiru, Grace"
      ],
      "year": 2021,
      "journal": "Agronomy for Development",
      "volume": "12",
      "issue": "1",
      "pages": "33-47",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 10% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "inoculants",
       "rainfed maize",
       "yield"
      ],
      "url": "",
      "language": "eng",
      "type": "article",
      "accession": "W02",
      "uid": "fmukfkoq7bct:0",
      "src": "Base bibliográfica biomédica",
      "order": 28
     },
     {
      "title": "Arbuscular mycorrhizal fungi and maize tolerance to drought in field conditions",
      "authors": [
       "Becker, Hanna",
       "Schulz, Tobias"
      ],
      "year": 2016,
      "journal": "Plant and Soil Research",
      "volume": "402",
      "issue": "1",
      "pages": "19-33",
      "doi": "10.5555/rp.2016.0707",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 15% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "drought",
       "arbuscular mycorrhizal fungi",
       "maize"
      ],
      "url": "",
      "language": "eng",
      "type": "article",
      "accession": "W07",
      "uid": "fmukfkoq7bct:1",
      "src": "Base bibliográfica biomédica",
      "order": 29
     },
     {
      "title": "Root colonization dynamics of arbuscular mycorrhizal fungi in maize hybrids",
      "authors": [
       "Novak, Petra",
       "Horvat, Ivan"
      ],
      "year": 2015,
      "journal": "Plant and Soil Research",
      "volume": "390",
      "issue": "1",
      "pages": "201-214",
      "doi": "10.5555/rp.2015.1717",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 11% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "root colonization",
       "maize hybrids"
      ],
      "url": "",
      "language": "eng",
      "type": "article",
      "accession": "W17",
      "uid": "fmukfkoq7bct:2",
      "src": "Base bibliográfica biomédica",
      "order": 30
     },
     {
      "title": "Arbuscular mycorrhizal symbiosis modulates phosphate transporter expression in maize roots",
      "authors": [
       "Wang, Lei",
       "Chen, Hui"
      ],
      "year": 2019,
      "journal": "Plant and Soil Research",
      "volume": "440",
      "issue": "1",
      "pages": "55-70",
      "doi": "10.5555/rp.2019.2323",
      "abstract": "Expression of phosphate transporter genes was quantified in mycorrhizal and non-mycorrhizal maize roots in growth chambers. The symbiosis down-regulated direct uptake pathways.",
      "keywords": [
       "phosphate transporters",
       "gene expression"
      ],
      "url": "",
      "language": "eng",
      "type": "article",
      "accession": "W23",
      "uid": "fmukfkoq7bct:3",
      "src": "Base bibliográfica biomédica",
      "order": 31
     },
     {
      "title": "Zinc nutrition of maize is improved by mycorrhizal colonization",
      "authors": [
       "Kowalski, Jan",
       "Nowak, Anna"
      ],
      "year": 2016,
      "journal": "Soil Biology Letters",
      "volume": "10",
      "issue": "2",
      "pages": "66-75",
      "doi": "10.5555/rp.2016.2424",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 18% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "zinc",
       "micronutrients"
      ],
      "url": "",
      "language": "eng",
      "type": "article",
      "accession": "W24",
      "uid": "fmukfkoq7bct:4",
      "src": "Base bibliográfica biomédica",
      "order": 32
     }
    ],
    "info": {}
   },
   {
    "id": "fmukfkoq864y",
    "name": "repositorio_tesis.bib",
    "format": "bib",
    "source": "Repositorio de tesis",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Maize grain yield after mycorrhizal inoculation - a three-season field study",
      "authors": [
       "Torres, Mariana",
       "Díaz, Felipe"
      ],
      "year": 2015,
      "journal": "Journal of Field Agronomy",
      "volume": "37",
      "issue": "",
      "pages": "401–412",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 16% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "field study",
       "maize",
       "mycorrhizal inoculation"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W08",
      "uid": "fmukfkoq864y:0",
      "src": "Repositorio de tesis",
      "order": 33
     },
     {
      "title": "Inoculación micorrízica y rendimiento de maíz de temporal en Chiapas",
      "authors": [
       "López Gómez, Andrés"
      ],
      "year": 2018,
      "journal": "Universidad Autónoma Ficticia",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "Se evaluó la inoculación con hongos micorrízicos arbusculares en maíz de temporal en ocho parcelas de productores de Chiapas. El rendimiento de grano aumentó 12 % en promedio respecto del testigo sin inocular.",
      "keywords": [
       "inoculación",
       "maíz de temporal",
       "micorrizas"
      ],
      "url": "",
      "language": "",
      "type": "thesis",
      "accession": "W25",
      "uid": "fmukfkoq864y:1",
      "src": "Repositorio de tesis",
      "order": 34
     },
     {
      "title": "Validación de biofertilizantes en maíz, ciclo primavera-verano",
      "authors": [
       "Instituto Ficticio de Investigaciones Agrícolas"
      ],
      "year": 2020,
      "journal": "Informe técnico 14",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "Se validaron tres biofertilizantes comerciales en maíz en 24 sitios durante el ciclo primavera-verano. El inoculante micorrízico aumentó el rendimiento en 9 % frente al testigo.",
      "keywords": [
       "biofertilizantes",
       "validación"
      ],
      "url": "",
      "language": "",
      "type": "report",
      "accession": "W26",
      "uid": "fmukfkoq864y:2",
      "src": "Repositorio de tesis",
      "order": 35
     },
     {
      "title": "Respuesta del maíz a la inoculación con micorrizas en suelos ácidos",
      "authors": [
       "Pérez Núñez, Ángel"
      ],
      "year": 2012,
      "journal": "Colegio Ficticio de Posgraduados",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "Tesis de maestría. Se evaluó la respuesta del maíz a la inoculación micorrízica en suelos ácidos del trópico húmedo en macetas y en campo.",
      "keywords": [
       "suelos ácidos",
       "micorrizas"
      ],
      "url": "",
      "language": "",
      "type": "thesis",
      "accession": "W27",
      "uid": "fmukfkoq864y:3",
      "src": "Repositorio de tesis",
      "order": 36
     }
    ],
    "info": {}
   },
   {
    "id": "fmukfkoq8g8h",
    "name": "repositorio_institucional.csv",
    "format": "csv",
    "source": "Repositorio institucional",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Effects of Funneliformis mosseae inoculation on yield compnents of field-grown maize",
      "authors": [
       "Kaur, Harpreet",
       "Singh, Arjun"
      ],
      "year": 2014,
      "journal": "Crop Science Reports",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 17% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "Funneliformis mosseae",
       "yield components"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W09",
      "uid": "fmukfkoq8g8h:0",
      "src": "Repositorio institucional",
      "order": 37
     },
     {
      "title": "Inoculant formulation and maize yield in smallholder farms of Ethiopia",
      "authors": [
       "Tadesse, Abebe",
       "Bekele, Hiwot"
      ],
      "year": 2020,
      "journal": "Agronomy for Development",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 18% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "smallholders",
       "inoculant formulation"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W10",
      "uid": "fmukfkoq8g8h:1",
      "src": "Repositorio institucional",
      "order": 38
     },
     {
      "title": "Respuesta del maíz a la inoculación con micorrizas en suelos ácidos",
      "authors": [
       "Gómez, Rocío",
       "Salas, Ernesto"
      ],
      "year": 2019,
      "journal": "Revista Ficticia de Ciencias Agrícolas",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "",
      "abstract": "Se estudió el efecto de dos inoculantes micorrízicos sobre el rendimiento de maíz en suelos ácidos de Veracruz durante dos ciclos.",
      "keywords": [
       "suelos ácidos",
       "maíz"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W28",
      "uid": "fmukfkoq8g8h:2",
      "src": "Repositorio institucional",
      "order": 39
     },
     {
      "title": "Arbuscular mycorrhizal fungi in maize agroecosystems of Oaxaca: diversity and function",
      "authors": [
       "Cruz, Beatriz",
       "Mendoza, Raúl"
      ],
      "year": 2021,
      "journal": "Soil Biology Letters",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "10.5555/rp.2021.2929",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 9% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "diversity",
       "agroecosystems"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W29",
      "uid": "fmukfkoq8g8h:3",
      "src": "Repositorio institucional",
      "order": 40
     }
    ],
    "info": {
     "map": {
      "accession": 0,
      "title": 1,
      "authors": 2,
      "year": 3,
      "journal": 4,
      "abstract": 5,
      "doi": 6,
      "keywords": 7
     },
     "delim": ";",
     "header": [
      "ID",
      "Título",
      "Autores",
      "Año",
      "Revista",
      "Resumen",
      "DOI",
      "Palabras clave"
     ]
    }
   },
   {
    "id": "fmukfkoq8cdg",
    "name": "busqueda_manual.enw",
    "format": "enw",
    "source": "Búsqueda manual en listas de referencias",
    "date": "2026-09-27",
    "records": [
     {
      "title": "Mycorrhizae & phosphorus fertilization interact on maize productivity",
      "authors": [
       "Rossi, Giulia",
       "Bianchi, Marco"
      ],
      "year": 2013,
      "journal": "Plant and Soil Research",
      "volume": "370",
      "issue": "1",
      "pages": "355-367",
      "doi": "",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 19% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "phosphorus fertilization",
       "mycorrhizae"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W11",
      "uid": "fmukfkoq8cdg:0",
      "src": "Búsqueda manual en listas de referencias",
      "order": 41
     },
     {
      "title": "Mycorrhizal inoculation effects on maize grain yield: preliminary results from Honduras",
      "authors": [
       "Reyes, Carlos",
       "Flores, Ana"
      ],
      "year": 2012,
      "journal": "Journal of Field Agronomy",
      "volume": "34",
      "issue": "2",
      "pages": "98-104",
      "doi": "10.5555/rp.2012.3030",
      "abstract": "We evaluated the effect of inoculation with arbuscular mycorrhizal fungi on maize under field conditions. Inoculated plots were compared with non-inoculated controls in a randomized complete block design with four replicates. Grain yield increased by 10% on average, and the response was larger where available soil phosphorus was low.",
      "keywords": [
       "preliminary results",
       "Honduras"
      ],
      "url": "",
      "language": "",
      "type": "article",
      "accession": "W30",
      "uid": "fmukfkoq8cdg:1",
      "src": "Búsqueda manual en listas de referencias",
      "order": 42
     }
    ],
    "info": {}
   }
  ],
  "decisions": {
   "fmukfkoq864y:3|fmukfkoq8g8h:2": "not",
   "fmukfkoq6ujf:8|fmukfkoq8g8h:0": "dup"
  },
  "gold": [
   {
    "title": "Arbuscular mycorrhizal inoculation increases maize grain yield in low-phosphorus soils of central Mexico"
   },
   {
    "doi": "10.5555/rp.2018.0303"
   },
   {
    "title": "Maize grain yield after mycorrhizal inoculation: a three-season field study"
   },
   {
    "title": "Inoculación micorrízica y rendimiento de maíz de temporal en Chiapas"
   }
  ]
 },
 "screening": {
  "reviewers": [
   {
    "id": "r1osh",
    "name": "Investigadora 2"
   },
   {
    "id": "r2osh",
    "name": "Investigador 3"
   }
  ],
  "active": "r1osh",
  "mode": "same",
  "order": "prioritized",
  "decisions": {
   "r1osh": {
    "t:validacion de biofertilizantes en maiz ciclo primavera verano|2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565139,
     "n": 1
    },
    "doi:10.5555/rp.2018.0303": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565141,
     "n": 2
    },
    "doi:10.5555/rp.2019.1010": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565142,
     "n": 3
    },
    "doi:10.5555/rp.2014.0909": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565144,
     "n": 4
    },
    "doi:10.5555/rp.2020.2121": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565144,
     "n": 5
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565145,
     "n": 6
    },
    "doi:10.5555/rp.2021.1515": {
     "d": "maybe",
     "reason": "",
     "note": "",
     "t": 1790550565146,
     "n": 7
    },
    "doi:10.5555/rp.2024.2222": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565150,
     "n": 8
    },
    "doi:10.5555/rp.2013.1111": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565151,
     "n": 9
    },
    "doi:10.5555/rp.2020.0404": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565152,
     "n": 10
    },
    "doi:10.5555/rp.2019.1414": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565153,
     "n": 11
    },
    "doi:10.5555/rp.2016.0707": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565154,
     "n": 12
    },
    "doi:10.5555/rp.2015.1717": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565155,
     "n": 13
    },
    "doi:10.5555/rp.2012.3030": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565156,
     "n": 14
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565157,
     "n": 15
    },
    "doi:10.5555/rp.2022.0606": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565158,
     "n": 16
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565159,
     "n": 17
    },
    "doi:10.5555/rp.2017.0505": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565161,
     "n": 18
    },
    "doi:10.5555/rp.2017.1616": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565162,
     "n": 19
    },
    "doi:10.5555/rp.2016.2424": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565163,
     "n": 20
    },
    "doi:10.5555/rp.2021.2929": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565167,
     "n": 21
    },
    "doi:10.5555/rp.2019.2323": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565169,
     "n": 22
    },
    "t:inoculacion micorrizica y rendimiento de maiz de temporal en chiapas|2018": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565170,
     "n": 23
    },
    "doi:10.5555/rp.2018.2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565172,
     "n": 24
    },
    "doi:10.5555/rp.2018.1212": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565173,
     "n": 25
    },
    "doi:10.5555/rp.2020.1313": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565175,
     "n": 26
    },
    "doi:10.5555/rp.2019.0101": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565176,
     "n": 27
    },
    "doi:10.5555/rp.2022.1919": {
     "d": "exc",
     "reason": "E3",
     "note": "",
     "t": 1790550565178,
     "n": 28
    },
    "doi:10.5555/rp.2023.1818": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565180,
     "n": 29
    },
    "doi:10.5555/rp.2021.0202": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565183,
     "n": 30
    }
   },
   "r2osh": {
    "t:validacion de biofertilizantes en maiz ciclo primavera verano|2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565185,
     "n": 1
    },
    "doi:10.5555/rp.2018.0303": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565186,
     "n": 2
    },
    "doi:10.5555/rp.2019.1010": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565187,
     "n": 3
    },
    "doi:10.5555/rp.2014.0909": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565188,
     "n": 4
    },
    "doi:10.5555/rp.2020.2121": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565188,
     "n": 5
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565189,
     "n": 6
    },
    "doi:10.5555/rp.2021.1515": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565190,
     "n": 7
    },
    "doi:10.5555/rp.2024.2222": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565191,
     "n": 8
    },
    "doi:10.5555/rp.2013.1111": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565192,
     "n": 9
    },
    "doi:10.5555/rp.2020.0404": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565193,
     "n": 10
    },
    "doi:10.5555/rp.2019.1414": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565194,
     "n": 11
    },
    "doi:10.5555/rp.2016.0707": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565195,
     "n": 12
    },
    "doi:10.5555/rp.2015.1717": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565200,
     "n": 13
    },
    "doi:10.5555/rp.2012.3030": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565203,
     "n": 14
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565205,
     "n": 15
    },
    "doi:10.5555/rp.2022.0606": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565206,
     "n": 16
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565207,
     "n": 17
    },
    "doi:10.5555/rp.2017.0505": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565209,
     "n": 18
    },
    "doi:10.5555/rp.2017.1616": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565210,
     "n": 19
    },
    "doi:10.5555/rp.2016.2424": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565212,
     "n": 20
    },
    "doi:10.5555/rp.2021.2929": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565213,
     "n": 21
    },
    "doi:10.5555/rp.2019.2323": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565216,
     "n": 22
    },
    "t:inoculacion micorrizica y rendimiento de maiz de temporal en chiapas|2018": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565218,
     "n": 23
    },
    "doi:10.5555/rp.2018.2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565220,
     "n": 24
    },
    "doi:10.5555/rp.2018.1212": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565221,
     "n": 25
    },
    "doi:10.5555/rp.2020.1313": {
     "d": "exc",
     "reason": "E6",
     "note": "",
     "t": 1790550565223,
     "n": 26
    },
    "doi:10.5555/rp.2019.0101": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565224,
     "n": 27
    },
    "doi:10.5555/rp.2022.1919": {
     "d": "exc",
     "reason": "E3",
     "note": "",
     "t": 1790550565226,
     "n": 28
    },
    "doi:10.5555/rp.2023.1818": {
     "d": "exc",
     "reason": "E1",
     "note": "parece de invernadero",
     "t": 1790550565227,
     "n": 29
    },
    "doi:10.5555/rp.2021.0202": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565228,
     "n": 30
    }
   }
  },
  "final": {
   "doi:10.5555/rp.2021.1515": {
    "d": "exc",
    "reason": "E6",
    "t": 1790560001630
   },
   "doi:10.5555/rp.2023.1818": {
    "d": "inc",
    "reason": "",
    "t": 1790560001630
   }
  },
  "stop": {},
  "words": {
   "inc": "",
   "exc": ""
  }
 },
 "fulltext": {
  "base": "",
  "reports": {
   "doi:10.5555/rp.2019.0101": {
    "retrieval": "retrieved",
    "path": "RamirezSoto_2019_ArbuscularMycorrhizalInoculationIncreases.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2021.0202": {
    "retrieval": "retrieved",
    "path": "Okoth_2021_FieldPerformanceCommercialMycorrhizal.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2018.0303": {
    "retrieval": "retrieved",
    "path": "Silva_2018_MaizeYieldResponseRhizophagus.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2020.0404": {
    "retrieval": "retrieved",
    "path": "Mutua_2020_DoesInoculationWithArbuscular.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2017.0505": {
    "retrieval": "retrieved",
    "path": "Zhang_2017_MycorrhizalColonizationPhosphorusUptake.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2022.0606": {
    "retrieval": "retrieved",
    "path": "Martinez_2022_NativeVersusCommercialInocula.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2016.0707": {
    "retrieval": "retrieved",
    "path": "Becker_2016_ArbuscularMycorrhizalFungiMaize.pdf",
    "note": ""
   },
   "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
    "retrieval": "retrieved",
    "path": "Torres_2015_MaizeGrainYieldAfter.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2014.0909": {
    "retrieval": "retrieved",
    "path": "Kaur_2014_EffectsFunneliformisMosseaeInoculation.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2019.1010": {
    "retrieval": "retrieved",
    "path": "Tadesse_2019_InoculantFormulationMaizeYield.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2013.1111": {
    "retrieval": "retrieved",
    "path": "Rossi_2013_MycorrhizaePhosphorusFertilizationInteract.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2015.1717": {
    "retrieval": "retrieved",
    "path": "Novak_2015_RootColonizationDynamicsArbuscular.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2023.1818": {
    "retrieval": "retrieved",
    "path": "Garcia_2023_MycorrhizalInoculationMaizeUnder.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2018.2020": {
    "retrieval": "retrieved",
    "path": "Oliveira_2018_PhosphorusEfficiencyMaizeInoculated.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2020.2121": {
    "retrieval": "retrieved",
    "path": "Hassan_2020_GrainYieldNutrientUptake.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2024.2222": {
    "retrieval": "not",
    "path": "Banda_2024_MycorrhizalInoculantsSaharanMaize.pdf",
    "note": "pedido a los autores el 03/03/2027; sin respuesta"
   },
   "doi:10.5555/rp.2016.2424": {
    "retrieval": "retrieved",
    "path": "Kowalski_2016_ZincNutritionMaizeImproved.pdf",
    "note": ""
   },
   "t:inoculacion micorrizica y rendimiento de maiz de temporal en chiapas|2018": {
    "retrieval": "retrieved",
    "path": "LopezGomez_2018_InoculacionMicorrizicaRendimientoMaiz.pdf",
    "note": ""
   },
   "t:validacion de biofertilizantes en maiz ciclo primavera verano|2020": {
    "retrieval": "retrieved",
    "path": "Agricolas_2020_ValidacionBiofertilizantesMaizCiclo.pdf",
    "note": ""
   },
   "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
    "retrieval": "retrieved",
    "path": "PerezNunez_2012_RespuestaMaizInoculacionMicorrizas.pdf",
    "note": ""
   },
   "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
    "retrieval": "retrieved",
    "path": "Gomez_2019_RespuestaMaizInoculacionMicorrizas.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2021.2929": {
    "retrieval": "retrieved",
    "path": "Cruz_2021_ArbuscularMycorrhizalFungiMaize.pdf",
    "note": ""
   },
   "doi:10.5555/rp.2012.3030": {
    "retrieval": "retrieved",
    "path": "Reyes_2012_MycorrhizalInoculationEffectsMaize.pdf",
    "note": ""
   },
   "x:mukfkqfz": {
    "retrieval": "retrieved",
    "path": "",
    "note": ""
   }
  },
  "decisions": {
   "r1osh": {
    "doi:10.5555/rp.2019.0101": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565506
    },
    "doi:10.5555/rp.2021.0202": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565517
    },
    "doi:10.5555/rp.2018.0303": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565526
    },
    "doi:10.5555/rp.2020.0404": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565534
    },
    "doi:10.5555/rp.2017.0505": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565541
    },
    "doi:10.5555/rp.2022.0606": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565551
    },
    "doi:10.5555/rp.2016.0707": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565559
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565567
    },
    "doi:10.5555/rp.2014.0909": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565575
    },
    "doi:10.5555/rp.2019.1010": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565583
    },
    "doi:10.5555/rp.2013.1111": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565594
    },
    "doi:10.5555/rp.2015.1717": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565603
    },
    "doi:10.5555/rp.2023.1818": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565611
    },
    "doi:10.5555/rp.2018.2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565627
    },
    "doi:10.5555/rp.2020.2121": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565638
    },
    "doi:10.5555/rp.2016.2424": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565650
    },
    "t:inoculacion micorrizica y rendimiento de maiz de temporal en chiapas|2018": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565662
    },
    "t:validacion de biofertilizantes en maiz ciclo primavera verano|2020": {
     "d": "exc",
     "reason": "E4",
     "note": "",
     "t": 1790550565670
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565678
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565685
    },
    "doi:10.5555/rp.2021.2929": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565694
    },
    "doi:10.5555/rp.2012.3030": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565702
    },
    "x:mukfkqfz": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565710
    }
   },
   "r2osh": {
    "doi:10.5555/rp.2019.0101": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565752
    },
    "doi:10.5555/rp.2021.0202": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565762
    },
    "doi:10.5555/rp.2018.0303": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565776
    },
    "doi:10.5555/rp.2020.0404": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565784
    },
    "doi:10.5555/rp.2017.0505": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565793
    },
    "doi:10.5555/rp.2022.0606": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565802
    },
    "doi:10.5555/rp.2016.0707": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565811
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565825
    },
    "doi:10.5555/rp.2014.0909": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565834
    },
    "doi:10.5555/rp.2019.1010": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565842
    },
    "doi:10.5555/rp.2013.1111": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565850
    },
    "doi:10.5555/rp.2015.1717": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565859
    },
    "doi:10.5555/rp.2023.1818": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565867
    },
    "doi:10.5555/rp.2018.2020": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565875
    },
    "doi:10.5555/rp.2020.2121": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565883
    },
    "doi:10.5555/rp.2016.2424": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565900
    },
    "t:inoculacion micorrizica y rendimiento de maiz de temporal en chiapas|2018": {
     "d": "exc",
     "reason": "E1",
     "note": "",
     "t": 1790550565911
    },
    "t:validacion de biofertilizantes en maiz ciclo primavera verano|2020": {
     "d": "exc",
     "reason": "E4",
     "note": "",
     "t": 1790550565923
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565933
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565950
    },
    "doi:10.5555/rp.2021.2929": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565967
    },
    "doi:10.5555/rp.2012.3030": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565975
    },
    "x:mukfkqfz": {
     "d": "inc",
     "reason": "",
     "note": "",
     "t": 1790550565989
    }
   }
  },
  "final": {},
  "links": {
   "doi:10.5555/rp.2019.1010": "doi:10.5555/rp.2021.0202"
  },
  "extra": [
   {
    "key": "x:mukfkqfz",
    "title": "Mycorrhizal inoculants and maize yield in Zambia",
    "authors": [
     "Banda, Chileshe",
     "Mwale, Peter"
    ],
    "year": 2023,
    "doi": "",
    "journal": "Informe técnico ficticio de extensión agrícola",
    "how": "back"
   }
  ],
  "_flow": {
   "db": {
    "sources": {
     "Base de citas multidisciplinaria 1": 16,
     "Base de citas multidisciplinaria 2": 12,
     "Base bibliográfica biomédica": 5
    },
    "identified": 33,
    "unique": 24,
    "duplicates": 9,
    "screened": 24,
    "excludedTA": 7,
    "taReasons": {
     "E1": 2,
     "E6": 4,
     "E3": 1
    },
    "unread": 0,
    "pendingTA": 0,
    "sought": 17,
    "notRetrieved": 1,
    "awaiting": 0,
    "assessed": 16,
    "excludedFT": 0,
    "ftReasons": {},
    "pendingFT": 0,
    "includedReports": 16,
    "directToFT": 0
   },
   "other": {
    "sources": {
     "Repositorio de tesis": 4,
     "Repositorio institucional": 4,
     "Búsqueda manual en listas de referencias": 2,
     "Búsqueda de citas hacia atrás": 1
    },
    "identified": 11,
    "unique": 7,
    "duplicates": 4,
    "screened": 6,
    "excludedTA": 0,
    "taReasons": {},
    "unread": 0,
    "pendingTA": 0,
    "sought": 7,
    "notRetrieved": 0,
    "awaiting": 0,
    "assessed": 7,
    "excludedFT": 2,
    "ftReasons": {
     "E1": 1,
     "E4": 1
    },
    "pendingFT": 0,
    "includedReports": 5,
    "directToFT": 1
   },
   "includedReports": 21,
   "includedStudies": 20,
   "groups": [
    [
     "doi:10.5555/rp.2019.0101"
    ],
    [
     "doi:10.5555/rp.2021.0202",
     "doi:10.5555/rp.2019.1010"
    ],
    [
     "doi:10.5555/rp.2018.0303"
    ],
    [
     "doi:10.5555/rp.2020.0404"
    ],
    [
     "doi:10.5555/rp.2017.0505"
    ],
    [
     "doi:10.5555/rp.2022.0606"
    ],
    [
     "doi:10.5555/rp.2016.0707"
    ],
    [
     "t:maize grain yield after mycorrhizal inoculation a three season field study|2015"
    ],
    [
     "doi:10.5555/rp.2014.0909"
    ],
    [
     "doi:10.5555/rp.2013.1111"
    ],
    [
     "doi:10.5555/rp.2015.1717"
    ],
    [
     "doi:10.5555/rp.2023.1818"
    ],
    [
     "doi:10.5555/rp.2018.2020"
    ],
    [
     "doi:10.5555/rp.2020.2121"
    ],
    [
     "doi:10.5555/rp.2016.2424"
    ],
    [
     "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012"
    ],
    [
     "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019"
    ],
    [
     "doi:10.5555/rp.2021.2929"
    ],
    [
     "doi:10.5555/rp.2012.3030"
    ],
    [
     "x:mukfkqfz"
    ]
   ],
   "pending": 0,
   "complete": true
  }
 },
 "extraction": {
  "fields": [
   {
    "id": "f1ltz",
    "label": "País",
    "type": "text",
    "options": "",
    "required": true,
    "section": "Datos generales"
   },
   {
    "id": "f2yyt",
    "label": "Coordenadas del sitio",
    "type": "location",
    "options": "",
    "required": false,
    "section": "Datos generales"
   },
   {
    "id": "f3iwk",
    "label": "Tipo de publicación",
    "type": "select",
    "options": "artículo; tesis; informe; actas",
    "required": false,
    "section": "Datos generales"
   },
   {
    "id": "f40rf",
    "label": "Diseño experimental",
    "type": "select",
    "options": "completamente al azar; bloques completos al azar; parcelas divididas; cuadrado latino; observacional; otro",
    "required": true,
    "section": "Diseño"
   },
   {
    "id": "f5ry5",
    "label": "Repeticiones",
    "type": "number",
    "options": "",
    "required": true,
    "section": "Diseño"
   },
   {
    "id": "f6po2",
    "label": "Número de ciclos o años",
    "type": "number",
    "options": "",
    "required": false,
    "section": "Diseño"
   },
   {
    "id": "f7jbl",
    "label": "Tratamientos en el ensayo",
    "type": "number",
    "options": "",
    "required": false,
    "section": "Diseño"
   },
   {
    "id": "f89ih",
    "label": "Cultivo, especie o variedad",
    "type": "text",
    "options": "",
    "required": false,
    "section": "Contexto"
   },
   {
    "id": "f9ho6",
    "label": "Descripción del tratamiento",
    "type": "long",
    "options": "",
    "required": false,
    "section": "Contexto"
   },
   {
    "id": "fa683",
    "label": "Descripción del testigo",
    "type": "long",
    "options": "",
    "required": false,
    "section": "Contexto"
   },
   {
    "id": "fbbow",
    "label": "Origen de los datos numéricos",
    "type": "select",
    "options": "tabla; figura digitalizada; texto; enviados por los autores",
    "required": false,
    "section": "Calidad de los datos"
   },
   {
    "id": "fcf6s",
    "label": "Fósforo disponible del suelo",
    "type": "number",
    "options": "",
    "required": false,
    "section": "Moderadores"
   },
   {
    "id": "fdel4",
    "label": "Dosis de fósforo aplicada",
    "type": "number",
    "options": "",
    "required": false,
    "section": "Moderadores"
   },
   {
    "id": "feh8d",
    "label": "Tipo de inoculante (especie única o consorcio)",
    "type": "text",
    "options": "",
    "required": false,
    "section": "Moderadores"
   },
   {
    "id": "ffjhi",
    "label": "Clima (Köppen)",
    "type": "text",
    "options": "",
    "required": false,
    "section": "Moderadores"
   },
   {
    "id": "fguzq",
    "label": "Años del experimento",
    "type": "number",
    "options": "",
    "required": false,
    "section": "Moderadores"
   }
  ],
  "values": {
   "r1osh": {
    "x:mukfkqfz": {
     "fcf6s": 11.2,
     "feh8d": "consorcio",
     "f1ltz": "Zambia",
     "f2yyt": {
      "lat": -15.4,
      "lon": 28.3
     },
     "f3iwk": "informe",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 3,
     "f7jbl": 5,
     "f89ih": "maíz de polinización libre",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "Aw",
     "fguzq": 1
    },
    "doi:10.5555/rp.2016.0707": {
     "fcf6s": 34.3,
     "feh8d": "especie única",
     "f1ltz": "Sudáfrica",
     "f2yyt": {
      "lat": -25.7,
      "lon": 28.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 1,
     "f7jbl": 2,
     "f89ih": "maíz criollo",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 2
    },
    "doi:10.5555/rp.2021.2929": {
     "fcf6s": 15.5,
     "feh8d": "nativo",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 17.1,
      "lon": -96.7
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 3,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 60,
     "ffjhi": "Cwb",
     "fguzq": 3
    },
    "doi:10.5555/rp.2023.1818": {
     "fcf6s": 17.3,
     "feh8d": "consorcio",
     "f1ltz": "España",
     "f2yyt": {
      "lat": 41.6,
      "lon": -0.9
     },
     "f3iwk": "artículo",
     "f40rf": "parcelas divididas",
     "f5ry5": 4,
     "f6po2": 2,
     "f7jbl": 4,
     "f89ih": "maíz criollo",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 0,
     "ffjhi": "BSk",
     "fguzq": 1
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "fcf6s": 6.6,
     "feh8d": "especie única",
     "f1ltz": "Colombia",
     "f2yyt": {
      "lat": 4.6,
      "lon": -74.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Am",
     "fguzq": 1
    },
    "doi:10.5555/rp.2020.2121": {
     "fcf6s": 24.9,
     "feh8d": "nativo",
     "f1ltz": "Egipto",
     "f2yyt": {
      "lat": 30,
      "lon": 31.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 1,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 60,
     "ffjhi": "BWh",
     "fguzq": 2
    },
    "doi:10.5555/rp.2014.0909": {
     "fcf6s": 15.7,
     "feh8d": "consorcio",
     "f1ltz": "India",
     "f2yyt": {
      "lat": 30.9,
      "lon": 75.8
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 2,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 2
    },
    "doi:10.5555/rp.2016.2424": {
     "fcf6s": 35.1,
     "feh8d": "especie única",
     "f1ltz": "Polonia",
     "f2yyt": {
      "lat": 52.2,
      "lon": 21
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 5,
     "f6po2": 2,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Dfb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2022.0606": {
     "fcf6s": 12,
     "feh8d": "nativo",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 20.5,
      "lon": -101.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 2,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "BSh",
     "fguzq": 1
    },
    "doi:10.5555/rp.2020.0404": {
     "fcf6s": 7.1,
     "feh8d": "consorcio",
     "f1ltz": "Kenia",
     "f2yyt": {
      "lat": -1.3,
      "lon": 36.8
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 3,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 60,
     "ffjhi": "Cwb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2015.1717": {
     "fcf6s": 6.1,
     "feh8d": "especie única",
     "f1ltz": "Chequia",
     "f2yyt": {
      "lat": 49.2,
      "lon": 16.6
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 0,
     "ffjhi": "Dfb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2018.2020": {
     "fcf6s": 8.7,
     "feh8d": "nativo",
     "f1ltz": "Brasil",
     "f2yyt": {
      "lat": -22.9,
      "lon": -47.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 3,
     "f89ih": "maíz criollo",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 1
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "fcf6s": 35.7,
     "feh8d": "consorcio",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 19.5,
      "lon": -98.9
     },
     "f3iwk": "tesis",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 2,
     "f7jbl": 4,
     "f89ih": "maíz de polinización libre",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Cwb",
     "fguzq": 1
    },
    "doi:10.5555/rp.2019.0101": {
     "fcf6s": 22.1,
     "feh8d": "especie única",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 19.4,
      "lon": -99.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "Cwb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2012.3030": {
     "fcf6s": 9.7,
     "feh8d": "nativo",
     "f1ltz": "Honduras",
     "f2yyt": {
      "lat": 14.1,
      "lon": -87.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 1,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 60,
     "ffjhi": "Aw",
     "fguzq": 2
    },
    "doi:10.5555/rp.2013.1111": {
     "fcf6s": 14.2,
     "feh8d": "consorcio",
     "f1ltz": "Italia",
     "f2yyt": {
      "lat": 45.1,
      "lon": 9.7
     },
     "f3iwk": "artículo",
     "f40rf": "parcelas divididas",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 2,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 0,
     "ffjhi": "Cfa",
     "fguzq": 3
    },
    "doi:10.5555/rp.2018.0303": {
     "fcf6s": 11.8,
     "feh8d": "especie única",
     "f1ltz": "Brasil",
     "f2yyt": {
      "lat": -15.8,
      "lon": -47.9
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 2,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 60,
     "ffjhi": "Aw",
     "fguzq": 3
    },
    "doi:10.5555/rp.2019.1010": {
     "fcf6s": 20.5,
     "feh8d": "nativo",
     "f1ltz": "Etiopía",
     "f2yyt": {
      "lat": 7,
      "lon": 38.5
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 2,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 0,
     "ffjhi": "Cwb",
     "fguzq": 3
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "fcf6s": 5.7,
     "feh8d": "consorcio",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 16.8,
      "lon": -93.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 4,
     "f89ih": "maíz criollo",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Aw",
     "fguzq": 2
    },
    "doi:10.5555/rp.2017.0505": {
     "fcf6s": 19.3,
     "feh8d": "especie única",
     "f1ltz": "China",
     "f2yyt": {
      "lat": 36.7,
      "lon": 117
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 20,
     "ffjhi": "Cwa",
     "fguzq": 3
    }
   },
   "r2osh": {
    "x:mukfkqfz": {
     "fcf6s": 11.2,
     "feh8d": "consorcio",
     "f1ltz": "Zambia",
     "f2yyt": {
      "lat": -15.4,
      "lon": 28.3
     },
     "f3iwk": "informe",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 3,
     "f7jbl": 5,
     "f89ih": "maíz de polinización libre",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "Aw",
     "fguzq": 1
    },
    "doi:10.5555/rp.2016.0707": {
     "fcf6s": 34.3,
     "feh8d": "especie única",
     "f1ltz": "Sudáfrica",
     "f2yyt": {
      "lat": -25.7,
      "lon": 28.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 1,
     "f7jbl": 2,
     "f89ih": "maíz criollo",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 2
    },
    "doi:10.5555/rp.2021.2929": {
     "fcf6s": 15.5,
     "feh8d": "nativo",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 17.1,
      "lon": -96.7
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 3,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 60,
     "ffjhi": "Cwb",
     "fguzq": 3
    },
    "doi:10.5555/rp.2023.1818": {
     "fcf6s": 17.3,
     "feh8d": "consorcio",
     "f1ltz": "España",
     "f2yyt": {
      "lat": 41.6,
      "lon": -0.9
     },
     "f3iwk": "artículo",
     "f40rf": "parcelas divididas",
     "f5ry5": 4,
     "f6po2": 2,
     "f7jbl": 4,
     "f89ih": "maíz criollo",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 0,
     "ffjhi": "BSk",
     "fguzq": 1
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "fcf6s": 6.6,
     "feh8d": "especie única",
     "f1ltz": "Colombia",
     "f2yyt": {
      "lat": 4.6,
      "lon": -74.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Am",
     "fguzq": 1
    },
    "doi:10.5555/rp.2020.2121": {
     "fcf6s": 24.9,
     "feh8d": "nativo",
     "f1ltz": "Egipto",
     "f2yyt": {
      "lat": 30,
      "lon": 31.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 1,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 60,
     "ffjhi": "BWh",
     "fguzq": 2
    },
    "doi:10.5555/rp.2014.0909": {
     "fcf6s": 15.7,
     "feh8d": "consorcio",
     "f1ltz": "India",
     "f2yyt": {
      "lat": 30.9,
      "lon": 75.8
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 3,
     "f7jbl": 2,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 2
    },
    "doi:10.5555/rp.2016.2424": {
     "fcf6s": 35.1,
     "feh8d": "especie única",
     "f1ltz": "Polonia",
     "f2yyt": {
      "lat": 52.2,
      "lon": 21
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 5,
     "f6po2": 2,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Dfb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2022.0606": {
     "fcf6s": 12,
     "feh8d": "nativo",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 20.5,
      "lon": -101.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 6,
     "f6po2": 2,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "BSh",
     "fguzq": 1
    },
    "doi:10.5555/rp.2020.0404": {
     "fcf6s": 7.1,
     "feh8d": "consorcio",
     "f1ltz": "Kenia",
     "f2yyt": {
      "lat": -1.3,
      "lon": 36.8
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 3,
     "f7jbl": 4,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 60,
     "ffjhi": "Cwb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2015.1717": {
     "fcf6s": 6.1,
     "feh8d": "especie única",
     "f1ltz": "Chequia",
     "f2yyt": {
      "lat": 49.2,
      "lon": 16.6
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 0,
     "ffjhi": "Dfb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2018.2020": {
     "fcf6s": 8.7,
     "feh8d": "nativo",
     "f1ltz": "Brasil",
     "f2yyt": {
      "lat": -22.9,
      "lon": -47.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 3,
     "f89ih": "maíz criollo",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "Cwa",
     "fguzq": 1
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "fcf6s": 35.7,
     "feh8d": "consorcio",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 19.5,
      "lon": -98.9
     },
     "f3iwk": "tesis",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 2,
     "f7jbl": 4,
     "f89ih": "maíz de polinización libre",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Cwb",
     "fguzq": 1
    },
    "doi:10.5555/rp.2019.0101": {
     "fcf6s": 22.1,
     "feh8d": "especie única",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 19.4,
      "lon": -99.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 40,
     "ffjhi": "Cwb",
     "fguzq": 2
    },
    "doi:10.5555/rp.2012.3030": {
     "fcf6s": 9.7,
     "feh8d": "nativo",
     "f1ltz": "Honduras",
     "f2yyt": {
      "lat": 14.1,
      "lon": -87.2
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 1,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 60,
     "ffjhi": "Aw",
     "fguzq": 2
    },
    "doi:10.5555/rp.2013.1111": {
     "fcf6s": 14.2,
     "feh8d": "consorcio",
     "f1ltz": "Italia",
     "f2yyt": {
      "lat": 45.1,
      "lon": 9.7
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 2,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 0,
     "ffjhi": "Cfa",
     "fguzq": 3
    },
    "doi:10.5555/rp.2018.0303": {
     "fcf6s": 11.8,
     "feh8d": "especie única",
     "f1ltz": "Brasil",
     "f2yyt": {
      "lat": -15.8,
      "lon": -47.9
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 2,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "figura digitalizada",
     "fdel4": 60,
     "ffjhi": "Aw",
     "fguzq": 3
    },
    "doi:10.5555/rp.2019.1010": {
     "fcf6s": 20.5,
     "feh8d": "nativo",
     "f1ltz": "Etiopía",
     "f2yyt": {
      "lat": 7,
      "lon": 38.5
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 2,
     "f7jbl": 5,
     "f89ih": "maíz híbrido",
     "f9ho6": "Inóculo de hongos micorrízicos nativos del sitio aplicado al suelo de siembra",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "texto",
     "fdel4": 0,
     "ffjhi": "Cwb",
     "fguzq": 3
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "fcf6s": 5.7,
     "feh8d": "consorcio",
     "f1ltz": "México",
     "f2yyt": {
      "lat": 16.8,
      "lon": -93.1
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 4,
     "f6po2": 1,
     "f7jbl": 4,
     "f89ih": "maíz criollo",
     "f9ho6": "Inoculante comercial con un consorcio de hongos micorrízicos aplicado a la semilla",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 40,
     "ffjhi": "Aw",
     "fguzq": 2
    },
    "doi:10.5555/rp.2017.0505": {
     "fcf6s": 19.3,
     "feh8d": "especie única",
     "f1ltz": "China",
     "f2yyt": {
      "lat": 36.7,
      "lon": 117
     },
     "f3iwk": "artículo",
     "f40rf": "bloques completos al azar",
     "f5ry5": 3,
     "f6po2": 3,
     "f7jbl": 6,
     "f89ih": "maíz híbrido",
     "f9ho6": "Rhizophagus irregularis aplicado a la semilla al sembrar",
     "fa683": "Mismo manejo, sin inocular",
     "fbbow": "tabla",
     "fdel4": 20,
     "ffjhi": "Cwa",
     "fguzq": 3
    }
   }
  },
  "effects": {
   "r1osh": {
    "x:mukfkqfz": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.076,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.778
       }
      },
      "C": {
       "mean": 6.123,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.164
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 11.637,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 2.395
       }
      },
      "C": {
       "mean": 8.833,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.43
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2016.0707": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.898,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.162
       }
      },
      "C": {
       "mean": 7.739,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.919
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.796,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.034
       }
      },
      "C": {
       "mean": 8.82,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.132
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2021.2929": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.101,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.444
       }
      },
      "C": {
       "mean": 3.591,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.46
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2023.1818": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.55,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.096
       }
      },
      "C": {
       "mean": 5.442,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.896
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.396,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.993
       }
      },
      "C": {
       "mean": 5.612,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.032
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.782,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.099
       }
      },
      "C": {
       "mean": 6.17,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.971
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.706,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.929
       }
      },
      "C": {
       "mean": 4.747,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.889
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.959,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.165
       }
      },
      "C": {
       "mean": 5.987,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.918
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.697,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.745
       }
      },
      "C": {
       "mean": 3.762,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.71
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2020.2121": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.89,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.33
       }
      },
      "C": {
       "mean": 2.888,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.225
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.678,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.341
       }
      },
      "C": {
       "mean": 4.327,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.318
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.971,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.316
       }
      },
      "C": {
       "mean": 4.421,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.323
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2014.0909": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.683,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.118
       }
      },
      "C": {
       "mean": 6.39,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.136
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.392,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.529
       }
      },
      "C": {
       "mean": 5.298,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.171
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2016.2424": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.727,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.199
       }
      },
      "C": {
       "mean": 6.606,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.175
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.945,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.028
       }
      },
      "C": {
       "mean": 5.607,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.931
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.198,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.952
       }
      },
      "C": {
       "mean": 5.649,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.95
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2022.0606": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.991,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.394
       }
      },
      "C": {
       "mean": 4.796,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.408
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2020.0404": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.954,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.34
       }
      },
      "C": {
       "mean": 4.253,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.249
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.521,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.413
       }
      },
      "C": {
       "mean": 5.013,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.296
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.672,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.419
       }
      },
      "C": {
       "mean": 5.49,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.339
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2015.1717": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.952,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.762
       }
      },
      "C": {
       "mean": 6.038,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.515
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.952,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.797
       }
      },
      "C": {
       "mean": 8.195,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.709
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 10.388,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.81
       }
      },
      "C": {
       "mean": 8.094,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.707
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2018.2020": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.438,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.389
       }
      },
      "C": {
       "mean": 4.619,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.306
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.505,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.576
       }
      },
      "C": {
       "mean": 7.714,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.472
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.389,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.604
       }
      },
      "C": {
       "mean": 7.382,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.464
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2019.0101": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 11.717,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.048
       }
      },
      "C": {
       "mean": 10.786,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.258
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 10.722,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.161
       }
      },
      "C": {
       "mean": 10.286,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.141
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.465,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.092
       }
      },
      "C": {
       "mean": 9.859,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.113
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2012.3030": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.657,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.262
       }
      },
      "C": {
       "mean": 3.508,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.248
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.785,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.431
       }
      },
      "C": {
       "mean": 4.53,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.331
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2013.1111": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.604,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.084
       }
      },
      "C": {
       "mean": 5.039,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.886
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.053,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.972
       }
      },
      "C": {
       "mean": 5.602,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.842
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2018.0303": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.277,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.734
       }
      },
      "C": {
       "mean": 9.123,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.427
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2019.1010": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.706,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.563
       }
      },
      "C": {
       "mean": 2.755,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.404
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.58,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.008
       }
      },
      "C": {
       "mean": 7.118,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.222
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.543,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.221
       }
      },
      "C": {
       "mean": 4.415,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.036
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2017.0505": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.482,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.842
       }
      },
      "C": {
       "mean": 4.274,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.773
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ]
   },
   "r2osh": {
    "x:mukfkqfz": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.076,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.778
       }
      },
      "C": {
       "mean": 6.123,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.164
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 11.637,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 2.395
       }
      },
      "C": {
       "mean": 8.833,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.43
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2016.0707": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.898,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.162
       }
      },
      "C": {
       "mean": 7.739,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.919
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.796,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.034
       }
      },
      "C": {
       "mean": 8.82,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 1.132
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2021.2929": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.101,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.444
       }
      },
      "C": {
       "mean": 3.591,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.46
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2023.1818": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.55,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.096
       }
      },
      "C": {
       "mean": 5.442,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.896
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.396,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.993
       }
      },
      "C": {
       "mean": 5.612,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.032
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.782,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.099
       }
      },
      "C": {
       "mean": 6.17,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.971
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.706,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.929
       }
      },
      "C": {
       "mean": 4.747,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.889
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.959,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.165
       }
      },
      "C": {
       "mean": 5.987,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.918
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.697,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.745
       }
      },
      "C": {
       "mean": 3.762,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.71
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2020.2121": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.89,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.33
       }
      },
      "C": {
       "mean": 2.888,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.225
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.678,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.341
       }
      },
      "C": {
       "mean": 4.327,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.318
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.971,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.316
       }
      },
      "C": {
       "mean": 4.421,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.323
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2014.0909": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.683,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.118
       }
      },
      "C": {
       "mean": 6.39,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.136
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.392,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.529
       }
      },
      "C": {
       "mean": 5.298,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.171
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2016.2424": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.727,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.199
       }
      },
      "C": {
       "mean": 6.606,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.175
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.945,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 1.028
       }
      },
      "C": {
       "mean": 5.607,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.931
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.198,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.952
       }
      },
      "C": {
       "mean": 5.649,
       "n": 5,
       "disp": {
        "type": "sd",
        "value": 0.95
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2022.0606": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.991,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.394
       }
      },
      "C": {
       "mean": 4.796,
       "n": 6,
       "disp": {
        "type": "sd",
        "value": 0.408
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2020.0404": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.954,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.34
       }
      },
      "C": {
       "mean": 4.253,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.249
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.521,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.413
       }
      },
      "C": {
       "mean": 5.013,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.296
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.672,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.419
       }
      },
      "C": {
       "mean": 5.49,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.339
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2015.1717": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.952,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.762
       }
      },
      "C": {
       "mean": 6.038,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.515
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.952,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.797
       }
      },
      "C": {
       "mean": 8.195,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.709
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 10.388,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.81
       }
      },
      "C": {
       "mean": 8.094,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.707
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2018.2020": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.438,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.389
       }
      },
      "C": {
       "mean": 4.619,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.306
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.505,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.576
       }
      },
      "C": {
       "mean": 7.714,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.472
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 8.389,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.604
       }
      },
      "C": {
       "mean": 7.382,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.464
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2019.0101": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 11.717,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.048
       }
      },
      "C": {
       "mean": 10.786,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.258
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 10.722,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.161
       }
      },
      "C": {
       "mean": 10.286,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.141
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 3",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.465,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.092
       }
      },
      "C": {
       "mean": 9.859,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.113
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2012.3030": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.657,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.262
       }
      },
      "C": {
       "mean": 3.508,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.248
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 5.785,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.431
       }
      },
      "C": {
       "mean": 4.53,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.331
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2013.1111": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 7.604,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.084
       }
      },
      "C": {
       "mean": 5.039,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.886
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.053,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.972
       }
      },
      "C": {
       "mean": 5.602,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.842
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2018.0303": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 9.277,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.734
       }
      },
      "C": {
       "mean": 9.123,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 1.427
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2019.1010": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 3.706,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.563
       }
      },
      "C": {
       "mean": 2.755,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 0.404
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": [
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 1",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.58,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.008
       }
      },
      "C": {
       "mean": 7.118,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.222
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     },
     {
      "outcome": "Rendimiento de grano",
      "label": "sitio 2",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 6.543,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.221
       }
      },
      "C": {
       "mean": 4.415,
       "n": 4,
       "disp": {
        "type": "sd",
        "value": 1.036
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ],
    "doi:10.5555/rp.2017.0505": [
     {
      "outcome": "Rendimiento de grano",
      "label": "",
      "input": "arms",
      "metric": "ROM",
      "T": {
       "mean": 4.482,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.842
       }
      },
      "C": {
       "mean": 4.274,
       "n": 3,
       "disp": {
        "type": "sd",
        "value": 0.773
       }
      },
      "anova": {},
      "stat": {},
      "counts": {},
      "corr": {},
      "direct": {}
     }
    ]
   }
  },
  "final": {
   "doi:10.5555/rp.2014.0909": {
    "f5ry5": 3
   },
   "doi:10.5555/rp.2018.2020": {
    "fbbow": "tabla"
   },
   "doi:10.5555/rp.2013.1111": {
    "f40rf": "parcelas divididas"
   }
  },
  "imputeCV": true,
  "finalEffects": {}
 },
 "appraisal": {
  "tool": "agro",
  "by": {
   "r1osh": {
    "x:mukfkqfz": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "2.2": "N",
      "5.2": "NA",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2016.0707": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PN",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "PY",
      "4.2": "PY",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2021.2929": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "NI",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2023.1818": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PY",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "PY",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PN",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "PN",
      "6.2": "PN",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2020.2121": {
     "answers": {
      "1.1": "Y",
      "1.2": "N",
      "2.1": "NI",
      "2.2": "Y",
      "3.1": "PY",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "NI",
      "6.1": "PY",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2014.0909": {
     "answers": {
      "1.1": "NI",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "PN",
      "3.2": "Y",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "N",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2016.2424": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PN",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2022.0606": {
     "answers": {
      "1.1": "Y",
      "1.2": "PY",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "PN",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2020.0404": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "PN",
      "4.2": "PN",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PY",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2015.1717": {
     "answers": {
      "1.1": "NI",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "PY",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "NI",
      "5.1": "PY",
      "5.2": "PN",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2018.2020": {
     "answers": {
      "1.1": "Y",
      "1.2": "PN",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "PN",
      "3.2": "PY",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PY",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PN",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "NI",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2019.0101": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2012.3030": {
     "answers": {
      "1.1": "NI",
      "1.2": "N",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "PN",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "PN",
      "5.2": "N",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2013.1111": {
     "answers": {
      "1.1": "Y",
      "1.2": "N",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "PY",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2018.0303": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "PY",
      "4.1": "PY",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "N",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2019.1010": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PN",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "PY",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "N",
      "5.2": "PN",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2017.0505": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "NI",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    }
   },
   "r2osh": {
    "x:mukfkqfz": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "N",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "2.2": "N",
      "5.2": "NA",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2016.0707": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PN",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "PY",
      "4.2": "PY",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2021.2929": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "NI",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2023.1818": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PY",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "PY",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2019": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PN",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "PN",
      "6.2": "PN",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2020.2121": {
     "answers": {
      "1.1": "Y",
      "1.2": "N",
      "2.1": "N",
      "2.2": "Y",
      "3.1": "PY",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "NI",
      "6.1": "PY",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2014.0909": {
     "answers": {
      "1.1": "NI",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "PN",
      "3.2": "Y",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "N",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2016.2424": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "NI",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PN",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2022.0606": {
     "answers": {
      "1.1": "Y",
      "1.2": "PY",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "PN",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2020.0404": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "PN",
      "4.2": "PN",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PY",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2015.1717": {
     "answers": {
      "1.1": "NI",
      "1.2": "Y",
      "2.1": "N",
      "2.2": "Y",
      "3.1": "PY",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "NI",
      "5.1": "PY",
      "5.2": "PN",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2018.2020": {
     "answers": {
      "1.1": "Y",
      "1.2": "PN",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "PN",
      "3.2": "PY",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "PY",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:respuesta del maiz a la inoculacion con micorrizas en suelos acidos|2012": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PN",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "NI",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2019.0101": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2012.3030": {
     "answers": {
      "1.1": "NI",
      "1.2": "N",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "PN",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "PN",
      "5.2": "N",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2013.1111": {
     "answers": {
      "1.1": "Y",
      "1.2": "N",
      "2.1": "N",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "PY",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2018.0303": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "PY",
      "3.1": "Y",
      "3.2": "PY",
      "4.1": "PY",
      "4.2": "NI",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "N",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2019.1010": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "PN",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "PY",
      "5.1": "Y",
      "5.2": "PY",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "t:maize grain yield after mycorrhizal inoculation a three season field study|2015": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "Y",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "NI",
      "4.2": "Y",
      "5.1": "N",
      "5.2": "PN",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    },
    "doi:10.5555/rp.2017.0505": {
     "answers": {
      "1.1": "Y",
      "1.2": "Y",
      "2.1": "NI",
      "2.2": "Y",
      "3.1": "Y",
      "3.2": "Y",
      "4.1": "Y",
      "4.2": "Y",
      "5.1": "Y",
      "5.2": "Y",
      "6.1": "Y",
      "6.2": "Y",
      "7.1": "N"
     },
     "override": {},
     "support": {},
     "stars": {}
    }
   }
  },
  "final": {},
  "grade": {},
  "weighted": true
 },
 "synthesis": {
  "outcome": "Rendimiento de grano",
  "model": "multi",
  "rho": 0.5,
  "test": "t",
  "estimator": "REML",
  "subMod": "Tipo de inoculante (especie única o consorcio)",
  "regMods": [
   "Fósforo disponible del suelo"
  ],
  "matrixField": "",
  "gapA": "",
  "gapB": ""
 },
 "writing": {
  "text": {
   "abstract": "Los inoculantes con hongos micorrízicos arbusculares se venden para mantener el rendimiento del maíz con menos fósforo, pero los ensayos de campo no coinciden. Revisamos de forma sistemática los experimentos de campo que compararon maíz inoculado con un testigo sin inocular. Se incluyeron {{n.included}} estudios. El rendimiento de grano aumentó {{effect:Rendimiento de grano}} con un modelo multinivel, con una heterogeneidad de {{i2:Rendimiento de grano}}; la certeza de la evidencia fue {{grade:Rendimiento de grano}}. La respuesta fue menor en suelos con más fósforo disponible.",
   "intro": "El maíz es el cereal con mayor superficie sembrada en México y su fertilización con fósforo es uno de los costos principales del cultivo [@Gomez2019]. Los hongos micorrízicos arbusculares amplían la exploración del suelo por la raíz y pueden mejorar la absorción de fósforo y zinc [@Kowalski2016; @Zhang2017]. Por eso se venden inoculantes que prometen mantener el rendimiento con menos fertilizante [@Mutua2020].\n\nLos ensayos de campo, sin embargo, reportan desde pérdidas hasta ganancias grandes [@Silva2018; @Tadesse2019], y no hay una síntesis cuantitativa que explique esa variación con las condiciones del suelo. El objetivo de esta revisión fue estimar el efecto medio de la inoculación sobre el rendimiento de grano en campo y explorar si depende del fósforo disponible y del tipo de inoculante.",
   "m_protocol": "El protocolo se escribió antes de iniciar la búsqueda siguiendo PRISMA-P y se reporta según PRISMA 2020 (Page et al. 2021).",
   "m_elig": "Se incluyeron experimentos de campo con maíz de grano que compararon la inoculación con hongos micorrízicos arbusculares, de una especie o en consorcio, contra un testigo sin inocular con el mismo manejo, y que reportaron el rendimiento de grano con su dispersión y el número de repeticiones. Se excluyeron los ensayos en maceta o invernadero y los que confundían la inoculación con otro tratamiento.",
   "m_search": "Se buscó en {{search.sources}}, sin restricción de idioma, con cadenas equivalentes adaptadas a cada fuente (material suplementario 1).",
   "m_select": "Dos revisores cribaron de forma independiente títulos y resúmenes con priorización por aprendizaje activo y una regla de paro predefinida; el acuerdo se midió con el kappa de Cohen (Cohen 1960). Los textos completos se evaluaron por duplicado y los desacuerdos se resolvieron por discusión.",
   "m_extract": "Se extrajeron las medias, desviaciones estándar y repeticiones de cada comparación, además del país, el diseño, el fósforo disponible del suelo, la dosis de fósforo y el tipo de inoculante. Cuando un estudio reportó varios sitios o ciclos, cada uno se registró como un efecto.",
   "m_rob": "El riesgo de sesgo se evaluó con una lista para experimentos agronómicos de campo, por dominio y en conjunto.",
   "m_synth": "Los efectos se expresaron como el logaritmo de la razón de respuesta (lnRR; Hedges et al. 1999). Como varios estudios aportaron más de un efecto (distintos sitios, ciclos o dosis), se ajustó un modelo multinivel de efectos aleatorios de tres niveles (efectos anidados en estudios; Konstantopoulos 2011; Cheung 2014) por máxima verosimilitud restringida, con pruebas t con grados de libertad iguales al número de estudios menos el de coeficientes. La heterogeneidad se describió con las varianzas de cada nivel, el I² total y por nivel, y el intervalo de predicción al 95 %. Se exploraron moderadores (Tipo de inoculante (especie única o consorcio), Fósforo disponible del suelo) con análisis de subgrupos y meta-regresión de efectos mixtos. Los análisis de sensibilidad incluyeron el otro tratamiento de los efectos múltiples (promedio por estudio con ρ = 0.2, 0.5 y 0.8), la exclusión de estudios con riesgo de sesgo alto y de desviaciones estándar imputadas, y la eliminación de un estudio a la vez. El sesgo de publicación se exploró con el gráfico de embudo, la prueba de Egger (Egger et al. 1997) sobre los promedios por estudio y su versión multinivel (Nakagawa et al. 2022), y el método de recorte y relleno (Duval y Tweedie 2000) como análisis de sensibilidad. Los análisis se hicieron con ReviewPro 1.0.0 (Barrera-Guzmán 2026).",
   "m_cert": "La certeza de la evidencia se calificó con GRADE (Guyatt et al. 2008), partiendo de alta para experimentos aleatorizados.",
   "r_select": "La búsqueda identificó {{n.identified}} registros; tras eliminar {{n.duplicates}} duplicados se cribaron {{n.screened}} por título y resumen y se evaluaron {{n.fulltext}} informes a texto completo. Se incluyeron {{n.included}} estudios ({{n.reports}} informes) (Figura 1).\n{{table:prisma}}",
   "r_chars": "Los estudios se hicieron en América, África, Asia y Europa, con diseños de bloques completos al azar en su mayoría.\n{{table:characteristics}}",
   "r_rob": "La mayoría de los estudios tuvo riesgo bajo o con algunas dudas; las dudas se concentraron en la aleatorización y en el reporte selectivo (Figuras 4 y 5).",
   "r_synth": "Para Rendimiento de grano, el efecto combinado fue {{effect:Rendimiento de grano}}, con {{k:Rendimiento de grano}} estudios y {{m:Rendimiento de grano}} efectos; I² = {{i2:Rendimiento de grano}} y el intervalo de predicción fue de {{pi:Rendimiento de grano}} (Figura 6). La respuesta disminuyó al aumentar el fósforo disponible del suelo, mientras que el tipo de inoculante no explicó la variación entre estudios (Figura 9).",
   "r_bias": "El gráfico de embudo fue simétrico y el método de recorte y relleno no añadió estudios (Figura 7).",
   "r_cert": "La certeza de la evidencia para Rendimiento de grano fue {{grade:Rendimiento de grano}}.\n{{table:sof}}",
   "discussion": "La inoculación con hongos micorrízicos arbusculares aumentó el rendimiento del maíz en campo ({{effect:Rendimiento de grano}}), pero el intervalo de predicción incluye pérdidas: en un sitio nuevo el resultado puede ser negativo. La menor respuesta en suelos ricos en fósforo concuerda con los ensayos que cruzaron inoculación y fertilización [@Rossi2013; @Oliveira2018].\n\nLos inoculantes comerciales son una inversión rentable para cualquier productor de maíz.\n\nLa evidencia tiene dos límites: la heterogeneidad es alta y varios estudios no describen cómo aleatorizaron las parcelas. Hacen falta ensayos multisitio con el fósforo del suelo medido y reportado.",
   "conclusion": "La inoculación micorrízica aumenta en promedio el rendimiento del maíz en campo, sobre todo en suelos pobres en fósforo, con una certeza de la evidencia {{grade:Rendimiento de grano}}.",
   "other": "Financiamiento: {{funding}}. Conflictos de interés: {{coi}}. El proyecto de ReviewPro con todos los datos y decisiones se publica como material suplementario (Barrera-Guzmán 2026)."
  },
  "titles": {},
  "extraThemes": 0,
  "current": "r_synth",
  "manual": {
   "prisma2020": {}
  },
  "authors": "",
  "list": ""
 },
 "report": {
  "include": {},
  "captions": {},
  "png": false,
  "dpi": 300,
  "manuscript": true,
  "annexes": true
 }
};
