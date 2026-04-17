import { userApi } from '@/app/apiService/quranFoundationService';
import type {
  ListCollectionsParams,
  ListCollectionsResponse,
  GetCollectionResponse,
  CreateCollectionParams,
  Collection
} from '@/app/collections/types';

// ─── List all collections ─────────────────────────────────────────────────────
export const fetchCollections = async (
  params: ListCollectionsParams = {}
): Promise<ListCollectionsResponse> => {
  const response = await userApi.get<ListCollectionsResponse>('/v1/collections', { params });
  return response.data;
};

// ─── Get a single collection with its bookmarks ───────────────────────────────
export const fetchCollection = async (collectionId: string): Promise<GetCollectionResponse> => {
  const response = await userApi.get<GetCollectionResponse>(`/v1/collections/${collectionId}`);
  return response.data;
};

// ─── Get all collections with their items ────────────────────────────────────
export const fetchAllCollectionsWithItems = async (): Promise<GetCollectionResponse> => {
  const response = await userApi.get<GetCollectionResponse>('/v1/collections/all');
  return response.data;
};

// ─── Create a collection ──────────────────────────────────────────────────────
export const createCollection = async (
  params: CreateCollectionParams
): Promise<{ success: boolean; data: Collection }> => {
  const response = await userApi.post<{ success: boolean; data: Collection }>(
    '/v1/collections',
    params
  );
  return response.data;
};

// ─── Update a collection name ─────────────────────────────────────────────────
export const updateCollection = async (
  collectionId: string,
  name: string
): Promise<{ success: boolean; data: Collection }> => {
  const response = await userApi.post<{ success: boolean; data: Collection }>(
    `/v1/collections/${collectionId}`,
    { name }
  );
  return response.data;
};

// ─── Delete a collection ──────────────────────────────────────────────────────
export const deleteCollection = async (collectionId: string): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(`/v1/collections/${collectionId}`);
  return response.data;
};

// ─── Add a bookmark to a collection ──────────────────────────────────────────
export const addBookmarkToCollection = async (
  collectionId: string,
  bookmarkId: string
): Promise<{ success: boolean }> => {
  const response = await userApi.post<{ success: boolean }>(
    `/v1/collections/${collectionId}/bookmarks`,
    { bookmarkId }
  );
  return response.data;
};

// ─── Remove a bookmark from a collection ─────────────────────────────────────
export const removeBookmarkFromCollection = async (
  collectionId: string,
  bookmarkId: string
): Promise<{ success: boolean }> => {
  const response = await userApi.delete<{ success: boolean }>(
    `/v1/collections/${collectionId}/bookmarks`,
    { data: { bookmarkId } }
  );
  return response.data;
};
