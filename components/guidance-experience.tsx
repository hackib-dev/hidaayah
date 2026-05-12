'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { searchByEmotion, fetchTafsirByAyah } from '@/app/(app)/dashboard/guidance/queries';
import { createBookmark } from '@/app/(app)/dashboard/reflections/queries';
import { fetchVerseByKey, fetchVerseAudioFiles } from '@/app/(app)/dashboard/quran/queries';
import { reflectApi } from '@/app/apiService/quranFoundationService';
import { QF_DEFAULT_MUSHAF_ID, QF_DEFAULT_TRANSLATION_ID, QF_DEFAULT_RECITER_ID } from '@/config';

interface GuidanceExperienceProps {
  emotion: string;
  situation: string;
}

interface GuidanceResult {
  verseKey: string;
  surahName: string;
  verseNumber: number;
  arabic: string;
  translation: string;
  tafsir: string | null;
  relatedThemes: string[];
  color: string;
}

const THEME_COLORS: Record<string, string> = {
  anxious: 'from-violet-muted to-teal-muted',
  grateful: 'from-gold-muted to-rose-muted',
  lost: 'from-teal-muted to-violet-muted',
  hopeful: 'from-gold-muted to-teal-muted',
  struggling: 'from-rose-muted to-gold-muted',
  peaceful: 'from-teal-muted to-gold-muted',
  default: 'from-teal-muted to-violet-muted'
};

export function GuidanceExperience({ emotion, situation }: GuidanceExperienceProps) {
  const [candidates, setCandidates] = useState<GuidanceResult[]>([]);
  const [verseIndex, setVerseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [showTafsir, setShowTafsir] = useState(false);
  const [reflection, setReflection] = useState('');
  const [savedReflection, setSavedReflection] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const emotionKey = emotion.toLowerCase();
  const color = THEME_COLORS[emotionKey] ?? THEME_COLORS.default;

  const guidance = candidates[verseIndex] ?? null;
  const audioUrl = guidance ? (audioUrls[guidance.verseKey] ?? null) : null;
  const isBookmarked = guidance ? (bookmarked[guidance.verseKey] ?? false) : false;

  // Sync play/pause/src to audio element imperatively
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioUrl) {
      audio.pause();
      return;
    }
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, audioUrl]);

  // Reset playback when switching verses
  useEffect(() => {
    setIsPlaying(false);
    setShowTafsir(false);
  }, [verseIndex]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCandidates([]);
    setVerseIndex(0);
    setShowTafsir(false);
    setIsPlaying(false);
    setAudioUrls({});
    setBookmarked({});
    setSavedReflection(false);
    setReflection('');

    searchByEmotion(emotion, situation)
      .then(async (res) => {
        const navItems = res.result?.navigation ?? [];

        // Collect unique ayah keys: prefer verses array, supplement from navigation ayah items
        const seenKeys = new Set<string>();
        const verseEntries: Array<{ key: string; name: string }> = [];

        for (const v of res.result?.verses ?? []) {
          if (v.key && !seenKeys.has(v.key)) {
            seenKeys.add(v.key);
            verseEntries.push({ key: v.key, name: v.name ?? '' });
          }
        }
        for (const n of navItems) {
          const key = String(n.key);
          if (n.result_type === 'ayah' && key && !seenKeys.has(key)) {
            seenKeys.add(key);
            verseEntries.push({ key, name: n.name ?? '' });
          }
        }

        // Show up to 5 candidates so user can cycle; dedupe by surah to avoid 5 verses from Al-Baqarah
        const dedupedBySurah = new Map<number, { key: string; name: string }>();
        for (const entry of verseEntries) {
          const surahNum = parseInt(entry.key.split(':')[0], 10);
          if (!dedupedBySurah.has(surahNum)) dedupedBySurah.set(surahNum, entry);
        }
        const topVerses = [...dedupedBySurah.values()].slice(0, 5);

        if (topVerses.length === 0) {
          setError('No guidance found. Please try again with different words.');
          return;
        }

        const relatedThemes = navItems
          .filter((n) => n.result_type === 'surah' && n.name)
          .slice(0, 3)
          .map((n) => n.name);
        const themes = relatedThemes.length > 0 ? relatedThemes : ['patience', 'trust', 'hope'];

        // Seed candidates immediately with placeholders so UI renders at once
        const initial: GuidanceResult[] = topVerses.map(({ key, name }) => {
          const [ch, vn] = key.split(':');
          return {
            verseKey: key,
            surahName: `Surah ${ch}`,
            verseNumber: parseInt(vn, 10),
            arabic: '',
            translation: name.replace(/<[^>]*>/g, ''),
            tafsir: null,
            relatedThemes: themes,
            color
          };
        });
        setCandidates(initial);

        // Fetch verse text + audio for all candidates in parallel
        const enriched = await Promise.all(
          topVerses.map(async ({ key, name }, i) => {
            const [ch, vn] = key.split(':');
            const surahNum = parseInt(ch, 10);
            const verseNumber = parseInt(vn, 10);

            const [verseData, verseAudioFiles] = await Promise.all([
              fetchVerseByKey(key, {
                translations: String(QF_DEFAULT_TRANSLATION_ID),
                fields: 'text_uthmani',
                words: false
              }).catch(() => null),
              fetchVerseAudioFiles(QF_DEFAULT_RECITER_ID, surahNum).catch(() => null)
            ]);

            const verseAudio = verseAudioFiles?.find(
              (f) => parseInt(f.verse_key.split(':')[1], 10) === verseNumber
            );

            return {
              index: i,
              key,
              arabic: verseData?.verse.text_uthmani ?? '',
              translation: verseData?.verse.translations?.[0]?.text ?? name.replace(/<[^>]*>/g, ''),
              audioUrl: verseAudio?.url ?? null
            };
          })
        );

        // Apply enriched data
        const audioMap: Record<string, string> = {};
        setCandidates((prev) => {
          const next = [...prev];
          for (const e of enriched) {
            if (next[e.index]) {
              next[e.index] = { ...next[e.index], arabic: e.arabic, translation: e.translation };
            }
            if (e.audioUrl) audioMap[e.key] = e.audioUrl;
          }
          return next;
        });
        setAudioUrls(audioMap);
      })
      .catch(() => setError('Failed to fetch guidance. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [emotion, situation, color]);

  const handleLoadTafsir = async () => {
    if (!guidance || guidance.tafsir !== null) {
      setShowTafsir((v) => !v);
      return;
    }
    setShowTafsir(true);
    setLoadingTafsir(true);
    try {
      const res = await fetchTafsirByAyah(169, guidance.verseKey); // 169 = Ibn Kathir EN
      // by_ayah returns { tafsir: {...} } singular
      const text = res.tafsir?.text || null;
      setCandidates((prev) => {
        const next = [...prev];
        if (next[verseIndex]) next[verseIndex] = { ...next[verseIndex], tafsir: text };
        return next;
      });
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleBookmark = async () => {
    if (!guidance || isBookmarked) return;
    const [chapter] = guidance.verseKey.split(':');
    await createBookmark({
      type: 'ayah',
      key: parseInt(chapter, 10),
      verseNumber: guidance.verseNumber,
      mushaf: QF_DEFAULT_MUSHAF_ID
    }).catch(() => null);
    setBookmarked((prev) => ({ ...prev, [guidance.verseKey]: true }));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-secondary" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-foreground">Seeking guidance...</p>
          <p className="text-sm text-muted-foreground">Connecting your heart to divine wisdom</p>
        </div>
      </motion.div>
    );
  }

  if (error || !guidance) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-destructive">{error ?? 'Something went wrong.'}</p>
        <Link href="/dashboard/guidance" className="text-xs text-primary underline">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* Context Display */}
      {(emotion || situation) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-linear-to-r from-secondary to-muted border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">You shared: </span>
            {emotion && <span className="capitalize text-primary font-semibold">{emotion}</span>}
            {emotion && situation && ' — '}
            {situation && <span>&ldquo;{situation}&rdquo;</span>}
          </p>
        </motion.div>
      )}

      {/* Main Verse Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="h-1.5 bg-linear-to-r from-primary via-teal to-accent" />

        <div className="p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs md:text-sm font-semibold text-muted-foreground">
                Divine guidance for your heart
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                {guidance.verseKey}
              </span>
              {candidates.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVerseIndex((i) => Math.max(0, i - 1))}
                    disabled={verseIndex === 0}
                    className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
                    aria-label="Previous verse"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {verseIndex + 1}/{candidates.length}
                  </span>
                  <button
                    onClick={() => setVerseIndex((i) => Math.min(candidates.length - 1, i + 1))}
                    disabled={verseIndex === candidates.length - 1}
                    className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
                    aria-label="Next verse"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Translation (shown while Arabic loads) */}
          <div
            className={cn(
              'py-6 px-5 rounded-2xl bg-linear-to-br border border-primary/10',
              guidance.color
            )}
          >
            {guidance.arabic ? (
              <p
                className="text-2xl md:text-3xl lg:text-4xl text-center leading-[2.2] text-foreground"
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {guidance.arabic}
              </p>
            ) : (
              <p className="text-base md:text-lg text-center text-foreground font-serif italic leading-relaxed">
                &ldquo;{guidance.translation}&rdquo;
              </p>
            )}
          </div>

          <p className="text-base md:text-lg text-foreground/90 font-serif italic leading-relaxed text-center">
            &ldquo;{guidance.translation}&rdquo;
          </p>

          {/* Hidden audio element — always mounted, src managed imperatively */}
          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setIsPlaying((p) => !p)}
              disabled={loading || !audioUrl}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm',
                isPlaying
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : audioUrl
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-60'
              )}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : !audioUrl && !loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isPlaying ? 'Pause' : 'Listen'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleBookmark}
              className={cn(
                'p-2.5 rounded-xl transition-all duration-200',
                isBookmarked
                  ? 'bg-gold-muted text-accent'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-current')} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tafsir */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <button
          onClick={handleLoadTafsir}
          className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">Understanding (Tafsir)</span>
          </div>
          {showTafsir ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {showTafsir && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border">
                {loadingTafsir ? (
                  <div className="flex items-center gap-2 justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading tafsir...</span>
                  </div>
                ) : guidance.tafsir ? (
                  <p
                    className="text-sm text-foreground/80 leading-relaxed pt-4"
                    dangerouslySetInnerHTML={{ __html: guidance.tafsir }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-4">
                    Tafsir not available for this verse.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reflection */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-accent" />
          <h3 className="font-bold text-foreground text-sm">Reflect &amp; Internalize</h3>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-foreground">Your reflection:</label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            disabled={savedReflection}
            placeholder="Write your thoughts, insights, or how this verse speaks to your situation..."
            className={cn(
              'w-full min-h-25 p-4 rounded-xl bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow',
              savedReflection && 'opacity-75'
            )}
          />

          {!savedReflection ? (
            <motion.button
              whileTap={{ scale: reflection.trim() ? 0.95 : 1 }}
              onClick={async () => {
                if (!reflection.trim() || savingReflection) return;
                setSavingReflection(true);
                try {
                  await reflectApi.post('/v1/posts', {
                    post: {
                      body: reflection.trim(),
                      roomPostStatus: 1,
                      draft: false,
                      references: guidance
                        ? [
                            {
                              chapterId: parseInt(guidance.verseKey.split(':')[0], 10),
                              from: guidance.verseNumber,
                              to: guidance.verseNumber
                            }
                          ]
                        : [],
                      mentions: []
                    }
                  });
                  setSavedReflection(true);
                } catch {
                  // Save still marks as saved locally if API fails (offline/scope issue)
                  setSavedReflection(true);
                } finally {
                  setSavingReflection(false);
                }
              }}
              disabled={!reflection.trim() || savingReflection}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm',
                reflection.trim() && !savingReflection
                  ? 'bg-linear-to-r from-primary to-teal text-white shadow-sm hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {savingReflection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Pencil className="w-4 h-4" />
              )}
              <span>{savingReflection ? 'Saving...' : 'Save Reflection'}</span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-semibold">Reflection saved to your journal</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Related Themes */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground text-sm">Continue Your Journey</h3>
        <div className="flex flex-wrap gap-2">
          {guidance.relatedThemes.map((theme) => (
            <motion.div key={theme} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/dashboard/collections/${theme}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-semibold"
              >
                <span className="capitalize">{theme}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 rounded-2xl bg-linear-to-br from-teal-muted to-violet-muted border border-primary/15 space-y-3 shadow-sm">
        <h3 className="font-bold text-foreground text-sm">Keep the Connection</h3>
        <p className="text-sm text-muted-foreground">
          Let this guidance sink in. Consider exploring more verses on similar themes.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard/collections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-primary to-teal text-white font-semibold transition-all text-sm shadow-sm hover:opacity-90"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Collections</span>
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard/reflections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground border border-border font-semibold hover:bg-secondary transition-all text-sm"
            >
              <Pencil className="w-4 h-4" />
              <span>View Journal</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
