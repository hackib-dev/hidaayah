'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RecitationProgress } from '@/types/recitation';

// Approximate surah name per page range (simplified — real data comes from API)
// Pages 1-604. We show 20 pages per "screen" with pagination.
const PAGE_COUNT = 604;
const PAGES_PER_VIEW = 30;

// Rough surah-per-page mapping for display labels (every ~20 pages)
function getPageLabel(page: number): string {
  if (page <= 2) return 'Al-Fatiha';
  if (page <= 49) return 'Al-Baqarah';
  if (page <= 76) return 'Ali Imran';
  if (page <= 106) return 'An-Nisa';
  if (page <= 127) return 'Al-Maidah';
  if (page <= 150) return 'Al-Anam';
  if (page <= 176) return 'Al-Araf';
  if (page <= 203) return 'Al-Anfal / At-Tawbah';
  if (page <= 255) return 'Yunus – Yusuf';
  if (page <= 281) return 'Ar-Rad – Al-Isra';
  if (page <= 312) return 'Al-Kahf – Ta-Ha';
  if (page <= 341) return 'Al-Anbiya – Al-Muminun';
  if (page <= 396) return 'An-Nur – Al-Ankabut';
  if (page <= 431) return 'Ar-Rum – Fatir';
  if (page <= 453) return 'Ya-Sin – Az-Zumar';
  if (page <= 481) return 'Ghafir – Al-Ahqaf';
  if (page <= 537) return 'Muhammad – Al-Hadid';
  if (page <= 582) return 'Al-Mujadila – Al-Mulk';
  return 'Al-Qalam – An-Nas';
}

interface PageRecitationViewProps {
  progress: RecitationProgress[];
  onSelectPage: (pageNumber: number) => void;
  onMarkComplete?: (pageNumber: number) => void;
}

export function PageRecitationView({ progress, onSelectPage }: PageRecitationViewProps) {
  const [currentChunk, setCurrentChunk] = useState(0);
  const totalChunks = Math.ceil(PAGE_COUNT / PAGES_PER_VIEW);

  const getProgress = (pageNum: number) =>
    progress.find((p) => p.format === 'page' && p.unitNumber === pageNum);

  const completedCount = progress.filter((p) => p.format === 'page' && p.completedAt).length;

  const startPage = currentChunk * PAGES_PER_VIEW + 1;
  const endPage = Math.min(startPage + PAGES_PER_VIEW - 1, PAGE_COUNT);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  // Find last read page for quick resume
  const lastRead = progress
    .filter((p) => p.format === 'page')
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())[0];

  return (
    <div className="space-y-4">
      {/* Progress summary + resume */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Page Progress</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {PAGE_COUNT} pages read
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / PAGE_COUNT) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-primary">
              {Math.round((completedCount / PAGE_COUNT) * 100)}%
            </span>
          </div>
        </div>

        {lastRead && (
          <button
            onClick={() => onSelectPage(lastRead.unitNumber)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary/8 border border-primary/20 hover:bg-primary/12 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs font-semibold text-primary">Resume reading</p>
                <p className="text-[10px] text-muted-foreground">
                  Page {lastRead.unitNumber} · {getPageLabel(lastRead.unitNumber)}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>

      {/* Page range navigation */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pages {startPage}–{endPage}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentChunk((c) => Math.max(0, c - 1))}
            disabled={currentChunk === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground px-1">
            {currentChunk + 1} / {totalChunks}
          </span>
          <button
            onClick={() => setCurrentChunk((c) => Math.min(totalChunks - 1, c + 1))}
            disabled={currentChunk === totalChunks - 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {pages.map((pageNum, i) => {
          const prog = getProgress(pageNum);
          const isCompleted = !!prog?.completedAt;
          const isInProgress = prog && !isCompleted;

          return (
            <motion.button
              key={pageNum}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008 }}
              onClick={() => onSelectPage(pageNum)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border text-xs font-semibold transition-all duration-200',
                isCompleted
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isInProgress
                    ? 'bg-primary/15 text-primary border-primary/40'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              )}
              title={`Page ${pageNum} · ${getPageLabel(pageNum)}`}
            >
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : pageNum}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/15 border border-primary/40" />
          <span>In progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-card border border-border" />
          <span>Not started</span>
        </div>
      </div>
    </div>
  );
}
