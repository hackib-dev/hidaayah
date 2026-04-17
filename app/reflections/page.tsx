'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyReflectPosts } from '@/app/reflections/queries';
import { fetchActiveStreak } from '@/app/profile/queries';
import type { ReflectPost } from '@/app/reflections/types/reflect-posts';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Extract a verse reference label from the post's references array
function verseLabel(post: ReflectPost): string {
  const ref = post.references?.[0];
  if (!ref) return '';
  if (ref.from === ref.to) return `${ref.chapterId}:${ref.from}`;
  return `${ref.chapterId}:${ref.from}–${ref.to}`;
}

export default function ReflectionsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ReflectPost[]>([]);
  const [total, setTotal] = useState(0);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetchMyReflectPosts({ limit: 20, page: 1 }),
      fetchActiveStreak().catch(() => null)
    ])
      .then(([postsRes, streakRes]) => {
        setPosts(postsRes.data);
        setTotal(postsRes.total);
        setStreakDays(streakRes?.data?.[0]?.days ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filterOptions = ['All', 'Reflections', 'Lessons'];

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'Reflections' && p.postType !== 1) return false;
    if (activeFilter === 'Lessons' && p.postType !== 2) return false;
    if (searchQuery && !p.body.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const groupedPosts = filteredPosts.reduce(
    (acc, post) => {
      const label = formatDate(post.createdAt);
      if (!acc[label]) acc[label] = [];
      acc[label].push(post);
      return acc;
    },
    {} as Record<string, ReflectPost[]>
  );

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-5 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Your Reflections
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              A journal of your spiritual journey - moments of guidance and growth.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-card to-teal-muted border border-teal/15 text-center">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {loading ? '—' : total}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Total</p>
            </div>
            <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-card to-gold-muted border border-accent/15 text-center">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {loading ? '—' : filteredPosts.filter((p) => p.postType === 2).length}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Lessons</p>
            </div>
            <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-card to-rose-muted border border-rose/15 text-center">
              <div className="flex items-center justify-center gap-1 text-rose">
                <Flame className="w-4 h-4" />
                <span className="text-xl md:text-2xl font-bold">{streakDays ?? '—'}</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Streak</p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <motion.button
                  key={filter}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200',
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-primary to-teal text-white shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Posts List */}
          {!loading && (
            <div className="space-y-6">
              {Object.entries(groupedPosts).map(([date, datePosts]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {date}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {datePosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        className={cn(
                          'rounded-2xl border bg-card overflow-hidden transition-all duration-200',
                          expandedId === post.id
                            ? 'border-primary/30 ring-1 ring-primary/15 shadow-sm'
                            : 'border-border'
                        )}
                      >
                        <div className="h-0.5 bg-gradient-to-r from-primary via-teal to-accent" />

                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {verseLabel(post) && (
                                  <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                    {verseLabel(post)}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-secondary text-secondary-foreground">
                                  {post.postType === 1 ? 'Reflection' : 'Lesson'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              'relative overflow-hidden transition-all duration-300',
                              expandedId !== post.id && 'max-h-16'
                            )}
                          >
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {post.body}
                            </p>
                            {expandedId !== post.id && (
                              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-semibold"
                          >
                            {expandedId === post.id ? 'Show less' : 'Read more'}
                            <ChevronDown
                              className={cn(
                                'w-3.5 h-3.5 transition-transform duration-200',
                                expandedId === post.id && 'rotate-180'
                              )}
                            />
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedId === post.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.likesCount > 0 && (
                                  <span className="ml-auto">
                                    {post.likesCount} like{post.likesCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground">No reflections found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || activeFilter !== 'All'
                  ? 'Try adjusting your filters.'
                  : 'Start by seeking guidance.'}
              </p>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  href="/guidance"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-teal text-white text-sm font-bold transition-all shadow-sm hover:opacity-90"
                >
                  <span>Seek Guidance</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
