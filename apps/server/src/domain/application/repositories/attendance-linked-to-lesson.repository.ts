import { AttendanceLinkedToLessonEntity } from '../../enterprise/entities/attendance-linked-to-lesson.entity';

export abstract class IAttendanceLinkedToLessonRepository {

  abstract create(entity: AttendanceLinkedToLessonEntity): Promise<boolean>;
  abstract delete(attendanceId: string, lessonId: string): Promise<boolean>;
  abstract findUnique(
    attendanceId: string,
    lessonId: string,
  ): Promise<AttendanceLinkedToLessonEntity | null>;
  abstract findByLessonId(lessonId: string): Promise<AttendanceLinkedToLessonEntity[] | null>;
  abstract findByAttendanceId(
    attendanceId: string,
  ): Promise<AttendanceLinkedToLessonEntity[] | null>;
  abstract findManyByStudentId(
    studentId: string,
  ): Promise<AttendanceLinkedToLessonEntity[] | null>;
}

export const ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN =
  'IAttendanceLinkedToLessonRepository';
