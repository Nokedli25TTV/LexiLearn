// LexiLearn – features/grammar.js (V13.35)
// Nyelvtan leckénként japán módban: a Gyakorlás fülön, ha egy Dekiru-lecke van kiválasztva, egy sor
// nyitja az alulról nyíló lapot. A lapon a lecke szerkezetei a könyv sorrendjében, kinyitható sorokban
// (minta, név → magyarázat, példák felolvasással, buktató), alul az előző és a következő lecke.
// A tartalom a grammar_notes.js-ben van (GRAMMAR_NOTES, lecke szerint).
import { GRAMMAR_NOTES } from '../core/data.js';
import { currentMode } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { speakWord } from '../practice/tts.js';

const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';
const CHEVRON_DOWN = '<svg class="gr-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
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

/* ── Az alulról nyíló lap ───────────────────────────────── */

let _returnFocus = null;
let _lesson = null;
const modal = () => document.getElementById('grammar-modal');

function pointHtml(p, lesson, i) {
  const examples = (p.ex || []).map(([ja, hu], j) => `
    <li class="gr-ex">
      <button type="button" class="gr-speak" onclick="speakGrammar(${lesson}, ${i}, ${j})" aria-label="Felolvasás: ${escHtml(ja)}">${SPEAKER}</button>
      <span class="gr-ex-text"><span class="gr-ja" lang="ja">${escHtml(ja)}</span><span class="gr-hu">${huText(hu)}</span></span>
    </li>`).join('');
  return `
    <details class="gr-point">
      <summary><span class="gr-sum"><span class="gr-pattern" lang="ja">${jaPattern(p.pattern)}</span><span class="gr-name">${huText(p.name)}</span></span>${CHEVRON_DOWN}</summary>
      <div class="gr-body">
        <p class="wi-text">${huText(p.text)}</p>
        ${examples ? `<ul class="gr-examples">${examples}</ul>` : ''}
        ${p.watch ? `<section class="wi-sec is-watch"><h3 class="wi-label">Figyelj</h3><p class="wi-text">${huText(p.watch)}</p></section>` : ''}
      </div>
    </details>`;
}

function sheetHtml(lesson) {
  const g = grammarOf(lesson);
  const all = grammarLessons();
  const i = all.indexOf(lesson);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  return `
    <div class="wi-head">
      <div class="wi-title">
        <div class="gr-kicker">Nyelvtan · Dekiru ${bookOf(lesson)}. könyv</div>
        <h2 class="gr-title" id="grammar-title">${lesson}. lecke · ${escHtml(g.title)}</h2>
      </div>
      <button type="button" class="inspector-close" onclick="closeGrammar()" aria-label="Bezárás">×</button>
    </div>
    <div class="gr-list">${g.points.map((p, n) => pointHtml(p, lesson, n)).join('')}</div>
    <nav class="gr-nav" aria-label="Leckék">
      ${prev ? `<button type="button" class="gr-nav-btn" onclick="openGrammar(${prev})">${BACK}${prev}. lecke</button>` : '<span></span>'}
      ${next ? `<button type="button" class="gr-nav-btn is-next" onclick="openGrammar(${next})">${next}. lecke${CHEVRON}</button>` : ''}
    </nav>`;
}

function openGrammar(lesson) {
  lesson = Number(lesson);
  const host = modal();
  const body = document.getElementById('grammar-body');
  if (!host || !body || !hasGrammar(lesson)) return;
  const wasOpen = host.classList.contains('open');
  if (!wasOpen) _returnFocus = document.activeElement;
  _lesson = lesson;
  body.innerHTML = sheetHtml(lesson);
  const sheet = host.querySelector('.modal');
  if (sheet) sheet.scrollTop = 0;
  if (!wasOpen) {
    host.classList.add('open');
    host.setAttribute('aria-hidden', 'false');
  }
  setTimeout(() => host.querySelector('.inspector-close')?.focus({ preventScroll: true }), 30);
}

function closeGrammar() {
  const host = modal();
  if (!host || !host.classList.contains('open')) return;
  host.classList.remove('open');
  host.setAttribute('aria-hidden', 'true');
  _lesson = null;
  if (_returnFocus && document.contains(_returnFocus)) {
    try { _returnFocus.focus({ preventScroll: true }); } catch (e) { /* régi böngésző */ }
  }
  _returnFocus = null;
}

// A példák felolvasása (a nyíl a ragozási példákban szünet)
function speakGrammar(lesson, i, j) {
  const ex = grammarOf(lesson)?.points?.[i]?.ex?.[j];
  if (ex) speakWord(ex[0].replace(/[→・]/g, '、').replace(/…/g, ''), false);
}

const isGrammarOpen = () => !!modal()?.classList.contains('open');
const openGrammarLesson = () => _lesson;

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isGrammarOpen()) { e.preventDefault(); closeGrammar(); }
  });
  document.addEventListener('click', e => {
    const host = modal();
    if (host && e.target === host && isGrammarOpen()) closeGrammar();
  });
}

export { closeGrammar, grammarLessons, grammarRowHtml, hasGrammar, isGrammarOpen, openGrammar, openGrammarLesson, speakGrammar };
