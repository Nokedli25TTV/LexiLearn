// LexiLearn demó: a README képeihez beállított jelenetek (tools/demo.html?shot=…, lásd tools/showcase.html).
// A demó előzményének betöltése után az appot a kért képernyőre viszi, megállítja az animációkat, és
// jelez (window.__shotReady), hogy a kép elkészíthető. Mindent az app saját függvényeivel csinál.
import { state } from '../js/core/state.js';
import { flipLearnCard } from '../js/habit/learn.js';
import { submitStroke, writingState } from '../js/practice/writing.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const until = async (test, ms = 8000) => { for (let t = 0; t < ms && !test(); t += 25) await wait(25); return test(); };
const $ = sel => document.querySelector(sel);

// A futó átmenetek a végükre ugranak, az értesítés eltűnik; a megállított animáció (keep) marad
async function settle(ms = 300, keep = () => false) {
  await wait(ms);
  document.querySelectorAll('.toast.show').forEach(t => t.classList.remove('show'));
  document.getAnimations().forEach(a => { if (!keep(a)) { try { a.finish(); } catch (_) { /* végtelen animáció */ } } });
  await wait(30);
}

// A vonássorrend animációja megáll a megadott vonás közepén
function freezeStrokes(strokeIndex) {
  const ks = $('.ks.is-playing');
  const path = ks && ks.querySelector(`.ks-ink path[data-i="${strokeIndex}"]`);
  if (!path) return false;
  const ms = name => parseFloat(getComputedStyle(name === '--ks-delay' ? ks : path).getPropertyValue(name)) || 0;
  const at = ms('--ks-delay') + ms('--d') + ms('--t') * 0.6;
  ks.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = at; });
  return true;
}

// Egy megkezdett, még fel nem engedett vonás a rajzfelületen (valódi mutatóeseményekkel)
function drawLive(svg, pts, share) {
  const r = svg.getBoundingClientRect();
  const ev = (type, [x, y]) => svg.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: 5, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1,
    clientX: r.left + x / 109 * r.width, clientY: r.top + y / 109 * r.height
  }));
  const n = Math.max(2, Math.round(pts.length * share));
  ev('pointerdown', pts[0]);
  for (let i = 1; i < n; i++) ev('pointermove', [pts[i][0] + Math.sin(i * 1.7) * 0.5, pts[i][1] + Math.cos(i * 1.3) * 0.5]);
}

const SHOTS = {
  kezdolap() {
    window.setMode('japanese');
    window.showScreen('home');
  },

  // Új szó: egy kártya már megvan, a következő megfordítva (jelentés és példamondat)
  async tanulas() {
    window.setMode('japanese');
    window.startLearnSession();
    await settle();
    window.learnSwipe('right');
    await settle(600);
    flipLearnCard();
  },

  // Ismétlés: két értékelés után a harmadik kártya megfordítva, a négy gombbal
  async ismetles() {
    window.setMode('japanese');
    window.startReviewSession();
    await settle();
    for (let i = 0; i < 2; i++) {
      window.flipReviewCard();
      await settle();
      window.rateReview(3);
      await settle(600);
    }
    window.flipReviewCard();
  },

  // Gyakorlás fül: két lecke, csak a még nem tanult szavak, mind kijelölve
  async gyakorlas() {
    window.setMode('japanese');
    window.showScreen('dashboard');
    window.toggleLesson('15');
    window.toggleLesson('16');
    window.setStatusFilter('new');
    window.closeLibraryOverlays();
    await settle();
    window.toggleSelectAll();
  },

  // Kandzsi kártya hátoldala: a vonássorrend rajzolás közben
  async vonassorrend() {
    window.setMode('kanji');
    window.startLearnSession();
    await settle();
    flipLearnCard();
    await until(() => $('.ks.is-playing'));
    await settle(200, a => !!(a.effect && a.effect.target && a.effect.target.closest('.ks')));
    const strokes = document.querySelectorAll('.ks-ink path').length;
    freezeStrokes(Math.max(0, Math.round(strokes * 0.75) - 1));
    return { frozen: true };
  },

  // Írásgyakorlás: a kandzsi bal fele kész, a következő vonás épp készül
  async iras() {
    window.setMode('kanji');
    window.showScreen('dashboard');
    const from = state.words.findIndex(w => w.en === '語');
    const pick = state.words.slice(Math.max(0, from)).filter(w => w.stats.learnedAt).slice(0, 10);
    window.selectNone();
    pick.forEach(w => state.selectedIds.add(w.id));
    window.setPracticeOption('type', 'writing');
    window.setPracticeOption('order', 'diff-asc'); // nem keveri: az első kiválasztott jön elsőnek
    window.startPractice();
    await until(() => writingState() && writingState().strokes.length > 0);
    await settle();
    const W = writingState();
    const done = Math.min(7, W.strokes.length - 1);
    for (let i = 0; i < done; i++) submitStroke(W.strokes[i].pts);
    await settle();
    drawLive($('#wr-svg'), W.strokes[done].pts, 0.7);
    return { frozen: true };
  },

  het() {
    window.setMode('japanese');
    window.showWeekScreen(-1);
  },

  // Statisztika a KPI sávtól: alatta a konzisztencia hőtérkép és a tudás-érettség
  statisztika() {
    window.setMode('japanese');
    window.showScreen('stats');
    return { scrollTo: '#kpi-strip' };
  }
};

const name = new URLSearchParams(location.search).get('shot');
try {
  if (!SHOTS[name]) throw new Error(`Ismeretlen jelenet: ${name}. Van: ${Object.keys(SHOTS).join(', ')}`);
  if (!await until(() => window.__demoReady, 20000)) throw new Error('A demó nem töltődött be.');
  if (window.speechSynthesis) window.speechSynthesis.speak = () => {}; // a képekhez nem kell hang
  // Rögzített véletlen: a kevert sorok (ismétlés, kvíz) minden futáskor ugyanazt a kártyát adják
  let seed = 7;
  Math.random = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const result = await SHOTS[name]();
  if (!(result && result.frozen)) await settle(500);
  const target = result && result.scrollTo && $(result.scrollTo);
  window.scrollTo(0, target ? target.getBoundingClientRect().top + window.scrollY - 18 : 0);
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  window.__shotReady = true;
} catch (err) {
  window.__shotError = String(err && err.message || err);
  console.error('[demo-shots]', err);
}
