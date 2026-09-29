# LexiLearn

Offline is működő, felhőben szinkronizált szótanuló PWA (japán a JLPT N3 felé, angol mellette).
Élő verzió: https://nokedli25ttv.github.io/LexiLearn/ (GitHub Pages, a `main` ágból, build lépés nélkül).

Termék- és design-kontextus: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md).

## Futtatás helyben

```bash
npm install        # csak a fejlesztői eszközök (tesztek, lint); az oldal nem használja
npm run serve      # http://localhost:5599
```

Az `index.html` **nem nyitható meg fájlként** (duplakattintással): az app ES modulokból áll,
amiket a böngésző csak szerverről tölt be.

## Ellenőrzés (minden változtatás előtt és után)

```bash
npm run check      # lint (hiányzó importok, eval tiltás) + összes teszt
npm test           # csak a tesztek
npm run test:watch # tesztek figyelő módban fejlesztés közben
```

## Felépítés

| Hely | Tartalom |
|---|---|
| `index.html`, `style.css` | az oldal szerkezete és stílusa |
| `data.js`, `japanese_words.js`, `dekiru.js`, `kanji_data.js`, `japanese_sentences.js`, `english_sentences2.js` | a szótár adatai, **kézzel szerkeszthető** klasszikus scriptek |
| `data-registry.js` | a fenti adatokat `eval` nélkül gyűjti a `window.LEXI_DATA`-ba (új Dekiru lecke 30-ig magától bekerül) |
| `js/main.js` | belépési pont: betölti a modulokat, az inline `onclick` kezelőknek a `window`-ra teszi a függvényeket, elindítja az appot |
| `js/core/` | állapot (`state`), statikus adatok (`data`), mentés / betöltés / migráció (`storage`), dátumok, segédek |
| `js/library/` | Gyakorlás fül: szűrők, lenyíló menük, szólista, gyakorlás dokk, saját listák |
| `js/practice/` | gyakorló motor (kvíz, gépelős, mondat), 3D kártya, felolvasás (TTS) |
| `js/habit/` | napi szokás: napi penzum, új szavak tanulása, mai ismétlés, Kezdőlap |
| `js/stats/` | statisztika: számítások (`model`) és ábrák (`view`) |
| `js/features/`, `js/ui/`, `js/app/` | feladatok, sorozat, könyvjelzők, profil, import/export; képernyők, téma, toast, húzás, konfetti; service worker, bejelentkezés |
| `firebase-sync.js` | Google bejelentkezés + felhő szinkron (Firestore) |
| `sw.js` | service worker (offline gyorsítótár) |

### Új függvény, amit HTML-ből hívsz

Ha egy `onclick="valami()"` új függvényt hív, tedd ki a `window`-ra a `js/main.js`
`Object.assign(window, { … })` listájában. A `tests/handlers.test.js` elbukik, ha kimarad.

### Kiadás

Minden kiadásnál együtt emeld a verziót: `index.html` (`?v=` a script / style linkeken) és
`sw.js` (`CACHE_NAME`). Új modul fájlnál vedd fel a `sw.js` `STATIC_ASSETS` listájába is.

## Tesztek

- **`tests/golden.test.js` – golden master.** A `tests/golden/legacy.json` a V13.2-es, még
  egyben lévő `app.js` kimenete (rögzített idő és véletlenszám mellett: szűrők, új szavak,
  Kezdőlap, gyakorlás, tanulás, statisztika, mentési formátum). A moduláris kódnak ezzel
  **pontosan** egyeznie kell. Szándékos viselkedésváltozásnál nézd át az eltérést, és
  frissítsd a várt értéket: a harness a `tests/harness/` mappában van.
- **`tests/handlers.test.js`** – minden kirajzolt inline eseménykezelő létező függvényt hív.
- **`tests/unit/`** – egységtesztek a mag logikára (dátumok, napi napló, statisztika, új szavak).
