// V13.13: kandzsi írásgyakorlás (practice/writing.js) – a vonásillesztő geometriája a valódi KanjiVG
// adatokon, és a rajzfelület állapotgépe jsdomban (a rajzolást a 109-es rács pontjaival utánozzuk).
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const files = Object.fromEntries(LEVELS.map(l => [l, JSON.parse(readFileSync(path.join(ROOT, 'kanjivg', `${l}.json`), 'utf8'))]));
const flush = () => new Promise(r => setTimeout(r, 0));
let Wr;

beforeAll(async () => {
  window.LEXI_DATA = { kanjiData: [
    { kanji: '学', meaning: 'tanulás / tudomány', onyomi: 'ガク', kunyomi: 'まな', romaji: 'gaku / mana', jlpt: 'N5' },
    { kanji: '三', meaning: 'három', onyomi: 'サン', kunyomi: 'み', romaji: 'san / mi', jlpt: 'N5' }
  ] };
  globalThis.fetch = vi.fn(async url => ({ ok: true, json: async () => JSON.parse(readFileSync(path.join(ROOT, String(url)), 'utf8')) }));
  Wr = await import('../../js/practice/writing.js');
});

const gaku = () => files.n5['学'].map(s => Wr.prepareStroke(s[0]));
const poly = d => Wr.pathToPolyline(d);

describe('írásgyakorlás: útvonal és mintavétel', () => {
  it('az M / c / C / s / S parancsokat töröttvonallá alakítja, a végpontok pontosak', () => {
    const p = poly('M10,20c5,0,10,5,10,10C20,40,30,50,40,50s10,-10,20,-10S80,30,90,20');
    expect(p[0]).toEqual([10, 20]);
    expect(p[10]).toEqual([20, 30]);   // az első (relatív) szakasz vége
    expect(p[20]).toEqual([40, 50]);   // abszolút C
    expect(p[30]).toEqual([60, 40]);   // relatív s
    expect(p[p.length - 1]).toEqual([90, 20]);
  });

  it('a mintavétel egyenletes, és megtartja a két végpontot', () => {
    const pts = Wr.resample([[0, 0], [10, 0], [10, 30]], 5);
    expect(pts).toEqual([[0, 0], [10, 0], [10, 10], [10, 20], [10, 30]]);
    expect(Wr.polyLength(pts)).toBeCloseTo(40);
    expect(Wr.resample([[3, 4]], 4)).toEqual([[3, 4], [3, 4], [3, 4], [3, 4]]);
  });

  it('a 学 nyolc vonása előkészíthető, a hosszuk a rácson belül marad', () => {
    const strokes = gaku();
    expect(strokes).toHaveLength(8);
    strokes.forEach(s => { expect(s.pts).toHaveLength(Wr.SAMPLES); expect(s.len).toBeGreaterThan(5); expect(s.len).toBeLessThan(200); });
  });
});

describe('írásgyakorlás: egy vonás megítélése', () => {
  it('a pontos és a kissé pontatlan vonás jó, sorrendben', () => {
    const strokes = gaku();
    files.n5['学'].forEach((s, i) => {
      const exact = poly(s[0]);
      expect(Wr.judgeStroke(exact, strokes, i)).toBe('ok');
      const shifted = exact.map(([x, y]) => [x + 4, y - 3]);
      expect(Wr.judgeStroke(shifted, strokes, i)).toBe('ok');
    });
  });

  it('a fordított irányú hosszú vonás irányhiba', () => {
    const strokes = gaku();
    const fifth = poly(files.n5['学'][4][0]).reverse(); // a tető hosszú vízszintes vonása
    expect(Wr.judgeStroke(fifth, strokes, 4)).toBe('direction');
  });

  it('egy későbbi vonás megrajzolása sorrendhiba, a firka alakhiba', () => {
    const san = files.n5['三'].map(s => Wr.prepareStroke(s[0]));
    expect(Wr.judgeStroke(poly(files.n5['三'][1][0]), san, 0)).toBe('order');
    expect(Wr.judgeStroke(poly(files.n5['三'][2][0]), san, 0)).toBe('order');
    expect(Wr.judgeStroke([[5, 100], [20, 60], [5, 20], [30, 5]], san, 0)).toBe('shape');
  });

  it('az összes kandzsin: a pontos vonás mindig jó, a fordított és a soron kívüli szinte soha', () => {
    let strokesTotal = 0, exactRejected = 0, reversedOk = 0, reversedTested = 0, nextOk = 0, nextTested = 0;
    for (const l of LEVELS) {
      for (const [kanji, raw] of Object.entries(files[l])) {
        if (kanji === '_license') continue;
        const strokes = raw.map(s => Wr.prepareStroke(s[0]));
        const polys = raw.map(s => poly(s[0]));
        for (let i = 0; i < strokes.length; i++) {
          strokesTotal++;
          if (Wr.judgeStroke(polys[i], strokes, i) !== 'ok') exactRejected++;
          if (strokes[i].len >= 20) { reversedTested++; if (Wr.judgeStroke([...polys[i]].reverse(), strokes, i) === 'ok') reversedOk++; }
          if (i + 1 < strokes.length) { nextTested++; if (Wr.judgeStroke(polys[i + 1], strokes, i) === 'ok') nextOk++; }
        }
      }
    }
    expect(strokesTotal).toBeGreaterThan(17000);
    expect(exactRejected).toBe(0);
    expect(reversedOk / reversedTested).toBeLessThan(0.005);
    expect(nextOk / nextTested).toBeLessThan(0.01);
  });
});

describe('írásgyakorlás: minősítés', () => {
  it('hibátlan és javítással kész helyes, segítséggel vagy felfedve hibás, átrajzolva nem pontozott', () => {
    const r = Wr.writingResult;
    expect(r({ misses: 0 })).toBe('clean');
    expect(r({ misses: 2 })).toBe('ok');
    expect(r({ misses: 3 })).toBe('helped');
    expect(r({ misses: 1, hinted: true })).toBe('helped');
    expect(r({ misses: 0, traced: true })).toBe('traced');
    expect(r({ misses: 0, traced: true, revealed: true })).toBe('revealed');
    expect(['clean', 'ok', 'helped', 'revealed', 'traced'].map(Wr.isWritingCorrect)).toEqual([true, true, false, false, false]);
  });
});

describe('írásgyakorlás: rajzfelület', () => {
  const word = { id: 'kj_学', en: '学', hu: 'tanulás / tudomány', onyomi: 'ガク', kunyomi: 'まな' };
  const strokeOf = i => poly(files.n5['学'][i][0]);
  let done;

  beforeEach(async () => {
    window.matchMedia = undefined;
    Wr.resetWritingOutline();
    document.body.innerHTML = `<div id="q-card">${Wr.writingHtml(word)}</div>`;
    done = vi.fn();
    await Wr.initWriting(word, done);
    await flush();
  });

  it('a kártyán a jelentés és az olvasat látszik, a kandzsi nem', () => {
    expect(document.querySelector('.wr-meaning').textContent).toBe('tanulás / tudomány');
    expect(document.querySelector('.wr-readings').textContent).toBe('On: ガク · Kun: まな');
    expect(document.getElementById('q-card').textContent).not.toContain('学');
    expect(document.getElementById('wr-status').textContent).toBe('Rajzold meg vonásonként · 8 vonás');
    expect(document.getElementById('wr-outline').hasAttribute('hidden')).toBe(true);
  });

  it('a nyolc vonás sorban megrajzolva: hibátlan, minden vonás a szabályos alakjára vált', () => {
    for (let i = 0; i < 8; i++) {
      expect(Wr.submitStroke(strokeOf(i))).toBe('ok');
      if (i < 7) expect(document.getElementById('wr-status').textContent).toBe(`${i + 1} / 8 vonás`);
    }
    expect(document.querySelectorAll('#wr-done path')).toHaveLength(8);
    expect(document.getElementById('wr-status').textContent).toBe('Hibátlan.');
    expect(document.getElementById('wr-hint-btn').disabled).toBe(true);
    expect(done).toHaveBeenCalledExactlyOnceWith('clean');
    expect(Wr.submitStroke(strokeOf(0))).toBeNull(); // a kész kandzsira már nem lehet rajzolni
  });

  it('egy rossz sorrendű vonás után javítva: kész, 1 javítással', () => {
    expect(Wr.submitStroke(strokeOf(4))).toBe('order');
    expect(document.getElementById('wr-status').textContent).toBe('Nem ez a vonás következik.');
    expect(document.querySelectorAll('#wr-done path')).toHaveLength(0);
    for (let i = 0; i < 8; i++) Wr.submitStroke(strokeOf(i));
    expect(document.getElementById('wr-status').textContent).toBe('Kész, 1 javítással.');
    expect(done).toHaveBeenCalledWith('ok');
  });

  it('ugyanannál a vonásnál a második hiba után megmutatja a vonást, és ez már segítség', () => {
    const scribble = [[5, 100], [20, 60], [5, 20], [30, 5]];
    Wr.submitStroke(scribble);
    expect(document.querySelector('#wr-hint path')).toBeNull();
    Wr.submitStroke(scribble);
    expect(document.querySelector('#wr-hint path').getAttribute('d')).toBe(files.n5['学'][0][0]);
    expect(document.querySelector('#wr-hint circle')).not.toBeNull();
    for (let i = 0; i < 8; i++) Wr.submitStroke(strokeOf(i));
    expect(document.querySelector('#wr-hint path')).toBeNull(); // az elfogadott vonás után eltűnik
    expect(done).toHaveBeenCalledWith('helped');
  });

  it('a koppintás nem vonás; az Elölről törli a rajzot, de a hibák megmaradnak', () => {
    expect(Wr.submitStroke([[50, 50], [50.4, 50.3]])).toBeNull();
    expect(Wr.writingState().misses).toBe(0);
    Wr.submitStroke(strokeOf(3));              // sorrendhiba
    Wr.submitStroke(strokeOf(0)); Wr.submitStroke(strokeOf(1));
    Wr.writingRestart();
    expect(document.querySelectorAll('#wr-done path')).toHaveLength(0);
    expect(Wr.writingState()).toMatchObject({ index: 0, misses: 1 });
  });

  it('"Nem tudom": a hátralévő vonások megjelennek, az eredmény felfedve', () => {
    Wr.submitStroke(strokeOf(0));
    Wr.writingReveal();
    expect(document.querySelectorAll('#wr-done path')).toHaveLength(8);
    expect(document.querySelectorAll('#wr-done path.is-reveal')).toHaveLength(7);
    expect(document.getElementById('wr-status').textContent).toBe('Így kell megrajzolni.');
    expect(done).toHaveBeenCalledWith('revealed');
  });

  it('körvonallal átrajzolva nem pontozott, és a körvonal a következő kandzsinál is megmarad', async () => {
    Wr.writingToggleOutline();
    expect(document.getElementById('wr-outline').hasAttribute('hidden')).toBe(false);
    expect(document.querySelectorAll('#wr-outline path')).toHaveLength(8);
    expect(document.getElementById('wr-outline-btn').getAttribute('aria-pressed')).toBe('true');
    for (let i = 0; i < 8; i++) Wr.submitStroke(strokeOf(i));
    expect(done).toHaveBeenCalledWith('traced');

    document.body.innerHTML = `<div id="q-card">${Wr.writingHtml(word)}</div>`;
    const next = vi.fn();
    await Wr.initWriting(word, next);
    expect(document.getElementById('wr-outline').hasAttribute('hidden')).toBe(false);
    for (let i = 0; i < 8; i++) Wr.submitStroke(strokeOf(i));
    expect(next).toHaveBeenCalledWith('traced');
  });

  it('vonásadat nélkül nem pontoz, csak jelzi', async () => {
    document.body.innerHTML = `<div id="q-card">${Wr.writingHtml({ ...word, en: '猫' })}</div>`;
    const skipped = vi.fn();
    await Wr.initWriting({ ...word, en: '猫' }, skipped);
    expect(skipped).toHaveBeenCalledWith('skipped');
    expect(document.getElementById('wr-status').textContent).toContain('nem érhető el vonásadat');
  });
});
