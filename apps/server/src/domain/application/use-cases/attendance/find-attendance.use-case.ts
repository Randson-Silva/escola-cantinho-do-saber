import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { AttendanceEntity } from '../../../enterprise/entities/attendance.entity';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';

type FindAttendanceRequest = { attendanceId: string };

type FindAttendanceResponse = Either<ResourceNotFoundError, { attendance: AttendanceEntity }>;

@singleton()
export class FindAttendanceUseCase {
  constructor(
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute({ attendanceId }: FindAttendanceRequest): Promise<FindAttendanceResponse> {
    const attendance = await this.attendanceRepository.findById(attendanceId);
    if (!attendance) return fail(new ResourceNotFoundError('Attendance'));
    return succeed({ attendance });
  }
}
