'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchVerseByKey } from '@/app/quran/queries';
import { QF_DEFAULT_TRANSLATION_ID } from '@/config';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Bookmark,
  BookText,
  Compass,
  Eye,
  Heart,
  Leaf,
  Moon,
  Scale,
  Shield,
  Sparkles,
  Star,
  Sun,
  Users,
  Zap
} from 'lucide-react';

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

export interface CollectionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  description: string;
  bg: string;
  iconColor: string;
  border: string;
  featured?: boolean;
}

export interface ThemeCard {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  bg: string;
  iconColor: string;
  border: string;
}

export interface ThemeDetail {
  title: string;
  description: string;
  gradient: string;
  border: string;
  verses: Array<{ id: string; surah: string; ayah: number; arabic: string; translation: string }>;
}

interface AppStateContextType {
  features: FeatureItem[];
  verses: VerseItem[];
  currentVerseIndex: number;
  setCurrentVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  collections: CollectionItem[];
  themes: ThemeCard[];
  themeData: Record<string, ThemeDetail>;
  defaultTheme: ThemeDetail;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

const FEATURED_VERSE_KEYS = ['13:28', '94:6', '65:3', '2:286', '39:53'];

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
      title: 'Theme Collections',
      description:
        'Explore curated verse collections on patience, gratitude, trust, hope, and more.'
    }
  ]);

  // Fallback verses shown while API loads or if it fails
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
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const [collections] = useState<CollectionItem[]>([
    {
      id: 'patience',
      label: 'Patience & Perseverance',
      icon: Shield,
      count: 42,
      description: 'Verses to strengthen your resolve',
      bg: 'bg-teal-muted',
      iconColor: 'text-teal',
      border: 'border-teal/20',
      featured: true
    },
    {
      id: 'gratitude',
      label: 'Gratitude & Thankfulness',
      icon: Sun,
      count: 38,
      description: "Reminders of Allah's blessings",
      bg: 'bg-gold-muted',
      iconColor: 'text-accent',
      border: 'border-accent/20',
      featured: true
    },
    {
      id: 'trust',
      label: 'Trust in Allah',
      icon: Heart,
      count: 56,
      description: 'Surrendering to divine wisdom',
      bg: 'bg-rose-muted',
      iconColor: 'text-rose',
      border: 'border-rose/20',
      featured: true
    },
    {
      id: 'guidance',
      label: 'Divine Guidance',
      icon: Compass,
      count: 64,
      description: 'Finding your path',
      bg: 'bg-violet-muted',
      iconColor: 'text-violet',
      border: 'border-violet/20',
      featured: false
    },
    {
      id: 'peace',
      label: 'Inner Peace',
      icon: Moon,
      count: 31,
      description: 'Achieving serenity',
      bg: 'bg-teal-muted',
      iconColor: 'text-teal',
      border: 'border-teal/20',
      featured: false
    },
    {
      id: 'justice',
      label: 'Justice & Fairness',
      icon: Scale,
      count: 28,
      description: 'Standing for truth',
      bg: 'bg-gold-muted',
      iconColor: 'text-accent',
      border: 'border-accent/20',
      featured: false
    },
    {
      id: 'hope',
      label: 'Hope & Optimism',
      icon: Star,
      count: 45,
      description: 'Never despair of mercy',
      bg: 'bg-rose-muted',
      iconColor: 'text-rose',
      border: 'border-rose/20',
      featured: false
    },
    {
      id: 'strength',
      label: 'Strength & Courage',
      icon: Zap,
      count: 33,
      description: 'Power through faith',
      bg: 'bg-violet-muted',
      iconColor: 'text-violet',
      border: 'border-violet/20',
      featured: false
    },
    {
      id: 'nature',
      label: 'Signs in Nature',
      icon: Leaf,
      count: 52,
      description: 'Reflecting on creation',
      bg: 'bg-teal-muted',
      iconColor: 'text-teal',
      border: 'border-teal/20',
      featured: false
    },
    {
      id: 'mindfulness',
      label: 'Reflection',
      icon: Eye,
      count: 29,
      description: 'Contemplating deeper meanings',
      bg: 'bg-gold-muted',
      iconColor: 'text-accent',
      border: 'border-accent/20',
      featured: false
    },
    {
      id: 'relationships',
      label: 'Family & Bonds',
      icon: Users,
      count: 41,
      description: 'Guidance for relationships',
      bg: 'bg-rose-muted',
      iconColor: 'text-rose',
      border: 'border-rose/20',
      featured: false
    },
    {
      id: 'mercy',
      label: 'Mercy & Forgiveness',
      icon: Sparkles,
      count: 47,
      description: 'The boundless rahma',
      bg: 'bg-violet-muted',
      iconColor: 'text-violet',
      border: 'border-violet/20',
      featured: false
    }
  ]);

  const [themes] = useState<ThemeCard[]>([
    {
      id: 'patience',
      label: 'Patience',
      icon: Shield,
      count: 42,
      bg: 'bg-teal-muted',
      iconColor: 'text-teal',
      border: 'border-teal/20'
    },
    {
      id: 'gratitude',
      label: 'Gratitude',
      icon: Sun,
      count: 38,
      bg: 'bg-gold-muted',
      iconColor: 'text-accent',
      border: 'border-accent/20'
    },
    {
      id: 'trust',
      label: 'Trust',
      icon: Heart,
      count: 56,
      bg: 'bg-rose-muted',
      iconColor: 'text-rose',
      border: 'border-rose/20'
    },
    {
      id: 'guidance',
      label: 'Guidance',
      icon: Compass,
      count: 64,
      bg: 'bg-violet-muted',
      iconColor: 'text-violet',
      border: 'border-violet/20'
    },
    {
      id: 'peace',
      label: 'Peace',
      icon: Moon,
      count: 31,
      bg: 'bg-teal-muted',
      iconColor: 'text-teal',
      border: 'border-teal/20'
    },
    {
      id: 'justice',
      label: 'Justice',
      icon: Scale,
      count: 28,
      bg: 'bg-gold-muted',
      iconColor: 'text-accent',
      border: 'border-accent/20'
    }
  ]);

  const [themeData] = useState<Record<string, ThemeDetail>>({
    patience: {
      title: 'Patience & Perseverance',
      description:
        "In times of trial, these verses remind us that patience (sabr) is not passive waiting, but active trust in Allah's plan. Each challenge is an opportunity for growth.",
      gradient: 'from-teal-muted via-card to-violet-muted',
      border: 'border-teal/20',
      verses: [
        {
          id: '1',
          surah: 'Al-Baqarah',
          ayah: 153,
          arabic:
            'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
          translation:
            'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.'
        },
        {
          id: '2',
          surah: 'Al-Baqarah',
          ayah: 286,
          arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
          translation: 'Allah does not burden a soul beyond that it can bear.'
        },
        {
          id: '3',
          surah: 'Al-Inshirah',
          ayah: 6,
          arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
          translation: 'Indeed, with hardship comes ease.'
        },
        {
          id: '4',
          surah: 'Ali Imran',
          ayah: 200,
          arabic:
            'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
          translation:
            'O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful.'
        }
      ]
    },
    gratitude: {
      title: 'Gratitude & Thankfulness',
      description:
        "Gratitude transforms what we have into enough. These verses remind us that acknowledging Allah's blessings opens the door to more abundance.",
      gradient: 'from-gold-muted via-card to-rose-muted',
      border: 'border-accent/20',
      verses: [
        {
          id: '1',
          surah: 'Ibrahim',
          ayah: 7,
          arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
          translation: 'If you are grateful, I will surely increase you [in favor].'
        },
        {
          id: '2',
          surah: 'An-Naml',
          ayah: 40,
          arabic: 'وَمَن شَكَرَ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ',
          translation: 'And whoever is grateful is grateful for [the benefit of] himself.'
        },
        {
          id: '3',
          surah: 'Ar-Rahman',
          ayah: 13,
          arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
          translation: 'So which of the favors of your Lord would you deny?'
        }
      ]
    },
    trust: {
      title: 'Trust in Allah',
      description:
        'Tawakkul is the essence of faith - complete reliance on Allah while taking appropriate action. These verses strengthen our trust in divine wisdom.',
      gradient: 'from-rose-muted via-card to-gold-muted',
      border: 'border-rose/20',
      verses: [
        {
          id: '1',
          surah: 'At-Talaq',
          ayah: 3,
          arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
          translation: 'And whoever relies upon Allah - then He is sufficient for him.'
        },
        {
          id: '2',
          surah: 'Ali Imran',
          ayah: 159,
          arabic:
            'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
          translation:
            'And when you have decided, then rely upon Allah. Indeed, Allah loves those who rely [upon Him].'
        },
        {
          id: '3',
          surah: 'At-Tawbah',
          ayah: 51,
          arabic: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا',
          translation:
            "Say, 'Never will we be struck except by what Allah has decreed for us; He is our protector.'"
        }
      ]
    },
    guidance: {
      title: 'Divine Guidance',
      description:
        "In moments of uncertainty, Allah's guidance illuminates our path. These verses remind us that seeking and following divine direction leads to success.",
      gradient: 'from-violet-muted via-card to-teal-muted',
      border: 'border-violet/20',
      verses: [
        {
          id: '1',
          surah: 'Al-Fatiha',
          ayah: 6,
          arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
          translation: 'Guide us to the straight path.'
        },
        {
          id: '2',
          surah: 'Ad-Duha',
          ayah: 7,
          arabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
          translation: 'And He found you lost and guided [you].'
        },
        {
          id: '3',
          surah: 'Al-Baqarah',
          ayah: 2,
          arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
          translation:
            'This is the Book about which there is no doubt, a guidance for those conscious of Allah.'
        }
      ]
    },
    peace: {
      title: 'Inner Peace & Tranquility',
      description:
        'True peace comes from connection with the Divine. These verses guide us toward the serenity that comes from remembrance of Allah.',
      gradient: 'from-teal-muted via-card to-gold-muted',
      border: 'border-teal/20',
      verses: [
        {
          id: '1',
          surah: "Ar-Ra'd",
          ayah: 28,
          arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
          translation: 'Unquestionably, by the remembrance of Allah hearts find rest.'
        },
        {
          id: '2',
          surah: 'Al-Fajr',
          ayah: 27,
          arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ',
          translation: 'O reassured soul.'
        }
      ]
    },
    hope: {
      title: 'Hope & Optimism',
      description:
        "No matter how dark the night, dawn always comes. These verses remind us to never lose hope in Allah's mercy and the promise of better days.",
      gradient: 'from-gold-muted via-card to-violet-muted',
      border: 'border-accent/20',
      verses: [
        {
          id: '1',
          surah: 'Az-Zumar',
          ayah: 53,
          arabic:
            'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
          translation:
            "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'"
        },
        {
          id: '2',
          surah: 'Yusuf',
          ayah: 87,
          arabic:
            'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ',
          translation:
            'And despair not of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people.'
        }
      ]
    }
  });

  const [defaultTheme] = useState<ThemeDetail>({
    title: 'Collection',
    description: 'A curated collection of verses to guide and inspire you.',
    gradient: 'from-teal-muted via-card to-violet-muted',
    border: 'border-border',
    verses: [
      {
        id: '1',
        surah: 'Al-Isra',
        ayah: 82,
        arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
        translation:
          'And We send down of the Quran that which is healing and mercy for the believers.'
      }
    ]
  });

  return (
    <AppStateContext.Provider
      value={{
        features,
        verses,
        currentVerseIndex,
        setCurrentVerseIndex,
        collections,
        themes,
        themeData,
        defaultTheme
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
