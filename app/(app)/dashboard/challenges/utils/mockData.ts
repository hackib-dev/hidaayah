import { Challenge, ChallengeType, Difficulty, ChallengeMode } from '../types';

// Mock Quran data for frontend simulation
const mockVerses = [
  {
    key: '1:1',
    surah: 1,
    name: 'Al-Fatihah',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    tafseer: "The opening verse emphasizes Allah's mercy and compassion."
  },
  {
    key: '2:255',
    surah: 2,
    name: 'Al-Baqarah',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    translation:
      'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    tafseer: "Ayatul Kursi describes Allah's supreme authority and knowledge."
  },
  {
    key: '55:1',
    surah: 55,
    name: 'Ar-Rahman',
    arabic: 'الرَّحْمَٰنُ',
    translation: 'The Most Merciful',
    tafseer: "This surah emphasizes Allah's mercy and the blessings He has bestowed."
  },
  {
    key: '55:2',
    surah: 55,
    name: 'Ar-Rahman',
    arabic: 'عَلَّمَ الْقُرْآنَ',
    translation: 'Taught the Quran',
    tafseer: 'Allah taught the Quran, showing His mercy in guiding humanity.'
  },
  {
    key: '112:1',
    surah: 112,
    name: 'Al-Ikhlas',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    translation: 'Say, "He is Allah, [who is] One"',
    tafseer: 'This surah declares the absolute oneness of Allah.'
  },
  {
    key: '112:2',
    surah: 112,
    name: 'Al-Ikhlas',
    arabic: 'اللَّهُ الصَّمَدُ',
    translation: 'Allah, the Eternal Refuge',
    tafseer: 'Allah is the one upon whom all depend.'
  },
  {
    key: '93:1',
    surah: 93,
    name: 'Ad-Duha',
    arabic: 'وَالضُّحَىٰ',
    translation: 'By the morning brightness',
    tafseer: 'Allah swears by the morning light, symbolizing hope and guidance.'
  },
  {
    key: '94:5',
    surah: 94,
    name: 'Ash-Sharh',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship [will be] ease',
    tafseer: 'A powerful reminder that relief follows difficulty.'
  },
  {
    key: '103:1',
    surah: 103,
    name: 'Al-Asr',
    arabic: 'وَالْعَصْرِ',
    translation: 'By time',
    tafseer: 'Allah swears by time, emphasizing its importance.'
  },
  {
    key: '67:1',
    surah: 67,
    name: 'Al-Mulk',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    translation: 'Blessed is He in whose hand is dominion',
    tafseer: 'This verse praises Allah who has complete control over all creation.'
  }
];

// Generate Ayah Completion Challenge
function generateAyahCompletion(difficulty: Difficulty): Challenge {
  const verse = mockVerses[Math.floor(Math.random() * mockVerses.length)];
  const words = verse.arabic.split(' ');

  let missingCount = 1;
  if (difficulty === 'medium') missingCount = 2;
  if (difficulty === 'hard') missingCount = 3;
  if (difficulty === 'expert') missingCount = Math.min(4, words.length - 1);

  const missingIndices = new Set<number>();
  while (missingIndices.size < missingCount) {
    missingIndices.add(Math.floor(Math.random() * words.length));
  }

  const question = words.map((w, i) => (missingIndices.has(i) ? '___' : w)).join(' ');
  const answer = Array.from(missingIndices)
    .map((i) => words[i])
    .join(' ');

  return {
    id: `ayah_comp_${Date.now()}`,
    type: 'ayah_completion',
    difficulty,
    mode: 'single',
    verseKey: verse.key,
    surahName: verse.name,
    surahNumber: verse.surah,
    ayahNumber: parseInt(verse.key.split(':')[1]),
    question,
    answer,
    hint: difficulty === 'easy' ? `From Surah ${verse.name}` : undefined,
    tafseer: verse.tafseer
  };
}

// Generate Next Ayah Challenge
function generateNextAyah(difficulty: Difficulty): Challenge {
  const index = Math.floor(Math.random() * (mockVerses.length - 1));
  const currentVerse = mockVerses[index];
  const nextVerse = mockVerses[index + 1];

  return {
    id: `next_ayah_${Date.now()}`,
    type: 'next_ayah',
    difficulty,
    mode: 'single',
    verseKey: currentVerse.key,
    surahName: currentVerse.name,
    surahNumber: currentVerse.surah,
    ayahNumber: parseInt(currentVerse.key.split(':')[1]),
    question: currentVerse.arabic,
    answer: nextVerse.arabic,
    hint: difficulty === 'easy' ? nextVerse.translation : undefined
  };
}

// Generate Guess the Surah Challenge
function generateGuessSurah(difficulty: Difficulty): Challenge {
  const verse = mockVerses[Math.floor(Math.random() * mockVerses.length)];
  const allSurahs = [...new Set(mockVerses.map((v) => v.name))];
  const wrongOptions = allSurahs.filter((s) => s !== verse.name).slice(0, 3);
  const options = [verse.name, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    id: `guess_surah_${Date.now()}`,
    type: 'guess_surah',
    difficulty,
    mode: 'single',
    verseKey: verse.key,
    surahName: verse.name,
    surahNumber: verse.surah,
    ayahNumber: parseInt(verse.key.split(':')[1]),
    question: difficulty === 'easy' ? verse.translation : verse.arabic,
    answer: verse.name,
    options,
    hint: difficulty === 'easy' ? 'Look at the theme and style' : undefined,
    tafseer: verse.tafseer
  };
}

// Generate Missing Word Challenge
function generateMissingWord(difficulty: Difficulty): Challenge {
  const verse = mockVerses[Math.floor(Math.random() * mockVerses.length)];
  const words = verse.arabic.split(' ');
  const missingIndex = Math.floor(Math.random() * words.length);
  const missingWord = words[missingIndex];

  const question = words.map((w, i) => (i === missingIndex ? '___' : w)).join(' ');

  // Generate options
  const allWords = mockVerses.flatMap((v) => v.arabic.split(' '));
  const uniqueWords = [...new Set(allWords)].filter((w) => w !== missingWord);
  const wrongOptions = uniqueWords.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [missingWord, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    id: `missing_word_${Date.now()}`,
    type: 'missing_word',
    difficulty,
    mode: 'single',
    verseKey: verse.key,
    surahName: verse.name,
    surahNumber: verse.surah,
    ayahNumber: parseInt(verse.key.split(':')[1]),
    question,
    answer: missingWord,
    options,
    hint: difficulty === 'easy' ? verse.translation : undefined
  };
}

// Generate Tafseer Match Challenge
function generateTafseerMatch(difficulty: Difficulty): Challenge {
  const verse = mockVerses[Math.floor(Math.random() * mockVerses.length)];
  const allTafseers = mockVerses.map((v) => v.tafseer);
  const wrongOptions = allTafseers.filter((t) => t !== verse.tafseer).slice(0, 3);
  const options = [verse.tafseer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    id: `tafseer_match_${Date.now()}`,
    type: 'tafseer_match',
    difficulty,
    mode: 'single',
    verseKey: verse.key,
    surahName: verse.name,
    surahNumber: verse.surah,
    ayahNumber: parseInt(verse.key.split(':')[1]),
    question: verse.arabic,
    answer: verse.tafseer,
    options,
    hint: difficulty === 'easy' ? `From Surah ${verse.name}` : undefined
  };
}

// Main generator function
export function generateChallenge(
  type: ChallengeType,
  difficulty: Difficulty = 'medium',
  mode: ChallengeMode = 'single'
): Challenge {
  let challenge: Challenge;

  switch (type) {
    case 'ayah_completion':
      challenge = generateAyahCompletion(difficulty);
      break;
    case 'next_ayah':
      challenge = generateNextAyah(difficulty);
      break;
    case 'guess_surah':
      challenge = generateGuessSurah(difficulty);
      break;
    case 'missing_word':
      challenge = generateMissingWord(difficulty);
      break;
    case 'tafseer_match':
      challenge = generateTafseerMatch(difficulty);
      break;
    case 'audio_recognition':
      challenge = generateGuessSurah(difficulty);
      challenge.type = 'audio_recognition';
      challenge.audioUrl = '/audio/placeholder.mp3';
      break;
    default:
      challenge = generateAyahCompletion(difficulty);
  }

  challenge.mode = mode;

  if (mode === 'timed') {
    challenge.timeLimit = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30;
  }

  return challenge;
}

export function getRandomChallenge(difficulty?: Difficulty): Challenge {
  const types: ChallengeType[] = [
    'ayah_completion',
    'next_ayah',
    'guess_surah',
    'missing_word',
    'tafseer_match'
  ];

  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomDifficulty =
    difficulty || (['easy', 'medium', 'hard'] as Difficulty[])[Math.floor(Math.random() * 3)];

  return generateChallenge(randomType, randomDifficulty);
}
