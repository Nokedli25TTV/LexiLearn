// LexiLearn demó: a tárolók memóriabeli másolatai. A tools/demo.html tölti be az app scriptjei ELŐTT,
// így a demó semmit nem olvas ki és semmit nem ír a böngésző valódi tárhelyébe (IndexedDB, localStorage).
// Az oldal újratöltésekor minden elölről indul.
(function () {
  const mem = new Map();
  const clone = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
  window.localforage = {
    getItem: async key => (mem.has(key) ? clone(mem.get(key)) : null),
    setItem: async (key, value) => { mem.set(key, clone(value)); return value; },
    removeItem: async key => { mem.delete(key); },
    clear: async () => { mem.clear(); },
    keys: async () => [...mem.keys()]
  };

  const ls = new Map([['lexi_theme', new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark']]);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => (ls.has(key) ? ls.get(key) : null),
      setItem: (key, value) => { ls.set(key, String(value)); },
      removeItem: key => { ls.delete(key); },
      clear: () => { ls.clear(); },
      key: i => [...ls.keys()][i] ?? null,
      get length() { return ls.size; }
    }
  });
  // A demó nem telepít service workert: fejlesztés közben így mindig a friss fájlok töltődnek be
  if (navigator.serviceWorker) navigator.serviceWorker.register = () => new Promise(() => {});
  window.LEXI_DEMO = true;
})();
