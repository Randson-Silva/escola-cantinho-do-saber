import { Address, Student, StudentHasGuardian, Enrollment, Attendance } from '@prisma/client';

export type StudentSchema = Student & {
  addresses?: Address[];
  guardians?: (StudentHasGuardian & { guardian: { id: string } })[];
  enrollments?: Enrollment[];
  attendances?: Attendance[];
};
