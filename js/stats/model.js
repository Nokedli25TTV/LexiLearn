// LexiLearn – stats/model.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { addDays, dateKey, parseHuDateKey, startOfWeek } from '../core/dates.js';
import { state } from '../core/state.js';
import { isNewWord } from '../habit/goal.js';

/* ── Napi index: napló + visszamenőleges becslés ──
   A részletes napló (globalStats.daily) a V13.2-vel indult. Az azelőtti napokra a
   befejezett gyakorlások (sessionHistory) és a studyDays adnak becslést. Az új szavak
   száma mindig a szavak learnedAt mezőjéből jön (pontos, nem kell naplózni). */
function buildDailyIndex() {
  const gs = state.globalStats;
  const idx = {};
  const entry = k => idx[k] || (idx[k] = { a: 0, c: 0, k: 0, g: 0, s: 0, n: 0, studied: false });
  const since = gs.dailySince || '9999-12-31';

  Object.entries(gs.daily || {}).forEach(([key, d]) => {
    const e = entry(key);
    e.a += d.a || 0; e.c += d.c || 0; e.k += d.k || 0; e.g += d.g || 0; e.s += d.s || 0;
  });
  (gs.sessionHistory || []).forEach(h => {
    const key = parseHuDateKey(h.date);
    if (!key || key >= since) return;
    const e = entry(key);
    e.a += (h.correct || 0) + (h.wrong || 0);
    e.c += h.correct || 0;
    e.s += h.duration || 0;
  });
  state.words.forEach(w => { const k = w.stats && w.stats.learnedAt; if (k) entry(k).n++; });
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

/* ── Tudás-érettség ──
   Ismerkedés: az elmúlt 2 napban tanult, vagy még kétszer sem eltalált szó.
   Rögzült: legalább 5-ször egymás után helyes, és (ha ismert) 2 hétnél régebben tanult.
   Gyakorlás alatt: minden más elkezdett szó. */
function computeMaturity() {
  const yesterday = dateKey(addDays(new Date(), -1));
  const twoWeeksAgo = dateKey(addDays(new Date(), -14));
  const m = { fresh: 0, practicing: 0, mature: 0, notStarted: 0 };
  state.words.forEach(w => {
    if (isNewWord(w)) { m.notStarted++; return; }
    const s = w.stats || {};
    const la = s.learnedAt;
    if ((la && la >= yesterday) || (s.totalCorrect || 0) < 2) m.fresh++;
    else if ((s.streak || 0) >= 5 && (!la || la <= twoWeeksAgo)) m.mature++;
    else m.practicing++;
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

export { accuracyOf, activityLevel, buildDailyIndex, computeMaturity, weekFocusSeconds };
