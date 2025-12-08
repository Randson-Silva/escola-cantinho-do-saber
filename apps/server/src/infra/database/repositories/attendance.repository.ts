import { IAttendanceRepository } from 'apps/server/src/domain/application/repositories/attendance.repository';
import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { AttendanceMapper } from '../mapper/attendance.mapper';
import { AttendanceSchema } from '../schemas/attendance.schema';

@singleton()
export class AttendanceRepository implements IAttendanceRepository {
  async create(attendanceEntity: AttendanceEntity): Promise<boolean> {
    try {
      const raw = AttendanceMapper.toDatabase(attendanceEntity);

      await prisma.attendance.create({
        data: {
          id: raw.id,
          studentId: raw.studentId,
          lessonId: raw.lessonId,
          status: raw.status,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findById(id: string): Promise<AttendanceEntity | null> {
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    if (!attendance) return null;
    return AttendanceMapper.toDomain(attendance as AttendanceSchema);
  }

  async update(attendanceEntity: AttendanceEntity): Promise<boolean> {
    try {
      const raw = AttendanceMapper.toDatabase(attendanceEntity);
      await prisma.attendance.update({
        where: { id: raw.id },
        data: {
          status: raw.status,
          deletedAt: raw.deletedAt,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.attendance.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findByStudentId(studentId: string): Promise<AttendanceEntity[] | null> {
    const records = await prisma.attendance.findMany({
      where: { studentId, deletedAt: null },
    });
    if (!records.length) return null;
    return records.map((r) => AttendanceMapper.toDomain(r as AttendanceSchema));
  }

  async findByStudentAndLesson(
    studentId: string,
    lessonId: string,
  ): Promise<AttendanceEntity | null> {
    const record = await prisma.attendance.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    });
    if (!record || record.deletedAt) return null;
    return AttendanceMapper.toDomain(record as AttendanceSchema);
  }

  async findByStudentIdAndDate(studentId: string, date: Date): Promise<AttendanceEntity[] | null> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        studentId,
        deletedAt: null,
        lesson: {
          date: { gte: start, lte: end },
        },
      },
    });
    if (!records.length) return null;
    return records.map((r) => AttendanceMapper.toDomain(r as AttendanceSchema));
  }
}
