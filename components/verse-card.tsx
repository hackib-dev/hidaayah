'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Bookmark, Share2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface VerseCardProps {
  surah: string;
  ayah: number;
  arabicText: string;
  translation: string;
  theme?: string;
  surahNumber?: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  className?: string;
}

const themeColors: Record<string, string> = {
  hope: 'bg-gold-muted text-accent',
  tawakkul: 'bg-teal-muted text-teal',
  patience: 'bg-violet-muted text-violet',
  gratitude: 'bg-gold-muted text-accent',
  peace: 'bg-teal-muted text-teal',
  strength: 'bg-rose-muted text-rose',
  default: 'bg-secondary text-secondary-foreground'
};

export function VerseCard({
  surah = 'Al-Baqarah',
  ayah = 286,
  arabicText = 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
  translation = 'Allah does not burden a soul beyond that it can bear.',
  theme = 'patience',
  isBookmarked = false,
  onBookmark,
  className
}: Partial<VerseCardProps>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const themeColor = themeColors[theme || 'default'] || themeColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 28px -4px oklch(0 0 0 / 0.10)' }}
      transition={{ duration: 0.2 }}
      className={cn('group bg-card rounded-2xl border border-border overflow-hidden', className)}
    >
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-teal to-accent" />

      <div className="p-4 md:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">
              {surah} : {ayah}
            </span>
            {theme && (
              <span
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-semibold capitalize',
                  themeColor
                )}
              >
                {theme}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleBookmark}
              className={cn(
                'p-2 rounded-xl transition-all duration-200',
                bookmarked
                  ? 'text-accent bg-gold-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Arabic Text */}
        <div className="py-4 px-4 rounded-2xl bg-teal-muted border border-primary/8">
          <p
            className="text-xl md:text-2xl text-center leading-[2.2] text-foreground"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {arabicText}
          </p>
        </div>

        {/* Translation */}
        <p className="text-sm md:text-base text-foreground/85 leading-relaxed text-center font-serif italic">
          &ldquo;{translation}&rdquo;
        </p>

        <div className="flex items-center justify-center gap-3 pt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-semibold',
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
              href={`/guidance?surah=${surah}&ayah=${ayah}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-semibold"
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
