// Gépelős mód (magyar → japán): a romajival gépelt válasz élőben kanával látszik.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a Gépelős módban a romaji élőben kanává alakul (katakana szónál katakanává)', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.direction = 'hu-en';
  const ask = async word => {
    ja.practice = { type: 'hardcore', roundNumber: 1, roundWords: [word.id], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
      sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null };
    api.showScreen('practice');
    api.showQuestion();
    await new Promise(r => setTimeout(r, 150)); // a mező 100 ms után kap fókuszt és figyelőt
  };
  const type = text => {
    const input = doc.getElementById('hardcore-input');
    input.value = text;
    input.dispatchEvent(new win.Event('input'));
    return doc.getElementById('kana-preview').textContent;
  };

  await ask(ja.words.find(w => w.en === 'がっこう'));
  expect(type('gakkou')).toBe('がっこう');
  expect(type('がっこう')).toBe('');            // ha már kanával írod, nincs mit mutatni

  await ask(ja.words.find(w => w.en === 'コーヒー'));
  expect(type('koohii')).toBe('コーヒー');

  // Kana → magyar irányban nincs előnézet
  ja.direction = 'en-hu';
  await ask(ja.words.find(w => w.en === 'がっこう'));
  expect(doc.getElementById('kana-preview')).toBeNull();
});
