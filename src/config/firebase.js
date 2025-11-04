// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// Note: These values are safe to be public. Security is handled by Firebase rules.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBrkhoyNyXvAAI4X3BUX_r8dDFcIQcAJWU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "jackcharlie-6d30b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "jackcharlie-6d30b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "jackcharlie-6d30b.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "273479044185",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:273479044185:web:d101d6af66316562f3b548",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LZG8DBBLPB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { app, analytics, auth, db, storage, database };
