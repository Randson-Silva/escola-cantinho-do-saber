import { z } from 'zod';

export const createGuardianBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email().nullable().optional(),
  phones: z.array(z.string()).min(1),
});

export type CreateGuardianBody = z.infer<typeof createGuardianBodySchema>;
