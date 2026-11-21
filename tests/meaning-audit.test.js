// V13.108–: fordítás-ellenőrzés. A javított jelentés a mentett szóra is kiér (a betöltés a mentett
// jelentéshez fűzi az adatfájlét, ezért a régi rész a MEANING_FIXES nélkül megmaradna), és a lecke
// nélkül maradt Dekiru-szavak a saját leckéjükbe kerülnek.
import { it, expect } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(check, ms = 8000) {
  for (let t = 0; t < ms; t += 25) { if (await check()) return; await wait(25); }
  throw new Error('Időtúllépés: ' + check);
}

// Mentett (régi) jelentés → amit a betöltés után mutatni kell
const SAVED = {
  'ひつじ': ['bárány', 'juh, birka'],
  'かれ': ['ő (férfi); barát', 'ő (férfi); (fiú)barát'],
  'かっこいい': ['jól néz ki, aranyos', 'jól néz ki, menő'],
  'はやい': ['gyors; korai / gyors', 'gyors; korai'],
  'エアコン': ['légkondicionáló; légkondicionáló készülék', 'légkondicionáló'],
  'トルコ': ['Törökország; Törökország, török', 'Törökország; török'],
  'たてなおす': ['átépít, ujjáépít', 'átépít, újjáépít'],
  'ライブ': ['live, élő (koncert)', 'élő koncert, élő fellépés'],
  '~さい': ['- éves', '...éves'],
  '(お)としより': ['idős', 'idős ember'],
  'かし': ['édesség/sütemény', 'édesség/sütemény'],
  // V13.109 (alapszótár, N3): ezek az adatfájlból jönnek; a Dekiru-szónál is az N3 jelentése látszik
  'うけつけ': ['recepciós', 'recepció / ügyfélfogadás'],
  'キーボックス': ['kulcsszéf / lockbox', 'kulcsszéf / kulcsdoboz'],
  'ICカード': ['IC kártya (Suica)', 'IC-kártya (Suica)'],
  'えらい': ['nagyszerű, tiszteletre méltó', 'nagyszerű, tiszteletre méltó; magas rangú'],
  'わかれる': ['elválik, szakít', 'elválik, szakít; elbúcsúzik'],
};

it('a javított jelentés a mentett szóban is felváltja a régit, és nem ismétlődik', async () => {
  const { api, win } = await bootApp();
  await until(() => win.appData.japanese.words.length > 0);
  const find = en => win.appData.japanese.words.find(w => w.en === en);
  for (const [kana, [, shown]] of Object.entries(SAVED)) expect(find(kana).hu, kana).toBe(shown);

  for (const [kana, [saved]] of Object.entries(SAVED)) find(kana).hu = saved;
  api.syncNewWords();
  for (const [kana, [, shown]] of Object.entries(SAVED)) expect(find(kana).hu, kana).toBe(shown);

  // A lecke nélkül maradt két szó a saját leckéjében (eddig egyik lecke szűrőjében sem volt)
  expect(find('でんしじしょ')).toMatchObject({ lesson: [2], source: 'dekiru' });
  expect(find('けんか')).toMatchObject({ lesson: [20], source: 'dekiru' });
  // Egy régi mentésben lecke nélkül: a betöltés pótolja
  find('けんか').lesson = [];
  api.syncNewWords();
  expect(find('けんか').lesson).toEqual([20]);
});
