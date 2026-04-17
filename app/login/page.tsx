'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login();
      // login() redirects the browser — no router.replace needed
    } catch {
      setError('Could not redirect to login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-base font-bold">H</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Hidaayah</span>
          </Link>
          <h1 className="text-xl font-serif font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your journey</p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Sign in securely via Quran Foundation — you&apos;ll be redirected back after login.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all',
              loading
                ? 'bg-primary/60 text-primary-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue with Quran Foundation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <Link
            href="/home"
            className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue without an account →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
