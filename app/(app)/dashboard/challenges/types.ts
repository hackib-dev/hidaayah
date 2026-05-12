// Challenge System Types

export type ChallengeType =
  | 'ayah_completion'
  | 'next_ayah'
  | 'guess_surah'
  | 'missing_word'
  | 'audio_recognition'
  | 'tafseer_match';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type ChallengeMode = 'single' | 'timed' | 'streak' | 'rapid_fire' | 'practice';

export type GameMode = 'solo' | 'multiplayer';

export interface Challenge {
  id: string;
  type: ChallengeType;
  difficulty: Difficulty;
  mode: ChallengeMode;
  verseKey: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  audioUrl?: string;
  tafseer?: string;
  theme?: string;
  timeLimit?: number;
}

export interface MultiplayerGame {
  id: string;
  circleId: string;
  circleName: string;
  hostId: string;
  hostName: string;
  challengeType: ChallengeType;
  difficulty: Difficulty;
  questionCount: number;
  currentQuestion: number;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'active' | 'completed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  correctAnswers: number;
  currentAnswer?: string;
  isReady: boolean;
  joinedAt: string;
}

export interface Circle {
  id: string;
  name: string;
  memberCount: number;
  members?: CircleMember[];
}

export interface CircleMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export interface ChallengeResult {
  challengeId: string;
  correct: boolean;
  timeSpent: number;
  hintsUsed: number;
  score: number;
  xpEarned: number;
  gardenImpact: GardenImpact;
}

export interface GardenImpact {
  type: 'growth' | 'bloom' | 'water' | 'light' | 'unlock';
  intensity: number;
  message: string;
}

export interface ChallengeProgress {
  totalCompleted: number;
  correctAnswers: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  weakAyahs: string[];
  strongAyahs: string[];
  lastPlayed: string;
}

export interface ChallengeStats {
  byType: Record<
    ChallengeType,
    {
      completed: number;
      accuracy: number;
      avgTime: number;
    }
  >;
  byDifficulty: Record<
    Difficulty,
    {
      completed: number;
      accuracy: number;
    }
  >;
  recentChallenges: ChallengeResult[];
}
