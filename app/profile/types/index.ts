import type { CursorPagination } from '@/app/apiService/quranFoundationService/types';

// ─── Streak ───────────────────────────────────────────────────────────────────
export type StreakStatus = 'ACTIVE' | 'BROKEN';
export type StreakType = 'QURAN';

export interface Streak {
  id: string;
  startDate: string;
  endDate: string;
  status: StreakStatus;
  days: number;
}

export interface StreakResponse {
  success: boolean;
  data: Streak[];
  pagination: CursorPagination;
}

export interface FetchStreakParams {
  from?: string;
  to?: string;
  type?: StreakType;
  sortOrder?: 'asc' | 'desc';
  orderBy?: 'startDate' | 'days';
  status?: StreakStatus;
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface UserInfoResponse extends UserProfile {}

// ─── Goals ────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  type: string;
  target: number;
  progress: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsResponse {
  success: boolean;
  data: Goal[];
  pagination: CursorPagination;
}

export interface CreateGoalParams {
  type: string;
  target: number;
  unit: string;
}

// ─── Reflect User Profile ─────────────────────────────────────────────────────
export interface ReflectProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  verified?: boolean;
  avatarUrls?: Record<string, string>;
  followersCount?: number;
  postsCount?: number;
  joiningYear?: number;
  languageId?: number;
  languageIsoCode?: string;
  settings?: Record<string, unknown>;
  createdAt?: string;
}

export interface UpdateReflectProfileParams {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  removeAvatar?: boolean;
}
