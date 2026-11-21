// LexiLearn – features/streak.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
// V13.101: konzisztencia-visszaállítás. Ha egy nap kimarad, a következő napon (24 óra) egy visszaállítással
// a kimaradt nap pótolható. A visszaállított nap (globalStats.restoredDays) a konzisztenciában úgy számít,
// mint egy tanult nap, de a statisztikában (aktív napok, hőtérkép, heti összefoglaló) nem: ott csak a valódi
// tanulás látszik. A visszaállítások közösek minden módban (a japán mód globalStats.streakRestores mezőjében,
// mert csak a Dekiru-lecke lezárásával lehet szerezni). Kezdésnek egy jár.
import { addDays, dateKey } from '../core/dates.js';
import { MODES, appData, state } from '../core/state.js';

const STARTER_RESTORES = 1;

// Megvan-e a nap a konzisztenciában: tanultál, vagy visszaállítottad
const keptOn = (gs, key) => !!((gs && gs.studyDays && gs.studyDays[key]) || (gs && gs.restoredDays && gs.restoredDays[key]));

// Hány egymás utáni megtartott nap végződik az adott napon (azt is beleértve)
function streakEndingAt(gs, from) {
  let streak = 0;
  const d = new Date(from);
  for (let i = 0; i < 3650 && keptOn(gs, dateKey(d)); i++) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

// A ma még tanulás nélküli nap nem szakítja meg a konzisztenciát: ilyenkor a tegnappal végződőt számoljuk
function calcStreak(gs = state.globalStats, now = new Date()) {
  const from = keptOn(gs, dateKey(now)) ? now : addDays(now, -1);
  return streakEndingAt(gs, from);
}

// A visszaállítás ablaka: tegnap kimaradt, tegnapelőtt még megvolt. Csak ma, a kimaradt nap utáni napon érhető el;
// két kimaradt nap után már nincs mit visszaállítani. { day: a kimaradt nap, lost: a megszakadt konzisztencia }
function restoreWindow(gs = state.globalStats, now = new Date()) {
  const yesterday = addDays(now, -1), before = addDays(now, -2);
  if (keptOn(gs, dateKey(yesterday)) || !keptOn(gs, dateKey(before))) return null;
  return { day: dateKey(yesterday), lost: streakEndingAt(gs, before) };
}

const walletStats = () => appData.japanese && appData.japanese.globalStats;

function restoresLeft() {
  const gs = walletStats();
  const n = gs && gs.streakRestores;
  return Number.isFinite(n) ? n : STARTER_RESTORES;
}

// Egy újabb visszaállítás (Dekiru-lecke első lezárásáért); az új darabszámot adja vissza
function grantRestore() {
  const gs = walletStats();
  if (!gs) return 0;
  gs.streakRestores = restoresLeft() + 1;
  return gs.streakRestores;
}

// A kimaradt nap visszaállítása: minden módban, ahol ugyanez a nap szakította meg a konzisztenciát; egy alkalom fogy.
// Ha most nem lehet (nincs ablak vagy nincs visszaállítás), null.
function applyRestore(now = new Date()) {
  const own = restoreWindow(state.globalStats, now);
  if (!own || restoresLeft() < 1) return null;
  MODES.forEach(mode => {
    const gs = appData[mode] && appData[mode].globalStats;
    const w = gs && restoreWindow(gs, now);
    if (w && w.day === own.day) gs.restoredDays = { ...(gs.restoredDays || {}), [w.day]: true };
  });
  walletStats().streakRestores = restoresLeft() - 1;
  return own;
}

function getWeekDays() {
  const gs = state.globalStats;
  const studyDays = gs.studyDays || {};
  const restoredDays = gs.restoredDays || {};
  const today = new Date();
  const todayStr = dateKey(today);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  const labels = ['H','K','Sz','Cs','P','Szo','V'];
  return labels.map((label, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    return { label, studied: !!studyDays[key], restored: !studyDays[key] && !!restoredDays[key], isToday: key === todayStr };
  });
}

// V13: a heti sáv a Kezdőlapra költözött (V13.2: pipa ikon, emoji / szimbólum helyett)
const WEEK_CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
// V13.101: a visszaállított nap jele (visszafelé forduló nyíl)
const RESTORE_ICON = size => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size < 14 ? 3 : 2.6}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;
function renderWeekTracker() {
  const weekTracker = document.getElementById('week-tracker');
  if (!weekTracker) return;
  weekTracker.innerHTML = getWeekDays().map(d => {
    let cls, icon, title = '';
    if (d.isToday && d.studied)  { cls='today-studied'; icon=WEEK_CHECK_ICON; }
    else if (d.isToday)          { cls='today-not';     icon=''; }
    else if (d.studied)          { cls='studied';       icon=WEEK_CHECK_ICON; }
    else if (d.restored)         { cls='restored';      icon=RESTORE_ICON(12); title=' title="Visszaállított nap"'; }
    else                         { cls='not-studied';   icon=''; }
    return `<div class="week-day"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}"${title}>${icon}</div></div>`;
  }).join('');
}

export { RESTORE_ICON, STARTER_RESTORES, WEEK_CHECK_ICON, applyRestore, calcStreak, getWeekDays, grantRestore, keptOn, renderWeekTracker, restoreWindow, restoresLeft };
