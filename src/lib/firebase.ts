import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAMbd588lQIghHs8WjtpyxI3zZK780Ms7I",
  authDomain: "ubatechcamp-8db02.firebaseapp.com",
  projectId: "ubatechcamp-8db02",
  storageBucket: "ubatechcamp-8db02.firebasestorage.app",
  messagingSenderId: "326420569438",
  appId: "1:326420569438:web:bb07c65941daf699fe43cf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
