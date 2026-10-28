// Megtanult szó visszajelzése: a kártyán azonnal jelvény, a kör végén lista, az előzményekben
// a szavak, és a statisztika gyakorlásból megtanult listája dátummal, a legfrissebb elöl.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a gyakorlásban megtanult szavak láthatók a kártyán, a kör végén és a statisztikában', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const [word, other, older] = ja.words.slice(0, 3);
  const reset = (w, streak) => Object.assign(w.stats, { learnedAt: undefined, practiceLearnedAt: undefined, practiceLearnedLegacy: undefined, srs: undefined, totalCorrect: streak, totalWrong: 0, streak, lastAttempt: null });
  reset(word, 4); reset(other, 1);
  reset(older, 6); older.stats.practiceLearnedAt = '2026-09-01';
  ja.practice = {
    type: 'classic', roundNumber: 1, roundWords: [word.id, other.id], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null, origin: 'dashboard'
  };
  ja.globalStats.sessionHistory = [];
  api.showScreen('practice');

  // Az 5. egymás utáni helyes: jelvény a kártyán
  api.showQuestion();
  api.checkAnswer(null, word.hu, word.hu);
  expect(doc.querySelector('#q-card .learned-badge').textContent).toContain('Megtanult szó');
  expect(ja.practice.learnedNow).toEqual([word.id]);

  // Ami még nem érte el az 5-öt, annál nincs jelvény
  ja.practice.currentIdx = 1;
  api.showQuestion();
  api.checkAnswer(null, other.hu, other.hu);
  expect(doc.querySelector('#q-card .learned-badge')).toBeNull();

  // Kör vége: a megtanult szavak listája
  api.showRoundEnd();
  const sec = doc.getElementById('learned-section');
  expect(sec.hidden).toBe(false);
  expect(doc.getElementById('learned-title').textContent).toBe('1 új megtanult szó');
  expect(sec.querySelector('.re-err-word').textContent).toBe(word.en);

  // Befejezés: az előzménybe is bekerül, a statisztika kiírja
  api.finishSession();
  expect(ja.globalStats.sessionHistory.at(-1).learned).toEqual([word.id]);
  api.renderStats();
  expect(doc.getElementById('history-list').textContent).toContain(`+1 megtanult: ${word.en}`);

  // A gyakorlásból megtanultak listája: dátummal, a legfrissebb elöl
  api.openWordInspector('practice');
  const rows = [...doc.querySelectorAll('#learning-inspector-body .inspect-word-row')];
  expect(rows[0].textContent).toContain(word.en);
  expect(rows[0].textContent).toContain('Gyakorlás ·');
  expect(rows.findIndex(r => r.textContent.includes(older.en))).toBeGreaterThan(0);

  // Új kör üres lappal: nincs korábbi megtanult lista
  ja.practice = { ...ja.practice, learnedNow: undefined, errorList: [], roundWords: [other.id], currentIdx: 0 };
  api.showRoundEnd();
  expect(doc.getElementById('learned-section').hidden).toBe(true);
});
