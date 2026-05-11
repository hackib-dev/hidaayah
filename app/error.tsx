'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-serif font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. This has been noted. Please try again or return home.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </motion.button>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
