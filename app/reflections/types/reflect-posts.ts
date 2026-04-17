// ─── Quran Reflect Posts (from /quran-reflect/v1/posts/feed and /by-user) ─────

export type ReflectPostType = 1 | 2; // 1 = Reflection, 2 = Lesson

export interface ReflectPostReference {
  chapterId: number;
  from: number;
  to: number;
  verseKey?: string;
}

export interface ReflectPostAuthor {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrls?: { small?: string; medium?: string; large?: string };
  verified?: boolean;
  memberType?: number;
}

export interface ReflectPost {
  id: string | number;
  body: string;
  authorId?: string;
  /** Legacy field — some endpoints return postType, others postTypeId */
  postType?: ReflectPostType;
  postTypeId?: number;
  postTypeName?: string;
  draft?: boolean;
  roomPostStatus?: number;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  languageName?: string;
  estimatedReadingTime?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isCommentedOn?: boolean;
  references?: ReflectPostReference[];
  tags?: { name?: string }[];
  mentions?: unknown[];
  author?: ReflectPostAuthor;
  /** Legacy field name used in some endpoints */
  user?: ReflectPostAuthor;
  recentComment?: {
    id: string | number;
    body: string;
  } | null;
}

export interface ReflectPostsResponse {
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: ReflectPost[];
}

export interface FetchReflectFeedParams {
  tab?:
    | 'newest'
    | 'latest'
    | 'following'
    | 'draft'
    | 'favorite'
    | 'most_popular'
    | 'only_room_members'
    | 'public'
    | 'feed'
    | 'trending'
    | 'popular';
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
