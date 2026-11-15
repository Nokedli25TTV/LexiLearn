// LexiLearn – practice/lesson-test.js (V13.35)
// Lecke-zárás japán módban: egy Dekiru-lecke elkezdett szavai egyszer, vegyes kérdésekkel
// (jelentés, magyarból választva, gépelve, hallás után). A végén látszik, melyik szó nem ül még,
// és milyen kérdésnél bukott el. Az első kör eredménye leckénként mentődik (globalStats.lessonTests,
// a statisztikával együtt szinkronizál); 90%-tól a lecke lezárt.
import { fmtDay, todayKey } from '../core/dates.js';
import { currentMode, state, unitOf } from '../core/state.js';
import { saveStats } from '../core/storage.js';
import { escHtml, shuffle } from '../core/util.js';
import { isStartedWord } from '../goal/jlpt.js';
import { getCurrentLessonProgress } from '../habit/goal.js';
import { wordLessons } from '../library/filters.js';
import { closeLibraryOverlays } from '../library/menus.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { showQuestion } from './engine.js';
import { grammarRowHtml } from '../features/grammar.js';

const PASS_PCT = 90;

// Kérdésfajták: a gyakorlómotor meglévő típusai, szavanként más iránnyal
const KINDS = {
  meaning: { type: 'classic',   direction: 'en-hu', label: 'jelentés' },
  reverse: { type: 'classic',   direction: 'hu-en', label: 'magyarból' },
  typed:   { type: 'hardcore',  direction: 'hu-en', label: 'gépelés' },
  listen:  { type: 'listening', direction: 'en-hu', label: 'hallás' }
};
const ROTATION = ['meaning', 'reverse', 'typed', 'listen'];

const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

// A toldalék (~さい) és a több alakú szó (なに/なん) gépelve és hallásból nem kérdezhető egyértelműen
const isAffix = w => /^[~〜]|[~〜]$/.test(w.en);
const hasVariants = w => /[/／]/.test(w.en);

function kindFor(word, wanted) {
  if (wanted === 'typed' && (isAffix(word) || hasVariants(word))) return 'reverse';
  if (wanted === 'listen' && (isAffix(word) || hasVariants(word))) return 'meaning';
  return wanted;
}

const hasLessonTest = () => currentMode === 'japanese';
const inLesson = lesson => w => wordLessons(w).includes(String(lesson));

// A lecke elkezdett szavai (a még nem tanultakat nem kérdezzük)
function lessonTestWords(lesson, words = state.words) {
  return words.filter(inLesson(lesson)).filter(isStartedWord);
}

function lessonTestResult(lesson) {
  return (state.globalStats.lessonTests || {})[String(lesson)] || null;
}

const isLessonClosed = lesson => (lessonTestResult(lesson)?.best || 0) >= PASS_PCT;

// A Kezdőlapon felajánlott lecke: az aktuális előtti (aminek már minden szava elkezdve), vagy ha az
// összes kész, az utolsó. Ha már le van zárva, nem jelenik meg (a Gyakorlás fülről bármikor újra).
function suggestedLessonTest() {
  if (!hasLessonTest()) return null;
  const p = getCurrentLessonProgress();
  if (!p) return null;
  let lesson = p.lesson;
  if (!p.complete) {
    const before = [...new Set(state.words.flatMap(w => wordLessons(w).map(Number)))]
      .filter(n => Number.isFinite(n) && n >= 1 && n < p.lesson);
    if (!before.length) return null;
    lesson = Math.max(...before);
  }
  if (isLessonClosed(lesson) || lessonTestWords(lesson).length === 0) return null;
  return lesson;
}

function resultLine(lesson, count) {
  const r = lessonTestResult(lesson);
  const unit = unitOf();
  if (!r) return `${count} ${unit} egyszer, vegyes kérdésekkel`;
  if (r.best >= PASS_PCT) return `Lezárva · legjobb ${r.best}% · utoljára ${fmtDay(r.date)}`;
  return `Legutóbb ${r.pct}%, ${fmtDay(r.date)} · ${PASS_PCT}% kell a záráshoz`;
}

function testRowHtml(lesson) {
  const n = lessonTestWords(lesson).length;
  if (n === 0) return '';
  return `
    <button class="lesson-hard-btn lesson-test-btn${isLessonClosed(lesson) ? ' is-closed' : ''}" onclick="startLessonTest(${Number(lesson)})">
      <span class="lesson-hard-main">${lesson}. lecke zárása</span>
      <span class="lesson-hard-sub">${escHtml(resultLine(lesson, n))}</span>
      ${CHEVRON}
    </button>`;
}

// Kezdőlap: a leckekártya alatt
function lessonTestHomeRowHtml() {
  const lesson = suggestedLessonTest();
  return lesson ? testRowHtml(lesson) : '';
}

// Gyakorlás fül: ha pontosan egy lecke van kiválasztva a szűrőben, a lecke nyelvtana és a zárása
function renderLessonTools() {
  const slot = document.getElementById('lesson-tools-slot');
  if (!slot) return;
  const f = state.filters || {};
  const lessons = Array.isArray(f.lesson) ? f.lesson : [];
  slot.innerHTML = hasLessonTest() && lessons.length === 1 ? (grammarRowHtml(lessons[0]) + testRowHtml(lessons[0])).trim() : '';
  slot.hidden = !slot.innerHTML;
}

function startLessonTest(lesson) {
  const words = shuffle(lessonTestWords(lesson));
  if (words.length === 0) { showToast('Ebben a leckében még nincs elkezdett szó.'); return; }
  const origin = document.body.dataset.screen === 'home' ? 'home' : 'dashboard';
  const offset = Math.floor(Math.random() * ROTATION.length);
  const mix = Object.fromEntries(words.map((w, i) => [w.id, kindFor(w, ROTATION[(offset + i) % ROTATION.length])]));
  closeLibraryOverlays();
  state.practice = {
    type: 'classic', lessonTest: Number(lesson), mix, origin,
    roundNumber: 1, roundWords: words.map(w => w.id), currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    currentSentenceObj: null, _combo: 0, flashcardHistory: []
  };
  showScreen('practice');
  showQuestion();
}

// A gyakorlómotor minden kérdés előtt hívja: a szóhoz sorsolt típus és irány
function applyLessonTestKind(p, word) {
  const kind = p && p.mix && KINDS[p.mix[word.id]];
  if (!kind) return;
  p.type = kind.type;
  p.direction = kind.direction;
}

const lessonTestBadge = p => (p.roundNumber === 1 ? `${p.lessonTest}. lecke zárása` : `${p.roundNumber}. kör · hibásak`);

// A kör vége képernyő: az első kör eredménye mentődik, a hibás szavak mellett a kérdésfajta
function finishLessonTestRound(p, pct) {
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const lesson = p.lessonTest;
  const first = p.roundNumber === 1;
  if (first && !p.resultSaved) {
    const all = state.globalStats.lessonTests || (state.globalStats.lessonTests = {});
    const prev = all[String(lesson)];
    all[String(lesson)] = { date: todayKey(), pct, total: p.roundWords.length, best: Math.max(pct, prev?.best || 0) };
    p.resultSaved = true;
    saveStats();
  }

  if (first) {
    setEl('re-title', pct >= PASS_PCT ? `${lesson}. lecke lezárva` : `${lesson}. lecke zárása`);
    setEl('re-subtitle', pct >= PASS_PCT
      ? (p.errorList.length ? 'A lecke szavai ülnek. A lenti néhányat még érdemes átvenni.' : 'A lecke minden szava ül.')
      : pct >= 70 ? `Majdnem kész, a záráshoz ${PASS_PCT}% kell. A lenti szavakat érdemes még átvenni.`
        : 'Ezt a leckét érdemes még gyakorolni, mielőtt továbblépsz.');
  } else {
    setEl('re-title', p.errorList.length ? `${p.roundNumber}. kör vége` : 'A hibásak is mennek');
  }
  setEl('err-title', first ? 'Még nem ül' : 'Következő körbe kerül');

  const list = document.getElementById('error-list-items');
  if (list) {
    list.innerHTML = p.errorList.map(id => {
      const w = state.words.find(x => x.id === id);
      const kind = KINDS[p.mix[id]];
      return w ? `<li class="re-err"><span class="re-err-word">${escHtml(w.en)}${kind ? `<span class="re-err-kind">${kind.label}</span>` : ''}</span><span class="re-err-meaning">${escHtml(w.hu)}</span></li>` : '';
    }).join('');
  }

  const actions = document.getElementById('re-actions');
  if (actions && p.errorList.length) {
    actions.innerHTML = `<button class="cta-learn cta-compact" id="re-next-btn" onclick="startNextRound()"><span class="cta-main" id="re-next-label">Hibásak még egyszer · ${p.errorList.length} ${unitOf()}</span></button>
      <button class="btn-quiet" onclick="finishSession()">Befejezés</button>`;
  }
}

export { KINDS as LESSON_TEST_KINDS, PASS_PCT, applyLessonTestKind, finishLessonTestRound, isLessonClosed, lessonTestBadge, lessonTestHomeRowHtml, lessonTestResult, lessonTestWords, renderLessonTools, startLessonTest, suggestedLessonTest };
