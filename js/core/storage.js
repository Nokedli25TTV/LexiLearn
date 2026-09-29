// LexiLearn – core/storage.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { DEKIRU_LESSONS, JAPANESE_WORDS, KANJI_DATA, MY_CUSTOM_LISTS, SAMPLE_WORDS } from './data.js';
import { appData, createEmptyState, currentMode } from './state.js';
import { renderHome } from '../habit/home.js';
import { renderDashboard } from '../library/list.js';
import { setMode } from '../ui/screens.js';
import { seedMissing } from '../srs/schedule.js';
import { applyTheme } from '../ui/theme.js';

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
  seedSrsAll();
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

// V13.5: a már tanult, de még ütemezés nélküli szavak beosztása (az SRS bevezetésekor egyszer,
// utána csak ha pl. régi eszközről szinkronizált szó érkezik)
function seedSrsAll() {
  let n = 0;
  ['english', 'japanese', 'kanji'].forEach(lang => { n += seedMissing(appData[lang].words); });
  if (n > 0) { console.log(`[LexiLearn] Ismétlésütemezés: ${n} tanult szó beosztva.`); saveWords(); }
  return n;
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
  // V13.3: eval helyett a data-registry.js által összegyűjtött leckék
  const DEKIRU_WORDS = DEKIRU_LESSONS.flat();

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

export { UI_VERSION, _applyParsedData, _buildSaveObjects, _migrateMonolithToSplit, cleanTags, loadState, migrateToStableIds, renderStorageInfo, savePlaylists, saveSettings, saveState, saveStats, saveWords, stableWordId, syncCustomLists, syncNewWords, seedSrsAll };
