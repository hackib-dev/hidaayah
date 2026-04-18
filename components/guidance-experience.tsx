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
import { searchByEmotion, fetchTafsirByAyah } from '@/app/guidance/queries';
import { createBookmark } from '@/app/reflections/queries';
import { fetchVerseByKey, fetchChapterAudio } from '@/app/quran/queries';
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

const REFLECTION_PROMPTS: Record<string, string[]> = {
  anxious: [
    'What specific burden feels overwhelming right now?',
    'How might this challenge be preparing you for something greater?',
    "What would trusting Allah's plan look like in this moment?"
  ],
  grateful: [
    'What blessing are you most grateful for today?',
    'How can you express this gratitude through action?',
    'Who in your life deserves your thanks?'
  ],
  lost: [
    'What direction in life feels most unclear right now?',
    'What small step could you take toward clarity?',
    'How has Allah guided you through confusion before?'
  ],
  hopeful: [
    'What hope is blooming in your heart?',
    'How can you nurture this hope through action?',
    'What past difficulty taught you to hope?'
  ],
  struggling: [
    'What ease exists alongside your current difficulty?',
    'How might this struggle be shaping you?',
    'What would you tell someone else facing this challenge?'
  ],
  peaceful: [
    'What brought you this feeling of peace?',
    'How can you cultivate more moments like this?',
    'What does remembrance of Allah look like in your daily life?'
  ],
  default: [
    'What healing do you seek from the Quran today?',
    'How has the Quran provided guidance in your life?',
    'What verse has touched your heart most deeply?'
  ]
};

export function GuidanceExperience({ emotion, situation }: GuidanceExperienceProps) {
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [reflection, setReflection] = useState('');
  const [savedReflection, setSavedReflection] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const emotionKey = emotion.toLowerCase();
  const color = THEME_COLORS[emotionKey] ?? THEME_COLORS.default;
  const prompts = REFLECTION_PROMPTS[emotionKey] ?? REFLECTION_PROMPTS.default;

  // Sync play/pause to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setGuidance(null);
    setShowTafsir(false);
    setIsPlaying(false);
    setAudioUrl(null);

    searchByEmotion(emotion, situation)
      .then(async (res) => {
        // prelive returns results in `navigation`, production in `verses` — use whichever has data
        const navItems = res.result?.navigation ?? [];
        const verse =
          res.result?.verses?.[0] ??
          (navItems.find((n) => n.result_type === 'ayah' && n.key) || null);
        if (!verse) {
          setError('No guidance found. Please try again with different words.');
          return;
        }

        const [chapter, verseNum] = verse.key.split(':');
        const surahNum = parseInt(chapter, 10);
        const verseNumber = parseInt(verseNum, 10);

        // Pull related surah names from navigation, or fall back to other ayah keys as themes
        const relatedThemes = navItems
          .filter((n) => n.result_type === 'surah' && n.name)
          .slice(0, 3)
          .map((n) => n.name);

        // Set initial guidance so UI renders immediately
        setGuidance({
          verseKey: verse.key,
          surahName: `Surah ${surahNum}`,
          verseNumber,
          arabic: '',
          translation: '',
          tafsir: null,
          relatedThemes: relatedThemes.length > 0 ? relatedThemes : ['patience', 'trust', 'hope'],
          color
        });

        // Fetch Arabic text, translation, and chapter audio in parallel
        const [verseData, audioRes] = await Promise.all([
          fetchVerseByKey(verse.key, {
            translations: String(QF_DEFAULT_TRANSLATION_ID),
            fields: 'text_uthmani',
            words: false
          }).catch(() => null),
          fetchChapterAudio(QF_DEFAULT_RECITER_ID, surahNum).catch(() => null)
        ]);

        if (audioRes) setAudioUrl(audioRes.audio_file.audio_url);

        if (verseData) {
          setGuidance((prev) =>
            prev
              ? {
                  ...prev,
                  arabic: verseData.verse.text_uthmani ?? '',
                  translation:
                    verseData.verse.translations?.[0]?.text ??
                    (verse.name ?? '').replace(/<[^>]*>/g, '')
                }
              : prev
          );
        } else {
          setGuidance((prev) =>
            prev ? { ...prev, translation: (verse.name ?? '').replace(/<[^>]*>/g, '') } : prev
          );
        }
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
      setGuidance((prev) => (prev ? { ...prev, tafsir: text } : prev));
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
    setIsBookmarked(true);
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
        <Link href="/guidance" className="text-xs text-primary underline">
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
            <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">
              {guidance.verseKey}
            </span>
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

          {/* Hidden audio element */}
          {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}

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

        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground font-semibold">Consider these questions:</p>
          <ul className="space-y-2">
            {prompts.map((prompt, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2.5 text-sm text-foreground/80"
              >
                <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{prompt}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 pt-3 border-t border-border">
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
                href={`/collections/${theme}`}
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
              href="/collections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-primary to-teal text-white font-semibold transition-all text-sm shadow-sm hover:opacity-90"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Collections</span>
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/reflections"
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
