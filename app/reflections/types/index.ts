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

// ─── Reading Session ──────────────────────────────────────────────────────────
export interface ReadingSession {
  id: string;
  verseFrom: string;
  verseTo: string;
  duration: number;
  mushafId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSessionResponse {
  success: boolean;
  data: ReadingSession;
}

export interface ListReadingSessionsResponse {
  success: boolean;
  data: ReadingSession[];
  pagination: CursorPagination;
}

export interface UpsertReadingSessionParams {
  verseFrom: string;
  verseTo: string;
  duration: number;
  mushafId: number;
  chapterNumber: number;
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  body: string;
  saveToQR?: boolean;
  ranges?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteResponse {
  success: boolean;
  data: Note;
}

export interface ListNotesResponse {
  success: boolean;
  data: Note[];
  pagination: CursorPagination;
}

// ranges format: "chapterId:verseFrom-chapterId:verseTo" e.g. "2:255-2:255"
export interface CreateNoteParams {
  body: string;
  saveToQR?: boolean;
  ranges?: string[];
}

export interface UpdateNoteParams {
  body: string;
}

// ─── Today's Goal Plan ────────────────────────────────────────────────────────
export interface GoalPlanRange {
  verseFrom: string;
  verseTo: string;
  chapterId: number;
  from: number;
  to: number;
}

export interface TodayGoalPlan {
  goalId: string;
  type: string;
  target: number;
  unit: string;
  progress: number;
  remaining: number;
  completed: boolean;
  ranges: GoalPlanRange[];
}

export interface TodayGoalPlanResponse {
  success: boolean;
  data: TodayGoalPlan | null;
}

// ─── Random Ayah ──────────────────────────────────────────────────────────────
export interface RandomAyahWord {
  id: number;
  text_uthmani: string;
  char_type_name: string;
}

export interface RandomAyah {
  id: number;
  verse_key: string;
  text_uthmani: string;
  words: RandomAyahWord[];
  translations?: { text: string; resource_name: string }[];
}

export interface RandomAyahResponse {
  verse: RandomAyah;
}
