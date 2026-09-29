// Adatfájlok ellenőrzése: az N3 szókincs (jlpt_n3_words.js) minden bejegyzése teljes, a romaji
// egyezik a kanával, és egyetlen kana sem ütközik a meglévő szavakkal (az app kana alapján egyesít).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { kanaToRomaji, normRomaji } from './harness/kana.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, console: { log() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['japanese_words.js', 'dekiru.js', 'jlpt_n3_words.js']) {
  vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const get = name => vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : null`, ctx);
const N3 = get('N3_WORDS');
const existing = [...get('JAPANESE_WORDS'), ...Array.from({ length: 30 }, (_, i) => get(`DEKIRU_L${i + 1}`)).filter(Boolean).flat()];

describe('JLPT N3 szókincs (jlpt_n3_words.js)', () => {
  it('létezik és van tartalma', () => {
    expect(Array.isArray(N3)).toBe(true);
    expect(N3.length).toBeGreaterThan(250);
  });

  it('minden bejegyzés teljes: kana, kanji, romaji, magyar jelentés, címkék, szint', () => {
    const bad = N3.filter(w =>
      !/^[ぁ-ゖァ-ーー]+$/.test(w.kana || '') ||
      (w.kanji !== undefined && !/[㐀-鿿]/.test(w.kanji)) ||
      !(w.romaji || '').trim() || !(w.hu || '').trim() ||
      !Array.isArray(w.tags) || w.tags.length === 0 || w.tags.some(t => t !== t.toLowerCase()) ||
      !['N5', 'N4', 'N3'].includes(w.jlpt));
    expect(bad.map(w => w.kana)).toEqual([]);
  });

  it('a romaji egyezik a kanával', () => {
    const wrong = N3.map(w => ({ kana: w.kana, romaji: w.romaji, expected: kanaToRomaji(w.kana) }))
      .filter(x => normRomaji(x.romaji) !== normRomaji(x.expected));
    expect(wrong).toEqual([]);
  });

  it('nincs kana-duplikáció sem a fájlon belül, sem a meglévő szavakkal', () => {
    const seen = new Set(existing.map(w => w.kana));
    const dupes = [];
    N3.forEach(w => { if (seen.has(w.kana)) dupes.push(w.kana); seen.add(w.kana); });
    expect(dupes).toEqual([]);
  });
});

describe('kana → romaji átalakító', () => {
  it('alapesetek', () => {
    expect(kanaToRomaji('あきらめる')).toBe('akirameru');
    expect(kanaToRomaji('しゅじゅつ')).toBe('shujutsu');
    expect(kanaToRomaji('ちょくぜん')).toBe('chokuzen');
    expect(kanaToRomaji('げんいん')).toBe("gen'in");
    expect(kanaToRomaji('いっせいに')).toBe('isseini');
    expect(kanaToRomaji('まっちゃ')).toBe('matcha');
    expect(kanaToRomaji('コーヒー')).toBe('koohii');
    expect(kanaToRomaji('パーティー')).toBe('paatii');
    expect(kanaToRomaji('ファイル')).toBe('fairu');
  });
});
