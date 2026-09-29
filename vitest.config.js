import { defineConfig } from 'vitest/config';

export default defineConfig({
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
