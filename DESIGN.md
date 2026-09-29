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
---

# Design System: LexiLearn

## 1. Overview

**Creative North Star: "A Nyugodt Dojo"**

Egy japán edzőterem csendje, ahol minden nap ugyanabban az időben, ugyanazzal a figyelemmel gyakorolsz. A felület nem kiabál: tört, zöld árnyalatú sötét háttér, meleg papírszínű világos téma, és egyetlen élénk korall szín, ami mindig azt mutatja, mi a következő lépés. Az Apple iOS natív érzete (lebegő üvegvezérlők, finom, csillapított mozgás), a Duolingo jutalmazó ritmusa (napi sorozat, vastag gombok, egy ünneplés a cél elérésekor) és az Anki hatékonysága (sűrű, sallangmentes lista) egy rendszerben.

A sűrűség kétarcú: a Kezdőlap levegős, egy fő cselekvéssel; a Gyakorlás fül tömör, de minden beállítás lenyíló menüben vagy a lebegő dokkban van, így soha nem kell értük görgetni. A rendszer kifejezetten elutasítja a PRODUCT.md három anti-referenciáját: a túlzsúfolt, gyerekes gamifikációt, a rideg, táblázatos szótárat és a neon / cyberpunk sötét témát.

**Key Characteristics:**
- Sötét az alapértelmezés (esti, reggeli tanulás), meleg világos téma egy kapcsolóra.
- Színkód: korall = cselekvés, zöld = haladás és kijelölés, piros = hiba, arany = csillag.
- Egy kéz, egy hüvelykujj: navigáció és gyakorlás-indítás a képernyő alján, lebegve.
- Üveg csak lebegő vezérlőkön (navigáció, dokk); a tartalom mindig tömör felületen ül.
- Mozgás csak állapotváltásra, 150-500 ms, exponenciális lassulással; `prefers-reduced-motion` alatt kikapcsol.

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

## 3. Typography

**Display / Body Font:** Nunito (sans-serif tartalékkal)
**Brand Font:** Lora (csak a logó "LexiLearn" felirata és néhány örökölt statisztikai szám)

**Character:** Egyetlen kerekített, barátságos humanista sans hordozza a teljes felületet; a hierarchia súlyból (600 / 800 / 900) és méretből jön, nem betűcsaládváltásból. Japán szövegnél a rendszer CJK betűtípusa lép be.

### Hierarchy
- **Display** (900, 28px, 1.15): képernyőcímek ("Gyakorlás", "Profil"), napi sorozat sor.
- **Headline** (900, 26px, 1.2): eredmény-képernyők címe ("5 új szó a zsebedben!").
- **Title** (900, 19px, 1.2): fő gombok felirata, kártyán a jelentés 32px-es változata.
- **Body** (600, 15px, 1.5): leírások, menü-opciók (700, 15px); hosszabb szöveg legfeljebb 60-70ch.
- **Label** (800, 12px, 0.08em, NAGYBETŰ): szekciócímek ("MAI CÉL", "LECKE"), számlálók.

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
Csoportosított lista, 62px-es sorok: kerek pipa, szó (17px, kanji 24px) + jelentés és olvasat, sorozat / pontosság / szint, és külön csillag gomb. Kijelölve a sor zöldes hátteret kap. Lapozva renderel (120 sor adagonként), belső görgetősáv nincs.

### Tanuló kártya (Signature Component)
28px-es kártya, ami követi az ujjat: jobbra "Tudom", balra "Még nem" pecsét jelenik meg a húzás mértékével, küszöb felett kirepül. Koppintásra megfordul (jelentés + példamondat).

## 6. Do's and Don'ts

### Do:
- **Do** tartsd a fő cselekvést a képernyő alsó harmadában, legalább 44x44px érintési felülettel.
- **Do** használd a korallt (#f57e4d) képernyőnként egyetlen fő gombra, mindig sötét (#22110b) felirattal.
- **Do** tedd a beállításokat lenyíló menübe vagy a dokkba; a pilla mutassa a kiválasztott értéket.
- **Do** ünnepelj csak valódi eredménynél (napi cél, hibátlan kör), egyszer naponta.
- **Do** tarts minden szöveget WCAG AA felett mindkét témában, és kapcsold ki a mozgást `prefers-reduced-motion` alatt.

### Don't:
- **Don't** legyen túlzsúfolt, gyerekes gamifikáció: nincs badge-eső, villogás, harsány szín mindenhol.
- **Don't** legyen rideg, táblázatos szótár: nincs Excel-szerű lista apró betűkkel, és nincs végtelen görgetés a beállításokig.
- **Don't** használj neon / cyberpunk sötét témát: lila-kék neon, erős glow, gradiens szöveg tilos.
- **Don't** használj 1px-nél vastagabb színes oldalcsíkot (`border-left`) kártyán vagy listaelemen.
- **Don't** tegyél üveget (backdrop-filter) tartalom-kártyára; csak lebegő vezérlő kaphatja.
- **Don't** nyiss modált, ha elfér inline vagy lenyíló menüben (a lista mentése is a Lista menüben történik).
- **Don't** animálj layout tulajdonságot (width, height, top); transform, opacity, clip-path.
