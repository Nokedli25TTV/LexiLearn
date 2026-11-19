// LexiLearn – stats/insights.js (V13.64)
// Három új Statisztika-panel, a meglévő ábrák nyelvén (egy vezérszín, táblázatos pár, tooltip):
// • Előtted · 14 nap: hány ismétlőkártya esedékes naponta (ma a lemaradással együtt), oszlopokkal;
// • Szókincs növekedése: a megtanult szavak összesített száma az elmúlt 60 napban, vonallal;
// • Legnehezebb szavak: a legtöbbször elrontottak, egy koppintással gyakorolhatók (indító lap).
import { addDays, dateKey, fmtDay, fmtDayLong, fmtNum, keyToDate, lastNDays, todayKey } from '../core/dates.js';
import { state, unitOf } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { isLearnedWord } from '../goal/jlpt.js';
import { dataTable, hideVizTip, setHtml, setText, showVizTip, vizEmpty } from './view.js';

const FORECAST_DAYS = 14;
const GROWTH_DAYS = 60;
const HARDEST_MAX = 10;

/* ── Adatok (tiszta függvények, tesztelhetők) ── */

// Naponta esedékes kártyák (eredeti és fordított): a mai oszlopban a lemaradás is
function computeForecast(words = state.words, today = todayKey(), days = FORECAST_DAYS) {
  const keys = Array.from({ length: days }, (_, i) => dateKey(addDays(keyToDate(today), i)));
  const counts = keys.map(() => 0);
  const last = keys[keys.length - 1];
  words.forEach(w => ['srs', 'srsRev'].forEach(f => {
    const due = w.stats && w.stats[f] && w.stats[f].due;
    if (!due || due > last) return;
    const i = due <= today ? 0 : keys.indexOf(due);
    if (i >= 0) counts[i]++;
  }));
  return keys.map((k, i) => ({ k, n: counts[i] }));
}

// A megtanulás napja: a napi tanulásé (learnedAt) vagy a gyakorlásé (practiceLearnedAt)
const learnedDay = w => (w.stats && (w.stats.learnedAt || w.stats.practiceLearnedAt)) || null;

// Összesített megtanult szó naponta az elmúlt napokban (az ablak előtti megtanultak az alapszint)
function computeGrowth(words = state.words, days = GROWTH_DAYS) {
  const keys = lastNDays(days);
  const first = keys[0];
  let base = 0;
  const perDay = new Map();
  words.forEach(w => {
    if (!isLearnedWord(w)) return;
    const d = learnedDay(w);
    if (!d || d < first) { base++; return; }
    perDay.set(d, (perDay.get(d) || 0) + 1);
  });
  let total = base;
  return keys.map(k => { total += perDay.get(k) || 0; return { k, total, added: perDay.get(k) || 0 }; });
}

// A legtöbbször elrontott szavak (legalább kétszer), azonos hibaszámnál a gyengébb pontosság elöl
function hardestWords(words = state.words, max = HARDEST_MAX) {
  const acc = w => { const c = w.stats.totalCorrect || 0, x = w.stats.totalWrong || 0; return c + x ? c / (c + x) : 1; };
  return words.filter(w => (w.stats?.totalWrong || 0) >= 2)
    .sort((a, b) => (b.stats.totalWrong - a.stats.totalWrong) || (acc(a) - acc(b)) || String(a.en).localeCompare(String(b.en), 'hu'))
    .slice(0, max);
}

/* ── Előtted · 14 nap ── */
function renderForecastChart() {
  const host = document.getElementById('forecast-chart');
  if (!host) return;
  const pts = computeForecast();
  const total = pts.reduce((s, p) => s + p.n, 0);
  const tomorrow = pts[1] ? pts[1].n : 0;
  setText('viz-fc-note', total ? `Ma ${fmtNum(pts[0].n)} · holnap ${fmtNum(tomorrow)} · két hét alatt ${fmtNum(total)} kártya` : '');
  if (total === 0) {
    host.innerHTML = vizEmpty('A következő két hétben nincs esedékes kártya. Az új szavak tanulása után itt látod a terhelést.');
    setHtml('forecast-table', '');
    return;
  }
  const W = Math.max(280, host.clientWidth), H = 180;
  const m = { l: 40, r: 10, t: 20, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const maxN = Math.max(...pts.map(p => p.n));
  const maxV = maxN <= 10 ? 10 : Math.ceil(maxN / 10) * 10;
  const band = pw / pts.length;
  const bw = Math.min(24, band * 0.62);
  const cx = i => m.l + band * i + band / 2;
  const y = v => m.t + ph * (1 - v / maxV);
  const base = y(0);
  const grid = [0, maxV / 2, maxV].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`).join('');
  const bars = pts.map((p, i) => {
    if (p.n <= 0) return '';
    const x0 = cx(i) - bw / 2, top = y(p.n), r = Math.min(4, (base - top) / 2, bw / 2);
    return `<path class="viz-bar${i === 0 ? ' is-today' : ''}" data-i="${i}" d="M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${base} Z"/>`;
  }).join('');
  const peak = pts.findIndex(p => p.n === maxN);
  const peakLabel = `<text class="viz-value-label" x="${cx(peak)}" y="${y(maxN) - 6}" text-anchor="middle">${maxN}</text>`;
  const labels = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].map(i => {
    const anchor = i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle';
    const lx = i === 0 ? m.l : i === pts.length - 1 ? W - m.r : cx(i);
    return `<text class="viz-axis-label" x="${lx}" y="${H - 8}" text-anchor="${anchor}">${i === 0 ? 'ma' : fmtDay(pts[i].k)}</text>`;
  }).join('');
  const hits = pts.map((p, i) => `<rect class="viz-hit" data-i="${i}" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${ph}"/>`).join('');
  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Esedékes ismétlőkártyák naponta a következő két hétben">
      ${grid}${bars}${peakLabel}${labels}${hits}
    </svg>`;
  const svg = host.querySelector('svg');
  const clear = () => svg.querySelectorAll('.viz-bar.is-hover').forEach(b => b.classList.remove('is-hover'));
  const onMove = e => {
    const hit = e.target.closest && e.target.closest('.viz-hit');
    clear();
    if (!hit) { hideVizTip(); return; }
    const i = Number(hit.dataset.i);
    svg.querySelector(`.viz-bar[data-i="${i}"]`)?.classList.add('is-hover');
    showVizTip(e.clientX, e.clientY, [`${pts[i].n} kártya`, i === 0 ? 'Ma (a lemaradással együtt)' : fmtDayLong(pts[i].k)]);
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onMove);
  svg.addEventListener('pointerleave', () => { clear(); hideVizTip(); });
  setHtml('forecast-table', dataTable(['Nap', 'Esedékes'], pts.map((p, i) => [i === 0 ? 'ma' : fmtDay(p.k), `${p.n} kártya`])));
}

/* ── Szókincs növekedése · 60 nap ── */
function renderGrowthChart() {
  const host = document.getElementById('growth-chart');
  if (!host) return;
  const pts = computeGrowth();
  const unit = unitOf();
  const now = pts[pts.length - 1].total;
  const monthAgo = pts[pts.length - 31] ? pts[pts.length - 31].total : pts[0].total;
  setText('viz-growth-note', now ? `${fmtNum(now)} megtanult ${unit} · az elmúlt 30 napban +${fmtNum(now - monthAgo)}` : '');
  if (now === 0) {
    host.innerHTML = vizEmpty('Még nincs megtanult szó. Gyakorlásban öt egymás utáni helyes válasz után itt nő a vonal.');
    setHtml('growth-table', '');
    return;
  }
  const W = Math.max(280, host.clientWidth), H = 190;
  const m = { l: 44, r: 44, t: 14, b: 28 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const minV = pts[0].total;
  const span = Math.max(10, now - minV);
  const step = span <= 20 ? 5 : span <= 60 ? 10 : span <= 150 ? 25 : span <= 400 ? 50 : 100;
  const lo = Math.floor(minV / step) * step;
  const hi = Math.max(lo + step, Math.ceil(now / step) * step);
  const x = i => m.l + pw * i / (pts.length - 1);
  const y = v => m.t + ph * (1 - (v - lo) / (hi - lo));
  const grid = [lo, (lo + hi) / 2, hi].map(v => `
    <line class="viz-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="viz-axis-label" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${fmtNum(Math.round(v))}</text>`).join('');
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(' ');
  const end = pts.length - 1;
  const labels = [0, Math.floor(end / 2), end].map(i => {
    const anchor = i === 0 ? 'start' : i === end ? 'end' : 'middle';
    return `<text class="viz-axis-label" x="${x(i)}" y="${H - 8}" text-anchor="${anchor}">${i === end ? 'ma' : fmtDay(pts[i].k)}</text>`;
  }).join('');
  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Megtanult ${unit} összesen az elmúlt 60 napban">
      ${grid}<path class="viz-line" d="${d}"/>
      <circle class="viz-dot" cx="${x(end)}" cy="${y(now)}" r="4"/>
      <text class="viz-value-label" x="${x(end) + 8}" y="${y(now) + 4}">${fmtNum(now)}</text>
      ${labels}
      <line class="viz-crosshair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ph}" visibility="hidden"/>
      <rect class="viz-hit" x="${m.l - 10}" y="${m.t}" width="${pw + 20}" height="${ph}"/>
    </svg>`;
  const svg = host.querySelector('svg');
  const cross = svg.querySelector('.viz-crosshair');
  const hit = svg.querySelector('.viz-hit');
  const onMove = e => {
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    const i = Math.max(0, Math.min(end, Math.round((px - m.l) / pw * end)));
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
    const p = pts[i];
    showVizTip(e.clientX, e.clientY, [`${fmtNum(p.total)} ${unit}`, fmtDayLong(p.k), p.added ? `+${p.added} aznap` : 'Aznap nem lett új']);
  };
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerdown', onMove);
  hit.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); hideVizTip(); });
  // A táblázat hetente (a napi 60 sor túl hosszú lenne)
  const weekly = pts.filter((p, i) => (end - i) % 7 === 0).reverse();
  setHtml('growth-table', dataTable(['Nap', 'Megtanult összesen'], weekly.map(p => [fmtDay(p.k), fmtNum(p.total)])));
}

/* ── Legnehezebb szavak ── */
let _hardIds = [];
function renderHardestWords() {
  const host = document.getElementById('hardest-words');
  if (!host) return;
  const words = hardestWords();
  const unit = unitOf();
  _hardIds = words.map(w => w.id);
  setText('viz-hard-note', words.length ? 'A legtöbbször elrontottak; azonos hibaszámnál a gyengébb pontosság elöl.' : '');
  if (!words.length) {
    host.innerHTML = vizEmpty('Még nincs makacs szó: ide az kerül, amit legalább kétszer elrontottál.');
    return;
  }
  const rows = words.map(w => {
    const c = w.stats.totalCorrect || 0, x = w.stats.totalWrong || 0;
    const pct = Math.round(c / (c + x) * 100);
    return `<li class="hw-row">
      <span class="hw-main"><b lang="ja">${escHtml(w.en)}</b><span>${escHtml(w.hu)}</span></span>
      <span class="hw-side"><b>${x}</b> hiba · ${pct}%</span>
    </li>`;
  }).join('');
  host.innerHTML = `<ol class="hw-list">${rows}</ol>
    <button type="button" class="hw-practice" onclick="practiceHardestWords()">Gyakorlás ezekkel · ${words.length} ${unit}</button>`;
}

// Az indító lap a legnehezebb szavakkal (a típus, a kérdésszám és a sorrend ott választható)
function practiceHardestWords() {
  if (!_hardIds.length || typeof window === 'undefined' || !window.openQuestLauncher) return;
  window.openQuestLauncher({ title: 'Legnehezebb szavak', fixedIds: _hardIds, fixedLabel: 'A legtöbbször elrontottak' });
}

function renderInsights() {
  renderForecastChart();
  renderGrowthChart();
  renderHardestWords();
}

export { computeForecast, computeGrowth, hardestWords, practiceHardestWords, renderForecastChart, renderGrowthChart, renderHardestWords, renderInsights };
