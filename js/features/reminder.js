// LexiLearn – features/reminder.js
// V13.18: Napi emlékeztető naptáreseményként. Egy webes app zárt állapotban, szerver nélkül nem tud
// időzített értesítést küldeni (iPhone-on a webes push is szervert igényel), ezért egy naponta
// ismétlődő naptáreseményt adunk (.ics, riasztással), amit a telefon naptára megbízhatóan jelez.
import { downloadText } from '../core/util.js';
import { showToast } from '../ui/toast.js';

const REMINDER_KEY = 'lexi_reminder_time';
const DEFAULT_TIME = '20:00';
const pad = n => String(n).padStart(2, '0');

function reminderTime() {
  try { return /^\d{2}:\d{2}$/.test(localStorage.getItem(REMINDER_KEY) || '') ? localStorage.getItem(REMINDER_KEY) : DEFAULT_TIME; }
  catch (e) { return DEFAULT_TIME; }
}

// iCalendar szöveg: vessző, pontosvessző és visszaper escape-elve, sorvég CRLF
const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// Naponta ismétlődő, 10 perces esemény a megadott helyi időpontban, kezdéskor riasztással
function buildReminderIcs(time = DEFAULT_TIME, now = new Date(), appUrl = '') {
  const [h, m] = time.split(':').map(Number);
  const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = 'LexiLearn: napi adag';
  const desc = `Egy rövid alkalom ma is elég: előbb az ismétlés, aztán az új szavak.${appUrl ? `\n${appUrl}` : ''}`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LexiLearn//Napi emlekezteto//HU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:lexilearn-napi-emlekezteto@lexilearn',
    `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${pad(h)}${pad(m)}00`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(desc)}`,
    ...(appUrl ? [`URL:${appUrl}`] : []),
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(title)}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', ''
  ].join('\r\n');
}

function renderReminder() {
  const input = document.getElementById('reminder-time');
  if (input && document.activeElement !== input) input.value = reminderTime();
}

function setReminderTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return;
  try { localStorage.setItem(REMINDER_KEY, value); } catch (e) { /* privát mód */ }
}

function downloadReminder() {
  const input = document.getElementById('reminder-time');
  if (input) setReminderTime(input.value);
  const time = reminderTime();
  const appUrl = location.protocol.startsWith('http') ? location.origin + location.pathname : '';
  downloadText('LexiLearn-emlekezteto.ics', buildReminderIcs(time, new Date(), appUrl), 'text/calendar');
  showToast(`Naptáresemény letöltve (${time}). Nyisd meg, és add hozzá a naptáradhoz.`);
}

export { DEFAULT_TIME, buildReminderIcs, downloadReminder, renderReminder, reminderTime, setReminderTime };
