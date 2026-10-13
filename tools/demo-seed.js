// LexiLearn demó: kb. 110 napnyi generált tanulási előzmény, csak a memóriában (lásd tools/demo.html).
// Determinisztikus (rögzített véletlenszám-mag), így a README képernyőképei újra előállíthatók.
// A napi sorrendet, a "megtanult" szabályt és az ismétlési közöket az app valódi logikája szerint tölti.
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 400; i++) {
  const A = window.appData;
  if (A && A.japanese.words.length && A.kanji.words.length && A.english.words.length && window.showScreen) break;
  await wait(25);
}
await wait(200); // a betöltés utáni első kirajzolás és mentés lefut

let seed = 20261013;
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + rnd() * (b - a);
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pad = n => String(n).padStart(2, '0');

const T = 112; // a mai nap sorszáma (0 = az első nap)
const base = new Date(); base.setHours(12, 0, 0, 0);
const dateAt = t => { const x = new Date(base); x.setDate(x.getDate() - (T - t)); return x; };
const keyAt = t => { const d = dateAt(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const stampAt = t => { const d = dateAt(t); d.setHours(ri(7, 21), ri(0, 59), ri(0, 59)); return d.getTime(); };
const huStamp = t => { const d = new Date(stampAt(t)); return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

const diffOrd = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5, B1: 1, B2: 2, C1: 3, C2: 4 };
const lessonNum = w => {
  const nums = (Array.isArray(w.lesson) ? w.lesson : [w.lesson]).map(Number).filter(n => Number.isFinite(n) && n >= 1);
  return nums.length ? Math.min(...nums) : Infinity;
};
const sortNum = (a, b) => (a === b ? 0 : a - b); // Infinity - Infinity = NaN helyett 0

// Aktív napok: az utolsó 23 nap mind (konzisztencia), előtte egy kihagyott nap, azelőtt kb. 80%
function activeDays(rate, streak) {
  return Array.from({ length: T + 1 }, (_, t) => (t >= T - streak + 1 ? true : t === T - streak ? false : rnd() < rate));
}

function seedMode(mode, { active, perDay, todayCount, lessonsOnly, pendingBias, quizMax }) {
  const st = window.appData[mode];
  const index = new Map(st.words.map((w, i) => [w.id, i]));
  const pool = st.words.filter(w => !lessonsOnly || Number.isFinite(lessonNum(w)))
    .sort((a, b) => sortNum(lessonNum(a), lessonNum(b)) || (lessonsOnly ? 0 : (diffOrd[a.diff] || 0) - (diffOrd[b.diff] || 0)) || (index.get(a.id) - index.get(b.id)));
  const nextActive = t => { while (t <= T && !active[t]) t++; return t; };
  const logs = {};
  const log = t => (logs[t] || (logs[t] = { a: 0, c: 0, k: 0, g: 0, s: 0 }));
  const learned = [];
  let idx = 0;

  for (let t = 0; t <= T; t++) {
    if (!active[t]) continue;
    const count = t === T ? todayCount : ri(perDay[0], perDay[1]);
    const L = log(t); L.k += count; L.g += ri(0, 2);
    for (let n = 0; n < count && idx < pool.length; n++, idx++) {
      const w = pool[idx];
      // A tanuló kártya "Tudom" húzása Jó értékelés; utána az ismétlések a saját közük szerint jönnek
      let s = 3.17 * rr(0.92, 1.08), d = rr(3.5, 6.5), reps = 1, lapses = 0, last = t;
      let dueT = t + Math.max(1, Math.round(s));
      while (dueT <= T) {
        const tr = nextActive(dueT);
        if (tr > T || (tr >= T - 1 && rnd() < pendingBias)) break; // esedékes, még nem ismételte
        const R = log(tr);
        if (rnd() < 0.09) { R.g++; lapses++; s = Math.max(0.8, s * rr(0.25, 0.45)); d = Math.min(10, d + 0.8); }
        else { R.k++; s *= rr(1.9, 2.7); d = Math.max(1, d - 0.15); }
        reps++; last = tr; dueT = tr + Math.max(1, Math.round(s));
      }
      // Egy részük szabad gyakorlásban is előkerült
      const quizzed = rnd() < 0.45;
      const tc = quizzed ? ri(1, 6) : 0, tw = quizzed && rnd() < 0.3 ? ri(1, 2) : 0;
      w.stats = {
        ...w.stats, learnedAt: keyAt(t), streak: quizzed ? Math.max(1, tc - tw) : 0, totalCorrect: tc, totalWrong: tw,
        lastAttempt: quizzed ? stampAt(Math.min(T, last + ri(0, 2))) : null,
        srs: { due: keyAt(dueT), s: +s.toFixed(2), d: +d.toFixed(2), last: keyAt(last), reps, lapses }
      };
      learned.push(w);
    }
  }

  // Szabad gyakorlás: napi néhány kvízválasz, és pár szó, ami csak gyakorlásból lett megtanult
  for (let t = 0; t <= T; t++) {
    if (!active[t]) continue;
    const L = log(t);
    const answers = ri(0, quizMax);
    L.a += answers; L.c += Math.round(answers * rr(0.76, 0.94));
  }
  const untouched = st.words.filter(w => !w.stats.learnedAt);
  for (let i = 0; i < Math.min(14, untouched.length); i++) {
    const w = untouched[Math.floor(rnd() * untouched.length)];
    if (w.stats.practiceLearnedAt) continue;
    const t = T - ri(1, 30);
    Object.assign(w.stats, { totalCorrect: ri(5, 8), totalWrong: ri(0, 2), streak: ri(2, 5), lastAttempt: stampAt(t), practiceLearnedAt: keyAt(t) });
  }

  // A héten és a múlt héten elrontott, azóta nem javított szavak (a heti összefoglalóhoz)
  const recent = learned.slice(-220);
  const miss = (t, n) => { for (let i = 0; i < n && recent.length; i++) {
    const w = recent[Math.floor(rnd() * recent.length)];
    Object.assign(w.stats, { streak: 0, totalWrong: (w.stats.totalWrong || 0) + ri(1, 3), totalCorrect: Math.max(w.stats.totalCorrect || 0, 1), lastAttempt: stampAt(t) });
  } };
  miss(T - 1, 3); miss(T, 2); miss(T - 8, 4);

  const gs = st.globalStats;
  gs.daily = {}; gs.studyDays = {};
  let sumA = 0, sumC = 0, run = 0, best = 0;
  for (let t = 0; t <= T; t++) {
    run = active[t] ? run + 1 : 0; best = Math.max(best, run);
    if (!active[t]) continue;
    const L = log(t);
    L.s = Math.max(180, Math.round((L.a * 8 + (L.k + L.g) * 7) * rr(0.9, 1.3)));
    gs.daily[keyAt(t)] = L; gs.studyDays[keyAt(t)] = true;
    sumA += L.a; sumC += L.c;
  }
  gs.dailySince = keyAt(0);
  gs.totalCorrect = sumC; gs.totalWrong = sumA - sumC; gs.recordStreak = best;
  gs.sessionHistory = Array.from({ length: 12 }, (_, i) => {
    const total = ri(10, 30), wrong = ri(0, 5);
    return { date: huStamp(T - 11 + i), correct: total - wrong, wrong, duration: ri(90, 420), rounds: wrong > 2 ? 2 : 1 };
  });
  gs.totalSessions = 40 + gs.sessionHistory.length;
  delete gs.weekSeen;
}

const jaActive = activeDays(0.8, 23);
seedMode('japanese', { active: jaActive, perDay: [8, 10], todayCount: 6, lessonsOnly: true, pendingBias: 0.55, quizMax: 22 });
seedMode('kanji', { active: jaActive.map((on, t) => on && (t >= T - 8 || rnd() < 0.72)), perDay: [1, 3], todayCount: 2, lessonsOnly: false, pendingBias: 0.5, quizMax: 10 });
seedMode('english', { active: jaActive.map((on, t) => on && t < T - 2 && rnd() < 0.3), perDay: [3, 6], todayCount: 0, lessonsOnly: false, pendingBias: 0.4, quizMax: 8 });

await window.saveWords();
await window.saveStats();
if (window.selectNone) window.selectNone();
window.setMode('japanese');
window.showScreen('home');
window.__demoReady = true;
if (window.showToast && !new URLSearchParams(location.search).has('quiet')) window.showToast('Demó: generált adatok, semmi nem mentődik.');
