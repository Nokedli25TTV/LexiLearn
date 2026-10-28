// Kandzsi ↔ szó: a japán szó kártyáján a benne lévő kandzsik, a kandzsi kártyáján a szavai.
// Az írásmód a szó saját mezőjéből vagy a saját példamondatainak ruby-jából jön, de csak ha egyértelmű.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('írásmód, kandzsik a szóban, szavak a kandzsival, és a tanulókártya hátoldala', async () => {
  const { api, win } = await bootApp();
  const ja = win.appData.japanese.words;
  const byKana = kana => ja.find(w => w.en === kana);

  // Dekiru-szó: a saját példamondatából (なまえ → 名前); N3-szó: a saját mezőjéből
  expect(api.wordWriting(byKana('なまえ'))).toBe('名前');
  const n3 = ja.find(w => w.kanji === '届く');
  expect(api.wordWriting(n3)).toBe('届く');
  // Kétféle alakban is előforduló (はな: 花 / 鼻) szónál inkább nincs írásmód, mint rossz
  expect(api.wordWriting(byKana('はな'))).toBe('');
  // Ami csak más mondatokból következne (わたし → 渡し téves lenne), azt nem találgatjuk
  expect(api.wordWriting(byKana('わたし'))).toBe('');

  const nameLinks = api.kanjiLinksHtml(byKana('なまえ'), 'japanese');
  expect(nameLinks).toContain('<b lang="ja">名</b>');
  expect(nameLinks).toContain('<b lang="ja">前</b>');
  expect(api.kanjiLinksHtml(byKana('わたし'), 'japanese')).toBe('');

  // A kandzsi szavai: a már megtanult elöl
  const eki = api.wordsWithKanji('駅');
  expect(eki.length).toBeGreaterThan(0);
  expect(eki.every(x => x.writing.includes('駅'))).toBe(true);
  const later = eki[eki.length - 1].w;
  later.stats.learnedAt = '2026-09-01';
  expect(api.wordsWithKanji('駅')[0].w).toBe(later);

  // A tanulókártya hátoldalán megjelenik
  api.setMode('japanese');
  const ws = win.appData.japanese;
  ws.practice = { type: 'learn', queue: [byKana('なまえ').id], batchIds: [byKana('なまえ').id], learnedIds: [], againIds: [] };
  api.showScreen('practice');
  api.showLearnCard();
  const back = win.document.querySelector('.learn-back');
  expect(back.querySelector('.learn-back-src').textContent).toContain('名前');
  expect(back.querySelectorAll('.kanji-links .kl-item')).toHaveLength(2);
});
