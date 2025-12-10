import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { getMe } from "../services/auth";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutFirebase,
  subscribeToAuth,
} from "../services/firebaseAuth";
import { auth } from "../lib/firebase";
import { getRedirectResult, getIdToken } from "firebase/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase auth state and hydrate user/token from backend
  useEffect(() => {
    // Check for redirect result on mount (for Google sign-in redirect fallback)
    getRedirectResult(auth).then((result) => {
      if (result) {
        // User completed redirect sign-in
        getIdToken(result.user).then(async (token) => {
          setToken(token);
          localStorage.setItem(TOKEN_KEY, token);
          try {
            const me = await getMe(token);
            setUser(me.user);
            localStorage.setItem(USER_KEY, JSON.stringify(me.user));
          } catch {
            const fbUser = {
              uid: result.user.uid,
              name: result.user.displayName || result.user.email || "User",
              email: result.user.email,
              photoURL: result.user.photoURL,
            };
            setUser(fbUser);
            localStorage.setItem(USER_KEY, JSON.stringify(fbUser));
          }
        });
      }
    }).catch(() => {
      // Ignore redirect errors
    });

    const unsubscribe = subscribeToAuth(async (session) => {
      if (!session) {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
        return;
      }

      const { user: fbUser, token: idToken } = session;
      setToken(idToken);
      localStorage.setItem(TOKEN_KEY, idToken);

      try {
        // Fetch / ensure backend user; middleware will map firebaseUid if missing
        const me = await getMe(idToken);
        setUser(me.user);
        localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      } catch {
        setUser(fbUser);
        localStorage.setItem(USER_KEY, JSON.stringify(fbUser));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe?.();
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token: t } = await loginWithEmail(email, password);
    setToken(t);
    localStorage.setItem(TOKEN_KEY, t);
    try {
      const me = await getMe(t);
      setUser(me.user);
      localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      return me.user;
    } catch {
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user: u, token: t } = await registerWithEmail(name, email, password);
    setToken(t);
    localStorage.setItem(TOKEN_KEY, t);
    try {
      const me = await getMe(t);
      setUser(me.user);
      localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      return me.user;
    } catch {
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    }
  }, []);

  const loginGoogle = useCallback(async () => {
    const { user: u, token: t } = await loginWithGoogle();
    setToken(t);
    localStorage.setItem(TOKEN_KEY, t);
    try {
      const me = await getMe(t);
      setUser(me.user);
      localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      return me.user;
    } catch {
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutFirebase();
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, loginGoogle, logout }),
    [user, token, loading, login, register, loginGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


