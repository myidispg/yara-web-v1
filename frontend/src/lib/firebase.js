import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ⚠️ REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC6_FF2CHyFyfK1AFQ_Mn66I5OamR3hkC0",
  authDomain: "yara-jewels-auth.firebaseapp.com",
  projectId: "yara-jewels-auth",
  storageBucket: "yara-jewels-auth.firebasestorage.app",
  messagingSenderId: "681129240387",
  appId: "1:681129240387:web:9ab483f1cfb69333abf1f6",
  measurementId: "G-0Y8F99VV10"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);