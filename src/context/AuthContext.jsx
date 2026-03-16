import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  /* Verify token on mount */
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const name = localStorage.getItem("name");

        if (token) {
          try {
            /* Try to verify token is still valid by making a request to backend */
            await axios.get(`${BACKEND_URL}/api/auth/verify`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000,
            });
          } catch (verifyErr) {
            /* If verification endpoint doesn't exist or backend is unavailable,
               trust the token if it exists locally (offline mode) */
            if (verifyErr.response?.status === 404 || !verifyErr.response) {
              console.warn("Backend verification unavailable, using stored token");
              setUser({ token, role, name });
              setIsLoading(false);
              return;
            }
            /* For 401/403 errors, token is invalid */
            throw verifyErr;
          }
          setUser({ token, role, name });
        }
      } catch (err) {
        console.error("Token verification failed:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        setUser(null);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [BACKEND_URL]);

  /* keep localStorage in sync whenever user state changes */
  useEffect(() => {
    if (user) {
      localStorage.setItem("token", user.token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    }
  }, [user]);

  const login = ({ token, role, name }) => setUser({ token, role, name });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
