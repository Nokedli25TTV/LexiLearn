/* ══════════════════════════════════════════════════════
   LexiLearn V13.4 – Firebase Sync (Auth + Cloud Sync)
   Stratégia:
     - Google Auth (popup)
     - Cloud: users/{uid}/data/v2_* (több dokumentum, lásd js/app/cloud-store.js);
       a régi users/{uid}/data/snapshot csak migrációhoz / biztonsági mentésnek
     - Konfliktus: legfrissebb nyer (timestamp alapú)
     - Sync hatókör: words + stats + playlists (settings NEM)
     - Auto-push: minden lokális mentés után, debounced (3s)
     - Auto-pull: bejelentkezéskor, ha cloud frissebb mint lokális
══════════════════════════════════════════════════════ */

// ─── 1. FIREBASE CONFIG ─────────────────────────────────
// A Firebase Console-ról másolt értékek. Browser-modul-friendly formátum.
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyA86EgV9ueBswDu9KY0K30BJnq9Z-mNAEc",
  authDomain:        "weboldal1-961a3.firebaseapp.com",
  projectId:         "weboldal1-961a3",
  storageBucket:     "weboldal1-961a3.firebasestorage.app",
  messagingSenderId: "912488756591",
  appId:             "1:912488756591:web:f8ed3c5d1afbd96efa249a",
  measurementId:     "G-EK25R4LQ0J"
};

// ─── 2. SDK IMPORTOK (Firebase v10 modular CDN — böngészőbarát) ───
// FONTOS: bare specifier-ek ("firebase/app") csak Node/bundler-rel mennek.
// Böngészőben a teljes gstatic.com URL kell, type="module" script-ben.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, writeBatch, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { createCloudStore } from "./js/app/cloud-store.js";

// ─── 3. ÁLLAPOT ───
let _firebaseApp = null;
let _auth        = null;
let _db          = null;
let _currentUser = null;
let _isConfigured = false;
let _pushDebounceTimer = null;
let _syncInProgress = false;

// V12.2: race condition + real-time sync javítás
let _initialSyncDone    = false; // amíg false, a triggerPush nem küld semmit (megelőzi az indulási felülírást)
let _snapshotUnsubscribe = null; // Firestore real-time listener leiratkozási függvénye
let _store = null;               // V13.4: a bejelentkezett felhasználó felhő tárolója (cloud-store.js)

const PUSH_DEBOUNCE_MS = 3000;
const META_KEY = 'lexi_cloudsync_meta'; // localForage kulcs

// ─── 4. INIT ───
function isConfigValid() {
  // Minden mezőnek ki kell legyen töltve és nem placeholder
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return required.every(k => {
    const v = FIREBASE_CONFIG[k];
    return v && typeof v === 'string' && !v.startsWith('REPLACE_');
  });
}

function initFirebase() {
  if (_firebaseApp) return true;
  if (!isConfigValid()) {
    console.warn('[FirebaseSync] Config nincs kitöltve – a felhő szinkronizáció le van tiltva.');
    return false;
  }
  try {
    _firebaseApp = initializeApp(FIREBASE_CONFIG);
    _auth = getAuth(_firebaseApp);
    _db   = getFirestore(_firebaseApp);
    _isConfigured = true;
    console.log('[FirebaseSync] Inicializálva. Project:', FIREBASE_CONFIG.projectId);

    // Auth állapot figyelés
    onAuthStateChanged(_auth, async (user) => {
      _currentUser = user;
      _initialSyncDone = false; // reset minden auth state változásnál
      stopCloudListener();      // előző listener leiratkozás (ha volt)
      _store = user ? createCloudStore({
        fs: { doc, getDoc, writeBatch, serverTimestamp, onSnapshot }, db: _db, uid: user.uid
      }) : null;

      if (user) {
        console.log('[FirebaseSync] Bejelentkezve:', user.email || user.displayName);
        window.dispatchEvent(new CustomEvent('lexi:authChanged', { detail: { user } }));
        // 1. Auto-pull bejelentkezéskor (mindig pulljunk, ha van cloud snapshot)
        await initialSyncFromCloud();
        // 2. Real-time listener indítása a másik eszközökről érkező változásokhoz
        startCloudListener();
      } else {
        console.log('[FirebaseSync] Kijelentkezve.');
        window.dispatchEvent(new CustomEvent('lexi:authChanged', { detail: { user: null } }));
      }
    });
    return true;
  } catch (err) {
    console.error('[FirebaseSync] Init hiba:', err);
    return false;
  }
}

// ─── 5. AUTH FUNKCIÓK ───
async function signInGoogle() {
  if (!_isConfigured) {
    if (!initFirebase()) {
      throw new Error('Firebase nincs konfigurálva – nézd meg a firebase-sync.js fájlt.');
    }
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(_auth, provider);
    return result.user;
  } catch (err) {
    console.error('[FirebaseSync] Bejelentkezés hiba:', err);
    throw err;
  }
}

async function signOutUser() {
  if (!_auth) return;
  await signOut(_auth);
}

function getCurrentUser() {
  return _currentUser;
}

// ─── 6. META (utolsó sync timestamp) ───
async function getMeta() {
  try {
    const m = await localforage.getItem(META_KEY);
    return m || { lastLocalChangeAt: 0, lastSyncAt: 0 };
  } catch { return { lastLocalChangeAt: 0, lastSyncAt: 0 }; }
}

async function setMeta(meta) {
  try { await localforage.setItem(META_KEY, meta); } catch (e) { console.warn(e); }
}

async function markLocalChange() {
  const meta = await getMeta();
  meta.lastLocalChangeAt = Date.now();
  await setMeta(meta);
}

// ─── 7. SNAPSHOT BUILDER ───
// V12.3: a Firestore doc limit 1 MiB. Az alkalmazás 4000+ szót tartalmaz,
// így MINDEN szó mentése ~700 KB-ot eredményez, ami már veszélyesen közel van.
// Optimalizáció: csak azokat a BEÉPÍTETT szavakat mentjük, amiket módosítottál
// (gyakoroltál vagy csillagoztál). A többi szó a data.js-ből úgyis előáll.
// Plus: sessionHistory-t utolsó 100-ra trimeljük.

const MAX_SESSION_HISTORY = 100;

function _isWordModified(w) {
  if (!w) return false;
  if (w.bookmarked) return true;
  const s = w.stats || {};
  // V13: a "Tudom"-mal megtanult (még nem kvízelt) szó is módosult → learnedAt a stats-ban utazik
  return (s.totalCorrect > 0) || (s.totalWrong > 0) || (s.streak > 0) || (s.lastAttempt > 0) || !!s.learnedAt;
}

function buildCloudSnapshot() {
  const appData = window.appData;
  if (!appData) return null;

  const snap = {
    words: {},
    stats: {},
    playlists: {},
    updatedAt: Date.now()  // kliens timestamp – konfliktus megoldáshoz
  };

  ['english', 'japanese', 'kanji'].forEach(lang => {
    // ── WORDS ── (méret-tudatos)
    const words = appData[lang].words || [];
    snap.words[lang] = words
      .filter(w => {
        const isBuiltIn = (w.source === 'data_js' || w.source === 'dekiru');
        // Manuális szó: MINDIG (a felhasználó hozzáadta vagy importálta)
        if (!isBuiltIn) return true;
        // Beépített szó: csak ha módosult
        return _isWordModified(w);
      })
      .map(w => {
        const isBuiltIn = (w.source === 'data_js' || w.source === 'dekiru');
        if (isBuiltIn) {
          // Beépített: csak az állapot mezők
          return {
            id: w.id,
            en: w.en,
            source: w.source,
            stats: w.stats,
            bookmarked: !!w.bookmarked
          };
        }
        // Manuális/importált: teljes objektum
        return { ...w, bookmarked: !!w.bookmarked };
      });

    // ── STATS (globalStats + dailyQuests) ── sessionHistory limit
    const gs = appData[lang].globalStats || {};
    const trimmedGs = { ...gs };
    if (Array.isArray(gs.sessionHistory) && gs.sessionHistory.length > MAX_SESSION_HISTORY) {
      trimmedGs.sessionHistory = gs.sessionHistory.slice(-MAX_SESSION_HISTORY);
    }
    snap.stats[lang] = {
      globalStats: trimmedGs,
      dailyQuests: appData[lang].dailyQuests || { date: '', list: [] }
    };

    // ── PLAYLISTS (csak nem data.js eredetűek) ──
    snap.playlists[lang] = (appData[lang].playlists || []).filter(p => p.source !== 'data_js');
  });

  // Debug: snapshot méret a console-ba
  try {
    const sizeKB = (JSON.stringify(snap).length / 1024).toFixed(1);
    const wordCounts = ['english','japanese','kanji']
      .map(l => `${l}=${snap.words[l].length}`).join(', ');
    console.log(`[FirebaseSync] Snapshot méret: ${sizeKB} KB (mentett szavak: ${wordCounts})`);
  } catch (e) { /* noop */ }

  return snap;
}

// ─── 8. SNAPSHOT APPLIER ───
// A cloud snapshot-ot ráalkalmazzuk a lokális appData-ra:
// - beépített szavakon csak stats + bookmarked felülír
// - manuális szavakat hozzáad vagy frissít (ID alapján)
// - stats/dailyQuests teljesen felülír
// - playlists: data.js-eseket megtartjuk lokálisan, mentett listák cloud-ból jönnek
function applyCloudSnapshot(snap) {
  const appData = window.appData;
  if (!appData || !snap) return;

  ['english', 'japanese', 'kanji'].forEach(lang => {
    // ── WORDS ──
    if (snap.words?.[lang]) {
      const cloudById = new Map(snap.words[lang].map(w => [w.id, w]));
      // V12.4: Fallback index 'en' mező alapján — átmeneti védelem a régi
      // Date.now-os ID-jű cloud snapshot-okra (a stabil ID migráció előtti adat)
      const cloudByEn = new Map();
      snap.words[lang].forEach(w => { if (w.en) cloudByEn.set(w.en, w); });

      // Frissítjük a lokális szavakat
      appData[lang].words.forEach(localW => {
        let cw = cloudById.get(localW.id);
        if (!cw) cw = cloudByEn.get(localW.en); // fallback by en
        if (!cw) return;
        // stats + bookmarked mindig átvesszük
        if (cw.stats)      localW.stats = cw.stats;
        if (cw.bookmarked !== undefined) localW.bookmarked = cw.bookmarked;
        // Ha NEM beépített, a teljes szót átvesszük (felhasználói módosítás)
        if (localW.source !== 'data_js' && localW.source !== 'dekiru') {
          ['en','hu','tags','diff','syn','sentence','romaji','onyomi','kunyomi','lesson']
            .forEach(k => { if (cw[k] !== undefined) localW[k] = cw[k]; });
        }
      });

      // Csak cloud-on létező manuális szavak HOZZÁADÁSA
      snap.words[lang].forEach(cw => {
        const isBuiltIn = (cw.source === 'data_js' || cw.source === 'dekiru');
        if (isBuiltIn) return; // beépítettek a data.js-ből jönnek
        // Match a lokálissal mind ID, mind 'en' alapján
        const exists = appData[lang].words.some(lw => lw.id === cw.id || (cw.en && lw.en === cw.en));
        if (!exists) appData[lang].words.push(cw);
      });
    }

    // ── STATS ──
    if (snap.stats?.[lang]) {
      if (snap.stats[lang].globalStats) appData[lang].globalStats = snap.stats[lang].globalStats;
      if (snap.stats[lang].dailyQuests) appData[lang].dailyQuests = snap.stats[lang].dailyQuests;
    }

    // ── PLAYLISTS (data.js-eseket megőrizzük) ──
    if (snap.playlists?.[lang]) {
      const fileLists = (appData[lang].playlists || []).filter(p => p.source === 'data_js');
      appData[lang].playlists = [...fileLists, ...snap.playlists[lang]];
    }
  });
}

// ─── 9. KÖZÖS: felhő állapot alkalmazása + lokális mentés + UI ───
async function applyAndPersist(cloudSnap) {
  applyCloudSnapshot(cloudSnap);
  // Lokális mentés a split kulcsokba
  if (window.saveWords)     await window.saveWords();
  if (window.saveStats)     await window.saveStats();
  if (window.savePlaylists) await window.savePlaylists();
  // UI újrarajzolás
  if (window.renderDashboard) window.renderDashboard();
  if (window.renderHome) window.renderHome();
  if (window.renderStats && document.getElementById('screen-stats')?.classList.contains('active')) {
    window.renderStats();
  }
}

// ─── 10. PUSH: local → cloud (csak a megváltozott részek) ───
async function pushToCloud() {
  if (!_currentUser || !_store) return false;
  if (_syncInProgress) return false;
  _syncInProgress = true;
  setSyncStatus('syncing');
  try {
    const snap = buildCloudSnapshot();
    if (!snap) return false;
    const { written, bytes, skipped } = await _store.save(snap);
    const meta = await getMeta();
    meta.lastSyncAt = Date.now();
    await setMeta(meta);
    setSyncStatus('synced');
    if (skipped) { console.log('[FirebaseSync] Nincs változás, push kihagyva.'); return true; }
    console.log(`[FirebaseSync] Push kész: ${written} rész, ${(bytes / 1024).toFixed(1)} KB. updatedAt: ${snap.updatedAt}`);
    return true;
  } catch (err) {
    console.error('[FirebaseSync] Push hiba:', err);
    setSyncStatus('error');
    return false;
  } finally {
    _syncInProgress = false;
  }
}

// ─── 11. BEJELENTKEZÉSI INIT SYNC ───
// Van felhő állapot → MINDIG azt vesszük át (legfrissebb-nyer), utána reconciliation push.
// Nincs → első push (a vendég adatok felfelé).
// V13.4: az első V2 szinkron eszközönként egyszer a régi "snapshot" doc-ot is megnézi:
// ha még nincs V2 adat, vagy egy régi verziójú eszköz frissebbet írt, onnan migrál.
async function initialSyncFromCloud() {
  if (!_currentUser || !_store) return;
  setSyncStatus('syncing');
  try {
    const meta = await getMeta();
    const firstOnThisDevice = meta.cloudV2Uid !== _currentUser.uid;
    const { source, snap: cloudSnap, fetched } = await _store.load({ firstOnThisDevice });

    if (source === 'empty') {
      console.log('[FirebaseSync] Üres cloud → első push.');
      _initialSyncDone = true; // engedjük a push-okat
      if (await pushToCloud()) await markV2Synced();
      return;
    }

    console.log(`[FirebaseSync] Felhő állapot (${source === 'legacy' ? 'régi snapshot, migráció' : 'V2, ' + fetched + ' rész letöltve'}) → pull. cloudTs:`, cloudSnap.updatedAt);
    await applyAndPersist(cloudSnap);

    const m = await getMeta();
    m.lastSyncAt = Date.now();
    await setMeta(m);
    setSyncStatus('synced');
    if (window.showToast) window.showToast('Felhőből szinkronizálva');

    _initialSyncDone = true; // most már engedjük a push-okat

    if (source === 'legacy') {
      // Migráció: azonnal kiírjuk az új formátumba; a régi doc megmarad biztonsági mentésnek
      if (await pushToCloud()) {
        await markV2Synced();
        console.log('[FirebaseSync] Migráció kész: a felhő adat az új, többdokumentumos formátumban.');
      }
    } else {
      await markV2Synced();
      // V12.4: RECONCILIATION PUSH (ha a lokális adat eltér, csak a változott részek íródnak)
      setTimeout(() => { pushToCloud(); }, 500);
    }
  } catch (err) {
    console.error('[FirebaseSync] Initial sync hiba:', err);
    setSyncStatus('error');
    _initialSyncDone = true; // hibánál is engedjük (különben mindig blokkolt lenne)
  }
}

async function markV2Synced() {
  const meta = await getMeta();
  meta.cloudV2Uid = _currentUser?.uid || null;
  await setMeta(meta);
}

// ─── 11.5. REAL-TIME LISTENER (másik eszközökről érkező változások) ───
function startCloudListener() {
  if (!_currentUser || !_store) return;
  if (_snapshotUnsubscribe) _snapshotUnsubscribe();

  // V13.4: csak a kis manifest doc-ot figyeljük; változáskor a store csak a módosult részeket tölti le
  _snapshotUnsubscribe = _store.watch(async (cloudSnap, fetched) => {
    console.log(`[FirebaseSync] Másik eszközről érkezett változás (${fetched} rész).`);
    await applyAndPersist(cloudSnap);
    setSyncStatus('synced');
    if (window.showToast) window.showToast('Frissítve a másik eszközről');
  }, (err) => {
    console.error('[FirebaseSync] Snapshot listener hiba:', err);
    setSyncStatus('error');
  });
  console.log('[FirebaseSync] Real-time listener elindítva.');
}

function stopCloudListener() {
  if (_snapshotUnsubscribe) {
    _snapshotUnsubscribe();
    _snapshotUnsubscribe = null;
    console.log('[FirebaseSync] Real-time listener leállítva.');
  }
}

// ─── 12. DEBOUNCED PUSH (a app.js savexxx() függvényeiből hívható) ───
async function triggerCloudPush() {
  // Lokális változás jelölése (debug-ra hasznos)
  await markLocalChange();
  if (!_currentUser) return;
  // V12.2 FIX: amíg az initial sync nincs kész, NE küldjünk push-t.
  // Ez megelőzi, hogy az indulási saveWords/Stats felülírják a cloud-ot.
  if (!_initialSyncDone) {
    console.log('[FirebaseSync] Push elnyomva – initial sync még nincs kész.');
    return;
  }
  clearTimeout(_pushDebounceTimer);
  setSyncStatus('pending');
  _pushDebounceTimer = setTimeout(() => { pushToCloud(); }, PUSH_DEBOUNCE_MS);
}

// ─── 13. SYNC STÁTUSZ UI ESEMÉNY ───
function setSyncStatus(status) {
  // status: 'idle' | 'pending' | 'syncing' | 'synced' | 'error'
  window.dispatchEvent(new CustomEvent('lexi:syncStatus', { detail: { status } }));
}

// ─── 14. PUBLIC API (window-on keresztül elérhető a app.js-nek) ───
window.LexiFirebase = {
  init:           initFirebase,
  signInGoogle:   signInGoogle,
  signOut:        signOutUser,
  getCurrentUser: getCurrentUser,
  triggerPush:    triggerCloudPush,
  forcePull:      initialSyncFromCloud,
  forcePush:      pushToCloud,
  isConfigured:   () => isConfigValid()
};

// ─── 15. AUTOMATIKUS INIT (ha config valid) ───
if (isConfigValid()) {
  initFirebase();
} else {
  console.warn('[FirebaseSync] A felhő szinkronizáció le van tiltva – tölts ki a config-ot a firebase-sync.js-ben.');
  // Akkor is dispatch egy esemény, hogy a UI tudja: nincs config
  window.dispatchEvent(new CustomEvent('lexi:authChanged', { detail: { user: null, noConfig: true } }));
}
