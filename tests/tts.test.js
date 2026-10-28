// V13.25: a kiejtés mindhárom nyelven a Google-hangon szól a feloldott <audio> elemen, Referer fejléc nélkül
// (iOS-en ezt a némító kapcsoló nem némítja el); a beépített beszédmotor csak tartalék: hiba, elutasított
// lejátszás vagy 4 mp csend után, és egy szónál csak egyszer.
import { afterEach, expect, it, vi } from 'vitest';
import { bootApp } from './harness/boot.js';
import { FIXED_NOW } from './harness/env.js';

function fakeSpeech() {
  const spoken = [];
  const synth = { speaking: false, pending: false, speak: u => spoken.push(u), cancel: vi.fn(), getVoices: () => [] };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  return { synth, spoken };
}

afterEach(() => { vi.useRealTimers(); });

it('nyelvenként a Google-hang, tartalék a beépített motor (egyszer), időkorláttal', async () => {
  const { api } = await bootApp();
  const { synth, spoken } = fakeSpeech();
  const audio = api._getTTSAudio();
  // Hivatkozó nélkül: a Google-hang más oldal Referer fejlécére 404-et ad (emiatt volt néma a kiejtés)
  expect(audio.ownerDocument).not.toBe(document);
  expect(audio.ownerDocument.querySelector('meta[name="referrer"]').content).toBe('no-referrer');
  expect(document.querySelectorAll('iframe[title="Kiejtés"]')).toHaveLength(1);
  expect(api._getTTSAudio()).toBe(audio);
  let play = () => new Promise(() => {}); // „függő” lejátszás: se hiba, se hang
  audio.play = () => play();
  // A harness már a dátumot hamisítja; a setTimeout-tal együtt újra kell kezdeni
  vi.useRealTimers();
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });
  vi.setSystemTime(new Date(FIXED_NOW));

  // Japán: kana, lassított tempó
  api.setMode('japanese');
  api.speakWord('えき');
  expect(audio.src).toContain('tl=ja');
  expect(audio.src).toContain('ttsspeed=0.85');
  expect(decodeURIComponent(audio.src)).toContain('q=えき');
  expect(synth.cancel).not.toHaveBeenCalled(); // nem szólt semmi, nincs mit leállítani

  // 4 mp csend után a tartalék szól, japánul
  vi.advanceTimersByTime(4000);
  expect(spoken.map(u => [u.text, u.lang])).toEqual([['えき', 'ja-JP']]);

  // Angol és magyar is a Google-hangon
  api.setMode('english');
  api.speakWord('station');
  expect(audio.src).toContain('tl=en');
  expect(audio.src).not.toContain('ttsspeed');
  api.speakWord('állomás', true);
  expect(audio.src).toContain('tl=hu');

  // Ha elindult a hang, az időkorlát nem indít tartalékot; a vége lezárja a szót
  const ended = vi.fn();
  api.speakWord('train');
  api.setTtsOnEnd(ended);
  audio.onplaying();
  vi.advanceTimersByTime(5000);
  expect(spoken).toHaveLength(1);
  audio.onended();
  expect(ended).toHaveBeenCalledTimes(1);

  // Hiba és elutasított lejátszás együtt: a tartalék csak egyszer szól
  let reject;
  play = () => new Promise((_, r) => { reject = r; });
  api.speakWord('ticket');
  audio.onerror();
  reject(new Error('NotAllowedError'));
  await Promise.resolve();
  vi.advanceTimersByTime(5000);
  expect(spoken.map(u => [u.text, u.lang])).toEqual([['えき', 'ja-JP'], ['ticket', 'en-US']]);

  // Egy elavult szó tartaléka nem szólal meg az új helyett
  api.speakWord('first');
  api.speakWord('second');
  vi.advanceTimersByTime(4000);
  expect(spoken.map(u => u.text).slice(-1)).toEqual(['second']);

  // Hosszú szöveg (mondat) egyből a beépített motorral
  const long = 'This is a very long example sentence. '.repeat(6);
  api.speakWord(long);
  expect(spoken.at(-1).text).toBe(long);

  // Ha szól valami, az új szó előtt leállítja
  synth.speaking = true;
  api.speakWord('stop');
  expect(synth.cancel).toHaveBeenCalledTimes(1);
});
