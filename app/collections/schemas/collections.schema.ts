import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Collection name is required')
    .max(100, 'Collection name must be under 100 characters')
    .trim()
});

export const listCollectionsSchema = z.object({
  sortBy: z.enum(['recentlyUpdated', 'alphabetical']).optional(),
  type: z.enum(['ayah', 'juz', 'surah', 'page']).default('ayah'),
  first: z.number().int().min(1).max(20).optional(),
  after: z.string().optional(),
  last: z.number().int().min(1).max(20).optional(),
  before: z.string().optional()
});

export const addBookmarkToCollectionSchema = z.object({
  collectionId: z.string().min(1),
  bookmarkId: z.string().min(1)
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type ListCollectionsInput = z.infer<typeof listCollectionsSchema>;
export type AddBookmarkToCollectionInput = z.infer<typeof addBookmarkToCollectionSchema>;
