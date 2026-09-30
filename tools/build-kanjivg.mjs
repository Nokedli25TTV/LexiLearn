// A vonássorrend-adatok előállítása a KanjiVG kiadásából (https://kanjivg.tagaini.net).
// Használat: node tools/build-kanjivg.mjs <a kicsomagolt kanjivg mappa, amiben a kanji/ van>
//
// Csak a kanji_data.js kandzsijait veszi ki, JLPT-szintenként egy-egy tömör JSON fájlba:
//   kanjivg/n5.json … kanjivg/n1.json   { "日": [["M31.5,24.5c…", 25.25, 32.63], …], … }
// Vonásonként: [SVG útvonal (109×109-es rácson), a vonás számának x, y helye].
//
// Licenc: a KanjiVG adatai CC BY-SA 3.0 (© Ulrich Apel); a kimenet ugyanezen licenc alatt áll.
// Újragenerálás után léptesd a sw.js KANJIVG_CACHE nevét (a telepített appok különben a régit tartják meg).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const src = process.argv[2];
if (!src || !fs.existsSync(path.join(src, 'kanji'))) {
  console.error('Add meg a kicsomagolt KanjiVG mappát (amiben a kanji/ alkönyvtár van).');
  process.exit(1);
}

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('kanji_data.js', 'utf8') + ';globalThis.__K = KANJI_DATA;', ctx);
const KANJI = ctx.__K;

const LICENSE = 'KanjiVG (c) Ulrich Apel, CC BY-SA 3.0, https://kanjivg.tagaini.net';
const byLevel = {};
const missing = [];

function parse(svg) {
  const strokes = [...svg.matchAll(/<path[^>]*\bid="kvg:[0-9a-f]+(?:-[a-zA-Z0-9]+)*-s(\d+)"[^>]*\bd="([^"]+)"/g)]
    .map(m => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n);
  const numbers = [...svg.matchAll(/<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">(\d+)<\/text>/g)]
    .map(m => ({ n: Number(m[3]), x: Number(m[1]), y: Number(m[2]) }));
  const pos = new Map(numbers.map(t => [t.n, t]));
  return strokes.map(s => [s.d, pos.get(s.n)?.x ?? null, pos.get(s.n)?.y ?? null]);
}

const seen = new Set();
for (const k of KANJI) {
  if (seen.has(k.kanji)) continue;
  seen.add(k.kanji);
  const code = k.kanji.codePointAt(0).toString(16).padStart(5, '0');
  const file = path.join(src, 'kanji', `${code}.svg`);
  if (!fs.existsSync(file)) { missing.push(k.kanji); continue; }
  const strokes = parse(fs.readFileSync(file, 'utf8'));
  if (!strokes.length) { missing.push(k.kanji); continue; }
  const level = (k.jlpt || 'N1').toLowerCase();
  (byLevel[level] ||= { _license: LICENSE })[k.kanji] = strokes;
}

fs.mkdirSync('kanjivg', { recursive: true });
let total = 0, bytes = 0;
for (const [level, data] of Object.entries(byLevel)) {
  const json = JSON.stringify(data);
  fs.writeFileSync(path.join('kanjivg', `${level}.json`), json);
  const n = Object.keys(data).length - 1;
  total += n; bytes += json.length;
  console.log(`${level}: ${n} kandzsi, ${(json.length / 1024).toFixed(0)} KB`);
}
console.log(`Összesen: ${total} kandzsi, ${(bytes / 1048576).toFixed(2)} MB`);
if (missing.length) console.log(`Hiányzik a KanjiVG-ből (${missing.length}): ${missing.join(' ')}`);
