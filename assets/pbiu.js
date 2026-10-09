/* Bilingual source content remains readable without this enhancement. */
function setLang(value){
 var english=value==='eng'||value==='en';document.querySelectorAll('.pbiu-document').forEach(function(el){el.classList.toggle('en-mode',english)});document.documentElement.lang=english?'en':'es';
 document.querySelectorAll('.pbiu-document [data-lang],.pbiu-document [data-nav]').forEach(function(el){var v=el.dataset.lang||el.dataset.nav;el.classList.toggle('active',english?(v==='eng'||v==='en'):(v==='spa'||v==='es'));el.style.removeProperty('display')});
 document.getElementById('btn-eng').setAttribute('aria-pressed',String(english));document.getElementById('btn-spa').setAttribute('aria-pressed',String(!english));
}
function faq(btn){var answer=btn.nextElementSibling;if(!answer)return;answer.hidden=!answer.hidden;btn.setAttribute('aria-expanded',String(!answer.hidden));answer.classList.toggle('open',!answer.hidden)}
function toggleAcc(id){var a=document.getElementById('diligence-'+id);if(!a)return;a.classList.toggle('open');a.querySelector('.accordion-head').setAttribute('aria-expanded',String(a.classList.contains('open')))}
function switchCountry(country){document.querySelectorAll('#diligence .ctab').forEach(function(el){var match=el.dataset.c===country;el.classList.toggle('active',match);el.setAttribute('aria-selected',String(match))});document.querySelectorAll('#diligence .country-panel').forEach(function(el){el.classList.toggle('active',el.id==='diligence-panel-'+country)})}
function submitLead(event){event.preventDefault();var inputs=event.target.querySelectorAll('input');var subject='PBIU due diligence checklist';var body='Institutional email: '+inputs[0].value+'\nCompany / fund: '+inputs[1].value+'\nPlease send the due diligence checklist.';location.href='mailto:jfcarpio@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);event.target.querySelector('button').textContent=document.documentElement.lang==='es'?'Continúa en tu correo':'Continue in your email app'}
document.querySelectorAll('.accordion-head').forEach(function(el){el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})});
document.querySelectorAll('.faq-a').forEach(function(el){el.hidden=true;var btn=el.previousElementSibling;if(btn){btn.setAttribute('aria-expanded','false');btn.onclick=function(){faq(btn)}}});
document.querySelectorAll('._ed').forEach(function(el){el.textContent='jfcarpio@gmail.com'});
document.querySelectorAll('._oe').forEach(function(el){el.href='mailto:jfcarpio@gmail.com'+(el.dataset.s?'?subject='+encodeURIComponent(el.dataset.s):'')});
document.querySelectorAll('._ow').forEach(function(el){el.href='https://wa.me/593999905080'+(el.dataset.wm?'?text='+encodeURIComponent(el.dataset.wm):'')});
async function refreshFX(){
 var label=document.getElementById('overview-lv-src');if(!label)return;
 try{var response=await fetch('/api/pbiu/fx');if(!response.ok)throw new Error();var d=await response.json();['CLP','PEN','COP'].forEach(function(k){var el=document.getElementById('overview-lv-'+k.toLowerCase());if(el)el.textContent=Number(d.rates[k]).toLocaleString(document.documentElement.lang,{maximumFractionDigits:k==='PEN'?3:0})});label.textContent=d.source+' · '+d.asOf+' · USD · daily / diario';label.title='Indicative daily rates, not trading quotes';label.setAttribute('aria-live','polite')}
 catch(e){['clp','pen','cop'].forEach(function(k){var el=document.getElementById('overview-lv-'+k);if(el)el.textContent='—'});label.textContent=document.documentElement.lang==='es'?'Cotizaciones no disponibles. Reintentar.':'Rates unavailable. Retry.';label.onclick=refreshFX;label.setAttribute('role','button');label.tabIndex=0;label.onkeydown=function(e){if(e.key==='Enter'||e.key===' ')refreshFX()}}
}
refreshFX();setInterval(function(){if(!document.hidden)refreshFX()},300000);

document.querySelectorAll('.traj-toggle').forEach(function(el){el.addEventListener('click',function(){var card=el.closest('.team-card');card.classList.toggle('traj-open');el.setAttribute('aria-expanded',String(card.classList.contains('traj-open')))})});
