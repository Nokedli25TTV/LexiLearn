// LexiLearn – core/dates.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

/* ══════════════════════════════════════════════════════
   STREAK, ACTIVITY ÉS KÜLDETÉSEK
══════════════════════════════════════════════════════ */
// V13: HELYI dátum kulcs (YYYY-MM-DD). A korábbi toISOString() UTC-t adott, így
// éjfél és hajnali 1-2 között a tanulás még az előző napra íródott (sorozat, "mai szavak").
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayKey() { return dateKey(new Date()); }

/* ══════════════════════════════════════════════════════
   V13.2: STATISZTIKA – nyugodt, fegyelem-alapú dashboard
   - KPI sáv: Konzisztencia, Aktív napok (30), Rögzült szavak, Fókusz a héten
   - Konzisztencia hőtérkép (GitHub-stílus), Tudás-érettség (sávdiagram),
     Pontosság (14 nap, vonal), Fókuszált idő (14 nap, oszlop)
   - Egyetlen vezérszín (erdőzöld); minden ábrának van táblázatos párja.
   Az ábrák kézzel írt SVG-k: offline is működnek, és a téma színei (CSS
   változók) automatikusan követik a világos / sötét módot.
══════════════════════════════════════════════════════ */
const HU_MONTHS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
const HU_WEEKDAYS = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];

function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function startOfWeek(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
function keyToDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function fmtDay(key) { const d = keyToDate(key); return `${HU_MONTHS[d.getMonth()]} ${d.getDate()}.`; }
function fmtDayLong(key) { const d = keyToDate(key); return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]} ${d.getDate()}., ${HU_WEEKDAYS[d.getDay()]}`; }
function lastNDays(n) { const today = new Date(); return Array.from({ length: n }, (_, i) => dateKey(addDays(today, i - n + 1))); }
function fmtDuration(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} p`;
  return `${Math.floor(m / 60)} ó ${String(m % 60).padStart(2, '0')} p`;
}
function fmtNum(n) { return Number(n || 0).toLocaleString('hu-HU'); }

// "2026. 09. 29. 10:15:22" (toLocaleString hu-HU) → "2026-09-29"
function parseHuDateKey(str) {
  const m = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./.exec(String(str || ''));
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null;
}

export { HU_MONTHS, HU_WEEKDAYS, addDays, dateKey, fmtDay, fmtDayLong, fmtDuration, fmtNum, keyToDate, lastNDays, parseHuDateKey, startOfWeek, todayKey };
