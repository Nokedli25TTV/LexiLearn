// LexiLearn – core/answer.js
// V13.31: hibatűrő válaszellenőrzés (gépelős ismétlés, Gépelős gyakorlás). Ne egy ékezet, szóköz vagy
// elütés döntsön arról, hogy tudtad-e: a kis- és nagybetű, az ékezet, az írásjel, a névelő és a zárójeles
// megjegyzés nem számít, több jelentésből (vessző, perjel, pontosvessző) egy is elég, és a hossztól függően
// egy-két betű elírás belefér. Japán válasznál kana, kandzsi és romaji is jó, a hosszú magánhangzó mindegy.
import { romajiToHiragana } from './romaji.js';

const ARTICLES = { hu: ['a', 'az', 'egy'], en: ['a', 'an', 'the', 'to'] };
const SEPARATORS = /\s*(?:[,;/]|\s(?:vagy|or)\s)\s*/;
const JAPANESE = /[぀-ヿ㐀-鿿]/;

const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const dropNotes = s => String(s || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ');

function normalizeText(s, lang = 'hu') {
  const t = stripAccents(dropNotes(s).toLowerCase()).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!t) return '';
  const words = t.split(' ');
  const articles = ARTICLES[lang] || [];
  while (words.length > 1 && articles.includes(words[0])) words.shift();
  return words.join(' ');
}

// Egy jelentés összes elfogadható alakja: a teljes szöveg és az elválasztott részek
function variantsOf(meaning, lang = 'hu') {
  const clean = dropNotes(meaning);
  const parts = clean.split(SEPARATORS).map(p => normalizeText(p, lang)).filter(Boolean);
  const whole = normalizeText(clean, lang);
  return [...new Set(whole ? [...parts, whole] : parts)];
}

// Ennyi elírás fér bele a hosszhoz képest: rövid szónál egy betű már másik szó is lehet
function typoLimit(length) {
  if (length <= 3) return 0;
  return length <= 6 ? 1 : 2;
}

// Szerkesztési távolság (két szomszédos betű cseréje egynek számít); max fölött korán kilép
function editDistance(a, b, max = Infinity) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Magyar (vagy angol) jelentés ellenőrzése.
 * @returns {{ ok: boolean, exact: boolean }} exact: betűre (a normalizálás után) egyezik, nem elírással
 */
function checkMeaning(input, meaning, lang = 'hu') {
  const answers = variantsOf(input, lang);
  const targets = variantsOf(meaning, lang);
  let close = false;
  for (const a of answers) {
    const ac = a.replace(/ /g, '');
    for (const t of targets) {
      const tc = t.replace(/ /g, '');
      if (a === t || ac === tc) return { ok: true, exact: true };
      const limit = typoLimit(tc.length);
      if (limit && editDistance(ac, tc, limit) <= limit) close = true;
    }
  }
  return { ok: close, exact: false };
}

function normalizeRomaji(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  s = s.replace(/[\s\-]/g, '');
  s = s.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/ō/g, 'o').replace(/uu/g, 'u').replace(/ū/g, 'u').replace(/aa/g, 'a').replace(/ā/g, 'a').replace(/ii/g, 'i').replace(/ī/g, 'i').replace(/ee/g, 'e').replace(/ē/g, 'e');
  s = s.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, '$1');
  return s;
}

// Katakana → hiragana, a hosszú magánhangzó jele és a díszítők nélkül (a hosszúság a gépelésnél mindegy)
const KANA_LONG = { a: 'あかさたなはまやらわがざだばぱ', i: 'いきしちにひみりぎじぢびぴ', u: 'うくすつぬふむゆるぐずづぶぷ', e: 'えけせてねへめれげぜでべぺ', o: 'おこそとのほもよろごぞどぼぽ' };
const VOWEL_OF = Object.fromEntries(Object.entries(KANA_LONG).flatMap(([v, chars]) => [...chars].map(c => [c, v])));
const LONG_MARK = { a: 'あ', i: 'い', u: 'う', e: 'い', o: 'う' };
function foldKana(s) {
  let t = String(s || '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  t = t.replace(/[\s〜~・･。、.,!?！？]/g, '');
  // ー → az előző hang magánhangzója; a hosszú o / e kétféle írása (おう / おお, えい / ええ) egy alakra
  t = t.replace(/(.)ー/g, (m, c) => c + (LONG_MARK[VOWEL_OF[c]] || ''));
  t = t.replace(/([おこそとのほもよろごぞどぼぽょ])お/g, '$1う').replace(/([えけせてねへめれげぜでべぺ])え/g, '$1い');
  return t;
}

/**
 * Japán válasz ellenőrzése (a fordított, magyar → japán kártyán és a Gépelős gyakorlásban).
 * @param {string} input romaji, kana vagy kandzsi
 * @param {{ kana?: string, writing?: string, romaji?: string }} word
 */
function checkJapanese(input, { kana, writing, romaji } = {}) {
  const raw = String(input || '').trim();
  if (!raw) return { ok: false, exact: false };
  if (JAPANESE.test(raw)) {
    const a = foldKana(raw);
    // V13.45: több írásmód (以下・烏賊, 性格・正確) közül egy is elég, vagy mind együtt
    const writings = [writing, ...String(writing || '').split('・')];
    return { ok: [kana, ...writings].filter(Boolean).some(t => foldKana(t) === a), exact: true };
  }
  if (romaji && normalizeRomaji(raw) === normalizeRomaji(romaji)) return { ok: true, exact: true };
  if (kana && foldKana(romajiToHiragana(raw.toLowerCase())) === foldKana(kana)) return { ok: true, exact: true };
  return { ok: false, exact: false };
}

export { checkJapanese, checkMeaning, editDistance, foldKana, normalizeRomaji, normalizeText, typoLimit, variantsOf };
