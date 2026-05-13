'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from 'next-themes';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Users,
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
  BadgeCheck,
  Search,
  X,
  Loader2,
  UserPlus,
  UserMinus,
  UserCheck,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStreaks } from '@/app/(app)/dashboard/profile/queries';
import {
  fetchUserFollowers,
  fetchUserFollowing,
  searchUsers,
  toggleFollowUser,
  removeFollower
} from '@/app/(app)/dashboard/profile/queries';
import { fetchBookmarks, fetchMyReflectionsCount } from '@/app/(app)/dashboard/reflections/queries';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';
import type { ReflectProfile } from '@/app/(app)/dashboard/profile/types';
import { loadGarden } from '@/lib/garden';

// ─── UserListItem ──────────────────────────────────────────────────────────────

type UserResult = ReflectProfile & { followed?: boolean; isFollowed?: boolean };

function UserListItem({
  profile,
  onFollow,
  onRemove,
  showRemove = false
}: {
  profile: UserResult;
  onFollow?: (id: string, followed: boolean) => void;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}) {
  const [following, setFollowing] = useState(profile.isFollowed ?? profile.followed ?? false);
  const [loading, setLoading] = useState(false);
  const displayName =
    `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.username || 'Unknown';

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      const res = await toggleFollowUser(profile.id);
      setFollowing(res.followed);
      onFollow?.(profile.id, res.followed);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeFollower(profile.id);
      onRemove?.(profile.id);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      {profile.avatarUrls?.small ? (
        <img
          src={profile.avatarUrls.small}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {displayName[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          {profile.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
        </div>
        {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {showRemove && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserMinus className="w-3 h-3" />
            )}
          </button>
        )}
        {!showRemove && onFollow && (
          <button
            onClick={handleToggleFollow}
            disabled={loading}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50',
              following
                ? 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : following ? (
              <>
                <UserCheck className="w-3 h-3" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" /> Follow
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── UserListModal ─────────────────────────────────────────────────────────────

function UserListModal({
  title,
  userId,
  mode,
  onClose
}: {
  title: string;
  userId: string;
  mode: 'followers' | 'following';
  onClose: () => void;
}) {
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (p: number) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res =
          mode === 'followers'
            ? await fetchUserFollowers(userId, { page: p, limit: 20 })
            : await fetchUserFollowing(userId, { page: p, limit: 20 });
        const data = res.data as UserResult[];
        setUsers((prev) => (p === 1 ? data : [...prev, ...data]));
        setHasMore(p < res.pages);
        setPage(p);
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, mode]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="text-base font-serif font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <UserListItem
                  key={u.id}
                  profile={u}
                  onFollow={
                    mode === 'following'
                      ? (id, followed) => {
                          setUsers((prev) =>
                            prev.map((p) => (p.id === id ? { ...p, followed } : p))
                          );
                        }
                      : undefined
                  }
                  showRemove={mode === 'followers'}
                  onRemove={(id) => setUsers((prev) => prev.filter((p) => p.id !== id))}
                />
              ))}
              {hasMore && (
                <div className="px-4 py-3">
                  <button
                    onClick={() => load(page + 1)}
                    disabled={loadingMore}
                    className="w-full py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SearchUsersModal ──────────────────────────────────────────────────────────

function SearchUsersModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const tid = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsers({ query: query.trim(), limit: 20, all: true });
        setResults(res.data as UserResult[]);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(tid);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="text-base font-serif font-bold text-foreground">Find People</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {searching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((u) => (
                <UserListItem
                  key={u.id}
                  profile={u}
                  onFollow={(id, followed) =>
                    setResults((prev) => prev.map((p) => (p.id === id ? { ...p, followed } : p)))
                  }
                />
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Search for people to follow</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ProfilePage ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout, reflectProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [notifications, setNotifications] = useState(true);

  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [longestStreak, setLongestStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState(true);

  const [reflectionsCount, setReflectionsCount] = useState<number | null>(null);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const gardenState = typeof window !== 'undefined' ? loadGarden() : null;

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

  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const profileId = reflectProfile?.id ?? user?.sub ?? '';

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
              {reflectProfile?.avatarUrls?.medium ? (
                <img
                  src={reflectProfile.avatarUrls.medium}
                  alt="avatar"
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl md:text-2xl font-serif font-bold shadow-sm">
                  {(reflectProfile?.firstName || user!.name)[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg md:text-xl font-serif font-bold text-foreground">
                    {reflectProfile
                      ? `${reflectProfile.firstName ?? ''} ${reflectProfile.lastName ?? ''}`.trim() ||
                        reflectProfile.username ||
                        user!.name
                      : user!.name}
                  </h1>
                  {reflectProfile?.verified && (
                    <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>

                {reflectProfile?.username && (
                  <p className="text-xs text-primary font-semibold">@{reflectProfile.username}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">{user!.email}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  title="Find people"
                >
                  <Search className="w-4 h-4" />
                </button>
                <Link
                  href="/dashboard/profile/settings"
                  className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {reflectProfile?.bio && (
              <p className="text-sm text-foreground/80 leading-relaxed">{reflectProfile.bio}</p>
            )}

            {/* Meta row — followers/following are clickable */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {reflectProfile?.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {(() => {
                    try {
                      return (
                        new Intl.DisplayNames(['en'], { type: 'region' }).of(
                          reflectProfile.country
                        ) ?? reflectProfile.country
                      );
                    } catch {
                      return reflectProfile.country;
                    }
                  })()}
                </span>
              )}
              {reflectProfile?.joiningYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {reflectProfile.joiningYear}
                </span>
              )}
              {profileId && (
                <>
                  <button
                    onClick={() => setShowFollowers(true)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    <User className="w-3 h-3" />
                    {reflectProfile?.followersCount ?? 0} followers
                  </button>
                  <button
                    onClick={() => setShowFollowing(true)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    <Users className="w-3 h-3" />
                    {reflectProfile?.postsCount !== undefined
                      ? `${reflectProfile.postsCount} posts`
                      : 'following'}
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-5 gap-2"
          >
            {[
              {
                icon: Leaf,
                value: gardenState ? `L${gardenState.level}` : '—',
                label: 'Garden',
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                iconColor: 'text-emerald-600',
                border: 'border-emerald-200/50 dark:border-emerald-800/30',
                isLoading: false,
                href: '/dashboard/garden'
              },
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
                className={cn('p-3 rounded-2xl border text-center', stat.bg, stat.border)}
              >
                {'href' in stat ? (
                  <Link href={(stat as { href: string }).href} className="block">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-xl mx-auto flex items-center justify-center mb-1.5 bg-white/50',
                        stat.iconColor
                      )}
                    >
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                    {stat.isLoading ? (
                      <div className="h-6 w-7 rounded-md bg-current/20 animate-pulse mx-auto mb-0.5" />
                    ) : (
                      <p className="text-base font-bold text-foreground">{stat.value ?? '—'}</p>
                    )}
                    <p className="text-[9px] text-muted-foreground font-semibold">{stat.label}</p>
                  </Link>
                ) : (
                  <>
                    <div
                      className={cn(
                        'w-7 h-7 rounded-xl mx-auto flex items-center justify-center mb-1.5 bg-white/50',
                        stat.iconColor
                      )}
                    >
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                    {stat.isLoading ? (
                      <div className="h-6 w-7 rounded-md bg-current/20 animate-pulse mx-auto mb-0.5" />
                    ) : (
                      <p className="text-base font-bold text-foreground">{stat.value ?? '—'}</p>
                    )}
                    <p className="text-[9px] text-muted-foreground font-semibold">{stat.label}</p>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Achievements */}
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
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
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
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
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

            {/* Recent Activity */}
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
                href="/dashboard/reflections"
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

              {/* People shortcuts */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {reflectProfile?.followersCount ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <User className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">Find</p>
                    <p className="text-xs text-muted-foreground">People</p>
                  </div>
                  <Search className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
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
                href="/dashboard/profile/settings"
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

      {/* Modals */}
      <AnimatePresence>
        {showFollowers && profileId && (
          <UserListModal
            title="Followers"
            userId={profileId}
            mode="followers"
            onClose={() => setShowFollowers(false)}
          />
        )}
        {showFollowing && profileId && (
          <UserListModal
            title="Following"
            userId={profileId}
            mode="following"
            onClose={() => setShowFollowing(false)}
          />
        )}
        {showSearch && <SearchUsersModal onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </main>
  );
}
