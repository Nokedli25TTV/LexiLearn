// iOS 26 standalone: a billentyűzet bezárása után eltolva maradó visualViewport ellensúlyozása,
// hogy a fix sávok (navigáció, dokk) ne csússzanak a képernyő közepére.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a sávok eltolása a látható terület eltolódását követi, nyitott billentyűzetnél nem tol', async () => {
  const { api, win } = await bootApp();
  const H = 844;
  // Az iOS-hiba: a billentyűzet bezárult (teljes magasság), de a látható terület 336 px-szel lejjebb maradt
  expect(api.viewportShift({ offsetTop: 336, height: H }, H)).toBe(336);
  // Rendben lévő állapot
  expect(api.viewportShift({ offsetTop: 0, height: H }, H)).toBe(0);
  expect(api.viewportShift({ offsetTop: 0.4, height: H }, H)).toBe(0);
  // Nyitott billentyűzet: nem avatkozunk be
  expect(api.viewportShift({ offsetTop: 200, height: 480 }, H)).toBe(0);
  expect(api.viewportShift(null, H)).toBe(0);

  // Kezdőképernyős appként a CSS-változó követi a látható területet
  const listeners = {};
  const vv = { offsetTop: 0, height: H, addEventListener: (t, fn) => { listeners[t] = fn; } };
  Object.defineProperty(win, 'visualViewport', { configurable: true, value: vv });
  Object.defineProperty(win.document.documentElement, 'clientHeight', { configurable: true, value: H });
  win.navigator.standalone = true;
  expect(api.initViewportFix()).toBe(true);
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('0px');
  vv.offsetTop = 336;
  api.syncViewportShift();
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('336px');
  vv.offsetTop = 0;
  api.syncViewportShift();
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('0px');
  expect(typeof listeners.scroll).toBe('function');

  // Safariban (nem standalone) nem kapcsol be
  win.navigator.standalone = false;
  expect(api.initViewportFix()).toBe(false);
});
