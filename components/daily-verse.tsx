'use client';

import { useState } from 'react';
import { Play, Pause, Bookmark, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function DailyVerse() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm"
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-teal to-accent" />

      <div className="p-5 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Verse of the Day
            </p>
            <p className="text-sm text-primary font-semibold">Surah Ar-Rahman (55:13)</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200',
              isBookmarked
                ? 'bg-gold-muted text-accent'
                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-current')} />
          </motion.button>
        </div>

        {/* Arabic Text */}
        <div className="py-6 px-4 rounded-2xl bg-gradient-to-br from-teal-muted to-violet-muted border border-primary/10">
          <p
            className="text-2xl md:text-3xl lg:text-4xl text-center leading-[2.2] text-foreground"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ
          </p>
        </div>

        {/* Translation */}
        <div className="text-center space-y-2">
          <p className="text-base md:text-lg text-foreground/90 font-serif italic leading-relaxed">
            &ldquo;So which of the favors of your Lord would you deny?&rdquo;
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            A reminder to reflect on countless blessings
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 text-sm',
              isPlaying
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Listen'}</span>
          </motion.button>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/guidance"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-teal text-primary-foreground font-semibold transition-all duration-200 text-sm shadow-sm hover:opacity-90"
            >
              <span>Reflect</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
