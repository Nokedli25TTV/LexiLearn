// Úton a megtanuláshoz: a még nem megtanult szavak hány egymás utáni helyesnél tartanak (x/5).
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a statisztika, a szavak táblázata és a szólista mutatja az x/5 állást', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.words.forEach(w => Object.assign(w.stats, { learnedAt: undefined, practiceLearnedAt: undefined, practiceLearnedLegacy: undefined, srs: undefined, streak: 0, totalCorrect: 0, totalWrong: 0, lastAttempt: null }));
  const [a, b, c, d, learned] = ja.words.slice(0, 5);
  Object.assign(a.stats, { streak: 4, totalCorrect: 6, totalWrong: 2, lastAttempt: 1790000000300 });
  Object.assign(b.stats, { streak: 4, totalCorrect: 4, lastAttempt: 1790000000100 });
  Object.assign(c.stats, { streak: 2, totalCorrect: 3, totalWrong: 1, lastAttempt: 1790000000200 });
  Object.assign(d.stats, { streak: 0, totalCorrect: 1, totalWrong: 1, lastAttempt: 1790000000000 });   // hiba után újrakezdve
  Object.assign(learned.stats, { streak: 6, totalCorrect: 6, practiceLearnedAt: '2026-09-20', lastAttempt: 1790000000400 });

  api.showScreen('stats');
  const rows = [...doc.querySelectorAll('#streak-progress .sp-row')];
  expect(rows.map(r => r.querySelector('.sp-main b').textContent)).toEqual(['4/5', '2/5']);  // csak a nem üres sorok
  expect(rows[0].querySelector('.sp-count').textContent).toBe('2');
  expect(rows[0].querySelectorAll('.sp-dots i.on')).toHaveLength(4);
  expect(rows[0].querySelector('.sp-words').textContent).toBe(`${a.en}, ${b.en}`);          // a legutóbb gyakorolt elöl
  expect(doc.getElementById('streak-progress').textContent).toContain('3 szó félúton');

  // A sor a szavak listáját nyitja
  api.openWordInspector('streak4');
  const list = [...doc.querySelectorAll('#learning-inspector-body .inspect-word-row')];
  expect(list).toHaveLength(2);
  expect(list[0].textContent).toContain('4/5');

  // Részletek → Szavak táblázat: x/5, illetve „megtanult”
  const cell = word => [...doc.querySelectorAll('#word-stats-table tbody tr')].find(tr => tr.cells[0].textContent === word.en).cells[2].textContent;
  expect(cell(a)).toBe('4/5');
  expect(cell(d)).toBe('0/5');
  expect(cell(learned)).toBe('megtanult');

  // Gyakorlás fül szólistája: „4/5” a még nem megtanultnál, „6×” a megtanultnál
  api.showScreen('dashboard');
  const stat = word => api.wordRowHtml(word);
  expect(stat(a)).toContain('>4/5</span>');
  expect(stat(learned)).toContain('>6×</span>');

  // Ha nincs félúton lévő szó, csendes üres állapot
  [a, b, c].forEach(w => { w.stats.streak = 0; });
  api.renderStats();
  expect(doc.getElementById('streak-progress').textContent).toContain('Most nincs félúton lévő szó');
});
