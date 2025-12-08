import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { RegisterStudentAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/register-student-attendance.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

const registerAttendanceBodySchema = z.object({
  studentId: z.string().min(1),
  presenceStatus: z.enum(AttendanceStatus), // Ajustado para Native Enum
});

const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
});

type RegisterAttendanceBodySchema = z.infer<typeof registerAttendanceBodySchema>;

const bodyValidationPipe = validateBody(registerAttendanceBodySchema);

@injectable()
export class RegisterStudentAttendanceController {
  public readonly router: Router;

  constructor(private readonly registerStudentAttendanceUseCase: RegisterStudentAttendanceUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/lessons/:lessonId/attendances',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = lessonIdParamSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid lessonId' });
    }

    const { lessonId } = paramsValidation.data;
    const body = req.body as RegisterAttendanceBodySchema;
    const { studentId, presenceStatus } = body;

    const result = await this.registerStudentAttendanceUseCase.execute({
      lessonId,
      studentId,
      presenceStatus,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case AlreadyExistsError:
          return res.status(409).json({ message });
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { attendanceId } = result.value;
    return res.status(201).json({ attendanceId });
  }
}
