
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB5Cu6Nx2KaSO_Ulm2V06lB-7-7t4iEzqw",
  authDomain: "hbb-edumate-ai.firebaseapp.com",
  projectId: "hbb-edumate-ai",
  storageBucket: "hbb-edumate-ai.firebasestorage.app",
  messagingSenderId: "550461021814",
  appId: "1:550461021814:web:76bd0cd9d1d1faf8530957"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
