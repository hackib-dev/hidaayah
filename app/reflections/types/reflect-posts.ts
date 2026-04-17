// ─── Quran Reflect Posts (from /quran-reflect/v1/posts/feed and /by-user) ─────

export type ReflectPostType = 1 | 2; // 1 = Reflection, 2 = Lesson

export interface ReflectPostReference {
  chapterId: number;
  from: number;
  to: number;
  verseKey?: string;
}

export interface ReflectPost {
  id: string | number;
  body: string;
  postType: ReflectPostType;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  references?: ReflectPostReference[];
  tags?: string[];
  // The author's user object (shape varies — only present on feed responses)
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatarUrls?: Record<string, string>;
    verified?: boolean;
  };
  recentComment?: {
    id: string | number;
    body: string;
  };
}

export interface ReflectPostsResponse {
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: ReflectPost[];
}

export interface FetchReflectFeedParams {
  tab?: 'newest' | 'latest' | 'following' | 'draft' | 'favorite' | 'most_popular' | 'only_room_members' | 'public' | 'feed' | 'trending' | 'popular';
  page?: number;
  limit?: number;
  languages?: number[];
  'filter[postTypeIds]'?: number[];
  'filter[verifiedOnly]'?: boolean;
  'filter[references][0][chapterId]'?: number;
  'filter[references][0][from]'?: number;
  'filter[references][0][to]'?: number;
  'filter[authors]'?: string[];
  'filter[tags]'?: string[];
}

// GET /v1/posts/my-posts — authenticated user's own posts
export interface FetchMyPostsParams {
  tab?: 'my_reflections' | 'saved' | 'notes' | 'mentions';
  sortBy?: 'latest' | 'popular';
  /** max 20 */
  limit?: number;
  page?: number;
  postTypeIds?: number[];
}

// GET /v1/posts/user-posts/:id — another user's public posts
export interface FetchUserPostsParams {
  sortBy?: 'latest' | 'popular';
  /** max 20 */
  limit?: number;
  page?: number;
  postTypeIds?: number[];
}
