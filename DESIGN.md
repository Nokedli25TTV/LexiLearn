---
name: LexiLearn
description: Nyugodt, fókuszált napi szótanuló (japán N3 felé, angol mellette), telefonra, egy kézre.
colors:
  forest-primary: "#2d6a4f"
  forest-deep: "#1e5038"
  forest-leaf: "#52b788"
  forest-mist: "#d8f3dc"
  ember-cta: "#f57e4d"
  ember-cta-hover: "#fe8f5b"
  ember-ink: "#22110b"
  terracotta-accent: "#e76f51"
  terracotta-deep: "#c45a3b"
  paper-bg: "#f7f5f0"
  paper-surface: "#ffffff"
  paper-surface-2: "#f0ede6"
  paper-border: "#e4ddd0"
  ink-text: "#1a1a2e"
  ink-text-2: "#5a5470"
  ink-text-3: "#9e99b0"
  night-bg: "#0e1311"
  night-surface: "#171c1a"
  night-surface-2: "#202724"
  night-border: "#2d3531"
  night-text: "#e5ebe8"
  night-text-2: "#acb3af"
  night-text-3: "#7a837e"
  error-red: "#b5272a"
  info-blue: "#1a73e8"
  star-gold: "#de9300"
  chart-line-day: "#0b764d"
  chart-line-night: "#42a878"
  chart-empty-day: "#e6e4e0"
  chart-empty-night: "#292f2c"
  heat-1-day: "#76bd97"
  heat-2-day: "#429d72"
  heat-3-day: "#177c52"
  heat-4-day: "#065939"
  heat-1-night: "#2b684b"
  heat-2-night: "#388963"
  heat-3-night: "#45ac7b"
  heat-4-night: "#61d19a"
  maturity-1-day: "#76bd97"
  maturity-2-day: "#389469"
  maturity-3-day: "#0c6944"
  maturity-1-night: "#357153"
  maturity-2-night: "#45a075"
  maturity-3-night: "#65d49e"
typography:
  display:
    fontFamily: "Nunito, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Nunito, sans-serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1.2
  title:
    fontFamily: "Nunito, sans-serif"
    fontSize: "19px"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "Nunito, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    letterSpacing: "0.08em"
  stat:
    fontFamily: "Nunito, sans-serif"
    fontSize: "32px"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  brand:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "20px"
    fontWeight: 700
rounded:
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-cta:
    backgroundColor: "{colors.ember-cta}"
    textColor: "{colors.ember-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.lg}"
    padding: "16px 18px 16px 22px"
    height: "84px"
  button-cta-hover:
    backgroundColor: "{colors.ember-cta-hover}"
    textColor: "{colors.ember-ink}"
  button-secondary:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.lg}"
    height: "72px"
  button-done:
    backgroundColor: "{colors.night-text}"
    textColor: "{colors.night-surface}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "42px"
  pill-filter:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px 0 16px"
    height: "40px"
  pill-filter-active:
    backgroundColor: "{colors.forest-mist}"
    textColor: "{colors.forest-deep}"
    rounded: "{rounded.pill}"
  chip:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  search-field:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "50px"
  word-row:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text}"
    padding: "10px 4px 10px 14px"
    height: "62px"
  kpi-tile:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.night-text}"
    typography: "{typography.stat}"
    padding: "16px 16px 14px"
  next-bar-button:
    backgroundColor: "{colors.ember-cta}"
    textColor: "{colors.ember-ink}"
    rounded: "{rounded.md}"
    height: "56px"
---

# Design System: LexiLearn

## 1. Overview

**Creative North Star: "A Nyugodt Dojo"**

Egy japán edzőterem csendje, ahol minden nap ugyanabban az időben, ugyanazzal a figyelemmel gyakorolsz. A felület nem kiabál: tört, zöld árnyalatú sötét háttér, meleg papírszínű világos téma, és egyetlen élénk korall szín, ami mindig azt mutatja, mi a következő lépés. Az Apple iOS natív érzete (lebegő üvegvezérlők, finom, csillapított mozgás), a Duolingo szokás-mechanikája (napi penzum, vastag gombok, egy ünneplés a cél elérésekor, gamifikált szleng nélkül) és az Anki hatékonysága (sűrű, sallangmentes lista) egy rendszerben.

A sűrűség kétarcú: a Kezdőlap levegős, egy fő cselekvéssel; a Gyakorlás fül tömör, de minden beállítás lenyíló menüben vagy a lebegő dokkban van, így soha nem kell értük görgetni. A rendszer kifejezetten elutasítja a PRODUCT.md három anti-referenciáját: a túlzsúfolt, gyerekes gamifikációt, a rideg, táblázatos szótárat és a neon / cyberpunk sötét témát.

**Key Characteristics:**
- Felnőtt, emoji-mentes nyelvezet: Konzisztencia, Napi penzum, A napi limit teljesítve.
- Sötét az alapértelmezés (esti, reggeli tanulás), meleg világos téma egy kapcsolóra.
- Színkód: korall = cselekvés, zöld = haladás és kijelölés, piros = hiba, arany = csillag.
- Egy kéz, egy hüvelykujj: navigáció és gyakorlás-indítás a képernyő alján, lebegve.
- Üveg csak lebegő vezérlőkön (navigáció, dokk); a tartalom mindig tömör felületen ül.
- Mozgás csak állapotváltásra, 150-500 ms, exponenciális lassulással; `prefers-reduced-motion` alatt kikapcsol. Egyetlen kivétel a kandzsi vonássorrend rajzolása, ahol a mozgás maga a tartalom.

## 2. Colors

Visszafogott stratégia (tört semlegesek + egy élénk cselekvésszín), amit a zöld haladás-szín kísér.

### Primary
- **Parázs korall** (#f57e4d / oklch(0.72 0.16 42)): az egyetlen "nyomd meg" szín. Új szavak tanulása, Indítás, a napi cél elérése után a mai ismétlés. Mindig sötét felirattal (**Parázs tinta**, #22110b), 6,9:1 kontraszt.
- **Erdőzöld** (#2d6a4f, világos kiemelésben #52b788): haladás és kijelölés. Napi cél sáv, kijelölt sor pipája, aktív szűrő pilla, navigáció lencse, aktív szegmens.

### Secondary
- **Terrakotta** (#e76f51, mélyebb: #c45a3b): örökölt akcentus a logóban és a 3D kártya hátoldalán; világos témában az "új szavak száma" is ezzel íródik, mert a korall fehéren nem éri el az AA-t.

### Neutral
- **Éjszakai erdő háttér** (#0e1311 / oklch(0.18 0.008 165)): sötét téma háttere, a márka zöldje felé tört.
- **Éjszakai felület** (#171c1a) és **Éjszakai felület 2** (#202724): listák, kártyák, menük; sávok és beágyazott mezők.
- **Éjszakai szegély** (#2d3531): 1px elválasztók, pillák kerete.
- **Holdfény szöveg** (#e5ebe8), **Köd** (#acb3af), **Pala** (#7a837e): elsődleges, másodlagos, harmadlagos szöveg; a Pala a háttéren 4,8:1.
- **Papír** (#f7f5f0), **Tiszta lap** (#ffffff), **Pergamen** (#f0ede6), **Pergamen szegély** (#e4ddd0): világos téma rétegei.
- **Tinta** (#1a1a2e), **Szilva szürke** (#5a5470), **Lila köd** (#9e99b0): világos téma szövegei.

### Named Rules
**The One Ember Rule.** Képernyőnként egy korall elem. Ha kettő lenne, az egyik nem fő cselekvés: szürke vagy zöld lesz belőle.

**The Tinted Night Rule.** Sötét módban tiszta szürke tilos; minden semleges az erdőzöld árnyalat felé tört (chroma 0,008-0,012, hue 165).

### Adatábrák
- **Egy vezérszín:** minden ábra az erdőzöld egyetlen árnyalatsorából dolgozik; szivárvány, kategóriaszínek, státuszszínek (piros / sárga) az ábrákon tilosak.
- **Hőtérkép-skála** (5 fokozat: üres + 4 zöld) és **érettség-skála** (3 zöld): ordinális, a `validate_palette.js --ordinal` mindkét témában PASS (monoton világosság, ΔL ≥ 0,06, a legvilágosabb / legsötétebb fok ≥ 2:1 a kártya felületén). Sötét módban a "több" a világosabb.
- **Vonal / oszlop:** nappal #0b764d, éjjel #42a878 (a sötét sávban, ≥ 3:1 kontraszt).
- Az "üres nap" cella szándékosan halk (1,26:1): a nincs-adat háttér, nem jel.

**The One Hue Data Rule.** Egy ábra, egy szín. Ha valamit ki kell emelni, világosság vagy vastagság, nem új szín.

## 3. Typography

**Display / Body Font:** Nunito (sans-serif tartalékkal)
**Brand Font:** Lora (csak a logó "LexiLearn" felirata és néhány örökölt statisztikai szám)

**Character:** Egyetlen kerekített, barátságos humanista sans hordozza a teljes felületet; a hierarchia súlyból (600 / 800 / 900) és méretből jön, nem betűcsaládváltásból. Japán szövegnél a rendszer CJK betűtípusa lép be.

### Hierarchy
- **Display** (900, 28px, 1.15): képernyőcímek ("Gyakorlás", "Statisztika", "Profil").
- **Headline** (900, 26px, 1.2): eredmény-képernyők címe ("5 új szó a zsebedben!").
- **Title** (900, 19px, 1.2): fő gombok felirata, kártyán a jelentés 32px-es változata.
- **Body** (600, 15px, 1.5): leírások, menü-opciók (700, 15px); hosszabb szöveg legfeljebb 60-70ch.
- **Label** (800, 12px, 0.08em, NAGYBETŰ): szekciócímek ("NAPI PENZUM", "LECKE"), számlálók.
- **Stat** (300, 32-34px, 1.1, -0.01em): a nagy számok (KPI sáv, Kezdőlap konzisztencia). Vékony, nyugodt számjegyek, arányos (nem tabuláris) számokkal; mellette 15px-es 600-as mértékegység ("nap", "/ 30").

**The Quiet Numbers Rule.** A nagy számok könnyű (300) súlyúak; a hangsúlyt a méret adja, nem a vastagság. Tabuláris számjegy csak oszlopba rendezett értékeknél (táblázat, tengely).

### Named Rules
**The 16px Input Rule.** Minden szövegbeviteli mező legalább 16px, különben iOS ráközelít fókuszkor.

**The No-Serif-Labels Rule.** Lora soha nem kerül gombra, címkére vagy adatra.

## 4. Elevation

Hibrid rendszer: a tartalom tonális rétegekkel él (háttér → felület → felület 2), árnyék nélkül; árnyékot és üveget csak a lebegő réteg kap. A mélység azt jelzi, mi van a tartalom fölött, nem díszít.

### Shadow Vocabulary
- **Üveg lebegés** (`box-shadow: inset 0 1px 0 var(--glass-highlight), 0 18px 40px -14px oklch(0.06 0.01 165 / 0.8), 0 4px 12px oklch(0.06 0.01 165 / 0.35)`): navigáció és gyakorlás dokk, `backdrop-filter: blur(22px) saturate(180%)`-szal.
- **Menü** (`box-shadow: var(--shadow-lg)`): lenyíló menük, tanuló kártyák.
- **Korall parázs** (`box-shadow: 0 14px 30px -14px oklch(0.72 0.16 42 / 0.35)`): csak a fő korall gomb alatt.

### Named Rules
**The Glass Is For Floating Rule.** Üveg kizárólag a tartalom fölött lebegő vezérlőn lehet (alsó navigáció, dokk). Kártyán, listán, menün tilos; ott tömör felület kell az olvashatósághoz.

## 5. Components

### Buttons
- **Shape:** nagyon lekerekített (fő gomb 22px, dokk gombok 16px, menü gombok 12px).
- **Primary (korall):** teljes szélesség a Kezdőlapon, min. 84px magas, sötét felirat, jobb oldalon kerek nyíl. Nyomásra 0,98-ra zsugorodik (160ms).
- **Secondary:** felület háttér, 1px szegély, 72px; letiltva halványított címmel és magyarázó alcímmel ("Tanulj ma új szót…").
- **Kész / Mentés:** fordított semleges (szöveg színű háttér, felület színű felirat), minden témában erős kontraszt.
- **Hover / Focus:** hover csak `(hover: hover)` eszközön; fókuszgyűrű 3px erdőzöld, 2px eltolással.

### Chips
- **Szűrő pilla:** 40px magas kapszula, jobb oldalt lefelé mutató nyíl, ami nyitáskor megfordul. Aktívan erdő-köd háttér és zöld felirat, a kiválasztott érték a címkében ("Dekiru 3. lecke").
- **Választó chip** (témakör, szint, sorrend): 40px kapszula, mellette halvány darabszám; kijelölve zöld.

### Cards / Containers
- **Corner Style:** 20-28px (lista 20px, menü 22px, tanuló kártya 28px).
- **Background:** felület (#171c1a sötétben), szegély 1px.
- **Shadow Strategy:** nyugalomban nincs; lásd Elevation.
- **Internal Padding:** 14-18px.

### Inputs / Fields
- **Style:** 50px magas kereső, 16px lekerekítés, bal oldali nagyító ikon, 16px betű.
- **Focus:** zöld szegély + 3px halvány zöld gyűrű.
- **Disabled:** 60% átlátszóság és magyarázó placeholder.

### Navigation
- **Lebegő üveg kapszula:** 12px-re a képernyő széleitől, 10px + safe area a képernyő aljától, 64px magas, teljesen lekerekített. Négy elem (Kezdőlap, Gyakorlás, Statisztika, Profil), ikon + 11px címke. Az aktív elem mögött üveg lencse csúszik (460ms, transform). Asztalon középre húzott, 420px széles. Gyakorlás közben rejtve.

### Gyakorlás dokk (Signature Component)
Lebegő üveg sáv a navigáció fölött: kijelölt szavak száma (törlés ×-szel), beállítás-összefoglaló ("Klasszikus · 20") és korall Indítás gomb. A beállítások (típus, irány, kérdésszám, sorrend) felfelé nyílnak ki a dokkból, háttér-elsötétítéssel. Asztalon ragadós oldalpanel, a beállítások mindig nyitva.

### Szólista sor (Signature Component)
Csoportosított lista, 62px-es sorok: kerek pipa, szó (17px, kanji 24px) + jelentés és olvasat, egymás utáni helyes válaszok ("3×") / pontosság / szint, és külön csillag gomb. Kijelölve a sor zöldes hátteret kap. Lapozva renderel (120 sor adagonként), belső görgetősáv nincs.

### Statisztika dashboard (Signature Component)
- **KPI sáv:** egyetlen felület 1px-es elválasztókkal (nem kártyarács), mobilon 2×2, asztalon 4 oszlop: Konzisztencia, Aktív napok (30), Rögzült szavak, Fókusz a héten. Címke 13px 700, érték a Stat stílusban, alatta 12px-es magyarázat vagy előző heti eltérés (▲ zöld / ▼ semleges, mindig nyíllal, nem csak színnel).
- **Konzisztencia hőtérkép:** GitHub-stílusú naptárháló, 13px-es cellák 3px réssel, a hetek száma a szélességhez igazodik (mobilon ~19, asztalon ~42). Hónap- és napcímkék (H, Sz, P), a mai nap 1,5px-es kerettel. Skálajelmagyarázat: "Kevesebb … Több".
- **Tudás-érettség:** 20px magas, 100%-os sáv három szakasszal (Ismerkedés, Gyakorlás alatt, Rögzült), 2px felületrés köztük, csak a jobb vége lekerekített; alatta jelmagyarázat darabszámmal és aránnyal.
- **Pontosság (14 nap):** 2px-es vonal, 8px-es pontok 2px felület-gyűrűvel, kihagyott napnál megszakad (nincs terület-kitöltés), 80%-os referencia hajszálvonal, végérték-címke. Crosshair tooltip.
- **Fókuszált idő (14 nap):** legfeljebb 24px széles oszlopok, 4px-es lekerekített tetővel, szögletes alappal; csak a csúcsérték kap címkét.
- **Tooltip:** fordított semleges buborék, az érték elöl (15px 800), a címke utána; `textContent`-tel épül.
- **Táblázatos nézet:** minden ábra alatt "Adatok táblázatban" nyitható `<details>`.

### Rögzített alsó műveletsáv
- Gyakorlás közben a "Tovább" (hibás válasz után) a képernyő aljára rögzül: teljes szélesség, 56px, korall.
- A kör vége képernyő gombjai és a modálok műveletei mobilon a lap aljára ragadnak (sticky), így kis kijelzőn sem kerülnek a képernyő alá. A modálok mobilon alulról nyíló lapok.

### Kör vége (V13.8)
A tanulás / ismétlés vége képernyők családja, közös komponensekből, egyedi stílus nélkül:
- **Cím és alcím:** Nunito 900, 26px ("1. kör vége", "Hibátlan kör"), alatta egy mondat 15px-en ("Stabil tudás.").
- **Pontosság:** a Kezdőlap "Napi penzum" kártyája (`.goal`): balra "PONTOSSÁG" címke, jobbra a százalék, alatta egyszínű zöld sáv. Piros szakasz, körgrafikon és "hős-szám" nincs.
- **Számsor:** a Statisztika KPI sávja 3 oszlopban (Helyes, Hibás, Idő), vékony számokkal; a mértékegység kisebb ("14 mp", "2:05 p"). Színes (zöld / piros / kék) doboz nincs.
- **Hibás szavak:** "Következő körbe kerül" (gyors ismétlésnél "Elsőre nem ment") részletcím, alatta semleges lista (kana balra, jelentés jobbra), piros háttér nélkül.
- **Műveletek alul, a hüvelykujj alatt:** ha van következő kör, az a korall fő gomb a szavak számával ("Következő kör · 3 szó"), mellette csendes "Befejezés"; ha nincs, a "Befejezés" a korall gomb.
- A kérdés fölötti irány-felirat csak szöveg ("KANA → MAGYAR"): külső szerverről betöltött kép (zászló) offline nem működik, ezért tilos.

### Ismétlő kártya és értékelő sor (Signature Component, V13.5)
- **Kártya:** a tanuló kártya alakja (28px), elöl a szó és az olvasat, címke nélkül (csak az "Újra" kártya kap szürke "ÚJRA" pillát). Koppintásra megfordul: jelentés, olvasatok, példamondat.
- **Mutasd a jelentést:** fordított semleges gomb (szöveg színű háttér), 58px, mellette a kiejtés gomb. A képernyőn nincs korall: a korall a Kezdőlap fő cselekvéséé.
- **Értékelő sor:** csak a jelentés megnézése után jelenik meg, ugyanazon a helyen, ahol a "Mutasd" gomb volt (nincs elrendezés-ugrás). Négy egyforma, 60px magas gomb: Újra / Nehéz / Jó / Könnyű, alattuk a következő ismétlésig hátralévő idő ("ma", "3 n", "2 hó"), tabuláris számokkal. Csak a "Jó" színes (erdő-köd háttér, zöld felirat); a többi semleges, a piros hibaszín itt tilos (az "Újra" nem hiba, hanem a tanulás része).
- **Húzás:** balra Újra, jobbra Jó, de csak a jelentés megnézése után; addig a pecsétek sem látszanak. Billentyűzet: Szóköz fordít, 1-4 értékel.
- **Összegzés:** "N szó átismételve", alatta a következő lépés (még esedékes / új szavak) korallal, és egy csendes sor az értékelések eloszlásáról ("Újra 1 · Jó 12"). Konfetti nincs: az ismétlés napi rutin, nem ünnepi pillanat.

### JLPT haladás (Signature Component, V13.6)
- **Mérföldkő-sáv:** vízszintes sáv, amelynek szegmensei a mérföldkövek (szókincs: N5-N4 100-anként, N3 250-enként; kandzsi 25 / 50 / 50); a szegmens szélessége arányos a darabszámmal, így a sáv lineáris. 2px rés a szegmensek között, 3px a szintek határán; alatta szintjelek (N5, N4, N3) a határpontoknál, elért szintnél erősebb szürkével.
- **Két réteg, egy skála:** üres = `--hm-0`, megtanult = `--mat-1`, rögzült (21+ napos ismétlési köz) = `--mat-3`. Új szín nincs: a már validált érettség-skálát használja. A jelmagyarázat "halványabb / erősebb zöld" (sötétben a rögzült a világosabb, ezért a "sötétebb" szó tilos).
- **Statisztika kártya:** a lap tetején (a KPI sáv fölött), csak japán és kandzsi módban; két sáv (Szókincs, Kandzsi) számmal és százalékkal, alatta link a Haladás képernyőre.
- **Haladás képernyő:** a Statisztika alképernyője (a navigációban a Statisztika marad kiemelve), vissza gombbal. Célidőpont pilla alakú dátummezővel, "N nap van hátra"; soronként nagy szám (Stat stílus), sáv, "X rögzült · Y még ismétlés alatt"; tempó-panel (Hátravan, Szükséges tempó, 14 napos átlag, A mostani tempóval) és egy őszinte állapotmondat; mérföldkő lista (utolsó kettő teljesített dátummal, az aktuális "még N", a következő kettő), a teljes lista táblázatban; szótár-lefedettség.
- **Kezdőlap sor:** a cselekvések alatt egy csendes, 48px-es sor: "N3 FELÉ szókincs 24% · kandzsi 20%", nyíllal, a Haladás képernyőre visz.
- **Mérföldkő elérése:** a tanulás végén egy zöld-köd pilla ("Mérföldkő: 150 kandzsi"); konfetti nincs.

### Kezdőlap cselekvések (V13.5)
- Ha van esedékes ismétlés, az "Ismétlés" a korall fő gomb (darabszám chippel, "kb. N perc"), az "Új szavak tanulása" alatta másodlagos (felület háttér, nyíl nélkül). Ha nincs esedékes, az új szavak a fő gomb.
- Alattuk egy csendes, középre zárt előrejelző sor: "Holnap 15 · a következő 7 napban 45" (13px, a számok 800-as súllyal). Így nincs meglepetés-hegy.

### Tanuló kártya (Signature Component)
28px-es kártya, ami követi az ujjat: jobbra "Tudom", balra "Még nem" pecsét jelenik meg a húzás mértékével, küszöb felett kirepül. Koppintásra megfordul (jelentés + példamondat; kandzsi módban fölötte a vonássorrend).

### Kandzsi vonássorrend (Signature Component, V13.9)
- **Helye:** kandzsi módban a tanuló és az ismétlő kártya hátoldalán, a jelentés fölött (a kis kandzsi-sor helyén). Az előoldalon nincs: ott a felidézés a feladat.
- **Írásgyakorló négyzet:** `clamp(104px, 18vh, 136px)`, 16px lekerekítés, Felület 2 háttér, szaggatott középvonalak (十) Szegély színnel. Benne a kandzsi halvány teljes alakja (a szövegszín 16%-a a felületen), fölötte a tintaszínű vonások (3,4 egység a KanjiVG 109-es rácsán, kerek végek és illesztések).
- **Rajzolás:** megfordításkor (380 ms múlva, a fordulás közepén) a vonások sorban megrajzolódnak, állandó tempóval: a hosszabb vonás tovább tart (240-620 ms, köztük 80 ms szünet), a sok vonásos kandzsi is legfeljebb 5,2 s. Az épp rajzolódó vonás erdőzöld, utána tintaszínre vált; a sorszám a vonás kezdetén jelenik meg. Ez az app egyetlen hosszabb mozgása: a mozgás itt maga az információ (sorrend és irány), és semmit nem blokkol, közben is lehet húzni és értékelni.
- **Sorszámok:** Nunito 800, 8,5 egység, Köd színnel, felület színű körvonallal (`paint-order: stroke`), így a vonásokon átfedve is olvasható. A helyük a KanjiVG-ből jön.
- **Alatta:** "N VONÁS" címke (Label stílus, Köd) és egy csendes, 32px-es újrajátszás ikon (44px érintési felület, a kártya húzását nem indítja). Korall nincs.
- **Csökkentett mozgás:** a kész, számozott ábra látszik animáció és újrajátszás gomb nélkül.
- **Betöltés:** amíg az adat nincs meg (vagy egy saját kandzsihoz nincs), a négyzetben a kandzsi betűként áll: a hátoldal sosem üres. Az adat szintenként lustán töltődik, a service worker külön cache-ben tartja (offline is megvan).
- **Hosszú tartalom:** a hátoldal auto margóval zár középre, így ha nem fér ki, felülről görgethető (a teteje nem vágódik le).

## 6. Do's and Don'ts

### Do:
- **Do** tartsd a fő cselekvést a képernyő alsó harmadában, legalább 44x44px érintési felülettel.
- **Do** használd a korallt (#f57e4d) képernyőnként egyetlen fő gombra, mindig sötét (#22110b) felirattal.
- **Do** tedd a beállításokat lenyíló menübe vagy a dokkba; a pilla mutassa a kiválasztott értéket.
- **Do** ünnepelj csak valódi eredménynél (napi cél, hibátlan kör), egyszer naponta.
- **Do** tarts minden szöveget WCAG AA felett mindkét témában, és kapcsold ki a mozgást `prefers-reduced-motion` alatt.
- **Do** használd a felnőtt szótárt: Konzisztencia (nap), Napi penzum, A napi limit teljesítve., Napi feladatok.
- **Do** futtasd a `validate_palette.js`-t minden új ábraszínre (mindkét témában), és adj minden ábrának táblázatos párt.
- **Do** ellenőrizd az új képernyőket 320×640-en és 375×667-en: semmi nem lóghat ki vízszintesen, és a fő gomb görgetés nélkül elérhető.
- **Do** tüntesd fel a külső adatok forrását és licencét a Profil Források részén (KanjiVG, CC BY-SA 3.0).

### Don't:
- **Don't** legyen túlzsúfolt, gyerekes gamifikáció: nincs badge-eső, villogás, harsány szín mindenhol.
- **Don't** legyen rideg, táblázatos szótár: nincs Excel-szerű lista apró betűkkel, és nincs végtelen görgetés a beállításokig.
- **Don't** használj neon / cyberpunk sötét témát: lila-kék neon, erős glow, gradiens szöveg tilos.
- **Don't** használj 1px-nél vastagabb színes oldalcsíkot (`border-left`) kártyán vagy listaelemen.
- **Don't** tegyél üveget (backdrop-filter) tartalom-kártyára; csak lebegő vezérlő kaphatja.
- **Don't** nyiss modált, ha elfér inline vagy lenyíló menüben (a lista mentése is a Lista menüben történik).
- **Don't** animálj layout tulajdonságot (width, height, top); transform, opacity, clip-path.
- **Don't** tegyél emojit a felületre (🔥, 🎉, 🎯, 📊): nincs emoji-díszítés és gamifikált szleng; ikon helyett egyszínű vonalikon.
- **Don't** használj kettős tengelyt, szivárvány skálát vagy státuszszínt adatsor színeként; ne tegyél számot minden pontra.
- **Don't** rajzolj terület-kitöltést megszakadó (hiányos napokat tartalmazó) vonal alá.
