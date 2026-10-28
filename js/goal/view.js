// LexiLearn – goal/view.js
// V13.6: JLPT haladás felületei: Statisztika kártya, Kezdőlap sor, külön Haladás képernyő.
// A sáv szegmensei a mérföldkövek (szélességük arányos a darabszámmal); a világosabb zöld a
// megtanult, az erősebb zöld a rögzült (21+ napos ismétlési köz) rész. Angol módban rejtve.
// V13.24: Radikál módban ugyanezek a felületek a Radikál-útvonalat mutatják (leckék, lefedettség, cél, tempó).
import { HU_MONTHS, keyToDate, todayKey } from '../core/dates.js';
import { appData, currentMode } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { az, escHtml } from '../core/util.js';
import { LEVELS, TARGETS, getGoal, isMatureWord as isMature, paceFor, trackProgress } from './jlpt.js';
import { PATH_TARGETS, coverageOf, ensurePathGoal, getPathGoal, kanjiUnlockStatus, knownRadicals, pathProgress } from './radical-path.js';
import { dataTable, hideVizTip, showVizTip } from '../stats/view.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

const TRACKS = [
  { kind: 'words', mode: 'japanese', label: 'Szókincs', unit: 'szó' },
  { kind: 'kanji', mode: 'kanji', label: 'Kandzsi', unit: 'kandzsi' }
];

const fmt = n => Number(n || 0).toLocaleString('hu-HU');
const pctText = p => `${Math.floor(p * 100)}%`;
const Az = n => (az(n) === 'az' ? 'Az' : 'A'); // mondat elején
function fmtDate(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]} ${d.getDate()}.`; }
function fmtMonth(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]}`; }

function jlptVisible() { return currentMode === 'japanese' || currentMode === 'kanji'; } // V13.23: a radikálok nem JLPT-sáv
const pathVisible = () => currentMode === 'radicals';

function getTracks(today = todayKey()) {
  const goal = getGoal(appData.japanese.globalStats);
  return TRACKS.map(t => {
    const words = appData[t.mode].words || [];
    const track = trackProgress(words, t.kind, today);
    return { ...t, ...track, pace: paceFor(track, words, goal.date, today) };
  });
}

/* ── Szegmentált mérföldkő-sáv ── */
function milestoneBar(t, { labels = true } = {}) {
  const segs = t.milestones.map((m, i) => {
    const size = m.n - m.prev;
    const f = m.progress;
    const mf = Math.max(0, Math.min(1, (t.mature - m.prev) / size));
    const cls = ['ms-seg', m.done ? 'is-done' : '', m.current ? 'is-current' : '', m.levelEnd ? 'is-level-end' : ''].join(' ');
    return `<span class="${cls}" style="flex-grow:${size};--f:${f.toFixed(4)};--mf:${mf.toFixed(4)}" data-i="${i}"></span>`;
  }).join('');
  const marks = labels ? `<div class="ms-marks" aria-hidden="true">${LEVELS.map(l => {
    const at = TARGETS[t.kind][l] / t.target;
    return `<span class="ms-mark${t.learned >= TARGETS[t.kind][l] ? ' is-reached' : ''}" style="left:${(at * 100).toFixed(2)}%">${l}</span>`;
  }).join('')}</div>` : '';
  return `
    <div class="ms-bar" role="img" data-kind="${t.kind}"
      aria-label="${t.label}: ${fmt(t.learned)} / ${fmt(t.target)} megtanulva, ebből ${fmt(t.mature)} rögzült">${segs}</div>${marks}`;
}

function bindBarTips(host, tracks) {
  host.querySelectorAll('.ms-bar').forEach(bar => {
    const t = tracks.find(x => x.kind === bar.dataset.kind);
    const onMove = e => {
      const seg = e.target.closest && e.target.closest('.ms-seg');
      if (!seg) { hideVizTip(); return; }
      const m = t.milestones[Number(seg.dataset.i)];
      const head = m.done ? `${fmt(m.n)} ${t.unit}` : `${fmt(Math.max(m.prev, Math.min(t.learned, m.n)))} / ${fmt(m.n)} ${t.unit}`;
      const sub = m.done ? (m.reachedAt ? `Teljesítve: ${fmtDate(m.reachedAt)}` : 'Teljesítve') : m.current ? 'Aktuális mérföldkő' : 'Később';
      showVizTip(e.clientX, e.clientY, [head, sub, `${m.level} szakasz`]);
    };
    bar.addEventListener('pointermove', onMove);
    bar.addEventListener('pointerdown', onMove);
    bar.addEventListener('pointerleave', hideVizTip);
  });
}

function trackHead(t, { big = false } = {}) {
  return `
    <div class="jl-track-head">
      ${big ? '' : `<span class="jl-track-label">${t.label}</span>`}
      <button class="jl-track-value jl-track-open ${big ? 'is-big' : ''}" onclick="openWordInspector('learned', '${t.mode}')" aria-label="${t.label}: ${fmt(t.learned)} megtanult elem megnyitása">${fmt(t.learned)}<span class="jl-track-unit">/ ${fmt(t.target)}</span></button>
      <span class="jl-track-pct">${pctText(t.pct)}</span>
    </div>`;
}

/* ── Statisztika kártya ── */
function renderJlptCard() {
  const card = document.getElementById('jlpt-card');
  if (!card) return;
  card.hidden = !jlptVisible() && !pathVisible();
  if (card.hidden) return;
  if (pathVisible()) { renderPathCard(); return; }
  const goal = getGoal(appData.japanese.globalStats);
  const tracks = getTracks();
  const daysLeft = tracks[0].pace.daysLeft;
  document.getElementById('jlpt-card-title').textContent = `Úton a JLPT ${goal.level} felé`;
  document.getElementById('jlpt-card-note').textContent = `${fmtDate(goal.date)} · ${daysLeft > 0 ? `${fmt(daysLeft)} nap` : 'a célidőpont elmúlt'}`;
  const host = document.getElementById('jlpt-card-body');
  host.innerHTML = tracks.map(t => `<div class="jl-track">${trackHead(t)}${milestoneBar(t)}</div>`).join('') + `
    <p class="viz-caption">Egy szakasz egy mérföldkő. Halványabb zöld: megtanult, erősebb zöld: rögzült (21+ napos ismétlési köz).</p>
    <button class="link-btn jl-open" onclick="openStatsExplanation('${currentMode === 'kanji' ? 'kanji' : 'japanese'}')">Hogyan számoljuk a haladást?</button>
    <button class="link-btn jl-open" onclick="showGoalScreen()">Célidőpont, tempó és mérföldkövek</button>`;
  bindBarTips(host, tracks);
}

/* ── Kezdőlap sor ── */
function goalLineHtml() {
  if (pathVisible()) return pathLineHtml();
  if (!jlptVisible()) return '';
  const goal = getGoal(appData.japanese.globalStats);
  const [w, k] = getTracks();
  return `
    <button class="home-jlpt" onclick="showGoalScreen()">
      <span class="home-jlpt-label">${goal.level} felé</span>
      <span class="home-jlpt-value">szókincs <b>${pctText(w.pct)}</b> · kandzsi <b>${pctText(k.pct)}</b></span>
      ${CHEVRON_SVG}
    </button>${currentMode === 'kanji' ? kanjiUnlockLineHtml() : ''}`;
}

const CHEVRON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

// V13.26: Kandzsi módban: hány kandzsi kész a megtanult radikálokból, és mennyit nyit meg a következő radikál-lecke.
// Koppintásra a Radikálok mód jön.
function kanjiUnlockLineHtml() {
  const u = kanjiUnlockStatus(appData.radicals.words || [], appData.kanji.words || []);
  const next = u.nextLesson && u.nextLesson.unlocks.length ? u.nextLesson : null;
  let value, label;
  if (u.known === 0) {
    if (!next) return '';
    value = `${Az(next.lesson)} ${next.lesson}. radikál-lecke <b>${fmt(next.unlocks.length)}</b> kandzsit nyit meg`;
    label = `Radikálok: ${az(next.lesson)} ${next.lesson}. radikál-lecke ${next.unlocks.length} kandzsit nyit meg. Megnyitja a Radikálok módot.`;
  } else {
    value = `<b>${fmt(u.ready.length)}</b> kandzsi kész${next ? ` · ${next.lesson}. lecke: +${fmt(next.unlocks.length)}` : ''}`;
    label = `Radikálokból: ${u.ready.length} kandzsinak már minden radikálját tudod${next ? `, ${az(next.lesson)} ${next.lesson}. radikál-lecke további ${next.unlocks.length}-at nyit meg` : ''}. Megnyitja a Radikálok módot.`;
  }
  return `
    <button class="home-jlpt home-unlock" onclick="setMode('radicals')" aria-label="${escHtml(label)}">
      <span class="home-jlpt-label">Radikálok</span>
      <span class="home-jlpt-value">${value}</span>
      ${CHEVRON_SVG}
    </button>`;
}

/* ── Haladás képernyő ── */
function showGoalScreen() {
  if (!jlptVisible() && !pathVisible()) { showToast('A haladás japán, kandzsi és radikál módban látszik.'); return; }
  showScreen('goal');
}

function paceHtml(t, goal) {
  const p = t.pace;
  if (p.remaining === 0) return `<p class="jl-pace-status">A ${goal.level} ${t.unit}-cél megvan.</p>`;
  const rows = [
    ['Hátravan', `${fmt(p.remaining)} ${t.unit}`],
    ['Szükséges tempó', p.needed === null ? 'a célidőpont elmúlt' : `napi ${fmt(p.needed)} új ${t.unit}`],
    ['Az elmúlt 14 nap átlaga', `napi ${p.avg.toLocaleString('hu-HU')}`],
    ['A mostani tempóval', p.projected ? fmtMonth(p.projected) : 'még nincs elég adat']
  ];
  const status = p.projected === null ? 'Tanulj néhány napot, és itt látod, mikor érsz célba.'
    : p.onTrack ? 'Ezzel a tempóval a célidőpontig elkészülsz.'
    : `A célidőponthoz napi ${fmt(p.needed)} új ${t.unit} kellene, ez több a mostani tempónál. Módosíthatod a célidőpontot, vagy emelheted a napi penzumot.`;
  return `
    <dl class="jl-pace">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <p class="jl-pace-status">${status}</p>`;
}

function milestonesHtml(t) {
  const done = t.milestones.filter(m => m.done);
  const current = t.milestones.find(m => m.current);
  const upcoming = t.milestones.filter(m => !m.done && !m.current).slice(0, 2);
  const item = (m, state) => {
    const right = state === 'done' ? (m.reachedAt ? fmtDate(m.reachedAt) : 'korábban')
      : state === 'current' ? `még ${fmt(m.n - t.learned)}` : `${m.level} szakasz`;
    return `<li class="jl-ms is-${state}">
      <span class="jl-ms-dot" aria-hidden="true">${state === 'done' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
      <span class="jl-ms-name">${fmt(m.n)} ${t.unit}${m.levelEnd ? ` <span class="jl-ms-level">${m.level} szint</span>` : ''}</span>
      <span class="jl-ms-right">${right}</span>
    </li>`;
  };
  const lastDone = done.slice(-2);
  return `
    <ol class="jl-ms-list">
      ${done.length > lastDone.length ? `<li class="jl-ms-more">${fmt(done.length - lastDone.length)} korábbi mérföldkő teljesítve</li>` : ''}
      ${lastDone.map(m => item(m, 'done')).join('')}
      ${current ? item(current, 'current') : ''}
      ${upcoming.map(m => item(m, 'next')).join('')}
    </ol>
    <details class="viz-table"><summary>Összes mérföldkő táblázatban</summary>${dataTable(['Mérföldkő', 'Szakasz', 'Állapot'],
      t.milestones.map(m => [`${fmt(m.n)} ${t.unit}`, m.level, m.done ? (m.reachedAt ? `Teljesítve ${fmtDate(m.reachedAt)}` : 'Teljesítve') : m.current ? `Aktuális (${fmt(t.learned)})` : 'Később']))}</details>`;
}

function coverageHtml(t) {
  const missing = Math.max(0, t.target - t.inDictionary);
  const perLevel = t.perLevel.map(l => `${l.level}: ${fmt(l.learned)} / ${fmt(l.inDictionary)}`).join(' · ');
  // V13.26: hány N5–N3 kandzsit raksz össze a megtanult radikálokból
  const known = t.kind === 'kanji' ? knownRadicals(appData.radicals.words || []) : null;
  const built = known && known.size ? coverageOf(known) : null;
  return `
    <p class="jl-coverage">Szintenként (megtanult / a szótárban): ${perLevel}.</p>
    ${built ? `<p class="jl-coverage">A megtanult radikáljaidból ${fmt(built.core)} / ${fmt(built.coreTotal)} N5–N3 kandzsit raksz össze; a napi új kandzsik közül ezek jönnek előre.</p>` : ''}
    ${missing > 0 ? `<p class="jl-coverage">A szótárban ${fmt(t.inDictionary)} ${t.unit} van az N5-N3 szintekből; a ${fmt(t.target)}-hez még kb. ${fmt(missing)}-t kell felvenni.</p>` : ''}`;
}

function renderGoalScreen() {
  const host = document.getElementById('goal-body');
  if (!host) return;
  if (pathVisible()) { renderPathScreen(host); return; }
  if (!jlptVisible()) { showScreen('stats'); return; }
  const goal = getGoal(appData.japanese.globalStats);
  const tracks = getTracks();
  const daysLeft = tracks[0].pace.daysLeft;
  document.getElementById('goal-title').textContent = `JLPT ${goal.level}`;
  document.getElementById('goal-sub').innerHTML = `
    <label class="goal-date"><span>Célidőpont</span>
      <input class="goal-date-input" type="date" value="${escHtml(goal.date)}" min="${todayKey()}" onchange="setGoalDate(this.value)">
    </label>
    <span class="goal-days">${daysLeft > 0 ? `<b>${fmt(daysLeft)}</b> nap van hátra` : 'A célidőpont elmúlt.'}</span>`;
  host.innerHTML = tracks.map(t => `
    <section class="goal-track" aria-labelledby="goal-${t.kind}-title">
      <h2 class="home-section-title" id="goal-${t.kind}-title">${t.label}</h2>
      ${trackHead(t, { big: true })}
      ${milestoneBar(t)}
      <p class="jl-mature">${fmt(t.mature)} rögzült · ${fmt(t.learned - t.mature)} még ismétlés alatt</p>
      <button class="link-btn jl-calc-open" onclick="openStatsExplanation('${t.mode}')">Hogyan jött ki a ${fmt(t.learned)}?</button>
      ${paceHtml(t, goal)}
      <h3 class="detail-title">Mérföldkövek</h3>
      ${milestonesHtml(t)}
      ${coverageHtml(t)}
    </section>`).join('');
  bindBarTips(host, tracks);
}

function setGoalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return;
  const gs = appData.japanese.globalStats;
  gs.jlptGoal = { ...getGoal(gs), date: value };
  saveStats();
  renderGoalScreen();
  showToast(`Célidőpont: ${fmtDate(value)}`);
}

/* ══════════════════════════════════════════════════════
   V13.24: RADIKÁL-ÚTVONAL
   A sáv szegmensei itt a leckék (a célig); ugyanaz a skála: halványabb zöld megtanult, erősebb rögzült.
══════════════════════════════════════════════════════ */
function getPath(today = todayKey()) {
  const gs = appData.radicals.globalStats;
  if (ensurePathGoal(gs, today)) saveStats(); // az első megnyitáskor rögzül a (mától fél éves) cél
  const goal = getPathGoal(gs, today);
  return { goal, ...pathProgress(appData.radicals.words || [], goal, today) };
}

const targetLabel = p => (p.targetShare === null ? 'mind a 214' : `${Math.round(p.targetShare * 100)}%`);

function pathBar(p) {
  const lessons = p.lessons.filter(l => l.inTarget);
  const byChar = new Map((appData.radicals.words || []).map(w => [w.en, w]));
  const segs = lessons.map(l => {
    const mature = l.radicals.filter(r => { const w = byChar.get(r); return w && isMature(w); }).length;
    const cls = ['ms-seg', l.done ? 'is-done' : '', l.current ? 'is-current' : ''].join(' ');
    return `<span class="${cls}" style="flex-grow:${l.total};--f:${(l.learned / l.total).toFixed(4)};--mf:${(mature / l.total).toFixed(4)}" data-lesson="${l.lesson}"></span>`;
  }).join('');
  // Jelölők: hol éri el az útvonal az 50/80/90%-os szöveg-lefedettséget (a célon belül)
  let soFar = 0;
  const ends = lessons.map(l => (soFar += l.total));
  const marks = PATH_TARGETS.filter(t => t.share !== null).map(t => {
    const i = lessons.findIndex(l => l.text >= t.share);
    return i < 0 ? '' : `<span class="ms-mark${p.coverage.text >= t.share ? ' is-reached' : ''}" style="left:${(ends[i] / p.target * 100).toFixed(2)}%">${t.label}</span>`;
  }).join('');
  return `
    <div class="ms-bar" role="img" data-kind="path"
      aria-label="Radikál-útvonal: ${fmt(p.learned)} / ${fmt(p.target)} radikál megtanulva, ebből ${fmt(p.mature)} rögzült">${segs}</div>
    <div class="ms-marks" aria-hidden="true">${marks}</div>`;
}

function bindPathTips(host, p) {
  host.querySelectorAll('.ms-bar[data-kind="path"]').forEach(bar => {
    const onMove = e => {
      const seg = e.target.closest && e.target.closest('.ms-seg');
      if (!seg) { hideVizTip(); return; }
      const l = p.lessons.find(x => x.lesson === Number(seg.dataset.lesson));
      showVizTip(e.clientX, e.clientY, [`${l.lesson}. lecke · ${l.radicals.join(' ')}`,
        l.done ? (l.reachedAt ? `Kész: ${fmtDate(l.reachedAt)}` : 'Kész') : `${l.learned} / ${l.total} megtanult`,
        `A végére: a szövegek ${pctText(l.text)}-a`]);
    };
    bar.addEventListener('pointermove', onMove);
    bar.addEventListener('pointerdown', onMove);
    bar.addEventListener('pointerleave', hideVizTip);
  });
}

function pathHead(p, { big = false } = {}) {
  return `
    <div class="jl-track-head">
      ${big ? '' : '<span class="jl-track-label">Radikálok</span>'}
      <button class="jl-track-value jl-track-open ${big ? 'is-big' : ''}" onclick="openWordInspector('learnedAll', 'radicals')" aria-label="${fmt(p.learnedTotal)} megtanult radikál megnyitása">${fmt(p.learned)}<span class="jl-track-unit">/ ${fmt(p.target)}</span></button>
      <span class="jl-track-pct">${pctText(p.pct)}</span>
    </div>`;
}

function renderPathCard() {
  const p = getPath();
  document.getElementById('jlpt-card-title').textContent = `Radikál-útvonal · cél ${targetLabel(p)}`;
  document.getElementById('jlpt-card-note').textContent = `${fmtDate(p.goal.date)} · ${p.pace.daysLeft > 0 ? `${fmt(p.pace.daysLeft)} nap` : 'a célidőpont elmúlt'}`;
  const host = document.getElementById('jlpt-card-body');
  host.innerHTML = `
    <div class="jl-track">${pathHead(p)}${pathBar(p)}</div>
    <p class="rp-cover">Szöveg-lefedettség most: <b>${pctText(p.coverage.text)}</b> · N5–N3 kandzsi: <b>${pctText(p.coverage.kanji)}</b></p>
    <p class="viz-caption">Egy szakasz egy lecke (10 radikál). A százalék: a hírek és a Wikipédia szövegeiben előforduló kandzsik közül ennyit raksz össze teljesen ismert radikálokból.</p>
    <button class="link-btn jl-open" onclick="showGoalScreen()">Cél, tempó és leckék</button>`;
  bindPathTips(host, p);
}

function pathLineHtml() {
  const p = getPath();
  const where = p.complete ? 'az útvonal kész' : `${p.current.lesson}. lecke`;
  return `
    <button class="home-jlpt" onclick="showGoalScreen()">
      <span class="home-jlpt-label">Útvonal</span>
      <span class="home-jlpt-value">${where} · szöveg <b>${pctText(p.coverage.text)}</b> / ${targetLabel(p)}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>`;
}

function pathPaceHtml(p) {
  const pace = p.pace;
  if (pace.remaining === 0) return `<p class="jl-pace-status">A cél megvan: ${az(p.targetLesson)} ${p.targetLesson}. lecke végéig minden radikált megtanultál.</p>`;
  // Napi 1 alatt a heti szám a beszédesebb (heti 4,5 új radikál, nem "napi 1")
  const needed = pace.neededDaily === null ? 'a célidőpont elmúlt'
    : pace.neededWeekly < 7 ? `heti ${pace.neededWeekly.toLocaleString('hu-HU')} új radikál` : `napi ${fmt(pace.neededDaily)} új radikál`;
  const rows = [
    ['Hátravan', `${fmt(pace.remaining)} radikál`],
    ['Szükséges tempó', needed],
    ['Az elmúlt 14 nap átlaga', `napi ${pace.avg.toLocaleString('hu-HU')}`],
    ['A mostani tempóval', pace.projected ? fmtMonth(pace.projected) : 'még nincs elég adat']
  ];
  const status = pace.projected === null ? 'Tanulj néhány napot, és itt látod, mikor érsz célba.'
    : pace.onTrack ? 'Ezzel a tempóval a célidőpontig elkészülsz.'
    : `A célidőponthoz ${needed} kellene, ez több a mostani tempónál. Módosíthatod a célidőpontot vagy a célt, vagy emelheted a napi penzumot.`;
  return `
    <dl class="jl-pace">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <p class="jl-pace-status">${status}</p>`;
}

const CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function pathLessonItem(l) {
  const state = l.done ? 'done' : l.current ? 'current' : 'next';
  const right = l.done ? (l.reachedAt ? fmtDate(l.reachedAt) : 'kész') : l.current ? `${l.learned} / ${l.total}` : `→ ${pctText(l.text)}`;
  return `<li><button class="jl-ms rp-lesson is-${state}" onclick="openCurrentLesson(${l.lesson})"
      aria-label="${l.lesson}. lecke: ${l.radicals.join(' ')}. ${l.done ? 'Kész' : `${l.learned} / ${l.total} megtanult`}. A végére a szövegek ${pctText(l.text)}-a.">
    <span class="jl-ms-dot" aria-hidden="true">${l.done ? CHECK_SVG : ''}</span>
    <span class="rp-lesson-main"><span class="jl-ms-name">${l.lesson}. lecke</span><span class="rp-chars" lang="ja">${l.radicals.join('')}</span></span>
    <span class="jl-ms-right">${right}</span>
  </button></li>`;
}

function renderPathScreen(host) {
  const p = getPath();
  document.getElementById('goal-title').textContent = 'Radikál-útvonal';
  document.getElementById('goal-sub').innerHTML = `
    <label class="goal-date"><span>Célidőpont</span>
      <input class="goal-date-input" type="date" value="${escHtml(p.goal.date)}" min="${todayKey()}" onchange="setPathGoalDate(this.value)">
    </label>
    <span class="goal-days">${p.pace.daysLeft > 0 ? `<b>${fmt(p.pace.daysLeft)}</b> nap van hátra` : 'A célidőpont elmúlt.'}</span>`;
  const goalText = p.targetShare === null
    ? `Mind a 214 radikál: ${p.lessons.length} lecke, a teljes útvonal. A végére a szövegek kandzsijainak ${pctText(p.goalText)}-át, az N5–N3 kandzsik ${pctText(p.goalKanji)}-át fedi le.`
    : `${Az(p.targetLesson)} ${p.targetLesson}. lecke végére (${fmt(p.target)} radikál) a szövegekben előforduló kandzsik ${pctText(p.goalText)}-át, az N5–N3 kandzsik ${pctText(p.goalKanji)}-át raksz össze teljesen ismert radikálokból.`;
  const later = p.lessons.filter(l => !l.inTarget);
  host.innerHTML = `
    <section class="goal-track" aria-labelledby="rp-goal-title">
      <h2 class="home-section-title" id="rp-goal-title">Cél: szöveg-lefedettség</h2>
      <div class="segmented rp-targets" role="radiogroup" aria-labelledby="rp-goal-title">
        ${PATH_TARGETS.map(t => `<button role="radio" aria-checked="${t.value === p.targetValue}" class="${t.value === p.targetValue ? 'active is-selected' : ''}" onclick="setPathTarget('${t.value}')">${t.label}</button>`).join('')}
      </div>
      <p class="jl-coverage">${goalText}</p>
      <dl class="jl-pace rp-now">
        <div><dt>Szöveg most</dt><dd>${pctText(p.coverage.text)}</dd></div>
        <div><dt>N5–N3 kandzsi most</dt><dd>${fmt(p.coverage.core)} / ${fmt(p.coverage.coreTotal)}</dd></div>
      </dl>
    </section>
    <section class="goal-track" aria-labelledby="rp-progress-title">
      <h2 class="home-section-title" id="rp-progress-title">Radikálok a célig</h2>
      ${pathHead(p, { big: true })}
      ${pathBar(p)}
      <p class="jl-mature">${fmt(p.mature)} rögzült · ${fmt(p.learned - p.mature)} még ismétlés alatt${p.learnedTotal > p.learned ? ` · ${fmt(p.learnedTotal - p.learned)} a célon túl` : ''}</p>
      ${pathPaceHtml(p)}
      <h3 class="detail-title">Leckék</h3>
      <p class="jl-coverage rp-hint">A nyíl utáni szám: a lecke végére ennyi a szöveg-lefedettség. Koppints egy leckére a radikáljaiért.</p>
      <ol class="jl-ms-list rp-list">${p.lessons.filter(l => l.inTarget).map(pathLessonItem).join('')}</ol>
      ${later.length ? `<details class="viz-table rp-later"><summary>A célon túli leckék (${later[0].lesson}–${later.at(-1).lesson})</summary>
        <ol class="jl-ms-list rp-list">${later.map(pathLessonItem).join('')}</ol></details>` : ''}
      <details class="viz-table rp-how"><summary>Hogyan számoljuk?</summary>
        <p class="jl-coverage">A sorrend: minden következő radikál az, amelyik a legtöbb új kandzsit teszi teljessé, a szövegbeli gyakoriságuk szerint súlyozva. Ezért jön előre a 日, 木, 月 és 人: rengeteg gyakori kandzsi épül rájuk.</p>
        <p class="jl-coverage">Egy kandzsi akkor lefedett, ha minden alkotórészének a radikálját megtanultad (a KanjiVG felbontása szerint). Ez a felismerést és a megjegyzést könnyíti; a kandzsi olvasatát külön kell megtanulni.</p>
        <p class="jl-coverage">Szöveg-lefedettség: a lefedett kandzsik aránya a japán Wikinews és Wikipédia szövegeiben előforduló összes kandzsiból (scriptin/kanji-frequency, CC BY 4.0). A teljes útvonallal kb. ${pctText(p.lessons.at(-1)?.text || 0)} érhető el; a maradék olyan ritkább kandzsi, ami nincs az app kandzsilistájában.</p>
        <p class="jl-coverage">Egy radikál akkor megtanult, ha a napi tanulásban már sikerült, vagy ötször egymás után helyesen válaszoltál rá.</p>
      </details>
    </section>`;
  bindPathTips(host, p);
}

function setPathGoalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return;
  const gs = appData.radicals.globalStats;
  gs.radicalGoal = { ...getPathGoal(gs, todayKey()), date: value };
  saveStats();
  renderGoalScreen();
  showToast(`Célidőpont: ${fmtDate(value)}`);
}

function setPathTarget(value) {
  if (!PATH_TARGETS.some(t => t.value === value)) return;
  const gs = appData.radicals.globalStats;
  gs.radicalGoal = { ...getPathGoal(gs, todayKey()), target: value };
  saveStats();
  renderGoalScreen();
}

export { fmtDate, fmtMonth, getPath, getTracks, goalLineHtml, jlptVisible, milestoneBar, renderGoalScreen, renderJlptCard, setGoalDate,
  setPathGoalDate, setPathTarget, showGoalScreen };
