"""Focused regression: bilingual inventory/cash explainer + discovery; no network or full test suite."""
from pathlib import Path
from html.parser import HTMLParser
import json, re, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
URLS={
 "es":"https://jfcarpio.com/articulos/inventario-inmovilizado-caja-proveedores/",
 "en":"https://jfcarpio.com/en/articles/inventory-cash-suppliers/"
}
FILES={
 "es":"articulos/inventario-inmovilizado-caja-proveedores/index.html",
 "en":"en/articles/inventory-cash-suppliers/index.html"
}
class Scan(HTMLParser):
 def __init__(self):
  super().__init__(); self.h1=0; self.canon=[]; self.alt={}; self.schemas=[]; self.capture=False; self.js=""
 def handle_starttag(self, tag, attrs):
  d=dict(attrs)
  if tag=="h1":self.h1+=1
  if tag=="link" and d.get("rel")=="canonical":self.canon.append(d.get("href"))
  if tag=="link" and d.get("rel")=="alternate":self.alt[d.get("hreflang")]=d.get("href")
  if tag=="script" and d.get("type")=="application/ld+json":self.capture=True;self.js=""
 def handle_data(self, data):
  if self.capture:self.js+=data
 def handle_endtag(self, tag):
  if tag=="script" and self.capture:self.schemas.append(json.loads(self.js));self.capture=False
feed=(ROOT/"feed.xml").read_text(encoding="utf-8")
site=(ROOT/"sitemap.xml").read_text(encoding="utf-8")
generator=(ROOT/"scripts/build-discovery.py").read_text(encoding="utf-8")
enricher=(ROOT/"scripts/enrich_conversion_pages.py").read_text(encoding="utf-8")
for lang,url in URLS.items():
 html=(ROOT/FILES[lang]).read_text(encoding="utf-8")
 c=Scan();c.feed(html)
 assert html.startswith("<!DOCTYPE html>") and html.lower().count("<!doctype")==1,lang
 assert c.h1==1 and c.canon==[url],lang
 assert c.alt=={"es":URLS["es"],"en":URLS["en"],"x-default":URLS["en"]},lang
 assert len(c.schemas)==1 and {x["@type"] for x in c.schemas[0]["@graph"]}=={"Article","WebPage","BreadcrumbList"},lang
 assert html.count("<main")==1 and html.count("</main>")==1 and html.count("<table")==1,lang
 assert "openstax.org" in html and "consultor.jfcarpio.com" in html,lang
 assert "960" in html and "440" in html and "16 " in html,lang
 assert url in (ROOT/("articulos/index.html" if lang=="es" else "en/articles/index.html")).read_text(encoding="utf-8"),lang
 assert url in enricher and url in feed,lang
 assert url.replace("https://jfcarpio.com","") in generator,lang
 assert "mark.hl" not in html and "#define CYAN" not in html,lang
 print("OK",lang,"SEO HTML, math, hreflang, JSON-LD, index, feed, generator")
root=ET.fromstring(site)
ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
entries=root.findall("s:url",ns)
for url in URLS.values():
 hits=[x for x in entries if x.find("s:loc",ns).text==url]
 assert len(hits)==1,url
 alt=[(x.attrib.get("hreflang"),x.attrib.get("href")) for x in hits[0] if x.tag.endswith("link")]
 assert set(alt)==set([("es",URLS["es"]),("en",URLS["en"]),("x-default",URLS["en"])]),url
assert (80*12,80/20,700-500,700+20*12-500,20/30*15+6)==(960,4,200,440,16)
ET.fromstring(feed)
print("OK sitemap + XML feed + invented math; NO claims about ranking, citations or product runtime")
