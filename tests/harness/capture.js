// Golden master rögzítés: ugyanazokat a lépéseket futtatja a régi és az új kódon.
// api   – a függvények (régi: window; új: a modulok exportjai)
// win   – a jsdom ablak (DOM + window.appData + localforage stub)
// reseed(n) – a Math.random determinisztikus újraindítása
import { hash } from './env.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const html = (win, id) => { const el = win.document.getElementById(id); return el ? el.innerHTML.replace(/\s+/g, ' ').trim() : null; };
const text = (win, id) => { const el = win.document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
const ids = words => words.map(w => w.id);

// Determinisztikus szó-statisztikák (index alapján, nem véletlen)
function seedWordStats(words, today) {
  words.forEach((w, i) => {
    const practiced = i % 7 === 0;
    w.stats = {
      streak: practiced ? i % 6 : 0,
      totalCorrect: practiced ? (i % 9) + 1 : 0,
      totalWrong: practiced ? i % 4 : 0,
      lastAttempt: practiced ? 1759100000000 + i : null
    };
    if (i % 11 === 0 && !practiced) w.stats.learnedAt = today;
    if (i % 17 === 0 && practiced) w.stats.learnedAt = '2026-09-01';
    w.bookmarked = i % 13 === 0;
  });
}

function seedGlobalStats(gs) {
  gs.studyDays = {};
  ['2026-09-29', '2026-09-28', '2026-09-27', '2026-09-25', '2026-09-20', '2026-08-15'].forEach(k => { gs.studyDays[k] = true; });
  gs.recordStreak = 9;
  gs.dailyGoal = 10;
  gs.dailySince = '2026-09-20';
  gs.daily = {
    '2026-09-29': { a: 42, c: 35, k: 6, g: 2, s: 610 },
    '2026-09-28': { a: 120, c: 90, k: 10, g: 5, s: 1500 },
    '2026-09-25': { a: 3, c: 1, k: 0, g: 0, s: 40 },
    '2026-09-21': { a: 25, c: 20, k: 0, g: 0, s: 300 }
  };
  gs.sessionHistory = [
    { date: '2026. 09. 15. 18:10:00', correct: 18, wrong: 2, rounds: 2, duration: 420 },
    { date: '2026. 09. 22. 07:30:00', correct: 30, wrong: 5, rounds: 3, duration: 900 },
    { date: '2026. 08. 15. 21:00:00', correct: 5, wrong: 5, rounds: 1, duration: 120 }
  ];
}

const FILTER_COMBOS = {
  none: {},
  lesson3: { lesson: '3' },
  day2: { day: '2' },
  tagTransport: { tags: ['közlekedés'] },
  diffN4: { diff: ['N4'] },
  focus: { list: '__focus' },
  lessonAndDiff: { lesson: '5', diff: ['N5'] }
};

function applyCombo(filters, combo) {
  Object.assign(filters, { search: '', tags: [], diff: new Set(), lesson: 'all', day: 'all', list: 'all', sort: 'az' });
  if (combo.lesson) filters.lesson = combo.lesson;
  if (combo.day) filters.day = combo.day;
  if (combo.tags) filters.tags = [...combo.tags];
  if (combo.diff) filters.diff = new Set(combo.diff);
  if (combo.list) filters.list = combo.list;
}

export async function capture(api, win, reseed) {
  const out = {};
  const appData = win.appData;

  // Várjuk meg, hogy a betöltés (loadState) lefusson
  for (let i = 0; i < 200 && !(appData.japanese.words.length > 0 && appData.kanji.words.length > 0); i++) await wait(10);
  out.wordCounts = { en: appData.english.words.length, ja: appData.japanese.words.length, kj: appData.kanji.words.length };
  out.wordsHash = { en: hash(appData.english.words), ja: hash(appData.japanese.words), kj: hash(appData.kanji.words) };

  // ── Alapok ──
  out.basics = {
    today: api.todayKey(),
    dateKey: api.dateKey(new Date(2026, 0, 5)),
  };

  // ── Japán mód: statisztika-alap és szűrők ──
  api.setMode('japanese');
  const ja = appData.japanese;
  const today = api.todayKey();
  seedWordStats(ja.words, today);
  seedGlobalStats(ja.globalStats);
  out.basics.streak = api.calcStreak();
  out.basics.week = api.getWeekDays();
  out.basics.goal = api.getDailyGoal();
  out.basics.todayWords = ids(api.getTodayWords());
  out.basics.newCount = ja.words.filter(w => api.isNewWord(w)).length;

  out.filters = {};
  for (const [name, combo] of Object.entries(FILTER_COMBOS)) {
    applyCombo(ja.filters, combo);
    const matching = ja.words.filter(w => api.wordMatchesFilters(w));
    const pool = api.getNewWordPool();
    out.filters[name] = {
      matching: matching.length,
      matchingFirst: ids(matching.slice(0, 5)),
      pool: pool.length,
      poolFirst: ids(pool.slice(0, 10)),
      source: api.describePoolSource(),
      hasFilters: api.hasPoolFilters()
    };
  }
  applyCombo(ja.filters, {});
  ja.filters.search = 'ta';
  out.filters.searchTa = { matching: ja.words.filter(w => api.wordMatchesFilters(w)).length, ignoringSearch: ja.words.filter(w => api.wordMatchesFilters(w, { ignoreSearch: true })).length };

  // ── Gyakorlás fül: lista + rendezések ──
  api.showScreen('dashboard');
  out.library = {};
  for (const sort of ['az', 'za', 'diff-asc', 'diff-desc', 'unlearned', 'mastered']) {
    applyCombo(ja.filters, { lesson: '4' });
    ja.filters.sort = sort;
    const input = win.document.getElementById('search-input');
    if (input) input.value = '';
    api.applyFilters();
    const rows = [...win.document.querySelectorAll('#word-list .word-row')].slice(0, 6).map(r => r.dataset.id);
    out.library[sort] = { count: text(win, 'word-count-label'), rows, selectAll: text(win, 'select-all-btn') };
  }
  const firstRow = win.document.querySelector('#word-list .word-row');
  out.library.firstRowHtml = firstRow ? firstRow.outerHTML.replace(/\s+/g, ' ') : null;
  api.renderFilterBar();
  out.library.pills = html(win, 'filter-pills');
  for (const menu of ['lesson', 'day', 'tags', 'diff', 'list', 'sort']) {
    api.toggleFilterMenu(menu);
    out.library['menu_' + menu] = hash(html(win, 'filter-menu'));
    api.closeFilterMenu();
  }
  api.renderPracticeDock();
  out.library.dock = html(win, 'dock-settings');
  out.library.dockSummary = text(win, 'dock-summary');

  // Kijelölés
  api.selectNone();
  api.toggleSelectAll();
  out.library.selectedAfterAll = ja.selectedIds.size;
  out.library.startDisabled = win.document.getElementById('start-btn').disabled;
  api.selectNone();

  // ── Kezdőlap ──
  applyCombo(ja.filters, {});
  api.showScreen('home');
  out.home = {
    actions: html(win, 'home-actions'),
    source: html(win, 'goal-source'),
    streak: text(win, 'home-streak-text'),
    hint: text(win, 'home-streak-hint'),
    goal: `${text(win, 'goal-done')}/${text(win, 'goal-total')} ${text(win, 'goal-unit')}`,
    week: html(win, 'week-tracker')
  };

  // ── Napi feladatok ──
  reseed(101);
  const quests = api.generateDailyQuests();
  out.quests = quests.list.map(q => ({ type: q.type, target: q.target, label: q.label }));
  ja.dailyQuests = quests;
  api.renderDailyQuests();
  out.questsHtml = hash(html(win, 'daily-quests-container'));

  // ── Gyakorlás (klasszikus) ──
  reseed(202);
  api.selectNone();
  ja.words.slice(0, 12).forEach(w => ja.selectedIds.add(w.id));
  ja.practiceOptions = { type: 'classic', count: 10, order: 'random' };
  ja.direction = 'en-hu';
  api.startPractice();
  out.practice = { roundWords: [...ja.practice.roundWords], top: text(win, 'round-badge'), question: html(win, 'question-area') };
  const qWord = ja.words.find(w => w.id === ja.practice.roundWords[0]);
  const wrongBtn = [...win.document.querySelectorAll('.opt-btn')].find(b => b.textContent !== qWord.hu);
  api.checkAnswer(wrongBtn, wrongBtn.textContent, qWord.hu);
  await wait(600);
  out.practice.afterWrong = { stats: { ...qWord.stats }, errorList: [...ja.practice.errorList], nextShown: win.document.getElementById('next-btn-container').style.display, daily: { ...ja.globalStats.daily[today] } };

  // ── Új szavak tanulása ──
  reseed(303);
  api.showScreen('home');
  applyCombo(ja.filters, { lesson: '6' });
  const blocked = { goal: api.getDailyGoal(), today: api.getTodayWords().length };
  ja.globalStats.dailyGoal = 500; // a fixture sok "mai" szót tartalmaz; itt a limit ne állítsa meg
  api.startLearnSession();
  out.learnBlockedBefore = blocked;
  out.learn = { queue: [...ja.practice.queue], card: hash(html(win, 'question-area')) };
  api.resolveLearnCard(true);
  api.resolveLearnCard(false);
  out.learn.after = { learnedIds: [...ja.practice.learnedIds], queue: [...ja.practice.queue], againIds: [...ja.practice.againIds], todayWords: api.getTodayWords().length, top: text(win, 'prog-label') };

  // ── Statisztika ──
  applyCombo(ja.filters, {});
  api.showScreen('stats');
  const idx = api.buildDailyIndex();
  out.stats = {
    index: ['2026-09-29', '2026-09-28', '2026-09-22', '2026-09-15', '2026-08-15', '2026-09-01'].map(k => [k, idx[k] || null]),
    levels: [null, { a: 0, k: 0, g: 0, n: 0, studied: true }, { a: 25, k: 0, g: 0, n: 0 }, { a: 30, k: 15, g: 0, n: 10 }, { a: 100, k: 0, g: 0, n: 0 }]
      .map(e => api.activityLevel(e, 10)),
    maturity: api.computeMaturity(),
    kpis: html(win, 'kpi-strip'),
    heatmap: hash(html(win, 'heatmap-wrap')),
    heatmapNote: text(win, 'viz-cons-note'),
    maturityHtml: html(win, 'maturity'),
    acc: hash(html(win, 'acc-chart')),
    accNote: text(win, 'viz-acc-note'),
    focus: hash(html(win, 'focus-chart')),
    focusNote: text(win, 'viz-focus-note'),
    levelsHtml: html(win, 'level-perf-list'),
    tags: hash(html(win, 'tag-perf-list')),
    history: html(win, 'history-list')
  };

  // ── Angol és Kandzsi mód ──
  for (const mode of ['english', 'kanji']) {
    api.setMode(mode);
    const st = appData[mode];
    seedWordStats(st.words, today);
    api.showScreen('home');
    out[mode] = {
      pool: api.getNewWordPool().length,
      poolFirst: ids(api.getNewWordPool().slice(0, 8)),
      goal: api.getDailyGoal(),
      actions: html(win, 'home-actions')
    };
    api.showScreen('dashboard');
    out[mode].pills = html(win, 'filter-pills');
    out[mode].count = text(win, 'word-count-label');
  }

  // ── Tárolt formátum (localforage) ──
  await wait(50);
  const dump = win.localforage.__dump();
  out.storage = {
    keys: Object.keys(dump).sort(),
    settingsShape: Object.fromEntries(Object.entries(dump.lexi_settings || {}).map(([k, v]) => [k, v && typeof v === 'object' ? Object.keys(v).sort() : typeof v])),
    statsHash: hash(dump.lexi_stats)
  };
  return out;
}
