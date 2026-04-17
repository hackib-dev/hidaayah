import type { CursorPagination } from '@/app/apiService/quranFoundationService/types';
import type { Bookmark } from '@/app/reflections/types';

// ─── Collection ───────────────────────────────────────────────────────────────
export interface Collection {
  id: string;
  updatedAt: string;
  name: string;
}

export interface CollectionWithBookmarks extends Collection {
  bookmarks: Bookmark[];
}

export interface ListCollectionsResponse {
  success: boolean;
  data: Collection[];
  pagination: CursorPagination;
}

export interface GetCollectionResponse {
  success: boolean;
  data: CollectionWithBookmarks;
}

export interface CreateCollectionParams {
  name: string;
}

export interface ListCollectionsParams {
  sortBy?: 'recentlyUpdated' | 'alphabetical';
  type?: 'ayah' | 'juz' | 'surah' | 'page';
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface AddBookmarkToCollectionParams {
  bookmarkId: string;
}
