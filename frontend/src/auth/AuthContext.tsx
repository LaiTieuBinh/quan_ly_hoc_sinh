import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { AuthUser, LoginCredentials } from '../types';

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (revokeAllSessions?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    authService.me().then((profile) => { if (active) setUser(profile); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setInitializing(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, initializing,
    login: async (credentials) => setUser(await authService.login(credentials)),
    logout: async (revokeAllSessions = false) => {
      try { await authService.logout(revokeAllSessions); }
      finally { setUser(null); }
    },
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return context;
}
