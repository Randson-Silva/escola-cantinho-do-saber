import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { GetStudentAttendanceHistoryUseCase } from 'apps/server/src/domain/application/use-cases/attendance/get-student-attendance-history.use-case';

const studentIdParamSchema = z.object({
  studentId: z.string().min(1),
});

@injectable()
export class GetStudentAttendanceHistoryController {
  public readonly router: Router;

  constructor(
    private readonly getStudentAttendanceHistoryUseCase: GetStudentAttendanceHistoryUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/students/:studentId/attendance-history',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN', 'COMUM']),
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = studentIdParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }
    const { studentId } = paramsValidation.data;

    const result = await this.getStudentAttendanceHistoryUseCase.execute({ studentId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;
      return res.status(500).json({ message });
    }

    const { history } = result.value;
    return res.status(200).json(history);
  }
}
