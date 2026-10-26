"""Focused AI SEO guard for two original, bilingual, evidence-led cash-flow explainers.
Source-only: validates discoverability, math, internal linking and commercial promise.
Not an indexing / AI-model-visibility test.
"""
from pathlib import Path
from html.parser import HTMLParser
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
URLS = {
    "es": ("articulos/ventas-suben-caja-baja/index.html",
           "https://jfcarpio.com/articulos/ventas-suben-caja-baja/"),
    "en": ("en/articles/sales-up-cash-down/index.html",
           "https://jfcarpio.com/en/articles/sales-up-cash-down/"),
}

class Reader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = []
        self._h1 = False

    def handle_starttag(self, tag, attrs):
        if tag == "h1":
            self._h1 = True
            self.h1.append("")

    def handle_endtag(self, tag):
        if tag == "h1":
            self._h1 = False

    def handle_data(self, data):
        if self._h1:
            self.h1[-1] += data


docs = {}
for lang, (path, canonical) in URLS.items():
    s = (ROOT / path).read_text(encoding="utf-8")
    docs[lang] = s
    assert len(re.findall(r"<!doctype html>", s, re.I)) == 1, path
    assert f'<html lang="{lang}">' in s
    assert s.count('rel="canonical"') == 1
    assert f'<link rel="canonical" href="{canonical}">' in s
    for rel_lang, (_, rel_url) in URLS.items():
        assert f'hreflang="{rel_lang}" href="{rel_url}"' in s, (path, rel_lang)
    reader = Reader()
    reader.feed(s)
    assert len(reader.h1) == 1, (path, reader.h1)
    blocks = re.findall(r'<script[^>]*type="application/ld\\+json"[^>]*>(.*?)</script>', s, re.S)
    assert len(blocks) == 1, path
    graph = json.loads(blocks[0])["@graph"]
    article = next(row for row in graph if row["@type"] == "Article")
    page = next(row for row in graph if row["@type"] == "WebPage")
    assert article["headline"] == reader.h1[0], path
    assert article["author"]["@type"] == "Organization", path
    assert article["datePublished"] == "2026-10-25", path
    assert page["url"] == canonical and page["inLanguage"] == lang
    for expected in [
        "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows.html/",
        "https://www.fdic.gov/consumer-resource-center/mssb-m10-pg.pdf",
        "https://consultor.jfcarpio.com/",
        "<table", "<caption>", "<th scope=\"col\">", "<th scope=\"row\">",
    ]:
        assert expected in s, (path, expected)
    if lang == "es":
        assert "8.000 − 6.000 − 3.000" in s
        assert "−USD 1.000" in s
        assert "Asesoría Express en Finanzas" in s
    else:
        assert "8,000 − 6,000 − 3,000" in s
        assert "−USD 1,000" in s
        assert "Express Advisory in Business Finance" in s

ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9",
      "x": "http://www.w3.org/1999/xhtml"}
tree = ET.parse(ROOT / "sitemap.xml")
urls = tree.findall("s:url", ns)
for lang, (_, canonical) in URLS.items():
    found = [u for u in urls if u.findtext("s:loc", namespaces=ns) == canonical]
    assert len(found) == 1, (lang, "URL must be in sitemap once")
    record = found[0]
    assert record.findtext("s:lastmod", namespaces=ns) == "2026-10-25"
    alternates = {x.get("hreflang"): x.get("href") for x in record.findall("x:link", ns)}
    for language, (_, url) in URLS.items():
        assert alternates.get(language) == url, (lang, language)

for lang, (path, canonical) in URLS.items():
    directory = "articulos" if lang == "es" else "en/articles"
    index = (ROOT / directory / "index.html").read_text(encoding="utf-8")
    assert index.count(f'href="{canonical}"') == 1, (directory, "index link")
    old = "articulos/descuentos-margen-ventas-adicionales" if lang == "es" else "en/articles/discounts-margin-extra-sales"
    previous = (ROOT / old / "index.html").read_text(encoding="utf-8")
    assert canonical in previous, (lang, "related editorial link")
    assert "Explore Express Advisories" in previous if lang == "en" else "Explorar Asesorías Express" in previous
    assert "How a focused business report works" not in previous
    assert "Ver cómo funciona un microreporte empresarial" not in previous

source = (ROOT / "scripts/enrich_conversion_pages.py").read_text(encoding="utf-8")
assert all(url in source for _, url in URLS.values()), "Builder would erase new links"
discovery = (ROOT / "scripts/build-discovery.py").read_text(encoding="utf-8")
assert all(url.split("jfcarpio.com")[-1] in discovery for _, url in URLS.values()), "RSS generator missing"
rss = ET.parse(ROOT / "feed.xml")
guids = [e.text for e in rss.findall(".//item/guid")]
assert all(url in guids for _, url in URLS.values()), "RSS not up to date"
print("AI SEO cash-flow articles: OK — ES/EN examples, accurate math, source/offer links, sitemap, feed and builder")
