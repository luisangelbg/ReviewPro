# Cambios

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
