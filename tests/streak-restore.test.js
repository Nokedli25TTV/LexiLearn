// V13.101: konzisztencia-visszaállítás. A kimaradt nap utáni napon (24 óra) egy visszaállítással a nap
// pótolható; a visszaállított nap a konzisztenciában számít, a statisztikában nem. Kezdésnek egy jár, újat
// csak egy Dekiru-lecke első lezárása ad. A visszaállítás minden módban pótolja ugyanazt a napot.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const days = (...keys) => Object.fromEntries(keys.map(k => [k, true]));
const NOW = new Date(2026, 8, 29, 9, 0); // a teszt "ma"-ja: 2026-09-29
let booted = null; // a bootApp fájlonként egyszer futhat: a tesztek egy appon osztoznak, sorban
const boot = () => (booted || (booted = bootApp()));

it('ablak és számolás: csak a kimaradt nap utáni napon, a visszaállított nap beleszámít', async () => {
  const { api } = await boot();
  const gs = { studyDays: days('2026-09-25', '2026-09-26', '2026-09-27') };
  expect(api.calcStreak(gs, NOW)).toBe(0);
  expect(api.restoreWindow(gs, NOW)).toEqual({ day: '2026-09-28', lost: 3 });
  // két kimaradt nap után már nincs ablak; ha tegnap megvolt, nincs mit visszaállítani
  expect(api.restoreWindow({ studyDays: days('2026-09-26', '2026-09-27') }, new Date(2026, 8, 30, 9))).toBeNull();
  expect(api.restoreWindow({ studyDays: days('2026-09-27', '2026-09-28') }, NOW)).toBeNull();
  expect(api.restoreWindow({ studyDays: {} }, NOW)).toBeNull();
  // ma már tanult: az ablak ugyanúgy megvan, a konzisztencia 1-ről indul
  const today = { studyDays: days('2026-09-26', '2026-09-27', '2026-09-29') };
  expect(api.calcStreak(today, NOW)).toBe(1);
  expect(api.restoreWindow(today, NOW)).toEqual({ day: '2026-09-28', lost: 2 });
  // visszaállítva a sor folytatódik, a visszaállított napot is beleszámolva
  gs.restoredDays = days('2026-09-28');
  expect(api.calcStreak(gs, NOW)).toBe(4);
  expect(api.restoreWindow(gs, NOW)).toBeNull();
  gs.studyDays['2026-09-29'] = true;
  expect(api.calcStreak(gs, NOW)).toBe(5);
});

it('Kezdőlap: visszaállítás gombbal, minden érintett módban, a statisztika érintetlen', async () => {
  const { api, win } = await boot();
  const doc = win.document;
  const { japanese: ja, kanji: kj, english: en } = win.appData;
  ja.globalStats.studyDays = days('2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27');
  kj.globalStats.studyDays = days('2026-09-26', '2026-09-27');
  en.globalStats.studyDays = days('2026-09-20');
  delete ja.globalStats.streakRestores;
  expect(api.restoresLeft()).toBe(1); // kezdésnek egy jár

  api.setMode('japanese');
  api.showScreen('home');
  const host = doc.getElementById('streak-restore');
  const row = host.querySelector('button.restore-row');
  expect(row).not.toBeNull();
  expect(row.textContent.replace(/\s+/g, ' ')).toContain('Konzisztencia visszaállítása');
  expect(row.textContent).toContain('a 4 napos konzisztencia ma még menthető');
  expect(row.textContent).toContain('1 visszaállításod van');
  expect(doc.getElementById('home-streak-text').textContent).toBe('0 nap');

  win.restoreStreak();
  expect(ja.globalStats.restoredDays).toEqual(days('2026-09-28'));
  expect(kj.globalStats.restoredDays).toEqual(days('2026-09-28')); // ugyanaz a nap szakította meg
  expect(en.globalStats.restoredDays).toBeUndefined(); // itt nem volt mit megmenteni
  expect(ja.globalStats.studyDays['2026-09-28']).toBeUndefined(); // a statisztikában nem tanult nap
  expect(api.restoresLeft()).toBe(0);
  expect(api.calcStreak()).toBe(5);
  expect(host.innerHTML.trim()).toBe('');
  expect(doc.querySelector('#week-tracker .week-day-dot.restored')).not.toBeNull();
  expect(doc.getElementById('toast').textContent).toContain('Konzisztencia visszaállítva: 5 nap. Több visszaállításod most nincs.');

  // Ha nincs visszaállítás: nem gomb, elmondja, mivel lehet szerezni; a kezelő nem csinál semmit
  delete ja.globalStats.restoredDays;
  api.renderHome();
  const empty = host.querySelector('.restore-row.is-empty');
  expect(empty.tagName).toBe('DIV');
  expect(empty.textContent).toContain('A 4 napos konzisztencia egy visszaállítással menthető lenne, de most nincs.');
  expect(empty.textContent).toContain('Egy Dekiru-lecke lezárásáért kapsz egyet.');
  win.restoreStreak();
  expect(ja.globalStats.restoredDays).toBeUndefined();
});

it('Dekiru-lecke első lezárásáért egy visszaállítás jár, újrazárásért nem', async () => {
  const { api, win } = await boot();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.globalStats.streakRestores = 0;
  ja.globalStats.lessonTests = { 4: { date: '2026-09-20', pct: 80, total: 30, best: 80 } };
  const round = (lesson, errors = []) => ({ lessonTest: lesson, roundNumber: 1, roundWords: [], errorList: errors, mix: {} });

  api.finishLessonTestRound(round(3), 95); // első lezárás
  expect(api.restoresLeft()).toBe(1);
  expect(doc.getElementById('re-subtitle').textContent).toContain('A lezárásért kaptál egy konzisztencia-visszaállítást (most 1 van).');
  api.finishLessonTestRound(round(3), 100); // már lezárt lecke: nem jár újabb
  expect(api.restoresLeft()).toBe(1);
  expect(doc.getElementById('re-subtitle').textContent).not.toContain('visszaállítás');
  api.finishLessonTestRound(round(4), 88); // nem lezárás
  expect(api.restoresLeft()).toBe(1);
  api.finishLessonTestRound(round(4), 92); // korábban 80%, most először lezárva
  expect(api.restoresLeft()).toBe(2);
  expect(ja.globalStats.lessonTests['4'].best).toBe(92);
});
