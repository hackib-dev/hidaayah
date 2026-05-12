export type MissionType = 'recitation' | 'memorization' | 'tafseer' | 'listening' | 'revision';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  xp: number;
  date: string;
}

export interface GardenActivity {
  type: string;
  timestamp: string;
  xp: number;
  metadata?: {
    verseKey?: string;
    surahName?: string;
    duration?: number;
    correct?: boolean;
  };
}

export interface GardenState {
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  trees: number;
  flowers: number;
  water: boolean;
  lastWatered: string | null;
  waterLevel?: number;
  lightLevel?: number;
  pathways?: number;
  regions?: number;
  lastActivity?: string;
  lastStreakDate?: string;
  activities?: GardenActivity[];
}

export interface ChallengeQuestion {
  id: string;
  type: 'complete' | 'arrange' | 'missing';
  verseKey: string;
  surahName: string;
  question: string;
  answer: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProgress {
  missions: Mission[];
  garden: GardenState;
  lastActive?: string;
  completedChallenges?: string[];
  memorizedVerses?: string[];
}
