'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Shuffle,
  FolderOpen,
  Loader2,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCollection,
  deleteCollection,
  updateCollection,
  removeBookmarkFromCollection
} from '@/app/(app)/dashboard/collections/queries';
import { fetchVerseByKey } from '@/app/(app)/dashboard/quran/queries';
import type { Bookmark } from '@/app/(app)/dashboard/reflections/types';
import type { Verse } from '@/app/(app)/dashboard/quran/types';

interface BookmarkWithVerse {
  bookmark: Bookmark;
  verse: Verse | null;
  loading: boolean;
  error: boolean;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.theme as string;
  const { user } = useAuth();
  const router = useRouter();
  const isDefault = collectionId === '__default__';

  const [name, setName] = useState(isDefault ? 'Favorites' : '');
  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [items, setItems] = useState<BookmarkWithVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadCollection = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const allBookmarks: Bookmark[] = [];
      let after: string | undefined;
      let collectionName = isDefault ? 'Favorites' : '';
      do {
        const res = await fetchCollection(collectionId, { first: 20, after });
        if (!isDefault) collectionName = res.data.name;
        allBookmarks.push(...(res.data.bookmarks ?? []));
        after =
          res.pagination?.hasNextPage && res.pagination?.endCursor
            ? res.pagination.endCursor
            : undefined;
      } while (after);

      setName(collectionName);
      const initial: BookmarkWithVerse[] = allBookmarks.map((bm) => ({
        bookmark: bm,
        verse: null,
        loading: true,
        error: false
      }));
      setItems(initial);
      setSelectedIndex(0);

      allBookmarks.forEach(async (bm, i) => {
        if (bm.type !== 'ayah' || !bm.verseNumber) {
          setItems((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, loading: false } : item))
          );
          return;
        }
        const verseKey = `${bm.key}:${bm.verseNumber}`;
        try {
          const verseRes = await fetchVerseByKey(verseKey, { translations: '20', words: false });
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, verse: verseRes.verse, loading: false } : item
            )
          );
        } catch {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, loading: false, error: true } : item
            )
          );
        }
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [collectionId, isDefault, user]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handleRename = async () => {
    if (!(editValue ?? '').trim() || renaming) return;
    setRenaming(true);
    try {
      await updateCollection(collectionId, editValue.trim());
      setName(editValue.trim());
      setEditingName(false);
    } catch {
      // user can retry
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteCollection(collectionId);
      router.replace('/dashboard/collections');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string, index: number) => {
    if (removingId) return;
    setRemovingId(bookmarkId);
    try {
      await removeBookmarkFromCollection(collectionId, bookmarkId);
      setItems((prev) => prev.filter((_, i) => i !== index));
      setSelectedIndex((prev) => Math.max(0, prev > index ? prev - 1 : prev));
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  };

  const handleShuffle = () => {
    if (items.length <= 1) return;
    let next: number;
    do {
      next = Math.floor(Math.random() * items.length);
    } while (next === selectedIndex);
    setSelectedIndex(next);
  };

  const selected = items[selectedIndex];

  if (loading) {
    return (
      <main className="min-h-screen pb-24 md:pb-12">
        <Navigation />
        <div className="pt-20 md:pt-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto py-8 space-y-6">
            <Link
              href="/dashboard/collections"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              All Collections
            </Link>
            <div className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading collection...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pb-24 md:pb-12">
        <Navigation />
        <div className="pt-20 md:pt-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto py-8 space-y-6">
            <Link
              href="/dashboard/collections"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              All Collections
            </Link>
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
              <p className="font-semibold text-foreground">Could not load collection</p>
              <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
              <button
                onClick={loadCollection}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 md:pb-12">
      <Navigation />
      <div className="pt-20 md:pt-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-6 py-8">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard/collections"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              All Collections
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 md:p-8 bg-linear-to-br from-primary/10 via-card to-secondary border border-primary/20 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename();
                          if (e.key === 'Escape') setEditingName(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0 w-48"
                      />
                      <button
                        onClick={handleRename}
                        disabled={!(editValue ?? '').trim() || renaming}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {renaming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground truncate">
                      {name}
                    </h1>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {items.length} {items.length === 1 ? 'verse' : 'verses'} saved
                  </p>
                </div>
              </div>

              {!isDefault && (
                <div className="flex items-center gap-2 shrink-0">
                  {!editingName && (
                    <button
                      onClick={() => {
                        setEditValue(name);
                        setEditingName(true);
                      }}
                      className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Rename collection"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {items.length > 1 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <button
                  onClick={handleShuffle}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle Verse
                </button>
              </div>
            )}
          </motion.div>

          {/* Delete confirmation */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">Delete this collection?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This cannot be undone. Saved bookmarks won&apos;t be deleted.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-70 transition-colors flex items-center gap-1.5"
                  >
                    {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No verses yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Save verses while reading Quran or from reflection results to add them here.
              </p>
            </motion.div>
          )}

          {/* Verse viewer + list */}
          {items.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-3xl bg-card border border-border overflow-hidden">
                  <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                          Currently viewing
                        </p>
                        <h2 className="text-lg font-bold text-foreground">
                          {selected?.verse
                            ? selected.verse.verse_key
                            : selected?.bookmark
                              ? `${selected.bookmark.key}:${selected.bookmark.verseNumber}`
                              : '—'}
                        </h2>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        {selectedIndex + 1} / {items.length}
                      </div>
                    </div>

                    {selected?.loading ? (
                      <div className="flex items-center gap-2 py-6 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading verse...</span>
                      </div>
                    ) : selected?.error ? (
                      <div className="flex items-center gap-2 py-6 text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Could not load verse text.</span>
                      </div>
                    ) : selected?.verse ? (
                      <div className="space-y-4">
                        <p
                          className="text-2xl md:text-3xl text-right leading-[2.4] text-foreground"
                          style={{ fontFamily: 'var(--font-arabic)' }}
                          dir="rtl"
                        >
                          {selected.verse.text_uthmani}
                        </p>
                        {selected.verse.translations?.[0] && (
                          <p className="text-sm text-muted-foreground font-serif italic leading-relaxed">
                            &ldquo;{selected.verse.translations[0].text}&rdquo;
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-primary font-semibold">
                            {selected.verse.verse_key}
                          </span>
                          <Link
                            href={`/dashboard/quran?verse=${selected.verse.verse_key}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                          >
                            Open in reader →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">
                        Verse {selected?.bookmark.key}:{selected?.bookmark.verseNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Verse list */}
                <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">All verses</h3>
                    <div className="text-xs text-muted-foreground">{items.length} total</div>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.bookmark.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={cn(
                          'group flex items-start gap-2 rounded-2xl p-3 transition-colors cursor-pointer',
                          selectedIndex === index
                            ? 'bg-primary/10'
                            : 'bg-secondary hover:bg-secondary/80'
                        )}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">
                            {item.verse?.verse_key ??
                              `${item.bookmark.key}:${item.bookmark.verseNumber}`}
                          </div>
                          {item.loading ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Loading...</span>
                            </div>
                          ) : item.verse?.translations?.[0] ? (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.verse.translations[0].text}
                            </p>
                          ) : null}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(item.bookmark.id, index);
                          }}
                          disabled={removingId === item.bookmark.id}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-all shrink-0"
                          title="Remove from collection"
                        >
                          {removingId === item.bookmark.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Collection tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Shuffle through your saved verses or jump to a specific one from the list.
                  </p>
                  {items.length > 1 && (
                    <button
                      onClick={handleShuffle}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Shuffle className="w-4 h-4" />
                      Shuffle verse
                    </button>
                  )}
                </div>

                <div className="rounded-3xl bg-card border border-border p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Collection info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Verses</span>
                      <span className="font-semibold text-foreground">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-semibold text-foreground">
                        {isDefault ? 'Favorites' : 'Personal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
