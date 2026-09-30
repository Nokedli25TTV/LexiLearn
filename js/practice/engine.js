// LexiLearn – practice/engine.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { JAPANESE_SENTENCES, english_sentences2 } from '../core/data.js';
import { todayKey } from '../core/dates.js';
import { currentMode, diffOrder, state } from '../core/state.js';
import { saveStats, saveWords } from '../core/storage.js';
import { escHtml, escRegex, shuffle } from '../core/util.js';
import { checkDailyReset, renderDailyQuests, updateQuestProgress } from '../features/quests.js';
import { getPracticeOptions } from '../library/dock.js';
import { closeLibraryOverlays } from '../library/menus.js';
import { initFlashcard3DSwipe, resetFlashcardState } from './flashcard.js';
import { _currentTTSAudio, setTtsOnEnd, speakWord } from './tts.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { practiceLapse } from '../srs/schedule.js';

/* ══════════════════════════════════════════════════════
   PRACTICE LOGIC (V6.7: SZEM IKON + MONDAT MOTOR)
══════════════════════════════════════════════════════ */
let eyeState = 0; 

function startPractice() {
  const selectedWords = state.words.filter(w => state.selectedIds.has(w.id));
  if (selectedWords.length === 0) return;
  
  // V13.1: a beállítások a Gyakorlás dokkból (state.practiceOptions) jönnek
  closeLibraryOverlays();
  const o = getPracticeOptions();
  const qCount = o.count === 'all' ? selectedWords.length : Math.min(Number(o.count) || 20, selectedWords.length);
  const order = o.order || 'random';
  const type = o.type || 'classic';
  
  let orderedWords = [...selectedWords];

  if (type === 'sentenceFill') {
    // BUG #1 JAVÍTVA: Angol mód most már támogatott – english_sentences2-t használja
    const sentenceDB = currentMode === 'english' ? english_sentences2 : JAPANESE_SENTENCES;

    orderedWords = orderedWords.filter(w =>
      sentenceDB && sentenceDB.some(s => s.baseWord === w.en)
    );

    if (orderedWords.length === 0) {
      showToast('A kiválasztott szavakhoz még nincs példamondat.');
      return;
    }
  }

  if (order === 'random') orderedWords = shuffle(orderedWords);
  else if (order === 'az') orderedWords.sort((a,b) => a.en.localeCompare(b.en));
  else if (order === 'za') orderedWords.sort((a,b) => b.en.localeCompare(a.en));
  else if (order === 'diff-asc') orderedWords.sort((a,b) => diffOrder(a.diff) - diffOrder(b.diff));
  else if (order === 'diff-desc') orderedWords.sort((a,b) => diffOrder(b.diff) - diffOrder(a.diff));

  state.practice = {
    roundNumber: 1, roundWords: orderedWords.slice(0, qCount).map(w => w.id),
    currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
    roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0,
    type: type, currentSentenceObj: null, _combo: 0,
    flashcardHistory: []  // V11: vissza gomb-hoz – csak flashcard3d módban használt
  };

  if (selectedWords.length > 0) {
    const freq = {}; selectedWords.flatMap(w => w.tags).forEach(t => freq[t] = (freq[t]||0)+1);
    if(Object.keys(freq).length > 0) state.globalStats.lastStudiedTopic = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
  }
  showScreen('practice'); showQuestion();
}

/* ══════════════════════════════════════════════════════
   V9: OKOS HAMIS VÁLASZ GENERÁTOR (Smart Distractors)
   Prioritás: 1) Azonos témakör (tags) → 2) Azonos nehézség → 3) Véletlen
══════════════════════════════════════════════════════ */
function getSmartDistractors(targetWord, count, isEnHu) {
  const allWords = state.words.filter(w => w.id !== targetWord.id);
  const distractors = [];
  const usedIds = new Set();

  // 1. Elsődleges szűrés: azonos témakör/tag egyezés
  if (targetWord.tags && targetWord.tags.length > 0) {
    const targetTagsLower = targetWord.tags.map(t => t.toLowerCase());
    const sameTagPool = shuffle(allWords.filter(w =>
      w.tags && w.tags.some(t => targetTagsLower.includes(t.toLowerCase()))
    ));
    for (const w of sameTagPool) {
      if (distractors.length >= count) break;
      if (!usedIds.has(w.id)) {
        distractors.push(isEnHu ? w.hu : w.en);
        usedIds.add(w.id);
      }
    }
  }

  // 2. Másodlagos szűrés: azonos nehézségi szint (fallback)
  if (distractors.length < count) {
    const sameDiffPool = shuffle(allWords.filter(w => w.diff === targetWord.diff && !usedIds.has(w.id)));
    for (const w of sameDiffPool) {
      if (distractors.length >= count) break;
      distractors.push(isEnHu ? w.hu : w.en);
      usedIds.add(w.id);
    }
  }

  // 3. Végső védelem: teljesen véletlenszerű szótár
  if (distractors.length < count) {
    const randomPool = shuffle(allWords.filter(w => !usedIds.has(w.id)));
    for (const w of randomPool) {
      if (distractors.length >= count) break;
      distractors.push(isEnHu ? w.hu : w.en);
      usedIds.add(w.id);
    }
  }

  return distractors.slice(0, count);
}

function showQuestion() {
  const p = state.practice;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;

  // V13: a gyors ismétlésnél a hibás szavak a sor végére kerülnek, így a haladást
  // a helyesen megválaszolt EGYEDI szavakhoz mérjük, nem a (növekvő) sor hosszához.
  if (p.type === 'quickQuiz') updatePracticeTop('Mai szavak', p.roundCorrect, p.uniqueCount, p.roundWrong);
  else updatePracticeTop(`${p.roundNumber}. kör`, p.currentIdx, p.roundWords.length, p.roundWrong);

  const isEnHu = practiceDir() === 'en-hu';
  const isJapanMode = currentMode !== 'english';
  eyeState = 0; 

  // V13.8: az irány felirata zászlóképek nélkül (azok külső szerverről jöttek, offline nem töltődtek be)
  const SOURCE_LABEL = { english: 'ANGOL', japanese: 'KANA', kanji: 'KANJI' }[currentMode] || 'ANGOL';
  const TARGET_LABEL = { english: 'ANGOL', japanese: 'JAPÁN', kanji: 'KANJI' }[currentMode] || 'ANGOL';
  let hintText = isEnHu ? `${SOURCE_LABEL} &rarr; MAGYAR` : `MAGYAR &rarr; ${TARGET_LABEL}`;

  const questionText = isEnHu ? word.en : word.hu;
  const correctText  = isEnHu ? word.hu : word.en;
  let contentHtml = '';

 if (p.type === 'sentenceFill') {
    hintText = `MONDAT-KIEGÉSZÍTŐ · ${isEnHu ? 'OLVASÁS' : 'ÍRÁS'}`;
    
    // 1. Dinamikusan kiválasztjuk, hogy angol vagy japán mondatokat használunk
    const sentencesDB = currentMode === 'english' ? english_sentences2 : JAPANESE_SENTENCES;
    
    // 2. Kikeressük az adott szóhoz tartozó mondatokat
    const matchingSentences = sentencesDB.filter(s => s.baseWord === word.en);
    
    // BIZTONSÁGI VONAL: Ha a szóhoz (még) nem generáltunk mondatot, 
    // átvált sima feleletválasztós módra, hogy ne fagyjon le az app!
    if (matchingSentences.length === 0) {
      console.warn("Nincs mondat ehhez a szóhoz: " + word.en);
      p.type = 'classic';
      // BUG #2 JAVÍTVA: return nélkül az sObj undefined lenne → crash
      showQuestion();
      return;
    }

    const sObj = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
    p.currentSentenceObj = sObj;

    const sentenceDisplay = sObj.sentenceWithBlank.replace('___BLANK___', `<span class="blank-space" id="blank-space">...</span>`);
    
    // V9: Okos hamis opciók – azonos témakör/nehézség alapján (!isEnHu: mondat kitöltésénél a forrás mezőt kell distraktornak)
    const fakeOptions = getSmartDistractors(word, 3, !isEnHu);
    const options = shuffle([isEnHu ? sObj.correctAnswer : word.hu, ...fakeOptions]);

    contentHtml = `
      <div class="q-word" style="font-size: 22px; margin-bottom:15px; line-height: 1.6;">${sentenceDisplay}</div>
      <div class="translation-container" style="margin-top: 15px; color: var(--text-2); font-size: 14px; display:flex; align-items:center; justify-content:center; gap: 8px;">
        
        <button class="eye-btn" onclick="toggleSentenceTranslation(this)" title="Magyar fordítás mutatása/elrejtése">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <span class="hidden-translation" style="display: none; font-style: italic;">
          ${escHtml(sObj.hungarian)}
        </span>
      </div>
      
      <div class="options-grid" style="margin-top: 25px;">
        ${options.map(opt => `<button class="opt-btn" onclick="checkSentenceAnswer(this, '${escHtml(opt)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" onclick="checkSentenceAnswer(null, null)">Nem tudom</button>
    `;
  }
  else if (p.type === 'classic' || p.type === 'quickQuiz') {
    if (p.type === 'quickQuiz') hintText = `GYORS ISMÉTLÉS · ${hintText}`;
    const options = shuffle([correctText, ...getSmartDistractors(word, 3, isEnHu)]);

    contentHtml = `
      <div class="q-word ${currentMode === 'kanji' && isEnHu ? 'kanji-display' : ''}">${escHtml(questionText)}</div>
      ${isJapanMode && isEnHu ? '<div id="reveal-text" class="reveal-text"></div>' : ''}
      <div class="q-tools">
        ${isJapanMode && isEnHu ? `
          <button class="eye-btn" onclick="toggleEye('${word.id}')" title="Olvasat felfedése" aria-label="Olvasat felfedése"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        ` : ''}
        <button class="speak-btn" id="speak-btn" onclick="speakQuestionWord()" aria-label="Kiejtés">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        </button>
      </div>
      <div class="options-grid">
        ${options.map(opt => `<button class="opt-btn" onclick="checkAnswer(this,'${escHtml(opt)}','${escHtml(correctText)}')">${escHtml(opt)}</button>`).join('')}
      </div>
      <button class="dont-know" onclick="checkAnswer(null,null,'${escHtml(correctText)}')">Nem tudom</button>
    `;
  }
  else if (p.type === 'flashcard3d') {
    /* ══ V11: 3D FLASHCARD MÓD ══════════════════════════ */
    hintText = `3D KÁRTYA`;
    resetFlashcardState();

    // Előlap (forrás)
    const frontMain = isEnHu ? word.en : word.hu;
    let frontReading = '';
    if (isEnHu && currentMode === 'kanji') frontReading = `On: ${word.onyomi || '–'} | Kun: ${word.kunyomi || '–'}`;
    else if (isEnHu && currentMode === 'japanese' && word.romaji) frontReading = word.romaji;

    // Hátlap (cél)
    const backMain = isEnHu ? word.hu : word.en;
    let backReading = '';
    if (!isEnHu && currentMode === 'kanji') backReading = `On: ${word.onyomi || '–'} | Kun: ${word.kunyomi || '–'}`;
    else if (!isEnHu && currentMode === 'japanese' && word.romaji) backReading = word.romaji;

    // Példamondat (highlight + magyar)
    const { html: exampleSentenceHTML, hu: exampleHU } = getExampleSentence(word);

    const isKanjiFront = currentMode === 'kanji' && isEnHu;
    const isKanjiBack  = currentMode === 'kanji' && !isEnHu;

    contentHtml = `
      <div class="flashcard-3d" id="flashcard-3d">
        <div class="flashcard-3d-inner">
          <div class="flashcard-3d-front">
            <div class="fc-corner-hint">${isEnHu ? 'Forrás' : 'Magyar'}</div>
            <div class="fc-main ${isKanjiFront ? 'kanji-display' : ''}">${escHtml(frontMain)}</div>
            ${frontReading ? `<div class="fc-reading">${escHtml(frontReading)}</div>` : ''}
            <div class="fc-bottom-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 8"/><polyline points="21 3 21 8 16 8"/><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 16"/><polyline points="8 16 3 16 3 21"/></svg>
              Koppints vagy húzd el
            </div>
          </div>
          <div class="flashcard-3d-back">
            <div class="fc-corner-hint">${isEnHu ? 'Magyar' : 'Forrás'}</div>
            <div class="fc-main fc-main-back ${isKanjiBack ? 'kanji-display' : ''}">${escHtml(backMain)}</div>
            ${backReading ? `<div class="fc-reading">${escHtml(backReading)}</div>` : ''}
            ${exampleSentenceHTML ? `
              <div class="fc-example">
                <div class="fc-example-sentence">${exampleSentenceHTML}</div>
                ${exampleHU && exampleHU !== backMain && exampleHU !== frontMain ? `<div class="fc-example-hu">${escHtml(exampleHU)}</div>` : ''}
              </div>
            ` : '<div class="fc-no-example">— Nincs példamondat ehhez a szóhoz —</div>'}
          </div>
        </div>
      </div>

      <div class="flashcard-3d-nav">
        <button class="flashcard-back-btn" onclick="prevFlashcard3D()" ${p.currentIdx === 0 ? 'disabled' : ''} title="${p.currentIdx === 0 ? 'Ez az első kártya' : 'Előző kártya'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Előző
        </button>
        <button class="flashcard-speak-btn" onclick="speakFlashcard3D()" title="Kiejtés (előlap: szó, hátlap: példamondat forrásnyelven)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        </button>
        <div class="flashcard-3d-actions" id="flashcard-3d-actions">
          <button class="btn flashcard-rating flashcard-wrong" onclick="rateFlashcard3D(false)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Nem tudtam
          </button>
          <button class="btn flashcard-rating flashcard-correct" onclick="rateFlashcard3D(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Tudtam
          </button>
        </div>
      </div>
    `;
  }
  else {
    const placeholderText = isEnHu ? "Gépeld be magyarul..." : "Gépeld be japánul vagy romajival...";
    contentHtml = `
      <div class="q-word" style="margin-bottom:26px;">${escHtml(questionText)}</div>
      <div style="margin-bottom: 20px;"><input type="text" id="hardcore-input" class="search-input" placeholder="${placeholderText}" autocomplete="off" style="text-align:center; font-size:18px; padding: 14px; border-width: 3px;"></div>
      <button class="btn btn-primary btn-lg" style="width:100%; justify-content:center; margin-bottom: 10px;" onclick="checkHardcoreAnswer('${word.id}')">Ellenőrzés</button>
      <button class="dont-know" onclick="revealHardcoreAnswer('${word.id}')">Nem tudom</button>
      <div id="hardcore-feedback" style="margin-top: 16px; font-weight: 800; font-size: 16px; display:none;"></div>
    `;
  }

  const qArea = document.getElementById('question-area');
  if (qArea) {
    const bookmarkBtnHtml = `
      <button class="bookmark-btn ${word.bookmarked ? 'bookmarked' : ''}" id="bookmark-btn-${word.id}"
              onclick="event.stopPropagation(); toggleBookmark('${word.id}')"
              title="${word.bookmarked ? 'Eltávolítás a Fókusz Listából' : 'Hozzáadás a Fókusz Listához'}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    `;

    qArea.innerHTML = `
      <div class="q-card" id="q-card">
        ${bookmarkBtnHtml}
        <div class="q-hint" style="display:flex; justify-content:center; align-items:center; margin-bottom:14px;">
          <span style="letter-spacing:0.1em; color:var(--text-3); font-weight:800; font-size:11px; text-transform:uppercase;">${hintText}</span>
          <span style="margin: 0 8px; color: var(--border);">|</span>
          <span class="diff-pill d${word.diff}" style="font-size:11px; padding:2px 8px;">${word.diff}</span>
        </div>
        ${contentHtml}
      </div>
      <!-- V13.2: hibás válasz után a Tovább a képernyő aljára rögzül, hüvelykujjal elérhető -->
      <div id="next-btn-container" class="next-bar" style="display: none;">
        <button class="next-btn" onclick="manualNextQuestion()">
          Tovább
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    `;
  }

  if (p.type === 'hardcore') {
    setTimeout(() => {
      const input = document.getElementById('hardcore-input');
      if(input) {
        input.focus();
        input.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') checkHardcoreAnswer(word.id);
        });
      }
    }, 100);
  }

  if ((p.type === 'classic' || p.type === 'quickQuiz') && isEnHu) {
    setTimeout(() => { speakWord(questionText, false); }, 300);
  }

  if (p.type === 'flashcard3d') {
    initFlashcard3DSwipe();
    if (isEnHu) setTimeout(() => { speakWord(questionText, false); }, 300);
  }
}
// A kérdés szavának felolvasása (állapotból, így az aposztrófos szavak sem törik el az onclick-et)
function speakQuestionWord() {
  const p = state.practice;
  const word = p && p.roundWords ? state.words.find(w => w.id === p.roundWords[p.currentIdx]) : null;
  if (!word) return;
  const isEnHu = practiceDir() === 'en-hu';
  speakWord(isEnHu ? word.en : word.hu, !isEnHu);
}

// Kézi továbbléptetés rontás után
function manualNextQuestion() {
  const p = state.practice;
  p.currentIdx++;
  if (p.currentIdx >= p.roundWords.length) showRoundEnd(); 
  else showQuestion();
}
// A 👁️ IKON LOGIKÁJA
function toggleSentenceTranslation(btnElement) {
  const translationSpan = btnElement.nextElementSibling;
  if (translationSpan.style.display === "none") {
    translationSpan.style.display = "inline";
    btnElement.style.opacity = "0.5";
  } else {
    translationSpan.style.display = "none";
    btnElement.style.opacity = "1";
  }
}

function checkSentenceAnswer(btn, chosen) {
  const p = state.practice; 
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  const sObj = p.currentSentenceObj;
  
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);

  checkDailyReset();

  const isEnHu = practiceDir() === 'en-hu';
  const correctOptionText = isEnHu ? sObj.correctAnswer : word.hu;
  const isCorrect = (chosen === correctOptionText);
  const qCard = document.getElementById('q-card');
  const blankSpace = document.getElementById('blank-space');

  if (isCorrect && btn) { 
    btn.classList.add('correct'); 
    if(qCard) qCard.classList.add('bounce'); 
    if(blankSpace) {
      blankSpace.classList.add('filled');
      blankSpace.innerHTML = isEnHu ? sObj.correctAnswer : word.hu;
    }
  } else {
    if (btn) btn.classList.add('wrong');
    document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correctOptionText) b.classList.add('correct'); });
    if(qCard) qCard.classList.add('shake');
    if(blankSpace) {
      blankSpace.style.borderBottomColor = 'var(--error)';
      blankSpace.style.color = 'var(--error)';
      blankSpace.innerHTML = isEnHu ? sObj.correctAnswer : word.hu;
    }
  }

  if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
  else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
  word.stats.lastAttempt = Date.now();
  if (!isCorrect) practiceLapse(word); // V13.5: a hibás szó holnap visszajön ismétlésre
  updateQuestProgress('wordAnswered', { word, isCorrect });

  setTimeout(() => {
    if (isEnHu && sObj.fullSentenceHTML) {
      const sentenceContainer = document.querySelector('.q-word');
      if(sentenceContainer) {
        sentenceContainer.innerHTML = sObj.fullSentenceHTML;
        sentenceContainer.style.animation = 'popIn 0.3s';
      }
    }
    speakWord(sObj.ttsSentence, false);
  }, 100);

  if (isCorrect) {
    // V9: A mondat felolvasása fusson végig, utána lépünk tovább
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      setTtsOnEnd(null);
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    // A speakWord 100ms múlva indul → _ttsOnEnd-et ráhagyjuk, hogy az onend-et elkapja
    setTtsOnEnd(() => setTimeout(doAdvance, 400));
    setTimeout(doAdvance, 6000); // Biztonsági timeout (hosszú mondatoknál is elég)
  } else {
    // Hibásnál megáll és felugrik a Tovább gomb
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}

function normalizeRomaji(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  s = s.replace(/[\s\-]/g, '');
  s = s.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/ō/g, 'o').replace(/uu/g, 'u').replace(/ū/g, 'u').replace(/aa/g, 'a').replace(/ā/g, 'a').replace(/ii/g, 'i').replace(/ī/g, 'i').replace(/ee/g, 'e').replace(/ē/g, 'e');
  s = s.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, '$1');
  return s;
}

function checkHardcoreAnswer(wordId) {
  const p = state.practice;
  const word = state.words.find(w => w.id === wordId);
  const inputEl = document.getElementById('hardcore-input');
  const feedbackEl = document.getElementById('hardcore-feedback');
  if (!word || !inputEl) return;

  const userAnswer = inputEl.value.trim();
  if (userAnswer === '') return;
  inputEl.disabled = true;

  checkDailyReset();
  const isEnHu = practiceDir() === 'en-hu';
  const correctText = isEnHu ? word.hu : word.en;
  
  let isCorrect = (userAnswer.toLowerCase() === correctText.toLowerCase());
  
  if (!isEnHu && !isCorrect && word.romaji) {
    const normUser = normalizeRomaji(userAnswer);
    const normCorrect = normalizeRomaji(word.romaji);
    if (normUser === normCorrect) isCorrect = true;
  }

  if (feedbackEl) feedbackEl.style.display = 'block';
  const romajiAdd = (!isEnHu && word.romaji) ? `(${word.romaji})` : '';

  const qCard = document.getElementById('q-card');
  if (isCorrect) {
    if (qCard) qCard.classList.add('bounce');
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--success)';
      feedbackEl.innerHTML = `Helyes <span style="font-weight:400; font-size:14px; display:block; color:var(--text-2); margin-top:4px;">${escHtml(correctText)} ${escHtml(romajiAdd)}</span>`;
    }
    inputEl.style.borderColor = 'var(--success)';
    inputEl.style.backgroundColor = 'var(--success-bg)';
    
    word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++;
  } else {
    if (qCard) qCard.classList.add('shake');
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--error)';
      feedbackEl.innerHTML = `A helyes válasz:<br><span style="font-size:22px; margin-top:6px; display:block;">${escHtml(correctText)}</span><span style="font-weight:400; font-size:14px; color:var(--text-2);">${escHtml(romajiAdd)}</span>`;
    }
    inputEl.style.borderColor = 'var(--error)';
    inputEl.style.backgroundColor = 'var(--error-bg)';

    word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; 
    if(!p.errorList.includes(word.id)) p.errorList.push(word.id);
  }
  
  speakWord(word.en, false);
  word.stats.lastAttempt = Date.now();
  if (!isCorrect) practiceLapse(word); // V13.5: a hibás szó holnap visszajön ismétlésre
  updateQuestProgress('wordAnswered', { word, isCorrect });

  if (isCorrect) {
    // V9: Bevárjuk a hang végét
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      setTtsOnEnd(null);
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    setTtsOnEnd(() => setTimeout(doAdvance, 400));
    setTimeout(doAdvance, 5000); // Biztonsági timeout
  } else {
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}

function revealHardcoreAnswer(wordId) {
  const inputEl = document.getElementById('hardcore-input');
  if(inputEl) inputEl.value = "???";
  checkHardcoreAnswer(wordId);
}

function toggleEye(wordId) {
  const word = state.words.find(w => w.id === wordId);
  if(!word) return;
  
  const rt = document.getElementById('reveal-text');
  if (!rt) return;

  eyeState++;
  
  if (currentMode === 'japanese') {
    if (eyeState > 1) eyeState = 0;
    rt.innerHTML = eyeState === 1 ? `<span style="color:var(--primary)">${word.romaji}</span>` : '';
  } else if (currentMode === 'kanji') {
    if (eyeState > 2) eyeState = 0;
    if (eyeState === 0) rt.innerHTML = '';
    if (eyeState === 1) rt.innerHTML = `<span style="color:var(--primary)">On: ${word.onyomi} | Kun: ${word.kunyomi}</span>`;
    if (eyeState === 2) rt.innerHTML = `<span style="color:var(--primary)">On: ${word.onyomi} | Kun: ${word.kunyomi}</span><br><span style="font-size:13px;color:var(--text-3)">${word.romaji}</span>`;
  }
}

function checkAnswer(btn, chosen, correct) {
  const p = state.practice; const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
  checkDailyReset();
  const isCorrect = chosen === correct;
  const qCard = document.getElementById('q-card');

  if (isCorrect && btn) { 
    btn.classList.add('correct'); 
    if(qCard) qCard.classList.add('bounce'); 
  }
  else {
    if (btn) btn.classList.add('wrong');
    document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    if(qCard) qCard.classList.add('shake');
    if(currentMode !== 'english' && practiceDir() === 'en-hu') {
      eyeState = currentMode === 'kanji' ? 1 : 0; 
      toggleEye(word.id);
    }
  }

  if (word) {
    if (isCorrect) { word.stats.streak++; word.stats.totalCorrect++; p.roundCorrect++; p.sessionCorrect++; }
    else { word.stats.streak=0; word.stats.totalWrong++; p.roundWrong++; p.sessionWrong++; if(!p.errorList.includes(word.id)) p.errorList.push(word.id); }
    word.stats.lastAttempt = Date.now();
    if (!isCorrect) practiceLapse(word); // V13.5: a hibás szó holnap visszajön ismétlésre
    updateQuestProgress('wordAnswered', { word, isCorrect });
    // V13: gyors ismétlésnél a hibás szó a sor végére kerül, amíg egyszer el nem találod
    if (!isCorrect && p.type === 'quickQuiz') p.roundWords.push(word.id);
  }

  if (!isCorrect && practiceDir() === 'hu-en') {
      speakWord(word.en, false);
  }

  if (isCorrect) {
    // V9: Bevárjuk a szó hangjának végét, mielőtt továbblépünk
    let hasAdvanced = false;
    const doAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      setTtsOnEnd(null);
      p.currentIdx++;
      if (p.currentIdx >= p.roundWords.length) showRoundEnd(); else showQuestion();
    };
    // Ellenőrizzük, hogy fut-e még hang (az auto-speak-ből showQuestion-ban)
    const isAudioPlaying = (_currentTTSAudio && !_currentTTSAudio.ended && !_currentTTSAudio.paused)
                        || (window.speechSynthesis && window.speechSynthesis.speaking);
    if (isAudioPlaying) {
      setTtsOnEnd(() => setTimeout(doAdvance, 350)); // Hang végén + kis szünet
      setTimeout(doAdvance, 5000);                  // Biztonsági max. várakozás
    } else {
      setTimeout(doAdvance, 800);
    }
  } else {
    setTimeout(() => {
      const nextBtn = document.getElementById('next-btn-container');
      if (nextBtn) nextBtn.style.display = 'block';
    }, 500);
  }
}

function showRoundEnd() {
  const p = state.practice;
  const total = p.roundWords.length;
  const pct = total > 0 ? Math.round(p.roundCorrect / total * 100) : 0;
  const elapsed = Math.round((Date.now() - p.roundStartTime) / 1000);
  
  checkDailyReset();
  updateQuestProgress('roundEnd', {
    roundCorrect: p.roundCorrect,
    roundWrong: p.roundWrong,
    roundLength: total,
    elapsed: elapsed
  });
  saveStats(); // Csak a statisztikát kell menteni kör végén
  renderDailyQuests();

  const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

  const isQuickQuiz = p.type === 'quickQuiz';
  if (isQuickQuiz) setEl('re-title', p.roundWrong === 0 ? 'Hibátlan ismétlés' : 'Mai szavak átismételve');
  else setEl('re-title', p.roundNumber === 1 && p.errorList.length === 0 ? 'Hibátlan kör' : `${p.roundNumber}. kör vége`);
  setEl('err-title', isQuickQuiz ? 'Elsőre nem ment' : 'Következő körbe kerül');
  setEl('re-subtitle', pct >= 80 ? 'Stabil tudás.' : pct >= 50 ? 'Fejlődik. A hibásakat érdemes még egyszer átvenni.' : 'Ezt a kört érdemes megismételni.');
  setEl('re-correct', p.roundCorrect);
  setEl('re-wrong', p.roundWrong);
  setEl('re-pct', pct + '%');
  const timeEl = document.getElementById('re-time');
  if (timeEl) timeEl.innerHTML = fmtRoundTime(elapsed);

  // V13.8: egyszínű meter-sáv (a tanulás vége képernyővel azonos), piros szakasz nélkül
  const bar = document.getElementById('re-bar');
  if (bar) {
    bar.style.setProperty('--p', pct / 100);
    bar.setAttribute('aria-label', `Pontosság: ${pct}%, ${p.roundCorrect} helyes, ${p.roundWrong} hibás`);
  }

  const errSec = document.getElementById('error-list-section');
  const errList = document.getElementById('error-list-items');
  if (errList) {
    errList.innerHTML = p.errorList.map(id => {
      const w = state.words.find(x => x.id === id);
      return w ? `<li class="re-err"><span class="re-err-word">${escHtml(w.en)}</span><span class="re-err-meaning">${escHtml(w.hu)}</span></li>` : '';
    }).join('');
  }
  if (errSec) errSec.hidden = p.errorList.length === 0;

  // Gyors ismétlésnél nincs következő kör: a hibás szavak már a soron belül ismétlődtek.
  // Ha van következő kör, az a korall fő lépés; különben a befejezés.
  const hasNextRound = p.errorList.length > 0 && !isQuickQuiz;
  const unit = currentMode === 'kanji' ? 'kanji' : 'szó';
  const actions = document.getElementById('re-actions');
  if (actions) {
    actions.innerHTML = hasNextRound
      ? `<button class="cta-learn cta-compact" id="re-next-btn" onclick="startNextRound()"><span class="cta-main" id="re-next-label">Következő kör · ${p.errorList.length} ${unit}</span></button>
         <button class="btn-quiet" onclick="finishSession()">Befejezés</button>`
      : `<button class="cta-learn cta-compact" onclick="finishSession()"><span class="cta-main">Befejezés</span></button>`;
  }

  showScreen('roundend');
}

// "38 mp", "2:05 p" (a mértékegység kisebb, mint a Statisztika KPI sávjában)
function fmtRoundTime(sec) {
  return sec < 60
    ? `${sec}<span class="kpi-unit">mp</span>`
    : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}<span class="kpi-unit">p</span>`;
}

function startNextRound() {
  const p = state.practice;
  state.practice = { ...p, roundNumber: p.roundNumber + 1, roundWords: shuffle([...p.errorList]), currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now() };
  showScreen('practice'); showQuestion();
}

function finishSession() {
  const p = state.practice;
  const duration = Math.round((Date.now() - p.sessionStartTime) / 1000);

  state.globalStats.studyDays[todayKey()] = true;
  state.globalStats.totalSessions++; 
  state.globalStats.totalCorrect += p.sessionCorrect; 
  state.globalStats.totalWrong += p.sessionWrong;
  
  if (!state.globalStats.sessionHistory) state.globalStats.sessionHistory = [];
  
  state.globalStats.sessionHistory.push({
    date: new Date().toLocaleString('hu-HU'),
    correct: p.sessionCorrect,
    wrong: p.sessionWrong,
    rounds: p.roundNumber,
    duration: duration
  });

  saveStats(); saveWords(); showScreen(p.origin || 'dashboard'); showToast('Gyakorlás mentve'); // Statisztika + szó streak mentése
}

// V13: oda térünk vissza, ahonnan a gyakorlás indult (Kezdőlap vagy Gyakorlás fül)
function confirmQuit() {
  const p = state.practice;
  // Tanulás közben minden "Tudom" azonnal mentődik, így kilépéskor nincs mit elveszíteni
  if (p.type === 'learn' || p.type === 'review' || confirm('Biztosan ki szeretnél lépni?')) showScreen(p.origin || 'dashboard');
}

// Irány a gyakorláshoz: a gyors ismétlés mindig forrás → magyar, egyébként a felhasználó beállítása
function practiceDir() {
  return (state.practice && state.practice.direction) || state.direction;
}

// A gyakorló képernyő felső sávja (badge, haladás, hibaszámláló)
function updatePracticeTop(label, done, total, errors = 0) {
  const progBar = document.getElementById('prog-bar');
  const progLabel = document.getElementById('prog-label');
  const roundBadge = document.getElementById('round-badge');
  const errBadge = document.getElementById('error-badge');
  const errCount = document.getElementById('error-count-badge');
  if (progBar) progBar.style.width = (total > 0 ? Math.round(done / total * 100) : 0) + '%';
  if (progLabel) progLabel.textContent = done + ' / ' + total;
  if (roundBadge) roundBadge.textContent = label;
  if (errBadge) errBadge.style.display = errors > 0 ? '' : 'none';
  if (errCount) errCount.textContent = errors;
}

// Példamondat egy szóhoz (kiemelt HTML + magyar fordítás) – a 3D kártya és a tanuló kártya közös forrása
function getExampleSentence(word) {
  let html = '', hu = '';
  if (currentMode === 'english' && typeof english_sentences2 !== 'undefined') {
    const found = english_sentences2.find(s => s.baseWord === word.en);
    if (found) {
      html = (found.fullSentenceHTML || '').replace(/<strong>(.*?)<\/strong>/g, '<span class="fc-highlight">$1</span>');
      hu = found.hungarian || '';
    }
  } else if ((currentMode === 'japanese' || currentMode === 'kanji') && typeof JAPANESE_SENTENCES !== 'undefined') {
    const found = JAPANESE_SENTENCES.find(s => s.baseWord === word.en);
    if (found) {
      html = found.fullSentenceHTML || '';
      if (found.correctAnswer) {
        const baseWordRegex = new RegExp(`(${escRegex(found.correctAnswer)})`, 'g');
        html = html.replace(baseWordRegex, '<span class="fc-highlight">$1</span>');
      }
      hu = found.hungarian || '';
    }
  }
  if (!html && word.sentence) html = escHtml(word.sentence);
  return { html, hu };
}

export { checkAnswer, checkHardcoreAnswer, checkSentenceAnswer, confirmQuit, eyeState, finishSession, getExampleSentence, getSmartDistractors, manualNextQuestion, normalizeRomaji, practiceDir, revealHardcoreAnswer, showQuestion, showRoundEnd, speakQuestionWord, startNextRound, startPractice, toggleEye, toggleSentenceTranslation, updatePracticeTop };
