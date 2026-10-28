// A service worker telepítése (cache.addAll) egyetlen hiányzó fájl miatt is elbukik, és akkor az app
// egyáltalán nem működik offline (V13.9 előtt a nem létező favicon-32.png miatt így volt).
import { it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const block = src.slice(src.indexOf('const STATIC_ASSETS'), src.indexOf('];', src.indexOf('const STATIC_ASSETS')));
const local = [...block.matchAll(/'(\.\/[^']+)'/g)].map(m => m[1].slice(2));

function listModules(dir) {
  return readdirSync(path.join(ROOT, dir)).flatMap(name => {
    const rel = `${dir}/${name}`;
    return statSync(path.join(ROOT, rel)).isDirectory() ? listModules(rel) : name.endsWith('.js') ? [rel] : [];
  });
}

it('az előtöltési lista minden helyi fájlja létezik', () => {
  expect(local.length).toBeGreaterThan(40);
  expect(local.filter(f => !existsSync(path.join(ROOT, f)))).toEqual([]);
});

it('minden ES modul (js/) benne van az előtöltésben, különben offline nem indul az app', () => {
  expect(listModules('js').filter(f => !local.includes(f))).toEqual([]);
});

// V13.25: a hangkérés (Range fejléc / audio) és a nem listázott külső kérés nem megy át a service workeren.
// iOS-en a továbbadott hangkérésből nem szólt semmi, ezért volt néma a kiejtés.
it('a kiejtés hangját és a külső kéréseket a service worker nem veszi át', async () => {
  const vm = await import('node:vm');
  const handlers = {};
  const ctx = {
    self: { addEventListener: (type, fn) => { handlers[type] = fn; }, location: { origin: 'https://nokedli25ttv.github.io' } },
    caches: { match: () => Promise.resolve(undefined), open: () => Promise.resolve({ put: () => Promise.resolve() }) },
    fetch: () => Promise.resolve(new Response('x')), URL, Request, Response, Headers, console
  };
  vm.runInNewContext(src, ctx);
  const handled = (url, { destination = 'script', range = false, mode = 'cors' } = {}) => {
    let taken = false;
    handlers.fetch({
      request: { method: 'GET', url, mode, destination, headers: new Headers(range ? { range: 'bytes=0-1' } : {}) },
      respondWith: () => { taken = true; }
    });
    return taken;
  };
  const app = 'https://nokedli25ttv.github.io/LexiLearn/';
  expect(handled('https://translate.googleapis.com/translate_tts?q=x&tl=ja', { destination: 'audio', mode: 'no-cors', range: true })).toBe(false);
  expect(handled('https://translate.googleapis.com/translate_tts?q=x&tl=en', { destination: 'audio', mode: 'no-cors' })).toBe(false);
  expect(handled('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?x=1', { destination: '' })).toBe(false);
  expect(handled(`${app}js/main.js`, { range: true })).toBe(false);
  expect(handled(`${app}js/main.js`)).toBe(true);
  expect(handled(`${app}index.html`, { destination: 'document', mode: 'navigate' })).toBe(true);
  expect(handled('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js')).toBe(true);
  expect(handled('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js')).toBe(true);
});
