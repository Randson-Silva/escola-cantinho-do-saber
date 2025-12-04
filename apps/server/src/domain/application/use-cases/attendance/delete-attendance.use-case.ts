import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { inject, singleton } from 'tsyringe';
import {
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  IAttendanceLinkedToLessonRepository,
} from '../../repositories/attendance-linked-to-lesson.repository';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';

type DeleteAttendanceRequest = { attendanceId: string };

type DeleteAttendanceResponse = Either<ResourceNotFoundError | CannotDeleteError, { attendanceId: string }>;

@singleton()
export class DeleteAttendanceUseCase {
  constructor(
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
    @inject(ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN)
    private readonly linkRepository: IAttendanceLinkedToLessonRepository,
  ) {}

  async execute({ attendanceId }: DeleteAttendanceRequest): Promise<DeleteAttendanceResponse> {
    const existing = await this.attendanceRepository.findById(attendanceId);
    if (!existing) return fail(new ResourceNotFoundError('Attendance'));

    const links = await this.linkRepository.findByAttendanceId(attendanceId);
    if (links && links.length > 0) {
      for (const l of links) {
        await this.linkRepository.delete(attendanceId, l.lessonId);
      }
    }

    const deleted = await this.attendanceRepository.delete(attendanceId);
    if (!deleted) return fail(new CannotDeleteError('Attendance'));

    return succeed({ attendanceId });
  }
}
