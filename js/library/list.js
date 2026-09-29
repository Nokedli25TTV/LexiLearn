// LexiLearn – library/list.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { JAPANESE_SENTENCES, english_sentences2 } from '../core/data.js';
import { appData, currentMode, diffOrder, state } from '../core/state.js';
import { saveSettings } from '../core/storage.js';
import { escHtml, escRegex } from '../core/util.js';
import { toggleBookmark } from '../features/bookmarks.js';
import { hasPoolFilters } from '../habit/goal.js';
import { renderPracticeDock } from './dock.js';
import { wordMatchesFilters } from './filters.js';
import { UI_ICONS, _openMenu, renderFilterBar, renderFilterMenu } from './menus.js';
import { showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   V13.1: GYAKORLÁS FÜL
   - Keresés + lenyíló szűrő pillák (Lecke, Úti terv, Témakör, Szint, Lista)
   - Lapozva renderelt szólista: nincs belső görgetősáv, és nem kerül egyszerre
     több ezer sor a DOM-ba (görgetéskor töltődik a következő adag)
   - Gyakorlás dokk: mobilon lebegő üveg sáv felfelé nyíló beállításokkal,
     asztalon ragadós oldalpanel. A típus / kérdésszám / sorrend módonként mentődik.
══════════════════════════════════════════════════════ */
function renderDashboard() {
  renderFilterBar();
  applyFilters();
  renderPracticeDock();
}

/* ── Szólista (lapozva) ── */
let _filteredWords = [];
let _listShown = 0;
let _knownWordsForSentences = [];
const WORD_PAGE = 120;
const SENTENCE_PAGE = 25;

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) state.filters.search = searchInput.value.toLowerCase().trim();

  const filtered = state.words.filter(w => wordMatchesFilters(w));
  const sort = state.filters.sort;
  if      (sort === 'az')        filtered.sort((a,b) => a.en.localeCompare(b.en));
  else if (sort === 'za')        filtered.sort((a,b) => b.en.localeCompare(a.en));
  else if (sort === 'diff-asc')  filtered.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (sort === 'diff-desc') filtered.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));
  else if (sort === 'unlearned') filtered.sort((a,b) => a.stats.streak - b.stats.streak);
  else if (sort === 'mastered')  filtered.sort((a,b) => b.stats.streak - a.stats.streak);
  _filteredWords = filtered;

  const countLabel = document.getElementById('word-count-label');
  if (countLabel) countLabel.textContent = `${filtered.length.toLocaleString('hu-HU')} ${currentMode === 'kanji' ? 'kanji' : 'szó'}`;

  renderActiveList();
  updateSelectAllBtn();
  saveSettings(); // Szűrő változás csak beállítást érint
}

// Csak az aktív nézetet rendereljük (a mondatos nézet sok regexet futtat)
function renderActiveList() {
  const isSentences = state.activeViewTab === 'sentences';
  const wordView = document.getElementById('word-list-view');
  const sentView = document.getElementById('sentence-list-view');
  if (wordView) wordView.style.display = isSentences ? 'none' : '';
  if (sentView) sentView.style.display = isSentences ? '' : 'none';
  [['vtab-words', !isSentences], ['vtab-sentences', isSentences]].forEach(([id, on]) => {
    const tab = document.getElementById(id);
    if (tab) { tab.classList.toggle('active', on); tab.setAttribute('aria-selected', on ? 'true' : 'false'); }
  });

  const container = document.getElementById(isSentences ? 'sentence-list' : 'word-list');
  const other = document.getElementById(isSentences ? 'word-list' : 'sentence-list');
  if (other) other.innerHTML = '';
  if (!container) return;

  if (isSentences && currentMode !== 'english') {
    // Ismert japán szavak a kék kiemeléshez, hosszabbak elöl (hogy a hosszabbat találja meg előbb)
    _knownWordsForSentences = appData.japanese.words.concat(appData.kanji.words)
      .map(w => w.en).filter(Boolean).sort((a, b) => b.length - a.length);
  }

  _listShown = 0;
  if (_filteredWords.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        <p class="list-empty-title">Nincs találat.</p>
        <p class="list-empty-sub">${hasPoolFilters() || state.filters.search ? 'Próbálj más keresést, vagy töröld a szűrőket.' : 'Ebben a módban még nincs szó.'}</p>
        ${hasPoolFilters() ? '<button class="menu-link" onclick="clearFilters()">Szűrők törlése</button>' : ''}
      </div>`;
    return;
  }
  container.innerHTML = '';
  appendListPage();
}

function appendListPage() {
  const isSentences = state.activeViewTab === 'sentences';
  const container = document.getElementById(isSentences ? 'sentence-list' : 'word-list');
  if (!container || _listShown >= _filteredWords.length) return;
  const page = _filteredWords.slice(_listShown, _listShown + (isSentences ? SENTENCE_PAGE : WORD_PAGE));
  container.insertAdjacentHTML('beforeend', page.map(isSentences ? sentenceCardHtml : wordRowHtml).join(''));
  _listShown += page.length;
  requestAnimationFrame(fillListViewport);
}

// Ha a lista vége (a sentinel) a képernyő közelében van, töltünk rá egy adagot
function fillListViewport() {
  if (document.body.dataset.screen !== 'dashboard') return;
  const sentinel = document.getElementById('list-sentinel');
  if (sentinel && sentinel.getBoundingClientRect().top < window.innerHeight + 600) appendListPage();
}

function wordRowHtml(w) {
  const selected = state.selectedIds.has(w.id);
  const s = w.stats;
  const attempts = s.totalCorrect + s.totalWrong;
  const pct = attempts > 0 ? Math.round(s.totalCorrect / attempts * 100) : null;
  let sub = w.hu;
  if (currentMode === 'japanese' && w.romaji) sub = `${w.hu} · ${w.romaji}`;
  if (currentMode === 'kanji') sub = `${w.hu} · ${w.onyomi || '–'} / ${w.kunyomi || '–'}`;
  const starLabel = w.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához';
  return `
    <div class="word-row ${selected ? 'is-selected' : ''}" data-id="${escHtml(w.id)}">
      <button class="word-toggle" role="checkbox" aria-checked="${selected}">
        <span class="word-check" aria-hidden="true">${UI_ICONS.check}</span>
        <span class="word-main">
          <span class="word-src ${currentMode === 'kanji' ? 'is-kanji' : ''}">${escHtml(w.en)}</span>
          <span class="word-sub">${escHtml(sub)}</span>
        </span>
        <span class="word-meta">
          ${s.streak > 0 ? `<span class="word-stat" title="Egymás utáni helyes válaszok">${s.streak}×</span>` : ''}
          ${pct !== null ? `<span class="word-stat" title="Pontosság">${pct}%</span>` : ''}
          <span class="diff-pill d${escHtml(w.diff)}">${escHtml(w.diff)}</span>
        </span>
      </button>
      <button class="word-star ${w.bookmarked ? 'is-on' : ''}" aria-pressed="${!!w.bookmarked}" aria-label="${starLabel}" title="${starLabel}">${UI_ICONS.star}</button>
    </div>`;
}

/* ══════════════════════════════════════════════════════
   OKOS MONDAT SZÍNEZŐ (V6.7) – kártyánként, lapozva
   Zöld: a szó maga · Kék: más, a szótárban már szereplő szó
══════════════════════════════════════════════════════ */
function sentenceCardHtml(w) {
  const bottom = `
    <div class="sent-bottom">
      <span class="sent-hu">${escHtml(w.hu)}</span>
      <span class="sent-tags"><span class="diff-pill d${escHtml(w.diff)}">${escHtml(w.diff)}</span>${escHtml(w.tags.join(', '))}</span>
    </div>`;
  const head = count => `<header class="sent-head"><span class="sent-word">${escHtml(w.en)}</span><span class="sent-count">${count} mondat</span></header>`;
  const missing = `<p class="sent-missing">Nincs még példamondat ehhez a szóhoz.</p>`;

  if (currentMode === 'english') {
    const enSentences = typeof english_sentences2 !== 'undefined' ? english_sentences2.filter(s => s.baseWord === w.en) : [];
    if (enSentences.length === 0) {
      const own = w.sentence
        ? `<div class="sent-text">${escHtml(w.sentence).replace(new RegExp('\\b(' + escRegex(w.en) + ')\\b', 'gi'), m => `<span class="hl-main">${m}</span>`)}</div>`
        : missing;
      return `<article class="sent-card">${head(w.sentence ? 1 : 0)}${own}${bottom}</article>`;
    }
    const items = enSentences.map(s => `
      <div class="sent-item">
        <div class="sent-text">${s.fullSentenceHTML.replace(/<strong>(.*?)<\/strong>/g, '<span class="hl-main">$1</span>')}</div>
        <div class="sent-tr">${escHtml(s.hungarian)}</div>
      </div>`).join('');
    return `<article class="sent-card">${head(enSentences.length)}${items}${bottom}</article>`;
  }

  const sentences = typeof JAPANESE_SENTENCES !== 'undefined' ? JAPANESE_SENTENCES.filter(s => s.baseWord === w.en) : [];
  const romaji = w.romaji ? `<div class="sent-romaji">${escHtml(w.romaji)}</div>` : '';
  if (sentences.length === 0) return `<article class="sent-card">${head(0)}${romaji}${missing}${bottom}</article>`;

  const items = sentences.map(s => {
    let html = s.fullSentenceHTML;
    if (s.correctAnswer) {
      html = html.replace(new RegExp(`(${escRegex(s.correctAnswer)})`, 'g'), '<span class="hl-main">$1</span>');
    }
    _knownWordsForSentences.filter(kw => kw !== w.en && kw !== s.correctAnswer).forEach(knownWord => {
      if (html.includes(knownWord)) {
        html = html.replace(new RegExp(`(?![^<]*>)${escRegex(knownWord)}`, 'g'), `<span class="hl-known" title="Ismert szó a szótárból">${knownWord}</span>`);
      }
    });
    return `
      <div class="sent-item">
        <div class="sent-text">${html}</div>
        <div class="sent-tr">${escHtml(s.hungarian)}</div>
      </div>`;
  }).join('');
  return `<article class="sent-card">${head(sentences.length)}${romaji}${items}${bottom}</article>`;
}

function switchViewTab(tab) {
  state.activeViewTab = tab;
  renderActiveList();
}

/* ── Kijelölés ── */
function setRowSelected(row, on) {
  row.classList.toggle('is-selected', on);
  const toggle = row.querySelector('.word-toggle');
  if (toggle) toggle.setAttribute('aria-checked', on ? 'true' : 'false');
}

function toggleWordSelection(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
  const row = document.querySelector(`.word-row[data-id="${CSS.escape(id)}"]`);
  if (row) setRowSelected(row, state.selectedIds.has(id));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
}

function allFilteredSelected() {
  return _filteredWords.length > 0 && _filteredWords.every(w => state.selectedIds.has(w.id));
}

// "Mind kijelölése" az ÖSSZES szűrt szót kijelöli (nem csak a már kirajzolt sorokat)
function toggleSelectAll() {
  if (allFilteredSelected()) { selectNone(); return; }
  _filteredWords.forEach(w => state.selectedIds.add(w.id));
  document.querySelectorAll('.word-row').forEach(row => setRowSelected(row, true));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
  showToast(`${_filteredWords.length} szó kijelölve`);
}

function selectNone() {
  state.selectedIds.clear();
  document.querySelectorAll('.word-row.is-selected').forEach(row => setRowSelected(row, false));
  updateStartPanel();
  updateSelectAllBtn();
  saveSettings();
}

function updateSelectAllBtn() {
  const btn = document.getElementById('select-all-btn');
  if (!btn) return;
  btn.textContent = allFilteredSelected() ? 'Kijelölés törlése' : 'Mind kijelölése';
  btn.disabled = _filteredWords.length === 0;
}

function updateStartPanel() {
  const cnt = state.selectedIds.size;
  const big = document.getElementById('selected-count-big');
  const startBtn = document.getElementById('start-btn');
  const clearBtn = document.getElementById('dock-clear');
  if (big) big.textContent = cnt.toLocaleString('hu-HU');
  if (startBtn) startBtn.disabled = cnt === 0;
  if (clearBtn) clearBtn.hidden = cnt === 0;
  if (_openMenu === 'list') renderFilterMenu(); // a "mentés új listaként" a kijelöléstől függ
}

// Eseménykezelés delegálva: a sorok újrarajzolása után sem kell újra feliratkozni,
// és az aposztrófos szavak (pl. "don't") sem törik el az inline onclick-et.
function initLibraryEvents() {
  const list = document.getElementById('word-list');
  if (list) {
    list.addEventListener('click', e => {
      const row = e.target.closest('.word-row');
      if (!row) return;
      if (e.target.closest('.word-star')) toggleBookmark(row.dataset.id);
      else if (e.target.closest('.word-toggle')) toggleWordSelection(row.dataset.id);
    });
  }
  // Lapozás görgetésre: képkockánként legfeljebb egyszer nézzük meg, látszik-e a lista vége
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; fillListViewport(); });
  }, { passive: true });
}

export { SENTENCE_PAGE, WORD_PAGE, _filteredWords, _knownWordsForSentences, _listShown, allFilteredSelected, appendListPage, applyFilters, fillListViewport, initLibraryEvents, renderActiveList, renderDashboard, selectNone, sentenceCardHtml, setRowSelected, switchViewTab, toggleSelectAll, toggleWordSelection, updateSelectAllBtn, updateStartPanel, wordRowHtml };
