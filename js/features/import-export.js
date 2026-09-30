// LexiLearn – features/import-export.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { currentMode, state } from '../core/state.js';
import { _migrateMonolithToSplit, saveWords, stableWordId } from '../core/storage.js';
import { applyFilters, renderDashboard } from '../library/list.js';
import { closeModal, showToast } from '../ui/toast.js';

/* ══════════════════════════════════════════════════════
   IMPORT / EXPORT
══════════════════════════════════════════════════════ */
async function exportData() {
  try {
    // Mind a 4 kulcs tartalmát összegyűjtjük, és egyetlen JSON-ba csomagoljuk
    const [words, stats, playlists, settings] = await Promise.all([
      localforage.getItem('lexi_words'),
      localforage.getItem('lexi_stats'),
      localforage.getItem('lexi_playlists'),
      localforage.getItem('lexi_settings')
    ]);
    if (!words && !stats) { showToast('Nincs mit menteni.'); return; }
    // Visszafelé kompatibilis export formátum (egyetlen JSON)
    const exportObj = { _format: 'lexilearn_v10_5', words, stats, playlists, settings };
    const blob = new Blob([JSON.stringify(exportObj)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiLearn_Mentes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Biztonsági mentés letöltve');
  } catch(e) {
    showToast('A mentés nem sikerült.');
    console.warn('[LexiLearn] Export hiba:', e);
  }
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed._format === 'lexilearn_v10_5') {
        // Új split-formátum: közvetlen visszaírás a 4 kulcsba
        await Promise.all([
          parsed.words     ? localforage.setItem('lexi_words',     parsed.words)     : Promise.resolve(),
          parsed.stats     ? localforage.setItem('lexi_stats',     parsed.stats)     : Promise.resolve(),
          parsed.playlists ? localforage.setItem('lexi_playlists', parsed.playlists) : Promise.resolve(),
          parsed.settings  ? localforage.setItem('lexi_settings',  parsed.settings)  : Promise.resolve()
        ]);
      } else {
        // Régi monolit formátum: migráció menet közben
        await _migrateMonolithToSplit(parsed);
      }
      showToast('Adatok betöltve, újraindítás…');
      setTimeout(() => location.reload(), 1500);
    } catch(err) {
      showToast('Ez nem érvényes mentésfájl.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function openImportModal() {
  const ta = document.getElementById('import-textarea');
  const mod = document.getElementById('import-modal');
  if(ta && mod) {
    ta.value = '';
    mod.classList.add('open');
  } else {
    showToast('Az importálás most nem érhető el.');
  }
}

function doImport() {
  const text = document.getElementById('import-textarea').value.trim();
  if (!text) return;
  let added = 0;
  text.split('\n').filter(l=>l.trim()).forEach(line=>{
    const parts = line.split(',').map(p=>p.trim().replace(/^"|"$/g,''));
    if (parts.length < 2) return;
    
    if (currentMode === 'english') {
      const [en, hu, tagsStr, diffStr] = parts;
      if (!en||!hu) return;
      const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
      if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
      state.words.push({ id: stableWordId('en_imp', en), en, hu, tags, diff: migrateDiff(diffStr || 'B2'), syn:'', sentence:'', bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
    } else {
      const [en, hu, romaji, tagsStr, diffStr] = parts;
      if (!en||!hu) return;
      const tags = tagsStr ? tagsStr.split(/[,;]/).map(t=>t.trim().toLowerCase()).filter(Boolean) : [];
      if (state.words.some(w=>w.en.toLowerCase()===en.toLowerCase())) return;
      state.words.push({ id: stableWordId('jp_imp', en), en, hu, romaji: romaji || '', tags, diff: migrateDiff(diffStr || 'N5'), sentence:'', bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
    }
    added++;
  });
  saveWords(); closeModal('import-modal'); renderDashboard(); showToast(added+' elem importálva');
}

function openAddModal() {
  const addEn = document.getElementById('add-en');
  const addHu = document.getElementById('add-hu');
  const addTags = document.getElementById('add-tags');
  const addSyn = document.getElementById('add-syn');
  const addSentence = document.getElementById('add-sentence');
  
  if(addEn) addEn.value = '';
  if(addHu) addHu.value = '';
  if(addTags) addTags.value = '';
  if(addSyn) addSyn.value = '';
  if(addSentence) addSentence.value = '';

  const lblEn = document.getElementById('lbl-add-en');
  const lblSyn = document.getElementById('lbl-add-syn');
  const diffSelect = document.getElementById('add-diff');
  const title = document.getElementById('add-modal-title');

  if (currentMode === 'english') {
    if(title) title.innerText = 'Új angol szó';
    if(lblEn) lblEn.innerText = 'Angol szó';
    if(lblSyn) lblSyn.innerText = 'Szinonima (opcionális)';
    if(diffSelect) diffSelect.innerHTML = '<option value="B1">B1</option><option value="B2" selected>B2</option><option value="C1">C1</option><option value="C2">C2</option>';
  } else if (currentMode === 'japanese') {
    if(title) title.innerText = 'Új japán szó';
    if(lblEn) lblEn.innerText = 'Kana (Japán szó)';
    if(lblSyn) lblSyn.innerText = 'Romaji (Kötelező!)';
    if(diffSelect) diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  } else if (currentMode === 'kanji') {
    if(title) title.innerText = 'Új kandzsi';
    if(lblEn) lblEn.innerText = 'Kandzsi (Jel)';
    if(lblSyn) lblSyn.innerText = 'On / Kun olvasat (vagy Romaji)';
    if(diffSelect) diffSelect.innerHTML = '<option value="N5" selected>N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>';
  }

  const modal = document.getElementById('add-modal');
  if(modal) modal.classList.add('open');
}

function doAddWord() {
  const enInput = document.getElementById('add-en');
  const huInput = document.getElementById('add-hu');
  const tagsInput = document.getElementById('add-tags');
  const diffInput = document.getElementById('add-diff');
  const synInput = document.getElementById('add-syn');
  const sentInput = document.getElementById('add-sentence');
  
  if (!enInput || !huInput) return;

  const en = enInput.value.trim();
  const hu = huInput.value.trim();
  const tagsRaw = tagsInput ? tagsInput.value.trim() : '';
  const diff = diffInput ? diffInput.value : 'N5';
  const synOrRomaji = synInput ? synInput.value.trim() : '';
  const sentence = sentInput ? sentInput.value.trim() : '';

  if (!en || !hu) { showToast('Az első két mezőt ki kell tölteni.'); return; }

  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : [];

  if (state.words.some(w => w.en.toLowerCase() === en.toLowerCase())) {
    showToast('Ez a szó már szerepel a szótáradban.'); return;
  }

  if (currentMode === 'english') {
    state.words.push({ id: stableWordId('en_man', en), en, hu, tags, diff, syn: synOrRomaji, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'japanese') {
    if (!synOrRomaji) { showToast('Japán szónál a romaji is kell.'); return; }
    state.words.push({ id: stableWordId('jp_man', en), en, hu, romaji: synOrRomaji, tags, diff, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  } else if (currentMode === 'kanji') {
    state.words.push({ id: stableWordId('kj_man', en), en, hu, romaji: synOrRomaji, onyomi: '', kunyomi: '', lesson: 'Egyéb', tags, diff, sentence, bookmarked:false, stats:{streak:0,totalCorrect:0,totalWrong:0,lastAttempt:null} });
  }

  saveWords();
  closeModal('add-modal');
  applyFilters(); 
  showToast('Sikeresen hozzáadva: ' + en);
}

/* ══════════════════════════════════════════════════════
   HIÁNYZÓ FÜGGVÉNY: migrateDiff (FIX #1)
   Hiba: doImport() meghívta, de soha nem volt definiálva → ReferenceError
══════════════════════════════════════════════════════ */
function migrateDiff(d) {
  const enValid = ['B1','B2','C1','C2'];
  const jpValid = ['N5','N4','N3','N2','N1'];
  if (currentMode === 'english') {
    return enValid.includes(d) ? d : 'B2';
  } else {
    return jpValid.includes(d) ? d : 'N5';
  }
}

export { doAddWord, doImport, exportData, importData, migrateDiff, openAddModal, openImportModal };
