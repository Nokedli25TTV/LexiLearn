// A README "Így néz ki" képeinek előállítása: docs/readme/igy-nez-ki-1.webp és -2.webp.
//
//   npm run serve                  (egy másik terminálban; http://localhost:5599)
//   node tools/readme-shots.mjs
//
// Egy fej nélküli Edge-et vagy Chrome-ot indít ideiglenes profillal, megnyitja a tools/showcase.html két sorát
// (négy telefon, mindegyikben az élő demó egy jelenete), megvárja, míg minden jelenet beáll, és lefényképezi.
// Nincs hozzá külön csomag: a böngészőt a DevTools protokollon (CDP) át vezérli, a Node beépített WebSocketjével.
// Más böngésző: BROWSER=<útvonal>; más cím: BASE=http://localhost:8080; más formátum: FORMAT=png
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.BASE || 'http://127.0.0.1:5599').replace(/\/$/, '');
const WIDTH = 1120, SCALE = 2; // a kép 2240 képpont széles
const ROWS = [1, 2];
const FORMAT = process.env.FORMAT || 'webp'; // webp: átlátszó sarkok, a PNG méretének töredéke

const BROWSERS = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'
].filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const exe = BROWSERS.find(p => existsSync(p));
  if (!exe) throw new Error('Nem találok Edge-et vagy Chrome-ot. Add meg: BROWSER=<útvonal>');
  // "serve" kiterjesztés nélküli címeket ad (tools/showcase), más szerver a .html-t várja
  const page = await ['tools/showcase', 'tools/showcase.html'].reduce(async (found, path) => {
    if (await found) return found;
    const res = await fetch(`${BASE}/${path}`, { redirect: 'manual' }).catch(() => null);
    return res && res.status === 200 ? path : null;
  }, null);
  if (!page) throw new Error(`A ${BASE} címen nem érem el az appot. Indítsd el: npm run serve`);

  const profile = mkdtempSync(join(tmpdir(), 'lexilearn-shots-'));
  const browser = spawn(exe, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  try {
    const wsUrl = await new Promise((ok, fail) => {
      let log = '';
      const timer = setTimeout(() => fail(new Error('A böngésző nem indult el.\n' + log)), 20000);
      browser.stderr.on('data', chunk => {
        log += chunk;
        const m = /DevTools listening on (ws:\/\/\S+)/.exec(log);
        if (m) { clearTimeout(timer); ok(m[1]); }
      });
      browser.on('exit', code => { clearTimeout(timer); fail(new Error(`A böngésző kilépett (${code}).\n${log}`)); });
    });

    const ws = new WebSocket(wsUrl);
    await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = () => fail(new Error('Nem sikerült csatlakozni a böngészőhöz.')); });
    const pending = new Map();
    let nextId = 1;
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.fail(new Error(msg.error.message)); else p.ok(msg.result);
    };
    const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
      const id = nextId++;
      pending.set(id, { ok, fail });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const cdp = (method, params) => send(method, params, sessionId);
    const evaluate = async expression => (await cdp('Runtime.evaluate', { expression, returnByValue: true })).result.value;
    await cdp('Page.enable');
    await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }); // lekerekített, átlátszó sarkok

    for (const row of ROWS) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: SCALE, mobile: false });
      await cdp('Page.navigate', { url: `${BASE}/${page}?row=${row}` });
      let state = null;
      for (let t = 0; t < 90000 && !state; t += 250) {
        await sleep(250);
        state = await evaluate('window.__showcaseError ? "error: " + window.__showcaseError : window.__showcaseReady ? "ready" : ""').catch(() => null);
      }
      if (state !== 'ready') throw new Error(`${row}. sor: ${state || 'nem állt be időben'}`);
      const [w, h] = await evaluate('window.__showcaseSize');
      await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: SCALE, mobile: false });
      await sleep(400);
      const { data } = await cdp('Page.captureScreenshot', { format: FORMAT, quality: 90, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
      const out = join(ROOT, 'docs', 'readme', `igy-nez-ki-${row}.${FORMAT}`);
      writeFileSync(out, Buffer.from(data, 'base64'));
      console.log(`${out}  (${w * SCALE} × ${h * SCALE})`);
    }
    await send('Browser.close').catch(() => {});
    ws.close();
  } finally {
    browser.kill();
    await sleep(300);
    try { rmSync(profile, { recursive: true, force: true }); } catch (_) { /* a böngésző még fogja; az ideiglenes mappában marad */ }
  }
}

main().catch(err => { console.error(err.message || err); process.exitCode = 1; });
