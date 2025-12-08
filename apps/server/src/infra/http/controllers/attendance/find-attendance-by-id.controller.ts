import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { FindAttendanceByIdUseCase } from 'apps/server/src/domain/application/use-cases/attendance/find-attendance-by-id.use-case';
import { AttendancePresenter } from '../../presenters/attendance.presenter';

const attendanceIdParamSchema = z.object({
  attendanceId: z.string().min(1),
});

@injectable()
export class FindAttendanceByIdController {
  public readonly router: Router;

  constructor(private readonly findAttendanceByIdUseCase: FindAttendanceByIdUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/attendances/:attendanceId',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = attendanceIdParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid attendanceId' });
    }
    const { attendanceId } = paramsValidation.data;

    const result = await this.findAttendanceByIdUseCase.execute({ attendanceId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { attendance } = result.value;
    return res.status(200).json(AttendancePresenter.toHTTP(attendance));
  }
}
