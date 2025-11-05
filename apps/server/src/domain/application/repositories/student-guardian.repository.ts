import { StudentGuardianEntity } from '../../enterprise/entities/student-guardian.entity';

export abstract class IStudentGuardianRepository {
  abstract create(entity: StudentGuardianEntity): Promise<boolean>;

  abstract update(entity: StudentGuardianEntity): Promise<boolean>;

  abstract delete(studentId: string, guardianId: string): Promise<boolean>;

  abstract findUnique(studentId: string, guardianId: string): Promise<StudentGuardianEntity | null>;

  abstract findByStudentId(studentId: string): Promise<StudentGuardianEntity[] | null>;

  abstract findByGuardianId(guardianId: string): Promise<StudentGuardianEntity[] | null>;
}

export const STUDENT_GUARDIAN_REPOSITORY_TOKEN = 'IStudentGuardianRepository';
