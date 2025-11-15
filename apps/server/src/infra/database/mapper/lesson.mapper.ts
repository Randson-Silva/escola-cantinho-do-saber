import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { LessonEntity } from 'apps/server/src/domain/enterprise/entities/lesson.entity';
import { LessonSchema } from '../schemas/lesson.schema';

export class LessonMapper {
  static toDomain(raw: LessonSchema): LessonEntity {
    return LessonEntity.create(
      {
        classId: raw.classId,
        lessonDate: raw.lessonDate,
        startTime: raw.startTime,
        endTime: raw.endTime,
        duration: raw.duration,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: LessonEntity): LessonSchema {
    return {
      id: entity.id.toString(),
      classId: entity.classId,
      lessonDate: entity.lessonDate,
      startTime: entity.startTime,
      endTime: entity.endTime,
      duration: entity.duration,
    };
  }
}
