import { ChallengeProgress, ChallengeResult, ChallengeStats } from '../types';

const STORAGE_KEY = 'hidaayah_challenge_progress';
const STATS_KEY = 'hidaayah_challenge_stats';

export function getChallengeProgress(): ChallengeProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultProgress();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultProgress();
  }
}

export function saveChallengeProgress(progress: ChallengeProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateProgress(result: ChallengeResult): ChallengeProgress {
  const progress = getChallengeProgress();

  progress.totalCompleted += 1;
  if (result.correct) {
    progress.correctAnswers += 1;
    progress.currentStreak += 1;
    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
  } else {
    progress.currentStreak = 0;
  }

  progress.totalXP += result.xpEarned;
  progress.level = Math.floor(progress.totalXP / 100) + 1;
  progress.lastPlayed = new Date().toISOString();

  saveChallengeProgress(progress);
  return progress;
}

export function getChallengeStats(): ChallengeStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) {
    return getDefaultStats();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultStats();
  }
}

export function saveChallengeStats(stats: ChallengeStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function getDefaultProgress(): ChallengeProgress {
  return {
    totalCompleted: 0,
    correctAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXP: 0,
    level: 1,
    weakAyahs: [],
    strongAyahs: [],
    lastPlayed: new Date().toISOString()
  };
}

function getDefaultStats(): ChallengeStats {
  return {
    byType: {
      ayah_completion: { completed: 0, accuracy: 0, avgTime: 0 },
      next_ayah: { completed: 0, accuracy: 0, avgTime: 0 },
      guess_surah: { completed: 0, accuracy: 0, avgTime: 0 },
      missing_word: { completed: 0, accuracy: 0, avgTime: 0 },
      audio_recognition: { completed: 0, accuracy: 0, avgTime: 0 },
      tafseer_match: { completed: 0, accuracy: 0, avgTime: 0 }
    },
    byDifficulty: {
      easy: { completed: 0, accuracy: 0 },
      medium: { completed: 0, accuracy: 0 },
      hard: { completed: 0, accuracy: 0 },
      expert: { completed: 0, accuracy: 0 }
    },
    recentChallenges: []
  };
}
