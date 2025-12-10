import { StudentGuardianEntity } from 'apps/server/src/domain/enterprise/entities/student-guardian.entity';
import { StudentGuardianSchema } from '../schemas/student-guardian.schema';
import { Kinship } from 'apps/server/src/core/types/school-enums';
import { Kinship as DbKinship } from '@prisma/client';

export interface StudentGuardianPersistenceDTO {
  studentId: string;
  guardianId: string;
  kinship: DbKinship;
  createdAt: Date;
  deletedAt: Date | null;
}

export class StudentGuardianMapper {
  static toDomain(raw: StudentGuardianSchema): StudentGuardianEntity {
    return StudentGuardianEntity.create({
      studentId: raw.studentId,
      guardianId: raw.guardianId,
      kinship: raw.kinship as Kinship,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDatabase(entity: StudentGuardianEntity): StudentGuardianPersistenceDTO {
    return {
      studentId: entity.studentId,
      guardianId: entity.guardianId,
      kinship: entity.kinship as DbKinship,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
