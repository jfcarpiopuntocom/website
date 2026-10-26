"""Verified CC BY-SA Wikimedia Commons photographs for generated interior pages.

Sources and credits are deliberately kept adjacent to the visible image.
No photo is evidence of a JFCarpio.com customer or prior project.
Source-of-truth: scripts/build-slide-pages.py imports enhance_interior_page.
"""
from html import escape

LICENCE = "https://creativecommons.org/licenses/by-sa/4.0/"
PHOTOS = {
 "market": {
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Mercado_Artesanal_(Guayaquil).jpg/960px-Mercado_Artesanal_(Guayaquil).jpg",
  "file": "https://commons.wikimedia.org/wiki/File:Mercado_Artesanal_(Guayaquil).jpg",
  "title": "Mercado Artesanal (Guayaquil)",
  "author": "Freddy eduardo", "size": (960, 723),
  "alt_es": "Mercado artesanal de Guayaquil, Ecuador, con locales y comerciantes.",
  "alt_en": "Artisan market in Guayaquil, Ecuador."
 },
 "meeting": {
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Commercial_meeting%2C_an_example.jpg/960px-Commercial_meeting%2C_an_example.jpg",
  "file": "https://commons.wikimedia.org/wiki/File:Commercial_meeting,_an_example.jpg",
  "title": "Commercial meeting, an example",
  "author": "Fredericknoronha", "size": (960, 540),
  "alt_es": "Reunión comercial con una presentación en pantalla, fotografía contextual.",
  "alt_en": "Commercial meeting with a presentation on screen; contextual photograph."
 },
 "books": {
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Book_shelves_in_Library.jpg/960px-Book_shelves_in_Library.jpg",
  "file": "https://commons.wikimedia.org/wiki/File:Book_shelves_in_Library.jpg",
  "title": "Book shelves in Library",
  "author": "Kavitha G. Kana", "size": (960, 720),
  "alt_es": "Estantes con libros en una biblioteca.",
  "alt_en": "Books arranged in shelves in a library."
 },
 "workstation": {
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Computer_workstation_while_out_of_use.jpg/960px-Computer_workstation_while_out_of_use.jpg",
  "file": "https://commons.wikimedia.org/wiki/File:Computer_workstation_while_out_of_use.jpg",
  "title": "Computer workstation while out of use",
  "author": "Fredericknoronha", "size": (960, 540),
  "alt_es": "Estación de trabajo con ordenador, teclado y monitor.",
  "alt_en": "Computer workstation with monitor and keyboard."
 }
}
# Slugs as supplied to write() in build-slide-pages.py.
# Avoid app/dashboard pages where a real video or product is the better visual.
INSERTIONS = {
 "reportes": [('<section id="report-topics"', "market"), ('<section class="report-process', "meeting")],
 "en/reports": [('<section id="report-topics"', "market"), ('<section class="report-process', "meeting")],
 "articulos": [('<ul class="tiles">', "books")],
 "en/articles": [('<ul class="tiles">', "books")],
 "libro": [('<ul class="tiles">', "books")],
 "en/book": [('<ul class="tiles">', "books")],
 "trayectoria": [('<section class="proof-milestones', "meeting")],
 "en/track-record": [('<section class="proof-milestones', "meeting")],
 "contacto": [('<section class="conversion-intake', "meeting")],
 "en/contact": [('<section class="conversion-intake', "meeting")],
 "historia-de-dos-negocios": [('<ul class="tiles">', "market")],
 "en/tale-of-two-businesses": [('<ul class="tiles">', "market")],
 "revision-de-lanzamiento": [('<section class="scope', "workstation")],
 "en/launch-review": [('<section class="scope', "workstation")]
}

def photo_html(key, lang):
 p = PHOTOS[key]
 es = lang == "es"
 context = ("Fotografía ilustrativa; no representa clientes de JFCarpio.com."
            if es else "Illustrative photo; not a JFCarpio.com client.")
 crop = "Encuadre recortado." if es else "Display cropped."
 w, h = p["size"]
 alt = p["alt_es" if es else "alt_en"]
 return (f'<figure class="commons-editorial-photo">'
  f'<img src="{escape(p["image"], quote=True)}" width="{w}" height="{h}"'
  f' loading="lazy" decoding="async" alt="{escape(alt, quote=True)}">'
  f'<figcaption>{escape(context)} '
  f'<a href="{escape(p["file"], quote=True)}" rel="noopener noreferrer">'
  f'{escape(p["title"])}</a> · {escape(p["author"])} · '
  f'<a href="{LICENCE}" rel="noopener noreferrer">CC BY-SA 4.0</a> · '
  f'{escape(crop)} Wikimedia Commons.</figcaption></figure>\n')

def enhance_interior_page(slug, page):
 specs = INSERTIONS.get(slug, ())
 if not specs:
  return page
 if 'class="commons-editorial-photo"' in page:
  raise ValueError(f"Duplicate Commons photo block in {slug}")
 lang = "en" if slug.startswith("en/") else "es"
 for before, key in specs:
  if page.count(before) != 1:
   raise ValueError(f"Expected one exact photo anchor in {slug}: {before}")
  page = page.replace(before, photo_html(key, lang) + before, 1)
 return page
