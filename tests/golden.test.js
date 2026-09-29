// Golden master: az app kimenete (szűrők, új szavak, Kezdőlap, gyakorlás, tanulás, statisztika,
// mentési formátum) rögzített idő és véletlenszám mellett PONTOSAN egyezik a tests/golden/expected.json-nal.
// Eredete: a V13.2-es app.js kimenete (tests/harness/run-legacy.js), a V13.3 modulokra bontás ezzel egyezett.
// Szándékos viselkedésváltozásnál: UPDATE_GOLDEN=1 npx vitest run tests/golden.test.js,
// majd a git diff-ben nézd át, hogy CSAK a szándékolt rész változott.
import { it, expect, vi } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootApp } from './harness/boot.js';
import { capture } from './harness/capture.js';

const GOLDEN = path.join(path.dirname(fileURLToPath(import.meta.url)), 'golden', 'expected.json');

it('az app kimenete megegyezik a rögzített (golden) kimenettel', async () => {
  const warn = vi.spyOn(console, 'warn');
  const error = vi.spyOn(console, 'error');
  const { api, reseed, win } = await bootApp();
  const result = await capture(api, win, reseed);
  if (process.env.UPDATE_GOLDEN) writeFileSync(GOLDEN, JSON.stringify({ ...result, __errors: [] }, null, 2));
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8'));
  delete golden.__errors;
  expect(result).toEqual(golden);
  // A betöltés a valódi úton fusson, ne a hibakezelő ágon
  const problems = [...warn.mock.calls, ...error.mock.calls].map(c => c.map(String).join(' ')).filter(m => /hiba|error/i.test(m));
  expect(problems).toEqual([]);
});
