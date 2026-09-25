// generar-urls-seo.mjs — friendly-123 landing: direcciones propias para buscadores
// (JFC 2026-09-24: "no paginas propias a menos que lo sean pero sigan siendo
// apenas desplegables de la landing en UX real").
//
// QUE HACE: toma la landing TAL COMO ESTA EN EL ULTIMO COMMIT (git HEAD, asi no
// arrastra trabajo sin commitear) y escribe 5 copias con una sola diferencia de
// UX: que idioma abre y que articulo aparece ya abierto como <dialog>. Cada copia
// tiene su propio <title>, description, canonical, Open Graph y JSON-LD, y el
// texto del articulo va en el HTML estatico (lo leen buscadores sin JavaScript).
// Al cerrar el articulo, la barra vuelve a la landing de ese idioma: la persona
// queda en la landing de siempre. No hay paginas con otro diseno.
//
//   /friendly123/es/                               landing en espanol
//   /friendly123/shared-digital-notebook/          landing + articulo 1 (EN)
//   /friendly123/consignment-commissions/          landing + articulo 2 (EN)
//   /friendly123/es/cuaderno-digital-compartido/   landing + articulo 1 (ES)
//   /friendly123/es/comisiones-de-consignacion/    landing + articulo 2 (ES)
//
// Las equivalencias EN<->ES (hreflang) van en /sitemap.xml (Google las acepta
// ahi), para no tocar friendly123/index.html. USO (desde la raiz del repo):
//   node friendly123/generar-urls-seo.mjs
// Rehacer cada vez que cambie la landing. No toca datos de nadie.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/* MUDANZA A friendly123.com (JFC 2026-09-24: "quizas next week"). Todo el
   dominio y la ruta viven en estas dos constantes. Al mudarse:
     ORIGEN = "https://friendly123.com"; RUTA = "/";
   y volver a correr este script (y ajustar el bloque de friendly-123 del sitemap). */
const ORIGEN = "https://jfcarpio.com";
const RUTA = "/friendly123/";
const BASE = ORIGEN + RUTA;
const OG = BASE + "og-friendly123.jpg";
const FECHA = new Date().toISOString().slice(0, 10);
const src = execSync("git show HEAD:friendly123/index.html", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).replace(/\r\n/g, "\n");

function uno(re, que) { const m = src.match(re); if (!m) throw new Error("no encontrado: " + que); return m; }
// Textos ES ya existentes en la landing (objeto copy.es, linea JSON).
// Objeto literal de JS (no JSON estricto): se evalua; es contenido de este mismo repo.
const esJson = new Function("return (" + uno(/\n\s*es:(\{"payNext"[^\n]*\})\s*,?\n/, "copy.es")[1] + ")")();
const tituloES = uno(/document\.title=language==="es"\?"([^"]+)"/, "titulo ES")[1];
const descES = uno(/content=language==="es"\?"([^"]+)"/, "description ES")[1];
const tituloEN = uno(/<title>([^<]+)<\/title>/, "titulo EN")[1];
const descEN = uno(/<meta name="description" content="([^"]+)">/, "description EN")[1];
const texto = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const en = (k) => texto(uno(new RegExp('data-i18n="' + k + '"[^>]*>([^<]*)'), k)[1]);
const h2De = (html) => texto((html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "");

const ARTS = [
  { id: "read-notebook", key: "art1Body", n: 1, en: "shared-digital-notebook/", es: "es/cuaderno-digital-compartido/" },
  { id: "read-consignment", key: "art2Body", n: 2, en: "consignment-commissions/", es: "es/comisiones-de-consignacion/" },
];
for (const a of ARTS) {
  const body = uno(new RegExp('id="' + a.id + '"[\\s\\S]*?data-i18n-html="' + a.key + '">([\\s\\S]*?)</div><div class="read-actions">'), a.id)[1];
  a.bodyEN = body; a.bodyES = esJson[a.key];
  if (!a.bodyES) throw new Error("falta copy.es." + a.key);
  a.tituloEN = h2De(body) + " | friendly-123"; a.tituloES = h2De(a.bodyES) + " | friendly-123";
  a.descEN = en("read" + a.n + "Teaser"); a.descES = esJson["read" + a.n + "Teaser"];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function reemplazar(html, a, b, que) { if (!html.includes(a)) throw new Error("ancla no encontrada: " + que); return html.split(a).join(b); }

function pagina({ lang, url, titulo, desc, art }) {
  let h = src;
  const locale = lang === "es" ? "es_ES" : "en_US", otro = lang === "es" ? "en_US" : "es_ES";
  h = reemplazar(h, '<html lang="en">', `<html lang="${lang}">`, "html lang");
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulo)}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  h = h.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  h = h.replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${locale}">`);
  h = h.replace(/<meta property="og:locale:alternate" content="[^"]*">/, `<meta property="og:locale:alternate" content="${otro}">`);
  if (art) {
    h = h.replace(/<meta property="og:type" content="website">/, '<meta property="og:type" content="article">');
    // Texto del articulo en el HTML estatico, en el idioma de la pagina, y el <dialog> ya abierto.
    const bodyActual = lang === "es" ? art.bodyES : art.bodyEN;
    const bodyEnSrc = art.bodyEN;
    h = reemplazar(h, `data-i18n-html="${art.key}">` + bodyEnSrc + "</div>", `data-i18n-html="${art.key}">` + bodyActual + "</div>", "cuerpo " + art.id);
    h = reemplazar(h, `<dialog class="read-dialog" id="${art.id}"`, `<dialog class="read-dialog" id="${art.id}" open`, "dialog " + art.id);
    const ld = { "@context": "https://schema.org", "@type": "Article", headline: h2De(bodyActual), description: desc, inLanguage: lang, url,
      image: OG, datePublished: "2026-09-24", dateModified: FECHA, mainEntityOfPage: url,
      author: { "@type": "Person", name: "Juan Fernando Carpio", url: "https://jfcarpio.com/" },
      publisher: { "@type": "Organization", name: "JFCarpio.com", url: "https://jfcarpio.com/" },
      about: { "@type": "SoftwareApplication", name: "friendly-123", url: BASE } };
    h = h.replace("</head>", `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
  }
  // UX: idioma fijado por la direccion; al abrir, el articulo es el desplegable
  // de siempre (showModal); al cerrarlo, la barra vuelve a la landing del idioma.
  // Solo la ruta: replaceState no acepta otro dominio (probado en local y en vivo).
  const inicio = lang === "es" ? RUTA + "es/" : RUTA;
  const guion = `<script>
/* Generado por friendly123/generar-urls-seo.mjs (${FECHA}). No editar a mano: rehacer con el script. */
(function(){try{setLanguage("${lang}")}catch(_){}
${art ? `/* setLanguage() pone el titulo y la descripcion de la LANDING; mientras el articulo
   esta abierto mandan los suyos (Google ejecuta JS y lee el titulo final). */
var T=${JSON.stringify(titulo)},D=${JSON.stringify(desc)},md=document.querySelector('meta[name="description"]');
document.title=T;if(md)md.content=D;
var d=document.getElementById("${art.id}");if(d){try{d.removeAttribute("open");d.showModal();}catch(_){d.setAttribute("open","");}
/* Al cerrar (X, fondo o Escape) la barra vuelve a la landing. Se observa el
   atributo "open": en esta landing el evento "close" no llega (probado). */
var volver=function(){try{history.replaceState(null,"",${JSON.stringify(inicio)})}catch(_){}try{setLanguage(document.documentElement.lang==="es"?"es":"en")}catch(_){}};
try{new MutationObserver(function(){if(!d.open){volver();this.disconnect();}}).observe(d,{attributes:true,attributeFilter:["open"]});}catch(_){d.addEventListener("close",volver);}}` : ""}
})();
</script>
</body>`;
  h = reemplazar(h, "</body>", guion, "</body>");
  return h;
}

const salidas = [
  { ruta: "es/", lang: "es", url: BASE + "es/", titulo: tituloES, desc: descES },
];
for (const a of ARTS) {
  salidas.push({ ruta: a.en, lang: "en", url: BASE + a.en, titulo: a.tituloEN, desc: a.descEN, art: a });
  salidas.push({ ruta: a.es, lang: "es", url: BASE + a.es, titulo: a.tituloES, desc: a.descES, art: a });
}
for (const s of salidas) {
  const dir = path.join("friendly123", s.ruta);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pagina(s));
  console.log("ok", s.url, "|", s.titulo);
}
console.log("titulo EN landing:", tituloEN);
