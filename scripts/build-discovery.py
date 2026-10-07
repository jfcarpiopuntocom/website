"""Maintain static locale discovery and a small, truthful first-party RSS directory."""
from pathlib import Path
import re, json, xml.etree.ElementTree as ET
from private_backup import snapshot
ROOT=Path(__file__).resolve().parents[1]
SITE='https://jfcarpio.com'
def main():
 snapshot(['sitemap.xml','feed.xml'],'discovery')
 ns='http://www.sitemaps.org/schemas/sitemap/0.9'; xn='http://www.w3.org/1999/xhtml'
 ET.register_namespace('',ns);ET.register_namespace('xhtml',xn)
 raw=(ROOT/'sitemap.xml').read_text(encoding='utf8')
 homes=[SITE+'/',SITE+'/es/']
 raw=re.sub(r'\s*<url\b[^>]*>.*?</url>',lambda m:'' if any('<loc>'+home+'</loc>' in m[0] for home in homes) else m[0],raw,flags=re.S)
 blocks=[]
 for home in reversed(homes):
  url=ET.Element('{'+ns+'}url');ET.SubElement(url,'{'+ns+'}loc').text=home
  ET.SubElement(url,'{'+ns+'}lastmod').text='2026-10-07'
  for lang,href in [('en',homes[0]),('es',homes[1]),('x-default',homes[0])]:ET.SubElement(url,'{'+xn+'}link',{'rel':'alternate','hreflang':lang,'href':href})
  blocks.insert(0,ET.tostring(url,encoding='unicode'))
 raw=re.sub(r'(<urlset\b[^>]*>)',lambda m:m[1]+'\n  '+'\n  '.join(blocks),raw,count=1)
 # Each offer host publishes its own reciprocal locale sitemap. The hub
 # sitemap contains only hub URLs, rather than redirected offer URLs.
 routes=json.loads((ROOT/'scripts/landing-routes.json').read_text(encoding='utf8'))
 moved={SITE+route[lang] for route in routes for lang in ['en','es'] if route[lang]}
 raw=re.sub(r'\s*<url\b[^>]*>.*?</url>',lambda m:'' if any('<loc>'+url+'</loc>' in m[0] for url in moved) else m[0],raw,flags=re.S)
 ET.fromstring(raw)
 (ROOT/'sitemap.xml').write_text(raw,encoding='utf8')
 rss=ET.Element('rss',{'version':'2.0'});channel=ET.SubElement(rss,'channel')
 for key,value in [('title','JFCarpio.com — selected publications'),('link',SITE+'/publicaciones/'),('description','A curated directory of first-party research and publications. Spanish resources are labeled in their original language.'),('language','es')]:ET.SubElement(channel,key).text=value
 for title,route,description in [('Publicaciones, libros y papers','/publicaciones/','Archivo de investigación, columnas, libros y papers de Juan Fernando Carpio.'),('Working paper: hidden costs and productivity','/working-paper-hidden-cost','Research on hidden costs and productivity.'),('10 Lecciones de Economía','/libro/','Información sobre el libro de Juan Fernando Carpio.'),('Ensayos sobre economía y empresa','/articulos/','Selección de ensayos sobre desarrollo, reformas e instituciones.')]:
  item=ET.SubElement(channel,'item')
  for key,value in [('title',title),('link',SITE+route),('guid',SITE+route),('description',description)]:ET.SubElement(item,key).text=value
 ET.indent(rss,space='  ');ET.ElementTree(rss).write(ROOT/'feed.xml',encoding='utf-8',xml_declaration=True)
 print('Locale sitemap and first-party RSS directory updated')
if __name__=='__main__':main()
