// LexiLearn – features/word-info.js (V13.33)
// Szómagyarázat japán módban: a kártyák hátoldalán egy "i" gomb, ami alulról nyíló lapon mutatja
// a szó tudnivalóit (szófaj, témakör, szint, lecke, használat, buktató, kapcsolódó szavak, példa),
// és hibás válasz után egy rövid sor: mit választottál helyette, és mire figyelj.
// A kézzel írt jegyzetek a word_notes.js-ben vannak (kana szerint); ahol nincs, az automatikus
// adatok akkor is megjelennek.
import { WORD_NOTES } from '../core/data.js';
import { currentMode, state } from '../core/state.js';
import { escHtml, jsArg } from '../core/util.js';
import { counterNote } from '../core/counters.js';
import { wordWriting } from './kanji-links.js';
import { getExampleSentence } from '../practice/engine.js';

const POS_TAGS = { 'igék': 'Ige', 'melléknevek': 'Melléknév', 'határozószavak': 'Határozószó', 'számlálószavak': 'Számláló', 'kérdőszavak': 'Kérdőszó', 'jövevényszavak': 'Jövevényszó' };
const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
const INFO_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="7" r="0.6" fill="currentColor"/></svg>';

const hasWordInfo = word => !!word && currentMode === 'japanese';
const noteOf = word => (hasWordInfo(word) && WORD_NOTES[word.en]) || null;
const wordByEn = en => state.words.find(w => w.en === en) || null;

function lessonLabel(word) {
  const lessons = (Array.isArray(word.lesson) ? word.lesson : [word.lesson])
    .map(Number).filter(n => Number.isFinite(n) && n >= 1).sort((a, b) => a - b);
  return lessons.length ? `Dekiru ${lessons.join(', ')}. lecke` : '';
}

// Szófaj: a jegyzet pontosabb megnevezése (pl. igecsoport), különben a témakör-címkéből
function posLabel(word, note) {
  const fromTag = (word.tags || []).map(t => POS_TAGS[t]).find(Boolean) || '';
  if (!note || !note.pos) return fromTag;
  // V13.51: a „hangutánzó határozószó, する-ige” sem ige elsősorban (mint a melléknév)
  return /ige\b/.test(note.pos) && !/melléknév|határozószó/.test(note.pos) ? `Ige · ${note.pos}` : note.pos[0].toUpperCase() + note.pos.slice(1);
}

const topicsOf = word => (word.tags || []).filter(t => !POS_TAGS[t]);

/* ── Kártyán: "i" gomb és a Figyelj sor ─────────────────── */

// A kártya hátoldalának jobb felső sarkába; a húzást nem indítja (data-no-swipe)
function infoButtonHtml(word) {
  if (!hasWordInfo(word)) return '';
  const has = !!noteOf(word);
  return `<button type="button" class="info-btn${has ? ' has-note' : ''}" data-no-swipe
    onclick="event.stopPropagation(); openWordInfo(${jsArg(word.id)})"
    aria-label="Tudnivalók a szóról${has ? '' : ' (témakör, szint, példa)'}">${INFO_ICON}</button>`;
}

// A tanuló kártya hátoldalán: a buktató egy sorban (ha van)
function watchLineHtml(word) {
  const note = noteOf(word);
  return note && note.watch
    ? `<p class="card-watch"><span class="card-watch-label">Figyelj</span> ${escHtml(note.watch)}</p>`
    : '';
}

/* ── Hibás válasz után ──────────────────────────────────── */

const relOf = word => (noteOf(word)?.rel || []);
const isRelated = (a, b) => relOf(a).includes(b.en) || relOf(b).includes(a.en);

// A választott (rossz) lehetőség szava: a jelentés vagy a kana alapján; a kapcsolódó szó előnyben
function pickedWordOf(word, picked) {
  if (!picked) return null;
  const hits = state.words.filter(w => w.id !== word.id && (w.hu === picked || w.en === picked));
  return hits.find(w => isRelated(word, w)) || hits[0] || null;
}

function missNoteHtml(word, picked = null) {
  if (!hasWordInfo(word)) return '';
  const note = noteOf(word);
  const other = pickedWordOf(word, picked);
  const lines = [];
  if (other) {
    const label = isRelated(word, other) ? 'Összekeverted' : 'Amit választottál';
    lines.push(`<p class="miss-line"><span class="miss-label">${label}</span><b lang="ja">${escHtml(other.en)}</b> = ${escHtml(other.hu)}</p>`);
  }
  if (note && note.watch) lines.push(`<p class="miss-line"><span class="miss-label">Figyelj</span>${escHtml(note.watch)}</p>`);
  return `<div class="miss-note">
    ${lines.join('')}
    <button type="button" class="miss-more" onclick="openWordInfo(${jsArg(word.id)})">Tudnivalók a szóról${CHEVRON}</button>
  </div>`;
}

// A sor a látható részre gördül (a rögzített Tovább gomb fölé: scroll-margin-bottom a CSS-ben)
function fillMissNote(slotId, word, picked = null) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  slot.innerHTML = missNoteHtml(word, picked);
  const note = slot.firstElementChild;
  if (!note || typeof note.scrollIntoView !== 'function') return;
  const smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // a válasz utáni fókusz (Tovább gomb, 30 ms) után, különben megszakítaná a sima görgetést
  setTimeout(() => { if (note.isConnected) note.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' }); }, 80);
}

/* ── Az alulról nyíló lap ───────────────────────────────── */

let _history = [];      // a lapon belül megnyitott kapcsolódó szavak (vissza gombhoz)
let _returnFocus = null;

const modal = () => document.getElementById('word-info-modal');

function sheetHtml(word) {
  const note = noteOf(word);
  const writing = wordWriting(word);
  const sub = [writing, word.romaji].filter(Boolean).join(' · ');
  const level = [word.diff, lessonLabel(word)].filter(Boolean).join(' · ');
  const counter = counterNote(word);
  const chips = [
    posLabel(word, note),
    ...topicsOf(word).map(t => `Témakör: ${t}`),
    level,
    counter === null ? '' : `Számláló${counter ? ` · ${counter}` : ''}`
  ].filter(Boolean);
  const rel = (note?.rel || []).map(wordByEn).filter(Boolean);
  const example = getExampleSentence(word);
  const prev = _history.length ? state.words.find(w => w.id === _history[_history.length - 1]) : null;

  return `
    ${prev ? `<button type="button" class="wi-back" onclick="wordInfoBack()">${BACK}<span lang="ja">${escHtml(prev.en)}</span></button>` : ''}
    <div class="wi-head">
      <div class="wi-title">
        <div class="wi-word" id="word-info-word" lang="ja">${escHtml(word.en)}</div>
        ${sub ? `<div class="wi-sub" lang="ja">${escHtml(sub)}</div>` : ''}
      </div>
      <button type="button" class="inspector-close" onclick="closeWordInfo()" aria-label="Bezárás">×</button>
    </div>
    <p class="wi-meaning">${escHtml(word.hu)}</p>
    ${chips.length ? `<div class="wi-chips">${chips.map(c => `<span class="wi-chip">${escHtml(c)}</span>`).join('')}</div>` : ''}
    ${note && note.use ? `<section class="wi-sec"><h3 class="wi-label">Használat</h3><p class="wi-text">${escHtml(note.use)}</p></section>` : ''}
    ${note && note.watch ? `<section class="wi-sec is-watch"><h3 class="wi-label">Figyelj</h3><p class="wi-text">${escHtml(note.watch)}</p></section>` : ''}
    ${note ? '' : '<p class="wi-empty">Ehhez a szóhoz még nincs használati leírás.</p>'}
    ${rel.length ? `<section class="wi-sec"><h3 class="wi-label">Kapcsolódó szavak</h3>
      <div class="wi-rel">${rel.map(r => `<button type="button" class="wi-rel-btn" onclick="openWordInfo(${jsArg(r.id)}, true)"><b lang="ja">${escHtml(r.en)}</b><span>${escHtml(r.hu)}</span>${CHEVRON}</button>`).join('')}</div>
    </section>` : ''}
    ${example.html ? `<section class="wi-sec"><h3 class="wi-label">Példa</h3>
      <div class="wi-example" lang="ja">${example.html}</div>
      ${example.hu ? `<p class="wi-example-hu">${escHtml(example.hu)}</p>` : ''}
    </section>` : ''}`;
}

function render(word) {
  const body = document.getElementById('word-info-body');
  if (!body) return;
  body.innerHTML = sheetHtml(word);
  body.scrollTop = 0;
  const host = modal()?.querySelector('.modal');
  if (host) host.scrollTop = 0;
}

// fromSheet: a lapon belül, egy kapcsolódó szóra koppintva (a vissza gomb ide tér vissza)
function openWordInfo(id, fromSheet = false) {
  const word = state.words.find(w => w.id === id);
  const host = modal();
  if (!word || !host || !hasWordInfo(word)) return;
  if (fromSheet) {
    const current = document.getElementById('word-info-word');
    const currentWord = current ? wordByEn(current.textContent) : null;
    if (currentWord) _history.push(currentWord.id);
  } else {
    _history = [];
    _returnFocus = document.activeElement;
  }
  render(word);
  if (!host.classList.contains('open')) {
    host.classList.add('open');
    host.setAttribute('aria-hidden', 'false');
  }
  setTimeout(() => host.querySelector('.inspector-close')?.focus({ preventScroll: true }), 30);
}

function wordInfoBack() {
  const id = _history.pop();
  const word = id && state.words.find(w => w.id === id);
  if (word) render(word);
}

function closeWordInfo() {
  const host = modal();
  if (!host || !host.classList.contains('open')) return;
  host.classList.remove('open');
  host.setAttribute('aria-hidden', 'true');
  _history = [];
  if (_returnFocus && document.contains(_returnFocus)) {
    try { _returnFocus.focus({ preventScroll: true }); } catch (e) { /* régi böngésző */ }
  }
  _returnFocus = null;
}

const isWordInfoOpen = () => !!modal()?.classList.contains('open');

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isWordInfoOpen()) { e.preventDefault(); closeWordInfo(); }
  });
  // A sötétített háttérre koppintva bezárul
  document.addEventListener('click', e => {
    const host = modal();
    if (host && e.target === host && isWordInfoOpen()) closeWordInfo();
  });
}

export { closeWordInfo, fillMissNote, hasWordInfo, infoButtonHtml, isWordInfoOpen, missNoteHtml, noteOf, openWordInfo, posLabel, watchLineHtml, wordInfoBack };
