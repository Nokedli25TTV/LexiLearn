// LexiLearn – library/filters.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { TRAVEL_PLAN, TRAVEL_PLAN_KANJI } from '../core/data.js';
import { currentMode, state } from '../core/state.js';
import { isNewWord } from '../habit/goal.js';
import { isLeech } from '../features/leeches.js';

/* ══════════════════════════════════════════════════════
   ÚTI TERV – AKTÍV NAPI TERV
   Japán mód  → TRAVEL_PLAN        (szavak, kana szerint)
   Kandzsi mód → TRAVEL_PLAN_KANJI (kanjik, karakter szerint)
   Mindkettő a japanese_words.js-ben van definiálva.
══════════════════════════════════════════════════════ */
function getTravelPlan() {
  if (currentMode === 'japanese') return (typeof TRAVEL_PLAN !== 'undefined') ? TRAVEL_PLAN : null;
  if (currentMode === 'kanji')    return (typeof TRAVEL_PLAN_KANJI !== 'undefined') ? TRAVEL_PLAN_KANJI : null;
  return null;
}

// V13: a szűrő-predikátum külön függvényben, hogy a Kezdőlap "új szavak" forrása
// ugyanazokat a szűrőket (lecke, nap, témakör, szint, lista) használhassa.
// ignoreSearch: a szabad szöveges keresés átmeneti, azt a napi tanulás figyelmen kívül hagyja.
const wordLessons = w => (Array.isArray(w.lesson) ? w.lesson : [w.lesson])
  .filter(value => value !== undefined && value !== null && value !== '')
  .map(String);

// V13.17: Lecke fókusz lista – a gyakorlásban nehéznek jelölt szavak (w.lessonFocus) a saját
// leckéjük szerint csoportosítva, a Fókusz Listától (csillag) külön. Lista-azonosító: '__lesson:3';
// a lecke nélküli szavak csoportja '__lesson:'. Angol módban nincs lecke, ott nem jelenik meg.
const LESSON_FOCUS_PREFIX = '__lesson:';
const isLessonFocusList = id => typeof id === 'string' && id.startsWith(LESSON_FOCUS_PREFIX);
const lessonFocusKeys = w => { const l = wordLessons(w); return l.length ? l : ['']; };
const lessonFocusLabel = key => (key === '' ? 'Lecke nélkül' : lessonLabel(key));

function getLessonFocusGroups(words = state.words) {
  const counts = new Map();
  words.forEach(w => { if (w.lessonFocus) lessonFocusKeys(w).forEach(k => counts.set(k, (counts.get(k) || 0) + 1)); });
  return [...counts.entries()]
    .map(([key, count]) => ({ key, id: LESSON_FOCUS_PREFIX + key, label: lessonFocusLabel(key), count }))
    .sort((a, b) => (a.key === '') - (b.key === '') || (Number(a.key) - Number(b.key)) || a.key.localeCompare(b.key, 'hu'));
}

// A lecke-szűrő több leckét is tartalmazhat (tömb). Régi mentésben egyetlen érték ('3') is állhat ott.
function selectedLessons(f = state.filters) {
  if (Array.isArray(f.lesson)) return f.lesson.map(String);
  return f.lesson && f.lesson !== 'all' ? [String(f.lesson)] : [];
}

// Állapot szerinti szűrés: ugyanaz a "megtanult", mint a Kezdőlap leckekártyáján és a JLPT haladásban
const STATUS_OPTIONS = [['all', 'Minden'], ['new', 'Még nem tanult'], ['learned', 'Megtanult']];
const statusFilter = (f = state.filters) => (STATUS_OPTIONS.some(([v]) => v === f.status) ? f.status : 'all');

function wordMatchesFilters(w, { ignoreSearch = false, ignoreTags = false, ignoreStatus = false } = {}) {
  const f = state.filters;
  if (!ignoreSearch && f.search) {
    const s = f.search;
    const matchEn = w.en.toLowerCase().includes(s);
    const matchHu = w.hu.toLowerCase().includes(s);
    const matchRomaji = w.romaji ? w.romaji.toLowerCase().includes(s) : false;
    const matchOnyomi = w.onyomi ? w.onyomi.toLowerCase().includes(s) : false;
    const matchKunyomi = w.kunyomi ? w.kunyomi.toLowerCase().includes(s) : false;
    if (!matchEn && !matchHu && !matchRomaji && !matchOnyomi && !matchKunyomi) return false;
  }
  if (!ignoreTags && f.tags.length > 0 && !f.tags.some(t => w.tags.includes(t))) return false;
  if (f.diff.size > 0 && !f.diff.has(w.diff)) return false;
  if (currentMode === 'kanji' || currentMode === 'japanese') {
    const lessons = selectedLessons(f);
    if (lessons.length > 0 && !wordLessons(w).some(l => lessons.includes(l))) return false;
  }
  if (!ignoreStatus) {
    const status = statusFilter(f);
    if (status !== 'all' && (status === 'new') !== isNewWord(w)) return false;
  }

  // Úti terv (Nap) szűrő – Japán (TRAVEL_PLAN) és Kandzsi (TRAVEL_PLAN_KANJI) mód
  if ((currentMode === 'japanese' || currentMode === 'kanji') && f.day && f.day !== 'all') {
    const plan = getTravelPlan();
    const dayItems = plan ? plan[f.day] : null;
    if (!Array.isArray(dayItems) || !dayItems.includes(w.en)) return false;
  }

  // Lista (playlist) szerinti szűrés – FIX #4
  // Hiba volt: w.lists-et vizsgált, ami soha nincs a szavakon.
  // Javítva: a playlist wordIds tömbben keresi az adott szót.
  // V11: '__focus' virtuális lista → csillagozott szavak
  if (f.list && f.list !== 'all') {
    if (f.list === '__focus') {
      if (!w.bookmarked) return false;
    } else if (f.list === '__leech') {
      if (!isLeech(w)) return false;
    } else if (isLessonFocusList(f.list)) {
      if (!w.lessonFocus || !lessonFocusKeys(w).includes(f.list.slice(LESSON_FOCUS_PREFIX.length))) return false;
    } else {
      const pl = state.playlists ? state.playlists.find(p => p.id === f.list) : null;
      if (!pl || !pl.wordIds.includes(w.id)) return false;
    }
  }

  return true;
}

const SORT_OPTIONS = [
  ['az', 'A → Z'], ['za', 'Z → A'], ['diff-asc', 'Könnyebb elöl'], ['diff-desc', 'Nehezebb elöl'],
  ['unlearned', 'Még nem tanult elöl'], ['mastered', 'Jól tudott elöl']
];

/* ── Szűrő opciók ── */
function lessonLabel(v) {
  const prefix = currentMode === 'kanji' ? 'Kanji' : 'Dekiru';
  if (Number.isNaN(Number(v))) return `${prefix}: ${v}`;
  const book = currentMode === 'japanese' && Number(v) >= 25 ? ' · 2. könyv' : '';
  return `${prefix} ${v}. lecke${book}`;
}

// A Lecke pilla felirata: egy lecke névvel, kettő felsorolva, összefüggő sor tartományként, különben darabszám
function lessonsLabel(values) {
  if (values.length === 0) return 'Lecke';
  if (values.length === 1) return lessonLabel(values[0]);
  const nums = values.map(Number).sort((a, b) => a - b);
  if (nums.some(Number.isNaN)) return `${values.length} lecke`;
  if (nums.length === 2) return `${nums[0]}., ${nums[1]}. lecke`;
  const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  return contiguous ? `${nums[0]}–${nums[nums.length - 1]}. lecke` : `${nums.length} lecke`;
}

// Van-e szerkezeti szűrő a Gyakorlás fülön (a szabad szöveges keresés nem számít ide)
function hasActiveFilters(f = state.filters) {
  return f.tags.length > 0 || f.diff.size > 0 || selectedLessons(f).length > 0 || statusFilter(f) !== 'all' ||
    (!!f.day && f.day !== 'all') || (!!f.list && f.list !== 'all');
}

// Hány szó esik az egyes állapotokba a többi szűrő (lecke, témakör, szint, lista, keresés) mellett
function getStatusCounts() {
  const pool = state.words.filter(w => wordMatchesFilters(w, { ignoreStatus: true }));
  const fresh = pool.filter(isNewWord).length;
  return { all: pool.length, new: fresh, learned: pool.length - fresh };
}

function getLessonOptions() {
  if (currentMode === 'english') return [];
  const map = new Map();
  state.words.forEach(w => {
    wordLessons(w).forEach(key => {
      const entry = map.get(key) || { value: key, total: 0, fresh: 0 };
      entry.total++;
      if (isNewWord(w)) entry.fresh++;
      map.set(key, entry);
    });
  });
  return [...map.values()].sort((a, b) => (Number(a.value) - Number(b.value)) || a.value.localeCompare(b.value, 'hu'));
}

function getDayOptions() {
  const plan = getTravelPlan();
  if (!plan) return [];
  return Object.keys(plan).map(Number).filter(n => !Number.isNaN(n)).sort((a, b) => a - b)
    .map(d => ({ value: String(d), total: Array.isArray(plan[d]) ? plan[d].length : 0 }));
}

// Mentett nap visszaállítása: ha a terv már nem tartalmazza, visszaesünk 'all'-ra
function validateDayFilter() {
  const f = state.filters;
  if (!f.day || f.day === 'all') { f.day = 'all'; return; }
  if (!getDayOptions().some(o => o.value === String(f.day))) f.day = 'all';
}

function listLabel(id) {
  if (!id || id === 'all') return 'Lista';
  if (id === '__focus') return 'Fókusz Lista';
  if (id === '__leech') return 'Makacs szavak';
  if (isLessonFocusList(id)) return `${lessonFocusLabel(id.slice(LESSON_FOCUS_PREFIX.length))} · fókusz`;
  return (state.playlists || []).find(p => p.id === id)?.name || 'Lista';
}

export { LESSON_FOCUS_PREFIX, SORT_OPTIONS, STATUS_OPTIONS, getDayOptions, getLessonFocusGroups, getLessonOptions, getStatusCounts, getTravelPlan, hasActiveFilters, isLessonFocusList, lessonFocusKeys, lessonFocusLabel, lessonLabel, lessonsLabel, listLabel, selectedLessons, statusFilter, validateDayFilter, wordLessons, wordMatchesFilters };
