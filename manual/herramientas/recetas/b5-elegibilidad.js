await ejemplo(); const ft = state.fulltext, act = state.screening.active, d = ft.decisions[act];
const k = Object.keys(d).sort((a, b) => (d[b].t || 0) - (d[a].t || 0)).find(x => d[x].d === 'exc') || Object.keys(d)[0];
delete d[k]; delete (ft.final || {})[k]; Block5.renderAll();
goStep(5); await W(2500); Block5.renderAll(); await W(600);
await foto(tarjeta(5, 2), 8, 150);
const r = window.__recorte.split(",").map(Number); r[3] = Math.min(r[3], 760); window.__recorte = r.join(","); return window.__recorte;
