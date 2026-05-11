'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  BookOpen,
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  MapPin,
  FileText,
  CheckCircle2,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import Link from 'next/link';
import { fetchActiveStreak, fetchAllTodayGoalPlans } from '@/app/(app)/dashboard/profile/queries';
import {
  fetchBookmarks,
  fetchMyReflectionsCount,
  fetchLastReadingSession,
  fetchNotes
} from '@/app/(app)/dashboard/reflections/queries';
import { fetchRandomAyah, fetchVerseAudioFiles } from '@/app/(app)/dashboard/quran/queries';
import { QF_DEFAULT_MUSHAF_ID, QF_DEFAULT_RECITER_ID } from '@/config';
import type { TodayGoalPlan } from '@/app/(app)/dashboard/profile/types';
import type { RandomAyah } from '@/app/(app)/dashboard/reflections/types';

function StatSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border text-center">
      <div className="w-4 h-4 rounded-full bg-border animate-pulse mx-auto mb-2" />
      <div className="h-6 w-8 rounded bg-border animate-pulse mx-auto mb-1" />
      <div className="h-2.5 w-14 rounded bg-border animate-pulse mx-auto mt-1" />
    </div>
  );
}

function CardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded bg-border animate-pulse ${i === 0 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user, reflectProfile } = useAuth();

  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [savedVerses, setSavedVerses] = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState(true);

  const [reflectionsCount, setReflectionsCount] = useState<number | null>(null);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);

  const [todayPlans, setTodayPlans] = useState<TodayGoalPlan[]>([]);
  const [planLoading, setPlanLoading] = useState(true);

  const [lastVerse, setLastVerse] = useState<string | null | undefined>(undefined);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [notesCount, setNotesCount] = useState<number | null>(null);
  const [notesLoading, setNotesLoading] = useState(true);

  const [randomAyah, setRandomAyah] = useState<RandomAyah | null>(null);
  const [ayahLoading, setAyahLoading] = useState(true);
  const [ayahPlaying, setAyahPlaying] = useState(false);
  const [ayahAudioLoading, setAyahAudioLoading] = useState(false);
  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchActiveStreak()
      .then((res) => setStreakDays(res?.data?.[0]?.days ?? 0))
      .catch(() => setStreakDays(0))
      .finally(() => setStreakLoading(false));

    fetchBookmarks({ type: 'ayah', mushafId: QF_DEFAULT_MUSHAF_ID, first: 1 })
      .then((res) =>
        setSavedVerses(
          res?.pagination
            ? ((res as { pagination: { total_records?: number } }).pagination.total_records ??
                res.data?.length ??
                0)
            : 0
        )
      )
      .catch(() => setSavedVerses(0))
      .finally(() => setSavedLoading(false));

    fetchMyReflectionsCount()
      .then((count) => setReflectionsCount(count ?? 0))
      .catch(() => setReflectionsCount(0))
      .finally(() => setReflectionsLoading(false));

    fetchAllTodayGoalPlans()
      .then((plans) => setTodayPlans(plans))
      .catch(() => setTodayPlans([]))
      .finally(() => setPlanLoading(false));

    fetchLastReadingSession()
      .then((session) => setLastVerse(session?.verseFrom ?? null))
      .catch(() => setLastVerse(null))
      .finally(() => setSessionLoading(false));

    fetchNotes({ limit: 50 })
      .then((res) => setNotesCount(res?.data?.length ?? 0))
      .catch(() => setNotesCount(0))
      .finally(() => setNotesLoading(false));

    fetchRandomAyah()
      .then((res) => setRandomAyah(res?.verse ?? null))
      .catch(() => setRandomAyah(null))
      .finally(() => setAyahLoading(false));
  }, [user]);

  const displayName = reflectProfile?.firstName ?? reflectProfile?.username ?? user!.name;

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto space-y-5 py-6">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Assalamu Alaykum
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              {displayName}
            </h1>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3"
          >
            {streakLoading ? (
              <StatSkeleton />
            ) : (
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground font-serif">{streakDays ?? 0}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Day streak</p>
              </div>
            )}

            {reflectionsLoading ? (
              <StatSkeleton />
            ) : (
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Heart className="w-4 h-4 text-emerald-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground font-serif">
                  {reflectionsCount ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reflections</p>
              </div>
            )}

            {savedLoading ? (
              <StatSkeleton />
            ) : (
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Sparkles className="w-4 h-4 text-emerald-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground font-serif">{savedVerses ?? 0}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Saved verses</p>
              </div>
            )}
          </motion.div>

          {/* Today's Goals — compact summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {planLoading ? (
              <CardSkeleton rows={2} />
            ) : (
              <Link
                href="/dashboard/goals"
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Today&apos;s Goals</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {todayPlans.length === 0
                        ? 'No goals yet — tap to set one'
                        : (() => {
                            const done = todayPlans.filter((p) => p.progress >= 1).length;
                            return done === todayPlans.length
                              ? `All ${todayPlans.length} goal${todayPlans.length !== 1 ? 's' : ''} complete`
                              : `${done} / ${todayPlans.length} complete`;
                          })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {todayPlans.length > 0 &&
                    todayPlans.filter((p) => p.progress >= 1).length === todayPlans.length && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            )}
          </motion.div>

          {/* Resume Reading */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
          >
            {sessionLoading ? (
              <CardSkeleton rows={2} />
            ) : lastVerse ? (
              <Link
                href={`/dashboard/quran?verse=${lastVerse}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Resume reading</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last at {lastVerse}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ) : null}
          </motion.div>

          {/* Random Ayah */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            {ayahLoading ? (
              <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : randomAyah ? (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Verse of the moment
                </p>
                <p
                  className="text-xl text-right leading-loose text-foreground"
                  style={{ fontFamily: 'QPCHafs, var(--font-arabic)' }}
                >
                  {randomAyah.text_uthmani}
                </p>
                {randomAyah.translations?.[0] && (
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    &ldquo;{randomAyah.translations[0].text}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {randomAyah.verse_key}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        if (ayahPlaying) {
                          ayahAudioRef.current?.pause();
                          setAyahPlaying(false);
                          return;
                        }
                        if (ayahAudioRef.current) {
                          ayahAudioRef.current.play();
                          setAyahPlaying(true);
                          return;
                        }
                        setAyahAudioLoading(true);
                        try {
                          const [chapter] = randomAyah.verse_key.split(':');
                          const files = await fetchVerseAudioFiles(
                            QF_DEFAULT_RECITER_ID,
                            parseInt(chapter, 10)
                          );
                          const file = files.find((f) => f.verse_key === randomAyah.verse_key);
                          if (!file) return;
                          const audio = new Audio(file.url);
                          ayahAudioRef.current = audio;
                          audio.onended = () => setAyahPlaying(false);
                          audio.play();
                          setAyahPlaying(true);
                        } finally {
                          setAyahAudioLoading(false);
                        }
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 transition-colors text-xs font-semibold"
                    >
                      {ayahAudioLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : ayahPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      {ayahPlaying ? 'Pause' : 'Play'}
                    </button>
                    <Link
                      href={`/dashboard/quran?verse=${randomAyah.verse_key}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Read in context →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="grid grid-cols-2 gap-3"
          >
            <Link
              href="/dashboard/guidance"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Seek Guidance</p>
                <p className="text-xs text-muted-foreground">Share your moment</p>
              </div>
            </Link>
            <Link
              href="/dashboard/quran"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Read Quran</p>
                <p className="text-xs text-muted-foreground">Mushaf experience</p>
              </div>
            </Link>
            <Link
              href="/dashboard/reflections"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <Heart className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Reflections</p>
                <p className="text-xs text-muted-foreground">Your journal</p>
              </div>
            </Link>
            <Link
              href="/dashboard/collections"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Collections</p>
                <p className="text-xs text-muted-foreground">Curated themes</p>
              </div>
            </Link>
          </motion.div>

          {/* Notes teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            {notesLoading ? (
              <CardSkeleton rows={2} />
            ) : (
              <Link
                href="/dashboard/reflections"
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Your Notes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(notesCount ?? 0) > 0
                        ? `${notesCount} note${notesCount !== 1 ? 's' : ''} on verses`
                        : 'No notes yet — add one while reading'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}
          </motion.div>

          <Link
            href="/dashboard/profile"
            className="block w-full p-3.5 rounded-xl border border-border text-center text-sm font-semibold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors"
          >
            View full profile & stats
          </Link>
        </div>
      </div>
    </main>
  );
}
