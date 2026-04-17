import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  mode: z.enum(['quick', 'advanced']).default('quick'),
  translation_ids: z.string().optional(),
  exact_matches_only: z.enum(['0', '1']).default('0'),
  get_text: z.enum(['0', '1']).default('1'),
  highlight: z.enum(['0', '1']).default('1'),
  navigationalResultsNumber: z.number().int().min(1).max(50).default(5),
  versesResultsNumber: z.number().int().min(1).max(50).default(20)
});

export const tafsirQuerySchema = z.object({
  resource_id: z.number().int().positive(),
  chapter_number: z.number().int().min(1).max(114),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(50).default(10)
});

export type SearchInput = z.infer<typeof searchSchema>;
export type TafsirQueryInput = z.infer<typeof tafsirQuerySchema>;
