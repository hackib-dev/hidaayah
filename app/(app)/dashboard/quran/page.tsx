'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuranReader } from '@/components/quran-reader';
import { MushafPageView } from '@/components/mushaf-page-view';
import { SurahList } from '@/components/surah-list';
import { RecitationFormatSelector } from '@/components/recitation-format-selector';
import { JuzRecitationView } from '@/components/recitation-juz-view';
import { HizbRecitationView } from '@/components/recitation-hizb-view';
import { PageRecitationView } from '@/components/recitation-page-view';
import { RecitersBrowser } from '@/components/reciters-browser';
import { ChevronLeft, BookText, AlignJustify, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchChapter,
  fetchJuzs,
  fetchHizbs,
  fetchPageForVerseKey
} from '@/app/(app)/dashboard/quran/queries';
import type { Chapter, Juz, Hizb } from '@/app/(app)/dashboard/quran/types';
import type { RecitationFormat } from '@/types/recitation';
import { QURAN_NAV_EVENT } from '@/components/quran-companion';
import type { QuranNavEvent } from '@/components/quran-companion';

export default function QuranPage() {
  const searchParams = useSearchParams();

  const [format, setFormat] = useState<RecitationFormat>('surah');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [scrollToVerse, setScrollToVerse] = useState<number | undefined>();
  const [view, setView] = useState<'list' | 'reader'>('list');
  const [readerMode, setReaderMode] = useState<'translation' | 'mushaf'>('mushaf');
  const [chapterInfo, setChapterInfo] = useState<Chapter | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [hizbs, setHizbs] = useState<Hizb[]>([]);
  const [selectedJump, setSelectedJump] = useState<{ juz: number | ''; hizb: number | '' }>({
    juz: '',
    hizb: ''
  });
  const [reciterSearch, setReciterSearch] = useState<string>('');

  // Fetch juzs and hizbs for jump navigation
  useEffect(() => {
    fetchJuzs()
      .then((res) => {
        const seen = new Set<number>();
        setJuzs((res.juzs ?? []).filter((j) => !seen.has(j.juz_number) && seen.add(j.juz_number)));
      })
      .catch(() => null);
    fetchHizbs()
      .then((res) => {
        const seen = new Set<number>();
        setHizbs(
          (res.hizbs ?? []).filter((h) => !seen.has(h.hizb_number) && seen.add(h.hizb_number))
        );
      })
      .catch(() => null);
  }, []);

  // Open directly to surah/verse/page/juz/hizb if provided via query params
  useEffect(() => {
    const surahParam = searchParams.get('surah') ?? searchParams.get('chapter');
    const verseParam = searchParams.get('verse');
    const pageParam = searchParams.get('page');
    const modeParam = searchParams.get('mode');
    const formatParam = searchParams.get('format') as RecitationFormat | null;
    const juzParam = searchParams.get('juz');
    const hizbParam = searchParams.get('hizb');
    const reciterParam = searchParams.get('reciter');

    // Switch to the requested format tab (juz, hizb, page, reciters, surah)
    if (formatParam && ['surah', 'juz', 'hizb', 'page', 'reciters'].includes(formatParam)) {
      setFormat(formatParam);
    }

    // Pre-fill reciter search when navigating from companion
    if (reciterParam) {
      setReciterSearch(decodeURIComponent(reciterParam));
    }

    // Scroll the juz list to the requested juz
    if (juzParam && !isNaN(parseInt(juzParam, 10))) {
      const num = parseInt(juzParam, 10);
      setSelectedJump((prev) => ({ ...prev, juz: num }));
    }

    // Scroll the hizb list to the requested hizb
    if (hizbParam && !isNaN(parseInt(hizbParam, 10))) {
      const num = parseInt(hizbParam, 10);
      setSelectedJump((prev) => ({ ...prev, hizb: num }));
    }

    // Direct mushaf page navigation (from "Resume reading" when last session was mushaf)
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p)) {
        setSelectedPage(p);
        setReaderMode('mushaf');
        setView('reader');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

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
      if (modeParam === 'translation') setReaderMode('translation');

      if (verseNumber) {
        const verseKey = `${surahNumber}:${verseNumber}`;
        fetchPageForVerseKey(verseKey)
          .then((p) => {
            if (p) setSelectedPage(p);
          })
          .catch(() => null);
      }
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

  // Listen for navigation events dispatched by the Quran Companion when already on this page
  useEffect(() => {
    const handler = (e: Event) => {
      const nav = (e as CustomEvent<QuranNavEvent>).detail;

      if (nav.reciterName) {
        setFormat('reciters');
        setReciterSearch(nav.reciterName);
        setView('list');
        return;
      }
      if (nav.juzNumber) {
        setFormat('juz');
        setSelectedJump((prev) => ({ ...prev, juz: nav.juzNumber! }));
        setView('list');
        return;
      }
      if (nav.hizbNumber) {
        setFormat('hizb');
        setSelectedJump((prev) => ({ ...prev, hizb: nav.hizbNumber! }));
        setView('list');
        return;
      }
      if (nav.pageNumber) {
        setSelectedPage(nav.pageNumber);
        setReaderMode('mushaf');
        setView('reader');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (nav.verseKey) {
        const [chapter, verse] = nav.verseKey.split(':');
        openReader(parseInt(chapter, 10), parseInt(verse, 10));
        if (nav.mode === 'translation') setReaderMode('translation');
        fetchPageForVerseKey(nav.verseKey)
          .then((p) => {
            if (p) setSelectedPage(p);
          })
          .catch(() => null);
        return;
      }
      if (nav.chapterNumber) {
        openReader(nav.chapterNumber);
        if (nav.mode === 'translation') setReaderMode('translation');
      }
    };
    window.addEventListener(QURAN_NAV_EVENT, handler);
    return () => window.removeEventListener(QURAN_NAV_EVENT, handler);
  }, [openReader]);

  const handleBack = () => {
    setView('list');
    setSelectedSurah(null);
    setSelectedPage(null);
    setScrollToVerse(undefined);
    setChapterInfo(null);
  };

  // ─── Juz handlers ──────────────────────────────────────────────────────────
  const handleSelectJuz = (_juzNumber: number, verseKey: string) => {
    const [chapter, verse] = verseKey.split(':');
    openReader(parseInt(chapter, 10), parseInt(verse, 10));
  };

  // ─── Hizb handlers ─────────────────────────────────────────────────────────
  const handleSelectHizb = (_hizbNumber: number, verseKey: string) => {
    const [chapter, verse] = verseKey.split(':');
    openReader(parseInt(chapter, 10), parseInt(verse, 10));
  };

  // ─── Page handlers ─────────────────────────────────────────────────────────
  const handleSelectPage = (pageNumber: number) => {
    setSelectedPage(pageNumber);
    setReaderMode('mushaf');
    setView('reader');
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
                      {(juzs.length > 0 || hizbs.length > 0) && (
                        <div className="flex gap-3 mb-4">
                          {juzs.length > 0 && (
                            <select
                              value={selectedJump.juz}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const num = Number(e.target.value);
                                setSelectedJump({ juz: num, hizb: '' });
                                const juz = juzs.find((j) => j.juz_number === num);
                                if (!juz) return;
                                const firstEntry = Object.entries(juz.verse_mapping)[0];
                                if (!firstEntry) return;
                                const [chapter, range] = firstEntry;
                                handleSelectJuz(num, `${chapter}:${range.split('-')[0]}`);
                              }}
                              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="" disabled>
                                Jump to Juz…
                              </option>
                              {juzs.map((j) => (
                                <option key={j.juz_number} value={j.juz_number}>
                                  Juz {j.juz_number}
                                </option>
                              ))}
                            </select>
                          )}
                          {hizbs.length > 0 && (
                            <select
                              value={selectedJump.hizb}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const num = Number(e.target.value);
                                setSelectedJump({ juz: '', hizb: num });
                                const hizb = hizbs.find((h) => h.hizb_number === num);
                                if (!hizb) return;
                                const firstEntry = Object.entries(hizb.verse_mapping)[0];
                                if (!firstEntry) return;
                                const [chapter, range] = firstEntry;
                                handleSelectHizb(num, `${chapter}:${range.split('-')[0]}`);
                              }}
                              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="" disabled>
                                Jump to Hizb…
                              </option>
                              {hizbs.map((h) => (
                                <option key={h.hizb_number} value={h.hizb_number}>
                                  Hizb {h.hizb_number}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
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
                        onSelectJuz={handleSelectJuz}
                        scrollToJuz={selectedJump.juz || undefined}
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
                        onSelectHizb={handleSelectHizb}
                        scrollToHizb={selectedJump.hizb || undefined}
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
                      <PageRecitationView onSelectPage={handleSelectPage} />
                    </motion.div>
                  )}

                  {format === 'reciters' && (
                    <motion.div
                      key="reciters"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RecitersBrowser initialSearch={reciterSearch} />
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
                  </div>
                </div>

                {selectedSurah && readerMode === 'translation' && (
                  <QuranReader surahNumber={selectedSurah} scrollToVerse={scrollToVerse} />
                )}

                {readerMode === 'mushaf' && (selectedSurah || selectedPage) && (
                  <MushafPageView
                    startPage={selectedPage ?? chapterInfo?.pages?.[0] ?? 1}
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
