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
chips(); setTimeout(chips, 1500);
