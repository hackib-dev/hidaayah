'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAppState } from '@/components/app-state-provider';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ThemeCollectionPage() {
  const params = useParams();
  const theme = params.theme as string;
  const { themeData, defaultTheme } = useAppState();
  const data = themeData[theme] || {
    ...defaultTheme,
    title: theme.charAt(0).toUpperCase() + theme.slice(1)
  };
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * data.verses.length);
    setCurrentIndex(randomIndex);
  };

  return (
    <main className="min-h-screen pb-24 md:pb-12">
      <Navigation />

      <div className="pt-20 md:pt-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8 py-8">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Collections</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-2xl p-8 bg-gradient-to-br border shadow-sm',
              data.gradient,
              data.border
            )}
          >
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {data.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">{data.description}</p>
              <div className="flex flex-wrap gap-3 items-center pt-2">
                <button
                  onClick={handleShuffle}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle Verse
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-3xl bg-card border border-border overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                        Currently viewing
                      </p>
                      <h2 className="text-xl font-bold text-foreground">{data.title}</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">
                      <Play className="w-4 h-4" />
                      Verse {data.verses[currentIndex]?.ayah}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p
                      className="text-3xl leading-tight text-foreground"
                      style={{ fontFamily: 'var(--font-arabic)' }}
                    >
                      {data.verses[currentIndex]?.arabic}
                    </p>
                    <p className="text-sm text-muted-foreground font-serif italic">
                      &ldquo;{data.verses[currentIndex]?.translation}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">All verses</h3>
                  <div className="text-xs text-muted-foreground">{data.verses.length} total</div>
                </div>
                <div className="space-y-3">
                  {data.verses.map((verse, index) => (
                    <motion.button
                      key={verse.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        'w-full text-left rounded-2xl p-3 transition-colors',
                        currentIndex === index
                          ? 'bg-primary/10 text-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      <div className="text-sm font-semibold">
                        {verse.surah} : {verse.ayah}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{verse.translation}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Verse tools</h3>
                <p className="text-sm text-muted-foreground">
                  Shuffle between verses or explore the current collection in one place.
                </p>
                <div className="grid gap-3">
                  <button
                    onClick={handleShuffle}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Shuffle className="w-4 h-4" />
                    Shuffle verse
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Browse collection</h3>
                <p className="text-sm text-muted-foreground">
                  Use the list of verses to jump directly to the passage you want to reflect on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
