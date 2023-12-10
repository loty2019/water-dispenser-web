// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB8FGDdD3JYwQEov9k5LNrIjnR8jnTFa2s",
  authDomain: "waterdispenserarduino.firebaseapp.com",
  databaseURL: "https://waterdispenserarduino-default-rtdb.firebaseio.com",
  projectId: "waterdispenserarduino",
  storageBucket: "waterdispenserarduino.appspot.com",
  messagingSenderId: "306301379507",
  appId: "1:306301379507:web:236993e8aaa765f558e1c6",
  measurementId: "G-DGRPML8Y77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }