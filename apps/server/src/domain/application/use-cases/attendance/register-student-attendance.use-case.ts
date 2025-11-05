import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { AttendanceEntity } from '../../../enterprise/entities/attendance.entity';
import { AttendanceLinkedToLessonEntity } from '../../../enterprise/entities/attendance-linked-to-lesson.entity';
import {
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  IAttendanceLinkedToLessonRepository,
} from '../../repositories/attendance-linked-to-lesson.repository';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from '../../repositories/lesson.repository';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';

type RegisterStudentAttendanceUseCaseRequest = {
  studentId: string;
  lessonId: string;
  presenceStatus: string;
};

type RegisterStudentAttendanceUseCaseResponse = Either<
  Error,
  { attendanceId: string }
>;

@singleton()
export class RegisterStudentAttendanceUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
    @inject(ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN)
    private readonly linkRepository: IAttendanceLinkedToLessonRepository,
  ) {}

  async execute({
    studentId,
    lessonId,
    presenceStatus,
  }: RegisterStudentAttendanceUseCaseRequest): Promise<RegisterStudentAttendanceUseCaseResponse> {
    try {
      const student = await this.studentRepository.findById(studentId);
      if (!student) return fail(new ResourceNotFoundError('Student'));

      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) return fail(new ResourceNotFoundError('Lesson'));

      const attendance = AttendanceEntity.create({
        studentId,
        presenceStatus,
      });

      const canCreateAttendance = await this.attendanceRepository.create(attendance);
      if (!canCreateAttendance) {
        return fail(new CannotCreateError('Attendance record'));
      }

      const linkEntity = AttendanceLinkedToLessonEntity.create({
        attendanceId: attendance.id.toString(),
        lessonId: lessonId,
      });

      const canCreateLink = await this.linkRepository.create(linkEntity);
      if (!canCreateLink) {
        return fail(new CannotCreateError('Attendance link'));
      }

      return succeed({ attendanceId: attendance.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot register attendance due to error' + error));
    }
  }
}
