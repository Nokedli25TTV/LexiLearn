// LexiLearn – library/dock.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { createEmptyState, currentMode, state } from '../core/state.js';
import { saveSettings } from '../core/storage.js';
import { updateStartPanel } from './list.js';
import { _openMenu, closeFilterMenu, setScrim } from './menus.js';

/* ══════════════════════════════════════════════════════
   GYAKORLÁS DOKK (típus, irány, kérdésszám, sorrend)
══════════════════════════════════════════════════════ */
const PRACTICE_TYPES = [
  { value: 'classic',      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>', name: 'Klasszikus',        desc: '4 válaszból választasz' },
  { value: 'hardcore',     icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>', name: 'Gépelős',           desc: 'Beírod a választ' },
  { value: 'sentenceFill', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h7M15 12h5M4 18h16"/></svg>', name: 'Mondat-kiegészítő', desc: 'A szó a példamondatban' },
  { value: 'flashcard3d',  icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17"/></svg>', name: '3D kártya',         desc: 'Fordítsd meg, húzd el' }
];
const PRACTICE_COUNTS = [10, 20, 30, 50, 'all'];
const PRACTICE_ORDERS = [['random', 'Véletlen'], ['az', 'A → Z'], ['za', 'Z → A'], ['diff-asc', 'Könnyebb elöl'], ['diff-desc', 'Nehezebb elöl']];
const DIRECTION_LABELS = {
  english:  ['Angol → magyar', 'Magyar → angol'],
  japanese: ['Kana → magyar',  'Magyar → kana'],
  kanji:    ['Kanji → magyar', 'Magyar → kanji']
};

function getPracticeOptions() {
  if (!state.practiceOptions) state.practiceOptions = { ...createEmptyState().practiceOptions };
  return state.practiceOptions;
}

function renderPracticeDock() {
  const box = document.getElementById('dock-settings');
  if (!box) return;
  const o = getPracticeOptions();
  const dirLabels = DIRECTION_LABELS[currentMode];
  const radio = (on, attrs, label, cls = '') => `<button role="radio" aria-checked="${on}" class="${cls} ${on ? 'active is-selected' : ''}" ${attrs}>${label}</button>`;

  box.innerHTML = `
    <div class="dock-group">
      <span class="dock-label" id="dock-type-label">Gyakorlás típusa</span>
      <div class="type-list" role="radiogroup" aria-labelledby="dock-type-label">
        ${PRACTICE_TYPES.map(t => radio(o.type === t.value, `onclick="setPracticeOption('type', '${t.value}')"`,
          `<span class="type-ico" aria-hidden="true">${t.icon}</span><span class="type-text"><b>${t.name}</b><small>${t.desc}</small></span>`, 'type-opt')).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-dir-label">Irány</span>
      <div class="segmented" role="radiogroup" aria-labelledby="dock-dir-label">
        ${['en-hu', 'hu-en'].map((d, i) => radio(state.direction === d, `onclick="setDirection('${d}')"`, dirLabels[i])).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-count-label">Kérdések száma</span>
      <div class="segmented" role="radiogroup" aria-labelledby="dock-count-label">
        ${PRACTICE_COUNTS.map(c => radio(o.count === c, `onclick="setPracticeOption('count', ${c === 'all' ? `'all'` : c})"`, c === 'all' ? 'Mind' : c)).join('')}
      </div>
    </div>
    <div class="dock-group">
      <span class="dock-label" id="dock-order-label">Sorrend</span>
      <div class="chip-grid chip-grid-flat" role="radiogroup" aria-labelledby="dock-order-label">
        ${PRACTICE_ORDERS.map(([v, l]) => radio(o.order === v, `onclick="setPracticeOption('order', '${v}')"`, l, 'chip')).join('')}
      </div>
    </div>`;

  const type = PRACTICE_TYPES.find(t => t.value === o.type) || PRACTICE_TYPES[0];
  const summary = document.getElementById('dock-summary');
  if (summary) summary.textContent = `${type.name} · ${o.count === 'all' ? 'mind' : o.count}`;
  updateStartPanel();
}

function setPracticeOption(key, value) {
  getPracticeOptions()[key] = value;
  renderPracticeDock();
  saveSettings();
}

function setDirection(dir) {
  state.direction = dir;
  renderPracticeDock();
  saveSettings();
}

let _dockOpen = false;

function toggleDockSettings(force) {
  const next = typeof force === 'boolean' ? force : !_dockOpen;
  if (next === _dockOpen) return;
  _dockOpen = next;
  if (next) closeFilterMenu();
  const dock = document.getElementById('practice-dock');
  if (dock) dock.classList.toggle('is-open', next);
  const btn = document.getElementById('dock-settings-btn');
  if (btn) btn.setAttribute('aria-expanded', next ? 'true' : 'false');
  setScrim(next || !!_openMenu);
}

export { DIRECTION_LABELS, PRACTICE_COUNTS, PRACTICE_ORDERS, PRACTICE_TYPES, _dockOpen, getPracticeOptions, renderPracticeDock, setDirection, setPracticeOption, toggleDockSettings };
