'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchHizbs } from '@/app/(app)/dashboard/quran/queries';
import type { Hizb } from '@/app/(app)/dashboard/quran/types';
import type { RecitationProgress } from '@/types/recitation';

interface HizbRecitationViewProps {
  progress: RecitationProgress[];
  onSelectHizb: (hizbNumber: number, verseKey: string) => void;
  onMarkComplete: (hizbNumber: number) => void;
}

function getHizbStartKey(hizb: Hizb): string {
  const firstEntry = Object.entries(hizb.verse_mapping)[0];
  if (!firstEntry) return '';
  return `${firstEntry[0]}:${firstEntry[1].split('-')[0]}`;
}

export function HizbRecitationView({
  progress,
  onSelectHizb,
  onMarkComplete
}: HizbRecitationViewProps) {
  const [hizbs, setHizbs] = useState<Hizb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHizbs()
      .then((res) => {
        const seen = new Set<number>();
        setHizbs((res.hizbs ?? []).filter((h) => !seen.has(h.hizb_number) && seen.add(h.hizb_number)));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (hizbNum: number) =>
    progress.find((p) => p.format === 'hizb' && p.unitNumber === hizbNum);

  const completedCount = progress.filter((p) => p.format === 'hizb' && p.completedAt).length;
  const total = hizbs.length || 60;

  // Group hizbs into pairs per juz (2 hizbs per juz)
  const juzGroups: Hizb[][] = [];
  for (let i = 0; i < hizbs.length; i += 2) {
    juzGroups.push(hizbs.slice(i, i + 2));
  }

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Hizb Progress</p>
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
        <div className="space-y-3">
          {juzGroups.map((group, juzIdx) => (
            <motion.div
              key={juzIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: juzIdx * 0.015 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-secondary/40 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Juz {juzIdx + 1}
                </p>
              </div>
              <div className="divide-y divide-border">
                {group.map((hizb, halfIdx) => {
                  const prog = getProgress(hizb.hizb_number);
                  const isCompleted = !!prog?.completedAt;
                  const isInProgress = prog && !isCompleted;
                  const startKey = getHizbStartKey(hizb);

                  return (
                    <div
                      key={hizb.hizb_number}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        isCompleted ? 'bg-primary/5' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : hizb.hizb_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Hizb {hizb.hizb_number}
                          <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                            ({halfIdx === 0 ? '1st' : '2nd'} half)
                          </span>
                        </p>
                        {startKey && (
                          <p className="text-xs text-muted-foreground">From {startKey}</p>
                        )}
                        {isInProgress && prog.percentComplete > 0 && (
                          <div className="mt-1 w-full h-1 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${prog.percentComplete * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isInProgress && (
                          <button
                            onClick={() => onMarkComplete(hizb.hizb_number)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectHizb(hizb.hizb_number, startKey)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                            isCompleted
                              ? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          )}
                        >
                          <BookOpen className="w-3 h-3" />
                          {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
