/* ══════════════════════════════════════════════════════
   LexiLearn – Kandzsi jegyzetek (V13.66)
   A kandzsi mód kártyáin az „i” gomb lapja: a kandzsi felépítése egy rövid emlékeztető képpel, és az
   olvasatok használata (a kun olvasat teljes alakja okuriganával, az on olvasat egy példával).
   Kulcs: a kandzsi. Mezők (mind elhagyható, rövid szöveg):
     parts – a részek a jelentésükkel; ahol a KanjiVG-felbontás hiányos, ez a pontos (képírásnál elmarad)
     mn    – az emlékeztető: rövid kép a részekből, képírásnál az eredet
     kun   – kun olvasatok teljes alakban, jelentéssel
     on    – on olvasatok, mindegyik egy példával
   Adagonként a kandzsi-leckék sorrendjében: 1. adag = 1–5. lecke (N5), 2. adag = 6–10. lecke (N5, N4).
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
  '子': { mn: 'Képírás: kitárt karú, pólyába tekert kisgyerek.', kun: '子 (こ) gyerek; 子ども (こども) gyerek', on: 'シ: 女子 (じょし) lány; 帽子 (ぼうし) kalap' },
  '女': { mn: 'Képírás: térdelő nő, keresztbe tett karral.', kun: '女 (おんな) nő; 女の子 (おんなのこ) kislány', on: 'ジョ: 女性 (じょせい) nő (hivatalos); 彼女 (かのじょ) ő (nő), barátnő' },
  '母': { parts: 'nő (女) alakja, két ponttal', mn: 'Egy nő alakja, két ponttal a mellkasán: az anya, aki táplál.', kun: '母 (はは) anya (a sajátunk); お母さん (おかあさん) anya (megszólítás, rendhagyó)', on: 'ボ: 母国 (ぼこく) anyaország' },

  // ─── 3. lecke: méret, elemek ───────────────────
  '小': { parts: 'egy függőleges vonás, két oldalán egy-egy pont', mn: 'Egy vonásról két kis darab pattan le: kicsi.', kun: '小さい (ちいさい) kicsi; előtagként こ: 小鳥 (ことり) kismadár', on: 'ショウ: 小学校 (しょうがっこう) általános iskola' },
  '大': { mn: 'Képírás: kitárt karral álló ember, aki nagynak mutatja magát.', kun: '大きい (おおきい) nagy; 大人 (おとな) felnőtt (rendhagyó)', on: 'ダイ: 大学 (だいがく) egyetem; タイ: 大切 (たいせつ) fontos' },
  '外': { parts: 'este (夕) + jósjel (卜)', mn: 'Este (夕) a jósjel (卜) mellett, a házon kívül állsz: kint, külső.', kun: '外 (そと) kint; 外す (はずす) levesz, kiold', on: 'ガイ: 外国 (がいこく) külföld; 外国人 (がいこくじん) külföldi' },
  '名': { parts: 'este (夕) + száj (口)', mn: 'Este (夕), a sötétben a szájaddal (口) mondod ki a neved, hogy felismerjenek.', kun: '名前 (なまえ) név', on: 'メイ: 有名 (ゆうめい) híres; ミョウ: 名字 (みょうじ) családnév' },
  '水': { mn: 'Képírás: középen a sodrás, két oldalt a fröccsenő cseppek.', kun: '水 (みず) víz (hideg)', on: 'スイ: 水曜日 (すいようび) szerda; 水泳 (すいえい) úszás' },
  '土': { mn: 'Egy halom föld a talajon (alsó vonal). A 士 (harcos) felső vonala a hosszabb.', kun: '土 (つち) föld, talaj', on: 'ド: 土曜日 (どようび) szombat; ト: 土地 (とち) telek' },
  '時': { parts: 'nap (日) + templom (寺 = 土 + 寸)', mn: 'A nap (日) járását a templomban (寺) mérték: idő, óra.', kun: '時 (とき) idő, alkalom; 時計 (とけい) óra (rendhagyó)', on: 'ジ: 時間 (じかん) idő; 三時 (さんじ) három óra' },
  '火': { mn: 'Képírás: felcsapó láng, két oldalt szikrákkal.', kun: '火 (ひ) tűz', on: 'カ: 火曜日 (かようび) kedd; 火事 (かじ) tűzvész' },
  '木': { mn: 'Képírás: egy fa törzzsel, felül ágakkal, alul gyökerekkel.', kun: '木 (き) fa', on: 'モク: 木曜日 (もくようび) csütörtök; ボク: 大木 (たいぼく) nagy fa' },
  '本': { parts: 'fa (木) + alul egy rövid vonás', mn: 'A fa (木) tövénél egy vonás jelöli a gyökeret: eredet, alap; innen a könyv is.', kun: 'もと: eredet, alap (ritka)', on: 'ホン: 本 (ほん) könyv; 日本 (にほん) Japán. Számlálóként: 一本 (いっぽん), 三本 (さんぼん)' },
  '先': { parts: 'előrehajló alak + lábak (儿)', mn: 'A lábak (儿) elöl haladnak: előre, előbb, korábbi.', kun: '先 (さき) előbb, elöl; valaminek az eleje', on: 'セン: 先生 (せんせい) tanár; 先週 (せんしゅう) múlt hét' },
  '車': { mn: 'Képírás: szekér felülről nézve; középen a kocsiszekrény, a vonal a tengely.', kun: '車 (くるま) autó', on: 'シャ: 電車 (でんしゃ) vonat; 自転車 (じてんしゃ) kerékpár' },

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
  '行': { mn: 'Képírás: útkereszteződés felülről; menni, haladni.', kun: '行く (いく) megy; 行う (おこなう) végez, rendez', on: 'コウ: 旅行 (りょこう) utazás; 銀行 (ぎんこう) bank; ギョウ: 行事 (ぎょうじ) rendezvény' },
  '人': { mn: 'Képírás: két lábon lépő ember oldalról.', kun: '人 (ひと) ember; 一人 (ひとり), 二人 (ふたり) rendhagyó', on: 'ジン: 日本人 (にほんじん) japán ember; ニン: 三人 (さんにん) három ember' },
  '休': { parts: 'ember (亻) + fa (木)', mn: 'Az ember (亻) nekidől a fának (木), és pihen. A 体-ban (test) a 本 áll.', kun: '休む (やすむ) pihen, hiányzik; 休み (やすみ) szünet, szabadnap', on: 'キュウ: 休日 (きゅうじつ) szabadnap' },
  '何': { parts: 'ember (亻) + lehet (可)', mn: 'Az ember (亻) kérdez: mi lehet (可) ez?', kun: '何 (なに) mi; なん lesz で, の és számláló előtt: 何時 (なんじ) hány óra', on: 'カ: ritka, csak összetételben: 幾何 (きか) geometria' },
  '年': { parts: 'ember + gabona (禾) régi alakja', mn: 'Az ember a vállán viszi a termést: aratástól aratásig tart egy év.', kun: '年 (とし) év, életkor; 今年 (ことし) idén (rendhagyó)', on: 'ネン: 来年 (らいねん) jövőre; 三年 (さんねん) három év' },
  '半': { parts: 'két kis vonás + két vízszintes vonal + függőleges vonás', mn: 'Egy függőleges vonás kettévágja: fél.', kun: '半ば (なかば) a közepe; félig', on: 'ハン: 半分 (はんぶん) fele; 三時半 (さんじはん) fél négy' },
  '父': { mn: 'Képírás: két keresztbe tett bot a kézben: a családfő, az apa.', kun: '父 (ちち) apa (a sajátunk); お父さん (おとうさん) apa (megszólítás, rendhagyó)', on: 'フ: 父母 (ふぼ) szülők' },
  '校': { parts: 'fa (木) + keresztez, találkozik (交)', mn: 'Fából (木) épült ház, ahol az emberek összegyűlnek (交): iskola.', on: 'コウ: 学校 (がっこう) iskola; 高校 (こうこう) középiskola' },
  // ─── 6. lecke: idő, égtájak, érzékek (V13.67) ──
  '後': { parts: 'lépés (彳) + fonal (幺) + vonszolt láb (夂)', mn: 'A fonallal (幺) megkötött láb (夂) lassan lépked (彳): lemarad, hátul jön, utána.', kun: '後ろ (うしろ) mögött; 後 (あと) után, később; 後で (あとで) később', on: 'ゴ: 午後 (ごご) délután; コウ: 後半 (こうはん) második fele' },
  '食': { parts: 'fedél (𠆢) + jó (良)', mn: 'Fedél alatt egy tál jó (良) étel: eszik.', kun: '食べる (たべる) eszik', on: 'ショク: 食事 (しょくじ) étkezés; 食堂 (しょくどう) étkezde' },
  '生': { mn: 'Képírás: a földből (土) kibújó hajtás; ebből lett az élet és a születés.', kun: '生きる (いきる) él; 生まれる (うまれる) születik; 生 (なま) nyers', on: 'セイ: 学生 (がくせい) diák, 先生 (せんせい) tanár; ショウ: 一生 (いっしょう) egész élet' },
  '今': { parts: 'fedél (𠆢) + egy vonás + alatta egy horog', mn: 'A fedél alá gyűlt pillanat: most.', kun: '今 (いま) most; 今日 (きょう) ma és 今年 (ことし) idén rendhagyó', on: 'コン: 今週 (こんしゅう) ezen a héten; 今度 (こんど) legközelebb' },
  '西': { mn: 'Képírás: madárfészek; a madár akkor ül rá, amikor a nap nyugaton lemegy.', kun: '西 (にし) nyugat', on: 'セイ: 西洋 (せいよう) a Nyugat; サイ: 関西 (かんさい) Kanszai' },
  '南': { parts: 'tíz (十) + sátor (冂) + benne 干-szerű rész', mn: 'A tíz (十) alatt egy sátor, benne meleg: dél, a napos oldal.', kun: '南 (みなみ) dél', on: 'ナン: 南米 (なんべい) Dél-Amerika; 東南 (とうなん) délkelet' },
  '間': { parts: 'kapu (門) + nap (日)', mn: 'A kapu (門) résén átszűrődik a napfény (日): köz, a kettő között.', kun: '間 (あいだ) között, alatt; 間 (ま) köz, időköz', on: 'カン: 時間 (じかん) idő; ゲン: 人間 (にんげん) ember' },
  '聞': { parts: 'kapu (門) + fül (耳)', mn: 'A kapuhoz (門) tapasztott fül (耳): hall, hallgat.', kun: '聞く (きく) hall, kérdez; 聞こえる (きこえる) hallatszik', on: 'ブン: 新聞 (しんぶん) újság' },
  '円': { parts: 'keret (冂) + benne egy vonás', mn: 'Egy kerek pénzérme egyszerűsített képe: kör, jen.', kun: '円い (まるい) kerek (ritkább írás)', on: 'エン: 百円 (ひゃくえん) száz jen; 円 (えん) kör' },
  '気': { parts: 'pára (气) + benne egy kereszt (régen 米, rizs)', mn: 'A főtt rizsből felszálló pára: lélegzet, energia, hangulat.', on: 'キ: 天気 (てんき) időjárás; 元気 (げんき) jól van; ケ: 気配 (けはい) jel, sejtés' },
  '長': { mn: 'Képírás: hosszú hajú idős ember botra támaszkodva: hosszú, és a rangidős vezető.', kun: '長い (ながい) hosszú', on: 'チョウ: 社長 (しゃちょう) cégvezető; 校長 (こうちょう) igazgató' },
  '見': { parts: 'szem (目) + lábak (儿)', mn: 'Egy nagy szem (目) lábakon (儿): néz, lát.', kun: '見る (みる) néz; 見せる (みせる) megmutat', on: 'ケン: 意見 (いけん) vélemény; 見学 (けんがく) tanulmányi látogatás' },

  // ─── 7. lecke: természet, test, árucikk ────────
  '川': { mn: 'Képírás: három vonal, a víz folyása a partok között.', kun: '川 (かわ) folyó', on: 'セン: 河川 (かせん) folyók (hivatalos)' },
  '金': { mn: 'A tető alatt a földben (土) két csillogó szemcse: fém, arany, pénz.', kun: '金 (かね) pénz; お金 (おかね) pénz', on: 'キン: 金曜日 (きんようび) péntek; 料金 (りょうきん) díj. A コン ritka.' },
  '高': { mn: 'Képírás: emeletes torony tetővel és kapuval: magas.', kun: '高い (たかい) magas; drága', on: 'コウ: 高校 (こうこう) középiskola; 最高 (さいこう) a legjobb' },
  '読': { parts: 'beszéd (言) + elad (売)', mn: 'A szavakat (言) hangosan kínálja, mint az árus (売): olvas.', kun: '読む (よむ) olvas', on: 'ドク: 読書 (どくしょ) olvasás' },
  '雨': { mn: 'Képírás: az égbolt alatt a felhőből hulló esőcseppek.', kun: '雨 (あめ) eső; összetételben あま: 雨水 (あまみず) esővíz', on: 'ウ: 雨期 (うき) esős évszak' },
  '国': { parts: 'határ (囗) + drágakő (玉)', mn: 'A határok (囗) között őrzött kincs (玉): ország.', kun: '国 (くに) ország', on: 'コク: 外国 (がいこく) külföld; 中国 (ちゅうごく) Kína' },
  '山': { mn: 'Képírás: három hegycsúcs, a középső a legmagasabb.', kun: '山 (やま) hegy', on: 'サン: 富士山 (ふじさん) a Fudzsi' },
  '来': { mn: 'Képírás: kalászos gabona, ami az aratáskor megérkezik: jön.', kun: '来る (くる) jön; ragozva き / こ: 来ます (きます), 来ない (こない)', on: 'ライ: 来週 (らいしゅう) jövő hét; 来年 (らいねん) jövőre' },
  '口': { mn: 'Képírás: nyitott száj; nyílás, bejárat is.', kun: '口 (くち) száj; összetételben ぐち: 入口 (いりぐち) bejárat', on: 'コウ: 人口 (じんこう) népesség; ク: 口調 (くちょう) hangnem' },
  '目': { mn: 'Képírás: egy szem, állítva.', kun: '目 (め) szem; sorszámként -目 (め): 二番目 (にばんめ) a második', on: 'モク: 目的 (もくてき) cél; 科目 (かもく) tantárgy' },
  '明': { parts: 'nap (日) + hold (月)', mn: 'A nap (日) és a hold (月) együtt: világos, fényes.', kun: '明るい (あかるい) világos, vidám; 明日 (あした) holnap (rendhagyó)', on: 'メイ: 説明 (せつめい) magyarázat; ミョウ: 明日 (みょうにち) holnap (hivatalos)' },
  '品': { parts: 'három száj, doboz (口)', mn: 'Három egymásra rakott doboz (口): sok árucikk.', kun: '品 (しな) áru; 品物 (しなもの) árucikk', on: 'ヒン: 食品 (しょくひん) élelmiszer; 作品 (さくひん) mű' },

  // ─── 8. lecke: idő, mennyiség, hely ────────────
  '早': { parts: 'nap (日) + tíz (十)', mn: 'A nap (日) épp a fűszál (十) fölé kel: korán.', kun: '早い (はやい) korai; 早く (はやく) korán. A sebességre 速い.', on: 'ソウ: 早朝 (そうちょう) kora reggel' },
  '自': { mn: 'Képírás: az orr; Japánban magadra az orrodra mutatva utalsz: önmaga.', kun: '自ら (みずから) saját maga (írott)', on: 'ジ: 自分 (じぶん) saját maga; 自転車 (じてんしゃ) kerékpár; シ: 自然 (しぜん) természet' },
  '朝': { parts: 'tíz (十) + nap (日) + tíz (十) + hold (月)', mn: 'A fűszálak (十) között felkel a nap (日), a hold (月) még fent van: reggel.', kun: '朝 (あさ) reggel; 毎朝 (まいあさ) minden reggel', on: 'チョウ: 朝食 (ちょうしょく) reggeli (hivatalos)' },
  '元': { parts: 'két vonal (二) + lábak (儿)', mn: 'Egy ember (儿) a feje (二) felől nézve, ahol minden kezdődik: eredet, kezdet.', kun: '元 (もと) eredet, korábbi állapot', on: 'ゲン: 元気 (げんき) jól van, egészséges; ガン: 元日 (がんじつ) újév napja' },
  '的': { parts: 'fehér (白) + tálka (勺)', mn: 'A fehér (白) céltábla közepén a pont: cél; utótagként -szerű.', kun: '的 (まと) célpont', on: 'テキ: 目的 (もくてき) cél; utótagként: 日本的 (にほんてき) japános' },
  '真': { parts: 'tíz (十) + szem (目) + alul lábak', mn: 'A szem (目) egyenesen néz, alatta szilárd lábak: igaz, valódi.', kun: 'előtagként ま: 真ん中 (まんなか) a közepe; 真っ白 (まっしろ) hófehér', on: 'シン: 写真 (しゃしん) fénykép; 真実 (しんじつ) igazság' },
  '有': { parts: 'kéz (ナ) + hús (月)', mn: 'A kézben (ナ) egy darab hús (月): van, birtokol.', kun: '有る (ある) van; ritka írás, inkább kanával', on: 'ユウ: 有名 (ゆうめい) híres; 有料 (ゆうりょう) fizetős' },
  '別': { parts: 'száj (口) + becsomagol (勹) + kés (刂)', mn: 'A kés (刂) elválasztja a részeket: külön, elválik.', kun: '別れる (わかれる) elválik, búcsúzik', on: 'ベツ: 特別 (とくべつ) különleges; 別々 (べつべつ) külön-külön' },
  '町': { parts: 'rizsföld (田) + utca (丁)', mn: 'A rizsföldek (田) közti utca (丁): kisváros, negyed.', kun: '町 (まち) kisváros, negyed', on: 'チョウ: 町長 (ちょうちょう) polgármester' },
  '少': { parts: 'kicsi (小) + egy hajló vonás (丿)', mn: 'A kicsiből (小) még egy darab lepattan: kevés.', kun: '少ない (すくない) kevés; 少し (すこし) egy kicsit', on: 'ショウ: 少年 (しょうねん) fiú, kamasz' },
  '多': { parts: 'két este (夕)', mn: 'Este (夕) után újra este: sok, sokszor.', kun: '多い (おおい) sok', on: 'タ: 多分 (たぶん) talán; 多少 (たしょう) valamennyi' },
  '夕': { mn: 'Képírás: a felkelő félhold, a 月 (hold) fele: este.', kun: '夕方 (ゆうがた) késő délután; 夕べ (ゆうべ) tegnap este', on: 'セキ: 一朝一夕 (いっちょういっせき) egyik napról a másikra' },

  // ─── 9. lecke: étel, út, hét ───────────────────
  '魚': { mn: 'Képírás: hal fejjel, pikkelyes testtel (田) és farokkal (alul négy pont).', kun: '魚 (さかな) hal; うお: 魚市場 (うおいちば) halpiac', on: 'ギョ: 金魚 (きんぎょ) aranyhal' },
  '同': { parts: 'keret (冂) + egy (一) + száj (口)', mn: 'Egy fedél (冂) alatt egy szájjal (口) beszélnek: ugyanaz.', kun: '同じ (おなじ) ugyanaz', on: 'ドウ: 同時 (どうじ) egyidejű; 同僚 (どうりょう) kolléga' },
  '字': { parts: 'tető (宀) + gyerek (子)', mn: 'A ház (宀) alatt a gyerek (子) betűket tanul: írásjel.', kun: 'あざ: falurész (ritka)', on: 'ジ: 漢字 (かんじ) kandzsi; 文字 (もじ) írásjel' },
  '味': { parts: 'száj (口) + még nem (未)', mn: 'A szájban (口) még (未) érzed: íz.', kun: '味 (あじ) íz; 味わう (あじわう) ízlel', on: 'ミ: 意味 (いみ) jelentés; 趣味 (しゅみ) hobbi' },
  '牛': { mn: 'Képírás: marhafej szarvakkal; a függőleges vonás felül kilóg. A 午-ban nem lóg ki.', kun: '牛 (うし) marha', on: 'ギュウ: 牛肉 (ぎゅうにく) marhahús; 牛乳 (ぎゅうにゅう) tej' },
  '特': { parts: 'marha (牛) + templom (寺)', mn: 'A templomba (寺) vitt kiválasztott marha (牛): különleges.', on: 'トク: 特別 (とくべつ) különleges; 特に (とくに) különösen' },
  '茶': { parts: 'fű (艹) + ember (人) + fa (木)', mn: 'A fű (艹) és a fa (木) közé ülő ember (人) teát iszik.', on: 'チャ: お茶 (おちゃ) tea; サ: 喫茶店 (きっさてん) kávézó' },
  '主': { parts: 'pont (丶) + király (王)', mn: 'A király (王) fölötti láng, a lámpás őrzője: úr, gazda, fő.', kun: '主 (ぬし) gazda; 主に (おもに) főleg', on: 'シュ: 主人 (しゅじん) férj, gazda; 主婦 (しゅふ) háziasszony' },
  '道': { parts: 'út (⻌) + fej (首)', mn: 'A fej (首) előre néz, a láb az úton (⻌) halad: út.', kun: '道 (みち) út', on: 'ドウ: 道路 (どうろ) közút; 柔道 (じゅうどう) dzsúdó' },
  '運': { parts: 'út (⻌) + fedő (冖) + kocsi (車)', mn: 'A letakart kocsi (車) úton (⻌) halad: szállít, mozgat; a sors is.', kun: '運ぶ (はこぶ) szállít, visz', on: 'ウン: 運転 (うんてん) vezetés; 運動 (うんどう) mozgás, sport' },
  '京': { parts: 'fedő (亠) + száj (口) + kicsi (小)', mn: 'Magas épület oszlopokon: a főváros.', on: 'キョウ: 東京 (とうきょう) Tokió; 京都 (きょうと) Kiotó; ケイ: 京浜 (けいひん) Tokió és Jokohama' },
  '週': { parts: 'út (⻌) + körbe (周)', mn: 'Az úton (⻌) körbe (周) ér a napok sora: hét.', on: 'シュウ: 今週 (こんしゅう) ezen a héten; 週末 (しゅうまつ) hétvége' },

  // ─── 10. lecke: beszéd, mozgás, ház ────────────
  '言': { mn: 'A száj (口) fölött a kiáramló szavak vonalai: mond.', kun: '言う (いう) mond; 言葉 (ことば) szó', on: 'ゲン: 言語 (げんご) nyelv; ゴン: 伝言 (でんごん) üzenet' },
  '計': { parts: 'beszéd (言) + tíz (十)', mn: 'Szóban (言) tízig (十) számol: mér, tervez.', kun: '計る (はかる) mér (időt)', on: 'ケイ: 計画 (けいかく) terv; 時計 (とけい) óra' },
  '止': { mn: 'Képírás: egy megálló láb nyoma: megáll.', kun: '止まる (とまる) megáll; 止める (とめる) leállít', on: 'シ: 中止 (ちゅうし) elmaradás; 禁止 (きんし) tilalom' },
  '正': { parts: 'egy (一) + megáll (止)', mn: 'A vonalnál (一) megáll a láb (止): helyes, egyenes.', kun: '正しい (ただしい) helyes', on: 'セイ: 正解 (せいかい) helyes válasz; ショウ: 正月 (しょうがつ) újév' },
  '題': { parts: 'helyes (是) + fej (頁)', mn: 'Ami a fejen (頁) áll, és helyes (是): téma, cím.', on: 'ダイ: 問題 (もんだい) kérdés, probléma; 宿題 (しゅくだい) házi feladat' },
  '建': { parts: 'hosszú lépés (廴) + ecset (聿)', mn: 'Az ecsettel (聿) megrajzolt terv alapján lépésről lépésre (廴) épít.', kun: '建てる (たてる) épít; 建物 (たてもの) épület', on: 'ケン: 建築 (けんちく) építészet' },
  '転': { parts: 'kocsi (車) + forog (云)', mn: 'A kocsi (車) kereke forog (云): gurul, fordul.', kun: '転ぶ (ころぶ) elesik', on: 'テン: 運転 (うんてん) vezetés; 自転車 (じてんしゃ) kerékpár' },
  '音': { parts: 'áll (立) + nap (日)', mn: 'A felálló (立) ember szájából (日) szól: hang.', kun: '音 (おと) hang, zaj; ね: 音色 (ねいろ) hangszín', on: 'オン: 音楽 (おんがく) zene; 発音 (はつおん) kiejtés' },
  '方': { mn: 'Képírás: kétfelé ágazó eke; az irány, amerre halad, és a mód.', kun: '方 (かた) személy (udvarias); 書き方 (かきかた) írásmód', on: 'ホウ: 方法 (ほうほう) módszer; 地方 (ちほう) vidék' },
  '家': { parts: 'tető (宀) + disznó (豕)', mn: 'A tető (宀) alatt egy disznó (豕), a régi háztartás kincse: ház, család.', kun: '家 (いえ) ház; や: 大家 (おおや) háziúr', on: 'カ: 家族 (かぞく) család; ケ: 田中家 (たなかけ) a Tanaka család' },
  '場': { parts: 'föld (土) + napos (昜)', mn: 'A napsütötte (昜) földdarab (土): hely.', kun: '場 (ば) hely; 場所 (ばしょ) hely', on: 'ジョウ: 会場 (かいじょう) helyszín; 駐車場 (ちゅうしゃじょう) parkoló' },
  '曜': { parts: 'nap (日) + toll (羽) + madár (隹)', mn: 'A nap (日) fényében csillogó madártoll: a hét napjai (az égitestekről nevezték el őket).', on: 'ヨウ: 月曜日 (げつようび) hétfő; 何曜日 (なんようび) milyen nap' }
};
