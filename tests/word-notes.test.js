// V13.33: a szómagyarázatok adatfájlja (word_notes.js). Minden jegyzet létező szóhoz tartozik, a
// kapcsolódó szavak is léteznek, a szöveg rövid, nincs benne emoji és gondolatjel.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, console: { log() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['japanese_words.js', 'dekiru.js', 'dekiru2.js', 'jlpt_n3_words.js', 'word_notes.js']) {
  vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const get = name => vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : null`, ctx);
const NOTES = get('WORD_NOTES');
const words = [...get('JAPANESE_WORDS'), ...get('N3_WORDS'), ...get('DEKIRU_2_WORDS'),
  ...Array.from({ length: 30 }, (_, i) => get(`DEKIRU_L${i + 1}`)).filter(Boolean).flat()];
const KANA = new Set(words.map(w => w.kana));
const entries = Object.entries(NOTES || {});
const FIELDS = ['pos', 'use', 'watch', 'rel'];
const EMOJI = /\p{Extended_Pictographic}/u;

describe('szómagyarázatok (word_notes.js)', () => {
  it('van tartalma (1. adag: Dekiru 1–5. lecke)', () => {
    expect(entries.length).toBeGreaterThan(200);
  });

  it('minden jegyzet létező szóhoz tartozik, és csak ismert mezői vannak', () => {
    expect(entries.filter(([k]) => !KANA.has(k)).map(([k]) => k)).toEqual([]);
    expect(entries.filter(([, v]) => Object.keys(v).some(f => !FIELDS.includes(f))).map(([k]) => k)).toEqual([]);
  });

  it('minden jegyzetben van Használat vagy Figyelj, és rövid marad', () => {
    const bad = entries.filter(([, v]) => !(v.use || v.watch) ||
      ['pos', 'use', 'watch'].some(f => v[f] !== undefined && (typeof v[f] !== 'string' || !v[f].trim() || v[f].length > 200)));
    expect(bad.map(([k]) => k)).toEqual([]);
  });

  it('a kapcsolódó szavak léteznek, nem ismétlődnek és nem önmagukra mutatnak', () => {
    const bad = entries.filter(([k, v]) => v.rel !== undefined && (!Array.isArray(v.rel) || v.rel.length === 0 ||
      v.rel.some(r => !KANA.has(r) || r === k) || new Set(v.rel).size !== v.rel.length));
    expect(bad.map(([k, v]) => `${k} → ${(v.rel || []).filter(r => !KANA.has(r) || r === k).join(', ')}`)).toEqual([]);
  });

  it('nincs kétszer szereplő kulcs (a második csendben felülírná az elsőt), és kanához nem tapad latin betű', () => {
    const src = readFileSync(path.join(ROOT, 'word_notes.js'), 'utf8');
    const keys = [...src.matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map(m => m[1]);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
    expect(keys.length).toBe(entries.length);
    const glued = /[぀-ヿ][A-Za-zÀ-ž]|[A-Za-zÀ-ž][぀-ヿ]/;
    expect(entries.filter(([, v]) => ['pos', 'use', 'watch'].some(f => v[f] && glued.test(v[f]))).map(([k]) => k)).toEqual([]);
  });

  it('a szövegben nincs emoji, gondolatjel, és a szófaj kisbetűvel kezdődik', () => {
    const texts = entries.flatMap(([k, v]) => ['pos', 'use', 'watch'].filter(f => v[f]).map(f => [k, v[f]]));
    expect(texts.filter(([, t]) => EMOJI.test(t) || /[—]|--/.test(t)).map(([k]) => k)).toEqual([]);
    expect(entries.filter(([, v]) => v.pos && v.pos[0] !== v.pos[0].toLowerCase()).map(([k]) => k)).toEqual([]);
  });
});
