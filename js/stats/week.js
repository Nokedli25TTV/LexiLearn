// LexiLearn – stats/week.js
// V13.13: HETI ÖSSZEFOGLALÓ – a Statisztika alképernyője, hétfőtől vasárnapig, hetenként lapozható.
// Mit mutat: az aktív napokat, négy számot az előző héthez mérve (megtanult, válaszok, pontosság,
// fókuszált idő), a JLPT haladás heti változását, a héten elrontott és azóta nem javított szavakat
// (egy koppintással gyakorolhatók), a módonkénti bontást és a napi adatok táblázatát.
// A számok ugyanabból a napi naplóból jönnek, mint a Statisztika ábrái (buildDailyIndex), a
// "megtanult" pedig ugyanaz a szabály, mint mindenhol (isLearnedWord). Nincs jutalom és nincs
// ítélet: a hét tényei, és ami belőlük a következő lépés.
import { HU_MONTHS, addDays, dateKey, fmtDay, fmtDuration, fmtNum, keyToDate, startOfWeek, todayKey } from '../core/dates.js';
import { appData, currentMode, MODE_LABELS, state, unitOf } from '../core/state.js';
import { saveSettings, saveStats } from '../core/storage.js';
import { escHtml } from '../core/util.js';
import { LEVELS, TARGETS, isLearnedWord, srsInterval } from '../goal/jlpt.js';
import { DEFAULT_DAILY_GOAL } from '../habit/goal.js';
import { dueForecast } from '../srs/schedule.js';
import { WEEK_CHECK_ICON } from '../features/streak.js';
import { activityLevel, buildDailyIndex } from './model.js';
import { dataTable, deltaChip, trendHtml } from './view.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

const DAY_LABELS = ['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'];
const MODES = ['japanese', 'kanji', 'radicals', 'english'];
const JLPT_TRACKS = [['words', 'japanese', 'Szókincs'], ['kanji', 'kanji', 'Kandzsi']];
const UNSURE_SHOWN = 6;

const goalFor = mode => appData[mode].globalStats.dailyGoal || DEFAULT_DAILY_GOAL[mode] || 10;
// A megtanulás napja, ha ismert (a régi, dátum nélküli megtanult szavak egyik hétbe sem számítanak bele)
const learnedKey = w => (w.stats && (w.stats.learnedAt || w.stats.practiceLearnedAt)) || null;

function weekStartKey(offset = 0, now = new Date()) {
  return dateKey(addDays(startOfWeek(now), offset * 7));
}

/* ── Számítások (DOM nélkül) ── */

// Egy mód egy hetének összesítése. src: { words, globalStats }
function summarizeWeek(src, startKey, goal, today = todayKey()) {
  const idx = buildDailyIndex(src);
  const start = keyToDate(startKey);
  const endKey = dateKey(addDays(start, 6));
  const freshByDay = {};
  let learned = 0, fromPractice = 0;
  src.words.forEach(w => {
    const k = learnedKey(w);
    if (!k || k < startKey || k > endKey || !isLearnedWord(w)) return;
    learned++;
    if (!w.stats.learnedAt) fromPractice++;
    freshByDay[k] = (freshByDay[k] || 0) + 1;
  });
  const days = DAY_LABELS.map((label, i) => {
    const key = dateKey(addDays(start, i));
    const e = idx[key];
    const future = key > today;
    return {
      key, label, future, isToday: key === today,
      level: future ? 0 : activityLevel(e, goal),
      answers: e ? e.a + e.k + e.g : 0, good: e ? e.c + e.k : 0, seconds: e ? e.s : 0,
      fresh: freshByDay[key] || 0
    };
  });
  const answers = days.reduce((s, d) => s + d.answers, 0);
  const good = days.reduce((s, d) => s + d.good, 0);
  return {
    startKey, endKey, days,
    activeDays: days.filter(d => d.level > 0).length,
    elapsedDays: days.filter(d => !d.future).length,
    learned, fromPractice, answers, good,
    accuracy: answers >= 3 ? Math.round(good / answers * 100) : null, // a kártyáknál a "Tudom" is helyes
    seconds: days.reduce((s, d) => s + d.seconds, 0)
  };
}

const hasData = w => w.activeDays > 0 || w.answers > 0 || w.learned > 0;

// A héten elrontott szavak, amelyek azóta sem lettek jók: az utolsó kvízválasz hibás volt,
// vagy az ismétlésben "Újra" értékelést kapott, és még egynapos közön áll.
function unsureWords(words, startKey, endKey) {
  const inWeek = k => !!k && k >= startKey && k <= endKey;
  const weight = w => (w.stats.totalWrong || 0) + ((w.stats.srs && w.stats.srs.lapses) || 0);
  return words.filter(w => {
    const s = w.stats || {};
    const quizMiss = (s.totalWrong || 0) > 0 && !(s.streak > 0) && !!s.lastAttempt && inWeek(dateKey(new Date(s.lastAttempt)));
    const reviewMiss = !!s.srs && (s.srs.lapses || 0) > 0 && inWeek(s.srs.last) && srsInterval(w) <= 1;
    return quizMiss || reviewMiss;
  }).sort((a, b) => (weight(b) - weight(a)) || String(a.en).localeCompare(String(b.en), 'hu'));
}

// JLPT sáv: mennyi volt megtanulva a hét elején és végén (N5-N3)
function jlptWeek(words, kind, startKey, endKey) {
  const learned = words.filter(w => LEVELS.includes(w.diff) && isLearnedWord(w));
  const atEnd = learned.filter(w => { const k = learnedKey(w); return !k || k <= endKey; }).length;
  const gained = learned.filter(w => { const k = learnedKey(w); return !!k && k >= startKey && k <= endKey; }).length;
  const target = TARGETS[kind].N3;
  return { gained, atEnd, target, pct: Math.min(100, Math.floor(atEnd / target * 100)) };
}

// A legkorábbi hét, amelyről van adat (eddig lehet visszalapozni)
function earliestWeekKey(src, today = todayKey()) {
  const gs = src.globalStats;
  const keys = [...Object.keys(gs.daily || {}), ...Object.keys(gs.studyDays || {}).filter(k => gs.studyDays[k])];
  src.words.forEach(w => { const k = learnedKey(w); if (k) keys.push(k); });
  const first = keys.filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort()[0] || today;
  return dateKey(startOfWeek(keyToDate(first)));
}

function fmtRange(startKey, endKey) {
  const a = keyToDate(startKey), b = keyToDate(endKey);
  return a.getMonth() === b.getMonth()
    ? `${HU_MONTHS[a.getMonth()]} ${a.getDate()}–${b.getDate()}.`
    : `${fmtDay(startKey)} – ${fmtDay(endKey)}`;
}

function weekTag(offset) {
  return offset === 0 ? 'Ez a hét' : offset === -1 ? 'Múlt hét' : `${-offset} héttel ezelőtt`;
}

// Egy-két tényszerű mondat a hétről
function weekSentence(w, isCurrent) {
  if (w.activeDays === 0) return isCurrent ? 'Ezen a héten még nem tanultál.' : 'Ezen a héten nem tanultál.';
  const days = isCurrent ? `Eddig ${w.activeDays} aktív nap a héten.` : `${w.activeDays} aktív nap a 7-ből.`;
  return w.accuracy === null ? days : `${days} A pontosság ${w.accuracy}%.`;
}

/* ── Megjelenítés ── */
let _weekOffset = 0;

const ARROW = dir => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="${dir < 0 ? '15 18 9 12 15 6' : '9 6 15 12 9 18'}"/></svg>`;
const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

// Változás az előző héthez képest: jelvény (nyíl + előjeles érték), mellette az előző heti érték
function deltaHtml(diff, text, prevText, prevHasData) {
  if (!prevHasData) return '<span class="kpi-sub">Az előző hétről nincs adat</span>';
  return diff === 0
    ? trendHtml(0, 'ugyanannyi', 'mint az előző héten')
    : trendHtml(diff, text, `előző héten ${prevText}`);
}

function kpisHtml(cur, prev, unit) {
  const prevOk = hasData(prev);
  const accDelta = cur.accuracy !== null && prev.accuracy !== null
    ? deltaHtml(cur.accuracy - prev.accuracy, `${Math.abs(cur.accuracy - prev.accuracy)} pont`, `${prev.accuracy}%`, true)
    : `<span class="kpi-sub">${cur.accuracy === null ? 'Még kevés a válasz' : 'Az előző hétről nincs adat'}</span>`;
  const focusDiff = Math.round((cur.seconds - prev.seconds) / 60);
  return `
    <div class="kpi">
      <span class="kpi-label">Megtanult ${unit}</span>
      <span class="kpi-value">${fmtNum(cur.learned)}</span>
      ${deltaHtml(cur.learned - prev.learned, fmtNum(Math.abs(cur.learned - prev.learned)), fmtNum(prev.learned), prevOk)}
    </div>
    <div class="kpi">
      <span class="kpi-label">Válasz és kártya</span>
      <span class="kpi-value">${fmtNum(cur.answers)}</span>
      ${deltaHtml(cur.answers - prev.answers, fmtNum(Math.abs(cur.answers - prev.answers)), fmtNum(prev.answers), prevOk)}
    </div>
    <div class="kpi">
      <span class="kpi-label">Pontosság</span>
      <span class="kpi-value">${cur.accuracy === null ? '–' : `${cur.accuracy}<span class="kpi-unit">%</span>`}</span>
      ${accDelta}
    </div>
    <div class="kpi">
      <span class="kpi-label">Fókuszált idő</span>
      <span class="kpi-value">${fmtDuration(cur.seconds)}</span>
      ${deltaHtml(focusDiff, fmtDuration(Math.abs(focusDiff) * 60), fmtDuration(prev.seconds), prevOk)}
    </div>`;
}

function daysHtml(week) {
  return `<div class="week-tracker wk-days" role="img" aria-label="${week.activeDays} aktív nap a héten">${week.days.map(d => {
    const on = d.level > 0;
    const cls = d.isToday ? (on ? 'today-studied' : 'today-not') : on ? 'studied' : 'not-studied';
    return `<div class="week-day${d.future ? ' is-future' : ''}"><div class="week-day-label">${d.label}</div><div class="week-day-dot ${cls}">${on ? WEEK_CHECK_ICON : ''}</div></div>`;
  }).join('')}</div>`;
}

function jlptHtml(startKey, endKey) {
  if (currentMode === 'english') return '';
  const rows = JLPT_TRACKS.map(([kind, mode, label]) => {
    const t = jlptWeek(appData[mode].words || [], kind, startKey, endKey);
    return `<li class="wk-row">
      <span class="wk-row-name">${label}</span>
      ${deltaChip(t.gained, fmtNum(t.gained))}
      <span class="wk-row-meta">${fmtNum(t.atEnd)} / ${fmtNum(t.target)} · ${t.pct}%</span>
    </li>`;
  }).join('');
  return `
    <section class="wk-section" aria-labelledby="wk-jlpt-title">
      <h2 class="home-section-title" id="wk-jlpt-title">N3 felé a héten</h2>
      <ul class="re-err-list">${rows}</ul>
    </section>`;
}

function unsureHtml(words) {
  if (words.length === 0) return '';
  const shown = words.slice(0, UNSURE_SHOWN);
  const more = words.length - shown.length;
  return `
    <section class="wk-section" aria-labelledby="wk-unsure-title">
      <h2 class="home-section-title" id="wk-unsure-title">Még bizonytalan</h2>
      <p class="wk-note">A héten elrontott szavak, amelyeket azóta nem javítottál.</p>
      <ul class="re-err-list">${shown.map(w => `<li class="re-err"><span class="re-err-word">${escHtml(w.en)}</span><span class="re-err-meaning">${escHtml(w.hu)}</span></li>`).join('')}</ul>
      ${more > 0 ? `<p class="wk-note">és még ${fmtNum(more)} másik</p>` : ''}
      <button class="btn btn-outline wk-practice" onclick="practiceWeekWords()">Gyakorlás ezekkel · ${fmtNum(words.length)} ${unitOf(currentMode)}</button>
    </section>`;
}

function aheadHtml() {
  const f = dueForecast(state.words);
  if (f.due === 0 && f.week === 0) return '';
  const text = f.due > 0
    ? `Ma <b>${fmtNum(f.due)}</b> ismétlés esedékes, a következő 7 napban további <b>${fmtNum(f.week)}</b>.`
    : `A következő 7 napban <b>${fmtNum(f.week)}</b> ismétlés esedékes, ebből holnap <b>${fmtNum(f.tomorrow)}</b>.`;
  return `
    <section class="wk-section" aria-labelledby="wk-ahead-title">
      <h2 class="home-section-title" id="wk-ahead-title">Előtted</h2>
      <p class="wk-ahead">${text}</p>
    </section>`;
}

function modesHtml(startKey, today) {
  const rows = MODES.map(mode => {
    const w = summarizeWeek(appData[mode], startKey, goalFor(mode), today);
    const meta = hasData(w)
      ? `${w.activeDays} aktív nap · ${fmtNum(w.learned)} megtanult ${unitOf(mode)}`
      : 'nincs aktivitás';
    return `<li class="wk-row${mode === currentMode ? ' is-current' : ''}">
      <span class="wk-row-name">${MODE_LABELS[mode]}</span>
      <span class="wk-row-meta">${meta}</span>
    </li>`;
  }).join('');
  return `
    <section class="wk-section" aria-labelledby="wk-modes-title">
      <h2 class="home-section-title" id="wk-modes-title">Módonként</h2>
      <ul class="re-err-list">${rows}</ul>
    </section>`;
}

function renderWeekScreen() {
  const host = document.getElementById('week-body');
  if (!host) return;
  const today = todayKey();
  const earliest = earliestWeekKey(state, today);
  // Módváltás után az új módban lehet, hogy nincs ilyen régi hét
  while (_weekOffset < 0 && weekStartKey(_weekOffset) < earliest) _weekOffset++;
  const startKey = weekStartKey(_weekOffset);
  const goal = goalFor(currentMode);
  const cur = summarizeWeek(state, startKey, goal, today);
  const prev = summarizeWeek(state, weekStartKey(_weekOffset - 1), goal, today);
  const isCurrent = _weekOffset === 0;
  const unit = unitOf(currentMode);

  // A Kezdőlap sora eddig hív: a lezárt múlt hetet megnézted
  if (_weekOffset === -1 && state.globalStats.weekSeen !== startKey) {
    state.globalStats.weekSeen = startKey;
    saveStats();
  }

  const table = dataTable(['Nap', 'Válasz', `Új ${unit}`, 'Aktív idő'],
    cur.days.filter(d => !d.future).map(d => [fmtDay(d.key), String(d.answers), String(d.fresh), fmtDuration(d.seconds)]));

  host.innerHTML = `
    <div class="wk-switch">
      <button class="icon-btn wk-nav" onclick="shiftWeek(-1)" aria-label="Előző hét" ${weekStartKey(_weekOffset - 1) < earliest ? 'disabled' : ''}>${ARROW(-1)}</button>
      <div class="wk-when" aria-live="polite">
        <span class="wk-tag">${weekTag(_weekOffset)} · ${MODE_LABELS[currentMode]} mód</span>
        <span class="wk-range">${fmtRange(cur.startKey, cur.endKey)}</span>
      </div>
      <button class="icon-btn wk-nav" onclick="shiftWeek(1)" aria-label="Következő hét" ${isCurrent ? 'disabled' : ''}>${ARROW(1)}</button>
    </div>
    ${daysHtml(cur)}
    <p class="wk-sentence">${weekSentence(cur, isCurrent)}</p>
    <section class="kpi-strip wk-kpis" aria-label="A hét számai">${kpisHtml(cur, prev, unit)}</section>
    ${cur.fromPractice > 0 ? `<p class="wk-note">A megtanultból ${fmtNum(cur.fromPractice)} szabad gyakorlásból jött (5 helyes válasz egymás után).</p>` : ''}
    ${jlptHtml(cur.startKey, cur.endKey)}
    ${unsureHtml(unsureWords(state.words, cur.startKey, cur.endKey))}
    ${_weekOffset >= -1 ? aheadHtml() : ''}
    ${modesHtml(startKey, today)}
    <details class="viz-table"><summary>Napi bontás táblázatban</summary>${table}</details>`;
}

function showWeekScreen(offset = 0) {
  _weekOffset = Math.min(0, Math.trunc(Number(offset)) || 0);
  showScreen('week');
}

function shiftWeek(delta) {
  const next = Math.min(0, _weekOffset + delta);
  if (next === _weekOffset || weekStartKey(next) < earliestWeekKey(state)) return;
  _weekOffset = next;
  renderWeekScreen();
}

// A bizonytalan szavak kijelölése, és irány a Gyakorlás fül (a típus és a kérdésszám a dokkból jön)
function practiceWeekWords() {
  const startKey = weekStartKey(_weekOffset);
  const words = unsureWords(state.words, startKey, dateKey(addDays(keyToDate(startKey), 6)));
  if (words.length === 0) return;
  state.selectedIds = new Set(words.map(w => w.id));
  saveSettings();
  showScreen('dashboard');
  showToast(`${words.length} ${unitOf(currentMode)} kijelölve a gyakorláshoz`);
}

// Csendes sor: a Statisztika tetején az aktuális hét, a Kezdőlapon a még meg nem nézett múlt hét
function weekRowHtml(offset, label) {
  const w = summarizeWeek(state, weekStartKey(offset), goalFor(currentMode));
  const value = hasData(w)
    ? `<b>${w.activeDays}</b> aktív nap · <b>${fmtNum(w.learned)}</b> megtanult ${unitOf(currentMode)}`
    : 'még nincs aktivitás';
  return `
    <button class="home-jlpt wk-link" onclick="showWeekScreen(${offset})">
      <span class="home-jlpt-label">${label}</span>
      <span class="home-jlpt-value">${value}</span>
      ${CHEVRON}
    </button>`;
}

function renderWeekLink() {
  const host = document.getElementById('stats-week-link');
  if (host) host.innerHTML = weekRowHtml(0, 'Ez a hét');
}

function weekHomeRowHtml() {
  const lastKey = weekStartKey(-1);
  if (state.globalStats.weekSeen === lastKey) return '';
  const last = summarizeWeek(state, lastKey, goalFor(currentMode));
  return last.activeDays > 0 ? weekRowHtml(-1, 'Múlt hét') : '';
}

export { earliestWeekKey, fmtRange, jlptWeek, practiceWeekWords, renderWeekLink, renderWeekScreen, shiftWeek,
  showWeekScreen, summarizeWeek, unsureWords, weekHomeRowHtml, weekSentence, weekStartKey, weekTag };
