'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { buildAuthorizeUrl } from '@/app/apiService/quranFoundationService/oauth';
import { clearToken, clearUserTokens } from '@/app/apiService/quranFoundationService';
import { fetchReflectProfile } from '@/app/profile/queries';
import type { ReflectProfile } from '@/app/profile/types';

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
  reflectProfile: ReflectProfile | null;
  reflectProfileLoading: boolean;
  reloadReflectProfile: () => Promise<void>;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  logout: () => void;
  setUserFromToken: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflectProfile, setReflectProfile] = useState<ReflectProfile | null>(null);
  const [reflectProfileLoading, setReflectProfileLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  // Fetch reflect profile once when user is known
  const loadReflectProfile = useCallback(async () => {
    setReflectProfileLoading(true);
    try {
      const p = await fetchReflectProfile();
      setReflectProfile(p ?? null);
    } catch {
      setReflectProfile(null);
    } finally {
      setReflectProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadReflectProfile();
  }, [user, loadReflectProfile]);

  const redirectToOAuth = async () => {
    const url = await buildAuthorizeUrl(REDIRECT_URI);
    window.location.href = url;
  };

  const login = async () => redirectToOAuth();
  const signup = async () => redirectToOAuth();

  const setUserFromToken = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setReflectProfile(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    clearToken();
    clearUserTokens();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        reflectProfile,
        reflectProfileLoading,
        reloadReflectProfile: loadReflectProfile,
        login,
        signup,
        logout,
        setUserFromToken,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
