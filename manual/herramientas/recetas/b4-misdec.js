await ejemplo(); goStep(4); await W(2200);
const c = tarjeta(4, 4), h = [...c.querySelectorAll('h3')].find(x => /Mis decisiones/.test(x.textContent));
const rows = [...c.querySelectorAll('tbody tr')].slice(0, 6);
return foto([h, ...rows], 10, 150);
