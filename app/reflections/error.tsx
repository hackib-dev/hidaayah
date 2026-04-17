'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center space-y-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 mx-auto flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif font-bold text-foreground">Journal unavailable</h2>
          <p className="text-sm text-muted-foreground">
            Something went wrong loading your reflections. Please try again.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-semibold text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </motion.button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
