// V13.31: hibatűrő válaszellenőrzés – ne egy ékezet, szóköz vagy elütés döntsön arról, hogy tudtad-e
import { describe, expect, it } from 'vitest';
import { checkJapanese, checkMeaning, editDistance, foldKana, variantsOf } from '../../js/core/answer.js';

const ok = (input, meaning, lang) => checkMeaning(input, meaning, lang).ok;

describe('magyar jelentés', () => {
  it('kis- és nagybetű, ékezet, írásjel, szóköz, névelő nem számít', () => {
    expect(ok('Kedd', 'kedd')).toBe(true);
    expect(ok('utazas', 'utazás (hajóval)')).toBe(true);
    expect(ok('  jo reggelt!  ', 'jó reggelt (formális)')).toBe(true);
    expect(ok('a ház', 'ház')).toBe(true);
    expect(ok('elektronikusszótár', 'elektronikus szótár')).toBe(true);
    expect(checkMeaning('kedd', 'kedd').exact).toBe(true);
  });
  it('több jelentésből egy is elég, a zárójeles rész elhagyható', () => {
    expect(ok('mocsok', 'mocsok / szenny')).toBe(true);
    expect(ok('szenny', 'mocsok / szenny')).toBe(true);
    expect(ok('elragadott', 'elégedett, elragadott')).toBe(true);
    expect(ok('eszébe jut', 'lebeg, úszik (a felszínen); eszébe jut')).toBe(true);
    expect(ok('úszik', 'lebeg, úszik (a felszínen); eszébe jut')).toBe(true);
    expect(ok('kíván', 'imádkozik; kíván (valakinek, valamit)')).toBe(true);
    expect(ok('valamit', 'imádkozik; kíván (valakinek, valamit)')).toBe(false); // a zárójel belseje nem jelentés
    expect(ok('lemegy', 'elsüllyed; (a nap) lemegy')).toBe(true);
    expect(ok('szenny, mocsok', 'mocsok / szenny')).toBe(true); // ha többet írsz, az is jó
  });
  it('elírás a hosszhoz mérten fér bele', () => {
    expect(ok('utazsá', 'utazás')).toBe(true);           // két betű felcserélve
    expect(ok('kedd', 'ked')).toBe(false);              // 3 betűnél nincs tűrés
    expect(ok('hal', 'hat')).toBe(false);
    expect(ok('elektronikus szotar', 'elektronikus szótár')).toBe(true);
    expect(ok('elektronkus sztár', 'elektronikus szótár')).toBe(true); // 2 hiba egy hosszú kifejezésben
    expect(ok('pénztár', 'szótár')).toBe(false);
    expect(checkMeaning('utazsá', 'utazás').exact).toBe(false);
  });
  it('üres vagy teljesen más válasz nem jó', () => {
    expect(ok('', 'kedd')).toBe(false);
    expect(ok('   ', 'kedd')).toBe(false);
    expect(ok('szerda', 'kedd')).toBe(false);
  });
  it('angol névelők és a to elhagyhatók', () => {
    expect(ok('house', 'the house', 'en')).toBe(true);
    expect(ok('eat', 'to eat', 'en')).toBe(true);
    expect(ok('recieve', 'receive', 'en')).toBe(true);
  });
  it('változatok és távolság', () => {
    expect(variantsOf('bájitalok / főzetek')).toEqual(['bajitalok', 'fozetek', 'bajitalok fozetek']);
    expect(editDistance('abcd', 'abdc')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('aaaaaaa', 'b', 2)).toBe(3); // korai kilépés
  });
});

describe('japán válasz', () => {
  const eki = { kana: 'えき', writing: '駅', romaji: 'eki' };
  it('romaji, kana és kandzsi is jó', () => {
    expect(checkJapanese('eki', eki).ok).toBe(true);
    expect(checkJapanese('EKI ', eki).ok).toBe(true);
    expect(checkJapanese('えき', eki).ok).toBe(true);
    expect(checkJapanese('エキ', eki).ok).toBe(true);
    expect(checkJapanese('駅', eki).ok).toBe(true);
    expect(checkJapanese('eke', eki).ok).toBe(false);
  });
  it('több írásmódból (以下・烏賊) egy is elég', () => {
    const ika = { kana: 'いか', writing: '以下・烏賊', romaji: 'ika' };
    expect(checkJapanese('以下', ika).ok).toBe(true);
    expect(checkJapanese('烏賊', ika).ok).toBe(true);
    expect(checkJapanese('以下・烏賊', ika).ok).toBe(true);
    expect(checkJapanese('以上', ika).ok).toBe(false);
  });
  it('a hosszú magánhangzó és a kettőzött mássalhangzó írásmódja mindegy', () => {
    const tokyo = { kana: 'とうきょう', romaji: 'toukyou' };
    expect(checkJapanese('tokyo', tokyo).ok).toBe(true);
    expect(checkJapanese('tōkyō', tokyo).ok).toBe(true);
    expect(checkJapanese('tookyoo', tokyo).ok).toBe(true);
    const coffee = { kana: 'コーヒー', romaji: 'koohii' };
    expect(checkJapanese('kohi', coffee).ok).toBe(true);
    expect(checkJapanese('こうひい', coffee).ok).toBe(true);
    expect(checkJapanese('コーヒー', coffee).ok).toBe(true);
  });
  it('romaji mező nélkül a kanára írja át', () => {
    expect(checkJapanese('kayoubi', { kana: 'かようび' }).ok).toBe(true);
    expect(checkJapanese('kyou', { kana: 'きょう' }).ok).toBe(true);
    expect(checkJapanese('kyo', { kana: 'きょう' }).ok).toBe(false);
  });
  it('a díszítők (〜, szóköz, pont) nem számítanak', () => {
    expect(foldKana('〜いき')).toBe('いき');
    expect(checkJapanese('いき', { kana: '〜いき' }).ok).toBe(true);
    expect(checkJapanese('', eki).ok).toBe(false);
  });
});
