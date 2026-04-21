'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from 'next-themes';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  BookOpen,
  Calendar,
  Award,
  Target,
  Clock,
  Bookmark as BookmarkIcon,
  LogOut,
  Flame,
  MapPin,
  BadgeCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchStreaks } from '@/app/profile/queries';
import { fetchBookmarks, fetchMyReflectionsCount } from '@/app/reflections/queries';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';

export default function ProfilePage() {
  const { user, loading, logout, reflectProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [notifications, setNotifications] = useState(true);

  // Real stats — each loads independently
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [longestStreak, setLongestStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState(true);

  const [reflectionsCount, setReflectionsCount] = useState<number | null>(null);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    fetchStreaks({ sortOrder: 'desc', orderBy: 'days', first: 20 })
      .then((res) => {
        const streaks = res?.data ?? [];
        const active = streaks.find((s) => s.status === 'ACTIVE');
        setCurrentStreak(active?.days ?? 0);
        setLongestStreak(streaks[0]?.days ?? 0);
      })
      .catch(() => {
        setCurrentStreak(0);
        setLongestStreak(0);
      })
      .finally(() => setStreakLoading(false));

    fetchBookmarks({ type: 'ayah', mushafId: QF_DEFAULT_MUSHAF_ID, first: 1 })
      .then((res) => setSavedCount(res?.data?.length ?? 0))
      .catch(() => setSavedCount(0))
      .finally(() => setSavedLoading(false));

    fetchMyReflectionsCount()
      .then((count) => setReflectionsCount(count ?? 0))
      .catch(() => setReflectionsCount(0))
      .finally(() => setReflectionsLoading(false));
  }, [user]);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-5 py-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-5 rounded-2xl bg-teal-muted border border-teal/15 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {reflectProfile?.avatarUrls?.medium ? (
                <img
                  src={reflectProfile.avatarUrls.medium}
                  alt="avatar"
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl md:text-2xl font-serif font-bold shadow-sm">
                  {(reflectProfile?.firstName || user.name)[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Name + verified badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg md:text-xl font-serif font-bold text-foreground">
                    {reflectProfile
                      ? `${reflectProfile.firstName ?? ''} ${reflectProfile.lastName ?? ''}`.trim() ||
                        reflectProfile.username ||
                        user.name
                      : user.name}
                  </h1>
                  {reflectProfile?.verified && (
                    <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Username */}
                {reflectProfile?.username && (
                  <p className="text-xs text-primary font-semibold">@{reflectProfile.username}</p>
                )}

                {/* Email */}
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>

              <Link
                href="/profile/settings"
                className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex-shrink-0"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            {/* Bio */}
            {reflectProfile?.bio && (
              <p className="text-sm text-foreground/80 leading-relaxed">{reflectProfile.bio}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {reflectProfile?.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {reflectProfile.country}
                </span>
              )}
              {reflectProfile?.joiningYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {reflectProfile.joiningYear}
                </span>
              )}
              {reflectProfile?.followersCount !== undefined && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {reflectProfile.followersCount} follower
                  {reflectProfile.followersCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-4 gap-2.5"
          >
            {[
              {
                icon: Flame,
                value: currentStreak,
                label: 'Streak',
                bg: 'bg-rose-muted',
                iconColor: 'text-rose',
                border: 'border-rose/15',
                isLoading: streakLoading
              },
              {
                icon: BookOpen,
                value: reflectionsCount,
                label: 'Reflections',
                bg: 'bg-gold-muted',
                iconColor: 'text-accent',
                border: 'border-accent/15',
                isLoading: reflectionsLoading
              },
              {
                icon: BookmarkIcon,
                value: savedCount,
                label: 'Saved',
                bg: 'bg-teal-muted',
                iconColor: 'text-teal',
                border: 'border-teal/15',
                isLoading: savedLoading
              },
              {
                icon: Target,
                value: longestStreak,
                label: 'Best',
                bg: 'bg-violet-muted',
                iconColor: 'text-violet',
                border: 'border-violet/15',
                isLoading: streakLoading
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06 }}
                className={cn('p-3 md:p-4 rounded-2xl border text-center', stat.bg, stat.border)}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl mx-auto flex items-center justify-center mb-2 bg-white/50',
                    stat.iconColor
                  )}
                >
                  <stat.icon className="w-4 h-4" />
                </div>
                {stat.isLoading ? (
                  <div className="h-7 w-8 rounded-md bg-current/20 animate-pulse mx-auto mb-0.5" />
                ) : (
                  <p className="text-lg md:text-xl font-bold text-foreground">
                    {stat.value ?? '—'}
                  </p>
                )}
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Achievements — derived from real stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                Milestones
              </h2>
              <div className="space-y-2">
                {[
                  {
                    id: 'first-reflection',
                    title: 'First Reflection',
                    description: 'Wrote your first reflection',
                    earned: (reflectionsCount ?? 0) >= 1,
                    Icon: BookOpen,
                    earnedColor: 'bg-teal-muted text-teal'
                  },
                  {
                    id: 'week-streak',
                    title: 'Week Warrior',
                    description: '7-day reading streak',
                    earned: (longestStreak ?? 0) >= 7,
                    Icon: Flame,
                    earnedColor: 'bg-gold-muted text-accent'
                  },
                  {
                    id: 'month-streak',
                    title: 'Month Master',
                    description: '30-day reading streak',
                    earned: (longestStreak ?? 0) >= 30,
                    Icon: Award,
                    earnedColor: 'bg-violet-muted text-violet'
                  },
                  {
                    id: 'deep-thinker',
                    title: 'Deep Thinker',
                    description: '50 total reflections',
                    earned: (reflectionsCount ?? 0) >= 50,
                    Icon: Target,
                    earnedColor: 'bg-rose-muted text-rose'
                  }
                ].map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + index * 0.06 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      m.earned ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        m.earned ? m.earnedColor : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      <m.Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-bold text-sm',
                          m.earned ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {m.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                    </div>
                    {m.earned && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Reflections — link to the reflections page */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Activity
              </h2>
              <Link
                href="/reflections"
                className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {reflectionsCount === null ? '—' : reflectionsCount} reflection
                    {reflectionsCount !== 1 ? 's' : ''} total
                  </p>
                  <p className="text-xs text-muted-foreground">View your full journal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </motion.div>
          </div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-bold text-foreground">Settings</h2>
            <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-violet" />
                  ) : (
                    <Sun className="w-4 h-4 text-accent" />
                  )}
                  <div>
                    <p className="font-bold text-foreground text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Switch to {isDarkMode ? 'light' : 'dark'} theme
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors duration-200',
                    isDarkMode ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <motion.div
                    animate={{ x: isDarkMode ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  />
                </motion.button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-teal" />
                  <div>
                    <p className="font-bold text-foreground text-sm">Daily Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded to reflect</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors duration-200',
                    notifications ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <motion.div
                    animate={{ x: notifications ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  />
                </motion.button>
              </div>

              {/* Account Settings */}
              <Link
                href="/profile/settings"
                className="flex items-center justify-between p-3.5 w-full hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-bold text-foreground text-sm">Account Settings</p>
                    <p className="text-xs text-muted-foreground">Manage your account details</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              {/* Sign Out */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  logout();
                  router.replace('/');
                }}
                className="flex items-center gap-3 p-3.5 w-full text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold text-sm">Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
