"""Verified CC BY-SA Wikimedia Commons photographs for generated interior pages.

Sources and credits are deliberately kept adjacent to the visible image.
No photo is evidence of a JFCarpio.com customer or prior project.
Source-of-truth: scripts/build-slide-pages.py imports enhance_interior_page.
"""
from html import escape

LICENCE = "https://creativecommons.org/licenses/by-sa/4.0/"
PHOTOS = {
 "market": {
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Artisan_Market_-_Andes_Mountains_-_South_America%2C_Ecuador_Reserva_ecol%C3%B3gica_Cotacachi-Cayapasm%2C_n.jpg/960px-Artisan_Market_-_Andes_Mountains_-_South_America%2C_Ecuador_Reserva_ecol%C3%B3gica_Cotacachi-Cayapasm%2C_n.jpg",
  "file": "https://commons.wikimedia.org/wiki/File:Artisan_Market_-_Andes_Mountains_-_South_America%2C_Ecuador_Reserva_ecol%C3%B3gica_Cotacachi-Cayapasm%2C_n.jpg",
  "title": "Artisan Market - Andes Mountains - South America, Ecuador Reserva ecológica Cotacachi-Cayapasm, n.jpg",
  "author": "JOJOtheWhale.bronxtale", "size": (960, 1280),
  "alt_es": "Tejidos artesanales expuestos en un mercado andino de Ecuador.",
  "alt_en": "Colorful textiles displayed at an artisan market in the Ecuadorian Andes."
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
 "reportes": [('<section class="report-process', "meeting")],
 "en/reports": [('<section class="report-process', "meeting")],
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

def photo_html(key, lang, hero=False):
 p = PHOTOS[key]
 es = lang == "es"
 w, h = p["size"]
 alt = p["alt_es" if es else "alt_en"]
 # The linked Commons description provides the author and CC license.
 # Make the same details accessible through the link without a long visible caption.
 full = f'{p["title"]} · {p["author"]} · CC BY-SA 4.0 · ' + ("encuadre recortado" if es else "display cropped")
 loading = 'loading="eager" fetchpriority="high"' if hero else 'loading="lazy"'
 return (f'<figure class="commons-editorial-photo">'
  f'<img src="{escape(p["image"], quote=True)}" width="{w}" height="{h}"'
  f' {loading} decoding="async" alt="{escape(alt, quote=True)}">'
  f'<figcaption><a href="{escape(p["file"], quote=True)}" rel="noopener noreferrer"'
  f' title="{escape(full, quote=True)}" aria-label="Ph: Wikimedia Commons. {escape(full, quote=True)}">'
  f'Ph: Wikimedia Commons</a></figcaption></figure>\n')

def enhance_interior_page(slug, page):
 specs = INSERTIONS.get(slug, ())
 if not specs:
  return page
 if 'class="commons-editorial-photo"' in page:
  raise ValueError(f"Duplicate Commons photo block in {slug}")
 lang = "en" if slug.startswith("en/") else "es"
 if slug in ("reportes", "en/reports"):
  opening = '<header class="report-opening">'
  if page.count(opening) != 1: raise ValueError(f"Missing report opening {slug}")
  page = page.replace(opening, opening + '\n<div class="report-hero-copy">', 1)
  first = page.index(opening)
  close = page.find('</header>', first)
  if close < 0: raise ValueError(f"Missing report header close {slug}")
  page = page[:close] + '</div>\n' + photo_html("market", lang, hero=True) + page[close:]
 for before, key in specs:
  if page.count(before) != 1:
   raise ValueError(f"Expected one exact photo anchor in {slug}: {before}")
  page = page.replace(before, photo_html(key, lang) + before, 1)
 return page
