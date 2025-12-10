import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { DeleteAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/delete-attendance.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';

const attendanceIdParamSchema = z.object({
  attendanceId: z.string().min(1),
});

@injectable()
export class DeleteAttendanceController {
  public readonly router: Router;

  constructor(private readonly deleteAttendanceUseCase: DeleteAttendanceUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete(
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

    const result = await this.deleteAttendanceUseCase.execute({ attendanceId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotDeleteError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).send();
  }
}
