// Determinisztikus böngésző-környezet a golden master teszthez.
// Ugyanez fut a régi (klasszikus script) és az új (ES modul) kódon is, így a
// két verzió kimenete összehasonlítható.

// A rögzített "most": 2026-09-29 10:00 helyi idő (kedd)
export const FIXED_NOW = new Date(2026, 8, 29, 10, 0, 0).getTime();

// A célkörnyezetben (jsdom ablak) lefuttatandó kód: tárhely, hang, média stubok
export const ENV_SETUP_CODE = `
  (function () {
    const store = new Map();
    const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
    window.localforage = {
      getItem: async k => (store.has(k) ? clone(store.get(k)) : null),
      setItem: async (k, v) => { store.set(k, clone(v)); return v; },
      removeItem: async k => { store.delete(k); },
      clear: async () => store.clear(),
      __dump: () => Object.fromEntries(store)
    };
    window.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [], speaking: false, onvoiceschanged: null };
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    window.Audio = function () { this.play = () => Promise.resolve(); this.pause = () => {}; this.setAttribute = () => {}; };
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    window.confirm = () => true;
    window.scrollTo = () => {};
    if (!window.CSS) window.CSS = {};
    if (!window.CSS.escape) window.CSS.escape = s => String(s).replace(/["\\\\]/g, '\\\\$&');
  })();
`;

// Mulberry32 – kicsi, determinisztikus PRNG
export function makeRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a hash nagy JSON-okhoz (pl. a teljes szólista), hogy a golden fájl kicsi maradjon
export function hash(value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `${str.length}:${h.toString(16)}`;
}

// Az index.html body-ja szkriptek nélkül (a szkripteket a harness tölti be)
export function bodyWithoutScripts(indexHtml) {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(indexHtml)[1];
  const bodyAttrs = /<body([^>]*)>/i.exec(indexHtml)[1];
  return { body: body.replace(/<script[\s\S]*?<\/script>/gi, ''), bodyAttrs };
}
