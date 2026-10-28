// Mondatépítő: a példamondat csempéit a magyar fordítás alapján kell sorba rakni. A kör
// eredményébe számít, a szó statisztikájába nem (a szórendet gyakorolja).
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('mondatépítő: bontás, helyes és rossz kirakás, visszavétel, statisztika érintetlen', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;

  // Bontás: furiganás csempék, kana szerinti ellenőrzés, a mondatvégi írásjel külön
  const parsed = api.tokenizeSentence({ ttsSentence: 'あした がっこう へ いきます。', fullSentenceHTML: '<ruby>明日<rt>あした</rt></ruby> <ruby>学校<rt>がっこう</rt></ruby> へ いきます。' }, 'japanese');
  expect(parsed.tiles.map(t => t.text)).toEqual(['あした', 'がっこう', 'へ', 'いきます']);
  expect(parsed.tiles[1].html).toBe('<ruby>学校<rt>がっこう</rt></ruby>');
  expect(parsed.tail).toBe('。');
  expect(api.tokenizeSentence({ ttsSentence: 'はい。', fullSentenceHTML: 'はい。' }, 'japanese')).toBeNull(); // túl rövid

  api.setMode('japanese');
  const ja = win.appData.japanese;
  const word = ja.words.find(w => w.en === 'がっこう');
  const before = { ...word.stats };
  ja.practiceOptions = { type: 'sentenceBuild', count: 'all', order: 'az' };
  ja.selectedIds = new Set([word.id]);
  api.startPractice();
  expect(ja.practice.type).toBe('sentenceBuild');

  const poolButtons = () => [...doc.querySelectorAll('#sb-pool .sb-tile')];
  const posOf = btn => Number(btn.getAttribute('onclick').match(/\d+/)[0]);
  const expected = api.tokenizeSentence(ja.practice.currentSentenceObj, 'japanese').tiles;
  expect(poolButtons()).toHaveLength(expected.length);
  expect(poolButtons().map(b => b.innerHTML)).not.toEqual(expected.map(t => t.html)); // tényleg össze van keverve

  // Egy csempe le- és visszarakása: visszakerül a saját helyére
  const first = poolButtons()[0];
  const firstPos = posOf(first), firstHtml = first.innerHTML;
  api.sbPick(firstPos);
  expect(doc.querySelectorAll('#sb-answer .sb-tile')).toHaveLength(1);
  api.sbUnpick(0);
  expect(poolButtons().find(b => posOf(b) === firstPos).innerHTML).toBe(firstHtml);

  // Helyes sorrend
  expected.forEach(t => api.sbPick(posOf(poolButtons().find(b => b.innerHTML === t.html))));
  expect(ja.practice.roundCorrect).toBe(1);
  expect(doc.querySelectorAll('#sb-answer .sb-tile.is-correct')).toHaveLength(expected.length);
  expect(word.stats).toEqual(before); // a szó statisztikája nem változott

  // Rossz sorrend: a következő körbe kerül, a megoldás látszik
  ja.practice.currentIdx = 0;
  api.showQuestion();
  const exp2 = api.tokenizeSentence(ja.practice.currentSentenceObj, 'japanese').tiles;
  [...exp2].reverse().forEach(t => api.sbPick(posOf(poolButtons().find(b => b.innerHTML === t.html))));
  expect(ja.practice.roundWrong).toBe(1);
  expect(ja.practice.errorList).toEqual([word.id]);
  expect(doc.getElementById('sb-solution').hidden).toBe(false);
  expect(word.stats).toEqual(before);

  // Kandzsi módban nincs mondatépítő
  api.setMode('kanji');
  const kj = win.appData.kanji;
  kj.practiceOptions = { type: 'sentenceBuild', count: 10, order: 'az' };
  kj.selectedIds = new Set([kj.words[0].id]);
  api.startPractice();
  expect(kj.practice.type).toBe('classic');
});
