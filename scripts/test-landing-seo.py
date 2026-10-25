#!/usr/bin/env python3
"""Focused generated-landing SEO + content integrity guard."""
import ast, json, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
code=(root/"scripts/build-slide-pages.py").read_text(encoding="utf-8")
tree=ast.parse(code)
settings={}
for node in tree.body:
    if isinstance(node,ast.Assign) and isinstance(node.value,ast.Dict):
        for x in node.targets:
            if isinstance(x,ast.Name) and x.id in ("FAQ","META_DESCRIPTIONS"):
                settings[x.id]=ast.literal_eval(node.value)
assert set(settings)=={"FAQ","META_DESCRIPTIONS"}
langs={
    "apps":("apps/index.html","en/apps/index.html"),
    "visores":("visores/index.html","en/business-viewers/index.html"),
    "reportes":("reportes/index.html","en/reports/index.html"),
    "contacto":("contacto/index.html","en/contact/index.html"),
    "trayectoria":("trayectoria/index.html","en/track-record/index.html"),
}
for sid, paths in langs.items():
    for lang,path in zip(("es","en"),paths):
        html=(root/path).read_text(encoding="utf-8")
        desc=settings["META_DESCRIPTIONS"][sid][lang]
        assert html.count("<!DOCTYPE html>")==1,path
        assert f'<meta name="description" content="{desc}">' in html,path
        assert f'<meta property="og:description" content="{desc}">' in html,path
        block=re.search(r'<script type="application/ld[+]json">(.*?)</script>',html,re.S)
        assert block,path
        graph=json.loads(block.group(1))["@graph"]
        page=next((x for x in graph if x.get("@type")=="WebPage"),None)
        assert page and page["description"]==desc,path
        if sid=="contacto":
            data=settings["FAQ"]["contacto"][lang]
            faq=next((x for x in graph if x.get("@type")=="FAQPage"),None)
            assert faq and len(faq["mainEntity"])==len(data),path
            for q,a in data:
                assert f'<summary>{q}</summary><p>{a}</p>' in html,path
        if sid=="apps":
            app=next((x for x in graph if x.get("@type")=="SoftwareApplication"),None)
            assert app and app["name"]=="friendly-123",path
            assert app["offers"]["price"]=="399",path
            assert html.index('class="launch-offer"') < html.index('class="friendly-explainers"'),path
for p in ("revision-de-lanzamiento/index.html","en/launch-review/index.html"):
    html=(root/p).read_text(encoding="utf-8")
    graph=json.loads(re.search(r'<script type="application/ld[+]json">(.*?)</script>',html,re.S).group(1))["@graph"]
    assert any(x.get("@type")=="Service" for x in graph),p
    assert not any(x.get("@type")=="SoftwareApplication" for x in graph),p
ignore=(root/".assetsignore").read_text()
assert "*.md" in ignore and "!pricing.md" in ignore
assert (root/"pricing.md").exists()
assert "jfcarpio.com/pricing.md" in (root/"llms.txt").read_text()
assert "jfcarpio.com/pricing.md" in code
print("Bilingual metadata + FAQ + product/service schema + pricing snapshot: OK")
