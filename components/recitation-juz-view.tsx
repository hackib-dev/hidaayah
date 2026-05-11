'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchVersesByJuz } from '@/app/(app)/dashboard/quran/queries';
import type { RecitationProgress } from '@/types/recitation';

// Juz metadata: first surah name and verse range per juz
const JUZ_META: { name: string; start: string; end: string }[] = [
  { name: 'Al-Fatiha', start: '1:1', end: '2:141' },
  { name: 'Al-Baqarah', start: '2:142', end: '2:252' },
  { name: 'Al-Baqarah', start: '2:253', end: '3:92' },
  { name: 'Ali Imran', start: '3:93', end: '4:23' },
  { name: 'An-Nisa', start: '4:24', end: '4:147' },
  { name: 'An-Nisa', start: '4:148', end: '5:81' },
  { name: 'Al-Maidah', start: '5:82', end: '6:110' },
  { name: 'Al-Anam', start: '6:111', end: '7:87' },
  { name: 'Al-Araf', start: '7:88', end: '8:40' },
  { name: 'Al-Anfal', start: '8:41', end: '9:92' },
  { name: 'At-Tawbah', start: '9:93', end: '11:5' },
  { name: 'Hud', start: '11:6', end: '12:52' },
  { name: 'Yusuf', start: '12:53', end: '14:52' },
  { name: 'Al-Hijr', start: '15:1', end: '16:128' },
  { name: 'Al-Isra', start: '17:1', end: '18:74' },
  { name: 'Al-Kahf', start: '18:75', end: '20:135' },
  { name: 'Al-Anbiya', start: '21:1', end: '22:78' },
  { name: 'Al-Muminun', start: '23:1', end: '25:20' },
  { name: 'Al-Furqan', start: '25:21', end: '27:55' },
  { name: 'An-Naml', start: '27:56', end: '29:45' },
  { name: 'Al-Ankabut', start: '29:46', end: '33:30' },
  { name: 'Al-Ahzab', start: '33:31', end: '36:27' },
  { name: 'Ya-Sin', start: '36:28', end: '39:31' },
  { name: 'Az-Zumar', start: '39:32', end: '41:46' },
  { name: 'Fussilat', start: '41:47', end: '45:37' },
  { name: 'Al-Ahqaf', start: '46:1', end: '51:30' },
  { name: 'Adh-Dhariyat', start: '51:31', end: '57:29' },
  { name: 'Al-Mujadila', start: '58:1', end: '66:12' },
  { name: 'Al-Mulk', start: '67:1', end: '77:50' },
  { name: 'An-Naba', start: '78:1', end: '114:6' }
];

interface JuzRecitationViewProps {
  progress: RecitationProgress[];
  onSelectJuz: (juzNumber: number, verseKey: string) => void;
  onMarkComplete: (juzNumber: number) => void;
}

export function JuzRecitationView({
  progress,
  onSelectJuz,
  onMarkComplete
}: JuzRecitationViewProps) {
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);

  const getProgress = (juzNum: number) =>
    progress.find((p) => p.format === 'juz' && p.unitNumber === juzNum);

  const handleSelect = async (juzNum: number) => {
    const meta = JUZ_META[juzNum - 1];
    setLoadingJuz(juzNum);
    try {
      const res = await fetchVersesByJuz(juzNum, { per_page: 1, page: 1 });
      const firstVerse = res.verses?.[0]?.verse_key ?? meta.start;
      onSelectJuz(juzNum, firstVerse);
    } catch {
      onSelectJuz(juzNum, meta.start);
    } finally {
      setLoadingJuz(null);
    }
  };

  const completedCount = progress.filter((p) => p.format === 'juz' && p.completedAt).length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Juz Progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">{completedCount} of 30 completed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 30) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-xs font-bold text-primary">
            {Math.round((completedCount / 30) * 100)}%
          </span>
        </div>
      </div>

      {/* Juz grid */}
      <div className="grid grid-cols-1 gap-2">
        {JUZ_META.map((meta, i) => {
          const juzNum = i + 1;
          const prog = getProgress(juzNum);
          const isCompleted = !!prog?.completedAt;
          const isInProgress = prog && !isCompleted;
          const isLoading = loadingJuz === juzNum;

          return (
            <motion.div
              key={juzNum}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.012 }}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 group',
                isCompleted
                  ? 'bg-primary/5 border-primary/20'
                  : isInProgress
                    ? 'bg-card border-primary/30'
                    : 'bg-card border-border hover:border-primary/20'
              )}
            >
              {/* Juz number badge */}
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors',
                  isCompleted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                )}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : juzNum}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Juz {juzNum}</p>
                  {isInProgress && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {meta.name} · {meta.start} → {meta.end}
                </p>
                {isInProgress && prog.percentComplete > 0 && (
                  <div className="mt-1.5 w-full h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${prog.percentComplete * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {isInProgress && (
                  <button
                    onClick={() => onMarkComplete(juzNum)}
                    className="p-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-semibold"
                    title="Mark complete"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSelect(juzNum)}
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
    </div>
  );
}
