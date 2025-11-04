import { LessonEntity } from '../../enterprise/entities/lesson.entity';

export abstract class ILessonRepository {

  abstract create(lessonEntity: LessonEntity): Promise<boolean>;
  abstract findById(id: string): Promise<LessonEntity | null>;
  abstract update(lessonEntity: LessonEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract findByClassId(classId: string): Promise<LessonEntity[] | null>;
}

export const LESSON_REPOSITORY_TOKEN = 'ILessonRepository';
