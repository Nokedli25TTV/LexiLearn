// A Gyakorlás fül három pontozott módjában az ötödik helyes válasz
// megtanulttá és ismételhetővé teszi a szót.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('az ötödik helyes klasszikus, gépelős vagy mondatválasz belépteti a szót a haladásba', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const words = ja.words.slice(0, 4);
  const prepare = (word, type) => {
    Object.assign(word.stats, {
      learnedAt: undefined, practiceLearnedAt: undefined, srs: undefined,
      totalCorrect: 4, totalWrong: 0, streak: 4, lastAttempt: null
    });
    ja.practice = {
      type, roundNumber: 1, roundWords: [word.id, words[3].id], currentIdx: 0,
      errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
      roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
    };
  };
  const expectMastered = word => {
    expect(word.stats.totalCorrect).toBe(5);
    expect(word.stats.practiceLearnedAt).toBe('2026-09-29');
    expect(word.stats.srs).toBeDefined();
    expect(api.isLearnedWord(word)).toBe(true);
  };

  api.showScreen('practice');

  prepare(words[0], 'classic');
  api.showQuestion();
  api.checkAnswer(null, words[0].hu, words[0].hu);
  expectMastered(words[0]);

  prepare(words[1], 'hardcore');
  api.showQuestion();
  win.document.getElementById('hardcore-input').value = words[1].hu;
  api.checkHardcoreAnswer(words[1].id);
  expectMastered(words[1]);

  prepare(words[2], 'sentenceFill');
  ja.practice.currentSentenceObj = { correctAnswer: words[2].en, fullSentenceHTML: '', ttsSentence: '' };
  api.checkSentenceAnswer(null, words[2].en);
  expectMastered(words[2]);
});
