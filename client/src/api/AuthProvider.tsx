import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from './api';

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: Record<string, any>) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await api.loadTokens();
        if (token) {
          const me = await api.getMe();
          if (me) { setUser(me); setLoading(false); return; }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload: Record<string, any>) => {
    const u = await api.register(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
