// Napi emlékeztető: naponta ismétlődő naptáresemény (.ics) riasztással a választott időpontban.
import { expect, it } from 'vitest';
import { bootApp } from './harness/boot.js';

it('naptáresemény: napi ismétlés, helyi időpont, riasztás, megmaradó időpont', async () => {
  const { api, win } = await bootApp();
  const ics = api.buildReminderIcs('07:45', new Date(2026, 9, 28, 12, 0), 'https://pelda.hu/lexilearn/');
  const lines = ics.split('\r\n');
  expect(lines[0]).toBe('BEGIN:VCALENDAR');
  expect(lines).toContain('DTSTART:20261028T074500');   // helyi (lebegő) idő, nem UTC
  expect(lines).toContain('RRULE:FREQ=DAILY');
  expect(lines).toContain('TRIGGER:PT0M');
  expect(lines).toContain('URL:https://pelda.hu/lexilearn/');
  expect(lines.find(l => l.startsWith('DESCRIPTION:Egy'))).toContain('elég:');
  expect(ics.includes('\n') && !/[^\r]\n/.test(ics)).toBe(true); // csak CRLF sorvég

  api.showScreen('profile');
  const input = win.document.getElementById('reminder-time');
  expect(input.value).toBe('20:00');
  api.setReminderTime('21:15');
  expect(api.reminderTime()).toBe('21:15');
  api.setReminderTime('rossz');
  expect(api.reminderTime()).toBe('21:15');
  api.renderProfile();
  expect(input.value).toBe('21:15');
});
