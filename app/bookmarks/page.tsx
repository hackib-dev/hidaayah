'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';

import { Bookmark, Trash2, Loader2, BookOpen, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllBookmarks, deleteBookmark } from '@/app/reflections/queries';
import type { Bookmark as BookmarkType } from '@/app/reflections/types';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchAllBookmarks({ type: 'ayah', mushafId: QF_DEFAULT_MUSHAF_ID })
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setFetching(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    if (deletingId === id) return;
    setDeletingId(id);
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const filtered = bookmarks.filter((b) => {
    if (!searchQuery) return true;
    const label = `${b.key}:${b.verseNumber}`;
    return label.includes(searchQuery);
  });

  // Group by surah
  const grouped = filtered.reduce(
    (acc, bm) => {
      const key = String(bm.key);
      if (!acc[key]) acc[key] = [];
      acc[key].push(bm);
      return acc;
    },
    {} as Record<string, BookmarkType[]>
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
            className="space-y-1"
          >
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Saved Verses
            </h1>
            <p className="text-sm text-muted-foreground">
              {fetching ? '...' : `${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''} saved`}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by surah:verse — e.g. 2:255"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </motion.div>

          {/* Loading */}
          {fetching && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Grouped list */}
          {!fetching && filtered.length > 0 && (
            <div className="space-y-5">
              {Object.entries(grouped)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([surahKey, verses]) => (
                  <motion.div
                    key={surahKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Surah {surahKey}
                      </h2>
                      <Link
                        href={`/quran?surah=${surahKey}`}
                        className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                      >
                        Read
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {verses
                          .sort((a, b) => (a.verseNumber ?? 0) - (b.verseNumber ?? 0))
                          .map((bm) => (
                            <motion.div
                              key={bm.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                  <Bookmark className="w-4 h-4 text-primary fill-primary/30" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-foreground">
                                    {surahKey}:{bm.verseNumber}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(bm.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/quran?surah=${surahKey}&verse=${bm.verseNumber ?? ''}`}
                                  className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <BookOpen className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(bm.id)}
                                  disabled={deletingId === bm.id}
                                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  {deletingId === bm.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}

          {/* Empty state */}
          {!fetching && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground">No saved verses</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No matches found.' : 'Bookmark verses while reading the Quran.'}
              </p>
              {!searchQuery && (
                <Link
                  href="/quran"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-primary to-teal text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="w-4 h-4" />
                  Open Quran
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
