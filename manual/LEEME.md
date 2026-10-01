# Manual de usuario de ReviewPro

El manual se escribe por partes, en HTML, con el mismo estilo que los manuales de PhenologyPro, EconomicsPro y las
demás apps LABG. Está en español; la versión en inglés se decide aparte. El PDF se imprime **una sola vez**, al final.

```
manual/
  manual.css           hoja de la portada
  interior.css         páginas interiores: un color por bloque (los de la app)
  paginar.js           reparte el contenido en hojas tamaño carta (encabezados, números de página, índice)
  img/                 capturas de pantalla de la app (al doble de resolución)
  herramientas/
    captura.ps1        abre la app sin ventana, ejecuta recetas/_comun.js + la receta y guarda img/<nombre>.png
    recetas/           una receta por captura; _comun.js abre el proyecto de ejemplo (js/demo.js)
    evaluar.ps1        ejecuta un guion en una página; con huecos.js informa el hueco al pie de cada hoja
    unir-manual.ps1    une portada y partes en es/manual-completo.html
  es/                  00a-portada, 00b-introduccion, 01..10 (capítulo = bloque), 11-apendices
  ReviewPro User's Manual.pdf
```

Todas las capturas y cifras salen del **proyecto de ejemplo completo** (`js/demo.js`, botón «Abrir el ejemplo
completo» de la portada): meta-análisis de micorrizas y rendimiento de maíz, 20 estudios, 41 efectos, +16.9 %.
Si el ejemplo cambia, hay que volver a tomar las capturas y revisar las cifras del texto.

Las herramientas usan los puertos 9555 (captura) y 9556 (evaluar) para no chocar con otras sesiones.

## Cómo se trabaja

1. Cada parte se abre con doble clic y se ve ya paginada. Revisar huecos:
   `powershell -ExecutionPolicy Bypass -File manual\herramientas\evaluar.ps1 -ScriptFile manual\herramientas\huecos.js -Page manual/es/NN-….html`
2. Capturas: `powershell -ExecutionPolicy Bypass -File manual\herramientas\captura.ps1 -Receta b8-bosque -Alto 1800`
3. Al terminar: `powershell -ExecutionPolicy Bypass -File herramientas\unir-manual.ps1 es` (desde `manual/`) y
   `tools\local\shot.ps1 -Out "manual\ReviewPro User's Manual.pdf" -Page manual/es/manual-completo.html -Pdf -Wait 25000`.
   Hecho el 27 sep 2026: 98 hojas tamaño carta, 13 MB.
