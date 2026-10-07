"""Audit static public pages and sitemap without executing page scripts."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
 def attrs(self,tag):return [a for t,a in self.tags if t==tag]
def audit():
 ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
 urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc',ns)]
 rows=[]
 for url in urls:
  route=urlsplit(url).path;f=ROOT/route.lstrip('/')
  if not f.suffix:
   clean=f.with_suffix('.html')
   f=clean if clean.is_file() else f/'index.html'
  row={'url':url,'file':str(f.relative_to(ROOT)),'issues':[]}
  if not f.exists():row['issues'].append('missing local file');rows.append(row);continue
  if f.suffix!='.html':continue
  s=f.read_text(encoding='utf8');p=Page(s);meta=p.attrs('meta');links=p.attrs('link')
  row['canonical']=next((a.get('href') for a in links if a.get('rel')=='canonical'),None)
  row['description']=next((a.get('content') for a in meta if a.get('name')=='description'),None)
  row['lang']=next((a.get('lang') for a in p.attrs('html')),None)
  row['h1s']=len(p.attrs('h1'));row['doctype']=len(re.findall('<!doctype',s,re.I))
  row['og']=next((a.get('content') for a in meta if a.get('property')=='og:image'),None)
  row['hreflang']={a.get('hreflang'):a.get('href') for a in links if a.get('hreflang')}
  row['missing_alt']=sum('alt' not in a for a in p.attrs('img'))
  row['schema_count']=len(re.findall(r'<script\b[^>]*type=["\']application/ld\+json',s,re.I))
  row['editorial']='editorial.css' in s
  for issue,bad in [('canonical missing',not row['canonical']),('canonical differs from sitemap',row['canonical'] and row['canonical']!=url),('description missing',not row['description']),('H1 count differs from 1',row['h1s']!=1),('DOCTYPE count differs from 1',row['doctype']!=1),('OG image missing',not row['og']),('missing image alt',row['missing_alt']>0),('schema absent from source',not row['schema_count'])]:
   if bad:row['issues'].append(issue)
  rows.append(row)
 return rows
if __name__=='__main__':
 rows=audit();print(json.dumps({'pages':len(rows),'issues':sum(len(r['issues']) for r in rows),'rows':rows},ensure_ascii=False,indent=2))
