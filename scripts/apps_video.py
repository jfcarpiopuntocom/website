"""Optional Friendly explainers inside the three-app overview, never autoplay."""
import html,json
from pathlib import Path
SITE='https://jfcarpio.com'
def apps_video(lang,translate=False):
 es=lang=='es'
 def text(key,value):return f'<span data-t="{key}">{html.escape(value)}</span>' if translate else html.escape(value)
 title='friendly-123, en cinco colores' if es else 'friendly-123, in five colors'
 intro='Dos videos en inglés, con subtítulos: una introducción de 30 segundos y una explicación de 60 segundos.' if es else 'Two English videos with captions: a 30-second introduction and a 60-second explanation.'
 out=f'<section class="friendly-explainers" aria-label="friendly-123"><h2>{text("k560",title)}</h2><p>{text("k561",intro)}</p>'
 for duration in [30,60]:
  label=(f'Ver {duration} segundos' if es else f'Watch {duration} seconds');key='k562' if duration==30 else 'k563'
  out+=f'<details><summary>{text(key,label)}</summary><video controls playsinline preload="none" poster="{SITE}/media/friendly-poster-{duration}.jpg" aria-label="friendly-123 {duration}s"><source src="{SITE}/media/friendly-123-{duration}s.mp4" type="video/mp4"><track kind="captions" src="{SITE}/media/friendly-123-{duration}s.vtt" srclang="en" label="English"><a href="{SITE}/media/friendly-123-{duration}s.mp4">MP4</a></video><p><a href="{SITE}/media/friendly-123-{duration}s.mp4" download>{text("k564","Descargar MP4" if es else "Download MP4")}</a></p></details>'
 out+='<details><summary>'+text('k565','Leer la narración inglesa' if es else 'Read the English narration')+'</summary><p>Counting stock should not take over your day. Friendly one two three puts your business in five colors. Green is healthy. Gold shows opportunity. Orange needs a check. Red is urgent. Black is sleeping. Keep stock, sales and commissions together. Try the demo. No signup. No card.</p></details></section>'
 return out
