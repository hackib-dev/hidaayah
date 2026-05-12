// Centralized Garden Growth System
// This tracks ALL Quran activities across the app and updates the garden

import { UserProgress, GardenState } from '../app/(app)/dashboard/garden/types';

const GARDEN_STORAGE_KEY = 'hidaayah_garden_progress';

// Activity types that contribute to garden growth
export type GardenActivity =
  | 'quran_read' // Reading Quran
  | 'challenge_complete' // Completing challenges
  | 'tafseer_read' // Reading tafseer
  | 'reflection_write' // Writing reflections
  | 'streak_maintain' // Daily streak
  | 'circle_join' // Joining circles
  | 'audio_listen' // Listening to recitation
  | 'verse_bookmark' // Bookmarking verses
  | 'companion_interact'; // AI companion interaction

// XP rewards for each activity
const ACTIVITY_XP: Record<GardenActivity, number> = {
  quran_read: 5,
  challenge_complete: 20,
  tafseer_read: 10,
  reflection_write: 15,
  streak_maintain: 25,
  circle_join: 30,
  audio_listen: 5,
  verse_bookmark: 3,
  companion_interact: 5
};

// Garden impact messages
const ACTIVITY_MESSAGES: Record<GardenActivity, string> = {
  quran_read: 'Your garden is watered with divine words 💧',
  challenge_complete: 'New flowers bloom in your garden 🌸',
  tafseer_read: 'A wisdom tree grows in your garden 🌳',
  reflection_write: 'A peaceful pathway appears in your garden 🛤️',
  streak_maintain: 'Your garden glows with consistency ✨',
  circle_join: 'Your garden expands with community 🌿',
  audio_listen: 'Melodious recitation nourishes your garden 🎵',
  verse_bookmark: 'A special flower is planted 🌺',
  companion_interact: 'Your garden receives gentle care 🌱'
};

// Load garden progress
export function loadGardenProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress();
  }

  const stored = localStorage.getItem(GARDEN_STORAGE_KEY);
  if (!stored) {
    return getDefaultProgress();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultProgress();
  }
}

// Save garden progress
export function saveGardenProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(progress));
}

// Record activity and update garden
export function recordGardenActivity(
  activity: GardenActivity,
  metadata?: {
    verseKey?: string;
    surahName?: string;
    duration?: number;
    correct?: boolean;
  }
): { xpGained: number; message: string; newLevel?: number } {
  const progress = loadGardenProgress();

  // Calculate XP
  let xpGained = ACTIVITY_XP[activity];

  // Bonus XP for specific conditions
  if (activity === 'challenge_complete' && metadata?.correct) {
    xpGained += 10; // Bonus for correct answer
  }

  if (metadata?.duration && metadata.duration < 30) {
    xpGained += 5; // Speed bonus
  }

  // Update garden
  const oldLevel = progress.garden.level;
  progress.garden.totalXP += xpGained;
  progress.garden.level = Math.floor(progress.garden.totalXP / 500) + 1;

  // Update plants based on activity
  updateGardenPlants(progress.garden, activity);

  // Track activity
  if (!progress.garden.activities) {
    progress.garden.activities = [];
  }

  progress.garden.activities.push({
    type: activity,
    timestamp: new Date().toISOString(),
    xp: xpGained,
    metadata
  });

  // Keep only last 100 activities
  if (progress.garden.activities.length > 100) {
    progress.garden.activities = progress.garden.activities.slice(-100);
  }

  // Update last activity
  progress.garden.lastActivity = new Date().toISOString();

  // Save
  saveGardenProgress(progress);

  // Dispatch custom event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gardenUpdate', {
        detail: {
          activity,
          xpGained,
          newLevel: progress.garden.level !== oldLevel ? progress.garden.level : undefined
        }
      })
    );
  }

  return {
    xpGained,
    message: ACTIVITY_MESSAGES[activity],
    newLevel: progress.garden.level !== oldLevel ? progress.garden.level : undefined
  };
}

// Update garden plants based on activity
function updateGardenPlants(garden: GardenState, activity: GardenActivity): void {
  switch (activity) {
    case 'quran_read':
    case 'audio_listen':
      // Add water drops
      garden.waterLevel = Math.min((garden.waterLevel || 0) + 1, 100);
      break;

    case 'challenge_complete':
    case 'verse_bookmark':
      // Add flowers
      garden.flowers = Math.min((garden.flowers || 0) + 1, 50);
      break;

    case 'tafseer_read':
      // Add trees
      garden.trees = Math.min((garden.trees || 0) + 1, 20);
      break;

    case 'reflection_write':
      // Add pathways
      garden.pathways = Math.min((garden.pathways || 0) + 1, 15);
      break;

    case 'streak_maintain':
      // Increase light
      garden.lightLevel = Math.min((garden.lightLevel || 0) + 5, 100);
      break;

    case 'circle_join':
      // Expand regions
      garden.regions = Math.min((garden.regions || 0) + 1, 10);
      break;
  }
}

// Get garden statistics
export function getGardenStats(): {
  totalActivities: number;
  activitiesToday: number;
  favoriteActivity: GardenActivity | null;
  currentStreak: number;
} {
  const progress = loadGardenProgress();
  const activities = progress.garden.activities || [];

  const today = new Date().toISOString().split('T')[0];
  const activitiesToday = activities.filter((a) => a.timestamp.startsWith(today)).length;

  // Find favorite activity
  const activityCounts: Record<string, number> = {};
  activities.forEach((a) => {
    activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
  });

  const favoriteActivity =
    Object.keys(activityCounts).length > 0
      ? (Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0][0] as GardenActivity)
      : null;

  return {
    totalActivities: activities.length,
    activitiesToday,
    favoriteActivity,
    currentStreak: progress.garden.currentStreak
  };
}

// Check if user was active today
export function wasActiveToday(): boolean {
  const progress = loadGardenProgress();
  const lastActivity = progress.garden.lastActivity;

  if (!lastActivity) return false;

  const today = new Date().toISOString().split('T')[0];
  return lastActivity.startsWith(today);
}

// Update streak (call this daily)
export function updateDailyStreak(): void {
  const progress = loadGardenProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastStreakDate = progress.garden.lastStreakDate;

  if (lastStreakDate === today) {
    return; // Already updated today
  }

  if (wasActiveToday()) {
    // Check if yesterday was active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStreakDate === yesterdayStr) {
      // Continue streak
      progress.garden.currentStreak += 1;
      recordGardenActivity('streak_maintain');
    } else if (!lastStreakDate || lastStreakDate < yesterdayStr) {
      // Start new streak
      progress.garden.currentStreak = 1;
    }

    // Update longest streak
    progress.garden.longestStreak = Math.max(
      progress.garden.longestStreak,
      progress.garden.currentStreak
    );

    progress.garden.lastStreakDate = today;
    saveGardenProgress(progress);
  }
}

// Get default progress
function getDefaultProgress(): UserProgress {
  return {
    garden: {
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      flowers: 0,
      trees: 0,
      pathways: 0,
      waterLevel: 0,
      lightLevel: 50,
      regions: 1,
      water: false,
      lastWatered: null,
      lastActivity: new Date().toISOString(),
      activities: []
    },
    missions: []
  };
}

// Helper to show garden notification
export function showGardenNotification(message: string): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('showGardenNotification', {
      detail: { message }
    })
  );
}
