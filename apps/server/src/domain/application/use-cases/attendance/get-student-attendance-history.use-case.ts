import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '../../repositories/attendance.repository';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

export interface StudentAttendanceHistory {
  studentId: string;
  totalLessons: number;
  presences: number;
  absences: number;
  justified: number;
  attendancePercentage: number;
}

type RequestDTO = { studentId: string };

export type GetStudentAttendanceHistoryResponse = Either<
  Error,
  { history: StudentAttendanceHistory }
>;

@injectable()
export class GetStudentAttendanceHistoryUseCase {
  constructor(
    @inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute({ studentId }: RequestDTO): Promise<GetStudentAttendanceHistoryResponse> {
    if (!studentId) {
      return fail(new Error('studentId é obrigatório'));
    }

    const records = await this.attendanceRepository.findByStudentId(studentId);

    // Se não houver registros, retorna histórico zerado (não é um erro de sistema)
    if (!records || records.length === 0) {
      return succeed({
        history: {
          studentId,
          totalLessons: 0,
          presences: 0,
          absences: 0,
          justified: 0,
          attendancePercentage: 0,
        },
      });
    }

    const totalLessons = records.length;

    const presences = records.filter((r) => r.presenceStatus === AttendanceStatus.PRESENTE).length;
    const absences = records.filter((r) => r.presenceStatus === AttendanceStatus.AUSENTE).length;
    const justified = records.filter(
      (r) => r.presenceStatus === AttendanceStatus.JUSTIFICADO,
    ).length;

    const effectivePresences = presences + justified;
    const attendancePercentage = totalLessons === 0 ? 0 : (effectivePresences / totalLessons) * 100;

    const history: StudentAttendanceHistory = {
      studentId,
      totalLessons,
      presences,
      absences,
      justified,
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
    };

    return succeed({ history });
  }
}
