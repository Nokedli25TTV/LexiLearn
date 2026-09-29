// Memóriában futó Firestore utánzat a felhő szinkron tesztjeihez.
// Csak azt tudja, amit a cloud-store.js / firebase-sync.js használ: doc, getDoc, writeBatch,
// onSnapshot, serverTimestamp. A visszaolvasott objektumok kulcssorrendjét szándékosan
// megfordítja (a valódi Firestore sem őrzi meg), és 1 MiB fölötti dokumentumot elutasít.

const clone = v => JSON.parse(JSON.stringify(v));
const reverseKeys = v => {
  if (Array.isArray(v)) return v.map(reverseKeys);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).reverse().map(k => [k, reverseKeys(v[k])]));
  return v;
};

export function createFakeFirestore() {
  const docs = new Map();      // path → data
  const listeners = new Map(); // path → Set(cb)
  const stats = { reads: 0, writes: 0, commits: 0 };

  const snapOf = path => ({
    exists: () => docs.has(path),
    data: () => (docs.has(path) ? reverseKeys(clone(docs.get(path))) : undefined),
    metadata: { hasPendingWrites: false }
  });

  const fs = {
    doc: (_db, ...segments) => segments.join('/'),
    serverTimestamp: () => ({ __serverTimestamp: true }),
    async getDoc(path) { stats.reads++; return snapOf(path); },
    writeBatch() {
      const ops = [];
      return {
        set(path, data) { ops.push([path, clone(data)]); },
        async commit() {
          for (const [path, data] of ops) {
            if (JSON.stringify(data).length > 1024 * 1024) throw new Error(`Dokumentum túl nagy: ${path}`);
          }
          ops.forEach(([path, data]) => docs.set(path, data));
          stats.writes += ops.length; stats.commits++;
          await Promise.resolve();
          ops.forEach(([path]) => (listeners.get(path) || []).forEach(cb => cb(snapOf(path))));
        }
      };
    },
    onSnapshot(path, cb) {
      if (!listeners.has(path)) listeners.set(path, new Set());
      listeners.get(path).add(cb);
      if (docs.has(path)) Promise.resolve().then(() => cb(snapOf(path)));
      return () => listeners.get(path).delete(cb);
    }
  };
  return { fs, db: {}, docs, stats, put: (path, data) => docs.set(path, clone(data)) };
}
