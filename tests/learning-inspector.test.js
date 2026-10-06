import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('az ismétlési sor megmutatható, halasztható, szüneteltethető és visszaállítható', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const word = win.appData.japanese.words.find(w => Array.isArray(w.lesson) && w.lesson.includes(1));
  Object.assign(word.stats, {
    learnedAt: '2026-09-20',
    srs: { due: '2026-09-28', s: 4, d: 5, last: '2026-09-20', reps: 1, lapses: 0 }
  });

  api.openReviewQueue();
  const modal = win.document.getElementById('learning-inspector-modal');
  expect(modal.classList.contains('open')).toBe(true);
  expect(modal.textContent).toContain(word.en);
  expect(modal.textContent).toContain('Azért van itt, mert a napi tanulásban megtanultad.');

  api.postponeReviewWord(word.id, 7);
  expect(word.stats.srs.due).toBe('2026-10-06');

  api.suspendReviewWord(word.id);
  expect(word.stats.srs).toBeUndefined();
  expect(word.stats.srsSuspended).toBe(true);
  expect(api.seedMissing([word], '2026-09-29')).toBe(0);

  api.restoreReviewWord(word.id);
  expect(word.stats.srsSuspended).toBeUndefined();
  expect(word.stats.srs).toBeDefined();

  Object.assign(word.stats, { srs: { due: '2026-10-30', s: 30, d: 5, last: '2026-09-20' } });
  api.openWordInspector('mature');
  expect(win.document.getElementById('learning-inspector-title').textContent).toBe('Rögzült szavak');
  expect(modal.textContent).toContain(word.en);
  expect(modal.textContent).toContain('30 napos köz');
});
