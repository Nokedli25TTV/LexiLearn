// V13.27: a napi tanulás "Tudom" gombja csak elkezdi a szót (Tanulás alatt). Megtanult két egymás
// utáni sikeres ismétlés után lesz; a régi, már megtanult szavak nem esnek vissza.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TODAY = '2026-09-29';

it('a Tudom csak elkezdi a szót, két sikeres ismétlés teszi megtanulttá', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;
  ja.globalStats.dailyGoal = 500;

  // Korábban megtanult szó: a szabály nem érinti
  const old = ja.words.find(w => !w.lesson);
  old.stats.learnedAt = '2026-09-01';
  expect(api.isLearnedWord(old)).toBe(true);
  expect(api.isLearningWord(old)).toBe(false);

  // Tudom: elkezdve, kártyával, a napi penzumba számít, de még nem megtanult
  win.startLearnSession();
  const word = ja.words.find(w => w.id === ja.practice.queue[0]);
  win.learnSwipe('right');
  await wait(300);
  expect(word.stats.introducedAt).toBe(TODAY);
  expect(word.stats.learnedAt).toBeUndefined();
  expect(word.stats.srs.due).toBe('2026-10-02');
  expect(api.isLearnedWord(word)).toBe(false);
  expect(api.isLearningWord(word)).toBe(true);
  expect(api.getTodayWords().map(w => w.id)).toContain(word.id);
  expect(api.getNewWordPool().map(w => w.id)).not.toContain(word.id); // nem jön újra új szóként

  // A Gyakorlás Állapot szűrője külön mutatja
  expect(api.getStatusCounts().learning).toBe(1);
  api.setStatusFilter('learning');
  expect(ja.words.filter(w => api.wordMatchesFilters(w)).map(w => w.id)).toEqual([word.id]);
  api.setStatusFilter('new');
  expect(ja.words.filter(w => api.wordMatchesFilters(w)).map(w => w.id)).not.toContain(word.id);
  api.setStatusFilter('all');

  // A tanulás vége kimondja a szabályt
  for (let i = 0; i < 10 && ja.practice.queue.length; i++) { win.learnSwipe('right'); await wait(300); }
  expect(doc.querySelector('.learn-done-title').textContent).toContain('elkezdve');
  expect(doc.getElementById('question-area').textContent).toContain('Két sikeres ismétlés után');
  const started = api.getTodayWords().length;

  // Ismétlés: csak a kért szó esedékes
  const startDue = () => { word.stats.srs.due = TODAY; win.startReviewSession(); };
  const answer = async rating => { win.flipReviewCard(); win.rateReview(rating); await wait(300); };

  startDue();
  expect(ja.practice.queue).toEqual([word.id]);
  await answer(3); // Jó: 1 a 2-ből
  expect(word.stats.reviewPasses).toBe(1);
  expect(api.isLearnedWord(word)).toBe(false);

  startDue();
  await answer(2); // a Nehéz nem számít, de nem is nulláz
  expect(word.stats.reviewPasses).toBe(1);

  startDue();
  await answer(1); // az Újra elölről indítja, és még ma visszajön
  expect(word.stats.reviewPasses).toBe(0);
  await answer(3);
  expect(word.stats.reviewPasses).toBe(1);
  expect(api.isLearnedWord(word)).toBe(false);

  startDue();
  await answer(4); // a Könnyű is sikeres ismétlés
  expect(word.stats.learnedAt).toBe(TODAY);
  expect(api.isLearnedWord(word)).toBe(true);
  const done = doc.getElementById('question-area').textContent;
  expect(done).toContain('1 új megtanult szó');
  expect(done).toContain(word.en);

  // A megtanulás nem számít új szónak a mai penzumban
  expect(api.getTodayWords().length).toBe(started);
  const before = word.stats.reviewPasses;
  startDue();
  await answer(1); // megtanult szó hibája nem veszi ki a megtanultak közül
  expect(api.isLearnedWord(word)).toBe(true);
  expect(word.stats.reviewPasses).toBe(before);
});
