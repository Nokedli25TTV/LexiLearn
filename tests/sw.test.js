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
