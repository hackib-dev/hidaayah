'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Droplets,
  Flower2,
  BookOpen,
  PenLine,
  Flame,
  Users
} from 'lucide-react';
import { GardenCanvas } from './components/GardenCanvas';
import { StreakDisplay } from './components/StreakDisplay';
import { loadGardenProgress, updateDailyStreak } from '@/lib/gardenTracking';
import type { UserProgress } from './types';

export default function GardenPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const loaded = loadGardenProgress();
    updateDailyStreak();
    setProgress(loaded);

    // Listen for garden updates
    const handleGardenUpdate = () => {
      setProgress(loadGardenProgress());
    };

    window.addEventListener('gardenUpdate', handleGardenUpdate);
    return () => window.removeEventListener('gardenUpdate', handleGardenUpdate);
  }, []);

  if (!progress) {
    return (
      <main className="min-h-screen pb-20 md:pb-8">
        <Navigation />
        <div className="pt-16 md:pt-20 px-4 md:px-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  const growthActivities = [
    {
      icon: Droplets,
      title: 'Reading Quran',
      description: 'Waters your garden',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Flower2,
      title: 'Completing Challenges',
      description: 'Blooms new flowers',
      color: 'text-pink-600 dark:text-pink-400'
    },
    {
      icon: BookOpen,
      title: 'Reading Tafseer',
      description: 'Adds wisdom trees',
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      icon: PenLine,
      title: 'Writing Reflections',
      description: 'Creates peaceful pathways',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Flame,
      title: 'Maintaining Streaks',
      description: 'Illuminates your garden',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: Users,
      title: 'Joining Circles',
      description: 'Expands garden regions',
      color: 'text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Your Quran Garden</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Grow Through Consistency
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every verse you recite, every challenge you complete, every reflection you write—your
              garden blooms with spiritual growth
            </p>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Total XP</span>
              </div>
              <span className="text-2xl font-bold text-primary">{progress.garden.totalXP}</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((progress.garden.totalXP % 500) / 500) * 100}%`
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-teal"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {500 - (progress.garden.totalXP % 500)} XP to level {progress.garden.level + 1}
            </p>
          </motion.div>

          {/* Streak */}
          <StreakDisplay
            currentStreak={progress.garden.currentStreak}
            longestStreak={progress.garden.longestStreak}
          />

          {/* Garden Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GardenCanvas garden={progress.garden} />
          </motion.div>

          {/* Garden Growth Info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                How Your Garden Grows
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {growthActivities.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  <div className={`p-2 rounded-lg bg-white dark:bg-black/40 ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                      {activity.title}
                    </p>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
