// LexiLearn – practice/writing.js
// V13.13: KANDZSI ÍRÁSGYAKORLÁS (a Gyakorlás dokk "Írás" típusa, csak kandzsi módban).
// A kártyán a jelentés és az olvasat látszik; a kandzsit ujjal (egérrel) kell megrajzolni egy nagy
// írásgyakorló négyzetben, vonásonként, a helyes sorrendben. Minden vonást a KanjiVG útvonalához
// hasonlítunk (kezdőpont, végpont, alak, irány): a jó vonás a szabályos alakjára "ugrik", a hibás
// halványan eltűnik. Ugyanannál a vonásnál a második hiba után megmutatjuk, hogyan megy.
//   Hibátlan / javítással kész → helyes válasz.  Segítséggel vagy "Nem tudom" → hibás, a következő körbe kerül.
//   Körvonallal (átrajzolva) → gyakorlás, a szó statisztikáját nem érinti.
// A fájl eleje tiszta geometria (DOM nélkül, tesztelhető), a vége a rajzfelület.
import { escHtml } from '../core/util.js';
import { loadStrokes } from '../features/strokes.js';

/* ══ Geometria ══ */
const SAMPLES = 24;        // ennyi egyenletes pontra mintavételezünk egy vonást
const SEGMENT_STEPS = 10;  // ennyi lépésben közelítünk egy Bézier-szakaszt
const TOKEN = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const polyLength = pts => pts.reduce((s, p, i) => (i ? s + dist(p, pts[i - 1]) : 0), 0);

// SVG útvonal → töröttvonal. A KanjiVG csak az M/m, C/c és S/s parancsokat használja (az L/l a teljesség kedvéért van itt).
function pathToPolyline(d) {
  const tokens = String(d).match(TOKEN) || [];
  const pts = [];
  let i = 0, cmd = null, x = 0, y = 0, px = null, py = null; // px, py: az előző vezérlőpont (S/s tükrözi)
  const num = () => Number(tokens[i++]);
  const line = (nx, ny) => { x = nx; y = ny; px = py = null; pts.push([x, y]); };
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    for (let s = 1; s <= SEGMENT_STEPS; s++) {
      const t = s / SEGMENT_STEPS, u = 1 - t;
      pts.push([
        u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
      ]);
    }
    px = x2; py = y2; x = x3; y = y3;
  };
  const mirror = () => [px === null ? x : 2 * x - px, py === null ? y : 2 * y - py];
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === 'M') { line(num(), num()); cmd = 'L'; }
    else if (cmd === 'm') { line(x + num(), y + num()); cmd = 'l'; }
    else if (cmd === 'L') line(num(), num());
    else if (cmd === 'l') line(x + num(), y + num());
    else if (cmd === 'C') cubic(num(), num(), num(), num(), num(), num());
    else if (cmd === 'c') { const ox = x, oy = y; cubic(ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()); }
    else if (cmd === 'S') { const [mx, my] = mirror(); cubic(mx, my, num(), num(), num(), num()); }
    else if (cmd === 's') { const [mx, my] = mirror(); const ox = x, oy = y; cubic(mx, my, ox + num(), oy + num(), ox + num(), oy + num()); }
    else break; // ismeretlen parancs: itt megállunk
  }
  return pts;
}

// Töröttvonal → n pont, ívhossz szerint egyenletesen
function resample(points, n = SAMPLES) {
  if (points.length === 0) return [];
  const at = [0];
  for (let i = 1; i < points.length; i++) at.push(at[i - 1] + dist(points[i], points[i - 1]));
  const total = at[at.length - 1];
  if (total === 0 || points.length === 1) return Array.from({ length: n }, () => [points[0][0], points[0][1]]);
  const out = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const target = total * k / (n - 1);
    while (j < points.length - 1 && at[j] < target) j++;
    const t = (target - at[j - 1]) / ((at[j] - at[j - 1]) || 1);
    out.push([points[j - 1][0] + (points[j][0] - points[j - 1][0]) * t, points[j - 1][1] + (points[j][1] - points[j - 1][1]) * t]);
  }
  return out;
}

// A KanjiVG vonása összehasonlításra kész alakban
function prepareStroke(d) {
  const poly = pathToPolyline(d);
  return { d, pts: resample(poly), len: polyLength(poly) };
}
// A felhasználó vonalának hosszát a mintavételezett és simított pontokból mérjük: az ujj remegése így nem nyújtja meg
const smooth = pts => pts.map((p, i) => {
  const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
  return [(a[0] + p[0] + b[0]) / 3, (a[1] + p[1] + b[1]) / 3];
});
const prepareUser = points => { const pts = resample(points); return { pts, len: polyLength(smooth(pts)) }; };

// Tűrések a 109 egységes rácson (300 px-es négyzeten 1 egység kb. 2,75 px): [alap, hossz-arányos rész, felső határ].
// A hosszabb vonás többet tűr. Az értékeket az összes kandzsin mérve állítottuk be (lásd tests/unit/writing.test.js).
const TOL = { start: [16, 0.12, 30], end: [18, 0.15, 34], mean: [11, 0.10, 21], later: 0.5, chord: 12, cos: 0.3 };
const tol = ([base, perLen, max], L) => Math.min(max, base + perLen * L);

function matchStroke(user, exp) {
  const L = exp.len, n = exp.pts.length;
  const startTol = tol(TOL.start, L), endTol = tol(TOL.end, L), meanTol = tol(TOL.mean, L);
  let sum = 0;
  for (let k = 0; k < n; k++) sum += dist(user.pts[k], exp.pts[k]);
  const mean = sum / n;
  const lengthOk = user.len <= Math.max(2.6 * L, L + 30) && (L < 14 || user.len >= 0.35 * L);
  // Irány: a kezdőponttól a végpontig mutató vektor nagyjából egyezzen (a pontszerű, rövid vonásoknál nem nézzük)
  const ex = exp.pts[n - 1][0] - exp.pts[0][0], ey = exp.pts[n - 1][1] - exp.pts[0][1], chord = Math.hypot(ex, ey);
  let directionOk = true;
  if (chord >= TOL.chord) {
    const ux = user.pts[n - 1][0] - user.pts[0][0], uy = user.pts[n - 1][1] - user.pts[0][1];
    directionOk = (ux * ex + uy * ey) / ((Math.hypot(ux, uy) || 1) * chord) >= TOL.cos;
  }
  return {
    mean,
    ok: lengthOk && directionOk && mean <= meanTol &&
      dist(user.pts[0], exp.pts[0]) <= startTol && dist(user.pts[n - 1], exp.pts[n - 1]) <= endTol
  };
}

/**
 * A megrajzolt vonás megítélése.
 * @returns {'ok'|'order'|'direction'|'shape'} jó · egy későbbi vonás · fordított irány · nem egyezik
 */
function judgeStroke(points, strokes, index) {
  const user = prepareUser(points);
  const current = matchStroke(user, strokes[index]);
  let later = null;
  for (let j = index + 1; j < strokes.length; j++) {
    const m = matchStroke(user, strokes[j]);
    if (m.ok && (!later || m.mean < later.mean)) later = m;
  }
  // Sűrű kandzsinál a szomszédos vonás is beleférhet a tűrésbe: ha egy későbbi sokkal jobban illik, az a sorrend hibája
  if (current.ok && !(later && later.mean < current.mean * TOL.later)) return 'ok';
  if (later) return 'order';
  if (matchStroke({ pts: [...user.pts].reverse(), len: user.len }, strokes[index]).ok) return 'direction';
  return 'shape';
}

// A kész kandzsi minősítése a hibák és a segítség alapján
function writingResult({ revealed, traced, hinted, misses }) {
  if (revealed) return 'revealed';
  if (traced) return 'traced';
  if (hinted || misses > 2) return 'helped';
  return misses > 0 ? 'ok' : 'clean';
}
const isWritingCorrect = result => result === 'clean' || result === 'ok';

/* ══ Rajzfelület ══ */
const MISS_TEXT = {
  order: 'Nem ez a vonás következik.',
  direction: 'Jó helyen van, de a másik irányba húzd.',
  shape: 'Nem egészen. Próbáld újra.'
};
const MIN_STROKE = 1.5;   // ennél rövidebb mozdulat koppintás, nem vonás
const HINT_AFTER = 2;     // ugyanannál a vonásnál ennyi hiba után jön a segítség
let W = null;             // az aktuális kandzsi állapota
let _outline = false;     // körvonal (átrajzolás): a gyakorlás végéig megmarad

const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const el = id => document.getElementById(id);

function writingHtml(word) {
  return `
    <div class="wr-prompt">
      <div class="wr-meaning">${escHtml(word.hu)}</div>
      <div class="wr-readings">On: ${escHtml(word.onyomi || '–')} · Kun: ${escHtml(word.kunyomi || '–')}</div>
    </div>
    <div class="wr-stage">
      <svg class="wr-svg" id="wr-svg" viewBox="0 0 109 109" role="img" aria-label="Rajzfelület a kandzsihoz">
        <g class="ks-guide" aria-hidden="true"><line x1="54.5" y1="4" x2="54.5" y2="105"/><line x1="4" y1="54.5" x2="105" y2="54.5"/></g>
        <g class="wr-outline" id="wr-outline" aria-hidden="true"${_outline ? '' : ' hidden'}></g>
        <g class="wr-done" id="wr-done" aria-hidden="true"></g>
        <g class="wr-hint" id="wr-hint" aria-hidden="true"></g>
        <polyline class="wr-live" id="wr-live" points="" aria-hidden="true"/>
      </svg>
    </div>
    <p class="wr-status" id="wr-status" role="status">Vonásadat betöltése…</p>
    <div class="wr-tools">
      <button class="wr-tool" id="wr-outline-btn" onclick="writingToggleOutline()" aria-pressed="${_outline}">Körvonal</button>
      <button class="wr-tool" id="wr-hint-btn" onclick="writingHint()">Segítség</button>
      <button class="wr-tool" id="wr-restart-btn" onclick="writingRestart()">Elölről</button>
    </div>
    <button class="dont-know" id="wr-reveal-btn" onclick="writingReveal()">Nem tudom</button>`;
}

function setStatus(text, good = false) {
  const s = el('wr-status');
  if (!s) return;
  s.textContent = text;
  s.classList.toggle('is-good', good);
}

function progressText() {
  return W.index === 0 ? `Rajzold meg vonásonként · ${W.strokes.length} vonás` : `${W.index} / ${W.strokes.length} vonás`;
}

// A kérdés kirajzolása után: vonásadat betöltése, a rajzolás bekötése. onDone(result) a kész kandzsinál fut.
function initWriting(word, onDone) {
  W = { word, onDone, strokes: [], index: 0, misses: 0, missesHere: 0, hinted: false, revealed: false, traced: _outline, done: false, live: null };
  const state = W;
  return loadStrokes(word.en).then(raw => {
    if (W !== state || !el('wr-svg')) return; // közben továbbléptek
    if (!raw) {
      setStatus('Ehhez a kandzsihoz most nem érhető el vonásadat.');
      toolsDisabled(true);
      W.done = true;
      onDone('skipped');
      return;
    }
    W.strokes = raw.map(([d]) => prepareStroke(d));
    el('wr-outline').innerHTML = W.strokes.map(s => `<path d="${s.d}"/>`).join('');
    el('wr-svg').setAttribute('aria-label', `Rajzfelület: ${W.strokes.length} vonás`);
    setStatus(progressText());
    bindDrawing(el('wr-svg'));
  });
}

function toSvgPoint(svg, e) {
  const r = svg.getBoundingClientRect();
  return [(e.clientX - r.left) / (r.width || 1) * 109, (e.clientY - r.top) / (r.height || 1) * 109];
}

function bindDrawing(svg) {
  const live = el('wr-live');
  let pointerId = null;
  svg.addEventListener('pointerdown', e => {
    if (!W || W.done || e.button > 0 || pointerId !== null) return;
    pointerId = e.pointerId;
    try { svg.setPointerCapture(pointerId); } catch (_) { /* nem kritikus */ }
    W.live = [toSvgPoint(svg, e)];
    live.classList.remove('is-miss');
    live.setAttribute('points', W.live[0].join(','));
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (e.pointerId !== pointerId || !W || !W.live) return;
    W.live.push(toSvgPoint(svg, e));
    live.setAttribute('points', W.live.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '));
  });
  const end = e => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (W && W.live) submitStroke(W.live);
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}

// Egy megrajzolt vonás feldolgozása (a tesztek is ezt hívják, 109-es rácsbeli pontokkal)
function submitStroke(points) {
  if (!W || W.done || W.strokes.length === 0) return null;
  W.live = null;
  const live = el('wr-live');
  if (polyLength(points) < MIN_STROKE) { if (live) live.setAttribute('points', ''); return null; }
  const verdict = judgeStroke(points, W.strokes, W.index);
  if (verdict === 'ok') acceptStroke();
  else missStroke(verdict);
  return verdict;
}

function acceptStroke() {
  const live = el('wr-live'), done = el('wr-done'), hint = el('wr-hint');
  if (live) live.setAttribute('points', '');
  if (hint) hint.innerHTML = '';
  if (done) done.insertAdjacentHTML('beforeend', `<path class="is-new" d="${W.strokes[W.index].d}"/>`);
  W.index++;
  W.missesHere = 0;
  if (W.index >= W.strokes.length) finish();
  else setStatus(progressText());
}

function missStroke(verdict) {
  W.misses++;
  W.missesHere++;
  const live = el('wr-live');
  if (live) {
    live.classList.add('is-miss');
    const clear = () => { if (live.classList.contains('is-miss')) { live.setAttribute('points', ''); live.classList.remove('is-miss'); } };
    setTimeout(clear, reduceMotion() ? 200 : 360);
  }
  setStatus(MISS_TEXT[verdict]);
  if (W.missesHere >= HINT_AFTER) showHint();
}

// A következő vonás megmutatása: kezdőpont és a vonal, amit követni kell
function showHint() {
  if (!W || W.done || W.strokes.length === 0) return;
  W.hinted = true;
  const s = W.strokes[W.index];
  const hint = el('wr-hint');
  if (hint) hint.innerHTML = `<path d="${s.d}" pathLength="1"/><circle cx="${s.pts[0][0].toFixed(1)}" cy="${s.pts[0][1].toFixed(1)}" r="2.6"/>`;
  setStatus('Így megy: a ponttól indulva kövesd a vonalat.');
}

function toolsDisabled(on) {
  ['wr-hint-btn', 'wr-restart-btn', 'wr-reveal-btn', 'wr-outline-btn'].forEach(id => { const b = el(id); if (b) b.disabled = on; });
}

function finish() {
  W.done = true;
  toolsDisabled(true);
  const result = writingResult(W);
  const text = {
    clean: 'Hibátlan.',
    ok: `Kész, ${W.misses} javítással.`,
    helped: 'Kész, segítséggel.',
    revealed: 'Így kell megrajzolni.',
    traced: 'Átrajzolva.'
  }[result];
  setStatus(text, isWritingCorrect(result));
  W.onDone(result);
}

/* ── A kártya gombjai ── */
function writingHint() { showHint(); }

function writingRestart() {
  if (!W || W.done || W.strokes.length === 0) return;
  W.index = 0;
  W.missesHere = 0;
  ['wr-done', 'wr-hint'].forEach(id => { const g = el(id); if (g) g.innerHTML = ''; });
  const live = el('wr-live');
  if (live) live.setAttribute('points', '');
  setStatus(progressText());
}

function writingToggleOutline() {
  _outline = !_outline;
  const g = el('wr-outline'), btn = el('wr-outline-btn');
  if (g) g.toggleAttribute('hidden', !_outline); // SVG elemnek nincs hidden tulajdonsága, csak attribútuma
  if (btn) btn.setAttribute('aria-pressed', _outline ? 'true' : 'false');
  if (_outline && W && !W.done) W.traced = true; // ennél a kandzsinál már látta a körvonalat
}

// "Nem tudom": a hátralévő vonások sorban megrajzolódnak
function writingReveal() {
  if (!W || W.done || W.strokes.length === 0) return;
  W.revealed = true;
  const done = el('wr-done'), hint = el('wr-hint'), live = el('wr-live');
  if (hint) hint.innerHTML = '';
  if (live) live.setAttribute('points', '');
  if (done) {
    done.insertAdjacentHTML('beforeend', W.strokes.slice(W.index)
      .map((s, i) => `<path class="is-reveal" d="${s.d}" pathLength="1" style="--d:${i * 300}ms"/>`).join(''));
  }
  W.index = W.strokes.length;
  finish();
}

const writingState = () => W;
function resetWritingOutline() { _outline = false; }

export { SAMPLES, TOL, initWriting, isWritingCorrect, judgeStroke, matchStroke, pathToPolyline, polyLength, prepareStroke, resample,
  resetWritingOutline, submitStroke, writingHint, writingHtml, writingReveal, writingRestart, writingResult, writingState, writingToggleOutline };
