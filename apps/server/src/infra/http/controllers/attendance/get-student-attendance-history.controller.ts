import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { GetStudentAttendanceHistoryUseCase } from '../../../../domain/application/use-cases/attendance/get-student-attendance-history.use-case';

@injectable()
export class GetStudentAttendanceHistoryController {
  public readonly router: Router;

  constructor(
    private readonly useCase: GetStudentAttendanceHistoryUseCase,
  ) {
    this.router = Router();

    // ROTA: GET /api/v1/students/:studentId/attendance-history
    this.router.get(
      '/students/:studentId/attendance-history',
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { studentId } = req.params;

    const result = await this.useCase.execute({ studentId });

    if (result.isFail()) {
      return res.status(400).json({ error: result.value.message });
    }

    const { history } = result.value;

    return res.status(200).json(history);
  }
}
