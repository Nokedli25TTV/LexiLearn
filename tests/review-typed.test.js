// V13.31: gépelős, választós, vegyes és fordított ismétlés a teljes appal; a megtartási arány a válaszokból.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TODAY = '2026-09-29';
const FAR = '2099-01-01';

it('gépelés hibatűréssel, választás, vegyes, fordított kártya és megtartás', async () => {
  const { api, win } = await bootApp();
  for (let i = 0; i < 200 && !win.appData.japanese.words.length; i++) await wait(10);
  api.setMode('japanese');
  const doc = win.document;
  const ja = win.appData.japanese;
  ja.globalStats.reverseSeeded = { day: TODAY, n: 99 }; // eleinte fordított kártya nélkül
  const card = (s, due = TODAY) => ({ due, s, d: 5, last: '2026-09-01', reps: 4, lapses: 0 });
  const multi = ja.words.find(w => /,/.test(w.hu) && w.romaji && w.lesson);
  const plain = ja.words.find(w => w !== multi && !/[,;/(]/.test(w.hu) && w.romaji && w.lesson && w.hu.length > 4);
  const third = ja.words.find(w => w !== multi && w !== plain && w.romaji && w.lesson);
  const rev = ja.words.find(w => ![multi, plain, third].includes(w) && w.romaji && w.lesson && /^[぀-ゟ]+$/.test(w.en));
  ja.words.forEach(w => { if (w.stats.srs) w.stats.srs.due = FAR; });
  [multi, plain, third, rev].forEach(w => { w.stats.learnedAt = '2026-08-01'; });
  multi.stats.srs = card(40, '2026-09-28'); // rögzült (21+ napos köz), tegnap óta esedékes: ő jön előbb
  plain.stats.srs = card(3);         // friss
  third.stats.srs = card(3, FAR);
  rev.stats.srs = card(40, FAR);
  const controls = () => doc.getElementById('review-controls');
  const current = () => ja.practice.queue[0];

  // Alapból gépelés: van mező, a kártya a válasz előtt nem fordítható meg
  expect(api.getReviewStyle()).toBe('type');
  win.startReviewSession();
  expect(ja.practice.queue).toEqual([multi.id, plain.id]);
  const input = () => doc.getElementById('review-input');
  expect(input()).not.toBeNull();
  win.flipReviewCard();
  expect(doc.getElementById('review-card').classList.contains('flipped')).toBe(false);

  // Több jelentésből az egyik, ékezet és nagybetű nélkül, egy elírással: elfogadja
  const second = multi.hu.split(',')[1].replace(/\(.*?\)/g, '').trim();
  const typo = second.length > 6 ? second.slice(0, 2) + second[3] + second[2] + second.slice(4) : second;
  input().value = `  ${typo.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()} `;
  win.submitReviewAnswer();
  expect(controls().classList.contains('is-pass')).toBe(true);
  expect(doc.getElementById('review-card').classList.contains('flipped')).toBe(true);
  expect(doc.getElementById('review-verdict').textContent).toMatch(/Helyes|elfogadva/);
  expect([...controls().querySelectorAll('.review-rate .rate-label')].map(b => b.textContent)).toEqual(['Nehéz', 'Jó', 'Könnyű']);
  win.rateReview(3);
  await wait(300);
  expect(current()).toBe(plain.id);

  // Hibás válasz: Újra, a Jó nem nyomható; az "Elírás volt" után igen
  input().value = 'teljesen más szó';
  win.submitReviewAnswer();
  expect(controls().classList.contains('is-miss')).toBe(true);
  win.rateReview(3);
  await wait(300);
  expect(current()).toBe(plain.id); // nem történt semmi
  win.rateReview(1);                // Tovább: Újra, a sor végére
  await wait(300);
  expect(ja.practice.againIds).toEqual([plain.id]);
  expect(current()).toBe(plain.id); // csak ez maradt
  input().value = 'elütés';
  win.submitReviewAnswer();
  win.acceptReviewAnswer();
  expect(controls().classList.contains('is-pass')).toBe(true);
  expect(doc.getElementById('review-verdict').textContent).toBe('Elfogadva.');
  win.rateReview(3);
  await wait(300);
  expect(doc.querySelector('.learn-done-title').textContent).toContain('2 szó átismételve');

  // Megtartás: kártyánként az első mai válasz számít (a rögzült tudta, a friss elsőre nem)
  const day = ja.globalStats.daily[TODAY];
  expect([day.r, day.rp, day.rm, day.rmp]).toEqual([2, 1, 1, 1]);
  const m = api.computeRetention(api.buildDailyIndex());
  expect(m).toEqual({ total: 2, passed: 1, young: { n: 1, p: 0 }, mature: { n: 1, p: 1 } });
  api.showScreen('stats');
  const ret = doc.getElementById('retention').textContent;
  expect(ret).toContain('50%');
  expect(ret).toContain('100%');
  expect(ret).toContain('0%');

  // Választós: a rossz választás semleges, a helyes kiemelve; hibásnál csak a Tovább
  api.setReviewStyle('choice');
  third.stats.srs.due = TODAY;
  win.startReviewSession();
  const options = [...doc.querySelectorAll('.review-options .opt-btn')];
  expect(options).toHaveLength(4);
  expect(new Set(options.map(o => o.textContent)).size).toBe(4);
  const right = ja.practice.card.correct;
  expect(options[right].textContent).toBe(third.hu);
  win.pickReviewOption((right + 1) % 4);
  expect(options[(right + 1) % 4].classList.contains('is-picked')).toBe(true);
  expect(options[right].classList.contains('correct')).toBe(true);
  expect(controls().classList.contains('is-miss')).toBe(true);
  expect(controls().querySelector('.review-miss .btn-quiet')).toBeNull(); // választásnál nincs "Elírás volt"
  win.rateReview(1);
  await wait(300);
  win.pickReviewOption(ja.practice.card.correct);
  expect(controls().classList.contains('is-pass')).toBe(true);
  win.rateReview(4);
  await wait(300);
  expect(doc.querySelector('.learn-done-title')).not.toBeNull();

  // Vegyes: kártyánként a három fajta egyike
  api.setReviewStyle('mixed');
  third.stats.srs.due = TODAY;
  win.startReviewSession();
  expect(['type', 'choice', 'self']).toContain(ja.practice.card.style);
  api.showScreen('home');

  // Fordított kártya: csak stabil szóhoz (7+ napos köz), naponta legfeljebb 5
  api.setReviewStyle('type');
  ja.globalStats.reverseSeeded = undefined;
  const seeded = api.seedReverseCards(ja.words, ja.globalStats);
  expect(seeded).toBeGreaterThan(0);
  expect(seeded).toBeLessThanOrEqual(5);
  expect(rev.stats.srsRev).toMatchObject({ due: TODAY, reps: 0 });
  expect(plain.stats.srsRev).toBeUndefined(); // friss szó nem kap
  expect(api.seedReverseCards(ja.words, ja.globalStats)).toBe(0); // ma már nincs több alkalmas szó
  ja.words.forEach(w => { if (w.stats.srsRev && w !== rev) w.stats.srsRev.due = FAR; if (w.stats.srs) w.stats.srs.due = FAR; });
  win.startReviewSession();
  expect(ja.practice.queue).toEqual([`r:${rev.id}`]);
  const front = doc.querySelector('#review-card .learn-front').textContent;
  expect(front).toContain(rev.hu);
  expect(front).toContain('Magyar → japán');
  expect(doc.querySelector('#review-card .learn-front').textContent).not.toContain(rev.en); // a válasz nem látszik
  expect(doc.getElementById('kana-preview')).not.toBeNull();
  const forward = { ...rev.stats.srs };
  input().value = rev.romaji;
  win.submitReviewAnswer();
  expect(controls().classList.contains('is-pass')).toBe(true);
  win.rateReview(3);
  await wait(300);
  expect(rev.stats.srsRev.reps).toBe(1);
  expect(rev.stats.srsRev.s).toBeGreaterThan(0);
  expect(rev.stats.srsRev.due > TODAY).toBe(true);
  expect(rev.stats.srs).toEqual(forward); // az eredeti kártyához nem nyúl
  expect(api.dueForecast(ja.words).due).toBe(0);

  // Gépelős gyakorlás: ugyanaz a hibatűrés (ékezet nélkül, egy jelentés elég)
  ja.practice = {
    type: 'hardcore', direction: 'en-hu', roundNumber: 1, roundWords: [multi.id], currentIdx: 0, errorList: [],
    roundCorrect: 0, roundWrong: 0, sessionCorrect: 0, sessionWrong: 0, roundStartTime: Date.now(), sessionStartTime: Date.now()
  };
  api.showScreen('practice');
  api.showQuestion();
  const before = multi.stats.totalCorrect || 0;
  doc.getElementById('hardcore-input').value = multi.hu.split(',')[0].normalize('NFD').replace(/[̀-ͯ]/g, '');
  api.checkHardcoreAnswer(multi.id);
  expect(multi.stats.totalCorrect).toBe(before + 1);
});
