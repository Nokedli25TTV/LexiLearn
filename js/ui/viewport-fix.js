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
// V13.22: csak az első billentyűzethasználat után kapcsolhat be (a hiba csak utána jelentkezik), így az
// app megnyitásakor a sávok biztosan a CSS szerinti helyükön vannak.
import { ttsDiagnostics } from '../practice/tts.js';
const KEYBOARD_MIN_PX = 120; // ennyinél kisebb magasságcsökkenés még nem billentyűzet

const isStandalone = () => (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
  || window.navigator.standalone === true;

// rest: a legkisebb látott offsetTop zárt billentyűzetnél; full: a legnagyobb látott magasság (tájolásonként)
const _state = { rest: null, full: 0, width: 0, keyboardSeen: false };

// A sávok szükséges eltolása px-ben (0, ha nincs mit javítani)
function viewportShift(vv, st = _state) {
  if (!vv) return 0;
  if (vv.width !== st.width) { st.width = vv.width; st.full = 0; st.rest = null; } // tájolásváltás: újramérés
  st.full = Math.max(st.full, vv.height);
  if (st.full - vv.height > KEYBOARD_MIN_PX) { st.keyboardSeen = true; return 0; } // nyitva a billentyűzet
  if (st.rest === null || vv.offsetTop < st.rest) st.rest = vv.offsetTop;
  if (!st.keyboardSeen) return 0;
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
  if (_debugEl) renderViewportDebug();
}

/* ── Diagnosztika (Profil: a verziószámra ötször koppintva): a mért értékek a képernyő tetején,
   hogy egy képernyőképből látszódjon, mit csinál az iOS ── */
let _debugEl = null;
let _debugTimer = null;
function renderViewportDebug() {
  const vv = window.visualViewport;
  const nav = document.getElementById('bottom-nav')?.getBoundingClientRect();
  const r = n => (typeof n === 'number' ? Math.round(n * 10) / 10 : '–');
  _debugEl.textContent = [
    `standalone: ${isStandalone()} · shift: ${document.documentElement.style.getPropertyValue('--vv-shift') || '0px'}`,
    `vv: top ${r(vv?.offsetTop)} · h ${r(vv?.height)} · w ${r(vv?.width)} · scale ${r(vv?.scale)}`,
    `inner: ${window.innerWidth}×${window.innerHeight} · client: ${document.documentElement.clientHeight} · scrollY ${r(window.scrollY)}`,
    `rest ${r(_state.rest)} · full ${r(_state.full)} · kb ${_state.keyboardSeen} · nav ${r(nav?.top)}–${r(nav?.bottom)}`,
    ...ttsDiagnostics() // V13.28
  ].join('\n');
}
function toggleViewportDebug() {
  if (_debugEl) { clearInterval(_debugTimer); _debugEl.remove(); _debugEl = null; return false; }
  _debugEl = document.createElement('pre');
  _debugEl.className = 'vv-debug';
  document.body.appendChild(_debugEl);
  renderViewportDebug();
  _debugTimer = setInterval(renderViewportDebug, 1000);
  return true;
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

export { initViewportFix, syncViewportShift, toggleViewportDebug, viewportShift };
