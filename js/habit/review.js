// LexiLearn – habit/review.js
// V13.5: ESEDÉKES ISMÉTLÉS (Anki-szerű). A kártya elöl a szót mutatja, koppintásra megfordul, és csak
// utána lehet értékelni: Újra / Nehéz / Jó / Könnyű (1-4), mindegyik alatt a következő ismétlésig
// hátralévő idő. Húzással: balra Újra, jobbra Jó. Az "Újra" kártya a mai sor végére kerül.
// Egy alkalom legfeljebb REVIEW_BATCH_SIZE kártya; minden értékelés azonnal mentődik.
import { todayKey } from '../core/dates.js';
import { currentMode, state } from '../core/state.js';
import { saveStats, saveWords } from '../core/storage.js';
import { escHtml } from '../core/util.js';
import { AGAIN, HARD, GOOD, EASY } from '../srs/fsrs.js';
import { REVIEW_BATCH_SIZE, dueForecast, fmtInterval, getDueWords, previewWord, rateWord } from '../srs/schedule.js';
import { getDailyGoal, getNewWordPool, getTodayWords, logActivity } from './goal.js';
import { renderHome } from './home.js';
import { getExampleSentence, updatePracticeTop } from '../practice/engine.js';
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

let _reviewFlipped = false;
let _reviewRevealed = false; // a jelentést egyszer már megnézte → értékelhet (visszafordítva is)

function startReviewSession() {
  const due = getDueWords(state.words);
  if (due.length === 0) { showToast('Mára nincs esedékes ismétlés.'); renderHome(); return; }
  const ids = due.slice(0, REVIEW_BATCH_SIZE).map(w => w.id);
  state.practice = {
    type: 'review', origin: 'home',
    queue: [...ids], batchIds: ids, doneIds: [], againIds: [],
    counts: { [AGAIN]: 0, [HARD]: 0, [GOOD]: 0, [EASY]: 0 },
    roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
  };
  showScreen('practice');
  showReviewCard();
}

function currentReviewWord() {
  const p = state.practice;
  return p && p.type === 'review' && p.queue.length ? state.words.find(w => w.id === p.queue[0]) : null;
}

function showReviewCard() {
  const p = state.practice;
  updatePracticeTop('Ismétlés', p.doneIds.length, p.batchIds.length);
  if (p.queue.length === 0) { showReviewComplete(); return; }

  const word = currentReviewWord();
  if (!word) { p.queue.shift(); showReviewCard(); return; }
  _reviewFlipped = false;
  _reviewRevealed = false;

  const isKanji = currentMode === 'kanji';
  const frontReading = currentMode === 'japanese' ? (word.romaji || '') : '';
  const backSrc = currentMode === 'japanese' && word.romaji ? `${word.en} · ${word.romaji}` : word.en;
  const kanjiReadings = isKanji
    ? `<div class="learn-readings">On: ${escHtml(word.onyomi || '–')} · Kun: ${escHtml(word.kunyomi || '–')}</div>`
    : '';
  const example = getExampleSentence(word);
  const isAgain = p.againIds.includes(word.id);
  const left = p.queue.length - 1;
  const preview = previewWord(word);

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-stage review-stage">
      <div class="learn-card review-card" id="review-card" role="button" tabindex="0" aria-label="Kártya: ${escHtml(word.en)}. Koppints a jelentésért.">
        <div class="learn-card-inner">
          <div class="learn-face learn-front">
            ${isAgain ? '<span class="learn-pill is-again">Újra</span>' : ''}
            <div class="learn-word ${isKanji ? 'learn-word-kanji' : ''}">${escHtml(word.en)}</div>
            ${frontReading ? `<div class="learn-reading">${escHtml(frontReading)}</div>` : ''}
            <div class="learn-tap-hint">Idézd fel a jelentést, aztán koppints</div>
          </div>
          <div class="learn-face learn-back">
            <div class="learn-back-src">${escHtml(backSrc)}</div>
            <div class="learn-meaning">${escHtml(word.hu)}</div>
            ${kanjiReadings}
            ${example.html ? `
              <div class="learn-example">
                <div class="learn-example-src">${example.html}</div>
                ${example.hu && example.hu !== word.hu ? `<div class="learn-example-hu">${escHtml(example.hu)}</div>` : ''}
              </div>` : ''}
          </div>
        </div>
        <div class="swipe-stamp swipe-stamp-yes" aria-hidden="true">Jó</div>
        <div class="swipe-stamp swipe-stamp-no" aria-hidden="true">Újra</div>
      </div>

      <div class="review-controls" id="review-controls">
        <div class="review-reveal-row">
          <button class="review-reveal" onclick="flipReviewCard()">Mutasd a jelentést</button>
          <button class="swipe-speak" onclick="speakReviewWord()" aria-label="Kiejtés">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="review-rate" role="group" aria-label="Mennyire ment?">
          ${RATINGS.map(r => `
            <button class="rate-btn rate-${r.rating}" onclick="rateReview(${r.rating})" aria-keyshortcuts="${r.key}" tabindex="-1">
              <span class="rate-label">${r.label}</span>
              <span class="rate-when">${fmtInterval(preview[r.rating].days)}</span>
            </button>`).join('')}
        </div>
      </div>
      <p class="learn-left">${left > 0 ? `Még ${left} kártya` : 'Utolsó kártya'}</p>
    </div>`;

  const card = document.getElementById('review-card');
  attachSwipe(card, {
    onTap: flipReviewCard,
    // Értékelni csak a jelentés megnézése után lehet; előtte a húzás visszaugrik
    onSwipe: dir => (_reviewRevealed ? (rateReview(dir === 'right' ? GOOD : AGAIN, dir), true) : false)
  });
  setTimeout(() => speakWord(word.en, false), 250);
}

function speakReviewWord() {
  const word = currentReviewWord();
  if (word) speakWord(word.en, false);
}

function flipReviewCard() {
  const card = document.getElementById('review-card');
  const controls = document.getElementById('review-controls');
  if (!card || card.dataset.swipeLocked) return;
  _reviewFlipped = !_reviewFlipped;
  card.classList.toggle('flipped', _reviewFlipped);
  if (_reviewFlipped && !_reviewRevealed && controls) {
    _reviewRevealed = true;
    card.classList.add('is-revealed');
    controls.classList.add('is-revealed');
    controls.querySelectorAll('.rate-btn').forEach(b => b.removeAttribute('tabindex'));
    const good = controls.querySelector('.rate-3');
    if (good && document.activeElement && document.activeElement.classList.contains('review-reveal')) good.focus();
  }
}

// dir: a kártya kirepülési iránya ("left" csak az Újránál)
function rateReview(rating, dir) {
  const p = state.practice;
  if (!p || p.type !== 'review' || p.queue.length === 0 || !_reviewRevealed) return;
  const card = document.getElementById('review-card');
  if (!card || card.dataset.swipeLocked) return;
  flyOut(card, dir || (rating === AGAIN ? 'left' : 'right'), () => resolveReview(rating));
}

function resolveReview(rating) {
  const p = state.practice;
  const id = p.queue.shift();
  const word = state.words.find(w => w.id === id);
  if (word) {
    const today = todayKey();
    rateWord(word, rating, today);
    p.counts[rating]++;
    logActivity({ known: rating !== AGAIN });
    if (!state.globalStats.studyDays) state.globalStats.studyDays = {};
    state.globalStats.studyDays[today] = true; // az ismétlés is számít a konzisztenciába
    if (rating === AGAIN) {
      p.queue.push(id); // még ma, a sor végén visszajön
      if (!p.againIds.includes(id)) p.againIds.push(id);
    } else if (!p.doneIds.includes(id)) {
      p.doneIds.push(id);
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
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const c = p.counts;
  const summary = RATINGS.filter(r => c[r.rating] > 0).map(r => `${r.label} ${c[r.rating]}`).join(' · ');

  let next;
  if (remaining > 0) {
    next = `<button class="cta-learn cta-compact" onclick="startReviewSession()"><span class="cta-main">Még ${remaining} esedékes</span></button>`;
  } else if (canLearn) {
    next = `<button class="cta-learn cta-compact" onclick="startLearnSession()"><span class="cta-main">Új szavak tanulása</span></button>`;
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
      <div class="learn-done-actions">
        ${next}
        <button class="btn-quiet" onclick="showScreen('home')">Vissza a kezdőlapra</button>
      </div>
    </div>`;
}

// Billentyűzet: Szóköz / Enter fordít, 1-4 értékel (mint az Ankiban)
document.addEventListener('keydown', e => {
  const p = state.practice;
  if (!p || p.type !== 'review' || document.body.dataset.screen !== 'practice' || p.queue.length === 0) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  const r = RATINGS.find(x => x.key === e.key);
  if (r && _reviewRevealed) { e.preventDefault(); rateReview(r.rating); }
  else if ((e.key === ' ' || e.key === 'Enter') && !(e.target.closest && e.target.closest('button'))) {
    e.preventDefault();
    flipReviewCard();
  }
});

export { flipReviewCard, rateReview, resolveReview, showReviewCard, showReviewComplete, speakReviewWord, startReviewSession };
