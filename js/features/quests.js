// LexiLearn – features/quests.js
// (V13.3: az egykori app.js-ből bontva.) V13.63: Napi feladatok 3.0 – a Kezdőlap tetején, kattinthatók.
// Módonként naponta három feladat, három fajtából egyet-egyet: gyakorlás (szavak, lecke, témakör,
// hibás, régen látott), szokás (esedékes ismétlés, idő, sorozat, hibátlan kör) és tartalom (a lecke
// nyelvtana, nap szava, kandzsi / radikál, ha már elkezdted, írás). Koppintásra elindul: az ismétlés és a
// nyelvtan közvetlenül, a gyakorlós feladatok az indító lappal (features/quest-launcher.js), előre
// kitöltött szűrőkkel. Az indítás az ablak függvényein át megy (nincs körkörös import).
import { GRAMMAR_NOTES } from '../core/data.js';
import { todayKey } from '../core/dates.js';
import { MODES, appData, currentMode, state, unitOf } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { az, escHtml, jsArg, shuffle } from '../core/util.js';
import { isStartedWord } from '../goal/jlpt.js';
import { getCurrentLessonProgress, logActivity } from '../habit/goal.js';
import { wordLessons } from '../library/filters.js';
import { getDueCards } from '../srs/schedule.js';
import { canAnimate } from '../ui/motion.js';

const svg = body => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const glyph = ch => `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17.5" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${ch}</text></svg>`;

// V13.2: egyszínű vonalikonok (a korábbi emojik és küldetésenkénti színek helyett)
const QUEST_ICONS = {
  LearnWords     : svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>'),
  LessonWords    : svg('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
  ReviewDue      : svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/>'),
  GrammarRead    : svg('<path d="M4 6h16M4 12h10M4 18h7"/><polyline points="16 15 18 17 22 13"/>'),
  PerfectRound   : svg('<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16 9.5"/>'),
  PracticeTime   : svg('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'),
  GhostHunter    : svg('<polyline points="3 4 3 10 9 10"/><path d="M3.5 15a9 9 0 1 0 2-9.4L3 10"/>'),
  StrictPerfect  : svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  Speed5in30     : svg('<polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>'),
  TagMaster      : svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  MistakeCleanup : svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  DailyWord      : svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  Combo5         : svg('<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>'),
  WritingPractice: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  KanaMaster     : glyph('あ'),
  KanjiMaster    : glyph('字'),
  KanjiPractice  : glyph('字'),
  RadicalPractice: glyph('部')
};
const QUEST_DONE_ICON = svg('<polyline points="20 6 9 17 4 12"/>');
const CHEVRON = '<svg class="dq-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

const ACC = { szó: 'szót', kanji: 'kandzsit', radikál: 'radikált' }; // tárgyeset: „Gyakorolj 10 szót”
const accUnit = (mode = currentMode) => ACC[unitOf(mode)] || 'szót';
const hasGrammarFor = lesson => currentMode === 'japanese' && !!GRAMMAR_NOTES[Number(lesson)]?.points?.length;
const startedIn = mode => (appData[mode]?.words || []).some(isStartedWord);
const pickOne = list => (list.length ? shuffle(list)[0] : null);
const quest = (type, target, label, params = {}) => ({ type, target, progress: 0, completed: false, label, params });

function generateDailyQuests() {
  const words = state.words;
  const today = todayKey();
  const mode = currentMode;
  const unit = accUnit(mode);
  const practice = [], habit = [], content = [];
  const lessonInfo = mode === 'japanese' || mode === 'radicals' ? getCurrentLessonProgress() : null;
  const lesson = lessonInfo ? lessonInfo.lesson : null;

  /* ── Gyakorlás ── */
  const lwTarget = shuffle([10, 15, 20])[0];
  practice.push(quest('LearnWords', lwTarget, `Gyakorolj ${lwTarget} ${unit}`));
  if (lesson) {
    const n = Math.min(10, words.filter(w => wordLessons(w).includes(String(lesson))).length);
    if (n >= 5) practice.push(quest('LessonWords', n, `Gyakorolj ${n} ${unit} ${az(lesson)} ${lesson}. leckéből`, { lesson }));
  }
  const tagMap = {};
  words.forEach(w => (w.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const validTags = Object.entries(tagMap).filter(([, c]) => c >= 5);
  if (validTags.length > 0) {
    const [tag, count] = pickOne(validTags);
    practice.push(quest('TagMaster', Math.min(10, count), `Tematikus nap: „${tag}”`, { tag }));
  }
  const topWrong = [...words].filter(w => w.stats.totalWrong > 0).sort((a, b) => b.stats.totalWrong - a.stats.totalWrong).slice(0, 5);
  if (topWrong.length >= 3) {
    const n = topWrong.length;
    practice.push(quest('MistakeCleanup', n, `Javítsd ${az(n)} ${n} legtöbbször elrontott ${unit}`, { wordIds: topWrong.map(w => w.id) }));
  }
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const ghost = words.filter(w => isStartedWord(w) && (!w.stats.lastAttempt || w.stats.lastAttempt < sevenDaysAgo));
  if (ghost.length >= 3) {
    const t = Math.min(5, ghost.length);
    practice.push(quest('GhostHunter', t, `Ismételj át ${t} régen látott ${unit}`, { ghostIds: ghost.map(w => w.id) }));
  }

  /* ── Szokás ── */
  const due = getDueCards(words, today).length;
  if (due >= 3) {
    const t = Math.min(due, 20);
    habit.push(quest('ReviewDue', t, `Ismételj át ${t} esedékes kártyát`));
  }
  const ptMin = shuffle([5, 10, 15])[0];
  habit.push(quest('PracticeTime', ptMin * 60, `Gyakorolj ${ptMin} percet`));
  habit.push(quest('Combo5', 5, '5 helyes válasz egymás után'));
  habit.push(quest('PerfectRound', 1, 'Csinálj egy hibátlan kört'));
  if (words.length >= 10) habit.push(quest('StrictPerfect', 1, 'Teljesíts hibátlanul egy 10+ kérdéses kört'));
  habit.push(quest('Speed5in30', 5, '5 helyes válasz 30 mp alatt', { windowStart: null }));

  /* ── Tartalom ── */
  if (lesson && hasGrammarFor(lesson)) content.push(quest('GrammarRead', 1, `Olvasd végig ${az(lesson)} ${lesson}. lecke nyelvtanát`, { lesson }));
  if (mode === 'japanese' && startedIn('kanji')) content.push(quest('KanjiPractice', 10, 'Gyakorolj 10 kandzsit', { mode: 'kanji' }));
  if ((mode === 'japanese' || mode === 'kanji') && startedIn('radicals')) content.push(quest('RadicalPractice', 10, 'Gyakorolj 10 radikált', { mode: 'radicals' }));
  if (mode === 'kanji') content.push(quest('WritingPractice', 5, 'Írj le 5 kandzsit vonásonként'));
  if (words.length > 0) {
    const dw = words[parseInt(today.replace(/-/g, ''), 10) % words.length];
    content.push(quest('DailyWord', 1, `Nap szava: „${dw.en}”`, { wordId: dw.id, wordEn: dw.en, wordHu: dw.hu }));
  }

  // Fajtánként egy, ha valamelyik üres, a többiből pótolva; mindig három
  const picked = [pickOne(practice), pickOne(habit), pickOne(content)].filter(Boolean);
  const rest = shuffle([...practice, ...habit, ...content].filter(q => !picked.includes(q)));
  while (picked.length < 3 && rest.length) picked.push(rest.shift());
  picked.forEach((q, i) => { q.id = 'q' + i; });
  return { date: today, list: picked };
}

function checkDailyReset() {
  const today = todayKey();
  const isOldFormat = !state.dailyQuests || !state.dailyQuests.list; // régi formátum
  if (isOldFormat || state.dailyQuests.date !== today) {
    state.dailyQuests = generateDailyQuests();
    saveStats(); // napi reset csak statot érint
  }
}

// A mostani esemény mely feladatokra hat: a mód saját listája (a más módba mutatók nélkül), és a
// többi mód mai listájából azok, amelyek ide mutatnak (pl. japán módban „Gyakorolj 10 kandzsit”)
function activeQuests() {
  const today = todayKey();
  const own = (state.dailyQuests?.list || []).filter(q => !q.params?.mode || q.params.mode === currentMode);
  const cross = MODES.filter(m => m !== currentMode).flatMap(m => {
    const dq = appData[m]?.dailyQuests;
    return dq && dq.date === today && Array.isArray(dq.list) ? dq.list.filter(q => q.params?.mode === currentMode) : [];
  });
  return [...own, ...cross];
}

/* ══════════════════════════════════════════════════════
   V8: EVENT BUS – updateQuestProgress
   Hívva minden helyes/hibás válasznál, kör végén, ismétlésnél (V13.63) és a nyelvtan végén (V13.63).
══════════════════════════════════════════════════════ */
function updateQuestProgress(eventType, data = {}) {
  if (eventType === 'wordAnswered') logActivity({ correct: !!data.isCorrect }); // V13.2: napi napló
  let changed = false;

  activeQuests().forEach(q => {
    if (q.completed) return;
    const prev = q.progress;

    if (eventType === 'wordAnswered') {
      const { word, isCorrect } = data;
      if (!isCorrect) {
        if (q.type === 'Combo5') state.practice._combo = 0;
        if (q.type === 'Speed5in30') { q.params.windowStart = null; q.progress = 0; }
      } else {
        if (['LearnWords', 'KanjiPractice', 'RadicalPractice'].includes(q.type)) q.progress++;
        if (q.type === 'KanaMaster' && currentMode === 'japanese') q.progress++;
        if (q.type === 'KanjiMaster' && currentMode === 'kanji') q.progress++;
        if (q.type === 'WritingPractice' && state.practice?.type === 'writing') q.progress++;
        if (q.type === 'LessonWords' && word && wordLessons(word).includes(String(q.params.lesson))) q.progress++;
        if (q.type === 'GhostHunter' && q.params.ghostIds?.includes(word.id)) q.progress++;
        if (q.type === 'TagMaster' && word.tags && word.tags.map(t => t.toLowerCase()).includes(q.params.tag.toLowerCase())) q.progress++;
        if (q.type === 'MistakeCleanup' && q.params.wordIds?.includes(word.id)) q.progress++;
        if (q.type === 'DailyWord' && word.id === q.params.wordId) q.progress = 1;
        if (q.type === 'Combo5') {
          state.practice._combo = (state.practice._combo || 0) + 1;
          q.progress = Math.max(q.progress, state.practice._combo);
        }
        if (q.type === 'Speed5in30') {
          const now = Date.now();
          if (!q.params.windowStart || now - q.params.windowStart > 30000) { q.params.windowStart = now; q.progress = 1; } else q.progress++;
        }
      }
    }

    if (eventType === 'reviewDone' && q.type === 'ReviewDue') q.progress++;
    if (eventType === 'grammarDone' && q.type === 'GrammarRead' && Number(data.lesson) === Number(q.params.lesson)) q.progress = 1;

    if (eventType === 'roundEnd') {
      const { roundWrong, roundLength, elapsed } = data;
      if (q.type === 'PerfectRound' && roundWrong === 0 && roundLength > 0) q.progress = 1;
      if (q.type === 'StrictPerfect' && roundWrong === 0 && roundLength >= 10) q.progress = 1;
      if (q.type === 'PracticeTime') q.progress = Math.min(q.target, (q.progress || 0) + elapsed);
    }

    if (!q.completed && q.progress >= q.target) q.completed = true;
    if (q.progress !== prev) changed = true;
  });

  if (changed) {
    saveStats(); // a feladatok haladása csak statot érint
    renderDailyQuests();
  }
}

/* ══════════════════════════════════════════════════════
   V13.63: a Kezdőlap feladat-kártyája
══════════════════════════════════════════════════════ */
function questLabel(q) {
  // V13.2: felnőtt nevezéktan – a régi mentésekben álló címkét is az új szöveg váltja
  if (q.type === 'GhostHunter') return `Ismételj át ${q.target} régen látott ${accUnit()}`;
  if (q.type === 'MistakeCleanup') return `Javítsd ${az(q.target)} ${q.target} legtöbbször elrontott ${accUnit()}`;
  if (q.type === 'TagMaster') return `Tematikus nap: „${q.params.tag}”`;
  return q.label;
}

function questMeta(q) {

  if (q.type === 'DailyWord') return `${q.params.wordEn} = ${q.params.wordHu}`;
  if (q.type === 'KanjiPractice') return 'Kandzsi módban';
  if (q.type === 'RadicalPractice') return 'Radikál módban';
  if (q.type === 'ReviewDue') return 'Az ismétlés indul';
  if (q.type === 'GrammarRead') return 'Lépésenként, a lecke sorrendjében';
  return '';
}

function progressText(q) {
  if (q.type === 'PracticeTime') return `${Math.floor(Math.min(q.progress, q.target) / 60)}/${q.target / 60} perc`;
  return `${Math.min(q.progress, q.target)}/${q.target}`;
}

// V13.65: a most teljesült feladat sora egyszer kiemelkedik (a pipa beúszik); mód és nap szerint
const _doneSeen = new Map();

function renderDailyQuests() {
  checkDailyReset();
  const cont = document.getElementById('daily-quests-container');
  if (!cont) return;
  const list = state.dailyQuests?.list || [];
  const doneEl = document.getElementById('quests-done');
  if (doneEl) doneEl.textContent = list.length ? `${list.filter(q => q.completed).length} / ${list.length} kész` : '';
  if (!list.length) { cont.innerHTML = ''; return; }
  const seenKey = `${currentMode}:${state.dailyQuests.date}`;
  const seen = _doneSeen.get(seenKey);
  const justDone = new Set(seen && canAnimate() ? list.filter(q => q.completed && !seen.has(q.id)).map(q => q.id) : []);
  _doneSeen.set(seenKey, new Set(list.filter(q => q.completed).map(q => q.id)));

  cont.innerHTML = list.map(q => {
    const done = q.completed;
    const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
    const label = escHtml(questLabel(q));
    const meta = questMeta(q);
    const inner = `
      <span class="dq-icon" aria-hidden="true">${done ? QUEST_DONE_ICON : (QUEST_ICONS[q.type] || QUEST_ICONS.TagMaster)}</span>
      <span class="dq-body">
        <span class="dq-title">${label}</span>
        ${meta && !done ? `<span class="dq-meta">${escHtml(meta)}</span>` : ''}
        <span class="dq-bar" aria-hidden="true"><i style="transform:scaleX(${pct / 100})"></i></span>
      </span>
      <span class="dq-prog">${done ? 'Kész' : progressText(q)}</span>`;
    return done
      ? `<div class="dq-item is-done${justDone.has(q.id) ? ' just-done' : ''}" data-q="${escHtml(q.id)}">${inner}</div>`
      : `<button type="button" class="dq-item" data-q="${escHtml(q.id)}" onclick="openQuest(${jsArg(q.id)})" aria-label="${label}, ${escHtml(progressText(q))}. Indítás">${inner}${CHEVRON}</button>`;
  }).join('');
}

/* ── Indítás koppintásra ── */
function openQuest(id) {
  const q = (state.dailyQuests?.list || []).find(x => x.id === id);
  if (!q || q.completed) return;
  const w = typeof window !== 'undefined' ? window : {};
  const launch = preset => w.openQuestLauncher && w.openQuestLauncher({ title: questLabel(q), ...preset });
  switch (q.type) {
    case 'ReviewDue': w.startReviewSession && w.startReviewSession(); return;
    case 'GrammarRead': w.openGrammar && w.openGrammar(q.params.lesson); return;
    case 'DailyWord':
      if (currentMode === 'japanese' && w.openWordInfo) { w.openWordInfo(q.params.wordId); return; }
      launch({ fixedIds: [q.params.wordId], fixedLabel: 'A nap szava' }); return;
    case 'KanjiPractice':
    case 'RadicalPractice':
      if (w.setMode) w.setMode(q.params.mode);
      launch({}); return;
    case 'LessonWords': launch({ lessons: [String(q.params.lesson)] }); return;
    case 'TagMaster': launch({ tags: [q.params.tag] }); return;
    case 'MistakeCleanup': launch({ fixedIds: q.params.wordIds, fixedLabel: 'A legtöbbször elrontottak' }); return;
    case 'GhostHunter': launch({ fixedIds: q.params.ghostIds, fixedLabel: 'Régen látottak' }); return;
    case 'WritingPractice': launch({ type: 'writing' }); return;
    case 'StrictPerfect': launch({ minCount: 10 }); return;
    default: launch({});
  }
}

export { QUEST_DONE_ICON, QUEST_ICONS, checkDailyReset, generateDailyQuests, openQuest, renderDailyQuests, updateQuestProgress };
