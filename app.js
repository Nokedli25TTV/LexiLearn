/* ══════════════════════════════════════════════════════
   DEBUG ÉS BIZTONSÁGI ELLENŐRZÉS
══════════════════════════════════════════════════════ */
console.log("[LexiLearn] App.js betöltése elindult...");

if (typeof SAMPLE_WORDS === 'undefined') {
    console.error("[LexiLearn HIBA] A data.js nem töltődött be!");
    alert("Kritikus hiba: A szavakat tartalmazó adatfájl (data.js) nem található!");
    window.SAMPLE_WORDS = [];
}

/* ══════════════════════════════════════════════════════
   TAG EMOJI MAP (KIBŐVÍTETT)
══════════════════════════════════════════════════════ */
const TAG_EMOJIS = {
  // Eredeti kategóriák
  'gyümölcs': '🍎', 'ételek': '🍕', 'italok': '🥤', 'állatok': '🐾', 'háziállatok': '🐶',
  'közlekedés': '🚗', 'utazás': '🧳', 'otthon': '🏠', 'természet': '🌿', 'munka': '💼',
  'egészség': '🧪', 'iskola': '🎒', 'érzelmek': '💛', 'haladó': '🎓',
  
  // ÚJ KATEGÓRIÁK (Lefordítva magyarra)
  'fantázia': '🐉',         // Fantasy
  'nyomozás': '🔎',         // Investigation
  'vallás': '🙏',           // Religion
  'politika': '🏛️',         // Politics
  'gazdaság': '📈',         // Economy
  'tudomány': '🔬',         // Science
  'pszichológia': '🧠',     // Psychology
  'mindennapi élet': '☕',  // Everyday Life
  'hadászat': '⚔️',         // Warfare
  'történelem': '📜',       // History
  'mitológia': '🏺',        // Mythology
  'kommunikáció': '💬',     // Communication
  'földrajz': '🌍',         // Geography
  'veszély': '⚠️',          // Danger
  'kultúra': '🎭',          // Culture
  'erőforrások': '💎',      // Resources
  'tárgyak': '📦'           // Objects
};

function tagLabel(tag) {
  const emoji = TAG_EMOJIS[tag] || '';
  return emoji ? emoji + ' ' + tag : tag;
}

/* ══════════════════════════════════════════════════════
   STATE (ÁLLAPOT)
══════════════════════════════════════════════════════ */
let state = {
  words: [],
  selectedIds: new Set(),
  filters: { search: '', topicSearch: '', tags: [], diff: new Set(), sort: 'az' },
  direction: 'en-hu',
  activeViewTab: 'words',
  practice: { roundNumber: 0, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: 0, sessionHistory: [] },
  globalStats: { totalSessions: 0, totalCorrect: 0, totalWrong: 0, sessionHistory: [], studyDays: {}, recordStreak: 0, lastStudiedTopic: null }
};

function migrateDiff(d) {
  if (['B1','B2','C1','C2'].includes(d)) return d;
  const map = {1:'B1',2:'B1',3:'B2',4:'C1',5:'C2'};
  if (typeof d === 'number' && map[d]) return map[d];
  return map[parseInt(d)] || 'B2';
}

function diffOrder(d) { return {B1:0,B2:1,C1:2,C2:3}[d] ?? 1; }

/* ══════════════════════════════════════════════════════
   STORAGE & INIT (TISZTA LAP - V4)
══════════════════════════════════════════════════════ */
function saveState() {
  const toSave = { words: state.words, direction: state.direction, globalStats: state.globalStats };
  try { localStorage.setItem('lexilearn_v4', JSON.stringify(toSave)); } catch(e) {}
}

function loadState() {
  try {
    // Csak a V4-et keressük, a régebbi mentéseket ignoráljuk a statisztika reset miatt!
    const raw = localStorage.getItem('lexilearn_v4');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.words && saved.words.length > 0) {
        state.words = saved.words.map(w => ({ ...w, diff: migrateDiff(w.diff), sentence: w.sentence || '' }));
      } else { initWords(); }
      if (saved.direction) state.direction = saved.direction;
      if (saved.globalStats) {
        state.globalStats = { ...state.globalStats, ...saved.globalStats };
        if (!state.globalStats.studyDays) state.globalStats.studyDays = {};
      }
    } else { initWords(); }
  } catch(e) { initWords(); }
}

function initWords() {
  state.words = SAMPLE_WORDS.map((w, i) => ({
    id: 'w' + Date.now() + i,
    en: w.en, hu: w.hu, tags: w.tags, diff: w.diff, syn: w.syn || '', sentence: w.sentence || '',
    stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }
  }));
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
  document.getElementById('ms-last-topic').textContent = state.globalStats.lastStudiedTopic ? (TAG_EMOJIS[state.globalStats.lastStudiedTopic]||'') + ' ' + state.globalStats.lastStudiedTopic : '—';
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
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  let filtered = state.words.filter(w => {
    if (search && !w.en.toLowerCase().includes(search) && !w.hu.toLowerCase().includes(search)) return false;
    if (state.filters.tags.length > 0 && !state.filters.tags.some(t => w.tags.includes(t))) return false;
    if (state.filters.diff.size > 0 && !state.filters.diff.has(w.diff)) return false;
    return true;
  });

  const sort = state.filters.sort;
  if      (sort === 'az')         filtered.sort((a,b) => a.en.localeCompare(b.en));
  else if (sort === 'za')         filtered.sort((a,b) => b.en.localeCompare(a.en));
  else if (sort === 'diff-asc')   filtered.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (sort === 'diff-desc')  filtered.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));
  else if (sort === 'unlearned')  filtered.sort((a,b) => a.stats.streak - b.stats.streak);
  else if (sort === 'mastered')   filtered.sort((a,b) => b.stats.streak - a.stats.streak);

  document.getElementById('word-count-label').innerHTML = `Szólista <span style="color:var(--text-3);font-weight:500;text-transform:none;letter-spacing:0;font-size:12px;margin-left:4px">(${filtered.length} szó)</span>`;
  renderWordList(filtered);
  renderSentenceList(filtered);
}

function renderWordList(words) {
  const container = document.getElementById('word-list');
  if (words.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px">Nincs találat.</div>'; return; }
  container.innerHTML = words.map(w => {
    const selected = state.selectedIds.has(w.id);
    const pct = w.stats.totalCorrect+w.stats.totalWrong>0 ? Math.round(w.stats.totalCorrect/(w.stats.totalCorrect+w.stats.totalWrong)*100) : null;
    return `
      <div class="word-item ${selected?'selected':''}" data-id="${w.id}" onclick="toggleWordSelection('${w.id}')">
        <div class="word-checkbox">${selected?'✓':''}</div>
        <div class="word-info"><div class="word-en">${escHtml(w.en)}</div><div class="word-hu">${escHtml(w.hu)}</div></div>
        <div class="word-meta">
          ${w.stats.streak > 0 ? `<span class="word-streak">🔥${w.stats.streak}</span>` : ''}
          ${pct !== null ? `<span class="word-streak">${pct}%</span>` : ''}
          <div class="diff-pip d${w.diff}" title="${w.diff}"></div>
        </div>
      </div>`;
  }).join('');
}

function renderSentenceList(words) {
  const container = document.getElementById('sentence-list');
  if (words.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px">Nincs találat.</div>'; return; }
  container.innerHTML = words.map(w => {
    let displayed = w.sentence ? escHtml(w.sentence).replace(new RegExp('\\b(' + escRegex(w.en) + ')\\b', 'gi'), m => `<strong class="en-highlight">${m}</strong>`) : `<em>Nincs példamondat.</em>`;
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
}
function selectAll() { document.querySelectorAll('.word-item[data-id]').forEach(el=>{ state.selectedIds.add(el.dataset.id); el.classList.add('selected'); el.querySelector('.word-checkbox').textContent = '✓'; }); updateStartPanel(); }
function selectNone() { state.selectedIds.clear(); document.querySelectorAll('.word-item.selected').forEach(el=>{ el.classList.remove('selected'); el.querySelector('.word-checkbox').textContent = ''; }); updateStartPanel(); }
function updateStartPanel() {
  const cnt = state.selectedIds.size;
  document.getElementById('selected-count-big').textContent = cnt;
  document.getElementById('start-btn').disabled = cnt === 0;
}

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC
══════════════════════════════════════════════════════ */
function startPractice() {
  const selectedWords = state.words.filter(w => state.selectedIds.has(w.id));
  if (selectedWords.length === 0) return;
  const qCount = Math.min(parseInt(document.getElementById('q-count').value) || 20, selectedWords.length);

  state.practice = {
    roundNumber: 1, roundWords: shuffle([...selectedWords]).slice(0, qCount).map(w => w.id),
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

  document.getElementById('question-area').innerHTML = `
    <div class="q-card" id="q-card">
      <div class="q-hint" style="display:flex; justify-content:center; align-items:center; margin-bottom:14px;">
        <span style="letter-spacing:0.1em; color:var(--text-3); font-weight:800; font-size:11px; text-transform:uppercase;">
          ${isEnHu ? '🇬🇧 ANGOL → MAGYAR' : '🇭🇺 MAGYAR → ANGOL'}
        </span>
        <span style="margin: 0 8px; color: var(--border);">|</span>
        <span class="diff-pill d${word.diff}" style="font-size:11px; padding:2px 8px;">${word.diff}</span>
      </div>

      <div class="q-word" style="margin-bottom:6px;">${escHtml(question)}</div>

      <div class="q-tags" style="margin-bottom:18px; display:flex; justify-content:center; gap:6px;">
        ${word.tags.map(t => `<span class="q-tag" style="background:var(--surface-2); color:var(--text-3); padding:4px 12px; border-radius:12px; font-size:11px; font-weight:700;">${tagLabel(t)}</span>`).join('')}
      </div>

      <button class="speak-btn" id="speak-btn" onclick="speakWord('${escHtml(isEnHu ? word.en : word.hu)}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      </button>

      <div class="options-grid">
        ${options.map(opt => `<button class="opt-btn" onclick="checkAnswer(this,'${escHtml(opt)}','${escHtml(correct)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      
      <button class="dont-know" style="margin-top:10px;" onclick="checkAnswer(null,null,'${escHtml(correct)}')">Nem tudom :(</button>
    </div>
  `;

  setTimeout(() => {
    speakWord(isEnHu ? word.en : word.hu);
  }, 300);
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
  }

  if (word) {
    if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
    else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
    word.stats.lastAttempt = Date.now();
  }

  setTimeout(() => {
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
  }, isCorrect ? 700 : 1400);
}

function speakWord(text) {
  window.speechSynthesis?.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = state.direction === 'en-hu' ? 'en-US' : 'hu-HU';
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
  state.globalStats.studyDays[todayKey()] = true;
  state.globalStats.totalSessions++; state.globalStats.totalCorrect += p.sessionCorrect; state.globalStats.totalWrong += p.sessionWrong;
  saveState(); showScreen('dashboard'); showToast('Gyakorlás befejezve!');
}

function confirmQuit() { if (confirm('Biztosan ki szeretnél lépni?')) showScreen('dashboard'); }

/* ══════════════════════════════════════════════════════
   STATS, MODALS & UTILS
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
    <div class="kpi-card"><div class="kpi-icon">📖</div><div class="kpi-val">${words.length}</div><div class="kpi-lbl">Szótárban szereplő szavak</div></div>
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
    : hist.map(h=>`
      <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-size:13px;color:var(--text-2)">${h.date}</div>
          <div style="font-size:14px;font-weight:700">${h.correct} helyes / ${h.wrong} hibás</div>
        </div>
        <div style="display:flex;gap:10px;font-size:12px;color:var(--text-3)">
          <span>${h.rounds} kör</span>
          <span>${h.duration<60?h.duration+'s':Math.floor(h.duration/60)+'m'}</span>
        </div>
      </div>`).join('');
}

function switchStatsTab(tab) { 
  ['topics','words','history'].forEach(t=>document.getElementById(`stats-${t}-tab`).style.display = t===tab?'':'none'); 
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.toggle('active', btn.getAttribute('onclick').includes(tab)));
}

function openImportModal() { document.getElementById('import-textarea').value=''; document.getElementById('import-modal').classList.add('open'); }

function doImport() {
  const text = document.getElementById('import-textarea').value.trim();
  if (!text) return;
  let added = 0;
  text.split('\n').filter(l=>l.trim()).forEach(line=>{
    const parts = line.split(',').map(p=>p.trim().replace(/^"|"$/g,''));
    if (parts.length < 2) return;
    const [en, hu, tagsStr, diffStr] = parts;
    if (!en||!hu) return;
    const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
    const diff = migrateDiff(diffStr || 'B2');
    if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
    state.words.push({
      id:'w'+Date.now()+Math.random(), en, hu, tags, diff, syn:'', sentence:'',
      stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null}
    });
    added++;
  });
  saveState();
  closeModal('import-modal');
  renderDashboard();
  showToast(added+' szó importálva!');
}

function openAddModal() { document.getElementById('add-modal').classList.add('open'); }

function doAddWord() {
  const en = document.getElementById('add-en').value.trim();
  const hu = document.getElementById('add-hu').value.trim();
  if (!en||!hu) { showToast('Az angol és magyar mező kötelező!'); return; }

  const tagsRaw = document.getElementById('add-tags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
  const diff = document.getElementById('add-diff').value || 'B2';
  const syn  = document.getElementById('add-syn').value.trim();
  const sentence = document.getElementById('add-sentence').value.trim();

  if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) {
    showToast('Ez a szó már szerepel az adatbázisban!'); return;
  }

  state.words.push({ id:'w'+Date.now(), en, hu, tags, diff, syn, sentence, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  saveState();

  ['add-en','add-hu','add-tags','add-syn','add-sentence'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('add-diff').value='B2';

  closeModal('add-modal');
  renderDashboard();
  showToast('Szó hozzáadva: '+en);
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

let toastTimer;
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),3000); }

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escRegex(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// --- Inicializálás indítása ---
loadState();
renderDashboard();