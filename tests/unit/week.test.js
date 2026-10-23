// V13.13: heti összefoglaló (stats/week.js) – számítások kézzel feltöltött állapotból.
// A rögzített "ma": 2026-09-29, kedd. Ez a hét: szept. 28. – okt. 4., a múlt hét: szept. 21–27.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appData, setCurrentMode, createEmptyState } from '../../js/core/state.js';
import { earliestWeekKey, fmtRange, jlptWeek, summarizeWeek, unsureWords, weekHomeRowHtml, weekSentence, weekStartKey, weekTag } from '../../js/stats/week.js';
import { deltaChip, trendHtml } from '../../js/stats/view.js';

const NOW = new Date(2026, 8, 29, 10, 0, 0);
const TODAY = '2026-09-29';

const word = (id, stats = {}, extra = {}) => ({
  id, en: id, hu: `${id}-hu`, tags: [], diff: 'N5', bookmarked: false,
  stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null, ...stats }, ...extra
});
const at = (y, m, d) => new Date(y, m - 1, d, 12).getTime();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  globalThis.localforage = { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} };
  appData.japanese = createEmptyState();
  appData.kanji = createEmptyState();
  appData.english = createEmptyState();
  setCurrentMode('japanese');
});

describe('heti összefoglaló: hetek és feliratok', () => {
  it('a hét hétfőn kezdődik, és eltolható', () => {
    expect(weekStartKey(0)).toBe('2026-09-28');
    expect(weekStartKey(-1)).toBe('2026-09-21');
    expect(weekTag(0)).toBe('Ez a hét');
    expect(weekTag(-1)).toBe('Múlt hét');
    expect(weekTag(-3)).toBe('3 héttel ezelőtt');
  });
  it('a dátumtartomány hónapon belül rövid, hónaphatáron teljes', () => {
    expect(fmtRange('2026-09-21', '2026-09-27')).toBe('szept. 21–27.');
    expect(fmtRange('2026-09-28', '2026-10-04')).toBe('szept. 28. – okt. 4.');
  });
});

describe('heti összefoglaló: számok', () => {
  beforeEach(() => {
    const ja = appData.japanese;
    ja.globalStats.dailySince = '2026-09-14';
    ja.globalStats.daily = {
      '2026-09-21': { a: 20, c: 16, k: 10, g: 2, s: 900 },
      '2026-09-23': { a: 10, c: 9, k: 5, g: 0, s: 600 },
      '2026-09-28': { a: 8, c: 4, k: 4, g: 0, s: 300 },
      '2026-09-29': { a: 0, c: 0, k: 3, g: 1, s: 120 }
    };
    ja.globalStats.studyDays = { '2026-09-21': true, '2026-09-23': true, '2026-09-28': true, '2026-09-29': true };
    ja.words = [
      word('mult-het-1', { learnedAt: '2026-09-21' }),
      word('mult-het-2', { learnedAt: '2026-09-23' }, { diff: 'N4' }),
      word('gyakorlasbol', { totalCorrect: 5, practiceLearnedAt: '2026-09-23' }),
      word('e-heten', { learnedAt: '2026-09-28' }),
      word('regi-datum-nelkul', { totalCorrect: 9, practiceLearnedLegacy: true }),
      word('n1-szo', { learnedAt: '2026-09-28' }, { diff: 'N1' }),
      word('uj', {})
    ];
  });

  it('a múlt hét összesítése: aktív napok, megtanult, válaszok, pontosság, idő', () => {
    const w = summarizeWeek(appData.japanese, '2026-09-21', 10, TODAY);
    expect(w.endKey).toBe('2026-09-27');
    expect(w.activeDays).toBe(2);
    expect(w.elapsedDays).toBe(7);
    expect(w.learned).toBe(3);        // két napi tanulás + egy gyakorlásból
    expect(w.fromPractice).toBe(1);
    expect(w.answers).toBe(47);       // 20+10+2 és 10+5+0
    expect(w.good).toBe(40);          // helyes válasz + "Tudom"
    expect(w.accuracy).toBe(85);
    expect(w.seconds).toBe(1500);
    expect(w.days.map(d => d.fresh)).toEqual([1, 0, 2, 0, 0, 0, 0]);
  });

  it('a futó hét: a jövőbeli napok nem számítanak aktívnak, a mai meg van jelölve', () => {
    const w = summarizeWeek(appData.japanese, '2026-09-28', 10, TODAY);
    expect(w.activeDays).toBe(2);
    expect(w.elapsedDays).toBe(2);
    expect(w.days.filter(d => d.future)).toHaveLength(5);
    expect(w.days[1].isToday).toBe(true);
    expect(w.learned).toBe(2);
    expect(weekSentence(w, true)).toBe('Eddig 2 aktív nap a héten. A pontosság 69%.');
  });

  it('üres hét: nincs pontosság, a mondat tényszerű', () => {
    const w = summarizeWeek(appData.japanese, '2026-09-07', 10, TODAY);
    expect(w).toMatchObject({ activeDays: 0, learned: 0, answers: 0, accuracy: null });
    expect(weekSentence(w, false)).toBe('Ezen a héten nem tanultál.');
    expect(weekSentence(w, true)).toBe('Ezen a héten még nem tanultál.');
  });

  it('a dátum nélküli régi megtanult szó egyik hétbe sem számít új megtanultnak', () => {
    const all = ['2026-09-14', '2026-09-21', '2026-09-28'].map(k => summarizeWeek(appData.japanese, k, 10, TODAY).learned);
    expect(all).toEqual([0, 3, 2]);
  });

  it('JLPT: a heti növekmény és a hét végi állás csak az N5-N3 szavakból', () => {
    const t = jlptWeek(appData.japanese.words, 'words', '2026-09-21', '2026-09-27');
    expect(t.gained).toBe(3);
    expect(t.atEnd).toBe(4);          // + a dátum nélküli régi; az e heti és az N1 nem
    expect(t.target).toBe(3750);
    const now = jlptWeek(appData.japanese.words, 'words', '2026-09-28', '2026-10-04');
    expect(now).toMatchObject({ gained: 1, atEnd: 5 });
  });

  it('a legkorábbi hét az első naplózott vagy megtanult nap hete', () => {
    expect(earliestWeekKey(appData.japanese, TODAY)).toBe('2026-09-21');
    appData.japanese.globalStats.studyDays['2026-09-02'] = true;
    expect(earliestWeekKey(appData.japanese, TODAY)).toBe('2026-08-31');
    expect(earliestWeekKey(createEmptyState(), TODAY)).toBe('2026-09-28');
  });
});

describe('heti összefoglaló: még bizonytalan szavak', () => {
  it('a héten elrontott és azóta nem javított szavak, a legtöbbször elrontott elöl', () => {
    const words = [
      word('kviz-hiba', { totalWrong: 3, streak: 0, lastAttempt: at(2026, 9, 22) }),
      word('kviz-javitva', { totalWrong: 3, streak: 2, lastAttempt: at(2026, 9, 22) }),
      word('masik-het', { totalWrong: 5, streak: 0, lastAttempt: at(2026, 9, 15) }),
      word('ismetles-ujra', { learnedAt: '2026-09-10', srs: { due: '2026-09-25', s: 0.9, d: 6, last: '2026-09-24', reps: 3, lapses: 1 } }),
      word('ismetles-mar-megy', { learnedAt: '2026-09-10', srs: { due: '2026-10-05', s: 12, d: 5, last: '2026-09-24', reps: 4, lapses: 1 } }),
      word('sosem-hibazott', { totalCorrect: 4, streak: 4, lastAttempt: at(2026, 9, 22) })
    ];
    expect(unsureWords(words, '2026-09-21', '2026-09-27').map(w => w.id)).toEqual(['kviz-hiba', 'ismetles-ujra']);
    expect(unsureWords(words, '2026-09-14', '2026-09-20').map(w => w.id)).toEqual(['masik-het']);
  });
});

describe('változás-jelvény', () => {
  const html = s => { const d = document.createElement('div'); d.innerHTML = s; return d; };

  it('az irányt az osztály, a nyíl és az előjel együtt mutatja', () => {
    const up = html(deltaChip(5, '5')).querySelector('.delta');
    const down = html(deltaChip(-41, '41 p')).querySelector('.delta');
    const flat = html(deltaChip(0, 'ugyanannyi')).querySelector('.delta');
    expect([up.className, up.textContent]).toEqual(['delta is-up', '+5']);
    expect([down.className, down.textContent]).toEqual(['delta is-down', '−41 p']);
    expect([flat.className, flat.textContent]).toEqual(['delta is-flat', 'ugyanannyi']);
    // Három különböző nyíl, a képernyőolvasó elől rejtve (az előjel szövegként is ott van)
    const icons = [up, down, flat].map(c => c.querySelector('svg'));
    expect(new Set(icons.map(i => i.innerHTML)).size).toBe(3);
    expect(icons.every(i => i.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('a csempe alsó sorában a jelvény mellett ott a viszonyítási alap', () => {
    const row = html(trendHtml(3, '3 pont', 'előző héten 89%')).querySelector('.kpi-trend');
    expect(row.querySelector('.delta').textContent).toBe('+3 pont');
    expect(row.lastElementChild.textContent).toBe('előző héten 89%');
  });
});

describe('heti összefoglaló: a Kezdőlap sora', () => {
  it('csak akkor látszik, ha a múlt héten volt tanulás, és még nem nézted meg', () => {
    expect(weekHomeRowHtml()).toBe('');
    const gs = appData.japanese.globalStats;
    gs.daily = { '2026-09-22': { a: 12, c: 10, k: 0, g: 0, s: 400 } };
    gs.studyDays = { '2026-09-22': true };
    appData.japanese.words = [word('a', { learnedAt: '2026-09-22' })];
    const html = weekHomeRowHtml();
    expect(html).toContain('Múlt hét');
    expect(html).toContain('<b>1</b> aktív nap');
    expect(html).toContain('showWeekScreen(-1)');
    gs.weekSeen = '2026-09-21';
    expect(weekHomeRowHtml()).toBe('');
  });
});
