'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchVerseByKey } from '@/app/(app)/dashboard/quran/queries';
import { QF_DEFAULT_TRANSLATION_ID } from '@/config';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Bookmark, BookText, Compass } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface VerseItem {
  arabic: string;
  translation: string;
  ref: string;
}

interface AppStateContextType {
  features: FeatureItem[];
  verses: VerseItem[];
  currentVerseIndex: number;
  setCurrentVerseIndex: React.Dispatch<React.SetStateAction<number>>;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

const FEATURED_VERSE_KEYS = ['13:28', '94:6', '65:3', '2:286', '39:53'];

const FALLBACK_VERSES: VerseItem[] = [
  {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allah hearts find rest.',
    ref: "Ar-Ra'd 13:28"
  },
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    ref: 'Al-Inshirah 94:6'
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'Whoever relies upon Allah — He is sufficient for him.',
    ref: 'At-Talaq 65:3'
  }
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [features] = useState<FeatureItem[]>([
    {
      icon: Compass,
      title: 'Seek Guidance',
      description:
        "Share what's on your heart and receive relevant Quranic verses tailored to your situation."
    },
    {
      icon: BookText,
      title: 'Read the Quran',
      description:
        'A clean, focused Mushaf experience with translation, transliteration, and tafsir.'
    },
    {
      icon: BookOpen,
      title: 'Reflect & Journal',
      description: 'Save your reflections and track your spiritual journey over time.'
    },
    {
      icon: Bookmark,
      title: 'Collections',
      description: 'Organise saved verses into personal collections you can revisit anytime.'
    }
  ]);

  const [verses, setVerses] = useState<VerseItem[]>(FALLBACK_VERSES);

  useEffect(() => {
    const params = { translations: String(QF_DEFAULT_TRANSLATION_ID) };
    Promise.all(FEATURED_VERSE_KEYS.map((key) => fetchVerseByKey(key, params).catch(() => null)))
      .then((results) => {
        const loaded: VerseItem[] = results.filter(Boolean).map((res) => {
          const v = res!.verse;
          const translation = v.translations?.[0]?.text?.replace(/<[^>]*>/g, '') ?? '';
          const [chapter, verseNum] = v.verse_key.split(':');
          return {
            arabic: v.text_uthmani,
            translation,
            ref: `${v.verse_key} (${chapter}:${verseNum})`
          };
        });
        if (loaded.length > 0) setVerses(loaded);
      })
      .catch(() => {});
  }, []);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  return (
    <AppStateContext.Provider value={{ features, verses, currentVerseIndex, setCurrentVerseIndex }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
