import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEEf5fYsGEpF3sSmKnKdUsyAVBmBq1CII",
  authDomain: "suivi-dettes.firebaseapp.com",
  projectId: "suivi-dettes",
  storageBucket: "suivi-dettes.firebasestorage.app",
  messagingSenderId: "688459270431",
  appId: "1:688459270431:web:a7d7a9691a49984bf9c82a",
  measurementId: "G-LCT4B4L53Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
