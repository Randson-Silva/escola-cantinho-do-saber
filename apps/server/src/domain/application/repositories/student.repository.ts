import { StudentEntity } from '../../enterprise/entities/student.entity';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

export abstract class IStudentRepository {
  abstract create(studentEntity: StudentEntity): Promise<boolean>;
  abstract findById(id: string): Promise<StudentEntity | null>;
  abstract update(studentEntity: StudentEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;

  abstract findByName(name: string): Promise<StudentEntity[]>;
  abstract findAllByClass(classId: string): Promise<StudentEntity[]>;
  abstract findAllByGrade(grade: SchoolGrade): Promise<StudentEntity[]>; // Substitui findAllBySeries

  abstract getStudentsCount(): Promise<number>;
}

export const STUDENT_REPOSITORY_TOKEN = 'IStudentRepository';
