import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { inject, singleton } from 'tsyringe';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';

type DeleteAttendanceRequest = { attendanceId: string };

type DeleteAttendanceResponse = Either<
  ResourceNotFoundError | CannotDeleteError,
  { attendanceId: string }
>;

@singleton()
export class DeleteAttendanceUseCase {
  constructor(
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute({ attendanceId }: DeleteAttendanceRequest): Promise<DeleteAttendanceResponse> {
    const existing = await this.attendanceRepository.findById(attendanceId);
    if (!existing) return fail(new ResourceNotFoundError('Attendance'));

    const deleted = await this.attendanceRepository.delete(attendanceId);
    if (!deleted) return fail(new CannotDeleteError('Attendance'));

    return succeed({ attendanceId });
  }
}
