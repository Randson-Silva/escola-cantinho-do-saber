import { z } from 'zod';

export const registerAttendanceBodySchema = z.object({
  studentId: z.string().ulid(),
  presenceStatus: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO']),
});

export type RegisterAttendanceBody = z.infer<typeof registerAttendanceBodySchema>;

export const attendanceParamsSchema = z.object({
  lessonId: z.string().ulid(),
});
