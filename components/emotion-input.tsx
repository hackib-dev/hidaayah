'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Cloud, Zap, Sunrise, Moon, Wind, Sparkles, ArrowRight, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emotions = [
  {
    id: 'anxious',
    label: 'Anxious',
    icon: Cloud,
    color: 'bg-violet-muted text-violet border-violet/20',
    activeColor: 'bg-violet text-white border-violet'
  },
  {
    id: 'grateful',
    label: 'Grateful',
    icon: Sunrise,
    color: 'bg-gold-muted text-accent border-accent/20',
    activeColor: 'bg-accent text-accent-foreground border-accent'
  },
  {
    id: 'lost',
    label: 'Lost',
    icon: Wind,
    color: 'bg-secondary text-muted-foreground border-border',
    activeColor: 'bg-primary text-primary-foreground border-primary'
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    icon: Sparkles,
    color: 'bg-teal-muted text-teal border-teal/20',
    activeColor: 'bg-teal text-white border-teal'
  },
  {
    id: 'struggling',
    label: 'Struggling',
    icon: Zap,
    color: 'bg-rose-muted text-rose border-rose/20',
    activeColor: 'bg-rose text-white border-rose'
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    icon: Moon,
    color: 'bg-gold-muted text-accent border-accent/20',
    activeColor: 'bg-accent text-accent-foreground border-accent'
  }
];

interface EmotionInputProps {
  onSubmit: (data: { emotion: string; situation: string }) => void;
}

export function EmotionInput({ onSubmit }: EmotionInputProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [situation, setSituation] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (selectedEmotion || situation.trim()) {
      onSubmit({
        emotion: selectedEmotion || '',
        situation: situation.trim()
      });
    }
  };

  const handleEmotionClick = (emotionId: string) => {
    setSelectedEmotion(selectedEmotion === emotionId ? null : emotionId);
  };

  const canSubmit = !!(selectedEmotion || situation.trim());

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Main Input */}
      <motion.div
        animate={{
          borderColor: isFocused ? 'oklch(0.40 0.12 185 / 0.5)' : 'oklch(0.90 0.006 85)',
          boxShadow: isFocused ? '0 0 0 3px oklch(0.40 0.12 185 / 0.08)' : 'none'
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl bg-card border overflow-hidden"
      >
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What's on your heart today? Share your feelings, situation, or what you're going through..."
          className="w-full min-h-[100px] md:min-h-[110px] p-4 pb-14 bg-transparent rounded-2xl text-foreground text-sm md:text-base placeholder:text-muted-foreground/60 resize-none focus:outline-none leading-relaxed"
        />

        {/* Bottom Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground touch-target"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: canSubmit ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              canSubmit
                ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <span>Seek Guidance</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Emotion Chips */}
      <div className="space-y-2.5">
        <p className="text-xs md:text-sm text-muted-foreground font-medium px-1">
          Or select how you&apos;re feeling:
        </p>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion, index) => {
            const Icon = emotion.icon;
            const isSelected = selectedEmotion === emotion.id;
            return (
              <motion.button
                key={emotion.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleEmotionClick(emotion.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 touch-target',
                  isSelected ? emotion.activeColor : emotion.color
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected && 'animate-bounce-subtle')} />
                <span>{emotion.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
