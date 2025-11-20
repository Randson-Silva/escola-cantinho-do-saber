import { IAttendanceLinkedToLessonRepository } from 'apps/server/src/domain/application/repositories/attendance-linked-to-lesson.repository';
import { AttendanceLinkedToLessonEntity } from 'apps/server/src/domain/enterprise/entities/attendance-linked-to-lesson.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { AttendanceLinkedToLessonMapper } from '../mapper/attendance-linked-to-lesson.mapper';

@singleton()
export class AttendanceLinkedToLessonRepository
  implements IAttendanceLinkedToLessonRepository
{
  async create(entity: AttendanceLinkedToLessonEntity): Promise<boolean> {
    try {
      const data = AttendanceLinkedToLessonMapper.toDatabase(entity);
      await prisma.attendanceLinkedToLesson.create({ data });
      return true;
    } catch (error) {
      console.error('Error creating attendance link:', error);
      return false;
    }
  }

  async delete(attendanceId: string, lessonId: string): Promise<boolean> {
    try {
      await prisma.attendanceLinkedToLesson.delete({
        where: {
          attendanceId_lessonId: { attendanceId, lessonId },
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting attendance link:', error);
      return false;
    }
  }

  async findUnique(
    attendanceId: string,
    lessonId: string,
  ): Promise<AttendanceLinkedToLessonEntity | null> {
    const link = await prisma.attendanceLinkedToLesson.findUnique({
      where: {
        attendanceId_lessonId: { attendanceId, lessonId },
      },
    });
    if (!link) return null;
    return AttendanceLinkedToLessonMapper.toDomain(link);
  }

  async findByLessonId(
    lessonId: string,
  ): Promise<AttendanceLinkedToLessonEntity[] | null> {
    const links = await prisma.attendanceLinkedToLesson.findMany({
      where: { lessonId },
    });
    if (!links || links.length === 0) return null;
    return links.map(AttendanceLinkedToLessonMapper.toDomain);
  }

  async findByAttendanceId(
    attendanceId: string,
  ): Promise<AttendanceLinkedToLessonEntity[] | null> {
    const links = await prisma.attendanceLinkedToLesson.findMany({
      where: { attendanceId },
    });
    if (!links || links.length === 0) return null;
    return links.map(AttendanceLinkedToLessonMapper.toDomain);
  } 
  
  async findManyByStudentId(
    studentId: string,
  ): Promise<AttendanceLinkedToLessonEntity[] | null> {
    const links = await prisma.attendanceLinkedToLesson.findMany({
      where: { studentId },
    });
    if (!links || links.length === 0) return null;
    return links.map(AttendanceLinkedToLessonMapper.toDomain);
  }
}
