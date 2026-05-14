'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Loader2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchJuzs } from '@/app/(app)/dashboard/quran/queries';
import type { Juz } from '@/app/(app)/dashboard/quran/types';
import {
  fetchAllBookmarks,
  createBookmark,
  deleteBookmark
} from '@/app/(app)/dashboard/reflections/queries';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';
import { cn } from '@/lib/utils';

interface JuzRecitationViewProps {
  onSelectJuz: (juzNumber: number, verseKey: string) => void;
  scrollToJuz?: number;
}

function getJuzVerseRange(juz: Juz): { start: string; end: string } {
  const entries = Object.entries(juz.verse_mapping);
  if (entries.length === 0) return { start: '', end: '' };
  const [firstChapter, firstRange] = entries[0];
  const [lastChapter, lastRange] = entries[entries.length - 1];
  return {
    start: `${firstChapter}:${firstRange.split('-')[0]}`,
    end: `${lastChapter}:${lastRange.split('-')[1] ?? lastRange.split('-')[0]}`
  };
}

export function JuzRecitationView({ onSelectJuz, scrollToJuz }: JuzRecitationViewProps) {
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!scrollToJuz) return;
    const scroll = () => {
      itemRefs.current[scrollToJuz]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    // Delay to let AnimatePresence tab transition finish before scrolling
    const t = setTimeout(scroll, 250);
    return () => clearTimeout(t);
  }, [scrollToJuz, juzs]);

  // juzNumber → bookmarkId
  const [juzBookmarks, setJuzBookmarks] = useState<Record<number, string>>({});
  const [bookmarkingId, setBookmarkingId] = useState<number | null>(null);

  useEffect(() => {
    fetchJuzs()
      .then((res) => {
        const seen = new Set<number>();
        setJuzs((res.juzs ?? []).filter((j) => !seen.has(j.juz_number) && seen.add(j.juz_number)));
      })
      .catch(() => null)
      .finally(() => setLoading(false));

    fetchAllBookmarks({ type: 'juz', mushafId: QF_DEFAULT_MUSHAF_ID })
      .then((bms) => {
        const map: Record<number, string> = {};
        for (const bm of bms) map[bm.key] = bm.id;
        setJuzBookmarks(map);
      })
      .catch(() => null);
  }, []);

  const handleSelect = (juz: Juz) => {
    setLoadingJuz(juz.juz_number);
    const { start } = getJuzVerseRange(juz);
    onSelectJuz(juz.juz_number, start);
    setLoadingJuz(null);
  };

  const toggleJuzBookmark = async (e: React.MouseEvent, juzNumber: number) => {
    e.stopPropagation();
    if (bookmarkingId === juzNumber) return;
    setBookmarkingId(juzNumber);
    try {
      const existing = juzBookmarks[juzNumber];
      if (existing) {
        await deleteBookmark(existing);
        setJuzBookmarks((prev) => {
          const n = { ...prev };
          delete n[juzNumber];
          return n;
        });
      } else {
        const res = await createBookmark({
          type: 'juz',
          key: juzNumber,
          mushaf: QF_DEFAULT_MUSHAF_ID
        });
        if (res.data?.id) setJuzBookmarks((prev) => ({ ...prev, [juzNumber]: res.data.id }));
      }
    } catch {
      // ignore
    } finally {
      setBookmarkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {juzs.map((juz, i) => {
        const isLoading = loadingJuz === juz.juz_number;
        const { start, end } = getJuzVerseRange(juz);

        return (
          <motion.div
            key={juz.juz_number}
            ref={(el) => {
              itemRefs.current[juz.juz_number] = el;
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.012 }}
            className={cn(
              'flex items-center rounded-xl border bg-card transition-all duration-200',
              scrollToJuz === juz.juz_number
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary/30 hover:bg-primary/5'
            )}
          >
            {/* Clickable juz area */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isLoading && handleSelect(juz)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSelect(juz)}
              className="flex-1 flex items-center gap-3 p-3.5 cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : juz.juz_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Juz {juz.juz_number}</p>
                {start && end && (
                  <p className="text-xs text-muted-foreground truncate">
                    {start} → {end}
                  </p>
                )}
              </div>
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
            {/* Bookmark button — outside the clickable area to avoid nesting */}
            <button
              onClick={(e) => toggleJuzBookmark(e, juz.juz_number)}
              disabled={bookmarkingId === juz.juz_number}
              aria-label={juzBookmarks[juz.juz_number] ? 'Remove bookmark' : 'Bookmark juz'}
              aria-pressed={!!juzBookmarks[juz.juz_number]}
              className={cn(
                'p-2 mr-2 rounded-lg transition-colors shrink-0 disabled:opacity-50',
                juzBookmarks[juz.juz_number]
                  ? 'text-accent bg-gold-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {bookmarkingId === juz.juz_number ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bookmark
                  className={cn('w-3.5 h-3.5', juzBookmarks[juz.juz_number] && 'fill-current')}
                />
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
