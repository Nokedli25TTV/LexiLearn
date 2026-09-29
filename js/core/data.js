// LexiLearn – core/data.js
// A statikus szótár-adatok egyetlen forrása a modulok számára. A klasszikus data fájlok
// (data.js, dekiru.js, …) + a data-registry.js töltik fel a window.LEXI_DATA-t; itt csak
// kiolvassuk. Tesztben a window.LEXI_DATA közvetlenül is beállítható.
const raw = (typeof window !== 'undefined' && window.LEXI_DATA) || {};

const SAMPLE_WORDS = raw.sampleWords || [];
const JAPANESE_WORDS = raw.japaneseWords || [];
const KANJI_DATA = raw.kanjiData || [];
const english_sentences2 = raw.englishSentences || [];
const TRAVEL_PLAN = raw.travelPlan || null;
const TRAVEL_PLAN_KANJI = raw.travelPlanKanji || null;
const MY_CUSTOM_LISTS = raw.myCustomLists;
const DEKIRU_LESSONS = raw.dekiruLessons || [];
// A leckénkénti mondatlisták egy tömbbe fűzve (korábban: loadJapaneseSentences + eval)
const JAPANESE_SENTENCES = (raw.japaneseSentenceLessons || []).flat();

console.log(`[LexiLearn] ÖSSZES mondat betöltve: ${JAPANESE_SENTENCES.length} db`);

export {
  SAMPLE_WORDS, JAPANESE_WORDS, KANJI_DATA, english_sentences2, TRAVEL_PLAN, TRAVEL_PLAN_KANJI,
  MY_CUSTOM_LISTS, DEKIRU_LESSONS, JAPANESE_SENTENCES
};
