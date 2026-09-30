# Puente Gumroad (jfcarpio + Escuela del Dinero) · v2

Worker aparte, solo lectura. Nunca escribe en Gumroad ni expone datos de compradores.
Diseñado con la documentación oficial de la API v2 (pegada por JFC el 2026-09-30).

## Qué necesita token y qué no
- **Sin token (JSON público de Gumroad):** catálogo `https://<tienda>.gumroad.com/.json` y detalle `/l/<permalink>.json` → nombre, enlace, precio, miniatura, portadas, calificaciones. Esto ya resuelve "ver portadas y textos".
- **Con token (Authorization: Bearer):** solo `GET /v2/sales`, para el resumen de ventas por producto y por `utm_campaign` (así se sabe qué fotograma vende).

## Pasos para JFC (una sola vez)
1. Desplegar el Worker **gumroad-bridge** a mano, sin conectarlo al repo `website` (incidente 29-09): `cd gumroad-bridge && npx wrangler deploy`.
2. Con eso ya funcionan `products.json`, `product` e `img`. Probar: `https://jfcarpio.com/api/gumroad/products.json?store=all`.
3. Solo si quieres ventas: en cada cuenta de Gumroad (Settings > Advanced > Applications) generar un token de acceso y guardarlo como **Secret** del Worker: `GUMROAD_TOKEN_JFC`, `GUMROAD_TOKEN_ESCUELA`, más `BRIDGE_KEY` (larga y aleatoria). Nunca pegarlos en el chat, Notion ni GitHub.
4. Ojo: un token generado así puede tener alcance amplio (incluye escribir). Este Worker solo llama a `/v2/sales` (lectura), pero trátalo como clave maestra: solo como Secret, y rotarlo si se filtra.

## Rutas
- `GET /api/gumroad/products.json?store=jfc|escuela|all` (público, caché 10 min)
- `GET /api/gumroad/product?store=jfc|escuela&permalink=…` (público)
- `GET /api/gumroad/img?u=<https imagen Gumroad>` (público, lista blanca de hosts)
- `GET /api/gumroad/sales-summary?store=…&after=YYYY-MM-DD` (privado, cabecera `X-Bridge-Key`)

## Pruebas y límites
- `node gumroad-bridge/test.mjs` (15 comprobaciones, sin red, respuestas simuladas con la forma de la documentación). No se probó contra Gumroad real ni desplegado.
- El catálogo público muestra hasta 100 productos visibles en las secciones de la tienda; los borradores no aparecen.
- `sales-summary` corta a 20 páginas y lo avisa con `truncado: true`.
