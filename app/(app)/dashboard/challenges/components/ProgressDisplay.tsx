'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { ChallengeProgress } from '../types';

interface ProgressDisplayProps {
  progress: ChallengeProgress;
}

export function ProgressDisplay({ progress }: ProgressDisplayProps) {
  const accuracy =
    progress.totalCompleted > 0
      ? Math.round((progress.correctAnswers / progress.totalCompleted) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border border-orange-200 dark:border-orange-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Streak</span>
        </div>
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {progress.currentStreak}
        </p>
        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
          Best: {progress.longestStreak}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Accuracy
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</p>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
          {progress.correctAnswers}/{progress.totalCompleted}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Level</span>
        </div>
        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{progress.level}</p>
        <p className="text-xs text-violet-600/70 dark:text-violet-400/70 mt-1">
          {progress.totalXP} XP
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Completed</span>
        </div>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {progress.totalCompleted}
        </p>
        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Challenges</p>
      </motion.div>
    </div>
  );
}
