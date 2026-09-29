// Golden master: az ES modulokra bontott app PONTOSAN ugyanazt csinálja, mint a régi app.js.
// A tests/golden/legacy.json a refaktor ELŐTTI kódból készült (tests/harness/run-legacy.js).
// Ha egy szándékos viselkedésváltozás miatt eltér, a különbséget nézd át, és csak utána
// frissítsd a golden fájlt (lásd tests/README.md).
import { it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootApp } from './harness/boot.js';
import { capture } from './harness/capture.js';

it('az ES modul verzió kimenete megegyezik a refaktor előtti app.js-ével', async () => {
  const warn = vi.spyOn(console, 'warn');
  const error = vi.spyOn(console, 'error');
  const { api, reseed, win } = await bootApp();
  const result = await capture(api, win, reseed);
  const golden = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'golden', 'legacy.json'), 'utf8'));
  delete golden.__errors;
  expect(result).toEqual(golden);
  // A betöltés a valódi úton fusson, ne a hibakezelő ágon
  const problems = [...warn.mock.calls, ...error.mock.calls].map(c => c.map(String).join(' ')).filter(m => /hiba|error/i.test(m));
  expect(problems).toEqual([]);
});
