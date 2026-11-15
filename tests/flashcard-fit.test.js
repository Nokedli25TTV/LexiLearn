// V13.34: a 3D kártya főszövege a hosszával kisebb (is-long / is-very-long), hogy a hosszú magyar
// jelentés ne lógjon rá a sarokjelölőre és az "i" gombra. A lap tartalma egy .fc-body-ban van
// (auto margós középre zárás, túl hosszúnál görgethető); a sarokelemek kívül, abszolút helyen.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = ms => new Promise(r => setTimeout(r, ms));
const LONG_HU = 'van, létezik (élőlény); szükség van (vmire)';

it('a 3D kártya főszövege a hosszával kisebb, a tartalom a .fc-body-ban', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  const doc = win.document;

  // Küszöbök: latin írásnál 16 / 30 karakter, kanánál (szóhatár nélkül) 8 / 10
  expect(api.fcMainSizeClass('macska')).toBe('');
  expect(api.fcMainSizeClass('van, létezik (élőlény)')).toBe('is-long');
  expect(api.fcMainSizeClass(LONG_HU)).toBe('is-very-long');
  expect(api.fcMainSizeClass('えいぎょうちゅう')).toBe('');
  expect(api.fcMainSizeClass('きゅうきゅうしゃ')).toBe('');
  expect(api.fcMainSizeClass('かいしゃいんです')).toBe('');
  expect(api.fcMainSizeClass('しょうがくせいたち')).toBe('is-long');
  expect(api.fcMainSizeClass('ソフトウェアかいはつしゃ')).toBe('is-very-long');
  expect(api.fcMainSizeClass('')).toBe('');

  const show = (mode, word, dir) => {
    const m = win.appData[mode];
    m.direction = dir;
    m.practice = {
      type: 'flashcard3d', roundNumber: 1, roundWords: [word.id], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
      sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null, flashcardHistory: []
    };
    api.showQuestion();
    const card = doc.getElementById('flashcard-3d');
    const cls = sel => [...card.querySelector(sel).classList].filter(c => c !== 'fc-main' && c !== 'fc-main-back').sort();
    return { card, front: cls('.flashcard-3d-front .fc-main'), back: cls('.flashcard-3d-back .fc-main') };
  };

  api.setMode('japanese');
  const ja = win.appData.japanese;
  const iru = ja.words.find(w => w.en === 'いる');
  iru.hu = LONG_HU;

  // japán → magyar: a hátoldal hosszú, az előlap (kana) marad nagy
  let r = show('japanese', iru, 'en-hu');
  expect(r.front).toEqual([]);
  expect(r.back).toEqual(['is-very-long']);

  // A szerkezet: tartalom a .fc-body-ban, a sarokelemek a lap közvetlen gyerekei
  const back = r.card.querySelector('.flashcard-3d-back');
  const front = r.card.querySelector('.flashcard-3d-front');
  expect(back.querySelector(':scope > .fc-body > .fc-main')).not.toBeNull();
  expect(back.querySelector(':scope > .fc-body > .fc-example, :scope > .fc-body > .fc-no-example')).not.toBeNull();
  expect(back.querySelector(':scope > .info-btn')).not.toBeNull();
  expect(back.querySelector(':scope > .fc-corner-hint')).not.toBeNull();
  expect(back.querySelector('.fc-body .info-btn, .fc-body .fc-corner-hint')).toBeNull();
  expect(front.querySelector(':scope > .fc-body > .fc-main')).not.toBeNull();
  expect(front.querySelector(':scope > .fc-bottom-hint')).not.toBeNull();
  expect(front.querySelector(':scope > .fc-corner-hint')).not.toBeNull();

  // magyar → japán: az előlap hosszú, a hátoldal (kana) marad nagy
  r = show('japanese', iru, 'hu-en');
  expect(r.front).toEqual(['is-very-long']);
  expect(r.back).toEqual([]);

  iru.hu = 'van, létezik (élőlény)';
  expect(show('japanese', iru, 'hu-en').front).toEqual(['is-long']);
  iru.hu = 'van';
  expect(show('japanese', iru, 'hu-en').front).toEqual([]);

  // Kandzsi módban a kandzsi oldal kanji-display marad, méretosztály nélkül
  api.setMode('kanji');
  const kanji = win.appData.kanji.words[0];
  kanji.hu = LONG_HU;
  r = show('kanji', kanji, 'en-hu');
  expect(r.front).toEqual(['kanji-display']);
  expect(r.back).toEqual(['is-very-long']);
  r = show('kanji', kanji, 'hu-en');
  expect(r.front).toEqual(['is-very-long']);
  expect(r.back).toEqual(['kanji-display']);

  // A stílus ugyanezeket az osztályneveket használja (asztali és mobil méret is)
  const css = readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  expect(css.match(/\.fc-main\.is-long\s*\{/g)).toHaveLength(2);
  expect(css.match(/\.fc-main\.is-very-long\s*\{/g)).toHaveLength(2);
  expect(css).toMatch(/\.fc-body\s*\{[^}]*margin-block:\s*auto/);
});
