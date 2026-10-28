// Romaji → kana átírás (a Gépelős mód élő előnézete)
import { describe, expect, it } from 'vitest';
import { hasKatakana, romajiToHiragana, toKatakana } from '../../js/core/romaji.js';

describe('romaji → kana', () => {
  it('Hepburn és billentyűzetes változatok, っ, ん, kombinációk', () => {
    expect(romajiToHiragana('gakkou')).toBe('がっこう');
    expect(romajiToHiragana('toukyou')).toBe('とうきょう');
    expect(romajiToHiragana('shinbun')).toBe('しんぶん');
    expect(romajiToHiragana('konna')).toBe('こんな');         // nn + magánhangzó
    expect(romajiToHiragana('kon\'ya')).toBe('こんや');
    expect(romajiToHiragana('hon-ya', { dash: '' })).toBe('ほんや');
    expect(romajiToHiragana('matcha')).toBe('まっちゃ');
    expect(romajiToHiragana('chotto')).toBe('ちょっと');
    expect(romajiToHiragana('jisho')).toBe('じしょ');
    expect(romajiToHiragana('tsukue')).toBe('つくえ');
    expect(romajiToHiragana('situmon')).toBe('しつもん');     // si, tu
    expect(romajiToHiragana('Ryokou')).toBe('りょこう');       // kisbetűsítve
    expect(romajiToHiragana('ky')).toBe('ky');                  // félkész szótag latinul marad
  });

  it('katakana: a hosszú magánhangzó ー, a „-” is', () => {
    expect(toKatakana(romajiToHiragana('koohii'))).toBe('コーヒー');
    expect(toKatakana(romajiToHiragana('sakkaa'))).toBe('サッカー');
    expect(toKatakana(romajiToHiragana('konpyuutaa'))).toBe('コンピューター');
    expect(toKatakana(romajiToHiragana('eetiiemu'))).toBe('エーティーエム');
    expect(toKatakana(romajiToHiragana('ke-ki'))).toBe('ケーキ');
    expect(hasKatakana('カメラ')).toBe(true);
    expect(hasKatakana('がっこう')).toBe(false);
  });
});
