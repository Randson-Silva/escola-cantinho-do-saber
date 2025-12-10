import { TeacherEntity } from '../../enterprise/entities/teacher.entity';

export const TEACHER_REPOSITORY_TOKEN = 'ITeacherRepository';

export type TeacherFilterParams = {
  page: number;
  query?: string;
  status?: string;
};

export abstract class ITeacherRepository {
  abstract create(teacher: TeacherEntity): Promise<boolean>;

  abstract findByEmail(email: string): Promise<TeacherEntity | null>;
  abstract findByTaxId(taxId: string): Promise<TeacherEntity | null>;
  abstract findById(id: string): Promise<TeacherEntity | null>;
  abstract findMany(params: TeacherFilterParams): Promise<TeacherEntity[]>;

  abstract save(teacher: TeacherEntity): Promise<boolean>;

  abstract delete(id: string): Promise<boolean>;
}
