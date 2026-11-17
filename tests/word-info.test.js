// V13.33: szómagyarázat a teljes appal. A kártyák hátoldalán "i" gomb (zöld, ha van kézzel írt jegyzet),
// a tanuló kártyán a Figyelj sor, az alulról nyíló lap (szófaj, témakör, lecke, használat, kapcsolódó
// szavak, vissza), és hibás válasz után: mit választottál helyette (Összekeverted, ha párja), mire figyelj.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

it('i gomb, Figyelj sor, alulról nyíló lap és a hibás válasz utáni magyarázat', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;
  const byEn = en => ja.words.find(w => w.en === en);
  const hospital = byEn('びょういん');
  const salon = byEn('びよういん');

  // Tanuló kártya: zöld i a hátoldalon és a buktató egy sorban; jegyzet nélküli szónál semleges i, sor nincs
  const learn = word => {
    ja.practice = {
      type: 'learn', origin: 'home', queue: [word.id], batchIds: [word.id], learnedIds: [], againIds: [],
      roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
      roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0
    };
    api.showScreen('practice');
    api.showLearnCard();
  };
  learn(hospital);
  expect(doc.querySelector('#learn-card .learn-back > .info-btn.has-note')).not.toBeNull();
  expect(doc.querySelector('#learn-card .learn-front .info-btn')).toBeNull();
  expect(doc.querySelector('#learn-card .card-watch').textContent).toContain('びよういん = fodrászat');
  learn(byEn('ハンガリー'));
  expect(doc.querySelector('#learn-card .info-btn:not(.has-note)')).not.toBeNull();
  expect(doc.querySelector('#learn-card .card-watch')).toBeNull();

  // A lap: szófaj és témakör, szint és lecke, Használat, Figyelj, kapcsolódó szavak; lapozás és vissza
  learn(hospital);
  win.openWordInfo(hospital.id);
  const modal = doc.getElementById('word-info-modal');
  const body = doc.getElementById('word-info-body');
  expect(modal.classList.contains('open')).toBe(true);
  const chips = [...body.querySelectorAll('.wi-chip')].map(c => c.textContent);
  expect(chips).toEqual(['Témakör: helyek', 'N5 · Dekiru 4. lecke']);
  expect([...body.querySelectorAll('.wi-label')].map(l => l.textContent)).toEqual(['Használat', 'Figyelj', 'Kapcsolódó szavak', 'Példa']);
  const rel = [...body.querySelectorAll('.wi-rel-btn b')].map(b => b.textContent);
  expect(rel).toEqual(['いしゃ', 'びよういん']);
  // nyitott lap alatt a nyilak nem húzzák el a kártyát
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(ja.practice.queue).toEqual([hospital.id]);
  const relBtn = body.querySelectorAll('.wi-rel-btn')[1];
  expect(relBtn.getAttribute('onclick')).toBe(`openWordInfo(${JSON.stringify(salon.id)}, true)`);
  win.openWordInfo(salon.id, true); // (jsdom-ban az inline onclick nem látja a window-ra tett kezelőket)
  expect(doc.getElementById('word-info-word').textContent).toBe('びよういん');
  expect(body.querySelector('.wi-sec .wi-text').textContent).toContain('Fodrászat');
  expect(body.querySelector('.wi-back').getAttribute('onclick')).toBe('wordInfoBack()');
  win.wordInfoBack();
  expect(doc.getElementById('word-info-word').textContent).toBe('びょういん');
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(modal.classList.contains('open')).toBe(false);

  // Kézzel írt jegyzet nélküli szó: az automatikus adatok és egy csendes jelzés
  win.openWordInfo(byEn('ハンガリー').id);
  expect(body.querySelector('.wi-empty').textContent).toContain('még nincs használati leírás');
  win.closeWordInfo();

  // Igénél a szófaj a jegyzetből (igecsoport)
  win.openWordInfo(byEn('いる').id);
  expect(body.querySelector('.wi-chip').textContent).toBe('Ige · ru-ige (2. csoport)');
  win.closeWordInfo();

  // Gyakorlás, klasszikus: a párját választod → Összekeverted + Figyelj + tovább a laphoz
  const quiz = (type, word) => {
    ja.practice = {
      type, roundNumber: 1, roundWords: [word.id], currentIdx: 0, errorList: [], roundCorrect: 0, roundWrong: 0,
      sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), currentSentenceObj: null
    };
    api.showQuestion();
  };
  ja.direction = 'en-hu';
  quiz('classic', hospital);
  expect(doc.getElementById('miss-note').innerHTML).toBe('');
  api.checkAnswer(null, salon.hu, hospital.hu);
  let note = doc.getElementById('miss-note');
  expect([...note.querySelectorAll('.miss-label')].map(l => l.textContent)).toEqual(['Összekeverted', 'Figyelj']);
  expect(note.querySelector('.miss-line b').textContent).toBe('びよういん');
  expect(note.querySelector('.miss-more')).not.toBeNull();

  // Nem kapcsolódó szót választasz → Amit választottál; Nem tudom → csak Figyelj
  quiz('classic', hospital);
  api.checkAnswer(null, byEn('ねこ').hu, hospital.hu);
  expect(doc.querySelector('#miss-note .miss-label').textContent).toBe('Amit választottál');
  quiz('classic', hospital);
  api.checkAnswer(null, null, hospital.hu);
  expect([...doc.querySelectorAll('#miss-note .miss-label')].map(l => l.textContent)).toEqual(['Figyelj']);

  // Helyes válasznál nincs magyarázat
  quiz('classic', hospital);
  api.checkAnswer(null, hospital.hu, hospital.hu);
  expect(doc.getElementById('miss-note').innerHTML).toBe('');

  // Gépelős gyakorlás, hibás válasz → Figyelj
  quiz('hardcore', hospital);
  doc.getElementById('hardcore-input').value = 'fodrászat';
  api.checkHardcoreAnswer(hospital.id);
  expect(doc.querySelector('#miss-note .miss-label').textContent).toBe('Figyelj');

  // 3D kártya: i a hátoldalon
  quiz('flashcard3d', hospital);
  expect(doc.querySelector('#flashcard-3d .flashcard-3d-back > .info-btn.has-note')).not.toBeNull();
  expect(doc.querySelector('#flashcard-3d .flashcard-3d-front .info-btn')).toBeNull();

  // Ismétlés választós módban: a rossz választás alatt ugyanez, a Tovább gomb alatt
  ja.globalStats.reviewStyle = 'choice';
  ja.globalStats.reverseSeeded = { day: '2099-01-01', n: 99 };
  const more = byEn('もう');
  ja.practice = {
    type: 'review', origin: 'home', queue: [more.id], batchIds: [more.id], doneIds: [], againIds: [], loggedIds: [],
    counts: { 1: 0, 2: 0, 3: 0, 4: 0 }, roundNumber: 1, roundWords: [], currentIdx: 0, errorList: [], learnedNow: [],
    roundCorrect: 0, roundWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now(), sessionCorrect: 0, sessionWrong: 0, card: null
  };
  api.showReviewCard();
  expect(doc.querySelector('#review-card .learn-back > .info-btn.has-note')).not.toBeNull();
  const wrong = ja.practice.card.correct === 0 ? 1 : 0;
  api.pickReviewOption(wrong);
  const reviewNote = doc.getElementById('review-miss-note');
  expect([...reviewNote.querySelectorAll('.miss-label')].map(l => l.textContent)).toContain('Figyelj');
  expect(reviewNote.compareDocumentPosition(doc.querySelector('.review-miss')) & win.Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

  // Angol módban nincs szómagyarázat
  api.setMode('english');
  const en = win.appData.english.words[0];
  expect(api.infoButtonHtml(en)).toBe('');
  expect(api.missNoteHtml(en, null)).toBe('');
  api.setMode('japanese');
  // A hibás válasz utáni 500 ms-os időzítő (Tovább gomb) ne a lebontott környezetben fusson le
  await wait(600);
});
