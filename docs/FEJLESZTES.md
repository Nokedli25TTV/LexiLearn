# LexiLearn: fejlesztői leírás

Offline is működő, felhőben szinkronizált szótanuló PWA (japán a JLPT N3 felé, angol mellette).
Élő verzió: https://nokedli25ttv.github.io/LexiLearn/ (GitHub Pages, a `main` ágból, build lépés nélkül).

A bemutató a [README](../README.md)-ben van. Termék- és design-kontextus: [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md).

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
| `data.js`, `japanese_words.js`, `jlpt_n3_words.js`, `dekiru.js`, `kanji_data.js`, `japanese_sentences.js`, `english_sentences2.js` | a szótár adatai, **kézzel szerkeszthető** klasszikus scriptek (a `jlpt_n3_words.js` szavai `kanji` írásmódot is kapnak, ami a kártya hátoldalán jelenik meg) |
| `data-registry.js` | a fenti adatokat `eval` nélkül gyűjti a `window.LEXI_DATA`-ba (új Dekiru lecke 30-ig magától bekerül) |
| `js/main.js` | belépési pont: betölti a modulokat, az inline `onclick` kezelőknek a `window`-ra teszi a függvényeket, elindítja az appot |
| `js/core/` | állapot (`state`), statikus adatok (`data`), mentés / betöltés / migráció (`storage`), dátumok, segédek |
| `js/library/` | Gyakorlás fül: szűrők, lenyíló menük, szólista, gyakorlás dokk, saját listák |
| `js/practice/` | gyakorló motor (kvíz, gépelős, mondat), 3D kártya, felolvasás (TTS) |
| `js/habit/` | napi szokás: napi penzum, új szavak tanulása, esedékes ismétlés (`review.js`), Kezdőlap |
| `js/goal/` | JLPT haladás: célszámok, mérföldkövek, tempó (`jlpt.js`) és a felületek: Statisztika kártya, Kezdőlap sor, Haladás képernyő (`view.js`) |
| `js/srs/` | ismétlésütemezés: FSRS-5 algoritmus (`fsrs.js`) és szó-szintű ütemezés, beosztás, előrejelzés (`schedule.js`) |
| `js/stats/` | statisztika: számítások (`model`) és ábrák (`view`) |
| `js/features/`, `js/ui/`, `js/app/` | feladatok, sorozat, könyvjelzők, profil, import/export; képernyők, téma, toast, húzás, konfetti; service worker, bejelentkezés |
| `firebase-sync.js` | Google bejelentkezés + felhő szinkron (Firestore) |
| `js/app/cloud-store.js` | a felhő adat felosztása több Firestore dokumentumra (lásd lent) |
| `sw.js` | service worker (offline gyorsítótár) |
| `kanjivg/n5.json` … `n1.json` | a kandzsik vonássorrendje (KanjiVG), JLPT-szintenként; a `tools/build-kanjivg.mjs` állítja elő |
| `js/features/strokes.js` | vonássorrend a tanuló / ismétlő kártya hátoldalán (lusta betöltés, rajzolás, újrajátszás) |

### Új függvény, amit HTML-ből hívsz

Ha egy `onclick="valami()"` új függvényt hív, tedd ki a `window`-ra a `js/main.js`
`Object.assign(window, { … })` listájában. A `tests/handlers.test.js` elbukik, ha kimarad.

### Kiadás

Minden kiadásnál együtt emeld a verziót: `index.html` (`?v=` a script / style linkeken),
`sw.js` (`CACHE_NAME`), `package.json` és a `js/main.js` fejléce. Új modul fájlnál vedd fel a `sw.js`
`STATIC_ASSETS` listájába is; a `tests/sw.test.js` elbukik, ha kimarad, vagy ha a lista nem létező fájlt tartalmaz
(egyetlen hiányzó fájl miatt a service worker nem települ, és az app nem működik offline).

## Felhő adat (Firestore)

Minden a `users/{uid}/data/` alatt van (a Firestore szabály ezt a gyűjteményt engedi a saját felhasználónak):

| Dokumentum | Tartalom |
|---|---|
| `v2_manifest` | kis index: `updatedAt` + minden rész hash-e; a többi eszköz ezt figyeli |
| `v2_{mód}_meta` | statisztika, napi feladatok, saját listák |
| `v2_{mód}_w0` … `w7` | a gyakorolt / saját szavak, azonosító szerint 8 részre osztva |
| `snapshot` | a V13.3-ig használt egyetlen dokumentum; csak migrációhoz és biztonsági mentésnek marad meg |

Mentéskor csak a megváltozott részek íródnak, egy atomi batch-ben a manifesttel együtt. Egy rész
jóval 1 MiB alatt marad (N3 szintű adatnál kb. 200 KB). Az első V13.4-es szinkron eszközönként
egyszer a régi `snapshot`-ot is megnézi, és ha az frissebb (egy még régi verziójú eszköz írta),
abból migrál.

## Ismétlésütemezés (SRS)

Anki-szerű: minden tanult szó `stats.srs` mezőjében él a következő esedékesség (`due`), a stabilitás
(`s`, nap), a nehézség (`d`, 1-10), az utolsó ismétlés napja, az ismétlések és visszaesések száma.
A stats-szal együtt mentődik és szinkronizálódik.

- **Algoritmus:** FSRS-5 az alapértelmezett paraméterekkel, 90%-os célzott megtartással, napi felbontással.
- **Új szó:** a tanuló kártyán a "Tudom" Jó értékelés (első ismétlés 3 nap múlva); ha közben "Még nem" is volt, hamarabb.
- **Ismétlés:** Újra / Nehéz / Jó / Könnyű; az Újra még ma visszajön. Egy alkalom legfeljebb 20 kártya.
- **Szabad gyakorlás:** a kvízben / gépelősben / mondatban elrontott szó holnap esedékes lesz; a helyes válasz nem tolja ki.
- **Már tanult szavak:** betöltéskor (és felhő szinkron után) a még ütemezés nélküli tanult szavakat a meglévő
  eredményekből becsülve beosztja; a lemaradtakat napi adagokra (min. 15/nap, legfeljebb 3 hét).

## JLPT haladás

- **Viszonyítás:** a JLPT általános, halmozott célszámai: N5 800 / 100, N4 1500 / 300, N3 3750 / 650 (szó / kandzsi).
  Az N5-N3 szintű szavak együtt számítanak.
- **Megtanult:** elkezdett szó. **Rögzült:** az ismétlési köz (a stabilitásból, `intervalFor(s)`) legalább 21 nap;
  ugyanez a definíció a Statisztika érettség-sávjában és KPI-jában.
- **Mérföldkövek:** a megtanult szavak töltik; az elérés dátuma a k-adik megtanult szó dátuma.
- **Célidőpont:** `appData.japanese.globalStats.jlptGoal` (szinkronizált), alapból 2027-07-04.

## Kandzsi vonássorrend (KanjiVG)

- **Forrás:** [KanjiVG](https://kanjivg.tagaini.net) (© Ulrich Apel), **CC BY-SA 3.0**. A `kanjivg/*.json` fájlok
  ebből származnak, ezért ugyanezen licenc alatt állnak; a forrásmegjelölés a Profil képernyő Források részén van.
- **Formátum:** szintenként egy JSON: `{ "日": [[útvonal, x, y], …] }`, vonásonként az SVG útvonal (109×109-es rács)
  és a sorszám helye. Csak a `kanji_data.js` kandzsijai kerülnek bele (összesen kb. 1,7 MB).
- **Újragenerálás** (új kandzsi a `kanji_data.js`-ben, vagy új KanjiVG kiadás): töltsd le a KanjiVG kiadását
  (`kanjivg-*-main.zip` a GitHubról), csomagold ki, majd

  ```bash
  node tools/build-kanjivg.mjs <kicsomagolt mappa, amiben a kanji/ van>
  ```

  Utána léptesd a `sw.js` `KANJIVG_CACHE` nevét, különben a telepített appok a régi fájlokat tartják meg.
  A `tests/kanji.test.js` elbukik, ha egy kandzsinak nincs vonássorrendje.
- **Betöltés:** a szint fájlja az első ilyen kandzsi kártyánál töltődik le, a többi a háttérben (adatforgalom-kímélő
  módban nem). A service worker külön, verziófüggetlen cache-ben tartja, így az app frissítése nem törli.

## Tesztek

- **`tests/golden.test.js` – golden master.** A `tests/golden/expected.json` az app kimenete rögzített
  idő és véletlenszám mellett (szűrők, új szavak, Kezdőlap, gyakorlás, tanulás, statisztika, mentési
  formátum); eredetileg a V13.2-es, még egyben lévő `app.js` kimenete, amivel a modulokra bontás pontosan
  egyezett. Szándékos viselkedésváltozásnál: `UPDATE_GOLDEN=1 npx vitest run tests/golden.test.js`, majd a
  `git diff`-ben ellenőrizd, hogy **csak** a szándékolt rész változott.
- **`tests/handlers.test.js`** – minden kirajzolt inline eseménykezelő létező függvényt hív.
- **`tests/unit/`** – egységtesztek a mag logikára (dátumok, napi napló, statisztika, új szavak) és a felhő
  tárolóra (felosztás, migráció, csak a változott rész írása, két eszköz, méret).
- **`tests/data.test.js`** – az N3 szókincs ellenőrzése: minden mező kitöltve, a romaji egyezik a kanával
  (`tests/harness/kana.js` átalakító), és egyetlen kana sem ütközik a meglévő szavakkal (az app kana alapján egyesít).
- **`tests/unit/jlpt.test.js`** – mérföldkövek, halmozott számolás, rögzült, tempó és előrejelzés.
- **`tests/kanji.test.js`** – a kandzsi adatbázis: nincs duplikátum, az olvasatok tiszta kanák (on: katakana,
  kun: hiragana), a romaji minden része egy olvasatból jön, és minden kandzsinak megvan a vonássorrendje.
- **`tests/unit/strokes.test.js`** – a vonássorrend modul jsdomban: rajzolás, időzítés, újrajátszás, csökkentett mozgás.
- **`tests/sw.test.js`** – a service worker előtöltési listája: minden fájl létezik, minden modul benne van.
- **`tests/unit/srs.test.js`, `tests/review.test.js`, `tests/learn-srs.test.js`** – FSRS számítások,
  ütemezés, beosztás; az ismétlés a Kezdőlaptól az összegzésig, és a "Tudom" → ütemezés a teljes appal.
- Egy tesztfájl a `bootApp()`-ot csak egyszer hívhatja (az adatfájlok globális konstansai miatt).
- **`tests/cloud-sync.test.js`** – a valódi `firebase-sync.js` a teljes appal, memóriabeli Firestore-ral
  (`tests/fakes/`; a `vitest.config.js` a Firebase CDN importokat ezekre cseréli).
