import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { TeacherSchema } from '../schemas/teacher.schema';

export interface TeacherPersistenceDTO {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  email: string;
  pixKey: string;
  startDate: Date;
  status: string;
  expertise: string | null;
  qualifiedGrades: SchoolGrade[];
  createdAt: Date;
  deletedAt: Date | null;
}

export class TeacherMapper {
  static toDomain(raw: TeacherSchema): TeacherEntity {
    return TeacherEntity.create(
      {
        name: raw.name,
        taxId: raw.taxId,
        phone: raw.phone,
        email: raw.email,
        pixKey: raw.pixKey,
        startDate: raw.startDate,
        status: raw.status,
        expertise: raw.expertise,
        qualifiedGrades: (raw.qualifiedGrades as SchoolGrade[]) ?? [],
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: TeacherEntity): TeacherPersistenceDTO {
    return {
      id: entity.id.toString(),
      name: entity.name,
      taxId: entity.taxId,
      phone: entity.phone,
      email: entity.email,
      pixKey: entity.pixKey,
      startDate: entity.startDate,
      status: entity.status,
      expertise: entity.expertise ?? null,
      qualifiedGrades: entity.qualifiedGrades,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
