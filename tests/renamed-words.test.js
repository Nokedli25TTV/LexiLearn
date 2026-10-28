// Adatjavításból átnevezett szavak (ハンがリー → ハンガリー stb.): a szó azonosítója a kanából
// képződik, ezért a mentett haladás, a hivatkozások és a felhőből jövő régi alak is átköltözik.
import { it, expect, vi } from 'vitest';
import { bootApp } from './harness/boot.js';
import { createFakeFirestore } from './fakes/firestore.js';
import { LEGACY_ID } from '../js/app/cloud-store.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(check, ms = 8000) {
  for (let t = 0; t < ms; t += 25) { if (await check()) return; await wait(25); }
  throw new Error('Időtúllépés: ' + check);
}

it('a régi kanájú szó haladása, hivatkozásai és felhőadata az új alakra költözik', async () => {
  const f = createFakeFirestore();
  globalThis.__fakeFirestore = f;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { api, win } = await bootApp();
  await until(() => win.appData.japanese.words.length > 0);
  const ja = win.appData.japanese;
  const find = en => ja.words.find(w => w.en === en);

  // A javított adat: új kana, javított romaji (a mentett szóra is kiér)
  expect(find('ハンがリー')).toBeUndefined();
  expect(find('ハンガリー').romaji).toBe('hangarii');
  expect(find('さらに').romaji).toBe('sarani');
  expect(find('しゅつえんする').romaji).toBe('shutsuensuru');
  expect(api.JAPANESE_SENTENCES.some(s => s.baseWord === 'ガス')).toBe(true);

  // Egy régi mentés állapota: a szó még a régi kanával és azonosítóval, haladással és hivatkozásokkal
  const hu = find('ハンガリー');
  Object.assign(hu, { en: 'ハンがリー', id: 'ja_ハンがリー', romaji: 'hangari', bookmarked: true, lessonFocus: true });
  Object.assign(hu.stats, { learnedAt: '2026-09-01', totalCorrect: 6, streak: 5, srs: { due: '2026-10-01', s: 9, d: 5, last: '2026-09-22', reps: 3, lapses: 0 } });
  ja.selectedIds = new Set(['ja_ハンがリー']);
  ja.playlists.push({ id: 'pl_teszt', name: 'Országok', wordIds: ['ja_ハンがリー'] });
  // …és egy olyan átnevezés, ahol az új alak már létezik (haladás nélkül): a régi haladása átkerül
  const gas = find('ガス');
  ja.words.push({ ...gas, id: 'ja_がス', en: 'がス', stats: { streak: 2, totalCorrect: 2, totalWrong: 1, lastAttempt: 1790000000000 } });

  expect(api.migrateRenamedWords()).toBe(true);
  api.syncNewWords();
  const moved = find('ハンガリー');
  expect(moved.id).toBe('ja_ハンガリー');
  expect(moved.stats).toMatchObject({ learnedAt: '2026-09-01', totalCorrect: 6 });
  expect(moved.stats.srs.s).toBe(9);
  expect(moved.bookmarked && moved.lessonFocus).toBe(true);
  expect(moved.romaji).toBe('hangarii');
  expect([...ja.selectedIds]).toEqual(['ja_ハンガリー']);
  expect(ja.playlists.find(p => p.id === 'pl_teszt').wordIds).toEqual(['ja_ハンガリー']);
  expect(find('がス')).toBeUndefined();
  expect(find('ガス').stats.totalCorrect).toBe(2);
  expect(ja.words.filter(w => w.en === 'ハンガリー')).toHaveLength(1);
  expect(api.migrateRenamedWords()).toBe(false);          // második futásra nincs teendő

  // Felhő: egy még régi alakú felhőszó (régi eszközről) is párt talál
  const bg = find('ブルガリア');
  f.put(`users/u1/data/${LEGACY_ID}`, {
    words: { japanese: [{ id: 'ja_ブルがリア', en: 'ブルがリア', source: 'dekiru', bookmarked: true,
      stats: { streak: 3, totalCorrect: 7, totalWrong: 0, lastAttempt: 1790000000000, learnedAt: '2026-09-10' } }] },
    stats: { japanese: { globalStats: { ...ja.globalStats }, dailyQuests: ja.dailyQuests } },
    playlists: { japanese: [] },
    updatedAt: 100
  });
  await import('../firebase-sync.js');
  await globalThis.__fakeAuth.emit({ uid: 'u1', email: 'teszt@example.com' });
  await until(() => bg.stats.totalCorrect === 7);
  expect(bg.bookmarked).toBe(true);
  expect(bg.stats.learnedAt).toBe('2026-09-10');
});
