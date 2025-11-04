import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';
import { AttendanceSchema } from '../schemas/attendance.schema';

export class AttendanceMapper {
  static toDomain(raw: AttendanceSchema): AttendanceEntity {
    return AttendanceEntity.create(
      {
        studentId: raw.studentId,
        presenceStatus: raw.presenceStatus,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: AttendanceEntity): AttendanceSchema {
    return {
      id: entity.id.toString(),
      studentId: entity.studentId,
      presenceStatus: entity.presenceStatus,
    };
  }
}
