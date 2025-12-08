import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { LessonEntity } from 'apps/server/src/domain/enterprise/entities/lesson.entity';
import { LessonSchema } from '../schemas/lesson.schema';

export interface LessonPersistenceDTO {
  id: string;
  date: Date;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  classId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export class LessonMapper {
  static toDomain(raw: LessonSchema): LessonEntity {
    return LessonEntity.create(
      {
        classId: raw.classId,
        date: raw.date,
        startTime: raw.startTime,
        endTime: raw.endTime,
        duration: raw.duration,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: LessonEntity): LessonPersistenceDTO {
    return {
      id: entity.id.toString(),
      classId: entity.classId,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      duration: entity.duration,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
