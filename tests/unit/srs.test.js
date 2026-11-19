// Ismétlésütemező (FSRS-5) és a szó-szintű ütemezés tesztjei.
import { describe, it, expect } from 'vitest';
import { AGAIN, HARD, GOOD, EASY, intervalFor, initDifficulty, nextState, previewAll, retrievability } from '../../js/srs/fsrs.js';
import {
  cardInterval, dropLearningCards, dueForecast, fmtInterval, getDueCards, getDueWords, newCardPreview, practiceLapse, previewWord, rateWord, rescheduleNewCard, seedPracticeBacklog, seedReverseCards,
  seedMissing
} from '../../js/srs/schedule.js';

const TODAY = '2026-09-29';
const word = (id, stats = {}) => ({ id, en: id, hu: id, stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null, ...stats } });
const days = p => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.days]));

describe('FSRS-5 alapok', () => {
  it('90%-os megtartásnál az ismétlési köz a stabilitás', () => {
    expect(intervalFor(3.173)).toBe(3);
    expect(intervalFor(15.69)).toBe(16);
    expect(intervalFor(0.2)).toBe(1);
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 6);
  });
  it('új kártya: Újra ma, Nehéz 1 n, Jó 3 n, Könnyű 16 n; a Jó nehézsége kb. 5,3', () => {
    expect(days(previewAll(null, 0))).toEqual({ 1: 0, 2: 1, 3: 3, 4: 16 });
    expect(initDifficulty(GOOD)).toBeCloseTo(5.2825, 3);
  });
  it('sikeres ismétlés után nő a köz, és Nehéz ≤ Jó < Könnyű', () => {
    const card = { s: 3.173, d: 5.2825 };
    const p = previewAll(card, 3);
    expect(p[GOOD].days).toBeGreaterThan(3);
    expect(p[HARD].days).toBeLessThanOrEqual(p[GOOD].days);
    expect(p[EASY].days).toBeGreaterThan(p[GOOD].days);
    expect(p[AGAIN].s).toBeLessThan(card.s);
    expect(p[AGAIN].d).toBeGreaterThan(card.d);
    expect(p[EASY].d).toBeLessThan(card.d);
  });
  it('késve ismételt, mégis tudott szó stabilitása jobban nő', () => {
    const card = { s: 5, d: 5 };
    expect(nextState(card, GOOD, 15).s).toBeGreaterThan(nextState(card, GOOD, 5).s);
  });
});

describe('szavak ütemezése', () => {
  it('értékelés: esedékesség, ismétlésszám, visszaesés', () => {
    const w = word('a');
    rateWord(w, GOOD, TODAY);
    expect(w.stats.srs).toMatchObject({ due: '2026-10-02', last: TODAY, reps: 1, lapses: 0 });
    rateWord(w, AGAIN, '2026-10-02');
    expect(w.stats.srs).toMatchObject({ due: '2026-10-02', reps: 2, lapses: 1 });
    rateWord(w, GOOD, '2026-10-02'); // még aznap: rövid távú stabilitás
    expect(w.stats.srs.due > '2026-10-02').toBe(true);
  });
  it('V13.97: a még meg nem tanult szó kártyája lekerül, a megtanulté és a kézi szüneteltetés marad', () => {
    const card = () => ({ due: '2026-10-02', s: 3, d: 5, last: TODAY, reps: 1, lapses: 0 });
    const tudom = word('tudom', { introducedAt: TODAY, srs: card(), reviewPasses: 1 });
    const paused = word('szunet', { introducedAt: TODAY, srsSuspended: true });
    const learned = word('kesz', { introducedAt: '2026-09-01', practiceLearnedAt: '2026-09-10', srs: card(), srsRev: card() });
    const legacy = word('regi', { learnedAt: '2026-09-01', srs: card() });
    expect(dropLearningCards([tudom, paused, learned, legacy])).toBe(1);
    expect(tudom.stats.srs).toBeUndefined();
    expect(tudom.stats.reviewPasses).toBeUndefined();
    expect(paused.stats.srsSuspended).toBe(true);
    expect(learned.stats.srs).toBeDefined();
    expect(learned.stats.srsRev).toBeDefined();
    expect(legacy.stats.srs).toBeDefined();
    expect(dropLearningCards([tudom, paused, learned, legacy])).toBe(0);
  });
  it('szabad gyakorlás hibája holnapra hozza, a stabilitáshoz nem nyúl', () => {
    const w = word('a', { learnedAt: TODAY });
    rateWord(w, EASY, TODAY);
    const s = w.stats.srs.s;
    practiceLapse(w, TODAY);
    expect(w.stats.srs).toMatchObject({ due: '2026-09-30', s });
    const unscheduled = word('b', { totalWrong: 1 });
    practiceLapse(unscheduled, TODAY);
    expect(unscheduled.stats.srs).toBeUndefined();
  });
  it('esedékes lista és előrejelzés', () => {
    const at = (id, due, s = 5) => ({ ...word(id), stats: { learnedAt: '2026-09-01', srs: { due, s, d: 5, last: '2026-09-20' } } });
    const words = [at('c', '2026-09-29'), at('a', '2026-09-25'), at('b', '2026-09-29', 50), at('x', '2026-09-30'), at('y', '2026-10-06'), at('z', '2026-10-07'), word('uj')];
    expect(getDueWords(words, TODAY).map(w => w.id)).toEqual(['a', 'c', 'b']);
    expect(dueForecast(words, TODAY)).toEqual({ due: 3, tomorrow: 1, week: 2 }) // a 10-07-es már a 7 napon túl van;
  });
  it('a gombok alatti időközök', () => {
    expect(days(previewWord(word('uj'), TODAY))).toEqual({ 1: 0, 2: 1, 3: 3, 4: 16 });
    expect([0, 1, 12, 45, 400].map(fmtInterval)).toEqual(['ma', '1 n', '12 n', '2 hó', '1,1 év']);
  });
});

describe('már tanult szavak beosztása', () => {
  it('csak a tanult, még ütemezés nélküli szavakat osztja be', () => {
    const scheduled = word('kesz'); rateWord(scheduled, GOOD, TODAY);
    const before = { ...scheduled.stats.srs };
    const words = [word('uj'), scheduled, word('ma', { learnedAt: TODAY })];
    expect(seedMissing(words, TODAY)).toBe(1);
    expect(words[0].stats.srs).toBeUndefined();
    expect(scheduled.stats.srs).toEqual(before);
    expect(words[2].stats.srs.due).toBe('2026-10-02');
  });
  it('a lemaradt szavakat legfeljebb 3 hétre, napi adagokra osztja, a leginkább felejtettel kezdve', () => {
    const old = new Date(2026, 5, 1).getTime();
    const words = Array.from({ length: 400 }, (_, i) =>
      word(`w${i}`, { learnedAt: '2026-06-01', lastAttempt: old, totalCorrect: 3, totalWrong: i % 4, streak: 1 + (i % 3) }));
    words.push(word('gyenge', { learnedAt: '2026-06-01', lastAttempt: old, totalCorrect: 1, totalWrong: 5, streak: 0 }));
    seedMissing(words, TODAY);
    const perDay = {};
    words.forEach(w => { perDay[w.stats.srs.due] = (perDay[w.stats.srs.due] || 0) + 1; });
    const dayKeys = Object.keys(perDay).sort();
    expect(dayKeys[0]).toBe(TODAY);
    expect(dayKeys.length).toBeLessThanOrEqual(21);
    expect(Math.max(...Object.values(perDay))).toBeLessThanOrEqual(20);
    expect(words.find(w => w.id === 'gyenge').stats.srs.due).toBe(TODAY);
  });
  it('a csak szabad gyakorlásból ismert szó nem kap ismétlési ütemezést', () => {
    const recent = new Date(2026, 8, 27).getTime();
    const strong = word('eros', { lastAttempt: recent, totalCorrect: 6, totalWrong: 0, streak: 6 });
    const weak = word('gyenge', { lastAttempt: recent, totalCorrect: 2, totalWrong: 2, streak: 1 });
    expect(seedMissing([strong, weak], TODAY)).toBe(0);
    expect(strong.stats.srs).toBeUndefined();
    expect(weak.stats.srs).toBeUndefined();
  });
  it('az egyszer kipróbált kártya nem kerül az ismétlési halomba', () => {
    const accidental = word('veletlen', { totalCorrect: 1, totalWrong: 1, lastAttempt: new Date(2026, 8, 20).getTime() });
    practiceLapse(accidental, '2026-09-20');
    expect(accidental.stats.srs).toBeUndefined();
    expect(getDueWords([accidental], TODAY)).toEqual([]);
  });
  it('a gyakorlásból megtanult szó kártyája esedékes lesz, és a hiba holnapra hozza', () => {
    const practiced = word('gyakorlas', { totalCorrect: 5, practiceLearnedAt: '2026-09-20', srs: { due: '2026-10-20', s: 30, d: 5, last: '2026-09-20' } });
    practiceLapse(practiced, TODAY);
    expect(practiced.stats.srs.due).toBe('2026-09-30');
    expect(getDueWords([practiced], '2026-09-30').map(w => w.id)).toEqual(['gyakorlas']);
    expect(dueForecast([practiced], TODAY).tomorrow).toBe(1);
  });
  it('V13.97: az elkezdett, még nem megtanult szó nem kap kártyát, a gyakorlásban megtanult igen', () => {
    const started = word('elkezdett', { introducedAt: '2026-09-26' });
    expect(seedMissing([started], TODAY)).toBe(0);
    expect(started.stats.srs).toBeUndefined();
    started.stats.practiceLearnedAt = '2026-09-28'; // szinkronból kártya nélkül érkezett, már megtanultként
    expect(seedMissing([started], TODAY)).toBe(1);
    expect(started.stats.srs).toBeDefined();
  });
  it('a régi, csak gyakorlásból megtanult szavak legfeljebb napi 5-tel kapnak kártyát, a leginkább felejtettel kezdve', () => {
    const at = new Date(2026, 8, 1).getTime();
    const words = Array.from({ length: 7 }, (_, i) => word(`g${i}`, { practiceLearnedAt: '2026-09-01', lastAttempt: at, totalCorrect: 5 + i, streak: 5 + i }));
    const weakest = word('gyenge', { practiceLearnedLegacy: true, lastAttempt: at, totalCorrect: 5, totalWrong: 4, streak: 0 });
    const paused = word('szunet', { practiceLearnedAt: '2026-09-01', srsSuspended: true });
    const untouched = word('kartyas', { practiceLearnedAt: '2026-09-01', srs: { due: '2026-10-20', s: 30, d: 5, last: '2026-09-20' } });
    const started = word('napi', { introducedAt: '2026-09-28' }); // még nem megtanult: nem kap kártyát
    const all = [...words, weakest, paused, untouched, started];
    expect(seedPracticeBacklog(all, TODAY)).toBe(8);
    expect(weakest.stats.srs.due).toBe(TODAY);
    const dues = [...words, weakest].map(w => w.stats.srs.due);
    expect(dues.filter(d => d === TODAY)).toHaveLength(5);
    expect(dues.filter(d => d === '2026-09-30')).toHaveLength(3);
    expect(paused.stats.srs).toBeUndefined();
    expect(untouched.stats.srs.due).toBe('2026-10-20');
    expect(started.stats.srs).toBeUndefined();
    expect(seedPracticeBacklog(all, TODAY)).toBe(0);
  });
  it('a most megtanult szó új kártyája az első értékelést kapja a kör végén', () => {
    const w = word('uj', { practiceLearnedAt: TODAY });
    const preview = newCardPreview();
    expect([preview[2].days, preview[3].days, preview[4].days]).toEqual([1, 3, 16]);
    rateWord(w, 3, TODAY);
    expect(w.stats.srs.reps).toBe(1);
    rescheduleNewCard(w, 4, TODAY);
    expect(w.stats.srs).toMatchObject({ due: '2026-10-15', reps: 1, lapses: 0 });
  });
});

describe('fordított kártyák (V13.31)', () => {
  const stable = (id, s) => word(id, { learnedAt: '2026-08-01', srs: { due: '2026-10-20', s, d: 5, last: '2026-09-20', reps: 3, lapses: 0 } });
  it('csak a 7+ napos közű, megtanult szó kap, naponta legfeljebb 5, a legstabilabbal kezdve', () => {
    const words = [stable('a', 40), stable('b', 3), ...Array.from({ length: 6 }, (_, i) => stable(`s${i}`, 10 + i))];
    words.push(word('elkezdett', { introducedAt: '2026-09-20', srs: { due: '2026-10-20', s: 40, d: 5, last: '2026-09-20' } }));
    words.push(word('szunet', { learnedAt: '2026-08-01', srs: { due: '2026-10-20', s: 40, d: 5, last: '2026-09-20' }, srsRevSuspended: true }));
    const gs = {};
    expect(seedReverseCards(words, gs, TODAY)).toBe(5);
    const got = words.filter(w => w.stats.srsRev).map(w => w.id);
    expect(got).toEqual(['a', 's2', 's3', 's4', 's5']);
    expect(gs.reverseSeeded).toEqual({ day: TODAY, n: 5 });
    expect(seedReverseCards(words, gs, TODAY)).toBe(0);              // a mai keret elfogyott
    expect(seedReverseCards(words, gs, '2026-09-30')).toBe(2);       // holnap a maradék két alkalmas szó
    expect(words.find(w => w.id === 'b').stats.srsRev).toBeUndefined();
    expect(words.find(w => w.id === 'elkezdett').stats.srsRev).toBeUndefined();
    expect(words.find(w => w.id === 'szunet').stats.srsRev).toBeUndefined();
  });
  it('a fordított kártya saját ütemezéssel, új kártyaként indul, és a sorba is bekerül', () => {
    const w = stable('x', 30);
    seedReverseCards([w], {}, TODAY);
    expect(cardInterval(w, true)).toBe(0);
    expect(getDueCards([w], TODAY)).toEqual([{ word: w, rev: true }]);
    expect(previewWord(w, TODAY, true)[3].days).toBe(3); // új kártya: Jó = 3 nap
    rateWord(w, 1, TODAY, true);
    expect(w.stats.srsRev.lapses).toBe(0); // az első Újra nem visszaesés
    rateWord(w, 3, TODAY, true);
    expect(w.stats.srs.due).toBe('2026-10-20');
    expect(dueForecast([w], TODAY).due).toBe(0);
  });
});
