// Minden tesztfájl végén megvárjuk az app rövid időzítőit (300–500 ms: kiejtés, Tovább gomb), hogy ne a
// már lebontott jsdom környezetben fussanak le ("window / document is not defined" kezeletlen hiba,
// ami időzítéstől függően hol jött, hol nem). A valódi setTimeout-ot még a tesztek előtt eltesszük,
// mert egy teszt hamis időzítőket is bekapcsolhat.
import { afterAll } from 'vitest';

const realSetTimeout = globalThis.setTimeout;
afterAll(() => new Promise(resolve => realSetTimeout(resolve, 700)));
