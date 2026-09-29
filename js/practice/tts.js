// LexiLearn – practice/tts.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode } from '../core/state.js';

/* ══════════════════════════════════════════════════════
   V9: PRÉMIUM TTS HANG FELOLVASÓ
   - Google Translate TTS japánhoz (kanji-mentes, precíz kiejtés)
   - Kana prioritás: word.en = kana japán módban → automatikusan helyes
   - Audio blokkolás: helyes válasz után bevárja a hang végét
══════════════════════════════════════════════════════ */
let _currentTTSAudio = null; // Aktuális Google TTS Audio elem referenciája
let _ttsVersion = 0;          // Race condition védelem verziószámlálóval
let _ttsOnEnd = null;         // Hang befejezésekor futó callback (advance logika)

/* ── iOS / standalone (kezdőképernyős Safari app) audio-unlock ──
   iOS-en – főleg „Add to Home Screen" appként – a hang néma marad, amíg egy
   VALÓDI felhasználói érintésen belül fel nem oldjuk az audiót. Ezért az ELSŐ
   koppintáskor: (1) feloldunk egy ÚJRAHASZNÁLT <audio> elemet egy néma klippel
   (ezt használja a Google-TTS is), (2) felébresztjük a speechSynthesis-t.
   Enélkül az auto-lejátszás (setTimeout → kiesik a gesture-láncból) néma. */
const _TTS_SILENCE = 'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==';
let _ttsAudioEl = null;
let _audioUnlocked = false;

function _getTTSAudio() {
  if (!_ttsAudioEl) {
    _ttsAudioEl = new Audio();
    _ttsAudioEl.setAttribute('playsinline', ''); // iOS: ne ugorjon teljes képernyős lejátszóba
    _ttsAudioEl.preload = 'auto';
  }
  return _ttsAudioEl;
}

function unlockAudioPlayback() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  // 1) HTMLAudio elem feloldása néma klippel
  try {
    const a = _getTTSAudio();
    a.src = _TTS_SILENCE;
    const p = a.play();
    if (p && p.then) p.then(() => { try { a.pause(); a.currentTime = 0; } catch (e) {} }).catch(() => {});
  } catch (e) {}
  // 2) speechSynthesis felébresztése (standalone-ban gyakran néma a fallback enélkül)
  try {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {}
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
    window.removeEventListener(ev, unlockAudioPlayback, { capture: true }));
}
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
  window.addEventListener(ev, unlockAudioPlayback, { capture: true }));

function _onTTSFinished(version) {
  if (_ttsVersion !== version) return; // Elavult esemény → figyelmen kívül
  _currentTTSAudio = null;
  const cb = _ttsOnEnd;
  setTtsOnEnd(null);
  if (cb) cb();
}

function speakWord(text, forceHungarian = false) {
  _ttsVersion++;
  const ver = _ttsVersion;

  // Előző hang azonnali leállítása (kezelők nullázása, hogy a reuse miatt ne süljön
  // el a régi onerror/onended – különben szellem-fallback szólalna meg)
  if (_currentTTSAudio) {
    try { _currentTTSAudio.onended = null; _currentTTSAudio.onerror = null; _currentTTSAudio.pause(); } catch(e) {}
    _currentTTSAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (!text || typeof text !== 'string' || !text.trim()) {
    _onTTSFinished(ver); return;
  }

  // Japán módban (en-hu irányban): kana prioritás – word.en IS kana az adatstruktúrában
  const isJapanese = currentMode !== 'english' && !forceHungarian;

  // Fallback: böngésző beépített SpeechSynthesis
  function useSpeechSynthesis() {
    if (!window.speechSynthesis) { _onTTSFinished(ver); return; }
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (isJapanese) {
      u.lang = 'ja-JP';
      const jpVoice = voices.find(v => v.lang.includes('ja') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
                   || voices.find(v => v.lang.includes('ja'));
      if (jpVoice) u.voice = jpVoice;
      u.rate = 0.9;
    } else {
      u.lang = forceHungarian ? 'hu-HU' : 'en-US';
      u.rate = 1.0;
    }
    u.onend  = () => _onTTSFinished(ver);
    u.onerror = (e) => { console.log('[TTS] SpeechSynthesis hiba:', e); _onTTSFinished(ver); };
    window.speechSynthesis.speak(u);
  }

  if (isJapanese) {
    // Google Translate TTS – pontosabb japán kiejtés, kana alapú, on/kun keveredés nélkül.
    // ÚJRAHASZNÁLT (előre feloldott) elem – iOS standalone-ban csak így szól megbízhatóan.
    const audio = _getTTSAudio();
    audio.onended = null; audio.onerror = null; // tiszta lap a reuse miatt
    const encoded = encodeURIComponent(text);
    audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ja&client=gtx&ttsspeed=0.85`;
    _currentTTSAudio = audio;
    // Védőkapcsoló: az onerror és a play().catch() egyszerre is elsülhet hiba esetén –
    // enélkül a fallback kétszer fut, és a hang 2x szólalna meg.
    let _settled = false;
    const fallback = () => {
      if (_settled) return;
      _settled = true;
      _currentTTSAudio = null;
      useSpeechSynthesis();
    };
    audio.onended = () => {
      if (_settled) return;
      _settled = true;
      _onTTSFinished(ver);
    };
    audio.onerror = fallback;
    const _p = audio.play();
    if (_p && _p.then) _p.catch(fallback);
  } else {
    useSpeechSynthesis();
  }
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// A gyakorló motor ezen keresztül kér értesítést a hang végéről
function setTtsOnEnd(fn) { _ttsOnEnd = fn; }

export { _TTS_SILENCE, _audioUnlocked, _currentTTSAudio, _getTTSAudio, _onTTSFinished, _ttsAudioEl, _ttsOnEnd, _ttsVersion, setTtsOnEnd, speakWord, unlockAudioPlayback };
