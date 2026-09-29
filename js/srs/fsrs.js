// LexiLearn – srs/fsrs.js
// V13.5: FSRS-5 ütemező (Free Spaced Repetition Scheduler; az Anki mai alapértelmezett algoritmusa),
// napi felbontással, az alapértelmezett paraméterekkel. Tiszta függvények, DOM és állapot nélkül.
//
// Egy kártya állapota: { s: stabilitás (nap), d: nehézség (1-10) }.
// Stabilitás = az a napszám, ami után a felidézés esélye 90%-ra esik; ennyi lesz az ismétlési köz.
// Értékelés: 1 Újra, 2 Nehéz, 3 Jó, 4 Könnyű.

const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
  1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const DECAY = -0.5;
const FACTOR = 19 / 81;            // így R(S, S) = 0,9
const REQUEST_RETENTION = 0.9;
const MAX_INTERVAL = 36500;
const S_MIN = 0.01;

const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// Felidézési valószínűség t nap után
function retrievability(elapsedDays, s) {
  return Math.pow(1 + FACTOR * Math.max(0, elapsedDays) / s, DECAY);
}

// Ismétlési köz (nap) a kívánt megtartási arányhoz
function intervalFor(s, retention = REQUEST_RETENTION) {
  const days = (s / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
  return clamp(Math.round(days), 1, MAX_INTERVAL);
}

function initDifficulty(rating) { return clamp(W[4] - Math.exp(W[5] * (rating - 1)) + 1, 1, 10); }
function initStability(rating) { return Math.max(W[rating - 1], S_MIN); }

function nextDifficulty(d, rating) {
  const delta = -W[6] * (rating - 3);
  const damped = d + delta * (10 - d) / 9;                 // lineáris csillapítás a 10-es plafon felé
  return clamp(W[7] * initDifficulty(EASY) + (1 - W[7]) * damped, 1, 10); // visszahúzás az alapértékhez
}

function recallStability(d, s, r, rating) {
  const hardPenalty = rating === HARD ? W[15] : 1;
  const easyBonus = rating === EASY ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hardPenalty * easyBonus);
}

function forgetStability(d, s, r) {
  const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
  return Math.min(sf, s);
}

// Ugyanazon a napon ismételt kártya (pl. "Újra" után még ma visszajön)
function shortTermStability(s, rating) {
  return s * Math.exp(W[17] * (rating - 3 + W[18]));
}

/**
 * Egy értékelés utáni új állapot.
 * @param {{s:number,d:number}|null} card  null = új kártya
 * @param {number} rating 1-4
 * @param {number} elapsedDays az előző ismétlés óta eltelt napok (0 = ma már láttuk)
 */
function nextState(card, rating, elapsedDays) {
  if (!card) return { s: initStability(rating), d: initDifficulty(rating) };
  const d = nextDifficulty(card.d, rating);
  let s;
  if (elapsedDays <= 0) s = shortTermStability(card.s, rating);
  else {
    const r = retrievability(elapsedDays, card.s);
    s = rating === AGAIN ? forgetStability(card.d, card.s, r) : recallStability(card.d, card.s, r, rating);
  }
  return { s: clamp(s, S_MIN, MAX_INTERVAL), d };
}

/**
 * A négy értékelés következménye: új állapot + a következő ismétlésig hátralévő napok.
 * Újra = 0 nap (még ma visszajön). A Nehéz ≤ Jó < Könnyű sorrendet kikényszerítjük, ahogy az Anki is.
 */
function previewAll(card, elapsedDays) {
  const out = {};
  for (const rating of [AGAIN, HARD, GOOD, EASY]) {
    const state = nextState(card, rating, elapsedDays);
    out[rating] = { ...state, days: rating === AGAIN ? 0 : intervalFor(state.s) };
  }
  out[HARD].days = Math.min(out[HARD].days, out[GOOD].days);
  out[GOOD].days = Math.max(out[GOOD].days, out[HARD].days + (card ? 1 : 0));
  out[EASY].days = Math.max(out[EASY].days, out[GOOD].days + 1);
  return out;
}

export { W, DECAY, FACTOR, REQUEST_RETENTION, AGAIN, HARD, GOOD, EASY,
  retrievability, intervalFor, initDifficulty, initStability, nextState, previewAll };
