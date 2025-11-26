import { TeacherEntity } from '../../enterprise/entities/teacher.entity';

export const TEACHER_REPOSITORY_TOKEN = 'ITeacherRepository';

export type TeacherFilterParams = {
  page: number;
  query?: string; // Nome
  status?: string; // 'ACTIVE' | 'INACTIVE' | 'ALL'
};

export abstract class ITeacherRepository {
  abstract create(teacher: TeacherEntity, seriesIds: string[]): Promise<boolean>;
  abstract findByEmail(email: string): Promise<TeacherEntity | null>;
  abstract findByTaxId(taxId: string): Promise<TeacherEntity | null>;

  abstract findById(id: string): Promise<TeacherEntity | null>;
  abstract findMany(params: TeacherFilterParams): Promise<TeacherEntity[]>;
  abstract save(teacher: TeacherEntity, seriesIds?: string[]): Promise<boolean>;
}
