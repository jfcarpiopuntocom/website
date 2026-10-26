#!/usr/bin/env python3
"""Narrow pre-release regression: 12 bilingual editorial landing pages only."""
from pathlib import Path
from html.parser import HTMLParser
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from conversion_interiors import FAMILIES

class CheckHTML(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.h1 = self.forms = self.photo = self.hero = self.cta = 0
  self.links = []
  self.main = 0
 def handle_starttag(self, tag, attrs):
  a = dict(attrs)
  classes = a.get("class","").split()
  if tag == "h1": self.h1 += 1
  if tag == "form": self.forms += 1
  if tag == "main": self.main += 1
  if "conversion-hero" in classes: self.hero += 1
  if "commons-editorial-photo" in classes: self.photo += 1
  if tag == "a": self.links.append(a.get("href",""))
  if "cta" in classes and tag == "p": self.cta += 1

css = (ROOT / "conversion-interiors.css").read_text(encoding="utf8")
assert "word-break:normal" in css and "max-width:none" in css and "@media(max-width:760px)" in css
assert not re.search(r'word-break\s*:\s*break-all', css)
assert "grid-template-columns:minmax(0,1.18fr)" in css
for slug, kind in FAMILIES.items():
 path = ROOT / slug / "index.html"
 html = path.read_text(encoding="utf8")
 p = CheckHTML();p.feed(html)
 assert p.h1 == p.main == 1, f"{slug}: H1 or main count"
 assert p.photo == (2 if kind=="reports" else 1), f"{slug}: editorial figures"
 assert html.count('>Ph: Wikimedia Commons</a>') == p.photo, f"{slug}: credits lost"
 assert not "Fotografía ilustrativa; no representa clientes" in html, f"{slug}: long caption"
 assert html.count('href="/conversion-interiors.css"')==1, f"{slug}: CSS missing"
 assert f'class="conversion-interior conversion-{kind}"' in html, f"{slug}: layout missing"
 assert "<link rel=\"canonical\"" in html, f"{slug}: canonical missing"
 assert 'href="https://jfcarpio.com/assets/brand/jfc-approved-20261008.png"' in html, f"{slug}: JFC icon missing"
 assert all(url.startswith("https://upload.wikimedia.org/") for url in re.findall(r'<figure class="commons-editorial-photo"><img src="([^"]+)"',html)), f"{slug}: image URL not absolute"
 assert all(h and not h.startswith("javascript:") for h in p.links), f"{slug}: unsafe href"
 assert p.cta >= 1, f"{slug}: CTA missing"
 if kind=="reports":
  assert 'class="report-hero-copy"' in html, f"{slug}: report hero"
  assert "15ch" not in html, f"{slug}: legacy narrow hero markup"
  assert "72" in html and "USD 100" in html and ("10 minutos" in html or "10-minute" in html), f"{slug}: offer contract"
  assert '#report-example' in html and '<details id="report-example"' in html, f"{slug}: sample"
 else:
  assert p.hero==1, f"{slug}: compact hero missing"
  fragment = html.split('<section class="conversion-hero">',1)[1].split('</section>',1)[0]
  assert '<h1>' in fragment and 'class="commons-editorial-photo"' in fragment and 'class="cta"' in fragment, f"{slug}: value, visual or CTA absent from hero"
 if kind=="contact":
  assert p.forms==1 and 'data-contact-brief' in html, f"{slug}: intake form altered"
 print("OK",slug,kind,p.photo,"photo(s)",p.cta,"CTA(s)")
print("OK — 12 landing pages: bilingual content, hero, photos, credits, CTAs, forms, favicon and stylesheet")
