"""Bilingual USD 100 microreports, connected to JFC's existing business resources.
Keep the agreed question, price and delivery clock intact. Wider studies are
scoped separately; examples illustrate analysis and never stand in for clients.
"""
import html
from urllib.parse import quote

TOPICS = {
 'es': [
  ('Precios y margen', '¿Me conviene dar ese descuento?', 'Contrastar precio, costo y volumen: cuánto deja cada venta y cuánto tendrías que vender para sostener el margen.', '/apps/', 'Inventario y ventas'),
  ('Inventario y caja', '¿Reponer más stock o liberar el dinero que ya tengo ahí?', 'Revisar rotación, margen y dinero inmovilizado para comparar las dos opciones con tus cifras.', '/apps/', 'Apps para el negocio'),
  ('Clientes y marketing', '¿Qué clientes justifican el esfuerzo de captación?', 'Comparar canales, costo de conseguir un cliente y valor de sus compras. Señalar qué datos faltan antes de aumentar el gasto.', '/visorgerencial/', 'Visor Gerencial'),
  ('Competencia y mercado', '¿Qué debería comprobar antes de entrar en ese nicho?', 'Delimitar una comparación concreta: comprador, alternativas, precios o señales de demanda. Separar lo observado de los supuestos.', '/buscaclientes/', 'BuscaClientes'),
  ('Continuidad del negocio', '¿Qué está agotando la caja aunque sigamos vendiendo?', 'Examinar una señal de riesgo: cobros, pagos, dependencia de un cliente o del dueño. Elegir qué revisar primero.', '/visorantiquiebra/', 'Visor Antiquiebra'),
  ('Equipo y operación', '¿Qué decisión o hábito está frenando el trabajo?', 'Examinar un problema delimitado de coordinación, incentivos o uso de recursos, y la evidencia necesaria para decidir un cambio.', '/talleres/', 'Los dos talleres')
 ],
 'en': [
  ('Pricing and margin', 'Is that discount worth offering?', 'Compare price, cost and volume: what each sale contributes and how much more you would need to sell to preserve it.', '/en/apps/', 'Stock and sales'),
  ('Stock and cash', 'Should I restock or free up money already tied up in stock?', 'Examine turnover, margin and cash tied up in products, using your figures to compare the two options.', '/en/apps/', 'Business apps'),
  ('Customers and marketing', 'Which customers are worth the acquisition effort?', 'Compare channels, customer acquisition cost and purchase value. Identify missing data before increasing the budget.', '/visorgerencial/', 'Management Viewer'),
  ('Competition and market', 'What should I check before entering that niche?', 'Define a specific comparison: buyers, alternatives, prices or signs of demand. Separate observations from assumptions.', '/buscaclientes/', 'BuscaClientes'),
  ('Business continuity', 'Why is cash running out while sales continue?', 'Examine one risk signal: collections, payments or dependency on a customer or founder. Decide what to check first.', '/visorantiquiebra/', 'Anti-bankruptcy Viewer'),
  ('Team and operations', 'Which decision or habit is holding up the work?', 'Examine one specific issue in coordination, incentives or use of resources, and the evidence needed to decide on a change.', '/workshops/', 'The two workshops')
 ]
}

def report_body(lang, old_body):
 en = lang == 'en'
 email = 'mailto:jfcarpio@gmail.com?subject=' + quote('Business microreport — USD 100' if en else 'Microreporte empresarial — USD 100')
 title = 'Your business has a question. Let’s investigate it.' if en else 'Tu negocio tiene una pregunta. Investiguémosla.'
 intro = ('A discount that sells more but leaves less. Stock tying up cash. A new market you want to understand before spending. Bring us <strong>one business question</strong>: we examine the evidence and write an analysis you can use to decide.' if en else 'Un descuento que vende más pero deja menos. Inventario que retiene tu dinero. Un mercado que quieres entender antes de gastar. Trae <strong>una pregunta de tu negocio</strong>: examinamos la evidencia y te entregamos un análisis escrito para decidir.')
 terms = 'One agreed question · 10-minute online interview · up to 72 hours' if en else 'Una pregunta acordada · entrevista online de 10 minutos · hasta 72 horas'
 cta = 'Send us your question' if en else 'Envíanos tu pregunta'
 out = [
  '<div class="microreport">',
  '<header class="report-opening">',
  '<p class="kick">' + ('Business microreports' if en else 'Microreportes empresariales') + '</p>',
  f'<h1>{title}</h1>',
  f'<p class="section-intro">{intro}</p>',
  f'<div class="offer-line"><strong>USD 100</strong><span>{terms}</span></div>',
  f'<p class="report-clock">{"The 72 hours begin after the interview and receipt of all agreed inputs. Online, in English or Spanish, from any country." if en else "Las 72 horas empiezan después de la entrevista y de recibir toda la información acordada. Online, en inglés o español, desde cualquier país."}</p>',
  f'<p class="cta"><a class="btn p" href="{email}">{cta}</a><a class="btn" href="#report-topics">{"Explore the questions" if en else "Explora las preguntas"}</a></p>',
  '</header>',
  '<section id="report-topics" class="report-topics accent-blue" aria-labelledby="topics-title">',
  '<h2 id="topics-title">' + ('Questions that connect the tools to your business' if en else 'Las preguntas que conectan las herramientas con tu negocio') + '</h2>',
  '<p>' + ('The apps record daily activity. Dashboards show signals. Workshops help teams examine decisions. A microreport investigates the question that needs a closer look.' if en else 'Las apps registran el día a día. Los visores muestran señales. Los talleres ayudan al equipo a examinar sus decisiones. El microreporte investiga la pregunta que necesita una mirada más detenida.') + '</p>',
  '<div class="report-question-list">'
 ]
 for label, question, explanation, url, resource in TOPICS[lang]:
  out.append(f'<article class="report-question"><p class="report-topic-label">{html.escape(label)}</p><h3>{html.escape(question)}</h3><p>{html.escape(explanation)}</p><p class="report-resource">{"Related resource" if en else "Recurso relacionado"}: <a href="{url}">{html.escape(resource)}</a></p></article>')
 out += [
  '</div></section>',
  '<section class="report-deliverable accent-green"><h2>' + ('An analysis you can put to work' if en else 'Un análisis que puedas usar') + '</h2>',
  '<p>' + ('You receive a written report on the agreed question. It brings together <strong>findings, sources and assumptions</strong>, compares the relevant options and explains what to do next. Where the evidence is insufficient, it says so.' if en else 'Recibes un reporte escrito sobre la pregunta acordada. Reúne <strong>hallazgos, fuentes y supuestos</strong>, compara las opciones relevantes y explica el siguiente paso. Cuando la evidencia no alcanza, lo señala.') + '</p>',
  '<ul><li>' + ('The question and what information was used.' if en else 'La pregunta y la información utilizada.') + '</li><li>' + ('What the figures or sources show, and what they leave unresolved.' if en else 'Qué muestran las cifras o las fuentes y qué queda sin resolver.') + '</li><li>' + ('Options, tradeoffs and a recommendation tied to the available evidence.' if en else 'Opciones, sus consecuencias y una recomendación ligada a la evidencia disponible.') + '</li><li>' + ('A practical next step and what to check before acting.' if en else 'Un siguiente paso concreto y qué comprobar antes de actuar.') + '</li></ul>',
  '</section>'
 ]
 if en:
  sample = '''<details data-report-example class="report-example"><summary>Read a worked example: the cost of a discount</summary>
<p class="proof-context"><strong>Illustrative example. Not a customer case or a promised result.</strong></p>
<h3>The question</h3><p>A shop sells a product for USD 20. Its variable cost is USD 12. Would a 10% discount help the business?</p>
<h3>What the figures show</h3><p>At the current price, each unit contributes USD 8. At USD 18, it contributes USD 6. Selling 100 units leaves USD 800 before fixed expenses; at the discounted price, 100 units leave USD 600.</p>
<p><strong>The shop would need to sell at least 134 units</strong> at USD 18 to match the original USD 800 contribution. A 10% discount would require roughly 34% more units in this example, assuming the variable cost stays at USD 12.</p>
<h3>What still needs checking</h3><p>The arithmetic does not tell us whether demand would rise that much. We would need to check stock, capacity, returns and any costs omitted from the USD 12. If clearing slow stock is the objective, the decision needs that context too.</p>
<h3>A next step</h3><p>Compare a limited discount test with keeping the price and changing the offer. Define what you will measure before spending. A report on your business would use the agreed inputs and explain the limits of the recommendation.</p></details>'''
 else:
  sample = '''<details data-report-example class="report-example"><summary>Lee una muestra: lo que cuesta un descuento</summary>
<p class="proof-context"><strong>Ejemplo ilustrativo. No es un caso de cliente ni un resultado prometido.</strong></p>
<h3>La pregunta</h3><p>Una tienda vende un producto a USD 20. Su costo variable es USD 12. ¿Le conviene dar un 10% de descuento?</p>
<h3>Lo que muestran las cifras</h3><p>Al precio actual, cada unidad aporta USD 8. A USD 18, aporta USD 6. Vender 100 unidades deja USD 800 antes de gastos fijos; con el descuento, 100 unidades dejan USD 600.</p>
<p><strong>La tienda tendría que vender al menos 134 unidades</strong> a USD 18 para igualar los USD 800 de contribución original. En este ejemplo, un descuento del 10% exige aproximadamente un 34% más de unidades, suponiendo que el costo variable siga en USD 12.</p>
<h3>Lo que falta comprobar</h3><p>La cuenta no dice si la demanda subiría tanto. Habría que revisar inventario, capacidad, devoluciones y costos que hayan quedado fuera de esos USD 12. Si el objetivo es liberar stock lento, esa decisión también necesita contexto.</p>
<h3>Un siguiente paso</h3><p>Comparar una prueba limitada de descuento con mantener el precio y cambiar la oferta. Definir qué se medirá antes de gastar. Un reporte de tu negocio utilizaría los insumos acordados y explicaría los límites de la recomendación.</p></details>'''
 out.append(sample)
 steps = [
  ('Send your question', 'Tell us what you need to decide, your business context and deadline. We confirm that it fits the USD 100 report before you commit.'),
  ('Complete the questionnaire and talk for 10 minutes', 'We ask for the relevant figures or documents and clarify assumptions in a short online interview. Avoid unnecessary personal or customer data.'),
  ('Receive the written analysis', 'Within 72 hours after the interview and complete agreed inputs, receive findings, options and the next step.')
 ] if en else [
  ('Envía tu pregunta', 'Cuéntanos qué necesitas decidir, el contexto de tu negocio y tu plazo. Confirmamos que cabe en el reporte de USD 100 antes de que te comprometas.'),
  ('Completa el cuestionario y conversa durante 10 minutos', 'Te pedimos las cifras o documentos pertinentes y aclaramos los supuestos en una entrevista online breve. Evita datos personales o de clientes innecesarios.'),
  ('Recibe el análisis escrito', 'En hasta 72 horas desde la entrevista y los insumos completos acordados, recibes hallazgos, opciones y el siguiente paso.')
 ]
 out += [
  '<section class="report-process accent-blue"><h2>' + ('How we work on your question' if en else 'Cómo trabajamos tu pregunta') + '</h2><ol class="steps">' + ''.join(f'<li><strong>{html.escape(h)}</strong><p>{html.escape(p)}</p></li>' for h,p in steps) + '</ol></section>',
  '<section class="report-scope"><h2>' + ('Agree on the scope before starting' if en else 'Acordar el alcance antes de empezar') + '</h2><p>' + ('USD 100 covers one well-defined business question. A full market-entry study, extensive financial model or ongoing consulting engagement needs its own scope and budget. We explain that before accepting the work.' if en else 'USD 100 cubre una pregunta empresarial bien delimitada. Un estudio completo de entrada a mercados, un modelo financiero extenso o una consultoría continuada requieren alcance y presupuesto propios. Lo explicamos antes de aceptar el trabajo.') + '</p><p>' + ('The report supports a decision; it does not guarantee sales, profit or investment returns.' if en else 'El reporte aporta evidencia para decidir; no garantiza ventas, utilidades ni retornos de inversión.') + '</p></section>',
  '<section class="report-closing"><h2>' + ('Start with what you need to decide' if en else 'Empieza por lo que necesitas decidir') + '</h2><p>' + ('Send us the question and a few lines about your business. We will confirm the scope and the information needed.' if en else 'Envíanos la pregunta y unas líneas sobre tu negocio. Te confirmaremos el alcance y la información necesaria.') + f'</p><p class="cta"><a class="btn p" href="{email}">{cta}</a><a class="btn" href="{" /en/contact/".strip() if en else "/contacto/"}">' + ('Other contact options' if en else 'Otras formas de contacto') + '</a></p></section>',
  '</div>'
 ]
 return out

def report_schema(lang, canon):
 return {'@type':'Service','@id':canon+'#service','name':'Business microreport' if lang=='en' else 'Microreporte empresarial','serviceType':'Focused business research and consulting','provider':{'@id':'https://jfcarpio.com/#organization'},'areaServed':'Worldwide','availableLanguage':['English','Spanish'],'offers':{'@type':'Offer','price':'100','priceCurrency':'USD','url':canon,'description':'One agreed business question; questionnaire; 10-minute online interview; written report within 72 hours after interview and complete inputs.'}}
