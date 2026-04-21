'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useAppState } from '@/components/app-state-provider';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { Search, ChevronRight, Sparkles, FolderOpen, Plus, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCollections, createCollection } from '@/app/collections/queries';
import type { Collection } from '@/app/collections/types';

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();
  const { collections } = useAppState();
  const router = useRouter();

  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setCollectionsLoading(true);
    fetchAllCollections({ sortBy: 'alphabetical' })
      .then((data) => setUserCollections(data))
      .catch(() => setUserCollections([]))
      .finally(() => setCollectionsLoading(false));
  }, [user]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await createCollection({ name: newCollectionName.trim() });
      setUserCollections((prev) => [res.data, ...prev]);
      setNewCollectionName('');
      setShowNewCollectionForm(false);
    } catch {
      // silently fail — user can retry
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const filteredCollections = collections.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCollections = filteredCollections.filter((c) => c.featured);
  const otherCollections = filteredCollections.filter((c) => !c.featured);

  const filteredUserCollections = userCollections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Collections
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg">
              Curated verses by life theme, plus your personal saved collections.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative max-w-sm"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </motion.div>

          {/* My Collections */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                My Collections
              </h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewCollectionForm((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </motion.button>
            </div>

            <AnimatePresence>
              {showNewCollectionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 p-3 rounded-2xl bg-card border border-border">
                    <input
                      autoFocus
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                      placeholder="Collection name..."
                      className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim() || creating}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm font-bold transition-colors',
                        newCollectionName.trim() && !creating
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCollectionForm(false);
                        setNewCollectionName('');
                      }}
                      className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {collectionsLoading ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading your collections...</span>
              </div>
            ) : filteredUserCollections.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredUserCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 20px -4px oklch(0 0 0 / 0.10)' }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Link
                      href={`/collections/${collection.id}`}
                      className="group rounded-2xl border border-border bg-card p-4 transition-colors duration-200 block hover:border-primary/30"
                    >
                      <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm truncate">
                            {collection.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(collection.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {searchQuery ? 'No matching collections.' : 'No collections yet. Create one above.'}
              </p>
            )}
          </motion.div>

          {/* Featured Collections */}
          {featuredCollections.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Featured Collections
              </h2>

              <div className="grid md:grid-cols-3 gap-3">
                {featuredCollections.map((collection, index) => {
                  const Icon = collection.icon;
                  return (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                      whileHover={{ y: -3, boxShadow: '0 12px 30px -6px oklch(0 0 0 / 0.12)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href={`/collections/${collection.id}`}
                        className={cn(
                          'group rounded-2xl border bg-card p-5 transition-colors duration-200 block',
                          collection.border
                        )}
                      >
                        <div className="space-y-3">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                              collection.bg,
                              collection.iconColor
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-foreground">{collection.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {collection.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">
                              {collection.count} verses
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Collections Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">All Collections</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {otherCollections.map((collection, index) => {
                const Icon = collection.icon;
                return (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 20px -4px oklch(0 0 0 / 0.10)' }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Link
                      href={`/collections/${collection.id}`}
                      className={cn(
                        'group rounded-2xl border bg-card p-4 transition-colors duration-200 block',
                        collection.border
                      )}
                    >
                      <div className="space-y-2.5">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                            collection.bg,
                            collection.iconColor
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="font-bold text-foreground text-sm">{collection.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {collection.count} verses
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredCollections.length === 0 && filteredUserCollections.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground">No collections found</h3>
              <p className="text-sm text-muted-foreground">Try a different search term.</p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
