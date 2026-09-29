// LexiLearn – library/menus.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode, diffOrder, state } from '../core/state.js';
import { escHtml, jsArg } from '../core/util.js';
import { getBookmarkedWords } from '../features/bookmarks.js';
import { hasPoolFilters } from '../habit/goal.js';
import { _dockOpen, toggleDockSettings } from './dock.js';
import { SORT_OPTIONS, getDayOptions, getLessonOptions, lessonLabel, listLabel, validateDayFilter } from './filters.js';
import { applyFilters } from './list.js';

/* ── Ikonok és segédek a menükhöz ── */
const UI_ICONS = {
  chevron: '<svg class="pill-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  check:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  plus:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash:   '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  star:    '<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  search:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
};

/* ── Szűrő pillák ── */
function renderFilterBar() {
  const bar = document.getElementById('filter-pills');
  if (!bar) return;
  validateDayFilter();
  const f = state.filters;
  const pills = [];
  if (getLessonOptions().length > 0) pills.push(['lesson', f.lesson !== 'all' ? lessonLabel(f.lesson) : 'Lecke', f.lesson !== 'all']);
  if (getDayOptions().length > 0) pills.push(['day', f.day !== 'all' ? `Úti terv: ${f.day}. nap` : 'Úti terv', f.day !== 'all']);
  pills.push(['tags', f.tags.length === 0 ? 'Témakör' : f.tags.length === 1 ? f.tags[0] : `${f.tags.length} témakör`, f.tags.length > 0]);
  pills.push(['diff', f.diff.size > 0 ? [...f.diff].sort((a, b) => diffOrder(a) - diffOrder(b)).join(' · ') : 'Szint', f.diff.size > 0]);
  pills.push(['list', listLabel(f.list), !!f.list && f.list !== 'all']);

  bar.innerHTML = pills.map(([key, label, active]) => `
    <button class="pill ${active ? 'is-active' : ''}" data-menu="${key}" aria-haspopup="true" aria-expanded="${_openMenu === key}" onclick="toggleFilterMenu('${key}')">
      <span class="pill-label">${escHtml(label)}</span>${UI_ICONS.chevron}
    </button>`).join('') +
    (hasPoolFilters() ? `<button class="pill pill-clear" onclick="clearFilters()">Szűrők törlése</button>` : '');

  const sortLabel = document.getElementById('sort-label');
  if (sortLabel) sortLabel.textContent = (SORT_OPTIONS.find(([v]) => v === f.sort) || SORT_OPTIONS[0])[1];
}

// Csillag, lista-mentés stb. után: pillák + nyitott menü frissítése
function refreshLibraryChrome() {
  renderFilterBar();
  if (_openMenu) renderFilterMenu();
}

function onFiltersChanged({ close = false } = {}) {
  renderFilterBar();
  applyFilters();
  if (close) closeFilterMenu(); else renderFilterMenu();
}

/* ── Lenyíló menük ──
   Egyetlen #filter-menu konténer, a nyitó gomb alá pozicionálva. A pillák a scrim
   fölött maradnak, így egy koppintással át lehet váltani egy másik menüre. */
let _openMenu = null;
let _tagQuery = '';

function toggleFilterMenu(key) {
  if (_openMenu === key) { closeFilterMenu(); return; }
  const fromKeyboard = !!document.activeElement?.matches?.(':focus-visible');
  toggleDockSettings(false);
  const menu = document.getElementById('filter-menu');
  if (menu) menu.innerHTML = ''; // új menü: görgetés a tetejéről
  _openMenu = key;
  renderFilterMenu();
  setScrim(true);
  // Billentyűzettel nyitva a fókusz a kiválasztott (vagy első) opcióra ugrik
  if (fromKeyboard && menu) (menu.querySelector('.is-selected') || menu.querySelector('button, input'))?.focus();
}

function closeFilterMenu() {
  if (!_openMenu) return;
  const key = _openMenu;
  const menu = document.getElementById('filter-menu');
  const hadFocus = !!(menu && menu.contains(document.activeElement));
  _openMenu = null;
  if (menu) { menu.hidden = true; menu.innerHTML = ''; }
  syncMenuTriggers();
  if (!_dockOpen) setScrim(false);
  // Billentyűzettel használva a fókusz visszakerül a nyitó gombra
  if (hadFocus) document.querySelector(`[data-menu="${key}"]`)?.focus();
}

function syncMenuTriggers() {
  document.querySelectorAll('[data-menu]').forEach(b => b.setAttribute('aria-expanded', b.dataset.menu === _openMenu ? 'true' : 'false'));
}

function renderFilterMenu() {
  const menu = document.getElementById('filter-menu');
  if (!menu || !_openMenu) return;
  const builders = { lesson: lessonMenuHtml, day: dayMenuHtml, tags: tagsMenuHtml, diff: diffMenuHtml, list: listMenuHtml, sort: sortMenuHtml };
  const prevScroll = menu.querySelector('.menu-body')?.scrollTop || 0;
  menu.innerHTML = builders[_openMenu]();
  menu.hidden = false;
  const body = menu.querySelector('.menu-body');
  if (body) body.scrollTop = prevScroll;
  syncMenuTriggers();
  positionFilterMenu();
}

// A menü a nyitó gomb alá kerül, és nem lóghat a lebegő dokk / navigáció alá
function positionFilterMenu() {
  const menu = document.getElementById('filter-menu');
  const host = document.getElementById('lib-main');
  const trigger = document.querySelector(`[data-menu="${_openMenu}"]`);
  if (!menu || !host || !trigger) return;
  const triggerBottom = trigger.getBoundingClientRect().bottom;
  menu.style.top = (triggerBottom - host.getBoundingClientRect().top + 8) + 'px';
  const floorEls = ['bottom-nav', 'practice-dock']
    .map(id => document.getElementById(id))
    .filter(el => el && getComputedStyle(el).position === 'fixed' && el.getClientRects().length > 0); // fixed elemnél az offsetParent mindig null
  const floor = Math.min(window.innerHeight, ...floorEls.map(el => el.getBoundingClientRect().top)) - 12;
  menu.style.maxHeight = Math.max(260, floor - triggerBottom - 8) + 'px';
}

function menuShell(title, meta, body, foot = '') {
  return `
    <div class="menu-head"><span class="menu-title">${title}</span>${meta ? `<span class="menu-meta">${meta}</span>` : ''}</div>
    <div class="menu-body">${body}</div>
    ${foot ? `<div class="menu-foot">${foot}</div>` : ''}`;
}

function menuOption({ selected, label, meta = '', action, extra = '' }) {
  return `
    <div class="menu-row">
      <button class="menu-opt ${selected ? 'is-selected' : ''}" role="option" aria-selected="${selected}" onclick="${action}">
        <span class="menu-check">${selected ? UI_ICONS.check : ''}</span>
        <span class="menu-opt-label">${label}</span>
        ${meta !== '' ? `<span class="menu-opt-meta">${meta}</span>` : ''}
      </button>${extra}
    </div>`;
}

function menuIconBtn(action, label, icon, disabled = false) {
  return `<button class="menu-icon-btn" onclick="${action}" aria-label="${escHtml(label)}" title="${escHtml(label)}" ${disabled ? 'disabled' : ''}>${icon}</button>`;
}

function lessonMenuHtml() {
  const f = state.filters;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const opts = getLessonOptions();
  const rows = menuOption({ selected: f.lesson === 'all', label: 'Minden lecke', action: `setLessonFilter('all')` }) +
    opts.map(o => menuOption({
      selected: String(f.lesson) === o.value,
      label: escHtml(lessonLabel(o.value)),
      meta: o.fresh > 0 ? `${o.total} ${unit} · <b>${o.fresh} új</b>` : `${o.total} ${unit}`,
      action: `setLessonFilter(${jsArg(o.value)})`
    })).join('');
  return menuShell('Lecke', `${opts.length} lecke`, `<div role="listbox" aria-label="Lecke">${rows}</div>`);
}

function dayMenuHtml() {
  const f = state.filters;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const opts = getDayOptions();
  const rows = menuOption({ selected: f.day === 'all', label: 'Minden nap', action: `setDayFilter('all')` }) +
    opts.map(o => menuOption({ selected: String(f.day) === o.value, label: `${o.value}. nap`, meta: `${o.total} ${unit}`, action: `setDayFilter(${jsArg(o.value)})` })).join('');
  return menuShell('Úti terv', `${opts.length} nap`, `<div role="listbox" aria-label="Úti terv nap">${rows}</div>`);
}

function tagChipsHtml() {
  const counts = {};
  state.words.forEach(w => w.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const q = _tagQuery.toLowerCase().trim();
  const tags = Object.keys(counts).filter(t => !q || t.includes(q)).sort((a, b) => a.localeCompare(b, 'hu'));
  if (tags.length === 0) return '<p class="menu-empty">Nincs ilyen témakör.</p>';
  return tags.map(t => {
    const on = state.filters.tags.includes(t);
    return `<button class="chip ${on ? 'is-selected' : ''}" aria-pressed="${on}" onclick="toggleTag(${jsArg(t)})">${escHtml(t)}<span class="chip-count">${counts[t]}</span></button>`;
  }).join('');
}

function tagsMenuHtml() {
  const search = `
    <label class="menu-search">${UI_ICONS.search}
      <input id="tag-search" type="search" placeholder="Témakör keresése" autocomplete="off" value="${escHtml(_tagQuery)}" oninput="onTagSearch(this.value)" aria-label="Témakör keresése">
    </label>`;
  return menuShell('Témakör', 'Több is választható',
    search + `<div class="chip-grid" id="tag-chips">${tagChipsHtml()}</div>`,
    `<button class="menu-link" onclick="setTags([])">Összes törlése</button><button class="menu-done" onclick="closeFilterMenu()">Kész</button>`);
}

function onTagSearch(value) {
  _tagQuery = value;
  const chips = document.getElementById('tag-chips');
  if (chips) chips.innerHTML = tagChipsHtml();
}

// Témakör váltásnál csak a chipeket rajzoljuk újra, hogy a keresőmező fókusza megmaradjon
function toggleTag(tag) {
  const tags = state.filters.tags;
  const i = tags.indexOf(tag);
  if (i >= 0) tags.splice(i, 1); else tags.push(tag);
  renderFilterBar();
  applyFilters();
  onTagSearch(_tagQuery);
}

function setTags(list) {
  state.filters.tags = list;
  renderFilterBar();
  applyFilters();
  onTagSearch(_tagQuery);
}

function diffMenuHtml() {
  const levels = currentMode === 'english' ? ['B1', 'B2', 'C1', 'C2'] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  const counts = {};
  state.words.forEach(w => { counts[w.diff] = (counts[w.diff] || 0) + 1; });
  const chips = levels.map(d => {
    const on = state.filters.diff.has(d);
    return `<button class="chip chip-level ${on ? 'is-selected' : ''}" aria-pressed="${on}" onclick="toggleDiff('${d}')">${d}<span class="chip-count">${counts[d] || 0}</span></button>`;
  }).join('');
  return menuShell('Szint', currentMode === 'english' ? 'CEFR' : 'JLPT', `<div class="chip-grid">${chips}</div>`,
    `<button class="menu-link" onclick="clearDiff()">Összes törlése</button><button class="menu-done" onclick="closeFilterMenu()">Kész</button>`);
}

function toggleDiff(d) {
  const set = state.filters.diff;
  if (set.has(d)) set.delete(d); else set.add(d);
  onFiltersChanged();
}

function clearDiff() {
  state.filters.diff = new Set();
  onFiltersChanged();
}

function listMenuHtml() {
  const f = state.filters;
  const bmCount = getBookmarkedWords().length;
  const sel = state.selectedIds.size;
  const rows = [
    menuOption({ selected: !f.list || f.list === 'all', label: 'Minden szó', action: `setListFilter('all')` }),
    menuOption({
      selected: f.list === '__focus', label: 'Fókusz Lista', meta: bmCount, action: `setListFilter('__focus')`,
      extra: bmCount > 0 ? menuIconBtn('clearAllBookmarks()', 'Összes csillag törlése', UI_ICONS.trash) : ''
    })
  ];
  (state.playlists || []).forEach(p => {
    const fromFile = p.source === 'data_js';
    const extra = fromFile ? '' :
      menuIconBtn(`expandPlaylist(${jsArg(p.id)})`, sel > 0 ? `${sel} kijelölt szó hozzáadása` : 'Jelölj ki szavakat a bővítéshez', UI_ICONS.plus, sel === 0) +
      menuIconBtn(`deletePlaylist(${jsArg(p.id)})`, 'Lista törlése', UI_ICONS.trash);
    rows.push(menuOption({
      selected: f.list === p.id, label: `${fromFile && p.icon ? escHtml(p.icon) + ' ' : ''}${escHtml(p.name)}` /* saját (data.js) ikon megmarad */,
      meta: p.wordIds.length, action: `setListFilter(${jsArg(p.id)})`, extra
    }));
  });
  const foot = `
    <form class="menu-new-list" onsubmit="event.preventDefault(); savePlaylist();">
      <input id="playlist-name-input" type="text" maxlength="40" autocomplete="off" aria-label="Új lista neve"
        placeholder="${sel > 0 ? `${sel} kijelölt szó mentése új listaként` : 'Jelölj ki szavakat egy új listához'}" ${sel > 0 ? '' : 'disabled'}>
      <button type="submit" class="menu-done" ${sel > 0 ? '' : 'disabled'}>Mentés</button>
    </form>`;
  return menuShell('Lista', 'Szűrés listára', `<div role="listbox" aria-label="Lista">${rows.join('')}</div>`, foot);
}

function sortMenuHtml() {
  const rows = SORT_OPTIONS.map(([v, l]) => menuOption({ selected: state.filters.sort === v, label: l, action: `setSort('${v}')` })).join('');
  return menuShell('Rendezés', '', `<div role="listbox" aria-label="Rendezés">${rows}</div>`);
}

function setLessonFilter(v) { state.filters.lesson = v; onFiltersChanged({ close: true }); }
function setDayFilter(v)    { state.filters.day = v;    onFiltersChanged({ close: true }); }
function setListFilter(id)  { state.filters.list = id || 'all'; onFiltersChanged({ close: true }); }
function setSort(s)         { state.filters.sort = s;   onFiltersChanged({ close: true }); }

/* ── Scrim + közös bezárás (Esc, háttér koppintás, képernyőváltás) ── */
function setScrim(on) {
  const scrim = document.getElementById('lib-scrim');
  if (scrim) scrim.hidden = !on;
}

function closeLibraryOverlays() {
  closeFilterMenu();
  toggleDockSettings(false);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (_openMenu || _dockOpen)) closeLibraryOverlays();
});
window.addEventListener('resize', () => { if (_openMenu) positionFilterMenu(); });

function resetTagQuery() { _tagQuery = ''; }

export { UI_ICONS, _openMenu, _tagQuery, clearDiff, closeFilterMenu, closeLibraryOverlays, dayMenuHtml, diffMenuHtml, lessonMenuHtml, listMenuHtml, menuIconBtn, menuOption, menuShell, onFiltersChanged, onTagSearch, positionFilterMenu, refreshLibraryChrome, renderFilterBar, renderFilterMenu, resetTagQuery, setDayFilter, setLessonFilter, setListFilter, setScrim, setSort, setTags, sortMenuHtml, syncMenuTriggers, tagChipsHtml, tagsMenuHtml, toggleDiff, toggleFilterMenu, toggleTag };
