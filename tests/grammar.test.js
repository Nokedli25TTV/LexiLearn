// V13.35: a lecke nyelvtana a teljes appal. A Gyakorlás fülön egy lecke kiválasztva megjelenik a
// sor; V13.62 óta teljes képernyős, lépésenként lapozható olvasó: fent töltődő csík és Tartalom,
// szerkezetenként egy lépés (példák felolvasással, buktató), alul Vissza / Következő, az utolsó
// lépésen Befejezés. Escape bezárja (nyitott Tartalomnál előbb azt). Angol módban nincs nyelvtan.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('nyelvtan sor a Gyakorlás fülön, lapozó olvasó, tartalom, felolvasás, bezárás', async () => {
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

  // Az olvasó: cím, első lépés, csík, számláló, a Vissza letiltva
  api.openGrammar(4);
  const modal = doc.getElementById('grammar-modal');
  const body = doc.getElementById('grammar-body');
  const step = () => body.querySelector('.gr-step');
  const count = () => doc.getElementById('gr-count').textContent;
  expect(modal.classList.contains('open')).toBe(true);
  expect(doc.documentElement.classList.contains('gr-lock')).toBe(true);
  expect(doc.getElementById('grammar-title').textContent).toBe('4. lecke · Vásárlás');
  expect(count()).toBe('1 / 7');
  expect(step().querySelector('.gr-pattern .gr-nb').textContent).toBe('～つ');
  expect(step().querySelector('.gr-name').textContent).toBe('Számlálószavak');
  expect(doc.getElementById('gr-prev').disabled).toBe(true);
  expect(doc.getElementById('gr-fill').style.transform).toBe(`scaleX(${1 / 7})`);
  expect(body.querySelector('.gr-track').getAttribute('aria-valuenow')).toBe('1');

  // Következő: második lépés, a Vissza él
  api.grammarStep(1);
  expect(count()).toBe('2 / 7');
  expect(step().querySelector('.gr-name').textContent).toBe('Kérés vásárláskor');
  expect(doc.getElementById('gr-prev').disabled).toBe(false);
  api.grammarStep(-1);
  expect(count()).toBe('1 / 7');

  // Tartalom: a szerkezetek listája, ugrás a hatodikra (példák, buktató, felolvasás)
  api.toggleGrammarToc();
  const toc = doc.getElementById('gr-toc');
  expect(toc.hidden).toBe(false);
  expect(doc.getElementById('gr-toc-btn').getAttribute('aria-expanded')).toBe('true');
  const items = [...toc.querySelectorAll('.gr-toc-item')];
  expect(items).toHaveLength(7);
  expect(items[0].classList.contains('is-current')).toBe(true);
  expect(items[5].querySelector('.gr-toc-name').textContent).toBe('Tagadó kérdés');
  const nav = [...toc.querySelectorAll('.gr-nav-btn')].map(b => [b.textContent.trim(), b.getAttribute('onclick')]);
  expect(nav).toEqual([['3. lecke', 'openGrammar(3)'], ['5. lecke', 'openGrammar(5)']]);
  api.grammarGo(5);
  expect(toc.hidden).toBe(true);
  expect(count()).toBe('6 / 7');
  expect(step().querySelectorAll('.gr-ex')).toHaveLength(3);
  expect(step().querySelector('.wi-sec.is-watch')).not.toBeNull();
  expect(step().querySelector('.gr-speak').getAttribute('onclick')).toBe('speakGrammar(4, 5, 0)');
  expect(items[5].getAttribute('aria-current')).toBe('step');

  // Nyílbillentyű lapoz; Escape előbb a Tartalmat zárja
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(count()).toBe('7 / 7');
  expect(doc.getElementById('gr-next').textContent).toBe('Befejezés');
  expect(body.querySelector('.gr-next-lesson').textContent).toContain('5. lecke nyelvtana');
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(modal.classList.contains('open')).toBe(true); // az utolsó lépésen a nyíl nem zár be
  api.toggleGrammarToc(true);
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(doc.getElementById('gr-toc').hidden).toBe(true);
  expect(modal.classList.contains('open')).toBe(true);

  // Befejezés: bezárja az olvasót
  api.grammarStep(1);
  expect(modal.classList.contains('open')).toBe(false);
  expect(doc.documentElement.classList.contains('gr-lock')).toBe(false);

  // Másik lecke: elölről indul, az első leckénél nincs „előző”
  api.openGrammar(1);
  expect(modal.classList.contains('open')).toBe(true);
  expect(doc.getElementById('grammar-title').textContent).toBe('1. lecke · Bemutatkozás');
  expect(count()).toBe('1 / 6');
  expect([...body.querySelectorAll('#gr-toc .gr-nav-btn')].map(b => b.textContent.trim())).toEqual(['2. lecke']);
  expect(api.openGrammarLesson()).toBe(1);
  expect(api.grammarStepIndex()).toBe(0);

  // Felolvasás: a példa japán szövege (a ragozási nyíl helyett szünet)
  win.speechSynthesis = { speak: () => {}, cancel: () => {}, speaking: false, pending: false, getVoices: () => [] };
  expect(() => api.speakGrammar(6, 0, 0)).not.toThrow();

  // Escape bezárja
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(modal.classList.contains('open')).toBe(false);

  // Nem létező lecke: nincs nyelvtan, az olvasó nem nyílik meg
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
