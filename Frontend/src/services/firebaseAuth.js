import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const googleProvider = new GoogleAuthProvider();
// Add custom parameters to avoid COOP issues
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const formatUser = (fbUser) => ({
  uid: fbUser.uid,
  name: fbUser.displayName || fbUser.email || "User",
  email: fbUser.email,
  photoURL: fbUser.photoURL,
});

export const loginWithEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await getIdToken(credential.user);
  return { user: formatUser(credential.user), token };
};

export const registerWithEmail = async (name, email, password) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  if (name) {
    try {
      await updateProfile(credential.user, { displayName: name });
    } catch (e) {
      // non-blocking
      console.warn("Profile update failed", e?.message);
    }
  }
  const token = await getIdToken(credential.user);
  return { user: formatUser(credential.user), token };
};

export const loginWithGoogle = async () => {
  try {
    // Try popup first
    const credential = await signInWithPopup(auth, googleProvider);
    const token = await getIdToken(credential.user);
    return { user: formatUser(credential.user), token };
  } catch (error) {
    // If popup fails due to COOP policy, fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.message?.includes('Cross-Origin-Opener-Policy')) {
      // Use redirect as fallback
      await signInWithRedirect(auth, googleProvider);
      // The redirect will handle the auth, so we need to check for redirect result
      const result = await getRedirectResult(auth);
      if (result) {
        const token = await getIdToken(result.user);
        return { user: formatUser(result.user), token };
      }
      throw new Error('Google sign-in was redirected. Please complete the sign-in process.');
    }
    throw error;
  }
};

export const logoutFirebase = () => signOut(auth);

export const subscribeToAuth = (callback) =>
  onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    const token = await getIdToken(fbUser);
    callback({ user: formatUser(fbUser), token });
  });


