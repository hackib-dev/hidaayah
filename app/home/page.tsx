'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Pause,
  Pencil,
  Trash2,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchActiveStreak,
  fetchTodayGoalPlanAuto,
  createGoal,
  deleteGoal,
  updateGoal,
  generateGoalEstimate
} from '@/app/profile/queries';
import type { GoalEstimateDay } from '@/app/profile/queries';
import {
  fetchBookmarks,
  fetchMyReflectionsCount,
  fetchLastReadingSession,
  fetchNotes
} from '@/app/reflections/queries';
import { fetchRandomAyah, fetchVerseAudioFiles } from '@/app/quran/queries';
import { QF_DEFAULT_MUSHAF_ID, QF_DEFAULT_RECITER_ID } from '@/config';
import type { TodayGoalPlan } from '@/app/profile/types';
import type { RandomAyah } from '@/app/reflections/types';

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
  const { user, loading, reflectProfile } = useAuth();
  const router = useRouter();

  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [savedVerses, setSavedVerses] = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState(true);

  const [reflectionsCount, setReflectionsCount] = useState<number | null>(null);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);

  const [todayPlan, setTodayPlan] = useState<TodayGoalPlan | null | undefined>(undefined);
  const [planLoading, setPlanLoading] = useState(true);
  const [goalTarget, setGoalTarget] = useState('10');
  const [goalType, setGoalType] = useState('QURAN_PAGES');
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [editTarget, setEditTarget] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(false);
  const [estimate, setEstimate] = useState<GoalEstimateDay[] | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

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
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

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

    fetchTodayGoalPlanAuto()
      .then((res) => setTodayPlan(res ?? null))
      .catch(() => setTodayPlan(null))
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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-border border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  const displayName = reflectProfile?.firstName ?? reflectProfile?.username ?? user.name;

  // Derive progress/target/label from the actual API response fields
  const goalInfo = todayPlan
    ? (() => {
        if (todayPlan.dailyTargetPages) {
          return {
            progress: todayPlan.pagesRead,
            target: todayPlan.dailyTargetPages,
            label: 'pages'
          };
        }
        if (todayPlan.dailyTargetSeconds) {
          return {
            progress: Math.round(todayPlan.secondsRead / 60),
            target: Math.round(todayPlan.dailyTargetSeconds / 60),
            label: 'min'
          };
        }
        if (todayPlan.dailyTargetVerses) {
          return {
            progress: todayPlan.versesRead,
            target: todayPlan.dailyTargetVerses,
            label: 'verses'
          };
        }
        return null;
      })()
    : null;

  const goalPct = goalInfo
    ? Math.min(100, Math.round((goalInfo.progress / goalInfo.target) * 100))
    : 0;
  const goalDone = goalInfo ? goalInfo.progress >= goalInfo.target : false;

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

          {/* Today's Goal Plan */}
          {/* <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {planLoading ? (
              <CardSkeleton rows={3} />
            ) : todayPlan ? (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-foreground">Today&apos;s Goal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {goalDone ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : goalInfo ? (
                      <span className="text-xs text-muted-foreground">
                        {goalInfo.progress} / {goalInfo.target} {goalInfo.label}
                      </span>
                    ) : null}
                    <button
                      disabled={refreshingPlan}
                      onClick={async () => {
                        setRefreshingPlan(true);
                        try {
                          const refreshed = await fetchTodayGoalPlanAuto();
                          setTodayPlan(refreshed);
                        } finally {
                          setRefreshingPlan(false);
                        }
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                      title="Refresh progress"
                    >
                      {refreshingPlan ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 -rotate-90" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditTarget(String(goalInfo?.target ?? ''));
                        setEditingGoal(true);
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                      title="Edit goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={deletingGoal}
                      onClick={async () => {
                        setDeletingGoal(true);
                        try {
                          await deleteGoal(todayPlan.id, 'QURAN');
                          setTodayPlan(null);
                        } finally {
                          setDeletingGoal(false);
                        }
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete goal"
                    >
                      {deletingGoal ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {editingGoal && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      disabled={savingEdit || !editTarget || Number(editTarget) < 1}
                      onClick={async () => {
                        setSavingEdit(true);
                        try {
                          const derivedType = todayPlan.dailyTargetPages
                            ? 'QURAN_PAGES'
                            : todayPlan.dailyTargetSeconds
                              ? 'QURAN_TIME'
                              : 'QURAN_RANGE';
                          await updateGoal(todayPlan.id, {
                            type: derivedType,
                            amount: Number(editTarget),
                            category: 'QURAN'
                          });
                          const refreshed = await fetchTodayGoalPlanAuto();
                          setTodayPlan(refreshed);
                          setEditingGoal(false);
                        } finally {
                          setSavingEdit(false);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingGoal(false)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>

                {!goalDone && todayPlan.ranges?.[0] && (
                  <Link
                    href={`/quran?chapter=${todayPlan.ranges[0].chapterId}&verse=${todayPlan.ranges[0].from}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Continue — {todayPlan.ranges[0].verseFrom}
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-foreground">Set a daily goal</span>
                </div>
                <select
                  value={goalType}
                  onChange={(e) => {
                    setGoalType(e.target.value);
                    setEstimate(null);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {[
                    { value: 'QURAN_PAGES', label: 'Pages per day' },
                    { value: 'QURAN_TIME', label: 'Minutes per day' },
                    { value: 'QURAN_RANGE', label: 'Verse range' },
                    { value: 'QURAN_READING_PROGRAM', label: 'Reading program' },
                    { value: 'RAMADAN_CHALLENGE', label: 'Ramadan challenge' }
                  ].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={goalTarget}
                    onChange={(e) => {
                      setGoalTarget(e.target.value);
                      setEstimate(null);
                    }}
                    placeholder={goalType === 'QURAN_TIME' ? 'Minutes' : 'Amount'}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    disabled={estimateLoading || !goalTarget || Number(goalTarget) < 1}
                    onClick={async () => {
                      setEstimateLoading(true);
                      try {
                        const result = await generateGoalEstimate({
                          type: goalType,
                          amount: Number(goalTarget),
                          mushafId: 1
                        });
                        setEstimate(result);
                      } finally {
                        setEstimateLoading(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {estimateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Preview'}
                  </button>
                  <button
                    disabled={creatingGoal || !goalTarget || Number(goalTarget) < 1}
                    onClick={async () => {
                      setCreatingGoal(true);
                      try {
                        await createGoal({
                          type: goalType,
                          amount: Number(goalTarget),
                          category: 'QURAN'
                        });
                        const plan = await fetchTodayGoalPlanAuto();
                        setTodayPlan(plan);
                        setEstimate(null);
                      } finally {
                        setCreatingGoal(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {creatingGoal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save
                  </button>
                </div>
                {estimate && estimate.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Weekly preview
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                      {estimate.map((day) => (
                        <div key={day.date} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                          </span>
                          <div className="w-full rounded bg-emerald-600/15 text-center py-1">
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                              {day.amount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div> */}

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
                href={`/quran?verse=${lastVerse}`}
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
                      href={`/quran?verse=${randomAyah.verse_key}`}
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
              href="/guidance"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Seek Guidance</p>
                <p className="text-xs text-muted-foreground">Share your moment</p>
              </div>
            </Link>
            <Link
              href="/quran"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Read Quran</p>
                <p className="text-xs text-muted-foreground">Mushaf experience</p>
              </div>
            </Link>
            <Link
              href="/reflections"
              className="p-4 rounded-xl bg-card border border-border hover:bg-secondary/40 transition-colors flex items-center gap-3"
            >
              <Heart className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Reflections</p>
                <p className="text-xs text-muted-foreground">Your journal</p>
              </div>
            </Link>
            <Link
              href="/collections"
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
                href="/reflections"
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
            href="/profile"
            className="block w-full p-3.5 rounded-xl border border-border text-center text-sm font-semibold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors"
          >
            View full profile & stats
          </Link>
        </div>
      </div>
    </main>
  );
}
