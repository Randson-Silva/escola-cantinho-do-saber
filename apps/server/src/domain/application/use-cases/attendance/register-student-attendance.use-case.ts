import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { AttendanceEntity } from '../../../enterprise/entities/attendance.entity';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';
import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from '../../repositories/lesson.repository';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

type RegisterStudentAttendanceUseCaseRequest = {
  studentId: string;
  lessonId: string;
  presenceStatus: AttendanceStatus;
};

type RegisterStudentAttendanceUseCaseResponse = Either<Error, { attendanceId: string }>;

@singleton()
export class RegisterStudentAttendanceUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
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

      const existingAttendance = await this.attendanceRepository.findByStudentAndLesson(
        studentId,
        lessonId,
      );

      if (existingAttendance) {
        return fail(new AlreadyExistsError('Attendance for this student in this lesson'));
      }

      const attendance = AttendanceEntity.create({
        studentId,
        lessonId,
        presenceStatus,
      });
      const canCreateAttendance = await this.attendanceRepository.create(attendance);

      if (!canCreateAttendance) {
        return fail(new CannotCreateError('Attendance record'));
      }

      // Não precisamos mais criar o link separadamente

      return succeed({ attendanceId: attendance.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot register attendance due to error: ' + error));
    }
  }
}
