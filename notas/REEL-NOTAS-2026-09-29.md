# Reel vertical de jfcarpio.com — notas para JFC y para cualquier IA (2026-09-29)

Estas notas NO se publican (`notas/` está en `.assetsignore`). Las notas cortas viven también como comentario al inicio del
`<body>` de `index.html` (visibles solo en "ver código fuente").

## Qué se hizo
- `index.html` pasó a ser un **reel vertical**: 12 fotogramas de 80dvh con foto a pantalla completa, parallax, entrada de "rollo
  viejo" (barrido con desenfoque vertical y líneas), panel de detalle que entra inclinando el fotograma 15°, cursor propio y pips.
  Comportamiento tomado del ejemplo motionin.design/gallery/cinema-reel (solo la idea; ni código, ni textos, ni fotos copiados).
  Motor propio en JS al final de `index.html`, sin librerías.
- Colores y contenido = el sitio de julio 2026 (commit `9f550ca`, publicado hasta el 25-09): fondo blanco, tinta `#0A0A0A`, acentos
  dorado `#E8A020`, naranja `#E86040`, verde `#28ECAA`/`#08764E`, azul `#3B7EE8`. Tipografías: Barlow Condensed, Lora, Space Mono.
- Dos fotogramas NUEVOS: **Libro** ("10 Lecciones de Economía") y **Gumroad** (tienda). El resto son los textos de julio tal cual.
- Respaldo del reel anterior (Codex, 28-09): `indexbackup28sept2026-reel-codex.html`. No borrar.

## Fotogramas (orden) y foto de cada uno
| # | id | foto |
|---|----|------|
| 1 | portada | `network-pacific.jpg` (propia) |
| 2 | dashboards | Pexels 590022 (una de las 5 tarjetas canónicas) |
| 3 | reportes | Pexels 1108101 (canónica) |
| 4 | talleres | Pexels 1181396 (canónica) |
| 5 | articulos | Pexels 256541 (canónica) |
| 6 | publicaciones | Pexels 29713916 (canónica) |
| 7 | libro | Pexels 32414345 "Open Book in Sunlight on Wooden Table" (hallada por búsqueda web) |
| 8 | gumroad | Pexels 17150248 "Tablet and Laptop on Desk" (lámpara cálida, noche) (búsqueda web) |
| 9 | dato | `network-intel.jpg` (propia) |
| 10 | trayectoria | Pexels 18026896 "View of the Cathedral of Cuenca, Ecuador" (búsqueda web) |
| 11 | clientes | `network-bg.jpg` (propia) |
| 12 | contacto | `network-pacific.jpg` (propia, recorte a la izquierda) |
Los IDs de Pexels "de búsqueda web" no se pudieron ver desde la nube (Pexels/Unsplash/Gumroad están bloqueados en el entorno);
se confía en el título y la descripción del resultado de búsqueda. **JFC: revisa las fotos 7, 8 y 10 en el teléfono** y dime si
alguna no te gusta; se cambia una línea.

## Fuentes de los textos nuevos
- Libro: reseña en Econ 101 (USFQ) http://econ101.usfq.edu.ec/2014/10/resena.html (oct 2014); Centro Mises / Mises Hispano
  https://www.mises.org.es/2016/01/10-lecciones-de-economia-que-los-gobiernos-quisieran-ocultarle-juan-fernando-carpio/ (ene 2016);
  Amazon Kindle B08JQDXTDH; Goodreads 19326777. Enlace de compra: ficha de Gumroad `https://jfcarpio.gumroad.com/l/10LeccionesdeEconomia`
  (ya estaba en el sitio). El precio NO se muestra.
- Gumroad: titular de la tienda verificado por búsqueda: "Herramientas del siglo XXI para profesionales independientes y PYMES".
  El resto (reporte de minerales críticos, guías gratuitas sobre modelos de negocio / audiencia / dolarización, servicios) es lo que el
  sitio ya decía (commit `0cce2c5`, Codex). **No se pudo abrir jfcarpio.gumroad.com desde la nube.**

## Pasada de Jev
2026-09-29: Jev respondió 403 ("Free tier users do not have access to this model"). Los textos nuevos se validaron a mano con los
mismos criterios y se quitaron 3 inventos míos ("no para lucirse", "cupo limitado" en Gumroad, un descriptor de guías). **Pasada de Jev
PENDIENTE** (correrla desde friendly-123 cuando haya crédito).

## Decisiones que JFC debe confirmar
1. Título del libro: "ocultarte" (Econ 101, Amazon, Barnes & Noble) o "ocultarle" (Google Books, Mises Hispano). Se usó "ocultarte".
2. Lista real de Gumroad (título, precio, URL) para afinar el fotograma 8.
3. El H1 aprobado el 27-09 ("investigación para decisiones claras en países complicados") NO está: pediste el contenido de hace un
   mes ("Blog. Herramientas. Soluciones."). Sigue en git (commit `0cce2c5`).
4. Tono "SOLIDEZ, no lucimiento" (27-09) vs "mucho más cool" (29-09): se hizo lo segundo en la forma y lo primero en el fondo. Si se
   siente demasiado, poner `auto=false` en el motor (sin barrido de entrada).
5. Apps: por tu pedido no hay fotograma de apps; solo el enlace "Apps: friendly-123" en el pie del último fotograma.

## Reglas que se respetaron (y por qué)
- Legibilidad: texto blanco sobre un bloque navy propio (`.tx::before`, 0.93-0.95), etiquetas en cápsula navy, nada gris ni translúcido,
  mínimo 14px (texto 16-18px). Probado con foto 100% blanca (peor caso): contraste medido sobre píxeles reales >= 4.5:1.
- `dvh`, nunca `vh` (iOS Safari). Reveal gate `js-rv`; si el motor falla, el sitio queda apilado y completo. i18n: mismas claves ES/EN.
- Pre-flight del repo y CI (`validate-html.yml`) pasan: 1 tipo de documento, 0 `%20`, 0 `src` relativos, JSON-LD válido, 0 chrome-extension.
- Nunca "economista" para JFC; marca "JFCarpio.com".

## Cómo probar
`SITE=$PWD PW=<ruta a playwright> node scripts/test-reel.cjs white` (peor caso de legibilidad) y `... pretty` (capturas en `$SHOTS`).
Cubre 5 tamaños (1440x900, 1280x720, 820x1180, 390x844, 375x667): desborde de texto, contraste, texto gris, entrada, rueda, flechas,
arrastre, 12 paneles, idioma, hash `#libro`, `?lang=en`, reduced-motion y sin JavaScript. Resultado del 2026-09-29: TODO OK.

## DESPLIEGUE (importante)
jfcarpio.com lo sirve el Worker de Cloudflare `website`. El 2026-09-29 ese Worker estaba conectado (Workers Builds) al repo
`friendly-123` en vez de a este repo: cada fusión en friendly-123 publicó la app encima de la página. Hasta que JFC lo reconecte
(Settings > Build > Disconnect; Connect > `jfcarpiopuntocom/website`, rama `main`) y haga Rollback, fusionar aquí NO cambia la web.
