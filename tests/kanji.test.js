// V13.9: a kandzsi adatbázis (kanji_data.js) és a vonássorrend-adat (kanjivg/*.json) ellenőrzése.
// Az olvasatok tiszta kanák (on: katakana, kun: hiragana, "・" elválasztóval), a romaji minden része egy
// olvasatból jön, és minden kandzsinak megvan a vonássorrendje a saját JLPT-szintje fájljában.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { kanaToRomaji } from './harness/kana.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync(path.join(ROOT, 'kanji_data.js'), 'utf8'), ctx, { filename: 'kanji_data.js' });
const KANJI = vm.runInContext('KANJI_DATA', ctx);
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const strokeFiles = Object.fromEntries(LEVELS.map(l =>
  [l, JSON.parse(readFileSync(path.join(ROOT, 'kanjivg', `${l.toLowerCase()}.json`), 'utf8'))]));

const readings = s => String(s || '').split('・').filter(Boolean);
const norm = s => s.toLowerCase().replace(/[\s'-]/g, '');

describe('kandzsi adatbázis (kanji_data.js)', () => {
  it('nincs duplikált kandzsi (az app a kandzsi alapján egyesít)', () => {
    const seen = new Set();
    const dupes = KANJI.filter(k => (seen.has(k.kanji) ? true : (seen.add(k.kanji), false))).map(k => k.kanji);
    expect(dupes).toEqual([]);
  });

  it('minden bejegyzés teljes és tiszta formátumú', () => {
    const bad = KANJI.filter(k =>
      [...k.kanji].length !== 1 || !/[㐀-鿿]/.test(k.kanji) ||
      !k.meaning || k.meaning !== k.meaning.trim() || /\s{2,}|\/\s*\/|\/$|^\//.test(k.meaning) ||
      !/^([ァ-ヶー]+(・[ァ-ヶー]+)*)?$/.test(k.onyomi) ||
      !/^([ぁ-ゖー]+(・[ぁ-ゖー]+)*)?$/.test(k.kunyomi) ||
      (!k.onyomi && !k.kunyomi) ||
      !/^[a-z' ]+( \/ [a-z' ]+)*$/.test(k.romaji) ||
      !LEVELS.includes(k.jlpt));
    expect(bad.map(k => `${k.kanji}: ${k.meaning} | ${k.onyomi} | ${k.kunyomi} | ${k.romaji}`)).toEqual([]);
  });

  it('a romaji minden része az olvasatok egyikéből jön', () => {
    const wrong = KANJI.filter(k => {
      const reads = [...readings(k.onyomi), ...readings(k.kunyomi)].map(kanaToRomaji).filter(Boolean).map(norm);
      return k.romaji.split('/').map(norm).some(part => !reads.some(r => part.startsWith(r) || r.startsWith(part)));
    }).map(k => `${k.kanji}: ${k.onyomi} / ${k.kunyomi} → ${k.romaji}`);
    expect(wrong).toEqual([]);
  });
});

describe('vonássorrend (kanjivg/*.json)', () => {
  it('minden fájl hordozza a KanjiVG licencét', () => {
    for (const l of LEVELS) expect(strokeFiles[l]._license).toMatch(/KanjiVG.*CC BY-SA 3\.0/);
  });

  it('minden kandzsi vonásai megvannak a saját szintje fájljában', () => {
    const missing = KANJI.filter(k => !Array.isArray(strokeFiles[k.jlpt][k.kanji])).map(k => k.kanji);
    expect(missing).toEqual([]);
  });

  it('a fájlokban csak az adatbázis kandzsijai vannak (nincs felesleges letöltés)', () => {
    const known = new Set(KANJI.map(k => `${k.jlpt}:${k.kanji}`));
    const extra = LEVELS.flatMap(l => Object.keys(strokeFiles[l]).filter(c => c !== '_license' && !known.has(`${l}:${c}`)));
    expect(extra).toEqual([]);
  });

  it('minden vonás érvényes útvonal, a sorszám helyével', () => {
    const bad = [];
    for (const l of LEVELS) {
      for (const [c, strokes] of Object.entries(strokeFiles[l])) {
        if (c === '_license') continue;
        strokes.forEach((s, i) => {
          if (!/^[Mm]\s*-?[\d.]/.test(s[0]) || !Number.isFinite(s[1]) || !Number.isFinite(s[2])) bad.push(`${c} ${i + 1}. vonás`);
        });
      }
    }
    expect(bad).toEqual([]);
  });

  it('ismert kandzsik vonásszáma', () => {
    const count = c => strokeFiles[KANJI.find(k => k.kanji === c).jlpt][c].length;
    expect({ 一: count('一'), 日: count('日'), 右: count('右'), 何: count('何'), 書: count('書'), 漢: count('漢'), 議: count('議') })
      .toEqual({ 一: 1, 日: 4, 右: 5, 何: 7, 書: 10, 漢: 13, 議: 20 });
  });
});
