// iOS 26 standalone: a billentyűzet bezárása után eltolva maradó visualViewport ellensúlyozása,
// hogy a fix sávok (navigáció, dokk) ne csússzanak el. Nyugalomban semmit sem tolunk (V13.21).
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('csak a nyugalmihoz képesti eltolódást ellensúlyozza, nyugalomban és nyitott billentyűzetnél nem tol', async () => {
  const { api, win } = await bootApp();
  const st = { rest: null, full: 0, width: 0 };
  const W = 430, H = 932;
  // Nyugalom: az iOS 26 standalone módban nem nulla offsetTop (pl. 54) sem tolja el a sávokat
  expect(api.viewportShift({ width: W, offsetTop: 54, height: H }, st)).toBe(0);
  expect(api.viewportShift({ width: W, offsetTop: 54, height: H }, st)).toBe(0);
  // Nyitott billentyűzet (a látható magasság lecsökken): nem avatkozunk be
  expect(api.viewportShift({ width: W, offsetTop: 390, height: 560 }, st)).toBe(0);
  // A hiba: a billentyűzet bezárult, de az eltolás 336 px-szel nagyobb maradt → ennyivel toljuk vissza
  expect(api.viewportShift({ width: W, offsetTop: 390, height: H }, st)).toBe(336);
  // Az iOS helyreállt → nincs eltolás
  expect(api.viewportShift({ width: W, offsetTop: 54, height: H }, st)).toBe(0);
  // Tájolásváltás: új nyugalmi állapot
  expect(api.viewportShift({ width: H, offsetTop: 20, height: W }, st)).toBe(0);
  expect(api.viewportShift(null, st)).toBe(0);

  // Kezdőképernyős appként a CSS-változó követi
  const listeners = {};
  const vv = { width: W, offsetTop: 54, height: H, addEventListener: (t, fn) => { listeners[t] = fn; } };
  Object.defineProperty(win, 'visualViewport', { configurable: true, value: vv });
  win.navigator.standalone = true;
  expect(api.initViewportFix()).toBe(true);
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('0px');
  vv.offsetTop = 390;
  api.syncViewportShift();
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('336px');
  vv.offsetTop = 54;
  api.syncViewportShift();
  expect(win.document.documentElement.style.getPropertyValue('--vv-shift')).toBe('0px');
  expect(typeof listeners.scroll).toBe('function');

  // Safariban (nem standalone) nem kapcsol be
  win.navigator.standalone = false;
  expect(api.initViewportFix()).toBe(false);
});
