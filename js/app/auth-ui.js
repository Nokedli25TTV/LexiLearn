// LexiLearn – app/auth-ui.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   V12: FIREBASE AUTH UI VEZÉRLŐ
══════════════════════════════════════════════════════ */
// V13: a bejelentkezés a Profil képernyőn, modál nélkül történik
async function googleSignIn() {
  if (!window.LexiFirebase) { showToast('Firebase nincs betöltve'); return; }
  const errBox = document.getElementById('auth-error');
  if (errBox) errBox.style.display = 'none';
  if (!window.LexiFirebase.isConfigured()) {
    const warn = document.getElementById('auth-no-config-warning');
    if (warn) warn.style.display = '';
    return;
  }
  try {
    await window.LexiFirebase.signInGoogle();
    showToast('Sikeresen bejelentkeztél');
  } catch (err) {
    const errBox = document.getElementById('auth-error');
    if (errBox) {
      errBox.style.display = '';
      errBox.textContent = 'Hiba: ' + (err.message || err);
    }
  }
}

async function signOutCloud() {
  if (!window.LexiFirebase) return;
  await window.LexiFirebase.signOut();
  showToast('Kijelentkeztél');
}

async function manualCloudSync() {
  if (!window.LexiFirebase) return;
  showToast('Szinkronizálás...');
  // 1. Pull a cloud-ról (másik eszközről érkezett változások letöltése)
  // 2. Push a frissített lokálisat (saját változások felfelé)
  try {
    await window.LexiFirebase.forcePull();
    await window.LexiFirebase.forcePush();
    showToast('Szinkronizálva');
  } catch (err) {
    showToast('Sync sikertelen');
  }
}

// Auth állapot változás (firebase-sync.js → custom event)
// V13: a fejlécben csak az avatar + szinkron pötty látszik, a fiók részletei a Profilban vannak
window.addEventListener('lexi:authChanged', (e) => {
  const { user } = e.detail || {};
  const loginBlock     = document.getElementById('auth-login-block');
  const userBlock      = document.getElementById('auth-user-block');
  const avatar         = document.getElementById('user-avatar');
  const avatarFallback = document.getElementById('user-avatar-fallback');
  const profileAvatar  = document.getElementById('profile-avatar');
  const syncDot        = document.getElementById('sync-status');
  const hasPhoto       = !!(user && user.photoURL);

  if (loginBlock) loginBlock.style.display = user ? 'none' : '';
  if (userBlock)  userBlock.style.display  = user ? '' : 'none';
  if (syncDot)    syncDot.style.display    = user ? '' : 'none';

  if (avatar) {
    avatar.style.display = hasPhoto ? '' : 'none';
    if (hasPhoto) avatar.src = user.photoURL;
  }
  if (avatarFallback) avatarFallback.style.display = hasPhoto ? 'none' : '';
  if (profileAvatar) {
    profileAvatar.style.display = hasPhoto ? '' : 'none';
    if (hasPhoto) profileAvatar.src = user.photoURL;
  }

  if (user) {
    const nameEl  = document.getElementById('user-menu-name');
    const emailEl = document.getElementById('user-menu-email');
    if (nameEl)  nameEl.textContent  = user.displayName || 'Felhasználó';
    if (emailEl) emailEl.textContent = user.email || '';
  }
});

// Sync státusz indikátor (V13: kis színes pötty a fejléc avatarján)
window.addEventListener('lexi:syncStatus', (e) => {
  const status = e.detail.status;
  const el = document.getElementById('sync-status');
  if (!el) return;
  const CLASSES = { pending: 'sync-pending', syncing: 'sync-syncing', synced: 'sync-synced', error: 'sync-error' };
  el.className = 'sync-status ' + (CLASSES[status] || '');
  el.title = ({
    idle:    'Készen áll',
    pending: 'Mentésre vár...',
    syncing: 'Szinkronizál...',
    synced:  'Szinkronizálva: ' + new Date().toLocaleTimeString('hu-HU'),
    error:   'Hiba a szinkronizálás során'
  })[status] || '';

  const syncInfo = document.getElementById('user-menu-sync-info');
  if (syncInfo && status === 'synced') {
    syncInfo.textContent = 'Utoljára szinkronizálva: ' + new Date().toLocaleString('hu-HU');
  }
});

export { googleSignIn, manualCloudSync, signOutCloud };
