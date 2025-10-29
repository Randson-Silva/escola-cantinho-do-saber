import { StudentEntity } from '../../enterprise/entities/student.entity';

export abstract class IStudentRepository {
  abstract create(studentEntity: StudentEntity): Promise<boolean>;
  abstract findById(id: string): Promise<StudentEntity | null>;
  abstract update(studentEntity: StudentEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;

  // ! functions to implement based on future (possible) scope:
  // findAll (based on class, serie, guardian)
  // findOne (based in the same parameters)
}

export const STUDENT_REPOSITORY_TOKEN = 'IStudentRepository';
