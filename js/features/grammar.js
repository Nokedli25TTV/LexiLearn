// LexiLearn – features/grammar.js (V13.35, lapozó olvasó: V13.62)
// Nyelvtan leckénként japán módban: a Gyakorlás fülön, ha egy Dekiru-lecke van kiválasztva, egy sor
// nyitja. V13.62 óta teljes képernyős, lépésenként lapozható olvasó: fent töltődő csík a lépésszámmal és
// a Tartalom gomb (a szerkezetek listája, ugrás, előző / következő lecke), középen egy szerkezet
// (minta, név, magyarázat, példák felolvasással, buktató), alul Vissza és Következő a hüvelykujj alatt.
// A tartalom a grammar_notes.js-ben van (GRAMMAR_NOTES, lecke szerint).
import { GRAMMAR_NOTES } from '../core/data.js';
import { currentMode } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { speakWord } from '../practice/tts.js';

const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';
const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
const CLOSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const LIST = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>';
const SPEAKER = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';

const grammarOf = lesson => GRAMMAR_NOTES[Number(lesson)] || null;
const hasGrammar = lesson => currentMode === 'japanese' && !!grammarOf(lesson)?.points?.length;
const grammarLessons = () => Object.keys(GRAMMAR_NOTES).map(Number).filter(n => grammarOf(n).points?.length).sort((a, b) => a - b);
const bookOf = lesson => (Number(lesson) >= 25 ? 2 : 1);
// Tördelés: a magyar toldalék (-ba, -tól) nem válik el a kötőjelétől (nem törő kötőjel, U+2011);
// a magyar szövegbe ágyazott japán szó sem törik ketté; a minta darabjai egyben maradnak, csak a ／,
// a ・ és a szóköz után törhet (utánuk nulla szélességű szóköz)
const huText = t => escHtml(t)
  .replace(/(^|[\s(„])-(?=\p{L})/gu, '$1‑')
  .replace(/[぀-ヿ㐀-鿿～]+/g, m => `<span class="gr-nb" lang="ja">${m}</span>`);
const jaPattern = t => String(t).split(/([／・ ]+)/)
  .map(part => (/^[／・ ]+$/.test(part) ? `${escHtml(part)}​` : part ? `<span class="gr-nb">${escHtml(part)}</span>` : ''))
  .join('');

// Gyakorlás fül: a lecke nyelvtana (a Lecke-zárás sora fölött)
function grammarRowHtml(lesson) {
  if (!hasGrammar(lesson)) return '';
  const g = grammarOf(lesson);
  return `
    <button class="lesson-hard-btn lesson-grammar-btn" onclick="openGrammar(${Number(lesson)})">
      <span class="lesson-hard-main">${Number(lesson)}. lecke nyelvtana</span>
      <span class="lesson-hard-sub">${g.points.length} szerkezet · <span lang="ja">${escHtml(g.points.map(p => p.pattern).join('　'))}</span></span>
      ${CHEVRON}
    </button>`;
}

/* ── A teljes képernyős olvasó ──────────────────────────── */

let _returnFocus = null;
let _lesson = null;
let _step = 0;
let _tocOpen = false;
const modal = () => document.getElementById('grammar-modal');
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stepHtml(lesson, i) {
  const p = grammarOf(lesson).points[i];
  const examples = (p.ex || []).map(([ja, hu], j) => `
    <li class="gr-ex">
      <button type="button" class="gr-speak" onclick="speakGrammar(${lesson}, ${i}, ${j})" aria-label="Felolvasás: ${escHtml(ja)}">${SPEAKER}</button>
      <span class="gr-ex-text"><span class="gr-ja" lang="ja">${escHtml(ja)}</span><span class="gr-hu">${huText(hu)}</span></span>
    </li>`).join('');
  return `
    <article class="gr-step" data-step="${i}">
      <h3 class="gr-pattern" lang="ja">${jaPattern(p.pattern)}</h3>
      <p class="gr-name">${huText(p.name)}</p>
      <p class="gr-text">${huText(p.text)}</p>
      ${examples ? `<section class="gr-sec"><h4 class="wi-label">Példák</h4><ul class="gr-examples">${examples}</ul></section>` : ''}
      ${p.watch ? `<section class="wi-sec is-watch"><h4 class="wi-label">Figyelj</h4><p class="wi-text">${huText(p.watch)}</p></section>` : ''}
    </article>`;
}

function neighbours(lesson) {
  const all = grammarLessons();
  const i = all.indexOf(lesson);
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
}

function tocHtml(lesson) {
  const g = grammarOf(lesson);
  const { prev, next } = neighbours(lesson);
  return `
    <div class="gr-toc" id="gr-toc" role="dialog" aria-label="Tartalom" hidden>
      <div class="gr-toc-list">
        ${g.points.map((p, n) => `
          <button type="button" class="gr-toc-item" data-step="${n}" onclick="grammarGo(${n})">
            <span class="gr-toc-num">${n + 1}</span>
            <span class="gr-toc-text"><span class="gr-toc-pattern" lang="ja">${jaPattern(p.pattern)}</span><span class="gr-toc-name">${huText(p.name)}</span></span>
          </button>`).join('')}
      </div>
      <nav class="gr-nav" aria-label="Leckék">
        ${prev ? `<button type="button" class="gr-nav-btn" onclick="openGrammar(${prev})">${BACK}${prev}. lecke</button>` : '<span></span>'}
        ${next ? `<button type="button" class="gr-nav-btn is-next" onclick="openGrammar(${next})">${next}. lecke${CHEVRON}</button>` : ''}
      </nav>
    </div>`;
}

function readerHtml(lesson) {
  const g = grammarOf(lesson);
  const n = g.points.length;
  return `
    <header class="gr-top">
      <button type="button" class="gr-icon-btn gr-close" onclick="closeGrammar()" aria-label="Bezárás">${CLOSE}</button>
      <div class="gr-progress">
        <div class="gr-track" role="progressbar" aria-label="Haladás a lecke nyelvtanában" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="1">
          <div class="gr-fill" id="gr-fill"></div>
        </div>
        <div class="gr-caption">
          <h2 class="gr-title" id="grammar-title">${lesson}. lecke · ${escHtml(g.title)}</h2>
          <span class="gr-count" id="gr-count" aria-live="polite">1 / ${n}</span>
        </div>
      </div>
      <button type="button" class="gr-toc-btn" id="gr-toc-btn" onclick="toggleGrammarToc()" aria-expanded="false" aria-controls="gr-toc">${LIST}<span>Tartalom</span></button>
    </header>
    ${tocHtml(lesson)}
    <div class="gr-stage" id="gr-stage">
      <div class="gr-kicker">Nyelvtan · Dekiru ${bookOf(lesson)}. könyv</div>
      <div class="gr-slot" id="gr-slot"></div>
      <div class="gr-after" id="gr-after"></div>
    </div>
    <footer class="gr-bottom">
      <button type="button" class="gr-prev" id="gr-prev" onclick="grammarStep(-1)">Vissza</button>
      <button type="button" class="gr-next" id="gr-next" onclick="grammarStep(1)">Következő</button>
    </footer>`;
}

// Egy lépés kirajzolása: a csík, a számláló, a tartalom és a gombok (dir: honnan jöttünk, az áttűnés irányához)
function renderStep(dir = 0) {
  const g = grammarOf(_lesson);
  if (!g) return;
  const n = g.points.length;
  const last = _step === n - 1;
  const slot = document.getElementById('gr-slot');
  if (slot) {
    slot.innerHTML = stepHtml(_lesson, _step);
    const step = slot.firstElementChild;
    if (dir && step && !reduceMotion()) step.classList.add(dir > 0 ? 'enter-next' : 'enter-prev');
  }
  const fill = document.getElementById('gr-fill');
  if (fill) fill.style.transform = `scaleX(${(_step + 1) / n})`;
  const track = fill && fill.parentElement;
  if (track) track.setAttribute('aria-valuenow', String(_step + 1));
  const count = document.getElementById('gr-count');
  if (count) count.textContent = `${_step + 1} / ${n}`;
  const prev = document.getElementById('gr-prev');
  if (prev) prev.disabled = _step === 0;
  const nextBtn = document.getElementById('gr-next');
  if (nextBtn) nextBtn.textContent = last ? 'Befejezés' : 'Következő';
  // Az utolsó lépés alatt egy csendes továbblépés a következő leckére
  const after = document.getElementById('gr-after');
  if (after) {
    const { next } = neighbours(_lesson);
    after.innerHTML = last && next
      ? `<button type="button" class="gr-nav-btn gr-next-lesson" onclick="openGrammar(${next})">${next}. lecke nyelvtana${CHEVRON}</button>`
      : '';
  }
  document.querySelectorAll('#gr-toc .gr-toc-item').forEach(b => {
    const on = Number(b.dataset.step) === _step;
    b.classList.toggle('is-current', on);
    if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  const stage = document.getElementById('gr-stage');
  if (stage) stage.scrollTop = 0;
}

function openGrammar(lesson, step = 0) {
  lesson = Number(lesson);
  const host = modal();
  const body = document.getElementById('grammar-body');
  if (!host || !body || !hasGrammar(lesson)) return;
  const wasOpen = host.classList.contains('open');
  if (!wasOpen) _returnFocus = document.activeElement;
  _lesson = lesson;
  _step = Math.max(0, Math.min(Number(step) || 0, grammarOf(lesson).points.length - 1));
  _tocOpen = false;
  body.innerHTML = readerHtml(lesson);
  renderStep(0);
  if (!wasOpen) {
    host.classList.add('open');
    host.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('gr-lock');
  }
  setTimeout(() => (wasOpen ? document.getElementById('gr-next') : host.querySelector('.gr-close'))?.focus({ preventScroll: true }), 30);
}

function closeGrammar() {
  const host = modal();
  if (!host || !host.classList.contains('open')) return;
  host.classList.remove('open');
  host.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('gr-lock');
  _lesson = null;
  _tocOpen = false;
  if (_returnFocus && document.contains(_returnFocus)) {
    try { _returnFocus.focus({ preventScroll: true }); } catch (e) { /* régi böngésző */ }
  }
  _returnFocus = null;
}

// Lapozás: az utolsó lépés után a Befejezés bezárja az olvasót
function grammarStep(delta) {
  const g = grammarOf(_lesson);
  if (!g || !isGrammarOpen()) return;
  const target = _step + delta;
  if (target >= g.points.length) { closeGrammar(); return; }
  if (target < 0) return;
  _step = target;
  renderStep(delta);
}

function grammarGo(i) {
  const g = grammarOf(_lesson);
  if (!g) return;
  const target = Math.max(0, Math.min(Number(i) || 0, g.points.length - 1));
  const dir = Math.sign(target - _step);
  _step = target;
  toggleGrammarToc(false);
  renderStep(dir);
  document.getElementById('gr-next')?.focus({ preventScroll: true });
}

function toggleGrammarToc(force) {
  const toc = document.getElementById('gr-toc');
  const btn = document.getElementById('gr-toc-btn');
  if (!toc) return;
  _tocOpen = typeof force === 'boolean' ? force : !_tocOpen;
  toc.hidden = !_tocOpen;
  if (btn) btn.setAttribute('aria-expanded', _tocOpen ? 'true' : 'false');
  modal()?.classList.toggle('toc-open', _tocOpen);
  if (_tocOpen) toc.querySelector('.gr-toc-item.is-current')?.focus({ preventScroll: true });
}

// A példák felolvasása (a nyíl a ragozási példákban szünet)
function speakGrammar(lesson, i, j) {
  const ex = grammarOf(lesson)?.points?.[i]?.ex?.[j];
  if (ex) speakWord(ex[0].replace(/[→・]/g, '、').replace(/…/g, ''), false);
}

const isGrammarOpen = () => !!modal()?.classList.contains('open');
const openGrammarLesson = () => _lesson;
const grammarStepIndex = () => _step;
// Húzás és nyílbillentyű az utolsó lépésen nem zár be: arra a Befejezés gomb való
const atLastStep = () => { const g = grammarOf(_lesson); return !g || _step >= g.points.length - 1; };

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    if (!isGrammarOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (_tocOpen) { toggleGrammarToc(false); document.getElementById('gr-toc-btn')?.focus({ preventScroll: true }); } else closeGrammar();
      return;
    }
    if (_tocOpen || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && !atLastStep()) { e.preventDefault(); grammarStep(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); grammarStep(-1); }
  });
  // A nyitott Tartalom a mellé koppintásra bezárul
  document.addEventListener('click', e => {
    if (!_tocOpen || !isGrammarOpen() || !e.target.closest) return;
    if (!e.target.closest('#gr-toc, #gr-toc-btn')) toggleGrammarToc(false);
  });
  // Vízszintes húzás a tartalmon: balra a következő, jobbra az előző lépés
  let _touch = null;
  document.addEventListener('touchstart', e => {
    if (!isGrammarOpen() || _tocOpen || !e.target.closest || !e.target.closest('#gr-stage')) { _touch = null; return; }
    const t = e.touches[0];
    _touch = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!_touch || !isGrammarOpen()) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - _touch.x;
    const dy = t.clientY - _touch.y;
    _touch = null;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6 && !(dx < 0 && atLastStep())) grammarStep(dx < 0 ? 1 : -1);
  }, { passive: true });
}

export { closeGrammar, grammarGo, grammarLessons, grammarRowHtml, grammarStep, grammarStepIndex, hasGrammar, isGrammarOpen, openGrammar, openGrammarLesson, speakGrammar, toggleGrammarToc };
