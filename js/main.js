// LexiLearn – belépési pont (V13.28)
// 1) betölti az összes modult, 2) az inline eseménykezelőknek (onclick="…") és a
// firebase-sync.js-nek a window-ra teszi a szükséges függvényeket, 3) elindítja az appot
// ugyanabban a sorrendben, ahogy az egykori app.js tette.
import { googleSignIn, manualCloudSync, signOutCloud } from './app/auth-ui.js';
import { activateNewSW } from './app/sw.js';
import './core/dates.js';
import './core/state.js';
import { loadState, savePlaylists, saveStats, saveWords } from './core/storage.js';
import { escHtml, jsArg } from './core/util.js';
import { clearAllBookmarks, clearLessonFocus, toggleBookmark, toggleLessonFocus } from './features/bookmarks.js';
import { openLeeches, practiceLessonHard } from './features/leeches.js';
import { doAddWord, doImport, exportData, exportSelectedToAnki, importData, openAddModal, openImportModal } from './features/import-export.js';
import { openReviewQueue, openStatsBreakdown, openStatsExplanation, openWordInspector, postponeReviewWord, restoreReviewWord, suspendReviewWord } from './features/learning-inspector.js';
import { setDailyGoal, setReviewBatch, tapVersion, toggleMixAudio } from './features/profile.js';
import { downloadReminder, setReminderTime } from './features/reminder.js';
import { replayStrokes } from './features/strokes.js';
import './features/quests.js';
import './features/streak.js';
import './habit/goal.js';
import { clearFilters, openCurrentLesson, openPoolSource, renderHome } from './habit/home.js';
import { learnSwipe, speakLearnWord, startLearnSession, startTodayReview } from './habit/learn.js';
import { flipReviewCard, rateReview, speakReviewWord, startReviewSession } from './habit/review.js';
import { RENAMED_WORDS, seedSrsAll } from './core/storage.js';
import { setGoalDate, setPathGoalDate, setPathTarget, showGoalScreen } from './goal/view.js';
import { setDirection, setPracticeOption, toggleDockSettings } from './library/dock.js';
import './library/filters.js';
import { applyFilters, initLibraryEvents, renderDashboard, selectNone, switchViewTab, toggleSelectAll } from './library/list.js';
import { clearDiff, clearLessons, closeFilterMenu, closeLibraryOverlays, onTagSearch, setDayFilter, setLessonFilter, setListFilter, setSort, setStatusFilter, setTags, toggleDiff, toggleFilterMenu, toggleLesson, toggleTag } from './library/menus.js';
import { deletePlaylist, expandPlaylist, savePlaylist } from './library/playlists.js';
import { checkAnswer, checkHardcoreAnswer, checkSentenceAnswer, confirmQuit, finishSession, manualNextQuestion, revealHardcoreAnswer, setLearnedRating, speakQuestionWord, startNextRound, startPractice, toggleEye, toggleSentenceTranslation } from './practice/engine.js';
import { sbGiveUp, sbPick, sbUnpick } from './practice/sentence-build.js';
import { prevFlashcard3D, rateFlashcard3D, speakFlashcard3D } from './practice/flashcard.js';
import './practice/tts.js';
import { writingHint, writingRestart, writingReveal, writingToggleOutline } from './practice/writing.js';
import './stats/model.js';
import { renderDekiruLessonStats, renderStats, switchStatsTab } from './stats/view.js';
import { practiceWeekWords, shiftWeek, showWeekScreen } from './stats/week.js';
import './ui/confetti.js';
import { setMode, showScreen } from './ui/screens.js';
import './ui/swipe.js';
import { initV6Features, toggleTheme } from './ui/theme.js';
import { initViewportFix } from './ui/viewport-fix.js';
import { closeModal, showToast } from './ui/toast.js';

// Az inline HTML eseménykezelők globális függvényeket várnak
Object.assign(window, {
  activateNewSW,
  applyFilters,
  checkAnswer,
  checkHardcoreAnswer,
  checkSentenceAnswer,
  clearAllBookmarks,
  clearLessonFocus,
  openLeeches,
  practiceLessonHard,
  clearDiff,
  clearFilters,
  clearLessons,
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
  exportSelectedToAnki,
  finishSession,
  googleSignIn,
  importData,
  jsArg,
  learnSwipe,
  manualCloudSync,
  manualNextQuestion,
  onTagSearch,
  openAddModal,
  openCurrentLesson,
  openImportModal,
  openPoolSource,
  openReviewQueue,
  openStatsBreakdown,
  openStatsExplanation,
  openWordInspector,
  postponeReviewWord,
  practiceWeekWords,
  prevFlashcard3D,
  rateFlashcard3D,
  renderDashboard,
  renderDekiruLessonStats,
  renderHome,
  renderStats,
  restoreReviewWord,
  replayStrokes,
  revealHardcoreAnswer,
  savePlaylist,
  savePlaylists,
  saveStats,
  saveWords,
  selectNone,
  setDailyGoal,
  setReviewBatch,
  tapVersion,
  toggleMixAudio,
  downloadReminder,
  setReminderTime,
  setDayFilter,
  setDirection,
  setLearnedRating,
  setLessonFilter,
  setListFilter,
  setMode,
  setPracticeOption,
  setSort,
  setStatusFilter,
  setTags,
  shiftWeek,
  showScreen,
  showToast,
  showWeekScreen,
  signOutCloud,
  speakFlashcard3D,
  speakLearnWord,
  speakQuestionWord,
  startLearnSession,
  startNextRound,
  startPractice,
  sbGiveUp,
  sbPick,
  sbUnpick,
  startTodayReview,
  startReviewSession,
  flipReviewCard,
  rateReview,
  speakReviewWord,
  seedSrsAll,
  lexiRenamedWords: RENAMED_WORDS, // V13.18: a firebase-sync.js így a régi alakú felhőszót is párosítja
  showGoalScreen,
  setGoalDate,
  setPathGoalDate,
  setPathTarget,
  switchStatsTab,
  switchViewTab,
  suspendReviewWord,
  toggleBookmark,
  toggleLessonFocus,
  toggleDiff,
  toggleDockSettings,
  toggleEye,
  toggleFilterMenu,
  toggleLesson,
  toggleSelectAll,
  toggleSentenceTranslation,
  toggleTag,
  toggleTheme,
  writingHint,
  writingRestart,
  writingReveal,
  writingToggleOutline,
});
/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] V13.28 indítása...");
initV6Features();
initViewportFix(); // V13.20: iOS 26 standalone – a fix sávok ne csússzanak el a billentyűzet után
initLibraryEvents();

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
(async () => { await loadState(); })();
