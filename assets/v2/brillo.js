// brillo.js · partículas con bloom real (three.js + pmndrs postprocessing) dentro de un contenedor oscuro.
// Uso: brillo(lienzo, { colores: [...], modo: 'subir' | 'estallido', cantidad, fondo, cuadrados })
// Respeta prefers-reduced-motion, se pausa fuera de pantalla y, sin WebGL, retira el lienzo sin romper nada.
export async function brillo(cv, o = {}) {
  if (!cv || matchMedia('(prefers-reduced-motion:reduce)').matches) { cv?.remove(); return null; }
  try {
    const THREE = await import('three');
    const { EffectComposer, RenderPass, EffectPass, BloomEffect } = await import('postprocessing');
    const N = o.cantidad || 120, cols = (o.colores || ['#E8A020']).map(c => new THREE.Color(c));
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'low-power' });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene(); scene.background = new THREE.Color(o.fondo || '#060E1D');
    const cam = new THREE.PerspectiveCamera(50, 1, .1, 100); cam.position.z = 12;
    let tex = null;
    if (!o.cuadrados) { const t = document.createElement('canvas'); t.width = t.height = 64; const g = t.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(.4, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); tex = new THREE.CanvasTexture(t); }
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = [];
    const nace = (i, centro) => {
      if (o.modo === 'estallido' && centro) { pos.set([0, -1, 0], i * 3); const a = Math.random() * Math.PI * 2, s = .05 + Math.random() * .16; vel[i] = [Math.cos(a) * s, Math.sin(a) * s + .05, 0]; }
      else { pos.set([(Math.random() - .5) * 16, -6 - Math.random() * 4, (Math.random() - .5) * 4], i * 3); vel[i] = [(Math.random() - .5) * .006, .012 + Math.random() * .028, 0]; }
    };
    for (let i = 0; i < N; i++) { nace(i, true); if (o.modo !== 'estallido') pos[i * 3 + 1] = (Math.random() - .5) * 12; const c = cols[i % cols.length]; col.set([c.r, c.g, c.b], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: o.cuadrados ? .2 : .32, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    scene.add(new THREE.Points(geo, mat));
    const comp = new EffectComposer(r, { frameBufferType: THREE.HalfFloatType });
    comp.addPass(new RenderPass(scene, cam));
    comp.addPass(new EffectPass(cam, new BloomEffect({ intensity: o.intensidad || 1.5, luminanceThreshold: .1, luminanceSmoothing: .35, mipmapBlur: true, radius: .7 })));
    const box = cv.parentElement, size = () => { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; r.setSize(w, h, false); comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(box); size();
    let vis = false, t = 0;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) requestAnimationFrame(loop); }).observe(box);
    function loop() {
      if (!vis) return; t++;
      for (let i = 0; i < N; i++) {
        const v = vel[i]; pos[i * 3] += v[0]; pos[i * 3 + 1] += v[1];
        if (o.modo === 'estallido') { v[1] -= .0016; v[0] *= .992; if (pos[i * 3 + 1] < -7) nace(i, false); }
        else if (pos[i * 3 + 1] > 7) nace(i, false);
      }
      geo.attributes.position.needsUpdate = true; mat.opacity = o.modo === 'estallido' ? Math.max(.55, 1 - t / 400) : .9;
      comp.render(); requestAnimationFrame(loop);
    }
    cv.classList.add('on');
    return { reiniciar() { t = 0; for (let i = 0; i < N; i++) nace(i, true); } };
  } catch (e) { cv.remove(); console.warn('Brillo desactivado:', e.message); return null; }
}
