import { RegisterStudentAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/register-student-attendance.use-case';
import { FindAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/find-attendance.use-case';
import { UpdateAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/update-attendance.use-case';
import { DeleteAttendanceUseCase } from 'apps/server/src/domain/application/use-cases/attendance/delete-attendance.use-case';
import { inject, singleton } from 'tsyringe';
import { Router, Request, Response } from 'express';
import {
  registerAttendanceBodySchema,
  attendanceParamsSchema,
  attendanceIdParamsSchema,
  updateAttendanceBodySchema,
} from '../../../http-body-validator/attendance.validator';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

@singleton()
export class RegisterStudentAttendanceController {
  public router: Router;

  constructor(
    @inject(RegisterStudentAttendanceUseCase)
    private readonly registerAttendance: RegisterStudentAttendanceUseCase,
    @inject(FindAttendanceUseCase)
    private readonly findAttendance: FindAttendanceUseCase,
    @inject(UpdateAttendanceUseCase)
    private readonly updateAttendance: UpdateAttendanceUseCase,
    @inject(DeleteAttendanceUseCase)
    private readonly deleteAttendance: DeleteAttendanceUseCase,
  ) {
    this.router = Router();
    this.router.post(
      '/lessons/:lessonId/attendances',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      (req, res) => this.handle(req, res),
    );

    this.router.get(
      '/attendances/:attendanceId',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      (req, res) => this.handleFind(req, res),
    );

    this.router.put(
      '/attendances/:attendanceId',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      (req, res) => this.handleUpdate(req, res),
    );

    this.router.delete(
      '/attendances/:attendanceId',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN']),
      (req, res) => this.handleDelete(req, res),
    );
  }

  private async handle(req: Request, res: Response) {
    const paramsValidation = attendanceParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params (lessonId)' });
    }
    const { lessonId } = paramsValidation.data;

    const bodyValidation = registerAttendanceBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).send({
        message: 'Invalid request body',
        errors: bodyValidation.error.format(),
      });
    }
    const { studentId, presenceStatus } = bodyValidation.data;

    const result = await this.registerAttendance.execute({
      lessonId,
      studentId,
      presenceStatus,
    });

    if (result.isFail()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) {
        return res.status(404).send({ message: error.message });
      }
      if (error instanceof CannotCreateError) {
        return res.status(500).send({ message: 'Failed to save attendance' });
      }
      return res.status(500).send({ message: 'Internal server error' });
    }

    return res.status(201).send(result.value);
  }

  private async handleFind(req: Request, res: Response) {
    const paramsValidation = attendanceIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params (attendanceId)' });
    }
    const { attendanceId } = paramsValidation.data;

    const result = await this.findAttendance.execute({ attendanceId });
    if (result.isFail()) {
      const err = result.value;
      if (err instanceof ResourceNotFoundError)
        return res.status(404).send({ message: err.message });
      return res.status(500).send({ message: 'Internal server error' });
    }

    return res.status(200).send(result.value);
  }

  private async handleUpdate(req: Request, res: Response) {
    const paramsValidation = attendanceIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params (attendanceId)' });
    }
    const { attendanceId } = paramsValidation.data;

    const bodyValidation = updateAttendanceBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .send({ message: 'Invalid request body', errors: bodyValidation.error.format() });
    }
    const { presenceStatus } = bodyValidation.data;

    const result = await this.updateAttendance.execute({ attendanceId, presenceStatus });
    if (result.isFail()) {
      const err = result.value;
      if (err instanceof ResourceNotFoundError)
        return res.status(404).send({ message: err.message });
      return res.status(500).send({ message: 'Failed to update attendance' });
    }
    return res.status(200).send(result.value);
  }

  private async handleDelete(req: Request, res: Response) {
    const paramsValidation = attendanceIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params (attendanceId)' });
    }
    const { attendanceId } = paramsValidation.data;

    const result = await this.deleteAttendance.execute({ attendanceId });
    if (result.isFail()) {
      const err = result.value;
      if (err instanceof ResourceNotFoundError)
        return res.status(404).send({ message: err.message });
      return res.status(500).send({ message: 'Failed to delete attendance' });
    }
    return res.status(200).send(result.value);
  }
}
