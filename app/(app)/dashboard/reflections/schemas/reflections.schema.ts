import { z } from 'zod';

// Verse range format: "1:1-1:7" or multiple "1:1-1:7,2:1-2:5"
const verseRangeRegex = /^(\d+:\d+-\d+:\d+(?:,\d+:\d+-\d+:\d+)*)$/;

export const logActivitySchema = z.object({
  seconds: z.number().int().min(1, 'Reading duration must be at least 1 second'),
  ranges: z
    .array(
      z.string().regex(verseRangeRegex, 'Range must be in format "chapter:verse-chapter:verse"')
    )
    .min(1, 'At least one verse range is required'),
  mushafId: z.number().int().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  type: z.enum(['QURAN', 'LESSON', 'QURAN_READING_PROGRAM']).default('QURAN')
});

export const listBookmarksSchema = z.object({
  type: z.enum(['ayah', 'juz', 'surah', 'page']).default('ayah'),
  mushafId: z.number().int().min(1),
  first: z.number().int().min(1).max(20).optional(),
  after: z.string().optional(),
  last: z.number().int().min(1).max(20).optional(),
  before: z.string().optional()
});

export const createBookmarkSchema = z.object({
  type: z.enum(['ayah', 'juz', 'surah', 'page']),
  key: z.number().int().min(1),
  verseNumber: z.number().int().min(1).optional(),
  mushafId: z.number().int().min(1),
  isReading: z.boolean().optional()
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;
export type ListBookmarksInput = z.infer<typeof listBookmarksSchema>;
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
