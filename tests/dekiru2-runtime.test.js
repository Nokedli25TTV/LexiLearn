import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

it('a Dekiru 2 betöltése az ismétlődő szavakat jelentéssel, témákkal és leckékkel egyesíti', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);

  const words = win.appData.japanese.words;
  expect(words).toHaveLength(4257);
  const au = words.find(word => word.en === 'あう');
  expect(au.lesson).toEqual([6, 25, 31]);
  expect(au.hu).toContain('találkozik');
  expect(au.hu).toContain('megfelel');
  expect(au.tags).toContain('igék');
  api.setMode('japanese');
  expect(api.getLessonOptions().at(-1)?.value).toBe('48');
});
