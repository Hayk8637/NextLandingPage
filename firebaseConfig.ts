// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Optional: If you use Firestore
import { getStorage } from 'firebase/storage'; // Optional: If you use Storage

const firebaseConfig = {
  apiKey: "AIzaSyBGytCikT0mYJTxQN3CRRiWcr9LeApr3mo",
  authDomain: "menubyqr.firebaseapp.com",
  databaseURL: "https://menubyqr-default-rtdb.firebaseio.com",
  projectId: "menubyqr",
  storageBucket: "menubyqr.appspot.com",
  messagingSenderId: "120912014433",
  appId: "1:120912014433:web:555d46cf64d55e69f98e20",
  measurementId: "G-7G05KEZ74C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google Auth Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Optional: Initialize Firestore and Storage if needed
const db = getFirestore(app); // If you use Firestore
const storage = getStorage(app); // If you use Firebase Storage

export { auth, googleProvider, db, storage };
