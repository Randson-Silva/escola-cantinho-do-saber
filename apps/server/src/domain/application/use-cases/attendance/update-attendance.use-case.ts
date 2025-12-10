import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { inject, singleton } from 'tsyringe';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

type UpdateAttendanceRequest = {
  attendanceId: string;
  presenceStatus: AttendanceStatus;
};

type UpdateAttendanceResponse = Either<
  ResourceNotFoundError | CannotUpdateError,
  { attendanceId: string }
>;

@singleton()
export class UpdateAttendanceUseCase {
  constructor(
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute({
    attendanceId,
    presenceStatus,
  }: UpdateAttendanceRequest): Promise<UpdateAttendanceResponse> {
    const existing = await this.attendanceRepository.findById(attendanceId);
    if (!existing) return fail(new ResourceNotFoundError('Attendance'));

    existing.presenceStatus = presenceStatus;

    const canUpdate = await this.attendanceRepository.update(existing);

    if (!canUpdate) return fail(new CannotUpdateError('Attendance'));

    return succeed({ attendanceId });
  }
}
