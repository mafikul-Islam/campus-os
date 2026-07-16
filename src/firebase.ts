import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import firebaseAppletConfig from '../firebase-applet-config.json';

const isCustomEnv = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: isCustomEnv ? import.meta.env.VITE_FIREBASE_API_KEY : firebaseAppletConfig.apiKey,
  authDomain: isCustomEnv ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : firebaseAppletConfig.authDomain,
  projectId: isCustomEnv ? import.meta.env.VITE_FIREBASE_PROJECT_ID : firebaseAppletConfig.projectId,
  storageBucket: isCustomEnv ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : firebaseAppletConfig.storageBucket,
  messagingSenderId: isCustomEnv ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : firebaseAppletConfig.messagingSenderId,
  appId: isCustomEnv ? import.meta.env.VITE_FIREBASE_APP_ID : firebaseAppletConfig.appId,
  firestoreDatabaseId: isCustomEnv ? import.meta.env.VITE_FIREBASE_DATABASE_ID : firebaseAppletConfig.firestoreDatabaseId || '(default)'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const logout = async () => {
  await auth.signOut();
};


