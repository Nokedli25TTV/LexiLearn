// Radikálok mód (V13.23): a 214 Kangxi-radikál a KanjiRadical projektből, napi tanulás a Radikál-útvonal
// sorrendjében (V13.24), írásgyakorlás vonásadattal, és a kandzsi ↔ radikál összekötés a kártyákon.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('Radikálok mód: adat, napi sorrend, szűrő, kártyák, összekötés, gyakorlástípusok', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;

  api.setMode('radicals');
  const rad = win.appData.radicals;
  expect(rad.words).toHaveLength(214);
  const hito = rad.words.find(w => w.en === '人');
  expect(hito).toMatchObject({ id: 'rad_人', hu: 'ember', romaji: 'hito', lesson: 1, path: 4, diff: 'N5', source: 'data_js' });
  expect(hito.tags).toEqual(['önálló kandzsi is']);
  expect(rad.words.find(w => w.en === '丶')).toMatchObject({ diff: '–', tags: ['csak elemként'] });
  expect(doc.getElementById('mode-radicals').classList.contains('active')).toBe(true);

  // Napi sorrend: a Radikál-útvonal (V13.24)
  const pool = api.getNewWordPool();
  expect(pool.slice(0, 3).map(w => w.en)).toEqual(['日', '木', '月']);
  expect(api.describePoolSource()).toBe('Radikál-útvonal 1. lecke · sorrendben');

  // Gyakorlás fül: mértékegység és útvonal-lecke szűrő
  api.showScreen('dashboard');
  expect(doc.getElementById('word-count-label').textContent).toBe('214 radikál');
  api.setLessonFilter('3');
  expect(doc.getElementById('filter-pills').textContent).toContain('Radikál 3. lecke');
  expect(doc.querySelectorAll('#word-list .word-row').length).toBe(10);
  api.setLessonFilter('all');

  // A JLPT-haladás nem a radikáloké: a Kezdőlapon az útvonal sora és leckekártyája látszik
  api.showScreen('home');
  expect(doc.querySelector('#home-actions .home-jlpt:not(.home-leech):not(.wk-link)').textContent).toContain('Útvonal');
  expect(doc.querySelector('#home-current-lesson .lesson-card-kicker').textContent).toBe('Aktuális lecke · Radikál-útvonal');

  // Tanulókártya: busu-név, olvasat, kandzsik ezzel a radikállal
  rad.practice = { type: 'learn', queue: [hito.id], batchIds: [hito.id], learnedIds: [], againIds: [] };
  api.showScreen('practice');
  api.showLearnCard();
  const back = doc.querySelector('.learn-back');
  expect(back.querySelector('.learn-readings').textContent).toContain('hito · On:');
  const chips = [...back.querySelectorAll('.kanji-links .kl-item b')].map(b => b.textContent);
  expect(chips.length).toBeGreaterThan(3);
  expect(chips.every(k => (api.radicalsOf(k)).some(p => p.radical === '人'))).toBe(true);
  expect(back.querySelector('.kl-more').textContent).toMatch(/^\+\d+ kandzsi$/);

  // Vonásadat a csak elemként élő radikálokhoz is; írás igen, hallás és mondatépítő nem
  expect(api.hasStrokeData('丨')).toBe(true);
  expect(api.hasStrokeData('辵')).toBe(true);
  expect(api.practiceTypesFor('radicals').map(t => t.value)).toEqual(['classic', 'hardcore', 'sentenceFill', 'flashcard3d', 'writing']);

  // Rögzített lista: nincs új elem / import
  api.openAddModal();
  expect(doc.getElementById('add-modal')?.classList.contains('open') ?? false).toBe(false);

  // Kandzsi kártya: a radikáljai, a szótári elöl (休 → 亻 (人) + 木)
  api.setMode('kanji');
  expect(api.radicalsOf('休').map(p => [p.shown, p.radical, p.main])).toEqual([['亻', '人', true], ['木', '木', false]]);
  const kyuu = win.appData.kanji.words.find(w => w.en === '休');
  win.appData.kanji.practice = { type: 'learn', queue: [kyuu.id], batchIds: [kyuu.id], learnedIds: [], againIds: [] };
  api.showLearnCard();
  const radChips = doc.querySelector('.learn-back .kanji-links.is-radicals');
  expect(radChips.querySelector('.is-main').textContent).toBe('亻人 ember');
});
