// LexiLearn – practice/flashcard.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { JAPANESE_SENTENCES, english_sentences2 } from '../core/data.js';
import { currentMode, state } from '../core/state.js';
import { logActivity } from '../habit/goal.js';
import { practiceDir, showQuestion, showRoundEnd } from './engine.js';
import { speakWord } from './tts.js';
import { attachSwipe, flyOut } from '../ui/swipe.js';

/* ══════════════════════════════════════════════════════
   V11: 3D FLASHCARD MÓD – FLIP, RATING, SWIPE
══════════════════════════════════════════════════════ */
let _flashcard3DFlipped = false;
let _flashcard3DRated   = false;

function flipFlashcard3D() {
  if (_flashcard3DRated) return;
  const card = document.getElementById('flashcard-3d');
  if (!card) return;
  _flashcard3DFlipped = !_flashcard3DFlipped;
  card.classList.toggle('flipped', _flashcard3DFlipped);

  if (_flashcard3DFlipped) {
    // Hátlap megjelenése után: hu-en irányban a forrás szót olvassuk fel
    const p = state.practice;
    const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
    if (word && practiceDir() === 'hu-en') {
      setTimeout(() => speakWord(word.en, false), 350);
    }
  }
}

// Külső hang gomb: kontextus-érzékeny. Előlapon: az aktuálisan látható szó.
// Hátlapon: a forrásnyelvű példamondat (japán/angol), fallback a forrás szó.
function speakFlashcard3D() {
  const p = state.practice;
  if (!p) return;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;
  const isEnHu = practiceDir() === 'en-hu';

  if (_flashcard3DFlipped) {
    let exampleText = '';
    if (currentMode === 'english' && typeof english_sentences2 !== 'undefined') {
      const found = english_sentences2.find(s => s.baseWord === word.en);
      if (found && found.fullSentenceHTML) {
        exampleText = found.fullSentenceHTML.replace(/<[^>]+>/g, '').trim();
      }
    } else if ((currentMode === 'japanese' || currentMode === 'kanji') && typeof JAPANESE_SENTENCES !== 'undefined') {
      const found = JAPANESE_SENTENCES.find(s => s.baseWord === word.en);
      if (found && found.fullSentenceHTML) {
        exampleText = found.fullSentenceHTML.replace(/<[^>]+>/g, '').trim();
      }
    }
    if (!exampleText && word.sentence) exampleText = String(word.sentence).replace(/<[^>]+>/g, '').trim();
    speakWord(exampleText || word.en, false);
  } else {
    if (isEnHu) speakWord(word.en, false);
    else        speakWord(word.hu, true);
  }
}

// immediate: elhúzásnál a kártya már kirepült, nincs szükség a színes felvillanás kivárására
function rateFlashcard3D(isCorrect, immediate = false) {
  if (_flashcard3DRated) return;
  _flashcard3DRated = true;

  const p = state.practice;
  const word = state.words.find(w => w.id === p.roundWords[p.currentIdx]);
  if (!word) return;

  // V11 izoláció: a flashcard mód NEM módosít sem per-szó, sem globális, sem
  // küldetés-statisztikát. A "Tudtam / Nem tudtam" csak vizuális feedback és lapozás.
  // Az aktuális értékelést a flashcardHistory-ba mentjük, hogy a Vissza gomb
  // tudja törölni ha a felhasználó visszaugrik.
  if (!p.flashcardHistory) p.flashcardHistory = [];
  p.flashcardHistory[p.currentIdx] = { wordId: word.id, isCorrect };
  if (isCorrect) p.roundCorrect++;
  else {
    p.roundWrong++;
    if (!p.errorList.includes(word.id)) p.errorList.push(word.id);
  }
  logActivity({ known: isCorrect }); // V13.2: csak a napi naplóba (a szó statisztikáját továbbra sem érinti)

  // Vizuális visszacsatolás: rövid színes felvillanás a kártyán
  const card = document.getElementById('flashcard-3d');
  if (card) card.classList.add(isCorrect ? 'fc-rated-correct' : 'fc-rated-wrong');

  setTimeout(() => {
    _flashcard3DFlipped = false;
    _flashcard3DRated   = false;
    p.currentIdx++;
    if (p.currentIdx >= p.roundWords.length) {
      // A körvégi összegzésből a "Nem tudtam" kártyák külön következő körben
      // újravehetők. A 3D mód ettől még nem módosít szó-szintű kvízstatisztikát.
      showRoundEnd();
    } else {
      showQuestion();
    }
  }, immediate ? 0 : 650);
}

function prevFlashcard3D() {
  const p = state.practice;
  if (!p || p.currentIdx === 0) return;
  const previousIdx = p.currentIdx - 1;
  const previous = p.flashcardHistory && p.flashcardHistory[previousIdx];
  // A visszalépett kártya előző értékelését a kör összesítéséből is kivesszük,
  // így az újraértékelés nem számít duplán.
  if (previous) {
    if (previous.isCorrect) p.roundCorrect = Math.max(0, p.roundCorrect - 1);
    else {
      p.roundWrong = Math.max(0, p.roundWrong - 1);
      p.errorList = p.errorList.filter(id => id !== previous.wordId);
    }
    p.flashcardHistory[previousIdx] = undefined;
  }
  p.currentIdx = previousIdx;
  _flashcard3DFlipped = false;
  _flashcard3DRated   = false;
  showQuestion();
}

// V13: az ujjat követő húzás (attachSwipe). Előlapról húzás: megfordítás (a kártya visszaugrik).
// Hátlapról húzás: értékelés és kirepülés (jobbra = tudtam, balra = nem tudtam).
function initFlashcard3DSwipe() {
  const card = document.getElementById('flashcard-3d');
  if (!card) return;
  attachSwipe(card, {
    onTap: flipFlashcard3D,
    onSwipe: dir => {
      if (!_flashcard3DFlipped) { flipFlashcard3D(); return false; }
      if (_flashcard3DRated) return false;
      flyOut(card, dir, () => rateFlashcard3D(dir === 'right', true));
      return true;
    }
  });
}

function resetFlashcardState() {
  _flashcard3DFlipped = false;
  _flashcard3DRated = false;
}

export { _flashcard3DFlipped, _flashcard3DRated, flipFlashcard3D, initFlashcard3DSwipe, prevFlashcard3D, rateFlashcard3D, resetFlashcardState, speakFlashcard3D };
