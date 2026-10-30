// V13.28: a kiejtés megbízhatósága Androidon és más nem iOS eszközön: a néma feloldó klipp nem állítja le az
// első szót, a Google-hang egyszer újrapróbálkozik, a beépített motor csak a nyelvhez illő hanggal szólhat,
// a hangkimenet ébren marad (a szó eleje nem vész el), és a napló megmutatja, mi történt.
import { afterEach, expect, it, vi } from 'vitest';
import { bootApp } from './harness/boot.js';
import { FIXED_NOW } from './harness/env.js';

class FakeAudioContext {
  static instances = [];
  state = 'suspended';
  destination = {};
  constructor(options) { this.options = options; this.signal = { offset: { value: 1 }, connect: vi.fn(), start: vi.fn() }; FakeAudioContext.instances.push(this); }
  createConstantSource() { return this.signal; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

function fakeSpeech() {
  const spoken = [];
  const synth = { speaking: false, pending: false, speak: u => spoken.push(u), cancel: vi.fn(), getVoices: () => [] };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  return { synth, spoken };
}

afterEach(() => { vi.useRealTimers(); });

it('újrapróbálás, nyelvhez illő tartalék, ébren tartott kimenet és napló', async () => {
  const { api } = await bootApp();
  const { synth, spoken } = fakeSpeech();
  window.AudioContext = FakeAudioContext;
  vi.useRealTimers();
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
  vi.setSystemTime(new Date(FIXED_NOW));
  api.setMode('japanese');
  const audio = api._getTTSAudio();
  audio.pause = vi.fn();

  // A néma feloldó klipp késve ér véget: a közben elindult igazi szót nem állítja le
  let silentDone;
  audio.play = () => new Promise(resolve => { silentDone = resolve; });
  api.unlockAudioPlayback();
  expect(audio.src).toBe(api._TTS_SILENCE);
  const finishSilence = silentDone;
  audio.play = () => new Promise(() => {});
  api.speakWord('えき');
  finishSilence();
  await Promise.resolve();
  await Promise.resolve();
  expect(audio.pause).not.toHaveBeenCalled();
  expect(audio.src).toContain('translate_tts');

  // A feloldás létrehozta a kimenet ébren tartását, ami nem teljes csend, de hallhatatlan
  const output = FakeAudioContext.instances[0];
  expect(FakeAudioContext.instances).toHaveLength(1);
  expect(output.signal.start).toHaveBeenCalled();
  expect(output.signal.offset.value).toBeGreaterThan(0);
  expect(output.signal.offset.value).toBeLessThan(0.0001);

  // Hiba után kis szünettel egyszer újrapróbálja, a beépített motor csak a második hiba után jön
  const failTwice = () => { audio.onerror(); vi.advanceTimersByTime(api.TTS_RETRY_DELAY_MS); audio.onerror(); };
  let plays = 0;
  audio.play = () => { plays++; return new Promise(() => {}); };
  api.speakWord('やま');
  expect(plays).toBe(1);
  audio.onerror();
  expect(plays).toBe(1);
  vi.advanceTimersByTime(api.TTS_RETRY_DELAY_MS);
  expect(plays).toBe(2);
  expect(spoken).toHaveLength(0);
  audio.onerror();
  expect(plays).toBe(2);
  expect(spoken.map(u => [u.text, u.lang])).toEqual([['やま', 'ja-JP']]);

  // Csendnél ugyanez, időkorláttal, de várakozás nélkül: a próba már így is sokat várt
  plays = 0;
  api.speakWord('かわ');
  vi.advanceTimersByTime(api.TTS_START_TIMEOUT_MS);
  expect(plays).toBe(2);
  expect(spoken).toHaveLength(1);
  vi.advanceTimersByTime(api.TTS_START_TIMEOUT_MS);
  expect(spoken.at(-1).text).toBe('かわ');

  // Ha mégis elindul a második próbára, nincs tartalék
  const count = spoken.length;
  api.speakWord('うみ');
  audio.onerror();
  vi.advanceTimersByTime(api.TTS_RETRY_DELAY_MS);
  audio.onplaying();
  vi.advanceTimersByTime(api.TTS_START_TIMEOUT_MS * 2);
  expect(spoken).toHaveLength(count);

  // Az elutasított lejátszást nem próbálja újra
  plays = 0;
  let reject;
  audio.play = () => { plays++; return new Promise((_, r) => { reject = r; }); };
  api.speakWord('そら');
  reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
  await Promise.resolve();
  await Promise.resolve();
  expect(plays).toBe(1);
  expect(spoken.at(-1).text).toBe('そら');
  audio.play = () => new Promise(() => {});

  // Más nyelvű hanggal nem olvas fel: inkább csend és egy csendes jelzés, a gyakorlás megy tovább
  synth.getVoices = () => [{ lang: 'en_US', name: 'English' }, { lang: 'hu-HU', name: 'Magyar' }];
  const ended = vi.fn();
  const before = spoken.length;
  api.speakWord('もり');
  api.setTtsOnEnd(ended);
  failTwice();
  expect(spoken).toHaveLength(before);
  expect(ended).toHaveBeenCalledTimes(1);
  expect(document.getElementById('toast').textContent).toContain('nem érhető el');

  // A nyelvhez a pontos területi hangot választja (nem az elsőt a listából), aláhúzásos alakban is
  synth.getVoices = () => [{ lang: 'en-AU', name: 'Ausztrál' }, { lang: 'en_US', name: 'Amerikai' }, { lang: 'ja-JP', name: 'Japán' }];
  api.setMode('english');
  api.speakWord('train');
  failTwice();
  expect(spoken.at(-1).voice.name).toBe('Amerikai');

  // Ha a készülék beszédmotorja nem jelzi a végét, a várakozó gyakorlás nem akad el
  const stuck = vi.fn();
  api.speakWord('ticket');
  api.setTtsOnEnd(stuck);
  failTwice();
  vi.advanceTimersByTime(5000);
  expect(stuck).toHaveBeenCalledTimes(1);

  // A kimenet tétlenül elalszik; ébresztés után a lejátszás kivárja, hogy ne vesszen el a szó eleje
  vi.advanceTimersByTime(api.OUTPUT_IDLE_MS);
  expect(output.state).toBe('suspended');
  plays = 0;
  audio.play = () => { plays++; return new Promise(() => {}); };
  api.speakWord('station');
  expect(output.state).toBe('running');
  expect(plays).toBe(0);
  vi.advanceTimersByTime(api.OUTPUT_WAKE_MS);
  expect(plays).toBe(1);
  audio.onplaying();

  // Ébren lévő kimenetnél nincs késleltetés
  plays = 0;
  api.speakWord('bridge');
  expect(plays).toBe(1);
  audio.onplaying();

  // Háttérbe kerülve azonnal elalszik
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(output.state).toBe('suspended');
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });

  // Napló: a képernyőképből látszik, melyik hang szólt és miért
  const log = api.ttsDiagnostics().join('\n');
  expect(log).toContain('hangok: ja 1, en 2, hu 0');
  expect(log).toContain('bridge: Google,');
  expect(log).toContain('ticket: eszköz hangja (Amerikai)');
  expect(log).toContain('Google 2. próba');
});
