import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    return token ? { token, role, name } : null;
  });

  const [isLoading, setIsLoading] = useState(false);

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
