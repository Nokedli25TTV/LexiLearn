/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] App.js V13.0 (Mobil kezdőlap, napi cél, mai szavak) indítása...");

if (typeof SAMPLE_WORDS === 'undefined') window.SAMPLE_WORDS = [];
if (typeof JAPANESE_WORDS === 'undefined') window.JAPANESE_WORDS = [];
if (typeof KANJI_DATA === 'undefined') window.KANJI_DATA = [];
if (typeof JAPANESE_SENTENCES === 'undefined') window.JAPANESE_SENTENCES = [];
if (typeof english_sentences2 === 'undefined') window.english_sentences2 = [];
/* ══════════════════════════════════════════════════════
   AUTOMATIKUS MONDAT BETÖLTŐ (Auto-Loader javítva)
══════════════════════════════════════════════════════ */
function loadJapaneseSentences() {
  for (let i = 1; i <= 30; i++) {
    try {
      const lessonData = eval(`JAPANESE_SENTENCES_L${i}`);
      if (lessonData && Array.isArray(lessonData)) {
        JAPANESE_SENTENCES.push(...lessonData);
      }
    } catch (error) {
      // Ha nincs ilyen lecke, simán átugorja
    }
  }
  console.log(`[LexiLearn] ÖSSZES mondat betöltve: ${JAPANESE_SENTENCES.length} db`);
}
loadJapaneseSentences();

/* ══════════════════════════════════════════════════════
   V6.5 AUTOMATIKUS UI INJEKTOR (Gamification + Heatmap)
══════════════════════════════════════════════════════ */
function initV6Features() {
  if (!document.getElementById('v6-styles')) {
    const style = document.createElement('style');
    style.id = 'v6-styles';
    style.innerHTML = `
      .quest-item { margin-bottom: 12px; opacity: 1; transition: opacity 0.3s; }
      .quest-item.completed { opacity: 0.6; }
      .quest-item.completed .quest-title { text-decoration: line-through; color: var(--success); }
      .quest-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-2); }
      .quest-bar-bg { height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
      .quest-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.5s ease-out; }
      .quest-item.completed .quest-bar-fill { background: var(--success); }
    `;
    document.head.appendChild(style);
  }
}
initV6Features();

/* ══════════════════════════════════════════════════════
   SÖTÉT MÓD LOGIKA
══════════════════════════════════════════════════════ */
// V13: a sötét mód az alapértelmezés. A téma localStorage-ba is tükröződik,
// hogy az index.html <head> scriptje villanás nélkül, még a CSS előtt be tudja állítani.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sw = document.getElementById('theme-switch');
  if (sw) sw.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1311' : '#1a3d2e');
  try { localStorage.setItem('lexi_theme', theme); } catch (e) { /* privát mód */ }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  saveSettings(); // Csak a beállításokat kell menteni, nem a teljes DB-t
}

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

/* ══════════════════════════════════════════════════════
   V12.4: STABIL SZÓ ID GENERÁTOR (cloud sync alapfeltétele)
   A korábbi 'en_5_1717...' Date.now-os ID-k miatt a két eszköz
   közötti szó-párosítás nem működött. Mostantól a szó ID-je
   stabilan az en/kana/kanji érték alapján generálódik.
══════════════════════════════════════════════════════ */
function stableWordId(prefix, srcStr) {
  // Firestore-friendly + URL-safe: veszélyes karaktereket cseréljük
  const safe = String(srcStr || '')
    .replace(/[\/.#$\[\]\s]/g, '_')  // Firestore tiltott + space
    .slice(0, 200);                   // doc field max 1500 byte, biztosra megyek
  return prefix + '_' + safe;
}

// Egyszeri migráció: régi Date.now-os ID-ket cseréli stabil ID-re,
// frissíti a hozzájuk tartozó referenciákat (selectedIds, playlists, dailyQuests).
function migrateToStableIds() {
  const oldToNew = new Map();
  const _isOldId = (id) => id && /_\d{13}/.test(id); // 13 jegyű timestamp benne

  // ── ANGOL ──
  appData.english.words.forEach(w => {
    if (w.source === 'data_js' && _isOldId(w.id)) {
      const newId = stableWordId('en', w.en);
      oldToNew.set(w.id, newId);
      w.id = newId;
    }
  });

  // ── JAPÁN (data_js + dekiru egyaránt 'ja_' prefix-szel) ──
  appData.japanese.words.forEach(w => {
    if ((w.source === 'data_js' || w.source === 'dekiru') && _isOldId(w.id)) {
      const newId = stableWordId('ja', w.en);
      oldToNew.set(w.id, newId);
      w.id = newId;
    }
  });

  // ── KANJI ──
  appData.kanji.words.forEach(w => {
    if (w.source === 'data_js' && _isOldId(w.id)) {
      const newId = stableWordId('kj', w.en);
      oldToNew.set(w.id, newId);
      w.id = newId;
    }
  });

  if (oldToNew.size === 0) return false;

  console.log(`[LexiLearn] V12.4 ID migráció: ${oldToNew.size} szó ID-je stabil ID-re cserélve.`);

  // Hivatkozások frissítése
  ['english', 'japanese', 'kanji'].forEach(lang => {
    // selectedIds (Set)
    if (appData[lang].selectedIds) {
      const newSelected = new Set();
      appData[lang].selectedIds.forEach(id => newSelected.add(oldToNew.get(id) || id));
      appData[lang].selectedIds = newSelected;
    }
    // playlists.wordIds
    (appData[lang].playlists || []).forEach(p => {
      if (Array.isArray(p.wordIds)) {
        p.wordIds = p.wordIds.map(id => oldToNew.get(id) || id);
      }
    });
    // dailyQuests params (DailyWord, MistakeCleanup, GhostHunter)
    const q = appData[lang].dailyQuests;
    if (q && Array.isArray(q.list)) {
      q.list.forEach(quest => {
        if (!quest.params) return;
        if (quest.params.wordId) {
          quest.params.wordId = oldToNew.get(quest.params.wordId) || quest.params.wordId;
        }
        if (Array.isArray(quest.params.wordIds)) {
          quest.params.wordIds = quest.params.wordIds.map(id => oldToNew.get(id) || id);
        }
        if (Array.isArray(quest.params.ghostIds)) {
          quest.params.ghostIds = quest.params.ghostIds.map(id => oldToNew.get(id) || id);
        }
      });
    }
  });

  return true;
}

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
   STORAGE & INIT  –  V10.5 SPLIT-DB ARCHITEKTÚRA
   4 külön IndexedDB kulcs a gyors, célzott mentésekhez:
     lexi_words     → szótár (csak ritkán változik)
     lexi_stats     → pontszámok, streakek, küldetések
     lexi_playlists → saját listák
     lexi_settings  → mód, téma, szűrők, irányok
══════════════════════════════════════════════════════ */

// V13: beállítás-séma verzió. Az ez alatti verzióról érkezőknél egyszer átállunk sötét módra
// (korábban a világos volt az alapértelmezés, így az elmentett 'light' nem tudatos választás).
const UI_VERSION = 13;

// ── Belső segéd: aktuális állapot → 4 mentési objektum ──────────
function _buildSaveObjects() {
  const words = {}, stats = {}, playlists = {}, settings = { lastMode: currentMode, theme: document.documentElement.getAttribute('data-theme') || 'dark', uiVersion: UI_VERSION };
  ['english', 'japanese', 'kanji'].forEach(lang => {
    words[lang]     = appData[lang].words;
    stats[lang]     = { globalStats: appData[lang].globalStats, dailyQuests: appData[lang].dailyQuests };
    playlists[lang] = appData[lang].playlists;
    settings[lang]  = {
      direction:   appData[lang].direction,
      filters:     { ...appData[lang].filters, diff: Array.from(appData[lang].filters.diff) },
      selectedIds: Array.from(appData[lang].selectedIds),
      practiceOptions: appData[lang].practiceOptions
    };
  });
  return { words, stats, playlists, settings };
}

// ── Célzott mentő függvények (processzorkímélő) ──────────────────
// V12: a sync-relevant mentések (words/stats/playlists) trigger-elik a felhő push-t
async function saveWords()     { try { const {words}     = _buildSaveObjects(); await localforage.setItem('lexi_words',     words);     } catch(e) { console.warn('[LexiLearn] saveWords hiba:', e); } if (window.LexiFirebase) window.LexiFirebase.triggerPush(); }
async function saveStats()     { try { const {stats}     = _buildSaveObjects(); await localforage.setItem('lexi_stats',     stats);     } catch(e) { console.warn('[LexiLearn] saveStats hiba:', e); } if (window.LexiFirebase) window.LexiFirebase.triggerPush(); }
async function savePlaylists() { try { const {playlists} = _buildSaveObjects(); await localforage.setItem('lexi_playlists', playlists); } catch(e) { console.warn('[LexiLearn] savePlaylists hiba:', e); } if (window.LexiFirebase) window.LexiFirebase.triggerPush(); }
async function saveSettings()  { try { const {settings}  = _buildSaveObjects(); await localforage.setItem('lexi_settings',  settings);  } catch(e) { console.warn('[LexiLearn] saveSettings hiba:', e); } /* settings NEM sync-elt */ }

// ── Teljes mentés (párhuzamos) – pl. import/export előtt ────────
async function saveState() {
  const { words, stats, playlists, settings } = _buildSaveObjects();
  try {
    await Promise.all([
      localforage.setItem('lexi_words',     words),
      localforage.setItem('lexi_stats',     stats),
      localforage.setItem('lexi_playlists', playlists),
      localforage.setItem('lexi_settings',  settings)
    ]);
  } catch(e) { console.warn('[LexiLearn] saveState hiba:', e); }
}

// ── Betöltő segéd: parsed objektumból appData feltöltése ────────
function _applyParsedData(words, stats, playlists, settings) {
  ['english', 'japanese', 'kanji'].forEach(lang => {
    if (words?.[lang])     appData[lang].words = words[lang];
    if (playlists?.[lang]) appData[lang].playlists = playlists[lang];
    if (stats?.[lang]) {
      appData[lang].globalStats  = stats[lang].globalStats  || createEmptyState().globalStats;
      appData[lang].dailyQuests  = stats[lang].dailyQuests  || { date: '', list: [] };
    }
    if (settings?.[lang]) {
      appData[lang].direction = settings[lang].direction || 'en-hu';
      if (settings[lang].filters) {
        // Defaultokkal merge-elünk, hogy új szűrőkulcsok (pl. day) is meglegyenek
        appData[lang].filters = { ...createEmptyState().filters, ...settings[lang].filters };
        appData[lang].filters.diff = new Set(settings[lang].filters.diff || []);
      }
      if (settings[lang].selectedIds) {
        appData[lang].selectedIds = new Set(settings[lang].selectedIds);
      }
      if (settings[lang].practiceOptions) {
        appData[lang].practiceOptions = { ...createEmptyState().practiceOptions, ...settings[lang].practiceOptions };
      }
    }
  });
}

// ── Migrációs lépés: régi monolit objektum → 4 kulcs ────────────
async function _migrateMonolithToSplit(monolit) {
  console.log('[LexiLearn] Migráció: monolit → 4 split kulcs...');
  const words = {}, stats = {}, playlists = {}, settings = {
    lastMode: monolit.lastMode || 'english',
    theme:    monolit.theme    || 'light'
  };
  ['english', 'japanese', 'kanji'].forEach(lang => {
    const d = monolit[lang] || {};
    words[lang]     = d.words     || [];
    playlists[lang] = d.playlists || [];
    stats[lang]     = { globalStats: d.globalStats || createEmptyState().globalStats, dailyQuests: d.dailyQuests || { date: '', list: [] } };
    settings[lang]  = {
      direction:   d.direction   || 'en-hu',
      filters:     { ...(d.filters || createEmptyState().filters), diff: Array.isArray(d.filters?.diff) ? d.filters.diff : [] },
      selectedIds: d.selectedIds || []
    };
  });
  await Promise.all([
    localforage.setItem('lexi_words',     words),
    localforage.setItem('lexi_stats',     stats),
    localforage.setItem('lexi_playlists', playlists),
    localforage.setItem('lexi_settings',  settings)
  ]);
  // Régi monolit kulcs törlése
  await localforage.removeItem('lexilearn_v5');
  console.log('[LexiLearn] Migráció kész, lexilearn_v5 törölve.');
  return { words, stats, playlists, settings };
}

// ── Fő betöltő ──────────────────────────────────────────────────
async function loadState() {
  let savedMode = 'english';
  let savedTheme = 'dark';

  try {
    // ═══ 1. LÉPÉS: már split-DB-ben van? (V10.5 formátum) ═══════
    let lexiWords = await localforage.getItem('lexi_words');

    if (!lexiWords) {
      // ═══ 2. LÉPÉS: V10 monolit localForage kulcs? ═══════════
      const monolitIDB = await localforage.getItem('lexilearn_v5');
      if (monolitIDB) {
        const split = await _migrateMonolithToSplit(monolitIDB);
        lexiWords = split.words;
      } else {
        // ═══ 3. LÉPÉS: V9 localStorage JSON? ═══════════════════
        const monolitLS = localStorage.getItem('lexilearn_v5');
        if (monolitLS) {
          console.log('[LexiLearn] Migráció: localStorage (V9) → split IndexedDB...');
          try {
            const oldParsed = JSON.parse(monolitLS);
            const split = await _migrateMonolithToSplit(oldParsed);
            lexiWords = split.words;
            localStorage.removeItem('lexilearn_v5');
            console.log('[LexiLearn] localStorage törölve.');
          } catch(migErr) {
            console.warn('[LexiLearn] V9 migrációs hiba:', migErr);
          }
        }
      }
    }

    // ═══ ADATOK BETÖLTÉSE (ha van mit) ══════════════════════════
    if (lexiWords) {
      const [lexiStats, lexiPlaylists, lexiSettings] = await Promise.all([
        localforage.getItem('lexi_stats'),
        localforage.getItem('lexi_playlists'),
        localforage.getItem('lexi_settings')
      ]);
      savedMode  = lexiSettings?.lastMode || 'english';
      savedTheme = (lexiSettings?.uiVersion || 0) < UI_VERSION ? 'dark' : (lexiSettings?.theme || 'dark');
      _applyParsedData(lexiWords, lexiStats, lexiPlaylists, lexiSettings);
    }

    // V12.4: stabil ID migráció ELŐSZÖR (mielőtt a syncNewWords új szavakat ad hozzá)
    const migrated = migrateToStableIds();
    syncNewWords();
    syncCustomLists();
    if (migrated) await saveWords(); // mentsük a migrált ID-ket
  } catch(e) {
    console.warn('[LexiLearn] Betöltési hiba:', e);
    migrateToStableIds();
    syncNewWords();
    syncCustomLists();
  }

  cleanTags();
  applyTheme(savedTheme);
  setMode(savedMode, true);
  renderDashboard();
  renderHome();
  renderStorageInfo(); // Tárhely kijelző frissítése
}

// ── Tárhely méret kijelző ────────────────────────────────────────
async function renderStorageInfo() {
  const el = document.getElementById('storage-info');
  if (!el) return;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      const usedMB  = (usage  / 1024 / 1024).toFixed(2);
      const quotaMB = (quota  / 1024 / 1024).toFixed(0);
      const pct     = Math.round((usage / quota) * 100);
      el.innerHTML = `
        <div style="margin-top:10px; padding:10px 0; border-top:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-2); margin-bottom:6px;">
            <span>Helyi tárhely (IndexedDB)</span>
            <strong>${usedMB} MB / ${quotaMB} MB (${pct}%)</strong>
          </div>
          <div style="height:6px; background:var(--surface-2); border-radius:3px; overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:${pct > 80 ? 'var(--accent)' : 'var(--primary)'}; border-radius:3px; transition:width 0.5s;"></div>
          </div>
        </div>`;
    }
  } catch(e) { /* storage API nem elérhető */ }
}

function cleanTags() {
  let needsSave = false;
  ['english', 'japanese', 'kanji'].forEach(lang => {
    appData[lang].words.forEach(w => {
      let originalTags = JSON.stringify(w.tags);
      w.tags = w.tags.map(t => {
        let clean = t.trim().toLowerCase();
        if (clean === 'psziog' || clean === 'pszichológ') return 'pszichológia';
        if (clean === 'filosz') return 'filozófia';
        return clean;
      });
      w.tags = [...new Set(w.tags)];
      if (originalTags !== JSON.stringify(w.tags)) needsSave = true;
    });
  });
  if (needsSave) saveWords();
}

function syncNewWords() {
  // --- ANGOL SZINKRONIZÁLÁS ÉS TÖRLÉS ---
  if (SAMPLE_WORDS.length > 0) {
    const sampleEnSet = new Set(SAMPLE_WORDS.map(w => w.en));
    
    // MIGRÁCIÓ: A régi system szavak megjelölése az ID alapján
    appData.english.words.forEach(w => {
      if (w.id && (w.id.startsWith('en_') || w.id.startsWith('en_new_'))) {
        if (!w.source) w.source = 'data_js';
      }
    });

    if (appData.english.words.length === 0) {
      appData.english.words = SAMPLE_WORDS.map((w, i) => ({
        id: stableWordId('en', w.en), en: w.en, hu: w.hu, tags: w.tags, diff: w.diff || 'B2', syn: w.syn || '', sentence: w.sentence || '',
        source: 'data_js',
        bookmarked: false,
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      }));
    } else {
      SAMPLE_WORDS.forEach((srcWord, i) => {
        const existing = appData.english.words.find(w => w.en === srcWord.en);
        if (existing) {
          existing.hu       = srcWord.hu;
          existing.tags     = srcWord.tags;
          existing.diff     = srcWord.diff || 'B2';
          existing.syn      = srcWord.syn || '';
          existing.sentence = srcWord.sentence || '';
          existing.source   = 'data_js';
          if (existing.bookmarked === undefined) existing.bookmarked = false;
        } else {
          appData.english.words.push({
            id: stableWordId('en', srcWord.en),
            en: srcWord.en, hu: srcWord.hu, tags: srcWord.tags,
            diff: srcWord.diff || 'B2', syn: srcWord.syn || '', sentence: srcWord.sentence || '',
            source: 'data_js',
            bookmarked: false,
            stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
          });
        }
      });
      // TÖRLÉS: Most már a "pherhaps" is törlődni fog, mert a fenti migráció megjelölte
      appData.english.words = appData.english.words.filter(w =>
        w.source !== 'data_js' || sampleEnSet.has(w.en)
      );
    }
  }
  
  // --- JAPÁN ÉS KANDZSI SZINKRONIZÁLÁS (Javítva) ---
  const existingJpIds = new Set(appData.japanese.words.map(w => w.en)); 
  const DEKIRU_WORDS = [];
  for (let i = 1; i <= 30; i++) {
    try {
      const list = eval('DEKIRU_L' + i);
      if (list) DEKIRU_WORDS.push(...list);
    } catch(e) { }
  }

  // Megjelöljük a régi japán/kandzsi szavakat is a törléshez
  appData.japanese.words.forEach(w => {
    if (w.id && (w.id.startsWith('ja_') || w.id.startsWith('ja_dek_'))) {
      if (!w.source) w.source = w.id.includes('dek') ? 'dekiru' : 'data_js';
    }
  });

  DEKIRU_WORDS.forEach((w, i) => {
    let lessonVal = w.lesson ? (Array.isArray(w.lesson) ? w.lesson[0] : w.lesson) : null;
    let existingWord = appData.japanese.words.find(x => x.en === w.kana);
    if (!existingWord) {
      appData.japanese.words.push({
        id: stableWordId('ja', w.kana),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5',
        lesson: lessonVal, source: 'dekiru', sentence: '',
        bookmarked: false,
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.lesson = lessonVal;
      existingWord.source = 'dekiru';
      existingWord.hu = w.hu; // Frissítjük a fordítást is
      if (existingWord.bookmarked === undefined) existingWord.bookmarked = false;
    }
  });

  JAPANESE_WORDS.forEach((w, i) => {
    let existingWord = appData.japanese.words.find(x => x.en === w.kana);
    if (!existingWord) {
      appData.japanese.words.push({
        id: stableWordId('ja', w.kana),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5',
        source: 'data_js', sentence: '',
        bookmarked: false,
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.hu = w.hu;
      existingWord.source = 'data_js';
      if (existingWord.bookmarked === undefined) existingWord.bookmarked = false;
    }
  });

  // Japán törlési logika
  const sampleJpSet = new Set(JAPANESE_WORDS.map(w => w.kana));
  const dekiruSet = new Set(DEKIRU_WORDS.map(w => w.kana));
  appData.japanese.words = appData.japanese.words.filter(w => 
    (w.source !== 'data_js' && w.source !== 'dekiru') || 
    (w.source === 'data_js' && sampleJpSet.has(w.en)) ||
    (w.source === 'dekiru' && dekiruSet.has(w.en))
  );

  // Kandzsi frissítés és törlés
  const sampleKjSet = new Set(KANJI_DATA.map(w => w.kanji));
  appData.kanji.words.forEach(w => {
    if (w.id && w.id.startsWith('kj_') && !w.source) w.source = 'data_js';
  });

  KANJI_DATA.forEach((w, i) => {
    let existingWord = appData.kanji.words.find(x => x.en === w.kanji);
    if (!existingWord) {
      appData.kanji.words.push({
        id: stableWordId('kj', w.kanji),
        en: w.kanji, hu: w.meaning, romaji: w.romaji, onyomi: w.onyomi, kunyomi: w.kunyomi,
        tags: w.tags || [], lesson: w.lesson, diff: w.jlpt || 'N5',
        source: 'data_js', sentence: '',
        bookmarked: false,
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.hu = w.meaning;
      existingWord.lesson = w.lesson;
      existingWord.tags = w.tags || []; // tags szinkronizálása az adatbázisból
      existingWord.source = 'data_js';
      if (existingWord.bookmarked === undefined) existingWord.bookmarked = false;
    }
  });

  appData.kanji.words = appData.kanji.words.filter(w => 
    w.source !== 'data_js' || sampleKjSet.has(w.en)
  );
}

/* ══════════════════════════════════════════════════════
   MY_CUSTOM_LISTS BEOLVASÓ (data.js → playlists)
   Ha a data.js-ben definiálsz MY_CUSTOM_LISTS tömböt,
   ez a függvény automatikusan betölti őket mint saját listákat.
   Mindig szinkronizál, tehát ha módosítod a data.js-t, az 
   app is frissül a következő betöltéskor.
══════════════════════════════════════════════════════ */
function syncCustomLists() {
  // Először töröljük az összes korábban data.js-ből betöltött listát.
  // Így ha törölsz egyet a data.js-ből, a localStorage-ból is eltűnik.
  appData.english.playlists = appData.english.playlists.filter(p => p.source !== 'data_js');

  if (typeof MY_CUSTOM_LISTS === 'undefined' || !Array.isArray(MY_CUSTOM_LISTS)) return;

  MY_CUSTOM_LISTS.forEach(list => {
    if (!list.id || !list.name || !Array.isArray(list.words)) return;
    const wordIds = list.words
      .map(enWord => appData.english.words.find(w => w.en === enWord))
      .filter(Boolean)
      .map(w => w.id);
    appData.english.playlists.push({
      id: list.id,
      name: list.name,
      icon: list.icon || '',
      wordIds: wordIds,
      source: 'data_js'
    });
  });
}

/* ══════════════════════════════════════════════════════
   MÓD VÁLTÁSA ÉS ZÁSZLÓK CSERÉJE
══════════════════════════════════════════════════════ */
function setMode(mode, isInit = false) {
  currentMode = mode;
  state = appData[currentMode];
  
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('mode-' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  // V13.1: a szűrők állapota a state-ben él (a pillák és menük abból renderelnek);
  // itt csak a keresőmezőt és a nyitott menüket / dokkot igazítjuk az új módhoz
  closeLibraryOverlays();
  _tagQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = state.filters.search || '';
  validateDayFilter();

  if (!isInit) {
    saveSettings(); // Módváltás csak beállítást érint
    renderDashboard();
    // V13: a módváltó a globális fejlécben van → az éppen látható képernyőt is frissítjük
    const active = document.body.dataset.screen;
    if (active === 'home')    renderHome();
    if (active === 'stats')   renderStats();
    if (active === 'profile') renderProfile();
  }
}

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

/* ══════════════════════════════════════════════════════
   STREAK, ACTIVITY ÉS KÜLDETÉSEK
══════════════════════════════════════════════════════ */
// V13: HELYI dátum kulcs (YYYY-MM-DD). A korábbi toISOString() UTC-t adott, így
// éjfél és hajnali 1-2 között a tanulás még az előző napra íródott (sorozat, "mai szavak").
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayKey() { return dateKey(new Date()); }

function calcStreak() {
  const studyDays = state.globalStats.studyDays || {};
  let streak = 0;
  const checkDate = new Date();
  if (!studyDays[dateKey(checkDate)]) checkDate.setDate(checkDate.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = dateKey(checkDate);
    if (studyDays[key]) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else break;
  }
  return streak;
}

function getWeekDays() {
  const studyDays = state.globalStats.studyDays || {};
  const today = new Date();
  const todayStr = dateKey(today);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  const labels = ['H','K','Sz','Cs','P','Szo','V'];
  return labels.map((label, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    return { label, studied: !!studyDays[key], isToday: key === todayStr };
  });
}

/* ══════════════════════════════════════════════════════
   V8: DAILY QUEST ENGINE 2.0
══════════════════════════════════════════════════════ */

// V13.2: egyszínű vonalikonok (a korábbi emojik és küldetésenkénti színek helyett)
const QUEST_ICONS = {
  LearnWords     : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg>`,
  PerfectRound   : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16 9.5"/></svg>`,
  PracticeTime   : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`,
  GhostHunter    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 4 3 10 9 10"/><path d="M3.5 15a9 9 0 1 0 2-9.4L3 10"/></svg>`,
  StrictPerfect  : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
  Speed5in30     : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/></svg>`,
  TagMaster      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>`,
  MistakeCleanup : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`,
  DailyWord      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  Combo5         : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>`,
  KanaMaster     : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17.5" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">あ</text></svg>`,
  KanjiMaster    : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17.5" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">字</text></svg>`
};
const QUEST_DONE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function generateDailyQuests() {
  const words = state.words;
  const today = todayKey();
  const mode = currentMode;
  const pool = [];

  // 1. LearnWords
  const lwTarget = shuffle([5, 10, 15, 20])[0];
  pool.push({ type: 'LearnWords', target: lwTarget, progress: 0, completed: false,
    label: `Gyakorolj ${lwTarget} szót`, params: {} });

  // 2. PerfectRound
  pool.push({ type: 'PerfectRound', target: 1, progress: 0, completed: false,
    label: 'Csinálj egy hibátlan kört', params: {} });

  // 3. PracticeTime
  const ptMin = shuffle([5, 10, 15])[0];
  pool.push({ type: 'PracticeTime', target: ptMin * 60, progress: 0, completed: false,
    label: `Gyakorolj ${ptMin} percet`, params: {} });

  // 4. GhostHunter – szavak amiket 7+ napja nem láttál
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const ghostWords = words.filter(w => !w.stats.lastAttempt || w.stats.lastAttempt < sevenDaysAgo);
  if (ghostWords.length >= 3) {
    const ghostTarget = Math.min(5, ghostWords.length);
    pool.push({ type: 'GhostHunter', target: ghostTarget, progress: 0, completed: false,
      label: `Ismételj át ${ghostTarget} régen látott szót`, params: { ghostIds: ghostWords.map(w => w.id) } });
  }

  // 5. StrictPerfect – 10+ szavas hibátlan kör
  if (words.length >= 10) {
    pool.push({ type: 'StrictPerfect', target: 1, progress: 0, completed: false,
      label: 'Teljesíts hibátlanul egy 10+ szavas kört', params: {} });
  }

  // 6. Speed5in30 – 5 helyes válasz 30 mp alatt
  pool.push({ type: 'Speed5in30', target: 5, progress: 0, completed: false,
    label: '5 helyes válasz 30 mp alatt', params: { windowStart: null } });

  // 7. TagMaster – véletlen tag, legalább 5 szóval
  const tagMap = {};
  words.forEach(w => w.tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const validTags = Object.entries(tagMap).filter(([, c]) => c >= 5);
  if (validTags.length > 0) {
    const [chosenTag, tagCount] = shuffle(validTags)[0];
    const tagTarget = Math.min(10, tagCount);
    pool.push({ type: 'TagMaster', target: tagTarget, progress: 0, completed: false,
      label: `Tematikus nap: "${chosenTag}"`, params: { tag: chosenTag } });
  }

  // 8. MistakeCleanup – legtöbb hibás szavak
  const topWrong = [...words]
    .filter(w => w.stats.totalWrong > 0)
    .sort((a, b) => b.stats.totalWrong - a.stats.totalWrong)
    .slice(0, 5);
  if (topWrong.length >= 3) {
    pool.push({ type: 'MistakeCleanup', target: topWrong.length, progress: 0, completed: false,
      label: `Javítsd a ${topWrong.length} legtöbb hibás szót`, params: { wordIds: topWrong.map(w => w.id) } });
  }

  // 9. DailyWord – nap szava (ID alapján mentve, nem index)
  if (words.length > 0) {
    const dateHash = parseInt(today.replace(/-/g, '')) % words.length;
    const dw = words[dateHash];
    pool.push({ type: 'DailyWord', target: 1, progress: 0, completed: false,
      label: `Nap szava: "${dw.en}"`, params: { wordId: dw.id, wordEn: dw.en, wordHu: dw.hu } });
  }

  // 10. Combo5 – 5 helyes egymás után
  pool.push({ type: 'Combo5', target: 5, progress: 0, completed: false,
    label: '5 helyes válasz egymás után', params: {} });

  // 11. Módspecifikus
  if (mode === 'japanese') {
    pool.push({ type: 'KanaMaster', target: 10, progress: 0, completed: false,
      label: 'Gyakorolj 10 kana szót', params: {} });
  }
  if (mode === 'kanji') {
    pool.push({ type: 'KanjiMaster', target: 10, progress: 0, completed: false,
      label: 'Gyakorolj 10 kandzsit', params: {} });
  }

  // 3 véletlenszerű küldetés kiválasztása
  const picked = shuffle(pool).slice(0, 3);
  picked.forEach((q, i) => { q.id = 'q' + i; });

  return { date: today, list: picked };
}

function checkDailyReset() {
  const today = todayKey();
  // Régi formátum migrálása
  const isOldFormat = !state.dailyQuests.list;
  if (isOldFormat || state.dailyQuests.date !== today) {
    state.dailyQuests = generateDailyQuests();
    saveStats(); // Napi reset csak statot érint
  }
}

/* ══════════════════════════════════════════════════════
   V8: EVENT BUS – updateQuestProgress
   Hívva minden helyes/hibás válasznál és kör végén.
══════════════════════════════════════════════════════ */
function updateQuestProgress(eventType, data) {
  if (eventType === 'wordAnswered') logActivity({ correct: !!data.isCorrect }); // V13.2: napi napló
  const q = state.dailyQuests;
  if (!q || !q.list) return;
  let changed = false;

  q.list.forEach(quest => {
    if (quest.completed) return;
    const prev = quest.progress;

    if (eventType === 'wordAnswered') {
      const { word, isCorrect } = data;

      if (!isCorrect) {
        // Hibás válasz: combo és speed ablak reset
        if (quest.type === 'Combo5') { state.practice._combo = 0; }
        if (quest.type === 'Speed5in30') { quest.params.windowStart = null; quest.progress = 0; }
      } else {
        // Helyes válasz
        if (quest.type === 'LearnWords') quest.progress++;
        if (quest.type === 'KanaMaster' && currentMode === 'japanese') quest.progress++;
        if (quest.type === 'KanjiMaster' && currentMode === 'kanji') quest.progress++;

        if (quest.type === 'GhostHunter' && quest.params.ghostIds && quest.params.ghostIds.includes(word.id))
          quest.progress++;

        if (quest.type === 'TagMaster' && word.tags &&
            word.tags.map(t => t.toLowerCase()).includes(quest.params.tag.toLowerCase()))
          quest.progress++;

        if (quest.type === 'MistakeCleanup' && quest.params.wordIds && quest.params.wordIds.includes(word.id))
          quest.progress++;

        if (quest.type === 'DailyWord' && word.id === quest.params.wordId)
          quest.progress = 1;

        if (quest.type === 'Combo5') {
          state.practice._combo = (state.practice._combo || 0) + 1;
          quest.progress = Math.max(quest.progress, state.practice._combo);
        }

        if (quest.type === 'Speed5in30') {
          const now = Date.now();
          if (!quest.params.windowStart) {
            quest.params.windowStart = now;
            quest.progress = 1;
          } else if (now - quest.params.windowStart <= 30000) {
            quest.progress++;
          } else {
            // 30 mp lejárt, új ablak
            quest.params.windowStart = now;
            quest.progress = 1;
          }
        }
      }
    }

    if (eventType === 'roundEnd') {
      const { roundCorrect, roundWrong, roundLength, elapsed } = data;

      if (quest.type === 'PerfectRound' && roundWrong === 0 && roundLength > 0)
        quest.progress = 1;

      if (quest.type === 'StrictPerfect' && roundWrong === 0 && roundLength >= 10)
        quest.progress = 1;

      if (quest.type === 'PracticeTime')
        quest.progress = Math.min(quest.target, (quest.progress || 0) + elapsed);
    }

    // Teljesítve?
    if (!quest.completed && quest.progress >= quest.target) {
      quest.completed = true;
    }

    if (quest.progress !== prev) changed = true;
  });

  if (changed) {
    saveStats(); // Küldetés haladás csak statot érint
    renderDailyQuests();
  }
}

/* ══════════════════════════════════════════════════════
   V8: QUEST UI RENDERER
══════════════════════════════════════════════════════ */
function renderDailyQuests() {
  checkDailyReset();
  const cont = document.getElementById('daily-quests-container');
  if (!cont) return;
  const q = state.dailyQuests;
  if (!q || !q.list || q.list.length === 0) return;

  cont.innerHTML = q.list.map(quest => {
    const icon = QUEST_ICONS[quest.type] || QUEST_ICONS.TagMaster;
    const done = quest.completed;
    // V13.2: felnőtt nevezéktan – a már elmentett (régi) címkét is az új szöveg váltja
    const label = quest.type === 'GhostHunter' ? `Ismételj át ${quest.target} régen látott szót` : escHtml(quest.label);
    const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));

    let progressText;
    if (quest.type === 'PracticeTime') {
      const doneMins = Math.floor(Math.min(quest.progress, quest.target) / 60);
      const totalMins = quest.target / 60;
      progressText = `${doneMins}/${totalMins} perc`;
    } else {
      progressText = `${Math.min(quest.progress, quest.target)}/${quest.target}`;
    }

    // DailyWord extra info
    const extraBadge = quest.type === 'DailyWord' && !done
      ? `<span class="quest-daily-word">${escHtml(quest.params.wordEn)} = ${escHtml(quest.params.wordHu)}</span>`
      : '';

    // TagMaster badge (V13: színe a --q változóból, így sötét módban sem világít pasztellként)
    const tagBadge = quest.type === 'TagMaster' && !done
      ? `<span class="quest-tag-badge">${escHtml(quest.params.tag)}</span>`
      : '';

    // V13.2: minden feladat egy színben (a haladás színe), nincs szivárvány
    return `
      <div class="quest-item ${done ? 'completed' : ''}" style="--q:var(--primary-h)">
        <span class="quest-icon" aria-hidden="true">${done ? QUEST_DONE_ICON : icon}</span>
        <div class="quest-body">
          <div class="quest-info">
            <span class="quest-title">${label}</span>
            <span class="quest-prog">${done ? 'Kész' : progressText}</span>
          </div>
          ${extraBadge}${tagBadge}
          <div class="quest-bar-bg">
            <div class="quest-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   SCREEN MANAGEMENT & DASHBOARD
══════════════════════════════════════════════════════ */
const SCREENS = {
  home: 'screen-home', dashboard: 'screen-dashboard', practice: 'screen-practice',
  roundend: 'screen-round-end', stats: 'screen-stats', profile: 'screen-profile'
};

function showScreen(name) {
  const key = SCREENS[name] ? name : 'home';
  closeLibraryOverlays();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(SCREENS[key]);
  if (target) target.classList.add('active');

  // A body data-screen attribútuma vezérli a fejléc / alsó navigáció láthatóságát (CSS)
  document.body.dataset.screen = key;
  const navItems = [...document.querySelectorAll('.bottom-nav [data-screen]')];
  navItems.forEach(btn => {
    const isActive = btn.dataset.screen === key;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });
  // A navigáció üveg "lencséje" az aktív elem mögé csúszik
  const navIndex = navItems.findIndex(btn => btn.dataset.screen === key);
  const nav = document.getElementById('bottom-nav');
  if (nav && navIndex >= 0) nav.style.setProperty('--nav-i', navIndex);
  window.scrollTo(0, 0);

  if (key === 'home') renderHome();
  if (key === 'dashboard') renderDashboard();
  if (key === 'stats') renderStats();
  if (key === 'profile') renderProfile();
}

/* ══════════════════════════════════════════════════════
   V13.1: GYAKORLÁS FÜL
   - Keresés + lenyíló szűrő pillák (Lecke, Úti terv, Témakör, Szint, Lista)
   - Lapozva renderelt szólista: nincs belső görgetősáv, és nem kerül egyszerre
     több ezer sor a DOM-ba (görgetéskor töltődik a következő adag)
   - Gyakorlás dokk: mobilon lebegő üveg sáv felfelé nyíló beállításokkal,
     asztalon ragadós oldalpanel. A típus / kérdésszám / sorrend módonként mentődik.
══════════════════════════════════════════════════════ */
function renderDashboard() {
  renderFilterBar();
  applyFilters();
  renderPracticeDock();
}

// V13: a heti sáv a Kezdőlapra költözött (V13.2: pipa ikon, emoji / szimbólum helyett)
const WEEK_CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
function renderWeekTracker() {
  const weekTracker = document.getElementById('week-tracker');
  if (!weekTracker) return;
  weekTracker.innerHTML = getWeekDays().map(d => {
    let cls, icon;
    if (d.isToday && d.studied)  { cls='today-studied'; icon=WEEK_CHECK_ICON; }
    else if (d.isToday)          { cls='today-not';     icon=''; }
    else if (d.studied)          { cls='studied';       icon=WEEK_CHECK_ICON; }
    else                         { cls='not-studied';   icon=''; }
    return `<div class="week-day"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}">${icon}</div></div>`;
  }).join('');
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

/* ── Ikonok és segédek a menükhöz ── */
const UI_ICONS = {
  chevron: '<svg class="pill-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  check:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  plus:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash:   '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  star:    '<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  search:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
};

// Érték biztonságos átadása inline onclick-nek (idézőjelek, aposztrófok is)
const jsArg = v => escHtml(JSON.stringify(v));

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

/* ── Szűrő pillák ── */
function renderFilterBar() {
  const bar = document.getElementById('filter-pills');
  if (!bar) return;
  validateDayFilter();
  const f = state.filters;
  const pills = [];
  if (getLessonOptions().length > 0) pills.push(['lesson', f.lesson !== 'all' ? lessonLabel(f.lesson) : 'Lecke', f.lesson !== 'all']);
  if (getDayOptions().length > 0) pills.push(['day', f.day !== 'all' ? `Úti terv: ${f.day}. nap` : 'Úti terv', f.day !== 'all']);
  pills.push(['tags', f.tags.length === 0 ? 'Témakör' : f.tags.length === 1 ? f.tags[0] : `${f.tags.length} témakör`, f.tags.length > 0]);
  pills.push(['diff', f.diff.size > 0 ? [...f.diff].sort((a, b) => diffOrder(a) - diffOrder(b)).join(' · ') : 'Szint', f.diff.size > 0]);
  pills.push(['list', listLabel(f.list), !!f.list && f.list !== 'all']);

  bar.innerHTML = pills.map(([key, label, active]) => `
    <button class="pill ${active ? 'is-active' : ''}" data-menu="${key}" aria-haspopup="true" aria-expanded="${_openMenu === key}" onclick="toggleFilterMenu('${key}')">
      <span class="pill-label">${escHtml(label)}</span>${UI_ICONS.chevron}
    </button>`).join('') +
    (hasPoolFilters() ? `<button class="pill pill-clear" onclick="clearFilters()">Szűrők törlése</button>` : '');

  const sortLabel = document.getElementById('sort-label');
  if (sortLabel) sortLabel.textContent = (SORT_OPTIONS.find(([v]) => v === f.sort) || SORT_OPTIONS[0])[1];
}

// Csillag, lista-mentés stb. után: pillák + nyitott menü frissítése
function refreshLibraryChrome() {
  renderFilterBar();
  if (_openMenu) renderFilterMenu();
}

function onFiltersChanged({ close = false } = {}) {
  renderFilterBar();
  applyFilters();
  if (close) closeFilterMenu(); else renderFilterMenu();
}

/* ── Lenyíló menük ──
   Egyetlen #filter-menu konténer, a nyitó gomb alá pozicionálva. A pillák a scrim
   fölött maradnak, így egy koppintással át lehet váltani egy másik menüre. */
let _openMenu = null;
let _tagQuery = '';

function toggleFilterMenu(key) {
  if (_openMenu === key) { closeFilterMenu(); return; }
  const fromKeyboard = !!document.activeElement?.matches?.(':focus-visible');
  toggleDockSettings(false);
  const menu = document.getElementById('filter-menu');
  if (menu) menu.innerHTML = ''; // új menü: görgetés a tetejéről
  _openMenu = key;
  renderFilterMenu();
  setScrim(true);
  // Billentyűzettel nyitva a fókusz a kiválasztott (vagy első) opcióra ugrik
  if (fromKeyboard && menu) (menu.querySelector('.is-selected') || menu.querySelector('button, input'))?.focus();
}

function closeFilterMenu() {
  if (!_openMenu) return;
  const key = _openMenu;
  const menu = document.getElementById('filter-menu');
  const hadFocus = !!(menu && menu.contains(document.activeElement));
  _openMenu = null;
  if (menu) { menu.hidden = true; menu.innerHTML = ''; }
  syncMenuTriggers();
  if (!_dockOpen) setScrim(false);
  // Billentyűzettel használva a fókusz visszakerül a nyitó gombra
  if (hadFocus) document.querySelector(`[data-menu="${key}"]`)?.focus();
}

function syncMenuTriggers() {
  document.querySelectorAll('[data-menu]').forEach(b => b.setAttribute('aria-expanded', b.dataset.menu === _openMenu ? 'true' : 'false'));
}

function renderFilterMenu() {
  const menu = document.getElementById('filter-menu');
  if (!menu || !_openMenu) return;
  const builders = { lesson: lessonMenuHtml, day: dayMenuHtml, tags: tagsMenuHtml, diff: diffMenuHtml, list: listMenuHtml, sort: sortMenuHtml };
  const prevScroll = menu.querySelector('.menu-body')?.scrollTop || 0;
  menu.innerHTML = builders[_openMenu]();
  menu.hidden = false;
  const body = menu.querySelector('.menu-body');
  if (body) body.scrollTop = prevScroll;
  syncMenuTriggers();
  positionFilterMenu();
}

// A menü a nyitó gomb alá kerül, és nem lóghat a lebegő dokk / navigáció alá
function positionFilterMenu() {
  const menu = document.getElementById('filter-menu');
  const host = document.getElementById('lib-main');
  const trigger = document.querySelector(`[data-menu="${_openMenu}"]`);
  if (!menu || !host || !trigger) return;
  const triggerBottom = trigger.getBoundingClientRect().bottom;
  menu.style.top = (triggerBottom - host.getBoundingClientRect().top + 8) + 'px';
  const floorEls = ['bottom-nav', 'practice-dock']
    .map(id => document.getElementById(id))
    .filter(el => el && getComputedStyle(el).position === 'fixed' && el.getClientRects().length > 0); // fixed elemnél az offsetParent mindig null
  const floor = Math.min(window.innerHeight, ...floorEls.map(el => el.getBoundingClientRect().top)) - 12;
  menu.style.maxHeight = Math.max(260, floor - triggerBottom - 8) + 'px';
}

function menuShell(title, meta, body, foot = '') {
  return `
    <div class="menu-head"><span class="menu-title">${title}</span>${meta ? `<span class="menu-meta">${meta}</span>` : ''}</div>
    <div class="menu-body">${body}</div>
    ${foot ? `<div class="menu-foot">${foot}</div>` : ''}`;
}

function menuOption({ selected, label, meta = '', action, extra = '' }) {
  return `
    <div class="menu-row">
      <button class="menu-opt ${selected ? 'is-selected' : ''}" role="option" aria-selected="${selected}" onclick="${action}">
        <span class="menu-check">${selected ? UI_ICONS.check : ''}</span>
        <span class="menu-opt-label">${label}</span>
        ${meta !== '' ? `<span class="menu-opt-meta">${meta}</span>` : ''}
      </button>${extra}
    </div>`;
}

function menuIconBtn(action, label, icon, disabled = false) {
  return `<button class="menu-icon-btn" onclick="${action}" aria-label="${escHtml(label)}" title="${escHtml(label)}" ${disabled ? 'disabled' : ''}>${icon}</button>`;
}

function lessonMenuHtml() {
  const f = state.filters;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const opts = getLessonOptions();
  const rows = menuOption({ selected: f.lesson === 'all', label: 'Minden lecke', action: `setLessonFilter('all')` }) +
    opts.map(o => menuOption({
      selected: String(f.lesson) === o.value,
      label: escHtml(lessonLabel(o.value)),
      meta: o.fresh > 0 ? `${o.total} ${unit} · <b>${o.fresh} új</b>` : `${o.total} ${unit}`,
      action: `setLessonFilter(${jsArg(o.value)})`
    })).join('');
  return menuShell('Lecke', `${opts.length} lecke`, `<div role="listbox" aria-label="Lecke">${rows}</div>`);
}

function dayMenuHtml() {
  const f = state.filters;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const opts = getDayOptions();
  const rows = menuOption({ selected: f.day === 'all', label: 'Minden nap', action: `setDayFilter('all')` }) +
    opts.map(o => menuOption({ selected: String(f.day) === o.value, label: `${o.value}. nap`, meta: `${o.total} ${unit}`, action: `setDayFilter(${jsArg(o.value)})` })).join('');
  return menuShell('Úti terv', `${opts.length} nap`, `<div role="listbox" aria-label="Úti terv nap">${rows}</div>`);
}

function tagChipsHtml() {
  const counts = {};
  state.words.forEach(w => w.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const q = _tagQuery.toLowerCase().trim();
  const tags = Object.keys(counts).filter(t => !q || t.includes(q)).sort((a, b) => a.localeCompare(b, 'hu'));
  if (tags.length === 0) return '<p class="menu-empty">Nincs ilyen témakör.</p>';
  return tags.map(t => {
    const on = state.filters.tags.includes(t);
    return `<button class="chip ${on ? 'is-selected' : ''}" aria-pressed="${on}" onclick="toggleTag(${jsArg(t)})">${escHtml(t)}<span class="chip-count">${counts[t]}</span></button>`;
  }).join('');
}

function tagsMenuHtml() {
  const search = `
    <label class="menu-search">${UI_ICONS.search}
      <input id="tag-search" type="search" placeholder="Témakör keresése" autocomplete="off" value="${escHtml(_tagQuery)}" oninput="onTagSearch(this.value)" aria-label="Témakör keresése">
    </label>`;
  return menuShell('Témakör', 'Több is választható',
    search + `<div class="chip-grid" id="tag-chips">${tagChipsHtml()}</div>`,
    `<button class="menu-link" onclick="setTags([])">Összes törlése</button><button class="menu-done" onclick="closeFilterMenu()">Kész</button>`);
}

function onTagSearch(value) {
  _tagQuery = value;
  const chips = document.getElementById('tag-chips');
  if (chips) chips.innerHTML = tagChipsHtml();
}

// Témakör váltásnál csak a chipeket rajzoljuk újra, hogy a keresőmező fókusza megmaradjon
function toggleTag(tag) {
  const tags = state.filters.tags;
  const i = tags.indexOf(tag);
  if (i >= 0) tags.splice(i, 1); else tags.push(tag);
  renderFilterBar();
  applyFilters();
  onTagSearch(_tagQuery);
}

function setTags(list) {
  state.filters.tags = list;
  renderFilterBar();
  applyFilters();
  onTagSearch(_tagQuery);
}

function diffMenuHtml() {
  const levels = currentMode === 'english' ? ['B1', 'B2', 'C1', 'C2'] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  const counts = {};
  state.words.forEach(w => { counts[w.diff] = (counts[w.diff] || 0) + 1; });
  const chips = levels.map(d => {
    const on = state.filters.diff.has(d);
    return `<button class="chip chip-level ${on ? 'is-selected' : ''}" aria-pressed="${on}" onclick="toggleDiff('${d}')">${d}<span class="chip-count">${counts[d] || 0}</span></button>`;
  }).join('');
  return menuShell('Szint', currentMode === 'english' ? 'CEFR' : 'JLPT', `<div class="chip-grid">${chips}</div>`,
    `<button class="menu-link" onclick="clearDiff()">Összes törlése</button><button class="menu-done" onclick="closeFilterMenu()">Kész</button>`);
}

function toggleDiff(d) {
  const set = state.filters.diff;
  if (set.has(d)) set.delete(d); else set.add(d);
  onFiltersChanged();
}

function clearDiff() {
  state.filters.diff = new Set();
  onFiltersChanged();
}

function listMenuHtml() {
  const f = state.filters;
  const bmCount = getBookmarkedWords().length;
  const sel = state.selectedIds.size;
  const rows = [
    menuOption({ selected: !f.list || f.list === 'all', label: 'Minden szó', action: `setListFilter('all')` }),
    menuOption({
      selected: f.list === '__focus', label: 'Fókusz Lista', meta: bmCount, action: `setListFilter('__focus')`,
      extra: bmCount > 0 ? menuIconBtn('clearAllBookmarks()', 'Összes csillag törlése', UI_ICONS.trash) : ''
    })
  ];
  (state.playlists || []).forEach(p => {
    const fromFile = p.source === 'data_js';
    const extra = fromFile ? '' :
      menuIconBtn(`expandPlaylist(${jsArg(p.id)})`, sel > 0 ? `${sel} kijelölt szó hozzáadása` : 'Jelölj ki szavakat a bővítéshez', UI_ICONS.plus, sel === 0) +
      menuIconBtn(`deletePlaylist(${jsArg(p.id)})`, 'Lista törlése', UI_ICONS.trash);
    rows.push(menuOption({
      selected: f.list === p.id, label: `${fromFile && p.icon ? escHtml(p.icon) + ' ' : ''}${escHtml(p.name)}` /* saját (data.js) ikon megmarad */,
      meta: p.wordIds.length, action: `setListFilter(${jsArg(p.id)})`, extra
    }));
  });
  const foot = `
    <form class="menu-new-list" onsubmit="event.preventDefault(); savePlaylist();">
      <input id="playlist-name-input" type="text" maxlength="40" autocomplete="off" aria-label="Új lista neve"
        placeholder="${sel > 0 ? `${sel} kijelölt szó mentése új listaként` : 'Jelölj ki szavakat egy új listához'}" ${sel > 0 ? '' : 'disabled'}>
      <button type="submit" class="menu-done" ${sel > 0 ? '' : 'disabled'}>Mentés</button>
    </form>`;
  return menuShell('Lista', 'Szűrés listára', `<div role="listbox" aria-label="Lista">${rows.join('')}</div>`, foot);
}

function sortMenuHtml() {
  const rows = SORT_OPTIONS.map(([v, l]) => menuOption({ selected: state.filters.sort === v, label: l, action: `setSort('${v}')` })).join('');
  return menuShell('Rendezés', '', `<div role="listbox" aria-label="Rendezés">${rows}</div>`);
}

function setLessonFilter(v) { state.filters.lesson = v; onFiltersChanged({ close: true }); }
function setDayFilter(v)    { state.filters.day = v;    onFiltersChanged({ close: true }); }
function setListFilter(id)  { state.filters.list = id || 'all'; onFiltersChanged({ close: true }); }
function setSort(s)         { state.filters.sort = s;   onFiltersChanged({ close: true }); }

/* ── Scrim + közös bezárás (Esc, háttér koppintás, képernyőváltás) ── */
function setScrim(on) {
  const scrim = document.getElementById('lib-scrim');
  if (scrim) scrim.hidden = !on;
}

function closeLibraryOverlays() {
  closeFilterMenu();
  toggleDockSettings(false);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (_openMenu || _dockOpen)) closeLibraryOverlays();
});
window.addEventListener('resize', () => { if (_openMenu) positionFilterMenu(); });

/* ── Szólista (lapozva) ── */
let _filteredWords = [];
let _listShown = 0;
let _knownWordsForSentences = [];
const WORD_PAGE = 120;
const SENTENCE_PAGE = 25;

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) state.filters.search = searchInput.value.toLowerCase().trim();

  const filtered = state.words.filter(w => wordMatchesFilters(w));
  const sort = state.filters.sort;
  if      (sort === 'az')        filtered.sort((a,b) => a.en.localeCompare(b.en));
  else if (sort === 'za')        filtered.sort((a,b) => b.en.localeCompare(a.en));
  else if (sort === 'diff-asc')  filtered.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (sort === 'diff-desc') filtered.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));
  else if (sort === 'unlearned') filtered.sort((a,b) => a.stats.streak - b.stats.streak);
  else if (sort === 'mastered')  filtered.sort((a,b) => b.stats.streak - a.stats.streak);
  _filteredWords = filtered;

  const countLabel = document.getElementById('word-count-label');
  if (countLabel) countLabel.textContent = `${filtered.length.toLocaleString('hu-HU')} ${currentMode === 'kanji' ? 'kanji' : 'szó'}`;

  renderActiveList();
  updateSelectAllBtn();
  saveSettings(); // Szűrő változás csak beállítást érint
}

// Csak az aktív nézetet rendereljük (a mondatos nézet sok regexet futtat)
function renderActiveList() {
  const isSentences = state.activeViewTab === 'sentences';
  const wordView = document.getElementById('word-list-view');
  const sentView = document.getElementById('sentence-list-view');
  if (wordView) wordView.style.display = isSentences ? 'none' : '';
  if (sentView) sentView.style.display = isSentences ? '' : 'none';
  [['vtab-words', !isSentences], ['vtab-sentences', isSentences]].forEach(([id, on]) => {
    const tab = document.getElementById(id);
    if (tab) { tab.classList.toggle('active', on); tab.setAttribute('aria-selected', on ? 'true' : 'false'); }
  });

  const container = document.getElementById(isSentences ? 'sentence-list' : 'word-list');
  const other = document.getElementById(isSentences ? 'word-list' : 'sentence-list');
  if (other) other.innerHTML = '';
  if (!container) return;

  if (isSentences && currentMode !== 'english') {
    // Ismert japán szavak a kék kiemeléshez, hosszabbak elöl (hogy a hosszabbat találja meg előbb)
    _knownWordsForSentences = appData.japanese.words.concat(appData.kanji.words)
      .map(w => w.en).filter(Boolean).sort((a, b) => b.length - a.length);
  }

  _listShown = 0;
  if (_filteredWords.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        <p class="list-empty-title">Nincs találat.</p>
        <p class="list-empty-sub">${hasPoolFilters() || state.filters.search ? 'Próbálj más keresést, vagy töröld a szűrőket.' : 'Ebben a módban még nincs szó.'}</p>
        ${hasPoolFilters() ? '<button class="menu-link" onclick="clearFilters()">Szűrők törlése</button>' : ''}
      </div>`;
    return;
  }
  container.innerHTML = '';
  appendListPage();
}

function appendListPage() {
  const isSentences = state.activeViewTab === 'sentences';
  const container = document.getElementById(isSentences ? 'sentence-list' : 'word-list');
  if (!container || _listShown >= _filteredWords.length) return;
  const page = _filteredWords.slice(_listShown, _listShown + (isSentences ? SENTENCE_PAGE : WORD_PAGE));
  container.insertAdjacentHTML('beforeend', page.map(isSentences ? sentenceCardHtml : wordRowHtml).join(''));
  _listShown += page.length;
  requestAnimationFrame(fillListViewport);
}

// Ha a lista vége (a sentinel) a képernyő közelében van, töltünk rá egy adagot
function fillListViewport() {
  if (document.body.dataset.screen !== 'dashboard') return;
  const sentinel = document.getElementById('list-sentinel');
  if (sentinel && sentinel.getBoundingClientRect().top < window.innerHeight + 600) appendListPage();
}

function wordRowHtml(w) {
  const selected = state.selectedIds.has(w.id);
  const s = w.stats;
  const attempts = s.totalCorrect + s.totalWrong;
  const pct = attempts > 0 ? Math.round(s.totalCorrect / attempts * 100) : null;
  let sub = w.hu;
  if (currentMode === 'japanese' && w.romaji) sub = `${w.hu} · ${w.romaji}`;
  if (currentMode === 'kanji') sub = `${w.hu} · ${w.onyomi || '–'} / ${w.kunyomi || '–'}`;
  const starLabel = w.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához';
  return `
    <div class="word-row ${selected ? 'is-selected' : ''}" data-id="${escHtml(w.id)}">
      <button class="word-toggle" role="checkbox" aria-checked="${selected}">
        <span class="word-check" aria-hidden="true">${UI_ICONS.check}</span>
        <span class="word-main">
          <span class="word-src ${currentMode === 'kanji' ? 'is-kanji' : ''}">${escHtml(w.en)}</span>
          <span class="word-sub">${escHtml(sub)}</span>
        </span>
        <span class="word-meta">
          ${s.streak > 0 ? `<span class="word-stat" title="Egymás utáni helyes válaszok">${s.streak}×</span>` : ''}
          ${pct !== null ? `<span class="word-stat" title="Pontosság">${pct}%</span>` : ''}
          <span class="diff-pill d${escHtml(w.diff)}">${escHtml(w.diff)}</span>
        </span>
      </button>
      <button class="word-star ${w.bookmarked ? 'is-on' : ''}" aria-pressed="${!!w.bookmarked}" aria-label="${starLabel}" title="${starLabel}">${UI_ICONS.star}</button>
    </div>`;
}

/* ══════════════════════════════════════════════════════
   OKOS MONDAT SZÍNEZŐ (V6.7) – kártyánként, lapozva
   Zöld: a szó maga · Kék: más, a szótárban már szereplő szó
══════════════════════════════════════════════════════ */
function sentenceCardHtml(w) {
  const bottom = `
    <div class="sent-bottom">
      <span class="sent-hu">${escHtml(w.hu)}</span>
      <span class="sent-tags"><span class="diff-pill d${escHtml(w.diff)}">${escHtml(w.diff)}</span>${escHtml(w.tags.join(', '))}</span>
    </div>`;
  const head = count => `<header class="sent-head"><span class="sent-word">${escHtml(w.en)}</span><span class="sent-count">${count} mondat</span></header>`;
  const missing = `<p class="sent-missing">Nincs még példamondat ehhez a szóhoz.</p>`;

  if (currentMode === 'english') {
    const enSentences = typeof english_sentences2 !== 'undefined' ? english_sentences2.filter(s => s.baseWord === w.en) : [];
    if (enSentences.length === 0) {
      const own = w.sentence
        ? `<div class="sent-text">${escHtml(w.sentence).replace(new RegExp('\\b(' + escRegex(w.en) + ')\\b', 'gi'), m => `<span class="hl-main">${m}</span>`)}</div>`
        : missing;
      return `<article class="sent-card">${head(w.sentence ? 1 : 0)}${own}${bottom}</article>`;
    }
    const items = enSentences.map(s => `
      <div class="sent-item">
        <div class="sent-text">${s.fullSentenceHTML.replace(/<strong>(.*?)<\/strong>/g, '<span class="hl-main">$1</span>')}</div>
        <div class="sent-tr">${escHtml(s.hungarian)}</div>
      </div>`).join('');
    return `<article class="sent-card">${head(enSentences.length)}${items}${bottom}</article>`;
  }

  const sentences = typeof JAPANESE_SENTENCES !== 'undefined' ? JAPANESE_SENTENCES.filter(s => s.baseWord === w.en) : [];
  const romaji = w.romaji ? `<div class="sent-romaji">${escHtml(w.romaji)}</div>` : '';
  if (sentences.length === 0) return `<article class="sent-card">${head(0)}${romaji}${missing}${bottom}</article>`;

  const items = sentences.map(s => {
    let html = s.fullSentenceHTML;
    if (s.correctAnswer) {
      html = html.replace(new RegExp(`(${escRegex(s.correctAnswer)})`, 'g'), '<span class="hl-main">$1</span>');
    }
    _knownWordsForSentences.filter(kw => kw !== w.en && kw !== s.correctAnswer).forEach(knownWord => {
      if (html.includes(knownWord)) {
        html = html.replace(new RegExp(`(?![^<]*>)${escRegex(knownWord)}`, 'g'), `<span class="hl-known" title="Ismert szó a szótárból">${knownWord}</span>`);
      }
    });
    return `
      <div class="sent-item">
        <div class="sent-text">${html}</div>
        <div class="sent-tr">${escHtml(s.hungarian)}</div>
      </div>`;
  }).join('');
  return `<article class="sent-card">${head(sentences.length)}${romaji}${items}${bottom}</article>`;
}

function switchViewTab(tab) {
  state.activeViewTab = tab;
  renderActiveList();
}

/* ── Kijelölés ── */
function setRowSelected(row, on) {
  row.classList.toggle('is-selected', on);
  const toggle = row.querySelector('.word-toggle');
  if (toggle) toggle.setAttribute('aria-checked', on ? 'true' : 'false');
}

function toggleWordSelection(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
  const row = document.querySelector(`.word-row[data-id="${CSS.escape(id)}"]`);
  if (row) setRowSelected(row, state.selectedIds.has(id));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
}

function allFilteredSelected() {
  return _filteredWords.length > 0 && _filteredWords.every(w => state.selectedIds.has(w.id));
}

// "Mind kijelölése" az ÖSSZES szűrt szót kijelöli (nem csak a már kirajzolt sorokat)
function toggleSelectAll() {
  if (allFilteredSelected()) { selectNone(); return; }
  _filteredWords.forEach(w => state.selectedIds.add(w.id));
  document.querySelectorAll('.word-row').forEach(row => setRowSelected(row, true));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
  showToast(`${_filteredWords.length} szó kijelölve`);
}

function selectNone() {
  state.selectedIds.clear();
  document.querySelectorAll('.word-row.is-selected').forEach(row => setRowSelected(row, false));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
}

function updateSelectAllBtn() {
  const btn = document.getElementById('select-all-btn');
  if (!btn) return;
  btn.textContent = allFilteredSelected() ? 'Kijelölés törlése' : 'Mind kijelölése';
  btn.disabled = _filteredWords.length === 0;
}

function updateStartPanel() {
  const cnt = state.selectedIds.size;
  const big = document.getElementById('selected-count-big');
  const startBtn = document.getElementById('start-btn');
  const clearBtn = document.getElementById('dock-clear');
  if (big) big.textContent = cnt.toLocaleString('hu-HU');
  if (startBtn) startBtn.disabled = cnt === 0;
  if (clearBtn) clearBtn.hidden = cnt === 0;
  if (_openMenu === 'list') renderFilterMenu(); // a "mentés új listaként" a kijelöléstől függ
}

// Eseménykezelés delegálva: a sorok újrarajzolása után sem kell újra feliratkozni,
// és az aposztrófos szavak (pl. "don't") sem törik el az inline onclick-et.
function initLibraryEvents() {
  const list = document.getElementById('word-list');
  if (list) {
    list.addEventListener('click', e => {
      const row = e.target.closest('.word-row');
      if (!row) return;
      if (e.target.closest('.word-star')) toggleBookmark(row.dataset.id);
      else if (e.target.closest('.word-toggle')) toggleWordSelection(row.dataset.id);
    });
  }
  // Lapozás görgetésre: képkockánként legfeljebb egyszer nézzük meg, látszik-e a lista vége
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; fillListViewport(); });
  }, { passive: true });
}
initLibraryEvents();

/* ══════════════════════════════════════════════════════
   SAJÁT LISTÁK (a "Lista" lenyíló menüből kezelve)
══════════════════════════════════════════════════════ */
function savePlaylist() {
  const input = document.getElementById('playlist-name-input');
  const name = input ? input.value.trim() : '';
  if (state.selectedIds.size === 0) { showToast('Először jelölj ki szavakat!'); return; }
  if (!name) { showToast('Adj nevet a listának!'); if (input) input.focus(); return; }
  if (!state.playlists) state.playlists = [];
  if (state.playlists.some(p => p.name.toLowerCase() === name.toLowerCase())) { showToast('Már létezik ilyen nevű lista!'); return; }

  state.playlists.push({ id: 'pl_' + Date.now(), name: name, wordIds: Array.from(state.selectedIds) });
  savePlaylists();
  renderFilterMenu();
  showToast('Lista elmentve: ' + name);
}

function deletePlaylist(id) {
  if (!confirm('Biztosan törlöd ezt a listát?')) return;
  if (state.filters.list === id) state.filters.list = 'all';
  state.playlists = state.playlists.filter(p => p.id !== id);
  savePlaylists();
  onFiltersChanged();
}

/* ══════════════════════════════════════════════════════
   GYAKORLÁS DOKK (típus, irány, kérdésszám, sorrend)
══════════════════════════════════════════════════════ */
const PRACTICE_TYPES = [
  { value: 'classic',      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>', name: 'Klasszikus',        desc: '4 válaszból választasz' },
  { value: 'hardcore',     icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>', name: 'Gépelős',           desc: 'Beírod a választ' },
  { value: 'sentenceFill', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h7M15 12h5M4 18h16"/></svg>', name: 'Mondat-kiegészítő', desc: 'A szó a példamondatban' },
  { value: 'flashcard3d',  icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17"/></svg>', name: '3D kártya',         desc: 'Fordítsd meg, húzd el' }
];
const PRACTICE_COUNTS = [10, 20, 30, 50, 'all'];
const PRACTICE_ORDERS = [['random', 'Véletlen'], ['az', 'A → Z'], ['za', 'Z → A'], ['diff-asc', 'Könnyebb elöl'], ['diff-desc', 'Nehezebb elöl']];
const DIRECTION_LABELS = {
  english:  ['Angol → magyar', 'Magyar → angol'],
  japanese: ['Kana → magyar',  'Magyar → kana'],
  kanji:    ['Kanji → magyar', 'Magyar → kanji']
};

function getPracticeOptions() {
  if (!state.practiceOptions) state.practiceOptions = { ...createEmptyState().practiceOptions };
  return state.practiceOptions;
}

function renderPracticeDock() {
  const box = document.getElementById('dock-settings');
  if (!box) return;
  const o = getPracticeOptions();
  const dirLabels = DIRECTION_LABELS[currentMode];
  const radio = (on, attrs, label, cls = '') => `<button role="radio" aria-checked="${on}" class="${cls} ${on ? 'active is-selected' : ''}" ${attrs}>${label}</button>`;

  box.innerHTML = `
    <div class="dock-group">
      <span class="dock-label" id="dock-type-label">Gyakorlás típusa</span>
      <div class="type-list" role="radiogroup" aria-labelledby="dock-type-label">
        ${PRACTICE_TYPES.map(t => radio(o.type === t.value, `onclick="setPracticeOption('type', '${t.value}')"`,
          `<span class="type-ico" aria-hidden="true">${t.icon}</span><span class="type-text"><b>${t.name}</b><small>${t.desc}</small></span>`, 'type-opt')).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-dir-label">Irány</span>
      <div class="segmented" role="radiogroup" aria-labelledby="dock-dir-label">
        ${['en-hu', 'hu-en'].map((d, i) => radio(state.direction === d, `onclick="setDirection('${d}')"`, dirLabels[i])).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-count-label">Kérdések száma</span>
      <div class="segmented" role="radiogroup" aria-labelledby="dock-count-label">
        ${PRACTICE_COUNTS.map(c => radio(o.count === c, `onclick="setPracticeOption('count', ${c === 'all' ? `'all'` : c})"`, c === 'all' ? 'Mind' : c)).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-order-label">Sorrend</span>
      <div class="chip-grid chip-grid-flat" role="radiogroup" aria-labelledby="dock-order-label">
        ${PRACTICE_ORDERS.map(([v, l]) => radio(o.order === v, `onclick="setPracticeOption('order', '${v}')"`, l, 'chip')).join('')}
      </div>
    </div>`;

  const type = PRACTICE_TYPES.find(t => t.value === o.type) || PRACTICE_TYPES[0];
  const summary = document.getElementById('dock-summary');
  if (summary) summary.textContent = `${type.name} · ${o.count === 'all' ? 'mind' : o.count}`;
  updateStartPanel();
}

function setPracticeOption(key, value) {
  getPracticeOptions()[key] = value;
  renderPracticeDock();
  saveSettings();
}

function setDirection(dir) {
  state.direction = dir;
  renderPracticeDock();
  saveSettings();
}

let _dockOpen = false;

function toggleDockSettings(force) {
  const next = typeof force === 'boolean' ? force : !_dockOpen;
  if (next === _dockOpen) return;
  _dockOpen = next;
  if (next) closeFilterMenu();
  const dock = document.getElementById('practice-dock');
  if (dock) dock.classList.toggle('is-open', next);
  const btn = document.getElementById('dock-settings-btn');
  if (btn) btn.setAttribute('aria-expanded', next ? 'true' : 'false');
  setScrim(next || !!_openMenu);
}

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC (V6.7: SZEM IKON + MONDAT MOTOR)
══════════════════════════════════════════════════════ */
let eyeState = 0; 

function startPractice() {
  const selectedWords = state.words.filter(w => state.selectedIds.has(w.id));
  if (selectedWords.length === 0) return;
  
  // V13.1: a beállítások a Gyakorlás dokkból (state.practiceOptions) jönnek
  closeLibraryOverlays();
  const o = getPracticeOptions();
  const qCount = o.count === 'all' ? selectedWords.length : Math.min(Number(o.count) || 20, selectedWords.length);
  const order = o.order || 'random';
  const type = o.type || 'classic';
  
  let orderedWords = [...selectedWords];

  if (type === 'sentenceFill') {
    // BUG #1 JAVÍTVA: Angol mód most már támogatott – english_sentences2-t használja
    const sentenceDB = currentMode === 'english' ? english_sentences2 : JAPANESE_SENTENCES;

    orderedWords = orderedWords.filter(w =>
      sentenceDB && sentenceDB.some(s => s.baseWord === w.en)
    );

    if (orderedWords.length === 0) {
      showToast('A kiválasztott szavakhoz még nem tartozik példamondat az adatbázisban!');
      return;
    }
  }

  if (order === 'random') orderedWords = shuffle(orderedWords);
  else if (order === 'az') orderedWords.sort((a,b) => a.en.localeCompare(b.en));
  else if (order === 'za') orderedWords.sort((a,b) => b.en.localeCompare(a.en));
  else if (order === 'diff-asc') orderedWords.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (order === 'diff-desc') orderedWords.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));

  state.practice = {
    roundNumber: 1, roundWords: orderedWords.slice(0, qCount).map(w => w.id),
    currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    type: type, currentSentenceObj: null, _combo: 0,
    flashcardHistory: []  // V11: vissza gomb-hoz – csak flashcard3d módban használt
  };

  if (selectedWords.length > 0) {
    const freq = {}; selectedWords.flatMap(w => w.tags).forEach(t => freq[t] = (freq[t]||0)+1);
    if(Object.keys(freq).length > 0) state.globalStats.lastStudiedTopic = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
  }
  showScreen('practice'); showQuestion();
}

/* ══════════════════════════════════════════════════════
   V9: OKOS HAMIS VÁLASZ GENERÁTOR (Smart Distractors)
   Prioritás: 1) Azonos témakör (tags) → 2) Azonos nehézség → 3) Véletlen
══════════════════════════════════════════════════════ */
function getSmartDistractors(targetWord, count, isEnHu) {
  const allWords = state.words.filter(w => w.id !== targetWord.id);
  const distractors = [];
  const usedIds = new Set();

  // 1. Elsődleges szűrés: azonos témakör/tag egyezés
  if (targetWord.tags && targetWord.tags.length > 0) {
    const targetTagsLower = targetWord.tags.map(t => t.toLowerCase());
    const sameTagPool = shuffle(allWords.filter(w =>
      w.tags && w.tags.some(t => targetTagsLower.includes(t.toLowerCase()))
    ));
    for (const w of sameTagPool) {
      if (distractors.length >= count) break;
      if (!usedIds.has(w.id)) {
        distractors.push(isEnHu ? w.hu : w.en);
        usedIds.add(w.id);
      }
    }
  }

  // 2. Másodlagos szűrés: azonos nehézségi szint (fallback)
  if (distractors.length < count) {
    const sameDiffPool = shuffle(allWords.filter(w => w.diff === targetWord.diff && !usedIds.has(w.id)));
    for (const w of sameDiffPool) {
      if (distractors.length >= count) break;
      distractors.push(isEnHu ? w.hu : w.en);
      usedIds.add(w.id);
    }
  }

  // 3. Végső védelem: teljesen véletlenszerű szótár
  if (distractors.length < count) {
    const randomPool = shuffle(allWords.filter(w => !usedIds.has(w.id)));
    for (const w of randomPool) {
      if (distractors.length >= count) break;
      distractors.push(isEnHu ? w.hu : w.en);
      usedIds.add(w.id);
    }
  }

  return distractors.slice(0, count);
}

function showQuestion() {
  const p = state.practice;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;

  // V13: a gyors ismétlésnél a hibás szavak a sor végére kerülnek, így a haladást
  // a helyesen megválaszolt EGYEDI szavakhoz mérjük, nem a (növekvő) sor hosszához.
  if (p.type === 'quickQuiz') updatePracticeTop('Mai szavak', p.roundCorrect, p.uniqueCount, p.roundWrong);
  else updatePracticeTop(`${p.roundNumber}. kör`, p.currentIdx, p.roundWords.length, p.roundWrong);

  const isEnHu = practiceDir() === 'en-hu';
  const isJapanMode = currentMode !== 'english';
  eyeState = 0; 

  const gbFlag = '<img src="https://flagcdn.com/w20/gb.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const huFlag = '<img src="https://flagcdn.com/w20/hu.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const jpFlag = '<img src="https://flagcdn.com/w20/jp.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const kjIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-bottom:2px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';

  let hintText = isEnHu ? `${gbFlag} ANGOL &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${gbFlag} ANGOL`;
  if (currentMode === 'japanese') hintText = isEnHu ? `${jpFlag} KANA &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${jpFlag} JAPÁN`;
  if (currentMode === 'kanji') hintText = isEnHu ? `${kjIcon} KANJI &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${kjIcon} KANJI`;

  const questionText = isEnHu ? word.en : word.hu;
  const correctText  = isEnHu ? word.hu : word.en;
  let contentHtml = '';

 if (p.type === 'sentenceFill') {
    hintText = `MONDAT-KIEGÉSZÍTŐ · ${isEnHu ? 'OLVASÁS' : 'ÍRÁS'}`;
    
    // 1. Dinamikusan kiválasztjuk, hogy angol vagy japán mondatokat használunk
    const sentencesDB = currentMode === 'english' ? english_sentences2 : JAPANESE_SENTENCES;
    
    // 2. Kikeressük az adott szóhoz tartozó mondatokat
    const matchingSentences = sentencesDB.filter(s => s.baseWord === word.en);
    
    // BIZTONSÁGI VONAL: Ha a szóhoz (még) nem generáltunk mondatot, 
    // átvált sima feleletválasztós módra, hogy ne fagyjon le az app!
    if (matchingSentences.length === 0) {
      console.warn("Nincs mondat ehhez a szóhoz: " + word.en);
      p.type = 'classic';
      // BUG #2 JAVÍTVA: return nélkül az sObj undefined lenne → crash
      showQuestion();
      return;
    }

    const sObj = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
    p.currentSentenceObj = sObj;

    const sentenceDisplay = sObj.sentenceWithBlank.replace('___BLANK___', `<span class="blank-space" id="blank-space">...</span>`);
    
    // V9: Okos hamis opciók – azonos témakör/nehézség alapján (!isEnHu: mondat kitöltésénél a forrás mezőt kell distraktornak)
    const fakeOptions = getSmartDistractors(word, 3, !isEnHu);
    const options = shuffle([isEnHu ? sObj.correctAnswer : word.hu, ...fakeOptions]);

    contentHtml = `
      <div class="q-word" style="font-size: 22px; margin-bottom:15px; line-height: 1.6;">${sentenceDisplay}</div>
      <div class="translation-container" style="margin-top: 15px; color: var(--text-2); font-size: 14px; display:flex; align-items:center; justify-content:center; gap: 8px;">
        
        <button class="eye-btn" onclick="toggleSentenceTranslation(this)" title="Magyar fordítás mutatása/elrejtése">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <span class="hidden-translation" style="display: none; font-style: italic;">
          ${escHtml(sObj.hungarian)}
        </span>
      </div>
      
      <div class="options-grid" style="margin-top: 25px;">
        ${options.map(opt => `<button class="opt-btn" onclick="checkSentenceAnswer(this, '${escHtml(opt)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" onclick="checkSentenceAnswer(null, null)">Nem tudom</button>
    `;
  }
  else if (p.type === 'classic' || p.type === 'quickQuiz') {
    if (p.type === 'quickQuiz') hintText = `GYORS ISMÉTLÉS · ${hintText}`;
    const options = shuffle([correctText, ...getSmartDistractors(word, 3, isEnHu)]);

    contentHtml = `
      <div class="q-word ${currentMode === 'kanji' && isEnHu ? 'kanji-display' : ''}">${escHtml(questionText)}</div>
      ${isJapanMode && isEnHu ? '<div id="reveal-text" class="reveal-text"></div>' : ''}
      <div class="q-tools">
        ${isJapanMode && isEnHu ? `
          <button class="eye-btn" onclick="toggleEye('${word.id}')" title="Olvasat felfedése" aria-label="Olvasat felfedése"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        ` : ''}
        <button class="speak-btn" id="speak-btn" onclick="speakQuestionWord()" aria-label="Kiejtés">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        </button>
      </div>
      <div class="options-grid">
        ${options.map(opt => `<button class="opt-btn" onclick="checkAnswer(this,'${escHtml(opt)}','${escHtml(correctText)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" onclick="checkAnswer(null,null,'${escHtml(correctText)}')">Nem tudom</button>
    `;
  }
  else if (p.type === 'flashcard3d') {
    /* ══ V11: 3D FLASHCARD MÓD ══════════════════════════ */
    hintText = `3D KÁRTYA`;
    _flashcard3DFlipped = false;
    _flashcard3DRated = false;

    // Előlap (forrás)
    const frontMain = isEnHu ? word.en : word.hu;
    let frontReading = '';
    if (isEnHu && currentMode === 'kanji') frontReading = `On: ${word.onyomi || '–'} | Kun: ${word.kunyomi || '–'}`;
    else if (isEnHu && currentMode === 'japanese' && word.romaji) frontReading = word.romaji;

    // Hátlap (cél)
    const backMain = isEnHu ? word.hu : word.en;
    let backReading = '';
    if (!isEnHu && currentMode === 'kanji') backReading = `On: ${word.onyomi || '–'} | Kun: ${word.kunyomi || '–'}`;
    else if (!isEnHu && currentMode === 'japanese' && word.romaji) backReading = word.romaji;

    // Példamondat (highlight + magyar)
    const { html: exampleSentenceHTML, hu: exampleHU } = getExampleSentence(word);

    const isKanjiFront = currentMode === 'kanji' && isEnHu;
    const isKanjiBack  = currentMode === 'kanji' && !isEnHu;

    contentHtml = `
      <div class="flashcard-3d" id="flashcard-3d">
        <div class="flashcard-3d-inner">
          <div class="flashcard-3d-front">
            <div class="fc-corner-hint">${isEnHu ? 'Forrás' : 'Magyar'}</div>
            <div class="fc-main ${isKanjiFront ? 'kanji-display' : ''}">${escHtml(frontMain)}</div>
            ${frontReading ? `<div class="fc-reading">${escHtml(frontReading)}</div>` : ''}
            <div class="fc-bottom-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 8"/><polyline points="21 3 21 8 16 8"/><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 16"/><polyline points="8 16 3 16 3 21"/></svg>
              Koppints vagy húzd el
            </div>
          </div>
          <div class="flashcard-3d-back">
            <div class="fc-corner-hint">${isEnHu ? 'Magyar' : 'Forrás'}</div>
            <div class="fc-main fc-main-back ${isKanjiBack ? 'kanji-display' : ''}">${escHtml(backMain)}</div>
            ${backReading ? `<div class="fc-reading">${escHtml(backReading)}</div>` : ''}
            ${exampleSentenceHTML ? `
              <div class="fc-example">
                <div class="fc-example-sentence">${exampleSentenceHTML}</div>
                ${exampleHU && exampleHU !== backMain && exampleHU !== frontMain ? `<div class="fc-example-hu">${escHtml(exampleHU)}</div>` : ''}
              </div>
            ` : '<div class="fc-no-example">— Nincs példamondat ehhez a szóhoz —</div>'}
          </div>
        </div>
      </div>

      <div class="flashcard-3d-nav">
        <button class="flashcard-back-btn" onclick="prevFlashcard3D()" ${p.currentIdx === 0 ? 'disabled' : ''} title="${p.currentIdx === 0 ? 'Ez az első kártya' : 'Előző kártya'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Előző
        </button>
        <button class="flashcard-speak-btn" onclick="speakFlashcard3D()" title="Kiejtés (előlap: szó, hátlap: példamondat forrásnyelven)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        </button>
        <div class="flashcard-3d-actions" id="flashcard-3d-actions">
          <button class="btn flashcard-rating flashcard-wrong" onclick="rateFlashcard3D(false)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Nem tudtam
          </button>
          <button class="btn flashcard-rating flashcard-correct" onclick="rateFlashcard3D(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Tudtam
          </button>
        </div>
      </div>
    `;
  }
  else {
    const placeholderText = isEnHu ? "Gépeld be magyarul..." : "Gépeld be japánul vagy romajival...";
    contentHtml = `
      <div class="q-word" style="margin-bottom:26px;">${escHtml(questionText)}</div>
      <div style="margin-bottom: 20px;"><input type="text" id="hardcore-input" class="search-input" placeholder="${placeholderText}" autocomplete="off" style="text-align:center; font-size:18px; padding: 14px; border-width: 3px;"></div>
      <button class="btn btn-primary btn-lg" style="width:100%; justify-content:center; margin-bottom: 10px;" onclick="checkHardcoreAnswer('${word.id}')">Ellenőrzés</button>
      <button class="dont-know" onclick="revealHardcoreAnswer('${word.id}')">Nem tudom</button>
      <div id="hardcore-feedback" style="margin-top: 16px; font-weight: 800; font-size: 16px; display:none;"></div>
    `;
  }

  const qArea = document.getElementById('question-area');
  if (qArea) {
    const bookmarkBtnHtml = `
      <button class="bookmark-btn ${word.bookmarked ? 'bookmarked' : ''}" id="bookmark-btn-${word.id}"
              onclick="event.stopPropagation(); toggleBookmark('${word.id}')"
              title="${word.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához'}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    `;

    qArea.innerHTML = `
      <div class="q-card" id="q-card">
        ${bookmarkBtnHtml}
        <div class="q-hint" style="display:flex; justify-content:center; align-items:center; margin-bottom:14px;">
          <span style="letter-spacing:0.1em; color:var(--text-3); font-weight:800; font-size:11px; text-transform:uppercase;">${hintText}</span>
          <span style="margin: 0 8px; color: var(--border);">|</span>
          <span class="diff-pill d${word.diff}" style="font-size:11px; padding:2px 8px;">${word.diff}</span>
        </div>
        ${contentHtml}
      </div>
      <!-- V13.2: hibás válasz után a Tovább a képernyő aljára rögzül, hüvelykujjal elérhető -->
      <div id="next-btn-container" class="next-bar" style="display: none;">
        <button class="next-btn" onclick="manualNextQuestion()">
          Tovább
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    `;
  }

  if (p.type === 'hardcore') {
    setTimeout(() => {
      const input = document.getElementById('hardcore-input');
      if(input) {
        input.focus();
        input.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') checkHardcoreAnswer(word.id);
        });
      }
    }, 100);
  }

  if ((p.type === 'classic' || p.type === 'quickQuiz') && isEnHu) {
    setTimeout(() => { speakWord(questionText, false); }, 300);
  }

  if (p.type === 'flashcard3d') {
    initFlashcard3DSwipe();
    if (isEnHu) setTimeout(() => { speakWord(questionText, false); }, 300);
  }
}
// A kérdés szavának felolvasása (állapotból, így az aposztrófos szavak sem törik el az onclick-et)
function speakQuestionWord() {
  const p = state.practice;
  const word = p && p.roundWords ? state.words.find(w => w.id === p.roundWords[p.currentIdx]) : null;
  if (!word) return;
  const isEnHu = practiceDir() === 'en-hu';
  speakWord(isEnHu ? word.en : word.hu, !isEnHu);
}

// Kézi továbbléptetés rontás után
function manualNextQuestion() {
  const p = state.practice;
  p.currentIdx++;
  if (p.currentIdx >= p.roundWords.length) showRoundEnd(); 
  else showQuestion();
}
// A 👁️ IKON LOGIKÁJA
function toggleSentenceTranslation(btnElement) {
  const translationSpan = btnElement.nextElementSibling;
  if (translationSpan.style.display === "none") {
    translationSpan.style.display = "inline";
    btnElement.style.opacity = "0.5";
  } else {
    translationSpan.style.display = "none";
    btnElement.style.opacity = "1";
  }
}

function checkSentenceAnswer(btn, chosen) {
  const p = state.practice; 
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  const sObj = p.currentSentenceObj;
  
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);

  checkDailyReset();

  const isEnHu = practiceDir() === 'en-hu';
  const correctOptionText = isEnHu ? sObj.correctAnswer : word.hu;
  const isCorrect = (chosen === correctOptionText);
  const qCard = document.getElementById('q-card');
  const blankSpace = document.getElementById('blank-space');

  if (isCorrect && btn) { 
    btn.classList.add('correct'); 
    if(qCard) qCard.classList.add('bounce'); 
    if(blankSpace) {
      blankSpace.classList.add('filled');
      blankSpace.innerHTML = isEnHu ? sObj.correctAnswer : word.hu;
    }
  } else {
    if (btn) btn.classList.add('wrong');
    document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correctOptionText) b.classList.add('correct'); });
    if(qCard) qCard.classList.add('shake');
    if(blankSpace) {
      blankSpace.style.borderBottomColor = 'var(--error)';
      blankSpace.style.color = 'var(--error)';
      blankSpace.innerHTML = isEnHu ? sObj.correctAnswer : word.hu;
    }
  }

  if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
  else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
  word.stats.lastAttempt = Date.now();
  updateQuestProgress('wordAnswered', { word, isCorrect });

  setTimeout(() => {
    if (isEnHu && sObj.fullSentenceHTML) {
      const sentenceContainer = document.querySelector('.q-word');
      if(sentenceContainer) {
        sentenceContainer.innerHTML = sObj.fullSentenceHTML;
        sentenceContainer.style.animation = 'popIn 0.3s';
      }
    }
    speakWord(sObj.ttsSentence, false);
  }, 100);

  if (isCorrect) {
    // V9: A mondat felolvasása fusson végig, utána lépünk tovább
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      _ttsOnEnd = null;
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    // A speakWord 100ms múlva indul → _ttsOnEnd-et ráhagyjuk, hogy az onend-et elkapja
    _ttsOnEnd = () => setTimeout(doAdvance, 400);
    setTimeout(doAdvance, 6000); // Biztonsági timeout (hosszú mondatoknál is elég)
  } else {
    // Hibásnál megáll és felugrik a Tovább gomb
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}

function normalizeRomaji(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  s = s.replace(/[\s\-]/g, '');
  s = s.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/ō/g, 'o').replace(/uu/g, 'u').replace(/ū/g, 'u').replace(/aa/g, 'a').replace(/ā/g, 'a').replace(/ii/g, 'i').replace(/ī/g, 'i').replace(/ee/g, 'e').replace(/ē/g, 'e');
  s = s.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, '$1');
  return s;
}

function checkHardcoreAnswer(wordId) {
  const p = state.practice;
  const word = state.words.find(w => w.id === wordId);
  const inputEl = document.getElementById('hardcore-input');
  const feedbackEl = document.getElementById('hardcore-feedback');
  if (!word || !inputEl) return;

  const userAnswer = inputEl.value.trim();
  if (userAnswer === '') return;
  inputEl.disabled = true;

  checkDailyReset();
  const isEnHu = practiceDir() === 'en-hu';
  const correctText = isEnHu ? word.hu : word.en;
  
  let isCorrect = (userAnswer.toLowerCase() === correctText.toLowerCase());
  
  if (!isEnHu && !isCorrect && word.romaji) {
    const normUser = normalizeRomaji(userAnswer);
    const normCorrect = normalizeRomaji(word.romaji);
    if (normUser === normCorrect) isCorrect = true;
  }

  if (feedbackEl) feedbackEl.style.display = 'block';
  const romajiAdd = (!isEnHu && word.romaji) ? `(${word.romaji})` : '';

  const qCard = document.getElementById('q-card');
  if (isCorrect) {
    if (qCard) qCard.classList.add('bounce');
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--success)';
      feedbackEl.innerHTML = `Helyes! <span style="font-weight:400; font-size:14px; display:block; color:var(--text-2); margin-top:4px;">${correctText} ${romajiAdd}</span>`;
    }
    inputEl.style.borderColor = 'var(--success)';
    inputEl.style.backgroundColor = 'var(--success-bg)';
    
    word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++;
  } else {
    if (qCard) qCard.classList.add('shake');
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--error)';
      feedbackEl.innerHTML = `Helytelen! A jó válasz:<br><span style="font-size:22px; margin-top:6px; display:block;">${correctText}</span><span style="font-weight:400; font-size:14px; color:var(--text-2);">${romajiAdd}</span>`;
    }
    inputEl.style.borderColor = 'var(--error)';
    inputEl.style.backgroundColor = 'var(--error-bg)';

    word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; 
    if(!p.errorList.includes(word.id)) p.errorList.push(word.id);
  }
  
  speakWord(word.en, false);
  word.stats.lastAttempt = Date.now();
  updateQuestProgress('wordAnswered', { word, isCorrect });

  if (isCorrect) {
    // V9: Bevárjuk a hang végét
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      _ttsOnEnd = null;
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    _ttsOnEnd = () => setTimeout(doAdvance, 400);
    setTimeout(doAdvance, 5000); // Biztonsági timeout
  } else {
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}

function revealHardcoreAnswer(wordId) {
  const inputEl = document.getElementById('hardcore-input');
  if(inputEl) inputEl.value = "???";
  checkHardcoreAnswer(wordId);
}

function toggleEye(wordId) {
  const word = state.words.find(w => w.id === wordId);
  if(!word) return;
  
  const rt = document.getElementById('reveal-text');
  if (!rt) return;

  eyeState++;
  
  if (currentMode === 'japanese') {
    if (eyeState > 1) eyeState = 0;
    rt.innerHTML = eyeState === 1 ? `<span style="color:var(--primary)">${word.romaji}</span>` : '';
  } else if (currentMode === 'kanji') {
    if (eyeState > 2) eyeState = 0;
    if (eyeState === 0) rt.innerHTML = '';
    if (eyeState === 1) rt.innerHTML = `<span style="color:var(--primary)">On: ${word.onyomi} | Kun: ${word.kunyomi}</span>`;
    if (eyeState === 2) rt.innerHTML = `<span style="color:var(--primary)">On: ${word.onyomi} | Kun: ${word.kunyomi}</span><br><span style="font-size:13px;color:var(--text-3)">${word.romaji}</span>`;
  }
}

function checkAnswer(btn, chosen, correct) {
  const p = state.practice; const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
  checkDailyReset();
  const isCorrect = chosen === correct;
  const qCard = document.getElementById('q-card');

  if (isCorrect && btn) { 
    btn.classList.add('correct'); 
    if(qCard) qCard.classList.add('bounce'); 
  }
  else {
    if (btn) btn.classList.add('wrong');
    document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    if(qCard) qCard.classList.add('shake');
    if(currentMode !== 'english' && practiceDir() === 'en-hu') {
      eyeState = currentMode === 'kanji' ? 1 : 0; 
      toggleEye(word.id);
    }
  }

  if (word) {
    if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
    else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
    word.stats.lastAttempt = Date.now();
    updateQuestProgress('wordAnswered', { word, isCorrect });
    // V13: gyors ismétlésnél a hibás szó a sor végére kerül, amíg egyszer el nem találod
    if (!isCorrect && p.type === 'quickQuiz') p.roundWords.push(word.id);
  }

  if (!isCorrect && practiceDir() === 'hu-en') {
      speakWord(word.en, false);
  }

  if (isCorrect) {
    // V9: Bevárjuk a szó hangjának végét, mielőtt továbblépünk
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      _ttsOnEnd = null;
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    // Ellenőrizzük, hogy fut-e még hang (az auto-speak-ből showQuestion-ban)
    const isAudioPlaying = (_currentTTSAudio && !_currentTTSAudio.ended && !_currentTTSAudio.paused)
                        || (window.speechSynthesis && window.speechSynthesis.speaking);
    if (isAudioPlaying) {
      _ttsOnEnd = () => setTimeout(doAdvance, 350); // Hang végén + kis szünet
      setTimeout(doAdvance, 5000);                  // Biztonsági max. várakozás
    } else {
      setTimeout(doAdvance, 800);
    }
  } else {
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}
/* ══════════════════════════════════════════════════════
   V11: 3D FLASHCARD MÓD – FLIP, RATING, SWIPE
══════════════════════════════════════════════════════ */
let _flashcard3DFlipped = false;
let _flashcard3DRated   = false;

function flipFlashcard3D() {
  if (_flashcard3DRated) return;
  const card = document.getElementById('flashcard-3d');
  if (!card) return;
  _flashcard3DFlipped = !_flashcard3DFlipped;
  card.classList.toggle('flipped', _flashcard3DFlipped);

  if (_flashcard3DFlipped) {
    // Hátlap megjelenése után: hu-en irányban a forrás szót olvassuk fel
    const p = state.practice;
    const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
    if (word && practiceDir() === 'hu-en') {
      setTimeout(() => speakWord(word.en, false), 350);
    }
  }
}

// Külső hang gomb: kontextus-érzékeny. Előlapon: az aktuálisan látható szó.
// Hátlapon: a forrásnyelvű példamondat (japán/angol), fallback a forrás szó.
function speakFlashcard3D() {
  const p = state.practice;
  if (!p) return;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;
  const isEnHu = practiceDir() === 'en-hu';

  if (_flashcard3DFlipped) {
    let exampleText = '';
    if (currentMode === 'english' && typeof english_sentences2 !== 'undefined') {
      const found = english_sentences2.find(s => s.baseWord === word.en);
      if (found && found.fullSentenceHTML) {
        exampleText = found.fullSentenceHTML.replace(/<[^>]+>/g, '').trim();
      }
    } else if ((currentMode === 'japanese' || currentMode === 'kanji') && typeof JAPANESE_SENTENCES !== 'undefined') {
      const found = JAPANESE_SENTENCES.find(s => s.baseWord === word.en);
      if (found && found.fullSentenceHTML) {
        exampleText = found.fullSentenceHTML.replace(/<[^>]+>/g, '').trim();
      }
    }
    if (!exampleText && word.sentence) exampleText = String(word.sentence).replace(/<[^>]+>/g, '').trim();
    speakWord(exampleText || word.en, false);
  } else {
    if (isEnHu) speakWord(word.en, false);
    else        speakWord(word.hu, true);
  }
}

// immediate: elhúzásnál a kártya már kirepült, nincs szükség a színes felvillanás kivárására
function rateFlashcard3D(isCorrect, immediate = false) {
  if (_flashcard3DRated) return;
  _flashcard3DRated = true;

  const p = state.practice;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;

  // V11 izoláció: a flashcard mód NEM módosít sem per-szó, sem globális, sem
  // küldetés-statisztikát. A "Tudtam / Nem tudtam" csak vizuális feedback és lapozás.
  // Az aktuális értékelést a flashcardHistory-ba mentjük, hogy a Vissza gomb
  // tudja törölni ha a felhasználó visszaugrik.
  if (!p.flashcardHistory) p.flashcardHistory = [];
  p.flashcardHistory[p.currentIdx] = { wordId: word.id, isCorrect };
  logActivity({ known: isCorrect }); // V13.2: csak a napi naplóba (a szó statisztikáját továbbra sem érinti)

  // Vizuális visszacsatolás: rövid színes felvillanás a kártyán
  const card = document.getElementById('flashcard-3d');
  if (card) card.classList.add(isCorrect ? 'fc-rated-correct' : 'fc-rated-wrong');

  setTimeout(() => {
    _flashcard3DFlipped = false;
    _flashcard3DRated   = false;
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) {
      // Vége: jelöljük a mai napot mint "gyakorolt nap" (a streak rendszerhez),
      // de NE adjunk hozzá session history-t, kvíz-eredményt, stb.
      state.globalStats.studyDays[todayKey()] = true;
      saveStats();
      showScreen('dashboard');
      showToast(`Áttekintve: ${p.roundWords.length} kártya`);
    } else {
      showQuestion();
    }
  }, immediate ? 0 : 650);
}

function prevFlashcard3D() {
  const p = state.practice;
  if (!p || p.currentIdx === 0) return;
  p.currentIdx--;
  // Az új current pozíción tárolt értékelés "törlése" (a felhasználó újraértékelheti)
  if (p.flashcardHistory) p.flashcardHistory[p.currentIdx] = undefined;
  _flashcard3DFlipped = false;
  _flashcard3DRated   = false;
  showQuestion();
}

// V13: az ujjat követő húzás (attachSwipe). Előlapról húzás: megfordítás (a kártya visszaugrik).
// Hátlapról húzás: értékelés és kirepülés (jobbra = tudtam, balra = nem tudtam).
function initFlashcard3DSwipe() {
  const card = document.getElementById('flashcard-3d');
  if (!card) return;
  attachSwipe(card, {
    onTap: flipFlashcard3D,
    onSwipe: dir => {
      if (!_flashcard3DFlipped) { flipFlashcard3D(); return false; }
      if (_flashcard3DRated) return false;
      flyOut(card, dir, () => rateFlashcard3D(dir === 'right', true));
      return true;
    }
  });
}

/* ══════════════════════════════════════════════════════
   V9: PRÉMIUM TTS HANG FELOLVASÓ
   - Google Translate TTS japánhoz (kanji-mentes, precíz kiejtés)
   - Kana prioritás: word.en = kana japán módban → automatikusan helyes
   - Audio blokkolás: helyes válasz után bevárja a hang végét
══════════════════════════════════════════════════════ */
let _currentTTSAudio = null; // Aktuális Google TTS Audio elem referenciája
let _ttsVersion = 0;          // Race condition védelem verziószámlálóval
let _ttsOnEnd = null;         // Hang befejezésekor futó callback (advance logika)

/* ── iOS / standalone (kezdőképernyős Safari app) audio-unlock ──
   iOS-en – főleg „Add to Home Screen" appként – a hang néma marad, amíg egy
   VALÓDI felhasználói érintésen belül fel nem oldjuk az audiót. Ezért az ELSŐ
   koppintáskor: (1) feloldunk egy ÚJRAHASZNÁLT <audio> elemet egy néma klippel
   (ezt használja a Google-TTS is), (2) felébresztjük a speechSynthesis-t.
   Enélkül az auto-lejátszás (setTimeout → kiesik a gesture-láncból) néma. */
const _TTS_SILENCE = 'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==';
let _ttsAudioEl = null;
let _audioUnlocked = false;

function _getTTSAudio() {
  if (!_ttsAudioEl) {
    _ttsAudioEl = new Audio();
    _ttsAudioEl.setAttribute('playsinline', ''); // iOS: ne ugorjon teljes képernyős lejátszóba
    _ttsAudioEl.preload = 'auto';
  }
  return _ttsAudioEl;
}

function unlockAudioPlayback() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  // 1) HTMLAudio elem feloldása néma klippel
  try {
    const a = _getTTSAudio();
    a.src = _TTS_SILENCE;
    const p = a.play();
    if (p && p.then) p.then(() => { try { a.pause(); a.currentTime = 0; } catch (e) {} }).catch(() => {});
  } catch (e) {}
  // 2) speechSynthesis felébresztése (standalone-ban gyakran néma a fallback enélkül)
  try {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {}
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
    window.removeEventListener(ev, unlockAudioPlayback, { capture: true }));
}
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
  window.addEventListener(ev, unlockAudioPlayback, { capture: true }));

function _onTTSFinished(version) {
  if (_ttsVersion !== version) return; // Elavult esemény → figyelmen kívül
  _currentTTSAudio = null;
  const cb = _ttsOnEnd;
  _ttsOnEnd = null;
  if (cb) cb();
}

function speakWord(text, forceHungarian = false) {
  _ttsVersion++;
  const ver = _ttsVersion;

  // Előző hang azonnali leállítása (kezelők nullázása, hogy a reuse miatt ne süljön
  // el a régi onerror/onended – különben szellem-fallback szólalna meg)
  if (_currentTTSAudio) {
    try { _currentTTSAudio.onended = null; _currentTTSAudio.onerror = null; _currentTTSAudio.pause(); } catch(e) {}
    _currentTTSAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (!text || typeof text !== 'string' || !text.trim()) {
    _onTTSFinished(ver); return;
  }

  // Japán módban (en-hu irányban): kana prioritás – word.en IS kana az adatstruktúrában
  const isJapanese = currentMode !== 'english' && !forceHungarian;

  // Fallback: böngésző beépített SpeechSynthesis
  function useSpeechSynthesis() {
    if (!window.speechSynthesis) { _onTTSFinished(ver); return; }
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (isJapanese) {
      u.lang = 'ja-JP';
      const jpVoice = voices.find(v => v.lang.includes('ja') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
                   || voices.find(v => v.lang.includes('ja'));
      if (jpVoice) u.voice = jpVoice;
      u.rate = 0.9;
    } else {
      u.lang = forceHungarian ? 'hu-HU' : 'en-US';
      u.rate = 1.0;
    }
    u.onend  = () => _onTTSFinished(ver);
    u.onerror = (e) => { console.log('[TTS] SpeechSynthesis hiba:', e); _onTTSFinished(ver); };
    window.speechSynthesis.speak(u);
  }

  if (isJapanese) {
    // Google Translate TTS – pontosabb japán kiejtés, kana alapú, on/kun keveredés nélkül.
    // ÚJRAHASZNÁLT (előre feloldott) elem – iOS standalone-ban csak így szól megbízhatóan.
    const audio = _getTTSAudio();
    audio.onended = null; audio.onerror = null; // tiszta lap a reuse miatt
    const encoded = encodeURIComponent(text);
    audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ja&client=gtx&ttsspeed=0.85`;
    _currentTTSAudio = audio;
    // Védőkapcsoló: az onerror és a play().catch() egyszerre is elsülhet hiba esetén –
    // enélkül a fallback kétszer fut, és a hang 2x szólalna meg.
    let _settled = false;
    const fallback = () => {
      if (_settled) return;
      _settled = true;
      _currentTTSAudio = null;
      useSpeechSynthesis();
    };
    audio.onended = () => {
      if (_settled) return;
      _settled = true;
      _onTTSFinished(ver);
    };
    audio.onerror = fallback;
    const _p = audio.play();
    if (_p && _p.then) _p.catch(fallback);
  } else {
    useSpeechSynthesis();
  }
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function showRoundEnd() {
  const p = state.practice;
  const total = p.roundWords.length;
  const pct = total > 0 ? Math.round(p.roundCorrect / total * 100) : 0;
  const elapsed = Math.round((Date.now() - p.roundStartTime) / 1000);
  
  checkDailyReset();
  updateQuestProgress('roundEnd', {
    roundCorrect: p.roundCorrect,
    roundWrong: p.roundWrong,
    roundLength: total,
    elapsed: elapsed
  });
  saveStats(); // Csak a statisztikát kell menteni kör végén
  renderDailyQuests();

  const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  
  const isQuickQuiz = p.type === 'quickQuiz';
  if (isQuickQuiz) setEl('re-title', p.roundWrong === 0 ? 'Hibátlan ismétlés' : 'Mai szavak átismételve');
  else setEl('re-title', p.roundNumber === 1 && p.errorList.length === 0 ? 'Hibátlan kör' : `${p.roundNumber}. kör vége`);
  setEl('err-title', isQuickQuiz ? 'Ezek elsőre nem mentek:' : 'Hibás elemek – következő körbe kerülnek:');
  setEl('re-subtitle', pct >= 80 ? 'Stabil tudás.' : pct >= 50 ? 'Fejlődik. A hibásakat érdemes még egyszer átvenni.' : 'Ezt a kört érdemes megismételni.');
  setEl('re-correct', p.roundCorrect);
  setEl('re-wrong', p.roundWrong);
  setEl('donut-pct', pct + '%');
  setEl('re-time', elapsed < 60 ? elapsed + 's' : Math.floor(elapsed/60) + 'm');

  const circ = 251.2;
  const dCorrect = document.getElementById('donut-correct');
  const dWrong = document.getElementById('donut-wrong');
  if(dCorrect) dCorrect.style.strokeDashoffset = circ - (circ * pct / 100);
  
  const wPct = total > 0 ? p.roundWrong / total : 0;
  if(dWrong) dWrong.style.strokeDashoffset = circ - (circ * wPct);

  const errSec = document.getElementById('error-list-section');
  const errList = document.getElementById('error-list-items');
  const nextBtn = document.getElementById('re-next-btn');
  
  if (p.errorList.length > 0) {
    if(errSec) errSec.style.display = '';
    if(errList) {
      errList.innerHTML = p.errorList.map(id => {
        const w = state.words.find(x => x.id === id);
        return `<div class="err-item"><span class="err-en">${escHtml(w.en)}</span><span class="err-hu">${escHtml(w.hu)}</span></div>`;
      }).join('');
    }
    // Gyors ismétlésnél nincs következő kör: a hibás szavak már a soron belül ismétlődtek
    if(nextBtn) nextBtn.style.display = isQuickQuiz ? 'none' : '';
  } else {
    if(errSec) errSec.style.display = 'none';
    if(nextBtn) nextBtn.style.display = 'none';
  }
  
  showScreen('roundend');
}

function startNextRound() {
  const p = state.practice;
  state.practice = { ...p, roundNumber: p.roundNumber + 1, roundWords: shuffle([...p.errorList]), currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now() };
  showScreen('practice'); showQuestion();
}

function finishSession() {
  const p = state.practice;
  const duration = Math.round((Date.now() - p.sessionStartTime) / 1000);

  state.globalStats.studyDays[todayKey()] = true;
  state.globalStats.totalSessions++; 
  state.globalStats.totalCorrect += p.sessionCorrect; 
  state.globalStats.totalWrong += p.sessionWrong;
  
  if (!state.globalStats.sessionHistory) state.globalStats.sessionHistory = [];
  
  state.globalStats.sessionHistory.push({
    date: new Date().toLocaleString('hu-HU'),
    correct: p.sessionCorrect,
    wrong: p.sessionWrong,
    rounds: p.roundNumber,
    duration: duration
  });

  saveStats(); saveWords(); showScreen(p.origin || 'dashboard'); showToast('Gyakorlás befejezve!'); // Statisztika + szó streak mentése
}

// V13: oda térünk vissza, ahonnan a gyakorlás indult (Kezdőlap vagy Gyakorlás fül)
function confirmQuit() {
  const p = state.practice;
  // Tanulás közben minden "Tudom" azonnal mentődik, így kilépéskor nincs mit elveszíteni
  if (p.type === 'learn' || confirm('Biztosan ki szeretnél lépni?')) showScreen(p.origin || 'dashboard');
}

// Irány a gyakorláshoz: a gyors ismétlés mindig forrás → magyar, egyébként a felhasználó beállítása
function practiceDir() {
  return (state.practice && state.practice.direction) || state.direction;
}

// A gyakorló képernyő felső sávja (badge, haladás, hibaszámláló)
function updatePracticeTop(label, done, total, errors = 0) {
  const progBar = document.getElementById('prog-bar');
  const progLabel = document.getElementById('prog-label');
  const roundBadge = document.getElementById('round-badge');
  const errBadge = document.getElementById('error-badge');
  const errCount = document.getElementById('error-count-badge');
  if (progBar) progBar.style.width = (total > 0 ? Math.round(done / total * 100) : 0) + '%';
  if (progLabel) progLabel.textContent = done + ' / ' + total;
  if (roundBadge) roundBadge.textContent = label;
  if (errBadge) errBadge.style.display = errors > 0 ? '' : 'none';
  if (errCount) errCount.textContent = errors;
}

// Példamondat egy szóhoz (kiemelt HTML + magyar fordítás) – a 3D kártya és a tanuló kártya közös forrása
function getExampleSentence(word) {
  let html = '', hu = '';
  if (currentMode === 'english' && typeof english_sentences2 !== 'undefined') {
    const found = english_sentences2.find(s => s.baseWord === word.en);
    if (found) {
      html = (found.fullSentenceHTML || '').replace(/<strong>(.*?)<\/strong>/g, '<span class="fc-highlight">$1</span>');
      hu = found.hungarian || '';
    }
  } else if ((currentMode === 'japanese' || currentMode === 'kanji') && typeof JAPANESE_SENTENCES !== 'undefined') {
    const found = JAPANESE_SENTENCES.find(s => s.baseWord === word.en);
    if (found) {
      html = found.fullSentenceHTML || '';
      if (found.correctAnswer) {
        const baseWordRegex = new RegExp(`(${escRegex(found.correctAnswer)})`, 'g');
        html = html.replace(baseWordRegex, '<span class="fc-highlight">$1</span>');
      }
      hu = found.hungarian || '';
    }
  }
  if (!html && word.sentence) html = escHtml(word.sentence);
  return { html, hu };
}

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
const MODE_LABELS = { english: 'Angol', japanese: 'Japán', kanji: 'Kandzsi' };

function getDailyGoal() {
  return state.globalStats.dailyGoal || DEFAULT_DAILY_GOAL[currentMode] || 10;
}

function isNewWord(w) {
  const s = w.stats || {};
  return !s.learnedAt && !s.lastAttempt && !(s.totalCorrect > 0) && !(s.totalWrong > 0);
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

/* ── KEZDŐLAP ─────────────────────────────────────────── */
function renderHome() {
  if (!document.getElementById('screen-home')) return;
  checkDailyReset();

  const today = todayKey();
  const streak = calcStreak();
  if (streak > (state.globalStats.recordStreak || 0)) state.globalStats.recordStreak = streak;
  const studiedToday = !!(state.globalStats.studyDays && state.globalStats.studyDays[today]);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Jó éjszakát' : hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szia' : 'Jó estét';
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText('home-greeting', greeting);
  setText('home-streak-text', `${streak} nap`);
  setText('home-streak-hint',
    studiedToday ? `A mai ${MODE_LABELS[currentMode].toLowerCase()} adag megvan.`
    : streak > 0 ? 'Egy rövid alkalom ma is elég a folytonossághoz.'
    : 'Egy rövid alkalom ma: ebből épül a rutin.');
  renderWeekTracker();

  // ── Napi cél ──
  const goal = getDailyGoal();
  const learnedToday = getTodayWords().length;
  const goalReached = learnedToday >= goal;
  const pct = Math.min(1, learnedToday / goal);
  setText('goal-done', learnedToday);
  setText('goal-total', goal);
  setText('goal-unit', currentMode === 'kanji' ? 'új kanji' : 'új szó');
  const goalSection = document.getElementById('home-goal');
  if (goalSection) goalSection.classList.toggle('is-done', goalReached);
  const bar = document.getElementById('goal-bar');
  if (bar) {
    bar.setAttribute('aria-valuemax', goal);
    bar.setAttribute('aria-valuenow', Math.min(learnedToday, goal));
    bar.style.setProperty('--p', pct);
  }

  const pool = getNewWordPool();
  const source = document.getElementById('goal-source');
  if (source) {
    source.innerHTML = `
      <span>Forrás: <b>${escHtml(describePoolSource())}</b> · ${pool.length} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}</span>
      <button class="link-btn" onclick="openPoolSource()">Módosítás</button>`;
  }

  // ── Fő cselekvések ──
  const remaining = goal - learnedToday;
  const nextBatch = Math.min(remaining, LEARN_BATCH_SIZE, pool.length);
  let learnHtml;
  if (goalReached) {
    learnHtml = `
      <div class="home-note is-success" role="status">
        <span class="home-note-icon" aria-hidden="true">✓</span>
        <div>
          <p class="home-note-title">A napi limit teljesítve.</p>
          <p class="home-note-sub">Az új szavak holnap folytatódnak; addig ismételd a maiakat.</p>
        </div>
      </div>`;
  } else if (pool.length === 0) {
    const filteredOut = hasPoolFilters() && state.words.some(isNewWord);
    learnHtml = filteredOut
      ? `<div class="home-note">
           <span class="home-note-icon" aria-hidden="true">∅</span>
           <div>
             <p class="home-note-title">Ebben a válogatásban elfogytak az új szavak.</p>
             <p class="home-note-sub">Válassz másik leckét, vagy tanulj a teljes szótárból.</p>
             <button class="link-btn" onclick="clearFilters()">Szűrők törlése</button>
           </div>
         </div>`
      : `<div class="home-note">
           <span class="home-note-icon" aria-hidden="true">✓</span>
           <div>
             <p class="home-note-title">Ebben a módban minden szót elkezdtél.</p>
             <p class="home-note-sub">Mélyítsd el őket a Gyakorlás fülön.</p>
           </div>
         </div>`;
  } else {
    const mins = Math.max(1, Math.round(nextBatch * 0.5));
    learnHtml = `
      <button class="cta-learn" onclick="startLearnSession()">
        <span class="cta-main">Új szavak tanulása</span>
        <span class="cta-sub">${nextBatch} ${currentMode === 'kanji' ? 'kanji' : 'szó'} · kb. ${mins} perc</span>
        <span class="cta-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </button>`;
  }

  // Ha mára kész a cél, a mai ismétlés lesz a fő (élénk) gomb
  const reviewClass = goalReached && learnedToday > 0 ? 'cta-learn' : 'cta-review';
  const reviewHtml = `
    <button class="${reviewClass}" onclick="startTodayReview()" ${learnedToday === 0 ? 'disabled' : ''}>
      <span class="cta-main">Mai szavak ismétlése${learnedToday > 0 ? ` <span class="count-chip">${learnedToday}</span>` : ''}</span>
      <span class="cta-sub">${learnedToday > 0 ? 'Gyors kvíz: a hibás szó visszakerül a sor végére' : 'Tanulj ma új szót, és itt átismételheted.'}</span>
    </button>`;

  const actions = document.getElementById('home-actions');
  if (actions) actions.innerHTML = learnHtml + reviewHtml;

  renderDailyQuests();
}

// "Módosítás": a Gyakorlás fül szűrő pilláihoz ugrik (ugyanazok a szűrők adják az új szavakat)
function openPoolSource() {
  showScreen('dashboard');
  showToast('Az új szavak az itt beállított szűrőkből jönnek');
}

// Minden szerkezeti szűrő törlése (Kezdőlap és Gyakorlás fül közös)
function clearFilters() {
  Object.assign(state.filters, { tags: [], diff: new Set(), lesson: 'all', day: 'all', list: 'all' });
  closeFilterMenu();
  renderFilterBar();
  applyFilters();
  if (document.body.dataset.screen === 'home') renderHome();
  showToast('Szűrők törölve');
}

/* ── ÚJ SZAVAK TANULÁSA (húzható kártyák) ─────────────── */
let _learnFlipped = false;

function startLearnSession() {
  const remaining = getDailyGoal() - getTodayWords().length;
  if (remaining <= 0) { renderHome(); return; }
  const batch = getNewWordPool().slice(0, Math.min(remaining, LEARN_BATCH_SIZE));
  if (batch.length === 0) { showToast('Nincs több új szó ebben a válogatásban.'); renderHome(); return; }

  const ids = batch.map(w => w.id);
  state.practice = {
    type: 'learn', origin: 'home',
    queue: [...ids], batchIds: ids, learnedIds: [], againIds: [],
    roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
  };
  showScreen('practice');
  showLearnCard();
}

function showLearnCard() {
  const p = state.practice;
  updatePracticeTop('Új szavak', p.learnedIds.length, p.batchIds.length);
  if (p.queue.length === 0) { showLearnComplete(); return; }

  const word = state.words.find(w => w.id === p.queue[0]);
  if (!word) { p.queue.shift(); showLearnCard(); return; }
  _learnFlipped = false;

  const isKanji = currentMode === 'kanji';
  const frontReading = currentMode === 'japanese' ? (word.romaji || '') : '';
  const backSrc = currentMode === 'japanese' && word.romaji ? `${word.en} · ${word.romaji}` : word.en;
  const kanjiReadings = isKanji
    ? `<div class="learn-readings">On: ${escHtml(word.onyomi || '–')} · Kun: ${escHtml(word.kunyomi || '–')}</div>`
    : '';
  const example = getExampleSentence(word);
  const isAgain = p.againIds.includes(word.id);
  const left = p.queue.length - 1;

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-stage">
      <div class="learn-card" id="learn-card" role="button" tabindex="0" aria-label="Kártya: ${escHtml(word.en)}. Koppints a jelentésért.">
        <div class="learn-card-inner">
          <div class="learn-face learn-front">
            <span class="learn-pill ${isAgain ? 'is-again' : ''}">${isAgain ? 'Újra' : (isKanji ? 'Új kanji' : 'Új szó')}</span>
            <div class="learn-word ${isKanji ? 'learn-word-kanji' : ''}">${escHtml(word.en)}</div>
            ${frontReading ? `<div class="learn-reading">${escHtml(frontReading)}</div>` : ''}
            <div class="learn-tap-hint">Koppints a jelentésért</div>
          </div>
          <div class="learn-face learn-back">
            <div class="learn-back-src">${escHtml(backSrc)}</div>
            <div class="learn-meaning">${escHtml(word.hu)}</div>
            ${kanjiReadings}
            ${example.html ? `
              <div class="learn-example">
                <div class="learn-example-src">${example.html}</div>
                ${example.hu && example.hu !== word.hu ? `<div class="learn-example-hu">${escHtml(example.hu)}</div>` : ''}
              </div>` : ''}
          </div>
        </div>
        <div class="swipe-stamp swipe-stamp-yes" aria-hidden="true">Tudom</div>
        <div class="swipe-stamp swipe-stamp-no" aria-hidden="true">Még nem</div>
      </div>

      <div class="learn-controls">
        <button class="swipe-btn swipe-btn-no" onclick="learnSwipe('left')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Még nem
        </button>
        <button class="swipe-speak" onclick="speakLearnWord()" aria-label="Kiejtés">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
        <button class="swipe-btn swipe-btn-yes" onclick="learnSwipe('right')">
          Tudom
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
      <p class="learn-left">${left > 0 ? `Még ${left} kártya` : 'Utolsó kártya'} · jobbra, ha megy, balra, ha még nem</p>
    </div>`;

  const card = document.getElementById('learn-card');
  attachSwipe(card, {
    onTap: flipLearnCard,
    onSwipe: dir => { learnSwipe(dir); return true; }
  });
  setTimeout(() => speakWord(word.en, false), 250);
}

function speakLearnWord() {
  const p = state.practice;
  const word = p && p.queue ? state.words.find(w => w.id === p.queue[0]) : null;
  if (word) speakWord(word.en, false);
}

function flipLearnCard() {
  const card = document.getElementById('learn-card');
  if (!card || card.dataset.swipeLocked) return;
  _learnFlipped = !_learnFlipped;
  card.classList.toggle('flipped', _learnFlipped);
}

function learnSwipe(dir) {
  const p = state.practice;
  if (!p || p.type !== 'learn' || p.queue.length === 0) return;
  const card = document.getElementById('learn-card');
  if (!card || card.dataset.swipeLocked) return;
  flyOut(card, dir, () => resolveLearnCard(dir === 'right'));
}

function resolveLearnCard(known) {
  const p = state.practice;
  const id = p.queue.shift();
  const word = state.words.find(w => w.id === id);
  logActivity({ known });
  if (word) {
    if (known) {
      markWordLearned(word);
      p.learnedIds.push(id);
    } else {
      // "Még nem megy": vissza a sor végére, amíg egyszer jobbra nem húzod
      p.queue.push(id);
      if (!p.againIds.includes(id)) p.againIds.push(id);
    }
  }
  showLearnCard();
}

function showLearnComplete() {
  const p = state.practice;
  const goal = getDailyGoal();
  const learnedToday = getTodayWords().length;
  const goalReached = learnedToday >= goal;
  const remaining = Math.max(0, goal - learnedToday);
  const nextBatch = goalReached ? 0 : Math.min(remaining, LEARN_BATCH_SIZE, getNewWordPool().length);
  const pct = Math.min(1, learnedToday / goal);
  const streak = calcStreak();

  const chips = p.learnedIds.map(id => {
    const w = state.words.find(x => x.id === id);
    return w ? `<span class="word-chip">${escHtml(w.en)} <span>${escHtml(w.hu)}</span></span>` : '';
  }).join('');

  const qArea = document.getElementById('question-area');
  if (!qArea) return;
  qArea.innerHTML = `
    <div class="learn-done">
      <div class="learn-done-badge" aria-hidden="true">✓</div>
      <h2 class="learn-done-title">${p.learnedIds.length} új ${currentMode === 'kanji' ? 'kanji' : 'szó'} rögzítve</h2>
      <p class="learn-done-sub">${goalReached
        ? 'A napi limit teljesítve. Az új szavak holnap folytatódnak; addig ismételd a maiakat.'
        : `Napi penzum: ${learnedToday}/${goal}. Még ${remaining} van hátra.`}</p>
      <div class="learn-done-meter">
        <div class="goal-bar ${goalReached ? 'is-done' : ''}" style="--p:${pct}"><div class="goal-bar-fill"></div></div>
        <span class="learn-done-streak">Konzisztencia: ${streak} nap</span>
      </div>
      <div class="learn-done-words">${chips}</div>
      <div class="learn-done-actions">
        ${nextBatch > 0 ? `<button class="cta-learn cta-compact" onclick="startLearnSession()"><span class="cta-main">Még ${nextBatch} új szó</span></button>` : ''}
        <button class="${nextBatch > 0 ? 'cta-review' : 'cta-learn'} cta-compact" onclick="startTodayReview()"><span class="cta-main">Gyors kvíz a mai szavakból</span></button>
        <button class="btn-quiet" onclick="showScreen('home')">Vissza a kezdőlapra</button>
      </div>
    </div>`;

  // Napi cél elérése: egyszer ünneplünk naponta (módonként)
  if (goalReached && state.globalStats.goalCelebrated !== todayKey()) {
    state.globalStats.goalCelebrated = todayKey();
    saveStats();
    launchConfetti();
  }
}

// Billentyűzet a tanuló kártyákhoz: ← még nem, → tudom, Szóköz/Enter fordít
document.addEventListener('keydown', e => {
  const p = state.practice;
  if (!p || p.type !== 'learn' || document.body.dataset.screen !== 'practice' || p.queue.length === 0) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); learnSwipe('right'); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); learnSwipe('left'); }
  else if ((e.key === ' ' || e.key === 'Enter') && !(e.target.closest && e.target.closest('button'))) {
    e.preventDefault();
    flipLearnCard();
  }
});

/* ── MAI SZAVAK GYORS ISMÉTLÉSE ───────────────────────── */
function startTodayReview() {
  const words = getTodayWords();
  if (words.length === 0) { showToast('Ma még nem tanultál új szót.'); return; }
  const ids = shuffle(words).map(w => w.id);
  state.practice = {
    type: 'quickQuiz', direction: 'en-hu', origin: 'home',
    roundNumber: 1, roundWords: ids, uniqueCount: ids.length, currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    currentSentenceObj: null, _combo: 0
  };
  showScreen('practice');
  showQuestion();
}

/* ── HÚZHATÓ KÁRTYA MOTOR (pointer események, egér + érintés) ──
   A kártya követi az ujjat, a "Tudom" / "Még nem" pecsét a húzás mértékével jelenik meg.
   Küszöb felett (vagy gyors suhintásnál) kirepül, alatta visszaugrik. Függőleges húzásnál
   elengedjük a görgetést (touch-action: pan-y a CSS-ben). */
const _prefersReducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function attachSwipe(el, { onTap, onSwipe }) {
  if (!el) return;
  let startX = 0, startY = 0, startT = 0, dx = 0;
  let pointerId = null, tracking = false, dragging = false;
  const threshold = () => Math.min(110, el.offsetWidth * 0.28);

  el.addEventListener('pointerdown', e => {
    if (e.button > 0 || el.dataset.swipeLocked) return;
    pointerId = e.pointerId; startX = e.clientX; startY = e.clientY; startT = performance.now();
    dx = 0; tracking = true; dragging = false;
  });

  el.addEventListener('pointermove', e => {
    if (!tracking || e.pointerId !== pointerId) return;
    const mx = e.clientX - startX, my = e.clientY - startY;
    if (!dragging) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(my) > Math.abs(mx)) { tracking = false; return; } // függőleges: görgetés
      dragging = true;
      el.style.transition = 'none';
      try { el.setPointerCapture(pointerId); } catch (_) { /* nem kritikus */ }
    }
    dx = mx;
    setSwipeVisual(el, dx, threshold());
  });

  el.addEventListener('pointerup', e => {
    if (!tracking || e.pointerId !== pointerId) return;
    tracking = false;
    const dt = performance.now() - startT;
    if (!dragging) { if (dt < 500 && onTap) onTap(); return; }
    const fast = Math.abs(dx) / Math.max(dt, 1) > 0.6 && Math.abs(dx) > 40;
    if ((Math.abs(dx) > threshold() || fast) && onSwipe(dx > 0 ? 'right' : 'left') !== false) return;
    resetSwipe(el);
  });

  el.addEventListener('pointercancel', e => {
    if (e.pointerId !== pointerId) return;
    tracking = false;
    if (dragging) resetSwipe(el);
  });
}

function setSwipeVisual(el, dx, threshold) {
  el.style.transform = `translateX(${dx}px) rotate(${(dx * 0.05).toFixed(2)}deg)`;
  const r = Math.max(-1, Math.min(1, dx / threshold));
  el.style.setProperty('--swipe-yes', Math.max(0, r).toFixed(3));
  el.style.setProperty('--swipe-no', Math.max(0, -r).toFixed(3));
}

function resetSwipe(el) {
  el.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
  el.style.transform = '';
  el.style.setProperty('--swipe-yes', 0);
  el.style.setProperty('--swipe-no', 0);
}

function flyOut(el, dir, done) {
  el.dataset.swipeLocked = '1';
  el.style.setProperty(dir === 'right' ? '--swipe-yes' : '--swipe-no', 1);
  el.style.setProperty(dir === 'right' ? '--swipe-no' : '--swipe-yes', 0);
  if (_prefersReducedMotion()) {
    el.style.transition = 'opacity 120ms linear';
    el.style.opacity = '0';
    setTimeout(done, 120);
    return;
  }
  const dist = window.innerWidth * 1.1 * (dir === 'right' ? 1 : -1);
  el.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out';
  el.style.transform = `translateX(${dist}px) rotate(${dir === 'right' ? 16 : -16}deg)`;
  el.style.opacity = '0';
  setTimeout(done, 240);
}

/* ── KONFETTI (napi cél elérése) ──────────────────────── */
function launchConfetti() {
  if (_prefersReducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['var(--cta)', 'var(--primary-light)', 'var(--yellow)', 'var(--info)', 'var(--success)'];
  for (let i = 0; i < 80; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti-bit';
    bit.style.left = (Math.random() * 100).toFixed(1) + 'vw';
    bit.style.background = colors[i % colors.length];
    bit.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
    bit.style.setProperty('--rot', (Math.random() * 900 - 450).toFixed(0) + 'deg');
    bit.style.animationDelay = (Math.random() * 0.3).toFixed(2) + 's';
    bit.style.animationDuration = (1.5 + Math.random() * 1).toFixed(2) + 's';
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3000);
}

/* ── PROFIL ───────────────────────────────────────────── */
function renderProfile() {
  const goal = getDailyGoal();
  document.querySelectorAll('#goal-segmented [data-goal]').forEach(btn => {
    const isActive = Number(btn.dataset.goal) === goal;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
  const modeLbl = document.getElementById('pf-goal-mode');
  if (modeLbl) modeLbl.textContent = MODE_LABELS[currentMode];
  const sw = document.getElementById('theme-switch');
  if (sw) sw.setAttribute('aria-checked', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  renderStorageInfo();
}

function setDailyGoal(n) {
  state.globalStats.dailyGoal = n;
  saveStats();
  renderProfile();
  showToast(`Napi cél (${MODE_LABELS[currentMode]}): ${n} új ${currentMode === 'kanji' ? 'kanji' : 'szó'}`);
}

/* ══════════════════════════════════════════════════════
   V13.2: STATISZTIKA – nyugodt, fegyelem-alapú dashboard
   - KPI sáv: Konzisztencia, Aktív napok (30), Rögzült szavak, Fókusz a héten
   - Konzisztencia hőtérkép (GitHub-stílus), Tudás-érettség (sávdiagram),
     Pontosság (14 nap, vonal), Fókuszált idő (14 nap, oszlop)
   - Egyetlen vezérszín (erdőzöld); minden ábrának van táblázatos párja.
   Az ábrák kézzel írt SVG-k: offline is működnek, és a téma színei (CSS
   változók) automatikusan követik a világos / sötét módot.
══════════════════════════════════════════════════════ */
const HU_MONTHS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
const HU_WEEKDAYS = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
const HEAT_LEVEL_LABELS = ['Nem tanultál', 'Aktív nap', 'Napi penzum', 'Penzum + ismétlés', 'Intenzív nap'];

function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function startOfWeek(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
function keyToDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function fmtDay(key) { const d = keyToDate(key); return `${HU_MONTHS[d.getMonth()]} ${d.getDate()}.`; }
function fmtDayLong(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]} ${d.getDate()}., ${HU_WEEKDAYS[d.getDay()]}`; }
function lastNDays(n) { const today = new Date(); return Array.from({ length: n }, (_, i) => dateKey(addDays(today, i - n + 1))); }
function fmtDuration(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} p`;
  return `${Math.floor(m / 60)} ó ${String(m % 60).padStart(2, '0')} p`;
}
function fmtNum(n) { return Number(n || 0).toLocaleString('hu-HU'); }

// "2026. 09. 29. 10:15:22" (toLocaleString hu-HU) → "2026-09-29"
function parseHuDateKey(str) {
  const m = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./.exec(String(str || ''));
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null;
}

/* ── Napi index: napló + visszamenőleges becslés ──
   A részletes napló (globalStats.daily) a V13.2-vel indult. Az azelőtti napokra a
   befejezett gyakorlások (sessionHistory) és a studyDays adnak becslést. Az új szavak
   száma mindig a szavak learnedAt mezőjéből jön (pontos, nem kell naplózni). */
function buildDailyIndex() {
  const gs = state.globalStats;
  const idx = {};
  const entry = k => idx[k] || (idx[k] = { a: 0, c: 0, k: 0, g: 0, s: 0, n: 0, studied: false });
  const since = gs.dailySince || '9999-12-31';

  Object.entries(gs.daily || {}).forEach(([key, d]) => {
    const e = entry(key);
    e.a += d.a || 0; e.c += d.c || 0; e.k += d.k || 0; e.g += d.g || 0; e.s += d.s || 0;
  });
  (gs.sessionHistory || []).forEach(h => {
    const key = parseHuDateKey(h.date);
    if (!key || key >= since) return;
    const e = entry(key);
    e.a += (h.correct || 0) + (h.wrong || 0);
    e.c += h.correct || 0;
    e.s += h.duration || 0;
  });
  state.words.forEach(w => { const k = w.stats && w.stats.learnedAt; if (k) entry(k).n++; });
  Object.keys(gs.studyDays || {}).forEach(k => { if (gs.studyDays[k]) entry(k).studied = true; });
  return idx;
}

// 0: nincs tanulás · 1: aktív nap · 2: napi penzum vagy 20+ interakció
// 3: penzum + 40+ interakció · 4: 100+ interakció
function activityLevel(e, goal) {
  if (!e) return 0;
  const volume = e.a + e.k + e.g;
  if (!e.studied && volume === 0 && e.n === 0) return 0;
  if (volume >= 100) return 4;
  const metGoal = e.n >= goal;
  if (metGoal && volume >= 40) return 3;
  if (metGoal || volume >= 20) return 2;
  return 1;
}

/* ── Tudás-érettség ──
   Ismerkedés: az elmúlt 2 napban tanult, vagy még kétszer sem eltalált szó.
   Rögzült: legalább 5-ször egymás után helyes, és (ha ismert) 2 hétnél régebben tanult.
   Gyakorlás alatt: minden más elkezdett szó. */
function computeMaturity() {
  const yesterday = dateKey(addDays(new Date(), -1));
  const twoWeeksAgo = dateKey(addDays(new Date(), -14));
  const m = { fresh: 0, practicing: 0, mature: 0, notStarted: 0 };
  state.words.forEach(w => {
    if (isNewWord(w)) { m.notStarted++; return; }
    const s = w.stats || {};
    const la = s.learnedAt;
    if ((la && la >= yesterday) || (s.totalCorrect || 0) < 2) m.fresh++;
    else if ((s.streak || 0) >= 5 && (!la || la <= twoWeeksAgo)) m.mature++;
    else m.practicing++;
  });
  m.started = m.fresh + m.practicing + m.mature;
  return m;
}

/* ── Tooltip (értékek elöl, címkék utána; textContent, nem innerHTML) ── */
function showVizTip(clientX, clientY, lines) {
  const tip = document.getElementById('viz-tip');
  if (!tip) return;
  tip.replaceChildren(...lines.filter(Boolean).map((text, i) => {
    const row = document.createElement('div');
    row.className = i === 0 ? 'viz-tip-value' : 'viz-tip-label';
    row.textContent = text;
    return row;
  }));
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = clientX + 14, y = clientY - r.height - 14;
  if (x + r.width > window.innerWidth - 8) x = clientX - r.width - 14;
  if (x < 8) x = 8;
  if (y < 8) y = clientY + 18;
  tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
function hideVizTip() { const tip = document.getElementById('viz-tip'); if (tip) tip.hidden = true; }
window.addEventListener('scroll', hideVizTip, { passive: true });

function vizEmpty(text) { return `<p class="viz-empty">${escHtml(text)}</p>`; }
function dataTable(headers, rows) {
  return `<table class="data-table"><thead><tr>${headers.map(h => `<th scope="col">${escHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function setHtml(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

/* ── Fő belépési pont ── */
function renderStats() {
  const idx = buildDailyIndex();
  const goal = getDailyGoal();
  setText('stats-scope', `${MODE_LABELS[currentMode]} mód`);
  renderKpis(idx, goal);
  renderConsistencyHeatmap(idx, goal);
  renderMaturity();
  renderAccuracyChart(idx);
  renderFocusChart(idx);
  renderStatsDetails();
}

let _statsResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_statsResizeTimer);
  _statsResizeTimer = setTimeout(() => { if (document.body.dataset.screen === 'stats') renderStats(); }, 150);
});

/* ── KPI sáv ── */
function weekFocusSeconds(idx, weekOffset) {
  const start = addDays(startOfWeek(new Date()), weekOffset * 7);
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += (idx[dateKey(addDays(start, i))] || {}).s || 0;
  return sum;
}

function renderKpis(idx, goal) {
  const streak = calcStreak();
  const record = Math.max(state.globalStats.recordStreak || 0, streak);
  let active30 = 0;
  lastNDays(30).forEach(k => { if (activityLevel(idx[k], goal) > 0) active30++; });
  const mat = computeMaturity();
  const thisWeek = weekFocusSeconds(idx, 0);
  const lastWeek = weekFocusSeconds(idx, -1);
  const delta = Math.round((thisWeek - lastWeek) / 60);
  const deltaHtml = delta === 0
    ? `<span class="kpi-sub">Ugyanannyi, mint múlt héten</span>`
    : `<span class="kpi-sub kpi-delta ${delta > 0 ? 'is-up' : 'is-down'}">
         <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="${delta > 0 ? 'M5 1 9 8H1z' : 'M5 9 1 2h8z'}"/></svg>
         ${delta > 0 ? '+' : '−'}${fmtDuration(Math.abs(delta) * 60)} a múlt héthez képest
       </span>`;

  setHtml('kpi-strip', `
    <div class="kpi">
      <span class="kpi-label">Konzisztencia</span>
      <span class="kpi-value">${streak}<span class="kpi-unit">nap</span></span>
      <span class="kpi-sub">Leghosszabb: ${record} nap</span>
    </div>
    <div class="kpi">
      <span class="kpi-label">Aktív napok</span>
      <span class="kpi-value">${active30}<span class="kpi-unit">/ 30</span></span>
      <span class="kpi-sub">az elmúlt 30 napban</span>
    </div>
    <div class="kpi">
      <span class="kpi-label">Rögzült szavak</span>
      <span class="kpi-value">${fmtNum(mat.mature)}</span>
      <span class="kpi-sub">${fmtNum(mat.started)} elkezdett szóból</span>
    </div>
    <div class="kpi">
      <span class="kpi-label">Fókusz a héten</span>
      <span class="kpi-value">${fmtDuration(thisWeek)}</span>
      ${deltaHtml}
    </div>`);
}

/* ── Konzisztencia hőtérkép ── */
function renderConsistencyHeatmap(idx, goal) {
  const wrap = document.getElementById('heatmap-wrap');
  if (!wrap) return;
  const CELL = 13, GAP = 3, STEP = CELL + GAP, LEFT = 24, TOP = 18;
  const width = wrap.clientWidth || 320;
  const weeks = Math.max(8, Math.min(53, Math.floor((width - LEFT + GAP) / STEP)));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayK = dateKey(today);
  const start = addDays(startOfWeek(today), -(weeks - 1) * 7);

  let cells = '', months = '';
  let lastLabelWeek = -10, lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const weekStart = addDays(start, w * 7);
    const month = weekStart.getMonth();
    if (month !== lastMonth) {
      if (w - lastLabelWeek >= 3) {
        months += `<text class="hm-label" x="${LEFT + w * STEP}" y="11">${HU_MONTHS[month]}</text>`;
        lastLabelWeek = w;
      }
      lastMonth = month;
    }
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      if (date > today) continue;
      const key = dateKey(date);
      const level = activityLevel(idx[key], goal);
      cells += `<rect class="hm-cell l${level}${key === todayK ? ' is-today' : ''}" x="${LEFT + w * STEP}" y="${TOP + d * STEP}" width="${CELL}" height="${CELL}" rx="3" data-k="${key}"/>`;
    }
  }
  const weekdayLabels = [[0, 'H'], [2, 'Sz'], [4, 'P']]
    .map(([row, label]) => `<text class="hm-label" x="0" y="${TOP + row * STEP + CELL - 3}">${label}</text>`).join('');
  const svgW = LEFT + weeks * STEP - GAP, svgH = TOP + 7 * STEP - GAP;
  wrap.innerHTML = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Konzisztencia az elmúlt ${weeks} hétben">${months}${weekdayLabels}${cells}</svg>`;

  const svg = wrap.querySelector('svg');
  const onMove = e => {
    const cell = e.target.closest && e.target.closest('.hm-cell');
    if (!cell) { hideVizTip(); return; }
    const key = cell.dataset.k;
    const d = idx[key];
    const level = activityLevel(d, goal);
    const volume = d ? d.a + d.k + d.g : 0;
    const value = level === 0 ? 'Nem tanultál' : [
      volume ? `${volume} válasz` : null,
      d && d.n ? `${d.n} új szó` : null,
      d && d.s ? fmtDuration(d.s) : null
    ].filter(Boolean).join(' · ') || 'Aktív nap';
    showVizTip(e.clientX, e.clientY, [value, fmtDayLong(key), level ? HEAT_LEVEL_LABELS[level] : null]);
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onMove);
  svg.addEventListener('pointerleave', hideVizTip);

  let active30 = 0;
  const rows = lastNDays(30).reverse().map(k => {
    const d = idx[k];
    const level = activityLevel(d, goal);
    if (level) active30++;
    return [fmtDay(k), d ? String(d.a + d.k + d.g) : '0', d ? String(d.n) : '0', fmtDuration(d ? d.s : 0), HEAT_LEVEL_LABELS[level]];
  });
  setText('viz-cons-note', `${active30} aktív nap az elmúlt 30-ból`);
  setHtml('heatmap-table', dataTable(['Nap', 'Válasz', 'Új szó', 'Aktív idő', 'Fokozat'], rows));
}

/* ── Tudás-érettség: 100%-os sávdiagram (ordinális zöld skála) ── */
function renderMaturity() {
  const host = document.getElementById('maturity');
  if (!host) return;
  const m = computeMaturity();
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  setText('viz-mat-note', `${fmtNum(m.started)} ${unit} elkezdve · ${fmtNum(m.notStarted)} még nem`);
  if (m.started === 0) {
    host.innerHTML = vizEmpty('Ebben a módban még nincs elkezdett szó. Az első tanulás után itt látod, mennyire rögzült a tudásod.');
    setHtml('maturity-table', '');
    return;
  }
  const stages = [
    ['fresh', 'm1', 'Ismerkedés', m.fresh],
    ['practicing', 'm2', 'Gyakorlás alatt', m.practicing],
    ['mature', 'm3', 'Rögzült', m.mature]
  ];
  const pct = v => Math.round(v / m.started * 100);
  const segments = stages.filter(s => s[3] > 0)
    .map(([key, cls, label, v]) => `<span class="mat-seg ${cls}" style="flex-grow:${v}" data-label="${label}" data-v="${v}"></span>`).join('');
  host.innerHTML = `
    <div class="mat-bar" role="img" aria-label="${stages.map(s => `${s[2]}: ${s[3]}`).join(', ')}">${segments}</div>
    <ul class="mat-legend">
      ${stages.map(([key, cls, label, v]) => `
        <li><i class="mat-sw ${cls}" aria-hidden="true"></i><span class="mat-name">${label}</span><span class="mat-count">${fmtNum(v)}</span><span class="mat-pct">${pct(v)}%</span></li>`).join('')}
    </ul>
    <p class="viz-caption">Rögzült: legalább ötször egymás után helyes, és két hétnél régebben tanult szó. Ismerkedés: az elmúlt két nap szavai.</p>`;

  const bar = host.querySelector('.mat-bar');
  const onMove = e => {
    const seg = e.target.closest && e.target.closest('.mat-seg');
    if (!seg) { hideVizTip(); return; }
    const v = Number(seg.dataset.v);
    showVizTip(e.clientX, e.clientY, [`${fmtNum(v)} ${unit} · ${pct(v)}%`, seg.dataset.label]);
  };
  bar.addEventListener('pointermove', onMove);
  bar.addEventListener('pointerdown', onMove);
  bar.addEventListener('pointerleave', hideVizTip);

  setHtml('maturity-table', dataTable(['Szakasz', 'Szó', 'Arány'],
    stages.map(([, , label, v]) => [label, fmtNum(v), `${pct(v)}%`])));
}

/* ── Közös tengely-segédek ── */
function xDayLabels(days, x, y) {
  return [0, Math.floor((days.length - 1) / 2), days.length - 1].map(i => {
    const anchor = i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle';
    const label = i === days.length - 1 ? 'ma' : fmtDay(days[i]);
    return `<text class="viz-axis-label" x="${x(i)}" y="${y}" text-anchor="${anchor}">${label}</text>`;
  }).join('');
}

/* ── Pontosság: 14 napos vonal (80%-os referencia) ── */
function renderAccuracyChart(idx) {
  const host = document.getElementById('acc-chart');
  if (!host) return;
  const days = lastNDays(14);
  const pts = days.map(k => {
    const e = idx[k];
    const total = e ? e.a + e.k + e.g : 0;
    const good = e ? e.c + e.k : 0;
    return { k, total, good, v: total >= 3 ? Math.round(good / total * 100) : null, e };
  });
  const withData = pts.filter(p => p.v !== null);
  if (withData.length === 0) {
    setText('viz-acc-note', '');
    host.innerHTML = vizEmpty('Még nincs elég adat. Néhány kérdés vagy kártya után itt megjelenik a trend.');
    setHtml('acc-table', '');
    return;
  }
  const sumGood = withData.reduce((s, p) => s + p.good, 0);
  const sumTotal = withData.reduce((s, p) => s + p.total, 0);
  setText('viz-acc-note', `14 napos átlag: ${Math.round(sumGood / sumTotal * 100)}% · a kártyáknál a "Tudom" is helyesnek számít`);

  const W = Math.max(280, host.clientWidth), H = 200;
  const m = { l: 40, r: 42, t: 14, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const x = i => m.l + pw * i / (days.length - 1);
  const y = v => m.t + ph * (1 - v / 100);

  let grid = [0, 50, 100].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join('');
  grid += `<line class="viz-ref" x1="${m.l}" x2="${W - m.r}" y1="${y(80)}" y2="${y(80)}"/>
    <text class="viz-ref-label" x="${m.l - 8}" y="${y(80) + 4}" text-anchor="end">80%</text>`;

  // Folytonos szakaszok: adat nélküli napon megszakad a vonal (nem esik nullára)
  // Terület-kitöltés nincs: kihagyott napoknál a szakaszos kitöltés hamis 'blokkokat' rajzolna
  let lines = '', run = [];
  const flush = () => {
    if (run.length > 1) {
      const d = run.map((p, j) => `${j ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
      lines += `<path class="viz-line" d="${d}"/>`;
    }
    run = [];
  };
  pts.forEach((p, i) => { if (p.v === null) flush(); else run.push({ i, v: p.v }); });
  flush();
  const dots = pts.map((p, i) => p.v === null ? '' : `<circle class="viz-dot" cx="${x(i)}" cy="${y(p.v)}" r="4"/>`).join('');
  const lastIdx = pts.map(p => p.v !== null).lastIndexOf(true);
  const endLabel = `<text class="viz-value-label" x="${x(lastIdx) + 9}" y="${y(pts[lastIdx].v) + 4}">${pts[lastIdx].v}%</text>`;

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Napi pontosság az elmúlt 14 napban">
      ${grid}${lines}${dots}${endLabel}
      ${xDayLabels(days, x, H - 8)}
      <line class="viz-crosshair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ph}" visibility="hidden"/>
      <rect class="viz-hit" x="${m.l - 10}" y="${m.t}" width="${pw + 20}" height="${ph}"/>
    </svg>`;

  const svg = host.querySelector('svg');
  const cross = svg.querySelector('.viz-crosshair');
  const onMove = e => {
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    const i = Math.max(0, Math.min(days.length - 1, Math.round((px - m.l) / pw * (days.length - 1))));
    const p = pts[i];
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    const detail = p.e && p.total ? `${p.e.a} válasz (${p.e.c} helyes) · ${p.e.k + p.e.g} kártya (${p.e.k} tudom)` : 'Nincs adat';
    showVizTip(e.clientX, e.clientY, [p.v === null ? 'Kevés adat' : `${p.v}%`, fmtDayLong(p.k), detail]);
  };
  const onLeave = () => { cross.setAttribute('visibility', 'hidden'); hideVizTip(); };
  const hit = svg.querySelector('.viz-hit');
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerdown', onMove);
  hit.addEventListener('pointerleave', onLeave);

  setHtml('acc-table', dataTable(['Nap', 'Pontosság', 'Válasz / kártya'],
    pts.slice().reverse().map(p => [fmtDay(p.k), p.v === null ? '–' : `${p.v}%`, String(p.total)])));
}

/* ── Fókuszált idő: 14 napos oszlopdiagram (perc) ── */
function niceMaxMinutes(v) {
  const steps = [10, 20, 30, 40, 60, 90, 120, 180, 240];
  return steps.find(s => s >= v) || Math.ceil(v / 60) * 60;
}

function renderFocusChart(idx) {
  const host = document.getElementById('focus-chart');
  if (!host) return;
  const days = lastNDays(14);
  const mins = days.map(k => Math.round(((idx[k] || {}).s || 0) / 60));
  const thisWeek = weekFocusSeconds(idx, 0), lastWeek = weekFocusSeconds(idx, -1);
  setText('viz-focus-note', `Ezen a héten ${fmtDuration(thisWeek)} aktív fókusz · múlt héten ${fmtDuration(lastWeek)}`);
  if (mins.every(v => v === 0)) {
    host.innerHTML = vizEmpty('Az aktív idő mérése most indul: minden válasz és kártya beleszámít, a hosszabb szünetek nem.');
    setHtml('focus-table', '');
    return;
  }

  const W = Math.max(280, host.clientWidth), H = 180;
  const m = { l: 40, r: 10, t: 20, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const maxV = niceMaxMinutes(Math.max(...mins));
  const band = pw / days.length;
  const bw = Math.min(24, band * 0.62);
  const cx = i => m.l + band * i + band / 2;
  const y = v => m.t + ph * (1 - v / maxV);
  const base = y(0);

  const grid = [0, maxV / 2, maxV].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)} p</text>`).join('');

  // Oszlop: 4px-es lekerekített teteje, szögletes alapvonal
  const bars = mins.map((v, i) => {
    if (v <= 0) return '';
    const x0 = cx(i) - bw / 2, top = y(v), r = Math.min(4, (base - top) / 2, bw / 2);
    return `<path class="viz-bar" data-i="${i}" d="M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${base} Z"/>`;
  }).join('');
  const peak = mins.indexOf(Math.max(...mins));
  const peakLabel = `<text class="viz-value-label" x="${cx(peak)}" y="${y(mins[peak]) - 6}" text-anchor="middle">${mins[peak]} p</text>`;
  const hits = days.map((k, i) => `<rect class="viz-hit" data-i="${i}" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${ph}"/>`).join('');

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aktív fókusz percben az elmúlt 14 napban">
      ${grid}${bars}${peakLabel}
      ${xDayLabels(days, cx, H - 8)}
      ${hits}
    </svg>`;

  const svg = host.querySelector('svg');
  const onMove = e => {
    const hit = e.target.closest && e.target.closest('.viz-hit');
    svg.querySelectorAll('.viz-bar.is-hover').forEach(b => b.classList.remove('is-hover'));
    if (!hit) { hideVizTip(); return; }
    const i = Number(hit.dataset.i);
    const bar = svg.querySelector(`.viz-bar[data-i="${i}"]`);
    if (bar) bar.classList.add('is-hover');
    showVizTip(e.clientX, e.clientY, [`${mins[i]} perc`, fmtDayLong(days[i])]);
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onMove);
  svg.addEventListener('pointerleave', () => { svg.querySelectorAll('.viz-bar.is-hover').forEach(b => b.classList.remove('is-hover')); hideVizTip(); });

  setHtml('focus-table', dataTable(['Nap', 'Aktív fókusz'], days.slice().reverse().map((k, j) => [fmtDay(k), `${mins[days.length - 1 - j]} perc`])));
}

/* ── Részletek (fülek): szintek + témakörök, szavak, előzmények, Dekiru leckék ── */
function perfRowsHtml(items) {
  return items.map(it => `
    <div class="perf-row">
      <span class="perf-name">${escHtml(it.name)}${it.sub ? `<small>${escHtml(it.sub)}</small>` : ''}</span>
      <span class="perf-track"><span class="perf-fill" style="transform: scaleX(${(it.pct || 0) / 100})"></span></span>
      <span class="perf-pct">${it.pct === null ? '–' : it.pct + '%'}</span>
    </div>`).join('');
}

function accuracyOf(words) {
  const c = words.reduce((s, w) => s + w.stats.totalCorrect, 0);
  const t = words.reduce((s, w) => s + w.stats.totalCorrect + w.stats.totalWrong, 0);
  return { c, t, pct: t > 0 ? Math.round(c / t * 100) : null };
}

function renderStatsDetails() {
  const words = state.words;
  const dekiruBtn = document.getElementById('dekiru-tab-btn');
  if (dekiruBtn) dekiruBtn.style.display = currentMode === 'japanese' ? '' : 'none';

  // Szintek
  const levels = currentMode === 'english' ? ['B1', 'B2', 'C1', 'C2'] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  const levelItems = levels.map(lv => {
    const ws = words.filter(w => w.diff === lv);
    if (ws.length === 0) return null;
    const a = accuracyOf(ws);
    return { name: lv, sub: `${fmtNum(ws.length)} szó · ${fmtNum(a.t)} válasz`, pct: a.pct };
  }).filter(Boolean);
  setHtml('level-perf-list', levelItems.length ? perfRowsHtml(levelItems) : vizEmpty('Nincs adat.'));

  // Témakörök (csak ahol már volt válasz), pontosság szerint
  const tags = new Set();
  words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const tagItems = [];
  let untouched = 0;
  tags.forEach(tag => {
    const ws = words.filter(w => w.tags.includes(tag));
    const a = accuracyOf(ws);
    if (a.t === 0) { untouched++; return; }
    tagItems.push({ name: tag, sub: `${fmtNum(a.t)} válasz`, pct: a.pct });
  });
  tagItems.sort((a, b) => b.pct - a.pct);
  setHtml('tag-perf-list', (tagItems.length ? perfRowsHtml(tagItems) : vizEmpty('Még egyik témakörben sincs válasz.')) +
    (untouched ? `<p class="viz-caption">További ${untouched} témakörben még nincs válasz.</p>` : ''));

  // Szavak: csak a már gyakoroltak, a legtöbbet gyakoroltak elöl
  const practiced = words.filter(w => w.stats.totalCorrect + w.stats.totalWrong > 0)
    .sort((a, b) => (b.stats.totalCorrect + b.stats.totalWrong) - (a.stats.totalCorrect + a.stats.totalWrong));
  const srcHeader = currentMode === 'english' ? 'Angol' : currentMode === 'kanji' ? 'Kandzsi' : 'Kana';
  setHtml('word-stats-table', practiced.length
    ? `<div class="table-scroll">${dataTable([srcHeader, 'Magyar', 'Sorozat', 'Helyes', 'Hibás', '%', 'Szint'], practiced.map(w => {
        const t = w.stats.totalCorrect + w.stats.totalWrong;
        return [w.en, w.hu, String(w.stats.streak || 0), String(w.stats.totalCorrect), String(w.stats.totalWrong), `${Math.round(w.stats.totalCorrect / t * 100)}%`, w.diff];
      }))}</div>`
    : vizEmpty('Még nincs gyakorolt szó ebben a módban.'));

  // Előzmények
  const hist = (state.globalStats.sessionHistory || []).slice().reverse();
  setHtml('history-list', hist.length === 0 ? vizEmpty('Még nincs befejezett gyakorlás.') : hist.map(h => {
    const mins = Math.floor(h.duration / 60), secs = h.duration % 60;
    return `
      <div class="hist-row">
        <div><span class="hist-date">${escHtml(h.date)}</span>
          <span class="hist-score">${h.correct} helyes · ${h.wrong} hibás</span></div>
        <span class="hist-meta">${h.rounds} kör · ${mins > 0 ? `${mins} p ${secs} mp` : `${secs} mp`}</span>
      </div>`;
  }).join(''));

  if (document.getElementById('stats-dekiru-tab') && !document.getElementById('stats-dekiru-tab').hidden) renderDekiruLessonStats();
}

function renderDekiruLessonStats() {
  const container = document.getElementById('dekiru-lesson-list');
  if (!container) return;
  const dekiruWords = appData.japanese.words.filter(w => w.source === 'dekiru' && w.lesson !== null && w.lesson !== undefined && w.lesson !== '');
  if (dekiruWords.length === 0) { container.innerHTML = vizEmpty('Még nincs Dekiru szó az adatbázisban.'); return; }

  const lessonMap = {};
  dekiruWords.forEach(w => { (lessonMap[w.lesson] = lessonMap[w.lesson] || []).push(w); });
  let lessons = Object.entries(lessonMap).map(([lesson, ws]) => {
    const a = accuracyOf(ws);
    return { lesson: Number(lesson), count: ws.length, learned: ws.filter(w => w.stats.streak >= 3).length, ...a };
  });
  const sort = document.getElementById('dekiru-sort')?.value || 'lesson-asc';
  if      (sort === 'best')        lessons.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  else if (sort === 'worst')       lessons.sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
  else if (sort === 'lesson-desc') lessons.sort((a, b) => b.lesson - a.lesson);
  else                             lessons.sort((a, b) => a.lesson - b.lesson);

  container.innerHTML = perfRowsHtml(lessons.map(l => ({
    name: `${l.lesson}. lecke`,
    sub: `${l.count} szó · ${l.learned} megy · ${fmtNum(l.t)} válasz`,
    pct: l.pct
  })));
}

function switchStatsTab(tab) {
  ['topics', 'words', 'history', 'dekiru'].forEach(t => {
    const panel = document.getElementById(`stats-${t}-tab`);
    if (panel) panel.hidden = t !== tab;
  });
  document.querySelectorAll('.detail-tabs [data-tab]').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (tab === 'dekiru') renderDekiruLessonStats();
}

/* ══════════════════════════════════════════════════════
   IMPORT / EXPORT
══════════════════════════════════════════════════════ */
async function exportData() {
  try {
    // Mind a 4 kulcs tartalmát összegyűjtjük, és egyetlen JSON-ba csomagoljuk
    const [words, stats, playlists, settings] = await Promise.all([
      localforage.getItem('lexi_words'),
      localforage.getItem('lexi_stats'),
      localforage.getItem('lexi_playlists'),
      localforage.getItem('lexi_settings')
    ]);
    if (!words && !stats) { showToast('Nincs mit menteni!'); return; }
    // Visszafelé kompatibilis export formátum (egyetlen JSON)
    const exportObj = { _format: 'lexilearn_v10_5', words, stats, playlists, settings };
    const blob = new Blob([JSON.stringify(exportObj)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiLearn_Mentes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Biztonsági mentés letöltve!');
  } catch(e) {
    showToast('Hiba a mentés során!');
    console.warn('[LexiLearn] Export hiba:', e);
  }
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed._format === 'lexilearn_v10_5') {
        // Új split-formátum: közvetlen visszaírás a 4 kulcsba
        await Promise.all([
          parsed.words     ? localforage.setItem('lexi_words',     parsed.words)     : Promise.resolve(),
          parsed.stats     ? localforage.setItem('lexi_stats',     parsed.stats)     : Promise.resolve(),
          parsed.playlists ? localforage.setItem('lexi_playlists', parsed.playlists) : Promise.resolve(),
          parsed.settings  ? localforage.setItem('lexi_settings',  parsed.settings)  : Promise.resolve()
        ]);
      } else {
        // Régi monolit formátum: migráció menet közben
        await _migrateMonolithToSplit(parsed);
      }
      showToast('Adatok betöltve! Újraindítás...');
      setTimeout(() => location.reload(), 1500);
    } catch(err) {
      showToast('Hiba: Érvénytelen mentés fájl!');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function openImportModal() {
  const ta = document.getElementById('import-textarea');
  const mod = document.getElementById('import-modal');
  if(ta && mod) {
    ta.value = '';
    mod.classList.add('open');
  } else {
    showToast("Hiba: Az Import ablak nem található!");
  }
}

function doImport() {
  const text = document.getElementById('import-textarea').value.trim();
  if (!text) return;
  let added = 0;
  text.split('\n').filter(l=>l.trim()).forEach(line=>{
    const parts = line.split(',').map(p=>p.trim().replace(/^"|"$/g,''));
    if (parts.length < 2) return;
    
    if (currentMode === 'english') {
      const [en, hu, tagsStr, diffStr] = parts;
      if (!en||!hu) return;
      const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
      if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
      state.words.push({ id: stableWordId('en_imp', en), en, hu, tags, diff: migrateDiff(diffStr || 'B2'), syn:'', sentence:'', bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
    } else {
      const [en, hu, romaji, tagsStr, diffStr] = parts;
      if (!en||!hu) return;
      const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
      if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
      state.words.push({ id: stableWordId('jp_imp', en), en, hu, romaji: romaji || '', tags, diff: migrateDiff(diffStr || 'N5'), sentence:'', bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
    }
    added++;
  });
  saveWords(); closeModal('import-modal'); renderDashboard(); showToast(added+' elem importálva!');
}

function openAddModal() {
  const addEn = document.getElementById('add-en');
  const addHu = document.getElementById('add-hu');
  const addTags = document.getElementById('add-tags');
  const addSyn = document.getElementById('add-syn');
  const addSentence = document.getElementById('add-sentence');
  
  if(addEn) addEn.value = '';
  if(addHu) addHu.value = '';
  if(addTags) addTags.value = '';
  if(addSyn) addSyn.value = '';
  if(addSentence) addSentence.value = '';

  const lblEn = document.getElementById('lbl-add-en');
  const lblSyn = document.getElementById('lbl-add-syn');
  const diffSelect = document.getElementById('add-diff');
  const title = document.getElementById('add-modal-title');

  if (currentMode === 'english') {
    if(title) title.innerText = 'Új angol szó';
    if(lblEn) lblEn.innerText = 'Angol szó';
    if(lblSyn) lblSyn.innerText = 'Szinonima (opcionális)';
    if(diffSelect) diffSelect.innerHTML = '<option value="B1">B1</option><option value="B2" selected>B2</option><option value="C1">C1</option><option value="C2">C2</option>';
  } else if (currentMode === 'japanese') {
    if(title) title.innerText = 'Új japán szó';
    if(lblEn) lblEn.innerText = 'Kana (Japán szó)';
    if(lblSyn) lblSyn.innerText = 'Romaji (Kötelező!)';
    if(diffSelect) diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  } else if (currentMode === 'kanji') {
    if(title) title.innerText = 'Új kandzsi';
    if(lblEn) lblEn.innerText = 'Kandzsi (Jel)';
    if(lblSyn) lblSyn.innerText = 'On / Kun olvasat (vagy Romaji)';
    if(diffSelect) diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  }

  const modal = document.getElementById('add-modal');
  if(modal) modal.classList.add('open');
}

function doAddWord() {
  const enInput = document.getElementById('add-en');
  const huInput = document.getElementById('add-hu');
  const tagsInput = document.getElementById('add-tags');
  const diffInput = document.getElementById('add-diff');
  const synInput = document.getElementById('add-syn');
  const sentInput = document.getElementById('add-sentence');
  
  if (!enInput || !huInput) return;

  const en = enInput.value.trim();
  const hu = huInput.value.trim();
  const tagsRaw = tagsInput ? tagsInput.value.trim() : '';
  const diff = diffInput ? diffInput.value : 'N5';
  const synOrRomaji = synInput ? synInput.value.trim() : '';
  const sentence = sentInput ? sentInput.value.trim() : '';

  if (!en || !hu) { showToast('Az első két mező kitöltése kötelező!'); return; }

  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : [];

  if (state.words.some(w => w.en.toLowerCase() === en.toLowerCase())) {
    showToast('Ez a szó már szerepel a szótáradban!'); return;
  }

  if (currentMode === 'english') {
    state.words.push({ id: stableWordId('en_man', en), en, hu, tags, diff, syn: synOrRomaji, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'japanese') {
    if (!synOrRomaji) { showToast('A Romaji megadása kötelező japán szónál!'); return; }
    state.words.push({ id: stableWordId('jp_man', en), en, hu, romaji: synOrRomaji, tags, diff, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'kanji') {
    state.words.push({ id: stableWordId('kj_man', en), en, hu, romaji: synOrRomaji, onyomi: '', kunyomi: '', lesson: 'Egyéb', tags, diff, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  }

  saveWords();
  closeModal('add-modal');
  applyFilters(); 
  showToast('Sikeresen hozzáadva: ' + en);
}

function closeModal(id) { 
  const el = document.getElementById(id);
  if(el) el.classList.remove('open'); 
}

/* --- Eszközök --- */
let toastTimer;
function showToast(msg) { 
  const t = document.getElementById('toast'); 
  if(!t) return;
  t.textContent=msg; t.classList.add('show'); 
  clearTimeout(toastTimer); 
  toastTimer=setTimeout(()=>t.classList.remove('show'),3000); 
}
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escRegex(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

/* ══════════════════════════════════════════════════════
   HIÁNYZÓ FÜGGVÉNY: migrateDiff (FIX #1)
   Hiba: doImport() meghívta, de soha nem volt definiálva → ReferenceError
══════════════════════════════════════════════════════ */
function migrateDiff(d) {
  const enValid = ['B1','B2','C1','C2'];
  const jpValid = ['N5','N4','N3','N2','N1'];
  if (currentMode === 'english') {
    return enValid.includes(d) ? d : 'B2';
  } else {
    return jpValid.includes(d) ? d : 'N5';
  }
}

/* ══════════════════════════════════════════════════════
   Lista bővítése – kijelölt szavak hozzáadása meglévő listához
══════════════════════════════════════════════════════ */
function expandPlaylist(id) {
  const pl = state.playlists ? state.playlists.find(p => p.id === id) : null;
  if (!pl) return;
  if (state.selectedIds.size === 0) {
    showToast('Először jelölj ki szavakat a szólistából!');
    return;
  }
  let added = 0;
  state.selectedIds.forEach(wId => {
    if (!pl.wordIds.includes(wId)) {
      pl.wordIds.push(wId);
      added++;
    }
  });
  if (added === 0) {
    showToast('A kijelölt szavak már mind szerepelnek ebben a listában.');
  } else {
    showToast(`${added} szó hozzáadva a(z) „${pl.name}" listához!`);
  }
  savePlaylists();
  refreshLibraryChrome();
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
(async () => { await loadState(); })();

/* ══════════════════════════════════════════════════════
   SERVICE WORKER REGISZTRÁCIÓ (PWA) + FRISSÍTÉSI ÉRTESÍTŐ
══════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('[LexiLearn] Service Worker regisztrálva:', reg.scope);

      // Figyeli, ha új SW vár aktiválásra (frissítés letöltve)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // Az új SW települt és vár – de csak ha volt már aktív SW (nem első betöltés)
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast(reg);
          }
        });
      });
    }).catch(err => console.warn('[LexiLearn] Service Worker hiba:', err));

    // Ha az aktív SW cserélődött (felhasználó kattintott a frissítés toastra)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

function showUpdateToast(reg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = 'Új verzió érhető el. <a href="#" style="color:#fff;text-decoration:underline;margin-left:6px;" onclick="activateNewSW(event)">Frissítés</a>';
  toast.classList.add('show');
  window._pendingSWReg = reg;
}

function activateNewSW(e) {
  e.preventDefault();
  const reg = window._pendingSWReg;
  if (reg && reg.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/* ══════════════════════════════════════════════════════
   V12: FIREBASE AUTH UI VEZÉRLŐ
══════════════════════════════════════════════════════ */
// V13: a bejelentkezés a Profil képernyőn, modál nélkül történik
async function googleSignIn() {
  if (!window.LexiFirebase) { showToast('Firebase nincs betöltve'); return; }
  const errBox = document.getElementById('auth-error');
  if (errBox) errBox.style.display = 'none';
  if (!window.LexiFirebase.isConfigured()) {
    const warn = document.getElementById('auth-no-config-warning');
    if (warn) warn.style.display = '';
    return;
  }
  try {
    await window.LexiFirebase.signInGoogle();
    showToast('Sikeresen bejelentkeztél');
  } catch (err) {
    const errBox = document.getElementById('auth-error');
    if (errBox) {
      errBox.style.display = '';
      errBox.textContent = 'Hiba: ' + (err.message || err);
    }
  }
}

async function signOutCloud() {
  if (!window.LexiFirebase) return;
  await window.LexiFirebase.signOut();
  showToast('Kijelentkeztél');
}

async function manualCloudSync() {
  if (!window.LexiFirebase) return;
  showToast('Szinkronizálás...');
  // 1. Pull a cloud-ról (másik eszközről érkezett változások letöltése)
  // 2. Push a frissített lokálisat (saját változások felfelé)
  try {
    await window.LexiFirebase.forcePull();
    await window.LexiFirebase.forcePush();
    showToast('Szinkronizálva');
  } catch (err) {
    showToast('Sync sikertelen');
  }
}

// Auth állapot változás (firebase-sync.js → custom event)
// V13: a fejlécben csak az avatar + szinkron pötty látszik, a fiók részletei a Profilban vannak
window.addEventListener('lexi:authChanged', (e) => {
  const { user } = e.detail || {};
  const loginBlock     = document.getElementById('auth-login-block');
  const userBlock      = document.getElementById('auth-user-block');
  const avatar         = document.getElementById('user-avatar');
  const avatarFallback = document.getElementById('user-avatar-fallback');
  const profileAvatar  = document.getElementById('profile-avatar');
  const syncDot        = document.getElementById('sync-status');
  const hasPhoto       = !!(user && user.photoURL);

  if (loginBlock) loginBlock.style.display = user ? 'none' : '';
  if (userBlock)  userBlock.style.display  = user ? '' : 'none';
  if (syncDot)    syncDot.style.display    = user ? '' : 'none';

  if (avatar) {
    avatar.style.display = hasPhoto ? '' : 'none';
    if (hasPhoto) avatar.src = user.photoURL;
  }
  if (avatarFallback) avatarFallback.style.display = hasPhoto ? 'none' : '';
  if (profileAvatar) {
    profileAvatar.style.display = hasPhoto ? '' : 'none';
    if (hasPhoto) profileAvatar.src = user.photoURL;
  }

  if (user) {
    const nameEl  = document.getElementById('user-menu-name');
    const emailEl = document.getElementById('user-menu-email');
    if (nameEl)  nameEl.textContent  = user.displayName || 'Felhasználó';
    if (emailEl) emailEl.textContent = user.email || '';
  }
});

// Sync státusz indikátor (V13: kis színes pötty a fejléc avatarján)
window.addEventListener('lexi:syncStatus', (e) => {
  const status = e.detail.status;
  const el = document.getElementById('sync-status');
  if (!el) return;
  const CLASSES = { pending: 'sync-pending', syncing: 'sync-syncing', synced: 'sync-synced', error: 'sync-error' };
  el.className = 'sync-status ' + (CLASSES[status] || '');
  el.title = ({
    idle:    'Készen áll',
    pending: 'Mentésre vár...',
    syncing: 'Szinkronizál...',
    synced:  'Szinkronizálva: ' + new Date().toLocaleTimeString('hu-HU'),
    error:   'Hiba a szinkronizálás során'
  })[status] || '';

  const syncInfo = document.getElementById('user-menu-sync-info');
  if (syncInfo && status === 'synced') {
    syncInfo.textContent = 'Utoljára szinkronizálva: ' + new Date().toLocaleString('hu-HU');
  }
});