// A Gyakorlás fülön a szó az ötödik EGYMÁS UTÁNI helyes válasznál lesz megtanult: egy hiba
// újraindítja a számolást, a hibás szavak következő körében adott helyes válasz pedig számít.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('egy hiba újraindítja az 5-ös számolást, a következő kör helyes válasza előrevisz', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const word = ja.words[0];
  Object.assign(word.stats, {
    learnedAt: undefined, practiceLearnedAt: undefined, practiceLearnedLegacy: undefined, srs: undefined,
    totalCorrect: 3, totalWrong: 0, streak: 3, lastAttempt: null
  });
  ja.practice = {
    type: 'classic', roundNumber: 1, roundWords: [word.id], currentIdx: 0,
    errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
  };
  const answer = ok => {
    ja.practice.currentIdx = 0;
    api.showQuestion();
    api.checkAnswer(null, ok ? word.hu : '__rossz__', word.hu);
  };
  api.showScreen('practice');

  // 3 helyes után a 4. hibás: a sorozat nullázódik, összesen 3 helyes marad
  answer(false);
  expect(word.stats).toMatchObject({ streak: 0, totalCorrect: 3, totalWrong: 1 });
  expect(ja.practice.errorList).toEqual([word.id]);

  // A hibás szavak következő körében adott helyes válasz helyesnek számít (1/5)
  api.startNextRound();
  expect(ja.practice.roundWords).toEqual([word.id]);
  api.checkAnswer(null, word.hu, word.hu);
  expect(word.stats).toMatchObject({ streak: 1, totalCorrect: 4 });
  expect(api.isLearnedWord(word)).toBe(false);

  // Összesen már 5+ helyes, de egymás után csak a 4. – még nem megtanult
  answer(true); answer(true); answer(true);
  expect(word.stats).toMatchObject({ streak: 4, totalCorrect: 7 });
  expect(api.isLearnedWord(word)).toBe(false);

  answer(true);
  expect(word.stats.streak).toBe(5);
  expect(word.stats.practiceLearnedAt).toBe('2026-09-29');
  expect(api.isLearnedWord(word)).toBe(true);

  // Megtanult után egy hiba már nem veszi ki a megtanultak közül
  answer(false);
  expect(word.stats.streak).toBe(0);
  expect(api.isLearnedWord(word)).toBe(true);
});
