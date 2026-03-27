/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] App.js V5.3 (Dekiru Lesson Filter + Retroactive Fix) indítása...");

if (typeof SAMPLE_WORDS === 'undefined') window.SAMPLE_WORDS = [];
if (typeof JAPANESE_WORDS === 'undefined') window.JAPANESE_WORDS = [];
if (typeof KANJI_DATA === 'undefined') window.KANJI_DATA = [];

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
  'család': '👪', 'filozófia': '🦉', 'képesség': '⚡', 'művészet': '🎨', 
  'technológia': '💻', 'társadalom': '🏙️',
  'alapszavak': '⭐', 'udvariasság': '🙇', 'köszönések': '👋', 'szórakozás': '🎭', 'kapcsolatok': '👪',
  'helyek': '🏙️', 'időjárás': '🌤️', 'országok': '🌍', 'sport': '🏅', 
  'ételek': '🍱', 'italok': '🍵', 'kérdőszavak': '❓', 'számlálószavak': '🔢', 'irányok': '🧭',
  'természet': '🌿'
};

function tagLabel(tag) {
  const t = tag.toLowerCase().trim();
  if (t.startsWith('lesson')) return '📖 ' + tag; 
  let emoji = TAG_EMOJIS[t];
  if (!emoji) emoji = '🏷️'; 
  return emoji + ' ' + tag;
}

/* ══════════════════════════════════════════════════════
   MULTI-LANGUAGE ÁLLAPOTTÉR (V5)
══════════════════════════════════════════════════════ */
function createEmptyState() {
  return {
    words: [], playlists: [], selectedIds: new Set(),
    filters: { search: '', topicSearch: '', tags: [], diff: new Set(), lesson: 'all', sort: 'az' },
    direction: 'en-hu', activeViewTab: 'words',
    practice: { roundNumber: 0, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: 0, sessionStartTime: 0, sessionCorrect: 0, sessionWrong: 0 },
    globalStats: { totalSessions: 0, totalCorrect: 0, totalWrong: 0, sessionHistory: [], studyDays: {}, recordStreak: 0, lastStudiedTopic: null }
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
   STORAGE & INIT
══════════════════════════════════════════════════════ */
function saveState() {
  const toSave = {
    lastMode: currentMode,
    english:  { words: appData.english.words,  playlists: appData.english.playlists,  globalStats: appData.english.globalStats,  direction: appData.english.direction,  filters: { ...appData.english.filters, diff: Array.from(appData.english.filters.diff) },  selectedIds: Array.from(appData.english.selectedIds) },
    japanese: { words: appData.japanese.words, playlists: appData.japanese.playlists, globalStats: appData.japanese.globalStats, direction: appData.japanese.direction, filters: { ...appData.japanese.filters, diff: Array.from(appData.japanese.filters.diff) }, selectedIds: Array.from(appData.japanese.selectedIds) },
    kanji:    { words: appData.kanji.words,    playlists: appData.kanji.playlists,    globalStats: appData.kanji.globalStats,    direction: appData.kanji.direction,    filters: { ...appData.kanji.filters, diff: Array.from(appData.kanji.filters.diff) },       selectedIds: Array.from(appData.kanji.selectedIds) }
  };
  try { localStorage.setItem('lexilearn_v5', JSON.stringify(toSave)); } catch(e) {}
}

function loadState() {
  let savedMode = 'english';
  try {
    const rawV5 = localStorage.getItem('lexilearn_v5');
    if (rawV5) {
      const parsed = JSON.parse(rawV5);
      savedMode = parsed.lastMode || 'english';
      
      ['english', 'japanese', 'kanji'].forEach(lang => {
        if(parsed[lang]) {
          appData[lang].words = parsed[lang].words || [];
          appData[lang].playlists = parsed[lang].playlists || [];
          appData[lang].globalStats = parsed[lang].globalStats || createEmptyState().globalStats;
          appData[lang].direction = parsed[lang].direction || 'en-hu';
          
          if (parsed[lang].filters) {
            appData[lang].filters = parsed[lang].filters;
            appData[lang].filters.diff = new Set(parsed[lang].filters.diff || []);
          }
          if (parsed[lang].selectedIds) {
            appData[lang].selectedIds = new Set(parsed[lang].selectedIds);
          }
        }
      });
      syncNewWords();
    } else {
      const rawV4 = localStorage.getItem('lexilearn_v4');
      if (rawV4) {
        const v4 = JSON.parse(rawV4);
        appData.english.words = v4.words || [];
        appData.english.playlists = v4.playlists || [];
        appData.english.globalStats = v4.globalStats || createEmptyState().globalStats;
        appData.english.direction = v4.direction || 'en-hu';
      }
      syncNewWords();
    }
  } catch(e) { syncNewWords(); }
  
  cleanTags();
  setMode(savedMode, true); 
  updateDirectionUI();
  renderDashboard(); 
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
  if (needsSave) saveState();
}

function syncNewWords() {
  // 1. Angol szavak
  if (appData.english.words.length === 0 && SAMPLE_WORDS.length > 0) {
    appData.english.words = SAMPLE_WORDS.map((w,i) => ({
      id: 'en_' + i, en: w.en, hu: w.hu, tags: w.tags, diff: w.diff || 'B2', syn: w.syn || '', sentence: w.sentence || '',
      stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
    }));
  }
  
  // 2. Japán szavak
  const existingJpIds = new Set(appData.japanese.words.map(w => w.en)); 
  
  // Dekiru leckék kigyűjtése
  const DEKIRU_WORDS = [];
  for (let i = 1; i <= 100; i++) {
    try {
      const list = eval('DEKIRU_L' + i);
      if (list) DEKIRU_WORDS.push(...list);
    } catch(e) { }
  }

  // Dekiru szavak betöltése / visszamenőleges frissítése
  DEKIRU_WORDS.forEach((w, i) => {
    // Lecke kinyerése (ha tömb, akkor az első elem, különben szám)
    let lessonVal = w.lesson ? (Array.isArray(w.lesson) ? w.lesson[0] : w.lesson) : null;

    if (!existingJpIds.has(w.kana)) {
      appData.japanese.words.push({
        id: 'ja_dek_' + i + '_' + Date.now(),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5',
        lesson: lessonVal, 
        source: 'dekiru',
        sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
      existingJpIds.add(w.kana); 
    } else {
      // RETROAKTÍV JAVÍTÁS: Ha a szó már a memóriában van (régi importból), rácsatoljuk a leckét!
      let existingWord = appData.japanese.words.find(x => x.en === w.kana);
      if (existingWord) {
        existingWord.lesson = lessonVal;
        existingWord.source = 'dekiru';
        if (w.tags) {
          w.tags.forEach(t => { if (!existingWord.tags.includes(t)) existingWord.tags.push(t); });
        }
      }
    }
  });

  // Alap japán szótár betöltése
  JAPANESE_WORDS.forEach((w, i) => {
    if (!existingJpIds.has(w.kana)) {
      appData.japanese.words.push({
        id: 'ja_' + i + '_' + Date.now(),
        en: w.kana, hu: w.hu, romaji: w.romaji, tags: w.tags || [], diff: w.jlpt || 'N5', sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
      existingJpIds.add(w.kana);
    }
  });

  // 3. Kandzsik
  const existingKjIds = new Set(appData.kanji.words.map(w => w.en));
  KANJI_DATA.forEach((w,i) => {
    if (!existingKjIds.has(w.kanji)) {
      appData.kanji.words.push({
        id: 'kj_' + i + '_' + Date.now(),
        en: w.kanji, hu: w.meaning, romaji: w.romaji, onyomi: w.onyomi, kunyomi: w.kunyomi,
        tags: ['Lesson ' + w.lesson], lesson: w.lesson, diff: w.jlpt || 'N5', sentence: '',
        stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
      });
    }
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
  document.getElementById('diff-filter-list-en').style.display = isJp ? 'none' : 'flex';
  document.getElementById('diff-filter-list-jp').style.display = isJp ? 'flex' : 'none';
  
  // LECKE SZŰRŐ MEGJELENÍTÉSE KANJI ÉS JAPÁN MÓDBAN IS
  if (mode === 'kanji' || mode === 'japanese') {
    const lessons = new Set(state.words.map(w => w.lesson).filter(l => l !== undefined && l !== null && l !== ''));
    const sel = document.getElementById('lesson-select');
    const prefix = mode === 'kanji' ? 'Kanji' : 'Dekiru';
    
    if (lessons.size > 0) {
      document.getElementById('lesson-filter-group').style.display = 'block';
      sel.innerHTML = '<option value="all">Minden Lecke</option>' + 
        Array.from(lessons).sort((a,b)=>a-b).map(l => `<option value="${l}">${prefix} Lecke ${l}</option>`).join('');
    } else {
      document.getElementById('lesson-filter-group').style.display = 'none';
    }
  } else {
    document.getElementById('lesson-filter-group').style.display = 'none';
  }

  const gb = '<img src="https://flagcdn.com/w20/gb.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const hu = '<img src="https://flagcdn.com/w20/hu.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const jp = '<img src="https://flagcdn.com/w20/jp.png" width="16" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const kj = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-bottom:2px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';

  if (mode === 'english') {
    document.getElementById('lbl-dir-1').innerHTML = `${gb} &rarr; ${hu}`;
    document.getElementById('lbl-dir-2').innerHTML = `${hu} &rarr; ${gb}`;
  } else if (mode === 'japanese') {
    document.getElementById('lbl-dir-1').innerHTML = `${jp} Kana &rarr; ${hu}`;
    document.getElementById('lbl-dir-2').innerHTML = `${hu} &rarr; ${jp} Kana`;
  } else {
    document.getElementById('lbl-dir-1').innerHTML = `${kj} Kanji &rarr; ${hu}`;
    document.getElementById('lbl-dir-2').innerHTML = `${hu} &rarr; ${kj} Kanji`;
  }

  const streakLabels = { 'english': 'Angol', 'japanese': 'Japán', 'kanji': 'Kandzsi' };
  document.getElementById('lbl-streak').innerText = `${streakLabels[mode]} streak (nap)`;

  document.getElementById('search-input').value = state.filters.search || '';
  document.getElementById('topic-search').value = state.filters.topicSearch || '';
  document.getElementById('sort-select').value = state.filters.sort || 'az';
  if ((mode === 'kanji' || mode === 'japanese') && document.getElementById('lesson-select')) {
    document.getElementById('lesson-select').value = state.filters.lesson || 'all';
  }
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', state.filters.diff.has(b.dataset.diff));
  });

  if (!isInit) {
    saveState();
    updateDirectionUI();
    renderDashboard();
  }
}

/* ══════════════════════════════════════════════════════
   STREAK & ACTIVITY
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
   SCREEN MANAGEMENT
══════════════════════════════════════════════════════ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const map = {dashboard:'screen-dashboard',practice:'screen-practice',roundend:'screen-round-end',stats:'screen-stats'};
  document.getElementById(map[name] || 'screen-dashboard').classList.add('active');
  if (name === 'dashboard') renderDashboard();
  if (name === 'stats') renderStats();
}

/* ══════════════════════════════════════════════════════
   DASHBOARD & FILTERS
══════════════════════════════════════════════════════ */
function renderDashboard() {
  renderPlaylists(); 
  renderTagFilters();
  applyFilters(); 
  updateStartPanel();
  updateDirectionUI();
  renderSidebar();
}

function renderSidebar() {
  const words = state.words;
  const streak = calcStreak();
  if (streak > (state.globalStats.recordStreak || 0)) state.globalStats.recordStreak = streak;

  const totalAttempts = words.reduce((s,w)=>s+w.stats.totalCorrect+w.stats.totalWrong,0);
  const totalCorrect  = words.reduce((s,w)=>s+w.stats.totalCorrect,0);
  document.getElementById('ms-streak').textContent = streak;
  document.getElementById('ms-record').textContent = state.globalStats.recordStreak || 0;
  document.getElementById('ms-avg').textContent = totalAttempts > 0 ? Math.round(totalCorrect/totalAttempts*100)+'%' : '—';
  document.getElementById('ms-learned').textContent = words.filter(w=>w.stats.streak>=3).length;
  document.getElementById('ms-last-topic').textContent = state.globalStats.lastStudiedTopic ? tagLabel(state.globalStats.lastStudiedTopic) : '—';
  const mostWrong = [...words].sort((a,b)=>b.stats.totalWrong-a.stats.totalWrong).find(w=>w.stats.totalWrong>0);
  document.getElementById('ms-worst').textContent = mostWrong ? mostWrong.en : '—';

  const days = getWeekDays();
  document.getElementById('week-tracker').innerHTML = days.map(d => {
    let cls, icon;
    if (d.isToday && d.studied)  { cls='today-studied'; icon='✔'; }
    else if (d.isToday)          { cls='today-not';     icon='○'; }
    else if (d.studied)          { cls='studied';       icon='✔'; }
    else                         { cls='not-studied';   icon='○'; }
    return `<div class="week-day"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}">${icon}</div></div>`;
  }).join('');
  document.getElementById('streak-big').textContent = streak + ' 🔥';
}

function renderTagFilters() {
  const tags = new Set();
  state.words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const container = document.getElementById('tag-filter-list');
  const q = (document.getElementById('topic-search')?.value || '').toLowerCase().trim();
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

function setDirection(dir) { state.direction = dir; updateDirectionUI(); saveState(); }

function updateDirectionUI() {
  document.getElementById('dir-en-hu').classList.toggle('active', state.direction === 'en-hu');
  document.getElementById('dir-hu-en').classList.toggle('active', state.direction === 'hu-en');
}

function applyFilters() {
  state.filters.search = document.getElementById('search-input').value.toLowerCase().trim();
  state.filters.topicSearch = document.getElementById('topic-search').value.toLowerCase().trim();
  
  if (currentMode === 'kanji' || currentMode === 'japanese') {
    const ls = document.getElementById('lesson-select');
    if (ls) state.filters.lesson = ls.value;
  }

  let filtered = state.words.filter(w => {
    if (state.filters.search && !w.en.toLowerCase().includes(state.filters.search) && !w.hu.toLowerCase().includes(state.filters.search)) return false;
    if (state.filters.tags.length > 0 && !state.filters.tags.some(t => w.tags.includes(t))) return false;
    if (state.filters.diff.size > 0 && !state.filters.diff.has(w.diff)) return false;
    // LECKE SZŰRŐ:
    if ((currentMode === 'kanji' || currentMode === 'japanese') && state.filters.lesson !== 'all' && w.lesson != state.filters.lesson) return false;
    return true;
  });

  const sort = state.filters.sort;
  if      (sort === 'az')         filtered.sort((a,b) => a.en.localeCompare(b.en));
  else if (sort === 'za')         filtered.sort((a,b) => b.en.localeCompare(a.en));
  else if (sort === 'diff-asc')   filtered.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (sort === 'diff-desc')  filtered.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));
  else if (sort === 'unlearned')  filtered.sort((a,b) => a.stats.streak - b.stats.streak);
  else if (sort === 'mastered')   filtered.sort((a,b) => b.stats.streak - a.stats.streak);

  document.getElementById('word-count-label').innerHTML = `Szólista <span style="color:var(--text-3);font-weight:500;text-transform:none;letter-spacing:0;font-size:12px;margin-left:4px">(${filtered.length} elem)</span>`;
  renderWordList(filtered);
  renderSentenceList(filtered);
  
  saveState(); 
}

function renderWordList(words) {
  const container = document.getElementById('word-list');
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
          <div class="diff-pill d${w.diff}" title="${w.diff}">${w.diff}</div>
        </div>
      </div>`;
  }).join('');
}

function renderSentenceList(words) {
  const container = document.getElementById('sentence-list');
  if (words.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3)">Nincs találat.</div>'; return; }
  
  container.innerHTML = words.map(w => {
    let displayed = w.sentence ? escHtml(w.sentence).replace(new RegExp('\\b(' + escRegex(w.en) + ')\\b', 'gi'), m => `<strong class="en-highlight">${m}</strong>`) : `<em>Nincs részlet / mondat.</em>`;
    if(currentMode !== 'english' && w.romaji) displayed = `Romaji: <strong style="color:var(--primary)">${w.romaji}</strong>`;

    return `
      <div class="sentence-card">
        <div class="sc-sentence">${displayed}</div>
        <div class="sc-bottom"><span class="sc-hu">${escHtml(w.hu)}</span><div style="display:flex;gap:6px"><span class="diff-pill d${w.diff}">${w.diff}</span><span class="sc-tags">${escHtml(w.tags.map(tagLabel).join(', '))}</span></div></div>
      </div>`;
  }).join('');
}

function switchViewTab(tab) {
  state.activeViewTab = tab;
  document.getElementById('vtab-words').classList.toggle('active', tab === 'words');
  document.getElementById('vtab-sentences').classList.toggle('active', tab === 'sentences');
  document.getElementById('word-list-view').style.display = tab === 'words' ? '' : 'none';
  document.getElementById('sentence-list-view').style.display = tab === 'sentences' ? '' : 'none';
}

function toggleWordSelection(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
  const el = document.querySelector(`.word-item[data-id="${id}"]`);
  if (el) {
    const sel = state.selectedIds.has(id);
    el.classList.toggle('selected', sel);
    el.querySelector('.word-checkbox').textContent = sel ? '✓' : '';
  }
  updateStartPanel();
  saveState(); 
}

function selectAll() { 
  document.querySelectorAll('.word-item[data-id]').forEach(el=>{ 
    state.selectedIds.add(el.dataset.id); 
    el.classList.add('selected'); 
    el.querySelector('.word-checkbox').textContent = '✓'; 
  }); 
  updateStartPanel(); 
  saveState(); 
}

function selectNone() { 
  state.selectedIds.clear(); 
  document.querySelectorAll('.word-item.selected').forEach(el=>{ 
    el.classList.remove('selected'); 
    el.querySelector('.word-checkbox').textContent = ''; 
  }); 
  updateStartPanel(); 
  saveState(); 
}

function updateStartPanel() {
  const cnt = state.selectedIds.size;
  document.getElementById('selected-count-big').textContent = cnt;
  document.getElementById('start-btn').disabled = cnt === 0;
  const saveBtn = document.getElementById('btn-save-list');
  if (saveBtn) saveBtn.disabled = cnt === 0;
}

/* ══════════════════════════════════════════════════════
   SAJÁT LISTÁK LOGIKÁJA
══════════════════════════════════════════════════════ */
function renderPlaylists() {
  const cont = document.getElementById('playlists-container');
  if (!state.playlists || state.playlists.length === 0) {
    cont.innerHTML = '<div class="empty-lists">Még nincsenek elmentett listáid ebben a nyelvben.</div>';
    return;
  }
  
  cont.innerHTML = state.playlists.map(p => {
    const plWordsHTML = p.wordIds.map(id => {
      const w = state.words.find(x => x.id === id);
      return w ? `<b>${escHtml(w.en)}</b> - ${escHtml(w.hu)}` : '';
    }).filter(Boolean).join('<br>');

    return `
      <div class="playlist-card-item">
        <div class="playlist-header" onclick="togglePlaylist('${p.id}')">
          <div style="display:flex; align-items:center; gap:6px;">
            📁 ${escHtml(p.name)} <span style="color:var(--text-3);font-size:11px">(${p.wordIds.length})</span>
          </div>
          <div class="pl-chevron" id="chevron-${p.id}">▼</div>
        </div>
        <div class="playlist-body" id="body-${p.id}">
          <div class="playlist-word-list">${plWordsHTML}</div>
          <div class="playlist-actions-row">
            <button class="btn btn-primary" onclick="loadPlaylist('${p.id}')">➕ Hozzáadás</button>
            <button class="btn btn-outline" style="color:var(--error); border-color:var(--error-bg);" onclick="deletePlaylist('${p.id}')">Törlés</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function togglePlaylist(id) {
  const body = document.getElementById('body-' + id);
  const chevron = document.getElementById('chevron-' + id);
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
  document.getElementById('playlist-name-input').value = '';
  document.getElementById('playlist-modal').classList.add('open');
}

function savePlaylist() {
  const name = document.getElementById('playlist-name-input').value.trim();
  if (!name) { showToast('Kérlek adj meg egy nevet a listának!'); return; }
  if (!state.playlists) state.playlists = [];
  const isDuplicate = state.playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (isDuplicate) { showToast('Már létezik ilyen nevű lista!'); return; }

  state.playlists.push({ id: 'pl_' + Date.now(), name: name, wordIds: Array.from(state.selectedIds) });
  saveState(); closeModal('playlist-modal'); renderPlaylists(); showToast('Lista sikeresen elmentve!');
}

function loadPlaylist(id) {
  const pl = state.playlists.find(p => p.id === id);
  if (!pl) return;
  pl.wordIds.forEach(wId => state.selectedIds.add(wId));
  
  document.getElementById('search-input').value = '';
  document.getElementById('topic-search').value = '';
  if (document.getElementById('lesson-select')) document.getElementById('lesson-select').value = 'all';
  
  state.filters.search = ''; state.filters.topicSearch = ''; state.filters.tags = []; state.filters.diff = new Set(); state.filters.lesson = 'all';
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  
  applyFilters(); 
  updateStartPanel();
  saveState();
  showToast('📂 ' + pl.name + ' hozzáadva!');
}

function deletePlaylist(id) {
  if(!confirm('Biztosan törlöd ezt a listát?')) return;
  state.playlists = state.playlists.filter(p => p.id !== id);
  saveState(); renderPlaylists();
}

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC 
══════════════════════════════════════════════════════ */
let eyeState = 0; 

function startPractice() {
  const selectedWords = state.words.filter(w => state.selectedIds.has(w.id));
  if (selectedWords.length === 0) return;
  const qCount = Math.min(parseInt(document.getElementById('q-count').value) || 20, selectedWords.length);

  const order = document.getElementById('practice-order').value;
  let orderedWords = [...selectedWords];

  if (order === 'random') orderedWords = shuffle(orderedWords);
  else if (order === 'az') orderedWords.sort((a,b) => a.en.localeCompare(b.en));
  else if (order === 'za') orderedWords.sort((a,b) => b.en.localeCompare(a.en));
  else if (order === 'diff-asc') orderedWords.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (order === 'diff-desc') orderedWords.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));

  state.practice = {
    roundNumber: 1, roundWords: orderedWords.slice(0, qCount).map(w => w.id),
    currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
  };

  if (selectedWords.length > 0) {
    const freq = {}; selectedWords.flatMap(w => w.tags).forEach(t => freq[t] = (freq[t]||0)+1);
    if(Object.keys(freq).length > 0) state.globalStats.lastStudiedTopic = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
  }
  showScreen('practice'); showQuestion();
}

function showQuestion() {
  const p = state.practice;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;

  const total = p.roundWords.length;
  document.getElementById('prog-bar').style.width = Math.round((p.currentIdx / total) * 100) + '%';
  document.getElementById('prog-label').textContent = p.currentIdx + ' / ' + total;
  document.getElementById('round-badge').textContent = 'Round ' + p.roundNumber;
  document.getElementById('error-badge').style.display = p.roundWrong > 0 ? '' : 'none';
  document.getElementById('error-count-badge').textContent = p.roundWrong;

  const isEnHu = state.direction === 'en-hu';
  const question = isEnHu ? word.en : word.hu;
  const correct  = isEnHu ? word.hu : word.en;
  const options = shuffle([correct, ...shuffle(state.words.filter(w=>w.id!==word.id)).slice(0, 3).map(w=>isEnHu?w.hu:w.en)]);

  const isJapanMode = currentMode !== 'english';
  eyeState = 0; 

  const gbFlag = '<img src="https://flagcdn.com/w20/gb.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const huFlag = '<img src="https://flagcdn.com/w20/hu.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const jpFlag = '<img src="https://flagcdn.com/w20/jp.png" width="14" style="border-radius:2px;vertical-align:middle;margin-bottom:2px;">';
  const kjIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-bottom:2px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';

  let hintText = isEnHu ? `${gbFlag} ANGOL &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${gbFlag} ANGOL`;
  if(currentMode === 'japanese') hintText = isEnHu ? `${jpFlag} KANA &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${jpFlag} KANA`;
  if(currentMode === 'kanji') hintText = isEnHu ? `${kjIcon} KANJI &rarr; ${huFlag} MAGYAR` : `${huFlag} MAGYAR &rarr; ${kjIcon} KANJI`;

  document.getElementById('question-area').innerHTML = `
    <div class="q-card" id="q-card">
      <div class="q-hint" style="display:flex; justify-content:center; align-items:center; margin-bottom:14px;">
        <span style="letter-spacing:0.1em; color:var(--text-3); font-weight:800; font-size:11px; text-transform:uppercase;">${hintText}</span>
        <span style="margin: 0 8px; color: var(--border);">|</span>
        <span class="diff-pill d${word.diff}" style="font-size:11px; padding:2px 8px;">${word.diff}</span>
      </div>

      <div class="q-word ${currentMode === 'kanji' && isEnHu ? 'kanji-display' : ''}" style="margin-bottom:6px;">${escHtml(question)}</div>

      ${isJapanMode && isEnHu ? `
        <button class="eye-btn" onclick="toggleEye('${word.id}')" title="Olvasat felfedése">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <div id="reveal-text" class="reveal-text"></div>
      ` : ''}

      <button class="speak-btn" id="speak-btn" onclick="speakWord('${escHtml(isEnHu ? word.en : word.hu)}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
      </button>

      <div class="options-grid">
        ${options.map(opt => `<button class="opt-btn" onclick="checkAnswer(this,'${escHtml(opt)}','${escHtml(correct)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      
      <button class="dont-know" style="margin-top:10px;" onclick="checkAnswer(null,null,'${escHtml(correct)}')">Nem tudom :(</button>
    </div>
  `;

  setTimeout(() => { speakWord(isEnHu ? word.en : word.hu); }, 300);
}

function toggleEye(wordId) {
  const word = state.words.find(w => w.id === wordId);
  if(!word) return;
  
  const rt = document.getElementById('reveal-text');
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
  
  const isCorrect = chosen === correct;
  if (isCorrect && btn) { btn.classList.add('correct'); document.getElementById('q-card').classList.add('bounce'); }
  else {
    if (btn) btn.classList.add('wrong');
    document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    document.getElementById('q-card').classList.add('shake');
    if(currentMode !== 'english' && state.direction === 'en-hu') {
      eyeState = currentMode === 'kanji' ? 1 : 0; 
      toggleEye(word.id);
    }
  }

  if (word) {
    if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
    else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
    word.stats.lastAttempt = Date.now();
  }

  setTimeout(() => {
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
  }, isCorrect ? 800 : 1800); 
}

function speakWord(text) {
  window.speechSynthesis?.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (currentMode !== 'english' && state.direction === 'en-hu') {
    u.lang = 'ja-JP';
  } else {
    u.lang = state.direction === 'en-hu' ? 'en-US' : 'hu-HU';
  }
  u.onerror = function(e) { console.log("TTS Hiba vagy nem támogatott nyelv: ", e); };
  window.speechSynthesis?.speak(u);
}

function showRoundEnd() {
  const p = state.practice;
  const total = p.roundWords.length;
  const pct = total > 0 ? Math.round(p.roundCorrect / total * 100) : 0;
  const elapsed = Math.round((Date.now() - p.roundStartTime) / 1000);
  
  document.getElementById('re-title').textContent = p.roundNumber === 1 && p.errorList.length === 0 ? '🎉 Hibátlan kör!' : `Round ${p.roundNumber} vége!`;
  document.getElementById('re-subtitle').textContent = pct >= 80 ? 'Szép munka! 💪' : pct >= 50 ? 'Haladás! Folytasd! 📈' : 'Ne add fel! Próbáld újra! 🔁';
  
  document.getElementById('re-correct').textContent = p.roundCorrect;
  document.getElementById('re-wrong').textContent = p.roundWrong;
  document.getElementById('donut-pct').textContent = pct + '%';
  document.getElementById('re-time').textContent = elapsed < 60 ? elapsed + 's' : Math.floor(elapsed/60) + 'm';

  const circ = 251.2;
  document.getElementById('donut-correct').style.strokeDashoffset = circ - (circ * pct / 100);
  const wPct = total > 0 ? p.roundWrong / total : 0;
  document.getElementById('donut-wrong').style.strokeDashoffset = circ - (circ * wPct);

  const errSec = document.getElementById('error-list-section');
  if (p.errorList.length > 0) {
    errSec.style.display = '';
    document.getElementById('error-list-items').innerHTML = p.errorList.map(id => {
      const w = state.words.find(x => x.id === id);
      return `<div class="err-item"><span class="err-en">${escHtml(w.en)}</span><span class="err-hu">${escHtml(w.hu)}</span></div>`;
    }).join('');
    document.getElementById('re-next-btn').style.display = '';
  } else {
    errSec.style.display = 'none';
    document.getElementById('re-next-btn').style.display = 'none';
  }
  saveState(); 
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

  saveState(); showScreen('dashboard'); showToast('Gyakorlás befejezve!');
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

  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card"><div class="kpi-icon">🎯</div><div class="kpi-val">${avgPct}%</div><div class="kpi-lbl">Átlagos pontosság</div></div>
    <div class="kpi-card"><div class="kpi-icon">🔥</div><div class="kpi-val">${bestStreak}</div><div class="kpi-lbl">Legjobb streak</div></div>
    <div class="kpi-card"><div class="kpi-icon">📚</div><div class="kpi-val">${learnedWords}</div><div class="kpi-lbl">Megtanult szó (streak≥3)</div></div>
    <div class="kpi-card"><div class="kpi-icon">🏋️</div><div class="kpi-val">${gs.totalSessions||0}</div><div class="kpi-lbl">Összes gyakorlás</div></div>
    <div class="kpi-card"><div class="kpi-icon">✅</div><div class="kpi-val">${gs.totalCorrect||0}</div><div class="kpi-lbl">Összes helyes válasz</div></div>
    <div class="kpi-card"><div class="kpi-icon">📖</div><div class="kpi-val">${words.length}</div><div class="kpi-lbl">Szótárban lévő elemek</div></div>
  `;

  const tags = new Set();
  words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const tagStats = Array.from(tags).map(tag => {
    const tw = words.filter(w=>w.tags.includes(tag));
    const c = tw.reduce((s,w)=>s+w.stats.totalCorrect,0);
    const tot = tw.reduce((s,w)=>s+w.stats.totalCorrect+w.stats.totalWrong,0);
    return { tag, c, tot, pct: tot>0 ? Math.round(c/tot*100):0 };
  }).sort((a,b)=>b.pct-a.pct);

  document.getElementById('tag-perf-list').innerHTML = tagStats.length===0
    ? '<div style="color:var(--text-3);font-size:14px">Még nincs elég adat.</div>'
    : tagStats.map(t=>`
      <div class="tag-perf-item">
        <div class="tp-label">${tagLabel(t.tag)}</div>
        <div class="tp-bar-wrap"><div class="tp-bar" style="width:${t.pct}%"></div></div>
        <div class="tp-pct">${t.tot>0?t.pct+'%':'—'}</div>
      </div>`).join('');

  const sorted = [...words].sort((a,b)=>(b.stats.totalCorrect+b.stats.totalWrong)-(a.stats.totalCorrect+a.stats.totalWrong));
  
  document.getElementById('stats-table-header').innerHTML = currentMode === 'english' 
    ? `<th>Angol</th><th>Magyar</th><th>Streak 🔥</th><th>Helyes</th><th>Hibás</th><th>%</th><th>Szint</th>`
    : `<th>${currentMode === 'kanji' ? 'Kandzsi' : 'Kana'}</th><th>Magyar</th><th>Streak 🔥</th><th>Helyes</th><th>Hibás</th><th>%</th><th>JLPT</th>`;

  document.getElementById('word-stats-tbody').innerHTML = sorted.map(w=>{
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

  const hist = (state.globalStats.sessionHistory||[]).slice().reverse();
  document.getElementById('history-list').innerHTML = hist.length===0
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

function switchStatsTab(tab) { 
  ['topics','words','history'].forEach(t=>document.getElementById(`stats-${t}-tab`).style.display = t===tab?'':'none'); 
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.toggle('active', btn.getAttribute('onclick').includes(tab)));
}

/* ══════════════════════════════════════════════════════
   BIZTONSÁGI MENTÉS & IMPORT / EXPORT LOGIKA
══════════════════════════════════════════════════════ */

function exportData() {
  const dataStr = localStorage.getItem('lexilearn_v5');
  if (!dataStr) { showToast('Nincs mit menteni!'); return; }
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LexiLearn_Mentes_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Biztonsági mentés letöltve!');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      JSON.parse(content); 
      localStorage.setItem('lexilearn_v5', content);
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
  saveState(); closeModal('import-modal'); renderDashboard(); showToast(added+' elem importálva!');
}

function openAddModal() {
  document.getElementById('add-en').value = '';
  document.getElementById('add-hu').value = '';
  document.getElementById('add-tags').value = '';
  document.getElementById('add-syn').value = '';
  document.getElementById('add-sentence').value = '';

  const lblEn = document.getElementById('lbl-add-en');
  const lblSyn = document.getElementById('lbl-add-syn');
  const diffSelect = document.getElementById('add-diff');
  const title = document.getElementById('add-modal-title');

  if (currentMode === 'english') {
    title.innerText = '➕ Új angol szó';
    lblEn.innerText = 'Angol szó';
    lblSyn.innerText = 'Szinonima (opcionális)';
    diffSelect.innerHTML = '<option value="B1">B1</option><option value="B2" selected>B2</option><option value="C1">C1</option><option value="C2">C2</option>';
  } else if (currentMode === 'japanese') {
    title.innerText = '➕ Új japán szó';
    lblEn.innerText = 'Kana (Japán szó)';
    lblSyn.innerText = 'Romaji (Kötelező!)';
    diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  } else if (currentMode === 'kanji') {
    title.innerText = '➕ Új kandzsi';
    lblEn.innerText = 'Kandzsi (Jel)';
    lblSyn.innerText = 'On / Kun olvasat (vagy Romaji)';
    diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  }

  document.getElementById('add-modal').classList.add('open');
}

function doAddWord() {
  const en = document.getElementById('add-en').value.trim();
  const hu = document.getElementById('add-hu').value.trim();
  const tagsRaw = document.getElementById('add-tags').value.trim();
  const diff = document.getElementById('add-diff').value;
  const synOrRomaji = document.getElementById('add-syn').value.trim();
  const sentence = document.getElementById('add-sentence').value.trim();

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

  saveState();
  closeModal('add-modal');
  applyFilters(); 
  showToast('Sikeresen hozzáadva: ' + en);
}

function closeModal(id) { 
  document.getElementById(id).classList.remove('open'); 
}

/* --- Eszközök --- */
let toastTimer;
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),3000); }
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escRegex(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
loadState();