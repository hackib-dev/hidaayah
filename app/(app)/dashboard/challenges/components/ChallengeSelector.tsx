'use client';

import { motion } from 'framer-motion';
import { Brain, ArrowRight, Sparkles, BookOpen, Music, Lightbulb, Zap } from 'lucide-react';
import { ChallengeType, Difficulty } from '../types';

interface ChallengeSelectorProps {
  onSelect: (type: ChallengeType, difficulty: Difficulty) => void;
}

const challenges = [
  {
    type: 'ayah_completion' as ChallengeType,
    title: 'Complete the Ayah',
    description: 'Fill in the missing words from Quran verses',
    icon: Brain,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    type: 'next_ayah' as ChallengeType,
    title: 'Continue the Verse',
    description: 'Recall what comes after the displayed ayah',
    icon: ArrowRight,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    type: 'guess_surah' as ChallengeType,
    title: 'Guess the Surah',
    description: 'Identify the surah from clues and verses',
    icon: Sparkles,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    type: 'missing_word' as ChallengeType,
    title: 'Missing Word',
    description: 'Choose the correct word to complete the verse',
    icon: Zap,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    type: 'tafseer_match' as ChallengeType,
    title: 'Match the Tafseer',
    description: 'Connect verses with their meanings',
    icon: Lightbulb,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600'
  },
  {
    type: 'audio_recognition' as ChallengeType,
    title: 'Audio Recognition',
    description: 'Identify verses from recitation',
    icon: Music,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    comingSoon: true
  }
];

export function ChallengeSelector({ onSelect }: ChallengeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Your Challenge</h2>
        <p className="text-sm text-muted-foreground">
          Each challenge strengthens your connection with the Quran
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => !challenge.comingSoon && onSelect(challenge.type, 'medium')}
              disabled={challenge.comingSoon}
              className={`w-full p-6 rounded-2xl text-left transition-all duration-300 ${
                challenge.comingSoon
                  ? 'bg-secondary/50 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-br hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{
                backgroundImage: challenge.comingSoon
                  ? 'none'
                  : `linear-gradient(135deg, var(--${challenge.color}-muted) 0%, var(--${challenge.color}/10) 100%)`
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${challenge.gradient}`}>
                  <challenge.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                {challenge.comingSoon && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{challenge.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenge.description}
              </p>

              {!challenge.comingSoon && (
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>Start Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-teal/10 border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Garden Integration</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every challenge you complete nourishes your Quran Garden, helping it grow and bloom
              with your spiritual progress.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
