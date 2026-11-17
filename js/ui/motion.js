// LexiLearn – ui/motion.js (V13.65)
// Nyugodt mikroanimációk segédei: a Kezdőlap számlálói (konzisztencia, napi penzum) a legutóbb mutatott
// értékről pörögnek fel, és egy finom kiemelést kapnak. Az első megjelenítéskor és csökkentett
// mozgásnál nincs animáció: a szám azonnal a helyén van. A jsdom-os tesztekben sem animál
// (ott a szöveg azonnal a végérték, így a rögzített kimenet nem függ az időzítéstől).
const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTestEnv = () => typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
const canAnimate = () => !reduceMotion() && !isTestEnv() && typeof requestAnimationFrame === 'function';

const _last = new Map();
const _runs = new Map();
const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

// A szám a legutóbb mutatott értékről számol fel; igaz, ha animált (nőtt az érték)
function countTo(el, key, value, format = v => String(v)) {
  if (!el) return false;
  const prev = _last.get(key);
  _last.set(key, value);
  if (_runs.has(key)) { cancelAnimationFrame(_runs.get(key)); _runs.delete(key); }
  if (prev === undefined || !(value > prev) || !canAnimate()) { el.textContent = format(value); return false; }
  const start = performance.now();
  const dur = Math.min(900, 420 + (value - prev) * 50);
  const tick = now => {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = format(Math.round(prev + (value - prev) * easeOutQuart(t)));
    if (t < 1) _runs.set(key, requestAnimationFrame(tick)); else _runs.delete(key);
  };
  el.textContent = format(prev);
  _runs.set(key, requestAnimationFrame(tick));
  return true;
}

// Egyszeri kiemelés egy osztállyal (az animáció végén lekerül, így legközelebb újra indulhat)
function pulse(el, cls = 'is-bumped') {
  if (!el || !canAnimate()) return;
  el.classList.remove(cls);
  void el.offsetWidth; // újraindítás
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

export { canAnimate, countTo, pulse, reduceMotion };
