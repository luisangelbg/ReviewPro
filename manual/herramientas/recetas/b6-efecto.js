await ejemplo(); goStep(6); await W(2500); q('#panel-6 [data-study]:nth-child(7)').click(); await W(900);
q('#panel-6 [data-edit="0"]').click(); await W(900);
const st = q('#b6Study'), t = [...st.querySelectorAll('*')].find(n => /^Tamaños de efecto$/i.test(n.textContent.trim()) && n.children.length === 0);
irA(t, 140); await W(500);
const tr = t.getBoundingClientRect(), sr = st.getBoundingClientRect();
window.__recorte = [Math.round(sr.left - 8), Math.round(tr.top - 10), Math.round(sr.width + 16), Math.round(Math.min(sr.bottom, window.innerHeight) - tr.top + 18)].join(','); return window.__recorte;
