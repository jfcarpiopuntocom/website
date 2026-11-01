// JFCarpio.com · interruptor de tema y efectos comunes.
// El tema inicial lo fija el script en línea del <head> (antes de pintar) para que nunca parpadee.
(function () {
  const root = document.documentElement, KEY = 'jfc-tema';
  const meta = document.querySelector('meta[name=theme-color]');
  const set = (t, guardar) => {
    root.dataset.theme = t;
    if (meta) meta.content = t === 'dark' ? '#060E1D' : '#FAFAF7';
    document.querySelectorAll('.tema').forEach(b => { b.setAttribute('aria-pressed', t === 'dark'); b.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'); });
    if (guardar) try { localStorage.setItem(KEY, t); } catch (e) {}
  };
  set(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
  document.querySelectorAll('.tema').forEach(b => b.addEventListener('click', () => { root.classList.add('anim'); set(root.dataset.theme === 'dark' ? 'light' : 'dark', true); }));
  // otra pestaña cambió el tema: seguirla
  addEventListener('storage', e => { if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) set(e.newValue, false); });

  document.querySelectorAll('.menu nav a').forEach(a => a.addEventListener('click', () => a.closest('details').open = false));
  document.querySelectorAll('.track').forEach(t => t.innerHTML += t.innerHTML);
  const red = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // fondo de oficina: fundido lento entre fotos
  const sl = [...document.querySelectorAll('.bg i')];
  if (sl.length) { let i = 0; sl[0].classList.add('on'); if (!red && sl.length > 1) setInterval(() => { sl[i].classList.remove('on'); i = (i + 1) % sl.length; sl[i].classList.add('on'); }, 9000); }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  const cnt = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cnt.unobserve(e.target); if (red) return;
    const el = e.target, n = +el.dataset.n, t0 = performance.now();
    const f = t => { const p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .6 });
  document.querySelectorAll('[data-n]').forEach(el => cnt.observe(el));
  document.querySelectorAll('[data-glow]').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));
})();
