"""Render both home locales from the approved reel dictionary; no JS is needed to read them."""
from pathlib import Path
import re,json,html,ast
from private_backup import snapshot
ROOT=Path(__file__).resolve().parents[1]
def render(source,lang,T):
 source=source.replace("url('assets/fonts/", "url('/assets/fonts/")
 HL=json.loads(re.search(r'const HL=(\{.*?\});\n',source,re.S)[1])
 def content(m):
  key=m['key'];text=html.escape(T[lang].get(key,html.unescape(re.sub(r'</?mark[^>]*>','',m['body']))))
  # Claude 2026-10-07: subrayados de color (HL en index.html), igual que jfcHL() del reel, para lectura sin JS.
  for w,c in ([] if m['tag'] in ['h1','h2','h3','h4','h5','h6'] or re.search(r'<h[1-6][^>]*>[^<]*$',source[:m.start()]) else HL.get(lang,{}).get(key,[])):
   x=html.escape(w);i=text.find(x)
   if i>=0:text=text[:i]+'<mark class="hl hl-'+c+'">'+x+'</mark>'+text[i+len(x):]
  return m['open']+text+m['close']
 source=re.sub(r'(?P<open><(?P<tag>[a-z0-9]+)\b[^>]*\bdata-t="(?P<key>k[0-9]+)"[^>]*>)(?P<body>.*?)(?P<close></(?P=tag)>)',content,source,flags=re.S)
 def attributes(m):
  tag=m[0]
  for attr,key in re.findall(r'data-ta-([a-z-]+)="(k[0-9]+)"',tag):
   if key in T[lang]:tag=re.sub(r'(?<![a-z-])'+re.escape(attr)+r'="[^"]*"',attr+'="'+html.escape(T[lang][key],quote=True)+'"',tag)
  return tag
 source=re.sub(r'<[^>]+data-ta-[^>]+>',attributes,source)
 source=re.sub(r'<html\b[^>]*>',f'<html lang="{lang}">',source,count=1)
 title='JFCarpio.com | Business apps, USD 100 reports and workshops' if lang=='en' else 'JFCarpio.com | Apps, reportes de USD 100 y talleres'
 desc='Business apps, focused USD 100 consulting reports delivered within 72 hours, corporate workshops and custom dashboards. Online in English and Spanish.' if lang=='en' else 'Apps, reportes empresariales de USD 100 entregados en hasta 72 horas, talleres corporativos y dashboards a medida. Trabajo online en inglés y español.'
 source=re.sub(r'<title>.*?</title>',f'<title>{title}</title>',source,count=1,flags=re.S)
 for attr,name,value in [('name','description',desc),('property','og:title',title),('property','og:description',desc),('name','twitter:title',title),('name','twitter:description',desc),('property','og:locale','en_US' if lang=='en' else 'es_EC')]:
  source=re.sub(r'<meta '+attr+'="'+name+r'" content="[^"]*">',f'<meta {attr}="{name}" content="{html.escape(value,quote=True)}">',source,count=1)
 canon='https://jfcarpio.com/'+('es/' if lang=='es' else '')
 source=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="{canon}">',source,count=1)
 source=re.sub(r'<link rel="alternate" hreflang="[^"]*"[^>]*>\s*','',source)
 alternates='<link rel="alternate" hreflang="en" href="https://jfcarpio.com/">\n<link rel="alternate" hreflang="es" href="https://jfcarpio.com/es/">\n<link rel="alternate" hreflang="x-default" href="https://jfcarpio.com/">\n'
 source=source.replace(f'<link rel="canonical" href="{canon}">',f'<link rel="canonical" href="{canon}">\n'+alternates)
 source=re.sub(r'<meta property="og:url" content="[^"]*">',f'<meta property="og:url" content="{canon}">',source)
 def schema(m):
  data=json.loads(m[2])
  for node in data.get('@graph',[]):
   if node.get('@type')=='WebSite':node.update(url=canon,inLanguage=lang)
   if node.get('@type') in ['WebPage','CollectionPage']:node.update(url=canon,inLanguage=lang,name=title,description=desc)
   if node.get('@type')=='Organization':node['description']=desc
  return m[1]+json.dumps(data,ensure_ascii=False,indent=1)+m[3]
 source=re.sub(r'(<script[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)
 if 'application/rss+xml' not in source:source=source.replace('</head>','<link rel="alternate" type="application/rss+xml" title="JFCarpio.com selected publications" href="https://jfcarpio.com/feed.xml">\n</head>',1)
 def selected(m):
  tag=m[0];which=re.search(r'data-lang="(es|en)"',tag)[1]
  return re.sub(r'aria-pressed="[^"]*"','aria-pressed="'+str(which==lang).lower()+'"',tag)
 source=re.sub(r'<button\b[^>]*data-lang="(?:es|en)"[^>]*>',selected,source)
 source=re.sub(r'<a\b[^>]*\bdata-report-route[^>]*>',lambda m:re.sub(r'href="[^"]*"','href="'+('/en/reports/' if lang=='en' else '/reportes/')+'"',m[0]),source)
 return source
def main():
 source=(ROOT/'index.html').read_text(encoding='utf8');T=json.loads(re.search(r'const T=(\{.*?\});\n',source,re.S)[1])
 for lang,values in re.findall(r'Object.assign\(T\.(en|es),\s*(\{[^\n]*?\})\);',source):
  values=re.sub(r'\b(k\d+)\s*:',r'"\1":',values)
  T[lang].update(ast.literal_eval(values))
 snapshot(['index.html','es/index.html'],'home-locales')
 (ROOT/'index.html').write_text(render(source,'en',T),encoding='utf8')
 (ROOT/'es').mkdir(exist_ok=True);(ROOT/'es/index.html').write_text(render(source,'es',T),encoding='utf8')
 print('Static home locales: English / and Spanish /es/')
if __name__=='__main__':main()
