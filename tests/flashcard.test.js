// A 3D kártya önértékelése: a hibás lapok a kör végén külön újravehetők,
// miközben a szavankénti kvízpontosság változatlan marad.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

it('a Nem tudtam kártyákat a kör végén új körbe teszi', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const words = ja.words.slice(0, 2);
  words.forEach(w => ja.selectedIds.add(w.id));
  ja.practiceOptions = { type: 'flashcard3d', count: 2, order: 'az' };
  const sessionsBefore = ja.globalStats.totalSessions;
  const historyBefore = ja.globalStats.sessionHistory.length;

  api.startPractice();
  const firstId = ja.practice.roundWords[0];
  const first = ja.words.find(w => w.id === firstId);
  const before = { ...first.stats };

  api.rateFlashcard3D(false);
  await wait(700);
  expect(ja.practice.currentIdx).toBe(1);
  api.rateFlashcard3D(true);
  await wait(700);

  expect({ screen: win.document.body.dataset.screen, currentIdx: ja.practice.currentIdx, length: ja.practice.roundWords.length }).toEqual({ screen: 'roundend', currentIdx: 2, length: 2 });
  expect(ja.practice.errorList).toEqual([firstId]);
  expect(win.document.querySelector('#re-next-label').textContent).toContain('Következő kör · 1 szó');
  expect(first.stats).toEqual(before);

  api.startNextRound();
  expect(ja.practice.roundNumber).toBe(2);
  expect(ja.practice.roundWords).toEqual([firstId]);

  api.rateFlashcard3D(true);
  await wait(700);
  expect(win.document.body.dataset.screen).toBe('roundend');
  expect(ja.practice.errorList).toEqual([]);
  expect(win.document.querySelector('#re-next-btn')).toBeNull();
  expect(ja.globalStats.studyDays['2026-09-29']).toBe(true);
  api.finishSession();
  expect(win.document.body.dataset.screen).toBe('dashboard');
  expect(ja.globalStats.totalSessions).toBe(sessionsBefore);
  expect(ja.globalStats.sessionHistory).toHaveLength(historyBefore);

  // Új menetben a visszalépés visszavonja a lokális körértékelést.
  ja.practiceOptions = { type: 'flashcard3d', count: 2, order: 'az' };
  api.startPractice();
  api.rateFlashcard3D(false);
  await wait(700);
  expect(ja.practice.roundWrong).toBe(1);

  api.prevFlashcard3D();
  expect(ja.practice.roundWrong).toBe(0);
  expect(ja.practice.errorList).toEqual([]);

  api.rateFlashcard3D(true);
  await wait(700);
  expect(ja.practice.roundCorrect).toBe(1);
  expect(ja.practice.roundWrong).toBe(0);
});
