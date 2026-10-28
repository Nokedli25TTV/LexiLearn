// Radikál-útvonal (V13.24): leckék a lefedettség szerint, cél (50/80/90%/mind) célidőponttal, tempó,
// a Haladás képernyő, a Statisztika kártya, a Kezdőlap sora és a tanulás végi „kész a lecke” jelzés.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('Radikál-útvonal: számítás, cél, felületek', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  const lessons = win.LEXI_DATA.radicalLessons;

  // Az adat: 22 lecke, mindegyik radikál pontosan egyszer
  expect(lessons).toHaveLength(22);
  expect(lessons[0].radicals).toBe('日木月人大一口土寸丨');
  expect(new Set(lessons.flatMap(l => [...l.radicals])).size).toBe(214);

  // A cél leckéje: az első, amelynek végére a szöveg-lefedettség eléri a célt
  expect(['50', '80', '90', 'all'].map(api.targetLessonOf)).toEqual([6, 11, 14, 22]);
  expect(api.targetLessonOf('nincs ilyen')).toBe(11); // ismeretlen: az alapcél (80%)

  // A futásidejű lefedettség ugyanaz, mint amit a build kiírt
  const upTo = n => new Set(lessons.slice(0, n).flatMap(l => [...l.radicals]));
  expect(api.coverageOf(new Set()).text).toBe(0);
  [1, 6, 11, 22].forEach(n => {
    const c = api.coverageOf(upTo(n));
    expect(c.text).toBeCloseTo(lessons[n - 1].text, 3);
    expect(c.kanji).toBeCloseTo(lessons[n - 1].kanji, 3);
  });
  expect(api.coverageOf(upTo(22)).core).toBe(api.coverageOf(upTo(22)).coreTotal);

  // Fél év a mai naptól; a hónap végén a rövidebb hónap utolsó napja
  expect(api.addMonthsKey('2026-09-29', 6)).toBe('2027-03-29');
  expect(api.addMonthsKey('2026-08-31', 6)).toBe('2027-02-28');

  // Az első megjelenítéskor (itt a Kezdőlap sora) rögzül a mától fél éves, 80%-os cél, hogy ne csússzon naponta
  const radStats = win.appData.radicals.globalStats;
  expect(radStats.radicalGoal).toBeUndefined();
  api.setMode('radicals');
  const rad = win.appData.radicals;
  expect(rad.globalStats.radicalGoal).toEqual({ target: '80', date: '2027-03-29' });

  // Az első lecke megtanulva (napi tanulásból), a mai dátum: 2026-09-29
  const byChar = ch => rad.words.find(w => w.en === ch);
  [...lessons[0].radicals].forEach((ch, i) => { byChar(ch).stats.learnedAt = `2026-09-${String(20 + (i % 5)).padStart(2, '0')}`; });
  expect(api.completedLessons(rad.words)).toEqual([1]);

  // Haladás képernyő
  api.showGoalScreen();
  expect(doc.getElementById('screen-goal').classList.contains('active')).toBe(true);
  expect(doc.getElementById('goal-title').textContent).toBe('Radikál-útvonal');
  expect(doc.querySelector('#goal-sub .goal-date-input').value).toBe('2027-03-29');

  const p = api.getPath();
  expect(p).toMatchObject({ target: 110, learned: 10, targetLesson: 11, learnedTotal: 10 });
  expect(p.current.lesson).toBe(2);
  expect(p.lessons[0]).toMatchObject({ done: true, reachedAt: '2026-09-24' });
  expect(p.coverage.text).toBeCloseTo(lessons[0].text, 3);
  // 100 radikál 181 nap alatt: heti 3,9; az utóbbi 14 nap: 10 radikál → napi 0,7
  expect(p.pace).toMatchObject({ remaining: 100, daysLeft: 181, neededWeekly: 3.9, avg: 0.7, onTrack: true });

  const body = doc.getElementById('goal-body');
  const checked = () => body.querySelector('.rp-targets [aria-checked="true"]').textContent;
  expect(checked()).toBe('80%');
  expect(body.querySelectorAll('.rp-list')[0].querySelectorAll('.rp-lesson')).toHaveLength(11);
  expect(body.querySelector('.rp-lesson.is-done .jl-ms-right').textContent).toContain('szept. 24.');
  expect(body.querySelector('.rp-lesson.is-current .jl-ms-right').textContent).toBe('0 / 10');
  expect(body.querySelector('.rp-later summary').textContent).toBe('A célon túli leckék (12–22)');
  expect(body.querySelector('.jl-pace:not(.rp-now)').textContent).toContain('heti 3,9 új radikál');
  expect(body.querySelectorAll('.ms-bar[data-kind="path"] .ms-seg')).toHaveLength(11);

  // Cél és dátum módosítása
  api.setPathTarget('50');
  expect(rad.globalStats.radicalGoal.target).toBe('50');
  expect(checked()).toBe('50%');
  expect(body.querySelectorAll('.rp-list')[0].querySelectorAll('.rp-lesson')).toHaveLength(6);
  api.setPathTarget('all');
  expect(body.querySelector('.rp-later')).toBeNull();
  api.setPathTarget('80');
  api.setPathGoalDate('2027-01-01');
  expect(rad.globalStats.radicalGoal).toEqual({ target: '80', date: '2027-01-01' });
  api.setPathGoalDate('rossz');
  expect(rad.globalStats.radicalGoal.date).toBe('2027-01-01');

  // Leckére koppintva a Gyakorlás fül az adott lecke radikáljaival
  expect(body.querySelector('.rp-lesson.is-current').getAttribute('onclick')).toBe('openCurrentLesson(2)');
  api.openCurrentLesson(2);
  expect(doc.getElementById('filter-pills').textContent).toContain('Radikál 2. lecke');
  api.setLessonFilter('all');

  // Statisztika kártya és Kezdőlap sor
  api.showScreen('stats');
  expect(doc.getElementById('jlpt-card').hidden).toBe(false);
  expect(doc.getElementById('jlpt-card-title').textContent).toBe('Radikál-útvonal · cél 80%');
  expect(doc.querySelector('#jlpt-card-body .rp-cover').textContent).toContain(`${Math.floor(lessons[0].text * 100)}%`);
  api.showScreen('home');
  const line = doc.querySelector('#home-actions .home-jlpt:not(.home-leech):not(.wk-link)').textContent;
  expect(line).toContain('2. lecke');
  expect(line).toContain('szöveg 13%');
  expect(doc.querySelector('#home-current-lesson .lesson-card-head b').textContent).toBe('2. lecke');
  expect(doc.querySelector('#home-current-lesson .lesson-card-meta').textContent).toContain('10 radikál van hátra');

  // Tanulás vége: ha egy lecke teljessé vált, egy sor jelzi
  [...lessons[1].radicals].forEach(ch => { byChar(ch).stats.learnedAt = '2026-09-29'; });
  rad.practice = { type: 'learn', queue: [], batchIds: [], learnedIds: [], againIds: [], lessonsBefore: [1] };
  api.showScreen('practice');
  api.showLearnComplete();
  expect(doc.querySelector('.learn-milestone').textContent).toBe(`Kész a 2. lecke · a szövegek kandzsijainak ${Math.floor(lessons[1].text * 100)}%-a lefedve`);

  // Japán módban marad a JLPT-kártya
  api.setMode('japanese');
  api.showScreen('stats');
  expect(doc.getElementById('jlpt-card-title').textContent).toContain('JLPT');
});
