import { TeacherEntity } from '../../enterprise/entities/teacher.entity';

export abstract class ITeacherRepository {
  abstract create(teacher: TeacherEntity, seriesIds: string[]): Promise<boolean>;

  abstract findByEmail(email: string): Promise<TeacherEntity | null>;
  abstract findByTaxId(taxId: string): Promise<TeacherEntity | null>;
}

export const TEACHER_REPOSITORY_TOKEN = 'ITeacherRepository';
