// ============================================================
// 7 formas — Landing JS
// Mobile-first, no framework. Safari + WhatsApp safe.
// ============================================================

(function () {
  'use strict';

  // ----- Scroll progress bar -----
  var bar = document.getElementById('progressBar');
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop;
    var height = (doc.scrollHeight - doc.clientHeight) || 1;
    var pct = Math.max(0, Math.min(100, (scrollTop / height) * 100));
    if (bar) bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ----- IntersectionObserver-based reveal -----
  var revealEls = document.querySelectorAll('[data-reveal]');
  // also auto-tag every error and section heading
  document.querySelectorAll('.err, .h2, .lede, .confess__list li, .deliv, .ticket').forEach(function (el) {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
  });
  var allRevealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    allRevealEls.forEach(function (el) { io.observe(el); });
  } else {
    // fallback
    allRevealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ----- Curriculum filter -----
  var chips = document.querySelectorAll('.curr__filter .chip');
  var listItems = document.querySelectorAll('#currList li');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var v = chip.getAttribute('data-video');
      chips.forEach(function (c) { c.classList.remove('chip--on'); });
      chip.classList.add('chip--on');

      listItems.forEach(function (li) {
        li.classList.remove('curr--match');
        if (v === 'all') {
          li.classList.remove('curr--hidden');
        } else if (li.getAttribute('data-video') === v) {
          li.classList.remove('curr--hidden');
          li.classList.add('curr--match');
        } else {
          li.classList.add('curr--hidden');
        }
      });
    });
  });

  // ----- (density control removed; replaced by WhatsApp FAB) -----

  // ----- Hero parallax-ish on scroll (subtle, mobile-safe) -----
  var heroTitle = document.querySelector('.hero__title');
  var lastY = 0;
  function onScroll() {
    if (!heroTitle) return;
    var y = window.pageYOffset || 0;
    if (Math.abs(y - lastY) < 1) return;
    lastY = y;
    if (y < 600) {
      heroTitle.style.transform = 'translateY(' + (y * 0.08) + 'px)';
    }
  }
  // only enable on viewports likely to handle it; mobile too
  window.addEventListener('scroll', onScroll, { passive: true });

  // ----- Quiz score (v1.156) -----
  var fugaChecks = document.querySelectorAll('.fuga-check');
  var quizCount = document.querySelector('.quiz__count');
  var quizResult = document.querySelector('.quiz__result');
  var quizVerdict = document.querySelector('.quiz__verdict');
  var verdicts = {
    0: 'Lee el catálogo abajo. Vas a reconocer al menos dos en cuestión de minutos.',
    1: 'Una basta para perder años. Cerrarla cambia el siguiente sueldo.',
    2: 'Dos al mismo tiempo es el patrón más común. El método las cierra en paralelo.',
    3: 'Eres el lector exacto para el curso. Tres fugas activas son el punto de inflexión: cada mes que siguen abiertas, sale dinero por tres lados a la vez.',
    4: 'Cuatro. Tu sueldo está saliendo por cuatro grietas distintas. Cada nómina que entra repite el mismo circuito.',
    5: 'Cinco. La buena noticia: las cinco se cierran con el mismo marco. Pero cada mes que pasa es otro mes operando con las cinco abiertas.',
    6: 'Seis de siete. No es disciplina lo que te falta, es el sistema. Cada quincena cuenta.',
    7: 'Las siete. Honestidad poco común. Empieza por el video 1 y avanza una fuga por semana.'
  };
  if (fugaChecks.length && quizCount && quizResult && quizVerdict) {
    fugaChecks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var c = document.querySelectorAll('.fuga-check:checked').length;
        quizCount.textContent = c;
        quizResult.setAttribute('data-score', c);
        quizVerdict.textContent = verdicts[c];
      });
    });
  }

  // ----- Smooth-scroll for the hero anchor -----
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 16, behavior: 'smooth' });
        }
      }
    });
  });

})();
