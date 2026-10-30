// LexiLearn – habit/goal.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { appData, currentMode, diffOrder, state } from '../core/state.js';
import { saveStats, saveWords } from '../core/storage.js';
import { introducedDate, isLearnedWord, isStartedWord } from '../goal/jlpt.js';
import { isKanjiReady, knownRadicals } from '../goal/radical-path.js';
import { REVIEW_BATCH_SIZE } from '../srs/schedule.js';

/* ══════════════════════════════════════════════════════
   V13: NAPI SZOKÁS MOTOR – új szavak, napi cél, mai ismétlés
   - Egy szó "új", ha a napi tanulásban még nem kezdted el és gyakorlásban sem válaszoltál rá 5-ször egymás után helyesen.
   - Tanuláskor ("Tudom" / jobbra húzás) a szó stats.introducedAt = mai nap (helyi dátum): ez számít a napi penzumba.
     Megtanult két sikeres ismétlés után lesz (stats.learnedAt, lásd goal/jlpt.js).
     A stats objektumban van, így a felhő szinkron módosítás nélkül viszi.
   - A napi cél módonként állítható (globalStats.dailyGoal, szinkronizált).
     Ha elérted, mára lezárjuk az új szavakat: holnap nagyobb kedvvel jössz vissza.
══════════════════════════════════════════════════════ */
const DEFAULT_DAILY_GOAL = { english: 10, japanese: 10, kanji: 5, radicals: 5 };
const LEARN_BATCH_SIZE = 5;

function getDailyGoal() {
  return state.globalStats.dailyGoal || DEFAULT_DAILY_GOAL[currentMode] || 10;
}

// V13.18: egy ismétlési alkalom mérete, módonként állítható (globalStats.reviewBatch, szinkronizált)
const REVIEW_BATCH_OPTIONS = [10, 20, 30, 50];
function getReviewBatch() {
  const n = state.globalStats.reviewBatch;
  return REVIEW_BATCH_OPTIONS.includes(n) ? n : REVIEW_BATCH_SIZE;
}

function isNewWord(w) {
  return !isStartedWord(w);
}

function getTodayWords() {
  const today = todayKey();
  return state.words.filter(w => introducedDate(w) === today);
}

const lessonNum = w => {
  const values = Array.isArray(w.lesson) ? w.lesson : [w.lesson];
  const nums = values.map(Number).filter(n => Number.isFinite(n) && n >= 1);
  return nums.length ? Math.min(...nums) : Infinity;
};

// Japánban kizárólag a Dekiru leckéin megyünk végig, a leckehatáron fennmaradó
// napi helyeket automatikusan a következő lecke szavai töltik fel.
// A Gyakorlás fül szűrői és sorrendje a napi adagba nem szólnak bele.
function getNewWordPool() {
  const order = new Map(state.words.map((w, i) => [w.id, i]));
  let pool = state.words.filter(isNewWord);
  if (currentMode === 'japanese') {
    // A lesson mező a biztos Dekiru-azonosító: néhány, másik szótárban is szereplő szó
    // forráscímkéje összevonáskor megváltozhat, a lecke-hozzárendelése viszont megmarad.
    pool = pool.filter(w => Number.isFinite(lessonNum(w)));
    return pool.sort((a, b) => (lessonNum(a) - lessonNum(b)) || (order.get(a.id) - order.get(b.id)));
  }
  // V13.24: a radikálok a Radikál-útvonal sorrendjében (a leggyakoribb építőelemek elöl)
  if (currentMode === 'radicals') return pool.sort((a, b) => (a.path || 999) - (b.path || 999) || (order.get(a.id) - order.get(b.id)));
  // V13.26: ha már tanulsz radikálokat, szintenként előre jönnek a kandzsik, amelyeknek minden radikálját tudod
  // (a többi utánuk, a szokásos lecke-sorrendben). Radikálok nélkül marad a lecke-sorrend.
  const known = currentMode === 'kanji' ? knownRadicals(appData.radicals.words || []) : null;
  if (known && known.size > 0) {
    const wait = new Map(pool.map(w => [w.id, isKanjiReady(w.en, known) ? 0 : 1]));
    return pool.sort((a, b) => (diffOrder(a.diff) - diffOrder(b.diff)) || (wait.get(a.id) - wait.get(b.id))
      || (lessonNum(a) - lessonNum(b)) || (order.get(a.id) - order.get(b.id)));
  }
  return pool
    .sort((a, b) => (lessonNum(a) - lessonNum(b)) || (diffOrder(a.diff) - diffOrder(b.diff)) || (order.get(a.id) - order.get(b.id)));
}

// Az aktuális tankönyvi lecke állapota a Kezdőlaphoz. A több leckében szereplő
// szó mindegyik érintett leckében számít, ugyanúgy, mint a Gyakorlás szűrőjében.
function getCurrentLessonProgress() {
  if (currentMode !== 'japanese' && currentMode !== 'radicals') return null; // V13.24: a Radikál-útvonal is leckés
  const lessonWords = new Map();
  state.words.forEach(w => {
    const lessons = (Array.isArray(w.lesson) ? w.lesson : [w.lesson])
      .map(Number).filter(n => Number.isFinite(n) && n >= 1);
    lessons.forEach(lesson => {
      if (!lessonWords.has(lesson)) lessonWords.set(lesson, []);
      lessonWords.get(lesson).push(w);
    });
  });
  const lessons = [...lessonWords.keys()].sort((a, b) => a - b);
  const lesson = lessons.find(n => lessonWords.get(n).some(isNewWord));
  if (!lesson) {
    if (!lessons.length) return null;
    const lastLesson = lessons.at(-1), words = lessonWords.get(lastLesson);
    return {
      lesson: lastLesson, complete: true, total: words.length, learned: words.filter(isLearnedWord).length,
      reviewing: words.filter(w => !!w.stats?.srs).length, remaining: 0, next: []
    };
  }
  const words = lessonWords.get(lesson);
  const learned = words.filter(isLearnedWord).length;
  const reviewing = words.filter(w => !!w.stats?.srs).length;
  const slots = Math.max(0, getDailyGoal() - getTodayWords().length);
  const nextCounts = new Map();
  getNewWordPool().slice(0, slots).forEach(w => {
    const n = lessonNum(w);
    nextCounts.set(n, (nextCounts.get(n) || 0) + 1);
  });
  return {
    lesson, complete: false, total: words.length, learned, reviewing,
    remaining: words.filter(isNewWord).length,
    next: [...nextCounts].map(([lessonNumber, count]) => ({ lesson: lessonNumber, count }))
  };
}

function hasPoolFilters() {
  return false;
}

// Ember-olvasható leírás az automatikus napi sorrendről.
function describePoolSource() {
  const first = getNewWordPool()[0];
  if (currentMode === 'japanese') return first ? `Dekiru ${lessonNum(first)}. lecke · sorrendben` : 'Dekiru leckék';
  if (currentMode === 'radicals') return first ? `Radikál-útvonal ${lessonNum(first)}. lecke · sorrendben` : 'Radikál-útvonal';
  if (currentMode === 'kanji') {
    const known = knownRadicals(appData.radicals.words || []);
    if (first && known.size > 0 && isKanjiReady(first.en, known)) return `Radikálokból kész · ${first.diff}`; // V13.26
    return first && Number.isFinite(lessonNum(first)) ? `Kanji ${lessonNum(first)}. lecke · sorrendben` : 'Kanji leckék · sorrendben';
  }
  return 'Teljes angol szótár · szint szerint';
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

function markWordIntroduced(word) {
  const today = todayKey();
  word.stats.introducedAt = today;
  if (!state.globalStats.studyDays) state.globalStats.studyDays = {};
  state.globalStats.studyDays[today] = true; // a tanulás is számít a napi sorozatba
  saveWords();
  saveStats();
}

export { _lastActivityTs, ACTIVE_BREAK_S, ACTIVE_GAP_CAP_S, DAILY_LOG_MAX_DAYS, DEFAULT_DAILY_GOAL, describePoolSource, getCurrentLessonProgress, getDailyGoal, getNewWordPool, getReviewBatch, getTodayWords, hasPoolFilters, isNewWord, LEARN_BATCH_SIZE, logActivity, markWordIntroduced, REVIEW_BATCH_OPTIONS };
