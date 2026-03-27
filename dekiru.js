/* ─── Dekiru 1 – 1. Lecke (第1課) ─── */
const DEKIRU_L1 = [
  // Személyes adatok / Országok
  { kana: 'わたし', romaji: 'watashi', hu: 'én', tags: ['alapszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'なまえ', romaji: 'namae', hu: 'név', tags: ['alapszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'にほん', romaji: 'nihon', hu: 'Japán', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ハンガリー', romaji: 'hangari', hu: 'Magyarország', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'イギリス', romaji: 'igirisu', hu: 'Anglia', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'オーストリア', romaji: 'oosutoria', hu: 'Ausztria', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ドイツ', romaji: 'doitsu', hu: 'Németország', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'フランス', romaji: 'furansu', hu: 'Franciaország', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'アメリカ', romaji: 'amerika', hu: 'Amerika', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'オーストラリア', romaji: 'oosutoraria', hu: 'Ausztrália', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'かんこく', romaji: 'kankoku', hu: 'Korea', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ブラジル', romaji: 'burajiru', hu: 'Brazília', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'がいこく', romaji: 'gaikoku', hu: 'külföld', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'とうきょう', romaji: 'toukyou', hu: 'Tokió', tags: ['helyek'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'しぶや', romaji: 'shibuya', hu: 'Shibuya (hely)', tags: ['helyek'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ブダペスト', romaji: 'budapesuto', hu: 'Budapest', tags: ['helyek'], jlpt: 'N5', lesson: [1], source: 'dekiru' },

  // Nyelvek / Írás
  { kana: 'にほんご', romaji: 'nihongo', hu: 'japán nyelv', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'えいご', romaji: 'eigo', hu: 'angol nyelv', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ひらがな', romaji: 'hiragana', hu: 'hiragana írásjegy', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'カタカナ', romaji: 'katakana', hu: 'katakana írásjegy', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },

  // Iskola / Munka
  { kana: 'がっこう', romaji: 'gakkou', hu: 'iskola', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'しょうがっこう', romaji: 'shougakkou', hu: 'általános iskola', tags: ['iskola'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'ちゅうがっこう', romaji: 'chuugakkou', hu: 'alsó-középiskola', tags: ['iskola'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'こうこう', romaji: 'koukou', hu: 'felső-középiskola, gimnázium', tags: ['iskola'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'だいがく', romaji: 'daigaku', hu: 'egyetem, főiskola', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'けいざいだいがく', romaji: 'keizai daigaku', hu: 'gazdasági egyetem', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'せいと', romaji: 'seito', hu: 'tanuló', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'がくせい', romaji: 'gakusei', hu: 'diák', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'こうこうせい', romaji: 'koukousei', hu: 'középiskolás, gimnazista', tags: ['iskola'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'だいがくせい', romaji: 'daigakusei', hu: 'egyetemista, főiskolás', tags: ['iskola'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'しごと', romaji: 'shigoto', hu: 'munka', tags: ['munka'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'せんせい', romaji: 'sensei', hu: 'tanár', tags: ['iskola', 'munka'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'いしゃ', romaji: 'isha', hu: 'orvos', tags: ['munka'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'かいしゃいん', romaji: 'kaishain', hu: 'vállalati dolgozó', tags: ['munka'], jlpt: 'N4', lesson: [1], source: 'dekiru' },

  // Hobbi / Szabadidő
  { kana: 'しゅみ', romaji: 'shumi', hu: 'hobbi', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'スポーツ', romaji: 'supootsu', hu: 'sport', tags: ['sport'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'バレーボール', romaji: 'bareebooru', hu: 'röplabda', tags: ['sport'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'サッカー', romaji: 'sakkaa', hu: 'foci', tags: ['sport'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'テニス', romaji: 'tenisu', hu: 'tenisz(ezés)', tags: ['sport'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'バスケットボール', romaji: 'basukettobooru', hu: 'kosárlabda', tags: ['sport'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'アニメ', romaji: 'anime', hu: 'rajzfilm', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'えいが', romaji: 'eiga', hu: 'film', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'おんがく', romaji: 'ongaku', hu: 'zene', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ピアノ', romaji: 'piano', hu: 'zongora, pianínó', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'りょうり', romaji: 'ryouri', hu: 'étel, főzés', tags: ['ételek'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'しゃしん', romaji: 'shashin', hu: 'fénykép', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'ほん', romaji: 'hon', hu: 'könyv', tags: ['iskola', 'tárgyak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'え', romaji: 'e', hu: 'kép, festmény', tags: ['szórakozás'], jlpt: 'N5', lesson: [1], source: 'dekiru' },

  // Nyelvtani / Egyéb kifejezések
  { kana: 'れい', romaji: 'rei', hu: 'példa', tags: ['iskola'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'なに/なん', romaji: 'nani/nan', hu: 'mi?, micsoda?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: '~ねんせい', romaji: '~nensei', hu: '-dikos, -dik évfolyamos', tags: ['számlálószavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: '~さい', romaji: '~sai', hu: '- éves', tags: ['számlálószavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'はたち', romaji: 'hatachi', hu: 'húszéves', tags: ['alapszavak'], jlpt: 'N4', lesson: [1], source: 'dekiru' },
  { kana: 'はい', romaji: 'hai', hu: 'igen', tags: ['alapszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'いいえ', romaji: 'iie', hu: 'nem', tags: ['alapszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: '~さん', romaji: '-san', hu: '~ úr, ~ hölgy', tags: ['udvariasság'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: '~じん', romaji: '~jin', hu: '(vmilyen országból való) ember', tags: ['országok'], jlpt: 'N5', lesson: [1], source: 'dekiru' },
  { kana: 'そう', romaji: 'sou', hu: 'úgy', tags: ['alapszavak'], jlpt: 'N5', lesson: [1], source: 'dekiru' }
];
const DEKIRU_L2 = [
  // Ház és helyiségek
  { kana: 'へや', romaji: 'heya', hu: 'szoba', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'げんかん', romaji: 'genkan', hu: 'előszoba, bejárat', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'しんしつ', romaji: 'shinshitsu', hu: 'hálószoba', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'せんめんじょ', romaji: 'senmenjo', hu: 'mosdó', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'てあらい', romaji: 'tearai', hu: 'toalett, kézmosó', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ふろ', romaji: 'furo', hu: 'fürdő', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'だいどころ', romaji: 'daidokoro', hu: 'konyha', tags: ['helyek'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'リビング', romaji: 'ribingu', hu: 'nappali', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'いま', romaji: 'ima', hu: 'nappali', tags: ['helyek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'おしいれ', romaji: 'oshiire', hu: 'beépített szekrény', tags: ['tárgyak'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'たたみ', romaji: 'tatami', hu: 'tatami, gyékénypadló', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'まど', romaji: 'mado', hu: 'ablak', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },

  // Iskola és írószerek
  { kana: 'ほんだな', romaji: 'hondana', hu: 'könyvespolc', tags: ['tárgyak', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'つくえ', romaji: 'tsukue', hu: 'asztal, íróasztal', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'きょうしつ', romaji: 'kyoushitsu', hu: 'tanterem', tags: ['helyek', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'うんどうじょう', romaji: 'undoujou', hu: 'sportpálya', tags: ['helyek', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'たいいくかん', romaji: 'taiikukan', hu: 'tornaterem', tags: ['helyek', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'としょしつ', romaji: 'toshoshitsu', hu: 'könyvolvasó, könyvtárszoba', tags: ['helyek', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'こくばん', romaji: 'kokuban', hu: 'iskolai tábla', tags: ['iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'いけ', romaji: 'ike', hu: 'tavacska (kis tó)', tags: ['természet'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'えんぴつ', romaji: 'enpitsu', hu: 'ceruza', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ペン', romaji: 'pen', hu: 'toll', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ボールペン', romaji: 'boorupen', hu: 'golyóstoll', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ノート', romaji: 'nooto', hu: '(jegyzet)füzet', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'けしゴム', romaji: 'keshigomu', hu: 'radir(gumi)', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'じしょ', romaji: 'jisho', hu: 'szótár', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'てんしじしょ', romaji: 'denshijisho', hu: 'elektronikus szótár', tags: ['tárgyak', 'iskola'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'コンピューター', romaji: 'konpyuutaa', hu: 'számítógép, komputer', tags: ['tárgyak', 'iskola'], jlpt: 'N5', lesson: [2], source: 'dekiru' },

  // Személyes tárgyak
  { kana: 'ラケット', romaji: 'raketto', hu: '(tenisz)ütő', tags: ['tárgyak', 'sport'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'てんわ', romaji: 'denwa', hu: 'telefon', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'けいたい', romaji: 'keitai', hu: 'mobil(telefon)', tags: ['tárgyak'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'かぎ', romaji: 'kagi', hu: 'kulcs', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'かさ', romaji: 'kasa', hu: 'esernyő', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'じてんしゃ', romaji: 'jitensha', hu: 'kerékpár', tags: ['közlekedés'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'かばん', romaji: 'kaban', hu: 'táska', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ぼうし', romaji: 'boushi', hu: 'sapka, kalap', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'くつ', romaji: 'kutsu', hu: 'cipő', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'スリッパ', romaji: 'surippa', hu: '(házi)papucs', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'めがね', romaji: 'megane', hu: 'szemüveg', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'スカーフ', romaji: 'sukaafu', hu: 'sál, kendő', tags: ['tárgyak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },

  // Ételek és italok
  { kana: 'のみもの', romaji: 'nomimono', hu: 'innivaló', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'コーヒー', romaji: 'koohii', hu: 'kávé', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ジュース', romaji: 'juusu', hu: 'gyümölcslé, üdítő', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ちゃ', romaji: 'cha', hu: 'zöld tea, teaceremónia', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'こうちゃ', romaji: 'kocha', hu: '(fekete) tea', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'むぎちゃ', romaji: 'mugicha', hu: 'mugicha (gabonatea)', tags: ['italok'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'かし', romaji: 'kashi', hu: 'édesség', tags: ['ételek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'まんじゅう', romaji: 'manjuu', hu: 'manjů (édesség)', tags: ['ételek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'すし', romaji: 'sushi', hu: 'szusi (japán étel)', tags: ['ételek'], jlpt: 'N5', lesson: [2], source: 'dekiru' },

  // Kérdőszavak és határozók
  { kana: 'そろそろ', romaji: 'sorosoro', hu: 'lassan, hamarosan', tags: ['alapszavak'], jlpt: 'N4', lesson: [2], source: 'dekiru' },
  { kana: 'どれ', romaji: 'dore', hu: 'melyik?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'どの', romaji: 'dono', hu: 'melyik...?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'どこ', romaji: 'doko', hu: 'hol?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'だれ', romaji: 'dare', hu: 'ki?, kicsoda?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },

  // Mutatószók és egyéb
  { kana: 'これ', romaji: 'kore', hu: 'ez', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'それ', romaji: 'sore', hu: 'az', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'あれ', romaji: 'are', hu: '(am)az', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'この', romaji: 'kono', hu: 'ez a', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'その', romaji: 'sono', hu: 'az a...', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'あの', romaji: 'ano', hu: '(am)az a...', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'ここ', romaji: 'koko', hu: 'itt', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'そこ', romaji: 'soko', hu: 'ott', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'あそこ', romaji: 'asoko', hu: 'amott', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'どうぞ', romaji: 'douzo', hu: 'tessék', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' },
  { kana: 'では', romaji: 'dewa', hu: 'akkor, hát', tags: ['alapszavak'], jlpt: 'N5', lesson: [2], source: 'dekiru' }
];
const DEKIRU_L3 = [
  // Igék
  { kana: 'ある', romaji: 'aru', hu: 'van, létezik (tárgy, növény)', tags: ['igék'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'いる', romaji: 'iru', hu: 'van, létezik (élőlény)', tags: ['igék'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Városi helyszínek
  { kana: 'えき', romaji: 'eki', hu: 'állomás, pályaudvar', tags: ['helyek', 'közlekedés'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ぎんこう', romaji: 'ginkou', hu: 'bank', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ゆうびんきょく', romaji: 'yuubinkyoku', hu: 'postahivatal', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'エーティーエム', romaji: 'eetiiemu', hu: 'ATM automata', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'みち', romaji: 'michi', hu: 'út, utca', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'こうえん', romaji: 'kouen', hu: 'park', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'みせ', romaji: 'mise', hu: 'üzlet', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'コンビニ', romaji: 'konbini', hu: 'éjjel-nappali', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ショッピングセンター', romaji: 'shoppingusentaa', hu: 'bevásárlóközpont', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ほんや', romaji: 'hon-ya', hu: 'könyvesbolt', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'すしや', romaji: 'sushi-ya', hu: 'szusi étterem', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'とこや', romaji: 'toko-ya', hu: 'férfifodrász, borbély', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Otthoni tárgyak
  { kana: 'いえ', romaji: 'ie', hu: 'lakás, ház', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'たな', romaji: 'tana', hu: 'polc', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'テーブル', romaji: 'teeburu', hu: 'asztal', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'いす', romaji: 'isu', hu: 'szék', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'テレビ', romaji: 'terebi', hu: 'televízió', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'れいぞうこ', romaji: 'reizouko', hu: 'hűtőszekrény', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'とけい', romaji: 'tokei', hu: 'óra', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ふとん', romaji: 'futon', hu: 'futon, paplan, matrac', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'はこ', romaji: 'hako', hu: 'doboz', tags: ['tárgyak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Természet és állatok
  { kana: 'にわ', romaji: 'niwa', hu: 'kert', tags: ['helyek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'き', romaji: 'ki', hu: 'fa', tags: ['természet'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'はな', romaji: 'hana', hu: 'virág', tags: ['természet'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'いぬ', romaji: 'inu', hu: 'kutya', tags: ['állatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ねこ', romaji: 'neko', hu: 'macska', tags: ['állatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'さかな', romaji: 'sakana', hu: 'hal', tags: ['állatok', 'ételek'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'とり', romaji: 'tori', hu: 'madár', tags: ['állatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Család és személyek
  { kana: 'かぞく', romaji: 'kazoku', hu: 'család', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'りょうしん', romaji: 'ryoushin', hu: 'szüleim', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [3], source: 'dekiru' },
  { kana: 'ちち', romaji: 'chichi', hu: 'apám', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'おかあさん', romaji: 'okaasan', hu: 'édesanya', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'きょうだい', romaji: 'kyoudai', hu: 'testvér', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'あに', romaji: 'ani', hu: 'bátyám', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'あね', romaji: 'ane', hu: 'nővérem', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'おとうと', romaji: 'otouto', hu: 'öcsém', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'いもうと', romaji: 'imouto', hu: 'húgom', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ひと', romaji: 'hito', hu: 'ember', tags: ['alapszavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'あかちゃん', romaji: 'akachan', hu: 'csecsemő, kisbaba', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Helymeghatározás
  { kana: 'うえ', romaji: 'ue', hu: 'fölött, fent, -on, -en, -ön', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'した', romaji: 'shita', hu: 'alatt', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'まえ', romaji: 'mae', hu: 'előtt', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'うしろ', romaji: 'ushiro', hu: 'mögött', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'みぎ', romaji: 'migi', hu: 'jobb(ra)', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ひだり', romaji: 'hidari', hu: 'bal(ra)', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'なか', romaji: 'naka', hu: 'bent, belül', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'そと', romaji: 'soto', hu: 'kint, kívül', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'となり', romaji: 'tonari', hu: 'mellett, szomszéd', tags: ['irányok'], jlpt: 'N5', lesson: [3], source: 'dekiru' },

  // Melléknevek és egyéb
  { kana: 'かわいい', romaji: 'kawaii', hu: 'aranyos, helyes, édes', tags: ['alapszavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ハンサム', romaji: 'hansamu', hu: 'jóképű', tags: ['alapszavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ちょっと', romaji: 'chotto', hu: 'egy kicsit', tags: ['alapszavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ひとり', romaji: 'hitori', hu: 'egy ember', tags: ['számlálószavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' },
  { kana: 'ふたり', romaji: 'futari', hu: 'két ember', tags: ['számlálószavak'], jlpt: 'N5', lesson: [3], source: 'dekiru' }
];
const DEKIRU_L4 = [
  // Vásárlás és helyszínek
  { kana: 'きゃく', romaji: 'kyaku', hu: 'vendég, vásárló', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'てんいん', romaji: 'ten-in', hu: 'eladó (bolti alkalmazott)', tags: ['munka'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'デパート', romaji: 'depaato', hu: 'áruház', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'どうぶつえん', romaji: 'doubutsuen', hu: 'állatkert', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ゆうえんち', romaji: 'yuuenchi', hu: 'vidámpark', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'レストラン', romaji: 'resutoran', hu: 'étterem, vendéglő', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'やおや', romaji: 'yaoya', hu: 'zöldséges', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'スーパー', romaji: 'suupaa', hu: 'szupermarket', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'びょういん', romaji: 'byouin', hu: 'kórház', tags: ['helyek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'スイス', romaji: 'suisu', hu: 'Svájc', tags: ['országok'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Ételek és italok
  { kana: 'ぎゅうにゅう', romaji: 'gyuunyuu', hu: 'tej', tags: ['ételek', 'italok'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ワイン', romaji: 'wain', hu: 'bor', tags: ['italok'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'まっちゃ', romaji: 'maccha', hu: 'maccha (zöld por tea)', tags: ['italok'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'バナナ', romaji: 'banana', hu: 'banán', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'りんご', romaji: 'ringo', hu: 'alma', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'みかん', romaji: 'mikan', hu: 'mandarin', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'チョコレート', romaji: 'chokoreeto', hu: 'csokoládé', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ケーキ', romaji: 'keeki', hu: 'torta, sütemény', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'パン', romaji: 'pan', hu: 'kenyér, péksütemény', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'フランスパン', romaji: 'furansupan', hu: 'franciakenyér', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ピザ', romaji: 'piza', hu: 'pizza', tags: ['ételek'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Tárgyak
  { kana: 'シャツ', romaji: 'shatsu', hu: 'ing', tags: ['tárgyak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'きって', romaji: 'kitte', hu: 'bélyeg', tags: ['tárgyak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ざっし', romaji: 'zasshi', hu: 'folyóirat', tags: ['tárgyak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ばんごう', romaji: 'bangou', hu: 'szám', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'セーター', romaji: 'seetaa', hu: 'pulóver, szvetter', tags: ['tárgyak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Időmeghatározás
  { kana: 'きょう', romaji: 'kyou', hu: 'ma', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'あした', romaji: 'ashita', hu: 'holnap', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'げつようび', romaji: 'getsuyoubi', hu: 'hétfő', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'かようび', romaji: 'kayoubi', hu: 'kedd', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'すいようび', romaji: 'suiyoubi', hu: 'szerda', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'もくようび', romaji: 'mokuyoubi', hu: 'csütörtök', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'きんようび', romaji: 'kinyoubi', hu: 'péntek', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'どようび', romaji: 'doyoubi', hu: 'szombat', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'にちようび', romaji: 'nichiyoubi', hu: 'vasárnap', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ごぜん', romaji: 'gozen', hu: 'délelőtt', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ごご', romaji: 'gogo', hu: 'délután', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'あさ', romaji: 'asama', hu: 'reggel', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ひる', romaji: 'hiru', hu: 'nappal', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ばん', romaji: 'ban', hu: 'este', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'よる', romaji: 'yoru', hu: 'este, éjjel', tags: ['idő'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Melléknevek és határozók
  { kana: 'おいしい', romaji: 'oishii', hu: 'finom', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'たくさん', romaji: 'takusan', hu: 'sok', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'また', romaji: 'mata', hu: 'megint, ismét', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'もう', romaji: 'mou', hu: 'már / még', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Kérdőszavak és számok
  { kana: 'いくつ', romaji: 'ikutsu', hu: 'hány?, mennyi?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'いくら', romaji: 'ikura', hu: 'mennyibe kerül?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ひとつ', romaji: 'hitosu', hu: 'egy', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ふたつ', romaji: 'futatsu', hu: 'kettő', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'みっつ', romaji: 'mittsu', hu: 'három', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'よっつ', romaji: 'yottsu', hu: 'négy', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'いつつ', romaji: 'itsutsu', hu: 'öt', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'むっつ', romaji: 'muttsu', hu: 'hat', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ななtsu', romaji: 'nanatsu', hu: 'hét', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'やっつ', romaji: 'yattsu', hu: 'nyolc', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'ここのつ', romaji: 'kokonotsu', hu: 'kilenc', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'とお', romaji: 'too', hu: 'tíz', tags: ['számlálószavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },

  // Egyéb
  { kana: 'はん', romaji: 'han', hu: 'fél', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'こんな', romaji: 'konna', hu: 'ilyen', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'そんな', romaji: 'sonna', hu: 'olyan', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'あんな', romaji: 'anna', hu: 'olyan', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' },
  { kana: 'でも', romaji: 'demo', hu: 'de, viszont', tags: ['alapszavak'], jlpt: 'N5', lesson: [4], source: 'dekiru' }
];
const DEKIRU_L5 = [
  // Mozgást kifejező igék
  { kana: 'いく', romaji: 'iku', hu: 'megy', tags: ['igék'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'かえる', romaji: 'kaeru', hu: 'hazamegy', tags: ['igék'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'くる', romaji: 'kuru', hu: 'jön', tags: ['igék'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Közlekedés
  { kana: 'のりもの', romaji: 'norimono', hu: 'közlekedési eszköz, jármű', tags: ['közlekedés'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'くるま', romaji: 'kuruma', hu: 'autó, kocsi, kerék', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'じどうしゃ', romaji: 'jidousha', hu: 'autó, gépkocsi', tags: ['közlekedés'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'バス', romaji: 'basu', hu: 'busz', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'してん', romaji: 'shiten', hu: 'villamos', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ひこうき', romaji: 'hikouki', hu: 'repülőgép', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ちかてつ', romaji: 'chikatetsu', hu: 'metró, földalatti vasút', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'でんしゃ', romaji: 'densha', hu: '(villany)vonat', tags: ['közlekedés'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Helyszínek és tárgyak
  { kana: 'うち', romaji: 'uchi', hu: 'otthon', tags: ['helyek'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'こうばん', romaji: 'kouban', hu: 'rendőrőrs', tags: ['helyek'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'えいがかん', romaji: 'eigakan', hu: 'mozi', tags: ['helyek'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'としょかん', romaji: 'toshokan', hu: 'könyvtár', tags: ['helyek'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'プール', romaji: 'puuru', hu: 'uszoda, úszómedence', tags: ['helyek'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'きょうかい', romaji: 'kyoukai', hu: '(keresztény) templom, egyház', tags: ['helyek'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'メール', romaji: 'meeru', hu: 'e-mail, sms', tags: ['tárgyak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'きょうかしょ', romaji: 'kyoukasho', hu: 'tankönyv', tags: ['iskola', 'tárgyak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Iskola és fogalmak
  { kana: 'クラス', romaji: 'kurasu', hu: 'osztály, tanóra', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'じゅぎょう', romaji: 'jugyou', hu: 'tanóra (iskolai)', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'かいわ', romaji: 'kaiwa', hu: 'társalgás', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'テスト', romaji: 'tesuto', hu: 'teszt, dolgozat', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'しゅくだい', romaji: 'shukudai', hu: 'házi feladat', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'しつもん', romaji: 'shitsumon', hu: 'kérdés', tags: ['iskola'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'くに', romaji: 'kuni', hu: 'ország', tags: ['országok'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'やま', romaji: 'yama', hu: 'hegy', tags: ['természet'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'しま', romaji: 'shima', hu: 'sziget', tags: ['természet'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'きょうと', romaji: 'kyouto', hu: 'Kiotó', tags: ['helyek'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ウィーン', romaji: 'wiin', hu: 'Bécs', tags: ['helyek'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Dátumok és idő (napok)
  { kana: 'いちにち', romaji: 'ichinichi', hu: 'egy nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ついたち', romaji: 'tsuitachi', hu: 'elseje', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ふつか', romaji: 'futsuka', hu: 'másodika, két nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'みっか', romaji: 'mikka', hu: 'harmadika, három nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'よっか', romaji: 'yokka', hu: 'negyedike, négy nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'いつか', romaji: 'itsuka', hu: 'ötödike, öt nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'むいか', romaji: 'muika', hu: 'hatodika, hat nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'なのか', romaji: 'nanoka', hu: 'hetedike, hét nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ようか', romaji: 'youka', hu: 'nyolcadika, nyolc nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ここのか', romaji: 'kokonoka', hu: 'kilencedike, kilenc nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'とおか', romaji: 'tooka', hu: 'tizedike, tíz nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'はつか', romaji: 'hatsuka', hu: 'huszadika, húsz nap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ひとつき', romaji: 'hitotsuki', hu: 'egy hónap (időtartam)', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Időmeghatározás (múlt, jelen, jövő)
  { kana: 'ゆうべ', romaji: 'yuube', hu: 'múlt éjszaka', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'きのう', romaji: 'kinou', hu: 'tegnap', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'おototoi', romaji: 'ototoi', hu: 'tegnapelőtt', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'あさって', romaji: 'asatte', hu: 'holnapután', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'せんしゅう', romaji: 'senshuu', hu: 'múlt hét', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'こんしゅう', romaji: 'konshuu', hu: 'e hét', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'らいしゅう', romaji: 'raishuu', hu: 'jövő hét', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'せんげつ', romaji: 'sengetsu', hu: 'múlt hónap', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'こんげつ', romaji: 'kongetsu', hu: 'e hónap', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'らいげつ', romaji: 'raigetsu', hu: 'jövő hónap', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'きょねn', romaji: 'kyonen', hu: 'múlt év, tavaly', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'ことし', romaji: 'kotoshi', hu: 'idei év, idén', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'らいねん', romaji: 'rainen', hu: 'jövő év', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },

  // Szünetek és közösség
  { kana: 'しゅうまつ', romaji: 'shuumatsu', hu: 'hétvége', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'やすみ', romaji: 'yasumi', hu: 'pihenés, szünet', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ひるやすみ', romaji: 'hiruyasumi', hu: 'ebédszünet', tags: ['idő', 'iskola'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'なつやすみ', romaji: 'natsuyasumi', hu: 'nyári szünet', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'ふゆやすみ', romaji: 'fuyuyasumi', hu: 'téli szünet', tags: ['idő'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'わたしたち', romaji: 'watashitachi', hu: 'mi', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ともだち', romaji: 'tomodachi', hu: 'barát', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'こうはい', romaji: 'kouhai', hu: 'kouhai (fiatalabb csoporttag)', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'みなさん', romaji: 'minasan', hu: 'mindenki', tags: ['alapszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },

  // Egyéb
  { kana: 'ほんとう', romaji: 'hontou', hu: 'igazság, valóság', tags: ['alapszavak'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'ちかく', romaji: 'chikaku', hu: 'közel', tags: ['alapszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'はやい', romaji: 'hayai', hu: 'gyors', tags: ['alapszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'いっしょに', romaji: 'isshoni', hu: 'együtt', tags: ['alapszavak'], jlpt: 'N4', lesson: [5], source: 'dekiru' },
  { kana: 'いつも', romaji: 'itsumo', hu: 'mindig', tags: ['alapszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'これから', romaji: 'korekara', hu: 'mostantól, most', tags: ['idő'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'ほかに', romaji: 'hokani', hu: 'azonkívül', tags: ['alapszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' },
  { kana: 'どのくらい', romaji: 'donokurai', hu: 'körülbelül mennyi?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [5], source: 'dekiru' }
];
const DEKIRU_L6 = [
  // Igék (I-II-III csoport)
  { kana: 'あう', romaji: 'au', hu: 'találkozik', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'かう', romaji: 'kau', hu: 'vesz, vásárol', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'かく', romaji: 'kaku', hu: 'ír / rajzol', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'きく', romaji: 'kiku', hu: 'hallgat, hall, kérdez', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'つくる', romaji: 'tsukuru', hu: 'készít, gyárt', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'のむ', romaji: 'nomu', hu: 'iszik', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'よむ', romaji: 'yomu', hu: 'olvas', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'あびる', romaji: 'abiru', hu: 'zuhanyozik', tags: ['igék'], jlpt: 'N4', lesson: [6], source: 'dekiru' },
  { kana: 'おきる', romaji: 'okiru', hu: 'felébred, felkel', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'たべる', romaji: 'taberu', hu: 'eszik', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ねる', romaji: 'neru', hu: 'alszik, lefekszik', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'みる', romaji: 'miru', hu: 'néz, lát', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'する', romaji: 'suru', hu: 'csinál, tesz', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'さんぽする', romaji: 'sanposuru', hu: 'sétál', tags: ['igék'], jlpt: 'N4', lesson: [6], source: 'dekiru' },
  { kana: 'べんきょうする', romaji: 'benkyousuru', hu: 'tanul', tags: ['igék'], jlpt: 'N5', lesson: [6], source: 'dekiru' },

  // Szórakozás és tárgyak
  { kana: 'さくら', romaji: 'sakura', hu: 'cseresznyefa / virág', tags: ['természet'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ラジオ', romaji: 'rajio', hu: 'rádió', tags: ['tárgyak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'シーディー', romaji: 'shiidii', hu: 'CD', tags: ['tárgyak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ロック', romaji: 'rokku', hu: 'rockzene', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ポップ', romaji: 'poppu', hu: 'popzene', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'クラシック', romaji: 'kurashikku', hu: 'klasszikus zene', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'じ', romaji: 'ji', hu: 'betű, írás', tags: ['iskola'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'かんじ', romaji: 'kanji', hu: 'kínai írásjegy, kanji', tags: ['iskola'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'てがmi', romaji: 'tegami', hu: 'levél', tags: ['kommunikáció'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'にっき', romaji: 'nikki', hu: 'napló', tags: ['alapszavak'], jlpt: 'N4', lesson: [6], source: 'dekiru' },
  { kana: 'しんぶん', romaji: 'shinbun', hu: 'újság', tags: ['alapszavak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ニュース', romaji: 'nyuusu', hu: 'híradó, hírek', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'まんが', romaji: 'manga', hu: 'manga, képregény', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ドラマ', romaji: 'dorama', hu: 'TV sorozat', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ふく', romaji: 'fuku', hu: 'ruha', tags: ['tárgyak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'シャワー', romaji: 'shawaa', hu: 'zuhany, tus', tags: ['mindennapi élet'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'パーティー', romaji: 'paatii', hu: 'összejövetel, buli', tags: ['szórakozás'], jlpt: 'N5', lesson: [6], source: 'dekiru' },

  // Sport és helyszínek
  { kana: 'けんどう', romaji: 'kendou', hu: 'kendó (vívás)', tags: ['sport'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'じゅうどう', romaji: 'juudou', hu: 'dzsúdó', tags: ['sport'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ジョギング', romaji: 'jogingu', hu: 'kocogás', tags: ['sport'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'スキー', romaji: 'sukii', hu: 'sí(elés)', tags: ['sport'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'やきゅう', romaji: 'yakyuu', hu: 'baseball', tags: ['sport'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ちゅうごく', romaji: 'chuugoku', hu: 'Kína', tags: ['országok'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ロシア', romaji: 'roshia', hu: 'Oroszország', tags: ['országok'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'にしえき', romaji: 'nishieki', hu: 'Nyugati pályaudvar', tags: ['helyek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ひろば', romaji: 'hiroba', hu: 'tér', tags: ['helyek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ぶんぼう', romaji: 'bunbou', hu: 'nyelvtan', tags: ['iskola'], jlpt: 'N5', lesson: [6], source: 'dekiru' },

  // Ételek és napszakok
  { kana: 'ごはん', romaji: 'gohan', hu: 'főtt rizs, étkezés', tags: ['ételek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'べんとう', romaji: 'bentou', hu: 'bentó (dobozos étel)', tags: ['ételek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'あさごはん', romaji: 'asagohan', hu: 'reggeli', tags: ['ételek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ひるごはん', romaji: 'hirugohan', hu: 'ebéd', tags: ['ételek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ばんごはん', romaji: 'bangohan', hu: 'vacsora', tags: ['ételek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'じかん', romaji: 'jikan', hu: 'idő', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'けさ', romaji: 'kesa', hu: 'ma reggel', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'こんばん', romaji: 'konban', hu: 'ma este', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'こnや', romaji: 'konya', hu: 'ma este, ma éjjel', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'ゆうがた', romaji: 'yuugata', hu: 'késő délután, alkony', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },

  // Határozószók és egyéb
  { kana: 'いい/よい', romaji: 'ii/yoi', hu: 'jó', tags: ['melléknevek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'すごい', romaji: 'sugoi', hu: 'nagyszerű, remek', tags: ['melléknevek'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'まいにち', romaji: 'mainichi', hu: 'mindennap', tags: ['idő'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'まいあさ', romaji: 'maiasa', hu: 'minden reggel', tags: ['idő'], jlpt: 'N4', lesson: [6], source: 'dekiru' },
  { kana: 'まいばん', romaji: 'maiban', hu: 'minden este', tags: ['idő'], jlpt: 'N4', lesson: [6], source: 'dekiru' },
  { kana: 'いつ', romaji: 'itsu', hu: 'mikor?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'そして', romaji: 'soshite', hu: 'és', tags: ['alapszavak'], jlpt: 'N5', lesson: [6], source: 'dekiru' },
  { kana: 'それから', romaji: 'sorekara', hu: 'azután, utána', tags: ['idő'], jlpt: 'N4', lesson: [6], source: 'dekiru' }
];
const DEKIRU_L7 = [
  // Igék
  { kana: 'がんばる', romaji: 'ganbaru', hu: 'igyekszik, iparkodik', tags: ['igék'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'しる', romaji: 'shiru', hu: 'tud, ismer', tags: ['igék'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'とる', romaji: 'toru', hu: 'fényképet készít', tags: ['igék'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'のる', romaji: 'noru', hu: 'felszáll (járműre)', tags: ['igék'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'はいる', romaji: 'hairu', hu: 'belép, bemegy', tags: ['igék'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'でんわする', romaji: 'denwasuru', hu: 'telefonál', tags: ['igék'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'しつれいする', romaji: 'shitsureisuru', hu: 'elnézést kér (távozáskor)', tags: ['igék', 'udvariasság'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'れんしゅうする', romaji: 'renshuusuru', hu: 'gyakorol', tags: ['igék'], jlpt: 'N4', lesson: [7], source: 'dekiru' },

  // Ételek és színek
  { kana: 'たべもの', romaji: 'tabemono', hu: 'ennivaló', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'くだもの', romaji: 'kudamono', hu: 'gyümölcs', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'やさい', romaji: 'yasai', hu: 'zöldség', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'トマト', romaji: 'tomato', hu: 'paradicsom', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'パプリカ', romaji: 'papurika', hu: 'paprika', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'てんぷら', romaji: 'tenpura', hu: 'tempura (japán étel)', tags: ['ételek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'いろ', romaji: 'iro', hu: 'szín', tags: ['alapszavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'くろ', romaji: 'kuro', hu: 'fekete', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'しろ', romaji: 'shiro', hu: 'fehér', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'あお', romaji: 'ao', hu: 'kék', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'あか', romaji: 'aka', hu: 'piros', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'きいろ', romaji: 'kiiro', hu: 'sárga', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'ちゃいろ', romaji: 'chairo', hu: 'barna', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'みどり', romaji: 'midori', hu: 'zöld', tags: ['színek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },

  // Társasági élet és szórakozás
  { kana: 'クラブ', romaji: 'kurabu', hu: 'klub', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'サークル', romaji: 'saakuru', hu: 'kör, szakkör', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'せんぱい', romaji: 'senpai', hu: 'idősebb csoporttag', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'ポスター', romaji: 'posutaa', hu: 'plakát', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'かね', romaji: 'kane', hu: 'pénz', tags: ['alapszavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'カメラ', romaji: 'kamera', hu: 'fényképezőgép, kamera', tags: ['tárgyak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'タクシー', romaji: 'takushii', hu: 'taxi', tags: ['közlekedés'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'コンサート', romaji: 'konsaato', hu: 'koncert', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'フェスティバル', romaji: 'fesutibaru', hu: 'fesztivál', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'コメディー', romaji: 'komedii', hu: 'vígjáték', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'ホラー', romaji: 'horaa', hu: 'horror', tags: ['szórakozás'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'へいじつ', romaji: 'heijitsu', hu: 'hétköznap', tags: ['idő'], jlpt: 'N5', lesson: [7], source: 'dekiru' },

  // Melléknevek és vélemény
  { kana: 'すき', romaji: 'suki', hu: 'szeretett, kedvelt', tags: ['melléknevek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'だいすき', romaji: 'daisuki', hu: 'kedvenc, legjobban kedvelt', tags: ['melléknevek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'きらい', romaji: 'kirai', hu: 'nem szeretett, utált', tags: ['melléknevek'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'だいじょうぶ', romaji: 'daijoubu', hu: 'rendben lévő', tags: ['alapszavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'ざんねん', romaji: 'zannen', hu: 'sajnálatos', tags: ['alapszavak'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'だめ', romaji: 'dame', hu: 'rossz, nem megfelelő', tags: ['alapszavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'ときどき', romaji: 'tokidoki', hu: 'néha', tags: ['idő'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'あまり', romaji: 'amari', hu: 'nem nagyon (tagadással)', tags: ['határozószavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'ぜんぜん', romaji: 'zenzen', hu: 'egyáltalán nem (tagadással)', tags: ['határozószavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'とても', romaji: 'totemo', hu: 'nagyon', tags: ['határozószavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' },
  { kana: 'こんど', romaji: 'kondo', hu: 'legközelebb', tags: ['idő'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'はじめて', romaji: 'hajimete', hu: 'először (életében)', tags: ['idő'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'どうして', romaji: 'doushite', hu: 'miért?', tags: ['kérdőszavak'], jlpt: 'N4', lesson: [7], source: 'dekiru' },
  { kana: 'どんな', romaji: 'donna', hu: 'milyen?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [7], source: 'dekiru' }
];
const DEKIRU_L8 = [
  // Igék
  { kana: 'とる', romaji: 'toru', hu: '(könyvet) kézbe vesz, felvesz', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'もつ', romaji: 'motsu', hu: 'kézben tart, fog', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'やすむ', romaji: 'yasumu', hu: 'pihen; hiányzik', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'わかる', romaji: 'wakaru', hu: 'ért, tud', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'つける', romaji: 'tsukeru', hu: '(villanyt) felgyújt, felkapcsol', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あける', romaji: 'akeru', hu: 'kinyit', tags: ['igék'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'しめる', romaji: 'shimeru', hu: 'behúz, becsuk, bezár', tags: ['igék'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'おりる', romaji: 'oriru', hu: 'leszáll, lemegy', tags: ['igék'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'のりかえる', romaji: 'norikaeru', hu: 'átszáll', tags: ['igék'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //

  // Évszakok és időjárás
  { kana: 'きせつ', romaji: 'kisetsu', hu: 'évszak', tags: ['idő'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'はる', romaji: 'haru', hu: 'tavasz', tags: ['idő'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'なつ', romaji: 'natsu', hu: 'nyár', tags: ['idő'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あき', romaji: 'aki', hu: 'ősz', tags: ['idő'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ふゆ', romaji: 'fuyu', hu: 'tél', tags: ['idő'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'てんき', romaji: 'tenki', hu: 'időjárás', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'てんきよほう', romaji: 'tenkiyohou', hu: 'időjárás-jelentés', tags: ['időjárás'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'はれ', romaji: 'hare', hu: 'derült idő', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'くもり', romaji: 'kumori', hu: 'felhős idő', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あめ', romaji: 'ame', hu: 'eső', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ゆき', romaji: 'yuki', hu: 'hó', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //

  // Természet és helyszínek
  { kana: 'かわ', romaji: 'kawa', hu: 'folyó', tags: ['természet'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'みずうみ', romaji: 'mizuumi', hu: 'tó', tags: ['természet'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'はやし', romaji: 'hayashi', hu: 'liget', tags: ['természet'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'もり', romaji: 'mori', hu: 'erdő', tags: ['természet'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'もみじ', romaji: 'momiji', hu: 'juharfa, színes őszi lomb', tags: ['természet'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ところ', romaji: 'tokoro', hu: 'hely', tags: ['helyek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'まち', romaji: 'machi', hu: 'város', tags: ['helyek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ビル', romaji: 'biru', hu: 'épület (beton)', tags: ['helyek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'おてら', romaji: 'otera', hu: 'buddhista templom', tags: ['helyek'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'じんじゃ', romaji: 'jinja', hu: 'sintó szentély', tags: ['helyek'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'ふじさん', romaji: 'fujisan', hu: 'Fudzsi-hegy', tags: ['helyek', 'természet'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'しんかんせん', romaji: 'shinkansen', hu: 'japán szuperexpressz', tags: ['közlekedés'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'おうきゅう', romaji: 'oukyuu', hu: 'palota', tags: ['helyek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'きっさてん', romaji: 'kissaten', hu: 'kávéház, presszó', tags: ['helyek'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'きっぷ', romaji: 'kippu', hu: 'jegy', tags: ['tárgyak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'うりば', romaji: 'uriba', hu: 'elárusítóhely', tags: ['helyek'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //
  { kana: 'クリスマス', romaji: 'kurisumasu', hu: 'karácsony', tags: ['szórakozás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'でnき', romaji: 'denki', hu: 'villany, áram', tags: ['tárgyak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'にもつ', romaji: 'nimotsu', hu: 'csomag, poggyász', tags: ['tárgyak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'がいこくじん', romaji: 'gaikokujin', hu: 'külföldi (ember)', tags: ['emberek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'かた', romaji: 'kata', hu: 'személy (udvarias)', tags: ['emberek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //

  // Melléknevek
  { kana: 'くろい', romaji: 'kuroi', hu: 'fekete', tags: ['színek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'しろい', romaji: 'shiroi', hu: 'fehér', tags: ['színek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あかい', romaji: 'akai', hu: 'piros', tags: ['színek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あおい', romaji: 'aoi', hu: 'kék', tags: ['színek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'きいろい', romaji: 'kiiroi', hu: 'sárga', tags: ['színek'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'おおきい', romaji: 'ookii', hu: 'nagy', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ちいさい', romaji: 'chiisai', hu: 'kicsi', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'たかい', romaji: 'takai', hu: 'magas, drága', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'やすい', romaji: 'yasui', hu: 'olcsó', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あたらしい', romaji: 'atarashii', hu: 'új', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ふるい', romaji: 'furui', hu: 'régi', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あつい', romaji: 'atsui', hu: 'meleg, forró (hőm.)', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'さむい', romaji: 'samui', hu: 'hideg (idő)', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'あたたかい', romaji: 'atatakai', hu: 'meleg', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'すずしい', romaji: 'suzushii', hu: '(kellemesen) hűvös', tags: ['időjárás'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'にぎやか', romaji: 'nigiyaka', hu: 'nyüzsgő, forgalmas', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'しずか', romaji: 'shizuka', hu: 'csendes', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'きれい', romaji: 'kirei', hu: 'szép, tiszta', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'ゆうめい', romaji: 'yuumei', hu: 'híres', tags: ['alapszavak'], jlpt: 'N4', lesson: [8], source: 'dekiru' }, //

  // Határozószók és egyéb
  { kana: 'すこし', romaji: 'sukoshi', hu: 'kicsit', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'まず', romaji: 'mazu', hu: 'először, elsőként', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'どう', romaji: 'dou', hu: 'milyen?, hogyan?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' }, //
  { kana: 'さらに', romaji: 'soreni', hu: 'emellett', tags: ['alapszavak'], jlpt: 'N5', lesson: [8], source: 'dekiru' } //
];
const DEKIRU_L9 = [
  // Igék
  { kana: 'だす', romaji: 'dasu', hu: 'felad (levelet)', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1035]
  { kana: 'おくる', romaji: 'okuru', hu: 'küld vmit', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1038]
  { kana: 'あそぶ', romaji: 'asobu', hu: 'játszik, szórakozik', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1040]
  { kana: 'うたう', romaji: 'utau', hu: 'énekel, dalol', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1042]
  { kana: 'おどる', romaji: 'odoru', hu: 'táncol', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1043]
  { kana: 'およぐ', romaji: 'oyogu', hu: 'úszik', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1050]
  { kana: 'かかる', romaji: 'kakaru', hu: 'tart (vmennyi ideig)', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1052]
  { kana: 'しぬ', romaji: 'shinu', hu: 'meghal', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1054]
  { kana: 'たつ', romaji: 'tatsu', hu: 'telik (idő)', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1055]
  { kana: 'のぼる', romaji: 'noboru', hu: 'felmászik', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1056]
  { kana: 'はなす', romaji: 'hanasu', hu: 'beszél', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1058]
  { kana: 'かける', romaji: 'kakeru', hu: 'telefonál', tags: ['igék'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1062]
  { kana: 'でかける', romaji: 'dekakeru', hu: 'elmegy (otthonról)', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1063]
  { kana: 'しょうかいする', romaji: 'shoukaaisuru', hu: 'bemutat', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1064]
  { kana: 'せつめいする', romaji: 'setsumeisuru', hu: 'magyaráz', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1065]
  { kana: 'せんたくする', romaji: 'sentakusuru', hu: '(ruhát) mos', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1066]
  { kana: 'そうじする', romaji: 'soujisuru', hu: 'takarít', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1067]
  { kana: 'りょこうする', romaji: 'ryokousuru', hu: 'utazik', tags: ['igék'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1068]

  // Posta és szabadidő
  { kana: 'ポスト', romaji: 'posuto', hu: 'postaláda', tags: ['tárgyak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1070]
  { kana: 'ふうとう', romaji: 'fuutou', hu: 'boríték', tags: ['tárgyak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1071]
  { kana: 'はがき', romaji: 'hagaki', hu: 'levelezőlap', tags: ['tárgyak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1082]
  { kana: 'えはがき', romaji: 'ehagaki', hu: 'képeslap', tags: ['tárgyak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1084]
  { kana: 'こづつみ', romaji: 'kodutsumi', hu: 'csomag', tags: ['tárgyak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1086]
  { kana: 'こくない', romaji: 'kokunai', hu: 'belföld', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1089]
  { kana: 'こうくうびん', romaji: 'koukuubin', hu: 'légiposta', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1092]
  { kana: 'ふなびん', romaji: 'funabin', hu: 'hajóposta', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1093]
  { kana: 'かきとめ', romaji: 'kakitome', hu: 'ajánlott küldemény', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1094]
  { kana: 'そくたつ', romaji: 'sokutatsu', hu: 'expressz kézbesítés', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1095]
  { kana: 'うた', romaji: 'uta', hu: 'dal, ének', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1096]
  { kana: 'かいもの', romaji: 'kaimono', hu: '(be)vásárlás', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1097]
  { kana: 'カラオケ', romaji: 'karaoke', hu: 'karaoke', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1105]
  { kana: 'サウナ', romaji: 'sauna', hu: 'szauna', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1107]
  { kana: 'ディスコ', romaji: 'disuko', hu: 'diszkó', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1108]
  { kana: 'ハイキング', romaji: 'haikingu', hu: 'kirándulás', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1109]
  { kana: 'はなび', romaji: 'hanabi', hu: 'tűzijáték', tags: ['szórakozás'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1110]
  { kana: 'スター', romaji: 'sutaa', hu: 'sztár', tags: ['emberek'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1111]
  { kana: 'かしゅ', romaji: 'kashu', hu: 'énekes', tags: ['munka'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1112]
  { kana: 'けしき', romaji: 'keshiki', hu: 'táj, látkép', tags: ['természet'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1113]
  { kana: 'てつどう', romaji: 'tetsudou', hu: 'vasút', tags: ['közlekedés'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1122]
  { kana: 'はじめ', romaji: 'hajime', hu: 'kezdet, eleje', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1125]
  { kana: 'おわり', romaji: 'owari', hu: 'vége, befejezés', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1126]
  { kana: 'はんとし', romaji: 'hantoshi', hu: 'félév', tags: ['idő'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1128]

  // Melléknevek
  { kana: 'おおい', romaji: 'ooi', hu: 'sok', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1132]
  { kana: 'すくない', romaji: 'sukunai', hu: 'kevés', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1135]
  { kana: 'おもい', romaji: 'omoi', hu: 'nehéz (súlyra)', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1138]
  { kana: 'かるい', romaji: 'karui', hu: 'könnyű (súlyra)', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1139]
  { kana: 'ひろい', romaji: 'hiroi', hu: 'széles, tágas, nagy', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1142]
  { kana: 'せまい', romaji: 'semai', hu: 'szűk (tér)', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1144]
  { kana: 'きたない', romaji: 'kitanai', hu: 'piszkos', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1146]
  { kana: 'たのしい', romaji: 'tanoshii', hu: 'kellemes, szórakoztató', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1148]
  { kana: 'おもしろい', romaji: 'omoshiroi', hu: 'érdekes', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1151]
  { kana: 'つまらない', romaji: 'tsumaranai', hu: 'unalmas, jelentéktelen', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1153]
  { kana: 'いそがしい', romaji: 'isogashii', hu: 'elfoglalt', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1155]
  { kana: 'むずかしい', romaji: 'muzukashii', hu: 'nehéz (feladat)', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1157]
  { kana: 'ひま', romaji: 'hima', hu: 'szabad, ráér', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1158]
  { kana: 'かんたん', romaji: 'kantan', hu: 'egyszerű', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1159]
  { kana: 'げんき', romaji: 'genki', hu: 'élénk, egészséges', tags: ['alapszavak'], jlpt: 'N5', lesson: [9], source: 'dekiru' }, // [cite: 1160]
  { kana: 'しんせつ', romaji: 'shinsetsu', hu: 'kedves, segítőkész', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1162]
  { kana: 'ふべん', romaji: 'fuben', hu: 'kényelmetlen, nem praktikus', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' }, // [cite: 1163]
  { kana: 'べnり', romaji: 'benri', hu: 'kényelmes, praktikus', tags: ['alapszavak'], jlpt: 'N4', lesson: [9], source: 'dekiru' } // [cite: 1172]
];
const DEKIRU_L10 = [
  // Igék
  { kana: 'おす', romaji: 'osu', hu: 'nyom, tol', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'つかう', romaji: 'tsukau', hu: 'használ, (pénzt) költ', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'まつ', romaji: 'matsu', hu: 'vár', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'あらう', romaji: 'arau', hu: 'mos (pl. arcot)', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'みがく', romaji: 'migaku', hu: 'mos (fogat), fényesít', tags: ['igék'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'おしえる', romaji: 'oshieru', hu: 'tanít, tájékoztat', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'かりる', romaji: 'kariru', hu: 'kölcsönöz, kölcsönkér', tags: ['igék'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'いれる', romaji: 'ireru', hu: 'betesz', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'でる', romaji: 'deru', hu: 'kijön, kimegy, elmegy', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'あんないする', romaji: 'annaisuru', hu: 'idegenvezet, kalauzol', tags: ['igék'], jlpt: 'N5', lesson: [10], source: 'dekiru' },

  // Állatok
  { kana: 'どうぶつ', romaji: 'doubutsu', hu: 'állat', tags: ['állatok'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'むし', romaji: 'mushi', hu: 'bogár', tags: ['állatok'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'うし', romaji: 'ushi', hu: 'szarvasmarha', tags: ['állatok'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'うさぎ', romaji: 'usagi', hu: 'nyúl', tags: ['állatok'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'うま', romaji: 'uma', hu: 'ló', tags: ['állatok'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'トラ', romaji: 'tora', hu: 'tigris', tags: ['állatok'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ひつじ', romaji: 'hitsuji', hu: 'bárány', tags: ['állatok'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'ねずみ', romaji: 'nezumi', hu: 'egér', tags: ['állatok'], jlpt: 'N4', lesson: [10], source: 'dekiru' },

  // Gasztronómia (Ételek/Étterem)
  { kana: 'メニュー', romaji: 'menyuu', hu: 'menü', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ランチ', romaji: 'ranchi', hu: 'ebéd', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ファーストフード', romaji: 'faasutofoodo', hu: 'gyorsétkezés', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'がくしょく', romaji: 'gakushoku', hu: 'menza', tags: ['helyek', 'iskola'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'デザート', romaji: 'dezaato', hu: 'desszert', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'うどん', romaji: 'udon', hu: 'udon (japán tészta)', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'やきそば', romaji: 'yakisoba', hu: 'sült tészta', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ラーメン', romaji: 'raamen', hu: 'rámen (tésztaleves)', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'おにぎり', romaji: 'onigiri', hu: 'rizsgombóc', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'カレーライス', romaji: 'kareeraisu', hu: 'curry-s rizs', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'きゅうり', romaji: 'kyuuri', hu: 'uborka', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'なす', romaji: 'nasu', hu: 'padlizsán', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'じゃがいも', romaji: 'jagaimo', hu: 'burgonya', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'にんじん', romaji: 'ninjin', hu: 'sárgarépa', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'いちご', romaji: 'ichigo', hu: 'eper', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'ようなし', romaji: 'younashi', hu: 'körte', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'すいか', romaji: 'suika', hu: 'görögdinnye', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'ぶどう', romaji: 'budou', hu: 'szőlő', tags: ['ételek'], jlpt: 'N4', lesson: [10], source: 'dekiru' },
  { kana: 'メロン', romaji: 'meron', hu: 'sárgadinnye', tags: ['ételek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },

  // Testrészek és sport
  { kana: 'かお', romaji: 'kao', hu: 'arc', tags: ['testrészek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'は', romaji: 'ha', hu: 'fog', tags: ['testrészek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'て', romaji: 'te', hu: 'kéz', tags: ['testrészek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'すいきゅう', romaji: 'suikyuu', hu: 'vízilabda', tags: ['sport'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'フェンシング', romaji: 'fenshingu', hu: 'vívás', tags: ['sport'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'スケート', romaji: 'sukeeto', hu: 'korcsolya', tags: ['sport'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'バドミントン', romaji: 'badominton', hu: 'tollaslabda', tags: ['sport'], jlpt: 'N5', lesson: [10], source: 'dekiru' },

  // Város és egyéb
  { kana: 'いなか', romaji: 'inaka', hu: 'vidék', tags: ['helyek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'とかい', romaji: 'tokai', hu: 'nagyváros', tags: ['helyek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'うみ', romaji: 'umi', hu: 'tenger', tags: ['természet'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ふね', romaji: 'fune', hu: 'hajó', tags: ['közlekedés'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'しょっけん', romaji: 'shokken', hu: 'étkezési jegy', tags: ['tárgyak'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'おつり', romaji: 'otsuri', hu: 'visszajáró pénz', tags: ['alapszavak'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'におい', romaji: 'nioi', hu: 'szag, illat', tags: ['alapszavak'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'りょう', romaji: 'ryou', hu: 'adag', tags: ['alapszavak'], jlpt: 'N5', lesson: [10], source: 'dekiru' },

  // Melléknevek és összehasonlítás
  { kana: 'ちかい', romaji: 'chikai', hu: 'közeli', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'とおい', romaji: 'tooi', hu: 'távoli, messzi', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'つよい', romaji: 'tsuyoi', hu: 'erős', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'よわい', romaji: 'yowai', hu: 'gyenge', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'おそい', romaji: 'osoi', hu: 'lassú, késő', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'はやい', romaji: 'hayai', hu: 'korai / gyors', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'ひくい', romaji: 'hikui', hu: 'alacsony', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'いろいろ', romaji: 'iroiro', hu: 'sokféle, változatos', tags: ['melléknevek'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'いちばん', romaji: 'ichiban', hu: 'leg...bb (felsőfok)', tags: ['határozószavak'], jlpt: 'N5', lesson: [10], source: 'dekiru' },
  { kana: 'どちら', romaji: 'dochira', hu: 'melyik?, merre?', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [10], source: 'dekiru' }
];
const DEKIRU_L11 = [
  // Egészséggel kapcsolatos igék
  { kana: 'なおる', romaji: 'naoru', hu: 'meggyógyul', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'のむ', romaji: 'nomu', hu: 'bevesz (gyógyszert)', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'ひく', romaji: 'hiku', hu: 'megfázik', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'はかる', romaji: 'hakaru', hu: '(lázat) mér', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'すわる', romaji: 'suwaru', hu: 'leül', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'たつ', romaji: 'tatsu', hu: 'feláll', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'なく', romaji: 'naku', hu: 'sír', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'もらう', romaji: 'morau', hu: 'kap', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'よぶ', romaji: 'yobu', hu: 'hív, meghív', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'わらう', romaji: 'warau', hu: 'nevet', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'おこる', romaji: 'okoru', hu: '(meg)haragszik', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'みせる', romaji: 'miseru', hu: 'megmutat', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'わすれる', romaji: 'wasureru', hu: 'elfelejt', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'しんぱいする', romaji: 'shinpaisuru', hu: 'aggódik', tags: ['igék'], jlpt: 'N4', lesson: [11], source: 'dekiru' },

  // Testrészek
  { kana: 'あたま', romaji: 'atama', hu: 'fej', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'め', romaji: 'me', hu: 'szem', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'くち', romaji: 'kuchi', hu: 'száj', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'のど', romaji: 'nodo', hu: 'torok', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'からだ', romaji: 'karada', hu: 'test', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'うde', romaji: 'ude', hu: 'kar', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'おなか', romaji: 'onaka', hu: 'has', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'あし', romaji: 'ashi', hu: 'láb', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'ゆび', romaji: 'yubi', hu: 'ujj', tags: ['testrészek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },

  // Betegség és egészségügy
  { kana: 'びょうき', romaji: 'byouki', hu: 'beteg(ség)', tags: ['egészség'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'かぜ', romaji: 'kaze', hu: 'nátha (megfázás)', tags: ['egészség'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'せき', romaji: 'seki', hu: 'köhögés', tags: ['egészség'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'ねつ', romaji: 'netsu', hu: 'láz', tags: ['egészség'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'きぶん', romaji: 'kibun', hu: 'közérzet, kedv', tags: ['egészség'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'しょくよく', romaji: 'shokuyoku', hu: 'étvágy', tags: ['egészség'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'かんごし', romaji: 'kangoshi', hu: 'ápoló', tags: ['munka'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'くすり', romaji: 'kusuri', hu: 'gyógyszer', tags: ['egészség'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'やっきょk', romaji: 'yakkyoku', hu: 'gyógyszertár', tags: ['helyek'], jlpt: 'N4', lesson: [11], source: 'dekiru' },

  // Melléknevek és egyebek
  { kana: 'つめたい', romaji: 'tsumetai', hu: 'hideg (tárgyakra)', tags: ['melléknevek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'あぶない', romaji: 'abunai', hu: 'veszélyes', tags: ['melléknevek'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'いたい', romaji: 'itai', hu: 'fáj', tags: ['melléknevek', 'egészség'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'うるさい', romaji: 'urusai', hu: 'zajos, kellemetlen', tags: ['melléknevek'], jlpt: 'N4', lesson: [11], source: 'dekiru' },
  { kana: 'わるい', romaji: 'warui', hu: 'rossz', tags: ['melléknevek'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'ない', romaji: 'nai', hu: 'nincs', tags: ['igék'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'たいへん', romaji: 'taihen', hu: 'nehéz, szörnyű', tags: ['alapszavak'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'たいせつ', romaji: 'taisetsu', hu: 'fontos, értékes', tags: ['alapszavak'], jlpt: 'N5', lesson: [11], source: 'dekiru' },
  { kana: 'さいふ', romaji: 'saifu', hu: 'pénztárca', tags: ['tárgyak'], jlpt: 'N4', lesson: [11], source: 'dekiru' }
];
const DEKIRU_L12 = [
  // Igék
  { kana: 'かぶる', romaji: 'kaburu', hu: 'felvesz, visel (sapkát, kalapot)', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1447, 1448]
  { kana: 'はく', romaji: 'haku', hu: 'felhúz, felvesz (cipőt, nadrágot, szoknyát)', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1451, 1460]
  { kana: 'かよう', romaji: 'kayou', hu: 'jár (iskolába)', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1454, 1461]
  { kana: 'ならう', romaji: 'narau', hu: 'tanul (vkitől)', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1455, 1462]
  { kana: 'みつける', romaji: 'mitsukeru', hu: 'megtalál', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1456, 1463]
  { kana: 'きる', romaji: 'kiru', hu: 'felvesz, visel (ruhát)', tags: ['igék'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1458, 1464]
  { kana: 'つける', romaji: 'tsukeru', hu: '(nyakláncot) feltesz, visel', tags: ['igék'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1459, 1465]
  { kana: 'かける', romaji: 'kakeru', hu: '(szemüveget) feltesz, visel', tags: ['igék'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1473, 1466]
  { kana: 'つとめる', romaji: 'tsutomeru', hu: 'alkalmazásban áll (munkahelyen)', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1475, 1467]
  { kana: 'うんどうする', romaji: 'undousuru', hu: 'tornázik, sportol', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1476, 1468]
  { kana: 'そうだнする', romaji: 'soudansuru', hu: 'megbeszél, megtárgyal', tags: ['igék'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1477, 1469]
  { kana: 'びっくりする', romaji: 'bikkurisuru', hu: 'meglepődik, elcsodálkozik', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1478, 1470]
  { kana: 'へんじする', romaji: 'henjisuru', hu: 'válaszol, felel', tags: ['igék'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1479, 1472]

  // Állatok és Testrészek
  { kana: 'キリン', romaji: 'kirin', hu: 'zsiráf', tags: ['állatok'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1481, 1495]
  { kana: 'ぞう', romaji: 'zou', hu: 'elefánt', tags: ['állatok'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1482, 1496]
  { kana: 'パンダ', romaji: 'panda', hu: 'panda', tags: ['állatok'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1483, 1497]
  { kana: 'かみ', romaji: 'kami', hu: 'haj', tags: ['testrészek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1484, 1498]
  { kana: 'け', romaji: 'ke', hu: 'haj, szőr; gyapjú', tags: ['testrészek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1485, 1499]
  { kana: 'みみ', romaji: 'mimi', hu: 'fül', tags: ['testrészek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1486, 1500]
  { kana: 'はな', romaji: 'hana', hu: 'orr', tags: ['testrészek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1487, 1501]
  { kana: 'くび', romaji: 'kubi', hu: 'nyak', tags: ['testrészek'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1488, 1502]
  { kana: 'せい', romaji: 'sei', hu: 'hát, magasság, termet', tags: ['testrészek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1489, 1503]

  // Ruházat és Tárgyak
  { kana: 'うわぎ', romaji: 'uwagi', hu: 'zakó', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1490, 1504]
  { kana: 'コート', romaji: 'kooto', hu: 'kabát', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1491, 1505]
  { kana: 'スーツ', romaji: 'suutsu', hu: 'öltöny, kosztüm', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1492, 1506]
  { kana: 'スカート', romaji: 'sukaato', hu: 'szoknya', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1508, 1507]
  { kana: 'ジーンズ', romaji: 'jiinzu', hu: 'farmer', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1509, 1520]
  { kana: 'ズボン', romaji: 'zubon', hu: 'nadrág', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1510, 1521]
  { kana: 'ワイシャツ', romaji: 'waishatsu', hu: 'férfi ing', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1511, 1522]
  { kana: 'マフラー', romaji: 'mafuraa', hu: 'sál', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1512, 1523]
  { kana: 'サンダル', romaji: 'sandaru', hu: 'szandál', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1513, 1524]
  { kana: 'ハンドバッグ', romaji: 'handobaggu', hu: 'kézitáska', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1514, 1525]
  { kana: 'サングラス', romaji: 'sangurasu', hu: 'napszemüveg', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1515, 1526]
  { kana: 'ネックレス', romaji: 'nekkuresu', hu: 'nyaklánc', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1516, 1527]
  { kana: 'ピアス', romaji: 'piasu', hu: 'fülbevaló', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1517, 1528]
  { kana: 'ゆびわ', romaji: 'yubiwa', hu: 'gyűrű', tags: ['tárgyak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1518, 1529]
  { kana: 'かいしゃ', romaji: 'kaisha', hu: 'cég, vállalat', tags: ['helyek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1519, 1530]

  // Iskola és Emberek
  { kana: 'しけん', romaji: 'shiken', hu: 'vizsga', tags: ['iskola'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'レポート', romaji: 'repooto', hu: 'beszámoló, jelentés', tags: ['iskola'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'はなし', romaji: 'hanashi', hu: 'beszélgetés, beszéd, történet', tags: ['kommunikáció'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'ついしん', romaji: 'tsuishin', hu: 'utóirat', tags: ['kommunikáció'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'まわり', romaji: 'mawari', hu: 'környék', tags: ['helyek'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'かれ', romaji: 'kare', hu: 'ő (férfi); barát', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'かのじょ', romaji: 'kanojo', hu: 'ő (nő); barátnő', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]

  // Melléknevek és Határozók
  { kana: 'かっこいい', romaji: 'kakkoii', hu: 'jól néz ki, aranyos', tags: ['melléknevek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'ながい', romaji: 'nagai', hu: 'hosszú', tags: ['melléknevek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'みじかい', romaji: 'mijikai', hu: 'rövid', tags: ['melléknevek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'やさしい', romaji: 'yasashii', hu: 'kedves, gyengéd', tags: ['melléknevek'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'じょうず', romaji: 'jouzu', hu: 'ügyes (vmiben)', tags: ['melléknevek'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'へた', romaji: 'heta', hu: 'ügyetlen (vmiben)', tags: ['melléknevek'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'おなじ', romaji: 'onaji', hu: 'ugyanolyan, azonos', tags: ['alapszavak'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'さいきん', romaji: 'saikin', hu: 'mostanában', tags: ['idő'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'ずっと', romaji: 'zutto', hu: 'végig, egyfolytában', tags: ['idő'], jlpt: 'N4', lesson: [12], source: 'dekiru' }, // [cite: 1532]
  { kana: 'うん', romaji: 'un', hu: 'igen (közvetlen)', tags: ['alapszavak'], jlpt: 'N5', lesson: [12], source: 'dekiru' }, // [cite: 1536, 1538]
  { kana: 'ううん', romaji: 'uun', hu: 'nem (közvetlen)', tags: ['alapszavak'], jlpt: 'N5', lesson: [12], source: 'dekiru' } // [cite: 1537, 1539]
];
const DEKIRU_L13 = [
  // Igék
  { kana: 'いわう', romaji: 'iwau', hu: 'ünnepel', tags: ['igék'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1544, 1554]
  { kana: 'かざる', romaji: 'kazaru', hu: 'díszít', tags: ['igék'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1545, 1555]
  { kana: 'さがす', romaji: 'sagasu', hu: 'keres, kutat', tags: ['igék'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1546, 1556]
  { kana: 'すごす', romaji: 'sugosu', hu: 'eltölt (időt)', tags: ['igék'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1548, 1557]
  { kana: 'つつむ', romaji: 'tsutsumu', hu: 'becsomagol', tags: ['igék'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1549, 1558]
  { kana: 'はしる', romaji: 'hashiru', hu: 'fut, szalad', tags: ['igék'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1550, 1559]
  { kana: 'あげる', romaji: 'ageru', hu: 'ad', tags: ['igék'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1551, 1560]
  { kana: 'くれる', romaji: 'kureru', hu: 'ad (vki nekem)', tags: ['igék'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1552, 1561, 1562]

  // Család és Személyek
  { kana: 'おじいさん', romaji: 'ojiisan', hu: 'nagypapa (másé)', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1564, 1571]
  { kana: 'おばあさん', romaji: 'obaasan', hu: 'nagymama (másé)', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1565, 1572]
  { kana: 'そふ', romaji: 'sofu', hu: 'nagypapám', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1566, 1573]
  { kana: 'そぼ', romaji: 'sobo', hu: 'nagymamám', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1568, 1574]
  { kana: 'しんせき', romaji: 'shinseki', hu: 'rokon', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1570, 1575]
  { kana: 'こいびと', romaji: 'koibito', hu: 'szerelme vkinek', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1576, 1578]
  { kana: 'ぼく', romaji: 'boku', hu: 'én (férfi)', tags: ['alapszavak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1579, 1583]
  { kana: 'みんな', romaji: 'minna', hu: 'mind, mindenki', tags: ['alapszavak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1580, 1584]
  { kana: 'ウェイトレス', romaji: 'weitoresu', hu: 'pincérnő, felszolgáló', tags: ['munka'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1581, 1585]
  { kana: 'はいしゃ', romaji: 'haisha', hu: 'fogorvos', tags: ['munka'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1582, 1586]

  // Ünnepek és Tárgyak
  { kana: 'たんじょうび', romaji: 'tanjoubi', hu: 'születésnap', tags: ['idő'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1587, 1588]
  { kana: 'バレンタインデー', romaji: 'barentaindee', hu: 'Valentin-nap', tags: ['szórakozás'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1589, 1590]
  { kana: 'うでどけい', romaji: 'udedokei', hu: 'karóra', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1591, 1593]
  { kana: 'てぶくろ', romaji: 'tebukuro', hu: 'kesztyű', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1594, 1596]
  { kana: 'ネクタイ', romaji: 'nekutai', hu: 'nyakkendő', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1597, 1598]
  { kana: 'ハンカチ', romaji: 'hankachi', hu: 'zsebkendő', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1599, 1600]
  { kana: 'ベルト', romaji: 'beruto', hu: 'öv', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1601, 1611]
  { kana: 'ティーシャツ', romaji: 'tiishatsu', hu: 'póló', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1603, 1612]
  { kana: 'もも', romaji: 'momo', hu: 'barack', tags: ['ételek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1604, 1613]
  { kana: 'アイスコーヒー', romaji: 'aisukoohii', hu: 'jegeskávé', tags: ['italok'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1605, 1614]
  { kana: 'バラ', romaji: 'bara', hu: 'rózsa', tags: ['természet'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1606, 1615]
  { kana: 'カーネーション', romaji: 'kaaneeshon', hu: 'szegfű', tags: ['természet'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1607, 1616]
  { kana: 'チューリップ', romaji: 'chuurippu', hu: 'tulipán', tags: ['természet'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1608, 1617]
  { kana: 'レジ', romaji: 'reji', hu: 'kassza, pénztár', tags: ['helyek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1609, 1618]
  { kana: 'カップ', romaji: 'kappu', hu: 'csésze', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1610, 1619]
  { kana: 'しょうせつ', romaji: 'shousetsu', hu: 'regény, novella', tags: ['szórakozás'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1620, 1622]
  { kana: 'チケット', romaji: 'chiketto', hu: 'jegy', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1623, 1631]
  { kana: 'ぬいぐるみ', romaji: 'nuigurumi', hu: 'plüss állat', tags: ['tárgyak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1625, 1632]
  { kana: 'サイズ', romaji: 'saizu', hu: 'méret, nagyság', tags: ['alapszavak'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1627, 1633]
  { kana: 'にんき', romaji: 'ninki', hu: 'népszerűség', tags: ['alapszavak'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1628, 1634]
  { kana: 'あじ', romaji: 'aji', hu: 'íz', tags: ['alapszavak'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1637, 1635]

  // Melléknevek és udvariasság
  { kana: 'あまい', romaji: 'amai', hu: 'édes', tags: ['melléknevek'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1639, 1649]
  { kana: 'からい', romaji: 'karai', hu: 'csípős, erős, sós', tags: ['melléknevek'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1640, 1650]
  { kana: 'しょっぱい', romaji: 'shoppai', hu: 'sós', tags: ['melléknevek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1641, 1651]
  { kana: 'すっぱい', romaji: 'suppai', hu: 'savanyú', tags: ['melléknevek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1642, 1652]
  { kana: 'にがい', romaji: 'nigai', hu: 'keserű', tags: ['melléknevek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1643, 1653]
  { kana: 'わかい', romaji: 'wakai', hu: 'fiatal', tags: ['melléknevek'], jlpt: 'N4', lesson: [13], source: 'dekiru' }, // [cite: 1644, 1654]
  { kana: 'おしゃれ', romaji: 'oshare', hu: 'elegáns', tags: ['melléknevek'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1645, 1655]
  { kana: 'さま', romaji: 'sama', hu: '~さん udvariasabb formája', tags: ['udvariasság'], jlpt: 'N5', lesson: [13], source: 'dekiru' }, // [cite: 1647, 1656]
  { kana: 'ほかの', romaji: 'hokano', hu: 'más, másik', tags: ['alapszavak'], jlpt: 'N5', lesson: [13], source: 'dekiru' } // [cite: 1648, 1656]
];
const DEKIRU_L14 = [
  // Igék
  { kana: 'こまる', romaji: 'komaru', hu: 'bajba kerül, nehéz helyzetbe kerül', tags: ['igék'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'おもう', romaji: 'omou', hu: 'gondol, vél', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'きまる', romaji: 'kimaru', hu: 'eldől (az ügy)', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'けす', romaji: 'kesu', hu: 'elolt, lekapcsol, letöröl', tags: ['igék'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'すむ', romaji: 'sumu', hu: 'lakik, él (vhol)', tags: ['igék'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'ねがう', romaji: 'negau', hu: 'kér, kíván', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'うける', romaji: 'ukeru', hu: '(vizsgát) tesz', tags: ['igék'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'おぼえる', romaji: 'oboeru', hu: 'megtanul, megjegyez, emlékezik', tags: ['igék'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'きがえる', romaji: 'kigaeru', hu: 'átöltözik', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'ごうかくする', romaji: 'goukaku suru', hu: 'eredményes vizsgát tesz, átmegy', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'せいかつする', romaji: 'seikatsu suru', hu: 'él, fenntartja magát', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'りゅうがくする', romaji: 'ryuugaku suru', hu: 'külföldön tanul', tags: ['igék'], jlpt: 'N5', lesson: [14], source: 'dekiru' },

  // Főnevek (Tantárgyak és Ünnepek)
  { kana: 'かがく', romaji: 'kagaku', hu: 'kémia', tags: ['iskola'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'すうがく', romaji: 'suugaku', hu: 'matematika', tags: ['iskola'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'せかいし', romaji: 'sekaishi', hu: 'világtörténelem', tags: ['iskola'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'ぶつり', romaji: 'butsuri', hu: 'fizika', tags: ['iskola'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'れきし', romaji: 'rekishi', hu: 'történelem', tags: ['iskola'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'しょうがつ', romaji: 'shougatsu', hu: 'újév', tags: ['idő'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'ねんがじょう', romaji: 'nengajou', hu: 'újévi üdvözlőlap', tags: ['tárgyak'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'はつもうで', romaji: 'hatsumoude', hu: 'újévi első szentélylátogatás', tags: ['kultúra'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'かみさま', romaji: 'kamisama', hu: 'Isten, istenség', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'りゅうがくせい', romaji: 'ryuugakusei', hu: 'külföldön tanuló diák', tags: ['iskola'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'こうつう', romaji: 'koutsuu', hu: 'közlekedés', tags: ['közlekedés'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'しゅと', romaji: 'shuto', hu: 'főváros', tags: ['helyek'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'たてもの', romaji: 'tatemono', hu: 'épület', tags: ['helyek'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'みどり', romaji: 'midori', hu: 'zöldterület, természet', tags: ['természet'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'ゲーム', romaji: 'geemu', hu: 'játék', tags: ['szórakozás'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'ことば', romaji: 'kotoba', hu: 'nyelv, szó', tags: ['kommunikáció'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'にほんごのうりょくしけん', romaji: 'nihongo nouryoku shiken', hu: 'nemzetközi japán nyelvvizsga', tags: ['iskola'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'きかい', romaji: 'kikai', hu: 'alkalom, lehetőség', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'しょうらい', romaji: 'shourai', hu: 'jövő', tags: ['idő'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'もくひょう', romaji: 'mokuhyou', hu: 'célkitűzés, cél', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'よてい', romaji: 'yotei', hu: 'terv', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'とし', romaji: 'toshi', hu: 'év', tags: ['idő'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'こと', romaji: 'koto', hu: 'dolog, ügy', tags: ['alapszavak'], jlpt: 'N4', lesson: [14], source: 'dekiru' },

  // Melléknevek (Érzések)
  { kana: 'ほしい', romaji: 'hoshii', hu: 'kíván, szeretne vmit', tags: ['melléknevek'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'うれしい', romaji: 'ureshii', hu: 'boldog, örül vminek', tags: ['melléknevek'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'かなしい', romaji: 'kanashii', hu: 'szomorú', tags: ['melléknevek'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'こわい', romaji: 'kowai', hu: 'félelmetes', tags: ['melléknevek'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'さびしい', romaji: 'sabishii', hu: 'magányos', tags: ['melléknevek'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'はずかしい', romaji: 'hazukashii', hu: 'szégyenlős, szégyelli magát', tags: ['melléknevek'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'いや', romaji: 'iya', hu: 'kellemetlen, utálatos', tags: ['melléknevek'], jlpt: 'N5', lesson: [14], source: 'dekiru' },

  // Határozószók és egyéb
  { kana: 'あと', romaji: 'ato', hu: 'után, azután', tags: ['idő'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'いっしょうけんめい', romaji: 'isshoukenmei', hu: 'teljes erővel', tags: ['alapszavak'], jlpt: 'N4', lesson: [14], source: 'dekiru' },
  { kana: 'おおぜい', romaji: 'oozei', hu: 'sok (ember)', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'まだ', romaji: 'mada', hu: 'még (tagadással: még nem)', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'もっと', romaji: 'motto', hu: 'még jobban', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'ゆっくり', romaji: 'yukkuri', hu: 'lassan, nyugodtan', tags: ['alapszavak'], jlpt: 'N5', lesson: [14], source: 'dekiru' },
  { kana: 'おめでとうございます', romaji: 'omedetou gozaimasu', hu: 'Gratulálok!', tags: ['udvariasság'], jlpt: 'N5', lesson: [14], source: 'dekiru' }
];
const DEKIRU_L15 = [
  // Igék
  { kana: 'おとす', romaji: 'otosu', hu: 'leejt vmit, elveszít', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'こむ', romaji: 'komu', hu: 'zsúfolódik, tele lesz', tags: ['igék'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'なくす', romaji: 'nakusu', hu: 'elveszít vmit', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'まにあう', romaji: 'maniau', hu: 'időben odaér, elér vmit', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'まよう', romaji: 'mayou', hu: 'eltéved, elbizonytalanodik', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'もうしこむ', romaji: 'moushikomu', hu: 'jelentkezik', tags: ['igék'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'やる', romaji: 'yaru', hu: 'csinál, tesz', tags: ['igék'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'おくれる', romaji: 'okureru', hu: 'késik, elkésik', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'まちがえる', romaji: 'machigaeru', hu: 'eltéveszt, elhibáz', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'ねぼうする', romaji: 'nebousuru', hu: 'későn ébred, elalszik', tags: ['igék'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'やくそくする', romaji: 'yakusokusuru', hu: 'ígéretet tesz', tags: ['igék'], jlpt: 'N4', lesson: [15], source: 'dekiru' },

  // Főnevek (Hobbi és Események)
  { kana: 'ライブ', romaji: 'raibu', hu: 'live, élő (koncert)', tags: ['szórakozás'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'ギター', romaji: 'gitaa', hu: 'gitár', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'たいこ', romaji: 'taiko', hu: 'taiko (japán dob)', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'じょうば', romaji: 'jouba', hu: 'lovaglás', tags: ['szórakozás', 'sport'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'すいえい', romaji: 'suiei', hu: 'úszás', tags: ['sport'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'つり', romaji: 'tsuri', hu: 'horgászat', tags: ['szórakozás'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'スピーチコンテスト', romaji: 'supiichikontesuto', hu: 'szónokverseny', tags: ['iskola'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'にく', romaji: 'niku', hu: 'hús', tags: ['ételek'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'ロールキャベツ', romaji: 'rooru kyabetsu', hu: 'töltött káposzta', tags: ['ételek'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'オレンジ', romaji: 'orenji', hu: 'narancs', tags: ['ételek'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'ビタミン', romaji: 'bitamin', hu: 'vitamin', tags: ['ételek'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'ちず', romaji: 'chizu', hu: 'térkép', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'じしん', romaji: 'jishin', hu: 'földrengés', tags: ['természet'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'たいふう', romaji: 'taifuu', hu: 'tájfun', tags: ['természet'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'こえ', romaji: 'koe', hu: 'hang (emberi)', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'ぶっか', romaji: 'bukka', hu: 'árak', tags: ['alapszavak'], jlpt: 'N3', lesson: [15], source: 'dekiru' },
  { kana: 'ようじ', romaji: 'youji', hu: 'dolog, ügy, intéznivaló', tags: ['alapszavak'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'つごう', romaji: 'tsugou', hu: 'körülmények, alkalom', tags: ['alapszavak'], jlpt: 'N4', lesson: [15], source: 'dekiru' },
  { kana: 'おととし', romaji: 'ototoshi', hu: 'tavalyelőtt', tags: ['idő'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'さらいねん', romaji: 'sarainen', hu: 'a jövő év utáni év', tags: ['idő'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'さらいしゅう', romaji: 'saraishuu', hu: 'a jövő hét utáni hét', tags: ['idő'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'さらいげつ', romaji: 'saraigetsu', hu: 'a jövő hónap utáni hó', tags: ['idő'], jlpt: 'N5', lesson: [15], source: 'dekiru' },

  // Melléknevek és Határozószók
  { kana: 'うまい', romaji: 'umai', hu: 'ügyes; finom', tags: ['melléknevek'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'とくに', romaji: 'tokuni', hu: 'különösképpen, különösen', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'なんでも', romaji: 'nandemo', hu: 'bármi, akármi', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'いつでも', romaji: 'itsudemo', hu: 'bármikor, akármikor', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'どこでも', romaji: 'dokodemo', hu: 'bárhol, akárhol', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'どれでも', romaji: 'doredemo', hu: 'bármelyik, akármelyik', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'だれでも', romaji: 'daredemo', hu: 'bárki, akárki', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: 'どちらでも', romaji: 'dochirademo', hu: 'bármelyik, akármelyik', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' },
  { kana: '〜くん', romaji: '-kun', hu: '(utótag fiúk neve után)', tags: ['alapszavak'], jlpt: 'N5', lesson: [15], source: 'dekiru' }
];
const DEKIRU_L16 = [
  // Igék
  { kana: 'ひく', romaji: 'hiku', hu: '(zongorán) játszik', tags: ['igék', 'szórakozás'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1896, 1908]
  { kana: 'ふく', romaji: 'fuku', hu: '(furulyát) fúj', tags: ['igék', 'szórakozás'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1897, 1909]
  { kana: 'やく', romaji: 'yaku', hu: 'süt', tags: ['igék', 'ételek'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1898, 1910]
  { kana: 'はたらく', romaji: 'hataraku', hu: 'dolgozik', tags: ['igék', 'munka'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1899, 1911]
  { kana: 'かえる', romaji: 'kaeru', hu: '(pénzt) vált', tags: ['igék'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1901, 1912]
  { kana: 'あつめる', romaji: 'atsumeru', hu: 'összegyűjt', tags: ['igék'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1902, 1913]
  { kana: 'できる', romaji: 'dekiru', hu: 'tud, képes vmire', tags: ['igék'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1903, 1914]
  { kana: 'ならべる', romaji: 'naraberu', hu: 'sorba rak, sorba állít', tags: ['igék'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1904, 1915]
  { kana: 'はじめる', romaji: 'hajimeru', hu: 'elkezd', tags: ['igék'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1906, 1916]
  { kana: 'うんてんする', romaji: 'untensuru', hu: '(autót) vezet', tags: ['igék', 'közlekedés'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'けいけんする', romaji: 'keikensuru', hu: 'tapasztal', tags: ['igék'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'ぼしゅうする', romaji: 'boshuusuru', hu: 'felvételt hirdet', tags: ['igék', 'munka'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'めんせつする', romaji: 'mensetsusuru', hu: 'interjút tart', tags: ['igék', 'munka'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'りょうりする', romaji: 'ryourisuru', hu: 'főz', tags: ['igék', 'ételek'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]

  // Főnevek (Hangszerek és Szintek)
  { kana: 'バイオリン', romaji: 'baiorin', hu: 'hegedű', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'ふえ', romaji: 'fue', hu: 'furulya', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'フルート', romaji: 'furuuto', hu: 'fuvola', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'しょきゅう', romaji: 'shokyuu', hu: 'alapfok', tags: ['iskola'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'ちゅうきゅう', romaji: 'chuukyuu', hu: 'középfok', tags: ['iskola'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'じょうきゅう', romaji: 'joukyuu', hu: 'felsőfok', tags: ['iskola'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]

  // Munka és Személyes adatok
  { kana: 'アルバイト', romaji: 'arubaito', hu: 'diákmunka, mellékállás', tags: ['munka'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'じきゅう', romaji: 'jikyuu', hu: 'órabér', tags: ['munka'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'じむしょ', romaji: 'jimusho', hu: 'iroda', tags: ['helyek', 'munka'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'スタッフ', romaji: 'sutaffu', hu: 'személyzet', tags: ['munka'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'マネージャー', romaji: 'maneejaa', hu: 'menedzser', tags: ['munka'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'プライベートレッスン', romaji: 'puraibeeto ressun', hu: 'magánóra', tags: ['iskola'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'じゅうしょ', romaji: 'juusho', hu: 'lakcím', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'せいねんがっぴ', romaji: 'seinen gappi', hu: 'születési dátum', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'せいべつ', romaji: 'seibetsu', hu: 'neme', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'とくぎ', romaji: 'tokugi', hu: 'különleges képesség', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'りゆう', romaji: 'riyuu', hu: 'ok', tags: ['alapszavak'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'こうこく', romaji: 'koukoku', hu: 'hirdetés, reklám', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'さくぶん', romaji: 'sakubun', hu: 'fogalmazás', tags: ['iskola'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907]
  { kana: 'じぶん', romaji: 'jibun', hu: 'saját maga', tags: ['alapszavak'], jlpt: 'N4', lesson: [16], source: 'dekiru' }, // [cite: 1907, 1917]

  // Egyéb
  { kana: 'そり', romaji: 'sori', hu: 'szánkó', tags: ['szórakozás', 'tárgyak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1918, 1921]
  { kana: 'ダンス', romaji: 'dansu', hu: 'tánc', tags: ['szórakozás'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1919, 1922]
  { kana: 'ペット', romaji: 'petto', hu: 'házikedvenc', tags: ['állatok'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1920, 1923]
  { kana: 'マッチ', romaji: 'macchi', hu: 'gyufa', tags: ['tárgyak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1925, 1924]
  { kana: 'ゆめ', romaji: 'yume', hu: 'álom', tags: ['alapszavak'], jlpt: 'N5', lesson: [16], source: 'dekiru' }, // [cite: 1926, 1927]
  { kana: 'しゅくじつ', romaji: 'shukujitsu', hu: 'ünnepnap', tags: ['idő'], jlpt: 'N4', lesson: [16], source: 'dekiru' } // [cite: 1928, 1929]
];
const DEKIRU_L17 = [
  // Igék
  { kana: 'すう', romaji: 'suu', hu: '(cigarettát) szív', tags: ['igék'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1958, 1978]
  { kana: 'いう', romaji: 'iu', hu: 'mond', tags: ['igék'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1959, 1979]
  { kana: 'いそぐ', romaji: 'isogu', hu: 'siet', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1961, 1980]
  { kana: 'さわる', romaji: 'sawaru', hu: 'megérint, hozzáér', tags: ['igék'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1962, 1981]
  { kana: 'とまる', romaji: 'tomaru', hu: 'megszáll, tartózkodik (vhol)', tags: ['igék', 'utazás'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1963, 1982]
  { kana: 'はらう', romaji: 'harau', hu: 'fizet', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1964, 1984]
  { kana: 'もどる', romaji: 'modoru', hu: 'visszatér', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1965, 1985]
  { kana: 'わたす', romaji: 'watasu', hu: 'átad, átnyújt', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1966, 1986]
  { kana: 'あずける', romaji: 'azukeru', hu: 'rábíz, megőrzésre átad', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1967, 1987]
  { kana: 'しらべる', romaji: 'shiraberu', hu: 'utánanéz, megvizsgál', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1968, 1988]
  { kana: 'すてる', romaji: 'suteru', hu: 'kidob', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1969, 1989]
  { kana: 'とめる', romaji: 'tomeru', hu: 'megállít', tags: ['igék'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1970, 1990]
  { kana: 'コピーする', romaji: 'kopii suru', hu: 'másol, fénymásol', tags: ['igék'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1972, 1991]
  { kana: 'しょくじする', romaji: 'shokuji suru', hu: 'étkezik', tags: ['igék', 'ételek'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1973, 1992]
  { kana: 'チェックアウトする', romaji: 'chekkuauto suru', hu: 'kijelentkezik', tags: ['igék', 'utazás'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1975, 1993]
  { kana: 'よやくする', romaji: 'yoyaku suru', hu: 'lefoglal', tags: ['igék', 'utazás'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1976, 1994]

  // Főnevek (Utazás és Szállás)
  { kana: 'おじ', romaji: 'oji', hu: 'nagybácsim', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'おば', romaji: 'oba', hu: 'nagynénim', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'りょかん', romaji: 'ryokan', hu: 'japán stílusú szálloda', tags: ['helyek', 'utazás'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'ホテル', romaji: 'hoteru', hu: 'szálloda', tags: ['helyek', 'utazás'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'おんせん', romaji: 'onsen', hu: 'gyógyfürdő', tags: ['helyek', 'utazás'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'はくぶつかん', romaji: 'hakubutsukan', hu: 'múzeum', tags: ['helyek'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'パスポート', romaji: 'pasupooto', hu: 'útlevél', tags: ['tárgyak', 'utazás'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'たばこ', romaji: 'tabako', hu: 'cigaretta', tags: ['tárgyak'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'ごみ', romaji: 'gomi', hu: 'szemét', tags: ['alapszavak'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'じこくひょう', romaji: 'jikokuhyou', hu: 'menetrend', tags: ['tárgyak', 'közlekedés'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1977]
  { kana: 'せかい', romaji: 'sekai', hu: 'világ', tags: ['alapszavak'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 1995, 1996]

  // Melléknevek és Határozószók
  { kana: 'まるい', romaji: 'marui', hu: 'kerek', tags: ['melléknevek'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 1998, 2010]
  { kana: 'ふつう', romaji: 'futsuu', hu: 'általános, átlagos', tags: ['alapszavak'], jlpt: 'N5', lesson: [17], source: 'dekiru' }, // [cite: 2000, 2011]
  { kana: 'むかし', romaji: 'mukashi', hu: 'régen', tags: ['idő'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 2001, 2011]
  { kana: 'とき', romaji: 'toki', hu: 'akkor, amikor...', tags: ['idő'], jlpt: 'N4', lesson: [17], source: 'dekiru' }, // [cite: 2006, 2015]
  { kana: 'むこう', romaji: 'mukou', hu: 'túloldal', tags: ['helyek'], jlpt: 'N5', lesson: [17], source: 'dekiru' } // [cite: 2009, 2018]
];
const DEKIRU_L18 = [
  // Igék
  { kana: 'ふる', romaji: 'furu', hu: 'esik (az eső)', tags: ['időjárás','igék'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2030]
  { kana: 'なる', romaji: 'naru', hu: 'válik vmivé, lesz', tags: ['igék'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2033]
  { kana: 'はじまる', romaji: 'hajimaru', hu: 'kezdődik', tags: ['igék'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2035]
  { kana: 'ふとる', romaji: 'futoru', hu: '(meg)hízik', tags: ['igék'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2037]
  { kana: 'よろこぶ', romaji: 'yorokobu', hu: 'örül', tags: ['igék'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2039]
  { kana: 'いただく', romaji: 'itadaku', hu: 'kap (szerény forma)', tags: ['igék','udvariasság'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2041]
  { kana: 'くださる', romaji: 'kudasaru', hu: 'ad nekem (tiszteleti forma)', tags: ['igék','udvariasság'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2044]
  { kana: 'さしあげる', romaji: 'sashiageru', hu: 'ad, átnyújt (szerény forma)', tags: ['igék','udvariasság'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2047]
  { kana: 'こわれる', romaji: 'kowareru', hu: 'elromlik, tönkremegy', tags: ['igék'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2054]
  { kana: 'やせる', romaji: 'yaseru', hu: '(le)fogy', tags: ['igék'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2061]
  { kana: 'かんこうする', romaji: 'kankousuru', hu: 'turistaúton van', tags: ['igék','utazás'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2055]
  { kana: 'けいゆする', romaji: 'keiyusuru', hu: 'vmin keresztül megy', tags: ['igék','utazás'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2056]
  { kana: 'しゅっぱつする', romaji: 'shuppatsusuru', hu: 'elindul (vhonnan)', tags: ['igék','utazás'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2057]
  { kana: 'とうちゃくする', romaji: 'touchakusuru', hu: 'érkezik (vhová)', tags: ['igék','utazás'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2053]
  { kana: 'ダイエットする', romaji: 'daiettosuru', hu: 'fogyókúrázik', tags: ['igék','egészség'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2062]

  // Főnevek
  { kana: 'まつり', romaji: 'matsuri', hu: 'ünnep, fesztivál', tags: ['kultúra'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2066]
  { kana: 'イースター', romaji: 'iisutaa', hu: 'húsvét', tags: ['idő','kultúra'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2065]
  { kana: 'くうこう', romaji: 'kuukou', hu: 'repülőtér', tags: ['helyek','utazás'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2071]
  { kana: 'びん', romaji: 'bin', hu: 'repülőjárat', tags: ['utazás'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2072]
  { kana: 'ちょっこうびん', romaji: 'chokkoubin', hu: 'közvetlen járat', tags: ['utazás'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2070]
  { kana: 'おうふく', romaji: 'oufuku', hu: 'oda és visszaút, retúr', tags: ['utazás'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2074]
  { kana: 'かえり', romaji: 'kaeri', hu: 'visszatérés, hazaút', tags: ['utazás'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2078]
  { kana: 'みやげ', romaji: 'miyage', hu: 'szuvenír (ajándék)', tags: ['alapszavak'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2080]
  { kana: 'ブルガリア', romaji: 'burugaria', hu: 'Bulgária', tags: ['országok'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2084]
  { kana: 'かんさいくうこう', romaji: 'kansa ikuukou', hu: 'Kansai repülőtér', tags: ['helyek','utazás'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2085]
  { kana: 'かぜ', romaji: 'kaze', hu: 'szél', tags: ['természet'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2092]
  { kana: 'そら', romaji: 'sora', hu: 'égbolt', tags: ['természet'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2093]
  { kana: 'おと', romaji: 'oto', hu: 'hang, zaj, nesz', tags: ['alapszavak'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2094]
  { kana: 'おとな', romaji: 'otona', hu: 'felnőtt', tags: ['emberek'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2095]
  { kana: 'こども', romaji: 'kodomo', hu: 'gyermek', tags: ['emberek'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2096]
  { kana: 'こうちょう', romaji: 'kouchou', hu: 'iskolaigazgató', tags: ['munka','iskola'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2099]
  { kana: 'しゃちょう', romaji: 'shachou', hu: 'vállalati igazgató', tags: ['munka'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2102]
  { kana: 'むすこ', romaji: 'musuko', hu: 'fiam', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2104]
  { kana: 'ホストファミリー', romaji: 'hosutofamirii', hu: 'fogadócsalád', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2108]
  { kana: 'せっけん', romaji: 'sekken', hu: 'szappan', tags: ['tárgyak'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2109]
  { kana: 'ふくろ', romaji: 'fukuro', hu: 'szatyor, zacskó', tags: ['tárgyak'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2110]
  { kana: 'エアコン', romaji: 'eakon', hu: 'légkondicionáló', tags: ['tárgyak'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2111]
  { kana: 'カーテン', romaji: 'kaaten', hu: 'függöny', tags: ['tárgyak'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2117]
  { kana: 'ロボット', romaji: 'robotto', hu: 'robot', tags: ['tárgyak'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2118]
  { kana: 'サマータイム', romaji: 'samaataimu', hu: 'nyári időszámítás', tags: ['idő'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2119]
  { kana: 'エスエムエス', romaji: 'esu emu esu', hu: 'SMS', tags: ['kommunikáció'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2120]

  // Melléknevek és határozók
  { kana: 'あかるい', romaji: 'akarui', hu: 'világos', tags: ['melléknevek'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2135]
  { kana: 'くらい', romaji: 'kurai', hu: 'sötét', tags: ['melléknevek'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2136]
  { kana: 'ねむい', romaji: 'nemui', hu: 'álmos', tags: ['melléknevek'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2137]
  { kana: 'ふとい', romaji: 'futoi', hu: 'vastag, kövér', tags: ['melléknevek'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2138]
  { kana: 'ほそい', romaji: 'hosoi', hu: 'vékony, keskeny, karcsú', tags: ['melléknevek'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2139]
  { kana: 'ひつよう', romaji: 'hitsuyou', hu: 'szükséges', tags: ['melléknevek'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2140]
  { kana: 'へん', romaji: 'hen', hu: 'furcsa', tags: ['melléknevek'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2141]
  { kana: 'ちょうど', romaji: 'choudo', hu: 'éppen, pont, pontosan', tags: ['határozószavak'], jlpt: 'N4', lesson: [18], source: 'dekiru' }, // [cite: 2142]
  { kana: 'もうすこし', romaji: 'mou sukoshi', hu: 'még egy kicsit', tags: ['alapszavak'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2143]
  { kana: 'ころ/ごろ', romaji: 'koro/goro', hu: '- körül (idő)', tags: ['idő'], jlpt: 'N5', lesson: [18], source: 'dekiru' }, // [cite: 2144]
  { kana: 'ところで', romaji: 'tokorode', hu: 'mellesleg, apropó', tags: ['alapszavak'], jlpt: 'N5', lesson: [18], source: 'dekiru' } // [cite: 2145]
];
const DEKIRU_L19 = [
  // Igék
  { kana: 'ぬぐ', romaji: 'nugu', hu: 'lehúz (cipőt), levesz (ruhát)', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2159]
  { kana: 'かえす', romaji: 'kaesu', hu: 'visszaad, visszajuttat', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2160]
  { kana: 'なおす', romaji: 'naosu', hu: '(meg)gyógyít', tags: ['igék'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2161]
  { kana: 'さす', romaji: 'sasu', hu: 'kinyit (ernyőt)', tags: ['igék'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2162]
  { kana: 'ちがう', romaji: 'chigau', hu: 'különbözik, más, eltér', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2163]
  { kana: 'つく', romaji: 'tsuku', hu: 'érkezik, megérkezik', tags: ['igék','utazás'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2164]
  { kana: 'あるく', romaji: 'aruku', hu: 'gyalogol, sétál', tags: ['igék'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2167]
  { kana: 'あがる', romaji: 'agaru', hu: 'felmegy, emelkedik, belép', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2173]
  { kana: 'まがる', romaji: 'magaru', hu: 'befordul, meghajlik', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2174]
  { kana: 'とおる', romaji: 'tooru', hu: 'átmegy, keresztülmegy', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2175]
  { kana: 'とぶ', romaji: 'tobu', hu: 'repül', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2176]
  { kana: 'わたる', romaji: 'wataru', hu: 'átkel, átmegy', tags: ['igék'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2178]
  { kana: 'みつかる', romaji: 'mitsukaru', hu: 'előkerül', tags: ['igék'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2181]
  { kana: 'きをつける', romaji: 'ki wo tsukeru', hu: 'figyel, vigyáz', tags: ['igék'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2182]

  // Főnevek (Helyek és közlekedés)
  { kana: 'ばしょ', romaji: 'basho', hu: 'hely', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'はし', romaji: 'hashi', hu: 'hid', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'かど', romaji: 'kado', hu: 'sarok (külső)', tags: ['helyek'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'とおり', romaji: 'toori', hu: 'utca, út', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'いりぐち', romaji: 'iriguchi', hu: 'bejárat', tags: ['helyek'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'でぐち', romaji: 'deguchi', hu: 'kijárat', tags: ['helyek'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'ちゅうしん', romaji: 'chuushin', hu: 'köz(ép)pont', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'おうだんほどう', romaji: 'oudanhodou', hu: 'gyalogátkelő', tags: ['helyek','közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'こうさてん', romaji: 'kousaten', hu: 'útkereszteződés', tags: ['helyek','közlekedés'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'かいだん', romaji: 'kaidan', hu: 'lépcső', tags: ['helyek'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'ろうか', romaji: 'rouka', hu: 'folyosó', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'かいさつき', romaji: 'kaisatsuki', hu: 'jegykezelő automata', tags: ['tárgyak','közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'かいすうけん', romaji: 'kaisuuken', hu: 'gyűjtőjegy', tags: ['tárgyak','közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'コントローラー', romaji: 'kontorooraa', hu: 'ellenőr', tags: ['munka','közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'トロリーバス', romaji: 'tororiibasu', hu: 'trolibusz', tags: ['közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'インターシティー', romaji: 'intaashitii', hu: 'intercity', tags: ['közlekedés'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'はなや', romaji: 'hanaya', hu: 'virágbolt, virágüzlet', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'エステ', romaji: 'esute', hu: 'kozmetika', tags: ['helyek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'トルコ', romaji: 'toruko', hu: 'Törökország', tags: ['országok'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'ソース', romaji: 'soosu', hu: 'mártás, szósz', tags: ['ételek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'めだまやき', romaji: 'medamayaki', hu: 'tükörtojás', tags: ['ételek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'チーム', romaji: 'chiimu', hu: 'csapat', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]
  { kana: 'メンバー', romaji: 'menbaa', hu: 'tag', tags: ['emberek'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2184]

  // Határozószók és egyéb
  { kana: 'まっすぐ', romaji: 'massugu', hu: 'egyenes(en)', tags: ['irányok'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2190]
  { kana: 'かならず', romaji: 'kanarazu', hu: 'mindenképpen, feltétlenül', tags: ['határozószavak'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2191]
  { kana: 'すぐ', romaji: 'sugu', hu: 'azonnal', tags: ['idő'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2191]
  { kana: 'ぜひ', romaji: 'zehi', hu: 'feltétlenül', tags: ['határozószavak'], jlpt: 'N4', lesson: [19], source: 'dekiru' }, // [cite: 2192]
  { kana: 'おおきな', romaji: 'ookina', hu: 'nagy, tekintélyes', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2200]
  { kana: 'ちいさな', romaji: 'chiisana', hu: 'kicsiny', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2203]
  { kana: '〜がわ', romaji: '-gawa', hu: '-oldal', tags: ['irányok'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2205]
  { kana: '〜しき', romaji: '-shiki', hu: 'ünnepély, ceremónia', tags: ['kultúra'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2209]
  { kana: '〜しか･･･ない', romaji: '-shika...nai', hu: 'nem/nincs... csak', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2210]
  { kana: '〜だけ', romaji: '-dake', hu: 'csak', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' }, // [cite: 2211]
  { kana: '〜など', romaji: '-nado', hu: 'stb.', tags: ['alapszavak'], jlpt: 'N5', lesson: [19], source: 'dekiru' } // [cite: 2213]
];
const DEKIRU_L20 = [
  // Igék
  { kana: 'たおす', romaji: 'taosu', hu: 'ledönt, eldönt, legyőz', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'たおれる', romaji: 'taoreru', hu: 'felborul, feldől, összeesik, ágynak dől', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'やぶる', romaji: 'yaburu', hu: 'elszakít', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'やぶれる', romaji: 'yabureru', hu: 'elszakad', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'よごす', romaji: 'yogosu', hu: 'bepiszkít', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'よごれる', romaji: 'yogoreru', hu: 'bepiszkolódik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'わる', romaji: 'waru', hu: 'eltör, széttör; eloszt (számot)', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'われる', romaji: 'wareru', hu: 'eltörik, összetörik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'あく', romaji: 'aku', hu: 'kinyílik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'しまる', romaji: 'shimaru', hu: '(be)csukódik, záródik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'あつまる', romaji: 'atsumaru', hu: 'gyülekezik, összegyűlik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'おちる', romaji: 'ochiru', hu: 'leesik; megbukik (vizsgán)', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'おる', romaji: 'oru', hu: 'letör', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'おれる', romaji: 'oreru', hu: 'letörik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'おわる', romaji: 'owaru', hu: 'befejez, véget ér', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'かわる', romaji: 'kawaru', hu: 'változik', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'きえる', romaji: 'kieru', hu: 'kialszik, eltűnik', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'きめる', romaji: 'kimeru', hu: 'dönt, elhatároz', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'こわす', romaji: 'kowasu', hu: 'elront, tönkretesz', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'つく', romaji: 'tsuku', hu: 'felgyullad (lámpa)', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'うまれる', romaji: 'umareru', hu: 'születik', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'たすける', romaji: 'tasukeru', hu: 'segít, megment', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'えらぶ', romaji: 'erabu', hu: 'választ', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'すすめる', romaji: 'susumeru', hu: 'tanácsol, javasol', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'とりかえる', romaji: 'torikaeru', hu: 'kicserél', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'つれていく', romaji: 'tsurete iku', hu: 'magával visz, elkísér', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ついていく', romaji: 'tsuite iku', hu: 'utána megy, követ', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'きにいる', romaji: 'ki ni iru', hu: 'tetszik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'くらす', romaji: 'kurasu', hu: 'él (vhol)', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'たたかう', romaji: 'tatakau', hu: 'csatázik, harcol, küzd', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'にげる', romaji: 'nigeru', hu: 'menekül, megszökik', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'にる', romaji: 'niru', hu: 'hasonlít (vmire, vkire)', tags: ['igék'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'けっこんする', romaji: 'kekkon suru', hu: 'összeházasodik (vkivel)', tags: ['igék'], jlpt: 'N4', lesson: [20], source: 'dekiru' },

  // Főnevek
  { kana: 'いちば', romaji: 'ichiba', hu: 'piac', tags: ['helyek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ねだん', romaji: 'nedan', hu: 'ár', tags: ['alapszavak'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'セット', romaji: 'setto', hu: 'készlet, szett', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'クッキー', romaji: 'kukkii', hu: 'sütemény, keksz', tags: ['ételek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'はちみつ', romaji: 'hachimitsu', hu: 'méz', tags: ['ételek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'クリーム', romaji: 'kuriimu', hu: 'krém', tags: ['ételek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ししゅう', romaji: 'shishuu', hu: 'hímzés', tags: ['alapszavak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'かご', romaji: 'kago', hu: 'kosár', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ピンク', romaji: 'pinku', hu: 'rózsaszín', tags: ['színek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ガス', romaji: 'gasu', hu: 'gáz, szénsav', tags: ['alapszavak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ものがたり', romaji: 'monogatari', hu: 'történet, mese', tags: ['szórakozás'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'さっきょく', romaji: 'sakkyoku', hu: 'zeneszerzés', tags: ['szórakozás'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'げんさく', romaji: 'gensaku', hu: 'az eredeti mű', tags: ['szórakozás'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'いざかや', romaji: 'izakaya', hu: 'kocsma', tags: ['helyek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'こっきょう', romaji: 'kokkyou', hu: 'országhatár', tags: ['helyek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'こうてい', romaji: 'koutei', hu: 'császár', tags: ['emberek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'むすめ', romaji: 'musume', hu: 'lányom', tags: ['kapcsolatok'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'せんそう', romaji: 'sensou', hu: 'háború', tags: ['alapszavak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ぐん', romaji: 'gun', hu: '-hadsereg', tags: ['alapszavak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'むら', romaji: 'mura', hu: 'falu', tags: ['helyek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'うそ', romaji: 'uso', hu: 'hazugság', tags: ['alapszavak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'もん', romaji: 'mon', hu: 'kapu', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ドア', romaji: 'doa', hu: 'ajtó', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'えだ', romaji: 'eda', hu: 'ág', tags: ['természet'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ひ', romaji: 'hi', hu: 'tűz', tags: ['természet'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ろうそく', romaji: 'rousoku', hu: 'gyertya', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'たまご', romaji: 'tamago', hu: 'tojás', tags: ['ételek'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'グラス', romaji: 'gurasu', hu: 'üvegpohár', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ポケット', romaji: 'poketto', hu: 'zseb', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'きんこ', romaji: 'kinko', hu: 'páncélszekrény, széf', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ひきだし', romaji: 'hikidashi', hu: 'fiók', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'かびん', romaji: 'kabin', hu: 'virágváza', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'さっきょくか', romaji: 'sakkyokuka', hu: 'zeneszerző', tags: ['munka'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'きもの', romaji: 'kimono', hu: 'kimonó', tags: ['tárgyak'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ようふく', romaji: 'youfuku', hu: 'ruha, öltözék (nyugati stílusú)', tags: ['tárgyak'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'くつした', romaji: 'kutsushita', hu: 'zokni', tags: ['tárgyak'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'けいさつ', romaji: 'keisatsu', hu: 'rendőrség', tags: ['helyek'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'きゅうきゅうしゃ', romaji: 'kyuukyuusha', hu: 'mentőautó', tags: ['közlekedés'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'ひがし', romaji: 'higashi', hu: 'kelet', tags: ['irányok'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'にし', romaji: 'nishi', hu: 'nyugat', tags: ['irányok'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'みなみ', romaji: 'minami', hu: 'dél (égtáj)', tags: ['irányok'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'きた', romaji: 'kita', hu: 'észak', tags: ['irányok'], jlpt: 'N4', lesson: [20], source: 'dekiru' },
  { kana: 'ふたご', romaji: 'futago', hu: 'iker', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [20], source: 'dekiru' },
  { kana: 'けんか', romaji: 'kenka', hu: 'veszekedés', tags: ['alapszavak'], jlpt: 'N5'},
];
const DEKIRU_L21 = [
  // Igék
  { kana: 'はる', romaji: 'haru', hu: 'ragaszt', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'おく', romaji: 'oku', hu: 'letesz', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'しく', romaji: 'shiku', hu: 'lefektet, leterít', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'まわす', romaji: 'mawasu', hu: 'fordít, teker', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'かわく', romaji: 'kawaku', hu: 'szárad, megszárad, kiszárad', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ならぶ', romaji: 'narabu', hu: '(fel)sorakozik, sorba áll', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'かたづける', romaji: 'katazukeru', hu: 'elrendez, rendet tesz', tags: ['igék'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'かける', romaji: 'kakeru', hu: 'felakaszt (naptárat)', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'できる', romaji: 'dekiru', hu: 'elkészül, felépül, megépül', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'はおる', romaji: 'haoru', hu: 'felvesz (felsőruhát, kabátot), felölt', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'むすぶ', romaji: 'musubu', hu: 'összeköt', tags: ['igék'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'じゅんびする', romaji: 'junbi suru', hu: 'felkészül, előkészít', tags: ['igék'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'そつぎょうする', romaji: 'sotsugyou suru', hu: 'iskolát, egyetemet elvégez', tags: ['igék'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'にゅうがくする', romaji: 'nyuugaku suru', hu: 'bejut (az iskolába, egyetemre)', tags: ['igék'], jlpt: 'N4', lesson: [21], source: 'dekiru' },

  // Főnevek
  { kana: 'きそく', romaji: 'kisoku', hu: 'szabály', tags: ['iskola'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'しゅうかん', romaji: 'shuukan', hu: 'szokás', tags: ['alapszavak'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'ぶんか', romaji: 'bunka', hu: 'kultúra', tags: ['kultúra'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'こうそく', romaji: 'kousoku', hu: 'iskolai szabályok, házirend', tags: ['iskola'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ふくそう', romaji: 'fukusou', hu: 'ruházat, öltözék', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'せいふく', romaji: 'seifuku', hu: 'uniformis, egyenruha', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'なつふく', romaji: 'natsufuku', hu: 'nyári ruha', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ふゆふく', romaji: 'fuyufuku', hu: 'téli ruha', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'そつぎょうしき', romaji: 'sotsugyoushiki', hu: 'ballagás, diplomaosztó ünnepség', tags: ['iskola'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'そつぎょうせい', romaji: 'sotsugyousei', hu: 'öregdiák', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'かもく', romaji: 'kamoku', hu: 'tantárgy', tags: ['iskola'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'こくご', romaji: 'kokugo', hu: 'anyanyelv', tags: ['iskola'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'せいぶつ', romaji: 'seibutsu', hu: 'biológia', tags: ['iskola'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ちり', romaji: 'chiri', hu: 'földrajz', tags: ['iskola'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'しょどう', romaji: 'shodou', hu: 'shodo, kalligráfia', tags: ['szórakozás'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'びじゅつ', romaji: 'bijutsu', hu: 'képzőművészet', tags: ['szórakozás'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'ゆかた', romaji: 'yukata', hu: 'yukata (nyári kimonó)', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'おび', romaji: 'obi', hu: 'obi, öv', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ひも', romaji: 'himo', hu: 'madzag, zsinór', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'びよういん', romaji: 'biyouin', hu: 'fodrászat', tags: ['helyek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'かみがた', romaji: 'kamigata', hu: 'hajforma, frizura', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ながさ', romaji: 'nagasa', hu: 'hosszúság, vminek a hossza', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ゆか', romaji: 'yuka', hu: 'padló', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'カーペット', romaji: 'kaapetto', hu: 'szőnyeg', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'かべ', romaji: 'kabe', hu: 'fal', tags: ['tárgyak'], jlpt: 'N4', lesson: [21], source: 'dekiru' },
  { kana: 'カレンダー', romaji: 'karendaa', hu: 'naptár', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ソファー', romaji: 'sofaa', hu: 'kanapé', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'つち', romaji: 'tsuchi', hu: 'föld, talaj', tags: ['természet'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'しお', romaji: 'shio', hu: 'só', tags: ['ételek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'おさら', romaji: 'osara', hu: 'tányér', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'コップ', romaji: 'koppu', hu: 'pohár', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ナイフ', romaji: 'naifu', hu: 'kés', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'なべ', romaji: 'nabe', hu: 'fazék, (főző)edény', tags: ['tárgyak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'サラダ', romaji: 'sarada', hu: 'saláta (kész étel)', tags: ['ételek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ドレッシング', romaji: 'doresshingu', hu: 'salátaöntet', tags: ['ételek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'すきやき', romaji: 'sukiyaki', hu: 'sukiyaki (marhahúsból készült japán étel)', tags: ['ételek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'とうふ', romaji: 'toufu', hu: 'tofu (szójababból készült túró)', tags: ['ételek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'ビール', romaji: 'biiru', hu: 'sör', tags: ['italok'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'さっぽろ', romaji: 'sapporo', hu: 'Szapporo', tags: ['helyek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'はんぶん', romaji: 'hanbun', hu: 'fele (vminek)', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },

  // Melléknevek, Határozószók és egyéb
  { kana: 'あつい', romaji: 'atsui', hu: 'vastag', tags: ['melléknevek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'うすい', romaji: 'usui', hu: 'vékony, gyenge, halvány, híg', tags: ['melléknevek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'きびしい', romaji: 'kibishii', hu: 'szigorú', tags: ['melléknevek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'じょうぶ', romaji: 'joubu', hu: 'erős, tartós', tags: ['melléknevek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'すてき', romaji: 'suteki', hu: 'helyes, édes', tags: ['melléknevek'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'つぎに', romaji: 'tsugi ni', hu: 'utána, ezt követően', tags: ['határozószavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'たとえば', romaji: 'tatoeba', hu: 'például', tags: ['határozószavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'けど', romaji: 'kedo', hu: 'de', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'それでは', romaji: 'sore dewa', hu: 'nos, hát akkor', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' },
  { kana: 'だから', romaji: 'dakara', hu: 'ezért', tags: ['alapszavak'], jlpt: 'N5', lesson: [21], source: 'dekiru' }
];
const DEKIRU_L22 = [
  // Igék
  { kana: 'あむ', romaji: 'amu', hu: 'köt, csomóz, horgol', tags: ['igék'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'ぬう', romaji: 'nuu', hu: 'varr', tags: ['igék'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'てつだう', romaji: 'tetsudau', hu: 'segít (vmiben)', tags: ['igék'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'とる', romaji: 'toru', hu: '(jó eredményt) ér el', tags: ['igék'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'こたえる', romaji: 'kotaeru', hu: 'válaszol, felel', tags: ['igék'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'たりる', romaji: 'tariru', hu: 'elég vmi, elegendő, elégséges', tags: ['igék'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'じゅうでんする', romaji: 'juudensuru', hu: 'feltölt (elemet)', tags: ['igék'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ちゅうもんする', romaji: 'chuumonsuru', hu: 'megrendel', tags: ['igék'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'ドライブする', romaji: 'doraibusuru', hu: 'vezet, autózik', tags: ['igék', 'szórakozás'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'よういする', romaji: 'youisuru', hu: 'előkészít', tags: ['igék'], jlpt: 'N5', lesson: [22], source: 'dekiru' },

  // Főnevek (Ruházat és Világ)
  { kana: 'いしょう', romaji: 'ishou', hu: 'viselet, öltözék', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'みんぞくいしょう', romaji: 'minzoku ishou', hu: 'népviselet', tags: ['tárgyak', 'kultúra'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ドレス', romaji: 'doresu', hu: 'női ruha, dressz', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ねまき', romaji: 'nemaki', hu: 'hálóruha, hálóing', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'アジア', romaji: 'ajia', hu: 'Ázsia', tags: ['helyek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'アフリカ', romaji: 'afurika', hu: 'Afrika', tags: ['helyek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ヨーロッパ', romaji: 'yooroppa', hu: 'Európa', tags: ['helyek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'レシピ', romaji: 'reshipi', hu: 'recept', tags: ['ételek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },

  // Technika és Szabadidő
  { kana: 'カーナビ', romaji: 'kaanabi', hu: 'navigációs rendszer, GPS', tags: ['tárgyak', 'közlekedés'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ガイド', romaji: 'gaido', hu: 'idegenvezető', tags: ['munka', 'utazás'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ツアー', romaji: 'tsuaa', hu: 'körút, körutazás', tags: ['utazás'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'デジカメ', romaji: 'dejikame', hu: 'digitális kamera', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'バッテリー', romaji: 'batterii', hu: 'elem, akkumulátor', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ひがえり', romaji: 'higaeri', hu: 'egynapos (kirándulás)', tags: ['idő', 'utazás'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'あそび', romaji: 'asobi', hu: 'játék, szórakozás', tags: ['szórakozás'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'きょうみ', romaji: 'kyoumi', hu: 'érdeklődés', tags: ['alapszavak'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'ベッド', romaji: 'beddo', hu: 'ágy', tags: ['tárgyak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'ベビー', romaji: 'bebi', hu: 'baba, csecsemő', tags: ['kapcsolatok'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'もんだい', romaji: 'mondai', hu: 'probléma, feladat', tags: ['iskola'], jlpt: 'N4', lesson: [22], source: 'dekiru' },
  { kana: 'まんなか', romaji: 'mannaka', hu: 'közép, közepe', tags: ['irányok'], jlpt: 'N5', lesson: [22], source: 'dekiru' },

  // Melléknevek és Határozók
  { kana: 'まずい', romaji: 'mazui', hu: 'rossz (ízű)', tags: ['melléknevek', 'ételek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'じゆう', romaji: 'jiyuu', hu: 'szabad', tags: ['melléknevek'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'きっと', romaji: 'kitto', hu: 'biztosan', tags: ['határozószavak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'だいたい', romaji: 'daitai', hu: 'körülbelül, nagyjából, többé-kevésbé', tags: ['határozószavak'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: '〜いき', romaji: '... iki', hu: '-ba tartó', tags: ['közlekedés'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: '〜はつ', romaji: '... hatsu', hu: '-kor/-ból induló', tags: ['közlekedés', 'idő'], jlpt: 'N5', lesson: [22], source: 'dekiru' },
  { kana: 'それで', romaji: 'sorede', hu: 'ezért, így', tags: ['alapszavak'], jlpt: 'N5', lesson: [22], source: 'dekiru' }
];
const DEKIRU_L23 = [
  // Igék (Konyhai műveletek és egyéb)
  { kana: 'きる', romaji: 'kiru', hu: 'vág; kikapcsol', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'にる', romaji: 'niru', hu: 'főz, forral', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'まぜる', romaji: 'mazeru', hu: 'kever', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'いためる', romaji: 'itameru', hu: 'süt, pirít (olajban)', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'かける', romaji: 'kakeru', hu: 'tűzre tesz (fazekat)', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'かす', romaji: 'kasu', hu: 'kölcsönad', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'つかれる', romaji: 'tsukareru', hu: 'elfárad', tags: ['igék'], jlpt: 'N4', lesson: [23], source: 'dekiru' },
  { kana: 'えんりょする', romaji: 'enryo suru', hu: 'tartózkodik (vmitől), visszafogja magát', tags: ['igék', 'udvariasság'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'しょうたいする', romaji: 'shoutai suru', hu: 'meghív', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'チェックする', romaji: 'chekku suru', hu: 'ellenőriz', tags: ['igék'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'つうやくする', romaji: 'tsuuyaku suru', hu: 'tolmácsol', tags: ['igék', 'munka'], jlpt: 'N5', lesson: [23], source: 'dekiru' },

  // Főnevek (Konyhai eszközök és alapanyagok)
  { kana: 'スプーン', romaji: 'supuun', hu: 'kanál', tags: ['tárgyak', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'はし', romaji: 'hashi', hu: '(evő)pálcika', tags: ['tárgyak', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'フォーク', romaji: 'fooku', hu: 'villa', tags: ['tárgyak', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'おおさじ', romaji: 'oosaji', hu: 'nagy kanál', tags: ['tárgyak', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ざいりょう', romaji: 'zairyou', hu: 'alapanyag, kellék', tags: ['alapszavak', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ナマズ', romaji: 'namazu', hu: 'harcsa', tags: ['állatok', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'こい', romaji: 'koi', hu: 'ponty', tags: ['állatok', 'ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'とり', romaji: 'tori', hu: 'tyúk, kakas, csirke', tags: ['állatok'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'とりにく', romaji: 'toriniku', hu: 'csirkehús', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ぶた', romaji: 'buta', hu: 'disznó, sertés', tags: ['állatok'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ぶたにく', romaji: 'butaniku', hu: 'sertéshús', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ぎゅうにく', romaji: 'gyuuniku', hu: 'marhahús', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'たまねぎ', romaji: 'tamanegi', hu: 'vöröshagyma', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'サンドイッチ', romaji: 'sandoicchi', hu: 'szendvics', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'あぶら', romaji: 'abura', hu: 'olaj', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'こしょう', romaji: 'koshou', hu: 'bors', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'さとう', romaji: 'satou', hu: 'cukor', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'しょうゆ', romaji: 'shouyu', hu: 'szójaszósz', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'バター', romaji: 'bataa', hu: 'vaj', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'パプリカこ', romaji: 'papurikako', hu: 'fűszerpaprika', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'もと', romaji: 'moto', hu: 'alap, ízsűrítmény', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'キューブ', romaji: 'kyuubu', hu: 'kocka', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'できあがり', romaji: 'dekiagari', hu: 'elkészült, készen van', tags: ['ételek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },

  // Főnevek (Épületen belüli és egyéb)
  { kana: 'エスカレーター', romaji: 'esukareetaa', hu: 'mozgólépcső', tags: ['tárgyak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'エレベーター', romaji: 'erebeetaa', hu: 'lift', tags: ['tárgyak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'トイレ', romaji: 'toire', hu: 'WC', tags: ['helyek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'ガラス', romaji: 'garasu', hu: '(ablak)üveg', tags: ['tárgyak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'どうぐ', romaji: 'dougu', hu: 'eszköz, szerszám', tags: ['tárgyak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'いみ', romaji: 'imi', hu: 'jelentés, értelem', tags: ['alapszavak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'りょうし', romaji: 'ryoushi', hu: 'halász', tags: ['munka'], jlpt: 'N5', lesson: [23], source: 'dekiru' },

  // Melléknevek, Határozószók és Kérdőszók
  { kana: 'きもちがいい', romaji: 'kimochi ga ii', hu: 'kellemes', tags: ['melléknevek'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'いっぱい', romaji: 'ippai', hu: 'tele', tags: ['határozószavak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'もう〜ない', romaji: 'mou ... nai', hu: 'már nincs', tags: ['alapszavak'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'いかが', romaji: 'ikaga', hu: 'Mit szól hozzá? (a どう udvarias alakja)', tags: ['kérdőszavak', 'udvariasság'], jlpt: 'N5', lesson: [23], source: 'dekiru' },
  { kana: 'しょうしょう', romaji: 'shoushou', hu: 'kicsit, kevés', tags: ['határozószavak', 'udvariasság'], jlpt: 'N5', lesson: [23], source: 'dekiru' }
];
const DEKIRU_L24 = [
  // Igék (Természet és Időjárás)
  { kana: 'くもる', romaji: 'kumoru', hu: 'beborul, felhősödik', tags: ['időjárás', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 489, 491]
  { kana: 'はれる', romaji: 'hareru', hu: 'kiderül (az ég)', tags: ['időjárás', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 492, 517]
  { kana: 'さく', romaji: 'saku', hu: 'virágzik, nyílik (virág)', tags: ['természet', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 494, 518]
  { kana: 'ちる', romaji: 'chiru', hu: 'szertehullik', tags: ['természet', 'igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 495, 519]
  { kana: 'かれる', romaji: 'kareru', hu: 'elhal, elszárad', tags: ['természet', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 496, 520]
  { kana: 'ひかる', romaji: 'hikaru', hu: 'fénylik, ragyog', tags: ['természet', 'igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 497, 521]
  { kana: 'てる', romaji: 'teru', hu: '(a hold) feljön / fénylik', tags: ['természet', 'igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 498, 522]
  { kana: 'ぬれる', romaji: 'nureru', hu: 'elázik, átázik, vizes (nedves) lesz', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 499, 523]
  { kana: 'とまる', romaji: 'tomaru', hu: 'megáll', tags: ['igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 500, 524]
  { kana: 'つく', romaji: 'tsuku', hu: 'hozzátartozik', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 502, 525]
  { kana: 'かかる', romaji: 'kakaru', hu: 'szivárvány keletkezik, ível', tags: ['természet', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 503, 526]
  { kana: 'かける', romaji: 'kakeru', hu: 'meglocsol', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 505, 527]
  { kana: 'うる', romaji: 'uru', hu: 'árusít, elad', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 506, 528]
  { kana: 'ひえる', romaji: 'hieru', hu: 'lehűl', tags: ['időjárás', 'igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 507, 529]
  { kana: 'ひやす', romaji: 'hiyasu', hu: 'lehűt', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 508, 530]
  { kana: 'つづける', romaji: 'tsuzukeru', hu: 'folytat', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 509, 531]
  { kana: 'なやむ', romaji: 'nayamu', hu: 'rágódik vmin, fáj a feje vmi miatt', tags: ['igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 510, 532]
  { kana: 'かんがえる', romaji: 'kangaeru', hu: 'gondol vmire, gondolkodik', tags: ['igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 511, 533]
  { kana: 'すぎる', romaji: 'sugiru', hu: 'elmúlik, eltelik (idő)', tags: ['idő', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 513, 534]
  { kana: 'つたえる', romaji: 'tsutaeru', hu: 'átad (üzenetet), továbbít (információt)', tags: ['kommunikáció', 'igék'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 514, 535, 536]
  { kana: 'けんがくする', romaji: 'kengakusuru', hu: 'tanulmányi célból megtekint, látogatást tesz vhol', tags: ['iskola', 'igék'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 515, 537]

  // Főnevek
  { kana: 'くも', romaji: 'kumo', hu: 'felhő', tags: ['időjárás'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 539, 540]
  { kana: 'つき', romaji: 'tsuki', hu: 'hold', tags: ['természet'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 541, 543]
  { kana: 'ほし', romaji: 'hoshi', hu: 'csillag', tags: ['természet'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 544, 550]
  { kana: 'にじ', romaji: 'niji', hu: 'szivárvány', tags: ['természet'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 545, 551]
  { kana: 'はなみ', romaji: 'hanami', hu: 'cseresznyevirág-nézés', tags: ['kultúra', 'szórakozás'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 546, 552]
  { kana: 'かんこうち', romaji: 'kankouchi', hu: 'turisták által látogatott hely', tags: ['helyek', 'utazás'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 548, 553]
  { kana: 'アパート', romaji: 'apaato', hu: '(bér)lakás', tags: ['helyek'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 554, 555]
  { kana: 'かがみ', romaji: 'kagami', hu: 'tükör', tags: ['tárgyak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 556, 557]
  { kana: 'まんねんひつ', romaji: 'mannenhitsu', hu: 'töltőtoll', tags: ['tárgyak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 558, 560]
  { kana: 'しあい', romaji: 'shiai', hu: 'mérkőzés', tags: ['sport'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 561, 566]
  { kana: 'じこ', romaji: 'jiko', hu: 'baleset', tags: ['alapszavak'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 562, 567]
  { kana: 'じゅく', romaji: 'juku', hu: 'juku (felkészítő iskola)', tags: ['helyek', 'iskola'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 563, 568]
  { kana: 'るす', romaji: 'rusu', hu: 'házon kívül tartózkodás, távollét', tags: ['alapszavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 564, 569]
  { kana: 'ちがい', romaji: 'chigai', hu: 'különbség, eltérés', tags: ['alapszavak'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 565, 570]

  // Melléknevek és Határozószók
  { kana: 'うらやましい', romaji: 'urayamashii', hu: 'irigylésre méltó', tags: ['melléknevek'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 572, 581]
  { kana: 'すぐに', romaji: 'suguni', hu: 'rögtön, azonnal', tags: ['határozószavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 574, 582]
  { kana: 'もうすぐ', romaji: 'mousugu', hu: 'nemsokára, mindjárt', tags: ['határozószavak'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 575, 583]
  { kana: 'ぜったいに', romaji: 'zettaini', hu: 'mindenképpen (semmiképpen, egyáltalán nem)', tags: ['határozószavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 576, 584, 585]
  { kana: 'だんだん', romaji: 'dandan', hu: 'fokozatosan, lassan', tags: ['határozószavak'], jlpt: 'N4', lesson: [24], source: 'dekiru' }, // [cite: 577, 586]
  { kana: 'とんとん', romaji: 'tonton', hu: 'ütemesen, fokozatosan', tags: ['határozószavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 578, 587]
  { kana: 'どっち', romaji: 'docchi', hu: 'merre?, melyik?, hol? (közvetlen forma)', tags: ['kérdőszavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 579, 588]

  // Egyéb kifejezések
  { kana: 'こっち', romaji: 'kocchi', hu: 'erre, itt (közvetlen forma)', tags: ['alapszavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 589, 594]
  { kana: 'そっち', romaji: 'socchi', hu: 'arra, ott (közvetlen forma)', tags: ['alapszavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 590, 595]
  { kana: 'あっち', romaji: 'acchi', hu: '(am)arra, ott (közvetlen forma)', tags: ['alapszavak'], jlpt: 'N5', lesson: [24], source: 'dekiru' }, // [cite: 591, 596]
  { kana: 'おげんきで', romaji: 'ogenki de', hu: 'Jó egészséget! Minden jót!', tags: ['udvariasság'], jlpt: 'N5', lesson: [24], source: 'dekiru' } // [cite: 592, 597]
];