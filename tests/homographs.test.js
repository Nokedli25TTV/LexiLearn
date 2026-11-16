// Azonos kana, más szó (homográf, V13.45): ha egy Dekiru-szó kanája egy japanese_words.js /
// jlpt_n3_words.js szóéval egyezik, a lecke jelentése nem vész el (いか = 以下 a 27. leckében, nem
// csak 烏賊 tintahal), és az írásmód sem mond ellent neki. A témakör az adatfájlból jön, így a
// téves címkék a régi mentésből is eltűnnek. A listázó: tools/homographs.mjs.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';
import { findOverlaps } from '../tools/homographs.mjs';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const HOMOGRAPHS = ['いか', 'いがい', 'かい', 'かえる', 'がっき', 'きげん', 'きじ', 'くも', 'しかく', 'たいしょう', 'だい', 'よう'];

it('a homográf a lecke jelentésével és írásmódjával jelenik meg, a régi mentés is helyreáll', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  const byKana = kana => win.appData.japanese.words.find(w => w.en === kana);

  // A lecke jelentése elöl, utána a másik szóé; mindkét írásmód; Dekiru-szó marad
  expect(byKana('いか')).toMatchObject({ hu: 'kevesebb, mint...; vmi alatt; tintahal', kanji: '以下・烏賊', source: 'dekiru', lesson: [27] });
  expect(byKana('だい')).toMatchObject({
    hu: 'állvány, emelvény, talapzat; díj, költség (pl. villanyszámla); korszak, nemzedék', kanji: '台・代', source: 'dekiru', lesson: [25]
  });
  expect(byKana('かい')).toMatchObject({ hu: 'találkozó, összejövetel; emelet', kanji: '会・階', source: 'dekiru', lesson: [27] });
  // Az 1. könyvben is: かえる (5., 16. és 40. lecke) eddig csak „béka” volt, くも (24.) „pók”
  expect(byKana('かえる')).toMatchObject({ hu: 'hazamegy; (pénzt) vált; változtat; béka', kanji: '帰る・替える・変える・蛙', lesson: [5, 16, 40] });
  expect(byKana('くも')).toMatchObject({ hu: 'felhő; pók', kanji: '雲・蜘蛛', lesson: [24] });
  // Ami a leckében már szerepel (cikk = cikk (újságban), hangszer), nem ismétlődik
  expect(byKana('きじ')).toMatchObject({ hu: 'tészta (nyers); cikk', kanji: '生地・記事' });
  expect(byKana('がっき')).toMatchObject({ hu: 'hangszer; félév, szemeszter', kanji: '楽器・学期' });

  // Ugyanaz a szó: az N3 jelentése és írásmódja, mint eddig, de a Statisztika lecke-nézete is számolja
  expect(byKana('もくてき')).toMatchObject({ hu: 'cél (szándék)', kanji: '目的', source: 'dekiru', lesson: [25] });
  // Csak N3-szó: nem változik
  expect(byKana('あきれる')).toMatchObject({ kanji: '呆れる', source: 'data_js' });

  // Tisztított témakörök (az adatfájl az irányadó)
  expect(byKana('いか').tags).toEqual(['alapszavak']);
  expect(byKana('つくりばなし').tags).toEqual(['kommunikáció']);
  expect(byKana('おこのみやき').tags).toEqual(['ételek']);
  expect(byKana('かんしゃする').tags).not.toContain('testrészek');

  // A tanulókártya hátoldala
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const ika = byKana('いか');
  ja.practice = { type: 'learn', queue: [ika.id], batchIds: [ika.id], learnedIds: [], againIds: [] };
  api.showScreen('practice');
  api.showLearnCard();
  const back = win.document.querySelector('.learn-back');
  expect(back.querySelector('.learn-back-src').textContent).toBe('以下・烏賊 · いか · ika');
  expect(back.querySelector('.learn-meaning').textContent).toBe('kevesebb, mint...; vmi alatt; tintahal');
  // Gépelésnél bármelyik írásmód jó
  expect(api.checkJapanese('以下', { kana: 'いか', writing: api.wordWriting(ika) }).ok).toBe(true);

  // A szómagyarázat kapcsolódó szavainál is a lecke jelentése jön elöl (もどる → かえる: hazamegy, nem béka)
  win.openWordInfo(byKana('もどる').id);
  const relKaeru = [...win.document.querySelectorAll('.wi-rel-btn')].find(b => b.querySelector('b')?.textContent === 'かえる');
  expect(relKaeru.querySelector('span').textContent.startsWith('hazamegy')).toBe(true);
  api.closeWordInfo();

  // Régi mentés (V13.44-ig): felülírt jelentés és írásmód, data_js forrás, összeadódott téves címkék.
  // A betöltés helyreállítja, a haladás megmarad, és a második betöltés sem fűz hozzá semmit.
  Object.assign(ika, { hu: 'tintahal', kanji: '烏賊', source: 'data_js', tags: ['ételek', 'állatok', 'alapszavak'] });
  Object.assign(ika.stats, { totalCorrect: 4, learnedAt: '2026-10-01' });
  const kai = byKana('かい');
  Object.assign(kai, { hu: 'emelet; találkozó, összejövetel', tags: ['bolt'] });
  api.syncNewWords();
  api.syncNewWords();
  expect(byKana('いか')).toMatchObject({ hu: 'kevesebb, mint...; vmi alatt; tintahal', kanji: '以下・烏賊', source: 'dekiru', tags: ['alapszavak'] });
  expect(byKana('いか').stats).toMatchObject({ totalCorrect: 4, learnedAt: '2026-10-01' });
  expect(byKana('かい')).toMatchObject({ hu: 'találkozó, összejövetel; emelet', tags: ['kapcsolatok'] });
  expect(win.appData.japanese.words.filter(w => w.en === 'いか')).toHaveLength(1);
});

it('a listázó szkript ismeri a jelölt homográfokat, a többit ugyanannak a szónak vagy gyanúsnak veszi', () => {
  const rows = findOverlaps();
  expect(rows.length).toBeGreaterThan(300);
  expect(rows.filter(r => r.kind === 'homograph').map(r => r.kana).sort()).toEqual([...HOMOGRAPHS].sort());
  expect(rows.find(r => r.kana === 'いか')).toMatchObject({ lessons: [27], lesson: { kanji: '以下' }, other: { kanji: '烏賊', hu: 'tintahal' } });
  expect(rows.find(r => r.kana === 'もくてき').kind).toBe('same');
  // Szinonima: jelöletlen, de gyanús (kézzel átnézendő), nem homográf
  expect(rows.find(r => r.kana === 'ウェイター').kind).toBe('suspect');
});
