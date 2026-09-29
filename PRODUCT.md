# Product

## Register

product

## Users

Egyetlen fő felhasználó (a fejlesztő maga): magyar anyanyelvű tanuló, aki japánt tanul a **JLPT N3** felé (kana, kandzsi, Dekiru leckék), és mellette angol szókincset bővít. Leginkább **telefonon, egy kézzel** használja (PWA, kezdőképernyőről indítva), gyakran reggel vagy késő este, rövid, 5-15 perces alkalmakban. Asztali gépen ritkábban, szólisták és egyéni gyakorlások összeállítására.

A feladat minden nap ugyanaz: megtartani a konzisztenciát, teljesíteni a napi penzumot (új szavak), és átismételni a már tanultakat.

## Product Purpose

LexiLearn egy offline is működő, felhőben szinkronizált szótanuló, ami a **napi, fegyelmezett szokásra** épít, nem a hajrára. A siker: minden nap visszajön a felhasználó, a napi penzum teljesül (5-10 új szó módonként), és a tudás ténylegesen rögzül (nem csak a számláló nő). A rendszer szándékosan korlátozza a napi új szavakat, hogy ne legyen kiégés.

Fő felületek: Kezdőlap (konzisztencia, napi penzum, új szavak, mai ismétlés), Gyakorlás (szűrhető szótár, egyéni gyakorlás összeállítása), Statisztika (konzisztencia-hőtérkép, tudás-érettség, pontosság, fókuszált idő), Profil.

## Brand Personality

**Nyugodt, fókuszált, meleg.**

Az Apple iOS natív érzetének (lebegő, üvegszerű vezérlők, finom mozgás), a Duolingo szokás-mechanikájának (napi penzum, vastag, egyértelmű gombok, egyetlen ünneplés a cél elérésekor) és az Anki sallangmentes hatékonyságának fúziója. A felület nem kiabál: a jutalom kis, megérdemelt pillanatokban jön, nem mindenhol. A hang barátságos, tegeződő, rövid, magyar.

**Felnőtt, fegyelem-alapú nyelvezet (2026-09-29 óta):** a Duolingo mechanikáját vesszük át, a gamifikált szlengjét és díszítését nem. Szótár: *Konzisztencia (nap)* a "sorozat 🔥" helyett, *Napi penzum* a "mai cél" helyett, *A napi limit teljesítve.* a "Szuper, mindent tudsz! 🎉" helyett, *Napi feladatok* a "küldetések" helyett. A felületen nincs emoji; ikon helyett egyszínű vonalikon.

## Anti-references

- **Túlzsúfolt, gyerekes gamifikáció**: mindenhol badge, villogás, harsány színek, rajzfigurák.
- **Rideg, táblázatos szótár**: Excel-szerű listák, apró betűk, végtelen görgetés a beállításokig.
- **Neon / cyberpunk sötét téma**: lila-kék neonok, erős glow, gradiens szövegek.
- **Emoji-díszítés és gamifikált szleng**: 🔥-sorozat, 🎉, "Szuper!", szivárványszínű küldetések, hiúsági számok nagy ikonokkal.

## Design Principles

1. **Egy kéz, egy hüvelykujj.** Minden gyakori művelet a képernyő alsó harmadából elérhető; a beállítások lenyílnak, nem kell értük görgetni.
2. **A mai adag a lényeg.** Minden képernyő azt szolgálja, hogy ma megtörténjen a tanulás; a mértékletesség (napi limit) funkció, nem hiba.
3. **Jutalom pillanatokban, nem díszítésként.** Ünneplés csak valódi eredménynél (napi cél, hibátlan kör); a többi felület csendes.
4. **Gyorsaság a flow-ban.** Kártyák, húzás, azonnali visszajelzés; semmi nem várakoztat.
5. **Hatékonyság sallang nélkül.** Ahol lehet, a meglévő szűrők, listák és adatok újrahasznosulnak; nincs kétféle módja ugyanannak.
6. **Valódi tudást mérj.** A statisztika a befektetett munkát és a rögzült tudást mutatja (konzisztencia-hőtérkép, tudás-érettség, pontosság, fókuszált idő), nem hiúsági számokat. A kihagyott nap nem büntetés, csak tény.

## Accessibility & Inclusion

- **WCAG 2.2 AA** kontraszt minden szövegre, mindkét témában (a sötét az alapértelmezett).
- A `prefers-reduced-motion` beállítást tiszteletben tartjuk: kártya-repülés, konfetti és csúszó animációk kikapcsolnak vagy egyszerű áttűnésre váltanak.
- Minden húzásos műveletnek van gombos és billentyűzetes alternatívája; érintési célpontok legalább 44px.
