'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Settings2,
  Type,
  Minus,
  Plus,
  Loader2,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchVersesByChapter,
  fetchChapter,
  fetchVerseAudioFiles,
  fetchVerseReciters
} from '@/app/quran/queries';
import { fetchTafsirByChapter } from '@/app/guidance/queries';
import { createBookmark, deleteBookmark, fetchBookmarks } from '@/app/reflections/queries';
import type { Verse, Chapter, Reciter } from '@/app/quran/types';
import type { TafsirEntry } from '@/app/guidance/types';
import {
  QF_DEFAULT_TRANSLATION_ID,
  QF_DEFAULT_TAFSIR_ID,
  QF_DEFAULT_MUSHAF_ID,
  QF_DEFAULT_RECITER_ID
} from '@/config';

interface QuranReaderProps {
  surahNumber: number;
  scrollToVerse?: number;
}

export function QuranReader({ surahNumber, scrollToVerse }: QuranReaderProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [tafsirs, setTafsirs] = useState<Record<number, string>>({});
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, string>>({}); // verseNumber → bookmarkId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showTafsir, setShowTafsir] = useState<number | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [arabicSize, setArabicSize] = useState(3);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Verse-by-verse audio: list of { verse_key, url } in order
  const [verseAudioFiles, setVerseAudioFiles] = useState<{ verse_key: string; url: string }[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  // Reciters
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<number>(QF_DEFAULT_RECITER_ID);
  const [loadingReciters, setLoadingReciters] = useState(false);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Derived: current audio URL from verse list
  const audioUrl = verseAudioFiles[currentVerseIndex]?.url ?? null;

  // Fetch reciters list once
  useEffect(() => {
    setLoadingReciters(true);
    fetchVerseReciters()
      .then((res: { reciters: Reciter[] }) => setReciters(res.reciters ?? []))
      .catch(() => null)
      .finally(() => setLoadingReciters(false));
  }, []);

  // Fetch verse audio files when reciter or surah changes
  useEffect(() => {
    setVerseAudioFiles([]);
    setCurrentVerseIndex(0);
    setIsPlaying(false);
    setActiveVerse(1);
    setLoadingAudio(true);

    fetchVerseAudioFiles(selectedReciterId, surahNumber)
      .then((files) => setVerseAudioFiles(files))
      .catch(() => null)
      .finally(() => setLoadingAudio(false));
  }, [selectedReciterId, surahNumber]);

  // When currentVerseIndex changes, update activeVerse and scroll to it
  useEffect(() => {
    if (verseAudioFiles.length === 0) return;
    const vk = verseAudioFiles[currentVerseIndex]?.verse_key;
    if (!vk) return;
    const verseNum = parseInt(vk.split(':')[1], 10);
    setActiveVerse(verseNum);
    const el = verseRefs.current[verseNum];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentVerseIndex, verseAudioFiles]);

  // Sync play/pause/mute/src to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    if (!audioUrl) return;
    // Only update src if it actually changed to avoid resetting playback
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, isMuted, audioUrl]);

  // Load chapter info + first page of verses
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    setVerses([]);
    setChapter(null);
    setTafsirs({});

    Promise.all([
      fetchChapter(surahNumber),
      fetchVersesByChapter(surahNumber, {
        translations: String(QF_DEFAULT_TRANSLATION_ID),
        words: true,
        page: 1,
        per_page: 20
      }),
      fetchBookmarks({
        type: 'ayah',
        mushafId: QF_DEFAULT_MUSHAF_ID,
        key: surahNumber,
        first: 20
      }).catch(() => null)
    ])
      .then(([chapterRes, versesRes, bookmarksRes]) => {
        setChapter(chapterRes.chapter);
        setVerses(versesRes.verses);
        setTotalPages(versesRes.pagination.total_pages);
        const map: Record<number, string> = {};
        for (const bm of bookmarksRes?.data ?? []) {
          if (bm.verseNumber !== null) map[bm.verseNumber] = bm.id;
        }
        setBookmarkedVerses(map);

        if (scrollToVerse) {
          setTimeout(() => {
            document
              .getElementById(`verse-${surahNumber}-${scrollToVerse}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      })
      .catch(() => setError('Failed to load surah. Please try again.'))
      .finally(() => setLoading(false));
  }, [surahNumber, scrollToVerse]);

  const loadMoreVerses = () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchVersesByChapter(surahNumber, {
      translations: String(QF_DEFAULT_TRANSLATION_ID),
      words: true,
      page: nextPage,
      per_page: 20
    })
      .then((res) => {
        setVerses((prev) => [...prev, ...res.verses]);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  };

  const loadTafsir = async (verseNumber: number) => {
    if (tafsirs[verseNumber] !== undefined) return;
    setLoadingTafsir(true);
    try {
      const res = await fetchTafsirByChapter(QF_DEFAULT_TAFSIR_ID, surahNumber, 1, 50);
      const map: Record<number, string> = {};
      (res.tafsirs ?? []).forEach((t: TafsirEntry) => {
        const vNum = t.verse_number ?? parseInt(t.verse_key?.split(':')[1] ?? '0', 10);
        if (vNum && t.text) map[vNum] = t.text;
      });
      setTafsirs(map);
    } finally {
      setLoadingTafsir(false);
    }
  };

  const toggleTafsir = (verseNumber: number) => {
    if (showTafsir === verseNumber) {
      setShowTafsir(null);
    } else {
      setShowTafsir(verseNumber);
      loadTafsir(verseNumber);
    }
  };

  const toggleBookmark = async (verse: Verse) => {
    const existing = bookmarkedVerses[verse.verse_number];
    if (existing) {
      await deleteBookmark(existing).catch(() => null);
      setBookmarkedVerses((prev) => {
        const next = { ...prev };
        delete next[verse.verse_number];
        return next;
      });
    } else {
      const res = await createBookmark({
        type: 'ayah',
        key: surahNumber,
        verseNumber: verse.verse_number,
        mushaf: QF_DEFAULT_MUSHAF_ID
      }).catch(() => null);
      if (res?.data?.id) {
        setBookmarkedVerses((prev) => ({ ...prev, [verse.verse_number]: res.data.id }));
      }
    }
  };

  const handlePlayVerse = (verseNumber: number) => {
    const idx = verseAudioFiles.findIndex(
      (f) => parseInt(f.verse_key.split(':')[1], 10) === verseNumber
    );
    if (idx !== -1) setCurrentVerseIndex(idx);
    setIsPlaying(true);
  };

  const selectedReciter = reciters.find((r) => r.id === selectedReciterId);

  const arabicSizeClass = [
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
    'text-5xl md:text-6xl'
  ][arabicSize - 1];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading surah...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-2">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="text-xs text-primary underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Surah Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-linear-to-br from-card to-teal-muted border border-teal/15 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                Surah {surahNumber}
              </span>
              {chapter && (
                <span
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold',
                    chapter.revelation_place === 'makkah'
                      ? 'bg-teal-muted text-teal'
                      : 'bg-gold-muted text-accent'
                  )}
                >
                  {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              {chapter?.name_simple ?? `Surah ${surahNumber}`}
            </h1>
            <p className="text-sm text-muted-foreground">{chapter?.translated_name.name}</p>
          </div>
          <div className="text-right">
            <p
              className="text-3xl md:text-4xl text-foreground"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              {chapter?.name_arabic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{chapter?.verses_count} verses</p>
          </div>
        </div>
      </motion.div>

      {/* Hidden audio element — src is managed imperatively in the sync effect */}
      <audio
        ref={audioRef}
        onEnded={() => {
          const nextIndex = currentVerseIndex + 1;
          if (nextIndex < verseAudioFiles.length) {
            setCurrentVerseIndex(nextIndex);
            // isPlaying stays true — the sync effect will play the new src
          } else {
            setIsPlaying(false);
            setCurrentVerseIndex(0);
            setActiveVerse(1);
          }
        }}
      />

      {/* Audio Player */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                const prev = Math.max(0, currentVerseIndex - 1);
                setCurrentVerseIndex(prev);
                setIsPlaying(true);
              }}
              disabled={currentVerseIndex === 0}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <SkipBack className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying((p) => !p)}
              disabled={loadingAudio}
              className={cn(
                'p-3 rounded-xl transition-all duration-200',
                isPlaying
                  ? 'bg-linear-to-br from-primary to-teal text-white shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {loadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                const next = Math.min(verseAudioFiles.length - 1, currentVerseIndex + 1);
                setCurrentVerseIndex(next);
                setIsPlaying(true);
              }}
              disabled={currentVerseIndex >= verseAudioFiles.length - 1}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="flex-1 text-center min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {selectedReciter?.name ?? 'Loading reciters...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPlaying ? `Verse ${activeVerse} playing` : 'Paused'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsMuted((m) => !m)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowSettings((s) => !s)}
              className={cn(
                'p-2 rounded-xl transition-colors',
                showSettings
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Settings2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Reciter selector */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">Reciter</span>
                  </div>
                  <button
                    onClick={() => setShowReciterPicker((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <span className="text-foreground font-medium truncate">
                      {loadingReciters ? 'Loading...' : (selectedReciter?.name ?? 'Select reciter')}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
                        showReciterPicker && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {showReciterPicker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-card divide-y divide-border">
                          {reciters.map((reciter) => (
                            <button
                              key={reciter.id}
                              onClick={() => {
                                setSelectedReciterId(reciter.id);
                                setShowReciterPicker(false);
                                setIsPlaying(false);
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2.5 text-sm transition-colors',
                                reciter.id === selectedReciterId
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-foreground hover:bg-secondary'
                              )}
                            >
                              {reciter.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Arabic size */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">Arabic Size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setArabicSize((s) => Math.max(1, s - 1))}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </motion.button>
                    <span className="text-sm font-bold w-8 text-center">{arabicSize}</span>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setArabicSize((s) => Math.min(5, s + 1))}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>

                {/* Transliteration toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">Show Transliteration</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTransliteration((t) => !t)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors duration-200 relative',
                      showTransliteration ? 'bg-primary' : 'bg-secondary'
                    )}
                  >
                    <motion.span
                      animate={{ x: showTransliteration ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow block"
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Verses */}
      <div className="space-y-4">
        {verses.map((verse, index) => {
          const translation = verse.translations?.[0]?.text ?? '';
          const transliteration =
            verse.words
              ?.map((w) => w.transliteration?.text)
              .filter(Boolean)
              .join(' ') ?? '';
          const isBookmarked = !!bookmarkedVerses[verse.verse_number];
          const isActive = isPlaying && activeVerse === verse.verse_number;
          const isHighlighted =
            scrollToVerse === verse.verse_number || activeVerse === verse.verse_number;

          return (
            <motion.div
              key={verse.id}
              id={`verse-${surahNumber}-${verse.verse_number}`}
              ref={(el) => {
                verseRefs.current[verse.verse_number] = el;
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={cn(
                'p-5 md:p-6 rounded-2xl border transition-all duration-300',
                isActive
                  ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20 shadow-md'
                  : isHighlighted
                    ? 'bg-card border-primary/40 ring-2 ring-primary/15 shadow-sm'
                    : 'bg-card border-border hover:border-primary/20'
              )}
            >
              {/* Active verse indicator bar */}
              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="h-0.5 bg-linear-to-r from-primary to-teal rounded-full mb-4 origin-left"
                />
              )}

              {/* Verse header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors duration-300',
                    isActive
                      ? 'bg-linear-to-br from-primary to-teal text-white shadow-sm'
                      : 'bg-linear-to-br from-primary/10 to-teal/10 text-primary'
                  )}
                >
                  {verse.verse_number}
                </div>

                {/* Active playing badge */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Now playing
                  </motion.div>
                )}

                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => toggleBookmark(verse)}
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      isBookmarked
                        ? 'text-accent bg-gold-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handlePlayVerse(verse.verse_number)}
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Arabic */}
              <p
                className={cn('text-foreground text-center leading-[2.5] mb-4', arabicSizeClass)}
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {verse.text_uthmani}
              </p>

              {/* Transliteration */}
              {showTransliteration && transliteration && (
                <p className="text-sm text-muted-foreground text-center mb-3 italic">
                  {transliteration}
                </p>
              )}

              {/* Translation */}
              {translation && (
                <p
                  className="text-foreground/90 text-center font-serif leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: translation }}
                />
              )}

              {/* Tafsir toggle */}
              <button
                onClick={() => toggleTafsir(verse.verse_number)}
                className="flex items-center gap-2 mx-auto mt-4 text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                <BookOpen className="w-4 h-4" />
                <span>{showTafsir === verse.verse_number ? 'Hide' : 'Show'} Tafsir</span>
                {showTafsir === verse.verse_number ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {showTafsir === verse.verse_number && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 rounded-xl bg-linear-to-br from-secondary/50 to-teal-muted/50">
                      {loadingTafsir ? (
                        <div className="flex items-center gap-2 justify-center py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">Loading tafsir...</span>
                        </div>
                      ) : tafsirs[verse.verse_number] ? (
                        <p
                          className="text-sm text-foreground/80 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: tafsirs[verse.verse_number] }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          Tafsir not available for this verse.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Load more */}
        {page < totalPages && (
          <button
            onClick={loadMoreVerses}
            disabled={loadingMore}
            className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more verses
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
