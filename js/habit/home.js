// LexiLearn – habit/home.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { MODE_LABELS, currentMode, state } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { checkDailyReset, renderDailyQuests } from '../features/quests.js';
import { calcStreak, renderWeekTracker } from '../features/streak.js';
import { LEARN_BATCH_SIZE, describePoolSource, getDailyGoal, getNewWordPool, getTodayWords, hasPoolFilters, isNewWord } from './goal.js';
import { applyFilters } from '../library/list.js';
import { closeFilterMenu, renderFilterBar } from '../library/menus.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

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
    source.innerHTML = `
      <span>Forrás: <b>${escHtml(describePoolSource())}</b> · ${pool.length} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}</span>
      <button class="link-btn" onclick="openPoolSource()">Módosítás</button>`;
  }

  // ── Fő cselekvések ──
  const remaining = goal - learnedToday;
  const nextBatch = Math.min(remaining, LEARN_BATCH_SIZE, pool.length);
  let learnHtml;
  if (goalReached) {
    learnHtml = `
      <div class="home-note is-success" role="status">
        <span class="home-note-icon" aria-hidden="true">✓</span>
        <div>
          <p class="home-note-title">A napi limit teljesítve.</p>
          <p class="home-note-sub">Az új szavak holnap folytatódnak; addig ismételd a maiakat.</p>
        </div>
      </div>`;
  } else if (pool.length === 0) {
    const filteredOut = hasPoolFilters() && state.words.some(isNewWord);
    learnHtml = filteredOut
      ? `<div class="home-note">
           <span class="home-note-icon" aria-hidden="true">∅</span>
           <div>
             <p class="home-note-title">Ebben a válogatásban elfogytak az új szavak.</p>
             <p class="home-note-sub">Válassz másik leckét, vagy tanulj a teljes szótárból.</p>
             <button class="link-btn" onclick="clearFilters()">Szűrők törlése</button>
           </div>
         </div>`
      : `<div class="home-note">
           <span class="home-note-icon" aria-hidden="true">✓</span>
           <div>
             <p class="home-note-title">Ebben a módban minden szót elkezdtél.</p>
             <p class="home-note-sub">Mélyítsd el őket a Gyakorlás fülön.</p>
           </div>
         </div>`;
  } else {
    const mins = Math.max(1, Math.round(nextBatch * 0.5));
    learnHtml = `
      <button class="cta-learn" onclick="startLearnSession()">
        <span class="cta-main">Új szavak tanulása</span>
        <span class="cta-sub">${nextBatch} ${currentMode === 'kanji' ? 'kanji' : 'szó'} · kb. ${mins} perc</span>
        <span class="cta-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </button>`;
  }

  // Ha mára kész a cél, a mai ismétlés lesz a fő (élénk) gomb
  const reviewClass = goalReached && learnedToday > 0 ? 'cta-learn' : 'cta-review';
  const reviewHtml = `
    <button class="${reviewClass}" onclick="startTodayReview()" ${learnedToday === 0 ? 'disabled' : ''}>
      <span class="cta-main">Mai szavak ismétlése${learnedToday > 0 ? ` <span class="count-chip">${learnedToday}</span>` : ''}</span>
      <span class="cta-sub">${learnedToday > 0 ? 'Gyors kvíz: a hibás szó visszakerül a sor végére' : 'Tanulj ma új szót, és itt átismételheted.'}</span>
    </button>`;

  const actions = document.getElementById('home-actions');
  if (actions) actions.innerHTML = learnHtml + reviewHtml;

  renderDailyQuests();
}

// "Módosítás": a Gyakorlás fül szűrő pilláihoz ugrik (ugyanazok a szűrők adják az új szavakat)
function openPoolSource() {
  showScreen('dashboard');
  showToast('Az új szavak az itt beállított szűrőkből jönnek');
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

export { clearFilters, openPoolSource, renderHome };
