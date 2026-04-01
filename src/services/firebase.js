import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBjq4cg1reo7Adwf7TSP-ktO_g3xRNtwvU",
  authDomain: "legacy-ai-app-9a475.firebaseapp.com",
  projectId: "legacy-ai-app-9a475",
  storageBucket: "legacy-ai-app-9a475.firebasestorage.app",
  messagingSenderId: "518786367264",
  appId: "1:518786367264:web:ab43936a157400aae66145",
  measurementId: "G-K60THR16VQ"
};

const app = initializeApp(firebaseConfig);

// authentication
export const auth = getAuth(app);

// database
export const db = getFirestore(app);

// cloud functions
const functions = getFunctions(app);

// 🔌 Connect to LOCAL EMULATOR if on localhost (for development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
connectFunctionsEmulator(functions, "127.0.0.1", 5002);
  console.log('🚀 Connected to Functions Emulator (localhost:5001)');
}

export const sendNomineeVerificationEmail = httpsCallable(functions, "sendNomineeVerificationEmail");
export const verifyNomineeToken = httpsCallable(functions, "verifyNomineeToken");

