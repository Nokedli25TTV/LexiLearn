// A felhő tároló (több Firestore dokumentum) tesztjei: felosztás, migráció a régi egyetlen
// "snapshot" dokumentumból, csak a változott részek írása, két eszköz közti szinkron, méret.
import { describe, it, expect } from 'vitest';
import {
  splitSnapshot, joinParts, hashParts, bucketOf, chooseInitialSource, createCloudStore,
  WORD_BUCKETS, MANIFEST_ID, LEGACY_ID
} from '../../js/app/cloud-store.js';
import { createFakeFirestore } from '../fakes/firestore.js';

const UID = 'u1';
const path = id => `users/${UID}/data/${id}`;
const flush = () => new Promise(r => setTimeout(r, 0));
const quiet = { warn() {} };

// Valószerű felhő snapshot: N3 szintű mennyiségnél is (kb. 6000 gyakorolt szó)
function makeSnap(n = { english: 40, japanese: 120, kanji: 30 }, updatedAt = 1000) {
  const snap = { words: {}, stats: {}, playlists: {}, updatedAt };
  Object.entries(n).forEach(([lang, count]) => {
    snap.words[lang] = Array.from({ length: count }, (_, i) => ({
      id: `${lang.slice(0, 2)}_${i.toString(36)}_szo`, en: `word ${i}`, source: 'data_js', bookmarked: i % 7 === 0,
      stats: { streak: i % 6, totalCorrect: i % 11, totalWrong: i % 3, lastAttempt: 1790000000000 + i, learnedAt: '2026-09-01' }
    }));
    snap.stats[lang] = {
      globalStats: { dailyGoal: 10, daily: { '2026-09-28': { a: 10, c: 8, k: 2, g: 1, s: 300 } }, sessionHistory: [] },
      dailyQuests: { date: '2026-09-29', list: [] }
    };
    snap.playlists[lang] = [{ id: `pl_${lang}`, name: 'Saját', ids: ['a', 'b'] }];
  });
  return snap;
}

const sortWords = snap => { Object.values(snap.words).forEach(ws => ws.sort((a, b) => a.id.localeCompare(b.id))); return snap; };

describe('felosztás és összerakás', () => {
  it('split → join visszaadja ugyanazt az adatot', () => {
    const snap = makeSnap();
    const parts = splitSnapshot(snap);
    expect(Object.keys(parts)).toHaveLength(3 * (1 + WORD_BUCKETS));
    expect(sortWords(joinParts(parts, 1000))).toEqual(sortWords(makeSnap()));
  });
  it('egy szó mindig ugyanabba a vödörbe kerül, és a vödrök nagyjából egyenletesek', () => {
    const snap = makeSnap({ japanese: 800 });
    expect(bucketOf('ja_abc')).toBe(bucketOf('ja_abc'));
    const sizes = Array.from({ length: WORD_BUCKETS }, (_, b) => splitSnapshot(snap)[`v2_japanese_w${b}`].words.length);
    sizes.forEach(s => expect(s).toBeGreaterThan(60));
  });
  it('a hash nem függ a kulcsok sorrendjétől', () => {
    const a = { lang: 'x', kind: 'meta', stats: { b: 1, a: [{ y: 2, x: 1 }] } };
    const b = { stats: { a: [{ x: 1, y: 2 }], b: 1 }, kind: 'meta', lang: 'x' };
    expect(hashParts({ p: a })).toEqual(hashParts({ p: b }));
  });
});

describe('melyik felhő állapotból induljon az első V2 szinkron', () => {
  it('legfrissebb nyer, hiány esetén ami van', () => {
    expect(chooseInitialSource(null, null)).toBe('empty');
    expect(chooseInitialSource(null, { updatedAt: 5 })).toBe('legacy');
    expect(chooseInitialSource({ updatedAt: 5 }, null)).toBe('v2');
    expect(chooseInitialSource({ updatedAt: 5 }, { updatedAt: 9 })).toBe('legacy');
    expect(chooseInitialSource({ updatedAt: 9 }, { updatedAt: 5 })).toBe('v2');
  });
});

describe('createCloudStore', () => {
  it('migráció: régi snapshot → új formátum, a régi doc megmarad', async () => {
    const f = createFakeFirestore();
    const legacy = makeSnap();
    f.put(path(LEGACY_ID), legacy);
    const store = createCloudStore({ ...f, uid: UID, log: quiet });

    const first = await store.load({ firstOnThisDevice: true });
    expect(first.source).toBe('legacy');
    await store.save({ ...first.snap, updatedAt: 2000 });
    expect(f.stats.writes).toBe(3 * (1 + WORD_BUCKETS) + 1);
    expect(f.docs.has(path(LEGACY_ID))).toBe(true);

    const other = createCloudStore({ ...f, uid: UID, log: quiet });
    const loaded = await other.load({ firstOnThisDevice: false });
    expect(loaded.source).toBe('v2');
    expect(sortWords(loaded.snap)).toEqual(sortWords({ ...makeSnap(), updatedAt: 2000 }));
  });

  it('csak a megváltozott rész íródik, változatlan adatnál semmi', async () => {
    const f = createFakeFirestore();
    const store = createCloudStore({ ...f, uid: UID, log: quiet });
    const snap = makeSnap();
    await store.save(snap);
    const before = f.stats.writes;

    snap.words.japanese[5].stats.totalCorrect += 1;
    const r = await store.save({ ...snap, updatedAt: 1001 });
    expect(r.written).toBe(1);
    expect(f.stats.writes - before).toBe(2); // 1 rész + manifest

    const again = await store.save({ ...snap, updatedAt: 1002 });
    expect(again.skipped).toBe(true);
    expect(f.stats.writes - before).toBe(2);
  });

  it('két eszköz: a másik csak a változott részt tölti le, a saját visszhang nem jön vissza', async () => {
    const f = createFakeFirestore();
    const a = createCloudStore({ ...f, uid: UID, log: quiet });
    const b = createCloudStore({ ...f, uid: UID, log: quiet });
    const snap = makeSnap();
    await a.save(snap);
    await b.load({ firstOnThisDevice: false });

    const gotA = [], gotB = [];
    a.watch((s, fetched) => gotA.push(fetched), e => { throw e; });
    b.watch((s, fetched) => gotB.push({ s, fetched }), e => { throw e; });
    await flush(); await flush();
    expect(gotA).toEqual([]); expect(gotB).toEqual([]); // az induló állapot már ismert

    snap.stats.kanji.globalStats.dailyGoal = 15;
    await a.save({ ...snap, updatedAt: 3000 });
    await flush(); await flush();
    expect(gotA).toEqual([]);
    expect(gotB).toHaveLength(1);
    expect(gotB[0].fetched).toBe(1);
    expect(gotB[0].s.stats.kanji.globalStats.dailyGoal).toBe(15);
    expect(gotB[0].s.words.japanese).toHaveLength(120); // a többi rész a cache-ből
  });

  it('régi verziójú eszköz a migráció után még a snapshot-ba írt → az eszköz első V2 szinkronja azt veszi át', async () => {
    const f = createFakeFirestore();
    const store = createCloudStore({ ...f, uid: UID, log: quiet });
    await store.save(makeSnap(undefined, 2000));
    const newer = makeSnap(undefined, 5000);
    newer.stats.japanese.globalStats.dailyGoal = 25;
    f.put(path(LEGACY_ID), newer);

    const upgraded = createCloudStore({ ...f, uid: UID, log: quiet });
    const r = await upgraded.load({ firstOnThisDevice: true });
    expect(r.source).toBe('legacy');
    expect(r.snap.stats.japanese.globalStats.dailyGoal).toBe(25);
    // ha ez az eszköz már V2-vel szinkronizált, a régi doc-ot nem is olvassa
    const reads = f.stats.reads;
    const later = await createCloudStore({ ...f, uid: UID, log: quiet }).load({ firstOnThisDevice: false });
    expect(later.source).toBe('v2');
    expect(f.stats.reads - reads).toBe(1 + 3 * (1 + WORD_BUCKETS));
  });

  it('nagy adat: ami egy dokumentumba már nem férne (1 MiB), felosztva bőven elfér', async () => {
    const f = createFakeFirestore();
    const big = makeSnap({ english: 1500, japanese: 6000, kanji: 2000 });
    expect(JSON.stringify(big).length).toBeGreaterThan(1024 * 1024);
    const store = createCloudStore({ ...f, uid: UID, log: quiet });
    await store.save(big);
    const largest = Math.max(...[...f.docs.values()].map(d => JSON.stringify(d).length));
    expect(largest).toBeLessThan(250 * 1024);
    expect(f.docs.has(path(MANIFEST_ID))).toBe(true);
  });
});
