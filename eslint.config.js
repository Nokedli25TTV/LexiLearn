// ESLint: a modulokra bontás biztonsági hálója.
// A no-undef jelzi, ha egy modul használ egy függvényt, amit nem importált (a leggyakoribb
// hiba szétbontás után); a no-unused-vars pedig az elárvult kódot.
import globals from 'globals';

export default [
  {
    files: ['js/**/*.js', 'firebase-sync.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        localforage: 'readonly' // CDN-ről töltött könyvtár (index.html)
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error'
    }
  },
  {
    files: ['tests/**/*.js', 'tools/**/*.mjs', 'eslint.config.js', 'vitest.config.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node, ...globals.browser } }
  }
];
