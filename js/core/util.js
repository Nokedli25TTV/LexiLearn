// LexiLearn – core/util.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

// Érték biztonságos átadása inline onclick-nek (idézőjelek, aposztrófok is)
const jsArg = v => escHtml(JSON.stringify(v));
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escRegex(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// Kártya hátoldalának forrás-sora: japán módban kandzsi írásmód (ha van) · kana · romaji
// (V13.7); más módban maga a szó
function japaneseBackLine(word, mode) {
  if (mode !== 'japanese' || !word.romaji) return word.en;
  return [word.kanji, word.en, word.romaji].filter(Boolean).join(' · ');
}

export { escHtml, escRegex, japaneseBackLine, jsArg, shuffle };
