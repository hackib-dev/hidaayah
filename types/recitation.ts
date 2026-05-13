export type RecitationFormat = 'surah' | 'juz' | 'hizb' | 'page' | 'reciters';

export interface RecitationProgress {
  format: RecitationFormat;
  unitNumber: number; // juz 1-30, hizb 1-60, page 1-604, surah 1-114
  verseFrom?: string;
  verseTo?: string;
  completedAt?: string | null;
  lastReadAt: string;
  percentComplete: number;
}

export interface JuzInfo {
  juz_number: number;
  verse_mapping: Record<string, string>; // surah_id → "from:to"
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface HizbInfo {
  hizb_number: number;
  juz_number: number;
  verse_key_start: string;
  verse_key_end: string;
}

export interface PageInfo {
  page_number: number;
  first_verse: string;
  last_verse: string;
  chapter_id: number;
}
