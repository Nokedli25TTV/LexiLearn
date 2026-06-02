/* ══════════════════════════════════════════════════════
   LexiLearn V10.5 – Service Worker
   Stratégiák:
     index.html  → Network-first (mindig a legfrissebb UI)
     JS/CSS/ikonok → Cache-first (villámgyors indulás)
     Tanulási adatok → SOHA nem kerülnek ide (IndexedDB kezeli)
══════════════════════════════════════════════════════ */

const CACHE_NAME = 'lexilearn-v12-2';

const STATIC_ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './firebase-sync.js',
  './data.js',
  './japanese_words.js',
  './dekiru.js',
  './kanji_data.js',
  './japanese_sentences.js',
  './english_sentences2.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon-32.png',
  'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js'
];

/* ── TELEPÍTÉS ────────────────────────────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Telepítés – statikus fájlok cache-be mentése...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const local    = STATIC_ASSETS.filter(u => !u.startsWith('http'));
      const external = STATIC_ASSETS.filter(u =>  u.startsWith('http'));
      return cache.addAll(local).then(() =>
        Promise.allSettled(
          external.map(url =>
            cache.add(new Request(url, { mode: 'no-cors' })).catch(() =>
              console.warn('[SW] Külső CDN cache sikertelen:', url)
            )
          )
        )
      );
    })
  );
  self.skipWaiting();
});

/* ── AKTIVÁLÁS: régi cache-ek takarítása ─────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Aktiválás – régi cache verziók törlése...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Régi cache törölve:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

/* ── ÜZENETKEZELŐ: frissítési parancs app.js-től ─────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING üzenet fogadva – azonnali frissítés.');
    self.skipWaiting();
  }
});

/* ── FETCH: kettős stratégia ─────────────────────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isNavigation) {
    /* index.html: Network-first, cache fallback */
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return networkRes;
        })
        .catch(() => {
          console.log('[SW] Offline – index.html a cache-ből töltve.');
          return caches.match('./index.html');
        })
    );
  } else {
    /* Statikus fájlok: Cache-first */
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(networkRes => {
          if (!networkRes || networkRes.status !== 200 || networkRes.type === 'opaque') {
            return networkRes;
          }
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return networkRes;
        });
      })
    );
  }
});