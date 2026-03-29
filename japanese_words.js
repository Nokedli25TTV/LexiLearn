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
  { kana: 'うし', romaji: 'ushi', hu: 'szarvasmarha', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'ぶた', romaji: 'buta', hu: 'disznó', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'にわとり', romaji: 'niwatori', hu: 'házi tyúk', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'ひつじ', romaji: 'hitsuji', hu: 'juh', tags: ['állatok','ételek'], jlpt: 'N4' },
  { kana: 'やぎ', romaji: 'yagi', hu: 'kecske', tags: ['állatok'], jlpt: 'N4' },

  { kana: 'うま', romaji: 'uma', hu: 'ló', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'しか', romaji: 'shika', hu: 'szarvas', tags: ['állatok','ételek'], jlpt: 'N4' },
  { kana: 'くま', romaji: 'kuma', hu: 'medve', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'さる', romaji: 'saru', hu: 'majom', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'きつね', romaji: 'kitsune', hu: 'róka', tags: ['állatok'], jlpt: 'N4' },

  { kana: 'たぬき', romaji: 'tanuki', hu: 'japán nyestkutya', tags: ['állatok'], jlpt: 'N3' },
  { kana: 'いのしし', romaji: 'inoshishi', hu: 'vaddisznó', tags: ['állatok','ételek'], jlpt: 'N3' },
  { kana: 'りす', romaji: 'risu', hu: 'mókus', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'うさぎ', romaji: 'usagi', hu: 'nyúl', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'はと', romaji: 'hato', hu: 'galamb', tags: ['állatok'], jlpt: 'N5' },

  { kana: 'からす', romaji: 'karasu', hu: 'varjú', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'わし', romaji: 'washi', hu: 'sas', tags: ['állatok'], jlpt: 'N3' },
  { kana: 'たか', romaji: 'taka', hu: 'ölyv / héja', tags: ['állatok'], jlpt: 'N3' },
  { kana: 'かも', romaji: 'kamo', hu: 'vadkacsa', tags: ['állatok','ételek'], jlpt: 'N4' },
  { kana: 'つばめ', romaji: 'tsubame', hu: 'fecske', tags: ['állatok'], jlpt: 'N4' },

  { kana: 'かえる', romaji: 'kaeru', hu: 'béka', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'へび', romaji: 'hebi', hu: 'kígyó', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'とかげ', romaji: 'tokage', hu: 'gyík', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'かめ', romaji: 'kame', hu: 'teknős', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'むし', romaji: 'mushi', hu: 'rovar', tags: ['állatok'], jlpt: 'N5' },

  { kana: 'あり', romaji: 'ari', hu: 'hangya', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'はち', romaji: 'hachi', hu: 'méh', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'ちょう', romaji: 'chō', hu: 'pillangó', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'くも', romaji: 'kumo', hu: 'pók', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'たこ', romaji: 'tako', hu: 'polip', tags: ['állatok','ételek'], jlpt: 'N4' },

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


  // ============================
  //         MUNKA (50)
  // ============================

  { kana: 'けんせつさぎょういん', romaji: 'kensetsu sagyōin', hu: 'építőmunkás', tags: ['munka'], jlpt: 'N3' },
  { kana: 'デザイナー', romaji: 'dezainā', hu: 'dizájner', tags: ['munka'], jlpt: 'N5' },
  { kana: 'へいし', romaji: 'heishi', hu: 'katona', tags: ['munka'], jlpt: 'N4' },
  { kana: 'きぎょうか', romaji: 'kigyōka', hu: 'vállalkozó', tags: ['munka'], jlpt: 'N3' },
  { kana: 'しさい', romaji: 'shisai', hu: 'pap', tags: ['munka'], jlpt: 'N2' },
  { kana: 'おおや', romaji: 'ōya', hu: 'főbérlő', tags: ['munka'], jlpt: 'N3' },
  { kana: 'げいじゅつか', romaji: 'geijutsuka', hu: 'művész', tags: ['munka'], jlpt: 'N3' },
  { kana: 'かいしゃいん', romaji: 'kaishain', hu: 'irodai dolgozó', tags: ['munka'], jlpt: 'N5' },
  { kana: 'せんせい', romaji: 'sensei', hu: 'tanár', tags: ['munka'], jlpt: 'N5' },
  { kana: 'いしゃ', romaji: 'isha', hu: 'orvos', tags: ['munka'], jlpt: 'N4' },

  { kana: 'かんごし', romaji: 'kangoshi', hu: 'ápoló', tags: ['munka'], jlpt: 'N4' },
  { kana: 'けいさつかん', romaji: 'keisatsukan', hu: 'rendőr', tags: ['munka'], jlpt: 'N4' },
  { kana: 'しょうぼうし', romaji: 'shōbōshi', hu: 'tűzoltó', tags: ['munka'], jlpt: 'N3' },
  { kana: 'うんてんしゅ', romaji: 'untenshu', hu: 'sofőr', tags: ['munka'], jlpt: 'N4' },
  { kana: 'てんいん', romaji: 'ten’in', hu: 'bolti eladó', tags: ['munka'], jlpt: 'N5' },
  { kana: 'こうむいん', romaji: 'kōmuin', hu: 'köztisztviselő', tags: ['munka'], jlpt: 'N3' },
  { kana: 'エンジニア', romaji: 'enjinia', hu: 'mérnök', tags: ['munka'], jlpt: 'N5' },
  { kana: 'プログラマー', romaji: 'puroguramā', hu: 'programozó', tags: ['munka'], jlpt: 'N5' },
  { kana: 'りょうりにん', romaji: 'ryōrinin', hu: 'szakács', tags: ['munka'], jlpt: 'N4' },
  { kana: 'のうか', romaji: 'nōka', hu: 'gazdálkodó', tags: ['munka'], jlpt: 'N4' },

  { kana: 'びようし', romaji: 'biyōshi', hu: 'fodrász', tags: ['munka'], jlpt: 'N4' },
  { kana: 'しかい', romaji: 'shikai', hu: 'fogorvos', tags: ['munka'], jlpt: 'N3' },
  { kana: 'べんごし', romaji: 'bengoshi', hu: 'ügyvéd', tags: ['munka'], jlpt: 'N3' },
  { kana: 'うけつけ', romaji: 'uketsuke', hu: 'recepciós', tags: ['munka'], jlpt: 'N4' },
  { kana: 'けんきゅうしゃ', romaji: 'kenkyūsha', hu: 'kutató', tags: ['munka'], jlpt: 'N3' },
  { kana: 'ほんやくしゃ', romaji: 'honyakusha', hu: 'fordító', tags: ['munka'], jlpt: 'N3' },
  { kana: 'はんばいいん', romaji: 'hanbaiin', hu: 'értékesítő', tags: ['munka'], jlpt: 'N4' },
  { kana: 'うんそうぎょうしゃ', romaji: 'unsō gyōsha', hu: 'fuvarozó', tags: ['munka'], jlpt: 'N2' },
  { kana: 'やくざいし', romaji: 'yakuzaishi', hu: 'gyógyszerész', tags: ['munka'], jlpt: 'N2' },
  { kana: 'けんちくか', romaji: 'kenchikuka', hu: 'építész', tags: ['munka'], jlpt: 'N2' },

  { kana: 'かいけいし', romaji: 'kaikeishi', hu: 'könyvelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'てんちょう', romaji: 'tenchō', hu: 'üzletvezető', tags: ['munka'], jlpt: 'N4' },
  { kana: 'ウェイター', romaji: 'weitā', hu: 'pincér', tags: ['munka'], jlpt: 'N5' },
  { kana: 'ジャーナリスト', romaji: 'jānarisuto', hu: 'újságíró', tags: ['munka'], jlpt: 'N2' },
  { kana: 'しゃしんか', romaji: 'shashinka', hu: 'fotós', tags: ['munka'], jlpt: 'N3' },
  { kana: 'パイロット', romaji: 'pairotto', hu: 'pilóta', tags: ['munka'], jlpt: 'N5' },
  { kana: 'きゃくしつじょうむいん', romaji: 'kyakushitsu jōmuin', hu: 'légiutas-kísérő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'はいたついん', romaji: 'haitatsuin', hu: 'futár', tags: ['munka'], jlpt: 'N4' },
  { kana: 'じえいぎょうしゃ', romaji: 'jieigyōsha', hu: 'önfoglalkoztató', tags: ['munka'], jlpt: 'N3' },
  { kana: 'ほいくし', romaji: 'hoikushi', hu: 'óvónő', tags: ['munka'], jlpt: 'N3' },

  { kana: 'りょうし', romaji: 'ryōshi', hu: 'halász', tags: ['munka'], jlpt: 'N3' },
  { kana: 'でんきぎし', romaji: 'denki gishi', hu: 'villanyszerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'はいかんこう', romaji: 'haikankō', hu: 'vízvezeték-szerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'じどうしゃせいびし', romaji: 'jidōsha seibishi', hu: 'autószerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'りょうりはいたついん', romaji: 'ryōri haitatsuin', hu: 'ételfutár', tags: ['munka'], jlpt: 'N4' },
  { kana: 'ひしょ', romaji: 'hisho', hu: 'titkár / asszisztens', tags: ['munka'], jlpt: 'N3' },
  { kana: 'かがくしゃ', romaji: 'kagakusha', hu: 'tudós', tags: ['munka'], jlpt: 'N2' },
  { kana: 'てんぽスタッフ', romaji: 'tenpo sutaffu', hu: 'üzleti alkalmazott', tags: ['munka'], jlpt: 'N5' },
  { kana: 'ソフトウェアかいはつしゃ', romaji: 'sofutowea kaihatsusha', hu: 'szoftverfejlesztő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'マネージャー', romaji: 'manējā', hu: 'menedzser', tags: ['munka'], jlpt: 'N5' },

  // ============================
  //         HOBBI (30)
  // ============================

  { kana: 'りょうり', romaji: 'ryōri', hu: 'főzés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'りょこう', romaji: 'ryokō', hu: 'utazás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'うたう', romaji: 'utau', hu: 'éneklés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'どくしょ', romaji: 'dokusho', hu: 'olvasás', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'えいがかんしょう', romaji: 'eiga kanshō', hu: 'filmnézés', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'おんがくかんしょう', romaji: 'ongaku kanshō', hu: 'zenehallgatás', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'しゃしん', romaji: 'shashin', hu: 'fotózás', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'ゲーム', romaji: 'gēmu', hu: 'videojáték', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'スポーツ', romaji: 'supōtsu', hu: 'sportolás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ジョギング', romaji: 'jogingu', hu: 'kocogás', tags: ['hobbi'], jlpt: 'N5' },

  { kana: 'さんぽ', romaji: 'sanpo', hu: 'séta', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'サイクリング', romaji: 'saikuringu', hu: 'biciklizés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'とざん', romaji: 'tozan', hu: 'hegymászás', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'つり', romaji: 'tsuri', hu: 'horgászat', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'ガーデニング', romaji: 'gādeningu', hu: 'kertészkedés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'しゅげい', romaji: 'shugei', hu: 'kézimunka', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'えをかく', romaji: 'e o kaku', hu: 'rajzolás / festés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ダンス', romaji: 'dansu', hu: 'tánc', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ピアノ', romaji: 'piano', hu: 'zongorázás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ギター', romaji: 'gitā', hu: 'gitározás', tags: ['hobbi'], jlpt: 'N5' },

  { kana: 'カラオケ', romaji: 'karaoke', hu: 'karaoke', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'カフェめぐり', romaji: 'kafe meguri', hu: 'kávézók felfedezése', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'ショッピング', romaji: 'shoppingu', hu: 'vásárlás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ボードゲーム', romaji: 'bōdogēmu', hu: 'társasjáték', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'アニメかんしょう', romaji: 'anime kanshō', hu: 'anime nézés', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'まんが', romaji: 'manga', hu: 'manga olvasás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'めいそう', romaji: 'meisō', hu: 'meditáció', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'ヨガ', romaji: 'yoga', hu: 'jóga', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'りょうりけんきゅう', romaji: 'ryōri kenkyū', hu: 'receptek kísérletezése', tags: ['hobbi'], jlpt: 'N2' },
  { kana: 'ディーアイワイ', romaji: 'dī ai wai', hu: 'barkácsolás (DIY)', tags: ['hobbi'], jlpt: 'N5' }
];