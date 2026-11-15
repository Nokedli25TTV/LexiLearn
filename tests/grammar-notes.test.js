// V13.35: a leckénkénti nyelvtan adatfájlja (grammar_notes.js). Minden lecke létező Dekiru-lecke,
// a pontoknak van mintája, neve, magyarázata és japán példája, a szöveg rövid, nincs benne emoji
// és gondolatjel.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, console: { log() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['dekiru.js', 'grammar_notes.js']) vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const get = name => vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : null`, ctx);
const GRAMMAR = get('GRAMMAR_NOTES');
const lessons = Object.entries(GRAMMAR || {});
const points = lessons.flatMap(([n, g]) => (g.points || []).map((p, i) => [`${n}/${i + 1}`, p]));
const JAPANESE = /[぀-ヿ㐀-鿿]/;
const EMOJI = /\p{Extended_Pictographic}/u;
const FIELDS = ['pattern', 'name', 'text', 'ex', 'watch'];

describe('nyelvtan leckénként (grammar_notes.js)', () => {
  it('1. adag: a Dekiru 1. könyv 1–12. leckéje, mind létező lecke, címmel', () => {
    expect(lessons.map(([n]) => Number(n))).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    lessons.forEach(([n, g]) => {
      expect(get(`DEKIRU_L${n}`)).toBeTruthy();
      expect(typeof g.title).toBe('string');
      expect(g.points.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('minden pontnak van mintája, neve, magyarázata és legalább egy japán példája', () => {
    const bad = points.filter(([, p]) => Object.keys(p).some(f => !FIELDS.includes(f)) ||
      !p.pattern || !p.name || !p.text || !Array.isArray(p.ex) || p.ex.length === 0 ||
      p.ex.some(e => !Array.isArray(e) || e.length !== 2 || !JAPANESE.test(e[0]) || !e[1].trim()));
    expect(bad.map(([k]) => k)).toEqual([]);
  });

  it('rövid marad: minta ≤ 40, név ≤ 50, magyarázat ≤ 260, buktató ≤ 160 karakter', () => {
    const long = points.filter(([, p]) => p.pattern.length > 40 || p.name.length > 50 || p.text.length > 260 || (p.watch || '').length > 160);
    expect(long.map(([k]) => k)).toEqual([]);
  });

  it('nincs emoji és gondolatjel, a mondatok ponttal zárulnak', () => {
    const texts = points.flatMap(([k, p]) => [p.name, p.text, p.watch || '', ...p.ex.flat()].map(t => [k, t]));
    expect(texts.filter(([, t]) => EMOJI.test(t) || /[—]|--/.test(t)).map(([k]) => k)).toEqual([]);
    expect(points.filter(([, p]) => !/[.:)]$/.test(p.text) || (p.watch && !/[.:)]$/.test(p.watch))).map(([k]) => k)).toEqual([]);
  });
});
