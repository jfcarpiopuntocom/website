#!/usr/bin/env python3
"""
Genera una pagina HTML propia por cada fotograma del reel (SEO: cada slide = una URL con su titulo,
descripcion, canonical, H1 y JSON-LD) a partir de index.html. Uso:  python3 scripts/build-slide-pages.py

- Lee index.html (fuente unica de verdad: textos ES en el diccionario T).
- Escribe <slug>/index.html por slide, historia-de-dos-negocios/index.html (indice de capitulos) y slide-page.css.
- Actualiza el bloque generado de sitemap.xml y la lista de enlaces dentro del indice de index.html (marcadores PAGES-START/END).
- NO toca las paginas que ya existen a mano: /talleres/, /publicaciones/, /juan-fernando-carpio/.
Volver a correrlo cada vez que cambie el texto de un fotograma. (JFC 2026-09-30)
"""
import re, json, html, os, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://jfcarpio.com"
OG = SITE + "/og-jfcarpio-v2.png"
DATE = "2026-09-30"

# id del fotograma -> (ruta, nombre corto para migas y enlaces)
PAGES = {
    "c1": ("historia-de-dos-negocios/dos-maneras-de-operar", "Historia 1 · Dos maneras de operar"),
    "apps": ("apps", "Apps"),
    "dato": ("el-dato", "El dato"),
    "c4": ("historia-de-dos-negocios/la-informacion-sola-no-basta", "Historia 2 · La información sola no basta"),
    "articulos": ("articulos", "Artículos"),
    "libro": ("libro", "Libro"),
    "c5": ("historia-de-dos-negocios/lo-que-pasa-afuera", "Historia 3 · Lo que pasa afuera"),
    "reportes": ("reportes", "Reportes"),
    "trayectoria": ("trayectoria", "Trayectoria"),
    "c8": ("historia-de-dos-negocios/datos-no-es-ver", "Historia 4 · Datos no es ver"),
    "dashboards": ("dashboards", "Dashboards"),
    "visores": ("visores", "Visores"),
    "gumroad": ("tienda-gumroad", "Tienda Gumroad"),
    "escuela": ("la-escuela-del-dinero", "La Escuela del Dinero"),
    "gratis": ("recursos-gratuitos", "Recursos gratuitos"),
    "clientes": ("clientes", "Clientes"),
    "c9": ("historia-de-dos-negocios/la-decision", "Historia 5 · La decisión"),
    "contacto": ("contacto", "Contacto"),
}
EXISTING = {"talleres": "/talleres/", "publicaciones": "/publicaciones/", "perfil": "/juan-fernando-carpio/"}
HUB = ("historia-de-dos-negocios", "Historia de dos negocios")


class N:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    def cls(self):
        return self.attrs.get("class", "").split()

    def text(self):
        out = []
        for k in self.kids:
            out.append(k if isinstance(k, str) else k.text())
        return "".join(out)

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


def main():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    T = json.loads(re.search(r"const T=(\{.*?\});\n", src, re.S).group(1))["es"]
    secs = {}
    for m in re.finditer(r'<section class="slide[^"]*" id="([a-z0-9]+)"[^>]*>.*?</section>', src, re.S):
        secs[m.group(1)] = parse(m.group(0))
    order = list(secs.keys())

    def tx(n):
        """texto ES de un nodo (usa data-t si lo tiene)."""
        k = n.attrs.get("data-t")
        if k and k in T: return T[k].strip()
        inner = [x for x in n.walk() if x is not n and x.attrs.get("data-t") in T]
        if inner and not n.text().strip():
            return inner[0].text().strip()
        return re.sub(r"\s+", " ", n.text()).strip()

    def href_to_page(h):
        if h.startswith("#"):
            sid = h[1:]
            if sid in PAGES: return "/" + PAGES[sid][0] + "/"
            if sid in EXISTING: return EXISTING[sid]
            return SITE + "/#" + sid
        return h

    page_list = [sid for sid in order if sid in PAGES]

    def render(sid):
        root = secs[sid]
        slug, short = PAGES[sid]
        h2 = find(root, "h2") or find(root, "h1")
        title_h = tx(h2) if h2 else short
        kick = find(root, cls="kick"); kick_t = tx(kick) if kick else short
        leads = [tx(x) for x in find_all(root, "p", "lead") if tx(x)]
        desc = (leads[0] if leads else title_h)
        desc = re.sub(r"\s+", " ", desc)
        if len(desc) > 158: desc = desc[:155].rsplit(" ", 1)[0] + "…"
        title = f"{title_h.rstrip('.')} | JFCarpio.com"
        if len(title) > 68: title = f"{short} | JFCarpio.com"
        canon = f"{SITE}/{slug}/"
        i = page_list.index(sid)
        prv = page_list[i - 1] if i > 0 else None
        nxt = page_list[i + 1] if i < len(page_list) - 1 else None

        body = []
        # tarjetas (.rr .ri)
        rr = find(root, cls="rr")
        if rr:
            body.append('<ul class="tiles">')
            for ri in find_all(rr, cls="ri"):
                b = find(ri, "b"); sp = find(ri, "span")
                t1 = tx(b) if b else ""; t2 = tx(sp) if sp else ""
                inner = f"<h2>{html.escape(t1)}</h2><p>{html.escape(t2)}</p>"
                h = ri.attrs.get("href")
                if h: inner = f'<a href="{html.escape(href_to_page(h))}">{inner}</a>'
                body.append(f"<li>{inner}</li>")
            body.append("</ul>")
        # pares primero/segundo (.ab)
        for ab in find_all(root, cls="ab"):
            if "panel" in (ab.parent.cls() if ab.parent else []): continue
            ps = find_all(ab, "p")
            if ps:
                body.append('<div class="pair">')
                for p in ps:
                    b = find(p, "b"); head = tx(b) if b else ""
                    txt = re.sub(r"\s+", " ", p.text()).strip()
                    if head and txt.startswith(head): txt = txt[len(head):].strip()
                    if not head:
                        kids = [x for x in p.kids if isinstance(x, N) and x.attrs.get("data-t") in T]
                    body.append(f'<p class="{"a" if "pa" in p.cls() else "b"}"><strong>{html.escape(head)}</strong> {html.escape(txt)}</p>')
                body.append("</div>")
        # bola de nieve
        sn = find(root, cls="snow")
        if sn:
            chips = [tx(c) for c in find_all(sn, cls="c")]
            lab = tx(find(sn, cls="sl"))
            body.append(f'<p class="snow"><strong>{html.escape(lab)}</strong> ' + " · ".join(html.escape(c) for c in chips) + "</p>")
        # botones (.bl)
        bl = find(root, cls="bl")
        btns = []
        if bl:
            for a in find_all(bl, "a"):
                h = a.attrs.get("href")
                if not h: continue
                ext = h.startswith("http")
                btns.append(f'<a class="btn{" p" if "p" in a.cls() else ""}" href="{html.escape(href_to_page(h))}"' + (' rel="noopener"' if ext and "jfcarpio.com" not in h else "") + f">{html.escape(tx(a))}</a>")
        # panel: detalle
        panel = find(root, cls="panel")
        detail = []
        if panel:
            for ch in panel.kids:
                if not isinstance(ch, N): continue
                if ch.tag == "h3": detail.append(f"<h2>{html.escape(tx(ch))}</h2>")
                elif ch.tag == "p" and tx(ch): detail.append(f"<p>{html.escape(tx(ch))}</p>")
                elif "gd" in ch.cls():
                    detail.append('<div class="cards">')
                    for cd in find_all(ch, cls="cd"):
                        b = find(cd, "b"); tg = find(cd, cls="tg"); pr = find(cd, cls="pr")
                        ps = [p for p in find_all(cd, "p") if "pr" not in p.cls()]
                        a = find(cd, "a")
                        c = "<div class=\"card\">"
                        if tg: c += f'<span class="tag">{html.escape(tx(tg))}</span>'
                        if b: c += f"<h3>{html.escape(tx(b))}</h3>"
                        for p in ps: c += f"<p>{html.escape(tx(p))}</p>"
                        if pr: c += f'<p class="price">{html.escape(tx(pr))}</p>'
                        if a and a.attrs.get("href"):
                            h = a.attrs["href"]
                            c += f'<a class="btn" href="{html.escape(href_to_page(h))}" rel="noopener">{html.escape(tx(a))}</a>'
                        c += "</div>"; detail.append(c)
                    detail.append("</div>")
        lead_html = "".join(f"<p class=\"lead\">{html.escape(t)}</p>" for t in leads)
        nav = '<nav class="pn" aria-label="Siguiente y anterior">'
        nav += f'<a href="/{PAGES[prv][0]}/">← {html.escape(PAGES[prv][1])}</a>' if prv else "<span></span>"
        nav += f'<a href="/{PAGES[nxt][0]}/">{html.escape(PAGES[nxt][1])} →</a>' if nxt else "<span></span>"
        nav += "</nav>"
        ld = {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "WebPage", "@id": canon + "#page", "url": canon, "name": title, "description": desc,
                 "inLanguage": "es", "isPartOf": {"@type": "WebSite", "name": "JFCarpio.com", "url": SITE + "/"},
                 "primaryImageOfPage": OG},
                {"@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"}]
                 + ([{"@type": "ListItem", "position": 2, "name": HUB[1], "item": f"{SITE}/{HUB[0]}/"},
                     {"@type": "ListItem", "position": 3, "name": short, "item": canon}] if slug.startswith(HUB[0] + "/")
                    else [{"@type": "ListItem", "position": 2, "name": short, "item": canon}])},
            ],
        }
        page = PAGE_TPL.format(
            title=html.escape(title), desc=html.escape(desc), canon=canon, og=OG, kick=html.escape(kick_t),
            h1=html.escape(title_h), lead=lead_html, body="\n".join(body),
            btns=('<p class="cta">' + " ".join(btns) + "</p>") if btns else "", detail="\n".join(detail),
            reel=f"{SITE}/#{sid}", nav=nav, ld=json.dumps(ld, ensure_ascii=False))
        d = os.path.join(ROOT, slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page)
        return slug, short, title_h, desc

    results = {sid: render(sid) for sid in page_list}

    # hub de la historia
    chs = [sid for sid in page_list if PAGES[sid][0].startswith(HUB[0] + "/")]
    items = "".join(f'<li><a href="/{PAGES[s][0]}/"><h2>{html.escape(PAGES[s][1])}</h2><p>{html.escape(results[s][2])}</p></a></li>' for s in chs)
    hub_desc = "Dos negocios nacieron el mismo año. Cinco capítulos que muestran cómo se acumulan las consecuencias de decidir con o sin herramientas, talleres, reportes y dashboards."
    hub_canon = f"{SITE}/{HUB[0]}/"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": hub_canon + "#page", "url": hub_canon, "name": HUB[1] + " | JFCarpio.com", "description": hub_desc, "inLanguage": "es",
         "isPartOf": {"@type": "WebSite", "name": "JFCarpio.com", "url": SITE + "/"}},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"},
                                                        {"@type": "ListItem", "position": 2, "name": HUB[1], "item": hub_canon}]}]}
    hub = PAGE_TPL.format(title=html.escape(HUB[1] + " | JFCarpio.com"), desc=html.escape(hub_desc), canon=hub_canon, og=OG,
                          kick="Historia de dos negocios", h1="Dos negocios nacieron el mismo año.",
                          lead="<p class=\"lead\">Misma idea. Mismo esfuerzo. Mismo primer día. Esta es su historia. Es ilustrativa: los datos, no.</p>",
                          body=f'<ul class="tiles">{items}</ul>', btns='<p class="cta"><a class="btn p" href="' + f"/{PAGES[chs[0]][0]}/" + '">Empezar la historia</a></p>',
                          detail="", reel=SITE + "/#portada", nav="", ld=json.dumps(ld, ensure_ascii=False))
    os.makedirs(os.path.join(ROOT, HUB[0]), exist_ok=True)
    open(os.path.join(ROOT, HUB[0], "index.html"), "w", encoding="utf-8").write(hub)

    open(os.path.join(ROOT, "slide-page.css"), "w", encoding="utf-8").write(CSS)

    # sitemap
    sm_path = os.path.join(ROOT, "sitemap.xml"); sm = open(sm_path, encoding="utf-8").read()
    sm = re.sub(r"\n  <!-- SLIDE-PAGES-START -->.*?<!-- SLIDE-PAGES-END -->\n", "\n", sm, flags=re.S)
    urls = [(HUB[0], "0.8")] + [(PAGES[s][0], "0.7") for s in page_list]
    block = "\n  <!-- SLIDE-PAGES-START -->\n" + "".join(
        f"  <url>\n    <loc>{SITE}/{u}/</loc>\n    <lastmod>{DATE}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{pr}</priority>\n  </url>\n" for u, pr in urls) + "  <!-- SLIDE-PAGES-END -->\n"
    sm = re.sub(r"\s*</urlset>\s*$", "\n</urlset>\n", sm)
    sm = sm.replace("</urlset>", block + "</urlset>")
    open(sm_path, "w", encoding="utf-8").write(sm)

    # enlaces dentro del indice de index.html
    links = f'<li><a href="/{HUB[0]}/">{HUB[1]}</a></li>' + "".join(f'<li><a href="/{PAGES[s][0]}/">{html.escape(PAGES[s][1])}</a></li>' for s in page_list)
    links += "".join(f'<li><a href="{u}">{html.escape(n)}</a></li>' for n, u in [("Talleres", "/talleres/"), ("Publicaciones", "/publicaciones/"), ("Perfil", "/juan-fernando-carpio/")])
    blk = f'<!--PAGES-START--><nav class="idxp" aria-label="Páginas del sitio"><h3 data-t="k520">Cada sección tiene su propia página</h3><ul>{links}</ul></nav><!--PAGES-END-->'
    if "<!--PAGES-START-->" in src:
        src = re.sub(r"<!--PAGES-START-->.*?<!--PAGES-END-->", lambda m: blk, src, flags=re.S)
    else:
        src = src.replace('<ol id="idxl"></ol>', '<ol id="idxl"></ol>' + blk, 1)
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(src)
    print("paginas:", len(page_list) + 1)


PAGE_TPL = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_EC">
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Lora:wght@400;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/slide-page.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<!-- Pagina generada por scripts/build-slide-pages.py desde index.html. NO editar a mano: cambia el fotograma en index.html y vuelve a correr el script. -->
<header class="hd"><a class="brand" href="/">JFCarpio.com</a><a class="reel" href="{reel}">Ver en el reel interactivo →</a></header>
<main>
<p class="kick">{kick}</p>
<h1>{h1}</h1>
{lead}
{body}
{btns}
{detail}
</main>
{nav}
<footer class="ft"><a href="/">Inicio</a> · <a href="/historia-de-dos-negocios/">Historia de dos negocios</a> · <a href="/blog/">Blog</a> · <a href="/talleres/">Talleres</a> · <a href="/publicaciones/">Publicaciones</a> · <a href="/contacto/">Contacto</a><p>© 2026 JFCarpio.com · Cuenca, Ecuador</p></footer>
</body>
</html>
"""

CSS = """/* Estilo de las paginas por fotograma (generado por scripts/build-slide-pages.py). Paleta: navy #060E1D, dorado #E8A020, carmesi #B0183E. Texto minimo .82rem, blanco sobre navy. */
*{box-sizing:border-box}
html{background:#060E1D}
body{margin:0;background:#060E1D;color:#fff;font:400 1.125rem/1.65 'Lora',Georgia,serif}
a{color:#fff}
.hd{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px max(20px,5vw);border-bottom:1px solid #2F4670}
.brand{font:700 1.4rem 'Barlow Condensed',sans-serif;letter-spacing:.02em;text-decoration:none}
.reel{font:700 .9rem 'Space Mono',monospace;letter-spacing:.06em;text-decoration:none;border:2px solid #fff;border-radius:99px;padding:10px 16px;min-height:44px;display:inline-flex;align-items:center}
main{max-width:980px;margin:0 auto;padding:clamp(28px,6vw,64px) max(20px,5vw)}
.kick{font:700 .875rem 'Space Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#E8A020;margin:0 0 10px}
h1{font:800 clamp(2.2rem,6vw,4rem)/1.02 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.01em;margin:0 0 18px}
h2{font:800 1.5rem/1.1 'Barlow Condensed',sans-serif;margin:0 0 6px}
h3{font:800 1.3rem/1.1 'Barlow Condensed',sans-serif;margin:0 0 6px}
.lead{font-size:1.2rem;max-width:64ch;margin:0 0 14px}
.tiles{list-style:none;padding:0;margin:26px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px}
.tiles li{background:#0B1F3F;border:1px solid #2F4670;border-radius:10px;padding:16px 18px;counter-increment:t}
.tiles li::before{content:counter(t,decimal-leading-zero);display:block;font:700 .875rem 'Space Mono',monospace;letter-spacing:.16em;color:#E8A020;margin-bottom:4px}
.tiles{counter-reset:t}
.tiles li a{text-decoration:none;display:block}
.tiles li p{margin:0;font-size:1rem}
.pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px;margin:22px 0}
.pair p{margin:0;background:#0B1F3F;border-top:1px solid #2F4670;padding:14px 16px}
.pair strong{display:block;font:700 .875rem 'Space Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#E8A020;margin-bottom:4px}
.snow{background:#0B1F3F;border-left:3px solid #E8A020;padding:12px 16px;margin:22px 0;font-size:1rem}
.snow strong{font:700 .875rem 'Space Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#E8A020;display:block;margin-bottom:4px}
.cta{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0}
.btn{display:inline-flex;align-items:center;min-height:48px;padding:10px 22px;border:2px solid #fff;border-radius:99px;color:#fff;text-decoration:none;font:700 .9rem 'Jost','Space Mono',sans-serif;letter-spacing:.08em;text-transform:uppercase}
.btn.p{background:#B0183E;border-color:#B0183E}
.btn:hover,.btn:focus-visible{background:#fff;color:#060E1D}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px;margin:18px 0}
.card{background:#0B1F3F;border:1px solid #2F4670;border-radius:10px;padding:16px 18px}
.card p{margin:0 0 10px;font-size:1rem}
.card .tag{display:block;font:700 .875rem 'Space Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#E8A020;margin-bottom:4px}
.card .price{font-weight:600}
main>p{max-width:70ch}
.pn{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:980px;margin:0 auto;padding:0 max(20px,5vw) 30px}
.pn a{font:700 .95rem 'Space Mono',monospace;text-decoration:none;border:1px solid #2F4670;border-radius:10px;padding:12px 16px;min-height:48px;display:inline-flex;align-items:center}
.ft{border-top:1px solid #2F4670;padding:22px max(20px,5vw);font-size:.95rem}
.ft p{margin:10px 0 0}
a:focus-visible{outline:3px solid #E8A020;outline-offset:3px}
"""

if __name__ == "__main__":
    main()
