/* ══════════════════════════════════════════════════════
   LexiLearn – Japán Szavak Adatbázis (Kana modul)
   Minden szó: kana, romaji, hu (magyar), tags, jlpt
══════════════════════════════════════════════════════ */
const JAPANESE_WORDS = [
  // ─── N5 – Alapszavak / Üdvözlések ────────────────
  { kana: 'ありがとう',     romaji: 'arigatou',    hu: 'köszönöm',               tags: ['alapszavak','udvariasság'],      jlpt: 'N5' },
  { kana: 'おはようございます', romaji: 'ohayou gozaimasu', hu: 'jó reggelt (formális)', tags: ['köszönések','alapszavak'],     jlpt: 'N5' },
  { kana: 'こんにちは',     romaji: 'konnichiwa',  hu: 'jó napot / szia',         tags: ['köszönések','alapszavak'],      jlpt: 'N5' },
  { kana: 'こんばんは',     romaji: 'konbanwa',    hu: 'jó estét',                tags: ['köszönések'],                   jlpt: 'N5' },
  { kana: 'さようなら',     romaji: 'sayounara',   hu: 'viszontlátásra',          tags: ['köszönések','alapszavak'],      jlpt: 'N5' },
  { kana: 'すみません',     romaji: 'sumimasen',   hu: 'elnézést / bocsánat',     tags: ['udvariasság','alapszavak'],     jlpt: 'N5' },
  { kana: 'おやすみなさい', romaji: 'oyasumi nasai', hu: 'jó éjszakát',           tags: ['köszönések'],                   jlpt: 'N5' },
  { kana: 'はい',           romaji: 'hai',         hu: 'igen',                    tags: ['alapszavak'],                   jlpt: 'N5' },
  { kana: 'いいえ',         romaji: 'iie',         hu: 'nem',                     tags: ['alapszavak'],                   jlpt: 'N5' },

  // ─── N5 – Ételek / Italok ─────────────────────────
  { kana: 'みず',           romaji: 'mizu',        hu: 'víz',                     tags: ['ételek','alapszavak'],          jlpt: 'N5' },
  { kana: 'たべもの',       romaji: 'tabemono',    hu: 'étel',                    tags: ['ételek'],                       jlpt: 'N5' },
  { kana: 'のみもの',       romaji: 'nomimono',    hu: 'ital',                    tags: ['ételek'],                       jlpt: 'N5' },
  { kana: 'ごはん',         romaji: 'gohan',       hu: 'rizs / étkezés',          tags: ['ételek'],                       jlpt: 'N5' },
  { kana: 'パン',           romaji: 'pan',         hu: 'kenyér',                  tags: ['ételek'],                       jlpt: 'N5' },
  { kana: 'おちゃ',         romaji: 'ocha',        hu: 'tea',                     tags: ['ételek','italok'],              jlpt: 'N5' },

  // ─── N5 – Állatok ────────────────────────────────
  { kana: 'いぬ',           romaji: 'inu',         hu: 'kutya',                   tags: ['állatok'],                      jlpt: 'N5' },
  { kana: 'ねこ',           romaji: 'neko',        hu: 'macska',                  tags: ['állatok'],                      jlpt: 'N5' },
  { kana: 'さかな',         romaji: 'sakana',      hu: 'hal',                     tags: ['állatok','ételek'],             jlpt: 'N5' },
  { kana: 'とり',           romaji: 'tori',        hu: 'madár / csirke',          tags: ['állatok'],                      jlpt: 'N5' },

  // ─── N5 – Közlekedés / Helyek ─────────────────────
  { kana: 'くるま',         romaji: 'kuruma',      hu: 'autó',                    tags: ['közlekedés'],                   jlpt: 'N5' },
  { kana: 'でんしゃ',       romaji: 'densha',      hu: 'vonat',                   tags: ['közlekedés','utazás'],          jlpt: 'N5' },
  { kana: 'えき',           romaji: 'eki',         hu: 'pályaudvar',              tags: ['közlekedés','helyek'],          jlpt: 'N5' },
  { kana: 'みせ',           romaji: 'mise',        hu: 'bolt / üzlet',            tags: ['helyek','mindennapi élet'],     jlpt: 'N5' },

  // ─── N5 – Iskola / Munka ─────────────────────────
  { kana: 'がっこう',       romaji: 'gakkou',      hu: 'iskola',                  tags: ['iskola'],                       jlpt: 'N5' },
  { kana: 'せんせい',       romaji: 'sensei',      hu: 'tanár / mester',          tags: ['iskola','munka'],               jlpt: 'N5' },
  { kana: 'ほん',           romaji: 'hon',         hu: 'könyv',                   tags: ['iskola','tárgyak'],             jlpt: 'N5' },
  { kana: 'えんぴつ',       romaji: 'enpitsu',     hu: 'ceruza',                  tags: ['iskola','tárgyak'],             jlpt: 'N5' },

  // ─── N5 – Kapcsolatok / Család ────────────────────
  { kana: 'ともだち',       romaji: 'tomodachi',   hu: 'barát',                   tags: ['kapcsolatok'],                  jlpt: 'N5' },
  { kana: 'かぞく',         romaji: 'kazoku',      hu: 'család',                  tags: ['kapcsolatok'],                  jlpt: 'N5' },
  { kana: 'おかあさん',     romaji: 'okaasan',     hu: 'édesanya',                tags: ['kapcsolatok'],                  jlpt: 'N5' },
  { kana: 'おとうさん',     romaji: 'otousan',     hu: 'édesapa',                 tags: ['kapcsolatok'],                  jlpt: 'N5' },

  // ─── N5 – Természet ──────────────────────────────
  { kana: 'やま',           romaji: 'yama',        hu: 'hegy',                    tags: ['természet','földrajz'],         jlpt: 'N5' },
  { kana: 'かわ',           romaji: 'kawa',        hu: 'folyó',                   tags: ['természet','földrajz'],         jlpt: 'N5' },
  { kana: 'うみ',           romaji: 'umi',         hu: 'tenger',                  tags: ['természet','földrajz'],         jlpt: 'N5' },
  { kana: 'そら',           romaji: 'sora',        hu: 'ég / égbolt',             tags: ['természet'],                    jlpt: 'N5' },
  { kana: 'かぜ',           romaji: 'kaze',        hu: 'szél',                    tags: ['természet','időjárás'],         jlpt: 'N5' },
  { kana: 'あめ',           romaji: 'ame',         hu: 'eső',                     tags: ['természet','időjárás'],         jlpt: 'N5' },

  // ─── N4 – Munka / Élet ────────────────────────────
  { kana: 'しごと',         romaji: 'shigoto',     hu: 'munka / munkahely',       tags: ['munka'],                        jlpt: 'N4' },
  { kana: 'かいしゃ',       romaji: 'kaisha',      hu: 'vállalat / cég',          tags: ['munka','gazdaság'],             jlpt: 'N4' },
  { kana: 'びょういん',     romaji: 'byouin',      hu: 'kórház',                  tags: ['egészség','helyek'],            jlpt: 'N4' },
  { kana: 'くすり',         romaji: 'kusuri',      hu: 'gyógyszer',               tags: ['egészség'],                     jlpt: 'N4' },
  { kana: 'えいが',         romaji: 'eiga',        hu: 'film / mozi',             tags: ['kultúra','szórakozás'],         jlpt: 'N4' },
  { kana: 'おんがく',       romaji: 'ongaku',      hu: 'zene',                    tags: ['kultúra','szórakozás'],         jlpt: 'N4' },
  { kana: 'りょこう',       romaji: 'ryokou',      hu: 'utazás / kirándulás',     tags: ['utazás'],                       jlpt: 'N4' },
  { kana: 'ひこうき',       romaji: 'hikouki',     hu: 'repülő',                  tags: ['utazás','közlekedés'],          jlpt: 'N4' },
  { kana: 'かいもの',       romaji: 'kaimono',     hu: 'vásárlás / bevásárlás',   tags: ['mindennapi élet'],              jlpt: 'N4' },
  { kana: 'でんわ',         romaji: 'denwa',       hu: 'telefon',                 tags: ['kommunikáció','tárgyak'],       jlpt: 'N4' },
  { kana: 'てがみ',         romaji: 'tegami',      hu: 'levél',                   tags: ['kommunikáció'],                 jlpt: 'N4' },
  { kana: 'じかん',         romaji: 'jikan',       hu: 'idő / óra',               tags: ['alapszavak'],                   jlpt: 'N4' },

  // ─── N3 – Fejlettebb szókincs ─────────────────────
  { kana: 'かんがえる',     romaji: 'kangaeru',    hu: 'gondolni / átgondolni',   tags: ['pszichológia'],                 jlpt: 'N3' },
  { kana: 'かんじょう',     romaji: 'kanjou',      hu: 'érzés / érzelem',         tags: ['érzelmek','pszichológia'],      jlpt: 'N3' },
  { kana: 'じゆう',         romaji: 'jiyuu',       hu: 'szabadság',               tags: ['politika'],                     jlpt: 'N3' },
];
