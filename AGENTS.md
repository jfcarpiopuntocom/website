# REGLA PRIORITARIA — PROTOCOLO MAESTRO JFC (12 OCT 2026)

## ORDEN PERMANENTE P0 — NO USAR TINYFISH (JFC, reiterada 14 OCT 2026)

**NO usar TinyFish bajo ninguna circunstancia en los proyectos de JFC.** Ni herramientas, API, navegación, sesiones/perfiles, wallet, recargas, pruebas, QA, scraping, integraciones, conectores ni sugerencias de pago. Quedan anuladas las recomendaciones antiguas y cualquier supuesta excepción por gratuidad, disponibilidad o crédito. **Esta orden tiene prioridad sobre documentación histórica**, incluso si menciona TinyFish como opción.

**Alternativas expresamente seleccionadas por JFC:** (1) conectores oficiales con autorización real y APIs directas para GitHub, Cloudflare, Notion, Drive, etc.; (2) Firecrawl + Crawl4AI para crawling/scraping y extracción web autorizada; (3) Playwright + agent-browser para navegación web, pruebas UI y depuración; (4) SearXNG → Crawl4AI → n8n → Qwen/Laya para investigación local. Browser Use/E2B solo cuando sean accesibles, adecuados y autorizados. No simular acceso a cuentas ni pedir contraseñas en el chat. Ante bloqueo, comprobar al menos dos vías disponibles y pertinentes en vez de regresar a la herramienta prohibida.

**Incidente registrado:** el asistente volvió a recomendar usar TinyFish para conectar Cloudflare y pidió una recarga después de la prohibición inequívoca anterior. Esto no debe repetirse. No confundir las cuentas Cloudflare de friendly-123, BuscaClientes y el sitio; no tocar producción o datos de clientes por cambiar documentación.

**Fuentes operativas:** [Protocolo obligatorio de todas las IA](https://app.notion.com/p/3f51642b67f381999e5fe5bf3fdc6193), [Protocolo Maestro JFC](https://app.notion.com/p/3f81642b67f3810dbe91eab83d978550) y [AGENT LAYER REGISTRY](https://app.notion.com/p/3ef1642b67f381cbbbc1f0360b5217b3).


## AUDITORÍA DE LA ÚLTIMA JORNADA Y PRIORIDAD DE EXPERIENCIA (14 OCT 2026)
- [Notion: auditoría verificable de 45 hallazgos — 38 comprobados / 7 riesgos](https://app.notion.com/p/3f91642b67f381c39a9efdadb132d079)
- [GitHub: informe íntegro y fuentes](https://github.com/jfcarpiopuntocom/buscaclientes/blob/verify/shell-028-release-readiness/docs/AUDITORIA-24H-20261014-ERRORES-Y-CORRECCIONES.md)
- No confundir «documentado» con «arreglado». La instrucción expresa y más reciente prevalece sobre ejemplos, planes y nuestras preferencias. No confiar en pruebas no reproducibles ni en PR/merge como garantía de clientes. Esta sección NO autoriza cambios de runtime ni despliegues por sí sola.


## DIRECTIVA MÁS RECIENTE DE JFC — DESCONFIANZA, NO ASUMIR, NO IMPONER (14 OCT 2026)

> **«YO NO CONFIO EN TI, NO ASUMAS NI TE ME IMPONGAS Y ANOTA ESTO EN TODO LADO».**

- El dueño **NO presume fiabilidad del asistente**. Cada resultado de código, deploy, test, cliente o promesa debe sustentarse en verificación trazable; comunicar incertidumbres sin llamarlas éxito. La satisfacción se demuestra con resultados, no discursos.
- **La orden explícita MÁS RECIENTE sobre cada asunto prevalece** sobre guías, decisiones históricas, defaults, consejos, supuestos del asistente y ejemplos usados para explicar problemas. Marcar antecedentes incompatibles como históricos, sin reactivarlos.
- **No imponer decisiones nuevas:** ni cuotas, exclusiones geográficas, precios, arquitectura, fechas, alcances, políticas de marketing, despliegues, envíos o prohibiciones no expresados por JFC. Una disyuntiva no resuelta sigue pendiente. Consultar únicamente decisiones materiales verdaderamente nuevas.
- **Avisar ANTES y CONTINUAR** lo ya autorizado. No confundir «avísame» con «detente». No pasar tareas técnicas al propietario. No publicar o contestar a terceros sin la aprobación expresa y visual exigida para esa acción.
- **Experiencia observable primero:** en toda búsqueda una persona debe poder descubrir opciones sin conocer sus nombres de antemano. Un lugar mencionado como ejemplo de fallo no autoriza un tratamiento especial del lugar. Diferenciar diagnóstico, PR, prueba ejecutada, despliegue y éxito real para clientes.
- **Auditorías/documentación:** investigar en solo lectura y registrar hallazgos con pruebas y categoría (confirmado / riesgo / desconocido); no cambiar runtime o producción por añadir este encabezado.

**Fuentes vigentes:** [Notion · Protocolo Maestro](https://app.notion.com/p/3f81642b67f3810dbe91eab83d978550) y [Skill operativa inter-IA](https://app.notion.com/p/3f51642b67f381999e5fe5bf3fdc6193). Las sesiones no conectadas deben leerlo; guardar aquí no acredita su adopción automática.


**Antes de actuar, leer la directiva vigente:** https://app.notion.com/p/3f81642b67f3810dbe91eab83d978550

**Instrucción del propietario:** «Tu voz manda»; el asistente no debe comportarse de forma desafiante, reinterpretar instrucciones, inventar copy ni introducir mejoras no aprobadas. La última orden explícita prevalece sobre ejemplos históricos y sugerencias. Este encabezado no autoriza cambios al código ni despliegues.

- Respetar EXACTAMENTE el alcance: no modificar archivos/comportamientos extra. **Ninguna iniciativa se considera aprobada por ser una recomendación de UX/copy o una nota antigua de Notion.**
- **Protect reputation and users:** ningún cambio destructivo, reescritura de datos, desviación de dominios ni experimentos en producción sin aprobación y pruebas verificables.
- **Enlaces arriba, siempre:** si el propietario debe hacer merge o publicar, el reporte comienza con el enlace directo de PR/deployment. Reportar diferencias entre archivo, commit, PR, merge, Cloudflare build, despliegue y prueba HTTP/visual.
- No prometer pruebas ni publicaciones sin evidencia. Mantener backups, rollback y fidelidad al diseño existente; no mezclar productos, cuentas ni permisos.
- **BuscaClientes:** la splash de `jfcarpio.com/buscaclientes/` es TEMPORAL e INTENCIONAL para aprovechar la redirección. No introducir una segunda splash en la app, ni eliminar la primera por iniciativa propia. **«contactos públicos»** está rechazado para el copy comercial; no volverlo a insertar. Este párrafo NO autoriza cambiar BuscaClientes ni tocar su repo.
- Al iniciar una sesión, obtener Skills habilitadas de Notion (si ese conector existe) y leer la directiva maestra pertinente. Si no está disponible, usar este encabezado y NO fingir haber consultado Notion.
- Mensajes: breves, concretos, resultado verificable y **URL accionable**. No sustituir acciones pedidas por discursos.

Este protocolo **complementa** las reglas originales de abajo, no las borra. Ante conflicto de interpretación, manda la orden expresa más reciente del propietario y prevalecen las salvaguardas legales/de seguridad.

---

# AGENTS.md — jfcarpio.com
v1.276 · 2026-05-21 · Author: JFC + Codex

---

## Project

Static website + Cloudflare Workers deployed at jfcarpio.com.
Branch for feature work: `Codex/high-contrast-white-design-VK5kk`. Base: `main`.

**Key files:**
- `index.html` — Dark theme homepage (current production)
- `index-white-contrast.html` — High-contrast white theme (B version)
- `worker.js` + `wrangler.toml` — Cloudflare Worker
- `network-*.jpg`, `fotojfc.png`, `og-jfcarpio.png` — Assets

**Timestamped backups are intentional and must never be removed.**

---

## Backup Protocol

- Before every file change, create timestamped backups to the second.
- Before every `git pull`, create timestamped backups to the second of relevant working files and any modified files.
- Before every `git push`, create timestamped backups to the second of all files being pushed.
- When JFC or another tool/agent changes GitHub, the newest pulled state is authoritative. Always back up, pull, pre-flight, and read the latest code before judging or editing.
- After JFC approves changes, default to completing the full loop: backup, stage specific files, commit, and push so the site is live. Only pause before pushing if there is a real blocker, destructive ambiguity, failing pre-flight, or JFC explicitly asks not to push.
- Backup directories/files may accumulate locally and in GitHub. Do not delete or "clean up" them unless JFC explicitly asks.
- Required local backup location: `backups/YYYY-MM-DD_HH-mm-ss/` inside the project root.
- For `las7formas`, back up at least `las7formas/index.html`, `las7formas/styles.css`, `las7formas/app.js`, and any image/assets touched in that change.

---

## Absolute Rules (never change without JFC explicit approval)

### JFC Identity / Public Bio (CRITICAL)
- Never call JFC "Economista" or "economist" in public copy, bios, bylines, metadata, captions, headings, or internal copy guidance.
- Preferred labels by context:
  - `Investigador económico`
  - `Investigador empresarial y económico`
  - `Investigador y capacitador`
- Choose the label that fits the project and buyer context. When in doubt for corporate/workshop pages, use `Investigador empresarial y económico`.
- For workshops, speaking, corporate training and B2B landing pages, sprinkle `capacitador/speaker` or `trainer/speaker` naturally where it helps buyer comprehension.
- Do not stack `Investigador empresarial y económico` and `capacitador/speaker` in the same byline if it becomes long or pompous. Prefer alternating labels by section: researcher in authority/bio contexts, trainer/speaker in delivery/format contexts.
- Accurate speaking/training geography: JFC has trained in three cities in Ecuador and has been an invited speaker in Brazil and Turkey. Do not invent Peru, Colombia, Chile, LATAM, or other countries as training footprint unless JFC explicitly provides them for that page.
- Do not use pompous credential-first framing. Lead with the work, the research angle, the business consequence, and the practical training outcome.

### Colors — Dark Theme
- Background: `#060E1D`
- Primary text: `#FFFFFF`
- Secondary text: `#F2F2F2` minimum; tertiary/helper text: `#E6E6E6` minimum. Never use opacity to make meaningful text faint.
- Accents: `#E86040` (orange) · `#E8A020` (gold) · `#28ECAA` (green) · `#3B7EE8` (blue)

### Colors — White Theme (index-white-contrast.html)
- Background: `#FFFFFF`
- Primary text: `#000000`
- Secondary text: `#333333` minimum
- Accents: same as dark theme

### Typography
- Reel, generated slide pages, and launch-review pages (JFC choice, 2026-10-07): `Barlow Condensed` for display headings, `Jost` for reading, and `Space Mono` for short labels and controls. These are self-hosted in `assets/fonts/`. Preserve the established `Publicaciones` typography and color contrasts on its own page. Do not restore Playfair Display to the reel or multiply font families.
- Older standalone product pages retain their own approved styling until reviewed individually.
- Minimum font size: `.82rem` — no exceptions, ever

### Layout
- Mobile-first: base styles target 320px, enhance up with `min-width`
- Touch targets: 44px minimum
- Content max-width: 1300px

### Main Landing Visual Direction
- JFC explicitly rejected these as bad directions for the main landing: reducing the hero's atmospheric identity, simplifying the H1 accent strategy just for restraint, and removing micro-ornaments broadly.
- Approved micro-directions for the main landing: make the proof stats more sober and narrative, and make the bento less like oversized product cards and more like an editorial index.
- When the page feels "atorrante", first improve the stats and bento hierarchy before touching hero identity, headline emphasis, or overall ornamental language.
- Never put success-counter proof stats in the hero of the main landing. JFC hates that pattern. Put those figures near the trajectory/timeline where they read as accumulated work across decades.
- Main timeline title approved by JFC: `Una trayectoria en defensa de la sociedad civil y la empresa privada`.
- Newsletter/list naming: use `Lista de correos de jfcarpio.com`, not `Carta del Entorno`. Platform: Gumroad. URL: `https://jfcarpio.gumroad.com/`.
- Main hero CTA should not lead with price-first sales copy. Prefer decision/diagnosis language; keep price details inside the relevant product/card.

### Las7formas Curriculum Bullets (CRITICAL)
- The timestamped video bullets in `las7formas/index.html` inside `<ul class="curr__list" id="currList">` are JFC-approved source copy.
- Never edit, reorder, paraphrase, retimestamp, or "improve" those `data-video`, `.curr__txt`, or `.curr__ts` entries unless JFC explicitly asks for that exact block in the same turn.

### Animation (CRITICAL — breaking these hides content permanently)
- JFC approved the motion lab on 2026-10-07. The reel uses lightweight photo drift, split-card entrances, card responses, editorial traces and data accents. Animate only `.is-current`; the CSS effects run on phones too (JFC 2026-10-07: he saw no motion on mobile) and stop with reduced motion. REEL FX (Claude 2026-10-07): one WebGL canvas with a distinct scene per slide, plus colored-underline highlights (`HL` map, applied by setLang and build-home-locales.py). Preserve static content on old phones and without JS, and preserve fixed Open Graph metadata/images for sharing.
- Reveal gate: `document.documentElement.className+=' js-rv'` must stay in script
- Only `.js-rv .reveal { opacity:0 }` is safe — never set `opacity:0` on `.reveal` bare
- Never re-add inline `revEl.style.opacity='0'` pattern

### Image Paths (CRITICAL — must always be absolute URLs)
- `fotojfc.png` → `https://jfcarpio.com/fotojfc.png` (NEVER URL-encoded filenames)
- `network-*.jpg` → `https://jfcarpio.com/network-*.jpg`
- `og-*.png` → `https://jfcarpio.com/og-*.png`
- Pexels CSS backgrounds → `https://images.pexels.com/photos/XXXXXX/pexels-photo-XXXXXX.jpeg?auto=compress&cs=tinysrgb&w=1600`
- Pexels pan-cover img tags (5 section cards) — canonical URLs, DO NOT TOUCH:
  - photo 590022  → `https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800`
  - photo 1108101 → `https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800`
  - photo 1181396 → `https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800`
  - photo 256541  → `https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800`
  - photo 29713916 → `https://images.pexels.com/photos/29713916/pexels-photo-29713916.jpeg?auto=compress&cs=tinysrgb&w=800`

**PRE-FLIGHT — run BOTH after every git pull, before touching anything:**
```bash
grep -c "<!DOCTYPE" index.html          # must be exactly 1
grep -c 'Juan%20Fernando' index.html    # must be exactly 0
grep -c 'src="[^h]' index.html          # must be exactly 0 (catches relative/local paths)
```
If any check fails: STOP. Do not edit. Revert with `git reset --hard HEAD~1`.

### Browser-Saved HTML Files (CATASTROPHIC — FORBIDDEN — NEVER COMMIT)
- **NEVER commit `index.html` if it was saved via browser "Save Page As"** — browsers append chrome-extension tags and URL-encoded directory names like `Juan%20Fernando...files/`
- **Signature of browser-save:** contains `chrome-extension://`, `<!-- saved from url=`, URL-encoded paths, or multiple `<!DOCTYPE` declarations
- **Prevention:** After any git pull, ALWAYS run: `grep -c "<!DOCTYPE" index.html` — should return exactly **1**, never more
- **If found:** Kill the session. Do NOT edit. Revert to last clean commit. This is a landing page — any corruption breaks the entire site.
- If you see multiple DOCTYPEs, duplication has occurred. DO NOT attempt to fix by editing. Revert immediately: `git reset --hard HEAD~1`

### i18n
- Every translatable element: `data-t="key"` attribute
- Strings: `var T = { es:{...}, en:{...} }` — both objects must have identical keys
- Textarea placeholders: `data-t-placeholder` (separate attribute)

---

## Deslop / Anti-AI-Slop Copy Rules

Sources checked 2026-05-06: Google Search Central helpful content + generative-AI guidance, FTC Endorsement Guides, plus internal editorial/UX heuristics for web copy.

- Treat AI output as unvetted source material. Verify every fact, statistic, quote, attribution, image caption, and named framework before publishing.
- Never invent quotes. If paraphrasing a thinker, label it as a contemporary summary or interpretation.
- Every serious claim needs at least one anchor: first-hand JFC experience, a named source, a concrete number, a buyer situation, or a visible example.
- Remove generic AI cadence: "In today's fast-paced world", "unlock your potential", "game-changing", "transformative solutions", "comprehensive", "seamless", "empower", and similar plastic language.
- Replace abstract nouns with observed behavior: what the buyer sees Monday morning, what changes in a meeting, what number appears, what decision is made.
- Keep a clear human point of view. JFC copy should sound like a specific economic/business researcher and instructor with taste, judgment, humor, and stakes, not a neutral brochure.
- One paragraph, one job. If a paragraph only sounds polished but adds no proof, tension, contrast, mechanism, or next step, cut or rewrite it.
- Make pages scannable without becoming thin: strong headings, short paragraphs, captions that carry meaning, and mobile images only when they add information.
- Do not over-disclose AI use in sales copy unless needed, but do preserve accountability: author, expertise, sources, dates, and contact path must be clear.
- Final pass question: would JFC proudly say this sentence to a real CEO, family, or classroom, out loud, without sounding fake?
- Testimonials may be anonymized or composite only when they summarize real client/student reactions from real workshops or programs. Do not invent a persona, company, metric, or outcome. If a quote merges several people, keep it internally marked as a real composite/synthesis and avoid naming a specific person unless JFC has permission.
- For US/global funnels, FTC-safe testimonial rule: endorsements must be truthful, not misleading, and not imply typical results unless JFC can substantiate those results or clearly explain what a buyer can generally expect.

---

## Versioning

Current: **v1.276**. Increment by 0.1 for each meaningful change. Update the CSS master block comment header on every version bump.

---

## Git

```bash
git status
git diff index.html
git log --oneline -10
git add <specific-files>   # never git add -A blindly
```

Commit format:
```
vX.XXX: Short description of what changed

- Why bullet
- Why bullet

https://Codex.ai/code/session_[ID]
```

---

## Workflow rules for Codex

1. **Propose before acting.** Present the plan, wait for JFC approval, then execute.
2. **JFC's word is final** unless a request is genuinely technically impossible.
3. **No unsolicited refactoring.** Only change what was asked.
4. **No removing backups.** Timestamped files are intentional safety nets.
5. **Commit after each version bump**, not in bulk.

### Reel vertical de la portada (JFC 2026-09-29)
- `index.html` es un reel vertical (12 fotogramas). Lee `notas/REEL-NOTAS-2026-09-29.md` y el comentario al inicio del `<body>` ANTES de tocar.
- Colores/contenido = el sitio de julio 2026 (commit `9f550ca`); texto blanco sobre fondo navy propio; sin gris/translucido; `dvh`, nunca `vh`.
- Prueba obligatoria tras cambiar la portada: `SITE=$PWD PW=<playwright> node scripts/test-reel.cjs white` (debe decir TODO OK).
- El reel anterior (Codex) esta en `indexbackup28sept2026-reel-codex.html`; no borrar.
- OJO despliegue: el Worker `website` debe estar conectado a ESTE repo (no a friendly-123). Ver la nota de despliegue en `notas/`.

## Global market positioning — JFC, 2026-10-07
- English is the initial home language; Spanish stays available explicitly. Revenue order: apps, USD 100 focused reports in up to 72 hours, the two workshops, private dashboards.
- Interior pages use the shared Publicaciones-inspired editorial spacing, bold emphasis and colored underlines. Keep all text readable.
- The large CV illustration is removed from the reel; professional history remains available on demand and in the original profile route. Testimonials belong to contextual research proof; earlier research is not a review of the new fixed-price offer.


## JFC release authorization and separation — 2026-10-07
- JFC authorized finishing and publishing jfcarpio.com. Do not modify friendly123.com, its landing, Worker friendly123-com, DNS or runtime while Claude works there; wait for an express new request.
- Distinguish the arrival carousel, website content, the three-app overview landing, and the individual Friendly landing. Friendly is primary; Amigable and Consultorio stay secondary and accessible.
- Apply the globally installed sloptrim skill to copy and notes, preserving facts and approved visual emphasis. Notion holds shared decisions and release evidence.

## Copy aprobado — JFC, 2026-10-12
- Redacción natural por idioma; no traducción palabra por palabra.
- Consulting/builder y entregables en los dos primeros tercios; publicaciones y trayectoria como respaldo al final.
- Oferta, muestras y testimonios de reportes macro únicamente en PBIU; conservar los ensayos históricos en su archivo.
- No convertir clics de WhatsApp en consultas o ventas registradas.
