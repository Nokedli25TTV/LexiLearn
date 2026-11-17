// V13.63: Napi feladatok a Kezdőlap tetején. Három feladat három fajtából (gyakorlás, szokás, tartalom);
// koppintásra indulnak: ismétlés, nyelvtan, vagy az indító lap előre kitöltött szűrőkkel és a dokk
// beállításaival. A más módba mutató feladat (japán módban „Gyakorolj 10 kandzsit”) ott is halad.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

it('napi feladatok: generálás, kártya, indító lap, haladás', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  api.showScreen('home');
  const doc = win.document;
  const ja = win.appData.japanese;
  const today = api.todayKey();

  // Generálás: mindig három, egyedi azonosítóval; a gyakorlós fajtából mindig van egy
  for (let i = 0; i < 5; i++) {
    const g = api.generateDailyQuests();
    expect(g.date).toBe(today);
    expect(g.list).toHaveLength(3);
    expect(g.list.map(q => q.id)).toEqual(['q0', 'q1', 'q2']);
    expect(g.list.some(q => ['LearnWords', 'LessonWords', 'TagMaster', 'MistakeCleanup', 'GhostHunter'].includes(q.type))).toBe(true);
  }

  // A kártya a Napi penzum alatt, a cselekvések fölött
  const tagWord = ja.words.find(w => (w.tags || []).includes('melléknevek'));
  ja.dailyQuests = { date: today, list: [
    { id: 'q0', type: 'TagMaster', target: 10, progress: 0, completed: false, label: 'Tematikus nap: "melléknevek"', params: { tag: 'melléknevek' } },
    { id: 'q1', type: 'ReviewDue', target: 2, progress: 0, completed: false, label: 'Ismételj át 2 esedékes kártyát', params: {} },
    { id: 'q2', type: 'KanjiPractice', target: 2, progress: 0, completed: false, label: 'Gyakorolj 10 kandzsit', params: { mode: 'kanji' } }
  ] };
  api.renderDailyQuests();
  const home = doc.querySelector('#screen-home .home');
  const order = [...home.children].map(el => el.id || el.className);
  expect(order.indexOf('dq')).toBeGreaterThan(order.indexOf('home-goal'));
  expect(order.indexOf('dq')).toBeLessThan(order.indexOf('home-actions'));
  const rows = [...doc.querySelectorAll('#daily-quests-container .dq-item')];
  expect(rows).toHaveLength(3);
  expect(rows[0].tagName).toBe('BUTTON');
  expect(rows[0].getAttribute('onclick')).toBe('openQuest("q0")');
  expect(rows[0].textContent).toContain('Tematikus nap: „melléknevek”'); // a régi címke is az új alakban
  expect(rows[0].textContent).toContain('0/10');
  expect(doc.getElementById('quests-done').textContent).toBe('0 / 3 kész');

  // Tematikus nap: az indító lap a témakörrel, állapot-számlálókkal, a dokk beállításaival
  api.openQuest('q0');
  const modal = doc.getElementById('quest-modal');
  expect(modal.classList.contains('open')).toBe(true);
  expect(doc.getElementById('ql-title').textContent).toBe('Tematikus nap: „melléknevek”');
  const body = doc.getElementById('quest-body');
  expect(body.querySelector('.ql-tag').textContent).toBe('Témakör: melléknevek');
  expect(body.querySelector('[aria-labelledby="ql-type-label"]')).not.toBeNull(); // a dokk típuslistája
  const tagged = ja.words.filter(w => (w.tags || []).includes('melléknevek'));
  expect(api.questLauncherState().size).toBe(tagged.length);
  const statusChips = [...body.querySelectorAll('[aria-labelledby="ql-status-label"] .chip')];
  expect(statusChips.map(c => c.textContent.replace(/\s+\d+$/, '').trim())).toEqual(['Minden', 'Új', 'Tanulás alatt', 'Megtanult']);
  expect(statusChips[0].querySelector('.chip-count').textContent).toBe(String(tagged.length));

  // Állapot és lecke szűkít; a beállítás változása az indító lapot is frissíti
  api.qlSetStatus('new');
  expect(api.questLauncherState().size).toBe(tagged.filter(w => !api.isStartedWord(w)).length);
  api.qlSetStatus('all');
  const lesson = String((Array.isArray(tagWord.lesson) ? tagWord.lesson[0] : tagWord.lesson) || '');
  if (lesson) {
    api.qlToggleLesson(lesson);
    expect(body.querySelector(`.ql-lesson[data-lesson="${lesson}"]`).getAttribute('aria-pressed')).toBe('true');
    expect(api.questLauncherState().size).toBe(tagged.filter(w => api.wordLessons(w).includes(lesson)).length);
    api.qlAnyLesson();
  }
  api.setPracticeOption('count', 10);
  expect(body.querySelector('.ql-start').textContent).toContain('10 szó');
  api.setPracticeOption('type', 'classic');

  // Indítás: a feladat szavaival indul a gyakorlás, a Gyakorlás fül kijelölése visszaáll
  ja.selectedIds = new Set(['__keep__']);
  api.startQuestPractice();
  expect(modal.classList.contains('open')).toBe(false);
  expect(doc.body.dataset.screen).toBe('practice');
  expect(ja.practice.roundWords).toHaveLength(Math.min(10, tagged.length));
  expect(ja.practice.roundWords.every(id => tagged.some(w => w.id === id))).toBe(true);
  expect([...ja.selectedIds]).toEqual(['__keep__']);

  // Haladás: helyes válasz a témakör szavára; ismétlés; a kandzsi-feladat kandzsi módban halad
  api.updateQuestProgress('wordAnswered', { word: tagWord, isCorrect: true });
  expect(ja.dailyQuests.list[0].progress).toBe(1);
  api.updateQuestProgress('reviewDone');
  api.updateQuestProgress('reviewDone');
  expect(ja.dailyQuests.list[1].completed).toBe(true);
  api.updateQuestProgress('wordAnswered', { word: tagWord, isCorrect: true });
  expect(ja.dailyQuests.list[2].progress).toBe(0); // japán módban a kandzsi-feladat nem halad
  api.setMode('kanji');
  const kanji = win.appData.kanji.words[0];
  api.updateQuestProgress('wordAnswered', { word: kanji, isCorrect: true });
  api.updateQuestProgress('wordAnswered', { word: kanji, isCorrect: true });
  expect(ja.dailyQuests.list[2].completed).toBe(true);
  api.setMode('japanese');
  api.showScreen('home');
  api.renderDailyQuests();
  expect(doc.getElementById('quests-done').textContent).toBe('2 / 3 kész');
  const done = doc.querySelectorAll('#daily-quests-container .dq-item.is-done');
  expect(done).toHaveLength(2);
  expect(done[0].tagName).toBe('DIV'); // a kész feladat nem indítható

  // A lecke nyelvtana: a Befejezés teljesíti
  ja.dailyQuests.list[0] = { id: 'q0', type: 'GrammarRead', target: 1, progress: 0, completed: false, label: 'Olvasd végig az 1. lecke nyelvtanát', params: { lesson: 1 } };
  api.openQuest('q0');
  expect(api.isGrammarOpen()).toBe(true);
  for (let i = 0; i < 20 && api.isGrammarOpen(); i++) api.grammarStep(1);
  expect(ja.dailyQuests.list[0].completed).toBe(true);

  // Esc bezárja az indító lapot
  ja.dailyQuests.list[1] = { id: 'q1', type: 'LearnWords', target: 10, progress: 0, completed: false, label: 'Gyakorolj 10 szót', params: {} };
  api.openQuest('q1');
  expect(modal.classList.contains('open')).toBe(true);
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(modal.classList.contains('open')).toBe(false);
  await wait(600);
});
