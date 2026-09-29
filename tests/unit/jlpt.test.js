// JLPT haladás: mérföldkövek, elérési dátumok, rögzült (21+ nap), tempó és előrejelzés.
import { describe, it, expect } from 'vitest';
import { buildMilestones, crossedMilestones, getGoal, paceFor, trackProgress } from '../../js/goal/jlpt.js';

const TODAY = '2026-09-29';
let seq = 0;
const w = (diff, stats = {}) => ({ id: `w${seq++}`, diff, stats: { streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null, ...stats } });
const learned = (diff, date, srs) => w(diff, { learnedAt: date, ...(srs ? { srs } : {}) });

describe('mérföldkövek', () => {
  it('szókincs: N5 100-anként, N4 100-anként, N3 250-enként; kandzsi 25 / 50 / 50', () => {
    const words = buildMilestones('words');
    expect(words).toHaveLength(8 + 7 + 9);
    expect(words.slice(0, 2).map(m => m.n)).toEqual([100, 200]);
    expect(words.filter(m => m.levelEnd).map(m => [m.n, m.level])).toEqual([[800, 'N5'], [1500, 'N4'], [3750, 'N3']]);
    const kanji = buildMilestones('kanji');
    expect(kanji).toHaveLength(4 + 4 + 7);
    expect(kanji.filter(m => m.levelEnd).map(m => m.n)).toEqual([100, 300, 650]);
  });
  it('átlépett mérföldkövek két darabszám között', () => {
    expect(crossedMilestones('words', 95, 105).map(m => m.n)).toEqual([100]);
    expect(crossedMilestones('words', 790, 810).map(m => [m.n, m.levelEnd])).toEqual([[800, true]]);
    expect(crossedMilestones('kanji', 10, 20)).toEqual([]);
  });
});

describe('sáv állapota', () => {
  it('halmozott: minden N5-N3 szó számít, a többi nem; rögzült = 21+ napos köz', () => {
    const words = [
      ...Array.from({ length: 150 }, (_, i) => learned('N5', `2026-09-${String(1 + (i % 28)).padStart(2, '0')}`)),
      learned('N4', '2026-09-29', { last: '2026-09-01', due: '2026-09-25', s: 24, d: 5 }),   // 24 napos köz: rögzült
      learned('N3', '2026-09-29', { last: '2026-07-01', due: '2026-10-05', s: 12, d: 5 }),   // 12 nap: nem (hiába késett)
      learned('N2', '2026-09-29'), w('N5'), w('N4')
    ];
    const t = trackProgress(words, 'words', TODAY);
    expect(t).toMatchObject({ learned: 152, mature: 1, inDictionary: 154, target: 3750 });
    expect(t.perLevel.map(l => [l.level, l.learned, l.inDictionary])).toEqual([['N5', 150, 151], ['N4', 1, 2], ['N3', 1, 1]]);
    const [m100, m200] = t.milestones;
    expect(m100).toMatchObject({ n: 100, done: true, current: false });
    expect(m200).toMatchObject({ n: 200, done: false, current: true, progress: 0.52 });
    expect(t.milestones[2]).toMatchObject({ done: false, current: false, progress: 0 });
  });
  it('a mérföldkő dátuma a k-adik megtanult szó dátuma; ismeretlen dátum ("korábban") elöl', () => {
    const words = [
      ...Array.from({ length: 30 }, () => w('N5', { totalCorrect: 1 })),                 // régi, dátum nélkül
      ...Array.from({ length: 70 }, (_, i) => learned('N5', i < 60 ? '2026-09-10' : '2026-09-20'))
    ];
    const t = trackProgress(words, 'kanji', TODAY);
    expect(t.milestones[0]).toMatchObject({ n: 25, reachedAt: null });
    expect(t.milestones[1]).toMatchObject({ n: 50, reachedAt: '2026-09-10' });
    expect(t.milestones[3]).toMatchObject({ n: 100, reachedAt: '2026-09-20', levelEnd: true });
    expect(t.levelReached).toBe('N5');
  });
});

describe('tempó', () => {
  const track = words => trackProgress(words, 'words', TODAY);
  it('szükséges napi tempó, 14 napos átlag, várható célba érés', () => {
    const words = Array.from({ length: 140 }, (_, i) => learned('N5', i < 70 ? '2026-09-20' : '2026-08-01'));
    const t = track(words);
    const p = paceFor(t, words, '2027-07-04', TODAY);
    expect(p.daysLeft).toBe(278);
    expect(p.remaining).toBe(3750 - 140);
    expect(p.needed).toBe(Math.ceil(3610 / 278));
    expect(p.avg).toBe(5);
    expect(p.projected).toBe('2028-09-20'); // 3610 szó napi 5-tel = 722 nap
    expect(p.onTrack).toBe(false);
  });
  it('nincs friss tanulás: nincs előrejelzés; elmúlt célidőpont: nincs szükséges tempó', () => {
    const words = [learned('N5', '2026-01-01')];
    const p = paceFor(track(words), words, '2026-09-01', TODAY);
    expect(p).toMatchObject({ daysLeft: 0, needed: null, projected: null, onTrack: false });
  });
  it('alapértelmezett cél: N3, 2027. július 4.; a mentett felülírja', () => {
    expect(getGoal({})).toEqual({ level: 'N3', date: '2027-07-04' });
    expect(getGoal({ jlptGoal: { date: '2026-12-06' } })).toEqual({ level: 'N3', date: '2026-12-06' });
  });
});
