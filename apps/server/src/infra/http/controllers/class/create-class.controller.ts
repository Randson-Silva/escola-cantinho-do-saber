import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateClassUseCase } from 'apps/server/src/domain/application/use-cases/class/create-class.use-case';

const createClassBodySchema = z.object({
  name: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  duration: z.string().nullable(),

  teacherId: z.string(),
});

type CreateClassBodySchema = z.infer<typeof createClassBodySchema>;

const bodyValidationPipe = validateBody(createClassBodySchema);

@injectable()
export class CreateClassController {
  public readonly router: Router;

  constructor(private readonly createClassUseCase: CreateClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/class',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateClassBodySchema;

    const { duration, endTime, name, startTime, teacherId } = body;

    const result = await this.createClassUseCase.execute({
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
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { classId } = result.value;

    return res.status(200).json({ classId });
  }
}
