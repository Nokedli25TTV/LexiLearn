// LexiLearn – habit/review.js
// V13.5: ESEDÉKES ISMÉTLÉS (Anki-szerű). A kártya elöl a szót mutatja, koppintásra megfordul, és csak
// utána lehet értékelni: Újra / Nehéz / Jó / Könnyű (1-4), mindegyik alatt a következő ismétlésig
// hátralévő idő. Húzással: balra Újra, jobbra Jó. Az "Újra" kártya a mai sor végére kerül.
// Egy alkalom legfeljebb getReviewBatch() kártya (alapból 20, a Profilban állítható); minden értékelés azonnal mentődik.
// V13.31: az önértékelés helyett alapból be kell gépelni a jelentést (vagy választani, vagy kártyánként vegyesen,
// a Profilban állítható). Hogy tudtad-e, azt a hibatűrő ellenőrző dönti el (core/answer.js); ha igen, te jelzed,
// mennyire ment (Nehéz / Jó / Könnyű, Enter = Jó), ha nem, Újra, amit az "Elírás volt" gomb felülírhat.
// A már stabil szavak fordított (magyar → japán / angol) kártyát is kapnak, saját ütemezéssel; a sorban "r:<id>".
// Minden kártya első mai eredménye a napi naplóba kerül (megtartási arány a Statisztikában).
import { todayKey } from '../core/dates.js';
import { checkJapanese, checkMeaning } from '../core/answer.js';
import { counterTagHtml } from '../core/counters.js';
import { focusFlagHtml } from '../features/bookmarks.js';
import { updateQuestProgress } from '../features/quests.js';
import { fillMissNote, infoButtonHtml, isWordInfoOpen } from '../features/word-info.js';
import { kanjiLinksHtml, wordWriting } from '../features/kanji-links.js';
import { currentMode, isCharMode, NEW_ITEMS, state, unitOf } from '../core/state.js';
import { saveStats, saveWords } from '../core/storage.js';
import { escHtml, japaneseBackLine, shuffle } from '../core/util.js';
import { mountStrokes, playStrokes, stopStrokes, strokeFigureHtml } from '../features/strokes.js';
import { AGAIN, HARD, GOOD, EASY } from '../srs/fsrs.js';
import { MATURE_DAYS, markReviewLearned } from '../goal/jlpt.js';
import { cardInterval, dueForecast, fmtInterval, getDueCards, previewWord, rateWord, seedReverseCards } from '../srs/schedule.js';
import { getDailyGoal, getNewWordPool, getReviewBatch, getReviewStyle, getTodayWords, logActivity } from './goal.js';
import { renderHome } from './home.js';
import { milestoneNoteHtml, progressBaseline } from './learn.js';
import { getExampleSentence, getSmartDistractors, updateKanaPreview, updatePracticeTop } from '../practice/engine.js';
import { speakWord } from '../practice/tts.js';
import { showScreen } from '../ui/screens.js';
import { attachSwipe, flyOut } from '../ui/swipe.js';
import { showToast } from '../ui/toast.js';

const RATINGS = [
  { rating: AGAIN, label: 'Újra', key: '1' },
  { rating: HARD, label: 'Nehéz', key: '2' },
  { rating: GOOD, label: 'Jó', key: '3' },
  { rating: EASY, label: 'Könnyű', key: '4' }
];
const PASS_RATINGS = RATINGS.filter(r => r.rating !== AGAIN);
const REVERSE_MODES = ['japanese', 'english']; // kandzsinál az Írás gyakorlás a fordított irány
const MIXED_STYLES = ['type', 'choice', 'self'];
const LANG_LABEL = { japanese: 'japán', english: 'angol' };

let _reviewFlipped = false;
let _reviewRevealed = false; // a jelentést egyszer már megnézte → értékelhet (visszafordítva is)

// Kártyakulcs a sorban: az eredeti a szó azonosítója (változatlanul), a fordított "r:<id>"
const revKey = id => `r:${id}`;
function parseKey(key) {
  if (typeof key === 'string' && key.startsWith('r:')) {
    const id = key.slice(2);
    return { word: state.words.find(w => String(w.id) === id) || null, rev: true };
  }
  return { word: state.words.find(w => w.id === key) || null, rev: false };
}

// A fordított kártyák napi adagja a mostani módban (a mai keret erejéig; a többi mód a betöltéskor kap)
function seedReverseForMode() {
  if (!REVERSE_MODES.includes(currentMode)) return 0;
  const n = seedReverseCards(state.words, state.globalStats);
  if (n) { saveWords(); saveStats(); }
  return n;
}

function startReviewSession() {
  seedReverseForMode();
  const due = getDueCards(state.words);
  if (due.length === 0) { showToast('Mára nincs esedékes ismétlés.'); renderHome(); return; }
  const ids = due.slice(0, getReviewBatch()).map(c => (c.rev ? revKey(c.word.id) : c.word.id));
  state.practice = {
    type: 'review', origin: 'home',
    queue: [...ids], batchIds: ids, doneIds: [], againIds: [], loggedIds: [],
    counts: { [AGAIN]: 0, [HARD]: 0, [GOOD]: 0, [EASY]: 0 },
    roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [], learnedNow: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    card: null, // a mostani kártya: { key, style, answer: null | 'pass' | 'miss', options, correct }
    ...progressBaseline()
  };
  showScreen('practice');
  showReviewCard();
}

function currentCard() {
  const p = state.practice;
  return p && p.type === 'review' && p.queue.length ? parseKey(p.queue[0]) : { word: null, rev: false };
}
function currentReviewWord() { return currentCard().word; }

const speakIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

function rateButtonsHtml(ratings, preview, extraClass = '') {
  return `<div class="review-rate${extraClass}" role="group" aria-label="Mennyire ment?">
    ${ratings.map(r => `
      <button class="rate-btn rate-${r.rating}" onclick="rateReview(${r.rating})" aria-keyshortcuts="${r.key}" tabindex="-1">
        <span class="rate-label">${r.label}</span>
        <span class="rate-when">${fmtInterval(preview[r.rating].days)}</span>
      </button>`).join('')}
  </div>`;
}

// Ami a kártya alatt van, a mód szerint: önértékelés (V13.5), gépelés vagy választás (V13.31)
function controlsHtml(style, rev, preview) {
  if (style === 'self') {
    return `
      <div class="review-controls" id="review-controls">
        <div class="review-reveal-row">
          <button class="review-reveal" onclick="flipReviewCard()">${rev ? 'Mutasd a választ' : 'Mutasd a jelentést'}</button>
          ${rev ? '' : `<button class="swipe-speak" onclick="speakReviewWord()" aria-label="Kiejtés">${speakIcon}</button>`}
        </div>
        ${rateButtonsHtml(RATINGS, preview)}
      </div>`;
  }
  const p = state.practice;
  const ask = style === 'type'
    ? `<form class="review-ask" onsubmit="submitReviewAnswer(); return false;" autocomplete="off">
        <input id="review-input" class="review-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"
          ${rev && currentMode === 'japanese' ? 'lang="ja"' : ''} placeholder="${rev ? (currentMode === 'japanese' ? 'Japánul (romajival is lehet)' : 'Angolul') : 'Írd be a jelentését'}"
          aria-label="${rev ? `A szó ${LANG_LABEL[currentMode] || ''}ul` : 'A szó jelentése'}">
        ${rev && currentMode === 'japanese' ? '<div class="kana-preview" id="kana-preview" aria-live="polite"></div>' : ''}
        <div class="review-reveal-row">
          <button type="submit" class="review-reveal">Ellenőrzés</button>
          ${rev ? '' : `<button type="button" class="swipe-speak" onclick="speakReviewWord()" aria-label="Kiejtés">${speakIcon}</button>`}
        </div>
        <button type="button" class="dont-know" onclick="submitReviewAnswer(true)">Nem tudom</button>
      </form>`
    : `<div class="review-ask">
        <div class="options-grid review-options">
          ${p.card.options.map((o, i) => `<button class="opt-btn" data-i="${i}" ${rev && currentMode === 'japanese' ? 'lang="ja"' : ''} onclick="pickReviewOption(${i})">${escHtml(o)}</button>`).join('')}
        </div>
        <button type="button" class="dont-know" onclick="pickReviewOption(-1)">Nem tudom</button>
      </div>`;
  return `
    <div class="review-controls is-answer" id="review-controls">
      ${ask}
      <div class="review-after">
        <p class="review-verdict" id="review-verdict" aria-live="polite"></p>
        ${rateButtonsHtml(PASS_RATINGS, preview, ' is-three')}
        <div class="review-miss">
          <button class="review-reveal" onclick="rateReview(${AGAIN})">Tovább<span class="review-next-note">Újra · ma</span></button>
          ${style === 'type' ? '<button class="btn-quiet" onclick="acceptReviewAnswer()">Elírás volt, tudtam</button>' : ''}
        </div>
        <div class="miss-slot" id="review-miss-note"></div>
      </div>
    </div>`;
}

function pickStyle() {
  const s = getReviewStyle();
  return s === 'mixed' ? MIXED_STYLES[Math.floor(Math.random() * MIXED_STYLES.length)] : s;
}

// Négy lehetőség: a helyes válasz és három hasonló (azonos témakör vagy szint) szóé, ismétlődés nélkül
function choiceOptions(word, rev) {
  const correct = rev ? word.en : word.hu;
  const others = [...new Set(getSmartDistractors(word, 6, !rev))].filter(o => o && o !== correct).slice(0, 3);
  const options = shuffle([correct, ...others]);
  return { options, correct: options.indexOf(correct) };
}

function showReviewCard() {
  const p = state.practice;
  updatePracticeTop('Ismétlés', p.doneIds.length, p.batchIds.length);
  if (p.queue.length === 0) { showReviewComplete(); return; }

  const { word, rev } = currentCard();
  if (!word) { p.queue.shift(); showReviewCard(); return; }
  _reviewFlipped = false;
  _reviewRevealed = false;
  const style = pickStyle();
  p.card = { key: p.queue[0], style, answer: null, ...(style === 'choice' ? choiceOptions(word, rev) : {}) };

  const isKanji = isCharMode(); // V13.23: radikálnál is egy írásjegy
  const frontReading = currentMode === 'japanese' ? (word.romaji || '') : '';
  const writing = wordWriting(word);
  const backSrc = japaneseBackLine(word, currentMode, writing);
  const links = kanjiLinksHtml(word, currentMode); // V13.18: kandzsi ↔ szó
  const strokes = isKanji ? strokeFigureHtml(word.en) : ''; // V13.9: vonássorrend a hátoldalon
  const kanjiReadings = isKanji
    ? `<div class="learn-readings">${currentMode === 'radicals' && word.romaji ? `${escHtml(word.romaji)} · ` : ''}On: ${escHtml(word.onyomi || '–')} · Kun: ${escHtml(word.kunyomi || '–')}</div>`
    : '';
  const example = getExampleSentence(word);
  const isAgain = p.againIds.includes(p.queue[0]);
  const left = p.queue.length - 1;
  const preview = previewWord(word, todayKey(), rev);
  // Gépelésnél és választásnál a kártya alatti mező / gombok magukért beszélnek: ott nincs tipp
  const hint = style !== 'self' ? '' : rev ? 'Idézd fel, aztán koppints' : 'Idézd fel a jelentést, aztán koppints';
  const exampleHtml = example.html ? `
              <div class="learn-example">
                <div class="learn-example-src">${example.html}</div>
                ${example.hu && example.hu !== word.hu ? `<div class="learn-example-hu">${escHtml(example.hu)}</div>` : ''}
              </div>` : '';
  // Egy semleges címke (a korall a Kezdőlap fő cselekvéséé): Újra, irány, vagy mindkettő
  const pillText = [isAgain ? 'Újra' : '', rev ? `Magyar → ${LANG_LABEL[currentMode]}` : ''].filter(Boolean).join(' · ');
  const pills = pillText ? `<span class="learn-pill is-again">${pillText}</span>` : '';

  // Fordított kártya: elöl a magyar jelentés, hátul a szó (írásmóddal, olvasattal)
  const front = rev
    ? `${pills}<div class="learn-meaning review-prompt">${escHtml(word.hu)}</div>${counterTagHtml(word)}${hint ? `<div class="learn-tap-hint">${hint}</div>` : ''}`
    : `${pills}<div class="learn-word ${isKanji ? 'learn-word-kanji' : ''}">${escHtml(word.en)}</div>
            ${frontReading ? `<div class="learn-reading">${escHtml(frontReading)}</div>` : ''}
            ${counterTagHtml(word)}
            ${hint ? `<div class="learn-tap-hint">${hint}</div>` : ''}`;
  const back = rev
    ? `<div class="learn-back-src">${escHtml(word.hu)}</div>
            <div class="learn-word"${currentMode === 'japanese' ? ' lang="ja"' : ''}>${escHtml(word.en)}</div>
            ${currentMode === 'japanese' ? `<div class="learn-reading">${escHtml([writing, word.romaji].filter(Boolean).join(' · '))}</div>` : ''}
            ${counterTagHtml(word)}${links}${exampleHtml}`
    : `${strokes || `<div class="learn-back-src">${escHtml(backSrc)}</div>`}
            <div class="learn-meaning">${escHtml(word.hu)}</div>
            ${counterTagHtml(word)}
            ${kanjiReadings}
            ${links}${exampleHtml}`;

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-stage review-stage${style === 'self' ? '' : ' is-answering'}">
      <div class="learn-card review-card" id="review-card" role="button" tabindex="0" aria-label="${rev ? `Kártya: ${escHtml(word.hu)}. Add meg ${LANG_LABEL[currentMode]}ul.` : `Kártya: ${escHtml(word.en)}. ${style === 'self' ? 'Koppints a jelentésért.' : 'Add meg a jelentését.'}`}">
        <div class="learn-card-inner">
          <div class="learn-face learn-front">
            ${front}
          </div>
          <div class="learn-face learn-back${!rev && strokes ? ' has-strokes' : ''}">
            ${infoButtonHtml(word)}${focusFlagHtml(word)}
            ${back}
          </div>
        </div>
        <div class="swipe-stamp swipe-stamp-yes" aria-hidden="true">Jó</div>
        <div class="swipe-stamp swipe-stamp-no" aria-hidden="true">Újra</div>
      </div>
      ${controlsHtml(style, rev, preview)}
      <p class="learn-left">${left > 0 ? `Még ${left} kártya` : 'Utolsó kártya'}</p>
    </div>`;

  const card = document.getElementById('review-card');
  if (!rev && strokes) mountStrokes(card);
  attachSwipe(card, {
    onTap: flipReviewCard,
    // Értékelni csak a jelentés megnézése után lehet; előtte a húzás visszaugrik. Gépelésnél és választásnál
    // az eredményt az ellenőrzés adja, ezért ott nincs húzás.
    onSwipe: dir => (style === 'self' && _reviewRevealed ? (rateReview(dir === 'right' ? GOOD : AGAIN, dir), true) : false)
  });
  const input = document.getElementById('review-input');
  if (input) {
    const kana = document.getElementById('kana-preview');
    if (kana) input.addEventListener('input', () => updateKanaPreview(input, kana, word));
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { /* régi böngésző */ } }, 60);
  }
  // A fordított kártyán a kiejtés elárulná a választ: csak a válasz után szól
  if (!rev) setTimeout(() => speakWord(word.en, false), 250);
}

function speakReviewWord() {
  const word = currentReviewWord();
  if (word) speakWord(word.en, false);
}

function revealCard(card) {
  card.classList.add('flipped', 'is-revealed');
  _reviewFlipped = true;
  _reviewRevealed = true;
  playStrokes(card);
}

function flipReviewCard() {
  const p = state.practice;
  const card = document.getElementById('review-card');
  const controls = document.getElementById('review-controls');
  if (!card || card.dataset.swipeLocked || !p || !p.card) return;
  // Gépelésnél és választásnál a válasz előtt nem lehet megnézni (az a "Nem tudom")
  if (p.card.style !== 'self' && !p.card.answer) return;
  _reviewFlipped = !_reviewFlipped;
  card.classList.toggle('flipped', _reviewFlipped);
  if (_reviewFlipped) playStrokes(card); else stopStrokes(card);
  if (_reviewFlipped && !_reviewRevealed && controls) {
    _reviewRevealed = true;
    card.classList.add('is-revealed');
    controls.classList.add('is-revealed');
    controls.querySelectorAll('.rate-btn').forEach(b => b.removeAttribute('tabindex'));
    const good = controls.querySelector('.rate-3');
    if (good && document.activeElement && document.activeElement.classList.contains('review-reveal')) good.focus();
    card.classList.add('show-flag'); // önértékelés: a jelentés után dől el, hogy hibás-e
    if (currentCard().rev) speakReviewWord();
  }
}

// A válasz eredménye: a kártya megfordul, alatta az értékelés (helyes) vagy a Tovább (hibás)
function showAnswer(result, verdict, picked = null) {
  const p = state.practice;
  const card = document.getElementById('review-card');
  const controls = document.getElementById('review-controls');
  if (!card || !controls) return;
  p.card.answer = result;
  revealCard(card);
  controls.classList.add('is-answered', result === 'pass' ? 'is-pass' : 'is-miss');
  controls.classList.toggle('is-revealed', result === 'pass');
  const v = document.getElementById('review-verdict');
  if (v) { v.textContent = verdict; v.classList.toggle('is-pass', result === 'pass'); }
  if (result === 'miss') {
    fillMissNote('review-miss-note', currentCard().word, picked); // V13.33: mit választottál, mire figyelj
    card.classList.add('show-flag'); // V13.61: a hibás szó egy koppintással a lecke fókusz listájába
  }
  controls.querySelectorAll('.review-ask input, .review-ask button').forEach(el => { el.disabled = true; });
  controls.querySelectorAll('.rate-btn').forEach(b => b.removeAttribute('tabindex'));
  const focus = result === 'pass' ? controls.querySelector('.rate-3') : controls.querySelector('.review-miss .review-reveal');
  if (focus) setTimeout(() => focus.focus({ preventScroll: true }), 30);
  if (currentCard().rev) speakReviewWord();
}

// Gépelés: a hibatűrő ellenőrző dönt (ékezet, írásjel, névelő, egy jelentés a többől, kis elírás nem számít)
function submitReviewAnswer(giveUp = false) {
  const p = state.practice;
  if (!p || p.type !== 'review' || !p.card || p.card.style !== 'type' || p.card.answer) return;
  const { word, rev } = currentCard();
  const input = document.getElementById('review-input');
  if (!word || !input) return;
  const typed = input.value.trim();
  if (!giveUp && !typed) { input.focus(); return; }
  if (giveUp) { showAnswer('miss', 'A helyes válasz a kártyán.'); return; }
  const result = !rev ? checkMeaning(typed, word.hu, 'hu')
    : currentMode === 'japanese' ? checkJapanese(typed, { kana: word.en, writing: wordWriting(word), romaji: word.romaji })
    : checkMeaning(typed, word.en, 'en');
  if (result.ok) showAnswer('pass', result.exact ? 'Helyes.' : 'Majdnem pontos, elfogadva.');
  else showAnswer('miss', 'Nem ez volt. A helyes válasz a kártyán.');
}

// Választás: a rossz választás semleges jelölést kap (az Újra nem hiba, hanem a tanulás része), a helyes zöldet
function pickReviewOption(i) {
  const p = state.practice;
  if (!p || p.type !== 'review' || !p.card || p.card.style !== 'choice' || p.card.answer) return;
  const buttons = document.querySelectorAll('.review-options .opt-btn');
  buttons.forEach(b => {
    const n = Number(b.dataset.i);
    if (n === p.card.correct) b.classList.add('correct');
    else if (n === i) b.classList.add('is-picked');
  });
  const pass = i === p.card.correct;
  showAnswer(pass ? 'pass' : 'miss', pass ? 'Helyes.' : 'A helyes válasz kiemelve.', i >= 0 ? p.card.options[i] : null);
}

// "Elírás volt, tudtam": a hibásnak vett gépelés mégis helyes, értékelhető
function acceptReviewAnswer() {
  const p = state.practice;
  const controls = document.getElementById('review-controls');
  if (!p || !p.card || p.card.answer !== 'miss' || p.card.style !== 'type' || !controls) return;
  p.card.answer = 'pass';
  controls.classList.remove('is-miss');
  controls.classList.add('is-pass', 'is-revealed');
  const v = document.getElementById('review-verdict');
  if (v) { v.textContent = 'Elfogadva.'; v.classList.add('is-pass'); }
  const good = controls.querySelector('.rate-3');
  if (good) good.focus({ preventScroll: true });
}

// dir: a kártya kirepülési iránya ("left" csak az Újránál)
function rateReview(rating, dir) {
  const p = state.practice;
  if (!p || p.type !== 'review' || p.queue.length === 0 || !_reviewRevealed) return;
  // Gépelésnél és választásnál a hibás válasz Újra, a helyes nem lehet Újra (kivéve, ha te kéred: 1-es billentyű)
  if (p.card && p.card.style !== 'self' && p.card.answer === 'miss' && rating !== AGAIN) return;
  const card = document.getElementById('review-card');
  if (!card || card.dataset.swipeLocked) return;
  flyOut(card, dir || (rating === AGAIN ? 'left' : 'right'), () => resolveReview(rating));
}

function resolveReview(rating) {
  const p = state.practice;
  const key = p.queue.shift();
  const { word, rev } = parseKey(key);
  if (word) {
    const today = todayKey();
    const mature = cardInterval(word, rev) >= MATURE_DAYS; // az értékelés előtti köz
    rateWord(word, rating, today, rev);
    if (!rev && markReviewLearned(word, rating, today)) p.learnedNow.push(word.id); // V13.27
    p.counts[rating]++;
    // A megtartási arányba csak a kártya első mai eredménye számít (az Újra utáni ismétlés már nem)
    const first = !p.loggedIds.includes(key);
    if (first) p.loggedIds.push(key);
    logActivity({ known: rating !== AGAIN, review: first ? { passed: rating !== AGAIN, mature } : null });
    if (first) updateQuestProgress('reviewDone'); // V13.63: napi feladat (esedékes ismétlés)
    if (!state.globalStats.studyDays) state.globalStats.studyDays = {};
    state.globalStats.studyDays[today] = true; // az ismétlés is számít a konzisztenciába
    if (rating === AGAIN) {
      p.queue.push(key); // még ma, a sor végén visszajön
      if (!p.againIds.includes(key)) p.againIds.push(key);
    } else if (!p.doneIds.includes(key)) {
      p.doneIds.push(key);
    }
    saveWords();
    saveStats();
  }
  showReviewCard();
}

function showReviewComplete() {
  const p = state.practice;
  const f = dueForecast(state.words);
  const remaining = f.due;
  const learnedToday = getTodayWords().length;
  const newLeft = Math.max(0, getDailyGoal() - learnedToday);
  const canLearn = newLeft > 0 && getNewWordPool().length > 0;
  const unit = unitOf();
  const c = p.counts;
  const summary = RATINGS.filter(r => c[r.rating] > 0).map(r => `${r.label} ${c[r.rating]}`).join(' · ');
  const learned = p.learnedNow.map(id => state.words.find(w => w.id === id)).filter(Boolean);

  let next;
  if (remaining > 0) {
    next = `<button class="cta-learn cta-compact" onclick="startReviewSession()"><span class="cta-main">Még ${remaining} esedékes</span></button>`;
  } else if (canLearn) {
    next = `<button class="cta-learn cta-compact" onclick="startLearnSession()"><span class="cta-main">Új ${NEW_ITEMS[currentMode] || 'szavak'} tanulása</span></button>`;
  } else next = '';

  const sub = remaining > 0
    ? `Még ${remaining} ${unit} esedékes mára. Folytathatod most, vagy később.`
    : `Mára nincs több ismétlés.${f.tomorrow > 0 ? ` Holnap ${f.tomorrow} ${unit} jön.` : ''}`;

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-done">
      <div class="learn-done-badge" aria-hidden="true">✓</div>
      <h2 class="learn-done-title">${p.doneIds.length} ${unit} átismételve</h2>
      <p class="learn-done-sub">${sub}</p>
      ${summary ? `<p class="review-summary">${summary}</p>` : ''}
      ${milestoneNoteHtml(p)}
      ${learned.length ? `<p class="review-learned">${learned.length} új megtanult ${unit}</p>
      <div class="learn-done-words">${learned.map(w => `<span class="word-chip">${escHtml(w.en)} <span>${escHtml(w.hu)}</span></span>`).join('')}</div>` : ''}
      <div class="learn-done-actions">
        ${next}
        <button class="btn-quiet" onclick="showScreen('home')">Vissza a kezdőlapra</button>
      </div>
    </div>`;
}

// Billentyűzet: Szóköz / Enter fordít (önértékelésnél), 1-4 értékel (mint az Ankiban). A beviteli mezőben
// az Enter az ellenőrzés (a form küldése), ott a gyorsbillentyűk nem élnek.
document.addEventListener('keydown', e => {
  const p = state.practice;
  if (!p || p.type !== 'review' || document.body.dataset.screen !== 'practice' || p.queue.length === 0) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (isWordInfoOpen()) return; // V13.33: nyitott szómagyarázat alatt az értékelés nem fut
  const style = p.card ? p.card.style : 'self';
  if (style !== 'self' && !p.card.answer) {
    const n = Number(e.key);
    if (style === 'choice' && n >= 1 && n <= 4) { e.preventDefault(); pickReviewOption(n - 1); }
    return;
  }
  const r = RATINGS.find(x => x.key === e.key);
  if (r && _reviewRevealed) { e.preventDefault(); rateReview(r.rating); }
  else if (style === 'self' && (e.key === ' ' || e.key === 'Enter') && !(e.target.closest && e.target.closest('button'))) {
    e.preventDefault();
    flipReviewCard();
  }
});

export { acceptReviewAnswer, flipReviewCard, pickReviewOption, rateReview, resolveReview, seedReverseForMode, showReviewCard, showReviewComplete, speakReviewWord, startReviewSession, submitReviewAnswer };
