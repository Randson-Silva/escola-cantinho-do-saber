import { LessonEntity } from 'apps/server/src/domain/enterprise/entities/lesson.entity';

export class LessonPresenter {
  static toHTTP(lesson: LessonEntity) {
    return {
      id: lesson.id.toString(),
      classId: lesson.classId,
      date: lesson.date,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      duration: lesson.duration,
      createdAt: lesson.createdAt,
    };
  }
}
