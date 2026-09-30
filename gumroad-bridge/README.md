# Puente Gumroad (jfcarpio + Escuela del Dinero)

Worker aparte, solo lectura. Nunca escribe en Gumroad ni expone datos de compradores.

## Pasos para JFC (una sola vez, ~15 min)
1. En cada cuenta de Gumroad (jfcarpio y escuela-dinero): Settings > Advanced > Applications > crear aplicación > **Generate access token**. (Verificar los nombres exactos en gumroad.com/api.) Dos cuentas = dos tokens.
2. Cloudflare > Workers & Pages > crear el Worker **gumroad-bridge** (NO conectarlo al repo `website`; ver incidente 29-09). Desplegar a mano: `cd gumroad-bridge && npx wrangler deploy`.
3. En ese Worker > Settings > Variables, tipo **Secret**: `GUMROAD_TOKEN_JFC`, `GUMROAD_TOKEN_ESCUELA`, `BRIDGE_KEY` (invéntala larga y aleatoria). Nunca pegarlos en el chat, Notion ni GitHub.
4. Probar: `https://jfcarpio.com/api/gumroad/products.json?store=all` debe listar productos con portadas.
5. Para Claude: `jfcarpio.com` ya es alcanzable desde la nube; con eso basta para ver textos y portadas (`/api/gumroad/img?u=...`). Las ventas (`sales-summary`) requieren `X-Bridge-Key`; darle la clave a Claude solo si JFC lo decide.

## Rutas
- `GET /api/gumroad/products.json?store=jfc|escuela|all` (público, caché 10 min)
- `GET /api/gumroad/img?u=<https imagen Gumroad>` (público, lista blanca de hosts)
- `GET /api/gumroad/sales-summary?store=...` (privado, totales por producto)

## Pruebas y límites
- `node gumroad-bridge/test.mjs` (sin red). No se ha probado contra la API real: los nombres de campo (`short_url`, `thumbnail_url`, `formatted_price`) se leen con alternativas; revisar la primera respuesta real.
- No se probó el desplegado: requiere token y Cloudflare de JFC.
