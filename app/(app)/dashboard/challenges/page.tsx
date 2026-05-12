'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { Challenge, ChallengeType, Difficulty, GameMode, MultiplayerGame } from './types';
import { generateChallenge } from './utils/mockData';
import { getChallengeProgress, updateProgress } from './utils/storage';
import { recordGardenActivity } from '@/lib/gardenTracking';
import { GameModeSelector } from './components/GameModeSelector';
import { ChallengeSelector } from './components/ChallengeSelector';
import { MultiplayerSetup } from './components/MultiplayerSetup';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGameView } from './components/MultiplayerGameView';
import { CompleteAyah } from './components/CompleteAyah';
import { ProgressDisplay } from './components/ProgressDisplay';

export default function ChallengesPage() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [multiplayerGame, setMultiplayerGame] = useState<MultiplayerGame | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState(getChallengeProgress());
  const [showGardenImpact, setShowGardenImpact] = useState(false);
  const [gardenMessage, setGardenMessage] = useState('');

  useEffect(() => {
    setProgress(getChallengeProgress());
  }, []);

  const startChallenge = (type: ChallengeType, difficulty: Difficulty) => {
    const newChallenge = generateChallenge(type, difficulty);
    setChallenge(newChallenge);
  };

  const startMultiplayerGame = (
    circleId: string,
    type: ChallengeType,
    difficulty: Difficulty,
    questionCount: number
  ) => {
    // Create mock multiplayer game
    const game: MultiplayerGame = {
      id: `game-${Date.now()}`,
      circleId,
      circleName: 'Family Circle',
      hostId: 'user-1',
      hostName: 'You',
      challengeType: type,
      difficulty,
      questionCount,
      currentQuestion: 1,
      players: [
        {
          id: 'user-1',
          name: 'You',
          score: 0,
          correctAnswers: 0,
          isReady: true,
          joinedAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          name: 'Ahmad',
          score: 0,
          correctAnswers: 0,
          isReady: false,
          joinedAt: new Date().toISOString()
        }
      ],
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    setMultiplayerGame(game);
  };

  const startMultiplayerRound = () => {
    if (!multiplayerGame) return;
    const newChallenge = generateChallenge(
      multiplayerGame.challengeType,
      multiplayerGame.difficulty
    );
    setMultiplayerGame({ ...multiplayerGame, status: 'active' });
    setChallenge(newChallenge);
  };

  const handleComplete = (correct: boolean, timeSpent: number) => {
    if (!challenge) return;

    let xp = 10;
    if (correct) {
      xp =
        challenge.difficulty === 'easy'
          ? 10
          : challenge.difficulty === 'medium'
            ? 20
            : challenge.difficulty === 'hard'
              ? 30
              : 40;

      if (timeSpent < 30) xp += 5;
    }

    // Update multiplayer game if active
    if (multiplayerGame && multiplayerGame.status === 'active') {
      const updatedPlayers = multiplayerGame.players.map((p) =>
        p.id === 'user-1'
          ? {
              ...p,
              score: p.score + (correct ? 100 : 0),
              correctAnswers: p.correctAnswers + (correct ? 1 : 0)
            }
          : p
      );

      const nextQuestion = multiplayerGame.currentQuestion + 1;
      if (nextQuestion > multiplayerGame.questionCount) {
        setMultiplayerGame({ ...multiplayerGame, status: 'completed', players: updatedPlayers });
      } else {
        setMultiplayerGame({
          ...multiplayerGame,
          currentQuestion: nextQuestion,
          players: updatedPlayers
        });
        setTimeout(() => {
          const newChallenge = generateChallenge(
            multiplayerGame.challengeType,
            multiplayerGame.difficulty
          );
          setChallenge(newChallenge);
        }, 2000);
        return;
      }
    }

    const result = {
      challengeId: challenge.id,
      correct,
      timeSpent,
      hintsUsed: 0,
      score: correct ? 100 : 0,
      xpEarned: xp,
      gardenImpact: {
        type: correct ? ('growth' as const) : ('water' as const),
        intensity: correct ? 2 : 1,
        message: correct
          ? 'Your garden blooms with new flowers! 🌸'
          : 'Your garden receives gentle nourishment 💧'
      }
    };

    const newProgress = updateProgress(result);
    setProgress(newProgress);

    // Record garden activity
    const gardenResult = recordGardenActivity('challenge_complete', {
      verseKey: challenge.verseKey,
      surahName: challenge.surahName,
      duration: timeSpent,
      correct
    });

    setGardenMessage(gardenResult.message);
    setShowGardenImpact(true);
    setTimeout(() => setShowGardenImpact(false), 3000);

    setTimeout(() => {
      setChallenge(null);
      if (multiplayerGame?.status === 'completed') {
        setMultiplayerGame(null);
        setGameMode(null);
      }
    }, 3000);
  };

  return (
    <main className="min-h-screen pb-20 md:pb-8 bg-gradient-to-b from-background to-secondary/20">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 border border-violet-300 dark:border-violet-700">
              <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                Quran Challenges
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Strengthen Your Memory
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Test and improve your Quran memorization through immersive challenges
            </p>
          </motion.div>

          {progress.totalCompleted > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <ProgressDisplay progress={progress} />
            </motion.div>
          )}

          <AnimatePresence>
            {showGardenImpact && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-2xl border-2 border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <p className="font-semibold">{gardenMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!gameMode ? (
              <motion.div
                key="mode-selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GameModeSelector onSelect={setGameMode} />
              </motion.div>
            ) : gameMode === 'multiplayer' && !multiplayerGame ? (
              <motion.div
                key="multiplayer-setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MultiplayerSetup onStart={startMultiplayerGame} onBack={() => setGameMode(null)} />
              </motion.div>
            ) : multiplayerGame && multiplayerGame.status === 'waiting' ? (
              <motion.div
                key="multiplayer-lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MultiplayerLobby
                  game={multiplayerGame}
                  isHost={true}
                  onStart={startMultiplayerRound}
                  onCancel={() => {
                    setMultiplayerGame(null);
                    setGameMode(null);
                  }}
                />
              </motion.div>
            ) : challenge ? (
              <motion.div
                key="challenge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setChallenge(null);
                    if (multiplayerGame) {
                      setMultiplayerGame(null);
                      setGameMode(null);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Challenges</span>
                </motion.button>
                {multiplayerGame && multiplayerGame.status === 'active' ? (
                  <MultiplayerGameView
                    game={multiplayerGame}
                    challenge={challenge}
                    onComplete={handleComplete}
                  />
                ) : (
                  <CompleteAyah challenge={challenge} onComplete={handleComplete} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChallengeSelector onSelect={startChallenge} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
