'use client';

import { Navigation } from '@/components/navigation';
import { RecitationRooms } from '@/components/recitation-rooms';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CirclesPage() {
  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <Navigation />
      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                Recitation Circles
              </h1>
              <p className="text-sm text-muted-foreground">
                Read together, stay consistent, grow in faith
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <RecitationRooms />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
