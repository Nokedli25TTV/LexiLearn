// V13.26: a Kandzsi mód a radikál-haladáshoz igazodik: szintenként előre jönnek a kandzsik, amelyeknek minden
// radikálját tudod; a Kezdőlap sora mutatja, hány kész és mennyit nyit meg a következő radikál-lecke; a radikál
// tanulás végén az új kandzsik; a kandzsi kártyáján a tudott radikálok pipát kapnak.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const LEVEL = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

it('kész kandzsik előre, Kezdőlap sor, tanulás végi jelzés, tudott radikálok', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  const lessons = win.LEXI_DATA.radicalLessons;
  const rad = win.appData.radicals, kan = win.appData.kanji;
  const learn = (chars, day = '2026-09-28') => [...chars].forEach(ch => { rad.words.find(w => w.en === ch).stats.learnedAt = day; });

  // Névelő a sorszám elé
  expect([1, 2, 5, 11, 15, 50, 100, 1000].map(api.az)).toEqual(['az', 'a', 'az', 'a', 'a', 'az', 'a', 'az']);

  // A felbontás: 休 = 人 + 木; felbontás nélküli kandzsi (西) nem vár radikálra
  expect(api.missingRadicals('休', new Set(['人']))).toEqual(['木']);
  expect(api.isKanjiReady('休', new Set(['人', '木']))).toBe(true);
  expect(api.isKanjiReady('西', new Set())).toBe(true);

  // Radikálok nélkül marad a lecke-sorrend, és a Kezdőlap az első radikál-leckét ajánlja
  api.setMode('kanji');
  const before = api.getNewWordPool().map(w => w.en);
  expect(api.describePoolSource()).toMatch(/^Kanji \d+\. lecke · sorrendben$/);
  const status0 = api.kanjiUnlockStatus(rad.words, kan.words);
  expect(status0).toMatchObject({ known: 0, ready: [expect.anything(), expect.anything()] }); // 西, 川: nincs felbontás
  const line0 = doc.querySelector('#home-actions .home-unlock');
  expect(line0.textContent.replace(/\s+/g, ' ').trim()).toBe(`Radikálok Az 1. radikál-lecke ${status0.nextLesson.unlocks.length} kandzsit nyit meg`);
  expect(line0.getAttribute('onclick')).toBe("setMode('radicals')");

  // Az első radikál-lecke megtanulva: szintenként a kész kandzsik elöl, a többi utánuk lecke-sorrendben
  learn(lessons[0].radicals);
  const known = api.knownRadicals(rad.words);
  expect(known.size).toBe(10);
  const pool = api.getNewWordPool();
  expect(pool.map(w => w.en)).not.toEqual(before);
  expect(pool).toHaveLength(before.length);
  const levelOf = w => LEVEL[w.diff] || 9;
  expect(pool.every((w, i) => i === 0 || levelOf(pool[i - 1]) <= levelOf(w))).toBe(true);
  const n5 = pool.filter(w => w.diff === 'N5');
  const firstWaiting = n5.findIndex(w => !api.isKanjiReady(w.en, known));
  expect(firstWaiting).toBeGreaterThan(10);
  expect(n5.slice(firstWaiting).every(w => !api.isKanjiReady(w.en, known))).toBe(true);
  expect(n5.slice(0, firstWaiting).map(w => w.en)).toEqual(expect.arrayContaining(['日', '月', '木', '人', '休', '本']));
  expect(api.describePoolSource()).toBe('Radikálokból kész · N5');

  // Kezdőlap: kész kandzsik és a következő lecke
  api.showScreen('home');
  const status1 = api.kanjiUnlockStatus(rad.words, kan.words);
  expect(status1.nextLesson.lesson).toBe(2);
  expect(doc.querySelector('#home-actions .home-unlock .home-jlpt-value').textContent)
    .toBe(`${status1.ready.length} kandzsi kész · 2. lecke: +${status1.nextLesson.unlocks.length}`);

  // Kandzsi kártya: a tudott radikálok pipát kapnak (休: 亻 人 és 木 is megvan)
  const kyuu = kan.words.find(w => w.en === '休');
  kan.practice = { type: 'learn', queue: [kyuu.id], batchIds: [kyuu.id], learnedIds: [], againIds: [] };
  api.showScreen('practice');
  api.showLearnCard();
  const chips = doc.querySelectorAll('.learn-back .kanji-links.is-radicals .kl-item');
  expect([...chips].map(c => c.classList.contains('is-known'))).toEqual([true, true]);
  expect(chips[0].querySelector('.sr-only').textContent).toBe(' (már tudod)');

  // JLPT képernyő: hány kandzsit raksz össze a radikálokból
  api.showGoalScreen();
  expect(doc.getElementById('goal-body').textContent).toContain('A megtanult radikáljaidból');

  // Radikál tanulás vége: a 2. lecke kész, és az így megnyílt kandzsik
  api.setMode('radicals');
  const readyBefore = status1.ready.map(w => w.en);
  learn(lessons[1].radicals, '2026-09-29');
  rad.practice = { type: 'learn', queue: [], batchIds: [], learnedIds: [], againIds: [], lessonsBefore: [1], kanjiReadyBefore: readyBefore };
  api.showScreen('practice');
  api.showLearnComplete();
  const notes = [...doc.querySelectorAll('.learn-milestone')].map(b => b.textContent);
  expect(notes[0]).toMatch(/^Kész a 2\. lecke · /);
  const fresh = status1.nextLesson.unlocks.map(w => w.en);
  expect(notes[1]).toBe(`Új kandzsik: ${fresh.slice(0, 6).join(' ')}${fresh.length > 6 ? ` +${fresh.length - 6}` : ''}`);
  expect(doc.querySelector('.learn-unlock').getAttribute('onclick')).toBe("setMode('kanji')");
});
