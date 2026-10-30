// LexiLearn – practice/tts.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode } from '../core/state.js';
import { showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   V9: PRÉMIUM TTS HANG FELOLVASÓ
   - Google Translate TTS japánhoz (kanji-mentes, precíz kiejtés)
   - Kana prioritás: word.en = kana japán módban → automatikusan helyes
   - Audio blokkolás: helyes válasz után bevárja a hang végét
   V13.25: az angol és a magyar is a Google-hangon szól (ugyanazon a feloldott <audio> elemen). iOS-en a
   beépített beszédmotort (speechSynthesis) a némító kapcsoló elnémítja, az <audio> lejátszást nem; így a
   beépített motor csak tartalék.
   V13.28: Android és a többi nem iOS eszköz: a Google-hang nem tölthető le előre (nincs CORS) és nem
   gyorsítótárazható (no-store), így minden kimondás hálózati kérés. Hiba vagy 2,5 mp csend után egyszer
   újrapróbálja, és csak utána jön a beépített motor, az is csak akkor, ha van a nyelvhez hangja (más nyelvű
   hang torz kiejtése rosszabb a csendnél). A szó elejét a hangkimenet ébredése vágta le, ezért nem iOS-en egy
   hallhatatlan jel ébren tartja a kimenetet (wakeAudioOutput). Az iOS útvonala ettől nem változik.
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

const TTS_START_TIMEOUT_MS = 2500;
const TTS_ATTEMPTS = 2;    // ennyiszer próbálja a Google-hangot, mielőtt a beépített motorra váltana
const TTS_RETRY_DELAY_MS = 300; // azonnali hiba után ennyit vár: egy rövid hálózati kihagyáson az azonnali újrapróbálás nem segít
const TTS_MAX_CHARS = 180; // a Google-hang ennél hosszabb szöveget nem olvas fel egyben
const TTS_LOCALES = { ja: 'ja-JP', hu: 'hu-HU', en: 'en-US' };
const IS_IOS = typeof navigator !== 'undefined'
  && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/* ── V13.28: a hangkimenet ébren tartása (nem iOS) ──
   Szünet után a hangkimenet (hangszóró-erősítő) kb. 100-300 ms alatt ébred fel, és a Google-hang ez alatt
   elindul: az Android ilyenkor a szó elejét elnyeli, rövid szónál szinte az egészet. Egy AudioContext
   -100 dB-es jele (a teljes csendet a böngésző idővel lekapcsolná) nyitva tartja a kimenetet. Ha a kimenet
   aludt, az indítás OUTPUT_WAKE_MS-sel késik. 30 mp tétlenség vagy háttérbe kerülés után elalszik. */
const OUTPUT_WAKE_MS = 250;
const OUTPUT_IDLE_MS = 30000;
let _outputCtx = null;
let _outputTimer = null;

function sleepAudioOutput() {
  clearTimeout(_outputTimer);
  try { if (_outputCtx && _outputCtx.state === 'running') _outputCtx.suspend().catch(() => {}); } catch (e) { /* már leállt */ }
}

// Visszaadja, hány ms-ot kell várni a lejátszás indításával
function wakeAudioOutput() {
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (IS_IOS || !Ctx) return 0;
  let wait = 0;
  try {
    if (!_outputCtx) {
      _outputCtx = new Ctx({ latencyHint: 'playback' });
      const signal = _outputCtx.createConstantSource();
      signal.offset.value = 0.00001;
      signal.connect(_outputCtx.destination);
      signal.start();
    }
    if (_outputCtx.state !== 'running') {
      wait = OUTPUT_WAKE_MS;
      const resumed = _outputCtx.resume();
      if (resumed && resumed.catch) resumed.catch(() => {});
    }
    clearTimeout(_outputTimer);
    _outputTimer = setTimeout(sleepAudioOutput, OUTPUT_IDLE_MS);
  } catch (e) { return 0; }
  return wait;
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) sleepAudioOutput(); });

/* ── V13.28: kiejtésnapló (Profil: a verziószámra ötször koppintva) ──
   Az utolsó kimondások: melyik hang szólt, mennyi idő alatt indult, és miért váltott. A készüléken nem
   lehet távolról hibát keresni, így egy képernyőképből kiderül, mi történt. */
const TTS_LOG_SIZE = 8;
const _ttsLog = [];
function logTts(text, what) {
  _ttsLog.push(`${new Date().toLocaleTimeString('hu-HU')} ${text.slice(0, 12)}: ${what}`);
  if (_ttsLog.length > TTS_LOG_SIZE) _ttsLog.shift();
}
function ttsDiagnostics() {
  const voices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const count = lang => voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(lang)).length;
  return [
    `kiejtés: ${navigator.onLine === false ? 'offline' : 'online'} · kimenet ${_outputCtx ? _outputCtx.state : 'nincs'} · hangok: ja ${count('ja')}, en ${count('en')}, hu ${count('hu')}`,
    ..._ttsLog
  ];
}

let _noSpeechShown = false;
function notifyNoSpeech() {
  if (_noSpeechShown) return;
  _noSpeechShown = true;
  showToast('A kiejtés most nem érhető el. Ellenőrizd az internetkapcsolatot.');
}

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
    // V13.28: lassabb készüléken a néma klipp a szó indulása után is véget érhet: az igazi szót nem állítjuk le
    if (p && p.then) p.then(() => { try { if (a.src === _TTS_SILENCE) { a.pause(); a.currentTime = 0; } } catch (e) {} }).catch(() => {});
  } catch (e) {}
  wakeAudioOutput(); // érintés közben jön létre, így biztosan elindulhat
  // 2) speechSynthesis felébresztése (iOS standalone-ban gyakran néma a fallback enélkül; Androidon nem kell)
  try {
    if (IS_IOS && window.speechSynthesis) {
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
  function useSpeechSynthesis(reason = 'hosszú szöveg') {
    if (_ttsVersion !== ver) return; // közben már másik szó szól
    const noSpeech = why => { logTts(text, `nem szólt (${why})`); notifyNoSpeech(); _onTTSFinished(ver); };
    if (!window.speechSynthesis) { noSpeech(reason); return; }
    const voices = window.speechSynthesis.getVoices();
    const locale = TTS_LOCALES[lang];
    const matching = voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
    // Androidon az üres lista azt is jelentheti, hogy még tölt: ilyenkor a rendszerre bízzuk a választást
    if (voices.length > 0 && matching.length === 0) { noSpeech(`nincs ${lang} hang`); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    const voice = (lang === 'ja' && matching.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
               || matching.find(v => v.lang.replace('_', '-').toLowerCase() === locale.toLowerCase())
               || matching[0];
    if (voice) u.voice = voice;
    u.rate = lang === 'ja' ? 0.9 : 1.0;
    // Androidon az onend néha elmarad: a várakozó gyakorlás ne akadjon el
    const guard = setTimeout(() => _onTTSFinished(ver), Math.max(5000, text.length * 350));
    u.onend = () => { clearTimeout(guard); _onTTSFinished(ver); };
    u.onerror = (e) => { clearTimeout(guard); console.log('[TTS] SpeechSynthesis hiba:', e); logTts(text, `eszköz hiba: ${e && e.error}`); _onTTSFinished(ver); };
    logTts(text, `eszköz hangja (${voice ? voice.name : 'alapértelmezett'}), ok: ${reason}`);
    window.speechSynthesis.speak(u);
  }

  if (text.length > TTS_MAX_CHARS) { useSpeechSynthesis(); return; }

  const wait = wakeAudioOutput();

  // Google Translate TTS – pontos kiejtés (japánnál kana alapú, on/kun keveredés nélkül).
  // ÚJRAHASZNÁLT (előre feloldott) elem – iOS standalone-ban csak így szól megbízhatóan.
  function playGoogle(attempt) {
    if (_ttsVersion !== ver) return;
    const audio = _getTTSAudio();
    audio.onended = null; audio.onerror = null; audio.onplaying = null; // tiszta lap a reuse miatt
    audio.src = googleTtsUrl(text, lang);
    _currentTTSAudio = audio;
    const askedAt = Date.now();
    // Védőkapcsoló: az onerror, a play().catch() és az időkorlát egyszerre is elsülhet –
    // enélkül a tartalék többször futna, és a hang kétszer szólalna meg.
    let settled = false;
    let started = false;
    let timer = null;
    const failed = reason => {
      if (settled || _ttsVersion !== ver || typeof window === 'undefined') return; // az időzítő túlélheti az oldalt
      settled = true;
      clearTimeout(timer);
      try { audio.onplaying = null; audio.onended = null; audio.onerror = null; audio.pause(); } catch (e) { /* már leállt */ }
      _currentTTSAudio = null;
      logTts(text, `Google ${attempt}. próba: ${reason}`);
      // Az elutasított lejátszást és a kapcsolat nélküli állapotot az újrapróbálás nem oldja meg
      const retry = attempt < TTS_ATTEMPTS && reason !== 'NotAllowedError' && navigator.onLine !== false;
      if (!retry) useSpeechSynthesis(reason);
      else if (reason === 'időtúllépés') playGoogle(attempt + 1);
      else setTimeout(() => playGoogle(attempt + 1), TTS_RETRY_DELAY_MS);
    };
    audio.onplaying = () => {
      if (started) return;
      started = true;
      clearTimeout(timer);
      logTts(text, `Google, ${Date.now() - askedAt} ms`);
    };
    audio.onended = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      _onTTSFinished(ver);
    };
    audio.onerror = () => failed(`hiba ${(audio.error && audio.error.code) || ''}`.trim());
    // Se hiba, se hang (pl. elakadt kérés): ne maradjon néma a gyakorlás
    timer = setTimeout(() => { if (!started) failed('időtúllépés'); }, TTS_START_TIMEOUT_MS);
    const start = () => {
      if (settled || _ttsVersion !== ver) return;
      const p = audio.play();
      if (p && p.then) p.catch(e => failed((e && e.name) || 'lejátszás'));
    };
    if (attempt === 1 && wait > 0) setTimeout(start, wait); else start();
  }
  playGoogle(1);
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// A gyakorló motor ezen keresztül kér értesítést a hang végéről
function setTtsOnEnd(fn) { _ttsOnEnd = fn; }

export { OUTPUT_IDLE_MS, OUTPUT_WAKE_MS, TTS_ATTEMPTS, TTS_RETRY_DELAY_MS, TTS_START_TIMEOUT_MS, _TTS_SILENCE, _audioUnlocked, googleTtsUrl, applyAudioSession, canMixWithMusic, isMixWithMusic, setMixWithMusic, _currentTTSAudio, _getTTSAudio, _onTTSFinished, _ttsAudioEl, _ttsOnEnd, _ttsVersion, setTtsOnEnd, speakWord, ttsDiagnostics, unlockAudioPlayback, wakeAudioOutput };
