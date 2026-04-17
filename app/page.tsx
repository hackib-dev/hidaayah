'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useAppState } from '@/components/app-state-provider';
import { ArrowRight, BookOpen, Compass, BookText, Bookmark, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { features, verses, currentVerseIndex, setCurrentVerseIndex } = useAppState();

  useEffect(() => {
    if (!loading && user) router.replace('/home');
  }, [user, loading, router]);

  useEffect(() => {
    if (verses.length === 0) return;
    const interval = window.setInterval(() => {
      setCurrentVerseIndex((prev) => (prev + 1) % verses.length);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [verses.length, setCurrentVerseIndex]);

  const activeVerse = verses[currentVerseIndex] || verses[0];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-sm font-bold">H</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">Hidaayah</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              Your Quranic companion
            </span>
            <p
              className="text-3xl md:text-4xl text-primary mb-3"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight tracking-tight">
              Let the Quran speak
              <br />
              to your moment
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Hidaayah connects your lived experience to divine wisdom. Share what you're going
            through and receive Quranic guidance, tafsir, and a space to reflect.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="flex items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Begin your journey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rotating verse */}
      <section className="py-12 px-5 border-y border-border bg-secondary/40">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <p
            className="text-2xl md:text-3xl text-foreground leading-[2.2]"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {activeVerse.arabic}
          </p>
          <p className="text-sm md:text-base text-muted-foreground font-serif italic">
            &ldquo;{activeVerse.translation}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground font-semibold">{activeVerse.ref}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              A complete spiritual companion in your pocket.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl bg-card border border-border space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* More verses */}
      <section className="py-16 px-5 bg-secondary/30 border-y border-border">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {verses.slice(1).map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-card border border-border space-y-3"
            >
              <p
                className="text-xl text-foreground text-right leading-[2.2]"
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {v.arabic}
              </p>
              <p className="text-sm text-muted-foreground font-serif italic">
                &ldquo;{v.translation}&rdquo;
              </p>
              <p className="text-xs text-primary font-semibold">{v.ref}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Start your journey today
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Free to use. No account required to explore — but sign up to save your reflections and
            track your growth.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Create account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/home"
              className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
            >
              Explore first
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-xs font-bold">H</span>
            </div>
            <span className="font-semibold text-foreground">Hidaayah</span>
          </div>
          <p>Built with sincerity. May it be of benefit.</p>
        </div>
      </footer>
    </div>
  );
}
