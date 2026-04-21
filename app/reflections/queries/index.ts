import { userApi, reflectApi } from '@/app/apiService/quranFoundationService';
import type {
  LogActivityParams,
  LogActivityResponse,
  ListBookmarksParams,
  ListBookmarksResponse,
  CreateBookmarkParams,
  Bookmark,
  UpsertReadingSessionParams,
  ReadingSessionResponse,
  ListReadingSessionsResponse,
  CreateNoteParams,
  UpdateNoteParams,
  NoteResponse,
  ListNotesResponse
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
export const bookmarkVerse = async (chapterId: number, verseNumber: number, mushaf = 1) => {
  return createBookmark({
    type: 'ayah',
    key: chapterId,
    verseNumber,
    mushaf
  });
};

// ─── Quran Reflect Posts ──────────────────────────────────────────────────────

export const togglePostLike = async (postId: string | number): Promise<{ liked: boolean }> => {
  const response = await reflectApi.post<{ liked: boolean }>(`/v1/posts/${postId}/toggle-like`);
  return response.data;
};

export const togglePostSave = async (postId: string | number): Promise<{ saved: boolean }> => {
  const response = await reflectApi.post<{ saved: boolean }>(`/v1/posts/${postId}/toggle-save`);
  return response.data;
};

export const deletePost = async (postId: string | number): Promise<void> => {
  await reflectApi.delete(`/v1/posts/${postId}`);
};

export const editPost = async (
  postId: string | number,
  body: string,
  draft: boolean
): Promise<void> => {
  await reflectApi.put(`/v1/posts/${postId}`, { post: { body, draft } });
};

export const trackPostView = async (postId: string | number): Promise<void> => {
  await reflectApi.post(`/v1/posts/${postId}/views`).catch(() => {
    // 403 = views scope not granted on this client — silently skip
  });
};

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
  const res = await fetchMyReflectPosts({ limit: 1, page: 1 }).catch(() => null);
  return res?.total ?? 0;
};

// ─── Reading Sessions ─────────────────────────────────────────────────────────
export const upsertReadingSession = async (
  params: UpsertReadingSessionParams
): Promise<ReadingSessionResponse> => {
  const response = await userApi.post<ReadingSessionResponse>('/v1/reading-sessions', params);
  return response.data;
};

export const fetchReadingSessions = async (
  params: { first?: number; after?: string } = {}
): Promise<ListReadingSessionsResponse> => {
  const response = await userApi.get<ListReadingSessionsResponse>('/v1/reading-sessions', {
    params
  });
  return response.data;
};

// Returns the most recent reading session (last position in the Quran)
export const fetchLastReadingSession = async (): Promise<
  ListReadingSessionsResponse['data'][0] | null
> => {
  const res = await fetchReadingSessions({ first: 1 }).catch(() => null);
  return res?.data?.[0] ?? null;
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const fetchNotes = async (
  params: { limit?: number; cursor?: string; sortBy?: 'newest' | 'oldest' } = {}
): Promise<ListNotesResponse> => {
  const response = await userApi.get<ListNotesResponse>('/v1/notes', { params });
  return response.data;
};

// Fetch notes for a specific verse by fetching all notes and filtering client-side
// The API's /by_verse/ and range filter endpoints require additional scopes not in the token
export const fetchNotesByVerse = async (verseKey: string): Promise<ListNotesResponse> => {
  const response = await userApi.get<ListNotesResponse>('/v1/notes', { params: { limit: 50 } });
  const [chapter, verseNum] = verseKey.split(':');
  const rangePrefix = `${chapter}:${verseNum}-${chapter}:${verseNum}`;
  const filtered = (response.data?.data ?? []).filter((note) =>
    note.ranges?.some((r) => r === rangePrefix)
  );
  return { ...response.data, data: filtered };
};

export const createNote = async (params: CreateNoteParams): Promise<NoteResponse> => {
  const response = await userApi.post<NoteResponse>('/v1/notes', params);
  return response.data;
};

export const updateNote = async (
  noteId: string,
  params: UpdateNoteParams
): Promise<NoteResponse> => {
  const response = await userApi.patch<NoteResponse>(`/v1/notes/${noteId}`, params);
  return response.data;
};

export const deleteNote = async (noteId: string): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(`/v1/notes/${noteId}`);
  return response.data;
};
