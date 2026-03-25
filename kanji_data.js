/* ══════════════════════════════════════════════════════
   LexiLearn – Kandzsi Adatbázis (Kanji modul)
   Minden kandzsi: kanji, meaning, onyomi, kunyomi,
                   romaji, jlpt, lesson
══════════════════════════════════════════════════════ */
const KANJI_DATA = [
  // ════ JLPT N5 – 1. Lecke: Napok / Természet ══════
  { kanji: '日', meaning: 'nap / naptár-nap',    onyomi: 'ニチ・ジツ',   kunyomi: 'ひ・か',          romaji: 'hi / nichi',    jlpt: 'N5', lesson: 1 },
  { kanji: '月', meaning: 'hold / hónap',         onyomi: 'ゲツ・ガツ',   kunyomi: 'つき',            romaji: 'tsuki / getsu', jlpt: 'N5', lesson: 1 },
  { kanji: '火', meaning: 'tűz',                  onyomi: 'カ',           kunyomi: 'ひ',              romaji: 'hi / ka',       jlpt: 'N5', lesson: 1 },
  { kanji: '水', meaning: 'víz',                  onyomi: 'スイ',         kunyomi: 'みず',            romaji: 'mizu / sui',    jlpt: 'N5', lesson: 1 },
  { kanji: '木', meaning: 'fa',                   onyomi: 'モク・ボク',   kunyomi: 'き',              romaji: 'ki / moku',     jlpt: 'N5', lesson: 1 },
  { kanji: '金', meaning: 'arany / pénz',         onyomi: 'キン・コン',   kunyomi: 'かね',            romaji: 'kane / kin',    jlpt: 'N5', lesson: 1 },
  { kanji: '土', meaning: 'föld / talaj',         onyomi: 'ド・ト',       kunyomi: 'つち',            romaji: 'tsuchi / do',   jlpt: 'N5', lesson: 1 },
  { kanji: '山', meaning: 'hegy',                 onyomi: 'サン・セン',   kunyomi: 'やま',            romaji: 'yama / san',    jlpt: 'N5', lesson: 1 },
  { kanji: '川', meaning: 'folyó',                onyomi: 'セン',         kunyomi: 'かわ',            romaji: 'kawa / sen',    jlpt: 'N5', lesson: 1 },

  // ════ JLPT N5 – 2. Lecke: Emberek ════════════════
  { kanji: '人', meaning: 'ember',                onyomi: 'ジン・ニン',   kunyomi: 'ひと',            romaji: 'hito / jin',    jlpt: 'N5', lesson: 2 },
  { kanji: '子', meaning: 'gyermek',              onyomi: 'シ',           kunyomi: 'こ',              romaji: 'ko / shi',      jlpt: 'N5', lesson: 2 },
  { kanji: '女', meaning: 'nő / lány',            onyomi: 'ジョ',         kunyomi: 'おんな',          romaji: 'onna / jo',     jlpt: 'N5', lesson: 2 },
  { kanji: '男', meaning: 'férfi',                onyomi: 'ダン・ナン',   kunyomi: 'おとこ',          romaji: 'otoko / dan',   jlpt: 'N5', lesson: 2 },
  { kanji: '父', meaning: 'apa',                  onyomi: 'フ',           kunyomi: 'ちち',            romaji: 'chichi / fu',   jlpt: 'N5', lesson: 2 },
  { kanji: '母', meaning: 'anya',                 onyomi: 'ボ',           kunyomi: 'はは',            romaji: 'haha / bo',     jlpt: 'N5', lesson: 2 },

  // ════ JLPT N5 – 3. Lecke: Méret / Irány ══════════
  { kanji: '大', meaning: 'nagy',                 onyomi: 'ダイ・タイ',   kunyomi: 'おお',            romaji: 'oo / dai',      jlpt: 'N5', lesson: 3 },
  { kanji: '小', meaning: 'kicsi',                onyomi: 'ショウ',       kunyomi: 'ちい・こ',        romaji: 'chii / shou',   jlpt: 'N5', lesson: 3 },
  { kanji: '上', meaning: 'felső / fent',         onyomi: 'ジョウ',       kunyomi: 'うえ・のぼ',      romaji: 'ue / jou',      jlpt: 'N5', lesson: 3 },
  { kanji: '下', meaning: 'alsó / lent',          onyomi: 'カ・ゲ',       kunyomi: 'した・くだ',      romaji: 'shita / ka',    jlpt: 'N5', lesson: 3 },
  { kanji: '中', meaning: 'közép / belső',        onyomi: 'チュウ',       kunyomi: 'なか',            romaji: 'naka / chuu',   jlpt: 'N5', lesson: 3 },

  // ════ JLPT N5 – 4. Lecke: Testrészek ══════════════
  { kanji: '口', meaning: 'száj',                 onyomi: 'コウ・ク',     kunyomi: 'くち',            romaji: 'kuchi / kou',   jlpt: 'N5', lesson: 4 },
  { kanji: '目', meaning: 'szem',                 onyomi: 'モク',         kunyomi: 'め',              romaji: 'me / moku',     jlpt: 'N5', lesson: 4 },
  { kanji: '耳', meaning: 'fül',                  onyomi: 'ジ',           kunyomi: 'みみ',            romaji: 'mimi / ji',     jlpt: 'N5', lesson: 4 },
  { kanji: '手', meaning: 'kéz',                  onyomi: 'シュ',         kunyomi: 'て',              romaji: 'te / shu',      jlpt: 'N5', lesson: 4 },
  { kanji: '足', meaning: 'láb',                  onyomi: 'ソク',         kunyomi: 'あし',            romaji: 'ashi / soku',   jlpt: 'N5', lesson: 4 },

  // ════ JLPT N5 – 5. Lecke: Iskola / Tanulás ════════
  { kanji: '本', meaning: 'könyv / gyökér',       onyomi: 'ホン',         kunyomi: 'もと',            romaji: 'hon / moto',    jlpt: 'N5', lesson: 5 },
  { kanji: '学', meaning: 'tanulás',              onyomi: 'ガク',         kunyomi: 'まな',            romaji: 'mana / gaku',   jlpt: 'N5', lesson: 5 },
  { kanji: '校', meaning: 'iskola',               onyomi: 'コウ',         kunyomi: '',                romaji: 'kou',           jlpt: 'N5', lesson: 5 },
  { kanji: '先', meaning: 'előző / vezető',       onyomi: 'セン',         kunyomi: 'さき',            romaji: 'saki / sen',    jlpt: 'N5', lesson: 5 },
  { kanji: '生', meaning: 'élet / születés',      onyomi: 'セイ・ショウ', kunyomi: 'い・う',          romaji: 'sei / i',       jlpt: 'N5', lesson: 5 },
  { kanji: '年', meaning: 'év',                   onyomi: 'ネン',         kunyomi: 'とし',            romaji: 'toshi / nen',   jlpt: 'N5', lesson: 5 },

  // ════ JLPT N4 – 6. Lecke: Kommunikáció ════════════
  { kanji: '電', meaning: 'elektromosság',        onyomi: 'デン',         kunyomi: '',                romaji: 'den',           jlpt: 'N4', lesson: 6 },
  { kanji: '話', meaning: 'beszéd / történet',    onyomi: 'ワ',           kunyomi: 'はな',            romaji: 'hanashi / wa',  jlpt: 'N4', lesson: 6 },
  { kanji: '語', meaning: 'nyelv / szó',          onyomi: 'ゴ',           kunyomi: 'かた',            romaji: 'go / kata',     jlpt: 'N4', lesson: 6 },
  { kanji: '国', meaning: 'ország',               onyomi: 'コク',         kunyomi: 'くに',            romaji: 'kuni / koku',   jlpt: 'N4', lesson: 6 },

  // ════ JLPT N4 – 7. Lecke: Épületek / Helyek ═══════
  { kanji: '門', meaning: 'kapu',                 onyomi: 'モン',         kunyomi: 'かど',            romaji: 'kado / mon',    jlpt: 'N4', lesson: 7 },
  { kanji: '町', meaning: 'kisváros / negyed',    onyomi: 'チョウ',       kunyomi: 'まち',            romaji: 'machi / chou',  jlpt: 'N4', lesson: 7 },
  { kanji: '道', meaning: 'út / módszer',         onyomi: 'ドウ・トウ',   kunyomi: 'みち',            romaji: 'michi / dou',   jlpt: 'N4', lesson: 7 },
  { kanji: '店', meaning: 'bolt / üzlet',         onyomi: 'テン',         kunyomi: 'みせ',            romaji: 'mise / ten',    jlpt: 'N4', lesson: 7 },

  // ════ JLPT N4 – 8. Lecke: Cselekvések ═════════════
  { kanji: '食', meaning: 'evés / étel',          onyomi: 'ショク',       kunyomi: 'た',              romaji: 'ta / shoku',    jlpt: 'N4', lesson: 8 },
  { kanji: '飲', meaning: 'ivás',                 onyomi: 'イン',         kunyomi: 'の',              romaji: 'no / in',       jlpt: 'N4', lesson: 8 },
  { kanji: '書', meaning: 'írás',                 onyomi: 'ショ',         kunyomi: 'か',              romaji: 'ka / sho',      jlpt: 'N4', lesson: 8 },
  { kanji: '読', meaning: 'olvasás',              onyomi: 'ドク',         kunyomi: 'よ',              romaji: 'yo / doku',     jlpt: 'N4', lesson: 8 },
  { kanji: '見', meaning: 'látás / nézés',        onyomi: 'ケン',         kunyomi: 'み',              romaji: 'mi / ken',      jlpt: 'N4', lesson: 8 },
  { kanji: '聞', meaning: 'hallás / kérdezés',    onyomi: 'ブン・モン',   kunyomi: 'き',              romaji: 'ki / bun',      jlpt: 'N4', lesson: 8 },
];
