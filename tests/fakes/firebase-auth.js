// A gstatic Firebase Auth helyettesítője: a teszt a globalThis.__fakeAuth.emit(user)-rel "jelentkezik be"
const listeners = [];
globalThis.__fakeAuth = { emit: user => Promise.all(listeners.map(cb => cb(user))) };
export function getAuth() { return {}; }
export class GoogleAuthProvider {}
export async function signInWithPopup() { throw new Error('A tesztben nincs popup'); }
export async function signOut() { await globalThis.__fakeAuth.emit(null); }
export function onAuthStateChanged(_auth, cb) { listeners.push(cb); return () => {}; }
