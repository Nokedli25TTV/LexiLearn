// V13.66: a kandzsi jegyzetek (kanji_notes.js) adatai és a kandzsi lapja a teljes appal. Minden jegyzet
// létező kandzsihoz tartozik, csak ismert mezői vannak, rövid, nincs benne emoji és gondolatjel. A lap
// kandzsi módban az „i” gombról nyílik; a hibás válasz utáni sor kandzsinál nem jelenik meg.
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { bootApp } from './harness/boot.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, console: { log() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['kanji_data.js', 'kanji_notes.js']) vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const get = name => vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : null`, ctx);
const KANJI = new Map(get('KANJI_DATA').map(k => [k.kanji, k]));
const NOTES = get('KANJI_NOTES');
const entries = Object.entries(NOTES);
const FIELDS = ['parts', 'mn', 'kun', 'on'];
const wait = ms => new Promise(r => setTimeout(r, ms));

it('kandzsi jegyzetek: adat', () => {
  expect(entries.length).toBeGreaterThanOrEqual(865); // 1–14. adag: 1–72. lecke és a lecke nélküli 無
  // a kész leckék (1–72.) minden kandzsijának van jegyzete
  const batch1 = [...KANJI.values()].filter(k => k.lesson >= 1 && k.lesson <= 72).map(k => k.kanji);
  expect(batch1.filter(k => !NOTES[k])).toEqual([]);
  // az N5–N3 minden kandzsijának van jegyzete (V13.75), a lecke nélküliekének is
  expect([...KANJI.values()].filter(k => ['N5', 'N4', 'N3'].includes(k.jlpt) && !NOTES[k.kanji]).map(k => k.kanji)).toEqual([]);
  expect(entries.filter(([k]) => !KANJI.has(k)).map(([k]) => k)).toEqual([]);
  expect(entries.filter(([, v]) => Object.keys(v).some(f => !FIELDS.includes(f))).map(([k]) => k)).toEqual([]);
  expect(entries.filter(([, v]) => !(v.mn || v.parts) ||
    FIELDS.some(f => v[f] !== undefined && (typeof v[f] !== 'string' || !v[f].trim() || v[f].length > 200))).map(([k]) => k)).toEqual([]);
  const texts = entries.flatMap(([k, v]) => FIELDS.filter(f => v[f]).map(f => [k, v[f]]));
  expect(texts.filter(([, t]) => /\p{Extended_Pictographic}/u.test(t) || /[—]|--/.test(t)).map(([k]) => k)).toEqual([]);
  const glued = /[぀-ヿ][A-Za-zÀ-ž]|[A-Za-zÀ-ž][぀-ヿ]/;
  expect(texts.filter(([, t]) => glued.test(t)).map(([k]) => k)).toEqual([]);
  const src = readFileSync(path.join(ROOT, 'kanji_notes.js'), 'utf8');
  const keys = [...src.matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map(m => m[1]);
  expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  expect(keys.length).toBe(entries.length);
});

it('kandzsi lap az appban', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.kanji.words.length; i++) await wait(10);
  const doc = win.document;
  api.setMode('kanji');
  const kj = win.appData.kanji.words;
  const rest = kj.find(w => w.en === '休');
  const bare = kj.find(w => !NOTES[w.en] && w.onyomi);

  // „i” gomb jegyzettel zöld, a lap a felépítéssel és a teljes olvasatokkal
  expect(api.infoButtonHtml(rest)).toContain('has-note');
  expect(api.infoButtonHtml(rest)).toContain('Tudnivalók a kandzsiról');
  api.openWordInfo(rest.id);
  const body = doc.getElementById('word-info-body');
  expect(doc.getElementById('word-info-modal').classList.contains('open')).toBe(true);
  expect(doc.getElementById('word-info-word').textContent).toBe('休');
  expect(body.querySelector('.wi-parts').textContent).toBe('ember (亻) + fa (木)');
  const rows = [...body.querySelectorAll('.wi-reading')].map(r => r.textContent);
  expect(rows[0]).toContain('休む (やすむ)');
  expect(rows[1]).toContain('キュウ');
  expect(body.textContent).toContain('Kandzsi 5. lecke');
  expect(body.querySelector('.wi-empty')).toBeNull();
  api.closeWordInfo();

  // jegyzet nélkül: az adat olvasatai és a „még nincs leírás” sor
  expect(api.infoButtonHtml(bare)).not.toContain('has-note');
  api.openWordInfo(bare.id);
  expect(body.querySelector('.wi-empty').textContent).toBe('Ehhez a kandzsihoz még nincs leírás.');
  expect(body.textContent).toContain(bare.onyomi);
  api.closeWordInfo();

  // a hibás válasz utáni sor kandzsinál nincs (csak a lap)
  expect(api.missNoteHtml(rest)).toBe('');
  expect(api.watchLineHtml(rest)).toBe('');

  // angol módban továbbra sincs lap
  api.setMode('english');
  expect(api.infoButtonHtml(win.appData.english.words[0])).toBe('');
  await wait(600);
});
