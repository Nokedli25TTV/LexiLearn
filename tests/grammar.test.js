// V13.35: a lecke nyelvtana a teljes appal. A Gyakorlás fülön egy lecke kiválasztva megjelenik a
// sor; az alulról nyíló lapon a szerkezetek kinyitható sorokban, a példák felolvashatók, alul az
// előző és a következő lecke; Escape-re bezárul. Nyelvtan nélküli leckénél és angol módban nincs sor.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('nyelvtan sor a Gyakorlás fülön, lap lapozással, felolvasás, bezárás', async () => {
  const { api, win } = await bootApp();
  const doc = win.document;
  api.setMode('japanese');
  const slot = doc.getElementById('lesson-tools-slot');

  // Egy lecke kiválasztva: a nyelvtan sora a zárás előtt, a szerkezetek számával
  api.setLessonFilter('4');
  const row = slot.querySelector('.lesson-grammar-btn');
  expect(row).not.toBeNull();
  expect(slot.firstElementChild).toBe(row);
  expect(row.textContent.replace(/\s+/g, ' ')).toContain('4. lecke nyelvtana');
  expect(row.textContent).toContain('7 szerkezet');
  expect(row.getAttribute('onclick')).toBe('openGrammar(4)');

  // A lap: cím, kinyitható pontok, példák, buktató, lapozás
  api.openGrammar(4);
  const modal = doc.getElementById('grammar-modal');
  const body = doc.getElementById('grammar-body');
  expect(modal.classList.contains('open')).toBe(true);
  expect(doc.getElementById('grammar-title').textContent).toBe('4. lecke · Vásárlás');
  const points = [...body.querySelectorAll('details.gr-point')];
  expect(points).toHaveLength(7);
  expect(points.every(d => !d.open)).toBe(true);
  expect(points[5].querySelector('.gr-name').textContent).toBe('Tagadó kérdés');
  expect(points[5].querySelectorAll('.gr-ex')).toHaveLength(3);
  expect(points[5].querySelector('.wi-sec.is-watch')).not.toBeNull();
  expect(points[0].querySelector('.gr-pattern .gr-nb').textContent).toBe('～つ');
  expect(points[5].querySelector('.gr-speak').getAttribute('onclick')).toBe('speakGrammar(4, 5, 0)');
  const nav = [...body.querySelectorAll('.gr-nav-btn')].map(b => [b.textContent.trim(), b.getAttribute('onclick')]);
  expect(nav).toEqual([['3. lecke', 'openGrammar(3)'], ['5. lecke', 'openGrammar(5)']]);

  // Lapozás a lapon belül: nyitva marad, az első leckénél nincs „előző”
  api.openGrammar(1);
  expect(modal.classList.contains('open')).toBe(true);
  expect(doc.getElementById('grammar-title').textContent).toBe('1. lecke · Bemutatkozás');
  expect([...body.querySelectorAll('.gr-nav-btn')].map(b => b.textContent.trim())).toEqual(['2. lecke']);
  expect(api.openGrammarLesson()).toBe(1);

  // Felolvasás: a példa japán szövege (a ragozási nyíl helyett szünet)
  win.speechSynthesis = { speak: () => {}, cancel: () => {}, speaking: false, pending: false, getVoices: () => [] };
  expect(() => api.speakGrammar(6, 0, 0)).not.toThrow();

  // Escape bezárja
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(modal.classList.contains('open')).toBe(false);

  // Nem létező lecke: nincs nyelvtan, a lap nem nyílik meg
  expect(api.hasGrammar(99)).toBe(false);
  api.openGrammar(99);
  expect(modal.classList.contains('open')).toBe(false);

  // Több lecke kiválasztva: nincs sor
  api.setLessonFilter('4');
  api.toggleLesson('5');
  expect(slot.hidden).toBe(true);

  // Angol módban nincs nyelvtan
  api.setMode('english');
  expect(api.hasGrammar(4)).toBe(false);
  api.setMode('japanese');
  expect(api.hasGrammar(4)).toBe(true);
});
