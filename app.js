/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] App.js V10.5 (Split-DB + PWA Upgrade) indítása...");

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
      .heatmap-grid { display: flex; flex-wrap: wrap; gap: 6px; }
      .heatmap-cell { width: 42px; height: 42px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.4); cursor: help; transition: transform 0.2s; }
      .heatmap-cell:hover { transform: scale(1.15); box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2; }
      .heatmap-cell.empty { color: var(--text-3); text-shadow: none; }
    `;
    document.head.appendChild(style);
  }
}
initV6Features();

/* ══════════════════════════════════════════════════════
   SÖTÉT MÓD LOGIKA
══════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const moon = document.getElementById('icon-moon');
  const sun = document.getElementById('icon-sun');
  if (moon && sun) {
    moon.style.display = theme === 'dark' ? 'none' : 'block';
    sun.style.display = theme === 'dark' ? 'block' : 'none';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  saveSettings(); // Csak a beállításokat kell menteni, nem a teljes DB-t
}

/* ══════════════════════════════════════════════════════
   TAG EMOJI MAP
══════════════════════════════════════════════════════ */
const TAG_EMOJIS = {
  'gyümölcs': '🍎', 'állatok': '🐾', 'háziállatok': '🐶',
  'közlekedés': '🚗', 'utazás': '🧳', 'otthon': '🏠', 'munka': '💼',
  'egészség': '🧪', 'iskola': '🎒', 'érzelmek': '💛', 'haladó': '🎓',
  'fantázia': '🐉', 'nyomozás': '🔎', 'vallás': '🙏', 'politika': '🏛️', 'gazdaság': '📈',
  'tudomány': '🔬', 'pszichológia': '🧠', 'mindennapi élet': '☕', 'hadászat': '⚔️',
  'történelem': '📜', 'mitológia': '🏺', 'kommunikáció': '💬', 'földrajz': '🌍',
  'veszély': '⚠️', 'kultúra': '🎭', 'erőforrások': '💎', 'tárgyak': '📦',
  'család': '👪', 'filozófia': '🦉', 'filozofia': '🦉', 'képesség': '⚡', 'művészet': '🎨', 
  'technológia': '💻', 'társadalom': '🏙️',
  'alapszavak': '⭐', 'udvariasság': '🙇', 'köszönések': '👋', 'szórakozás': '🎭', 'kapcsolatok': '👪',
  'helyek': '🏙️', 'időjárás': '🌤️', 'országok': '🌍', 'sport': '🏅', 
  'ételek': '🍱', 'italok': '🍵', 'kérdőszavak': '❓', 'számlálószavak': '🔢', 'irányok': '🧭',
  'természet': '🌿',
  // Kanji témák
  'számok és mennyiségek': '🔢', 'idő és dátum': '📅',
  'emberi test és egészség': '🫀', 'melléknevek kanjival': '✨',
  'igék kanji alakban': '🏃', 'épületek és város': '🏯',
  'növények': '🌸', 'nevek': '🏮'
};

function tagLabel(tag) {
  const t = tag.toLowerCase().trim();
  if (t.startsWith('lesson')) return '📖 ' + tag; 
  let emoji = TAG_EMOJIS[t];
  if (!emoji) emoji = '🏷️'; 
  return emoji + ' ' + tag;
}

function getEmojisForTags(tags) {
  if (!tags || tags.length === 0) return '';
  const emojis = tags.map(t => {
    const clean = t.toLowerCase().trim();
    if (clean.startsWith('lesson')) return '📖';
    return TAG_EMOJIS[clean] || '🏷️';
  });
  return [...new Set(emojis)].join(''); 
}

/* ══════════════════════════════════════════════════════
   MULTI-LANGUAGE ÁLLAPOTTÉR & KÜLDETÉSEK
══════════════════════════════════════════════════════ */
function createEmptyState() {
  return {
    words: [], playlists: [], selectedIds: new Set(),
    filters: { search: '', topicSearch: '', tags: [], diff: new Set(), lesson: 'all', sort: 'az', list: 'all' },
    direction: 'en-hu', activeViewTab: 'words',
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

let currentMode = 'english'; 
let state = appData[currentMode]; 

function diffOrder(d) {
  const map = {B1:1, B2:2, C1:3, C2:4, N5:1, N4:2, N3:3, N2:4, N1:5};
  return map[d] ?? 0;
}

/* ══════════════════════════════════════════════════════
   STORAGE & INIT  –  V10.5 SPLIT-DB ARCHITEKTÚRA
   4 külön IndexedDB kulcs a gyors, célzott mentésekhez:
     lexi_words     → szótár (csak ritkán változik)
     lexi_stats     → pontszámok, streakek, küldetések
     lexi_playlists → saját listák
     lexi_settings  → mód, téma, szűrők, irányok
══════════════════════════════════════════════════════ */

// ── Belső segéd: aktuális állapot → 4 mentési objektum ──────────
function _buildSaveObjects() {
  const words = {}, stats = {}, playlists = {}, settings = { lastMode: currentMode, theme: document.documentElement.getAttribute('data-theme') || 'light' };
  ['english', 'japanese', 'kanji'].forEach(lang => {
    words[lang]     = appData[lang].words;
    stats[lang]     = { globalStats: appData[lang].globalStats, dailyQuests: appData[lang].dailyQuests };
    playlists[lang] = appData[lang].playlists;
    settings[lang]  = {
      direction:   appData[lang].direction,
      filters:     { ...appData[lang].filters, diff: Array.from(appData[lang].filters.diff) },
      selectedIds: Array.from(appData[lang].selectedIds)
    };
  });
  return { words, stats, playlists, settings };
}

// ── Célzott mentő függvények (processzorkímélő) ──────────────────
async function saveWords()     { try { const {words}     = _buildSaveObjects(); await localforage.setItem('lexi_words',     words);     } catch(e) { console.warn('[LexiLearn] saveWords hiba:', e); } }
async function saveStats()     { try { const {stats}     = _buildSaveObjects(); await localforage.setItem('lexi_stats',     stats);     } catch(e) { console.warn('[LexiLearn] saveStats hiba:', e); } }
async function savePlaylists() { try { const {playlists} = _buildSaveObjects(); await localforage.setItem('lexi_playlists', playlists); } catch(e) { console.warn('[LexiLearn] savePlaylists hiba:', e); } }
async function saveSettings()  { try { const {settings}  = _buildSaveObjects(); await localforage.setItem('lexi_settings',  settings);  } catch(e) { console.warn('[LexiLearn] saveSettings hiba:', e); } }

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
        appData[lang].filters = settings[lang].filters;
        appData[lang].filters.diff = new Set(settings[lang].filters.diff || []);
      }
      if (settings[lang].selectedIds) {
        appData[lang].selectedIds = new Set(settings[lang].selectedIds);
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
  let savedTheme = 'light';

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
      savedTheme = lexiSettings?.theme    || 'light';
      _applyParsedData(lexiWords, lexiStats, lexiPlaylists, lexiSettings);
    }

    syncNewWords();
    syncCustomLists();
  } catch(e) {
    console.warn('[LexiLearn] Betöltési hiba:', e);
    syncNewWords();
    syncCustomLists();
  }

  cleanTags();
  applyTheme(savedTheme);
  setMode(savedMode, true);
  updateDirectionUI();
  renderDashboard();
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
            <span>💾 IndexedDB foglalás</span>
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
        id: 'en_' + i, en: w.en, hu: w.hu, tags: w.tags, diff: w.diff || 'B2', syn: w.syn || '', sentence: w.sentence || '',
        source: 'data_js',
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
        } else {
          appData.english.words.push({
            id: 'en_new_' + i + '_' + Date.now(),
            en: srcWord.en, hu: srcWord.hu, tags: srcWord.tags,
            diff: srcWord.diff || 'B2', syn: srcWord.syn || '', sentence: srcWord.sentence || '',
            source: 'data_js',
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
        id: 'ja_dek_' + i + '_' + Date.now(),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5',
        lesson: lessonVal, source: 'dekiru', sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.lesson = lessonVal;
      existingWord.source = 'dekiru';
      existingWord.hu = w.hu; // Frissítjük a fordítást is
    }
  });

  JAPANESE_WORDS.forEach((w, i) => {
    let existingWord = appData.japanese.words.find(x => x.en === w.kana);
    if (!existingWord) {
      appData.japanese.words.push({
        id: 'ja_' + i + '_' + Date.now(),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5',
        source: 'data_js', sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.hu = w.hu;
      existingWord.source = 'data_js';
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
        id: 'kj_' + i + '_' + Date.now(),
        en: w.kanji, hu: w.meaning, romaji: w.romaji, onyomi: w.onyomi, kunyomi: w.kunyomi,
        tags: w.tags || [], lesson: w.lesson, diff: w.jlpt || 'N5',
        source: 'data_js', sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    } else {
      existingWord.hu = w.meaning;
      existingWord.lesson = w.lesson;
      existingWord.tags = w.tags || []; // tags szinkronizálása az adatbázisból
      existingWord.source = 'data_js';
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
      icon: list.icon || '📋',
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

  const isJp = mode !== 'english';
  const diffListEn = document.getElementById('diff-filter-list-en');
  const diffListJp = document.getElementById('diff-filter-list-jp');
  if (diffListEn) diffListEn.style.display = isJp ? 'none' : 'flex';
  if (diffListJp) diffListJp.style.display = isJp ? 'flex' : 'none';
  
  if (mode === 'kanji' || mode === 'japanese') {
    const lessons = new Set(state.words.map(w => w.lesson).filter(l => l !== undefined && l !== null && l !== ''));
    const sel = document.getElementById('lesson-select');
    const group = document.getElementById('lesson-filter-group');
    const prefix = mode === 'kanji' ? 'Kanji' : 'Dekiru';
    
    if (lessons.size > 0 && sel && group) {
      group.style.display = 'block';
      sel.innerHTML = '<option value="all">Minden Lecke</option>' + 
        Array.from(lessons).sort((a,b)=>a-b).map(l => `<option value="${l}">${prefix} Lecke ${l}</option>`).join('');
    } else if (group) {
      group.style.display = 'none';
    }
  } else {
    const group = document.getElementById('lesson-filter-group');
    if (group) group.style.display = 'none';
  }

  const gb = '<img src="https://flagcdn.com/w20/gb.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const hu = '<img src="https://flagcdn.com/w20/hu.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const jp = '<img src="https://flagcdn.com/w20/jp.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const kj = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-bottom:2px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';

  const dir1 = document.getElementById('lbl-dir-1');
  const dir2 = document.getElementById('lbl-dir-2');
  if (mode === 'english') {
    if (dir1) dir1.innerHTML = `${gb} &rarr; ${hu}`;
    if (dir2) dir2.innerHTML = `${hu} &rarr; ${gb}`;
  } else if (mode === 'japanese') {
    if (dir1) dir1.innerHTML = `${jp} Kana &rarr; ${hu}`;
    if (dir2) dir2.innerHTML = `${hu} &rarr; ${jp} Kana`;
  } else {
    if (dir1) dir1.innerHTML = `${kj} Kanji &rarr; ${hu}`;
    if (dir2) dir2.innerHTML = `${hu} &rarr; ${kj} Kanji`;
  }

  const streakLabels = { 'english': 'Angol', 'japanese': 'Japán', 'kanji': 'Kandzsi' };
  const lblStreak = document.getElementById('lbl-streak');
  if (lblStreak) lblStreak.innerText = `${streakLabels[mode]} streak (nap)`;

  const searchInput = document.getElementById('search-input');
  const topicSearch = document.getElementById('topic-search');
  const sortSelect = document.getElementById('sort-select');
  const lessonSelect = document.getElementById('lesson-select');
  
  if (searchInput) searchInput.value = state.filters.search || '';
  if (topicSearch) topicSearch.value = state.filters.topicSearch || '';
  if (sortSelect) sortSelect.value = state.filters.sort || 'az';
  if ((mode === 'kanji' || mode === 'japanese') && lessonSelect) {
    lessonSelect.value = state.filters.lesson || 'all';
  }
  
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', state.filters.diff.has(b.dataset.diff));
  });

  if (!isInit) {
    saveSettings(); // Módváltás csak beállítást érint
    updateDirectionUI();
    renderDashboard();
  }
}

/* ══════════════════════════════════════════════════════
   STREAK, ACTIVITY ÉS KÜLDETÉSEK
══════════════════════════════════════════════════════ */
function todayKey() { return new Date().toISOString().split('T')[0]; }

function calcStreak() {
  const studyDays = state.globalStats.studyDays || {};
  let streak = 0;
  const checkDate = new Date();
  if (!studyDays[checkDate.toISOString().split('T')[0]]) checkDate.setDate(checkDate.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = checkDate.toISOString().split('T')[0];
    if (studyDays[key]) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else break;
  }
  return streak;
}

function getWeekDays() {
  const studyDays = state.globalStats.studyDays || {};
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  const labels = ['H','K','Sz','Cs','P','Szo','V'];
  return labels.map((label, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    return { label, studied: !!studyDays[key], isToday: key === todayStr };
  });
}

/* ══════════════════════════════════════════════════════
   V8: DAILY QUEST ENGINE 2.0
══════════════════════════════════════════════════════ */

const QUEST_STYLES = {
  LearnWords:     { icon: '📚', color: '#2d6a4f', bg: '#d8f3dc' },
  PerfectRound:   { icon: '⭐', color: '#e0a800', bg: '#fff8dc' },
  PracticeTime:   { icon: '⏱️', color: '#1a73e8', bg: '#e3f0ff' },
  GhostHunter:    { icon: '👻', color: '#7b2d8b', bg: '#f3e5f5' },
  StrictPerfect:  { icon: '🎯', color: '#b5272a', bg: '#fde8e8' },
  Speed5in30:     { icon: '⚡', color: '#e76f51', bg: '#fceae4' },
  TagMaster:      { icon: '🏷️', color: '#0277bd', bg: '#e3f2fd' },
  MistakeCleanup: { icon: '🔧', color: '#5a5470', bg: '#ede7f6' },
  DailyWord:      { icon: '💡', color: '#f57f17', bg: '#fff9c4' },
  Combo5:         { icon: '🔥', color: '#e76f51', bg: '#fceae4' },
  KanaMaster:     { icon: '🇯🇵', color: '#c62828', bg: '#ffcdd2' },
  KanjiMaster:    { icon: '⛩️', color: '#4a148c', bg: '#ede7f6' },
};

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
      label: `Vadássz ${ghostTarget} szellemszóra`, params: { ghostIds: ghostWords.map(w => w.id) } });
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
    const style = QUEST_STYLES[quest.type] || { icon: '🏷️', color: '#5a5470', bg: '#f0ede6' };
    const done = quest.completed;
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
      ? `<span class="quest-daily-word">${quest.params.wordEn} = ${quest.params.wordHu}</span>`
      : '';

    // TagMaster badge
    const tagBadge = quest.type === 'TagMaster' && !done
      ? `<span class="quest-tag-badge" style="background:${style.bg};color:${style.color}">🏷️ ${quest.params.tag}</span>`
      : '';

    return `
      <div class="quest-item ${done ? 'completed' : ''}" style="border-left: 3px solid ${style.color}">
        <div class="quest-info">
          <span class="quest-title">
            <span style="margin-right:5px">${style.icon}</span>${quest.label}
          </span>
          <span class="quest-prog" style="color:${done ? 'var(--success)' : style.color}">${done ? '✓' : progressText}</span>
        </div>
        ${extraBadge}${tagBadge}
        <div class="quest-bar-bg">
          <div class="quest-bar-fill" style="width:${pct}%; background:${style.color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   SCREEN MANAGEMENT & DASHBOARD
══════════════════════════════════════════════════════ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const map = {dashboard:'screen-dashboard',practice:'screen-practice',roundend:'screen-round-end',stats:'screen-stats'};
  const target = document.getElementById(map[name] || 'screen-dashboard');
  if (target) target.classList.add('active');
  
  if (name === 'dashboard') renderDashboard();
  if (name === 'stats') renderStats();
}

function renderDashboard() {
  renderPlaylists(); 
  renderTagFilters();
  applyFilters(); 
  updateStartPanel();
  updateDirectionUI();
  renderSidebar();
  renderDailyQuests();
}

function renderSidebar() {
  const words = state.words;
  const streak = calcStreak();
  if (streak > (state.globalStats.recordStreak || 0)) state.globalStats.recordStreak = streak;

  const totalAttempts = words.reduce((s,w)=>s+w.stats.totalCorrect+w.stats.totalWrong,0);
  const totalCorrect  = words.reduce((s,w)=>s+w.stats.totalCorrect,0);
  
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  
  setEl('ms-streak', streak);
  setEl('ms-record', state.globalStats.recordStreak || 0);
  setEl('ms-avg', totalAttempts > 0 ? Math.round(totalCorrect/totalAttempts*100)+'%' : '—');
  setEl('ms-learned', words.filter(w=>w.stats.streak>=3).length);
  setEl('ms-last-topic', state.globalStats.lastStudiedTopic ? tagLabel(state.globalStats.lastStudiedTopic) : '—');
  
  const mostWrong = [...words].sort((a,b)=>b.stats.totalWrong-a.stats.totalWrong).find(w=>w.stats.totalWrong>0);
  setEl('ms-worst', mostWrong ? mostWrong.en : '—');

  const days = getWeekDays();
  const weekTracker = document.getElementById('week-tracker');
  if (weekTracker) {
    weekTracker.innerHTML = days.map(d => {
      let cls, icon;
      if (d.isToday && d.studied)  { cls='today-studied'; icon='✔'; }
      else if (d.isToday)          { cls='today-not';     icon='○'; }
      else if (d.studied)          { cls='studied';       icon='✔'; }
      else                         { cls='not-studied';   icon='○'; }
      return `<div class="week-day"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}">${icon}</div></div>`;
    }).join('');
  }
  setEl('streak-big', streak + ' 🔥');
}

function renderTagFilters() {
  const tags = new Set();
  state.words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const container = document.getElementById('tag-filter-list');
  if (!container) return;
  
  const searchInput = document.getElementById('topic-search');
  const q = (searchInput?.value || '').toLowerCase().trim();
  container.innerHTML = '';
  
  ['Összes', ...Array.from(tags).sort()].forEach(tag => {
    if (q && tag !== 'Összes' && !tag.toLowerCase().includes(q)) return;
    const isAll = tag === 'Összes';
    const active = isAll ? state.filters.tags.length === 0 : state.filters.tags.includes(tag);
    const btn = document.createElement('button');
    btn.className = 'tag-btn' + (active ? ' active' : '');
    btn.textContent = isAll ? '🌐 Összes' : tagLabel(tag);
    btn.onclick = () => toggleTag(tag);
    container.appendChild(btn);
  });
}

function filterTopicSearch() { renderTagFilters(); }

function toggleTag(tag) {
  if (tag === 'Összes') state.filters.tags = [];
  else {
    const idx = state.filters.tags.indexOf(tag);
    if (idx >= 0) state.filters.tags.splice(idx, 1); else state.filters.tags.push(tag);
  }
  renderTagFilters(); applyFilters();
}

function toggleDiff(d) {
  if (state.filters.diff.has(d)) state.filters.diff.delete(d); else state.filters.diff.add(d);
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', state.filters.diff.has(b.dataset.diff)));
  applyFilters();
}

function setSort(s) { state.filters.sort = s; applyFilters(); }

function setDirection(dir) { state.direction = dir; updateDirectionUI(); saveSettings(); }

function updateDirectionUI() {
  const dir1 = document.getElementById('dir-en-hu');
  const dir2 = document.getElementById('dir-hu-en');
  if (dir1) dir1.classList.toggle('active', state.direction === 'en-hu');
  if (dir2) dir2.classList.toggle('active', state.direction === 'hu-en');
}

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const topicSearch = document.getElementById('topic-search');
  const lessonSelect = document.getElementById('lesson-select');

  state.filters.search = searchInput ? searchInput.value.toLowerCase().trim() : '';
  state.filters.topicSearch = topicSearch ? topicSearch.value.toLowerCase().trim() : '';
  
  if ((currentMode === 'kanji' || currentMode === 'japanese') && lessonSelect) {
    state.filters.lesson = lessonSelect.value;
  }

  let filtered = state.words.filter(w => {
    if (state.filters.search) {
      const s = state.filters.search;
      const matchEn = w.en.toLowerCase().includes(s);
      const matchHu = w.hu.toLowerCase().includes(s);
      const matchRomaji = w.romaji ? w.romaji.toLowerCase().includes(s) : false;
      const matchOnyomi = w.onyomi ? w.onyomi.toLowerCase().includes(s) : false;
      const matchKunyomi = w.kunyomi ? w.kunyomi.toLowerCase().includes(s) : false;
      if (!matchEn && !matchHu && !matchRomaji && !matchOnyomi && !matchKunyomi) return false;
    }
    if (state.filters.tags.length > 0 && !state.filters.tags.some(t => w.tags.includes(t))) return false;
    if (state.filters.diff.size > 0 && !state.filters.diff.has(w.diff)) return false;
    if ((currentMode === 'kanji' || currentMode === 'japanese') && state.filters.lesson !== 'all' && w.lesson != state.filters.lesson) return false;
    
    // Lista (playlist) szerinti szűrés – FIX #4
    // Hiba volt: w.lists-et vizsgált, ami soha nincs a szavakon.
    // Javítva: a playlist wordIds tömbben keresi az adott szót.
    if (state.filters.list && state.filters.list !== 'all') {
      const pl = state.playlists ? state.playlists.find(p => p.id === state.filters.list) : null;
      if (!pl || !pl.wordIds.includes(w.id)) return false;
    }

    return true;
  });

  const sort = state.filters.sort;
  if      (sort === 'az')         filtered.sort((a,b) => a.en.localeCompare(b.en));
  else if (sort === 'za')         filtered.sort((a,b) => b.en.localeCompare(a.en));
  else if (sort === 'diff-asc')   filtered.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (sort === 'diff-desc')  filtered.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));
  else if (sort === 'unlearned')  filtered.sort((a,b) => a.stats.streak - b.stats.streak);
  else if (sort === 'mastered')   filtered.sort((a,b) => b.stats.streak - a.stats.streak);

  const wordCountLabel = document.getElementById('word-count-label');
  if (wordCountLabel) {
    wordCountLabel.innerHTML = `Szólista <span style="color:var(--text-3);font-weight:500;text-transform:none;letter-spacing:0;font-size:12px;margin-left:4px">(${filtered.length} elem)</span>`;
  }
  
  renderWordList(filtered);
  renderSentenceList(filtered);
  saveSettings(); // Szűrő változás csak beállítást érint 
}

function renderWordList(words) {
  const container = document.getElementById('word-list');
  if (!container) return;
  if (words.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3)">Nincs találat.</div>'; return; }
  
  container.innerHTML = words.map(w => {
    const selected = state.selectedIds.has(w.id);
    const pct = w.stats.totalCorrect+w.stats.totalWrong>0 ? Math.round(w.stats.totalCorrect/(w.stats.totalCorrect+w.stats.totalWrong)*100) : null;
    let subText = w.hu;
    if(currentMode === 'kanji') subText = `${w.hu} | ${w.onyomi} / ${w.kunyomi}`;

    return `
      <div class="word-item ${selected?'selected':''}" data-id="${w.id}" onclick="toggleWordSelection('${w.id}')">
        <div class="word-checkbox">${selected?'✓':''}</div>
        <div class="word-info"><div class="word-en">${escHtml(w.en)}</div><div class="word-hu" style="font-size:10px">${escHtml(subText)}</div></div>
        <div class="word-meta">
          ${w.stats.streak > 0 ? `<span class="word-streak">🔥${w.stats.streak}</span>` : ''}
          ${pct !== null ? `<span class="word-streak">${pct}%</span>` : ''}
          <span style="font-size:13px; margin-right:2px;" title="${w.tags.join(', ')}">${getEmojisForTags(w.tags)}</span>
          <div class="diff-pill d${w.diff}" title="${w.diff}">${w.diff}</div>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   OKOS MONDAT SZÍNEZŐ (V6.7 ÚJDONSÁG)
══════════════════════════════════════════════════════ */
function renderSentenceList(words) {
  const container = document.getElementById('sentence-list');
  if (!container) return;
  if (words.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3)">Nincs találat.</div>'; return; }
  
  // Kigyűjtjük az összes ismert japán szót a kék színezéshez, hossz szerint csökkenőben (hogy a hosszabbakat találja meg előbb)
  let otherKnownWords = [];
  if (currentMode !== 'english') {
    otherKnownWords = appData.japanese.words.concat(appData.kanji.words)
      .map(w => w.en)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
  }

  container.innerHTML = words.map(w => {
    if (currentMode === 'english') {
      const enSentences = typeof english_sentences2 !== 'undefined'
        ? english_sentences2.filter(s => s.baseWord === w.en)
        : [];

      if (enSentences.length === 0) {
        // Ha nincs adat, egyszerű kártya a szó saját sentence mezőjével
        let displayed = w.sentence
          ? escHtml(w.sentence).replace(new RegExp('\\b(' + escRegex(w.en) + ')\\b', 'gi'), m => `<span style="color:#4CAF50;font-weight:bold;">${m}</span>`)
          : `<em style="color:var(--text-3)">Nincs még példamondat ehhez a szóhoz: ${escHtml(w.en)}</em>`;
        return `
          <div class="sentence-card">
            <div class="sc-sentence" style="font-size:1.05em; line-height:1.5;">${displayed}</div>
            <div class="sc-bottom" style="margin-top:10px;"><span class="sc-hu">${escHtml(w.hu)}</span><div style="display:flex;gap:6px"><span class="diff-pill d${w.diff}">${w.diff}</span><span class="sc-tags">${escHtml(w.tags.map(tagLabel).join(', '))}</span></div></div>
          </div>`;
      }

      // Mondatok renderelése – ugyanolyan stílusban mint a japán
      const sHtml = enSentences.map(s => {
        // A fullSentenceHTML-ben <strong>szó</strong> van – azt kicseréljük zöld spanre
        let highlightedHTML = s.fullSentenceHTML.replace(
          /<strong>(.*?)<\/strong>/g,
          `<span style="color:#4CAF50;font-weight:bold;">$1</span>`
        );
        return `
          <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border);">
            <div style="font-size:1.1em; margin-bottom:6px; line-height:1.5;">${highlightedHTML}</div>
            <div style="font-size:0.9em; color:var(--text-2); font-style:italic;">${escHtml(s.hungarian)}</div>
          </div>`;
      }).join('');

      return `
        <div class="sentence-card" style="border-left:4px solid #4CAF50;">
          <div style="font-weight:bold; font-size:1.2em; display:flex; justify-content:space-between;">
            <span>${escHtml(w.en)}</span>
            <span style="font-size:0.7em; font-weight:normal; color:var(--text-3); background:var(--surface-2); padding:2px 6px; border-radius:4px;">${enSentences.length} mondat</span>
          </div>
          ${sHtml}
          <div class="sc-bottom" style="margin-top:12px;"><span class="sc-hu" style="font-weight:bold;">${escHtml(w.hu)}</span><div style="display:flex;gap:6px"><span class="diff-pill d${w.diff}">${w.diff}</span><span class="sc-tags">${escHtml(w.tags.map(tagLabel).join(', '))}</span></div></div>
        </div>`;
    } else {
      // JAPÁN MÓD: Végigmegyünk az adatbázison
      const sentences = typeof JAPANESE_SENTENCES !== 'undefined' ? JAPANESE_SENTENCES.filter(s => s.baseWord === w.en) : [];

      if (sentences.length === 0) {
        return `
          <div class="sentence-card">
            <div class="sc-sentence" style="color:var(--text-3); font-size: 0.9em;"><em>Nincs még példamondat ehhez a szóhoz: ${escHtml(w.en)}</em></div>
            <div class="sc-bottom" style="margin-top:10px;"><span class="sc-hu">${escHtml(w.hu)}</span><div style="display:flex;gap:6px"><span class="diff-pill d${w.diff}">${w.diff}</span><span class="sc-tags">${escHtml(w.tags.map(tagLabel).join(', '))}</span></div></div>
          </div>`;
      }

      const sHtml = sentences.map(s => {
        let highlightedHTML = s.fullSentenceHTML;

        // Fő szó kiemelése zöldre
        if (s.correctAnswer) {
          const baseWordRegex = new RegExp(`(${escRegex(s.correctAnswer)})`, 'g');
          highlightedHTML = highlightedHTML.replace(baseWordRegex, `<span style="color: #4CAF50; font-weight: bold;">$1</span>`);
        }

        // Többi ismert szó kiemelése kékre
        const filteredKnownWords = otherKnownWords.filter(kw => kw !== w.en && kw !== s.correctAnswer);
        filteredKnownWords.forEach(knownWord => {
          if (highlightedHTML.includes(knownWord)) {
            const knownRegex = new RegExp(`(?![^<]*>)${escRegex(knownWord)}`, 'g');
            highlightedHTML = highlightedHTML.replace(knownRegex, `<span style="color: #2196F3; cursor: help;" title="Ismert szó a szótárból">${knownWord}</span>`);
          }
        });

        return `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border);">
            <div style="font-size: 1.1em; margin-bottom: 6px; line-height: 1.5;">${highlightedHTML}</div>
            <div style="font-size: 0.9em; color: var(--text-2); font-style: italic;">${escHtml(s.hungarian)}</div>
          </div>`;
      }).join('');

      return `
        <div class="sentence-card" style="border-left: 4px solid #4CAF50;">
          <div style="font-weight:bold; font-size:1.2em; display:flex; justify-content:space-between;">
            <span>${escHtml(w.en)}</span>
            <span style="font-size:0.7em; font-weight:normal; color:var(--text-3); background:var(--surface-2); padding: 2px 6px; border-radius: 4px;">${sentences.length} mondat</span>
          </div>
          <div style="color:var(--primary); font-size: 0.9em; margin-bottom: 8px;">${escHtml(w.romaji || '')}</div>
          ${sHtml}
          <div class="sc-bottom" style="margin-top:12px;"><span class="sc-hu" style="font-weight:bold;">${escHtml(w.hu)}</span><div style="display:flex;gap:6px"><span class="diff-pill d${w.diff}">${w.diff}</span><span class="sc-tags">${escHtml(w.tags.map(tagLabel).join(', '))}</span></div></div>
        </div>`;
    }
  }).join('');
}

function switchViewTab(tab) {
  state.activeViewTab = tab;
  const v1 = document.getElementById('vtab-words');
  const v2 = document.getElementById('vtab-sentences');
  if(v1) v1.classList.toggle('active', tab === 'words');
  if(v2) v2.classList.toggle('active', tab === 'sentences');
  
  const wView = document.getElementById('word-list-view');
  const sView = document.getElementById('sentence-list-view');
  if(wView) wView.style.display = tab === 'words' ? '' : 'none';
  if(sView) sView.style.display = tab === 'sentences' ? '' : 'none';
}

function toggleWordSelection(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
  const el = document.querySelector(`.word-item[data-id="${id}"]`);
  if (el) {
    const sel = state.selectedIds.has(id);
    el.classList.toggle('selected', sel);
    const cb = el.querySelector('.word-checkbox');
    if (cb) cb.textContent = sel ? '✓' : '';
  }
  updateStartPanel();
  saveSettings(); // Tag szűrő 
}

function selectAll() { 
  document.querySelectorAll('.word-item[data-id]').forEach(el=>{ 
    state.selectedIds.add(el.dataset.id); 
    el.classList.add('selected'); 
    const cb = el.querySelector('.word-checkbox');
    if(cb) cb.textContent = '✓'; 
  }); 
  updateStartPanel(); 
  saveSettings(); // Diff szűrő 
}

function selectNone() { 
  state.selectedIds.clear(); 
  document.querySelectorAll('.word-item.selected').forEach(el=>{ 
    el.classList.remove('selected'); 
    const cb = el.querySelector('.word-checkbox');
    if(cb) cb.textContent = ''; 
  }); 
  updateStartPanel(); 
  saveSettings(); // Sort szűrő 
}

function updateStartPanel() {
  const cnt = state.selectedIds.size;
  const bigCnt = document.getElementById('selected-count-big');
  const startBtn = document.getElementById('start-btn');
  const saveBtn = document.getElementById('btn-save-list');
  
  if(bigCnt) bigCnt.textContent = cnt;
  if(startBtn) startBtn.disabled = cnt === 0;
  if(saveBtn) saveBtn.disabled = cnt === 0;
}

/* ══════════════════════════════════════════════════════
   SAJÁT LISTÁK
══════════════════════════════════════════════════════ */
function renderPlaylists() {
  const cont = document.getElementById('playlists-container');
  if (!cont) return;

  if (!state.playlists || state.playlists.length === 0) {
    cont.innerHTML = '<div class="empty-lists">Még nincsenek elmentett listáid ebben a nyelvben.<br><small style="color:var(--text-3)">Jelölj ki szavakat, majd kattints a 💾 Mentés gombra.</small></div>';
    return;
  }

  // Szétválasztjuk: data.js-ből jövők és kézzel mentett listák
  const fileLists   = state.playlists.filter(p => p.source === 'data_js');
  const savedLists  = state.playlists.filter(p => p.source !== 'data_js');

  function renderCard(p) {
    const isFromFile = p.source === 'data_js';
    const isActive   = state.filters.list === p.id;
    const icon       = isFromFile ? (p.icon || '📋') : '📁';

    const plWordsHTML = p.wordIds.map(id => {
      const w = state.words.find(x => x.id === id);
      return w ? `<b>${escHtml(w.en)}</b> – ${escHtml(w.hu)}` : '';
    }).filter(Boolean).join('<br>');

    const actionBtns = isFromFile
      ? /* Fájlból jövő: csak szűrés + kijelölés, nincs törlés */ `
          <button class="btn btn-primary" onclick="filterByPlaylist('${p.id}')">🔍 Szűrés</button>
          <button class="btn btn-outline" onclick="loadPlaylist('${p.id}')" title="Lista szavait hozzáadja a kijelöléshez">✔ Kijelöl</button>
        `
      : /* Kézzel mentett: összes gomb */ `
          <button class="btn btn-primary" onclick="filterByPlaylist('${p.id}')">🔍 Szűrés</button>
          <button class="btn btn-outline" onclick="expandPlaylist('${p.id}')" title="Kijelölt szavak hozzáadása">➕ Bővítés</button>
          <button class="btn btn-outline" onclick="loadPlaylist('${p.id}')" title="Szavak kijelölése">✔ Kijelöl</button>
          <button class="btn btn-outline" style="color:var(--error);border-color:var(--error-bg);" onclick="deletePlaylist('${p.id}')">🗑</button>
        `;

    return `
      <div class="playlist-card-item${isActive ? ' playlist-active' : ''}${isFromFile ? ' playlist-from-file' : ''}">
        <div class="playlist-header" onclick="togglePlaylist('${p.id}')">
          <div style="display:flex;align-items:center;gap:6px;">
            ${icon} ${escHtml(p.name)}
            <span style="color:var(--text-3);font-size:11px">(${p.wordIds.length} szó)</span>
            ${isFromFile ? '<span style="font-size:10px;background:var(--primary-dim);color:var(--primary);padding:1px 6px;border-radius:10px;border:1px solid var(--primary-light)">data.js</span>' : ''}
            ${isActive ? '<span style="font-size:10px;background:var(--primary);color:#fff;padding:1px 6px;border-radius:10px;">aktív</span>' : ''}
          </div>
          <div class="pl-chevron" id="chevron-${p.id}">▼</div>
        </div>
        <div class="playlist-body" id="body-${p.id}">
          <div class="playlist-word-list">${plWordsHTML || '<em style="color:var(--text-3)">Üres lista</em>'}</div>
          <div class="playlist-actions-row">${actionBtns}</div>
        </div>
      </div>
    `;
  }

  let html = '';

  if (fileLists.length > 0) {
    html += `<div class="playlist-section-label">📄 Saját listák (data.js)</div>`;
    html += fileLists.map(renderCard).join('');
  }

  if (savedLists.length > 0) {
    html += `<div class="playlist-section-label" style="margin-top:10px;">💾 Elmentett listák</div>`;
    html += savedLists.map(renderCard).join('');
  }

  cont.innerHTML = html;
}

function togglePlaylist(id) {
  const body = document.getElementById('body-' + id);
  const chevron = document.getElementById('chevron-' + id);
  if (!body || !chevron) return;
  if (body.classList.contains('open')) {
    body.classList.remove('open'); chevron.classList.remove('open');
  } else {
    document.querySelectorAll('.playlist-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.pl-chevron').forEach(c => c.classList.remove('open'));
    body.classList.add('open'); chevron.classList.add('open');
  }
}

function openPlaylistModal() {
  if (state.selectedIds.size === 0) return;
  const input = document.getElementById('playlist-name-input');
  const modal = document.getElementById('playlist-modal');
  if(input) input.value = '';
  if(modal) modal.classList.add('open');
}

function savePlaylist() {
  const input = document.getElementById('playlist-name-input');
  if(!input) return;
  const name = input.value.trim();
  if (!name) { showToast('Kérlek adj meg egy nevet a listának!'); return; }
  if (!state.playlists) state.playlists = [];
  const isDuplicate = state.playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (isDuplicate) { showToast('Már létezik ilyen nevű lista!'); return; }

  state.playlists.push({ id: 'pl_' + Date.now(), name: name, wordIds: Array.from(state.selectedIds) });
  savePlaylists(); closeModal('playlist-modal'); renderPlaylists(); showToast('✅ Lista sikeresen elmentve: ' + name);
}

function loadPlaylist(id) {
  const pl = state.playlists.find(p => p.id === id);
  if (!pl) return;
  pl.wordIds.forEach(wId => state.selectedIds.add(wId));
  
  const searchInput = document.getElementById('search-input');
  const topicSearch = document.getElementById('topic-search');
  const lessonSelect = document.getElementById('lesson-select');
  if(searchInput) searchInput.value = '';
  if(topicSearch) topicSearch.value = '';
  if (lessonSelect) lessonSelect.value = 'all';
  
  state.filters.search = ''; state.filters.topicSearch = ''; state.filters.tags = []; state.filters.diff = new Set(); state.filters.lesson = 'all';
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  
  applyFilters(); updateStartPanel(); saveSettings(); // Lista betöltés: selectedIds+filters változik showToast('📂 ' + pl.name + ' szavai kijelölve!');
}

/* ÚJ: Lista alapján szűrés (csak a lista szavait mutatja a szólistában) */
function filterByPlaylist(id) {
  const pl = state.playlists ? state.playlists.find(p => p.id === id) : null;
  if (!pl) return;
  // Ha már ez a szűrő aktív, visszaállítás összes megjelenítésére
  if (state.filters.list === id) {
    applyListFilter('all');
    showToast('🔓 Szűrő eltávolítva – összes szó látható');
  } else {
    applyListFilter(id);
    showToast(`🔍 Szűrés: „${pl.name}" (${pl.wordIds.length} szó)`);
  }
  renderPlaylists(); // Aktív jelölő frissítése
}

function deletePlaylist(id) {
  if(!confirm('Biztosan törlöd ezt a listát?')) return;
  // Ha ez az aktív szűrő, visszaállítás
  if (state.filters.list === id) {
    state.filters.list = 'all';
  }
  state.playlists = state.playlists.filter(p => p.id !== id);
  savePlaylists(); renderPlaylists(); applyFilters();
}

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC (V6.7: SZEM IKON + MONDAT MOTOR)
══════════════════════════════════════════════════════ */
let eyeState = 0; 

function startPractice() {
  const selectedWords = state.words.filter(w => state.selectedIds.has(w.id));
  if (selectedWords.length === 0) return;
  
  const qCountSelect = document.getElementById('q-count');
  const orderSelect = document.getElementById('practice-order');
  const typeSelect = document.getElementById('practice-type');
  
  const qCount = qCountSelect ? Math.min(parseInt(qCountSelect.value) || 20, selectedWords.length) : selectedWords.length;
  const order = orderSelect ? orderSelect.value : 'random';
  const type = typeSelect ? typeSelect.value : 'classic';
  
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
    type: type, currentSentenceObj: null, _combo: 0
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

  const total = p.roundWords.length;
  const progBar = document.getElementById('prog-bar');
  const progLabel = document.getElementById('prog-label');
  const roundBadge = document.getElementById('round-badge');
  const errBadge = document.getElementById('error-badge');
  const errCount = document.getElementById('error-count-badge');
  
  if(progBar) progBar.style.width = Math.round((p.currentIdx / total) * 100) + '%';
  if(progLabel) progLabel.textContent = p.currentIdx + ' / ' + total;
  if(roundBadge) roundBadge.textContent = 'Round ' + p.roundNumber;
  if(errBadge) errBadge.style.display = p.roundWrong > 0 ? '' : 'none';
  if(errCount) errCount.textContent = p.roundWrong;

  const isEnHu = state.direction === 'en-hu';
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
    hintText = `💬 MONDAT-KIEGÉSZÍTŐ (${isEnHu ? 'Olvasás' : 'Írás'})`;
    
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
      <button class="dont-know" style="margin-top:10px;" onclick="checkSentenceAnswer(null, null)">Nem tudom :(</button>
    `;
  }
  else if (p.type === 'classic') { 
    const options = shuffle([correctText, ...getSmartDistractors(word, 3, isEnHu)]);
    
    contentHtml = `
      <div class="q-word ${currentMode === 'kanji' && isEnHu ? 'kanji-display' : ''}" style="margin-bottom:6px;">${escHtml(questionText)}</div>
      ${isJapanMode && isEnHu ? `
        <button class="eye-btn" onclick="toggleEye('${word.id}')" title="Olvasat felfedése"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        <div id="reveal-text" class="reveal-text"></div>
      ` : ''}
      <button class="speak-btn" id="speak-btn" onclick="speakWord('${escHtml(questionText)}', ${!isEnHu})">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
      </button>
      <div class="options-grid">
        ${options.map(opt => `<button class="opt-btn" onclick="checkAnswer(this,'${escHtml(opt)}','${escHtml(correctText)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" style="margin-top:10px;" onclick="checkAnswer(null,null,'${escHtml(correctText)}')">Nem tudom :(</button>
    `;
  } 
  else {
    const placeholderText = isEnHu ? "Gépeld be magyarul..." : "Gépeld be japánul vagy romajival...";
    contentHtml = `
      <div class="q-word" style="margin-bottom:26px;">${escHtml(questionText)}</div>
      <div style="margin-bottom: 20px;"><input type="text" id="hardcore-input" class="search-input" placeholder="${placeholderText}" autocomplete="off" style="text-align:center; font-size:18px; padding: 14px; border-width: 3px;"></div>
      <button class="btn btn-primary btn-lg" style="width:100%; justify-content:center; margin-bottom: 10px;" onclick="checkHardcoreAnswer('${word.id}')">Ellenőrzés</button>
      <button class="dont-know" onclick="revealHardcoreAnswer('${word.id}')">Nem tudom :(</button>
      <div id="hardcore-feedback" style="margin-top: 16px; font-weight: 800; font-size: 16px; display:none;"></div>
    `;
  }

  const qArea = document.getElementById('question-area');
  if (qArea) {
    qArea.innerHTML = `
      <div class="q-card" id="q-card">
        <div class="q-hint" style="display:flex; justify-content:center; align-items:center; margin-bottom:14px;">
          <span style="letter-spacing:0.1em; color:var(--text-3); font-weight:800; font-size:11px; text-transform:uppercase;">${hintText}</span>
          <span style="margin: 0 8px; color: var(--border);">|</span>
          <span class="diff-pill d${word.diff}" style="font-size:11px; padding:2px 8px;">${word.diff}</span>
        </div>
        ${contentHtml}
      </div>
      <div id="next-btn-container" style="display: none; text-align: center; margin-top: 20px; animation: popIn 0.3s;">
        <button class="eye-btn" onclick="manualNextQuestion()" title="Tovább a következőre" style="width: auto; padding: 8px 20px; border-radius: 20px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; background: var(--surface-2); border: 1px solid var(--border);">
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

  if (p.type === 'classic' && isEnHu) {
    setTimeout(() => { speakWord(questionText, false); }, 300);
  }
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

  const isEnHu = state.direction === 'en-hu';
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
  const isEnHu = state.direction === 'en-hu';
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
    if(currentMode !== 'english' && state.direction === 'en-hu') {
      eyeState = currentMode === 'kanji' ? 1 : 0; 
      toggleEye(word.id);
    }
  }

  if (word) {
    if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
    else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
    word.stats.lastAttempt = Date.now();
    updateQuestProgress('wordAnswered', { word, isCorrect });
  }

  if (!isCorrect && state.direction === 'hu-en') {
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
   V9: PRÉMIUM TTS HANG FELOLVASÓ
   - Google Translate TTS japánhoz (kanji-mentes, precíz kiejtés)
   - Kana prioritás: word.en = kana japán módban → automatikusan helyes
   - Audio blokkolás: helyes válasz után bevárja a hang végét
══════════════════════════════════════════════════════ */
let _currentTTSAudio = null; // Aktuális Google TTS Audio elem referenciája
let _ttsVersion = 0;          // Race condition védelem verziószámlálóval
let _ttsOnEnd = null;         // Hang befejezésekor futó callback (advance logika)

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

  // Előző hang azonnali leállítása
  if (_currentTTSAudio) {
    try { _currentTTSAudio.pause(); _currentTTSAudio.src = ''; } catch(e) {}
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
    // Google Translate TTS – pontosabb japán kiejtés, kana alapú, on/kun keveredés nélkül
    const audio = new Audio();
    const encoded = encodeURIComponent(text);
    audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ja&client=gtx&ttsspeed=0.85`;
    _currentTTSAudio = audio;
    audio.onended = () => _onTTSFinished(ver);
    audio.onerror = () => { _currentTTSAudio = null; useSpeechSynthesis(); };
    audio.play().catch(() => { _currentTTSAudio = null; useSpeechSynthesis(); });
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
  
  setEl('re-title', p.roundNumber === 1 && p.errorList.length === 0 ? '🎉 Hibátlan kör!' : `Round ${p.roundNumber} vége!`);
  setEl('re-subtitle', pct >= 80 ? 'Szép munka! 💪' : pct >= 50 ? 'Haladás! Folytasd! 📈' : 'Ne add fel! Próbáld újra! 🔁');
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
    if(nextBtn) nextBtn.style.display = '';
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

  saveStats(); saveWords(); showScreen('dashboard'); showToast('Gyakorlás befejezve!'); // Statisztika + szó streak mentése
}

function confirmQuit() { if (confirm('Biztosan ki szeretnél lépni?')) showScreen('dashboard'); }

/* ══════════════════════════════════════════════════════
   STATS & MODALS
══════════════════════════════════════════════════════ */
function renderStats() {
  const gs = state.globalStats;
  const words = state.words;
  const totalAttempts = words.reduce((s,w)=>s+w.stats.totalCorrect+w.stats.totalWrong,0);
  const totalCorrect  = words.reduce((s,w)=>s+w.stats.totalCorrect,0);
  const avgPct = totalAttempts > 0 ? Math.round(totalCorrect/totalAttempts*100) : 0;
  const bestStreak = Math.max(...words.map(w=>w.stats.streak),0);
  const learnedWords = words.filter(w=>w.stats.streak>=3).length;

  const kpiGrid = document.getElementById('kpi-grid');
  if(kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="kpi-icon">🎯</div><div class="kpi-val">${avgPct}%</div><div class="kpi-lbl">Átlagos pontosság</div></div>
      <div class="kpi-card"><div class="kpi-icon">🔥</div><div class="kpi-val">${bestStreak}</div><div class="kpi-lbl">Legjobb streak</div></div>
      <div class="kpi-card"><div class="kpi-icon">📚</div><div class="kpi-val">${learnedWords}</div><div class="kpi-lbl">Megtanult szó (streak≥3)</div></div>
      <div class="kpi-card"><div class="kpi-icon">🏋️</div><div class="kpi-val">${gs.totalSessions||0}</div><div class="kpi-lbl">Összes gyakorlás</div></div>
      <div class="kpi-card"><div class="kpi-icon">✅</div><div class="kpi-val">${gs.totalCorrect||0}</div><div class="kpi-lbl">Összes helyes válasz</div></div>
      <div class="kpi-card"><div class="kpi-icon">📖</div><div class="kpi-val">${words.length}</div><div class="kpi-lbl">Szótárban lévő elemek</div></div>
    `;
  }

  renderHeatmap();

  // Dekiru tab láthatósága: csak japán módban
  const dekiruTabBtn = document.getElementById('dekiru-tab-btn');
  if (dekiruTabBtn) dekiruTabBtn.style.display = currentMode === 'japanese' ? '' : 'none';

  const tags = new Set();
  words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const tagStats = Array.from(tags).map(tag => {
    const tw = words.filter(w=>w.tags.includes(tag));
    const c = tw.reduce((s,w)=>s+w.stats.totalCorrect,0);
    const tot = tw.reduce((s,w)=>s+w.stats.totalCorrect+w.stats.totalWrong,0);
    return { tag, c, tot, pct: tot>0 ? Math.round(c/tot*100):0 };
  }).sort((a,b)=>b.pct-a.pct);

  const tagPerfList = document.getElementById('tag-perf-list');
  if(tagPerfList) {
    tagPerfList.innerHTML = tagStats.length===0
      ? '<div style="color:var(--text-3);font-size:14px">Még nincs elég adat.</div>'
      : tagStats.map(t=>`
        <div class="tag-perf-item">
          <div class="tp-label">${tagLabel(t.tag)}</div>
          <div class="tp-bar-wrap"><div class="tp-bar" style="width:${t.pct}%"></div></div>
          <div class="tp-pct">${t.tot>0?t.pct+'%':'—'}</div>
        </div>`).join('');
  }

  const sorted = [...words].sort((a,b)=>(b.stats.totalCorrect+b.stats.totalWrong)-(a.stats.totalCorrect+a.stats.totalWrong));
  
  const header = document.getElementById('stats-table-header');
  if(header) {
    header.innerHTML = currentMode === 'english' 
      ? `<th>Angol</th><th>Magyar</th><th>Streak 🔥</th><th>Helyes</th><th>Hibás</th><th>%</th><th>Szint</th>`
      : `<th>${currentMode === 'kanji' ? 'Kandzsi' : 'Kana'}</th><th>Magyar</th><th>Streak 🔥</th><th>Helyes</th><th>Hibás</th><th>%</th><th>JLPT</th>`;
  }

  const tbody = document.getElementById('word-stats-tbody');
  if(tbody) {
    tbody.innerHTML = sorted.map(w=>{
      const tot = w.stats.totalCorrect+w.stats.totalWrong;
      const pct = tot>0 ? Math.round(w.stats.totalCorrect/tot*100):null;
      return `<tr>
        <td class="en">${escHtml(w.en)}</td>
        <td>${escHtml(w.hu)}</td>
        <td>${w.stats.streak>0?'🔥'+w.stats.streak:'—'}</td>
        <td style="color:var(--success);font-weight:700">${w.stats.totalCorrect}</td>
        <td style="color:var(--error);font-weight:700">${w.stats.totalWrong}</td>
        <td>${pct!==null?pct+'%':'—'}</td>
        <td><span class="diff-pill d${w.diff}">${w.diff}</span></td>
      </tr>`;
    }).join('');
  }

  const hist = (state.globalStats.sessionHistory||[]).slice().reverse();
  const histList = document.getElementById('history-list');
  if(histList) {
    histList.innerHTML = hist.length===0
      ? '<div style="color:var(--text-3);font-size:14px">Még nincs befejezett gyakorlás.</div>'
      : hist.map(h=> {
          const mins = Math.floor(h.duration / 60);
          const secs = h.duration % 60;
          const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          return `
        <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:13px;color:var(--text-2)">${h.date}</div>
            <div style="font-size:14px;font-weight:700">
              <span style="color:var(--success)">${h.correct} helyes</span> / <span style="color:var(--error)">${h.wrong} hibás</span>
            </div>
          </div>
          <div style="display:flex;gap:10px;font-size:12px;color:var(--text-3);font-weight:700;background:var(--surface-2);padding:4px 10px;border-radius:8px">
            <span>🔄 ${h.rounds} kör</span>
            <span>⏱ ${timeStr}</span>
          </div>
        </div>`
      }).join('');
  }
}

function renderHeatmap() {
  const words = state.words;
  if (words.length === 0) return;

  const diffs = ['N5','N4','N3','N2','N1', 'B1','B2','C1','C2'];
  const diffStats = diffs.map(d => {
    const w = words.filter(x => x.diff === d);
    if (w.length === 0) return null;
    const totalAttempts = w.reduce((s,x)=>s+x.stats.totalCorrect+x.stats.totalWrong,0);
    const totalCorrect = w.reduce((s,x)=>s+x.stats.totalCorrect,0);
    const pct = totalAttempts > 0 ? Math.round((totalCorrect/totalAttempts)*100) : 0;
    return { label: d, pct, count: w.length, totalAttempts };
  }).filter(Boolean);

  const tags = new Set();
  words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const tagStats = Array.from(tags).map(t => {
    const w = words.filter(x => x.tags.includes(t));
    const totalAttempts = w.reduce((s,x)=>s+x.stats.totalCorrect+x.stats.totalWrong,0);
    const totalCorrect = w.reduce((s,x)=>s+x.stats.totalCorrect,0);
    const pct = totalAttempts > 0 ? Math.round((totalCorrect/totalAttempts)*100) : 0;
    return { label: t, pct, count: w.length, totalAttempts };
  });

  const getHeatColor = (pct, attempts) => {
    if (attempts === 0) return 'var(--surface-2)';
    if (pct < 40) return '#ff4d4d'; 
    if (pct < 70) return '#ffa64d'; 
    if (pct < 90) return '#99e699'; 
    return '#33cc33';               
  };

  const renderGrid = (data) => {
    return data.map(d => {
      const displayLabel = d.label.length <= 4 ? d.label : d.label.substring(0,3).toUpperCase();
      return `
      <div class="heatmap-cell ${d.totalAttempts === 0 ? 'empty' : ''}" 
           style="background-color: ${getHeatColor(d.pct, d.totalAttempts)}" 
           title="${d.label}: ${d.totalAttempts === 0 ? 'Még nem gyakoroltad' : d.pct + '% helyes'} (${d.count} szó)">
        ${displayLabel}
      </div>
    `}).join('');
  };

  const heatmapCont = document.getElementById('heatmap-container');
  if (heatmapCont) {
    heatmapCont.innerHTML = `
      <div class="heatmap-section">
        <h4 style="margin-bottom:8px; font-size: 14px;">Tudásszintek (JLPT/CEFR)</h4>
        <div class="heatmap-grid">${renderGrid(diffStats)}</div>
      </div>
      <div class="heatmap-section" style="margin-top:24px;">
        <h4 style="margin-bottom:8px; font-size: 14px;">Témakörök és Címkék</h4>
        <div class="heatmap-grid">${renderGrid(tagStats)}</div>
      </div>
      <div class="heatmap-legend" style="margin-top:20px; display:flex; gap:12px; font-size:12px; color:var(--text-3); flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:var(--surface-2);border-radius:3px;"></div> Nincs adat</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:#ff4d4d;border-radius:3px;"></div> < 40%</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:#ffa64d;border-radius:3px;"></div> 40-70%</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:#99e699;border-radius:3px;"></div> 70-90%</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:#33cc33;border-radius:3px;"></div> 90%+</div>
      </div>
    `;
  }
}

function renderDekiruLessonStats() {
  const container = document.getElementById('dekiru-lesson-list');
  if (!container) return;

  // Csak dekiru szavak, amiknek van lesson száma
  const dekiruWords = appData.japanese.words.filter(w =>
    w.source === 'dekiru' && w.lesson !== null && w.lesson !== undefined && w.lesson !== ''
  );

  if (dekiruWords.length === 0) {
    container.innerHTML = '<div style="color:var(--text-3);font-size:14px;padding:10px 0">Még nincs Dekiru szó az adatbázisban.</div>';
    return;
  }

  // Leckénkénti csoportosítás
  const lessonMap = {};
  dekiruWords.forEach(w => {
    const l = String(w.lesson);
    if (!lessonMap[l]) lessonMap[l] = { lesson: Number(w.lesson), words: [] };
    lessonMap[l].words.push(w);
  });

  // Statisztikák kiszámítása leckénként
  let lessonStats = Object.values(lessonMap).map(entry => {
    const correct = entry.words.reduce((s, w) => s + w.stats.totalCorrect, 0);
    const total   = entry.words.reduce((s, w) => s + w.stats.totalCorrect + w.stats.totalWrong, 0);
    const pct     = total > 0 ? Math.round(correct / total * 100) : null;
    const learned = entry.words.filter(w => w.stats.streak >= 3).length;
    return { lesson: entry.lesson, wordCount: entry.words.length, correct, total, pct, learned };
  });

  // Rendezés a szűrő szerint
  const sort = document.getElementById('dekiru-sort')?.value || 'lesson-asc';
  if      (sort === 'best')       lessonStats.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  else if (sort === 'worst')      lessonStats.sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
  else if (sort === 'lesson-asc') lessonStats.sort((a, b) => a.lesson - b.lesson);
  else if (sort === 'lesson-desc')lessonStats.sort((a, b) => b.lesson - a.lesson);

  // Szín a % alapján
  function pctColor(pct) {
    if (pct === null) return 'var(--text-3)';
    if (pct >= 80)   return 'var(--success)';
    if (pct >= 50)   return 'var(--yellow)';
    return 'var(--error)';
  }
  function barColor(pct) {
    if (pct === null) return 'var(--surface-2)';
    if (pct >= 80)   return 'var(--primary)';
    if (pct >= 50)   return 'var(--yellow)';
    return 'var(--accent)';
  }

  container.innerHTML = lessonStats.map(s => {
    const barW    = s.pct !== null ? s.pct : 0;
    const pctText = s.pct !== null ? `${s.pct}%` : '—';
    const badge   = s.pct === null
      ? `<span style="font-size:11px;color:var(--text-3);font-weight:700">Nem gyakorolt</span>`
      : `<span style="font-size:15px;font-weight:900;color:${pctColor(s.pct)}">${pctText}</span>`;

    return `
      <div style="display:grid; grid-template-columns:90px 1fr 54px; align-items:center; gap:12px; padding:10px 4px; border-bottom:1px solid var(--border);">
        <div>
          <div style="font-weight:800; font-size:13px; color:var(--text)">📘 Lecke ${s.lesson}</div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px">${s.wordCount} szó · ${s.learned} megtanult</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div style="height:10px; background:var(--surface-2); border-radius:5px; overflow:hidden;">
            <div style="width:${barW}%; height:100%; background:${barColor(s.pct)}; border-radius:5px; transition:width 0.5s ease;"></div>
          </div>
          <div style="font-size:10px; color:var(--text-3)">${s.total > 0 ? `${s.correct} helyes / ${s.total} kísérlet` : 'Még nem volt kérdés erről a leckéről'}</div>
        </div>
        <div style="text-align:right">${badge}</div>
      </div>`;
  }).join('');
}


function switchStatsTab(tab) {
  ['topics','words','history','heatmap','dekiru'].forEach(t => {
    const el = document.getElementById(`stats-${t}-tab`);
    if(el) el.style.display = t === tab ? 'block' : 'none';
  }); 
  
  document.querySelectorAll('#screen-stats .nav-tab').forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onclickAttr.includes(`'${tab}'`));
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
      state.words.push({ id:'en_imp_'+Date.now()+Math.random(), en, hu, tags, diff: migrateDiff(diffStr || 'B2'), syn:'', sentence:'', stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
    } else {
      const [en, hu, romaji, tagsStr, diffStr] = parts;
      if (!en||!hu) return;
      const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
      if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
      state.words.push({ id:'jp_imp_'+Date.now()+Math.random(), en, hu, romaji: romaji || '', tags, diff: migrateDiff(diffStr || 'N5'), sentence:'', stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
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
    if(title) title.innerText = '➕ Új angol szó';
    if(lblEn) lblEn.innerText = 'Angol szó';
    if(lblSyn) lblSyn.innerText = 'Szinonima (opcionális)';
    if(diffSelect) diffSelect.innerHTML = '<option value="B1">B1</option><option value="B2" selected>B2</option><option value="C1">C1</option><option value="C2">C2</option>';
  } else if (currentMode === 'japanese') {
    if(title) title.innerText = '➕ Új japán szó';
    if(lblEn) lblEn.innerText = 'Kana (Japán szó)';
    if(lblSyn) lblSyn.innerText = 'Romaji (Kötelező!)';
    if(diffSelect) diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  } else if (currentMode === 'kanji') {
    if(title) title.innerText = '➕ Új kandzsi';
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
    state.words.push({ id:'en_man_'+Date.now(), en, hu, tags, diff, syn: synOrRomaji, sentence, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'japanese') {
    if (!synOrRomaji) { showToast('A Romaji megadása kötelező japán szónál!'); return; }
    state.words.push({ id:'jp_man_'+Date.now(), en, hu, romaji: synOrRomaji, tags, diff, sentence, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'kanji') {
    state.words.push({ id:'kj_man_'+Date.now(), en, hu, romaji: synOrRomaji, onyomi: '', kunyomi: '', lesson: 'Egyéb', tags, diff, sentence, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
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
   FIX #2: renderCollections – COLLECTIONS globális nem létezik.
   Átírva: a gyors lista-választó gombokat rendereli a saját listákból.
══════════════════════════════════════════════════════ */
function renderCollections() {
  renderPlaylists();
}

function applyListFilter(listId) {
  state.filters.list = listId || 'all';
  renderPlaylists();
  applyFilters();
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
    showToast(`✅ ${added} szó hozzáadva a(z) „${pl.name}" listához!`);
  }
  savePlaylists();
  renderPlaylists();
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
  toast.innerHTML = '🆕 Új verzió érhető el! <a href="#" style="color:#fff;text-decoration:underline;margin-left:6px;" onclick="activateNewSW(event)">Frissítés</a>';
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