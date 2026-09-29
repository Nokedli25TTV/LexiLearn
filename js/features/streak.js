// LexiLearn – features/streak.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { dateKey } from '../core/dates.js';
import { state } from '../core/state.js';

function calcStreak() {
  const studyDays = state.globalStats.studyDays || {};
  let streak = 0;
  const checkDate = new Date();
  if (!studyDays[dateKey(checkDate)]) checkDate.setDate(checkDate.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = dateKey(checkDate);
    if (studyDays[key]) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else break;
  }
  return streak;
}

function getWeekDays() {
  const studyDays = state.globalStats.studyDays || {};
  const today = new Date();
  const todayStr = dateKey(today);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  const labels = ['H','K','Sz','Cs','P','Szo','V'];
  return labels.map((label, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    return { label, studied: !!studyDays[key], isToday: key === todayStr };
  });
}

// V13: a heti sáv a Kezdőlapra költözött (V13.2: pipa ikon, emoji / szimbólum helyett)
const WEEK_CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
function renderWeekTracker() {
  const weekTracker = document.getElementById('week-tracker');
  if (!weekTracker) return;
  weekTracker.innerHTML = getWeekDays().map(d => {
    let cls, icon;
    if (d.isToday && d.studied)  { cls='today-studied'; icon=WEEK_CHECK_ICON; }
    else if (d.isToday)          { cls='today-not';     icon=''; }
    else if (d.studied)          { cls='studied';       icon=WEEK_CHECK_ICON; }
    else                         { cls='not-studied';   icon=''; }
    return `<div class="week-day"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}">${icon}</div></div>`;
  }).join('');
}

export { WEEK_CHECK_ICON, calcStreak, getWeekDays, renderWeekTracker };
