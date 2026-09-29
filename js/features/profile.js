// LexiLearn – features/profile.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { MODE_LABELS, currentMode, state } from '../core/state.js';
import { renderStorageInfo, saveStats } from '../core/storage.js';
import { getDailyGoal } from '../habit/goal.js';
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
  const sw = document.getElementById('theme-switch');
  if (sw) sw.setAttribute('aria-checked', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  renderStorageInfo();
}

function setDailyGoal(n) {
  state.globalStats.dailyGoal = n;
  saveStats();
  renderProfile();
  showToast(`Napi cél (${MODE_LABELS[currentMode]}): ${n} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}`);
}

export { renderProfile, setDailyGoal };
