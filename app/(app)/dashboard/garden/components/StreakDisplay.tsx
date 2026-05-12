'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
            Current Streak
          </span>
        </div>
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</p>
        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">days</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Best Streak
          </span>
        </div>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{longestStreak}</p>
        <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">days</p>
      </motion.div>
    </div>
  );
}
