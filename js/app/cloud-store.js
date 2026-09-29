// LexiLearn – app/cloud-store.js
// V13.4: a felhő adat több Firestore dokumentumban (users/{uid}/data/...), az egykori
// egyetlen "snapshot" dokumentum 1 MiB-os korlátja helyett.
//
//   v2_manifest            kis index: updatedAt + minden rész hash-e (ezt figyeli a listener)
//   v2_{mód}_meta          globalStats + dailyQuests + saját listák
//   v2_{mód}_w0 … w7       a mentett szavak, id hash szerint 8 vödörbe osztva
//
// Mentéskor csak a megváltozott részek íródnak (a manifesttel együtt, egy atomi batch-ben).
// A régi "snapshot" dokumentum érintetlen marad biztonsági mentésnek; az első V2 szinkron
// eszközönként egyszer megnézi, hátha egy még régi verziójú eszköz frissebbet írt bele.
//
// A Firestore függvényeket kívülről kapja (fs), így Firestore nélkül is tesztelhető.

const LANGS = ['english', 'japanese', 'kanji'];
const WORD_BUCKETS = 8;
const MANIFEST_ID = 'v2_manifest';
const LEGACY_ID = 'snapshot';
const PART_WARN_BYTES = 800 * 1024; // Firestore dokumentum limit: 1 MiB

// Kulcssorrendtől független JSON (a Firestore-ból visszaolvasott objektumok sorrendje eltérhet)
function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(v => stableStringify(v === undefined ? null : v)).join(',') + ']';
  const keys = Object.keys(value).filter(k => value[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

// FNV-1a, 32 bit
function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

function bucketOf(id) { return hashString(String(id)) % WORD_BUCKETS; }

function partIdsFor(lang) {
  return [`v2_${lang}_meta`, ...Array.from({ length: WORD_BUCKETS }, (_, b) => `v2_${lang}_w${b}`)];
}

// { words:{lang:[]}, stats:{lang:{…}}, playlists:{lang:[]} }  →  { partId: dokumentum }
function splitSnapshot(snap) {
  const parts = {};
  LANGS.forEach(lang => {
    parts[`v2_${lang}_meta`] = { lang, kind: 'meta', stats: snap.stats?.[lang] || null, playlists: snap.playlists?.[lang] || [] };
    for (let b = 0; b < WORD_BUCKETS; b++) parts[`v2_${lang}_w${b}`] = { lang, kind: 'words', words: [] };
    (snap.words?.[lang] || []).forEach(w => parts[`v2_${lang}_w${bucketOf(w.id)}`].words.push(w));
  });
  return parts;
}

// A részekből újra az applyCloudSnapshot által várt alak (mély másolat, hogy a cache ne
// keveredjen össze az élő appData objektumaival)
function joinParts(parts, updatedAt) {
  const snap = { words: {}, stats: {}, playlists: {}, updatedAt };
  Object.keys(parts).sort().forEach(id => {
    const p = parts[id];
    if (!p || !LANGS.includes(p.lang)) return;
    if (p.kind === 'meta') {
      if (p.stats) snap.stats[p.lang] = p.stats;
      snap.playlists[p.lang] = p.playlists || [];
    } else if (p.kind === 'words') {
      (snap.words[p.lang] ||= []).push(...(p.words || []));
    }
  });
  return JSON.parse(JSON.stringify(snap));
}

function hashParts(parts) {
  const out = {};
  Object.keys(parts).forEach(id => { out[id] = hashString(stableStringify(parts[id])).toString(16); });
  return out;
}

// Első V2 szinkron egy eszközön: melyik felhő állapotból induljunk?
// Legfrissebb nyer (kliens updatedAt), ahogy eddig is.
function chooseInitialSource(manifest, legacy) {
  if (!manifest && !legacy) return 'empty';
  if (!manifest) return 'legacy';
  if (!legacy) return 'v2';
  return (legacy.updatedAt || 0) > (manifest.updatedAt || 0) ? 'legacy' : 'v2';
}

function createCloudStore({ fs, db, uid, log = console }) {
  const ref = id => fs.doc(db, 'users', uid, 'data', id);
  let knownUpdatedAt = null;   // a felhő manifest updatedAt-je, amit utoljára láttunk / írtunk
  let pendingUpdatedAt = null; // épp íródó saját mentés (a listener echo-jának elnyomásához)
  let knownHashes = {};        // a felhőben lévő részek hash-e (a manifestből)
  const cache = {};            // partId → { hash, data }

  const read = async id => { const d = await fs.getDoc(ref(id)); return d.exists() ? d.data() : null; };

  async function fetchFromManifest(manifest) {
    const ids = Object.keys(manifest.parts || {});
    const need = ids.filter(id => cache[id]?.hash !== manifest.parts[id]);
    const docs = await Promise.all(need.map(read));
    need.forEach((id, i) => { cache[id] = { hash: manifest.parts[id], data: docs[i] }; });
    Object.keys(cache).forEach(id => { if (!ids.includes(id)) delete cache[id]; });
    knownHashes = { ...manifest.parts };
    knownUpdatedAt = manifest.updatedAt;
    const parts = {};
    ids.forEach(id => { if (cache[id].data) parts[id] = cache[id].data; });
    return { snap: joinParts(parts, manifest.updatedAt), fetched: need.length };
  }

  // Betöltés. firstOnThisDevice: az eszköz még nem szinkronizált V2-vel → a régi doc-ot is megnézzük.
  async function load({ firstOnThisDevice }) {
    const manifest = await read(MANIFEST_ID);
    const legacy = (firstOnThisDevice || !manifest) ? await read(LEGACY_ID) : null;
    const source = chooseInitialSource(manifest, legacy);
    if (source === 'v2') return { source, ...(await fetchFromManifest(manifest)) };
    if (source === 'legacy') return { source, snap: legacy };
    return { source, snap: null };
  }

  async function save(snap) {
    const parts = splitSnapshot(snap);
    const hashes = hashParts(parts);
    const changed = Object.keys(parts).filter(id => knownHashes[id] !== hashes[id]);
    // Semmi sem változott → nem írunk (különben két eszköz a végtelenségig visszhangozná egymást)
    if (!changed.length && Object.keys(knownHashes).length === Object.keys(hashes).length) return { written: 0, bytes: 0, skipped: true };
    let bytes = 0;
    changed.forEach(id => {
      const size = JSON.stringify(parts[id]).length;
      bytes += size;
      if (size > PART_WARN_BYTES) log.warn(`[CloudStore] A(z) ${id} rész ${(size / 1024).toFixed(0)} KB, közel az 1 MiB limithez.`);
    });
    const batch = fs.writeBatch(db);
    changed.forEach(id => batch.set(ref(id), parts[id]));
    batch.set(ref(MANIFEST_ID), { version: 2, updatedAt: snap.updatedAt, parts: hashes, serverUpdatedAt: fs.serverTimestamp() });
    pendingUpdatedAt = snap.updatedAt;
    await batch.commit();
    changed.forEach(id => { cache[id] = { hash: hashes[id], data: JSON.parse(JSON.stringify(parts[id])) }; });
    knownHashes = hashes;
    knownUpdatedAt = snap.updatedAt;
    return { written: changed.length, bytes };
  }

  // Más eszközről érkező változások: csak a manifestet figyeljük, és csak a változott részeket töltjük le.
  function watch(onRemote, onError) {
    return fs.onSnapshot(ref(MANIFEST_ID), async d => {
      if (!d.exists() || d.metadata?.hasPendingWrites) return;
      const m = d.data();
      if (!m?.updatedAt || m.updatedAt === knownUpdatedAt || m.updatedAt === pendingUpdatedAt) return;
      try {
        const { snap, fetched } = await fetchFromManifest(m);
        onRemote(snap, fetched);
      } catch (err) { onError(err); }
    }, onError);
  }

  return { load, save, watch };
}

export {
  LANGS, WORD_BUCKETS, MANIFEST_ID, LEGACY_ID,
  stableStringify, hashString, bucketOf, partIdsFor, splitSnapshot, joinParts, hashParts,
  chooseInitialSource, createCloudStore
};
