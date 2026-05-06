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
