# Despliegue del reel de JFCarpio.com

- 2026-09-28 (Ecuador): `index.html` integra un reel editorial de ocho capítulos, con libro y Gumroad, conservando el sitio completo y su paleta.
- Código publicado en `main` desde el commit `0a7f1282a5f0c1b991d959b21945d0f133fac1c2`.
- Worker existente: `website`, configuración raíz `wrangler.toml`, deploy `npx wrangler deploy`. La cuenta de Git se reconectó en Cloudflare Builds.
- Este archivo es una nota interna excluida de assets por `.assetsignore` (`notas/`). Su commit dispara el build tras la reconexión.
- Verificación requerida: la portada de `https://jfcarpio.com/` debe contener `id="reel"`, el libro y el capítulo Gumroad.
