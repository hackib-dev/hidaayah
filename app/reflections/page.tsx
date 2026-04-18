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
  Flame,
  Plus,
  X,
  Loader2,
  Pencil,
  Heart,
  MessageCircle,
  Eye,
  Globe,
  Lock,
  Bookmark,
  Trash2,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchMyReflectPosts,
  togglePostLike,
  togglePostSave,
  deletePost,
  editPost,
  trackPostView
} from '@/app/reflections/queries';
import { fetchActiveStreak } from '@/app/profile/queries';
import { reflectApi } from '@/app/apiService/quranFoundationService';
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
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // New post form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBody, setNewBody] = useState('');
  const [newVerseRef, setNewVerseRef] = useState('');
  const [newDraft, setNewDraft] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editDraft, setEditDraft] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Per-post action state
  const [likingId, setLikingId] = useState<string | number | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetchMyReflectPosts({ limit: 20, page: 1 }).catch(() => null),
      fetchActiveStreak().catch(() => null)
    ])
      .then(([postsRes, streakRes]) => {
        setPosts(postsRes?.data ?? []);
        setTotal(postsRes?.total ?? 0);
        setStreakDays(streakRes?.data?.[0]?.days ?? 0);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Track view when a post is expanded
  useEffect(() => {
    if (expandedId !== null) trackPostView(expandedId);
  }, [expandedId]);

  const handleSaveNew = async () => {
    if (newBody.trim().length < 6 || saving) return;
    setSaving(true);

    const references: { chapterId: number; from: number; to: number }[] = [];
    const refMatch = newVerseRef.trim().match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (refMatch) {
      references.push({
        chapterId: parseInt(refMatch[1], 10),
        from: parseInt(refMatch[2], 10),
        to: parseInt(refMatch[3] ?? refMatch[2], 10)
      });
    }

    try {
      const res = await reflectApi.post<{ data: ReflectPost }>('/v1/posts', {
        post: {
          body: newBody.trim(),
          roomPostStatus: 1,
          draft: newDraft,
          references,
          mentions: []
        }
      });
      const created = res.data?.data;
      if (created) {
        setPosts((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
      }
      setNewBody('');
      setNewVerseRef('');
      setNewDraft(false);
      setShowNewForm(false);
    } catch {
      // user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (post: ReflectPost) => {
    if (likingId === post.id) return;
    setLikingId(post.id);
    try {
      await togglePostLike(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
              }
            : p
        )
      );
    } catch {
      // ignore
    } finally {
      setLikingId(null);
    }
  };

  const handleSavePost = async (post: ReflectPost) => {
    if (savingId === post.id) return;
    setSavingId(post.id);
    try {
      await togglePostSave(post.id);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, isSaved: !p.isSaved } : p)));
    } catch {
      // ignore
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (postId: string | number) => {
    if (deletingId === postId) return;
    setDeletingId(postId);
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setTotal((t) => t - 1);
      if (expandedId === postId) setExpandedId(null);
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (post: ReflectPost) => {
    setEditingId(post.id);
    setEditBody(post.body);
    setEditDraft(post.draft ?? false);
  };

  const handleEditSave = async (postId: string | number) => {
    if (!editBody.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await editPost(postId, editBody.trim(), editDraft);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, body: editBody.trim(), draft: editDraft } : p))
      );
      setEditingId(null);
    } catch {
      // ignore
    } finally {
      setEditSaving(false);
    }
  };

  const filteredPosts = posts.filter(
    (p) => !searchQuery || p.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                Your Reflections
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                A journal of your spiritual journey.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-teal text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </motion.button>
          </motion.div>

          {/* New Reflection Form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-primary/30 bg-card p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">New Reflection</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowNewForm(false);
                        setNewBody('');
                        setNewVerseRef('');
                        setNewDraft(false);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Write your reflection, insight, or thought..."
                    className="w-full min-h-28 p-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  />
                  {newBody.trim().length > 0 && newBody.trim().length < 6 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 6 characters ({6 - newBody.trim().length} more needed)
                    </p>
                  )}
                  <input
                    type="text"
                    value={newVerseRef}
                    onChange={(e) => setNewVerseRef(e.target.value)}
                    placeholder="Verse reference (optional) — e.g. 2:255 or 2:1-5"
                    className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setNewDraft((v) => !v)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                        newDraft
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      {newDraft ? 'Draft (private)' : 'Public'}
                    </button>
                    <button
                      onClick={handleSaveNew}
                      disabled={newBody.trim().length < 6 || saving}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                        newBody.trim().length >= 6 && !saving
                          ? 'bg-gradient-to-r from-primary to-teal text-white shadow-sm hover:opacity-90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )}
                      <span>{saving ? 'Saving...' : newDraft ? 'Save Draft' : 'Publish'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                {loading ? '—' : posts.filter((p) => p.isLiked).length}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">Liked</p>
            </div>
            <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-card to-rose-muted border border-rose/15 text-center">
              <div className="flex items-center justify-center gap-1 text-rose">
                <Flame className="w-4 h-4" />
                <span className="text-xl md:text-2xl font-bold">{streakDays ?? '—'}</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Streak</p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
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
                          {/* Author + badges row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {post.author?.avatarUrls?.small ? (
                                <img
                                  src={post.author.avatarUrls.small}
                                  alt={post.author.firstName ?? 'Author'}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                  {post.author?.firstName?.[0] ?? '?'}
                                </div>
                              )}
                              <div className="leading-tight">
                                <p className="text-xs font-bold text-foreground">
                                  {post.author?.firstName} {post.author?.lastName}
                                </p>
                                {post.author?.username && (
                                  <p className="text-[11px] text-muted-foreground">
                                    @{post.author.username}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {verseLabel(post) && (
                                <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                  {verseLabel(post)}
                                </span>
                              )}
                              {post.draft ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-xs font-bold">
                                  <Lock className="w-2.5 h-2.5" />
                                  Draft
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
                                  <Globe className="w-2.5 h-2.5" />
                                  Public
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Body or edit form */}
                          {editingId === post.id ? (
                            <div className="space-y-2">
                              <textarea
                                autoFocus
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="w-full min-h-24 p-3 rounded-xl bg-secondary/50 border border-primary/30 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditDraft((v) => !v)}
                                  className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                                    editDraft
                                      ? 'bg-accent/15 text-accent border border-accent/30'
                                      : 'bg-secondary text-muted-foreground'
                                  )}
                                >
                                  {editDraft ? 'Draft' : 'Public'}
                                </button>
                                <button
                                  onClick={() => handleEditSave(post.id)}
                                  disabled={!editBody.trim() || editSaving}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                  {editSaving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
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
                                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-card to-transparent" />
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  setExpandedId(expandedId === post.id ? null : post.id)
                                }
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
                            </>
                          )}

                          {/* Action bar */}
                          <div className="flex items-center gap-1 pt-1">
                            {/* Like */}
                            <button
                              onClick={() => handleLike(post)}
                              disabled={likingId === post.id}
                              className={cn(
                                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                                post.isLiked
                                  ? 'text-rose bg-rose/10 hover:bg-rose/15'
                                  : 'text-muted-foreground hover:bg-secondary'
                              )}
                            >
                              <Heart
                                className={cn('w-3.5 h-3.5', post.isLiked && 'fill-current')}
                              />
                              {post.likesCount > 0 && post.likesCount}
                            </button>

                            {/* Save */}
                            <button
                              onClick={() => handleSavePost(post)}
                              disabled={savingId === post.id}
                              className={cn(
                                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                                post.isSaved
                                  ? 'text-accent bg-accent/10 hover:bg-accent/15'
                                  : 'text-muted-foreground hover:bg-secondary'
                              )}
                            >
                              <Bookmark
                                className={cn('w-3.5 h-3.5', post.isSaved && 'fill-current')}
                              />
                            </button>

                            {/* Comments count (display only) */}
                            {post.commentsCount > 0 && (
                              <span className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground">
                                <MessageCircle className="w-3.5 h-3.5" />
                                {post.commentsCount}
                              </span>
                            )}

                            {/* Views (display only) */}
                            {(post.viewsCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground">
                                <Eye className="w-3.5 h-3.5" />
                                {post.viewsCount}
                              </span>
                            )}

                            <span className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {/* Edit */}
                            <button
                              onClick={() => startEdit(post)}
                              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded: tags + recent comment + language */}
                        <AnimatePresence>
                          {expandedId === post.id && editingId !== post.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {post.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-lg bg-teal-muted text-teal text-xs font-semibold"
                                      >
                                        #{typeof tag === 'string' ? tag : tag.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {post.recentComment && (
                                  <div className="p-2.5 rounded-xl bg-secondary/60 space-y-0.5">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                                      Recent comment
                                    </p>
                                    <p className="text-xs text-foreground/80 leading-relaxed">
                                      {post.recentComment.body}
                                    </p>
                                  </div>
                                )}
                                {post.languageName && (
                                  <p className="text-[11px] text-muted-foreground">
                                    Language: {post.languageName}
                                  </p>
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
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Start by seeking guidance or write a new reflection.'}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/guidance"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-teal text-white text-sm font-bold transition-all shadow-sm hover:opacity-90"
                  >
                    <span>Seek Guidance</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Now</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
