// LexiLearn – ui/confetti.js
// (V13.3: az egykori app.js-ből bontva; a kód változatlan, csak az import/export sorok újak)
import { _prefersReducedMotion } from './swipe.js';

/* ── KONFETTI (napi cél elérése) ──────────────────────── */
function launchConfetti() {
  if (_prefersReducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['var(--cta)', 'var(--primary-light)', 'var(--yellow)', 'var(--info)', 'var(--success)'];
  for (let i = 0; i < 80; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti-bit';
    bit.style.left = (Math.random() * 100).toFixed(1) + 'vw';
    bit.style.background = colors[i % colors.length];
    bit.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
    bit.style.setProperty('--rot', (Math.random() * 900 - 450).toFixed(0) + 'deg');
    bit.style.animationDelay = (Math.random() * 0.3).toFixed(2) + 's';
    bit.style.animationDuration = (1.5 + Math.random() * 1).toFixed(2) + 's';
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3000);
}

export { launchConfetti };
