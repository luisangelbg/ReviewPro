# ReviewPro

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**Del montón de artículos a una revisión que se sostiene.** Una aplicación para hacer un artículo de revisión de
principio a fin —**narrativo, exploratorio (*scoping*), sistemático o con meta-análisis**—: la pregunta y el
protocolo, las cadenas de búsqueda, la importación y los duplicados, el cribado priorizado, el texto completo y el
diagrama PRISMA, la extracción de datos, la calidad y el riesgo de sesgo, la síntesis y el meta-análisis, la
escritura orientada y el informe. Sin programar, sin instalar nada y sin que tus datos salgan de tu computadora.

Está construida por bloques y **los diez están listos**: la aplicación está completa.

*English summary below.*

## Cómo abrirla

1. Haz doble clic en **`index.html`**. Se abre en tu navegador, en la portada. Todo funciona desde la copia local,
   sin servidor y sin conexión a internet.
2. Si tu institución bloquea las páginas abiertas como archivo, haz doble clic en **`Open ReviewPro.bat`**
   (o ejecuta `server.ps1` con PowerShell): inicia un pequeño servidor y abre `http://localhost:9550`.
3. En la portada, **«Abrir el ejemplo completo»** carga una revisión ficticia ya hecha, con todos los bloques
   llenos, para recorrer la app antes de empezar la tuya.

## Los cuatro tipos de revisión

En el Bloque 2 se elige el tipo, y la app arma la ruta: qué bloques son necesarios y cuáles opcionales.

| Tipo | La pregunta que responde | Bloques necesarios | Opcionales | Guía de reporte |
|---|---|---|---|---|
| **Narrativa** | ¿Qué se sabe de este tema y cómo se interpreta? | 2, 3, 6, 8, 9 y 10 | 4, 5 y 7 | SANRA |
| **Exploratoria (*scoping*)** | ¿Cuánta evidencia hay, de qué tipo y dónde están los vacíos? | 2 a 6 y 8 a 10 | 7 | PRISMA-ScR |
| **Sistemática** | ¿Funciona, cuánto y con qué certeza, según toda la evidencia disponible? | 2 a 10 | — | PRISMA 2020 |
| **Meta-análisis** | ¿Cuál es el tamaño del efecto combinado y qué explica que varíe? | 2 a 10 | — | PRISMA 2020 y certeza GRADE |

## Los diez bloques

| Bloque | Contenido | Estado |
|---|---|---|
| 1 | Inicio: los cuatro tipos y su ruta, un asistente de cinco preguntas, y dos laboratorios para aprender jugando: el cribado priorizado y el meta-análisis | listo |
| 2 | Protocolo: pregunta con los marcos PICO, PICOS, PECO, PCC o SPIDER y su redacción automática, criterios de inclusión y exclusión numerados, lista PRISMA-P, cronograma, equipo con ORCID y las plantillas de registro para PROSPERO y OSF llenadas desde el protocolo | listo |
| 3 | Búsqueda: bloques de conceptos que se convierten en cadenas para las cinco sintaxis de las bases de datos, revisión de la estrategia, importación de RIS, BibTeX, MEDLINE y texto delimitado, y duplicados seguros y probables que decide una persona | listo |
| 4 | Cribado: piloto, cola priorizada que aprende de tus decisiones, regla de paro con muestra de verificación, segunda lectura ciega, acuerdo con kappa de Cohen y de Fleiss, y conciliación de conflictos, en una sola computadora o en varias | listo |
| 5 | Texto completo: obtención de los artículos (la app guarda la ruta, no el PDF), elegibilidad con motivo obligatorio, estudios por otros métodos y el diagrama PRISMA 2020 o PRISMA-ScR, que siempre cuadra | listo |
| 6 | Extracción: formulario por tipo, extracción doble con conciliación campo a campo, y una calculadora que saca medias, desviaciones y tamaños del efecto de lo que reportan los artículos (EE, IC, DMS, CV, medianas, t, F, p, tablas 2×2) | listo |
| 7 | Calidad y sesgo: una lista propia para experimentos agronómicos con siete dominios, más RoB 2, ROBINS-I, Newcastle–Ottawa y una lista cualitativa; conciliación, semáforo, GRADE por desenlace y tabla de resumen de hallazgos | listo |
| 8 | Síntesis y meta-análisis: modelo multinivel de tres niveles por omisión, REML, meta-regresión, subgrupos, I² por nivel, intervalo de predicción, análisis de sensibilidad, sesgo de publicación (Egger, recorte y relleno), y síntesis sin meta-análisis | listo |
| 9 | Escritura orientada: el esqueleto del tipo de revisión, citas y datos vivos que se actualizan solos, un verificador de afirmaciones sin respaldo y las listas PRISMA 2020, PRISMA-ScR y SANRA; exporta a .docx, HTML y Markdown. La app orienta; no escribe por ti | listo |
| 10 | Informe: estado del proyecto, galería de figuras con leyendas, informe HTML que se lee solo e imprimible a PDF, y un paquete ZIP con todo lo necesario para que otra persona repita la revisión | listo |

## Qué corre dónde

Todo se calcula y se dibuja en el navegador con JavaScript simple: no hay servidor, no se sube nada y nada de lo
que haces sale de tu computadora. No usa bibliotecas de terceros; las figuras las genera el propio código en SVG.
El proyecto se guarda en el navegador y en un archivo `.reviewpro.json` que se puede compartir con el resto del
equipo. La interfaz está en español e inglés, con tema claro y oscuro.

## Pruebas y validación

`tests/index.html` reúne **556 pruebas**, todas en verde. Abierta con doble clic corren 518; las demás piden el
servidor local (`server.ps1`). Los cálculos de los Bloques 1, 4, 6 y 8 —el meta-análisis, el acuerdo entre
revisores, los tamaños del efecto y el modelo multinivel— se comprobaron contra cálculos independientes hechos en R
con los guiones de `tools/` (`validar_bloque*.R`), cuyos resultados viven en `tests/r_reference_*.js`, y contra los
valores publicados de los ejemplos clásicos.

## Bases de ejemplo

`ejemplos/` trae seis archivos de registros bibliográficos **ficticios**, uno por formato de importación, con
duplicados a propósito, para practicar el Bloque 3. Los genera `tools/escribir_ejemplos.ps1`.

## El manual de usuario

`manual/` tiene el manual en español: portada, introducción, un capítulo por bloque y los apéndices, cada parte en
un archivo HTML que se abre con doble clic, y el PDF completo (`manual/ReviewPro User's Manual.pdf`).
`manual/LEEME.md` explica cómo se escriben, se capturan y se unen las partes.

## Licencia y componentes de terceros

Copyright © 2026 Luis Ángel Barrera-Guzmán. ReviewPro es software libre: se puede usar, estudiar, modificar y
redistribuir según los términos de la **Licencia Pública General de GNU, versión 3**, cuyo texto completo está en
[LICENSE](LICENSE). Toda versión modificada que se redistribuya debe conservar la misma licencia y dar crédito al
autor.

Casi todo el código es propio. Lo que viene de terceros se declara en
[LICENSES-TERCEROS.md](LICENSES-TERCEROS.md), con su licencia: los íconos de Lucide (ISC) del navegador y del
estudio de figuras, y las letras de la suite, que se cargan del portal cuando hay conexión. Los estudios, los
registros y la revisión del ejemplo son ficticios. Cada método lleva la cita de quien lo publicó, en la portada y en
el informe.

## Cómo citarla

> Barrera-Guzmán, L.Á. (2026). *ReviewPro: plataforma en el navegador para artículos de revisión narrativos,
> exploratorios y sistemáticos y meta-análisis* (versión 1.0.0) [software].
> https://github.com/luisangelbg/ReviewPro

La portada de la app trae la misma cita, con un botón que la copia. Los datos para gestores de referencias están en
[CITATION.cff](CITATION.cff).

## Publicada

- Código fuente: <https://github.com/luisangelbg/ReviewPro>
- La app en línea: <https://luisangelbg.github.io/ReviewPro/>

## English summary

**ReviewPro** is a self-contained browser application that carries a review article from start to finish —
**narrative, scoping, systematic or meta-analysis**—: the question and the protocol (PICO and related frameworks,
PRISMA-P, PROSPERO and OSF registration templates), search strings for five database syntaxes, record import and
de-duplication, prioritised screening with a stopping rule and inter-rater agreement, full-text eligibility and the
PRISMA 2020 or PRISMA-ScR flow diagram, double data extraction with an effect-size calculator, quality and risk of
bias (an agronomic-experiment checklist of its own, RoB 2, ROBINS-I, Newcastle–Ottawa) with GRADE and a summary of
findings, synthesis with a three-level meta-analytic model fitted by REML, meta-regression, subgroups, sensitivity
analyses and publication bias, guided writing that ties every claim to its evidence, and a self-contained report
with a reproducible package. All ten blocks are ready: **the application is complete**. Everything runs locally, in
Spanish and English, with light and dark themes. Open `index.html` by double-clicking it, or run `server.ps1` for
`http://localhost:9550`. Tests: `tests/index.html` (556, checked against independent calculations in R). The user's
manual is in Spanish, in `manual/`.

Free software under the GNU GPL v3 (© 2026 Luis Ángel Barrera-Guzmán). Source code:
<https://github.com/luisangelbg/ReviewPro>; running app: <https://luisangelbg.github.io/ReviewPro/>.
