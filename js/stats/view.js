// LexiLearn – stats/view.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { HU_MONTHS, addDays, dateKey, fmtDay, fmtDayLong, fmtDuration, fmtNum, lastNDays, startOfWeek } from '../core/dates.js';
import { MODE_LABELS, appData, currentMode, state } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { calcStreak } from '../features/streak.js';
import { getDailyGoal } from '../habit/goal.js';
import { accuracyOf, activityLevel, buildDailyIndex, computeMaturity, weekFocusSeconds } from './model.js';
import { renderJlptCard } from '../goal/view.js';

const HEAT_LEVEL_LABELS = ['Nem tanultál', 'Aktív nap', 'Napi penzum', 'Penzum + ismétlés', 'Intenzív nap'];

/* ── Tooltip (értékek elöl, címkék utána; textContent, nem innerHTML) ── */
function showVizTip(clientX, clientY, lines) {
  const tip = document.getElementById('viz-tip');
  if (!tip) return;
  tip.replaceChildren(...lines.filter(Boolean).map((text, i) => {
    const row = document.createElement('div');
    row.className = i === 0 ? 'viz-tip-value' : 'viz-tip-label';
    row.textContent = text;
    return row;
  }));
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = clientX + 14, y = clientY - r.height - 14;
  if (x + r.width > window.innerWidth - 8) x = clientX - r.width - 14;
  if (x < 8) x = 8;
  if (y < 8) y = clientY + 18;
  tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
function hideVizTip() { const tip = document.getElementById('viz-tip'); if (tip) tip.hidden = true; }
window.addEventListener('scroll', hideVizTip, { passive: true });

function vizEmpty(text) { return `<p class="viz-empty">${escHtml(text)}</p>`; }
function dataTable(headers, rows) {
  return `<table class="data-table"><thead><tr>${headers.map(h => `<th scope="col">${escHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function setHtml(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

/* ── Fő belépési pont ── */
function renderStats() {
  const idx = buildDailyIndex();
  const goal = getDailyGoal();
  setText('stats-scope', `${MODE_LABELS[currentMode]} mód`);
  renderJlptCard();
  renderKpis(idx, goal);
  renderConsistencyHeatmap(idx, goal);
  renderMaturity();
  renderAccuracyChart(idx);
  renderFocusChart(idx);
  renderStatsDetails();
}

let _statsResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_statsResizeTimer);
  _statsResizeTimer = setTimeout(() => { if (document.body.dataset.screen === 'stats') renderStats(); }, 150);
});

function renderKpis(idx, goal) {
  const streak = calcStreak();
  const record = Math.max(state.globalStats.recordStreak || 0, streak);
  let active30 = 0;
  lastNDays(30).forEach(k => { if (activityLevel(idx[k], goal) > 0) active30++; });
  const mat = computeMaturity();
  const thisWeek = weekFocusSeconds(idx, 0);
  const lastWeek = weekFocusSeconds(idx, -1);
  const delta = Math.round((thisWeek - lastWeek) / 60);
  const deltaHtml = delta === 0
    ? `<span class="kpi-sub">Ugyanannyi, mint múlt héten</span>`
    : `<span class="kpi-sub kpi-delta ${delta > 0 ? 'is-up' : 'is-down'}">
         <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="${delta > 0 ? 'M5 1 9 8H1z' : 'M5 9 1 2h8z'}"/></svg>
         ${delta > 0 ? '+' : '−'}${fmtDuration(Math.abs(delta) * 60)} a múlt héthez képest
       </span>`;

  setHtml('kpi-strip', `
    <div class="kpi">
      <span class="kpi-label">Konzisztencia</span>
      <span class="kpi-value">${streak}<span class="kpi-unit">nap</span></span>
      <span class="kpi-sub">Leghosszabb: ${record} nap</span>
    </div>
    <div class="kpi">
      <span class="kpi-label">Aktív napok</span>
      <span class="kpi-value">${active30}<span class="kpi-unit">/ 30</span></span>
      <span class="kpi-sub">az elmúlt 30 napban</span>
    </div>
    <button class="kpi kpi-click" onclick="openWordInspector('mature')" aria-label="Rögzült szavak megnyitása">
      <span class="kpi-label">Rögzült szavak</span>
      <span class="kpi-value">${fmtNum(mat.mature)}</span>
      <span class="kpi-sub">${fmtNum(mat.started)} elkezdett szóból</span>
    </button>
    <div class="kpi">
      <span class="kpi-label">Fókusz a héten</span>
      <span class="kpi-value">${fmtDuration(thisWeek)}</span>
      ${deltaHtml}
    </div>`);
}

/* ── Konzisztencia hőtérkép ── */
function renderConsistencyHeatmap(idx, goal) {
  const wrap = document.getElementById('heatmap-wrap');
  if (!wrap) return;
  const CELL = 13, GAP = 3, STEP = CELL + GAP, LEFT = 24, TOP = 18;
  const width = wrap.clientWidth || 320;
  const weeks = Math.max(8, Math.min(53, Math.floor((width - LEFT + GAP) / STEP)));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayK = dateKey(today);
  const start = addDays(startOfWeek(today), -(weeks - 1) * 7);

  let cells = '', months = '';
  let lastLabelWeek = -10, lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const weekStart = addDays(start, w * 7);
    const month = weekStart.getMonth();
    if (month !== lastMonth) {
      if (w - lastLabelWeek >= 3) {
        months += `<text class="hm-label" x="${LEFT + w * STEP}" y="11">${HU_MONTHS[month]}</text>`;
        lastLabelWeek = w;
      }
      lastMonth = month;
    }
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      if (date > today) continue;
      const key = dateKey(date);
      const level = activityLevel(idx[key], goal);
      cells += `<rect class="hm-cell l${level}${key === todayK ? ' is-today' : ''}" x="${LEFT + w * STEP}" y="${TOP + d * STEP}" width="${CELL}" height="${CELL}" rx="3" data-k="${key}"/>`;
    }
  }
  const weekdayLabels = [[0, 'H'], [2, 'Sz'], [4, 'P']]
    .map(([row, label]) => `<text class="hm-label" x="0" y="${TOP + row * STEP + CELL - 3}">${label}</text>`).join('');
  const svgW = LEFT + weeks * STEP - GAP, svgH = TOP + 7 * STEP - GAP;
  wrap.innerHTML = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Konzisztencia az elmúlt ${weeks} hétben">${months}${weekdayLabels}${cells}</svg>`;

  const svg = wrap.querySelector('svg');
  const onMove = e => {
    const cell = e.target.closest && e.target.closest('.hm-cell');
    if (!cell) { hideVizTip(); return; }
    const key = cell.dataset.k;
    const d = idx[key];
    const level = activityLevel(d, goal);
    const volume = d ? d.a + d.k + d.g : 0;
    const value = level === 0 ? 'Nem tanultál' : [
      volume ? `${volume} válasz` : null,
      d && d.n ? `${d.n} új szó` : null,
      d && d.s ? fmtDuration(d.s) : null
    ].filter(Boolean).join(' · ') || 'Aktív nap';
    showVizTip(e.clientX, e.clientY, [value, fmtDayLong(key), level ? HEAT_LEVEL_LABELS[level] : null]);
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onMove);
  svg.addEventListener('pointerleave', hideVizTip);

  let active30 = 0;
  const rows = lastNDays(30).reverse().map(k => {
    const d = idx[k];
    const level = activityLevel(d, goal);
    if (level) active30++;
    return [fmtDay(k), d ? String(d.a + d.k + d.g) : '0', d ? String(d.n) : '0', fmtDuration(d ? d.s : 0), HEAT_LEVEL_LABELS[level]];
  });
  setText('viz-cons-note', `${active30} aktív nap az elmúlt 30-ból`);
  setHtml('heatmap-table', dataTable(['Nap', 'Válasz', 'Új szó', 'Aktív idő', 'Fokozat'], rows));
}

/* ── Tudás-érettség: 100%-os sávdiagram (ordinális zöld skála) ── */
function renderMaturity() {
  const host = document.getElementById('maturity');
  if (!host) return;
  const m = computeMaturity();
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  setText('viz-mat-note', `${fmtNum(m.started)} ${unit} elkezdve · ${fmtNum(m.notStarted)} még nem`);
  if (m.started === 0) {
    host.innerHTML = vizEmpty('Ebben a módban még nincs elkezdett szó. Az első tanulás után itt látod, mennyire rögzült a tudásod.');
    setHtml('maturity-table', '');
    return;
  }
  const stages = [
    ['fresh', 'm1', 'Ismerkedés', m.fresh],
    ['practicing', 'm2', 'Gyakorlás alatt', m.practicing],
    ['mature', 'm3', 'Rögzült', m.mature]
  ];
  const pct = v => Math.round(v / m.started * 100);
  const dailyLearned = state.words.filter(w => !!w.stats?.learnedAt).length;
  const practiceLearned = state.words.filter(w => !w.stats?.learnedAt && (w.stats?.totalCorrect || 0) >= 5).length;
  const activeReview = state.words.filter(w => !!w.stats?.srs).length;
  const segments = stages.filter(s => s[3] > 0)
    .map(([key, cls, label, v]) => `<span class="mat-seg ${cls}" style="flex-grow:${v}" data-label="${label}" data-v="${v}"></span>`).join('');
  host.innerHTML = `
    <div class="mat-bar" role="img" aria-label="${stages.map(s => `${s[2]}: ${s[3]}`).join(', ')}">${segments}</div>
    <ul class="mat-legend">
      ${stages.map(([key, cls, label, v]) => `
        <li><button onclick="openWordInspector('${key}')"><i class="mat-sw ${cls}" aria-hidden="true"></i><span class="mat-name">${label}</span><span class="mat-count">${fmtNum(v)}</span><span class="mat-pct">${pct(v)}%</span></button></li>`).join('')}
    </ul>
    <div class="learning-breakdown" aria-label="Miből számít megtanultnak">
      <button onclick="openWordInspector('daily')"><b>${fmtNum(dailyLearned)}</b><span>Napi tanulás</span></button>
      <button onclick="openWordInspector('practice')"><b>${fmtNum(practiceLearned)}</b><span>5× helyes gyakorlás</span></button>
      <button onclick="openWordInspector('review')"><b>${fmtNum(activeReview)}</b><span>Aktív ismétlés</span></button>
    </div>
    <p class="viz-caption">Az ismétlési köz szerint, mint az Ankiban. Rögzült: legalább 21 nap. Gyakorlás alatt: 7-20 nap. Ismerkedés: 7 napnál rövidebb.</p>`;

  const bar = host.querySelector('.mat-bar');
  const onMove = e => {
    const seg = e.target.closest && e.target.closest('.mat-seg');
    if (!seg) { hideVizTip(); return; }
    const v = Number(seg.dataset.v);
    showVizTip(e.clientX, e.clientY, [`${fmtNum(v)} ${unit} · ${pct(v)}%`, seg.dataset.label]);
  };
  bar.addEventListener('pointermove', onMove);
  bar.addEventListener('pointerdown', onMove);
  bar.addEventListener('pointerleave', hideVizTip);

  setHtml('maturity-table', dataTable(['Szakasz', 'Szó', 'Arány'],
    stages.map(([, , label, v]) => [label, fmtNum(v), `${pct(v)}%`])));
}

/* ── Közös tengely-segédek ── */
function xDayLabels(days, x, y) {
  return [0, Math.floor((days.length - 1) / 2), days.length - 1].map(i => {
    const anchor = i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle';
    const label = i === days.length - 1 ? 'ma' : fmtDay(days[i]);
    return `<text class="viz-axis-label" x="${x(i)}" y="${y}" text-anchor="${anchor}">${label}</text>`;
  }).join('');
}

/* ── Pontosság: 14 napos vonal (80%-os referencia) ── */
function renderAccuracyChart(idx) {
  const host = document.getElementById('acc-chart');
  if (!host) return;
  const days = lastNDays(14);
  const pts = days.map(k => {
    const e = idx[k];
    const total = e ? e.a + e.k + e.g : 0;
    const good = e ? e.c + e.k : 0;
    return { k, total, good, v: total >= 3 ? Math.round(good / total * 100) : null, e };
  });
  const withData = pts.filter(p => p.v !== null);
  if (withData.length === 0) {
    setText('viz-acc-note', '');
    host.innerHTML = vizEmpty('Még nincs elég adat. Néhány kérdés vagy kártya után itt megjelenik a trend.');
    setHtml('acc-table', '');
    return;
  }
  const sumGood = withData.reduce((s, p) => s + p.good, 0);
  const sumTotal = withData.reduce((s, p) => s + p.total, 0);
  setText('viz-acc-note', `14 napos átlag: ${Math.round(sumGood / sumTotal * 100)}% · a kártyáknál a "Tudom" is helyesnek számít`);

  const W = Math.max(280, host.clientWidth), H = 200;
  const m = { l: 40, r: 42, t: 14, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const x = i => m.l + pw * i / (days.length - 1);
  const y = v => m.t + ph * (1 - v / 100);

  let grid = [0, 50, 100].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join('');
  grid += `<line class="viz-ref" x1="${m.l}" x2="${W - m.r}" y1="${y(80)}" y2="${y(80)}"/>
    <text class="viz-ref-label" x="${m.l - 8}" y="${y(80) + 4}" text-anchor="end">80%</text>`;

  // Folytonos szakaszok: adat nélküli napon megszakad a vonal (nem esik nullára)
  // Terület-kitöltés nincs: kihagyott napoknál a szakaszos kitöltés hamis 'blokkokat' rajzolna
  let lines = '', run = [];
  const flush = () => {
    if (run.length > 1) {
      const d = run.map((p, j) => `${j ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
      lines += `<path class="viz-line" d="${d}"/>`;
    }
    run = [];
  };
  pts.forEach((p, i) => { if (p.v === null) flush(); else run.push({ i, v: p.v }); });
  flush();
  const dots = pts.map((p, i) => p.v === null ? '' : `<circle class="viz-dot" cx="${x(i)}" cy="${y(p.v)}" r="4"/>`).join('');
  const lastIdx = pts.map(p => p.v !== null).lastIndexOf(true);
  const endLabel = `<text class="viz-value-label" x="${x(lastIdx) + 9}" y="${y(pts[lastIdx].v) + 4}">${pts[lastIdx].v}%</text>`;

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Napi pontosság az elmúlt 14 napban">
      ${grid}${lines}${dots}${endLabel}
      ${xDayLabels(days, x, H - 8)}
      <line class="viz-crosshair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ph}" visibility="hidden"/>
      <rect class="viz-hit" x="${m.l - 10}" y="${m.t}" width="${pw + 20}" height="${ph}"/>
    </svg>`;

  const svg = host.querySelector('svg');
  const cross = svg.querySelector('.viz-crosshair');
  const onMove = e => {
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    const i = Math.max(0, Math.min(days.length - 1, Math.round((px - m.l) / pw * (days.length - 1))));
    const p = pts[i];
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    const detail = p.e && p.total ? `${p.e.a} válasz (${p.e.c} helyes) · ${p.e.k + p.e.g} kártya (${p.e.k} tudom)` : 'Nincs adat';
    showVizTip(e.clientX, e.clientY, [p.v === null ? 'Kevés adat' : `${p.v}%`, fmtDayLong(p.k), detail]);
  };
  const onLeave = () => { cross.setAttribute('visibility', 'hidden'); hideVizTip(); };
  const hit = svg.querySelector('.viz-hit');
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerdown', onMove);
  hit.addEventListener('pointerleave', onLeave);

  setHtml('acc-table', dataTable(['Nap', 'Pontosság', 'Válasz / kártya'],
    pts.slice().reverse().map(p => [fmtDay(p.k), p.v === null ? '–' : `${p.v}%`, String(p.total)])));
}

/* ── Fókuszált idő: 14 napos oszlopdiagram (perc) ── */
function niceMaxMinutes(v) {
  const steps = [10, 20, 30, 40, 60, 90, 120, 180, 240];
  return steps.find(s => s >= v) || Math.ceil(v / 60) * 60;
}

function renderFocusChart(idx) {
  const host = document.getElementById('focus-chart');
  if (!host) return;
  const days = lastNDays(14);
  const mins = days.map(k => Math.round(((idx[k] || {}).s || 0) / 60));
  const thisWeek = weekFocusSeconds(idx, 0), lastWeek = weekFocusSeconds(idx, -1);
  setText('viz-focus-note', `Ezen a héten ${fmtDuration(thisWeek)} aktív fókusz · múlt héten ${fmtDuration(lastWeek)}`);
  if (mins.every(v => v === 0)) {
    host.innerHTML = vizEmpty('Az aktív idő mérése most indul: minden válasz és kártya beleszámít, a hosszabb szünetek nem.');
    setHtml('focus-table', '');
    return;
  }

  const W = Math.max(280, host.clientWidth), H = 180;
  const m = { l: 40, r: 10, t: 20, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const maxV = niceMaxMinutes(Math.max(...mins));
  const band = pw / days.length;
  const bw = Math.min(24, band * 0.62);
  const cx = i => m.l + band * i + band / 2;
  const y = v => m.t + ph * (1 - v / maxV);
  const base = y(0);

  const grid = [0, maxV / 2, maxV].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)} p</text>`).join('');

  // Oszlop: 4px-es lekerekített teteje, szögletes alapvonal
  const bars = mins.map((v, i) => {
    if (v <= 0) return '';
    const x0 = cx(i) - bw / 2, top = y(v), r = Math.min(4, (base - top) / 2, bw / 2);
    return `<path class="viz-bar" data-i="${i}" d="M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${base} Z"/>`;
  }).join('');
  const peak = mins.indexOf(Math.max(...mins));
  const peakLabel = `<text class="viz-value-label" x="${cx(peak)}" y="${y(mins[peak]) - 6}" text-anchor="middle">${mins[peak]} p</text>`;
  const hits = days.map((k, i) => `<rect class="viz-hit" data-i="${i}" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${ph}"/>`).join('');

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aktív fókusz percben az elmúlt 14 napban">
      ${grid}${bars}${peakLabel}
      ${xDayLabels(days, cx, H - 8)}
      ${hits}
    </svg>`;

  const svg = host.querySelector('svg');
  const onMove = e => {
    const hit = e.target.closest && e.target.closest('.viz-hit');
    svg.querySelectorAll('.viz-bar.is-hover').forEach(b => b.classList.remove('is-hover'));
    if (!hit) { hideVizTip(); return; }
    const i = Number(hit.dataset.i);
    const bar = svg.querySelector(`.viz-bar[data-i="${i}"]`);
    if (bar) bar.classList.add('is-hover');
    showVizTip(e.clientX, e.clientY, [`${mins[i]} perc`, fmtDayLong(days[i])]);
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onMove);
  svg.addEventListener('pointerleave', () => { svg.querySelectorAll('.viz-bar.is-hover').forEach(b => b.classList.remove('is-hover')); hideVizTip(); });

  setHtml('focus-table', dataTable(['Nap', 'Aktív fókusz'], days.slice().reverse().map((k, j) => [fmtDay(k), `${mins[days.length - 1 - j]} perc`])));
}

/* ── Részletek (fülek): szintek + témakörök, szavak, előzmények, Dekiru leckék ── */
function perfRowsHtml(items) {
  return items.map(it => `
    <div class="perf-row">
      <span class="perf-name">${escHtml(it.name)}${it.sub ? `<small>${escHtml(it.sub)}</small>` : ''}</span>
      <span class="perf-track"><span class="perf-fill" style="transform: scaleX(${(it.pct || 0) / 100})"></span></span>
      <span class="perf-pct">${it.pct === null ? '–' : it.pct + '%'}</span>
    </div>`).join('');
}

function renderStatsDetails() {
  const words = state.words;
  const dekiruBtn = document.getElementById('dekiru-tab-btn');
  if (dekiruBtn) dekiruBtn.style.display = currentMode === 'japanese' ? '' : 'none';

  // Szintek
  const levels = currentMode === 'english' ? ['B1', 'B2', 'C1', 'C2'] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  const levelItems = levels.map(lv => {
    const ws = words.filter(w => w.diff === lv);
    if (ws.length === 0) return null;
    const a = accuracyOf(ws);
    return { name: lv, sub: `${fmtNum(ws.length)} szó · ${fmtNum(a.t)} válasz`, pct: a.pct };
  }).filter(Boolean);
  setHtml('level-perf-list', levelItems.length ? perfRowsHtml(levelItems) : vizEmpty('Nincs adat.'));

  // Témakörök (csak ahol már volt válasz), pontosság szerint
  const tags = new Set();
  words.forEach(w => w.tags.forEach(t => tags.add(t)));
  const tagItems = [];
  let untouched = 0;
  tags.forEach(tag => {
    const ws = words.filter(w => w.tags.includes(tag));
    const a = accuracyOf(ws);
    if (a.t === 0) { untouched++; return; }
    tagItems.push({ name: tag, sub: `${fmtNum(a.t)} válasz`, pct: a.pct });
  });
  tagItems.sort((a, b) => b.pct - a.pct);
  setHtml('tag-perf-list', (tagItems.length ? perfRowsHtml(tagItems) : vizEmpty('Még egyik témakörben sincs válasz.')) +
    (untouched ? `<p class="viz-caption">További ${untouched} témakörben még nincs válasz.</p>` : ''));

  // Szavak: csak a már gyakoroltak, a legtöbbet gyakoroltak elöl
  const practiced = words.filter(w => w.stats.totalCorrect + w.stats.totalWrong > 0)
    .sort((a, b) => (b.stats.totalCorrect + b.stats.totalWrong) - (a.stats.totalCorrect + a.stats.totalWrong));
  const srcHeader = currentMode === 'english' ? 'Angol' : currentMode === 'kanji' ? 'Kandzsi' : 'Kana';
  setHtml('word-stats-table', practiced.length
    ? `<div class="table-scroll">${dataTable([srcHeader, 'Magyar', 'Sorozat', 'Helyes', 'Hibás', '%', 'Szint'], practiced.map(w => {
        const t = w.stats.totalCorrect + w.stats.totalWrong;
        return [w.en, w.hu, String(w.stats.streak || 0), String(w.stats.totalCorrect), String(w.stats.totalWrong), `${Math.round(w.stats.totalCorrect / t * 100)}%`, w.diff];
      }))}</div>`
    : vizEmpty('Még nincs gyakorolt szó ebben a módban.'));

  // Előzmények
  const hist = (state.globalStats.sessionHistory || []).slice().reverse();
  setHtml('history-list', hist.length === 0 ? vizEmpty('Még nincs befejezett gyakorlás.') : hist.map(h => {
    const mins = Math.floor(h.duration / 60), secs = h.duration % 60;
    return `
      <div class="hist-row">
        <div><span class="hist-date">${escHtml(h.date)}</span>
          <span class="hist-score">${h.correct} helyes · ${h.wrong} hibás</span></div>
        <span class="hist-meta">${h.rounds} kör · ${mins > 0 ? `${mins} p ${secs} mp` : `${secs} mp`}</span>
      </div>`;
  }).join(''));

  if (document.getElementById('stats-dekiru-tab') && !document.getElementById('stats-dekiru-tab').hidden) renderDekiruLessonStats();
}

function renderDekiruLessonStats() {
  const container = document.getElementById('dekiru-lesson-list');
  if (!container) return;
  const dekiruWords = appData.japanese.words.filter(w => w.source === 'dekiru' && w.lesson !== null && w.lesson !== undefined && w.lesson !== '');
  if (dekiruWords.length === 0) { container.innerHTML = vizEmpty('Még nincs Dekiru szó az adatbázisban.'); return; }

  const lessonMap = {};
  dekiruWords.forEach(w => {
    const lessons = Array.isArray(w.lesson) ? w.lesson : [w.lesson];
    lessons.filter(lesson => lesson !== null && lesson !== undefined && lesson !== '')
      .forEach(lesson => { (lessonMap[lesson] = lessonMap[lesson] || []).push(w); });
  });
  let lessons = Object.entries(lessonMap).map(([lesson, ws]) => {
    const a = accuracyOf(ws);
    return { lesson: Number(lesson), count: ws.length, learned: ws.filter(w => w.stats.streak >= 3).length, ...a };
  });
  const sort = document.getElementById('dekiru-sort')?.value || 'lesson-asc';
  if      (sort === 'best')        lessons.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  else if (sort === 'worst')       lessons.sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
  else if (sort === 'lesson-desc') lessons.sort((a, b) => b.lesson - a.lesson);
  else                             lessons.sort((a, b) => a.lesson - b.lesson);

  container.innerHTML = perfRowsHtml(lessons.map(l => ({
    name: `${l.lesson}. lecke`,
    sub: `${l.count} szó · ${l.learned} megy · ${fmtNum(l.t)} válasz`,
    pct: l.pct
  })));
}

function switchStatsTab(tab) {
  ['topics', 'words', 'history', 'dekiru'].forEach(t => {
    const panel = document.getElementById(`stats-${t}-tab`);
    if (panel) panel.hidden = t !== tab;
  });
  document.querySelectorAll('.detail-tabs [data-tab]').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (tab === 'dekiru') renderDekiruLessonStats();
}

export { HEAT_LEVEL_LABELS, _statsResizeTimer, dataTable, hideVizTip, niceMaxMinutes, perfRowsHtml, renderAccuracyChart, renderConsistencyHeatmap, renderDekiruLessonStats, renderFocusChart, renderKpis, renderMaturity, renderStats, renderStatsDetails, setHtml, setText, showVizTip, switchStatsTab, vizEmpty, xDayLabels };
