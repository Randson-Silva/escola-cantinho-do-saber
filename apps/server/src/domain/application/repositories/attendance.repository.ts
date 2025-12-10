import { AttendanceEntity } from '../../enterprise/entities/attendance.entity';

export abstract class IAttendanceRepository {
  abstract create(attendanceEntity: AttendanceEntity): Promise<boolean>;
  abstract findById(id: string): Promise<AttendanceEntity | null>;
  abstract update(attendanceEntity: AttendanceEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract findByStudentId(studentId: string): Promise<AttendanceEntity[] | null>;
  abstract findByStudentAndLesson(
    studentId: string,
    lessonId: string,
  ): Promise<AttendanceEntity | null>;
  abstract findByStudentIdAndDate(
    studentId: string,
    date: Date,
  ): Promise<AttendanceEntity[] | null>;
}

export const ATTENDANCE_REPOSITORY_TOKEN = 'IAttendanceRepository';
