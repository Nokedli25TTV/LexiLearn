/* ══════════════════════════════════════════════════════
   LexiLearn – Japán Szavak Adatbázis (Kana modul)
   Minden szó: kana, romaji, hu (magyar), tags, jlpt
   (Tisztított verzió: Dekiru duplikációk eltávolítva)
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

  // ─── N5 – Ételek / Italok ─────────────────────────
  { kana: 'みず',           romaji: 'mizu',        hu: 'víz',                     tags: ['ételek','alapszavak'],          jlpt: 'N5' },
  { kana: 'おちゃ',         romaji: 'ocha',        hu: 'tea',                     tags: ['ételek','italok'],              jlpt: 'N5' },

  // ─── N5 – Állatok ────────────────────────────────
  { kana: 'にわとり', romaji: 'niwatori', hu: 'házi tyúk', tags: ['állatok','ételek'], jlpt: 'N5' },
  { kana: 'やぎ', romaji: 'yagi', hu: 'kecske', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'しか', romaji: 'shika', hu: 'szarvas', tags: ['állatok','ételek'], jlpt: 'N4' },
  { kana: 'くま', romaji: 'kuma', hu: 'medve', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'さる', romaji: 'saru', hu: 'majom', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'きつね', romaji: 'kitsune', hu: 'róka', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'たぬき', romaji: 'tanuki', hu: 'japán nyestkutya', tags: ['állatok'], jlpt: 'N3' },
  { kana: 'いのしし', romaji: 'inoshishi', hu: 'vaddisznó', tags: ['állatok','ételek'], jlpt: 'N3' },
  { kana: 'りす', romaji: 'risu', hu: 'mókus', tags: ['állatok'], jlpt: 'N5' },
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
  { kana: 'あり', romaji: 'ari', hu: 'hangya', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'はち', romaji: 'hachi', hu: 'méh', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'ちょう', romaji: 'chō', hu: 'pillangó', tags: ['állatok'], jlpt: 'N4' },
  { kana: 'くも', romaji: 'kumo', hu: 'pók', tags: ['állatok'], jlpt: 'N5' },
  { kana: 'たこ', romaji: 'tako', hu: 'polip', tags: ['állatok','ételek'], jlpt: 'N4' },

  // ─── N5 – Kapcsolatok / Család ────────────────────
  { kana: 'おとうさん',     romaji: 'otousan',     hu: 'édesapa',                 tags: ['kapcsolatok'],                  jlpt: 'N5' },

  // ─── N4 – Munka / Élet ────────────────────────────
  { kana: 'りょこう',       romaji: 'ryokou',      hu: 'utazás / kirándulás',     tags: ['utazás'],                       jlpt: 'N4' },

  // ─── N3 – Fejlettebb szókincs ─────────────────────
  { kana: 'かんじょう',     romaji: 'kanjou',      hu: 'érzés / érzelem',         tags: ['érzelmek','pszichológia'],      jlpt: 'N3' },

  // ============================
  //         MUNKA
  // ============================
  { kana: 'けんせつさぎょういん', romaji: 'kensetsu sagyōin', hu: 'építőmunkás', tags: ['munka'], jlpt: 'N3' },
  { kana: 'デザイナー', romaji: 'dezainā', hu: 'dizájner', tags: ['munka'], jlpt: 'N5' },
  { kana: 'へいし', romaji: 'heishi', hu: 'katona', tags: ['munka'], jlpt: 'N4' },
  { kana: 'きぎょうか', romaji: 'kigyōka', hu: 'vállalkozó', tags: ['munka'], jlpt: 'N3' },
  { kana: 'しさい', romaji: 'shisai', hu: 'pap', tags: ['munka'], jlpt: 'N2' },
  { kana: 'おおや', romaji: 'ōya', hu: 'főbérlő', tags: ['munka'], jlpt: 'N3' },
  { kana: 'げいじゅつか', romaji: 'geijutsuka', hu: 'művész', tags: ['munka'], jlpt: 'N3' },
  { kana: 'けいさつかん', romaji: 'keisatsukan', hu: 'rendőr', tags: ['munka'], jlpt: 'N4' },
  { kana: 'しょうぼうし', romaji: 'shōbōshi', hu: 'tűzoltó', tags: ['munka'], jlpt: 'N3' },
  { kana: 'うんてんしゅ', romaji: 'untenshu', hu: 'sofőr', tags: ['munka'], jlpt: 'N4' },
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
  { kana: 'でんきぎし', romaji: 'denki gishi', hu: 'villanyszerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'はいかんこう', romaji: 'haikankō', hu: 'vízvezeték-szerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'じどうしゃせいびし', romaji: 'jidōsha seibishi', hu: 'autószerelő', tags: ['munka'], jlpt: 'N2' },
  { kana: 'りょうりはいたついん', romaji: 'ryōri haitatsuin', hu: 'ételfutár', tags: ['munka'], jlpt: 'N4' },
  { kana: 'ひしょ', romaji: 'hisho', hu: 'titkár / asszisztens', tags: ['munka'], jlpt: 'N3' },
  { kana: 'かがくしゃ', romaji: 'kagakusha', hu: 'tudós', tags: ['munka'], jlpt: 'N2' },
  { kana: 'てんぽスタッフ', romaji: 'tenpo sutaffu', hu: 'üzleti alkalmazott', tags: ['munka'], jlpt: 'N5' },
  { kana: 'ソフトウェアかいはつしゃ', romaji: 'sofutowea kaihatsusha', hu: 'szoftverfejlesztő', tags: ['munka'], jlpt: 'N2' },

  // ============================
  //         HOBBI
  // ============================
  { kana: 'りょこう', romaji: 'ryokō', hu: 'utazás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'どくしょ', romaji: 'dokusho', hu: 'olvasás', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'えいがかんしょう', romaji: 'eiga kanshō', hu: 'filmnézés', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'おんがくかんしょう', romaji: 'ongaku kanshō', hu: 'zenehallgatás', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'さんぽ', romaji: 'sanpo', hu: 'séta', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'サイクリング', romaji: 'saikuringu', hu: 'biciklizés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'とざん', romaji: 'tozan', hu: 'hegymászás', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'ガーデニング', romaji: 'gādeningu', hu: 'kertészkedés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'しゅげい', romaji: 'shugei', hu: 'kézimunka', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'えをかく', romaji: 'e o kaku', hu: 'rajzolás / festés', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'カフェめぐり', romaji: 'kafe meguri', hu: 'kávézók felfedezése', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'ショッピング', romaji: 'shoppingu', hu: 'vásárlás', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'ボードゲーム', romaji: 'bōdogēmu', hu: 'társasjáték', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'アニメかんしょう', romaji: 'anime kanshō', hu: 'anime nézés', tags: ['hobbi'], jlpt: 'N4' },
  { kana: 'めいそう', romaji: 'meisō', hu: 'meditáció', tags: ['hobbi'], jlpt: 'N3' },
  { kana: 'ヨガ', romaji: 'yoga', hu: 'jóga', tags: ['hobbi'], jlpt: 'N5' },
  { kana: 'りょうりけんきゅう', romaji: 'ryōri kenkyū', hu: 'receptek kísérletezése', tags: ['hobbi'], jlpt: 'N2' },
  { kana: 'ディーアイワイ', romaji: 'dī ai wai', hu: 'barkácsolás (DIY)', tags: ['hobbi'], jlpt: 'N5' }
];