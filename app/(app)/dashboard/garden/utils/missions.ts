import type { Mission, MissionType, UserProgress } from '../types';

const MISSION_TEMPLATES: Record<MissionType, { title: string; desc: string; xp: number }[]> = {
  recitation: [
    { title: 'Recite 2 pages', desc: 'Continue your daily recitation', xp: 50 },
    { title: 'Recite 5 pages', desc: 'Deepen your connection today', xp: 100 },
    { title: 'Complete 1 Juz', desc: 'A meaningful milestone', xp: 200 }
  ],
  memorization: [
    { title: 'Memorize 1 ayah', desc: 'Add to your heart', xp: 80 },
    { title: 'Memorize 3 ayahs', desc: 'Strengthen your memory', xp: 150 },
    { title: 'Memorize 1 page', desc: 'A powerful achievement', xp: 250 }
  ],
  tafseer: [
    { title: 'Read tafseer for 1 ayah', desc: 'Understand deeper meanings', xp: 60 },
    { title: 'Reflect on Surah Al-Mulk', desc: 'Contemplate divine wisdom', xp: 100 }
  ],
  listening: [
    { title: 'Listen to 1 Surah', desc: 'Let the words touch your heart', xp: 70 },
    { title: 'Listen to Juz Amma', desc: 'Immerse in recitation', xp: 120 }
  ],
  revision: [
    { title: "Revise yesterday's memorization", desc: 'Strengthen retention', xp: 60 },
    { title: 'Revise 5 memorized ayahs', desc: 'Keep your memory fresh', xp: 90 }
  ]
};

export function generateDailyMissions(userProgress?: UserProgress): Mission[] {
  const today = new Date().toISOString().split('T')[0];
  const streak = userProgress?.garden.currentStreak ?? 0;

  const difficulty = streak < 3 ? 'easy' : streak < 10 ? 'medium' : 'hard';

  const missions: Mission[] = [];

  const recitationTemplate =
    MISSION_TEMPLATES.recitation[difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2];
  missions.push({
    id: `${today}-recitation`,
    type: 'recitation',
    title: recitationTemplate.title,
    description: recitationTemplate.desc,
    target: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 20,
    progress: 0,
    completed: false,
    xp: recitationTemplate.xp,
    date: today
  });

  if (userProgress?.memorizedVerses && userProgress.memorizedVerses.length > 0) {
    const memTemplate = MISSION_TEMPLATES.memorization[0];
    missions.push({
      id: `${today}-memorization`,
      type: 'memorization',
      title: memTemplate.title,
      description: memTemplate.desc,
      target: 1,
      progress: 0,
      completed: false,
      xp: memTemplate.xp,
      date: today
    });
  }

  const tafseerTemplate =
    MISSION_TEMPLATES.tafseer[Math.floor(Math.random() * MISSION_TEMPLATES.tafseer.length)];
  missions.push({
    id: `${today}-tafseer`,
    type: 'tafseer',
    title: tafseerTemplate.title,
    description: tafseerTemplate.desc,
    target: 1,
    progress: 0,
    completed: false,
    xp: tafseerTemplate.xp,
    date: today
  });

  return missions;
}

export function calculateGardenGrowth(xp: number): {
  trees: number;
  flowers: number;
  level: number;
} {
  const level = Math.floor(xp / 500) + 1;
  const trees = Math.floor(xp / 200);
  const flowers = Math.floor(xp / 50);

  return { level, trees: Math.min(trees, 10), flowers: Math.min(flowers, 30) };
}
