import re
import os

FAJL_NEVE = "data.js"

def keress_duplikaciokat(fajlnev):
    if not os.path.exists(fajlnev):
        print(f"Hiba: A '{fajlnev}' nem található a mappában.")
        return

    # Szótár a szavak tárolására: kulcs az angol szó, érték a [ (sor_száma, tagek) ] listája
    szavak = {}

    # Reguláris kifejezések az 'en' érték és a 'tags' érték okos kinyerésére
    en_pattern = re.compile(r'en:\s*"([^"]+)"')
    tags_pattern = re.compile(r'tags:\s*\[(.*?)\]')

    # Fájl beolvasása sorról sorra
    with open(fajlnev, 'r', encoding='utf-8') as f:
        for vonalszam, sor in enumerate(f, 1):
            en_match = en_pattern.search(sor)
            tags_match = tags_pattern.search(sor)

            if en_match:
                # Kisbetűssé tesszük, hogy a kis/nagybetű ne számítson
                angol_szo = en_match.group(1).lower() 
                tagek = tags_match.group(1) if tags_match else "NINCS TAG"

                if angol_szo not in szavak:
                    szavak[angol_szo] = []
                
                # Eltároljuk, hogy melyik sorban és milyen taggel találtuk
                szavak[angol_szo].append((vonalszam, tagek))

    # Eredmények kiértékelése és kiírása
    talalt_duplikaciok = 0
    print("--- DUPLIKÁCIÓK KERESÉSE ---")
    
    for szo, elofordulasok in szavak.items():
        # Ha a szó több mint 1 alkalommal szerepel a fájlban
        if len(elofordulasok) > 1:
            # Megnézzük, érintett-e az újonnan hozzáadott "Szótár" tagünk
            van_szotar_tag = any('"Szótár"' in tag for _, tag in elofordulasok)

            if van_szotar_tag:
                talalt_duplikaciok += 1
                print(f"\n[FIGYELEM] A(z) '{szo}' szó többször is szerepel a fájlban:")
                for sor_szam, tag in elofordulasok:
                    print(f"  -> {sor_szam}. sor: tags: [{tag}]")

    if talalt_duplikaciok == 0:
        print("\nNem találtam olyan 'Szótár' címkés szót, ami máshol is szerepelne.")
    else:
        print(f"\nÖsszesen {talalt_duplikaciok} darab szót találtam, ami ütközik!")

if __name__ == "__main__":
    keress_duplikaciokat(FAJL_NEVE)