'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Compass, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { fetchActiveStreak } from '@/app/profile/queries';
import { fetchBookmarks, fetchMyReflectionsCount } from '@/app/reflections/queries';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';

export default function HomePage() {
  const { user, loading, reflectProfile } = useAuth();
  const router = useRouter();
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<number | null>(null);
  const [reflectionsCount, setReflectionsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchActiveStreak().catch(() => null),
      fetchBookmarks({ type: 'ayah', mushafId: QF_DEFAULT_MUSHAF_ID, first: 20 }).catch(() => null),
      fetchMyReflectionsCount().catch(() => 0)
    ]).then(([streakRes, bookmarksRes, count]) => {
      setStreakDays(streakRes?.data?.[0]?.days ?? 0);
      setSavedVerses(bookmarksRes?.data?.length ?? 0);
      setReflectionsCount(count ?? 0);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 py-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back,{' '}
              <span className="text-primary">
                {reflectProfile?.firstName ?? reflectProfile?.username ?? user.name}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Continue your spiritual journey with today's guidance.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            <Link
              href="/guidance"
              className="group p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
            >
              <Compass className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-bold text-foreground mb-1 text-center">Seek Guidance</h3>
              <p className="text-sm text-muted-foreground text-center">Share your moment</p>
            </Link>
            <Link
              href="/quran"
              className="group p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
            >
              <BookOpen className="w-8 h-8 text-teal mb-3 mx-auto" />
              <h3 className="font-bold text-foreground mb-1 text-center">Read Quran</h3>
              <p className="text-sm text-muted-foreground text-center">Mushaf experience</p>
            </Link>
            <Link
              href="/collections"
              className="group p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
            >
              <Sparkles className="w-8 h-8 text-accent mb-3 mx-auto" />
              <h3 className="font-bold text-foreground mb-1 text-center">Themes</h3>
              <p className="text-sm text-muted-foreground text-center">Curated collections</p>
            </Link>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{streakDays ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Heart className="w-6 h-6 text-rose mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{reflectionsCount ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Reflections</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Calendar className="w-6 h-6 text-teal mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{savedVerses ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Verses Saved</p>
            </div>
          </motion.div>

          <Link
            href="/profile"
            className="block w-full p-4 rounded-2xl bg-secondary border border-border text-center font-semibold hover:bg-secondary/80 transition-colors"
          >
            View Profile & Stats
          </Link>
        </div>
      </div>
    </main>
  );
}
