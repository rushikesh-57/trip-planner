import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUBTIEe37D-S7ey158VdzqVJCUfDwRjJ4",
  authDomain: "trip-expense-tracker-c187e.firebaseapp.com",
  projectId: "trip-expense-tracker-c187e",
  storageBucket: "trip-expense-tracker-c187e.firebasestorage.app",
  messagingSenderId: "425735190266",
  appId: "1:425735190266:web:009f9664503033920dfb43"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
