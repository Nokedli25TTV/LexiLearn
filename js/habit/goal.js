// LexiLearn – habit/goal.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { currentMode, diffOrder, state } from '../core/state.js';
import { saveStats, saveWords } from '../core/storage.js';
import { lessonLabel, wordMatchesFilters } from '../library/filters.js';

/* ══════════════════════════════════════════════════════
   V13: NAPI SZOKÁS MOTOR – új szavak, napi cél, mai ismétlés
   - Egy szó "új", ha még sosem gyakoroltad és nincs learnedAt-je.
   - Tanuláskor ("Tudom" / jobbra húzás) a szó stats.learnedAt = mai nap (helyi dátum).
     A stats objektumban van, így a felhő szinkron módosítás nélkül viszi.
   - A napi cél módonként állítható (globalStats.dailyGoal, szinkronizált).
     Ha elérted, mára lezárjuk az új szavakat: holnap nagyobb kedvvel jössz vissza.
══════════════════════════════════════════════════════ */
const DEFAULT_DAILY_GOAL = { english: 10, japanese: 10, kanji: 5 };
const LEARN_BATCH_SIZE = 5;

function getDailyGoal() {
  return state.globalStats.dailyGoal || DEFAULT_DAILY_GOAL[currentMode] || 10;
}

function isNewWord(w) {
  const s = w.stats || {};
  return !s.learnedAt && !s.lastAttempt && !(s.totalCorrect > 0) && !(s.totalWrong > 0) && !s.srs;
}

function getTodayWords() {
  const today = todayKey();
  return state.words.filter(w => w.stats && w.stats.learnedAt === today);
}

// Új szavak sorrendje: lecke → nehézség → eredeti adatsorrend (így követi a Dekiru / kanji leckéket)
function getNewWordPool() {
  const order = new Map(state.words.map((w, i) => [w.id, i]));
  const lessonNum = w => { const n = parseInt(w.lesson, 10); return Number.isNaN(n) ? Infinity : n; };
  return state.words
    .filter(w => isNewWord(w) && wordMatchesFilters(w, { ignoreSearch: true }))
    .sort((a, b) => (lessonNum(a) - lessonNum(b)) || (diffOrder(a.diff) - diffOrder(b.diff)) || (order.get(a.id) - order.get(b.id)));
}

function hasPoolFilters() {
  const f = state.filters;
  const isJp = currentMode !== 'english';
  return f.tags.length > 0 || f.diff.size > 0 || (f.list && f.list !== 'all') ||
    (isJp && f.lesson && f.lesson !== 'all') || (isJp && f.day && f.day !== 'all');
}

// Ember-olvasható leírás arról, honnan jönnek az új szavak (a Gyakorlás fül szűrői)
function describePoolSource() {
  const f = state.filters;
  const isJp = currentMode !== 'english';
  const parts = [];
  if (f.list && f.list !== 'all') {
    parts.push(f.list === '__focus' ? 'Fókusz Lista' : (state.playlists.find(p => p.id === f.list)?.name || 'Saját lista'));
  }
  if (isJp && f.day && f.day !== 'all') parts.push(`Úti terv ${f.day}. nap`);
  if (isJp && f.lesson && f.lesson !== 'all') parts.push(lessonLabel(f.lesson));
  if (f.tags.length > 0) parts.push(f.tags.slice(0, 2).join(', ') + (f.tags.length > 2 ? ` +${f.tags.length - 2}` : ''));
  if (f.diff.size > 0) parts.push(Array.from(f.diff).join('/'));
  return parts.length > 0 ? parts.join(' · ') : 'Teljes szótár';
}

/* ── V13.2: NAPI AKTIVITÁS NAPLÓ (a Statisztika ábráihoz) ──
   globalStats.daily['YYYY-MM-DD'] = { a: kvízválaszok, c: ebből helyes,
     k: "Tudom" húzás / értékelés, g: "Még nem", s: aktív másodperc }
   Aktív idő: két egymást követő interakció közti idő, 45 mp-re vágva; 3 percnél
   hosszabb szünet új blokkot indít, így a félbehagyott app nem "tanul" tovább.
   A stats-ban él, így a felhő szinkron módosítás nélkül viszi. */
const ACTIVE_GAP_CAP_S = 45;
const ACTIVE_BREAK_S = 180;
const DAILY_LOG_MAX_DAYS = 400;
let _lastActivityTs = 0;

function logActivity({ correct = null, known = null } = {}) {
  const gs = state.globalStats;
  if (!gs.daily) gs.daily = {};
  const key = todayKey();
  if (!gs.dailySince) gs.dailySince = key;
  const d = gs.daily[key] || (gs.daily[key] = { a: 0, c: 0, k: 0, g: 0, s: 0 });
  if (correct !== null) { d.a++; if (correct) d.c++; }
  if (known !== null) { if (known) d.k++; else d.g++; }

  const now = Date.now();
  const gap = (now - _lastActivityTs) / 1000;
  d.s = Math.round(d.s + (_lastActivityTs && gap <= ACTIVE_BREAK_S ? Math.min(gap, ACTIVE_GAP_CAP_S) : 5));
  _lastActivityTs = now;

  const keys = Object.keys(gs.daily);
  if (keys.length > DAILY_LOG_MAX_DAYS) keys.sort().slice(0, keys.length - DAILY_LOG_MAX_DAYS).forEach(k => delete gs.daily[k]);
  saveStats();
}

function markWordLearned(word) {
  const today = todayKey();
  word.stats.learnedAt = today;
  if (!state.globalStats.studyDays) state.globalStats.studyDays = {};
  state.globalStats.studyDays[today] = true; // a tanulás is számít a napi sorozatba
  saveWords();
  saveStats();
}

export { ACTIVE_BREAK_S, ACTIVE_GAP_CAP_S, DAILY_LOG_MAX_DAYS, DEFAULT_DAILY_GOAL, LEARN_BATCH_SIZE, _lastActivityTs, describePoolSource, getDailyGoal, getNewWordPool, getTodayWords, hasPoolFilters, isNewWord, logActivity, markWordLearned };
