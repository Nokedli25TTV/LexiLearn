import re
from collections import Counter

def parse_javascript_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Összes leckeszám megkeresése (DEKIRU_LX alapján)
    lesson_numbers = sorted(list(set(re.findall(r'DEKIRU_L(\d+)', content))))
    
    print("=== JAPÁN NYELVI ADATBÁZIS ELLENŐRZÉSE ===\n")

    for num in lesson_numbers:
        # --- SZAVAK KINYERÉSE (DEKIRU_LX) ---
        # Megkeressük az adott lecke tömbjét
        vocab_block_match = re.search(f'const DEKIRU_L{num} = \[(.*?)\];', content, re.DOTALL)
        if not vocab_block_match:
            continue
        
        vocab_block = vocab_block_match.group(1)
        # Kiszedjük a 'kana' értékeket (pl. kana: 'わたし')
        words_in_vocab = re.findall(r"kana:\s*['\"](.*?)['\"]", vocab_block)

        # --- MONDATOK KINYERÉSE (JAPANESE_SENTENCES_LX) ---
        sent_block_match = re.search(f'const JAPANESE_SENTENCES_L{num} = \[(.*?)\];', content, re.DOTALL)
        
        if not sent_block_match:
            print(f"--- {num}. LECKE: MONDATOK HIÁNYOZNAK ---")
            continue

        sent_block = sent_block_match.group(1)
        # Kiszedjük a 'baseWord' értékeket a mondatokból
        sentence_base_words = re.findall(r"baseWord:\s*['\"](.*?)['\"]", sent_block)
        word_counts = Counter(sentence_base_words)

        # --- ELLENŐRZÉS ÉS STATISZTIKA ---
        ok_count = 0
        missing = []
        half_ready = []
        over_limit = []
        unknown_in_sentences = []

        # Ellenőrizzük a szótár szavait a mondatok között
        for word in words_in_vocab:
            count = word_counts.get(word, 0)
            if count == 2:
                ok_count += 1
            elif count == 0:
                missing.append(word)
            elif count == 1:
                half_ready.append(word)
            else:
                over_limit.append(f"{word} ({count} db)")

        # Ellenőrizzük, van-e elírás (olyan baseWord a mondatnál, ami nincs a szótárban)
        vocab_set = set(words_in_vocab)
        for word in word_counts:
            if word not in vocab_set:
                unknown_in_sentences.append(word)

        # --- RIPORT ---
        total = len(words_in_vocab)
        progress = (ok_count / total) * 100 if total > 0 else 0
        
        print(f"--- {num}. LECKE ---")
        print(f"Haladás: {ok_count}/{total} szó kész ({progress:.1f}%)")
        
        if missing:
            print(f"  ❌ Nincs mondat (0/2): {', '.join(missing)}")
        if half_ready:
            print(f"  ⚠️ Csak egy mondat van (1/2): {', '.join(half_ready)}")
        if over_limit:
            print(f"  ❗ Túl sok mondat (3+): {', '.join(over_limit)}")
        if unknown_in_sentences:
            print(f"  ❓ Elírás gyanúja (nincs a szótárban): {', '.join(unknown_in_sentences)}")
        
        if not (missing or half_ready or over_limit or unknown_in_sentences):
            print("  ✅ Hibátlan!")
        print("-" * 40)

# Futtatás
if __name__ == "__main__":
    # Itt add meg a fájlod nevét. 
    # Fontos: a fájlban benne kell lennie a DEKIRU_LX és a JAPANESE_SENTENCES_LX résznek is.
    parse_javascript_data('dekiru.js')