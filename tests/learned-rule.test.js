// V13.27: a napi tanulás "Tudom" gombja csak elkezdi a szót (Tanulás alatt). V13.97: ismétlőkártyát sem ad;
// a szó gyakorlásban ötször egymás után eltalálva lesz megtanult, és csak ekkor kerül az ismétlésbe. A régi
// "Tudom"-kártyák a még meg nem tanult szavakról lekerülnek; a régi, már megtanult szavak nem esnek vissza.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TODAY = '2026-09-29';

it('a Tudom csak elkezdi a szót, ismétlésbe csak az öt egymás utáni gyakorlótalálat után kerül', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  win.appData.japanese.globalStats.reverseSeeded = { day: TODAY, n: 99 }; // fordított kártya nélkül
  const doc = win.document;
  const ja = win.appData.japanese;
  ja.globalStats.dailyGoal = 500;

  // Korábban (két ismétléssel) megtanult szó a kártyájával: a szabály nem érinti
  const old = ja.words.find(w => !w.lesson);
  old.stats.learnedAt = '2026-09-01';
  old.stats.srs = { due: '2026-10-05', s: 6, d: 5, last: '2026-09-28', reps: 2, lapses: 0 };
  expect(api.isLearnedWord(old)).toBe(true);
  expect(api.isLearningWord(old)).toBe(false);

  // Tudom: elkezdve, a napi penzumba számít, de nincs kártyája és nem megtanult
  win.startLearnSession();
  const word = ja.words.find(w => w.id === ja.practice.queue[0]);
  win.learnSwipe('right');
  await wait(300);
  expect(word.stats.introducedAt).toBe(TODAY);
  expect(word.stats.learnedAt).toBeUndefined();
  expect(word.stats.srs).toBeUndefined();
  expect(api.isLearnedWord(word)).toBe(false);
  expect(api.isLearningWord(word)).toBe(true);
  expect(api.getTodayWords().map(w => w.id)).toContain(word.id);
  expect(api.getNewWordPool().map(w => w.id)).not.toContain(word.id); // nem jön újra új szóként

  // A Gyakorlás Állapot szűrője külön mutatja
  expect(api.getStatusCounts().learning).toBe(1);
  api.setStatusFilter('learning');
  expect(ja.words.filter(w => api.wordMatchesFilters(w)).map(w => w.id)).toEqual([word.id]);
  api.setStatusFilter('all');

  // A tanulás vége kimondja a szabályt; a "Még nem" után tudott szó sem kap kártyát
  win.learnSwipe('left');
  await wait(300);
  for (let i = 0; i < 12 && ja.practice.queue.length; i++) { win.learnSwipe('right'); await wait(300); }
  expect(doc.querySelector('.learn-done-title').textContent).toContain('elkezdve');
  expect(doc.getElementById('question-area').textContent).toContain('Tanulás alatt vannak');
  expect(doc.getElementById('question-area').textContent).toContain('csak utána kerülnek az ismétlésbe');
  const started = ja.words.filter(w => w.stats.introducedAt === TODAY);
  expect(started.length).toBeGreaterThan(1);
  expect(started.filter(w => w.stats.srs)).toEqual([]);

  // Évek múlva sincs esedékes kártyája: az ismétlésben csak a megtanult szó van
  expect(api.getDueCards(ja.words, '2030-01-01').map(c => c.word.id)).toEqual([old.id]);

  // A régi verzióban a Tudom-mal kapott kártya betöltéskor (és szinkron után) lekerül
  const legacy = started[1];
  legacy.stats.srs = { due: '2026-10-02', s: 3, d: 5, last: TODAY, reps: 1, lapses: 0 };
  legacy.stats.reviewPasses = 1;
  win.seedSrsAll();
  expect(legacy.stats.srs).toBeUndefined();
  expect(legacy.stats.reviewPasses).toBeUndefined();
  expect(old.stats.srs.due).toBe('2026-10-05');

  // Gyakorlás: az ötödik egymás utáni helyes válasz teszi megtanulttá, és ekkor kap kártyát
  Object.assign(word.stats, { totalCorrect: 4, totalWrong: 0, streak: 4, lastAttempt: null });
  ja.practice = {
    type: 'classic', roundNumber: 1, roundWords: [word.id, legacy.id], currentIdx: 0,
    errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
  };
  api.showScreen('practice');
  api.showQuestion();
  api.checkAnswer(null, word.hu, word.hu);
  expect(api.isLearnedWord(word)).toBe(true);
  expect(word.stats.practiceLearnedAt).toBe(TODAY);
  expect(word.stats.srs.due).toBe('2026-10-02');
  expect(api.getDueCards(ja.words, '2026-10-02').map(c => c.word.id)).toContain(word.id);
  // a napi penzumba továbbra is az elkezdés napja számít
  expect(api.getTodayWords().map(w => w.id)).toContain(word.id);
  await wait(600);
});
