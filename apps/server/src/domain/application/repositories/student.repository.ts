import { StudentEntity } from '../../enterprise/entities/student.entity';

export abstract class IStudentRepository {
  abstract create(studentEntity: StudentEntity): Promise<boolean>;
  abstract findById(id: string): Promise<StudentEntity | null>;
  abstract update(studentEntity: StudentEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract findByName(name: string): Promise<StudentEntity[]>;
  abstract getStudentsCount(): Promise<number>;
}

export const STUDENT_REPOSITORY_TOKEN = 'IStudentRepository';
