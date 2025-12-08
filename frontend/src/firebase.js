// Firebase initialization for Thrive360 web push notifications
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// NOTE: apiKey is not a secret, but do NOT commit any private keys/service account JSON.
// These values come from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCxru7G1A7Sbq0xTVWeZNjypbzRYYIBtFk",
  authDomain: "thrive360-594f3.firebaseapp.com",
  projectId: "thrive360-594f3",
  storageBucket: "thrive360-594f3.firebasestorage.app",
  messagingSenderId: "500722327592",
  appId: "1:500722327592:web:28c8f44b21d1e8a8e7951d",
  measurementId: "G-S5X2WZ6VMD",
};

const app = initializeApp(firebaseConfig);

// Export a messaging instance to be used throughout the app
const messaging = getMessaging(app);

export { messaging };



