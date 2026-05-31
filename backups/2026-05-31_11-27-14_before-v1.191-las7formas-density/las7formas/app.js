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
  function updateParallax() {
    if (!heroTitle) return;
    var y = window.pageYOffset || 0;
    if (Math.abs(y - lastY) < 1) return;
    lastY = y;
    if (y < 600) {
      heroTitle.style.transform = 'translateY(' + (y * 0.08) + 'px)';
    }
  }

  // ----- Quiz score (v1.156) -----
  var formaChecks = document.querySelectorAll('.forma-check');
  var quizCount = document.querySelector('.quiz__count');
  var quizResult = document.querySelector('.quiz__result');
  var quizVerdict = document.querySelector('.quiz__verdict');
  var verdicts = {
    0: 'Cero marcadas significa una de dos cosas: ya saliste de las 7, o todavía no las estás viendo con suficiente nitidez. Sigue leyendo; a veces basta una frase para que el patrón aparezca.',
    1: 'Una marca ya cambia la escena. No estás mirando un defecto personal; estás mirando una instrucción financiera que se puede reemplazar.',
    2: 'Dos marcas suelen trabajar juntas. Cuando separas una de la otra, el patrón pierde fuerza y la primera regla se vuelve obvia.',
    3: 'Tres marcas ya son mapa. El sueldo no desaparece por azar: sigue rutas. Ahora puedes elegir cuál ruta cerrar primero.',
    4: 'Cuatro marcas no piden culpa. Piden orden. El viejo guion está visible; lo siguiente es instalar una respuesta nueva antes de la próxima nómina.',
    5: 'Cinco marcas explican por qué esforzarte más no alcanzaba. No era falta de carácter: eran demasiadas instrucciones viejas ejecutándose al mismo tiempo.',
    6: 'Seis de siete. Buen momento para dejar de negociar contigo cada mes. Una regla visible le gana a una promesa mental.',
    7: 'Las siete. Eso no es sentencia; es claridad. Cuando todo el mapa aparece, también aparece por dónde salir.'
  };
  if (formaChecks.length && quizCount && quizResult && quizVerdict) {
    formaChecks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var c = document.querySelectorAll('.forma-check:checked').length;
        quizCount.textContent = c;
        quizResult.setAttribute('data-score', c);
        quizVerdict.textContent = verdicts[c];
      });
    });
  }

  // ----- Sticky mini-CTA (mobile only, scroll-triggered) — v1.172/v1.173 -----
  var STICKY_KEY = 'las7formas_sticky_dismissed';
  var stickyCta = document.getElementById('stickyCta');
  var stickyCtaClose = document.getElementById('stickyCtaClose');
  var stickyDismissed = false;
  try { stickyDismissed = !!(window.localStorage && localStorage.getItem(STICKY_KEY) === '1'); } catch (e) { /* private mode */ }
  function isMobile() { return window.innerWidth < 720; }
  function updateStickyCta() {
    if (!stickyCta || stickyDismissed) return;
    var y = window.pageYOffset || 0;
    var shouldShow = isMobile() && y > 800;
    if (shouldShow && !stickyCta.classList.contains('is-visible')) {
      stickyCta.classList.add('is-visible');
      stickyCta.setAttribute('aria-hidden', 'false');
    } else if (!shouldShow && stickyCta.classList.contains('is-visible')) {
      stickyCta.classList.remove('is-visible');
      stickyCta.setAttribute('aria-hidden', 'true');
    }
  }
  if (stickyCtaClose) {
    stickyCtaClose.addEventListener('click', function () {
      stickyDismissed = true;
      try { window.localStorage && localStorage.setItem(STICKY_KEY, '1'); } catch (e) { /* private mode */ }
      stickyCta.classList.remove('is-visible');
      stickyCta.setAttribute('aria-hidden', 'true');
    });
  }
  window.addEventListener('resize', updateStickyCta);
  updateStickyCta();

  // ----- rAF-throttled master scroll handler (v1.173) -----
  // Coalesces progress + parallax + sticky CTA into one per-frame update.
  // Replaces 3 separate scroll listeners. Each handler keeps its own
  // early-exit logic for cheap skip on no-op frames.
  var rafTicking = false;
  function onScrollRaf() {
    if (rafTicking) return;
    rafTicking = true;
    window.requestAnimationFrame(function () {
      updateProgress();
      updateParallax();
      updateStickyCta();
      rafTicking = false;
    });
  }
  window.addEventListener('scroll', onScrollRaf, { passive: true });

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
