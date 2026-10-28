// LexiLearn – features/leeches.js
// V13.18: Makacs szavak (az Ankiban "leech"): amik többször is kifogtak rajtad, és most sem
// mennek stabilan. Az app magától veszi észre őket (a zászlós lecke-listát te töltöd, ezt ő),
// és ha a szó később rendben megy, magától kikerül. Nincs külön mentett mező: az állapotból számol.
import { currentMode, state } from '../core/state.js';
import { MATURE_DAYS, srsInterval } from '../goal/jlpt.js';
import { applyFilters, updateSelectAllBtn, updateStartPanel } from '../library/list.js';
import { renderFilterBar } from '../library/menus.js';
import { saveSettings } from '../core/storage.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

const LEECH_LAPSES = 4;      // ennyiszer esett vissza az ismétlésben („Újra”)
const LEECH_WRONG = 4;       // ennyi hibás gyakorlóválasz, legalább annyi, mint a helyes
const LEECH_RECOVERED = 3;   // ennyi egymás utáni helyes gyakorlóválasz után már nem makacs
const LEECH_FRESH_DAYS = 7;  // az ismétlésben még az ismerkedés szakaszában van

function isLeech(w) {
  const s = w.stats || {};
  const lapses = (s.srs && s.srs.lapses) || 0;
  if (lapses >= LEECH_LAPSES && srsInterval(w) < Math.min(LEECH_FRESH_DAYS, MATURE_DAYS)) return true;
  const wrong = s.totalWrong || 0;
  return wrong >= LEECH_WRONG && wrong >= (s.totalCorrect || 0) && (s.streak || 0) < LEECH_RECOVERED;
}

function getLeeches(words = state.words) {
  return words.filter(isLeech);
}

// Kezdőlap: egy csendes sor, ha van makacs szó (a JLPT-sor stílusában)
function leechHomeRowHtml() {
  const n = getLeeches().length;
  if (n === 0) return '';
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  return `
    <button class="home-jlpt home-leech" onclick="openLeeches()">
      <span class="home-jlpt-label">Makacs</span>
      <span class="home-jlpt-value"><b>${n}</b> ${unit} többször is kifogott rajtad</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>`;
}

// Egy koppintással a Gyakorlás fülre: csak a makacs szavak, mind kijelölve; a típust te választod
function openLeeches() {
  const leeches = getLeeches();
  if (leeches.length === 0) { showToast('Most nincs makacs szó.'); return; }
  Object.assign(state.filters, { search: '', tags: [], diff: new Set(), lesson: 'all', status: 'all', day: 'all', list: '__leech' });
  const search = document.getElementById('search-input');
  if (search) search.value = '';
  state.selectedIds = new Set(leeches.map(w => w.id));
  showScreen('dashboard');
  renderFilterBar();
  applyFilters();
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
  showToast(`${leeches.length} makacs szó kijelölve. Válassz típust, és indíthatod.`);
}

export { LEECH_LAPSES, LEECH_WRONG, getLeeches, isLeech, leechHomeRowHtml, openLeeches };
