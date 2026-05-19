# Handoff · jfcarpio.com White Theme v3 (Audit 2026 aplicado)

## Qué es esto

Reemplazo completo de `index-white-contrast.html` con la estética **Archive / Research Terminal** (Swiss research monograph × broadsheet financiero) y los **10 cambios del audit copywriting & conversion de mayo 2026** aplicados de un solo golpe.

**Todos los textos son los originales tuyos** — los extraje del index.html en vivo que me pasaste (`uploads/index-ac65edea.html`). Yo solo añadí texto NUEVO para los elementos que el audit pide y que no existían (Harvard subtitle, Forum badge, stakes, micro-resultados, Carta del Entorno, escalera GOS, dos rutas diferenciadas).

## Archivos en este bundle

| Archivo | Destino en el repo `jfcarpiopuntocom/website` |
|---|---|
| `index-white-contrast.html` | `index-white-contrast.html` (reemplaza) |
| `network-pacific.webp` | `network-pacific.webp` (ya existe, no tocar si está) |
| `network-intel.webp` | `network-intel.webp` (ya existe, no tocar si está) |
| `fotojfc.webp` | `fotojfc.webp` (ya existe, no tocar si está) |

Las `.webp` se incluyen por seguridad — si ya están en el repo no hace falta volverlas a subir.

## Instrucciones para Claude Code

Branch sugerida: `claude/white-b-v3-audit-2026` (parte de `main`, según CLAUDE.md del repo).

```bash
git checkout main
git pull
git checkout -b claude/white-b-v3-audit-2026

# Respaldo del archivo actual (timestamped, NUNCA eliminar)
cp index-white-contrast.html index-white-contrast.backup-2026-05-19.html

# Sustituye el archivo
cp <ruta-a-este-bundle>/index-white-contrast.html index-white-contrast.html

git add index-white-contrast.html index-white-contrast.backup-2026-05-19.html
git status   # confirma exactamente qué cambia
git commit -m "v2.0 (WHITE B): aesthetic refresh + audit 2026 applied

Estética nueva (Swiss research monograph × broadsheet):
- Cream paper #FDFCF9 + ink #0A0A0A + único acento naranja #D9451F
- Hairline 12-col grid visible
- Mountain (network-pacific.webp) como placa editorial duotone
- Retrato letterpress con sombra dura offset
- Tipografía: Lora + Barlow Condensed + Space Mono (sin cambios)

10 cambios del audit copywriting & conversion (mayo 2026):
- #1 Meta title/OG en español con USP articulado
- #2 'Hay un tipo de empresario que no aparece en los casos de Harvard'
  movido al hero como subtítulo, debajo del H1
- #3 Eliminado testimonio de Esteban F. (fútbol) — solo Juan Pablo Z. y Leonela Loor
- #4 Badge Forum da Liberdade · Porto Alegre · 3.000 asistentes en hero
- #5 Newsletter renombrada 'Carta del Entorno', sin fricción Gumroad
- #6 Diferenciadas dos rutas: A (15 min sin costo) vs B (WhatsApp libre)
- #7 Dos líneas de contexto en el conector antes del bento
- #8 Micro-resultados añadidos a las tres rutas JTBD
- #9 Escalera GOS explicada inline: GROW \$47 / CROSS free / SCALE PRO
- #10 Failure stakes: '60% de las empresas que no superan 3 años...'

Reglas absolutas preservadas:
- .js-rv gate intacto
- data-t bilingüe ES/EN con paridad de keys
- Font-size mínimo .82rem
- Touch targets 44px+
- Colores white theme (background #FFFFFF base, ahora #FDFCF9 cream)

Textos: 100% originales del index en vivo + texto nuevo solo donde el audit lo
exige (Harvard sub, Forum badge, stakes, Carta del Entorno copy, micro-resultados,
GOS ladder, rutas A/B).

https://claude.ai/code/session_[ID]"

git push -u origin claude/white-b-v3-audit-2026
```

Luego abre PR a `main` desde GitHub.

## Cosas que el desarrollador puede querer validar antes de PR

- Abrir el HTML local y confirmar que ES/EN funcionan (`localStorage 'jfc_lang'`).
- Verificar que las 3 imágenes `.webp` cargan (montaña, parallax, retrato).
- Probar las dos rutas del §05 abren WhatsApp con el mensaje correcto.
- Confirmar que el subscribe form de "Carta del Entorno" abre WhatsApp con el email del usuario (placeholder actual — si necesitas un endpoint real, hay que conectar Buttondown/ConvertKit más adelante).
- El `WA_NUMBER` en el script es `593998765432` — verifica que sea el correcto.

## Cosas que NO se tocaron

- `index.html` (dark theme, producción actual)
- `worker.js` / `wrangler.toml`
- Otros HTMLs del repo (`blog/`, `publicaciones/`, etc.)
- Assets `.webp` ya existentes (los del bundle son copias por seguridad)

## Después del merge

El audit deja como siguiente paso natural: aplicar los mismos 10 cambios al `index.html` (dark theme), para que las dos versiones estén alineadas. Eso es trabajo aparte.
