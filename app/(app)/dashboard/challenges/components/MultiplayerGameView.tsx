'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MultiplayerGame, Challenge } from '../types';
import { CompleteAyah } from './CompleteAyah';

interface MultiplayerGameViewProps {
  game: MultiplayerGame;
  challenge: Challenge;
  onComplete: (correct: boolean, timeSpent: number) => void;
}

export function MultiplayerGameView({ game, challenge, onComplete }: MultiplayerGameViewProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-semibold text-foreground">
              Question {game.currentQuestion} of {game.questionCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-foreground">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="p-4 rounded-xl bg-secondary border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Live Leaderboard</h3>
        </div>
        <div className="space-y-2">
          {sortedPlayers.slice(0, 3).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg bg-background"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-amber-500 text-white'
                      : index === 1
                        ? 'bg-slate-400 text-white'
                        : 'bg-orange-600 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-foreground">{player.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {player.correctAnswers}/{game.currentQuestion - 1}
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {player.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Challenge */}
      <CompleteAyah challenge={challenge} onComplete={onComplete} />
    </div>
  );
}
