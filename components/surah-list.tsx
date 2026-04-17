'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronRight, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchChapters } from '@/app/quran/queries';
import type { Chapter } from '@/app/quran/types';

const popularIds = [1, 36, 55, 67, 112];

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
}

export function SurahList({ onSelectSurah }: SurahListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'makkah' | 'madinah'>('all');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChapters = () => {
    setLoading(true);
    setError(null);
    fetchChapters('en')
      .then((res) => setChapters(res.chapters))
      .catch(() => setError('Failed to load chapters. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChapters();
  }, []);

  const filteredChapters = chapters.filter((ch) => {
    const matchesSearch =
      ch.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.name_arabic.includes(searchQuery) ||
      ch.id.toString().includes(searchQuery);
    const matchesFilter = filter === 'all' || ch.revelation_place === filter;
    return matchesSearch && matchesFilter;
  });

  const popular = chapters.filter((ch) => popularIds.includes(ch.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading chapters...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-2">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={loadChapters} className="text-xs text-primary underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, number, or meaning..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'makkah', 'madinah'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {f === 'all' ? 'All' : f === 'makkah' ? 'Meccan' : 'Medinan'}
          </button>
        ))}
      </div>

      {/* Popular surahs */}
      {!searchQuery && filter === 'all' && popular.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {popular.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onSelectSurah(ch.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Star className="w-3 h-3" />
                {ch.name_simple}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chapter list */}
      <div className="space-y-1.5">
        {filteredChapters.map((ch, i) => (
          <motion.button
            key={ch.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.008 }}
            onClick={() => onSelectSurah(ch.id)}
            className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{ch.id}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{ch.name_simple}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-medium',
                    ch.revelation_place === 'makkah'
                      ? 'bg-teal-muted text-teal'
                      : 'bg-gold-muted text-accent'
                  )}
                >
                  {ch.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {ch.translated_name.name} · {ch.verses_count} verses
              </p>
            </div>
            <span
              className="text-base text-foreground/70 shrink-0"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              {ch.name_arabic}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </motion.button>
        ))}
        {filteredChapters.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No chapters match your search.
          </p>
        )}
      </div>
    </div>
  );
}
