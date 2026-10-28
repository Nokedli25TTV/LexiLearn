// LexiLearn – ui/viewport-fix.js
// V13.20: iOS 26 kezdőképernyős appban (standalone) a billentyűzet bezárása után a látható
// képernyőterület (visualViewport) eltolva marad a layout viewporthoz képest (offsetTop > 0), ezért a
// position: fixed sávok (navigáció, gyakorló dokk, értesítés) görgetéskor a képernyő közepére
// csúsznak (WebKit-hiba, FB20249802). Az eltolást mérjük, és a sávokat ugyanennyivel visszatoljuk
// (--vv-shift, a CSS translate tulajdonsága, így a meglévő transform-okat nem írja felül).
// Nyitott billentyűzetnél nem tolunk: az ottani viselkedés változatlan. Safariban (nem standalone)
// a viewportot a böngésző kezeli, ott nem avatkozunk be.
const KEYBOARD_MIN_PX = 120; // ennyinél kisebb magasság-különbség még nem billentyűzet (pl. kerekítés)

const isStandalone = () => (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
  || window.navigator.standalone === true;

// A sávok szükséges eltolása px-ben (0, ha nincs mit javítani)
function viewportShift(vv, layoutHeight) {
  if (!vv || !layoutHeight) return 0;
  if (layoutHeight - vv.height > KEYBOARD_MIN_PX) return 0; // nyitva a billentyűzet
  const shift = Math.round(vv.offsetTop + vv.height - layoutHeight);
  return Math.abs(shift) < 1 ? 0 : shift;
}

let _queued = false;
function syncViewportShift() {
  _queued = false;
  const shift = viewportShift(window.visualViewport, document.documentElement.clientHeight);
  const value = `${shift}px`;
  if (document.documentElement.style.getPropertyValue('--vv-shift') !== value) {
    document.documentElement.style.setProperty('--vv-shift', value);
  }
}
const queueSync = () => { if (!_queued) { _queued = true; requestAnimationFrame(syncViewportShift); } };

function initViewportFix() {
  const vv = window.visualViewport;
  if (!vv || !isStandalone()) return false;
  vv.addEventListener('resize', queueSync);
  vv.addEventListener('scroll', queueSync);
  window.addEventListener('scroll', queueSync, { passive: true });
  // A billentyűzet bezárása után egy apró görgetés gyakran magától is helyreteszi a viewportot
  document.addEventListener('focusout', () => setTimeout(() => {
    if (!document.activeElement || !document.activeElement.matches('input, textarea, select')) {
      window.scrollTo(window.scrollX, window.scrollY);
      queueSync();
    }
  }, 60));
  syncViewportShift();
  return true;
}

export { initViewportFix, syncViewportShift, viewportShift };
