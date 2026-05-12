import type { UserProgress, GardenState, Mission } from '../types';

const STORAGE_KEY = 'hidaayah_garden_progress';

const DEFAULT_GARDEN: GardenState = {
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  trees: 0,
  flowers: 0,
  water: false,
  lastWatered: null
};

const DEFAULT_PROGRESS: UserProgress = {
  missions: [],
  garden: DEFAULT_GARDEN,
  lastActive: new Date().toISOString(),
  completedChallenges: [],
  memorizedVerses: []
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = progress.lastActive?.split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = progress.garden.currentStreak;

  if (lastActive === today) {
    return progress;
  } else if (lastActive === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  return {
    ...progress,
    lastActive: new Date().toISOString(),
    garden: {
      ...progress.garden,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, progress.garden.longestStreak)
    }
  };
}

export function completeMission(progress: UserProgress, missionId: string): UserProgress {
  const mission = progress.missions.find((m) => m.id === missionId);
  if (!mission || mission.completed) return progress;

  const updatedMissions = progress.missions.map((m) =>
    m.id === missionId ? { ...m, completed: true, progress: m.target } : m
  );

  const newXP = progress.garden.totalXP + mission.xp;
  const newLevel = Math.floor(newXP / 500) + 1;
  const newTrees = Math.floor(newXP / 200);
  const newFlowers = Math.floor(newXP / 50);

  return {
    ...progress,
    missions: updatedMissions,
    garden: {
      ...progress.garden,
      totalXP: newXP,
      level: newLevel,
      trees: Math.min(newTrees, 10),
      flowers: Math.min(newFlowers, 30)
    }
  };
}
