// LexiLearn – srs/schedule.js
// V13.5: ismétlésütemezés szavakra. A kártya állapota a szó stats-ában él:
//   word.stats.srs = { due: 'YYYY-MM-DD', s: stabilitás, d: nehézség, last: 'YYYY-MM-DD', reps, lapses }
// A stats-szal együtt mentődik és szinkronizálódik (helyi tár + felhő), külön kezelés nélkül.
import { addDays, dateKey, keyToDate, todayKey } from '../core/dates.js';
import { isLearnedWord } from '../goal/jlpt.js';
import { AGAIN, GOOD, W, intervalFor, previewAll, retrievability } from './fsrs.js';

const REVIEW_BATCH_SIZE = 20;       // egy alkalom legfeljebb ennyi kártya (5-15 perces alkalmak)
const SEED_SPREAD_MAX_DAYS = 21;    // a már tanult szavak beosztása legfeljebb 3 hétre
const SEED_MIN_PER_DAY = 15;

const round4 = x => Math.round(x * 10000) / 10000;
const daysBetween = (fromKey, toKey) => Math.round((keyToDate(toKey) - keyToDate(fromKey)) / 86400000);
const shiftKey = (key, n) => dateKey(addDays(keyToDate(key), n));

function srsOf(word) { return (word.stats && word.stats.srs) || null; }
function isDue(word, today = todayKey()) { const s = srsOf(word); return isLearnedWord(word) && !!s && s.due <= today; }

// Esedékes szavak: a legrégebben esedékes elöl, azon belül a leginkább felejtett
function getDueWords(words, today = todayKey()) {
  const r = w => { const s = srsOf(w); return retrievability(daysBetween(s.last, today), s.s); };
  return words.filter(w => isDue(w, today))
    .sort((a, b) => a.stats.srs.due.localeCompare(b.stats.srs.due) || (r(a) - r(b)) || String(a.id).localeCompare(String(b.id)));
}

// Előrejelzés a Kezdőlapra: ma esedékes, holnap, és a következő 7 nap (holnaptól)
function dueForecast(words, today = todayKey()) {
  const tomorrow = shiftKey(today, 1), weekEnd = shiftKey(today, 7);
  let due = 0, tomorrowCount = 0, week = 0;
  words.forEach(w => {
    const s = srsOf(w);
    if (!s || !isLearnedWord(w)) return;
    if (s.due <= today) due++;
    else if (s.due <= weekEnd) { week++; if (s.due === tomorrow) tomorrowCount++; }
  });
  return { due, tomorrow: tomorrowCount, week };
}

// A négy értékelés következménye (a gombok alatti "ma / 2 n / 4 n / 9 n")
function previewWord(word, today = todayKey()) {
  const s = srsOf(word);
  return previewAll(s ? { s: s.s, d: s.d } : null, s ? daysBetween(s.last, today) : 0);
}

function rateWord(word, rating, today = todayKey()) {
  const prev = srsOf(word);
  const p = previewWord(word, today)[rating];
  word.stats.srs = {
    due: shiftKey(today, p.days), s: round4(p.s), d: round4(p.d), last: today,
    reps: (prev ? prev.reps || 0 : 0) + 1,
    lapses: (prev ? prev.lapses || 0 : 0) + (prev && rating === AGAIN ? 1 : 0)
  };
  return word.stats.srs;
}

// Új szó a tanuló kártyán: a "Tudom" Jó értékelés; ha közben "Még nem" is volt, előbb Újra (még ma)
function scheduleLearnedWord(word, hadAgain, today = todayKey()) {
  if (word.stats) delete word.stats.srsSuspended;
  if (hadAgain) rateWord(word, AGAIN, today);
  return rateWord(word, GOOD, today);
}

// Szabad gyakorlásban (kvíz, gépelős, mondat) elrontott, már napi tanulásból
// ütemezett szó legkésőbb holnap visszajön. A szabad gyakorlás önmagában nem hoz
// létre SRS-kártyát: így egy véletlenül kiválasztott, későbbi lecke nehéz szava nem
// kerül be a napi ismétlésbe.
function practiceLapse(word, today = todayKey()) {
  const tomorrow = shiftKey(today, 1);
  const s = srsOf(word);
  if (!s || !word.stats?.learnedAt) return s;
  if (s.due > tomorrow) {
    s.due = tomorrow;
  }
  return word.stats.srs;
}

// A korábbi működés a csak szabad gyakorlásban ötször eltalált szavakhoz is
// létrehozott SRS-kártyát. Ezeket betöltéskor eltávolítjuk; a kvízeredmény és a
// statisztikai „megtanult” állapot megmarad, csak az ismétlési sor tisztul ki.
function clearPracticeOnlySchedules(words) {
  let cleared = 0;
  words.forEach(w => {
    if (w.stats?.srs && !w.stats.learnedAt) {
      delete w.stats.srs;
      cleared++;
    }
  });
  return cleared;
}

/* ── Már tanult szavak beosztása (az SRS bevezetésekor, és ha szinkronból ütemezés nélküli szó jön) ──
   A meglévő eredményekből becsül stabilitást és nehézséget:
   - csak megtanult ("Tudom"), még nem kvízelt: mint egy friss Jó értékelés
   - az utolsó válasz hibás volt (sorozat 0): 1 nap
   - egymás utáni helyes válaszok: minden további kb. 1,9-szeres köz, a pontossággal súlyozva
   Ami így már esedékes lenne, azt a leginkább felejtettel kezdve napi adagokra osztja (legfeljebb 3 hét). */
function hasHistory(w) {
  return !!w.stats?.learnedAt && !w.stats.srsSuspended;
}

function estimateCard(w, today) {
  const st = w.stats;
  const tc = st.totalCorrect || 0, tw = st.totalWrong || 0, total = tc + tw;
  const acc = total ? tc / total : 1;
  const lastKey = st.lastAttempt ? dateKey(new Date(st.lastAttempt)) : (st.learnedAt || today);
  let s;
  if (total === 0) s = W[2];
  else if (!(st.streak > 0)) s = 1;
  else s = Math.min(120, Math.max(1, 2.5 * Math.pow(1.9, st.streak - 1) * (0.5 + acc / 2)));
  const d = total < 3 ? 5 : Math.min(10, Math.max(1, 5 + (0.85 - acc) * 12));
  const last = lastKey > today ? today : lastKey;
  return { s: round4(s), d: round4(d), last, due: shiftKey(last, intervalFor(s)), reps: total > 0 ? 1 : 0, lapses: 0 };
}

function seedMissing(words, today = todayKey()) {
  const fresh = words.filter(w => w.stats && !w.stats.srs && hasHistory(w));
  if (!fresh.length) return 0;
  const cards = fresh.map(w => ({ w, c: estimateCard(w, today) }));
  const overdue = cards.filter(x => x.c.due <= today)
    .sort((a, b) => retrievability(daysBetween(a.c.last, today), a.c.s) - retrievability(daysBetween(b.c.last, today), b.c.s));
  const perDay = Math.max(SEED_MIN_PER_DAY, Math.ceil(overdue.length / SEED_SPREAD_MAX_DAYS));
  overdue.forEach((x, i) => { x.c.due = shiftKey(today, Math.floor(i / perDay)); });
  cards.forEach(x => { x.w.stats.srs = x.c; });
  return cards.length;
}

// "ma", "1 n", "12 n", "3 hó", "1,5 év"
function fmtInterval(days) {
  if (days <= 0) return 'ma';
  if (days < 30) return `${days} n`;
  if (days < 365) return `${Math.round(days / 30)} hó`;
  return `${(Math.round(days / 36.5) / 10).toLocaleString('hu-HU')} év`;
}

export { REVIEW_BATCH_SIZE, clearPracticeOnlySchedules, daysBetween, dueForecast, fmtInterval, getDueWords, hasHistory, isDue, practiceLapse,
  previewWord, rateWord, scheduleLearnedWord, seedMissing, shiftKey, srsOf };
