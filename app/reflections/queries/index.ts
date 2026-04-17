import { userApi, reflectApi } from '@/app/apiService/quranFoundationService';
import type {
  LogActivityParams,
  LogActivityResponse,
  ListBookmarksParams,
  ListBookmarksResponse,
  CreateBookmarkParams,
  Bookmark
} from '@/app/reflections/types';
import type {
  FetchReflectFeedParams,
  FetchMyPostsParams,
  FetchUserPostsParams,
  ReflectPostsResponse
} from '@/app/reflections/types/reflect-posts';

// ─── Activity Days ────────────────────────────────────────────────────────────
// Log a reading session (POST — records what verses were read and for how long)
export const logActivityDay = async (
  params: LogActivityParams,
  timezone?: string
): Promise<LogActivityResponse> => {
  const response = await userApi.post<LogActivityResponse>('/v1/activity-days', params, {
    headers: timezone ? { 'x-timezone': timezone } : {}
  });
  return response.data;
};

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export const fetchBookmarks = async (
  params: ListBookmarksParams
): Promise<ListBookmarksResponse> => {
  // API enforces first <= 20
  const safeParams = { ...params, first: Math.min(params.first ?? 20, 20) };
  const response = await userApi.get<ListBookmarksResponse>('/v1/bookmarks', {
    params: safeParams
  });
  return response.data;
};

// Fetch all bookmarks by following cursor pagination
export const fetchAllBookmarks = async (
  baseParams: Omit<ListBookmarksParams, 'first' | 'after'>
): Promise<Bookmark[]> => {
  const all: Bookmark[] = [];
  let after: string | undefined;
  do {
    const res = await fetchBookmarks({ ...baseParams, first: 20, after });
    all.push(...res.data);
    after =
      res.pagination.hasNextPage && res.pagination.endCursor ? res.pagination.endCursor : undefined;
  } while (after);
  return all;
};

export const createBookmark = async (
  params: CreateBookmarkParams
): Promise<{ success: boolean; data: Bookmark }> => {
  const response = await userApi.post<{ success: boolean; data: Bookmark }>(
    '/v1/bookmarks',
    params
  );
  return response.data;
};

export const deleteBookmark = async (bookmarkId: string): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(`/v1/bookmarks/${bookmarkId}`);
  return response.data;
};

// Helper: bookmark a specific verse
export const bookmarkVerse = async (chapterId: number, verseNumber: number, mushafId = 1) => {
  return createBookmark({
    type: 'ayah',
    key: chapterId,
    verseNumber,
    mushafId
  });
};

// ─── Quran Reflect Posts ──────────────────────────────────────────────────────

// Fetch the public feed (or filtered by tab/postType)
export const fetchReflectFeed = async (
  params: FetchReflectFeedParams = {}
): Promise<ReflectPostsResponse> => {
  const response = await reflectApi.get<ReflectPostsResponse>('/v1/posts/feed', { params });
  return response.data;
};

// Fetch posts belonging to the authenticated user — GET /v1/posts/my-posts
export const fetchMyReflectPosts = async (
  params: FetchMyPostsParams = {}
): Promise<ReflectPostsResponse> => {
  const response = await reflectApi.get<ReflectPostsResponse>('/v1/posts/my-posts', { params });
  return response.data;
};

// Fetch all pages of the authenticated user's posts
export const fetchAllMyReflectPosts = async (
  params: Omit<FetchMyPostsParams, 'page'> = {}
): Promise<ReflectPostsResponse> => {
  const first = await reflectApi.get<ReflectPostsResponse>('/v1/posts/my-posts', {
    params: { ...params, limit: 20, page: 1 }
  });
  const { total, pages, data } = first.data;
  if (pages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      reflectApi
        .get<ReflectPostsResponse>('/v1/posts/my-posts', {
          params: { ...params, limit: 20, page: i + 2 }
        })
        .then((r) => r.data.data)
    )
  );
  return { total, currentPage: pages, limit: 20, pages, data: [...data, ...rest.flat()] };
};

// Fetch posts by a specific user ID — GET /v1/posts/user-posts/:id
export const fetchUserReflectPosts = async (
  userId: string,
  params: FetchUserPostsParams = {}
): Promise<ReflectPostsResponse> => {
  const response = await reflectApi.get<ReflectPostsResponse>(`/v1/posts/user-posts/${userId}`, {
    params
  });
  return response.data;
};

// Convenience: get total count of the authenticated user's posts (probe with limit=1)
export const fetchMyReflectionsCount = async (): Promise<number> => {
  const res = await fetchMyReflectPosts({ limit: 1, page: 1 });
  return res.total ?? 0;
};
