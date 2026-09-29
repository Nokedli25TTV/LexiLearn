// Egységtesztek a mag logikára (dátumok, napi napló, statisztika-számítások, új szavak).
// A modulokat közvetlenül importáljuk; az appData-t a teszt tölti fel kézzel.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dateKey, todayKey, parseHuDateKey, fmtDuration, lastNDays, startOfWeek, addDays } from '../../js/core/dates.js';
import { appData, setCurrentMode, createEmptyState } from '../../js/core/state.js';
import { activityLevel, computeMaturity, buildDailyIndex } from '../../js/stats/model.js';
import { isNewWord, getNewWordPool, logActivity, getDailyGoal } from '../../js/habit/goal.js';

const NOW = new Date(2026, 8, 29, 10, 0, 0); // kedd

const word = (id, extra = {}, stats = {}) => ({
  id, en: id, hu: id, tags: [], diff: 'N5', bookmarked: false,
  stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null, ...stats }, ...extra
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  globalThis.localforage = { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} };
  appData.japanese = createEmptyState();
  setCurrentMode('japanese');
});

describe('dátumok (helyi idő, nem UTC)', () => {
  it('dateKey helyi napot ad, éjfél után is', () => {
    expect(dateKey(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05');
    expect(todayKey()).toBe('2026-09-29');
  });
  it('a hu-HU toLocaleString dátumot kulccsá alakítja', () => {
    expect(parseHuDateKey('2026. 09. 15. 18:10:00')).toBe('2026-09-15');
    expect(parseHuDateKey('2026. 9. 5. 7:00:00')).toBe('2026-09-05');
    expect(parseHuDateKey('hibás')).toBeNull();
  });
  it('időtartam formázás', () => {
    expect(fmtDuration(0)).toBe('0 p');
    expect(fmtDuration(59 * 60)).toBe('59 p');
    expect(fmtDuration(135 * 60)).toBe('2 ó 15 p');
  });
  it('lastNDays: régitől a maig, a hét hétfővel indul', () => {
    const days = lastNDays(3);
    expect(days).toEqual(['2026-09-27', '2026-09-28', '2026-09-29']);
    expect(dateKey(startOfWeek(NOW))).toBe('2026-09-28');
    expect(dateKey(addDays(NOW, -30))).toBe('2026-08-30');
  });
});

describe('konzisztencia hőtérkép fokozatai', () => {
  it('0: nincs tanulás · 1: aktív · 2: penzum vagy 20+ · 3: penzum + 40+ · 4: 100+', () => {
    const e = (a, n = 0, studied = false) => ({ a, c: 0, k: 0, g: 0, s: 0, n, studied });
    expect(activityLevel(undefined, 10)).toBe(0);
    expect(activityLevel(e(0, 0, false), 10)).toBe(0);
    expect(activityLevel(e(0, 0, true), 10)).toBe(1);
    expect(activityLevel(e(5), 10)).toBe(1);
    expect(activityLevel(e(20), 10)).toBe(2);
    expect(activityLevel(e(0, 10), 10)).toBe(2);
    expect(activityLevel(e(40, 10), 10)).toBe(3);
    expect(activityLevel(e(100), 10)).toBe(4);
  });
});

describe('tudás-érettség', () => {
  it('ismerkedés / gyakorlás alatt / rögzült / még nem kezdett', () => {
    appData.japanese.words = [
      word('uj'),                                                                  // még nem kezdett
      word('friss', {}, { learnedAt: '2026-09-29', lastAttempt: 1 }),               // tegnap-ma tanult
      word('keves', {}, { totalCorrect: 1, lastAttempt: 1 }),                       // kétszer sem talált
      word('gyakorol', {}, { totalCorrect: 5, streak: 3, lastAttempt: 1 }),         // még nincs 5-ös sorozat
      word('rogzult', {}, { totalCorrect: 8, streak: 6, lastAttempt: 1, learnedAt: '2026-09-01' }),
      word('tulfriss', {}, { totalCorrect: 8, streak: 6, lastAttempt: 1, learnedAt: '2026-09-20' }) // < 2 hét
    ];
    expect(computeMaturity()).toEqual({ fresh: 2, practicing: 2, mature: 1, notStarted: 1, started: 5 });
  });
});

describe('napi index (napló + visszamenőleges becslés)', () => {
  it('a dailySince előtti napokra a sessionHistory-t használja, utána csak a naplót', () => {
    const gs = appData.japanese.globalStats;
    gs.dailySince = '2026-09-20';
    gs.daily = { '2026-09-28': { a: 10, c: 8, k: 2, g: 1, s: 300 } };
    gs.sessionHistory = [
      { date: '2026. 09. 15. 18:00:00', correct: 5, wrong: 1, rounds: 1, duration: 120 }, // beszámít
      { date: '2026. 09. 28. 18:00:00', correct: 50, wrong: 50, rounds: 1, duration: 999 } // napló már van → nem
    ];
    gs.studyDays = { '2026-09-10': true };
    appData.japanese.words = [word('a', {}, { learnedAt: '2026-09-28', lastAttempt: 1 })];
    const idx = buildDailyIndex();
    expect(idx['2026-09-15']).toMatchObject({ a: 6, c: 5, s: 120 });
    expect(idx['2026-09-28']).toMatchObject({ a: 10, c: 8, k: 2, g: 1, s: 300, n: 1 });
    expect(idx['2026-09-10']).toMatchObject({ studied: true, a: 0 });
  });
});

describe('új szavak és napi napló', () => {
  it('isNewWord: se learnedAt, se próbálkozás', () => {
    expect(isNewWord(word('x'))).toBe(true);
    expect(isNewWord(word('x', {}, { learnedAt: '2026-09-01' }))).toBe(false);
    expect(isNewWord(word('x', {}, { totalWrong: 1 }))).toBe(false);
  });
  it('az új szavak lecke, majd szint szerint rendezve jönnek', () => {
    appData.japanese.words = [
      word('n4-l2', { lesson: 2, diff: 'N4' }), word('n5-l2', { lesson: 2, diff: 'N5' }),
      word('l1', { lesson: 1 }), word('lecke-nelkul', {}), word('regi', { lesson: 1 }, { totalCorrect: 1 })
    ];
    expect(getNewWordPool().map(w => w.id)).toEqual(['l1', 'n5-l2', 'n4-l2', 'lecke-nelkul']);
  });
  it('a napi cél módonként alapértelmezett, a beállított felülírja', () => {
    expect(getDailyGoal()).toBe(10);
    appData.japanese.globalStats.dailyGoal = 5;
    expect(getDailyGoal()).toBe(5);
  });
  it('logActivity: az aktív idő 45 mp-re vágva, 3 perc szünet után új blokk', () => {
    logActivity({ correct: true });                 // első: +5 mp
    vi.setSystemTime(new Date(NOW.getTime() + 20_000));
    logActivity({ correct: false });                // +20 mp
    vi.setSystemTime(new Date(NOW.getTime() + 120_000));
    logActivity({ known: true });                   // 100 mp szünet → vágva 45
    vi.setSystemTime(new Date(NOW.getTime() + 600_000));
    logActivity({ known: false });                  // 8 perc szünet → új blokk, +5
    expect(appData.japanese.globalStats.daily['2026-09-29']).toEqual({ a: 2, c: 1, k: 1, g: 1, s: 75 });
    expect(appData.japanese.globalStats.dailySince).toBe('2026-09-29');
  });
});
