// BuscaClientes deluxe: destello de bloom (brillo.js del sitio) la primera vez que llegan resultados en cada búsqueda.
import { brillo } from '/assets/v2/brillo.js';
const radar = document.getElementById('radar'), results = document.getElementById('results');
if (radar && results) {
  const c = document.createElement('canvas'); c.id = 'bcFx'; c.setAttribute('aria-hidden', 'true'); radar.prepend(c);
  let shown = 0;
  new MutationObserver(() => {
    const n = results.children.length;
    if (n > 0 && shown === 0) { shown = n; brillo(c, { modo: 'estallido', cantidad: 110, colores: ['#83F0E5', '#2BC4B0', '#F5B83A', '#E86040'] }); }
    if (n === 0) shown = 0;
  }).observe(results, { childList: true });
}

// Etiquetas de los ejemplos en el idioma activo (mismas que agenda-silk.js de la app).
const L = { gift_shop: ['Regalos', 'Gift shops', 'Lojas de presentes'], boutique: ['Boutiques', 'Boutiques', 'Boutiques'], artisan: ['Artesanos', 'Artisans', 'Artesãos'], florist: ['Floristerías', 'Florists', 'Floristas'] };
const chips = () => {
  const lang = (new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'es').slice(0, 2), i = { es: 0, en: 1, pt: 2 }[lang] ?? 0;
  document.querySelectorAll('.suggest .chip[data-cat]').forEach((c) => {
    const t = L[c.dataset.cat]; if (!t) return;
    const [head] = c.textContent.split(' · '); c.textContent = head + ' · ' + t[i];
  });
};
// (sustituido por latam())

// Ejemplos latinoamericanos: el clic fija primero el país (fase de captura) y luego la app pone ciudad y rubro.
const LAT = [
  ['☕', 'PA', 'Ciudad de Panamá, Panamá', 'cafe', ['Cafeterías', 'Cafés', 'Cafés']],
  ['💄', 'PY', 'Asunción, Paraguay', 'beauty', ['Belleza', 'Beauty', 'Beleza']],
  ['📚', 'EC', 'Quito, Ecuador', 'bookstore', ['Librerías', 'Bookstores', 'Livrarias']],
  ['💍', 'GT', 'Ciudad de Guatemala, Guatemala', 'jewelry', ['Joyerías', 'Jewelers', 'Joalharias']],
];
const latam = () => {
  const lang = (new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'es').slice(0, 2), k = { es: 0, en: 1, pt: 2 }[lang] ?? 0;
  document.querySelectorAll('.suggest .chip[data-cat]').forEach((c, i) => {
    const d = LAT[i]; if (!d) return;
    c.dataset.cat = d[3]; c.dataset.city = d[2]; c.dataset.cc = d[1];
    c.textContent = d[0] + ' ' + d[2].split(',')[0] + ' · ' + d[4][k];
  });
};
document.addEventListener('click', (e) => {
  const c = e.target.closest && e.target.closest('.suggest .chip[data-cc]'); if (!c) return;
  const s = document.getElementById('country');
  if (s && [...s.options].some((o) => o.value === c.dataset.cc)) { s.value = c.dataset.cc; s.dispatchEvent(new Event('change', { bubbles: true })); }
}, true);
latam(); setTimeout(latam, 1600);

// Traspaso de cartera desde la dirección anterior (herramienta existente migrar.html, sin servidores).
const radarEl = document.getElementById('radar');
if (radarEl && !localStorage.getItem('bc-migra-visto')) {
  const n = document.createElement('p'); n.className = 'bc-migra';
  n.innerHTML = '¿Ya usabas BuscaClientes en su dirección anterior? <a href="https://buscaclientes-web.buscaclientes.workers.dev/migrar.html" target="_blank" rel="noopener">1. Descarga tu Agenda</a> · <a href="/buscaclientes/migrar.html">2. Impórtala aquí</a> <button type="button" aria-label="Cerrar">×</button>';
  n.querySelector('button').onclick = () => { localStorage.setItem('bc-migra-visto', '1'); n.remove(); };
  radarEl.before(n);
}
