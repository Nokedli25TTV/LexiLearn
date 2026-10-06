// Ismétlésütemező (FSRS-5) és a szó-szintű ütemezés tesztjei.
import { describe, it, expect } from 'vitest';
import { AGAIN, HARD, GOOD, EASY, intervalFor, initDifficulty, nextState, previewAll, retrievability } from '../../js/srs/fsrs.js';
import {
  clearPracticeOnlySchedules, dueForecast, fmtInterval, getDueWords, practiceLapse, previewWord, rateWord,
  scheduleLearnedWord, seedMissing
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
  it('tanulás: "Még nem" után hamarabb jön vissza, mint elsőre tudva', () => {
    const a = word('a'), b = word('b');
    scheduleLearnedWord(a, false, TODAY);
    scheduleLearnedWord(b, true, TODAY);
    expect(a.stats.srs.due).toBe('2026-10-02');
    expect(b.stats.srs.due < a.stats.srs.due).toBe(true);
    expect(b.stats.srs.lapses).toBe(0);
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
  it('a régi, csak gyakorlásból létrejött ütemezést törli, a napi tanulásét megtartja', () => {
    const practiceOnly = word('gyakorlas', { totalCorrect: 5, practiceLearnedAt: '2026-09-20', srs: { due: TODAY, s: 3, d: 5, last: '2026-09-20' } });
    const daily = word('napi', { learnedAt: '2026-09-20', srs: { due: TODAY, s: 3, d: 5, last: '2026-09-20' } });
    expect(clearPracticeOnlySchedules([practiceOnly, daily])).toBe(1);
    expect(practiceOnly.stats.srs).toBeUndefined();
    expect(daily.stats.srs).toBeDefined();
  });
});
