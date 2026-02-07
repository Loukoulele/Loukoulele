import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth
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
  DatabaseReference,
  Database
} from 'firebase/database';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Lazy initialization - only init Firebase when in browser with valid config
let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Database | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    if (typeof window === 'undefined' || !firebaseConfig.apiKey) {
      throw new Error('Firebase cannot be initialized during SSR or without API key');
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) _auth = getAuth(getApp());
    return (_auth as any)[prop];
  }
});

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    if (!_db) _db = getDatabase(getApp());
    return (_db as any)[prop];
  }
});

// Initialize Analytics (client-side only)
let analytics: Analytics | null = null;

export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== 'undefined' && !analytics) {
    try {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(getApp());
      }
    } catch {
      // Analytics not available
    }
  }
  return analytics;
};

export const getAnalyticsInstance = () => analytics;

export { logEvent };

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
