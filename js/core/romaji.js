// LexiLearn – core/romaji.js
// V13.18: romaji → kana átírás a Gépelős mód élő előnézetéhez (Hepburn, mint az adatfájlok, és a
// billentyűzetes változatok: si, tu, hu, zi; a „ti/di” jövevényszavas ティ/ディ). っ: dupla mássalhangzó,
// ん: n + mássalhangzó, nn, n', n- vagy a szó vége. A „-” katakanánál ー, egyébként elválasztó.
// Ami még nem alkot szótagot, latin betűként marad.
const TABLE = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ', za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', chi: 'ち', ti: 'てぃ', tsu: 'つ', tu: 'つ', te: 'て', to: 'と', da: 'だ', di: 'でぃ', du: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ', ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を', vu: 'ゔ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', she: 'しぇ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', che: 'ちぇ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', je: 'じぇ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
  va: 'ゔぁ', vi: 'ゔぃ', ve: 'ゔぇ', vo: 'ゔぉ', wi: 'うぃ', we: 'うぇ'
};
// ky, gy, ny, hy, by, py, my, ry + a/u/o
'kgnhbpmr'.split('').forEach(c => {
  const base = TABLE[c + 'i'];
  ['a', 'u', 'o'].forEach((v, i) => { TABLE[c + 'y' + v] = base + 'ゃゅょ'[i]; });
});
const KEYS = Object.keys(TABLE).sort((a, b) => b.length - a.length);
const VOWELS = 'aiueo';

function romajiToHiragana(input, { dash = 'ー' } = {}) {
  const s = String(input || '').toLowerCase();
  let out = '';
  for (let i = 0; i < s.length;) {
    const c = s[i], next = s[i + 1];
    if (c === '-') { out += dash; i++; continue; }
    if (c === 'n') {
      if (next === "'" || next === '-') { out += 'ん'; i += 2; continue; }
      // „nn”: ha utána magánhangzó jön, a második n már a következő szótagé (konna → こんな)
      if (next === 'n') { out += 'ん'; i += VOWELS.includes(s[i + 2]) || s[i + 2] === 'y' ? 1 : 2; continue; }
      if (next === undefined || (!VOWELS.includes(next) && next !== 'y')) { out += 'ん'; i++; continue; }
    }
    // dupla mássalhangzó → っ (a „tch” is: matcha → まっちゃ)
    if (/[bcdfghjkmpqrstvwxyz]/.test(c) && (next === c || (c === 't' && next === 'c'))) { out += 'っ'; i++; continue; }
    const key = KEYS.find(k => s.startsWith(k, i));
    if (key) { out += TABLE[key]; i += key.length; continue; }
    out += c; i++;
  }
  return out;
}

// Katakanára, a jövevényszavak hosszú magánhangzója ー-vel (koohii → コーヒー, sakkaa → サッカー)
const VOWEL_OF = {};
[['あかがさざただなはばぱまやらわぁゃ', 'a'], ['いきぎしじちぢにひびぴみりぃ', 'i'], ['うくぐすずつづぬふぶぷむゆるぅゅゔ', 'u'],
  ['えけげせぜてでねへべぺめれぇ', 'e'], ['おこごそぞとどのほぼぽもよろをぉょ', 'o']]
  .forEach(([chars, v]) => [...chars].forEach(ch => { VOWEL_OF[ch] = v; }));
const PLAIN_VOWEL = { あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o' };
function toKatakana(hiragana) {
  const chars = [...hiragana];
  const long = chars.map((ch, i) => (i > 0 && PLAIN_VOWEL[ch] && VOWEL_OF[chars[i - 1]] === PLAIN_VOWEL[ch] ? 'ー' : ch));
  return long.join('').replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}
const hasKatakana = s => /[ァ-ヺ]/.test(s || '');

export { hasKatakana, romajiToHiragana, toKatakana };
