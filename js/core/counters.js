// LexiLearn – core/counters.js
// V13.32: mit számol a számlálószó. Kezdőként a "ひとつ = egy" önmagában nem mondja meg, mire használják,
// ezért a kártyákon egy kis semleges címke áll: "Számláló · dolgok általában (1–10)". A szótárban a
// "számlálószavak" címke jelöli őket; ami nincs a táblázatban, annál csak annyi áll, hogy "Számláló".
import { escHtml } from './util.js';

const COUNTER_TAG = 'számlálószavak';
const TSU = 'dolgok általában (1–10)';

// Teljes szóra (japán kana, kandzsi írásjegy)
const WORD_COUNTS = {
  'ひとつ': TSU, 'ふたつ': TSU, 'みっつ': TSU, 'よっつ': TSU, 'いつつ': TSU,
  'むっつ': TSU, 'ななつ': TSU, 'やっつ': TSU, 'ここのつ': TSU, 'とお': TSU,
  'ひとり': 'emberek', 'ふたり': 'emberek',
  '杯': 'poharak, csészék, tálak', '号': 'sorszám (pl. szoba, szám)', '番': 'sorszám, sorrend', '第': 'sorszám (előtag: -odik)',
  '個': 'kisebb tárgyak', '階': 'emeletek', '軒': 'házak, épületek', '戸': 'házak, lakások', '隻': 'hajók',
  '羽': 'madarak, nyulak', '枚': 'lapos tárgyak (papír, ing, tányér)', '冊': 'könyvek, füzetek', '匹': 'kisebb állatok',
  '粒': 'szemek, apró darabok', '郎': 'fiúk sorrendje a nevekben', '丁': 'háztömbök, tofu'
};
// Toldalékként írt számlálók ("~さい", "～ばい"): a hullámvonal nélkül
const SUFFIX_COUNTS = { 'さい': 'életkor (évek)', 'ねんせい': 'évfolyam', 'ばい': 'többszörös (-szoros)', 'だて': 'épület szintjei' };

const SUFFIX = /^[~～〜]/;

/** Mit számol a szó; null, ha nem számlálószó. Ismert számlálónál a leírás, egyébként üres szöveg. */
function counterNote(word) {
  if (!word || typeof word.en !== 'string') return null;
  const tagged = Array.isArray(word.tags) && word.tags.includes(COUNTER_TAG);
  if (SUFFIX.test(word.en)) {
    const note = SUFFIX_COUNTS[word.en.replace(SUFFIX, '')];
    return note !== undefined ? note : tagged ? '' : null;
  }
  if (WORD_COUNTS[word.en] !== undefined) return WORD_COUNTS[word.en];
  return tagged ? '' : null;
}

/** A kártyán megjelenő címke (üres, ha a szó nem számláló) */
function counterTagHtml(word) {
  const note = counterNote(word);
  if (note === null) return '';
  return `<span class="counter-tag">Számláló${note ? ` · ${escHtml(note)}` : ''}</span>`;
}

export { COUNTER_TAG, counterNote, counterTagHtml };
