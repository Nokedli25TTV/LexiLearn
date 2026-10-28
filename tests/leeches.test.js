// Makacs szavak: az app magától felismeri a többször elrontott szavakat, a Kezdőlapon jelzi,
// és egy koppintással kijelölve a Gyakorlás fülre visz. Ha a szó már megy, kikerül.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('makacs szavak: felismerés, kezdőlapi sor, lista szűrő, kijelölés', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.words.forEach(w => Object.assign(w.stats, { streak: 0, totalCorrect: 0, totalWrong: 0, srs: undefined }));
  const [practiceLeech, srsLeech, recovered, matured, fine] = ja.words.slice(0, 5);
  Object.assign(practiceLeech.stats, { totalWrong: 5, totalCorrect: 3, streak: 1 });
  Object.assign(srsLeech.stats, { learnedAt: '2026-09-01', srs: { due: '2026-09-30', s: 2, d: 8, last: '2026-09-28', reps: 9, lapses: 4 } });
  Object.assign(recovered.stats, { totalWrong: 5, totalCorrect: 5, streak: 3 });     // most már sorozatban megy
  Object.assign(matured.stats, { learnedAt: '2026-06-01', srs: { due: '2026-11-30', s: 40, d: 7, last: '2026-09-20', reps: 12, lapses: 5 } }); // rögzült
  Object.assign(fine.stats, { totalWrong: 3, totalCorrect: 1 });                       // még csak 3 hiba

  expect(api.getLeeches().map(w => w.id)).toEqual([practiceLeech.id, srsLeech.id]);

  api.showScreen('home');
  const row = doc.querySelector('#home-actions .home-leech');
  expect(row.textContent.replace(/\s+/g, ' ')).toContain('2 szó többször is kifogott rajtad');

  ja.filters.lesson = ['3'];
  ja.selectedIds = new Set([fine.id]);
  api.openLeeches();
  expect(doc.body.dataset.screen).toBe('dashboard');
  expect(ja.filters.list).toBe('__leech');
  expect(ja.filters.lesson).toBe('all');
  expect([...ja.selectedIds].sort()).toEqual([practiceLeech.id, srsLeech.id].sort());
  expect([...doc.querySelectorAll('#word-list .word-row')].map(r => r.dataset.id).sort()).toEqual([practiceLeech.id, srsLeech.id].sort());
  expect(doc.getElementById('selected-count-big').textContent).toBe('2');
  expect(doc.getElementById('filter-pills').textContent).toContain('Makacs szavak');

  // Ha már sorozatban megy, kikerül
  practiceLeech.stats.streak = 3;
  expect(api.isLeech(practiceLeech)).toBe(false);
  api.showScreen('home');
  expect(doc.querySelector('#home-actions .home-leech').textContent).toContain('1 szó');
});
