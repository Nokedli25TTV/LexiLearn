// LexiLearn – features/profile.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { MODE_LABELS, currentMode, state } from '../core/state.js';
import { renderStorageInfo, saveStats } from '../core/storage.js';
import { REVIEW_BATCH_OPTIONS, getDailyGoal, getReviewBatch } from '../habit/goal.js';
import { canMixWithMusic, isMixWithMusic, setMixWithMusic } from '../practice/tts.js';
import { renderReminder } from './reminder.js';
import { toggleViewportDebug } from '../ui/viewport-fix.js';
import { showToast } from '../ui/toast.js';

/* ── PROFIL ───────────────────────────────────────────── */
function renderProfile() {
  const goal = getDailyGoal();
  document.querySelectorAll('#goal-segmented [data-goal]').forEach(btn => {
    const isActive = Number(btn.dataset.goal) === goal;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
  const modeLbl = document.getElementById('pf-goal-mode');
  if (modeLbl) modeLbl.textContent = MODE_LABELS[currentMode];
  const batch = getReviewBatch();
  document.querySelectorAll('#review-segmented [data-batch]').forEach(btn => {
    const isActive = Number(btn.dataset.batch) === batch;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
  const reviewLbl = document.getElementById('pf-review-mode');
  if (reviewLbl) reviewLbl.textContent = MODE_LABELS[currentMode];
  const sw = document.getElementById('theme-switch');
  if (sw) sw.setAttribute('aria-checked', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  renderMixAudio();
  renderReminder();
  const ver = document.getElementById('pf-version');
  if (ver) ver.textContent = `LexiLearn ${APP_VERSION}`;
  renderStorageInfo();
}

// V13.22: a futó verzió (a main.js ?v= paraméteréből, így nincs külön léptetendő hely)
const APP_VERSION = (() => {
  const main = document.querySelector('script[src*="js/main.js"]');
  const v = main && new URL(main.getAttribute('src'), location.href).searchParams.get('v');
  return v ? `v${v}` : 'fejlesztői változat';
})();

// Ötször egymás után a verziószámra koppintva: a képernyő-diagnosztika be/ki (hibakereséshez)
let _versionTaps = 0, _versionTapTimer = null;
function tapVersion() {
  _versionTaps++;
  clearTimeout(_versionTapTimer);
  _versionTapTimer = setTimeout(() => { _versionTaps = 0; }, 1500);
  if (_versionTaps < 5) return;
  _versionTaps = 0;
  showToast(toggleViewportDebug() ? 'Képernyő-diagnosztika bekapcsolva' : 'Képernyő-diagnosztika kikapcsolva');
}

// V13.18: egy ismétlési alkalom mérete (módonként, szinkronizált)
function setReviewBatch(n) {
  if (!REVIEW_BATCH_OPTIONS.includes(n)) return;
  state.globalStats.reviewBatch = n;
  saveStats();
  renderProfile();
  showToast(`Ismétlés (${MODE_LABELS[currentMode]}): egyszerre legfeljebb ${n} kártya`);
}

// V13.18: Zene mellett kapcsoló (csak ahol a böngésző ismeri az Audio Session API-t)
function renderMixAudio() {
  const sw = document.getElementById('mix-audio-switch');
  const note = document.getElementById('mix-audio-unsupported');
  const supported = canMixWithMusic();
  if (sw) {
    sw.hidden = !supported;
    sw.setAttribute('aria-checked', supported && isMixWithMusic() ? 'true' : 'false');
  }
  if (note) note.hidden = supported;
  const text = document.getElementById('mix-audio-text');
  if (text) text.hidden = !supported;
}

function toggleMixAudio() {
  setMixWithMusic(!isMixWithMusic());
  renderMixAudio();
  showToast(isMixWithMusic() ? 'A kiejtés mostantól a zene mellett szól' : 'A kiejtés megállítja a zenét, a némító kapcsoló nem hat rá');
}

function setDailyGoal(n) {
  state.globalStats.dailyGoal = n;
  saveStats();
  renderProfile();
  showToast(`Napi cél (${MODE_LABELS[currentMode]}): ${n} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}`);
}

export { APP_VERSION, renderMixAudio, renderProfile, setDailyGoal, setReviewBatch, tapVersion, toggleMixAudio };
