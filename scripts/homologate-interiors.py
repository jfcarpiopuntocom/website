"""Apply the shared reading contract to canonical marketing pages, preserving their content."""
from pathlib import Path
import re,subprocess,json
from private_backup import snapshot
ROOT=Path(__file__).resolve().parents[1]
excluded=('backups/','codex-backups/','og/','friendly123/','visorantiquiebra/','visorgerencial/','visordemarketing/','vuelo/','vuelo-v6/','LEDD-sale/')
names=subprocess.check_output(['git','ls-files','*.html'],cwd=ROOT).decode().splitlines()+['revision-de-lanzamiento/index.html','en/launch-review/index.html']
targets=[]
for name in dict.fromkeys(names):
 if name in ('index.html','es/index.html') or name.startswith(excluded) or re.search(r'backup|BORRAR|indexv0_|abril|safari-broken',name,re.I):continue
 s=(ROOT/name).read_text(encoding='utf8')
 if 'rel="canonical"' not in s and name not in ['blog/index.html','404.html']:continue
 targets.append(name)
snapshot(targets,'interior-editorial')
for name in targets:
 f=ROOT/name;s=f.read_text(encoding='utf8');en=bool(re.search(r'<html[^>]*lang="en',s))
 if '/editorial.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/editorial.css">\n</head>',1)
 def body(m):
  tag=m[0]
  if 'editorial' in tag:return tag
  extra='editorial'+(' publications-reading' if name=='publicaciones/index.html' else '')
  return re.sub(r'class="([^"]*)"',lambda c:'class="'+c[1]+' '+extra+'"',tag) if 'class="' in tag else tag[:-1]+' class="'+extra+'">'
 s=re.sub(r'<body\b[^>]*>',body,s,count=1)
 s=re.sub(r'(?<![-a-z])color\s*:\s*#(?:888888|999999|AAAAAA|CCCCCC|888|999|aaa|ccc)\b','color:#F2F2F2',s,flags=re.I)
 s=re.sub(r'(?<![-a-z])color\s*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(?:0?\.)\d+\s*\)','color:#FFFFFF',s,flags=re.I)
 # Deliberate emphasis for specific existing pain phrases, never automatic word stuffing.
 phrases=['decidir a ciegas','señales de riesgo','datos dispersos','antes de decidir','costos ocultos','información dispersa','decisions in the dark','scattered data','before deciding','hidden costs','risk signals']
 def paragraph(m):
  inner=m[2]
  if '<strong' not in inner:
   for phrase in phrases:
    if phrase in inner:inner=inner.replace(phrase,'<strong>'+phrase+'</strong>',1);break
  return m[1]+inner+m[3]
 s=re.sub(r'(<p\b[^>]*>)(.*?)(</p>)',paragraph,s,flags=re.S)
 if name=='blog/index.html' and 'static-reading' not in s:
  s=s.replace('</head>','<link rel="canonical" href="https://jfcarpio.com/blog/">\n<meta property="og:type" content="website">\n<meta property="og:title" content="Ensayos de economía y empresa | JFCarpio.com">\n<meta property="og:description" content="Ensayos y fuentes de investigación económica, instituciones y empresa. Archivo de JFCarpio.com, Eleutheros y Medium.">\n<meta property="og:url" content="https://jfcarpio.com/blog/">\n<meta property="og:image" content="https://jfcarpio.com/og-jfcarpio-v2.png">\n<link rel="alternate" type="application/rss+xml" title="JFCarpio.com publications" href="https://jfcarpio.com/feed.xml">\n<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@type':'CollectionPage','name':'Ensayos de economía y empresa','url':'https://jfcarpio.com/blog/','inLanguage':'es','author':{'@type':'Person','name':'Juan Fernando Carpio','url':'https://jfcarpio.com/juan-fernando-carpio/'}})+'</script>\n</head>')
  s=s.replace('<blockquote class="quote-text">','<h1 class="reading-heading" style="font-size:clamp(38px,5vw,64px);margin:20px 0;">Ensayos de economía y empresa</h1>\n    <blockquote class="quote-text">',1)
  static='<section class="static-reading accent-green"><h2>Fuentes y lecturas</h2><p>El archivo enlaza investigación y ensayos sobre <strong>economía, instituciones y decisiones empresariales</strong>. Los enlaces siguen disponibles si los feeds externos no cargan.</p><ul><li><a href="/articulos/">Ensayos sobre minerales críticos, reformas económicas y desarrollo</a></li><li><a href="/publicaciones/">Publicaciones, libros y papers</a></li><li><a href="/working-paper-hidden-cost.html">Working paper: costos ocultos y productividad</a></li><li><a href="https://jfcarpio.substack.com/">Archivo de Eleutheros en Substack</a></li><li><a href="https://medium.com/@jfcarpio">Archivo en Medium</a></li><li><a href="/feed.xml">RSS de publicaciones seleccionadas</a></li></ul></section>'
  s=s.replace('</main>',static+'</main>',1)
  s=s.replace('https://jfcarpio.com/#workshops','https://jfcarpio.com/workshops/')
 # A stable commercial path from the end of every interior reading page.
 if 'data-commercial-nav' not in s:
  links=[('/en/apps/' if en else '/apps/','Apps'),('/en/reports/' if en else '/reportes/','USD 100 reports' if en else 'Reportes de USD 100'),('/workshops/' if en else '/talleres/','Workshops' if en else 'Talleres'),('/en/business-viewers/' if en else '/visores/','Dashboards')]
  nav='<nav class="commercial-nav" data-commercial-nav aria-label="'+('Business resources' if en else 'Recursos para tu negocio')+'"><a href="'+('/' if en else '/es/')+'">JFCarpio.com</a>'+''.join('<a href="'+u+'">'+label+'</a>' for u,label in links)+'</nav>'
  s=s.replace('</main>',nav+'</main>',1) if '</main>' in s else s.replace('</body>',nav+'</body>',1)
 f.write_text(s,encoding='utf8')
print('Shared editorial system:',len(targets),'canonical marketing pages')
