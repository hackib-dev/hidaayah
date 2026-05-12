'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchJuzs } from '@/app/(app)/dashboard/quran/queries';
import type { Juz } from '@/app/(app)/dashboard/quran/types';
import type { RecitationProgress } from '@/types/recitation';

interface JuzRecitationViewProps {
  progress: RecitationProgress[];
  onSelectJuz: (juzNumber: number, verseKey: string) => void;
  onMarkComplete: (juzNumber: number) => void;
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

export function JuzRecitationView({
  progress,
  onSelectJuz,
  onMarkComplete
}: JuzRecitationViewProps) {
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

  const getProgress = (juzNum: number) =>
    progress.find((p) => p.format === 'juz' && p.unitNumber === juzNum);

  const handleSelect = async (juz: Juz) => {
    setLoadingJuz(juz.juz_number);
    const { start } = getJuzVerseRange(juz);
    onSelectJuz(juz.juz_number, start);
    setLoadingJuz(null);
  };

  const completedCount = progress.filter((p) => p.format === 'juz' && p.completedAt).length;
  const total = juzs.length || 30;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Juz Progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">{completedCount} of {total} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-xs font-bold text-primary">
            {Math.round((completedCount / total) * 100)}%
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {juzs.map((juz, i) => {
            const prog = getProgress(juz.juz_number);
            const isCompleted = !!prog?.completedAt;
            const isInProgress = prog && !isCompleted;
            const isLoading = loadingJuz === juz.juz_number;
            const { start, end } = getJuzVerseRange(juz);

            return (
              <motion.div
                key={juz.juz_number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.012 }}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200',
                  isCompleted
                    ? 'bg-primary/5 border-primary/20'
                    : isInProgress
                      ? 'bg-card border-primary/30'
                      : 'bg-card border-border hover:border-primary/20'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0',
                    isCompleted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : juz.juz_number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">Juz {juz.juz_number}</p>
                    {isInProgress && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        In progress
                      </span>
                    )}
                  </div>
                  {start && end && (
                    <p className="text-xs text-muted-foreground truncate">
                      {start} → {end}
                    </p>
                  )}
                  {isInProgress && prog.percentComplete > 0 && (
                    <div className="mt-1.5 w-full h-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${prog.percentComplete * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isInProgress && (
                    <button
                      onClick={() => onMarkComplete(juz.juz_number)}
                      className="p-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-semibold"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSelect(juz)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      isCompleted
                        ? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
