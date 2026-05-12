'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QF_DEFAULT_RECITER_ID } from '@/config';

interface ReciterPreferenceContextType {
  defaultReciterId: number;
  setDefaultReciterId: (id: number) => void;
}

const ReciterPreferenceContext = createContext<ReciterPreferenceContextType | null>(null);

export function ReciterPreferenceProvider({ children }: { children: ReactNode }) {
  const [defaultReciterId, setDefaultReciterIdState] = useState<number>(QF_DEFAULT_RECITER_ID);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('default_reciter_id');
    if (saved) {
      setDefaultReciterIdState(parseInt(saved, 10));
    }
  }, []);

  const setDefaultReciterId = (id: number) => {
    setDefaultReciterIdState(id);
    localStorage.setItem('default_reciter_id', String(id));
  };

  return (
    <ReciterPreferenceContext.Provider value={{ defaultReciterId, setDefaultReciterId }}>
      {children}
    </ReciterPreferenceContext.Provider>
  );
}

export function useReciterPreference() {
  const context = useContext(ReciterPreferenceContext);
  if (!context) {
    throw new Error('useReciterPreference must be used within ReciterPreferenceProvider');
  }
  return context;
}
