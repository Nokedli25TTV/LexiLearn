// Lecke fókusz lista: a gyakorlókártya zászlójával a nehéz szó a saját leckéjének fókusz
// listájába kerül, a csillagos Fókusz Listától külön, és leckénként szűrhető / gyakorolható.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a zászló a szót a leckéje fókusz listájába teszi, leckénként külön szűrhető', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const inLesson = n => ja.words.filter(w => Array.isArray(w.lesson) && w.lesson.length === 1 && String(w.lesson[0]) === n);
  const [a, b] = inLesson('3');
  const [c] = inLesson('5');
  ja.words.forEach(w => { w.lessonFocus = false; w.bookmarked = false; });

  // Gyakorlás közben a kártyán ott a zászló, a lecke nevével
  ja.practice = {
    type: 'classic', roundNumber: 1, roundWords: [a.id, b.id], currentIdx: 0,
    errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
  };
  api.showScreen('practice');
  api.showQuestion();
  const btn = doc.getElementById(`lesson-focus-btn-${a.id}`);
  expect(btn.getAttribute('title')).toBe('Hozzáadás a lecke fókusz listájához (Dekiru 3. lecke)');
  expect(btn.getAttribute('onclick')).toContain(`toggleLessonFocus('${a.id}')`);
  api.toggleLessonFocus(a.id); // a jsdom nem futtatja az inline onclick-et
  expect(a.lessonFocus).toBe(true);
  expect(a.bookmarked).toBe(false); // a csillagos Fókusz Listába nem kerül bele
  expect(btn.classList.contains('is-on')).toBe(true);
  expect(btn.getAttribute('aria-pressed')).toBe('true');
  api.toggleLessonFocus(c.id);

  expect(api.getLessonFocusGroups().map(g => [g.id, g.label, g.count]))
    .toEqual([['__lesson:3', 'Dekiru 3. lecke', 1], ['__lesson:5', 'Dekiru 5. lecke', 1]]);

  // A Lista menüben külön szakasz, a szűrő csak az adott lecke jelölt szavait mutatja
  api.showScreen('dashboard');
  api.toggleFilterMenu('list');
  const menu = doc.getElementById('filter-menu').textContent;
  expect(menu).toContain('Leckék fókusz listái');
  expect(menu).toContain('Dekiru 3. lecke');
  api.setListFilter('__lesson:3');
  expect([...doc.querySelectorAll('#word-list .word-row')].map(r => r.dataset.id)).toEqual([a.id]);
  expect(doc.getElementById('filter-pills').textContent).toContain('Dekiru 3. lecke · fókusz');
  api.setListFilter('__focus');
  expect(doc.querySelectorAll('#word-list .word-row')).toHaveLength(0);

  // A szólista zászlója is kapcsol, a lecke listája kiüríthető
  api.setListFilter('all');
  api.setLessonFilter('3');
  doc.querySelector(`.word-row[data-id="${b.id}"] .word-flag`).click();
  expect(b.lessonFocus).toBe(true);
  api.setLessonFilter('all');
  win.confirm = () => true;
  api.setListFilter('__lesson:3');
  api.clearLessonFocus('3');
  expect([a.lessonFocus, b.lessonFocus, c.lessonFocus]).toEqual([false, false, true]);
  expect(ja.filters.list).toBe('all');

  // Angol módban nincs lecke, így zászló sincs
  api.setMode('english');
  const en = win.appData.english;
  en.practice = { ...ja.practice, roundWords: [en.words[0].id], currentIdx: 0 };
  api.showScreen('practice');
  api.showQuestion();
  expect(doc.querySelector('.lesson-focus-btn')).toBeNull();
});
