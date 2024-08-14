// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

const firebaseApp = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
