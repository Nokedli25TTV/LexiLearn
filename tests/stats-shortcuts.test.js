// V13.32: a statisztikai szólistából egy koppintással gyakorlás; a JLPT-kártya továbblépései külön sorokban;
// az "Ez a hét" sor a hét napjait is mutatja; a számlálószó-címke a tanuló, a gyakorló és a 3D kártyán.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

it('Gyakorlás ezekkel, JLPT-kártya sorai, heti mini hőtérkép, számlálószó a kártyákon', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;

  // Úton a megtanuláshoz: 4/5-ön álló szavak → a lista alján a gyakorlás gombja
  const four = ja.words.filter(w => w.lesson).slice(0, 3);
  four.forEach(w => Object.assign(w.stats, { streak: 4, totalCorrect: 4, totalWrong: 0, learnedAt: undefined, introducedAt: undefined, practiceLearnedAt: undefined }));
  api.showScreen('stats');
  api.openWordInspector('streak4');
  const btn = doc.querySelector('#learning-inspector-body .inspector-practice');
  expect(btn.textContent).toBe(`Gyakorlás ezekkel · ${four.length} szó`);
  win.practiceInspected();
  expect([...ja.selectedIds].sort()).toEqual(four.map(w => w.id).sort());
  expect(doc.getElementById('learning-inspector-modal').classList.contains('open')).toBe(false);
  expect(doc.body.dataset.screen).toBe('dashboard');
  expect(doc.getElementById('toast').textContent).toContain(`${four.length} szó kijelölve`);
  expect(doc.getElementById('start-btn').disabled).toBe(false);

  // Üres listán nincs gomb
  four.forEach(w => { w.stats.streak = 0; });
  api.openWordInspector('streak4');
  expect(doc.querySelector('#learning-inspector-body .inspector-practice')).toBeNull();
  win.closeModal('learning-inspector-modal');

  // JLPT-kártya: a két továbblépés két külön sor
  api.showScreen('stats');
  const links = [...doc.querySelectorAll('#jlpt-card-body .card-links .card-link')].map(b => b.textContent.trim());
  expect(links).toEqual(['Hogyan számoljuk a haladást?', 'Célidőpont, tempó és mérföldkövek']);

  // Ez a hét: a hét hét napja, a ma kiemelve, jobbra fent "Részletek"
  const week = doc.querySelector('#stats-week-link .wk-link');
  expect(week.querySelectorAll('.wk-link-days i')).toHaveLength(7);
  expect(week.querySelectorAll('.wk-link-days i.is-today')).toHaveLength(1);
  expect(week.querySelector('.wk-link-more').textContent).toContain('Részletek');
  expect(week.getAttribute('aria-label')).toMatch(/aktív nap/);

  // Számlálószó: a tanuló kártyán (elöl és hátul), a gyakorló kártyán és a 3D kártyán
  const counter = ja.words.find(w => w.en === 'ひとり');
  ja.practice = {
    type: 'learn', origin: 'home', queue: [counter.id], batchIds: [counter.id], learnedIds: [], againIds: [],
    roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
  };
  api.showScreen('practice');
  api.showLearnCard();
  const tags = [...doc.querySelectorAll('#learn-card .counter-tag')].map(t => t.textContent);
  expect(tags).toEqual(['Számláló · emberek', 'Számláló · emberek']);

  const quiz = (type, id = counter.id) => {
    ja.practice = {
      type, roundNumber: 1, roundWords: [id], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
      sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
    };
    api.showQuestion();
  };
  quiz('classic');
  expect(doc.querySelector('#q-card .q-note .counter-tag').textContent).toBe('Számláló · emberek');
  quiz('flashcard3d');
  expect(doc.querySelectorAll('#flashcard-3d .counter-tag')).toHaveLength(2);
  expect(doc.querySelectorAll('#q-card .counter-tag')).toHaveLength(2); // csak a kártyán, a fejlécben nem ismétlődik

  // Nem számlálószónál nincs címke
  const plain = ja.words.find(w => w.en === 'わたし');
  quiz('classic', plain.id);
  expect(doc.querySelector('#q-card .q-note')).toBeNull();
});
