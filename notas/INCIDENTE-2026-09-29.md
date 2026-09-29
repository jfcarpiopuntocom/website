# Incidente 2026-09-29: la app piso jfcarpio.com

- Causa: el Worker `website` (tag b5420caf0ab54c3d80cf7435871f4e68) quedo conectado en Workers Builds al repo `friendly-123`.
  Un merge a master de friendly-123 (v421, ~07:20 UTC) publico `docs/` de la app sobre el sitio (modificado 07:32 UTC).
- Trampa: en Cloudflare, Settings > Build, el boton Disconnect queda cortado en el iPhone. Hay que pedir "Request Desktop Website" (aA en Safari) y girar el telefono.
  Un Disconnect + Connect "sin cambiar nada" vuelve a conectar el repo equivocado.
- Arreglo (2026-09-29): JFC desconecto y conecto `website` a `jfcarpiopuntocom/website`, rama `main` (Branch control ya dice main).
  El primer commit se empujo justo al conectar y no construyo; este segundo commit reintenta.
- Regla: el Worker `website` solo se conecta a `jfcarpiopuntocom/website`, rama `main`. Nunca a friendly-123.
- Verificacion tras un merge en friendly-123: el commit no debe tener el check "Workers Builds: website".
- Esta carpeta `notas/` esta excluida de los assets por `.assetsignore`: no se publica.
