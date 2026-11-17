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
| `data.js`, `japanese_words.js`, `jlpt_n3_words.js`, `dekiru.js`, `dekiru2.js`, `kanji_data.js`, `japanese_sentences.js`, `english_sentences2.js` | a szótár adatai, **kézzel szerkeszthető** klasszikus scriptek (a `jlpt_n3_words.js` szavai `kanji` írásmódot is kapnak, ami a kártya hátoldalán jelenik meg; a Dekiru-szavak csak homográfnál, lásd lent) |
| `data-registry.js` | a fenti adatokat `eval` nélkül gyűjti a `window.LEXI_DATA`-ba (új Dekiru lecke 30-ig magától bekerül) |
| `js/main.js` | belépési pont: betölti a modulokat, az inline `onclick` kezelőknek a `window`-ra teszi a függvényeket, elindítja az appot |
| `js/core/` | állapot (`state`), statikus adatok (`data`), mentés / betöltés / migráció (`storage`), dátumok, segédek, hibatűrő válaszellenőrző (`answer`), számlálószó-címkék (`counters`) |
| `js/library/` | Gyakorlás fül: szűrők, lenyíló menük, szólista, gyakorlás dokk, saját listák |
| `js/practice/` | gyakorló motor (kvíz, gépelős, mondat), 3D kártya, kandzsi írásgyakorlás (`writing.js`), felolvasás (TTS) |
| `js/habit/` | napi szokás: napi penzum, új szavak tanulása, esedékes ismétlés (`review.js`), Kezdőlap |
| `js/goal/` | JLPT haladás: célszámok, mérföldkövek, tempó (`jlpt.js`) és a felületek: Statisztika kártya, Kezdőlap sor, Haladás képernyő (`view.js`) |
| `js/srs/` | ismétlésütemezés: FSRS-5 algoritmus (`fsrs.js`) és szó-szintű ütemezés, beosztás, előrejelzés (`schedule.js`) |
| `js/stats/` | statisztika: számítások (`model`), ábrák (`view`) és a heti összefoglaló (`week`) |
| `js/features/`, `js/ui/`, `js/app/` | feladatok, sorozat, könyvjelzők, profil, import/export; képernyők, téma, toast, húzás, konfetti; service worker, bejelentkezés |
| `firebase-sync.js` | Google bejelentkezés + felhő szinkron (Firestore) |
| `js/app/cloud-store.js` | a felhő adat felosztása több Firestore dokumentumra (lásd lent) |
| `sw.js` | service worker (offline gyorsítótár) |
| `kanjivg/n5.json` … `n1.json` | a kandzsik vonássorrendje (KanjiVG), JLPT-szintenként; a `tools/build-kanjivg.mjs` állítja elő |
| `js/features/strokes.js` | vonássorrend a tanuló / ismétlő kártya hátoldalán (lusta betöltés, rajzolás, újrajátszás) |
| `word_notes.js` | a japán szavak kézzel írt tudnivalói (`WORD_NOTES`, kana szerint: `pos`, `use`, `watch`, `rel`), klasszikus script, mind a 48 Dekiru-leckéhez (1. könyv: 1–24., 2. könyv: 25–48., tíz adagban) és az alapszótár szavaihoz, az N3 szókincshez témakörönként (1–2. adag: az összes ige, 3. adag: a melléknevek, 4. adag: a határozószók és kötőszók, 5. adag: a jövevényszavak, 6. adag: munka és gondolkodás, 7. adag: tárgyak és iskola, 8. adag: társadalom, gazdaság, kommunikáció, 9. adag: természet, időjárás, állatok, idő, 10. adag: ételek, egészség, testrészek, 11. adag: érzelmek, kapcsolatok, emberek, kultúra, 12. adag: helyek, közlekedés, utazás, irányok, 13. adag: mindennapi élet, bolt, szórakozás, sport, udvariasság, színek és a maradék; ezzel az N3 szókincs teljes); a `tests/word-notes.test.js` ellenőrzi |
| `js/features/word-info.js` | szómagyarázat: „i” gomb a kártyák hátoldalán, a Figyelj sor, a hibás válasz utáni magyarázat és az alulról nyíló lap (`openWordInfo`) |
| `js/practice/lesson-test.js` | Lecke-zárás (japán): egy lecke elkezdett szavai egyszer, vegyes kérdésfajtával (`mix`: szavanként `meaning` / `reverse` / `typed` / `listen`, a motor `applyLessonTestKind()`-dal állítja be a típust és az irányt); az első kör eredménye `globalStats.lessonTests[lecke] = { date, pct, total, best }`, 90%-tól lezárt |
| `grammar_notes.js` | nyelvtan leckénként (`GRAMMAR_NOTES`, lecke → `{ title, points: [{ pattern, name, text, ex: [[japán, magyar]], watch }] }`), klasszikus script; mind a 48 Dekiru-lecke (1. könyv 1–24., 2. könyv 25–48., a 2. könyv japán leckecímei magyarul), a könyv sorrendjében, saját magyarázattal és példákkal |
| `kanji_notes.js` | a kandzsik kézzel írt jegyzetei (`KANJI_NOTES`, kandzsi → `{ parts, mn, kun, on }`: részek, emlékeztető kép, teljes kun alakok, on olvasat példával), klasszikus script, a kandzsi-leckék sorrendjében adagonként (1. adag: 1–5. lecke, 60 N5 kandzsi; 2. adag: 6–10. lecke, N5 és N4); a `tests/kanji-notes.test.js` ellenőrzi |
| `js/features/grammar.js` | a lecke nyelvtana: sor a Gyakorlás fülön (egy lecke kiválasztva, a Lecke-zárás fölött), alulról nyíló lap kinyitható pontokkal, felolvasással (`speakGrammar`) és leckelapozással (`openGrammar`) |
| `tools/` | fejlesztői eszközök, az app nem tölti be őket: KanjiVG feldolgozás, demó, a README képei, az azonos kanájú szavak listája (`homographs.mjs`, lásd lent) |

### Új függvény, amit HTML-ből hívsz

Ha egy `onclick="valami()"` új függvényt hív, tedd ki a `window`-ra a `js/main.js`
`Object.assign(window, { … })` listájában. A `tests/handlers.test.js` elbukik, ha kimarad.

### Kiadás

Minden kiadásnál együtt emeld a verziót: `index.html` (`?v=` a script / style linkeken),
`sw.js` (`CACHE_NAME`), `package.json` és a `js/main.js` fejléce. Új modul fájlnál vedd fel a `sw.js`
`STATIC_ASSETS` listájába is; a `tests/sw.test.js` elbukik, ha kimarad, vagy ha a lista nem létező fájlt tartalmaz
(egyetlen hiányzó fájl miatt a service worker nem települ, és az app nem működik offline).

## Azonos kanájú szavak (homográfok)

Az app a japán szavakat kana szerint azonosítja (`ja_<kana>`), ezért egy Dekiru-szó és egy azonos kanájú
`japanese_words.js` / `jlpt_n3_words.js` szó egy kártyát kap (`syncNewWords`, `js/core/storage.js`).

- **Ugyanaz a szó** (もくてき = 目的): a jelentés és az írásmód az N3 adatából jön. A szó Dekiru-szó marad
  (`source: 'dekiru'`), így a Statisztika lecke-nézete is számolja.
- **Más szó (homográf):** a Dekiru-rekordnak saját `kanji` mezője van, ami eltér a másikétól (いか: `kanji: '以下'`
  a 27. leckében, 烏賊 az N3-ban). A kártyán a lecke jelentése áll elöl, utána a másik szóé (mint az いる / かける
  több leckés jelentéseinél), az írásmód mindkettő (`以下・烏賊`); ami a leckében már szerepel, nem ismétlődik.
  Gépelésnél bármelyik írásmód jó. Jelenleg 12 ilyen szó van, kettő az 1. könyvben (かえる, くも).
- **Új adag után** (N3 vagy Dekiru): a `node tools/homographs.mjs` listázza a jelölt homográfokat és a gyanús,
  jelöletlen párokat (nincs közös szótő a két jelentésben). Ezeket kézzel kell átnézni, a legtöbb csak szinonima.
  A `--all` minden azonos kanájú párt kiír.
- **Témakörök:** a Dekiru-szavak címkéi betöltéskor az adatfájlból jönnek (V13.45 óta nem adódnak a mentett
  címkékhez), így egy címkejavítás a meglévő mentésekben is érvényes, külön migráció nélkül.

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
- **Új szó:** a tanuló kártyán a "Tudom" Jó értékelés (első ismétlés 3 nap múlva); ha közben "Még nem" is volt, hamarabb. Ez csak elkezdi a szót (`stats.introducedAt`, Tanulás alatt); ez a dátum számít a napi penzumba.
- **Ismétlés:** Újra / Nehéz / Jó / Könnyű; az Újra még ma visszajön. Egy alkalom legfeljebb 20 kártya.
- **Ismétlés módja (V13.31):** `globalStats.reviewStyle` módonként: `type` (alap) / `choice` / `self` / `mixed` (kártyánként véletlen). Gépelésnél és választásnál az app dönti el, tudtad-e: helyesnél Nehéz / Jó / Könnyű, hibásnál Újra ("Elírás volt" után mégis értékelhető). Az ellenőrző a `js/core/answer.js` (`checkMeaning`, `checkJapanese`), a Gépelős gyakorlás is ezt használja.
- **Fordított kártyák (V13.31):** `stats.srsRev`, saját FSRS-ütemezéssel; a sorban `r:<id>` kulccsal. Japán és angol módban, ha az eredeti kártya köze legalább 7 nap; módonként naponta legfeljebb 5 új (`seedReverseCards`, a napi számláló a `globalStats.reverseSeeded`-ben, így szinkronizálódik). Betöltéskor és az ismétlés indításakor jönnek. A megtanult állapotot (`markReviewLearned`) csak az eredeti kártya viszi.
- **Megtartási arány (V13.31):** egy kártya első mai értékelése a napi naplóba kerül (`globalStats.daily[nap].r / rp / rm / rmp`: összes, elsőre tudott, ugyanez a 21+ napos közű kártyákra). A Statisztika 30 napot mutat (`computeRetention`).
- **Megtanult (napi tanulásból):** két egymás utáni Jó vagy Könnyű ismétlés után (`stats.reviewPasses`, utána `stats.learnedAt`, `markReviewLearned()`). Az Újra nullázza a számolást, a Nehéz nem számít, de nem is nulláz. Csak ismétlésekből ez kb. 2 hét (3 + 11 nap).
- **Szabad gyakorlás:** az ötödik egymás utáni helyes kvíz- / gépelős / mondat- / hallás válasznál a szó megtanult (`stats.practiceLearnedAt`), bekerül a JLPT-haladásba, és Jó értékeléssel új ismétlőkártyát kap (V13.30 óta akkor is, ha a "Tudom" után már volt kártyája; a szüneteltetetthez nem nyúl). A kör végén Nehéz / Jó / Könnyű gombbal átállítható (`setLearnedRating()`, 1, 3 vagy 16 nap); ha nem választasz, marad a 3 nap. A szüneteltetett kártya nem jön vissza magától. Kártyás szónál a hibás válasz holnapra hozza az ismétlést; a helyes válasz nem tolja ki. Az 5 találat alatti próbálkozás nem hoz létre kártyát, így egy véletlenül kiválasztott, későbbi lecke szava nem kerül az ismétlésbe.
- **Gyakorlásból megtanult, kártya nélküli szavak:** a V13.27 előtt ezeknek nem volt kártyájuk. Betöltéskor módonként legfeljebb napi 5-tel, a leginkább felejtettel kezdve beosztja őket (`seedPracticeBacklog()`).
- **Már tanult szavak:** betöltéskor (és felhő szinkron után) a még ütemezés nélküli tanult szavakat a meglévő
  eredményekből becsülve beosztja; a lemaradtakat napi adagokra (min. 15/nap, legfeljebb 3 hét).

## Kiejtés

`js/practice/tts.js`. Minden nyelv a Google-hangon szól (`translate_tts`), egy rejtett, azonos eredetű keretben létrehozott `<audio>` elemen, mert a szolgáltatás 404-et ad, ha a kérés más oldal címét viszi Referer fejlécben.

- **Nem gyorsítótárazható:** a válasz `no-store`, és nincs CORS-fejléc, így előre letölteni, blobként tárolni vagy offline menteni nem lehet: minden kimondás hálózati kérés.
- **Tartalék:** hiba (0,3 mp szünettel) vagy 2,5 mp csend után egyszer újrapróbálja, utána a készülék beszédmotorja jön, de csak akkor, ha van a nyelvhez hangja (különben csend és egy egyszeri értesítés). Elutasított lejátszásnál és kapcsolat nélkül nincs újrapróbálás.
- **Hangkimenet (nem iOS):** szünet után a kimenet ébredése elnyelné a szó elejét, ezért egy AudioContext -100 dB-es jele nyitva tartja, és ha aludt, az indítás 250 ms-ot vár. 30 mp tétlenség vagy háttérbe kerülés után elalszik. iOS-en nem fut: ott a némító kapcsoló és a Zene mellett beállítás miatt más a helyzet, és a kiejtés jól működik.
- **Hibakeresés a készüléken:** a Profil alján ötször a verziószámra koppintva a diagnosztika a kiejtést is mutatja: online-e, a hangkimenet állapota, nyelvenként hány hang van, és az utolsó kimondások (melyik hang szólt, hány ms alatt, miért váltott).

## JLPT haladás

- **Viszonyítás:** a JLPT általános, halmozott célszámai: N5 800 / 100, N4 1500 / 300, N3 3750 / 650 (szó / kandzsi).
  Az N5-N3 szintű szavak együtt számítanak.
- **Elkezdett:** a "Tudom" után, ismétlésre vár (`isStartedWord`); kikerül az új szavak közül, a Gyakorlásban "Tanulás alatt". **Megtanult:** lásd az SRS szakaszt (`isLearnedWord`). **Rögzült:** az ismétlési köz (a stabilitásból, `intervalFor(s)`) legalább 21 nap;
  ugyanez a definíció a Statisztika érettség-sávjában és KPI-jában.
- **Mérföldkövek:** a megtanult szavak töltik, az elkezdettek nem; az elérés dátuma a k-adik megtanult szó dátuma. A jelzés a tanulás és az ismétlés végén is megjelenik.
- **Radikálok:** a kandzsik sorrendjéhez és megnyílásához elég az elkezdett radikál (`knownRadicals`), a lecke és a haladás viszont megtanult radikált számol.
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

## Kandzsi írásgyakorlás

A Gyakorlás dokk „Írás” típusa, csak kandzsi módban (`js/practice/writing.js`; a motor `finishWriting()` függvénye pontoz).

- **Illesztés:** a megrajzolt vonás és a KanjiVG útvonala egyaránt 24 pontra mintavételezett vonal. Egy vonás akkor jó,
  ha a kezdőpont, a végpont és az átlagos távolság a tűrésen belül van (`TOL`, a vonás hosszával nő), és az iránya egyezik.
  Ha egy későbbi vonásra jobban illik, az sorrendhiba; ha megfordítva illik, irányhiba.
- **Tűrések:** mind az 1715 kandzsi 17 641 vonásán bemérve; a `tests/unit/writing.test.js` összesítő tesztje őrzi
  (pontos vonás: nincs elutasítás; fordított irány: 0,5% alatt; a következő vonás elfogadása: 1% alatt). Ha a `TOL`
  értékeit állítod, ezt a tesztet nézd.
- **Eredmény** (`writingResult()`): hibátlanul vagy legfeljebb két javítással kész = helyes válasz. Segítséggel (a gombbal,
  vagy mert ugyanaz a vonás kétszer nem sikerült), kettőnél több hibával vagy a Nem tudommal = hibás, a szó a következő
  körbe kerül. A Körvonal mellett rajzolt kandzsi átrajzolás: nem pontozott.
- A rajzfelület az ujj vonalát mutatja; elfogadáskor a szabályos vonás kerül a helyére, így a kész kandzsi mindig szép.

## Heti összefoglaló

A Statisztika alképernyője (`js/stats/week.js`), hétfőtől vasárnapig számol, hetenként lapozható.

- **Számok:** a napi naplóból (`globalStats.daily`) és a szavak `learnedAt` / `practiceLearnedAt` dátumából; az előző
  héttel a `summarizeWeek()` ugyanazt a számítást futtatja le.
- **Még bizonytalan:** a héten elrontott és azóta nem javított szavak (kvízhiba után 0 a sorozat, vagy visszaesés az
  ismétlésben, és a köz legfeljebb 1 nap). A „Gyakorlás ezekkel” kijelöli őket a Gyakorlás fülön.
- **Belépés:** egy sor a Statisztika tetején (ez a hét), és egy sor a Kezdőlapon a lezárt múlt hétről, amíg meg nem
  nézted (`globalStats.weekSeen`).

## Demó és a README képei

- **`tools/demo.html`:** az igazi `index.html`-t tölti be, de a tárolók memóriabeli másolatok (`tools/demo-storage.js`),
  a felhő szinkron kimarad, service worker nem települ, és a `tools/demo-seed.js` kb. 110 napnyi, rögzített
  véletlenszám-magból generált előzményt tesz az állapotba. A böngésző tárhelyébe semmit nem ír; újratöltéskor minden
  elölről indul. Kapcsolók: `?theme=light`, `?seed=7` (más előzmény), `?quiet` (nincs értesítés).
- **`tools/demo-shots.js`:** a `?shot=…` egy-egy jelenetet állít be (pl. megfordított kártya, félig megrajzolt kandzsi),
  megállítja az animációkat, és jelzi, hogy a kép elkészíthető.
- **`tools/showcase.html`:** négy telefonkeret egy képen, mindegyikben a demó egy jelenete (`?row=1`, `?row=2`).
- **A README képeinek újragyártása** (felületváltozás után):

  ```bash
  npm run serve                  # egy másik terminálban
  node tools/readme-shots.mjs    # docs/readme/igy-nez-ki-1.webp és -2.webp
  ```

  A szkript egy fej nélküli Edge-et vagy Chrome-ot indít ideiglenes profillal, és a DevTools protokollon át fényképez;
  külön csomag nem kell hozzá. A képeken a „ma” az előállítás napja, ezért a dátumok és a hét napjai változnak.

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
- **`tests/unit/writing.test.js`, `tests/writing-practice.test.js`** – a vonásillesztő (pontos, hanyag, fordított,
  rossz sorrendű vonások; összesítés minden kandzsin) és egy teljes írásgyakorló kör az appal.
- **`tests/unit/week.test.js`** – a heti számítások: hétkezdet, aktív napok, megtanult szavak, bizonytalan szavak, JLPT változás.
- **`tests/sw.test.js`** – a service worker előtöltési listája: minden fájl létezik, minden modul benne van.
- **`tests/unit/srs.test.js`, `tests/review.test.js`, `tests/learn-srs.test.js`** – FSRS számítások,
  ütemezés, beosztás; az ismétlés a Kezdőlaptól az összegzésig, és a "Tudom" → ütemezés a teljes appal.
- **`tests/unit/answer.test.js`, `tests/review-typed.test.js`** – a hibatűrő ellenőrző; gépelős, választós, vegyes és fordított ismétlés a teljes appal, a megtartási arány számolása.
- **`tests/word-notes.test.js`, `tests/word-info.test.js`** – a jegyzetek létező szóhoz és létező kapcsolódó szóhoz tartoznak, rövidek; az „i” gomb, a Figyelj sor, a lap (lapozás, vissza, Escape) és a hibás válasz utáni magyarázat a gyakorlásban és az ismétlésben.
- **`tests/lesson-test.test.js`** – a Lecke-zárás: melyik leckét ajánlja a Kezdőlap, minden szó egyszer és mind a négy kérdésfajta, a toldalékos szó nem gépelős, a kör vége (Még nem ül a kérdésfajtával, mentett eredmény, a második kör nem írja felül), a Gyakorlás fül sora, a lezárt lecke a menüben és a Statisztikában.
- **`tests/grammar-notes.test.js`, `tests/grammar.test.js`** – a nyelvtan adatai (létező lecke, minden pontban minta, név, magyarázat és japán példa, hossz, írásjelek); a Gyakorlás fül sora, a lap (pontok, példák, buktató, lapozás, Escape), több lecke és angol mód esetén nincs nyelvtan.
- **`tests/homographs.test.js`** – a homográfok (いか, だい, かい, かえる, くも …) a lecke jelentésével és mindkét írásmóddal, a régi mentés helyreállása (felülírt jelentés, téves címkék), és a `tools/homographs.mjs` besorolása.
- **`tests/data.test.js`** (V13.33 óta) a kana mezőben latin betűt sem enged (elgépelés); az így javított szavak a `RENAMED_WORDS`-be kerülnek, hogy a haladás átköltözzön.
- **`tests/unit/counters.test.js`, `tests/stats-shortcuts.test.js`** – mit számol a számlálószó; a Statisztika szólistájából gyakorlás, a JLPT-kártya két sora, a heti sor hét napja, és a számlálószó-címke a tanuló, a gyakorló és a 3D kártyán.
- **`tests/tts.test.js`, `tests/tts-android.test.js`** – a hangútvonal: Google-hang, újrapróbálás, nyelvhez illő tartalék, a hangkimenet ébren tartása, napló.
- **`tests/flashcard-fit.test.js`** – a 3D kártya főszövegének méretosztálya (`is-long` / `is-very-long`, latin és kana küszöbök, kandzsi mód), a `.fc-body` szerkezet (a sarokelemek kívül), és hogy a `style.css` ugyanezeket az osztályneveket használja.
- **`tests/learned-rule.test.js`, `tests/practice-card.test.js`** – a "Tudom" csak elkezd, két sikeres ismétlés tesz megtanulttá; az ötödik gyakorlási találat kártyát ad, a kör végén értékelhető; a régi szavak napi adagban jönnek.
- Egy tesztfájl a `bootApp()`-ot csak egyszer hívhatja (az adatfájlok globális konstansai miatt).
- **`tests/setup/settle-timers.js`** (V13.50) – minden tesztfájl végén 700 ms-ot vár, hogy az app rövid időzítői (kiejtés 300 ms, Tovább gomb 500 ms) még élő környezetben fussanak le. Nélküle időnként „window / document is not defined” kezeletlen hiba jött a lebontott jsdom-ból, miközben minden teszt átment.
- **`tests/cloud-sync.test.js`** – a valódi `firebase-sync.js` a teljes appal, memóriabeli Firestore-ral
  (`tests/fakes/`; a `vitest.config.js` a Firebase CDN importokat ezekre cseréli).
