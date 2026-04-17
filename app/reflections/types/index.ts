import type { CursorPagination } from '@/app/apiService/quranFoundationService/types';

// ─── Activity Day ─────────────────────────────────────────────────────────────
export type ActivityType = 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM';

export interface LogActivityParams {
  seconds: number;
  ranges: string[];
  mushafId: number;
  date?: string;
  type: ActivityType;
}

export interface ActivityDay {
  id: string;
  date: string;
  seconds: number;
  ranges: string[];
  mushafId: number;
  type: ActivityType;
}

export interface LogActivityResponse {
  success: boolean;
  data: ActivityDay;
}

// ─── Reading Session ──────────────────────────────────────────────────────────
export interface ReadingSessionParams {
  duration: number;
  verseFrom: string;
  verseTo: string;
  mushafId: number;
}

// ─── Goal ─────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  type: string;
  target: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsResponse {
  success: boolean;
  data: Goal[];
  pagination: CursorPagination;
}

// ─── Bookmark (used for verse saves from reflections) ────────────────────────
export type BookmarkType = 'ayah' | 'juz' | 'surah' | 'page';

export interface Bookmark {
  id: string;
  createdAt: string;
  type: BookmarkType;
  key: number;
  verseNumber: number | null;
  group: string;
  isInDefaultCollection: boolean;
  isReading: boolean | null;
  collectionsCount: number;
}

export interface ListBookmarksParams {
  type?: BookmarkType;
  isReading?: boolean;
  key?: number;
  mushafId: number;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface ListBookmarksResponse {
  success: boolean;
  data: Bookmark[];
  pagination: CursorPagination;
}

export interface CreateBookmarkParams {
  type: BookmarkType;
  key: number;
  verseNumber?: number;
  mushaf: number;
  isReading?: boolean;
}
