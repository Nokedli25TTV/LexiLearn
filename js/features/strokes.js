// LexiLearn – features/strokes.js
// V13.9: KANDZSI VONÁSSORREND a tanuló és az ismétlő kártya hátoldalán.
// Adat: a KanjiVG útvonalai (© Ulrich Apel, CC BY-SA 3.0, https://kanjivg.tagaini.net), JLPT-szintenként
// egy-egy JSON fájlban (kanjivg/n5.json … n1.json; előállítja: tools/build-kanjivg.mjs).
// Egy szint fájlja akkor töltődik le, amikor az első ilyen kandzsi kártya megjelenik; a service worker
// külön, verziófüggetlen gyorsítótárban tartja, így offline is megmarad.
// Megfordításkor a vonások sorban megrajzolódnak a halvány teljes alak fölött, számozva; az épp
// rajzolódó vonás zöld, utána tintaszínű lesz. prefers-reduced-motion alatt a kész, számozott ábra látszik.
import { KANJI_DATA } from '../core/data.js';
import { escHtml } from '../core/util.js';

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const FLIP_DELAY = 380; // a kártya fordulásának (520 ms) nagyjából a felénél kezd rajzolni
const GAP = 80;         // szünet két vonás között (ms)
const MAX_TOTAL = 5200; // a sok vonásos kandzsi se tartson sokáig: az egészet ebbe sűrítjük

const levelOf = new Map(KANJI_DATA.map(k => [k.kanji, String(k.jlpt || 'N1').toLowerCase()]));
const files = new Map(); // szint → Promise<{ kandzsi: [[útvonal, x, y], …] } | null>
let warmed = false;

const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function loadLevel(level) {
  if (!files.has(level)) {
    const req = fetch(`kanjivg/${level}.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .catch(() => { files.delete(level); return null; }); // offline első betöltés: később újrapróbálja
    files.set(level, req);
  }
  return files.get(level);
}

// A kandzsi vonásai ([útvonal, számozás x, számozás y] vonásonként), vagy null, ha nincs adat
function loadStrokes(kanji) {
  const level = levelOf.get(kanji);
  if (!level || typeof fetch !== 'function') return Promise.resolve(null);
  return loadLevel(level).then(data => (data && Array.isArray(data[kanji]) ? data[kanji] : null));
}

// Az első kandzsi kártya után a többi szint fájlját is letölti a háttérben (a service worker eltárolja),
// így útközben, térerő nélkül is megvan minden vonássorrend. Adatforgalom-kímélő módban nem.
function warmStrokeCache() {
  if (warmed || typeof fetch !== 'function') return;
  warmed = true;
  if (navigator.connection && navigator.connection.saveData) return;
  const run = () => LEVELS.filter(l => !files.has(l)).forEach(l => fetch(`kanjivg/${l}.json`).catch(() => {}));
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 8000 });
  else setTimeout(run, 3000);
}

// A kártya hátoldalára kerülő ábra. Amíg az adat nem jön meg (vagy ha nincs), a kandzsi betűként látszik.
function strokeFigureHtml(kanji) {
  if (!levelOf.has(kanji)) return '';
  return `
    <figure class="ks" data-kanji="${escHtml(kanji)}">
      <div class="ks-box"><span class="ks-glyph" aria-hidden="true">${escHtml(kanji)}</span></div>
      <figcaption class="ks-meta">
        <span class="ks-count"></span>
        <button type="button" class="ks-replay" data-no-swipe onclick="replayStrokes(this)" aria-label="Vonássorrend újrajátszása" tabindex="-1" hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 3 3 9 9 9"/></svg>
        </button>
      </figcaption>
    </figure>`;
}

function svgHtml(kanji, strokes) {
  const ghost = strokes.map(([d]) => `<path d="${d}"/>`).join('');
  const ink = strokes.map(([d], i) => `<path d="${d}" pathLength="1" data-i="${i}"/>`).join('');
  const nums = strokes.map(([, x, y], i) => (typeof x === 'number' && typeof y === 'number'
    ? `<text x="${x}" y="${y}" data-i="${i}">${i + 1}</text>` : '')).join('');
  return `
    <svg class="ks-svg" viewBox="0 0 109 109" role="img" aria-label="${escHtml(kanji)} vonássorrendje, ${strokes.length} vonás">
      <g class="ks-guide" aria-hidden="true"><line x1="54.5" y1="4" x2="54.5" y2="105"/><line x1="4" y1="54.5" x2="105" y2="54.5"/></g>
      <g class="ks-ghost" aria-hidden="true">${ghost}</g>
      <g class="ks-ink" aria-hidden="true">${ink}</g>
      <g class="ks-num" aria-hidden="true">${nums}</g>
    </svg>`;
}

// Vonásonkénti kezdés (--d) és időtartam (--t): állandó tempó, a hosszabb vonás tovább tart
function applyTimings(svg) {
  const lengths = [...svg.querySelectorAll('.ks-ghost path')].map(p => {
    try { return p.getTotalLength() || 50; } catch (_) { return 50; } // jsdom: nincs geometria
  });
  const durs = lengths.map(l => Math.min(620, Math.max(240, 150 + l * 5)));
  const total = durs.reduce((a, b) => a + b, 0) + GAP * Math.max(0, durs.length - 1);
  const k = total > MAX_TOTAL ? MAX_TOTAL / total : 1;
  let t = 0;
  const starts = durs.map(d => { const s = t; t += (d + GAP) * k; return s; });
  svg.querySelectorAll('[data-i]').forEach(el => {
    const i = Number(el.dataset.i);
    el.style.setProperty('--d', `${Math.round(starts[i])}ms`);
    el.style.setProperty('--t', `${Math.round(durs[i] * k)}ms`);
  });
}

const figureIn = el => (el && el.classList && el.classList.contains('ks') ? el : el && el.querySelector('.ks'));

function mountStrokes(root) {
  const ks = figureIn(root);
  if (!ks) return;
  const kanji = ks.dataset.kanji;
  loadStrokes(kanji).then(strokes => {
    if (!strokes || !ks.isConnected) return;
    const box = ks.querySelector('.ks-box');
    box.innerHTML = svgHtml(kanji, strokes);
    applyTimings(box.querySelector('svg'));
    ks.querySelector('.ks-count').textContent = `${strokes.length} vonás`;
    ks.querySelector('.ks-replay').hidden = false;
    ks.classList.add('is-ready');
    if (ks.dataset.want) playStrokes(ks, 120); // a kártya már meg van fordítva: most indul
  });
  warmStrokeCache();
}

// Kezdés a hátoldal megjelenésekor (delay: a fordulás ideje) vagy az Újrajátszás gombra
function playStrokes(root, delay = FLIP_DELAY) {
  const ks = figureIn(root);
  if (!ks) return;
  ks.dataset.want = '1';
  const btn = ks.querySelector('.ks-replay');
  if (btn) btn.tabIndex = 0;
  if (!ks.classList.contains('is-ready') || reduceMotion()) return;
  ks.style.setProperty('--ks-delay', `${delay}ms`);
  ks.classList.remove('is-playing');
  void ks.getBoundingClientRect(); // újraindítja a CSS animációt
  ks.classList.add('is-playing');
}

// Visszafordításkor: a hátoldal rejtve van, a gomb ne legyen fókuszálható
function stopStrokes(root) {
  const ks = figureIn(root);
  if (!ks) return;
  delete ks.dataset.want;
  ks.classList.remove('is-playing');
  const btn = ks.querySelector('.ks-replay');
  if (btn) btn.tabIndex = -1;
}

function replayStrokes(btn) {
  playStrokes(btn && btn.closest('.ks'), 0);
}

export { loadStrokes, mountStrokes, playStrokes, replayStrokes, stopStrokes, strokeFigureHtml, warmStrokeCache };
