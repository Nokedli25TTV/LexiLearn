import re

def extract_tts_sentences_to_txt(input_filename, output_filename):
    # Reguláris kifejezés, ami megkeresi a ttsSentence: "valami" mintát
    pattern = re.compile(r'ttsSentence:\s*"([^"]+)"')
    
    try:
        # Fájlok megnyitása: a JS olvasásra ('r'), a TXT írásra ('w')
        with open(input_filename, 'r', encoding='utf-8') as infile, \
             open(output_filename, 'w', encoding='utf-8') as outfile:
            
            count = 0
            # Soronkénti beolvasás
            for line in infile:
                match = pattern.search(line)
                if match:
                    # Nyers mondat kinyerése
                    english_sentence = match.group(1)
                    # Beírás a txt fájlba egy sortöréssel a végén
                    outfile.write(english_sentence + '\n')
                    count += 1
                    
        print(f"Kész! Sikeresen kimentve {count} db mondat a(z) '{output_filename}' fájlba.")
                    
    except FileNotFoundError:
        print(f"Hiba: A(z) '{input_filename}' fájl nem található! Győződj meg róla, hogy egy mappában van a szkripttel.")
    except Exception as e:
        print(f"Váratlan hiba történt: {e}")

# Szkript indítása
if __name__ == "__main__":
    # Itt adhatod meg a bemeneti JS és a kimeneti TXT fájl nevét
    extract_tts_sentences_to_txt('english_sentences2.js', 'angol_mondatok.txt')