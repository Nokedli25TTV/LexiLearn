// Zene mellett: a kiejtés az Audio Session API 'ambient' típusával a háttérzenére keveredik
// (iOS-en így nem áll meg a Spotify). Eszközönkénti, kapcsolható beállítás.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('a Zene mellett kapcsoló az audioSession típusát állítja, és megmarad', async () => {
  const session = { type: 'auto' };
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: session });
  const { api, win } = await bootApp();
  const sw = win.document.getElementById('mix-audio-switch');

  api.showScreen('profile');
  expect(sw.hidden).toBe(false);
  expect(sw.getAttribute('aria-checked')).toBe('false');
  expect(win.document.getElementById('mix-audio-unsupported').hidden).toBe(true);

  api.toggleMixAudio();
  expect(session.type).toBe('ambient');
  expect(localStorage.getItem('lexi_mix_audio')).toBe('1');
  expect(sw.getAttribute('aria-checked')).toBe('true');

  // Lejátszás előtt is érvényesül (pl. ha a rendszer közben visszaállította)
  session.type = 'auto';
  api.speakWord('えき');
  expect(session.type).toBe('ambient');

  api.toggleMixAudio();
  expect(session.type).toBe('auto');
  expect(localStorage.getItem('lexi_mix_audio')).toBe('0');

  // Ahol nincs Audio Session API, a kapcsoló helyett magyarázat látszik
  delete navigator.audioSession;
  api.renderProfile();
  expect(sw.hidden).toBe(true);
  expect(win.document.getElementById('mix-audio-unsupported').hidden).toBe(false);
});
