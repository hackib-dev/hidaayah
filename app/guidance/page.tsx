'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { GuidanceExperience } from '@/components/guidance-experience';
import { EmotionInput } from '@/components/emotion-input';
import { ArrowLeft, Sparkles, Lightbulb, Heart, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

function GuidanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasInput, setHasInput] = useState(false);
  const [inputData, setInputData] = useState<{ emotion: string; situation: string } | null>(null);

  useEffect(() => {
    const emotion = searchParams.get('emotion');
    const situation = searchParams.get('situation');
    if (emotion || situation) {
      setInputData({ emotion: emotion || '', situation: situation || '' });
      setHasInput(true);
    }
  }, [searchParams]);

  const handleEmotionSubmit = (data: { emotion: string; situation: string }) => {
    setInputData(data);
    setHasInput(true);
    const params = new URLSearchParams();
    if (data.emotion) params.set('emotion', data.emotion);
    if (data.situation) params.set('situation', data.situation);
    router.push(`/guidance?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    setHasInput(false);
    setInputData(null);
    router.push('/guidance', { scroll: false });
  };

  return (
    <>
      {!hasInput ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-muted to-teal-muted border border-accent/20 text-accent-foreground text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Personalized Quranic guidance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Seek Divine Guidance
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Share your current state - your emotions, struggles, or decisions. Let the Quran
              illuminate your path.
            </p>
          </div>

          <EmotionInput onSubmit={handleEmotionSubmit} />

          {/* Guidance Tips */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              {
                title: 'Be Honest',
                description: 'Share what you truly feel',
                icon: Heart,
                color: 'bg-rose-muted text-rose'
              },
              {
                title: 'Be Specific',
                description: 'More context helps',
                icon: Lightbulb,
                color: 'bg-gold-muted text-accent'
              },
              {
                title: 'Be Open',
                description: 'Ready to receive wisdom',
                icon: BookOpen,
                color: 'bg-teal-muted text-teal'
              }
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="p-4 rounded-2xl bg-card border border-border text-center space-y-2"
              >
                <div
                  className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center ${tip.color}`}
                >
                  <tip.icon className="w-4 h-4" />
                </div>
                <p className="font-bold text-foreground text-sm">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors touch-target font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New guidance</span>
          </motion.button>

          {inputData && (
            <GuidanceExperience emotion={inputData.emotion} situation={inputData.situation} />
          )}
        </motion.div>
      )}
    </>
  );
}

export default function GuidancePage() {
  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto py-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <GuidanceContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
