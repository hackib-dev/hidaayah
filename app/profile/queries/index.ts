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
  UpdateReflectProfileParams,
  TodayGoalPlan,
  TodayGoalPlanResponse,
  UpdateGoalParams
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
  params: CreateGoalParams,
  mushafId = 1
): Promise<{ success: boolean; data: Goal }> => {
  const response = await userApi.post<{ success: boolean; data: Goal }>('/v1/goals', params, {
    params: { mushafId }
  });
  return response.data;
};

export const deleteGoal = async (
  goalId: string,
  category: string
): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(`/v1/goals/${goalId}`, {
    params: { category }
  });
  return response.data;
};

export interface GoalEstimateDay {
  amount: number;
  date: string;
}

export const generateGoalEstimate = async (params: {
  type: string;
  amount: number | string;
  mushafId?: number;
  duration?: number;
}): Promise<GoalEstimateDay[] | null> => {
  type EstimateResponse = {
    success: boolean;
    data: { week: GoalEstimateDay[] };
  };
  const response = await userApi
    .get<EstimateResponse>('/v1/goals/estimate', {
      params: { mushafId: 1, ...params }
    })
    .catch(() => null);
  return response?.data?.data?.week ?? null;
};

export const updateGoal = async (
  goalId: string,
  params: UpdateGoalParams,
  mushafId = 1
): Promise<{ success: boolean; data: Goal }> => {
  const response = await userApi.put<{ success: boolean; data: Goal }>(
    `/v1/goals/${goalId}`,
    params,
    { params: { mushafId } }
  );
  return response.data;
};

export const fetchTodayGoalPlan = async (type = 'QURAN_PAGES'): Promise<TodayGoalPlan | null> => {
  const response = await userApi.get<TodayGoalPlanResponse>('/v1/goals/get-todays-plan', {
    params: { type, mushafId: 1 }
  });
  const d = response.data?.data;
  if (!d || (d as { hasGoal?: boolean }).hasGoal === false) return null;
  return d as TodayGoalPlan;
};

// Tries all goal types in parallel and returns whichever one has an active plan today.
// Necessary because GET /v1/goals requires a scope the token doesn't have.
export const fetchTodayGoalPlanAuto = async (): Promise<TodayGoalPlan | null> => {
  const GOAL_TYPES = [
    'QURAN_PAGES',
    'QURAN_TIME',
    'QURAN_RANGE',
    'QURAN_READING_PROGRAM',
    'RAMADAN_CHALLENGE'
  ];

  const results = await Promise.all(
    GOAL_TYPES.map((type) => fetchTodayGoalPlan(type).catch(() => null))
  );

  return results.find((r) => r !== null) ?? null;
};

// ─── Reflect User Profile ─────────────────────────────────────────────────────
// Prefer /v1/users/profile (self, full data) with the user's access token.
// If the user token is absent, fall back to /v1/users/{sub} using the reflectApi
// (which carries a client-credentials token with the "user" scope).
export const fetchReflectProfile = async (): Promise<ReflectProfile> => {
  const userToken = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;

  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';

  if (userToken) {
    // User is logged in — call /profile directly with explicit headers to avoid
    // any race condition with the reflectApi interceptor's token fetch.
    const response = await reflectApi.get<ReflectProfile>('/v1/users/profile', {
      headers: {
        'x-auth-token': userToken,
        'x-client-id': clientId
      }
    });
    return response.data;
  }

  // No user token — read sub from session storage and fetch public profile
  const sub = (() => {
    try {
      const stored = localStorage.getItem('hidaayah_user');
      return stored ? (JSON.parse(stored) as { sub?: string }).sub : undefined;
    } catch {
      return undefined;
    }
  })();

  if (!sub) throw new Error('No user session found');

  const response = await reflectApi.get<ReflectProfile>(`/v1/users/${sub}`);
  return response.data;
};

export const updateReflectProfile = async (
  params: UpdateReflectProfileParams
): Promise<ReflectProfile> => {
  const response = await reflectApi.put<ReflectProfile>('/v1/users/profile', { user: params });
  return response.data;
};
