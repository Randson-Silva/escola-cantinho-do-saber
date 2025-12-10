import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';
import { AttendanceSchema } from '../schemas/attendance.schema';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

export interface AttendancePersistenceDTO {
  id: string;
  studentId: string;
  lessonId: string;
  status: AttendanceStatus;
  createdAt: Date;
  deletedAt: Date | null;
}

export class AttendanceMapper {
  static toDomain(raw: AttendanceSchema): AttendanceEntity {
    return AttendanceEntity.create(
      {
        studentId: raw.studentId,
        presenceStatus: raw.status as AttendanceStatus,
        lessonId: raw.lessonId,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: AttendanceEntity): AttendancePersistenceDTO {
    return {
      id: entity.id.toString(),
      studentId: entity.studentId,
      status: entity.presenceStatus,
      lessonId: entity.lessonId,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
