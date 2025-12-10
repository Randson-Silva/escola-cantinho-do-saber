import { ILessonRepository } from 'apps/server/src/domain/application/repositories/lesson.repository';
import { LessonEntity } from 'apps/server/src/domain/enterprise/entities/lesson.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { LessonMapper } from '../mapper/lesson.mapper';
import { LessonSchema } from '../schemas/lesson.schema';

@singleton()
export class LessonRepository implements ILessonRepository {
  async create(lessonEntity: LessonEntity): Promise<boolean> {
    try {
      const data = LessonMapper.toDatabase(lessonEntity);
      await prisma.lesson.create({ data });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findById(id: string): Promise<LessonEntity | null> {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return null;
    return LessonMapper.toDomain(lesson as LessonSchema);
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
      console.error(error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.lesson.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findByClassId(classId: string): Promise<LessonEntity[] | null> {
    const lessons = await prisma.lesson.findMany({
      where: { classId, deletedAt: null },
    });
    if (!lessons.length) return null;
    return lessons.map((l) => LessonMapper.toDomain(l as LessonSchema));
  }

  async findByClassAndDateWithAttendances(
    classId: string,
    date: Date,
  ): Promise<{ startTime: string; endTime: string; studentCount: number }[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const lessons = await prisma.lesson.findMany({
      where: {
        classId,
        date: { gte: start, lte: end },
        deletedAt: null,
      },
      select: {
        startTime: true,
        endTime: true,
        _count: {
          select: { attendances: true },
        },
      },
    });

    return lessons.map((l) => ({
      startTime: l.startTime!,
      endTime: l.endTime!,
      studentCount: l._count.attendances,
    }));
  }
}
