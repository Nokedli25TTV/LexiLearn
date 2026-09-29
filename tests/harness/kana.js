// Kana → romaji (wapuro-stílus, ahogy az adatfájlok írják: hosszú magánhangzó kanaként: ou, uu, ei;
// し shi, ち chi, つ tsu, ふ fu, じ ji; っ duplázás; ー az előző magánhangzó).
// Csak az adatfájlok ellenőrzéséhez: a romaji elírásait fogja meg.
const BASE = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko', が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so', ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to', だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho', ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo', や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro', わ: 'wa', を: 'wo', ん: 'n', ゔ: 'vu'
};
const SMALL_Y = { ゃ: 'a', ゅ: 'u', ょ: 'o' };
const SMALL_V = { ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o' };

const toHiragana = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

export function kanaToRomaji(kana) {
  const chars = [...toHiragana(kana)];
  const out = [];
  let double = false;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === 'っ') { double = true; continue; }
    if (c === 'ー') { const last = out[out.length - 1] || ''; out.push(last.slice(-1)); continue; }
    if (SMALL_Y[c] && out.length) {
      const prev = out.pop();
      out.push(/(sh|ch|j)i$/.test(prev) ? prev.slice(0, -1) + SMALL_Y[c] : prev.slice(0, -1) + 'y' + SMALL_Y[c]);
      continue;
    }
    if (SMALL_V[c] && out.length) {
      const prev = out.pop();
      const stem = prev.slice(0, -1);
      out.push((stem === '' ? 'w' : stem) + SMALL_V[c]);
      continue;
    }
    let r = BASE[c];
    if (r === undefined) return null; // nem kana karakter
    if (c === 'ん') {
      const next = BASE[toHiragana(chars[i + 1] || '')] || '';
      if (/^[aiueoy]/.test(next)) r = "n'";
    }
    if (double) { r = (r.startsWith('ch') ? 't' : r[0]) + r; double = false; }
    out.push(r);
  }
  return out.join('');
}

// Összehasonlításhoz: szóköz, aposztróf, kötőjel nélkül, kisbetűvel
export const normRomaji = s => String(s || '').toLowerCase().replace(/[\s'’-]/g, '');
