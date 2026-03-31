/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] App.js V6.6 (Sentence Fill Mode) indítása...");

if (typeof SAMPLE_WORDS === 'undefined') window.SAMPLE_WORDS = [];
if (typeof JAPANESE_WORDS === 'undefined') window.JAPANESE_WORDS = [];
if (typeof KANJI_DATA === 'undefined') window.KANJI_DATA = [];
if (typeof JAPANESE_SENTENCES === 'undefined') window.JAPANESE_SENTENCES = [];

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
  saveState();
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
    filters: { search: '', topicSearch: '', tags: [], diff: new Set(), lesson: 'all', sort: 'az' },
    direction: 'en-hu', activeViewTab: 'words',
    practice: { roundNumber: 0, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: 0, sessionStartTime: 0, sessionCorrect: 0, sessionWrong: 0, type: 'classic', currentSentenceObj: null },
    globalStats: { totalSessions: 0, totalCorrect: 0, totalWrong: 0, sessionHistory: [], studyDays: {}, recordStreak: 0, lastStudiedTopic: null },
    dailyQuests: { date: '', wordsPracticed: 0, perfectRounds: 0, practiceTimeSeconds: 0 }
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
    theme: document.documentElement.getAttribute('data-theme') || 'light',
    english:  { words: appData.english.words,  playlists: appData.english.playlists,  globalStats: appData.english.globalStats, dailyQuests: appData.english.dailyQuests, direction: appData.english.direction,  filters: { ...appData.english.filters, diff: Array.from(appData.english.filters.diff) },  selectedIds: Array.from(appData.english.selectedIds) },
    japanese: { words: appData.japanese.words, playlists: appData.japanese.playlists, globalStats: appData.japanese.globalStats, dailyQuests: appData.japanese.dailyQuests, direction: appData.japanese.direction, filters: { ...appData.japanese.filters, diff: Array.from(appData.japanese.filters.diff) }, selectedIds: Array.from(appData.japanese.selectedIds) },
    kanji:    { words: appData.kanji.words,    playlists: appData.kanji.playlists,    globalStats: appData.kanji.globalStats, dailyQuests: appData.kanji.dailyQuests,   direction: appData.kanji.direction,    filters: { ...appData.kanji.filters, diff: Array.from(appData.kanji.filters.diff) },       selectedIds: Array.from(appData.kanji.selectedIds) }
  };
  try { localStorage.setItem('lexilearn_v5', JSON.stringify(toSave)); } catch(e) {}
}

function loadState() {
  let savedMode = 'english';
  let savedTheme = 'light'; 
  
  try {
    const rawV5 = localStorage.getItem('lexilearn_v5');
    if (rawV5) {
      const parsed = JSON.parse(rawV5);
      savedMode = parsed.lastMode || 'english';
      savedTheme = parsed.theme || 'light';
      
      ['english', 'japanese', 'kanji'].forEach(lang => {
        if(parsed[lang]) {
          appData[lang].words = parsed[lang].words || [];
          appData[lang].playlists = parsed[lang].playlists || [];
          appData[lang].globalStats = parsed[lang].globalStats || createEmptyState().globalStats;
          appData[lang].dailyQuests = parsed[lang].dailyQuests || { date: '', wordsPracticed: 0, perfectRounds: 0, practiceTimeSeconds: 0 };
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
      syncNewWords();
    }
  } catch(e) { syncNewWords(); }
  
  cleanTags();
  applyTheme(savedTheme); 
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
  if (appData.english.words.length === 0 && SAMPLE_WORDS.length > 0) {
    appData.english.words = SAMPLE_WORDS.map((w,i) => ({
      id: 'en_' + i, en: w.en, hu: w.hu, tags: w.tags, diff: w.diff || 'B2', syn: w.syn || '', sentence: w.sentence || '',
      stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
    }));
  }
  
  const existingJpIds = new Set(appData.japanese.words.map(w => w.en)); 
  
  const DEKIRU_WORDS = [];
  for (let i = 1; i <= 100; i++) {
    try {
      const list = eval('DEKIRU_L' + i);
      if (list) DEKIRU_WORDS.push(...list);
    } catch(e) { }
  }

  DEKIRU_WORDS.forEach((w, i) => {
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
    saveState();
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

function checkDailyReset() {
  const today = todayKey();
  if (state.dailyQuests.date !== today) {
    state.dailyQuests = { date: today, wordsPracticed: 0, perfectRounds: 0, practiceTimeSeconds: 0 };
    saveState();
  }
}

function renderDailyQuests() {
  checkDailyReset();
  const q = state.dailyQuests;
  const cont = document.getElementById('daily-quests-container');
  if (!cont) return;

  const wTarget = 10;
  const pTarget = 1;
  const tTarget = 300; 

  const wPct = Math.min(100, Math.round((q.wordsPracticed / wTarget) * 100));
  const pPct = Math.min(100, Math.round((q.perfectRounds / pTarget) * 100));
  const tPct = Math.min(100, Math.round((q.practiceTimeSeconds / tTarget) * 100));

  cont.innerHTML = `
    <div class="quest-item ${wPct >= 100 ? 'completed' : ''}">
      <div class="quest-info"><span class="quest-title">Tanulj ${wTarget} új szót</span><span class="quest-prog">${Math.min(q.wordsPracticed, wTarget)}/${wTarget}</span></div>
      <div class="quest-bar-bg"><div class="quest-bar-fill" style="width:${wPct}%"></div></div>
    </div>
    <div class="quest-item ${pPct >= 100 ? 'completed' : ''}">
      <div class="quest-info"><span class="quest-title">Csinálj egy hibátlan kört</span><span class="quest-prog">${Math.min(q.perfectRounds, pTarget)}/${pTarget}</span></div>
      <div class="quest-bar-bg"><div class="quest-bar-fill" style="width:${pPct}%"></div></div>
    </div>
    <div class="quest-item ${tPct >= 100 ? 'completed' : ''}">
      <div class="quest-info"><span class="quest-title">Gyakorolj 5 percet</span><span class="quest-prog">${Math.floor(Math.min(q.practiceTimeSeconds, tTarget)/60)}/5m</span></div>
      <div class="quest-bar-bg"><div class="quest-bar-fill" style="width:${tPct}%"></div></div>
    </div>
  `;
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

function setDirection(dir) { state.direction = dir; updateDirectionUI(); saveState(); }

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
  saveState(); 
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

function renderSentenceList(words) {
  const container = document.getElementById('sentence-list');
  if (!container) return;
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
  saveState(); 
}

function selectAll() { 
  document.querySelectorAll('.word-item[data-id]').forEach(el=>{ 
    state.selectedIds.add(el.dataset.id); 
    el.classList.add('selected'); 
    const cb = el.querySelector('.word-checkbox');
    if(cb) cb.textContent = '✓'; 
  }); 
  updateStartPanel(); 
  saveState(); 
}

function selectNone() { 
  state.selectedIds.clear(); 
  document.querySelectorAll('.word-item.selected').forEach(el=>{ 
    el.classList.remove('selected'); 
    const cb = el.querySelector('.word-checkbox');
    if(cb) cb.textContent = ''; 
  }); 
  updateStartPanel(); 
  saveState(); 
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
  saveState(); closeModal('playlist-modal'); renderPlaylists(); showToast('Lista sikeresen elmentve!');
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
  
  applyFilters(); updateStartPanel(); saveState(); showToast('📂 ' + pl.name + ' hozzáadva!');
}

function deletePlaylist(id) {
  if(!confirm('Biztosan törlöd ezt a listát?')) return;
  state.playlists = state.playlists.filter(p => p.id !== id);
  saveState(); renderPlaylists();
}

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC (V6.6: MONDAT KIEGÉSZÍTŐ MOTOR)
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

  // 👇 ÚJ: Ha Mondat-kiegészítő módban vagyunk, szűrjük ki a mondat nélküli szavakat!
  if (type === 'sentenceFill') {
    if (currentMode === 'english') {
      showToast('A Példamondat mód jelenleg csak japánul érhető el!');
      return;
    }
    
    orderedWords = orderedWords.filter(w => 
      JAPANESE_SENTENCES && JAPANESE_SENTENCES.some(s => s.baseWord === w.en)
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
    type: type, currentSentenceObj: null
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

  // 👇 V6.6: ÚJ MONDAT KIEGÉSZÍTŐ (SENTENCE FILL) MÓD UI 👇
  if (p.type === 'sentenceFill') {
    hintText = `💬 MONDAT-KIEGÉSZÍTŐ (${isEnHu ? 'Olvasás' : 'Írás'})`;
    
    // Keresünk egy mondatot az adatbázisból ehhez a szóhoz
    const matchingSentences = JAPANESE_SENTENCES.filter(s => s.baseWord === word.en);
    const sObj = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
    p.currentSentenceObj = sObj; // Eltároljuk, hogy ellenőrzésnél tudjuk használni

    // Kicseréljük a ___BLANK___ részt a HTML animálható dobozára
    const sentenceDisplay = sObj.sentenceWithBlank.replace('___BLANK___', `<span class="blank-space" id="blank-space">...</span>`);
    
    // Megtévesztő opciók generálása a japán szótárból
    const allJpWords = appData.japanese.words.concat(appData.kanji.words);
    const fakeOptions = shuffle(allJpWords.filter(w => w.en !== sObj.correctAnswer)).slice(0, 3).map(w => isEnHu ? w.en : w.hu);
    const options = shuffle([isEnHu ? sObj.correctAnswer : word.hu, ...fakeOptions]);

    contentHtml = `
      <div class="q-word" style="font-size: 22px; margin-bottom:15px; line-height: 1.6;">${sentenceDisplay}</div>
      <div class="sentence-mode-hu">${escHtml(sObj.hungarian)}</div>
      
      <div class="options-grid" style="margin-top: 25px;">
        ${options.map(opt => `<button class="opt-btn" onclick="checkSentenceAnswer(this, '${escHtml(opt)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" style="margin-top:10px;" onclick="checkSentenceAnswer(null, null)">Nem tudom :(</button>
    `;
  } 
  // 👆 VÉGE A MONDAT MÓDNAK 👆

  else if (p.type === 'classic') { 
    const options = shuffle([correctText, ...shuffle(state.words.filter(w=>w.id!==word.id)).slice(0, 3).map(w=>isEnHu?w.hu:w.en)]);
    
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

// 👇 V6.6: ÚJ MONDAT ELLENŐRZŐ MOTOR 👇
function checkSentenceAnswer(btn, chosen) {
  const p = state.practice; 
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  const sObj = p.currentSentenceObj;
  
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
  
  checkDailyReset();
  state.dailyQuests.wordsPracticed++;

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

  // Statisztika mentése a szóhoz
  if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
  else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
  word.stats.lastAttempt = Date.now();

  // Felolvassa a *teljes japán mondatot*
  setTimeout(() => {
    // Animálva betöltjük a teljes Furiganás HTML-t, hogy lássa is a helyes alakot!
    if (isEnHu && sObj.fullSentenceHTML) {
      const sentenceContainer = document.querySelector('.q-word');
      if(sentenceContainer) {
        sentenceContainer.innerHTML = sObj.fullSentenceHTML;
        sentenceContainer.style.animation = 'popIn 0.3s';
      }
    }
    speakWord(sObj.ttsSentence, false);
  }, 100);

  setTimeout(() => {
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
  }, isCorrect ? 2500 : 3500); // Több időt hagyunk a mondat elolvasására!
}
// 👆 VÉGE A MONDAT ELLENŐRZŐNEK 👆


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
  state.dailyQuests.wordsPracticed++;

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

  setTimeout(() => {
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
  }, isCorrect ? 1200 : 2500);
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
  state.dailyQuests.wordsPracticed++;

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
  }

  if (!isCorrect && state.direction === 'hu-en') {
      speakWord(word.en, false);
  }

  setTimeout(() => {
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
  }, isCorrect ? 800 : 1800); 
}

/* ══════════════════════════════════════════════════════
   PRÉMIUM TTS HANG FELOLVASÓ
══════════════════════════════════════════════════════ */
function speakWord(text, forceHungarian = false) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  if (currentMode !== 'english' && (state.direction === 'en-hu' || !forceHungarian)) {
    u.lang = 'ja-JP';
    const jpVoice = voices.find(v => v.lang.includes('ja') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) 
                 || voices.find(v => v.lang.includes('ja'));
    if (jpVoice) u.voice = jpVoice;
    u.rate = 0.9; 
  } else {
    u.lang = (state.direction === 'en-hu' && forceHungarian) ? 'hu-HU' : 'en-US';
    u.rate = 1.0;
  }
  
  u.onerror = function(e) { console.log("TTS Hiba vagy nem támogatott nyelv: ", e); };
  window.speechSynthesis.speak(u);
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function showRoundEnd() {
  const p = state.practice;
  const total = p.roundWords.length;
  const pct = total > 0 ? Math.round(p.roundCorrect / total * 100) : 0;
  const elapsed = Math.round((Date.now() - p.roundStartTime) / 1000);
  
  checkDailyReset();
  state.dailyQuests.practiceTimeSeconds += elapsed;
  if (p.roundWrong === 0 && total > 0) {
    state.dailyQuests.perfectRounds++;
  }
  saveState();
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

function switchStatsTab(tab) { 
  ['topics','words','history', 'heatmap'].forEach(t => {
    const el = document.getElementById(`stats-${t}-tab`);
    if(el) el.style.display = t === tab ? 'block' : 'none';
  }); 
  
  document.querySelectorAll('#screen-stats .nav-tab').forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    if (onclickAttr.includes(`'${tab}'`)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* ══════════════════════════════════════════════════════
   IMPORT / EXPORT
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

  saveState();
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
   INIT
══════════════════════════════════════════════════════ */
loadState();