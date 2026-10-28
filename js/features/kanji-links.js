// LexiLearn – features/kanji-links.js
// V13.18: Kandzsi és szavak összekötése. A japán szó kártyáján a benne lévő kandzsik a
// jelentésükkel, a kandzsi kártyáján néhány szó, amelyben szerepel.
// Az írásmód forrása: a szó saját kanji mezője (N3 szólista), különben a saját példamondatai,
// ha ott a ruby olvasata pontosan a szó, és csak egyféle alakban fordul elő (a heurisztikus,
// más mondatokból kikövetkeztetett alak túl sokszor téves lenne: わたし → 渡し).
import { JAPANESE_SENTENCES } from '../core/data.js';
import { appData } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { isLearnedWord } from '../goal/jlpt.js';

const KANJI_RE = /[一-龯㐀-䶿々]/g;
const RUBY_RE = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
const KANJI_WORD_LIMIT = 3;

let _sentenceForms = null;
function sentenceForms() {
  if (_sentenceForms) return _sentenceForms;
  _sentenceForms = new Map();
  (typeof JAPANESE_SENTENCES !== 'undefined' ? JAPANESE_SENTENCES : []).forEach(s => {
    for (const [, written, reading] of (s.fullSentenceHTML || '').matchAll(RUBY_RE)) {
      if (reading !== s.baseWord || !written.match(KANJI_RE)) continue;
      const forms = _sentenceForms.get(s.baseWord) || new Set();
      forms.add(written);
      _sentenceForms.set(s.baseWord, forms);
    }
  });
  return _sentenceForms;
}

function wordWriting(w) {
  if (w.kanji) return w.kanji;
  const forms = sentenceForms().get(w.en);
  return forms && forms.size === 1 ? [...forms][0] : '';
}

const kanjiChars = text => [...new Set((text || '').match(KANJI_RE) || [])];

function kanjiMeanings() {
  return new Map(appData.kanji.words.map(k => [k.en, k.hu]));
}

// Szavak, amelyekben a kandzsi szerepel: a már megtanultak és a Dekiru-szavak elöl, aztán szint és hossz szerint
function wordsWithKanji(kanji, limit = KANJI_WORD_LIMIT) {
  const rank = w => (isLearnedWord(w) ? 0 : 2) + (w.source === 'dekiru' ? 0 : 1);
  return appData.japanese.words
    .map(w => ({ w, writing: wordWriting(w) }))
    .filter(x => x.writing.includes(kanji))
    .sort((a, b) => rank(a.w) - rank(b.w) || String(a.w.diff).localeCompare(String(b.w.diff)) || a.writing.length - b.writing.length)
    .slice(0, limit);
}

// A kártya hátoldalára: japán szónál a kandzsijai, kandzsinál a szavai (üres, ha nincs mit mutatni)
function kanjiLinksHtml(word, mode) {
  if (mode === 'japanese') {
    const meanings = kanjiMeanings();
    const items = kanjiChars(wordWriting(word)).filter(k => meanings.has(k));
    if (items.length === 0) return '';
    return `<div class="kanji-links" aria-label="Kandzsik a szóban">${items.map(k =>
      `<span class="kl-item"><b lang="ja">${escHtml(k)}</b>${escHtml(meanings.get(k))}</span>`).join('')}</div>`;
  }
  if (mode === 'kanji') {
    const words = wordsWithKanji(word.en);
    if (words.length === 0) return '';
    return `<div class="kanji-links is-words" aria-label="Szavak ezzel a kandzsival">${words.map(({ w, writing }) =>
      `<span class="kl-word"><b lang="ja">${escHtml(writing)}</b><span lang="ja">${escHtml(w.en)}</span> · ${escHtml(w.hu)}</span>`).join('')}</div>`;
  }
  return '';
}

export { kanjiChars, kanjiLinksHtml, wordWriting, wordsWithKanji };
