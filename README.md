<p align="center">
  <a href="https://nokedli25ttv.github.io/LexiLearn/">
    <img src="docs/readme/banner.svg" width="100%" alt="LexiLearn: nyugodt, napi szótanulás a JLPT N3 felé. Egy írásgyakorló négyzetben a 学 (tanulás) kandzsi vonásonként megrajzolódik.">
  </a>
</p>

<p align="center">
  <a href="https://nokedli25ttv.github.io/LexiLearn/"><img alt="Élő verzió" src="https://img.shields.io/badge/%C3%89l%C5%91%20verzi%C3%B3-megnyit%C3%A1s-f57e4d?style=for-the-badge&labelColor=22110b"></a>
  <img alt="Verzió 13.9" src="https://img.shields.io/badge/verzi%C3%B3-13.9-2d6a4f?style=for-the-badge&labelColor=171c1a">
  <img alt="JLPT N5-től N3-ig" src="https://img.shields.io/badge/JLPT-N5%20%E2%86%92%20N3-e76f51?style=for-the-badge&labelColor=171c1a">
  <img alt="PWA, offline is" src="https://img.shields.io/badge/PWA-offline%20is-52b788?style=for-the-badge&logo=pwa&logoColor=white&labelColor=171c1a">
  <br>
  <img alt="Vanilla JS, ES modulok" src="https://img.shields.io/badge/vanilla%20JS-ES%20modulok-de9300?style=for-the-badge&logo=javascript&logoColor=white&labelColor=171c1a">
  <img alt="Firebase felhő szinkron" src="https://img.shields.io/badge/Firebase-felh%C5%91%20szinkron-1a73e8?style=for-the-badge&logo=firebase&logoColor=white&labelColor=171c1a">
  <img alt="Vitest, 65 teszt" src="https://img.shields.io/badge/Vitest-65%20teszt-52b788?style=for-the-badge&logo=vitest&logoColor=white&labelColor=171c1a">
  <img alt="KanjiVG, CC BY-SA 3.0" src="https://img.shields.io/badge/KanjiVG-CC%20BY--SA%203.0-7a837e?style=for-the-badge&labelColor=171c1a">
</p>

<p align="center">
  <b>Szótanuló, ami a napi szokásra épít, nem a hajrára.</b><br>
  Japán a JLPT N3 felé (kana, szókincs, kandzsi vonássorrenddel), mellette angol.<br>
  Telefonra, egy kézre, offline is, több eszköz között szinkronban.
</p>

---

## Képernyők

<table>
  <tr>
    <td align="center" width="33%">
      <img src="docs/readme/kezdolap.jpg" width="250" alt="Kezdőlap: konzisztencia napokban, heti pöttysor, napi penzum sáv, korall Új szavak tanulása gomb, N3 felé sor és a napi feladatok.">
      <br><sub><b>Kezdőlap</b><br>konzisztencia, napi penzum, egyetlen fő lépés</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/readme/tanulo-kartya.jpg" width="250" alt="Megfordított tanuló kártya: わたし, watashi, én; alatta példamondat furiganával és magyar fordítással; Még nem és Tudom gombok.">
      <br><sub><b>Új szó kártya</b><br>húzd jobbra, ha megy, balra, ha még nem</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/readme/kandzsi-vonassorrend.jpg" width="250" alt="Kandzsi kártya hátoldala: a 学 vonásai sorban rajzolódnak, az ötödikig kész, a hatodik zölden rajzolódik; alatta 8 vonás, a jelentés és az on-kun olvasat.">
      <br><sub><b>Vonássorrend</b><br>a kandzsi vonásonként megrajzolódik</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img src="docs/readme/gyakorlas.jpg" width="250" alt="Gyakorlás fül: kereső, szűrőpillák (Dekiru 3. lecke, Úti terv, Témakör), kijelölt szavak listája N5 jelvénnyel és csillaggal, alul lebegő dokk 53 kijelölt szóval és korall Indítás gombbal.">
      <br><sub><b>Gyakorlás</b><br>szűrhető szótár, lebegő dokk</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/readme/dokk-beallitasok.jpg" width="250" alt="Kinyitott gyakorlás beállítások: Klasszikus, Gépelős, Mondat-kiegészítő és 3D kártya típus, irány, kérdések száma, sorrend.">
      <br><sub><b>Beállítások a hüvelykujj alatt</b><br>típus, irány, kérdésszám, sorrend</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/readme/kviz.jpg" width="250" alt="Klasszikus kvíz kérdés: エーティーエム, négy válaszlehetőség, szem és kiejtés gomb, Nem tudom.">
      <br><sub><b>Kvíz</b><br>okos zavaró válaszokkal, kiejtéssel</sub>
    </td>
  </tr>
</table>

> [!TIP]
> Telefonon nyisd meg az [élő verziót](https://nokedli25ttv.github.io/LexiLearn/), és a böngésző menüjéből add hozzá a kezdőképernyőhöz. Így teljes képernyős appként indul, és internet nélkül is működik.

## Egy nap a LexiLearnnel

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#171c1a', 'primaryTextColor': '#e5ebe8', 'primaryBorderColor': '#2d3531', 'lineColor': '#52b788', 'edgeLabelBackground': '#202724', 'tertiaryColor': '#202724'}}}%%
flowchart LR
  home([Kezdőlap]) --> due{Van esedékes<br>ismétlés?}
  due -- igen --> rev[Ismétlés<br>Újra · Nehéz · Jó · Könnyű]
  due -- nem --> learn[Új szavak<br>a napi penzumig]
  rev --> learn
  learn --> prac[Gyakorlás<br>kvíz, gépelős, mondat, 3D]
  prac --> stats[Statisztika<br>és JLPT haladás]
  classDef ember fill:#f57e4d,stroke:#f57e4d,color:#22110b
  classDef leaf fill:#1d3329,stroke:#52b788,color:#e5ebe8
  class rev ember
  class learn,prac leaf
```

A Kezdőlapon mindig egyetlen korall gomb mutatja a következő lépést: ha van esedékes ismétlés, az jön először, utána az új szavak. A napi limit szándékos: módonként 10 új szó (kandzsiból 5, a Profilban állítható), hogy a tudás rögzüljön, és ne legyen kiégés.

## Minden, ami benne van

### Napi szokás, nem hajrá

- **Konzisztencia:** hány egymást követő napon tanultál, alatta a hét napjai pöttysorban. A kihagyott nap nem büntetés, csak tény.
- **Napi penzum:** japán módban automatikusan a Dekiru 1. leckétől halad előre, leckénként; ha egy lecke végén kevesebb szó marad a napi célnál, a következő leckéből tölti fel az adagot. A Gyakorlás fül szűrői ezt nem módosítják.
- **Előrejelzés:** egy csendes sor arról, mennyi ismétlés jön holnap és a következő héten, hogy ne érjen meglepetés.
- **Napi feladatok:** naponta három, változó feladat, például egy hibátlan kör, tematikus nap, a nap szava, régen látott szavak vagy a legtöbbször elrontott szavak javítása.
- **Egyetlen ünneplés:** konfetti csak akkor, ha a napi cél teljesült, és akkor is naponta egyszer.

### Új szavak: húzható kártyák

- Jobbra húzva „Tudom”, balra „Még nem”; a pecsét a húzás mértékével jelenik meg, küszöb felett a kártya kirepül.
- Koppintásra megfordul: jelentés, kandzsi írásmód, romaji és egy példamondat furiganával, magyar fordítással.
- A „Még nem” kártya a sor végére kerül, és addig visszajön, amíg egyszer nem megy.
- Kiejtés japánul és angolul (iOS kezdőképernyős appban is), billentyűzettel a nyilak és a Szóköz is működik.

### Ismétlés: Anki-szerű ütemezés (FSRS-5)

- Négy gomb: **Újra, Nehéz, Jó, Könnyű**, mindegyik alatt a következő ismétlésig hátralévő idő („ma”, „3 n”, „2 hó”).
- 90%-os célzott megtartás, napi felbontás; a „Rögzült” szó ismétlési köze legalább 21 nap.
- Egy alkalom legfeljebb 20 kártya; az „Újra” még aznap visszajön. Húzással (balra Újra, jobbra Jó) és az 1-4 billentyűkkel is értékelhetsz.
- A napi tanulásban már sikerült, illetve a szabad gyakorlásban legalább ötször helyesen megválaszolt szavak kerülnek az SRS-be és a JLPT-haladásba. Ezeknél egy hibás gyakorlóválasz másnapra előrehozza az ismétlést.

### Kandzsi: 1715 írásjegy, vonássorrenddel

<table>
<tr>
<td width="50%" valign="top">

- N5-től N1-ig, magyar jelentéssel, on és kun olvasattal, romajival, témakörökkel.
- A kártya hátoldalán egy írásgyakorló négyzetben **a kandzsi vonásonként megrajzolódik**: az épp rajzolódó vonás zöld, a kész tintaszínű, a sorszám a vonás kezdetén jelenik meg.
- Alatta a vonások száma és egy újrajátszás gomb. Csökkentett mozgás beállítás mellett a kész, számozott ábra látszik.
- Az adat a [KanjiVG](https://kanjivg.tagaini.net) projektből jön, szintenként töltődik le, és utána offline is megvan.
- A V13.9-es kiadás minden kandzsit átnézett: 337 javítás a jelentésekben, az olvasatokban és a romajiban.

</td>
<td width="50%" align="center">
<img src="docs/readme/kandzsi-vilagos.jpg" width="230" alt="Világos témájú kandzsi kártya: a 学 mind a nyolc vonása kész és számozott, alatta 8 vonás, tanulás / tudomány, On: ガク, Kun: まな.">
<br><sub>világos témában, a kész ábrával</sub>
</td>
</tr>
</table>

### Gyakorlás: a teljes szótár kézben

- **Keresés** szóra, jelentésre és olvasatra; **lenyíló szűrőpillák:** Lecke (Dekiru), Úti terv (nap), Témakör, Szint, Lista, Rendezés. Minden pilla a kiválasztott értéket mutatja.
- Szavak és Mondatok nézet, kijelölés, csillag (könyvjelző), saját listák.
- **Lebegő dokk** a képernyő alján: a kijelöltek száma, a beállítások összefoglalója és a korall Indítás gomb.
- **Négy gyakorlástípus:**

| Típus | Mit csinálsz |
|---|---|
| Klasszikus | négy válaszból választasz; a zavaró válaszok hasonló szavakból jönnek |
| Gépelős | beírod a választ; japánnál kanával vagy romajival is jó |
| Mondat-kiegészítő | a szó a példamondatban hiányzik |
| 3D kártya | megfordítod, és elhúzod, ha tudtad |

- Irány (kana → magyar vagy fordítva), kérdésszám (10, 20, 30, 50 vagy mind), sorrend (véletlen, betűrend, könnyebb vagy nehezebb elöl).
- Körökben halad: a hibás szavak a következő körbe kerülnek. A kör végén pontosság, helyes és hibás válaszok, idő, és a hibás szavak listája.

### Statisztika és JLPT N3 haladás

- **KPI sáv:** Konzisztencia, Aktív napok (30), Rögzült szavak, Fókusz a héten.
- **Konzisztencia hőtérkép** GitHub-stílusú naptárban, **tudás-érettség** (Ismerkedés, Gyakorlás alatt, Rögzült), **pontosság** és **fókuszált idő** az elmúlt 14 napról. Minden ábrának van táblázatos nézete is.
- **JLPT haladás:** mérföldkő-sáv N5-től N3-ig (szókincs és kandzsi külön), célidőpont (alapból 2027. július 4., átállítható), szükséges tempó, 14 napos átlag, várható dátum és szótár-lefedettség. A Kezdőlapon egy sor mutatja: „N3 FELÉ szókincs 24% · kandzsi 20%”.
- Fülek szintekre és témakörökre, szavakra, előzményekre és a Dekiru leckékre.

### Szótár

| Mód | Tartalom |
|---|---|
| Japán | 3794 szó (N5-N3, a JLPT kb. 3750 szavas célját lefedi), kanával, romajival, kandzsi írásmóddal, témakörökkel; 24 Dekiru lecke szószedete; 2760 példamondat |
| Kandzsi | 1715 kandzsi N5-től N1-ig, jelentéssel, olvasatokkal és vonássorrenddel |
| Angol | 927 szó szintekkel és témakörökkel, 920 példamondat |
| Úti terv | 15 napos szó- és 25 napos kandzsi-terv egy japán útra, napra bontva |

Saját szó felvehető kézzel vagy listából importálva.

### Offline és felhő

- **PWA:** telepíthető, a service worker minden fájlt eltárol, így internet nélkül is teljes értékű.
- **Google bejelentkezés** és Firestore szinkron több eszköz között; mentéskor csak a megváltozott részek íródnak.
- **Biztonsági mentés** egy fájlba (statisztika, listák, saját szavak), telefoncserénél egy kattintással visszaállítható.

### Kényelem és hozzáférhetőség

- Sötét téma alapból, meleg világos téma egy kapcsolóra.
- Egy kéz, egy hüvelykujj: a navigáció és a gyakorlás indítása alul, lebegő sávon.
- WCAG AA kontraszt mindkét témában, `prefers-reduced-motion` tisztelete, billentyűzetes alternatíva minden húzáshoz, legalább 44 px-es érintési felületek.
- Felnőtt, nyugodt nyelvezet: Konzisztencia, Napi penzum, Napi feladatok.

## Színek és formák

A design iránya: **„A Nyugodt Dojo”**. Egy japán edzőterem csendje, ahol minden nap ugyanazzal a figyelemmel gyakorolsz.

| | Név | Szerep |
|---|---|---|
| ![#f57e4d](https://img.shields.io/badge/%23f57e4d-f57e4d?style=flat-square) | Parázs korall | az egyetlen „nyomd meg” szín, képernyőnként egy |
| ![#52b788](https://img.shields.io/badge/%2352b788-52b788?style=flat-square) | Levélzöld | haladás, kijelölés, az épp rajzolódó vonás |
| ![#2d6a4f](https://img.shields.io/badge/%232d6a4f-2d6a4f?style=flat-square) | Erdőzöld | világos témában a haladás színe |
| ![#e76f51](https://img.shields.io/badge/%23e76f51-e76f51?style=flat-square) | Terrakotta | a logó „Learn” szava |
| ![#0e1311](https://img.shields.io/badge/%230e1311-0e1311?style=flat-square) | Éjszakai erdő | a sötét téma háttere, zöld felé tört |
| ![#f7f5f0](https://img.shields.io/badge/%23f7f5f0-f7f5f0?style=flat-square) | Papír | a világos téma háttere |

Betűk: **Nunito** az egész felületen, **Lora** csak a logóban. A részletes rendszer a [DESIGN.md](DESIGN.md)-ben, a termék célja és hangja a [PRODUCT.md](PRODUCT.md)-ben van.

## Technika

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#171c1a', 'primaryTextColor': '#e5ebe8', 'primaryBorderColor': '#2d3531', 'lineColor': '#7a837e', 'edgeLabelBackground': '#202724'}}}%%
flowchart LR
  data[Szótár-adatok<br>kézzel szerkeszthető scriptek] --> reg[data-registry.js<br>window.LEXI_DATA]
  reg --> main[js/main.js]
  html[index.html + style.css] --> main
  main --> mods[ES modulok<br>core · habit · srs · goal<br>practice · stats · library]
  mods --> idb[(IndexedDB)]
  mods <--> fs[(Firestore)]
  kvg[kanjivg/*.json] -. lusta betöltés .-> mods
  sw[sw.js<br>service worker] -. offline .-> html
  classDef ember fill:#f57e4d,stroke:#f57e4d,color:#22110b
  classDef leaf fill:#1d3329,stroke:#52b788,color:#e5ebe8
  class main ember
  class mods,kvg leaf
```

- **Build lépés nélkül:** vanilla JavaScript ES modulokkal, a GitHub Pages közvetlenül a `main` ágból szolgálja ki.
- **FSRS-5** saját megvalósítással (`js/srs/`), **localforage** (IndexedDB), **Firebase** Auth és Firestore.
- **65 automata teszt** Vitesttel és jsdommal: golden master a teljes app kimenetére, adatellenőrzés (N3 szókincs, kandzsi olvasatok, vonássorrend), a felhő szinkron memóriabeli Firestore-ral, a service worker előtöltési listája, és minden gombhoz tartozó kezelő.

```bash
npm install        # csak a fejlesztői eszközök (tesztek, lint)
npm run serve      # http://localhost:5599
npm run check      # lint + az összes teszt
```

> [!NOTE]
> Az `index.html` fájlként megnyitva nem indul el, mert a böngésző az ES modulokat csak szerverről tölti be. A felépítés, a felhő adatformátum, az ütemezés és a tesztek részletes leírása a [docs/FEJLESZTES.md](docs/FEJLESZTES.md)-ben van.

## Források

- **Vonássorrend:** [KanjiVG](https://kanjivg.tagaini.net), © Ulrich Apel, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.hu). A `kanjivg/` mappa adatai ebből származnak, és ugyanezen licenc alatt használhatók tovább.
- **Ismétlésütemezés:** az [FSRS](https://github.com/open-spaced-repetition) algoritmus 5. változata, az alapértelmezett paraméterekkel.
- **Betűk:** Nunito és Lora (Google Fonts, SIL Open Font License).
- **Tárolás és felhő:** [localforage](https://github.com/localForage/localForage), [Firebase](https://firebase.google.com).
