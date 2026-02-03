import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  update,
  runTransaction,
  DatabaseReference
} from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getDatabase(app);

// Discord login via OIDC provider
export async function loginWithDiscord() {
  const provider = new OAuthProvider('oidc.discord');
  return signInWithPopup(auth, provider);
}

export async function logout() {
  return signOut(auth);
}

export {
  onAuthStateChanged,
  ref,
  set,
  get,
  onValue,
  off,
  update,
  runTransaction
};

export type { User, DatabaseReference };
