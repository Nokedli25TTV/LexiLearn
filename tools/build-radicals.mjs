// A Radikálok mód adatainak előállítása (V13.23).
// Használat: node tools/build-radicals.mjs <kicsomagolt KanjiVG mappa (benne kanji/)> <a KanjiRadical repó mappája>
//
// Kimenet:
//   radicals_data.js     – RADICALS_DATA: a 214 Kangxi-radikál (karakter, vonásszám, busu-név, magyar és angol
//                          jelentés, JLPT, on/kun olvasat) a KanjiRadical projektből (data/radicals.ts +
//                          data/radical-meta.generated.json, ami a KANJIDIC-ből készült);
//                          KANJI_RADICALS: a kanji_data.js kandzsijainak felbontása radikálokra a KanjiVG
//                          elemfájából: { "休": [["亻","人"],["木","木"]] } – [a kandzsiban látható alak, a radikál];
//                          az első elem a szótári radikál (kvg:radical), ha ismert.
//   kanjivg/radicals.json – a kanji_data.js-ben nem szereplő radikálok vonásai, a kanjivg/n5.json formátumában.
//
// Licenc: a KanjiVG adatai CC BY-SA 3.0 (© Ulrich Apel); a KANJIDIC (EDRDG) CC BY-SA 4.0.
// Újragenerálás után léptesd a sw.js KANJIVG_CACHE nevét.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [kvgDir, krDir] = process.argv.slice(2);
if (!kvgDir || !fs.existsSync(path.join(kvgDir, 'kanji')) || !krDir || !fs.existsSync(path.join(krDir, 'data', 'radicals.ts'))) {
  console.error('Használat: node tools/build-radicals.mjs <KanjiVG mappa> <KanjiRadical repó mappa>');
  process.exit(1);
}

/* ── 1. A 214 radikál a KanjiRadicalból ── */
const ts = fs.readFileSync(path.join(krDir, 'data', 'radicals.ts'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(krDir, 'data', 'radical-meta.generated.json'), 'utf8'));
const RADICALS = [...ts.matchAll(/r\((\d+),\s*"([^"]+)",\s*(\d+),\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g)]
  .map(([, id, ch, strokes, romaji, en, hu]) => {
    const m = meta[ch] || {};
    return {
      id: Number(id), radical: ch, strokes: Number(strokes), romaji, en, hu,
      jlpt: m.jlpt ? `N${m.jlpt}` : null,
      onyomi: (m.on || []).join('、'), kunyomi: (m.kun || []).join('、')
    };
  });
if (RADICALS.length !== 214) { console.error(`214 radikál helyett ${RADICALS.length}`); process.exit(1); }
const RADICAL_SET = new Set(RADICALS.map(r => r.radical));

/* ── KanjiVG SVG: vonások és elemfa ── */
const svgOf = ch => {
  const file = path.join(kvgDir, 'kanji', `${ch.codePointAt(0).toString(16).padStart(5, '0')}.svg`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
};

function parseStrokes(svg) {
  const strokes = [...svg.matchAll(/<path[^>]*\bid="kvg:[0-9a-f]+(?:-[a-zA-Z0-9]+)*-s(\d+)"[^>]*\bd="([^"]+)"/g)]
    .map(m => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n);
  const numbers = [...svg.matchAll(/<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">(\d+)<\/text>/g)]
    .map(m => ({ n: Number(m[3]), x: Number(m[1]), y: Number(m[2]) }));
  const pos = new Map(numbers.map(t => [t.n, t]));
  return strokes.map(s => [s.d, pos.get(s.n)?.x ?? null, pos.get(s.n)?.y ?? null]);
}

// A StrokePaths csoport <g> elemeiből fa: { element, original, radical, children }
function parseTree(svg) {
  const body = svg.slice(svg.indexOf('id="kvg:StrokePaths'), svg.indexOf('id="kvg:StrokeNumbers'));
  const root = { children: [] };
  const stack = [root];
  for (const m of body.matchAll(/<g\b([^>]*)>|<\/g>/g)) {
    if (m[0] === '</g>') { if (stack.length > 1) stack.pop(); continue; }
    const attr = name => (m[1].match(new RegExp(`kvg:${name}="([^"]*)"`)) || [])[1];
    const node = { element: attr('element'), original: attr('original'), radical: attr('radical'), children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root.children[0] || null;
}

// A KanjiVG a mai alakokat tárolja; a Kangxi-lista hagyományos alakjai (és a nem jelölt variánsok)
const ALIAS = { '辶': '辵', '⻌': '辵', '⻍': '辵', '青': '靑', '戸': '戶', '⺍': '小', '⺌': '小' };
// A vonásadat a mai alakból (a KanjiRadical is így tette): 辵 → 辶 eltér, a többi szinte azonos
const STROKE_FALLBACK = { '靑': '青', '戶': '戸', '辵': '辶' };
const asRadical = ch => (ch && RADICAL_SET.has(ch) ? ch : ch && RADICAL_SET.has(ALIAS[ch]) ? ALIAS[ch] : null);
const baseOf = n => asRadical(n.original) || asRadical(n.element) || n.element;

// Radikál-összetevők legfeljebb két szint mélyen (ami radikál, abba nem megyünk lejjebb, és a nem
// radikál összetevőkből csak egy szintet bontunk: 語 → 言 + 口, nem 言 + 二 + 口), a szótári radikál elöl
const MAX_DEPTH = 2;
function decompose(kanji, tree) {
  if (!tree) return [];
  if (RADICAL_SET.has(kanji)) return [[kanji, kanji]];
  const found = [];
  let dictionary = null;
  const walk = (node, top, depth = 0) => {
    const base = baseOf(node);
    if (!top && node.radical && (node.radical === 'general' || node.radical === 'tradit') && RADICAL_SET.has(base) && !dictionary) {
      dictionary = [node.element, base];
    }
    if (!top && node.element && RADICAL_SET.has(base)) {
      if (!found.some(([shown, b]) => shown === node.element && b === base)) found.push([node.element, base]);
      // a szótári radikál jelölése mélyebben is lehet: tovább keressük, de összetevőt már nem veszünk fel
      const mark = n => { if (!dictionary && n.radical && (n.radical === 'general' || n.radical === 'tradit') && RADICAL_SET.has(baseOf(n))) dictionary = [n.element, baseOf(n)]; n.children.forEach(mark); };
      node.children.forEach(mark);
      return;
    }
    if (depth >= MAX_DEPTH) { node.children.forEach(function mark2(n) { if (!dictionary && n.radical && (n.radical === 'general' || n.radical === 'tradit') && RADICAL_SET.has(baseOf(n))) dictionary = [n.element, baseOf(n)]; n.children.forEach(mark2); }); return; }
    node.children.forEach(c => walk(c, false, depth + 1));
  };
  walk(tree, true, 0);
  if (dictionary) {
    const i = found.findIndex(([s, b]) => s === dictionary[0] && b === dictionary[1]);
    if (i > 0) found.unshift(found.splice(i, 1)[0]);
    else if (i < 0) found.unshift(dictionary);
  }
  return found;
}

/* ── 2. A kanji_data.js kandzsijai ── */
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('kanji_data.js', 'utf8') + ';globalThis.__K = KANJI_DATA;', ctx);
const KANJI = [...new Set(ctx.__K.map(k => k.kanji))];
const KANJI_SET = new Set(KANJI);

const KANJI_RADICALS = {};
let withParts = 0, noSvg = 0;
for (const k of KANJI) {
  const svg = svgOf(k);
  if (!svg) { noSvg++; continue; }
  const parts = decompose(k, parseTree(svg));
  if (parts.length) { KANJI_RADICALS[k] = parts; withParts++; }
}

/* ── 3. A radikálok vonásai (ami nincs a kandzsi-fájlokban) ── */
const LICENSE = 'KanjiVG (c) Ulrich Apel, CC BY-SA 3.0, https://kanjivg.tagaini.net';
const radStrokes = { _license: LICENSE };
const noStrokes = [];
for (const r of RADICALS) {
  if (KANJI_SET.has(r.radical)) continue; // a kanjivg/nX.json-ban már benne van
  const svg = svgOf(r.radical) || (STROKE_FALLBACK[r.radical] && svgOf(STROKE_FALLBACK[r.radical]));
  const strokes = svg ? parseStrokes(svg) : [];
  if (strokes.length) radStrokes[r.radical] = strokes; else noStrokes.push(r.radical);
}

/* ── Kiírás ── */
const header = `/* ══════════════════════════════════════════════════════
   LexiLearn – Radikálok (V13.23) – GENERÁLT FÁJL, ne szerkeszd kézzel:
   node tools/build-radicals.mjs <KanjiVG> <KanjiRadical>
   RADICALS_DATA: a 214 Kangxi-radikál a KanjiRadical projektből (olvasat, JLPT: KANJIDIC, EDRDG, CC BY-SA 4.0).
   KANJI_RADICALS: a kandzsik felbontása radikálokra a KanjiVG elemfájából (© Ulrich Apel, CC BY-SA 3.0):
   [a kandzsiban látható alak, a radikál]; az első a szótári radikál, ha ismert.
══════════════════════════════════════════════════════ */
`;
const out = header +
  'const RADICALS_DATA = [\n' + RADICALS.map(r => '  ' + JSON.stringify(r)).join(',\n') + '\n];\n\n' +
  'const KANJI_RADICALS = ' + JSON.stringify(KANJI_RADICALS) + ';\n';
fs.writeFileSync('radicals_data.js', out);
fs.writeFileSync(path.join('kanjivg', 'radicals.json'), JSON.stringify(radStrokes));

console.log(`Radikálok: ${RADICALS.length} (vonásadat a kandzsikból: ${RADICALS.filter(r => KANJI_SET.has(r.radical)).length}, a radicals.json-ban: ${Object.keys(radStrokes).length - 1})`);
console.log(`Kandzsik felbontása: ${withParts} / ${KANJI.length} (nincs SVG: ${noSvg})`);
console.log(`radicals_data.js: ${(out.length / 1024).toFixed(0)} KB, kanjivg/radicals.json: ${(JSON.stringify(radStrokes).length / 1024).toFixed(0)} KB`);
if (noStrokes.length) console.log(`Nincs vonásadat (${noStrokes.length}): ${noStrokes.join(' ')}`);
