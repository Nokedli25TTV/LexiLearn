// LexiLearn – ui/theme.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { saveSettings } from '../core/storage.js';

/* ══════════════════════════════════════════════════════
   V6.5 AUTOMATIKUS UI INJEKTOR (Gamification + Heatmap)
══════════════════════════════════════════════════════ */
function initV6Features() {
  if (!document.getElementById('v6-styles')) {
    const style = document.createElement('style');
    style.id = 'v6-styles';
    style.innerHTML = `
      .quest-item { margin-bottom: 12px; opacity: 1; transition: opacity 0.3s; }
      .quest-item.completed { opacity: 0.6; }
      .quest-item.completed .quest-title { text-decoration: line-through; color: var(--success); }
      .quest-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-2); }
      .quest-bar-bg { height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
      .quest-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.5s ease-out; }
      .quest-item.completed .quest-bar-fill { background: var(--success); }
    `;
    document.head.appendChild(style);
  }
}

/* ══════════════════════════════════════════════════════
   SÖTÉT MÓD LOGIKA
══════════════════════════════════════════════════════ */
// V13: a sötét mód az alapértelmezés. A téma localStorage-ba is tükröződik,
// hogy az index.html <head> scriptje villanás nélkül, még a CSS előtt be tudja állítani.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sw = document.getElementById('theme-switch');
  if (sw) sw.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1311' : '#1a3d2e');
  try { localStorage.setItem('lexi_theme', theme); } catch (e) { /* privát mód */ }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  saveSettings(); // Csak a beállításokat kell menteni, nem a teljes DB-t
}

export { applyTheme, initV6Features, toggleTheme };
