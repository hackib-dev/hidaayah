// Last Recitation Tracking System
// Tracks user's last read position across different reading modes

const RECITATION_STORAGE_KEY = 'hidaayah_last_recitations';

export interface LastRecitation {
  surah?: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    timestamp: string;
  };
  juz?: {
    juzNumber: number;
    pageNumber: number;
    timestamp: string;
  };
  hizb?: {
    hizbNumber: number;
    pageNumber: number;
    timestamp: string;
  };
  page?: {
    pageNumber: number;
    timestamp: string;
  };
}

// Load last recitations
export function loadLastRecitations(): LastRecitation {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(RECITATION_STORAGE_KEY);
  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Save last recitations
function saveLastRecitations(recitations: LastRecitation): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECITATION_STORAGE_KEY, JSON.stringify(recitations));
}

// Track surah reading
export function trackSurahReading(
  surahNumber: number,
  surahName: string,
  ayahNumber: number
): void {
  const recitations = loadLastRecitations();
  recitations.surah = {
    surahNumber,
    surahName,
    ayahNumber,
    timestamp: new Date().toISOString()
  };
  saveLastRecitations(recitations);
}

// Track juz reading
export function trackJuzReading(juzNumber: number, pageNumber: number): void {
  const recitations = loadLastRecitations();
  recitations.juz = {
    juzNumber,
    pageNumber,
    timestamp: new Date().toISOString()
  };
  saveLastRecitations(recitations);
}

// Track hizb reading
export function trackHizbReading(hizbNumber: number, pageNumber: number): void {
  const recitations = loadLastRecitations();
  recitations.hizb = {
    hizbNumber,
    pageNumber,
    timestamp: new Date().toISOString()
  };
  saveLastRecitations(recitations);
}

// Track page reading
export function trackPageReading(pageNumber: number): void {
  const recitations = loadLastRecitations();
  recitations.page = {
    pageNumber,
    timestamp: new Date().toISOString()
  };
  saveLastRecitations(recitations);
}

// Get most recent recitation
export function getMostRecentRecitation(): {
  type: 'surah' | 'juz' | 'hizb' | 'page' | null;
  data: any;
} | null {
  const recitations = loadLastRecitations();

  const items = [
    { type: 'surah' as const, data: recitations.surah, timestamp: recitations.surah?.timestamp },
    { type: 'juz' as const, data: recitations.juz, timestamp: recitations.juz?.timestamp },
    { type: 'hizb' as const, data: recitations.hizb, timestamp: recitations.hizb?.timestamp },
    { type: 'page' as const, data: recitations.page, timestamp: recitations.page?.timestamp }
  ].filter((item) => item.timestamp);

  if (items.length === 0) return null;

  items.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());

  return { type: items[0].type, data: items[0].data };
}
