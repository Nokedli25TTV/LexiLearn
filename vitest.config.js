import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// A firebase-sync.js a Firebase SDK-t CDN URL-ről importálja; a tesztekben memóriabeli utánzatok jönnek helyette
const SDK = 'https://www.gstatic.com/firebasejs/10.13.2/';
const fake = name => fileURLToPath(new URL(`./tests/fakes/${name}.js`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: ['firebase-app', 'firebase-auth', 'firebase-firestore'].map(name => ({ find: SDK + name + '.js', replacement: fake(name) }))
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:5599/', pretendToBeVisual: true } },
    include: ['tests/**/*.test.js'],
    testTimeout: 30000,
    // Minden tesztfájl saját, tiszta környezetet kap (a modulok állapota nem szivárog át)
    isolate: true,
    pool: 'forks'
  }
});
