// A valódi firebase-sync.js a teljes appal, memóriabeli Firestore-ral (tests/fakes):
// migráció a régi "snapshot" dokumentumból, másik eszköz változásának fogadása, helyi
// változás feltöltése (csak a változott rész).
import { it, expect, vi } from 'vitest';
import { bootApp } from './harness/boot.js';
import { createFakeFirestore } from './fakes/firestore.js';
import { createCloudStore, LEGACY_ID, MANIFEST_ID } from '../js/app/cloud-store.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(check, ms = 8000) {
  for (let t = 0; t < ms; t += 25) { if (await check()) return; await wait(25); }
  throw new Error('Időtúllépés: ' + check);
}

it('bejelentkezéskor a régi snapshot átköltözik, utána két irányban szinkronizál', async () => {
  const f = createFakeFirestore();
  globalThis.__fakeFirestore = f;
  const errors = [];
  vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));

  const { win } = await bootApp();
  await until(() => win.appData.japanese.words.length > 0);
  const ja = win.appData.japanese;
  const [w0, w1, w2] = ja.words;

  // A régi (V13.3-ig használt) egyetlen dokumentum a felhőben
  f.put(`users/u1/data/${LEGACY_ID}`, {
    words: { japanese: [{ id: w0.id, en: w0.en, source: w0.source, bookmarked: true,
      stats: { streak: 2, totalCorrect: 4, totalWrong: 1, lastAttempt: 1790000000000, learnedAt: '2026-09-20' } }] },
    stats: { japanese: { globalStats: { ...ja.globalStats, dailyGoal: 7 }, dailyQuests: ja.dailyQuests } },
    playlists: { japanese: [] },
    updatedAt: 100
  });

  await import('../firebase-sync.js');
  await globalThis.__fakeAuth.emit({ uid: 'u1', email: 'teszt@example.com' });
  await until(async () => (await win.localforage.getItem('lexi_cloudsync_meta'))?.cloudV2Uid === 'u1');

  // 1. Migráció: a régi adat bekerült az appba, az új formátum kiírva, a régi doc megmaradt
  expect(w0.stats.totalCorrect).toBe(4);
  expect(w0.bookmarked).toBe(true);
  expect(ja.globalStats.dailyGoal).toBe(7);
  expect(f.docs.has(`users/u1/data/${MANIFEST_ID}`)).toBe(true);
  expect(f.docs.has(`users/u1/data/${LEGACY_ID}`)).toBe(true);
  const migrated = await createCloudStore({ ...f, uid: 'u1' }).load({ firstOnThisDevice: false });
  expect(migrated.snap.words.japanese.find(w => w.id === w0.id).stats.totalCorrect).toBe(4);

  // 2. Egy másik eszköz módosít → az app a figyelőn keresztül megkapja
  const phone = createCloudStore({ ...f, uid: 'u1' });
  const { snap } = await phone.load({ firstOnThisDevice: false });
  snap.words.japanese.push({ id: w1.id, en: w1.en, source: w1.source, bookmarked: false,
    stats: { streak: 1, totalCorrect: 1, totalWrong: 0, lastAttempt: 1790000000500, learnedAt: '2026-09-29' } });
  snap.stats.japanese.globalStats.dailyGoal = 12;
  await phone.save({ ...snap, updatedAt: Date.now() + 1 });
  await until(() => ja.globalStats.dailyGoal === 12 && w1.stats.totalCorrect === 1);

  // 3. Helyi változás → 3 mp múlva feltöltés, csak az érintett rész + a manifest
  await wait(3500); // a 2. lépés helyi mentései által indított push lecseng
  const before = f.stats.writes;
  w2.bookmarked = true;
  await win.saveWords();
  await until(() => f.stats.writes > before, 6000);
  expect(f.stats.writes - before).toBe(2);
  const latest = await createCloudStore({ ...f, uid: 'u1' }).load({ firstOnThisDevice: false });
  expect(latest.snap.words.japanese.find(w => w.id === w2.id)?.bookmarked).toBe(true);

  expect(errors).toEqual([]);
});
