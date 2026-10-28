// LexiLearn – practice/sentence-build.js
// V13.18: Mondatépítő. A példamondat darabjai összekeverve jönnek, a magyar fordítás alapján kell
// sorba rakni őket (szórend, partikulák). A japán csempék furiganával látszanak, az ellenőrzés a
// kana alakon megy, így az azonos darabok (pl. két „は”) bármelyike jó a helyén.
// A szórendet gyakorolja, nem magát a szót: a szó statisztikáját nem érinti (mint a 3D kártya).
import { JAPANESE_SENTENCES, english_sentences2 } from '../core/data.js';
import { escHtml, shuffle } from '../core/util.js';

const TAIL_RE = /[。．.!?！？]+$/;
const LIMITS = { japanese: [3, 7], english: [4, 9] };

const sentenceDb = mode => (mode === 'english'
  ? (typeof english_sentences2 !== 'undefined' ? english_sentences2 : [])
  : (typeof JAPANESE_SENTENCES !== 'undefined' ? JAPANESE_SENTENCES : []));

// A mondat csempékre bontva: { tiles: [{ html, text }], tail } vagy null, ha nem bontható megbízhatóan
function tokenizeSentence(s, mode) {
  const speech = (s.ttsSentence || '').trim().split(/\s+/).filter(Boolean);
  const shown = mode === 'english' ? speech.map(escHtml) : (s.fullSentenceHTML || '').trim().split(/\s+/).filter(Boolean);
  const [min, max] = LIMITS[mode] || LIMITS.japanese;
  if (speech.length < min || speech.length > max || shown.length !== speech.length) return null;
  const last = speech.length - 1;
  const tail = (speech[last].match(TAIL_RE) || [''])[0];
  const tiles = speech.map((text, i) => ({
    text: i === last ? text.replace(TAIL_RE, '') : text,
    html: i === last ? shown[i].replace(TAIL_RE, '') : shown[i]
  }));
  if (tiles.some(t => !t.text)) return null;
  return { tiles, tail };
}

function buildableSentences(word, mode) {
  return sentenceDb(mode).filter(s => s.baseWord === word.en && tokenizeSentence(s, mode));
}

/* ── Egy feladat állapota ── */
let _sb = null;

// A keverés ne adja vissza az eredeti sorrendet (különben nincs mit kirakni)
function shuffledOrder(tiles) {
  const idx = tiles.map((_, i) => i);
  if (new Set(tiles.map(t => t.text)).size < 2) return idx;
  let order;
  do { order = shuffle([...idx]); } while (order.every((v, i) => tiles[v].text === tiles[i].text));
  return order;
}

function sentenceBuildHtml(sObj, mode) {
  const parsed = tokenizeSentence(sObj, mode);
  _sb = { parsed, pool: shuffledOrder(parsed.tiles), placed: [], done: false, onDone: null, sObj };
  return `
    <p class="sb-prompt">${escHtml(sObj.hungarian || '')}</p>
    <div class="sb-answer" id="sb-answer" aria-label="A mondatod" aria-live="polite"></div>
    <div class="sb-pool" id="sb-pool" aria-label="Darabok"></div>
    <div class="sb-solution" id="sb-solution" hidden></div>
    <button class="dont-know" id="sb-giveup" onclick="sbGiveUp()">Nem tudom</button>`;
}

function renderSentenceBuild() {
  if (!_sb) return;
  const tile = (i, action, extra = '') =>
    `<button class="sb-tile ${extra}" lang="${_sb.lang || ''}" onclick="${action}" ${_sb.done ? 'disabled' : ''}>${_sb.parsed.tiles[i].html}</button>`;
  const answer = document.getElementById('sb-answer');
  const pool = document.getElementById('sb-pool');
  if (answer) answer.innerHTML = _sb.placed.map(({ i }, pos) => tile(i, `sbUnpick(${pos})`, _sb.result || '')).join('') +
    (_sb.placed.length === _sb.parsed.tiles.length ? `<span class="sb-tail">${escHtml(_sb.parsed.tail)}</span>` : '');
  if (pool) pool.innerHTML = _sb.done ? '' : _sb.pool.map((i, pos) => (i === null ? '<span class="sb-gap" aria-hidden="true"></span>' : tile(i, `sbPick(${pos})`))).join('');
  const giveUp = document.getElementById('sb-giveup');
  if (giveUp) giveUp.hidden = _sb.done; // vége: a készlet és a „Nem tudom” eltűnik
}

function initSentenceBuild(mode, onDone) {
  if (!_sb) return;
  _sb.onDone = onDone;
  _sb.lang = mode === 'english' ? 'en' : 'ja';
  renderSentenceBuild();
}

function finish(correct) {
  _sb.done = true;
  _sb.result = correct ? 'is-correct' : 'is-wrong';
  renderSentenceBuild();
  if (!correct) {
    const sol = document.getElementById('sb-solution');
    if (sol) { sol.hidden = false; sol.innerHTML = _sb.parsed.tiles.map(t => t.html).join(' ') + escHtml(_sb.parsed.tail); }
  }
  if (_sb.onDone) _sb.onDone(correct, _sb.sObj);
}

function sbPick(pos) {
  if (!_sb || _sb.done || _sb.pool[pos] === null || _sb.pool[pos] === undefined) return;
  _sb.placed.push({ i: _sb.pool[pos], from: pos });
  _sb.pool[pos] = null; // a helye megmarad, így a többi csempe nem ugrál
  renderSentenceBuild();
  if (_sb.placed.length === _sb.parsed.tiles.length) {
    const built = _sb.placed.map(({ i }) => _sb.parsed.tiles[i].text);
    finish(built.every((t, i) => t === _sb.parsed.tiles[i].text));
  }
}

function sbUnpick(pos) {
  if (!_sb || _sb.done) return;
  const [{ i, from }] = _sb.placed.splice(pos, 1);
  _sb.pool[from] = i; // vissza a saját helyére
  renderSentenceBuild();
}

function sbGiveUp() {
  if (!_sb || _sb.done) return;
  finish(false);
}

export { buildableSentences, initSentenceBuild, sbGiveUp, sbPick, sbUnpick, sentenceBuildHtml, tokenizeSentence };
