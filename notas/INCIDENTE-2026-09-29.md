# Incidente 2026-09-29: la app piso jfcarpio.com

- Causa: el Worker `website` (tag b5420caf0ab54c3d80cf7435871f4e68) quedo conectado en Workers Builds al repo `friendly-123`.
  Un merge a master de friendly-123 (v421, ~07:20 UTC) publico `docs/` de la app sobre el sitio (modificado 07:32 UTC).
- Arreglo (2026-09-29): JFC desconecto y reconecto Builds en Cloudflare (Workers & Pages > website > Settings > Build).
  Este commit dispara el build para publicar el sitio correcto desde `main`.
- Regla: el Worker `website` solo se conecta a `jfcarpiopuntocom/website`, rama `main`. Nunca a friendly-123.
- Verificacion tras un merge en friendly-123: el commit no debe tener el check "Workers Builds: website".
- Esta carpeta `notas/` esta excluida de los assets por `.assetsignore`: no se publica.
