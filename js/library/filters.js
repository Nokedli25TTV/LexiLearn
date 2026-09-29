// LexiLearn – library/filters.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { TRAVEL_PLAN, TRAVEL_PLAN_KANJI } from '../core/data.js';
import { currentMode, state } from '../core/state.js';
import { isNewWord } from '../habit/goal.js';

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
function wordMatchesFilters(w, { ignoreSearch = false } = {}) {
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
  if (f.tags.length > 0 && !f.tags.some(t => w.tags.includes(t))) return false;
  if (f.diff.size > 0 && !f.diff.has(w.diff)) return false;
  if ((currentMode === 'kanji' || currentMode === 'japanese') && f.lesson !== 'all' && w.lesson != f.lesson) return false;

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
  return Number.isNaN(Number(v)) ? `${prefix}: ${v}` : `${prefix} ${v}. lecke`;
}

function getLessonOptions() {
  if (currentMode === 'english') return [];
  const map = new Map();
  state.words.forEach(w => {
    if (w.lesson === undefined || w.lesson === null || w.lesson === '') return;
    const key = String(w.lesson);
    const entry = map.get(key) || { value: key, total: 0, fresh: 0 };
    entry.total++;
    if (isNewWord(w)) entry.fresh++;
    map.set(key, entry);
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
  return (state.playlists || []).find(p => p.id === id)?.name || 'Lista';
}

export { SORT_OPTIONS, getDayOptions, getLessonOptions, getTravelPlan, lessonLabel, listLabel, validateDayFilter, wordMatchesFilters };
