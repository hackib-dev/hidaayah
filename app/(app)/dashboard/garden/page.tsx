'use client';

import { Navigation } from '@/components/navigation';
import { QuranGarden } from '@/components/quran-garden';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function GardenPage() {
  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <Navigation />
      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto space-y-5 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Your Quran Journey
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Quran Garden
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every verse read, reflection written, and goal completed nurtures your garden.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <QuranGarden />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
