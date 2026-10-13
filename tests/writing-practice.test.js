// V13.13: írásgyakorlás a teljes appal. Kandzsi módban a dokkból indítható; a hibátlanul megrajzolt
// kandzsi helyes válasz, a "Nem tudom" hibás, és a kör a szokásos kör vége képernyővel zárul.
import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootApp } from './harness/boot.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = ms => new Promise(r => setTimeout(r, ms));
const n5 = JSON.parse(readFileSync(path.join(ROOT, 'kanjivg', 'n5.json'), 'utf8'));

it('kandzsi módban: Írás típus a dokkban, rajzolás, pontozás, kör vége', async () => {
  const { api, win } = await bootApp();
  globalThis.fetch = vi.fn(async url => ({ ok: true, json: async () => JSON.parse(readFileSync(path.join(ROOT, String(url)), 'utf8')) }));
  for (let i = 0; i < 200 && !win.appData.kanji.words.length; i++) await wait(10);
  const doc = win.document;

  // Az Írás csak kandzsi módban választható
  expect(api.practiceTypesFor('japanese').map(t => t.value)).not.toContain('writing');
  expect(api.practiceTypesFor('kanji').map(t => t.value)).toContain('writing');

  api.setMode('kanji');
  const kj = win.appData.kanji;
  const one = kj.words.find(w => w.en === '一'), three = kj.words.find(w => w.en === '三');
  kj.selectedIds = new Set([one.id, three.id]);
  kj.practiceOptions = { type: 'writing', count: 10, order: 'az' };
  api.showScreen('dashboard');
  const dock = doc.getElementById('dock-settings').textContent;
  expect(dock).toContain('Rajzold meg vonásonként');
  expect(dock).not.toContain('Irány');               // írásnál nincs irány
  expect(doc.getElementById('dock-summary').textContent).toBe('Írás · 10');

  api.startPractice();
  await wait(30);
  expect(doc.body.dataset.screen).toBe('practice');
  const first = kj.words.find(w => w.id === kj.practice.roundWords[0]);
  const second = kj.words.find(w => w.id === kj.practice.roundWords[1]);
  expect(doc.querySelector('.wr-meaning').textContent).toBe(first.hu);
  expect(doc.getElementById('wr-svg')).not.toBeNull();

  // 1. kandzsi: minden vonás pontosan → helyes válasz, magától továbblép
  const before = { ...first.stats };
  n5[first.en].forEach(s => expect(api.submitStroke(api.pathToPolyline(s[0]))).toBe('ok'));
  expect(doc.getElementById('wr-status').textContent).toBe('Hibátlan.');
  expect(first.stats.totalCorrect).toBe((before.totalCorrect || 0) + 1);
  expect(first.stats.streak).toBe((before.streak || 0) + 1);
  expect(kj.practice.roundCorrect).toBe(1);
  await wait(1250);
  expect(kj.practice.currentIdx).toBe(1);
  await wait(30);
  expect(doc.querySelector('.wr-meaning').textContent).toBe(second.hu);

  // 2. kandzsi: "Nem tudom" → hibás, a következő körbe kerül, Tovább gombbal megy tovább
  api.writingReveal();
  expect(second.stats.totalWrong).toBe(1);
  expect(second.stats.streak).toBe(0);
  expect(kj.practice.errorList).toEqual([second.id]);
  await wait(600);
  expect(doc.getElementById('next-btn-container').style.display).toBe('block');
  api.manualNextQuestion();
  expect(doc.body.dataset.screen).toBe('roundend');
  expect(doc.getElementById('re-correct').textContent).toBe('1');
  expect(doc.getElementById('re-wrong').textContent).toBe('1');

  // Más módban a régi beállítás nem indít írást (nincs vonásadat a szavakhoz)
  api.setMode('japanese');
  const ja = win.appData.japanese;
  ja.selectedIds = new Set(ja.words.slice(0, 4).map(w => w.id));
  ja.practiceOptions = { type: 'writing', count: 10, order: 'random' };
  api.showScreen('dashboard');
  api.startPractice();
  expect(ja.practice.type).toBe('classic');
});
