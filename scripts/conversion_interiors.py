"""Compact, conversion-oriented layouts for six existing bilingual landing families.

Runs AFTER commons_editorial_photos; preserves all form IDs/handlers, links,
existing figures/credits, schema and other landing pages. No JavaScript required.
"""
import re

FAMILIES = {
    "reportes": "reports", "en/reports": "reports",
    "contacto": "contact", "en/contact": "contact",
    "trayectoria": "track", "en/track-record": "track",
    "libro": "book", "en/book": "book",
    "articulos": "articles", "en/articles": "articles",
    "historia-de-dos-negocios": "story", "en/tale-of-two-businesses": "story",
}
PHOTOS = re.compile(r'<figure class="commons-editorial-photo">[\s\S]*?</figure>')
CTA = re.compile(r'<p class="cta">[\s\S]*?</p>')
LEAD = re.compile(r'<p class="lead">[\s\S]*?</p>')


def enhance_conversion_interior(slug, page):
    kind = FAMILIES.get(slug)
    if not kind:
        return page
    if 'class="conversion-interior' in page:
        raise ValueError("Converted twice: " + slug)
    if page.count('</head>') != 1 or page.count('<main>') != 1:
        raise ValueError("Unexpected head or main: " + slug)
    page = page.replace('</head>', '<link rel="stylesheet" href="/conversion-interiors.css">\n</head>', 1)
    tag = '<main class="conversion-interior conversion-' + kind + '">'
    page = page.replace('<main>', tag, 1)

    if kind == "reports":
        # The full scope, clock caveat, questions, worked example and contact links remain.
        headlines = {
            "reportes": (
                "Tu negocio tiene una pregunta. Investiguémosla.",
                "Una pregunta. Una decisión más clara.",
                "Un descuento que vende más pero deja menos. Inventario que retiene tu dinero. Un mercado que quieres entender antes de gastar. Trae <strong>una pregunta de tu negocio</strong>: examinamos la evidencia y te entregamos un análisis escrito para decidir.",
                "¿Precio, inventario o clientes? Investigamos <strong>una pregunta de tu negocio</strong> y entregamos evidencia, opciones y próximos pasos por escrito."
            ),
            "en/reports": (
                "Your business has a question. Let’s investigate it.",
                "One question. A clearer decision.",
                "A discount that sells more but leaves less. Stock tying up cash. A new market you want to understand before spending. Bring us <strong>one business question</strong>: we examine the evidence and write an analysis you can use to decide.",
                "Pricing, inventory or customers? We investigate <strong>one business question</strong> and deliver written evidence, options and next steps."
            ),
        }
        old_title, new_title, old_intro, new_intro = headlines[slug]
        for old, new in ((old_title, new_title), (old_intro, new_intro)):
            if page.count(old) != 1:
                raise ValueError("Report copy changed upstream: " + slug)
            page = page.replace(old, new, 1)
        if page.count('class="report-hero-copy"') != 1 or page.count('class="commons-editorial-photo"') != 2:
            raise ValueError("Report hero/photo missing: " + slug)
        return page

    main_start = page.index(tag) + len(tag)
    photo = PHOTOS.search(page, main_start)
    main_end = page.index('</main>', main_start)
    if not photo or photo.start() > main_end:
        raise ValueError("Missing first editorial photo: " + slug)
    intro = page[main_start:photo.start()]
    rest = page[photo.end():]
    # Promote the existing CTA (one, not a clone) where it was buried beneath tiles.
    if kind in ("book", "articles", "story"):
        cta = CTA.search(rest)
        if not cta:
            raise ValueError("No existing CTA to elevate: " + slug)
        promoted = cta.group(0)
        rest = rest[:cta.start()] + rest[cta.end():]
    else:
        promoted = ""

    if kind in ("contact", "track"):
        match = CTA.search(intro)
        if not match:
            raise ValueError("Missing first CTA: " + slug)
        split_at = match.end()
        hero_copy, additional = intro[:split_at], intro[split_at:]
        if kind == "contact":
            leads = list(LEAD.finditer(hero_copy))
            if len(leads) != 2:
                raise ValueError("Contact intro changed: " + slug)
            repeated = leads[1].group(0)
            hero_copy = hero_copy.replace(repeated, "", 1)
            # Remove exact repeated service paragraph only; keep the useful 3-point brief.
            bare = repeated.replace(' class="lead"', '')
            additional = additional.replace(bare, "", 1)
    else:
        hero_copy, additional = intro, ""
        leads = list(LEAD.finditer(hero_copy))
        if kind in ("book", "articles"):
            if len(leads) != 2:
                raise ValueError("Expected 2 editorial leads: " + slug)
            secondary = leads[1].group(0)
            hero_copy = hero_copy.replace(secondary, "", 1)
            additional = '\n<div class="conversion-support">' + secondary + '</div>\n'
        hero_copy += '\n' + promoted

    if kind == "book":
        hero_copy = hero_copy.replace("Economía(que", "Economía (que").replace("Economics(that", "Economics (that")
    if hero_copy.count('<h1>') != 1:
        raise ValueError("Hero heading lost: " + slug)
    figure = photo.group(0)
    if figure.count('>Ph: Wikimedia Commons</a>') != 1:
        raise ValueError("Commons credit lost: " + slug)
    hero = ('\n<section class="conversion-hero"><div class="conversion-hero-copy">\n'
            + hero_copy.strip()
            + '\n</div>\n'
            + figure.replace('loading="lazy"', 'loading="eager" fetchpriority="high"', 1)
            + '\n</section>\n')
    page = page[:main_start] + hero + additional + rest
    if page.count('<h1>') != 1 or page.count('class="conversion-hero"') != 1:
        raise ValueError("Structural issue: " + slug)
    return page
