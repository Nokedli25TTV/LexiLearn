// Az esedékes ismétlés a teljes appal: Kezdőlap fő gombja és előrejelzés, a kártya csak a jelentés
// megnézése után értékelhető, az Újra még ma visszajön, a Jó későbbre ütemez, a végén összegzés.
import { it, expect } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TODAY = '2026-09-29';

it('esedékes ismétlés a Kezdőlaptól az összegzésig', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;
  const [a, b, c, later, tomorrow] = ja.words;
  const srs = (due, last = '2026-09-20') => ({ due, s: 8, d: 5, last, reps: 2, lapses: 0 });
  a.stats.srs = srs('2026-09-27');
  b.stats.srs = srs(TODAY);
  c.stats.srs = srs(TODAY);
  later.stats.srs = srs('2026-10-03');
  tomorrow.stats.srs = srs('2026-09-30');

  // Kezdőlap: az ismétlés a korall fő gomb, az új szavak másodlagosak, alatta előrejelzés
  api.showScreen('home');
  const actions = doc.getElementById('home-actions');
  const primary = actions.querySelector('.cta-learn');
  expect(primary.getAttribute('onclick')).toBe('startReviewSession()');
  expect(primary.textContent).toContain('3');
  expect(actions.querySelectorAll('.cta-learn')).toHaveLength(1);
  expect(actions.querySelector('.home-forecast').textContent.replace(/\s+/g, ' ')).toContain('Holnap 1 · a következő 7 napban 2');

  // Indítás: a legrégebben esedékes jön elsőként; értékelni csak felfordítás után lehet
  win.startReviewSession();
  expect(ja.practice.queue).toEqual([a.id, b.id, c.id]);
  expect(doc.querySelector('#review-card .learn-word').textContent).toBe(a.en);
  win.rateReview(3);
  await wait(300);
  expect(ja.practice.queue[0]).toBe(a.id); // nem történt semmi
  expect(doc.querySelector('.review-controls.is-revealed')).toBeNull();

  win.flipReviewCard();
  expect(doc.querySelector('.review-controls.is-revealed')).not.toBeNull();
  const whens = [...doc.querySelectorAll('.rate-when')].map(e => e.textContent);
  expect(whens[0]).toBe('ma');
  expect(whens).toHaveLength(4);

  // Jó: későbbre ütemez
  win.rateReview(3);
  await wait(300);
  expect(a.stats.srs.last).toBe(TODAY);
  expect(a.stats.srs.due > TODAY).toBe(true);
  expect(a.stats.srs.reps).toBe(3);

  // Újra: még ma, a sor végén visszajön
  win.flipReviewCard();
  win.rateReview(1);
  await wait(300);
  expect(b.stats.srs).toMatchObject({ due: TODAY, lapses: 1 });
  expect(ja.practice.queue).toEqual([c.id, b.id]);

  // Billentyűzet: Szóköz fordít, 4 = Könnyű
  win.document.body.dataset.screen = 'practice';
  const key = k => doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: k, bubbles: true }));
  key(' '); key('4');
  await wait(300);
  expect(c.stats.srs.due > a.stats.srs.due).toBe(true);

  // Az újra kért kártya most Jó → vége, összegzés
  win.flipReviewCard(); win.rateReview(3);
  await wait(300);
  const done = doc.querySelector('.learn-done');
  expect(done.querySelector('.learn-done-title').textContent).toBe('3 szó átismételve');
  expect(doc.querySelector('.review-summary').textContent).toBe('Újra 1 · Jó 2 · Könnyű 1');
  expect(done.textContent).toContain('Mára nincs több ismétlés. Holnap 1 szó jön.');
  expect(ja.globalStats.daily[TODAY].k).toBeGreaterThanOrEqual(3);
  expect(ja.globalStats.studyDays[TODAY]).toBe(true);

  // Kezdőlap újra: nincs esedékes → az új szavak a fő gomb, az előrejelzés marad
  ja.globalStats.dailyGoal = 500;
  api.showScreen('home');
  expect(doc.querySelector('#home-actions .cta-learn').getAttribute('onclick')).toBe('startLearnSession()');
  expect(doc.querySelector('.home-forecast').textContent).toContain('Mára nincs esedékes ismétlés.');
});
