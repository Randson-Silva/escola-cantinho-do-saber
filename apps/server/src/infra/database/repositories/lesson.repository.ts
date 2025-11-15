import { ILessonRepository } from 'apps/server/src/domain/application/repositories/lesson.repository';
import { LessonEntity } from 'apps/server/src/domain/enterprise/entities/lesson.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { LessonMapper } from '../mapper/lesson.mapper';

@singleton()
export class LessonRepository implements ILessonRepository {
  async create(lessonEntity: LessonEntity): Promise<boolean> {
    try {
      const data = LessonMapper.toDatabase(lessonEntity);
      await prisma.lesson.create({ data });
      return true;
    } catch (error) {
      console.error('Error creating lesson:', error);
      return false;
    }
  }

  async findById(id: string): Promise<LessonEntity | null> {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return null;
    return LessonMapper.toDomain(lesson);
  }

  async update(lessonEntity: LessonEntity): Promise<boolean> {
    try {
      const data = LessonMapper.toDatabase(lessonEntity);
      await prisma.lesson.update({
        where: { id: lessonEntity.id.toString() },
        data,
      });
      return true;
    } catch (error) {
      console.error('Error updating lesson:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.lesson.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return false;
    }
  }

  async findByClassId(classId: string): Promise<LessonEntity[] | null> {
    const lessons = await prisma.lesson.findMany({ where: { classId } });
    if (!lessons || lessons.length === 0) return null;
    return lessons.map(LessonMapper.toDomain);
  }
}
