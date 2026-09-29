// LexiLearn – goal/view.js
// V13.6: JLPT haladás felületei: Statisztika kártya, Kezdőlap sor, külön Haladás képernyő.
// A sáv szegmensei a mérföldkövek (szélességük arányos a darabszámmal); a világosabb zöld a
// megtanult, az erősebb zöld a rögzült (21+ napos ismétlési köz) rész. Angol módban rejtve.
import { HU_MONTHS, keyToDate, todayKey } from '../core/dates.js';
import { appData, currentMode } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { escHtml } from '../core/util.js';
import { LEVELS, TARGETS, getGoal, paceFor, trackProgress } from './jlpt.js';
import { dataTable, hideVizTip, showVizTip } from '../stats/view.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

const TRACKS = [
  { kind: 'words', mode: 'japanese', label: 'Szókincs', unit: 'szó' },
  { kind: 'kanji', mode: 'kanji', label: 'Kandzsi', unit: 'kandzsi' }
];

const fmt = n => Number(n || 0).toLocaleString('hu-HU');
const pctText = p => `${Math.floor(p * 100)}%`;
function fmtDate(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]} ${d.getDate()}.`; }
function fmtMonth(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]}`; }

function jlptVisible() { return currentMode !== 'english'; }

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
      <span class="jl-track-value ${big ? 'is-big' : ''}">${fmt(t.learned)}<span class="jl-track-unit">/ ${fmt(t.target)}</span></span>
      <span class="jl-track-pct">${pctText(t.pct)}</span>
    </div>`;
}

/* ── Statisztika kártya ── */
function renderJlptCard() {
  const card = document.getElementById('jlpt-card');
  if (!card) return;
  card.hidden = !jlptVisible();
  if (card.hidden) return;
  const goal = getGoal(appData.japanese.globalStats);
  const tracks = getTracks();
  const daysLeft = tracks[0].pace.daysLeft;
  document.getElementById('jlpt-card-title').textContent = `Úton a JLPT ${goal.level} felé`;
  document.getElementById('jlpt-card-note').textContent = `${fmtDate(goal.date)} · ${daysLeft > 0 ? `${fmt(daysLeft)} nap` : 'a célidőpont elmúlt'}`;
  const host = document.getElementById('jlpt-card-body');
  host.innerHTML = tracks.map(t => `<div class="jl-track">${trackHead(t)}${milestoneBar(t)}</div>`).join('') + `
    <p class="viz-caption">Egy szakasz egy mérföldkő. Halványabb zöld: megtanult, erősebb zöld: rögzült (21+ napos ismétlési köz).</p>
    <button class="link-btn jl-open" onclick="showGoalScreen()">Célidőpont, tempó és mérföldkövek</button>`;
  bindBarTips(host, tracks);
}

/* ── Kezdőlap sor ── */
function goalLineHtml() {
  if (!jlptVisible()) return '';
  const goal = getGoal(appData.japanese.globalStats);
  const [w, k] = getTracks();
  return `
    <button class="home-jlpt" onclick="showGoalScreen()">
      <span class="home-jlpt-label">${goal.level} felé</span>
      <span class="home-jlpt-value">szókincs <b>${pctText(w.pct)}</b> · kandzsi <b>${pctText(k.pct)}</b></span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>`;
}

/* ── Haladás képernyő ── */
function showGoalScreen() {
  if (!jlptVisible()) { showToast('A JLPT haladás japán és kandzsi módban látszik.'); return; }
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
  return `
    <p class="jl-coverage">Szintenként (megtanult / a szótárban): ${perLevel}.</p>
    ${missing > 0 ? `<p class="jl-coverage">A szótárban ${fmt(t.inDictionary)} ${t.unit} van az N5-N3 szintekből; a ${fmt(t.target)}-hez még kb. ${fmt(missing)}-t kell felvenni.</p>` : ''}`;
}

function renderGoalScreen() {
  const host = document.getElementById('goal-body');
  if (!host) return;
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

export { fmtDate, fmtMonth, getTracks, goalLineHtml, jlptVisible, milestoneBar, renderGoalScreen, renderJlptCard, setGoalDate, showGoalScreen };
