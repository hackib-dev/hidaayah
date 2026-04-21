'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuranReader } from '@/components/quran-reader';
import { SurahList } from '@/components/surah-list';
import { ChevronLeft, BookText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuranPage() {
  const searchParams = useSearchParams();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [scrollToVerse, setScrollToVerse] = useState<number | undefined>();
  const [view, setView] = useState<'list' | 'reader'>('list');

  // Open directly to surah/verse if provided via query params
  // Supports: ?surah=2&verse=255  OR  ?verse=2:255  OR  ?chapter=2&verse=255
  useEffect(() => {
    const surahParam = searchParams.get('surah') ?? searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    let surahNumber: number | null = surahParam ? parseInt(surahParam, 10) : null;
    let verseNumber: number | undefined;

    if (verseParam) {
      if (verseParam.includes(':')) {
        // Full verse key e.g. "2:255"
        const [chapter, verse] = verseParam.split(':');
        surahNumber = parseInt(chapter, 10);
        verseNumber = parseInt(verse, 10);
      } else {
        verseNumber = parseInt(verseParam, 10);
      }
    }

    if (surahNumber && !isNaN(surahNumber)) {
      setSelectedSurah(surahNumber);
      setScrollToVerse(verseNumber);
      setView('reader');
    }
  }, [searchParams]);

  const handleSelectSurah = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setScrollToVerse(undefined);
    setView('reader');
  };

  const handleBack = () => {
    setView('list');
    setSelectedSurah(null);
    setScrollToVerse(undefined);
  };

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="py-6 space-y-6"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-sm">
                      <BookText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                        The Noble Quran
                      </h1>
                      <p className="text-muted-foreground text-sm md:text-base">
                        Read, listen, and reflect on the words of Allah
                      </p>
                    </div>
                  </div>
                </div>

                <SurahList onSelectSurah={handleSelectSurah} />
              </motion.div>
            ) : (
              <motion.div
                key="reader"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="py-4"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 touch-target font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>All Surahs</span>
                </motion.button>

                {selectedSurah && (
                  <QuranReader surahNumber={selectedSurah} scrollToVerse={scrollToVerse} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
