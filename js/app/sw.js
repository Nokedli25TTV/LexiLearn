// LexiLearn – app/sw.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

/* ══════════════════════════════════════════════════════
   SERVICE WORKER REGISZTRÁCIÓ (PWA) + FRISSÍTÉSI ÉRTESÍTŐ
══════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('[LexiLearn] Service Worker regisztrálva:', reg.scope);

      // Figyeli, ha új SW vár aktiválásra (frissítés letöltve)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // Az új SW települt és vár – de csak ha volt már aktív SW (nem első betöltés)
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast(reg);
          }
        });
      });
    }).catch(err => console.warn('[LexiLearn] Service Worker hiba:', err));

    // Ha az aktív SW cserélődött (felhasználó kattintott a frissítés toastra)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

function showUpdateToast(reg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = 'Új verzió érhető el. <a href="#" style="color:#fff;text-decoration:underline;margin-left:6px;" onclick="activateNewSW(event)">Frissítés</a>';
  toast.classList.add('show');
  window._pendingSWReg = reg;
}

function activateNewSW(e) {
  e.preventDefault();
  const reg = window._pendingSWReg;
  if (reg && reg.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export { activateNewSW, showUpdateToast };
