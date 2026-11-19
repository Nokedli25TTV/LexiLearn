// Tanulás ("Tudom") és ütemezés, és a már megtanult szavak beosztása (betöltéskor / szinkron után).
// V13.97: a "Tudom" nem ad ismétlőkártyát (a szó Tanulás alatt marad, amíg gyakorlásban meg nem tanulod).
// Külön fájl: a bootApp fájlonként egyszer futtatható (az adatfájlok globális konstansai miatt).
import { it, expect } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

it('a "Tudom" nem ütemez, a már megtanult szavakat pedig beosztja', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.globalStats.dailyGoal = 500;

  win.startLearnSession();
  const [first, second] = ja.practice.queue.map(id => ja.words.find(w => w.id === id));
  win.learnSwipe('left');   // első: még nem
  await wait(300);
  win.learnSwipe('right');  // második: tudom
  await wait(300);
  expect(second.stats.introducedAt).toBe('2026-09-29');
  expect(second.stats.srs).toBeUndefined();
  for (let i = 0; i < 10 && ja.practice.queue.length; i++) { win.learnSwipe('right'); await wait(300); }
  expect(first.stats.introducedAt).toBe('2026-09-29');
  expect(first.stats.srs).toBeUndefined();
  expect(win.seedSrsAll()).toBe(0); // a csak elkezdett szavakat a beosztás sem ütemezi

  // Régi, ütemezés nélküli megtanult szavak: betöltéskor (és szinkron után) beosztja őket
  const old = ja.words.filter(w => !w.stats.srs && !w.stats.introducedAt).slice(0, 40);
  old.forEach((w, i) => Object.assign(w.stats, { learnedAt: '2026-06-01', totalCorrect: 2, totalWrong: i % 2, streak: 1, lastAttempt: new Date(2026, 5, 1).getTime() }));
  expect(win.seedSrsAll()).toBeGreaterThanOrEqual(40);
  const dueToday = old.filter(w => w.stats.srs.due === '2026-09-29').length;
  expect(dueToday).toBe(15);
  expect(old.every(w => w.stats.srs.due >= '2026-09-29')).toBe(true);
  expect(win.seedSrsAll()).toBe(0); // másodszor már nincs mit beosztani
});
