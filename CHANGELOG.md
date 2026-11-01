# Cambios

## Sin publicar

Revisión de la interfaz inglesa (sale de traducir el manual); la versión sigue siendo la 1.0.0 y no cambia ningún
cálculo.

- **Textos que seguían en español en inglés:** «IC 95 %» en la ficha del efecto (Bloque 6), «CI 95 %» en el efecto
  combinado del Bloque 8 y del laboratorio de meta-análisis (ahora «95 % CI»), el encabezado «EE» de la
  meta-regresión (ahora «SE»), y «s.f.» y «Anónimo» en las citas de un manuscrito en inglés (ahora «n.d.» y
  «Anonymous»; en español sigue igual). La ficha del efecto en español decía «SE»: ahora «EE».
- **Ortografía estadounidense** en toda la interfaz inglesa y en los módulos comunes (navegador, Estudio de figuras,
  editor ✎ y esperas): gray literature, judgment, rigor, neighbors, favorable, color, center, canceled, skeptical,
  signaling, toward, forever, analyzed. «Organisational affiliation» se queda porque es el nombre literal del campo
  del formulario de PROSPERO; los títulos de obras citadas tampoco cambian.
- **Redacción inglesa:** concordancia de «1 is met in later blocks», «it is not rated down and is noted»,
  «exclude because of…» y «Reason for exclusion (required)», «not applicable» en lugar de «n/a», «Weight» con
  mayúscula en los forest plots, «changes significance» junto a «changes sign», y comillas tipográficas “ ” en los
  textos ingleses. En español, «1 se cumple en bloques posteriores» y «Peso» con mayúscula.
- **«Estimador de τ²»** en mayúsculas mostraba «Τ²» (tau mayúscula); ahora τ² conserva su forma.
- **Pruebas:** una nueva para las citas en inglés; 558 por el servidor local y 519 con doble clic, todas en verde.

## Después de la 1.0.0 — 2026-10-09

- **Contraste de las teclas (WCAG 1.4.3):** la hoja de estilos de la app atenuaba toda tecla (`kbd { opacity: .8 }`),
  también la «Ctrl K» de los dos botones de búsqueda del navegador, que quedaba en 4.13:1 sobre blanco (se piden
  4.5:1). Sin la opacidad mide 6.72:1, y las teclas del cribado y del texto completo (Bloques 4 y 5) dejan también de
  verse atenuadas. No cambia ningún cálculo; las 518 pruebas siguen pasando.

## 1.0.0 — 2026-10-01

Primera versión publicada: los diez bloques completos y el manual en español.

- **Bloques:** inicio con los laboratorios de cribado y de meta-análisis, protocolo, búsqueda, cribado, texto completo
  y PRISMA, extracción, calidad y sesgo, síntesis y meta-análisis, escritura orientada e informe, para revisiones
  narrativas, exploratorias, sistemáticas y meta-análisis.
- **Ejemplo completo:** el botón «Abrir el ejemplo completo» de la portada carga una revisión ficticia con todos los
  bloques llenos. `ejemplos/` trae seis archivos de registros ficticios para practicar la importación.
- **Módulos compartidos de la suite:** el Navegador LABG (barra lateral de bloques, índice de secciones y paleta
  Ctrl+K) y el Estudio de figuras LABG (editar y exportar cada figura a la medida de la revista). Los íconos son de
  Lucide (ISC); ver `LICENSES-TERCEROS.md`.
- **Pruebas:** 556 en `tests/index.html`, todas en verde (518 con doble clic; el resto pide el servidor local), con
  los cálculos de los Bloques 1, 4, 6 y 8 comprobados contra R (`tools/validar_bloque*.R`).
- **Manual de usuario** en español en `manual/`, con su PDF.
- **Publicación:** código en GitHub y la app en GitHub Pages. Se agregan `README.md`, `CITATION.cff`,
  `codemeta.json` y este archivo. La prueba de exportación a BibTeX usaba el nombre de una universidad real como
  institución de una tesis inventada; ahora usa uno ficticio.
