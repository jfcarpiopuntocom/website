"""Asesorías Express — generated from the owner's preserved Gamma source.
No runtime network calls. Bilingual HTML is editorially reviewed; Spanish copy
is an unchanged textual transfer of the source, with normalized contact links.
"""
import json
from pathlib import Path

_CONTENT = Path(__file__).with_name('asesorias-express-content.json')

def express_body(lang):
    data = json.loads(_CONTENT.read_text(encoding='utf-8'))
    if lang not in ('es', 'en'):
        raise ValueError('Unsupported advisory language')
    return [data[lang]]

def express_schema(lang, canon):
    en = lang == 'en'
    return {
        '@type': 'Service',
        '@id': canon + '#service',
        'name': 'Express Business Advisory — five focused sessions' if en else '5 Asesorías Express para pequeños negocios',
        'serviceType': 'Express business advisory' if en else 'Asesorías Express para pequeños negocios',
        'description': 'Five practical advisory sessions covering CX, commercial strategy, digital transformation, business finances and organic customer acquisition.' if en else 'Cinco asesorías: experiencia del cliente, estrategia comercial, transformación digital, finanzas y embudos de valor para atracción orgánica.',
        'provider': {'@id': 'https://jfcarpio.com/#organization'},
        'areaServed': 'Worldwide', 'availableLanguage': ['English', 'Spanish'],
        'offers': {'@type': 'Offer', 'price': '100', 'priceCurrency': 'USD', 'url': canon,
                   'description': 'One advisory session, 2–3 total working hours depending on the topic, by phone/audio; includes an actionable recommendations report.'}
    }
