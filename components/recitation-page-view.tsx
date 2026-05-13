'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPages, fetchChapters } from '@/app/(app)/dashboard/quran/queries';

const PAGE_COUNT = 604;

interface PageRecitationViewProps {
  onSelectPage: (pageNumber: number) => void;
}

export function PageRecitationView({ onSelectPage }: PageRecitationViewProps) {
  const [pageLabels, setPageLabels] = useState<Map<number, string>>(new Map());
  const [loadingLabels, setLoadingLabels] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([fetchPages(), fetchChapters()])
      .then(([pagesRes, chaptersRes]) => {
        const chapterNames = new Map<number, string>();
        for (const c of chaptersRes.chapters ?? []) {
          chapterNames.set(c.id, c.name_simple);
        }
        const map = new Map<number, string>();
        for (const p of pagesRes.pages ?? []) {
          const chapterId = Number(Object.keys(p.verse_mapping)[0]);
          if (chapterId) map.set(p.page_number, chapterNames.get(chapterId) ?? '');
        }
        setPageLabels(map);
      })
      .catch(() => null)
      .finally(() => setLoadingLabels(false));
  }, []);

  const allPages = useMemo(() => Array.from({ length: PAGE_COUNT }, (_, i) => i + 1), []);

  const filteredPages = useMemo(() => {
    const q = search.trim();
    if (!q) return allPages;
    const num = parseInt(q, 10);
    if (!isNaN(num)) return allPages.filter((p) => p === num);
    const lower = q.toLowerCase();
    return allPages.filter((p) => (pageLabels.get(p) ?? '').toLowerCase().includes(lower));
  }, [search, allPages, pageLabels]);

  // Group filtered pages by surah label for better scanning
  const juzGroups = useMemo(() => {
    const groups: { label: string; pages: number[] }[] = [];
    let current: { label: string; pages: number[] } | null = null;
    for (const p of filteredPages) {
      const label = pageLabels.get(p) ?? '';
      if (!current || current.label !== label) {
        current = { label, pages: [p] };
        groups.push(current);
      } else {
        current.pages.push(p);
      }
    }
    return groups;
  }, [filteredPages, pageLabels]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Jump to page number or surah name…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
        />
      </div>

      {loadingLabels ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No pages found.</p>
      ) : search.trim() ? (
        // Flat grid when searching
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
          {filteredPages.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onSelectPage(pageNum)}
              title={
                pageLabels.get(pageNum)
                  ? `${pageLabels.get(pageNum)} · Page ${pageNum}`
                  : `Page ${pageNum}`
              }
              className="aspect-square rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-xs font-semibold text-foreground transition-all"
            >
              {pageNum}
            </button>
          ))}
        </div>
      ) : (
        // Grouped by surah when not searching
        <div className="space-y-4">
          {juzGroups.map((group, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.01 }}
            >
              {group.label && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                {group.pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onSelectPage(pageNum)}
                    title={`Page ${pageNum}`}
                    className={cn(
                      'aspect-square rounded-lg border flex items-center justify-center text-xs font-semibold transition-all',
                      'bg-card border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
