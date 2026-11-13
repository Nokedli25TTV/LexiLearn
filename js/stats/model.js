// LexiLearn – stats/model.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { addDays, dateKey, lastNDays, parseHuDateKey, startOfWeek } from '../core/dates.js';
import { state } from '../core/state.js';
import { isNewWord } from '../habit/goal.js';
import { introducedDate } from '../goal/jlpt.js';
import { MATURE_DAYS, srsInterval } from '../goal/jlpt.js';

/* ── Napi index: napló + visszamenőleges becslés ──
   A részletes napló (globalStats.daily) a V13.2-vel indult. Az azelőtti napokra a
   befejezett gyakorlások (sessionHistory) és a studyDays adnak becslést. Az új szavak
   száma mindig a szavak elkezdési dátumából jön (pontos, nem kell naplózni). */
// src: alapból az aktuális mód; a heti összefoglaló a többi mód állapotát is átadja
function buildDailyIndex(src = state) {
  const gs = src.globalStats;
  const idx = {};
  const entry = k => idx[k] || (idx[k] = { a: 0, c: 0, k: 0, g: 0, s: 0, n: 0, r: 0, rp: 0, rm: 0, rmp: 0, studied: false });
  const since = gs.dailySince || '9999-12-31';

  Object.entries(gs.daily || {}).forEach(([key, d]) => {
    const e = entry(key);
    e.a += d.a || 0; e.c += d.c || 0; e.k += d.k || 0; e.g += d.g || 0; e.s += d.s || 0;
    e.r += d.r || 0; e.rp += d.rp || 0; e.rm += d.rm || 0; e.rmp += d.rmp || 0;
  });
  (gs.sessionHistory || []).forEach(h => {
    const key = parseHuDateKey(h.date);
    if (!key || key >= since) return;
    const e = entry(key);
    e.a += (h.correct || 0) + (h.wrong || 0);
    e.c += h.correct || 0;
    e.s += h.duration || 0;
  });
  src.words.forEach(w => { const k = introducedDate(w); if (k) entry(k).n++; });
  Object.keys(gs.studyDays || {}).forEach(k => { if (gs.studyDays[k]) entry(k).studied = true; });
  return idx;
}

// 0: nincs tanulás · 1: aktív nap · 2: napi penzum vagy 20+ interakció
// 3: penzum + 40+ interakció · 4: 100+ interakció
function activityLevel(e, goal) {
  if (!e) return 0;
  const volume = e.a + e.k + e.g;
  if (!e.studied && volume === 0 && e.n === 0) return 0;
  if (volume >= 100) return 4;
  const metGoal = e.n >= goal;
  if (metGoal && volume >= 40) return 3;
  if (metGoal || volume >= 20) return 2;
  return 1;
}

/* ── Tudás-érettség (V13.6: az ismétlési köz alapján, mint az Ankiban) ──
   Ismerkedés: 7 napnál rövidebb ismétlési köz (vagy még nincs ütemezve).
   Gyakorlás alatt: 7-20 nap. Rögzült: legalább 21 nap. */
const YOUNG_DAYS = 7;

function computeMaturity() {
  const m = { fresh: 0, practicing: 0, mature: 0, notStarted: 0 };
  state.words.forEach(w => {
    if (isNewWord(w)) { m.notStarted++; return; }
    const interval = srsInterval(w);
    if (interval >= MATURE_DAYS) m.mature++;
    else if (interval >= YOUNG_DAYS) m.practicing++;
    else m.fresh++;
  });
  m.started = m.fresh + m.practicing + m.mature;
  return m;
}

/* ── KPI sáv ── */
function weekFocusSeconds(idx, weekOffset) {
  const start = addDays(startOfWeek(new Date()), weekOffset * 7);
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += (idx[dateKey(addDays(start, i))] || {}).s || 0;
  return sum;
}

function accuracyOf(words) {
  const c = words.reduce((s, w) => s + w.stats.totalCorrect, 0);
  const t = words.reduce((s, w) => s + w.stats.totalCorrect + w.stats.totalWrong, 0);
  return { c, t, pct: t > 0 ? Math.round(c / t * 100) : null };
}

/* ── V13.31: megtartási arány ──
   Az esedékes ismétlések közül mennyit tudtál elsőre (nem Újra), az utolsó RETENTION_DAYS napban, külön a friss
   (21 napnál rövidebb közű) és a rögzült kártyákra. Az ütemezés (FSRS) 90%-ra céloz. A V13.31 előtti ismétlésekről
   nincs ilyen adat, ezért mostantól gyűlik. */
const RETENTION_DAYS = 30;
const RETENTION_TARGET = 0.9;
function computeRetention(idx, days = RETENTION_DAYS) {
  let r = 0, rp = 0, rm = 0, rmp = 0;
  lastNDays(days).forEach(k => { const e = idx[k]; if (e) { r += e.r; rp += e.rp; rm += e.rm; rmp += e.rmp; } });
  return { total: r, passed: rp, young: { n: r - rm, p: rp - rmp }, mature: { n: rm, p: rmp } };
}

export { RETENTION_DAYS, RETENTION_TARGET, accuracyOf, activityLevel, buildDailyIndex, computeMaturity, computeRetention, weekFocusSeconds };
