// LexiLearn – library/playlists.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { state } from '../core/state.js';
import { savePlaylists } from '../core/storage.js';
import { onFiltersChanged, refreshLibraryChrome, renderFilterMenu } from './menus.js';
import { showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   SAJÁT LISTÁK (a "Lista" lenyíló menüből kezelve)
══════════════════════════════════════════════════════ */
function savePlaylist() {
  const input = document.getElementById('playlist-name-input');
  const name = input ? input.value.trim() : '';
  if (state.selectedIds.size === 0) { showToast('Először jelölj ki szavakat!'); return; }
  if (!name) { showToast('Adj nevet a listának!'); if (input) input.focus(); return; }
  if (!state.playlists) state.playlists = [];
  if (state.playlists.some(p => p.name.toLowerCase() === name.toLowerCase())) { showToast('Már létezik ilyen nevű lista!'); return; }

  state.playlists.push({ id: 'pl_' + Date.now(), name: name, wordIds: Array.from(state.selectedIds) });
  savePlaylists();
  renderFilterMenu();
  showToast('Lista elmentve: ' + name);
}

function deletePlaylist(id) {
  if (!confirm('Biztosan törlöd ezt a listát?')) return;
  if (state.filters.list === id) state.filters.list = 'all';
  state.playlists = state.playlists.filter(p => p.id !== id);
  savePlaylists();
  onFiltersChanged();
}

/* ══════════════════════════════════════════════════════
   Lista bővítése – kijelölt szavak hozzáadása meglévő listához
══════════════════════════════════════════════════════ */
function expandPlaylist(id) {
  const pl = state.playlists ? state.playlists.find(p => p.id === id) : null;
  if (!pl) return;
  if (state.selectedIds.size === 0) {
    showToast('Először jelölj ki szavakat a szólistából!');
    return;
  }
  let added = 0;
  state.selectedIds.forEach(wId => {
    if (!pl.wordIds.includes(wId)) {
      pl.wordIds.push(wId);
      added++;
    }
  });
  if (added === 0) {
    showToast('A kijelölt szavak már mind szerepelnek ebben a listában.');
  } else {
    showToast(`${added} szó hozzáadva a(z) „${pl.name}" listához!`);
  }
  savePlaylists();
  refreshLibraryChrome();
}

export { deletePlaylist, expandPlaylist, savePlaylist };
