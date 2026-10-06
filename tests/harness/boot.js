// Az ES modul verzió elindítása a Vitest jsdom környezetében, ugyanolyan determinisztikus
// beállításokkal, mint amivel a régi app.js-ből a golden master készült.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { vi } from 'vitest';
import { ENV_SETUP_CODE, FIXED_NOW, makeRandom, bodyWithoutScripts } from './env.js';

// Node path/url (a jsdom környezet URL-je nem kezel file: sémát)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const abs = f => path.join(ROOT, f);
const read = f => readFileSync(abs(f), 'utf8');
export const DATA_FILES = ['data.js', 'japanese_words.js', 'jlpt_n3_words.js', 'dekiru.js', 'dekiru2.js', 'kanji_data.js', 'japanese_sentences.js', 'english_sentences2.js', 'data-registry.js'];

function listModules(dir) {
  return readdirSync(abs(dir)).flatMap(name => {
    const rel = `${dir}/${name}`;
    return statSync(abs(rel)).isDirectory() ? listModules(rel) : name.endsWith('.js') ? [rel] : [];
  });
}

/**
 * Felépíti az oldalt (index.html body), betölti az adatokat, importálja az összes modult
 * (a main.js-t utoljára, ez indítja az appot), és visszaadja az exportált függvényeket.
 */
export async function bootApp({ seed = 1 } = {}) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(FIXED_NOW));

  let rnd = makeRandom(seed);
  Math.random = () => rnd();
  const reseed = n => { rnd = makeRandom(n); };

  const { body, bodyAttrs } = bodyWithoutScripts(read('index.html'));
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.innerHTML = body;
  const screenAttr = /data-screen="([^"]+)"/.exec(bodyAttrs);
  if (screenAttr) document.body.dataset.screen = screenAttr[1];

  vm.runInThisContext(ENV_SETUP_CODE);
  // Node 26 saját (kísérleti) localStorage-a --localstorage-file nélkül használhatatlan, és
  // eltakarja a jsdom-ét: memóriabeli Storage-ot adunk helyette (üres tár, mint a régi harnessben)
  if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
    const mem = new Map();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)),
      removeItem: k => mem.delete(k), clear: () => mem.clear(), key: i => [...mem.keys()][i] ?? null,
      get length() { return mem.size; } } });
  }
  if (typeof globalThis.requestAnimationFrame !== 'function') globalThis.requestAnimationFrame = cb => setTimeout(cb, 16);
  for (const f of DATA_FILES) vm.runInThisContext(read(f), { filename: f });

  const modules = listModules('js').filter(f => f !== 'js/main.js');
  const api = {};
  for (const f of modules) Object.assign(api, await import(/* @vite-ignore */ pathToFileURL(abs(f)).href));
  await import(/* @vite-ignore */ pathToFileURL(abs('js/main.js')).href);
  return { api, reseed, win: window };
}
