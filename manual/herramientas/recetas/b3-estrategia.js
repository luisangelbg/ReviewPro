await ejemplo(); goStep(3); await W(2000);
const c = tarjeta(3, 0), h = [...c.querySelectorAll('h3')].find(x => /Bitácora/.test(x.textContent));
await foto(c, 8, 150);
const r = window.__recorte.split(',').map(Number); r[3] = Math.round(h.getBoundingClientRect().top - 10 - r[1]); window.__recorte = r.join(','); return window.__recorte;
