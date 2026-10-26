// LexiLearn – features/bookmarks.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode, state } from '../core/state.js';
import { saveWords } from '../core/storage.js';
import { LESSON_FOCUS_PREFIX, lessonFocusKeys, lessonFocusLabel } from '../library/filters.js';
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

/* ══════════════════════════════════════════════════════
   V13.17: LECKE FÓKUSZ LISTA – a gyakorlókártya zászlójával
   a nehéz szó a saját leckéjének fókusz listájába kerül
   (state.words[].lessonFocus = true), a csillagos Fókusz Listától külön.
══════════════════════════════════════════════════════ */
const hasLessonFocus = () => currentMode !== 'english';

function lessonFocusTitle(w) {
  const where = lessonFocusKeys(w).map(lessonFocusLabel).join(', ');
  return w.lessonFocus ? `Eltávolítás a lecke fókusz listájából (${where})` : `Hozzáadás a lecke fókusz listájához (${where})`;
}

function toggleLessonFocus(wordId) {
  const w = state.words.find(x => x.id === wordId);
  if (!w || !hasLessonFocus()) return;
  w.lessonFocus = !w.lessonFocus;
  saveWords();

  const title = lessonFocusTitle(w);
  const btn = document.getElementById('lesson-focus-btn-' + wordId);
  if (btn) {
    btn.classList.toggle('is-on', w.lessonFocus);
    btn.setAttribute('aria-pressed', w.lessonFocus ? 'true' : 'false');
    btn.setAttribute('aria-label', title);
    btn.setAttribute('title', title);
  }
  const flag = document.querySelector(`.word-row[data-id="${CSS.escape(wordId)}"] .word-flag`);
  if (flag) {
    flag.classList.toggle('is-on', w.lessonFocus);
    flag.setAttribute('aria-pressed', w.lessonFocus ? 'true' : 'false');
    flag.setAttribute('aria-label', title);
    flag.setAttribute('title', title);
  }

  refreshLibraryChrome();
  const where = lessonFocusKeys(w).map(lessonFocusLabel).join(', ');
  showToast(w.lessonFocus ? `Hozzáadva: ${where} fókusz listája` : `Eltávolítva: ${where} fókusz listája`);
}

function clearLessonFocus(key) {
  const words = state.words.filter(w => w.lessonFocus && lessonFocusKeys(w).includes(key));
  if (words.length === 0) return;
  const label = lessonFocusLabel(key);
  if (!confirm(`Biztosan kiüríted a(z) ${label} fókusz listáját (${words.length} szó)?`)) return;
  words.forEach(w => { w.lessonFocus = false; });
  saveWords();
  if (state.filters.list === LESSON_FOCUS_PREFIX + key) state.filters.list = 'all';
  applyFilters();
  refreshLibraryChrome();
  showToast(`${label} fókusz listája kiürítve.`);
}

export { clearAllBookmarks, clearLessonFocus, getBookmarkedWords, hasLessonFocus, lessonFocusTitle, toggleBookmark, toggleLessonFocus };
