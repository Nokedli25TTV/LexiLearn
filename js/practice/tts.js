// LexiLearn – practice/tts.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode } from '../core/state.js';

/* ══════════════════════════════════════════════════════
   V9: PRÉMIUM TTS HANG FELOLVASÓ
   - Google Translate TTS japánhoz (kanji-mentes, precíz kiejtés)
   - Kana prioritás: word.en = kana japán módban → automatikusan helyes
   - Audio blokkolás: helyes válasz után bevárja a hang végét
   V13.25: az angol és a magyar is a Google-hangon szól (ugyanazon a feloldott <audio> elemen). iOS-en a
   beépített beszédmotort (speechSynthesis) a némító kapcsoló elnémítja, az <audio> lejátszást nem; így a
   beépített motor csak tartalék. Ha a hang 4 mp alatt sem indul el (se hiba, se lejátszás), a tartalék szól.
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
/* ── V13.18: Zene mellett – a kiejtés ne állítsa meg a háttérben szóló zenét (pl. Spotify) ──
   iOS-en az <audio> lejátszás médialejátszásnak számít, ezért a rendszer megállítja a másik
   app zenéjét. Az Audio Session API 'ambient' típusával a kiejtés a zenére keveredik.
   Ára: ilyenkor az iPhone némító kapcsolója a kiejtést is elnémítja, ezért kapcsolható,
   eszközönkénti beállítás (localStorage, nem szinkronizálódik). Safari 16.4-től érhető el. */
const MIX_AUDIO_KEY = 'lexi_mix_audio';
let _mixWithMusic = false;
try { _mixWithMusic = localStorage.getItem(MIX_AUDIO_KEY) === '1'; } catch (e) { /* privát mód */ }

let _ttsFrame = null; // V13.25: a kiejtés rejtett kerete (lásd lent)

const canMixWithMusic = () => typeof navigator !== 'undefined' && !!navigator.audioSession;
function applyAudioSession() {
  const type = _mixWithMusic ? 'ambient' : 'auto';
  try { if (canMixWithMusic()) navigator.audioSession.type = type; } catch (e) { /* régi WebKit */ }
  try { const n = _ttsFrame && _ttsFrame.contentWindow && _ttsFrame.contentWindow.navigator; if (n && n.audioSession) n.audioSession.type = type; } catch (e) { /* nincs keret */ }
}
applyAudioSession();

function isMixWithMusic() { return _mixWithMusic; }
function setMixWithMusic(on) {
  _mixWithMusic = !!on;
  try { localStorage.setItem(MIX_AUDIO_KEY, _mixWithMusic ? '1' : '0'); } catch (e) { /* privát mód */ }
  applyAudioSession();
}

const TTS_START_TIMEOUT_MS = 4000;
const TTS_MAX_CHARS = 180; // a Google-hang ennél hosszabb szöveget nem olvas fel egyben

function googleTtsUrl(text, lang) {
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx${lang === 'ja' ? '&ttsspeed=0.85' : ''}`;
}

/* ── V13.25: hivatkozó (Referer) nélküli lejátszás ──
   A Google-hang 404-et ad, ha a kérés egy másik oldal címét viszi Referer fejlécben (pl. a GitHub Pages
   címét): emiatt nem szólt hosszú ideje a kiejtés, a tartalék beépített motort pedig iPhone-on a némító
   kapcsoló elnémítja. Az <audio> elemnek nincs saját referrerPolicy-ja, ezért egy rejtett, azonos eredetű
   keret dokumentumában jön létre, ahol a no-referrer csak erre vonatkozik (a Firebase és az oldal többi
   kérése nem változik). */
function _ttsDocument() {
  if (_ttsFrame && _ttsFrame.isConnected && _ttsFrame.contentDocument) return _ttsFrame.contentDocument;
  try {
    const f = document.createElement('iframe');
    f.hidden = true;
    f.tabIndex = -1;
    f.title = 'Kiejtés';
    f.setAttribute('aria-hidden', 'true');
    document.body.appendChild(f);
    const d = f.contentDocument;
    const meta = d.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    (d.head || d.documentElement).appendChild(meta);
    _ttsFrame = f;
    return d;
  } catch (e) {
    return document; // keret nélkül is szóljon, ahol a hivatkozó nem számít
  }
}

const _TTS_SILENCE = 'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==';
let _ttsAudioEl = null;
let _audioUnlocked = false;

function _getTTSAudio() {
  if (!_ttsAudioEl || (_ttsFrame && !_ttsFrame.isConnected)) {
    _ttsAudioEl = _ttsDocument().createElement('audio');
    _ttsAudioEl.setAttribute('playsinline', ''); // iOS: ne ugorjon teljes képernyős lejátszóba
    _ttsAudioEl.preload = 'auto';
  }
  return _ttsAudioEl;
}

function unlockAudioPlayback() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  applyAudioSession(); // a néma feloldó klipp se állítsa meg a zenét
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
  applyAudioSession();
  _ttsVersion++;
  const ver = _ttsVersion;

  // Előző hang azonnali leállítása (kezelők nullázása, hogy a reuse miatt ne süljön
  // el a régi onerror/onended – különben szellem-fallback szólalna meg)
  if (_currentTTSAudio) {
    try { _currentTTSAudio.onended = null; _currentTTSAudio.onerror = null; _currentTTSAudio.pause(); } catch(e) {}
    _currentTTSAudio = null;
  }
  // iOS: a cancel() utáni azonnali speak() néha elnyelődik, ezért csak akkor állítjuk le, ha szól valami
  if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) window.speechSynthesis.cancel();

  if (!text || typeof text !== 'string' || !text.trim()) {
    _onTTSFinished(ver); return;
  }

  // Japán módban (en-hu irányban): kana prioritás – word.en IS kana az adatstruktúrában
  const lang = forceHungarian ? 'hu' : currentMode !== 'english' ? 'ja' : 'en';

  // Tartalék: a böngésző beépített beszédmotorja
  function useSpeechSynthesis() {
    if (_ttsVersion !== ver) return; // közben már másik szó szól
    if (!window.speechSynthesis) { _onTTSFinished(ver); return; }
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    u.lang = { ja: 'ja-JP', hu: 'hu-HU', en: 'en-US' }[lang];
    const voice = (lang === 'ja' && voices.find(v => v.lang.includes('ja') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))))
               || voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
    if (voice) u.voice = voice;
    u.rate = lang === 'ja' ? 0.9 : 1.0;
    u.onend  = () => _onTTSFinished(ver);
    u.onerror = (e) => { console.log('[TTS] SpeechSynthesis hiba:', e); _onTTSFinished(ver); };
    window.speechSynthesis.speak(u);
  }

  if (text.length > TTS_MAX_CHARS) { useSpeechSynthesis(); return; }

  // Google Translate TTS – pontos kiejtés (japánnál kana alapú, on/kun keveredés nélkül).
  // ÚJRAHASZNÁLT (előre feloldott) elem – iOS standalone-ban csak így szól megbízhatóan.
  const audio = _getTTSAudio();
  audio.onended = null; audio.onerror = null; audio.onplaying = null; // tiszta lap a reuse miatt
  audio.src = googleTtsUrl(text, lang);
  _currentTTSAudio = audio;
  // Védőkapcsoló: az onerror, a play().catch() és az időkorlát egyszerre is elsülhet –
  // enélkül a tartalék többször futna, és a hang kétszer szólalna meg.
  let _settled = false;
  let _started = false;
  const fallback = () => {
    if (_settled || _ttsVersion !== ver) return;
    _settled = true;
    try { audio.onplaying = null; audio.pause(); } catch (e) { /* már leállt */ }
    _currentTTSAudio = null;
    useSpeechSynthesis();
  };
  audio.onplaying = () => { _started = true; };
  audio.onended = () => {
    if (_settled) return;
    _settled = true;
    _onTTSFinished(ver);
  };
  audio.onerror = fallback;
  // Se hiba, se hang (pl. elakadt kérés): ne maradjon néma a gyakorlás
  setTimeout(() => { if (!_started) fallback(); }, TTS_START_TIMEOUT_MS);
  const _p = audio.play();
  if (_p && _p.then) _p.catch(fallback);
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// A gyakorló motor ezen keresztül kér értesítést a hang végéről
function setTtsOnEnd(fn) { _ttsOnEnd = fn; }

export { TTS_START_TIMEOUT_MS, _TTS_SILENCE, _audioUnlocked, googleTtsUrl, applyAudioSession, canMixWithMusic, isMixWithMusic, setMixWithMusic, _currentTTSAudio, _getTTSAudio, _onTTSFinished, _ttsAudioEl, _ttsOnEnd, _ttsVersion, setTtsOnEnd, speakWord, unlockAudioPlayback };
