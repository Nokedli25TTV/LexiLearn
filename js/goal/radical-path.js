// LexiLearn – goal/radical-path.js
// V13.24: Radikál-útvonal. Tiszta számítások, DOM nélkül.
//
// Az útvonal (tools/build-radicals.mjs) a 214 radikált olyan sorrendbe teszi, hogy minden új radikál a lehető
// legtöbb szövegbeli kandzsi-előfordulást tegye teljessé, és tízesével leckékre bontja. Egy kandzsi akkor
// "lefedett", ha a felbontásának (KANJI_RADICALS) minden radikálja megtanult. A szöveg-lefedettség a lefedett
// kandzsik előfordulása az összes kandzsi-előfordulásból (Wikinews + Wikipédia, scriptin/kanji-frequency).
// A cél egy lefedettségi szint (50/80/90%, vagy mind a 214) egy célidőpontig; ebből jön a célnak megfelelő
// lecke, a hátralévő radikálok és a szükséges napi tempó. A "megtanult" ugyanaz a szabály, mint mindenhol.
// V13.26: ugyanez a felbontás mondja meg a Kandzsi módnak, mely kandzsik "készek" (minden radikáljukat tudod).
import { addDays, dateKey, keyToDate } from '../core/dates.js';
import { KANJI_DATA, KANJI_FREQ, KANJI_FREQ_TOTAL, KANJI_RADICALS, RADICAL_LESSONS } from '../core/data.js';
import { isLearnedWord, isMatureWord, isStartedWord, learnedDate } from './jlpt.js';

const PATH_TARGETS = [
  { value: '50', label: '50%', share: 0.5 },
  { value: '80', label: '80%', share: 0.8 },
  { value: '90', label: '90%', share: 0.9 },
  { value: 'all', label: 'Mind', share: null }
];
const DEFAULT_TARGET = '80';
const DEFAULT_MONTHS = 6;
const PACE_WINDOW_DAYS = 14;
const CORE_LEVELS = ['N5', 'N4', 'N3'];

const dayDiff = (a, b) => Math.round((keyToDate(b) - keyToDate(a)) / 86400000);

// Hónapok hozzáadása; a hónap végén a rövidebb hónap utolsó napjára áll (aug. 31. + 6 hó = febr. 28/29.)
function addMonthsKey(key, months) {
  const d = keyToDate(key);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return dateKey(d);
}

// A kandzsik radikáljai egyszer kigyűjtve; core: N5–N3 szintű kandzsi (a második mérőszámhoz)
let _parts = null;
function kanjiParts() {
  if (_parts) return _parts;
  const jlpt = new Map(KANJI_DATA.map(k => [k.kanji, k.jlpt]));
  _parts = Object.entries(KANJI_RADICALS).map(([k, parts]) => ({
    k, parts: [...new Set(parts.map(p => p[1]))], f: KANJI_FREQ[k] || 0, core: CORE_LEVELS.includes(jlpt.get(k))
  }));
  return _parts;
}

/* ── V13.26: kész kandzsik (minden radikáljuk megtanult) ── */
let _partsByKanji = null;
// A kandzsi radikáljai (egyediek); üres, ha nincs felbontása (az ilyen kandzsi nem vár radikálra)
function partsOf(kanji) {
  if (!_partsByKanji) _partsByKanji = new Map(kanjiParts().map(x => [x.k, x.parts]));
  return _partsByKanji.get(kanji) || [];
}
const missingRadicals = (kanji, known) => partsOf(kanji).filter(r => !known.has(r));
const isKanjiReady = (kanji, known) => missingRadicals(kanji, known).length === 0;
// V13.27: a kandzsik sorrendjéhez elég, ha a radikál már el van kezdve (a megtanulás két ismétlésig tart)
const knownRadicals = radicalWords => new Set(radicalWords.filter(isStartedWord).map(w => w.en));

/**
 * A radikálokból kész, még nem megtanult N5–N3 kandzsik, és amit a következő (nem kész) útvonal-lecke nyit meg.
 * @param {Array} radicalWords a radikál mód szavai
 * @param {Array} kanjiWords a kandzsi mód szavai
 */
function kanjiUnlockStatus(radicalWords, kanjiWords) {
  const known = knownRadicals(radicalWords);
  const open = kanjiWords.filter(w => CORE_LEVELS.includes(w.diff) && !isStartedWord(w));
  const ready = open.filter(w => isKanjiReady(w.en, known));
  const lesson = RADICAL_LESSONS.find(l => lessonChars(l).some(r => !known.has(r)));
  let nextLesson = null;
  if (lesson) {
    const after = new Set([...known, ...lessonChars(lesson)]);
    nextLesson = { lesson: lesson.lesson, unlocks: open.filter(w => !isKanjiReady(w.en, known) && isKanjiReady(w.en, after)) };
  }
  return { known: known.size, ready, nextLesson };
}

/**
 * Lefedettség egy radikál-halmazzal.
 * @param {Set<string>} known a megtanult radikálok
 */
function coverageOf(known) {
  let freq = 0, covered = 0, core = 0, coreTotal = 0;
  for (const x of kanjiParts()) {
    if (x.core) coreTotal++;
    if (!x.parts.every(p => known.has(p))) continue;
    freq += x.f;
    covered++;
    if (x.core) core++;
  }
  return {
    text: KANJI_FREQ_TOTAL ? freq / KANJI_FREQ_TOTAL : 0,
    kanji: coreTotal ? core / coreTotal : 0,
    covered, core, coreTotal
  };
}

const lessonChars = l => [...l.radicals];

const targetOf = value => PATH_TARGETS.find(t => t.value === value) || PATH_TARGETS.find(t => t.value === DEFAULT_TARGET);

// A cél leckéje: az első, amelynek végére a szöveg-lefedettség eléri a célt (Mind: az utolsó)
function targetLessonOf(value) {
  const t = targetOf(value);
  const last = RADICAL_LESSONS.at(-1);
  if (!last) return 0;
  if (t.share === null) return last.lesson;
  return (RADICAL_LESSONS.find(l => l.text >= t.share) || last).lesson;
}

function getPathGoal(globalStats, today) {
  const g = (globalStats && globalStats.radicalGoal) || {};
  return { target: targetOf(g.target).value, date: g.date || addMonthsKey(today, DEFAULT_MONTHS) };
}

// Az első megnyitáskor rögzítjük a (mától fél éves) célt, hogy ne csússzon naponta tovább. true: változott.
function ensurePathGoal(globalStats, today) {
  if (!globalStats || (globalStats.radicalGoal && globalStats.radicalGoal.date)) return false;
  globalStats.radicalGoal = getPathGoal(globalStats, today);
  return true;
}


// A teljesen megtanult leckék száma (a tanulás végi jelzéshez)
function completedLessons(words) {
  const learned = new Set(words.filter(isLearnedWord).map(w => w.en));
  return RADICAL_LESSONS.filter(l => lessonChars(l).every(r => learned.has(r))).map(l => l.lesson);
}

/**
 * Az útvonal állapota.
 * @param {Array} words a radikál mód szavai
 * @param {{target: string, date: string}} goal
 */
function pathProgress(words, goal, today) {
  const byChar = new Map(words.map(w => [w.en, w]));
  const learnedWords = words.filter(isLearnedWord);
  const known = new Set(learnedWords.map(w => w.en));
  const targetLesson = targetLessonOf(goal.target);
  const target = targetOf(goal.target);

  let current = null;
  const lessons = RADICAL_LESSONS.map(l => {
    const chars = lessonChars(l);
    const learnedHere = chars.filter(r => known.has(r));
    const done = learnedHere.length === chars.length;
    const dates = learnedHere.map(r => learnedDate(byChar.get(r))).filter(Boolean).sort();
    const item = {
      lesson: l.lesson, radicals: chars, total: chars.length, learned: learnedHere.length,
      text: l.text, kanji: l.kanji, done, inTarget: l.lesson <= targetLesson,
      reachedAt: done && dates.length === chars.length ? dates.at(-1) : null, current: false
    };
    if (!done && !current) { item.current = true; current = item; }
    return item;
  });

  const inTarget = lessons.filter(l => l.inTarget);
  const targetChars = new Set(inTarget.flatMap(l => l.radicals));
  const learned = learnedWords.filter(w => targetChars.has(w.en));
  const mature = learned.filter(isMatureWord).length;
  const goalLesson = lessons.find(l => l.lesson === targetLesson);

  return {
    target: targetChars.size, learned: learned.length, mature,
    pct: targetChars.size ? Math.min(1, learned.length / targetChars.size) : 0,
    targetLesson, targetValue: target.value, targetShare: target.share,
    // Mennyit fed le a cél lecke végére (a tervezett halmozott érték)
    goalText: goalLesson ? goalLesson.text : 0, goalKanji: goalLesson ? goalLesson.kanji : 0,
    coverage: coverageOf(known), learnedTotal: learnedWords.length, totalRadicals: words.length,
    lessons, current, complete: !current,
    pace: pathPace(words, targetChars, learned.length, goal.date, today)
  };
}

/** Tempó: hány új radikál kell naponta a célig, mennyi volt az utóbbi 14 nap átlaga, és mikor érsz célba. */
function pathPace(words, targetChars, learnedCount, goalDate, today) {
  const daysLeft = Math.max(0, dayDiff(today, goalDate));
  const remaining = Math.max(0, targetChars.size - learnedCount);
  const windowStart = dateKey(addDays(keyToDate(today), -(PACE_WINDOW_DAYS - 1)));
  const recent = words.filter(isLearnedWord)
    .filter(w => { const d = learnedDate(w); return d && d >= windowStart && d <= today; }).length;
  const avg = recent / PACE_WINDOW_DAYS;
  const needed = remaining === 0 ? 0 : daysLeft > 0 ? remaining / daysLeft : null;
  const projected = remaining === 0 ? today : avg > 0 ? dateKey(addDays(keyToDate(today), Math.ceil(remaining / avg))) : null;
  return {
    daysLeft, remaining, avg: Math.round(avg * 10) / 10, projected,
    // napi és heti igény; a napi felfelé kerekítve, a heti egy tizedesre (heti 3,5 olvashatóbb, mint napi 0,5)
    neededDaily: needed === null ? null : Math.ceil(needed),
    neededWeekly: needed === null ? null : Math.ceil(needed * 7 * 10) / 10,
    onTrack: remaining === 0 || (projected !== null && projected <= goalDate)
  };
}

export { DEFAULT_MONTHS, DEFAULT_TARGET, PATH_TARGETS, addMonthsKey, completedLessons, coverageOf, ensurePathGoal, getPathGoal,
  isKanjiReady, kanjiUnlockStatus, knownRadicals, missingRadicals, pathProgress, targetLessonOf };
