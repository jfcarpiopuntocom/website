"""Adapt JFC's public Brilla pages into one PBIU document. Never edits the source."""
from pathlib import Path
from urllib.parse import urlparse, unquote
import re, json, hashlib, shutil, html
from private_backup import snapshot

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('C:/00 Projects/000 BrillaConsultingGroup')
PAGES=[('index.html','overview','Overview'),('reportes.html','reports','Research reports'),('servicios.html','services','Services'),('financiamiento/index.html','finance','Project finance'),('blog.html','analysis','Analysis'),('pacific-basin-preview.html','preview','Pacific Basin preview'),('pacific-basin-teaser.html','teaser','Pacific Basin research'),('critical-minerals-outlook/index.html','minerals','Critical minerals'),('due-diligence-checklist/index.html','diligence','Due diligence'),('latam-pe-guide/index.html','pe-guide','Private equity guide'),('glosario.html','glossary','Glossary'),('terms.html','terms','Licensing terms'),('privacy.html','privacy','Privacy'),('disclaimer.html','disclaimer','Disclaimer')]
ROUTES={}
for path,key,_ in PAGES:
 ROUTES['/'+path]=key
 if path.endswith('/index.html'): ROUTES['/'+path[:-10]]=key
 elif path=='index.html': ROUTES['/']=key
 else:
  ROUTES['/'+path[:-5]+'/']=key
  ROUTES['/'+path[:-5]]=key

def css_scope(css,scope):
 """Scope selector rules recursively; keep keyframes and font declarations intact."""
 css=re.sub(r'/\*.*?\*/','',css,flags=re.S);css=re.sub(r'(?<![\w-])main(?![\w-])','.pbiu-source-main',css);out=[];pos=0
 while pos<len(css):
  start=css.find('{',pos)
  if start<0: break
  head=css[pos:start].strip();depth=1;end=start+1
  while end<len(css) and depth:
   depth+=(css[end]=='{')-(css[end]=='}');end+=1
  body=css[start+1:end-1]
  if head.startswith(('@media','@supports','@layer')): body=css_scope(body,scope)
  elif not head.startswith('@'):
   sels=[]
   for sel in head.split(','):
    sel=sel.strip()
    sel=re.sub(r'(?<![\w-])(?:html|body|:root)(?![\w-])',scope,sel)
    if not sel.startswith(scope): sel=scope+' '+sel
    sels.append(sel)
   head=','.join(sels)
  out.append(head+'{'+body+'}');pos=end
 return '\n'.join(out)

def body_of(s,old=False):
 if not old and re.search(r'<main\b',s,re.I):
  m=re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S|re.I);b=m[0]
 else:
  b=re.search(r'<body\b[^>]*>(.*?)</body>',s,re.S|re.I)[1]
 for tag in ['script','style','header','nav']:
  b=re.sub(r'<'+tag+r'\b[^>]*>.*?</'+tag+'>','',b,flags=re.S|re.I)
 def wrapper(m):
  tag=m[0].replace('<main','<div',1)
  if 'class=' in tag: tag=tag.replace('class="','class="pbiu-source-main ',1)
  else:tag=tag[:-1]+' class="pbiu-source-main">'
  return re.sub(r'\srole="main"','',tag)
 b=re.sub(r'<main\b[^>]*>',wrapper,b).replace('</main>','</div>')
 return b

def adapt(s,key,path):
 # Replace publisher identity; retain all substantive source sections and claims.
 s=s.replace('Brilla Consulting Group','Pacific Basin Intelligence Unit').replace('Brilla CONSULTING Group','Pacific Basin Intelligence Unit').replace('Brilla Group','PBIU').replace('Brilla-Intel','PBIU research').replace('Brilla','PBIU').replace('brilla-group.com','JFCarpio.com')
 s=s.replace('staff@JFCarpio.com','jfcarpio@gmail.com').replace('593960534003','593999905080')
 s=re.sub(r'<img\b[^>]*src="[^"]*/logo\.png"[^>]*>','',s)
 # Every source ID gets a namespace, including label and accordion references.
 ids=re.findall(r'\bid="([^"]+)"',s)
 for ident in sorted(set(ids),key=len,reverse=True):
  s=s.replace('id="'+ident+'"','id="'+key+'-'+ident+'"')
  s=s.replace('aria-labelledby="'+ident+'"','aria-labelledby="'+key+'-'+ident+'"')
  s=s.replace('aria-controls="'+ident+'"','aria-controls="'+key+'-'+ident+'"').replace('for="'+ident+'"','for="'+key+'-'+ident+'"')
 def attr(m):
  name,value=m[1],html.unescape(m[2]);u=urlparse(value)
  host=u.hostname or ''
  if host.lower() in ['brilla-group.com','jfcarpio.com'] or not u.scheme:
   if value.startswith('#'): return name+'="#'+key+('-'+value[1:] if value[1:] else '')+'"'
   p=u.path if u.scheme or value.startswith('/') else '/'+str((Path(path).parent/u.path).as_posix())
   if p in ROUTES and name=='href':
    dest=ROUTES[p];return name+'="#'+dest+('-'+u.fragment if u.fragment else '')+'"'
   local=SOURCE/unquote(p.lstrip('/'))
   if local.is_file() and local.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif','.mp4','.pdf','.svg'] and local.name!='logo.png':
    rel=local.relative_to(SOURCE);target=ROOT/'assets/pbiu'/rel;target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(local,target);return name+'="/assets/pbiu/'+rel.as_posix()+'"'
  return name+'="'+html.escape(value,quote=True)+'"'
 s=re.sub(r'\b(href|src|poster)="([^"]*)"',attr,s)
 # Inline language is English first, with all Spanish text available via the switch.
 def language(m):
  tag=m[0];v=re.search(r'data-(?:lang|nav)="([^"]+)"',tag)[1]
  tag=re.sub(r'\bclass="([^"]*)"',lambda x:'class="'+' '.join(c for c in x[1].split() if c!='active')+(' active' if v in ['eng','en'] else '')+'"',tag)
  if v in ['eng','en'] and 'class=' not in tag: tag=tag[:-1]+' class="active">'
  return tag
 s=re.sub(r'<[^>]+data-(?:lang|nav)="[^"]+"[^>]*>',language,s)
 s=re.sub(r'(<[^>]*\bid="overview-lv-(?:clp|pen|cop)"[^>]*>)[^<]*',r'\1—',s)
 s=re.sub(r'(<[^>]*\bid="overview-lv-src"[^>]*>)[^<]*',r'\1Exchange rates: loading…',s)
 # No source reveal may hide content when JS or IntersectionObserver is unavailable.
 s=s.replace('edit-reveal','pbiu-reveal')
 if key=='overview': s=re.sub(r'<div([^>]*class="hero-title"[^>]*)>(.*?)</div>',r'<h1\1>\2</h1>',s,flags=re.S)
 if key=='glossary':
  counter=[0]
  def paragraph(m):
   counter[0]+=1;return '<p class="'+('es' if counter[0]%2 else 'en')+'">'
  s=re.sub('\x01',paragraph,s)
 s=s.replace('#analysis-blog-top','#analysis')
 s=re.sub(r'<h1\b','<h2',s).replace('</h1>','</h2>')
 return s

def main():
 original=ROOT/'backups/pbiu-original.html'
 if not original.exists():
  snapshot(['pacific-basin/index.html'],'pbiu-original')
  shutil.copy2(ROOT/'pacific-basin/index.html',original)
 snapshot(['pacific-basin/index.html'],'pbiu-build')
 docs=[];styles=[];manifest=[]
 sources=PAGES+[(str(original),'matrix','Pacific Basin opportunity matrix')]
 for path,key,title in sources:
  f=Path(path) if key=='matrix' else SOURCE/path
  raw=f.read_bytes();s=raw.decode('utf8').replace('\r\n','\n').replace('\r','\n');b=adapt(body_of(s,key=='matrix'),key,path)
  css='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',s,re.S))
  # CSS IDs are scoped to the matching, namespaced source document.
  for ident in sorted(set(re.findall(r'\bid="([^"]+)"',body_of(s,key=='matrix'))),key=len,reverse=True):
   css=re.sub(r'#'+re.escape(ident)+r'(?![\w-])','#'+key+'-'+ident,css)
  def css_asset(m):
   name=m[1];local=SOURCE/name
   if local.is_file():
    target=ROOT/'assets/pbiu'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(local,target);return '/assets/pbiu/'+name
   return m[0]
  css=re.sub(r'https://brilla-group\.com/([a-zA-Z0-9_.-]+\.(?:jpg|png|webp))',css_asset,css)
  css=css.replace('#F5B800','#9CBBEB').replace('#f5b800','#9CBBEB').replace('#F5B801','#9CBBEB')
  styles.append(css_scope(css,'#'+key))
  docs.append('<article class="pbiu-document en-mode" id="'+key+'" aria-label="'+title+'">'+b+'</article>')
  manifest.append({'source':str(f),'key':key,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'lines':raw.count(b'\n'),'adapted_body_sha256':hashlib.sha256(b.encode()).hexdigest()})
 nav=''.join('<a href="#'+key+'">'+title+'</a>' for _,key,title in sources)
 head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pacific Basin Intelligence Unit | JFCarpio.com</title><meta name="description" content="Macroeconomic and sector intelligence, investment research, dashboards and bespoke studies for institutional decisions across the Pacific Basin of Latin America."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://pacific-basin.jfcarpio.com/"><meta property="og:type" content="website"><meta property="og:site_name" content="JFCarpio.com"><meta property="og:title" content="Pacific Basin Intelligence Unit | JFCarpio.com"><meta property="og:description" content="Macroeconomic intelligence, sector research and bespoke studies for institutional investors."><meta property="og:url" content="https://pacific-basin.jfcarpio.com/"><meta property="og:image" content="https://jfcarpio.com/network-pacific.jpg"><meta property="og:image:alt" content="Pacific Basin research by JFCarpio.com"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Pacific Basin Intelligence Unit | JFCarpio.com"><meta name="twitter:image" content="https://jfcarpio.com/network-pacific.jpg"><link rel="icon" href="/assets/brand/jfc-approved-20261008.png"><link rel="stylesheet" href="/assets/pbiu.css"><script defer src="/assets/pbiu.js"></script>'''
 schema={'@context':'https://schema.org','@type':'WebPage','name':'Pacific Basin Intelligence Unit','url':'https://pacific-basin.jfcarpio.com/','inLanguage':['en','es'],'publisher':{'@type':'Organization','name':'JFCarpio.com','url':'https://jfcarpio.com/'}}
 page=head+'<script type="application/ld+json">'+json.dumps(schema)+'</script><style>'+''.join(styles)+'</style><link rel="stylesheet" href="/assets/pbiu.css"></head><body><a class="skip" href="#overview">Skip to research</a><header class="pbiu-header"><a href="https://jfcarpio.com/">JFCarpio.com</a><h1 class="pbiu-page-title">Pacific Basin Intelligence Unit</h1><div><button type="button" id="btn-eng" onclick="setLang(\'eng\')" aria-pressed="true">EN</button><button type="button" id="btn-spa" onclick="setLang(\'spa\')" aria-pressed="false">ES</button></div></header><nav class="pbiu-index" aria-label="Research sections">'+nav+'</nav><main>'+''.join(docs)+'</main><footer class="pbiu-footer"><a href="https://jfcarpio.com/">JFCarpio.com</a> · <a href="mailto:jfcarpio@gmail.com">jfcarpio@gmail.com</a> · <a href="https://consultor.jfcarpio.com/">Small-business consulting: USD 100</a></footer></body></html>'
 page='\n'.join(line.rstrip() for line in page.splitlines())+'\n'
 (ROOT/'pacific-basin/index.html').write_text(page,encoding='utf8')
 (ROOT/'backups/pbiu-source-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
 print('PBIU:',len(docs),'complete source documents;',len(page.encode()),'HTML bytes')
if __name__=='__main__':main()
