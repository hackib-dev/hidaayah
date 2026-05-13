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
} from '@/app/(app)/dashboard/profile/types';

// ─── Streak ──────────────────────
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

// Fetch all active goal plans for today (one per type) in parallel.
export const fetchTodayGoalPlanAuto = async (): Promise<TodayGoalPlan | null> => {
  const plans = await fetchAllTodayGoalPlans();
  return plans[0] ?? null;
};

// Returns all active plans today, tagged with the goal type they were fetched for.
export const fetchAllTodayGoalPlans = async (): Promise<TodayGoalPlan[]> => {
  const GOAL_TYPES = ['QURAN_PAGES', 'QURAN_TIME', 'QURAN_RANGE'] as const;

  const results = await Promise.all(
    GOAL_TYPES.map((type) =>
      fetchTodayGoalPlan(type)
        .then((plan) => (plan ? { ...plan, goalType: type } : null))
        .catch(() => null)
    )
  );

  // Deduplicate by goalId — the same goal can appear under multiple types
  const seen = new Set<string>();
  const plans: TodayGoalPlan[] = [];
  for (const p of results) {
    if (!p || seen.has(p.goalId)) continue;
    seen.add(p.goalId);
    plans.push(p as TodayGoalPlan);
  }
  return plans;
};

// ─── Reflect User Profile ─────────────────────────────────────────────────────
// Prefer /v1/users/profile (self, full data) with the user's access token.
// If the user token is absent, fall back to /v1/users/{sub} using the reflectApi
// (which carries a client-credentials token with the "user" scope)
export const fetchReflectProfile = async (): Promise<ReflectProfile | null> => {
  const userToken = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';

  if (userToken) {
    const response = await reflectApi
      .get<ReflectProfile>('/v1/users/profile', {
        headers: { 'x-auth-token': userToken, 'x-client-id': clientId }
      })
      .catch((err) => {
        // 404 = user has no reflect profile yet
        // 500 = prelive returns 500 instead of 403 for origin-blocked requests (Basit confirmed)
        const s = err?.response?.status;
        if (s === 404 || s === 500) return null;
        throw err;
      });
    return response?.data ?? null;
  }

  const sub = (() => {
    try {
      const stored = localStorage.getItem('hidaayah_user');
      return stored ? (JSON.parse(stored) as { sub?: string }).sub : undefined;
    } catch {
      return undefined;
    }
  })();

  if (!sub) return null;

  const response = await reflectApi.get<ReflectProfile>(`/v1/users/${sub}`).catch((err) => {
    const s = err?.response?.status;
    if (s === 404 || s === 500) return null;
    throw err;
  });
  return response?.data ?? null;
};

export const updateReflectProfile = async (
  params: UpdateReflectProfileParams
): Promise<ReflectProfile> => {
  const response = await reflectApi.put<ReflectProfile>('/v1/users/profile', { user: params });
  return response.data;
};

// PATCH /v1/users/profile — edit settings/preferences (language, privacy, etc.)
export const editReflectProfileSettings = async (params: {
  languageId?: number;
  reflectionLanguages?: string[];
  ayahLanguages?: string[];
  customized?: boolean;
  hideFollowSuggestion?: boolean;
  showFollowFeaturedSuggestion?: boolean;
}): Promise<{ success: boolean }> => {
  const response = await reflectApi.patch<{ success: boolean }>('/v1/users/profile', params);
  return response.data;
};

// GET /v1/users/profile — full authenticated user profile
export const fetchReflectProfileFull = async (
  params: { qdc?: boolean } = {}
): Promise<ReflectProfile> => {
  const response = await reflectApi.get<ReflectProfile>('/v1/users/profile', { params });
  return response.data;
};

// GET /v1/users/my-rooms — rooms the authenticated user belongs to
export const fetchMyRooms = async (
  params: {
    name?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: unknown[];
}> => {
  const response = await reflectApi.get('/v1/users/my-rooms', { params });
  return response.data;
};

// ─── Preferences ─────────────────────────────────────────────────────────────

export type QFPreferences = {
  quranReaderStyles?: {
    quranTextFontScale?: number;
    quranFont?: string;
  };
  audio?: {
    reciter?: number;
  };
  reading?: {
    selectedWordByWordLocale?: string;
  };
};

export const getPreferences = async (): Promise<{ success: boolean; data: QFPreferences }> => {
  const response = await userApi.get<{ success: boolean; data: QFPreferences }>('/v1/preferences');
  return response.data;
};

export const savePreferencesBulk = async (
  prefs: QFPreferences,
  mushafId = 1
): Promise<{ success: boolean }> => {
  const response = await userApi.post<{ success: boolean }>('/v1/preferences/bulk', prefs, {
    params: { mushafId }
  });
  return response.data;
};

// GET /v1/users/search — search users by name/username
export const searchUsers = async (
  params: {
    query?: string;
    limit?: number;
    page?: number;
    all?: boolean;
    postingAs?: boolean;
    postingAsUserId?: string;
    roomId?: number;
  } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: ReflectProfile[];
}> => {
  const response = await reflectApi.get('/v1/users/search', { params });
  return response.data;
};

// POST /v1/users/:followeeId/toggle-follow
export const toggleFollowUser = async (
  followeeId: string,
  action?: 'follow' | 'unfollow'
): Promise<{ followed: boolean }> => {
  const response = await reflectApi.post<{ followed: boolean }>(
    `/v1/users/${followeeId}/toggle-follow`,
    action ? { action } : {}
  );
  return response.data;
};

// POST /v1/users/:followerId/remove-follower
export const removeFollower = async (followerId: string): Promise<{ removed: boolean }> => {
  const response = await reflectApi.post<{ removed: boolean }>(
    `/v1/users/${followerId}/remove-follower`
  );
  return response.data;
};

// GET /v1/users/:id — profile by UUID or username
export const fetchUserById = async (
  id: string,
  params: { qdc?: boolean } = {}
): Promise<ReflectProfile> => {
  const response = await reflectApi.get<ReflectProfile>(`/v1/users/${id}`, { params });
  return response.data;
};

// GET /v1/users/:id/followers
export const fetchUserFollowers = async (
  userId: string,
  params: { limit?: number; page?: number } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: ReflectProfile[];
}> => {
  const response = await reflectApi.get(`/v1/users/${userId}/followers`, { params });
  return response.data;
};

// GET /v1/users/:id/following
export const fetchUserFollowing = async (
  userId: string,
  params: { limit?: number; page?: number } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: ReflectProfile[];
}> => {
  const response = await reflectApi.get(`/v1/users/${userId}/following`, { params });
  return response.data;
};
