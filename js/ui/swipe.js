// LexiLearn – ui/swipe.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

/* ── HÚZHATÓ KÁRTYA MOTOR (pointer események, egér + érintés) ──
   A kártya követi az ujjat, a "Tudom" / "Még nem" pecsét a húzás mértékével jelenik meg.
   Küszöb felett (vagy gyors suhintásnál) kirepül, alatta visszaugrik. Függőleges húzásnál
   elengedjük a görgetést (touch-action: pan-y a CSS-ben). */
const _prefersReducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function attachSwipe(el, { onTap, onSwipe }) {
  if (!el) return;
  let startX = 0, startY = 0, startT = 0, dx = 0;
  let pointerId = null, tracking = false, dragging = false;
  const threshold = () => Math.min(110, el.offsetWidth * 0.28);

  el.addEventListener('pointerdown', e => {
    if (e.button > 0 || el.dataset.swipeLocked) return;
    pointerId = e.pointerId; startX = e.clientX; startY = e.clientY; startT = performance.now();
    dx = 0; tracking = true; dragging = false;
  });

  el.addEventListener('pointermove', e => {
    if (!tracking || e.pointerId !== pointerId) return;
    const mx = e.clientX - startX, my = e.clientY - startY;
    if (!dragging) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(my) > Math.abs(mx)) { tracking = false; return; } // függőleges: görgetés
      dragging = true;
      el.style.transition = 'none';
      try { el.setPointerCapture(pointerId); } catch (_) { /* nem kritikus */ }
    }
    dx = mx;
    setSwipeVisual(el, dx, threshold());
  });

  el.addEventListener('pointerup', e => {
    if (!tracking || e.pointerId !== pointerId) return;
    tracking = false;
    const dt = performance.now() - startT;
    if (!dragging) { if (dt < 500 && onTap) onTap(); return; }
    const fast = Math.abs(dx) / Math.max(dt, 1) > 0.6 && Math.abs(dx) > 40;
    if ((Math.abs(dx) > threshold() || fast) && onSwipe(dx > 0 ? 'right' : 'left') !== false) return;
    resetSwipe(el);
  });

  el.addEventListener('pointercancel', e => {
    if (e.pointerId !== pointerId) return;
    tracking = false;
    if (dragging) resetSwipe(el);
  });
}

function setSwipeVisual(el, dx, threshold) {
  el.style.transform = `translateX(${dx}px) rotate(${(dx * 0.05).toFixed(2)}deg)`;
  const r = Math.max(-1, Math.min(1, dx / threshold));
  el.style.setProperty('--swipe-yes', Math.max(0, r).toFixed(3));
  el.style.setProperty('--swipe-no', Math.max(0, -r).toFixed(3));
}

function resetSwipe(el) {
  el.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
  el.style.transform = '';
  el.style.setProperty('--swipe-yes', 0);
  el.style.setProperty('--swipe-no', 0);
}

function flyOut(el, dir, done) {
  el.dataset.swipeLocked = '1';
  el.style.setProperty(dir === 'right' ? '--swipe-yes' : '--swipe-no', 1);
  el.style.setProperty(dir === 'right' ? '--swipe-no' : '--swipe-yes', 0);
  if (_prefersReducedMotion()) {
    el.style.transition = 'opacity 120ms linear';
    el.style.opacity = '0';
    setTimeout(done, 120);
    return;
  }
  const dist = window.innerWidth * 1.1 * (dir === 'right' ? 1 : -1);
  el.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out';
  el.style.transform = `translateX(${dist}px) rotate(${dir === 'right' ? 16 : -16}deg)`;
  el.style.opacity = '0';
  setTimeout(done, 240);
}

export { _prefersReducedMotion, attachSwipe, flyOut, resetSwipe, setSwipeVisual };
