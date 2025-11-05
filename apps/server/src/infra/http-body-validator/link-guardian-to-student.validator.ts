import { z } from 'zod';

export const linkGuardianToStudentBodySchema = z.object({
  guardianId: z.string().ulid(),
  kinship: z.string().nullable().optional(),
});

export type LinkGuardianToStudentBody = z.infer<
  typeof linkGuardianToStudentBodySchema
>;

export const studentGuardianParamsSchema = z.object({
  studentId: z.string().ulid(),
});
