// V13.94: a Dekiru 2. könyv példamondatai (japanese_sentences2.js). Minden mondat egy 2. könyves szóhoz
// tartozik, a kana felolvasás pontosan a furiganás mondat olvasata, a kitöltős mondat a felolvasás a szó
// helyén ___BLANK___-kel, az írott alak benne van a mondatban, és a mondatépítő 3–7 darabra tudja bontani.
// A kész leckék minden szavának van mondata. Az app a mondatkiegészítőben kana lehetőségeket mutat.
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
for (const f of ['dekiru.js', 'dekiru2.js', 'japanese_sentences.js', 'japanese_sentences2.js', 'data-registry.js']) {
  vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const D = ctx.window.LEXI_DATA;
const BOOK2 = vm.runInContext('JAPANESE_SENTENCES_BOOK2', ctx);
const ALL = D.japaneseSentenceLessons.flat();
const DEKIRU = D.dekiruLessons.flat();
const firstLesson = new Map();
DEKIRU.forEach(w => { if (!firstLesson.has(w.kana)) firstLesson.set(w.kana, Math.min(...(w.lesson || [99]))); });
const RUBY = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
const KANJI = /[一-龯㐀-䶿々]/;
const FIELDS = ['baseWord', 'sentenceWithBlank', 'fullSentenceHTML', 'ttsSentence', 'correctAnswer', 'hungarian'];
const bare = w => w.replace(/^[(（][^)）]*[)）]/, '').replace(/[()（）～〜]/g, ''); // (ゆびを)あてる → あてる, ぶん(か)けい → ぶんかけい, ～ひ → ひ
const DONE = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38]; // a kész leckék (1–7. adag)

it('2. könyv példamondatai: adat', () => {
  expect(BOOK2.length).toBeGreaterThanOrEqual(504); // 1–7. adag: 25–38. lecke
  const bad = (name, test) => expect(BOOK2.filter(s => !test(s)).map(s => `${name}: ${s.baseWord}`)).toEqual([]);
  bad('mezők', s => Object.keys(s).every(k => FIELDS.includes(k)) && FIELDS.every(k => typeof s[k] === 'string' && s[k].trim()));
  bad('2. könyves szó', s => firstLesson.get(s.baseWord) >= 25);
  bad('felolvasás = furigana olvasata', s => s.ttsSentence === s.fullSentenceHTML.replace(RUBY, (_, w, r) => r));
  bad('kitöltős mondat', s => s.sentenceWithBlank.split('___BLANK___').length === 2 &&
    s.sentenceWithBlank.replace('___BLANK___', bare(s.baseWord)) === s.ttsSentence);
  bad('írott alak a mondatban', s => s.fullSentenceHTML.replace(RUBY, (_, w) => w).includes(s.correctAnswer));
  bad('kana felolvasás', s => !KANJI.test(s.ttsSentence) && !KANJI.test(s.sentenceWithBlank) && !/[<>]/.test(s.ttsSentence));
  bad('3–7 darab', s => {
    const n = s.ttsSentence.split(/\s+/).length;
    return n >= 3 && n <= 7 && s.fullSentenceHTML.split(/\s+/).length === n;
  });
  bad('fordítás', s => /[.?!]$/.test(s.hungarian) && !/[—]|--/.test(s.hungarian) && !/\p{Extended_Pictographic}/u.test(s.hungarian));
  const words = BOOK2.map(s => s.baseWord);
  expect(words.filter((w, i) => words.indexOf(w) !== i)).toEqual([]);
  // a kész leckék minden szavának van mondata (bármelyik fájlban)
  const has = new Set(ALL.map(s => s.baseWord));
  expect([...firstLesson].filter(([k, l]) => DONE.includes(l) && !has.has(k)).map(([k]) => k)).toEqual([]);
});

it('a japán mondatokban nincs koreai írásjel', () => {
  expect(ALL.filter(s => /[ᄀ-ᇿ㄰-㆏가-힯]/.test(FIELDS.map(f => s[f]).join(' '))).map(s => s.baseWord)).toEqual([]);
});

it('a 2. könyv mondatai az appban: mondatépítő, kiemelés, kana lehetőségek', async () => {
  const { api, win } = await bootApp();
  api.setMode('japanese');
  const ja = win.appData.japanese;
  const word = ja.words.find(w => w.en === 'きこくする');
  expect(api.buildableSentences(word, 'japanese')).toHaveLength(1);
  // az okuriganás írott alak (帰国する) szakasza kiemelve
  expect(api.getExampleSentence(word).html).toContain('<span class="fc-highlight"><ruby>帰国<rt>きこく</rt></ruby>する</span>');

  // mondatkiegészítő, olvasás irány: a helyes lehetőség a szó kana alakja, a mondatba az írott alak kerül
  const kanjiAnswer = ja.words.find(w => w.en === 'しょくいん');
  ja.practice = {
    type: 'sentenceFill', roundNumber: 1, roundWords: [kanjiAnswer.id, word.id], currentIdx: 0,
    errorList: [], roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
  };
  api.showScreen('practice');
  api.showQuestion();
  const options = [...win.document.querySelectorAll('.opt-btn')].map(b => b.textContent);
  expect(options).toContain('しょくいん');
  expect(options).not.toContain('職員');
  api.checkSentenceAnswer(win.document.querySelector('.opt-btn'), 'しょくいん');
  expect(win.document.getElementById('blank-space').textContent).toBe('職員');
});
