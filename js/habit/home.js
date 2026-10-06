// LexiLearn – habit/home.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { MODE_LABELS, currentMode, state } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { checkDailyReset, renderDailyQuests } from '../features/quests.js';
import { calcStreak, renderWeekTracker } from '../features/streak.js';
import { LEARN_BATCH_SIZE, describePoolSource, getCurrentLessonProgress, getDailyGoal, getNewWordPool, getTodayWords } from './goal.js';
import { applyFilters } from '../library/list.js';
import { closeFilterMenu, renderFilterBar } from '../library/menus.js';
import { showToast } from '../ui/toast.js';
import { REVIEW_BATCH_SIZE, dueForecast } from '../srs/schedule.js';
import { goalLineHtml } from '../goal/view.js';

/* ── KEZDŐLAP ─────────────────────────────────────────── */
function renderHome() {
  if (!document.getElementById('screen-home')) return;
  checkDailyReset();

  const today = todayKey();
  const streak = calcStreak();
  if (streak > (state.globalStats.recordStreak || 0)) state.globalStats.recordStreak = streak;
  const studiedToday = !!(state.globalStats.studyDays && state.globalStats.studyDays[today]);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Jó éjszakát' : hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szia' : 'Jó estét';
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText('home-greeting', greeting);
  setText('home-streak-text', `${streak} nap`);
  setText('home-streak-hint',
    studiedToday ? `A mai ${MODE_LABELS[currentMode].toLowerCase()} adag megvan.`
    : streak > 0 ? 'Egy rövid alkalom ma is elég a folytonossághoz.'
    : 'Egy rövid alkalom ma: ebből épül a rutin.');
  renderWeekTracker();

  // ── Napi cél ──
  const goal = getDailyGoal();
  const learnedToday = getTodayWords().length;
  const goalReached = learnedToday >= goal;
  const pct = Math.min(1, learnedToday / goal);
  setText('goal-done', learnedToday);
  setText('goal-total', goal);
  setText('goal-unit', currentMode === 'kanji' ? 'új kanji' : 'új szó');
  const goalSection = document.getElementById('home-goal');
  if (goalSection) goalSection.classList.toggle('is-done', goalReached);
  const bar = document.getElementById('goal-bar');
  if (bar) {
    bar.setAttribute('aria-valuemax', goal);
    bar.setAttribute('aria-valuenow', Math.min(learnedToday, goal));
    bar.style.setProperty('--p', pct);
  }

  const pool = getNewWordPool();
  const source = document.getElementById('goal-source');
  if (source) {
    source.innerHTML = `<span>Forrás: <b>${escHtml(describePoolSource())}</b> · ${pool.length} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}</span>`;
  }
  renderCurrentLesson();

  // ── Fő cselekvések ──
  // V13.5: előbb az esedékes ismétlés (korall fő gomb), utána az új szavak (másodlagos).
  // Ha nincs esedékes, az új szavak tanulása a fő gomb, mint eddig.
  const forecast = dueForecast(state.words);
  const due = forecast.due;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const arrow = `<span class="cta-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>`;

  let reviewHtml = '';
  if (due > 0) {
    const batch = Math.min(due, REVIEW_BATCH_SIZE);
    const mins = Math.max(1, Math.round(batch * 0.2));
    reviewHtml = `
      <button class="cta-learn" onclick="startReviewSession()">
        <span class="cta-main">Ismétlés <span class="count-chip">${due}</span></span>
        <span class="cta-sub">${due > batch ? `${batch} kártya most` : `${batch} esedékes`} · kb. ${mins} perc</span>
        ${arrow}
      </button>`;
  }

  const remaining = goal - learnedToday;
  const nextBatch = Math.min(remaining, LEARN_BATCH_SIZE, pool.length);
  let learnHtml;
  if (goalReached) {
    learnHtml = `
      <div class="home-note is-success" role="status">
        <span class="home-note-icon" aria-hidden="true">✓</span>
        <div>
          <p class="home-note-title">A napi limit teljesítve.</p>
          <p class="home-note-sub">Az új szavak holnap folytatódnak.</p>
        </div>
      </div>`;
  } else if (pool.length === 0) {
    const completed = currentMode === 'japanese' ? 'Minden Dekiru-szót elkezdtél.' : 'Ebben a módban minden szót elkezdtél.';
    learnHtml = `<div class="home-note">
       <span class="home-note-icon" aria-hidden="true">✓</span>
       <div>
         <p class="home-note-title">${completed}</p>
         <p class="home-note-sub">Az ismétlések gondoskodnak a rögzítésről.</p>
       </div>
     </div>`;
  } else {
    const mins = Math.max(1, Math.round(nextBatch * 0.5));
    learnHtml = `
      <button class="${due > 0 ? 'cta-review' : 'cta-learn'}" onclick="startLearnSession()">
        <span class="cta-main">Új szavak tanulása</span>
        <span class="cta-sub">${nextBatch} ${unit} · kb. ${mins} perc</span>
        ${due > 0 ? '' : arrow}
      </button>`;
  }

  // Előrejelzés: mi jön a következő napokban (nincs meglepetés-hegy)
  const hasSchedule = due > 0 || forecast.week > 0 || state.words.some(w => w.stats && w.stats.srs);
  const forecastHtml = hasSchedule
    ? `<p class="home-forecast">${due > 0 ? '' : '<span>Mára nincs esedékes ismétlés.</span> '}<span>Holnap <b>${forecast.tomorrow}</b> · a következő 7 napban <b>${forecast.week}</b></span></p>`
    : '';
  const hasReviewCards = state.words.some(w => w.stats?.srs || w.stats?.srsSuspended);
  const queueHtml = hasReviewCards
    ? '<button class="review-queue-link" onclick="openReviewQueue()">Ismétlési sor megtekintése és kezelése</button>'
    : '';

  const actions = document.getElementById('home-actions');
  if (actions) actions.innerHTML = reviewHtml + learnHtml + forecastHtml + queueHtml + goalLineHtml();

  renderDailyQuests();
}

// Régi globális kezelő kompatibilitásához megtartva; a napi sorrend már automatikus.
function openPoolSource() {
  showToast('A napi új szavak automatikusan, lecke szerint következnek.');
}

function renderCurrentLesson() {
  const host = document.getElementById('home-current-lesson');
  if (!host) return;
  const p = getCurrentLessonProgress();
  host.hidden = !p;
  if (!p) { host.innerHTML = ''; return; }
  const pct = p.total ? p.learned / p.total : 0;
  const book = p.lesson >= 25 ? '2. könyv' : '1. könyv';
  const next = p.complete
    ? 'Minden Dekiru-lecke szava elkezdve.'
    : p.next.length
      ? `Következő adag: ${p.next.map(x => `${x.count} szó a ${x.lesson}. leckéből`).join(' és ')}`
      : 'A mai napi penzum teljesítve.';
  host.innerHTML = `
    <button class="lesson-card" onclick="openCurrentLesson(${p.lesson})">
      <span class="lesson-card-kicker">Aktuális lecke · Dekiru ${book}</span>
      <span class="lesson-card-head"><b>${p.lesson}. lecke</b><span>${p.learned} / ${p.total} megtanult</span></span>
      <span class="lesson-progress" style="--p:${pct}" role="progressbar" aria-label="${p.lesson}. lecke haladása" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.learned}"><i></i></span>
      <span class="lesson-card-meta">${p.remaining} szó van hátra · ${p.reviewing} ismétlés alatt</span>
      <span class="lesson-card-next">${escHtml(next)}</span>
    </button>`;
}

function openCurrentLesson(lesson) {
  if (window.setLessonFilter) window.setLessonFilter(String(lesson));
  if (window.showScreen) window.showScreen('dashboard');
}

// Minden szerkezeti szűrő törlése (Kezdőlap és Gyakorlás fül közös)
function clearFilters() {
  Object.assign(state.filters, { tags: [], diff: new Set(), lesson: 'all', day: 'all', list: 'all' });
  closeFilterMenu();
  renderFilterBar();
  applyFilters();
  if (document.body.dataset.screen === 'home') renderHome();
  showToast('Szűrők törölve');
}

export { clearFilters, openCurrentLesson, openPoolSource, renderCurrentLesson, renderHome };
