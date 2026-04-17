import { z } from 'zod';

export const listVersesSchema = z.object({
  language: z.string().default('en'),
  words: z.boolean().default(false),
  translations: z.string().optional(),
  audio: z.number().int().positive().optional(),
  tafsirs: z.string().optional(),
  fields: z.string().optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(50).default(10)
});

export const verseKeySchema = z.object({
  chapter_number: z.number().int().min(1).max(114),
  verse_number: z.number().int().min(1)
});

export const chapterNumberSchema = z.object({
  chapter_number: z.number().int().min(1).max(114)
});

export type ListVersesInput = z.infer<typeof listVersesSchema>;
export type VerseKeyInput = z.infer<typeof verseKeySchema>;
export type ChapterNumberInput = z.infer<typeof chapterNumberSchema>;
