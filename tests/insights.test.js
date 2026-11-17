// V13.64: három új Statisztika-panel. Előrejelzés (a mai oszlopban a lemaradás is, a fordított kártya is
// számít), szókincs növekedése (az ablak előtti megtanultak az alapszint), legnehezebb szavak (legalább
// két hiba, a gyakorlás az indító lappal indul).
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

it('előrejelzés, növekedés, legnehezebb szavak', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  const doc = win.document;
  const T = '2026-11-10';
  const card = due => ({ due, s: 3, d: 5, last: '2026-11-01', reps: 2, lapses: 0 });
  const w = (stats, extra = {}) => ({ id: 'x' + Math.random(), en: 'て', hu: 'kéz', tags: [], stats: { totalCorrect: 0, totalWrong: 0, ...stats }, ...extra });

  // Előrejelzés: lemaradás a mai napra, a fordított kártya külön számít, a 14 napon túli nem
  const fc = api.computeForecast([
    w({ srs: card('2026-11-01') }), w({ srs: card(T), srsRev: card('2026-11-11') }),
    w({ srs: card('2026-11-23') }), w({ srs: card('2026-11-24') }), w({})
  ], T);
  expect(fc).toHaveLength(14);
  expect(fc[0]).toEqual({ k: T, n: 2 });
  expect(fc[1]).toEqual({ k: '2026-11-11', n: 1 });
  expect(fc[13]).toEqual({ k: '2026-11-23', n: 1 });
  expect(fc.reduce((s, p) => s + p.n, 0)).toBe(4);

  // Növekedés: a régen megtanult az alapszint, az ablakon belüli a napján nő; a nem megtanult nem számít
  const days = api.lastNDays(60);
  const g = api.computeGrowth([
    w({ learnedAt: '2020-01-01' }), w({ learnedAt: days[10] }), w({ practiceLearnedAt: days[59] }), w({ introducedAt: days[5] })
  ]);
  expect(g).toHaveLength(60);
  expect(g[0].total).toBe(1);
  expect(g[10]).toEqual({ k: days[10], total: 2, added: 1 });
  expect(g[59].total).toBe(3);

  // Legnehezebb: legalább két hiba, több hiba elöl, azonosnál a gyengébb pontosság
  const a = w({ totalWrong: 5, totalCorrect: 5 }), b = w({ totalWrong: 5, totalCorrect: 1 }), c = w({ totalWrong: 2 }), d = w({ totalWrong: 1 });
  expect(api.hardestWords([a, b, c, d])).toEqual([b, a, c]);

  // A Statisztika képernyőn: a három panel kirajzolódik; a gyakorlás az indító lapot nyitja a szavakkal
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.words.slice(0, 3).forEach((x, i) => { x.stats.totalWrong = 4 - i; x.stats.totalCorrect = 1; });
  api.showScreen('stats');
  api.renderStats();
  expect(doc.getElementById('forecast-chart').innerHTML.length).toBeGreaterThan(0);
  expect(doc.getElementById('growth-chart').innerHTML.length).toBeGreaterThan(0);
  const rows = [...doc.querySelectorAll('#hardest-words .hw-row')];
  expect(rows.length).toBeGreaterThanOrEqual(3);
  expect(rows[0].textContent).toContain(ja.words[0].en);
  const btn = doc.querySelector('#hardest-words .hw-practice');
  expect(btn.getAttribute('onclick')).toBe('practiceHardestWords()');
  win.practiceHardestWords();
  expect(doc.getElementById('quest-modal').classList.contains('open')).toBe(true);
  expect(doc.getElementById('ql-title').textContent).toBe('Legnehezebb szavak');
  expect(api.questLauncherState().size).toBe(rows.length);
  api.closeQuestLauncher();
  await wait(600);
});
