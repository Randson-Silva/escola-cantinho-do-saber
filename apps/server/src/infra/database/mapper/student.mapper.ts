import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';
import { StudentSchema } from '../schemas/student.schema';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

export interface StudentPersistenceDTO {
  id: string;
  name: string;
  birthDate: Date;
  classId: string;
  currentGrade: SchoolGrade;
  createdAt: Date;
  deletedAt: Date | null;
  addressIds: string[];
}

export class StudentMapper {
  static toDomain(raw: StudentSchema): StudentEntity {
    return StudentEntity.create(
      {
        name: raw.name,
        birthDate: raw.birthDate,
        classId: raw.classId,
        currentGrade: raw.currentGrade as SchoolGrade,
        addressIds: raw.addresses?.map((a) => a.id) ?? [],
        guardianIds: raw.guardians?.map((g) => g.guardianId) ?? [],
        enrollmentIds: raw.enrollments?.map((e) => e.id) ?? [],
        attendanceIds: raw.attendances?.map((a) => a.id) ?? [],
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: StudentEntity): StudentPersistenceDTO {
    return {
      id: entity.id.toString(),
      name: entity.name,
      birthDate: entity.birthDate,
      classId: entity.classId,
      currentGrade: entity.currentGrade,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      addressIds: entity.addressIds,
    };
  }
}
