'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuranReader } from '@/components/quran-reader';
import { MushafPageView } from '@/components/mushaf-page-view';
import { SurahList } from '@/components/surah-list';
import { ChevronLeft, BookText, AlignJustify, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchChapter } from '@/app/(app)/dashboard/quran/queries';
import type { Chapter } from '@/app/(app)/dashboard/quran/types';

export default function QuranPage() {
  const searchParams = useSearchParams();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [scrollToVerse, setScrollToVerse] = useState<number | undefined>();
  const [view, setView] = useState<'list' | 'reader'>('list');
  const [readerMode, setReaderMode] = useState<'translation' | 'mushaf'>('translation');
  const [chapterInfo, setChapterInfo] = useState<Chapter | null>(null);

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
    setChapterInfo(null);
    setView('reader');
    fetchChapter(surahNumber)
      .then((res) => setChapterInfo(res.chapter ?? null))
      .catch(() => null);
  };

  const handleBack = () => {
    setView('list');
    setSelectedSurah(null);
    setScrollToVerse(undefined);
    setChapterInfo(null);
  };

  // Fetch chapter info when surah is set from query params
  useEffect(() => {
    if (selectedSurah && view === 'reader' && !chapterInfo) {
      fetchChapter(selectedSurah)
        .then((res) => setChapterInfo(res.chapter ?? null))
        .catch(() => null);
    }
  }, [selectedSurah, view, chapterInfo]);

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
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors touch-target font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>All Surahs</span>
                  </motion.button>

                  {/* View mode toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary">
                    <button
                      onClick={() => setReaderMode('translation')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        readerMode === 'translation'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                      Translation
                    </button>
                    <button
                      onClick={() => setReaderMode('mushaf')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        readerMode === 'mushaf'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Mushaf
                    </button>
                  </div>
                </div>

                {selectedSurah && readerMode === 'translation' && (
                  <QuranReader surahNumber={selectedSurah} scrollToVerse={scrollToVerse} />
                )}

                {selectedSurah && readerMode === 'mushaf' && (
                  <MushafPageView
                    startPage={chapterInfo?.pages?.[0] ?? 1}
                    chapterName={chapterInfo?.name_simple}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
