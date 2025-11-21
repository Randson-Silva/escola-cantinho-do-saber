import { AttendanceLinkedToLessonEntity } from 'apps/server/src/domain/enterprise/entities/attendance-linked-to-lesson.entity';
import { AttendanceLinkedToLessonSchema } from '../schemas/attendance-linked-to-lesson.schema';

export class AttendanceLinkedToLessonMapper {
  static toDomain(
    raw: AttendanceLinkedToLessonSchema,
  ): AttendanceLinkedToLessonEntity {
    return AttendanceLinkedToLessonEntity.create({
      attendanceId: raw.attendanceId,
      lessonId: raw.lessonId,
    });
  }

  static toDatabase(
    entity: AttendanceLinkedToLessonEntity,
  ): Omit<AttendanceLinkedToLessonSchema, 'attendance' | 'lesson'> {
    return {
      attendanceId: entity.attendanceId,
      lessonId: entity.lessonId,
    };
  }
}
