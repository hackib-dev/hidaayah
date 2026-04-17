'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useAppState } from '@/components/app-state-provider';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import {
  Heart,
  Shield,
  Compass,
  Sun,
  Moon,
  Scale,
  Search,
  ChevronRight,
  Sparkles,
  Star,
  Zap,
  Leaf,
  Eye,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();
  const { collections } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const filteredCollections = collections.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCollections = filteredCollections.filter((c) => c.featured);
  const otherCollections = filteredCollections.filter((c) => !c.featured);

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
              Life Theme Collections
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg">
              Curated verses organized by life themes. Explore guidance for whatever your heart
              needs.
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
                      whileHover={{
                        y: -3,
                        boxShadow: '0 12px 30px -6px oklch(0 0 0 / 0.12)'
                      }}
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
                    whileHover={{
                      y: -2,
                      boxShadow: '0 8px 20px -4px oklch(0 0 0 / 0.10)'
                    }}
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
          {filteredCollections.length === 0 && (
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
