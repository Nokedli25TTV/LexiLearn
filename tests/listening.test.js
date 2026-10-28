// Hallás utáni gyakorlás: a szó csak hangként szól, a jelentését kell kiválasztani. Az azonos
// hangzású szavak jelentése nem lehet rossz válasz, a válasz után látszik a hallott szó.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('hallás mód: hangból jelentés, homofón nélküli opciók, pontozott válasz', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;

  // Egy szó, amelynek van azonos hangzású, de más jelentésű párja (pl. でも / デモ, mindkettő „demo”)
  const bySound = new Map();
  ja.words.forEach(w => { const k = (w.romaji || '').toLowerCase().replace(/[^a-z]/g, ''); if (k) bySound.set(k, [...(bySound.get(k) || []), w]); });
  const pair = [...bySound.values()].find(ws => ws.length > 1 && new Set(ws.map(w => w.hu)).size > 1);
  expect(pair).toBeTruthy();
  const [word, twin] = pair;
  Object.assign(word.stats, { learnedAt: undefined, practiceLearnedAt: undefined, srs: undefined, totalCorrect: 4, totalWrong: 0, streak: 4, lastAttempt: null });

  ja.direction = 'hu-en'; // a hallás a beállított iránytól függetlenül hang → jelentés
  ja.practiceOptions = { type: 'listening', count: 'all', order: 'az' };
  ja.selectedIds = new Set([word.id]);
  api.startPractice();
  expect(ja.practice.type).toBe('listening');
  expect(ja.practice.direction).toBe('en-hu');

  let card = doc.getElementById('q-card');
  expect(card.querySelector('.listen-play')).toBeTruthy();
  expect(card.querySelector('.listen-word').textContent).toBe('');  // a szót még nem látod
  const options = [...card.querySelectorAll('.opt-btn')].map(b => b.textContent);
  expect(options).toHaveLength(4);
  expect(options).toContain(word.hu);
  expect(options).not.toContain(twin.hu);                           // a homofón jelentése nem opció
  expect(new Set(options).size).toBe(4);
  // Sok újrasorsolásnál sem kerül elő a homofón jelentése
  for (let i = 0; i < 40; i++) {
    api.showQuestion();
    const opts = [...doc.querySelectorAll('#q-card .opt-btn')].map(b => b.textContent);
    expect(opts).not.toContain(twin.hu);
  }

  card = doc.getElementById('q-card');
  api.checkAnswer(null, word.hu, word.hu);
  expect(word.stats.streak).toBe(5);
  expect(api.isLearnedWord(word)).toBe(true);                       // pontozott mód: az 5. egymás utáni helyes
  expect(card.querySelector('.listen-src').textContent).toBe(word.en);

  // Kandzsi módban nincs hallás (egy kandzsinak több olvasata van): klasszikusra vált
  api.setMode('kanji');
  const kj = win.appData.kanji;
  kj.practiceOptions = { type: 'listening', count: 10, order: 'az' };
  kj.selectedIds = new Set([kj.words[0].id]);
  api.startPractice();
  expect(kj.practice.type).toBe('classic');
});
