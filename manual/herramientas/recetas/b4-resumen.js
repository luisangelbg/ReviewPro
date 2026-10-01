await ejemplo(); goStep(4); await W(2200);
const c = tarjeta(4, 4), h = [...c.querySelectorAll('h3')].find(x => /Mis decisiones/.test(x.textContent));
await foto(c, 8, 150);
const r = window.__recorte.split(',').map(Number); r[3] = Math.round(h.getBoundingClientRect().top - 12 - r[1]); window.__recorte = r.join(','); return window.__recorte;
