import { z } from 'zod';

export const fetchStreakSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  type: z.literal('QURAN').default('QURAN'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  orderBy: z.enum(['startDate', 'days']).default('startDate'),
  status: z.enum(['ACTIVE', 'BROKEN']).optional(),
  first: z.number().int().min(1).max(20).optional(),
  last: z.number().int().min(1).max(20).optional()
});

export const createGoalSchema = z.object({
  type: z.string().min(1),
  target: z.number().int().positive('Target must be a positive number'),
  unit: z.string().min(1)
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  given_name: z.string().max(50).optional(),
  family_name: z.string().max(50).optional(),
  locale: z.string().optional()
});

export type FetchStreakInput = z.infer<typeof fetchStreakSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
