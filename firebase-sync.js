/* ══════════════════════════════════════════════════════
   LexiLearn V12.0 – Firebase Sync (Auth + Cloud Sync)
   Stratégia:
     - Google Auth (popup)
     - Cloud-doc: users/{uid}/data/snapshot
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
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ─── 3. ÁLLAPOT ───
let _firebaseApp = null;
let _auth        = null;
let _db          = null;
let _currentUser = null;
let _isConfigured = false;
let _pushDebounceTimer = null;
let _syncInProgress = false;

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
      if (user) {
        console.log('[FirebaseSync] Bejelentkezve:', user.email || user.displayName);
        window.dispatchEvent(new CustomEvent('lexi:authChanged', { detail: { user } }));
        // Auto-pull bejelentkezéskor (ha cloud frissebb)
        await initialSyncFromCloud();
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
// data.js-ből származó szavakra csak az állapot mezőket (stats, bookmarked) csomagoljuk.
// Manuálisan hozzáadott szavakra a teljes objektumot.
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
    // ── WORDS ──
    snap.words[lang] = (appData[lang].words || []).map(w => {
      const isBuiltIn = (w.source === 'data_js' || w.source === 'dekiru');
      if (isBuiltIn) {
        // Beépített szó: csak ID + a felhasználó által módosítható mezők
        return {
          id: w.id,
          en: w.en,
          source: w.source,
          stats: w.stats,
          bookmarked: !!w.bookmarked
        };
      }
      // Manuális/importált szó: teljes objektum
      return { ...w, bookmarked: !!w.bookmarked };
    });

    // ── STATS (globalStats + dailyQuests) ──
    snap.stats[lang] = {
      globalStats: appData[lang].globalStats || {},
      dailyQuests: appData[lang].dailyQuests || { date: '', list: [] }
    };

    // ── PLAYLISTS (csak nem data.js eredetűek) ──
    snap.playlists[lang] = (appData[lang].playlists || []).filter(p => p.source !== 'data_js');
  });

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

      // Frissítjük a lokális szavakat
      appData[lang].words.forEach(localW => {
        const cw = cloudById.get(localW.id);
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
        if (!appData[lang].words.some(lw => lw.id === cw.id)) {
          appData[lang].words.push(cw);
        }
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

// ─── 9. PULL: cloud → local ───
async function pullFromCloud() {
  if (!_currentUser || !_db) return null;
  const ref = doc(_db, 'users', _currentUser.uid, 'data', 'snapshot');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

// ─── 10. PUSH: local → cloud ───
async function pushToCloud() {
  if (!_currentUser || !_db) return false;
  if (_syncInProgress) return false;
  _syncInProgress = true;
  setSyncStatus('syncing');
  try {
    const snap = buildCloudSnapshot();
    if (!snap) { _syncInProgress = false; return false; }
    const ref = doc(_db, 'users', _currentUser.uid, 'data', 'snapshot');
    await setDoc(ref, { ...snap, serverUpdatedAt: serverTimestamp() });
    const meta = await getMeta();
    meta.lastSyncAt = Date.now();
    await setMeta(meta);
    setSyncStatus('synced');
    console.log('[FirebaseSync] Push kész.');
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
// Cloud frissebb? → pull + lokális mentés. Lokális frissebb? → push.
async function initialSyncFromCloud() {
  if (!_currentUser) return;
  setSyncStatus('syncing');
  try {
    const cloudSnap = await pullFromCloud();
    const meta = await getMeta();

    if (!cloudSnap) {
      // Még nincs cloud snapshot → push az egész lokálist
      console.log('[FirebaseSync] Üres cloud → első push.');
      await pushToCloud();
      return;
    }

    const cloudTs = cloudSnap.updatedAt || 0;
    const localTs = meta.lastLocalChangeAt || 0;

    if (cloudTs > localTs) {
      // Cloud frissebb → pull
      console.log('[FirebaseSync] Cloud frissebb → pull (cloud:', cloudTs, 'vs local:', localTs, ')');
      applyCloudSnapshot(cloudSnap);
      // Lokális mentés a 4 split kulcsba (app.js függvényei)
      if (window.saveWords)     await window.saveWords();
      if (window.saveStats)     await window.saveStats();
      if (window.savePlaylists) await window.savePlaylists();
      // UI újrarajzolás
      if (window.renderDashboard) window.renderDashboard();
      meta.lastSyncAt = Date.now();
      await setMeta(meta);
      setSyncStatus('synced');
      if (window.showToast) window.showToast('☁️ Felhőből szinkronizálva');
    } else if (localTs > cloudTs) {
      // Lokális frissebb → push
      console.log('[FirebaseSync] Lokális frissebb → push.');
      await pushToCloud();
    } else {
      // Egyformák
      setSyncStatus('synced');
      console.log('[FirebaseSync] Cloud és local szinkronban.');
    }
  } catch (err) {
    console.error('[FirebaseSync] Initial sync hiba:', err);
    setSyncStatus('error');
  }
}

// ─── 12. DEBOUNCED PUSH (a app.js savexxx() függvényeiből hívható) ───
async function triggerCloudPush() {
  // Lokális változás jelölése (akkor is, ha nem vagy bejelentkezve – majd ha bejelentkezel)
  await markLocalChange();
  if (!_currentUser) return;
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
