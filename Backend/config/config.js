import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultServiceAccountPath = path.join(__dirname, "..", "Secrets", "ServiceAccount.json");

const resolveServiceAccountPath = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  return defaultServiceAccountPath;
};

const serviceAccountPath = resolveServiceAccountPath();
const hasServiceAccountFile = fs.existsSync(serviceAccountPath);

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];

const firebaseEnvVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];

const validateConfig = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  const hasFirebaseEnv =
    firebaseEnvVars.every((key) => !!process.env[key]) ||
    (!!process.env.GOOGLE_APPLICATION_CREDENTIALS && hasServiceAccountFile) ||
    hasServiceAccountFile;

  if (!hasFirebaseEnv) {
    missing.push("Firebase credentials (service account file or FIREBASE_* envs)");
  }

  if (missing.length) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }
};

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  firebase: {
    serviceAccountPath,
    hasServiceAccountFile,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
  validateConfig,
};

export default config;

