// Minden képernyőn, menüben és gyakorlás-típusban kirajzolt inline eseménykezelő
// (onclick="…", oninput="…", …) létező, window-ra tett függvényt hív.
// Ha egy új gomb olyan függvényt hív, amit a js/main.js nem tesz ki, ez a teszt elbukik.
import { it, expect } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

function collectHandlerCalls(doc) {
  const calls = new Set();
  doc.querySelectorAll('*').forEach(el => {
    for (const attr of el.attributes) {
      if (!/^on[a-z]+$/.test(attr.name)) continue;
      for (const m of attr.value.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) calls.add(m[2]);
    }
  });
  return calls;
}

it('minden inline eseménykezelő létező window függvényt hív', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  const seen = new Set();
  const snap = () => collectHandlerCalls(win.document).forEach(n => seen.add(n));

  api.setMode('japanese');
  const ja = win.appData.japanese;
  for (const screen of ['home', 'dashboard', 'stats', 'profile']) { api.showScreen(screen); snap(); }
  api.showScreen('dashboard');
  for (const menu of ['lesson', 'day', 'tags', 'diff', 'list', 'sort']) { api.toggleFilterMenu(menu); snap(); api.closeFilterMenu(); }
  api.toggleDockSettings(true); snap(); api.toggleDockSettings(false);
  api.switchViewTab('sentences'); snap(); api.switchViewTab('words');
  ['topics', 'words', 'history', 'dekiru'].forEach(t => { api.showScreen('stats'); api.switchStatsTab(t); snap(); });

  ja.words.slice(0, 12).forEach(w => ja.selectedIds.add(w.id));
  for (const type of ['classic', 'hardcore', 'sentenceFill', 'flashcard3d']) {
    ja.practiceOptions = { type, count: 10, order: 'random' };
    api.showScreen('dashboard'); api.startPractice(); snap();
  }
  api.showRoundEnd(); snap();
  api.showScreen('home'); api.startLearnSession(); snap();
  api.showLearnComplete(); snap();
  api.openAddModal(); snap(); api.closeModal('add-modal');

  // V13.5: esedékes ismétlés (Kezdőlap fő gomb, kártya, értékelő gombok, összegzés)
  ja.words.slice(0, 3).forEach(w => { w.stats.srs = { due: '2026-09-28', s: 5, d: 5, last: '2026-09-20', reps: 1, lapses: 0 }; });
  api.showScreen('home'); snap();
  api.startReviewSession(); snap();
  api.flipReviewCard(); snap();
  api.showReviewComplete(); snap();

  // V13.6: JLPT haladás képernyő (Statisztika kártya már a stats képernyőn látszik japán módban)
  api.showScreen('goal'); snap();

  // V13.9: kandzsi kártya (a hátoldalon a vonássorrend újrajátszás gombja)
  api.setMode('kanji');
  api.showScreen('home'); api.startLearnSession(); snap();
  expect(win.document.querySelector('#learn-card .ks-replay')).not.toBeNull();
  api.setMode('japanese');

  expect(seen.size).toBeGreaterThan(40);
  const missing = [...seen].filter(n => typeof win[n] !== 'function' && !['event', 'document'].includes(n));
  expect(missing).toEqual([]);
});
