// V13.108–: fordítás-ellenőrzés. A javított jelentés a mentett szóra is kiér (a betöltés a mentett
// jelentéshez fűzi az adatfájlét, ezért a régi rész a MEANING_FIXES nélkül megmaradna), és a lecke
// nélkül maradt Dekiru-szavak a saját leckéjükbe kerülnek.
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { bootApp } from './harness/boot.js';

// V13.110: az angol adat a böngésző nélkül is
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, console: { log() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['data.js', 'english_sentences2.js']) vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const EN = vm.runInContext('SAMPLE_WORDS', ctx);
const EN_SENT = vm.runInContext('english_sentences2', ctx);

it('angol adat: minden szó egyszer szerepel, és minden mondat létező szóhoz tartozik', () => {
  const seen = new Set(); const dupes = [];
  EN.forEach(w => { if (seen.has(w.en)) dupes.push(w.en); seen.add(w.en); });
  expect(dupes).toEqual([]);
  expect(EN_SENT.filter(x => !seen.has(x.baseWord)).map(x => x.baseWord)).toEqual([]);
  // a mondat a szót tartalmazza (az átnevezett szavaké is); a régi, mondat végi [___BLANK___] alak kivétel
  // (elephant trunk, miss the mark: a szó nem szó szerint áll a mondatban)
  expect(EN_SENT.filter(x => !x.sentenceWithBlank.endsWith('[___BLANK___]') && !x.fullSentenceHTML.toLowerCase().includes(String(x.correctAnswer).toLowerCase())).map(x => x.baseWord)).toEqual([]);
});

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
  // V13.110: angol jelentések (az adatfájlból jönnek)
  const en = w => win.appData.english.words.filter(x => x.en === w);
  expect(en('worthy')[0].hu).toBe('méltó, érdemes');
  expect(en('green')[0].hu).toBe('zöld; tapasztalatlan (zöldfülű)');
  for (const w of ['alert', 'celestial', 'emblem', 'corruption', 'orthodox', 'reimbursement', 'spirit medium']) expect(en(w), w).toHaveLength(1);
  expect(en('alert')[0].hu).toBe('riasztás; riaszt; éber');

  // Elírt angol szó: a régi alakú mentett szó haladása és kijelölése az új alakra költözik
  const asm = en('assessment')[0];
  Object.assign(asm, { en: 'assesment', id: 'en_assesment', bookmarked: true });
  Object.assign(asm.stats, { totalCorrect: 4, streak: 2, learnedAt: '2026-10-01' });
  win.appData.english.selectedIds = new Set(['en_assesment']);
  expect(api.migrateRenamedWords()).toBe(true);
  api.syncNewWords();
  expect(en('assesment')).toHaveLength(0);
  expect(en('assessment')).toHaveLength(1);
  expect(en('assessment')[0]).toMatchObject({ id: 'en_assessment', bookmarked: true });
  expect(en('assessment')[0].stats).toMatchObject({ totalCorrect: 4, learnedAt: '2026-10-01' });
  expect([...win.appData.english.selectedIds]).toEqual(['en_assessment']);

  // Egy korábbi friss telepítés mindkét példányt elmentette: egy marad, a haladással
  const alert = en('alert')[0];
  win.appData.english.words.push({ ...alert, stats: { streak: 3, totalCorrect: 5, totalWrong: 0, lastAttempt: 1790000000000 } });
  api.syncNewWords();
  expect(en('alert')).toHaveLength(1);
  expect(en('alert')[0].stats.totalCorrect).toBe(5);

  // Egy régi mentésben lecke nélkül: a betöltés pótolja
  find('けんか').lesson = [];
  api.syncNewWords();
  expect(find('けんか').lesson).toEqual([20]);
});
