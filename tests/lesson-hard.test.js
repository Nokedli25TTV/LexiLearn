// Egy koppintásos lecke-gyakorlás: a Kezdőlap leckekártyája alatt a lecke nehéz szavai
// (zászlós, makacs, elrontott és még nem sorozatban menő) azonnal gyakorolhatók.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a leckekártya alatti gomb a lecke nehéz szavaival indít, a kijelölést nem írja felül', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.words.forEach(w => { w.lessonFocus = false; Object.assign(w.stats, { learnedAt: undefined, practiceLearnedAt: undefined, srs: undefined, streak: 0, totalCorrect: 0, totalWrong: 0 }); });
  const l1 = ja.words.filter(w => Array.isArray(w.lesson) && w.lesson.map(String).includes('1'));
  const [flagged, missed, recovered, other] = l1;
  flagged.lessonFocus = true;
  Object.assign(missed.stats, { totalWrong: 1, totalCorrect: 2, streak: 1 });
  Object.assign(recovered.stats, { totalWrong: 1, totalCorrect: 4, streak: 3 });     // már megy
  const elsewhere = ja.words.find(w => Array.isArray(w.lesson) && w.lesson.map(String).includes('7'));
  elsewhere.lessonFocus = true;                                                       // más lecke

  expect(api.lessonHardWords(1).map(w => w.id).sort()).toEqual([flagged.id, missed.id].sort());

  api.showScreen('home');
  const btn = doc.querySelector('#home-current-lesson .lesson-hard-btn');
  expect(btn.textContent.replace(/\s+/g, ' ')).toContain('1. lecke: nehéz szavak');
  expect(btn.textContent).toContain('2 szó');

  ja.practiceOptions = { type: 'classic', count: 20, order: 'random' };
  ja.selectedIds = new Set([other.id]);
  api.practiceLessonHard(1);
  expect(ja.practice.type).toBe('classic');
  expect([...ja.practice.roundWords].sort()).toEqual([flagged.id, missed.id].sort());
  expect(ja.practice.origin).toBe('home');
  expect([...ja.selectedIds]).toEqual([other.id]);      // a Gyakorlás fül kijelölése megmaradt
  expect(doc.body.dataset.screen).toBe('practice');

  // Ha nincs nehéz szó, nincs gomb
  flagged.lessonFocus = false; missed.stats.streak = 3;
  api.showScreen('home');
  expect(doc.querySelector('#home-current-lesson .lesson-hard-btn')).toBeNull();
});
