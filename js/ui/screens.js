// LexiLearn – ui/screens.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { setCurrentMode, state } from '../core/state.js';
import { saveSettings } from '../core/storage.js';
import { renderProfile } from '../features/profile.js';
import { renderHome } from '../habit/home.js';
import { validateDayFilter } from '../library/filters.js';
import { renderDashboard } from '../library/list.js';
import { closeLibraryOverlays, resetTagQuery } from '../library/menus.js';
import { renderStats } from '../stats/view.js';

/* ══════════════════════════════════════════════════════
   MÓD VÁLTÁSA ÉS ZÁSZLÓK CSERÉJE
══════════════════════════════════════════════════════ */
function setMode(mode, isInit = false) {
  setCurrentMode(mode);
  
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('mode-' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  // V13.1: a szűrők állapota a state-ben él (a pillák és menük abból renderelnek);
  // itt csak a keresőmezőt és a nyitott menüket / dokkot igazítjuk az új módhoz
  closeLibraryOverlays();
  resetTagQuery();
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = state.filters.search || '';
  validateDayFilter();

  if (!isInit) {
    saveSettings(); // Módváltás csak beállítást érint
    renderDashboard();
    // V13: a módváltó a globális fejlécben van → az éppen látható képernyőt is frissítjük
    const active = document.body.dataset.screen;
    if (active === 'home')    renderHome();
    if (active === 'stats')   renderStats();
    if (active === 'profile') renderProfile();
  }
}

/* ══════════════════════════════════════════════════════
   SCREEN MANAGEMENT & DASHBOARD
══════════════════════════════════════════════════════ */
const SCREENS = {
  home: 'screen-home', dashboard: 'screen-dashboard', practice: 'screen-practice',
  roundend: 'screen-round-end', stats: 'screen-stats', profile: 'screen-profile'
};

function showScreen(name) {
  const key = SCREENS[name] ? name : 'home';
  closeLibraryOverlays();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(SCREENS[key]);
  if (target) target.classList.add('active');

  // A body data-screen attribútuma vezérli a fejléc / alsó navigáció láthatóságát (CSS)
  document.body.dataset.screen = key;
  const navItems = [...document.querySelectorAll('.bottom-nav [data-screen]')];
  navItems.forEach(btn => {
    const isActive = btn.dataset.screen === key;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });
  // A navigáció üveg "lencséje" az aktív elem mögé csúszik
  const navIndex = navItems.findIndex(btn => btn.dataset.screen === key);
  const nav = document.getElementById('bottom-nav');
  if (nav && navIndex >= 0) nav.style.setProperty('--nav-i', navIndex);
  window.scrollTo(0, 0);

  if (key === 'home') renderHome();
  if (key === 'dashboard') renderDashboard();
  if (key === 'stats') renderStats();
  if (key === 'profile') renderProfile();
}

export { SCREENS, setMode, showScreen };
