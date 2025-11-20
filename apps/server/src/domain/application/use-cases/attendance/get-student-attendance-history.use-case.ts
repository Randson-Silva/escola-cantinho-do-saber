import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from '../../../../core/either';
import {
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  IAttendanceLinkedToLessonRepository,
} from '../../repositories/attendance-linked-to-lesson.repository';

export interface StudentAttendanceHistory {
  studentId: string;
  totalLessons: number;
  presences: number;
  absences: number;
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
    @inject(ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN)
    private readonly attendanceLinkedRepo: IAttendanceLinkedToLessonRepository,
  ) {}

  async execute(
    { studentId }: RequestDTO,
  ): Promise<GetStudentAttendanceHistoryResponse> {
    if (!studentId) {
      return fail(new Error('studentId é obrigatório'));
    }

    const records = await this.attendanceLinkedRepo.findManyByStudentId(
      studentId,
    );

    if (!records || records.length === 0) {
      return fail(new Error('Nenhuma frequência encontrada para este aluno'));
    }

    const totalLessons = records.length;

    const presences = records.filter((r: any) => r.present === true).length;
    const absences = totalLessons - presences;

    const attendancePercentage =
      totalLessons === 0 ? 0 : (presences / totalLessons) * 100;

    const history: StudentAttendanceHistory = {
      studentId,
      totalLessons,
      presences,
      absences,
      attendancePercentage,
    };

    return succeed({ history });
  }
}
