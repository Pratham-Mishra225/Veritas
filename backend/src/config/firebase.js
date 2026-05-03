import fs from "node:fs";
import admin from "firebase-admin";
import { logger } from "../utils/logger.js";

let initialized = false;

export function initFirebase() {
  if (initialized) return;
  if (process.env.DISABLE_AUTH === "true") {
    logger.warn({}, "Firebase Admin disabled (DISABLE_AUTH=true)");
    initialized = true;
    return;
  }
  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path && fs.existsSync(path)) {
    const json = JSON.parse(fs.readFileSync(path, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
  } else {
    logger.warn({}, "No Firebase credentials — set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS, or DISABLE_AUTH=true");
    return;
  }
  initialized = true;
}

export function getFirebaseAdmin() {
  if (!initialized || process.env.DISABLE_AUTH === "true") return null;
  return admin;
}
