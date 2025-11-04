import { z } from 'zod';

export const createLessonBodySchema = z.object({
  lessonDate: z.coerce.date(),
  startTime: z.string().nullable().optional().default(null),
  endTime: z.string().nullable().optional().default(null),
  duration: z.string().nullable().optional().default(null),
});

export type CreateLessonBody = z.infer<typeof createLessonBodySchema>;

export const lessonParamsSchema = z.object({
  classId: z.string().ulid(),
});
