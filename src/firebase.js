// src/firebase.js

// ✅ Import Firebase core
import { initializeApp } from "firebase/app";

// ✅ Import Firestore
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQjsOkO9dTW859ySJbjoKSL9L1jezTMS8",
  authDomain: "ekathra-697cf.firebaseapp.com",
  projectId: "ekathra-697cf",
  storageBucket: "ekathra-697cf.firebasestorage.app",
  messagingSenderId: "284499619611",
  appId: "1:284499619611:web:020f79edcc90e2b9096dbe",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Export Firestore instance
export { db };
