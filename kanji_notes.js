/* ══════════════════════════════════════════════════════
   LexiLearn – Kandzsi jegyzetek (V13.66)
   A kandzsi mód kártyáin az „i” gomb lapja: a kandzsi felépítése egy rövid emlékeztető képpel, és az
   olvasatok használata (a kun olvasat teljes alakja okuriganával, az on olvasat egy példával).
   Kulcs: a kandzsi. Mezők (mind elhagyható, rövid szöveg):
     parts – a részek a jelentésükkel; ahol a KanjiVG-felbontás hiányos, ez a pontos
     mn    – az emlékeztető: rövid kép a részekből, képírásnál az eredet
     kun   – kun olvasatok teljes alakban, jelentéssel
     on    – on olvasatok, mindegyik egy példával
   Adagonként a kandzsi-leckék sorrendjében: 1. adag = 1–5. lecke (N5).
══════════════════════════════════════════════════════ */
const KANJI_NOTES = {
  // ─── 1. lecke: számok, nap, hold ───────────────
  '一': { parts: 'egy vízszintes vonás', mn: 'Képírás: egy vonás, egy darab.', kun: '一つ (ひとつ) egy darab; 一人 (ひとり) egy ember', on: 'イチ: 一月 (いちがつ) január; 一番 (いちばん) a legjobb, első' },
  '二': { parts: 'két vízszintes vonás', mn: 'Képírás: két vonás, kettő.', kun: '二つ (ふたつ) két darab; 二人 (ふたり) két ember', on: 'ニ: 二月 (にがつ) február' },
  '三': { parts: 'három vízszintes vonás', mn: 'Képírás: három vonás; a középső a legrövidebb.', kun: '三つ (みっつ) három darab; 三日 (みっか) harmadika, három nap', on: 'サン: 三月 (さんがつ) március' },
  '四': { parts: 'keret (囗) + benne két láb (儿)', mn: 'A négyszögletes keret négy oldala: négy.', kun: '四つ (よっつ) négy darab; 四 (よん) négy', on: 'シ: 四月 (しがつ) április. A シ a halálra (死) emlékeztet, ezért számolásnál gyakran よん.' },
  '五': { parts: 'két vízszintes vonal között egy csavart kereszt', mn: 'A felső és az alsó vonal közé zárt csavart kereszt: öt.', kun: '五つ (いつつ) öt darab', on: 'ゴ: 五月 (ごがつ) május; 五分 (ごふん) öt perc' },
  '六': { parts: 'fedő (亠) + két széttartó láb (八)', mn: 'Egy tető két széttartó lábon: hat.', kun: '六つ (むっつ) hat darab', on: 'ロク: 六月 (ろくがつ) június; 六百 (ろっぴゃく) hatszáz' },
  '七': { parts: 'egy vonal (一) + lefelé kanyarodó vonás (乙)', mn: 'Egy vonalat lefelé hajló vonás vág át, mint egy fejjel lefelé fordított 7-es.', kun: '七つ (ななつ) hét darab; 七 (なな) hét', on: 'シチ: 七月 (しちがつ) július. Számolásnál gyakran なな, mert a シチ könnyen összekeveredik az イチ-vel.' },
  '八': { parts: 'két egymástól elhajló vonás', mn: 'Két széttartó vonás: nyolc. Japánban szerencsés szám, mert lefelé szélesedik.', kun: '八つ (やっつ) nyolc darab; 八日 (ようか) nyolcadika', on: 'ハチ: 八月 (はちがつ) augusztus; 八百 (はっぴゃく) nyolcszáz' },
  '九': { parts: 'egy horgas vonás (乙) + egy hajló vonás (丿)', mn: 'Egy kampós kar és egy hajló vonás: kilenc. Hasonlít a 力-ra (erő), de a horog itt kifelé fut.', kun: '九つ (ここのつ) kilenc darab', on: 'キュウ: 九 (きゅう) kilenc; ク: 九月 (くがつ) szeptember, 九時 (くじ) kilenc óra' },
  '十': { parts: 'függőleges és vízszintes vonás keresztje', mn: 'Egy kereszt minden irányba: tíz, a teljes számsor.', kun: '十 (とお) tíz darab; 十日 (とおか) tizedike', on: 'ジュウ: 十月 (じゅうがつ) október; 十分 (じゅっぷん) tíz perc' },
  '日': { parts: 'keret, középen egy vonással', mn: 'Képírás: a Nap korongja; nap és nappal is.', kun: '日 (ひ) nap; -か a napok számában: 三日 (みっか) harmadika', on: 'ニチ: 毎日 (まいにち) minden nap; ジツ: 休日 (きゅうじつ) szabadnap. A 日本 (にほん) rendhagyó.' },
  '月': { parts: 'álló keret, benne két vonás', mn: 'Képírás: a sarló alakú Hold. Egy holdciklus a hónap is.', kun: '月 (つき) a Hold; hónap', on: 'ゲツ: 月曜日 (げつようび) hétfő; ガツ: 一月 (いちがつ) január (a hónapnevekben)' },

  // ─── 2. lecke: irányok, számok, család ─────────
  '白': { parts: 'egy vonás (丿) + nap (日)', mn: 'A nap fölött egy fénysugár: ragyogó, fehér.', kun: '白い (しろい) fehér; 白 (しろ) a fehér szín', on: 'ハク: 白紙 (はくし) üres lap' },
  '百': { parts: 'egy (一) + fehér (白)', mn: 'Egy vonal a fehér (白) fölött: száz.', on: 'ヒャク: 百 (ひゃく) száz. A hang változik: 三百 (さんびゃく), 六百 (ろっぴゃく)' },
  '中': { parts: 'keret (口) + középen függőleges vonal (丨)', mn: 'Egy vonal pontosan a doboz közepén át: közép, belül.', kun: '中 (なか) belseje, közepe', on: 'チュウ: 中国 (ちゅうごく) Kína; utótagként ジュウ: 一日中 (いちにちじゅう) egész nap' },
  '千': { parts: 'egy hajló vonás (丿) + tíz (十)', mn: 'A tíz (十) fölött egy vonás: ezer.', kun: 'ち: csak nevekben, 千葉 (ちば)', on: 'セン: 千 (せん) ezer. A hang változik: 三千 (さんぜん) háromezer' },
  '上': { parts: 'alapvonal (一) + fölötte felfelé mutató jel (卜)', mn: 'A vonal fölé mutató jel: fent, felett.', kun: '上 (うえ) fent; 上がる (あがる) felmegy; 上げる (あげる) felemel, ad', on: 'ジョウ: 上手 (じょうず) ügyes; 以上 (いじょう) legalább, felett' },
  '下': { parts: 'vonal (一) + alatta lefelé mutató jel (卜)', mn: 'A vonal alá mutató jel: lent, alatt.', kun: '下 (した) lent; 下がる (さがる) lejjebb megy; 下りる (おりる) leszáll', on: 'カ: 地下鉄 (ちかてつ) metró; ゲ: 下車 (げしゃ) leszállás. A 下手 (へた) ügyetlen rendhagyó.' },
  '万': { parts: 'egy (一) + alatta egy kampós vonás', mn: 'Egy vonal alatt egy kampó: tízezer, a japán számolás fő egysége.', on: 'マン: 一万 (いちまん) tízezer; 一万円 (いちまんえん); バン: 万歳 (ばんざい) éljen' },
  '左': { parts: 'kéz (ナ) + munka, szerszám (工)', mn: 'A kéz a szerszámot (工) tartja: a bal kéz fog, a jobb dolgozik. A 右-ban alul 口 van.', kun: '左 (ひだり) bal', on: 'サ: 左右 (さゆう) jobbra-balra; 左折 (させつ) balra kanyarodás' },
  '右': { parts: 'kéz (ナ) + száj (口)', mn: 'A kéz a szájhoz (口) emeli az ételt: a jobb kéz. A 左-ban alul 工 van.', kun: '右 (みぎ) jobb', on: 'ウ: 右折 (うせつ) jobbra kanyarodás; ユウ: 左右 (さゆう) jobb és bal' },
  '子': { parts: 'képírás', mn: 'Képírás: kitárt karú, pólyába tekert kisgyerek.', kun: '子 (こ) gyerek; 子ども (こども) gyerek', on: 'シ: 女子 (じょし) lány; 帽子 (ぼうし) kalap' },
  '女': { parts: 'képírás', mn: 'Képírás: térdelő nő, keresztbe tett karral.', kun: '女 (おんな) nő; 女の子 (おんなのこ) kislány', on: 'ジョ: 女性 (じょせい) nő (hivatalos); 彼女 (かのじょ) ő (nő), barátnő' },
  '母': { parts: 'nő (女) alakja, két ponttal', mn: 'Egy nő alakja, két ponttal a mellkasán: az anya, aki táplál.', kun: '母 (はは) anya (a sajátunk); お母さん (おかあさん) anya (megszólítás, rendhagyó)', on: 'ボ: 母国 (ぼこく) anyaország' },

  // ─── 3. lecke: méret, elemek ───────────────────
  '小': { parts: 'egy függőleges vonás, két oldalán egy-egy pont', mn: 'Egy vonásról két kis darab pattan le: kicsi.', kun: '小さい (ちいさい) kicsi; előtagként こ: 小鳥 (ことり) kismadár', on: 'ショウ: 小学校 (しょうがっこう) általános iskola' },
  '大': { parts: 'képírás', mn: 'Képírás: kitárt karral álló ember, aki nagynak mutatja magát.', kun: '大きい (おおきい) nagy; 大人 (おとな) felnőtt (rendhagyó)', on: 'ダイ: 大学 (だいがく) egyetem; タイ: 大切 (たいせつ) fontos' },
  '外': { parts: 'este (夕) + jósjel (卜)', mn: 'Este (夕) a jósjel (卜) mellett, a házon kívül állsz: kint, külső.', kun: '外 (そと) kint; 外す (はずす) levesz, kiold', on: 'ガイ: 外国 (がいこく) külföld; 外国人 (がいこくじん) külföldi' },
  '名': { parts: 'este (夕) + száj (口)', mn: 'Este (夕), a sötétben a szájaddal (口) mondod ki a neved, hogy felismerjenek.', kun: '名前 (なまえ) név', on: 'メイ: 有名 (ゆうめい) híres; ミョウ: 名字 (みょうじ) családnév' },
  '水': { parts: 'képírás', mn: 'Képírás: középen a sodrás, két oldalt a fröccsenő cseppek.', kun: '水 (みず) víz (hideg)', on: 'スイ: 水曜日 (すいようび) szerda; 水泳 (すいえい) úszás' },
  '土': { parts: 'képírás', mn: 'Egy halom föld a talajon (alsó vonal). A 士 (harcos) felső vonala a hosszabb.', kun: '土 (つち) föld, talaj', on: 'ド: 土曜日 (どようび) szombat; ト: 土地 (とち) telek' },
  '時': { parts: 'nap (日) + templom (寺 = 土 + 寸)', mn: 'A nap (日) járását a templomban (寺) mérték: idő, óra.', kun: '時 (とき) idő, alkalom; 時計 (とけい) óra (rendhagyó)', on: 'ジ: 時間 (じかん) idő; 三時 (さんじ) három óra' },
  '火': { parts: 'képírás', mn: 'Képírás: felcsapó láng, két oldalt szikrákkal.', kun: '火 (ひ) tűz', on: 'カ: 火曜日 (かようび) kedd; 火事 (かじ) tűzvész' },
  '木': { parts: 'képírás', mn: 'Képírás: egy fa törzzsel, felül ágakkal, alul gyökerekkel.', kun: '木 (き) fa', on: 'モク: 木曜日 (もくようび) csütörtök; ボク: 大木 (たいぼく) nagy fa' },
  '本': { parts: 'fa (木) + alul egy rövid vonás', mn: 'A fa (木) tövénél egy vonás jelöli a gyökeret: eredet, alap; innen a könyv is.', kun: 'もと: eredet, alap (ritka)', on: 'ホン: 本 (ほん) könyv; 日本 (にほん) Japán. Számlálóként: 一本 (いっぽん), 三本 (さんぼん)' },
  '先': { parts: 'előrehajló alak + lábak (儿)', mn: 'A lábak (儿) elöl haladnak: előre, előbb, korábbi.', kun: '先 (さき) előbb, elöl; valaminek az eleje', on: 'セン: 先生 (せんせい) tanár; 先週 (せんしゅう) múlt hét' },
  '車': { parts: 'képírás', mn: 'Képírás: szekér felülről nézve; középen a kocsiszekrény, a vonal a tengely.', kun: '車 (くるま) autó', on: 'シャ: 電車 (でんしゃ) vonat; 自転車 (じてんしゃ) kerékpár' },

  // ─── 4. lecke: tanulás, beszéd, égtájak ────────
  '前': { parts: 'felül két kis vonás + hús (月) + kés (刂)', mn: 'A kés (刂) a hús (月) előtt: elöl, előtt.', kun: '前 (まえ) előtt, elöl', on: 'ゼン: 午前 (ごぜん) délelőtt; 前半 (ぜんはん) első fele' },
  '学': { parts: 'felül sugarak (⺍) + tető (冖) + gyerek (子)', mn: 'A tető (冖) alatt a gyerek (子) tanul, fölötte felragyog a tudás.', kun: '学ぶ (まなぶ) tanul', on: 'ガク: 学生 (がくせい) diák; 大学 (だいがく) egyetem; 学校 (がっこう) iskola' },
  '書': { parts: 'ecset (聿) + alul a leírt szöveg (日)', mn: 'A kézben tartott ecset (聿) alatt a leírt sorok: ír.', kun: '書く (かく) ír', on: 'ショ: 辞書 (じしょ) szótár; 図書館 (としょかん) könyvtár' },
  '話': { parts: 'beszéd (言) + nyelv (舌)', mn: 'A szavak (言) a nyelvről (舌) jönnek: beszél.', kun: '話す (はなす) beszél; 話 (はなし) történet, beszélgetés', on: 'ワ: 電話 (でんわ) telefon; 会話 (かいわ) beszélgetés' },
  '語': { parts: 'beszéd (言) + én (吾 = 五 + 口)', mn: 'A szavak (言), amiket én (吾) mondok: nyelv.', kun: '語る (かたる) elbeszél, mesél', on: 'ゴ: 日本語 (にほんご) japán nyelv; 英語 (えいご) angol nyelv' },
  '天': { parts: 'egy (一) + nagy (大)', mn: 'A nagy (大) ember feje fölötti vonal: az ég.', kun: 'あま: 天の川 (あまのがわ) Tejút', on: 'テン: 天気 (てんき) időjárás; 天国 (てんごく) mennyország' },
  '北': { parts: 'két egymásnak háttal álló ember', mn: 'Képírás: két ember egymásnak háttal. A ház a déli fénynek fordul, a háta észak felé néz: észak.', kun: '北 (きた) észak', on: 'ホク: 東北 (とうほく) északkelet; 北海道 (ほっかいどう)' },
  '毎': { parts: 'felül egy vonás + anya (母)', mn: 'Az anya (母) minden egyes nap ott van: minden.', on: 'マイ: 毎日 (まいにち) minden nap; 毎朝 (まいあさ) minden reggel' },
  '東': { parts: 'fa (木) + nap (日)', mn: 'A nap (日) a fák (木) mögül kel fel: kelet.', kun: '東 (ひがし) kelet', on: 'トウ: 東京 (とうきょう) Tokió; 東北 (とうほく) északkelet' },
  '電': { parts: 'eső (雨) + alul villám', mn: 'Az eső (雨) alól kicsapó villám: elektromosság.', on: 'デン: 電車 (でんしゃ) vonat; 電話 (でんわ) telefon; 電気 (でんき) villany' },
  '午': { parts: 'egy hajló vonás + tíz (十) alakú rész', mn: 'Hasonlít a 牛-ra (marha), de a függőleges vonás nem lóg ki felül. A nap közepe: dél.', on: 'ゴ: 午前 (ごぜん) délelőtt; 午後 (ごご) délután' },
  '友': { parts: 'kéz (ナ) + kéz (又)', mn: 'Két kéz összefog: barát.', kun: '友達 (ともだち) barát', on: 'ユウ: 友人 (ゆうじん) barát (hivatalos); 親友 (しんゆう) legjobb barát' },

  // ─── 5. lecke: mozgás, emberek, idő ────────────
  '出': { parts: 'két egymásra rakott hegy (山)', mn: 'Egy hegy a másikon, kifelé emelkedik: kimegy, kiad.', kun: '出る (でる) kimegy; 出す (だす) kiad, elküld; 出口 (でぐち) kijárat', on: 'シュツ: 出発 (しゅっぱつ) indulás; 出席 (しゅっせき) jelenlét' },
  '入': { parts: 'két vonás, a bal a hosszabb', mn: 'Egy nyílás, amelybe belépsz: bemegy. A 人 (ember) tükörképe.', kun: '入る (はいる) bemegy; 入れる (いれる) berak; 入口 (いりぐち) bejárat', on: 'ニュウ: 入学 (にゅうがく) iskolakezdés; 入院 (にゅういん) kórházba kerülés' },
  '分': { parts: 'széttartó vonások (八) + kés (刀)', mn: 'A kés (刀) kettévágja: rész, oszt; az órát percekre.', kun: '分ける (わける) eloszt; 分かる (わかる) ért', on: 'ブン: 自分 (じぶん) saját maga; フン: 五分 (ごふん) öt perc, 一分 (いっぷん) egy perc' },
  '男': { parts: 'rizsföld (田) + erő (力)', mn: 'Aki a rizsföldön (田) erővel (力) dolgozik: férfi.', kun: '男 (おとこ) férfi; 男の子 (おとこのこ) fiú', on: 'ダン: 男性 (だんせい) férfi (hivatalos); ナン: 長男 (ちょうなん) legidősebb fiú' },
  '行': { parts: 'képírás', mn: 'Képírás: útkereszteződés felülről; menni, haladni.', kun: '行く (いく) megy; 行う (おこなう) végez, rendez', on: 'コウ: 旅行 (りょこう) utazás; 銀行 (ぎんこう) bank; ギョウ: 行事 (ぎょうじ) rendezvény' },
  '人': { parts: 'képírás', mn: 'Képírás: két lábon lépő ember oldalról.', kun: '人 (ひと) ember; 一人 (ひとり), 二人 (ふたり) rendhagyó', on: 'ジン: 日本人 (にほんじん) japán ember; ニン: 三人 (さんにん) három ember' },
  '休': { parts: 'ember (亻) + fa (木)', mn: 'Az ember (亻) nekidől a fának (木), és pihen. A 体-ban (test) a 本 áll.', kun: '休む (やすむ) pihen, hiányzik; 休み (やすみ) szünet, szabadnap', on: 'キュウ: 休日 (きゅうじつ) szabadnap' },
  '何': { parts: 'ember (亻) + lehet (可)', mn: 'Az ember (亻) kérdez: mi lehet (可) ez?', kun: '何 (なに) mi; なん lesz で, の és számláló előtt: 何時 (なんじ) hány óra', on: 'カ: ritka, csak összetételben: 幾何 (きか) geometria' },
  '年': { parts: 'ember + gabona (禾) régi alakja', mn: 'Az ember a vállán viszi a termést: aratástól aratásig tart egy év.', kun: '年 (とし) év, életkor; 今年 (ことし) idén (rendhagyó)', on: 'ネン: 来年 (らいねん) jövőre; 三年 (さんねん) három év' },
  '半': { parts: 'két kis vonás + két vízszintes vonal + függőleges vonás', mn: 'Egy függőleges vonás kettévágja: fél.', kun: '半ば (なかば) a közepe; félig', on: 'ハン: 半分 (はんぶん) fele; 三時半 (さんじはん) fél négy' },
  '父': { parts: 'képírás', mn: 'Képírás: két keresztbe tett bot a kézben: a családfő, az apa.', kun: '父 (ちち) apa (a sajátunk); お父さん (おとうさん) apa (megszólítás, rendhagyó)', on: 'フ: 父母 (ふぼ) szülők' },
  '校': { parts: 'fa (木) + keresztez, találkozik (交)', mn: 'Fából (木) épült ház, ahol az emberek összegyűlnek (交): iskola.', on: 'コウ: 学校 (がっこう) iskola; 高校 (こうこう) középiskola' }
};
