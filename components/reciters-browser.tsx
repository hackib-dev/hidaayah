'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2, Search, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchChapterReciters,
  fetchChapterAudio,
  fetchChapters
} from '@/app/(app)/dashboard/quran/queries';
import type { ChapterReciter, Chapter } from '@/app/(app)/dashboard/quran/types';

interface RecitersBrowserProps {
  onSelectReciterAndSurah?: (reciterId: number, surahNumber: number) => void;
}

export function RecitersBrowser({ onSelectReciterAndSurah }: RecitersBrowserProps) {
  const [reciters, setReciters] = useState<ChapterReciter[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<Record<number, number>>({});
  const [playing, setPlaying] = useState<{ reciterId: number; surahNumber: number } | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    Promise.all([fetchChapterReciters(), fetchChapters()])
      .then(([reciterRes, chapterRes]) => {
        setReciters(reciterRes.reciters ?? []);
        setChapters(chapterRes.chapters ?? []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reciters.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.translated_name?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlaying(null);
  };

  const playChapter = async (reciterId: number, surahNumber: number) => {
    if (playing?.reciterId === reciterId && playing?.surahNumber === surahNumber) {
      stopAudio();
      return;
    }
    stopAudio();
    setLoadingAudio(reciterId);
    try {
      const res = await fetchChapterAudio(reciterId, surahNumber);
      const url = res.audio_file?.audio_url;
      if (!url) return;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      await audio.play();
      setPlaying({ reciterId, surahNumber });
      onSelectReciterAndSurah?.(reciterId, surahNumber);
    } catch {
      // audio unavailable for this reciter/surah combo
    } finally {
      setLoadingAudio(null);
    }
  };

  useEffect(() => () => stopAudio(), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading reciters…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search reciters…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No reciters found.</p>
        )}
        {filtered.map((reciter) => {
          const isExpanded = expandedId === reciter.id;
          const surahNum = selectedSurah[reciter.id] ?? 1;
          const isPlayingThis =
            playing?.reciterId === reciter.id && playing?.surahNumber === surahNum;
          const anyPlaying = playing?.reciterId === reciter.id;
          const isLoading = loadingAudio === reciter.id;
          const styleName = reciter.style?.name;
          const qiratName = reciter.qirat?.name;

          return (
            <motion.div
              key={reciter.id}
              layout
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              {/* Reciter row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : reciter.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/20 to-teal/20 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{reciter.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {styleName && (
                      <span className="text-[10px] font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md">
                        {styleName}
                      </span>
                    )}
                    {qiratName && (
                      <span className="text-[10px] text-muted-foreground">{qiratName}</span>
                    )}
                  </div>
                </div>
                {anyPlaying && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                    Playing
                  </span>
                )}
              </button>

              {/* Expanded: surah picker + play */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-border"
                >
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-3">
                    Choose Surah
                  </p>
                  <select
                    value={surahNum}
                    onChange={(e) =>
                      setSelectedSurah((prev) => ({
                        ...prev,
                        [reciter.id]: Number(e.target.value)
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.id}. {ch.name_simple}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => playChapter(reciter.id, surahNum)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlayingThis ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isLoading ? 'Loading…' : isPlayingThis ? 'Pause' : 'Play Surah'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
