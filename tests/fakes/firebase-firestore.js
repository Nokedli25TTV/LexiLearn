// A gstatic Firestore helyettesítője: a teszt által globalThis.__fakeFirestore-ba tett memóriabeli példányt használja
import { createFakeFirestore } from './firestore.js';
const f = () => (globalThis.__fakeFirestore ||= createFakeFirestore());
export const getFirestore = () => f().db;
export const doc = (...a) => f().fs.doc(...a);
export const getDoc = (...a) => f().fs.getDoc(...a);
export const writeBatch = (...a) => f().fs.writeBatch(...a);
export const onSnapshot = (...a) => f().fs.onSnapshot(...a);
export const serverTimestamp = () => f().fs.serverTimestamp();
