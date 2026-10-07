#!/usr/bin/env python3
"""
Genera una pagina HTML propia por cada fotograma del reel, en ESPANOL y en INGLES (mercado mundial),
a partir de index.html. Uso:  python3 scripts/build-slide-pages.py   y luego   node scripts/build-og.cjs

- Lee index.html (fuente unica de verdad: textos ES y EN del diccionario T).
- ES: /<slug>/index.html      EN: /en/<slug-en>/index.html      (+ indice de los contrastes en ambos idiomas)
- Cada pagina: titulo, descripcion, canonical, hreflang es/en/x-default, imagen propia al compartir
  (og/<clave>-<lang>.png, la dibuja scripts/build-og.cjs desde og/manifest.json), JSON-LD
  (WebPage + BreadcrumbList + ProfessionalService con direccion en Cuenca; FAQPage en visores).
- Actualiza sitemap.xml (bloque SLIDE-PAGES) y la lista de enlaces del indice de index.html (PAGES-START/END).
- slide-page.css es ahora un archivo fuente normal (ya no se genera aqui).
- NO toca las paginas hechas a mano: /talleres/, /publicaciones/, /juan-fernando-carpio/.
Volver a correr ambos scripts cada vez que cambie el texto de un fotograma. (JFC 2026-09-30)
REGLAS: nunca "economista"; marca JFCarpio.com en voz de equipo; texto minimo .82rem; imagenes con URL absoluta.
"""
import re, json, html, os
from report_offer import report_body, report_schema
from apps_video import apps_video
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://jfcarpio.com"
DATE = "2026-10-07"
WA = "https://wa.me/593999905080"
ADDR = "General Torres #14, Cuenca, Ecuador"

# id del fotograma -> (ruta ES, ruta EN, nombre ES, nombre EN)
HUB = {"es": ("historia-de-dos-negocios", "Dos tipos de creadores"), "en": ("en/tale-of-two-businesses", "There are two kinds of businesses")}
PAGES = {
    "c1": ("historia-de-dos-negocios/dos-maneras-de-operar", "en/tale-of-two-businesses/two-ways-to-operate", "Contraste 1 · Ver antes de que duela", "Contrast 1 · See before it hurts"),
    "apps": ("apps", "en/apps", "Apps", "Apps"),
    "c4": ("historia-de-dos-negocios/la-informacion-sola-no-basta", "en/tale-of-two-businesses/information-alone-is-not-enough", "Contraste 3 · Crear lenguaje común", "Contrast 3 · Build shared language"),
    "articulos": ("articulos", "en/articles", "Artículos", "Articles"),
    "libro": ("libro", "en/book", "Libro", "Book"),
    "c5": ("historia-de-dos-negocios/lo-que-pasa-afuera", "en/tale-of-two-businesses/what-happens-outside", "Contraste 2 · Leer el entorno", "Contrast 2 · Read the environment"),
    "reportes": ("reportes", "en/reports", "Reportes", "Reports"),
    "trayectoria": ("trayectoria", "en/track-record", "Trayectoria", "Track record"),
    "c8": ("historia-de-dos-negocios/datos-no-es-ver", "en/tale-of-two-businesses/data-is-not-seeing", "Contraste 4 · Ver a tiempo", "Contrast 4 · See in time"),
    "visores": ("visores", "en/business-viewers", "Visores", "Business viewers"),
    "gumroad": ("tienda-gumroad", "en/gumroad-store", "Tienda Gumroad", "Gumroad store"),
    "escuela": ("la-escuela-del-dinero", "en/money-school", "La Escuela del Dinero", "La Escuela del Dinero (Money School)"),
    "gratis": ("recursos-gratuitos", "en/free-resources", "Recursos gratuitos", "Free resources"),
    "clientes": ("clientes", "en/clients", "Clientes", "Clients"),
    "c9": ("historia-de-dos-negocios/la-decision", "en/tale-of-two-businesses/the-decision", "Contraste 5 · La elección", "Contrast 5 · The choice"),
    "contacto": ("contacto", "en/contact", "Contacto", "Contact"),
}
EXISTING = {"talleres": "/talleres/", "publicaciones": "/publicaciones/", "perfil": "/juan-fernando-carpio/"}

UI = {
    "es": {"reel": "Ver en el reel interactivo →", "home": "Inicio", "nav": "Siguiente y anterior", "other": "English", "blog": "Blog",
           "talleres": "Talleres", "pubs": "Publicaciones", "contact": "Contacto", "wa": "Escríbenos por WhatsApp", "faq": "Preguntas frecuentes",
           "quote": "Lo que dicen clientes reales", "start": "Ver la diferencia", "loc": "es_EC",
           "hub_h1": "HAY DOS TIPOS DE CREADORES DE NEGOCIOS.", "hub_lead": "Los que se enteran después (con dolores y hasta quiebras). Y los que encuentran maneras de ver con claridad mucho antes.",
           "hub_desc": "HAY DOS TIPOS DE CREADORES DE NEGOCIOS. Cinco contrastes para ver antes, decidir con claridad y dirigir mejor con herramientas, talleres y reportes.",
           "idx_h": "Cada sección tiene su propia página"},
    "en": {"reel": "See it in the interactive reel →", "home": "Home", "nav": "Next and previous", "other": "Español", "blog": "Blog (ES)",
           "talleres": "Workshops", "pubs": "Publications (ES)", "contact": "Contact", "wa": "Message us on WhatsApp", "faq": "Frequently asked questions",
           "quote": "What real clients say", "start": "See the difference", "loc": "en_US",
           "hub_h1": "THERE ARE TWO KINDS OF BUSINESSES.", "hub_lead": "Those who find out later, through pain and sometimes even failure. And those who find ways to see clearly much earlier.",
           "hub_desc": "THERE ARE TWO KINDS OF BUSINESSES. Five contrasts for seeing earlier, deciding clearly and leading better with tools, workshops and reports.",
           "idx_h": "Each section has its own page"},
}

# Preguntas frecuentes (solo hechos confirmados por JFC): se muestran en la pagina Y van como FAQPage.
FAQ = {
    "visores": {
        "es": [("¿Los visores son gratuitos?", "Sí. El Visor Gerencial (tablero de Marketing) y el Visor Antiquiebra son gratuitos y sin registro."),
               ("¿Qué áreas cubre el Visor Gerencial?", "Hoy está disponible Marketing, con calculadoras en vivo de CAC, LTV y ROI. Ventas, Finanzas, Operaciones, RRHH, Logística y TI llegan próximamente."),
               ("¿Con qué países me compara?", "Con benchmarks de Ecuador, Colombia, Perú y Chile."),
               ("¿Qué me evita el Visor Antiquiebra?", "Descubrir tarde que el negocio solo aguanta. Está hecho para atravesar el Valle de la Muerte (meses 6 a 24): ocho indicadores, las 3 Cs y semáforo de riesgo en 15 minutos semanales."),
               ("¿Qué pasa si necesito más que el diagnóstico?", "Al final puedes pasar al Kit (USD 97) o a una sesión de revisión con el equipo de JFCarpio.com (USD 197).")],
        "en": [("Are the viewers free?", "Yes. The Management Viewer (Marketing dashboard) and the Anti-bankruptcy Viewer are free, with no sign-up."),
               ("Which areas does the Management Viewer cover?", "Marketing is live today, with live CAC, LTV and ROI calculators. Sales, Finance, Operations, HR, Logistics and IT are coming soon."),
               ("Which countries does it compare me with?", "With benchmarks for Ecuador, Colombia, Peru and Chile."),
               ("What does the Anti-bankruptcy Viewer save me from?", "Finding out too late that the business is only holding on. It is built to cross the Valley of Death (months 6 to 24): eight indicators, the 3 Cs and a risk traffic light in 15 minutes a week."),
               ("What if I need more than the diagnosis?", "At the end you can move on to the Kit (USD 97) or a review session with the JFCarpio.com team (USD 197).")],
    }
}
# Testimonios reales (textos literales de la slide Clientes); se muestran en las paginas de estos capitulos.
QUOTES = {} # Proof is contextualized on reports and the earlier-work archive.


class N:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    def cls(self):
        return self.attrs.get("class", "").split()

    def text(self):
        return "".join(k if isinstance(k, str) else k.text() for k in self.kids)

    def walk(self):
        yield self
        for k in self.kids:
            if not isinstance(k, str):
                yield from k.walk()


VOID = {"img", "br", "meta", "link", "input", "hr", "source", "path", "circle"}


class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = N("root", []); self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = N(tag, attrs, self.cur); self.cur.kids.append(n)
        if tag not in VOID: self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(N(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        c = self.cur
        while c is not None and c.tag != tag: c = c.parent
        if c is not None and c.parent is not None: self.cur = c.parent

    def handle_data(self, d):
        self.cur.kids.append(d)


def parse(fragment):
    p = P(); p.feed(fragment); return p.root


def find(n, tag=None, cls=None):
    for x in n.walk():
        if x is n: continue
        if tag and x.tag != tag: continue
        if cls and cls not in x.cls(): continue
        return x
    return None


def find_all(n, tag=None, cls=None):
    return [x for x in n.walk() if x is not n and (not tag or x.tag == tag) and (not cls or cls in x.cls())]


def esc(t):
    return html.escape(t or "")


def slug(sid, lang):
    return PAGES[sid][0] if lang == "es" else PAGES[sid][1]


def name(sid, lang):
    return PAGES[sid][2] if lang == "es" else PAGES[sid][3]


def ogfile(key, lang):
    return f"og/{key}-{lang}.png"


def main():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    TT = json.loads(re.search(r"const T=(\{.*?\});\n", src, re.S).group(1))
    secs = {}
    for m in re.finditer(r'<section class="slide[^"]*" id="([a-z0-9]+)"[^>]*>.*?</section>', src, re.S):
        secs[m.group(1)] = parse(m.group(0))
    archive = re.search(r'<template id="research-archive">(.*?)</template>', src, re.S)
    if archive: secs["clientes"] = parse(archive.group(1))
    page_list = [sid for sid in secs if sid in PAGES]
    manifest = []
    sitemap_urls = []

    for lang in ("es", "en"):
        T = TT[lang]; U = UI[lang]; other = "en" if lang == "es" else "es"
        home = SITE + ("/es/" if lang == "es" else "/")

        def tx(n):
            k = n.attrs.get("data-t")
            if k and k in T: return T[k].strip()
            inner = [x for x in n.walk() if x is not n and x.attrs.get("data-t") in T]
            if inner and not n.text().strip():
                return inner[0].text().strip()
            if inner and len(inner) == 1 and inner[0].text().strip() == n.text().strip():
                return T[inner[0].attrs["data-t"]].strip()
            return re.sub(r"\s+", " ", n.text()).strip()

        def href_to_page(h):
            if h.startswith("#"):
                sid = h[1:]
                if sid in PAGES: return "/" + slug(sid, lang) + "/"
                if sid in EXISTING: return EXISTING[sid]
                return SITE + "/#" + sid
            return h

        def head(title, desc, canon, alt_es, alt_en, og, ld):
            return HEAD_TPL.format(lang=lang, title=esc(title), desc=esc(desc), canon=canon, alt_es=alt_es, alt_en=alt_en,
                                   og=og, loc=U["loc"], ld=json.dumps(ld, ensure_ascii=False))

        def org():
            return {"@type": "ProfessionalService", "@id": SITE + "/#organization", "name": "JFCarpio.com", "url": SITE + "/",
                    "telephone": "+593999905080", "image": SITE + "/og-jfcarpio-v2.png",
                    "address": {"@type": "PostalAddress", "streetAddress": "General Torres #14", "addressLocality": "Cuenca", "addressCountry": "EC"},
                    "areaServed": "Worldwide"}

        def chrome(reel, alt_url, body, nav=""):
            ft = (f'<footer class="ft"><nav><a href="{home}">{U["home"]}</a> · <a href="/{HUB[lang][0]}/">{esc(HUB[lang][1])}</a> · '
                  f'<a href="/blog/">{U["blog"]}</a> · <a href="{"/talleres/" if lang == "es" else "/workshops/"}">{U["talleres"]}</a> · <a href="/publicaciones/">{U["pubs"]}</a> · '
                  f'<a href="/{slug("contacto", lang)}/">{U["contact"]}</a>' + (' · <a href="/market-intelligence-latam/">Latin America Market Intelligence</a> · <a href="/pacific-basin/">Pacific Basin Intelligence Unit</a>' if lang == "en" else "") + '</nav>'
                  f'<p class="loc"><a class="wa" href="{WA}" rel="noopener">{U["wa"]}</a> · <span>{ADDR}</span></p>'
                  f'<p>© 2026 JFCarpio.com</p></footer>')
            hd = (f'<header class="hd"><a class="brand" href="{home}">JFCarpio.com</a><span class="hr">'
                  f'<a class="lang" href="{alt_url}" hreflang="{other}" lang="{other}">{U["other"]}</a>'
                  f'<a class="reel" href="{reel}">{U["reel"]}</a></span></header>')
            return hd + "\n<main>\n" + body + "\n</main>\n" + nav + "\n" + ft

        def write(path, content):
            d = os.path.join(ROOT, path); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(content)

        for i, sid in enumerate(page_list):
            root = secs[sid]
            sl, short = slug(sid, lang), name(sid, lang)
            h2 = find(root, "h2") or find(root, "h1")
            title_h = tx(h2) if h2 else short
            kick = find(root, cls="kick"); kick_t = tx(kick) if kick else short
            leads = [tx(x) for x in find_all(root, "p", "lead") if tx(x)]
            desc = re.sub(r"\s+", " ", leads[0] if leads else title_h)
            if len(desc) > 158: desc = desc[:155].rsplit(" ", 1)[0] + "…"
            title = f"{title_h.rstrip('.')} | JFCarpio.com"
            if len(title) > 68: title = f"{short} | JFCarpio.com"
            canon = f"{SITE}/{sl}/"
            alt_es, alt_en = f"{SITE}/{slug(sid, 'es')}/", f"{SITE}/{slug(sid, 'en')}/"
            # Narrative pages temporarily use the stable site OG card so the retired
            # "Historia de dos negocios" artwork can never leak back into shares.
            narrative_ids = {"c1", "c4", "c5", "c8", "c9"}
            if sid in narrative_ids:
                og = f"{SITE}/og-jfcarpio-v2.png"
            else:
                og = f"{SITE}/{ogfile(sid, lang)}"
                share_kick = ("USD 100 · Up to 72 hours" if lang == "en" else "USD 100 · Hasta 72 horas") if sid == "reportes" else kick_t
                manifest.append({"file": ogfile(sid, lang), "kick": share_kick, "title": title_h, "lang": lang})
            prv = page_list[i - 1] if i > 0 else None
            nxt = page_list[i + 1] if i < len(page_list) - 1 else None

            body = [f'<p class="kick">{esc(kick_t)}</p>', f"<h1>{esc(title_h)}</h1>"]
            body += [f'<p class="lead">{esc(t)}</p>' for t in leads]
            rr = find(root, cls="rr")
            if rr:
                body.append('<ul class="tiles">')
                for ri in find_all(rr, cls="ri"):
                    b = find(ri, "b"); sp = find(ri, "span")
                    inner = f"<h2>{esc(tx(b) if b else '')}</h2><p>{esc(tx(sp) if sp else '')}</p>"
                    h = ri.attrs.get("href")
                    if h: inner = f'<a href="{esc(href_to_page(h))}">{inner}</a>'
                    body.append(f"<li>{inner}</li>")
                body.append("</ul>")
            for ab in find_all(root, cls="ab"):
                if "panel" in (ab.parent.cls() if ab.parent else []): continue
                ps = find_all(ab, "p")
                if ps:
                    body.append('<div class="pair">')
                    for p in ps:
                        b = find(p, "b"); hd_ = tx(b) if b else ""
                        spn = find(p, "span")
                        txt = tx(spn) if spn else re.sub(r"\s+", " ", p.text()).strip()
                        body.append(f'<p class="{"a" if "pa" in p.cls() else "b"}"><strong>{esc(hd_)}</strong> {esc(txt)}</p>')
                    body.append("</div>")
            if sid in QUOTES:
                q, a = QUOTES[sid]
                body.append(f'<figure class="quote"><figcaption class="ql">{U["quote"]}</figcaption><blockquote>{esc(T[q])}</blockquote><p class="qa">{esc(T[a])}</p></figure>')
            bl = find(root, cls="bl")
            btns = []
            if bl:
                for a in find_all(bl, "a"):
                    h = a.attrs.get("href")
                    if not h: continue
                    ext = h.startswith("http") and "jfcarpio.com" not in h
                    btns.append(f'<a class="btn{" p" if "p" in a.cls() else ""}" href="{esc(href_to_page(h))}"' + (' rel="noopener"' if ext else "") + f">{esc(tx(a))}</a>")
            if btns: body.append('<p class="cta">' + " ".join(btns) + "</p>")
            panel = find(root, cls="panel")
            if panel:
                for ch in panel.kids:
                    if not isinstance(ch, N): continue
                    if ch.tag == "h3": body.append(f"<h2>{esc(tx(ch))}</h2>")
                    elif ch.tag == "p" and tx(ch): body.append(f"<p>{esc(tx(ch))}</p>")
                    elif "gd" in ch.cls():
                        body.append('<div class="cards apps-fleet">' if sid == 'apps' else '<div class="cards">')
                        for cd in find_all(ch, cls="cd"):
                            b = find(cd, "b"); tg = find(cd, cls="tg"); pr = find(cd, cls="pr")
                            ps = [p for p in find_all(cd, "p") if "pr" not in p.cls()]
                            a = find(cd, "a")
                            c = '<div class="card">'
                            if tg: c += f'<span class="tag">{esc(tx(tg))}</span>'
                            if b: c += f"<h3>{esc(tx(b))}</h3>"
                            for p in ps: c += f"<p>{esc(tx(p))}</p>"
                            if pr: c += f'<p class="price">{esc(tx(pr))}</p>'
                            if a and a.attrs.get("href"):
                                c += f'<a class="btn" href="{esc(href_to_page(a.attrs["href"]))}" rel="noopener">{esc(tx(a))}</a>'
                            body.append(c + "</div>")
                        body.append("</div>")
            if sid == "apps":
                body.append(apps_video(lang))
                if lang == "es":
                    body.append('<section class="launch-offer" aria-labelledby="launch-offer-title"><p class="kick">Servicio pagado</p><h2 id="launch-offer-title">¿Vas a lanzar un producto hecho con vibecoding?</h2><p>Revisamos la experiencia, la presencia en buscadores y lo que ocurre cuando algo falla. Incluye móvil, metadatos, página 404, estados de carga, contacto y los demás detalles que una demo no muestra.</p><a class="btn" href="/revision-de-lanzamiento/">Ver la revisión de lanzamiento</a></section>')
                else:
                    body.append('<section class="launch-offer" aria-labelledby="launch-offer-title"><p class="kick">Paid service</p><h2 id="launch-offer-title">Launching a product built with vibe coding?</h2><p>We check the customer experience, search visibility and what happens when something fails. That includes mobile, metadata, a 404 page, loading states, contact paths and the details a demo can miss.</p><a class="btn" href="/en/launch-review/">See the launch review</a></section>')
            if sid == "reportes":
                body = report_body(lang, body)
                title = ("USD 100 Business Reports in 72 Hours" if lang == "en" else "Reportes empresariales de USD 100 en 72 horas") + " | JFCarpio.com"
                desc = ("One business question, a questionnaire, a 10-minute online interview and a focused written report within 72 hours. USD 100. English and Spanish." if lang == "en" else "Una pregunta empresarial, un cuestionario, una entrevista online de 10 minutos y un reporte escrito en hasta 72 horas. USD 100. Inglés y español.")
            if sid == "visores":
                if lang == "en":
                    body.append('<section class="accent-blue"><h2>A dashboard built around your business</h2><p>The free Antiquiebra and Gerencial tools show how we turn <strong>scattered data into useful decisions</strong>. Marketing is available now; the other executive areas are being developed.</p><p>For private clients, we can design a dashboard around the question, indicators and workflow that matter to their business. Scope and price are agreed for each project. Work is online, in English or Spanish.</p><a class="btn" href="/en/contact/">Discuss a custom dashboard</a></section>')
                else:
                    body.append('<section class="accent-blue"><h2>Un dashboard construido para tu negocio</h2><p>Las herramientas gratuitas Antiquiebra y Gerencial muestran cómo convertimos <strong>datos dispersos en decisiones útiles</strong>. Marketing ya está disponible; las demás áreas ejecutivas están en desarrollo.</p><p>Para clientes privados, podemos diseñar un dashboard alrededor de la pregunta, los indicadores y el proceso que importan en su negocio. El alcance y el precio se acuerdan por proyecto. Trabajamos online en inglés o español.</p><a class="btn" href="/contacto/">Conversemos sobre tu dashboard</a></section>')
            graph = [
                {"@type": "WebPage", "@id": canon + "#page", "url": canon, "name": title, "description": desc, "inLanguage": lang,
                 "isPartOf": {"@type": "WebSite", "name": "JFCarpio.com", "url": SITE + "/"}, "primaryImageOfPage": og,
                 "publisher": {"@id": SITE + "/#organization"}},
                {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": U["home"], "item": home}]
                 + ([{"@type": "ListItem", "position": 2, "name": HUB[lang][1], "item": f"{SITE}/{HUB[lang][0]}/"},
                     {"@type": "ListItem", "position": 3, "name": short, "item": canon}] if sl.startswith(HUB[lang][0] + "/")
                    else [{"@type": "ListItem", "position": 2, "name": short, "item": canon}])},
                org(),
            ]
            if sid == "reportes": graph.append(report_schema(lang, canon))
            if sid in FAQ:
                qa = FAQ[sid][lang]
                body.append(f'<section class="faq"><h2>{U["faq"]}</h2>' + "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in qa) + "</section>")
                graph.append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]})
            nav = f'<nav class="pn" aria-label="{U["nav"]}">'
            nav += f'<a href="/{slug(prv, lang)}/">← {esc(name(prv, lang))}</a>' if prv else "<span></span>"
            nav += f'<a href="/{slug(nxt, lang)}/">{esc(name(nxt, lang))} →</a>' if nxt else "<span></span>"
            nav += "</nav>"
            reel = f"{home}#{'reportes' if sid == 'clientes' else sid}"
            page = head(title, desc, canon, alt_es, alt_en, og, {"@context": "https://schema.org", "@graph": graph}) + \
                chrome(reel, alt_en if lang == "es" else alt_es, "\n".join(body), nav) + "\n</body>\n</html>\n"
            write(sl, page)
            sitemap_urls.append((canon, alt_es, alt_en, "0.7"))

        # indice de los contrastes
        chs = [sid for sid in page_list if slug(sid, lang).startswith(HUB[lang][0] + "/")]
        items = "".join(f'<li><a href="/{slug(s, lang)}/"><h2>{esc(name(s, lang))}</h2><p>{esc(tx(find(secs[s], "h2")))}</p></a></li>' for s in chs)
        hc = f"{SITE}/{HUB[lang][0]}/"; he, hen = f"{SITE}/{HUB['es'][0]}/", f"{SITE}/{HUB['en'][0]}/"
        # Keep the legacy URL, but never serve the retired narrative OG artwork.
        og = f"{SITE}/og-jfcarpio-v2.png"
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "CollectionPage", "@id": hc + "#page", "url": hc, "name": HUB[lang][1] + " | JFCarpio.com", "description": U["hub_desc"], "inLanguage": lang,
             "isPartOf": {"@type": "WebSite", "name": "JFCarpio.com", "url": SITE + "/"}, "primaryImageOfPage": og},
            {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": U["home"], "item": home},
                                                            {"@type": "ListItem", "position": 2, "name": HUB[lang][1], "item": hc}]}, org()]}
        body = (f'<p class="kick">{esc(HUB[lang][1])}</p><h1>{esc(U["hub_h1"])}</h1><p class="lead">{esc(U["hub_lead"])}</p>'
                f'<ul class="tiles">{items}</ul><p class="cta"><a class="btn p" href="/{slug(chs[0], lang)}/">{U["start"]}</a></p>')
        write(HUB[lang][0], head(HUB[lang][1] + " | JFCarpio.com", U["hub_desc"], hc, he, hen, og, ld)
              + chrome(f"{SITE}/{'?lang=en' if lang == 'en' else ''}#portada", hen if lang == "es" else he, body) + "\n</body>\n</html>\n")
        sitemap_urls.append((hc, he, hen, "0.8"))

    os.makedirs(os.path.join(ROOT, "og"), exist_ok=True)
    json.dump(manifest, open(os.path.join(ROOT, "og", "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # The old accumulated-consequences PDF was retired with the 2026-10-05 narrative pivot.

    # sitemap
    sm_path = os.path.join(ROOT, "sitemap.xml"); sm = open(sm_path, encoding="utf-8").read()
    sm = re.sub(r"\n  <!-- SLIDE-PAGES-START -->.*?<!-- SLIDE-PAGES-END -->\n", "\n", sm, flags=re.S)
    block = "\n  <!-- SLIDE-PAGES-START -->\n" + "".join(
        f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{DATE}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{pr}</priority>\n'
        f'    <xhtml:link rel="alternate" hreflang="es" href="{e}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="{n}"/>\n'
        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{n}"/>\n  </url>\n' for u, e, n, pr in sitemap_urls) + "  <!-- SLIDE-PAGES-END -->\n"
    sm = re.sub(r"\s*</urlset>\s*$", "\n</urlset>\n", sm)
    sm = sm.replace("</urlset>", block + "</urlset>")
    open(sm_path, "w", encoding="utf-8").write(sm)

    # enlaces rastreables dentro del indice de index.html (ES + EN)
    def links(lang):
        out = f'<li><a href="/{HUB[lang][0]}/" hreflang="{lang}">{esc(HUB[lang][1])}</a></li>'
        return out + "".join(f'<li><a href="/{slug(s, lang)}/" hreflang="{lang}">{esc(name(s, lang))}</a></li>' for s in page_list)
    extra = "".join(f'<li><a href="{u}">{esc(n)}</a></li>' for n, u in [("Talleres corporativos de cambio rápido", "/talleres/"), ("Publicaciones", "/publicaciones/"), ("Revisión antes del lanzamiento · servicio pagado", "/revision-de-lanzamiento/"), ("Perfil", "/juan-fernando-carpio/")])
    blk = (f'<!--PAGES-START--><nav class="idxp" aria-label="Páginas del sitio"><h3 data-t="k520">{UI["es"]["idx_h"]}</h3><ul>{links("es")}{extra}</ul>'
           f'<h3 lang="en">In English</h3><ul lang="en">{links("en")}<li><a href="/en/launch-review/">Pre-launch review · paid service</a></li><li><a href="/workshops/">Rapid-change corporate workshops</a></li><li><a href="/market-intelligence-latam/">Latin America Market Intelligence</a></li><li><a href="/pacific-basin/">Pacific Basin Intelligence Unit</a></li></ul></nav><!--PAGES-END-->')
    if "<!--PAGES-START-->" in src:
        src = re.sub(r"<!--PAGES-START-->.*?<!--PAGES-END-->", lambda m: blk, src, flags=re.S)
    else:
        src = src.replace('<ol id="idxl"></ol>', '<ol id="idxl"></ol>' + blk, 1)
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(src)
    # llms.txt: mapa del sitio para buscadores con IA (ChatGPT, Claude, Perplexity). Se regenera aqui.
    L = ["# JFCarpio.com", "",
         "> Business apps, focused consulting reports, corporate workshops and custom dashboards. Based in Cuenca, Ecuador; serving clients worldwide online in English and Spanish.", "",
         "Contact: jfcarpio@gmail.com · WhatsApp +593 99 990 5080 · " + ADDR, "",
         "English home: https://jfcarpio.com/ · Spanish home: https://jfcarpio.com/es/", "",
         "## Core services", "",
         "- [Business apps](https://jfcarpio.com/en/apps/): sales, inventory and operational tools.",
         "- [Focused business reports](https://jfcarpio.com/en/reports/): USD 100 for one agreed business question. Questionnaire, 10-minute interview, written report within 72 hours after complete inputs and interview. Scope is confirmed before payment.",
         "- [Two corporate workshops](https://jfcarpio.com/workshops/): financial stress and private-enterprise culture.",
         "- [Dashboards](https://jfcarpio.com/en/business-viewers/): Antiquiebra, Gerencial and Marketing; custom work for private clients.", "",
         "Discovery note: this voluntary directory complements crawlable HTML and the XML sitemap. It does not guarantee indexing or AI recommendations.", "",
         "## English", "",
         f"- [There are two kinds of businesses]({SITE}/{HUB['en'][0]}/): {UI['en']['hub_desc']}",
         f"- [Pre-launch review]({SITE}/en/launch-review/): paid review of launch readiness for products built with vibe coding.",
         f"- [Rapid-change corporate workshops]({SITE}/workshops/): 2-hour corporate interventions for financial stress and private-enterprise culture.",
         f"- [Latin America Market Intelligence]({SITE}/market-intelligence-latam/): decision-focused research on pricing, competition, market entry and economic context.",
         f"- [Pacific Basin Intelligence Unit]({SITE}/pacific-basin/): macroeconomic intelligence on Chile, Ecuador, Peru and Colombia."]
    L += [f"- [{name(s, 'en')}]({SITE}/{slug(s, 'en')}/)" for s in page_list]
    L += ["", "## Español", "", f"- [Dos tipos de creadores de negocios]({SITE}/{HUB['es'][0]}/): {UI['es']['hub_desc']}",
          f"- [Revisión antes del lanzamiento]({SITE}/revision-de-lanzamiento/): servicio pagado para productos y SaaS hechos con vibecoding.",
          f"- [Talleres corporativos de cambio rápido]({SITE}/talleres/)", f"- [Publicaciones]({SITE}/publicaciones/)",
          f"- [Las 7 formas de destruir tus finanzas personales y familiares]({SITE}/las7formas/)",
          f"- [Visor Antiquiebra · 6–24M]({SITE}/visorantiquiebra/): atravesar el Valle de la Muerte (meses 6 a 24), 15 minutos semanales.",
          f"- [Visor Gerencial]({SITE}/visorgerencial/): un tablero por área ejecutiva; Marketing ya disponible."]
    L += [f"- [{name(s, 'es')}]({SITE}/{slug(s, 'es')}/)" for s in page_list]
    open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
    print("paginas:", len(sitemap_urls), "imagenes:", len(manifest))


HEAD_TPL = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="es" href="{alt_es}">
<link rel="alternate" hreflang="en" href="{alt_en}">
<link rel="alternate" hreflang="x-default" href="{alt_en}">
<meta property="og:type" content="website">
<meta property="og:locale" content="{loc}">
<meta property="og:site_name" content="JFCarpio.com">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#060E1D">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23060E1D'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='33' font-weight='900' fill='%23E8A020'%3EJ%3C/text%3E%3C/svg%3E" type="image/svg+xml">
<link rel="preload" as="font" href="/assets/fonts/jost-latin-wght-normal.woff2" type="font/woff2" crossorigin>
<link rel="preload" as="font" href="/assets/fonts/barlow-condensed-900.woff2" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/slide-page.css">
<link rel="stylesheet" href="/editorial.css">
<script type="application/ld+json">{ld}</script>
</head>
<body class="editorial">
<!-- Pagina generada por scripts/build-slide-pages.py desde index.html. NO editar a mano: cambia el fotograma en index.html y vuelve a correr el script. -->
"""

PDF_TPL = """<!DOCTYPE html><html lang="{lang}"><head><meta charset="UTF-8"><style>
@page{{size:A4;margin:18mm}}body{{font:12pt/1.5 'Jost',Arial,sans-serif;color:#060E1D}}
h1{{font:800 30pt/1 'Playfair Display',Georgia,serif;text-transform:uppercase;margin:0 0 8pt}}
.l{{font:700 11pt 'Jost',Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9A5B00;margin:0 0 14pt}}
.n{{display:inline-block;background:#E8A020;color:#060E1D;border-radius:99px;padding:2pt 10pt;margin-right:8pt}}
ol{{columns:2;column-gap:14mm;padding-left:18pt}}li{{margin:0 0 7pt;break-inside:avoid}}li::marker{{font:700 11pt 'Jost',Arial,sans-serif;color:#9A5B00}}
.f{{margin-top:18pt;border-top:2px solid #E8A020;padding-top:8pt;font-size:10.5pt}}a{{color:#060E1D}}
</style></head><body class="editorial"><h1>{h}</h1><p class="l"><span class="n">B {n}</span>{lab}</p><ol>{items}</ol>
<p class="f"><a href="{hub}">{hub}</a><br>{foot}</p></body></html>"""

if __name__ == "__main__":
    from private_backup import snapshot
    snapshot([str(p.relative_to(__import__("pathlib").Path(ROOT))) for p in __import__("pathlib").Path(ROOT).rglob("index.html") if "backups" not in p.parts and "codex-backups" not in p.parts], "page-generation")
    main()
    import runpy
    runpy.run_path(os.path.join(ROOT,"scripts","homologate-interiors.py"),run_name="__main__")
    runpy.run_path(os.path.join(ROOT,"scripts","build-home-locales.py"),run_name="__main__")
    runpy.run_path(os.path.join(ROOT,"scripts","build-discovery.py"),run_name="__main__")
