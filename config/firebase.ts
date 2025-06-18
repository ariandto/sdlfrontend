// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBM2VIOtB_uXnAEQDBck4mOLOoQDGIoocs",
  authDomain: "rfid-control-apps.firebaseapp.com",
  projectId: "rfid-control-apps",
  storageBucket: "rfid-control-apps.firebasestorage.app",
  messagingSenderId: "17735696624",
  appId: "1:17735696624:web:e098d6e0e82b29dec1c235",
  measurementId: "G-RE71000V72"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
