// LexiLearn – goal/jlpt.js
// V13.6: JLPT haladás (N5 → N4 → N3). Tiszta számítások, DOM nélkül.
//
// Viszonyítás: a JLPT-hez általánosan megadott, halmozott célszámok (N3-hoz összesen kb. 3750 szó
// és 650 kandzsi). Az N5-N3 szintű szavak együtt számítanak, így a vártnál több N5 szó is előrevisz.
// Egy szó "elkezdett", ha a napi tanulásban a "Tudom" után ismétlésre vár. "Megtanult", ha ezután két ismétlésen
// egymás után tudtad, vagy szabad gyakorlásban ötször egymás után helyesen válaszoltál rá (egy hiba újraindítja
// a számolást). "Rögzült", ha az ismétlési köze legalább 21 nap.
import { addDays, dateKey, keyToDate } from '../core/dates.js';
import { AGAIN, HARD, intervalFor } from '../srs/fsrs.js';

const LEVELS = ['N5', 'N4', 'N3'];
const TARGETS = {
  words: { N5: 800, N4: 1500, N3: 3750 },
  kanji: { N5: 100, N4: 300, N3: 650 }
};
// Mérföldkő-lépcsők szintenként [ettől, eddig, lépés]
const STEPS = {
  words: [[0, 800, 100], [800, 1500, 100], [1500, 3750, 250]],
  kanji: [[0, 100, 25], [100, 300, 50], [300, 650, 50]]
};
const DEFAULT_GOAL = { level: 'N3', date: '2027-07-04' };
const MATURE_DAYS = 21;
const PACE_WINDOW_DAYS = 14;
const PRACTICE_LEARNED_CORRECT = 5;
const REVIEW_LEARNED_PASSES = 2;

const dayDiff = (a, b) => Math.round((keyToDate(b) - keyToDate(a)) / 86400000);

function buildMilestones(kind) {
  const out = [];
  STEPS[kind].forEach(([from, to, step], i) => {
    for (let n = from + step; n <= to; n += step) out.push({ n, level: LEVELS[i], levelEnd: n === to });
  });
  return out;
}

// A gyakorlásból megtanult szó a küszöb átlépésekor practiceLearnedAt dátumot kap (markPracticeLearned),
// így egy későbbi hiba, ami a sorozatot nullázza, már nem veszi ki a megtanultak közül.
// practiceLearnedLegacy: a régi (összesítve 5 helyes) szabállyal, dátum nélkül megtanult szó.
function isPracticeLearned(w) {
  const s = w.stats || {};
  return !!s.practiceLearnedAt || !!s.practiceLearnedLegacy;
}

function isLearnedWord(w) {
  return !!(w.stats && w.stats.learnedAt) || isPracticeLearned(w);
}

// V13.27: a napi tanulás "Tudom" gombja csak elkezdi a szót (introducedAt): kap ismétlőkártyát és kikerül az
// új szavak közül, de megtanult csak akkor lesz, ha fel is tudtad idézni. A learnedAt a megtanulás napja.
function isStartedWord(w) {
  return !!(w.stats && w.stats.introducedAt) || isLearnedWord(w);
}

function isLearningWord(w) {
  return isStartedWord(w) && !isLearnedWord(w);
}

// Melyik napi penzumba számít a szó: az elkezdés napja, a V13.27 előtti szavaknál a learnedAt
function introducedDate(w) {
  const s = w.stats || {};
  return s.introducedAt || s.learnedAt || null;
}

// Ismétlés után: egymás után két Jó vagy Könnyű teszi megtanulttá az elkezdett szót.
// Az Újra elölről indítja a számolást, a Nehéz nem számít, de nem is nulláz.
function markReviewLearned(w, rating, today = dateKey(new Date())) {
  if (!isLearningWord(w)) return false;
  const s = w.stats;
  if (rating === AGAIN) { s.reviewPasses = 0; return false; }
  if (rating === HARD) return false;
  s.reviewPasses = (s.reviewPasses || 0) + 1;
  if (s.reviewPasses < REVIEW_LEARNED_PASSES) return false;
  s.learnedAt = today;
  return true;
}

// A küszöb átlépésének dátuma kell a 14 napos tempóhoz és a mérföldkövekhez.
function markPracticeLearned(w, today = dateKey(new Date())) {
  const s = w.stats || (w.stats = {});
  if (s.learnedAt || isPracticeLearned(w) || (s.streak || 0) < PRACTICE_LEARNED_CORRECT) return false;
  s.practiceLearnedAt = today;
  return true;
}

// V13.17 előtt az összesen 5 helyes válasz is elég volt. Az így megtanult, de dátum nélkül maradt
// szavak egyszer jelzőt kapnak, hogy az egymás utáni szabály bevezetésekor se essenek ki a
// megtanultak közül. Dátumot nem kapnak: a heti összesítőben továbbra sem számítanak újnak.
function backfillPracticeLearned(words) {
  let marked = 0;
  words.forEach(w => {
    const s = w.stats;
    if (!s || s.learnedAt || isPracticeLearned(w) || (s.totalCorrect || 0) < PRACTICE_LEARNED_CORRECT) return;
    s.practiceLearnedLegacy = true;
    marked++;
  });
  return marked;
}

// A kártya saját ismétlési köze (a stabilitásból). Nem a due - last különbség: a beosztás és a
// szabad gyakorlás hibája eltolhatja az esedékességet, a köz ettől még ugyanaz marad.
function srsInterval(w) {
  const s = w.stats && w.stats.srs;
  return s ? intervalFor(s.s) : 0;
}

function isMatureWord(w) { return srsInterval(w) >= MATURE_DAYS; }

// Mikor tanultad (a mérföldkövek dátumához): learnedAt, különben az első ismert gyakorlás
function learnedDate(w) {
  const s = w.stats || {};
  if (s.learnedAt) return s.learnedAt;
  if (s.practiceLearnedAt) return s.practiceLearnedAt;
  if (s.lastAttempt) return dateKey(new Date(s.lastAttempt));
  return null;
}

/**
 * Egy sáv (szókincs vagy kandzsi) állapota.
 * @param {Array} words a mód szavai (japán vagy kandzsi)
 * @param {'words'|'kanji'} kind
 */
function trackProgress(words, kind, today) {
  const inScope = words.filter(w => LEVELS.includes(w.diff));
  const learned = inScope.filter(isLearnedWord);
  const mature = learned.filter(isMatureWord).length;
  const target = TARGETS[kind].N3;
  const perLevel = LEVELS.map(level => ({
    level,
    target: TARGETS[kind][level],
    inDictionary: inScope.filter(w => w.diff === level).length,
    learned: learned.filter(w => w.diff === level).length
  }));

  // Mérföldkövek: a k-adik megtanult szó dátuma = a k-adik mérföldkő elérése (ismeretlen dátum elöl)
  const dates = learned.map(learnedDate).sort((a, b) => (a === b ? 0 : a === null ? -1 : b === null ? 1 : a.localeCompare(b)));
  const milestones = buildMilestones(kind).map((m, i, all) => {
    const prev = i === 0 ? 0 : all[i - 1].n;
    const done = learned.length >= m.n;
    return {
      ...m, prev, done,
      current: !done && learned.length >= prev,
      reachedAt: done ? dates[m.n - 1] : null,
      progress: Math.max(0, Math.min(1, (learned.length - prev) / (m.n - prev)))
    };
  });

  return {
    kind, target, learned: learned.length, mature, inDictionary: inScope.length,
    pct: Math.min(1, learned.length / target), maturePct: Math.min(1, mature / target),
    perLevel, milestones,
    levelReached: [...LEVELS].reverse().find(l => learned.length >= TARGETS[kind][l]) || null,
    // Hány mérföldkő teljesült ma (a tanulás végén egy sor jelzi)
    today: learned.filter(w => learnedDate(w) === today).length
  };
}

/**
 * Tempó: hány új kell naponta a célig, mennyi volt az utóbbi 14 nap átlaga, és ezzel mikor érsz célba.
 */
function paceFor(track, words, goalDate, today) {
  const daysLeft = Math.max(0, dayDiff(today, goalDate));
  const remaining = Math.max(0, track.target - track.learned);
  const windowStart = dateKey(addDays(keyToDate(today), -(PACE_WINDOW_DAYS - 1)));
  const recent = words.filter(w => LEVELS.includes(w.diff) && isLearnedWord(w))
    .filter(w => { const d = learnedDate(w); return d && d >= windowStart && d <= today; }).length;
  const avg = recent / PACE_WINDOW_DAYS;
  const needed = remaining === 0 ? 0 : daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null;
  const projected = remaining === 0 ? today : avg > 0 ? dateKey(addDays(keyToDate(today), Math.ceil(remaining / avg))) : null;
  return {
    daysLeft, remaining, needed, avg: Math.round(avg * 10) / 10, projected,
    onTrack: remaining === 0 || (projected !== null && projected <= goalDate)
  };
}

// Mérföldkő átlépése két darabszám között (a tanulás végén: "Mérföldkő: 1000 szó")
function crossedMilestones(kind, before, after) {
  return buildMilestones(kind).filter(m => before < m.n && after >= m.n);
}

function getGoal(globalStats) {
  const g = globalStats && globalStats.jlptGoal;
  return { ...DEFAULT_GOAL, ...(g || {}) };
}

export { DEFAULT_GOAL, LEVELS, MATURE_DAYS, PRACTICE_LEARNED_CORRECT, STEPS, TARGETS, backfillPracticeLearned, buildMilestones,
  crossedMilestones, getGoal, introducedDate, isLearnedWord, isLearningWord, isMatureWord, isPracticeLearned, isStartedWord, learnedDate, markPracticeLearned, markReviewLearned, paceFor,
  srsInterval, trackProgress };
