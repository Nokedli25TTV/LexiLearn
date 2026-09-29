// LexiLearn – core/state.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

/* ══════════════════════════════════════════════════════
   MULTI-LANGUAGE ÁLLAPOTTÉR & KÜLDETÉSEK
══════════════════════════════════════════════════════ */
function createEmptyState() {
  return {
    words: [], playlists: [], selectedIds: new Set(),
    filters: { search: '', tags: [], diff: new Set(), lesson: 'all', day: 'all', sort: 'az', list: 'all' },
    direction: 'en-hu', activeViewTab: 'words',
    practiceOptions: { type: 'classic', count: 20, order: 'random' }, // V13.1: a Gyakorlás dokk beállításai
    practice: { roundNumber: 0, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: 0, sessionStartTime: 0, sessionCorrect: 0, sessionWrong: 0, type: 'classic', currentSentenceObj: null },
    globalStats: { totalSessions: 0, totalCorrect: 0, totalWrong: 0, sessionHistory: [], studyDays: {}, recordStreak: 0, lastStudiedTopic: null },
    dailyQuests: { date: '', list: [] }
  };
}

let appData = {
  english: createEmptyState(),
  japanese: createEmptyState(),
  kanji: createEmptyState()
};
// V12: a firebase-sync.js (type=module) ezen keresztül éri el az adatokat
window.appData = appData;

let currentMode = 'english'; 
let state = appData[currentMode]; 

function diffOrder(d) {
  const map = {B1:1, B2:2, C1:3, C2:4, N5:1, N4:2, N3:3, N2:4, N1:5};
  return map[d] ?? 0;
}
const MODE_LABELS = { english: 'Angol', japanese: 'Japán', kanji: 'Kandzsi' };

// V13.3: a módváltás egyetlen helye (ES modulban a state/currentMode élő kötés, kívülről nem írható)
function setCurrentMode(mode) {
  currentMode = mode;
  state = appData[currentMode];
}

export { MODE_LABELS, appData, createEmptyState, currentMode, diffOrder, setCurrentMode, state };
