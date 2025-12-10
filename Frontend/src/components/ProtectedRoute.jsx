/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
    }
  }, [loading, user]);

  if (loading) return null;
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}


