// LexiLearn – features/quest-launcher.js (V13.63)
// A napi feladat indító lapja: lebegő lap a szavak szűrőivel (Állapot, Lecke, a feladat témaköre vagy
// rögzített szavai) és a szokásos gyakorlás-beállításokkal (a dokkéval azonos jelölés), előre kitöltve.
// Az Indítás a kiválasztott szavakkal a meglévő gyakorlást indítja; a Gyakorlás fül kijelölése utána
// visszaáll, a fül szűrői nem változnak.
import { currentMode, state, unitOf } from '../core/state.js';
import { escHtml, jsArg } from '../core/util.js';
import { isLearnedWord, isStartedWord } from '../goal/jlpt.js';
import { getPracticeOptions, practiceSettingsHtml, practiceTypesFor, setPracticeOption } from '../library/dock.js';
import { getLessonOptions, lessonLabel, wordLessons } from '../library/filters.js';

const STATUSES = [['all', 'Minden'], ['new', 'Új'], ['learning', 'Tanulás alatt'], ['learned', 'Megtanult']];
const statusOf = w => (isLearnedWord(w) ? 'learned' : isStartedWord(w) ? 'learning' : 'new');

let _ql = null;
let _returnFocus = null;
const modal = () => document.getElementById('quest-modal');

// A feladat szavai a szűrők szerint, az állapot nélkül (az állapot-számlálóhoz)
function basePool() {
  let pool = state.words;
  if (_ql.fixedIds) { const ids = new Set(_ql.fixedIds); pool = pool.filter(w => ids.has(w.id)); }
  if (_ql.tags.length) pool = pool.filter(w => (w.tags || []).some(t => _ql.tags.includes(t)));
  if (_ql.lessons.length) pool = pool.filter(w => wordLessons(w).some(l => _ql.lessons.includes(l)));
  return pool;
}
const questPool = () => (_ql.status === 'all' ? basePool() : basePool().filter(w => statusOf(w) === _ql.status));

function roundSize(n) {
  const o = getPracticeOptions();
  return o.count === 'all' ? n : Math.min(Number(o.count) || 20, n);
}

function lessonsHtml() {
  if (_ql.fixedIds) return '';
  const opts = getLessonOptions().filter(o => !Number.isNaN(Number(o.value)));
  if (!opts.length) return '';
  const any = !_ql.lessons.length;
  return `
    <div class="dock-group">
      <span class="dock-label" id="ql-lesson-label">Lecke</span>
      <div class="ql-lessons" role="group" aria-labelledby="ql-lesson-label">
        <button type="button" class="chip${any ? ' is-selected' : ''}" aria-pressed="${any}" onclick="qlAnyLesson()">Bármelyik</button>
        ${opts.map(o => {
          const on = _ql.lessons.includes(o.value);
          return `<button type="button" class="chip ql-lesson${on ? ' is-selected' : ''}" data-lesson="${escHtml(o.value)}" aria-pressed="${on}"
            aria-label="${escHtml(lessonLabel(o.value))}" onclick="qlToggleLesson(${jsArg(o.value)})">${escHtml(o.value)}.</button>`;
        }).join('')}
      </div>
    </div>`;
}

function bodyHtml() {
  const pool = basePool();
  const counts = { all: pool.length, new: 0, learning: 0, learned: 0 };
  pool.forEach(w => { counts[statusOf(w)]++; });
  const n = _ql.status === 'all' ? counts.all : counts[_ql.status];
  const size = roundSize(n);
  const unit = unitOf();
  const source = _ql.fixedIds
    ? `<p class="ql-source">${escHtml(_ql.fixedLabel || 'A feladat szavai')} · ${pool.length} ${unit}</p>`
    : _ql.tags.length
      ? `<p class="ql-source">${_ql.tags.map(t => `<span class="ql-tag">Témakör: ${escHtml(t)}</span>`).join(' ')}</p>`
      : '';
  return `
    <div class="wi-head">
      <div class="wi-title">
        <div class="gr-kicker">Napi feladat</div>
        <h2 class="ql-title" id="ql-title">${escHtml(_ql.title)}</h2>
      </div>
      <button type="button" class="inspector-close" onclick="closeQuestLauncher()" aria-label="Bezárás">×</button>
    </div>
    <section class="ql-sec" aria-labelledby="ql-words-title">
      <h3 class="ql-sec-title" id="ql-words-title">Mit gyakorolsz</h3>
      ${source}
      <div class="dock-group">
        <span class="dock-label" id="ql-status-label">Állapot</span>
        <div class="chip-grid chip-grid-flat" role="radiogroup" aria-labelledby="ql-status-label">
          ${STATUSES.map(([v, l]) => {
            const on = _ql.status === v;
            return `<button type="button" role="radio" aria-checked="${on}" class="chip${on ? ' is-selected' : ''}" onclick="qlSetStatus('${v}')">${l} <span class="chip-count">${counts[v]}</span></button>`;
          }).join('')}
        </div>
      </div>
      ${lessonsHtml()}
      <p class="ql-match" id="ql-match" aria-live="polite">${n ? `${n} ${unit} felel meg, ${size} kerül a körbe.` : 'Ezekkel a szűrőkkel nincs találat.'}</p>
    </section>
    <section class="ql-sec" aria-labelledby="ql-set-title">
      <h3 class="ql-sec-title" id="ql-set-title">Hogyan</h3>
      ${practiceSettingsHtml('ql')}
    </section>
    <div class="modal-actions ql-actions">
      <button type="button" class="ql-start" onclick="startQuestPractice()" ${n ? '' : 'disabled'}>Indítás${n ? ` · ${size} ${unit}` : ''}</button>
    </div>`;
}

function render() {
  const body = document.getElementById('quest-body');
  if (!body || !_ql) return;
  const sheet = modal()?.querySelector('.modal');
  const top = sheet ? sheet.scrollTop : 0;
  body.innerHTML = bodyHtml();
  if (sheet) sheet.scrollTop = top;
}

// preset: { title, status, lessons, tags, fixedIds, fixedLabel, type, minCount }
function openQuestLauncher(preset = {}) {
  const host = modal();
  if (!host) return;
  _ql = {
    title: preset.title || 'Gyakorlás',
    status: preset.status || 'all',
    lessons: (preset.lessons || []).map(String),
    tags: preset.tags || [],
    fixedIds: preset.fixedIds || null,
    fixedLabel: preset.fixedLabel || ''
  };
  // A feladat típusa (pl. írás) és a legkisebb kérdésszám (10+ kör) a közös beállításokba kerül
  if (preset.type && practiceTypesFor(currentMode).some(t => t.value === preset.type)) setPracticeOption('type', preset.type);
  const o = getPracticeOptions();
  if (preset.minCount && o.count !== 'all' && Number(o.count) < preset.minCount) setPracticeOption('count', preset.minCount);
  _returnFocus = document.activeElement;
  render();
  const sheet = host.querySelector('.modal');
  if (sheet) sheet.scrollTop = 0;
  host.classList.add('open');
  host.setAttribute('aria-hidden', 'false');
  // a kiválasztott lecke a görgethető sorban látszódjon
  const sel = host.querySelector('.ql-lesson.is-selected');
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
  setTimeout(() => host.querySelector('.inspector-close')?.focus({ preventScroll: true }), 30);
}

function closeQuestLauncher() {
  const host = modal();
  if (!host || !host.classList.contains('open')) return;
  host.classList.remove('open');
  host.setAttribute('aria-hidden', 'true');
  if (_returnFocus && document.contains(_returnFocus)) {
    try { _returnFocus.focus({ preventScroll: true }); } catch (e) { /* régi böngésző */ }
  }
  _returnFocus = null;
}

function qlSetStatus(v) { if (_ql) { _ql.status = v; render(); } }
function qlAnyLesson() { if (_ql) { _ql.lessons = []; render(); } }
function qlToggleLesson(v) {
  if (!_ql) return;
  v = String(v);
  _ql.lessons = _ql.lessons.includes(v) ? _ql.lessons.filter(x => x !== v) : [..._ql.lessons, v];
  render();
}

// Indítás: a meglévő gyakorlás a feladat szavaival; a Gyakorlás fül kijelölése utána visszaáll
function startQuestPractice() {
  if (!_ql) return;
  const words = questPool();
  if (!words.length) return;
  const prev = state.selectedIds;
  state.selectedIds = new Set(words.map(w => w.id));
  closeQuestLauncher();
  try {
    if (typeof window !== 'undefined' && window.startPractice) window.startPractice();
  } finally {
    state.selectedIds = prev;
  }
}

const isQuestLauncherOpen = () => !!modal()?.classList.contains('open');
const questLauncherState = () => (_ql ? { ..._ql, size: questPool().length } : null);

if (typeof document !== 'undefined') {
  document.addEventListener('lexi:practice-options', () => { if (isQuestLauncherOpen()) render(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isQuestLauncherOpen()) { e.preventDefault(); closeQuestLauncher(); }
  });
  document.addEventListener('click', e => {
    const host = modal();
    if (host && e.target === host && isQuestLauncherOpen()) closeQuestLauncher();
  });
}

export { closeQuestLauncher, isQuestLauncherOpen, openQuestLauncher, qlAnyLesson, qlSetStatus, qlToggleLesson, questLauncherState, startQuestPractice };
