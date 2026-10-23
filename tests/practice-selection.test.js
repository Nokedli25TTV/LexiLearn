// A „Még nem tanult” szűrővel kijelölt szavakból a gyakorlás közben megtanult szó
// kikerül a kijelölésből, így a dokk számlálója a valós számot mutatja.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a megtanult szó csak a „Még nem tanult” szűrő mellett kerül ki a kijelölésből', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const [word, other, third] = ja.words.slice(0, 3);
  const practiceOnce = (w, status) => {
    [w, other].forEach(x => Object.assign(x.stats, {
      learnedAt: undefined, practiceLearnedAt: undefined, srs: undefined,
      totalCorrect: 4, totalWrong: 0, streak: 4, lastAttempt: null
    }));
    ja.filters.status = status;
    ja.selectedIds = new Set([w.id, other.id]);
    ja.practice = {
      type: 'classic', roundNumber: 1, roundWords: [w.id, other.id], currentIdx: 0,
      errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
      roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
    };
    api.showScreen('practice');
    api.showQuestion();
    api.checkAnswer(null, w.hu, w.hu);
    expect(api.isLearnedWord(w)).toBe(true);
  };

  practiceOnce(word, 'new');
  expect([...ja.selectedIds]).toEqual([other.id]);
  api.showScreen('dashboard');
  expect(win.document.getElementById('selected-count-big').textContent).toBe('1');

  // Szűrő nélkül a szó a listában marad, így a kijelölése is megmarad
  practiceOnce(third, 'all');
  expect(ja.selectedIds.has(third.id)).toBe(true);
});
