// LexiLearn – ui/viewport-fix.js
// V13.20: iOS 26 kezdőképernyős appban (standalone) a billentyűzet bezárása után a látható
// képernyőterület (visualViewport) eltolva marad (az offsetTop nem áll vissza), ezért a
// position: fixed sávok (navigáció, gyakorló dokk, értesítés) görgetéskor feljebb, a képernyő
// közepére csúsznak (WebKit-hiba, FB20249802). Az eltolás NÖVEKMÉNYÉT mérjük a nyugalmi
// állapothoz képest, és a sávokat ugyanennyivel visszatoljuk (--vv-shift, a CSS translate
// tulajdonsága, így a meglévő transform-okat nem írja felül).
// V13.21: semmilyen magassághoz (clientHeight) nem hasonlítunk – iOS 26 standalone módban az eltér a
// látható magasságtól, és nyugalomban is lejjebb tolta a sávokat. Nyugalomban az eltolás így mindig 0.
// Nyitott billentyűzetnél nem tolunk; Safariban (nem standalone) a böngésző kezeli, ott nem avatkozunk be.
const KEYBOARD_MIN_PX = 120; // ennyinél kisebb magasságcsökkenés még nem billentyűzet

const isStandalone = () => (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
  || window.navigator.standalone === true;

// rest: a legkisebb látott offsetTop zárt billentyűzetnél; full: a legnagyobb látott magasság (tájolásonként)
const _state = { rest: null, full: 0, width: 0 };

// A sávok szükséges eltolása px-ben (0, ha nincs mit javítani)
function viewportShift(vv, st = _state) {
  if (!vv) return 0;
  if (vv.width !== st.width) { st.width = vv.width; st.full = 0; st.rest = null; } // tájolásváltás: újramérés
  st.full = Math.max(st.full, vv.height);
  if (st.full - vv.height > KEYBOARD_MIN_PX) return 0;                         // nyitva a billentyűzet
  if (st.rest === null || vv.offsetTop < st.rest) st.rest = vv.offsetTop;
  const shift = Math.round(vv.offsetTop - st.rest);
  return shift < 1 ? 0 : shift;
}

let _queued = false;
function syncViewportShift() {
  _queued = false;
  const value = `${viewportShift(window.visualViewport)}px`;
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
