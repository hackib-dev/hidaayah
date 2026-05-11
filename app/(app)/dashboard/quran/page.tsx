'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuranReader } from '@/components/quran-reader';
import { MushafPageView } from '@/components/mushaf-page-view';
import { SurahList } from '@/components/surah-list';
import { RecitationFormatSelector } from '@/components/recitation-format-selector';
import { JuzRecitationView } from '@/components/recitation-juz-view';
import { HizbRecitationView } from '@/components/recitation-hizb-view';
import { PageRecitationView } from '@/components/recitation-page-view';
import { ChevronLeft, BookText, AlignJustify, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchChapter } from '@/app/(app)/dashboard/quran/queries';
import type { Chapter } from '@/app/(app)/dashboard/quran/types';
import type { RecitationFormat, RecitationProgress } from '@/types/recitation';

const PROGRESS_KEY = 'hidaayah_recitation_progress';

function loadProgress(): RecitationProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveProgress(progress: RecitationProgress[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export default function QuranPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [format, setFormat] = useState<RecitationFormat>('surah');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [scrollToVerse, setScrollToVerse] = useState<number | undefined>();
  const [view, setView] = useState<'list' | 'reader'>('list');
  const [readerMode, setReaderMode] = useState<'translation' | 'mushaf'>('translation');
  const [chapterInfo, setChapterInfo] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<RecitationProgress[]>([]);

  // Load persisted progress
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Open directly to surah/verse if provided via query params
  useEffect(() => {
    const surahParam = searchParams.get('surah') ?? searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    let surahNumber: number | null = surahParam ? parseInt(surahParam, 10) : null;
    let verseNumber: number | undefined;

    if (verseParam) {
      if (verseParam.includes(':')) {
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

  // Fetch chapter info when surah is set from query params
  useEffect(() => {
    if (selectedSurah && view === 'reader' && !chapterInfo) {
      fetchChapter(selectedSurah)
        .then((res) => setChapterInfo(res.chapter ?? null))
        .catch(() => null);
    }
  }, [selectedSurah, view, chapterInfo]);

  const openReader = useCallback((surahNumber: number, verseNumber?: number) => {
    setSelectedSurah(surahNumber);
    setScrollToVerse(verseNumber);
    setChapterInfo(null);
    setView('reader');
    fetchChapter(surahNumber)
      .then((res) => setChapterInfo(res.chapter ?? null))
      .catch(() => null);
  }, []);

  const handleBack = () => {
    setView('list');
    setSelectedSurah(null);
    setScrollToVerse(undefined);
    setChapterInfo(null);
  };

  // ─── Juz handlers ──────────────────────────────────────────────────────────
  const handleSelectJuz = (juzNumber: number, verseKey: string) => {
    const [chapter, verse] = verseKey.split(':');
    const surahNum = parseInt(chapter, 10);
    const verseNum = parseInt(verse, 10);

    setProgress((prev) => {
      const existing = prev.find((p) => p.format === 'juz' && p.unitNumber === juzNumber);
      const updated: RecitationProgress = existing
        ? { ...existing, lastReadAt: new Date().toISOString() }
        : {
            format: 'juz',
            unitNumber: juzNumber,
            verseFrom: verseKey,
            lastReadAt: new Date().toISOString(),
            percentComplete: 0
          };
      const next = existing
        ? prev.map((p) => (p.format === 'juz' && p.unitNumber === juzNumber ? updated : p))
        : [...prev, updated];
      saveProgress(next);
      return next;
    });

    openReader(surahNum, verseNum);
  };

  const handleMarkJuzComplete = (juzNumber: number) => {
    setProgress((prev) => {
      const next = prev.map((p) =>
        p.format === 'juz' && p.unitNumber === juzNumber
          ? { ...p, completedAt: new Date().toISOString(), percentComplete: 1 }
          : p
      );
      saveProgress(next);
      return next;
    });
  };

  // ─── Hizb handlers ─────────────────────────────────────────────────────────
  const handleSelectHizb = (hizbNumber: number, verseKey: string) => {
    const [chapter, verse] = verseKey.split(':');
    const surahNum = parseInt(chapter, 10);
    const verseNum = parseInt(verse, 10);

    setProgress((prev) => {
      const existing = prev.find((p) => p.format === 'hizb' && p.unitNumber === hizbNumber);
      const updated: RecitationProgress = existing
        ? { ...existing, lastReadAt: new Date().toISOString() }
        : {
            format: 'hizb',
            unitNumber: hizbNumber,
            verseFrom: verseKey,
            lastReadAt: new Date().toISOString(),
            percentComplete: 0
          };
      const next = existing
        ? prev.map((p) => (p.format === 'hizb' && p.unitNumber === hizbNumber ? updated : p))
        : [...prev, updated];
      saveProgress(next);
      return next;
    });

    openReader(surahNum, verseNum);
  };

  const handleMarkHizbComplete = (hizbNumber: number) => {
    setProgress((prev) => {
      const next = prev.map((p) =>
        p.format === 'hizb' && p.unitNumber === hizbNumber
          ? { ...p, completedAt: new Date().toISOString(), percentComplete: 1 }
          : p
      );
      saveProgress(next);
      return next;
    });
  };

  // ─── Page handlers ─────────────────────────────────────────────────────────
  const handleSelectPage = (pageNumber: number) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.format === 'page' && p.unitNumber === pageNumber);
      const updated: RecitationProgress = existing
        ? { ...existing, lastReadAt: new Date().toISOString() }
        : {
            format: 'page',
            unitNumber: pageNumber,
            lastReadAt: new Date().toISOString(),
            percentComplete: 0
          };
      const next = existing
        ? prev.map((p) => (p.format === 'page' && p.unitNumber === pageNumber ? updated : p))
        : [...prev, updated];
      saveProgress(next);
      return next;
    });

    router.push(`/dashboard/quran?page=${pageNumber}`);
  };

  const handleMarkPageComplete = (pageNumber: number) => {
    setProgress((prev) => {
      const next = prev.map((p) =>
        p.format === 'page' && p.unitNumber === pageNumber
          ? { ...p, completedAt: new Date().toISOString(), percentComplete: 1 }
          : p
      );
      saveProgress(next);
      return next;
    });
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
                className="py-6 space-y-5"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-sm">
                    <BookText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                      The Noble Quran
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Read, listen, and reflect on the words of Allah
                    </p>
                  </div>
                </div>

                {/* Format selector */}
                <RecitationFormatSelector value={format} onChange={setFormat} />

                {/* Format views */}
                <AnimatePresence mode="wait">
                  {format === 'surah' && (
                    <motion.div
                      key="surah"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SurahList onSelectSurah={(n) => openReader(n)} />
                    </motion.div>
                  )}

                  {format === 'juz' && (
                    <motion.div
                      key="juz"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <JuzRecitationView
                        progress={progress}
                        onSelectJuz={handleSelectJuz}
                        onMarkComplete={handleMarkJuzComplete}
                      />
                    </motion.div>
                  )}

                  {format === 'hizb' && (
                    <motion.div
                      key="hizb"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HizbRecitationView
                        progress={progress}
                        onSelectHizb={handleSelectHizb}
                        onMarkComplete={handleMarkHizbComplete}
                      />
                    </motion.div>
                  )}

                  {format === 'page' && (
                    <motion.div
                      key="page"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PageRecitationView
                        progress={progress}
                        onSelectPage={handleSelectPage}
                        onMarkComplete={handleMarkPageComplete}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <span>
                      {format === 'surah'
                        ? 'All Surahs'
                        : format === 'juz'
                          ? 'All Juz'
                          : format === 'hizb'
                            ? 'All Hizb'
                            : 'All Pages'}
                    </span>
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
