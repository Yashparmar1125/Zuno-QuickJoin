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
    const error = new Error(`Missing required configuration: ${missing.join(", ")}`);
    console.error("Configuration Error:", error.message);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      console.warn("⚠️  Continuing in development mode despite missing config...");
    }
  }

  // Warn about production settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
      console.warn("⚠️  WARNING: Using default JWT_SECRET in production is insecure!");
    }
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn("⚠️  WARNING: ALLOWED_ORIGINS not set. CORS may be too permissive.");
    }
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

