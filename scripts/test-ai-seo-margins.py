"""Focused checks for the owner's original bilingual margin explanation. No network."""
from pathlib import Path
from html.parser import HTMLParser
import json, re, xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1]
URLS={
 'es':'https://jfcarpio.com/articulos/margen-bruto-contribucion-utilidad-neta/',
 'en':'https://jfcarpio.com/en/articles/gross-margin-contribution-margin-net-profit/'
}
class Checker(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.canon=[];self.alts={};self.jsons=[];self.capture=False;self.current=''
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='h1':self.h1+=1
  if t=='link' and d.get('rel')=='canonical':self.canon.append(d.get('href'))
  if t=='link' and d.get('rel')=='alternate':self.alts[d.get('hreflang')]=d.get('href')
  if t=='script' and d.get('type')=='application/ld+json':self.capture=True;self.current=''
 def handle_data(self,data):
  if self.capture:self.current+=data
 def handle_endtag(self,t):
  if t=='script' and self.capture:self.jsons.append(json.loads(self.current));self.capture=False
for lang,url in URLS.items():
 path=('articulos/margen-bruto-contribucion-utilidad-neta/index.html' if lang=='es'
 else 'en/articles/gross-margin-contribution-margin-net-profit/index.html')
 html=(R/path).read_text(encoding='utf-8')
 chk=Checker();chk.feed(html)
 assert html.lstrip().lower().startswith('<!doctype html>') and html.lower().count('<!doctype')==1,path
 assert chk.h1==1 and chk.canon==[url] and chk.alts=={'es':URLS['es'],'en':URLS['en'],'x-default':URLS['en']},path
 assert len(chk.jsons)==1 and {'Article','WebPage','BreadcrumbList'}=={n['@type'] for n in chk.jsons[0]['@graph']},path
 assert html.count('<main')==1 and '</main>' in html and 'openstax.org' in html,path
 assert html.count('<table')==1 and all(k in html for k in ['55 %' if lang=='es' else '55%','40 %' if lang=='es' else '40%','5 %' if lang=='es' else '5%']),path
 assert 'consultor.jfcarpio.com' in html and ('descuentos-margen' in html if lang=='es' else 'discounts-margin' in html),path
 assert 'jfcarpio.com/articulos/ventas-suben-caja-baja/' in html if lang=='es' else 'jfcarpio.com/en/articles/sales-up-cash-down/' in html,path
 idx=(R/('articulos/index.html' if lang=='es' else 'en/articles/index.html')).read_text(encoding='utf-8')
 assert url in idx,path+' missing index link'
 assert url in (R/'feed.xml').read_text(encoding='utf-8')
 print('OK',lang,'HTML, reciprocal locales, article schema, index, citations, illustrative arithmetic')
# Economic arithmetic is independent of the textual claims.
revenue=100*20;goods=100*9;selling=100*3;fixed=600;other=100
assert (revenue-goods, revenue-goods-selling, revenue-goods-selling-fixed-other)==(1100,800,100)
assert ((revenue-goods)*100//revenue,(revenue-goods-selling)*100//revenue,(revenue-goods-selling-fixed-other)*100//revenue)==(55,40,5)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
root=ET.parse(R/'sitemap.xml').getroot()
locs=[n.find('s:loc',ns).text for n in root.findall('s:url',ns)]
assert all(locs.count(url)==1 for url in URLS.values()),'sitemap lacks canonical pair'
assert all(url in (R/'scripts/build-discovery.py').read_text(encoding='utf-8') for url in [u.replace('https://jfcarpio.com','') for u in URLS.values()]),'feed generator lacks pair'
print('AI SEO margin pair and discovery OK')
