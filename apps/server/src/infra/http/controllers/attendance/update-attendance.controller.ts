import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { UpdateAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/update-attendance.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

const updateAttendanceBodySchema = z.object({
  presenceStatus: z.enum(AttendanceStatus),
});

const attendanceIdParamSchema = z.object({
  attendanceId: z.string().min(1),
});

type UpdateAttendanceBodySchema = z.infer<typeof updateAttendanceBodySchema>;

const bodyValidationPipe = validateBody(updateAttendanceBodySchema);

@injectable()
export class UpdateAttendanceController {
  public readonly router: Router;

  constructor(private readonly updateAttendanceUseCase: UpdateAttendanceUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/attendances/:attendanceId',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = attendanceIdParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid attendanceId' });
    }
    const { attendanceId } = paramsValidation.data;

    const body = req.body as UpdateAttendanceBodySchema;
    const { presenceStatus } = body;

    const result = await this.updateAttendanceUseCase.execute({
      attendanceId,
      presenceStatus,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotUpdateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { attendanceId: updatedId } = result.value;
    return res.status(200).json({ attendanceId: updatedId });
  }
}
