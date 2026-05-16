'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchHizbs } from '@/app/(app)/dashboard/quran/queries';
import type { Hizb } from '@/app/(app)/dashboard/quran/types';
import { cn } from '@/lib/utils';

interface HizbRecitationViewProps {
  onSelectHizb: (hizbNumber: number, verseKey: string) => void;
  scrollToHizb?: number;
}

function getHizbStartKey(hizb: Hizb): string {
  const firstEntry = Object.entries(hizb.verse_mapping)[0];
  if (!firstEntry) return '';
  return `${firstEntry[0]}:${firstEntry[1].split('-')[0]}`;
}

export function HizbRecitationView({ onSelectHizb, scrollToHizb }: HizbRecitationViewProps) {
  const [hizbs, setHizbs] = useState<Hizb[]>([]);
  const [loading, setLoading] = useState(true);
  const itemRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!scrollToHizb) return;
    const scroll = () => {
      itemRefs.current[scrollToHizb]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    // Delay to let AnimatePresence tab transition finish before scrolling
    const t = setTimeout(scroll, 250);
    return () => clearTimeout(t);
  }, [scrollToHizb, hizbs]);

  useEffect(() => {
    fetchHizbs()
      .then((res) => {
        const seen = new Set<number>();
        setHizbs(
          (res.hizbs ?? []).filter((h) => !seen.has(h.hizb_number) && seen.add(h.hizb_number))
        );
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  // Group into pairs (2 hizbs per juz)
  const juzGroups: Hizb[][] = [];
  for (let i = 0; i < hizbs.length; i += 2) {
    juzGroups.push(hizbs.slice(i, i + 2));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
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
              const startKey = getHizbStartKey(hizb);
              return (
                <button
                  key={hizb.hizb_number}
                  ref={(el) => {
                    itemRefs.current[hizb.hizb_number] = el;
                  }}
                  onClick={() => onSelectHizb(hizb.hizb_number, startKey)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 w-full text-left transition-colors',
                    scrollToHizb === hizb.hizb_number ? 'bg-primary/10' : 'hover:bg-primary/5'
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {hizb.hizb_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Hizb {hizb.hizb_number}
                      <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                        ({halfIdx === 0 ? '1st' : '2nd'} half)
                      </span>
                    </p>
                    {startKey && <p className="text-xs text-muted-foreground">From {startKey}</p>}
                  </div>
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
