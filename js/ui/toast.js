// LexiLearn – ui/toast.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)

function closeModal(id) { 
  const el = document.getElementById(id);
  if(el) el.classList.remove('open'); 
}

/* --- Eszközök --- */
let toastTimer;
function showToast(msg) { 
  const t = document.getElementById('toast'); 
  if(!t) return;
  t.textContent=msg; t.classList.add('show'); 
  clearTimeout(toastTimer); 
  toastTimer=setTimeout(()=>t.classList.remove('show'),3000); 
}

export { closeModal, showToast, toastTimer };
