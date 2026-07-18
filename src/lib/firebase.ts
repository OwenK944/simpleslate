import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

let firebaseConfig: any = {};
try {
  const configStr = import.meta.env.VITE_FIREBASE_CONFIG || '{}';
  // Try parsing as strict JSON first
  firebaseConfig = JSON.parse(configStr);
} catch (e) {
  // Fallback for relaxed JSON (e.g., if user pasted unquoted keys)
  try {
    const configStr = import.meta.env.VITE_FIREBASE_CONFIG || '{}';
    // eslint-disable-next-line no-new-func
    firebaseConfig = new Function('return {' + configStr.replace(/^[{}]/g, '') + '}')();
  } catch (e2) {
    console.error("Failed to parse Firebase config", e2);
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut };
