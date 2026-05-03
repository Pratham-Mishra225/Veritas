import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name}. Set it in your Vite .env file.`);
  }
  return value;
}

function getFirebaseConfig() {
  return {
    apiKey: requireEnv("VITE_FIREBASE_API_KEY", env.VITE_FIREBASE_API_KEY),
    authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN", env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: requireEnv("VITE_FIREBASE_PROJECT_ID", env.VITE_FIREBASE_PROJECT_ID),
    appId: requireEnv("VITE_FIREBASE_APP_ID", env.VITE_FIREBASE_APP_ID),
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
}

export function getFirebaseAuth() {
  const app = getApps()[0] ?? initializeApp(getFirebaseConfig());
  return getAuth(app);
}
