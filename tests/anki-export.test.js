// Anki export: a kijelölt szavak tabulátorral tagolt Anki-importfájlként (fejlécsorok, HTML, címkék).
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('Anki export: japán szó írásmóddal, romajival, címkékkel; mezőtisztítás', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const name = ja.words.find(w => w.en === 'なまえ');
  const out = api.buildAnkiExport([name, { en: 'a\tb', hu: 'x\ny <z>', diff: 'N5', lesson: [], tags: ['két szó'] }], 'japanese');
  const lines = out.trimEnd().split('\n');
  expect(lines.slice(0, 3)).toEqual(['#separator:tab', '#html:true', '#tags column:3']);
  const [front, back, tags] = lines[3].split('\t');
  expect(front).toBe('名前<br>なまえ');
  expect(back).toBe('név<br>namae');
  expect(tags.split(' ')).toEqual(expect.arrayContaining(['LexiLearn', 'LexiLearn::japanese', 'N5', 'Dekiru_1']));
  const odd = lines[4].split('\t');
  expect(odd).toHaveLength(3);                       // a tabulátor és a sortörés nem töri szét a sort
  expect(odd[0]).toBe('a b');
  expect(odd[1]).toBe('x y &lt;z&gt;');
  expect(odd[2]).toContain('két_szó');

  // Kandzsi: hátul az olvasatok
  const kj = win.appData.kanji.words.find(w => w.en === '駅');
  expect(api.buildAnkiExport([kj], 'kanji').split('\n')[3].split('\t')[1]).toContain('On: エキ');

  // A Lista menü alján a gomb a kijelöléstől függ
  api.showScreen('dashboard');
  ja.selectedIds = new Set();
  api.toggleFilterMenu('list');
  expect(win.document.querySelector('.menu-anki').disabled).toBe(true);
  ja.selectedIds = new Set([name.id]);
  api.renderFilterMenu();
  expect(win.document.querySelector('.menu-anki').textContent).toContain('1 kijelölt szó exportálása Ankiba');
});
