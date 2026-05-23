import React, { createContext, useContext, useState, useEffect } from "react";
import { base44, isApiKeyMode, isLocalOnlyMode, localApiUser } from "@/api/base44Client";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = isApiKeyMode && !isLocalOnlyMode ? localApiUser : await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error("Erro ao carregar usuário:", err);
          setUser(null);
          setError(err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = isApiKeyMode && !isLocalOnlyMode ? localApiUser : await base44.auth.me();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}