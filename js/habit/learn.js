// LexiLearn – habit/learn.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { currentMode, state } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { escHtml, shuffle } from '../core/util.js';
import { calcStreak } from '../features/streak.js';
import { LEARN_BATCH_SIZE, getDailyGoal, getNewWordPool, getTodayWords, logActivity, markWordLearned } from './goal.js';
import { dueForecast, scheduleLearnedWord } from '../srs/schedule.js';
import { renderHome } from './home.js';
import { getExampleSentence, showQuestion, updatePracticeTop } from '../practice/engine.js';
import { speakWord } from '../practice/tts.js';
import { launchConfetti } from '../ui/confetti.js';
import { showScreen } from '../ui/screens.js';
import { attachSwipe, flyOut } from '../ui/swipe.js';
import { showToast } from '../ui/toast.js';

/* ── ÚJ SZAVAK TANULÁSA (húzható kártyák) ─────────────── */
let _learnFlipped = false;

function startLearnSession() {
  const remaining = getDailyGoal() - getTodayWords().length;
  if (remaining <= 0) { renderHome(); return; }
  const batch = getNewWordPool().slice(0, Math.min(remaining, LEARN_BATCH_SIZE));
  if (batch.length === 0) { showToast('Nincs több új szó ebben a válogatásban.'); renderHome(); return; }

  const ids = batch.map(w => w.id);
  state.practice = {
    type: 'learn', origin: 'home',
    queue: [...ids], batchIds: ids, learnedIds: [], againIds: [],
    roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
  };
  showScreen('practice');
  showLearnCard();
}

function showLearnCard() {
  const p = state.practice;
  updatePracticeTop('Új szavak', p.learnedIds.length, p.batchIds.length);
  if (p.queue.length === 0) { showLearnComplete(); return; }

  const word = state.words.find(w => w.id === p.queue[0]);
  if (!word) { p.queue.shift(); showLearnCard(); return; }
  _learnFlipped = false;

  const isKanji = currentMode === 'kanji';
  const frontReading = currentMode === 'japanese' ? (word.romaji || '') : '';
  const backSrc = currentMode === 'japanese' && word.romaji ? `${word.en} · ${word.romaji}` : word.en;
  const kanjiReadings = isKanji
    ? `<div class="learn-readings">On: ${escHtml(word.onyomi || '–')} · Kun: ${escHtml(word.kunyomi || '–')}</div>`
    : '';
  const example = getExampleSentence(word);
  const isAgain = p.againIds.includes(word.id);
  const left = p.queue.length - 1;

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-stage">
      <div class="learn-card" id="learn-card" role="button" tabindex="0" aria-label="Kártya: ${escHtml(word.en)}. Koppints a jelentésért.">
        <div class="learn-card-inner">
          <div class="learn-face learn-front">
            <span class="learn-pill ${isAgain ? 'is-again' : ''}">${isAgain ? 'Újra' : (isKanji ? 'Új kanji' : 'Új szó')}</span>
            <div class="learn-word ${isKanji ? 'learn-word-kanji' : ''}">${escHtml(word.en)}</div>
            ${frontReading ? `<div class="learn-reading">${escHtml(frontReading)}</div>` : ''}
            <div class="learn-tap-hint">Koppints a jelentésért</div>
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
        <div class="swipe-stamp swipe-stamp-yes" aria-hidden="true">Tudom</div>
        <div class="swipe-stamp swipe-stamp-no" aria-hidden="true">Még nem</div>
      </div>

      <div class="learn-controls">
        <button class="swipe-btn swipe-btn-no" onclick="learnSwipe('left')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Még nem
        </button>
        <button class="swipe-speak" onclick="speakLearnWord()" aria-label="Kiejtés">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
        <button class="swipe-btn swipe-btn-yes" onclick="learnSwipe('right')">
          Tudom
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
      <p class="learn-left">${left > 0 ? `Még ${left} kártya` : 'Utolsó kártya'} · jobbra, ha megy, balra, ha még nem</p>
    </div>`;

  const card = document.getElementById('learn-card');
  attachSwipe(card, {
    onTap: flipLearnCard,
    onSwipe: dir => { learnSwipe(dir); return true; }
  });
  setTimeout(() => speakWord(word.en, false), 250);
}

function speakLearnWord() {
  const p = state.practice;
  const word = p && p.queue ? state.words.find(w => w.id === p.queue[0]) : null;
  if (word) speakWord(word.en, false);
}

function flipLearnCard() {
  const card = document.getElementById('learn-card');
  if (!card || card.dataset.swipeLocked) return;
  _learnFlipped = !_learnFlipped;
  card.classList.toggle('flipped', _learnFlipped);
}

function learnSwipe(dir) {
  const p = state.practice;
  if (!p || p.type !== 'learn' || p.queue.length === 0) return;
  const card = document.getElementById('learn-card');
  if (!card || card.dataset.swipeLocked) return;
  flyOut(card, dir, () => resolveLearnCard(dir === 'right'));
}

function resolveLearnCard(known) {
  const p = state.practice;
  const id = p.queue.shift();
  const word = state.words.find(w => w.id === id);
  logActivity({ known });
  if (word) {
    if (known) {
      // V13.5: a "Tudom" Jó értékelés; ha közben "Még nem" is volt, előbb Újra (így hamarabb jön vissza)
      scheduleLearnedWord(word, p.againIds.includes(id));
      markWordLearned(word);
      p.learnedIds.push(id);
    } else {
      // "Még nem megy": vissza a sor végére, amíg egyszer jobbra nem húzod
      p.queue.push(id);
      if (!p.againIds.includes(id)) p.againIds.push(id);
    }
  }
  showLearnCard();
}

function showLearnComplete() {
  const p = state.practice;
  const goal = getDailyGoal();
  const learnedToday = getTodayWords().length;
  const goalReached = learnedToday >= goal;
  const remaining = Math.max(0, goal - learnedToday);
  const nextBatch = goalReached ? 0 : Math.min(remaining, LEARN_BATCH_SIZE, getNewWordPool().length);
  const pct = Math.min(1, learnedToday / goal);
  const streak = calcStreak();
  const dueCount = dueForecast(state.words).due;

  const chips = p.learnedIds.map(id => {
    const w = state.words.find(x => x.id === id);
    return w ? `<span class="word-chip">${escHtml(w.en)} <span>${escHtml(w.hu)}</span></span>` : '';
  }).join('');

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-done">
      <div class="learn-done-badge" aria-hidden="true">✓</div>
      <h2 class="learn-done-title">${p.learnedIds.length} új ${currentMode === 'kanji' ? 'kanji' : 'szó'} rögzítve</h2>
      <p class="learn-done-sub">${goalReached
        ? 'A napi limit teljesítve. Az új szavak holnap folytatódnak; addig ismételd a maiakat.'
        : `Napi penzum: ${learnedToday}/${goal}. Még ${remaining} van hátra.`}</p>
      <div class="learn-done-meter">
        <div class="goal-bar ${goalReached ? 'is-done' : ''}" style="--p:${pct}"><div class="goal-bar-fill"></div></div>
        <span class="learn-done-streak">Konzisztencia: ${streak} nap</span>
      </div>
      <div class="learn-done-words">${chips}</div>
      <div class="learn-done-actions">
        ${nextBatch > 0 ? `<button class="cta-learn cta-compact" onclick="startLearnSession()"><span class="cta-main">Még ${nextBatch} új szó</span></button>`
          : dueCount > 0 ? `<button class="cta-learn cta-compact" onclick="startReviewSession()"><span class="cta-main">Ismétlés · ${dueCount} esedékes</span></button>` : ''}
        <button class="btn-quiet" onclick="startTodayReview()">Gyors kvíz a mai szavakból</button>
        <button class="btn-quiet" onclick="showScreen('home')">Vissza a kezdőlapra</button>
      </div>
    </div>`;

  // Napi cél elérése: egyszer ünneplünk naponta (módonként)
  if (goalReached && state.globalStats.goalCelebrated !== todayKey()) {
    state.globalStats.goalCelebrated = todayKey();
    saveStats();
    launchConfetti();
  }
}

// Billentyűzet a tanuló kártyákhoz: ← még nem, → tudom, Szóköz/Enter fordít
document.addEventListener('keydown', e => {
  const p = state.practice;
  if (!p || p.type !== 'learn' || document.body.dataset.screen !== 'practice' || p.queue.length === 0) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); learnSwipe('right'); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); learnSwipe('left'); }
  else if ((e.key === ' ' || e.key === 'Enter') && !(e.target.closest && e.target.closest('button'))) {
    e.preventDefault();
    flipLearnCard();
  }
});

/* ── MAI SZAVAK GYORS ISMÉTLÉSE ───────────────────────── */
function startTodayReview() {
  const words = getTodayWords();
  if (words.length === 0) { showToast('Ma még nem tanultál új szót.'); return; }
  const ids = shuffle(words).map(w => w.id);
  state.practice = {
    type: 'quickQuiz', direction: 'en-hu', origin: 'home',
    roundNumber: 1, roundWords: ids, uniqueCount: ids.length, currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    currentSentenceObj: null, _combo: 0
  };
  showScreen('practice');
  showQuestion();
}

export { _learnFlipped, flipLearnCard, learnSwipe, resolveLearnCard, showLearnCard, showLearnComplete, speakLearnWord, startLearnSession, startTodayReview };
