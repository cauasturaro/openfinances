import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isLogged = localStorage.getItem("isLogged") === "true";
    setIsAuthenticated(isLogged);
    setIsLoading(false);
  };

  const login = () => {
    localStorage.setItem("isLogged", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("isLogged");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);