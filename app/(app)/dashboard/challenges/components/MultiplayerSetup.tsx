'use client';

import { motion } from 'framer-motion';
import { Users, Settings, Play, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Circle, ChallengeType, Difficulty } from '../types';
import { getUserCircles } from '../utils/mockCircles';

interface MultiplayerSetupProps {
  onStart: (
    circleId: string,
    type: ChallengeType,
    difficulty: Difficulty,
    questionCount: number
  ) => void;
  onBack: () => void;
}

const questionOptions = [5, 10, 15, 20];

export function MultiplayerSetup({ onStart, onBack }: MultiplayerSetupProps) {
  const [circles] = useState<Circle[]>(getUserCircles());
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [challengeType, setChallengeType] = useState<ChallengeType>('ayah_completion');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);

  const challengeTypes = [
    { value: 'ayah_completion', label: 'Complete the Ayah' },
    { value: 'next_ayah', label: 'Continue the Verse' },
    { value: 'guess_surah', label: 'Guess the Surah' },
    { value: 'missing_word', label: 'Missing Word' },
    { value: 'tafseer_match', label: 'Match the Tafseer' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'emerald' },
    { value: 'medium', label: 'Medium', color: 'amber' },
    { value: 'hard', label: 'Hard', color: 'rose' },
    { value: 'expert', label: 'Expert', color: 'violet' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Multiplayer Setup</h2>
          <p className="text-sm text-muted-foreground">Configure your game settings</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Circle Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="w-4 h-4" />
            Select Circle
          </label>
          <div className="grid gap-3">
            {circles.map((circle) => (
              <motion.button
                key={circle.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCircle(circle.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedCircle === circle.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                    : 'border-border bg-background hover:border-teal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{circle.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {circle.members?.filter((m) => m.isOnline).length || 0} online •{' '}
                      {circle.memberCount} members
                    </p>
                  </div>
                  {selectedCircle === circle.id && (
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Challenge Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Settings className="w-4 h-4" />
            Challenge Type
          </label>
          <select
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value as ChallengeType)}
            className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-teal-500"
          >
            {challengeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(diff.value as Difficulty)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  difficulty === diff.value
                    ? `border-${diff.color}-500 bg-${diff.color}-50 dark:bg-${diff.color}-950 text-${diff.color}-700 dark:text-${diff.color}-300`
                    : 'border-border bg-background text-muted-foreground hover:border-border/80'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Number of Questions</label>
          <div className="grid grid-cols-4 gap-2">
            {questionOptions.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  questionCount === count
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                    : 'border-border bg-background text-muted-foreground hover:border-border/80'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selectedCircle, challengeType, difficulty, questionCount)}
          disabled={!selectedCircle}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Create Game
        </motion.button>
      </div>
    </div>
  );
}
