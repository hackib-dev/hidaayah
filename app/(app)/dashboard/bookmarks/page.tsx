'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import {
  Bookmark,
  Trash2,
  Loader2,
  BookOpen,
  ChevronRight,
  FileText,
  Layers,
  BookText
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllBookmarks, deleteBookmark } from '@/app/(app)/dashboard/reflections/queries';
import type { Bookmark as BookmarkType } from '@/app/(app)/dashboard/reflections/types';
import { QF_DEFAULT_MUSHAF_ID } from '@/config';
import { cn } from '@/lib/utils';

type TabKey = 'ayah' | 'page' | 'surah' | 'juz';

const TABS: { key: TabKey; label: string; icon: React.ElementType; emptyLabel: string }[] = [
  { key: 'ayah', label: 'Verses', icon: Bookmark, emptyLabel: 'No bookmarked verses yet.' },
  { key: 'page', label: 'Pages', icon: FileText, emptyLabel: 'No bookmarked pages yet.' },
  { key: 'surah', label: 'Surahs', icon: BookText, emptyLabel: 'No bookmarked surahs yet.' },
  { key: 'juz', label: 'Juz', icon: Layers, emptyLabel: 'No bookmarked juz yet.' }
];

function BookmarkCard({
  bm,
  tab,
  onDelete,
  deleting
}: {
  bm: BookmarkType;
  tab: TabKey;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const label = () => {
    if (tab === 'ayah') return `${bm.key}:${bm.verseNumber}`;
    if (tab === 'page') return `Page ${bm.key}`;
    if (tab === 'surah') return `Surah ${bm.key}`;
    return `Juz ${bm.key}`;
  };

  const sublabel = new Date(bm.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const href = () => {
    if (tab === 'ayah')
      return `/dashboard/quran?surah=${bm.key}&verse=${bm.verseNumber ?? ''}&mode=translation`;
    if (tab === 'page') return `/dashboard/quran?page=${bm.key}`;
    if (tab === 'surah') return `/dashboard/quran?surah=${bm.key}`;
    // juz — link to quran page; juz jump handled via surah format
    return `/dashboard/quran?surah=1`;
  };

  const iconBg = {
    ayah: 'bg-primary/10',
    page: 'bg-teal/10',
    surah: 'bg-amber-500/10',
    juz: 'bg-violet-500/10'
  }[tab];

  const iconColor = {
    ayah: 'text-primary',
    page: 'text-teal',
    surah: 'text-amber-600',
    juz: 'text-violet-600'
  }[tab];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          <Bookmark className={cn('w-4 h-4', iconColor)} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{label()}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={href()}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Open in reader"
        >
          <BookOpen className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(bm.id)}
          disabled={deleting}
          aria-label="Remove bookmark"
          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('ayah');
  const [bookmarks, setBookmarks] = useState<Record<TabKey, BookmarkType[]>>({
    ayah: [],
    page: [],
    surah: [],
    juz: []
  });
  const [fetching, setFetching] = useState<Record<TabKey, boolean>>({
    ayah: false,
    page: false,
    surah: false,
    juz: false
  });
  const [fetched, setFetched] = useState<Set<TabKey>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTab = useCallback(
    async (tab: TabKey) => {
      if (!user || fetching[tab] || fetched.has(tab)) return;
      setFetching((prev) => ({ ...prev, [tab]: true }));
      try {
        const data = await fetchAllBookmarks({ type: tab, mushafId: QF_DEFAULT_MUSHAF_ID });
        setBookmarks((prev) => ({ ...prev, [tab]: data }));
        setFetched((prev) => new Set(prev).add(tab));
      } catch {
        // leave empty
      } finally {
        setFetching((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [user, fetching, fetched]
  );

  // Load initial tab
  useEffect(() => {
    loadTab('ayah');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  const handleDelete = async (id: string) => {
    if (deletingId === id) return;
    setDeletingId(id);
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((b) => b.id !== id)
      }));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const current = bookmarks[activeTab];
  const isLoading = fetching[activeTab];
  const totalAll = Object.values(bookmarks).flat().length;

  // Group ayah bookmarks by surah for display
  const groupedAyah =
    activeTab === 'ayah'
      ? current.reduce(
          (acc, bm) => {
            const k = String(bm.key);
            if (!acc[k]) acc[k] = [];
            acc[k].push(bm);
            return acc;
          },
          {} as Record<string, BookmarkType[]>
        )
      : null;

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-5 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-teal flex items-center justify-center shadow-sm shrink-0">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                Bookmarks
              </h1>
              <p className="text-sm text-muted-foreground">
                {fetched.size === 0
                  ? 'Loading…'
                  : `${totalAll} bookmark${totalAll !== 1 ? 's' : ''} saved`}
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = fetched.has(tab.key) ? bookmarks[tab.key].length : null;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shrink-0 border',
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        activeTab === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : current.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">
                    {TABS.find((t) => t.key === activeTab)!.emptyLabel}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bookmark{' '}
                    {activeTab === 'ayah'
                      ? 'verses'
                      : activeTab === 'page'
                        ? 'Mushaf pages'
                        : activeTab === 'surah'
                          ? 'surahs'
                          : 'juz'}{' '}
                    while reading the Quran.
                  </p>
                  <Link
                    href="/dashboard/quran"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-primary to-teal text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <BookOpen className="w-4 h-4" />
                    Open Quran
                  </Link>
                </div>
              ) : activeTab === 'ayah' && groupedAyah ? (
                // Ayah: group by surah
                <div className="space-y-5">
                  {Object.entries(groupedAyah)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([surahKey, verses]) => (
                      <div key={surahKey} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Surah {surahKey}
                          </h2>
                          <Link
                            href={`/dashboard/quran?surah=${surahKey}&mode=translation`}
                            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            Read <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {verses
                              .sort((a, b) => (a.verseNumber ?? 0) - (b.verseNumber ?? 0))
                              .map((bm) => (
                                <BookmarkCard
                                  key={bm.id}
                                  bm={bm}
                                  tab={activeTab}
                                  onDelete={handleDelete}
                                  deleting={deletingId === bm.id}
                                />
                              ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                // Pages / Surahs / Juz: flat sorted list
                <div className="space-y-2">
                  <AnimatePresence>
                    {[...current]
                      .sort((a, b) => a.key - b.key)
                      .map((bm) => (
                        <BookmarkCard
                          key={bm.id}
                          bm={bm}
                          tab={activeTab}
                          onDelete={handleDelete}
                          deleting={deletingId === bm.id}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
