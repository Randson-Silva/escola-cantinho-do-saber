import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateClassUseCase } from 'apps/server/src/domain/application/use-cases/class/update-class.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const updateClassParamSchema = z.object({
  classId: z.string(),
});

type UpdateParamSchema = z.infer<typeof updateClassParamSchema>;

const updateClassBodySchema = z.object({
  name: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  duration: z.string().nullable(),

  teacherId: z.string(),
});

type UpdateClassBodySchema = z.infer<typeof updateClassBodySchema>;

const bodyValidationPipe = validateBody(updateClassBodySchema);

@injectable()
export class UpdateClassController {
  public readonly router: Router;

  constructor(private readonly updateClassUseCase: UpdateClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/class/:classId',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateClassBodySchema;

    const { duration, endTime, name, startTime, teacherId } = body;

    const { classId } = req.params;

    const result = await this.updateClassUseCase.execute({
      classId,
      duration,
      endTime,
      name,
      startTime,
      teacherId,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotUpdateError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { classId: retrievedId } = result.value;

    return res.status(200).json({ classId: retrievedId });
  }
}
