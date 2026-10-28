// LexiLearn – core/state.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

/* ══════════════════════════════════════════════════════
   MULTI-LANGUAGE ÁLLAPOTTÉR & KÜLDETÉSEK
══════════════════════════════════════════════════════ */
function createEmptyState() {
  return {
    words: [], playlists: [], selectedIds: new Set(),
    // lesson: 'all' vagy a kiválasztott leckék tömbje; status: 'all' | 'new' | 'learned'
    filters: { search: '', tags: [], diff: new Set(), lesson: 'all', status: 'all', day: 'all', sort: 'az', list: 'all' },
    direction: 'en-hu', activeViewTab: 'words',
    practiceOptions: { type: 'classic', count: 20, order: 'random' }, // V13.1: a Gyakorlás dokk beállításai
    practice: { roundNumber: 0, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: 0, sessionStartTime: 0, sessionCorrect: 0, sessionWrong: 0, type: 'classic', currentSentenceObj: null },
    globalStats: { totalSessions: 0, totalCorrect: 0, totalWrong: 0, sessionHistory: [], studyDays: {}, recordStreak: 0, lastStudiedTopic: null },
    dailyQuests: { date: '', list: [] }
  };
}

// V13.23: a negyedik mód, a 214 Kangxi-radikál (a KanjiRadical projektből)
const MODES = ['english', 'japanese', 'kanji', 'radicals'];
let appData = {
  english: createEmptyState(),
  japanese: createEmptyState(),
  kanji: createEmptyState(),
  radicals: createEmptyState()
};
// V12: a firebase-sync.js (type=module) ezen keresztül éri el az adatokat
window.appData = appData;

let currentMode = 'english'; 
let state = appData[currentMode]; 

function diffOrder(d) {
  const map = {B1:1, B2:2, C1:3, C2:4, N5:1, N4:2, N3:3, N2:4, N1:5, '–':6}; // '–': JLPT-n kívüli radikál
  return map[d] ?? 0;
}
const MODE_LABELS = { english: 'Angol', japanese: 'Japán', kanji: 'Kandzsi', radicals: 'Radikálok' };

// V13.23: az egy karakteres módok (kandzsi, radikál) közös megjelenése: nagy írásjegy, on/kun olvasat
const isCharMode = (mode = currentMode) => mode === 'kanji' || mode === 'radicals';
// Mértékegység a szövegekben: „12 kanji”, „12 radikál”, „12 szó”
const unitOf = (mode = currentMode) => (mode === 'kanji' ? 'kanji' : mode === 'radicals' ? 'radikál' : 'szó');

// V13.3: a módváltás egyetlen helye (ES modulban a state/currentMode élő kötés, kívülről nem írható)
function setCurrentMode(mode) {
  currentMode = mode;
  state = appData[currentMode];
}

export { MODES, MODE_LABELS, appData, createEmptyState, currentMode, diffOrder, isCharMode, setCurrentMode, state, unitOf };
