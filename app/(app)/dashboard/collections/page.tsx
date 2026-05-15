'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { Search, FolderOpen, Plus, Loader2, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCollections, createCollection } from '@/app/(app)/dashboard/collections/queries';
import type { Collection } from '@/app/(app)/dashboard/collections/types';

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCollections = () => {
    if (!user) return;
    setCollectionsLoading(true);
    setCollectionsError(false);
    fetchAllCollections({ sortBy: 'alphabetical' })
      .then((data) => setUserCollections(data))
      .catch(() => setCollectionsError(true))
      .finally(() => setCollectionsLoading(false));
  };

  useEffect(() => {
    loadCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // user can retry
    } finally {
      setCreating(false);
    }
  };

  const filtered = userCollections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-16 lg:pt-20 px-4 md:px-6">
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
              Organise your saved verses into personal collections.
            </p>
          </motion.div>

          {/* Search + New */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewCollectionForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </motion.button>
          </motion.div>

          {/* New collection form */}
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

          {/* Collections list */}
          {collectionsLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading your collections...</span>
            </div>
          ) : collectionsError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Could not load collections</p>
              <button
                onClick={loadCollections}
                className="text-xs text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 20px -4px oklch(0 0 0 / 0.10)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Link
                    href={`/dashboard/collections/${collection.id}`}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                {searchQuery ? (
                  <Search className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <p className="font-semibold text-foreground">
                {searchQuery ? 'No collections found' : 'No collections yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Create your first collection using the New button above.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
