// V13.32: mit számol a számlálószó (a kártyán megjelenő címke)
import { describe, expect, it } from 'vitest';
import { counterNote, counterTagHtml } from '../../js/core/counters.js';

const w = (en, tags = []) => ({ en, tags });

describe('számlálószó-címke', () => {
  it('a Dekiru számlálói megmondják, mit számolnak', () => {
    expect(counterNote(w('ひとつ', ['számlálószavak']))).toBe('dolgok általában (1–10)');
    expect(counterNote(w('とお', ['számlálószavak']))).toBe('dolgok általában (1–10)');
    expect(counterNote(w('ふたり', ['számlálószavak']))).toBe('emberek');
    expect(counterNote(w('~さい', ['számlálószavak']))).toBe('életkor (évek)');
    expect(counterNote(w('~ねんせい', ['számlálószavak']))).toBe('évfolyam');
    expect(counterNote(w('～ばい', ['számlálószavak']))).toBe('többszörös (-szoros)');
    expect(counterNote(w('～だて', ['alapszavak']))).toBe('épület szintjei'); // címke nélkül is felismeri
  });
  it('kandzsinál is', () => {
    expect(counterNote(w('枚', ['számlálószavak']))).toContain('lapos tárgyak');
    expect(counterNote(w('匹', ['számlálószavak']))).toBe('kisebb állatok');
  });
  it('címkézett, de ismeretlen számlálónál csak annyi áll, hogy Számláló; a többi szónál semmi', () => {
    expect(counterNote(w('まい', ['számlálószavak']))).toBe('');
    expect(counterTagHtml(w('まい', ['számlálószavak']))).toBe('<span class="counter-tag">Számláló</span>');
    expect(counterNote(w('ほん', ['iskola', 'tárgyak']))).toBeNull();     // a "könyv" nem számláló
    expect(counterNote(w('~さん', ['udvariasság']))).toBeNull();         // toldalék, de nem számláló
    expect(counterTagHtml(w('ねこ', ['állatok']))).toBe('');
    expect(counterTagHtml(w('ひとり', ['számlálószavak']))).toBe('<span class="counter-tag">Számláló · emberek</span>');
  });
});
