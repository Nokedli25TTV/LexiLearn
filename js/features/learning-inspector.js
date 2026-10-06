// LexiLearn – tanulási állapot és ismétlési sor átlátható kezelése.
import { fmtDay, fmtNum, todayKey } from '../core/dates.js';
import { currentMode, state } from '../core/state.js';
import { saveWords } from '../core/storage.js';
import { escHtml, jsArg } from '../core/util.js';
import { isLearnedWord, isMatureWord, srsInterval } from '../goal/jlpt.js';
import { renderHome } from '../habit/home.js';
import { daysBetween, seedMissing, shiftKey } from '../srs/schedule.js';

const modal = () => document.getElementById('learning-inspector-modal');
const lessonText = w => {
  const lessons = (Array.isArray(w.lesson) ? w.lesson : [w.lesson])
    .map(Number).filter(n => Number.isFinite(n) && n >= 1).sort((a, b) => a - b);
  return lessons.length ? `Dekiru ${lessons.join(', ')}. lecke` : 'Saját szó';
};
const sourceText = w => w.stats?.learnedAt
  ? `Napi tanulás · ${fmtDay(w.stats.learnedAt)}`
  : (w.stats?.totalCorrect || 0) >= 5 ? 'Gyakorlásban legalább 5× helyes' : 'Még nem tanult';

function showInspector(title, subtitle, html) {
  const host = modal();
  if (!host) return;
  const titleEl = document.getElementById('learning-inspector-title');
  const subEl = document.getElementById('learning-inspector-sub');
  const body = document.getElementById('learning-inspector-body');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (body) body.innerHTML = html;
  host.classList.add('open');
}

function wordIdentity(w) {
  const detail = currentMode === 'japanese' && w.romaji ? `${w.hu} · ${w.romaji}` : w.hu;
  return `<span class="inspect-word"><b>${escHtml(w.en)}</b><small>${escHtml(detail)}</small></span>`;
}

function reviewWhen(w, today) {
  const due = w.stats.srs.due;
  const delta = daysBetween(today, due);
  if (delta < 0) return `${Math.abs(delta)} napja esedékes`;
  if (delta === 0) return 'Ma esedékes';
  if (delta === 1) return 'Holnap esedékes';
  return `${fmtDay(due)} esedékes`;
}

function reviewRow(w, today) {
  return `<li class="inspect-row">
    <div class="inspect-row-main">
      ${wordIdentity(w)}
      <span class="inspect-meta">${escHtml(lessonText(w))} · ${escHtml(reviewWhen(w, today))}</span>
      <span class="inspect-reason">Azért van itt, mert a napi tanulásban megtanultad.</span>
    </div>
    <div class="inspect-actions">
      <button class="btn btn-outline btn-sm" onclick="postponeReviewWord(${jsArg(w.id)}, 1)">Holnapra</button>
      <button class="btn btn-outline btn-sm" onclick="postponeReviewWord(${jsArg(w.id)}, 7)">+7 nap</button>
      <button class="btn btn-ghost btn-sm" onclick="suspendReviewWord(${jsArg(w.id)})">Eltávolítás</button>
    </div>
  </li>`;
}

function suspendedRow(w) {
  return `<li class="inspect-row is-muted">
    <div class="inspect-row-main">${wordIdentity(w)}<span class="inspect-meta">${escHtml(lessonText(w))} · szüneteltetve</span></div>
    <button class="btn btn-outline btn-sm" onclick="restoreReviewWord(${jsArg(w.id)})">Visszaállítás</button>
  </li>`;
}

function openReviewQueue() {
  const today = todayKey();
  const active = state.words.filter(w => w.stats?.learnedAt && w.stats?.srs)
    .sort((a, b) => a.stats.srs.due.localeCompare(b.stats.srs.due) || String(a.id).localeCompare(String(b.id)));
  const suspended = state.words.filter(w => w.stats?.learnedAt && w.stats?.srsSuspended)
    .sort((a, b) => String(a.en).localeCompare(String(b.en), 'hu'));
  const due = active.filter(w => w.stats.srs.due <= today).length;
  const activeHtml = active.length
    ? `<ul class="inspect-list">${active.map(w => reviewRow(w, today)).join('')}</ul>`
    : '<p class="inspect-empty">Nincs aktív ismétlőkártya.</p>';
  const suspendedHtml = suspended.length
    ? `<details class="inspect-suspended"><summary>Szüneteltetett kártyák (${fmtNum(suspended.length)})</summary><ul class="inspect-list">${suspended.map(suspendedRow).join('')}</ul></details>`
    : '';
  showInspector('Ismétlési sor', `${due} ma esedékes · ${active.length} aktív kártya`, activeHtml + suspendedHtml);
}

function afterReviewChange(message) {
  saveWords();
  renderHome();
  if (document.body.dataset.screen === 'stats' && window.renderStats) window.renderStats();
  openReviewQueue();
  if (window.showToast) window.showToast(message);
}

function postponeReviewWord(id, days) {
  const w = state.words.find(word => word.id === id);
  if (!w?.stats?.srs) return;
  w.stats.srs.due = shiftKey(todayKey(), days);
  afterReviewChange(days === 1 ? 'A kártya holnapra halasztva.' : 'A kártya egy héttel elhalasztva.');
}

function suspendReviewWord(id) {
  const w = state.words.find(word => word.id === id);
  if (!w?.stats?.srs) return;
  delete w.stats.srs;
  w.stats.srsSuspended = true;
  afterReviewChange('A kártya kikerült az ismétlési sorból.');
}

function restoreReviewWord(id) {
  const w = state.words.find(word => word.id === id);
  if (!w?.stats?.srsSuspended) return;
  delete w.stats.srsSuspended;
  seedMissing([w]);
  afterReviewChange('Az ismétlőkártya visszaállítva.');
}

const INSPECTORS = {
  daily: ['Napi tanulásban megtanult', w => !!w.stats?.learnedAt],
  practice: ['Gyakorlásból ismert', w => !w.stats?.learnedAt && (w.stats?.totalCorrect || 0) >= 5],
  review: ['Aktív ismétlőkártyák', w => !!w.stats?.srs],
  fresh: ['Ismerkedés', w => isLearnedWord(w) && srsInterval(w) < 7],
  practicing: ['Gyakorlás alatt', w => isLearnedWord(w) && srsInterval(w) >= 7 && srsInterval(w) < 21],
  mature: ['Rögzült szavak', w => isMatureWord(w)],
  notStarted: ['Még nem tanult', w => !isLearnedWord(w)]
};

function openWordInspector(kind) {
  const [title, predicate] = INSPECTORS[kind] || INSPECTORS.daily;
  const words = state.words.filter(predicate).sort((a, b) => String(a.en).localeCompare(String(b.en), 'hu'));
  const shown = words.slice(0, 500);
  const rows = shown.map(w => {
    const attempts = (w.stats?.totalCorrect || 0) + (w.stats?.totalWrong || 0);
    const accuracy = attempts ? `${Math.round((w.stats.totalCorrect || 0) / attempts * 100)}%` : 'nincs kvízadat';
    const interval = srsInterval(w);
    return `<li class="inspect-row inspect-word-row">
      <div class="inspect-row-main">${wordIdentity(w)}
        <span class="inspect-meta">${escHtml(lessonText(w))} · ${escHtml(sourceText(w))}</span>
      </div>
      <span class="inspect-side">${interval ? `${interval} napos köz` : accuracy}</span>
    </li>`;
  }).join('');
  const more = words.length > shown.length ? `<p class="inspect-limit">Az első ${shown.length} szó látható.</p>` : '';
  showInspector(title, `${fmtNum(words.length)} ${currentMode === 'kanji' ? 'kanji' : 'szó'}`,
    words.length ? `<ul class="inspect-list">${rows}</ul>${more}` : '<p class="inspect-empty">Ebben a csoportban még nincs szó.</p>');
}

export { openReviewQueue, openWordInspector, postponeReviewWord, restoreReviewWord, suspendReviewWord };
