// LexiLearn – features/kanji-links.js
// V13.18: Kandzsi és szavak összekötése. A japán szó kártyáján a benne lévő kandzsik a
// jelentésükkel, a kandzsi kártyáján néhány szó, amelyben szerepel.
// Az írásmód forrása: a szó saját kanji mezője (N3 szólista), különben a saját példamondatai,
// ha ott a ruby olvasata pontosan a szó, és csak egyféle alakban fordul elő (a heurisztikus,
// más mondatokból kikövetkeztetett alak túl sokszor téves lenne: わたし → 渡し).
import { JAPANESE_SENTENCES, KANJI_RADICALS, RADICALS_DATA } from '../core/data.js';
import { appData, diffOrder } from '../core/state.js';
import { escHtml } from '../core/util.js';
import { isLearnedWord } from '../goal/jlpt.js';
import { knownRadicals } from '../goal/radical-path.js';

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

/* ── V13.23: kandzsi ↔ radikál (a KanjiVG elemfájából, tools/build-radicals.mjs) ── */
const RADICAL_KANJI_LIMIT = 6;
const radicalMeaning = new Map(RADICALS_DATA.map(r => [r.radical, r.hu]));

// A kandzsi radikáljai: [{ shown: a kandzsiban látható alak (亻), radical: a radikál (人), hu, main }]
function radicalsOf(kanji) {
  return (KANJI_RADICALS[kanji] || []).map(([shown, radical], i) => ({ shown, radical, hu: radicalMeaning.get(radical) || '', main: i === 0 }));
}

// A radikált tartalmazó kandzsik: a már megtanultak, aztán a könnyebb szint, aztán ahol ez a szótári radikál
let _byRadical = null;
function kanjiWithRadical(radical, limit = RADICAL_KANJI_LIMIT) {
  if (!_byRadical) {
    _byRadical = new Map();
    Object.entries(KANJI_RADICALS).forEach(([kanji, parts]) => parts.forEach(([, r], i) => {
      if (!_byRadical.has(r)) _byRadical.set(r, []);
      _byRadical.get(r).push({ kanji, main: i === 0 });
    }));
  }
  const byChar = new Map(appData.kanji.words.map(w => [w.en, w]));
  const all = (_byRadical.get(radical) || []).map(x => ({ ...x, w: byChar.get(x.kanji) })).filter(x => x.w);
  all.sort((a, b) => (isLearnedWord(b.w) - isLearnedWord(a.w)) || (diffOrder(a.w.diff) - diffOrder(b.w.diff)) || (b.main - a.main));
  return { total: all.length, shown: all.slice(0, limit) };
}

// V13.26: a már megtanult radikál pipát kap (Radikálok mód), így látszik, mi hiányzik még a kandzsihoz
const CHECK_SVG = '<svg class="kl-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

function radicalChipsHtml(kanji) {
  const parts = radicalsOf(kanji);
  if (parts.length === 0) return '';
  const known = knownRadicals(appData.radicals.words || []);
  return `<div class="kanji-links is-radicals" aria-label="Radikálok a kandzsiban">${parts.map(p => {
    const isKnown = known.has(p.radical);
    const title = [p.main ? 'Szótári radikál' : '', isKnown ? 'már tudod' : ''].filter(Boolean).join(', ');
    return `<span class="kl-item${p.main ? ' is-main' : ''}${isKnown ? ' is-known' : ''}"${title ? ` title="${title}"` : ''}>${isKnown ? CHECK_SVG : ''}<b lang="ja">${escHtml(p.shown)}</b>${p.shown !== p.radical ? `<span lang="ja">${escHtml(p.radical)}</span> ` : ''}${escHtml(p.hu)}${isKnown ? '<span class="sr-only"> (már tudod)</span>' : ''}</span>`;
  }).join('')}</div>`;
}

// A kártya hátoldalára: japán szónál a kandzsijai, kandzsinál a szavai és a radikáljai,
// radikálnál a kandzsik, amelyekben szerepel (üres, ha nincs mit mutatni)
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
    const wordsHtml = words.length === 0 ? '' : `<div class="kanji-links is-words" aria-label="Szavak ezzel a kandzsival">${words.map(({ w, writing }) =>
      `<span class="kl-word"><b lang="ja">${escHtml(writing)}</b><span lang="ja">${escHtml(w.en)}</span> · ${escHtml(w.hu)}</span>`).join('')}</div>`;
    return radicalChipsHtml(word.en) + wordsHtml;
  }
  if (mode === 'radicals') {
    const { total, shown } = kanjiWithRadical(word.en);
    if (total === 0) return '';
    const more = total > shown.length ? `<span class="kl-more">+${total - shown.length} kandzsi</span>` : '';
    return `<div class="kanji-links" aria-label="Kandzsik ezzel a radikállal">${shown.map(({ w }) =>
      `<span class="kl-item"><b lang="ja">${escHtml(w.en)}</b>${escHtml(w.hu)}</span>`).join('')}${more}</div>`;
  }
  return '';
}

export { kanjiChars, kanjiLinksHtml, kanjiWithRadical, radicalsOf, wordWriting, wordsWithKanji };
