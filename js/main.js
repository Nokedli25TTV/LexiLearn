// LexiLearn – belépési pont (V13.8)
// 1) betölti az összes modult, 2) az inline eseménykezelőknek (onclick="…") és a
// firebase-sync.js-nek a window-ra teszi a szükséges függvényeket, 3) elindítja az appot
// ugyanabban a sorrendben, ahogy az egykori app.js tette.
import { googleSignIn, manualCloudSync, signOutCloud } from './app/auth-ui.js';
import { activateNewSW } from './app/sw.js';
import './core/dates.js';
import './core/state.js';
import { loadState, savePlaylists, saveStats, saveWords } from './core/storage.js';
import { escHtml, jsArg } from './core/util.js';
import { clearAllBookmarks, toggleBookmark } from './features/bookmarks.js';
import { doAddWord, doImport, exportData, importData, openAddModal, openImportModal } from './features/import-export.js';
import { setDailyGoal } from './features/profile.js';
import './features/quests.js';
import './features/streak.js';
import './habit/goal.js';
import { clearFilters, openPoolSource, renderHome } from './habit/home.js';
import { learnSwipe, speakLearnWord, startLearnSession, startTodayReview } from './habit/learn.js';
import { flipReviewCard, rateReview, speakReviewWord, startReviewSession } from './habit/review.js';
import { seedSrsAll } from './core/storage.js';
import { setGoalDate, showGoalScreen } from './goal/view.js';
import { setDirection, setPracticeOption, toggleDockSettings } from './library/dock.js';
import './library/filters.js';
import { applyFilters, initLibraryEvents, renderDashboard, selectNone, switchViewTab, toggleSelectAll } from './library/list.js';
import { clearDiff, closeFilterMenu, closeLibraryOverlays, onTagSearch, setDayFilter, setLessonFilter, setListFilter, setSort, setTags, toggleDiff, toggleFilterMenu, toggleTag } from './library/menus.js';
import { deletePlaylist, expandPlaylist, savePlaylist } from './library/playlists.js';
import { checkAnswer, checkHardcoreAnswer, checkSentenceAnswer, confirmQuit, finishSession, manualNextQuestion, revealHardcoreAnswer, speakQuestionWord, startNextRound, startPractice, toggleEye, toggleSentenceTranslation } from './practice/engine.js';
import { prevFlashcard3D, rateFlashcard3D, speakFlashcard3D } from './practice/flashcard.js';
import './practice/tts.js';
import './stats/model.js';
import { renderDekiruLessonStats, renderStats, switchStatsTab } from './stats/view.js';
import './ui/confetti.js';
import { setMode, showScreen } from './ui/screens.js';
import './ui/swipe.js';
import { initV6Features, toggleTheme } from './ui/theme.js';
import { closeModal, showToast } from './ui/toast.js';

// Az inline HTML eseménykezelők globális függvényeket várnak
Object.assign(window, {
  activateNewSW,
  applyFilters,
  checkAnswer,
  checkHardcoreAnswer,
  checkSentenceAnswer,
  clearAllBookmarks,
  clearDiff,
  clearFilters,
  closeFilterMenu,
  closeLibraryOverlays,
  closeModal,
  confirmQuit,
  deletePlaylist,
  doAddWord,
  doImport,
  escHtml,
  expandPlaylist,
  exportData,
  finishSession,
  googleSignIn,
  importData,
  jsArg,
  learnSwipe,
  manualCloudSync,
  manualNextQuestion,
  onTagSearch,
  openAddModal,
  openImportModal,
  openPoolSource,
  prevFlashcard3D,
  rateFlashcard3D,
  renderDashboard,
  renderDekiruLessonStats,
  renderHome,
  renderStats,
  revealHardcoreAnswer,
  savePlaylist,
  savePlaylists,
  saveStats,
  saveWords,
  selectNone,
  setDailyGoal,
  setDayFilter,
  setDirection,
  setLessonFilter,
  setListFilter,
  setMode,
  setPracticeOption,
  setSort,
  setTags,
  showScreen,
  showToast,
  signOutCloud,
  speakFlashcard3D,
  speakLearnWord,
  speakQuestionWord,
  startLearnSession,
  startNextRound,
  startPractice,
  startTodayReview,
  startReviewSession,
  flipReviewCard,
  rateReview,
  speakReviewWord,
  seedSrsAll,
  showGoalScreen,
  setGoalDate,
  switchStatsTab,
  switchViewTab,
  toggleBookmark,
  toggleDiff,
  toggleDockSettings,
  toggleEye,
  toggleFilterMenu,
  toggleSelectAll,
  toggleSentenceTranslation,
  toggleTag,
  toggleTheme,
});
/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] V13.8 indítása...");
initV6Features();
initLibraryEvents();

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
(async () => { await loadState(); })();
