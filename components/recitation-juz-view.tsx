'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchJuzs } from '@/app/(app)/dashboard/quran/queries';
import type { Juz } from '@/app/(app)/dashboard/quran/types';

interface JuzRecitationViewProps {
  onSelectJuz: (juzNumber: number, verseKey: string) => void;
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

export function JuzRecitationView({ onSelectJuz }: JuzRecitationViewProps) {
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);

  useEffect(() => {
    fetchJuzs()
      .then((res) => {
        const seen = new Set<number>();
        setJuzs((res.juzs ?? []).filter((j) => !seen.has(j.juz_number) && seen.add(j.juz_number)));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (juz: Juz) => {
    setLoadingJuz(juz.juz_number);
    const { start } = getJuzVerseRange(juz);
    onSelectJuz(juz.juz_number, start);
    setLoadingJuz(null);
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
          <motion.button
            key={juz.juz_number}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.012 }}
            onClick={() => handleSelect(juz)}
            disabled={isLoading}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left w-full"
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
          </motion.button>
        );
      })}
    </div>
  );
}
