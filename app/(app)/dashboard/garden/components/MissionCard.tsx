'use client';

import { motion } from 'framer-motion';
import { Check, BookOpen, Brain, Ear, RotateCcw, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mission } from '../types';

const MISSION_ICONS = {
  recitation: BookOpen,
  memorization: Brain,
  tafseer: BookText,
  listening: Ear,
  revision: RotateCcw
};

const MISSION_COLORS = {
  recitation: 'from-teal-muted to-teal/20 border-teal/30',
  memorization: 'from-violet-muted to-violet/20 border-violet/30',
  tafseer: 'from-gold-muted to-accent/20 border-accent/30',
  listening: 'from-rose-muted to-rose/20 border-rose/30',
  revision: 'from-primary/10 to-primary/5 border-primary/30'
};

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
}

export function MissionCard({ mission, onComplete }: MissionCardProps) {
  const Icon = MISSION_ICONS[mission.type];
  const progress = (mission.progress / mission.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br p-5 overflow-hidden',
        MISSION_COLORS[mission.type],
        mission.completed && 'opacity-60'
      )}
    >
      {mission.completed && (
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-foreground" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-bold text-foreground text-base">{mission.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{mission.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {mission.progress} / {mission.target}
              </span>
              <span className="font-semibold text-primary">+{mission.xp} XP</span>
            </div>

            <div className="h-2 rounded-full bg-background/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-teal"
              />
            </div>
          </div>

          {!mission.completed && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete(mission.id)}
              className="w-full py-2.5 rounded-xl bg-background/70 backdrop-blur-sm text-foreground font-semibold text-sm hover:bg-background transition-colors"
            >
              Mark Complete
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
