// V13.27: a gyakorlásban megtanult szó is visszajön. Az ötödik egymás utáni találat Jó értékeléssel
// kártyát ad, a kör végén Nehéz / Jó / Könnyű átállítja; a régi szavak napi legfeljebb 5-tel jönnek.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TODAY = '2026-09-29';

it('az ötödik találat kártyát ad, ami a kör végén átállítható, a régi szavak napi adagban jönnek', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;
  const reset = (w, streak, extra = {}) => Object.assign(w.stats, {
    learnedAt: undefined, introducedAt: undefined, practiceLearnedAt: undefined, practiceLearnedLegacy: undefined,
    srs: undefined, srsSuspended: undefined, totalCorrect: streak, totalWrong: 0, streak, lastAttempt: null
  }, extra);

  const [fresh, started, paused, other] = ja.words.slice(0, 4);
  const startedCard = { due: '2026-10-05', s: 8, d: 5, last: '2026-09-25', reps: 1, lapses: 0 };
  reset(fresh, 4);
  reset(started, 4, { introducedAt: '2026-09-25', srs: { ...startedCard } }); // már van kártyája
  reset(paused, 4, { srsSuspended: true });                                    // kézzel szüneteltetett
  reset(other, 1);

  ja.practice = {
    type: 'classic', roundNumber: 1, roundWords: [fresh.id, started.id, paused.id, other.id], currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(),
    sessionStartTime: Date.now(), currentSentenceObj: null, origin: 'dashboard'
  };
  api.showScreen('practice');
  [fresh, started, paused].forEach((w, i) => {
    ja.practice.currentIdx = i;
    api.showQuestion();
    api.checkAnswer(null, w.hu, w.hu);
  });

  // Az új kártya azonnal létrejön (kilépéskor sem vész el), a meglévőhöz nem nyúl
  expect(fresh.stats.practiceLearnedAt).toBe(TODAY);
  expect(fresh.stats.srs.due).toBe('2026-10-02');
  expect(started.stats.srs).toEqual(startedCard);
  expect(paused.stats.srs).toBeUndefined();
  expect(paused.stats.srsSuspended).toBe(true);
  expect(ja.practice.ratableIds).toEqual([fresh.id]);

  // Kör vége: mind a három megtanult, de csak az új kártya értékelhető, alapból Jó
  api.showRoundEnd();
  const list = doc.getElementById('learned-list-items');
  expect(list.querySelectorAll('.re-learned-item')).toHaveLength(3);
  expect(list.querySelectorAll('.re-rate')).toHaveLength(1);
  const buttons = () => [...list.querySelectorAll('.re-rate-btn')];
  const pressed = () => buttons().filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.querySelector('.rate-label').textContent);
  expect(buttons().map(b => [...b.children].map(c => c.textContent).join(' '))).toEqual(['Nehéz 1 n', 'Jó 3 n', 'Könnyű 16 n']);
  expect(pressed()).toEqual(['Jó']);
  expect(doc.getElementById('learned-sub').textContent).toContain('3 nap múlva');

  win.setLearnedRating(fresh.id, 4);
  expect(fresh.stats.srs.due).toBe('2026-10-15');
  expect(pressed()).toEqual(['Könnyű']);
  win.setLearnedRating(fresh.id, 2);
  expect(fresh.stats.srs.due).toBe('2026-09-30');
  expect(pressed()).toEqual(['Nehéz']);

  // Csak a kör saját, új kártyája állítható át
  win.setLearnedRating(started.id, 4);
  expect(started.stats.srs).toEqual(startedCard);

  // Újrarajzoláskor (következő kör vége) a választás megmarad, és a hiba holnapra hozza a szót
  api.showRoundEnd();
  expect(pressed()).toEqual(['Nehéz']);
  win.setLearnedRating(fresh.id, 4);
  api.practiceLapse(fresh);
  expect(fresh.stats.srs.due).toBe('2026-09-30');

  // Az ismétlés sorába is bekerül, pedig nincs learnedAt mezője
  fresh.stats.srs.due = TODAY;
  expect(api.getDueWords(ja.words).map(w => w.id)).toContain(fresh.id);

  // A régi, kártya nélküli gyakorlásból megtanult szavak: napi legfeljebb 5
  const old = ja.words.slice(10, 22);
  old.forEach(w => reset(w, 6, { practiceLearnedAt: '2026-09-01', lastAttempt: new Date(2026, 8, 1).getTime() }));
  expect(win.seedSrsAll()).toBe(12);
  const perDay = {};
  old.forEach(w => { perDay[w.stats.srs.due] = (perDay[w.stats.srs.due] || 0) + 1; });
  expect(perDay).toEqual({ '2026-09-29': 5, '2026-09-30': 5, '2026-10-01': 2 });
  expect(win.seedSrsAll()).toBe(0);
  expect(paused.stats.srs).toBeUndefined(); // a szüneteltetett kártya nem jön vissza magától

  // A szüneteltetett, gyakorlásból megtanult szó visszaállítható
  expect(api.isPracticeLearned(paused)).toBe(true);
  api.restoreReviewWord(paused.id);
  expect(paused.stats.srs).toBeDefined();
});
