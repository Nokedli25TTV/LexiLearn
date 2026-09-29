// LexiLearn – features/bookmarks.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { state } from '../core/state.js';
import { saveWords } from '../core/storage.js';
import { applyFilters } from '../library/list.js';
import { refreshLibraryChrome } from '../library/menus.js';
import { showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   V11: SMART LIBRARY (Fókusz Lista) – Live bookmark
   A felhasználó gyakorlás közben (vagy a szólistából)
   egy csillaggal kijelölhet nehéz / fontos szavakat.
   Ezek a state.words[].bookmarked = true mezőre kerülnek.
   A Fókusz Lista virtuális (computed) playlist a dashboardon.
══════════════════════════════════════════════════════ */
function getBookmarkedWords() {
  return state.words.filter(w => w.bookmarked);
}

function toggleBookmark(wordId) {
  const w = state.words.find(x => x.id === wordId);
  if (!w) return;
  w.bookmarked = !w.bookmarked;
  saveWords();

  // q-card csillag ikon frissítése (ha gyakorlási képernyőn vagyunk)
  const btn = document.getElementById('bookmark-btn-' + wordId);
  if (btn) {
    btn.classList.toggle('bookmarked', w.bookmarked);
    btn.setAttribute('title', w.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához');
  }

  // Gyakorlás fül szólistájában a csillag frissítése (ha ki van rajzolva)
  const star = document.querySelector(`.word-row[data-id="${CSS.escape(wordId)}"] .word-star`);
  if (star) {
    const label = w.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához';
    star.classList.toggle('is-on', w.bookmarked);
    star.setAttribute('aria-pressed', w.bookmarked ? 'true' : 'false');
    star.setAttribute('aria-label', label);
    star.setAttribute('title', label);
  }

  // Fókusz Lista számláló (Lista pilla / nyitott menü) frissítése
  refreshLibraryChrome();

  showToast(w.bookmarked ? 'Hozzáadva a Fókusz Listához' : 'Eltávolítva a Fókusz Listából');
}

function clearAllBookmarks() {
  const bm = getBookmarkedWords();
  if (bm.length === 0) return;
  if (!confirm(`Biztosan eltávolítod mind a ${bm.length} csillagot a Fókusz Listából?`)) return;
  bm.forEach(w => w.bookmarked = false);
  saveWords();
  applyFilters();
  refreshLibraryChrome();
  showToast('Fókusz Lista kiürítve.');
}

export { clearAllBookmarks, getBookmarkedWords, toggleBookmark };
