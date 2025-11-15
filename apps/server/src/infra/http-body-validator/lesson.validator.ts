import { z } from 'zod';

export const createLessonBodySchema = z.object({
  lessonDate: z.coerce.date(),
  startTime: z.string().nullable().optional().default(null),
  endTime: z.string().nullable().optional().default(null),
  duration: z.string().nullable().optional().default(null),
});
export const createLessonParamsSchema = z.object({
  classId: z.string().ulid(),
});

export const lessonParamsSchema = z.object({
  id: z.string().ulid(),
});

export const updateLessonBodySchema = z.object({
  lessonDate: z.coerce.date(),
  startTime: z.string().nullable().optional().default(null),
  endTime: z.string().nullable().optional().default(null),
  duration: z.string().nullable().optional().default(null),
});
