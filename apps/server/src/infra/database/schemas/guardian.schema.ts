import { Guardian, Address, StudentHasGuardian } from '@prisma/client';

export type GuardianSchema = Guardian & {
  addresses?: Address[];
  students?: StudentHasGuardian[];
};
