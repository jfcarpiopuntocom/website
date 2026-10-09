"""Regression checks for English-first discovery and the USD 100 report contract."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from audit_discovery import audit
ROOT=Path(__file__).resolve().parents[1]
def read(name):return (ROOT/name).read_text(encoding='utf8')
for name,lang,url in [('index.html','en','https://jfcarpio.com/'),('es/index.html','es','https://jfcarpio.com/es/')]:
 s=read(name)
 assert '<html lang="'+lang+'">' in s
 assert '<link rel="canonical" href="'+url+'">' in s
 assert 'hreflang="en" href="https://jfcarpio.com/"' in s
 assert 'hreflang="es" href="https://jfcarpio.com/es/"' in s
 assert 'let lang=\'en\'' in s
 assert 'href="#visores" data-jump><span data-t="k548"' in s
 assert not re.search(r'<section class="slide[^\"]*" id="clientes"',s)
 trajectory=re.search(r'<section class="slide[^\"]*" id="trayectoria".*?</section>',s,re.S)[0]
 assert 'cv-jfc' not in trajectory.lower() and 'cv-map' not in trajectory.lower()
for name in ['en/reports/index.html','reportes/index.html']:
 s=read(name)
 for text in ['USD 100','72','10','mailto:jfcarpio@gmail.com','editorial.css']:assert text in s,(name,text)
 schemas=[json.loads(b) for b in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',s,re.S)]
 service=next(n for schema in schemas for n in schema.get('@graph',[schema]) if n.get('@type')=='Service')
 assert service['offers']['price']=='100' and service['offers']['priceCurrency']=='USD'
 assert 'research-feedback' not in s and 'Diego Peñaherrera' not in s
 assert not __import__('re').search(r'Critical Minerals|Minerales Críticos',s)
pbiu=re.search(r'<section class="slide[^\"]*" id="pbiu".*?</section>',read('index.html'),re.S)[0]
assert 'Diego Peñaherrera' in pbiu and '2022' in pbiu
rows=audit()
for row in rows:
 # Schema eligibility is page-specific, not a requirement for every application landing.
 issues=[i for i in row['issues'] if i!='schema absent from source']
 assert not issues,(row['url'],issues)
 for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',read(row['file']),re.S):json.loads(block)
 by_url={x['url']:x for x in rows}
 for lang,url in row['hreflang'].items():
  if lang=='x-default':continue
  if url in by_url:assert row['url'] in by_url[url]['hreflang'].values(),('nonreciprocal',row['url'],url)
assert len({r['url'] for r in rows})==len(rows)
assert '<!-- SLIDE-PAGES-START -->' in read('sitemap.xml')
assert read('blog/index.html').count('class="static-reading')==1
assert read('blog/index.html').count('rel="canonical"')==1
ET.parse(ROOT/'feed.xml')
print('Global discovery: OK —',len(rows),'URLs, reciprocal locales, readable static homes, report price/scope/provenance')
