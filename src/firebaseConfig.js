// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCX8Vp7C-e_qrzUdcAIH1jRqDOIfjWApWk",
  authDomain: "e-commerce-26716.firebaseapp.com",
  projectId: "e-commerce-26716",
  storageBucket: "e-commerce-26716.firebasestorage.app",
  messagingSenderId: "1075821116020",
  appId: "1:1075821116020:web:0ba223123dbed005f6ef21",
  measurementId: "G-6RQZCXNP21",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // <-- Agrega esto

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
