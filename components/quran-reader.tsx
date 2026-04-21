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
  Mic,
  PenLine,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchVersesByChapter,
  fetchChapter,
  fetchVerseAudioFiles,
  fetchVerseReciters
} from '@/app/quran/queries';
import { fetchTafsirByChapter } from '@/app/guidance/queries';
import {
  createBookmark,
  deleteBookmark,
  fetchBookmarks,
  fetchNotesByVerse,
  createNote,
  updateNote,
  deleteNote,
  upsertReadingSession
} from '@/app/reflections/queries';
import { contentApi } from '@/app/apiService/quranFoundationService';
import type { Verse, Word, Chapter, Reciter } from '@/app/quran/types';
import type { Note } from '@/app/reflections/types';
import type { TafsirEntry } from '@/app/guidance/types';
import {
  QF_DEFAULT_TRANSLATION_ID,
  QF_DEFAULT_TAFSIR_ID,
  QF_DEFAULT_MUSHAF_ID,
  QF_DEFAULT_RECITER_ID
} from '@/config';

type QuranFont = 'qpc_hafs' | 'uthmani' | 'indopak';

const FONT_OPTIONS: { id: QuranFont; label: string; fontFamily: string; wordField: keyof Word }[] =
  [
    {
      id: 'qpc_hafs',
      label: 'QPC Hafs',
      fontFamily: 'QPCHafs, var(--font-arabic)',
      wordField: 'text_qpc_hafs'
    },
    {
      id: 'uthmani',
      label: 'Uthmani',
      fontFamily: 'var(--font-arabic)',
      wordField: 'text_uthmani'
    },
    {
      id: 'indopak',
      label: 'IndoPak',
      fontFamily: 'IndoPak, var(--font-arabic)',
      wordField: 'text_indopak'
    }
  ];

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

  // Font selection
  const [selectedFont, setSelectedFont] = useState<QuranFont>('qpc_hafs');

  // Footnotes
  const [footnote, setFootnote] = useState<{ text: string } | null>(null);

  // Notes: verseKey → Note[]
  const [verseNotes, setVerseNotes] = useState<Record<string, Note[]>>({});
  const [showNotes, setShowNotes] = useState<string | null>(null); // active verseKey
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Reading session tracking
  const sessionStartRef = useRef<number>(Date.now());
  const firstVerseRef = useRef<string | null>(null);
  const lastVerseRef = useRef<string | null>(null);

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

    // Load enough verses to include the target verse on first fetch
    const initialPerPage = scrollToVerse ? Math.max(20, scrollToVerse + 5) : 20;

    Promise.all([
      fetchChapter(surahNumber),
      fetchVersesByChapter(surahNumber, {
        translations: String(QF_DEFAULT_TRANSLATION_ID),
        words: true,
        page: 1,
        per_page: Math.min(initialPerPage, 50)
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

  const handleTranslationClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'SUP') return;
    const footnoteId = target.getAttribute('foot_note');
    if (!footnoteId) return;
    try {
      const res = await contentApi.get<{ footNote: { text: string } }>(`/foot_notes/${footnoteId}`);
      setFootnote({ text: res.data.footNote.text });
    } catch {
      // silently ignore footnote fetch errors
    }
  };

  // Reading session: record first/last verse seen and flush on unmount
  useEffect(() => {
    if (verses.length === 0) return;
    const firstKey = `${surahNumber}:${verses[0].verse_number}`;
    if (!firstVerseRef.current) firstVerseRef.current = firstKey;
    lastVerseRef.current = `${surahNumber}:${verses[verses.length - 1].verse_number}`;
  }, [verses, surahNumber]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    firstVerseRef.current = null;
    lastVerseRef.current = null;
    return () => {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const from = firstVerseRef.current;
      const to = lastVerseRef.current;
      if (from && to && duration >= 5) {
        upsertReadingSession({
          verseFrom: from,
          verseTo: to,
          duration,
          mushafId: QF_DEFAULT_MUSHAF_ID,
          chapterNumber: parseInt(from.split(':')[0], 10)
        }).catch(() => null);
      }
    };
  }, [surahNumber]);

  const loadVerseNotes = async (verseKey: string) => {
    if (verseNotes[verseKey] !== undefined) return;
    const res = await fetchNotesByVerse(verseKey).catch(() => null);
    setVerseNotes((prev) => ({ ...prev, [verseKey]: res?.data ?? [] }));
  };

  const toggleNotes = (verseKey: string) => {
    if (showNotes === verseKey) {
      setShowNotes(null);
    } else {
      setShowNotes(verseKey);
      loadVerseNotes(verseKey);
    }
    setNoteInput('');
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleSaveNote = async (verseKey: string) => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const [chapter, verse] = verseKey.split(':');
      const res = await createNote({
        body: noteInput.trim(),
        saveToQR: false,
        ranges: [`${chapter}:${verse}-${chapter}:${verse}`]
      });
      if (res?.data) {
        setVerseNotes((prev) => ({ ...prev, [verseKey]: [...(prev[verseKey] ?? []), res.data] }));
        setNoteInput('');
      }
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateNote = async (verseKey: string, noteId: string) => {
    if (!editingNoteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await updateNote(noteId, { body: editingNoteText.trim() });
      if (res?.data) {
        setVerseNotes((prev) => ({
          ...prev,
          [verseKey]: (prev[verseKey] ?? []).map((n) => (n.id === noteId ? res.data : n))
        }));
        setEditingNoteId(null);
        setEditingNoteText('');
      }
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (verseKey: string, noteId: string) => {
    await deleteNote(noteId).catch(() => null);
    setVerseNotes((prev) => ({
      ...prev,
      [verseKey]: (prev[verseKey] ?? []).filter((n) => n.id !== noteId)
    }));
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingNoteText('');
    }
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

                {/* Font selector */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">Arabic Font</span>
                  </div>
                  <div className="flex gap-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.id)}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-medium transition-colors',
                          selectedFont === font.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        )}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
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

          const verseKey = verse.verse_key ?? `${surahNumber}:${verse.verse_number}`;
          const notesOpen = showNotes === verseKey;
          const notes = verseNotes[verseKey] ?? [];

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
                    onClick={() => toggleNotes(verseKey)}
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      notesOpen
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <PenLine className="w-4 h-4" />
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

              {/* Arabic — word-by-word with selected font */}
              <p
                dir="rtl"
                className={cn(
                  'text-foreground text-center leading-[2.5] mb-4 wrap-break-word',
                  arabicSizeClass
                )}
              >
                {verse.words?.length ? (
                  verse.words
                    .filter((word) => word.char_type_name !== 'end')
                    .map((word) => {
                      const fontOpt = FONT_OPTIONS.find((f) => f.id === selectedFont)!;
                      return (
                        <span key={word.id} style={{ fontFamily: fontOpt.fontFamily }}>
                          {(word[fontOpt.wordField] as string) || word.text_uthmani}{' '}
                        </span>
                      );
                    })
                ) : (
                  // Fallback to verse-level text if words not loaded
                  <span style={{ fontFamily: 'var(--font-arabic)' }}>{verse.text_uthmani}</span>
                )}
              </p>

              {/* Transliteration */}
              {showTransliteration && transliteration && (
                <p className="text-sm text-muted-foreground text-center mb-3 italic">
                  {transliteration}
                </p>
              )}

              {/* Translation — footnote <sup> clicks fetch /foot_notes/:id */}
              {translation && (
                <div
                  className="text-foreground/90 text-center font-serif leading-relaxed [&_sup]:text-xs [&_sup]:text-primary [&_sup]:cursor-pointer [&_sup]:hover:underline"
                  onClick={handleTranslationClick}
                  dangerouslySetInnerHTML={{ __html: translation }}
                />
              )}

              {/* Footnote popup */}
              {footnote && (
                <div className="mt-3 p-3 rounded-xl bg-secondary/60 border border-border text-sm text-foreground/80 leading-relaxed relative">
                  <button
                    onClick={() => setFootnote(null)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                  <span className="font-semibold text-primary mr-1">Note:</span>
                  <span dangerouslySetInnerHTML={{ __html: footnote.text }} />
                </div>
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

              {/* Notes panel */}
              <AnimatePresence>
                {notesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Your Notes
                      </p>

                      {/* Existing notes */}
                      {notes.length === 0 && verseNotes[verseKey] !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          No notes yet. Add one below.
                        </p>
                      )}
                      {notes.map((note) => (
                        <div key={note.id} className="space-y-1">
                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                rows={3}
                                className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateNote(verseKey, note.id)}
                                  disabled={savingNote}
                                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2 group">
                              <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                                {note.body}
                              </p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.body);
                                  }}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <PenLine className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(verseKey, note.id)}
                                  className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* New note input */}
                      {editingNoteId === null && (
                        <div className="space-y-2">
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Write a note on this verse…"
                            rows={2}
                            className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleSaveNote(verseKey)}
                            disabled={savingNote || !noteInput.trim()}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
                          >
                            {savingNote ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Save note
                          </button>
                        </div>
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
