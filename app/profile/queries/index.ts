import Axios from 'axios';
import {
  userApi,
  reflectApi,
  QF_OAUTH_BASE_URL,
  USER_TOKEN_KEY
} from '@/app/apiService/quranFoundationService';
import type {
  FetchStreakParams,
  StreakResponse,
  UserInfoResponse,
  GoalsResponse,
  CreateGoalParams,
  Goal,
  ReflectProfile,
  UpdateReflectProfileParams
} from '@/app/profile/types';

// ─── Streak ───────────────────────────────────────────────────────────────────
export const fetchStreaks = async (params: FetchStreakParams = {}): Promise<StreakResponse> => {
  const response = await userApi.get<StreakResponse>('/v1/streaks', {
    params: { type: 'QURAN', sortOrder: 'desc', ...params }
  });
  return response.data;
};

// Convenience: get the current active streak
export const fetchActiveStreak = async (): Promise<StreakResponse> => {
  return fetchStreaks({ status: 'ACTIVE', type: 'QURAN', first: 1 });
};

// ─── User Info (via OIDC userinfo endpoint) ───────────────────────────────────
export const fetchUserInfo = async (): Promise<UserInfoResponse> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
  const response = await Axios.get<UserInfoResponse>(`${QF_OAUTH_BASE_URL}/userinfo`, {
    headers: {
      'x-auth-token': token ?? '',
      'x-client-id': clientId
    }
  });
  return response.data;
};

// ─── Goals ────────────────────────────────────────────────────────────────────
export const fetchGoals = async (
  params: { first?: number; after?: string } = {}
): Promise<GoalsResponse> => {
  const response = await userApi.get<GoalsResponse>('/v1/goals', { params });
  return response.data;
};

export const createGoal = async (
  params: CreateGoalParams
): Promise<{ success: boolean; data: Goal }> => {
  const response = await userApi.post<{ success: boolean; data: Goal }>('/v1/goals', params);
  return response.data;
};

export const deleteGoal = async (goalId: string): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(`/v1/goals/${goalId}`);
  return response.data;
};

// ─── Reflect User Profile ─────────────────────────────────────────────────────
// /v1/users/profile requires a user-scoped access token (authorization_code flow).
// When that token is missing or stale, fall back to /v1/users/{sub} which works
// with a client-credentials token carrying the "user" scope.
export const fetchReflectProfile = async (): Promise<ReflectProfile> => {
  try {
    const response = await reflectApi.get<ReflectProfile>('/v1/users/profile');
    return response.data;
  } catch {
    // Fall back to public user endpoint using the sub stored in the session
    const sub =
      typeof window !== 'undefined'
        ? (() => {
            try {
              const stored = localStorage.getItem('hidaayah_user');
              return stored ? (JSON.parse(stored) as { sub?: string }).sub : undefined;
            } catch {
              return undefined;
            }
          })()
        : undefined;

    if (!sub) throw new Error('No user session found');

    const response = await reflectApi.get<ReflectProfile>(`/v1/users/${sub}`);
    return response.data;
  }
};

export const updateReflectProfile = async (
  params: UpdateReflectProfileParams
): Promise<ReflectProfile> => {
  const response = await reflectApi.put<ReflectProfile>('/v1/users/profile', { user: params });
  return response.data;
};
