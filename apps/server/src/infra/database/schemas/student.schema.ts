import { Student, Address, StudentHasGuardian, Enrollment, Attendance } from '@prisma/client';

export type StudentSchema = Student & {
  addresses?: Address[];
  guardians?: StudentHasGuardian[];
  enrollments?: Enrollment[];
  attendances?: Attendance[];
};
