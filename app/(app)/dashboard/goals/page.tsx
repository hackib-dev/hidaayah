'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { motion } from 'framer-motion';
import {
  Target,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Check,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchTodayGoalPlan,
  createGoal,
  deleteGoal,
  updateGoal,
  generateGoalEstimate
} from '@/app/(app)/dashboard/profile/queries';
import type { GoalEstimateDay } from '@/app/(app)/dashboard/profile/queries';
import type { TodayGoalPlan } from '@/app/(app)/dashboard/profile/types';

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="h-3 w-1/3 rounded bg-border animate-pulse" />
      <div className="h-1.5 rounded-full bg-border animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-border animate-pulse" />
    </div>
  );
}

const GOAL_TYPES = [
  { value: 'QURAN_PAGES', label: 'Pages per day' },
  { value: 'QURAN_TIME', label: 'Minutes per day' },
  { value: 'QURAN_RANGE', label: 'Verse range' }
];

export default function GoalsPage() {
  const { user } = useAuth();

  const [plans, setPlans] = useState<TodayGoalPlan[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(3); // counts pending fetches

  const [addingGoal, setAddingGoal] = useState(false);
  const [goalType, setGoalType] = useState('QURAN_PAGES');
  const [goalTarget, setGoalTarget] = useState('10');
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [estimate, setEstimate] = useState<GoalEstimateDay[] | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const RANGE_RE = /^\d+:\d+-\d+:\d+$/;
  const rangeValid = goalType !== 'QURAN_RANGE' || RANGE_RE.test(goalTarget.replace(/\s/g, ''));

  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const GOAL_TYPES = ['QURAN_PAGES', 'QURAN_TIME', 'QURAN_RANGE'] as const;
    setLoadingTypes(GOAL_TYPES.length);
    setPlans([]);
    GOAL_TYPES.forEach((type) => {
      fetchTodayGoalPlan(type)
        .then((plan) => {
          if (plan) {
            setPlans((prev) => {
              if (prev.some((p) => p.goalId === plan.goalId)) return prev;
              return [...prev, { ...plan, goalType: type }];
            });
          }
        })
        .catch(() => null)
        .finally(() => setLoadingTypes((n) => n - 1));
    });
  }, [user]);

  const goalInfoFor = (plan: TodayGoalPlan) => {
    // progress field semantics differ by type:
    //   QURAN_PAGES  → progress = pages read
    //   QURAN_TIME   → progress = minutes read
    //   QURAN_RANGE  → progress = 0 (useless); use remainingDailyTargetRanges overlap instead

    if (plan.goalType === 'QURAN_PAGES' && plan.dailyTargetPages) {
      const pagesRead = plan.pagesRead;
      const pct = Math.min(100, Math.round((pagesRead / plan.dailyTargetPages) * 100));
      return {
        progressMin: Math.round(pagesRead * 10) / 10,
        targetMin: plan.dailyTargetPages,
        pct,
        label: 'pages',
        isRange: false
      };
    }

    if (plan.goalType === 'QURAN_TIME' && plan.dailyTargetSeconds) {
      const minutesRead = plan.secondsRead / 60;
      const targetMin = plan.dailyTargetSeconds / 60;
      const pct = Math.min(100, Math.round((minutesRead / targetMin) * 100));
      return {
        progressMin: Math.round(minutesRead * 10) / 10,
        targetMin: Math.round(targetMin),
        pct,
        label: 'min',
        isRange: false
      };
    }

    if (plan.goalType === 'QURAN_RANGE') {
      const targets = plan.dailyTargetRanges ?? [];
      const readRanges = plan.ranges ?? [];

      const toNum = (vk: string) => {
        const [ch, v] = vk.split(':').map(Number);
        return ch * 10000 + v;
      };
      const parseRange = (r: string) => {
        const [from, to] = r.split('-');
        return { from: toNum(from), to: toNum(to ?? from) };
      };

      const parsedRead = readRanges.map(parseRange);

      // For each target range, count how many of its verses were actually read
      let totalVerses = 0;
      let readVerses = 0;
      for (const t of targets) {
        const target = parseRange(t);
        const tSize = target.to - target.from + 1;
        totalVerses += tSize;
        for (const rr of parsedRead) {
          const overlapFrom = Math.max(rr.from, target.from);
          const overlapTo = Math.min(rr.to, target.to);
          if (overlapFrom <= overlapTo) readVerses += overlapTo - overlapFrom + 1;
        }
      }
      // Cap at target size (can't read more than 100% of target)
      readVerses = Math.min(readVerses, totalVerses);

      const doneCount = targets.filter((t) => {
        const target = parseRange(t);
        // A target is done if all its verses are covered by read ranges
        let covered = 0;
        for (const rr of parsedRead) {
          const overlapFrom = Math.max(rr.from, target.from);
          const overlapTo = Math.min(rr.to, target.to);
          if (overlapFrom <= overlapTo) covered += overlapTo - overlapFrom + 1;
        }
        return covered >= target.to - target.from + 1;
      }).length;
      const total = targets.length;
      const pct = totalVerses > 0 ? Math.min(100, Math.round((readVerses / totalVerses) * 100)) : 0;
      return { pct, label: 'ranges', isRange: true, progressMin: doneCount, targetMin: total };
    }

    return null;
  };

  const refreshAll = async (currentPlans = plans) => {
    const TYPES = ['QURAN_PAGES', 'QURAN_TIME', 'QURAN_RANGE'] as const;
    const results = await Promise.all(
      TYPES.map((type) =>
        fetchTodayGoalPlan(type)
          .then((plan) => (plan ? { ...plan, goalType: type } : null))
          .catch(() => null)
      )
    );
    const seen = new Set<string>();
    const updated: TodayGoalPlan[] = [];
    for (const p of results) {
      if (!p || seen.has(p.goalId)) continue;
      seen.add(p.goalId);
      updated.push(p as TodayGoalPlan);
    }
    setPlans(updated);
  };

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <Navigation />
      <div className="pt-16 md:pt-16 lg:pt-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto space-y-5 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Today
            </p>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
              My Goals
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            {loadingTypes > 0 && plans.length === 0 && (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}

            {loadingTypes === 0 && plans.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
                <Target className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-foreground">No goals yet</p>
                <p className="text-xs text-muted-foreground">
                  Set a daily reading goal to track your progress
                </p>
              </div>
            )}

            {plans.map((plan) => {
              const info = goalInfoFor(plan);
              const pct = info?.pct ?? 0;
              const done = pct >= 100;
              const isEditing = editingGoalId === plan.goalId;
              const isDeleting = deletingGoalId === plan.goalId;
              const isRefreshing = refreshingId === plan.goalId;
              const typeLabel =
                plan.goalType === 'QURAN_TIME'
                  ? 'Time goal'
                  : plan.goalType === 'QURAN_RANGE'
                    ? 'Range goal'
                    : 'Pages goal';

              return (
                <div
                  key={plan.goalId}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {done ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : info ? (
                        <span className="text-xs text-muted-foreground">
                          {`${info.progressMin} / ${info.targetMin} ${info.label} · ${pct}%`}
                        </span>
                      ) : null}
                      <button
                        disabled={isRefreshing}
                        onClick={async () => {
                          setRefreshingId(plan.goalId);
                          try {
                            await refreshAll(plans);
                          } finally {
                            setRefreshingId(null);
                          }
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                        title="Refresh"
                      >
                        {isRefreshing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 -rotate-90" />
                        )}
                      </button>
                      {!info?.isRange && (
                        <button
                          onClick={() => {
                            setEditTarget(String(info?.targetMin ?? ''));
                            setEditingGoalId(plan.goalId);
                          }}
                          className="p-1 rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                          title="Edit goal"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        disabled={isDeleting}
                        onClick={async () => {
                          setDeletingGoalId(plan.goalId);
                          try {
                            await deleteGoal(plan.goalId, 'QURAN');
                            setPlans((prev) => prev.filter((p) => p.goalId !== plan.goalId));
                          } finally {
                            setDeletingGoalId(null);
                          }
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete goal"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        max={plan.goalType === 'QURAN_TIME' ? 480 : 604}
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        placeholder={plan.goalType === 'QURAN_TIME' ? 'Minutes/day' : 'Pages/day'}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                      <button
                        disabled={savingEdit || !editTarget || Number(editTarget) < 1}
                        onClick={async () => {
                          setSavingEdit(true);
                          try {
                            const amt =
                              plan.goalType === 'QURAN_TIME'
                                ? Number(editTarget) * 60
                                : Number(editTarget);
                            await updateGoal(plan.goalId, {
                              type: plan.goalType,
                              amount: amt,
                              category: 'QURAN'
                            });
                            await refreshAll(plans);
                            setEditingGoalId(null);
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
                        onClick={() => setEditingGoalId(null)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {plan.goalType === 'QURAN_RANGE' && plan.dailyTargetRanges?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {plan.dailyTargetRanges.map((r) => {
                          const toNum2 = (vk: string) => {
                            const [ch, v] = vk.split(':').map(Number);
                            return ch * 10000 + v;
                          };
                          const [rFrom, rTo] = r.split('-').map(toNum2);
                          const tSize = rTo - rFrom + 1;
                          let covered = 0;
                          for (const read of plan.ranges ?? []) {
                            const [readFrom, readTo] = read.split('-').map(toNum2);
                            const oFrom = Math.max(readFrom, rFrom);
                            const oTo = Math.min(readTo, rTo);
                            if (oFrom <= oTo) covered += oTo - oFrom + 1;
                          }
                          const isDone = covered >= tSize;
                          return (
                            <Link
                              key={r}
                              href={`/dashboard/quran?verse=${r.split('-')[0]}`}
                              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                                isDone
                                  ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {r}
                            </Link>
                          );
                        })}
                      </div>
                      {plan.versesRead > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {plan.versesRead} verses read · {Math.round(plan.secondsRead / 60)}m
                        </p>
                      )}
                    </div>
                  )}

                  {!done && plan.remainingDailyTargetRanges?.[0] && (
                    <Link
                      href={`/dashboard/quran?verse=${plan.remainingDailyTargetRanges[0].split('-')[0]}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Continue reading
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Add goal form / button */}
            {!addingGoal ? (
              <button
                onClick={() => setAddingGoal(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-emerald-600 hover:border-emerald-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add a goal
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-foreground">New goal</span>
                  </div>
                  <button
                    onClick={() => {
                      setAddingGoal(false);
                      setEstimate(null);
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <select
                  value={goalType}
                  onChange={(e) => {
                    setGoalType(e.target.value);
                    setGoalTarget(e.target.value === 'QURAN_RANGE' ? '' : '10');
                    setEstimate(null);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {GOAL_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {goalType === 'QURAN_RANGE' && (
                  <p className="text-[11px] text-muted-foreground">
                    Format: <span className="font-mono">surah:verse-surah:verse</span> — e.g.{' '}
                    <span className="font-mono">2:1-2:50</span>
                  </p>
                )}
                <div className="flex gap-2">
                  {goalType === 'QURAN_RANGE' ? (
                    <input
                      type="text"
                      value={goalTarget}
                      onChange={(e) => {
                        setGoalTarget(e.target.value);
                        setEstimate(null);
                      }}
                      placeholder="e.g. 2:1-2:50"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={goalType === 'QURAN_TIME' ? 480 : 604}
                      value={goalTarget}
                      onChange={(e) => {
                        setGoalTarget(e.target.value);
                        setEstimate(null);
                      }}
                      placeholder={goalType === 'QURAN_TIME' ? 'Minutes/day' : 'Pages/day'}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  )}
                  <button
                    disabled={estimateLoading || !goalTarget || !rangeValid}
                    onClick={async () => {
                      setEstimateLoading(true);
                      try {
                        const amount =
                          goalType === 'QURAN_TIME'
                            ? Number(goalTarget) * 60
                            : goalType === 'QURAN_RANGE'
                              ? goalTarget.replace(/\s/g, '')
                              : Number(goalTarget);
                        const result = await generateGoalEstimate({
                          type: goalType,
                          amount,
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
                    disabled={creatingGoal || !goalTarget || !rangeValid}
                    onClick={async () => {
                      setCreatingGoal(true);
                      try {
                        const amount =
                          goalType === 'QURAN_TIME'
                            ? Number(goalTarget) * 60
                            : goalType === 'QURAN_RANGE'
                              ? goalTarget.replace(/\s/g, '')
                              : Number(goalTarget);
                        await createGoal({ type: goalType, amount, category: 'QURAN' });
                        await refreshAll(plans);
                        setEstimate(null);
                        setAddingGoal(false);
                        setGoalTarget('10');
                        setGoalType('QURAN_PAGES');
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
          </motion.div>
        </div>
      </div>
    </main>
  );
}
