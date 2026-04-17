'use client';

import { Flame, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalReflections: number;
  weekProgress: boolean[];
}

export function StreakCard({
  currentStreak = 7,
  longestStreak = 21,
  totalReflections = 45,
  weekProgress = [true, true, true, true, true, false, false]
}: Partial<StreakCardProps>) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-card rounded-2xl border border-border p-4 md:p-5 space-y-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-sm md:text-base">Your Journey</h3>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-gold-muted to-rose-muted border border-accent/20"
        >
          <Flame className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-bold text-accent-foreground">{currentStreak} days</span>
        </motion.div>
      </div>

      {/* Week Progress */}
      <div className="space-y-2.5">
        <p className="text-xs text-muted-foreground font-semibold">This Week</p>
        <div className="flex items-center justify-between gap-1">
          {days.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                  weekProgress[index]
                    ? 'bg-gradient-to-br from-primary to-teal text-white shadow-sm'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {weekProgress[index] ? (
                  <Flame className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-xs font-semibold">{day}</span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  weekProgress[index] ? 'text-primary font-bold' : 'text-muted-foreground'
                )}
              >
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center text-primary mb-0.5">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg md:text-xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">Current</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-accent mb-0.5">
            <Target className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg md:text-xl font-bold text-foreground">{longestStreak}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">Best</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-violet mb-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg md:text-xl font-bold text-foreground">{totalReflections}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </motion.div>
  );
}
