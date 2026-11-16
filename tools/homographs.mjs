// LexiLearn – azonos kanájú Dekiru- és JAPANESE_WORDS / N3 szavak listája (V13.45)
//
// Az app kana alapján egyesít: ha egy Dekiru-szó kanája egy japanese_words.js / jlpt_n3_words.js
// szóéval egyezik, egy kártya lesz belőlük. Ugyanaz a szó (もくてき = 目的) így rendben van, de a
// homográf (いか: 以下 a 27. leckében, 烏賊 az N3-ban) csak akkor tartja meg a lecke jelentését, ha a
// Dekiru-rekordnak saját írásmódja (kanji) van, és az eltér a másikétól. Ez a szkript megmutatja:
//   - a már jelölt homográfokat (a kártyán mindkét jelentés, a leckéé elöl, és mindkét írásmód),
//   - a gyanús, még jelöletlen párokat: nincs közös szótő a két jelentésben, vagy a lecke egy
//     jelentésrésze hiányzik a másikból. Ezeket kézzel kell átnézni (sok csak szinonima).
//
// Futtatás (új adag után):  node tools/homographs.mjs          a jelöltek és a gyanúsak
//                           node tools/homographs.mjs --all    minden azonos kanájú pár
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['japanese_words.js', 'jlpt_n3_words.js', 'dekiru.js', 'dekiru2.js'];

function loadData(root = ROOT) {
  const ctx = { window: {}, console: { log() {} } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  FILES.forEach(f => vm.runInContext(readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
  const get = name => vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : null`, ctx);
  const dekiru = [...Array.from({ length: 30 }, (_, i) => get(`DEKIRU_L${i + 1}`)).filter(Boolean).flat(), ...(get('DEKIRU_2_WORDS') || [])];
  const others = [
    ...(get('JAPANESE_WORDS') || []).map(w => ({ ...w, file: 'japanese_words.js' })),
    ...(get('N3_WORDS') || []).map(w => ({ ...w, file: 'jlpt_n3_words.js' }))
  ];
  return { dekiru, others };
}

// Egy kanához az összes Dekiru-rekord, úgy egyesítve, ahogy az app is teszi (js/core/storage.js)
const splitParts = s => String(s || '').split(';').map(p => p.trim()).filter(Boolean);
const joinWritings = (...ws) => [...new Set(ws.flatMap(w => String(w || '').split('・')).map(s => s.trim()).filter(Boolean))].join('・');
function dekiruByKana(dekiru) {
  const map = new Map();
  dekiru.forEach(w => {
    const m = map.get(w.kana) || { kana: w.kana, hu: '', kanji: '', lessons: [] };
    m.hu = [...new Set([...splitParts(m.hu), ...splitParts(w.hu)])].join('; ');
    m.kanji = joinWritings(m.kanji, w.kanji);
    m.lessons = [...new Set([...m.lessons, ...(Array.isArray(w.lesson) ? w.lesson : [w.lesson])])].sort((a, b) => a - b);
    map.set(w.kana, m);
  });
  return map;
}

// Durva jelentés-összevetés: van-e közös szó vagy legalább 4 betűs közös szókezdet (a magyar toldalékok miatt)
const STOP = new Set(['vmi', 'vki', 'vmit', 'vkit', 'vmire', 'vmiben', 'vhol', 'vhova', 'pl', 'mint', 'egy', 'ugy', 'nagy', 'kis']);
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = s => fold(s).split(/[^a-z]+/).filter(t => t.length >= 2 && !STOP.has(t));
const sharesStem = (a, b) => {
  const tb = tokens(b);
  return tokens(a).some(x => tb.some(y => x === y || (x.length >= 4 && y.length >= 4 && x.slice(0, 4) === y.slice(0, 4))));
};

/**
 * Minden azonos kanájú Dekiru ↔ JAPANESE_WORDS / N3 pár.
 * kind: 'homograph' (a Dekiru-rekord saját, eltérő írásmóddal jelölt), 'suspect' (jelöletlen, de a
 * jelentések nem fedik egymást), 'same' (ugyanaz a szó).
 */
function findOverlaps(root = ROOT) {
  const { dekiru, others } = loadData(root);
  const byKana = dekiruByKana(dekiru);
  return others.filter(w => byKana.has(w.kana)).map(w => {
    const d = byKana.get(w.kana);
    const marked = !!d.kanji && d.kanji !== (w.kanji || '');
    const lone = splitParts(d.hu).filter(p => !sharesStem(p, w.hu));
    const suspect = !sharesStem(d.hu, w.hu) || lone.length > 0;
    return {
      kana: w.kana, lessons: d.lessons, file: w.file,
      lesson: { hu: d.hu, kanji: d.kanji }, other: { hu: w.hu, kanji: w.kanji || '' },
      kind: marked ? 'homograph' : suspect ? 'suspect' : 'same'
    };
  });
}

export { findOverlaps };

// ── parancssor ──
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const all = process.argv.includes('--all');
  const rows = findOverlaps();
  const line = r => `  ${r.kana}  (${r.lessons.join(', ')}. lecke)  ${r.lesson.kanji || '–'} ${r.lesson.hu}   ↔   ${r.other.kanji || '–'} ${r.other.hu}  [${r.file}]`;
  const group = (title, list) => { if (list.length) console.log(`\n${title} (${list.length})\n${list.map(line).join('\n')}`); };
  console.log(`Azonos kanájú Dekiru ↔ JAPANESE_WORDS / N3 pár: ${rows.length}`);
  group('Jelölt homográf: a kártyán mindkét jelentés, a leckéé elöl', rows.filter(r => r.kind === 'homograph'));
  group('Gyanús, jelöletlen (nézd át: más szó, vagy csak szinonima?)', rows.filter(r => r.kind === 'suspect'));
  if (all) group('Ugyanaz a szó', rows.filter(r => r.kind === 'same'));
  console.log('\nHa egy gyanús pár más szó, add meg a Dekiru-rekordban a lecke írásmódját: kanji: \'以下\'.');
}
