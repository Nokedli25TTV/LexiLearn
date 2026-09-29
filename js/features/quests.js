// LexiLearn – features/quests.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { todayKey } from '../core/dates.js';
import { currentMode, state } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { escHtml, shuffle } from '../core/util.js';
import { logActivity } from '../habit/goal.js';

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

export { QUEST_DONE_ICON, QUEST_ICONS, checkDailyReset, generateDailyQuests, renderDailyQuests, updateQuestProgress };
