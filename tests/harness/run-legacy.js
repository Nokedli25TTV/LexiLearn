// A RÉGI (klasszikus scriptes) app.js futtatása jsdom-ban, determinisztikus környezetben.
// Használat: node tests/harness/run-legacy.js > /tmp/legacy.json  (a V13.2 kimenete; a golden azóta tests/golden/expected.json)
// Csak a refaktor előtti golden master rögzítésére kell: a régi app.js a git történetből jön
// (LEGACY_REF, alapból a V13.2 commit, az utolsó, amiben még egyben volt).
import { execSync } from 'node:child_process';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ENV_SETUP_CODE, FIXED_NOW, bodyWithoutScripts } from './env.js';
import { capture } from './capture.js';

const LEGACY_REF = process.env.LEGACY_REF || '2c8df8f';

const { body, bodyAttrs } = bodyWithoutScripts(execSync(`git show ${LEGACY_REF}:index.html`, { encoding: 'utf8' }));
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(String(e.message || e)));
vc.on('error', (...a) => errors.push(a.join(' ')));

const dom = new JSDOM(`<!DOCTYPE html><html lang="hu" data-theme="dark"><head></head><body${bodyAttrs}>${body}</body></html>`,
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost:5599/', virtualConsole: vc });
const win = dom.window;

const run = code => { const s = win.document.createElement('script'); s.textContent = code; win.document.body.appendChild(s); };
run(ENV_SETUP_CODE);
run(`(function () {
  const RealDate = Date, FIXED = ${FIXED_NOW};
  function FakeDate(...a) { if (!new.target) return new RealDate(FIXED).toString(); return a.length ? new RealDate(...a) : new RealDate(FIXED); }
  FakeDate.prototype = RealDate.prototype; FakeDate.now = () => FIXED; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
  window.Date = FakeDate;
  window.__setSeed = function (seed) {
    let a = seed >>> 0;
    Math.random = function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  window.__setSeed(1);
})();`);

const fromGit = f => execSync(`git show ${LEGACY_REF}:${f}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
for (const f of ['data.js', 'japanese_words.js', 'dekiru.js', 'kanji_data.js', 'japanese_sentences.js', 'english_sentences2.js', 'app.js']) run(fromGit(f));

const result = await capture(win, win, seed => win.__setSeed(seed));
result.__errors = errors.filter(e => !/Not implemented: (navigation|HTMLMediaElement)/.test(e));
process.stdout.write(JSON.stringify(result, null, 2));
win.close();
