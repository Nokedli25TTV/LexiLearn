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
  { kana: 'ディーアイワイ', romaji: 'dī ai wai', hu: 'barkácsolás (DIY)', tags: ['hobbi'], jlpt: 'N5' },

  // ══════════════════════════════════════════
  //   KÖZLEKEDÉS  (1–3. nap)
  // ══════════════════════════════════════════
  // — 1. nap —
  { kana: 'ホーム', romaji: 'hoomu', hu: 'peron', tags: ['közlekedés'], jlpt: 'N5' }, // ホーム
  { kana: 'つぎ', romaji: 'tsugi', hu: 'következő', tags: ['közlekedés'], jlpt: 'N5' }, // 次
  { kana: 'のりかえ', romaji: 'norikae', hu: 'átszállás', tags: ['közlekedés'], jlpt: 'N4' }, // 乗り換え
  { kana: 'とっきゅう', romaji: 'tokkyuu', hu: 'expresszvonat', tags: ['közlekedés'], jlpt: 'N3' }, // 特急
  { kana: 'チャージ', romaji: 'chaaji', hu: 'feltöltés (kártyáé)', tags: ['közlekedés'], jlpt: 'N4' }, // チャージ
  // — 2. nap —
  { kana: 'しゅうてん', romaji: 'shuuten', hu: 'végállomás', tags: ['közlekedés'], jlpt: 'N3' }, // 終点
  { kana: 'のります', romaji: 'norimasu', hu: 'felszáll (járműre)', tags: ['közlekedés'], jlpt: 'N5' }, // 乗ります
  { kana: 'おります', romaji: 'orimasu', hu: 'leszáll (járműről)', tags: ['közlekedés'], jlpt: 'N4' }, // 降ります
  { kana: 'おくれ', romaji: 'okure', hu: 'késés', tags: ['közlekedés'], jlpt: 'N3' }, // 遅れ
  { kana: 'ゲート', romaji: 'geeto', hu: 'kapu (reptér / állomás)', tags: ['közlekedés'], jlpt: 'N4' }, // ゲート
  { kana: 'していせき', romaji: 'shiteiseki', hu: 'helyjegy / foglalt ülés', tags: ['közlekedés'], jlpt: 'N2' }, // 指定席
  { kana: 'じゆうせき', romaji: 'jiyuuseki', hu: 'helyjegy nélküli / szabad ülés', tags: ['közlekedés'], jlpt: 'N2' }, // 自由席
  // — 3. nap —
  { kana: 'タクシーのりば', romaji: 'takushii noriba', hu: 'taxiállomás', tags: ['közlekedés'], jlpt: 'N4' }, // タクシー乗り場
  { kana: 'かいさつ', romaji: 'kaisatsu', hu: 'jegykapu', tags: ['közlekedés'], jlpt: 'N2' }, // 改札
  { kana: 'ICカード', romaji: 'IC kaado', hu: 'IC kártya (Suica)', tags: ['közlekedés'], jlpt: 'N4' }, // ＩＣカード
  { kana: 'ぜいかん', romaji: 'zeikan', hu: 'vám', tags: ['közlekedés'], jlpt: 'N2' }, // 税関
  { kana: 'とうちゃく', romaji: 'touchaku', hu: 'érkezés', tags: ['közlekedés'], jlpt: 'N3' }, // 到着
  { kana: 'しゅっぱつ', romaji: 'shuppatsu', hu: 'indulás', tags: ['közlekedés'], jlpt: 'N4' }, // 出発
  { kana: 'あんないじょ', romaji: 'annaisho', hu: 'információs pult', tags: ['közlekedés'], jlpt: 'N3' }, // 案内所
  { kana: 'とほ', romaji: 'toho', hu: 'gyalog', tags: ['közlekedés'], jlpt: 'N2' }, // 徒歩
  { kana: 'とまります', romaji: 'tomarimasu', hu: 'megáll', tags: ['közlekedés'], jlpt: 'N5' }, // 止まります
  { kana: 'まよいました', romaji: 'mayoimashita', hu: 'eltévedtem', tags: ['közlekedés'], jlpt: 'N4' }, // 迷いました

  // ══════════════════════════════════════════
  //   ÉTTEREM  (4–6. nap)
  // ══════════════════════════════════════════
  // — 4. nap —
  { kana: 'よにん', romaji: 'yonin', hu: 'négy fő / négy személy', tags: ['étterem'], jlpt: 'N4' }, // 四人 / 四名
  { kana: 'てんない', romaji: 'tennai', hu: 'helyben fogyasztás', tags: ['étterem'], jlpt: 'N3' }, // 店内
  { kana: 'もちかえり', romaji: 'mochikaeri', hu: 'elvitelre', tags: ['étterem'], jlpt: 'N3' }, // 持ち帰り / テイクアウト
  { kana: 'おしぼり', romaji: 'oshibori', hu: 'nedves kéztörlő kendő', tags: ['étterem'], jlpt: 'N3' }, // おしぼり
  { kana: 'ちゅうもん', romaji: 'chuumon', hu: 'rendelés', tags: ['étterem'], jlpt: 'N4' }, // 注文
  { kana: 'おひや', romaji: 'ohiya', hu: 'hideg ivóvíz', tags: ['étterem'], jlpt: 'N2' }, // お冷
  { kana: 'おはし', romaji: 'ohashi', hu: 'pálcika', tags: ['étterem'], jlpt: 'N5' }, // お箸
  { kana: 'とりざら', romaji: 'torizara', hu: 'kistányér', tags: ['étterem'], jlpt: 'N2' }, // 取り皿
  { kana: 'おすすめ', romaji: 'osusume', hu: 'ajánlat / a ház ajánlata', tags: ['étterem'], jlpt: 'N4' }, // おすすめ
  // — 5. nap —
  { kana: 'おおもり', romaji: 'oomori', hu: 'nagy adag', tags: ['étterem'], jlpt: 'N3' }, // 大盛り
  { kana: 'すくなめ', romaji: 'sukuname', hu: 'kevesebb / kis adag', tags: ['étterem'], jlpt: 'N3' }, // 少なめ
  { kana: 'ぬき', romaji: 'nuki', hu: 'valami nélkül', tags: ['étterem'], jlpt: 'N3' }, // 抜き
  { kana: 'アレルギー', romaji: 'arerugii', hu: 'allergia', tags: ['étterem'], jlpt: 'N3' }, // アレルギー
  // — 6. nap —
  { kana: 'おかいけい', romaji: 'okaikei', hu: 'számla / fizetés', tags: ['étterem'], jlpt: 'N3' }, // お会計
  { kana: 'べつべつ', romaji: 'betsubetsu', hu: 'külön-külön', tags: ['étterem'], jlpt: 'N3' }, // 別々
  { kana: 'げんきん', romaji: 'genkin', hu: 'készpénz', tags: ['étterem'], jlpt: 'N4' }, // 現金
  { kana: 'カード', romaji: 'kaado', hu: 'bankkártya', tags: ['étterem'], jlpt: 'N5' }, // カード
  { kana: 'むりょう', romaji: 'muryou', hu: 'ingyenes', tags: ['étterem'], jlpt: 'N3' }, // 無料
  { kana: 'レシート', romaji: 'reshiito', hu: 'nyugta / blokk', tags: ['étterem'], jlpt: 'N4' }, // レシート
  { kana: 'まんせき', romaji: 'manseki', hu: 'telt ház / tele van', tags: ['étterem'], jlpt: 'N2' }, // 満席
  { kana: 'くうせき', romaji: 'kuuseki', hu: 'szabad hely / üres ülés', tags: ['étterem'], jlpt: 'N3' }, // 空席 / 空き
  { kana: 'おさけ', romaji: 'osake', hu: 'sake / alkohol', tags: ['étterem'], jlpt: 'N5' }, // お酒
  { kana: 'ごちそうさまでした', romaji: 'gochisousama deshita', hu: 'köszönöm az ételt', tags: ['étterem'], jlpt: 'N4' }, // ごちそうさまでした

  // ══════════════════════════════════════════
  //   BOLT  (7–9. nap)
  // ══════════════════════════════════════════
  // — 7. nap —
  { kana: 'おみせ', romaji: 'omise', hu: 'bolt / üzlet', tags: ['bolt'], jlpt: 'N5' }, // お店
  { kana: 'おべんとう', romaji: 'obentou', hu: 'bento / dobozos étel', tags: ['bolt'], jlpt: 'N4' }, // お弁当
  { kana: 'あたためる', romaji: 'atatameru', hu: 'felmelegíteni', tags: ['bolt'], jlpt: 'N3' }, // 温める
  { kana: 'わりばし', romaji: 'waribashi', hu: 'eldobható pálcika', tags: ['bolt'], jlpt: 'N3' }, // 割り箸
  { kana: 'わりびき', romaji: 'waribiki', hu: 'kedvezmény / leárazás', tags: ['bolt'], jlpt: 'N3' }, // 割引
  { kana: 'でんち', romaji: 'denchi', hu: 'elem / akkumulátor', tags: ['bolt'], jlpt: 'N4' }, // 電池
  { kana: 'じゅうでんき', romaji: 'juudenki', hu: 'töltő', tags: ['bolt'], jlpt: 'N2' }, // 充電器
  { kana: 'シャンプー', romaji: 'shanpuu', hu: 'sampon', tags: ['bolt'], jlpt: 'N4' }, // シャンプー
  { kana: 'はブラシ', romaji: 'haburashi', hu: 'fogkefe', tags: ['bolt'], jlpt: 'N4' }, // 歯ブラシ
  // — 8. nap —
  { kana: 'しちゃくしつ', romaji: 'shichakushitsu', hu: 'próbafülke', tags: ['bolt'], jlpt: 'N2' }, // 試着室
  { kana: 'しちゃく', romaji: 'shichaku', hu: 'felpróbálás', tags: ['bolt'], jlpt: 'N2' }, // 試着
  { kana: 'ふるぎ', romaji: 'furugi', hu: 'használt ruha / vintage', tags: ['bolt'], jlpt: 'N2' }, // 古着
  { kana: 'オーバーサイズ', romaji: 'oobaasaizu', hu: 'oversized / túlméretezett', tags: ['bolt'], jlpt: 'N3' }, // オーバーサイズ
  { kana: 'ぴったり', romaji: 'pittari', hu: 'pont jó / tökéletesen passzol', tags: ['bolt'], jlpt: 'N3' }, // ぴったり
  { kana: 'めんぜい', romaji: 'menzei', hu: 'Tax-Free / adómentes', tags: ['bolt'], jlpt: 'N2' }, // 免税
  // — 9. nap —
  { kana: 'おみやげ', romaji: 'omiyage', hu: 'szuvenír / helyi ajándék', tags: ['bolt'], jlpt: 'N4' }, // お土産
  { kana: 'かい', romaji: 'kai', hu: 'emelet', tags: ['bolt'], jlpt: 'N4' }, // 階
  { kana: 'えいぎょうちゅう', romaji: 'eigyou chuu', hu: 'nyitva (üzemel)', tags: ['bolt'], jlpt: 'N2' }, // 営業中
  { kana: 'じゅんびちゅう', romaji: 'junbi chuu', hu: 'zárva (előkészületben)', tags: ['bolt'], jlpt: 'N3' }, // 準備中
  { kana: 'さがしています', romaji: 'sagashite imasu', hu: 'keresek (valamit)', tags: ['bolt'], jlpt: 'N4' }, // 探しています
  { kana: 'みているだけです', romaji: 'mite iru dake desu', hu: 'csak nézelődöm', tags: ['bolt'], jlpt: 'N4' }, // 見ているだけです
  { kana: 'うりきれ', romaji: 'urikire', hu: 'elfogyott / sold out', tags: ['bolt'], jlpt: 'N3' }, // 売り切れ
  { kana: 'ちゅうこ', romaji: 'chuuko', hu: 'használt (cikk)', tags: ['bolt'], jlpt: 'N2' }, // 中古
  { kana: 'あたらしいもの', romaji: 'atarashii mono', hu: 'új darab / bontatlan', tags: ['bolt'], jlpt: 'N4' }, // 新しいもの

  // ══════════════════════════════════════════
  //   SZÁLLÁS  (10–11. nap)
  // ══════════════════════════════════════════
  // — 10. nap —
  { kana: 'フロント', romaji: 'furonto', hu: 'recepció', tags: ['szállás'], jlpt: 'N4' }, // フロント
  { kana: 'よやく', romaji: 'yoyaku', hu: 'foglalás', tags: ['szállás'], jlpt: 'N4' }, // 予約
  { kana: 'チェックイン', romaji: 'chekkuin', hu: 'bejelentkezés', tags: ['szállás'], jlpt: 'N4' }, // チェックイン
  { kana: 'チェックアウト', romaji: 'chekkuauto', hu: 'kijelentkezés', tags: ['szállás'], jlpt: 'N4' }, // チェックアウト
  { kana: 'にもつあずかり', romaji: 'nimotsu azukari', hu: 'csomagmegőrzés', tags: ['szállás'], jlpt: 'N2' }, // 荷物預かり
  { kana: 'ちょうしょく', romaji: 'choushoku', hu: 'reggeli', tags: ['szállás'], jlpt: 'N3' }, // 朝食
  { kana: 'ワイファイ', romaji: 'waifai', hu: 'wifi', tags: ['szállás'], jlpt: 'N5' }, // ワイファイ
  { kana: 'パスワード', romaji: 'pasuwaado', hu: 'jelszó', tags: ['szállás'], jlpt: 'N4' }, // パスワード
  { kana: 'きんえんルーム', romaji: 'kin\'en ruumu', hu: 'nemdohányzó szoba', tags: ['szállás'], jlpt: 'N2' }, // 禁煙ルーム
  { kana: 'きつえんルーム', romaji: 'kitsuen ruumu', hu: 'dohányzó szoba', tags: ['szállás'], jlpt: 'N2' }, // 喫煙ルーム
  { kana: 'もんげん', romaji: 'mongen', hu: 'kapuzárás / takarodó', tags: ['szállás'], jlpt: 'N1' }, // 門限
  // — 11. nap —
  { kana: 'あんしょうばんごう', romaji: 'anshou bangou', hu: 'PIN kód / ajtókód', tags: ['szállás'], jlpt: 'N1' }, // 暗証番号
  { kana: 'キーボックス', romaji: 'kii bokkusu', hu: 'kulcsszéf / lockbox', tags: ['szállás'], jlpt: 'N3' }, // キーボックス
  { kana: 'ぶんべつ', romaji: 'bunbetsu', hu: 'szelektív hulladékgyűjtés', tags: ['szállás'], jlpt: 'N2' }, // 分別
  { kana: 'せんたくき', romaji: 'sentakuki', hu: 'mosógép', tags: ['szállás'], jlpt: 'N4' }, // 洗濯機
  { kana: 'でんしレンジ', romaji: 'denshi renji', hu: 'mikrohullámú sütő', tags: ['szállás'], jlpt: 'N3' }, // 電子レンジ
  { kana: 'つかいかた', romaji: 'tsukaikata', hu: 'használati útmutató', tags: ['szállás'], jlpt: 'N4' }, // 使い方
  { kana: 'タオル', romaji: 'taoru', hu: 'törölköző', tags: ['szállás'], jlpt: 'N5' }, // タオル
  { kana: 'おふろ', romaji: 'ofuro', hu: 'fürdőkád / fürdőszoba', tags: ['szállás'], jlpt: 'N5' }, // お風呂
  { kana: 'トイレットペーパー', romaji: 'toiretto peepaa', hu: 'WC papír', tags: ['szállás'], jlpt: 'N4' }, // トイレットペーパー
  { kana: 'ホスト', romaji: 'hosuto', hu: 'szállásadó / host', tags: ['szállás'], jlpt: 'N3' }, // ホスト
  { kana: 'こわれています', romaji: 'kowarete imasu', hu: 'elromlott / nem működik', tags: ['szállás'], jlpt: 'N3' }, // 壊れています
  { kana: 'おゆがでません', romaji: 'oyu ga demasen', hu: 'nincs meleg víz', tags: ['szállás'], jlpt: 'N4' }, // お湯が出ません

  // ══════════════════════════════════════════
  //   SZÓRAKOZÁS  (12–13. nap)
  // ══════════════════════════════════════════
  // — 12. nap —
  { kana: 'おしろ', romaji: 'oshiro', hu: 'kastély / vár', tags: ['szórakozás'], jlpt: 'N2' }, // 城
  { kana: 'タトゥー', romaji: 'tatuu', hu: 'tetoválás', tags: ['szórakozás'], jlpt: 'N3' }, // タトゥー
  { kana: 'さつえいきんし', romaji: 'satsuei kinshi', hu: 'fényképezés tilos', tags: ['szórakozás'], jlpt: 'N1' }, // 撮影禁止
  { kana: 'さいしゅうにゅうじょう', romaji: 'saishuu nyuujou', hu: 'utolsó belépés', tags: ['szórakozás'], jlpt: 'N1' }, // 最終入場
  { kana: 'れつ', romaji: 'retsu', hu: 'sor (sorban állás)', tags: ['szórakozás'], jlpt: 'N3' }, // 列
  { kana: 'ならんでいます', romaji: 'narande imasu', hu: 'sorban állni', tags: ['szórakozás'], jlpt: 'N4' }, // 並んでいます
  // — 13. nap —
  { kana: 'ゲームセンター', romaji: 'geemu sentaa', hu: 'játékterem / game center', tags: ['szórakozás'], jlpt: 'N4' }, // ゲームセンター / ゲーセン
  { kana: 'ガチャガチャ', romaji: 'gachagacha', hu: 'kapszulajáték-automata', tags: ['szórakozás'], jlpt: 'N4' }, // ガチャガチャ
  { kana: 'UFOキャッチャー', romaji: 'yuufoo kyatchaa', hu: 'darus játék / claw machine', tags: ['szórakozás'], jlpt: 'N4' }, // UFOキャッチャー
  { kana: 'けいひん', romaji: 'keihin', hu: 'nyeremény / díj', tags: ['szórakozás'], jlpt: 'N2' }, // 景品
  { kana: 'かんぱい', romaji: 'kanpai', hu: 'egészségedre! / koccintás', tags: ['szórakozás'], jlpt: 'N3' }, // 乾杯
  { kana: 'のみほうだい', romaji: 'nomihoudai', hu: 'korlátlan italfogyasztás', tags: ['szórakozás'], jlpt: 'N2' }, // 飲み放題
  { kana: 'りょうがえ', romaji: 'ryougae', hu: 'pénzváltás', tags: ['szórakozás'], jlpt: 'N2' }, // 両替
  { kana: 'こぜに', romaji: 'kozeni', hu: 'aprópénz', tags: ['szórakozás'], jlpt: 'N2' }, // 小銭
  { kana: 'ひゃくえんだま', romaji: 'hyaku-en dama', hu: '100 jenes érme', tags: ['szórakozás'], jlpt: 'N3' }, // 100円玉
  { kana: 'えんちょう', romaji: 'enchou', hu: 'hosszabbítás', tags: ['szórakozás'], jlpt: 'N2' }, // 延長
  { kana: 'きしゅ', romaji: 'kishu', hu: 'géptípus', tags: ['szórakozás'], jlpt: 'N1' }, // 機種
  { kana: 'とれました', romaji: 'toremashita', hu: 'megszereztem! / megvan!', tags: ['szórakozás'], jlpt: 'N4' }, // 取れました

  // ══════════════════════════════════════════
  //   SEGÍTSÉGKÉRÉS  (14–15. nap)
  // ══════════════════════════════════════════
  // — 14. nap —
  { kana: 'たすけてください', romaji: 'tasukete kudasai', hu: 'segítsen, kérem!', tags: ['segítségkérés'], jlpt: 'N4' }, // 助けてください
  { kana: 'わかりません', romaji: 'wakarimasen', hu: 'nem értem / nem tudom', tags: ['segítségkérés'], jlpt: 'N5' }, // わかりません
  { kana: 'もういちど', romaji: 'mou ichido', hu: 'még egyszer', tags: ['segítségkérés'], jlpt: 'N4' }, // もう一度
  { kana: 'きぶんがわるい', romaji: 'kibun ga warui', hu: 'rosszul vagyok / hányingerem van', tags: ['segítségkérés'], jlpt: 'N3' }, // 気分が悪い
  { kana: 'はきけ', romaji: 'hakike', hu: 'hányinger', tags: ['segítségkérés'], jlpt: 'N2' }, // 吐き気
  // — 15. nap —
  { kana: 'かじ', romaji: 'kaji', hu: 'tűz (tűzeset)', tags: ['segítségkérés'], jlpt: 'N3' }, // 火事
  { kana: 'きんきゅう', romaji: 'kinkyuu', hu: 'vészhelyzet', tags: ['segítségkérés'], jlpt: 'N2' }, // 緊急
  { kana: 'おとしもの', romaji: 'otoshimono', hu: 'elveszett / talált tárgy', tags: ['segítségkérés'], jlpt: 'N3' }, // 落とし物
  { kana: 'わすれもの', romaji: 'wasuremono', hu: 'ottfelejtett tárgy', tags: ['segítségkérés'], jlpt: 'N3' }, // 忘れ物
  { kana: 'とうなん', romaji: 'tounan', hu: 'lopás', tags: ['segítségkérés'], jlpt: 'N1' }, // 盗難
  { kana: 'なくしました', romaji: 'nakushimashita', hu: 'elvesztettem (valamit)', tags: ['segítségkérés'], jlpt: 'N4' }, // 無くしました
  { kana: 'スマホ', romaji: 'sumaho', hu: 'okostelefon / telefon', tags: ['segítségkérés'], jlpt: 'N4' }, // スマホ / 携帯
  { kana: 'たいしかん', romaji: 'taishikan', hu: 'nagykövetség', tags: ['segítségkérés'], jlpt: 'N2' }, // 大使館
  { kana: 'はぐれました', romaji: 'haguremashita', hu: 'elszakadtam (a többiektől)', tags: ['segítségkérés'], jlpt: 'N3' }, // はぐれました

];


/* ══════════════════════════════════════════════════════
   ÚTI TANULÁSI TERV – 21 NAP
   ──────────────────────────────────────────────────────
   Minden naphoz az aznap tanulandó szavak tartoznak,
   KANA szerint azonosítva. Egy szó lehet:
     • ÚJ szó (ebben a fájlból, fentebb a tömbben), VAGY
     • a meglévő adatbázis BÁRMELY japán szava.
   Fontos: a lenti kana PONTOSAN egyezzen a szó 'kana'
   mezőjével (a fenti tömbben), különben nem talál rá.

   Használat az appban:
     Japán mód → „🧳 Úti terv – Nap" legördülő → nap kiválasztása
     → a szólista arra a napra szűr → „Mind" → „Gyakorlás indítása".

   A napok mellett az app automatikusan kiírja a szavak számát.
   Egyelőre üresek – a szavakat a felhasználó küldi, utána töltjük fel.

   Példa egy napra:
     1: ['ホーム', 'つぎ', 'のりかえ'],
══════════════════════════════════════════════════════ */
const TRAVEL_PLAN = {
  1:  ['えき', 'でんしゃ', 'ちかてつ', 'きっぷ', 'ホーム', 'でぐち', 'つぎ', 'のりかえ', 'ふつう', 'とっきゅう', 'みぎ', 'ひだり', 'まっすぐ', 'チャージ', 'どこ'],
  2:  ['しんかんせん', 'バス', 'ひこうき', 'くうこう', 'しゅうてん', 'のります', 'おります', 'おくれ', 'ゲート', 'とおい', 'ちかい', 'じこくひょう', 'にもつ', 'していせき', 'じゆうせき'],
  3:  ['タクシー', 'タクシーのりば', 'かいさつ', 'ICカード', 'いりぐち', 'ちず', 'パスポート', 'ぜいかん', 'とうちゃく', 'しゅっぱつ', 'あんないじょ', 'みち', 'とほ', 'とまります', 'まよいました'],
  4:  ['よにん', 'てんない', 'もちかえり', 'おしぼり', 'メニュー', 'ちゅうもん', 'おひや', 'おちゃ', 'おはし', 'とりざら', 'おすすめ', 'あさごはん', 'ひるごはん', 'ばんごはん', 'すみません'],
  5:  ['にく', 'ぶたにく', 'ぎゅうにく', 'さかな', 'やさい', 'たまご', 'おおもり', 'すくなめ', 'ぬき', 'アレルギー', 'おいしい', 'からい', 'あまい', 'フォーク', 'ビール'],
  6:  ['おかいけい', 'べつべつ', 'げんきん', 'カード', 'むりょう', 'おつり', 'レシート', 'しょっけん', 'まんせき', 'くうせき', 'コーヒー', 'おさけ', 'しょっぱい', 'スプーン', 'ごちそうさまでした'],
  7:  ['コンビニ', 'おみせ', 'レジ', 'ふくろ', 'おべんとう', 'のみもの', 'あたためる', 'わりばし', 'やすい', 'わりびき', 'でんち', 'じゅうでんき', 'シャンプー', 'はブラシ', 'くすり'],
  8:  ['しちゃくしつ', 'しちゃく', 'ふるぎ', 'サイズ', 'オーバーサイズ', 'おおきい', 'ちいさい', 'ぴったり', 'たかい', 'いろ', 'くろ', 'しろ', 'かがみ', 'デパート', 'めんぜい'],
  9:  ['おみやげ', 'やっきょく', 'かい', 'エレベーター', 'かいだん', 'えいぎょうちゅう', 'じゅんびちゅう', 'あお', 'あか', 'いくら', 'さがしています', 'みているだけです', 'うりきれ', 'ちゅうこ', 'あたらしいもの'],
  10: ['フロント', 'よやく', 'なまえ', 'チェックイン', 'チェックアウト', 'へや', 'かぎ', 'にもつあずかり', 'ちょうしょく', 'ワイファイ', 'パスワード', 'きんえんルーム', 'きつえんルーム', 'もんげん', 'りょかん'],
  11: ['あんしょうばんごう', 'キーボックス', 'ごみ', 'ぶんべつ', 'エアコン', 'せんたくき', 'でんしレンジ', 'つかいかた', 'タオル', 'おふろ', 'トイレットペーパー', 'ホスト', 'こわれています', 'おゆがでません', 'うるさい'],
  12: ['おとな', 'チケット', 'じんじゃ', 'おてら', 'おしろ', 'まつり', 'おんせん', 'タトゥー', 'しゃしん', 'さつえいきんし', 'さいしゅうにゅうじょう', 'にんき', 'きれい', 'れつ', 'ならんでいます'],
  13: ['ゲームセンター', 'ガチャガチャ', 'UFOキャッチャー', 'けいひん', 'カラオケ', 'いざかや', 'かんぱい', 'のみほうだい', 'りょうがえ', 'こぜに', 'ひゃくえんだま', 'えんちょう', 'きしゅ', 'とれました', 'おもしろい'],
  14: ['たすけてください', 'わかりません', 'ゆっくり', 'もういちど', 'えいご', 'びょういん', 'いしゃ', 'きぶんがわるい', 'いたい', 'ねつ', 'あたま', 'おなか', 'のど', 'あし', 'はきけ'],
  15: ['こうばん', 'けいさつ', 'きゅうきゅうしゃ', 'かじ', 'じこ', 'きんきゅう', 'おとしもの', 'わすれもの', 'とうなん', 'なくしました', 'さいふ', 'スマホ', 'パスポート', 'たいしかん', 'はぐれました'],
};


/* ══════════════════════════════════════════════════════
   ÚTI TANULÁSI TERV – KANJIK / 21 NAP
   ──────────────────────────────────────────────────────
   Naponta 5 új kanji. Minden naphoz az aznap tanulandó
   kanjik tartoznak, a KANJI KARAKTERÉVEL azonosítva
   (pl. '行', '来'), NEM kanával.
   Egy kanji lehet a meglévő kanji-adatbázisból (kanji_data.js)
   vagy új (akkor azt előbb a kanji_data.js-be is felvesszük).

   Az appban: Kandzsi mód → „🧳 Úti terv – Nap" legördülő.

   Példa egy napra:
     1: ['行', '来', '帰', '出', '入'],
══════════════════════════════════════════════════════ */
const TRAVEL_PLAN_KANJI = {
  1:  ['入', '出', '右', '左', '線'],
  2:  ['肉', '牛', '豚', '鳥', '魚'],
  3:  ['円', '安', '割', '半', '店'],
  4:  ['食', '飲', '注', '大', '小'],
  5:  ['禁', '止', '水', '男', '女'],
  6:  ['焼', '揚', '辛', '甘', '塩'],
  7:  ['東', '西', '乗', '降', '階'],
  8:  ['麺', '飯', '丼', '汁', '湯'],
  9:  ['押', '引', '閉', '満', '空'],
  10: ['茶', '酒', '生', '冷', '温'],
  11: ['税', '込', '抜', '券', '替'],
  12: ['洗', '流', '音', '紙', '無'],
  13: ['氷', '熱', '乳', '杯', '特'],
  14: ['煙', '喫', '危', '意', '捨'],
  15: ['海', '貝', '菜', '卵', '豆'],
  16: ['鮪', '鮭', '刺', '蟹', '鮮'],
  17: ['前', '後', '地', '鉄', '公'],
  18: ['味', '濃', '薄', '油', '煮'],
  19: ['有', '料', '理', '営', '業'],
  20: ['珈', '琲', '梅', '割', '葱'],
  21: ['蛸', '鰻', '粉', '麦', '米'],
  22: ['醤', '酢', '脂', '香', '和'],
  23: ['価', '格', '限', '倍', '糖'],
  24: ['酎', '苦', '酸', '芋', '茸'],
  25: ['案', '内', '羊', '鴨', '鯛'],
};