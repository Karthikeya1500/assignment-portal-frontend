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
          /* Verify token is still valid by making a request to backend */
          await axios.get(`${BACKEND_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({ token, role, name });
        }
      } catch (err) {
        console.error("Token verification failed:", err);
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
