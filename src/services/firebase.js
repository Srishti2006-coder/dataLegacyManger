import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

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
export const sendNomineeVerificationEmail = httpsCallable(functions, "sendNomineeVerificationEmail");
export const verifyNomineeToken = httpsCallable(functions, "verifyNomineeToken");

export const analyzeVaultQuery = httpsCallable(functions, "analyzeVaultQuery");

export const updateUserPassword = httpsCallable(functions, 'updatePassword');
export const saveUserSettings = httpsCallable(functions, 'saveUserSettings');
export const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
export const updateAssetCredentials = httpsCallable(functions, 'updateAssetCredentials');
export const toggleEmergencyAccess = httpsCallable(functions, 'toggleEmergencyAccess');
export const resetLastActive = httpsCallable(functions, 'resetLastActive');
export const cancelEmergency = httpsCallable(functions, 'cancelEmergency');

