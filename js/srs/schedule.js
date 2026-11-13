// LexiLearn – srs/schedule.js
// V13.5: ismétlésütemezés szavakra. A kártya állapota a szó stats-ában él:
//   word.stats.srs = { due: 'YYYY-MM-DD', s: stabilitás, d: nehézség, last: 'YYYY-MM-DD', reps, lapses }
// A stats-szal együtt mentődik és szinkronizálódik (helyi tár + felhő), külön kezelés nélkül.
import { addDays, dateKey, keyToDate, todayKey } from '../core/dates.js';
import { isLearnedWord, isPracticeLearned } from '../goal/jlpt.js';
import { AGAIN, GOOD, W, intervalFor, previewAll, retrievability } from './fsrs.js';

const REVIEW_BATCH_SIZE = 20;       // egy alkalom legfeljebb ennyi kártya (5-15 perces alkalmak)
const SEED_SPREAD_MAX_DAYS = 21;    // a már tanult szavak beosztása legfeljebb 3 hétre
const SEED_MIN_PER_DAY = 15;
const PRACTICE_BACKLOG_PER_DAY = 5; // a régi, csak gyakorlásból megtanult szavak napi adagja (módonként)
const REVERSE_MIN_INTERVAL = 7;     // V13.31: fordított kártya csak a már stabil szóhoz (az eredeti köze legalább ennyi nap)
const REVERSE_PER_DAY = 5;          // ... és módonként naponta legfeljebb ennyi új

const round4 = x => Math.round(x * 10000) / 10000;
const daysBetween = (fromKey, toKey) => Math.round((keyToDate(toKey) - keyToDate(fromKey)) / 86400000);
const shiftKey = (key, n) => dateKey(addDays(keyToDate(key), n));

// V13.31: a fordított (magyar → japán / angol) kártya a stats.srsRev mezőben él, saját ütemezéssel
const fieldOf = rev => (rev ? 'srsRev' : 'srs');
function srsOf(word, rev = false) { return (word.stats && word.stats[fieldOf(rev)]) || null; }
// Új kártya: még nem értékelted (a fordított kártya első megjelenéséig nincs stabilitása)
const isFresh = card => !card || !(card.s > 0);
function isDue(word, today = todayKey(), rev = false) { const s = srsOf(word, rev); return !!s && s.due <= today; }

// Esedékes szavak: a legrégebben esedékes elöl, azon belül a leginkább felejtett
function getDueWords(words, today = todayKey()) {
  const r = w => { const s = srsOf(w); return retrievability(daysBetween(s.last, today), s.s); };
  return words.filter(w => isDue(w, today))
    .sort((a, b) => a.stats.srs.due.localeCompare(b.stats.srs.due) || (r(a) - r(b)) || String(a.id).localeCompare(String(b.id)));
}

// Minden esedékes kártya (eredeti és fordított): a korábban esedékes elöl, azonos napon az eredeti előbb
function getDueCards(words, today = todayKey()) {
  const fwd = getDueWords(words, today).map(word => ({ word, rev: false }));
  const rev = words.filter(w => isDue(w, today, true))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(word => ({ word, rev: true }));
  return [...fwd, ...rev].sort((x, y) => srsOf(x.word, x.rev).due.localeCompare(srsOf(y.word, y.rev).due));
}

// Előrejelzés a Kezdőlapra: ma esedékes, holnap, és a következő 7 nap (holnaptól); kártyákban számolva
function dueForecast(words, today = todayKey()) {
  const tomorrow = shiftKey(today, 1), weekEnd = shiftKey(today, 7);
  let due = 0, tomorrowCount = 0, week = 0;
  words.forEach(w => [false, true].forEach(rev => {
    const s = srsOf(w, rev);
    if (!s) return;
    if (s.due <= today) due++;
    else if (s.due <= weekEnd) { week++; if (s.due === tomorrow) tomorrowCount++; }
  }));
  return { due, tomorrow: tomorrowCount, week };
}

// A négy értékelés következménye (a gombok alatti "ma / 2 n / 4 n / 9 n")
function previewWord(word, today = todayKey(), rev = false) {
  const s = srsOf(word, rev);
  return isFresh(s) ? previewAll(null, 0) : previewAll({ s: s.s, d: s.d }, daysBetween(s.last, today));
}

function rateWord(word, rating, today = todayKey(), rev = false) {
  const prev = srsOf(word, rev);
  const p = previewWord(word, today, rev)[rating];
  word.stats[fieldOf(rev)] = {
    due: shiftKey(today, p.days), s: round4(p.s), d: round4(p.d), last: today,
    reps: (prev ? prev.reps || 0 : 0) + 1,
    lapses: (prev ? prev.lapses || 0 : 0) + (!isFresh(prev) && rating === AGAIN ? 1 : 0)
  };
  return word.stats[fieldOf(rev)];
}

// A kártya saját ismétlési köze (napban), a megtartási arány friss / rögzült bontásához
function cardInterval(word, rev = false) {
  const s = srsOf(word, rev);
  return isFresh(s) ? 0 : intervalFor(s.s);
}

/* ── V13.31: fordított kártyák (magyar → japán / angol) ──
   Csak a már stabil szó kap: ha az eredeti kártya köze legalább REVERSE_MIN_INTERVAL nap. Módonként naponta
   legfeljebb REVERSE_PER_DAY új, a legstabilabbal kezdve, hogy ne torlódjon az Ismétlés. A napi számláló a
   globalStats-ban van, így két eszközön sem jön kétszer annyi. Melyik mód kap ilyet, azt a hívó dönti el. */
function seedReverseCards(words, gs, today = todayKey()) {
  if (!gs) return 0;
  const already = gs.reverseSeeded && gs.reverseSeeded.day === today ? gs.reverseSeeded.n : 0;
  const room = REVERSE_PER_DAY - already;
  if (room <= 0) return 0;
  const ready = words.filter(w => w.stats && w.stats.srs && !w.stats.srsRev && !w.stats.srsRevSuspended
      && isLearnedWord(w) && intervalFor(w.stats.srs.s) >= REVERSE_MIN_INTERVAL)
    .sort((a, b) => (b.stats.srs.s - a.stats.srs.s) || String(a.id).localeCompare(String(b.id)))
    .slice(0, room);
  ready.forEach(w => { w.stats.srsRev = { due: today, s: 0, d: 0, last: today, reps: 0, lapses: 0 }; });
  if (ready.length) gs.reverseSeeded = { day: today, n: already + ready.length };
  return ready.length;
}

// Új kártya: a napi tanulásban a "Tudom", a gyakorlásban az ötödik egymás utáni találat hozza létre.
// Jó értékelés; ha közben "Még nem" is volt, előbb Újra (még ma)
function scheduleLearnedWord(word, hadAgain, today = todayKey()) {
  if (word.stats) delete word.stats.srsSuspended;
  if (hadAgain) rateWord(word, AGAIN, today);
  return rateWord(word, GOOD, today);
}

// V13.27: a gyakorlásban most megtanult szó első értékelése a kör végén (Nehéz / Jó / Könnyű).
// A kártya már Jó értékeléssel létrejött, ez csak felülírja, mintha most értékelnéd először.
function rescheduleNewCard(word, rating, today = todayKey()) {
  if (word.stats) delete word.stats.srs;
  return rateWord(word, rating, today);
}

// Egy teljesen új kártya értékeléseinek következménye (a kör végi gombok alatt)
function newCardPreview() {
  return previewAll(null, 0);
}

// Szabad gyakorlásban (kvíz, gépelős, mondat) elrontott, kártyával rendelkező szó legkésőbb
// holnap visszajön. Kártyát a gyakorlás csak az ötödik egymás utáni találatnál hoz létre: így
// egy véletlenül kiválasztott, későbbi lecke nehéz szava nem kerül be az ismétlésbe.
function practiceLapse(word, today = todayKey()) {
  const tomorrow = shiftKey(today, 1);
  const s = srsOf(word);
  if (!s) return s;
  if (s.due > tomorrow) {
    s.due = tomorrow;
  }
  return word.stats.srs;
}

/* ── Már tanult szavak beosztása (az SRS bevezetésekor, és ha szinkronból ütemezés nélküli szó jön) ──
   A meglévő eredményekből becsül stabilitást és nehézséget:
   - csak megtanult ("Tudom"), még nem kvízelt: mint egy friss Jó értékelés
   - az utolsó válasz hibás volt (sorozat 0): 1 nap
   - egymás utáni helyes válaszok: minden további kb. 1,9-szeres köz, a pontossággal súlyozva
   Ami így már esedékes lenne, azt a leginkább felejtettel kezdve napi adagokra osztja (legfeljebb 3 hét). */
function hasHistory(w) {
  return !!(w.stats?.learnedAt || w.stats?.introducedAt) && !w.stats.srsSuspended;
}

function estimateCard(w, today) {
  const st = w.stats;
  const tc = st.totalCorrect || 0, tw = st.totalWrong || 0, total = tc + tw;
  const acc = total ? tc / total : 1;
  const lastKey = st.lastAttempt ? dateKey(new Date(st.lastAttempt)) : (st.learnedAt || st.introducedAt || today);
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

// V13.27: a V13.27 előtt csak gyakorlásból megtanult szavaknak nincs kártyájuk, így sosem jöttek vissza.
// Módonként legfeljebb napi 5-tel, a leginkább felejtettel kezdve kerülnek be, hogy ne torlódjon az ismétlési sor.
function seedPracticeBacklog(words, today = todayKey()) {
  const waiting = words.filter(w => w.stats && !w.stats.srs && !w.stats.srsSuspended && !w.stats.learnedAt && !w.stats.introducedAt && isPracticeLearned(w));
  const cards = waiting.map(w => ({ w, c: estimateCard(w, today) }))
    .sort((a, b) => retrievability(daysBetween(a.c.last, today), a.c.s) - retrievability(daysBetween(b.c.last, today), b.c.s));
  cards.forEach((x, i) => {
    x.c.due = shiftKey(today, Math.floor(i / PRACTICE_BACKLOG_PER_DAY));
    x.w.stats.srs = x.c;
  });
  return cards.length;
}

// "ma", "1 n", "12 n", "3 hó", "1,5 év"
function fmtInterval(days) {
  if (days <= 0) return 'ma';
  if (days < 30) return `${days} n`;
  if (days < 365) return `${Math.round(days / 30)} hó`;
  return `${(Math.round(days / 36.5) / 10).toLocaleString('hu-HU')} év`;
}

export { PRACTICE_BACKLOG_PER_DAY, REVERSE_MIN_INTERVAL, REVERSE_PER_DAY, REVIEW_BATCH_SIZE, cardInterval, daysBetween, dueForecast, fmtInterval, getDueCards, getDueWords, hasHistory, isDue, newCardPreview, practiceLapse, seedReverseCards,
  previewWord, rateWord, rescheduleNewCard, scheduleLearnedWord, seedMissing, seedPracticeBacklog, shiftKey, srsOf };
