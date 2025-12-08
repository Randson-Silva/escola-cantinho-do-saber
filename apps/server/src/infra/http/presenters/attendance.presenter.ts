import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';

export class AttendancePresenter {
  static toHTTP(entity: AttendanceEntity) {
    return {
      id: entity.id.toString(),
      studentId: entity.studentId,
      presenceStatus: entity.presenceStatus,
      lessonId: entity.lessonId,
      createdAt: entity.createdAt,
    };
  }
}
