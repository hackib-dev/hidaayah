'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buildAuthorizeUrl } from '@/app/apiService/quranFoundationService/oauth';
import { clearToken } from '@/app/apiService/quranFoundationService';

const REDIRECT_URI =
  process.env.NEXT_PUBLIC_QF_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';
const USER_STORAGE_KEY = 'hidaayah_user';

interface User {
  name: string;
  email: string;
  sub?: string;
}

interface AuthContextType {
  user: User | null;
  /** Redirects the browser to the QF OAuth authorize endpoint (PKCE). */
  login: () => Promise<void>;
  /** Also redirects to QF OAuth — registration happens on the QF side. */
  signup: () => Promise<void>;
  logout: () => void;
  /** Called by /callback page once token exchange is complete. */
  setUserFromToken: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const redirectToOAuth = () => {
    window.location.href = buildAuthorizeUrl(REDIRECT_URI);
  };

  const login = async () => redirectToOAuth();
  const signup = async () => redirectToOAuth();

  const setUserFromToken = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, setUserFromToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
