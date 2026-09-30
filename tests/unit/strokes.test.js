// V13.9: a vonássorrend modul (features/strokes.js) jsdomban. A fetch a valódi kanjivg fájlokat adja vissza;
// a core/data.js importkor olvassa a window.LEXI_DATA-t, ezért a modult a beállítás után töltjük be.
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let S;
const flush = () => new Promise(r => setTimeout(r, 0));

beforeAll(async () => {
  window.LEXI_DATA = { kanjiData: [
    { kanji: '日', meaning: 'nap', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・か', romaji: 'nichi / hi', jlpt: 'N5' },
    { kanji: '議', meaning: 'vita / tanácskozás', onyomi: 'ギ', kunyomi: '', romaji: 'gi', jlpt: 'N3' }
  ] };
  globalThis.fetch = vi.fn(async url => ({
    ok: true,
    json: async () => JSON.parse(readFileSync(path.join(ROOT, String(url)), 'utf8'))
  }));
  S = await import('../../js/features/strokes.js');
});

beforeEach(() => { window.matchMedia = undefined; });

function card(kanji) {
  const el = document.createElement('div');
  el.innerHTML = S.strokeFigureHtml(kanji);
  document.body.appendChild(el);
  return el;
}

describe('vonássorrend a kártya hátoldalán', () => {
  it('csak az adatbázis kandzsijaihoz ad ábrát; addig a kandzsi betűként látszik', () => {
    expect(S.strokeFigureHtml('猫')).toBe('');
    const el = card('日');
    expect(el.querySelector('.ks').dataset.kanji).toBe('日');
    expect(el.querySelector('.ks-glyph').textContent).toBe('日');
    expect(el.querySelector('.ks-replay').hidden).toBe(true);
  });

  it('betöltés után számozott vonásokat rajzol, halvány teljes alak fölé', async () => {
    const el = card('日');
    S.mountStrokes(el);
    await flush(); await flush();
    const svg = el.querySelector('.ks-svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('aria-label')).toBe('日 vonássorrendje, 4 vonás');
    expect(svg.querySelectorAll('.ks-ghost path')).toHaveLength(4);
    expect(svg.querySelectorAll('.ks-ink path')).toHaveLength(4);
    expect([...svg.querySelectorAll('.ks-num text')].map(t => t.textContent)).toEqual(['1', '2', '3', '4']);
    expect(el.querySelector('.ks-count').textContent).toBe('4 vonás');
    expect(el.querySelector('.ks-replay').hidden).toBe(false);
    expect(fetch).toHaveBeenCalledWith('kanjivg/n5.json');
    // a vonások egymás után indulnak
    const starts = [...svg.querySelectorAll('.ks-ink path')].map(p => parseInt(p.style.getPropertyValue('--d'), 10));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(starts[0]).toBe(0);
  });

  it('a sok vonásos kandzsi is legfeljebb kb. 5 másodperc', async () => {
    const el = card('議');
    S.mountStrokes(el);
    await flush(); await flush();
    const paths = [...el.querySelectorAll('.ks-ink path')];
    expect(paths).toHaveLength(20);
    const last = paths[paths.length - 1];
    const end = parseInt(last.style.getPropertyValue('--d'), 10) + parseInt(last.style.getPropertyValue('--t'), 10);
    expect(end).toBeLessThanOrEqual(5200);
  });

  it('fordításkor indul, visszafordításkor leáll; az újrajátszás késleltetés nélkül indul', async () => {
    const el = card('日');
    S.mountStrokes(el);
    await flush(); await flush();
    const ks = el.querySelector('.ks');
    const btn = el.querySelector('.ks-replay');
    S.playStrokes(el);
    expect(ks.classList.contains('is-playing')).toBe(true);
    expect(ks.style.getPropertyValue('--ks-delay')).toBe('380ms');
    expect(btn.tabIndex).toBe(0);
    S.stopStrokes(el);
    expect(ks.classList.contains('is-playing')).toBe(false);
    expect(btn.tabIndex).toBe(-1);
    S.replayStrokes(btn);
    expect(ks.classList.contains('is-playing')).toBe(true);
    expect(ks.style.getPropertyValue('--ks-delay')).toBe('0ms');
  });

  it('ha a kártyát az adat megérkezése előtt fordították meg, betöltéskor indul', async () => {
    const el = card('日');
    S.mountStrokes(el);
    S.playStrokes(el); // még nincs kész
    expect(el.querySelector('.ks').classList.contains('is-playing')).toBe(false);
    await flush(); await flush();
    expect(el.querySelector('.ks').classList.contains('is-playing')).toBe(true);
  });

  it('prefers-reduced-motion alatt nincs animáció, a kész ábra látszik', async () => {
    window.matchMedia = () => ({ matches: true });
    const el = card('日');
    S.mountStrokes(el);
    await flush(); await flush();
    S.playStrokes(el);
    expect(el.querySelector('.ks').classList.contains('is-playing')).toBe(false);
    expect(el.querySelectorAll('.ks-ink path')).toHaveLength(4);
  });
});
