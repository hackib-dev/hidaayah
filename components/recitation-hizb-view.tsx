'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RecitationProgress } from '@/types/recitation';

// Unused HIZB_META removed — hizb metadata is derived inline from juz/half indices
// Approximate first verse keys for each hizb (simplified mapping)
const HIZB_START_KEYS: string[] = [
  '1:1',
  '2:75',
  '2:142',
  '2:203',
  '2:253',
  '3:14',
  '3:93',
  '3:171',
  '4:1',
  '4:88',
  '4:148',
  '5:27',
  '5:82',
  '6:36',
  '6:111',
  '6:165',
  '7:88',
  '7:171',
  '8:41',
  '9:1',
  '9:93',
  '10:1',
  '10:71',
  '11:6',
  '11:84',
  '12:53',
  '13:1',
  '14:1',
  '15:1',
  '16:51',
  '16:128',
  '17:99',
  '18:75',
  '19:59',
  '20:83',
  '21:1',
  '21:83',
  '22:19',
  '23:1',
  '24:21',
  '25:21',
  '26:111',
  '27:1',
  '27:56',
  '28:51',
  '29:46',
  '31:1',
  '32:1',
  '33:31',
  '34:24',
  '36:28',
  '37:145',
  '39:32',
  '40:41',
  '41:47',
  '43:24',
  '46:1',
  '48:17',
  '51:31',
  '54:1'
];

interface HizbRecitationViewProps {
  progress: RecitationProgress[];
  onSelectHizb: (hizbNumber: number, verseKey: string) => void;
  onMarkComplete: (hizbNumber: number) => void;
}

export function HizbRecitationView({
  progress,
  onSelectHizb,
  onMarkComplete
}: HizbRecitationViewProps) {
  const getProgress = (hizbNum: number) =>
    progress.find((p) => p.format === 'hizb' && p.unitNumber === hizbNum);

  const completedCount = progress.filter((p) => p.format === 'hizb' && p.completedAt).length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Hizb Progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">{completedCount} of 60 completed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 60) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-xs font-bold text-primary">
            {Math.round((completedCount / 60) * 100)}%
          </span>
        </div>
      </div>

      {/* Juz groups */}
      <div className="space-y-3">
        {Array.from({ length: 30 }, (_, juzIdx) => {
          const juzNum = juzIdx + 1;
          const hizb1 = juzIdx * 2 + 1;
          const hizb2 = juzIdx * 2 + 2;

          return (
            <motion.div
              key={juzNum}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: juzIdx * 0.015 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-secondary/40 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Juz {juzNum}
                </p>
              </div>
              <div className="divide-y divide-border">
                {[hizb1, hizb2].map((hizbNum, halfIdx) => {
                  const prog = getProgress(hizbNum);
                  const isCompleted = !!prog?.completedAt;
                  const isInProgress = prog && !isCompleted;
                  const startKey = HIZB_START_KEYS[hizbNum - 1] ?? `${juzNum}:1`;

                  return (
                    <div
                      key={hizbNum}
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
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : hizbNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Hizb {hizbNum}
                          <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                            ({halfIdx === 0 ? '1st' : '2nd'} half)
                          </span>
                        </p>
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
                            onClick={() => onMarkComplete(hizbNum)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectHizb(hizbNum, startKey)}
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
          );
        })}
      </div>
    </div>
  );
}
