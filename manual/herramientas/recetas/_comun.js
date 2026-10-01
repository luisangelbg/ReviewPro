/* Preámbulo de todas las recetas (captura.ps1 lo antepone). Da las herramientas y abre el ejemplo completo
   del manual: el meta-análisis de micorrizas y rendimiento de maíz que trae la app (botón «Abrir el ejemplo
   completo» de la portada), en español y tema claro. */
const W = ms => new Promise(r => setTimeout(r, ms));
const q = s => document.querySelector(s);
const qa = s => [...document.querySelectorAll(s)];
const top = n => n.getBoundingClientRect().top + window.scrollY;
const irA = (n, m = 96) => window.scrollTo({ top: top(n) - m, behavior: "instant" });
const caja = (nodos, p = 8) => { const rs = nodos.filter(Boolean).map(n => n.getBoundingClientRect()); const x = Math.max(0, Math.min(...rs.map(r => r.left)) - p), y = Math.max(0, Math.min(...rs.map(r => r.top)) - p); window.__recorte = [x, y, Math.min(window.innerWidth, Math.max(...rs.map(r => r.right)) + p) - x, Math.min(window.innerHeight, Math.max(...rs.map(r => r.bottom)) + p) - y].map(Math.round).join(","); return window.__recorte; };
const tarjeta = (n, i) => qa("#panel-" + n + " .card")[i];
const pasos = async (...ns) => { for (const n of ns) { goStep(n); await W(900); } };
const ejemplo = async () => { window.confirm = () => true; window.alert = () => {}; Project.apply(JSON.parse(JSON.stringify(window.DEMO_PROJECT))); Project.saveLocal(); await W(400); };
/* muestra un nodo arriba de la ventana y devuelve el recorte de los nodos */
const foto = async (nodos, p = 8, m = 96) => { const ns = [].concat(nodos).filter(Boolean); irA(ns.reduce((a, b) => (top(b) < top(a) ? b : a)), m); await W(500); return caja(ns, p); };
