// V13.35: Lecke-zárás. Egy Dekiru-lecke elkezdett szavai egyszer, vegyes kérdésekkel (jelentés,
// magyarból, gépelés, hallás); a végén a "Még nem ül" lista a kérdésfajtával, az első kör eredménye
// leckénként mentődik, 90%-tól a lecke lezárt (a Kezdőlapról eltűnik, a menüben "lezárva").
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const inLesson = n => w => (Array.isArray(w.lesson) ? w.lesson : [w.lesson]).map(String).includes(String(n));

it('Lecke-zárás: ajánlás, vegyes kérdések, eredmény mentése, lezárt lecke', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const ja = win.appData.japanese;
  // Az 1–2. lecke minden szava elkezdve, a 3. még nem: az aktuális lecke a 3., a zárásra ajánlott a 2.
  ja.words.forEach(w => Object.assign(w.stats, {
    introducedAt: undefined, learnedAt: undefined, practiceLearnedAt: undefined, srs: undefined, streak: 0, totalCorrect: 0, totalWrong: 0
  }));
  ja.words.filter(w => inLesson(1)(w) || inLesson(2)(w)).forEach(w => { w.stats.introducedAt = '2026-11-01'; });
  ja.globalStats.lessonTests = {};
  const lesson2 = ja.words.filter(inLesson(2));

  expect(api.suggestedLessonTest()).toBe(2);
  api.showScreen('home');
  const row = doc.querySelector('#home-current-lesson .lesson-test-btn');
  expect(row.textContent.replace(/\s+/g, ' ')).toContain('2. lecke zárása');
  expect(row.textContent).toContain(`${lesson2.length} szó egyszer, vegyes kérdésekkel`);

  // Indítás: minden szó egyszer, mind a négy kérdésfajta előfordul, toldalékos / több alakú szó nem gépelős és nem hallás
  api.startLessonTest(2);
  const p = ja.practice;
  expect(doc.body.dataset.screen).toBe('practice');
  expect(p.lessonTest).toBe(2);
  expect(p.origin).toBe('home');
  expect([...p.roundWords].sort()).toEqual(lesson2.map(w => w.id).sort());
  const kinds = Object.values(p.mix);
  expect(new Set(kinds)).toEqual(new Set(['meaning', 'reverse', 'typed', 'listen']));
  for (const k of ['meaning', 'reverse', 'typed', 'listen']) expect(kinds.filter(x => x === k).length).toBeGreaterThanOrEqual(Math.floor(lesson2.length / 4) - 3);
  const tricky = lesson2.filter(w => /^[~〜]|[~〜]$|\//.test(w.en));
  tricky.forEach(w => expect(['typed', 'listen']).not.toContain(p.mix[w.id]));
  expect(doc.getElementById('round-badge').textContent).toBe('2. lecke zárása');

  // Minden kérdés a saját fajtájával és irányával jelenik meg
  const expectKind = () => {
    const word = ja.words.find(w => w.id === p.roundWords[p.currentIdx]);
    const k = api.LESSON_TEST_KINDS[p.mix[word.id]];
    expect([p.type, p.direction]).toEqual([k.type, k.direction]);
    if (k.type === 'hardcore') expect(doc.getElementById('hardcore-input')).not.toBeNull();
    if (k.type === 'listening') expect(doc.querySelector('.listen-stage')).not.toBeNull();
    return word;
  };
  for (let i = 0; i < 4; i++) { p.currentIdx = i; api.showQuestion(); expectKind(); }

  // Az első kérdés rossz (Nem tudom), a többit leszámoljuk; 1 hiba → a pontosság a lecke méretétől függ
  p.currentIdx = 0; api.showQuestion();
  const first = expectKind();
  if (p.type === 'hardcore') api.revealHardcoreAnswer(first.id);
  else api.checkAnswer(null, null, p.direction === 'hu-en' ? first.en : first.hu);
  expect(p.errorList).toEqual([first.id]);
  p.currentIdx = p.roundWords.length;
  p.roundCorrect = p.roundWords.length - 1;
  api.showRoundEnd();
  const pct = Math.round((p.roundWords.length - 1) / p.roundWords.length * 100);
  expect(ja.globalStats.lessonTests['2']).toEqual({ date: '2026-09-29', pct, total: lesson2.length, best: pct });
  expect(doc.querySelector('#screen-round-end .round-end').classList.contains('is-lesson-test')).toBe(true);
  expect(doc.getElementById('re-title').textContent).toBe(pct >= 90 ? '2. lecke lezárva' : '2. lecke zárása');
  expect(doc.getElementById('err-title').textContent).toBe('Még nem ül');
  const missed = doc.querySelector('#error-list-items .re-err');
  expect(missed.querySelector('.re-err-word').firstChild.textContent).toBe(first.en);
  expect(missed.querySelector('.re-err-kind').textContent).toBe(api.LESSON_TEST_KINDS[p.mix[first.id]].label);
  expect(doc.getElementById('re-actions').textContent).toContain('Hibásak még egyszer · 1 szó');

  // A hibás szavak köre ugyanazzal a kérdésfajtával; a második kör nem írja felül az eredményt
  api.startNextRound();
  const p2 = ja.practice;
  expect(p2.roundWords).toEqual([first.id]);
  expect(doc.getElementById('round-badge').textContent).toBe('2. kör · hibásak');
  expect(api.LESSON_TEST_KINDS[p2.mix[first.id]].type).toBe(p2.type);
  p2.currentIdx = 1; p2.roundCorrect = 1;
  api.showRoundEnd();
  expect(ja.globalStats.lessonTests['2'].pct).toBe(pct);
  expect(doc.getElementById('re-title').textContent).toBe('A hibásak is mennek');
  api.finishSession();
  expect(doc.body.dataset.screen).toBe('home');
  expect(doc.getElementById('toast').textContent).toContain('2. lecke zárása mentve');

  // Gyakorlás fül: egy lecke kiválasztva → a zárás sora, több vagy egy sem → nincs
  api.setLessonFilter('2');
  const slot = doc.getElementById('lesson-test-slot');
  expect(slot.hidden).toBe(false);
  expect(slot.textContent).toContain('2. lecke zárása');
  if (pct < 90) expect(slot.textContent).toContain(`Legutóbb ${pct}%`);
  api.setLessonFilter('all');
  expect(slot.hidden).toBe(true);

  // Lezárt lecke: a Kezdőlapról eltűnik, a menüben és a Statisztikában "lezárva"
  ja.globalStats.lessonTests['2'] = { date: '2026-09-29', pct: 95, total: lesson2.length, best: 95 };
  expect(api.isLessonClosed(2)).toBe(true);
  expect(api.suggestedLessonTest()).toBeNull();
  api.showScreen('home');
  expect(doc.querySelector('#home-current-lesson .lesson-test-btn')).toBeNull();
  expect(api.lessonMenuHtml()).toMatch(/2\. lecke[\s\S]*?lezárva/);
  api.setLessonFilter('2');
  expect(slot.textContent).toContain('Lezárva · legjobb 95%');
  api.renderDekiruLessonStats();
  expect(doc.getElementById('dekiru-lesson-list').textContent).toContain('lezárva 95%');

  // Sima gyakorlás kör vége: nincs Lecke-zárás elrendezés
  ja.practice = { type: 'classic', roundNumber: 1, roundWords: [first.id], currentIdx: 1, errorList: [], roundCorrect: 1, roundWrong: 0,
    sessionCorrect: 1, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now() };
  api.showRoundEnd();
  expect(doc.querySelector('#screen-round-end .round-end').classList.contains('is-lesson-test')).toBe(false);

  // Angol módban nincs Lecke-zárás
  api.setMode('english');
  expect(api.suggestedLessonTest()).toBeNull();
  api.setMode('japanese');
});
