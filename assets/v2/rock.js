/* rock.js — capa de movimiento con anime.js v4 (MIT, /assets/v2/vendor/anime.umd.min.js).
   Reglas: con prefers-reduced-motion no se anima nada; solo transform/opacity; cada elemento una vez
   (data-anim); si algo falla, el contenido ya está visible (los estados iniciales los pone este script
   justo antes de animar). Convive con tema.js (.rv, data-n, data-glow): no toca esos elementos. */
(function () {
  "use strict";
  var A = window.anime;
  if (!A || !A.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ease = "outExpo", apple = A.cubicBezier ? A.cubicBezier(0.16, 1, 0.3, 1) : "outExpo";

  // Envuelve cada palabra (solo nodos de texto, conserva los <span> de color) en .rw > .rwi
  function palabras(el) {
    var out = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement("span"), i = document.createElement("span");
            w.className = "rw"; i.className = "rwi"; i.textContent = p; w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    })(el);
    return out;
  }
  function una(el) { if (!el || el.dataset.anim) return false; el.dataset.anim = "done"; return true; }
  function alVer(sel, fn, umbral) {
    var els = document.querySelectorAll(sel); if (!els.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); if (una(e.target)) fn(e.target); } });
    }, { threshold: umbral || 0.25, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }
  var css = document.createElement("style");
  css.textContent = ".rw{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.06em;margin-bottom:-.06em}" +
    ".rwi{display:inline-block;will-change:transform}" +
    ".rk-ring{position:absolute;inset:0;border-radius:inherit;border:2px solid #2176FF;pointer-events:none}";
  document.head.appendChild(css);

  // 1. Título principal: entra palabra por palabra; lo resaltado llega último con un leve zoom
  var h1 = document.querySelector("header h1");
  if (una(h1)) {
    var ws = palabras(h1), hl = h1.querySelectorAll(".hl .rwi, .b .rwi");
    var tl = A.createTimeline({ defaults: { ease: apple } });
    tl.add(ws, { translateY: ["110%", "0%"], duration: 900, delay: A.stagger(55) })
      .add(hl, { scale: [0.9, 1], duration: 700, delay: A.stagger(40) }, "-=500");
    var verbs = document.querySelectorAll("nav.verbs a");
    if (verbs.length) A.animate(verbs, { opacity: [0, 1], translateY: [14, 0], duration: 700, delay: A.stagger(70, { start: 650 }), ease: ease });
  }

  // 2. Títulos de sección: palabra por palabra al entrar
  alVer("main h2, section h2", function (h) {
    A.animate(palabras(h), { translateY: ["110%", "0%"], duration: 800, delay: A.stagger(28), ease: apple });
  }, 0.4);

  // 3. Etiquetas mono: efecto «descifrado» (Space Mono) al entrar
  var glifos = "0123456789·/#%+=<>";
  alVer(".mono.k, .verb", function (el) {
    var final = el.textContent, n = final.length, obj = { p: 0 };
    A.animate(obj, { p: 1, duration: 650, ease: "linear", onUpdate: function () {
      var k = Math.floor(obj.p * n), s = final.slice(0, k);
      for (var i = k; i < n; i++) s += final[i] === " " ? " " : glifos[(Math.random() * glifos.length) | 0];
      el.textContent = s;
    }, onComplete: function () { el.textContent = final; } });
  }, 0.6);

  // 4. Tarjetas de las áreas: la foto respira al pasar el cursor (resorte)
  var resorte = A.createSpring ? A.createSpring({ stiffness: 180, damping: 14 }) : ease;
  document.querySelectorAll(".card.practice, .fcard").forEach(function (card) {
    var img = card.querySelector(".ph img"); if (!img || !matchMedia("(hover: hover)").matches) return;
    card.addEventListener("mouseenter", function () { A.animate(img, { scale: 1.06, duration: 600, ease: resorte }); });
    card.addEventListener("mouseleave", function () { A.animate(img, { scale: 1, duration: 600, ease: resorte }); });
  });

  // 5. Cinco preguntas: entran en cascada
  alVer("#preguntas", function (sec) {
    var items = sec.querySelectorAll("li, article, details, .q, .item");
    if (items.length) A.animate(items, { opacity: [0, 1], translateY: [24, 0], duration: 700, delay: A.stagger(90), ease: ease });
  }, 0.2);

  // 6. Testimonios: llegan desde la izquierda
  alVer("#firma blockquote", function (q) {
    A.animate(q, { opacity: [0, 1], translateX: [-28, 0], duration: 900, ease: apple });
  }, 0.4);

  // 7. Botón de WhatsApp: dos pulsos al entrar y la flecha se adelanta al pasar el cursor
  alVer("#oficina .btn.c", function (b) {
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    [0, 380].forEach(function (d) {
      var r = document.createElement("span"); r.className = "rk-ring"; b.appendChild(r);
      A.animate(r, { scale: [1, 1.35], opacity: [0.55, 0], duration: 1100, delay: 300 + d, ease: "outQuad",
        onComplete: function () { r.remove(); } });
    });
  }, 0.6);
})();
