// Egy ismétlési alkalom mérete a Profilban állítható (10, 20, 30, 50), módonként.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('az ismétlési alkalom mérete a beállítást követi', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.words.forEach(w => { w.stats.srs = undefined; });
  ja.words.slice(0, 25).forEach(w => Object.assign(w.stats, {
    learnedAt: '2026-09-01', srs: { due: '2026-09-28', s: 3, d: 5, last: '2026-09-25', reps: 2, lapses: 0 }
  }));

  expect(api.getReviewBatch()).toBe(20);            // alapértelmezés
  api.showScreen('profile');
  api.setReviewBatch(10);
  expect(ja.globalStats.reviewBatch).toBe(10);
  expect(doc.querySelector('#review-segmented [data-batch="10"]').getAttribute('aria-checked')).toBe('true');
  api.setReviewBatch(7);                             // érvénytelen érték: nem változik
  expect(api.getReviewBatch()).toBe(10);

  api.showScreen('home');
  expect(doc.getElementById('home-actions').textContent).toContain('10 kártya most');
  api.startReviewSession();
  expect(ja.practice.batchIds).toHaveLength(10);

  // Másik módban a saját (alap) értéke marad
  api.setMode('kanji');
  expect(api.getReviewBatch()).toBe(20);
});
