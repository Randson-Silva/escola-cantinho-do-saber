import { IAttendanceRepository } from 'apps/server/src/domain/application/repositories/attendance.repository';
import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { AttendanceMapper } from '../mapper/attendance.mapper';

@singleton()
export class AttendanceRepository implements IAttendanceRepository {
  async create(attendanceEntity: AttendanceEntity): Promise<boolean> {
    try {
      const data = AttendanceMapper.toDatabase(attendanceEntity);
      await prisma.attendance.create({ data });
      return true;
    } catch (error) {
      console.error('Error creating attendance:', error);
      return false;
    }
  }

  async findById(id: string): Promise<AttendanceEntity | null> {
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    if (!attendance) return null;
    return AttendanceMapper.toDomain(attendance);
  }

  async update(attendanceEntity: AttendanceEntity): Promise<boolean> {
    try {
      const data = AttendanceMapper.toDatabase(attendanceEntity);
      await prisma.attendance.update({
        where: { id: attendanceEntity.id.toString() },
        data,
      });
      return true;
    } catch (error) {
      console.error('Error updating attendance:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.attendance.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return false;
    }
  }

  async findByStudentId(studentId: string): Promise<AttendanceEntity[] | null> {
    const records = await prisma.attendance.findMany({ where: { studentId } });
    if (!records || records.length === 0) return null;
    return records.map(AttendanceMapper.toDomain);
  }

  async findByStudentIdAndDate(studentId: string, date: Date): Promise<AttendanceEntity | null> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const record = await prisma.attendance.findFirst({
      where: {
        studentId,
        linkedLessons: {
          some: {
            lesson: {
              lessonDate: {
                gte: start,
                lte: end,
              },
            },
          },
        },
      },
      include: { linkedLessons: { include: { lesson: true } } },
    });

    if (!record) return null;
    return AttendanceMapper.toDomain(record);
  }
}
