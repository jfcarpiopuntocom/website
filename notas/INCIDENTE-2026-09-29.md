# Incidente 2026-09-29: la app piso jfcarpio.com

- Causa: el Worker `website` (tag b5420caf0ab54c3d80cf7435871f4e68) quedo conectado en Workers Builds al repo `friendly-123`.
  Un merge a master de friendly-123 (v421, ~07:20 UTC) publico `docs/` de la app sobre el sitio (modificado 07:32 UTC).
- Trampa 1: en Cloudflare, Settings > Build, el boton Disconnect queda cortado en el iPhone. Hay que pedir "Request Desktop Website" (aA en Safari) y girar el telefono.
  Un Disconnect + Connect "sin cambiar nada" vuelve a conectar el repo equivocado.
- Trampa 2: tras conectar `website`, Cloudflare mostro "This project is disconnected from your Git account" y no construyo nada.
  Hay que pulsar el boton rojo Reconnect (tambien cortado) y autorizar la app de GitHub.
- Arreglo (2026-09-29): rollback del Worker a la version 41394e6f (despliegue manual anterior al incidente), conexion a `jfcarpiopuntocom/website` rama `main`, y Reconnect de la cuenta Git.
- Regla: el Worker `website` solo se conecta a `jfcarpiopuntocom/website`, rama `main`. Nunca a friendly-123.
- Verificacion tras un merge en friendly-123: el commit no debe tener el check "Workers Builds: website".
- Esta carpeta `notas/` esta excluida de los assets por `.assetsignore`: no se publica.
- 2026-09-29 ~14:55 UTC: el build de Cloudflare de 490affc (reel vertical, PR #33) fallo sin log visible por el conector.
  `wrangler deploy --dry-run` local con 4.143.0 pasa (1233 archivos de assets). A la misma hora fallo tambien el build de
  friendly-123 sin cambios de codigo: se trata como fallo pasajero de Cloudflare y se reintenta con este commit.
  Si vuelve a fallar: abrir el Build ID en el dashboard (Deployments > View build history) y leer el error.
