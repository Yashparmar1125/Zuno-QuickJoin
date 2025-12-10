import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) return admin;

  const serviceAccountPath = config.firebase.serviceAccountPath;

  let credentials = null;
  if (config.firebase.hasServiceAccountFile && fs.existsSync(serviceAccountPath)) {
    try {
      credentials = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    } catch (e) {
      console.warn("Failed to read Firebase service account file:", e.message);
    }
  }

  // Fallback to env key pieces
  if (!credentials) {
    const projectId = config.firebase.projectId;
    const clientEmail = config.firebase.clientEmail;
    const privateKey = config.firebase.privateKey
      ? config.firebase.privateKey.replace(/\\n/g, "\n")
      : undefined;

    if (projectId && clientEmail && privateKey) {
      credentials = { projectId, clientEmail, privateKey };
    }
  }

  if (!credentials) {
    console.warn(
      "Firebase Admin not initialized: missing service account file or env credentials"
    );
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
  initialized = true;
  return admin;
};

export default initFirebaseAdmin;

